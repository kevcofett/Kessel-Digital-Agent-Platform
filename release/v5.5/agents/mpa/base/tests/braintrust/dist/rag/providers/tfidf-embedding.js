/**
 * TF-IDF Embedding Provider
 *
 * Embedding provider implementation for personal/development environments
 * using the natural library for TF-IDF based embeddings.
 * No external API calls required.
 */
import natural from 'natural';
import { RAG_CONFIG } from '../types.js';
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();
export class TFIDFEmbeddingProvider {
    name = 'tfidf';
    tfidf;
    vocabulary;
    idfValues;
    dimension;
    initialized = false;
    // LRU cache for query embeddings
    queryCache = new Map();
    cacheSize;
    constructor() {
        this.tfidf = new TfIdf();
        this.vocabulary = new Map();
        this.idfValues = new Map();
        this.dimension = RAG_CONFIG.embedding.maxFeatures;
        this.cacheSize = RAG_CONFIG.cache.queryEmbeddingCacheSize;
    }
    /**
     * Initialize with corpus to build vocabulary
     */
    async initialize(documents) {
        console.log('Building TF-IDF vocabulary...');
        // Add all documents to TF-IDF
        for (const doc of documents) {
            this.tfidf.addDocument(doc.toLowerCase());
        }
        // Build vocabulary from most important terms across all documents
        const termScores = new Map();
        // Use listTerms for each document index
        for (let docIndex = 0; docIndex < documents.length; docIndex++) {
            const terms = this.tfidf.listTerms(docIndex);
            for (const item of terms) {
                const currentScore = termScores.get(item.term) || 0;
                termScores.set(item.term, currentScore + item.tfidf);
            }
        }
        // Sort by total TF-IDF score and take top N
        const sortedTerms = Array.from(termScores.entries())
            .filter(([term]) => term.length > 2) // Filter short terms
            .sort((a, b) => b[1] - a[1])
            .slice(0, this.dimension);
        // Build vocabulary index
        sortedTerms.forEach(([term], index) => {
            this.vocabulary.set(term, index);
        });
        // Calculate IDF values
        const numDocs = documents.length;
        for (const [term] of this.vocabulary) {
            const docsWithTerm = documents.filter(doc => doc.toLowerCase().includes(term)).length;
            const idf = Math.log((numDocs + 1) / (docsWithTerm + 1)) + 1;
            this.idfValues.set(term, idf);
        }
        this.initialized = true;
        console.log(`Vocabulary built with ${this.vocabulary.size} terms`);
    }
    /**
     * Generate embedding for text (with LRU caching)
     */
    async embed(text) {
        if (!this.initialized) {
            throw new Error('TFIDFEmbeddingProvider not initialized. Call initialize() first.');
        }
        // Check cache first
        const cacheKey = text.toLowerCase().trim();
        if (this.queryCache.has(cacheKey)) {
            // Move to end (most recently used) by re-inserting
            const cached = this.queryCache.get(cacheKey);
            this.queryCache.delete(cacheKey);
            this.queryCache.set(cacheKey, cached);
            return cached;
        }
        // Generate new embedding
        const embedding = new Array(this.dimension).fill(0);
        const tokens = tokenizer.tokenize(cacheKey) || [];
        const termFreq = new Map();
        // Count term frequencies
        for (const token of tokens) {
            termFreq.set(token, (termFreq.get(token) || 0) + 1);
        }
        // Build TF-IDF vector
        for (const [term, tf] of termFreq) {
            const vocabIndex = this.vocabulary.get(term);
            if (vocabIndex !== undefined) {
                const idf = this.idfValues.get(term) || 1;
                // Sublinear TF: log(1 + tf)
                const tfidf = (1 + Math.log(tf)) * idf;
                embedding[vocabIndex] = tfidf;
            }
        }
        // L2 normalize
        const normalizedEmbedding = this.normalize(embedding);
        // Add to cache with LRU eviction
        if (this.queryCache.size >= this.cacheSize) {
            // Delete oldest entry (first key in Map)
            const firstKey = this.queryCache.keys().next().value;
            if (firstKey !== undefined) {
                this.queryCache.delete(firstKey);
            }
        }
        this.queryCache.set(cacheKey, normalizedEmbedding);
        return normalizedEmbedding;
    }
    /**
     * Generate embeddings for multiple texts
     */
    async embedBatch(texts) {
        const results = [];
        for (const text of texts) {
            results.push(await this.embed(text));
        }
        return results;
    }
    /**
     * L2 normalize a vector
     */
    normalize(vector) {
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        if (magnitude === 0)
            return vector;
        return vector.map(val => val / magnitude);
    }
    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
        let dotProduct = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
        }
        // Vectors are already normalized, so dot product = cosine similarity
        return dotProduct;
    }
    /**
     * Get embedding dimension
     */
    getDimension() {
        return this.dimension;
    }
    /**
     * Check if initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Export vocabulary for persistence
     */
    exportState() {
        return {
            vocabulary: Array.from(this.vocabulary.entries()),
            idf: Array.from(this.idfValues.entries()),
        };
    }
    /**
     * Import vocabulary from persistence
     */
    importState(state) {
        this.vocabulary = new Map(state.vocabulary);
        this.idfValues = new Map(state.idf);
        this.initialized = true;
    }
    /**
     * Clear the query cache
     */
    clearCache() {
        this.queryCache.clear();
    }
}
export default TFIDFEmbeddingProvider;
//# sourceMappingURL=tfidf-embedding.js.map