"""
Reproducible Benchmark Evaluation Pipeline for SANGAM.
Compares SANGAM Dynamic Weighting against:
1. ECMWF IFS (Single NWP)
2. ECMWF AIFS (Single AI)
3. NOAA GFS (Single NWP)
4. Simple Multi-Model Average (Equal Weights)
5. Static Climatological Historical Weights

Strictly uses a Temporal Holdout:
- TRAIN: Earlier period (Days 0-59)
- VALIDATION: Intermediate period (Days 60-89)
- TEST: Most recent period (Days 90-119)
No random temporal shuffling.

Evaluates:
- Rainfall (mm)
- Temperature (°C)
- Wind Speed (km/h)

Metrics:
- MAE, RMSE, Bias, Pearson Correlation, and Sample Count.
"""

import sys
import json
import math
from pathlib import Path
from datetime import datetime, timezone
import numpy as np
import pandas as pd

# Add repo root to path
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from backend.app.models.schemas import SingleModelForecast, WeatherRegimeClassification
from backend.app.blending.weighting_engine import weighting_engine
from backend.app.blending.blender import blender

def generate_temporal_evaluation_dataset(n_days: int = 120, samples_per_day: int = 10, seed: int = 2026):
    """
    Generates a structured temporal evaluation sequence simulating weather across 120 consecutive days.
    Physics-consistent variations in rain, temperature, and wind.
    Explicitly labeled as 'synthetic_proof_of_concept'.
    """
    np.random.seed(seed)
    records = []
    
    lead_times = [12, 24, 48, 72, 96, 120]
    
    for day in range(n_days):
        # Seasonal progression over 120 days (e.g. pre-monsoon into active monsoon)
        season_phase = (day / n_days) * math.pi
        base_rain_prob = 0.20 + 0.45 * math.sin(season_phase)
        
        for sample in range(samples_per_day):
            lt = int(np.random.choice(lead_times))
            is_rainy_day = np.random.rand() < base_rain_prob
            
            # Ground truth reference state
            if is_rainy_day:
                true_rain = float(np.random.exponential(scale=18.0) + 5.0)
                true_temp = float(27.0 + 2.5 * np.random.randn() - 0.05 * true_rain)
                true_wind = float(18.0 + 6.0 * np.random.randn() + 0.15 * true_rain)
            else:
                true_rain = 0.0 if np.random.rand() < 0.7 else float(np.random.uniform(0.1, 2.5))
                true_temp = float(34.0 + 3.5 * np.random.randn())
                true_wind = float(10.0 + 3.0 * np.random.randn())

            # Current atmospheric state observations at forecast issuance
            obs_humidity = min(98.0, max(20.0, 75.0 + 15.0 * np.random.randn() if is_rainy_day else 45.0 + 10.0 * np.random.randn()))
            obs_pressure = float(1005.0 - 0.15 * true_rain + 2.0 * np.random.randn())
            obs_temp = float(true_temp + 1.2 * np.random.randn())

            # Lead time error growth scale
            lead_growth = 1.0 + (lt / 96.0) * 0.45

            # Model 1: ECMWF IFS (High synoptic skill, conservative on extreme peaks)
            ifs_rain = max(0.0, float(true_rain * (0.93 + 0.12 * np.random.randn()) - (0.5 if true_rain > 30 else 0)))
            ifs_temp = float(true_temp + 1.1 * lead_growth * np.random.randn())
            ifs_wind = max(1.0, float(true_wind + 2.2 * lead_growth * np.random.randn()))

            # Model 2: ECMWF AIFS (AI model, lower dissipation at extended lead >48h, sharp gradients)
            ai_decay = 1.0 + (lt / 120.0) * 0.25 # lower error growth at long range
            aifs_rain = max(0.0, float(true_rain * (0.96 + 0.10 * np.random.randn())))
            aifs_temp = float(true_temp + 1.0 * ai_decay * np.random.randn())
            aifs_wind = max(1.0, float(true_wind + 2.0 * ai_decay * np.random.randn()))

            # Model 3: NOAA GFS (Convective responsiveness, known positive rain bias in monsoons)
            gfs_bias = 2.5 if is_rainy_day else 0.2
            gfs_rain = max(0.0, float(true_rain * (1.08 + 0.18 * np.random.randn()) + gfs_bias))
            gfs_temp = float(true_temp + 1.35 * lead_growth * np.random.randn())
            gfs_wind = max(1.0, float(true_wind + 2.6 * lead_growth * np.random.randn()))

            # Model 4: Global Ensemble Mean (variance filtering, dampened variance)
            ens_rain = max(0.0, float((ifs_rain + aifs_rain + gfs_rain) / 3.0 + 0.5 * np.random.randn()))
            ens_temp = float((ifs_temp + aifs_temp + gfs_temp) / 3.0)
            ens_wind = float((ifs_wind + aifs_wind + gfs_wind) / 3.0)

            records.append({
                "day_index": day,
                "lead_time": lt,
                "obs_humidity": obs_humidity,
                "obs_pressure": obs_pressure,
                "obs_temp": obs_temp,
                "true_rain": true_rain,
                "true_temp": true_temp,
                "true_wind": true_wind,
                "ifs_rain": ifs_rain,
                "ifs_temp": ifs_temp,
                "ifs_wind": ifs_wind,
                "aifs_rain": aifs_rain,
                "aifs_temp": aifs_temp,
                "aifs_wind": aifs_wind,
                "gfs_rain": gfs_rain,
                "gfs_temp": gfs_temp,
                "gfs_wind": gfs_wind,
                "ens_rain": ens_rain,
                "ens_temp": ens_temp,
                "ens_wind": ens_wind
            })

    return pd.DataFrame(records)

def compute_metrics(predicted: np.ndarray, truth: np.ndarray):
    mae = float(np.mean(np.abs(predicted - truth)))
    rmse = float(math.sqrt(np.mean((predicted - truth) ** 2)))
    bias = float(np.mean(predicted - truth))
    if np.std(predicted) > 1e-5 and np.std(truth) > 1e-5:
        corr = float(np.corrcoef(predicted, truth)[0, 1])
    else:
        corr = 1.0 if mae < 1e-3 else 0.0
    return {
        "mae": round(mae, 3),
        "rmse": round(rmse, 3),
        "bias": round(bias, 3),
        "correlation": round(corr, 3)
    }

def run_evaluation():
    print("=" * 70)
    print(" SANGAM REPRODUCIBLE BENCHMARK EVALUATION")
    print(" Strict Temporal Holdout: Train (0-59), Val (60-89), Test (90-119)")
    print(" Dataset Type: Synthetic Proof-of-Concept")
    print("=" * 70)

    df = generate_temporal_evaluation_dataset(n_days=120, samples_per_day=10, seed=2026)
    
    # Temporal Split:
    # Train: Days 0 - 59 (50%)
    # Val:   Days 60 - 89 (25%)
    # Test:  Days 90 - 119 (25%)
    train_df = df[df["day_index"] < 60]
    val_df = df[(df["day_index"] >= 60) & (df["day_index"] < 90)]
    test_df = df[df["day_index"] >= 90]

    print(f"Total Samples: {len(df)}")
    print(f"  Train samples (Days 0-59):     {len(train_df)}")
    print(f"  Validation samples (Days 60-89): {len(val_df)}")
    print(f"  Test samples (Days 90-119):    {len(test_df)} (HELD-OUT EVALUATION)")

    # Static historical weights (fixed baseline)
    static_weights = {"ecmwf_ifs": 0.35, "ecmwf_aifs": 0.25, "noaa_gfs": 0.25, "ensemble": 0.15}

    # Evaluate on TEST set row by row
    results_by_var = {"rainfall": {}, "temperature": {}, "wind_speed": {}}
    
    methods = ["ECMWF IFS", "ECMWF AIFS", "NOAA GFS", "Simple Average", "Static Historical", "SANGAM Dynamic"]
    for m in methods:
        results_by_var["rainfall"][m] = {"preds": [], "truth": []}
        results_by_var["temperature"][m] = {"preds": [], "truth": []}
        results_by_var["wind_speed"][m] = {"preds": [], "truth": []}

    dummy_regime = WeatherRegimeClassification(
        regime="normal", confidence=0.8, description="Standard seasonal regime", key_factors=[]
    )

    for _, row in test_df.iterrows():
        # Build SingleModelForecast objects
        f_ifs = SingleModelForecast(
            model_id="ecmwf_ifs", model_name="ECMWF IFS", model_type="NWP", source="IFS",
            lead_time_hours=int(row["lead_time"]), temperature=row["ifs_temp"],
            precipitation=row["ifs_rain"], wind_speed=row["ifs_wind"]
        )
        f_aifs = SingleModelForecast(
            model_id="ecmwf_aifs", model_name="ECMWF AIFS", model_type="AI", source="AIFS",
            lead_time_hours=int(row["lead_time"]), temperature=row["aifs_temp"],
            precipitation=row["aifs_rain"], wind_speed=row["aifs_wind"]
        )
        f_gfs = SingleModelForecast(
            model_id="noaa_gfs", model_name="NOAA GFS", model_type="NWP", source="GFS",
            lead_time_hours=int(row["lead_time"]), temperature=row["gfs_temp"],
            precipitation=row["gfs_rain"], wind_speed=row["gfs_wind"]
        )
        f_ens = SingleModelForecast(
            model_id="ensemble", model_name="HGEFS", model_type="ENSEMBLE", source="ENS",
            lead_time_hours=int(row["lead_time"]), temperature=row["ens_temp"],
            precipitation=row["ens_rain"], wind_speed=row["ens_wind"]
        )
        forecasts = [f_ifs, f_aifs, f_gfs, f_ens]

        # Feature vector for weighting engine
        precip_spread = max(f.precipitation for f in forecasts) - min(f.precipitation for f in forecasts)
        features = {
            "lead_time_hours": float(row["lead_time"]),
            "atm_humidity": float(row["obs_humidity"]),
            "atm_temperature": float(row["obs_temp"]),
            "atm_pressure": float(row["obs_pressure"]),
            "precip_spread_max_min": float(precip_spread),
            "disagreement_index": min(1.0, precip_spread / 15.0)
        }

        # Calculate SANGAM dynamic weights
        weights, _ = weighting_engine.calculate_weights(
            features=features, forecasts=forecasts, regime=dummy_regime, variable="rainfall"
        )
        w_map = weights.weights

        # SANGAM Blend
        sangam_rain = sum(f.precipitation * w_map.get(f.model_id, 0.25) for f in forecasts)
        sangam_temp = sum(f.temperature * w_map.get(f.model_id, 0.25) for f in forecasts)
        sangam_wind = sum(f.wind_speed * w_map.get(f.model_id, 0.25) for f in forecasts)

        # Simple Average
        simple_rain = sum(f.precipitation for f in forecasts) / len(forecasts)
        simple_temp = sum(f.temperature for f in forecasts) / len(forecasts)
        simple_wind = sum(f.wind_speed for f in forecasts) / len(forecasts)

        # Static Weights
        static_rain = sum(f.precipitation * static_weights[f.model_id] for f in forecasts)
        static_temp = sum(f.temperature * static_weights[f.model_id] for f in forecasts)
        static_wind = sum(f.wind_speed * static_weights[f.model_id] for f in forecasts)

        # Record
        mappings = [
            ("ECMWF IFS", row["ifs_rain"], row["ifs_temp"], row["ifs_wind"]),
            ("ECMWF AIFS", row["aifs_rain"], row["aifs_temp"], row["aifs_wind"]),
            ("NOAA GFS", row["gfs_rain"], row["gfs_temp"], row["gfs_wind"]),
            ("Simple Average", simple_rain, simple_temp, simple_wind),
            ("Static Historical", static_rain, static_temp, static_wind),
            ("SANGAM Dynamic", sangam_rain, sangam_temp, sangam_wind)
        ]

        for name, p_r, p_t, p_w in mappings:
            results_by_var["rainfall"][name]["preds"].append(p_r)
            results_by_var["rainfall"][name]["truth"].append(row["true_rain"])
            results_by_var["temperature"][name]["preds"].append(p_t)
            results_by_var["temperature"][name]["truth"].append(row["true_temp"])
            results_by_var["wind_speed"][name]["preds"].append(p_w)
            results_by_var["wind_speed"][name]["truth"].append(row["true_wind"])

    # Compute final metrics on test set
    final_output = {
        "dataset_type": "synthetic_proof_of_concept",
        "scientific_disclaimer": "Metrics are evaluated on a synthetic temporal holdout benchmark for algorithmic verification. Not an operational field verification.",
        "evaluation_timestamp": datetime.now(timezone.utc).isoformat(),
        "train_samples": len(train_df),
        "validation_samples": len(val_df),
        "test_samples": len(test_df),
        "temporal_split": {
            "train_period": "Days 0-59",
            "val_period": "Days 60-89",
            "test_period": "Days 90-119 (Held-Out)"
        },
        "metrics": {},
        "comparison_summary": {}
    }

    print("\n" + "=" * 70)
    print(" HELD-OUT TEST EVALUATION RESULTS:")
    print("=" * 70)

    for var_name in ["rainfall", "temperature", "wind_speed"]:
        final_output["metrics"][var_name] = {}
        print(f"\n--- Variable: {var_name.upper()} ---")
        print(f"{'Method':<20} | {'RMSE':<8} | {'MAE':<8} | {'Bias':<8} | {'Corr':<6}")
        print("-" * 58)

        rmses = {}
        for m in methods:
            p = np.array(results_by_var[var_name][m]["preds"])
            t = np.array(results_by_var[var_name][m]["truth"])
            m_res = compute_metrics(p, t)
            final_output["metrics"][var_name][m] = m_res
            rmses[m] = m_res["rmse"]
            print(f"{m:<20} | {m_res['rmse']:<8.3f} | {m_res['mae']:<8.3f} | {m_res['bias']:<8.3f} | {m_res['correlation']:<6.3f}")

        # True measured reduction of SANGAM vs best single and simple avg
        single_models = ["ECMWF IFS", "ECMWF AIFS", "NOAA GFS"]
        best_single_name = min(single_models, key=lambda x: rmses[x])
        best_single_rmse = rmses[best_single_name]
        sangam_rmse = rmses["SANGAM Dynamic"]
        simple_rmse = rmses["Simple Average"]

        red_vs_best_single = round(((best_single_rmse - sangam_rmse) / best_single_rmse) * 100.0, 2)
        red_vs_simple_avg = round(((simple_rmse - sangam_rmse) / simple_rmse) * 100.0, 2)

        final_output["comparison_summary"][var_name] = {
            "best_single_model": best_single_name,
            "best_single_rmse": best_single_rmse,
            "sangam_rmse": sangam_rmse,
            "simple_average_rmse": simple_rmse,
            "sangam_rmse_reduction_vs_best_single_pct": red_vs_best_single,
            "sangam_rmse_reduction_vs_simple_average_pct": red_vs_simple_avg
        }
        print(f" -> Measured RMSE Reduction vs Best Single ({best_single_name}): {red_vs_best_single}%")
        print(f" -> Measured RMSE Reduction vs Simple Average: {red_vs_simple_avg}%")

    # Save to data/processed/evaluation_results.json and backend/data/processed/evaluation_results.json
    out_paths = [
        REPO_ROOT / "data" / "processed" / "evaluation_results.json",
        REPO_ROOT / "backend" / "data" / "processed" / "evaluation_results.json"
    ]
    for p in out_paths:
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(final_output, f, indent=2)
        print(f"Saved evaluation results to: {p}")

    return final_output

if __name__ == "__main__":
    run_evaluation()
