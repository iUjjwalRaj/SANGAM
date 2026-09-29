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
    
    # 2. Verify validation status distinctions
    models_by_id = {m["id"]: m for m in data}
    assert "HISTORICALLY VALIDATED (Track B)" in models_by_id["ecmwf_ifs"]["validation_status"]
    assert "HISTORICALLY VALIDATED (Track B)" in models_by_id["noaa_gfs"]["validation_status"]
    assert "HISTORICALLY VALIDATED (Track B)" in models_by_id["dwd_icon"]["validation_status"]
    assert "OPERATIONAL PROXY" in models_by_id["ecmwf_aifs"]["validation_status"]
    
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
    
    # Mathematical verification
    weights = data["weights"]["weights"]
    assert abs(sum(weights.values()) - 1.0) < 1e-3
    
    # Baselines
    assert "baselines" in data
    assert "sangam_dynamic_blended" in data["baselines"]
    
    # Explainability
    assert len(data["explainability"]) > 0
    assert "primary_reasons" in data["explainability"][0]

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


