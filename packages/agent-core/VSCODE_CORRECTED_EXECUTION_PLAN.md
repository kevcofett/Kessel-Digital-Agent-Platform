# VS Code Claude: Corrected Execution Plan
# Agent-Core Alignment and Agent Harness Creation

**Date:** 2026-01-11
**Priority:** CA deployment to Mastercard NEXT WEEK
**Branch:** deploy/personal

---

## CRITICAL CORRECTIONS FROM ORIGINAL SPEC

### FIX 1: Import Path (BREAKING BUG IN ORIGINAL)

The path from `release/v5.5/agents/*/base/tests/braintrust/` to `packages/agent-core` is **7 levels**, not 5.

```
braintrust/ → tests/ → base/ → ca/ → agents/ → v5.5/ → release/ → [ROOT] → packages/
     1          2        3       4       5         6         7                 8
```

**CORRECT package.json dependency:**
```json
"@kessel-digital/agent-core": "file:../../../../../../../packages/agent-core"
```

### FIX 2: Execution Order

Validate the integration pattern with MPA FIRST (lower risk), then create CA/EAP using the proven pattern.

### FIX 3: Missing Directories

Each agent needs `kb/` directory for knowledge base files and CA needs `extensions/mastercard/` for corporate deployment.

---

## EXECUTION STEPS

Execute these steps IN ORDER. Do not skip ahead.

---

## STEP 1: Verify agent-core Builds

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core
npm install
npm run build
```

**Expected:** Build succeeds with dist/ folder created.

**If fails:** Fix TypeScript errors before proceeding.

---

## STEP 2: Create MPA Agent Config (Validate Pattern)

Create this file to validate agent-core integration works:

**File:** `release/v5.5/agents/mpa/base/tests/braintrust/mpa-agent-config.ts`

```typescript
/**
 * MPA Agent Configuration for agent-core RAG System
 * 
 * Bridges MPA-specific configuration to generic agent-core interfaces.
 */

import type { AgentRAGConfig, RAGSystemConfig } from '@kessel-digital/agent-core';

// ============================================================================
// MPA-SPECIFIC TYPE DEFINITIONS
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

const MPA_STEP_KEYWORDS: Record<string, string[]> = {
  '1': ['objective', 'outcome', 'goal', 'success', 'business'],
  '2': ['economics', 'ltv', 'cac', 'margin', 'profitability', 'unit'],
  '3': ['audience', 'targeting', 'segment', 'persona', 'demographic'],
  '4': ['geography', 'geo', 'dma', 'region', 'market', 'location'],
  '5': ['budget', 'allocation', 'spend', 'investment'],
  '6': ['value proposition', 'messaging', 'positioning', 'differentiation'],
  '7': ['channel', 'media mix', 'platform', 'programmatic'],
  '8': ['measurement', 'attribution', 'kpi', 'tracking'],
  '9': ['testing', 'experiment', 'hypothesis', 'learn'],
  '10': ['risk', 'mitigation', 'contingency', 'fallback'],
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

const MPA_VERTICAL_PATTERNS: string[] = [
  'ecommerce', 'e-commerce', 'retail', 'dtc', 'direct-to-consumer',
  'b2b', 'saas', 'enterprise', 'financial', 'fintech',
  'healthcare', 'pharma', 'automotive', 'travel', 'hospitality',
  'cpg', 'fmcg', 'consumer goods', 'technology', 'telecom',
];

const MPA_METRIC_PATTERNS: string[] = [
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
// HELPERS
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

---

## STEP 3: Update MPA package.json

**File:** `release/v5.5/agents/mpa/base/tests/braintrust/package.json`

Add the agent-core dependency (merge with existing):

```json
{
  "dependencies": {
    "@kessel-digital/agent-core": "file:../../../../../../../packages/agent-core"
  }
}
```

**Note:** Keep all existing dependencies. Only ADD this line.

---

## STEP 4: Verify MPA Compiles with agent-core

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust
npm install
npx tsc --noEmit
```

**Expected:** No TypeScript errors related to agent-core imports.

**If fails:** Fix the AgentRAGConfig interface in agent-core or the MPA config before proceeding.

---

## STEP 5: Create CA Directory Structure

Create these directories and files:

```bash
mkdir -p release/v5.5/agents/ca/base/kb
mkdir -p release/v5.5/agents/ca/base/src
mkdir -p release/v5.5/agents/ca/base/tests/braintrust/scenarios
mkdir -p release/v5.5/agents/ca/base/tests/braintrust/scorers
mkdir -p release/v5.5/agents/ca/base/tests/braintrust/rag
mkdir -p release/v5.5/agents/ca/extensions/mastercard

touch release/v5.5/agents/ca/base/kb/.gitkeep
touch release/v5.5/agents/ca/base/src/.gitkeep
touch release/v5.5/agents/ca/extensions/mastercard/.gitkeep
```

---

## STEP 6: Create CA Agent Config

**File:** `release/v5.5/agents/ca/base/tests/braintrust/ca-agent-config.ts`

```typescript
/**
 * CA (Consulting Agent) Configuration for agent-core RAG System
 */

import type { AgentRAGConfig, RAGSystemConfig } from '@kessel-digital/agent-core';

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
  'due diligence': ['dd', 'diligence', 'assessment'],
  'synergy': ['synergies', 'cost savings', 'revenue enhancement'],
  'operating model': ['target operating model', 'tom', 'business model'],
  'value creation': ['value add', 'value driver', 'value lever'],
  'workstream': ['work stream', 'track', 'initiative'],
};

// ============================================================================
// CA TOPIC KEYWORDS
// ============================================================================

const CA_TOPIC_KEYWORDS: Record<string, string[]> = {
  strategy: ['strategy', 'strategic', 'vision', 'mission', 'objective', 'goal', 'competitive'],
  operations: ['operations', 'process', 'efficiency', 'optimization', 'workflow', 'lean'],
  technology: ['technology', 'digital', 'system', 'platform', 'tool', 'software', 'automation'],
  transformation: ['transformation', 'change', 'modernization', 'evolution', 'turnaround'],
  analytics: ['analytics', 'data', 'insight', 'metric', 'measurement', 'reporting', 'dashboard'],
  organization: ['organization', 'team', 'structure', 'culture', 'capability', 'talent'],
  general: [],
};

// ============================================================================
// CA DOCUMENT TYPE PATTERNS
// ============================================================================

const CA_DOCUMENT_TYPE_PATTERNS: Record<string, RegExp[]> = {
  methodology: [/methodology/i, /approach/i, /method/i],
  framework: [/framework/i, /model/i, /structure/i],
  'case-study': [/case.*study/i, /example/i, /success.*story/i, /client.*story/i],
  template: [/template/i, /format/i, /standard/i],
  'best-practice': [/best.*practice/i, /guideline/i, /playbook/i],
  'industry-analysis': [/industry/i, /market/i, /trend/i, /sector/i],
};

// ============================================================================
// CA DOCUMENT PURPOSE PATTERNS
// ============================================================================

const CA_DOCUMENT_PURPOSE_PATTERNS: Record<string, RegExp[]> = {
  definitive: [/methodology/i, /framework/i, /standard/i],
  guidance: [/best.*practice/i, /guideline/i, /recommendation/i],
  reference: [/reference/i, /glossary/i, /definition/i],
  procedural: [/process/i, /procedure/i, /workflow/i, /checklist/i],
  template: [/template/i, /format/i],
  example: [/case.*study/i, /example/i, /sample/i],
};

// ============================================================================
// CA VERTICAL AND METRIC PATTERNS
// ============================================================================

const CA_VERTICAL_PATTERNS: string[] = [
  'financial services', 'banking', 'insurance', 'fintech', 'asset management',
  'healthcare', 'pharma', 'life sciences', 'medical devices',
  'retail', 'consumer', 'cpg', 'fmcg', 'luxury',
  'manufacturing', 'industrial', 'automotive', 'aerospace',
  'technology', 'software', 'telecom', 'media', 'entertainment',
  'energy', 'utilities', 'oil and gas', 'mining',
  'public sector', 'government', 'education', 'nonprofit',
  'private equity', 'venture capital', 'investment',
];

const CA_METRIC_PATTERNS: string[] = [
  'roi', 'npv', 'irr', 'payback', 'tco', 'tcv',
  'revenue', 'cost', 'margin', 'profit', 'ebitda', 'ebit',
  'efficiency', 'productivity', 'utilization', 'yield',
  'satisfaction', 'nps', 'engagement', 'retention',
  'time to value', 'adoption rate', 'completion rate', 'success rate',
  'headcount', 'fte', 'attrition', 'turnover',
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
  stepKeywords: {}, // CA does not use numbered steps like MPA
  verticalPatterns: CA_VERTICAL_PATTERNS,
  metricPatterns: CA_METRIC_PATTERNS,
};

// ============================================================================
// CA RAG SYSTEM CONFIG OVERRIDES
// ============================================================================

export const CA_RAG_SYSTEM_CONFIG: Partial<RAGSystemConfig> = {
  chunking: {
    targetChunkSize: 500,
    maxChunkSize: 800,
    minChunkSize: 150,
    overlapTokens: 75,
  },
  embedding: {
    maxFeatures: 1500,
    minDocFreq: 2,
    maxDocFreqRatio: 0.95,
  },
  retrieval: {
    defaultTopK: 5,
    minScore: 0.20,
    semanticWeight: 0.65,
    keywordWeight: 0.35,
    benchmarkBoost: 1.5,
    exactMatchBoost: 1.3,
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
// HELPERS
// ============================================================================

export function toCADocumentType(type: string): CADocumentType {
  const validTypes: CADocumentType[] = [
    'methodology', 'framework', 'case-study', 'template', 'best-practice', 'industry-analysis'
  ];
  return validTypes.includes(type as CADocumentType) 
    ? type as CADocumentType 
    : 'framework';
}

export function toCATopic(topic: string): CATopic {
  const validTopics: CATopic[] = [
    'strategy', 'operations', 'technology', 'transformation', 'analytics', 'organization', 'general'
  ];
  return validTopics.includes(topic as CATopic)
    ? topic as CATopic
    : 'general';
}

export default CA_AGENT_CONFIG;
```

---

## STEP 7: Create CA Evaluation Runner

**File:** `release/v5.5/agents/ca/base/tests/braintrust/ca-eval.ts`

```typescript
/**
 * CA (Consulting Agent) Evaluation Runner
 * 
 * Multi-turn evaluation harness for the Consulting Agent.
 * Deploys to Mastercard next week - scaffold must compile.
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { 
  RetrievalEngine, 
  TFIDFEmbeddingProvider,
  type EmbeddingConfig 
} from '@kessel-digital/agent-core';

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

export async function getRetrievalEngine(): Promise<RetrievalEngine> {
  if (retrievalEngine && retrievalEngine.isInitialized()) {
    return retrievalEngine;
  }

  const embeddingConfig: Partial<EmbeddingConfig> = {
    maxFeatures: CA_RAG_SYSTEM_CONFIG.embedding?.maxFeatures || 1500,
    cacheSize: CA_RAG_SYSTEM_CONFIG.cache?.queryEmbeddingCacheSize || 100,
  };

  const embeddingProvider = new TFIDFEmbeddingProvider(embeddingConfig);

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

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('CA (Consulting Agent) Evaluation Runner');
  console.log('='.repeat(60));
  console.log('');
  console.log('Configuration:');
  console.log(`  Model: ${CONFIG.model}`);
  console.log(`  Max Turns: ${CONFIG.maxTurns}`);
  console.log(`  KB Path: ${CA_AGENT_CONFIG.kbPath}`);
  console.log('');

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY not set. Evaluation will fail.');
    console.warn('Create .env file with ANTHROPIC_API_KEY=your-key');
    console.warn('');
  }

  // Initialize RAG
  try {
    console.log('Initializing RAG system...');
    const engine = await getRetrievalEngine();
    const stats = engine.getStats();
    console.log(`RAG initialized with ${stats.chunkCount} chunks from ${stats.documentCount} documents`);
  } catch (error) {
    console.log('RAG initialization skipped (no KB files yet)');
    console.log('Add knowledge base files to: release/v5.5/agents/ca/base/kb/');
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('SCAFFOLD COMPLETE - Evaluation scenarios not yet implemented');
  console.log('='.repeat(60));
  console.log('');
  console.log('Next steps to complete CA evaluation:');
  console.log('1. Add CA knowledge base files to base/kb/');
  console.log('2. Create test scenarios in scenarios/');
  console.log('3. Create CA-specific scorers in scorers/');
  console.log('4. Implement conversation-engine.ts');
  console.log('5. Implement user-simulator.ts');
  console.log('');
}

main().catch(console.error);
```

---

## STEP 8: Create CA Package Files

**File:** `release/v5.5/agents/ca/base/tests/braintrust/package.json`

```json
{
  "name": "@kessel-digital/ca-eval",
  "version": "1.0.0",
  "type": "module",
  "description": "Consulting Agent evaluation harness for Kessel Digital",
  "main": "dist/ca-eval.js",
  "scripts": {
    "build": "tsc",
    "eval": "node dist/ca-eval.js",
    "eval:dev": "npx tsx ca-eval.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "@kessel-digital/agent-core": "file:../../../../../../../packages/agent-core",
    "braintrust": "^0.0.175",
    "dotenv": "^16.3.1",
    "natural": "^6.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

**File:** `release/v5.5/agents/ca/base/tests/braintrust/tsconfig.json`

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
      "@kessel-digital/agent-core": ["../../../../../../../packages/agent-core/src/index"],
      "@kessel-digital/agent-core/*": ["../../../../../../../packages/agent-core/src/*"]
    }
  },
  "include": [
    "*.ts",
    "scenarios/**/*.ts",
    "scorers/**/*.ts",
    "rag/**/*.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

---

## STEP 9: Create CA RAG Re-export

**File:** `release/v5.5/agents/ca/base/tests/braintrust/rag/index.ts`

```typescript
/**
 * CA RAG System
 * 
 * Re-exports agent-core RAG components with CA configuration.
 */

// Re-export all RAG types and classes from agent-core
export {
  // Types
  DocumentChunk,
  ChunkMetadata,
  DocumentPurpose,
  StoredChunk,
  SearchResult,
  MetadataFilter,
  SearchOptions,
  RetrievalResult,
  
  // Config
  AgentRAGConfig,
  RAGSystemConfig,
  DEFAULT_RAG_CONFIG,
  DOCUMENT_PURPOSE_BOOSTS,
  
  // Classes
  DocumentProcessor,
  EmbeddingService,
  VectorStore,
  RetrievalEngine,
} from '@kessel-digital/agent-core';

// Re-export CA-specific configuration
export {
  CA_AGENT_CONFIG,
  CA_RAG_SYSTEM_CONFIG,
  CADocumentType,
  CATopic,
  toCADocumentType,
  toCATopic,
} from '../ca-agent-config.js';
```

---

## STEP 10: Create CA Placeholder Files

**File:** `release/v5.5/agents/ca/base/tests/braintrust/scenarios/index.ts`

```typescript
/**
 * CA Test Scenarios
 * 
 * Placeholder - implement CA-specific test scenarios here.
 */

export interface CAScenario {
  id: string;
  name: string;
  description: string;
  industry?: string;
  complexity: 'simple' | 'moderate' | 'complex';
  turns: Array<{
    userMessage: string;
    expectedTopics?: string[];
    expectedBehaviors?: string[];
  }>;
}

// Placeholder scenarios - implement based on CA use cases
export const CA_SCENARIOS: CAScenario[] = [
  // TODO: Add CA-specific scenarios
  // Example structure:
  // {
  //   id: 'ca-strategy-001',
  //   name: 'Digital Transformation Assessment',
  //   description: 'Client seeking digital transformation roadmap',
  //   industry: 'financial services',
  //   complexity: 'complex',
  //   turns: [
  //     { userMessage: 'We want to modernize our customer experience...', ... }
  //   ]
  // }
];

export default CA_SCENARIOS;
```

**File:** `release/v5.5/agents/ca/base/tests/braintrust/scorers/index.ts`

```typescript
/**
 * CA Evaluation Scorers
 * 
 * Placeholder - implement CA-specific scorers here.
 */

export { BaseScorer, LLMJudge } from '@kessel-digital/agent-core';

// TODO: Implement CA-specific scorers
// Examples:
// - MethodologyAdherenceScorer
// - RecommendationQualityScorer
// - IndustryRelevanceScorer
// - ExecutiveSummaryScorer

export const CA_SCORER_WEIGHTS = {
  accuracy: 0.25,
  completeness: 0.20,
  methodology: 0.20,
  actionability: 0.20,
  communication: 0.15,
};

export default CA_SCORER_WEIGHTS;
```

---

## STEP 11: Verify CA Builds

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/ca/base/tests/braintrust
npm install
npm run build
```

**Expected:** Build succeeds with dist/ folder created.

---

## STEP 12: Create EAP Directory Structure

```bash
mkdir -p release/v5.5/agents/eap/base/kb
mkdir -p release/v5.5/agents/eap/base/src
mkdir -p release/v5.5/agents/eap/base/tests/braintrust/scenarios
mkdir -p release/v5.5/agents/eap/base/tests/braintrust/scorers
mkdir -p release/v5.5/agents/eap/base/tests/braintrust/rag
mkdir -p release/v5.5/agents/eap/extensions

touch release/v5.5/agents/eap/base/kb/.gitkeep
touch release/v5.5/agents/eap/base/src/.gitkeep
touch release/v5.5/agents/eap/extensions/.gitkeep
```

---

## STEP 13: Create EAP Agent Config

**File:** `release/v5.5/agents/eap/base/tests/braintrust/eap-agent-config.ts`

```typescript
/**
 * EAP (Enterprise AI Platform) Configuration for agent-core RAG System
 */

import type { AgentRAGConfig, RAGSystemConfig } from '@kessel-digital/agent-core';

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
  'llm': ['large language model', 'language model', 'foundation model', 'fm'],
  'rag': ['retrieval augmented generation', 'retrieval-augmented generation'],
  'vector database': ['vector store', 'embedding store', 'vector db', 'vectordb'],
  'fine-tuning': ['fine tuning', 'model tuning', 'adaptation', 'finetuning'],
  'prompt engineering': ['prompt design', 'prompt optimization', 'prompting'],
  'api': ['application programming interface', 'endpoint', 'service'],
  'token': ['tokens', 'token count', 'context window', 'context length'],
  'embedding': ['embeddings', 'vector representation', 'semantic vector'],
  'inference': ['model inference', 'prediction', 'generation', 'completion'],
  'deployment': ['model deployment', 'serving', 'production', 'hosting'],
  'gpu': ['graphics processing unit', 'accelerator', 'cuda'],
  'mlops': ['ml ops', 'machine learning operations', 'aiops'],
  'guardrails': ['safety', 'content filter', 'moderation'],
};

// ============================================================================
// EAP TOPIC KEYWORDS
// ============================================================================

const EAP_TOPIC_KEYWORDS: Record<string, string[]> = {
  infrastructure: ['infrastructure', 'compute', 'gpu', 'cluster', 'scaling', 'cloud', 'kubernetes'],
  integration: ['integration', 'api', 'connector', 'pipeline', 'workflow', 'orchestration'],
  security: ['security', 'privacy', 'compliance', 'encryption', 'authentication', 'authorization'],
  data: ['data', 'dataset', 'training', 'validation', 'preprocessing', 'annotation'],
  'ml-ops': ['mlops', 'deployment', 'monitoring', 'versioning', 'registry', 'cicd'],
  governance: ['governance', 'policy', 'audit', 'ethics', 'responsible ai', 'bias'],
  general: [],
};

// ============================================================================
// EAP DOCUMENT TYPE PATTERNS
// ============================================================================

const EAP_DOCUMENT_TYPE_PATTERNS: Record<string, RegExp[]> = {
  architecture: [/architecture/i, /design/i, /system/i, /diagram/i],
  integration: [/integration/i, /api/i, /connector/i, /sdk/i],
  security: [/security/i, /compliance/i, /privacy/i, /gdpr/i, /hipaa/i],
  governance: [/governance/i, /policy/i, /standard/i, /ethics/i],
  operations: [/operations/i, /runbook/i, /procedure/i, /sop/i],
  'best-practice': [/best.*practice/i, /guideline/i, /pattern/i, /recommendation/i],
};

// ============================================================================
// EAP DOCUMENT PURPOSE PATTERNS
// ============================================================================

const EAP_DOCUMENT_PURPOSE_PATTERNS: Record<string, RegExp[]> = {
  definitive: [/architecture/i, /specification/i, /standard/i],
  guidance: [/best.*practice/i, /guideline/i, /recommendation/i],
  reference: [/reference/i, /api.*doc/i, /glossary/i],
  procedural: [/runbook/i, /procedure/i, /sop/i, /checklist/i],
  template: [/template/i, /starter/i],
  example: [/example/i, /sample/i, /demo/i, /tutorial/i],
};

// ============================================================================
// EAP VERTICAL AND METRIC PATTERNS
// ============================================================================

const EAP_VERTICAL_PATTERNS: string[] = [
  'enterprise', 'saas', 'cloud', 'on-premise', 'on-prem',
  'hybrid', 'multi-tenant', 'single-tenant',
  'startup', 'scale-up', 'corporate',
  'regulated', 'healthcare', 'financial', 'government',
];

const EAP_METRIC_PATTERNS: string[] = [
  'latency', 'throughput', 'availability', 'uptime', 'sla',
  'cost', 'token usage', 'error rate', 'accuracy', 'precision', 'recall',
  'p50', 'p95', 'p99', 'ttft', 'tps', 'qps',
  'model size', 'parameter count', 'context length',
];

// ============================================================================
// EXPORTED EAP CONFIGURATION
// ============================================================================

export const EAP_AGENT_CONFIG: AgentRAGConfig = {
  kbPath: '../../../kb',
  excludedFiles: [],
  deprioritizedFiles: [],
  synonymMappings: EAP_SYNONYM_MAPPINGS,
  documentTypePatterns: EAP_DOCUMENT_TYPE_PATTERNS,
  documentPurposePatterns: EAP_DOCUMENT_PURPOSE_PATTERNS,
  topicKeywords: EAP_TOPIC_KEYWORDS,
  stepKeywords: {}, // EAP does not use numbered steps
  verticalPatterns: EAP_VERTICAL_PATTERNS,
  metricPatterns: EAP_METRIC_PATTERNS,
};

// ============================================================================
// EAP RAG SYSTEM CONFIG OVERRIDES
// ============================================================================

export const EAP_RAG_SYSTEM_CONFIG: Partial<RAGSystemConfig> = {
  chunking: {
    targetChunkSize: 450,
    maxChunkSize: 700,
    minChunkSize: 120,
    overlapTokens: 60,
  },
  embedding: {
    maxFeatures: 1500,
    minDocFreq: 2,
    maxDocFreqRatio: 0.95,
  },
  retrieval: {
    defaultTopK: 5,
    minScore: 0.22,
    semanticWeight: 0.55,
    keywordWeight: 0.45,
    benchmarkBoost: 1.3,
    exactMatchBoost: 1.4,
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
// HELPERS
// ============================================================================

export function toEAPDocumentType(type: string): EAPDocumentType {
  const validTypes: EAPDocumentType[] = [
    'architecture', 'integration', 'security', 'governance', 'operations', 'best-practice'
  ];
  return validTypes.includes(type as EAPDocumentType) 
    ? type as EAPDocumentType 
    : 'best-practice';
}

export function toEAPTopic(topic: string): EAPTopic {
  const validTopics: EAPTopic[] = [
    'infrastructure', 'integration', 'security', 'data', 'ml-ops', 'governance', 'general'
  ];
  return validTopics.includes(topic as EAPTopic)
    ? topic as EAPTopic
    : 'general';
}

export default EAP_AGENT_CONFIG;
```

---

## STEP 14: Create EAP Evaluation Runner

**File:** `release/v5.5/agents/eap/base/tests/braintrust/eap-eval.ts`

```typescript
/**
 * EAP (Enterprise AI Platform) Evaluation Runner
 * 
 * Multi-turn evaluation harness for the Enterprise AI Platform agent.
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { 
  RetrievalEngine, 
  TFIDFEmbeddingProvider,
  type EmbeddingConfig 
} from '@kessel-digital/agent-core';

import { EAP_AGENT_CONFIG, EAP_RAG_SYSTEM_CONFIG } from './eap-agent-config.js';

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

export async function getRetrievalEngine(): Promise<RetrievalEngine> {
  if (retrievalEngine && retrievalEngine.isInitialized()) {
    return retrievalEngine;
  }

  const embeddingConfig: Partial<EmbeddingConfig> = {
    maxFeatures: EAP_RAG_SYSTEM_CONFIG.embedding?.maxFeatures || 1500,
    cacheSize: EAP_RAG_SYSTEM_CONFIG.cache?.queryEmbeddingCacheSize || 100,
  };

  const embeddingProvider = new TFIDFEmbeddingProvider(embeddingConfig);

  retrievalEngine = new RetrievalEngine({
    agentConfig: EAP_AGENT_CONFIG,
    embeddingProvider,
    systemConfig: EAP_RAG_SYSTEM_CONFIG,
    basePath: __dirname,
  });

  await retrievalEngine.initialize();
  return retrievalEngine;
}

// ============================================================================
// MAIN EVALUATION
// ============================================================================

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('EAP (Enterprise AI Platform) Evaluation Runner');
  console.log('='.repeat(60));
  console.log('');
  console.log('Configuration:');
  console.log(`  Model: ${CONFIG.model}`);
  console.log(`  Max Turns: ${CONFIG.maxTurns}`);
  console.log(`  KB Path: ${EAP_AGENT_CONFIG.kbPath}`);
  console.log('');

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY not set. Evaluation will fail.');
    console.warn('Create .env file with ANTHROPIC_API_KEY=your-key');
    console.warn('');
  }

  // Initialize RAG
  try {
    console.log('Initializing RAG system...');
    const engine = await getRetrievalEngine();
    const stats = engine.getStats();
    console.log(`RAG initialized with ${stats.chunkCount} chunks from ${stats.documentCount} documents`);
  } catch (error) {
    console.log('RAG initialization skipped (no KB files yet)');
    console.log('Add knowledge base files to: release/v5.5/agents/eap/base/kb/');
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('SCAFFOLD COMPLETE - Evaluation scenarios not yet implemented');
  console.log('='.repeat(60));
  console.log('');
  console.log('Next steps to complete EAP evaluation:');
  console.log('1. Add EAP knowledge base files to base/kb/');
  console.log('2. Create test scenarios in scenarios/');
  console.log('3. Create EAP-specific scorers in scorers/');
  console.log('4. Implement conversation-engine.ts');
  console.log('5. Implement user-simulator.ts');
  console.log('');
}

main().catch(console.error);
```

---

## STEP 15: Create EAP Package Files

**File:** `release/v5.5/agents/eap/base/tests/braintrust/package.json`

```json
{
  "name": "@kessel-digital/eap-eval",
  "version": "1.0.0",
  "type": "module",
  "description": "Enterprise AI Platform evaluation harness for Kessel Digital",
  "main": "dist/eap-eval.js",
  "scripts": {
    "build": "tsc",
    "eval": "node dist/eap-eval.js",
    "eval:dev": "npx tsx eap-eval.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "@kessel-digital/agent-core": "file:../../../../../../../packages/agent-core",
    "braintrust": "^0.0.175",
    "dotenv": "^16.3.1",
    "natural": "^6.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

**File:** `release/v5.5/agents/eap/base/tests/braintrust/tsconfig.json`

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
      "@kessel-digital/agent-core": ["../../../../../../../packages/agent-core/src/index"],
      "@kessel-digital/agent-core/*": ["../../../../../../../packages/agent-core/src/*"]
    }
  },
  "include": [
    "*.ts",
    "scenarios/**/*.ts",
    "scorers/**/*.ts",
    "rag/**/*.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

---

## STEP 16: Create EAP RAG Re-export and Placeholders

**File:** `release/v5.5/agents/eap/base/tests/braintrust/rag/index.ts`

```typescript
/**
 * EAP RAG System
 * 
 * Re-exports agent-core RAG components with EAP configuration.
 */

export {
  DocumentChunk,
  ChunkMetadata,
  DocumentPurpose,
  StoredChunk,
  SearchResult,
  MetadataFilter,
  SearchOptions,
  RetrievalResult,
  AgentRAGConfig,
  RAGSystemConfig,
  DEFAULT_RAG_CONFIG,
  DOCUMENT_PURPOSE_BOOSTS,
  DocumentProcessor,
  EmbeddingService,
  VectorStore,
  RetrievalEngine,
} from '@kessel-digital/agent-core';

export {
  EAP_AGENT_CONFIG,
  EAP_RAG_SYSTEM_CONFIG,
  EAPDocumentType,
  EAPTopic,
  toEAPDocumentType,
  toEAPTopic,
} from '../eap-agent-config.js';
```

**File:** `release/v5.5/agents/eap/base/tests/braintrust/scenarios/index.ts`

```typescript
/**
 * EAP Test Scenarios
 * 
 * Placeholder - implement EAP-specific test scenarios here.
 */

export interface EAPScenario {
  id: string;
  name: string;
  description: string;
  domain?: string;
  complexity: 'simple' | 'moderate' | 'complex';
  turns: Array<{
    userMessage: string;
    expectedTopics?: string[];
    expectedBehaviors?: string[];
  }>;
}

export const EAP_SCENARIOS: EAPScenario[] = [];

export default EAP_SCENARIOS;
```

**File:** `release/v5.5/agents/eap/base/tests/braintrust/scorers/index.ts`

```typescript
/**
 * EAP Evaluation Scorers
 * 
 * Placeholder - implement EAP-specific scorers here.
 */

export { BaseScorer, LLMJudge } from '@kessel-digital/agent-core';

export const EAP_SCORER_WEIGHTS = {
  accuracy: 0.25,
  completeness: 0.20,
  technical_depth: 0.20,
  actionability: 0.20,
  security_awareness: 0.15,
};

export default EAP_SCORER_WEIGHTS;
```

---

## STEP 17: Verify EAP Builds

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/eap/base/tests/braintrust
npm install
npm run build
```

---

## STEP 18: Update MPA RAG Index (Remove Duplicates)

**File:** `release/v5.5/agents/mpa/base/tests/braintrust/rag/index.ts`

Replace the ENTIRE file with:

```typescript
/**
 * MPA RAG System
 * 
 * Re-exports agent-core RAG components with MPA-specific configuration.
 */

// Re-export agent-core components
export {
  // Types
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
  
  // Config
  AgentRAGConfig,
  RAGSystemConfig,
  DEFAULT_RAG_CONFIG,
  DOCUMENT_PURPOSE_BOOSTS,
  
  // Classes
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

// Legacy exports for backwards compatibility
import { MPA_AGENT_CONFIG, MPA_RAG_SYSTEM_CONFIG } from '../mpa-agent-config.js';

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

---

## STEP 19: Create MPA Retrieval Engine Factory

**File:** `release/v5.5/agents/mpa/base/tests/braintrust/rag/mpa-retrieval-engine.ts`

```typescript
/**
 * MPA Retrieval Engine Factory
 * 
 * Creates RetrievalEngine pre-configured for MPA use cases.
 */

import { 
  RetrievalEngine, 
  TFIDFEmbeddingProvider,
  type EmbeddingConfig 
} from '@kessel-digital/agent-core';

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

  const embeddingConfig: Partial<EmbeddingConfig> = {
    maxFeatures: MPA_RAG_SYSTEM_CONFIG.embedding?.maxFeatures || 1500,
    cacheSize: MPA_RAG_SYSTEM_CONFIG.cache?.queryEmbeddingCacheSize || 100,
  };

  const embeddingProvider = new TFIDFEmbeddingProvider(embeddingConfig);

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
  const embeddingConfig: Partial<EmbeddingConfig> = {
    maxFeatures: MPA_RAG_SYSTEM_CONFIG.embedding?.maxFeatures || 1500,
    cacheSize: MPA_RAG_SYSTEM_CONFIG.cache?.queryEmbeddingCacheSize || 100,
  };

  const embeddingProvider = new TFIDFEmbeddingProvider(embeddingConfig);

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

---

## STEP 20: Update MPA Providers Index (Remove Duplicates)

**File:** `release/v5.5/agents/mpa/base/tests/braintrust/rag/providers/index.ts`

Replace the ENTIRE file with:

```typescript
/**
 * MPA Provider Re-exports
 * 
 * All providers are now in agent-core. This file provides backwards compatibility.
 */

export {
  // Interfaces
  LLMProvider,
  LLMMessage,
  LLMContentBlock,
  LLMToolDefinition,
  LLMOptions,
  LLMResponse,
  StorageProvider,
  EmbeddingProvider,
  EmbeddingConfig,
  DEFAULT_EMBEDDING_CONFIG,
  EnvironmentConfig,
  LLMProviderType,
  StorageProviderType,
  EmbeddingProviderType,
  
  // Environment detection
  detectEnvironment,
  describeEnvironment,
  validateEnvironment,
  
  // Factory
  ProviderFactory,
  
  // Personal providers (implemented)
  ClaudeLLMProvider,
  LocalFSStorageProvider,
  TFIDFEmbeddingProvider,
  
  // Corporate providers (stubs)
  AzureOpenAILLMProvider,
  CopilotStudioLLMProvider,
  DataverseStorageProvider,
  AzureAISearchEmbeddingProvider,
  
  // Utilities
  TokenManager,
  
  // Errors
  ProviderNotImplementedError,
  ProviderConfigurationError,
  ProviderInitializationError,
} from '@kessel-digital/agent-core';
```

---

## STEP 21: Delete Duplicate Provider Files from MPA

Delete these files from `release/v5.5/agents/mpa/base/tests/braintrust/rag/providers/`:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust/rag/providers

# Keep only index.ts, delete everything else
rm -f azure-ai-search-embedding.ts
rm -f azure-openai-llm.ts
rm -f claude-llm.ts
rm -f copilot-studio-llm.ts
rm -f dataverse-storage.ts
rm -f detect-environment.ts
rm -f factory.ts
rm -f interfaces.ts
rm -f local-fs-storage.ts
rm -f tfidf-embedding.ts
rm -f token-manager.ts
```

**Keep:** `index.ts` (the re-export file created in Step 20)

---

## STEP 22: Verify MPA Still Builds

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust
npm install
npm run build
```

---

## STEP 23: Final Verification - All Three Agents

```bash
# agent-core
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core
npm run build
echo "agent-core: $(ls dist/*.js 2>/dev/null | wc -l) files built"

# CA
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/ca/base/tests/braintrust
npm run build
echo "CA: $(ls dist/*.js 2>/dev/null | wc -l) files built"

# EAP
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/eap/base/tests/braintrust
npm run build
echo "EAP: $(ls dist/*.js 2>/dev/null | wc -l) files built"

# MPA
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust
npm run build
echo "MPA: $(ls dist/*.js 2>/dev/null | wc -l) files built"
```

---

## STEP 24: Commit Sequence

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Stage and commit agent-core (if any changes)
git add packages/agent-core/
git commit -m "chore(agent-core): verify build and add execution plan docs" || echo "No changes to agent-core"

# Stage and commit CA
git add release/v5.5/agents/ca/
git commit -m "feat(ca): create Consulting Agent evaluation harness

- CA directory structure with kb/, src/, tests/braintrust/
- CA-specific RAG configuration (synonyms, topics, verticals)
- Evaluation scaffold ready for scenarios
- Extensions structure for Mastercard deployment"

# Stage and commit EAP
git add release/v5.5/agents/eap/
git commit -m "feat(eap): create Enterprise AI Platform evaluation harness

- EAP directory structure with kb/, src/, tests/braintrust/
- EAP-specific RAG configuration (AI/ML terminology)
- Evaluation scaffold ready for scenarios"

# Stage and commit MPA alignment
git add release/v5.5/agents/mpa/
git commit -m "refactor(mpa): align with agent-core framework

- Create mpa-agent-config.ts implementing AgentRAGConfig
- Update RAG to import from agent-core
- Create mpa-retrieval-engine.ts factory
- Remove duplicate provider files
- Preserve MPA-specific KB tracking and tools"

# Push all
git push origin deploy/personal
```

---

## SUCCESS CRITERIA CHECKLIST

Before marking complete, verify ALL of these:

- [ ] `packages/agent-core/` builds without errors
- [ ] `release/v5.5/agents/ca/base/tests/braintrust/` builds without errors
- [ ] `release/v5.5/agents/eap/base/tests/braintrust/` builds without errors
- [ ] `release/v5.5/agents/mpa/base/tests/braintrust/` builds without errors
- [ ] CA has `kb/` directory with `.gitkeep`
- [ ] CA has `extensions/mastercard/` directory with `.gitkeep`
- [ ] EAP has `kb/` directory with `.gitkeep`
- [ ] MPA duplicate provider files are deleted (only `index.ts` remains)
- [ ] All commits pushed to `deploy/personal` branch

---

## FILES NOT TO DELETE (CRITICAL)

These MPA files contain valuable production logic - DO NOT DELETE:

```
release/v5.5/agents/mpa/base/tests/braintrust/
├── kb-impact-tracker.ts      # KB document usage tracking
├── kb-update-pipeline.ts     # Automated KB updates
├── kb-injector.ts            # KB injection into conversations
├── failure-detector.ts       # Failure pattern detection
├── tool-executor.ts          # MPA tool execution
├── conversation-engine.ts    # Conversation management
├── user-simulator.ts         # User simulation for testing
├── mpa-eval.ts               # Main evaluation runner
├── mpa-multi-turn-eval.ts    # Multi-turn evaluation
├── scenarios/                # ALL scenario files
└── scorers/                  # ALL scorer files
```

---

## TROUBLESHOOTING

### Error: "Cannot find module '@kessel-digital/agent-core'"

**Cause:** Wrong import path in package.json

**Fix:** Ensure path is `file:../../../../../../../packages/agent-core` (7 levels up)

### Error: "AgentRAGConfig is not exported"

**Cause:** agent-core index.ts doesn't export the type

**Fix:** Check `packages/agent-core/src/index.ts` includes `export * from './rag/config.js'`

### Error: "Property 'stepKeywords' does not exist"

**Cause:** AgentRAGConfig interface doesn't match config files

**Fix:** Verify `packages/agent-core/src/rag/config.ts` has all required properties

### Error: "Cannot find module 'natural'"

**Cause:** Dependencies not installed

**Fix:** Run `npm install` in the affected directory

---

## END OF EXECUTION PLAN
