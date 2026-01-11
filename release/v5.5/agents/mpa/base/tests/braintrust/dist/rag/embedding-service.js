/**
 * Embedding Service - TF-IDF based embeddings using natural library
 */
import natural from 'natural';
import { RAG_CONFIG } from './types.js';
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();
export class EmbeddingService {
    tfidf;
    vocabulary;
    idfValues;
    dimension;
    initialized = false;
    constructor() {
        this.tfidf = new TfIdf();
        this.vocabulary = new Map();
        this.idfValues = new Map();
        this.dimension = RAG_CONFIG.embedding.maxFeatures;
    }
    /**
     * Initialize with corpus to build vocabulary
     */
    async initialize(chunks) {
        console.log('Building TF-IDF vocabulary...');
        // Add all documents to TF-IDF
        for (const chunk of chunks) {
            this.tfidf.addDocument(chunk.content.toLowerCase());
        }
        // Build vocabulary from most important terms across all documents
        const termScores = new Map();
        // Use listTerms for each document index
        for (let docIndex = 0; docIndex < chunks.length; docIndex++) {
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
        const numDocs = chunks.length;
        for (const [term] of this.vocabulary) {
            const docsWithTerm = chunks.filter(c => c.content.toLowerCase().includes(term)).length;
            const idf = Math.log((numDocs + 1) / (docsWithTerm + 1)) + 1;
            this.idfValues.set(term, idf);
        }
        this.initialized = true;
        console.log(`Vocabulary built with ${this.vocabulary.size} terms`);
    }
    /**
     * Generate embedding for text
     */
    embed(text) {
        if (!this.initialized) {
            throw new Error('EmbeddingService not initialized. Call initialize() first.');
        }
        const embedding = new Array(this.dimension).fill(0);
        const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
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
        return this.normalize(embedding);
    }
    /**
     * Generate embeddings for multiple texts
     */
    embedBatch(texts) {
        return texts.map(text => this.embed(text));
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
    exportVocabulary() {
        return {
            vocabulary: Array.from(this.vocabulary.entries()),
            idf: Array.from(this.idfValues.entries()),
        };
    }
    /**
     * Import vocabulary from persistence
     */
    importVocabulary(data) {
        this.vocabulary = new Map(data.vocabulary);
        this.idfValues = new Map(data.idf);
        this.initialized = true;
    }
}
export default EmbeddingService;
//# sourceMappingURL=embedding-service.js.map