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
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-ai) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px color-mix(in srgb, var(--accent-primary) 30%, transparent)'
        }}>
          <Sparkles size={24} color="var(--text-inverse)" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', background: 'linear-gradient(90deg, var(--text-primary) 0%, var(--accent-primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SANGAM
            </h1>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '6px', background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)', color: 'var(--accent-primary)', border: '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)' }}>
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
            background: 'color-mix(in srgb, var(--accent-ai) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent-ai) 35%, transparent)',
            color: 'var(--accent-ai)',
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
            ? 'color-mix(in srgb, var(--accent-success) 12%, transparent)'
            : dataSource === 'HISTORICAL'
            ? 'color-mix(in srgb, var(--accent-warning) 12%, transparent)'
            : 'color-mix(in srgb, var(--accent-ai) 12%, transparent)',
          border: `1px solid ${
            dataSource === 'LIVE'
              ? 'color-mix(in srgb, var(--accent-success) 35%, transparent)'
              : dataSource === 'HISTORICAL'
              ? 'color-mix(in srgb, var(--accent-warning) 35%, transparent)'
              : 'color-mix(in srgb, var(--accent-ai) 35%, transparent)'
          }`
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>DATA MODE</span>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            color: dataSource === 'LIVE' ? 'var(--accent-success)' : dataSource === 'HISTORICAL' ? 'var(--accent-warning)' : 'var(--accent-ai)'
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
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>REFERENCE</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)' }}>
            {dataSource === 'LIVE' ? 'Model State Estimate' : dataSource === 'HISTORICAL' ? 'Reanalysis (ERA5)' : 'Synthetic'}
          </span>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-elevated)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-subtle)' }}>
          {['auto', 'live', 'demo'].map((mode) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              style={{
                background: selectedMode === mode ? 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' : 'transparent',
                color: selectedMode === mode ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: selectedMode === mode ? '1px solid var(--accent-primary)' : '1px solid transparent',
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
            background: 'var(--surface-hover)',
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
