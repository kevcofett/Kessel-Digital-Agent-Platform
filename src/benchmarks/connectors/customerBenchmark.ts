/**
 * Customer Benchmark Connector
 * Connects to customer metrics benchmark APIs for CAC, LTV, churn, NPS, etc.
 */

import {
  BenchmarkAPIConfig,
  CustomerBenchmarkRequest,
  CustomerBenchmarkResponse,
  CustomerBenchmarkMetric,
  CustomerMetricType,
  CustomerSegment,
} from '../types';
import { BaseConnector, ConnectorOptions } from './baseConnector';

export interface CustomerBenchmarkConfig extends BenchmarkAPIConfig {
  provider: 'openview' | 'profitwell' | 'chartmogul' | 'paddle' | 'custom';
}

export class CustomerBenchmarkConnector extends BaseConnector<
  CustomerBenchmarkRequest,
  CustomerBenchmarkResponse
> {
  private readonly provider: string;

  constructor(config: CustomerBenchmarkConfig, options?: ConnectorOptions) {
    super(config, 'customer-benchmark', '1.0.0', options);
    this.provider = config.provider;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.httpClient.get<{ status: string }>('/health');
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  }

  protected async executeRequest(
    request: CustomerBenchmarkRequest
  ): Promise<CustomerBenchmarkResponse> {
    const response = await this.httpClient.post<CustomerBenchmarkResponse>(
      '/benchmarks/customer',
      {
        metrics: request.metrics,
        filters: {
          industry: request.industry,
          businessModel: request.businessModel,
          companyStage: request.companyStage,
        },
      }
    );

    return this.transformResponse(response.data, request);
  }

  protected validateRequest(request: CustomerBenchmarkRequest): void {
    super.validateRequest(request);

    if (!request.metrics || request.metrics.length === 0) {
      throw new Error('At least one metric is required');
    }

    if (!request.industry) {
      throw new Error('Industry is required for customer benchmarks');
    }

    if (!request.businessModel) {
      throw new Error('Business model is required');
    }

    // Validate metric values
    const validMetrics: CustomerMetricType[] = [
      'cac', 'ltv', 'ltv_cac_ratio', 'churn_rate', 'retention_rate',
      'nps', 'csat', 'ces', 'arpu', 'arpa', 'conversion_rate',
      'activation_rate', 'time_to_value', 'expansion_revenue_rate',
      'logo_retention', 'revenue_retention',
    ];

    for (const metric of request.metrics) {
      if (!validMetrics.includes(metric)) {
        throw new Error(`Invalid metric: ${metric}`);
      }
    }

    // Validate business model
    const validModels = ['b2b', 'b2c', 'b2b2c', 'd2c'];
    if (!validModels.includes(request.businessModel)) {
      throw new Error(`Invalid business model: ${request.businessModel}`);
    }
  }

  private transformResponse(
    rawResponse: CustomerBenchmarkResponse,
    request: CustomerBenchmarkRequest
  ): CustomerBenchmarkResponse {
    return {
      requestId: rawResponse.requestId || this.createRequestId(),
      timestamp: rawResponse.timestamp || new Date().toISOString(),
      benchmarks: rawResponse.benchmarks.map(benchmark =>
        this.enrichBenchmark(benchmark)
      ),
      cohortInfo: {
        size: rawResponse.cohortInfo?.size || 0,
        businessModel: request.businessModel,
        stage: request.companyStage || 'all',
      },
    };
  }

  private enrichBenchmark(benchmark: CustomerBenchmarkMetric): CustomerBenchmarkMetric {
    return {
      ...benchmark,
      segment: benchmark.segment || this.categorizeMetric(benchmark.metric),
    };
  }

  private categorizeMetric(metric: CustomerMetricType): CustomerSegment {
    const segments: Record<CustomerMetricType, CustomerSegment> = {
      cac: 'acquisition',
      conversion_rate: 'acquisition',
      activation_rate: 'acquisition',
      time_to_value: 'acquisition',
      ltv: 'lifetime_value',
      ltv_cac_ratio: 'lifetime_value',
      arpu: 'lifetime_value',
      arpa: 'lifetime_value',
      churn_rate: 'retention',
      retention_rate: 'retention',
      logo_retention: 'retention',
      revenue_retention: 'retention',
      expansion_revenue_rate: 'retention',
      nps: 'satisfaction',
      csat: 'satisfaction',
      ces: 'satisfaction',
    };
    return segments[metric] || 'engagement';
  }

  // Convenience methods
  async getAcquisitionBenchmarks(
    industry: string,
    businessModel: 'b2b' | 'b2c' | 'b2b2c' | 'd2c'
  ): Promise<CustomerBenchmarkMetric[]> {
    const response = await this.fetch({
      metrics: ['cac', 'conversion_rate', 'activation_rate', 'time_to_value'],
      industry,
      businessModel,
    });
    return response.benchmarks;
  }

  async getRetentionBenchmarks(
    industry: string,
    businessModel: 'b2b' | 'b2c' | 'b2b2c' | 'd2c'
  ): Promise<CustomerBenchmarkMetric[]> {
    const response = await this.fetch({
      metrics: ['churn_rate', 'retention_rate', 'logo_retention', 'revenue_retention', 'expansion_revenue_rate'],
      industry,
      businessModel,
    });
    return response.benchmarks;
  }

  async getSatisfactionBenchmarks(
    industry: string,
    businessModel: 'b2b' | 'b2c' | 'b2b2c' | 'd2c'
  ): Promise<CustomerBenchmarkMetric[]> {
    const response = await this.fetch({
      metrics: ['nps', 'csat', 'ces'],
      industry,
      businessModel,
    });
    return response.benchmarks;
  }

  async getUnitEconomicsBenchmarks(
    industry: string,
    businessModel: 'b2b' | 'b2c' | 'b2b2c' | 'd2c'
  ): Promise<CustomerBenchmarkMetric[]> {
    const response = await this.fetch({
      metrics: ['ltv', 'cac', 'ltv_cac_ratio', 'arpu', 'arpa'],
      industry,
      businessModel,
    });
    return response.benchmarks;
  }

  async getSaaSBenchmarks(
    industry: string,
    companyStage?: 'startup' | 'growth' | 'scale' | 'mature'
  ): Promise<{
    acquisition: CustomerBenchmarkMetric[];
    retention: CustomerBenchmarkMetric[];
    unitEconomics: CustomerBenchmarkMetric[];
    satisfaction: CustomerBenchmarkMetric[];
  }> {
    const baseRequest = { industry, businessModel: 'b2b' as const, companyStage };

    const [acquisition, retention, unitEconomics, satisfaction] = await Promise.all([
      this.fetch({ ...baseRequest, metrics: ['cac', 'conversion_rate', 'time_to_value'] }),
      this.fetch({ ...baseRequest, metrics: ['churn_rate', 'revenue_retention', 'logo_retention'] }),
      this.fetch({ ...baseRequest, metrics: ['ltv', 'ltv_cac_ratio', 'arpa'] }),
      this.fetch({ ...baseRequest, metrics: ['nps', 'csat'] }),
    ]);

    return {
      acquisition: acquisition.benchmarks,
      retention: retention.benchmarks,
      unitEconomics: unitEconomics.benchmarks,
      satisfaction: satisfaction.benchmarks,
    };
  }

  async compareToIndustry(
    companyMetrics: { metric: CustomerMetricType; value: number }[],
    industry: string,
    businessModel: 'b2b' | 'b2c' | 'b2b2c' | 'd2c'
  ): Promise<{
    metric: CustomerMetricType;
    companyValue: number;
    industryMedian: number;
    percentileRank: number;
    status: 'excellent' | 'good' | 'needs_improvement';
    insight?: string;
  }[]> {
    const metrics = companyMetrics.map(m => m.metric);
    const benchmarkResponse = await this.fetch({ metrics, industry, businessModel });

    return companyMetrics.map(cm => {
      const benchmark = benchmarkResponse.benchmarks.find(
        b => b.metric === cm.metric
      );

      if (!benchmark) {
        return {
          metric: cm.metric,
          companyValue: cm.value,
          industryMedian: 0,
          percentileRank: 50,
          status: 'good' as const,
        };
      }

      const status = this.determineStatus(cm.metric, cm.value, benchmark);

      return {
        metric: cm.metric,
        companyValue: cm.value,
        industryMedian: benchmark.benchmark.median,
        percentileRank: benchmark.percentileRank,
        status,
        insight: this.generateInsight(cm.metric, status, cm.value, benchmark),
      };
    });
  }

  private determineStatus(
    metric: CustomerMetricType,
    value: number,
    benchmark: CustomerBenchmarkMetric
  ): 'excellent' | 'good' | 'needs_improvement' {
    // Metrics where higher is better
    const higherIsBetter = [
      'ltv', 'ltv_cac_ratio', 'retention_rate', 'nps', 'csat', 'ces',
      'arpu', 'arpa', 'conversion_rate', 'activation_rate',
      'expansion_revenue_rate', 'logo_retention', 'revenue_retention',
    ];

    // Metrics where lower is better
    const lowerIsBetter = ['cac', 'churn_rate', 'time_to_value'];

    if (higherIsBetter.includes(metric)) {
      if (value >= benchmark.benchmark.percentile75!) return 'excellent';
      if (value >= benchmark.benchmark.percentile25!) return 'good';
      return 'needs_improvement';
    }

    if (lowerIsBetter.includes(metric)) {
      if (value <= benchmark.benchmark.percentile25!) return 'excellent';
      if (value <= benchmark.benchmark.percentile75!) return 'good';
      return 'needs_improvement';
    }

    return 'good';
  }

  private generateInsight(
    metric: CustomerMetricType,
    status: 'excellent' | 'good' | 'needs_improvement',
    value: number,
    benchmark: CustomerBenchmarkMetric
  ): string | undefined {
    if (status === 'excellent') {
      return `Your ${metric} of ${value} is in the top quartile of your industry`;
    }

    if (status === 'needs_improvement') {
      const insights: Partial<Record<CustomerMetricType, string>> = {
        cac: `Your CAC is ${Math.round((value / benchmark.benchmark.median - 1) * 100)}% higher than industry median. Consider optimizing acquisition channels.`,
        churn_rate: `Your churn rate is above industry average. Focus on customer success and onboarding.`,
        ltv_cac_ratio: `Your LTV:CAC ratio suggests acquisition costs may be too high relative to customer value.`,
        nps: `Your NPS indicates room for improvement in customer satisfaction.`,
        retention_rate: `Focus on understanding why customers leave and addressing those issues.`,
      };
      return insights[metric];
    }

    return undefined;
  }

  async calculateHealthScore(
    companyMetrics: { metric: CustomerMetricType; value: number }[],
    industry: string,
    businessModel: 'b2b' | 'b2c' | 'b2b2c' | 'd2c'
  ): Promise<{
    overallScore: number;
    categoryScores: {
      acquisition: number;
      retention: number;
      satisfaction: number;
      unitEconomics: number;
    };
    recommendations: string[];
  }> {
    const comparison = await this.compareToIndustry(companyMetrics, industry, businessModel);

    // Weight metrics by importance
    const weights: Partial<Record<CustomerMetricType, number>> = {
      ltv_cac_ratio: 0.15,
      churn_rate: 0.15,
      nps: 0.10,
      revenue_retention: 0.15,
      cac: 0.10,
      ltv: 0.10,
      conversion_rate: 0.10,
      retention_rate: 0.15,
    };

    // Calculate scores
    const scores = comparison.map(c => {
      const weight = weights[c.metric] || 0.05;
      const statusScore = c.status === 'excellent' ? 100 : c.status === 'good' ? 70 : 40;
      return { metric: c.metric, score: statusScore, weight };
    });

    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const overallScore = Math.round(
      scores.reduce((sum, s) => sum + s.score * s.weight, 0) / totalWeight
    );

    // Category scores
    const acquisitionMetrics = ['cac', 'conversion_rate', 'activation_rate', 'time_to_value'];
    const retentionMetrics = ['churn_rate', 'retention_rate', 'logo_retention', 'revenue_retention'];
    const satisfactionMetrics = ['nps', 'csat', 'ces'];
    const unitEconomicsMetrics = ['ltv', 'ltv_cac_ratio', 'arpu', 'arpa'];

    const categoryScore = (metrics: string[]) => {
      const filtered = scores.filter(s => metrics.includes(s.metric));
      if (filtered.length === 0) return 70;
      return Math.round(filtered.reduce((sum, s) => sum + s.score, 0) / filtered.length);
    };

    // Generate recommendations
    const recommendations = comparison
      .filter(c => c.status === 'needs_improvement' && c.insight)
      .map(c => c.insight!)
      .slice(0, 3);

    return {
      overallScore,
      categoryScores: {
        acquisition: categoryScore(acquisitionMetrics),
        retention: categoryScore(retentionMetrics),
        satisfaction: categoryScore(satisfactionMetrics),
        unitEconomics: categoryScore(unitEconomicsMetrics),
      },
      recommendations,
    };
  }
}

export function createCustomerBenchmarkConnector(
  config: CustomerBenchmarkConfig,
  options?: ConnectorOptions
): CustomerBenchmarkConnector {
  return new CustomerBenchmarkConnector(config, options);
}
