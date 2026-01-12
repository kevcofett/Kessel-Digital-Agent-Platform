/**
 * Embedding Service - Wrapper around EmbeddingProvider
 *
 * Provides a consistent interface for generating embeddings
 * regardless of the underlying provider (TF-IDF, Azure AI Search, etc.)
 */
import { DocumentChunk } from './types.js';
import { EmbeddingProvider } from '../providers/interfaces.js';
export declare class EmbeddingService {
    private provider;
    constructor(provider: EmbeddingProvider);
    /**
     * Initialize with corpus to build vocabulary (for TF-IDF)
     * or create index (for vector DBs)
     */
    initialize(chunks: DocumentChunk[]): Promise<void>;
    /**
     * Generate embedding for text
     */
    embed(text: string): Promise<number[]>;
    /**
     * Generate embedding for text (sync version for providers that support it)
     */
    embedSync(text: string): number[];
    /**
     * Generate embeddings for multiple texts
     */
    embedBatch(texts: string[]): Promise<number[][]>;
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
     * Export vocabulary/state for persistence
     */
    exportVocabulary(): unknown;
    /**
     * Import vocabulary/state from persistence
     */
    importVocabulary(data: unknown): void;
    /**
     * Get the underlying provider name
     */
    getProviderName(): string;
}
export default EmbeddingService;
//# sourceMappingURL=embedding-service.d.ts.map