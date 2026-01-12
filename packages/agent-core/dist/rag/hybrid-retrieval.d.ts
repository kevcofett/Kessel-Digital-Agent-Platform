/**
 * Hybrid Retrieval Engine
 *
 * Combines keyword-based (TF-IDF) and semantic (embedding) search
 * using Reciprocal Rank Fusion (RRF) for optimal results.
 */
import type { SearchResult, DocumentChunk } from './types.js';
import type { SemanticEmbeddingProvider } from '../providers/embedding-types.js';
export interface HybridRetrievalConfig {
    /**
     * Weight for keyword (TF-IDF) results in fusion
     * Default: 0.4
     */
    keywordWeight: number;
    /**
     * Weight for semantic (embedding) results in fusion
     * Default: 0.6
     */
    semanticWeight: number;
    /**
     * RRF constant (k parameter)
     * Higher values give more weight to lower-ranked results
     * Default: 60
     */
    rrfConstant: number;
    /**
     * Whether to enable keyword search
     * Default: true
     */
    enableKeyword: boolean;
    /**
     * Whether to enable semantic search
     * Requires embedding provider to be available
     * Default: true
     */
    enableSemantic: boolean;
    /**
     * Number of results to retrieve from each source before fusion
     * Default: 20
     */
    candidateCount: number;
    /**
     * Final number of results to return after fusion
     * Default: 5
     */
    topK: number;
    /**
     * Minimum score threshold for results
     * Default: 0.0
     */
    minScore: number;
}
export interface HybridSearchResult extends SearchResult {
    keywordRank?: number;
    semanticRank?: number;
    keywordScore?: number;
    semanticScore?: number;
    fusedScore: number;
    source: 'keyword' | 'semantic' | 'both';
}
export interface ChunkWithEmbedding extends DocumentChunk {
    embedding?: number[];
}
export declare const DEFAULT_HYBRID_CONFIG: HybridRetrievalConfig;
export declare class HybridRetrievalEngine {
    private config;
    private embeddingProvider;
    private chunkEmbeddings;
    private isInitialized;
    constructor(config?: Partial<HybridRetrievalConfig>, embeddingProvider?: SemanticEmbeddingProvider);
    /**
     * Set the embedding provider after construction
     */
    setEmbeddingProvider(provider: SemanticEmbeddingProvider): void;
    /**
     * Index chunks for semantic search
     * Call this after loading documents
     */
    indexChunks(chunks: ChunkWithEmbedding[]): Promise<void>;
    /**
     * Perform hybrid search combining keyword and semantic results
     */
    search(query: string, keywordResults: SearchResult[], chunks: ChunkWithEmbedding[]): Promise<HybridSearchResult[]>;
    /**
     * Perform semantic-only search
     */
    private semanticSearch;
    /**
     * Calculate Reciprocal Rank Fusion score
     *
     * RRF formula: score = sum(weight / (k + rank)) for each result source
     */
    private calculateRRFScore;
    /**
     * Get current configuration
     */
    getConfig(): HybridRetrievalConfig;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<HybridRetrievalConfig>): void;
    /**
     * Check if semantic search is available
     */
    isSemanticAvailable(): boolean;
    /**
     * Get statistics about indexed chunks
     */
    getStats(): {
        indexedChunks: number;
        embeddingDimensions: number | null;
    };
    /**
     * Clear the embedding index
     */
    clearIndex(): void;
}
/**
 * Create a hybrid retrieval engine with configuration
 */
export declare function createHybridRetrievalEngine(config?: Partial<HybridRetrievalConfig>, embeddingProvider?: SemanticEmbeddingProvider): HybridRetrievalEngine;
export default HybridRetrievalEngine;
//# sourceMappingURL=hybrid-retrieval.d.ts.map