/**
 * Failure Detector for Multi-Turn MPA Evaluation
 *
 * Detects conversation failures like loops, context loss, and greeting repetition.
 */
import { ConversationTurn, FailureCondition } from "./mpa-multi-turn-types.js";
/**
 * Built-in failure patterns
 *
 * PHILOSOPHY: Detect actual behavioral failures, not natural thorough discovery.
 *
 * TRUE FAILURES:
 * - Asking the EXACT same question repeatedly (agent stuck in loop)
 * - Asking 3+ questions in a row WITHOUT teaching (interrogation)
 * - Recommending channel strategy before Step 7 (premature tactics)
 *
 * NOT FAILURES:
 * - Asking multiple related questions with teaching/explanation
 * - Referencing channels for economic validation
 * - Thorough discovery to achieve KPI objectives
 */
export declare const BUILTIN_FAILURES: FailureCondition[];
/**
 * Failure Detector class
 *
 * Detects actual behavioral failures, not natural thorough discovery.
 * The philosophy is to distinguish between:
 * - TRUE failures: Agent stuck in loop, interrogating without teaching
 * - NOT failures: Thorough discovery to achieve KPI objectives
 */
export declare class FailureDetector {
    private providedData;
    private previousUserSaidIDK;
    private idkTopic;
    /**
     * Reset detector state for a new conversation
     */
    reset(): void;
    /**
     * Detect failures in a turn
     */
    detectFailures(turnNumber: number, agentResponse: string, previousTurns: ConversationTurn[], customFailures: FailureCondition[] | undefined, currentStep?: number, userSaidIDK?: boolean): FailureCondition[];
    /**
     * Update provided data from conversation history
     */
    private updateProvidedData;
    /**
     * Check if a specific failure condition is met
     */
    private checkFailure;
    /**
     * Check for greeting repetition
     */
    private checkGreetingRepetition;
    /**
     * Check for interrogation without teaching
     *
     * An interrogation occurs when the agent asks multiple questions without:
     * 1. Explaining why the information matters
     * 2. Connecting to previous insights
     * 3. Providing calculations or analysis
     * 4. Teaching the user something valuable
     *
     * This is different from thorough discovery where questions are accompanied
     * by teaching, calculations, or goal-oriented explanations.
     */
    private checkInterrogationWithoutTeaching;
    /**
     * Check for step boundary violations
     *
     * Context-aware detection that distinguishes between:
     * - TRUE VIOLATION: Agent recommends channel strategy, allocations, or tactics
     * - FALSE POSITIVE: Agent references channels for economic validation (activation rates, CAC by channel)
     *
     * The key insight is that sophisticated users often provide channel-level performance data
     * when discussing economics (Step 2), and the agent should validate this without penalty.
     */
    private checkStepBoundaryViolation;
    /**
     * Check for context loss
     *
     * Detects when the agent asks for data that was already provided.
     * IMPORTANT: Must distinguish between:
     * - Asking for original data again (BAD - context loss)
     * - Asking follow-up questions about related topics (GOOD - thorough discovery)
     *
     * Example FALSE POSITIVES to avoid:
     * - "What's your budget allocation preference?" is NOT asking for the budget
     * - "How do you want to split budget across channels?" is NOT asking for budget
     * - "What's your target audience segment?" is NOT asking for the volume target
     */
    private checkContextLoss;
    /**
     * Check for duplicate questions
     *
     * Detects when the agent asks the SAME question repeatedly (80%+ similarity).
     * This is different from asking RELATED questions about a topic.
     *
     * A TRUE loop is when the agent is stuck and not progressing.
     * Asking different questions about the same topic (e.g., demographics,
     * then behaviors, then geography) is NOT a loop - it's thorough discovery.
     */
    private checkDuplicateQuestion;
    /**
     * Normalize a question for comparison
     * Removes common words, punctuation, and normalizes whitespace
     */
    private normalizeQuestion;
    /**
     * Categorize question type (kept for legacy support)
     */
    private getQuestionType;
    /**
     * Extract question topic for IDK tracking
     */
    private extractQuestionTopic;
    /**
     * Check for blocked progress after IDK
     */
    private checkBlockedProgress;
    /**
     * Calculate string similarity using Jaccard index
     */
    private calculateStringSimilarity;
    /**
     * Get failure summary
     */
    getFailureSummary(failures: FailureCondition[]): string;
}
export default FailureDetector;
//# sourceMappingURL=failure-detector.d.ts.map