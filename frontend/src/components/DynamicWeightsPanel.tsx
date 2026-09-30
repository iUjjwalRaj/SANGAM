import React from 'react';
import type { ModelReliabilityWeights, SingleModelForecast } from '../types';
import { Cpu, Sliders } from 'lucide-react';

interface DynamicWeightsPanelProps {
  weights: ModelReliabilityWeights;
  forecasts: SingleModelForecast[];
  leadTime: number;
  onLeadTimeChange: (lt: number) => void;
}

export const DynamicWeightsPanel: React.FC<DynamicWeightsPanelProps> = ({
  weights,
  forecasts,
  leadTime,
  onLeadTimeChange
}) => {
  const modelColorMap: Record<string, { color: string; bg: string; border: string }> = {
    ecmwf_ifs: { color: 'var(--accent-primary)', bg: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)', border: 'color-mix(in srgb, var(--accent-primary) 35%, transparent)' },
    ecmwf_aifs: { color: 'var(--accent-ai)', bg: 'color-mix(in srgb, var(--accent-ai) 15%, transparent)', border: 'color-mix(in srgb, var(--accent-ai) 35%, transparent)' },
    noaa_gfs: { color: 'var(--accent-warning)', bg: 'color-mix(in srgb, var(--accent-warning) 15%, transparent)', border: 'color-mix(in srgb, var(--accent-warning) 35%, transparent)' },
    dwd_icon: { color: 'var(--accent-success)', bg: 'color-mix(in srgb, var(--accent-success) 15%, transparent)', border: 'color-mix(in srgb, var(--accent-success) 35%, transparent)' },
    bharat_fs: { color: 'var(--accent-indian)', bg: 'color-mix(in srgb, var(--accent-indian) 15%, transparent)', border: 'color-mix(in srgb, var(--accent-indian) 35%, transparent)' },
    ensemble: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.35)' }
  };

  const VALIDATED_IDS = ['ecmwf_ifs', 'noaa_gfs', 'dwd_icon'];
  const validatedForecasts = forecasts.filter(f => VALIDATED_IDS.includes(f.model_id));
  const extendedForecasts = forecasts.filter(f => !VALIDATED_IDS.includes(f.model_id));
  const leadTimes = [6, 12, 18, 24, 36, 48, 72, 96, 120];

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
              Dynamic AI Weighting Engine
            </h3>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)', color: 'var(--accent-primary)' }}>
              Validated Blend Σ w_i = 100%
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
            Dynamic weights calculated exclusively over the <b>Validated Track (IFS + GFS + ICON)</b>. Extended models are displayed for architectural preview and spread assessment.
          </p>
        </div>

        {/* Lead Time Selector Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-elevated)', padding: '4px', borderRadius: '8px', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sliders size={12} /> Lead:
          </span>
          {leadTimes.map((lt) => (
            <button
              key={lt}
              onClick={() => onLeadTimeChange(lt)}
              style={{
                background: leadTime === lt ? 'var(--accent-primary)' : 'transparent',
                color: leadTime === lt ? 'var(--text-inverse)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '5px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: leadTime === lt ? '800' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              +{lt}h
            </button>
          ))}
        </div>
      </div>

      {/* Proportional Stacked Bar (Validated Models Only) */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ height: '14px', width: '100%', borderRadius: '7px', display: 'flex', overflow: 'hidden', background: 'var(--surface-elevated)' }}>
          {validatedForecasts.map((f) => {
            const w = weights.weights[f.model_id] || 0.0;
            const pct = (w * 100).toFixed(1);
            const styleInfo = modelColorMap[f.model_id] || { color: '#ffffff' };
            return (
              <div
                key={f.model_id}
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: styleInfo.color,
                  transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                title={`${f.model_name}: ${pct}% (Validated Track)`}
              />
            );
          })}
        </div>
      </div>

      {/* Group 1: VALIDATED SANGAM TRACK CARDS */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-success)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>●</span> VALIDATED SANGAM TRACK (Dynamic Consensus Blending)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {validatedForecasts.map((f) => {
            const w = weights.weights[f.model_id] || 0.0;
            const pct = (w * 100).toFixed(1);
            const styleInfo = modelColorMap[f.model_id] || { color: '#ffffff', bg: 'var(--surface)', border: 'var(--border)' };
            
            return (
              <div
                key={f.model_id}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${styleInfo.border}`,
                  borderRadius: '10px',
                  padding: '12px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: styleInfo.color }}>
                    {f.model_name}
                  </span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'color-mix(in srgb, var(--accent-success) 20%, transparent)',
                    color: 'var(--accent-success)',
                    border: '1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)'
                  }}>
                    VALIDATED NWP
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {pct}%
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '600' }}>consensus weight</span>
                </div>

                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Model Rain:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{f.precipitation.toFixed(1)} mm</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Model Temp:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{f.temperature.toFixed(1)} °C</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group 2: EXTENDED PROVIDER REGISTRY CARDS */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-warning)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>○</span> EXTENDED PROVIDER REGISTRY (Architecture Preview &amp; Spread Assessment — Excluded from Blend)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {extendedForecasts.map((f) => {
            const isBfs = f.model_id === 'bharat_fs';
            const isAifs = f.model_id === 'ecmwf_aifs';
            const styleInfo = modelColorMap[f.model_id] || { color: '#ffffff', bg: 'var(--surface)', border: 'var(--border)' };
            
            const badgeText = isBfs 
              ? 'VALIDATION PENDING' 
              : (isAifs ? 'OPERATIONAL PROXY' : 'REGISTERED ENSEMBLE');
            const badgeColor = isBfs ? 'var(--accent-indian)' : (isAifs ? 'var(--accent-ai)' : 'var(--text-secondary)');
            const badgeBg = isBfs ? 'color-mix(in srgb, var(--accent-indian) 20%, transparent)' : (isAifs ? 'color-mix(in srgb, var(--accent-ai) 20%, transparent)' : 'var(--surface-elevated)');

            return (
              <div
                key={f.model_id}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid var(--border)`,
                  borderRadius: '10px',
                  padding: '12px',
                  position: 'relative',
                  opacity: 0.85
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: styleInfo.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isBfs && <span>🇮🇳</span>}
                    {f.model_name}
                  </span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: badgeBg,
                    color: badgeColor,
                    border: `1px solid ${badgeColor}44`
                  }}>
                    {badgeText}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-muted)' }}>
                    —
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>excluded from validated blend</span>
                </div>

                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Forecast Rain:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>{f.precipitation.toFixed(1)} mm</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Forecast Temp:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>{f.temperature.toFixed(1)} °C</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
