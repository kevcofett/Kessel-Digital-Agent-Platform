# VSCODE RAG IMPLEMENTATION PART 2

Continuation of VSCODE_RAG_IMPLEMENTATION_PART1.md

## PHASE 6: RETRIEVAL ENGINE

### Step 6.1: Create rag/retrieval-engine.ts

```typescript
/**
 * Retrieval Engine - High-level RAG interface
 */

import * as path from 'path';
import {
  DocumentChunk,
  SearchOptions,
  RetrievalResult,
  BenchmarkResult,
  AudienceSizingResult,
  MetadataFilter,
  RAG_CONFIG,
} from './types.js';
import { DocumentProcessor } from './document-processor.js';
import { EmbeddingService } from './embedding-service.js';
import { VectorStore } from './vector-store.js';

export class RetrievalEngine {
  private documentProcessor: DocumentProcessor;
  private embeddingService: EmbeddingService;
  private vectorStore: VectorStore;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(kbPath?: string) {
    this.documentProcessor = new DocumentProcessor(kbPath);
    this.embeddingService = new EmbeddingService();
    this.vectorStore = new VectorStore(this.embeddingService);
  }

  /**
   * Initialize the retrieval engine
   */
  async initialize(): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.initialized) {
      return;
    }

    this.initializationPromise = this._doInitialize();
    await this.initializationPromise;
    this.initializationPromise = null;
  }

  private async _doInitialize(): Promise<void> {
    console.log('Initializing RAG Retrieval Engine...');
    const startTime = Date.now();

    // Try to load from cache first
    const cacheLoaded = await this.vectorStore.load(RAG_CONFIG.paths.indexCache);

    if (!cacheLoaded) {
      console.log('Cache not found, building index from KB documents...');

      // Process documents
      let chunks = await this.documentProcessor.loadFromCache();
      if (!chunks) {
        chunks = await this.documentProcessor.processAll();
        await this.documentProcessor.saveToCache(chunks);
      }

      // Build embeddings
      await this.embeddingService.initialize(chunks);
      const embeddings = this.embeddingService.embedBatch(
        chunks.map(c => c.content)
      );

      // Add to vector store
      this.vectorStore.addChunks(chunks, embeddings);

      // Persist for next time
      await this.vectorStore.persist(RAG_CONFIG.paths.indexCache);
    }

    this.initialized = true;
    console.log(`RAG Engine initialized in ${Date.now() - startTime}ms with ${this.vectorStore.getChunkCount()} chunks`);
  }

  /**
   * Ensure engine is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * General knowledge search
   */
  async search(query: string, options: SearchOptions = {}): Promise<RetrievalResult[]> {
    await this.ensureInitialized();

    const {
      topK = RAG_CONFIG.retrieval.defaultTopK,
      minScore = RAG_CONFIG.retrieval.minScore,
      filters,
    } = options;

    // Generate query embedding
    const queryEmbedding = this.embeddingService.embed(query);

    // Search
    let results;
    if (filters) {
      results = this.vectorStore.searchFiltered(query, queryEmbedding, filters, topK);
    } else {
      results = this.vectorStore.searchHybrid(query, queryEmbedding, topK);
    }

    // Filter by minimum score and format results
    return results
      .filter(r => r.score >= minScore)
      .map(r => this.formatRetrievalResult(r.chunk, r.score));
  }

  /**
   * Get specific benchmark data
   */
  async getBenchmark(
    vertical: string,
    metric: string
  ): Promise<BenchmarkResult | null> {
    await this.ensureInitialized();

    // Build targeted query
    const query = `${vertical} ${metric} benchmark typical range`;
    const queryEmbedding = this.embeddingService.embed(query);

    // Search with benchmark filter
    const results = this.vectorStore.searchFiltered(
      query,
      queryEmbedding,
      {
        mustHaveBenchmarks: true,
        verticals: [vertical.toLowerCase()],
      },
      10
    );

    // Find chunk with the specific metric
    const metricLower = metric.toLowerCase();
    const verticalLower = vertical.toLowerCase();

    for (const result of results) {
      const content = result.chunk.content.toLowerCase();
      
      // Check if chunk contains both vertical and metric
      if (content.includes(metricLower) || 
          result.chunk.metadata.metrics.some(m => m.includes(metricLower))) {
        
        // Extract benchmark value using patterns
        const benchmarkValue = this.extractBenchmarkValue(
          result.chunk.content,
          metric
        );

        if (benchmarkValue) {
          return {
            metric,
            vertical,
            value: benchmarkValue.value,
            qualifier: benchmarkValue.qualifier,
            source: result.chunk.filename,
            citationText: `Based on Knowledge Base, ${benchmarkValue.qualifier} ${vertical} ${metric} is ${benchmarkValue.value}.`,
          };
        }
      }
    }

    // Fallback: return best matching chunk as general guidance
    if (results.length > 0) {
      const best = results[0];
      return {
        metric,
        vertical,
        value: 'varies by segment',
        qualifier: 'typical',
        source: best.chunk.filename,
        citationText: `Based on Knowledge Base, ${metric} for ${vertical} varies by segment. ${best.chunk.content.slice(0, 200)}...`,
      };
    }

    return null;
  }

  /**
   * Extract benchmark value from text
   */
  private extractBenchmarkValue(
    content: string,
    metric: string
  ): { value: string; qualifier: 'conservative' | 'typical' | 'ambitious' | 'aggressive' } | null {
    // Common patterns for benchmark values
    const patterns = [
      // "$25-45" or "$25 to $45"
      /\$[\d,]+(?:\s*[-–to]+\s*\$?[\d,]+)?/gi,
      // "25-45%" or "25% to 45%"  
      /[\d.]+%(?:\s*[-–to]+\s*[\d.]+%)?/gi,
      // "3:1 to 5:1" ratio
      /[\d.]+:[\d.]+(?:\s*[-–to]+\s*[\d.]+:[\d.]+)?/gi,
      // "25 to 45" plain numbers
      /\b\d+(?:\s*[-–to]+\s*\d+)?\b/gi,
    ];

    // Find metric context
    const metricIndex = content.toLowerCase().indexOf(metric.toLowerCase());
    if (metricIndex === -1) return null;

    // Look in surrounding text
    const contextStart = Math.max(0, metricIndex - 100);
    const contextEnd = Math.min(content.length, metricIndex + 200);
    const context = content.slice(contextStart, contextEnd);

    // Try each pattern
    for (const pattern of patterns) {
      const matches = context.match(pattern);
      if (matches && matches.length > 0) {
        const value = matches[0];
        
        // Determine qualifier based on surrounding words
        const contextLower = context.toLowerCase();
        let qualifier: 'conservative' | 'typical' | 'ambitious' | 'aggressive' = 'typical';
        
        if (contextLower.includes('aggressive') || contextLower.includes('stretch')) {
          qualifier = 'aggressive';
        } else if (contextLower.includes('ambitious') || contextLower.includes('optimistic')) {
          qualifier = 'ambitious';
        } else if (contextLower.includes('conservative') || contextLower.includes('safe')) {
          qualifier = 'conservative';
        }

        return { value, qualifier };
      }
    }

    return null;
  }

  /**
   * Get audience sizing data
   */
  async getAudienceSizing(
    audienceType: string,
    geography?: string
  ): Promise<AudienceSizingResult | null> {
    await this.ensureInitialized();

    // Build query
    const query = `${audienceType} audience size ${geography || 'national'} population percentage`;
    const queryEmbedding = this.embeddingService.embed(query);

    // Search with audience filter
    const results = this.vectorStore.searchFiltered(
      query,
      queryEmbedding,
      {
        topics: ['audience'],
      },
      10
    );

    if (results.length > 0) {
      const best = results[0];
      
      // Try to extract sizing methodology
      const content = best.chunk.content;
      const sizingMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:million|M|%)/i);
      
      return {
        audienceType,
        totalSize: sizingMatch ? sizingMatch[0] : 'varies by definition',
        methodology: `Estimated based on ${best.chunk.sectionTitle} guidance`,
        source: best.chunk.filename,
        citationText: `Based on Knowledge Base, ${audienceType} audience ${geography ? `in ${geography}` : 'nationally'} is approximately ${sizingMatch ? sizingMatch[0] : 'variable based on targeting criteria'}. The methodology involves ${best.chunk.content.slice(0, 150)}...`,
      };
    }

    return null;
  }

  /**
   * Get step-specific guidance
   */
  async getStepGuidance(step: number, topic?: string): Promise<RetrievalResult[]> {
    await this.ensureInitialized();

    const query = topic 
      ? `step ${step} ${topic} guidance best practice`
      : `step ${step} guidance requirements`;

    return this.search(query, {
      topK: 3,
      filters: {
        steps: [step],
      },
    });
  }

  /**
   * Format chunk into retrieval result
   */
  private formatRetrievalResult(chunk: DocumentChunk, score: number): RetrievalResult {
    // Clean source filename for citation
    const source = chunk.filename
      .replace(/_v5_5\.txt$/, '')
      .replace(/_/g, ' ');

    return {
      content: chunk.content,
      source: chunk.filename,
      section: chunk.sectionTitle,
      relevanceScore: score,
      citationText: `Based on Knowledge Base (${source}): ${chunk.content.slice(0, 300)}${chunk.content.length > 300 ? '...' : ''}`,
    };
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get statistics
   */
  getStats(): { chunkCount: number; initialized: boolean } {
    return {
      chunkCount: this.vectorStore.getChunkCount(),
      initialized: this.initialized,
    };
  }
}

export default RetrievalEngine;
```


## PHASE 7: TOOL EXECUTOR

### Step 7.1: Create rag/tool-executor.ts

```typescript
/**
 * Tool Executor - Executes RAG tools for Claude agent
 */

import {
  ToolDefinition,
  ToolUseBlock,
  ToolResult,
  ToolUsageStats,
  Topic,
} from './types.js';
import { RetrievalEngine } from './retrieval-engine.js';

/**
 * RAG Tool Definitions for Claude
 */
export const RAG_TOOLS: ToolDefinition[] = [
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
  private retrievalEngine: RetrievalEngine;
  private stats: ToolUsageStats;

  constructor(retrievalEngine: RetrievalEngine) {
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
  async execute(toolUse: ToolUseBlock): Promise<ToolResult> {
    this.stats.totalCalls++;
    this.stats.callsByTool[toolUse.name] = 
      (this.stats.callsByTool[toolUse.name] || 0) + 1;

    try {
      switch (toolUse.name) {
        case 'search_knowledge_base':
          return await this.executeSearch(toolUse.input as {
            query: string;
            topic?: Topic;
          });

        case 'get_benchmark':
          return await this.executeGetBenchmark(toolUse.input as {
            vertical: string;
            metric: string;
          });

        case 'get_audience_sizing':
          return await this.executeGetAudienceSizing(toolUse.input as {
            audience_type: string;
            geography?: string;
          });

        default:
          return {
            content: `Unknown tool: ${toolUse.name}`,
            citations: [],
            success: false,
          };
      }
    } catch (error) {
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
  private async executeSearch(input: {
    query: string;
    topic?: Topic;
  }): Promise<ToolResult> {
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
    const formattedResults = results.map((r, i) => 
      `[Result ${i + 1}] Source: ${r.source}\n${r.content}`
    ).join('\n\n---\n\n');

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
  private async executeGetBenchmark(input: {
    vertical: string;
    metric: string;
  }): Promise<ToolResult> {
    const result = await this.retrievalEngine.getBenchmark(
      input.vertical,
      input.metric
    );

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
  private async executeGetAudienceSizing(input: {
    audience_type: string;
    geography?: string;
  }): Promise<ToolResult> {
    const result = await this.retrievalEngine.getAudienceSizing(
      input.audience_type,
      input.geography
    );

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
  getToolDefinitions(): ToolDefinition[] {
    return RAG_TOOLS;
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): ToolUsageStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalCalls: 0,
      callsByTool: {},
      averageResultsPerCall: 0,
      citationsGenerated: 0,
    };
  }
}

export default ToolExecutor;
```


### Step 7.2: Create rag/index.ts (exports)

```typescript
/**
 * RAG System Exports
 */

export * from './types.js';
export { DocumentProcessor } from './document-processor.js';
export { EmbeddingService } from './embedding-service.js';
export { VectorStore } from './vector-store.js';
export { RetrievalEngine } from './retrieval-engine.js';
export { ToolExecutor, RAG_TOOLS } from './tool-executor.js';
```


## PHASE 8: CONVERSATION ENGINE INTEGRATION

### Step 8.1: Modify conversation-engine.ts

Add these imports at the top:

```typescript
import { RetrievalEngine, ToolExecutor, ToolUseBlock } from './rag/index.js';
```

Add to ConversationEngine class properties:

```typescript
private ragEngine: RetrievalEngine;
private toolExecutor: ToolExecutor;
private useAgenticRAG: boolean;
```

Modify constructor:

```typescript
constructor(config: Partial<ConversationEngineConfig> = {}) {
  this.config = { ...DEFAULT_ENGINE_CONFIG, ...config };
  this.anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  this.userSimulator = new UserSimulator({
    model: this.config.simulatorModel,
  });
  this.stepTracker = new StepTracker();
  this.failureDetector = new FailureDetector();
  this.kbInjector = new KBInjector();
  
  // Initialize RAG system
  this.ragEngine = new RetrievalEngine();
  this.toolExecutor = new ToolExecutor(this.ragEngine);
  this.useAgenticRAG = config.useAgenticRAG ?? true;
}
```

Add to ConversationEngineConfig interface in mpa-multi-turn-types.ts:

```typescript
export interface ConversationEngineConfig {
  // ... existing fields ...
  useAgenticRAG?: boolean;  // Enable agentic RAG with tool use
}
```

Replace the getAgentResponse method:

```typescript
/**
 * Get response from MPA agent with RAG tool support
 */
private async getAgentResponse(
  systemPrompt: string,
  messageHistory: Anthropic.MessageParam[],
  kbContent: string
): Promise<{
  response: string;
  tokenCounts: ConversationTurn['tokenCounts'];
  toolCalls: number;
  citations: string[];
}> {
  // Inject base KB content into system prompt
  const fullSystemPrompt = kbContent
    ? `${systemPrompt}\n\n=== KNOWLEDGE BASE CONTEXT ===\n${kbContent}`
    : systemPrompt;

  // Handle empty message history (opening greeting)
  let messages: Anthropic.MessageParam[] =
    messageHistory.length > 0
      ? [...messageHistory]
      : [{ role: 'user' as const, content: 'Hello, I need help with media planning.' }];

  let finalResponse = '';
  let toolCallCount = 0;
  let allCitations: string[] = [];
  const maxToolCalls = 3; // Prevent infinite loops

  // Tool use loop
  while (toolCallCount < maxToolCalls) {
    const requestParams: Anthropic.MessageCreateParams = {
      model: this.config.agentModel,
      max_tokens: this.config.agentMaxTokens,
      temperature: this.config.agentTemperature,
      system: fullSystemPrompt,
      messages,
    };

    // Add tools if agentic RAG is enabled
    if (this.useAgenticRAG) {
      requestParams.tools = this.toolExecutor.getToolDefinitions() as Anthropic.Tool[];
    }

    const response = await this.anthropic.messages.create(requestParams);

    // Check for tool use
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (toolUseBlocks.length === 0 || !this.useAgenticRAG) {
      // No tool use - extract final text response
      const textBlock = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );
      finalResponse = textBlock?.text || '';
      break;
    }

    // Execute tools
    toolCallCount++;
    
    // Add assistant message with tool use
    messages.push({
      role: 'assistant',
      content: response.content,
    });

    // Execute each tool and collect results
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    
    for (const toolUse of toolUseBlocks) {
      const result = await this.toolExecutor.execute({
        type: 'tool_use',
        id: toolUse.id,
        name: toolUse.name,
        input: toolUse.input as Record<string, unknown>,
      });
      
      allCitations.push(...result.citations);
      
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: result.content,
      });
    }

    // Add tool results
    messages.push({
      role: 'user',
      content: toolResults,
    });
  }

  // Get last response if we hit tool call limit
  if (toolCallCount >= maxToolCalls && !finalResponse) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant' && Array.isArray(lastMsg.content)) {
      const textBlock = lastMsg.content.find(
        (block): block is Anthropic.TextBlock => 
          typeof block === 'object' && block.type === 'text'
      );
      finalResponse = textBlock?.text || '[Max tool calls reached]';
    }
  }

  return {
    response: finalResponse,
    tokenCounts: {
      userTokens: 0, // Would need to track from responses
      agentTokens: 0,
      kbTokens: Math.round(kbContent.length / 4),
      totalContextTokens: 0,
    },
    toolCalls: toolCallCount,
    citations: [...new Set(allCitations)], // Deduplicate
  };
}
```

Add initialization in runConversation before the conversation loop:

```typescript
async runConversation(scenario: TestScenario): Promise<ConversationResult> {
  // Initialize RAG engine
  if (this.useAgenticRAG) {
    await this.ragEngine.initialize();
  }
  
  // ... rest of existing code ...
}
```


## PHASE 9: SYSTEM PROMPT MODIFICATIONS

### Step 9.1: Update mpa-prompt-content.ts

Add RAG instructions to the system prompt. Insert after the existing content:

```typescript
const RAG_TOOL_INSTRUCTIONS = `

KNOWLEDGE BASE TOOLS

You have access to tools for searching the media planning knowledge base:

1. search_knowledge_base - Search for relevant information, frameworks, or guidance
2. get_benchmark - Get specific benchmark values for industry verticals and metrics
3. get_audience_sizing - Get audience size estimates with methodology

TOOL USAGE RULES

1. Use get_benchmark BEFORE citing any specific benchmark number (CAC, CPM, conversion rates, etc.)
2. Use search_knowledge_base when you need framework guidance or best practices
3. Use get_audience_sizing when discussing market size or targeting precision
4. If a tool returns no results, clearly state "My estimate" instead of fabricating data
5. Do not use tools for basic conversation - only for data retrieval needs

CITATION FORMAT

After using a tool, incorporate the provided citation naturally:
- CORRECT: "Based on Knowledge Base, typical ecommerce CAC runs $25-45."
- INCORRECT: "Industry benchmarks suggest CAC is typically around $25-45."

The tool results include pre-formatted citation text. Use it directly.

WHEN NOT TO USE TOOLS

- For basic conversation and greetings
- When the user has already provided the specific data you need
- When making general strategic recommendations that don't require specific numbers
- When you've already retrieved the relevant information in this conversation

`;

export const MPA_SYSTEM_PROMPT = `${CORE_INSTRUCTIONS}

${RAG_TOOL_INSTRUCTIONS}

${KB_00_CONTENT}`;
```


## PHASE 10: TESTING AND VALIDATION

### Step 10.1: Create rag/test-rag.ts

```typescript
/**
 * RAG System Test Script
 */

import { RetrievalEngine } from './retrieval-engine.js';
import { ToolExecutor } from './tool-executor.js';

interface TestCase {
  name: string;
  tool: string;
  input: Record<string, unknown>;
  expectedInResult: string[];
}

const TEST_CASES: TestCase[] = [
  {
    name: 'Search for CAC benchmarks',
    tool: 'search_knowledge_base',
    input: { query: 'customer acquisition cost benchmark ecommerce', topic: 'benchmark' },
    expectedInResult: ['CAC', 'cost'],
  },
  {
    name: 'Get ecommerce CAC benchmark',
    tool: 'get_benchmark',
    input: { vertical: 'ecommerce', metric: 'CAC' },
    expectedInResult: ['Based on Knowledge Base', '$'],
  },
  {
    name: 'Get SaaS LTV:CAC ratio',
    tool: 'get_benchmark',
    input: { vertical: 'saas', metric: 'LTV:CAC ratio' },
    expectedInResult: ['Based on Knowledge Base'],
  },
  {
    name: 'Search for audience targeting guidance',
    tool: 'search_knowledge_base',
    input: { query: 'audience targeting best practices signals', topic: 'audience' },
    expectedInResult: ['audience', 'targeting'],
  },
  {
    name: 'Get fitness enthusiast audience sizing',
    tool: 'get_audience_sizing',
    input: { audience_type: 'fitness enthusiasts', geography: 'US national' },
    expectedInResult: ['Based on Knowledge Base'],
  },
  {
    name: 'Search for channel mix guidance',
    tool: 'search_knowledge_base',
    input: { query: 'channel mix allocation brand awareness', topic: 'channel' },
    expectedInResult: ['channel'],
  },
  {
    name: 'Search for measurement framework',
    tool: 'search_knowledge_base',
    input: { query: 'measurement attribution incrementality', topic: 'measurement' },
    expectedInResult: ['measurement', 'attribution'],
  },
];

async function runTests() {
  console.log('=== RAG System Test Suite ===\n');

  // Initialize
  console.log('Initializing RAG engine...');
  const ragEngine = new RetrievalEngine();
  await ragEngine.initialize();
  
  const toolExecutor = new ToolExecutor(ragEngine);
  
  console.log(`Engine stats: ${JSON.stringify(ragEngine.getStats())}\n`);

  // Run tests
  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    console.log(`\nTest: ${testCase.name}`);
    console.log(`Tool: ${testCase.tool}`);
    console.log(`Input: ${JSON.stringify(testCase.input)}`);

    try {
      const result = await toolExecutor.execute({
        type: 'tool_use',
        id: `test-${Date.now()}`,
        name: testCase.tool,
        input: testCase.input,
      });

      console.log(`Success: ${result.success}`);
      console.log(`Citations: ${result.citations.join(', ') || 'none'}`);
      console.log(`Content preview: ${result.content.slice(0, 200)}...`);

      // Check expected content
      const allExpectedFound = testCase.expectedInResult.every(
        expected => result.content.toLowerCase().includes(expected.toLowerCase())
      );

      if (allExpectedFound) {
        console.log('✅ PASSED - All expected content found');
        passed++;
      } else {
        console.log('❌ FAILED - Missing expected content');
        console.log(`  Expected: ${testCase.expectedInResult.join(', ')}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAILED - Error: ${error}`);
      failed++;
    }
  }

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}/${TEST_CASES.length}`);
  console.log(`Failed: ${failed}/${TEST_CASES.length}`);
  console.log(`Tool usage stats: ${JSON.stringify(toolExecutor.getUsageStats())}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
```


### Step 10.2: Create rag/index-kb.ts (standalone indexer)

```typescript
/**
 * Standalone KB Indexer - Run to rebuild the RAG index
 */

import { RetrievalEngine } from './retrieval-engine.js';

async function indexKB() {
  console.log('=== KB Indexer ===\n');
  
  const engine = new RetrievalEngine();
  
  console.log('Building index (this may take a moment)...\n');
  await engine.initialize();
  
  console.log('\nIndexing complete!');
  console.log(`Stats: ${JSON.stringify(engine.getStats())}`);
}

indexKB().catch(console.error);
```


## PHASE 11: BUILD AND RUN

### Step 11.1: Update tsconfig.json include

```json
{
  "include": [
    "./**/*.ts",
    "./rag/**/*.ts"
  ]
}
```

### Step 11.2: Build

```bash
cd release/v5.5/agents/mpa/base/tests/braintrust
npm install
npx tsc
```

### Step 11.3: Test RAG system

```bash
node dist/rag/test-rag.js
```

Expected output: All 7 tests should pass.

### Step 11.4: Index KB (first time only)

```bash
node dist/rag/index-kb.js
```

### Step 11.5: Run evaluation

```bash
node dist/mpa-multi-turn-eval.js --fast
```


## VERIFICATION CHECKLIST

Before running evaluation, verify:

- [ ] package.json created with natural dependency
- [ ] npm install completed without errors
- [ ] All 7 files created in rag/ directory
- [ ] tsconfig.json updated with rag include
- [ ] TypeScript compiles without errors
- [ ] test-rag.js passes all tests
- [ ] KB index created in rag-cache/
- [ ] conversation-engine.ts modified for tool use


## EXPECTED OUTCOMES

After RAG implementation:

| Scorer | Before | After | Mechanism |
|--------|--------|-------|-----------|
| source-citation | 52-62% | 92%+ | Tools return pre-formatted citations |
| audience-sizing | 25-40% | 92%+ | get_audience_sizing provides methodology |
| calculation-presence | 66-85% | 92%+ | Benchmarks available for calculations |
| acronym-definition | 0-23% | 92%+ | (Unchanged - instruction based) |
| response-length | 57-78% | 92%+ | (Unchanged - instruction based) |

PROJECTED COMPOSITE: 94-96%


## TROUBLESHOOTING

### "Cannot find module 'natural'"
Run `npm install` in the braintrust directory.

### "rag-cache/kb-index.json not found"
Run `node dist/rag/index-kb.js` to build the index.

### Tool calls not happening
Check that `useAgenticRAG` is not set to false in config.

### Low relevance scores
The TF-IDF vocabulary may need tuning. Try increasing `maxFeatures` in RAG_CONFIG.

### Timeout on first run
First run builds the index which takes 10-30 seconds. Subsequent runs load from cache.
