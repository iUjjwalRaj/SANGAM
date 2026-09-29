# SANGAM REST API Reference

The backend provides a high-throughput, typed REST API using FastAPI.

**Base URL:** `http://localhost:8000/api`  
**Interactive Docs:** `http://localhost:8000/docs`

---

### `GET /health`
Returns system status, active providers, and integrated models.

### `GET /locations`
Returns preset monitoring locations across India (e.g. New Delhi, Guwahati, Mumbai, Kolkata, Chennai, Bengaluru, Leh).

### `GET /models`
Returns integrated NWP, AI, and ensemble weather models metadata.

### `GET /forecast`
Executes the full end-to-end multi-model blending pipeline.

**Query Parameters:**
- `lat` (float, required): Latitude ($-90.0$ to $90.0$)
- `lon` (float, required): Longitude ($-180.0$ to $180.0$)
- `lead_time` (int, default: 24): Forecast lead time in hours ($1$ to $168$)
- `mode` (string, default: "auto"): `"auto"`, `"live"`, or `"demo"`
- `variable` (string, default: "rainfall"): Target blending variable

**Response Payload:**
```json
{
  "location": {
    "name": "Guwahati",
    "lat": 26.1445,
    "lon": 91.7362,
    "region": "Northeast India (Brahmaputra Valley)"
  },
  "lead_time": 24,
  "target_timestamp": "2026-09-30T16:00:00Z",
  "data_source": "DEMO/SIMULATED",
  "weather_regime": {
    "regime": "heavy_rainfall",
    "confidence": 0.88,
    "description": "Active convective / monsoonal precipitation regime...",
    "key_factors": ["Max model rainfall prediction: 48.0 mm"]
  },
  "model_forecasts": [
    {
      "model_id": "ecmwf_ifs",
      "model_name": "ECMWF IFS",
      "model_type": "NWP",
      "precipitation": 44.2,
      "temperature": 27.8,
      "wind_speed": 16.5
    },
    {
      "model_id": "ecmwf_aifs",
      "model_name": "ECMWF AIFS",
      "model_type": "AI",
      "precipitation": 46.8,
      "temperature": 27.4,
      "wind_speed": 15.8
    }
  ],
  "weights": {
    "variable": "rainfall",
    "weights": {
      "ecmwf_aifs": 0.385,
      "ecmwf_ifs": 0.342,
      "ensemble": 0.165,
      "noaa_gfs": 0.108
    }
  },
  "blended_forecast": {
    "rainfall": 45.32,
    "temperature": 27.65,
    "wind_speed": 16.2
  },
  "uncertainty": {
    "rainfall_spread": 5.4,
    "confidence_level": "High",
    "confidence_score": 0.82,
    "rainfall_range": { "lower": 39.9, "upper": 50.7 }
  },
  "extreme_events": [
    {
      "event_type": "Heavy Rainfall",
      "code": "HEAVY_RAIN",
      "severity": "Moderate",
      "risk_score": 0.65
    }
  ],
  "explainability": [
    {
      "model_id": "ecmwf_aifs",
      "weight": 0.385,
      "primary_reasons": ["AIFS exhibits sharp convective edge retention in monsoonal precipitation."]
    }
  ]
}
```

### `GET /verification`
Returns operational validation comparison against independent reference reanalysis (Track B: ERA5 Reanalysis) or synthetic proof-of-concept benchmark (Track A).

### `GET /lead-time-analysis`
Returns programmatically computed out-of-sample lead-time metrics (T+24h, T+48h, T+72h), regional metrics across 5 Indian benchmark locations, weather-regime breakdown, and 95% bootstrap confidence intervals from the held-out test partition.

