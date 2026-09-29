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
    ecmwf_ifs: { color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.15)', border: 'rgba(0, 240, 255, 0.35)' },
    ecmwf_aifs: { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', border: 'rgba(167, 139, 250, 0.35)' },
    noaa_gfs: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.35)' },
    dwd_icon: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' },
    bharat_fs: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.35)' },
    ensemble: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.35)' }
  };

  const leadTimes = [6, 12, 18, 24, 36, 48, 72, 96, 120];

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#00f0ff" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.3px' }}>
              Dynamic AI Weighting Engine
            </h3>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: 'rgba(0, 240, 255, 0.15)', color: '#38bdf8' }}>
              Σ w_i = 100%
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Weights dynamically conditioned on current atmospheric state, lead time, and regime skill
          </p>
        </div>

        {/* Lead Time Selector Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sliders size={12} /> Lead:
          </span>
          {leadTimes.map((lt) => (
            <button
              key={lt}
              onClick={() => onLeadTimeChange(lt)}
              style={{
                background: leadTime === lt ? '#00f0ff' : 'transparent',
                color: leadTime === lt ? '#070a12' : 'var(--text-secondary)',
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

      {/* Proportional Stacked Bar */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ height: '14px', width: '100%', borderRadius: '7px', display: 'flex', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.05)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
          {forecasts.map((f) => {
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
                title={`${f.model_name}: ${pct}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Individual Model Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
        {forecasts.map((f) => {
          const w = weights.weights[f.model_id] || 0.0;
          const pct = (w * 100).toFixed(1);
          const styleInfo = modelColorMap[f.model_id] || { color: '#ffffff', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' };
          
          return (
            <div
              key={f.model_id}
              style={{
                background: 'rgba(13, 19, 34, 0.6)',
                border: `1px solid ${styleInfo.border}`,
                borderRadius: '10px',
                padding: '12px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: styleInfo.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {f.model_id === 'bharat_fs' && <span>🇮🇳</span>}
                  {f.model_name}
                </span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: f.model_id === 'bharat_fs' ? 'rgba(249, 115, 22, 0.25)' : (f.model_type === 'AI' ? 'rgba(168, 85, 247, 0.25)' : (f.model_type === 'NWP' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(16, 185, 129, 0.25)')),
                  color: f.model_id === 'bharat_fs' ? '#fb923c' : (f.model_type === 'AI' ? '#c084fc' : (f.model_type === 'NWP' ? '#60a5fa' : '#34d399'))
                }}>
                  {f.model_id === 'bharat_fs' ? 'ARCHITECTURAL PREVIEW' : f.model_type}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>
                  {pct}%
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>weight</span>
              </div>

              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Model Rain:</span>
                <span style={{ fontWeight: '700', color: '#f8fafc' }}>{f.precipitation.toFixed(1)} mm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Model Temp:</span>
                <span style={{ fontWeight: '700', color: '#f8fafc' }}>{f.temperature.toFixed(1)} °C</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
