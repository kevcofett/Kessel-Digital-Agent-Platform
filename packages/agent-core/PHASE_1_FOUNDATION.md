# PHASE 1: FOUNDATION
# VS Code Claude Execution Plan - Steps 1-17

**Priority:** HIGHEST - CA deploys to Mastercard next week
**Estimated Time:** 2-3 hours
**Branch:** deploy/personal

---

## OVERVIEW

This phase establishes:
- agent-core builds and exports correctly
- MPA aligned with agent-core imports
- CA scaffold created with 35 KB files migrated
- EAP scaffold created with 7 KB files migrated

---

## PRE-FLIGHT CHECK

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git status
git branch
# Should show: deploy/personal
```

---

# STEP 1: Verify agent-core Builds

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core
npm install
npm run build
```

**Expected:** Build succeeds, `dist/` folder created with `.js` and `.d.ts` files.

**If fails:** Check `tsconfig.json` and fix any TypeScript errors before proceeding.

---

# STEP 2: Create MPA Agent Config

**File:** `release/v5.5/agents/mpa/base/tests/braintrust/mpa-agent-config.ts`

```typescript
/**
 * MPA Agent Configuration for agent-core RAG System
 * 
 * This configuration defines how the Media Planning Agent processes
 * queries, matches documents, and retrieves relevant knowledge.
 */

import type { AgentRAGConfig } from '@kessel-digital/agent-core';

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

export type MPAVertical =
  | 'ecommerce'
  | 'retail'
  | 'dtc'
  | 'b2b'
  | 'saas'
  | 'financial'
  | 'healthcare'
  | 'pharma'
  | 'automotive'
  | 'travel'
  | 'cpg'
  | 'technology'
  | 'entertainment'
  | 'education';

export type MPAMetric =
  | 'cac'
  | 'cpa'
  | 'cpm'
  | 'cpc'
  | 'ctr'
  | 'cvr'
  | 'roas'
  | 'roi'
  | 'ltv'
  | 'aov'
  | 'reach'
  | 'frequency'
  | 'impressions'
  | 'clicks'
  | 'conversions';

// ============================================================================
// SYNONYM MAPPINGS
// ============================================================================

const MPA_SYNONYM_MAPPINGS: Record<string, string[]> = {
  // Metrics
  'ltv': ['lifetime value', 'customer lifetime value', 'clv', 'cltv'],
  'cac': ['customer acquisition cost', 'acquisition cost', 'cost of acquisition'],
  'roas': ['return on ad spend', 'return on advertising spend', 'ad return'],
  'cpm': ['cost per thousand', 'cost per mille', 'thousand impressions'],
  'cpa': ['cost per acquisition', 'cost per action', 'acquisition cost'],
  'ctr': ['click through rate', 'click-through rate', 'clickthrough rate'],
  'cvr': ['conversion rate', 'conv rate', 'cr'],
  'aov': ['average order value', 'avg order value', 'order value'],
  'roi': ['return on investment', 'investment return'],
  
  // Concepts
  'channel mix': ['media mix', 'allocation', 'channel allocation', 'media allocation'],
  'benchmark': ['typical', 'industry standard', 'average', 'baseline', 'norm'],
  'kpi': ['key performance indicator', 'metric', 'target metric', 'goal'],
  'incrementality': ['incremental lift', 'incremental value', 'lift', 'true lift'],
  'attribution': ['credit', 'attribution model', 'credit assignment'],
  'reach': ['audience reach', 'unique reach', 'unduplicated reach'],
  'frequency': ['ad frequency', 'exposure frequency', 'avg frequency'],
  
  // Channels
  'paid search': ['ppc', 'sem', 'search ads', 'google ads', 'bing ads'],
  'paid social': ['social ads', 'facebook ads', 'meta ads', 'instagram ads'],
  'display': ['banner ads', 'programmatic display', 'display advertising'],
  'ctv': ['connected tv', 'ott', 'streaming tv', 'streaming ads'],
  'retail media': ['rmn', 'retail media network', 'amazon ads', 'walmart connect'],
  
  // Strategy
  'upper funnel': ['awareness', 'top of funnel', 'tofu', 'brand awareness'],
  'mid funnel': ['consideration', 'middle of funnel', 'mofu'],
  'lower funnel': ['conversion', 'bottom of funnel', 'bofu', 'performance'],
  'full funnel': ['full-funnel', 'integrated funnel', 'holistic'],
};

// ============================================================================
// STEP KEYWORD MAPPINGS (MPA 10-Step Framework)
// ============================================================================

const MPA_STEP_KEYWORDS: Record<number, string[]> = {
  1: ['objective', 'goal', 'kpi', 'target', 'success metric', 'business objective'],
  2: ['economics', 'unit economics', 'ltv', 'cac', 'margin', 'profitability', 'payback'],
  3: ['audience', 'targeting', 'segment', 'persona', 'customer', 'demographic', 'psychographic'],
  4: ['geography', 'geo', 'region', 'market', 'dma', 'location', 'territory'],
  5: ['budget', 'spend', 'investment', 'allocation', 'funding', 'media budget'],
  6: ['value proposition', 'messaging', 'creative', 'positioning', 'usp', 'benefit'],
  7: ['channel', 'media', 'tactic', 'platform', 'channel mix', 'media mix'],
  8: ['measurement', 'attribution', 'tracking', 'analytics', 'reporting', 'mmm'],
  9: ['testing', 'experiment', 'incrementality', 'holdout', 'a/b test', 'lift test'],
  10: ['risk', 'contingency', 'mitigation', 'scenario', 'sensitivity', 'assumption'],
};

// ============================================================================
// DOCUMENT TYPE PATTERNS
// ============================================================================

const MPA_DOCUMENT_PATTERNS: Record<MPADocumentType, RegExp[]> = {
  'benchmark': [
    /benchmark/i,
    /industry.*average/i,
    /typical.*performance/i,
    /baseline/i,
    /norm/i,
  ],
  'framework': [
    /framework/i,
    /methodology/i,
    /approach/i,
    /process/i,
    /step.*by.*step/i,
  ],
  'playbook': [
    /playbook/i,
    /guide/i,
    /how.*to/i,
    /best.*practice/i,
    /recommendation/i,
  ],
  'examples': [
    /example/i,
    /case.*study/i,
    /scenario/i,
    /illustration/i,
    /sample/i,
  ],
  'implications': [
    /implication/i,
    /impact/i,
    /consequence/i,
    /effect/i,
    /result/i,
  ],
  'operating-standards': [
    /standard/i,
    /requirement/i,
    /compliance/i,
    /rule/i,
    /policy/i,
  ],
};

// ============================================================================
// TOPIC DETECTION PATTERNS
// ============================================================================

const MPA_TOPIC_PATTERNS: Record<MPATopic, RegExp[]> = {
  'audience': [
    /audience/i,
    /targeting/i,
    /segment/i,
    /persona/i,
    /demographic/i,
    /customer/i,
  ],
  'budget': [
    /budget/i,
    /spend/i,
    /allocation/i,
    /investment/i,
    /cost/i,
    /funding/i,
  ],
  'channel': [
    /channel/i,
    /media/i,
    /platform/i,
    /tactic/i,
    /paid.*search/i,
    /paid.*social/i,
    /display/i,
    /ctv/i,
    /retail.*media/i,
  ],
  'measurement': [
    /measurement/i,
    /attribution/i,
    /analytics/i,
    /tracking/i,
    /reporting/i,
    /mmm/i,
    /incrementality/i,
  ],
  'benchmark': [
    /benchmark/i,
    /average/i,
    /typical/i,
    /industry.*standard/i,
    /baseline/i,
  ],
  'efficiency': [
    /efficiency/i,
    /optimization/i,
    /performance/i,
    /improvement/i,
    /roas/i,
    /roi/i,
  ],
  'general': [
    /strategy/i,
    /planning/i,
    /approach/i,
    /overview/i,
  ],
};

// ============================================================================
// MAIN CONFIGURATION EXPORT
// ============================================================================

export const MPA_AGENT_CONFIG: AgentRAGConfig = {
  agentId: 'mpa',
  agentName: 'Media Planning Agent',
  agentVersion: '5.5',
  
  // Knowledge Base Configuration
  kbPath: '../../kb',  // Relative to braintrust directory
  kbFilePattern: '*.txt',
  
  // Document Processing
  chunkSize: 1000,
  chunkOverlap: 200,
  
  // Retrieval Configuration
  topK: 5,
  minRelevanceScore: 0.3,
  
  // Synonym Expansion
  synonymMappings: MPA_SYNONYM_MAPPINGS,
  enableSynonymExpansion: true,
  
  // Step Detection (MPA-specific)
  stepKeywords: MPA_STEP_KEYWORDS,
  enableStepDetection: true,
  
  // Document Type Detection
  documentTypePatterns: MPA_DOCUMENT_PATTERNS,
  
  // Topic Detection
  topicPatterns: MPA_TOPIC_PATTERNS,
  
  // Vertical Support
  supportedVerticals: [
    'ecommerce',
    'retail',
    'dtc',
    'b2b',
    'saas',
    'financial',
    'healthcare',
    'pharma',
    'automotive',
    'travel',
    'cpg',
    'technology',
    'entertainment',
    'education',
  ],
  
  // Metrics
  supportedMetrics: [
    'cac',
    'cpa',
    'cpm',
    'cpc',
    'ctr',
    'cvr',
    'roas',
    'roi',
    'ltv',
    'aov',
    'reach',
    'frequency',
    'impressions',
    'clicks',
    'conversions',
  ],
  
  // Feature Flags
  features: {
    enableHybridSearch: true,
    enableQueryExpansion: true,
    enableReranking: false,  // Enable when semantic embedding available
    enableCaching: true,
    cacheTTLSeconds: 3600,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect which MPA step a query relates to
 */
export function detectMPAStep(query: string): number | null {
  const normalizedQuery = query.toLowerCase();
  
  for (const [step, keywords] of Object.entries(MPA_STEP_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        return parseInt(step, 10);
      }
    }
  }
  
  return null;
}

/**
 * Detect the primary topic of a query
 */
export function detectMPATopic(query: string): MPATopic {
  const normalizedQuery = query.toLowerCase();
  
  for (const [topic, patterns] of Object.entries(MPA_TOPIC_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedQuery)) {
        return topic as MPATopic;
      }
    }
  }
  
  return 'general';
}

/**
 * Expand query with synonyms
 */
export function expandMPAQuery(query: string): string[] {
  const expansions: string[] = [query];
  const normalizedQuery = query.toLowerCase();
  
  for (const [term, synonyms] of Object.entries(MPA_SYNONYM_MAPPINGS)) {
    if (normalizedQuery.includes(term)) {
      for (const synonym of synonyms) {
        expansions.push(query.replace(new RegExp(term, 'gi'), synonym));
      }
    }
    
    // Also check if any synonym is in the query
    for (const synonym of synonyms) {
      if (normalizedQuery.includes(synonym.toLowerCase())) {
        expansions.push(query.replace(new RegExp(synonym, 'gi'), term));
      }
    }
  }
  
  return [...new Set(expansions)];
}

/**
 * Get step-specific boost for document scoring
 */
export function getMPAStepBoost(documentContent: string, targetStep: number): number {
  const keywords = MPA_STEP_KEYWORDS[targetStep] || [];
  const normalizedContent = documentContent.toLowerCase();
  
  let matchCount = 0;
  for (const keyword of keywords) {
    if (normalizedContent.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  // Boost based on keyword density
  return 1 + (matchCount * 0.1);
}

export default MPA_AGENT_CONFIG;
```

---

# STEP 3: Update MPA package.json

**File:** `release/v5.5/agents/mpa/base/tests/braintrust/package.json`

**CRITICAL:** The path must be 7 levels up to reach packages/agent-core.

```json
{
  "name": "@kessel-digital/mpa-braintrust",
  "version": "5.5.0",
  "description": "Media Planning Agent Braintrust Evaluation Suite",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "rebuild": "npm run clean && npm run build",
    "eval": "npx braintrust eval mpa-eval.ts",
    "eval:multi": "npx braintrust eval mpa-multi-turn-eval.ts",
    "test": "npm run build && npm run eval"
  },
  "dependencies": {
    "@kessel-digital/agent-core": "file:../../../../../../../packages/agent-core",
    "braintrust": "^0.0.160",
    "autoevals": "^0.0.80",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

# STEP 4: Create/Update MPA tsconfig.json

**File:** `release/v5.5/agents/mpa/base/tests/braintrust/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "paths": {
      "@kessel-digital/agent-core": ["../../../../../../../packages/agent-core/src/index.ts"],
      "@kessel-digital/agent-core/*": ["../../../../../../../packages/agent-core/src/*"]
    }
  },
  "include": [
    "*.ts",
    "**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

---

# STEP 5: Verify MPA Compiles with agent-core

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust
npm install
npm run build
```

**Expected:** Build succeeds. If TypeScript errors about missing types from agent-core, verify agent-core was built first (Step 1).

---

# STEP 6: Create CA Directory Structure

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/ca/base

# Create all directories
mkdir -p kb
mkdir -p src
mkdir -p extensions/mastercard
mkdir -p tests/braintrust/rag
mkdir -p tests/braintrust/learning
mkdir -p tests/braintrust/scenarios
mkdir -p tests/braintrust/scorers

# Create placeholder files
touch extensions/mastercard/.gitkeep
touch tests/braintrust/scenarios/.gitkeep
touch tests/braintrust/scorers/.gitkeep
```

---

# STEP 7: Migrate CA KB Files

```bash
# Copy all 35 KB files from Consulting_Agent repo
cp /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/*.txt \
   /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/ca/base/kb/

# Verify
ls -la /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/ca/base/kb/
# Should show 35 .txt files
```

---

# STEP 8: Create CA Agent Config

**File:** `release/v5.5/agents/ca/base/tests/braintrust/ca-agent-config.ts`

```typescript
/**
 * CA Agent Configuration for agent-core RAG System
 * 
 * This configuration defines how the Consulting Agent processes
 * queries, matches documents, and retrieves relevant knowledge.
 */

import type { AgentRAGConfig } from '@kessel-digital/agent-core';

// ============================================================================
// CA-SPECIFIC TYPE DEFINITIONS
// ============================================================================

export type CADocumentType =
  | 'methodology'
  | 'framework'
  | 'case-study'
  | 'template'
  | 'best-practice'
  | 'industry-analysis'
  | 'reference'
  | 'registry'
  | 'behavioral';

export type CATopic =
  | 'strategy'
  | 'operations'
  | 'technology'
  | 'transformation'
  | 'analytics'
  | 'organization'
  | 'research'
  | 'benchmarks'
  | 'general';

export type CAVertical =
  | 'financial-services'
  | 'banking'
  | 'insurance'
  | 'healthcare'
  | 'pharma'
  | 'retail'
  | 'consumer'
  | 'manufacturing'
  | 'technology'
  | 'telecom'
  | 'energy'
  | 'public-sector'
  | 'private-equity';

export type CAMetric =
  | 'roi'
  | 'npv'
  | 'irr'
  | 'payback'
  | 'tco'
  | 'revenue'
  | 'cost'
  | 'margin'
  | 'ebitda'
  | 'nps'
  | 'adoption-rate'
  | 'headcount'
  | 'attrition'
  | 'time-to-value';

// ============================================================================
// SYNONYM MAPPINGS
// ============================================================================

const CA_SYNONYM_MAPPINGS: Record<string, string[]> = {
  // Business Terms
  'digital transformation': ['dx', 'digitalization', 'digital strategy', 'modernization'],
  'roi': ['return on investment', 'investment return', 'returns'],
  'kpi': ['key performance indicator', 'metric', 'performance metric', 'target'],
  'stakeholder': ['sponsor', 'decision maker', 'executive', 'leadership'],
  'deliverable': ['output', 'artifact', 'work product', 'document'],
  
  // Consulting Terms
  'methodology': ['approach', 'method', 'framework', 'process'],
  'assessment': ['analysis', 'evaluation', 'review', 'audit', 'diagnostic'],
  'recommendation': ['suggestion', 'proposal', 'guidance', 'advice'],
  'implementation': ['execution', 'deployment', 'rollout', 'launch'],
  'change management': ['ocm', 'organizational change', 'transformation management'],
  'due diligence': ['dd', 'diligence', 'investigation', 'review'],
  'synergy': ['synergies', 'cost savings', 'revenue synergy', 'operational synergy'],
  'operating model': ['opmodel', 'business model', 'org model', 'target operating model', 'tom'],
  'value creation': ['value add', 'value generation', 'value capture'],
  'workstream': ['work stream', 'track', 'initiative', 'project stream'],
  
  // Analysis Terms
  'benchmark': ['benchmarking', 'comparison', 'peer comparison', 'industry comparison'],
  'gap analysis': ['gap assessment', 'current vs future', 'as-is to-be'],
  'swot': ['strengths weaknesses', 'swot analysis'],
  'pestle': ['pest', 'pestel', 'external analysis'],
  
  // Technology Terms
  'erp': ['enterprise resource planning', 'sap', 'oracle'],
  'crm': ['customer relationship management', 'salesforce', 'dynamics'],
  'bi': ['business intelligence', 'analytics', 'reporting'],
  'ai': ['artificial intelligence', 'machine learning', 'ml'],
  
  // Industry Terms
  'financial services': ['fsi', 'fs', 'banking and insurance'],
  'private equity': ['pe', 'buyout', 'portfolio company'],
  'healthcare': ['hc', 'health', 'medical'],
  'retail': ['consumer retail', 'commerce'],
};

// ============================================================================
// DOCUMENT TYPE PATTERNS
// ============================================================================

const CA_DOCUMENT_PATTERNS: Record<CADocumentType, RegExp[]> = {
  'methodology': [
    /methodology/i,
    /method/i,
    /approach/i,
    /process/i,
  ],
  'framework': [
    /framework/i,
    /model/i,
    /structure/i,
    /architecture/i,
  ],
  'case-study': [
    /case.*study/i,
    /example/i,
    /scenario/i,
    /client.*story/i,
  ],
  'template': [
    /template/i,
    /format/i,
    /standard/i,
    /boilerplate/i,
  ],
  'best-practice': [
    /best.*practice/i,
    /leading.*practice/i,
    /recommendation/i,
    /guidance/i,
  ],
  'industry-analysis': [
    /industry/i,
    /sector/i,
    /market/i,
    /vertical/i,
    /expertise/i,
  ],
  'reference': [
    /reference/i,
    /glossary/i,
    /definition/i,
    /terminology/i,
  ],
  'registry': [
    /registry/i,
    /inventory/i,
    /catalog/i,
    /list/i,
  ],
  'behavioral': [
    /behavioral/i,
    /behavior/i,
    /routing/i,
    /service/i,
  ],
};

// ============================================================================
// TOPIC DETECTION PATTERNS
// ============================================================================

const CA_TOPIC_PATTERNS: Record<CATopic, RegExp[]> = {
  'strategy': [
    /strategy/i,
    /strategic/i,
    /vision/i,
    /roadmap/i,
    /planning/i,
  ],
  'operations': [
    /operation/i,
    /operational/i,
    /process/i,
    /efficiency/i,
    /optimization/i,
  ],
  'technology': [
    /technology/i,
    /tech/i,
    /digital/i,
    /system/i,
    /platform/i,
    /software/i,
  ],
  'transformation': [
    /transformation/i,
    /change/i,
    /modernization/i,
    /evolution/i,
  ],
  'analytics': [
    /analytics/i,
    /data/i,
    /insight/i,
    /intelligence/i,
    /reporting/i,
  ],
  'organization': [
    /organization/i,
    /org/i,
    /people/i,
    /talent/i,
    /culture/i,
    /leadership/i,
  ],
  'research': [
    /research/i,
    /routing/i,
    /source/i,
    /quality/i,
  ],
  'benchmarks': [
    /benchmark/i,
    /kpi/i,
    /metric/i,
    /performance/i,
  ],
  'general': [
    /general/i,
    /overview/i,
    /introduction/i,
  ],
};

// ============================================================================
// FRAMEWORK LIBRARY (CA-Specific)
// ============================================================================

export const CA_FRAMEWORKS = {
  strategic: [
    'Porter Five Forces',
    'SWOT Analysis',
    'PESTLE Analysis',
    'Value Chain Analysis',
    'BCG Matrix',
    'Ansoff Matrix',
    'Blue Ocean Strategy',
  ],
  operational: [
    'Lean Six Sigma',
    'Business Process Reengineering',
    'Theory of Constraints',
    'Total Quality Management',
    'Kaizen',
  ],
  organizational: [
    'McKinsey 7S',
    'Kotter 8 Steps',
    'ADKAR Model',
    'Bridges Transition Model',
    'Prosci Change Management',
  ],
  financial: [
    'DCF Analysis',
    'NPV/IRR Analysis',
    'Payback Period',
    'Cost-Benefit Analysis',
    'TCO Analysis',
  ],
};

// ============================================================================
// MAIN CONFIGURATION EXPORT
// ============================================================================

export const CA_AGENT_CONFIG: AgentRAGConfig = {
  agentId: 'ca',
  agentName: 'Consulting Agent',
  agentVersion: '12.0',
  
  // Knowledge Base Configuration
  kbPath: '../../kb',  // Relative to braintrust directory
  kbFilePattern: '*.txt',
  
  // Document Processing
  chunkSize: 1200,  // Slightly larger for consulting docs
  chunkOverlap: 250,
  
  // Retrieval Configuration
  topK: 6,
  minRelevanceScore: 0.25,
  
  // Synonym Expansion
  synonymMappings: CA_SYNONYM_MAPPINGS,
  enableSynonymExpansion: true,
  
  // Step Detection - CA does NOT use numbered steps
  stepKeywords: {},
  enableStepDetection: false,
  
  // Document Type Detection
  documentTypePatterns: CA_DOCUMENT_PATTERNS,
  
  // Topic Detection
  topicPatterns: CA_TOPIC_PATTERNS,
  
  // Vertical Support
  supportedVerticals: [
    'financial-services',
    'banking',
    'insurance',
    'healthcare',
    'pharma',
    'retail',
    'consumer',
    'manufacturing',
    'technology',
    'telecom',
    'energy',
    'public-sector',
    'private-equity',
  ],
  
  // Metrics
  supportedMetrics: [
    'roi',
    'npv',
    'irr',
    'payback',
    'tco',
    'revenue',
    'cost',
    'margin',
    'ebitda',
    'nps',
    'adoption-rate',
    'headcount',
    'attrition',
    'time-to-value',
  ],
  
  // Feature Flags
  features: {
    enableHybridSearch: true,
    enableQueryExpansion: true,
    enableReranking: false,
    enableCaching: true,
    cacheTTLSeconds: 3600,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect the primary topic of a query
 */
export function detectCATopic(query: string): CATopic {
  const normalizedQuery = query.toLowerCase();
  
  for (const [topic, patterns] of Object.entries(CA_TOPIC_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedQuery)) {
        return topic as CATopic;
      }
    }
  }
  
  return 'general';
}

/**
 * Expand query with synonyms
 */
export function expandCAQuery(query: string): string[] {
  const expansions: string[] = [query];
  const normalizedQuery = query.toLowerCase();
  
  for (const [term, synonyms] of Object.entries(CA_SYNONYM_MAPPINGS)) {
    if (normalizedQuery.includes(term)) {
      for (const synonym of synonyms) {
        expansions.push(query.replace(new RegExp(term, 'gi'), synonym));
      }
    }
    
    for (const synonym of synonyms) {
      if (normalizedQuery.includes(synonym.toLowerCase())) {
        expansions.push(query.replace(new RegExp(synonym, 'gi'), term));
      }
    }
  }
  
  return [...new Set(expansions)];
}

/**
 * Detect document type from content
 */
export function detectCADocumentType(content: string): CADocumentType {
  const normalizedContent = content.toLowerCase();
  
  for (const [docType, patterns] of Object.entries(CA_DOCUMENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedContent)) {
        return docType as CADocumentType;
      }
    }
  }
  
  return 'best-practice';
}

/**
 * Get relevant frameworks for a topic
 */
export function getCAFrameworksForTopic(topic: CATopic): string[] {
  switch (topic) {
    case 'strategy':
      return CA_FRAMEWORKS.strategic;
    case 'operations':
      return CA_FRAMEWORKS.operational;
    case 'organization':
    case 'transformation':
      return CA_FRAMEWORKS.organizational;
    case 'analytics':
    case 'benchmarks':
      return CA_FRAMEWORKS.financial;
    default:
      return [...CA_FRAMEWORKS.strategic, ...CA_FRAMEWORKS.operational];
  }
}

export default CA_AGENT_CONFIG;
```

---

# STEP 9: Create CA Evaluation Runner

**File:** `release/v5.5/agents/ca/base/tests/braintrust/ca-eval.ts`

```typescript
/**
 * CA Agent Braintrust Evaluation Runner
 * 
 * Evaluates the Consulting Agent's RAG retrieval quality
 * and response generation capabilities.
 */

import { Eval } from 'braintrust';
import { CA_AGENT_CONFIG, detectCATopic, expandCAQuery } from './ca-agent-config.js';

// Import from agent-core (will be available after build)
// import { RetrievalEngine, createProviders } from '@kessel-digital/agent-core';

// ============================================================================
// EVALUATION DATASET
// ============================================================================

interface CATestCase {
  input: string;
  expectedTopic: string;
  expectedDocTypes: string[];
  description: string;
}

const CA_TEST_CASES: CATestCase[] = [
  {
    input: 'What frameworks should I use for digital transformation assessment?',
    expectedTopic: 'transformation',
    expectedDocTypes: ['framework', 'methodology'],
    description: 'Digital transformation framework query',
  },
  {
    input: 'How do I calculate ROI for a technology investment?',
    expectedTopic: 'analytics',
    expectedDocTypes: ['methodology', 'best-practice'],
    description: 'Financial analysis methodology query',
  },
  {
    input: 'What are best practices for change management?',
    expectedTopic: 'organization',
    expectedDocTypes: ['best-practice', 'framework'],
    description: 'Change management best practices query',
  },
  {
    input: 'Show me industry benchmarks for financial services',
    expectedTopic: 'benchmarks',
    expectedDocTypes: ['registry', 'reference'],
    description: 'Industry benchmark query',
  },
  {
    input: 'How should I structure a consulting deliverable?',
    expectedTopic: 'general',
    expectedDocTypes: ['template', 'best-practice'],
    description: 'Deliverable structure query',
  },
  {
    input: 'What data sources are most reliable for market research?',
    expectedTopic: 'research',
    expectedDocTypes: ['reference', 'registry'],
    description: 'Research source quality query',
  },
  {
    input: 'Explain the McKinsey 7S framework',
    expectedTopic: 'organization',
    expectedDocTypes: ['framework'],
    description: 'Specific framework explanation query',
  },
  {
    input: 'What are the key KPIs for operational efficiency?',
    expectedTopic: 'operations',
    expectedDocTypes: ['registry', 'benchmark'],
    description: 'Operational KPI query',
  },
];

// ============================================================================
// SCORERS
// ============================================================================

/**
 * Score topic detection accuracy
 */
function scoreTopicDetection(input: string, expected: string): number {
  const detected = detectCATopic(input);
  return detected === expected ? 1.0 : 0.0;
}

/**
 * Score query expansion quality
 */
function scoreQueryExpansion(input: string): number {
  const expansions = expandCAQuery(input);
  // More expansions generally means better coverage
  // But cap at reasonable level
  const expansionCount = Math.min(expansions.length, 10);
  return expansionCount / 10;
}

/**
 * Score based on config validity
 */
function scoreConfigValidity(): number {
  const config = CA_AGENT_CONFIG;
  let score = 0;
  
  if (config.agentId === 'ca') score += 0.2;
  if (config.kbPath) score += 0.2;
  if (Object.keys(config.synonymMappings || {}).length > 10) score += 0.2;
  if ((config.supportedVerticals?.length || 0) > 5) score += 0.2;
  if ((config.supportedMetrics?.length || 0) > 5) score += 0.2;
  
  return score;
}

// ============================================================================
// MAIN EVALUATION
// ============================================================================

Eval('ca-agent-rag', {
  experimentName: 'ca-rag-baseline',
  
  data: () => CA_TEST_CASES.map(tc => ({
    input: tc.input,
    expected: {
      topic: tc.expectedTopic,
      docTypes: tc.expectedDocTypes,
    },
    metadata: {
      description: tc.description,
    },
  })),
  
  task: async (input: string) => {
    // For now, return config-based analysis
    // Full RAG retrieval will be added when agent-core is wired up
    const topic = detectCATopic(input);
    const expansions = expandCAQuery(input);
    
    return {
      topic,
      expansions,
      expansionCount: expansions.length,
      configValid: scoreConfigValidity() === 1.0,
    };
  },
  
  scores: [
    // Topic detection accuracy
    (args) => {
      const score = scoreTopicDetection(args.input, args.expected.topic);
      return {
        name: 'topic_detection',
        score,
      };
    },
    
    // Query expansion quality
    (args) => {
      const score = scoreQueryExpansion(args.input);
      return {
        name: 'query_expansion',
        score,
      };
    },
    
    // Config validity
    () => {
      const score = scoreConfigValidity();
      return {
        name: 'config_validity',
        score,
      };
    },
  ],
});

export { CA_TEST_CASES };
```

---

# STEP 10: Create CA package.json

**File:** `release/v5.5/agents/ca/base/tests/braintrust/package.json`

```json
{
  "name": "@kessel-digital/ca-braintrust",
  "version": "12.0.0",
  "description": "Consulting Agent Braintrust Evaluation Suite",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "rebuild": "npm run clean && npm run build",
    "eval": "npx braintrust eval ca-eval.ts",
    "test": "npm run build && npm run eval"
  },
  "dependencies": {
    "@kessel-digital/agent-core": "file:../../../../../../../packages/agent-core",
    "braintrust": "^0.0.160",
    "autoevals": "^0.0.80",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

# STEP 11: Create CA tsconfig.json

**File:** `release/v5.5/agents/ca/base/tests/braintrust/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "paths": {
      "@kessel-digital/agent-core": ["../../../../../../../packages/agent-core/src/index.ts"],
      "@kessel-digital/agent-core/*": ["../../../../../../../packages/agent-core/src/*"]
    }
  },
  "include": [
    "*.ts",
    "**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

---

# STEP 12: Create CA rag/index.ts

**File:** `release/v5.5/agents/ca/base/tests/braintrust/rag/index.ts`

```typescript
/**
 * CA RAG Module
 * 
 * Re-exports agent-core RAG components with CA-specific configuration.
 */

// Re-export from agent-core
export {
  RetrievalEngine,
  DocumentProcessor,
  EmbeddingService,
  VectorStore,
  type RAGConfig,
  type SearchResult,
  type Document,
  type Chunk,
} from '@kessel-digital/agent-core';

// CA-specific exports
export { CA_AGENT_CONFIG, detectCATopic, expandCAQuery } from '../ca-agent-config.js';

// ============================================================================
// CA RETRIEVAL ENGINE FACTORY
// ============================================================================

import { RetrievalEngine } from '@kessel-digital/agent-core';
import { CA_AGENT_CONFIG } from '../ca-agent-config.js';

let caRetrievalEngine: RetrievalEngine | null = null;

/**
 * Get or create the CA RetrievalEngine singleton
 */
export async function getCARetrievalEngine(): Promise<RetrievalEngine> {
  if (!caRetrievalEngine) {
    caRetrievalEngine = await createCARetrievalEngine();
  }
  return caRetrievalEngine;
}

/**
 * Create a new CA RetrievalEngine instance
 */
export async function createCARetrievalEngine(): Promise<RetrievalEngine> {
  const engine = new RetrievalEngine({
    agentConfig: CA_AGENT_CONFIG,
    // Provider configuration will be added based on environment
  });
  
  await engine.initialize();
  return engine;
}

/**
 * Reset the CA RetrievalEngine (for testing)
 */
export function resetCARetrievalEngine(): void {
  caRetrievalEngine = null;
}
```

---

# STEP 13: Verify CA Builds

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/ca/base/tests/braintrust
npm install
npm run build
```

**Expected:** Build succeeds. May have warnings about missing agent-core exports - that's OK for now.

---

# STEP 14: Create EAP Directory Structure

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents

# Create EAP directory (if doesn't exist)
mkdir -p eap/base/kb
mkdir -p eap/base/src
mkdir -p eap/base/extensions
mkdir -p eap/base/tests/braintrust/rag
mkdir -p eap/base/tests/braintrust/learning
mkdir -p eap/base/tests/braintrust/scenarios
mkdir -p eap/base/tests/braintrust/scorers

# Create placeholder files
touch eap/base/extensions/.gitkeep
touch eap/base/tests/braintrust/scenarios/.gitkeep
touch eap/base/tests/braintrust/scorers/.gitkeep
```

---

# STEP 15: Migrate EAP KB Files

```bash
# Copy all 7 KB files from Enterprise_AI_Platform repo
cp /Users/kevinbauer/Kessel-Digital/Enterprise_AI_Platform/kb/*.txt \
   /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/eap/base/kb/

# Verify
ls -la /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/eap/base/kb/
# Should show 7 .txt files
```

---

# STEP 16: Create EAP Agent Config

**File:** `release/v5.5/agents/eap/base/tests/braintrust/eap-agent-config.ts`

```typescript
/**
 * EAP Agent Configuration for agent-core RAG System
 * 
 * This configuration defines how the Enterprise AI Platform agent processes
 * queries, matches documents, and retrieves relevant knowledge.
 */

import type { AgentRAGConfig } from '@kessel-digital/agent-core';

// ============================================================================
// EAP-SPECIFIC TYPE DEFINITIONS
// ============================================================================

export type EAPDocumentType =
  | 'architecture'
  | 'integration'
  | 'security'
  | 'governance'
  | 'operations'
  | 'best-practice'
  | 'reference'
  | 'registry';

export type EAPTopic =
  | 'infrastructure'
  | 'integration'
  | 'security'
  | 'data'
  | 'ml-ops'
  | 'governance'
  | 'tools'
  | 'general';

export type EAPVertical =
  | 'enterprise'
  | 'saas'
  | 'cloud'
  | 'on-premise'
  | 'hybrid'
  | 'multi-tenant'
  | 'startup'
  | 'regulated';

export type EAPMetric =
  | 'latency'
  | 'throughput'
  | 'availability'
  | 'uptime'
  | 'cost'
  | 'token-usage'
  | 'error-rate'
  | 'accuracy'
  | 'p50'
  | 'p95'
  | 'p99'
  | 'ttft'
  | 'model-size'
  | 'context-length';

// ============================================================================
// SYNONYM MAPPINGS
// ============================================================================

const EAP_SYNONYM_MAPPINGS: Record<string, string[]> = {
  // AI/ML Terms
  'llm': ['large language model', 'language model', 'foundation model', 'gpt', 'claude', 'gemini'],
  'rag': ['retrieval augmented generation', 'retrieval-augmented', 'grounded generation'],
  'vector database': ['vector db', 'vector store', 'embedding database', 'pinecone', 'weaviate', 'milvus', 'qdrant'],
  'fine-tuning': ['finetuning', 'fine tuning', 'model customization', 'training'],
  'prompt engineering': ['prompting', 'prompt design', 'prompt optimization'],
  'embedding': ['embeddings', 'vector embedding', 'text embedding', 'semantic embedding'],
  'inference': ['model inference', 'prediction', 'generation'],
  'guardrails': ['safety rails', 'content filter', 'moderation', 'safety measures'],
  
  // Technical Terms
  'api': ['application programming interface', 'endpoint', 'rest api', 'graphql'],
  'token': ['tokens', 'tokenization', 'token count', 'context tokens'],
  'deployment': ['deploy', 'production', 'release', 'rollout'],
  'gpu': ['graphics processing unit', 'cuda', 'nvidia', 'a100', 'h100'],
  'mlops': ['ml ops', 'machine learning operations', 'model operations'],
  'latency': ['response time', 'delay', 'lag', 'ttft'],
  
  // Architecture Terms
  'microservices': ['micro services', 'service-oriented', 'distributed'],
  'serverless': ['lambda', 'functions', 'faas'],
  'kubernetes': ['k8s', 'container orchestration', 'aks', 'eks', 'gke'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'devops', 'pipeline'],
  
  // Platform Terms
  'azure': ['microsoft azure', 'azure cloud'],
  'aws': ['amazon web services', 'amazon cloud'],
  'gcp': ['google cloud', 'google cloud platform'],
  'openai': ['open ai', 'chatgpt', 'gpt-4'],
  'anthropic': ['claude', 'claude api'],
};

// ============================================================================
// DOCUMENT TYPE PATTERNS
// ============================================================================

const EAP_DOCUMENT_PATTERNS: Record<EAPDocumentType, RegExp[]> = {
  'architecture': [
    /architecture/i,
    /design/i,
    /system.*design/i,
    /infrastructure/i,
  ],
  'integration': [
    /integration/i,
    /api/i,
    /connect/i,
    /interface/i,
  ],
  'security': [
    /security/i,
    /auth/i,
    /encryption/i,
    /compliance/i,
    /privacy/i,
  ],
  'governance': [
    /governance/i,
    /policy/i,
    /standard/i,
    /compliance/i,
    /audit/i,
  ],
  'operations': [
    /operation/i,
    /monitoring/i,
    /maintenance/i,
    /support/i,
    /incident/i,
  ],
  'best-practice': [
    /best.*practice/i,
    /recommendation/i,
    /guidance/i,
    /pattern/i,
  ],
  'reference': [
    /reference/i,
    /glossary/i,
    /definition/i,
    /terminology/i,
  ],
  'registry': [
    /registry/i,
    /inventory/i,
    /catalog/i,
    /available/i,
  ],
};

// ============================================================================
// TOPIC DETECTION PATTERNS
// ============================================================================

const EAP_TOPIC_PATTERNS: Record<EAPTopic, RegExp[]> = {
  'infrastructure': [
    /infrastructure/i,
    /cloud/i,
    /server/i,
    /compute/i,
    /storage/i,
    /network/i,
  ],
  'integration': [
    /integration/i,
    /api/i,
    /webhook/i,
    /connect/i,
    /sync/i,
  ],
  'security': [
    /security/i,
    /auth/i,
    /encryption/i,
    /access.*control/i,
    /permission/i,
  ],
  'data': [
    /data/i,
    /database/i,
    /storage/i,
    /etl/i,
    /pipeline/i,
  ],
  'ml-ops': [
    /mlops/i,
    /ml.*ops/i,
    /model.*deployment/i,
    /training/i,
    /fine.*tun/i,
  ],
  'governance': [
    /governance/i,
    /policy/i,
    /compliance/i,
    /audit/i,
    /regulation/i,
  ],
  'tools': [
    /tool/i,
    /method/i,
    /consulting/i,
    /framework/i,
  ],
  'general': [
    /general/i,
    /overview/i,
    /introduction/i,
    /service/i,
  ],
};

// ============================================================================
// MAIN CONFIGURATION EXPORT
// ============================================================================

export const EAP_AGENT_CONFIG: AgentRAGConfig = {
  agentId: 'eap',
  agentName: 'Enterprise AI Platform',
  agentVersion: '1.0',
  
  // Knowledge Base Configuration
  kbPath: '../../kb',  // Relative to braintrust directory
  kbFilePattern: '*.txt',
  
  // Document Processing
  chunkSize: 1000,
  chunkOverlap: 200,
  
  // Retrieval Configuration
  topK: 5,
  minRelevanceScore: 0.3,
  
  // Synonym Expansion
  synonymMappings: EAP_SYNONYM_MAPPINGS,
  enableSynonymExpansion: true,
  
  // Step Detection - EAP does NOT use numbered steps
  stepKeywords: {},
  enableStepDetection: false,
  
  // Document Type Detection
  documentTypePatterns: EAP_DOCUMENT_PATTERNS,
  
  // Topic Detection
  topicPatterns: EAP_TOPIC_PATTERNS,
  
  // Vertical Support
  supportedVerticals: [
    'enterprise',
    'saas',
    'cloud',
    'on-premise',
    'hybrid',
    'multi-tenant',
    'startup',
    'regulated',
  ],
  
  // Metrics
  supportedMetrics: [
    'latency',
    'throughput',
    'availability',
    'uptime',
    'cost',
    'token-usage',
    'error-rate',
    'accuracy',
    'p50',
    'p95',
    'p99',
    'ttft',
    'model-size',
    'context-length',
  ],
  
  // Feature Flags
  features: {
    enableHybridSearch: true,
    enableQueryExpansion: true,
    enableReranking: false,
    enableCaching: true,
    cacheTTLSeconds: 3600,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect the primary topic of a query
 */
export function detectEAPTopic(query: string): EAPTopic {
  const normalizedQuery = query.toLowerCase();
  
  for (const [topic, patterns] of Object.entries(EAP_TOPIC_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedQuery)) {
        return topic as EAPTopic;
      }
    }
  }
  
  return 'general';
}

/**
 * Expand query with synonyms
 */
export function expandEAPQuery(query: string): string[] {
  const expansions: string[] = [query];
  const normalizedQuery = query.toLowerCase();
  
  for (const [term, synonyms] of Object.entries(EAP_SYNONYM_MAPPINGS)) {
    if (normalizedQuery.includes(term)) {
      for (const synonym of synonyms) {
        expansions.push(query.replace(new RegExp(term, 'gi'), synonym));
      }
    }
    
    for (const synonym of synonyms) {
      if (normalizedQuery.includes(synonym.toLowerCase())) {
        expansions.push(query.replace(new RegExp(synonym, 'gi'), term));
      }
    }
  }
  
  return [...new Set(expansions)];
}

/**
 * Detect document type from content
 */
export function detectEAPDocumentType(content: string): EAPDocumentType {
  const normalizedContent = content.toLowerCase();
  
  for (const [docType, patterns] of Object.entries(EAP_DOCUMENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedContent)) {
        return docType as EAPDocumentType;
      }
    }
  }
  
  return 'best-practice';
}

export default EAP_AGENT_CONFIG;
```

---

# STEP 17: Create EAP Evaluation Runner

**File:** `release/v5.5/agents/eap/base/tests/braintrust/eap-eval.ts`

```typescript
/**
 * EAP Agent Braintrust Evaluation Runner
 * 
 * Evaluates the Enterprise AI Platform agent's RAG retrieval quality
 * and response generation capabilities.
 */

import { Eval } from 'braintrust';
import { EAP_AGENT_CONFIG, detectEAPTopic, expandEAPQuery } from './eap-agent-config.js';

// ============================================================================
// EVALUATION DATASET
// ============================================================================

interface EAPTestCase {
  input: string;
  expectedTopic: string;
  expectedDocTypes: string[];
  description: string;
}

const EAP_TEST_CASES: EAPTestCase[] = [
  {
    input: 'How do I set up a RAG system with vector database?',
    expectedTopic: 'data',
    expectedDocTypes: ['architecture', 'best-practice'],
    description: 'RAG architecture query',
  },
  {
    input: 'What are the best practices for LLM security?',
    expectedTopic: 'security',
    expectedDocTypes: ['security', 'best-practice'],
    description: 'LLM security query',
  },
  {
    input: 'How do I monitor model latency in production?',
    expectedTopic: 'ml-ops',
    expectedDocTypes: ['operations', 'best-practice'],
    description: 'MLOps monitoring query',
  },
  {
    input: 'What integrations are available for the platform?',
    expectedTopic: 'integration',
    expectedDocTypes: ['registry', 'integration'],
    description: 'Integration availability query',
  },
  {
    input: 'How should I handle API authentication?',
    expectedTopic: 'security',
    expectedDocTypes: ['security', 'integration'],
    description: 'API security query',
  },
  {
    input: 'What are typical token costs for GPT-4?',
    expectedTopic: 'general',
    expectedDocTypes: ['reference', 'best-practice'],
    description: 'Cost estimation query',
  },
  {
    input: 'How do I implement guardrails for content moderation?',
    expectedTopic: 'governance',
    expectedDocTypes: ['governance', 'security'],
    description: 'Guardrails implementation query',
  },
];

// ============================================================================
// SCORERS
// ============================================================================

/**
 * Score topic detection accuracy
 */
function scoreTopicDetection(input: string, expected: string): number {
  const detected = detectEAPTopic(input);
  return detected === expected ? 1.0 : 0.0;
}

/**
 * Score query expansion quality
 */
function scoreQueryExpansion(input: string): number {
  const expansions = expandEAPQuery(input);
  const expansionCount = Math.min(expansions.length, 10);
  return expansionCount / 10;
}

/**
 * Score based on config validity
 */
function scoreConfigValidity(): number {
  const config = EAP_AGENT_CONFIG;
  let score = 0;
  
  if (config.agentId === 'eap') score += 0.2;
  if (config.kbPath) score += 0.2;
  if (Object.keys(config.synonymMappings || {}).length > 10) score += 0.2;
  if ((config.supportedVerticals?.length || 0) > 5) score += 0.2;
  if ((config.supportedMetrics?.length || 0) > 5) score += 0.2;
  
  return score;
}

// ============================================================================
// MAIN EVALUATION
// ============================================================================

Eval('eap-agent-rag', {
  experimentName: 'eap-rag-baseline',
  
  data: () => EAP_TEST_CASES.map(tc => ({
    input: tc.input,
    expected: {
      topic: tc.expectedTopic,
      docTypes: tc.expectedDocTypes,
    },
    metadata: {
      description: tc.description,
    },
  })),
  
  task: async (input: string) => {
    const topic = detectEAPTopic(input);
    const expansions = expandEAPQuery(input);
    
    return {
      topic,
      expansions,
      expansionCount: expansions.length,
      configValid: scoreConfigValidity() === 1.0,
    };
  },
  
  scores: [
    (args) => ({
      name: 'topic_detection',
      score: scoreTopicDetection(args.input, args.expected.topic),
    }),
    (args) => ({
      name: 'query_expansion',
      score: scoreQueryExpansion(args.input),
    }),
    () => ({
      name: 'config_validity',
      score: scoreConfigValidity(),
    }),
  ],
});

export { EAP_TEST_CASES };
```

---

# STEP 18: Create EAP package.json and tsconfig.json

**File:** `release/v5.5/agents/eap/base/tests/braintrust/package.json`

```json
{
  "name": "@kessel-digital/eap-braintrust",
  "version": "1.0.0",
  "description": "Enterprise AI Platform Braintrust Evaluation Suite",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "rebuild": "npm run clean && npm run build",
    "eval": "npx braintrust eval eap-eval.ts",
    "test": "npm run build && npm run eval"
  },
  "dependencies": {
    "@kessel-digital/agent-core": "file:../../../../../../../packages/agent-core",
    "braintrust": "^0.0.160",
    "autoevals": "^0.0.80",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
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
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "paths": {
      "@kessel-digital/agent-core": ["../../../../../../../packages/agent-core/src/index.ts"],
      "@kessel-digital/agent-core/*": ["../../../../../../../packages/agent-core/src/*"]
    }
  },
  "include": [
    "*.ts",
    "**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

---

# STEP 19: Create EAP rag/index.ts

**File:** `release/v5.5/agents/eap/base/tests/braintrust/rag/index.ts`

```typescript
/**
 * EAP RAG Module
 * 
 * Re-exports agent-core RAG components with EAP-specific configuration.
 */

export {
  RetrievalEngine,
  DocumentProcessor,
  EmbeddingService,
  VectorStore,
  type RAGConfig,
  type SearchResult,
  type Document,
  type Chunk,
} from '@kessel-digital/agent-core';

export { EAP_AGENT_CONFIG, detectEAPTopic, expandEAPQuery } from '../eap-agent-config.js';

import { RetrievalEngine } from '@kessel-digital/agent-core';
import { EAP_AGENT_CONFIG } from '../eap-agent-config.js';

let eapRetrievalEngine: RetrievalEngine | null = null;

export async function getEAPRetrievalEngine(): Promise<RetrievalEngine> {
  if (!eapRetrievalEngine) {
    eapRetrievalEngine = await createEAPRetrievalEngine();
  }
  return eapRetrievalEngine;
}

export async function createEAPRetrievalEngine(): Promise<RetrievalEngine> {
  const engine = new RetrievalEngine({
    agentConfig: EAP_AGENT_CONFIG,
  });
  
  await engine.initialize();
  return engine;
}

export function resetEAPRetrievalEngine(): void {
  eapRetrievalEngine = null;
}
```

---

# STEP 20: Verify EAP Builds

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/eap/base/tests/braintrust
npm install
npm run build
```

---

# PHASE 1 COMMIT

After all steps complete successfully:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

git add .
git commit -m "feat(agents): Phase 1 - Foundation scaffolds for MPA, CA, EAP

- Created mpa-agent-config.ts with 10-step framework support
- Created ca-agent-config.ts with consulting synonyms and frameworks
- Created eap-agent-config.ts with AI/ML terminology
- Migrated 35 CA KB files from Consulting_Agent repo
- Migrated 7 EAP KB files from Enterprise_AI_Platform repo
- All three agents compile with agent-core dependency
- Correct 7-level import paths for package.json dependencies"

git push origin deploy/personal
```

---

# VERIFICATION CHECKLIST

- [ ] agent-core builds: `npm run build` in packages/agent-core
- [ ] MPA builds: `npm run build` in release/v5.5/agents/mpa/base/tests/braintrust
- [ ] CA builds: `npm run build` in release/v5.5/agents/ca/base/tests/braintrust
- [ ] EAP builds: `npm run build` in release/v5.5/agents/eap/base/tests/braintrust
- [ ] CA KB has 35 files: `ls release/v5.5/agents/ca/base/kb/*.txt | wc -l`
- [ ] EAP KB has 7 files: `ls release/v5.5/agents/eap/base/kb/*.txt | wc -l`
