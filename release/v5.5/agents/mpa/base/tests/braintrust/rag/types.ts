/**
 * RAG System Type Definitions
 */

// ============================================================================
// DOCUMENT PROCESSING TYPES
// ============================================================================

export interface DocumentChunk {
  id: string;                    // Unique: {filename}_{chunk_index}
  content: string;               // Chunk text
  filename: string;              // Source KB filename
  sectionTitle: string;          // Extracted section header
  chunkIndex: number;            // Position in document
  startChar: number;             // Character offset in original
  endChar: number;
  metadata: ChunkMetadata;
}

export type DocumentPurpose = 'definitive' | 'guidance' | 'reference' | 'procedural' | 'template' | 'example';

export interface ChunkMetadata {
  documentType: DocumentType;
  topics: Topic[];
  steps: number[];               // Relevant MPA steps
  hasNumbers: boolean;
  hasBenchmarks: boolean;
  verticals: string[];
  metrics: string[];
  // Extended metadata fields
  documentPurpose?: DocumentPurpose;
  normalizedTerms?: string[];    // Canonical forms of detected synonyms
  benchmarkRanges?: string[];    // Extracted numeric benchmark ranges
  confidenceQualifiers?: string[]; // e.g., "conservative 20-25%"
  isDeprioritized?: boolean;     // For low-value files like conversation examples
}

export type DocumentType =
  | 'benchmark'
  | 'framework'
  | 'playbook'
  | 'examples'
  | 'implications'
  | 'operating-standards';

export type Topic =
  | 'audience'
  | 'budget'
  | 'channel'
  | 'measurement'
  | 'benchmark'
  | 'efficiency'
  | 'general';

// ============================================================================
// VECTOR STORE TYPES
// ============================================================================

export interface StoredChunk extends DocumentChunk {
  embedding: number[];
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  scoreBreakdown: {
    semantic: number;
    keyword: number;
    metadataBoost: number;
  };
}

export interface MetadataFilter {
  documentTypes?: DocumentType[];
  topics?: Topic[];
  steps?: number[];
  mustHaveBenchmarks?: boolean;
  verticals?: string[];
}

// ============================================================================
// RETRIEVAL TYPES
// ============================================================================

export interface SearchOptions {
  topK?: number;
  minScore?: number;
  filters?: MetadataFilter;
  includeContext?: boolean;
}

export interface RetrievalResult {
  content: string;
  source: string;
  section: string;
  relevanceScore: number;
  citationText: string;
}

export interface BenchmarkResult {
  metric: string;
  vertical: string;
  value: string;
  qualifier: 'conservative' | 'typical' | 'ambitious' | 'aggressive';
  source: string;
  citationText: string;
}

export interface AudienceSizingResult {
  audienceType: string;
  totalSize: string;
  methodology: string;
  source: string;
  citationText: string;
}

// ============================================================================
// TOOL TYPES
// ============================================================================

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  content: string;
  citations: string[];
  success: boolean;
}

export interface ToolUsageStats {
  totalCalls: number;
  callsByTool: Record<string, number>;
  averageResultsPerCall: number;
  citationsGenerated: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const RAG_CONFIG = {
  chunking: {
    targetChunkSize: 400,
    maxChunkSize: 600,
    minChunkSize: 100,
    overlapTokens: 50,
  },
  embedding: {
    maxFeatures: 1500,    // Increased from 1000 for larger vocabulary
    minDocFreq: 2,
    maxDocFreqRatio: 0.95,
  },
  retrieval: {
    defaultTopK: 5,
    minScore: 0.25,       // Increased from 0.2 to reduce noise
    semanticWeight: 0.6,
    keywordWeight: 0.4,
    benchmarkBoost: 2.0,  // Increased from 1.5 for stronger benchmark priority
    exactMatchBoost: 1.5, // Reduced from 2.0 to reduce over-emphasis
  },
  paths: {
    kbDirectory: '../../kb-v6',
    chunksCache: './rag-cache/kb-chunks.json',
    indexCache: './rag-cache/kb-index.json',
  },
  cache: {
    queryEmbeddingCacheSize: 100, // LRU cache size for query embeddings
  }
} as const;

// ============================================================================
// SYNONYM MAPPINGS (for query expansion and document processing)
// ============================================================================

/**
 * Synonym mappings for key MPA terms.
 * Maps canonical terms to their variations for improved search matching.
 * Used by both document processor (for indexing) and retrieval engine (for query expansion).
 */
export const SYNONYM_MAPPINGS: Record<string, string[]> = {
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
// KEYWORD MAPPINGS
// ============================================================================

export const TOPIC_KEYWORDS: Record<Topic, string[]> = {
  audience: ['audience', 'targeting', 'segment', 'demographic', 'persona', 'customer'],
  budget: ['budget', 'spend', 'allocation', 'investment', 'cost', 'dollar'],
  channel: ['channel', 'media', 'platform', 'placement', 'inventory', 'programmatic'],
  measurement: ['measurement', 'attribution', 'kpi', 'metric', 'tracking', 'analytics'],
  benchmark: ['benchmark', 'typical', 'average', 'range', 'industry', 'standard'],
  efficiency: ['cac', 'cpa', 'cpm', 'roas', 'efficiency', 'cost per', 'ltv'],
  general: [],
};

export const STEP_KEYWORDS: Record<number, string[]> = {
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

export const DOCUMENT_TYPE_PATTERNS: Record<DocumentType, RegExp[]> = {
  benchmark: [/benchmark/i, /analytics.*engine/i, /data/i],
  framework: [/framework/i, /expert.*lens/i, /strategic.*wisdom/i],
  playbook: [/playbook/i, /gap.*detection/i, /confidence/i],
  examples: [/example/i, /conversation/i, /template/i],
  implications: [/implications/i],
  'operating-standards': [/kb.*00/i, /operating.*standard/i, /supporting.*instruction/i],
};
