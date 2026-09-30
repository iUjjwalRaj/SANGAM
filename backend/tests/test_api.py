import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "SANGAM" in data["system"]

def test_api_locations():
    response = client.get("/api/locations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 7
    names = [loc["name"] for loc in data]
    assert "New Delhi" in names
    assert "Guwahati" in names
    assert "Mumbai" in names

def test_api_models():
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 6
    
    # 1. Verify complete model membership
    model_ids = [m["id"] for m in data]
    expected_models = ["ecmwf_ifs", "ecmwf_aifs", "noaa_gfs", "dwd_icon", "ensemble", "bharat_fs"]
    for expected in expected_models:
        assert expected in model_ids, f"Missing model: {expected}"
    
    # 2. Verify validation status distinctions and tracks
    models_by_id = {m["id"]: m for m in data}
    assert "HISTORICALLY VALIDATED (Track B)" in models_by_id["ecmwf_ifs"]["validation_status"]
    assert "HISTORICALLY VALIDATED (Track B)" in models_by_id["noaa_gfs"]["validation_status"]
    assert "HISTORICALLY VALIDATED (Track B)" in models_by_id["dwd_icon"]["validation_status"]
    assert "OPERATIONAL PROXY" in models_by_id["ecmwf_aifs"]["validation_status"]
    assert "REGISTERED ENSEMBLE" in models_by_id["ensemble"]["validation_status"]

    # Verify track taxonomy: Validated Track vs Extended Provider Registry
    assert models_by_id["ecmwf_ifs"]["track"] == "VALIDATED SANGAM TRACK"
    assert models_by_id["noaa_gfs"]["track"] == "VALIDATED SANGAM TRACK"
    assert models_by_id["dwd_icon"]["track"] == "VALIDATED SANGAM TRACK"
    assert models_by_id["bharat_fs"]["track"] == "EXTENDED PROVIDER REGISTRY"
    assert models_by_id["ecmwf_aifs"]["track"] == "EXTENDED PROVIDER REGISTRY"
    assert models_by_id["ensemble"]["track"] == "EXTENDED PROVIDER REGISTRY"
    
    # 3. Verify Bharat Forecast System (BharatFS) provenance and citations
    bfs = models_by_id["bharat_fs"]
    assert "Bharat Forecast System" in bfs["name"]
    assert "ARCHITECTURALLY SUPPORTED / HISTORICAL VALIDATION PENDING" == bfs["validation_status"]
    assert bfs["resolution"] == "6 km"
    assert "IITM" in bfs["institution"]
    assert "Mission Mausam" in bfs["mission"]
    assert len(bfs["citations"]) >= 3
    assert any("2053890" in c.get("release_id", "") for c in bfs["citations"])
    assert any("2054238" in c.get("release_id", "") for c in bfs["citations"])


def test_api_forecast_pipeline():
    response = client.get("/api/forecast?lat=28.6139&lon=77.2090&lead_time=24&mode=demo")
    assert response.status_code == 200
    data = response.json()
    
    assert data["location"]["name"] == "New Delhi"
    assert data["data_source"] == "DEMO/SIMULATED"
    assert "blended_forecast" in data
    assert "rainfall" in data["blended_forecast"]
    assert "weights" in data
    assert "weights" in data["weights"]
    
    # Mathematical verification: Exactly IFS, GFS, ICON in validated blend
    weights = data["weights"]["weights"]
    assert set(weights.keys()) == {"ecmwf_ifs", "noaa_gfs", "dwd_icon"}, f"Unexpected models in weights: {weights.keys()}"
    assert abs(sum(weights.values()) - 1.0) < 1e-3
    assert all(w >= 0.0 for w in weights.values())
    
    # Confirm Extended Registry models are excluded from the validated blend weights
    assert "bharat_fs" not in weights
    assert "ecmwf_aifs" not in weights
    assert "ensemble" not in weights
    
    # Metadata audit
    meta = data["system_metadata"]
    assert meta["validated_track_models"] == ["ecmwf_ifs", "noaa_gfs", "dwd_icon"]
    assert "bharat_fs" in meta["extended_registry_models"]
    assert meta["blend_policy"] == "VALIDATED_TRACK_ONLY (IFS + GFS + ICON)"
    
    # Baselines
    assert "baselines" in data
    assert "sangam_dynamic_blended" in data["baselines"]
    
    # Explainability
    assert len(data["explainability"]) == 3  # Exactly 3 validated models explained
    assert "primary_reasons" in data["explainability"][0]

def test_api_forecast_live_or_auto():
    # 1. Test auto mode (should succeed and return valid forecast response)
    response_auto = client.get("/api/forecast?lat=28.6139&lon=77.2090&lead_time=24&mode=auto")
    assert response_auto.status_code == 200
    data_auto = response_auto.json()
    assert data_auto["data_source"] in ["LIVE", "DEMO/SIMULATED"]
    assert len(data_auto["model_forecasts"]) == 6

    # 2. Test live mode directly
    response_live = client.get("/api/forecast?lat=28.6139&lon=77.2090&lead_time=24&mode=live")
    if response_live.status_code == 200:
        data_live = response_live.json()
        assert data_live["data_source"] == "LIVE"
    else:
        assert response_live.status_code == 503
        assert "Live meteorological provider" in response_live.json().get("detail", "")

def test_api_forecast_mode_fallback_contract(monkeypatch):
    """
    Contract verification:
    When the live provider fails:
    - mode=live MUST NOT silently fall back to demo; it must return HTTP 503.
    - mode=auto MUST gracefully fall back to DemoProvider and return HTTP 200 with DEMO/SIMULATED.
    """
    from backend.app.forecasting.provider_manager import provider_manager

    async def mock_failing_get_forecast(*args, **kwargs):
        raise ConnectionError("Mocked network drop to upstream Open-Meteo gateway")

    monkeypatch.setattr(provider_manager.live_provider, "get_forecast", mock_failing_get_forecast)

    # mode=live must fail with 503
    res_live = client.get("/api/forecast?lat=28.6139&lon=77.2090&lead_time=24&mode=live")
    assert res_live.status_code == 503
    assert "Live meteorological provider" in res_live.json().get("detail", "")

    # mode=auto must fall back to DEMO/SIMULATED with 200
    res_auto = client.get("/api/forecast?lat=28.6139&lon=77.2090&lead_time=24&mode=auto")
    assert res_auto.status_code == 200
    data_auto = res_auto.json()
    assert data_auto["data_source"] == "DEMO/SIMULATED"
    assert len(data_auto["model_forecasts"]) == 6

def test_open_meteo_base_url_configuration(monkeypatch):
    """Verify that OPEN_METEO_BASE_URL can be configured via environment variable."""
    from backend.app.config import Settings
    from backend.app.forecasting.open_meteo import OpenMeteoProvider

    # Default is the official api.open-meteo.com/v1 endpoint
    default_settings = Settings()
    assert default_settings.open_meteo_base_url == "https://api.open-meteo.com/v1"

    # Configurable override via environment variable
    custom_proxy_url = "https://sangam.feminismindia.com/provider/open-meteo/v1"
    monkeypatch.setenv("OPEN_METEO_BASE_URL", custom_proxy_url)
    custom_settings = Settings()
    assert custom_settings.open_meteo_base_url == custom_proxy_url

    # OpenMeteoProvider adopts the configured base_url
    provider = OpenMeteoProvider(base_url=custom_settings.open_meteo_base_url)
    assert provider.base_url == custom_proxy_url

def test_api_verification():
    # Test Real Dataset Track (Track B)
    response_real = client.get("/api/verification?dataset=real&lead_time=24")
    assert response_real.status_code == 200
    data_real = response_real.json()
    assert data_real["dataset_type"] == "REAL_HISTORICAL"
    assert data_real["reference_type"] == "REFERENCE_REANALYSIS"
    assert "rankings" in data_real
    assert "locations" in data_real
    assert len(data_real["locations"]) >= 5
    assert "lead_times" in data_real
    assert "sample_count" in data_real
    assert data_real["sample_count"] > 1000

    # Test Synthetic Dataset Track (Track A)
    response_synth = client.get("/api/verification?dataset=synthetic&lead_time=24")
    assert response_synth.status_code == 200
    data_synth = response_synth.json()
    assert data_synth["dataset_type"] == "SYNTHETIC_BENCHMARK"
    assert data_synth["reference_type"] == "SYNTHETIC_PROXY"
    assert data_synth["is_synthetic"] is True
    assert "sangam_rmse_improvement_pct" in data_synth

def test_api_lead_time_analysis():
    response = client.get("/api/lead-time-analysis")
    assert response.status_code == 200
    data = response.json()
    assert data["reference_type"] == "REFERENCE_REANALYSIS"
    assert "lead_time_metrics" in data
    assert "T+24h" in data["lead_time_metrics"]
    assert "T+48h" in data["lead_time_metrics"]
    assert "T+72h" in data["lead_time_metrics"]
    assert "regional_analysis" in data
    assert "regime_analysis" in data
    assert "bootstrap_robustness" in data
    assert "weight_stability" in data
    assert data["sample_counts"]["total_test_instances"] == 1800

def test_api_weights():
    response = client.get("/api/weights?lat=28.6139&lon=77.2090&lead_time=24&mode=demo")
    assert response.status_code == 200
    data = response.json()
    assert "weights" in data
    assert abs(sum(data["weights"].values()) - 1.0) < 1e-3

def test_api_uncertainty():
    response = client.get("/api/uncertainty?lat=28.6139&lon=77.2090&lead_time=24&mode=demo")
    assert response.status_code == 200
    data = response.json()
    assert "confidence_level" in data
    assert "rainfall_spread" in data

def test_api_extremes():
    response = client.get("/api/extremes?lat=28.6139&lon=77.2090&lead_time=24&mode=demo")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


