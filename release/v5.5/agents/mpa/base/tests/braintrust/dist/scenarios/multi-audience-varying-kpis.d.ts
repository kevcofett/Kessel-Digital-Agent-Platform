/**
 * Multi-Audience Varying KPIs Scenario
 *
 * Tests the agent's ability to handle multiple target audiences where each
 * segment has DIFFERENT primary KPIs and success metrics. This is the most
 * complex multi-audience scenario, combining:
 * - Different audiences with distinct attributes
 * - Different KPI objectives per segment
 * - Different measurement approaches per segment
 * - Different channel strategies per segment
 *
 * This scenario specifically tests:
 * 1. Agent tracks different KPIs for different segments
 * 2. Agent doesn't apply a single KPI across all segments
 * 3. Agent discusses appropriate metrics per segment objective
 * 4. Agent handles mixed awareness + performance goals
 * 5. Agent maintains clarity on segment-KPI-channel relationships
 * 6. Agent calculates targets using segment-appropriate metrics
 *
 * Expected Quality Behaviors:
 * - Agent MUST acknowledge different KPIs per segment
 * - Agent SHOULD NOT apply CAC to awareness segment
 * - Agent SHOULD NOT apply reach/frequency to performance segment
 * - Agent MUST recommend measurement approach per segment-KPI
 * - Agent SHOULD discuss how to report across heterogeneous objectives
 * - Agent MUST calculate segment-specific targets appropriately
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * CMO with multi-segment, multi-KPI campaign requirements
 */
export declare const multiAudienceVaryingKpisPersona: UserPersona;
/**
 * Multi-Audience Varying KPIs Test Scenario
 */
export declare const multiAudienceVaryingKpisScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const multiAudienceVaryingKpisContext: {
    budget: number;
    funnel: "consideration";
    kpiAggressiveness: "moderate";
    userSophistication: "high";
};
export default multiAudienceVaryingKpisScenario;
//# sourceMappingURL=multi-audience-varying-kpis.d.ts.map