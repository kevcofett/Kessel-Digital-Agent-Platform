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
