import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';

export const IndianModelSection: React.FC = () => {
  return (
    <div className="glass-panel" style={{
      padding: '22px 24px',
      marginBottom: '22px',
      border: '1px solid rgba(249, 115, 22, 0.35)',
      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.04) 0%, rgba(13, 19, 34, 0.8) 100%)'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🇮🇳</span>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.2px', margin: 0 }}>
              Indian NWP Integration: Bharat Forecast System (BharatFS 6 km)
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Ministry of Earth Sciences (MoES) • IITM Pune • IMD • NCMRWF
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.35)'
          }}>
            ARCHITECTURE SUPPORTED
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.35)'
          }}>
            HISTORICAL VALIDATION PENDING
          </span>
        </div>
      </div>

      {/* Core Scientific Explanatory Statement (Part 12) */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        border: '1px solid var(--border-subtle)',
        fontSize: '13px',
        color: '#cbd5e1',
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
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Spatial Resolution</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#ff9933', marginTop: '2px' }}>6 km × 6 km Grid</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Triangular Cubic Octahedral (TCo) Core</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>National Initiative</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', marginTop: '2px' }}>Mission Mausam</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>₹2,000 Crore Cabinet Allocation (2024)</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Supercomputing Backbone</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8', marginTop: '2px' }}>Arka &amp; Arunika (20 PF)</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>11.77 PF (IITM Pune) • 8.24 PF (NCMRWF)</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Operational Adoption</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', marginTop: '2px' }}>May 26, 2025</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Operationalized by IMD / IITM</div>
        </div>
      </div>

      {/* Authoritative Government Citations Box */}
      <div style={{
        background: 'rgba(7, 10, 18, 0.6)',
        borderRadius: '8px',
        padding: '12px 14px',
        border: '1px solid rgba(249, 115, 22, 0.25)'
      }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#ff9933', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={13} />
          Authoritative Provenance Citations:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            <span><b>PIB Release ID 2053890 (Sept 11, 2024):</b> Union Cabinet approved Mission Mausam (₹2,000 Cr) for advanced 6 km NWP modeling.</span>
            <a href="https://pib.gov.in/PressReleasePage.aspx?PRID=2053890" target="_blank" rel="noreferrer" style={{ color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
              PIB <ExternalLink size={10} />
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            <span><b>PIB Release ID 2054238 (Sept 12, 2024):</b> Prime Minister dedicated <i>Arka</i> (11.77 PF at IITM) and <i>Arunika</i> (8.24 PF at NCMRWF).</span>
            <a href="https://pib.gov.in/PressReleasePage.aspx?PRID=2054238" target="_blank" rel="noreferrer" style={{ color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
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
