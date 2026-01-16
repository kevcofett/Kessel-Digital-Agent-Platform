/**
 * Dataverse Schema Update Script
 *
 * Defines the enhanced benchmark schema for MPA v6.0:
 * - Temporal metadata (freshness scoring)
 * - Statistical confidence intervals
 * - Contextual factors
 * - Trend data
 *
 * @module dataverse-schema
 * @version 6.0
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Current benchmark schema (v5.5)
 */
export interface BenchmarkV55 {
  mpa_vertical_code: string;
  mpa_channel_code: string;
  mpa_kpi_code: string;
  mpa_metric_low: number;
  mpa_metric_median: number;
  mpa_metric_high: number;
  mpa_metric_best: number;
  mpa_source: string;
  mpa_period: string;
  mpa_confidence_level: string;
}

/**
 * Enhanced benchmark schema (v6.0)
 * Per MPA v6.0 Improvement Plan Section 4.1
 */
export interface EnhancedBenchmark extends BenchmarkV55 {
  // Temporal Metadata
  mpa_data_collection_date: Date;
  mpa_data_period_start: Date;
  mpa_data_period_end: Date;
  mpa_freshness_score: number;           // 0-1, decays over time
  mpa_next_refresh_date: Date | null;

  // Statistical Confidence
  mpa_sample_size: number | null;
  mpa_confidence_interval_low: number | null;
  mpa_confidence_interval_high: number | null;
  mpa_standard_deviation: number | null;
  mpa_methodology: string;

  // Contextual Factors
  mpa_seasonality_factor: SeasonalityFactor;
  mpa_market_conditions: MarketConditions;
  mpa_audience_segment: AudienceSegment;

  // Trend Data
  mpa_trend_direction: TrendDirection;
  mpa_trend_magnitude: number;           // Monthly % change
  mpa_historical_values: string;         // JSON array
}

/**
 * Seasonality factors
 */
export type SeasonalityFactor =
  | 'Q4_HOLIDAY'
  | 'Q1_NEW_YEAR'
  | 'Q2_SPRING'
  | 'Q3_SUMMER'
  | 'BACK_TO_SCHOOL'
  | 'NORMAL';

/**
 * Market conditions
 */
export type MarketConditions =
  | 'HIGH_COMPETITION'
  | 'NORMAL'
  | 'LOW_COMPETITION'
  | 'RECESSION'
  | 'GROWTH';

/**
 * Audience segment types
 */
export type AudienceSegment =
  | 'GENERAL'
  | 'HIGH_INTENT'
  | 'REMARKETING'
  | 'PROSPECTING'
  | 'LOYALTY';

/**
 * Trend directions
 */
export type TrendDirection =
  | 'INCREASING'
  | 'STABLE'
  | 'DECREASING'
  | 'VOLATILE';

// ============================================================================
// DATAVERSE SCHEMA DEFINITION
// ============================================================================

/**
 * Dataverse table schema for mpa_benchmark_v6
 */
export const BENCHMARK_V6_SCHEMA = {
  tableName: 'mpa_benchmark_v6',
  displayName: 'MPA Benchmark v6.0',
  description: 'Enhanced benchmark data with temporal, statistical, and contextual metadata',

  columns: [
    // Primary Key Columns (existing)
    {
      logicalName: 'mpa_vertical_code',
      displayName: 'Vertical Code',
      type: 'String',
      maxLength: 50,
      required: true,
      description: 'Industry vertical code (e.g., RETAIL, ECOMMERCE, SAAS)',
    },
    {
      logicalName: 'mpa_channel_code',
      displayName: 'Channel Code',
      type: 'String',
      maxLength: 50,
      required: true,
      description: 'Media channel code (e.g., CTV, PROGRAMMATIC, SEARCH)',
    },
    {
      logicalName: 'mpa_kpi_code',
      displayName: 'KPI Code',
      type: 'String',
      maxLength: 50,
      required: true,
      description: 'Key performance indicator code (e.g., CPM, CTR, CAC)',
    },

    // Metric Value Columns (existing)
    {
      logicalName: 'mpa_metric_low',
      displayName: 'Metric Low',
      type: 'Decimal',
      precision: 18,
      scale: 4,
      required: true,
      description: 'Conservative/low end of benchmark range',
    },
    {
      logicalName: 'mpa_metric_median',
      displayName: 'Metric Median',
      type: 'Decimal',
      precision: 18,
      scale: 4,
      required: true,
      description: 'Typical/median benchmark value',
    },
    {
      logicalName: 'mpa_metric_high',
      displayName: 'Metric High',
      type: 'Decimal',
      precision: 18,
      scale: 4,
      required: true,
      description: 'Ambitious/high end of benchmark range',
    },
    {
      logicalName: 'mpa_metric_best',
      displayName: 'Metric Best in Class',
      type: 'Decimal',
      precision: 18,
      scale: 4,
      required: false,
      description: 'Best-in-class benchmark value (top 10%)',
    },

    // Source Metadata (existing)
    {
      logicalName: 'mpa_source',
      displayName: 'Data Source',
      type: 'String',
      maxLength: 255,
      required: true,
      description: 'Source of benchmark data (e.g., eMarketer, internal research)',
    },
    {
      logicalName: 'mpa_confidence_level',
      displayName: 'Confidence Level',
      type: 'OptionSet',
      options: ['HIGH', 'MEDIUM', 'LOW'],
      required: true,
      description: 'Confidence level of the benchmark data',
    },

    // NEW: Temporal Metadata
    {
      logicalName: 'mpa_data_collection_date',
      displayName: 'Data Collection Date',
      type: 'DateTime',
      required: true,
      description: 'When the data was collected/published',
    },
    {
      logicalName: 'mpa_data_period_start',
      displayName: 'Period Start Date',
      type: 'DateTime',
      required: true,
      description: 'Start of the measurement period',
    },
    {
      logicalName: 'mpa_data_period_end',
      displayName: 'Period End Date',
      type: 'DateTime',
      required: true,
      description: 'End of the measurement period',
    },
    {
      logicalName: 'mpa_freshness_score',
      displayName: 'Freshness Score',
      type: 'Decimal',
      precision: 5,
      scale: 4,
      required: false,
      description: 'Calculated freshness score (0-1)',
    },
    {
      logicalName: 'mpa_next_refresh_date',
      displayName: 'Next Refresh Date',
      type: 'DateTime',
      required: false,
      description: 'Expected date for data refresh',
    },

    // NEW: Statistical Confidence
    {
      logicalName: 'mpa_sample_size',
      displayName: 'Sample Size',
      type: 'WholeNumber',
      required: false,
      description: 'Number of observations in the sample',
    },
    {
      logicalName: 'mpa_confidence_interval_low',
      displayName: 'CI Low (95%)',
      type: 'Decimal',
      precision: 18,
      scale: 4,
      required: false,
      description: 'Lower bound of 95% confidence interval',
    },
    {
      logicalName: 'mpa_confidence_interval_high',
      displayName: 'CI High (95%)',
      type: 'Decimal',
      precision: 18,
      scale: 4,
      required: false,
      description: 'Upper bound of 95% confidence interval',
    },
    {
      logicalName: 'mpa_standard_deviation',
      displayName: 'Standard Deviation',
      type: 'Decimal',
      precision: 18,
      scale: 4,
      required: false,
      description: 'Standard deviation of the metric',
    },
    {
      logicalName: 'mpa_methodology',
      displayName: 'Methodology',
      type: 'String',
      maxLength: 500,
      required: false,
      description: 'Description of measurement methodology',
    },

    // NEW: Contextual Factors
    {
      logicalName: 'mpa_seasonality_factor',
      displayName: 'Seasonality Factor',
      type: 'OptionSet',
      options: ['Q4_HOLIDAY', 'Q1_NEW_YEAR', 'Q2_SPRING', 'Q3_SUMMER', 'BACK_TO_SCHOOL', 'NORMAL'],
      required: false,
      description: 'Seasonal context affecting the benchmark',
    },
    {
      logicalName: 'mpa_market_conditions',
      displayName: 'Market Conditions',
      type: 'OptionSet',
      options: ['HIGH_COMPETITION', 'NORMAL', 'LOW_COMPETITION', 'RECESSION', 'GROWTH'],
      required: false,
      description: 'Market conditions during measurement',
    },
    {
      logicalName: 'mpa_audience_segment',
      displayName: 'Audience Segment',
      type: 'OptionSet',
      options: ['GENERAL', 'HIGH_INTENT', 'REMARKETING', 'PROSPECTING', 'LOYALTY'],
      required: false,
      description: 'Audience segment the benchmark applies to',
    },

    // NEW: Trend Data
    {
      logicalName: 'mpa_trend_direction',
      displayName: 'Trend Direction',
      type: 'OptionSet',
      options: ['INCREASING', 'STABLE', 'DECREASING', 'VOLATILE'],
      required: false,
      description: 'Direction of recent trend',
    },
    {
      logicalName: 'mpa_trend_magnitude',
      displayName: 'Trend Magnitude',
      type: 'Decimal',
      precision: 8,
      scale: 4,
      required: false,
      description: 'Monthly percentage change',
    },
    {
      logicalName: 'mpa_historical_values',
      displayName: 'Historical Values',
      type: 'Memo',
      maxLength: 10000,
      required: false,
      description: 'JSON array of historical values',
    },
  ],

  // Composite key for uniqueness
  alternateKeys: [
    {
      name: 'mpa_benchmark_composite_key',
      columns: ['mpa_vertical_code', 'mpa_channel_code', 'mpa_kpi_code', 'mpa_data_period_end'],
    },
  ],
};

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Convert v5.5 benchmark to v6.0 format
 */
export function migrateBenchmarkToV6(
  v55: BenchmarkV55,
  defaults: Partial<EnhancedBenchmark> = {}
): EnhancedBenchmark {
  const now = new Date();

  // Parse period string to dates (format: "Q4 2024" or "2024")
  const periodDates = parsePeriodString(v55.mpa_period);

  return {
    ...v55,

    // Temporal Metadata
    mpa_data_collection_date: defaults.mpa_data_collection_date || periodDates.end,
    mpa_data_period_start: defaults.mpa_data_period_start || periodDates.start,
    mpa_data_period_end: defaults.mpa_data_period_end || periodDates.end,
    mpa_freshness_score: defaults.mpa_freshness_score || calculateFreshnessScore(v55.mpa_kpi_code, periodDates.end),
    mpa_next_refresh_date: defaults.mpa_next_refresh_date || null,

    // Statistical Confidence
    mpa_sample_size: defaults.mpa_sample_size || null,
    mpa_confidence_interval_low: defaults.mpa_confidence_interval_low || null,
    mpa_confidence_interval_high: defaults.mpa_confidence_interval_high || null,
    mpa_standard_deviation: defaults.mpa_standard_deviation || null,
    mpa_methodology: defaults.mpa_methodology || 'Migrated from v5.5',

    // Contextual Factors
    mpa_seasonality_factor: defaults.mpa_seasonality_factor || inferSeasonality(periodDates.end),
    mpa_market_conditions: defaults.mpa_market_conditions || 'NORMAL',
    mpa_audience_segment: defaults.mpa_audience_segment || 'GENERAL',

    // Trend Data
    mpa_trend_direction: defaults.mpa_trend_direction || 'STABLE',
    mpa_trend_magnitude: defaults.mpa_trend_magnitude || 0,
    mpa_historical_values: defaults.mpa_historical_values || '[]',
  };
}

/**
 * Parse period string to start/end dates
 */
function parsePeriodString(period: string): { start: Date; end: Date } {
  const now = new Date();

  // Try to parse "Q4 2024" format
  const quarterMatch = period.match(/Q([1-4])\s*(\d{4})/i);
  if (quarterMatch) {
    const quarter = parseInt(quarterMatch[1]);
    const year = parseInt(quarterMatch[2]);

    const quarterMonths: Record<number, { start: number; end: number }> = {
      1: { start: 0, end: 2 },
      2: { start: 3, end: 5 },
      3: { start: 6, end: 8 },
      4: { start: 9, end: 11 },
    };

    const start = new Date(year, quarterMonths[quarter].start, 1);
    const end = new Date(year, quarterMonths[quarter].end + 1, 0); // Last day of quarter

    return { start, end };
  }

  // Try to parse "2024" format
  const yearMatch = period.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31),
    };
  }

  // Default to current quarter
  const currentQuarter = Math.floor(now.getMonth() / 3);
  const start = new Date(now.getFullYear(), currentQuarter * 3, 1);
  const end = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0);

  return { start, end };
}

/**
 * Infer seasonality from date
 */
function inferSeasonality(date: Date): SeasonalityFactor {
  const month = date.getMonth();

  if (month >= 9 && month <= 11) return 'Q4_HOLIDAY';
  if (month >= 0 && month <= 2) return 'Q1_NEW_YEAR';
  if (month >= 3 && month <= 5) return 'Q2_SPRING';
  if (month >= 6 && month <= 8) return 'Q3_SUMMER';

  return 'NORMAL';
}

/**
 * Calculate freshness score based on KPI type and data age
 * Per MPA v6.0 Improvement Plan Section 4.2
 */
export function calculateFreshnessScore(kpiCode: string, periodEnd: Date): number {
  const now = new Date();
  const dataAgeInDays = (now.getTime() - periodEnd.getTime()) / (1000 * 60 * 60 * 24);

  // KPI-specific half-lives
  const HALF_LIFE_DAYS: Record<string, number> = {
    'CPM': 90,          // Pricing changes frequently
    'CTR': 180,         // Relatively stable
    'CVR': 120,         // Moderate volatility
    'ROAS': 90,         // Market-dependent
    'CAC': 120,         // Acquisition costs fluctuate
    'CPA': 120,
    'LTV': 365,         // Lifetime value changes slowly
    'AOV': 180,
    'VIEWABILITY': 365, // Platform-dependent, slow change
  };

  const halfLife = HALF_LIFE_DAYS[kpiCode.toUpperCase()] || 180;

  // Exponential decay: freshness = e^(-0.693 * age / half-life)
  // Minimum freshness of 0.1
  return Math.max(0.1, Math.exp(-0.693 * dataAgeInDays / halfLife));
}

// ============================================================================
// DATAVERSE QUERY HELPERS
// ============================================================================

/**
 * Build OData filter for benchmark query
 */
export function buildBenchmarkFilter(
  vertical: string,
  channel?: string,
  kpi?: string,
  minFreshness?: number
): string {
  const filters: string[] = [];

  filters.push(`mpa_vertical_code eq '${vertical.toUpperCase()}'`);

  if (channel) {
    filters.push(`mpa_channel_code eq '${channel.toUpperCase()}'`);
  }

  if (kpi) {
    filters.push(`mpa_kpi_code eq '${kpi.toUpperCase()}'`);
  }

  if (minFreshness !== undefined) {
    filters.push(`mpa_freshness_score ge ${minFreshness}`);
  }

  return filters.join(' and ');
}

/**
 * Build OData select for benchmark fields
 */
export function buildBenchmarkSelect(includeHistorical: boolean = false): string {
  const fields = [
    'mpa_vertical_code',
    'mpa_channel_code',
    'mpa_kpi_code',
    'mpa_metric_low',
    'mpa_metric_median',
    'mpa_metric_high',
    'mpa_metric_best',
    'mpa_source',
    'mpa_confidence_level',
    'mpa_freshness_score',
    'mpa_trend_direction',
    'mpa_trend_magnitude',
    'mpa_seasonality_factor',
    'mpa_market_conditions',
  ];

  if (includeHistorical) {
    fields.push('mpa_historical_values');
    fields.push('mpa_data_period_start');
    fields.push('mpa_data_period_end');
  }

  return fields.join(',');
}

/**
 * Format benchmark for agent response
 */
export function formatBenchmarkResponse(benchmark: EnhancedBenchmark): string {
  const lines: string[] = [];

  // Basic range
  lines.push(`${benchmark.mpa_kpi_code} for ${benchmark.mpa_vertical_code}:`);
  lines.push(`  Conservative: ${formatMetricValue(benchmark.mpa_metric_low, benchmark.mpa_kpi_code)}`);
  lines.push(`  Typical: ${formatMetricValue(benchmark.mpa_metric_median, benchmark.mpa_kpi_code)}`);
  lines.push(`  Ambitious: ${formatMetricValue(benchmark.mpa_metric_high, benchmark.mpa_kpi_code)}`);

  if (benchmark.mpa_metric_best) {
    lines.push(`  Best-in-class: ${formatMetricValue(benchmark.mpa_metric_best, benchmark.mpa_kpi_code)}`);
  }

  // Freshness warning
  if (benchmark.mpa_freshness_score < 0.5) {
    lines.push(`  Note: Data is ${Math.round((1 - benchmark.mpa_freshness_score) * 100)}% aged; validate with current market data.`);
  }

  // Trend
  if (benchmark.mpa_trend_direction && benchmark.mpa_trend_direction !== 'STABLE') {
    const direction = benchmark.mpa_trend_direction.toLowerCase();
    const magnitude = benchmark.mpa_trend_magnitude ? `${Math.abs(benchmark.mpa_trend_magnitude)}%/month` : '';
    lines.push(`  Trend: ${direction} ${magnitude}`);
  }

  // Source
  lines.push(`  Source: ${benchmark.mpa_source}`);

  return lines.join('\n');
}

/**
 * Format metric value based on KPI type
 */
function formatMetricValue(value: number, kpiCode: string): string {
  const kpi = kpiCode.toUpperCase();

  // Currency metrics
  if (['CAC', 'CPA', 'CPM', 'AOV', 'LTV'].includes(kpi)) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Percentage metrics
  if (['CTR', 'CVR', 'VIEWABILITY', 'ROAS'].includes(kpi)) {
    // ROAS is typically shown as X:1
    if (kpi === 'ROAS') {
      return `${value.toFixed(2)}:1`;
    }
    return `${value.toFixed(2)}%`;
  }

  // Ratio metrics
  if (kpi.includes('RATIO') || kpi === 'LTV_CAC') {
    return `${value.toFixed(1)}:1`;
  }

  return value.toLocaleString();
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  BENCHMARK_V6_SCHEMA,
  migrateBenchmarkToV6,
  calculateFreshnessScore,
  buildBenchmarkFilter,
  buildBenchmarkSelect,
  formatBenchmarkResponse,
};
