import React from 'react';
import { DynamicWeightsPanel } from '../components/DynamicWeightsPanel';
import { ModelComparison } from '../components/ModelComparison';
import type { ForecastResponse } from '../types';

interface ModelIntelligencePageProps {
  forecast: ForecastResponse;
  leadTime: number;
  setLeadTime: (lt: number) => void;
}

const ModelIntelligencePage: React.FC<ModelIntelligencePageProps> = ({
  forecast,
  leadTime,
  setLeadTime,
}) => {
  return (
    <div className="page-enter" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Model Intelligence</h1>
        <p className="page-subtitle">
          Dynamic AI weighting engine, model comparison, and provider registry
        </p>
      </div>

      {/* Dynamic Weights — the core of this page */}
      <section className="page-enter page-enter-delay-1" style={{ marginBottom: '24px' }}>
        <DynamicWeightsPanel
          weights={forecast.weights}
          forecasts={forecast.model_forecasts}
          leadTime={leadTime}
          onLeadTimeChange={setLeadTime}
        />
      </section>

      {/* Model Comparison Table */}
      <section className="page-enter page-enter-delay-2" style={{ marginBottom: '24px' }}>
        <ModelComparison
          forecasts={forecast.model_forecasts}
          blendedForecast={forecast.blended_forecast}
          baselines={forecast.baselines}
          weights={forecast.weights.weights}
        />
      </section>
    </div>
  );
};

export default ModelIntelligencePage;
