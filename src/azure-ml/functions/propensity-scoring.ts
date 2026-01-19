/**
 * Azure Function: Propensity Scoring
 * HTTP trigger for AUD agent propensity scoring
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createMLServices } from '../index';

interface ScoringRequest {
  audienceMembers: { id: string; features: object; segments?: string[] }[];
  targetAction: string;
  modelVersion?: string;
  includeExplanations?: boolean;
}

export async function propensityScoring(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Propensity scoring function triggered');

  try {
    const body = await request.json() as ScoringRequest;

    if (!body.audienceMembers || body.audienceMembers.length === 0 || !body.targetAction) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: audienceMembers and targetAction' },
      };
    }

    const services = createMLServices();
    const result = await services.propensityScoring.scoreAudience({
      audienceMembers: body.audienceMembers.map(m => ({
        id: m.id,
        features: m.features as Record<string, number | string | boolean>,
        segments: m.segments,
      })),
      targetAction: body.targetAction,
      modelVersion: body.modelVersion,
      includeExplanations: body.includeExplanations ?? true,
    });

    if (!result.success) {
      return {
        status: 500,
        jsonBody: { error: result.error, latencyMs: result.latencyMs },
      };
    }

    return {
      status: 200,
      jsonBody: {
        ...result.data,
        metadata: { latencyMs: result.latencyMs, endpoint: result.endpointName },
      },
    };
  } catch (error) {
    context.error('Propensity scoring error:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('propensityScoring', {
  methods: ['POST'],
  authLevel: 'function',
  handler: propensityScoring,
});
