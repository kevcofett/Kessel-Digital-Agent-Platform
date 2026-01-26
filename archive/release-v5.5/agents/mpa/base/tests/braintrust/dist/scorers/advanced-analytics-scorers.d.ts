/**
 * Advanced Analytics Scorers
 *
 * Scoring functions for validating agent's analytical capabilities:
 * - RFM calculation and scoring methodology
 * - Propensity model explanations
 * - Decile analysis and investment cutoff recommendations
 * - Lookalike audience quality
 * - Name flow (customer journey) mapping
 */
import { TurnScore } from "../mpa-multi-turn-types.js";
/**
 * Scores whether agent shows actual RFM calculation methodology
 */
export declare function scoreRfmCalculationMethodology(response: string): TurnScore;
/**
 * Scores whether agent shows specific RFM segment sizes and values
 */
export declare function scoreRfmSegmentQuantification(response: string): TurnScore;
/**
 * Scores whether agent explains propensity model concepts
 */
export declare function scorePropensityModelExplanation(response: string): TurnScore;
/**
 * Scores propensity-to-action mapping quality
 */
export declare function scorePropensityActionMapping(response: string): TurnScore;
/**
 * Scores whether agent explains decile-based segmentation
 */
export declare function scoreDecileAnalysisExplanation(response: string): TurnScore;
/**
 * Scores investment cutoff recommendation quality
 */
export declare function scoreInvestmentCutoffRecommendation(response: string): TurnScore;
/**
 * Scores lookalike seed audience quality discussion
 */
export declare function scoreLookalikeSeedQuality(response: string): TurnScore;
/**
 * Scores lookalike expansion strategy
 */
export declare function scoreLookalikeExpansionStrategy(response: string): TurnScore;
/**
 * Scores customer journey/name flow mapping quality
 */
export declare function scoreNameFlowMapping(response: string): TurnScore;
/**
 * Scores whether agent shows profitability-based media planning
 */
export declare function scoreProfitabilityBasedPlanning(response: string): TurnScore;
/**
 * Comprehensive scorer for all advanced analytics capabilities
 */
export declare function scoreAdvancedAnalytics(response: string): TurnScore;
export declare const ADVANCED_ANALYTICS_SCORERS: {
    scoreRfmCalculationMethodology: typeof scoreRfmCalculationMethodology;
    scoreRfmSegmentQuantification: typeof scoreRfmSegmentQuantification;
    scorePropensityModelExplanation: typeof scorePropensityModelExplanation;
    scorePropensityActionMapping: typeof scorePropensityActionMapping;
    scoreDecileAnalysisExplanation: typeof scoreDecileAnalysisExplanation;
    scoreInvestmentCutoffRecommendation: typeof scoreInvestmentCutoffRecommendation;
    scoreLookalikeSeedQuality: typeof scoreLookalikeSeedQuality;
    scoreLookalikeExpansionStrategy: typeof scoreLookalikeExpansionStrategy;
    scoreNameFlowMapping: typeof scoreNameFlowMapping;
    scoreProfitabilityBasedPlanning: typeof scoreProfitabilityBasedPlanning;
    scoreAdvancedAnalytics: typeof scoreAdvancedAnalytics;
};
export default ADVANCED_ANALYTICS_SCORERS;
//# sourceMappingURL=advanced-analytics-scorers.d.ts.map