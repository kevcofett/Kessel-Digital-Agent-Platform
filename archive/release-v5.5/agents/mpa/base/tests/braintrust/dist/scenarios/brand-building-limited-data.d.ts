/**
 * Brand Building with Limited Data Scenario
 *
 * Phase 1 Quality Test Scenario
 *
 * Tests the agent's ability to handle a brand awareness campaign with
 * limited first-party data. This scenario specifically tests:
 *
 * 1. IDK Protocol handling - Does agent model with assumptions when user doesn't know?
 * 2. Teaching behavior - Does agent explain brand metrics vs performance metrics?
 * 3. Benchmark citation - Does agent cite industry awareness campaign benchmarks?
 * 4. Strategic synthesis - Does agent adjust approach for awareness vs performance?
 * 5. Proactive intelligence - Does agent recommend appropriate measurement approaches?
 *
 * Expected Quality Behaviors:
 * - Agent should NOT obsess over CAC/efficiency for awareness campaigns
 * - Agent MUST model with stated assumptions when data is missing
 * - Agent SHOULD explain why brand metrics differ from performance metrics
 * - Agent SHOULD recommend reach/frequency/brand lift measurement
 * - Agent MUST NOT ask 10+ questions about unit economics for awareness
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Basic marketing manager persona entering new market with brand awareness goal
 */
export declare const brandBuildingLimitedDataPersona: UserPersona;
/**
 * Brand Building with Limited Data Test Scenario
 *
 * Quality Focus: Teaching + IDK Handling + Funnel-Appropriate Guidance
 */
export declare const brandBuildingLimitedDataScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const brandBuildingLimitedDataContext: {
    budget: number;
    funnel: "awareness";
    kpiAggressiveness: "moderate";
    userSophistication: "medium";
};
export default brandBuildingLimitedDataScenario;
//# sourceMappingURL=brand-building-limited-data.d.ts.map