/**
 * Behavioral Targeting Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation behavioral targeting change.
 * The user starts planning for broad "fitness enthusiasts", then at turn 7 reveals
 * they want to target specific behaviors: marathon runners preparing for races.
 *
 * The agent MUST:
 * 1. Acknowledge the behavioral targeting refinement explicitly
 * 2. Recalculate audience size and efficiency estimates
 * 3. Explain what narrower behavioral targeting means for reach and cost
 * 4. Recommend targeting approach and channels best for behavioral signals
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for behavioral targeting changes.
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Sports nutrition marketer with evolving behavioral focus
 */
export declare const behavioralTargetingPersona: UserPersona;
/**
 * Behavioral Targeting Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for behavioral targeting changes
 */
export declare const behavioralTargetingChangeScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const behavioralTargetingChangeContext: {
    budget: number;
    funnel: "performance";
    kpiAggressiveness: "moderate";
    userSophistication: "high";
};
export default behavioralTargetingChangeScenario;
//# sourceMappingURL=behavioral-targeting-change.d.ts.map