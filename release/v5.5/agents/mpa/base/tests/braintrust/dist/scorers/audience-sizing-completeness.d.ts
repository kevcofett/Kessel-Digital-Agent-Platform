/**
 * Audience Sizing Completeness Scorer (6% weight)
 *
 * TIER 3: ADVANCED QUALITY
 *
 * Evaluates: When in Step 4 Geography, agent MUST present audience sizing table
 * before proceeding to Step 5.
 */
export interface AudienceSizingResult {
    score: number;
    rationale: string;
    analysis: TableAnalysis;
}
export interface TableAnalysis {
    hasTable: boolean;
    hasGeoColumn: boolean;
    hasPopulationColumn: boolean;
    hasTargetAudienceColumn: boolean;
    hasTargetPercentColumn: boolean;
    hasTotalRow: boolean;
    hasMultipleDMAs: boolean;
    hasWeightedAverage: boolean;
}
/**
 * Score audience sizing completeness
 */
export declare function scoreAudienceSizingCompleteness(response: string, currentStep: number): AudienceSizingResult;
export default scoreAudienceSizingCompleteness;
//# sourceMappingURL=audience-sizing-completeness.d.ts.map