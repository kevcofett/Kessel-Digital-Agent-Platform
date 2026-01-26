/**
 * Efficiency Shock Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation efficiency revelation.
 * The agent calculates an implied CAC from the user's inputs, then the user
 * reveals that industry constraints make that CAC impossible.
 *
 * The agent MUST:
 * 1. Acknowledge the efficiency constraint revelation
 * 2. Offer to remodel with realistic efficiency parameters
 * 3. Explain what targets need to change (volume or budget)
 * 4. Walk through trade-off options clearly
 *
 * This tests proactive reforecasting when underlying assumptions are invalidated.
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Insurance marketer facing CAC reality check
 */
export declare const efficiencyShockPersona: UserPersona;
/**
 * Efficiency Shock Test Scenario
 *
 * Quality Focus: Proactive Reforecasting + Trade-off Analysis
 */
export declare const efficiencyShockScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const efficiencyShockContext: {
    budget: number;
    funnel: "performance";
    kpiAggressiveness: "aggressive";
    userSophistication: "medium";
};
export default efficiencyShockScenario;
//# sourceMappingURL=efficiency-shock.d.ts.map