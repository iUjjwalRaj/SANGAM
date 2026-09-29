import React from 'react';
import { IndianModelSection } from '../components/IndianModelSection';

const IndianNWPPage: React.FC = () => {
  return (
    <div className="page-enter" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Indian NWP Integration</h1>
        <p className="page-subtitle">
          Bharat Forecast System (BharatFS) and the Indian weather modelling ecosystem
        </p>
      </div>

      {/* Status Banner */}
      <div className="page-enter page-enter-delay-1 card" style={{
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderColor: 'color-mix(in srgb, var(--accent-indian) 30%, transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🇮🇳</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              BharatFS 6 km Architecture
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Ministry of Earth Sciences (MoES) • IITM Pune • IMD • NCMRWF
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-success">Architecture Supported</span>
          <span className="badge badge-warning">Historical Validation Pending</span>
        </div>
      </div>

      {/* Full BharatFS section (reusing existing component) */}
      <section className="page-enter page-enter-delay-2" style={{ marginBottom: '28px' }}>
        <IndianModelSection />
      </section>

      {/* Validation status explanation */}
      <section className="page-enter page-enter-delay-3" style={{ marginBottom: '28px' }}>
        <h2 className="section-title">Validation Status</h2>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <p style={{ marginBottom: '10px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>BharatFS</strong> is architecturally integrated into the SANGAM provider registry.
              The system is designed to ingest BharatFS GRIB2 forecast outputs alongside ECMWF IFS, NOAA GFS, and DWD ICON.
            </p>
            <p style={{ marginBottom: '10px' }}>
              However, BharatFS <strong style={{ color: 'var(--accent-warning)' }}>does not currently participate</strong> in the authoritative
              historical benchmark blend because a reproducible archived dataset covering the June 15 – July 25, 2024 evaluation
              period is not yet publicly available for independent scientific verification.
            </p>
            <p>
              Once a reproducible BharatFS archive is accessible, a four-model experiment will be conducted using the same
              purged temporal holdout methodology used in the three-model benchmark.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndianNWPPage;
