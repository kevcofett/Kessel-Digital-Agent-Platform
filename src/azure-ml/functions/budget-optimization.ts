/**
 * Azure Function: Budget Optimization
 * HTTP trigger for ANL agent budget optimization
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createMLServices } from '../index';

interface OptimizationRequest {
  totalBudget: number;
  channels: string[];
  constraints?: object;
  objective?: string;
  historicalData?: object[];
}

export async function budgetOptimization(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Budget optimization function triggered');

  try {
    const body = await request.json() as OptimizationRequest;

    if (!body.totalBudget || !body.channels || body.channels.length === 0) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: totalBudget and channels' },
      };
    }

    const services = createMLServices();
    const result = await services.budgetOptimization.optimize({
      totalBudget: body.totalBudget,
      channels: body.channels,
      constraints: body.constraints as any,
      objective: (body.objective as any) || 'maximize_conversions',
      historicalData: body.historicalData as any,
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
    context.error('Budget optimization error:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('budgetOptimization', {
  methods: ['POST'],
  authLevel: 'function',
  handler: budgetOptimization,
});
