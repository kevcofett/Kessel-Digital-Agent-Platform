/**
 * Conversation Engine for Multi-Turn MPA Evaluation
 *
 * Orchestrates complete multi-turn conversations between
 * the simulated user and the MPA agent.
 */
import { TestScenario, ConversationResult, ConversationEngineConfig } from "./mpa-multi-turn-types.js";
/**
 * Conversation Engine - Orchestrates multi-turn conversations
 */
export declare class ConversationEngine {
    private anthropic;
    private userSimulator;
    private stepTracker;
    private failureDetector;
    private kbInjector;
    private config;
    private ragEngine;
    private toolExecutor;
    private useAgenticRAG;
    constructor(config?: Partial<ConversationEngineConfig>);
    /**
     * Run a complete conversation for a scenario
     */
    runConversation(scenario: TestScenario): Promise<ConversationResult>;
    /**
     * Get response from MPA agent with RAG tool support
     */
    private getAgentResponse;
    /**
     * Detect events from turn
     */
    private detectEvents;
    /**
     * Check if conversation is complete
     */
    private isConversationComplete;
    /**
     * Get configuration
     */
    getConfig(): ConversationEngineConfig;
}
export default ConversationEngine;
//# sourceMappingURL=conversation-engine.d.ts.map