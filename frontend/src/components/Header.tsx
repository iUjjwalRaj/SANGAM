import React from 'react';
import { Sparkles, RefreshCw, BarChart2 } from 'lucide-react';
import type { DataSourceType } from '../types';

interface HeaderProps {
  dataSource: DataSourceType;
  selectedMode: string;
  onModeChange: (mode: string) => void;
  onRefresh: () => void;
  onOpenVerification: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  dataSource,
  selectedMode,
  onModeChange,
  onRefresh,
  onOpenVerification,
  isLoading
}) => {
  return (
    <header className="glass-panel" style={{ padding: '14px 24px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      {/* Brand & Organization Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 50%, #6366f1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
        }}>
          <Sparkles size={24} color="#070a12" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #ffffff 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SANGAM
            </h1>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.2)', color: '#38bdf8', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              MoES / NCMRWF • Problem 26081
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Hybrid AI–NWP Multi-Model Forecast Blending System
          </p>
        </div>
      </div>

      {/* Action Controls & Data Provenance */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Verification Report Button */}
        <button
          onClick={onOpenVerification}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#a5b4fc',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Open ERA5 / IMD Model Verification Matrix"
        >
          <BarChart2 size={16} />
          Verification Benchmarks
        </button>

        {/* DATA MODE Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: '16px',
          background: dataSource === 'LIVE'
            ? 'rgba(16, 185, 129, 0.12)'
            : dataSource === 'HISTORICAL'
            ? 'rgba(245, 158, 11, 0.12)'
            : 'rgba(168, 85, 247, 0.12)',
          border: `1px solid ${
            dataSource === 'LIVE'
              ? 'rgba(16, 185, 129, 0.35)'
              : dataSource === 'HISTORICAL'
              ? 'rgba(245, 158, 11, 0.35)'
              : 'rgba(168, 85, 247, 0.35)'
          }`
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>DATA MODE</span>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            color: dataSource === 'LIVE' ? '#34d399' : dataSource === 'HISTORICAL' ? '#fbbf24' : '#c084fc'
          }}>
            {dataSource === 'LIVE' ? '🟢 LIVE' : dataSource === 'HISTORICAL' ? '🟡 HISTORICAL' : '🟣 SYNTHETIC DEMO'}
          </span>
        </div>

        {/* REFERENCE Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>REFERENCE</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#93c5fd' }}>
            {dataSource === 'LIVE' ? 'Model State Estimate' : dataSource === 'HISTORICAL' ? 'Reanalysis (ERA5)' : 'Synthetic'}
          </span>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-subtle)' }}>
          {['auto', 'live', 'demo'].map((mode) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              style={{
                background: selectedMode === mode ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                color: selectedMode === mode ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: selectedMode === mode ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.15s ease'
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '8px',
            color: 'var(--text-primary)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isLoading ? 0.6 : 1
          }}
          title="Reload Forecast & Ingestion"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
    </header>
  );
};
