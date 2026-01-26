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
    mpa_data_collection_date: Date;
    mpa_data_period_start: Date;
    mpa_data_period_end: Date;
    mpa_freshness_score: number;
    mpa_next_refresh_date: Date | null;
    mpa_sample_size: number | null;
    mpa_confidence_interval_low: number | null;
    mpa_confidence_interval_high: number | null;
    mpa_standard_deviation: number | null;
    mpa_methodology: string;
    mpa_seasonality_factor: SeasonalityFactor;
    mpa_market_conditions: MarketConditions;
    mpa_audience_segment: AudienceSegment;
    mpa_trend_direction: TrendDirection;
    mpa_trend_magnitude: number;
    mpa_historical_values: string;
}
/**
 * Seasonality factors
 */
export type SeasonalityFactor = 'Q4_HOLIDAY' | 'Q1_NEW_YEAR' | 'Q2_SPRING' | 'Q3_SUMMER' | 'BACK_TO_SCHOOL' | 'NORMAL';
/**
 * Market conditions
 */
export type MarketConditions = 'HIGH_COMPETITION' | 'NORMAL' | 'LOW_COMPETITION' | 'RECESSION' | 'GROWTH';
/**
 * Audience segment types
 */
export type AudienceSegment = 'GENERAL' | 'HIGH_INTENT' | 'REMARKETING' | 'PROSPECTING' | 'LOYALTY';
/**
 * Trend directions
 */
export type TrendDirection = 'INCREASING' | 'STABLE' | 'DECREASING' | 'VOLATILE';
/**
 * Dataverse table schema for mpa_benchmark_v6
 */
export declare const BENCHMARK_V6_SCHEMA: {
    tableName: string;
    displayName: string;
    description: string;
    columns: ({
        logicalName: string;
        displayName: string;
        type: string;
        maxLength: number;
        required: boolean;
        description: string;
        precision?: undefined;
        scale?: undefined;
        options?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        precision: number;
        scale: number;
        required: boolean;
        description: string;
        maxLength?: undefined;
        options?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        options: string[];
        required: boolean;
        description: string;
        maxLength?: undefined;
        precision?: undefined;
        scale?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        required: boolean;
        description: string;
        maxLength?: undefined;
        precision?: undefined;
        scale?: undefined;
        options?: undefined;
    })[];
    alternateKeys: {
        name: string;
        columns: string[];
    }[];
};
/**
 * Convert v5.5 benchmark to v6.0 format
 */
export declare function migrateBenchmarkToV6(v55: BenchmarkV55, defaults?: Partial<EnhancedBenchmark>): EnhancedBenchmark;
/**
 * Calculate freshness score based on KPI type and data age
 * Per MPA v6.0 Improvement Plan Section 4.2
 */
export declare function calculateFreshnessScore(kpiCode: string, periodEnd: Date): number;
/**
 * Build OData filter for benchmark query
 */
export declare function buildBenchmarkFilter(vertical: string, channel?: string, kpi?: string, minFreshness?: number): string;
/**
 * Build OData select for benchmark fields
 */
export declare function buildBenchmarkSelect(includeHistorical?: boolean): string;
/**
 * Format benchmark for agent response
 */
export declare function formatBenchmarkResponse(benchmark: EnhancedBenchmark): string;
declare const _default: {
    BENCHMARK_V6_SCHEMA: {
        tableName: string;
        displayName: string;
        description: string;
        columns: ({
            logicalName: string;
            displayName: string;
            type: string;
            maxLength: number;
            required: boolean;
            description: string;
            precision?: undefined;
            scale?: undefined;
            options?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            precision: number;
            scale: number;
            required: boolean;
            description: string;
            maxLength?: undefined;
            options?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            options: string[];
            required: boolean;
            description: string;
            maxLength?: undefined;
            precision?: undefined;
            scale?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            required: boolean;
            description: string;
            maxLength?: undefined;
            precision?: undefined;
            scale?: undefined;
            options?: undefined;
        })[];
        alternateKeys: {
            name: string;
            columns: string[];
        }[];
    };
    migrateBenchmarkToV6: typeof migrateBenchmarkToV6;
    calculateFreshnessScore: typeof calculateFreshnessScore;
    buildBenchmarkFilter: typeof buildBenchmarkFilter;
    buildBenchmarkSelect: typeof buildBenchmarkSelect;
    formatBenchmarkResponse: typeof formatBenchmarkResponse;
};
export default _default;
/**
 * Geographic/Census Data Schema
 * Supports multi-region deployment (US, CA, UK, MX, AU, DE, FR, CL, ES, BR, IT, JP)
 */
export declare const GEOGRAPHY_SCHEMA: {
    tableName: string;
    displayName: string;
    description: string;
    columns: ({
        logicalName: string;
        displayName: string;
        type: string;
        maxLength: number;
        required: boolean;
        description: string;
        options?: undefined;
        precision?: undefined;
        scale?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        options: string[];
        required: boolean;
        description: string;
        maxLength?: undefined;
        precision?: undefined;
        scale?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        required: boolean;
        description: string;
        maxLength?: undefined;
        options?: undefined;
        precision?: undefined;
        scale?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        precision: number;
        scale: number;
        required: boolean;
        description: string;
        maxLength?: undefined;
        options?: undefined;
    })[];
    alternateKeys: {
        name: string;
        columns: string[];
    }[];
};
/**
 * IAB Content Taxonomy Schema
 * IAB Tech Lab Content Taxonomy 3.0
 */
export declare const IAB_TAXONOMY_SCHEMA: {
    tableName: string;
    displayName: string;
    description: string;
    columns: ({
        logicalName: string;
        displayName: string;
        type: string;
        maxLength: number;
        required: boolean;
        description: string;
        options?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        required: boolean;
        description: string;
        maxLength?: undefined;
        options?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        options: string[];
        required: boolean;
        description: string;
        maxLength?: undefined;
    })[];
    alternateKeys: {
        name: string;
        columns: string[];
    }[];
};
/**
 * Platform Audience Taxonomy Schema
 * Google Affinity/In-Market, Meta Interests/Behaviors, LinkedIn
 */
export declare const PLATFORM_TAXONOMY_SCHEMA: {
    tableName: string;
    displayName: string;
    description: string;
    columns: ({
        logicalName: string;
        displayName: string;
        type: string;
        maxLength: number;
        required: boolean;
        description: string;
        options?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        options: string[];
        required: boolean;
        description: string;
        maxLength?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        required: boolean;
        description: string;
        maxLength?: undefined;
        options?: undefined;
    })[];
    alternateKeys: {
        name: string;
        columns: string[];
    }[];
};
/**
 * Behavioral Attributes Schema
 * Cross-platform behavioral signals
 */
export declare const BEHAVIORAL_ATTRIBUTES_SCHEMA: {
    tableName: string;
    displayName: string;
    description: string;
    columns: ({
        logicalName: string;
        displayName: string;
        type: string;
        maxLength: number;
        required: boolean;
        description: string;
        options?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        options: string[];
        required: boolean;
        description: string;
        maxLength?: undefined;
    })[];
    alternateKeys: {
        name: string;
        columns: string[];
    }[];
};
/**
 * Contextual Attributes Schema
 * Content and environment-based targeting signals
 */
export declare const CONTEXTUAL_ATTRIBUTES_SCHEMA: {
    tableName: string;
    displayName: string;
    description: string;
    columns: ({
        logicalName: string;
        displayName: string;
        type: string;
        maxLength: number;
        required: boolean;
        description: string;
        options?: undefined;
    } | {
        logicalName: string;
        displayName: string;
        type: string;
        options: string[];
        required: boolean;
        description: string;
        maxLength?: undefined;
    })[];
    alternateKeys: {
        name: string;
        columns: string[];
    }[];
};
/**
 * Build OData filter for geography query
 */
export declare function buildGeographyFilter(country: string, geoType?: string, minPopulation?: number, maxRank?: number): string;
/**
 * Build OData filter for IAB taxonomy query
 */
export declare function buildIABFilter(tier?: number, parentCode?: string, vertical?: string): string;
/**
 * Build OData filter for platform taxonomy query
 */
export declare function buildPlatformTaxonomyFilter(platform: string, taxonomyType?: string, vertical?: string): string;
/**
 * Build OData filter for behavioral attributes query
 */
export declare function buildBehavioralFilter(category?: string, intentLevel?: string, platform?: string): string;
/**
 * Build OData filter for contextual attributes query
 */
export declare function buildContextualFilter(category?: string, brandSafetyTier?: string, iabCode?: string): string;
export declare const REFERENCE_DATA_SCHEMAS: {
    GEOGRAPHY_SCHEMA: {
        tableName: string;
        displayName: string;
        description: string;
        columns: ({
            logicalName: string;
            displayName: string;
            type: string;
            maxLength: number;
            required: boolean;
            description: string;
            options?: undefined;
            precision?: undefined;
            scale?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            options: string[];
            required: boolean;
            description: string;
            maxLength?: undefined;
            precision?: undefined;
            scale?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            required: boolean;
            description: string;
            maxLength?: undefined;
            options?: undefined;
            precision?: undefined;
            scale?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            precision: number;
            scale: number;
            required: boolean;
            description: string;
            maxLength?: undefined;
            options?: undefined;
        })[];
        alternateKeys: {
            name: string;
            columns: string[];
        }[];
    };
    IAB_TAXONOMY_SCHEMA: {
        tableName: string;
        displayName: string;
        description: string;
        columns: ({
            logicalName: string;
            displayName: string;
            type: string;
            maxLength: number;
            required: boolean;
            description: string;
            options?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            required: boolean;
            description: string;
            maxLength?: undefined;
            options?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            options: string[];
            required: boolean;
            description: string;
            maxLength?: undefined;
        })[];
        alternateKeys: {
            name: string;
            columns: string[];
        }[];
    };
    PLATFORM_TAXONOMY_SCHEMA: {
        tableName: string;
        displayName: string;
        description: string;
        columns: ({
            logicalName: string;
            displayName: string;
            type: string;
            maxLength: number;
            required: boolean;
            description: string;
            options?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            options: string[];
            required: boolean;
            description: string;
            maxLength?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            required: boolean;
            description: string;
            maxLength?: undefined;
            options?: undefined;
        })[];
        alternateKeys: {
            name: string;
            columns: string[];
        }[];
    };
    BEHAVIORAL_ATTRIBUTES_SCHEMA: {
        tableName: string;
        displayName: string;
        description: string;
        columns: ({
            logicalName: string;
            displayName: string;
            type: string;
            maxLength: number;
            required: boolean;
            description: string;
            options?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            options: string[];
            required: boolean;
            description: string;
            maxLength?: undefined;
        })[];
        alternateKeys: {
            name: string;
            columns: string[];
        }[];
    };
    CONTEXTUAL_ATTRIBUTES_SCHEMA: {
        tableName: string;
        displayName: string;
        description: string;
        columns: ({
            logicalName: string;
            displayName: string;
            type: string;
            maxLength: number;
            required: boolean;
            description: string;
            options?: undefined;
        } | {
            logicalName: string;
            displayName: string;
            type: string;
            options: string[];
            required: boolean;
            description: string;
            maxLength?: undefined;
        })[];
        alternateKeys: {
            name: string;
            columns: string[];
        }[];
    };
};
export declare const REFERENCE_DATA_QUERIES: {
    buildGeographyFilter: typeof buildGeographyFilter;
    buildIABFilter: typeof buildIABFilter;
    buildPlatformTaxonomyFilter: typeof buildPlatformTaxonomyFilter;
    buildBehavioralFilter: typeof buildBehavioralFilter;
    buildContextualFilter: typeof buildContextualFilter;
};
//# sourceMappingURL=dataverse-schema.d.ts.map