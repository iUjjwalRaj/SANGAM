import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PipelineFlow } from '../components/PipelineFlow';
import type { ForecastResponse } from '../types';
import {
  Layers,
  BarChart3,
  Thermometer,
  Wind,
  CloudRain,
  ArrowRight,
  MapPin,
  FlaskConical
} from 'lucide-react';

interface OverviewPageProps {
  forecast: ForecastResponse;
}

const OverviewPage: React.FC<OverviewPageProps> = (_props) => {
  const navigate = useNavigate();

  return (
    <div className="page-enter" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '48px 16px 36px' }}>
        <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
          Operational Forecast Blending Platform
        </div>
        <h1 className="page-title" style={{ fontSize: '36px', marginBottom: '8px' }}>
          SANGAM
        </h1>
        <p style={{
          fontSize: '17px',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          margin: '0 auto 8px',
          lineHeight: 1.6,
        }}>
          Hybrid AI–NWP Multi-Model Forecast Blending System
        </p>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          maxWidth: '560px',
          margin: '0 auto',
        }}>
          Context-aware dynamic weighting of multiple weather forecasting systems.
        </p>
      </section>

      {/* Executive Metrics */}
      <section className="page-enter page-enter-delay-1" style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}>
          {/* Validated Models */}
          <div className="card" style={{ padding: '20px' }}>
            <div className="label" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={13} />
              Validated Models
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-success)' }}>
              IFS • GFS • ICON
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              3-model authoritative blend
            </div>
          </div>

          {/* Temperature */}
          <div className="card" style={{ padding: '20px' }}>
            <div className="label" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Thermometer size={13} />
              Temperature
            </div>
            <div className="metric-value" style={{ color: 'var(--accent-success)', fontSize: '28px' }}>
              +15.35%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              RMSE reduction vs. simple average
            </div>
          </div>

          {/* Wind */}
          <div className="card" style={{ padding: '20px' }}>
            <div className="label" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wind size={13} />
              Wind Speed
            </div>
            <div className="metric-value" style={{ color: 'var(--accent-success)', fontSize: '28px' }}>
              +12.86%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              RMSE reduction vs. simple average
            </div>
          </div>

          {/* Precipitation */}
          <div className="card" style={{ padding: '20px' }}>
            <div className="label" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CloudRain size={13} />
              Precipitation
            </div>
            <div className="metric-value" style={{ color: 'var(--accent-warning)', fontSize: '28px' }}>
              +0.80%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--accent-warning)', marginTop: '4px', fontWeight: 500 }}>
              Statistically inconclusive
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Scope */}
      <section className="page-enter page-enter-delay-2" style={{ marginBottom: '28px' }}>
        <div className="card" style={{
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <FlaskConical size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <span><strong style={{ color: 'var(--text-primary)' }}>41-day sample</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span>5 Indian locations</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span>June 15 – July 25, 2024</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span>1,800 held-out test instances</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span>ERA5 reanalysis reference</span>
          </div>
          <button
            className="btn"
            onClick={() => navigate('/validation')}
            style={{ fontSize: '12px', padding: '6px 12px', gap: '4px' }}
          >
            View Validation <ArrowRight size={12} />
          </button>
        </div>
      </section>

      {/* Pipeline */}
      <section className="page-enter page-enter-delay-3" style={{ marginBottom: '28px' }}>
        <h2 className="section-title">System Pipeline</h2>
        <PipelineFlow />
      </section>

      {/* Quick Navigation Cards */}
      <section className="page-enter page-enter-delay-4" style={{ marginBottom: '36px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
        }}>
          <button className="card" onClick={() => navigate('/forecast')} style={{
            padding: '20px',
            cursor: 'pointer',
            textAlign: 'left',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MapPin size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
                Live Forecast
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Interactive map, blended forecast, uncertainty, and extreme weather guidance.
            </p>
          </button>

          <button className="card" onClick={() => navigate('/models')} style={{
            padding: '20px',
            cursor: 'pointer',
            textAlign: 'left',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <BarChart3 size={18} style={{ color: 'var(--accent-ai)', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
                Model Intelligence
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Dynamic AI weights, model comparison, and provider registry.
            </p>
          </button>

          <button className="card" onClick={() => navigate('/indian-nwp')} style={{
            padding: '20px',
            cursor: 'pointer',
            textAlign: 'left',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>🇮🇳</span>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.2px', lineHeight: 1.4 }}>
                Indian NWP
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              BharatFS 6 km integration, Mission Mausam, and Indian model ecosystem.
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};

export default OverviewPage;
