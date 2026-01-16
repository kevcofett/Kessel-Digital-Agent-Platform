/**
 * Multi-Audience Channel Allocation Scenario
 *
 * Advanced complexity: Multiple target audiences with different channel
 * allocations for each. This builds on multi-audience-unified-plan by adding
 * the complexity of segment-specific media mix recommendations.
 *
 * This scenario specifically tests:
 * 1. Agent can recommend different channel mixes per segment
 * 2. Agent justifies channel selections based on segment attributes
 * 3. Agent handles budget allocation both by segment AND by channel
 * 4. Agent discusses creative/messaging needs per channel per segment
 * 5. Agent maintains coherence across complex multi-dimensional plan
 * 6. Agent can calculate and present multi-layered budget breakdowns
 *
 * Expected Quality Behaviors:
 * - Agent MUST recommend different channels for different segments
 * - Agent SHOULD justify channel choices based on segment behaviors
 * - Agent MUST NOT recommend identical channel mixes for distinct segments
 * - Agent SHOULD show budget breakdown by segment AND by channel
 * - Agent MUST maintain tracking/measurement approach per segment-channel
 * - Agent SHOULD discuss creative requirements per segment-channel combo
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * VP Marketing with complex multi-segment, multi-channel requirements
 */
export declare const multiAudienceChannelPersona: UserPersona;
/**
 * Multi-Audience Channel Allocation Test Scenario
 */
export declare const multiAudienceChannelAllocationScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const multiAudienceChannelAllocationContext: {
    budget: number;
    funnel: "performance";
    kpiAggressiveness: "moderate";
    userSophistication: "high";
};
export default multiAudienceChannelAllocationScenario;
//# sourceMappingURL=multi-audience-channel-allocation.d.ts.map