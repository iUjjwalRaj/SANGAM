import math
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Tuple, Any
from backend.app.models.schemas import SingleModelForecast, AtmosphericState, DataSourceType
from backend.app.forecasting.base import WeatherModelProvider

class DemoProvider(WeatherModelProvider):
    """
    Deterministic, offline-capable weather simulation provider.
    Ensures SANGAM runs seamlessly even in zero-internet hackathon presentation environments.
    Strictly flags all output as 'DEMO/SIMULATED'.
    """

    @property
    def provider_name(self) -> str:
        return "SANGAM Deterministic Simulation Engine"

    @property
    def data_source_type(self) -> DataSourceType:
        return "DEMO/SIMULATED"

    def _get_pseudo_hash(self, key_str: str) -> float:
        """Deterministic pseudo-random float in [0, 1) based on md5 hash"""
        h = hashlib.md5(key_str.encode("utf-8")).hexdigest()
        return (int(h[:8], 16) % 10000) / 10000.0

    def _base_climatology(self, lat: float, lon: float) -> Dict[str, float]:
        """
        Derive realistic baseline weather conditions based on geographic location in India / Global:
        - High latitude / altitude (Leh ~34°N, 77°E): Colder, lower pressure
        - Coastal (Mumbai ~19°N, Chennai ~13°N): Warmer, humid, sea breeze
        - Northeast (Guwahati ~26°N, 91°E): Subtropical humid, convective rain
        - Northern plains (Delhi ~28.6°N, 77°E): High diurnal temp, continental
        """
        # Proximity to Leh (Trans-Himalayan high altitude)
        dist_leh = math.sqrt((lat - 34.15)**2 + (lon - 77.58)**2)
        # Proximity to Mumbai (Western Ghats / Konkan)
        dist_mumbai = math.sqrt((lat - 19.07)**2 + (lon - 72.87)**2)
        # Proximity to Guwahati (Brahmaputra basin)
        dist_guwahati = math.sqrt((lat - 26.14)**2 + (lon - 91.73)**2)
        # Proximity to Delhi (Gangetic Plain)
        dist_delhi = math.sqrt((lat - 28.61)**2 + (lon - 77.21)**2)

        if dist_leh < 3.0:
            return {"temp": 12.0, "humidity": 38.0, "pressure": 680.0, "wind": 15.0, "rain": 1.2}
        elif dist_guwahati < 3.0:
            return {"temp": 27.5, "humidity": 86.0, "pressure": 1004.0, "wind": 14.0, "rain": 42.0}
        elif dist_mumbai < 3.0:
            return {"temp": 30.5, "humidity": 82.0, "pressure": 1008.0, "wind": 22.0, "rain": 28.0}
        elif dist_delhi < 3.0:
            return {"temp": 34.0, "humidity": 55.0, "pressure": 1006.0, "wind": 16.0, "rain": 8.0}
        else:
            # Generic tropical/subtropical latitude decay
            temp = 32.0 - 0.45 * abs(lat - 15.0)
            pressure = 1012.0 - 0.2 * abs(lat)
            humidity = max(30.0, min(90.0, 70.0 - 0.5 * abs(lat - 15.0)))
            return {"temp": temp, "humidity": humidity, "pressure": pressure, "wind": 16.0, "rain": 12.0}

    async def get_atmospheric_state(self, lat: float, lon: float) -> AtmosphericState:
        base = self._base_climatology(lat, lon)
        noise = self._get_pseudo_hash(f"atm_{lat:.2f}_{lon:.2f}")
        
        temp = round(base["temp"] + (noise - 0.5) * 2.0, 1)
        humidity = round(max(10.0, min(99.0, base["humidity"] + (noise - 0.5) * 8.0)), 1)
        pressure = round(base["pressure"] + (noise - 0.5) * 3.0, 1)
        wind_speed = round(max(1.0, base["wind"] + (noise - 0.5) * 5.0), 1)
        precip = round(max(0.0, base["rain"] * (0.6 + 0.8 * noise)), 1)
        cloud_cover = round(max(5.0, min(100.0, (precip / 40.0) * 80.0 + noise * 20.0)), 1)
        visibility = round(max(1.0, 12.0 - (precip / 10.0) * 2.0 - (humidity / 100.0) * 3.0), 1)

        return AtmosphericState(
            temperature=temp,
            humidity=humidity,
            pressure=pressure,
            wind_speed=wind_speed,
            wind_direction=round((noise * 360.0), 1),
            precipitation=precip,
            cloud_cover=cloud_cover,
            visibility=visibility,
            timestamp=datetime.now(timezone.utc)
        )

    async def get_forecast(
        self, lat: float, lon: float, lead_time_hours: int
    ) -> Tuple[List[SingleModelForecast], DataSourceType]:
        base = self._base_climatology(lat, lon)
        
        # Lead time decay & diurnal cycles
        diurnal_phase = (lead_time_hours % 24) / 24.0 * 2.0 * math.pi
        diurnal_temp = math.sin(diurnal_phase - math.pi / 2.0) * 4.5
        lead_uncertainty_growth = 1.0 + (lead_time_hours / 120.0) * 0.4
        
        target_temp = base["temp"] + diurnal_temp
        target_rain = base["rain"] * lead_uncertainty_growth
        target_wind = base["wind"] + math.cos(diurnal_phase) * 3.0

        # Model perturbation factors reflecting operational characteristics:
        # ECMWF IFS: State-of-the-art NWP, conservative on extreme peaks, accurate synoptic temperatures
        # ECMWF AIFS: AI model, higher spatial sharpness, excellent beyond 48h, less convective dissipation
        # NOAA GFS: NWP, slightly higher rain accumulation, responsive wind fronts
        # Ensemble: Averaged consensus, dampened variance, realistic bound spread
        
        seed_key = f"{lat:.2f}_{lon:.2f}_{lead_time_hours}"
        r1 = self._get_pseudo_hash(seed_key + "_ifs")
        r2 = self._get_pseudo_hash(seed_key + "_aifs")
        r3 = self._get_pseudo_hash(seed_key + "_gfs")
        r_icon = self._get_pseudo_hash(seed_key + "_icon")
        r4 = self._get_pseudo_hash(seed_key + "_ens")

        forecasts = [
            # === VALIDATED BLENDING TRACK ===
            SingleModelForecast(
                model_id="ecmwf_ifs",
                model_name="ECMWF IFS",
                model_type="NWP",
                source="ECMWF Integrated Forecasting System (HRES 0.25°)",
                lead_time_hours=lead_time_hours,
                temperature=round(target_temp + (r1 - 0.5) * 1.4, 1),
                precipitation=round(max(0.0, target_rain * (0.92 + 0.15 * r1)), 1),
                wind_speed=round(max(2.0, target_wind + (r1 - 0.5) * 3.0), 1),
                humidity=round(max(20.0, min(98.0, base["humidity"] + (r1 - 0.5) * 6.0)), 1),
                pressure=round(base["pressure"] + (r1 - 0.5) * 2.0, 1),
                wind_direction=round((180.0 + (r1 - 0.5) * 40.0) % 360, 1)
            ),
            SingleModelForecast(
                model_id="noaa_gfs",
                model_name="NOAA GFS",
                model_type="NWP",
                source="NOAA Global Forecast System (0.25° FV3)",
                lead_time_hours=lead_time_hours,
                temperature=round(target_temp + (r3 - 0.4) * 2.0, 1),
                precipitation=round(max(0.0, target_rain * (1.08 + 0.25 * (r3 - 0.5))), 1),
                wind_speed=round(max(2.0, target_wind + (r3 - 0.5) * 4.0), 1),
                humidity=round(max(20.0, min(98.0, base["humidity"] + (r3 - 0.5) * 8.0)), 1),
                pressure=round(base["pressure"] + (r3 - 0.5) * 2.5, 1),
                wind_direction=round((180.0 + (r3 - 0.5) * 50.0) % 360, 1)
            ),
            SingleModelForecast(
                model_id="dwd_icon",
                model_name="DWD ICON",
                model_type="NWP",
                source="DWD ICON (0.25° Icosahedral Nonhydrostatic)",
                lead_time_hours=lead_time_hours,
                temperature=round(target_temp + (r_icon - 0.45) * 1.5, 1),
                precipitation=round(max(0.0, target_rain * (0.95 + 0.20 * (r_icon - 0.5))), 1),
                wind_speed=round(max(2.0, target_wind + (r_icon - 0.5) * 3.2), 1),
                humidity=round(max(20.0, min(98.0, base["humidity"] + (r_icon - 0.5) * 6.0)), 1),
                pressure=round(base["pressure"] + (r_icon - 0.5) * 2.0, 1),
                wind_direction=round((180.0 + (r_icon - 0.5) * 45.0) % 360, 1)
            ),
            # === EXTENDED PROVIDER REGISTRY ===
            SingleModelForecast(
                model_id="bharat_fs",
                model_name="Bharat Forecast System (BharatFS)",
                model_type="NWP",
                source="IITM/IMD/NCMRWF (6 km TCo Grid - Validation Pending)",
                lead_time_hours=lead_time_hours,
                temperature=round(target_temp + (self._get_pseudo_hash(seed_key + "_bfs") - 0.45) * 1.6, 1),
                precipitation=round(max(0.0, target_rain * (0.95 + 0.18 * (self._get_pseudo_hash(seed_key + "_bfs_p") - 0.45))), 1),
                wind_speed=round(max(2.0, target_wind + (self._get_pseudo_hash(seed_key + "_bfs_w") - 0.5) * 3.2), 1),
                humidity=round(max(20.0, min(98.0, base["humidity"] + (self._get_pseudo_hash(seed_key + "_bfs") - 0.5) * 5.0)), 1),
                pressure=round(base["pressure"] + (self._get_pseudo_hash(seed_key + "_bfs") - 0.5) * 1.8, 1),
                wind_direction=round((180.0 + (self._get_pseudo_hash(seed_key + "_bfs") - 0.5) * 35.0) % 360, 1)
            ),
            SingleModelForecast(
                model_id="ecmwf_aifs",
                model_name="ECMWF AIFS",
                model_type="AI",
                source="ECMWF Artificial Intelligence Forecasting System (0.25°)",
                lead_time_hours=lead_time_hours,
                temperature=round(target_temp + (r2 - 0.5) * 1.1, 1),
                precipitation=round(max(0.0, target_rain * (0.96 + 0.20 * (r2 - 0.4))), 1),
                wind_speed=round(max(2.0, target_wind + (r2 - 0.5) * 2.5), 1),
                humidity=round(max(20.0, min(98.0, base["humidity"] + (r2 - 0.5) * 5.0)), 1),
                pressure=round(base["pressure"] + (r2 - 0.5) * 1.8, 1),
                wind_direction=round((180.0 + (r2 - 0.5) * 35.0) % 360, 1)
            ),
            SingleModelForecast(
                model_id="ensemble",
                model_name="HGEFS / Global Ensemble",
                model_type="ENSEMBLE",
                source="Multi-Model Global Ensemble Mean & Spread",
                lead_time_hours=lead_time_hours,
                temperature=round(target_temp + (r4 - 0.5) * 0.9, 1),
                precipitation=round(max(0.0, target_rain * (0.98 + 0.10 * (r4 - 0.5))), 1),
                wind_speed=round(max(2.0, target_wind + (r4 - 0.5) * 2.0), 1),
                humidity=round(max(20.0, min(98.0, base["humidity"] + (r4 - 0.5) * 4.0)), 1),
                pressure=round(base["pressure"] + (r4 - 0.5) * 1.5, 1),
                wind_direction=round((180.0 + (r4 - 0.5) * 30.0) % 360, 1)
            )
        ]
        return forecasts, self.data_source_type

    def get_historical_skill(
        self, lat: float, lon: float, lead_time_hours: int, regime: str = "normal"
    ) -> Dict[str, Dict[str, float]]:
        """
        Realistic historical verification benchmark metrics (MAE, RMSE, Bias).
        Reflects documented operational verification from NCMRWF/ECMWF:
        - In convective / heavy rain regimes, AIFS and IFS have lower RMSE than single GFS.
        - At longer lead times (72h+), AI models show lower geopotential & synoptic temp error.
        - Ensemble has consistently low RMSE due to variance filtering.
        """
        lead_factor = 1.0 + (lead_time_hours / 120.0) * 0.6
        
        regime_penalty = {
            "normal": 1.0,
            "heavy_rainfall": 1.4,
            "heatwave": 1.2,
            "high_wind": 1.3,
            "dry_spell": 0.9,
            "storm_cyclonic": 1.6
        }.get(regime, 1.0)

        return {
            "ecmwf_ifs": {
                "mae_rainfall": round(5.2 * lead_factor * regime_penalty * 0.92, 2),
                "rmse_rainfall": round(8.4 * lead_factor * regime_penalty * 0.94, 2),
                "mae_temp": round(1.15 * lead_factor * 0.90, 2),
                "bias_rainfall": -0.8,
                "overall_skill_score": round(max(0.65, 0.88 - 0.0018 * lead_time_hours), 3),
                "validation_status": "HISTORICALLY VALIDATED (Track B)"
            },
            "noaa_gfs": {
                "mae_rainfall": round(6.5 * lead_factor * regime_penalty * 1.08, 2),
                "rmse_rainfall": round(10.2 * lead_factor * regime_penalty * 1.06, 2),
                "mae_temp": round(1.35 * lead_factor * 1.05, 2),
                "bias_rainfall": 1.4,
                "overall_skill_score": round(max(0.60, 0.82 - 0.0022 * lead_time_hours), 3),
                "validation_status": "HISTORICALLY VALIDATED (Track B)"
            },
            "dwd_icon": {
                "mae_rainfall": round(5.8 * lead_factor * regime_penalty * 1.02, 2),
                "rmse_rainfall": round(9.1 * lead_factor * regime_penalty * 1.01, 2),
                "mae_temp": round(1.22 * lead_factor * 0.98, 2),
                "bias_rainfall": 0.4,
                "overall_skill_score": round(max(0.62, 0.84 - 0.0020 * lead_time_hours), 3),
                "validation_status": "HISTORICALLY VALIDATED (Track B)"
            },
            "ecmwf_aifs": {
                "mae_rainfall": round(5.0 * lead_factor * regime_penalty * 0.90, 2),
                "rmse_rainfall": round(8.1 * lead_factor * regime_penalty * 0.91, 2),
                "mae_temp": round(1.05 * lead_factor * 0.88, 2),
                "bias_rainfall": 0.2,
                "overall_skill_score": round(max(0.68, 0.91 - 0.0014 * lead_time_hours), 3),
                "validation_status": "OPERATIONAL PROXY (Track B Excluded)"
            },
            "ensemble": {
                "mae_rainfall": round(5.4 * lead_factor * regime_penalty * 0.95, 2),
                "rmse_rainfall": round(8.3 * lead_factor * regime_penalty * 0.93, 2),
                "mae_temp": round(1.10 * lead_factor * 0.91, 2),
                "bias_rainfall": 0.1,
                "overall_skill_score": round(max(0.67, 0.86 - 0.0015 * lead_time_hours), 3),
                "validation_status": "REGISTERED ENSEMBLE (Not Part of Benchmark)"
            },
            "bharat_fs": {
                "mae_rainfall": 0.0,
                "rmse_rainfall": 0.0,
                "mae_temp": 0.0,
                "bias_rainfall": 0.0,
                "overall_skill_score": 0.82,
                "validation_status": "HISTORICAL VALIDATION PENDING"
            }
        }
