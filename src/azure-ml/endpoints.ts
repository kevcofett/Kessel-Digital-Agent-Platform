/**
 * Model Endpoint Definitions
 * Kessel Digital Agent Platform
 */

import { EndpointConfig } from './client';

// Environment-based configuration
const ENV = process.env.KDAP_ENV || 'dev';
const ENDPOINT_SUFFIX = ENV === 'prod' ? '' : `-${ENV}`;

/**
 * ANL Agent Model Endpoints
 */
export const ANL_ENDPOINTS = {
  BUDGET_OPTIMIZER: {
    name: `kdap-budget-optimizer${ENDPOINT_SUFFIX}`,
    deploymentName: 'budget-optimizer-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,

  RESPONSE_CURVE: {
    name: `kdap-response-curve${ENDPOINT_SUFFIX}`,
    deploymentName: 'response-curve-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,

  MONTE_CARLO: {
    name: `kdap-monte-carlo${ENDPOINT_SUFFIX}`,
    deploymentName: 'monte-carlo-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,

  FORECASTING: {
    name: `kdap-forecasting${ENDPOINT_SUFFIX}`,
    deploymentName: 'prophet-forecast-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,
};

/**
 * AUD Agent Model Endpoints
 */
export const AUD_ENDPOINTS = {
  PROPENSITY: {
    name: `kdap-propensity${ENDPOINT_SUFFIX}`,
    deploymentName: 'propensity-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,

  LOOKALIKE: {
    name: `kdap-lookalike${ENDPOINT_SUFFIX}`,
    deploymentName: 'lookalike-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,

  CHURN_PREDICTOR: {
    name: `kdap-churn-predictor${ENDPOINT_SUFFIX}`,
    deploymentName: 'churn-predictor-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,

  SEGMENTATION: {
    name: `kdap-segmentation${ENDPOINT_SUFFIX}`,
    deploymentName: 'kmeans-segmentation-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,
};

/**
 * PRF Agent Model Endpoints
 */
export const PRF_ENDPOINTS = {
  ANOMALY_DETECTOR: {
    name: `kdap-anomaly-detector${ENDPOINT_SUFFIX}`,
    deploymentName: 'anomaly-detector-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,

  ATTRIBUTION: {
    name: `kdap-attribution${ENDPOINT_SUFFIX}`,
    deploymentName: 'shapley-attribution-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,
};

/**
 * CHA Agent Model Endpoints
 */
export const CHA_ENDPOINTS = {
  MEDIA_MIX: {
    name: `kdap-media-mix${ENDPOINT_SUFFIX}`,
    deploymentName: 'media-mix-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,

  REACH_FREQUENCY: {
    name: `kdap-reach-freq${ENDPOINT_SUFFIX}`,
    deploymentName: 'reach-freq-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,
};

/**
 * CST Agent Model Endpoints
 */
export const CST_ENDPOINTS = {
  PRIORITIZER: {
    name: `kdap-prioritizer${ENDPOINT_SUFFIX}`,
    deploymentName: 'rice-prioritizer-v1',
    apiVersion: '2023-10-01',
  } as EndpointConfig,
};

/**
 * All endpoints by agent
 */
export const ALL_ENDPOINTS = {
  ANL: ANL_ENDPOINTS,
  AUD: AUD_ENDPOINTS,
  PRF: PRF_ENDPOINTS,
  CHA: CHA_ENDPOINTS,
  CST: CST_ENDPOINTS,
};

/**
 * Get endpoint by agent and model name
 */
export function getEndpoint(agent: string, model: string): EndpointConfig | undefined {
  const agentEndpoints = ALL_ENDPOINTS[agent as keyof typeof ALL_ENDPOINTS];
  if (!agentEndpoints) return undefined;
  return agentEndpoints[model as keyof typeof agentEndpoints];
}

/**
 * List all endpoints for an agent
 */
export function listAgentEndpoints(agent: string): EndpointConfig[] {
  const agentEndpoints = ALL_ENDPOINTS[agent as keyof typeof ALL_ENDPOINTS];
  if (!agentEndpoints) return [];
  return Object.values(agentEndpoints);
}

/**
 * List all endpoints across all agents
 */
export function listAllEndpoints(): { agent: string; model: string; config: EndpointConfig }[] {
  const result: { agent: string; model: string; config: EndpointConfig }[] = [];

  for (const [agent, endpoints] of Object.entries(ALL_ENDPOINTS)) {
    for (const [model, config] of Object.entries(endpoints)) {
      result.push({ agent, model, config });
    }
  }

  return result;
}
