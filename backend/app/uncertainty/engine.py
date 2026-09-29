import math
import numpy as np
from typing import List, Dict, Any
from backend.app.models.schemas import (
    SingleModelForecast,
    ModelDisagreement,
    ModelReliabilityWeights,
    UncertaintyMetrics,
    ConfidenceLevel
)

class UncertaintyEngine:
    """
    Quantifies forecast uncertainty by integrating:
    1. Inter-model spread (disagreement between NWP and AI forecasts)
    2. Multi-model ensemble variance
    3. Historical lead-time error growth
    4. Weighting entropy / consensus
    """

    @classmethod
    def calculate_uncertainty(
        cls,
        forecasts: List[SingleModelForecast],
        blended_forecast: Dict[str, float],
        weights: ModelReliabilityWeights,
        disagreement: ModelDisagreement,
        lead_time_hours: int
    ) -> UncertaintyMetrics:
        if not forecasts:
            return UncertaintyMetrics(
                rainfall_spread=0.0,
                temperature_spread=0.0,
                wind_spread=0.0,
                confidence_level="Low",
                confidence_score=0.3,
                rainfall_range={"lower": 0.0, "upper": 0.0},
                temperature_range={"lower": 0.0, "upper": 0.0}
            )

        w_map = weights.weights
        blended_rain = blended_forecast.get("rainfall", 0.0)
        blended_temp = blended_forecast.get("temperature", 25.0)
        blended_wind = blended_forecast.get("wind_speed", 10.0)

        # 1. Weighted variance for rainfall
        weighted_rain_var = sum(
            w_map.get(f.model_id, 0.0) * ((f.precipitation - blended_rain) ** 2)
            for f in forecasts
        )
        
        # Lead time uncertainty propagation factor: (1 + lead_time / 96)
        lead_factor = 1.0 + (lead_time_hours / 96.0) * 0.5

        # Rain margin (1.96 standard error bound approx)
        rain_sigma = math.sqrt(weighted_rain_var + (disagreement.ensemble_spread * 0.5)**2)
        rain_margin = max(1.5, rain_sigma * lead_factor)
        
        rain_lower = max(0.0, round(blended_rain - rain_margin, 1))
        rain_upper = round(blended_rain + rain_margin, 1)

        # 2. Temperature variance and margin
        temp_var = sum(
            w_map.get(f.model_id, 0.0) * ((f.temperature - blended_temp) ** 2)
            for f in forecasts
        )
        temp_margin = max(0.6, math.sqrt(temp_var) * lead_factor)
        temp_lower = round(blended_temp - temp_margin, 1)
        temp_upper = round(blended_temp + temp_margin, 1)

        # 3. Wind margin
        wind_var = sum(
            w_map.get(f.model_id, 0.0) * ((f.wind_speed - blended_wind) ** 2)
            for f in forecasts
        )
        wind_margin = max(1.0, math.sqrt(wind_var) * lead_factor)

        # 4. Confidence Score Estimation [0.0 - 1.0]
        # Low disagreement index -> high confidence
        # Shorter lead time -> higher confidence
        lead_penalty = min(0.35, (lead_time_hours / 120.0) * 0.35)
        disagreement_penalty = min(0.40, disagreement.disagreement_index * 0.40)
        
        raw_confidence = 1.0 - lead_penalty - disagreement_penalty
        confidence_score = round(max(0.20, min(0.96, raw_confidence)), 2)

        if confidence_score >= 0.75:
            conf_level: ConfidenceLevel = "High"
        elif confidence_score >= 0.50:
            conf_level = "Medium"
        else:
            conf_level = "Low"

        return UncertaintyMetrics(
            rainfall_spread=round(rain_margin, 1),
            temperature_spread=round(temp_margin, 1),
            wind_spread=round(wind_margin, 1),
            confidence_level=conf_level,
            confidence_score=confidence_score,
            rainfall_range={"lower": rain_lower, "upper": rain_upper},
            temperature_range={"lower": temp_lower, "upper": temp_upper}
        )

uncertainty_engine = UncertaintyEngine()
