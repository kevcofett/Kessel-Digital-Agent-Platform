/**
 * Plan Coherence Scorers for Quality-Focused MPA Evaluation
 *
 * Phase 1 Scorers: End-to-end plan quality evaluation.
 * Evaluates mathematical consistency, strategic coherence, and defensibility.
 */
import { TurnScore } from "../mpa-multi-turn-types.js";
export interface MediaPlan {
    objective?: string;
    primaryKPI?: string;
    volumeTarget?: number;
    volumeUnit?: string;
    totalBudget?: number;
    impliedCAC?: number;
    targetLTV?: number;
    margin?: number;
    efficiencyAssessment?: string;
    audienceProfile?: {
        demographics?: string;
        behaviors?: string;
        firstPartyData?: string;
    };
    audienceSize?: number;
    geoScope?: "national" | "regional" | "local";
    geoAllocations?: Record<string, number>;
    strongMarkets?: string[];
    weakMarkets?: string[];
    channelAllocations?: Record<string, number>;
    testBudget?: number;
    monthlySpend?: number[];
    pacing?: string;
    valueProp?: string;
    differentiators?: string[];
    creativeApproach?: string;
    channelMix?: Record<string, number>;
    platformStrategies?: Record<string, string>;
    attributionModel?: string;
    trackingRequirements?: string[];
    measurementLimitations?: string[];
    testPlan?: string[];
    testBudgetAllocated?: number;
    learningAgenda?: string;
    risks?: string[];
    mitigations?: string[];
    contingencies?: string[];
}
export interface IndustryBenchmarks {
    medianCAC: number;
    cacRange: {
        min: number;
        max: number;
    };
    typicalChannelMix: Record<string, {
        min: number;
        max: number;
    }>;
    typicalConversionRates: Record<string, number>;
}
/**
 * Score mathematical consistency (Rule-based)
 *
 * Validates that all numbers in the plan add up correctly.
 */
export declare function scoreMathematicalConsistency(plan: MediaPlan): TurnScore;
/**
 * Score strategic coherence (LLM-as-judge)
 *
 * Evaluates whether all plan elements reinforce each other.
 */
export declare function scoreStrategicCoherence(plan: MediaPlan): Promise<TurnScore>;
/**
 * Score plan defensibility (LLM-as-judge)
 *
 * Evaluates whether the plan would survive client scrutiny.
 */
export declare function scoreDefensibility(plan: MediaPlan, benchmarks?: IndustryBenchmarks): Promise<TurnScore>;
/**
 * Score plan comprehensiveness (Rule-based)
 *
 * Checks if all major plan elements are present.
 */
export declare function scorePlanComprehensiveness(plan: MediaPlan): TurnScore;
/**
 * Score efficiency realism (Rule-based)
 *
 * Checks if efficiency targets are realistic vs. benchmarks.
 */
export declare function scoreEfficiencyRealism(plan: MediaPlan, benchmarks?: IndustryBenchmarks): TurnScore;
/**
 * Calculate overall plan coherence score
 */
export declare function calculatePlanCoherenceScore(scores: Record<string, TurnScore>): {
    overallScore: number;
    mathematicalConsistency: number;
    strategicCoherence: number;
    defensibility: number;
};
/**
 * Score all plan coherence dimensions
 */
export declare function scorePlanCoherence(plan: MediaPlan, benchmarks?: IndustryBenchmarks): Promise<Record<string, TurnScore>>;
export default scorePlanCoherence;
//# sourceMappingURL=plan-coherence-scorers.d.ts.map