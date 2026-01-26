/**
 * Graceful Degradation Scorers - Tests agent behavior when APIs/tools fail
 *
 * The MPA should gracefully handle situations where:
 * - Web search is unavailable or fails
 * - API calls fail or timeout
 * - KB retrieval fails
 *
 * Expected behaviors:
 * 1. Agent acknowledges the limitation
 * 2. Agent falls back to next-best data source
 * 3. Agent labels the fallback clearly
 * 4. Agent recommends validation/follow-up
 * 5. Agent maintains forward progress (doesn't get stuck)
 */
/**
 * Types of failures that can occur
 */
export declare enum FailureType {
    WEB_SEARCH_UNAVAILABLE = "web_search_unavailable",
    API_TIMEOUT = "api_timeout",
    API_ERROR = "api_error",
    KB_RETRIEVAL_FAILED = "kb_retrieval_failed",
    RATE_LIMITED = "rate_limited"
}
/**
 * Score acknowledgment of failure - does agent recognize the limitation?
 */
export declare function scoreFailureAcknowledgment(agentResponse: string, failureType: FailureType): {
    score: number;
    metadata: Record<string, unknown>;
};
/**
 * Score fallback behavior - does agent use appropriate fallback?
 */
export declare function scoreFallbackBehavior(agentResponse: string, failureType: FailureType): {
    score: number;
    metadata: Record<string, unknown>;
};
/**
 * Score recommendation presence - does agent recommend follow-up?
 */
export declare function scoreFollowUpRecommendation(agentResponse: string, failureType: FailureType): {
    score: number;
    metadata: Record<string, unknown>;
};
/**
 * Score forward progress - does agent maintain momentum despite failure?
 */
export declare function scoreForwardProgress(agentResponse: string): {
    score: number;
    metadata: Record<string, unknown>;
};
/**
 * Score graceful degradation using LLM-as-judge
 *
 * Evaluates overall quality of graceful degradation behavior
 */
export declare function scoreGracefulDegradation(userMessage: string, agentResponse: string, failureContext: {
    failureType: FailureType;
    errorMessage?: string;
}): Promise<{
    score: number;
    metadata: Record<string, unknown>;
}>;
/**
 * Calculate combined graceful degradation score
 */
export declare function calculateGracefulDegradationScore(scores: {
    acknowledgment: number;
    fallback: number;
    recommendation: number;
    forwardProgress: number;
    llmScore?: number;
}): number;
declare const _default: {
    FailureType: typeof FailureType;
    scoreFailureAcknowledgment: typeof scoreFailureAcknowledgment;
    scoreFallbackBehavior: typeof scoreFallbackBehavior;
    scoreFollowUpRecommendation: typeof scoreFollowUpRecommendation;
    scoreForwardProgress: typeof scoreForwardProgress;
    scoreGracefulDegradation: typeof scoreGracefulDegradation;
    calculateGracefulDegradationScore: typeof calculateGracefulDegradationScore;
};
export default _default;
//# sourceMappingURL=graceful-degradation-scorers.d.ts.map