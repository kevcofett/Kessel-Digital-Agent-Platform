/**
 * MPA Multi-Turn Evaluation Runner
 *
 * Runs multi-turn conversation evaluations for the Media Planning Agent
 * using the Braintrust evaluation framework.
 *
 * ALWAYS runs all 11 scenarios and compares against v5.7 baseline.
 *
 * Usage:
 *   # Standard run (all scenarios, baseline comparison)
 *   npx ts-node --esm mpa-multi-turn-eval.ts
 *
 *   # Fast mode (RECOMMENDED for iteration) - parallel + 12 turn cap + Haiku simulator
 *   node dist/mpa-multi-turn-eval.js --fast --track-kb
 *
 *   # Run specific scenario (still compares to baseline)
 *   node dist/mpa-multi-turn-eval.js --scenario basic-user-step1-2
 *
 *   # Parallel execution for faster runs (5 concurrent scenarios)
 *   node dist/mpa-multi-turn-eval.js --parallel
 *
 *   # Efficiency mode (caps at 20 turns per scenario)
 *   node dist/mpa-multi-turn-eval.js --efficiency
 *
 *   # Use Haiku for user simulator (faster, maintains quality)
 *   node dist/mpa-multi-turn-eval.js --parallel --haiku-simulator
 *
 *   # Track KB document impact
 *   node dist/mpa-multi-turn-eval.js --track-kb
 *
 *   # With Braintrust logging
 *   BRAINTRUST_API_KEY=xxx npx braintrust eval mpa-multi-turn-eval.ts
 *
 * Speed Optimization Flags:
 *   --fast             Enable all speed optimizations (parallel + 12 turn cap + Haiku simulator)
 *   --parallel         Run scenarios in parallel (5 concurrent)
 *   --efficiency       Cap scenarios at 20 turns
 *   --haiku-simulator  Use Claude 3.5 Haiku for user simulation (faster, no quality loss)
 */

import { config } from "dotenv";
import { Eval } from "braintrust";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
// Look for .env in the source directory (parent of dist/)
const envPath = path.resolve(__dirname, '..', '.env');
config({ path: envPath });
import { ConversationEngine } from "./conversation-engine.js";
import {
  ALL_SCENARIOS,
  getScenarioById,
  getScenariosByCategory,
  SCENARIO_METADATA,
} from "./scenarios/index.js";
import { formatScoreReport } from "./scorers/index.js";
import {
  TestScenario,
  ConversationResult,
  ConversationEngineConfig,
} from "./mpa-multi-turn-types.js";
import {
  loadBaseline,
  saveBaseline,
  calculateAggregates,
  compareToBaseline,
  generateComparisonReport,
  BaselineRecord,
  ScenarioScore,
} from "./baseline-tracker.js";
import {
  trackKBUsage,
  calculateKBImpactMetrics,
  generateKBOptimizationRecommendations,
  generateKBImpactReport,
  saveKBImpactData,
  KBUsageRecord,
} from "./kb-impact-tracker.js";

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Get the source directory (not dist) for locating baselines
 */
function getSourceDir(): string {
  // When running from dist/, go up one level to find the source files
  // Use __dirname for CommonJS compatibility
  const currentDir = __dirname;
  if (currentDir.includes('/dist')) {
    return path.resolve(currentDir, '..');
  }
  return currentDir;
}

/**
 * Default baseline file path (in source directory, not dist)
 */
const BASELINE_PATH = path.join(getSourceDir(), "baselines", "v5_7_baseline.json");

/**
 * Output directory for test results
 */
const OUTPUT_BASE_DIR = path.join(getSourceDir(), "outputs");

/**
 * Efficiency mode max turns (caps long-running scenarios)
 */
const EFFICIENCY_MODE_MAX_TURNS = 20;

/**
 * Fast mode max turns (allows full conversations while using faster models)
 */
const FAST_MODE_MAX_TURNS = 40;

/**
 * Parallel execution concurrency limit
 */
const PARALLEL_CONCURRENCY = 5;

/**
 * Fast simulator model (Haiku for speed, maintains quality for user simulation)
 */
const FAST_SIMULATOR_MODEL = "claude-3-5-haiku-20241022";

// =============================================================================
// ARGUMENT PARSING
// =============================================================================

interface EvalArgs {
  scenario?: string;
  category: "quick" | "full" | "all";
  verbose: boolean;
  model?: string;
  promptVersion?: string;
  parallel: boolean;
  efficiency: boolean;
  fast: boolean;
  haikuSimulator: boolean;
  trackKb: boolean;
  saveBaseline: boolean;
  skipBaselineComparison: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): EvalArgs {
  const args = process.argv.slice(2);
  const result: EvalArgs = {
    category: "all",
    verbose: false,
    parallel: false,
    efficiency: false,
    fast: false,
    haikuSimulator: false,
    trackKb: false,
    saveBaseline: false,
    skipBaselineComparison: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--scenario":
      case "-s":
        result.scenario = args[++i];
        break;
      case "--category":
      case "-c":
        result.category = args[++i] as "quick" | "full" | "all";
        break;
      case "--verbose":
      case "-v":
        result.verbose = true;
        break;
      case "--model":
      case "-m":
        result.model = args[++i];
        break;
      case "--prompt-version":
      case "-p":
        result.promptVersion = args[++i];
        break;
      case "--parallel":
        result.parallel = true;
        break;
      case "--efficiency":
        result.efficiency = true;
        break;
      case "--fast":
        // Fast mode: implies parallel, efficiency, and haiku simulator
        result.fast = true;
        result.parallel = true;
        result.efficiency = true;
        result.haikuSimulator = true;
        break;
      case "--haiku-simulator":
        result.haikuSimulator = true;
        break;
      case "--track-kb":
        result.trackKb = true;
        break;
      case "--save-baseline":
        result.saveBaseline = true;
        break;
      case "--skip-baseline":
        result.skipBaselineComparison = true;
        break;
    }
  }

  return result;
}

// =============================================================================
// SCENARIO MANAGEMENT
// =============================================================================

/**
 * Get scenarios to run based on arguments
 * ALWAYS returns all scenarios unless --scenario is specified
 */
function getScenariosToRun(args: EvalArgs): TestScenario[] {
  if (args.scenario) {
    const scenario = getScenarioById(args.scenario);
    if (!scenario) {
      console.error(`Unknown scenario: ${args.scenario}`);
      console.error(
        "Available scenarios:",
        ALL_SCENARIOS.map((s) => s.id).join(", ")
      );
      process.exit(1);
    }
    return [scenario];
  }

  // ALWAYS run all scenarios for comprehensive evaluation
  return ALL_SCENARIOS;
}

/**
 * Apply efficiency mode caps to scenarios
 */
function applyEfficiencyMode(scenarios: TestScenario[], fastMode: boolean = false): TestScenario[] {
  const maxTurns = fastMode ? FAST_MODE_MAX_TURNS : EFFICIENCY_MODE_MAX_TURNS;
  return scenarios.map((s) => ({
    ...s,
    maxTurns: Math.min(s.maxTurns, maxTurns),
  }));
}

// =============================================================================
// PRIME DIRECTIVE EFFICIENCY SCORING
// =============================================================================

/**
 * Prime Directive Achievement Score
 *
 * The MPA has two prime directives:
 * 1. Create the best possible media plan/outcome
 * 2. Be an excellent teacher/mentor
 *
 * This score measures how efficiently the agent achieves BOTH directives,
 * not just how quickly it completes steps or how many turns it takes.
 */
interface PrimeDirectiveScore {
  // Directive 1: Media Plan Quality
  planQualityScore: number;
  dataCompleteness: number; // Did agent gather all required data?
  feasibilityAssessment: number; // Did agent assess target feasibility?
  riskIdentification: number; // Did agent identify risks/opportunities?

  // Directive 2: Teaching/Mentorship Quality
  mentorshipScore: number;
  explanationClarity: number; // Did agent explain WHY, not just WHAT?
  calculationTransparency: number; // Did agent show their math?
  userGrowth: number; // Did agent grow the user's capabilities?

  // Efficiency Metrics (means to achieve directives, not goals themselves)
  turnsPerDirectiveAchievement: number;
  tokensPerInsight: number;
  stepsPerDecisionPoint: number;

  // Combined Score
  combinedEfficiency: number;
}

/**
 * Calculate prime directive efficiency score
 *
 * Unlike simple turns-per-step, this measures:
 * - Quality of outcome achieved per unit of effort
 * - Teaching effectiveness per interaction
 * - Value density of each exchange
 */
function calculatePrimeDirectiveEfficiency(
  result: ConversationResult
): PrimeDirectiveScore {
  // Extract relevant scores from turn aggregates
  const mentorship = result.turnScoreAggregates["proactive-intelligence"]?.mean || 0;
  const calculations = result.turnScoreAggregates["calculation-presence"]?.mean || 0;
  const sophistication = result.turnScoreAggregates["adaptive-sophistication"]?.mean || 0;
  const riskFlagging = result.turnScoreAggregates["risk-opportunity-flagging"]?.mean || 0;
  const sources = result.turnScoreAggregates["source-citation"]?.mean || 0;

  // Directive 1: Plan Quality
  const planQualityScore = (
    (result.conversationScores["overall-coherence"]?.score || 0) * 0.3 +
    (result.conversationScores["step-completion-rate"]?.score || 0) * 0.3 +
    riskFlagging * 0.2 +
    sources * 0.2
  );

  // Directive 2: Mentorship Quality
  const mentorshipScore = (
    mentorship * 0.35 +
    calculations * 0.25 +
    sophistication * 0.25 +
    (result.turnScoreAggregates["progress-over-perfection"]?.mean || 0) * 0.15
  );

  // Data completeness - did agent gather what's needed?
  const stepsCompleted = result.finalStepState.completedSteps.length;
  const requiredSteps = result.scenario.successCriteria.requiredStepsComplete.length;
  const dataCompleteness = requiredSteps > 0 ? stepsCompleted / Math.max(requiredSteps, stepsCompleted) : 0;

  // Feasibility assessment - did agent challenge unrealistic targets?
  const feasibilityAssessment = riskFlagging; // Using risk flagging as proxy

  // Explanation clarity - using adaptive sophistication as proxy
  const explanationClarity = sophistication;

  // Calculation transparency
  const calculationTransparency = calculations;

  // User growth - approximated by mentorship + progress
  const userGrowth = (mentorship + (result.turnScoreAggregates["progress-over-perfection"]?.mean || 0)) / 2;

  // Efficiency metrics
  // Turns per directive achievement (lower is better, but only if directives achieved)
  const directiveAchievement = (planQualityScore + mentorshipScore) / 2;
  const turnsPerDirectiveAchievement = directiveAchievement > 0
    ? result.totalTurns / directiveAchievement
    : result.totalTurns * 2; // Penalty if directives not achieved

  // Tokens per insight (approximated)
  const insightCount = (result.failures.warnings.length === 0 ? 1 : 0) +
    (riskFlagging > 0.5 ? 1 : 0) +
    (calculations > 0.5 ? 1 : 0);
  const tokensPerInsight = insightCount > 0
    ? result.executionMetadata.totalTokensUsed / insightCount
    : result.executionMetadata.totalTokensUsed;

  // Steps per decision point
  const decisionPoints = stepsCompleted;
  const stepsPerDecisionPoint = decisionPoints > 0
    ? result.totalTurns / decisionPoints
    : result.totalTurns;

  // Combined efficiency - weighted combination
  // High quality + high mentorship + low turns = high efficiency
  const qualityFactor = (planQualityScore + mentorshipScore) / 2;
  const effortFactor = Math.min(1, 10 / Math.max(1, turnsPerDirectiveAchievement)); // Normalize
  const combinedEfficiency = qualityFactor * 0.6 + effortFactor * 0.4;

  return {
    planQualityScore,
    dataCompleteness,
    feasibilityAssessment,
    riskIdentification: riskFlagging,
    mentorshipScore,
    explanationClarity,
    calculationTransparency,
    userGrowth,
    turnsPerDirectiveAchievement,
    tokensPerInsight,
    stepsPerDecisionPoint,
    combinedEfficiency,
  };
}

// =============================================================================
// REPORTING
// =============================================================================

/**
 * Format duration for display
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Generate detailed report for a conversation result
 */
function generateReport(result: ConversationResult): string {
  const lines: string[] = [];
  const primeDirective = calculatePrimeDirectiveEfficiency(result);

  lines.push(`# Evaluation Report: ${result.scenario.name}`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push("");
  lines.push(`- **Status:** ${result.passed ? "PASSED" : "FAILED"}`);
  lines.push(
    `- **Composite Score:** ${(result.compositeScore * 100).toFixed(1)}%`
  );
  lines.push(`- **Total Turns:** ${result.totalTurns}`);
  lines.push(
    `- **Steps Completed:** ${result.finalStepState.completedSteps.length}/10`
  );
  lines.push(
    `- **Duration:** ${formatDuration(result.executionMetadata.totalDurationMs)}`
  );
  lines.push(
    `- **Avg Latency:** ${formatDuration(result.executionMetadata.averageLatencyMs)}`
  );
  lines.push(
    `- **Total Tokens:** ${result.executionMetadata.totalTokensUsed.toLocaleString()}`
  );
  lines.push("");

  // Prime Directive Efficiency
  lines.push(`## Prime Directive Efficiency`);
  lines.push("");
  lines.push(`| Metric | Score |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Plan Quality | ${(primeDirective.planQualityScore * 100).toFixed(1)}% |`);
  lines.push(`| Mentorship Quality | ${(primeDirective.mentorshipScore * 100).toFixed(1)}% |`);
  lines.push(`| Combined Efficiency | ${(primeDirective.combinedEfficiency * 100).toFixed(1)}% |`);
  lines.push(`| Turns per Directive | ${primeDirective.turnsPerDirectiveAchievement.toFixed(1)} |`);
  lines.push("");

  // Failures
  if (
    result.failures.critical.length > 0 ||
    result.failures.major.length > 0 ||
    result.failures.warnings.length > 0
  ) {
    lines.push(`## Failures Detected`);
    lines.push("");

    if (result.failures.critical.length > 0) {
      lines.push("### Critical");
      for (const f of result.failures.critical) {
        lines.push(`- **${f.id}**: ${f.description}`);
      }
      lines.push("");
    }

    if (result.failures.major.length > 0) {
      lines.push("### Major");
      for (const f of result.failures.major) {
        lines.push(`- **${f.id}**: ${f.description}`);
      }
      lines.push("");
    }

    if (result.failures.warnings.length > 0) {
      lines.push("### Warnings");
      for (const f of result.failures.warnings) {
        lines.push(`- **${f.id}**: ${f.description}`);
      }
      lines.push("");
    }
  }

  // Score breakdown
  lines.push(
    formatScoreReport(
      result.turnScoreAggregates,
      result.conversationScores,
      result.compositeScore,
      result.passed
    )
  );
  lines.push("");

  // Step progression
  lines.push(`## Step Progression`);
  lines.push("");
  lines.push("| Step | Turns | Status |");
  lines.push("|------|-------|--------|");

  for (let step = 1; step <= 10; step++) {
    const turns = result.finalStepState.turnsPerStep[step] || 0;
    const completed = result.finalStepState.completedSteps.includes(step);
    const status = completed ? "Complete" : turns > 0 ? "In Progress" : "Not Started";
    lines.push(`| Step ${step} | ${turns} | ${status} |`);
  }
  lines.push("");

  // Conversation log (condensed)
  lines.push(`## Conversation Log`);
  lines.push("");

  for (const turn of result.turns) {
    lines.push(`### Turn ${turn.turnNumber} (Step ${turn.currentStep})`);
    lines.push("");
    lines.push(`**User:** ${turn.userMessage.slice(0, 200)}${turn.userMessage.length > 200 ? "..." : ""}`);
    lines.push("");
    lines.push(`**Agent:** ${turn.agentResponse.slice(0, 300)}${turn.agentResponse.length > 300 ? "..." : ""}`);
    lines.push("");

    if (turn.detectedEvents.length > 0) {
      lines.push(`*Events: ${turn.detectedEvents.map((e) => e.type).join(", ")}*`);
      lines.push("");
    }
  }

  return lines.join("\n");
}

/**
 * Generate final summary comparing all scenarios against baseline
 */
function generateFinalSummary(
  results: Map<string, ConversationResult>,
  baseline: BaselineRecord | null,
  promptVersion: string,
  kbImpactReport?: string
): string {
  const lines: string[] = [];

  lines.push("═".repeat(80));
  lines.push("MPA EVALUATION COMPLETE");
  lines.push("═".repeat(80));
  lines.push("");
  lines.push(`Prompt Version: ${promptVersion}`);
  lines.push(`Scenarios Run: ${results.size}`);
  lines.push(`Timestamp: ${new Date().toISOString()}`);
  lines.push("");

  // Calculate current aggregates
  const scenarioScores: Record<string, ScenarioScore> = {};
  let totalComposite = 0;
  let passedCount = 0;

  for (const [scenarioId, result] of results) {
    const primeDirective = calculatePrimeDirectiveEfficiency(result);

    scenarioScores[scenarioId] = {
      scenarioId,
      scenarioName: result.scenario.name,
      compositeScore: result.compositeScore,
      passed: result.passed,
      stepsCompleted: result.finalStepState.completedSteps.length,
      totalTurns: result.totalTurns,
      criticalFailures: result.failures.critical.length,
      majorFailures: result.failures.major.length,
      warnings: result.failures.warnings.length,
      avgResponseLength: result.turnScoreAggregates["response-length"]?.mean || 0,
      avgSingleQuestion: result.turnScoreAggregates["single-question"]?.mean || 0,
      avgAdaptiveSophistication: result.turnScoreAggregates["adaptive-sophistication"]?.mean || 0,
      avgProactiveIntelligence: result.turnScoreAggregates["proactive-intelligence"]?.mean || 0,
      mentorshipScore: primeDirective.mentorshipScore,
      durationMs: result.executionMetadata.totalDurationMs,
      tokensUsed: result.executionMetadata.totalTokensUsed,
      timestamp: Date.now(),
    };

    totalComposite += result.compositeScore;
    if (result.passed) passedCount++;
  }

  const overallComposite = results.size > 0 ? totalComposite / results.size : 0;
  const passRate = results.size > 0 ? passedCount / results.size : 0;

  // Overall results
  lines.push("─".repeat(80));
  lines.push("OVERALL RESULTS");
  lines.push("─".repeat(80));
  lines.push(`Overall Composite: ${(overallComposite * 100).toFixed(1)}%`);
  lines.push(`Pass Rate: ${(passRate * 100).toFixed(1)}% (${passedCount}/${results.size})`);
  lines.push("");

  // Per-scenario results
  lines.push("─".repeat(80));
  lines.push("PER-SCENARIO RESULTS");
  lines.push("─".repeat(80));
  lines.push("");

  const sortedResults = Array.from(results.entries())
    .sort(([, a], [, b]) => b.compositeScore - a.compositeScore);

  for (const [scenarioId, result] of sortedResults) {
    const primeDirective = calculatePrimeDirectiveEfficiency(result);
    const status = result.passed ? "✅" : "❌";
    const baselineScore = baseline?.scenarioScores[scenarioId]?.compositeScore;
    const change = baselineScore
      ? `(${result.compositeScore > baselineScore ? "+" : ""}${((result.compositeScore - baselineScore) * 100).toFixed(1)}%)`
      : "(NEW)";

    lines.push(`${status} ${result.scenario.name}`);
    lines.push(`   Composite: ${(result.compositeScore * 100).toFixed(1)}% ${change}`);
    lines.push(`   Plan Quality: ${(primeDirective.planQualityScore * 100).toFixed(1)}% | Mentorship: ${(primeDirective.mentorshipScore * 100).toFixed(1)}%`);
    lines.push(`   Efficiency: ${(primeDirective.combinedEfficiency * 100).toFixed(1)}% | Turns: ${result.totalTurns} | Steps: ${result.finalStepState.completedSteps.length}`);
    lines.push("");
  }

  // Baseline comparison
  if (baseline) {
    lines.push("─".repeat(80));
    lines.push("BASELINE COMPARISON (v5.7)");
    lines.push("─".repeat(80));
    lines.push("");

    const compositeChange = overallComposite - baseline.overallComposite;
    const passRateChange = passRate - baseline.passRate;

    lines.push(`Overall Change: ${compositeChange >= 0 ? "+" : ""}${(compositeChange * 100).toFixed(1)}%`);
    lines.push(`Pass Rate Change: ${passRateChange >= 0 ? "+" : ""}${(passRateChange * 100).toFixed(1)}%`);
    lines.push("");

    // Identify regressions
    const regressions: string[] = [];
    const improvements: string[] = [];

    for (const [scenarioId, result] of results) {
      const baselineScore = baseline.scenarioScores[scenarioId]?.compositeScore;
      if (baselineScore) {
        const change = result.compositeScore - baselineScore;
        if (change < -0.05) {
          regressions.push(`${result.scenario.name}: ${(change * 100).toFixed(1)}%`);
        } else if (change > 0.05) {
          improvements.push(`${result.scenario.name}: +${(change * 100).toFixed(1)}%`);
        }
      }
    }

    if (regressions.length > 0) {
      lines.push("⚠️  REGRESSIONS:");
      for (const r of regressions) {
        lines.push(`   - ${r}`);
      }
      lines.push("");
    }

    if (improvements.length > 0) {
      lines.push("✅ IMPROVEMENTS:");
      for (const i of improvements) {
        lines.push(`   - ${i}`);
      }
      lines.push("");
    }
  }

  // KB Impact Report (if tracked)
  if (kbImpactReport) {
    lines.push("─".repeat(80));
    lines.push("KB DOCUMENT IMPACT");
    lines.push("─".repeat(80));
    lines.push("");
    lines.push(kbImpactReport);
    lines.push("");
  }

  lines.push("═".repeat(80));

  return lines.join("\n");
}

// =============================================================================
// TEST OUTPUT SAVING
// =============================================================================

/**
 * Get the next run number by checking existing output directories
 */
function getNextRunNumber(): number {
  if (!fs.existsSync(OUTPUT_BASE_DIR)) {
    return 1;
  }

  const dirs = fs.readdirSync(OUTPUT_BASE_DIR)
    .filter(d => d.startsWith('run-'))
    .map(d => parseInt(d.replace('run-', ''), 10))
    .filter(n => !isNaN(n));

  return dirs.length > 0 ? Math.max(...dirs) + 1 : 1;
}

/**
 * Create output directory for this run
 */
function createRunDirectory(runNumber: number): string {
  const runDir = path.join(OUTPUT_BASE_DIR, `run-${runNumber.toString().padStart(3, '0')}`);
  fs.mkdirSync(runDir, { recursive: true });
  return runDir;
}

/**
 * Format a conversation turn for readable output
 */
function formatConversationTurn(turn: ConversationResult["turns"][0]): string {
  const lines: string[] = [];

  lines.push(`${"─".repeat(60)}`);
  lines.push(`TURN ${turn.turnNumber} (Step ${turn.currentStep})`);
  lines.push(`${"─".repeat(60)}`);
  lines.push("");
  lines.push("USER:");
  lines.push(turn.userMessage);
  lines.push("");
  lines.push("AGENT:");
  lines.push(turn.agentResponse);
  lines.push("");

  if (turn.detectedEvents.length > 0) {
    lines.push(`Events: ${turn.detectedEvents.map(e => e.type).join(", ")}`);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Save full conversation output for a scenario
 */
function saveScenarioOutput(
  result: ConversationResult,
  runDir: string,
  scenarioIndex: number
): void {
  const primeDirective = calculatePrimeDirectiveEfficiency(result);
  const scenarioDir = path.join(runDir, `${(scenarioIndex + 1).toString().padStart(2, '0')}_${result.scenario.id}`);
  fs.mkdirSync(scenarioDir, { recursive: true });

  // 1. Summary file
  const summaryLines: string[] = [];
  summaryLines.push(`# ${result.scenario.name}`);
  summaryLines.push("");
  summaryLines.push(`## Summary`);
  summaryLines.push("");
  summaryLines.push(`| Metric | Value |`);
  summaryLines.push(`|--------|-------|`);
  summaryLines.push(`| Status | ${result.passed ? "PASSED" : "FAILED"} |`);
  summaryLines.push(`| Composite Score | ${(result.compositeScore * 100).toFixed(1)}% |`);
  summaryLines.push(`| Plan Quality | ${(primeDirective.planQualityScore * 100).toFixed(1)}% |`);
  summaryLines.push(`| Mentorship Quality | ${(primeDirective.mentorshipScore * 100).toFixed(1)}% |`);
  summaryLines.push(`| Combined Efficiency | ${(primeDirective.combinedEfficiency * 100).toFixed(1)}% |`);
  summaryLines.push(`| Total Turns | ${result.totalTurns} |`);
  summaryLines.push(`| Steps Completed | ${result.finalStepState.completedSteps.length}/10 |`);
  summaryLines.push(`| Duration | ${formatDuration(result.executionMetadata.totalDurationMs)} |`);
  summaryLines.push(`| Tokens Used | ${result.executionMetadata.totalTokensUsed.toLocaleString()} |`);
  summaryLines.push("");

  if (result.failures.critical.length > 0 || result.failures.major.length > 0 || result.failures.warnings.length > 0) {
    summaryLines.push(`## Failures`);
    summaryLines.push("");
    if (result.failures.critical.length > 0) {
      summaryLines.push(`### Critical (${result.failures.critical.length})`);
      for (const f of result.failures.critical) {
        summaryLines.push(`- **${f.id}**: ${f.description}`);
      }
      summaryLines.push("");
    }
    if (result.failures.major.length > 0) {
      summaryLines.push(`### Major (${result.failures.major.length})`);
      for (const f of result.failures.major) {
        summaryLines.push(`- **${f.id}**: ${f.description}`);
      }
      summaryLines.push("");
    }
    if (result.failures.warnings.length > 0) {
      summaryLines.push(`### Warnings (${result.failures.warnings.length})`);
      for (const f of result.failures.warnings) {
        summaryLines.push(`- **${f.id}**: ${f.description}`);
      }
      summaryLines.push("");
    }
  }

  fs.writeFileSync(path.join(scenarioDir, "01_summary.md"), summaryLines.join("\n"));

  // 2. Full conversation log
  const conversationLines: string[] = [];
  conversationLines.push(`# Conversation Log: ${result.scenario.name}`);
  conversationLines.push("");
  conversationLines.push(`Timestamp: ${new Date().toISOString()}`);
  conversationLines.push(`Total Turns: ${result.totalTurns}`);
  conversationLines.push("");
  conversationLines.push("═".repeat(60));
  conversationLines.push("");

  for (const turn of result.turns) {
    conversationLines.push(formatConversationTurn(turn));
  }

  fs.writeFileSync(path.join(scenarioDir, "02_conversation.txt"), conversationLines.join("\n"));

  // 3. Score breakdown
  const scoreLines: string[] = [];
  scoreLines.push(`# Score Breakdown: ${result.scenario.name}`);
  scoreLines.push("");
  scoreLines.push(formatScoreReport(
    result.turnScoreAggregates,
    result.conversationScores,
    result.compositeScore,
    result.passed
  ));

  fs.writeFileSync(path.join(scenarioDir, "03_scores.md"), scoreLines.join("\n"));

  // 4. Media Plan Output (if available) - extracted from agent responses
  const mediaPlanLines: string[] = [];
  mediaPlanLines.push(`# Media Plan Output: ${result.scenario.name}`);
  mediaPlanLines.push("");
  mediaPlanLines.push(`This document contains the key outputs from the media planning conversation.`);
  mediaPlanLines.push("");

  // Track what we've learned at each step
  const stepData: Record<number, string[]> = {};
  for (const turn of result.turns) {
    if (!stepData[turn.currentStep]) {
      stepData[turn.currentStep] = [];
    }
    // Extract key points from agent response (first 2000 chars)
    const response = turn.agentResponse.slice(0, 2000);
    stepData[turn.currentStep].push(`Turn ${turn.turnNumber}:\n${response}${turn.agentResponse.length > 2000 ? '...' : ''}`);
  }

  for (let step = 1; step <= 10; step++) {
    if (stepData[step] && stepData[step].length > 0) {
      const stepNames = [
        "", "Outcomes", "Economics", "Audience", "Geography", "Budget",
        "Value Proposition", "Channels", "Measurement", "Testing", "Risks"
      ];
      mediaPlanLines.push(`## Step ${step}: ${stepNames[step]}`);
      mediaPlanLines.push("");
      for (const content of stepData[step]) {
        mediaPlanLines.push(content);
        mediaPlanLines.push("");
      }
      mediaPlanLines.push("─".repeat(40));
      mediaPlanLines.push("");
    }
  }

  fs.writeFileSync(path.join(scenarioDir, "04_media_plan.md"), mediaPlanLines.join("\n"));

  // 5. Raw JSON data for debugging
  const rawData = {
    scenario: {
      id: result.scenario.id,
      name: result.scenario.name,
      persona: result.scenario.persona.id,
    },
    result: {
      compositeScore: result.compositeScore,
      passed: result.passed,
      totalTurns: result.totalTurns,
      stepsCompleted: result.finalStepState.completedSteps,
      turnsPerStep: result.finalStepState.turnsPerStep,
      failures: result.failures,
      primeDirective,
    },
    turnScoreAggregates: result.turnScoreAggregates,
    conversationScores: Object.fromEntries(
      Object.entries(result.conversationScores).map(([k, v]) => [k, v.score])
    ),
    executionMetadata: result.executionMetadata,
  };

  fs.writeFileSync(path.join(scenarioDir, "05_raw_data.json"), JSON.stringify(rawData, null, 2));
}

/**
 * Save run summary
 */
function saveRunSummary(
  results: Map<string, ConversationResult>,
  runDir: string,
  baseline: BaselineRecord | null,
  promptVersion: string,
  kbImpactReport?: string
): void {
  const summary = generateFinalSummary(results, baseline, promptVersion, kbImpactReport);
  fs.writeFileSync(path.join(runDir, "00_run_summary.md"), summary);

  // Also save a JSON index
  const index: {
    runNumber: number;
    timestamp: string;
    promptVersion: string;
    scenarioCount: number;
    passedCount: number;
    overallComposite: number;
    scenarios: Array<{
      id: string;
      name: string;
      passed: boolean;
      compositeScore: number;
    }>;
  } = {
    runNumber: parseInt(path.basename(runDir).replace('run-', ''), 10),
    timestamp: new Date().toISOString(),
    promptVersion,
    scenarioCount: results.size,
    passedCount: Array.from(results.values()).filter(r => r.passed).length,
    overallComposite: Array.from(results.values()).reduce((sum, r) => sum + r.compositeScore, 0) / results.size,
    scenarios: Array.from(results.entries()).map(([id, r]) => ({
      id,
      name: r.scenario.name,
      passed: r.passed,
      compositeScore: r.compositeScore,
    })).sort((a, b) => b.compositeScore - a.compositeScore),
  };

  fs.writeFileSync(path.join(runDir, "00_index.json"), JSON.stringify(index, null, 2));
}

// =============================================================================
// EXECUTION
// =============================================================================

/**
 * Run a single scenario and return results
 */
async function runScenario(
  scenario: TestScenario,
  config: Partial<ConversationEngineConfig>
): Promise<ConversationResult> {
  const engine = new ConversationEngine(config);
  return engine.runConversation(scenario);
}

/**
 * Run scenarios in parallel with concurrency limit
 */
async function runScenariosParallel(
  scenarios: TestScenario[],
  config: Partial<ConversationEngineConfig>,
  concurrency: number,
  verbose: boolean
): Promise<Map<string, ConversationResult>> {
  const results = new Map<string, ConversationResult>();
  const queue = [...scenarios];

  const runNext = async (): Promise<void> => {
    while (queue.length > 0) {
      const scenario = queue.shift();
      if (!scenario) break;

      console.log(`\n[PARALLEL] Starting: ${scenario.name}`);
      const result = await runScenario(scenario, config);
      results.set(scenario.id, result);

      if (verbose) {
        console.log(generateReport(result));
      } else {
        const status = result.passed ? "✅" : "❌";
        console.log(`[PARALLEL] ${status} ${scenario.name}: ${(result.compositeScore * 100).toFixed(1)}%`);
      }
    }
  };

  // Start concurrent workers
  const workers = Array(Math.min(concurrency, scenarios.length))
    .fill(null)
    .map(() => runNext());

  await Promise.all(workers);
  return results;
}

/**
 * Run scenarios sequentially
 */
async function runScenariosSequential(
  scenarios: TestScenario[],
  config: Partial<ConversationEngineConfig>,
  verbose: boolean
): Promise<Map<string, ConversationResult>> {
  const results = new Map<string, ConversationResult>();

  for (const scenario of scenarios) {
    console.log(`\nRunning scenario: ${scenario.name}`);
    const result = await runScenario(scenario, config);
    results.set(scenario.id, result);

    if (verbose) {
      console.log(generateReport(result));
    } else {
      const status = result.passed ? "✅" : "❌";
      console.log(`${status} ${scenario.name}: ${(result.compositeScore * 100).toFixed(1)}%`);
    }
  }

  return results;
}

/**
 * Main evaluation function
 */
async function main() {
  const args = parseArgs();
  let scenarios = getScenariosToRun(args);

  // Apply efficiency/fast mode if requested
  if (args.fast) {
    console.log(`\n🚀 Fast mode enabled (max ${FAST_MODE_MAX_TURNS} turns, ${PARALLEL_CONCURRENCY} parallel, Haiku simulator)`);
    scenarios = applyEfficiencyMode(scenarios, true);
  } else if (args.efficiency) {
    console.log(`\n⚡ Efficiency mode enabled (max ${EFFICIENCY_MODE_MAX_TURNS} turns per scenario)`);
    scenarios = applyEfficiencyMode(scenarios, false);
  }

  // Determine simulator model
  const simulatorModel = args.haikuSimulator ? FAST_SIMULATOR_MODEL : "claude-sonnet-4-20250514";

  console.log(`\n${"═".repeat(80)}`);
  console.log(`MPA MULTI-TURN EVALUATION`);
  console.log(`${"═".repeat(80)}`);
  console.log(`Scenarios to run: ${scenarios.length}`);
  console.log(`Mode: ${args.parallel ? "Parallel" : "Sequential"}${args.fast ? " + Fast" : args.efficiency ? " + Efficiency" : ""}`);
  console.log(`Verbose: ${args.verbose}`);
  console.log(`Agent Model: ${args.model || "claude-sonnet-4-20250514"}`);
  console.log(`Simulator Model: ${simulatorModel}`);
  console.log(`Track KB Impact: ${args.trackKb}`);
  console.log("");

  // Load baseline
  let baseline: BaselineRecord | null = null;
  if (!args.skipBaselineComparison) {
    baseline = loadBaseline(BASELINE_PATH);
    if (baseline) {
      console.log(`📊 Loaded v5.7 baseline (${Object.keys(baseline.scenarioScores).length} scenarios)`);
    } else {
      console.log(`⚠️  No baseline found at ${BASELINE_PATH}`);
    }
  }

  const engineConfig: Partial<ConversationEngineConfig> = {
    verbose: args.verbose,
    simulatorModel: simulatorModel,
  };

  if (args.model) {
    engineConfig.agentModel = args.model;
  }

  if (args.promptVersion) {
    engineConfig.promptVersion = args.promptVersion;
  }

  const promptVersion = args.promptVersion || "v5_7_5";

  // Run scenarios
  let results: Map<string, ConversationResult>;

  if (args.parallel) {
    results = await runScenariosParallel(
      scenarios,
      engineConfig,
      PARALLEL_CONCURRENCY,
      args.verbose
    );
  } else {
    results = await runScenariosSequential(scenarios, engineConfig, args.verbose);
  }

  // Create output directory and save results
  const runNumber = getNextRunNumber();
  const runDir = createRunDirectory(runNumber);
  console.log(`\n📁 Saving outputs to: ${runDir}`);

  // Save individual scenario outputs
  let scenarioIndex = 0;
  for (const [, result] of results) {
    saveScenarioOutput(result, runDir, scenarioIndex++);
  }

  // Track KB impact if requested
  let kbImpactReport: string | undefined;
  if (args.trackKb) {
    console.log("\n📚 Analyzing KB document impact...");

    const allKbUsage: KBUsageRecord[] = [];
    const qualityScores: {
      turnNumber: number;
      mentorship: number;
      citation: number;
      dataQuality: number;
      injectedDocuments: string[];
    }[] = [];

    for (const [, result] of results) {
      for (const turn of result.turns) {
        // Track KB usage per turn
        // kbContentInjected contains the KB content strings
        const injectedDocs = turn.kbContentInjected || [];
        const usage = trackKBUsage(
          turn.agentResponse,
          injectedDocs,
          turn.currentStep,
          turn.turnNumber
        );
        allKbUsage.push(...usage);

        // Collect quality scores
        qualityScores.push({
          turnNumber: turn.turnNumber,
          mentorship: turn.turnScores["proactive-intelligence"]?.score || 0,
          citation: turn.turnScores["source-citation"]?.score || 0,
          dataQuality: turn.turnScores["calculation-presence"]?.score || 0,
          injectedDocuments: injectedDocs,
        });
      }
    }

    const impactMetrics = calculateKBImpactMetrics(allKbUsage, qualityScores);
    const recommendations = generateKBOptimizationRecommendations(impactMetrics);
    kbImpactReport = generateKBImpactReport(impactMetrics, recommendations);

    // Save KB impact data
    saveKBImpactData(impactMetrics, promptVersion);
  }

  // Generate final summary
  const summary = generateFinalSummary(results, baseline, promptVersion, kbImpactReport);
  console.log("\n" + summary);

  // Save run summary
  saveRunSummary(results, runDir, baseline, promptVersion, kbImpactReport);
  console.log(`\n📁 Full test outputs saved to: ${runDir}`);

  // Save new baseline if requested
  if (args.saveBaseline) {
    const scenarioScores: Record<string, ScenarioScore> = {};
    for (const [scenarioId, result] of results) {
      const primeDirective = calculatePrimeDirectiveEfficiency(result);
      scenarioScores[scenarioId] = {
        scenarioId,
        scenarioName: result.scenario.name,
        compositeScore: result.compositeScore,
        passed: result.passed,
        stepsCompleted: result.finalStepState.completedSteps.length,
        totalTurns: result.totalTurns,
        criticalFailures: result.failures.critical.length,
        majorFailures: result.failures.major.length,
        warnings: result.failures.warnings.length,
        avgResponseLength: result.turnScoreAggregates["response-length"]?.mean || 0,
        avgSingleQuestion: result.turnScoreAggregates["single-question"]?.mean || 0,
        avgAdaptiveSophistication: result.turnScoreAggregates["adaptive-sophistication"]?.mean || 0,
        avgProactiveIntelligence: result.turnScoreAggregates["proactive-intelligence"]?.mean || 0,
        mentorshipScore: primeDirective.mentorshipScore,
        durationMs: result.executionMetadata.totalDurationMs,
        tokensUsed: result.executionMetadata.totalTokensUsed,
        timestamp: Date.now(),
      };
    }

    const aggregates = calculateAggregates(scenarioScores);
    const newBaseline: BaselineRecord = {
      promptVersion,
      model: args.model || "claude-sonnet-4-20250514",
      timestamp: Date.now(),
      scenarioScores,
      ...aggregates,
    };

    saveBaseline(newBaseline, BASELINE_PATH);
    console.log(`\n✅ New baseline saved to ${BASELINE_PATH}`);
  }

  // Also run via Braintrust for logging (only if API key is configured)
  if (!process.env.BRAINTRUST_API_KEY) {
    console.log("\n⚠️  Skipping Braintrust logging (BRAINTRUST_API_KEY not set)");
  } else {
    await Eval("MPA-Multi-Turn", {
    experimentName: `multi-turn-${promptVersion}-${Date.now()}`,
    metadata: {
      promptVersion,
      model: args.model || "claude-sonnet-4-20250514",
      scenarioCount: scenarios.length,
      category: args.category,
      efficiencyMode: args.efficiency,
      parallel: args.parallel,
    },
    data: () => {
      return scenarios.map((scenario) => ({
        input: {
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          persona: scenario.persona.id,
          openingMessage: scenario.openingMessage,
          maxTurns: scenario.maxTurns,
        },
        expected: {
          minimumScore: scenario.successCriteria.minimumOverallScore,
          requiredSteps: scenario.successCriteria.requiredStepsComplete,
        },
        metadata: {
          ...SCENARIO_METADATA[scenario.id as keyof typeof SCENARIO_METADATA],
        },
      }));
    },
    task: async (input) => {
      // Use cached result if available
      const cachedResult = results.get(input.scenarioId);
      if (cachedResult) {
        const primeDirective = calculatePrimeDirectiveEfficiency(cachedResult);
        return {
          compositeScore: cachedResult.compositeScore,
          passed: cachedResult.passed,
          totalTurns: cachedResult.totalTurns,
          completedSteps: cachedResult.finalStepState.completedSteps,
          stepsCompleted: cachedResult.finalStepState.completedSteps.length,
          criticalFailures: cachedResult.failures.critical.length,
          majorFailures: cachedResult.failures.major.length,
          warnings: cachedResult.failures.warnings.length,
          primeDirectiveEfficiency: primeDirective.combinedEfficiency,
          planQuality: primeDirective.planQualityScore,
          mentorshipQuality: primeDirective.mentorshipScore,
          durationMs: cachedResult.executionMetadata.totalDurationMs,
          tokensUsed: cachedResult.executionMetadata.totalTokensUsed,
          turnScoreAggregates: cachedResult.turnScoreAggregates,
          conversationScores: Object.fromEntries(
            Object.entries(cachedResult.conversationScores).map(([k, v]) => [k, v.score])
          ),
        };
      }

      // Fallback to running scenario
      const scenario = getScenarioById(input.scenarioId);
      if (!scenario) {
        throw new Error(`Scenario not found: ${input.scenarioId}`);
      }
      const result = await runScenario(scenario, engineConfig);
      const primeDirective = calculatePrimeDirectiveEfficiency(result);

      return {
        compositeScore: result.compositeScore,
        passed: result.passed,
        totalTurns: result.totalTurns,
        completedSteps: result.finalStepState.completedSteps,
        stepsCompleted: result.finalStepState.completedSteps.length,
        criticalFailures: result.failures.critical.length,
        majorFailures: result.failures.major.length,
        warnings: result.failures.warnings.length,
        primeDirectiveEfficiency: primeDirective.combinedEfficiency,
        planQuality: primeDirective.planQualityScore,
        mentorshipQuality: primeDirective.mentorshipScore,
        durationMs: result.executionMetadata.totalDurationMs,
        tokensUsed: result.executionMetadata.totalTokensUsed,
        turnScoreAggregates: result.turnScoreAggregates,
        conversationScores: Object.fromEntries(
          Object.entries(result.conversationScores).map(([k, v]) => [k, v.score])
        ),
      };
    },
    scores: [
      (args: { output: { compositeScore: number } }) => args.output.compositeScore,
    ],
  });
  }

  console.log("\n✅ Evaluation complete!");
}

// Run if executed directly
main().catch(console.error);

export {
  runScenario,
  generateReport,
  parseArgs,
  calculatePrimeDirectiveEfficiency,
  runScenariosParallel,
  runScenariosSequential,
};
