/**
 * Operational Benchmark Connector
 * Connects to operational metrics benchmark APIs for sales, marketing, product, etc.
 */

import {
  BenchmarkAPIConfig,
  OperationalBenchmarkRequest,
  OperationalBenchmarkResponse,
  OperationalBenchmarkMetric,
  OperationalMetricType,
  OperationalArea,
} from '../types';
import { BaseConnector, ConnectorOptions } from './baseConnector';

export interface OperationalBenchmarkConfig extends BenchmarkAPIConfig {
  provider: 'gartner' | 'forrester' | 'mckinsey' | 'deloitte' | 'custom';
}

export class OperationalBenchmarkConnector extends BaseConnector<
  OperationalBenchmarkRequest,
  OperationalBenchmarkResponse
> {
  private readonly provider: string;

  constructor(config: OperationalBenchmarkConfig, options?: ConnectorOptions) {
    super(config, 'operational-benchmark', '1.0.0', options);
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
    request: OperationalBenchmarkRequest
  ): Promise<OperationalBenchmarkResponse> {
    const response = await this.httpClient.post<OperationalBenchmarkResponse>(
      '/benchmarks/operational',
      {
        areas: request.areas,
        metrics: request.metrics,
        filters: {
          industry: request.industry,
          companySize: request.companySize,
        },
      }
    );

    return this.transformResponse(response.data, request);
  }

  protected validateRequest(request: OperationalBenchmarkRequest): void {
    super.validateRequest(request);

    if (!request.areas || request.areas.length === 0) {
      throw new Error('At least one operational area is required');
    }

    if (!request.metrics || request.metrics.length === 0) {
      throw new Error('At least one metric is required');
    }

    if (!request.industry) {
      throw new Error('Industry is required for operational benchmarks');
    }

    // Validate area values
    const validAreas: OperationalArea[] = [
      'sales', 'marketing', 'product', 'engineering', 'support', 'hr',
    ];

    for (const area of request.areas) {
      if (!validAreas.includes(area)) {
        throw new Error(`Invalid operational area: ${area}`);
      }
    }

    // Validate metric values
    const validMetrics: OperationalMetricType[] = [
      'sales_cycle_length', 'win_rate', 'quota_attainment', 'pipeline_coverage',
      'marketing_roi', 'lead_velocity', 'mql_to_sql_rate',
      'time_to_market', 'bug_rate', 'deployment_frequency',
      'first_response_time', 'resolution_time', 'csat_support',
      'employee_nps', 'turnover_rate', 'time_to_hire',
    ];

    for (const metric of request.metrics) {
      if (!validMetrics.includes(metric)) {
        throw new Error(`Invalid metric: ${metric}`);
      }
    }
  }

  private transformResponse(
    rawResponse: OperationalBenchmarkResponse,
    request: OperationalBenchmarkRequest
  ): OperationalBenchmarkResponse {
    return {
      requestId: rawResponse.requestId || this.createRequestId(),
      timestamp: rawResponse.timestamp || new Date().toISOString(),
      benchmarks: rawResponse.benchmarks.map(benchmark =>
        this.enrichBenchmark(benchmark)
      ),
      metadata: {
        sampleSize: rawResponse.metadata?.sampleSize || 0,
        industryCode: request.industry,
      },
    };
  }

  private enrichBenchmark(benchmark: OperationalBenchmarkMetric): OperationalBenchmarkMetric {
    return {
      ...benchmark,
      area: benchmark.area || this.categorizeMetric(benchmark.metric),
    };
  }

  private categorizeMetric(metric: OperationalMetricType): OperationalArea {
    const areas: Record<OperationalMetricType, OperationalArea> = {
      sales_cycle_length: 'sales',
      win_rate: 'sales',
      quota_attainment: 'sales',
      pipeline_coverage: 'sales',
      marketing_roi: 'marketing',
      lead_velocity: 'marketing',
      mql_to_sql_rate: 'marketing',
      time_to_market: 'product',
      bug_rate: 'engineering',
      deployment_frequency: 'engineering',
      first_response_time: 'support',
      resolution_time: 'support',
      csat_support: 'support',
      employee_nps: 'hr',
      turnover_rate: 'hr',
      time_to_hire: 'hr',
    };
    return areas[metric] || 'sales';
  }

  // Convenience methods
  async getSalesBenchmarks(
    industry: string,
    companySize?: 'small' | 'medium' | 'large' | 'enterprise'
  ): Promise<OperationalBenchmarkMetric[]> {
    const response = await this.fetch({
      areas: ['sales'],
      metrics: ['sales_cycle_length', 'win_rate', 'quota_attainment', 'pipeline_coverage'],
      industry,
      companySize,
    });
    return response.benchmarks;
  }

  async getMarketingBenchmarks(
    industry: string,
    companySize?: 'small' | 'medium' | 'large' | 'enterprise'
  ): Promise<OperationalBenchmarkMetric[]> {
    const response = await this.fetch({
      areas: ['marketing'],
      metrics: ['marketing_roi', 'lead_velocity', 'mql_to_sql_rate'],
      industry,
      companySize,
    });
    return response.benchmarks;
  }

  async getProductBenchmarks(
    industry: string,
    companySize?: 'small' | 'medium' | 'large' | 'enterprise'
  ): Promise<OperationalBenchmarkMetric[]> {
    const response = await this.fetch({
      areas: ['product'],
      metrics: ['time_to_market'],
      industry,
      companySize,
    });
    return response.benchmarks;
  }

  async getEngineeringBenchmarks(
    industry: string,
    companySize?: 'small' | 'medium' | 'large' | 'enterprise'
  ): Promise<OperationalBenchmarkMetric[]> {
    const response = await this.fetch({
      areas: ['engineering'],
      metrics: ['bug_rate', 'deployment_frequency'],
      industry,
      companySize,
    });
    return response.benchmarks;
  }

  async getSupportBenchmarks(
    industry: string,
    companySize?: 'small' | 'medium' | 'large' | 'enterprise'
  ): Promise<OperationalBenchmarkMetric[]> {
    const response = await this.fetch({
      areas: ['support'],
      metrics: ['first_response_time', 'resolution_time', 'csat_support'],
      industry,
      companySize,
    });
    return response.benchmarks;
  }

  async getHRBenchmarks(
    industry: string,
    companySize?: 'small' | 'medium' | 'large' | 'enterprise'
  ): Promise<OperationalBenchmarkMetric[]> {
    const response = await this.fetch({
      areas: ['hr'],
      metrics: ['employee_nps', 'turnover_rate', 'time_to_hire'],
      industry,
      companySize,
    });
    return response.benchmarks;
  }

  async getComprehensiveOperationalBenchmarks(
    industry: string,
    companySize?: 'small' | 'medium' | 'large' | 'enterprise'
  ): Promise<{
    sales: OperationalBenchmarkMetric[];
    marketing: OperationalBenchmarkMetric[];
    product: OperationalBenchmarkMetric[];
    engineering: OperationalBenchmarkMetric[];
    support: OperationalBenchmarkMetric[];
    hr: OperationalBenchmarkMetric[];
  }> {
    const [sales, marketing, product, engineering, support, hr] = await Promise.all([
      this.getSalesBenchmarks(industry, companySize),
      this.getMarketingBenchmarks(industry, companySize),
      this.getProductBenchmarks(industry, companySize),
      this.getEngineeringBenchmarks(industry, companySize),
      this.getSupportBenchmarks(industry, companySize),
      this.getHRBenchmarks(industry, companySize),
    ]);

    return { sales, marketing, product, engineering, support, hr };
  }

  async compareToIndustry(
    companyMetrics: { area: OperationalArea; metric: OperationalMetricType; value: number }[],
    industry: string,
    companySize?: 'small' | 'medium' | 'large' | 'enterprise'
  ): Promise<{
    area: OperationalArea;
    metric: OperationalMetricType;
    companyValue: number;
    industryMedian: number;
    percentileRank: number;
    status: 'leading' | 'on_track' | 'lagging';
    improvement?: string;
  }[]> {
    const areas = [...new Set(companyMetrics.map(m => m.area))];
    const metrics = [...new Set(companyMetrics.map(m => m.metric))];

    const benchmarkResponse = await this.fetch({ areas, metrics, industry, companySize });

    return companyMetrics.map(cm => {
      const benchmark = benchmarkResponse.benchmarks.find(
        b => b.area === cm.area && b.metric === cm.metric
      );

      if (!benchmark) {
        return {
          area: cm.area,
          metric: cm.metric,
          companyValue: cm.value,
          industryMedian: 0,
          percentileRank: 50,
          status: 'on_track' as const,
        };
      }

      const status = this.determineStatus(cm.metric, cm.value, benchmark);

      return {
        area: cm.area,
        metric: cm.metric,
        companyValue: cm.value,
        industryMedian: benchmark.benchmark.median,
        percentileRank: benchmark.percentileRank,
        status,
        improvement: status === 'lagging' ? this.generateImprovement(cm.metric) : undefined,
      };
    });
  }

  private determineStatus(
    metric: OperationalMetricType,
    value: number,
    benchmark: OperationalBenchmarkMetric
  ): 'leading' | 'on_track' | 'lagging' {
    // Metrics where higher is better
    const higherIsBetter = [
      'win_rate', 'quota_attainment', 'pipeline_coverage',
      'marketing_roi', 'lead_velocity', 'mql_to_sql_rate',
      'deployment_frequency', 'csat_support', 'employee_nps',
    ];

    // Metrics where lower is better
    const lowerIsBetter = [
      'sales_cycle_length', 'time_to_market', 'bug_rate',
      'first_response_time', 'resolution_time', 'turnover_rate', 'time_to_hire',
    ];

    if (higherIsBetter.includes(metric)) {
      if (value >= benchmark.benchmark.percentile75!) return 'leading';
      if (value >= benchmark.benchmark.percentile25!) return 'on_track';
      return 'lagging';
    }

    if (lowerIsBetter.includes(metric)) {
      if (value <= benchmark.benchmark.percentile25!) return 'leading';
      if (value <= benchmark.benchmark.percentile75!) return 'on_track';
      return 'lagging';
    }

    return 'on_track';
  }

  private generateImprovement(metric: OperationalMetricType): string {
    const improvements: Record<OperationalMetricType, string> = {
      sales_cycle_length: 'Streamline sales process and improve qualification criteria',
      win_rate: 'Focus on better lead qualification and sales enablement',
      quota_attainment: 'Review quota setting methodology and sales training',
      pipeline_coverage: 'Increase lead generation and improve pipeline management',
      marketing_roi: 'Optimize channel mix and improve attribution',
      lead_velocity: 'Accelerate lead generation and nurturing processes',
      mql_to_sql_rate: 'Improve lead scoring and sales-marketing alignment',
      time_to_market: 'Streamline product development and reduce bottlenecks',
      bug_rate: 'Invest in QA processes and test automation',
      deployment_frequency: 'Implement CI/CD and reduce deployment friction',
      first_response_time: 'Add support capacity or implement chatbots',
      resolution_time: 'Improve knowledge base and agent training',
      csat_support: 'Focus on support quality and customer feedback',
      employee_nps: 'Improve employee engagement and workplace culture',
      turnover_rate: 'Review compensation, growth opportunities, and culture',
      time_to_hire: 'Streamline hiring process and improve employer branding',
    };

    return improvements[metric];
  }

  async calculateOperationalExcellenceScore(
    companyMetrics: { area: OperationalArea; metric: OperationalMetricType; value: number }[],
    industry: string,
    companySize?: 'small' | 'medium' | 'large' | 'enterprise'
  ): Promise<{
    overallScore: number;
    areaScores: Record<OperationalArea, number>;
    topStrengths: string[];
    topWeaknesses: string[];
    prioritizedActions: string[];
  }> {
    const comparison = await this.compareToIndustry(companyMetrics, industry, companySize);

    // Calculate area scores
    const areaScores: Record<OperationalArea, number> = {
      sales: 70,
      marketing: 70,
      product: 70,
      engineering: 70,
      support: 70,
      hr: 70,
    };

    const areas: OperationalArea[] = ['sales', 'marketing', 'product', 'engineering', 'support', 'hr'];

    for (const area of areas) {
      const areaMetrics = comparison.filter(c => c.area === area);
      if (areaMetrics.length > 0) {
        const avgScore = areaMetrics.reduce((sum, m) => {
          const score = m.status === 'leading' ? 100 : m.status === 'on_track' ? 70 : 40;
          return sum + score;
        }, 0) / areaMetrics.length;
        areaScores[area] = Math.round(avgScore);
      }
    }

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(areaScores).reduce((sum, score) => sum + score, 0) / 6
    );

    // Identify strengths and weaknesses
    const leading = comparison.filter(c => c.status === 'leading').map(c => `${c.area}: ${c.metric}`);
    const lagging = comparison.filter(c => c.status === 'lagging');

    return {
      overallScore,
      areaScores,
      topStrengths: leading.slice(0, 3),
      topWeaknesses: lagging.slice(0, 3).map(c => `${c.area}: ${c.metric}`),
      prioritizedActions: lagging.slice(0, 3).map(c => c.improvement!).filter(Boolean),
    };
  }
}

export function createOperationalBenchmarkConnector(
  config: OperationalBenchmarkConfig,
  options?: ConnectorOptions
): OperationalBenchmarkConnector {
  return new OperationalBenchmarkConnector(config, options);
}
