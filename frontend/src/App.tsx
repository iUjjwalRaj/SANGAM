import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { AppHeader } from './components/layout/AppHeader';
import { useTheme } from './hooks/useTheme';
import { fetchLocations, fetchForecast } from './services/api';
import type { LocationInfo, ForecastResponse } from './types';

// Pages
import OverviewPage from './pages/OverviewPage';
import ForecastPage from './pages/ForecastPage';
import ModelIntelligencePage from './pages/ModelIntelligencePage';
import ValidationPage from './pages/ValidationPage';
import IndianNWPPage from './pages/IndianNWPPage';
import ExplainabilityPage from './pages/ExplainabilityPage';



export function App() {
  // Theme
  const { theme, cycleTheme, themeLabel } = useTheme();

  // Data state
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>({
    name: 'New Delhi',
    state: 'Delhi',
    region: 'North India (Indo-Gangetic Plain)',
    lat: 28.6139,
    lon: 77.2090,
    elevation_m: 216,
  });
  const [leadTime, setLeadTime] = useState<number>(24);
  const [dataMode, setDataMode] = useState<string>('auto');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load locations on mount
  useEffect(() => {
    fetchLocations().then((locs) => {
      if (locs.length > 0) {
        setLocations(locs);
        setCurrentLocation(locs[0]);
      }
    });
  }, []);

  // Fetch forecast whenever location, leadTime, or dataMode changes
  const loadForecast = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchForecast(
        currentLocation.lat,
        currentLocation.lon,
        leadTime,
        dataMode
      );
      setForecast(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error communicating with SANGAM backend.';
      console.error('Failed to load forecast:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation.lat, currentLocation.lon, leadTime, dataMode]);

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  // Handle click on map for arbitrary coordinates
  const handleMapClickCoords = (lat: number, lon: number) => {
    setCurrentLocation({
      name: `Custom (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
      region: 'Custom Geodesic Coordinate',
      lat,
      lon,
      elevation_m: 100,
    });
  };

  return (
    <BrowserRouter>
      {/* Sticky Header + Navigation */}
      <AppHeader
        theme={theme}
        onCycleTheme={cycleTheme}
        themeLabel={themeLabel}
        dataSource={forecast?.data_source || 'DEMO/SIMULATED'}
        selectedMode={dataMode}
        onModeChange={setDataMode}
        onRefresh={loadForecast}
        isLoading={isLoading}
      />

      {/* Main content area */}
      <main style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '24px 24px 0',
        minHeight: 'calc(100vh - 120px)',
      }}>
        {/* Error banner */}
        {error && (
          <div className="card" style={{
            padding: '12px 18px',
            marginBottom: '18px',
            borderColor: 'color-mix(in srgb, var(--accent-danger) 40%, transparent)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--accent-danger)',
            fontSize: '13px',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && !forecast && (
          <div style={{
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: 'var(--accent-primary)',
          }}>
            <Loader2 size={32} className="animate-spin" />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              SANGAM loading multi-model forecasts…
            </span>
          </div>
        )}

        {/* Routes — only render when forecast data is available */}
        {forecast && (
          <Routes>
            <Route path="/" element={
              <OverviewPage forecast={forecast} />
            } />
            <Route path="/forecast" element={
              <ForecastPage
                locations={locations}
                currentLocation={currentLocation}
                setCurrentLocation={setCurrentLocation}
                leadTime={leadTime}
                setLeadTime={setLeadTime}
                forecast={forecast}
                handleMapClickCoords={handleMapClickCoords}
              />
            } />
            <Route path="/models" element={
              <ModelIntelligencePage
                forecast={forecast}
                leadTime={leadTime}
                setLeadTime={setLeadTime}
              />
            } />
            <Route path="/validation" element={
              <ValidationPage
                forecast={forecast}
                leadTime={leadTime}
                setLeadTime={setLeadTime}
              />
            } />
            <Route path="/indian-nwp" element={
              <IndianNWPPage />
            } />
            <Route path="/explainability" element={
              <ExplainabilityPage forecast={forecast} />
            } />
          </Routes>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 16px',
        borderTop: '1px solid var(--border)',
        fontSize: '12px',
        color: 'var(--text-muted)',
        maxWidth: '1440px',
        margin: '0 auto',
      }}>
        <p>
          <strong style={{ color: 'var(--text-secondary)' }}>SANGAM</strong> — Hybrid AI–NWP Multi-Model Forecast Blending System
        </p>
        <p style={{ marginTop: '4px' }}>
          Operational Multi-Model Weather Synthesis & Dynamic ML Reliability Weighting
        </p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
