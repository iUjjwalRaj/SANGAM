import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Map,
  Brain,
  FlaskConical,
  Landmark,
  Lightbulb,
  LayoutDashboard
} from 'lucide-react';
import type { Theme } from '../../hooks/useTheme';
import type { DataSourceType } from '../../types';

interface AppHeaderProps {
  theme: Theme;
  onCycleTheme: () => void;
  themeLabel: string;
  dataSource: DataSourceType;
  selectedMode: string;
  onModeChange: (mode: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/forecast', label: 'Forecast', icon: Map },
  { path: '/models', label: 'Model Intelligence', icon: Brain },
  { path: '/validation', label: 'Validation', icon: FlaskConical },
  { path: '/indian-nwp', label: 'Indian NWP', icon: Landmark },
  { path: '/explainability', label: 'Explainability', icon: Lightbulb },
];

export const AppHeader: React.FC<AppHeaderProps> = ({
  theme,
  onCycleTheme,
  themeLabel,
  dataSource,
  selectedMode,
  onModeChange,
  onRefresh,
  isLoading
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ThemeIcon = theme === 'light' ? Sun : theme === 'oled' ? Monitor : Moon;

  const modeColors: Record<string, { bg: string; text: string; border: string }> = {
    'LIVE': { bg: 'color-mix(in srgb, var(--accent-success) 12%, transparent)', text: 'var(--accent-success)', border: 'color-mix(in srgb, var(--accent-success) 30%, transparent)' },
    'HISTORICAL': { bg: 'color-mix(in srgb, var(--accent-warning) 12%, transparent)', text: 'var(--accent-warning)', border: 'color-mix(in srgb, var(--accent-warning) 30%, transparent)' },
    'DEMO/SIMULATED': { bg: 'color-mix(in srgb, var(--accent-ai) 12%, transparent)', text: 'var(--accent-ai)', border: 'color-mix(in srgb, var(--accent-ai) 30%, transparent)' },
  };
  const mc = modeColors[dataSource] || modeColors['DEMO/SIMULATED'];

  const modeLabel = dataSource === 'LIVE' ? 'LIVE DATA'
    : dataSource === 'HISTORICAL' ? 'HISTORICAL'
    : 'DEMO';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      transition: 'background var(--transition-slow)',
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        {/* Top row: brand + controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
          gap: '16px',
        }}>
          {/* Brand / Logo area */}
          <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Logo container — replace inner content with actual logo asset */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-ai) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'transform var(--transition-base)',
            }}>
              <Sparkles size={20} color="var(--text-inverse)" />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}>
                SANGAM
              </div>
              <div style={{
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                letterSpacing: '0.3px',
                lineHeight: 1.2,
              }}>
                AI–NWP Forecast Blending
              </div>
            </div>
          </NavLink>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Data mode badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '8px',
              background: mc.bg,
              border: `1px solid ${mc.border}`,
              fontSize: '11px',
              fontWeight: 700,
              color: mc.text,
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: mc.text,
                animation: dataSource === 'LIVE' ? 'pulse-dot 2s infinite' : 'none',
              }} />
              {modeLabel}
            </div>

            {/* Mode selector pills */}
            <div className="desktop-only" style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--surface)',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid var(--border)',
            }}>
              {['auto', 'live', 'demo'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => onModeChange(mode)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    background: selectedMode === mode ? 'color-mix(in srgb, var(--accent-primary) 18%, transparent)' : 'transparent',
                    color: selectedMode === mode ? 'var(--accent-primary)' : 'var(--text-muted)',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={onCycleTheme}
              className="btn-icon"
              title={themeLabel}
              style={{
                width: '34px',
                height: '34px',
              }}
            >
              <ThemeIcon size={16} />
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="btn-icon"
              title="Refresh forecast"
              style={{
                width: '34px',
                height: '34px',
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-icon mobile-menu-toggle"
              style={{
                width: '34px',
                height: '34px',
                display: 'none',
              }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Navigation row */}
        <nav className="desktop-nav" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          paddingBottom: '8px',
          overflowX: 'auto',
        }}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={14} />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Subtle right-aligned context */}
          <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', padding: '0 8px' }}>
            Hybrid AI–NWP Forecast Blending
          </div>
        </nav>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'color-mix(in srgb, var(--bg-primary) 96%, transparent)',
          backdropFilter: 'blur(20px)',
          zIndex: 99,
          padding: '16px 24px',
          animation: 'fadeIn 200ms ease-out',
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', fontSize: '15px' }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Mobile mode selector */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '6px' }}>
            {['auto', 'live', 'demo'].map((mode) => (
              <button
                key={mode}
                onClick={() => { onModeChange(mode); setMobileMenuOpen(false); }}
                className={`btn ${selectedMode === mode ? 'btn-active' : ''}`}
                style={{ flex: 1, textTransform: 'uppercase', fontSize: '12px' }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-only { display: none !important; }
          .mobile-menu-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
};
