/**
 * Budget Optimization Service
 * ML-powered budget allocation for ANL agent
 */

import { AzureMLClient, EndpointResponse } from '../client';

export interface BudgetOptimizationInput {
  totalBudget: number;
  channels: string[];
  constraints?: {
    minSpend?: Record<string, number>;
    maxSpend?: Record<string, number>;
    fixedAllocations?: Record<string, number>;
  };
  objective: 'maximize_conversions' | 'maximize_revenue' | 'maximize_reach' | 'minimize_cpa';
  historicalData?: {
    channel: string;
    spend: number;
    outcome: number;
  }[];
}

export interface BudgetAllocation {
  channel: string;
  amount: number;
  percentage: number;
  expectedOutcome: number;
  marginalROI: number;
}

export interface BudgetOptimizationOutput {
  allocations: BudgetAllocation[];
  totalExpectedOutcome: number;
  expectedROI: number;
  confidence: number;
  recommendations: string[];
}

export class BudgetOptimizationService {
  private client: AzureMLClient;
  private endpointName = 'kdap-budget-optimizer';

  constructor(client: AzureMLClient) {
    this.client = client;
  }

  async optimize(input: BudgetOptimizationInput): Promise<EndpointResponse<BudgetOptimizationOutput>> {
    const payload = {
      total_budget: input.totalBudget,
      channels: input.channels,
      constraints: input.constraints || {},
      objective: input.objective,
      historical_data: input.historicalData || [],
    };

    return this.client.invokeEndpoint<BudgetOptimizationOutput>(
      this.endpointName,
      payload
    );
  }

  async getRecommendations(
    currentAllocations: Record<string, number>,
    performanceData: { channel: string; spend: number; conversions: number }[]
  ): Promise<EndpointResponse<{ recommendations: string[]; potentialLift: number }>> {
    const payload = {
      current_allocations: currentAllocations,
      performance_data: performanceData,
      request_type: 'recommendations',
    };

    return this.client.invokeEndpoint(this.endpointName, payload);
  }

  async simulateScenario(
    baseAllocations: Record<string, number>,
    adjustments: Record<string, number>
  ): Promise<EndpointResponse<{ projectedOutcome: number; comparison: object }>> {
    const payload = {
      base_allocations: baseAllocations,
      adjustments,
      request_type: 'simulation',
    };

    return this.client.invokeEndpoint(this.endpointName, payload);
  }

  async healthCheck(): Promise<boolean> {
    return this.client.healthCheck(this.endpointName);
  }
}
