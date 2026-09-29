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
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.4)', icon: AlertTriangle };
      case 'Severe':
        return { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: 'rgba(249, 115, 22, 0.4)', icon: AlertTriangle };
      case 'Moderate':
        return { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', border: 'rgba(234, 179, 8, 0.4)', icon: Info };
      default:
        return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)', icon: Info };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={18} color="#ef4444" />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.3px' }}>
            Extreme Weather Early Guidance Layer
          </h3>
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: alerts.length > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: alerts.length > 0 ? '#f87171' : '#34d399' }}>
            {alerts.length} Active {alerts.length === 1 ? 'Advisory' : 'Advisories'}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          IMD/NCMRWF Standard Criteria
        </span>
      </div>

      {alerts.length === 0 ? (
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '10px',
          padding: '16px',
          textAlign: 'center',
          color: '#34d399',
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
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
                      {alert.event_type}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: style.text,
                    color: '#070a12',
                    textTransform: 'uppercase'
                  }}>
                    {alert.severity}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {alert.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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
                  <div style={{ flex: 1, height: '4px', background: 'rgba(0,0,0,0.4)', borderRadius: '2px', overflow: 'hidden' }}>
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
        background: 'rgba(0,0,0,0.25)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        fontSize: '11px',
        color: '#cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', fontSize: '10px' }}>
            Extreme Event Statistical Validation Status:
          </span>
          <span style={{ color: '#94a3b8', fontSize: '10px' }}>
            41-Day Evaluation Window (N = 1,800 total tests)
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px' }}>
            Extreme Rain (≥20 mm/24h): <b style={{ color: '#f87171' }}>N = 6</b> — <span style={{ color: '#fbbf24', fontWeight: '700' }}>INSUFFICIENT SAMPLE SIZE</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px' }}>
            Severe Heatwave (≥40°C): <b style={{ color: '#f87171' }}>N = 0</b> — <span style={{ color: '#fbbf24', fontWeight: '700' }}>INSUFFICIENT SAMPLE SIZE</span>
          </div>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '10px', lineHeight: '1.4' }}>
          * Early guidance alerts are physics-based screening advisories. SANGAM makes no claims of statistically validated extreme-tail skill due to low tail frequencies in this test partition.
        </p>
      </div>
    </div>
  );
};
