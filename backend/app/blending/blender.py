import numpy as np
from typing import List, Dict, Any, Tuple
from backend.app.models.schemas import (
    SingleModelForecast,
    ModelReliabilityWeights,
    BaselineComparison
)

class ForecastBlender:
    """
    Blends multi-model forecasts using dynamically computed weights.
    Also computes baseline models (Best Single, Simple Average, Static Weights)
    for transparent benchmark comparison.
    """

    STATIC_WEIGHTS = {
        "ecmwf_ifs": 0.35,
        "ecmwf_aifs": 0.25,
        "noaa_gfs": 0.25,
        "dwd_icon": 0.25,
        "ensemble": 0.15,
        "bharat_fs": 0.25
    }

    @classmethod
    def blend(
        cls,
        forecasts: List[SingleModelForecast],
        weights: ModelReliabilityWeights,
        historical_skills: Dict[str, Dict[str, float]]
    ) -> Tuple[Dict[str, float], BaselineComparison]:
        """
        Calculates:
        1. SANGAM Dynamic Blended Forecast = sum(w_i * F_i)
        2. Simple Average Forecast = mean(F_i)
        3. Static Historical Forecast = sum(w_static_i * F_i)
        4. Best Single Model Forecast
        """
        if not forecasts:
            empty = {"rainfall": 0.0, "temperature": 0.0, "wind_speed": 0.0, "humidity": 0.0, "pressure": 1013.0}
            return empty, BaselineComparison(
                best_single_model={"model_id": "none", "forecast": empty},
                simple_average=empty,
                static_historical_weights=empty,
                sangam_dynamic_blended=empty,
                variance_reduction_pct=0.0
            )

        w_map = weights.weights

        # 1. SANGAM Dynamic ML Blend
        blended_rain = sum(f.precipitation * w_map.get(f.model_id, 0.0) for f in forecasts)
        blended_temp = sum(f.temperature * w_map.get(f.model_id, 0.0) for f in forecasts)
        blended_wind = sum(f.wind_speed * w_map.get(f.model_id, 0.0) for f in forecasts)
        
        # Auxiliary variables
        humidities = [f.humidity for f in forecasts if f.humidity is not None]
        pressures = [f.pressure for f in forecasts if f.pressure is not None]
        
        blended_humidity = sum((f.humidity or 60.0) * w_map.get(f.model_id, 0.0) for f in forecasts)
        blended_pressure = sum((f.pressure or 1012.0) * w_map.get(f.model_id, 0.0) for f in forecasts)

        sangam_forecast = {
            "rainfall": round(blended_rain, 2),
            "temperature": round(blended_temp, 2),
            "wind_speed": round(blended_wind, 2),
            "humidity": round(blended_humidity, 1),
            "pressure": round(blended_pressure, 1)
        }

        # 2. Simple Average (equal weights)
        n = len(forecasts)
        simple_avg = {
            "rainfall": round(sum(f.precipitation for f in forecasts) / n, 2),
            "temperature": round(sum(f.temperature for f in forecasts) / n, 2),
            "wind_speed": round(sum(f.wind_speed for f in forecasts) / n, 2),
            "humidity": round(sum(f.humidity or 60.0 for f in forecasts) / n, 1),
            "pressure": round(sum(f.pressure or 1012.0 for f in forecasts) / n, 1)
        }

        # 3. Static Historical Weights
        static_total = sum(cls.STATIC_WEIGHTS.get(f.model_id, 1.0 / n) for f in forecasts)
        static_w = {f.model_id: cls.STATIC_WEIGHTS.get(f.model_id, 1.0 / n) / static_total for f in forecasts}
        static_forecast = {
            "rainfall": round(sum(f.precipitation * static_w[f.model_id] for f in forecasts), 2),
            "temperature": round(sum(f.temperature * static_w[f.model_id] for f in forecasts), 2),
            "wind_speed": round(sum(f.wind_speed * static_w[f.model_id] for f in forecasts), 2),
            "humidity": round(sum((f.humidity or 60.0) * static_w[f.model_id] for f in forecasts), 1),
            "pressure": round(sum((f.pressure or 1012.0) * static_w[f.model_id] for f in forecasts), 1)
        }

        # 4. Best Single Model (highest overall skill score from historical verification)
        best_f = max(
            forecasts,
            key=lambda f: historical_skills.get(f.model_id, {}).get("overall_skill_score", 0.0)
        )
        best_model_data = {
            "model_id": best_f.model_id,
            "model_name": best_f.model_name,
            "skill_score": historical_skills.get(best_f.model_id, {}).get("overall_skill_score", 0.85),
            "forecast": {
                "rainfall": best_f.precipitation,
                "temperature": best_f.temperature,
                "wind_speed": best_f.wind_speed,
                "humidity": best_f.humidity or 60.0,
                "pressure": best_f.pressure or 1012.0
            }
        }

        # Genuine variance reduction calculation:
        # Measures the reduction in weighted dispersion around the dynamic blend
        # compared to the raw unweighted variance around the simple average
        rain_vals = [f.precipitation for f in forecasts]
        if len(rain_vals) > 1:
            simple_mean = sum(rain_vals) / len(rain_vals)
            raw_variance = float(np.mean([(val - simple_mean) ** 2 for val in rain_vals]))
            weighted_variance = float(sum(w_map.get(f.model_id, 0.0) * ((f.precipitation - blended_rain) ** 2) for f in forecasts))
            if raw_variance > 1e-4:
                # Actual reduction percentage
                reduction = max(0.0, ((raw_variance - weighted_variance) / raw_variance) * 100.0)
                variance_reduction_pct = round(min(50.0, reduction), 1)
            else:
                variance_reduction_pct = 0.0
        else:
            variance_reduction_pct = 0.0

        baselines = BaselineComparison(
            best_single_model=best_model_data,
            simple_average=simple_avg,
            static_historical_weights=static_forecast,
            sangam_dynamic_blended=sangam_forecast,
            variance_reduction_pct=variance_reduction_pct
        )

        return sangam_forecast, baselines

blender = ForecastBlender()
