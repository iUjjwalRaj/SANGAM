# Backend Subsystem

## Purpose
The `backend/` directory houses the core Python application for SANGAM. It implements the FastAPI web framework, weather model ingestion gateways, feature extraction pipelines, the LightGBM dynamic weighting engine, baseline models, uncertainty quantification, extreme event detection, and benchmark verification services.

---

## Where It Fits in SANGAM

```
                      [ Frontend UI ]
                            │
                            │ HTTP / JSON
                            ▼
              ┌───────────────────────────┐
              │    backend/app/main.py    │
              │  backend/app/api/routes.py│
              └─────────────┬─────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
[ Forecasting ]      [ Feature Eng ]      [ AI Weighting ]
`app/forecasting/`   `app/features/`      `app/blending/`
 - OpenMeteoProvider  - Context Vector     - LightGBM Models
 - DemoProvider       - Regime Classifier  - Config Heuristics
 - BFSProvider                             - Simplex Softmax
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
              [ Synthesis & Post-Processing ]
              - `app/blending/blender.py` (Consensus & Baselines)
              - `app/uncertainty/engine.py` (Error Margins)
              - `app/extreme_events/detector.py` (Hazard Alerts)
              - `app/verification/verifier.py` (Benchmark Audits)
```

---

## Contents

| File / Directory | Purpose |
|:---|:---|
| `requirements.txt` | Python runtime dependencies (FastAPI, Uvicorn, LightGBM, Pydantic, NumPy, Pytest). |
| `app/main.py` | FastAPI application initialization, CORS middleware, and lifespan lifecycle management. |
| `app/config.py` | Centralized settings loader reading environment variables and YAML configurations. |
| `app/api/routes.py` | REST API route definitions for health, forecast, models, weights, verification, and lead-time analysis. |
| `app/blending/` | Blending synthesis (`blender.py`) and dynamic reliability weighting engine (`weighting_engine.py`). |
| `app/extreme_events/` | Meteorological hazard detection (`detector.py`) against IMD/NCMRWF operational thresholds. |
| `app/features/` | Atmospheric context construction (`engineer.py`) and regime classification (`regime.py`). |
| `app/forecasting/` | Forecast gateway manager (`provider_manager.py`), live API (`open_meteo.py`), offline engine (`demo_provider.py`), and indigenous NWP provider (`providers/bfs.py`). |
| `app/models/schemas.py` | Strongly typed Pydantic v2 domain schemas and data transfer objects. |
| `app/uncertainty/` | Multi-model variance and lead-time error propagation calculator (`engine.py`). |
| `app/verification/` | Historical benchmark and retrospective validation reporting service (`verifier.py`). |
| `app/utils/logger.py` | Standardized application logging utility. |
| `config/` | Domain configuration files (`heuristics.yaml` and `extreme_events.yaml`). |
| `tests/` | Complete 18-test Pytest verification suite testing all routes, schemas, and engines. |

---

## Inputs
- **Client Requests**: Query parameters via HTTP GET (`latitude`, `longitude`, `lead_time_hours`, `forced_mode`, `dataset`, `region`).
- **External Forecast Data**: Raw weather forecasts from Open-Meteo REST API and BharatFS operational endpoints.
- **Trained Model Artifacts**: Pre-trained LightGBM decision tree boosters from `../models/`.
- **Domain Configurations**: Heuristic weights and hazard thresholds from `backend/config/*.yaml`.
- **Archived Evaluation Results**: Benchmark outputs from `../data/processed/real_evaluation_results.json`.

---

## Outputs
- **JSON REST Payloads**: Strongly validated responses adhering to `ForecastResponse`, `VerificationReport`, `ModelRegistryInfo`, and `LeadTimeAnalysisResponse`.
- **Blended Forecasts**: Dynamically weighted consensus variables with quantified uncertainty intervals.
- **Extreme Event Alerts**: Operational early advisories for precipitation, thermal, and wind hazards.
- **Attribution Explanations**: Transparent weight provenance details.

---

## Dependencies
- **Internal**: Depends on `../models/` for LightGBM booster text files and `../data/processed/` for historical benchmark reports.
- **External**: Python 3.10+, `fastapi`, `uvicorn`, `pydantic`, `lightgbm`, `numpy`, `pyyaml`, `pytest`, `httpx`.

---

## Used By
- **Frontend Dashboard** (`../frontend/`): Consumes backend REST endpoints via `frontend/src/services/api.ts`.
- **Benchmark Evaluation Scripts** (`../scripts/`): Reuses backend domain schemas and weighting logic for retrospective audits.

---

## How to Run & Test

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run development server with live reload
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# Execute complete backend test suite (18 tests)
python3 -m pytest backend/tests -v
```

---

## Important Design Decisions
1. **Separation of Concerns**: Weather model providers (`app/forecasting/`) only fetch and normalize data; they contain zero weighting or synthesis logic.
2. **Deterministic Offline Fallback**: If external internet or remote weather APIs fail, the system automatically routes to `DemoProvider`, ensuring 100% uptime while preserving transparent `DEMO/SIMULATED` provenance tags.
3. **Hybrid Weighting Architecture**: Combines ML-learned weights with bounded domain priors (`heuristics.yaml`), passing combined logits through softmax to strictly enforce $w_i \ge 0$ and $\sum w_i = 1.0$.

---

## Important Constraints
- **Zero Reference Leakage**: Inference feature vectors must strictly contain variables available at issue time $T_0$. Reanalysis targets ($y_{\text{ref}}$) must never enter inference features.
- **Simplex Admissibility**: Every calculated model weight must be non-negative and all weights must sum to exactly $1.0$.
- **Track Separation**: Historical benchmark verification (Track B) must never mix with real-time operational proxy models or synthetic demo fixtures.

---

## Related Documentation
- 📖 [Root README](../README.md)
- 📖 [Detailed Technical Explanation](../DETAILED_EXPLANATION.md)
- 📖 [REST API Documentation](../docs/api.md)
- 📖 [System Architecture Specification](../docs/architecture.md)
- 💻 [Frontend Subsystem README](../frontend/README.md)
