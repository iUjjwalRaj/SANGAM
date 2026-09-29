# SANGAM: Hybrid AI–NWP Multi-Model Forecast Blending System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TypeScript-61DAFB.svg)](https://react.dev/)
[![ML Engine](https://img.shields.io/badge/Engine-LightGBM%20%7C%20Gradient%20Attribution-ff69b4.svg)](https://lightgbm.readthedocs.io/)
[![License](https://img.shields.io/badge/License-Proprietary%20%7C%20Source--Available-blue.svg)](LICENSE)

---

## What is SANGAM?

**SANGAM** is a weather forecast blending system that combines predictions from multiple numerical weather prediction models and AI-based weather systems to produce a unified forecast for India.

The word *Sangam* (संगम) means "confluence" — the meeting point where different rivers join together to form a stronger, unified stream. In the same way, SANGAM brings together forecasts from different meteorological centers into one unified consensus.

---

## The Simple Idea

Imagine you are planning an outdoor event tomorrow, and you ask three different weather experts what the weather will be:

- **Expert 1** says: *"It will be 32°C with light rain."*
- **Expert 2** says: *"It will be 35°C with no rain at all."*
- **Expert 3** says: *"It will be 30°C with heavy rain."*

Who should you trust?

If you always listen to just one expert, you will suffer whenever that expert has a blind spot. If you take a simple, unthinking average of all three, you give equal weight to someone who might be completely wrong for your specific city or season.

Instead, a seasoned meteorologist would say:
> *"Expert 1 is usually reliable along the coast, Expert 2 is strong on hot plain afternoons, and Expert 3 tends to predict too much rain in the mountains. Looking at today's wind and humidity, Expert 1 and Expert 2 deserve the most trust right now."*

**That is exactly what SANGAM does automatically.**

SANGAM does not build a weather model from scratch. Instead, it acts as an intelligent coordinator. It looks at the current weather conditions, the location, the forecast horizon, and past model behaviors, and dynamically decides **how much trust (weight)** to give each model before blending them together.

---

## Why Does SANGAM Exist?

Every major weather model in the world has unique strengths and known weaknesses:

1. **Global Physics Models (NWP)**: Systems like ECMWF (Europe), NOAA GFS (United States), and DWD ICON (Germany) run complex atmospheric physics equations on national supercomputers. They are physically rigorous, but can have persistent regional biases (for example, overestimating heat over northern Indian plains or misplacing tropical monsoon rainbands).
2. **AI Weather Models**: Modern deep learning weather models (such as ECMWF AIFS) make global predictions rapidly and excel at tracking large atmospheric waves, but can smooth out sharp local storms.
3. **Regional National Models**: High-resolution systems like India's indigenous **Bharat Forecast System (BharatFS)** are tailored specifically for tropical orography (the Western Ghats and the Himalayas), but require seamless integration with global models.

No single model wins everywhere, in every season, or at every lead time. SANGAM solves this multi-model puzzle by dynamically blending them based on verified skill.

---

## How Does It Work?

SANGAM operates through a canonical conceptual pipeline:

```
Current Atmospheric State
        ↓
Multi-Model Ingestion
        ↓
Feature Extraction
        ↓
AI Weighting Engine
        ↓
Dynamic Weights
        ↓
Forecast Blender
        ↓
Uncertainty & Extremes
        ↓
SANGAM Synthesis
```

1. **Current Atmospheric State**: SANGAM inspects current thermodynamic conditions (temperature, humidity, surface pressure, and wind).
2. **Multi-Model Ingestion**: It gathers candidate forecasts from leading supercomputer and AI systems (ECMWF IFS, NOAA GFS, DWD ICON, ECMWF AIFS proxy, BharatFS).
3. **Feature Extraction**: It calculates where models agree and diverge (spread, disagreement, and weather regime).
4. **AI Weighting Engine**: Machine learning decision trees (LightGBM) and meteorological domain rules evaluate model reliability for the current scenario.
5. **Dynamic Weights**: It determines exact percentage weights for each model (enforcing non-negative weights that sum to 100% via simplex normalization).
6. **Forecast Blender**: It blends candidate forecasts using the dynamic weights ($F = \sum w_i F_i$).
7. **Uncertainty & Extremes**: It computes plausible error bounds and checks operational thresholds for heavy rain, heatwaves, squalls, or storms.
8. **SANGAM Synthesis**: It delivers a clear, unified forecast with transparent reasoning for why each model was trusted.

---

## What Does the AI Actually Do?

Many people hear "AI weather" and assume an AI model is guessing tomorrow's clouds from satellite images. In SANGAM, the AI plays a very specific, disciplined role: **Dynamic Reliability Weighting**.

1. **Calculates Agreement and Spread**: It checks whether models agree or disagree. When models strongly diverge (for example, one says 0 mm of rain and another says 40 mm), uncertainty is high.
2. **Predicts Trust Weights**: Using a gradient-boosted decision tree system (LightGBM), SANGAM estimates a percentage weight for each model ($w_1, w_2, \dots, w_n$).
3. **Enforces Physical Safety Rules**:
   - Every weight must be positive or zero ($w_i \ge 0$). No model can have negative influence.
   - The weights must always add up to exactly 100% ($\sum w_i = 1.0$).
4. **Calculates the Consensus**: The final forecast is the weighted sum of the inputs:
   $$\text{Blended Forecast} = (w_{\text{IFS}} \times F_{\text{IFS}}) + (w_{\text{GFS}} \times F_{\text{GFS}}) + (w_{\text{ICON}} \times F_{\text{ICON}})$$
5. **Provides Reasoning**: The system explains *why* it assigned those weights (for example: *"ECMWF IFS allocated 52% weight due to superior boundary layer wind accuracy during active coastal monsoon"*).

---

## What Can SANGAM Forecast?

SANGAM currently supports five core surface atmospheric variables:

| Variable | Unit | What It Measures |
|:---|:---|:---|
| **Temperature** | °C | Air temperature at 2 meters above ground |
| **Precipitation** | mm | Expected rainfall volume |
| **Wind Speed** | km/h | Horizontal surface wind speed at 10 meters |
| **Relative Humidity** | % | Moisture saturation of the air |
| **Surface Pressure** | hPa | Atmospheric barometric pressure |

In addition to point values, SANGAM calculates **uncertainty intervals** (lower and upper plausible bounds) and flags **extreme event alerts** (heavy rainfall, heatwaves, squalls, and cyclonic winds) based on established meteorological thresholds.

---

## Models and Forecast Systems

SANGAM distinguishes between models tested in our historical benchmark and models supported in our live operational architecture:

### 1. Historically Validated Benchmark Suite (Track B)
These three global physical models were rigorously evaluated on archived operational runs against independent reanalysis:
- **ECMWF IFS** (European Centre for Medium-Range Weather Forecasts): 0.25° high-resolution physics model.
- **NOAA GFS** (National Oceanic and Atmospheric Administration, USA): 0.25° global forecast system.
- **DWD ICON** (Deutscher Wetterdienst, Germany): 0.25° icosahedral non-hydrostatic model.

### 2. Operational & Extended Systems (Track A)
These models are integrated into SANGAM's live software architecture:
- **ECMWF AIFS**: ECMWF's experimental artificial intelligence forecast model, integrated as an operational proxy to demonstrate hybrid AI–NWP blending.
- **Bharat Forecast System (BharatFS)**: India's indigenous 6 km global numerical weather prediction system, developed by IITM Pune, IMD, and NCMRWF under the Ministry of Earth Sciences (MoES). Its live schema is supported architecturally in SANGAM, while its historical quantitative benchmark validation is pending public archive access.

---

## What Did We Test?

We evaluated SANGAM against an authoritative historical benchmark with strict zero-leakage temporal separation:

- **Benchmark Period**: 41-day historical window during active summer monsoon conditions (**June 15 to July 25, 2024**).
- **Five Representative Indian Locations**:
  1. **Delhi** (Northern Indo-Gangetic Plains)
  2. **Guwahati** (Northeastern Brahmaputra River Basin)
  3. **Mumbai** (Western Arabian Sea Coastal Monsoon)
  4. **Chennai** (Southeastern Bay of Bengal Coast)
  5. **Leh** (High-Altitude Trans-Himalayan Cold Arid Zone)
- **Forecast Horizons**: 24 hours ($T+24\text{h}$), 48 hours ($T+48\text{h}$), and 72 hours ($T+72\text{h}$).
- **Held-Out Test Set**: 1,800 out-of-sample forecast instances evaluated against the independent ECMWF ERA5 atmospheric reanalysis reference.

---

## Results

On the held-out out-of-sample test split, SANGAM achieved the following verified Mean Absolute Error (MAE) performance compared to the standard unweighted multi-model average:

| Weather Variable | Simple Multi-Model Average | SANGAM Hybrid Blend | Improvement vs Simple Average | 95% Bootstrap Confidence Interval | Conclusion |
|:---|:---|:---|:---|:---|:---|
| **Temperature (2m)** | 1.212 °C | **1.026 °C** | **+15.35%** | [+12.72%, +17.90%] | Statistically supported |
| **Precipitation** | 2.334 mm | **2.315 mm** | **+0.80%** | [-0.37%, +3.10%] | **Statistically inconclusive** |
| **Wind Speed (10m)** | 3.838 km/h | **3.344 km/h** | **+12.86%** | [+10.83%, +14.98%] | Statistically supported |

*Notice: Our benchmark uses Mean Absolute Error (MAE), not Root Mean Square Error (RMSE). Confidence intervals were calculated using 1,000 non-parametric bootstrap resamples.*

---

## Important Limitations

Science demands honesty. SANGAM is a working prototype with clear boundaries:

1. **Sample Scope**: The benchmark covers a 41-day summer monsoon window across five locations. It does **not** claim validation across all of India or for all four seasons (such as winter fog or pre-monsoon heatwaves).
2. **Precipitation is Inconclusive**: For bulk rainfall, SANGAM showed a slight +0.80% error reduction, but the 95% confidence interval spans across zero. In monsoon rainfall, intermittent tropical downpours mean all models frequently miss or hit simultaneously. We make **no claim** of statistically significant bulk rainfall improvement.
3. **Extreme Weather Sample Sizes**:
   - Extreme rain ($\ge 20$ mm/h) occurred only $N = 6$ times in the test set — too few to draw scientific conclusions.
   - Severe heatwaves ($\ge 40$ °C) occurred $N = 0$ times during this monsoon window — impossible to evaluate historically.
4. **Mountain Terrain (Leh)**: In Leh's complex mountain topography, SANGAM's temperature error increased relative to simple averaging, showing that coarse 28 km reanalysis reference grids struggle with steep Himalayan valley inversions.
5. **Reference Reanalysis**: ECMWF ERA5 is an atmospheric computer reanalysis reference product, **not** direct surface weather station observations.
6. **BharatFS Validation Status**: While BharatFS is fully integrated into the codebase architecture, historical validation is pending because a public, reproducible 2024 archive was not available.

---

## Technology Stack

SANGAM is built with modern, reliable technologies and open components:

- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS design system (supporting Light, Dark, and OLED themes).
- **Interactive Mapping**: Leaflet with MapLibre GL vector basemaps (OpenFreeMap / OpenMapTiles) and high-resolution India boundary overlay aligned with Survey of India representation.
- **Backend API**: Python 3.11+, FastAPI, Pydantic v2 schemas, asynchronous streaming.
- **AI & Blending Engine**: LightGBM gradient-boosted decision trees, NumPy, SciPy bootstrap confidence estimation.

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ with `pip`

### 1. Clone the Repository
```bash
git clone https://github.com/iUjjwalRaj/SANGAM.git
cd SANGAM
```

### 2. Start the Backend API
```bash
python3 -m pip install -r backend/requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API health check will be live at: [http://localhost:8000/api/health](http://localhost:8000/api/health)*

### 3. Start the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*Dashboard will be live at: [http://localhost:5173](http://localhost:5173)*

### 4. Run Test Suite
```bash
# Backend unit & integration test suite (18 tests)
python3 -m pytest backend/tests -v

# Frontend type verification & production build
cd frontend && npx tsc -b --noEmit && npm run build
```

---

## Documentation Map

For deeper technical detail, SANGAM provides comprehensive documentation across the repository:

- 📖 **[DETAILED_EXPLANATION.md](DETAILED_EXPLANATION.md)** — The complete, comprehensive engineering and scientific manual covering end-to-end data flow, mathematical formulations, training mechanics, validation protocols, and subsystem architectures.
- ⚙️ **[backend/README.md](backend/README.md)** — FastAPI application, API endpoints, weighting engine, and test suite.
- 💻 **[frontend/README.md](frontend/README.md)** — React 19 UI, MapLibre vector mapping, theme engine, and route structure.
- 🧠 **[models/README.md](models/README.md)** — LightGBM booster artifacts, input features, and inference guidelines.
- 📊 **[scripts/README.md](scripts/README.md)** — Data acquisition, model training, evaluation, and benchmark scripts.
- 🗄️ **[data/README.md](data/README.md)** — Historical datasets, processed benchmark outputs, and schema specs.
- 📚 **[docs/README.md](docs/README.md)** — Index of specialized scientific audit and architecture reports.

---

## License & Attribution

- **Project License**: SANGAM is proprietary software. Source-available for evaluation, examination, and authorized review under [LICENSE](LICENSE). Copyright © 2026 Ujjwal Raj. All rights reserved.
- **Map Vector Tiles**: Basemap provided by [OpenFreeMap](https://openfreemap.org/) under the MIT License, derived from [OpenMapTiles](https://openmaptiles.org/) (CC-BY 4.0) and [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL).
- **India Boundary Overlay**: India boundary overlay aligned with the Survey of India representation (DataMeet, CC0; see [boundary provenance](frontend/public/data/BOUNDARIES.md)).
- **Meteorological Data**: Forecasts and reanalysis referenced from ECMWF, NOAA, DWD, and IMD via open access and the Open-Meteo API.
