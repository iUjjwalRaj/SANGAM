import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';

export const IndianModelSection: React.FC = () => {
  return (
    <div className="glass-panel" style={{
      padding: '22px 24px',
      marginBottom: '22px',
      border: '1px solid color-mix(in srgb, var(--accent-indian) 35%, transparent)',
      background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-indian) 10%, transparent) 0%, var(--surface) 100%)'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🇮🇳</span>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0 }}>
              Indian NWP Integration: Bharat Forecast System (BharatFS 6 km)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Model Provenance: Developed by IITM Pune, IMD & NCMRWF (MoES)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'color-mix(in srgb, var(--accent-warning) 15%, transparent)',
            color: 'var(--accent-warning)',
            border: '1px solid color-mix(in srgb, var(--accent-warning) 35%, transparent)'
          }}>
            ARCHITECTURE SUPPORTED
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'color-mix(in srgb, var(--accent-danger) 15%, transparent)',
            color: 'var(--accent-danger)',
            border: '1px solid color-mix(in srgb, var(--accent-danger) 35%, transparent)'
          }}>
            HISTORICAL VALIDATION PENDING
          </span>
        </div>
      </div>

      {/* Core Scientific Explanatory Statement (Part 12) */}
      <div style={{
        background: 'var(--surface-elevated)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        border: '1px solid var(--border-subtle)',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.5'
      }}>
        <b>Scientific Protocol Disclosure:</b> "Bharat Forecast System (BharatFS) is integrated at the architecture/provider level, but historical quantitative validation on the current 2024 benchmark is pending because a reproducible public forecast archive for that period is unavailable."
      </div>

      {/* Specifications Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Spatial Resolution</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-indian)', marginTop: '2px' }}>6 km × 6 km Grid</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Triangular Cubic Octahedral (TCo) Core</div>
        </div>

        <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>National Initiative</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>Mission Mausam</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>₹2,000 Crore Cabinet Allocation (2024)</div>
        </div>

        <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Supercomputing Backbone</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)', marginTop: '2px' }}>Arka &amp; Arunika (20 PF)</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>11.77 PF (IITM Pune) • 8.24 PF (NCMRWF)</div>
        </div>

        <div style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Operational Adoption</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>May 26, 2025</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Operationalized by IMD / IITM</div>
        </div>
      </div>

      {/* Authoritative Government Citations Box */}
      <div style={{
        background: 'var(--surface-elevated)',
        borderRadius: '8px',
        padding: '12px 14px',
        border: '1px solid color-mix(in srgb, var(--accent-indian) 25%, transparent)'
      }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-indian)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={13} />
          Authoritative Provenance Citations:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
            <span><b>PIB Release ID 2053890 (Sept 11, 2024):</b> Union Cabinet approved Mission Mausam (₹2,000 Cr) for advanced 6 km NWP modeling.</span>
            <a href="https://pib.gov.in/PressReleasePage.aspx?PRID=2053890" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
              PIB <ExternalLink size={10} />
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
            <span><b>PIB Release ID 2054238 (Sept 12, 2024):</b> Prime Minister dedicated <i>Arka</i> (11.77 PF at IITM) and <i>Arunika</i> (8.24 PF at NCMRWF).</span>
            <a href="https://pib.gov.in/PressReleasePage.aspx?PRID=2054238" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
              PIB <ExternalLink size={10} />
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <span><b>IMD / IITM Operational Specification (May 26, 2025):</b> Deployment of 6 km global TCo grid for monsoon forecasting.</span>
            <span style={{ color: 'var(--text-muted)' }}>IMD Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};
