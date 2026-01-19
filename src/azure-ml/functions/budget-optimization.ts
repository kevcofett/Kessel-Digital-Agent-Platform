/**
 * Azure Function: Budget Optimization
 * HTTP Trigger for ANL Agent ML capability
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createMLServicesFromEnv } from '../index';
import { BudgetOptimizationInput } from '../models/budget-optimization';

interface RequestBody {
  channels: BudgetOptimizationInput[];
}

app.http('budgetOptimization', {
  methods: ['POST'],
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Budget optimization request received');

    try {
      const body = await request.json() as RequestBody;

      if (!body.channels || !Array.isArray(body.channels)) {
        return {
          status: 400,
          jsonBody: {
            error: 'Invalid request body. Expected { channels: BudgetOptimizationInput[] }',
          },
        };
      }

      const services = createMLServicesFromEnv();
      const result = await services.budgetOptimization.optimize(body.channels);

      context.log(`Budget optimization completed in ${result.latencyMs}ms`);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: result,
        },
      };
    } catch (error) {
      context.error('Budget optimization failed:', error);

      const message = error instanceof Error ? error.message : 'Unknown error';
      const statusCode = message.includes('validation') ? 400 : 500;

      return {
        status: statusCode,
        jsonBody: {
          success: false,
          error: message,
        },
      };
    }
  },
});
