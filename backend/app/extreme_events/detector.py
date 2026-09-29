from typing import List, Dict, Any, Optional
from backend.app.models.schemas import (
    SingleModelForecast,
    ExtremeEventAlert,
    LocationInfo,
    ModelDisagreement,
    SeverityLevel
)
from backend.app.config import extreme_events_config

class ExtremeEventDetector:
    """
    Early guidance engine for high-impact meteorological events.
    Applies configurable IMD/NCMRWF operational thresholds from extreme_events.yaml.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or extreme_events_config

    def detect_events(
        self,
        blended_forecast: Dict[str, float],
        forecasts: List[SingleModelForecast],
        disagreement: ModelDisagreement,
        location: LocationInfo,
        lead_time_hours: int
    ) -> List[ExtremeEventAlert]:
        alerts: List[ExtremeEventAlert] = []
        rain = blended_forecast.get("rainfall", 0.0)
        temp = blended_forecast.get("temperature", 25.0)
        wind = blended_forecast.get("wind_speed", 10.0)
        lead_window = f"T+{lead_time_hours}h to T+{lead_time_hours + 12}h"
        region_name = location.region or location.name or "Target Region"

        precip_cfg = self.config.get("precipitation", {})
        temp_cfg = self.config.get("temperature", {})
        wind_cfg = self.config.get("wind", {})
        disagree_cfg = self.config.get("disagreement", {})

        # 1. Extreme / Very Heavy / Heavy Rainfall Check
        if rain >= precip_cfg.get("extremely_heavy_rainfall", {}).get("threshold_mm_per_24h", 204.5):
            item = precip_cfg["extremely_heavy_rainfall"]
            alerts.append(
                ExtremeEventAlert(
                    event_type="Extremely Heavy Rainfall",
                    code=item.get("code", "EXTREMELY_HEAVY_RAIN"),
                    severity="Extreme",
                    risk_score=min(0.98, 0.85 + (rain - 204.5) / 100.0),
                    affected_region=region_name,
                    forecast_lead_window=lead_window,
                    description=item.get("description", "Disaster mitigation activation recommended."),
                    supporting_variables={"forecast_rainfall_mm": rain, "ensemble_spread_mm": disagreement.ensemble_spread}
                )
            )
        elif rain >= precip_cfg.get("very_heavy_rainfall", {}).get("threshold_mm_per_24h", 115.6):
            item = precip_cfg["very_heavy_rainfall"]
            alerts.append(
                ExtremeEventAlert(
                    event_type="Very Heavy Rainfall",
                    code=item.get("code", "VERY_HEAVY_RAIN"),
                    severity="Severe",
                    risk_score=round(min(0.92, 0.70 + (rain - 115.6) / 150.0), 2),
                    affected_region=region_name,
                    forecast_lead_window=lead_window,
                    description=item.get("description", "High flood and inundation risk."),
                    supporting_variables={"forecast_rainfall_mm": rain}
                )
            )
        elif rain >= precip_cfg.get("heavy_rainfall", {}).get("threshold_mm_per_24h", 64.5):
            item = precip_cfg["heavy_rainfall"]
            alerts.append(
                ExtremeEventAlert(
                    event_type="Heavy Rainfall",
                    code=item.get("code", "HEAVY_RAIN"),
                    severity="Moderate",
                    risk_score=round(min(0.78, 0.50 + (rain - 64.5) / 100.0), 2),
                    affected_region=region_name,
                    forecast_lead_window=lead_window,
                    description=item.get("description", "Localized waterlogging possible."),
                    supporting_variables={"forecast_rainfall_mm": rain}
                )
            )

        # 2. Flash flood burst check (hourly rate)
        if rain >= precip_cfg.get("hourly_flash_flood_rate", {}).get("threshold_mm_per_hour", 30.0):
            item = precip_cfg["hourly_flash_flood_rate"]
            alerts.append(
                ExtremeEventAlert(
                    event_type="Flash Flood Hazard Burst",
                    code=item.get("code", "FLASH_FLOOD_RISK"),
                    severity="Severe",
                    risk_score=0.88,
                    affected_region=region_name,
                    forecast_lead_window=lead_window,
                    description=item.get("description", "Intense convective cloud burst."),
                    supporting_variables={"hourly_rate_mm": rain}
                )
            )

        # 3. Heatwave Check
        if temp >= temp_cfg.get("extreme_heatwave", {}).get("threshold_celsius", 45.0):
            item = temp_cfg["extreme_heatwave"]
            alerts.append(
                ExtremeEventAlert(
                    event_type="Extreme Heatwave",
                    code=item.get("code", "EXTREME_HEATWAVE"),
                    severity="Extreme",
                    risk_score=round(min(0.99, 0.85 + (temp - 45.0) / 10.0), 2),
                    affected_region=region_name,
                    forecast_lead_window=lead_window,
                    description=item.get("description", "Life-threatening heatwave conditions."),
                    supporting_variables={"max_temperature_c": temp}
                )
            )
        elif temp >= temp_cfg.get("heatwave", {}).get("threshold_celsius", 40.0):
            item = temp_cfg["heatwave"]
            alerts.append(
                ExtremeEventAlert(
                    event_type="Heatwave Warning",
                    code=item.get("code", "HEATWAVE"),
                    severity="Severe",
                    risk_score=round(min(0.85, 0.60 + (temp - 40.0) / 10.0), 2),
                    affected_region=region_name,
                    forecast_lead_window=lead_window,
                    description=item.get("description", "Severe heat stress conditions."),
                    supporting_variables={"max_temperature_c": temp}
                )
            )
        elif temp <= temp_cfg.get("coldwave", {}).get("threshold_celsius", 4.0):
            item = temp_cfg["coldwave"]
            alerts.append(
                ExtremeEventAlert(
                    event_type="Coldwave Alert",
                    code=item.get("code", "COLDWAVE"),
                    severity="Moderate",
                    risk_score=0.65,
                    affected_region=region_name,
                    forecast_lead_window=lead_window,
                    description=item.get("description", "Dangerous ground frost and low temperatures."),
                    supporting_variables={"min_temperature_c": temp}
                )
            )

        # 4. Wind Hazards
        if wind >= wind_cfg.get("cyclonic_winds", {}).get("threshold_kmh", 90.0):
            item = wind_cfg["cyclonic_winds"]
            alerts.append(
                ExtremeEventAlert(
                    event_type="Severe Cyclonic Force Winds",
                    code=item.get("code", "CYCLONIC_FORCE_WINDS"),
                    severity="Extreme",
                    risk_score=0.94,
                    affected_region=region_name,
                    forecast_lead_window=lead_window,
                    description=item.get("description", "Destructive winds threatening structures."),
                    supporting_variables={"wind_speed_kmh": wind}
                )
            )
        elif wind >= wind_cfg.get("gale_storm", {}).get("threshold_kmh", 75.0):
            item = wind_cfg["gale_storm"]
            alerts.append(
                ExtremeEventAlert(
                    event_type="Gale / Storm Force Winds",
                    code=item.get("code", "GALE_STORM_FORCE"),
                    severity="Severe",
                    risk_score=0.82,
                    affected_region=region_name,
                    forecast_lead_window=lead_window,
                    description=item.get("description", "Gale-force winds capable of branch breaking."),
                    supporting_variables={"wind_speed_kmh": wind}
                )
            )
        elif wind >= wind_cfg.get("squall", {}).get("threshold_kmh", 50.0):
            item = wind_cfg["squall"]
            alerts.append(
                ExtremeEventAlert(
                    event_type="High Wind Squall",
                    code=item.get("code", "HIGH_WIND_SQUALL"),
                    severity="Moderate",
                    risk_score=0.60,
                    affected_region=region_name,
                    forecast_lead_window=lead_window,
                    description=item.get("description", "Squally winds affecting loose objects."),
                    supporting_variables={"wind_speed_kmh": wind}
                )
            )

        # 5. Model Disagreement Advisory
        if disagreement.precip_spread_max_min >= disagree_cfg.get("high_model_spread_mm", 35.0):
            alerts.append(
                ExtremeEventAlert(
                    event_type="High Forecast Uncertainty Advisory",
                    code=disagree_cfg.get("code", "HIGH_MODEL_DISAGREEMENT"),
                    severity="Advisory",
                    risk_score=0.55,
                    affected_region=region_name,
                    forecast_lead_window=lead_window,
                    description=disagree_cfg.get("description", "NWP and AI models show significant divergence."),
                    supporting_variables={
                        "precip_spread_mm": disagreement.precip_spread_max_min,
                        "disagreement_index": disagreement.disagreement_index
                    }
                )
            )

        return alerts

extreme_event_detector = ExtremeEventDetector()
