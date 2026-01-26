/**
 * Benchmark Loader v6.0
 *
 * Loads and provides access to MPA benchmark data from
 * mpa_benchmark_seed_v6_enhanced.csv (331 records, 14 verticals)
 *
 * Supports:
 * - Lookup by vertical + channel + KPI
 * - Confidence level filtering
 * - Trend direction awareness
 * - Fallback to similar verticals
 */
export interface Benchmark {
    mpa_benchmarkid: string;
    mpa_vertical: string;
    mpa_channel: string;
    mpa_kpi: string;
    mpa_value: number;
    mpa_min_value: number;
    mpa_max_value: number;
    mpa_unit: string;
    mpa_confidence_level: "HIGH" | "MEDIUM" | "LOW";
    mpa_source: string;
    mpa_data_period: string;
    mpa_freshness_score: number;
    mpa_sample_size: number;
    mpa_confidence_interval_low: number;
    mpa_confidence_interval_high: number;
    mpa_standard_deviation: number;
    mpa_seasonality_factor: string;
    mpa_market_conditions: string;
    mpa_audience_segment: string;
    mpa_trend_direction: "UP" | "DOWN" | "STABLE";
    mpa_trend_magnitude: number;
    mpa_methodology: string;
    mpa_data_collection_date: string;
}
/**
 * Load benchmarks from CSV file
 */
export declare function loadBenchmarks(csvPath?: string): Benchmark[];
/**
 * Get benchmark for specific vertical, channel, and KPI
 */
export declare function getBenchmark(vertical: string, channel: string, kpi: string, options?: {
    minConfidence?: "HIGH" | "MEDIUM" | "LOW";
    useFallback?: boolean;
}): Benchmark | null;
/**
 * Get all benchmarks for a vertical
 */
export declare function getBenchmarksByVertical(vertical: string): Benchmark[];
/**
 * Get all benchmarks for a channel
 */
export declare function getBenchmarksByChannel(channel: string): Benchmark[];
/**
 * Get benchmark range string for display
 */
export declare function formatBenchmarkRange(benchmark: Benchmark): string;
/**
 * Validate a claimed benchmark value against actual data
 */
export declare function validateBenchmarkClaim(vertical: string, channel: string, kpi: string, claimedValue: number, tolerance?: number): {
    isValid: boolean;
    benchmark: Benchmark | null;
    message: string;
};
/**
 * Get summary statistics for benchmarks
 */
export declare function getBenchmarkSummary(): {
    totalRecords: number;
    byVertical: Record<string, number>;
    byChannel: Record<string, number>;
    byConfidence: Record<string, number>;
};
/**
 * Clear benchmark cache (for testing)
 */
export declare function clearBenchmarkCache(): void;
declare const _default: {
    loadBenchmarks: typeof loadBenchmarks;
    getBenchmark: typeof getBenchmark;
    getBenchmarksByVertical: typeof getBenchmarksByVertical;
    getBenchmarksByChannel: typeof getBenchmarksByChannel;
    formatBenchmarkRange: typeof formatBenchmarkRange;
    validateBenchmarkClaim: typeof validateBenchmarkClaim;
    getBenchmarkSummary: typeof getBenchmarkSummary;
    clearBenchmarkCache: typeof clearBenchmarkCache;
};
export default _default;
//# sourceMappingURL=benchmark-loader.d.ts.map