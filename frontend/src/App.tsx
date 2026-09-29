import { useState, useEffect } from 'react';
import type { LocationInfo, ForecastResponse } from './types';
import { fetchLocations, fetchForecast } from './services/api';
import { Header } from './components/Header';
import { HeroOverview } from './components/HeroOverview';
import { PipelineFlow } from './components/PipelineFlow';
import { IndianModelSection } from './components/IndianModelSection';
import { ForecastMap } from './components/ForecastMap';
import { SynthesisCards } from './components/SynthesisCards';
import { DynamicWeightsPanel } from './components/DynamicWeightsPanel';
import { ModelComparison } from './components/ModelComparison';
import { LeadTimePanel } from './components/LeadTimePanel';
import { ExtremeWeatherPanel } from './components/ExtremeWeatherPanel';
import { ExplainabilityPanel } from './components/ExplainabilityPanel';
import { VerificationModal } from './components/VerificationModal';
import { EvaluationScopePanel } from './components/EvaluationScopePanel';
import { AlertTriangle, Loader2 } from 'lucide-react';

export function App() {
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>({
    name: 'New Delhi',
    state: 'Delhi',
    region: 'North India (Indo-Gangetic Plain)',
    lat: 28.6139,
    lon: 77.2090,
    elevation_m: 216
  });
  const [leadTime, setLeadTime] = useState<number>(24);
  const [dataMode, setDataMode] = useState<string>('auto');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState<boolean>(false);

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
  const loadForecast = async () => {
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
    } catch (err: any) {
      console.error('Failed to load forecast:', err);
      setError(err.message || 'Error communicating with SANGAM backend API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [currentLocation, leadTime, dataMode]);

  // Handle click on map for arbitrary coordinates
  const handleMapClickCoords = (lat: number, lon: number) => {
    setCurrentLocation({
      name: `Custom (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
      region: 'Custom Geodesic Coordinate',
      lat,
      lon,
      elevation_m: 100
    });
  };

  return (
    <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '18px 22px' }}>
      {/* Header */}
      <Header
        dataSource={forecast?.data_source || 'LIVE'}
        selectedMode={dataMode}
        onModeChange={(mode) => setDataMode(mode)}
        onRefresh={loadForecast}
        onOpenVerification={() => setIsVerificationOpen(true)}
        isLoading={isLoading}
      />

      {/* Hero Overview & SIH Judge Summary Card (Parts 2, 13, 15, 16) */}
      <HeroOverview dataSource={forecast?.data_source || 'LIVE'} />

      {/* Core Blending Pipeline Visual Flow (Part 3) */}
      <PipelineFlow />

      {/* Error Banner if any */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#f87171',
          fontSize: '13px'
        }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && !forecast && (
        <div style={{
          height: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          color: '#38bdf8'
        }}>
          <Loader2 size={36} className="animate-spin" />
          <span style={{ fontSize: '15px', fontWeight: '600' }}>
            SANGAM AI Engine blending multi-model NWP & AI forecasts...
          </span>
        </div>
      )}

      {forecast && (
        <>
          {/* Scientific Validation Scope & Disclosed Boundaries */}
          <EvaluationScopePanel />

          {/* Top Row: Primary Synthesis Cards & Uncertainty */}
          <SynthesisCards forecast={forecast} />

          {/* Middle Row: Interactive Map (Left) + Dynamic AI Weights (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.25fr) minmax(320px, 1fr)', gap: '18px', marginBottom: '18px' }}>
            <ForecastMap
              currentLocation={currentLocation}
              presetLocations={locations}
              forecast={forecast}
              onSelectLocation={(loc) => setCurrentLocation(loc)}
              onMapClickCoords={handleMapClickCoords}
            />

            <DynamicWeightsPanel
              weights={forecast.weights}
              forecasts={forecast.model_forecasts}
              leadTime={leadTime}
              onLeadTimeChange={(lt) => setLeadTime(lt)}
            />
          </div>

          {/* Model & Baseline Comparison Audit (Part 4) */}
          <ModelComparison
            forecasts={forecast.model_forecasts}
            blendedForecast={forecast.blended_forecast}
            baselines={forecast.baselines}
            weights={forecast.weights.weights}
          />

          {/* Lead Time Analysis (24h | 48h | 72h) */}
          <LeadTimePanel
            forecast={forecast}
            leadTime={leadTime}
            onLeadTimeChange={(lt) => setLeadTime(lt)}
          />

          {/* Dedicated Indian Model Integration Section: BharatFS (Part 12) */}
          <IndianModelSection />

          {/* Bottom Grid: Extreme Weather Guidance (Left) + Explainability (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '18px', marginBottom: '24px' }}>
            <ExtremeWeatherPanel alerts={forecast.extreme_events} />
            <ExplainabilityPanel explainability={forecast.explainability} forecast={forecast} />
          </div>
        </>
      )}

      {/* Verification Benchmark Modal */}
      <VerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        leadTime={leadTime}
      />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px 0',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <p>
          <b>SANGAM: Hybrid AI–NWP Multi-Model Forecast Blending System</b> • Ministry of Earth Sciences (MoES) & National Centre for Medium Range Weather Forecasting (NCMRWF)
        </p>
        <p style={{ marginTop: '4px' }}>
          Smart India Hackathon Problem 26081 • Disaster Management Theme • Seamless operational live & offline-demo architecture
        </p>
      </footer>
    </div>
  );
}

export default App;
