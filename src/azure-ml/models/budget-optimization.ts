/**
 * Budget Optimization Model Service
 * ANL Agent - Azure ML Integration
 */

import AzureMLClient, { ScoringRequest, ScoringResponse } from '../client';
import { ANL_ENDPOINTS } from '../endpoints';

export interface BudgetOptimizationInput {
  channelId: string;
  currentSpend: number;
  historicalPerformance: number[];
  seasonalityIndex: number;
  competitiveIntensity: number;
  audienceSize: number;
}

export interface BudgetOptimizationOutput {
  optimalSpend: number;
  expectedReturn: number;
  confidenceIntervalLower: number;
  confidenceIntervalUpper: number;
  marginalReturn: number;
  channelId: string;
}

export interface BudgetOptimizationResult {
  results: BudgetOptimizationOutput[];
  modelVersion: string;
  requestId: string;
  latencyMs: number;
}

export class BudgetOptimizationService {
  private client: AzureMLClient;

  constructor(client: AzureMLClient) {
    this.client = client;
  }

  private validateInput(input: BudgetOptimizationInput): void {
    if (!input.channelId || typeof input.channelId !== 'string') {
      throw new Error('channelId is required and must be a string');
    }
    if (typeof input.currentSpend !== 'number' || input.currentSpend < 0) {
      throw new Error('currentSpend must be a non-negative number');
    }
    if (!Array.isArray(input.historicalPerformance) || input.historicalPerformance.length < 3) {
      throw new Error('historicalPerformance must be an array with at least 3 data points');
    }
    if (typeof input.seasonalityIndex !== 'number' || input.seasonalityIndex < 0 || input.seasonalityIndex > 2) {
      throw new Error('seasonalityIndex must be a number between 0 and 2');
    }
    if (typeof input.competitiveIntensity !== 'number' || input.competitiveIntensity < 0 || input.competitiveIntensity > 1) {
      throw new Error('competitiveIntensity must be a number between 0 and 1');
    }
    if (typeof input.audienceSize !== 'number' || input.audienceSize < 0) {
      throw new Error('audienceSize must be a non-negative integer');
    }
  }

  private transformInput(inputs: BudgetOptimizationInput[]): ScoringRequest {
    return {
      data: inputs.map(input => ({
        channel_id: input.channelId,
        current_spend: input.currentSpend,
        historical_performance: input.historicalPerformance,
        seasonality_index: input.seasonalityIndex,
        competitive_intensity: input.competitiveIntensity,
        audience_size: input.audienceSize,
      })),
    };
  }

  private transformOutput(response: ScoringResponse, inputs: BudgetOptimizationInput[]): BudgetOptimizationResult {
    const predictions = response.predictions as Array<{
      optimal_spend: number;
      expected_return: number;
      confidence_interval_lower: number;
      confidence_interval_upper: number;
      marginal_return: number;
    }>;

    return {
      results: predictions.map((pred, index) => ({
        optimalSpend: pred.optimal_spend,
        expectedReturn: pred.expected_return,
        confidenceIntervalLower: pred.confidence_interval_lower,
        confidenceIntervalUpper: pred.confidence_interval_upper,
        marginalReturn: pred.marginal_return,
        channelId: inputs[index].channelId,
      })),
      modelVersion: response.modelVersion,
      requestId: response.requestId,
      latencyMs: response.latencyMs,
    };
  }

  async optimize(inputs: BudgetOptimizationInput[]): Promise<BudgetOptimizationResult> {
    inputs.forEach(input => this.validateInput(input));
    const request = this.transformInput(inputs);
    const response = await this.client.score(ANL_ENDPOINTS.BUDGET_OPTIMIZER, request);
    return this.transformOutput(response, inputs);
  }

  async optimizeSingle(input: BudgetOptimizationInput): Promise<BudgetOptimizationOutput> {
    const result = await this.optimize([input]);
    return result.results[0];
  }

  async healthCheck(): Promise<boolean> {
    return this.client.healthCheck(ANL_ENDPOINTS.BUDGET_OPTIMIZER);
  }
}

export default BudgetOptimizationService;
