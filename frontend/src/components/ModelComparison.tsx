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
          track: 'VALIDATED SANGAM TRACK',
          status: 'HISTORICALLY VALIDATED (Track B)',
          statusBadgeColor: '#10b981',
          statusBg: 'rgba(16, 185, 129, 0.15)',
          note: 'Authoritative 0.25° NWP benchmark member'
        };
      case 'noaa_gfs':
        return {
          displayName: 'NOAA GFS',
          resolution: '0.25° (~27 km)',
          track: 'VALIDATED SANGAM TRACK',
          status: 'HISTORICALLY VALIDATED (Track B)',
          statusBadgeColor: '#10b981',
          statusBg: 'rgba(16, 185, 129, 0.15)',
          note: 'Authoritative 0.25° NWP benchmark member'
        };
      case 'dwd_icon':
        return {
          displayName: 'DWD ICON',
          resolution: '0.25° (~27 km)',
          track: 'VALIDATED SANGAM TRACK',
          status: 'HISTORICALLY VALIDATED (Track B)',
          statusBadgeColor: '#10b981',
          statusBg: 'rgba(16, 185, 129, 0.15)',
          note: 'Authoritative 0.25° NWP benchmark member'
        };
      case 'bharat_fs':
        return {
          displayName: '🇮🇳 BharatFS',
          resolution: '6 km (TCo grid)',
          track: 'EXTENDED PROVIDER REGISTRY',
          status: 'VALIDATION PENDING ARCHIVE',
          statusBadgeColor: '#f59e0b',
          statusBg: 'rgba(245, 158, 11, 0.15)',
          note: 'Architecture supported; historical validation pending reproducible archive'
        };
      case 'ecmwf_aifs':
        return {
          displayName: 'ECMWF AIFS',
          resolution: '0.25° (AI Emulator)',
          track: 'EXTENDED PROVIDER REGISTRY',
          status: 'OPERATIONAL PROXY (Track B Excluded)',
          statusBadgeColor: '#818cf8',
          statusBg: 'rgba(129, 140, 248, 0.15)',
          note: 'Operational proxy only; retrospective benchmark excluded'
        };
      case 'ensemble':
        return {
          displayName: 'HGEFS / Global Ensemble',
          resolution: '0.5° (Ensemble)',
          track: 'EXTENDED PROVIDER REGISTRY',
          status: 'REGISTERED ENSEMBLE (Not in Benchmark)',
          statusBadgeColor: 'var(--text-secondary)',
          statusBg: 'rgba(148, 163, 184, 0.15)',
          note: 'Multi-model spread and disagreement assessment'
        };
      default:
        return {
          displayName: modelId,
          resolution: 'Standard',
          track: 'EXTENDED PROVIDER REGISTRY',
          status: 'Registered',
          statusBadgeColor: 'var(--text-secondary)',
          statusBg: 'rgba(148, 163, 184, 0.15)',
          note: 'Integrated weather model'
        };
    }
  };

  const VALIDATED_IDS = ['ecmwf_ifs', 'noaa_gfs', 'dwd_icon'];
  const validatedForecasts = forecasts.filter(f => VALIDATED_IDS.includes(f.model_id));
  const extendedForecasts = forecasts.filter(f => !VALIDATED_IDS.includes(f.model_id));

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            Model Comparison &amp; Weight Contribution Audit
          </h3>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'color-mix(in srgb, var(--accent-success) 15%, transparent)',
            color: 'var(--accent-success)',
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
                background: activeVar === v ? 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' : 'var(--surface-elevated)',
                color: activeVar === v ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: activeVar === v ? '1px solid var(--accent-primary)' : '1px solid transparent',
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
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('table')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'table' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            paddingBottom: '4px',
            borderBottom: activeTab === 'table' ? '2px solid var(--accent-primary)' : '2px solid transparent'
          }}
        >
          Detailed Audit Table (Track Separation)
        </button>
        <button
          onClick={() => setActiveTab('bars')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'bars' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            paddingBottom: '4px',
            borderBottom: activeTab === 'bars' ? '2px solid var(--accent-primary)' : '2px solid transparent'
          }}
        >
          Visual Bar Comparison
        </button>
        <button
          onClick={() => setActiveTab('baselines')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'baselines' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            paddingBottom: '4px',
            borderBottom: activeTab === 'baselines' ? '2px solid var(--accent-primary)' : '2px solid transparent'
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
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 10px' }}>Model</th>
                <th style={{ padding: '8px 10px' }}>Forecast ({unitMap[activeVar]})</th>
                <th style={{ padding: '8px 10px' }}>Resolution</th>
                <th style={{ padding: '8px 10px' }}>Validation Status</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Weight</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Contribution ({unitMap[activeVar]})</th>
              </tr>
            </thead>
            <tbody>
              {/* SANGAM Dynamic Consensus Row */}
              <tr style={{
                background: 'linear-gradient(90deg, color-mix(in srgb, var(--accent-primary) 12%, transparent) 0%, color-mix(in srgb, var(--accent-ai) 8%, transparent) 100%)',
                borderBottom: '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)',
                fontWeight: '700'
              }}>
                <td style={{ padding: '10px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> SANGAM Dynamic Consensus
                </td>
                <td style={{ padding: '10px', color: 'var(--accent-primary)', fontSize: '13px' }}>
                  {blendedForecast[activeVar]?.toFixed(1)} {unitMap[activeVar]}
                </td>
                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>Adaptive (0.25°)</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)', color: 'var(--accent-primary)', fontWeight: '700' }}>
                    VALIDATED BENCHMARK BLEND
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'right', color: 'var(--accent-primary)' }}>100.0%</td>
                <td style={{ padding: '10px', textAlign: 'right', color: 'var(--accent-primary)', fontSize: '13px' }}>
                  {blendedForecast[activeVar]?.toFixed(1)} {unitMap[activeVar]}
                </td>
              </tr>

              {/* Group 1: VALIDATED SANGAM TRACK */}
              <tr style={{ background: 'color-mix(in srgb, var(--accent-success) 8%, transparent)', borderTop: '1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)', borderBottom: '1px solid color-mix(in srgb, var(--accent-success) 20%, transparent)' }}>
                <td colSpan={6} style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: 'var(--accent-success)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  VALIDATED SANGAM TRACK — Primary Quantitative Benchmark Models (IFS + GFS + ICON)
                </td>
              </tr>

              {validatedForecasts.map((f) => {
                const meta = getModelMetadata(f.model_id);
                const val = (f as any)[activeVar] || 0;
                const rawWeight = weights[f.model_id] ?? 0.0;
                const contribution = rawWeight * val;

                return (
                  <tr key={f.model_id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {meta.displayName}
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-primary)' }}>
                      {val.toFixed(1)} {unitMap[activeVar]}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-secondary)', fontSize: '11px' }}>
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
                    <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      {(rawWeight * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                      +{contribution.toFixed(2)} {unitMap[activeVar]}
                    </td>
                  </tr>
                );
              })}

              {/* Group 2: EXTENDED PROVIDER REGISTRY */}
              <tr style={{ background: 'color-mix(in srgb, var(--accent-warning) 8%, transparent)', borderTop: '1px solid color-mix(in srgb, var(--accent-warning) 30%, transparent)', borderBottom: '1px solid color-mix(in srgb, var(--accent-warning) 20%, transparent)' }}>
                <td colSpan={6} style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '800', color: 'var(--accent-warning)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  EXTENDED PROVIDER REGISTRY — Architecture Integrations &amp; Candidate Models (Excluded from Validated Benchmark Blend)
                </td>
              </tr>

              {extendedForecasts.map((f) => {
                const meta = getModelMetadata(f.model_id);
                const val = (f as any)[activeVar] || 0;

                return (
                  <tr key={f.model_id} style={{ borderBottom: '1px solid var(--border)', opacity: 0.9 }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {meta.displayName}
                    </td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {val.toFixed(1)} {unitMap[activeVar]}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
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
                    <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      — (Registry Only)
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      — (Not in Blend)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Explicit Protocol Clarification Note */}
          <div style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '10px 14px',
            marginTop: '12px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            <b style={{ color: 'var(--accent-primary)' }}>Audited Validation Separation:</b> The authoritative quantitative SANGAM blend and historical benchmark use strictly <b>ECMWF IFS + NOAA GFS + DWD ICON</b>. BharatFS, AIFS, and HGEFS are integrated in the Extended Provider Registry for architectural readiness, operational monitoring, and spread assessment; their registry membership does not alter the validated benchmark results or imply retrospective skill.
          </div>
        </div>
      )}

      {/* Tab 2: Visual Bar Comparison */}
      {activeTab === 'bars' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* SANGAM Blended Result */}
          <div style={{
            background: 'linear-gradient(90deg, color-mix(in srgb, var(--accent-primary) 12%, transparent) 0%, color-mix(in srgb, var(--accent-ai) 8%, transparent) 100%)',
            border: '1px solid color-mix(in srgb, var(--accent-primary) 40%, transparent)',
            borderRadius: '8px',
            padding: '10px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} /> SANGAM Dynamic Blended Consensus (IFS + GFS + ICON)
              </span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                {blendedForecast[activeVar]?.toFixed(1)} {unitMap[activeVar]}
              </span>
            </div>
            <div style={{ height: '8px', background: 'var(--surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, ((blendedForecast[activeVar] || 0) / maxVal) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-ai))'
              }} />
            </div>
          </div>

          {/* Validated Track Sub-Section */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-success)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.4px' }}>
              VALIDATED SANGAM TRACK (Contributing to Blend)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {validatedForecasts.map((f) => {
                const val = (f as any)[activeVar] || 0;
                const pct = Math.min(100, (val / maxVal) * 100);
                const meta = getModelMetadata(f.model_id);
                const w = weights[f.model_id] ?? 0.0;

                return (
                  <div key={f.model_id} style={{ padding: '6px 8px', background: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
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
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-primary)' }}>
                          [{ (w * 100).toFixed(1) }% weight]
                        </span>
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                        {val.toFixed(1)} {unitMap[activeVar]}
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-primary)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extended Provider Registry Sub-Section */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-warning)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.4px' }}>
              EXTENDED PROVIDER REGISTRY (Candidate Integrations — Excluded from Blend)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {extendedForecasts.map((f) => {
                const val = (f as any)[activeVar] || 0;
                const pct = Math.min(100, (val / maxVal) * 100);
                const isBfs = f.model_id === 'bharat_fs';
                const meta = getModelMetadata(f.model_id);

                return (
                  <div key={f.model_id} style={{ padding: '6px 8px', background: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: isBfs ? 'var(--accent-indian)' : 'var(--text-secondary)', fontWeight: '600' }}>
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
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          [Registry Only — Not in Blend]
                        </span>
                      </div>
                      <span style={{ fontWeight: '700', color: isBfs ? 'var(--accent-indian)' : 'var(--text-secondary)' }}>
                        {val.toFixed(1)} {unitMap[activeVar]}
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: isBfs ? 'var(--accent-indian)' : 'var(--text-muted)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Baselines Tab */}
      {activeTab === 'baselines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* SANGAM Dynamic */}
          <div style={{ background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)', border: '1px solid var(--accent-primary)', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                Proposed: SANGAM Dynamic ML Weights (IFS + GFS + ICON)
              </span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                {blendedForecast[activeVar]?.toFixed(1)} {unitMap[activeVar]}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              Conditioned on lead-time decay, geographic location, multi-model precipitation spread, and weather regime.
            </p>
          </div>

          {/* Best Single Model */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Baseline 1: Best Single Model ({baselines.best_single_model.model_name})
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {getVarVal(baselines.best_single_model).toFixed(1)} {unitMap[activeVar]}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Highest historical skill score ({baselines.best_single_model.skill_score}); susceptible to localized regime busts.
            </p>
          </div>

          {/* Simple Average */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Baseline 2: Simple Multi-Model Average (Equal 1/3 weights over IFS, GFS, ICON)
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {getVarVal(baselines.simple_average).toFixed(1)} {unitMap[activeVar]}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Standard unweighted 3-model benchmark ensemble mean; susceptible to outlier propagation and equal trust in biased models.
            </p>
          </div>

          {/* Static Historical Weights */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Baseline 3: Static Historical Weights (Track B Fixed Weights)
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {getVarVal(baselines.static_historical_weights).toFixed(1)} {unitMap[activeVar]}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Fixed climatological weights over validated benchmark models; does not adapt to convective regimes, precipitation surges, or lead-time scaling.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
