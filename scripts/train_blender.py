#!/usr/bin/env python3
"""
SANGAM AI Weighting Engine Training Pipeline.

Trains LightGBM regressors to predict state-conditioned multi-model reliability weights.
Supports:
1. Real Historical Dataset (--dataset real): Trained strictly on the real TRAIN partition
   (June 15 -> July 8, 2024) and tuned on the purged VALIDATION partition (July 12 -> July 17, 2024).
   Zero leakage enforced via 72-hour purge buffers.
2. Synthetic Corpus (--dataset synthetic): Track A offline simulation benchmark.
"""

import sys
import json
import argparse
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn.metrics import mean_squared_error, mean_absolute_error

MODELS = ["ifs", "gfs", "icon"]
VARIABLES = ["temperature", "precipitation", "wind_speed"]

def generate_synthetic_training_corpus(n_samples: int = 1200):
    """Synthetic dataset generator for Track A offline benchmark."""
    np.random.seed(42)
    records = []
    
    for i in range(n_samples):
        day = i // 10
        lead_time = int(np.random.choice([12, 24, 48, 72, 96, 120]))
        humidity = np.random.uniform(30.0, 95.0)
        temp_obs = np.random.uniform(15.0, 42.0)
        pressure = np.random.uniform(995.0, 1018.0)
        true_rain = np.random.exponential(scale=12.0) if humidity > 70 else np.random.exponential(scale=1.5)
        
        pred_ifs = max(0.0, true_rain * (0.92 + 0.1 * np.random.randn()) + (lead_time / 100.0) * np.random.randn())
        pred_aifs = max(0.0, true_rain * (0.97 + 0.08 * np.random.randn()))
        pred_gfs = max(0.0, true_rain * (1.10 + 0.15 * np.random.randn()))
        pred_ens = (pred_ifs + pred_aifs + pred_gfs) / 3.0 + np.random.randn() * 0.5
        
        err_ifs = (pred_ifs - true_rain) ** 2
        err_aifs = (pred_aifs - true_rain) ** 2
        err_gfs = (pred_gfs - true_rain) ** 2
        err_ens = (pred_ens - true_rain) ** 2
        
        inv_errs = np.array([1.0 / (err_ifs + 1.0), 1.0 / (err_aifs + 1.0), 1.0 / (err_gfs + 1.0), 1.0 / (err_ens + 1.0)])
        target_weights = inv_errs / np.sum(inv_errs)
        
        records.append({
            "day_index": day,
            "lead_time": lead_time,
            "humidity": humidity,
            "temperature": temp_obs,
            "pressure": pressure,
            "precip_spread": max([pred_ifs, pred_aifs, pred_gfs, pred_ens]) - min([pred_ifs, pred_aifs, pred_gfs, pred_ens]),
            "true_rain": true_rain,
            "target_w_ifs": target_weights[0],
            "target_w_aifs": target_weights[1],
            "target_w_gfs": target_weights[2],
            "target_w_ens": target_weights[3]
        })
        
    return pd.DataFrame(records)

def train_on_synthetic():
    print("=" * 70)
    print(" SANGAM AI Weighting Engine — Synthetic Track A Training")
    print("=" * 70)
    df = generate_synthetic_training_corpus()
    split_day = int(df["day_index"].max() * 0.75)
    train_df = df[df["day_index"] <= split_day]
    test_df = df[df["day_index"] > split_day]
    
    features = ["lead_time", "humidity", "temperature", "pressure", "precip_spread"]
    targets = ["target_w_ifs", "target_w_aifs", "target_w_gfs", "target_w_ens"]
    
    models = {}
    for target in targets:
        lgb_train = lgb.Dataset(train_df[features], train_df[target])
        lgb_val = lgb.Dataset(test_df[features], test_df[target], reference=lgb_train)
        params = {
            "objective": "regression",
            "metric": "l2",
            "learning_rate": 0.05,
            "num_leaves": 15,
            "verbose": -1,
            "seed": 42
        }
        gbm = lgb.train(params, lgb_train, num_boost_round=80, valid_sets=[lgb_train, lgb_val])
        models[target] = gbm

    out_dir = PROJECT_ROOT / "models"
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, gbm in models.items():
        gbm.save_model(str(out_dir / f"{name}_lgb.txt"))
    print(f"Exported synthetic models to {out_dir}/")

def extract_features(r: dict, var: str):
    """Extract features available strictly at forecast issue time T0."""
    vals = [float(r[f"{m}_{var}"]) for m in MODELS]
    spread = max(vals) - min(vals)
    std_dev = float(np.std(vals))
    mean_val = float(np.mean(vals))
    return [
        float(r["lead_time"]),
        float(r["latitude"]),
        float(r["longitude"]),
        vals[0],  # IFS forecast
        vals[1],  # GFS forecast
        vals[2],  # ICON forecast
        float(spread),
        float(std_dev),
        float(mean_val)
    ]

def train_on_real_data():
    print("=" * 70)
    print(" SANGAM AI Weighting Engine — Real Historical Track B Training")
    print(" Reference Dataset: ERA5 Reanalysis (REFERENCE_REANALYSIS)")
    print(" Operational NWP Models: ECMWF IFS, NOAA GFS, DWD ICON")
    print("=" * 70)

    dataset_path = PROJECT_ROOT / "data" / "historical" / "joined_validation_dataset.json"
    if not dataset_path.exists():
        print(f"Error: {dataset_path} not found. Run fetch_historical_validation_data.py first.")
        sys.exit(1)

    with open(dataset_path, "r") as f:
        records = json.load(f)

    # Chronological sort
    records.sort(key=lambda r: (r["valid_time"], r["location"], r["lead_time"]))

    # Strict Purged Walk-Forward Split (72h buffer)
    train_end = "2024-07-08T23:00"
    val_start = "2024-07-12T00:00"
    val_end   = "2024-07-17T23:00"
    test_start= "2024-07-21T00:00"

    train_set = [r for r in records if r["valid_time"] <= train_end]
    val_set   = [r for r in records if val_start <= r["valid_time"] <= val_end]
    test_set  = [r for r in records if test_start <= r["valid_time"]]

    print(f"\nPurged Temporal Split Summary:")
    print(f"  TRAIN:          {len(train_set):,} rows ({min(r['valid_time'] for r in train_set)} to {max(r['valid_time'] for r in train_set)})")
    print(f"    Issue Range:  {min(r['forecast_issue_time'] for r in train_set)} to {max(r['forecast_issue_time'] for r in train_set)}")
    print(f"  PURGE BUFFER 1: 72 hours (July 9 00:00 to July 11 23:00) — Zero overlap")
    print(f"  VALIDATION:     {len(val_set):,} rows ({min(r['valid_time'] for r in val_set)} to {max(r['valid_time'] for r in val_set)})")
    print(f"    Issue Range:  {min(r['forecast_issue_time'] for r in val_set)} to {max(r['forecast_issue_time'] for r in val_set)}")
    print(f"  PURGE BUFFER 2: 72 hours (July 18 00:00 to July 20 23:00) — Zero overlap")
    print(f"  TEST (HELD-OUT):{len(test_set):,} rows ({min(r['valid_time'] for r in test_set)} to {max(r['valid_time'] for r in test_set)})")
    print(f"    Issue Range:  {min(r['forecast_issue_time'] for r in test_set)} to {max(r['forecast_issue_time'] for r in test_set)}")

    # Target Construction Verification Sample
    print("\n--- TARGET CONSTRUCTION VERIFICATION (TRAIN ROW 0) ---")
    s0 = train_set[0]
    feat_sample = extract_features(s0, "temperature")
    errs_s0 = [abs(s0[f"{m}_temperature"] - s0["reference_temperature"]) for m in MODELS]
    inv_s0 = [1.0 / (e**2 + 0.1) for e in errs_s0]
    tw_s0 = [round(x / sum(inv_s0), 4) for x in inv_s0]
    print(f"  Location:       {s0['location']}")
    print(f"  Issue Time:     {s0['forecast_issue_time']} (T0)")
    print(f"  Valid Time:     {s0['valid_time']} (Tv)")
    print(f"  Lead Time:      {s0['lead_time']} hours")
    print(f"  Input Features: {feat_sample}")
    print(f"  NWP Forecasts:  IFS={s0['ifs_temperature']}°C, GFS={s0['gfs_temperature']}°C, ICON={s0['icon_temperature']}°C")
    print(f"  ERA5 Reference: {s0['reference_temperature']}°C (Reanalysis value at Tv)")
    print(f"  Realized Errors:IFS={errs_s0[0]:.2f}, GFS={errs_s0[1]:.2f}, ICON={errs_s0[2]:.2f}")
    print(f"  Target Weights: IFS={tw_s0[0]}, GFS={tw_s0[1]}, ICON={tw_s0[2]}")
    print("  Leakage Check:  ERA5 reference value is strictly excluded from Input Features. Target used only as loss objective.")

    out_dir = PROJECT_ROOT / "models"
    out_dir.mkdir(parents=True, exist_ok=True)

    trained_models = {}

    for var in VARIABLES:
        print(f"\n>>> Training Real LightGBM Regressors for Variable: {var.upper()}")
        X_train = np.array([extract_features(r, var) for r in train_set])
        X_val   = np.array([extract_features(r, var) for r in val_set])

        targets_train = {m: [] for m in MODELS}
        for r in train_set:
            y_ref = r[f"reference_{var}"]
            errs = [abs(r[f"{m}_{var}"] - y_ref) for m in MODELS]
            inv = [1.0 / (e**2 + 0.1) for e in errs]
            s_inv = sum(inv)
            for idx, m in enumerate(MODELS):
                targets_train[m].append(inv[idx] / s_inv)

        targets_val = {m: [] for m in MODELS}
        for r in val_set:
            y_ref = r[f"reference_{var}"]
            errs = [abs(r[f"{m}_{var}"] - y_ref) for m in MODELS]
            inv = [1.0 / (e**2 + 0.1) for e in errs]
            s_inv = sum(inv)
            for idx, m in enumerate(MODELS):
                targets_val[m].append(inv[idx] / s_inv)

        trained_models[var] = {}
        for m in MODELS:
            ds_train = lgb.Dataset(X_train, label=np.array(targets_train[m]))
            ds_val   = lgb.Dataset(X_val, label=np.array(targets_val[m]), reference=ds_train)

            params = {
                "objective": "regression",
                "metric": "l2",
                "learning_rate": 0.05,
                "num_leaves": 15,
                "min_data_in_leaf": 20,
                "verbosity": -1,
                "seed": 42
            }

            booster = lgb.train(
                params,
                ds_train,
                valid_sets=[ds_val],
                num_boost_round=100,
                callbacks=[lgb.early_stopping(stopping_rounds=15, verbose=False)]
            )
            trained_models[var][m] = booster

            val_preds = booster.predict(X_val)
            val_mae = mean_absolute_error(targets_val[m], val_preds)
            val_rmse = np.sqrt(mean_squared_error(targets_val[m], val_preds))
            print(f"  Model {m.upper()} ({var}): Best Iteration={booster.best_iteration}, Val MAE={val_mae:.4f}, Val RMSE={val_rmse:.4f}")

            # Save specific variable model
            booster.save_model(str(out_dir / f"target_w_{m}_{var}_lgb.txt"))

        # For rainfall/primary variable, save default target_w_{m}_lgb.txt for live inference
        if var == "precipitation":
            for m in MODELS:
                trained_models[var][m].save_model(str(out_dir / f"target_w_{m}_lgb.txt"))

    print(f"\nAll models successfully trained strictly on REAL TRAIN and exported to {out_dir}/")

def main():
    parser = argparse.ArgumentParser(description="Train SANGAM AI Weighting Engine")
    parser.add_argument("--dataset", choices=["real", "synthetic"], default="real", help="Dataset track to train on")
    args = parser.parse_args()

    if args.dataset == "real":
        train_on_real_data()
    else:
        train_on_synthetic()

if __name__ == "__main__":
    main()
