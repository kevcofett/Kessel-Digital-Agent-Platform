/**
 * Azure ML Endpoint Definitions for KDAP
 * Maps agent capabilities to ML model endpoints
 */

export interface EndpointDefinition {
  name: string;
  displayName: string;
  description: string;
  agent: 'ANL' | 'AUD' | 'CHA' | 'PRF' | 'CST';
  capability: string;
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  version: string;
  timeout?: number;
}

export const KDAP_ENDPOINTS: Record<string, EndpointDefinition> = {
  // ANL Agent Endpoints
  'kdap-budget-optimizer': {
    name: 'kdap-budget-optimizer',
    displayName: 'Budget Optimization',
    description: 'Optimizes budget allocation across channels using ML',
    agent: 'ANL',
    capability: 'ANL_BUDGET_OPTIMIZE',
    inputSchema: {
      total_budget: 'number',
      channels: 'array<string>',
      constraints: 'object',
      objective: 'string',
    },
    outputSchema: {
      allocations: 'array<{channel: string, amount: number}>',
      expected_roi: 'number',
      confidence: 'number',
    },
    version: '1.0.0',
    timeout: 30000,
  },

  'kdap-response-curve': {
    name: 'kdap-response-curve',
    displayName: 'Response Curve Fitting',
    description: 'Fits diminishing returns curves to historical data',
    agent: 'ANL',
    capability: 'ANL_RESPONSE_CURVE',
    inputSchema: {
      spend_history: 'array<number>',
      outcome_history: 'array<number>',
      curve_type: 'string',
    },
    outputSchema: {
      curve_params: 'object',
      saturation_point: 'number',
      optimal_spend: 'number',
    },
    version: '1.0.0',
  },

  'kdap-monte-carlo': {
    name: 'kdap-monte-carlo',
    displayName: 'Monte Carlo Simulation',
    description: 'Runs Monte Carlo simulations for uncertainty quantification',
    agent: 'ANL',
    capability: 'ANL_MONTECARLO',
    inputSchema: {
      variables: 'array<{name: string, distribution: string, params: object}>',
      model: 'string',
      iterations: 'number',
    },
    outputSchema: {
      mean: 'number',
      std_dev: 'number',
      percentiles: 'object',
      histogram: 'array<number>',
    },
    version: '1.0.0',
    timeout: 60000,
  },

  'kdap-forecasting': {
    name: 'kdap-forecasting',
    displayName: 'Time Series Forecasting',
    description: 'Forecasts metrics using time series models',
    agent: 'ANL',
    capability: 'ANL_FORECAST',
    inputSchema: {
      historical_data: 'array<{date: string, value: number}>',
      forecast_horizon: 'number',
      seasonality: 'string',
    },
    outputSchema: {
      forecast: 'array<{date: string, value: number, lower: number, upper: number}>',
      model_type: 'string',
      accuracy_metrics: 'object',
    },
    version: '1.0.0',
  },

  // AUD Agent Endpoints
  'kdap-propensity': {
    name: 'kdap-propensity',
    displayName: 'Propensity Scoring',
    description: 'Scores audience members by conversion propensity',
    agent: 'AUD',
    capability: 'AUD_PROPENSITY',
    inputSchema: {
      audience_features: 'array<object>',
      target_action: 'string',
      model_version: 'string',
    },
    outputSchema: {
      scores: 'array<{id: string, score: number, tier: string}>',
      feature_importance: 'object',
    },
    version: '1.0.0',
  },

  'kdap-lookalike': {
    name: 'kdap-lookalike',
    displayName: 'Lookalike Modeling',
    description: 'Builds lookalike audiences from seed audiences',
    agent: 'AUD',
    capability: 'AUD_LOOKALIKE',
    inputSchema: {
      seed_audience: 'array<object>',
      expansion_factor: 'number',
      similarity_threshold: 'number',
    },
    outputSchema: {
      lookalike_ids: 'array<string>',
      similarity_scores: 'array<number>',
      segment_profile: 'object',
    },
    version: '1.0.0',
  },

  'kdap-churn-predictor': {
    name: 'kdap-churn-predictor',
    displayName: 'Churn Prediction',
    description: 'Predicts customer churn probability',
    agent: 'AUD',
    capability: 'AUD_CHURN',
    inputSchema: {
      customer_features: 'array<object>',
      lookback_window: 'number',
    },
    outputSchema: {
      churn_probabilities: 'array<{id: string, probability: number, risk_tier: string}>',
      drivers: 'array<string>',
    },
    version: '1.0.0',
  },

  // PRF Agent Endpoints
  'kdap-anomaly-detector': {
    name: 'kdap-anomaly-detector',
    displayName: 'Anomaly Detection',
    description: 'Detects anomalies in performance metrics',
    agent: 'PRF',
    capability: 'PRF_ANOMALY',
    inputSchema: {
      metrics: 'array<{timestamp: string, value: number}>',
      sensitivity: 'number',
      metric_name: 'string',
    },
    outputSchema: {
      anomalies: 'array<{timestamp: string, value: number, severity: string, expected: number}>',
      baseline: 'object',
    },
    version: '1.0.0',
  },

  'kdap-attribution': {
    name: 'kdap-attribution',
    displayName: 'Shapley Attribution',
    description: 'Calculates Shapley values for channel attribution',
    agent: 'PRF',
    capability: 'PRF_ATTRIBUTION',
    inputSchema: {
      conversion_paths: 'array<array<string>>',
      channel_costs: 'object',
    },
    outputSchema: {
      shapley_values: 'object',
      incremental_revenue: 'object',
      marginal_roas: 'object',
    },
    version: '1.0.0',
    timeout: 45000,
  },

  // CHA Agent Endpoints
  'kdap-media-mix': {
    name: 'kdap-media-mix',
    displayName: 'Media Mix Modeling',
    description: 'Optimizes media mix using Bayesian MMM',
    agent: 'CHA',
    capability: 'CHA_MEDIA_MIX',
    inputSchema: {
      spend_data: 'object',
      outcome_data: 'array<number>',
      external_factors: 'object',
    },
    outputSchema: {
      channel_contributions: 'object',
      optimal_mix: 'object',
      incrementality: 'object',
    },
    version: '1.0.0',
    timeout: 120000,
  },

  // CST Agent Endpoints
  'kdap-prioritizer': {
    name: 'kdap-prioritizer',
    displayName: 'RICE Prioritization',
    description: 'ML-enhanced RICE scoring for initiative prioritization',
    agent: 'CST',
    capability: 'CST_PRIORITIZE',
    inputSchema: {
      initiatives: 'array<{name: string, reach: number, impact: number, confidence: number, effort: number}>',
      weights: 'object',
    },
    outputSchema: {
      ranked_initiatives: 'array<{name: string, rice_score: number, rank: number}>',
      sensitivity_analysis: 'object',
    },
    version: '1.0.0',
  },
};

export function getEndpointsByAgent(agent: string): EndpointDefinition[] {
  return Object.values(KDAP_ENDPOINTS).filter(e => e.agent === agent);
}

export function getEndpointByCapability(capability: string): EndpointDefinition | undefined {
  return Object.values(KDAP_ENDPOINTS).find(e => e.capability === capability);
}
