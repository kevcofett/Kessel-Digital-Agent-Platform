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
import { TestScenario, ConversationResult, ConversationEngineConfig } from "./mpa-multi-turn-types.js";
interface EvalArgs {
    scenario?: string;
    category: "quick" | "full" | "all";
    verbose: boolean;
    model?: string;
    promptVersion?: string;
    parallel: boolean;
    efficiency: boolean;
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