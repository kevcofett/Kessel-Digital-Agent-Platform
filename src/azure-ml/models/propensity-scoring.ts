/**
 * Propensity Scoring Service
 * ML-powered audience scoring for AUD agent
 */

import { AzureMLClient, EndpointResponse } from '../client';

export interface AudienceMember {
  id: string;
  features: Record<string, number | string | boolean>;
  segments?: string[];
  lastActivity?: string;
}

export interface PropensityScore {
  id: string;
  score: number;
  tier: 'high' | 'medium' | 'low';
  confidence: number;
  topDrivers: { feature: string; impact: number }[];
}

export interface PropensityScoringInput {
  audienceMembers: AudienceMember[];
  targetAction: string;
  modelVersion?: string;
  includeExplanations?: boolean;
}

export interface PropensityScoringOutput {
  scores: PropensityScore[];
  modelInfo: {
    version: string;
    trainedOn: string;
    auc: number;
  };
  segmentBreakdown: {
    tier: string;
    count: number;
    avgScore: number;
  }[];
  featureImportance: { feature: string; importance: number }[];
}

export class PropensityScoringService {
  private client: AzureMLClient;
  private endpointName = 'kdap-propensity';

  constructor(client: AzureMLClient) {
    this.client = client;
  }

  async scoreAudience(input: PropensityScoringInput): Promise<EndpointResponse<PropensityScoringOutput>> {
    const payload = {
      audience_features: input.audienceMembers.map(m => ({
        id: m.id,
        ...m.features,
        segments: m.segments,
        last_activity: m.lastActivity,
      })),
      target_action: input.targetAction,
      model_version: input.modelVersion || 'latest',
      include_explanations: input.includeExplanations ?? true,
    };

    return this.client.invokeEndpoint<PropensityScoringOutput>(
      this.endpointName,
      payload
    );
  }

  async getHighValueSegment(
    audienceMembers: AudienceMember[],
    targetAction: string,
    topPercentile: number = 10
  ): Promise<EndpointResponse<{ highValueIds: string[]; avgScore: number }>> {
    const result = await this.scoreAudience({
      audienceMembers,
      targetAction,
      includeExplanations: false,
    });

    if (!result.success || !result.data) {
      return { ...result, data: undefined };
    }

    const sortedScores = result.data.scores.sort((a, b) => b.score - a.score);
    const cutoff = Math.ceil(sortedScores.length * (topPercentile / 100));
    const topScores = sortedScores.slice(0, cutoff);

    return {
      success: true,
      data: {
        highValueIds: topScores.map(s => s.id),
        avgScore: topScores.reduce((sum, s) => sum + s.score, 0) / topScores.length,
      },
      latencyMs: result.latencyMs,
      endpointName: result.endpointName,
    };
  }

  async buildLookalike(
    seedAudience: AudienceMember[],
    expansionFactor: number = 5,
    similarityThreshold: number = 0.7
  ): Promise<EndpointResponse<{ lookalikeIds: string[]; similarityScores: number[] }>> {
    const payload = {
      seed_audience: seedAudience,
      expansion_factor: expansionFactor,
      similarity_threshold: similarityThreshold,
    };

    return this.client.invokeEndpoint('kdap-lookalike', payload);
  }

  async healthCheck(): Promise<boolean> {
    return this.client.healthCheck(this.endpointName);
  }
}
