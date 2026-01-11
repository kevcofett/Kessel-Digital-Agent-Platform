/**
 * Embedding Service - TF-IDF based embeddings using natural library
 */
import { DocumentChunk } from './types.js';
export declare class EmbeddingService {
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
    initialize(chunks: DocumentChunk[]): Promise<void>;
    /**
     * Generate embedding for text (with LRU caching)
     */
    embed(text: string): number[];
    /**
     * Generate embeddings for multiple texts
     */
    embedBatch(texts: string[]): number[][];
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
    exportVocabulary(): {
        vocabulary: [string, number][];
        idf: [string, number][];
    };
    /**
     * Import vocabulary from persistence
     */
    importVocabulary(data: {
        vocabulary: [string, number][];
        idf: [string, number][];
    }): void;
}
export default EmbeddingService;
//# sourceMappingURL=embedding-service.d.ts.map