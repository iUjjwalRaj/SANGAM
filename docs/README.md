# SANGAM Documentation Index

## Purpose
The `docs/` directory contains specialized scientific audits, architectural specifications, mathematical formulations, and engineering reports created throughout the development of SANGAM.

---

## Documentation Index

### 1. Core Technical & Architectural Specifications
- 📘 **[architecture.md](architecture.md)** — **System Architecture Specification**: Detailed component diagrams, interfaces, operational data flows, and subsystem boundary contracts.
- 📘 **[api.md](api.md)** — **REST API Specification**: Endpoints, HTTP parameters, request/response JSON schemas, and error handling.
- 📘 **[model_blending.md](model_blending.md)** — **Mathematical Formulation**: Formal mathematical derivation of multi-model blending, simplex optimization, LightGBM loss formulation, and domain heuristic logit integration.
- 📘 **[data_pipeline.md](data_pipeline.md)** — **Data Pipeline & Normalization**: Data ingestion protocols, schema standardization, unit conversions, and historical archiving procedures.

### 2. Scientific Verification & Benchmark Reports
- 📊 **[SANGAM_RESULTS.md](SANGAM_RESULTS.md)** — **Authoritative Scientific Benchmark**: Single source of truth for historical Track B verification figures, 1,000-sample bootstrap confidence intervals, and BharatFS institutional provenance.
- 📊 **[real_data_validation.md](real_data_validation.md)** — **Real Historical Validation Protocol**: Detailed documentation of the purged walk-forward temporal split, 72-hour purge buffers, and ERA5 reference extraction.
- 📊 **[lead_time_analysis.md](lead_time_analysis.md)** — **Lead-Time, Regional, and Regime Analysis**: Fine-grained performance decompositions across $T+24\text{h}, T+48\text{h}, T+72\text{h}$, the 5 representative Indian biomes, and meteorological regimes.
- 📊 **[scientific_audit.md](scientific_audit.md)** — **Scientific Integrity Audit**: Initial gap analysis establishing the transition from synthetic proof-of-concept benchmarks to real historical operational archives.

### 3. Engineering Hardening & Deployment Audits
- 🛠️ **[phase4_hardening_report.md](phase4_hardening_report.md)** — Hardening report establishing purged temporal splits, zero reference leakage, and empirical confidence intervals.
- 🛠️ **[phase5_demo_hardening_report.md](phase5_demo_hardening_report.md)** — Offline resilience audit establishing zero-dependency deterministic simulation fallbacks.
- 🛠️ **[deployment_readiness_report.md](deployment_readiness_report.md)** — Production deployment readiness verification covering endpoints, schemas, and runtime performance.

---

## Reading Guide: By Audience

| Reader Role | Recommended Reading Sequence |
|:---|:---|
| **First-Time Visitors / Evaluators** | 1. [Root README](../README.md)<br>2. [DETAILED_EXPLANATION.md](../DETAILED_EXPLANATION.md)<br>3. [SANGAM_RESULTS.md](SANGAM_RESULTS.md) |
| **Backend Developers** | 1. [backend/README.md](../backend/README.md)<br>2. [architecture.md](architecture.md)<br>3. [api.md](api.md) |
| **Frontend Developers** | 1. [frontend/README.md](../frontend/README.md)<br>2. [Boundary Provenance](../frontend/public/data/BOUNDARIES.md) |
| **Meteorologists & ML Researchers** | 1. [model_blending.md](model_blending.md)<br>2. [real_data_validation.md](real_data_validation.md)<br>3. [lead_time_analysis.md](lead_time_analysis.md) |

---

## Important Constraints & Scientific Principles
All documents within this repository adhere to the following verified principles:
1. **Multi-Model Blending**: SANGAM is a dynamic multi-model consensus system, not a new standalone atmospheric dynamical core.
2. **Benchmark Scope**: The authoritative historical benchmark is strictly evaluated on a 41-day summer monsoon window (June 15 – July 25, 2024) across five representative Indian locations. It is not claimed as all-India or all-season validated.
3. **Reference Product**: ECMWF ERA5 is designated as an independent atmospheric reanalysis reference product (`REFERENCE_REANALYSIS`), never as ground-truth station observations.
4. **Metric Terminology**: The authoritative benchmark metric is **Mean Absolute Error (MAE)**.
5. **No Fabricated Explainability**: SANGAM surfaces factual weight attributions and regime priors; it does not fabricate pseudo-SHAP importance bars.
