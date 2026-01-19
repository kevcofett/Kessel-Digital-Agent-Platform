/**
 * Azure Function: Anomaly Detection
 * HTTP Trigger for PRF Agent ML capability
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createMLServicesFromEnv } from '../index';
import { AnomalyInput } from '../models/anomaly-detection';

interface RequestBody {
  metrics: AnomalyInput[];
}

interface RealtimeRequestBody {
  metricName: string;
  value: number;
  historicalValues: number[];
  historicalTimestamps: string[];
}

app.http('anomalyDetection', {
  methods: ['POST'],
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Anomaly detection request received');

    try {
      const body = await request.json() as RequestBody;

      if (!body.metrics || !Array.isArray(body.metrics)) {
        return {
          status: 400,
          jsonBody: {
            error: 'Invalid request body. Expected { metrics: AnomalyInput[] }',
          },
        };
      }

      const services = createMLServicesFromEnv();
      const result = await services.anomalyDetection.detect(body.metrics);

      context.log(`Anomaly detection completed: ${result.results.length} metrics in ${result.latencyMs}ms`);

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: result,
        },
      };
    } catch (error) {
      context.error('Anomaly detection failed:', error);

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

app.http('anomalyDetectionRealtime', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'anomalyDetection/realtime',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    context.log('Real-time anomaly detection request received');

    try {
      const body = await request.json() as RealtimeRequestBody;

      if (!body.metricName || body.value === undefined || !body.historicalValues || !body.historicalTimestamps) {
        return {
          status: 400,
          jsonBody: {
            error: 'Invalid request body for realtime detection',
          },
        };
      }

      const services = createMLServicesFromEnv();
      const result = await services.anomalyDetection.detectRealtime(
        body.metricName,
        body.value,
        body.historicalValues,
        body.historicalTimestamps
      );

      return {
        status: 200,
        jsonBody: {
          success: true,
          data: result,
        },
      };
    } catch (error) {
      context.error('Real-time anomaly detection failed:', error);

      return {
        status: 500,
        jsonBody: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
});
