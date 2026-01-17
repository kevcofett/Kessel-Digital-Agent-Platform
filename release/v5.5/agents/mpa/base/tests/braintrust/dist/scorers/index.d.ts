/**
 * Scorers Index - Exports and Composite Score Calculation
 *
 * SCORER_SPECIFICATION_v3: 16 scorers with three-tier weighting
 * - Tier 1: Core Quality (65%)
 * - Tier 2: Structural Compliance (20%)
 * - Tier 3: Advanced Quality (15%)
 *
 * v3.0 Updates:
 * - Added benchmark-vertical-coverage (2%)
 * - Added web-search-trigger (2%)
 * - Updated source-citation for v6.0 KB patterns
 */
import { TurnScore, FailureCondition } from "../mpa-multi-turn-types.js";
export { callLLMJudge, JUDGE_PROMPTS, type JudgeResult, type JudgePromptContext } from "./llm-judge.js";
export { scoreProactiveCalculation, type ProactiveCalculationContext } from "./proactive-calculation.js";
export { scoreTeachingBehavior, type TeachingBehaviorContext } from "./teaching-behavior.js";
export { scoreFeasibilityFraming, type FeasibilityFramingContext } from "./feasibility-framing.js";
export { scoreSourceCitation as scoreSourceCitationV2, type SourceCitationResult } from "./source-citation.js";
export { scoreRecalculationOnChange, type RecalculationContext } from "./recalculation-on-change.js";
export { scoreAudienceSizingCompleteness, type AudienceSizingResult, type TableAnalysis } from "./audience-sizing-completeness.js";
export { scoreCrossStepSynthesis, type CrossStepSynthesisContext } from "./cross-step-synthesis.js";
export { scoreBenchmarkVerticalCoverage, scoreWebSearchTrigger, scoreKbRoutingValidation, scoreConfidenceLevelAttribution, normalizeVertical, isVerticalSupported, detectIntent, SUPPORTED_VERTICALS, SUPPORTED_CHANNELS, type SupportedVertical, } from "./v6-scorers.js";
export { scoreAutomaticBenchmarkComparison, scoreDataConfidence, scorePlatformTaxonomyUsage, scoreGeographyCensusUsage, scoreBehavioralContextualUsage, v61Scorers, } from "./v61-scorers.js";
export { scoreAdisTriggerDetection, scoreRfmRecognition, scoreClvRecognition, scoreAmmoTrigger, scoreAllocationRationale, scoreSegmentPresentation, scoreChannelAffinityRecommendation, scoreJargonAvoidance, scoreResultSimplification, scoreAdisIntegration, ADIS_SCORERS, } from "./adis-scorers.js";
export { scoreRfmSegmentRecognition, scoreReactivationStrategy, scoreRetentionAcquisitionBalance, scoreCohortAnalysisUsage, scoreLookalikeAudienceStrategy, scoreSeasonalPlanning, scoreCustomerLtvApplication, scoreRetentionChannelMix, ecommerceScorers, } from "./ecommerce-scorers.js";
export { loadBenchmarks, getBenchmark, getBenchmarksByVertical, getBenchmarksByChannel, formatBenchmarkRange, validateBenchmarkClaim, getBenchmarkSummary, clearBenchmarkCache, type Benchmark, } from "./benchmark-loader.js";
export { scoreResponseLength, scoreSingleQuestion, scoreStepBoundary, scoreSourceCitation, scoreAcronymDefinition, scoreIdkProtocol, scoreAdaptiveSophistication, scoreRiskOpportunityFlagging, scoreResponseFormatting, scoreTurn, } from "./turn-scorers.js";
export { calculateFailurePenalty, scoreStepTransitionQuality, scoreOverallCoherence, scoreConversation, } from "./conversation-scorers.js";
export { scoreTeachingBehavior as scoreTeachingBehaviorLegacy, scoreProactiveCalculation as scoreProactiveCalculationLegacy, scoreBenchmarkCitation, scoreCriticalThinking, scoreStrategicSynthesis, calculateMentorshipScore, scoreMentorship, } from "./mentorship-scorers.js";
export { type ScenarioContext, type StepRequirements, type StepQualityInput, getStepRequirements, scoreStepQuality, scoreStepDataCompleteness, scoreStepTurnEfficiency, scoreStepSynthesis, calculateStepQualityScore, scoreStepTransitionQuality as scoreStepTransitionQualityPhase1, } from "./step-quality-scorers.js";
export { type MediaPlan, type IndustryBenchmarks, scoreMathematicalConsistency, scoreStrategicCoherence, scoreDefensibility, scorePlanComprehensiveness, scoreEfficiencyRealism, calculatePlanCoherenceScore, scorePlanCoherence, } from "./plan-coherence-scorers.js";
export { DataSourcePriority, scoreDataSourceAttribution, scoreEstimateLabeling, scoreValidationRecommendation, scoreDataHierarchyAdherence, calculateDataQualityScore, } from "./data-quality-scorers.js";
export { FailureType, scoreFailureAcknowledgment, scoreFallbackBehavior, scoreFollowUpRecommendation, scoreForwardProgress, scoreGracefulDegradation, calculateGracefulDegradationScore, } from "./graceful-degradation-scorers.js";
export { CitationType, scoreCitationPresence, scoreCitationAccuracy, scoreCitationConsistency, scoreConfidenceLevel, scoreCitationQuality, calculateCitationScore, } from "./citation-scorers.js";
/**
 * Category weights for quality-focused composite scoring
 *
 * Phase 1: Core quality (mentorship, step quality, plan coherence)
 * Phase 2: Data quality & reliability (data hierarchy, citation, graceful degradation)
 * Phase 3: Context adaptation (budget scaling, funnel, recalculation)
 * Phase 4: Advanced synthesis (cross-step, proactive, sophistication)
 */
export declare const QUALITY_CATEGORY_WEIGHTS: {
    mentorship: number;
    stepQuality: number;
    planCoherence: number;
    dataQuality: number;
    citationAccuracy: number;
    gracefulDegradation: number;
    contextAdaptive: number;
    recalculation: number;
    crossStepSynthesis: number;
    proactiveSuggestion: number;
    sophisticationDepth: number;
};
/**
 * Quality thresholds for pass/fail determination
 */
export declare const QUALITY_THRESHOLDS: {
    excellent: number;
    good: number;
    pass: number;
    fail: number;
};
/**
 * Calculate quality-focused composite score
 *
 * Supports all phases of quality scoring with automatic weighting
 */
export declare function calculateQualityCompositeScore(categoryScores: {
    mentorship?: number;
    stepQuality?: number;
    planCoherence?: number;
    dataQuality?: number;
    citationAccuracy?: number;
    gracefulDegradation?: number;
    contextAdaptive?: number;
    recalculation?: number;
    crossStepSynthesis?: number;
    proactiveSuggestion?: number;
    sophisticationDepth?: number;
}): number;
/**
 * Calculate Phase 1 only composite score (for backward compatibility)
 */
export declare function calculatePhase1CompositeScore(categoryScores: {
    mentorship?: number;
    stepQuality?: number;
    planCoherence?: number;
}): number;
/**
 * Calculate turn score aggregates
 */
export declare function calculateTurnAggregates(turns: Array<{
    turnScores: Record<string, TurnScore>;
}>): Record<string, {
    min: number;
    max: number;
    mean: number;
    median: number;
    scores: number[];
}>;
/**
 * Calculate weighted composite score
 */
export declare function calculateCompositeScore(turnAggregates: Record<string, {
    mean: number;
}>, conversationScores: Record<string, TurnScore>, failures: {
    warnings: FailureCondition[];
    major: FailureCondition[];
    critical: FailureCondition[];
}): number;
/**
 * Evaluate success based on criteria
 */
export declare function evaluateSuccess(compositeScore: number, completedSteps: number[], failures: {
    warnings: FailureCondition[];
    major: FailureCondition[];
    critical: FailureCondition[];
}, criteria: {
    minimumOverallScore: number;
    requiredStepsComplete?: number[];
    noCriticalFailures: boolean;
}): {
    passed: boolean;
    reasons: string[];
};
/**
 * Format score report
 */
export declare function formatScoreReport(turnAggregates: Record<string, {
    min: number;
    max: number;
    mean: number;
    median: number;
}>, conversationScores: Record<string, TurnScore>, compositeScore: number, passed: boolean): string;
//# sourceMappingURL=index.d.ts.map