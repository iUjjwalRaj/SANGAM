import math
import numpy as np
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from backend.app.models.schemas import (
    AtmosphericState,
    SingleModelForecast,
    ModelDisagreement,
    WeatherRegimeClassification,
    LocationInfo
)
from backend.app.features.regime import WeatherRegimeClassifier

class FeatureEngineer:
    """
    Extracts structured, meteorologically informative feature vectors
    for the AI Weighting Engine.
    """

    @staticmethod
    def compute_model_disagreement(forecasts: List[SingleModelForecast]) -> ModelDisagreement:
        if not forecasts:
            return ModelDisagreement(
                precip_std_dev=0.0,
                precip_spread_max_min=0.0,
                temp_std_dev=0.0,
                wind_std_dev=0.0,
                ensemble_spread=0.0,
                disagreement_index=0.0
            )

        precips = [f.precipitation for f in forecasts]
        temps = [f.temperature for f in forecasts]
        winds = [f.wind_speed for f in forecasts]

        precip_std = float(np.std(precips))
        precip_spread = float(max(precips) - min(precips))
        temp_std = float(np.std(temps))
        wind_std = float(np.std(winds))

        # Look specifically for ensemble member if present
        ens_forecast = next((f for f in forecasts if f.model_type == "ENSEMBLE"), None)
        ensemble_spread = precip_std * 1.15 if ens_forecast else precip_std

        # Disagreement index normalized to [0, 1] using logistic scaling
        # Standardizing against typical spread scales (10mm rain spread, 2°C temp spread)
        combined_raw_spread = (precip_spread / 15.0) + (temp_std / 2.5) + (wind_std / 5.0)
        disagreement_index = float(1.0 / (1.0 + math.exp(-combined_raw_spread + 1.8)))

        return ModelDisagreement(
            precip_std_dev=round(precip_std, 2),
            precip_spread_max_min=round(precip_spread, 2),
            temp_std_dev=round(temp_std, 2),
            wind_std_dev=round(wind_std, 2),
            ensemble_spread=round(ensemble_spread, 2),
            disagreement_index=round(min(1.0, max(0.0, disagreement_index)), 3)
        )

    @classmethod
    def extract_features(
        cls,
        location: LocationInfo,
        lead_time_hours: int,
        atm_state: AtmosphericState,
        forecasts: List[SingleModelForecast],
        historical_skills: Dict[str, Dict[str, float]],
        regime: WeatherRegimeClassification
    ) -> Tuple[Dict[str, float], ModelDisagreement]:
        """
        Produce a flat dictionary of engineered numeric features ready for ML scoring.
        """
        disagreement = cls.compute_model_disagreement(forecasts)
        features: Dict[str, float] = {}

        # 1. Atmospheric features
        features["atm_temperature"] = atm_state.temperature
        features["atm_humidity"] = atm_state.humidity
        features["atm_pressure"] = atm_state.pressure
        features["atm_wind_speed"] = atm_state.wind_speed
        features["atm_precipitation"] = atm_state.precipitation
        features["atm_cloud_cover"] = atm_state.cloud_cover if atm_state.cloud_cover is not None else 50.0

        # 2. Forecast features per model
        precip_vals = []
        temp_vals = []
        for f in forecasts:
            features[f"forecast_precip_{f.model_id}"] = f.precipitation
            features[f"forecast_temp_{f.model_id}"] = f.temperature
            features[f"forecast_wind_{f.model_id}"] = f.wind_speed
            precip_vals.append(f.precipitation)
            temp_vals.append(f.temperature)

        # 3. Model disagreement features
        features["precip_std_dev"] = disagreement.precip_std_dev
        features["precip_spread_max_min"] = disagreement.precip_spread_max_min
        features["temp_std_dev"] = disagreement.temp_std_dev
        features["wind_std_dev"] = disagreement.wind_std_dev
        features["disagreement_index"] = disagreement.disagreement_index

        # 4. Contextual & Spatio-temporal features
        features["latitude"] = location.lat
        features["longitude"] = location.lon
        features["elevation_m"] = location.elevation_m or 100.0
        features["lead_time_hours"] = float(lead_time_hours)
        
        now = datetime.now(timezone.utc)
        month = now.month
        features["month"] = float(month)
        
        # Indian monsoon season encoding:
        # Monsoon (Jun-Sep): 1.0, Post-monsoon (Oct-Nov): 0.5, Winter (Dec-Feb): 0.0, Pre-monsoon/Summer (Mar-May): 0.3
        if month in [6, 7, 8, 9]:
            season_weight = 1.0
        elif month in [10, 11]:
            season_weight = 0.5
        elif month in [3, 4, 5]:
            season_weight = 0.3
        else:
            season_weight = 0.0
        features["monsoon_season_index"] = season_weight

        # Diurnal solar cycle
        hour = (now.hour + int(location.lon / 15.0)) % 24
        features["is_daytime"] = 1.0 if 6 <= hour <= 18 else 0.0

        # 5. Weather regime one-hot/score
        regimes_list = ["normal", "heavy_rainfall", "heatwave", "high_wind", "dry_spell", "storm_cyclonic"]
        for r_name in regimes_list:
            features[f"regime_{r_name}"] = 1.0 if regime.regime == r_name else 0.0

        # 6. Historical skill features per model
        for model_id, skills in historical_skills.items():
            features[f"skill_score_{model_id}"] = skills.get("overall_skill_score", 0.75)
            features[f"mae_rainfall_{model_id}"] = skills.get("mae_rainfall", 5.0)
            features[f"bias_rainfall_{model_id}"] = skills.get("bias_rainfall", 0.0)

        # 7. Derived features
        mean_forecast_precip = float(np.mean(precip_vals)) if precip_vals else 0.0
        features["precip_anomaly_vs_obs"] = round(mean_forecast_precip - atm_state.precipitation, 2)
        features["temp_anomaly_vs_obs"] = round(float(np.mean(temp_vals)) - atm_state.temperature, 2)
        features["spread_to_mean_precip_ratio"] = round(disagreement.precip_spread_max_min / (mean_forecast_precip + 1.0), 3)

        return features, disagreement
