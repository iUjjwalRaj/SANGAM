import pytest
from backend.app.models.schemas import (
    LocationInfo,
    AtmosphericState,
    SingleModelForecast,
    ModelReliabilityWeights
)

def test_location_schema():
    loc = LocationInfo(name="Delhi", lat=28.6139, lon=77.2090, elevation_m=216)
    assert loc.name == "Delhi"
    assert loc.lat == 28.6139
    
    with pytest.raises(ValueError):
        LocationInfo(lat=95.0, lon=77.0)

def test_atmospheric_state_schema():
    state = AtmosphericState(
        temperature=32.5,
        humidity=75.0,
        pressure=1008.0,
        wind_speed=15.0,
        precipitation=5.0
    )
    assert state.temperature == 32.5
    assert state.humidity == 75.0
    
    with pytest.raises(ValueError):
        AtmosphericState(
            temperature=30.0,
            humidity=120.0, # invalid > 100
            pressure=1000.0,
            wind_speed=10.0
        )

def test_model_weights_validation():
    # Valid weights summing to 1.0
    weights = ModelReliabilityWeights(
        variable="rainfall",
        weights={"ecmwf_ifs": 0.35, "ecmwf_aifs": 0.35, "noaa_gfs": 0.20, "ensemble": 0.10}
    )
    assert sum(weights.weights.values()) == 1.0

    # Invalid weights sum
    with pytest.raises(ValueError):
        ModelReliabilityWeights(
            variable="rainfall",
            weights={"ecmwf_ifs": 0.2, "noaa_gfs": 0.2}
        )
