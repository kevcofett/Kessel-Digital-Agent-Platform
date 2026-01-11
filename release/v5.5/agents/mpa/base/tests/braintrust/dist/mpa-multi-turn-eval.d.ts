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
import { TestScenario, ConversationResult, ConversationEngineConfig } from "./mpa-multi-turn-types.js";
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
declare function parseArgs(): EvalArgs;
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
    planQualityScore: number;
    dataCompleteness: number;
    feasibilityAssessment: number;
    riskIdentification: number;
    mentorshipScore: number;
    explanationClarity: number;
    calculationTransparency: number;
    userGrowth: number;
    turnsPerDirectiveAchievement: number;
    tokensPerInsight: number;
    stepsPerDecisionPoint: number;
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
declare function calculatePrimeDirectiveEfficiency(result: ConversationResult): PrimeDirectiveScore;
/**
 * Generate detailed report for a conversation result
 */
declare function generateReport(result: ConversationResult): string;
/**
 * Run a single scenario and return results
 */
declare function runScenario(scenario: TestScenario, config: Partial<ConversationEngineConfig>): Promise<ConversationResult>;
/**
 * Run scenarios in parallel with concurrency limit
 */
declare function runScenariosParallel(scenarios: TestScenario[], config: Partial<ConversationEngineConfig>, concurrency: number, verbose: boolean): Promise<Map<string, ConversationResult>>;
/**
 * Run scenarios sequentially
 */
declare function runScenariosSequential(scenarios: TestScenario[], config: Partial<ConversationEngineConfig>, verbose: boolean): Promise<Map<string, ConversationResult>>;
export { runScenario, generateReport, parseArgs, calculatePrimeDirectiveEfficiency, runScenariosParallel, runScenariosSequential, };
//# sourceMappingURL=mpa-multi-turn-eval.d.ts.map