/**
 * Mentorship Scorers for Quality-Focused MPA Evaluation
 *
 * Phase 1 Scorers: Evaluate guidance quality, not just step completion.
 * These scorers measure whether the agent TAUGHT and GUIDED the user,
 * rather than simply interrogating them.
 */
import { TurnScore } from "../mpa-multi-turn-types.js";
/**
 * Score teaching behavior (LLM-as-judge)
 *
 * Evaluates whether the agent explains WHY questions matter,
 * rather than just asking them in checklist fashion.
 */
export declare function scoreTeachingBehavior(agentResponse: string, currentStep: number): Promise<TurnScore>;
/**
 * Score proactive calculation (Hybrid: regex + LLM validation)
 *
 * Checks if the agent performed calculations when data was available,
 * rather than asking for more info it could derive itself.
 */
export declare function scoreProactiveCalculation(agentResponse: string, availableData: {
    hasBudget: boolean;
    budget?: number;
    hasVolume: boolean;
    volumeTarget?: number;
}): TurnScore;
/**
 * Score benchmark citation (Rule-based)
 *
 * Checks if the agent cited industry benchmarks or KB data
 * when making claims or providing guidance.
 */
export declare function scoreBenchmarkCitation(agentResponse: string, stepContext: {
    currentStep: number;
    hasDataClaims: boolean;
}): TurnScore;
/**
 * Score critical thinking (LLM-as-judge)
 *
 * Evaluates whether the agent challenged unrealistic inputs
 * and validated user-provided assumptions.
 */
export declare function scoreCriticalThinking(userInput: string, agentResponse: string, context: {
    userSophistication: string;
    budget?: number;
    volumeTarget?: number;
    impliedEfficiency?: number;
}): Promise<TurnScore>;
/**
 * Score strategic synthesis (LLM-as-judge)
 *
 * Evaluates whether the agent connected current step insights
 * to the overall plan and referenced earlier collected data.
 */
export declare function scoreStrategicSynthesis(agentResponse: string, conversationContext: {
    currentStep: number;
    priorInsights: string[];
    collectedData: Record<string, unknown>;
}): Promise<TurnScore>;
/**
 * Calculate mentorship category score from individual scorers
 */
export declare function calculateMentorshipScore(scores: Record<string, TurnScore>): number;
/**
 * Score all mentorship dimensions for a turn
 */
export declare function scoreMentorship(userMessage: string, agentResponse: string, context: {
    currentStep: number;
    userSophistication: string;
    budget?: number;
    volumeTarget?: number;
    priorInsights: string[];
    collectedData: Record<string, unknown>;
}): Promise<Record<string, TurnScore>>;
export default scoreMentorship;
//# sourceMappingURL=mentorship-scorers.d.ts.map