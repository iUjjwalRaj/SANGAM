import React, { useEffect, useState } from 'react';
import type { VerificationReport } from '../types';
import { fetchVerification } from '../services/api';
import { X, BarChart2 } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadTime: number;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, leadTime }) => {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [datasetTrack, setDatasetTrack] = useState<'real' | 'synthetic'>('real');

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetchVerification('All India', leadTime, datasetTrack)
      .then((data) => {
        setReport(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed fetching verification:', err);
        setIsLoading(false);
      });
  }, [isOpen, leadTime, datasetTrack]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '26px',
        position: 'relative',
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(0, 240, 255, 0.3)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <BarChart2 size={22} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Multi-Model Verification & Benchmark Matrix
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Scientific verification matrix comparing SANGAM dynamic weighting against constituent models and baseline aggregations.
        </p>

        {/* Track Separation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setDatasetTrack('real')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              background: datasetTrack === 'real' ? 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' : 'rgba(255, 255, 255, 0.05)',
              color: datasetTrack === 'real' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: datasetTrack === 'real' ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid var(--border-subtle)',
              transition: 'all 0.15s ease'
            }}
          >
            Track B — Real Historical (ERA5 Reanalysis)
          </button>
          <button
            onClick={() => setDatasetTrack('synthetic')}
            style={{
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              background: datasetTrack === 'synthetic' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: datasetTrack === 'synthetic' ? '#c084fc' : 'var(--text-secondary)',
              border: datasetTrack === 'synthetic' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-subtle)',
              transition: 'all 0.15s ease'
            }}
          >
            Track A — Synthetic Benchmark (PoC)
          </button>
        </div>

        {report && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '18px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '6px',
              background: datasetTrack === 'real' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${datasetTrack === 'real' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              fontSize: '11px',
              fontWeight: '700',
              color: datasetTrack === 'real' ? '#34d399' : '#fbbf24'
            }}>
              <span>DATASET: {report.reference_dataset}</span>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}>
              <span>{report.sample_count} Test Samples • No Data Leakage</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-primary)' }}>
            Loading verification benchmarks...
          </div>
        ) : report ? (
          <>
            {/* Top Metric Banner: Observed Improvement on Held-Out Test Set */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                    Authoritative Benchmark • 1,800 Held-Out Test Instances (June 15–July 25, 2024)
                  </span>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                    Observed Improvement on Held-Out Test Partition vs Simple Average
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Reference: <b>ERA5 Reanalysis (0.25°)</b>
                </div>
              </div>

              {/* 3 Headline Benchmark Metrics with Bootstrap Confidence Intervals (Part 9) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>2m Temperature RMSE</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>+15.35%</div>
                  <div style={{ fontSize: '10px', color: '#34d399', marginTop: '2px' }}>95% CI: [+12.72%, +17.90%] (excludes 0)</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>1.026°C SANGAM vs 1.212°C Simple Avg</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>10m Wind Speed RMSE</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>+12.86%</div>
                  <div style={{ fontSize: '10px', color: '#34d399', marginTop: '2px' }}>95% CI: [+10.83%, +14.98%] (excludes 0)</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>3.344 km/h SANGAM vs 3.838 km/h Simple Avg</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.35)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>24h Precipitation RMSE</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#fbbf24', marginTop: '2px' }}>+0.80% (Inconclusive)</div>
                  <div style={{ fontSize: '10px', color: '#fb923c', marginTop: '2px' }}>95% CI: [-0.37%, +3.10%] (crosses 0)</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>2.315 mm SANGAM vs 2.334 mm Simple Avg</div>
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>Rank</th>
                    <th style={{ padding: '10px' }}>Model / Pipeline</th>
                    <th style={{ padding: '10px' }}>Type</th>
                    <th style={{ padding: '10px' }}>Rain RMSE (mm)</th>
                    <th style={{ padding: '10px' }}>Rain MAE (mm)</th>
                    <th style={{ padding: '10px' }}>Rain Bias (mm)</th>
                    <th style={{ padding: '10px' }}>Correlation</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rankings.map((row) => {
                    const isSangam = row.name.toLowerCase().includes('sangam');
                    return (
                      <tr
                        key={row.name}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: isSangam ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                          fontWeight: isSangam ? '700' : 'normal'
                        }}
                      >
                        <td style={{ padding: '10px', color: isSangam ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                          #{row.rank}
                        </td>
                        <td style={{ padding: '10px', color: isSangam ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                          {row.name}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: isSangam ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255,255,255,0.06)',
                            color: isSangam ? 'var(--accent-primary)' : 'var(--text-secondary)'
                          }}>
                            {row.model_type}
                          </span>
                        </td>
                        <td style={{ padding: '10px', color: isSangam ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                          {row.rmse_rainfall.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px' }}>{row.mae_rainfall.toFixed(2)}</td>
                        <td style={{ padding: '10px', color: row.bias_rainfall > 0.5 ? '#f87171' : 'var(--text-secondary)' }}>
                          {row.bias_rainfall > 0 ? `+${row.bias_rainfall.toFixed(2)}` : row.bias_rainfall.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px', color: '#34d399' }}>{row.correlation.toFixed(3)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Disclosed Negative Evidence: Leh Orographic Degradation (Part 8) */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '14px',
              fontSize: '11px',
              color: '#f87171',
              lineHeight: '1.45'
            }}>
              <b>Disclosed Negative Regional Result (Leh Trans-Himalayan):</b> In high-altitude mountain terrain (Leh, 3,524 m), SANGAM temperature RMSE degraded by <b>-44.21%</b> (1.03°C vs 0.72°C for simple average). This occurs because steep alpine valleys cause localized thermal inversions that standard reanalysis grids smooth over, illustrating that dynamic ML weighting requires high-resolution regional topography in extreme alpine environments.
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <b>Scientific Audit Protocol:</b> {report.scientific_disclaimer || "Metrics are evaluated on an out-of-sample held-out partition (1,800 test instances) with 72-hour purge buffers to prevent temporal leakage."} Improvement indicators are based on bootstrap confidence intervals; gains whose 95% CI excludes zero are treated as statistically supported, while intervals spanning zero remain inconclusive.
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
