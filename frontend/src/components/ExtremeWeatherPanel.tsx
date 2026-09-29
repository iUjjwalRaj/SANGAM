import React from 'react';
import type { ExtremeEventAlert } from '../types';
import { ShieldAlert, AlertTriangle, Info, Clock, MapPin } from 'lucide-react';

interface ExtremeWeatherPanelProps {
  alerts: ExtremeEventAlert[];
}

export const ExtremeWeatherPanel: React.FC<ExtremeWeatherPanelProps> = ({ alerts }) => {
  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'Extreme':
        return { bg: 'color-mix(in srgb, var(--accent-danger) 15%, transparent)', text: 'var(--accent-danger)', border: 'color-mix(in srgb, var(--accent-danger) 40%, transparent)', icon: AlertTriangle };
      case 'Severe':
        return { bg: 'color-mix(in srgb, var(--accent-indian) 15%, transparent)', text: 'var(--accent-indian)', border: 'color-mix(in srgb, var(--accent-indian) 40%, transparent)', icon: AlertTriangle };
      case 'Moderate':
        return { bg: 'color-mix(in srgb, var(--accent-warning) 15%, transparent)', text: 'var(--accent-warning)', border: 'color-mix(in srgb, var(--accent-warning) 40%, transparent)', icon: Info };
      default:
        return { bg: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)', text: 'var(--accent-primary)', border: 'color-mix(in srgb, var(--accent-primary) 40%, transparent)', icon: Info };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={18} color="var(--accent-danger)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Extreme Weather Early Guidance Layer
          </h3>
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: alerts.length > 0 ? 'color-mix(in srgb, var(--accent-danger) 20%, transparent)' : 'color-mix(in srgb, var(--accent-success) 20%, transparent)', color: alerts.length > 0 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
            {alerts.length} Active {alerts.length === 1 ? 'Advisory' : 'Advisories'}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          IMD/NCMRWF Standard Criteria
        </span>
      </div>

      {alerts.length === 0 ? (
        <div style={{
          background: 'color-mix(in srgb, var(--accent-success) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent-success) 20%, transparent)',
          borderRadius: '10px',
          padding: '16px',
          textAlign: 'center',
          color: 'var(--accent-success)',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          No severe weather alerts detected for this forecast window. Climatological parameters within normal thresholds.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {alerts.map((alert, idx) => {
            const style = getSeverityStyle(alert.severity);
            const Icon = style.icon;

            return (
              <div
                key={idx}
                style={{
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={16} color={style.text} />
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {alert.event_type}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: style.text,
                    color: 'var(--text-inverse)',
                    textTransform: 'uppercase'
                  }}>
                    {alert.severity}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {alert.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} /> {alert.affected_region}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {alert.forecast_lead_window}
                  </span>
                </div>

                {/* Risk score bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Risk Index:</span>
                  <div style={{ flex: 1, height: '4px', background: 'var(--surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${alert.risk_score * 100}%`,
                      height: '100%',
                      background: style.text
                    }} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: style.text }}>
                    {Math.round(alert.risk_score * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statistical Validation Disclaimer (Part 11) */}
      <div style={{
        marginTop: '14px',
        padding: '10px 14px',
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontWeight: '700', color: 'var(--accent-warning)', textTransform: 'uppercase', fontSize: '10px' }}>
            Extreme Event Statistical Validation Status:
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
            41-Day Evaluation Window (N = 1,800 total tests)
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
          <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', padding: '6px 10px', borderRadius: '4px' }}>
            Extreme Rain (≥20 mm/24h): <b style={{ color: 'var(--accent-danger)' }}>N = 6</b> — <span style={{ color: 'var(--accent-warning)', fontWeight: '700' }}>INSUFFICIENT SAMPLE SIZE</span>
          </div>
          <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', padding: '6px 10px', borderRadius: '4px' }}>
            Severe Heatwave (≥40°C): <b style={{ color: 'var(--accent-danger)' }}>N = 0</b> — <span style={{ color: 'var(--accent-warning)', fontWeight: '700' }}>INSUFFICIENT SAMPLE SIZE</span>
          </div>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '10px', lineHeight: '1.4' }}>
          * Early guidance alerts are physics-based screening advisories. SANGAM makes no claims of statistically validated extreme-tail skill due to low tail frequencies in this test partition.
        </p>
      </div>
    </div>
  );
};
