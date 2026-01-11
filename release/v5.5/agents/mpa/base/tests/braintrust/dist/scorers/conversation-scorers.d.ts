/**
 * Conversation-Level Scorers for Multi-Turn MPA Evaluation
 *
 * Scorers that are applied once to the complete conversation.
 */
import { ConversationTurn, TestScenario, ConversationEvent, FailureCondition, TurnScore } from "../mpa-multi-turn-types.js";
/**
 * Score step completion rate
 */
export declare function scoreStepCompletionRate(turns: ConversationTurn[], scenario: TestScenario): TurnScore;
/**
 * Score conversation efficiency (turns vs expected)
 *
 * Rewards efficient conversations that complete steps without unnecessary turns.
 * A conversation that completes 10 steps in 13 turns is excellent.
 *
 * IMPORTANT: When the maxAllowed cap is an artificial global limit (like efficiency
 * mode's 20-turn cap) that's below the scenario's natural minTurns, hitting that
 * cap is not the agent's fault and should not be harshly penalized.
 */
export declare function scoreConversationEfficiency(turns: ConversationTurn[], scenario: TestScenario): TurnScore;
/**
 * Score context retention (references previously collected data)
 *
 * Improved to detect both numeric data and textual concept references.
 * In a natural conversation, the agent builds on previous information.
 */
export declare function scoreContextRetention(turns: ConversationTurn[]): TurnScore;
/**
 * Score greeting uniqueness (greeting should appear only once)
 */
export declare function scoreGreetingUniqueness(turns: ConversationTurn[]): TurnScore;
/**
 * Score loop detection (no repeated questions)
 */
export declare function scoreLoopDetection(turns: ConversationTurn[]): TurnScore;
/**
 * Calculate failure penalty
 */
export declare function calculateFailurePenalty(failures: {
    warnings: FailureCondition[];
    major: FailureCondition[];
    critical: FailureCondition[];
}): TurnScore;
/**
 * Score step transition quality
 */
export declare function scoreStepTransitionQuality(turns: ConversationTurn[]): Promise<TurnScore>;
/**
 * Score overall conversation coherence
 */
export declare function scoreOverallCoherence(turns: ConversationTurn[], scenario: TestScenario): Promise<TurnScore>;
/**
 * Score the complete conversation
 */
export declare function scoreConversation(turns: ConversationTurn[], scenario: TestScenario, events: ConversationEvent[], failures: {
    warnings: FailureCondition[];
    major: FailureCondition[];
    critical: FailureCondition[];
}): Promise<Record<string, TurnScore>>;
export default scoreConversation;
//# sourceMappingURL=conversation-scorers.d.ts.map