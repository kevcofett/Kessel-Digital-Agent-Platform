/**
 * V6.1 Specific Scorers
 *
 * New scorers for MPA v6.1 outcome-focused capabilities:
 * - automatic-benchmark-comparison: Validates proactive target comparison to KB benchmarks
 * - data-confidence: Validates source reliability indication
 * - platform-taxonomy-usage: Validates reference to Google/Meta/LinkedIn segments
 * - geography-census-usage: Validates use of DMA/census data for audience sizing
 * - behavioral-attribute-usage: Validates reference to behavioral targeting signals
 *
 * SCORER_SPECIFICATION: v3.1
 */
import { TurnScore } from "../mpa-multi-turn-types.js";
/**
 * Score automatic benchmark comparison
 *
 * Validates that when user provides a target, agent automatically
 * compares it to KB benchmark data without being asked.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export declare function scoreAutomaticBenchmarkComparison(output: string, input: string): TurnScore;
/**
 * Score data confidence indication
 *
 * Validates that agent indicates reliability of data sources so
 * users know what to trust vs validate.
 *
 * @param output - Agent response
 * @returns TurnScore
 */
export declare function scoreDataConfidence(output: string): TurnScore;
/**
 * Score platform taxonomy usage
 *
 * Validates that agent references platform-specific targeting options
 * when discussing audience strategy (Steps 3+).
 *
 * @param output - Agent response
 * @param input - User input
 * @param currentStep - Current workflow step
 * @returns TurnScore
 */
export declare function scorePlatformTaxonomyUsage(output: string, input: string, currentStep: number): TurnScore;
/**
 * Score geography/census data usage
 *
 * Validates that agent uses census/DMA data when discussing
 * geographic targeting and audience sizing.
 *
 * @param output - Agent response
 * @param input - User input
 * @param currentStep - Current workflow step
 * @returns TurnScore
 */
export declare function scoreGeographyCensusUsage(output: string, input: string, currentStep: number): TurnScore;
/**
 * Score behavioral/contextual attribute usage
 *
 * Validates that agent references behavioral and contextual
 * targeting attributes when building audience strategy.
 *
 * @param output - Agent response
 * @param input - User input
 * @param currentStep - Current workflow step
 * @returns TurnScore
 */
export declare function scoreBehavioralContextualUsage(output: string, input: string, currentStep: number): TurnScore;
export declare const v61Scorers: {
    scoreAutomaticBenchmarkComparison: typeof scoreAutomaticBenchmarkComparison;
    scoreDataConfidence: typeof scoreDataConfidence;
    scorePlatformTaxonomyUsage: typeof scorePlatformTaxonomyUsage;
    scoreGeographyCensusUsage: typeof scoreGeographyCensusUsage;
    scoreBehavioralContextualUsage: typeof scoreBehavioralContextualUsage;
};
export default v61Scorers;
//# sourceMappingURL=v61-scorers.d.ts.map