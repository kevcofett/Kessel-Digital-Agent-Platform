/**
 * Demographic Shift Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation demographic change.
 * The user starts planning for Millennials (25-40), then at turn 8 reveals
 * research shows Gen Z (18-27) is the actual growth opportunity.
 *
 * The agent MUST:
 * 1. Acknowledge the demographic shift explicitly
 * 2. Recalculate channel recommendations for the new demo
 * 3. Explain what targeting Gen Z vs Millennials means for channel mix
 * 4. Recommend specific channel and creative adjustments
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for demographic targeting changes.
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Fashion brand marketer with evolving target demo
 */
export declare const demographicShiftPersona: UserPersona;
/**
 * Demographic Shift Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for demographic changes
 */
export declare const demographicShiftChangeScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const demographicShiftChangeContext: {
    budget: number;
    funnel: "awareness";
    kpiAggressiveness: "moderate";
    userSophistication: "medium";
};
export default demographicShiftChangeScenario;
//# sourceMappingURL=demographic-shift-change.d.ts.map