/**
 * Tool Executor - Executes RAG tools for Claude agent
 */
/**
 * RAG Tool Definitions for Claude
 */
export const RAG_TOOLS = [
    {
        name: 'search_knowledge_base',
        description: `Search the media planning knowledge base for relevant information, benchmarks, frameworks, or guidance. Use this tool when you need to:
- Find specific benchmark data before citing numbers
- Look up best practices for a planning step
- Get framework guidance for complex decisions
- Verify information before making claims

Always cite results as "Based on Knowledge Base" in your response.`,
        input_schema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query describing what information you need. Be specific about the metric, vertical, or topic.',
                },
                topic: {
                    type: 'string',
                    enum: ['audience', 'budget', 'channel', 'measurement', 'benchmark', 'efficiency', 'general'],
                    description: 'Primary topic area to focus the search. Helps return more relevant results.',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'get_benchmark',
        description: `Get a specific benchmark value for an industry vertical and metric. Returns the benchmark with proper citation formatting. Use this tool when you need to cite a specific number like CAC, CPM, conversion rate, or LTV:CAC ratio.

The result includes a pre-formatted citation string - use it directly in your response.`,
        input_schema: {
            type: 'object',
            properties: {
                vertical: {
                    type: 'string',
                    description: "Industry vertical (e.g., 'ecommerce', 'saas', 'retail', 'financial services', 'healthcare', 'b2b technology')",
                },
                metric: {
                    type: 'string',
                    description: "Metric to look up (e.g., 'CAC', 'LTV:CAC ratio', 'CPM', 'conversion rate', 'CPA', 'ROAS')",
                },
            },
            required: ['vertical', 'metric'],
        },
    },
    {
        name: 'get_audience_sizing',
        description: `Get audience size estimates and methodology for a target audience type. Returns sizing data with the calculation approach so you can explain the methodology to users.

Use when discussing audience reach, market size, or targeting precision.`,
        input_schema: {
            type: 'object',
            properties: {
                audience_type: {
                    type: 'string',
                    description: "Type of audience (e.g., 'fitness enthusiasts', 'B2B decision makers', 'luxury consumers', 'new parents')",
                },
                geography: {
                    type: 'string',
                    description: "Geographic scope (e.g., 'US national', 'top 10 DMAs', 'California', 'New York metro')",
                },
            },
            required: ['audience_type'],
        },
    },
];
export class ToolExecutor {
    retrievalEngine;
    stats;
    constructor(retrievalEngine) {
        this.retrievalEngine = retrievalEngine;
        this.stats = {
            totalCalls: 0,
            callsByTool: {},
            averageResultsPerCall: 0,
            citationsGenerated: 0,
        };
    }
    /**
     * Execute a tool call from Claude
     */
    async execute(toolUse) {
        this.stats.totalCalls++;
        this.stats.callsByTool[toolUse.name] =
            (this.stats.callsByTool[toolUse.name] || 0) + 1;
        try {
            switch (toolUse.name) {
                case 'search_knowledge_base':
                    return await this.executeSearch(toolUse.input);
                case 'get_benchmark':
                    return await this.executeGetBenchmark(toolUse.input);
                case 'get_audience_sizing':
                    return await this.executeGetAudienceSizing(toolUse.input);
                default:
                    return {
                        content: `Unknown tool: ${toolUse.name}`,
                        citations: [],
                        success: false,
                    };
            }
        }
        catch (error) {
            console.error(`Tool execution error for ${toolUse.name}:`, error);
            return {
                content: `Error executing ${toolUse.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                citations: [],
                success: false,
            };
        }
    }
    /**
     * Execute search_knowledge_base tool
     */
    async executeSearch(input) {
        const results = await this.retrievalEngine.search(input.query, {
            topK: 5,
            filters: input.topic && input.topic !== 'general'
                ? { topics: [input.topic] }
                : undefined,
        });
        if (results.length === 0) {
            return {
                content: 'No relevant information found in knowledge base. Use your own estimate and clearly state "My estimate" when responding.',
                citations: [],
                success: true, // Not finding results is not an error
            };
        }
        // Format results for Claude
        const formattedResults = results.map((r, i) => `[Result ${i + 1}] Source: ${r.source}\n${r.content}`).join('\n\n---\n\n');
        const citations = results.map(r => r.source);
        this.stats.citationsGenerated += citations.length;
        return {
            content: `Found ${results.length} relevant results:\n\n${formattedResults}\n\nWhen using this information, cite as "Based on Knowledge Base" in your response.`,
            citations,
            success: true,
        };
    }
    /**
     * Execute get_benchmark tool
     */
    async executeGetBenchmark(input) {
        const result = await this.retrievalEngine.getBenchmark(input.vertical, input.metric);
        if (!result) {
            return {
                content: `No benchmark found for ${input.metric} in ${input.vertical}. Use your own estimate and clearly state "My estimate" when responding.`,
                citations: [],
                success: true,
            };
        }
        this.stats.citationsGenerated++;
        return {
            content: `Benchmark found:
- Metric: ${result.metric}
- Vertical: ${result.vertical}
- Value: ${result.value}
- Qualifier: ${result.qualifier}
- Source: ${result.source}

Use this citation in your response: "${result.citationText}"`,
            citations: [result.source],
            success: true,
        };
    }
    /**
     * Execute get_audience_sizing tool
     */
    async executeGetAudienceSizing(input) {
        const result = await this.retrievalEngine.getAudienceSizing(input.audience_type, input.geography);
        if (!result) {
            return {
                content: `No specific audience sizing data found for ${input.audience_type}. You can estimate based on general population data and targeting criteria. State "My estimate" when providing numbers.`,
                citations: [],
                success: true,
            };
        }
        this.stats.citationsGenerated++;
        return {
            content: `Audience sizing found:
- Audience: ${result.audienceType}
- Estimated Size: ${result.totalSize}
- Methodology: ${result.methodology}
- Source: ${result.source}

Use this citation in your response: "${result.citationText}"`,
            citations: [result.source],
            success: true,
        };
    }
    /**
     * Get tool definitions for system prompt
     */
    getToolDefinitions() {
        return RAG_TOOLS;
    }
    /**
     * Get usage statistics
     */
    getUsageStats() {
        return { ...this.stats };
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalCalls: 0,
            callsByTool: {},
            averageResultsPerCall: 0,
            citationsGenerated: 0,
        };
    }
}
export default ToolExecutor;
//# sourceMappingURL=tool-executor.js.map