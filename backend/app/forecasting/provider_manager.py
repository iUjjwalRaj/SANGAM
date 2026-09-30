from typing import List, Tuple, Dict, Any
from backend.app.models.schemas import SingleModelForecast, AtmosphericState, DataSourceType
from backend.app.forecasting.base import WeatherModelProvider
from backend.app.forecasting.demo_provider import DemoProvider
from backend.app.forecasting.open_meteo import OpenMeteoProvider
from backend.app.forecasting.providers.bfs import BFSProvider
from backend.app.utils.logger import logger
from backend.app.config import settings

class ForecastProviderManager:
    """
    Central gateway for weather forecasts and model-derived atmospheric state estimates.
    Provides graceful offline fallback when internet connectivity or remote APIs are down.
    Maintains clean data provenance.
    """

    def __init__(self):
        self.demo_provider = DemoProvider()
        self.live_provider = OpenMeteoProvider(base_url=settings.open_meteo_base_url)
        self.bfs_provider = BFSProvider()

    async def get_forecast_and_state(
        self,
        lat: float,
        lon: float,
        lead_time_hours: int,
        forced_mode: str = "auto"
    ) -> Tuple[List[SingleModelForecast], AtmosphericState, DataSourceType, Dict[str, Dict[str, float]]]:
        """
        Retrieves forecasts, current atmospheric state, and historical skills.
        Gracefully handles API failures with transparent provenance reporting.
        """
        mode = forced_mode.lower() if forced_mode != "auto" else settings.default_data_mode.lower()

        if mode == "demo":
            logger.info("Using DemoProvider (forced mode = demo)")
            forecasts, source = await self.demo_provider.get_forecast(lat, lon, lead_time_hours)
            atm_state = await self.demo_provider.get_atmospheric_state(lat, lon)
            skills = self.demo_provider.get_historical_skill(lat, lon, lead_time_hours)
            return forecasts, atm_state, source, skills

        # If live or auto:
        try:
            forecasts, source = await self.live_provider.get_forecast(lat, lon, lead_time_hours)
            atm_state = await self.live_provider.get_atmospheric_state(lat, lon)
            skills = self.live_provider.get_historical_skill(lat, lon, lead_time_hours)

            # Include architecturally integrated BharatFS forecast
            bfs_forecasts, _ = await self.bfs_provider.get_forecast(lat, lon, lead_time_hours)
            forecasts.extend(bfs_forecasts)
            skills.update(self.bfs_provider.get_historical_skill(lat, lon, lead_time_hours))

            return forecasts, atm_state, source, skills
        except Exception as e:
            logger.warning(f"Live provider query failed ({e}).")
            if mode == "live":
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=503,
                    detail=f"Live meteorological provider (Open-Meteo) currently unreachable: {e}"
                )
            logger.info("Activating deterministic DemoProvider fallback for auto mode.")
            forecasts, source = await self.demo_provider.get_forecast(lat, lon, lead_time_hours)
            atm_state = await self.demo_provider.get_atmospheric_state(lat, lon)
            skills = self.demo_provider.get_historical_skill(lat, lon, lead_time_hours)
            return forecasts, atm_state, "DEMO/SIMULATED", skills

provider_manager = ForecastProviderManager()

