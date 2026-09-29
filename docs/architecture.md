# SANGAM: System Architecture & Scientific Blueprint

**Problem Statement 26081:** Hybrid AI–NWP Multi-Model Forecast Blending System  
**Organization:** Ministry of Earth Sciences (MoES) / National Centre for Medium Range Weather Forecasting (NCMRWF)  
**Theme:** Disaster Management  

---

## 1. System Vision & Paradigm

Operational numerical weather prediction (NWP) centers worldwide—including NCMRWF and ECMWF—generate daily high-resolution global and regional forecasts. Concurrently, machine-learning and artificial intelligence weather emulators (such as ECMWF AIFS, Google GraphCast, and Huawei Pangu-Weather) have demonstrated superhuman speed and exceptional synoptic-scale accuracy at extended lead times.

However, **no individual model is universally superior across all atmospheric regimes, lead times, geographic topographies, and convective conditions**:
- Traditional physics-based NWP models (e.g. **ECMWF IFS**, **NOAA GFS**) excel at conservative mass-conservation equations, thermodynamic boundaries, and short-range assimilation.
- Deep learning emulators (e.g. **ECMWF AIFS**) excel at rapid spatial gradient propagation and preserving synoptic wave energy at medium range ($T+72\text{h}$ to $T+120\text{h}$), but can occasionally suffer from convective smoothing or phase shifts in extreme bursts.
- Ensemble prediction systems (e.g. **HGEFS / Global Ensemble**) provide crucial probabilistic dispersion and filter out chaotic bifurcation.

**SANGAM** does not construct a new weather model from scratch. Instead, it serves as the **operational intelligence and blending layer**:

```
                       OBSERVATIONS & REANALYSIS
            (AWS Stations, Radar Burst, Satellite, ERA5 Ref)
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │                  FORECAST INGESTION                    │
      │  ECMWF IFS (NWP)    ECMWF AIFS (AI)    NOAA GFS (NWP)  │
      │              Global Ensemble (Probabilistic)           │
      └───────────────────────────┬────────────────────────────┘
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │                   DATA NORMALIZATION                   │
      │  Standard units (°C, mm, km/h, hPa) & lead-time grids  │
      └───────────────────────────┬────────────────────────────┘
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │              FEATURE & REGIME EXTRACTION               │
      │  • Current Atmospheric State  • Weather Regime Detect   │
      │  • Multi-Model Disagreement   • Historical Skill Score │
      │  • Spatio-Temporal Context    • Atmospheric Anomalies  │
      └───────────────────────────┬────────────────────────────┘
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │                  AI WEIGHTING ENGINE                   │
      │   ML Reliability Estimator (GBDT + Softmax Simplex)    │
      │   Output: Dynamic Weights w_i >= 0, Σ w_i = 1.0        │
      │   Physical Explainability Attribution                  │
      └───────────────────────────┬────────────────────────────┘
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │               MULTI-MODEL FORECAST BLEND               │
      │               F_blended = Σ (w_i × F_i)                │
      │      Baselines: Best Single | Simple Avg | Static      │
      └───────────────────────────┬────────────────────────────┘
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │            POST-PROCESSING & UNCERTAINTY               │
      │  Weighted spread, ensemble variance, error margin (±)  │
      │  Confidence Score: High / Medium / Low                 │
      └───────────────────────────┬────────────────────────────┘
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │              EXTREME WEATHER GUIDANCE                  │
      │  IMD/NCMRWF Threshold Alerts (Flash Flood, Heatwave,   │
      │  Cyclonic Gale) with Severity & Risk Index [0-1]       │
      └───────────────────────────┬────────────────────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
         FASTAPI BACKEND                   REACT DASHBOARD
        (REST API Endpoints)         (Interactive Map & Intel UI)
```

---

## 2. Mathematical Formalization

Let $\{M_1, M_2, \dots, M_K\}$ denote the set of $K$ candidate forecast models. At geographic location $(\phi, \lambda)$ and forecast lead time $\tau \in [1, 168]\text{ hours}$, each model produces a predicted scalar $F_i(v)$ for atmospheric variable $v \in \{\text{rainfall}, \text{temperature}, \text{wind}, \text{humidity}\}$.

### Dynamic Weight Estimation
The AI Weighting Engine evaluates a feature vector $\mathbf{x}(\phi, \lambda, \tau, \mathcal{S}_{\text{atm}}, \mathcal{R})$ and computes unnormalized reliability scores $z_i$:

$$z_i = g_i(\mathbf{x}) + \alpha_i(\mathcal{R}) + \beta_i(\tau)$$

where:
- $g_i(\mathbf{x})$ is the learned gradient-boosted / tree attribution of model $i$.
- $\alpha_i(\mathcal{R})$ is the regime affinity bonus for active weather regime $\mathcal{R}$.
- $\beta_i(\tau)$ is the lead-time skill decay modulator.

The normalized reliability weight $w_i$ is computed via a temperature-scaled softmax:

$$w_i = \frac{\exp(z_i / T)}{\sum_{j=1}^K \exp(z_j / T)}$$

Subject to:
$$w_i \ge 0 \quad \forall i \in \{1, \dots, K\}, \qquad \sum_{i=1}^K w_i = 1.0$$

### Blended Synthesis
The unified consensus forecast is:

$$F_{\text{blended}}(v) = \sum_{i=1}^K w_i F_i(v)$$

### Uncertainty Quantification
The combined forecast variance $\sigma_{\text{blended}}^2$ accounts for both inter-model epistemic disagreement and intrinsic ensemble spread:

$$\sigma_{\text{blended}}^2 = \sum_{i=1}^K w_i \left(F_i(v) - F_{\text{blended}}(v)\right)^2 + \gamma \cdot \sigma_{\text{ensemble}}^2 \cdot \left(1 + \frac{\tau}{96}\right)$$

---

## 3. Operational Advantages over Static Ensembles
1. **Regime Sensitivity:** In convective heavy-monsoon bursts, models with known positive rain biases (such as raw GFS) are dynamically downweighted, while models with sharp spatial edge retention (AIFS / IFS) are boosted.
2. **Lead Time Adaptivity:** At $T+12\text{h}$, fine-resolution NWP physics dominates; beyond $T+72\text{h}$, AI emulators maintain synoptic wavelength integrity without numerical dissipation.
3. **No Black-Box Hallucination:** The system blends certified physical and deep-learning models rather than attempting end-to-end unconstrained image generation.
