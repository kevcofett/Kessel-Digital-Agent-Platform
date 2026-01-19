/**
 * Media Benchmark Connector
 * Connects to industry media benchmark APIs for CPM, CPC, CTR, etc.
 */

import {
  BenchmarkAPIConfig,
  MediaBenchmarkRequest,
  MediaBenchmarkResponse,
  MediaBenchmarkMetric,
  MediaChannel,
  MediaMetricType,
  BenchmarkRange,
} from '../types';
import { BaseConnector, ConnectorOptions } from './baseConnector';

export interface MediaBenchmarkConfig extends BenchmarkAPIConfig {
  provider: 'pathmatics' | 'semrush' | 'similarweb' | 'comscore' | 'custom';
}

export class MediaBenchmarkConnector extends BaseConnector<
  MediaBenchmarkRequest,
  MediaBenchmarkResponse
> {
  private readonly provider: string;

  constructor(config: MediaBenchmarkConfig, options?: ConnectorOptions) {
    super(config, 'media-benchmark', '1.0.0', options);
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
    request: MediaBenchmarkRequest
  ): Promise<MediaBenchmarkResponse> {
    const response = await this.httpClient.post<MediaBenchmarkResponse>(
      '/benchmarks/media',
      {
        channels: request.channels,
        metrics: request.metrics,
        filters: {
          industry: request.industry,
          region: request.region,
          timeRange: request.timeRange,
          companySize: request.companySize,
        },
      }
    );

    return this.transformResponse(response.data, request);
  }

  protected validateRequest(request: MediaBenchmarkRequest): void {
    super.validateRequest(request);

    if (!request.channels || request.channels.length === 0) {
      throw new Error('At least one channel is required');
    }

    if (!request.metrics || request.metrics.length === 0) {
      throw new Error('At least one metric is required');
    }

    // Validate channel values
    const validChannels: MediaChannel[] = [
      'search_paid', 'search_organic', 'social_paid', 'social_organic',
      'display', 'video', 'programmatic', 'native', 'affiliate',
      'email', 'tv_linear', 'tv_ctv', 'audio', 'ooh',
    ];

    for (const channel of request.channels) {
      if (!validChannels.includes(channel)) {
        throw new Error(`Invalid channel: ${channel}`);
      }
    }
  }

  private transformResponse(
    rawResponse: MediaBenchmarkResponse,
    request: MediaBenchmarkRequest
  ): MediaBenchmarkResponse {
    return {
      requestId: rawResponse.requestId || this.createRequestId(),
      timestamp: rawResponse.timestamp || new Date().toISOString(),
      benchmarks: rawResponse.benchmarks.map(benchmark =>
        this.enrichBenchmark(benchmark)
      ),
      metadata: {
        sampleSize: rawResponse.metadata?.sampleSize || 0,
        lastUpdated: rawResponse.metadata?.lastUpdated || new Date().toISOString(),
        dataSource: this.provider,
      },
    };
  }

  private enrichBenchmark(benchmark: MediaBenchmarkMetric): MediaBenchmarkMetric {
    return {
      ...benchmark,
      trend: benchmark.trend || this.calculateTrend(benchmark.yoyChange),
    };
  }

  private calculateTrend(yoyChange?: number): 'increasing' | 'decreasing' | 'stable' {
    if (!yoyChange) return 'stable';
    if (yoyChange > 0.05) return 'increasing';
    if (yoyChange < -0.05) return 'decreasing';
    return 'stable';
  }

  // Convenience methods for common queries
  async getSearchBenchmarks(
    industry?: string,
    region?: string
  ): Promise<MediaBenchmarkMetric[]> {
    const response = await this.fetch({
      channels: ['search_paid', 'search_organic'],
      metrics: ['cpc', 'ctr', 'conversion_rate', 'impression_share'],
      industry,
      region,
    });
    return response.benchmarks;
  }

  async getSocialBenchmarks(
    industry?: string,
    region?: string
  ): Promise<MediaBenchmarkMetric[]> {
    const response = await this.fetch({
      channels: ['social_paid', 'social_organic'],
      metrics: ['cpm', 'ctr', 'engagement_rate', 'reach'],
      industry,
      region,
    });
    return response.benchmarks;
  }

  async getDisplayBenchmarks(
    industry?: string,
    region?: string
  ): Promise<MediaBenchmarkMetric[]> {
    const response = await this.fetch({
      channels: ['display', 'programmatic', 'native'],
      metrics: ['cpm', 'ctr', 'viewability', 'conversion_rate'],
      industry,
      region,
    });
    return response.benchmarks;
  }

  async getVideoBenchmarks(
    industry?: string,
    region?: string
  ): Promise<MediaBenchmarkMetric[]> {
    const response = await this.fetch({
      channels: ['video', 'tv_ctv'],
      metrics: ['cpm', 'completion_rate', 'viewability', 'reach'],
      industry,
      region,
    });
    return response.benchmarks;
  }

  async compareToIndustry(
    companyMetrics: { channel: MediaChannel; metric: MediaMetricType; value: number }[],
    industry: string
  ): Promise<{
    metric: string;
    channel: string;
    value: number;
    industryMedian: number;
    percentileRank: number;
    status: 'above' | 'below' | 'average';
  }[]> {
    const channels = [...new Set(companyMetrics.map(m => m.channel))];
    const metrics = [...new Set(companyMetrics.map(m => m.metric))];

    const benchmarkResponse = await this.fetch({
      channels,
      metrics,
      industry,
    });

    return companyMetrics.map(cm => {
      const benchmark = benchmarkResponse.benchmarks.find(
        b => b.channel === cm.channel && b.metric === cm.metric
      );

      if (!benchmark) {
        return {
          metric: cm.metric,
          channel: cm.channel,
          value: cm.value,
          industryMedian: 0,
          percentileRank: 50,
          status: 'average' as const,
        };
      }

      const status =
        cm.value > benchmark.benchmark.percentile75! ? 'above' :
        cm.value < benchmark.benchmark.percentile25! ? 'below' : 'average';

      return {
        metric: cm.metric,
        channel: cm.channel,
        value: cm.value,
        industryMedian: benchmark.benchmark.median,
        percentileRank: benchmark.percentileRank,
        status,
      };
    });
  }
}

export function createMediaBenchmarkConnector(
  config: MediaBenchmarkConfig,
  options?: ConnectorOptions
): MediaBenchmarkConnector {
  return new MediaBenchmarkConnector(config, options);
}
