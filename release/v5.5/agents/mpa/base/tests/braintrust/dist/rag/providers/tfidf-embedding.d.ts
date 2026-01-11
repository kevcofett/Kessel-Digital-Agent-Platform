/**
 * TF-IDF Embedding Provider
 *
 * Embedding provider implementation for personal/development environments
 * using the natural library for TF-IDF based embeddings.
 * No external API calls required.
 */
import { EmbeddingProvider } from './interfaces.js';
export declare class TFIDFEmbeddingProvider implements EmbeddingProvider {
    readonly name = "tfidf";
    private tfidf;
    private vocabulary;
    private idfValues;
    private dimension;
    private initialized;
    private queryCache;
    private readonly cacheSize;
    constructor();
    /**
     * Initialize with corpus to build vocabulary
     */
    initialize(documents: string[]): Promise<void>;
    /**
     * Generate embedding for text (with LRU caching)
     */
    embed(text: string): Promise<number[]>;
    /**
     * Generate embeddings for multiple texts
     */
    embedBatch(texts: string[]): Promise<number[][]>;
    /**
     * L2 normalize a vector
     */
    private normalize;
    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(a: number[], b: number[]): number;
    /**
     * Get embedding dimension
     */
    getDimension(): number;
    /**
     * Check if initialized
     */
    isInitialized(): boolean;
    /**
     * Export vocabulary for persistence
     */
    exportState(): {
        vocabulary: [string, number][];
        idf: [string, number][];
    };
    /**
     * Import vocabulary from persistence
     */
    importState(state: {
        vocabulary: [string, number][];
        idf: [string, number][];
    }): void;
    /**
     * Clear the query cache
     */
    clearCache(): void;
}
export default TFIDFEmbeddingProvider;
//# sourceMappingURL=tfidf-embedding.d.ts.map