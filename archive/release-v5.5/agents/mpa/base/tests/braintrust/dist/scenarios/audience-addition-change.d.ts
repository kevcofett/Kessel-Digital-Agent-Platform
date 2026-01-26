/**
 * Audience Addition Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation audience addition.
 * The user starts planning for one audience segment, then at turn 8 reveals
 * they need to add a second audience segment with different characteristics.
 *
 * The agent MUST:
 * 1. Acknowledge the additional audience segment explicitly
 * 2. Recalculate budget allocation and reach across both segments
 * 3. Explain what adding a segment means for strategy complexity
 * 4. Recommend approach for multi-audience planning
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for audience expansion.
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Financial services marketer adding audience segment
 */
export declare const audienceAdditionPersona: UserPersona;
/**
 * Audience Addition Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for audience expansion
 */
export declare const audienceAdditionChangeScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const audienceAdditionChangeContext: {
    budget: number;
    funnel: "consideration";
    kpiAggressiveness: "moderate";
    userSophistication: "high";
};
export default audienceAdditionChangeScenario;
//# sourceMappingURL=audience-addition-change.d.ts.map