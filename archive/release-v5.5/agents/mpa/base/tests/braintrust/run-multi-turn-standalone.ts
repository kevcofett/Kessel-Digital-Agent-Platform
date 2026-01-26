/**
 * Standalone Multi-Turn Evaluation Runner
 *
 * Runs multi-turn conversation evaluations WITHOUT requiring Braintrust.
 * Use this for local testing and development.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm run-multi-turn-standalone.ts
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm run-multi-turn-standalone.ts --scenario full-10-step
 */

import { ConversationEngine } from "./conversation-engine.js";
import {
  ALL_SCENARIOS,
  getScenarioById,
  getScenariosByCategory,
} from "./scenarios/index.js";
import { formatScoreReport } from "./scorers/index.js";
import { TestScenario, ConversationResult } from "./mpa-multi-turn-types.js";

interface ParsedArgs {
  scenario?: string;
  category: "quick" | "full" | "all";
  verbose: boolean;
  model?: string;
  promptVersion?: string;
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const result: ParsedArgs = {
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

function getScenariosToRun(args: ParsedArgs): TestScenario[] {
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

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function generateReport(result: ConversationResult): string {
  const lines: string[] = [];

  lines.push(`\n${"=".repeat(60)}`);
  lines.push(`SCENARIO: ${result.scenario.name}`);
  lines.push(`${"=".repeat(60)}\n`);

  lines.push(`STATUS: ${result.passed ? "✅ PASSED" : "❌ FAILED"}`);
  lines.push(`Composite Score: ${(result.compositeScore * 100).toFixed(1)}%`);
  lines.push(`Total Turns: ${result.totalTurns}`);
  lines.push(
    `Steps Completed: ${result.finalStepState.completedSteps.length}/10 (${result.finalStepState.completedSteps.join(", ") || "none"})`
  );
  lines.push(
    `Duration: ${formatDuration(result.executionMetadata.totalDurationMs)}`
  );
  lines.push(
    `Tokens Used: ${result.executionMetadata.totalTokensUsed.toLocaleString()}`
  );

  // Failures
  if (
    result.failures.critical.length > 0 ||
    result.failures.major.length > 0 ||
    result.failures.warnings.length > 0
  ) {
    lines.push(`\n--- FAILURES ---`);

    if (result.failures.critical.length > 0) {
      lines.push("CRITICAL:");
      for (const f of result.failures.critical) {
        lines.push(`  - ${f.id}: ${f.description}`);
      }
    }

    if (result.failures.major.length > 0) {
      lines.push("MAJOR:");
      for (const f of result.failures.major) {
        lines.push(`  - ${f.id}: ${f.description}`);
      }
    }

    if (result.failures.warnings.length > 0) {
      lines.push("WARNINGS:");
      for (const f of result.failures.warnings) {
        lines.push(`  - ${f.id}: ${f.description}`);
      }
    }
  }

  // Score breakdown
  lines.push(`\n--- SCORE BREAKDOWN ---`);
  lines.push(
    formatScoreReport(
      result.turnScoreAggregates,
      result.conversationScores,
      result.compositeScore,
      result.passed
    )
  );

  return lines.join("\n");
}

function generateConversationLog(result: ConversationResult): string {
  const lines: string[] = [];

  lines.push(`\n--- CONVERSATION LOG ---\n`);

  for (const turn of result.turns) {
    lines.push(`[Turn ${turn.turnNumber}] Step ${turn.currentStep}`);
    lines.push(`USER: ${turn.userMessage}`);
    lines.push(`AGENT: ${turn.agentResponse.slice(0, 500)}${turn.agentResponse.length > 500 ? "..." : ""}`);

    if (turn.detectedEvents.length > 0) {
      lines.push(`Events: ${turn.detectedEvents.map((e) => e.type).join(", ")}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const args = parseArgs();
  const scenarios = getScenariosToRun(args);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`MPA MULTI-TURN EVALUATION (Standalone)`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Scenarios to run: ${scenarios.length}`);
  console.log(`Model: ${args.model || "claude-sonnet-4-20250514"}`);
  console.log(`Verbose: ${args.verbose}`);
  console.log(`${"=".repeat(60)}\n`);

  const results: ConversationResult[] = [];

  for (const scenario of scenarios) {
    console.log(`\nRunning scenario: ${scenario.name}...`);

    // Build config, only including defined values to preserve defaults
    const engineConfig: Partial<{
      verbose: boolean;
      agentModel: string;
      promptVersion: string;
    }> = {
      verbose: args.verbose,
    };
    if (args.model) engineConfig.agentModel = args.model;
    if (args.promptVersion) engineConfig.promptVersion = args.promptVersion;

    const engine = new ConversationEngine(engineConfig);

    try {
      const result = await engine.runConversation(scenario);
      results.push(result);

      // Print report
      console.log(generateReport(result));

      // Print conversation log if verbose
      if (args.verbose) {
        console.log(generateConversationLog(result));
      }
    } catch (error) {
      console.error(`Error running scenario ${scenario.name}:`, error);
    }
  }

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`EVALUATION SUMMARY`);
  console.log(`${"=".repeat(60)}\n`);

  const thresholds: Record<string, number> = {
    "basic-user-step1-2": 0.7,
    "sophisticated-idk-protocol": 0.7,
    "full-10-step": 0.65,
  };

  console.log("SCENARIO RESULTS:");
  console.log("-".repeat(60));
  console.log(
    "Scenario".padEnd(30) +
      "Score".padEnd(10) +
      "Threshold".padEnd(12) +
      "Status"
  );
  console.log("-".repeat(60));

  let totalScore = 0;
  let criticalFailures = 0;

  for (const result of results) {
    const threshold = thresholds[result.scenario.id] || 0.65;
    const passed = result.compositeScore >= threshold;
    const status = passed ? "✅ PASS" : "❌ FAIL";

    console.log(
      result.scenario.name.slice(0, 29).padEnd(30) +
        `${(result.compositeScore * 100).toFixed(1)}%`.padEnd(10) +
        `${(threshold * 100).toFixed(0)}%`.padEnd(12) +
        status
    );

    totalScore += result.compositeScore;
    criticalFailures += result.failures.critical.length;
  }

  console.log("-".repeat(60));

  const avgScore = totalScore / results.length;
  const allPassed = results.every(
    (r) => r.compositeScore >= (thresholds[r.scenario.id] || 0.65)
  );

  console.log(`\nAverage Score: ${(avgScore * 100).toFixed(1)}%`);
  console.log(`Critical Failures: ${criticalFailures}`);

  // Determine status
  let status: "PASS" | "CONDITIONAL" | "FAIL";
  if (allPassed && criticalFailures === 0 && avgScore >= 0.68) {
    status = "PASS";
  } else if (criticalFailures === 0 && avgScore >= 0.65) {
    status = "CONDITIONAL";
  } else {
    status = "FAIL";
  }

  console.log(`\nOVERALL STATUS: ${status}`);

  if (status === "PASS") {
    console.log("✅ Multi-turn validation PASSED. Version validated for production.");
  } else if (status === "CONDITIONAL") {
    console.log("⚠️ Multi-turn validation CONDITIONAL. Review recommended.");
  } else {
    console.log("❌ Multi-turn validation FAILED. Review failures before accepting.");
  }

  console.log(`\n${"=".repeat(60)}\n`);

  process.exit(status === "FAIL" ? 1 : 0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
