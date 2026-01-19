/**
 * Azure ML Integration Module
 * Kessel Digital Agent Platform
 * 
 * Provides ML model integration for all KDAP agents:
 * - ANL: Budget Optimization, Response Curves, Monte Carlo, Forecasting
 * - AUD: Propensity Scoring, Lookalike, Churn Prediction, Segmentation
 * - PRF: Anomaly Detection, Attribution
 * - CHA: Media Mix, Reach/Frequency
 * - CST: Prioritization
 */

// Client
export { default as AzureMLClient } from './client';
export type {
  AzureMLConfig,
  EndpointConfig,
  ScoringRequest,
  ScoringResponse,
} from './client';
export {
  MLEndpointError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
} from './client';

// Endpoints
export {
  ANL_ENDPOINTS,
  AUD_ENDPOINTS,
  PRF_ENDPOINTS,
  CHA_ENDPOINTS,
  CST_ENDPOINTS,
  ALL_ENDPOINTS,
  getEndpoint,
  listAgentEndpoints,
  listAllEndpoints,
} from './endpoints';

// Model Services
export * from './models';

// Factory function for creating configured client
import AzureMLClient, { AzureMLConfig } from './client';
import { BudgetOptimizationService } from './models/budget-optimization';
import { PropensityScoringService } from './models/propensity-scoring';
import { AnomalyDetectionService } from './models/anomaly-detection';

export interface KDAPMLServices {
  client: AzureMLClient;
  budgetOptimization: BudgetOptimizationService;
  propensityScoring: PropensityScoringService;
  anomalyDetection: AnomalyDetectionService;
}

export function createMLServices(config: AzureMLConfig): KDAPMLServices {
  const client = new AzureMLClient(config);

  return {
    client,
    budgetOptimization: new BudgetOptimizationService(client),
    propensityScoring: new PropensityScoringService(client),
    anomalyDetection: new AnomalyDetectionService(client),
  };
}

// Default configuration from environment
export function createMLServicesFromEnv(): KDAPMLServices {
  const config: AzureMLConfig = {
    subscriptionId: process.env.AZURE_SUBSCRIPTION_ID || '',
    resourceGroup: process.env.AZURE_RESOURCE_GROUP || '',
    workspaceName: process.env.AZURE_ML_WORKSPACE || '',
    region: process.env.AZURE_REGION || 'eastus',
  };

  if (!config.subscriptionId || !config.resourceGroup || !config.workspaceName) {
    throw new Error(
      'Missing required environment variables: AZURE_SUBSCRIPTION_ID, AZURE_RESOURCE_GROUP, AZURE_ML_WORKSPACE'
    );
  }

  return createMLServices(config);
}
