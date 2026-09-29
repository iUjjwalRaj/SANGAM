import math
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
import numpy as np
try:
    import lightgbm as lgb
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

from backend.app.models.schemas import (
    ModelReliabilityWeights,
    SingleModelForecast,
    WeatherRegimeClassification,
    WeightExplainability
)
from backend.app.config import heuristics_config
from backend.app.utils.logger import logger

class AIWeightingEngine:
    """
    Core Weighting Engine for SANGAM.
    
    Architectural Principle:
    Separates genuinely ML-learned reliability weights from expert domain heuristics.
    1. ML Model: Trained LightGBM regressors predicting reliability weights from atmospheric state.
    2. Configurable Domain Heuristics: Explicit priors loaded from heuristics.yaml (can be toggled or weighted).
    
    Guarantees:
    - w_i >= 0 for all models
    - sum(w_i) == 1.0 (via Softmax / simplex normalization)
    - Full explainability indicating ML vs heuristic contributions.
    """

    def __init__(self, models_dir: Optional[Path] = None):
        self.models_dir = models_dir or Path(__file__).resolve().parent.parent.parent.parent / "models"
        self.lgb_models: Dict[str, Any] = {}
        self.target_map = {
            "ecmwf_ifs": "target_w_ifs",
            "ifs": "target_w_ifs",
            "ecmwf_aifs": "target_w_aifs",
            "noaa_gfs": "target_w_gfs",
            "gfs": "target_w_gfs",
            "dwd_icon": "target_w_icon",
            "icon": "target_w_icon",
            "ensemble": "target_w_ens",
            "bharat_fs": "target_w_bfs",
            "bfs": "target_w_bfs"
        }
        self.feature_names = ["lead_time", "humidity", "temperature", "pressure", "precip_spread"]
        self._load_ml_models()

    def _load_ml_models(self):
        """Attempts to load trained LightGBM models from disk."""
        if not HAS_LIGHTGBM:
            logger.warning("LightGBM not installed; weighting engine will rely on baseline scoring.")
            return

        loaded_count = 0
        for model_id, target in self.target_map.items():
            model_path = self.models_dir / f"{target}_lgb.txt"
            if model_path.exists():
                try:
                    self.lgb_models[model_id] = lgb.Booster(model_file=str(model_path))
                    loaded_count += 1
                except Exception as e:
                    logger.warning(f"Failed to load LightGBM model for {model_id} from {model_path}: {e}")
        
        if loaded_count == len(self.target_map):
            logger.info(f"Successfully loaded all {loaded_count} LightGBM models for AI Weighting Engine.")
        elif loaded_count > 0:
            logger.info(f"Loaded {loaded_count} LightGBM models.")
        else:
            logger.info("No pre-trained LightGBM models found. Models can be generated via scripts/train_blender.py.")

    def _predict_ml_weights(self, features: Dict[str, float], model_ids: List[str]) -> Tuple[Dict[str, float], bool]:
        """
        Genuinely predicts reliability weights using trained LightGBM models for N models.
        For models awaiting retrospective training (e.g. BharatFS), assigns baseline prior.
        Returns: (weights_dict, is_ml_available)
        """
        if not self.lgb_models or not model_ids:
            return {mid: 1.0 / max(1, len(model_ids)) for mid in model_ids}, False

        ifs_val = features.get("forecast_precip_ecmwf_ifs", features.get("forecast_precip_ifs", 1.0))
        gfs_val = features.get("forecast_precip_noaa_gfs", features.get("forecast_precip_gfs", 1.0))
        icon_val = features.get("forecast_precip_dwd_icon", features.get("forecast_precip_icon", 1.0))
        spread = features.get("precip_spread_max_min", abs(ifs_val - gfs_val))
        std_dev = features.get("precip_std_dev", 0.5)
        mean_val = (ifs_val + gfs_val + icon_val) / 3.0

        feat_vector_9 = np.array([[
            features.get("lead_time_hours", 24.0),
            features.get("latitude", 20.0),
            features.get("longitude", 78.0),
            ifs_val,
            gfs_val,
            icon_val,
            spread,
            std_dev,
            mean_val
        ]])

        feat_vector_5 = np.array([[
            features.get("lead_time_hours", 24.0),
            features.get("atm_humidity", 60.0),
            features.get("atm_temperature", 25.0),
            features.get("atm_pressure", 1012.0),
            features.get("precip_spread_max_min", 2.0)
        ]])

        raw_ml: Dict[str, float] = {}
        has_any_ml = False
        for mid in model_ids:
            if mid in self.lgb_models:
                booster = self.lgb_models[mid]
                vec = feat_vector_9 if booster.num_feature() == 9 else feat_vector_5
                val = float(booster.predict(vec)[0])
                raw_ml[mid] = max(0.01, val)
                has_any_ml = True
            else:
                # Baseline equal prior for models pending historical archive (e.g. BharatFS)
                raw_ml[mid] = 1.0 / max(1, len(model_ids))

        if not has_any_ml:
            return {mid: 1.0 / max(1, len(model_ids)) for mid in model_ids}, False

        # Normalize raw ML predictions to sum to 1.0
        total_ml = sum(raw_ml.values())
        norm_ml = {mid: round(val / total_ml, 4) for mid, val in raw_ml.items()}
        return norm_ml, True

    def _compute_heuristic_adjustments(
        self,
        features: Dict[str, float],
        forecasts: List[SingleModelForecast],
        regime: WeatherRegimeClassification
    ) -> Tuple[Dict[str, float], Dict[str, List[str]]]:
        """
        Computes domain-specific heuristic logit adjustments configured in heuristics.yaml.
        Returns: (adjustment_logits, reasons_per_model)
        """
        lead_time = features.get("lead_time_hours", 24.0)
        disagreement_idx = features.get("disagreement_index", 0.3)
        precip_spread = features.get("precip_spread_max_min", 2.0)
        curr_humidity = features.get("atm_humidity", 60.0)

        cfg = heuristics_config or {}
        lt_cfg = cfg.get("lead_time", {})
        reg_cfg = cfg.get("regimes", {}).get(regime.regime, {})

        adjustments: Dict[str, float] = {}
        reasons: Dict[str, List[str]] = {}

        for f in forecasts:
            mid = f.model_id
            mtype = f.model_type
            adj = 0.0
            r_list: List[str] = []

            # 1. Lead Time Dynamics
            if mtype == "AI":
                threshold = lt_cfg.get("ai_extended_horizon_threshold_hours", 48)
                if lead_time >= threshold:
                    boost = min(lt_cfg.get("ai_boost_max", 0.25), 0.10 + (lead_time - threshold) * 0.003)
                    adj += boost
                    r_list.append(f"[Domain Prior] AI spatial wave preservation bonus (+{boost:.2f}) at T+{int(lead_time)}h.")
            elif mtype == "NWP":
                threshold = lt_cfg.get("nwp_short_range_threshold_hours", 24)
                if lead_time <= threshold:
                    boost = lt_cfg.get("nwp_boost_max", 0.15)
                    adj += boost
                    r_list.append(f"[Domain Prior] NWP short-range physics assimilation bonus (+{boost:.2f}).")
            elif mtype == "ENSEMBLE":
                if disagreement_idx > 0.5 or precip_spread > 20.0:
                    adj += 0.20
                    r_list.append(f"[Domain Prior] High inter-model disagreement ({precip_spread:.1f} mm) ensemble variance dampening.")

            # 2. Weather Regime Dynamic Response (Configurable)
            if regime.regime == "heavy_rainfall":
                if mid == "ecmwf_aifs":
                    b = reg_cfg.get("aifs_edge_bonus", 0.20)
                    adj += b
                    r_list.append(f"[Domain Prior] AIFS monsoonal edge retention (+{b:.2f}).")
                elif mid == "ecmwf_ifs":
                    b = reg_cfg.get("ifs_moisture_bonus", 0.15)
                    adj += b
                    r_list.append(f"[Domain Prior] ECMWF IFS synoptic rainfall accuracy (+{b:.2f}).")
                elif mid == "noaa_gfs":
                    p = reg_cfg.get("gfs_convective_bias_penalty", -0.10)
                    adj += p
                    r_list.append(f"[Domain Prior] GFS convective wet bias penalty ({p:.2f}).")
            elif regime.regime == "heatwave":
                if mid == "ecmwf_ifs":
                    b = reg_cfg.get("ifs_thermal_bonus", 0.20)
                    adj += b
                    r_list.append(f"[Domain Prior] IFS radiative thermal accuracy (+{b:.2f}).")
            elif regime.regime == "storm_cyclonic":
                if mid == "ensemble":
                    b = reg_cfg.get("ensemble_dispersion_bonus", 0.30)
                    adj += b
                    r_list.append(f"[Domain Prior] Ensemble cyclonic track dispersion (+{b:.2f}).")

            # 3. Atmospheric consistency
            if curr_humidity > 80.0 and f.precipitation > 5.0:
                adj += 0.08
                r_list.append("[Domain Prior] Alignment with saturated surface humidity.")

            adjustments[mid] = adj
            reasons[mid] = r_list

        return adjustments, reasons

    def _softmax(self, logits: Dict[str, float], temperature: float = 1.0) -> Dict[str, float]:
        """Numerically stable softmax transformation ensuring sum(w_i) == 1.0 and w_i >= 0"""
        max_logit = max(logits.values())
        exp_vals = {k: math.exp((v - max_logit) / temperature) for k, v in logits.items()}
        total = sum(exp_vals.values())
        normalized = {k: round(v / total, 4) for k, v in exp_vals.items()}
        
        # Enforce exact 1.0 sum accounting for floating rounding
        diff = round(1.0 - sum(normalized.values()), 4)
        if diff != 0:
            first_key = next(iter(normalized))
            normalized[first_key] = round(normalized[first_key] + diff, 4)
        return normalized

    def calculate_weights(
        self,
        features: Dict[str, float],
        forecasts: List[SingleModelForecast],
        regime: WeatherRegimeClassification,
        variable: str = "rainfall"
    ) -> Tuple[ModelReliabilityWeights, List[WeightExplainability]]:
        """
        Dynamically estimate reliability weights using a hybrid ML + Configurable Domain Prior architecture.
        Guarantees:
        1. w_i >= 0
        2. sum(w_i) == 1.0
        3. Full transparency between ML-learned and heuristic adjustments.
        """
        model_ids = [f.model_id for f in forecasts]
        if not model_ids:
            return ModelReliabilityWeights(variable=variable, weights={}), []

        # 1. Genuinely ML-learned weights
        ml_weights, is_ml_active = self._predict_ml_weights(features, model_ids)

        # 2. Configurable Domain Heuristics
        cfg = heuristics_config or {}
        heuristics_enabled = cfg.get("heuristics_enabled", True)
        ml_weight_ratio = float(cfg.get("ml_weight_ratio", 0.75)) if is_ml_active else 0.0

        if heuristics_enabled:
            heuristic_adjustments, heuristic_reasons = self._compute_heuristic_adjustments(features, forecasts, regime)
        else:
            heuristic_adjustments = {mid: 0.0 for mid in model_ids}
            heuristic_reasons = {mid: [] for mid in model_ids}

        # 3. Combine ML base with domain adjustments via logit blending
        blended_logits: Dict[str, float] = {}
        explainabilities: List[WeightExplainability] = []

        for mid in model_ids:
            ml_w = ml_weights.get(mid, 1.0 / len(model_ids))
            # Convert ml probability to logit: log(p / (1 - p + eps))
            ml_logit = math.log(max(1e-4, ml_w))
            heur_adj = heuristic_adjustments.get(mid, 0.0)

            # Combined logit
            if is_ml_active and heuristics_enabled:
                combined_logit = ml_weight_ratio * ml_logit + (1.0 - ml_weight_ratio) * heur_adj
            elif is_ml_active:
                combined_logit = ml_logit
            else:
                combined_logit = heur_adj

            blended_logits[mid] = combined_logit

            # Construct explainability
            hist_skill = features.get(f"skill_score_{mid}", 0.75)
            reasons = []
            if is_ml_active:
                reasons.append(f"[ML-Learned] LightGBM model base reliability: {round(ml_w * 100, 1)}%.")
            else:
                reasons.append("[ML Status] Trained LightGBM model not loaded; using baseline attribution.")

            if heuristics_enabled and heuristic_reasons.get(mid):
                reasons.extend(heuristic_reasons[mid])

            explainabilities.append(
                WeightExplainability(
                    model_id=mid,
                    weight=0.0,
                    primary_reasons=reasons,
                    historical_skill_score=round(hist_skill, 3),
                    regime_affinity=f"Active in {regime.regime} regime"
                )
            )

        # 4. Final Simplex Normalization
        final_weights = self._softmax(blended_logits, temperature=1.0)

        # Update explainabilities with final weights
        for exp in explainabilities:
            exp.weight = final_weights.get(exp.model_id, 0.0)

        explainabilities.sort(key=lambda x: x.weight, reverse=True)

        return ModelReliabilityWeights(variable=variable, weights=final_weights), explainabilities

weighting_engine = AIWeightingEngine()
