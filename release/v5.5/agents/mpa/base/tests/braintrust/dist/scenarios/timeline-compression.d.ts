/**
 * Timeline Compression Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation timeline compression.
 * The user starts with a 12-month campaign timeline, then at turn 7 reveals
 * they need to compress it to 6 months.
 *
 * The agent MUST:
 * 1. Acknowledge the timeline compression
 * 2. Recalculate pacing requirements (2x monthly spend)
 * 3. Flag potential pacing challenges or market saturation risks
 * 4. Recommend adjusted channel mix or front-loading strategy
 *
 * This tests proactive reforecasting when constraints become tighter.
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Retail marketer with changing timeline
 */
export declare const timelineCompressionPersona: UserPersona;
/**
 * Timeline Compression Test Scenario
 *
 * Quality Focus: Proactive Reforecasting + Pacing Strategy
 */
export declare const timelineCompressionScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const timelineCompressionContext: {
    budget: number;
    funnel: "performance";
    kpiAggressiveness: "aggressive";
    userSophistication: "high";
};
export default timelineCompressionScenario;
//# sourceMappingURL=timeline-compression.d.ts.map