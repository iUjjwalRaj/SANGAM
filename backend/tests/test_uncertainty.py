from backend.app.models.schemas import SingleModelForecast, ModelDisagreement, ModelReliabilityWeights
from backend.app.uncertainty.engine import uncertainty_engine

def test_uncertainty_quantification():
    forecasts = [
        SingleModelForecast(
            model_id="ecmwf_ifs",
            model_name="ECMWF IFS",
            model_type="NWP",
            source="IFS",
            lead_time_hours=48,
            temperature=28.0,
            precipitation=30.0,
            wind_speed=15.0
        ),
        SingleModelForecast(
            model_id="ecmwf_aifs",
            model_name="ECMWF AIFS",
            model_type="AI",
            source="AIFS",
            lead_time_hours=48,
            temperature=27.0,
            precipitation=34.0,
            wind_speed=14.0
        ),
        SingleModelForecast(
            model_id="noaa_gfs",
            model_name="NOAA GFS",
            model_type="NWP",
            source="GFS",
            lead_time_hours=48,
            temperature=29.0,
            precipitation=38.0,
            wind_speed=17.0
        ),
        SingleModelForecast(
            model_id="ensemble",
            model_name="HGEFS",
            model_type="ENSEMBLE",
            source="ENSEMBLE",
            lead_time_hours=48,
            temperature=28.0,
            precipitation=33.0,
            wind_speed=15.0
        )
    ]
    
    blended = {"rainfall": 33.2, "temperature": 27.9, "wind_speed": 15.1}
    weights = ModelReliabilityWeights(
        variable="rainfall",
        weights={"ecmwf_ifs": 0.3, "ecmwf_aifs": 0.4, "noaa_gfs": 0.2, "ensemble": 0.1}
    )
    disagreement = ModelDisagreement(
        precip_std_dev=3.2,
        precip_spread_max_min=8.0,
        temp_std_dev=0.8,
        wind_std_dev=1.2,
        ensemble_spread=3.5,
        disagreement_index=0.25
    )
    
    unc = uncertainty_engine.calculate_uncertainty(
        forecasts=forecasts,
        blended_forecast=blended,
        weights=weights,
        disagreement=disagreement,
        lead_time_hours=48
    )
    
    assert unc.rainfall_spread > 0.0
    assert unc.confidence_level in ["High", "Medium", "Low"]
    assert 0.0 <= unc.confidence_score <= 1.0
    assert unc.rainfall_range["lower"] <= blended["rainfall"] <= unc.rainfall_range["upper"]
