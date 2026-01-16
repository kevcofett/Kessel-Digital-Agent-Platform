/**
 * Embedding Service - Wrapper around EmbeddingProvider
 *
 * Provides a consistent interface for generating embeddings
 * regardless of the underlying provider (TF-IDF, Azure AI Search, etc.)
 */
export class EmbeddingService {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    /**
     * Initialize with corpus to build vocabulary (for TF-IDF)
     * or create index (for vector DBs)
     */
    async initialize(chunks) {
        console.log('Initializing embedding service...');
        const documents = chunks.map(c => c.content);
        await this.provider.initialize(documents);
        console.log(`Embedding service initialized with ${chunks.length} documents`);
    }
    /**
     * Generate embedding for text
     */
    async embed(text) {
        return this.provider.embed(text);
    }
    /**
     * Generate embedding for text (sync version for providers that support it)
     */
    embedSync(text) {
        // For providers that cache results, this may return synchronously
        // Fall back to blocking call - not ideal but works
        let result = [];
        this.provider.embed(text).then(r => { result = r; });
        return result;
    }
    /**
     * Generate embeddings for multiple texts
     */
    async embedBatch(texts) {
        return this.provider.embedBatch(texts);
    }
    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(a, b) {
        return this.provider.cosineSimilarity(a, b);
    }
    /**
     * Get embedding dimension
     */
    getDimension() {
        return this.provider.getDimension();
    }
    /**
     * Check if initialized
     */
    isInitialized() {
        return this.provider.isInitialized();
    }
    /**
     * Export vocabulary/state for persistence
     */
    exportVocabulary() {
        return this.provider.exportState?.() ?? null;
    }
    /**
     * Import vocabulary/state from persistence
     */
    importVocabulary(data) {
        this.provider.importState?.(data);
    }
    /**
     * Get the underlying provider name
     */
    getProviderName() {
        return this.provider.name;
    }
}
export default EmbeddingService;
//# sourceMappingURL=embedding-service.js.map