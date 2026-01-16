# VS CODE CONSOLIDATED IMPLEMENTATION PROMPT
# agent-core Package + MPA/CA/EAP Migration
# Version 1.0 | January 11, 2026

================================================================================
MISSION BRIEFING
================================================================================

You are implementing the shared @kessel-digital/agent-core package and migrating
MPA, CA, and EAP to use it. This eliminates code duplication and provides all
agents with:

- Multi-platform LLM support (Claude, OpenAI, Azure)
- Agentic RAG with knowledge base search
- Self-critique for quality improvement
- Success pattern learning
- Consistent evaluation framework

PRIORITY: CA deploys to Mastercard next week, so complete implementation is critical.


================================================================================
REPOSITORY CONTEXT
================================================================================

Repository: Kessel-Digital-Agent-Platform
Branch: deploy/personal

Key Paths:
- packages/agent-core/           # NEW: Shared infrastructure
- release/v5.5/agents/mpa/       # Existing MPA (migrate to use agent-core)
- release/v5.5/agents/ca/        # CA (create evaluation harness)
- release/v5.5/agents/eap/       # EAP (create evaluation harness)


================================================================================
IMPLEMENTATION SESSIONS
================================================================================

SESSION 1: Create agent-core Package (45 files)
SESSION 2: Migrate MPA to use agent-core
SESSION 3: Create CA evaluation harness
SESSION 4: Create EAP evaluation harness
SESSION 5: Integration testing across all platforms


================================================================================
SESSION 1: AGENT-CORE PACKAGE
================================================================================

OBJECTIVE: Create the shared infrastructure package

LOCATION: packages/agent-core/

FILE CREATION ORDER:

Phase 1.1: Package Setup (3 files)
-------------------------------
packages/agent-core/package.json
packages/agent-core/tsconfig.json
packages/agent-core/README.md

Phase 1.2: Configuration Module (4 files)
-----------------------------------------
packages/agent-core/src/config/types.ts
packages/agent-core/src/config/platform-config.ts
packages/agent-core/src/config/agent-config.ts
packages/agent-core/src/config/index.ts

Phase 1.3: LLM Providers (7 files)
----------------------------------
packages/agent-core/src/providers/types.ts
packages/agent-core/src/providers/llm-provider.ts
packages/agent-core/src/providers/claude-provider.ts
packages/agent-core/src/providers/openai-provider.ts
packages/agent-core/src/providers/azure-openai-provider.ts
packages/agent-core/src/providers/provider-factory.ts
packages/agent-core/src/providers/index.ts

Phase 1.4: Embedding Providers (7 files)
----------------------------------------
packages/agent-core/src/embeddings/types.ts
packages/agent-core/src/embeddings/embedding-provider.ts
packages/agent-core/src/embeddings/tfidf-provider.ts
packages/agent-core/src/embeddings/openai-embedding-provider.ts
packages/agent-core/src/embeddings/azure-embedding-provider.ts
packages/agent-core/src/embeddings/embedding-factory.ts
packages/agent-core/src/embeddings/index.ts

Phase 1.5: Vector Stores (6 files)
----------------------------------
packages/agent-core/src/vector-stores/types.ts
packages/agent-core/src/vector-stores/vector-store.ts
packages/agent-core/src/vector-stores/memory-store.ts
packages/agent-core/src/vector-stores/azure-search-store.ts
packages/agent-core/src/vector-stores/store-factory.ts
packages/agent-core/src/vector-stores/index.ts

Phase 1.6: Storage Backends (6 files)
-------------------------------------
packages/agent-core/src/storage/types.ts
packages/agent-core/src/storage/storage-interface.ts
packages/agent-core/src/storage/json-storage.ts
packages/agent-core/src/storage/dataverse-storage.ts
packages/agent-core/src/storage/storage-factory.ts
packages/agent-core/src/storage/index.ts

Phase 1.7: RAG Engine (6 files)
-------------------------------
packages/agent-core/src/rag/types.ts
packages/agent-core/src/rag/document-processor.ts
packages/agent-core/src/rag/retrieval-engine.ts
packages/agent-core/src/rag/tool-definitions.ts
packages/agent-core/src/rag/tool-executor.ts
packages/agent-core/src/rag/index.ts

Phase 1.8: Learning System (6 files)
------------------------------------
packages/agent-core/src/learning/types.ts
packages/agent-core/src/learning/critique-engine.ts
packages/agent-core/src/learning/success-patterns.ts
packages/agent-core/src/learning/kb-enhancement.ts
packages/agent-core/src/learning/user-feedback.ts
packages/agent-core/src/learning/index.ts

Phase 1.9: Evaluation Framework (7 files)
-----------------------------------------
packages/agent-core/src/evaluation/types.ts
packages/agent-core/src/evaluation/conversation-engine.ts
packages/agent-core/src/evaluation/scenario-runner.ts
packages/agent-core/src/evaluation/scorer-base.ts
packages/agent-core/src/evaluation/user-simulator.ts
packages/agent-core/src/evaluation/report-generator.ts
packages/agent-core/src/evaluation/index.ts

Phase 1.10: Utilities (5 files)
-------------------------------
packages/agent-core/src/utils/token-counter.ts
packages/agent-core/src/utils/text-utils.ts
packages/agent-core/src/utils/logger.ts
packages/agent-core/src/utils/index.ts
packages/agent-core/src/index.ts

TOTAL SESSION 1: 45 files

CHECKPOINT:
```bash
cd packages/agent-core
npm install
npx tsc
# Must compile without errors
```


================================================================================
SESSION 2: MIGRATE MPA
================================================================================

OBJECTIVE: Update MPA to import from agent-core instead of local files

LOCATION: release/v5.5/agents/mpa/base/tests/braintrust/

FILES TO CREATE (4 files):
--------------------------
mpa-config.ts           # MPA agent configuration
mpa-critique-criteria.ts # MPA quality rules
mpa-eval.ts             # Updated eval runner
package.json            # Updated with agent-core dependency

FILES TO UPDATE (2 files):
--------------------------
scenarios/index.ts      # Update imports
scorers/index.ts        # Update imports

DIRECTORIES TO REMOVE (after verification):
-------------------------------------------
providers/
embeddings/
vector-stores/
storage/ (code only, keep data)
rag/ (code only, keep index)
learning/
config/

FILES TO REMOVE:
----------------
conversation-engine.ts
mpa-multi-turn-eval.ts
mpa-multi-turn-types.ts

CHECKPOINT:
```bash
cd release/v5.5/agents/mpa/base/tests/braintrust
npm install
npm run build
npm run eval:fast
# Must pass with >90% score
```


================================================================================
SESSION 3: CREATE CA EVALUATION HARNESS
================================================================================

OBJECTIVE: Create CA agent with evaluation capability using agent-core

LOCATION: release/v5.5/agents/ca/base/tests/braintrust/

FILES TO CREATE:

Phase 3.1: Configuration (4 files)
----------------------------------
ca-config.ts
ca-prompt-content.ts
ca-critique-criteria.ts
ca-eval.ts

Phase 3.2: Package Setup (2 files)
----------------------------------
package.json
tsconfig.json

Phase 3.3: Scenarios (9 files)
------------------------------
scenarios/index.ts
scenarios/initial-discovery.ts
scenarios/stakeholder-alignment.ts
scenarios/technology-assessment.ts
scenarios/change-roadmap.ts
scenarios/roi-justification.ts
scenarios/risk-mitigation.ts
scenarios/implementation-planning.ts
scenarios/executive-briefing.ts

Phase 3.4: Scorers (8 files)
----------------------------
scorers/index.ts
scorers/recommendation-quality.ts
scorers/stakeholder-awareness.ts
scorers/evidence-based-reasoning.ts
scorers/risk-acknowledgment.ts
scorers/implementation-feasibility.ts
scorers/executive-communication.ts
scorers/follow-up-guidance.ts

TOTAL SESSION 3: 23 files

CHECKPOINT:
```bash
cd release/v5.5/agents/ca/base/tests/braintrust
npm install
npm run build
npm run eval:fast
# Must pass with >85% score (new agent baseline)
```


================================================================================
SESSION 4: CREATE EAP EVALUATION HARNESS
================================================================================

OBJECTIVE: Create EAP agent with evaluation capability using agent-core

LOCATION: release/v5.5/agents/eap/base/tests/braintrust/

FILES TO CREATE:

Phase 4.1: Configuration (4 files)
----------------------------------
eap-config.ts
eap-prompt-content.ts
eap-critique-criteria.ts
eap-eval.ts

Phase 4.2: Package Setup (2 files)
----------------------------------
package.json
tsconfig.json

Phase 4.3: Scenarios (7 files)
------------------------------
scenarios/index.ts
scenarios/agent-routing.ts
scenarios/platform-status.ts
scenarios/user-onboarding.ts
scenarios/troubleshooting.ts
scenarios/analytics-request.ts
scenarios/configuration-help.ts

Phase 4.4: Scorers (5 files)
----------------------------
scorers/index.ts
scorers/routing-accuracy.ts
scorers/platform-knowledge.ts
scorers/helpful-guidance.ts
scorers/escalation-appropriateness.ts

TOTAL SESSION 4: 18 files

CHECKPOINT:
```bash
cd release/v5.5/agents/eap/base/tests/braintrust
npm install
npm run build
npm run eval:fast
# Must pass with >85% score (new agent baseline)
```


================================================================================
SESSION 5: INTEGRATION TESTING
================================================================================

OBJECTIVE: Verify all agents work with all platforms

TESTS TO RUN:

```bash
# Test agent-core builds
cd packages/agent-core
npm run build

# Test MPA with all platforms
cd release/v5.5/agents/mpa/base/tests/braintrust
npm run eval:fast                          # Braintrust (Claude)
npm run eval:fast -- --platform=development # OpenAI

# Test CA with all platforms
cd release/v5.5/agents/ca/base/tests/braintrust
npm run eval:fast                          # Braintrust (Claude)
npm run eval:fast -- --platform=development # OpenAI

# Test EAP with all platforms
cd release/v5.5/agents/eap/base/tests/braintrust
npm run eval:fast                          # Braintrust (Claude)
npm run eval:fast -- --platform=development # OpenAI
```

SUCCESS CRITERIA:
- agent-core compiles without errors
- MPA: >90% composite score on both platforms
- CA: >85% composite score on both platforms
- EAP: >85% composite score on both platforms


================================================================================
KEY INTERFACES TO IMPLEMENT
================================================================================

LLM PROVIDER:
```typescript
interface LLMProvider {
  readonly name: string;
  generate(messages: Message[], options?: GenerateOptions): Promise<LLMResponse>;
  generateWithTools(messages: Message[], tools: ToolDefinition[], options?: GenerateOptions): Promise<LLMResponse>;
  formatToolResult(toolCallId: string, result: string): Message;
  isAvailable(): Promise<boolean>;
}
```

EMBEDDING PROVIDER:
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

VECTOR STORE:
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

STORAGE:
```typescript
interface Storage<T extends StorageItem> {
  readonly name: string;
  create(item: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T>;
  read(id: string): Promise<T | null>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  list(options?: QueryOptions): Promise<T[]>;
}
```

SCORER:
```typescript
interface Scorer {
  name: string;
  description: string;
  evaluate(response: string, context: ConversationContext): Promise<ScorerResult>;
}
```


================================================================================
PLATFORM CONFIGURATIONS
================================================================================

BRAINTRUST (Default):
```typescript
{
  platform: 'braintrust',
  llm: {
    primary: { provider: 'claude', model: 'claude-sonnet-4-20250514' },
    critique: { provider: 'claude', model: 'claude-3-5-haiku-20241022' },
  },
  embeddings: { provider: 'tfidf', dimensions: 512 },
  vectorStore: { backend: 'memory' },
  storage: { backend: 'json', basePath: './storage' },
}
```

DEVELOPMENT (OpenAI):
```typescript
{
  platform: 'development',
  llm: {
    primary: { provider: 'openai', model: 'gpt-4o' },
    critique: { provider: 'openai', model: 'gpt-4o-mini' },
  },
  embeddings: { provider: 'openai', model: 'text-embedding-3-small' },
  vectorStore: { backend: 'memory' },
  storage: { backend: 'json', basePath: './storage' },
}
```

COPILOT-STUDIO (Azure):
```typescript
{
  platform: 'copilot-studio',
  llm: {
    primary: { provider: 'azure-openai', model: 'gpt-4o' },
    critique: { provider: 'azure-openai', model: 'gpt-4o-mini' },
  },
  embeddings: { provider: 'azure-openai', model: 'text-embedding-ada-002' },
  vectorStore: { backend: 'azure-ai-search' },
  storage: { backend: 'dataverse' },
}
```


================================================================================
DEPENDENCIES
================================================================================

AGENT-CORE:
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
  }
}
```

EACH AGENT:
```json
{
  "dependencies": {
    "@kessel-digital/agent-core": "file:../../../../../../packages/agent-core",
    "dotenv": "^16.3.1"
  }
}
```


================================================================================
CRITICAL IMPLEMENTATION NOTES
================================================================================

1. READ SPECIFICATION FILES FIRST
   Before implementing, read these files in packages/agent-core/:
   - AGENT_CORE_SPECIFICATION.md (full code for all modules)
   - MPA_MIGRATION_SPECIFICATION.md (MPA migration details)
   - CA_AGENT_SPECIFICATION.md (CA implementation details)
   - EAP_AGENT_SPECIFICATION.md (EAP implementation details)

2. TOOL USE LOOP
   - Max 3 tool calls per turn
   - Handle tool_use stop reason correctly
   - Format tool results per provider (Claude vs OpenAI different)

3. GRACEFUL DEGRADATION
   - TF-IDF embeddings require no external API
   - JSON storage always works
   - Memory vector store needs no setup

4. SELF-CRITIQUE
   - Uses Haiku/gpt-4o-mini for speed
   - Target <300ms latency
   - Only revise when criteria violated

5. PLATFORM SWITCHING
   - AGENT_PLATFORM env var controls provider
   - Defaults to 'braintrust' (Claude)
   - Config validates required env vars


================================================================================
FIRST COMMAND
================================================================================

```bash
# Start by reading the full specification
cd packages/agent-core
cat AGENT_CORE_SPECIFICATION.md | head -1000
```

Then implement Session 1 (45 files for agent-core package).


================================================================================
FILE COUNT SUMMARY
================================================================================

Session 1: agent-core package    = 45 files
Session 2: MPA migration         =  6 files (+ deletions)
Session 3: CA harness            = 23 files
Session 4: EAP harness           = 18 files

TOTAL NEW FILES: 92 files


================================================================================
GIT COMMIT STRATEGY
================================================================================

After each session, commit with:

Session 1:
```bash
git add packages/agent-core/
git commit -m "feat: Create @kessel-digital/agent-core shared infrastructure package

- LLM providers: Claude, OpenAI, Azure OpenAI
- Embedding providers: TF-IDF, OpenAI, Azure
- Vector stores: Memory, Azure AI Search
- Storage backends: JSON, Dataverse
- RAG engine with tool execution
- Learning system with self-critique
- Evaluation framework with scorers"
```

Session 2:
```bash
git add release/v5.5/agents/mpa/
git commit -m "refactor: Migrate MPA to use @kessel-digital/agent-core

- Remove duplicate infrastructure code
- Import providers from agent-core
- Update eval runner to use shared components
- Maintain 100% backward compatibility"
```

Session 3:
```bash
git add release/v5.5/agents/ca/
git commit -m "feat: Create CA evaluation harness using agent-core

- 8 evaluation scenarios
- 7 quality scorers
- Consulting-specific critique criteria
- Ready for Mastercard deployment"
```

Session 4:
```bash
git add release/v5.5/agents/eap/
git commit -m "feat: Create EAP evaluation harness using agent-core

- 6 evaluation scenarios
- 4 quality scorers
- Platform orchestration focus"
```

Final:
```bash
git push origin deploy/personal
```


================================================================================
END OF IMPLEMENTATION PROMPT
================================================================================
