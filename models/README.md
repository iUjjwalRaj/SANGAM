# Models Subsystem

## Purpose
The `models/` directory contains the serialized machine learning artifacts for SANGAM. These files represent pre-trained **LightGBM** (Light Gradient Boosting Machine) decision tree regressors that predict optimal model reliability weights ($w_i$) from atmospheric state features and forecast horizons.

---

## Where It Fits in SANGAM

```
        [ Historical Training Data ]
       (`data/processed/aligned_*.csv`)
                     │
                     ▼
          [ scripts/train_blender.py ]
                     │
                     ▼
             ┌───────────────┐
             │    models/    │  <-- Serialized Booster Text Files
             └───────┬───────┘
                     │ Loaded at startup
                     ▼
       ┌───────────────────────────┐
       │   `AIWeightingEngine`     │
       │ (backend/app/blending/)   │
       └─────────────┬─────────────┘
                     │ Predicts raw w_i
                     ▼
       [ Hybrid Blending Pipeline ]
```

---

## Contents

| File Name | Target Model | Target Variable / Horizon | Purpose |
|:---|:---|:---|:---|
| `target_w_ifs_lgb.txt` | ECMWF IFS | General / Multivariable | Predicts primary reliability weight for ECMWF IFS based on atmospheric context. |
| `target_w_ifs_temperature_lgb.txt` | ECMWF IFS | 2m Temperature | Dedicated regressor for thermal weighting of ECMWF IFS. |
| `target_w_ifs_precipitation_lgb.txt` | ECMWF IFS | Rainfall | Dedicated regressor for precipitation weighting of ECMWF IFS. |
| `target_w_ifs_wind_speed_lgb.txt` | ECMWF IFS | 10m Wind Speed | Dedicated regressor for surface wind speed weighting of ECMWF IFS. |
| `target_w_gfs_lgb.txt` | NOAA GFS | General / Multivariable | Predicts primary reliability weight for NOAA GFS. |
| `target_w_gfs_temperature_lgb.txt` | NOAA GFS | 2m Temperature | Dedicated regressor for thermal weighting of NOAA GFS (captures plains heating bias). |
| `target_w_gfs_precipitation_lgb.txt` | NOAA GFS | Rainfall | Dedicated regressor for precipitation weighting of NOAA GFS. |
| `target_w_gfs_wind_speed_lgb.txt` | NOAA GFS | 10m Wind Speed | Dedicated regressor for surface wind speed weighting of NOAA GFS. |
| `target_w_icon_lgb.txt` | DWD ICON | General / Multivariable | Predicts primary reliability weight for DWD ICON. |
| `target_w_icon_temperature_lgb.txt` | DWD ICON | 2m Temperature | Dedicated regressor for thermal weighting of DWD ICON. |
| `target_w_icon_precipitation_lgb.txt` | DWD ICON | Rainfall | Dedicated regressor for precipitation weighting of DWD ICON. |
| `target_w_icon_wind_speed_lgb.txt` | DWD ICON | 10m Wind Speed | Dedicated regressor for surface wind speed weighting of DWD ICON. |
| `target_w_aifs_lgb.txt` | ECMWF AIFS (Proxy) | Multivariable | Baseline weighting booster for AIFS operational proxy architecture. |
| `target_w_ens_lgb.txt` | Multi-Model Ensemble | Multivariable | Baseline weighting booster for ensemble variance dampening. |

---

## Inputs
During inference, each booster expects an input feature vector $X(T_0)$ representing conditions at forecast issue time:

### Standard 9-Feature Vector
1. `lead_time_hours`: Forecast horizon in hours (e.g. 24, 48, 72).
2. `latitude`: Target station latitude in degrees north.
3. `longitude`: Target station longitude in degrees east.
4. `forecast_ifs`: Candidate forecast value from ECMWF IFS.
5. `forecast_gfs`: Candidate forecast value from NOAA GFS.
6. `forecast_icon`: Candidate forecast value from DWD ICON.
7. `spread_max_min`: Maximum minus minimum candidate prediction difference.
8. `std_dev`: Sample standard deviation across candidate predictions.
9. `mean_val`: Unweighted arithmetic mean across candidate predictions.

### Auxiliary 5-Feature Vector (Thermodynamic Fallback)
1. `lead_time_hours`: Forecast horizon in hours.
2. `atm_humidity`: Current relative humidity (%).
3. `atm_temperature`: Current air temperature (°C).
4. `atm_pressure`: Current barometric surface pressure (hPa).
5. `precip_spread`: Inter-model precipitation spread (mm).

---

## Outputs
- **Raw Scalar Reliability Score**: A continuous floating-point prediction representing the estimated inverse-error weight $\tilde{w}_i$ for that model.
- These scalar predictions are normalized in `AIWeightingEngine` to sum to $1.0$ across active models.

---

## Dependencies
- **Runtime**: `lightgbm` (Python package) via `lgb.Booster(model_file=str(path))`.
- **Format**: Standard human-readable LightGBM tree text format containing split features, split thresholds, and leaf values.

---

## Used By
- **Backend Weighting Engine** (`backend/app/blending/weighting_engine.py`): Loaded at server startup to execute low-latency (<5ms) inference on incoming forecast requests.

---

## How to Train / Retrain

The boosters are trained using `scripts/train_blender.py`:

```bash
# Train LightGBM regressors on aligned historical training split
python3 scripts/train_blender.py --data data/processed/aligned_train_data.csv --output-dir models/
```

*Note: Training enforces strict temporal walk-forward separation. The test partition (July 21–25, 2024) is strictly held out and never used during model training.*

---

## Important Design Decisions
1. **LightGBM over Deep Neural Networks**: Tabular meteorological features with strong boundary thresholds (e.g. rainfall triggers, temperature regimes) are known to be modeled more reliably and with lower latency by gradient-boosted trees than deep neural networks.
2. **Text Serialization**: Storing models in LightGBM's native text format (`.txt`) ensures cross-platform portability without pickle serialization security vulnerabilities.
3. **Graceful Fallback**: If a model file is missing or corrupted, `AIWeightingEngine` automatically logs a warning and falls back to equal-weight baseline attribution without crashing the API.

---

## Important Constraints
- **Zero Reference Leakage**: The boosters must never be trained on features containing reanalysis targets ($y_{\text{ref}}$) from the valid time.
- **Model Invariance**: Retraining must never overwrite the frozen benchmark weights without rigorous purged walk-forward validation.

---

## Related Documentation
- 📖 [Root README](../README.md)
- 📖 [Detailed Technical Explanation](../DETAILED_EXPLANATION.md)
- ⚙️ [Backend Subsystem README](../backend/README.md)
- 📊 [Scripts Subsystem README](../scripts/README.md)
