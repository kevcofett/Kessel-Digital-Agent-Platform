/**
 * Aggressive KPI Narrow Targeting Scenario
 *
 * Tests the agent's ability to handle aggressive efficiency targets that require
 * sacrificing volume for precision. The agent must guide the user to narrow down
 * audience, channel, and expectations to achieve the aggressive KPI.
 *
 * This scenario specifically tests:
 * 1. Agent recognizes the KPI is aggressive and validates feasibility
 * 2. Agent recommends narrowing audience to improve efficiency
 * 3. Agent suggests channel concentration over diversification
 * 4. Agent guides user to accept lower volume for better efficiency
 * 5. Agent calculates what's achievable with aggressive targets
 * 6. Agent doesn't just accept impossible targets without pushback
 *
 * Expected Quality Behaviors:
 * - Agent MUST challenge the aggressive $25 CAC target
 * - Agent SHOULD calculate what volume IS achievable at aggressive efficiency
 * - Agent MUST recommend audience narrowing strategies
 * - Agent SHOULD discuss channel efficiency tradeoffs
 * - Agent MUST help user understand volume vs efficiency tradeoff
 * - Agent SHOULD recommend test-and-scale approach
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Growth marketer with aggressive efficiency requirements
 */
export declare const aggressiveKpiPersona: UserPersona;
/**
 * Aggressive KPI Narrow Targeting Test Scenario
 */
export declare const aggressiveKpiNarrowTargetingScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const aggressiveKpiNarrowTargetingContext: {
    budget: number;
    funnel: "performance";
    kpiAggressiveness: "aggressive";
    userSophistication: "high";
};
export default aggressiveKpiNarrowTargetingScenario;
//# sourceMappingURL=aggressive-kpi-narrow-targeting.d.ts.map