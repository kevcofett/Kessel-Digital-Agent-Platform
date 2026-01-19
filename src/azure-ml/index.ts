/**
 * KDAP Azure ML Integration
 * Main module exports
 */

export { AzureMLClient, createClient } from './client';
export type { AzureMLConfig, EndpointResponse, ModelPrediction } from './client';

export { KDAP_ENDPOINTS, getEndpointsByAgent, getEndpointByCapability } from './endpoints';
export type { EndpointDefinition } from './endpoints';

export { BudgetOptimizationService } from './models/budget-optimization';
export { PropensityScoringService } from './models/propensity-scoring';
export { AnomalyDetectionService } from './models/anomaly-detection';

// Factory function for creating agent-specific ML services
import { AzureMLClient, createClient, AzureMLConfig } from './client';
import { BudgetOptimizationService } from './models/budget-optimization';
import { PropensityScoringService } from './models/propensity-scoring';
import { AnomalyDetectionService } from './models/anomaly-detection';

export interface KDAPMLServices {
  client: AzureMLClient;
  budgetOptimization: BudgetOptimizationService;
  propensityScoring: PropensityScoringService;
  anomalyDetection: AnomalyDetectionService;
}

export function createMLServices(config?: Partial<AzureMLConfig>): KDAPMLServices {
  const client = createClient(config);
  
  return {
    client,
    budgetOptimization: new BudgetOptimizationService(client),
    propensityScoring: new PropensityScoringService(client),
    anomalyDetection: new AnomalyDetectionService(client),
  };
}

// Environment detection
export function getEnvironment(): 'dev' | 'staging' | 'prod' {
  const env = process.env.KDAP_ENV || 'dev';
  if (['dev', 'staging', 'prod'].includes(env)) {
    return env as 'dev' | 'staging' | 'prod';
  }
  return 'dev';
}

// Endpoint URL helper
export function getEndpointUrl(endpointName: string): string {
  const region = process.env.AZURE_REGION || 'eastus';
  return `https://${endpointName}.${region}.inference.ml.azure.com`;
}
