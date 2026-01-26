/**
 * Freshness Scoring Service
 *
 * Provides temporal awareness for benchmark data:
 * - Calculate freshness scores with KPI-specific decay rates
 * - Flag stale data that needs refreshing
 * - Support for confidence adjustments based on data age
 *
 * @module freshness-service
 * @version 6.0
 */

import { EnhancedBenchmark, calculateFreshnessScore } from './dataverse-schema.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Freshness assessment result
 */
export interface FreshnessAssessment {
  score: number;                      // 0-1 freshness score
  status: FreshnessStatus;            // Human-readable status
  ageInDays: number;                  // Data age
  halfLifeDays: number;               // KPI-specific half-life
  confidenceAdjustment: number;       // Multiplier for confidence
  recommendation: string;             // Action recommendation
  nextRefreshDate: Date | null;       // When to refresh
}

/**
 * Freshness status levels
 */
export type FreshnessStatus =
  | 'FRESH'        // < 30 days old, full confidence
  | 'CURRENT'      // 30-90 days old, high confidence
  | 'AGING'        // 90-180 days old, medium confidence
  | 'STALE'        // 180-365 days old, low confidence
  | 'EXPIRED';     // > 365 days old, needs immediate refresh

/**
 * KPI volatility configuration
 */
export interface KPIVolatilityConfig {
  kpiCode: string;
  halfLifeDays: number;
  volatilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

/**
 * Batch freshness update result
 */
export interface BatchFreshnessResult {
  updated: number;
  stale: string[];                   // Composite keys of stale benchmarks
  expired: string[];                 // Composite keys of expired benchmarks
  averageFreshness: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * KPI-specific volatility configurations
 * Based on how frequently each metric typically changes in the market
 */
export const KPI_VOLATILITY_CONFIGS: Record<string, KPIVolatilityConfig> = {
  // High volatility - changes frequently with market conditions
  'CPM': {
    kpiCode: 'CPM',
    halfLifeDays: 90,
    volatilityLevel: 'HIGH',
    description: 'Ad pricing fluctuates with supply/demand, seasonality, and competition',
  },
  'ROAS': {
    kpiCode: 'ROAS',
    halfLifeDays: 90,
    volatilityLevel: 'HIGH',
    description: 'Return on ad spend varies with market conditions and conversion patterns',
  },
  'CAC': {
    kpiCode: 'CAC',
    halfLifeDays: 120,
    volatilityLevel: 'HIGH',
    description: 'Acquisition costs change with competition and channel efficiency',
  },
  'CPA': {
    kpiCode: 'CPA',
    halfLifeDays: 120,
    volatilityLevel: 'HIGH',
    description: 'Cost per acquisition varies with campaign optimization and market',
  },
  'CPC': {
    kpiCode: 'CPC',
    halfLifeDays: 90,
    volatilityLevel: 'HIGH',
    description: 'Cost per click fluctuates with auction dynamics',
  },

  // Medium volatility - moderately stable
  'CTR': {
    kpiCode: 'CTR',
    halfLifeDays: 180,
    volatilityLevel: 'MEDIUM',
    description: 'Click-through rates relatively stable but affected by creative fatigue',
  },
  'CVR': {
    kpiCode: 'CVR',
    halfLifeDays: 120,
    volatilityLevel: 'MEDIUM',
    description: 'Conversion rates vary with landing page changes and user behavior',
  },
  'AOV': {
    kpiCode: 'AOV',
    halfLifeDays: 180,
    volatilityLevel: 'MEDIUM',
    description: 'Average order value changes with product mix and promotions',
  },
  'FREQUENCY': {
    kpiCode: 'FREQUENCY',
    halfLifeDays: 180,
    volatilityLevel: 'MEDIUM',
    description: 'Ad frequency benchmarks stable but platform-dependent',
  },

  // Low volatility - slow to change
  'LTV': {
    kpiCode: 'LTV',
    halfLifeDays: 365,
    volatilityLevel: 'LOW',
    description: 'Lifetime value changes slowly as cohorts mature',
  },
  'VIEWABILITY': {
    kpiCode: 'VIEWABILITY',
    halfLifeDays: 365,
    volatilityLevel: 'LOW',
    description: 'Viewability standards and performance change slowly',
  },
  'BRAND_LIFT': {
    kpiCode: 'BRAND_LIFT',
    halfLifeDays: 365,
    volatilityLevel: 'LOW',
    description: 'Brand metrics change slowly over time',
  },
};

/**
 * Default half-life for unknown KPIs
 */
const DEFAULT_HALF_LIFE_DAYS = 180;

/**
 * Freshness thresholds
 */
const FRESHNESS_THRESHOLDS = {
  FRESH: 0.9,      // > 90% freshness
  CURRENT: 0.7,    // > 70% freshness
  AGING: 0.5,      // > 50% freshness
  STALE: 0.2,      // > 20% freshness
  EXPIRED: 0.0,    // <= 20% freshness
};

// ============================================================================
// MAIN FRESHNESS SERVICE CLASS
// ============================================================================

export class FreshnessService {
  private kpiConfigs: Record<string, KPIVolatilityConfig>;

  constructor(customConfigs?: Record<string, Partial<KPIVolatilityConfig>>) {
    // Merge custom configs with defaults
    this.kpiConfigs = { ...KPI_VOLATILITY_CONFIGS };

    if (customConfigs) {
      for (const [kpi, config] of Object.entries(customConfigs)) {
        this.kpiConfigs[kpi.toUpperCase()] = {
          ...KPI_VOLATILITY_CONFIGS[kpi.toUpperCase()] || {
            kpiCode: kpi.toUpperCase(),
            halfLifeDays: DEFAULT_HALF_LIFE_DAYS,
            volatilityLevel: 'MEDIUM',
            description: 'Custom KPI configuration',
          },
          ...config,
        };
      }
    }
  }

  /**
   * Assess freshness of a benchmark
   */
  assessFreshness(benchmark: EnhancedBenchmark): FreshnessAssessment {
    const kpiCode = benchmark.mpa_kpi_code.toUpperCase();
    const config = this.kpiConfigs[kpiCode] || this.getDefaultConfig(kpiCode);

    const periodEnd = new Date(benchmark.mpa_data_period_end);
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - periodEnd.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate freshness score
    const score = calculateFreshnessScore(kpiCode, periodEnd);

    // Determine status
    const status = this.getStatus(score);

    // Calculate confidence adjustment
    const confidenceAdjustment = this.getConfidenceAdjustment(score, status);

    // Generate recommendation
    const recommendation = this.getRecommendation(status, ageInDays, kpiCode);

    // Calculate next refresh date
    const nextRefreshDate = this.calculateNextRefresh(periodEnd, config.halfLifeDays, status);

    return {
      score: Math.round(score * 1000) / 1000,
      status,
      ageInDays,
      halfLifeDays: config.halfLifeDays,
      confidenceAdjustment,
      recommendation,
      nextRefreshDate,
    };
  }

  /**
   * Assess freshness from raw data (without EnhancedBenchmark)
   */
  assessFreshnessRaw(
    kpiCode: string,
    periodEnd: Date
  ): FreshnessAssessment {
    const config = this.kpiConfigs[kpiCode.toUpperCase()] || this.getDefaultConfig(kpiCode);
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - periodEnd.getTime()) / (1000 * 60 * 60 * 24));

    const score = calculateFreshnessScore(kpiCode, periodEnd);
    const status = this.getStatus(score);
    const confidenceAdjustment = this.getConfidenceAdjustment(score, status);
    const recommendation = this.getRecommendation(status, ageInDays, kpiCode);
    const nextRefreshDate = this.calculateNextRefresh(periodEnd, config.halfLifeDays, status);

    return {
      score: Math.round(score * 1000) / 1000,
      status,
      ageInDays,
      halfLifeDays: config.halfLifeDays,
      confidenceAdjustment,
      recommendation,
      nextRefreshDate,
    };
  }

  /**
   * Update freshness scores for a batch of benchmarks
   */
  updateBatchFreshness(benchmarks: EnhancedBenchmark[]): BatchFreshnessResult {
    const stale: string[] = [];
    const expired: string[] = [];
    let totalFreshness = 0;

    for (const benchmark of benchmarks) {
      const assessment = this.assessFreshness(benchmark);

      // Update the benchmark's freshness score
      benchmark.mpa_freshness_score = assessment.score;

      totalFreshness += assessment.score;

      // Track stale and expired
      const key = `${benchmark.mpa_vertical_code}|${benchmark.mpa_channel_code}|${benchmark.mpa_kpi_code}`;

      if (assessment.status === 'STALE') {
        stale.push(key);
      } else if (assessment.status === 'EXPIRED') {
        expired.push(key);
      }
    }

    return {
      updated: benchmarks.length,
      stale,
      expired,
      averageFreshness: benchmarks.length > 0
        ? Math.round((totalFreshness / benchmarks.length) * 1000) / 1000
        : 0,
    };
  }

  /**
   * Get KPI configuration
   */
  getKPIConfig(kpiCode: string): KPIVolatilityConfig {
    return this.kpiConfigs[kpiCode.toUpperCase()] || this.getDefaultConfig(kpiCode);
  }

  /**
   * Check if benchmark needs refresh
   */
  needsRefresh(benchmark: EnhancedBenchmark): boolean {
    const assessment = this.assessFreshness(benchmark);
    return assessment.status === 'STALE' || assessment.status === 'EXPIRED';
  }

  /**
   * Get freshness-adjusted confidence level
   */
  getAdjustedConfidence(
    originalConfidence: 'HIGH' | 'MEDIUM' | 'LOW',
    freshnessScore: number
  ): 'HIGH' | 'MEDIUM' | 'LOW' {
    const confidenceValues = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const status = this.getStatus(freshnessScore);
    const adjustment = this.getConfidenceAdjustment(freshnessScore, status);

    const adjustedValue = Math.round(confidenceValues[originalConfidence] * adjustment);

    if (adjustedValue >= 3) return 'HIGH';
    if (adjustedValue >= 2) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Format freshness for display
   */
  formatFreshnessDisplay(assessment: FreshnessAssessment): string {
    const scorePercent = Math.round(assessment.score * 100);
    const statusEmoji = {
      FRESH: '',
      CURRENT: '',
      AGING: '',
      STALE: '',
      EXPIRED: '',
    }[assessment.status] || '';

    let display = `${statusEmoji} ${scorePercent}% fresh (${assessment.status})`;

    if (assessment.status !== 'FRESH' && assessment.status !== 'CURRENT') {
      display += ` - ${assessment.recommendation}`;
    }

    return display;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Get default config for unknown KPI
   */
  private getDefaultConfig(kpiCode: string): KPIVolatilityConfig {
    return {
      kpiCode: kpiCode.toUpperCase(),
      halfLifeDays: DEFAULT_HALF_LIFE_DAYS,
      volatilityLevel: 'MEDIUM',
      description: 'Default configuration for unknown KPI',
    };
  }

  /**
   * Determine status from freshness score
   */
  private getStatus(score: number): FreshnessStatus {
    if (score >= FRESHNESS_THRESHOLDS.FRESH) return 'FRESH';
    if (score >= FRESHNESS_THRESHOLDS.CURRENT) return 'CURRENT';
    if (score >= FRESHNESS_THRESHOLDS.AGING) return 'AGING';
    if (score >= FRESHNESS_THRESHOLDS.STALE) return 'STALE';
    return 'EXPIRED';
  }

  /**
   * Calculate confidence adjustment based on freshness
   */
  private getConfidenceAdjustment(score: number, status: FreshnessStatus): number {
    const adjustments: Record<FreshnessStatus, number> = {
      FRESH: 1.0,
      CURRENT: 0.95,
      AGING: 0.8,
      STALE: 0.6,
      EXPIRED: 0.4,
    };

    return adjustments[status];
  }

  /**
   * Generate recommendation based on status
   */
  private getRecommendation(
    status: FreshnessStatus,
    ageInDays: number,
    kpiCode: string
  ): string {
    switch (status) {
      case 'FRESH':
        return 'Data is current. No action needed.';
      case 'CURRENT':
        return 'Data is reliable. Consider monitoring for updates.';
      case 'AGING':
        return `Data is ${ageInDays} days old. Validate with recent market research.`;
      case 'STALE':
        return `${kpiCode} data is stale. Recommend refreshing with current benchmarks.`;
      case 'EXPIRED':
        return `${kpiCode} data is expired (${ageInDays} days old). Immediate refresh required.`;
      default:
        return 'Unable to assess freshness.';
    }
  }

  /**
   * Calculate recommended next refresh date
   */
  private calculateNextRefresh(
    periodEnd: Date,
    halfLifeDays: number,
    status: FreshnessStatus
  ): Date | null {
    const now = new Date();

    // For FRESH data, schedule refresh at half-life
    if (status === 'FRESH' || status === 'CURRENT') {
      const refreshDate = new Date(periodEnd);
      refreshDate.setDate(refreshDate.getDate() + halfLifeDays);

      // If already past, set to next month
      if (refreshDate <= now) {
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      }

      return refreshDate;
    }

    // For aging/stale data, recommend immediate refresh
    if (status === 'AGING' || status === 'STALE' || status === 'EXPIRED') {
      // Next business day
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    return null;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Quick freshness check without creating service instance
 */
export function quickFreshnessCheck(
  kpiCode: string,
  periodEnd: Date
): { score: number; status: FreshnessStatus; isStale: boolean } {
  const service = new FreshnessService();
  const assessment = service.assessFreshnessRaw(kpiCode, periodEnd);

  return {
    score: assessment.score,
    status: assessment.status,
    isStale: assessment.status === 'STALE' || assessment.status === 'EXPIRED',
  };
}

/**
 * Get all stale benchmarks from a collection
 */
export function findStaleBenchmarks(benchmarks: EnhancedBenchmark[]): EnhancedBenchmark[] {
  const service = new FreshnessService();
  return benchmarks.filter(b => service.needsRefresh(b));
}

/**
 * Calculate weighted freshness for multiple benchmarks
 */
export function calculateWeightedFreshness(
  benchmarks: EnhancedBenchmark[],
  weights?: Record<string, number>
): number {
  if (benchmarks.length === 0) return 0;

  const service = new FreshnessService();
  let totalWeight = 0;
  let weightedSum = 0;

  for (const benchmark of benchmarks) {
    const key = benchmark.mpa_kpi_code.toUpperCase();
    const weight = weights?.[key] || 1;
    const assessment = service.assessFreshness(benchmark);

    weightedSum += assessment.score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export default FreshnessService;
