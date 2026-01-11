/**
 * Budget Revision Midstream Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation budget increase.
 * The user starts with a $500K budget, then at turn 6 reveals the budget
 * has been increased to $750K.
 *
 * The agent MUST:
 * 1. Acknowledge the budget change explicitly
 * 2. Recalculate affected metrics (CAC projection, channel allocations)
 * 3. Explain what the extra $250K enables strategically
 * 4. Recommend how to allocate the additional budget
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement.
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Mid-market SaaS marketer with evolving budget
 */
export declare const budgetRevisionPersona: UserPersona;
/**
 * Budget Revision Midstream Test Scenario
 *
 * Quality Focus: Proactive Reforecasting
 */
export declare const budgetRevisionMidstreamScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const budgetRevisionMidstreamContext: {
    budget: number;
    funnel: "performance";
    kpiAggressiveness: "moderate";
    userSophistication: "medium";
};
export default budgetRevisionMidstreamScenario;
//# sourceMappingURL=budget-revision-midstream.d.ts.map