/**
 * RAG Configuration Types
 *
 * Defines the configuration interfaces for agents to customize
 * RAG behavior. Each agent provides their own configuration
 * tailored to their domain.
 */
/**
 * Default RAG system configuration
 */
export const DEFAULT_RAG_CONFIG = {
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
export const DOCUMENT_PURPOSE_BOOSTS = {
    definitive: 1.3, // Authoritative sources
    guidance: 1.2, // Expert guidance
    reference: 1.1, // Reference materials
    procedural: 1.0, // Standard procedures
    template: 0.5, // Templates (low value for RAG)
    example: 0.7, // Examples (somewhat useful)
};
// ============================================================================
// EMPTY/DEFAULT AGENT CONFIG
// ============================================================================
/**
 * Minimal agent config for testing or basic usage
 */
export const EMPTY_AGENT_CONFIG = {
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
//# sourceMappingURL=config.js.map