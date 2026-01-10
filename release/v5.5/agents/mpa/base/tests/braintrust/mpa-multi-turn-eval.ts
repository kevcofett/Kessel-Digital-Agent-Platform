/**
 * MPA Multi-Turn Evaluation Runner
 *
 * Runs multi-turn conversation evaluations for the Media Planning Agent
 * using the Braintrust evaluation framework.
 *
 * Usage:
 *   # Run all scenarios
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm mpa-multi-turn-eval.ts
 *
 *   # Run specific scenario
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm mpa-multi-turn-eval.ts --scenario basic-user-step1-2
 *
 *   # Run quick scenarios only
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm mpa-multi-turn-eval.ts --category quick
 *
 *   # With Braintrust logging
 *   BRAINTRUST_API_KEY=xxx ANTHROPIC_API_KEY=xxx npx braintrust eval mpa-multi-turn-eval.ts
 */

import { Eval } from "braintrust";
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

/**
 * Parse command line arguments
 */
function parseArgs(): {
  scenario?: string;
  category: "quick" | "full" | "all";
  verbose: boolean;
  model?: string;
  promptVersion?: string;
} {
  const args = process.argv.slice(2);
  const result: ReturnType<typeof parseArgs> = {
    category: "all",
    verbose: false,
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
    }
  }

  return result;
}

/**
 * Get scenarios to run based on arguments
 */
function getScenariosToRun(args: ReturnType<typeof parseArgs>): TestScenario[] {
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

  return getScenariosByCategory(args.category);
}

/**
 * Format duration for display
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

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
 * Generate detailed report for a conversation result
 */
function generateReport(result: ConversationResult): string {
  const lines: string[] = [];

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
 * Calculate efficiency score based on turns per step
 */
function calculateEfficiencyScore(totalTurns: number, completedSteps: number[]): number {
  const steps = completedSteps.length;
  if (steps === 0) return 0;
  const turnsPerStep = totalTurns / steps;
  if (turnsPerStep <= 3) return 1.0;
  if (turnsPerStep <= 5) return 0.8;
  if (turnsPerStep <= 8) return 0.5;
  return 0.2;
}

/**
 * Main evaluation function for Braintrust
 */
async function main() {
  const args = parseArgs();
  const scenarios = getScenariosToRun(args);

  console.log(`\nMPA Multi-Turn Evaluation`);
  console.log(`=========================`);
  console.log(`Scenarios to run: ${scenarios.length}`);
  console.log(`Verbose: ${args.verbose}`);
  console.log(`Model: ${args.model || "default (claude-sonnet-4)"}`);
  console.log("");

  const engineConfig: Partial<ConversationEngineConfig> = {
    verbose: args.verbose,
  };

  if (args.model) {
    engineConfig.agentModel = args.model;
  }

  if (args.promptVersion) {
    engineConfig.promptVersion = args.promptVersion;
  }

  // Run Braintrust evaluation
  await Eval("MPA-Multi-Turn", {
    experimentName: `multi-turn-${args.promptVersion || "v5_7_5"}-${Date.now()}`,
    metadata: {
      promptVersion: args.promptVersion || "v5_7_5",
      model: args.model || "claude-sonnet-4-20250514",
      scenarioCount: scenarios.length,
      category: args.category,
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
      const scenario = getScenarioById(input.scenarioId);
      if (!scenario) {
        throw new Error(`Scenario not found: ${input.scenarioId}`);
      }

      console.log(`\nRunning scenario: ${scenario.name}`);
      const result = await runScenario(scenario, engineConfig);

      // Generate report if verbose
      if (args.verbose) {
        console.log(generateReport(result));
      }

      // Return scores directly in the output
      return {
        // Core metrics
        compositeScore: result.compositeScore,
        passed: result.passed,

        // Conversion metadata
        totalTurns: result.totalTurns,
        completedSteps: result.finalStepState.completedSteps,
        stepsCompleted: result.finalStepState.completedSteps.length,

        // Failure counts
        criticalFailures: result.failures.critical.length,
        majorFailures: result.failures.major.length,
        warnings: result.failures.warnings.length,

        // Efficiency
        efficiency: calculateEfficiencyScore(
          result.totalTurns,
          result.finalStepState.completedSteps
        ),

        // Execution metadata
        durationMs: result.executionMetadata.totalDurationMs,
        tokensUsed: result.executionMetadata.totalTokensUsed,

        // Turn score aggregates
        avgResponseLength: result.turnScoreAggregates["response-length"]?.mean || 0,
        avgSingleQuestion: result.turnScoreAggregates["single-question"]?.mean || 0,
        avgAdaptiveSophistication: result.turnScoreAggregates["adaptive-sophistication"]?.mean || 0,
        avgProactiveIntelligence: result.turnScoreAggregates["proactive-intelligence"]?.mean || 0,

        // Full score data for debugging
        turnScoreAggregates: result.turnScoreAggregates,
        conversationScores: Object.fromEntries(
          Object.entries(result.conversationScores).map(([k, v]) => [k, v.score])
        ),
      };
    },
    scores: [
      // Simple scorer returning the composite score
      (args: { output: { compositeScore: number } }) => args.output.compositeScore,
    ],
  });

  console.log("\nEvaluation complete!");
}

// Run if executed directly
main().catch(console.error);

export { runScenario, generateReport, parseArgs };
