# SANGAM Model Blending & AI Weighting Engine

## 1. Core Philosophy
Traditional multi-model ensembles rely on simple arithmetic averaging ($w_i = 1/K$) or fixed seasonal weights. While simple averaging reduces random errors, it suffers from two major deficiencies:
1. **Equal Trust Fallacy:** Models with significant structural biases in specific regimes (e.g. convective rain overestimation in monsoons) are trusted equally with models exhibiting lower conditional bias.
2. **Static Rigidity:** A model that excels at short lead times ($T+6\text{h}$) may degrade rapidly by $T+96\text{h}$, yet receives identical weight.

SANGAM dynamically solves for the reliability vector $\mathbf{w} \in \mathbb{R}^K$ at runtime:

$$\mathbf{w}^* = \arg\min_{\mathbf{w}} \mathbb{E}\left[ \left\| \sum_{i=1}^K w_i F_i - Y_{\text{true}} \right\|^2 \right] \quad \text{s.t.} \quad w_i \ge 0, \quad \sum w_i = 1$$

## 2. Weather Regimes & Weight Modulations
SANGAM implements continuous regime-sensitive attributions:

| Weather Regime | Typical Atmospheric Indicators | Weight Modulation Rationale |
|---|---|---|
| **Heavy Rainfall** | Max rain $> 40$ mm, RH $> 80\%$, Low pressure | Boosts ECMWF AIFS (boundary retention) and ECMWF IFS; penalizes NOAA GFS wet bias. |
| **Heatwave** | Max temp $> 40^\circ\text{C}$, continental low humidity | Boosts ECMWF IFS and NOAA GFS for boundary-layer thermal advection. |
| **High Wind / Squall** | Gusts $> 50$ km/h, steep pressure gradient | Enhances IFS and Ensemble baroclinic sensitivity. |
| **Dry Spell** | Rain $< 0.5$ mm, RH $< 35\%$ | Equalizes weights towards stable anticyclonic climatology. |
| **Storm / Cyclonic** | Pressure $< 998$ hPa, Wind $> 55$ km/h, Rain $> 35$ mm | Boosts Global Ensemble to damp track uncertainty. |

## 3. Benchmark Comparisons & Methodology
Evaluated against baseline approaches using a strict temporal holdout protocol:
1. **Best Individual Model:** Lowest single-model RMSE (varies by lead time and regime, typically ECMWF IFS or AIFS).
2. **Simple Average:** Equal-weight multi-model average ($w_i = 1/K$).
3. **Static Climatological:** Fixed operational weights without dynamic conditioning.
4. **SANGAM Dynamic Blend:** Evaluated via `scripts/evaluate_blending.py` on a held-out temporal test set, demonstrating measurable error reduction over single models and equal-weight averaging in simulated monsoonal convective cases. Real-world operational validation requires archiving operational forecasts against IMD AWS observations.
