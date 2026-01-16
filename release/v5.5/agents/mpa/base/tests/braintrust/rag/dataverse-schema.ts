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

// ============================================================================
// MPA v6.0 REFERENCE DATA SCHEMAS
// ============================================================================

/**
 * Geographic/Census Data Schema
 * Supports multi-region deployment (US, CA, UK, MX, AU, DE, FR, CL, ES, BR, IT, JP)
 */
export const GEOGRAPHY_SCHEMA = {
  tableName: 'mpa_geography',
  displayName: 'MPA Geography Reference',
  description: 'Census and demographic data by geographic unit (DMA, CMA, ITV Region, etc.)',

  columns: [
    // Primary Key
    {
      logicalName: 'mpa_geo_id',
      displayName: 'Geography ID',
      type: 'String',
      maxLength: 50,
      required: true,
      description: 'Unique identifier (e.g., US_DMA_501, CA_CMA_535)',
    },
    // Geographic Classification
    {
      logicalName: 'mpa_country',
      displayName: 'Country Code',
      type: 'String',
      maxLength: 2,
      required: true,
      description: 'ISO 3166-1 alpha-2 country code (US, CA, UK, MX, etc.)',
    },
    {
      logicalName: 'mpa_geo_type',
      displayName: 'Geography Type',
      type: 'OptionSet',
      options: ['DMA', 'CMA', 'ITVR', 'NUTS1', 'ZM', 'GCCSA', 'LAND', 'REG', 'UF', 'CCAA', 'PREF'],
      required: true,
      description: 'Type of geographic unit',
    },
    {
      logicalName: 'mpa_geo_code',
      displayName: 'Geography Code',
      type: 'String',
      maxLength: 20,
      required: true,
      description: 'Official code (Nielsen DMA code, StatCan CMA code, etc.)',
    },
    {
      logicalName: 'mpa_geo_name',
      displayName: 'Geography Name',
      type: 'String',
      maxLength: 200,
      required: true,
      description: 'Official name (e.g., New York, Toronto, London)',
    },
    {
      logicalName: 'mpa_geo_rank',
      displayName: 'Rank',
      type: 'WholeNumber',
      required: false,
      description: 'Rank by population within country',
    },
    // Population Data
    {
      logicalName: 'mpa_total_population',
      displayName: 'Total Population',
      type: 'WholeNumber',
      required: true,
      description: 'Total population',
    },
    {
      logicalName: 'mpa_total_households',
      displayName: 'Total Households',
      type: 'WholeNumber',
      required: false,
      description: 'Total households',
    },
    // Age Demographics
    {
      logicalName: 'mpa_median_age',
      displayName: 'Median Age',
      type: 'Decimal',
      precision: 5,
      scale: 1,
      required: false,
      description: 'Median age of population',
    },
    {
      logicalName: 'mpa_pct_male',
      displayName: 'Percent Male',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent male population',
    },
    {
      logicalName: 'mpa_pct_female',
      displayName: 'Percent Female',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent female population',
    },
    {
      logicalName: 'mpa_pct_age_0_17',
      displayName: 'Percent Age 0-17',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent under 18',
    },
    {
      logicalName: 'mpa_pct_age_18_34',
      displayName: 'Percent Age 18-34',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent 18-34',
    },
    {
      logicalName: 'mpa_pct_age_25_54',
      displayName: 'Percent Age 25-54',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent 25-54 (prime working age)',
    },
    {
      logicalName: 'mpa_pct_age_55_plus',
      displayName: 'Percent Age 55+',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent 55 and older',
    },
    // Income Demographics
    {
      logicalName: 'mpa_median_hhi',
      displayName: 'Median Household Income',
      type: 'WholeNumber',
      required: false,
      description: 'Median household income in local currency',
    },
    {
      logicalName: 'mpa_pct_hhi_under_50k',
      displayName: 'Percent HHI Under 50K',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent households under $50K (or equivalent)',
    },
    {
      logicalName: 'mpa_pct_hhi_50k_100k',
      displayName: 'Percent HHI 50-100K',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent households $50-100K',
    },
    {
      logicalName: 'mpa_pct_hhi_over_100k',
      displayName: 'Percent HHI Over 100K',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent households over $100K',
    },
    {
      logicalName: 'mpa_pct_hhi_over_150k',
      displayName: 'Percent HHI Over 150K',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent households over $150K (affluent)',
    },
    // Education Demographics
    {
      logicalName: 'mpa_pct_college_degree',
      displayName: 'Percent College Degree',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent with bachelors degree or higher',
    },
    {
      logicalName: 'mpa_pct_graduate_degree',
      displayName: 'Percent Graduate Degree',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent with masters/doctorate',
    },
    // Ethnicity Demographics (US-specific, optional elsewhere)
    {
      logicalName: 'mpa_pct_hispanic',
      displayName: 'Percent Hispanic/Latino',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent Hispanic or Latino origin',
    },
    {
      logicalName: 'mpa_pct_white_nonhisp',
      displayName: 'Percent White Non-Hispanic',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent White alone, not Hispanic',
    },
    {
      logicalName: 'mpa_pct_black',
      displayName: 'Percent Black',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent Black or African American',
    },
    {
      logicalName: 'mpa_pct_asian',
      displayName: 'Percent Asian',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent Asian',
    },
    {
      logicalName: 'mpa_pct_other',
      displayName: 'Percent Other',
      type: 'Decimal',
      precision: 5,
      scale: 2,
      required: false,
      description: 'Percent other races/multiracial',
    },
    // State/Province Information
    {
      logicalName: 'mpa_state_primary',
      displayName: 'Primary State/Province',
      type: 'String',
      maxLength: 50,
      required: false,
      description: 'Primary state/province code',
    },
    {
      logicalName: 'mpa_states_included',
      displayName: 'States/Provinces Included',
      type: 'String',
      maxLength: 200,
      required: false,
      description: 'All states/provinces in this geography',
    },
    // Source Metadata
    {
      logicalName: 'mpa_data_source',
      displayName: 'Data Source',
      type: 'String',
      maxLength: 200,
      required: true,
      description: 'Census/statistical source (e.g., US Census ACS 2019-2023)',
    },
    {
      logicalName: 'mpa_data_year',
      displayName: 'Data Year',
      type: 'WholeNumber',
      required: true,
      description: 'Year of data',
    },
  ],

  alternateKeys: [
    {
      name: 'mpa_geography_composite_key',
      columns: ['mpa_country', 'mpa_geo_type', 'mpa_geo_code'],
    },
  ],
};

/**
 * IAB Content Taxonomy Schema
 * IAB Tech Lab Content Taxonomy 3.0
 */
export const IAB_TAXONOMY_SCHEMA = {
  tableName: 'mpa_iab_taxonomy',
  displayName: 'MPA IAB Taxonomy',
  description: 'IAB Content Taxonomy 3.0 codes for contextual targeting',

  columns: [
    {
      logicalName: 'mpa_iab_id',
      displayName: 'IAB ID',
      type: 'String',
      maxLength: 50,
      required: true,
      description: 'Unique identifier',
    },
    {
      logicalName: 'mpa_iab_code',
      displayName: 'IAB Code',
      type: 'String',
      maxLength: 20,
      required: true,
      description: 'IAB code (e.g., IAB13-7)',
    },
    {
      logicalName: 'mpa_iab_tier',
      displayName: 'Tier Level',
      type: 'WholeNumber',
      required: true,
      description: 'Tier level (1, 2, or 3)',
    },
    {
      logicalName: 'mpa_iab_parent_code',
      displayName: 'Parent Code',
      type: 'String',
      maxLength: 20,
      required: false,
      description: 'Parent IAB code (null for Tier 1)',
    },
    {
      logicalName: 'mpa_iab_name',
      displayName: 'Category Name',
      type: 'String',
      maxLength: 200,
      required: true,
      description: 'Category name',
    },
    {
      logicalName: 'mpa_iab_description',
      displayName: 'Description',
      type: 'String',
      maxLength: 500,
      required: false,
      description: 'Category description',
    },
    {
      logicalName: 'mpa_vertical_relevance',
      displayName: 'Vertical Relevance',
      type: 'String',
      maxLength: 200,
      required: false,
      description: 'Relevant MPA verticals (comma-separated)',
    },
    {
      logicalName: 'mpa_contextual_signal_strength',
      displayName: 'Signal Strength',
      type: 'OptionSet',
      options: ['HIGH', 'MEDIUM', 'LOW'],
      required: false,
      description: 'Contextual signal strength for targeting',
    },
  ],

  alternateKeys: [
    {
      name: 'mpa_iab_code_key',
      columns: ['mpa_iab_code'],
    },
  ],
};

/**
 * Platform Audience Taxonomy Schema
 * Google Affinity/In-Market, Meta Interests/Behaviors, LinkedIn
 */
export const PLATFORM_TAXONOMY_SCHEMA = {
  tableName: 'mpa_platform_taxonomy',
  displayName: 'MPA Platform Taxonomy',
  description: 'Platform-specific audience segments (Google, Meta, LinkedIn, TikTok)',

  columns: [
    {
      logicalName: 'mpa_segment_id',
      displayName: 'Segment ID',
      type: 'String',
      maxLength: 100,
      required: true,
      description: 'Unique identifier',
    },
    {
      logicalName: 'mpa_platform',
      displayName: 'Platform',
      type: 'OptionSet',
      options: ['GOOGLE', 'META', 'LINKEDIN', 'TIKTOK', 'PINTEREST', 'SNAPCHAT', 'TWITTER'],
      required: true,
      description: 'Advertising platform',
    },
    {
      logicalName: 'mpa_taxonomy_type',
      displayName: 'Taxonomy Type',
      type: 'OptionSet',
      options: ['AFFINITY', 'IN_MARKET', 'INTEREST', 'BEHAVIOR', 'DEMOGRAPHIC', 'LIFE_EVENT', 'CUSTOM_INTENT', 'JOB_FUNCTION', 'SENIORITY', 'INDUSTRY', 'COMPANY_SIZE', 'SKILL'],
      required: true,
      description: 'Type of audience segment',
    },
    {
      logicalName: 'mpa_segment_path',
      displayName: 'Segment Path',
      type: 'String',
      maxLength: 500,
      required: true,
      description: 'Full path (e.g., /Affinity/Banking & Finance/Avid Investors)',
    },
    {
      logicalName: 'mpa_segment_name',
      displayName: 'Segment Name',
      type: 'String',
      maxLength: 200,
      required: true,
      description: 'Display name',
    },
    {
      logicalName: 'mpa_parent_path',
      displayName: 'Parent Path',
      type: 'String',
      maxLength: 500,
      required: false,
      description: 'Parent segment path',
    },
    {
      logicalName: 'mpa_tier',
      displayName: 'Hierarchy Tier',
      type: 'WholeNumber',
      required: false,
      description: 'Depth in hierarchy (1=root)',
    },
    {
      logicalName: 'mpa_vertical_relevance',
      displayName: 'Vertical Relevance',
      type: 'String',
      maxLength: 200,
      required: false,
      description: 'Relevant MPA verticals (comma-separated)',
    },
    {
      logicalName: 'mpa_reach_tier',
      displayName: 'Reach Tier',
      type: 'OptionSet',
      options: ['BROAD', 'MEDIUM', 'NARROW', 'VERY_NARROW'],
      required: false,
      description: 'Estimated audience reach tier',
    },
    {
      logicalName: 'mpa_last_verified',
      displayName: 'Last Verified',
      type: 'DateTime',
      required: false,
      description: 'Date segment was last verified active',
    },
  ],

  alternateKeys: [
    {
      name: 'mpa_platform_segment_key',
      columns: ['mpa_platform', 'mpa_taxonomy_type', 'mpa_segment_path'],
    },
  ],
};

/**
 * Behavioral Attributes Schema
 * Cross-platform behavioral signals
 */
export const BEHAVIORAL_ATTRIBUTES_SCHEMA = {
  tableName: 'mpa_behavioral_attributes',
  displayName: 'MPA Behavioral Attributes',
  description: 'Behavioral targeting signals across platforms',

  columns: [
    {
      logicalName: 'mpa_behavior_id',
      displayName: 'Behavior ID',
      type: 'String',
      maxLength: 50,
      required: true,
      description: 'Unique identifier',
    },
    {
      logicalName: 'mpa_behavior_category',
      displayName: 'Category',
      type: 'OptionSet',
      options: ['PURCHASE', 'BROWSING', 'SEARCH', 'CONTENT', 'DEVICE', 'TEMPORAL', 'SOCIAL', 'TRANSACTION', 'ENGAGEMENT', 'LIFECYCLE'],
      required: true,
      description: 'Behavior category',
    },
    {
      logicalName: 'mpa_behavior_name',
      displayName: 'Behavior Name',
      type: 'String',
      maxLength: 200,
      required: true,
      description: 'Behavior name',
    },
    {
      logicalName: 'mpa_behavior_description',
      displayName: 'Description',
      type: 'String',
      maxLength: 500,
      required: false,
      description: 'Detailed description',
    },
    {
      logicalName: 'mpa_signal_type',
      displayName: 'Signal Type',
      type: 'OptionSet',
      options: ['FIRST_PARTY', 'SECOND_PARTY', 'THIRD_PARTY', 'PLATFORM_NATIVE', 'MODELED'],
      required: true,
      description: 'Data source type',
    },
    {
      logicalName: 'mpa_platforms_available',
      displayName: 'Platforms Available',
      type: 'String',
      maxLength: 200,
      required: false,
      description: 'Platforms where signal is available (comma-separated)',
    },
    {
      logicalName: 'mpa_vertical_relevance',
      displayName: 'Vertical Relevance',
      type: 'String',
      maxLength: 200,
      required: false,
      description: 'Relevant MPA verticals (comma-separated)',
    },
    {
      logicalName: 'mpa_intent_level',
      displayName: 'Intent Level',
      type: 'OptionSet',
      options: ['HIGH', 'MEDIUM', 'LOW', 'AWARENESS_ONLY'],
      required: false,
      description: 'Purchase/conversion intent level',
    },
    {
      logicalName: 'mpa_recency_windows',
      displayName: 'Recency Windows',
      type: 'String',
      maxLength: 100,
      required: false,
      description: 'Available recency windows (e.g., 7d,14d,30d,60d,90d)',
    },
    {
      logicalName: 'mpa_data_freshness',
      displayName: 'Data Freshness',
      type: 'OptionSet',
      options: ['REAL_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'],
      required: false,
      description: 'How frequently signal is updated',
    },
  ],

  alternateKeys: [
    {
      name: 'mpa_behavior_key',
      columns: ['mpa_behavior_category', 'mpa_behavior_name'],
    },
  ],
};

/**
 * Contextual Attributes Schema
 * Content and environment-based targeting signals
 */
export const CONTEXTUAL_ATTRIBUTES_SCHEMA = {
  tableName: 'mpa_contextual_attributes',
  displayName: 'MPA Contextual Attributes',
  description: 'Contextual targeting signals (content, environment, brand safety)',

  columns: [
    {
      logicalName: 'mpa_context_id',
      displayName: 'Context ID',
      type: 'String',
      maxLength: 50,
      required: true,
      description: 'Unique identifier',
    },
    {
      logicalName: 'mpa_context_category',
      displayName: 'Category',
      type: 'OptionSet',
      options: ['CONTENT_CATEGORY', 'CONTENT_FORMAT', 'CONTENT_SENTIMENT', 'PAGE_ENVIRONMENT', 'BRAND_SAFETY', 'SEASONAL_EVENT', 'WEATHER', 'LOCATION_CONTEXT'],
      required: true,
      description: 'Context category',
    },
    {
      logicalName: 'mpa_context_name',
      displayName: 'Context Name',
      type: 'String',
      maxLength: 200,
      required: true,
      description: 'Context name',
    },
    {
      logicalName: 'mpa_context_description',
      displayName: 'Description',
      type: 'String',
      maxLength: 500,
      required: false,
      description: 'Detailed description',
    },
    {
      logicalName: 'mpa_iab_mapping',
      displayName: 'IAB Mapping',
      type: 'String',
      maxLength: 100,
      required: false,
      description: 'Mapped IAB code(s)',
    },
    {
      logicalName: 'mpa_signal_type',
      displayName: 'Signal Type',
      type: 'OptionSet',
      options: ['KEYWORD', 'SEMANTIC', 'URL_CATEGORY', 'PAGE_CONTENT', 'ENVIRONMENT', 'REAL_TIME'],
      required: true,
      description: 'How signal is detected',
    },
    {
      logicalName: 'mpa_brand_safety_tier',
      displayName: 'Brand Safety Tier',
      type: 'OptionSet',
      options: ['TIER_1_SAFE', 'TIER_2_STANDARD', 'TIER_3_SENSITIVE', 'TIER_4_AVOID'],
      required: false,
      description: 'Brand safety classification',
    },
    {
      logicalName: 'mpa_vertical_relevance',
      displayName: 'Vertical Relevance',
      type: 'String',
      maxLength: 200,
      required: false,
      description: 'Relevant MPA verticals (comma-separated)',
    },
    {
      logicalName: 'mpa_platforms_available',
      displayName: 'Platforms Available',
      type: 'String',
      maxLength: 200,
      required: false,
      description: 'Platforms where context is available',
    },
  ],

  alternateKeys: [
    {
      name: 'mpa_context_key',
      columns: ['mpa_context_category', 'mpa_context_name'],
    },
  ],
};

// ============================================================================
// QUERY BUILDERS FOR REFERENCE DATA
// ============================================================================

/**
 * Build OData filter for geography query
 */
export function buildGeographyFilter(
  country: string,
  geoType?: string,
  minPopulation?: number,
  maxRank?: number
): string {
  const filters: string[] = [];

  filters.push(`mpa_country eq '${country.toUpperCase()}'`);

  if (geoType) {
    filters.push(`mpa_geo_type eq '${geoType.toUpperCase()}'`);
  }

  if (minPopulation) {
    filters.push(`mpa_total_population ge ${minPopulation}`);
  }

  if (maxRank) {
    filters.push(`mpa_geo_rank le ${maxRank}`);
  }

  return filters.join(' and ');
}

/**
 * Build OData filter for IAB taxonomy query
 */
export function buildIABFilter(
  tier?: number,
  parentCode?: string,
  vertical?: string
): string {
  const filters: string[] = [];

  if (tier) {
    filters.push(`mpa_iab_tier eq ${tier}`);
  }

  if (parentCode) {
    filters.push(`mpa_iab_parent_code eq '${parentCode}'`);
  }

  if (vertical) {
    filters.push(`contains(mpa_vertical_relevance, '${vertical.toUpperCase()}')`);
  }

  return filters.join(' and ');
}

/**
 * Build OData filter for platform taxonomy query
 */
export function buildPlatformTaxonomyFilter(
  platform: string,
  taxonomyType?: string,
  vertical?: string
): string {
  const filters: string[] = [];

  filters.push(`mpa_platform eq '${platform.toUpperCase()}'`);

  if (taxonomyType) {
    filters.push(`mpa_taxonomy_type eq '${taxonomyType.toUpperCase()}'`);
  }

  if (vertical) {
    filters.push(`contains(mpa_vertical_relevance, '${vertical.toUpperCase()}')`);
  }

  return filters.join(' and ');
}

/**
 * Build OData filter for behavioral attributes query
 */
export function buildBehavioralFilter(
  category?: string,
  intentLevel?: string,
  platform?: string
): string {
  const filters: string[] = [];

  if (category) {
    filters.push(`mpa_behavior_category eq '${category.toUpperCase()}'`);
  }

  if (intentLevel) {
    filters.push(`mpa_intent_level eq '${intentLevel.toUpperCase()}'`);
  }

  if (platform) {
    filters.push(`contains(mpa_platforms_available, '${platform.toUpperCase()}')`);
  }

  return filters.join(' and ');
}

/**
 * Build OData filter for contextual attributes query
 */
export function buildContextualFilter(
  category?: string,
  brandSafetyTier?: string,
  iabCode?: string
): string {
  const filters: string[] = [];

  if (category) {
    filters.push(`mpa_context_category eq '${category.toUpperCase()}'`);
  }

  if (brandSafetyTier) {
    filters.push(`mpa_brand_safety_tier eq '${brandSafetyTier.toUpperCase()}'`);
  }

  if (iabCode) {
    filters.push(`contains(mpa_iab_mapping, '${iabCode}')`);
  }

  return filters.join(' and ');
}

// ============================================================================
// EXPORTS FOR REFERENCE DATA
// ============================================================================

export const REFERENCE_DATA_SCHEMAS = {
  GEOGRAPHY_SCHEMA,
  IAB_TAXONOMY_SCHEMA,
  PLATFORM_TAXONOMY_SCHEMA,
  BEHAVIORAL_ATTRIBUTES_SCHEMA,
  CONTEXTUAL_ATTRIBUTES_SCHEMA,
};

export const REFERENCE_DATA_QUERIES = {
  buildGeographyFilter,
  buildIABFilter,
  buildPlatformTaxonomyFilter,
  buildBehavioralFilter,
  buildContextualFilter,
};
