import React from 'react';
import type { ForecastResponse } from '../types';
import { Thermometer, Wind, Gauge, ShieldCheck } from 'lucide-react';

interface SynthesisCardsProps {
  forecast: ForecastResponse;
}

export const SynthesisCards: React.FC<SynthesisCardsProps> = ({ forecast }) => {
  const { blended_forecast, uncertainty, weather_regime, current_atmospheric_state, system_metadata } = forecast;

  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case 'High':
        return { bg: 'color-mix(in srgb, var(--accent-success) 15%, transparent)', text: 'var(--accent-success)', border: 'color-mix(in srgb, var(--accent-success) 35%, transparent)' };
      case 'Medium':
        return { bg: 'color-mix(in srgb, var(--accent-warning) 15%, transparent)', text: 'var(--accent-warning)', border: 'color-mix(in srgb, var(--accent-warning) 35%, transparent)' };
      default:
        return { bg: 'color-mix(in srgb, var(--accent-danger) 15%, transparent)', text: 'var(--accent-danger)', border: 'color-mix(in srgb, var(--accent-danger) 35%, transparent)' };
    }
  };

  const confColors = getConfidenceBadgeColor(uncertainty.confidence_level);

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'heavy_rainfall':
        return { color: 'var(--accent-primary)', label: 'HEAVY RAINFALL / CONVECTIVE' };
      case 'heatwave':
        return { color: '#f97316', label: 'HEATWAVE WARNING' };
      case 'storm_cyclonic':
        return { color: 'var(--accent-danger)', label: 'CYCLONIC DEPRESSION' };
      case 'high_wind':
        return { color: 'var(--accent-ai)', label: 'HIGH SQUALL WINDS' };
      case 'dry_spell':
        return { color: 'var(--accent-warning)', label: 'DRY SPELL' };
      default:
        return { color: 'var(--accent-success)', label: 'NORMAL SYNOPTIC' };
    }
  };

  const regimeInfo = getRegimeColor(weather_regime.regime);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '18px' }}>
      {/* 1. SANGAM Blended Rainfall & Uncertainty */}
      <div className="glass-panel" style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '70px', height: '70px', background: 'radial-gradient(circle, color-mix(in srgb, var(--accent-primary) 12%, transparent) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Blended Precipitation
          </span>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '2px 8px',
            borderRadius: '12px',
            background: confColors.bg,
            color: confColors.text,
            border: `1px solid ${confColors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={12} />
            {uncertainty.confidence_level} Conf ({Math.round(uncertainty.confidence_score * 100)}%)
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '-0.5px' }}>
            {blended_forecast.rainfall.toFixed(1)}
          </span>
          <span style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>mm</span>
          <span style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: '600', marginLeft: 'auto' }}>
            ±{uncertainty.rainfall_spread.toFixed(1)} mm
          </span>
        </div>

        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>90% Range: {uncertainty.rainfall_range.lower.toFixed(1)} – {uncertainty.rainfall_range.upper.toFixed(1)} mm</span>
          <span>Current: {current_atmospheric_state.precipitation} mm</span>
        </div>
      </div>

      {/* 2. Blended Temperature */}
      <div className="glass-panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Blended Temperature
          </span>
          <Thermometer size={16} color="var(--accent-warning)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '800', color: 'var(--accent-warning)', letterSpacing: '-0.5px' }}>
            {blended_forecast.temperature.toFixed(1)}
          </span>
          <span style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>°C</span>
          <span style={{ fontSize: '13px', color: 'var(--accent-warning)', fontWeight: '600', marginLeft: 'auto' }}>
            ±{uncertainty.temperature_spread.toFixed(1)} °C
          </span>
        </div>

        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Range: {uncertainty.temperature_range.lower.toFixed(1)} – {uncertainty.temperature_range.upper.toFixed(1)} °C</span>
          <span>Current: {current_atmospheric_state.temperature}°C</span>
        </div>
      </div>

      {/* 3. Wind Velocity & Surface Pressure */}
      <div className="glass-panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Wind & Surface Pressure
          </span>
          <Wind size={16} color="var(--accent-success)" />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '800', color: 'var(--accent-success)', letterSpacing: '-0.5px' }}>
            {blended_forecast.wind_speed.toFixed(1)}
          </span>
          <span style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>km/h</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
            {blended_forecast.pressure.toFixed(1)} hPa
          </span>
        </div>

        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Humidity: {blended_forecast.humidity.toFixed(0)}%</span>
          <span>Current Wind: {current_atmospheric_state.wind_speed} km/h</span>
        </div>
      </div>

      {/* 4. Weather Regime & Model Disagreement */}
      <div className="glass-panel" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Atmospheric Regime
          </span>
          <Gauge size={16} color={regimeInfo.color} />
        </div>

        <div style={{ fontSize: '15px', fontWeight: '700', color: regimeInfo.color, marginBottom: '6px' }}>
          {regimeInfo.label}
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {weather_regime.description}
        </div>

        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Disagreement Spread:</span>
          <div style={{ flex: 1, height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, (system_metadata?.disagreement_index || 0.3) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-success), var(--accent-warning), var(--accent-danger))'
            }} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {((system_metadata?.disagreement_index || 0.3) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};
