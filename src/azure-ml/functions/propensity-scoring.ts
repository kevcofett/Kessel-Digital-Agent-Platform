/**
 * Azure Function: Propensity Scoring
 * HTTP Trigger for AUD Agent ML capability
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createMLServicesFromEnv } from '../index';
import { PropensityInput } from '../models/propensity-scoring';

interface RequestBody {
  customers: PropensityInput[];
  batchSize?: number;
}

app.http('propensityScoring', {
  methods: ['POST'],
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Propensity scoring request received');

    try {
      const body = await request.json() as RequestBody;

      if (!body.customers || !Array.isArray(body.customers)) {
        return {
          status: 400,
          jsonBody: {
            error: 'Invalid request body. Expected { customers: PropensityInput[] }',
          },
        };
      }

      const services = createMLServicesFromEnv();
      const batchSize = body.batchSize || 100;

      const result = body.customers.length > batchSize
        ? await services.propensityScoring.scoreBatch(body.customers, batchSize)
        : await services.propensityScoring.score(body.customers);

      context.log(`Propensity scoring completed: ${result.results.length} customers in ${result.latencyMs}ms`);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: result,
        },
      };
    } catch (error) {
      context.error('Propensity scoring failed:', error);

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
