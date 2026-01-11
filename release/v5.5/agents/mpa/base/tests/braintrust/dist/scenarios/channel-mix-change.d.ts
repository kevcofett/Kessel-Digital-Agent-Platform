/**
 * Channel Mix Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation channel constraint.
 * The user starts planning with all channels available, then at turn 8 reveals
 * that social media channels (Meta, TikTok) are off the table due to brand safety.
 *
 * The agent MUST:
 * 1. Acknowledge the channel exclusion explicitly
 * 2. Recalculate channel allocations without social
 * 3. Explain what losing social channels means for reach/efficiency
 * 4. Recommend alternative channels to compensate
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for channel mix changes.
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * CPG brand manager with channel constraints
 */
export declare const channelMixChangePersona: UserPersona;
/**
 * Channel Mix Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for channel constraints
 */
export declare const channelMixChangeScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const channelMixChangeContext: {
    budget: number;
    funnel: "awareness";
    kpiAggressiveness: "moderate";
    userSophistication: "medium";
};
export default channelMixChangeScenario;
//# sourceMappingURL=channel-mix-change.d.ts.map