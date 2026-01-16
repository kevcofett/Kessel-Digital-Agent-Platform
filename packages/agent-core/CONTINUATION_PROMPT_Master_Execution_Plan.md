# CONTINUATION PROMPT: Master Execution Plan Creation
# For VS Code Claude or New Claude.ai Conversation

**Date Created:** 2026-01-11
**Purpose:** Create complete VSCODE_MASTER_EXECUTION_PLAN.md for agent-core alignment, RAG optimization, KB impact tracking, and multi-environment support.

---

## CONTEXT

You are continuing work on the Kessel-Digital-Agent-Platform. The previous conversation established:

1. **Repository Location:** `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform`
2. **Current Branch:** `deploy/personal`
3. **Critical Timeline:** CA deploys to Mastercard NEXT WEEK

---

## WHAT EXISTS

### agent-core Package (packages/agent-core/)
- **Status:** Partially implemented
- **Location:** `packages/agent-core/src/`
- **Has:** RAG system, learning types, evaluation framework, provider interfaces
- **Missing:** OpenAI embedding, Azure OpenAI embedding, hybrid retrieval, generalized KB impact tracking

### MPA Agent (release/v5.5/agents/mpa/)
- **KB Location:** `release/v5.5/agents/mpa/base/kb/` (22+ files, EXISTING)
- **Braintrust:** `release/v5.5/agents/mpa/base/tests/braintrust/` (WORKING)
- **Has:** kb-impact-tracker.ts, kb-update-pipeline.ts, scenarios, scorers
- **Missing:** mpa-agent-config.ts, alignment with agent-core imports

### CA Agent (release/v5.5/agents/ca/)
- **KB Source:** `/Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/` (35 files, NEEDS MIGRATION)
- **KB Destination:** `release/v5.5/agents/ca/base/kb/`
- **Braintrust:** NEEDS CREATION
- **Status:** Only has README.md currently

### EAP Agent (release/v5.5/agents/eap/)
- **KB Source:** `/Users/kevinbauer/Kessel-Digital/Enterprise_AI_Platform/kb/` (7 files, NEEDS MIGRATION)
- **KB Destination:** `release/v5.5/agents/eap/base/kb/`
- **Braintrust:** NEEDS CREATION
- **Status:** Does not exist

---

## CRITICAL BUG FIX

The import path from `release/v5.5/agents/*/base/tests/braintrust/` to `packages/agent-core` is **7 levels up**, not 5.

**CORRECT package.json dependency:**
```json
"@kessel-digital/agent-core": "file:../../../../../../../packages/agent-core"
```

---

## WHAT TO CREATE

Create a single comprehensive document: `packages/agent-core/VSCODE_MASTER_EXECUTION_PLAN.md`

This document must contain **5 Phases with 44 Steps** covering:

### PHASE 1: FOUNDATION (Steps 1-17)
- Step 1: Verify agent-core builds
- Step 2: Create mpa-agent-config.ts
- Step 3: Update MPA package.json with agent-core dependency
- Step 4: Verify MPA compiles with agent-core
- Step 5: Create CA directory structure
- Step 6: **Copy CA KB files from Consulting_Agent repo**
- Step 7: Create ca-agent-config.ts
- Step 8: Create ca-eval.ts
- Step 9: Create CA package.json and tsconfig.json
- Step 10: Create CA rag/index.ts
- Step 11: Verify CA builds
- Step 12: Create EAP directory structure
- Step 13: **Copy EAP KB files from Enterprise_AI_Platform repo**
- Step 14: Create eap-agent-config.ts
- Step 15: Create eap-eval.ts
- Step 16: Create EAP package.json and tsconfig.json
- Step 17: Verify EAP builds

### PHASE 2: SEMANTIC EMBEDDING (Steps 18-25)
- Step 18: Create OpenAI Embedding Provider interface
- Step 19: Implement OpenAIEmbeddingProvider (personal environment)
- Step 20: Add to agent-core exports
- Step 21: Create Azure OpenAI Embedding Provider interface
- Step 22: Implement AzureOpenAIEmbeddingProvider (corporate environment)
- Step 23: Create HybridRetrievalEngine with RRF fusion
- Step 24: Update agent configs to support hybrid mode
- Step 25: Verify hybrid retrieval works

### PHASE 3: KB IMPACT TRACKING (Steps 26-32)
- Step 26: Extract generic KB impact interfaces to agent-core
- Step 27: Create BaseKBImpactTracker in agent-core
- Step 28: Create BaseKBUpdatePipeline in agent-core
- Step 29: Create MPAKBImpactTracker adapter
- Step 30: Create CAKBImpactTracker adapter
- Step 31: Create EAPKBImpactTracker adapter
- Step 32: Wire trackers into evaluation loops

### PHASE 4: CORPORATE PROVIDERS (Steps 33-40)
- Step 33: Implement AzureOpenAILLMProvider (complete, not stub)
- Step 34: Add Azure OpenAI configuration
- Step 35: Implement CopilotStudioLLMProvider (complete, not stub)
- Step 36: Add Copilot Studio configuration
- Step 37: Implement DataverseStorageProvider (complete, not stub)
- Step 38: Add Dataverse configuration
- Step 39: Complete AzureAISearchEmbeddingProvider
- Step 40: Verify all corporate providers compile

### PHASE 5: BRANCH MANAGEMENT (Steps 41-44)
- Step 41: Create deploy/mastercard branch from deploy/personal
- Step 42: Create environment configuration files
- Step 43: Implement provider switching based on environment
- Step 44: Validate and push both branches

---

## AGENT CONFIGURATIONS TO CREATE

### MPA Config (mpa-agent-config.ts)
```typescript
// Document types: benchmark, framework, playbook, examples, implications, operating-standards
// Topics: audience, budget, channel, measurement, benchmark, efficiency, general
// Step keywords: 1-10 (objective, economics, audience, geography, budget, value prop, channel, measurement, testing, risk)
// Synonyms: LTV, CAC, ROAS, CPM, CPA, CTR, CVR, AOV, channel mix, benchmark, KPI, incrementality, attribution
// Verticals: ecommerce, retail, dtc, b2b, saas, financial, healthcare, pharma, automotive, travel, cpg
// Metrics: cac, cpa, cpm, cpc, ctr, cvr, roas, roi, ltv, aov, reach, frequency
```

### CA Config (ca-agent-config.ts)
```typescript
// Document types: methodology, framework, case-study, template, best-practice, industry-analysis
// Topics: strategy, operations, technology, transformation, analytics, organization, general
// Synonyms: digital transformation, roi, kpi, stakeholder, deliverable, methodology, assessment, recommendation, implementation, change management, due diligence, synergy, operating model, value creation, workstream
// Verticals: financial services, banking, insurance, healthcare, pharma, retail, consumer, manufacturing, technology, telecom, energy, public sector, private equity
// Metrics: roi, npv, irr, payback, tco, revenue, cost, margin, ebitda, nps, adoption rate, headcount
```

### EAP Config (eap-agent-config.ts)
```typescript
// Document types: architecture, integration, security, governance, operations, best-practice
// Topics: infrastructure, integration, security, data, ml-ops, governance, general
// Synonyms: llm, rag, vector database, fine-tuning, prompt engineering, api, token, embedding, inference, deployment, gpu, mlops, guardrails
// Verticals: enterprise, saas, cloud, on-premise, hybrid, multi-tenant, regulated
// Metrics: latency, throughput, availability, uptime, cost, token usage, error rate, accuracy, p50, p95, p99
```

---

## PROVIDER IMPLEMENTATIONS NEEDED

### Personal Environment (Claude/OpenAI/Local)
| Provider | File | Status |
|----------|------|--------|
| ClaudeLLMProvider | claude-llm.ts | ✅ EXISTS |
| OpenAIEmbeddingProvider | openai-embedding.ts | ❌ CREATE |
| LocalFSStorageProvider | local-fs-storage.ts | ✅ EXISTS |
| TFIDFEmbeddingProvider | tfidf-embedding.ts | ✅ EXISTS |

### Corporate Environment (Azure/Microsoft)
| Provider | File | Status |
|----------|------|--------|
| AzureOpenAILLMProvider | azure-openai-llm.ts | 🟡 STUB → COMPLETE |
| AzureOpenAIEmbeddingProvider | azure-openai-embedding.ts | ❌ CREATE |
| CopilotStudioLLMProvider | copilot-studio-llm.ts | 🟡 STUB → COMPLETE |
| DataverseStorageProvider | dataverse-storage.ts | 🟡 STUB → COMPLETE |
| AzureAISearchEmbeddingProvider | azure-ai-search-embedding.ts | 🟡 STUB → COMPLETE |

---

## HYBRID RETRIEVAL ENGINE SPEC

```typescript
// packages/agent-core/src/rag/hybrid-retrieval.ts

export interface HybridRetrievalConfig {
  keywordWeight: number;      // Default: 0.4
  semanticWeight: number;     // Default: 0.6
  rrfConstant: number;        // Default: 60
  enableKeyword: boolean;     // Default: true
  enableSemantic: boolean;    // Default: true (requires embedding API)
}

export class HybridRetrievalEngine {
  // Uses Reciprocal Rank Fusion (RRF) to combine:
  // 1. TF-IDF keyword search results
  // 2. Semantic embedding search results
  // Formula: score = sum(1 / (k + rank)) for each result source
}
```

---

## KB IMPACT TRACKER SPEC

```typescript
// packages/agent-core/src/learning/kb-impact-tracker.ts

export interface KBUsageRecord {
  documentId: string;
  chunkIds: string[];
  query: string;
  timestamp: Date;
  sessionId: string;
  responseQuality?: number;
}

export interface KBDocumentImpact {
  documentId: string;
  totalReferences: number;
  avgQualityWhenUsed: number;
  avgQualityWhenNotUsed: number;
  impactScore: number;
  recommendedAction: 'keep' | 'enhance' | 'deprecate' | 'split';
}

export interface KBImpactTrackerConfig {
  storagePath: string;
  agentId: string;
  minSamplesForRecommendation: number;  // Default: 10
}

export class BaseKBImpactTracker {
  // Generic implementation that agent-specific trackers extend
}
```

---

## ENVIRONMENT CONFIGURATION SPEC

```typescript
// packages/agent-core/src/providers/environment-config.ts

export interface EnvironmentConfig {
  type: 'personal' | 'corporate';
  name: string;  // 'aragorn-ai' | 'mastercard'
  
  llm: {
    provider: 'claude' | 'azure-openai' | 'copilot-studio';
    apiKey?: string;
    endpoint?: string;
    deploymentName?: string;
  };
  
  embedding: {
    provider: 'openai' | 'azure-openai' | 'azure-ai-search' | 'tfidf';
    apiKey?: string;
    endpoint?: string;
  };
  
  storage: {
    provider: 'local-fs' | 'dataverse';
    connectionString?: string;
    environment?: string;
  };
}

// Environment configs will be in:
// - config/environment.personal.json
// - config/environment.mastercard.json
```

---

## FILES NOT TO DELETE

These MPA files contain valuable production logic:

```
release/v5.5/agents/mpa/base/tests/braintrust/
├── kb-impact-tracker.ts      ← Reference for generalization
├── kb-update-pipeline.ts     ← Reference for generalization
├── kb-injector.ts            ← Keep
├── failure-detector.ts       ← Keep
├── tool-executor.ts          ← Keep
├── conversation-engine.ts    ← Keep
├── user-simulator.ts         ← Keep
├── mpa-eval.ts               ← Keep
├── mpa-multi-turn-eval.ts    ← Keep
├── scenarios/                ← Keep ALL
└── scorers/                  ← Keep ALL
```

---

## SUCCESS CRITERIA

After all 44 steps:

| Component | MPA | CA | EAP |
|-----------|-----|----|----|
| RAG with Hybrid Search | ✅ | ✅ | ✅ |
| Semantic Embedding | ✅ | ✅ | ✅ |
| KB Documents | ✅ 22+ | ✅ 35 | ✅ 7 |
| KB Impact Tracking | ✅ | ✅ | ✅ |
| Self-Critique | ✅ | ✅ | ✅ |
| Personal Environment | ✅ | ✅ | ✅ |
| Corporate Environment | ✅ | ✅ | ✅ |

---

## BRANCH STRATEGY

```
deploy/personal (primary development)
    │
    │── Uses: Claude, OpenAI Embeddings, Local FS
    │── Config: environment.personal.json
    │
    └──► deploy/mastercard (copy + modify)
            │
            │── Uses: Azure OpenAI, Copilot Studio, Dataverse
            │── Config: environment.mastercard.json
            │── Claude providers: DISABLED
            │── Azure providers: ENABLED
```

---

## YOUR TASK

Create the complete `VSCODE_MASTER_EXECUTION_PLAN.md` document containing:

1. **Executive Summary** with capability matrix
2. **Critical Path Dependencies** diagram
3. **Final Repository Structure**
4. **All 44 Steps** with:
   - Step number and title
   - File path(s)
   - Complete code (no placeholders, no "// ... rest")
   - Verification command
5. **Commit Sequence** for each phase
6. **Troubleshooting Section**
7. **Success Criteria Checklist**

The document should be self-contained so VS Code Claude can execute it without additional context.

---

## IMPORTANT RULES

1. **NEVER truncate code** - Every file must be complete
2. **7 levels up** for agent-core imports: `file:../../../../../../../packages/agent-core`
3. **Copy KB files** from external repos, don't symlink
4. **All providers must compile** - stubs are NOT acceptable for Phase 4
5. **Test after each step** - include verification commands

---

## START

Begin by reading these files to understand current state:

1. `packages/agent-core/src/index.ts` - Current exports
2. `packages/agent-core/src/providers/interfaces.ts` - Provider interfaces
3. `packages/agent-core/src/rag/config.ts` - RAG configuration
4. `release/v5.5/agents/mpa/base/tests/braintrust/kb-impact-tracker.ts` - Reference implementation

Then create the complete VSCODE_MASTER_EXECUTION_PLAN.md document.
