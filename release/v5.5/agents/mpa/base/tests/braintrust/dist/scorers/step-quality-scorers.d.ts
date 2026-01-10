/**
 * Step Quality Scorers for Quality-Focused MPA Evaluation
 *
 * Phase 1 Scorers: Context-aware step quality evaluation.
 * Requirements scale based on budget, funnel type, and KPI aggressiveness.
 */
import { TurnScore } from "../mpa-multi-turn-types.js";
export interface ScenarioContext {
    budget: number;
    funnel: "awareness" | "consideration" | "performance";
    kpiAggressiveness: "conservative" | "moderate" | "aggressive";
    userSophistication: "low" | "medium" | "high";
}
export interface StepRequirements {
    minDataPoints: number;
    requiresCalculation: boolean;
    minTurns: number;
    requiresSynthesis: boolean;
}
export interface StepQualityInput {
    stepNumber: number;
    turnsInStep: number;
    dataPointsCollected: string[];
    calculationsPerformed: string[];
    insightsGenerated: string[];
    agentResponses: string[];
}
/**
 * Get context-aware step requirements
 */
export declare function getStepRequirements(step: number, context: ScenarioContext): StepRequirements;
/**
 * Score step quality using LLM-as-judge
 */
export declare function scoreStepQuality(input: StepQualityInput, context: ScenarioContext): Promise<TurnScore>;
/**
 * Score step data collection completeness (Rule-based)
 *
 * Checks if minimum viable data was collected before step transition.
 */
export declare function scoreStepDataCompleteness(input: StepQualityInput, context: ScenarioContext): TurnScore;
/**
 * Score step turn efficiency (Rule-based)
 *
 * Checks if appropriate time was spent on the step given context.
 */
export declare function scoreStepTurnEfficiency(input: StepQualityInput, context: ScenarioContext): TurnScore;
/**
 * Score step synthesis quality (Rule-based with pattern matching)
 *
 * For steps > 4, checks if agent referenced earlier step insights.
 */
export declare function scoreStepSynthesis(input: StepQualityInput, priorStepInsights: Record<number, string[]>): TurnScore;
/**
 * Calculate overall step quality score from individual components
 */
export declare function calculateStepQualityScore(scores: Record<string, TurnScore>): number;
/**
 * Score all step quality dimensions when transitioning out of a step
 */
export declare function scoreStepTransitionQuality(input: StepQualityInput, context: ScenarioContext, priorStepInsights: Record<number, string[]>): Promise<Record<string, TurnScore>>;
export default scoreStepTransitionQuality;
//# sourceMappingURL=step-quality-scorers.d.ts.map