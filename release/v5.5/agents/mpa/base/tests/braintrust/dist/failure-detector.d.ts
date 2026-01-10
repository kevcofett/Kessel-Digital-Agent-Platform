/**
 * Failure Detector for Multi-Turn MPA Evaluation
 *
 * Detects conversation failures like loops, context loss, and greeting repetition.
 */
import { ConversationTurn, FailureCondition } from "./mpa-multi-turn-types.js";
/**
 * Built-in failure patterns
 */
export declare const BUILTIN_FAILURES: FailureCondition[];
/**
 * Failure Detector class
 */
export declare class FailureDetector {
    private questionHistory;
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
    detectFailures(turnNumber: number, agentResponse: string, previousTurns: ConversationTurn[], customFailures: FailureCondition[], currentStep?: number, userSaidIDK?: boolean): FailureCondition[];
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
     * Check for excessive questions
     */
    private checkExcessiveQuestions;
    /**
     * Check for step boundary violations
     */
    private checkStepBoundaryViolation;
    /**
     * Check for context loss
     */
    private checkContextLoss;
    /**
     * Check for question loops
     *
     * A true loop is when the agent repeatedly asks the SAME question type
     * within a SHORT window (e.g., 4 consecutive turns). In a 10-step planning
     * session, it's natural to revisit topics across different steps.
     *
     * This detector focuses on detecting ACTUAL loops where the agent is stuck,
     * not natural topic revisitation across steps.
     */
    private checkLoopDetection;
    /**
     * Categorize question type
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