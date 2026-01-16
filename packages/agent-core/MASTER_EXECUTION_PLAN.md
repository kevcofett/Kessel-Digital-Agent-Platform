# MASTER EXECUTION PLAN: Agent-Core RAG Optimization
# 50-Step Implementation Guide

**Created:** 2026-01-12
**Branch:** deploy/personal → deploy/mastercard
**Estimated Total Time:** 10-15 hours

---

## EXECUTIVE SUMMARY

This plan implements a comprehensive RAG (Retrieval-Augmented Generation) optimization system for the Kessel-Digital-Agent-Platform. It extracts reusable components from MPA into a shared `agent-core` package, enabling all three agents (MPA, CA, EAP) to benefit from:

- Semantic search with hybrid retrieval
- KB impact tracking and automated improvement proposals
- Environment-aware provider switching (personal vs corporate)
- Consistent evaluation frameworks

---

## PHASE OVERVIEW

| Phase | Name | Steps | Time | Description |
|-------|------|-------|------|-------------|
| 1 | Foundation | 1-20 | 3-4h | Agent scaffolds, KB migration, configs |
| 2 | Semantic Embedding | 21-27 | 2-3h | OpenAI, Azure, hybrid retrieval |
| 3 | KB Impact Tracking | 28-37 | 2-3h | Usage tracking, impact analysis, proposals |
| 4 | Corporate Providers | 38-44 | 3-4h | Azure LLM, Copilot Studio, Dataverse |
| 5 | Environment Config | 45-50 | 1-2h | Provider factory, branch management |

---

## DEPENDENCIES

```
Phase 1 (Foundation)
    ↓
Phase 2 (Semantic Embedding)
    ↓
Phase 3 (KB Impact Tracking)
    ↓
Phase 4 (Corporate Providers)
    ↓
Phase 5 (Environment Config)
```

Each phase depends on the previous phase being complete. Do not skip phases.

---

## PHASE DOCUMENTS

All phase documents are located in:
```
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core/
```

### Phase 1: Foundation
**File:** `PHASE_1_FOUNDATION.md`
**Steps:** 1-20

Creates the foundational structure for all three agents:
- Verifies agent-core builds
- Creates MPA agent configuration with 10-step framework keywords
- Creates CA agent configuration with consulting domain keywords
- Creates EAP agent configuration with AI/ML platform keywords
- Migrates KB files from legacy repositories
- Sets up package.json with correct import paths
- Creates evaluation runners for each agent

**VS Code Prompt:**
```
Read and execute PHASE_1_FOUNDATION.md
Execute steps 1-20 in order
Start with: cd packages/agent-core && npm run build
```

---

### Phase 2: Semantic Embedding
**File:** `PHASE_2_SEMANTIC_EMBEDDING.md`
**Steps:** 21-27

Implements semantic search capabilities:
- Creates embedding type definitions
- Implements OpenAIEmbeddingProvider (text-embedding-3-small/large, ada-002)
- Implements AzureOpenAIEmbeddingProvider
- Creates HybridRetrievalEngine with Reciprocal Rank Fusion (RRF)
- Implements embedding factory with environment detection
- Updates exports

**VS Code Prompt:**
```
After completing Phase 1, execute Phase 2.
Read and execute PHASE_2_SEMANTIC_EMBEDDING.md
Execute steps 21-27 in order
Build and verify: npm run build
```

---

### Phase 3: KB Impact Tracking
**File:** `PHASE_3_KB_IMPACT_TRACKING.md`
**Steps:** 28-37

Implements KB usage tracking and improvement system:
- Creates KB impact tracking types (usage records, document impact, proposals)
- Implements BaseKBImpactTracker with pluggable storage
- Creates LocalKBImpactStorage for development
- Implements KBUpdatePipeline for automated proposals
- Creates agent-specific trackers (MPA, CA, EAP)
- Adds uuid dependency

**VS Code Prompt:**
```
After completing Phase 2, execute Phase 3.
Read and execute PHASE_3_KB_IMPACT_TRACKING.md
Execute steps 28-37 in order
NOTE: Create learning/ directories in each agent if needed
Build and verify: npm run build
```

---

### Phase 4: Corporate Providers
**File:** `PHASE_4_CORPORATE_PROVIDERS.md`
**Steps:** 38-44

Implements Mastercard/corporate environment providers:
- Implements AzureOpenAILLMProvider with streaming
- Implements CopilotStudioLLMProvider with Direct Line API
- Implements DataverseStorageProvider for documents
- Implements DataverseKBImpactStorage for tracking data
- Updates provider exports

**VS Code Prompt:**
```
After completing Phase 3, execute Phase 4.
Read and execute PHASE_4_CORPORATE_PROVIDERS.md
Execute steps 38-44 in order
Build and verify: rm -rf dist && npm run build
```

---

### Phase 5: Environment Configuration
**File:** `PHASE_5_ENVIRONMENT_CONFIG.md`
**Steps:** 45-50

Creates environment-aware configuration system:
- Creates environment type definitions
- Implements EnvironmentLoader with file and env var support
- Creates ProviderFactory for environment-aware instantiation
- Creates JSON config files for personal and corporate
- Creates deploy/mastercard branch

**VS Code Prompt:**
```
After completing Phase 4, execute Phase 5.
Read and execute PHASE_5_ENVIRONMENT_CONFIG.md
Execute steps 45-50 in order
NOTE: Create config/ directories if needed
Build and verify: rm -rf dist && npm run build
Then create deploy/mastercard branch per instructions
```

---

## QUICK START

### Option A: Sequential Execution (Recommended)

Execute each phase in order, waiting for completion before starting the next:

```bash
# Start with Phase 1
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git checkout deploy/personal

# Give VS Code Claude the Phase 1 prompt
# Wait for completion
# Give VS Code Claude the Phase 2 prompt
# ... continue through Phase 5
```

### Option B: Parallel Execution (Advanced)

If you have multiple VS Code Claude instances:
- Instance 1: Phase 1, then Phase 2
- Instance 2: Waits for Phase 2, then Phase 3 + Phase 4
- Instance 1: Phase 5 after Phase 4 complete

---

## FINAL VERIFICATION

After all phases complete, verify:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# 1. Verify agent-core builds
cd packages/agent-core && npm run build
echo "Build status: $?"

# 2. Verify all phase files exist
ls -la PHASE_*.md

# 3. Verify agents have KB files
find release/v5.5/agents -name "*.txt" -o -name "*.md" | wc -l

# 4. Verify both branches exist
git branch -a | grep deploy/

# 5. Verify exports work
node -e "import('@kessel-digital/agent-core').then(m => console.log(Object.keys(m).length + ' exports'))"
```

---

## ARCHITECTURE OVERVIEW

### Directory Structure After Completion

```
Kessel-Digital-Agent-Platform/
├── packages/
│   └── agent-core/
│       ├── src/
│       │   ├── index.ts
│       │   ├── config/
│       │   │   ├── environment-types.ts
│       │   │   ├── environment-loader.ts
│       │   │   ├── provider-factory.ts
│       │   │   └── index.ts
│       │   ├── providers/
│       │   │   ├── interfaces.ts
│       │   │   ├── claude-llm.ts
│       │   │   ├── azure-openai-llm.ts
│       │   │   ├── copilot-studio-llm.ts
│       │   │   ├── openai-embedding.ts
│       │   │   ├── azure-openai-embedding.ts
│       │   │   ├── embedding-factory.ts
│       │   │   ├── hybrid-retrieval.ts
│       │   │   ├── dataverse-storage.ts
│       │   │   └── index.ts
│       │   ├── learning/
│       │   │   ├── kb-impact-types.ts
│       │   │   ├── base-kb-impact-tracker.ts
│       │   │   ├── local-kb-impact-storage.ts
│       │   │   ├── dataverse-kb-impact-storage.ts
│       │   │   ├── kb-update-pipeline.ts
│       │   │   └── index.ts
│       │   └── rag/
│       │       ├── document-processor.ts
│       │       ├── chunk-store.ts
│       │       ├── tfidf-retriever.ts
│       │       └── index.ts
│       ├── config/
│       │   ├── environment.personal.json
│       │   └── environment.mastercard.json
│       ├── PHASE_1_FOUNDATION.md
│       ├── PHASE_2_SEMANTIC_EMBEDDING.md
│       ├── PHASE_3_KB_IMPACT_TRACKING.md
│       ├── PHASE_4_CORPORATE_PROVIDERS.md
│       ├── PHASE_5_ENVIRONMENT_CONFIG.md
│       └── MASTER_EXECUTION_PLAN.md
│
└── release/v5.5/agents/
    ├── mpa/
    │   └── base/
    │       ├── kb/                    # 22+ files migrated
    │       ├── rag/
    │       │   ├── mpa-agent-config.ts
    │       │   └── index.ts
    │       └── tests/braintrust/
    │           ├── mpa-eval.ts
    │           └── learning/
    │               └── mpa-kb-impact-tracker.ts
    ├── ca/
    │   └── base/
    │       ├── kb/                    # 35 files migrated
    │       ├── rag/
    │       │   ├── ca-agent-config.ts
    │       │   └── index.ts
    │       └── tests/braintrust/
    │           ├── ca-eval.ts
    │           └── learning/
    │               └── ca-kb-impact-tracker.ts
    └── eap/
        └── base/
            ├── kb/                    # 7 files migrated
            ├── rag/
            │   ├── eap-agent-config.ts
            │   └── index.ts
            └── tests/braintrust/
                ├── eap-eval.ts
                └── learning/
                    └── eap-kb-impact-tracker.ts
```

---

## ENVIRONMENT SWITCHING

### Personal Environment (Aragorn AI)

```bash
export AGENT_ENV=personal
# Uses: Claude + OpenAI Embeddings + Local FS
```

### Corporate Environment (Mastercard)

```bash
export AGENT_ENV=corporate
export AZURE_OPENAI_API_KEY=xxx
export AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com
export AZURE_OPENAI_DEPLOYMENT=gpt-4
export DATAVERSE_ENVIRONMENT_URL=https://xxx.crm.dynamics.com
export DATAVERSE_TENANT_ID=xxx
export DATAVERSE_CLIENT_ID=xxx
export DATAVERSE_CLIENT_SECRET=xxx
# Uses: Azure OpenAI + Dataverse
```

---

## TROUBLESHOOTING

### Build Failures

1. **Missing dependencies**
   ```bash
   cd packages/agent-core && npm install
   ```

2. **TypeScript errors**
   ```bash
   rm -rf dist && npm run build 2>&1 | head -50
   ```

3. **Import path issues**
   - Check package.json has correct `file:` paths
   - Verify tsconfig.json has proper paths configuration

### Phase Execution Issues

1. **VS Code Claude stuck in plan mode**
   - Start new VS Code chat
   - Give direct execution command

2. **Missing directories**
   ```bash
   mkdir -p release/v5.5/agents/mpa/base/{kb,rag,tests/braintrust/learning}
   mkdir -p release/v5.5/agents/ca/base/{kb,rag,tests/braintrust/learning}
   mkdir -p release/v5.5/agents/eap/base/{kb,rag,tests/braintrust/learning}
   mkdir -p packages/agent-core/src/config
   mkdir -p packages/agent-core/config
   ```

3. **KB files not found**
   - Verify source paths in phase documents
   - Check legacy repos exist at expected locations

---

## SUCCESS CRITERIA

✅ `packages/agent-core` builds without errors
✅ All 50 steps executed successfully
✅ MPA has 22+ KB files
✅ CA has 35 KB files
✅ EAP has 7 KB files
✅ Both branches exist (deploy/personal, deploy/mastercard)
✅ Environment switching works via AGENT_ENV
✅ All exports accessible from agent-core package

---

## NEXT STEPS AFTER COMPLETION

1. **Run evaluations**
   ```bash
   cd release/v5.5/agents/mpa/base/tests/braintrust
   npx ts-node mpa-eval.ts
   ```

2. **Test hybrid retrieval**
   - Compare TF-IDF vs semantic vs hybrid scores

3. **Deploy CA to Mastercard**
   - Switch to deploy/mastercard branch
   - Configure Azure credentials
   - Deploy via Power Platform CLI

4. **Monitor KB impact**
   - Review impact scores after evaluation runs
   - Apply high-priority update proposals

---

## CONTACT

Created by Claude Desktop for Kessel Digital Agent Platform development.

For issues with this plan, reference the phase documents or check the transcript at:
`/mnt/transcripts/2026-01-12-01-11-56-agent-core-phase-1-2-execution.txt`
