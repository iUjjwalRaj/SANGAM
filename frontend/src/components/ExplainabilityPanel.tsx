import React, { useState } from 'react';
import type { WeightExplainability, ForecastResponse } from '../types';
import { HelpCircle, Check, Award, Sliders, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

interface ExplainabilityPanelProps {
  explainability: WeightExplainability[];
  forecast?: ForecastResponse;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ explainability, forecast }) => {
  const [showMath, setShowMath] = useState<boolean>(false);

  // Extract real feature group inputs if forecast provided
  const leadTimeHours = forecast?.lead_time || 24;
  const lat = forecast?.location?.lat || 28.61;
  const lon = forecast?.location?.lon || 77.21;
  const regimeName = forecast?.weather_regime?.regime || 'normal';
  const precipSpread = forecast?.uncertainty?.rainfall_spread || 1.2;
  const modelForecasts = forecast?.model_forecasts || [];

  // Calculate ensemble mean and std dev from actual model forecasts
  const temps = modelForecasts.map(m => m.temperature).filter(t => typeof t === 'number');
  const meanTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 28.5;
  const stdTemp = temps.length > 1 
    ? Math.sqrt(temps.map(x => Math.pow(x - meanTemp, 2)).reduce((a, b) => a + b, 0) / (temps.length - 1))
    : 0.6;

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            Dynamic Weight Explainability &amp; Feature Context
          </h3>
        </div>
        <button
          onClick={() => setShowMath(!showMath)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Calculator size={12} color="var(--accent-primary)" />
          <span>{showMath ? 'Hide Formulation' : 'How SANGAM Blends Forecasts'}</span>
          {showMath ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.45' }}>
        <b>"SANGAM dynamically adjusts model weights using forecast characteristics, model disagreement, lead time, and contextual features."</b>
      </p>

      {/* Part 6: Expandable Weighting Mathematics */}
      {showMath && (
        <div style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-active)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          fontSize: '12px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calculator size={14} /> Mathematical Blending Formulation:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontFamily: 'monospace', marginBottom: '8px' }}>
            <div style={{ background: 'var(--surface)', padding: '8px', borderRadius: '6px', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              w_i ≥ 0 &nbsp;&amp;&nbsp; ∑ w_i = 1
            </div>
            <div style={{ background: 'var(--surface)', padding: '8px', borderRadius: '6px', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              F_blended = ∑ (w_i × F_i)
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
            "Each model receives a non-negative weight, all weights sum to 1, and the final forecast is their weighted combination."
          </p>
        </div>
      )}

      {/* Part 5: Actual Feature Inputs Used by Engine (No fabricated SHAP values) */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={13} color="var(--accent-ai)" />
          Active Feature Groups Evaluated by Weighting Engine:
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ background: 'var(--surface)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>1. Lead Time:</span> <b style={{ color: 'var(--accent-primary)' }}>T+{leadTimeHours}h horizon</b>
          </div>
          <div style={{ background: 'var(--surface)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>2. Coordinates:</span> <b style={{ color: 'var(--text-primary)' }}>{lat.toFixed(2)}°N, {lon.toFixed(2)}°E</b>
          </div>
          <div style={{ background: 'var(--surface)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>3. Precipitation Spread:</span> <b style={{ color: 'var(--accent-warning)' }}>±{precipSpread.toFixed(1)} mm max-min</b>
          </div>
          <div style={{ background: 'var(--surface)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>4. Spread Std Dev:</span> <b style={{ color: 'var(--accent-success)' }}>σ={stdTemp.toFixed(2)} dispersion</b>
          </div>
          <div style={{ background: 'var(--surface)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>5. Model Precipitation Inputs:</span> <b style={{ color: 'var(--text-secondary)' }}>IFS, GFS, ICON + mean</b>
          </div>
          <div style={{ background: 'var(--surface)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>6. Classified Regime:</span> <b style={{ color: 'var(--accent-ai)' }}>{regimeName.replace('_', ' ').toUpperCase()}</b>
          </div>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0, fontStyle: 'italic' }}>
          *Audited against active LightGBM feature vector and heuristic layer. Unpassed candidate features (e.g. moisture convergence, terrain, skill priors) are strictly excluded from the display.
        </p>
      </div>

      {/* Model-by-Model Rationale */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
        {explainability.map((item) => (
          <div
            key={item.model_id}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={13} color="var(--accent-primary)" />
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  {item.model_id.replace('_', ' ')}
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                {(item.weight * 100).toFixed(1)}%
              </span>
            </div>

            <div style={{ fontSize: '10px', color: 'var(--accent-primary)', marginBottom: '6px', fontWeight: '600' }}>
              Benchmark Skill: {item.historical_skill_score} • {item.regime_affinity}
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', padding: 0, margin: 0 }}>
              {item.primary_reasons.map((reason, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <Check size={12} color="var(--accent-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
