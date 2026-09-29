# SANGAM Data Pipeline & Schema Normalization

## Overview
The data pipeline standardizes disparate numerical weather prediction outputs, deep-learning emulators, observation networks, and reanalysis data into a single schema.

## Ingestion Architecture

```
[External Sources]
   ├── Open-Meteo Multi-Model Gateway (Live ECMWF IFS 0.25°, NOAA GFS 0.25°, ICON)
   ├── Automatic Weather Station (AWS) surface observations
   └── Deterministic Simulation Engine (Offline Demo Fallback)
          │
          ▼
   [ForecastProviderManager]
          │
          ├── Data Mode: Auto (Default), Live, Demo
          ├── Provable Source Tag: "LIVE", "DEMO/SIMULATED", "HISTORICAL"
          ▼
   [Common Forecast Schema]
```

## Common Forecast Schema
Every model prediction is transformed to:
- `model_id`: Unique identifier (`ecmwf_ifs`, `ecmwf_aifs`, `noaa_gfs`, `ensemble`)
- `model_name`: Human-readable title
- `model_type`: Categorical (`NWP`, `AI`, `ENSEMBLE`)
- `lead_time_hours`: Forecast horizon ($1$ to $168$ hours)
- `temperature`: Celsius (°C)
- `precipitation`: Millimeters accumulated / rate (mm)
- `wind_speed`: Kilometers per hour (km/h)
- `humidity`: Relative humidity (%)
- `pressure`: Surface barometric pressure (hPa)
- `wind_direction`: Degrees ($0^\circ$ to $360^\circ$)

## Feature Extraction Pipeline
The feature engineer computes:
1. **Atmospheric Baseline:** In-situ temperature, relative humidity, barometric pressure, wind velocity, and precipitation.
2. **Multi-Model Disagreement:**
   - Standard deviation: $\sigma_{\text{precip}}$, $\sigma_{\text{temp}}$, $\sigma_{\text{wind}}$
   - Range spread: $\max(F_i) - \min(F_i)$
   - Normalized Disagreement Index in $[0.0, 1.0]$ using logistic scaling.
3. **Spatio-Temporal Context:**
   - Geodesic coordinates $(\phi, \lambda)$, elevation ($m$).
   - Diurnal solar cycle indicator (day vs night).
   - Seasonality (Monsoon, Post-monsoon, Winter, Pre-monsoon).
4. **Historical Skill Retrieval:**
   - Rolling verification scores (MAE, RMSE, Bias) mapped against NCMRWF operational benchmarks.
