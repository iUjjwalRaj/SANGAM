from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
from backend.app.models.schemas import SingleModelForecast, AtmosphericState, DataSourceType

class WeatherModelProvider(ABC):
    """
    Abstract base class for all weather forecast providers.
    Ensures modularity: new providers (ECMWF, NOAA, NCMRWF, OpenMeteo, Demo)
    can be plugged in without changing the blending or feature pipeline.
    """
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    @abstractmethod
    def data_source_type(self) -> DataSourceType:
        pass

    @abstractmethod
    async def get_forecast(
        self, lat: float, lon: float, lead_time_hours: int
    ) -> Tuple[List[SingleModelForecast], DataSourceType]:
        """
        Fetch forecast predictions for multiple models at a given location and lead time.
        Returns list of SingleModelForecast and actual DataSourceType used.
        """
        pass

    @abstractmethod
    async def get_atmospheric_state(
        self, lat: float, lon: float
    ) -> AtmosphericState:
        """
        Fetch model-derived current atmospheric state estimate at forecast issuance time.
        Note: These are model-derived current conditions, NOT ground measurement station observations.
        """
        pass

    @abstractmethod
    def get_historical_skill(
        self, lat: float, lon: float, lead_time_hours: int, regime: str = "normal"
    ) -> Dict[str, Dict[str, float]]:
        """
        Returns pre-computed or historical verification skill metrics (MAE, RMSE, bias)
        per model for the given spatial region, lead time, and atmospheric regime.
        """
        pass

class ObservationProvider(ABC):
    """
    Independent abstraction for genuine weather observations.
    Separates actual physical ground stations / radar / satellite from
    model-derived atmospheric estimates and reanalysis references.
    """

    @property
    @abstractmethod
    def observation_type(self) -> str:
        """
        Classification:
        - 'STATION_OBSERVATION' (IMD AWS / WMO physical measurement stations)
        - 'RADAR_SATELLITE' (Doppler radar / INSAT-3D precipitation estimates)
        - 'REFERENCE_REANALYSIS' (ERA5 / IMD gridded reanalysis reference)
        - 'MODEL_DERIVED_ESTIMATE' (Open-Meteo near real-time assimilation estimate)
        """
        pass

    @abstractmethod
    async def get_observation(
        self, lat: float, lon: float, target_timestamp: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Retrieve independent observation or reference measurement at given coordinates and timestamp.
        """
        pass
