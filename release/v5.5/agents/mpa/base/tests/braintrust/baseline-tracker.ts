/**
 * Baseline Tracker - Tracks and compares evaluation results against baselines
 *
 * This module provides:
 * 1. Per-scenario baseline tracking
 * 2. Composite score calculation across all scenarios
 * 3. Regression detection
 * 4. Improvement tracking
 * 5. Report generation for optimization cycles
 */

import * as fs from "fs";
import * as path from "path";

/**
 * Score breakdown for a single scenario
 */
export interface ScenarioScore {
  scenarioId: string;
  scenarioName: string;
  compositeScore: number;
  passed: boolean;
  stepsCompleted: number;
  totalTurns: number;
  criticalFailures: number;
  majorFailures: number;
  warnings: number;

  // Key quality dimensions
  mentorshipScore?: number;
  stepQualityScore?: number;
  planCoherenceScore?: number;

  // Per-turn aggregates
  avgResponseLength: number;
  avgSingleQuestion: number;
  avgAdaptiveSophistication: number;
  avgProactiveIntelligence: number;

  // New quality metrics
  dataQualityScore?: number;
  citationAccuracy?: number;
  gracefulDegradation?: number;

  // Execution metadata
  durationMs: number;
  tokensUsed: number;
  timestamp: number;
}

/**
 * Complete baseline record for a prompt version
 */
export interface BaselineRecord {
  promptVersion: string;
  model: string;
  timestamp: number;
  scenarioScores: Record<string, ScenarioScore>;

  // Aggregate metrics
  overallComposite: number;
  passRate: number;
  avgStepsCompleted: number;
  avgTurns: number;
  totalDuration: number;
  totalTokens: number;

  // Quality category averages
  avgMentorship: number;
  avgStepQuality: number;
  avgPlanCoherence: number;
  avgDataQuality: number;
  avgCitation: number;
}

/**
 * Comparison result between two runs
 */
export interface ComparisonResult {
  baseline: BaselineRecord;
  current: BaselineRecord;

  // Overall changes
  compositeChange: number;
  passRateChange: number;

  // Per-scenario changes
  scenarioChanges: {
    scenarioId: string;
    scenarioName: string;
    baselineScore: number;
    currentScore: number;
    change: number;
    isRegression: boolean;
    isImprovement: boolean;
  }[];

  // Quality category changes
  mentorshipChange: number;
  stepQualityChange: number;
  planCoherenceChange: number;
  dataQualityChange: number;
  citationChange: number;

  // Regressions and improvements
  regressions: string[];
  improvements: string[];

  // Recommendations
  recommendations: string[];
}

// Default baseline file path
const DEFAULT_BASELINE_PATH = path.join(__dirname, "baselines", "v5_7_baseline.json");

/**
 * V5.7 Baseline Scores - Established from evaluation run
 */
export const V5_7_BASELINE_SCORES: Partial<BaselineRecord> = {
  promptVersion: "v5_7_5",
  model: "claude-sonnet-4-20250514",
  timestamp: 1768084084080,
  overallComposite: 0.8025,
  scenarioScores: {
    "basic-user-step1-2": {
      scenarioId: "basic-user-step1-2",
      scenarioName: "Basic User - Steps 1-2 Completion",
      compositeScore: 0.879,
      passed: true,
      stepsCompleted: 2,
      totalTurns: 3,
      criticalFailures: 0,
      majorFailures: 0,
      warnings: 0,
      avgResponseLength: 0.933,
      avgSingleQuestion: 0.80,
      avgAdaptiveSophistication: 0.933,
      avgProactiveIntelligence: 1.0,
      durationMs: 38000,
      tokensUsed: 13049,
      timestamp: 1768083891151,
    },
    "sophisticated-idk": {
      scenarioId: "sophisticated-idk",
      scenarioName: "Sophisticated User - IDK Protocol",
      compositeScore: 0.80,
      passed: true,
      stepsCompleted: 4,
      totalTurns: 6,
      criticalFailures: 0,
      majorFailures: 0,
      warnings: 0,
      avgResponseLength: 0.85,
      avgSingleQuestion: 0.85,
      avgAdaptiveSophistication: 0.95,
      avgProactiveIntelligence: 0.95,
      durationMs: 65000,
      tokensUsed: 22000,
      timestamp: 1768084084080,
    },
    "high-stakes-performance": {
      scenarioId: "high-stakes-performance",
      scenarioName: "High-Stakes Performance Campaign",
      compositeScore: 0.829,
      passed: true,
      stepsCompleted: 5,
      totalTurns: 8,
      criticalFailures: 0,
      majorFailures: 0,
      warnings: 2,
      avgResponseLength: 0.825,
      avgSingleQuestion: 0.85,
      avgAdaptiveSophistication: 1.0,
      avgProactiveIntelligence: 1.0,
      durationMs: 129180,
      tokensUsed: 43700,
      timestamp: 1768083939598,
    },
  },
};

/**
 * Load baseline from file or use defaults
 */
export function loadBaseline(filePath?: string): BaselineRecord | null {
  const targetPath = filePath || DEFAULT_BASELINE_PATH;

  try {
    if (fs.existsSync(targetPath)) {
      const content = fs.readFileSync(targetPath, "utf-8");
      return JSON.parse(content) as BaselineRecord;
    }
  } catch (error) {
    console.warn(`Failed to load baseline from ${targetPath}:`, error);
  }

  return null;
}

/**
 * Save baseline to file
 */
export function saveBaseline(baseline: BaselineRecord, filePath?: string): void {
  const targetPath = filePath || DEFAULT_BASELINE_PATH;
  const dir = path.dirname(targetPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(targetPath, JSON.stringify(baseline, null, 2));
  console.log(`Baseline saved to ${targetPath}`);
}

/**
 * Calculate aggregate metrics from scenario scores
 */
export function calculateAggregates(
  scenarioScores: Record<string, ScenarioScore>
): Omit<BaselineRecord, "promptVersion" | "model" | "timestamp" | "scenarioScores"> {
  const scores = Object.values(scenarioScores);
  const count = scores.length;

  if (count === 0) {
    return {
      overallComposite: 0,
      passRate: 0,
      avgStepsCompleted: 0,
      avgTurns: 0,
      totalDuration: 0,
      totalTokens: 0,
      avgMentorship: 0,
      avgStepQuality: 0,
      avgPlanCoherence: 0,
      avgDataQuality: 0,
      avgCitation: 0,
    };
  }

  const passedCount = scores.filter(s => s.passed).length;

  return {
    overallComposite: scores.reduce((sum, s) => sum + s.compositeScore, 0) / count,
    passRate: passedCount / count,
    avgStepsCompleted: scores.reduce((sum, s) => sum + s.stepsCompleted, 0) / count,
    avgTurns: scores.reduce((sum, s) => sum + s.totalTurns, 0) / count,
    totalDuration: scores.reduce((sum, s) => sum + s.durationMs, 0),
    totalTokens: scores.reduce((sum, s) => sum + s.tokensUsed, 0),
    avgMentorship: scores.reduce((sum, s) => sum + (s.mentorshipScore || 0), 0) / count,
    avgStepQuality: scores.reduce((sum, s) => sum + (s.stepQualityScore || 0), 0) / count,
    avgPlanCoherence: scores.reduce((sum, s) => sum + (s.planCoherenceScore || 0), 0) / count,
    avgDataQuality: scores.reduce((sum, s) => sum + (s.dataQualityScore || 0), 0) / count,
    avgCitation: scores.reduce((sum, s) => sum + (s.citationAccuracy || 0), 0) / count,
  };
}

/**
 * Compare current results against baseline
 */
export function compareToBaseline(
  current: BaselineRecord,
  baseline: BaselineRecord
): ComparisonResult {
  const scenarioChanges: ComparisonResult["scenarioChanges"] = [];
  const regressions: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];

  // Regression threshold: 5% decline is concerning
  const REGRESSION_THRESHOLD = -0.05;
  // Improvement threshold: 5% increase is meaningful
  const IMPROVEMENT_THRESHOLD = 0.05;

  // Compare each scenario
  for (const [scenarioId, currentScore] of Object.entries(current.scenarioScores)) {
    const baselineScore = baseline.scenarioScores[scenarioId];

    if (baselineScore) {
      const change = currentScore.compositeScore - baselineScore.compositeScore;
      const isRegression = change < REGRESSION_THRESHOLD;
      const isImprovement = change > IMPROVEMENT_THRESHOLD;

      scenarioChanges.push({
        scenarioId,
        scenarioName: currentScore.scenarioName,
        baselineScore: baselineScore.compositeScore,
        currentScore: currentScore.compositeScore,
        change,
        isRegression,
        isImprovement,
      });

      if (isRegression) {
        regressions.push(
          `${currentScore.scenarioName}: ${(baselineScore.compositeScore * 100).toFixed(1)}% → ${(currentScore.compositeScore * 100).toFixed(1)}% (${(change * 100).toFixed(1)}%)`
        );
      }

      if (isImprovement) {
        improvements.push(
          `${currentScore.scenarioName}: ${(baselineScore.compositeScore * 100).toFixed(1)}% → ${(currentScore.compositeScore * 100).toFixed(1)}% (+${(change * 100).toFixed(1)}%)`
        );
      }
    } else {
      // New scenario, no baseline comparison
      scenarioChanges.push({
        scenarioId,
        scenarioName: currentScore.scenarioName,
        baselineScore: 0,
        currentScore: currentScore.compositeScore,
        change: 0,
        isRegression: false,
        isImprovement: false,
      });
    }
  }

  // Generate recommendations based on analysis
  if (regressions.length > 0) {
    recommendations.push(
      `⚠️ ${regressions.length} scenario(s) regressed. Review changes to instructions or KB documents.`
    );
  }

  if (current.overallComposite < baseline.overallComposite) {
    const drop = ((baseline.overallComposite - current.overallComposite) * 100).toFixed(1);
    recommendations.push(
      `📉 Overall composite dropped ${drop}%. Consider reverting recent changes.`
    );
  }

  // Check quality category changes
  const mentorshipChange = (current.avgMentorship || 0) - (baseline.avgMentorship || 0);
  const stepQualityChange = (current.avgStepQuality || 0) - (baseline.avgStepQuality || 0);
  const planCoherenceChange = (current.avgPlanCoherence || 0) - (baseline.avgPlanCoherence || 0);
  const dataQualityChange = (current.avgDataQuality || 0) - (baseline.avgDataQuality || 0);
  const citationChange = (current.avgCitation || 0) - (baseline.avgCitation || 0);

  if (mentorshipChange < REGRESSION_THRESHOLD) {
    recommendations.push(
      `📚 Mentorship quality declined. Review teaching behavior and proactive calculation instructions.`
    );
  }

  if (citationChange < REGRESSION_THRESHOLD) {
    recommendations.push(
      `📝 Citation accuracy declined. Review source attribution and KB reference instructions.`
    );
  }

  return {
    baseline,
    current,
    compositeChange: current.overallComposite - baseline.overallComposite,
    passRateChange: current.passRate - baseline.passRate,
    scenarioChanges,
    mentorshipChange,
    stepQualityChange,
    planCoherenceChange,
    dataQualityChange,
    citationChange,
    regressions,
    improvements,
    recommendations,
  };
}

/**
 * Generate a formatted report from comparison results
 */
export function generateComparisonReport(comparison: ComparisonResult): string {
  const lines: string[] = [];

  lines.push("# MPA Evaluation Comparison Report");
  lines.push("");
  lines.push(`**Baseline:** v${comparison.baseline.promptVersion} (${new Date(comparison.baseline.timestamp).toISOString()})`);
  lines.push(`**Current:** v${comparison.current.promptVersion} (${new Date(comparison.current.timestamp).toISOString()})`);
  lines.push("");

  // Overall metrics
  lines.push("## Overall Metrics");
  lines.push("");
  lines.push("| Metric | Baseline | Current | Change |");
  lines.push("|--------|----------|---------|--------|");
  lines.push(
    `| Composite Score | ${(comparison.baseline.overallComposite * 100).toFixed(1)}% | ${(comparison.current.overallComposite * 100).toFixed(1)}% | ${formatChange(comparison.compositeChange)} |`
  );
  lines.push(
    `| Pass Rate | ${(comparison.baseline.passRate * 100).toFixed(1)}% | ${(comparison.current.passRate * 100).toFixed(1)}% | ${formatChange(comparison.passRateChange)} |`
  );
  lines.push(
    `| Avg Steps | ${comparison.baseline.avgStepsCompleted.toFixed(1)} | ${comparison.current.avgStepsCompleted.toFixed(1)} | ${formatChangeAbs(comparison.current.avgStepsCompleted - comparison.baseline.avgStepsCompleted)} |`
  );
  lines.push("");

  // Quality categories
  if (comparison.baseline.avgMentorship > 0 || comparison.current.avgMentorship > 0) {
    lines.push("## Quality Categories");
    lines.push("");
    lines.push("| Category | Baseline | Current | Change |");
    lines.push("|----------|----------|---------|--------|");
    lines.push(
      `| Mentorship | ${(comparison.baseline.avgMentorship * 100).toFixed(1)}% | ${(comparison.current.avgMentorship * 100).toFixed(1)}% | ${formatChange(comparison.mentorshipChange)} |`
    );
    lines.push(
      `| Step Quality | ${(comparison.baseline.avgStepQuality * 100).toFixed(1)}% | ${(comparison.current.avgStepQuality * 100).toFixed(1)}% | ${formatChange(comparison.stepQualityChange)} |`
    );
    lines.push(
      `| Plan Coherence | ${(comparison.baseline.avgPlanCoherence * 100).toFixed(1)}% | ${(comparison.current.avgPlanCoherence * 100).toFixed(1)}% | ${formatChange(comparison.planCoherenceChange)} |`
    );
    lines.push(
      `| Data Quality | ${(comparison.baseline.avgDataQuality * 100).toFixed(1)}% | ${(comparison.current.avgDataQuality * 100).toFixed(1)}% | ${formatChange(comparison.dataQualityChange)} |`
    );
    lines.push(
      `| Citation | ${(comparison.baseline.avgCitation * 100).toFixed(1)}% | ${(comparison.current.avgCitation * 100).toFixed(1)}% | ${formatChange(comparison.citationChange)} |`
    );
    lines.push("");
  }

  // Per-scenario breakdown
  lines.push("## Per-Scenario Results");
  lines.push("");
  lines.push("| Scenario | Baseline | Current | Change | Status |");
  lines.push("|----------|----------|---------|--------|--------|");

  for (const sc of comparison.scenarioChanges.sort((a, b) => a.change - b.change)) {
    const status = sc.isRegression ? "⚠️ Regressed" : sc.isImprovement ? "✅ Improved" : "➖ Stable";
    lines.push(
      `| ${sc.scenarioName} | ${(sc.baselineScore * 100).toFixed(1)}% | ${(sc.currentScore * 100).toFixed(1)}% | ${formatChange(sc.change)} | ${status} |`
    );
  }
  lines.push("");

  // Regressions
  if (comparison.regressions.length > 0) {
    lines.push("## ⚠️ Regressions");
    lines.push("");
    for (const reg of comparison.regressions) {
      lines.push(`- ${reg}`);
    }
    lines.push("");
  }

  // Improvements
  if (comparison.improvements.length > 0) {
    lines.push("## ✅ Improvements");
    lines.push("");
    for (const imp of comparison.improvements) {
      lines.push(`- ${imp}`);
    }
    lines.push("");
  }

  // Recommendations
  if (comparison.recommendations.length > 0) {
    lines.push("## 💡 Recommendations");
    lines.push("");
    for (const rec of comparison.recommendations) {
      lines.push(`- ${rec}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format percentage change with sign
 */
function formatChange(change: number): string {
  const pct = (change * 100).toFixed(1);
  if (change > 0) return `+${pct}%`;
  if (change < 0) return `${pct}%`;
  return "0.0%";
}

/**
 * Format absolute change with sign
 */
function formatChangeAbs(change: number): string {
  const val = change.toFixed(1);
  if (change > 0) return `+${val}`;
  if (change < 0) return val;
  return "0.0";
}

export default {
  loadBaseline,
  saveBaseline,
  calculateAggregates,
  compareToBaseline,
  generateComparisonReport,
  V5_7_BASELINE_SCORES,
};
