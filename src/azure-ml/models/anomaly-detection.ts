/**
 * Anomaly Detection Service
 * ML-powered performance anomaly detection for PRF agent
 */

import { AzureMLClient, EndpointResponse } from '../client';

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  dimensions?: Record<string, string>;
}

export interface Anomaly {
  timestamp: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'critical' | 'warning' | 'info';
  anomalyType: 'spike' | 'drop' | 'trend_break' | 'seasonality_violation';
  confidence: number;
  possibleCauses?: string[];
}

export interface AnomalyDetectionInput {
  metrics: MetricDataPoint[];
  metricName: string;
  sensitivity: number;
  lookbackPeriod?: number;
  seasonality?: 'daily' | 'weekly' | 'monthly' | 'none';
}

export interface AnomalyDetectionOutput {
  anomalies: Anomaly[];
  baseline: {
    mean: number;
    stdDev: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    seasonalPattern?: number[];
  };
  summary: {
    totalAnomalies: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    healthScore: number;
  };
  recommendations: string[];
}

export class AnomalyDetectionService {
  private client: AzureMLClient;
  private endpointName = 'kdap-anomaly-detector';

  constructor(client: AzureMLClient) {
    this.client = client;
  }

  async detectAnomalies(input: AnomalyDetectionInput): Promise<EndpointResponse<AnomalyDetectionOutput>> {
    const payload = {
      metrics: input.metrics,
      metric_name: input.metricName,
      sensitivity: input.sensitivity,
      lookback_period: input.lookbackPeriod || 30,
      seasonality: input.seasonality || 'weekly',
    };

    return this.client.invokeEndpoint<AnomalyDetectionOutput>(
      this.endpointName,
      payload
    );
  }

  async monitorMetric(
    metricName: string,
    currentValue: number,
    recentHistory: MetricDataPoint[]
  ): Promise<EndpointResponse<{ isAnomaly: boolean; severity?: string; message: string }>> {
    const result = await this.detectAnomalies({
      metrics: [...recentHistory, { timestamp: new Date().toISOString(), value: currentValue }],
      metricName,
      sensitivity: 0.8,
    });

    if (!result.success || !result.data) {
      return {
        ...result,
        data: { isAnomaly: false, message: 'Unable to evaluate' },
      };
    }

    const anomalies = result.data.anomalies;
    if (anomalies.length === 0) {
      return {
        success: true,
        data: { isAnomaly: false, message: 'Metric within normal range' },
        latencyMs: result.latencyMs,
        endpointName: result.endpointName,
      };
    }

    const latestAnomaly = anomalies[anomalies.length - 1];
    return {
      success: true,
      data: {
        isAnomaly: true,
        severity: latestAnomaly.severity,
        message: 'Detected ' + latestAnomaly.anomalyType + ': value ' + currentValue + ' vs expected ' + latestAnomaly.expected,
      },
      latencyMs: result.latencyMs,
      endpointName: result.endpointName,
    };
  }

  async getHealthScore(
    metrics: { name: string; data: MetricDataPoint[] }[]
  ): Promise<EndpointResponse<{ overallScore: number; metricScores: Record<string, number> }>> {
    const results = await Promise.all(
      metrics.map(m => this.detectAnomalies({
        metrics: m.data,
        metricName: m.name,
        sensitivity: 0.7,
      }))
    );

    const metricScores: Record<string, number> = {};
    let totalScore = 0;
    let validMetrics = 0;

    results.forEach((result, index) => {
      if (result.success && result.data) {
        const score = result.data.summary.healthScore;
        metricScores[metrics[index].name] = score;
        totalScore += score;
        validMetrics++;
      }
    });

    return {
      success: true,
      data: {
        overallScore: validMetrics > 0 ? totalScore / validMetrics : 0,
        metricScores,
      },
      latencyMs: results.reduce((sum, r) => sum + r.latencyMs, 0),
      endpointName: this.endpointName,
    };
  }

  async healthCheck(): Promise<boolean> {
    return this.client.healthCheck(this.endpointName);
  }
}
