/**
 * EAP Agent Configuration for agent-core RAG System
 *
 * This configuration defines how the Enterprise AI Platform agent processes
 * queries, matches documents, and retrieves relevant knowledge.
 */

import type { AgentRAGConfig, DocumentPurpose } from '@kessel-digital/agent-core';

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

const EAP_DOCUMENT_TYPE_PATTERNS: Record<string, RegExp[]> = {
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
// DOCUMENT PURPOSE PATTERNS
// ============================================================================

const EAP_DOCUMENT_PURPOSE_PATTERNS: Record<DocumentPurpose, RegExp[]> = {
  'definitive': [
    /architecture/i,
    /specification/i,
    /official/i,
  ],
  'guidance': [
    /guide/i,
    /best.*practice/i,
    /recommendation/i,
  ],
  'reference': [
    /reference/i,
    /registry/i,
    /glossary/i,
  ],
  'procedural': [
    /process/i,
    /procedure/i,
    /operation/i,
  ],
  'template': [
    /template/i,
    /format/i,
  ],
  'example': [
    /example/i,
    /sample/i,
    /demo/i,
  ],
};

// ============================================================================
// TOPIC KEYWORD MAPPINGS
// ============================================================================

const EAP_TOPIC_KEYWORDS: Record<string, string[]> = {
  'infrastructure': [
    'infrastructure',
    'cloud',
    'server',
    'compute',
    'storage',
    'network',
  ],
  'integration': [
    'integration',
    'api',
    'webhook',
    'connect',
    'sync',
  ],
  'security': [
    'security',
    'auth',
    'encryption',
    'access control',
    'permission',
  ],
  'data': [
    'data',
    'database',
    'storage',
    'etl',
    'pipeline',
  ],
  'ml-ops': [
    'mlops',
    'ml ops',
    'model deployment',
    'training',
    'fine-tuning',
  ],
  'governance': [
    'governance',
    'policy',
    'compliance',
    'audit',
    'regulation',
  ],
  'tools': [
    'tool',
    'method',
    'consulting',
    'framework',
  ],
  'general': [
    'general',
    'overview',
    'introduction',
    'service',
  ],
};

// ============================================================================
// VERTICAL AND METRIC PATTERNS
// ============================================================================

const EAP_VERTICAL_PATTERNS: string[] = [
  'enterprise',
  'saas',
  'cloud',
  'on-premise',
  'on-prem',
  'hybrid',
  'multi-tenant',
  'startup',
  'regulated',
  'financial',
  'healthcare',
];

const EAP_METRIC_PATTERNS: string[] = [
  'latency',
  'throughput',
  'availability',
  'uptime',
  'cost',
  'token-usage',
  'tokens',
  'error-rate',
  'accuracy',
  'p50',
  'p95',
  'p99',
  'ttft',
  'model-size',
  'context-length',
];

// ============================================================================
// MAIN CONFIGURATION EXPORT
// ============================================================================

export const EAP_AGENT_CONFIG: AgentRAGConfig = {
  // Knowledge Base Configuration
  kbPath: '../../kb',  // Relative to braintrust directory

  // Excluded files
  excludedFiles: [],

  // Deprioritized files
  deprioritizedFiles: [],

  // Synonym Expansion
  synonymMappings: EAP_SYNONYM_MAPPINGS,

  // Document Type Detection
  documentTypePatterns: EAP_DOCUMENT_TYPE_PATTERNS,

  // Document Purpose Detection
  documentPurposePatterns: EAP_DOCUMENT_PURPOSE_PATTERNS,

  // Topic Keywords
  topicKeywords: EAP_TOPIC_KEYWORDS,

  // Step Detection - EAP does NOT use numbered steps
  stepKeywords: {},

  // Vertical Patterns
  verticalPatterns: EAP_VERTICAL_PATTERNS,

  // Metric Patterns
  metricPatterns: EAP_METRIC_PATTERNS,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect the primary topic of a query
 */
export function detectEAPTopic(query: string): EAPTopic {
  const normalizedQuery = query.toLowerCase();

  for (const [topic, keywords] of Object.entries(EAP_TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
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

  for (const [docType, patterns] of Object.entries(EAP_DOCUMENT_TYPE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedContent)) {
        return docType as EAPDocumentType;
      }
    }
  }

  return 'best-practice';
}

export default EAP_AGENT_CONFIG;
