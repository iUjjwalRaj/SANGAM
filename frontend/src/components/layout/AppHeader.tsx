import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
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
import { SangamLogo } from '../SangamLogo';
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
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const ThemeIcon = theme === 'light' ? Sun : theme === 'oled' ? Monitor : Moon;

  const modeColors: Record<string, { bg: string; text: string; border: string }> = {
    'LIVE': { bg: 'color-mix(in srgb, var(--accent-success) 12%, transparent)', text: 'var(--accent-success)', border: 'color-mix(in srgb, var(--accent-success) 30%, transparent)' },
    'HISTORICAL': { bg: 'color-mix(in srgb, var(--accent-warning) 12%, transparent)', text: 'var(--accent-warning)', border: 'color-mix(in srgb, var(--accent-warning) 30%, transparent)' },
    'DEMO/SIMULATED': { bg: 'color-mix(in srgb, var(--accent-ai) 12%, transparent)', text: 'var(--accent-ai)', border: 'color-mix(in srgb, var(--accent-ai) 30%, transparent)' },
  };

  const isLive = selectedMode === 'live' || (selectedMode === 'auto' && dataSource === 'LIVE');
  const effectiveMode = isLive ? 'LIVE' : (dataSource === 'HISTORICAL' ? 'HISTORICAL' : 'DEMO/SIMULATED');
  const mc = modeColors[effectiveMode] || modeColors['DEMO/SIMULATED'];

  const modeLabel = isLive
    ? 'LIVE'
    : dataSource === 'HISTORICAL' ? 'HISTORICAL'
    : 'DEMO';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1100,
      background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      transition: 'background var(--transition-slow)',
    }}>
      <div className="header-container">
        {/* Top row: brand + controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
          gap: '10px',
        }}>
          {/* Brand / Logo area */}
          <NavLink to="/" className="header-brand-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <SangamLogo size="md" isDecorative={true} />
            <div>
              <div className="header-brand-title" style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}>
                SANGAM
              </div>
              <div className="header-brand-subtitle" style={{
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
          <div className="header-right-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* Data mode badge */}
            <div className="header-mode-badge" style={{
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
                animation: isLive ? 'pulse-dot 2s infinite' : 'none',
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
              className="btn-icon header-btn"
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
              className="btn-icon header-btn"
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
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="btn-icon mobile-menu-toggle"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
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

      {/* Mobile nav drawer & backdrop overlay */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="mobile-drawer-wrapper">
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <SangamLogo size="sm" isDecorative={true} />
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '17px',
                    fontWeight: 800,
                    letterSpacing: '-0.3px',
                    color: 'var(--text-primary)',
                    lineHeight: 1.1,
                  }}>
                    SANGAM
                  </div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.2px',
                  }}>
                    AI–NWP Forecast Blending
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="btn-icon"
                aria-label="Close navigation"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-drawer-body">
              <div>
                <div className="label" style={{ marginBottom: '8px', paddingLeft: '4px' }}>Navigation</div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      end={path === '/'}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(path);
                        setMobileMenuOpen(false);
                      }}
                      className={({ isActive }) => `nav-pill mobile-nav-pill ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={17} />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Mobile mode selector */}
              <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <div className="label" style={{ marginBottom: '8px', paddingLeft: '4px' }}>Data Mode</div>
                <div className="mobile-mode-selector">
                  {['auto', 'live', 'demo'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { onModeChange(mode); setMobileMenuOpen(false); }}
                      className={`mobile-mode-btn ${selectedMode === mode ? 'active' : ''}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Operational Multi-Model Weather Synthesis
              </div>
            </div>
          </aside>
        </div>,
        document.body
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
