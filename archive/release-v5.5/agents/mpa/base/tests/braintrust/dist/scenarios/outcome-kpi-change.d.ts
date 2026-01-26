/**
 * Outcome KPI Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation outcome KPI change.
 * The user starts planning for customer acquisition, then at turn 8 reveals
 * the goal has shifted to brand awareness due to competitive pressure.
 *
 * The agent MUST:
 * 1. Acknowledge the KPI/objective shift explicitly
 * 2. Recalculate channel mix for awareness vs. acquisition
 * 3. Explain what the objective change means for media strategy
 * 4. Recommend awareness-focused channels and metrics
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for fundamental outcome/KPI changes.
 */
import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";
/**
 * Insurance marketer with shifting objectives
 */
export declare const outcomeKPIPersona: UserPersona;
/**
 * Outcome KPI Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for objective/KPI changes
 */
export declare const outcomeKPIChangeScenario: TestScenario;
/**
 * Context configuration for quality scoring
 */
export declare const outcomeKPIChangeContext: {
    budget: number;
    funnel: "awareness";
    kpiAggressiveness: "moderate";
    userSophistication: "high";
};
export default outcomeKPIChangeScenario;
//# sourceMappingURL=outcome-kpi-change.d.ts.map