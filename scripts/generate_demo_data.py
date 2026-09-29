"""
Offline deterministic demo dataset generator for SANGAM.
Produces comprehensive historical and scenario evaluation records for hackathon demonstrations.
"""

import os
import json
import asyncio
from pathlib import Path
import pandas as pd
import numpy as np

# Adjust python path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.config import system_config
from backend.app.forecasting.demo_provider import DemoProvider
from backend.app.features.regime import WeatherRegimeClassifier
from backend.app.features.engineer import FeatureEngineer
from backend.app.blending.weighting_engine import weighting_engine
from backend.app.blending.blender import blender
from backend.app.uncertainty.engine import uncertainty_engine
from backend.app.extreme_events.detector import extreme_event_detector
from backend.app.models.schemas import LocationInfo

async def generate_dataset():
    print("Generating SANGAM offline demo records...")
    locations = system_config.get("locations", [])
    lead_times = [6, 12, 18, 24, 36, 48, 72, 96, 120]
    provider = DemoProvider()
    
    records = []
    
    for loc_data in locations:
        loc = LocationInfo(**loc_data)
        print(f" Processing location: {loc.name} ({loc.lat}, {loc.lon})...")
        atm_state = await provider.get_atmospheric_state(loc.lat, loc.lon)
        
        for lt in lead_times:
            forecasts, source = await provider.get_forecast(loc.lat, loc.lon, lt)
            skills = provider.get_historical_skill(loc.lat, loc.lon, lt)
            regime = WeatherRegimeClassifier.classify(atm_state, forecasts)
            
            features, disagreement = FeatureEngineer.extract_features(
                location=loc,
                lead_time_hours=lt,
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
            
            blended_forecast, baselines = blender.blend(
                forecasts=forecasts,
                weights=weights,
                historical_skills=skills
            )
            
            uncertainty = uncertainty_engine.calculate_uncertainty(
                forecasts=forecasts,
                blended_forecast=blended_forecast,
                weights=weights,
                disagreement=disagreement,
                lead_time_hours=lt
            )
            
            extremes = extreme_event_detector.detect_events(
                blended_forecast=blended_forecast,
                forecasts=forecasts,
                disagreement=disagreement,
                location=loc,
                lead_time_hours=lt
            )
            
            record = {
                "location_id": loc.id,
                "location_name": loc.name,
                "latitude": loc.lat,
                "longitude": loc.lon,
                "lead_time_hours": lt,
                "regime": regime.regime,
                "blended_rainfall": blended_forecast["rainfall"],
                "blended_temperature": blended_forecast["temperature"],
                "blended_wind": blended_forecast["wind_speed"],
                "weights_ifs": weights.weights.get("ecmwf_ifs", 0.0),
                "weights_aifs": weights.weights.get("ecmwf_aifs", 0.0),
                "weights_gfs": weights.weights.get("noaa_gfs", 0.0),
                "weights_ensemble": weights.weights.get("ensemble", 0.0),
                "confidence_score": uncertainty.confidence_score,
                "confidence_level": uncertainty.confidence_level,
                "rainfall_spread_margin": uncertainty.rainfall_spread,
                "disagreement_index": disagreement.disagreement_index,
                "extreme_alerts_count": len(extremes),
                "data_source": source
            }
            records.append(record)

    df = pd.DataFrame(records)
    out_dir = Path(__file__).resolve().parent.parent / "backend" / "data" / "demo"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    parquet_path = out_dir / "demo_forecast_archive.parquet"
    json_path = out_dir / "demo_forecast_archive.json"
    
    df.to_parquet(parquet_path, index=False)
    df.to_json(json_path, orient="records", indent=2)
    
    print(f"Successfully generated {len(records)} records!")
    print(f"Saved to: {parquet_path}")
    print(f"Saved to: {json_path}")

if __name__ == "__main__":
    asyncio.run(generate_dataset())
