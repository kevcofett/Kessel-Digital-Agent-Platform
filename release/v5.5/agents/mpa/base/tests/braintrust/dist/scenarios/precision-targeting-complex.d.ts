/**
 * Precision Targeting Complex Scenario
 *
 * Tests the agent's ability to handle highly complex geographic, behavioral,
 * demographic, and contextual attributes needed to shape a campaign with precision.
 *
 * This scenario specifically tests:
 * 1. Multi-layered audience definition with demographic, behavioral, and contextual signals
 * 2. Complex geographic targeting with DMA-level specificity
 * 3. Behavioral segmentation beyond basic demographics
 * 4. Contextual targeting considerations (dayparting, device, environment)
 * 5. First-party data integration with third-party enrichment
 * 6. Lookalike/similar audience expansion strategies
 *
 * Expected Quality Behaviors:
 * - Agent MUST unpack the complex audience into actionable segments
 * - Agent SHOULD recommend precision targeting strategies for each segment
 * - Agent MUST address geographic nuances (urban vs suburban, regional differences)
 * - Agent SHOULD discuss behavioral signals beyond demographics
 * - Agent MUST calculate reach vs precision tradeoffs
 * - Agent SHOULD recommend test structures for targeting hypotheses
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Expert performance marketer with complex targeting requirements
 */
export declare const precisionTargetingPersona: UserPersona;
/**
 * Precision Targeting Complex Test Scenario
 */
export declare const precisionTargetingComplexScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const precisionTargetingComplexContext: {
    budget: number;
    funnel: "performance";
    kpiAggressiveness: "moderate";
    userSophistication: "high";
};
export default precisionTargetingComplexScenario;
//# sourceMappingURL=precision-targeting-complex.d.ts.map