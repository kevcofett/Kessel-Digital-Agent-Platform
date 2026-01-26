/**
 * Multi-Audience Unified Plan Scenario
 *
 * Tests the agent's ability to handle multiple distinct target audiences
 * within a single media plan. Each audience has different geo, demographic,
 * behavioral, and contextual signals, but shares the overall budget.
 *
 * This scenario specifically tests:
 * 1. Agent can track and define multiple distinct audience segments
 * 2. Agent keeps each segment's geo+demo+behavior+context signals separate
 * 3. Agent helps allocate budget across segments appropriately
 * 4. Agent doesn't conflate or merge distinct audience definitions
 * 5. Agent discusses how to measure performance per segment
 * 6. Agent handles complexity without getting confused
 *
 * Expected Quality Behaviors:
 * - Agent MUST define each audience segment separately and clearly
 * - Agent SHOULD recommend budget allocation rationale per segment
 * - Agent MUST NOT merge distinct audience attributes
 * - Agent SHOULD discuss segment-specific targeting strategies
 * - Agent MUST maintain clarity on which signals apply to which segment
 * - Agent SHOULD recommend segment-level measurement approach
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Marketing director with multi-segment campaign requirements
 */
export declare const multiAudienceUnifiedPersona: UserPersona;
/**
 * Multi-Audience Unified Plan Test Scenario
 */
export declare const multiAudienceUnifiedPlanScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const multiAudienceUnifiedPlanContext: {
    budget: number;
    funnel: "performance";
    kpiAggressiveness: "moderate";
    userSophistication: "high";
};
export default multiAudienceUnifiedPlanScenario;
//# sourceMappingURL=multi-audience-unified-plan.d.ts.map