/**
 * Embedding Service - TF-IDF based embeddings using natural library
 */

import natural from 'natural';
import { DocumentChunk, RAG_CONFIG } from './types.js';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

export class EmbeddingService {
  private tfidf: natural.TfIdf;
  private vocabulary: Map<string, number>;
  private idfValues: Map<string, number>;
  private dimension: number;
  private initialized: boolean = false;

  // LRU cache for query embeddings
  private queryCache: Map<string, number[]> = new Map();
  private readonly cacheSize: number;

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
  async initialize(chunks: DocumentChunk[]): Promise<void> {
    console.log('Building TF-IDF vocabulary...');

    // Add all documents to TF-IDF
    for (const chunk of chunks) {
      this.tfidf.addDocument(chunk.content.toLowerCase());
    }

    // Build vocabulary from most important terms across all documents
    const termScores: Map<string, number> = new Map();

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
      const docsWithTerm = chunks.filter(c =>
        c.content.toLowerCase().includes(term)
      ).length;
      const idf = Math.log((numDocs + 1) / (docsWithTerm + 1)) + 1;
      this.idfValues.set(term, idf);
    }

    this.initialized = true;
    console.log(`Vocabulary built with ${this.vocabulary.size} terms`);
  }

  /**
   * Generate embedding for text (with LRU caching)
   */
  embed(text: string): number[] {
    if (!this.initialized) {
      throw new Error('EmbeddingService not initialized. Call initialize() first.');
    }

    // Check cache first
    const cacheKey = text.toLowerCase().trim();
    if (this.queryCache.has(cacheKey)) {
      // Move to end (most recently used) by re-inserting
      const cached = this.queryCache.get(cacheKey)!;
      this.queryCache.delete(cacheKey);
      this.queryCache.set(cacheKey, cached);
      return cached;
    }

    // Generate new embedding
    const embedding = new Array(this.dimension).fill(0);
    const tokens = tokenizer.tokenize(cacheKey) || [];
    const termFreq: Map<string, number> = new Map();

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
  embedBatch(texts: string[]): number[][] {
    return texts.map(text => this.embed(text));
  }

  /**
   * L2 normalize a vector
   */
  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map(val => val / magnitude);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

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
  getDimension(): number {
    return this.dimension;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Export vocabulary for persistence
   */
  exportVocabulary(): { vocabulary: [string, number][]; idf: [string, number][] } {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      idf: Array.from(this.idfValues.entries()),
    };
  }

  /**
   * Import vocabulary from persistence
   */
  importVocabulary(data: { vocabulary: [string, number][]; idf: [string, number][] }): void {
    this.vocabulary = new Map(data.vocabulary);
    this.idfValues = new Map(data.idf);
    this.initialized = true;
  }
}

export default EmbeddingService;
