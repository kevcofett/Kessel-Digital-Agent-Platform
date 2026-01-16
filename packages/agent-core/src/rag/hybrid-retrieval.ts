/**
 * Hybrid Retrieval Engine
 *
 * Combines keyword-based (TF-IDF) and semantic (embedding) search
 * using Reciprocal Rank Fusion (RRF) for optimal results.
 */

import type { SearchResult, DocumentChunk } from './types.js';
import type { SemanticEmbeddingProvider } from '../providers/embedding-types.js';
import { cosineSimilarity } from '../providers/embedding-types.js';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_HYBRID_CONFIG: HybridRetrievalConfig = {
  keywordWeight: 0.4,
  semanticWeight: 0.6,
  rrfConstant: 60,
  enableKeyword: true,
  enableSemantic: true,
  candidateCount: 20,
  topK: 5,
  minScore: 0.0,
};

// ============================================================================
// HYBRID RETRIEVAL ENGINE
// ============================================================================

export class HybridRetrievalEngine {
  private config: HybridRetrievalConfig;
  private embeddingProvider: SemanticEmbeddingProvider | null;
  private chunkEmbeddings: Map<string, number[]> = new Map();
  private isInitialized = false;

  constructor(
    config: Partial<HybridRetrievalConfig> = {},
    embeddingProvider?: SemanticEmbeddingProvider
  ) {
    this.config = { ...DEFAULT_HYBRID_CONFIG, ...config };
    this.embeddingProvider = embeddingProvider || null;
  }

  /**
   * Set the embedding provider after construction
   */
  setEmbeddingProvider(provider: SemanticEmbeddingProvider): void {
    this.embeddingProvider = provider;
    this.isInitialized = false;  // Need to re-index
  }

  /**
   * Index chunks for semantic search
   * Call this after loading documents
   */
  async indexChunks(chunks: ChunkWithEmbedding[]): Promise<void> {
    if (!this.embeddingProvider) {
      console.warn('No embedding provider available, skipping semantic indexing');
      return;
    }

    // Filter chunks that don't have embeddings yet
    const chunksToEmbed = chunks.filter(c => !c.embedding && !this.chunkEmbeddings.has(c.id));

    if (chunksToEmbed.length === 0) {
      this.isInitialized = true;
      return;
    }

    console.log(`Indexing ${chunksToEmbed.length} chunks for semantic search...`);

    // Batch embed all chunks
    const texts = chunksToEmbed.map(c => c.content);
    const embeddings = await this.embeddingProvider.embedBatch(texts);

    // Store embeddings
    for (let i = 0; i < chunksToEmbed.length; i++) {
      this.chunkEmbeddings.set(chunksToEmbed[i].id, embeddings[i]);
    }

    // Also store any pre-computed embeddings
    for (const chunk of chunks) {
      if (chunk.embedding) {
        this.chunkEmbeddings.set(chunk.id, chunk.embedding);
      }
    }

    this.isInitialized = true;
    console.log(`Indexed ${this.chunkEmbeddings.size} total chunks`);
  }

  /**
   * Perform hybrid search combining keyword and semantic results
   */
  async search(
    query: string,
    keywordResults: SearchResult[],
    chunks: ChunkWithEmbedding[]
  ): Promise<HybridSearchResult[]> {
    const results: Map<string, HybridSearchResult> = new Map();

    // Process keyword results
    if (this.config.enableKeyword && keywordResults.length > 0) {
      for (let rank = 0; rank < keywordResults.length; rank++) {
        const result = keywordResults[rank];
        results.set(result.chunk.id, {
          ...result,
          keywordRank: rank,
          keywordScore: result.score,
          fusedScore: 0,
          source: 'keyword',
        });
      }
    }

    // Process semantic results
    if (this.config.enableSemantic && this.embeddingProvider && this.chunkEmbeddings.size > 0) {
      const semanticResults = await this.semanticSearch(query, chunks);

      for (let rank = 0; rank < semanticResults.length; rank++) {
        const result = semanticResults[rank];
        const existing = results.get(result.chunk.id);

        if (existing) {
          // Chunk found in both keyword and semantic
          existing.semanticRank = rank;
          existing.semanticScore = result.score;
          existing.source = 'both';
        } else {
          // Chunk only in semantic results
          results.set(result.chunk.id, {
            ...result,
            semanticRank: rank,
            semanticScore: result.score,
            fusedScore: 0,
            source: 'semantic',
          });
        }
      }
    }

    // Apply Reciprocal Rank Fusion
    for (const result of results.values()) {
      result.fusedScore = this.calculateRRFScore(result);
    }

    // Sort by fused score and apply topK
    const sorted = Array.from(results.values())
      .filter(r => r.fusedScore >= this.config.minScore)
      .sort((a, b) => b.fusedScore - a.fusedScore)
      .slice(0, this.config.topK);

    return sorted;
  }

  /**
   * Perform semantic-only search
   */
  private async semanticSearch(
    query: string,
    chunks: ChunkWithEmbedding[]
  ): Promise<SearchResult[]> {
    if (!this.embeddingProvider) {
      return [];
    }

    // Get query embedding
    const queryEmbedding = await this.embeddingProvider.embed(query);

    // Score all chunks
    const scored: Array<{ chunk: ChunkWithEmbedding; score: number }> = [];

    for (const chunk of chunks) {
      const chunkEmbedding = this.chunkEmbeddings.get(chunk.id) || chunk.embedding;

      if (!chunkEmbedding) {
        continue;
      }

      const score = cosineSimilarity(queryEmbedding, chunkEmbedding);
      scored.push({ chunk, score });
    }

    // Sort by score and take top candidates
    scored.sort((a, b) => b.score - a.score);
    const topCandidates = scored.slice(0, this.config.candidateCount);

    // Convert to SearchResult format
    return topCandidates.map(({ chunk, score }) => ({
      chunk: chunk as DocumentChunk,
      score,
      scoreBreakdown: {
        semantic: score,
        keyword: 0,
        metadataBoost: 0,
      },
    }));
  }

  /**
   * Calculate Reciprocal Rank Fusion score
   *
   * RRF formula: score = sum(weight / (k + rank)) for each result source
   */
  private calculateRRFScore(result: HybridSearchResult): number {
    const k = this.config.rrfConstant;
    let score = 0;

    if (result.keywordRank !== undefined) {
      score += this.config.keywordWeight / (k + result.keywordRank);
    }

    if (result.semanticRank !== undefined) {
      score += this.config.semanticWeight / (k + result.semanticRank);
    }

    return score;
  }

  /**
   * Get current configuration
   */
  getConfig(): HybridRetrievalConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HybridRetrievalConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if semantic search is available
   */
  isSemanticAvailable(): boolean {
    return this.embeddingProvider !== null && this.isInitialized;
  }

  /**
   * Get statistics about indexed chunks
   */
  getStats(): { indexedChunks: number; embeddingDimensions: number | null } {
    return {
      indexedChunks: this.chunkEmbeddings.size,
      embeddingDimensions: this.embeddingProvider?.getDimensions() ?? null,
    };
  }

  /**
   * Clear the embedding index
   */
  clearIndex(): void {
    this.chunkEmbeddings.clear();
    this.isInitialized = false;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a hybrid retrieval engine with configuration
 */
export function createHybridRetrievalEngine(
  config?: Partial<HybridRetrievalConfig>,
  embeddingProvider?: SemanticEmbeddingProvider
): HybridRetrievalEngine {
  return new HybridRetrievalEngine(config, embeddingProvider);
}

export default HybridRetrievalEngine;
