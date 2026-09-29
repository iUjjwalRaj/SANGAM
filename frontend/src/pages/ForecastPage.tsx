import React from 'react';
import { ForecastMap } from '../components/ForecastMap';
import { SynthesisCards } from '../components/SynthesisCards';
import { ExtremeWeatherPanel } from '../components/ExtremeWeatherPanel';
import type { LocationInfo, ForecastResponse } from '../types';
import { Sliders } from 'lucide-react';

interface ForecastPageProps {
  locations: LocationInfo[];
  currentLocation: LocationInfo;
  setCurrentLocation: (loc: LocationInfo) => void;
  leadTime: number;
  setLeadTime: (lt: number) => void;
  forecast: ForecastResponse;
  handleMapClickCoords: (lat: number, lon: number) => void;
}

const LEAD_TIMES = [24, 48, 72];

const ForecastPage: React.FC<ForecastPageProps> = ({
  locations,
  currentLocation,
  setCurrentLocation,
  leadTime,
  setLeadTime,
  forecast,
  handleMapClickCoords,
}) => {
  return (
    <div className="page-enter" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 className="page-title">Forecast</h1>
        <p className="page-subtitle">
          Blended multi-model forecast for {currentLocation.name}
          {currentLocation.state ? `, ${currentLocation.state}` : ''}
        </p>
      </div>

      {/* Lead time selector */}
      <div className="page-enter page-enter-delay-1" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '18px',
      }}>
        <Sliders size={14} style={{ color: 'var(--text-muted)' }} />
        <span className="label">Lead Time</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--surface)',
          borderRadius: '8px',
          padding: '3px',
          border: '1px solid var(--border)',
          gap: '2px',
        }}>
          {LEAD_TIMES.map((lt) => (
            <button
              key={lt}
              onClick={() => setLeadTime(lt)}
              style={{
                padding: '5px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: leadTime === lt ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                background: leadTime === lt ? 'color-mix(in srgb, var(--accent-primary) 18%, transparent)' : 'transparent',
                color: leadTime === lt ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              T+{lt}h
            </button>
          ))}
        </div>
      </div>

      {/* Map + Forecast summary grid */}
      <div className="page-enter page-enter-delay-2" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(320px, 1fr)',
        gap: '18px',
        marginBottom: '18px',
      }}>
        <ForecastMap
          currentLocation={currentLocation}
          presetLocations={locations}
          forecast={forecast}
          onSelectLocation={(loc) => setCurrentLocation(loc)}
          onMapClickCoords={handleMapClickCoords}
        />

        {/* Forecast summary cards stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <SynthesisCards forecast={forecast} />
        </div>
      </div>

      {/* Extreme Weather Guidance */}
      <div className="page-enter page-enter-delay-3" style={{ marginBottom: '24px' }}>
        <ExtremeWeatherPanel alerts={forecast.extreme_events} />
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 900px) {
          .page-enter > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ForecastPage;
