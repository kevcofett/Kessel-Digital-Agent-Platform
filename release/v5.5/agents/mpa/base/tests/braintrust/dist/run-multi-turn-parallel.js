/**
 * Parallel Multi-Turn Evaluation Runner
 *
 * OPTIMIZED VERSION: Runs scenarios in parallel for maximum speed.
 *
 * Optimizations applied:
 * 1. Parallel scenario execution (configurable concurrency)
 * 2. Shared RAG cache across scenarios
 * 3. Faster simulator model (haiku) for user simulation
 * 4. Progress reporting during execution
 *
 * Usage:
 *   ANTHROPIC_API_KEY=xxx npx tsx run-multi-turn-parallel.ts
 *   ANTHROPIC_API_KEY=xxx npx tsx run-multi-turn-parallel.ts --concurrency 5
 *   ANTHROPIC_API_KEY=xxx npx tsx run-multi-turn-parallel.ts --category quick
 */
import { ConversationEngine } from "./conversation-engine.js";
import { ALL_SCENARIOS, getScenarioById, getScenariosByCategory, } from "./scenarios/index.js";
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        category: "all",
        verbose: false,
        concurrency: 4, // Default: 4 parallel scenarios
    };
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case "--scenario":
            case "-s":
                result.scenario = args[++i];
                break;
            case "--category":
            case "-c":
                result.category = args[++i];
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
            case "--concurrency":
            case "-n":
                result.concurrency = parseInt(args[++i], 10);
                break;
        }
    }
    return result;
}
function getScenariosToRun(args) {
    if (args.scenario) {
        const scenario = getScenarioById(args.scenario);
        if (!scenario) {
            console.error(`Unknown scenario: ${args.scenario}`);
            console.error("Available scenarios:", ALL_SCENARIOS.map((s) => s.id).join(", "));
            process.exit(1);
        }
        return [scenario];
    }
    return getScenariosByCategory(args.category);
}
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
}
function printProgress(state) {
    const elapsed = Date.now() - state.startTime;
    const rate = state.completed > 0 ? elapsed / state.completed : 0;
    const remaining = (state.total - state.completed) * rate;
    console.log(`\n[Progress] ${state.completed}/${state.total} complete | ✅ ${state.passed} passed | ❌ ${state.failed} failed | ETA: ${formatDuration(remaining)}`);
    if (state.inProgress.length > 0) {
        console.log(`[Running] ${state.inProgress.join(", ")}`);
    }
}
// Run scenarios with limited concurrency
async function runWithConcurrency(items, concurrency, fn) {
    const queue = [...items];
    const workers = [];
    for (let i = 0; i < concurrency; i++) {
        workers.push((async () => {
            while (queue.length > 0) {
                const item = queue.shift();
                if (item)
                    await fn(item);
            }
        })());
    }
    await Promise.all(workers);
}
async function main() {
    const args = parseArgs();
    const scenarios = getScenariosToRun(args);
    console.log(`\n${"=".repeat(60)}`);
    console.log(`MPA MULTI-TURN EVALUATION (Parallel)`);
    console.log(`${"=".repeat(60)}`);
    console.log(`Scenarios to run: ${scenarios.length}`);
    console.log(`Concurrency: ${args.concurrency}`);
    console.log(`Model: ${args.model || "claude-sonnet-4-20250514"}`);
    console.log(`Verbose: ${args.verbose}`);
    console.log(`${"=".repeat(60)}\n`);
    const results = [];
    const progress = {
        total: scenarios.length,
        completed: 0,
        passed: 0,
        failed: 0,
        inProgress: [],
        startTime: Date.now(),
    };
    // Progress reporter - every 30 seconds
    const progressInterval = setInterval(() => {
        printProgress(progress);
    }, 30000);
    // Run scenarios in parallel with concurrency limit
    await runWithConcurrency(scenarios, args.concurrency, async (scenario) => {
        const scenarioName = scenario.name.slice(0, 25);
        progress.inProgress.push(scenarioName);
        console.log(`▶ Starting: ${scenario.name}`);
        // Build config
        const engineConfig = {
            verbose: args.verbose,
            // Use haiku for user simulation (faster, still good quality)
            simulatorModel: "claude-3-5-haiku-20241022",
        };
        if (args.model)
            engineConfig.agentModel = args.model;
        if (args.promptVersion)
            engineConfig.promptVersion = args.promptVersion;
        const engine = new ConversationEngine(engineConfig);
        try {
            const result = await engine.runConversation(scenario);
            results.push(result);
            const status = result.passed ? "✅ PASS" : "❌ FAIL";
            console.log(`${status} ${scenario.name} | ${(result.compositeScore * 100).toFixed(1)}% | ${result.totalTurns} turns | ${formatDuration(result.executionMetadata.totalDurationMs)}`);
            progress.completed++;
            if (result.passed)
                progress.passed++;
            else
                progress.failed++;
        }
        catch (error) {
            console.error(`❌ ERROR ${scenario.name}:`, error);
            progress.completed++;
            progress.failed++;
        }
        // Remove from in-progress
        progress.inProgress = progress.inProgress.filter(n => n !== scenarioName);
    });
    clearInterval(progressInterval);
    // Final Summary
    console.log(`\n${"=".repeat(60)}`);
    console.log(`EVALUATION SUMMARY`);
    console.log(`${"=".repeat(60)}\n`);
    const totalDuration = Date.now() - progress.startTime;
    console.log(`Total Duration: ${formatDuration(totalDuration)}`);
    console.log(`Effective Parallelism: ${(scenarios.length * 30000 / totalDuration).toFixed(1)}x faster than sequential\n`);
    const thresholds = {
        "basic-user-step1-2": 0.7,
        "sophisticated-idk-protocol": 0.7,
        "full-10-step": 0.65,
    };
    console.log("SCENARIO RESULTS:");
    console.log("-".repeat(70));
    console.log("Scenario".padEnd(35) +
        "Score".padEnd(10) +
        "Threshold".padEnd(12) +
        "Status");
    console.log("-".repeat(70));
    let totalScore = 0;
    let criticalFailures = 0;
    // Sort results by scenario ID for consistent output
    results.sort((a, b) => a.scenario.id.localeCompare(b.scenario.id));
    for (const result of results) {
        const threshold = thresholds[result.scenario.id] || 0.65;
        const passed = result.compositeScore >= threshold;
        const status = passed ? "✅ PASS" : "❌ FAIL";
        console.log(result.scenario.name.slice(0, 34).padEnd(35) +
            `${(result.compositeScore * 100).toFixed(1)}%`.padEnd(10) +
            `${(threshold * 100).toFixed(0)}%`.padEnd(12) +
            status);
        totalScore += result.compositeScore;
        criticalFailures += result.failures.critical.length;
    }
    console.log("-".repeat(70));
    const avgScore = results.length > 0 ? totalScore / results.length : 0;
    const allPassed = results.every((r) => r.compositeScore >= (thresholds[r.scenario.id] || 0.65));
    console.log(`\nAverage Score: ${(avgScore * 100).toFixed(1)}%`);
    console.log(`Critical Failures: ${criticalFailures}`);
    // Determine status
    let status;
    if (allPassed && criticalFailures === 0 && avgScore >= 0.68) {
        status = "PASS";
    }
    else if (criticalFailures === 0 && avgScore >= 0.65) {
        status = "CONDITIONAL";
    }
    else {
        status = "FAIL";
    }
    console.log(`\nOVERALL STATUS: ${status}`);
    if (status === "PASS") {
        console.log("✅ Multi-turn validation PASSED. Version validated for production.");
    }
    else if (status === "CONDITIONAL") {
        console.log("⚠️ Multi-turn validation CONDITIONAL. Review recommended.");
    }
    else {
        console.log("❌ Multi-turn validation FAILED. Review failures before accepting.");
    }
    // Show failures summary
    if (criticalFailures > 0 || progress.failed > 0) {
        console.log(`\n--- FAILURES SUMMARY ---`);
        for (const result of results) {
            if (!result.passed || result.failures.critical.length > 0) {
                console.log(`\n${result.scenario.name}:`);
                if (result.failures.critical.length > 0) {
                    console.log("  Critical:");
                    for (const f of result.failures.critical) {
                        console.log(`    - ${f.description}`);
                    }
                }
                if (result.failures.major.length > 0) {
                    console.log("  Major:");
                    for (const f of result.failures.major) {
                        console.log(`    - ${f.description}`);
                    }
                }
            }
        }
    }
    console.log(`\n${"=".repeat(60)}\n`);
    process.exit(status === "FAIL" ? 1 : 0);
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=run-multi-turn-parallel.js.map