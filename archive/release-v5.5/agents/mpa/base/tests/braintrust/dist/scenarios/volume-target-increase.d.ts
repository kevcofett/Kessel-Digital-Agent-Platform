/**
 * Volume Target Increase Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation volume target increase.
 * The user starts targeting 5,000 customers, then at turn 8 reveals the target
 * has been increased to 8,000 customers.
 *
 * The agent MUST:
 * 1. Acknowledge the volume target change explicitly
 * 2. Recalculate efficiency requirements (new implied CAC)
 * 3. Flag if the new target may be unrealistic with current budget
 * 4. Recommend strategy changes (broader targeting, different channels)
 *
 * This tests proactive reforecasting when targets become more aggressive.
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * E-commerce marketer with changing volume targets
 */
export declare const volumeTargetIncreasePersona: UserPersona;
/**
 * Volume Target Increase Test Scenario
 *
 * Quality Focus: Proactive Reforecasting + Critical Thinking
 */
export declare const volumeTargetIncreaseScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const volumeTargetIncreaseContext: {
    budget: number;
    funnel: "performance";
    kpiAggressiveness: "aggressive";
    userSophistication: "medium";
};
export default volumeTargetIncreaseScenario;
//# sourceMappingURL=volume-target-increase.d.ts.map