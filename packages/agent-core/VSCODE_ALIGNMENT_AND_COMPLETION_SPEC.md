# VS Code Claude: RAG & Learning System Alignment Specification

## CRITICAL: Read This Entire Document Before Making Any Changes

This specification resolves conflicts between `packages/agent-core/` and `release/v5.5/agents/mpa/base/tests/braintrust/` implementations, then completes the full system.

---

## PART 1: CURRENT STATE ANALYSIS

### 1.1 Two Parallel Implementations Exist

| Location | Purpose | Status |
|----------|---------|--------|
| `packages/agent-core/src/` | Generic multi-agent framework | Partially implemented |
| `release/v5.5/agents/mpa/base/tests/braintrust/` | MPA-specific evaluation | Production, working |

### 1.2 Identified Conflicts

#### CONFLICT 1: Type System Mismatch
- **agent-core**: Uses `string` for documentType, topics
- **MPA braintrust**: Uses TypeScript enums (`DocumentType`, `Topic`)
- **Resolution**: agent-core stays generic; MPA provides typed config

#### CONFLICT 2: EmbeddingService Sync vs Async
- **agent-core**: `async embed(text): Promise<number[]>`
- **MPA braintrust**: `embed(text): number[]` (synchronous)
- **Resolution**: Standardize on async; update all call sites

#### CONFLICT 3: Duplicate Provider Files
- Providers exist in BOTH locations
- **Resolution**: MPA imports from agent-core; delete duplicates

#### CONFLICT 4: Hardcoded vs Injectable Config
- **MPA**: `RAG_CONFIG` constant with hardcoded values
- **agent-core**: `AgentRAGConfig` interface for injection
- **Resolution**: Create MPA config file implementing interface

### 1.3 Complementary Systems (DO NOT DELETE)

These MPA files provide functionality NOT in agent-core and must be preserved:
- `kb-impact-tracker.ts` - Tracks KB document usage correlation with quality
- `kb-update-pipeline.ts` - Automates KB updates from impact analysis
- `kb-injector.ts` - Injects relevant KB docs into conversations
- `failure-detector.ts` - Detects systematic failure patterns
- All files in `scenarios/` - MPA-specific test scenarios
- All files in `scorers/` - MPA-specific evaluation scorers

---

## PART 2: ALIGNMENT TASKS

Execute these tasks IN ORDER before any new implementation.

### Task 2.1: Create MPA Agent Configuration

**File**: `release/v5.5/agents/mpa/base/tests/braintrust/mpa-agent-config.ts`

```typescript
/**
 * MPA Agent Configuration for agent-core RAG System
 * 
 * This file bridges MPA-specific configuration to the generic
 * agent-core interfaces. It extracts all MPA-specific constants
 * from types.ts into an injectable configuration.
 */

import { AgentRAGConfig, RAGSystemConfig } from '@kessel-digital/agent-core';

// ============================================================================
// MPA-SPECIFIC TYPE DEFINITIONS (for internal use)
// ============================================================================

export type MPADocumentType =
  | 'benchmark'
  | 'framework'
  | 'playbook'
  | 'examples'
  | 'implications'
  | 'operating-standards';

export type MPATopic =
  | 'audience'
  | 'budget'
  | 'channel'
  | 'measurement'
  | 'benchmark'
  | 'efficiency'
  | 'general';

// ============================================================================
// MPA SYNONYM MAPPINGS
// ============================================================================

const MPA_SYNONYM_MAPPINGS: Record<string, string[]> = {
  'ltv': ['lifetime value', 'customer lifetime value', 'clv', 'cltv'],
  'cac': ['customer acquisition cost', 'acquisition cost', 'cost of acquisition'],
  'roas': ['return on ad spend', 'return on advertising spend', 'ad return'],
  'cpm': ['cost per thousand', 'cost per mille'],
  'cpa': ['cost per acquisition', 'cost per action', 'acquisition cost'],
  'ctr': ['click through rate', 'click-through rate', 'clickthrough rate'],
  'cvr': ['conversion rate', 'conv rate'],
  'aov': ['average order value', 'avg order value'],
  'channel mix': ['media mix', 'allocation', 'channel allocation', 'media allocation'],
  'benchmark': ['typical', 'industry standard', 'average', 'baseline', 'norm'],
  'kpi': ['key performance indicator', 'metric', 'target metric'],
  'incrementality': ['incremental lift', 'incremental value', 'lift'],
  'attribution': ['credit', 'contribution', 'touchpoint credit'],
  'reach': ['audience reach', 'addressable audience'],
  'frequency': ['ad frequency', 'exposure frequency', 'avg frequency'],
};

// ============================================================================
// MPA TOPIC KEYWORDS
// ============================================================================

const MPA_TOPIC_KEYWORDS: Record<string, string[]> = {
  audience: ['audience', 'targeting', 'segment', 'demographic', 'persona', 'customer'],
  budget: ['budget', 'spend', 'allocation', 'investment', 'cost', 'dollar'],
  channel: ['channel', 'media', 'platform', 'placement', 'inventory', 'programmatic'],
  measurement: ['measurement', 'attribution', 'kpi', 'metric', 'tracking', 'analytics'],
  benchmark: ['benchmark', 'typical', 'average', 'range', 'industry', 'standard'],
  efficiency: ['cac', 'cpa', 'cpm', 'roas', 'efficiency', 'cost per', 'ltv'],
  general: [],
};

// ============================================================================
// MPA STEP KEYWORDS
// ============================================================================

const MPA_STEP_KEYWORDS: Record<number, string[]> = {
  1: ['objective', 'outcome', 'goal', 'success', 'business'],
  2: ['economics', 'ltv', 'cac', 'margin', 'profitability', 'unit'],
  3: ['audience', 'targeting', 'segment', 'persona', 'demographic'],
  4: ['geography', 'geo', 'dma', 'region', 'market', 'location'],
  5: ['budget', 'allocation', 'spend', 'investment'],
  6: ['value proposition', 'messaging', 'positioning', 'differentiation'],
  7: ['channel', 'media mix', 'platform', 'programmatic'],
  8: ['measurement', 'attribution', 'kpi', 'tracking'],
  9: ['testing', 'experiment', 'hypothesis', 'learn'],
  10: ['risk', 'mitigation', 'contingency', 'fallback'],
};

// ============================================================================
// MPA DOCUMENT TYPE PATTERNS
// ============================================================================

const MPA_DOCUMENT_TYPE_PATTERNS: Record<string, RegExp[]> = {
  benchmark: [/benchmark/i, /analytics.*engine/i, /data/i],
  framework: [/framework/i, /expert.*lens/i, /strategic.*wisdom/i],
  playbook: [/playbook/i, /gap.*detection/i, /confidence/i],
  examples: [/example/i, /conversation/i, /template/i],
  implications: [/implications/i],
  'operating-standards': [/kb.*00/i, /operating.*standard/i, /supporting.*instruction/i],
};

// ============================================================================
// MPA DOCUMENT PURPOSE PATTERNS
// ============================================================================

const MPA_DOCUMENT_PURPOSE_PATTERNS: Record<string, RegExp[]> = {
  definitive: [/analytics.*engine/i, /benchmark/i],
  guidance: [/expert.*lens/i, /implications/i],
  reference: [/kb.*\d+/i, /supporting/i],
  procedural: [/step.*boundary/i, /calculation/i],
  template: [/template/i],
  example: [/conversation.*example/i, /training/i],
};

// ============================================================================
// MPA VERTICAL AND METRIC PATTERNS
// ============================================================================

const MPA_VERTICAL_PATTERNS = [
  'ecommerce', 'e-commerce', 'retail', 'dtc', 'direct-to-consumer',
  'b2b', 'saas', 'enterprise', 'financial', 'fintech',
  'healthcare', 'pharma', 'automotive', 'travel', 'hospitality',
  'cpg', 'fmcg', 'consumer goods', 'technology', 'telecom',
];

const MPA_METRIC_PATTERNS = [
  'cac', 'cpa', 'cpm', 'cpc', 'cpl', 'cpv', 'ctr', 'cvr',
  'roas', 'roi', 'ltv', 'aov', 'arpu', 'mrr', 'arr',
  'reach', 'frequency', 'impressions', 'clicks', 'conversions',
];

// ============================================================================
// EXPORTED MPA CONFIGURATION
// ============================================================================

export const MPA_AGENT_CONFIG: AgentRAGConfig = {
  kbPath: '../../../kb',
  excludedFiles: [],
  deprioritizedFiles: [
    'MPA_Conversation_Examples',
    'MPA_Training_Conversation',
  ],
  synonymMappings: MPA_SYNONYM_MAPPINGS,
  documentTypePatterns: MPA_DOCUMENT_TYPE_PATTERNS,
  documentPurposePatterns: MPA_DOCUMENT_PURPOSE_PATTERNS,
  topicKeywords: MPA_TOPIC_KEYWORDS,
  stepKeywords: MPA_STEP_KEYWORDS,
  verticalPatterns: MPA_VERTICAL_PATTERNS,
  metricPatterns: MPA_METRIC_PATTERNS,
};

// ============================================================================
// MPA RAG SYSTEM CONFIG OVERRIDES
// ============================================================================

export const MPA_RAG_SYSTEM_CONFIG: Partial<RAGSystemConfig> = {
  chunking: {
    targetChunkSize: 400,
    maxChunkSize: 600,
    minChunkSize: 100,
    overlapTokens: 50,
  },
  embedding: {
    maxFeatures: 1500,
    minDocFreq: 2,
    maxDocFreqRatio: 0.95,
  },
  retrieval: {
    defaultTopK: 5,
    minScore: 0.25,
    semanticWeight: 0.6,
    keywordWeight: 0.4,
    benchmarkBoost: 2.0,
    exactMatchBoost: 1.5,
  },
  paths: {
    chunksCache: './rag-cache/kb-chunks.json',
    indexCache: './rag-cache/kb-index.json',
  },
  cache: {
    queryEmbeddingCacheSize: 100,
  },
};

// ============================================================================
// HELPER: Convert string types to MPA enums (for backwards compatibility)
// ============================================================================

export function toMPADocumentType(type: string): MPADocumentType {
  const validTypes: MPADocumentType[] = [
    'benchmark', 'framework', 'playbook', 'examples', 'implications', 'operating-standards'
  ];
  return validTypes.includes(type as MPADocumentType) 
    ? type as MPADocumentType 
    : 'framework';
}

export function toMPATopic(topic: string): MPATopic {
  const validTopics: MPATopic[] = [
    'audience', 'budget', 'channel', 'measurement', 'benchmark', 'efficiency', 'general'
  ];
  return validTopics.includes(topic as MPATopic)
    ? topic as MPATopic
    : 'general';
}

export default MPA_AGENT_CONFIG;
```

### Task 2.2: Update agent-core RAGSystemConfig Interface

**File**: `packages/agent-core/src/rag/config.ts`

Add `minDocFreq` and `maxDocFreqRatio` to the embedding config:

```typescript
// In RAGSystemConfig interface, update embedding section:
embedding: {
  maxFeatures: number;
  minDocFreq: number;        // ADD THIS
  maxDocFreqRatio: number;   // ADD THIS
};

// Update DEFAULT_RAG_CONFIG:
embedding: {
  maxFeatures: 1500,
  minDocFreq: 2,
  maxDocFreqRatio: 0.95,
},
```

### Task 2.3: Fix EmbeddingService Async Consistency

**File**: `packages/agent-core/src/rag/embedding-service.ts`

Remove the synchronous `embedSync` method - it's a bad pattern. The file is already correct with async methods.

### Task 2.4: Update MPA to Import from agent-core

**File**: `release/v5.5/agents/mpa/base/tests/braintrust/rag/index.ts`

Replace current content with:

```typescript
/**
 * MPA RAG System
 * 
 * Uses agent-core for generic RAG functionality with MPA-specific configuration.
 */

// Re-export agent-core components
export {
  DocumentChunk,
  ChunkMetadata,
  DocumentPurpose,
  StoredChunk,
  SearchResult,
  MetadataFilter,
  SearchOptions,
  RetrievalResult,
  BenchmarkResult,
  AudienceSizingResult,
  ToolDefinition,
  ToolUseBlock,
  RAGToolResult,
  ToolUsageStats,
} from '@kessel-digital/agent-core';

export {
  AgentRAGConfig,
  RAGSystemConfig,
  DEFAULT_RAG_CONFIG,
  DOCUMENT_PURPOSE_BOOSTS,
} from '@kessel-digital/agent-core';

export {
  DocumentProcessor,
  EmbeddingService,
  VectorStore,
  RetrievalEngine,
} from '@kessel-digital/agent-core';

// Export MPA-specific configuration
export {
  MPA_AGENT_CONFIG,
  MPA_RAG_SYSTEM_CONFIG,
  MPADocumentType,
  MPATopic,
  toMPADocumentType,
  toMPATopic,
} from '../mpa-agent-config.js';

// Re-export legacy constants for backwards compatibility
// These map to MPA_AGENT_CONFIG internally
export const RAG_CONFIG = {
  ...MPA_RAG_SYSTEM_CONFIG,
  paths: {
    kbDirectory: '../../../kb',
    chunksCache: './rag-cache/kb-chunks.json',
    indexCache: './rag-cache/kb-index.json',
  },
} as const;

export const SYNONYM_MAPPINGS = MPA_AGENT_CONFIG.synonymMappings;
export const TOPIC_KEYWORDS = MPA_AGENT_CONFIG.topicKeywords;
export const STEP_KEYWORDS = MPA_AGENT_CONFIG.stepKeywords;
export const DOCUMENT_TYPE_PATTERNS = MPA_AGENT_CONFIG.documentTypePatterns;
```

### Task 2.5: Create MPA RetrievalEngine Factory

**File**: `release/v5.5/agents/mpa/base/tests/braintrust/rag/mpa-retrieval-engine.ts`

```typescript
/**
 * MPA Retrieval Engine Factory
 * 
 * Creates a RetrievalEngine pre-configured for MPA use cases.
 */

import { RetrievalEngine, TFIDFEmbeddingProvider } from '@kessel-digital/agent-core';
import { MPA_AGENT_CONFIG, MPA_RAG_SYSTEM_CONFIG } from '../mpa-agent-config.js';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let _instance: RetrievalEngine | null = null;

/**
 * Get singleton MPA Retrieval Engine instance
 */
export async function getMPARetrievalEngine(): Promise<RetrievalEngine> {
  if (_instance && _instance.isInitialized()) {
    return _instance;
  }

  const embeddingProvider = new TFIDFEmbeddingProvider({
    maxFeatures: MPA_RAG_SYSTEM_CONFIG.embedding?.maxFeatures || 1500,
    cacheSize: MPA_RAG_SYSTEM_CONFIG.cache?.queryEmbeddingCacheSize || 100,
  });

  _instance = new RetrievalEngine({
    agentConfig: MPA_AGENT_CONFIG,
    embeddingProvider,
    systemConfig: MPA_RAG_SYSTEM_CONFIG,
    basePath: __dirname,
  });

  await _instance.initialize();
  return _instance;
}

/**
 * Create fresh MPA Retrieval Engine (for testing)
 */
export async function createMPARetrievalEngine(): Promise<RetrievalEngine> {
  const embeddingProvider = new TFIDFEmbeddingProvider({
    maxFeatures: MPA_RAG_SYSTEM_CONFIG.embedding?.maxFeatures || 1500,
    cacheSize: MPA_RAG_SYSTEM_CONFIG.cache?.queryEmbeddingCacheSize || 100,
  });

  const engine = new RetrievalEngine({
    agentConfig: MPA_AGENT_CONFIG,
    embeddingProvider,
    systemConfig: MPA_RAG_SYSTEM_CONFIG,
    basePath: __dirname,
  });

  await engine.initialize();
  return engine;
}

/**
 * Reset singleton (for testing)
 */
export function resetMPARetrievalEngine(): void {
  _instance = null;
}

export default getMPARetrievalEngine;
```

### Task 2.6: Update MPA Files That Use RAG

Update these files to use async retrieval:

**Files to update**:
- `conversation-engine.ts`
- `tool-executor.ts` (if exists)
- `kb-injector.ts`

Pattern for updates:
```typescript
// OLD (synchronous)
const results = retrievalEngine.search(query);

// NEW (async)
const results = await retrievalEngine.search(query);
```

### Task 2.7: Delete Duplicate Provider Files

After confirming agent-core imports work, DELETE these files from MPA:

```
release/v5.5/agents/mpa/base/tests/braintrust/rag/providers/
├── azure-ai-search-embedding.ts  # DELETE
├── azure-openai-llm.ts           # DELETE
├── claude-llm.ts                 # DELETE
├── copilot-studio-llm.ts         # DELETE
├── dataverse-storage.ts          # DELETE
├── detect-environment.ts         # DELETE
├── factory.ts                    # DELETE
├── index.ts                      # DELETE (replace with re-export)
├── interfaces.ts                 # DELETE
├── local-fs-storage.ts           # DELETE
├── tfidf-embedding.ts            # DELETE
└── token-manager.ts              # DELETE (if exists)
```

Replace with single re-export file:

**File**: `release/v5.5/agents/mpa/base/tests/braintrust/rag/providers/index.ts`

```typescript
/**
 * Provider Re-exports from agent-core
 */
export * from '@kessel-digital/agent-core/providers';
```

---

## PART 3: LEARNING SYSTEM INTEGRATION

### Task 3.1: Create Learning System Bridge

The MPA braintrust has sophisticated KB impact tracking that should integrate with agent-core's generic learning types.

**File**: `release/v5.5/agents/mpa/base/tests/braintrust/learning/index.ts`

```typescript
/**
 * MPA Learning System
 * 
 * Integrates agent-core learning types with MPA-specific KB impact tracking.
 */

// Re-export agent-core learning types
export {
  ResponseCritique,
  CritiqueDimension,
  CritiqueIssue,
  CritiqueMetadata,
  SuccessPattern,
  PatternType,
  ResponseElement,
  PatternExample,
  KBEnhancement,
  EnhancementType,
  EnhancementStatus,
  EnhancementEvidence,
  ImpactAssessment,
  UserFeedback,
  LearningSessionSummary,
  LearningConfig,
  DEFAULT_LEARNING_CONFIG,
  SelfCritique,
  CritiqueCriteria,
  DEFAULT_CRITIQUE_CRITERIA,
} from '@kessel-digital/agent-core';

// Export MPA-specific learning components
export {
  MPA_KB_DOCUMENTS,
  KBDocument,
  KBUsageRecord,
  KBImpactMetrics,
  KBOptimizationRecommendation,
  trackKBUsage,
  calculateKBImpactMetrics,
  generateKBOptimizationRecommendations,
  generateKBImpactReport,
  saveKBImpactData,
  filenameToDocId,
} from '../kb-impact-tracker.js';

export {
  KBBaselineRecord,
  KBUpdateType,
  KBUpdate,
  createKBBaseline,
  saveKBBaseline,
  loadLatestKBBaseline,
  compareKBBaselines,
  generateKBUpdates,
  applyKBUpdate,
  applyAllKBUpdates,
  uploadToSharePoint,
} from '../kb-update-pipeline.js';
```

### Task 3.2: Create MPA Critique Criteria

**File**: `release/v5.5/agents/mpa/base/tests/braintrust/learning/mpa-critique-criteria.ts`

```typescript
/**
 * MPA-Specific Critique Criteria
 * 
 * Defines evaluation dimensions specific to media planning agent responses.
 */

import { CritiqueCriteria } from '@kessel-digital/agent-core';

export const MPA_CRITIQUE_CRITERIA: CritiqueCriteria = {
  dimensions: [
    {
      name: 'accuracy',
      description: 'Benchmark data accuracy, calculation correctness, industry alignment',
      weight: 0.25,
    },
    {
      name: 'completeness',
      description: 'Addresses all aspects of media planning query, considers tradeoffs',
      weight: 0.20,
    },
    {
      name: 'citation',
      description: 'Properly cites KB sources, provides data provenance, uses "Based on KB" format',
      weight: 0.20,
    },
    {
      name: 'mentorship',
      description: 'Proactive guidance, explains implications, anticipates follow-up needs',
      weight: 0.20,
    },
    {
      name: 'calculation_display',
      description: 'Shows work for calculations, uses clear formatting, explains methodology',
      weight: 0.15,
    },
  ],
  domainRules: [
    'Always cite benchmark sources with "Based on Knowledge Base" format',
    'Show calculation methodology with step-by-step breakdown',
    'Provide conservative, typical, and aggressive ranges for benchmarks',
    'Explain implications of recommendations on downstream steps',
    'Match language sophistication to user expertise level',
    'Challenge unrealistic KPIs or expectations proactively',
    'Never recommend ROAS as a primary KPI without caveats',
    'Consider incrementality over last-touch attribution',
  ],
  examples: {
    good: [
      {
        query: 'What CPM should I expect for programmatic display?',
        response: 'Based on Knowledge Base, typical programmatic display CPMs range from $2-8 depending on targeting precision. Conservative estimate: $4-6 for broad targeting. Ambitious: $8-12 for high-intent audiences. Key factors affecting CPM include audience specificity, inventory quality, and seasonality.',
        whyGood: 'Cites source, provides range with qualifiers, explains factors',
      },
    ],
    bad: [
      {
        query: 'What CPM should I expect for programmatic display?',
        response: 'CPMs are usually around $5.',
        whyBad: 'No source citation, single value without range, no context or factors',
      },
    ],
  },
};

export default MPA_CRITIQUE_CRITERIA;
```

### Task 3.3: Update agent-core Learning Types for KB Impact

**File**: `packages/agent-core/src/learning/types.ts`

Add these types to support KB impact tracking (append to existing file):

```typescript
// ============================================================================
// KB IMPACT TRACKING TYPES (for integration with agent-specific trackers)
// ============================================================================

/**
 * Generic KB document metadata
 */
export interface KBDocumentMetadata {
  id: string;
  filename: string;
  category: string;
  relevantSteps: number | number[];
  version: string;
  lastModified: string;
  contentSummary?: string;
}

/**
 * Record of KB document usage in a response
 */
export interface KBUsageRecord {
  documentId: string;
  step: number;
  wasInjected: boolean;
  wasReferenced: boolean;
  contentMatches: string[];
  turnNumber: number;
}

/**
 * Impact metrics for a KB document
 */
export interface KBDocumentImpact {
  documentId: string;
  documentName: string;
  timesInjected: number;
  timesReferenced: number;
  referenceRate: number;
  qualityCorrelation: Record<string, number>;  // dimension -> impact delta
  mostUsedSections: string[];
  contentUtilizationRate: number;
}

/**
 * Recommendation for KB optimization
 */
export interface KBOptimizationRecommendation {
  documentId: string;
  recommendationType: 'update' | 'expand' | 'consolidate' | 'remove' | 'create_new';
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  suggestedChanges?: string[];
  expectedImpact?: string;
}
```

---

## PART 4: CA AGENT IMPLEMENTATION

### Task 4.1: Create CA Directory Structure

```
release/v5.5/agents/ca/
├── base/
│   ├── kb/                          # CA knowledge base files
│   │   └── .gitkeep
│   ├── src/
│   │   └── .gitkeep
│   └── tests/
│       └── braintrust/
│           ├── ca-agent-config.ts   # CA RAG configuration
│           ├── ca-critique-criteria.ts
│           ├── ca-eval.ts           # Main evaluation runner
│           ├── ca-multi-turn-eval.ts
│           ├── ca-multi-turn-types.ts
│           ├── conversation-engine.ts
│           ├── user-simulator.ts
│           ├── baseline-tracker.ts
│           ├── step-tracker.ts
│           ├── package.json
│           ├── tsconfig.json
│           ├── scenarios/
│           │   ├── index.ts
│           │   └── [scenario files]
│           ├── scorers/
│           │   ├── index.ts
│           │   └── [scorer files]
│           └── rag/
│               └── index.ts         # Re-exports from agent-core
└── extensions/
    └── mastercard/
        └── .gitkeep
```

### Task 4.2: Create CA Agent Configuration

**File**: `release/v5.5/agents/ca/base/tests/braintrust/ca-agent-config.ts`

```typescript
/**
 * CA (Consulting Agent) Configuration for agent-core RAG System
 */

import { AgentRAGConfig, RAGSystemConfig } from '@kessel-digital/agent-core';

// ============================================================================
// CA-SPECIFIC TYPE DEFINITIONS
// ============================================================================

export type CADocumentType =
  | 'methodology'
  | 'framework'
  | 'case-study'
  | 'template'
  | 'best-practice'
  | 'industry-analysis';

export type CATopic =
  | 'strategy'
  | 'operations'
  | 'technology'
  | 'transformation'
  | 'analytics'
  | 'organization'
  | 'general';

// ============================================================================
// CA SYNONYM MAPPINGS
// ============================================================================

const CA_SYNONYM_MAPPINGS: Record<string, string[]> = {
  'digital transformation': ['digitalization', 'digital strategy', 'tech modernization'],
  'roi': ['return on investment', 'investment return', 'payback'],
  'kpi': ['key performance indicator', 'metric', 'success metric'],
  'stakeholder': ['executive', 'sponsor', 'decision maker'],
  'deliverable': ['output', 'artifact', 'work product'],
  'methodology': ['approach', 'framework', 'process'],
  'assessment': ['evaluation', 'analysis', 'review'],
  'recommendation': ['suggestion', 'proposal', 'advice'],
  'implementation': ['execution', 'deployment', 'rollout'],
  'change management': ['organizational change', 'transformation', 'adoption'],
};

// ============================================================================
// CA TOPIC KEYWORDS
// ============================================================================

const CA_TOPIC_KEYWORDS: Record<string, string[]> = {
  strategy: ['strategy', 'strategic', 'vision', 'mission', 'objective', 'goal'],
  operations: ['operations', 'process', 'efficiency', 'optimization', 'workflow'],
  technology: ['technology', 'digital', 'system', 'platform', 'tool', 'software'],
  transformation: ['transformation', 'change', 'modernization', 'evolution'],
  analytics: ['analytics', 'data', 'insight', 'metric', 'measurement', 'reporting'],
  organization: ['organization', 'team', 'structure', 'culture', 'capability'],
  general: [],
};

// ============================================================================
// CA DOCUMENT TYPE PATTERNS
// ============================================================================

const CA_DOCUMENT_TYPE_PATTERNS: Record<string, RegExp[]> = {
  methodology: [/methodology/i, /approach/i, /framework/i],
  framework: [/framework/i, /model/i, /structure/i],
  'case-study': [/case.*study/i, /example/i, /success.*story/i],
  template: [/template/i, /format/i, /standard/i],
  'best-practice': [/best.*practice/i, /guideline/i, /standard/i],
  'industry-analysis': [/industry/i, /market/i, /trend/i],
};

// ============================================================================
// CA DOCUMENT PURPOSE PATTERNS
// ============================================================================

const CA_DOCUMENT_PURPOSE_PATTERNS: Record<string, RegExp[]> = {
  definitive: [/methodology/i, /framework/i],
  guidance: [/best.*practice/i, /guideline/i],
  reference: [/reference/i, /glossary/i],
  procedural: [/process/i, /procedure/i, /workflow/i],
  template: [/template/i],
  example: [/case.*study/i, /example/i],
};

// ============================================================================
// CA VERTICAL AND METRIC PATTERNS
// ============================================================================

const CA_VERTICAL_PATTERNS = [
  'financial services', 'banking', 'insurance', 'fintech',
  'healthcare', 'pharma', 'life sciences',
  'retail', 'consumer', 'cpg',
  'manufacturing', 'industrial', 'automotive',
  'technology', 'software', 'telecom',
  'energy', 'utilities', 'resources',
  'public sector', 'government', 'education',
];

const CA_METRIC_PATTERNS = [
  'roi', 'npv', 'irr', 'payback', 'tco',
  'revenue', 'cost', 'margin', 'profit',
  'efficiency', 'productivity', 'utilization',
  'satisfaction', 'nps', 'engagement',
  'time to value', 'adoption rate', 'completion rate',
];

// ============================================================================
// EXPORTED CA CONFIGURATION
// ============================================================================

export const CA_AGENT_CONFIG: AgentRAGConfig = {
  kbPath: '../../../kb',
  excludedFiles: [],
  deprioritizedFiles: [],
  synonymMappings: CA_SYNONYM_MAPPINGS,
  documentTypePatterns: CA_DOCUMENT_TYPE_PATTERNS,
  documentPurposePatterns: CA_DOCUMENT_PURPOSE_PATTERNS,
  topicKeywords: CA_TOPIC_KEYWORDS,
  stepKeywords: {}, // CA may not have numbered steps
  verticalPatterns: CA_VERTICAL_PATTERNS,
  metricPatterns: CA_METRIC_PATTERNS,
};

// ============================================================================
// CA RAG SYSTEM CONFIG OVERRIDES
// ============================================================================

export const CA_RAG_SYSTEM_CONFIG: Partial<RAGSystemConfig> = {
  chunking: {
    targetChunkSize: 500,  // Slightly larger for consulting content
    maxChunkSize: 800,
    minChunkSize: 150,
    overlapTokens: 75,
  },
  retrieval: {
    defaultTopK: 5,
    minScore: 0.20,  // Slightly lower threshold
    semanticWeight: 0.65,
    keywordWeight: 0.35,
    benchmarkBoost: 1.5,
    exactMatchBoost: 1.3,
  },
};

export default CA_AGENT_CONFIG;
```

### Task 4.3: Create CA Evaluation Runner

**File**: `release/v5.5/agents/ca/base/tests/braintrust/ca-eval.ts`

```typescript
/**
 * CA (Consulting Agent) Evaluation Runner
 * 
 * Multi-turn evaluation harness for the Consulting Agent.
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { RetrievalEngine, TFIDFEmbeddingProvider } from '@kessel-digital/agent-core';
import { CA_AGENT_CONFIG, CA_RAG_SYSTEM_CONFIG } from './ca-agent-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTurns: 15,
  outputDir: path.join(__dirname, 'outputs'),
};

// ============================================================================
// RETRIEVAL ENGINE SETUP
// ============================================================================

let retrievalEngine: RetrievalEngine | null = null;

async function getRetrievalEngine(): Promise<RetrievalEngine> {
  if (retrievalEngine && retrievalEngine.isInitialized()) {
    return retrievalEngine;
  }

  const embeddingProvider = new TFIDFEmbeddingProvider({
    maxFeatures: CA_RAG_SYSTEM_CONFIG.embedding?.maxFeatures || 1500,
    cacheSize: 100,
  });

  retrievalEngine = new RetrievalEngine({
    agentConfig: CA_AGENT_CONFIG,
    embeddingProvider,
    systemConfig: CA_RAG_SYSTEM_CONFIG,
    basePath: __dirname,
  });

  await retrievalEngine.initialize();
  return retrievalEngine;
}

// ============================================================================
// MAIN EVALUATION
// ============================================================================

async function main() {
  console.log('CA Evaluation Runner');
  console.log('====================');
  
  // Initialize RAG
  const engine = await getRetrievalEngine();
  console.log(`RAG initialized with ${engine.getStats().chunkCount} chunks`);

  // TODO: Implement evaluation scenarios
  console.log('\nEvaluation scenarios not yet implemented.');
  console.log('Next steps:');
  console.log('1. Create CA-specific test scenarios');
  console.log('2. Create CA-specific scorers');
  console.log('3. Populate CA knowledge base');
}

main().catch(console.error);
```

### Task 4.4: Create CA Package Configuration

**File**: `release/v5.5/agents/ca/base/tests/braintrust/package.json`

```json
{
  "name": "@kessel-digital/ca-eval",
  "version": "1.0.0",
  "type": "module",
  "description": "Consulting Agent evaluation harness",
  "main": "dist/ca-eval.js",
  "scripts": {
    "build": "tsc",
    "eval": "node dist/ca-eval.js",
    "eval:dev": "npx ts-node --esm ca-eval.ts"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "@kessel-digital/agent-core": "file:../../../../../packages/agent-core",
    "braintrust": "^0.0.175",
    "dotenv": "^16.3.1",
    "natural": "^6.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

**File**: `release/v5.5/agents/ca/base/tests/braintrust/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": ".",
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@kessel-digital/agent-core": ["../../../../../packages/agent-core/src/index"]
    }
  },
  "include": [
    "*.ts",
    "scenarios/**/*.ts",
    "scorers/**/*.ts",
    "rag/**/*.ts",
    "learning/**/*.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

---

## PART 5: EAP AGENT IMPLEMENTATION

### Task 5.1: Create EAP Directory Structure

```
release/v5.5/agents/eap/
├── base/
│   ├── kb/
│   │   └── .gitkeep
│   ├── src/
│   │   └── .gitkeep
│   └── tests/
│       └── braintrust/
│           ├── eap-agent-config.ts
│           ├── eap-critique-criteria.ts
│           ├── eap-eval.ts
│           ├── package.json
│           ├── tsconfig.json
│           ├── scenarios/
│           │   └── index.ts
│           ├── scorers/
│           │   └── index.ts
│           └── rag/
│               └── index.ts
└── extensions/
    └── .gitkeep
```

### Task 5.2: Create EAP Agent Configuration

**File**: `release/v5.5/agents/eap/base/tests/braintrust/eap-agent-config.ts`

```typescript
/**
 * EAP (Enterprise AI Platform) Configuration for agent-core RAG System
 */

import { AgentRAGConfig, RAGSystemConfig } from '@kessel-digital/agent-core';

// ============================================================================
// EAP-SPECIFIC TYPE DEFINITIONS
// ============================================================================

export type EAPDocumentType =
  | 'architecture'
  | 'integration'
  | 'security'
  | 'governance'
  | 'operations'
  | 'best-practice';

export type EAPTopic =
  | 'infrastructure'
  | 'integration'
  | 'security'
  | 'data'
  | 'ml-ops'
  | 'governance'
  | 'general';

// ============================================================================
// EAP SYNONYM MAPPINGS
// ============================================================================

const EAP_SYNONYM_MAPPINGS: Record<string, string[]> = {
  'llm': ['large language model', 'language model', 'foundation model'],
  'rag': ['retrieval augmented generation', 'retrieval-augmented generation'],
  'vector database': ['vector store', 'embedding store', 'vector db'],
  'fine-tuning': ['fine tuning', 'model tuning', 'adaptation'],
  'prompt engineering': ['prompt design', 'prompt optimization'],
  'api': ['application programming interface', 'endpoint', 'service'],
  'token': ['tokens', 'token count', 'context window'],
  'embedding': ['embeddings', 'vector representation', 'semantic vector'],
  'inference': ['model inference', 'prediction', 'generation'],
  'deployment': ['model deployment', 'serving', 'production'],
};

// ============================================================================
// EAP TOPIC KEYWORDS
// ============================================================================

const EAP_TOPIC_KEYWORDS: Record<string, string[]> = {
  infrastructure: ['infrastructure', 'compute', 'gpu', 'cluster', 'scaling', 'cloud'],
  integration: ['integration', 'api', 'connector', 'pipeline', 'workflow'],
  security: ['security', 'privacy', 'compliance', 'encryption', 'authentication'],
  data: ['data', 'dataset', 'training', 'validation', 'preprocessing'],
  'ml-ops': ['mlops', 'deployment', 'monitoring', 'versioning', 'registry'],
  governance: ['governance', 'policy', 'audit', 'ethics', 'responsible ai'],
  general: [],
};

// ============================================================================
// EAP DOCUMENT TYPE PATTERNS
// ============================================================================

const EAP_DOCUMENT_TYPE_PATTERNS: Record<string, RegExp[]> = {
  architecture: [/architecture/i, /design/i, /system/i],
  integration: [/integration/i, /api/i, /connector/i],
  security: [/security/i, /compliance/i, /privacy/i],
  governance: [/governance/i, /policy/i, /standard/i],
  operations: [/operations/i, /runbook/i, /procedure/i],
  'best-practice': [/best.*practice/i, /guideline/i, /pattern/i],
};

// ============================================================================
// EXPORTED EAP CONFIGURATION
// ============================================================================

export const EAP_AGENT_CONFIG: AgentRAGConfig = {
  kbPath: '../../../kb',
  excludedFiles: [],
  deprioritizedFiles: [],
  synonymMappings: EAP_SYNONYM_MAPPINGS,
  documentTypePatterns: EAP_DOCUMENT_TYPE_PATTERNS,
  documentPurposePatterns: {
    definitive: [/architecture/i, /specification/i],
    guidance: [/best.*practice/i, /guideline/i],
    reference: [/reference/i, /api.*doc/i],
    procedural: [/runbook/i, /procedure/i],
    template: [/template/i],
    example: [/example/i, /sample/i],
  },
  topicKeywords: EAP_TOPIC_KEYWORDS,
  stepKeywords: {},
  verticalPatterns: [
    'enterprise', 'saas', 'cloud', 'on-premise',
    'hybrid', 'multi-tenant', 'single-tenant',
  ],
  metricPatterns: [
    'latency', 'throughput', 'availability', 'uptime',
    'cost', 'token usage', 'error rate', 'accuracy',
  ],
};

export const EAP_RAG_SYSTEM_CONFIG: Partial<RAGSystemConfig> = {
  chunking: {
    targetChunkSize: 450,
    maxChunkSize: 700,
    minChunkSize: 120,
    overlapTokens: 60,
  },
  retrieval: {
    defaultTopK: 5,
    minScore: 0.22,
    semanticWeight: 0.55,
    keywordWeight: 0.45,
    benchmarkBoost: 1.3,
    exactMatchBoost: 1.4,
  },
};

export default EAP_AGENT_CONFIG;
```

---

## PART 6: AGENT-CORE PACKAGE COMPLETION

### Task 6.1: Verify/Complete Provider Implementations

Check these files exist and are complete:

**Required files in `packages/agent-core/src/providers/`:**
- `interfaces.ts` ✓
- `detect-environment.ts` ✓
- `factory.ts` ✓
- `claude-llm.ts` ✓
- `azure-openai-llm.ts` (stub OK)
- `copilot-studio-llm.ts` (stub OK)
- `local-fs-storage.ts` ✓
- `dataverse-storage.ts` (stub OK)
- `tfidf-embedding.ts` ✓
- `azure-ai-search-embedding.ts` (stub OK)
- `token-manager.ts` ✓
- `tool-shim.ts` ✓
- `document-store.ts` ✓
- `index.ts` ✓

### Task 6.2: Complete agent-core Main Export

**File**: `packages/agent-core/src/index.ts`

```typescript
/**
 * Agent-Core Package
 * 
 * Multi-environment agent framework supporting personal (Claude/Node.js)
 * and corporate (Microsoft/Azure) deployments.
 */

// ============================================================================
// PROVIDER SYSTEM
// ============================================================================

export * from './providers/interfaces.js';
export { detectEnvironment, describeEnvironment, validateEnvironment } from './providers/detect-environment.js';
export { ProviderFactory } from './providers/factory.js';

// Personal environment providers
export { ClaudeLLMProvider } from './providers/claude-llm.js';
export { LocalFSStorageProvider } from './providers/local-fs-storage.js';
export { TFIDFEmbeddingProvider } from './providers/tfidf-embedding.js';

// Corporate environment providers (stubs)
export { AzureOpenAILLMProvider } from './providers/azure-openai-llm.js';
export { CopilotStudioLLMProvider } from './providers/copilot-studio-llm.js';
export { DataverseStorageProvider } from './providers/dataverse-storage.js';
export { AzureAISearchEmbeddingProvider } from './providers/azure-ai-search-embedding.js';

// Utilities
export { TokenManager } from './providers/token-manager.js';
export { ToolShim } from './providers/tool-shim.js';
export { DocumentStore } from './providers/document-store.js';

// ============================================================================
// RAG SYSTEM
// ============================================================================

export * from './rag/types.js';
export * from './rag/config.js';
export { DocumentProcessor } from './rag/document-processor.js';
export { EmbeddingService } from './rag/embedding-service.js';
export { VectorStore } from './rag/vector-store.js';
export { RetrievalEngine } from './rag/retrieval-engine.js';

// ============================================================================
// LEARNING SYSTEM
// ============================================================================

export * from './learning/types.js';
export { SelfCritique, CritiqueCriteria, DEFAULT_CRITIQUE_CRITERIA } from './learning/self-critique.js';
export { SuccessPatternTracker } from './learning/success-patterns.js';
export { KBEnhancementTracker } from './learning/kb-enhancement.js';

// ============================================================================
// EVALUATION SYSTEM
// ============================================================================

export * from './evaluation/types.js';
export { StepTracker } from './evaluation/step-tracker.js';
export { BaselineTracker } from './evaluation/baseline-tracker.js';
export { BaseScorer } from './evaluation/scorers/base-scorer.js';
export { LLMJudge } from './evaluation/scorers/llm-judge.js';
```

### Task 6.3: Create agent-core Package.json

**File**: `packages/agent-core/package.json`

```json
{
  "name": "@kessel-digital/agent-core",
  "version": "1.0.0",
  "type": "module",
  "description": "Multi-environment agent framework for Kessel Digital agents",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./providers": {
      "import": "./dist/providers/index.js",
      "types": "./dist/providers/index.d.ts"
    },
    "./rag": {
      "import": "./dist/rag/index.js",
      "types": "./dist/rag/index.d.ts"
    },
    "./learning": {
      "import": "./dist/learning/index.js",
      "types": "./dist/learning/index.d.ts"
    },
    "./evaluation": {
      "import": "./dist/evaluation/index.js",
      "types": "./dist/evaluation/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "test": "echo 'No tests yet'",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "natural": "^6.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  },
  "peerDependencies": {
    "@anthropic-ai/sdk": ">=0.20.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "files": [
    "dist",
    "README.md"
  ]
}
```

---

## PART 7: VERIFICATION STEPS

Execute these commands to verify alignment:

### 7.1: Build agent-core
```bash
cd packages/agent-core
npm install
npm run build
```

### 7.2: Update MPA dependencies
```bash
cd release/v5.5/agents/mpa/base/tests/braintrust
npm install
npm run build
```

### 7.3: Verify MPA still works
```bash
cd release/v5.5/agents/mpa/base/tests/braintrust
npx ts-node --esm rag/test-rag.ts
```

### 7.4: Build CA
```bash
cd release/v5.5/agents/ca/base/tests/braintrust
npm install
npm run build
```

### 7.5: Build EAP
```bash
cd release/v5.5/agents/eap/base/tests/braintrust
npm install
npm run build
```

---

## PART 8: COMMIT SEQUENCE

Execute commits in this order:

```bash
# 1. agent-core completion
git add packages/agent-core/
git commit -m "feat(agent-core): complete multi-environment agent framework

- Complete provider interfaces and implementations
- Generic RAG system with injectable agent config
- Learning system with self-critique and KB enhancement types
- Evaluation framework with baseline tracking"

# 2. MPA alignment
git add release/v5.5/agents/mpa/base/tests/braintrust/
git commit -m "refactor(mpa): align with agent-core framework

- Create mpa-agent-config.ts implementing AgentRAGConfig
- Update RAG imports to use agent-core
- Remove duplicate provider files
- Preserve MPA-specific KB impact tracking"

# 3. CA implementation
git add release/v5.5/agents/ca/
git commit -m "feat(ca): create Consulting Agent evaluation harness

- CA directory structure following MPA pattern
- CA-specific RAG configuration
- Evaluation scaffolding ready for scenarios"

# 4. EAP implementation
git add release/v5.5/agents/eap/
git commit -m "feat(eap): create Enterprise AI Platform evaluation harness

- EAP directory structure
- EAP-specific RAG configuration
- Evaluation scaffolding"

# 5. Push all
git push origin deploy/personal
```

---

## CRITICAL REMINDERS

1. **DO NOT DELETE** `kb-impact-tracker.ts` or `kb-update-pipeline.ts` - these are valuable MPA-specific learning components

2. **Async/Await**: All embedding operations are now async. Update all call sites.

3. **Type Compatibility**: agent-core uses `string`, agents use enums. The config adapter pattern handles this.

4. **CA Priority**: CA deploys to Mastercard next week. Ensure CA scaffold compiles even if scenarios aren't implemented.

5. **Test After Each Step**: Run build after each major change to catch issues early.

---

## SUCCESS CRITERIA

- [ ] `packages/agent-core/` compiles with `npm run build`
- [ ] MPA braintrust compiles and `rag/test-rag.ts` works
- [ ] CA braintrust compiles (scaffold only is OK)
- [ ] EAP braintrust compiles (scaffold only is OK)
- [ ] No duplicate provider files in MPA braintrust
- [ ] All commits pushed to `deploy/personal` branch
