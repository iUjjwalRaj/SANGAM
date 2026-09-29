# Scripts Subsystem

## Purpose
The `scripts/` directory contains scientific and engineering automation pipelines for SANGAM. This includes utilities for historical data ingestion, purged temporal dataset alignment, LightGBM model training, out-of-sample benchmark evaluation, lead-time and weather-regime analysis, and synthetic demo fixture generation.

---

## Where It Fits in SANGAM

```
        [ External Data APIs ] (ECMWF, GFS, ICON, ERA5 via Open-Meteo)
                  │
                  ▼
   `scripts/fetch_historical_validation_data.py`
                  │
                  ▼
          [ Raw Datasets ] (`data/historical/`)
                  │
                  ▼
       `scripts/train_blender.py`
                  │
                  ▼
        [ Trained Models ] (`models/*.txt`)
                  │
                  ├───────────────────────────────┐
                  ▼                               ▼
  `scripts/evaluate_real_holdout.py`    `scripts/analyze_lead_time_and_regimes.py`
                  │                               │
                  ▼                               ▼
       [ Benchmark Reports ]           [ Lead-Time & Regime JSON ]
  (`data/processed/real_evaluation_results.json`)
```

---

## Contents

| Script Name | Purpose | Execution Context |
|:---|:---|:---|
| `fetch_historical_validation_data.py` | Fetches historical operational NWP runs (IFS, GFS, ICON) and ERA5 reanalysis targets across the 5 benchmark locations (June 15 – July 25, 2024). | Data Ingestion |
| `train_blender.py` | Fits LightGBM regressors on the purged training partition (June 15 – July 8, 2024) and serializes booster models to `models/`. | Machine Learning Training |
| `evaluate_real_holdout.py` | **Authoritative Benchmark Runner**: Evaluates SANGAM against candidate models on the held-out test split ($N = 1,800$, July 21–25, 2024), computing MAE and 1,000 bootstrap confidence intervals. | Scientific Verification |
| `analyze_lead_time_and_regimes.py` | Performs fine-grained decompositions across horizons ($T+24\text{h}, T+48\text{h}, T+72\text{h}$), regions (Delhi, Guwahati, Mumbai, Chennai, Leh), and weather regimes. Produces `lead_time_analysis.json` and diagnostic plots. | Scientific Analysis |
| `evaluate_real_data.py` | Earlier full-sample evaluation utility provided for cross-referencing pre-purged baseline comparisons. | Diagnostics |
| `evaluate_blending.py` | Algorithmic sanity checker evaluating synthetic holdout data for offline test suites. | Testing |
| `generate_demo_data.py` | Generates deterministic simulation arrays used by `DemoProvider` during air-gapped or offline execution. | Offline Infrastructure |

---

## Inputs
- **Remote APIs**: Open-Meteo Historical Weather API (`archive-api.open-meteo.com`) and ERA5 Reanalysis endpoint.
- **Local Datasets**: Raw and aligned CSV archives stored in `../data/historical/` and `../data/processed/`.
- **Booster Models**: Pre-trained LightGBM boosters from `../models/`.

---

## Outputs
- **Model Files**: Serialized LightGBM boosters (`../models/*.txt`).
- **Benchmark Reports**: `../data/processed/real_evaluation_results.json` and `../data/processed/lead_time_analysis.json`.
- **Diagnostic Visualizations**: Publication-quality charts saved to `../data/processed/plots/` and `../frontend/public/plots/`.

---

## Dependencies
- **Python Libraries**: `numpy`, `pandas`, `scipy`, `lightgbm`, `requests`, `matplotlib` (for diagnostic plotting).
- **Subsystems**: Reuses backend domain logic from `../backend/app/blending/`.

---

## Used By
- **Scientific Researchers & Evaluators**: To reproduce out-of-sample benchmark figures independently.
- **Backend API**: The generated JSON evaluation artifacts are served directly by `/api/verification` and `/api/lead-time-analysis`.

---

## How to Run & Reproduce

```bash
# 1. Fetch raw historical validation data (June 15 – July 25, 2024)
python3 scripts/fetch_historical_validation_data.py

# 2. Train LightGBM weighting boosters on the purged training partition
python3 scripts/train_blender.py

# 3. Execute authoritative out-of-sample held-out benchmark evaluation
python3 scripts/evaluate_real_holdout.py

# 4. Generate lead-time, regional, and weather-regime breakdown artifacts
python3 scripts/analyze_lead_time_and_regimes.py
```

---

## Important Design Decisions
1. **Purged Walk-Forward Temporal Separation**:
   To prevent lookahead bias when evaluating multi-step forecasts up to 72 hours, scripts enforce 72-hour purge buffers between Train (June 15–July 8), Validation (July 12–17), and Test (July 21–25) splits.
2. **Bootstrap Confidence Intervals**:
   Evaluations execute 1,000 non-parametric bootstrap resamples to test whether percentage error improvements over simple averaging are statistically distinguishable from zero.
3. **Regime Guardrails**:
   Any meteorological regime with sample size $N < 30$ in the test set (such as Extreme Rain $\ge 20$ mm with $N=6$, or Severe Heatwave $\ge 40$ °C with $N=0$) is explicitly flagged as `INSUFFICIENT SAMPLE SIZE` rather than drawing false conclusions.

---

## Important Constraints
- **Do Not Retrain on Test Data**: The test split (July 21–25, 2024) must strictly remain out-of-sample. No hyperparameter tuning or training is permitted on this partition.
- **Metric Consistency**: Authoritative benchmark metrics must be reported as **Mean Absolute Error (MAE)**, not RMSE.

---

## Related Documentation
- 📖 [Root README](../README.md)
- 📖 [Detailed Technical Explanation](../DETAILED_EXPLANATION.md)
- 📑 [Scientific Results Document](../docs/SANGAM_RESULTS.md)
- 📑 [Lead-Time & Regime Report](../docs/lead_time_analysis.md)
- 🗄️ [Data Subsystem README](../data/README.md)
