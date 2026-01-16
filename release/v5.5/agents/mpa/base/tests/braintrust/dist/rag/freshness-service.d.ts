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
import { EnhancedBenchmark } from './dataverse-schema.js';
/**
 * Freshness assessment result
 */
export interface FreshnessAssessment {
    score: number;
    status: FreshnessStatus;
    ageInDays: number;
    halfLifeDays: number;
    confidenceAdjustment: number;
    recommendation: string;
    nextRefreshDate: Date | null;
}
/**
 * Freshness status levels
 */
export type FreshnessStatus = 'FRESH' | 'CURRENT' | 'AGING' | 'STALE' | 'EXPIRED';
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
    stale: string[];
    expired: string[];
    averageFreshness: number;
}
/**
 * KPI-specific volatility configurations
 * Based on how frequently each metric typically changes in the market
 */
export declare const KPI_VOLATILITY_CONFIGS: Record<string, KPIVolatilityConfig>;
export declare class FreshnessService {
    private kpiConfigs;
    constructor(customConfigs?: Record<string, Partial<KPIVolatilityConfig>>);
    /**
     * Assess freshness of a benchmark
     */
    assessFreshness(benchmark: EnhancedBenchmark): FreshnessAssessment;
    /**
     * Assess freshness from raw data (without EnhancedBenchmark)
     */
    assessFreshnessRaw(kpiCode: string, periodEnd: Date): FreshnessAssessment;
    /**
     * Update freshness scores for a batch of benchmarks
     */
    updateBatchFreshness(benchmarks: EnhancedBenchmark[]): BatchFreshnessResult;
    /**
     * Get KPI configuration
     */
    getKPIConfig(kpiCode: string): KPIVolatilityConfig;
    /**
     * Check if benchmark needs refresh
     */
    needsRefresh(benchmark: EnhancedBenchmark): boolean;
    /**
     * Get freshness-adjusted confidence level
     */
    getAdjustedConfidence(originalConfidence: 'HIGH' | 'MEDIUM' | 'LOW', freshnessScore: number): 'HIGH' | 'MEDIUM' | 'LOW';
    /**
     * Format freshness for display
     */
    formatFreshnessDisplay(assessment: FreshnessAssessment): string;
    /**
     * Get default config for unknown KPI
     */
    private getDefaultConfig;
    /**
     * Determine status from freshness score
     */
    private getStatus;
    /**
     * Calculate confidence adjustment based on freshness
     */
    private getConfidenceAdjustment;
    /**
     * Generate recommendation based on status
     */
    private getRecommendation;
    /**
     * Calculate recommended next refresh date
     */
    private calculateNextRefresh;
}
/**
 * Quick freshness check without creating service instance
 */
export declare function quickFreshnessCheck(kpiCode: string, periodEnd: Date): {
    score: number;
    status: FreshnessStatus;
    isStale: boolean;
};
/**
 * Get all stale benchmarks from a collection
 */
export declare function findStaleBenchmarks(benchmarks: EnhancedBenchmark[]): EnhancedBenchmark[];
/**
 * Calculate weighted freshness for multiple benchmarks
 */
export declare function calculateWeightedFreshness(benchmarks: EnhancedBenchmark[], weights?: Record<string, number>): number;
export default FreshnessService;
//# sourceMappingURL=freshness-service.d.ts.map