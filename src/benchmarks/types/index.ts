/**
 * KDAP Benchmark API Types
 * Type definitions for industry benchmark data connectors
 */

// Common types
export interface BenchmarkDataPoint {
  metricId: string;
  value: number;
  unit: string;
  timestamp: string;
  source: string;
  confidence?: number;
}

export interface BenchmarkRange {
  min: number;
  max: number;
  median: number;
  percentile25?: number;
  percentile75?: number;
}

export interface IndustrySegment {
  code: string;
  name: string;
  parentCode?: string;
  level: 'sector' | 'industry' | 'subindustry';
}

export interface GeographicRegion {
  code: string;
  name: string;
  type: 'country' | 'region' | 'state' | 'city';
  parentCode?: string;
}

export interface TimeRange {
  start: string;
  end: string;
  granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

// Media Benchmark Types
export interface MediaBenchmarkMetric {
  channel: MediaChannel;
  metric: MediaMetricType;
  value: number;
  benchmark: BenchmarkRange;
  percentileRank: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  yoyChange?: number;
}

export type MediaChannel =
  | 'search_paid'
  | 'search_organic'
  | 'social_paid'
  | 'social_organic'
  | 'display'
  | 'video'
  | 'programmatic'
  | 'native'
  | 'affiliate'
  | 'email'
  | 'tv_linear'
  | 'tv_ctv'
  | 'audio'
  | 'ooh';

export type MediaMetricType =
  | 'cpm'
  | 'cpc'
  | 'cpa'
  | 'ctr'
  | 'conversion_rate'
  | 'roas'
  | 'viewability'
  | 'completion_rate'
  | 'engagement_rate'
  | 'reach'
  | 'frequency'
  | 'impression_share';

export interface MediaBenchmarkRequest {
  channels: MediaChannel[];
  metrics: MediaMetricType[];
  industry?: string;
  region?: string;
  timeRange?: TimeRange;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
}

export interface MediaBenchmarkResponse {
  requestId: string;
  timestamp: string;
  benchmarks: MediaBenchmarkMetric[];
  metadata: {
    sampleSize: number;
    lastUpdated: string;
    dataSource: string;
  };
}

// Financial Benchmark Types
export interface FinancialBenchmarkMetric {
  category: FinancialCategory;
  metric: FinancialMetricType;
  value: number;
  benchmark: BenchmarkRange;
  percentileRank: number;
  industryAverage: number;
}

export type FinancialCategory =
  | 'profitability'
  | 'liquidity'
  | 'leverage'
  | 'efficiency'
  | 'valuation'
  | 'growth';

export type FinancialMetricType =
  | 'gross_margin'
  | 'operating_margin'
  | 'net_margin'
  | 'ebitda_margin'
  | 'current_ratio'
  | 'quick_ratio'
  | 'debt_to_equity'
  | 'interest_coverage'
  | 'asset_turnover'
  | 'inventory_turnover'
  | 'receivables_turnover'
  | 'roe'
  | 'roa'
  | 'roic'
  | 'pe_ratio'
  | 'ev_ebitda'
  | 'revenue_growth'
  | 'earnings_growth';

export interface FinancialBenchmarkRequest {
  metrics: FinancialMetricType[];
  industry: string;
  region?: string;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
  fiscalYear?: number;
}

export interface FinancialBenchmarkResponse {
  requestId: string;
  timestamp: string;
  benchmarks: FinancialBenchmarkMetric[];
  peerGroup: {
    count: number;
    industryCode: string;
    region: string;
  };
  metadata: {
    dataDate: string;
    source: string;
  };
}

// Customer Benchmark Types
export interface CustomerBenchmarkMetric {
  segment: CustomerSegment;
  metric: CustomerMetricType;
  value: number;
  benchmark: BenchmarkRange;
  percentileRank: number;
}

export type CustomerSegment =
  | 'acquisition'
  | 'retention'
  | 'engagement'
  | 'satisfaction'
  | 'lifetime_value';

export type CustomerMetricType =
  | 'cac'
  | 'ltv'
  | 'ltv_cac_ratio'
  | 'churn_rate'
  | 'retention_rate'
  | 'nps'
  | 'csat'
  | 'ces'
  | 'arpu'
  | 'arpa'
  | 'conversion_rate'
  | 'activation_rate'
  | 'time_to_value'
  | 'expansion_revenue_rate'
  | 'logo_retention'
  | 'revenue_retention';

export interface CustomerBenchmarkRequest {
  metrics: CustomerMetricType[];
  industry: string;
  businessModel: 'b2b' | 'b2c' | 'b2b2c' | 'd2c';
  companyStage?: 'startup' | 'growth' | 'scale' | 'mature';
}

export interface CustomerBenchmarkResponse {
  requestId: string;
  timestamp: string;
  benchmarks: CustomerBenchmarkMetric[];
  cohortInfo: {
    size: number;
    businessModel: string;
    stage: string;
  };
}

// Operational Benchmark Types
export interface OperationalBenchmarkMetric {
  area: OperationalArea;
  metric: OperationalMetricType;
  value: number;
  benchmark: BenchmarkRange;
  percentileRank: number;
}

export type OperationalArea =
  | 'sales'
  | 'marketing'
  | 'product'
  | 'engineering'
  | 'support'
  | 'hr';

export type OperationalMetricType =
  | 'sales_cycle_length'
  | 'win_rate'
  | 'quota_attainment'
  | 'pipeline_coverage'
  | 'marketing_roi'
  | 'lead_velocity'
  | 'mql_to_sql_rate'
  | 'time_to_market'
  | 'bug_rate'
  | 'deployment_frequency'
  | 'first_response_time'
  | 'resolution_time'
  | 'csat_support'
  | 'employee_nps'
  | 'turnover_rate'
  | 'time_to_hire';

export interface OperationalBenchmarkRequest {
  areas: OperationalArea[];
  metrics: OperationalMetricType[];
  industry: string;
  companySize?: 'small' | 'medium' | 'large' | 'enterprise';
}

export interface OperationalBenchmarkResponse {
  requestId: string;
  timestamp: string;
  benchmarks: OperationalBenchmarkMetric[];
  metadata: {
    sampleSize: number;
    industryCode: string;
  };
}

// API Configuration Types
export interface BenchmarkAPIConfig {
  baseUrl: string;
  apiKey: string;
  apiVersion?: string;
  timeout?: number;
  retryAttempts?: number;
  rateLimitPerMinute?: number;
}

export interface BenchmarkAPIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryAfter?: number;
}

// Connector Interface
export interface BenchmarkConnector<TRequest, TResponse> {
  getName(): string;
  getVersion(): string;
  isHealthy(): Promise<boolean>;
  fetch(request: TRequest): Promise<TResponse>;
  batchFetch?(requests: TRequest[]): Promise<TResponse[]>;
}
