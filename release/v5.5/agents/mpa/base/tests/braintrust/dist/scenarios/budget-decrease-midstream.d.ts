/**
 * Budget Decrease Midstream Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation budget CUT.
 * The user starts with a $1M budget, then at turn 7 reveals the budget
 * has been cut to $600K due to company-wide cost reduction.
 *
 * The agent MUST:
 * 1. Acknowledge the budget cut explicitly
 * 2. Recalculate affected metrics (CAC becomes more aggressive)
 * 3. Explain what the cut means strategically (trade-offs, reduced reach)
 * 4. Recommend prioritization - what to cut vs. keep
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * in a NEGATIVE change scenario (harder than increases).
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Enterprise tech marketer facing budget cuts
 */
export declare const budgetDecreasePersona: UserPersona;
/**
 * Budget Decrease Midstream Test Scenario
 *
 * Quality Focus: Proactive Reforecasting under constraint
 */
export declare const budgetDecreaseMidstreamScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const budgetDecreaseMidstreamContext: {
    budget: number;
    funnel: "performance";
    kpiAggressiveness: "aggressive";
    userSophistication: "high";
};
export default budgetDecreaseMidstreamScenario;
//# sourceMappingURL=budget-decrease-midstream.d.ts.map