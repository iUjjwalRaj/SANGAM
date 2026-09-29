import React from 'react';
import { NavLink } from 'react-router-dom';

export const NavBar: React.FC = () => {
  const linkStyle = {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500 as const,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'background 0.2s',
  };
  const activeStyle = {
    background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)',
    color: 'var(--accent-primary)',
    border: '1px solid var(--accent-primary)',
  };
  return (
    <nav style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
      <NavLink to="/" end style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Overview
      </NavLink>
      <NavLink to="/forecast" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Forecast
      </NavLink>
      <NavLink to="/model-intelligence" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Model Intelligence
      </NavLink>
      <NavLink to="/validation" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Validation
      </NavLink>
      <NavLink to="/indian-nwp" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Indian NWP
      </NavLink>
      <NavLink to="/explainability" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Explainability
      </NavLink>
    </nav>
  );
};
