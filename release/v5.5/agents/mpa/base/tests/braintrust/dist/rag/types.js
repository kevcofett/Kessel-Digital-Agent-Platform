/**
 * RAG System Type Definitions
 */
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
        maxFeatures: 1500, // Increased from 1000 for larger vocabulary
        minDocFreq: 2,
        maxDocFreqRatio: 0.95,
    },
    retrieval: {
        defaultTopK: 5,
        minScore: 0.25, // Increased from 0.2 to reduce noise
        semanticWeight: 0.6,
        keywordWeight: 0.4,
        benchmarkBoost: 2.0, // Increased from 1.5 for stronger benchmark priority
        exactMatchBoost: 1.5, // Reduced from 2.0 to reduce over-emphasis
    },
    paths: {
        kbDirectory: '../../../kb',
        chunksCache: './rag-cache/kb-chunks.json',
        indexCache: './rag-cache/kb-index.json',
    },
    cache: {
        queryEmbeddingCacheSize: 100, // LRU cache size for query embeddings
    }
};
// ============================================================================
// SYNONYM MAPPINGS (for query expansion and document processing)
// ============================================================================
/**
 * Synonym mappings for key MPA terms.
 * Maps canonical terms to their variations for improved search matching.
 * Used by both document processor (for indexing) and retrieval engine (for query expansion).
 */
export const SYNONYM_MAPPINGS = {
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
export const TOPIC_KEYWORDS = {
    audience: ['audience', 'targeting', 'segment', 'demographic', 'persona', 'customer'],
    budget: ['budget', 'spend', 'allocation', 'investment', 'cost', 'dollar'],
    channel: ['channel', 'media', 'platform', 'placement', 'inventory', 'programmatic'],
    measurement: ['measurement', 'attribution', 'kpi', 'metric', 'tracking', 'analytics'],
    benchmark: ['benchmark', 'typical', 'average', 'range', 'industry', 'standard'],
    efficiency: ['cac', 'cpa', 'cpm', 'roas', 'efficiency', 'cost per', 'ltv'],
    general: [],
};
export const STEP_KEYWORDS = {
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
export const DOCUMENT_TYPE_PATTERNS = {
    benchmark: [/benchmark/i, /analytics.*engine/i, /data/i],
    framework: [/framework/i, /expert.*lens/i, /strategic.*wisdom/i],
    playbook: [/playbook/i, /gap.*detection/i, /confidence/i],
    examples: [/example/i, /conversation/i, /template/i],
    implications: [/implications/i],
    'operating-standards': [/kb.*00/i, /operating.*standard/i, /supporting.*instruction/i],
};
//# sourceMappingURL=types.js.map