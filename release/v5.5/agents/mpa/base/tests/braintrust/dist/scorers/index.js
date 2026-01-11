"use strict";
/**
 * Scorers Index - Exports and Composite Score Calculation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreValidationRecommendation = exports.scoreEstimateLabeling = exports.scoreDataSourceAttribution = exports.DataSourcePriority = exports.scorePlanCoherence = exports.calculatePlanCoherenceScore = exports.scoreEfficiencyRealism = exports.scorePlanComprehensiveness = exports.scoreDefensibility = exports.scoreStrategicCoherence = exports.scoreMathematicalConsistency = exports.scoreStepTransitionQualityPhase1 = exports.calculateStepQualityScore = exports.scoreStepSynthesis = exports.scoreStepTurnEfficiency = exports.scoreStepDataCompleteness = exports.scoreStepQuality = exports.getStepRequirements = exports.scoreMentorship = exports.calculateMentorshipScore = exports.scoreStrategicSynthesis = exports.scoreCriticalThinking = exports.scoreBenchmarkCitation = exports.scoreProactiveCalculation = exports.scoreTeachingBehavior = exports.scoreConversation = exports.scoreOverallCoherence = exports.scoreStepTransitionQuality = exports.calculateFailurePenalty = exports.scoreLoopDetection = exports.scoreGreetingUniqueness = exports.scoreContextRetention = exports.scoreConversationEfficiency = exports.scoreStepCompletionRate = exports.scoreTurn = exports.scoreResponseFormatting = exports.scorePrecisionConnection = exports.scoreAudienceSizing = exports.scoreAudienceCompleteness = exports.scoreCalculationPresence = exports.scoreRiskOpportunityFlagging = exports.scoreProgressOverPerfection = exports.scoreProactiveIntelligence = exports.scoreAdaptiveSophistication = exports.scoreIdkProtocol = exports.scoreAcronymDefinition = exports.scoreSourceCitation = exports.scoreStepBoundary = exports.scoreSingleQuestion = exports.scoreResponseLength = void 0;
exports.QUALITY_THRESHOLDS = exports.QUALITY_CATEGORY_WEIGHTS = exports.calculateCitationScore = exports.scoreCitationQuality = exports.scoreConfidenceLevel = exports.scoreCitationConsistency = exports.scoreCitationAccuracy = exports.scoreCitationPresence = exports.CitationType = exports.calculateGracefulDegradationScore = exports.scoreGracefulDegradation = exports.scoreForwardProgress = exports.scoreFollowUpRecommendation = exports.scoreFallbackBehavior = exports.scoreFailureAcknowledgment = exports.FailureType = exports.calculateDataQualityScore = exports.scoreDataHierarchyAdherence = void 0;
exports.calculateQualityCompositeScore = calculateQualityCompositeScore;
exports.calculatePhase1CompositeScore = calculatePhase1CompositeScore;
exports.calculateTurnAggregates = calculateTurnAggregates;
exports.calculateCompositeScore = calculateCompositeScore;
exports.evaluateSuccess = evaluateSuccess;
exports.formatScoreReport = formatScoreReport;
const mpa_multi_turn_types_js_1 = require("../mpa-multi-turn-types.js");
// Re-export turn scorers
var turn_scorers_js_1 = require("./turn-scorers.js");
Object.defineProperty(exports, "scoreResponseLength", { enumerable: true, get: function () { return turn_scorers_js_1.scoreResponseLength; } });
Object.defineProperty(exports, "scoreSingleQuestion", { enumerable: true, get: function () { return turn_scorers_js_1.scoreSingleQuestion; } });
Object.defineProperty(exports, "scoreStepBoundary", { enumerable: true, get: function () { return turn_scorers_js_1.scoreStepBoundary; } });
Object.defineProperty(exports, "scoreSourceCitation", { enumerable: true, get: function () { return turn_scorers_js_1.scoreSourceCitation; } });
Object.defineProperty(exports, "scoreAcronymDefinition", { enumerable: true, get: function () { return turn_scorers_js_1.scoreAcronymDefinition; } });
Object.defineProperty(exports, "scoreIdkProtocol", { enumerable: true, get: function () { return turn_scorers_js_1.scoreIdkProtocol; } });
Object.defineProperty(exports, "scoreAdaptiveSophistication", { enumerable: true, get: function () { return turn_scorers_js_1.scoreAdaptiveSophistication; } });
Object.defineProperty(exports, "scoreProactiveIntelligence", { enumerable: true, get: function () { return turn_scorers_js_1.scoreProactiveIntelligence; } });
Object.defineProperty(exports, "scoreProgressOverPerfection", { enumerable: true, get: function () { return turn_scorers_js_1.scoreProgressOverPerfection; } });
Object.defineProperty(exports, "scoreRiskOpportunityFlagging", { enumerable: true, get: function () { return turn_scorers_js_1.scoreRiskOpportunityFlagging; } });
Object.defineProperty(exports, "scoreCalculationPresence", { enumerable: true, get: function () { return turn_scorers_js_1.scoreCalculationPresence; } });
Object.defineProperty(exports, "scoreAudienceCompleteness", { enumerable: true, get: function () { return turn_scorers_js_1.scoreAudienceCompleteness; } });
Object.defineProperty(exports, "scoreAudienceSizing", { enumerable: true, get: function () { return turn_scorers_js_1.scoreAudienceSizing; } });
Object.defineProperty(exports, "scorePrecisionConnection", { enumerable: true, get: function () { return turn_scorers_js_1.scorePrecisionConnection; } });
Object.defineProperty(exports, "scoreResponseFormatting", { enumerable: true, get: function () { return turn_scorers_js_1.scoreResponseFormatting; } });
Object.defineProperty(exports, "scoreTurn", { enumerable: true, get: function () { return turn_scorers_js_1.scoreTurn; } });
// Re-export conversation scorers
var conversation_scorers_js_1 = require("./conversation-scorers.js");
Object.defineProperty(exports, "scoreStepCompletionRate", { enumerable: true, get: function () { return conversation_scorers_js_1.scoreStepCompletionRate; } });
Object.defineProperty(exports, "scoreConversationEfficiency", { enumerable: true, get: function () { return conversation_scorers_js_1.scoreConversationEfficiency; } });
Object.defineProperty(exports, "scoreContextRetention", { enumerable: true, get: function () { return conversation_scorers_js_1.scoreContextRetention; } });
Object.defineProperty(exports, "scoreGreetingUniqueness", { enumerable: true, get: function () { return conversation_scorers_js_1.scoreGreetingUniqueness; } });
Object.defineProperty(exports, "scoreLoopDetection", { enumerable: true, get: function () { return conversation_scorers_js_1.scoreLoopDetection; } });
Object.defineProperty(exports, "calculateFailurePenalty", { enumerable: true, get: function () { return conversation_scorers_js_1.calculateFailurePenalty; } });
Object.defineProperty(exports, "scoreStepTransitionQuality", { enumerable: true, get: function () { return conversation_scorers_js_1.scoreStepTransitionQuality; } });
Object.defineProperty(exports, "scoreOverallCoherence", { enumerable: true, get: function () { return conversation_scorers_js_1.scoreOverallCoherence; } });
Object.defineProperty(exports, "scoreConversation", { enumerable: true, get: function () { return conversation_scorers_js_1.scoreConversation; } });
// =============================================================================
// PHASE 1: QUALITY-FOCUSED SCORERS
// =============================================================================
// Re-export mentorship scorers
var mentorship_scorers_js_1 = require("./mentorship-scorers.js");
Object.defineProperty(exports, "scoreTeachingBehavior", { enumerable: true, get: function () { return mentorship_scorers_js_1.scoreTeachingBehavior; } });
Object.defineProperty(exports, "scoreProactiveCalculation", { enumerable: true, get: function () { return mentorship_scorers_js_1.scoreProactiveCalculation; } });
Object.defineProperty(exports, "scoreBenchmarkCitation", { enumerable: true, get: function () { return mentorship_scorers_js_1.scoreBenchmarkCitation; } });
Object.defineProperty(exports, "scoreCriticalThinking", { enumerable: true, get: function () { return mentorship_scorers_js_1.scoreCriticalThinking; } });
Object.defineProperty(exports, "scoreStrategicSynthesis", { enumerable: true, get: function () { return mentorship_scorers_js_1.scoreStrategicSynthesis; } });
Object.defineProperty(exports, "calculateMentorshipScore", { enumerable: true, get: function () { return mentorship_scorers_js_1.calculateMentorshipScore; } });
Object.defineProperty(exports, "scoreMentorship", { enumerable: true, get: function () { return mentorship_scorers_js_1.scoreMentorship; } });
// Re-export step quality scorers
var step_quality_scorers_js_1 = require("./step-quality-scorers.js");
Object.defineProperty(exports, "getStepRequirements", { enumerable: true, get: function () { return step_quality_scorers_js_1.getStepRequirements; } });
Object.defineProperty(exports, "scoreStepQuality", { enumerable: true, get: function () { return step_quality_scorers_js_1.scoreStepQuality; } });
Object.defineProperty(exports, "scoreStepDataCompleteness", { enumerable: true, get: function () { return step_quality_scorers_js_1.scoreStepDataCompleteness; } });
Object.defineProperty(exports, "scoreStepTurnEfficiency", { enumerable: true, get: function () { return step_quality_scorers_js_1.scoreStepTurnEfficiency; } });
Object.defineProperty(exports, "scoreStepSynthesis", { enumerable: true, get: function () { return step_quality_scorers_js_1.scoreStepSynthesis; } });
Object.defineProperty(exports, "calculateStepQualityScore", { enumerable: true, get: function () { return step_quality_scorers_js_1.calculateStepQualityScore; } });
Object.defineProperty(exports, "scoreStepTransitionQualityPhase1", { enumerable: true, get: function () { return step_quality_scorers_js_1.scoreStepTransitionQuality; } });
// Re-export plan coherence scorers
var plan_coherence_scorers_js_1 = require("./plan-coherence-scorers.js");
Object.defineProperty(exports, "scoreMathematicalConsistency", { enumerable: true, get: function () { return plan_coherence_scorers_js_1.scoreMathematicalConsistency; } });
Object.defineProperty(exports, "scoreStrategicCoherence", { enumerable: true, get: function () { return plan_coherence_scorers_js_1.scoreStrategicCoherence; } });
Object.defineProperty(exports, "scoreDefensibility", { enumerable: true, get: function () { return plan_coherence_scorers_js_1.scoreDefensibility; } });
Object.defineProperty(exports, "scorePlanComprehensiveness", { enumerable: true, get: function () { return plan_coherence_scorers_js_1.scorePlanComprehensiveness; } });
Object.defineProperty(exports, "scoreEfficiencyRealism", { enumerable: true, get: function () { return plan_coherence_scorers_js_1.scoreEfficiencyRealism; } });
Object.defineProperty(exports, "calculatePlanCoherenceScore", { enumerable: true, get: function () { return plan_coherence_scorers_js_1.calculatePlanCoherenceScore; } });
Object.defineProperty(exports, "scorePlanCoherence", { enumerable: true, get: function () { return plan_coherence_scorers_js_1.scorePlanCoherence; } });
// =============================================================================
// PHASE 2: DATA QUALITY & RELIABILITY SCORERS
// =============================================================================
// Re-export data quality scorers
var data_quality_scorers_js_1 = require("./data-quality-scorers.js");
Object.defineProperty(exports, "DataSourcePriority", { enumerable: true, get: function () { return data_quality_scorers_js_1.DataSourcePriority; } });
Object.defineProperty(exports, "scoreDataSourceAttribution", { enumerable: true, get: function () { return data_quality_scorers_js_1.scoreDataSourceAttribution; } });
Object.defineProperty(exports, "scoreEstimateLabeling", { enumerable: true, get: function () { return data_quality_scorers_js_1.scoreEstimateLabeling; } });
Object.defineProperty(exports, "scoreValidationRecommendation", { enumerable: true, get: function () { return data_quality_scorers_js_1.scoreValidationRecommendation; } });
Object.defineProperty(exports, "scoreDataHierarchyAdherence", { enumerable: true, get: function () { return data_quality_scorers_js_1.scoreDataHierarchyAdherence; } });
Object.defineProperty(exports, "calculateDataQualityScore", { enumerable: true, get: function () { return data_quality_scorers_js_1.calculateDataQualityScore; } });
// Re-export graceful degradation scorers
var graceful_degradation_scorers_js_1 = require("./graceful-degradation-scorers.js");
Object.defineProperty(exports, "FailureType", { enumerable: true, get: function () { return graceful_degradation_scorers_js_1.FailureType; } });
Object.defineProperty(exports, "scoreFailureAcknowledgment", { enumerable: true, get: function () { return graceful_degradation_scorers_js_1.scoreFailureAcknowledgment; } });
Object.defineProperty(exports, "scoreFallbackBehavior", { enumerable: true, get: function () { return graceful_degradation_scorers_js_1.scoreFallbackBehavior; } });
Object.defineProperty(exports, "scoreFollowUpRecommendation", { enumerable: true, get: function () { return graceful_degradation_scorers_js_1.scoreFollowUpRecommendation; } });
Object.defineProperty(exports, "scoreForwardProgress", { enumerable: true, get: function () { return graceful_degradation_scorers_js_1.scoreForwardProgress; } });
Object.defineProperty(exports, "scoreGracefulDegradation", { enumerable: true, get: function () { return graceful_degradation_scorers_js_1.scoreGracefulDegradation; } });
Object.defineProperty(exports, "calculateGracefulDegradationScore", { enumerable: true, get: function () { return graceful_degradation_scorers_js_1.calculateGracefulDegradationScore; } });
// Re-export citation scorers
var citation_scorers_js_1 = require("./citation-scorers.js");
Object.defineProperty(exports, "CitationType", { enumerable: true, get: function () { return citation_scorers_js_1.CitationType; } });
Object.defineProperty(exports, "scoreCitationPresence", { enumerable: true, get: function () { return citation_scorers_js_1.scoreCitationPresence; } });
Object.defineProperty(exports, "scoreCitationAccuracy", { enumerable: true, get: function () { return citation_scorers_js_1.scoreCitationAccuracy; } });
Object.defineProperty(exports, "scoreCitationConsistency", { enumerable: true, get: function () { return citation_scorers_js_1.scoreCitationConsistency; } });
Object.defineProperty(exports, "scoreConfidenceLevel", { enumerable: true, get: function () { return citation_scorers_js_1.scoreConfidenceLevel; } });
Object.defineProperty(exports, "scoreCitationQuality", { enumerable: true, get: function () { return citation_scorers_js_1.scoreCitationQuality; } });
Object.defineProperty(exports, "calculateCitationScore", { enumerable: true, get: function () { return citation_scorers_js_1.calculateCitationScore; } });
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
exports.QUALITY_CATEGORY_WEIGHTS = {
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
exports.QUALITY_THRESHOLDS = {
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
function calculateQualityCompositeScore(categoryScores) {
    let weightedSum = 0;
    let totalWeight = 0;
    // All categories that can be scored
    const allCategories = Object.keys(exports.QUALITY_CATEGORY_WEIGHTS);
    for (const category of allCategories) {
        const score = categoryScores[category];
        const weight = exports.QUALITY_CATEGORY_WEIGHTS[category];
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
function calculatePhase1CompositeScore(categoryScores) {
    const phase1Categories = ["mentorship", "stepQuality", "planCoherence"];
    let weightedSum = 0;
    let totalWeight = 0;
    for (const category of phase1Categories) {
        const score = categoryScores[category];
        const weight = exports.QUALITY_CATEGORY_WEIGHTS[category];
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
function calculateTurnAggregates(turns) {
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
function calculateCompositeScore(turnAggregates, conversationScores, failures) {
    let weightedSum = 0;
    let totalWeight = 0;
    // Add per-turn scores (using mean from aggregates)
    for (const [scorer, weight] of Object.entries(mpa_multi_turn_types_js_1.SCORER_WEIGHTS)) {
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
function evaluateSuccess(compositeScore, completedSteps, failures, criteria) {
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
function formatScoreReport(turnAggregates, conversationScores, compositeScore, passed) {
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