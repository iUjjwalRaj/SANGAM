export type ModelType = "NWP" | "AI" | "ENSEMBLE";
export type DataSourceType = "LIVE" | "HISTORICAL" | "DEMO/SIMULATED";
export type ConfidenceLevel = "High" | "Medium" | "Low";
export type SeverityLevel = "Advisory" | "Moderate" | "Severe" | "Extreme";

export interface LocationInfo {
  id?: string;
  name: string;
  state?: string;
  region?: string;
  lat: number;
  lon: number;
  elevation_m?: number;
}

export interface AtmosphericState {
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction?: number;
  precipitation: number;
  cloud_cover?: number;
  visibility?: number;
  timestamp: string;
}

export interface SingleModelForecast {
  model_id: string;
  model_name: string;
  model_type: ModelType;
  source: string;
  lead_time_hours: number;
  temperature: number;
  precipitation: number;
  wind_speed: number;
  humidity?: number;
  pressure?: number;
  wind_direction?: number;
}

export interface ModelReliabilityWeights {
  variable: string;
  weights: Record<string, number>;
}

export interface WeatherRegimeClassification {
  regime: string;
  confidence: number;
  description: string;
  key_factors: string[];
}

export interface UncertaintyMetrics {
  rainfall_spread: number;
  temperature_spread: number;
  wind_spread: number;
  confidence_level: ConfidenceLevel;
  confidence_score: number;
  rainfall_range: { lower: number; upper: number };
  temperature_range: { lower: number; upper: number };
}

export interface ExtremeEventAlert {
  event_type: string;
  code: string;
  severity: SeverityLevel;
  risk_score: number;
  affected_region: string;
  forecast_lead_window: string;
  description: string;
  supporting_variables: Record<string, any>;
}

export interface BaselineComparison {
  best_single_model: {
    model_id: string;
    model_name: string;
    skill_score: number;
    forecast: Record<string, number>;
  };
  simple_average: Record<string, number>;
  static_historical_weights: Record<string, number>;
  sangam_dynamic_blended: Record<string, number>;
  variance_reduction_pct: number;
}

export interface WeightExplainability {
  model_id: string;
  weight: number;
  primary_reasons: string[];
  historical_skill_score: number;
  regime_affinity: string;
}

export interface ForecastResponse {
  location: LocationInfo;
  lead_time: number;
  target_timestamp: string;
  data_source: DataSourceType;
  weather_regime: WeatherRegimeClassification;
  current_atmospheric_state: AtmosphericState;
  model_forecasts: SingleModelForecast[];
  weights: ModelReliabilityWeights;
  blended_forecast: {
    rainfall: number;
    temperature: number;
    wind_speed: number;
    humidity: number;
    pressure: number;
  };
  baselines: BaselineComparison;
  uncertainty: UncertaintyMetrics;
  extreme_events: ExtremeEventAlert[];
  explainability: WeightExplainability[];
  system_metadata: Record<string, any>;
}

export interface VerificationReport {
  region: string;
  lead_time_hours: number;
  reference_dataset: string;
  sangam_rmse_improvement_pct: number;
  models_comparison: Record<string, any>;
  rankings: Array<{
    name: string;
    model_type: string;
    mae_rainfall: number;
    rmse_rainfall: number;
    bias_rainfall: number;
    temp_mae: number;
    wind_mae: number;
    correlation: number;
    rank: number;
  }>;
  summary: string;
  sample_count?: number;
  scientific_disclaimer?: string;
}
