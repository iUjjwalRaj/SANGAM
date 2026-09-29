# SANGAM: Hybrid AI–NWP Multi-Model Forecast Blending System

[![MoES](https://img.shields.io/badge/MoES-NCMRWF-blue.svg)](https://www.ncmrwf.gov.in/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TypeScript-61DAFB.svg)](https://react.dev/)
[![ML](https://img.shields.io/badge/Engine-LightGBM%20%7C%20Gradient%20Attribution-ff69b4.svg)](https://lightgbm.readthedocs.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Smart India Hackathon — Problem Statement 26081**  
> **Organization:** Ministry of Earth Sciences (MoES)  
> **Department:** National Centre for Medium Range Weather Forecasting (NCMRWF)  
> **Theme:** Disaster Management  

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

## 5. Offline Demo Mode Guarantee
In hackathon and operational presentation setups where external internet connectivity may be restricted:
- SANGAM features a zero-dependency **Deterministic Simulation Engine** (`DemoProvider`).
- If external weather APIs timeout or are unreachable, the system automatically falls back to deterministic simulation.
- **Strict Data Provenance:** All outputs explicitly declare `LIVE` vs `DEMO/SIMULATED`.

---

## 6. Verification & Scientific Benchmarking
Evaluated using a reproducible temporal holdout benchmark script (`scripts/evaluate_blending.py`):
- **Proof-of-Concept Evaluation:** On a temporal holdout test set (Days 90–119), SANGAM dynamic ML weighting demonstrated a **6.7% RMSE reduction over simple averaging** and **36.3% RMSE reduction over the best single model** on simulated monsoonal precipitation cases.
- **Scientific Caveat:** The current benchmark is evaluated on a synthetic temporal holdout dataset designed for algorithmic validation. Real-world operational skill figures require training and verification on multi-year archived IMD AWS station observations and NCMRWF/ERA5 reanalysis grids.
