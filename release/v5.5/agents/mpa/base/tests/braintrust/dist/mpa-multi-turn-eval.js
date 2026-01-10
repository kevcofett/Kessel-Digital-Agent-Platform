"use strict";
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
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm mpa-multi-turn-eval.ts
 *
 *   # Run specific scenario (still compares to baseline)
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm mpa-multi-turn-eval.ts --scenario basic-user-step1-2
 *
 *   # Parallel execution for faster runs
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm mpa-multi-turn-eval.ts --parallel
 *
 *   # Efficiency mode (caps turns for faster iteration)
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm mpa-multi-turn-eval.ts --efficiency
 *
 *   # Track KB document impact
 *   ANTHROPIC_API_KEY=xxx npx ts-node --esm mpa-multi-turn-eval.ts --track-kb
 *
 *   # With Braintrust logging
 *   BRAINTRUST_API_KEY=xxx ANTHROPIC_API_KEY=xxx npx braintrust eval mpa-multi-turn-eval.ts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runScenario = runScenario;
exports.generateReport = generateReport;
exports.parseArgs = parseArgs;
exports.calculatePrimeDirectiveEfficiency = calculatePrimeDirectiveEfficiency;
exports.runScenariosParallel = runScenariosParallel;
exports.runScenariosSequential = runScenariosSequential;
const braintrust_1 = require("braintrust");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const conversation_engine_js_1 = require("./conversation-engine.js");
const index_js_1 = require("./scenarios/index.js");
const index_js_2 = require("./scorers/index.js");
const baseline_tracker_js_1 = require("./baseline-tracker.js");
const kb_impact_tracker_js_1 = require("./kb-impact-tracker.js");
// =============================================================================
// CONFIGURATION
// =============================================================================
/**
 * Get the source directory (not dist) for locating baselines
 */
function getSourceDir() {
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
 * Parallel execution concurrency limit
 */
const PARALLEL_CONCURRENCY = 3;
/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        category: "all",
        verbose: false,
        parallel: false,
        efficiency: false,
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
            case "--parallel":
                result.parallel = true;
                break;
            case "--efficiency":
                result.efficiency = true;
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
function getScenariosToRun(args) {
    if (args.scenario) {
        const scenario = (0, index_js_1.getScenarioById)(args.scenario);
        if (!scenario) {
            console.error(`Unknown scenario: ${args.scenario}`);
            console.error("Available scenarios:", index_js_1.ALL_SCENARIOS.map((s) => s.id).join(", "));
            process.exit(1);
        }
        return [scenario];
    }
    // ALWAYS run all scenarios for comprehensive evaluation
    return index_js_1.ALL_SCENARIOS;
}
/**
 * Apply efficiency mode caps to scenarios
 */
function applyEfficiencyMode(scenarios) {
    return scenarios.map((s) => ({
        ...s,
        maxTurns: Math.min(s.maxTurns, EFFICIENCY_MODE_MAX_TURNS),
    }));
}
/**
 * Calculate prime directive efficiency score
 *
 * Unlike simple turns-per-step, this measures:
 * - Quality of outcome achieved per unit of effort
 * - Teaching effectiveness per interaction
 * - Value density of each exchange
 */
function calculatePrimeDirectiveEfficiency(result) {
    // Extract relevant scores from turn aggregates
    const mentorship = result.turnScoreAggregates["proactive-intelligence"]?.mean || 0;
    const calculations = result.turnScoreAggregates["calculation-presence"]?.mean || 0;
    const sophistication = result.turnScoreAggregates["adaptive-sophistication"]?.mean || 0;
    const riskFlagging = result.turnScoreAggregates["risk-opportunity-flagging"]?.mean || 0;
    const sources = result.turnScoreAggregates["source-citation"]?.mean || 0;
    // Directive 1: Plan Quality
    const planQualityScore = ((result.conversationScores["overall-coherence"]?.score || 0) * 0.3 +
        (result.conversationScores["step-completion-rate"]?.score || 0) * 0.3 +
        riskFlagging * 0.2 +
        sources * 0.2);
    // Directive 2: Mentorship Quality
    const mentorshipScore = (mentorship * 0.35 +
        calculations * 0.25 +
        sophistication * 0.25 +
        (result.turnScoreAggregates["progress-over-perfection"]?.mean || 0) * 0.15);
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
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
}
/**
 * Generate detailed report for a conversation result
 */
function generateReport(result) {
    const lines = [];
    const primeDirective = calculatePrimeDirectiveEfficiency(result);
    lines.push(`# Evaluation Report: ${result.scenario.name}`);
    lines.push("");
    lines.push(`## Summary`);
    lines.push("");
    lines.push(`- **Status:** ${result.passed ? "PASSED" : "FAILED"}`);
    lines.push(`- **Composite Score:** ${(result.compositeScore * 100).toFixed(1)}%`);
    lines.push(`- **Total Turns:** ${result.totalTurns}`);
    lines.push(`- **Steps Completed:** ${result.finalStepState.completedSteps.length}/10`);
    lines.push(`- **Duration:** ${formatDuration(result.executionMetadata.totalDurationMs)}`);
    lines.push(`- **Avg Latency:** ${formatDuration(result.executionMetadata.averageLatencyMs)}`);
    lines.push(`- **Total Tokens:** ${result.executionMetadata.totalTokensUsed.toLocaleString()}`);
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
    if (result.failures.critical.length > 0 ||
        result.failures.major.length > 0 ||
        result.failures.warnings.length > 0) {
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
    lines.push((0, index_js_2.formatScoreReport)(result.turnScoreAggregates, result.conversationScores, result.compositeScore, result.passed));
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
function generateFinalSummary(results, baseline, promptVersion, kbImpactReport) {
    const lines = [];
    lines.push("═".repeat(80));
    lines.push("MPA EVALUATION COMPLETE");
    lines.push("═".repeat(80));
    lines.push("");
    lines.push(`Prompt Version: ${promptVersion}`);
    lines.push(`Scenarios Run: ${results.size}`);
    lines.push(`Timestamp: ${new Date().toISOString()}`);
    lines.push("");
    // Calculate current aggregates
    const scenarioScores = {};
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
        if (result.passed)
            passedCount++;
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
        const regressions = [];
        const improvements = [];
        for (const [scenarioId, result] of results) {
            const baselineScore = baseline.scenarioScores[scenarioId]?.compositeScore;
            if (baselineScore) {
                const change = result.compositeScore - baselineScore;
                if (change < -0.05) {
                    regressions.push(`${result.scenario.name}: ${(change * 100).toFixed(1)}%`);
                }
                else if (change > 0.05) {
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
function getNextRunNumber() {
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
function createRunDirectory(runNumber) {
    const runDir = path.join(OUTPUT_BASE_DIR, `run-${runNumber.toString().padStart(3, '0')}`);
    fs.mkdirSync(runDir, { recursive: true });
    return runDir;
}
/**
 * Format a conversation turn for readable output
 */
function formatConversationTurn(turn) {
    const lines = [];
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
function saveScenarioOutput(result, runDir, scenarioIndex) {
    const primeDirective = calculatePrimeDirectiveEfficiency(result);
    const scenarioDir = path.join(runDir, `${(scenarioIndex + 1).toString().padStart(2, '0')}_${result.scenario.id}`);
    fs.mkdirSync(scenarioDir, { recursive: true });
    // 1. Summary file
    const summaryLines = [];
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
    const conversationLines = [];
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
    const scoreLines = [];
    scoreLines.push(`# Score Breakdown: ${result.scenario.name}`);
    scoreLines.push("");
    scoreLines.push((0, index_js_2.formatScoreReport)(result.turnScoreAggregates, result.conversationScores, result.compositeScore, result.passed));
    fs.writeFileSync(path.join(scenarioDir, "03_scores.md"), scoreLines.join("\n"));
    // 4. Media Plan Output (if available) - extracted from agent responses
    const mediaPlanLines = [];
    mediaPlanLines.push(`# Media Plan Output: ${result.scenario.name}`);
    mediaPlanLines.push("");
    mediaPlanLines.push(`This document contains the key outputs from the media planning conversation.`);
    mediaPlanLines.push("");
    // Track what we've learned at each step
    const stepData = {};
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
        conversationScores: Object.fromEntries(Object.entries(result.conversationScores).map(([k, v]) => [k, v.score])),
        executionMetadata: result.executionMetadata,
    };
    fs.writeFileSync(path.join(scenarioDir, "05_raw_data.json"), JSON.stringify(rawData, null, 2));
}
/**
 * Save run summary
 */
function saveRunSummary(results, runDir, baseline, promptVersion, kbImpactReport) {
    const summary = generateFinalSummary(results, baseline, promptVersion, kbImpactReport);
    fs.writeFileSync(path.join(runDir, "00_run_summary.md"), summary);
    // Also save a JSON index
    const index = {
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
async function runScenario(scenario, config) {
    const engine = new conversation_engine_js_1.ConversationEngine(config);
    return engine.runConversation(scenario);
}
/**
 * Run scenarios in parallel with concurrency limit
 */
async function runScenariosParallel(scenarios, config, concurrency, verbose) {
    const results = new Map();
    const queue = [...scenarios];
    const runNext = async () => {
        while (queue.length > 0) {
            const scenario = queue.shift();
            if (!scenario)
                break;
            console.log(`\n[PARALLEL] Starting: ${scenario.name}`);
            const result = await runScenario(scenario, config);
            results.set(scenario.id, result);
            if (verbose) {
                console.log(generateReport(result));
            }
            else {
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
async function runScenariosSequential(scenarios, config, verbose) {
    const results = new Map();
    for (const scenario of scenarios) {
        console.log(`\nRunning scenario: ${scenario.name}`);
        const result = await runScenario(scenario, config);
        results.set(scenario.id, result);
        if (verbose) {
            console.log(generateReport(result));
        }
        else {
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
    // Apply efficiency mode if requested
    if (args.efficiency) {
        console.log(`\n⚡ Efficiency mode enabled (max ${EFFICIENCY_MODE_MAX_TURNS} turns per scenario)`);
        scenarios = applyEfficiencyMode(scenarios);
    }
    console.log(`\n${"═".repeat(80)}`);
    console.log(`MPA MULTI-TURN EVALUATION`);
    console.log(`${"═".repeat(80)}`);
    console.log(`Scenarios to run: ${scenarios.length}`);
    console.log(`Mode: ${args.parallel ? "Parallel" : "Sequential"}${args.efficiency ? " + Efficiency" : ""}`);
    console.log(`Verbose: ${args.verbose}`);
    console.log(`Model: ${args.model || "claude-sonnet-4-20250514"}`);
    console.log(`Track KB Impact: ${args.trackKb}`);
    console.log("");
    // Load baseline
    let baseline = null;
    if (!args.skipBaselineComparison) {
        baseline = (0, baseline_tracker_js_1.loadBaseline)(BASELINE_PATH);
        if (baseline) {
            console.log(`📊 Loaded v5.7 baseline (${Object.keys(baseline.scenarioScores).length} scenarios)`);
        }
        else {
            console.log(`⚠️  No baseline found at ${BASELINE_PATH}`);
        }
    }
    const engineConfig = {
        verbose: args.verbose,
    };
    if (args.model) {
        engineConfig.agentModel = args.model;
    }
    if (args.promptVersion) {
        engineConfig.promptVersion = args.promptVersion;
    }
    const promptVersion = args.promptVersion || "v5_7_5";
    // Run scenarios
    let results;
    if (args.parallel) {
        results = await runScenariosParallel(scenarios, engineConfig, PARALLEL_CONCURRENCY, args.verbose);
    }
    else {
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
    let kbImpactReport;
    if (args.trackKb) {
        console.log("\n📚 Analyzing KB document impact...");
        const allKbUsage = [];
        const qualityScores = [];
        for (const [, result] of results) {
            for (const turn of result.turns) {
                // Track KB usage per turn
                // kbContentInjected contains the KB content strings
                const injectedDocs = turn.kbContentInjected || [];
                const usage = (0, kb_impact_tracker_js_1.trackKBUsage)(turn.agentResponse, injectedDocs, turn.currentStep, turn.turnNumber);
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
        const impactMetrics = (0, kb_impact_tracker_js_1.calculateKBImpactMetrics)(allKbUsage, qualityScores);
        const recommendations = (0, kb_impact_tracker_js_1.generateKBOptimizationRecommendations)(impactMetrics);
        kbImpactReport = (0, kb_impact_tracker_js_1.generateKBImpactReport)(impactMetrics, recommendations);
        // Save KB impact data
        (0, kb_impact_tracker_js_1.saveKBImpactData)(impactMetrics, promptVersion);
    }
    // Generate final summary
    const summary = generateFinalSummary(results, baseline, promptVersion, kbImpactReport);
    console.log("\n" + summary);
    // Save run summary
    saveRunSummary(results, runDir, baseline, promptVersion, kbImpactReport);
    console.log(`\n📁 Full test outputs saved to: ${runDir}`);
    // Save new baseline if requested
    if (args.saveBaseline) {
        const scenarioScores = {};
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
        const aggregates = (0, baseline_tracker_js_1.calculateAggregates)(scenarioScores);
        const newBaseline = {
            promptVersion,
            model: args.model || "claude-sonnet-4-20250514",
            timestamp: Date.now(),
            scenarioScores,
            ...aggregates,
        };
        (0, baseline_tracker_js_1.saveBaseline)(newBaseline, BASELINE_PATH);
        console.log(`\n✅ New baseline saved to ${BASELINE_PATH}`);
    }
    // Also run via Braintrust for logging
    await (0, braintrust_1.Eval)("MPA-Multi-Turn", {
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
                    ...index_js_1.SCENARIO_METADATA[scenario.id],
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
                    conversationScores: Object.fromEntries(Object.entries(cachedResult.conversationScores).map(([k, v]) => [k, v.score])),
                };
            }
            // Fallback to running scenario
            const scenario = (0, index_js_1.getScenarioById)(input.scenarioId);
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
                conversationScores: Object.fromEntries(Object.entries(result.conversationScores).map(([k, v]) => [k, v.score])),
            };
        },
        scores: [
            (args) => args.output.compositeScore,
        ],
    });
    console.log("\n✅ Evaluation complete!");
}
// Run if executed directly
main().catch(console.error);
//# sourceMappingURL=mpa-multi-turn-eval.js.map