/**
 * RAG Configuration Types
 *
 * Defines the configuration interfaces for agents to customize
 * RAG behavior. Each agent provides their own configuration
 * tailored to their domain.
 */

import { DocumentPurpose } from './types.js';

// ============================================================================
// AGENT RAG CONFIGURATION
// ============================================================================

/**
 * Configuration provided by each agent for RAG customization
 */
export interface AgentRAGConfig {
  /**
   * Path to the knowledge base directory (relative or absolute)
   */
  kbPath: string;

  /**
   * Files to completely exclude from RAG indexing
   */
  excludedFiles: string[];

  /**
   * Files to include but deprioritize (lower ranking)
   */
  deprioritizedFiles: string[];

  /**
   * Synonym mappings for query expansion
   * Maps canonical terms to their variations
   */
  synonymMappings: Record<string, string[]>;

  /**
   * Document type detection patterns
   * Maps document types to regex patterns for filename matching
   */
  documentTypePatterns: Record<string, RegExp[]>;

  /**
   * Document purpose patterns for retrieval boosting
   * Maps purposes to regex patterns for filename matching
   */
  documentPurposePatterns: Record<DocumentPurpose, RegExp[]>;

  /**
   * Topic keywords for content classification
   */
  topicKeywords: Record<string, string[]>;

  /**
   * Step-specific keywords for step detection
   */
  stepKeywords: Record<number, string[]>;

  /**
   * Vertical/industry patterns for detection
   */
  verticalPatterns: string[];

  /**
   * Metric patterns for detection
   */
  metricPatterns: string[];
}

// ============================================================================
// RAG SYSTEM CONFIGURATION
// ============================================================================

/**
 * Core RAG system configuration (typically not agent-specific)
 */
export interface RAGSystemConfig {
  chunking: {
    targetChunkSize: number;
    maxChunkSize: number;
    minChunkSize: number;
    overlapTokens: number;
  };
  embedding: {
    maxFeatures: number;
    minDocFreq: number;
    maxDocFreqRatio: number;
  };
  retrieval: {
    defaultTopK: number;
    minScore: number;
    semanticWeight: number;
    keywordWeight: number;
    benchmarkBoost: number;
    exactMatchBoost: number;
  };
  paths: {
    chunksCache: string;
    indexCache: string;
  };
  cache: {
    queryEmbeddingCacheSize: number;
  };
}

/**
 * Default RAG system configuration
 */
export const DEFAULT_RAG_CONFIG: RAGSystemConfig = {
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
// DOCUMENT PURPOSE BOOSTS
// ============================================================================

/**
 * Boost multipliers for different document purposes
 */
export const DOCUMENT_PURPOSE_BOOSTS: Record<DocumentPurpose, number> = {
  definitive: 1.3,    // Authoritative sources
  guidance: 1.2,      // Expert guidance
  reference: 1.1,     // Reference materials
  procedural: 1.0,    // Standard procedures
  template: 0.5,      // Templates (low value for RAG)
  example: 0.7,       // Examples (somewhat useful)
};

// ============================================================================
// EMPTY/DEFAULT AGENT CONFIG
// ============================================================================

/**
 * Minimal agent config for testing or basic usage
 */
export const EMPTY_AGENT_CONFIG: AgentRAGConfig = {
  kbPath: './kb',
  excludedFiles: [],
  deprioritizedFiles: [],
  synonymMappings: {},
  documentTypePatterns: {
    document: [/.*/],
  },
  documentPurposePatterns: {
    definitive: [],
    guidance: [],
    reference: [/.*/],
    procedural: [],
    template: [],
    example: [],
  },
  topicKeywords: {
    general: [],
  },
  stepKeywords: {},
  verticalPatterns: [],
  metricPatterns: [],
};
