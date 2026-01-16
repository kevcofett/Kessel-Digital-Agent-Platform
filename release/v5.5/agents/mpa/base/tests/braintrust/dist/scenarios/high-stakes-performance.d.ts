/**
 * High-Stakes Performance Scenario
 *
 * Phase 1 Quality Test Scenario
 *
 * Tests the agent's ability to handle a high-budget ($2M), aggressive-target
 * performance campaign. This scenario specifically tests:
 *
 * 1. Critical thinking - Does agent challenge the aggressive $40 CAC target?
 * 2. Proactive calculation - Does agent compute implied efficiency immediately?
 * 3. Teaching behavior - Does agent explain why targets may be unrealistic?
 * 4. Benchmark citation - Does agent reference industry norms for fintech?
 * 5. Strategic synthesis - Does agent connect early insights to later steps?
 *
 * Expected Quality Behaviors:
 * - Agent MUST calculate $2M / 50,000 = $40 CAC proactively
 * - Agent SHOULD challenge $40 CAC as aggressive for fintech (typical $80-150)
 * - Agent SHOULD cite benchmarks when discussing efficiency
 * - Agent MUST NOT accept aggressive targets without validation
 * - Agent SHOULD teach user about realistic efficiency expectations
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Sophisticated fintech VP persona with aggressive growth targets
 */
export declare const highStakesPerformancePersona: UserPersona;
/**
 * High-Stakes Performance Test Scenario
 *
 * Quality Focus: Mentorship + Critical Thinking + Plan Coherence
 */
export declare const highStakesPerformanceScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const highStakesPerformanceContext: {
    budget: number;
    funnel: "performance";
    kpiAggressiveness: "aggressive";
    userSophistication: "high";
};
export default highStakesPerformanceScenario;
//# sourceMappingURL=high-stakes-performance.d.ts.map