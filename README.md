# SANGAM: Hybrid AI–NWP Multi-Model Forecast Blending System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TypeScript-61DAFB.svg)](https://react.dev/)
[![ML](https://img.shields.io/badge/Engine-LightGBM%20%7C%20Gradient%20Attribution-ff69b4.svg)](https://lightgbm.readthedocs.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SANGAM** is an operational-grade multi-model forecast blending system that dynamically optimizes consensus weights across physics-based numerical weather prediction (NWP) models and AI weather foundation models over the Indian subcontinent.

---

## 1. Problem Context & Innovation
Operational numerical weather prediction (NWP) models (e.g., ECMWF IFS, NOAA GFS) and state-of-the-art AI weather foundation models (e.g., ECMWF AIFS) each exhibit distinctive strengths and error characteristics:
- Traditional NWP models excel at conservation physics, boundary thermodynamics, and short-range assimilation ($0-24\text{h}$).
- Deep learning AI models maintain exceptional wave-pattern preservation at extended horizons ($72-120\text{h}$) with vastly lower inference times.
- Ensemble prediction systems provide crucial dispersion metrics to quantify chaotic atmospheric bifurcation.

**The SANGAM Innovation:**  
Instead of training a model from scratch to predict weather, **SANGAM dynamically learns how much to trust each existing model** based on:
1. Current atmospheric state (temperature, humidity, surface pressure, wind, cloud cover)
2. Forecast lead time ($6\text{h}$ to $120\text{h}+$)
3. Active weather regime (Heavy Convective Rainfall, Heatwave, Cyclonic Storm, High Wind, Dry Spell)
4. Inter-model disagreement and ensemble spread
5. Historical model verification skill across topographies and seasons

---

## 2. Key Architecture & Pipeline
```
Existing Weather Models (ECMWF IFS, ECMWF AIFS, NOAA GFS, Ensemble)
                        ↓
            Data Ingestion & Normalization
                        ↓
            Feature & Regime Engineering
                        ↓
         AI Weighting Engine (Softmax Simplex: Σ w_i = 1, w_i ≥ 0)
                        ↓
        Blended Consensus Forecast (F_blended = Σ w_i × F_i)
                        ↓
       Post-Processing & Uncertainty Quantification (± margin, score)
                        ↓
         Extreme Weather Engine (IMD/NCMRWF Standard Alerts)
                        ↓
        FastAPI REST API  ↔  Interactive Scientific Dashboard
```

---

## 3. Tech Stack
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, NumPy, Pandas, Scikit-learn, LightGBM, HTTPX, PyYAML.
- **Frontend:** React 19, TypeScript, Vite, Leaflet Interactive Maps, Lucide Icons, Vanilla CSS scientific theme with glassmorphism.
- **Storage & Fallback:** Parquet & JSON deterministic offline archive for robust presentation environments.

---

## 4. Quick Start Guide

### Backend Setup
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Run automated test suite
python -m pytest backend/tests -v

# 3. Generate offline demo archive
python scripts/generate_demo_data.py

# 4. (Optional) Run model training pipeline
python scripts/train_blender.py

# 5. Launch FastAPI development server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Dashboard will be live at: [http://localhost:5173](http://localhost:5173)

---

## 5. Offline Demo & Air-Gapped Mode
In air-gapped or presentation environments where external internet connectivity may be restricted:
- SANGAM features a zero-dependency **Deterministic Simulation Engine** (`DemoProvider`).
- If external weather APIs timeout or are unreachable, the system automatically falls back to deterministic simulation.
- **Strict Data Provenance:** All outputs explicitly declare `LIVE` vs `DEMO/SIMULATED`.

---

## 6. Verification & Scientific Benchmarking
Evaluated using a strict out-of-sample purged walk-forward historical benchmark protocol (`scripts/evaluate_real_holdout.py`):
- **Benchmark Scope:** 41-day historical sample across five representative Indian locations during summer monsoon conditions (June 15 to July 25, 2024).
- **Locations Evaluated:** Delhi (Plains), Guwahati (Subtropical), Mumbai (Western Coast), Chennai (Southern Coast), Leh (Trans-Himalayan).
- **Out-of-Sample Results ($N = 1,800$ held-out test instances vs ERA5 reanalysis reference):**
  - **Temperature (2m):** +15.35% improvement in MAE, SANGAM MAE = 1.026 °C
  - **Precipitation:** +0.80% improvement in MAE, SANGAM MAE = 2.315 mm, statistically inconclusive
  - **Wind Speed (10m):** +12.86% improvement in MAE, SANGAM MAE = 3.344 km/h
- **Reference Standard:** ECMWF ERA5 Atmospheric Reanalysis is utilized strictly as an independent reanalysis reference, not direct surface observation ground truth.
- **Operational Registry vs Validation:** Operational track supports real-time multi-model ingestion (including ECMWF AIFS and BharatFS architecture). Track B retrospective validation strictly audits models with verified historical operational archives (IFS, GFS, ICON).
