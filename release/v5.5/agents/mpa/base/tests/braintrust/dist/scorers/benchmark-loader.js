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
import { readFileSync } from "fs";
import * as path from "path";
/**
 * Simple CSV parser (avoids external dependency)
 */
function parseCSV(content) {
    const lines = content.trim().split('\n');
    if (lines.length < 2)
        return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const record = {};
        headers.forEach((header, idx) => {
            record[header] = values[idx] || '';
        });
        records.push(record);
    }
    return records;
}
// Vertical tiers for fallback logic
const VERTICAL_TIERS = {
    TIER_1: ["RETAIL", "ECOMMERCE", "CPG", "FINANCE", "TECHNOLOGY"],
    TIER_2: ["HEALTHCARE", "AUTOMOTIVE", "TRAVEL", "ENTERTAINMENT", "TELECOM"],
    TIER_3: ["GAMING", "HOSPITALITY", "EDUCATION", "B2B_PROFESSIONAL"],
};
// Similar vertical mappings for fallback
const SIMILAR_VERTICALS = {
    RETAIL: ["ECOMMERCE", "CPG"],
    ECOMMERCE: ["RETAIL", "CPG"],
    CPG: ["RETAIL", "ECOMMERCE"],
    FINANCE: ["B2B_PROFESSIONAL", "TECHNOLOGY"],
    TECHNOLOGY: ["B2B_PROFESSIONAL", "FINANCE"],
    HEALTHCARE: ["B2B_PROFESSIONAL"],
    AUTOMOTIVE: ["RETAIL"],
    TRAVEL: ["HOSPITALITY", "ENTERTAINMENT"],
    ENTERTAINMENT: ["GAMING", "TRAVEL"],
    TELECOM: ["TECHNOLOGY", "B2B_PROFESSIONAL"],
    GAMING: ["ENTERTAINMENT", "TECHNOLOGY"],
    HOSPITALITY: ["TRAVEL", "ENTERTAINMENT"],
    EDUCATION: ["B2B_PROFESSIONAL"],
    B2B_PROFESSIONAL: ["TECHNOLOGY", "FINANCE"],
};
// Cached benchmark data
let benchmarkCache = null;
/**
 * Load benchmarks from CSV file
 */
export function loadBenchmarks(csvPath) {
    if (benchmarkCache) {
        return benchmarkCache;
    }
    const defaultPath = path.resolve(__dirname, "../../seed-data-v6/mpa_benchmark_seed_v6_enhanced.csv");
    const filePath = csvPath || defaultPath;
    try {
        const csvContent = readFileSync(filePath, "utf-8");
        const records = parseCSV(csvContent);
        benchmarkCache = records.map((row) => ({
            mpa_benchmarkid: row.mpa_benchmarkid,
            mpa_vertical: row.mpa_vertical,
            mpa_channel: row.mpa_channel,
            mpa_kpi: row.mpa_kpi,
            mpa_value: parseFloat(row.mpa_value),
            mpa_min_value: parseFloat(row.mpa_min_value),
            mpa_max_value: parseFloat(row.mpa_max_value),
            mpa_unit: row.mpa_unit,
            mpa_confidence_level: row.mpa_confidence_level,
            mpa_source: row.mpa_source,
            mpa_data_period: row.mpa_data_period,
            mpa_freshness_score: parseFloat(row.mpa_freshness_score),
            mpa_sample_size: parseInt(row.mpa_sample_size, 10),
            mpa_confidence_interval_low: parseFloat(row.mpa_confidence_interval_low),
            mpa_confidence_interval_high: parseFloat(row.mpa_confidence_interval_high),
            mpa_standard_deviation: parseFloat(row.mpa_standard_deviation),
            mpa_seasonality_factor: row.mpa_seasonality_factor,
            mpa_market_conditions: row.mpa_market_conditions,
            mpa_audience_segment: row.mpa_audience_segment,
            mpa_trend_direction: row.mpa_trend_direction,
            mpa_trend_magnitude: parseFloat(row.mpa_trend_magnitude),
            mpa_methodology: row.mpa_methodology,
            mpa_data_collection_date: row.mpa_data_collection_date,
        }));
        console.log(`Loaded ${benchmarkCache.length} benchmark records from ${filePath}`);
        return benchmarkCache;
    }
    catch (error) {
        console.error(`Failed to load benchmarks from ${filePath}:`, error);
        return [];
    }
}
/**
 * Get benchmark for specific vertical, channel, and KPI
 */
export function getBenchmark(vertical, channel, kpi, options) {
    const benchmarks = loadBenchmarks();
    const { minConfidence, useFallback = true } = options || {};
    // Normalize inputs
    const v = vertical.toUpperCase();
    const c = channel.toUpperCase();
    const k = kpi.toUpperCase();
    // Confidence level priority
    const confidencePriority = {
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
    };
    const minConfidenceLevel = minConfidence ? confidencePriority[minConfidence] : 0;
    // Try exact match first
    let match = benchmarks.find((b) => b.mpa_vertical === v &&
        b.mpa_channel === c &&
        b.mpa_kpi === k &&
        confidencePriority[b.mpa_confidence_level] >= minConfidenceLevel);
    if (match)
        return match;
    // Try fallback to similar verticals
    if (useFallback && SIMILAR_VERTICALS[v]) {
        for (const fallbackVertical of SIMILAR_VERTICALS[v]) {
            match = benchmarks.find((b) => b.mpa_vertical === fallbackVertical &&
                b.mpa_channel === c &&
                b.mpa_kpi === k &&
                confidencePriority[b.mpa_confidence_level] >= minConfidenceLevel);
            if (match) {
                // Mark as fallback in the return
                return {
                    ...match,
                    mpa_source: `${match.mpa_source} (fallback from ${fallbackVertical})`,
                };
            }
        }
    }
    return null;
}
/**
 * Get all benchmarks for a vertical
 */
export function getBenchmarksByVertical(vertical) {
    const benchmarks = loadBenchmarks();
    return benchmarks.filter((b) => b.mpa_vertical === vertical.toUpperCase());
}
/**
 * Get all benchmarks for a channel
 */
export function getBenchmarksByChannel(channel) {
    const benchmarks = loadBenchmarks();
    return benchmarks.filter((b) => b.mpa_channel === channel.toUpperCase());
}
/**
 * Get benchmark range string for display
 */
export function formatBenchmarkRange(benchmark) {
    const { mpa_value, mpa_min_value, mpa_max_value, mpa_unit, mpa_kpi } = benchmark;
    if (mpa_unit === "PERCENT" || mpa_unit === "PERCENTAGE") {
        return `${mpa_value.toFixed(1)}% (range: ${mpa_min_value.toFixed(1)}-${mpa_max_value.toFixed(1)}%)`;
    }
    if (mpa_unit === "DOLLARS" || mpa_unit === "USD") {
        return `$${mpa_value.toFixed(2)} (range: $${mpa_min_value.toFixed(2)}-$${mpa_max_value.toFixed(2)})`;
    }
    if (mpa_unit === "RATIO" || mpa_kpi.includes("ROAS")) {
        return `${mpa_value.toFixed(1)}x (range: ${mpa_min_value.toFixed(1)}-${mpa_max_value.toFixed(1)}x)`;
    }
    return `${mpa_value} (range: ${mpa_min_value}-${mpa_max_value})`;
}
/**
 * Validate a claimed benchmark value against actual data
 */
export function validateBenchmarkClaim(vertical, channel, kpi, claimedValue, tolerance = 0.15 // 15% tolerance
) {
    const benchmark = getBenchmark(vertical, channel, kpi);
    if (!benchmark) {
        return {
            isValid: false,
            benchmark: null,
            message: `No benchmark found for ${vertical}/${channel}/${kpi}`,
        };
    }
    const { mpa_min_value, mpa_max_value, mpa_value } = benchmark;
    // Check if within range
    if (claimedValue >= mpa_min_value && claimedValue <= mpa_max_value) {
        return {
            isValid: true,
            benchmark,
            message: `Claimed value ${claimedValue} is within benchmark range`,
        };
    }
    // Check if within tolerance of typical value
    const lowerBound = mpa_value * (1 - tolerance);
    const upperBound = mpa_value * (1 + tolerance);
    if (claimedValue >= lowerBound && claimedValue <= upperBound) {
        return {
            isValid: true,
            benchmark,
            message: `Claimed value ${claimedValue} is within ${tolerance * 100}% of typical (${mpa_value})`,
        };
    }
    return {
        isValid: false,
        benchmark,
        message: `Claimed value ${claimedValue} is outside benchmark range [${mpa_min_value}-${mpa_max_value}]`,
    };
}
/**
 * Get summary statistics for benchmarks
 */
export function getBenchmarkSummary() {
    const benchmarks = loadBenchmarks();
    const byVertical = {};
    const byChannel = {};
    const byConfidence = {};
    for (const b of benchmarks) {
        byVertical[b.mpa_vertical] = (byVertical[b.mpa_vertical] || 0) + 1;
        byChannel[b.mpa_channel] = (byChannel[b.mpa_channel] || 0) + 1;
        byConfidence[b.mpa_confidence_level] = (byConfidence[b.mpa_confidence_level] || 0) + 1;
    }
    return {
        totalRecords: benchmarks.length,
        byVertical,
        byChannel,
        byConfidence,
    };
}
/**
 * Clear benchmark cache (for testing)
 */
export function clearBenchmarkCache() {
    benchmarkCache = null;
}
export default {
    loadBenchmarks,
    getBenchmark,
    getBenchmarksByVertical,
    getBenchmarksByChannel,
    formatBenchmarkRange,
    validateBenchmarkClaim,
    getBenchmarkSummary,
    clearBenchmarkCache,
};
//# sourceMappingURL=benchmark-loader.js.map