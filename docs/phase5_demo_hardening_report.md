# SANGAM Phase 5 — SIH Demo, Explainability & Presentation Hardening Report
**Problem Statement 26081 — Hybrid AI–NWP Multi-Model Forecast Blending System**  
**Ministry of Earth Sciences (MoES) / National Centre for Medium Range Weather Forecasting (NCMRWF)**  
**Theme:** Disaster Management  
**Date of Assessment:** September 2026  
**Auditor:** SANGAM Lead System Architect & Scientific Audit Team  

---

## Executive Summary

Phase 5 hardens the presentation, explainability, user experience, and demonstration workflow of Project SANGAM for Smart India Hackathon (SIH) evaluation while strictly maintaining the immutable scientific integrity established in Phases 1–4. 

### Core Scientific Non-Negotiables Maintained
- **No model retraining occurred.**
- **The authoritative Phase 3 benchmark remains untouched and authoritative.**
- **No performance numbers were invented or fabricated.**
- **No active heuristic weighting bonuses were awarded to BharatFS.**
- **The Leh mountain temperature negative result (-44.21%) remains prominently disclosed.**
- **Extreme-event sample insufficiency (N=6 extreme rain, N=0 heatwave) is explicitly declared.**

---

## 1. UI & Visual Architecture Enhancements

### 1.1 Hero & Executive Overview ([`HeroOverview.tsx`](file:///Users/ujjwalraj/Desktop/SANGAM/frontend/src/components/HeroOverview.tsx))
- **Primary Title**: SANGAM | Hybrid AI–NWP Multi-Model Forecast Blending System
- **Subtitle**: *"Context-aware dynamic weighting of multiple weather forecasting systems."*
- **Three Foundational Cards**:
  1. **MODEL DISAGREEMENT**: *"Multiple forecasting systems provide different estimates. Spread between forecasts reveals physical uncertainty and regime vulnerability."*
  2. **DYNAMIC WEIGHTS**: *"SANGAM learns how much to trust each model for the current context (lead time, moisture convergence, terrain, and inter-model consensus)."*
  3. **BLENDED FORECAST**: *"The final forecast combines the model outputs using normalized non-negative weights ($\sum w_i = 1.0, w_i \ge 0$) with quantified uncertainty bounds."*
- **Permanently Visible Scope Banner**:
  `SCIENTIFIC VALIDATION SCOPE: 41-day historical sample • 5 locations • Summer monsoon 2024 • 1,800 held-out test instances • ERA5 reanalysis reference`

### 1.2 SIH Judge Executive Summary Card
- Directly embedded at the top of the interface (collapsible).
- Summarizes the out-of-sample temporal holdout protocol, the 5 representative stations (Delhi, Guwahati, Mumbai, Chennai, Leh), the validated NWP models (IFS, GFS, ICON), and the three headline skill results.
- Discloses scientific boundaries upfront to ensure judges observe immediate methodological transparency.

### 1.3 End-to-End Visual Blending Pipeline ([`PipelineFlow.tsx`](file:///Users/ujjwalraj/Desktop/SANGAM/frontend/src/components/PipelineFlow.tsx))
- An 8-step visual architecture flow:
  1. *Current Atmospheric State* (Surface weather estimate)
  2. *Multi-Model Ingestion* (Visual separation between Track B Validated vs. Additional Integrated Systems)
  3. *Feature Extraction* (Disagreement spread, lead time, spatial biome)
  4. *AI Weighting Engine* (LightGBM context reliability)
  5. *Dynamic Weights* ($\sum w_i = 1.0, w_i \ge 0$)
  6. *Forecast Blender* ($F_{\text{blended}} = \sum w_i F_i$)
  7. *Uncertainty & Extremes* (Spread entropy & guidance thresholds)
  8. *SANGAM Synthesis* (Optimized consensus output)
- Features an expandable "How SANGAM Blends Forecasts" mathematical formulation panel.

---

## 2. Explainability & Mathematical Transparency

### 2.1 Feature Group Transparency ([`ExplainabilityPanel.tsx`](file:///Users/ujjwalraj/Desktop/SANGAM/frontend/src/components/ExplainabilityPanel.tsx))
- In strict adherence to Part 5, **no fabricated SHAP values or fake importance percentages are displayed**.
- Instead, the panel displays the **actual feature inputs** evaluated by the weighting engine:
  1. *Lead Time*: e.g. T+24h, T+48h, T+72h
  2. *Geographic Coordinates*: Latitude and Longitude
  3. *Model Disagreement Spread*: Rain spread (±mm) and temperature spread (±°C)
  4. *Ensemble Statistics*: Ensemble mean and sample standard deviation ($\sigma$)
  5. *Atmospheric Regime*: Real-time classified synoptic state (Normal, Heavy Rain, Heatwave, Squall, etc.)
  6. *Skill Priors*: Historical track B baseline skill scores
- Core explanation text displayed:
  > *"SANGAM dynamically adjusts model weights using forecast characteristics, model disagreement, lead time, and contextual features."*

### 2.2 Mathematical Formulation
- Plain-language summary: *"Each model receives a non-negative weight, all weights sum to 1, and the final forecast is their weighted combination."*
- Mathematical equations:
  $$w_i \ge 0 \quad \text{and} \quad \sum_{i=1}^N w_i = 1.0$$
  $$F_{\text{blended}} = \sum_{i=1}^N (w_i \times F_i)$$

---

## 3. Multi-Model Comparison & Contribution Audit

### 3.1 Detailed Model Comparison Table ([`ModelComparison.tsx`](file:///Users/ujjwalraj/Desktop/SANGAM/frontend/src/components/ModelComparison.tsx))
Per Part 4, every model is audited with distinct validation statuses, resolutions, dynamic weights, and blended contributions:

| Model | Forecast Value | Resolution | Validation Status | Dynamic Weight ($w_i$) | Blended Contribution ($w_i \times F_i$) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SANGAM Consensus** | Blended Total | Adaptive | `PROPOSED ML BLENDER` | 100.0% | Complete Synthesis |
| **ECMWF IFS** | Raw Value | 0.25° (~27 km) | `Track B Validated` | Dynamic % | $w_{\text{IFS}} \times F_{\text{IFS}}$ |
| **NOAA GFS** | Raw Value | 0.25° (~27 km) | `Track B Validated` | Dynamic % | $w_{\text{GFS}} \times F_{\text{GFS}}$ |
| **DWD ICON** | Raw Value | 0.25° (~27 km) | `Track B Validated` | Dynamic % | $w_{\text{ICON}} \times F_{\text{ICON}}$ |
| **🇮🇳 BharatFS** | Raw Value | 6 km (TCo grid) | `Validation Pending Archive` | Baseline Prior | $w_{\text{BFS}} \times F_{\text{BFS}}$ |
| **ECMWF AIFS** | Raw Value | 0.25° (AI Emulator) | `Track B Retrospective Excluded` | Dynamic % | $w_{\text{AIFS}} \times F_{\text{AIFS}}$ |
| **HGEFS Ensemble** | Raw Value | 0.5° (Ensemble) | `Registered Multi-Model` | Dynamic % | $w_{\text{ENS}} \times F_{\text{ENS}}$ |

*Note: BharatFS weight is assigned via uniform baseline prior; status does not imply validated historical skill.*

---

## 4. Dedicated Indian NWP Section: Bharat Forecast System ([`IndianModelSection.tsx`](file:///Users/ujjwalraj/Desktop/SANGAM/frontend/src/components/IndianModelSection.tsx))

- **Official Badge**: `🇮🇳 BharatFS (6 km) • ARCHITECTURE SUPPORTED • HISTORICAL VALIDATION PENDING`
- **Official Scientific Protocol Disclosure**:
  > *"Bharat Forecast System (BharatFS) is integrated at the architecture/provider level, but historical quantitative validation on the current 2024 benchmark is pending because a reproducible public forecast archive for that period is unavailable."*
- **Authoritative Government Provenance & Citations**:
  1. *PIB Release ID 2053890 (Sept 11, 2024)*: Union Cabinet approved Mission Mausam (₹2,000 Crore allocation) for next-generation NWP modeling.
  2. *PIB Release ID 2054238 (Sept 12, 2024)*: Prime Minister dedicated *Arka* (11.77 PF, IITM Pune) and *Arunika* (8.24 PF, NCMRWF Noida) supercomputers.
  3. *IMD/IITM Operational Brief (May 26, 2025)*: Operational adoption of BharatFS 6 km global/regional TCo dynamical grid.

---

## 5. Clear Separation: Demo Data vs. Live Data vs. Historical Validation

The application visually distinguishes between data domains:
1. **DEMO DATA**: Deterministic, reproducible data used to demonstrate application functionality offline without external network dependencies.
2. **LIVE DATA**: Current surface weather and forecast provider output from Open-Meteo and connected model APIs.
3. **HISTORICAL VALIDATION**: Strict out-of-sample held-out results from the audited summer 2024 benchmark against ERA5 reanalysis (`REFERENCE_REANALYSIS`).

---

## 6. Verification Benchmark & Disclosed Limitations

The authoritative benchmark figures in [`VerificationModal.tsx`](file:///Users/ujjwalraj/Desktop/SANGAM/frontend/src/components/VerificationModal.tsx) and [`docs/SANGAM_RESULTS.md`](file:///Users/ujjwalraj/Desktop/SANGAM/docs/SANGAM_RESULTS.md) are strictly preserved:

- **2m Temperature RMSE**: Simple Average 1.212 °C $\rightarrow$ SANGAM **1.026 °C** (**+15.35%**, 95% CI: [+12.72%, +17.90%], $p < 0.05$)
- **10m Wind Speed RMSE**: Simple Average 3.838 km/h $\rightarrow$ SANGAM **3.344 km/h** (**+12.86%**, 95% CI: [+10.83%, +14.98%], $p < 0.05$)
- **24h Precipitation RMSE**: Simple Average 2.334 mm $\rightarrow$ SANGAM **2.315 mm** (**+0.80%**, 95% CI: [-0.37%, +3.10%], **Statistically Inconclusive**)
- **Disclosed Negative Regional Evidence**: Leh Trans-Himalayan temperature degradation (**-44.21%**) is prominently explained as high-altitude valley averaging in coarse reanalysis products.
- **Extreme Event Sample Size**: Extreme Rain $\ge 20$ mm ($N=6$, INSUFFICIENT SAMPLE SIZE); Severe Heatwave $\ge 40$ °C ($N=0$, INSUFFICIENT SAMPLE SIZE).

---

## 7. Automated Test & Build Status

### 7.1 Backend Automated Tests
```bash
python3 -m pytest backend/tests -v
# Result: 18 passed in 1.74s (100% pass rate)
```

### 7.2 Frontend Production Build
```bash
cd frontend && npm run build
# Result: Built cleanly in 362ms with zero TypeScript errors
```

### 7.3 End-to-End Demo Flow Smoke Test
Executed a 12-step programmatic smoke test simulating the entire 3–5 minute judge demonstration flow:
- Step 1: Frontend server responding on port 5173 with root mount.
- Steps 2–9: Location and lead-time switching across Delhi, Guwahati, Mumbai, Chennai, and Leh for T+24h, T+48h, and T+72h.
- Step 10: Verification report endpoint (`GET /api/verification?dataset=real`) returning ERA5 reference reanalysis and headline gains.
- Step 11: Lead-time analysis endpoint (`GET /api/lead-time-analysis`) returning out-of-sample breakdowns.
- Step 12: Model registry endpoint (`GET /api/models`) returning all 6 models with BharatFS government citations.

---

## 8. Final Status Checklist

```
SCIENTIFIC BENCHMARK:       UNCHANGED (Authoritative Phase 3 Results Preserved)
BFS HISTORICAL VALIDATION:  PENDING (Architecturally Supported, No Fabricated Data)
AIFS STATUS:                OPERATIONAL PROXY (Track B Retrospective Excluded)
HGEFS STATUS:               REGISTERED ENSEMBLE
BACKEND TESTS:              18/18 PASS
FRONTEND BUILD:             PASS (Zero Errors)
BROWSER DEMO SEQUENCE:      PASS (All 12 Steps Verified)
```
