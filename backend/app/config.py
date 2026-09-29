import os
from pathlib import Path
from typing import Dict, Any, List, Union
import yaml
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "SANGAM"
    app_env: str = "development"
    api_port: int = 8000
    api_host: str = "0.0.0.0"
    cors_origins: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    default_data_mode: str = "auto" # "auto", "live", "demo"
    open_meteo_base_url: str = "https://api.open-meteo.com/v1"
    open_meteo_ensemble_url: str = "https://ensemble-api.open-meteo.com/v1"

    @field_validator("api_port", mode="before")
    @classmethod
    def assemble_api_port(cls, v: Any) -> int:
        port_env = os.environ.get("PORT")
        if port_env:
            try:
                return int(port_env)
            except (ValueError, TypeError):
                pass
        return int(v) if v is not None else 8000

    @field_validator("cors_origins", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    import json
                    return json.loads(v)
                except Exception:
                    pass
            return [item.strip() for item in v.split(",") if item.strip()]
        elif isinstance(v, list):
            return v
        return []

settings = Settings()

def load_yaml(file_path: Path) -> Dict[str, Any]:
    if not file_path.exists():
        return {}
    with open(file_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}

SETTINGS_YAML_PATH = BASE_DIR / "config" / "settings.yaml"
EXTREMES_YAML_PATH = BASE_DIR / "config" / "extreme_events.yaml"
HEURISTICS_YAML_PATH = BASE_DIR / "config" / "heuristics.yaml"

system_config = load_yaml(SETTINGS_YAML_PATH)
extreme_events_config = load_yaml(EXTREMES_YAML_PATH)
heuristics_config = load_yaml(HEURISTICS_YAML_PATH)

def get_location_by_coords(lat: float, lon: float, tolerance: float = 0.5) -> Dict[str, Any]:
    locations = system_config.get("locations", [])
    for loc in locations:
        if abs(loc["lat"] - lat) < tolerance and abs(loc["lon"] - lon) < tolerance:
            return loc
    return {
        "id": f"loc_{lat:.2f}_{lon:.2f}",
        "name": f"Location ({lat:.2f}°N, {lon:.2f}°E)",
        "state": "Custom Region",
        "region": "Custom Coordinates",
        "lat": lat,
        "lon": lon,
        "elevation_m": 100.0
    }
