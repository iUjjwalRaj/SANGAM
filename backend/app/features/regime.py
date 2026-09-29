from typing import List, Dict, Any
from backend.app.models.schemas import AtmosphericState, SingleModelForecast, WeatherRegimeClassification

class WeatherRegimeClassifier:
    """
    Transparent, meteorologically grounded weather-regime classification engine.
    Identifies synoptic and mesoscale conditions to guide the ML weighting engine.
    Designed so an advanced neural/clustering classifier can plug into the same interface.
    """

    @staticmethod
    def classify(
        atm_state: AtmosphericState,
        forecasts: List[SingleModelForecast]
    ) -> WeatherRegimeClassification:
        max_forecast_rain = max((f.precipitation for f in forecasts), default=0.0)
        mean_forecast_rain = sum(f.precipitation for f in forecasts) / max(1, len(forecasts))
        max_forecast_temp = max((f.temperature for f in forecasts), default=25.0)
        max_forecast_wind = max((f.wind_speed for f in forecasts), default=10.0)
        min_forecast_pressure = min((f.pressure for f in forecasts if f.pressure is not None), default=atm_state.pressure)

        factors: List[str] = []

        # 1. Storm / Cyclonic Conditions
        if (min_forecast_pressure < 998.0 or atm_state.pressure < 998.0) and max_forecast_wind > 55.0 and max_forecast_rain > 35.0:
            factors.append(f"Depressed surface pressure ({min_forecast_pressure:.1f} hPa)")
            factors.append(f"High cyclonic wind gusts ({max_forecast_wind:.1f} km/h)")
            factors.append(f"Intense precipitation band ({max_forecast_rain:.1f} mm)")
            return WeatherRegimeClassification(
                regime="storm_cyclonic",
                confidence=0.92,
                description="Deep atmospheric depression / cyclonic conditions with gale winds and torrential rainfall.",
                key_factors=factors
            )

        # 2. Heavy Rainfall / Convective Regime
        if max_forecast_rain >= 40.0 or atm_state.precipitation > 25.0 or (mean_forecast_rain >= 30.0 and atm_state.humidity > 80.0):
            factors.append(f"Max model rainfall prediction: {max_forecast_rain:.1f} mm")
            factors.append(f"High atmospheric moisture content: {atm_state.humidity:.1f}%")
            if atm_state.pressure < 1006.0:
                factors.append(f"Monsoonal surface low: {atm_state.pressure:.1f} hPa")
            return WeatherRegimeClassification(
                regime="heavy_rainfall",
                confidence=0.88,
                description="Active convective / monsoonal precipitation regime with high moisture convergence.",
                key_factors=factors
            )

        # 3. Heatwave Regime
        if max_forecast_temp >= 40.0 or atm_state.temperature >= 40.0:
            factors.append(f"Surface temperature peak: {max_forecast_temp:.1f}°C")
            factors.append(f"Low relative humidity: {atm_state.humidity:.1f}%")
            return WeatherRegimeClassification(
                regime="heatwave",
                confidence=0.90,
                description="Severe heatwave regime with intense surface radiative heating.",
                key_factors=factors
            )

        # 4. High Wind / Squall
        if max_forecast_wind >= 50.0 or atm_state.wind_speed >= 45.0:
            factors.append(f"Peak forecasted wind: {max_forecast_wind:.1f} km/h")
            factors.append(f"Current surface wind estimate: {atm_state.wind_speed:.1f} km/h")
            return WeatherRegimeClassification(
                regime="high_wind",
                confidence=0.85,
                description="High wind / squall regime driven by steep baroclinic pressure gradient.",
                key_factors=factors
            )

        # 5. Dry Spell
        if mean_forecast_rain < 0.5 and atm_state.humidity < 35.0:
            factors.append(f"Negligible precipitation: {mean_forecast_rain:.2f} mm")
            factors.append(f"Dry continental airmass: {atm_state.humidity:.1f}% RH")
            return WeatherRegimeClassification(
                regime="dry_spell",
                confidence=0.82,
                description="Extended dry anticyclonic regime with subsidence and stable troposphere.",
                key_factors=factors
            )

        # 6. Normal / Synoptic Standard
        factors.append(f"Moderate temperature: {atm_state.temperature:.1f}°C")
        factors.append(f"Precipitation: {mean_forecast_rain:.1f} mm")
        factors.append(f"Stable barometric pressure: {atm_state.pressure:.1f} hPa")
        return WeatherRegimeClassification(
            regime="normal",
            confidence=0.95,
            description="Typical seasonal atmospheric conditions within climatological variance.",
            key_factors=factors
        )
