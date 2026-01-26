/**
 * Tool Executor - Executes RAG tools for Claude agent
 */
import { ToolDefinition, ToolUseBlock, ToolResult, ToolUsageStats } from './types.js';
import { RetrievalEngine } from './retrieval-engine.js';
/**
 * RAG Tool Definitions for Claude
 */
export declare const RAG_TOOLS: ToolDefinition[];
export declare class ToolExecutor {
    private retrievalEngine;
    private stats;
    constructor(retrievalEngine: RetrievalEngine);
    /**
     * Execute a tool call from Claude
     */
    execute(toolUse: ToolUseBlock): Promise<ToolResult>;
    /**
     * Execute search_knowledge_base tool
     */
    private executeSearch;
    /**
     * Execute get_benchmark tool
     */
    private executeGetBenchmark;
    /**
     * Execute get_audience_sizing tool
     */
    private executeGetAudienceSizing;
    /**
     * Get tool definitions for system prompt
     */
    getToolDefinitions(): ToolDefinition[];
    /**
     * Get usage statistics
     */
    getUsageStats(): ToolUsageStats;
    /**
     * Reset statistics
     */
    resetStats(): void;
}
export default ToolExecutor;
//# sourceMappingURL=tool-executor.d.ts.map