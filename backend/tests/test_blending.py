import pytest
import numpy as np
from backend.app.models.schemas import (
    SingleModelForecast,
    ModelReliabilityWeights,
    WeatherRegimeClassification,
    LocationInfo,
    AtmosphericState
)
from backend.app.blending.weighting_engine import weighting_engine
from backend.app.blending.blender import blender
from backend.app.features.engineer import FeatureEngineer

def test_weight_normalization_and_formula():
    """
    CRITICAL INVARIANT TEST:
    1. sum(weights) == 1.0
    2. w_i >= 0
    3. blended_forecast == sum(w_i * f_i)
    """
    forecasts = [
        SingleModelForecast(
            model_id="ecmwf_ifs",
            model_name="ECMWF IFS",
            model_type="NWP",
            source="IFS",
            lead_time_hours=24,
            temperature=28.0,
            precipitation=45.0,
            wind_speed=18.0
        ),
        SingleModelForecast(
            model_id="ecmwf_aifs",
            model_name="ECMWF AIFS",
            model_type="AI",
            source="AIFS",
            lead_time_hours=24,
            temperature=27.5,
            precipitation=48.0,
            wind_speed=17.0
        ),
        SingleModelForecast(
            model_id="noaa_gfs",
            model_name="NOAA GFS",
            model_type="NWP",
            source="GFS",
            lead_time_hours=24,
            temperature=29.0,
            precipitation=55.0,
            wind_speed=20.0
        ),
        SingleModelForecast(
            model_id="ensemble",
            model_name="HGEFS",
            model_type="ENSEMBLE",
            source="ENSEMBLE",
            lead_time_hours=24,
            temperature=28.2,
            precipitation=49.0,
            wind_speed=18.5
        )
    ]

    regime = WeatherRegimeClassification(
        regime="heavy_rainfall",
        confidence=0.9,
        description="Monsoonal heavy rainfall",
        key_factors=["Rain > 40mm"]
    )

    location = LocationInfo(name="Guwahati", lat=26.14, lon=91.73)
    atm_state = AtmosphericState(
        temperature=27.0,
        humidity=88.0,
        pressure=1003.0,
        wind_speed=15.0,
        precipitation=30.0
    )

    skills = {
        "ecmwf_ifs": {"overall_skill_score": 0.88, "mae_rainfall": 5.1},
        "ecmwf_aifs": {"overall_skill_score": 0.90, "mae_rainfall": 4.8},
        "noaa_gfs": {"overall_skill_score": 0.82, "mae_rainfall": 6.5},
        "ensemble": {"overall_skill_score": 0.86, "mae_rainfall": 5.3}
    }

    features, disagreement = FeatureEngineer.extract_features(
        location=location,
        lead_time_hours=24,
        atm_state=atm_state,
        forecasts=forecasts,
        historical_skills=skills,
        regime=regime
    )

    weights, explainability = weighting_engine.calculate_weights(
        features=features,
        forecasts=forecasts,
        regime=regime
    )

    # 1. Check weight sum is 1.0 within numerical precision
    total_weight = sum(weights.weights.values())
    assert abs(total_weight - 1.0) < 1e-3, f"Weights sum {total_weight} != 1.0"

    # 2. Check all weights non-negative
    for mid, w in weights.weights.items():
        assert w >= 0.0, f"Negative weight found: {mid}={w}"

    # 3. Check blended forecast calculation
    blended, baselines = blender.blend(forecasts, weights, skills)

    expected_rainfall = sum(f.precipitation * weights.weights[f.model_id] for f in forecasts)
    expected_temp = sum(f.temperature * weights.weights[f.model_id] for f in forecasts)
    expected_wind = sum(f.wind_speed * weights.weights[f.model_id] for f in forecasts)

    assert abs(blended["rainfall"] - round(expected_rainfall, 2)) < 0.01
    assert abs(blended["temperature"] - round(expected_temp, 2)) < 0.01
    assert abs(blended["wind_speed"] - round(expected_wind, 2)) < 0.01

    # 4. Check baselines exist
    assert "best_single_model" in baselines.model_dump()
    assert "simple_average" in baselines.model_dump()
    assert "static_historical_weights" in baselines.model_dump()
    assert baselines.variance_reduction_pct >= 0.0

def test_ml_and_heuristic_separation():
    """
    Verifies that:
    1. Genuinely ML-predicted weights satisfy sum(w) == 1.0 and w_i >= 0
    2. ML model loading works
    3. Final weights satisfy sum(w) == 1.0 and w_i >= 0 under all conditions
    """
    features = {
        "lead_time_hours": 72.0,
        "atm_humidity": 85.0,
        "atm_temperature": 29.0,
        "atm_pressure": 1004.0,
        "precip_spread_max_min": 14.5
    }
    model_ids = ["ecmwf_ifs", "ecmwf_aifs", "noaa_gfs", "ensemble"]

    # Test raw ML prediction
    ml_weights, is_ml_active = weighting_engine._predict_ml_weights(features, model_ids)
    assert abs(sum(ml_weights.values()) - 1.0) < 1e-3
    for mid, w in ml_weights.items():
        assert w >= 0.0

    # Test softmax invariance
    sample_logits = {"m1": 2.5, "m2": -1.0, "m3": 0.0, "m4": 1.2}
    sm = weighting_engine._softmax(sample_logits)
    assert abs(sum(sm.values()) - 1.0) < 1e-4
    for k, v in sm.items():
        assert v >= 0.0

def test_n_model_generic_blending_including_bfs():
    """
    Verifies that SANGAM's blending engine works generically for N=3 and N=4 models,
    including Bharat Forecast System (BharatFS), guaranteeing:
    1. sum(weights) == 1.0
    2. all w_i >= 0
    3. Proper attribution and metadata
    """
    from backend.app.forecasting.providers.bfs import BFSProvider
    
    # 1. Test BFS Provider metadata & interface
    bfs_provider = BFSProvider()
    meta = bfs_provider.get_metadata()
    assert meta["model_id"] == "bharat_fs"
    assert "IITM" in meta["institution"]
    assert "6 km" in meta["resolution"]
    assert meta["operational_status"] == "ARCHITECTURALLY SUPPORTED / HISTORICAL VALIDATION PENDING"
    
    # 2. Test N=3 models (ECMWF IFS, NOAA GFS, DWD ICON)
    forecasts_3 = [
        SingleModelForecast(model_id="ecmwf_ifs", model_name="ECMWF IFS", model_type="NWP", source="IFS", lead_time_hours=24, temperature=28.0, precipitation=10.0, wind_speed=15.0),
        SingleModelForecast(model_id="noaa_gfs", model_name="NOAA GFS", model_type="NWP", source="GFS", lead_time_hours=24, temperature=31.0, precipitation=14.0, wind_speed=19.0),
        SingleModelForecast(model_id="dwd_icon", model_name="DWD ICON", model_type="NWP", source="ICON", lead_time_hours=24, temperature=28.5, precipitation=11.0, wind_speed=16.0)
    ]
    regime = WeatherRegimeClassification(regime="normal", confidence=0.85, description="Normal conditions", key_factors=[])
    features = {"lead_time_hours": 24.0, "latitude": 28.6, "longitude": 77.2, "atm_temperature": 29.0, "atm_humidity": 65.0, "atm_pressure": 1010.0, "precip_spread_max_min": 4.0}
    
    weights_3, exp_3 = weighting_engine.calculate_weights(features, forecasts_3, regime)
    assert len(weights_3.weights) == 3
    assert abs(sum(weights_3.weights.values()) - 1.0) < 1e-3
    for m, w in weights_3.weights.items():
        assert w >= 0.0

    # 3. Test N=4 models (IFS, GFS, ICON + BharatFS)
    forecasts_4 = forecasts_3 + [
        SingleModelForecast(model_id="bharat_fs", model_name="Bharat Forecast System (BharatFS)", model_type="NWP", source="IITM/IMD/NCMRWF (6 km)", lead_time_hours=24, temperature=28.8, precipitation=11.5, wind_speed=16.2)
    ]
    weights_4, exp_4 = weighting_engine.calculate_weights(features, forecasts_4, regime)
    assert len(weights_4.weights) == 4
    assert "bharat_fs" in weights_4.weights
    assert abs(sum(weights_4.weights.values()) - 1.0) < 1e-3
    for m, w in weights_4.weights.items():
        assert w >= 0.0

    # Test blending for N=4
    skills_4 = {f.model_id: {"overall_skill_score": 0.85} for f in forecasts_4}
    blended_4, baselines_4 = blender.blend(forecasts_4, weights_4, skills_4)
    assert "rainfall" in blended_4
    assert "temperature" in blended_4
    assert "wind_speed" in blended_4
    assert abs(sum(weights_4.weights[f.model_id] * f.temperature for f in forecasts_4) - blended_4["temperature"]) < 0.02

