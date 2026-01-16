/**
 * MPA Agent Configuration for agent-core RAG System
 *
 * This configuration defines how the Media Planning Agent processes
 * queries, matches documents, and retrieves relevant knowledge.
 */

import type { AgentRAGConfig, DocumentPurpose } from '@kessel-digital/agent-core';

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

const MPA_DOCUMENT_TYPE_PATTERNS: Record<string, RegExp[]> = {
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
// DOCUMENT PURPOSE PATTERNS
// ============================================================================

const MPA_DOCUMENT_PURPOSE_PATTERNS: Record<DocumentPurpose, RegExp[]> = {
  'definitive': [
    /benchmark/i,
    /authoritative/i,
    /official/i,
  ],
  'guidance': [
    /playbook/i,
    /guide/i,
    /best.*practice/i,
  ],
  'reference': [
    /reference/i,
    /glossary/i,
    /terminology/i,
  ],
  'procedural': [
    /process/i,
    /procedure/i,
    /workflow/i,
  ],
  'template': [
    /template/i,
    /format/i,
  ],
  'example': [
    /example/i,
    /conversation/i,
    /sample/i,
  ],
};

// ============================================================================
// TOPIC KEYWORD MAPPINGS
// ============================================================================

const MPA_TOPIC_KEYWORDS: Record<string, string[]> = {
  'audience': [
    'audience',
    'targeting',
    'segment',
    'persona',
    'demographic',
    'customer',
  ],
  'budget': [
    'budget',
    'spend',
    'allocation',
    'investment',
    'cost',
    'funding',
  ],
  'channel': [
    'channel',
    'media',
    'platform',
    'tactic',
    'paid search',
    'paid social',
    'display',
    'ctv',
    'retail media',
  ],
  'measurement': [
    'measurement',
    'attribution',
    'analytics',
    'tracking',
    'reporting',
    'mmm',
    'incrementality',
  ],
  'benchmark': [
    'benchmark',
    'average',
    'typical',
    'industry standard',
    'baseline',
  ],
  'efficiency': [
    'efficiency',
    'optimization',
    'performance',
    'improvement',
    'roas',
    'roi',
  ],
  'general': [
    'strategy',
    'planning',
    'approach',
    'overview',
  ],
};

// ============================================================================
// VERTICAL AND METRIC PATTERNS
// ============================================================================

const MPA_VERTICAL_PATTERNS: string[] = [
  'ecommerce',
  'e-commerce',
  'retail',
  'dtc',
  'direct-to-consumer',
  'b2b',
  'saas',
  'financial',
  'finance',
  'healthcare',
  'pharma',
  'pharmaceutical',
  'automotive',
  'travel',
  'cpg',
  'consumer packaged goods',
  'technology',
  'tech',
  'entertainment',
  'education',
];

const MPA_METRIC_PATTERNS: string[] = [
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
];

// ============================================================================
// MAIN CONFIGURATION EXPORT
// ============================================================================

export const MPA_AGENT_CONFIG: AgentRAGConfig = {
  // Knowledge Base Configuration
  kbPath: '../../kb',  // Relative to braintrust directory

  // Excluded files (none for MPA)
  excludedFiles: [],

  // Deprioritized files (conversation examples)
  deprioritizedFiles: [
    'conversation-examples.txt',
    'sample-dialogues.txt',
  ],

  // Synonym Expansion
  synonymMappings: MPA_SYNONYM_MAPPINGS,

  // Document Type Detection
  documentTypePatterns: MPA_DOCUMENT_TYPE_PATTERNS,

  // Document Purpose Detection
  documentPurposePatterns: MPA_DOCUMENT_PURPOSE_PATTERNS,

  // Topic Keywords
  topicKeywords: MPA_TOPIC_KEYWORDS,

  // Step Detection (MPA-specific)
  stepKeywords: MPA_STEP_KEYWORDS,

  // Vertical Patterns
  verticalPatterns: MPA_VERTICAL_PATTERNS,

  // Metric Patterns
  metricPatterns: MPA_METRIC_PATTERNS,
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

  for (const [topic, keywords] of Object.entries(MPA_TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
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
