/**
 * Azure Function: Anomaly Detection
 * HTTP trigger for PRF agent anomaly detection
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createMLServices } from '../index';

interface DetectionRequest {
  metrics: { timestamp: string; value: number; dimensions?: object }[];
  metricName: string;
  sensitivity?: number;
  lookbackPeriod?: number;
  seasonality?: string;
}

interface MonitorRequest {
  metricName: string;
  currentValue: number;
  recentHistory: { timestamp: string; value: number }[];
}

interface HealthScoreRequest {
  metrics: { name: string; data: { timestamp: string; value: number }[] }[];
}

export async function anomalyDetection(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Anomaly detection function triggered');

  try {
    const action = request.query.get('action') || 'detect';
    const body = await request.json();

    const services = createMLServices();

    if (action === 'monitor') {
      const monitorBody = body as MonitorRequest;
      if (!monitorBody.metricName || monitorBody.currentValue === undefined) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required fields: metricName and currentValue' },
        };
      }

      const result = await services.anomalyDetection.monitorMetric(
        monitorBody.metricName,
        monitorBody.currentValue,
        monitorBody.recentHistory || []
      );

      return {
        status: result.success ? 200 : 500,
        jsonBody: result.success ? result.data : { error: result.error },
      };
    }

    if (action === 'healthScore') {
      const healthBody = body as HealthScoreRequest;
      if (!healthBody.metrics || healthBody.metrics.length === 0) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required field: metrics' },
        };
      }

      const result = await services.anomalyDetection.getHealthScore(healthBody.metrics);

      return {
        status: result.success ? 200 : 500,
        jsonBody: result.success ? result.data : { error: result.error },
      };
    }

    // Default: detect anomalies
    const detectBody = body as DetectionRequest;
    if (!detectBody.metrics || detectBody.metrics.length === 0 || !detectBody.metricName) {
      return {
        status: 400,
        jsonBody: { error: 'Missing required fields: metrics and metricName' },
      };
    }

    const result = await services.anomalyDetection.detectAnomalies({
      metrics: detectBody.metrics,
      metricName: detectBody.metricName,
      sensitivity: detectBody.sensitivity || 0.8,
      lookbackPeriod: detectBody.lookbackPeriod,
      seasonality: detectBody.seasonality as any,
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
    context.error('Anomaly detection error:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

app.http('anomalyDetection', {
  methods: ['POST'],
  authLevel: 'function',
  handler: anomalyDetection,
});
