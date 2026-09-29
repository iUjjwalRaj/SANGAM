import React from 'react';
import { ExplainabilityPanel } from '../components/ExplainabilityPanel';
import type { ForecastResponse } from '../types';
import { ArrowDown } from 'lucide-react';

interface ExplainabilityPageProps {
  forecast: ForecastResponse;
}

const ExplainabilityPage: React.FC<ExplainabilityPageProps> = ({
  forecast,
}) => {
  return (
    <div className="page-enter" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Explainability</h1>
        <p className="page-subtitle">
          How SANGAM determines model weights and why they change
        </p>
      </div>

      {/* How it works */}
      <section className="page-enter page-enter-delay-1" style={{ marginBottom: '28px' }}>
        <h2 className="section-title">How SANGAM Works</h2>
        <div className="card" style={{ padding: '22px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
          }}>
            {[
              { label: 'Multiple Model Forecasts', desc: 'IFS, GFS, ICON produce independent predictions', color: 'var(--accent-primary)' },
              { label: 'Feature Extraction', desc: 'Lead time, coordinates, model spread, regime classification', color: 'var(--accent-ai)' },
              { label: 'AI Weighting Engine', desc: 'LightGBM model trained on historical ERA5 evaluation', color: 'var(--accent-ai)' },
              { label: 'Softmax Normalization', desc: 'Weights are non-negative and sum to 1.0', color: 'var(--accent-success)' },
              { label: 'Blended Forecast', desc: 'Weighted combination with quantified uncertainty', color: 'var(--accent-success)' },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div style={{
                  width: '100%',
                  maxWidth: '480px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontWeight: 700, color: step.color, marginBottom: '2px' }}>{step.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{step.desc}</div>
                </div>
                {i < 4 && (
                  <ArrowDown size={16} style={{ color: 'var(--text-muted)', margin: '2px 0' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Existing explainability panel */}
      <section className="page-enter page-enter-delay-2" style={{ marginBottom: '28px' }}>
        <h2 className="section-title">Feature Context & Weight Explanation</h2>
        <ExplainabilityPanel explainability={forecast.explainability} forecast={forecast} />
      </section>

      {/* Active features disclosure */}
      <section className="page-enter page-enter-delay-3" style={{ marginBottom: '28px' }}>
        <h2 className="section-title">Active Weighting Features</h2>
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6 }}>
            The following features are genuinely extracted and passed into the AI weighting engine:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
          }}>
            {[
              'Lead time (hours)',
              'Geographic coordinates (lat, lon)',
              'Precipitation spread (max − min)',
              'Spread standard deviation',
              'Model precipitation inputs',
              'Classified weather regime',
            ].map((feature) => (
              <div key={feature} style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--accent-success)',
                  flexShrink: 0,
                }} />
                {feature}
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginTop: '12px',
            fontStyle: 'italic',
          }}>
            Features such as moisture convergence, terrain/orography, and skill priors are <strong>not</strong> currently
            used by the active weighting engine.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ExplainabilityPage;
