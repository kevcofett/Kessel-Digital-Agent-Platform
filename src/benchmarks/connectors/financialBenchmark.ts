/**
 * Financial Benchmark Connector
 * Connects to financial benchmark APIs for industry financial metrics
 */

import {
  BenchmarkAPIConfig,
  FinancialBenchmarkRequest,
  FinancialBenchmarkResponse,
  FinancialBenchmarkMetric,
  FinancialMetricType,
  FinancialCategory,
} from '../types';
import { BaseConnector, ConnectorOptions } from './baseConnector';

export interface FinancialBenchmarkConfig extends BenchmarkAPIConfig {
  provider: 'bloomberg' | 'refinitiv' | 'factset' | 'spglobal' | 'custom';
}

export class FinancialBenchmarkConnector extends BaseConnector<
  FinancialBenchmarkRequest,
  FinancialBenchmarkResponse
> {
  private readonly provider: string;

  constructor(config: FinancialBenchmarkConfig, options?: ConnectorOptions) {
    super(config, 'financial-benchmark', '1.0.0', options);
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
    request: FinancialBenchmarkRequest
  ): Promise<FinancialBenchmarkResponse> {
    const response = await this.httpClient.post<FinancialBenchmarkResponse>(
      '/benchmarks/financial',
      {
        metrics: request.metrics,
        filters: {
          industry: request.industry,
          region: request.region,
          companySize: request.companySize,
          fiscalYear: request.fiscalYear,
        },
      }
    );

    return this.transformResponse(response.data, request);
  }

  protected validateRequest(request: FinancialBenchmarkRequest): void {
    super.validateRequest(request);

    if (!request.metrics || request.metrics.length === 0) {
      throw new Error('At least one metric is required');
    }

    if (!request.industry) {
      throw new Error('Industry is required for financial benchmarks');
    }

    // Validate metric values
    const validMetrics: FinancialMetricType[] = [
      'gross_margin', 'operating_margin', 'net_margin', 'ebitda_margin',
      'current_ratio', 'quick_ratio', 'debt_to_equity', 'interest_coverage',
      'asset_turnover', 'inventory_turnover', 'receivables_turnover',
      'roe', 'roa', 'roic', 'pe_ratio', 'ev_ebitda',
      'revenue_growth', 'earnings_growth',
    ];

    for (const metric of request.metrics) {
      if (!validMetrics.includes(metric)) {
        throw new Error(`Invalid metric: ${metric}`);
      }
    }
  }

  private transformResponse(
    rawResponse: FinancialBenchmarkResponse,
    request: FinancialBenchmarkRequest
  ): FinancialBenchmarkResponse {
    return {
      requestId: rawResponse.requestId || this.createRequestId(),
      timestamp: rawResponse.timestamp || new Date().toISOString(),
      benchmarks: rawResponse.benchmarks.map(benchmark =>
        this.enrichBenchmark(benchmark)
      ),
      peerGroup: {
        count: rawResponse.peerGroup?.count || 0,
        industryCode: request.industry,
        region: request.region || 'global',
      },
      metadata: {
        dataDate: rawResponse.metadata?.dataDate || new Date().toISOString(),
        source: this.provider,
      },
    };
  }

  private enrichBenchmark(benchmark: FinancialBenchmarkMetric): FinancialBenchmarkMetric {
    return {
      ...benchmark,
      category: benchmark.category || this.categorizeMetric(benchmark.metric),
    };
  }

  private categorizeMetric(metric: FinancialMetricType): FinancialCategory {
    const categories: Record<FinancialMetricType, FinancialCategory> = {
      gross_margin: 'profitability',
      operating_margin: 'profitability',
      net_margin: 'profitability',
      ebitda_margin: 'profitability',
      current_ratio: 'liquidity',
      quick_ratio: 'liquidity',
      debt_to_equity: 'leverage',
      interest_coverage: 'leverage',
      asset_turnover: 'efficiency',
      inventory_turnover: 'efficiency',
      receivables_turnover: 'efficiency',
      roe: 'profitability',
      roa: 'profitability',
      roic: 'profitability',
      pe_ratio: 'valuation',
      ev_ebitda: 'valuation',
      revenue_growth: 'growth',
      earnings_growth: 'growth',
    };
    return categories[metric] || 'profitability';
  }

  // Convenience methods
  async getProfitabilityBenchmarks(
    industry: string,
    region?: string
  ): Promise<FinancialBenchmarkMetric[]> {
    const response = await this.fetch({
      metrics: ['gross_margin', 'operating_margin', 'net_margin', 'ebitda_margin', 'roe', 'roa', 'roic'],
      industry,
      region,
    });
    return response.benchmarks;
  }

  async getLiquidityBenchmarks(
    industry: string,
    region?: string
  ): Promise<FinancialBenchmarkMetric[]> {
    const response = await this.fetch({
      metrics: ['current_ratio', 'quick_ratio'],
      industry,
      region,
    });
    return response.benchmarks;
  }

  async getLeverageBenchmarks(
    industry: string,
    region?: string
  ): Promise<FinancialBenchmarkMetric[]> {
    const response = await this.fetch({
      metrics: ['debt_to_equity', 'interest_coverage'],
      industry,
      region,
    });
    return response.benchmarks;
  }

  async getEfficiencyBenchmarks(
    industry: string,
    region?: string
  ): Promise<FinancialBenchmarkMetric[]> {
    const response = await this.fetch({
      metrics: ['asset_turnover', 'inventory_turnover', 'receivables_turnover'],
      industry,
      region,
    });
    return response.benchmarks;
  }

  async getGrowthBenchmarks(
    industry: string,
    region?: string
  ): Promise<FinancialBenchmarkMetric[]> {
    const response = await this.fetch({
      metrics: ['revenue_growth', 'earnings_growth'],
      industry,
      region,
    });
    return response.benchmarks;
  }

  async getValuationBenchmarks(
    industry: string,
    region?: string
  ): Promise<FinancialBenchmarkMetric[]> {
    const response = await this.fetch({
      metrics: ['pe_ratio', 'ev_ebitda'],
      industry,
      region,
    });
    return response.benchmarks;
  }

  async getComprehensiveAnalysis(
    industry: string,
    region?: string
  ): Promise<{
    profitability: FinancialBenchmarkMetric[];
    liquidity: FinancialBenchmarkMetric[];
    leverage: FinancialBenchmarkMetric[];
    efficiency: FinancialBenchmarkMetric[];
    growth: FinancialBenchmarkMetric[];
    valuation: FinancialBenchmarkMetric[];
  }> {
    const [profitability, liquidity, leverage, efficiency, growth, valuation] =
      await Promise.all([
        this.getProfitabilityBenchmarks(industry, region),
        this.getLiquidityBenchmarks(industry, region),
        this.getLeverageBenchmarks(industry, region),
        this.getEfficiencyBenchmarks(industry, region),
        this.getGrowthBenchmarks(industry, region),
        this.getValuationBenchmarks(industry, region),
      ]);

    return {
      profitability,
      liquidity,
      leverage,
      efficiency,
      growth,
      valuation,
    };
  }

  async compareToIndustry(
    companyMetrics: { metric: FinancialMetricType; value: number }[],
    industry: string,
    region?: string
  ): Promise<{
    metric: FinancialMetricType;
    companyValue: number;
    industryMedian: number;
    industryAverage: number;
    percentileRank: number;
    status: 'strong' | 'weak' | 'average';
    recommendation?: string;
  }[]> {
    const metrics = companyMetrics.map(m => m.metric);
    const benchmarkResponse = await this.fetch({ metrics, industry, region });

    return companyMetrics.map(cm => {
      const benchmark = benchmarkResponse.benchmarks.find(
        b => b.metric === cm.metric
      );

      if (!benchmark) {
        return {
          metric: cm.metric,
          companyValue: cm.value,
          industryMedian: 0,
          industryAverage: 0,
          percentileRank: 50,
          status: 'average' as const,
        };
      }

      const status = this.determineStatus(cm.metric, cm.value, benchmark);

      return {
        metric: cm.metric,
        companyValue: cm.value,
        industryMedian: benchmark.benchmark.median,
        industryAverage: benchmark.industryAverage,
        percentileRank: benchmark.percentileRank,
        status,
        recommendation: this.generateRecommendation(cm.metric, status),
      };
    });
  }

  private determineStatus(
    metric: FinancialMetricType,
    value: number,
    benchmark: FinancialBenchmarkMetric
  ): 'strong' | 'weak' | 'average' {
    // For most metrics, higher is better
    const higherIsBetter = [
      'gross_margin', 'operating_margin', 'net_margin', 'ebitda_margin',
      'current_ratio', 'quick_ratio', 'interest_coverage',
      'asset_turnover', 'inventory_turnover', 'receivables_turnover',
      'roe', 'roa', 'roic', 'revenue_growth', 'earnings_growth',
    ];

    // For debt_to_equity, lower is generally better
    const lowerIsBetter = ['debt_to_equity'];

    if (higherIsBetter.includes(metric)) {
      if (value > benchmark.benchmark.percentile75!) return 'strong';
      if (value < benchmark.benchmark.percentile25!) return 'weak';
      return 'average';
    }

    if (lowerIsBetter.includes(metric)) {
      if (value < benchmark.benchmark.percentile25!) return 'strong';
      if (value > benchmark.benchmark.percentile75!) return 'weak';
      return 'average';
    }

    // For valuation metrics, context matters more
    return 'average';
  }

  private generateRecommendation(
    metric: FinancialMetricType,
    status: 'strong' | 'weak' | 'average'
  ): string | undefined {
    if (status !== 'weak') return undefined;

    const recommendations: Partial<Record<FinancialMetricType, string>> = {
      gross_margin: 'Consider reviewing pricing strategy or cost of goods sold',
      operating_margin: 'Evaluate operational efficiency and overhead costs',
      net_margin: 'Review overall cost structure and tax strategy',
      current_ratio: 'Consider improving working capital management',
      debt_to_equity: 'Evaluate capital structure and debt reduction strategies',
      roe: 'Focus on improving profitability or asset utilization',
      revenue_growth: 'Explore market expansion or new product opportunities',
    };

    return recommendations[metric];
  }
}

export function createFinancialBenchmarkConnector(
  config: FinancialBenchmarkConfig,
  options?: ConnectorOptions
): FinancialBenchmarkConnector {
  return new FinancialBenchmarkConnector(config, options);
}
