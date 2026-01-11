/**
 * Audience Removal Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation audience reduction.
 * The user starts planning for three audience segments, then at turn 8 reveals
 * they need to cut one segment due to budget constraints.
 *
 * The agent MUST:
 * 1. Acknowledge the audience reduction explicitly
 * 2. Recalculate budget reallocation to remaining segments
 * 3. Explain what removing a segment enables for remaining ones
 * 4. Recommend which segment to prioritize and why
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for audience consolidation.
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Automotive marketer consolidating audience segments
 */
export declare const audienceRemovalPersona: UserPersona;
/**
 * Audience Removal Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for audience consolidation
 */
export declare const audienceRemovalChangeScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const audienceRemovalChangeContext: {
    budget: number;
    funnel: "consideration";
    kpiAggressiveness: "moderate";
    userSophistication: "medium";
};
export default audienceRemovalChangeScenario;
//# sourceMappingURL=audience-removal-change.d.ts.map