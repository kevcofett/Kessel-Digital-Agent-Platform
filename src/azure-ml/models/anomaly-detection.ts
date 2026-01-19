/**
 * Anomaly Detection Model Service
 * PRF Agent - Azure ML Integration
 */

import AzureMLClient, { ScoringRequest, ScoringResponse } from '../client';
import { PRF_ENDPOINTS } from '../endpoints';

export interface AnomalyInput {
  metricName: string;
  metricValues: number[];
  timestamps: string[];
  seasonalityPeriod?: number;
  sensitivity?: number;
  contextFeatures?: Record<string, unknown>;
}

export interface AnomalyOutput {
  metricName: string;
  anomalies: Array<{
    timestamp: string;
    value: number;
    score: number;
    type: 'spike' | 'dip' | 'trend' | 'pattern';
    expectedValue: number;
    deviation: number;
  }>;
  baseline: number[];
  isHealthy: boolean;
  summary: {
    totalAnomalies: number;
    criticalCount: number;
    warningCount: number;
    maxDeviation: number;
  };
}

export interface AnomalyResult {
  results: AnomalyOutput[];
  modelVersion: string;
  requestId: string;
  latencyMs: number;
}

export class AnomalyDetectionService {
  private client: AzureMLClient;

  constructor(client: AzureMLClient) {
    this.client = client;
  }

  private validateInput(input: AnomalyInput): void {
    if (!input.metricName || typeof input.metricName !== 'string') {
      throw new Error('metricName is required');
    }
    if (!Array.isArray(input.metricValues) || input.metricValues.length < 10) {
      throw new Error('metricValues must have at least 10 data points');
    }
    if (!Array.isArray(input.timestamps) || input.timestamps.length !== input.metricValues.length) {
      throw new Error('timestamps must match metricValues length');
    }
    if (input.sensitivity !== undefined && (input.sensitivity < 0 || input.sensitivity > 1)) {
      throw new Error('sensitivity must be between 0 and 1');
    }
  }

  private transformInput(inputs: AnomalyInput[]): ScoringRequest {
    return {
      data: inputs.map(input => ({
        metric_name: input.metricName,
        metric_values: input.metricValues,
        timestamps: input.timestamps,
        seasonality_period: input.seasonalityPeriod || 7,
        sensitivity: input.sensitivity || 0.5,
        context_features: input.contextFeatures || {},
      })),
    };
  }

  private transformOutput(response: ScoringResponse, inputs: AnomalyInput[]): AnomalyResult {
    const predictions = response.predictions as Array<{
      anomalies: Array<{
        timestamp: string;
        value: number;
        score: number;
        type: string;
        expected_value: number;
        deviation: number;
      }>;
      baseline: number[];
      is_healthy: boolean;
      summary: {
        total_anomalies: number;
        critical_count: number;
        warning_count: number;
        max_deviation: number;
      };
    }>;

    return {
      results: predictions.map((pred, index) => ({
        metricName: inputs[index].metricName,
        anomalies: pred.anomalies.map(a => ({
          timestamp: a.timestamp,
          value: a.value,
          score: a.score,
          type: a.type as 'spike' | 'dip' | 'trend' | 'pattern',
          expectedValue: a.expected_value,
          deviation: a.deviation,
        })),
        baseline: pred.baseline,
        isHealthy: pred.is_healthy,
        summary: {
          totalAnomalies: pred.summary.total_anomalies,
          criticalCount: pred.summary.critical_count,
          warningCount: pred.summary.warning_count,
          maxDeviation: pred.summary.max_deviation,
        },
      })),
      modelVersion: response.modelVersion,
      requestId: response.requestId,
      latencyMs: response.latencyMs,
    };
  }

  async detect(inputs: AnomalyInput[]): Promise<AnomalyResult> {
    inputs.forEach(input => this.validateInput(input));
    const request = this.transformInput(inputs);
    const response = await this.client.score(PRF_ENDPOINTS.ANOMALY_DETECTOR, request);
    return this.transformOutput(response, inputs);
  }

  async detectSingle(input: AnomalyInput): Promise<AnomalyOutput> {
    const result = await this.detect([input]);
    return result.results[0];
  }

  async detectRealtime(
    metricName: string,
    value: number,
    historicalValues: number[],
    historicalTimestamps: string[]
  ): Promise<{ isAnomaly: boolean; score: number; type?: string }> {
    const now = new Date().toISOString();
    const input: AnomalyInput = {
      metricName,
      metricValues: [...historicalValues, value],
      timestamps: [...historicalTimestamps, now],
      sensitivity: 0.7,
    };

    const result = await this.detectSingle(input);
    const lastAnomaly = result.anomalies.find(a => a.timestamp === now);

    return {
      isAnomaly: !!lastAnomaly,
      score: lastAnomaly?.score || 0,
      type: lastAnomaly?.type,
    };
  }

  async healthCheck(): Promise<boolean> {
    return this.client.healthCheck(PRF_ENDPOINTS.ANOMALY_DETECTOR);
  }
}

export default AnomalyDetectionService;
