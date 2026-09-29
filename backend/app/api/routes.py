import json
from pathlib import Path
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone

from backend.app.models.schemas import (
    ForecastResponse,
    LocationInfo,
    ModelReliabilityWeights,
    UncertaintyMetrics,
    ExtremeEventAlert,
    SingleModelForecast,
    WeatherRegimeClassification
)
from backend.app.config import system_config, get_location_by_coords
from backend.app.forecasting.provider_manager import provider_manager
from backend.app.features.regime import WeatherRegimeClassifier
from backend.app.features.engineer import FeatureEngineer
from backend.app.blending.weighting_engine import weighting_engine
from backend.app.blending.blender import blender
from backend.app.uncertainty.engine import uncertainty_engine
from backend.app.extreme_events.detector import extreme_event_detector
from backend.app.verification.verifier import verification_engine
from backend.app.utils.logger import logger

router = APIRouter()

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    models = system_config.get("models", [])
    model_labels = [f"{m.get('name')} ({m.get('type')})" for m in models]
    return {
        "status": "healthy",
        "system": system_config.get("system", {}).get("name", "SANGAM"),
        "version": system_config.get("system", {}).get("version", "1.0.0"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "providers_available": [
            "OpenMeteoProvider (Live)",
            "BFSProvider (Indian NWP 6km Architecture)",
            "DemoProvider (Offline/Simulated)"
        ],
        "models_integrated": model_labels
    }

@router.get("/locations")
async def list_locations() -> List[Dict[str, Any]]:
    """Returns preset meteorological monitoring locations across India."""
    return system_config.get("locations", [])

@router.get("/models")
async def list_models() -> List[Dict[str, Any]]:
    """Returns metadata for all integrated NWP, AI, and Ensemble weather models."""
    return system_config.get("models", [])

VALIDATED_MODEL_IDS = {"ecmwf_ifs", "noaa_gfs", "dwd_icon"}

@router.get("/forecast", response_model=ForecastResponse)
async def get_forecast(
    lat: float = Query(28.6139, ge=-90.0, le=90.0, description="Latitude"),
    lon: float = Query(77.2090, ge=-180.0, le=180.0, description="Longitude"),
    lead_time: int = Query(24, ge=1, le=168, description="Forecast lead time in hours (1-168h)"),
    mode: str = Query("auto", description="Data mode: 'auto' (live with fallback), 'live', 'demo'"),
    variable: str = Query("rainfall", description="Primary blending target variable")
) -> ForecastResponse:
    """
    Primary SANGAM end-to-end pipeline endpoint:
    Data Ingestion -> Track Separation -> Feature Extraction -> Regime Classification ->
    Dynamic Weighting Engine -> Forecast Blending -> Uncertainty -> Extreme Events.

    STRICT VALIDATION CONTRACT:
    The authoritative SANGAM multi-model blend uses exclusively the Validated Track:
    ECMWF IFS + NOAA GFS + DWD ICON.
    Extended models (BharatFS, AIFS, HGEFS) are integrated in the Provider Registry
    for architecture display, operational proxy, and spread assessment, but do not
    alter the quantitative benchmark blend.
    """
    var_str = str(variable.default if hasattr(variable, 'default') else variable)
    loc_meta = get_location_by_coords(lat, lon)
    location = LocationInfo(
        id=loc_meta.get("id"),
        name=loc_meta.get("name"),
        state=loc_meta.get("state"),
        region=loc_meta.get("region"),
        lat=lat,
        lon=lon,
        elevation_m=loc_meta.get("elevation_m", 100.0)
    )

    # 1. Ingestion: multi-model forecasts + atmospheric state
    all_forecasts, atm_state, data_source, skills = await provider_manager.get_forecast_and_state(
        lat=lat, lon=lon, lead_time_hours=lead_time, forced_mode=mode
    )

    # 2. Strict Track Separation: VALIDATED BLENDING TRACK vs EXTENDED PROVIDER REGISTRY
    validated_forecasts = [f for f in all_forecasts if f.model_id in VALIDATED_MODEL_IDS]
    extended_forecasts = [f for f in all_forecasts if f.model_id not in VALIDATED_MODEL_IDS]

    # Blending operates strictly over the 3 validated benchmark models
    blending_forecasts = validated_forecasts if validated_forecasts else all_forecasts

    # 3. Weather Regime Classification
    regime = WeatherRegimeClassifier.classify(atm_state, blending_forecasts)

    # 4. Feature Extraction & Disagreement calculation (calculated on validated track)
    features, disagreement = FeatureEngineer.extract_features(
        location=location,
        lead_time_hours=lead_time,
        atm_state=atm_state,
        forecasts=blending_forecasts,
        historical_skills=skills,
        regime=regime
    )

    # 5. AI Weighting Engine (VALIDATED BLEND ONLY: IFS + GFS + ICON)
    weights, explainability = weighting_engine.calculate_weights(
        features=features,
        forecasts=blending_forecasts,
        regime=regime,
        variable=var_str
    )

    # 6. Multi-Model Forecast Blending & Baseline comparisons (VALIDATED BLEND ONLY)
    blended_forecast, baselines = blender.blend(
        forecasts=blending_forecasts,
        weights=weights,
        historical_skills=skills
    )

    # 7. Uncertainty Quantification
    uncertainty = uncertainty_engine.calculate_uncertainty(
        forecasts=blending_forecasts,
        blended_forecast=blended_forecast,
        weights=weights,
        disagreement=disagreement,
        lead_time_hours=lead_time
    )

    # 8. Extreme Event Early Guidance
    extreme_alerts = extreme_event_detector.detect_events(
        blended_forecast=blended_forecast,
        forecasts=blending_forecasts,
        disagreement=disagreement,
        location=location,
        lead_time_hours=lead_time
    )

    target_time = (datetime.now(timezone.utc) + timedelta(hours=lead_time)).isoformat()

    # Ordered models: Validated Track first, then Extended Provider Registry
    ordered_forecasts = validated_forecasts + extended_forecasts

    return ForecastResponse(
        location=location,
        lead_time=lead_time,
        target_timestamp=target_time,
        data_source=data_source,
        weather_regime=regime,
        current_atmospheric_state=atm_state,
        model_forecasts=ordered_forecasts,
        weights=weights,
        blended_forecast=blended_forecast,
        baselines=baselines,
        uncertainty=uncertainty,
        extreme_events=extreme_alerts,
        explainability=explainability,
        system_metadata={
            "disagreement_index": disagreement.disagreement_index,
            "precip_spread_max_min": disagreement.precip_spread_max_min,
            "pipeline_version": "1.0-alpha",
            "blending_algorithm": "Dynamic Softmax ML Gradient Attribution",
            "validated_track_models": [f.model_id for f in validated_forecasts],
            "extended_registry_models": [f.model_id for f in extended_forecasts],
            "blend_policy": "VALIDATED_TRACK_ONLY (IFS + GFS + ICON)"
        }
    )

@router.get("/weights", response_model=ModelReliabilityWeights)
async def get_weights_only(
    lat: float = Query(28.6139, ge=-90.0, le=90.0),
    lon: float = Query(77.2090, ge=-180.0, le=180.0),
    lead_time: int = Query(24, ge=1, le=168),
    mode: str = Query("auto")
) -> ModelReliabilityWeights:
    """Returns only the dynamic weights for a location and lead time."""
    resp = await get_forecast(lat=lat, lon=lon, lead_time=lead_time, mode=mode)
    return resp.weights

@router.get("/uncertainty", response_model=UncertaintyMetrics)
async def get_uncertainty_only(
    lat: float = Query(28.6139, ge=-90.0, le=90.0),
    lon: float = Query(77.2090, ge=-180.0, le=180.0),
    lead_time: int = Query(24, ge=1, le=168),
    mode: str = Query("auto")
) -> UncertaintyMetrics:
    """Returns only the quantified uncertainty metrics."""
    resp = await get_forecast(lat=lat, lon=lon, lead_time=lead_time, mode=mode)
    return resp.uncertainty

@router.get("/extremes", response_model=List[ExtremeEventAlert])
async def get_extremes(
    lat: Optional[float] = Query(None, ge=-90.0, le=90.0),
    lon: Optional[float] = Query(None, ge=-180.0, le=180.0),
    lead_time: int = Query(24, ge=1, le=168),
    mode: str = Query("auto")
) -> List[ExtremeEventAlert]:
    """
    Returns detected extreme events for a specific coordinate,
    or scans all preset locations across India if lat/lon are omitted.
    """
    if lat is not None and lon is not None:
        resp = await get_forecast(lat=lat, lon=lon, lead_time=lead_time, mode=mode)
        return resp.extreme_events

    # Scan all preset locations across India
    all_alerts: List[ExtremeEventAlert] = []
    preset_locations = system_config.get("locations", [])
    for loc in preset_locations:
        try:
            resp = await get_forecast(lat=loc["lat"], lon=loc["lon"], lead_time=lead_time, mode=mode)
            all_alerts.extend(resp.extreme_events)
        except Exception as e:
            logger.error(f"Failed scanning extremes for {loc.get('name')}: {e}")
    return all_alerts

@router.get("/verification")
async def get_verification(
    dataset: str = Query("real", description="Evaluation dataset track: 'real' (ERA5 Reanalysis) or 'synthetic' (PoC benchmark)"),
    region: str = Query("All India", description="Region or state name"),
    lead_time: int = Query(24, ge=1, le=168, description="Lead time in hours")
) -> Dict[str, Any]:
    """
    Returns scientific verification metrics and rankings comparing SANGAM to individual models.
    Supports ?dataset=real (Track B: Real Historical) and ?dataset=synthetic (Track A: Synthetic PoC).
    """
    return verification_engine.get_verification_report(
        dataset=dataset,
        region=region,
        lead_time_hours=lead_time
    )

@router.get("/lead-time-analysis")
async def get_lead_time_analysis() -> Dict[str, Any]:
    """
    Returns empirical out-of-sample lead-time, regional, and weather-regime breakdown
    from data/processed/lead_time_analysis.json on the real held-out test partition.
    """
    candidates = [
        Path("backend/data/processed/lead_time_analysis.json"),
        Path("data/processed/lead_time_analysis.json"),
        Path(__file__).resolve().parent.parent.parent / "data" / "processed" / "lead_time_analysis.json",
        Path(__file__).resolve().parent.parent.parent.parent / "data" / "processed" / "lead_time_analysis.json"
    ]
    for p in candidates:
        if p.exists():
            with open(p, "r") as f:
                return json.load(f)
    raise HTTPException(status_code=404, detail="Lead time analysis data not found. Run scripts/analyze_lead_time_and_regimes.py first.")

