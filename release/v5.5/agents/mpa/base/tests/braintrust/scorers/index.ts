/**
 * Scorers Index - Exports and Composite Score Calculation
 */

import {
  TurnScore,
  FailureCondition,
  SCORER_WEIGHTS,
} from "../mpa-multi-turn-types.js";

// Re-export turn scorers
export {
  scoreResponseLength,
  scoreSingleQuestion,
  scoreStepBoundary,
  scoreSourceCitation,
  scoreAcronymDefinition,
  scoreIdkProtocol,
  scoreAdaptiveSophistication,
  scoreProactiveIntelligence,
  scoreProgressOverPerfection,
  scoreRiskOpportunityFlagging,
  scoreCalculationPresence,
  scoreTurn,
} from "./turn-scorers.js";

// Re-export conversation scorers
export {
  scoreStepCompletionRate,
  scoreConversationEfficiency,
  scoreContextRetention,
  scoreGreetingUniqueness,
  scoreLoopDetection,
  calculateFailurePenalty,
  scoreStepTransitionQuality,
  scoreOverallCoherence,
  scoreConversation,
} from "./conversation-scorers.js";

// =============================================================================
// PHASE 1: QUALITY-FOCUSED SCORERS
// =============================================================================

// Re-export mentorship scorers
export {
  scoreTeachingBehavior,
  scoreProactiveCalculation,
  scoreBenchmarkCitation,
  scoreCriticalThinking,
  scoreStrategicSynthesis,
  calculateMentorshipScore,
  scoreMentorship,
} from "./mentorship-scorers.js";

// Re-export step quality scorers
export {
  type ScenarioContext,
  type StepRequirements,
  type StepQualityInput,
  getStepRequirements,
  scoreStepQuality,
  scoreStepDataCompleteness,
  scoreStepTurnEfficiency,
  scoreStepSynthesis,
  calculateStepQualityScore,
  scoreStepTransitionQuality as scoreStepTransitionQualityPhase1,
} from "./step-quality-scorers.js";

// Re-export plan coherence scorers
export {
  type MediaPlan,
  type IndustryBenchmarks,
  scoreMathematicalConsistency,
  scoreStrategicCoherence,
  scoreDefensibility,
  scorePlanComprehensiveness,
  scoreEfficiencyRealism,
  calculatePlanCoherenceScore,
  scorePlanCoherence,
} from "./plan-coherence-scorers.js";

// =============================================================================
// QUALITY CATEGORY WEIGHTS (Phase 1)
// =============================================================================

/**
 * Category weights for quality-focused composite scoring
 */
export const QUALITY_CATEGORY_WEIGHTS = {
  mentorship: 0.20, // Teaching, calculation, citation
  stepQuality: 0.15, // Per-step depth
  planCoherence: 0.20, // End-to-end consistency
  contextAdaptive: 0.15, // Budget/funnel/aggressiveness scaling (Phase 2)
  recalculation: 0.10, // Updates on new data (Phase 2)
  crossStepSynthesis: 0.10, // Connects insights (Phase 3)
  proactiveSuggestion: 0.05, // Unsolicited recommendations (Phase 3)
  sophisticationDepth: 0.05, // Matches user level (Phase 4)
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
 * Calculate quality-focused composite score (Phase 1)
 */
export function calculateQualityCompositeScore(categoryScores: {
  mentorship?: number;
  stepQuality?: number;
  planCoherence?: number;
}): number {
  let weightedSum = 0;
  let totalWeight = 0;

  // Phase 1 categories only
  const phase1Categories = ["mentorship", "stepQuality", "planCoherence"];

  for (const category of phase1Categories) {
    const score = categoryScores[category as keyof typeof categoryScores];
    const weight =
      QUALITY_CATEGORY_WEIGHTS[
        category as keyof typeof QUALITY_CATEGORY_WEIGHTS
      ];

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
export function calculateTurnAggregates(
  turns: Array<{ turnScores: Record<string, TurnScore> }>
): Record<
  string,
  { min: number; max: number; mean: number; median: number; scores: number[] }
> {
  const aggregates: Record<string, { scores: number[] }> = {};

  for (const turn of turns) {
    for (const [scorer, scoreData] of Object.entries(turn.turnScores)) {
      if (!aggregates[scorer]) {
        aggregates[scorer] = { scores: [] };
      }
      aggregates[scorer].scores.push(scoreData.score);
    }
  }

  const result: Record<
    string,
    { min: number; max: number; mean: number; median: number; scores: number[] }
  > = {};

  for (const [scorer, data] of Object.entries(aggregates)) {
    if (data.scores.length === 0) continue;

    const sorted = [...data.scores].sort((a, b) => a - b);
    const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const median =
      sorted.length % 2 === 0
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
export function calculateCompositeScore(
  turnAggregates: Record<string, { mean: number }>,
  conversationScores: Record<string, TurnScore>,
  failures: {
    warnings: FailureCondition[];
    major: FailureCondition[];
    critical: FailureCondition[];
  }
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  // Add per-turn scores (using mean from aggregates)
  for (const [scorer, weight] of Object.entries(SCORER_WEIGHTS)) {
    if (turnAggregates[scorer]) {
      weightedSum += turnAggregates[scorer].mean * weight;
      totalWeight += weight;
    } else if (conversationScores[scorer]) {
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
export function evaluateSuccess(
  compositeScore: number,
  completedSteps: number[],
  failures: {
    warnings: FailureCondition[];
    major: FailureCondition[];
    critical: FailureCondition[];
  },
  criteria: {
    minimumOverallScore: number;
    requiredStepsComplete: number[];
    noCriticalFailures: boolean;
  }
): { passed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let passed = true;

  // Check minimum score
  if (compositeScore < criteria.minimumOverallScore) {
    passed = false;
    reasons.push(
      `Score ${(compositeScore * 100).toFixed(1)}% below threshold ${(criteria.minimumOverallScore * 100).toFixed(1)}%`
    );
  }

  // Check required steps
  const missingSteps = criteria.requiredStepsComplete.filter(
    (step) => !completedSteps.includes(step)
  );
  if (missingSteps.length > 0) {
    passed = false;
    reasons.push(`Missing required steps: ${missingSteps.join(", ")}`);
  }

  // Check critical failures
  if (criteria.noCriticalFailures && failures.critical.length > 0) {
    passed = false;
    reasons.push(
      `Critical failures: ${failures.critical.map((f) => f.id).join(", ")}`
    );
  }

  if (passed) {
    reasons.push("All success criteria met");
  }

  return { passed, reasons };
}

/**
 * Format score report
 */
export function formatScoreReport(
  turnAggregates: Record<
    string,
    { min: number; max: number; mean: number; median: number }
  >,
  conversationScores: Record<string, TurnScore>,
  compositeScore: number,
  passed: boolean
): string {
  const lines: string[] = [
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
    lines.push(
      `| ${scorer} | ${(data.mean * 100).toFixed(1)}% | ${(data.min * 100).toFixed(1)}% | ${(data.max * 100).toFixed(1)}% |`
    );
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
