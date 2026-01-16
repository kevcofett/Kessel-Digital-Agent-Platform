/**
 * Geography Expansion Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation geography expansion.
 * The user starts planning for US-only, then at turn 7 reveals they need to
 * add Canada and Mexico to support new retail distribution.
 *
 * The agent MUST:
 * 1. Acknowledge the geography expansion explicitly
 * 2. Recalculate reach estimates and budget allocation by market
 * 3. Explain what adding markets means for budget efficiency and complexity
 * 4. Recommend market prioritization and allocation strategy
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for geography changes.
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Retail brand expanding internationally
 */
export declare const geoExpansionPersona: UserPersona;
/**
 * Geography Expansion Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for geography changes
 */
export declare const geoExpansionChangeScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const geoExpansionChangeContext: {
    budget: number;
    funnel: "consideration";
    kpiAggressiveness: "moderate";
    userSophistication: "medium";
};
export default geoExpansionChangeScenario;
//# sourceMappingURL=geo-expansion-change.d.ts.map