from __future__ import annotations
from typing import Dict, List, Optional, Any, Literal
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone

ModelType = Literal["NWP", "AI", "ENSEMBLE"]
DataSourceType = Literal["LIVE", "HISTORICAL", "DEMO/SIMULATED"]
ReferenceType = Literal["OBSERVATION_STATION", "REFERENCE_REANALYSIS", "SYNTHETIC_PROXY"]
ConfidenceLevel = Literal["High", "Medium", "Low"]
SeverityLevel = Literal["Advisory", "Moderate", "Severe", "Extreme"]

class LocationInfo(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = "Selected Location"
    state: Optional[str] = None
    region: Optional[str] = None
    lat: float = Field(..., ge=-90.0, le=90.0)
    lon: float = Field(..., ge=-180.0, le=180.0)
    elevation_m: Optional[float] = 0.0

class AtmosphericState(BaseModel):
    temperature: float = Field(..., description="Temperature in °C")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Relative humidity in %")
    pressure: float = Field(..., description="Surface pressure in hPa")
    wind_speed: float = Field(..., ge=0.0, description="Wind speed in km/h")
    wind_direction: Optional[float] = Field(None, ge=0.0, le=360.0, description="Wind direction in degrees")
    precipitation: float = Field(0.0, ge=0.0, description="Precipitation rate / recent rain in mm")
    cloud_cover: Optional[float] = Field(None, ge=0.0, le=100.0, description="Cloud cover percentage")
    visibility: Optional[float] = Field(None, description="Visibility in km")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SingleModelForecast(BaseModel):
    model_id: str
    model_name: str
    model_type: ModelType
    source: str
    lead_time_hours: int
    temperature: float
    precipitation: float
    wind_speed: float
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    wind_direction: Optional[float] = None

class ModelDisagreement(BaseModel):
    precip_std_dev: float
    precip_spread_max_min: float
    temp_std_dev: float
    wind_std_dev: float
    ensemble_spread: float
    disagreement_index: float = Field(..., ge=0.0, le=1.0, description="Normalized disagreement score")

class ModelReliabilityWeights(BaseModel):
    variable: str = "rainfall"
    weights: Dict[str, float] = Field(..., description="Dictionary mapping model_id to normalized weight")
    
    @field_validator("weights")
    def validate_weights_sum(cls, v: Dict[str, float]) -> Dict[str, float]:
        total = sum(v.values())
        if not (0.98 <= total <= 1.02):
            raise ValueError(f"Weights must sum to 1.0, current sum is {total:.4f}")
        for k, val in v.items():
            if val < -0.001:
                raise ValueError(f"Weight for {k} cannot be negative: {val}")
        return v

class WeatherRegimeClassification(BaseModel):
    regime: str
    confidence: float
    description: str
    key_factors: List[str]

class UncertaintyMetrics(BaseModel):
    rainfall_spread: float
    temperature_spread: float
    wind_spread: float
    confidence_level: ConfidenceLevel
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    rainfall_range: Dict[str, float] = Field(..., description="Lower and upper bound, e.g. {'lower': 24.0, 'upper': 40.0}")
    temperature_range: Dict[str, float]

class ExtremeEventAlert(BaseModel):
    event_type: str
    code: str
    severity: SeverityLevel
    risk_score: float = Field(..., ge=0.0, le=1.0)
    affected_region: str
    forecast_lead_window: str
    description: str
    supporting_variables: Dict[str, Any]

class BaselineComparison(BaseModel):
    best_single_model: Dict[str, Any]
    simple_average: Dict[str, float]
    static_historical_weights: Dict[str, float]
    sangam_dynamic_blended: Dict[str, float]
    variance_reduction_pct: float

class WeightExplainability(BaseModel):
    model_id: str
    weight: float
    primary_reasons: List[str]
    historical_skill_score: float
    regime_affinity: str

class ForecastResponse(BaseModel):
    location: LocationInfo
    lead_time: int = Field(..., description="Forecast lead time in hours")
    target_timestamp: str
    data_source: DataSourceType
    weather_regime: WeatherRegimeClassification
    current_atmospheric_state: AtmosphericState
    model_forecasts: List[SingleModelForecast]
    weights: ModelReliabilityWeights
    blended_forecast: Dict[str, float]
    baselines: BaselineComparison
    uncertainty: UncertaintyMetrics
    extreme_events: List[ExtremeEventAlert]
    explainability: List[WeightExplainability]
    system_metadata: Dict[str, Any]
