# MPA AGENTIC RAG SYSTEM SPECIFICATION v1.0

## EXECUTIVE SUMMARY

This specification defines a full agentic RAG (Retrieval-Augmented Generation) system for the MPA Braintrust evaluation harness. The system replaces static KB injection with agent-driven semantic retrieval, enabling the agent to query the knowledge base on demand and receive properly attributed results.

TARGET OUTCOME: Composite score improvement from 86.8% to 94%+ by enabling proper source citation, benchmark retrieval, and contextual knowledge access.


## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONVERSATION ENGINE                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     MPA AGENT (Claude Sonnet)                        │    │
│  │  System Prompt + Tool Definitions                                    │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐    │    │
│  │  │ search_kb   │ │get_benchmark│ │ get_audience_sizing_data    │    │    │
│  │  └─────────────┘ └─────────────┘ └─────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     TOOL EXECUTOR                                    │    │
│  │  Intercepts tool_use blocks, executes against RAG system            │    │
│  │  Returns tool_result with source attribution                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RAG SYSTEM                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     RETRIEVAL ENGINE                                 │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐    │    │
│  │  │ Semantic Search│  │ Keyword Search│  │ Structured Query      │    │    │
│  │  │ (Embeddings)  │  │ (BM25/TF-IDF) │  │ (Filters + Metadata)  │    │    │
│  │  └───────────────┘  └───────────────┘  └───────────────────────┘    │    │
│  │                           │                                          │    │
│  │                           ▼                                          │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                  RESULT RANKER                               │    │    │
│  │  │  Combines semantic + keyword scores, applies boost factors   │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     VECTOR STORE                                     │    │
│  │  In-memory store with document chunks + embeddings + metadata        │    │
│  │  Loaded once at startup, persisted to JSON for fast reload           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    ▲                                         │
│                                    │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     DOCUMENT PROCESSOR                               │    │
│  │  Chunks KB files, generates embeddings, extracts metadata            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    ▲                                         │
│                                    │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     KB DOCUMENTS (23 files, ~700KB)                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```


## FILE STRUCTURE

Create these new files in the braintrust directory:

```
braintrust/
├── rag/
│   ├── index.ts                    # Main RAG system exports
│   ├── document-processor.ts       # Chunking and metadata extraction
│   ├── embedding-service.ts        # Embedding generation (Anthropic Voyage or local)
│   ├── vector-store.ts             # In-memory vector store with persistence
│   ├── retrieval-engine.ts         # Hybrid search (semantic + keyword)
│   ├── tool-executor.ts            # Executes RAG tools, returns results
│   └── types.ts                    # RAG type definitions
├── package.json                    # NEW - dependencies for RAG system
└── ... (existing files)
```


## DEPENDENCIES

Create package.json in braintrust directory:

```json
{
  "name": "mpa-braintrust-eval",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "eval": "node dist/mpa-multi-turn-eval.js",
    "eval:fast": "node dist/mpa-multi-turn-eval.js --fast",
    "index-kb": "node dist/rag/index-kb.js",
    "test:rag": "node dist/rag/test-rag.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "braintrust": "^0.0.160",
    "dotenv": "^16.3.1",
    "natural": "^6.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

Note: Using natural library for TF-IDF and BM25 keyword search. Embeddings will use Anthropic's Voyage API or fallback to TF-IDF vectors.


## COMPONENT SPECIFICATIONS


### 1. DOCUMENT PROCESSOR (document-processor.ts)

PURPOSE: Chunk KB documents into retrievable passages with metadata.

```typescript
// Types
interface DocumentChunk {
  id: string;                    // Unique chunk ID: {filename}_{chunk_index}
  content: string;               // Chunk text (300-500 tokens target)
  filename: string;              // Source KB filename
  sectionTitle: string;          // Extracted section header
  chunkIndex: number;            // Position in document
  metadata: ChunkMetadata;
}

interface ChunkMetadata {
  documentType: 'benchmark' | 'framework' | 'playbook' | 'examples' | 'implications';
  topics: string[];              // Extracted topics: ['audience', 'budget', 'channel']
  steps: number[];               // Relevant MPA steps: [1, 2] or [7, 8]
  hasNumbers: boolean;           // Contains benchmarks/metrics
  hasBenchmarks: boolean;        // Contains specific benchmark data
  verticals: string[];           // Industry verticals mentioned
  metrics: string[];             // KPI/metric types mentioned
}

// Chunking Strategy
CHUNKING_CONFIG = {
  targetChunkSize: 400,          // Target tokens per chunk
  maxChunkSize: 600,             // Never exceed
  minChunkSize: 100,             // Merge smaller chunks
  overlapTokens: 50,             // Overlap between chunks for context
  sectionBoundaryBoost: true,    // Prefer breaking at section headers
}

// Section Detection
SECTION_PATTERNS = [
  /^[A-Z][A-Z\s]+$/m,            // ALL CAPS headers
  /^[A-Z][a-z]+(?:\s[A-Z][a-z]+)+$/m,  // Title Case headers
  /^\d+\.\s+[A-Z]/m,             // Numbered sections
]

// Metadata Extraction Rules
TOPIC_KEYWORDS = {
  audience: ['audience', 'targeting', 'segment', 'demographic', 'persona'],
  budget: ['budget', 'spend', 'allocation', 'investment', 'cost'],
  channel: ['channel', 'media', 'platform', 'placement', 'inventory'],
  measurement: ['measurement', 'attribution', 'kpi', 'metric', 'tracking'],
  benchmark: ['benchmark', 'typical', 'average', 'range', 'industry'],
  efficiency: ['cac', 'cpa', 'cpm', 'roas', 'efficiency', 'cost per'],
}

STEP_KEYWORDS = {
  1: ['objective', 'outcome', 'goal', 'success'],
  2: ['economics', 'ltv', 'cac', 'margin', 'profitability'],
  3: ['audience', 'targeting', 'segment', 'persona'],
  4: ['geography', 'geo', 'dma', 'region', 'market'],
  5: ['budget', 'allocation', 'spend'],
  6: ['value proposition', 'messaging', 'positioning'],
  7: ['channel', 'media mix', 'platform'],
  8: ['measurement', 'attribution', 'kpi'],
  9: ['testing', 'experiment', 'hypothesis'],
  10: ['risk', 'mitigation', 'contingency'],
}
```

IMPLEMENTATION REQUIREMENTS:

1. Load all .txt files from KB directory
2. Split into chunks respecting section boundaries
3. Extract metadata using keyword matching
4. Generate unique IDs for each chunk
5. Return array of DocumentChunk objects
6. Cache processed chunks to JSON file for fast reload


### 2. EMBEDDING SERVICE (embedding-service.ts)

PURPOSE: Generate vector embeddings for semantic search.

STRATEGY: Use TF-IDF vectors from natural library (no external API calls needed).

```typescript
interface EmbeddingService {
  // Initialize with corpus for TF-IDF
  initialize(chunks: DocumentChunk[]): Promise<void>;
  
  // Generate embedding for a single text
  embed(text: string): Promise<number[]>;
  
  // Generate embeddings for multiple texts (batch)
  embedBatch(texts: string[]): Promise<number[][]>;
  
  // Get embedding dimension
  getDimension(): number;
}

// TF-IDF Configuration
TFIDF_CONFIG = {
  maxFeatures: 1000,             // Vocabulary size
  minDocFreq: 2,                 // Min documents for term inclusion
  maxDocFreq: 0.95,              // Max doc frequency (filter common terms)
  sublinearTf: true,             // Use log(1 + tf) instead of raw tf
}
```

IMPLEMENTATION REQUIREMENTS:

1. Use natural library's TfIdf class
2. Build vocabulary from all chunks during initialization
3. Generate sparse vectors, convert to dense for storage
4. Implement cosine similarity for vector comparison
5. Cache computed embeddings with chunks


### 3. VECTOR STORE (vector-store.ts)

PURPOSE: Store and query document chunks with embeddings.

```typescript
interface VectorStore {
  // Add chunks with embeddings
  addChunks(chunks: DocumentChunk[], embeddings: number[][]): void;
  
  // Semantic search by query embedding
  searchSemantic(queryEmbedding: number[], topK: number): SearchResult[];
  
  // Keyword search using BM25
  searchKeyword(query: string, topK: number): SearchResult[];
  
  // Hybrid search combining both
  searchHybrid(query: string, queryEmbedding: number[], topK: number, 
               semanticWeight?: number): SearchResult[];
  
  // Filtered search with metadata constraints
  searchFiltered(query: string, filters: MetadataFilter, topK: number): SearchResult[];
  
  // Save store to disk
  persist(filepath: string): Promise<void>;
  
  // Load store from disk
  load(filepath: string): Promise<boolean>;
}

interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  scoreBreakdown: {
    semantic: number;
    keyword: number;
    metadataBoost: number;
  };
}

interface MetadataFilter {
  documentTypes?: string[];
  topics?: string[];
  steps?: number[];
  mustHaveBenchmarks?: boolean;
  verticals?: string[];
}

// Scoring Configuration
SCORING_CONFIG = {
  semanticWeight: 0.6,           // Weight for semantic similarity
  keywordWeight: 0.4,            // Weight for BM25 score
  benchmarkBoost: 1.5,           // Boost for chunks with benchmarks
  exactMatchBoost: 2.0,          // Boost for exact phrase matches
  recencyBoost: 1.0,             // No recency for static KB
}
```

IMPLEMENTATION REQUIREMENTS:

1. Store chunks and embeddings in memory as arrays
2. Implement brute-force cosine similarity (sufficient for ~500 chunks)
3. Implement BM25 scoring using natural library
4. Combine scores with configurable weights
5. Apply metadata boost factors
6. Persist to JSON file with embeddings as base64 or arrays
7. Load from JSON on startup if available


### 4. RETRIEVAL ENGINE (retrieval-engine.ts)

PURPOSE: High-level retrieval interface used by tool executor.

```typescript
interface RetrievalEngine {
  // Initialize engine (load KB, build index)
  initialize(): Promise<void>;
  
  // General knowledge search
  search(query: string, options?: SearchOptions): Promise<RetrievalResult[]>;
  
  // Get specific benchmark data
  getBenchmark(vertical: string, metric: string): Promise<BenchmarkResult | null>;
  
  // Get audience sizing data
  getAudienceSizing(audienceType: string, geography?: string): Promise<AudienceSizingResult | null>;
  
  // Get step-specific guidance
  getStepGuidance(step: number, topic?: string): Promise<RetrievalResult[]>;
}

interface SearchOptions {
  topK?: number;                 // Max results (default: 5)
  minScore?: number;             // Minimum relevance score (default: 0.3)
  filters?: MetadataFilter;      // Metadata constraints
  includeContext?: boolean;      // Include surrounding chunks
}

interface RetrievalResult {
  content: string;               // Retrieved text
  source: string;                // Filename for citation
  section: string;               // Section title
  relevanceScore: number;        // 0-1 relevance
  citationText: string;          // Pre-formatted citation string
}

interface BenchmarkResult {
  metric: string;                // e.g., "CAC"
  vertical: string;              // e.g., "ecommerce"
  value: string;                 // e.g., "$25-45"
  qualifier: string;             // e.g., "typical" | "aggressive" | "conservative"
  source: string;                // KB filename
  citationText: string;          // "Based on Knowledge Base, typical ecommerce CAC is $25-45"
}

interface AudienceSizingResult {
  audienceType: string;
  totalSize: string;             // e.g., "2-4 million"
  methodology: string;           // How the size was calculated
  source: string;
  citationText: string;
}
```

IMPLEMENTATION REQUIREMENTS:

1. Compose document processor, embedding service, and vector store
2. Implement lazy initialization (build index on first use)
3. Format all results with pre-built citation strings
4. Implement specialized methods for common queries (benchmarks, audience sizing)
5. Log all retrievals for debugging and KB impact analysis


### 5. TOOL EXECUTOR (tool-executor.ts)

PURPOSE: Execute RAG tools when agent requests them.

```typescript
interface ToolExecutor {
  // Initialize with retrieval engine
  constructor(retrievalEngine: RetrievalEngine);
  
  // Execute a tool call from Claude
  execute(toolUse: ToolUseBlock): Promise<ToolResult>;
  
  // Get tool definitions for system prompt
  getToolDefinitions(): ToolDefinition[];
  
  // Get usage statistics
  getUsageStats(): ToolUsageStats;
}

interface ToolResult {
  content: string;               // Result text for agent
  citations: string[];           // Sources used
  success: boolean;
}

interface ToolUsageStats {
  totalCalls: number;
  callsByTool: Record<string, number>;
  averageResultsPerCall: number;
  citationsGenerated: number;
}
```

TOOL DEFINITIONS:

```typescript
const RAG_TOOLS: ToolDefinition[] = [
  {
    name: "search_knowledge_base",
    description: "Search the media planning knowledge base for relevant information, benchmarks, frameworks, or guidance. Use this when you need to cite specific data or find best practices. Always cite results as 'Based on Knowledge Base'.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query describing what information you need"
        },
        topic: {
          type: "string",
          enum: ["audience", "budget", "channel", "measurement", "benchmark", "efficiency", "general"],
          description: "Primary topic area to focus search"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_benchmark",
    description: "Get a specific benchmark value for a vertical and metric. Returns the benchmark with proper citation. Use when you need to cite a specific number.",
    input_schema: {
      type: "object",
      properties: {
        vertical: {
          type: "string",
          description: "Industry vertical (e.g., 'ecommerce', 'saas', 'retail', 'financial services')"
        },
        metric: {
          type: "string", 
          description: "Metric to look up (e.g., 'CAC', 'LTV:CAC ratio', 'CPM', 'conversion rate')"
        }
      },
      required: ["vertical", "metric"]
    }
  },
  {
    name: "get_audience_sizing",
    description: "Get audience size estimates and methodology. Returns sizing data with calculation approach.",
    input_schema: {
      type: "object",
      properties: {
        audience_type: {
          type: "string",
          description: "Type of audience (e.g., 'fitness enthusiasts', 'B2B decision makers', 'luxury consumers')"
        },
        geography: {
          type: "string",
          description: "Geographic scope (e.g., 'US national', 'top 10 DMAs', 'California')"
        }
      },
      required: ["audience_type"]
    }
  }
]
```

IMPLEMENTATION REQUIREMENTS:

1. Parse tool_use blocks from Claude response
2. Route to appropriate retrieval method
3. Format results with citation strings
4. Track usage statistics
5. Handle errors gracefully with fallback responses


### 6. CONVERSATION ENGINE INTEGRATION

MODIFY: conversation-engine.ts

Changes required:

1. Add RAG tool executor initialization
2. Modify getAgentResponse to include tools
3. Handle tool_use responses with tool execution loop
4. Track citations used per turn

```typescript
// In ConversationEngine constructor
private toolExecutor: ToolExecutor;
private ragEngine: RetrievalEngine;

constructor(config) {
  // ... existing code ...
  this.ragEngine = new RetrievalEngine();
  this.toolExecutor = new ToolExecutor(this.ragEngine);
}

// Modified getAgentResponse
private async getAgentResponse(
  systemPrompt: string,
  messageHistory: Anthropic.MessageParam[],
  kbContext: string  // Still inject base context
): Promise<AgentResponseResult> {
  
  const fullSystemPrompt = this.buildSystemPromptWithRAG(systemPrompt, kbContext);
  
  let messages = [...messageHistory];
  let finalResponse = '';
  let allCitations: string[] = [];
  let toolCallCount = 0;
  const maxToolCalls = 3;  // Prevent infinite loops
  
  while (toolCallCount < maxToolCalls) {
    const response = await this.anthropic.messages.create({
      model: this.config.agentModel,
      max_tokens: this.config.agentMaxTokens,
      temperature: this.config.agentTemperature,
      system: fullSystemPrompt,
      messages,
      tools: this.toolExecutor.getToolDefinitions(),
    });
    
    // Check for tool use
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    
    if (toolUseBlocks.length === 0) {
      // No tool use - extract final text response
      const textBlock = response.content.find(b => b.type === 'text');
      finalResponse = textBlock?.text || '';
      break;
    }
    
    // Execute tools and continue
    toolCallCount++;
    
    for (const toolUse of toolUseBlocks) {
      const result = await this.toolExecutor.execute(toolUse);
      allCitations.push(...result.citations);
      
      // Add assistant message with tool use
      messages.push({
        role: 'assistant',
        content: response.content
      });
      
      // Add tool result
      messages.push({
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: result.content
        }]
      });
    }
  }
  
  return {
    response: finalResponse,
    citations: allCitations,
    toolCallCount,
    tokenCounts: { /* ... */ }
  };
}
```


### 7. SYSTEM PROMPT MODIFICATIONS

ADD to MPA_SYSTEM_PROMPT in mpa-prompt-content.ts:

```typescript
const RAG_INSTRUCTIONS = `

KNOWLEDGE BASE TOOLS

You have access to tools for searching the media planning knowledge base. Use these tools to:
- Find specific benchmarks before citing numbers
- Look up audience sizing methodologies
- Retrieve framework guidance for complex decisions

TOOL USAGE RULES

1. ALWAYS use search_knowledge_base or get_benchmark BEFORE citing any benchmark data
2. When you retrieve data, cite it as "Based on Knowledge Base, [finding]"
3. If a tool returns no results, say "My estimate" instead of fabricating citations
4. Do not use tools for basic conversation - only for data retrieval
5. Prefer get_benchmark for specific metrics, search_knowledge_base for broader guidance

CITATION FORMAT

After using a tool, incorporate the citation naturally:
- Good: "Based on Knowledge Base, typical ecommerce CAC runs $25-45."
- Bad: "Industry benchmarks suggest CAC is typically $25-45."

The tool results include pre-formatted citation text - use it directly.
`;

export const MPA_SYSTEM_PROMPT = `${CORE_INSTRUCTIONS}

${RAG_INSTRUCTIONS}

${KB_00_CONTENT}`;
```


## INITIALIZATION SEQUENCE

On first run or when KB changes:

```
1. DocumentProcessor.processAll(KB_PATH)
   → Chunks all 23 KB files
   → Extracts metadata
   → Saves to kb-chunks.json

2. EmbeddingService.initialize(chunks)
   → Builds TF-IDF vocabulary
   → Generates embeddings for all chunks

3. VectorStore.addChunks(chunks, embeddings)
   → Loads into memory
   → Persists to kb-index.json

4. RetrievalEngine.initialize()
   → Loads or builds index
   → Ready for queries
```

On subsequent runs:

```
1. VectorStore.load(kb-index.json)
   → If exists and valid, skip processing
   → If missing or outdated, rebuild
```


## TESTING

Create test-rag.ts:

```typescript
// Test queries to validate RAG system

const TEST_QUERIES = [
  {
    query: "What is typical CAC for ecommerce?",
    expectedSource: "Analytics_Engine",
    expectBenchmark: true
  },
  {
    query: "How do I size an audience of fitness enthusiasts?",
    expectedTopic: "audience",
    expectMethodology: true
  },
  {
    query: "What channels work best for brand awareness?",
    expectedSource: "MPA_Expert_Lens_Channel_Mix",
    expectFramework: true
  }
];

// Run tests and report accuracy
```


## SUCCESS METRICS

After implementation, RAG system should achieve:

| Metric | Target |
|--------|--------|
| search_knowledge_base recall | 90%+ relevant results in top 5 |
| get_benchmark accuracy | 95%+ correct benchmark retrieval |
| Citation inclusion rate | 95%+ of benchmark claims cite source |
| Tool call latency | < 100ms average |
| Index load time | < 2 seconds |


## SCORER IMPACT PROJECTIONS

| Scorer | Current | With RAG | Mechanism |
|--------|---------|----------|-----------|
| source-citation | 52-62% | 92%+ | Tools return pre-formatted citations |
| audience-sizing | 25-40% | 92%+ | get_audience_sizing provides methodology |
| calculation-presence | 66-85% | 92%+ | Benchmarks available for calculations |
| proactive-intelligence | ~85% | 95%+ | Can retrieve relevant insights proactively |

PROJECTED COMPOSITE: 94-96%


## IMPLEMENTATION ORDER

1. Create package.json and install dependencies
2. Implement types.ts with all interfaces
3. Implement document-processor.ts
4. Implement embedding-service.ts (TF-IDF based)
5. Implement vector-store.ts
6. Implement retrieval-engine.ts
7. Implement tool-executor.ts
8. Modify conversation-engine.ts for tool use
9. Update mpa-prompt-content.ts with RAG instructions
10. Create test-rag.ts and validate
11. Run full evaluation suite


## CONSTRAINTS AND NOTES

1. NO external API calls for embeddings - use TF-IDF from natural library
2. All data stays local - no cloud vector stores
3. Must work with existing TypeScript compilation
4. Tool execution must not significantly increase latency
5. Maintain backward compatibility - static KB injection still works as fallback
6. KB_00 still loaded via ALWAYS_INCLUDE for core operating standards
