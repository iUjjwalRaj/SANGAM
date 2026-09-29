# SANGAM: Authoritative Empirical Verification & Scientific Results

**System**: SANGAM — Hybrid AI–NWP Multi-Model Forecast Blending System  
**Organization**: Ministry of Earth Sciences (MoES) / National Centre for Medium Range Weather Forecasting (NCMRWF)  
**Problem Statement**: 26081 (Disaster Management)  
**Document Classification**: Authoritative Single Source of Truth for Scientific Validation  
**Date of Assessment**: September 2026 (Phase 4 Hardened Benchmark)

---

## 1. Existing Validated Benchmark (Three-Model NWP Suite)

This section contains the official, verified results from the Phase 3 evaluation. These figures are fixed and authoritative; they must not be overwritten or conflated with experimental or unverified model runs.

### 1.1 Validated Experimental Protocol
- **Candidate Operational NWP Models ($K=3$)**:
  1. **ECMWF IFS (0.25° HRES)**: European Centre for Medium-Range Weather Forecasts
  2. **NOAA GFS (0.25° FV3)**: National Oceanic and Atmospheric Administration
  3. **DWD ICON (0.25° Global)**: Deutscher Wetterdienst
- **Independent Reference Product**: ECMWF ERA5 Atmospheric Reanalysis, strictly designated as `REFERENCE_REANALYSIS` (Reanalysis value at valid time $T_v$). *Never described as ground truth or station observations.*
- **Evaluation Period**: 41-day historical window from **June 15 to July 25, 2024** (summer monsoon conditions).
- **Representative Benchmark Locations ($M=5$)**:
  1. **Delhi (28.6139° N, 77.2090° E)**: Northern Indo-Gangetic Plains
  2. **Guwahati (26.1445° N, 91.7362° E)**: Northeastern Brahmaputra River Basin
  3. **Mumbai (19.0760° N, 72.8777° E)**: Western Arabian Sea Coastal Monsoon
  4. **Chennai (13.0827° N, 80.2707° E)**: Southeastern Bay of Bengal Maritime Boundary
  5. **Leh (34.1526° N, 77.5771° E)**: High-Altitude Trans-Himalayan Rain Shadow
- **Forecast Horizons Evaluated**: $T+24\text{h}$, $T+48\text{h}$, $T+72\text{h}$.
- **Purged Temporal Split**:
  - **TRAIN**: June 15 to July 8, 2024 (8,640 instances)
  - **72h PURGE BUFFER 1**: July 9 to July 11, 2024 (1,080 instances)
  - **VALIDATION**: July 12 to July 17, 2024 (2,160 instances)
  - **72h PURGE BUFFER 2**: July 18 to July 20, 2024 (1,080 instances)
  - **HELD-OUT TEST**: July 21 to July 25, 2024 (**1,800 instances**, 600 per lead time)

---

### 1.2 Headline Benchmark Results (Held-Out Test Set: $N = 1,800$)

| Weather Variable | [A] Best Single Model (IFS) | [B] Simple Multi-Model Average | [C] Static Historical Weights | [D] SANGAM ML-Only | [E] SANGAM Final Hybrid | Improvement vs Simple Avg | 95% Bootstrap Confidence Interval | Statistical Significance Conclusion |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Temperature (°C)** | 1.226 RMSE | 1.212 RMSE | 1.083 RMSE | 1.027 RMSE | **1.026 RMSE** | **+15.35%** | **[+12.72%, +17.90%]** | **Statistically Significant ($p < 0.05$)** |
| **Precipitation (mm)** | 2.381 RMSE | 2.334 RMSE | 2.327 RMSE | 2.318 RMSE | **2.315 RMSE** | **+0.80%** | **[-0.37%, +3.10%]** | **Inconclusive (CI spans zero)** |
| **Wind Speed (km/h)** | 3.782 RMSE | 3.838 RMSE | 3.588 RMSE | 3.312 RMSE | **3.344 RMSE** | **+12.86%** | **[+10.83%, +14.98%]** | **Statistically Significant ($p < 0.05$)** |

> **Scientific Disclosure on Precipitation**:  
> For bulk rainfall, the 95% bootstrap confidence interval extends from $-0.37\%$ to $+3.10\%$. Because the interval crosses zero, SANGAM **makes no claim of statistically significant bulk rainfall skill improvement**. Highly intermittent convective monsoon rain causes model predictions to frequently match or miss zero-rain hours simultaneously, attenuating bulk RMSE differentials.

---

### 1.3 Lead-Time Breakdown ($T+24\text{h}$, $T+48\text{h}$, $T+72\text{h}$)

| Horizon | Variable | ECMWF IFS | NOAA GFS | DWD ICON | Simple Average | SANGAM Hybrid | Gain vs Simple Avg | Mean Weights [IFS / GFS / ICON] |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **T+24h** | Temperature | 1.25°C | 3.03°C | 1.64°C | 1.26°C | **1.01°C** | **+19.57%** | [0.444, 0.200, 0.356] |
| | Precipitation | 2.34 mm | 2.44 mm | 2.38 mm | 2.28 mm | **2.28 mm** | **-0.22%** | [0.338, 0.332, 0.330] |
| | Wind Speed | 3.68 km/h | 6.96 km/h | 6.85 km/h | 3.72 km/h | **3.25 km/h** | **+12.86%** | [0.519, 0.193, 0.288] |
| **T+48h** | Temperature | 1.26°C | 2.60°C | 1.72°C | 1.18°C | **1.01°C** | **+14.36%** | [0.438, 0.212, 0.351] |
| | Precipitation | 2.37 mm | 2.75 mm | 2.62 mm | 2.35 mm | **2.30 mm** | **+2.04%** | [0.335, 0.334, 0.331] |
| | Wind Speed | 3.71 km/h | 6.76 km/h | 7.02 km/h | 3.88 km/h | **3.41 km/h** | **+12.08%** | [0.498, 0.211, 0.291] |
| **T+72h** | Temperature | 1.17°C | 2.34°C | 1.73°C | 1.20°C | **1.06°C** | **+11.92%** | [0.445, 0.214, 0.341] |
| | Precipitation | 2.44 mm | 2.58 mm | 2.45 mm | 2.37 mm | **2.36 mm** | **+0.46%** | [0.331, 0.321, 0.348] |
| | Wind Speed | 3.96 km/h | 7.08 km/h | 6.72 km/h | 3.90 km/h | **3.37 km/h** | **+13.60%** | [0.488, 0.213, 0.299] |

---

### 1.4 Regional Verification Summary

| Location | Biome / Terrain | Variable | Simple Avg RMSE | SANGAM RMSE | Gain (%) | Model Weights [IFS / GFS / ICON] |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Delhi** | Indo-Gangetic Plain | Temperature | 1.72°C | **1.04°C** | **+39.69%** | [0.47, 0.10, 0.44] |
| | | Precipitation | 0.86 mm | **0.57 mm** | **+33.33%** | [0.31, 0.33, 0.36] |
| | | Wind Speed | 3.93 km/h | **3.60 km/h** | **+8.32%** | [0.40, 0.22, 0.38] |
| **Guwahati** | Brahmaputra Basin | Temperature | 1.26°C | **1.22°C** | **+2.78%** | [0.35, 0.38, 0.27] |
| | | Precipitation | 4.79 mm | **4.80 mm** | **-0.27%** | [0.37, 0.31, 0.32] |
| | | Wind Speed | 2.06 km/h | **1.93 km/h** | **+6.60%** | [0.37, 0.27, 0.36] |
| **Mumbai** | Western Arabian Coast | Temperature | 0.71°C | **0.59°C** | **+17.02%** | [0.50, 0.23, 0.27] |
| | | Precipitation | 1.87 mm | **1.84 mm** | **+1.92%** | [0.34, 0.33, 0.33] |
| | | Wind Speed | 5.04 km/h | **4.41 km/h** | **+12.44%** | [0.51, 0.33, 0.16] |
| **Chennai** | Southeastern Coast | Temperature | 1.33°C | **1.13°C** | **+15.52%** | [0.45, 0.24, 0.31] |
| | | Precipitation | 0.25 mm | **0.23 mm** | **+9.64%** | [0.32, 0.34, 0.34] |
| | | Wind Speed | 3.68 km/h | **3.77 km/h** | **-2.28%** | [0.65, 0.15, 0.20] |
| **Leh** | High Mountain Orography | Temperature | 0.72°C | **1.03°C** | **-44.21%** | [0.45, 0.10, 0.45] |
| | | Precipitation | 0.00 mm | **0.00 mm** | **0.00%** | [0.33, 0.33, 0.33] |
| | | Wind Speed | 3.87 km/h | **2.36 km/h** | **+39.05%** | [0.57, 0.07, 0.35] |

---

## 2. Indian Model Integration: Bharat Forecast System (BharatFS)

### 2.1 Status
**Status: `ARCHITECTURALLY SUPPORTED / HISTORICAL VALIDATION PENDING`**

### 2.2 Technical & Data Availability Audit

| Investigation Item | Finding & Verified Detail |
| :--- | :--- |
| **1. System Identity** | **Bharat Forecast System (BharatFS)** — Indigenous high-resolution global numerical weather prediction system. |
| **2. Developer / Operator** | Developed by **Indian Institute of Tropical Meteorology (IITM)**, Pune (MoES); operated by the **India Meteorological Department (IMD)**; research & infrastructure support from **NCMRWF**. |
| **3. Supercomputing Infrastructure** | Powered by the **Arka** supercomputer (11.77 PFLOPS at IITM Pune) and **Arunika** at NCMRWF Noida. |
| **4. Spatial Resolution** | Ultra-high horizontal resolution of **6 km × 6 km** utilizing a Triangular Cubic Octahedral (TCo) dynamical grid. |
| **5. Temporal Resolution** | Output generated at hourly to 3-hourly intervals, initialized daily at 00:00 UTC and 12:00 UTC cycles. |
| **6. Lead Times** | Short- to medium-range out to 10 days ($T+0$ to $T+240\text{h}$). |
| **7. Launch Date** | Officially launched by the Government of India on **May 26, 2025**. |
| **8. Historical Data Availability (June 15 – July 25, 2024)** | **UNAVAILABLE.** The system was operationalized in May 2025. In summer 2024, IMD operated the 12 km GFS (T1534) and NCUM. Retrospective hindcast runs for summer 2024 are restricted research assets on internal supercomputing clusters. |
| **9. Temporal Alignment Capability** | Cannot be achieved without access to internal NCMRWF/IITM archival hindcast runs. |
| **10. Meteorological Variables** | Standard surface 2m temperature (°C/K), total precipitation (mm), and 10m wind (m/s / km/h) are produced. |
| **11. Access Mechanism** | Visual products via IMD NWP portal (`nwp.imd.gov.in`); research datasets via NCMRWF Data Service portal (`rds.ncmrwf.gov.in`); operational API access via IMD Unified API Gateway (`api.imd.gov.in`, requires institutional token authorization). |
| **12. Public Reproducibility** | **Not publicly downloadable** or unauthenticated API-accessible for third parties. |
| **13. Licensing & Restrictions** | Official MoES/IMD data dissemination policy; restricted operational distribution. |
| **14. Architectural Integration in SANGAM** | Dedicated `BFSProvider` implemented in `backend/app/forecasting/providers/bfs.py`; registered in system configuration; model-agnostic weighting engine supports $N=4$ models. |

### 2.3 Scientific Integrity Decision: Why Four-Model Retraining is Deferred
In strict adherence to Problem Statement 26081 scientific evaluation criteria:
- **No synthetic BFS forecast was manufactured.**
- **No unverified numbers were invented.**
- **No retrospective hindcast was interpolated or fabricated.**
- **Active heuristic weighting biases for BFS were removed**, ensuring BFS receives unbiased baseline priors rather than unverified heuristic boosts.

> **Official Declaration**:  
> *"Bharat Forecast System (BharatFS) integration is supported architecturally, but historical quantitative validation is deferred pending access to a reproducible forecast archive for the June 15 – July 25, 2024 validation period."*

### 2.4 Authoritative Provenance & Government Citations

Every factual claim regarding the Bharat Forecast System (BharatFS) in SANGAM is backed by verifiable institutional and government documentation:

| Document / Citation ID | Issuing Authority & Date | Key Factual Substance & Government Authorization | Reference Link |
| :--- | :--- | :--- | :--- |
| **PIB Release ID 2053890** | **Press Information Bureau (PIB)**, Ministry of Earth Sciences, Govt. of India (September 11, 2024) | Union Cabinet chaired by Prime Minister Narendra Modi approves **Mission Mausam** with an outlay of **₹2,000 Crore** over two years. Formulates next-generation ultra-high-resolution NWP modeling, advanced Doppler radar deployment, and hyper-local forecasting. | [PIB 2053890](https://pib.gov.in/PressReleasePage.aspx?PRID=2053890) |
| **PIB Release ID 2054238** | **Press Information Bureau (PIB)**, Prime Minister's Office, Govt. of India (September 12, 2024) | Prime Minister dedicates two world-class High Performance Computing (HPC) facilities: **'Arka'** (11.77 PFLOPS, 33 PB storage at IITM Pune) and **'Arunika'** (8.24 PFLOPS, 24 PB storage at NCMRWF Noida) to the nation for weather and climate prediction. | [PIB 2054238](https://pib.gov.in/PressReleasePage.aspx?PRID=2054238) |
| **IMD/IITM Operational Brief** | **India Meteorological Department (IMD)** & **Indian Institute of Tropical Meteorology (IITM)** (May 26, 2025) | Operational adoption of the **Bharat Forecast System (BharatFS)** at **6 km × 6 km** resolution utilizing a **Triangular Cubic Octahedral (TCo)** dynamical grid core, establishing India as the first country to run a 6 km operational global weather model. Reports ~30% improvement in extreme rainfall event prediction. | [IMD Operational Portal](https://www.imd.gov.in) |
| **NCMRWF Technical Protocol** | **National Centre for Medium Range Weather Forecasting (NCMRWF)** (2024–2025) | High-performance ensemble data assimilation and atmospheric dynamics documentation for TCo fine-mesh resolution over tropical orography (Western Ghats and Himalayas). | [NCMRWF Research Portal](https://rds.ncmrwf.gov.in) |

---

## 3. Disclosed Limitations & Scope Boundaries

1. **Temporal Horizon**: The empirical evaluation spans 41 days during active summer monsoon conditions (June 15 – July 25, 2024). It does **not** represent all-season performance (e.g. winter fog, post-monsoon cyclogenesis, or pre-monsoon heatwaves).
2. **Geographical Domain**: The validation is conducted across 5 representative Indian monitoring stations; it is **not** a continuous nationwide gridded validation.
3. **Reference Product Granularity**: The reference dataset is ECMWF ERA5 reanalysis (0.25° grid, ~28 km resolution), which naturally attenuates localized cloudburst peaks.
4. **Precipitation Intermittency**: Bulk precipitation improvement ($+0.80\%$) has a 95% bootstrap confidence interval that crosses zero ($[-0.37\%, +3.10\%]$). We declare this result statistically inconclusive.
5. **Complex Orography (Leh)**: High-altitude Trans-Himalayan terrain produces localized temperature degradation ($-44.21\%$) due to reanalysis grid-averaging over steep valleys.
6. **BharatFS Archive Status**: Quantitative verification of BharatFS requires authorized access to official retrospective model archives from MoES/NCMRWF.
