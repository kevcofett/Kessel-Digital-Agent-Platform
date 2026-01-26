/**
 * Mass National Simplicity Scenario
 *
 * Tests the agent's ability to handle a simple, broad-reach national campaign
 * with minimal complexity. This is the opposite of precision targeting.
 *
 * This scenario specifically tests:
 * 1. Agent recognizes when simplicity is appropriate
 * 2. Agent doesn't over-complicate a straightforward mass-market campaign
 * 3. Agent recommends reach/frequency over precision for awareness goals
 * 4. Agent correctly advises on national vs regional tradeoffs
 * 5. Agent focuses on broad demographic buckets, not micro-segmentation
 * 6. Agent discusses CPM efficiency for mass reach
 *
 * Expected Quality Behaviors:
 * - Agent should NOT try to micro-segment a mass audience
 * - Agent SHOULD focus on reach, frequency, and awareness metrics
 * - Agent SHOULD recommend broad-reach channels (TV, mass display, YouTube)
 * - Agent MUST NOT obsess over CAC/conversion for awareness campaign
 * - Agent SHOULD discuss national media buying efficiency
 * - Agent SHOULD keep geographic strategy simple (national buy)
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Brand marketing director with simple national campaign needs
 */
export declare const massNationalPersona: UserPersona;
/**
 * Mass National Simplicity Test Scenario
 */
export declare const massNationalSimplicityScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const massNationalSimplicityContext: {
    budget: number;
    funnel: "awareness";
    kpiAggressiveness: "conservative";
    userSophistication: "medium";
};
export default massNationalSimplicityScenario;
//# sourceMappingURL=mass-national-simplicity.d.ts.map