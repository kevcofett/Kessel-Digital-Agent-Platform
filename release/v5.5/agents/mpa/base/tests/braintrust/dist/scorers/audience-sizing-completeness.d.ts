/**
 * Audience Sizing Completeness Scorer v2.1 (6% weight)
 *
 * TIER 3: ADVANCED QUALITY
 *
 * SCORER_SPECIFICATION_v2.1 Updates:
 * - ADDED: Census source citation present (12%)
 * - ADDED: Calculation methodology shown (10%)
 * - ADDED: Taxonomy codes present (10%)
 * - REBALANCED: Existing components reduced proportionally
 *
 * Evaluates: When in Step 4 Geography, agent MUST present audience sizing table
 * with census-validated data and taxonomy codes before proceeding to Step 5.
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
    hasCensusCitation: boolean;
    hasCalculationMethodology: boolean;
    hasTaxonomyCodes: boolean;
}
/**
 * Score audience sizing completeness v2.1
 *
 * Component weights (total = 100%):
 * - DMA/Geography column: 10%
 * - Total Population column: 10%
 * - Target Audience column (whole numbers): 10%
 * - Target % column: 8%
 * - TOTAL row with aggregation: 10%
 * - Multiple DMAs if regional/national: 10%
 * - Weighted average for percentages: 10%
 * - Census source citation: 12%
 * - Calculation methodology: 10%
 * - Taxonomy codes: 10%
 */
export declare function scoreAudienceSizingCompleteness(response: string, currentStep: number): AudienceSizingResult;
export default scoreAudienceSizingCompleteness;
//# sourceMappingURL=audience-sizing-completeness.d.ts.map