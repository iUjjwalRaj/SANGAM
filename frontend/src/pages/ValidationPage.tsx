import React from 'react';
import { EvaluationScopePanel } from '../components/EvaluationScopePanel';
import { LeadTimePanel } from '../components/LeadTimePanel';
import { VerificationModal } from '../components/VerificationModal';
import type { ForecastResponse } from '../types';
import { Thermometer, Wind, CloudRain, AlertTriangle, BarChart3 } from 'lucide-react';

interface ValidationPageProps {
  forecast: ForecastResponse;
  leadTime: number;
  setLeadTime: (lt: number) => void;
}

const ValidationPage: React.FC<ValidationPageProps> = ({
  forecast,
  leadTime,
  setLeadTime,
}) => {
  const [verificationOpen, setVerificationOpen] = React.useState(false);

  return (
    <div className="page-enter" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Scientific Validation</h1>
        <p className="page-subtitle">
          Historical benchmark results, lead-time analysis, and statistical evidence
        </p>
      </div>

      {/* Validation Scope */}
      <section className="page-enter page-enter-delay-1" style={{ marginBottom: '24px' }}>
        <EvaluationScopePanel />
      </section>

      {/* Benchmark Results */}
      <section className="page-enter page-enter-delay-2" style={{ marginBottom: '28px' }}>
        <h2 className="section-title">Benchmark Results</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
        }}>
          {/* Temperature */}
          <div className="card" style={{ padding: '22px' }}>
            <div className="label" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Thermometer size={13} /> Temperature RMSE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>1.212°C</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span className="metric-value" style={{ color: 'var(--accent-success)', fontSize: '28px' }}>1.026°C</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-success)', marginBottom: '4px' }}>
              +15.35% improvement
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              95% CI: [+12.72%, +17.90%] — statistically supported (excludes 0)
            </div>
          </div>

          {/* Wind */}
          <div className="card" style={{ padding: '22px' }}>
            <div className="label" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wind size={13} /> Wind Speed RMSE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>3.838 km/h</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span className="metric-value" style={{ color: 'var(--accent-success)', fontSize: '28px' }}>3.344 km/h</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-success)', marginBottom: '4px' }}>
              +12.86% improvement
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              95% CI: [+10.83%, +14.98%] — statistically supported (excludes 0)
            </div>
          </div>

          {/* Precipitation */}
          <div className="card" style={{ padding: '22px' }}>
            <div className="label" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CloudRain size={13} /> Precipitation RMSE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>2.334 mm</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span className="metric-value" style={{ color: 'var(--accent-warning)', fontSize: '28px' }}>2.315 mm</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-warning)', marginBottom: '4px' }}>
              +0.80% — statistically inconclusive
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              95% CI: [−0.37%, +3.10%] — interval crosses zero
            </div>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '14px', lineHeight: '1.5', textAlign: 'center' }}>
          Improvement indicators are based on bootstrap confidence intervals; gains whose 95% CI excludes zero are treated as statistically supported, while intervals spanning zero remain inconclusive.
        </p>
      </section>

      {/* View full verification */}
      <section className="page-enter page-enter-delay-2" style={{ marginBottom: '24px', textAlign: 'center' }}>
        <button className="btn" onClick={() => setVerificationOpen(true)} style={{ gap: '6px' }}>
          <BarChart3 size={14} />
          Open Full Verification Matrix
        </button>
      </section>

      {/* Lead-Time Analysis */}
      <section className="page-enter page-enter-delay-3" style={{ marginBottom: '28px' }}>
        <LeadTimePanel
          forecast={forecast}
          leadTime={leadTime}
          onLeadTimeChange={setLeadTime}
        />
      </section>

      {/* Scientific Limitations */}
      <section className="page-enter page-enter-delay-4" style={{ marginBottom: '28px' }}>
        <h2 className="section-title">Scientific Limitations</h2>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--accent-danger)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Disclosed Scientific Boundaries:</strong>
              </p>
              <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Evaluated on 41 summer monsoon days across 5 monitoring locations (Delhi, Guwahati, Mumbai, Chennai, Leh).</li>
                <li>High-altitude mountain terrain (Leh) exhibits localized temperature degradation (−44.21%) due to steep valley reanalysis grid-smoothing.</li>
                <li>Bulk precipitation improvement (+0.80%, 95% CI: [−0.37%, +3.10%]) remains inconclusive as the confidence interval spans zero.</li>
                <li>Extreme rain (≥20mm, N=6) and heatwave (≥40°C, N=0) sample counts are insufficient for formal inferential claims.</li>
                <li>ERA5 reanalysis is used as reference, not direct station observations.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationOpen}
        onClose={() => setVerificationOpen(false)}
        leadTime={leadTime}
      />
    </div>
  );
};

export default ValidationPage;
