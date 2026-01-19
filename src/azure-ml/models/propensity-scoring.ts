/**
 * Propensity Scoring Model Service
 * AUD Agent - Azure ML Integration
 */

import AzureMLClient, { ScoringRequest, ScoringResponse } from '../client';
import { AUD_ENDPOINTS } from '../endpoints';

export interface PropensityInput {
  customerId: string;
  recencyDays: number;
  frequencyCount: number;
  monetaryValue: number;
  tenureMonths: number;
  engagementScore: number;
  channelPreferences: string[];
  demographicFeatures: {
    ageRange?: string;
    incomeRange?: string;
    location?: string;
    [key: string]: unknown;
  };
}

export interface PropensityOutput {
  customerId: string;
  propensityScore: number;
  confidence: number;
  percentileRank: number;
  keyDrivers: Array<{ feature: string; importance: number }>;
  segmentAssignment: string;
}

export interface PropensityResult {
  results: PropensityOutput[];
  modelVersion: string;
  requestId: string;
  latencyMs: number;
}

export class PropensityScoringService {
  private client: AzureMLClient;

  constructor(client: AzureMLClient) {
    this.client = client;
  }

  private validateInput(input: PropensityInput): void {
    if (!input.customerId || typeof input.customerId !== 'string') {
      throw new Error('customerId is required');
    }
    if (typeof input.recencyDays !== 'number' || input.recencyDays < 0) {
      throw new Error('recencyDays must be a non-negative number');
    }
    if (typeof input.frequencyCount !== 'number' || input.frequencyCount < 0) {
      throw new Error('frequencyCount must be a non-negative number');
    }
    if (typeof input.monetaryValue !== 'number') {
      throw new Error('monetaryValue must be a number');
    }
    if (typeof input.tenureMonths !== 'number' || input.tenureMonths < 0) {
      throw new Error('tenureMonths must be a non-negative number');
    }
    if (typeof input.engagementScore !== 'number' || input.engagementScore < 0 || input.engagementScore > 100) {
      throw new Error('engagementScore must be between 0 and 100');
    }
  }

  private transformInput(inputs: PropensityInput[]): ScoringRequest {
    return {
      data: inputs.map(input => ({
        customer_id: input.customerId,
        recency_days: input.recencyDays,
        frequency_count: input.frequencyCount,
        monetary_value: input.monetaryValue,
        tenure_months: input.tenureMonths,
        engagement_score: input.engagementScore,
        channel_preferences: input.channelPreferences,
        demographic_features: input.demographicFeatures,
      })),
    };
  }

  private transformOutput(response: ScoringResponse, inputs: PropensityInput[]): PropensityResult {
    const predictions = response.predictions as Array<{
      propensity_score: number;
      confidence: number;
      percentile_rank: number;
      key_drivers: Array<{ feature: string; importance: number }>;
      segment_assignment: string;
    }>;

    return {
      results: predictions.map((pred, index) => ({
        customerId: inputs[index].customerId,
        propensityScore: pred.propensity_score,
        confidence: pred.confidence,
        percentileRank: pred.percentile_rank,
        keyDrivers: pred.key_drivers,
        segmentAssignment: pred.segment_assignment,
      })),
      modelVersion: response.modelVersion,
      requestId: response.requestId,
      latencyMs: response.latencyMs,
    };
  }

  async score(inputs: PropensityInput[]): Promise<PropensityResult> {
    inputs.forEach(input => this.validateInput(input));
    const request = this.transformInput(inputs);
    const response = await this.client.score(AUD_ENDPOINTS.PROPENSITY, request);
    return this.transformOutput(response, inputs);
  }

  async scoreSingle(input: PropensityInput): Promise<PropensityOutput> {
    const result = await this.score([input]);
    return result.results[0];
  }

  async scoreBatch(inputs: PropensityInput[], batchSize: number = 100): Promise<PropensityResult> {
    const allResults: PropensityOutput[] = [];
    let modelVersion = '';
    let totalLatency = 0;
    const requestIds: string[] = [];

    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const result = await this.score(batch);
      allResults.push(...result.results);
      modelVersion = result.modelVersion;
      totalLatency += result.latencyMs;
      requestIds.push(result.requestId);
    }

    return {
      results: allResults,
      modelVersion,
      requestId: requestIds.join(','),
      latencyMs: totalLatency,
    };
  }

  async healthCheck(): Promise<boolean> {
    return this.client.healthCheck(AUD_ENDPOINTS.PROPENSITY);
  }
}

export default PropensityScoringService;
