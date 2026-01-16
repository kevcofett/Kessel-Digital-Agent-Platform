# VS CODE CLAUDE: MPA MULTI-PLATFORM IMPLEMENTATION
# Version 2.0 | January 11, 2026
# 
# Copy this entire file content into VS Code Claude to begin implementation

================================================================================
OBJECTIVE
================================================================================

Implement a multi-platform MPA enhancement system supporting:
- Claude (Anthropic) - Braintrust evaluation
- OpenAI (GPT-4o) - Alternative provider  
- Microsoft Copilot Studio - Production deployment

Current State: 86.8% composite score
Target: 96%+ composite score with platform-agnostic architecture


================================================================================
WORKING DIRECTORY
================================================================================

cd release/v5.5/agents/mpa/base/tests/braintrust/


================================================================================
SPECIFICATION DOCUMENTS (Read in order)
================================================================================

READ THESE FILES BEFORE IMPLEMENTING:

1. MULTI_PLATFORM_SPECIFICATION.md (2,876 lines)
   - Complete multi-platform architecture
   - Provider abstractions (LLM, Embedding, Vector, Storage)
   - Platform configurations
   - Copilot Studio integration

2. AGENTIC_RAG_SPECIFICATION.md (714 lines)
   - RAG architecture overview
   - Tool definitions
   - Success criteria

3. VSCODE_RAG_IMPLEMENTATION_PART1.md (1,130 lines)
   - RAG Phases 1-5
   - Types, document processor, embeddings, vector store

4. VSCODE_RAG_IMPLEMENTATION_PART2.md (1,136 lines)
   - RAG Phases 6-11
   - Retrieval engine, tools, integration, testing

5. CONTINUOUS_LEARNING_SPECIFICATION.md (1,906 lines)
   - Four-layer learning system
   - Self-critique, success patterns, KB enhancement, feedback

6. VSCODE_LEARNING_IMPLEMENTATION.md (204 lines)
   - Learning system quick reference


================================================================================
IMPLEMENTATION PHASES
================================================================================

PHASE 1: Provider Abstraction Layer
-----------------------------------
Create directory: providers/

Files to create:
- providers/llm-provider.ts
- providers/claude-provider.ts
- providers/openai-provider.ts
- providers/azure-openai-provider.ts
- providers/provider-factory.ts
- providers/index.ts

Key interface:
```typescript
interface LLMProvider {
  readonly name: string;
  generate(messages: Message[], options?: GenerateOptions): Promise<LLMResponse>;
  generateWithTools(messages: Message[], tools: ToolDefinition[], options?: GenerateOptions): Promise<LLMResponse>;
  formatToolResult(toolCallId: string, result: string): Message;
  isAvailable(): Promise<boolean>;
}
```


PHASE 2: Embedding Provider Abstraction
---------------------------------------
Create directory: embeddings/

Files to create:
- embeddings/embedding-provider.ts
- embeddings/tfidf-provider.ts
- embeddings/openai-embedding-provider.ts
- embeddings/azure-embedding-provider.ts
- embeddings/embedding-factory.ts
- embeddings/index.ts

Key interface:
```typescript
interface EmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;
  initialize(documents: string[]): Promise<void>;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  cosineSimilarity(a: number[], b: number[]): number;
}
```


PHASE 3: Vector Store Abstraction
---------------------------------
Create directory: vector-stores/

Files to create:
- vector-stores/vector-store.ts
- vector-stores/memory-store.ts
- vector-stores/azure-search-store.ts
- vector-stores/store-factory.ts
- vector-stores/index.ts

Key interface:
```typescript
interface VectorStore {
  readonly name: string;
  addDocuments(documents: IndexedDocument[]): Promise<void>;
  search(embedding: number[], options?: SearchOptions): Promise<SearchResult[]>;
  deleteDocuments(ids: string[]): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
  isAvailable(): Promise<boolean>;
}
```


PHASE 4: Storage Backend Abstraction
------------------------------------
Create directory: storage/

Files to create:
- storage/storage-interface.ts
- storage/json-storage.ts
- storage/dataverse-storage.ts
- storage/storage-factory.ts
- storage/index.ts

Key interface:
```typescript
interface Storage<T extends StorageItem> {
  readonly name: string;
  create(item: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T>;
  read(id: string): Promise<T | null>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  list(options?: QueryOptions): Promise<T[]>;
  count(filter?: Record<string, unknown>): Promise<number>;
  isAvailable(): Promise<boolean>;
}
```


PHASE 5: Platform Configuration
-------------------------------
Create directory: config/

Files to create:
- config/platform-config.ts
- config/index.ts

Platform configs:
```typescript
// Braintrust (Claude)
{ llm: 'claude', embeddings: 'tfidf', vectorStore: 'memory', storage: 'json' }

// Development (OpenAI)
{ llm: 'openai', embeddings: 'openai', vectorStore: 'memory', storage: 'json' }

// Production (Copilot Studio)
{ llm: 'azure-openai', embeddings: 'azure-openai', vectorStore: 'azure-ai-search', storage: 'dataverse' }
```


PHASE 6: RAG System with Providers
----------------------------------
Update directory: rag/

Files to create/update:
- rag/types.ts (update for providers)
- rag/document-processor.ts
- rag/retrieval-engine.ts (use embedding/store providers)
- rag/tool-executor.ts
- rag/index.ts
- rag/test-rag.ts
- rag/index-kb.ts

RAG Tools:
1. search_knowledge_base - General semantic search
2. get_benchmark - Specific metric lookup
3. get_audience_sizing - Audience estimates with methodology


PHASE 7: Learning System with Providers
---------------------------------------
Create directory: learning/

Files to create:
- learning/types.ts
- learning/storage/ (directory)
- learning/storage/storage-interface.ts
- learning/storage/json-storage.ts
- learning/storage/dataverse-storage.ts
- learning/criteria/ (directory)
- learning/criteria/critique-criteria.ts
- learning/self-critique.ts (use LLM provider)
- learning/success-patterns.ts (use storage + embeddings)
- learning/kb-enhancement-pipeline.ts
- learning/user-feedback.ts
- learning/index.ts
- learning/test-learning.ts

Learning Layers:
- Layer C: Self-Critique (always on, no storage)
- Layer B: Success Patterns (optional, needs storage)
- Layer A: KB Enhancement (offline, file output)
- Layer D: User Feedback (optional, needs Dataverse)


PHASE 8: Copilot Studio Assets
------------------------------
Create directory: copilot-studio/

Files to create:
- copilot-studio/flows/rag-search-flow.json
- copilot-studio/flows/self-critique-flow.json
- copilot-studio/flows/feedback-flow.json
- copilot-studio/dataverse/tables.json
- copilot-studio/azure-functions/kb-indexer/index.ts
- copilot-studio/azure-functions/host.json


PHASE 9: Integration
--------------------
Update existing files:
- conversation-engine.ts (use provider factory)
- mpa-multi-turn-types.ts (add platform config)
- package.json (add Azure dependencies)


================================================================================
PACKAGE.JSON DEPENDENCIES
================================================================================

Add these dependencies:
```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "openai": "^4.28.0",
    "@azure/search-documents": "^12.0.0",
    "@azure/storage-blob": "^12.17.0",
    "natural": "^6.10.0",
    "braintrust": "^0.0.160",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/natural": "^5.1.0",
    "typescript": "^5.3.0"
  }
}
```


================================================================================
TESTING CHECKPOINTS
================================================================================

After Phase 5 (Provider Abstractions):
```bash
npx tsc  # Must compile clean
```

After Phase 6 (RAG):
```bash
npx tsc
node dist/rag/test-rag.js  # 7 tests must pass
```

After Phase 7 (Learning):
```bash
npx tsc
node dist/learning/test-learning.js  # 4 tests must pass
```

Full Validation:
```bash
# Build KB index
node dist/rag/index-kb.js

# Test with Claude
MPA_PLATFORM=braintrust node dist/mpa-multi-turn-eval.js --fast

# Test with OpenAI (if API key available)
MPA_PLATFORM=development node dist/mpa-multi-turn-eval.js --fast
```


================================================================================
SUCCESS CRITERIA
================================================================================

Provider Layer:
- [ ] LLM Provider interface implemented
- [ ] Claude, OpenAI, Azure OpenAI providers working
- [ ] Provider factory creates correct provider from config

Embedding Layer:
- [ ] TF-IDF provider works locally (no API)
- [ ] OpenAI embedding provider works
- [ ] Azure embedding provider works

Vector Store Layer:
- [ ] Memory store works for dev
- [ ] Azure AI Search store works (stub OK if no Azure)

Storage Layer:
- [ ] JSON storage works for dev
- [ ] Dataverse storage compiles (stub OK)

RAG System:
- [ ] 7 RAG tests pass
- [ ] KB index builds successfully
- [ ] Search returns relevant results

Learning System:
- [ ] 4 learning tests pass
- [ ] Self-critique catches missing citations
- [ ] Success patterns store/retrieve works

Integration:
- [ ] TypeScript compiles without errors
- [ ] Composite score > 92% with Claude
- [ ] Composite score > 90% with OpenAI
- [ ] No regressions > 5% on any scenario


================================================================================
FILE CREATION ORDER
================================================================================

Session 1: Abstractions (Phases 1-5)
------------------------------------
1. providers/llm-provider.ts
2. providers/claude-provider.ts
3. providers/openai-provider.ts
4. providers/azure-openai-provider.ts
5. providers/provider-factory.ts
6. providers/index.ts
7. embeddings/embedding-provider.ts
8. embeddings/tfidf-provider.ts
9. embeddings/openai-embedding-provider.ts
10. embeddings/azure-embedding-provider.ts
11. embeddings/embedding-factory.ts
12. embeddings/index.ts
13. vector-stores/vector-store.ts
14. vector-stores/memory-store.ts
15. vector-stores/azure-search-store.ts
16. vector-stores/store-factory.ts
17. vector-stores/index.ts
18. storage/storage-interface.ts
19. storage/json-storage.ts
20. storage/dataverse-storage.ts
21. storage/storage-factory.ts
22. storage/index.ts
23. config/platform-config.ts
24. config/index.ts

TEST: npx tsc (must compile)

Session 2: RAG + Learning (Phases 6-7)
--------------------------------------
25. rag/types.ts
26. rag/document-processor.ts
27. rag/retrieval-engine.ts
28. rag/tool-executor.ts
29. rag/index.ts
30. rag/test-rag.ts
31. rag/index-kb.ts
32. learning/types.ts
33. learning/criteria/critique-criteria.ts
34. learning/self-critique.ts
35. learning/success-patterns.ts
36. learning/kb-enhancement-pipeline.ts
37. learning/user-feedback.ts
38. learning/index.ts
39. learning/test-learning.ts

TEST: node dist/rag/test-rag.js (7 pass)
TEST: node dist/learning/test-learning.js (4 pass)

Session 3: Copilot Studio + Integration (Phases 8-9)
----------------------------------------------------
40. copilot-studio/flows/rag-search-flow.json
41. copilot-studio/flows/self-critique-flow.json
42. copilot-studio/flows/feedback-flow.json
43. copilot-studio/dataverse/tables.json
44. copilot-studio/azure-functions/kb-indexer/index.ts
45. copilot-studio/azure-functions/host.json
46. Update: conversation-engine.ts
47. Update: mpa-multi-turn-types.ts
48. Update: package.json

TEST: Full eval with --fast flag


================================================================================
CRITICAL NOTES
================================================================================

1. READ SPEC FILES FIRST
   - MULTI_PLATFORM_SPECIFICATION.md has ALL implementation details
   - Don't skip - it contains exact code for each component

2. GRACEFUL DEGRADATION
   - All features must work when storage unavailable
   - TF-IDF embeddings require no external API
   - JSON storage always works locally

3. TOOL USE LOOP
   - Max 3 tool calls per turn
   - Handle tool_use stop reason
   - Format tool results correctly per provider

4. SELF-CRITIQUE
   - Uses Haiku/gpt-4o-mini for speed
   - < 300ms latency target
   - Only revise when necessary

5. PLATFORM SWITCHING
   - MPA_PLATFORM env var controls provider selection
   - Default to 'braintrust' (Claude)
   - Config validates required env vars


================================================================================
BEGIN IMPLEMENTATION
================================================================================

Start by reading MULTI_PLATFORM_SPECIFICATION.md, then create files in order.

First command:
```bash
cd release/v5.5/agents/mpa/base/tests/braintrust
cat MULTI_PLATFORM_SPECIFICATION.md
```
