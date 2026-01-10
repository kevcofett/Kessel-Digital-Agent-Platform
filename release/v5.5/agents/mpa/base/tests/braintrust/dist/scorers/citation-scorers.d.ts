/**
 * Citation Scorers - Tests data attribution and citation accuracy
 *
 * The MPA must properly cite all data sources:
 * - "Based on your input" for user-provided data
 * - "Based on KB" for knowledge base data
 * - "Based on web search" for researched data
 * - "My estimate, I searched but found no citable data" for estimates
 *
 * These scorers verify:
 * 1. All claims have appropriate citations
 * 2. Citations match the actual source used
 * 3. No false attribution (claiming KB when using estimate)
 * 4. Consistent citation format
 * 5. Appropriate confidence levels communicated
 */
/**
 * Citation types recognized by the system
 */
export declare enum CitationType {
    USER_INPUT = "user_input",
    KB_BENCHMARK = "kb_benchmark",
    WEB_SEARCH = "web_search",
    AGENT_ESTIMATE = "agent_estimate",
    DIRECT_API = "direct_api",
    EXTERNAL_SOURCE = "external_source"
}
/**
 * Score citation presence - does agent cite sources for claims?
 */
export declare function scoreCitationPresence(agentResponse: string): {
    score: number;
    metadata: Record<string, unknown>;
};
/**
 * Score citation accuracy - are citations correctly attributed?
 *
 * This checks for potential misattribution patterns like:
 * - Claiming KB data when none was retrieved
 * - Claiming user input for general benchmarks
 * - Claiming web search when search wasn't performed
 */
export declare function scoreCitationAccuracy(agentResponse: string, context: {
    kbDataRetrieved?: boolean;
    webSearchPerformed?: boolean;
    userDataProvided?: boolean;
    apiDataAvailable?: boolean;
}): {
    score: number;
    metadata: Record<string, unknown>;
};
/**
 * Score citation consistency - are citations formatted consistently?
 */
export declare function scoreCitationConsistency(agentResponse: string): {
    score: number;
    metadata: Record<string, unknown>;
};
/**
 * Score confidence level communication - does agent convey appropriate confidence?
 */
export declare function scoreConfidenceLevel(agentResponse: string): {
    score: number;
    metadata: Record<string, unknown>;
};
/**
 * LLM-as-judge for comprehensive citation quality
 */
export declare function scoreCitationQuality(userMessage: string, agentResponse: string, context: {
    kbDataRetrieved?: boolean;
    webSearchPerformed?: boolean;
    userDataProvided?: boolean;
}): Promise<{
    score: number;
    metadata: Record<string, unknown>;
}>;
/**
 * Calculate combined citation score
 */
export declare function calculateCitationScore(scores: {
    presence: number;
    accuracy: number;
    consistency: number;
    confidence: number;
    llmQuality?: number;
}): number;
declare const _default: {
    CitationType: typeof CitationType;
    scoreCitationPresence: typeof scoreCitationPresence;
    scoreCitationAccuracy: typeof scoreCitationAccuracy;
    scoreCitationConsistency: typeof scoreCitationConsistency;
    scoreConfidenceLevel: typeof scoreConfidenceLevel;
    scoreCitationQuality: typeof scoreCitationQuality;
    calculateCitationScore: typeof calculateCitationScore;
};
export default _default;
//# sourceMappingURL=citation-scorers.d.ts.map