import React, { useState } from 'react';
import type { SingleModelForecast, BaselineComparison } from '../types';
import { BarChart3, TrendingDown, CheckCircle2 } from 'lucide-react';

interface ModelComparisonProps {
  forecasts: SingleModelForecast[];
  blendedForecast: Record<string, number>;
  baselines: BaselineComparison;
  weights?: Record<string, number>;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  forecasts,
  blendedForecast,
  baselines,
  weights = {}
}) => {
  const [activeVar, setActiveVar] = useState<'rainfall' | 'temperature' | 'wind_speed'>('rainfall');
  const [activeTab, setActiveTab] = useState<'table' | 'bars' | 'baselines'>('table');

  const unitMap = {
    rainfall: 'mm',
    temperature: '°C',
    wind_speed: 'km/h'
  };

  const getVarVal = (item: any): number => {
    if (!item) return 0;
    if (typeof item[activeVar] === 'number') return item[activeVar];
    if (item.forecast && typeof item.forecast[activeVar] === 'number') return item.forecast[activeVar];
    return 0;
  };

  // Find max value for bar scaling
  const allVals = [
    ...forecasts.map((f) => (f as any)[activeVar] || 0),
    blendedForecast[activeVar] || 0,
    getVarVal(baselines.simple_average),
    getVarVal(baselines.static_historical_weights)
  ];
  const maxVal = Math.max(...allVals, 1.0);

  // Model metadata configuration
  const getModelMetadata = (modelId: string) => {
    switch (modelId) {
      case 'ecmwf_ifs':
        return {
          displayName: 'ECMWF IFS',
          resolution: '0.25° (~27 km)',
          status: 'Track B Validated',
          statusBadgeColor: '#10b981',
          statusBg: 'rgba(16, 185, 129, 0.15)',
          note: 'Authoritative Phase 3 benchmark candidate'
        };
      case 'noaa_gfs':
        return {
          displayName: 'NOAA GFS',
          resolution: '0.25° (~27 km)',
          status: 'Track B Validated',
          statusBadgeColor: '#10b981',
          statusBg: 'rgba(16, 185, 129, 0.15)',
          note: 'Authoritative Phase 3 benchmark candidate'
        };
      case 'dwd_icon':
        return {
          displayName: 'DWD ICON',
          resolution: '0.25° (~27 km)',
          status: 'Track B Validated',
          statusBadgeColor: '#10b981',
          statusBg: 'rgba(16, 185, 129, 0.15)',
          note: 'Authoritative Phase 3 benchmark candidate'
        };
      case 'bharat_fs':
        return {
          displayName: '🇮🇳 BharatFS',
          resolution: '6 km (TCo grid)',
          status: 'Validation Pending Archive',
          statusBadgeColor: '#f59e0b',
          statusBg: 'rgba(245, 158, 11, 0.15)',
          note: 'Architecture supported; no historical score implied'
        };
      case 'ecmwf_aifs':
        return {
          displayName: 'ECMWF AIFS',
          resolution: '0.25° (AI Emulator)',
          status: 'Track B Retrospective Excluded',
          statusBadgeColor: '#818cf8',
          statusBg: 'rgba(129, 140, 248, 0.15)',
          note: 'Operational proxy only; excluded from retrospective benchmark'
        };
      case 'ensemble':
        return {
          displayName: 'HGEFS Ensemble',
          resolution: '0.5° (Ensemble)',
          status: 'Registered Multi-Model',
          statusBadgeColor: '#94a3b8',
          statusBg: 'rgba(148, 163, 184, 0.15)',
          note: 'Spread and outlier dampening'
        };
      default:
        return {
          displayName: modelId,
          resolution: 'Standard',
          status: 'Registered',
          statusBadgeColor: '#94a3b8',
          statusBg: 'rgba(148, 163, 184, 0.15)',
          note: 'Integrated NWP model'
        };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={18} color="#00f0ff" />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.3px', margin: 0 }}>
            Model Comparison &amp; Weight Contribution Audit
          </h3>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <TrendingDown size={12} />
            {baselines.variance_reduction_pct}% Variance Reduction
          </span>
        </div>

        {/* Variable Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(['rainfall', 'temperature', 'wind_speed'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveVar(v)}
              style={{
                background: activeVar === v ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: activeVar === v ? '#00f0ff' : 'var(--text-secondary)',
                border: activeVar === v ? '1px solid #00f0ff' : '1px solid transparent',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s'
              }}
            >
              {v.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('table')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'table' ? '#00f0ff' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            paddingBottom: '4px',
            borderBottom: activeTab === 'table' ? '2px solid #00f0ff' : '2px solid transparent'
          }}
        >
          Detailed Audit Table (Part 4)
        </button>
        <button
          onClick={() => setActiveTab('bars')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'bars' ? '#00f0ff' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            paddingBottom: '4px',
            borderBottom: activeTab === 'bars' ? '2px solid #00f0ff' : '2px solid transparent'
          }}
        >
          Visual Bar Comparison
        </button>
        <button
          onClick={() => setActiveTab('baselines')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'baselines' ? '#00f0ff' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            paddingBottom: '4px',
            borderBottom: activeTab === 'baselines' ? '2px solid #00f0ff' : '2px solid transparent'
          }}
        >
          Operational Baselines
        </button>
      </div>

      {/* Tab 1: Detailed Table View */}
      {activeTab === 'table' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 10px' }}>Model</th>
                <th style={{ padding: '8px 10px' }}>Forecast ({unitMap[activeVar]})</th>
                <th style={{ padding: '8px 10px' }}>Resolution</th>
                <th style={{ padding: '8px 10px' }}>Validation Status</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Weight</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Contribution ({unitMap[activeVar]})</th>
              </tr>
            </thead>
            <tbody>
              {/* SANGAM Consensus Row */}
              <tr style={{
                background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
                borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
                fontWeight: '700'
              }}>
                <td style={{ padding: '10px', color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> SANGAM Dynamic Consensus
                </td>
                <td style={{ padding: '10px', color: '#00f0ff', fontSize: '13px' }}>
                  {blendedForecast[activeVar]?.toFixed(1)} {unitMap[activeVar]}
                </td>
                <td style={{ padding: '10px', color: '#94a3b8' }}>Adaptive</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff' }}>
                    PROPOSED ML BLENDER
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#00f0ff' }}>100.0%</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#00f0ff', fontSize: '13px' }}>
                  {blendedForecast[activeVar]?.toFixed(1)} {unitMap[activeVar]}
                </td>
              </tr>

              {/* Individual Models */}
              {forecasts.map((f) => {
                const meta = getModelMetadata(f.model_id);
                const val = (f as any)[activeVar] || 0;
                const rawWeight = weights[f.model_id] ?? (1.0 / Math.max(1, forecasts.length));
                const contribution = rawWeight * val;

                return (
                  <tr key={f.model_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: '#f1f5f9' }}>
                      {meta.displayName}
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '13px', color: '#f8fafc' }}>
                      {val.toFixed(1)} {unitMap[activeVar]}
                    </td>
                    <td style={{ padding: '10px', color: '#94a3b8', fontSize: '11px' }}>
                      {meta.resolution}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: meta.statusBg,
                        color: meta.statusBadgeColor,
                        border: `1px solid ${meta.statusBadgeColor}44`
                      }}>
                        {meta.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: '#cbd5e1' }}>
                      {(rawWeight * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', color: '#38bdf8' }}>
                      +{contribution.toFixed(2)} {unitMap[activeVar]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
            Note: BharatFS weight is assigned via uniform baseline prior; status does not imply validated historical skill.
          </p>
        </div>
      )}

      {/* Tab 2: Visual Bar Comparison */}
      {activeTab === 'bars' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* SANGAM Blended Result */}
          <div style={{
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            borderRadius: '8px',
            padding: '10px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} /> SANGAM Dynamic Blended Consensus
              </span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#00f0ff' }}>
                {blendedForecast[activeVar]?.toFixed(1)} {unitMap[activeVar]}
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, ((blendedForecast[activeVar] || 0) / maxVal) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00f0ff, #38bdf8)'
              }} />
            </div>
          </div>

          {/* Individual Models */}
          {forecasts.map((f) => {
            const val = (f as any)[activeVar] || 0;
            const pct = Math.min(100, (val / maxVal) * 100);
            const isBfs = f.model_id === 'bharat_fs' || f.model_name?.toLowerCase().includes('bharat');
            const meta = getModelMetadata(f.model_id);

            return (
              <div key={f.model_id} style={{ padding: '6px 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: isBfs ? '#ff9933' : 'var(--text-secondary)', fontWeight: '600' }}>
                      {meta.displayName}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({meta.resolution})</span>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      background: meta.statusBg,
                      color: meta.statusBadgeColor,
                      border: `1px solid ${meta.statusBadgeColor}44`
                    }}>
                      {meta.status}
                    </span>
                  </div>
                  <span style={{ fontWeight: '700', color: isBfs ? '#ff9933' : '#f8fafc' }}>
                    {val.toFixed(1)} {unitMap[activeVar]}
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: isBfs ? '#ff9933' : '#64748b' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Baselines Tab */}
      {activeTab === 'baselines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* SANGAM Dynamic */}
          <div style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid #00f0ff', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#00f0ff' }}>
                Proposed: SANGAM Dynamic ML Weights
              </span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#00f0ff' }}>
                {blendedForecast[activeVar]?.toFixed(1)} {unitMap[activeVar]}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
              Conditioned on lead-time decay, spatial terrain, moisture convergence, and inter-model spread entropy.
            </p>
          </div>

          {/* Best Single Model */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                Baseline 1: Best Single Model ({baselines.best_single_model.model_name})
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
                {getVarVal(baselines.best_single_model).toFixed(1)} {unitMap[activeVar]}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Highest historical skill score ({baselines.best_single_model.skill_score}); susceptible to localized regime busts.
            </p>
          </div>

          {/* Simple Average */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                Baseline 2: Simple Multi-Model Average (Equal 1/N weights)
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
                {getVarVal(baselines.simple_average).toFixed(1)} {unitMap[activeVar]}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Standard unweighted ensemble mean; susceptible to outlier propagation and equal trust in biased models.
            </p>
          </div>

          {/* Static Historical Weights */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                Baseline 3: Static Historical Weights
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
                {getVarVal(baselines.static_historical_weights).toFixed(1)} {unitMap[activeVar]}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Fixed climatological weights; does not adapt to convective regimes, moisture surges, or lead-time scaling.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
