from backend.app.models.schemas import LocationInfo, ModelDisagreement
from backend.app.extreme_events.detector import extreme_event_detector

def test_extreme_rainfall_detection():
    blended = {"rainfall": 125.0, "temperature": 28.0, "wind_speed": 20.0}
    loc = LocationInfo(name="Mumbai", lat=19.07, lon=72.87, region="Western Ghats")
    disagreement = ModelDisagreement(
        precip_std_dev=5.0,
        precip_spread_max_min=15.0,
        temp_std_dev=1.0,
        wind_std_dev=2.0,
        ensemble_spread=6.0,
        disagreement_index=0.4
    )
    
    alerts = extreme_event_detector.detect_events(
        blended_forecast=blended,
        forecasts=[],
        disagreement=disagreement,
        location=loc,
        lead_time_hours=24
    )
    
    assert len(alerts) >= 1
    codes = [a.code for a in alerts]
    assert "VERY_HEAVY_RAIN" in codes

def test_heatwave_detection():
    blended = {"rainfall": 0.0, "temperature": 43.5, "wind_speed": 12.0}
    loc = LocationInfo(name="Delhi", lat=28.61, lon=77.20, region="North India")
    disagreement = ModelDisagreement(
        precip_std_dev=0.0,
        precip_spread_max_min=0.0,
        temp_std_dev=0.5,
        wind_std_dev=1.0,
        ensemble_spread=0.0,
        disagreement_index=0.1
    )
    
    alerts = extreme_event_detector.detect_events(
        blended_forecast=blended,
        forecasts=[],
        disagreement=disagreement,
        location=loc,
        lead_time_hours=24
    )
    
    codes = [a.code for a in alerts]
    assert "HEATWAVE" in codes
