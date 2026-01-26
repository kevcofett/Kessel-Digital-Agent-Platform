/**
 * Vector Store - In-memory storage with semantic and keyword search
 */
import { DocumentChunk, SearchResult, MetadataFilter } from './types.js';
import { EmbeddingService } from './embedding-service.js';
export declare class VectorStore {
    private chunks;
    private embeddingService;
    private bm25;
    constructor(embeddingService: EmbeddingService);
    /**
     * Add chunks with embeddings to store
     */
    addChunks(chunks: DocumentChunk[], embeddings: number[][]): void;
    /**
     * Semantic search using embeddings
     */
    searchSemantic(queryEmbedding: number[], topK: number): SearchResult[];
    /**
     * Keyword search using BM25
     */
    searchKeyword(query: string, topK: number): SearchResult[];
    /**
     * Hybrid search combining semantic and keyword
     */
    searchHybrid(query: string, queryEmbedding: number[], topK: number, semanticWeight?: number): SearchResult[];
    /**
     * Search with metadata filters
     */
    searchFiltered(query: string, queryEmbedding: number[], filters: MetadataFilter, topK: number): SearchResult[];
    /**
     * Apply metadata-based score boosts
     * Enhanced with document purpose, synonym matching, and deprioritization
     */
    private applyMetadataBoosts;
    /**
     * Persist store to disk
     */
    persist(filepath: string): Promise<void>;
    /**
     * Load store from disk
     */
    load(filepath: string): Promise<boolean>;
    /**
     * Get chunk count
     */
    getChunkCount(): number;
}
export default VectorStore;
//# sourceMappingURL=vector-store.d.ts.map