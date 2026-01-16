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
import { SCORER_WEIGHTS, } from "../mpa-multi-turn-types.js";
// =============================================================================
// SCORER_SPECIFICATION_v2: NEW SCORERS
// =============================================================================
// LLM Judge Infrastructure
export { callLLMJudge, JUDGE_PROMPTS } from "./llm-judge.js";
// Tier 1: Core Quality Scorers (65%)
export { scoreProactiveCalculation } from "./proactive-calculation.js";
export { scoreTeachingBehavior } from "./teaching-behavior.js";
export { scoreFeasibilityFraming } from "./feasibility-framing.js";
export { scoreSourceCitation as scoreSourceCitationV2 } from "./source-citation.js";
export { scoreRecalculationOnChange } from "./recalculation-on-change.js";
// Tier 3: Advanced Quality Scorers (15%)
export { scoreAudienceSizingCompleteness } from "./audience-sizing-completeness.js";
export { scoreCrossStepSynthesis } from "./cross-step-synthesis.js";
// =============================================================================
// V6.0 SCORERS (SCORER_SPECIFICATION_v3)
// =============================================================================
// Tier 3: v6.0 Specific Scorers
export { scoreBenchmarkVerticalCoverage, scoreWebSearchTrigger, scoreKbRoutingValidation, scoreConfidenceLevelAttribution, normalizeVertical, isVerticalSupported, detectIntent, SUPPORTED_VERTICALS, SUPPORTED_CHANNELS, } from "./v6-scorers.js";
// Benchmark Data Loader v6.0
export { loadBenchmarks, getBenchmark, getBenchmarksByVertical, getBenchmarksByChannel, formatBenchmarkRange, validateBenchmarkClaim, getBenchmarkSummary, clearBenchmarkCache, } from "./benchmark-loader.js";
// =============================================================================
// TURN SCORERS (Tier 2 Compliance + Legacy)
// =============================================================================
// Re-export turn scorers
export { scoreResponseLength, scoreSingleQuestion, scoreStepBoundary, scoreSourceCitation, scoreAcronymDefinition, scoreIdkProtocol, scoreAdaptiveSophistication, scoreRiskOpportunityFlagging, scoreResponseFormatting, scoreTurn, } from "./turn-scorers.js";
// =============================================================================
// CONVERSATION SCORERS
// =============================================================================
// Re-export conversation scorers
export { calculateFailurePenalty, scoreStepTransitionQuality, scoreOverallCoherence, scoreConversation, } from "./conversation-scorers.js";
// =============================================================================
// LEGACY SCORERS (for backward compatibility)
// =============================================================================
// Re-export mentorship scorers (legacy)
export { scoreTeachingBehavior as scoreTeachingBehaviorLegacy, scoreProactiveCalculation as scoreProactiveCalculationLegacy, scoreBenchmarkCitation, scoreCriticalThinking, scoreStrategicSynthesis, calculateMentorshipScore, scoreMentorship, } from "./mentorship-scorers.js";
// Re-export step quality scorers
export { getStepRequirements, scoreStepQuality, scoreStepDataCompleteness, scoreStepTurnEfficiency, scoreStepSynthesis, calculateStepQualityScore, scoreStepTransitionQuality as scoreStepTransitionQualityPhase1, } from "./step-quality-scorers.js";
// Re-export plan coherence scorers
export { scoreMathematicalConsistency, scoreStrategicCoherence, scoreDefensibility, scorePlanComprehensiveness, scoreEfficiencyRealism, calculatePlanCoherenceScore, scorePlanCoherence, } from "./plan-coherence-scorers.js";
// =============================================================================
// PHASE 2: DATA QUALITY & RELIABILITY SCORERS
// =============================================================================
// Re-export data quality scorers
export { DataSourcePriority, scoreDataSourceAttribution, scoreEstimateLabeling, scoreValidationRecommendation, scoreDataHierarchyAdherence, calculateDataQualityScore, } from "./data-quality-scorers.js";
// Re-export graceful degradation scorers
export { FailureType, scoreFailureAcknowledgment, scoreFallbackBehavior, scoreFollowUpRecommendation, scoreForwardProgress, scoreGracefulDegradation, calculateGracefulDegradationScore, } from "./graceful-degradation-scorers.js";
// Re-export citation scorers
export { CitationType, scoreCitationPresence, scoreCitationAccuracy, scoreCitationConsistency, scoreConfidenceLevel, scoreCitationQuality, calculateCitationScore, } from "./citation-scorers.js";
// =============================================================================
// QUALITY CATEGORY WEIGHTS
// =============================================================================
/**
 * Category weights for quality-focused composite scoring
 *
 * Phase 1: Core quality (mentorship, step quality, plan coherence)
 * Phase 2: Data quality & reliability (data hierarchy, citation, graceful degradation)
 * Phase 3: Context adaptation (budget scaling, funnel, recalculation)
 * Phase 4: Advanced synthesis (cross-step, proactive, sophistication)
 */
export const QUALITY_CATEGORY_WEIGHTS = {
    // Phase 1: Core Quality (55% total)
    mentorship: 0.18, // Teaching, calculation, benchmark citation
    stepQuality: 0.12, // Per-step depth
    planCoherence: 0.15, // End-to-end consistency
    // Phase 2: Data Quality & Reliability (20% total)
    dataQuality: 0.08, // Data hierarchy adherence
    citationAccuracy: 0.07, // Proper attribution
    gracefulDegradation: 0.05, // Handling failures
    // Phase 3: Context Adaptation (15% total)
    contextAdaptive: 0.08, // Budget/funnel/aggressiveness scaling
    recalculation: 0.07, // Updates on new data
    // Phase 4: Advanced (10% total)
    crossStepSynthesis: 0.05, // Connects insights
    proactiveSuggestion: 0.03, // Unsolicited recommendations
    sophisticationDepth: 0.02, // Matches user level
};
/**
 * Quality thresholds for pass/fail determination
 */
export const QUALITY_THRESHOLDS = {
    excellent: 0.90, // Exceptional guidance quality
    good: 0.80, // Solid professional quality
    pass: 0.70, // Minimum acceptable
    fail: 0.70, // Below this is unacceptable
};
/**
 * Calculate quality-focused composite score
 *
 * Supports all phases of quality scoring with automatic weighting
 */
export function calculateQualityCompositeScore(categoryScores) {
    let weightedSum = 0;
    let totalWeight = 0;
    // All categories that can be scored
    const allCategories = Object.keys(QUALITY_CATEGORY_WEIGHTS);
    for (const category of allCategories) {
        const score = categoryScores[category];
        const weight = QUALITY_CATEGORY_WEIGHTS[category];
        if (score !== undefined && weight !== undefined) {
            weightedSum += score * weight;
            totalWeight += weight;
        }
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
/**
 * Calculate Phase 1 only composite score (for backward compatibility)
 */
export function calculatePhase1CompositeScore(categoryScores) {
    const phase1Categories = ["mentorship", "stepQuality", "planCoherence"];
    let weightedSum = 0;
    let totalWeight = 0;
    for (const category of phase1Categories) {
        const score = categoryScores[category];
        const weight = QUALITY_CATEGORY_WEIGHTS[category];
        if (score !== undefined && weight !== undefined) {
            weightedSum += score * weight;
            totalWeight += weight;
        }
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
/**
 * Calculate turn score aggregates
 */
export function calculateTurnAggregates(turns) {
    const aggregates = {};
    for (const turn of turns) {
        for (const [scorer, scoreData] of Object.entries(turn.turnScores)) {
            if (!aggregates[scorer]) {
                aggregates[scorer] = { scores: [] };
            }
            aggregates[scorer].scores.push(scoreData.score);
        }
    }
    const result = {};
    for (const [scorer, data] of Object.entries(aggregates)) {
        if (data.scores.length === 0)
            continue;
        const sorted = [...data.scores].sort((a, b) => a - b);
        const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
        const median = sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];
        result[scorer] = {
            min: sorted[0],
            max: sorted[sorted.length - 1],
            mean,
            median,
            scores: data.scores,
        };
    }
    return result;
}
/**
 * Calculate weighted composite score
 */
export function calculateCompositeScore(turnAggregates, conversationScores, failures) {
    let weightedSum = 0;
    let totalWeight = 0;
    // Add per-turn scores (using mean from aggregates)
    for (const [scorer, weight] of Object.entries(SCORER_WEIGHTS)) {
        if (turnAggregates[scorer]) {
            weightedSum += turnAggregates[scorer].mean * weight;
            totalWeight += weight;
        }
        else if (conversationScores[scorer]) {
            weightedSum += conversationScores[scorer].score * weight;
            totalWeight += weight;
        }
    }
    // Get failure penalty
    const failurePenalty = conversationScores["failure-penalty"]?.score ?? 1.0;
    // Calculate base score
    const baseScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    // Apply failure penalty
    return baseScore * failurePenalty;
}
/**
 * Evaluate success based on criteria
 */
export function evaluateSuccess(compositeScore, completedSteps, failures, criteria) {
    const reasons = [];
    let passed = true;
    // Check minimum score
    if (compositeScore < criteria.minimumOverallScore) {
        passed = false;
        reasons.push(`Score ${(compositeScore * 100).toFixed(1)}% below threshold ${(criteria.minimumOverallScore * 100).toFixed(1)}%`);
    }
    // Check required steps
    const missingSteps = criteria.requiredStepsComplete.filter((step) => !completedSteps.includes(step));
    if (missingSteps.length > 0) {
        passed = false;
        reasons.push(`Missing required steps: ${missingSteps.join(", ")}`);
    }
    // Check critical failures
    if (criteria.noCriticalFailures && failures.critical.length > 0) {
        passed = false;
        reasons.push(`Critical failures: ${failures.critical.map((f) => f.id).join(", ")}`);
    }
    if (passed) {
        reasons.push("All success criteria met");
    }
    return { passed, reasons };
}
/**
 * Format score report
 */
export function formatScoreReport(turnAggregates, conversationScores, compositeScore, passed) {
    const lines = [
        "## Score Report",
        "",
        `**Composite Score:** ${(compositeScore * 100).toFixed(1)}%`,
        `**Status:** ${passed ? "PASSED" : "FAILED"}`,
        "",
        "### Per-Turn Scores (Mean)",
        "",
        "| Scorer | Mean | Min | Max |",
        "|--------|------|-----|-----|",
    ];
    for (const [scorer, data] of Object.entries(turnAggregates)) {
        lines.push(`| ${scorer} | ${(data.mean * 100).toFixed(1)}% | ${(data.min * 100).toFixed(1)}% | ${(data.max * 100).toFixed(1)}% |`);
    }
    lines.push("");
    lines.push("### Conversation-Level Scores");
    lines.push("");
    lines.push("| Scorer | Score |");
    lines.push("|--------|-------|");
    for (const [scorer, data] of Object.entries(conversationScores)) {
        lines.push(`| ${scorer} | ${(data.score * 100).toFixed(1)}% |`);
    }
    return lines.join("\n");
}
//# sourceMappingURL=index.js.map