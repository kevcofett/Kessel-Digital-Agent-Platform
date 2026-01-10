/**
 * Per-Turn Scorers for Multi-Turn MPA Evaluation
 *
 * Scorers that are applied to each individual turn.
 */
import { TurnScore, StepTrackingState } from "../mpa-multi-turn-types.js";
/**
 * Score response length
 *
 * Scoring is lenient for longer responses as long as they add value.
 * - Under 100 words: optimal (1.0)
 * - 100-200 words: acceptable (0.8)
 * - 200-300 words: slightly verbose (0.5)
 * - Over 300 words: too long (0.2)
 */
export declare function scoreResponseLength(output: string): TurnScore;
/**
 * Score question discipline
 *
 * Two-part questions are acceptable when focused on the immediate step.
 * - 0-1 questions: optimal (1.0)
 * - 2 questions: acceptable (0.8) - allows focused two-part questions
 * - 3 questions: slightly excessive (0.4)
 * - 4+ questions: too many (0)
 */
export declare function scoreSingleQuestion(output: string): TurnScore;
/**
 * Score step boundary compliance (no channels in Steps 1-2)
 */
export declare function scoreStepBoundary(output: string, currentStep: number): TurnScore;
/**
 * Score source citation (data claims should have sources)
 *
 * More lenient scoring - the agent often naturally integrates user data
 * without explicit citation phrases. We look for contextual indicators.
 */
export declare function scoreSourceCitation(output: string): TurnScore;
/**
 * Score acronym definition (acronyms must be defined on first use)
 */
export declare function scoreAcronymDefinition(output: string): TurnScore;
/**
 * Score IDK protocol compliance
 */
export declare function scoreIdkProtocol(input: string, output: string): TurnScore;
/**
 * Score adaptive sophistication (language matches user level)
 */
export declare function scoreAdaptiveSophistication(input: string, output: string, userLevel: string): Promise<TurnScore>;
/**
 * Score proactive intelligence (does math when data is available)
 */
export declare function scoreProactiveIntelligence(input: string, output: string, hasEnoughData: boolean): Promise<TurnScore>;
/**
 * Score progress over perfection (keeps momentum vs blocking)
 */
export declare function scoreProgressOverPerfection(input: string, output: string): Promise<TurnScore>;
/**
 * Score risk and opportunity flagging
 *
 * Checks if the agent proactively identifies and communicates risks,
 * opportunities, or important considerations to the user.
 */
export declare function scoreRiskOpportunityFlagging(input: string, output: string, currentStep: number): Promise<TurnScore>;
/**
 * Score calculation and modeling presence
 *
 * Code-based check for whether the response contains calculations,
 * projections, or mathematical modeling.
 */
export declare function scoreCalculationPresence(output: string): TurnScore;
/**
 * Score a single turn with all applicable scorers
 */
export declare function scoreTurn(userMessage: string, agentResponse: string, currentStep: number, stepState: StepTrackingState, userSophistication: string): Promise<Record<string, TurnScore>>;
export default scoreTurn;
//# sourceMappingURL=turn-scorers.d.ts.map