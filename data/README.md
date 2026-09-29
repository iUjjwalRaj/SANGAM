# Data Subsystem

## Purpose
The `data/` directory stores raw ingested forecast archives, independent atmospheric reanalysis reference products, aligned evaluation datasets, and generated benchmark verification artifacts for SANGAM.

---

## Where It Fits in SANGAM

```
     [ Open-Meteo & ERA5 Archives ]
                   │
                   ▼ (scripts/fetch_historical_validation_data.py)
         ┌───────────────────┐
         │ data/historical/  │  <-- Raw Ingested Forecasts & Reanalysis
         └─────────┬─────────┘
                   │
                   ▼ (Temporal Alignment & Walk-Forward Partitioning)
         ┌───────────────────┐
         │  data/processed/  │  <-- Aligned Datasets & Evaluation Results
         └─────────┬─────────┘
                   │
                   ├───────────────────────────────┐
                   ▼                               ▼
       [ scripts/train_blender.py ]    [ backend/app/verification/ ]
       (Trains LightGBM Boosters)      (Serves /api/verification &
                                        /api/lead-time-analysis)
```

---

## Contents

### 1. `data/historical/` (Raw Ingestion Archives)
Stores raw meteorological data retrieved for the 41-day summer monsoon evaluation window (June 15 – July 25, 2024) across the 5 benchmark cities (Delhi, Guwahati, Mumbai, Chennai, Leh):

| File Name | Format | Purpose |
|:---|:---|:---|
| `forecast_archive.csv` / `.json` | CSV / JSON | Raw operational candidate forecasts for ECMWF IFS, NOAA GFS, and DWD ICON across $T+24\text{h}$, $T+48\text{h}$, and $T+72\text{h}$. |
| `reference_archive.csv` / `.json` | CSV / JSON | Independent ECMWF ERA5 Atmospheric Reanalysis targets (`REFERENCE_REANALYSIS`) at valid times ($T_v$). |
| `joined_validation_dataset.csv` / `.json` | CSV / JSON | Spatiotemporally aligned records matching candidate forecasts with realized reanalysis reference targets (14,760 total rows). |

### 2. `data/processed/` (Processed Benchmarks & Analysis)
Stores verified validation outputs, bootstrap analysis records, and publication diagnostic plots:

| File Name | Format | Purpose |
|:---|:---|:---|
| `real_evaluation_results.json` | JSON | **Authoritative Benchmark File**: Metrics for the held-out test split ($N = 1,800$), including Best Single Model, Simple Average, SANGAM Hybrid, and 1,000-sample bootstrap confidence intervals. |
| `lead_time_analysis.json` | JSON | Comprehensive performance decomposition across horizons ($T+24, T+48, T+72$), 5 regions, and meteorological regimes. |
| `evaluation_results.json` | JSON | Synthetic benchmark results for offline algorithmic testing. |
| `plots/` | PNG Images | Diagnostic plots: error distributions, regional comparisons, and lead-time weight dynamics. |

---

## Inputs
- **External Atmospheric APIs**: Open-Meteo Historical Archive API providing operational NWP model outputs and ECMWF ERA5 reanalysis fields.

---

## Outputs
- **Training Sets**: Filtered historical training partitions consumed by `scripts/train_blender.py`.
- **API Payloads**: Pre-computed verification metrics served by the backend at `/api/verification` and `/api/lead-time-analysis`.

---

## Dependencies
- **Subsystems**: Populated by `scripts/fetch_historical_validation_data.py` and consumed by `backend/app/verification/verifier.py`.

---

## Used By
- **Backend API**: For serving transparent verification metrics to the frontend dashboard.
- **Evaluation Scripts**: For auditing error distributions and generating publication plots.

---

## Data Schema Overview

Each record in `joined_validation_dataset.csv` follows this structure:

```
timestamp,location_id,latitude,longitude,lead_time_hours,
forecast_ecmwf_ifs_temp,forecast_noaa_gfs_temp,forecast_dwd_icon_temp,
forecast_ecmwf_ifs_precip,forecast_noaa_gfs_precip,forecast_dwd_icon_precip,
forecast_ecmwf_ifs_wind,forecast_noaa_gfs_wind,forecast_dwd_icon_wind,
reference_temp,reference_precip,reference_wind
```

---

## Important Constraints
- **ERA5 is Reference Reanalysis, NOT Ground Truth**: The reference values are derived from gridded atmospheric reanalysis (0.25° grid, ~28 km resolution) and must never be described as in-situ weather station observations.
- **Do Not Manually Edit Results**: Benchmark files (`real_evaluation_results.json`, `lead_time_analysis.json`) are immutable single sources of truth. They must only be generated via the reproducible evaluation scripts.

---

## Related Documentation
- 📖 [Root README](../README.md)
- 📖 [Detailed Technical Explanation](../DETAILED_EXPLANATION.md)
- 📊 [Scripts Subsystem README](../scripts/README.md)
- 📑 [Real Data Validation Protocol](../docs/real_data_validation.md)
- 📑 [Lead-Time Analysis Report](../docs/lead_time_analysis.md)
