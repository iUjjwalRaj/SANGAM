# SANGAM — Detailed Technical Explanation & Architecture Manual

**Document Version**: 1.0.0 (Release Audit Hardened)  
**System**: SANGAM — Hybrid AI–NWP Multi-Model Forecast Blending System  
**Document Classification**: Comprehensive Technical Manual  
**License**: Proprietary (Source-Available / All Rights Reserved) — Copyright © 2026 Ujjwal Raj. All rights reserved.  

---

## Table of Contents
1. [Purpose and Scope](#1-purpose-and-scope)
2. [Conceptual Overview](#2-conceptual-overview)
3. [Why Multi-Model Forecast Blending?](#3-why-multi-model-forecast-blending)
4. [System Architecture](#4-system-architecture)
5. [End-to-End Data Flow](#5-end-to-end-data-flow)
6. [Forecast Systems](#6-forecast-systems)
7. [Forecast Normalization](#7-forecast-normalization)
8. [Atmospheric Context](#8-atmospheric-context)
9. [Dynamic Weighting Formulation](#9-dynamic-weighting-formulation)
10. [Machine Learning Weighting Engine](#10-machine-learning-weighting-engine)
11. [Hybrid Weighting Architecture](#11-hybrid-weighting-architecture)
12. [Forecast Blending Pipeline](#12-forecast-blending-pipeline)
13. [Uncertainty Quantification](#13-uncertainty-quantification)
14. [Extreme Weather Detection](#14-extreme-weather-detection)
15. [Explainability Framework](#15-explainability-framework)
16. [Historical Validation Methodology](#16-historical-validation-methodology)
17. [Benchmark Results](#17-benchmark-results)
18. [Bootstrap Statistical Analysis](#18-bootstrap-statistical-analysis)
19. [Lead-Time Analysis](#19-lead-time-analysis)
20. [Regional Analysis](#20-regional-analysis)
21. [Weather-Regime Analysis](#21-weather-regime-analysis)
22. [Weight Dynamic Stability](#22-weight-dynamic-stability)
23. [Indian NWP: BharatFS Integration](#23-indian-nwp-bharatfs-integration)
24. [Frontend Architecture](#24-frontend-architecture)
25. [Backend Architecture](#25-backend-architecture)
26. [Cartographic & Mapping Architecture](#26-cartographic--mapping-architecture)
27. [Data Sources and Provenance](#27-data-sources-and-provenance)
28. [Operational Modes: Live vs Demo vs Historical](#28-operational-modes-live-vs-demo-vs-historical)
29. [REST API Specification](#29-rest-api-specification)
30. [Repository Structure](#30-repository-structure)
31. [Reproducibility Guide](#31-reproducibility-guide)
32. [Verification & Testing](#32-verification--testing)
33. [Limitations & Disclosures](#33-limitations--disclosures)
34. [Future Work](#34-future-work)

---

## 1. Purpose and Scope

SANGAM is an operational-grade multi-model forecast blending system designed to combine numerical weather prediction (NWP) models and AI weather foundation models over the Indian subcontinent.

The software addresses a fundamental operational problem: no single weather model performs best across all Indian climatic zones, weather regimes, and forecast horizons. Rather than attempting to train a competing global atmospheric dynamical core from scratch, SANGAM dynamically evaluates real-time atmospheric features, computes model reliability weights on a mathematical simplex ($w_i \ge 0$, $\sum w_i = 1$), and generates a consensus forecast with quantified uncertainty and automated extreme weather advisories.

### Formal Scope Boundaries
- **Primary Domain**: The Indian subcontinent (latitude 6° N to 38° N, longitude 68° E to 98° E).
- **Temporal Horizon**: Short- to medium-range forecast horizons ($T+0\text{h}$ to $T+120\text{h}$, with benchmark validation covering $T+24\text{h}$, $T+48\text{h}$, and $T+72\text{h}$).
- **Target Variables**: Surface air temperature at 2 m (°C), total precipitation (mm), horizontal surface wind speed at 10 m (km/h), relative humidity (%), and mean sea-level barometric pressure (hPa).
- **Benchmark Sample**: 41-day historical sample across five representative Indian locations during summer monsoon conditions (June 15 to July 25, 2024).

---

## 2. Conceptual Overview

Atmospheric modeling centers across Europe (ECMWF), North America (NOAA), Germany (DWD), and India (NCMRWF/IMD) operate sophisticated numerical simulation suites on petascale supercomputers. In parallel, data-driven machine learning models (such as ECMWF AIFS) forecast global atmospheric states through neural operators.

In operational meteorology, forecasters routinely consult an "ensemble of opportunities" or multi-model ensemble (MME). Historically, forecasters either take a simple unweighted arithmetic average or manually apply mental adjustments based on institutional experience.

SANGAM automates and mathematically formalizes this process:
1. It ingests candidate model predictions.
2. It constructs an atmospheric context vector representing location, season, horizon, and inter-model spread.
3. It uses a trained gradient-boosted decision tree ensemble (LightGBM) to infer optimal model reliability weights.
4. It applies bounded meteorological domain heuristics to prevent overfitting.
5. It projects the resulting logit distribution onto the standard probability simplex via numerically stable softmax normalization.
6. It synthesizes a single consensus forecast accompanied by confidence intervals and transparent attribution cards.

---

## 3. Why Multi-Model Forecast Blending?

The physical justification for dynamic multi-model forecast blending rests on atmospheric physics and error independence:

- **Error Decorrelation**: Different NWP dynamical cores use distinct numerical approximations (spectral transforms in ECMWF IFS vs finite-volume cubed-sphere grids in NOAA GFS vs triangular icosahedral grids in DWD ICON). Their physical parameterizations for sub-grid processes (convection, cloud microphysics, radiation, boundary-layer turbulence) diverge substantially. Because their systematic errors are partially uncorrelated, an optimal linear combination reduces variance below that of any individual model.
- **Regime-Dependent Model Superiority**:
  - In strong boundary-layer winds and coastal setups, ECMWF IFS routinely demonstrates superior skill due to its 137 vertical levels.
  - Over northern continental plains in summer, NOAA GFS often suffers from an afternoon dry/warm convective bias.
  - During complex mesoscale rain episodes, multi-model spread indicates high atmospheric chaos where individual deterministic solutions are unreliable.
- **Avoiding Blind Averages**: Simple arithmetic averaging ($w_i = 1/K$) treats every model identically. When one model suffers an acute breakdown or known bias, simple averaging contaminates the forecast. Dynamic weighting detects the situation and down-weights the biased candidate.

---

## 4. System Architecture

SANGAM is organized into modular layers with clean separation of concerns:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│  React 19 Dashboard (Vite + TypeScript + Vanilla CSS Design System)    │
│  ├── Overview Page          ├── Model Intelligence Page                │
│  ├── Forecast Blending Page ├── Indian NWP (BharatFS) Page             │
│  ├── Validation Audit Page  ├── Feature Explainability Page            │
│  └── MapLibre GL Basemap + Aligned Survey of India Boundary Overlay   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          API ROUTING LAYER                             │
│  FastAPI Application (`backend/app/main.py` + `app/api/routes.py`)     │
│  ├── GET /api/health          ├── GET /api/models                      │
│  ├── GET /api/forecast        ├── GET /api/weights                     │
│  ├── GET /api/verification    ├── GET /api/lead-time-analysis          │
│  └── GET /api/uncertainty     └── GET /api/extremes                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     FORECAST & INGESTION LAYER                         │
│  `ForecastProviderManager` (`app/forecasting/provider_manager.py`)     │
│  ├── Live Mode: `OpenMeteoProvider` (ECMWF, GFS, ICON, AIFS proxy)     │
│  ├── Indigenous NWP: `BFSProvider` (BharatFS 6 km architecture)        │
│  └── Offline Mode: `DemoProvider` (Deterministic simulation engine)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SingleModelForecast[] + AtmosphericState
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      FEATURE ENGINEERING LAYER                         │
│  `FeatureEngineer` & `RegimeClassifier` (`app/features/`)              │
│  ├── Spatial & Temporal Context (Lat, Lon, Lead Time)                  │
│  ├── Disagreement Metrics (Spread, Ensemble Std Dev, Disagreement Idx)│
│  └── Atmospheric Regime (Normal, High Wind, High Temp, Heavy Rain)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Feature Vector X(T)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      HYBRID WEIGHTING ENGINE                           │
│  `AIWeightingEngine` (`app/blending/weighting_engine.py`)              │
│  ├── Component A: Trained LightGBM Boosters (`models/*.txt`)           │
│  ├── Component B: Configurable Domain Heuristics (`heuristics.yaml`)   │
│  ├── Logit Combination: α * logit(w_ml) + (1 - α) * logit(w_heur)      │
│  └── Simplex Projection: Softmax -> w_i >= 0, sum(w_i) = 1.0           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ ModelReliabilityWeights
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               SYNTHESIS, UNCERTAINTY & ADVISORY LAYER                  │
│  ├── `ForecastBlender`: F_blend = sum(w_i * F_i)                       │
│  ├── `UncertaintyEngine`: Multi-model spread + Lead factor propagation │
│  └── `ExtremeEventDetector`: IMD/NCMRWF threshold alert classification │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. End-to-End Data Flow

The canonical conceptual pipeline of SANGAM follows an eight-stage sequence:

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

The execution sequence of a single forecast request from client initiation to rendering translates this conceptual pipeline into ten discrete operational steps:

1. **Client Request**: Frontend triggers a GET request to `/api/forecast?latitude=28.6139&longitude=77.2090&lead_time_hours=24`.
2. **Current Atmospheric State**: Localized thermodynamic conditions (temperature, humidity, surface pressure, and wind) are captured at issue time $T_0$.
3. **Multi-Model Ingestion & Normalization**: `ForecastProviderManager` queries upstream weather APIs (ECMWF IFS, NOAA GFS, DWD ICON, ECMWF AIFS proxy, BharatFS), transforming raw payloads into validated `SingleModelForecast` schemas with standard meteorological units.
4. **Feature Extraction**: `FeatureEngineer` calculates multi-model consensus statistics (spread, standard deviation, disagreement index) and `RegimeClassifier` categorizes operational regimes.
5. **AI Weighting Engine**: The feature vector is evaluated by trained LightGBM regressors alongside configurable domain heuristic priors (`heuristics.yaml`).
6. **Dynamic Weights**: Blended logits are projected onto the probability simplex via numerically stable softmax normalization, providing the implementation guarantee that $w_i \ge 0$ and $\sum w_i = 1.0$ to produce the final model reliability weights.
7. **Forecast Blender**: `ForecastBlender` computes the weighted consensus forecast: $F_{\text{blended}} = \sum w_i F_i$.
8. **Uncertainty & Extremes**: `UncertaintyEngine` computes 95% plausible error bounds and `ExtremeEventDetector` flags operational meteorological hazards.
9. **SANGAM Synthesis**: The final consensus forecast payload, uncertainty intervals, attribution cards, and baseline comparisons are compiled into `ForecastResponse`.
10. **Client Delivery**: The structured payload is returned to the frontend dashboard for interactive rendering across cards, tables, and MapLibre layers.

---

## 6. Forecast Systems

SANGAM integrates candidate forecast models across two strictly separated tracks:

### 6.1 ECMWF IFS (Integrated Forecasting System)
- **Institution**: European Centre for Medium-Range Weather Forecasts (Reading, UK / Bologna, Italy).
- **Model Identity**: HRES 0.25° Global Atmospheric Model.
- **Physical Characteristics**: Spectral triangular truncation with 137 vertical levels; world-leading four-dimensional variational data assimilation (4D-Var).
- **Track Status**: **Track B Validated**. Core member of the authoritative 2024 retrospective benchmark.
- **Observed Behavior**: High reliability in thermal and 10 m boundary-layer wind fields; dominates wind weighting (~50% mean weight).

### 6.2 NOAA GFS (Global Forecast System)
- **Institution**: National Centers for Environmental Prediction (NCEP / NOAA, USA).
- **Model Identity**: GFS FV3 (Finite-Volume Cubed-Sphere dynamical core) 0.25° Global.
- **Physical Characteristics**: Advanced physical parameterizations for deep convection and boundary-layer turbulence.
- **Track Status**: **Track B Validated**. Core member of the authoritative 2024 retrospective benchmark.
- **Observed Behavior**: Tends to display a warm, dry convective bias over the northern Indian plains during summer monsoon afternoons; dynamically down-weighted by SANGAM in Delhi temperature forecasting.

### 6.3 DWD ICON (Icosahedral Non-hydrostatic)
- **Institution**: Deutscher Wetterdienst (Offenbach, Germany).
- **Model Identity**: ICON Global 0.25° (derived from operational 13 km triangular mesh).
- **Physical Characteristics**: Non-hydrostatic grid equations on an icosahedral-triangular grid, eliminating polar singularities.
- **Track Status**: **Track B Validated**. Core member of the authoritative 2024 retrospective benchmark.
- **Observed Behavior**: Strong skill in cloud radiative dynamics and clear-sky temperature fields; consistently allocated 30% to 36% weight in thermal blends.

### 6.4 ECMWF AIFS (Artificial Intelligence Forecasting System)
- **Institution**: European Centre for Medium-Range Weather Forecasts.
- **Model Identity**: Data-driven graph neural network / transformer foundation model trained on ECMWF ERA5 reanalysis.
- **Role in SANGAM**: Integrated in Track A live forecasting as an **operational proxy** to demonstrate hybrid AI–NWP blending.
- **Track Status**: **Excluded from Track B historical validation** because a verified, continuous 2024 operational archive matching historical cycle issuances was not available during benchmark construction.

### 6.5 BharatFS (Bharat Forecast System)
- **Institution**: Indian Institute of Tropical Meteorology (IITM, Pune), India Meteorological Department (IMD), and NCMRWF under the Ministry of Earth Sciences (MoES), Govt. of India.
- **Model Identity**: Indigenous 6 km ultra-high-resolution global NWP system on a Triangular Cubic Octahedral (TCo) dynamical grid, powered by the 'Arka' (11.77 PFLOPS) and 'Arunika' supercomputing clusters.
- **Role in SANGAM**: Architecturally supported via `BFSProvider` (`backend/app/forecasting/providers/bfs.py`) and live API registry hooks.
- **Track Status**: **Historical Validation Pending**. The system was operationalized in May 2025; public, reproducible operational forecast archives for the June 15 – July 25, 2024 validation period were not accessible for independent historical benchmarking. In live blends, BharatFS is assigned an unbiased baseline prior.

---

## 7. Forecast Normalization

Raw forecast data from external APIs and disparate model outputs use different variable namings, timestamp conventions, pressure levels, and measurement units (for example, Kelvin vs Celsius, m/s vs km/h, cumulative rain vs hourly rate).

SANGAM enforces standard internal representation through the Pydantic `SingleModelForecast` schema:

```python
class SingleModelForecast(BaseModel):
    model_id: str                      # Standardized lowercase ID (e.g. "ecmwf_ifs")
    model_name: str                    # Human-readable title
    model_type: ModelType              # "NWP" | "AI" | "ENSEMBLE" | "STATISTICAL"
    provider_name: str                 # Issuing agency or API gateway
    forecast_time: datetime            # Issue / initialization time (T0)
    lead_time_hours: int               # Forecast horizon in hours (e.g. 24, 48, 72)
    valid_time: datetime               # Target validation timestamp (Tv = T0 + lead_time)
    temperature: float                 # Air temperature at 2m in degrees Celsius (°C)
    precipitation: float               # Rainfall in millimeters (mm)
    wind_speed: float                  # Horizontal wind speed at 10m in km/h
    humidity: Optional[float] = None   # Relative humidity in percentage (%)
    pressure: Optional[float] = None   # Mean sea-level pressure in hectopascals (hPa)
```

During ingestion, `OpenMeteoProvider` and `BFSProvider` execute deterministic unit transformations and timestamp alignment to guarantee identical schema consumption across all downstream modules.

---

## 8. Atmospheric Context

To determine which model to trust, SANGAM evaluates the current atmospheric context. The context is encapsulated in two core structures:

### 1. `AtmosphericState`
Captures localized thermodynamic variables at issue time:
- `temperature`: Current surface temperature (°C).
- `humidity`: Current relative humidity (%).
- `pressure`: Current barometric surface pressure (hPa).
- `wind_speed`: Current surface wind speed (km/h).
- `wind_direction`: Meteorological wind direction (degrees 0–360).
- `source`: Provenance tag (`LIVE` vs `DEMO/SIMULATED`).

### 2. `ModelDisagreement`
Measures inter-model divergence across candidate forecasts:
- `ensemble_spread`: Standard deviation across candidate predictions ($\sigma$).
- `precip_spread_max_min`: Difference between the wettest and driest model:
  $$\Delta_{\text{precip}} = \max(F_i^{\text{precip}}) - \min(F_i^{\text{precip}})$$
- `disagreement_index`: Normalized divergence metric scaled between $0.0$ (perfect consensus) and $1.0$ (extreme disagreement):
  $$\text{Disagreement Index} = \min\left(1.0, \frac{\Delta_{\text{precip}}}{25.0} + \frac{\sigma_{\text{temp}}}{3.0}\right)$$

---

## 9. Dynamic Weighting Formulation

Let $K$ be the number of candidate forecast models ($i \in \{1, 2, \dots, K\}$). For any scalar weather variable $v$ (temperature, precipitation, wind speed), let $F_i$ denote the prediction from model $i$.

The blended forecast $F_{\text{blended}}$ is defined as:

$$F_{\text{blended}} = \sum_{i=1}^{K} w_i F_i$$

Subject to strict physical admissibility constraints on the probability simplex $\Delta^{K-1}$:

$$w_i \ge 0 \quad \forall i \in \{1, \dots, K\}$$
$$\sum_{i=1}^{K} w_i = 1.0$$

### Why These Constraints Matter
1. **Non-negativity ($w_i \ge 0$)**: An unconstrained linear regression can produce negative weights (e.g. $w_1 = 1.5, w_2 = -0.5$). While mathematically optimal on in-sample training data, negative weights cause severe catastrophic failure during out-of-distribution inference (e.g., negative rainfall or unphysical cooling).
2. **Unity Sum ($\sum w_i = 1$)**: Preserves physical conservation laws. If all models forecast exactly 30°C, the consensus forecast must be 30°C.

---

## 10. Machine Learning Weighting Engine

The primary weighting mechanism uses gradient-boosted decision trees implemented via **LightGBM** (`AIWeightingEngine` in `backend/app/blending/weighting_engine.py`).

### Target Weight Construction (Ground Truth Inversion)
During offline historical training, target weights $w_i^*$ for each instance are constructed by inverting realized prediction error against the independent reanalysis target $y_{\text{ref}}$:

$$e_i = |F_i - y_{\text{ref}}|$$
$$\tilde{w}_i = \frac{1}{e_i^2 + \epsilon}$$
$$w_i^* = \frac{\tilde{w}_i}{\sum_{j=1}^{K} \tilde{w}_j}$$

Where $\epsilon = 0.1$ prevents division by zero when a model predicts the reference target perfectly.

### Feature Vectors
To guarantee **zero reference leakage**, the features fed into LightGBM during inference contain strictly information available at forecast issue time $T_0$:

**Primary 9-Feature Vector** (used when inter-model predictions are available):
$$X(T_0) = \left[ \text{lead\_time\_hours}, \text{lat}, \text{lon}, F_{\text{IFS}}, F_{\text{GFS}}, F_{\text{ICON}}, \text{spread}_{\text{max-min}}, \sigma_{\text{models}}, \mu_{\text{models}} \right]$$

**Auxiliary 5-Feature Vector** (fallback for thermodynamic state):
$$X_{\text{aux}}(T_0) = \left[ \text{lead\_time\_hours}, \text{humidity}, \text{temperature}, \text{pressure}, \text{spread}_{\text{max-min}} \right]$$

LightGBM regresses directly on $w_i^*$, learning complex non-linear relationships such as:
- Spatial bias corrections (e.g. penalizing GFS over Delhi in high temperature).
- Lead-time degradation curves.
- Multi-model spread dampening.

---

## 11. Hybrid Weighting Architecture

While pure machine learning models capture complex non-linear patterns, empirical evaluations show they can exhibit instability under extreme, unseen out-of-distribution conditions. SANGAM addresses this by employing a **Hybrid Blending Engine** that combines ML-learned weights with configurable domain heuristics:

```
                  ┌──────────────────────────────┐
                  │    Trained LightGBM Model    │
                  │   Predicts raw ML weight w_ml│
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                     Logit: log(w_ml / (1 - w_ml))
                                 │
                                 ▼
                  [ α * logit(w_ml) + (1 - α) * logit(w_heur) ]
                                 ▲
                                 │
                     Domain Heuristic Adjustment
                                 │
                  ┌──────────────┴───────────────┐
                  │  Configurable Domain Priors  │
                  │  (heuristics.yaml)           │
                  │  • Horizon penalties/boosts  │
                  │  • Regime bonuses            │
                  └──────────────────────────────┘
                                 │
                                 ▼
                    Numerically Stable Softmax
                                 │
                                 ▼
                  Final Normalized Weights (sum = 1)
```

### Heuristic Logit Adjustments (`backend/config/heuristics.yaml`)
1. **Horizon Prior**:
   - Short range ($T \le 24\text{h}$): NWP physical assimilation boost (+0.15 logit).
   - Extended range ($T \ge 48\text{h}$): AI spatial wave preservation bonus (+0.10 to +0.25 logit).
2. **Weather Regime Prior**:
   - Heavy Rainfall: ECMWF IFS moisture bonus (+0.15), GFS wet-bias penalty (-0.10).
   - High Wind: IFS boundary-layer momentum boost (+0.20).
3. **Weight Combination**: Controlled by `ml_weight_ratio` ($\alpha = 0.75$ by default):
   $$\text{Combined Logit}_i = \alpha \cdot \text{logit}(w_i^{\text{ML}}) + (1 - \alpha) \cdot \Delta_{\text{heur}, i}$$
4. **Softmax Simplex Projection**:
   $$w_i = \frac{\exp(\text{Combined Logit}_i)}{\sum_{j=1}^{K} \exp(\text{Combined Logit}_j)}$$

This ensures that the system defaults to physically sound behavior even if remote ML booster inputs encounter anomalous values.

---

## 12. Forecast Blending Pipeline

The blending execution in `ForecastBlender.blend()` produces four distinct outputs for benchmark transparency:

1. **SANGAM Dynamic Blended Forecast**:
   $$F_{\text{SANGAM}} = \sum_{i=1}^{K} w_i F_i$$
2. **Simple Multi-Model Average (Baseline B)**:
   $$F_{\text{Simple}} = \frac{1}{K} \sum_{i=1}^{K} F_i$$
3. **Static Historical Weights (Baseline C)**:
   $$F_{\text{Static}} = \sum_{i=1}^{K} w_{\text{static}, i} F_i$$
   Where static weights reflect all-sample historical skill (e.g. IFS: 0.35, GFS: 0.25, ICON: 0.25, AIFS: 0.25, BharatFS: 0.25).
4. **Best Single Model (Baseline A)**:
   The single model with the lowest historical error for the target variable (ECMWF IFS).

---

## 13. Uncertainty Quantification

Forecast uncertainty is quantified through four combined factors in `UncertaintyEngine` (`backend/app/uncertainty/engine.py`):

1. **Weighted Inter-Model Variance**:
   $$\sigma_w^2 = \sum_{i=1}^{K} w_i \left( F_i - F_{\text{blended}} \right)^2$$
2. **Lead-Time Error Growth Factor**:
   Uncertainty expands as the forecast horizon extends:
   $$\gamma(T) = 1.0 + \left( \frac{T_{\text{hours}}}{96.0} \right) \times 0.5$$
3. **Plausible Range Construction (95% Confidence Bounds)**:
   $$\text{Margin}_{\text{rain}} = \max\left(1.5, \sqrt{\sigma_w^2 + (0.5 \cdot \text{spread}_{\text{ens}})^2} \times \gamma(T)\right)$$
   $$\text{Lower Bound} = \max(0.0, F_{\text{blended}} - \text{Margin})$$
   $$\text{Upper Bound} = F_{\text{blended}} + \text{Margin}$$
4. **Confidence Score & Category**:
   $$\text{Confidence Score} = \max\left(0.20, \min\left(0.95, 1.0 - \left(0.4 \cdot \text{disagreement\_index} + 0.3 \cdot \frac{T}{72}\right)\right)\right)$$
   Mapped to discrete levels: `High` ($\ge 0.75$), `Moderate` ($0.50\text{–}0.74$), or `Low` ($< 0.50$).

---

## 14. Extreme Weather Detection

Early advisory guidance is generated in `ExtremeEventDetector` (`backend/app/extreme_events/detector.py`) by evaluating blended forecasts against operational meteorological thresholds aligned with IMD and NCMRWF standards:

| Event Code | Category | Operational Threshold | Severity |
|:---|:---|:---|:---|
| `EXTREMELY_HEAVY_RAIN` | Precipitation | Rainfall $\ge 204.5$ mm / 24h | **Extreme** |
| `VERY_HEAVY_RAIN` | Precipitation | Rainfall $\ge 115.6$ mm / 24h | **Severe** |
| `HEAVY_RAIN` | Precipitation | Rainfall $\ge 64.5$ mm / 24h | **Moderate** |
| `FLASH_FLOOD_RISK` | Hourly Rate | Rainfall $\ge 30.0$ mm / 1h | **Severe** |
| `EXTREME_HEATWAVE` | Temperature | Temperature $\ge 45.0$ °C | **Extreme** |
| `HEATWAVE` | Temperature | Temperature $\ge 40.0$ °C | **Severe** |
| `COLDWAVE` | Temperature | Temperature $\le 4.0$ °C | **Moderate** |
| `CYCLONIC_FORCE_WINDS` | Wind | Wind Speed $\ge 90.0$ km/h | **Extreme** |
| `GALE_STORM_FORCE` | Wind | Wind Speed $\ge 75.0$ km/h | **Severe** |
| `HIGH_WIND_SQUALL` | Wind | Wind Speed $\ge 50.0$ km/h | **Moderate** |
| `HIGH_MODEL_DISAGREEMENT`| Advisory | Inter-model spread $\ge 35.0$ mm | **Advisory** |

---

## 15. Explainability Framework

Transparent decision-making is critical for operational forecasters. SANGAM's explainability layer (`WeightExplainability`) surfaces:
- **Model Weight Allocation**: Explicit percentage assigned to each model.
- **Primary Attribution Reasons**: Why weights were boosted or penalized (e.g. *"[ML-Learned] LightGBM base reliability: 44.4%"*, *"[Domain Prior] NWP short-range physics assimilation bonus (+0.15)"*).
- **Historical Skill Score**: Prior verification skill score for that region and lead time.
- **Active Weather Regime**: Operational context under which decisions were made.

### Scientific Disclosure on Explainability
SANGAM does **not** manufacture or fabricate pseudo-SHAP (Shapley Additive exPlanations) values. Because the hybrid system blends non-linear tree outputs with logit-domain priors and simplex normalization, post-hoc linear feature attribution can produce misleading visualizations. SANGAM provides factual, reproducible weight provenance directly traceable to feature values and configuration parameters.

---

## 16. Historical Validation Methodology

The historical benchmark was executed using a strict out-of-sample purged walk-forward protocol (`scripts/evaluate_real_holdout.py`).

### 16.1 Geographic and Temporal Scope
- **Evaluation Period**: June 15, 2024 00:00 UTC to July 25, 2024 23:00 UTC (41 days, 984 hourly steps per location).
- **Locations Evaluated ($M = 5$)**:
  1. **Delhi (28.6139° N, 77.2090° E)**: Northern Indo-Gangetic Plains (Continental Semi-Arid).
  2. **Guwahati (26.1445° N, 91.7362° E)**: Northeastern Brahmaputra River Basin (Subtropical Humid).
  3. **Mumbai (19.0760° N, 72.8777° E)**: Western Arabian Sea Coastal Monsoon (Tropical Maritime).
  4. **Chennai (13.0827° N, 80.2707° E)**: Southeastern Bay of Bengal Coast (Tropical Wet/Dry).
  5. **Leh (34.1526° N, 77.5771° E)**: Western Trans-Himalayan Rain Shadow (High-Altitude Cold Desert).
- **Horizons**: $T+24\text{h}$, $T+48\text{h}$, $T+72\text{h}$. Total aligned volume: 14,760 instance rows.

### 16.2 Purged Walk-Forward Temporal Partitioning
To eliminate data leakage when forecasting out to 72 hours, 72-hour purge buffers were inserted between splits:

```
[--- TRAIN: June 15 - July 8 (8,640 rows) ---]
                                            [--- 72h PURGE 1: July 9-11 (1,080 rows) ---]
                                                                                        [--- VAL: July 12 - 17 (2,160 rows) ---]
                                                                                                                               [--- 72h PURGE 2: July 18-20 (1,080 rows) ---]
                                                                                                                                                                            [--- TEST: July 21 - 25 (1,800 rows) ---]
```

- **TRAIN**: 8,640 instances. Used solely for fitting LightGBM boosters.
- **PURGE 1 (72h)**: Guarantees all training verification targets have materialized before any validation forecast is issued.
- **VALIDATION**: 2,160 instances. Used for hyperparameter tuning.
- **PURGE 2 (72h)**: Guarantees zero leakage into the held-out test split.
- **HELD-OUT TEST**: 1,800 out-of-sample instances (600 per lead time). **Never seen during training or tuning.**

### 16.3 Reference Product
All evaluation targets ($y_{\text{ref}}$) are extracted from the **ECMWF ERA5 Atmospheric Reanalysis** (0.25° grid, ~28 km resolution) and are strictly designated as `REFERENCE_REANALYSIS`. ERA5 is an independent physical reanalysis reference product, **not** direct surface weather station observations.

---

## 17. Benchmark Results

Evaluated on the 1,800 out-of-sample held-out test instances, SANGAM achieved the following verified Mean Absolute Error (MAE) metrics:

| Weather Variable | [A] Best Single Model (IFS) | [B] Simple Multi-Model Average | [C] Static Historical Weights | [D] SANGAM ML-Only | [E] SANGAM Final Hybrid | Gain vs Simple Avg (%) | 95% Bootstrap CI | Statistical Conclusion |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **Temperature (°C)** | 1.226 | 1.212 | 1.083 | 1.027 | **1.026** | **+15.35%** | [+12.72%, +17.90%] | Statistically supported |
| **Precipitation (mm)** | 2.381 | 2.334 | 2.327 | 2.318 | **2.315** | **+0.80%** | [-0.37%, +3.10%] | **Statistically inconclusive** |
| **Wind Speed (km/h)** | 3.782 | 3.838 | 3.588 | 3.312 | **3.344** | **+12.86%** | [+10.83%, +14.98%] | Statistically supported |

---

## 18. Bootstrap Statistical Analysis

To determine whether performance improvements are statistically robust, we executed **1,000 non-parametric bootstrap resamples** ($B = 1,000$) with replacement on the 1,800 test instances:

$$\Delta_{\text{MAE}}^{(b)} = \text{MAE}_{\text{Simple}}^{(b)} - \text{MAE}_{\text{SANGAM}}^{(b)}$$

1. **Temperature**: Mean difference $+0.1860$ °C. The 95% bootstrap confidence interval extends from **$+0.1529$ °C to $+0.2218$ °C** ($[+12.72\%, +17.90\%]$). Because zero is strictly excluded, the improvement is statistically supported.
2. **Wind Speed**: Mean difference $+0.4934$ km/h. The 95% bootstrap confidence interval extends from **$+0.4141$ km/h to $+0.5745$ km/h** ($[+10.83\%, +14.98\%]$). Zero is strictly excluded; the improvement is statistically supported.
3. **Precipitation**: Mean difference $+0.0187$ mm ($+0.80\%$). The 95% bootstrap confidence interval extends from **$-0.0092$ mm to $+0.0593$ mm** ($[-0.37\%, +3.10\%]$). **Because the confidence interval spans across zero, the result is statistically inconclusive.** Highly intermittent tropical monsoon rainfall causes models to hit or miss zero-rain hours simultaneously, attenuating bulk MAE differences.

---

## 19. Lead-Time Analysis

Performance decomposed across forecast horizons ($N = 600$ instances per horizon):

| Horizon | Variable | ECMWF IFS | NOAA GFS | DWD ICON | Simple Average | SANGAM Hybrid | Gain (%) | Mean Learned Weights [IFS / GFS / ICON] |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **T+24h** | Temperature | 1.25 °C | 3.03 °C | 1.64 °C | 1.26 °C | **1.01 °C** | **+19.57%** | [0.444, 0.200, 0.356] |
| | Precipitation | 2.34 mm | 2.44 mm | 2.38 mm | 2.28 mm | **2.28 mm** | **-0.22%** | [0.338, 0.332, 0.330] |
| | Wind Speed | 3.68 km/h | 6.96 km/h | 6.85 km/h | 3.72 km/h | **3.25 km/h** | **+12.86%** | [0.519, 0.193, 0.288] |
| **T+48h** | Temperature | 1.26 °C | 2.60 °C | 1.72 °C | 1.18 °C | **1.01 °C** | **+14.36%** | [0.438, 0.212, 0.351] |
| | Precipitation | 2.37 mm | 2.75 mm | 2.62 mm | 2.35 mm | **2.30 mm** | **+2.04%** | [0.335, 0.334, 0.331] |
| | Wind Speed | 3.71 km/h | 6.76 km/h | 7.02 km/h | 3.88 km/h | **3.41 km/h** | **+12.08%** | [0.498, 0.211, 0.291] |
| **T+72h** | Temperature | 1.17 °C | 2.34 °C | 1.73 °C | 1.20 °C | **1.06 °C** | **+11.92%** | [0.445, 0.214, 0.341] |
| | Precipitation | 2.44 mm | 2.58 mm | 2.45 mm | 2.37 mm | **2.36 mm** | **+0.46%** | [0.331, 0.321, 0.348] |
| | Wind Speed | 3.96 km/h | 7.08 km/h | 6.72 km/h | 3.90 km/h | **3.37 km/h** | **+13.60%** | [0.488, 0.213, 0.299] |

---

## 20. Regional Analysis

Performance across five distinct climatic regions ($N = 360$ instances per station):

| Location | Climatic Regime | Variable | Simple Avg MAE | SANGAM MAE | Gain (%) | Mean Weights [IFS / GFS / ICON] |
|:---|:---|:---|:---|:---|:---|:---|
| **Delhi** | Indo-Gangetic Plains | Temperature | 1.72 °C | **1.04 °C** | **+39.69%** | [0.47, 0.10, 0.44] |
| | | Precipitation | 0.86 mm | **0.57 mm** | **+33.33%** | [0.31, 0.33, 0.36] |
| | | Wind Speed | 3.93 km/h | **3.60 km/h** | **+8.32%** | [0.40, 0.22, 0.38] |
| **Guwahati** | Brahmaputra Basin | Temperature | 1.26 °C | **1.22 °C** | **+2.78%** | [0.35, 0.38, 0.27] |
| | | Precipitation | 4.79 mm | **4.80 mm** | **-0.27%** | [0.37, 0.31, 0.32] |
| | | Wind Speed | 2.06 km/h | **1.93 km/h** | **+6.60%** | [0.37, 0.27, 0.36] |
| **Mumbai** | Western Arabian Coast | Temperature | 0.71 °C | **0.59 °C** | **+17.02%** | [0.50, 0.23, 0.27] |
| | | Precipitation | 1.87 mm | **1.84 mm** | **+1.92%** | [0.34, 0.33, 0.33] |
| | | Wind Speed | 5.04 km/h | **4.41 km/h** | **+12.44%** | [0.51, 0.33, 0.16] |
| **Chennai** | Southeastern Coast | Temperature | 1.33 °C | **1.13 °C** | **+15.52%** | [0.45, 0.24, 0.31] |
| | | Precipitation | 0.25 mm | **0.23 mm** | **+9.64%** | [0.32, 0.34, 0.34] |
| | | Wind Speed | 3.68 km/h | **3.77 km/h** | **-2.28%** | [0.65, 0.15, 0.20] |
| **Leh** | Trans-Himalayan | Temperature | 0.72 °C | **1.03 °C** | **-44.21%** | [0.45, 0.10, 0.45] |
| | | Precipitation | 0.00 mm | **0.00 mm** | **0.00%** | [0.33, 0.33, 0.33] |
| | | Wind Speed | 3.87 km/h | **2.36 km/h** | **+39.05%** | [0.57, 0.07, 0.35] |

### Scientific Notes on Regional Discrepancies
- **Delhi Success**: SANGAM achieved its largest thermal gain (+39.69%) because GFS routinely displayed a severe afternoon warm bias over the plains. SANGAM dynamically reduced GFS to 10% weight, shifting reliance to IFS and ICON.
- **Leh Mountain Degradation**: In high-altitude mountain terrain, SANGAM's temperature error increased (-44.21%). Coarse 0.25° (~28 km) grid reanalysis smooths valley thermal inversions, penalizing models that attempt complex local downscaling. Conversely, wind speed improved dramatically (+39.05%) by heavily favoring IFS (57%) over GFS (7%).

---

## 21. Weather-Regime Analysis

Test instances classified into meteorological regimes using operational reference values:

| Weather Regime | Criterion | Sample Count ($N$) | Evaluation Status | Variable | Simple Avg MAE | SANGAM Hybrid MAE | Gain vs Simple Avg |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **Normal Conditions** | Rain < 2mm, Wind < 20km/h, Temp < 35°C | 1,314 | `VALID_SAMPLE` | Temperature | 1.30 °C | **1.09 °C** | **+15.90%** |
| | | | | Precipitation | 0.66 mm | **0.44 mm** | **+33.53%** |
| | | | | Wind Speed | 3.40 km/h | **2.88 km/h** | **+15.16%** |
| **High Wind** | Wind $\ge 20$ km/h | 408 | `VALID_SAMPLE` | Temperature | 0.76 °C | **0.68 °C** | **+10.79%** |
| | | | | Precipitation | 1.72 mm | **1.69 mm** | **+1.69%** |
| | | | | Wind Speed | 5.01 km/h | **4.53 km/h** | **+9.73%** |
| **High Temperature** | Temp $\ge 35$ °C | 60 | `VALID_SAMPLE` | Temperature | 0.91 °C | **1.05 °C** | **-14.95%** |
| | | | | Precipitation | 0.19 mm | **0.08 mm** | **+59.68%** |
| | | | | Wind Speed | 4.51 km/h | **5.10 km/h** | **-13.07%** |
| **Heavy Rain** | Rain $\ge 5$ mm | 45 | `VALID_SAMPLE` | Temperature | 1.31 °C | **1.28 °C** | **+2.30%** |
| | | | | Precipitation | 13.67 mm | **13.88 mm** | **-1.48%** |
| | | | | Wind Speed | 3.81 km/h | **3.07 km/h** | **+19.48%** |
| **Extreme Rain** | Rain $\ge 20$ mm | 6 | `INSUFFICIENT SAMPLE` | All Variables | — | — | **Sample size too small ($N < 30$)** |
| **Severe Heatwave**| Temp $\ge 40$ °C | 0 | `INSUFFICIENT SAMPLE` | All Variables | — | — | **Sample size too small ($N = 0$)** |

---

## 22. Weight Dynamic Stability

To verify that the machine learning engine dynamically adapts rather than degenerating into static weights, we audited the distribution of learned weights across all 1,800 test instances:

| Variable | Model | Mean Weight | Std Dev ($\sigma$) | Minimum Weight | Maximum Weight | Dynamic Range |
|:---|:---|:---|:---|:---|:---|:---|
| **Temperature** | ECMWF IFS | 0.442 | 0.092 | 0.240 | 0.710 | 0.470 |
| | NOAA GFS | 0.209 | 0.128 | 0.032 | 0.512 | 0.480 |
| | DWD ICON | 0.349 | 0.105 | 0.163 | 0.640 | 0.477 |
| **Wind Speed** | ECMWF IFS | 0.501 | 0.141 | 0.125 | 0.827 | 0.702 |
| | NOAA GFS | 0.206 | 0.114 | 0.025 | 0.618 | 0.593 |
| | DWD ICON | 0.292 | 0.125 | 0.021 | 0.654 | 0.633 |
| **Precipitation** | ECMWF IFS | 0.335 | 0.079 | 0.053 | 0.733 | 0.680 |
| | NOAA GFS | 0.329 | 0.080 | 0.046 | 0.693 | 0.647 |
| | DWD ICON | 0.336 | 0.075 | 0.061 | 0.868 | 0.807 |

The standard deviations ($0.075 \le \sigma \le 0.141$) and wide spreads ($0.021$ to $0.868$) confirm that the model reallocates trust responsively according to real-time atmospheric features.

---

## 23. Indian NWP: BharatFS Integration

The **Bharat Forecast System (BharatFS)** is India's next-generation numerical weather prediction system, developed under Mission Mausam by IITM Pune, IMD, and NCMRWF. Powered by the 'Arka' (11.77 PFLOPS) and 'Arunika' (8.24 PFLOPS) supercomputers, BharatFS operates at an ultra-high horizontal resolution of **6 km × 6 km** on a Triangular Cubic Octahedral (TCo) grid.

### Architectural Status in SANGAM
- **Dedicated Provider Class**: `BFSProvider` in [`backend/app/forecasting/providers/bfs.py`](backend/app/forecasting/providers/bfs.py).
- **Schema Compatibility**: Implements standard `SingleModelForecast` ingestion with metadata declaring 6 km TCo dynamical grid resolution and supercomputing provenance.
- **Model Registry Membership**: Fully registered in `GET /api/models` and supported in live blending pipelines.

### Why 4-Model Historical Retraining is Deferred
BharatFS was operationalized by the Government of India in May 2025. In summer 2024, IMD operated the 12 km GFS (T1534) and NCUM. Retrospective hindcast runs for the June 15 – July 25, 2024 benchmark period reside on internal MoES HPC clusters and are not publicly available.

To maintain strict scientific integrity:
1. No synthetic BharatFS forecast was fabricated.
2. No retrospective hindcast was interpolated or invented.
3. Active heuristic biases for BharatFS were disabled, ensuring it receives an unbiased baseline prior until verified operational archives become accessible.

---

## 24. Frontend Architecture

The user interface is built with **React 19**, **Vite**, and **TypeScript**, styled via a custom CSS design system located in `frontend/src/index.css`.

### Route Structure (`frontend/src/App.tsx`)
- `/` — **Overview**: System introduction, operational metric summaries, quick navigation.
- `/forecast` — **Forecast**: Interactive MapLibre basemap, location search, forecast horizon slider (T+24h to T+120h), multi-model comparison table, uncertainty intervals, extreme event alerts.
- `/models` — **Model Intelligence**: Provider registry details, institutional provenance, horizontal resolution, dynamical core descriptions.
- `/validation` — **Validation & Verification**: Authoritative 41-day historical benchmark metrics, 1,000-sample bootstrap confidence intervals, lead-time and regional audit breakdowns.
- `/indian-nwp` — **Indian NWP Ecosystem**: BharatFS architecture, Mission Mausam supercomputing specifications, operational data gateway documentation.
- `/explainability` — **Feature Attribution**: Transparent attribution cards detailing why weights were assigned across weather regimes.

### Theme Engine
Supports three distinct themes via data attributes (`data-theme="light" | "dark" | "oled"`):
- **Light Theme**: Clean, high-contrast daylight palette for office displays.
- **Dark Theme**: Low-glare night palette optimized for 24/7 meteorological operations.
- **OLED Theme**: Pure black (`#000000`) background minimizing power consumption on mobile and emergency field devices.

---

## 25. Backend Architecture

The backend is built with **FastAPI** (`backend/app/main.py`), utilizing asynchronous event-loop concurrency:

- **Modularity**: Dedicated domain packages for blending, features, forecasting, extreme events, uncertainty, and verification.
- **Configuration Management**: Centralized settings in `backend/app/config.py` loading `backend/config/heuristics.yaml` and `backend/config/extreme_events.yaml`.
- **Zero-Dependency Fallback**: In air-gapped environments or remote network outages, the `DemoProvider` ensures 100% deterministic uptime while preserving transparent provenance tags.

---

## 26. Cartographic & Mapping Architecture

Interactive geographic visualization is implemented in `frontend/src/components/ForecastMap.tsx` using Leaflet 1.9.4 and `@maplibre/maplibre-gl-leaflet`:

### 1. Vector Basemap
- **Provider**: OpenFreeMap (MIT License, hosted vector tiles).
- **Style Specification**: `frontend/public/data/maplibre-style.json` (OpenFreeMap Liberty derived).
- **Disputed Boundary Isolation**: To prevent competing representations with national mapping conventions:
  - `boundary_2` (international country boundaries): set to `visibility: "none"`.
  - `boundary_disputed` (disputed borders): set to `visibility: "none"`.
  - `boundary_3` (state and internal administrative boundaries): preserved.
  - Toponymic labels (countries, states, major cities, towns) and physical geography (water, terrain, relief) are fully preserved.

### 2. India Boundary Overlay
- **Data File**: `frontend/public/data/india-boundary.json`.
- **Lineage**: Derived from DataMeet community maps (`Country/india-land-simplified.geojson`), compiled by Arun Ganesh from U.S. State Dept LSIB, Alhasan Systems, and Natural Earth.
- **Licensing**: Creative Commons Zero 1.0 Universal (CC0 1.0) Public Domain Dedication.
- **Alignment**: India boundary overlay aligned with the Survey of India representation (DataMeet, CC0; see boundary provenance).
- **Provenance Documentation**: Full audit details preserved in [`frontend/public/data/BOUNDARIES.md`](frontend/public/data/BOUNDARIES.md).

### 3. Web Worker Deployment
MapLibre requires a dedicated Web Worker for tile parsing. To eliminate chunking regressions between Vite development and production bundles, `maplibre-gl-worker.mjs` and its shared chunk `maplibre-gl-shared.mjs` are hosted statically in `frontend/public/maplibre/`, configured via `setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')`.

---

## 27. Data Sources and Provenance

| Asset | Source / Provider | License / Terms | Provenance Role |
|:---|:---|:---|:---|
| **ECMWF IFS** | European Centre for Medium-Range Weather Forecasts | Open Data / CC-BY 4.0 | Candidate global NWP model |
| **NOAA GFS** | NOAA / NCEP | Public Domain (U.S. Govt Work) | Candidate global NWP model |
| **DWD ICON** | Deutscher Wetterdienst | Open Data | Candidate global NWP model |
| **ECMWF AIFS** | ECMWF | Research / Open Access | Operational AI proxy model |
| **BharatFS** | IITM / IMD / NCMRWF (MoES) | Govt of India / Restricted | Indigenous Indian NWP architecture |
| **ERA5 Reanalysis** | ECMWF / Copernicus Climate Change Service | CC-BY 4.0 | Independent validation reference |
| **Open-Meteo API** | Open-Meteo GmbH | Non-commercial / Open API | Real-time weather data gateway |
| **Boundary Overlay** | DataMeet Community | Creative Commons Zero 1.0 (CC0) | National boundary line overlay |
| **Vector Tiles** | OpenFreeMap / OpenMapTiles / OSM | MIT / CC-BY 4.0 / ODbL | Basemap tile provider |

---

## 28. Operational Modes: Live vs Demo vs Historical

SANGAM operates under three clearly segregated data regimes:

1. **Live Mode (`LIVE`)**:
   - Queries Open-Meteo API and live provider endpoints in real time.
   - Computes dynamic weights on live atmospheric states.
   - Clearly flags data source as `LIVE`.
2. **Demo Mode (`DEMO/SIMULATED`)**:
   - Zero-dependency offline simulation engine (`DemoProvider`).
   - Generates realistic meteorological states using deterministic trigonometric functions seeded by coordinates and time of year.
   - Activates automatically during network disconnects or API timeouts.
   - Clearly flags data source as `DEMO/SIMULATED`.
3. **Historical Validation Mode (`HISTORICAL_BENCHMARK`)**:
   - Reads strictly from verified historical runs (`data/processed/real_evaluation_results.json`).
   - Serves verified 41-day out-of-sample benchmark metrics, lead-time breakdowns, and bootstrap confidence intervals.
   - Completely decoupled from live inference.

---

## 29. REST API Specification

### Core Endpoints

#### 1. `GET /api/health`
System status check.
- **Response**: `{"status": "healthy", "service": "SANGAM Weather Blending API", "version": "1.0.0"}`

#### 2. `GET /api/locations`
Returns monitored meteorological station locations.

#### 3. `GET /api/models`
Returns model registry metadata, horizontal resolution, institutional operator, and validation status.

#### 4. `GET /api/forecast`
Primary blending endpoint.
- **Parameters**: `latitude` (float), `longitude` (float), `lead_time_hours` (int, default: 24), `forced_mode` ("auto" | "live" | "demo").
- **Response**: `ForecastResponse` object containing blended forecast, raw model forecasts, dynamic weights, uncertainty intervals, extreme event alerts, and baseline comparisons.

#### 5. `GET /api/weights`
Retrieves model reliability weights and primary attribution explanations for a specific atmospheric state.

#### 6. `GET /api/verification`
Retrieves historical benchmark verification reports.
- **Parameters**: `dataset` ("real" | "synthetic"), `region` (string), `lead_time_hours` (int).

#### 7. `GET /api/lead-time-analysis`
Returns detailed performance decompositions across $T+24\text{h}$, $T+48\text{h}$, and $T+72\text{h}$, including regional breakdowns and weather regimes.

---

## 30. Repository Structure

```
SANGAM/
├── README.md                           # Approachable root introduction
├── DETAILED_EXPLANATION.md             # This comprehensive technical manual
├── LICENSE                             # Proprietary source-available license
├── backend/                            # FastAPI backend application
│   ├── README.md                       # Backend subsystem manual
│   ├── requirements.txt                # Python dependencies
│   ├── app/                            # Application logic
│   │   ├── main.py                     # FastAPI entrypoint
│   │   ├── config.py                   # Settings & configuration loader
│   │   ├── api/routes.py               # REST API route handlers
│   │   ├── blending/                   # Dynamic weighting & blending
│   │   ├── extreme_events/             # Meteorological alert detector
│   │   ├── features/                   # Context & regime engineering
│   │   ├── forecasting/                # Provider gateway & connectors
│   │   ├── models/schemas.py           # Pydantic v2 data models
│   │   ├── uncertainty/                # Spread & confidence engine
│   │   ├── utils/logger.py             # Logging utilities
│   │   └── verification/               # Benchmark verification engine
│   ├── config/                         # YAML domain configuration
│   │   ├── heuristics.yaml             # Configurable domain priors
│   │   └── extreme_events.yaml         # Operational hazard thresholds
│   └── tests/                          # Pytest test suite (18 tests)
├── frontend/                           # React 19 + TypeScript + Vite UI
│   ├── README.md                       # Frontend subsystem manual
│   ├── package.json                    # Dependencies & scripts
│   ├── vite.config.ts                  # Vite bundler & proxy configuration
│   ├── public/                         # Public web assets
│   │   ├── data/                       # Map style, boundary GeoJSON & docs
│   │   └── maplibre/                   # Static MapLibre Web Worker bundles
│   └── src/                            # Application source
│       ├── App.tsx                     # Root routing & layout
│       ├── index.css                   # Semantic CSS design system
│       ├── components/                 # UI components
│       ├── pages/                      # Routed view pages
│       ├── services/api.ts             # API client service
│       └── types/                      # TypeScript type definitions
├── models/                             # Pre-trained LightGBM booster models
│   └── README.md                       # Models subsystem manual
├── scripts/                            # Operational & benchmark scripts
│   ├── README.md                       # Scripts subsystem manual
│   ├── evaluate_real_holdout.py        # Out-of-sample benchmark runner
│   ├── analyze_lead_time_and_regimes.py# Horizon & regime analyzer
│   ├── train_blender.py                # LightGBM training pipeline
│   └── fetch_historical_validation_data.py # Historical data fetcher
├── data/                               # Historical & processed datasets
│   ├── README.md                       # Data subsystem manual
│   ├── historical/                     # Raw ingested archives
│   └── processed/                      # Aligned benchmarks & results
└── docs/                               # Specialized scientific documentation
    └── README.md                       # Documentation index
```

---

## 31. Reproducibility Guide

To reproduce the complete SANGAM development and verification environment from a clean clone:

```bash
# 1. Clone repository
git clone https://github.com/iUjjwalRaj/SANGAM.git
cd SANGAM

# 2. Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# 3. Setup Frontend
cd frontend
npm install
cd ..

# 4. Execute Backend Tests
python3 -m pytest backend/tests -v

# 5. Build Frontend Production Bundle
cd frontend
npx tsc -b --noEmit
npm run build
cd ..

# 6. Start Services
# Terminal 1: Backend
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## 32. Verification & Testing

SANGAM includes an automated test suite comprising 18 unit and integration tests (`backend/tests/`):

1. `test_api_health`: Verifies `/api/health` status.
2. `test_api_locations`: Validates location directory schema.
3. `test_api_models`: Validates model registry metadata and schema.
4. `test_api_forecast_pipeline`: Tests end-to-end forecast synthesis.
5. `test_api_verification`: Tests verification report generation.
6. `test_api_lead_time_analysis`: Tests lead-time endpoint payload.
7. `test_api_weights`: Validates dynamic weight constraints.
8. `test_api_uncertainty`: Validates uncertainty calculation.
9. `test_api_extremes`: Validates extreme event detection.
10. `test_weight_normalization_and_formula`: Asserts $w_i \ge 0$ and $\sum w_i = 1.0$.
11. `test_ml_and_heuristic_separation`: Verifies clean logging of ML vs domain reasons.
12. `test_n_model_generic_blending_including_bfs`: Verifies $N$-model generic blending.
13. `test_extreme_rainfall_detection`: Validates rainfall threshold logic.
14. `test_heatwave_detection`: Validates thermal hazard logic.
15. `test_location_schema`: Validates geographic schema constraints.
16. `test_atmospheric_state_schema`: Validates atmospheric data types.
17. `test_model_weights_validation`: Validates simplex constraints on schemas.
18. `test_uncertainty_quantification`: Validates margin and confidence levels.

---

## 33. Limitations & Disclosures

1. **Temporal Horizon**: The empirical evaluation spans 41 days during summer monsoon conditions (June 15 – July 25, 2024). It does **not** represent all-season performance (such as winter fog, post-monsoon cyclogenesis, or pre-monsoon heatwaves).
2. **Geographical Domain**: The validation is conducted across 5 representative Indian monitoring stations; it is **not** a continuous nationwide gridded validation.
3. **Reference Product Granularity**: The reference dataset is ECMWF ERA5 reanalysis (0.25° grid, ~28 km resolution), which naturally attenuates localized cloudburst peaks.
4. **Precipitation Intermittency**: Bulk precipitation improvement ($+0.80\%$) has a 95% bootstrap confidence interval that crosses zero ($[-0.37\%, +3.10\%]$). We declare this result statistically inconclusive.
5. **Complex Mountain Orography (Leh)**: High-altitude Trans-Himalayan terrain produces localized temperature degradation ($-44.21\%$) due to reanalysis grid-averaging over steep valleys.
6. **Extreme Event Sample Sizes**:
   - Extreme precipitation ($\ge 20$ mm/h) occurred only $N = 6$ times in the test set.
   - Severe heatwaves ($\ge 40$ °C) occurred $N = 0$ times during the monsoon window.
7. **BharatFS Archive Status**: Quantitative verification of BharatFS requires authorized access to official retrospective model archives from MoES/NCMRWF.

---

## 34. Future Work

Following directly from disclosed limitations, future development should prioritize:

1. **Station Telemetry Ingestion**: Integrating real-time IMD Automatic Weather Station (AWS) observations to evaluate against in-situ station observations rather than gridded reanalysis.
2. **All-Season Evaluation**: Extending the retrospective benchmark to cover full annual cycles, including winter fog over the Indo-Gangetic Plains and pre-monsoon heatwaves.
3. **Elevation Downscaling**: Incorporating high-resolution digital elevation models (DEM) and lapse-rate adjustments into the feature vector for mountain stations like Leh.
4. **Four-Model Retrospective Benchmark**: Partnering with NCMRWF/IITM to access archived BharatFS hindcasts for direct 4-model retrospective benchmarking.
5. **Spatial Gridded Blending**: Extending the point-station weighting engine to continuous 2D gridded fields across India.
