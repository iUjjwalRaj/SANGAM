import React, { useState } from 'react';
import { Database, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export const EvaluationScopePanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="glass-panel" style={{ padding: '18px 22px', marginBottom: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={18} color="#38bdf8" />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.2px' }}>
              Scientific Validation Scope & Disclosed Boundaries (MoES / NCMRWF)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Strict out-of-sample temporal holdout protocol conforming to Problem Statement 26081.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-subtle)',
            color: '#cbd5e1',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <span>{isExpanded ? 'Hide Methodology Details' : 'View Scope & Limitations'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Primary Scope Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginTop: '14px',
        padding: '12px 14px',
        background: 'rgba(0,0,0,0.25)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Evaluation Period</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', marginTop: '2px' }}>June 15 – July 25, 2024</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>41-day summer monsoon window</div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Benchmark Locations</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', marginTop: '2px' }}>5 Representative Stations</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Delhi, Guwahati, Mumbai, Chennai, Leh</div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Held-Out Test Sample</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', marginTop: '2px' }}>1,800 Test Instances</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>600 per horizon (T+24h, T+48h, T+72h)</div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Validated Operational NWP</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', marginTop: '2px' }}>IFS • GFS • ICON (0.25°)</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Ref: ERA5 Reanalysis (0.25°)</div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Indian NWP System</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f97316', marginTop: '2px' }}>🇮🇳 BharatFS (6 km)</div>
          <div style={{ fontSize: '11px', color: '#fb923c', fontWeight: '600' }}>Validation Pending Archive</div>
        </div>
      </div>

      {/* Expanded Deep-Dive Details */}
      {isExpanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Two Columns: Indian NWP Audit (Left) & Explicit Scientific Limitations (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            
            {/* Left: Bharat Forecast System Status */}
            <div style={{ background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>🇮🇳</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#f97316' }}>
                  Bharat Forecast System (BharatFS 6km) — Data Audit
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '10px' }}>
                BharatFS is India's ultra-high-resolution (6 km) global NWP system developed by <b>IITM Pune</b>, operated by <b>IMD</b>, and supported by <b>NCMRWF</b> on the <i>Arka</i> & <i>Arunika</i> supercomputers (launched May 26, 2025).
              </p>
              
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  <span>Spatial Grid:</span>
                  <span style={{ color: '#f1f5f9', fontWeight: '600' }}>6 km × 6 km (TCo dynamical grid)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  <span>Operational Status:</span>
                  <span style={{ color: '#38bdf8', fontWeight: '600' }}>Operationalized May 2025</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  <span>Summer 2024 Archive:</span>
                  <span style={{ color: '#f87171', fontWeight: '600' }}>Public Archive Unavailable</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  <span>Validation Decision:</span>
                  <span style={{ color: '#fbbf24', fontWeight: '600' }}>Supported architecturally; validation pending archive</span>
                </div>
              </div>

              {/* Authoritative Citations & Government Provenance */}
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(249, 115, 22, 0.2)' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#ff9933', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Authoritative Provenance & Citations:
                </div>
                <ul style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.4', paddingLeft: '14px', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <li><b>PIB Release 2053890 (Sept 11, 2024):</b> Union Cabinet approved Mission Mausam (₹2,000 Cr) for advanced NWP.</li>
                  <li><b>PIB Release 2054238 (Sept 12, 2024):</b> Prime Minister dedicated <i>Arka</i> (11.77 PF, IITM) & <i>Arunika</i> (8.24 PF, NCMRWF).</li>
                  <li><b>IMD/IITM Specification (May 26, 2025):</b> Operational adoption of BharatFS 6 km TCo grid global modeling suite.</li>
                </ul>
              </div>
            </div>

            {/* Right: Disclosed Scientific Limitations */}
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldAlert size={16} color="#ef4444" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#f87171' }}>
                  Disclosed Scientific Boundaries & Caveats
                </span>
              </div>
              <ul style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.5', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><b>Monsoon-Only Scope:</b> 41-day summer monsoon window; does not validate winter fog or cyclone climatology.</li>
                <li><b>Discrete Stations:</b> Evaluates 5 key climate biomes, not continuous nationwide gridded space.</li>
                <li><b>Reanalysis Reference:</b> ERA5 is an atmospheric reanalysis (`REFERENCE_REANALYSIS`), not direct station observations.</li>
                <li><b>Bulk Rain Intermittency:</b> Rainfall gain (+0.80%) 95% CI spans zero ([-0.37%, +3.10%]); declared inconclusive.</li>
                <li><b>Mountain Terrain (Leh):</b> Shows localized temperature degradation (-44.2%) due to coarse reanalysis grid-smoothing.</li>
                <li><b>AIFS Operational Proxy Excluded:</b> Native 0.25° AIFS is excluded from operational NWP tables.</li>
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
