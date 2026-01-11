# AGENT-CORE PACKAGE SPECIFICATION
# Version 1.0 | January 11, 2026
# Shared Infrastructure for All Kessel Digital Agents

================================================================================
EXECUTIVE SUMMARY
================================================================================

The agent-core package provides shared infrastructure for all agents in the
Kessel Digital Agent Platform (MPA, CA, EAP). This eliminates code duplication
and ensures consistent capabilities across all agents.

BENEFITS:
- Single codebase for LLM providers, RAG, learning systems
- Any agent gets multi-platform support automatically
- Consistent evaluation framework across all agents
- Centralized maintenance and improvements

AGENTS SUPPORTED:
- MPA (Media Planning Agent) - Media planning and optimization
- CA (Consulting Agent) - Strategic consulting workflows
- EAP (Enterprise AI Platform) - Platform administration and orchestration


================================================================================
PART 1: PACKAGE STRUCTURE
================================================================================

```
packages/
└── agent-core/
    ├── src/
    │   ├── providers/           # LLM Provider Abstraction
    │   │   ├── types.ts
    │   │   ├── llm-provider.ts
    │   │   ├── claude-provider.ts
    │   │   ├── openai-provider.ts
    │   │   ├── azure-openai-provider.ts
    │   │   ├── provider-factory.ts
    │   │   └── index.ts
    │   │
    │   ├── embeddings/          # Embedding Provider Abstraction
    │   │   ├── types.ts
    │   │   ├── embedding-provider.ts
    │   │   ├── tfidf-provider.ts
    │   │   ├── openai-embedding-provider.ts
    │   │   ├── azure-embedding-provider.ts
    │   │   ├── embedding-factory.ts
    │   │   └── index.ts
    │   │
    │   ├── vector-stores/       # Vector Store Abstraction
    │   │   ├── types.ts
    │   │   ├── vector-store.ts
    │   │   ├── memory-store.ts
    │   │   ├── azure-search-store.ts
    │   │   ├── store-factory.ts
    │   │   └── index.ts
    │   │
    │   ├── storage/             # Persistent Storage Abstraction
    │   │   ├── types.ts
    │   │   ├── storage-interface.ts
    │   │   ├── json-storage.ts
    │   │   ├── dataverse-storage.ts
    │   │   ├── storage-factory.ts
    │   │   └── index.ts
    │   │
    │   ├── rag/                 # RAG Engine (Configurable)
    │   │   ├── types.ts
    │   │   ├── document-processor.ts
    │   │   ├── retrieval-engine.ts
    │   │   ├── tool-definitions.ts
    │   │   ├── tool-executor.ts
    │   │   └── index.ts
    │   │
    │   ├── learning/            # Learning System
    │   │   ├── types.ts
    │   │   ├── critique-engine.ts
    │   │   ├── success-patterns.ts
    │   │   ├── kb-enhancement.ts
    │   │   ├── user-feedback.ts
    │   │   └── index.ts
    │   │
    │   ├── evaluation/          # Evaluation Framework
    │   │   ├── types.ts
    │   │   ├── conversation-engine.ts
    │   │   ├── scenario-runner.ts
    │   │   ├── scorer-base.ts
    │   │   ├── user-simulator.ts
    │   │   ├── report-generator.ts
    │   │   └── index.ts
    │   │
    │   ├── config/              # Platform Configuration
    │   │   ├── types.ts
    │   │   ├── platform-config.ts
    │   │   ├── agent-config.ts
    │   │   └── index.ts
    │   │
    │   ├── utils/               # Shared Utilities
    │   │   ├── token-counter.ts
    │   │   ├── text-utils.ts
    │   │   ├── logger.ts
    │   │   └── index.ts
    │   │
    │   └── index.ts             # Main exports
    │
    ├── package.json
    ├── tsconfig.json
    └── README.md
```


================================================================================
PART 2: CORE EXPORTS
================================================================================

The package exports through subpath exports for tree-shaking:

```typescript
// Main entry
import { ProviderFactory, RetrievalEngine, ConversationEngine } from '@kessel-digital/agent-core';

// Subpath imports
import { ClaudeProvider, OpenAIProvider } from '@kessel-digital/agent-core/providers';
import { TFIDFProvider, EmbeddingFactory } from '@kessel-digital/agent-core/embeddings';
import { MemoryVectorStore, StoreFactory } from '@kessel-digital/agent-core/vector-stores';
import { JsonStorage, DataverseStorage } from '@kessel-digital/agent-core/storage';
import { DocumentProcessor, RAGToolExecutor } from '@kessel-digital/agent-core/rag';
import { CritiqueEngine, SuccessPatternStore } from '@kessel-digital/agent-core/learning';
import { ScenarioRunner, ReportGenerator } from '@kessel-digital/agent-core/evaluation';
import { getPlatformConfig, validatePlatformConfig } from '@kessel-digital/agent-core/config';
```


================================================================================
PART 3: KEY INTERFACES
================================================================================

LLM PROVIDER INTERFACE
----------------------
```typescript
interface LLMProvider {
  readonly name: string;
  generate(messages: Message[], options?: GenerateOptions): Promise<LLMResponse>;
  generateWithTools(messages: Message[], tools: ToolDefinition[], options?: GenerateOptions): Promise<LLMResponse>;
  formatToolResult(toolCallId: string, result: string): Message;
  isAvailable(): Promise<boolean>;
}
```

EMBEDDING PROVIDER INTERFACE
----------------------------
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

VECTOR STORE INTERFACE
----------------------
```typescript
interface VectorStore {
  readonly name: string;
  addDocuments(documents: IndexedDocument[]): Promise<void>;
  search(embedding: number[], options?: SearchOptions): Promise<SearchResult[]>;
  deleteDocuments(ids: string[]): Promise<void>;
  clear(): Promise<void>;
  count(): Promise<number>;
  isAvailable(): Promise<boolean>;
  saveToFile?(filepath: string): Promise<void>;
  loadFromFile?(filepath: string): Promise<void>;
}
```

STORAGE INTERFACE
-----------------
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

AGENT CONFIG INTERFACE
----------------------
```typescript
interface AgentConfig {
  agent: 'mpa' | 'ca' | 'eap';
  name: string;
  description: string;
  knowledgeBase: {
    source: 'local' | 'sharepoint' | 'azure-blob';
    path?: string;
  };
  systemPrompt: string;
  stepDefinitions?: StepDefinition[];
  critiqueCriteria: CritiqueCriterion[];
  tools: ToolConfig[];
}
```


================================================================================
PART 4: PLATFORM CONFIGURATIONS
================================================================================

Three pre-configured platforms:

BRAINTRUST (Claude)
-------------------
```typescript
{
  platform: 'braintrust',
  llm: { provider: 'claude', model: 'claude-sonnet-4-20250514' },
  embeddings: { provider: 'tfidf', dimensions: 512 },
  vectorStore: { backend: 'memory' },
  storage: { backend: 'json', basePath: './storage' },
}
```

DEVELOPMENT (OpenAI)
--------------------
```typescript
{
  platform: 'development',
  llm: { provider: 'openai', model: 'gpt-4o' },
  embeddings: { provider: 'openai', model: 'text-embedding-3-small' },
  vectorStore: { backend: 'memory' },
  storage: { backend: 'json', basePath: './storage' },
}
```

COPILOT-STUDIO (Azure)
----------------------
```typescript
{
  platform: 'copilot-studio',
  llm: { provider: 'azure-openai', model: 'gpt-4o' },
  embeddings: { provider: 'azure-openai', model: 'text-embedding-ada-002' },
  vectorStore: { backend: 'azure-ai-search' },
  storage: { backend: 'dataverse' },
}
```


================================================================================
PART 5: USAGE EXAMPLE
================================================================================

```typescript
import {
  getPlatformConfig,
  ProviderFactory,
  EmbeddingFactory,
  StoreFactory,
  RetrievalEngine,
  RAGToolExecutor,
  CritiqueEngine,
  ConversationEngine,
  ScenarioRunner,
  ReportGenerator,
} from '@kessel-digital/agent-core';

// Load platform configuration
const platformConfig = getPlatformConfig('braintrust');

// Create providers
const llmProvider = ProviderFactory.createLLM(platformConfig.llm.primary);
const critiqueProvider = ProviderFactory.createLLM(platformConfig.llm.critique!);
const embeddingProvider = EmbeddingFactory.create(platformConfig.embeddings);
const vectorStore = StoreFactory.create(platformConfig.vectorStore, embeddingProvider);

// Create RAG engine
const ragEngine = new RetrievalEngine(embeddingProvider, vectorStore, {
  kbPath: './kb',
  indexPath: './storage/kb-index.json',
});

const ragTools = new RAGToolExecutor(ragEngine, 'MPA');

// Create learning components
const critiqueEngine = new CritiqueEngine(critiqueProvider, {
  selfCritiqueEnabled: true,
  critiqueCriteria: MPA_CRITIQUE_CRITERIA,
  // ...
});

// Create conversation engine
const engine = new ConversationEngine({
  provider: llmProvider,
  systemPrompt: MPA_SYSTEM_PROMPT,
  ragToolExecutor: ragTools,
  critiqueEngine,
});

// Run evaluation
const runner = new ScenarioRunner({
  engine,
  scorers: MPA_SCORERS,
});

const result = await runner.run(scenario);
```


================================================================================
PART 6: DEPENDENCIES
================================================================================

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
PART 7: FILE COUNT SUMMARY
================================================================================

Total files in agent-core package: 45 files

providers/          6 files
embeddings/         6 files
vector-stores/      5 files
storage/            5 files
rag/                5 files
learning/           5 files
evaluation/         6 files
config/             3 files
utils/              4 files

Root files: package.json, tsconfig.json, README.md, index.ts, AGENT_CORE_SPECIFICATION.md


================================================================================
END OF SPECIFICATION
================================================================================
