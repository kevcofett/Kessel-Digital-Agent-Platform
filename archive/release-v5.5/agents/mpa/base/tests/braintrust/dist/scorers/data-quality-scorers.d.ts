/**
 * Data Quality Scorers - Tests adherence to data quality hierarchy
 *
 * The MPA has a defined data hierarchy for prioritizing information sources:
 * 1. Direct API data (highest priority)
 * 2. Web research from credible sources
 * 3. User provided data
 * 4. KB benchmarks
 * 5. Agent estimates (lowest priority - must be labeled clearly)
 *
 * These scorers verify the agent:
 * - Uses the correct data source for each context
 * - Labels data sources correctly
 * - Doesn't claim higher-priority sources when using lower ones
 * - Recommends validation for estimates
 */
/**
 * Data source types in priority order (highest to lowest)
 */
export declare enum DataSourcePriority {
    API_DATA = 1,
    WEB_RESEARCH = 2,
    USER_PROVIDED = 3,
    KB_BENCHMARK = 4,
    AGENT_ESTIMATE = 5
}
/**
 * Score data source attribution - does agent correctly attribute data?
 */
export declare function scoreDataSourceAttribution(agentResponse: string, expectedSource?: DataSourcePriority): {
    score: number;
    metadata: Record<string, unknown>;
};
/**
 * Score estimate labeling - does agent clearly label estimates?
 */
export declare function scoreEstimateLabeling(agentResponse: string): {
    score: number;
    metadata: Record<string, unknown>;
};
/**
 * Score validation recommendation - does agent recommend validation for estimates?
 */
export declare function scoreValidationRecommendation(agentResponse: string): {
    score: number;
    metadata: Record<string, unknown>;
};
/**
 * Score data hierarchy adherence - does agent use highest available source?
 *
 * This is an LLM-as-judge scorer that evaluates whether the agent
 * appropriately used the data hierarchy given the context.
 */
export declare function scoreDataHierarchyAdherence(userMessage: string, agentResponse: string, availableData: {
    hasApiData?: boolean;
    hasWebSearchAvailable?: boolean;
    hasUserData?: boolean;
    hasKBData?: boolean;
}): Promise<{
    score: number;
    metadata: Record<string, unknown>;
}>;
/**
 * Combined data quality score
 */
export declare function calculateDataQualityScore(scores: {
    sourceAttribution: number;
    estimateLabeling: number;
    validationRecommendation: number;
    hierarchyAdherence?: number;
}): number;
declare const _default: {
    scoreDataSourceAttribution: typeof scoreDataSourceAttribution;
    scoreEstimateLabeling: typeof scoreEstimateLabeling;
    scoreValidationRecommendation: typeof scoreValidationRecommendation;
    scoreDataHierarchyAdherence: typeof scoreDataHierarchyAdherence;
    calculateDataQualityScore: typeof calculateDataQualityScore;
    DataSourcePriority: typeof DataSourcePriority;
};
export default _default;
//# sourceMappingURL=data-quality-scorers.d.ts.map