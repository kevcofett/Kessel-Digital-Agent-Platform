/**
 * Vector Store - In-memory storage with semantic and keyword search
 *
 * Generic vector store that works with any embedding service.
 * Supports hybrid search combining semantic and keyword matching.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import natural from 'natural';
import {
  DocumentChunk,
  StoredChunk,
  SearchResult,
  MetadataFilter,
} from './types.js';
import { RAGSystemConfig, DEFAULT_RAG_CONFIG, DOCUMENT_PURPOSE_BOOSTS } from './config.js';
import { EmbeddingService } from './embedding-service.js';

const TfIdf = natural.TfIdf;

export class VectorStore {
  private chunks: StoredChunk[] = [];
  private embeddingService: EmbeddingService;
  private bm25: natural.TfIdf;
  private config: RAGSystemConfig;

  constructor(embeddingService: EmbeddingService, config?: Partial<RAGSystemConfig>) {
    this.embeddingService = embeddingService;
    this.bm25 = new TfIdf();
    this.config = { ...DEFAULT_RAG_CONFIG, ...config };
  }

  /**
   * Add chunks with embeddings to store
   */
  addChunks(chunks: DocumentChunk[], embeddings: number[][]): void {
    if (chunks.length !== embeddings.length) {
      throw new Error('Chunks and embeddings count mismatch');
    }

    // Clear existing
    this.chunks = [];
    this.bm25 = new TfIdf();

    // Add to store
    for (let i = 0; i < chunks.length; i++) {
      this.chunks.push({
        ...chunks[i],
        embedding: embeddings[i],
      });
      this.bm25.addDocument(chunks[i].content.toLowerCase());
    }

    console.log(`Added ${chunks.length} chunks to vector store`);
  }

  /**
   * Semantic search using embeddings
   */
  searchSemantic(queryEmbedding: number[], topK: number): SearchResult[] {
    const results: SearchResult[] = [];

    for (const chunk of this.chunks) {
      const similarity = this.embeddingService.cosineSimilarity(
        queryEmbedding,
        chunk.embedding
      );

      results.push({
        chunk,
        score: similarity,
        scoreBreakdown: {
          semantic: similarity,
          keyword: 0,
          metadataBoost: 1,
        },
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Keyword search using BM25
   */
  searchKeyword(query: string, topK: number): SearchResult[] {
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    // Get BM25 scores
    this.bm25.tfidfs(queryLower, (docIndex: number, measure: number) => {
      if (docIndex < this.chunks.length) {
        results.push({
          chunk: this.chunks[docIndex],
          score: measure,
          scoreBreakdown: {
            semantic: 0,
            keyword: measure,
            metadataBoost: 1,
          },
        });
      }
    });

    // Normalize scores to 0-1 range
    const maxScore = Math.max(...results.map(r => r.score), 1);
    for (const result of results) {
      result.score = result.score / maxScore;
      result.scoreBreakdown.keyword = result.score;
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Hybrid search combining semantic and keyword
   */
  searchHybrid(
    query: string,
    queryEmbedding: number[],
    topK: number,
    semanticWeight?: number
  ): SearchResult[] {
    const weight = semanticWeight ?? this.config.retrieval.semanticWeight;
    const keywordWeight = 1 - weight;

    // Get both result sets
    const semanticResults = this.searchSemantic(queryEmbedding, topK * 2);
    const keywordResults = this.searchKeyword(query, topK * 2);

    // Build score map
    const scoreMap = new Map<string, SearchResult>();

    for (const result of semanticResults) {
      scoreMap.set(result.chunk.id, {
        ...result,
        score: result.score * weight,
        scoreBreakdown: {
          semantic: result.score,
          keyword: 0,
          metadataBoost: 1,
        },
      });
    }

    for (const result of keywordResults) {
      const existing = scoreMap.get(result.chunk.id);
      if (existing) {
        existing.score += result.score * keywordWeight;
        existing.scoreBreakdown.keyword = result.score;
      } else {
        scoreMap.set(result.chunk.id, {
          ...result,
          score: result.score * keywordWeight,
          scoreBreakdown: {
            semantic: 0,
            keyword: result.score,
            metadataBoost: 1,
          },
        });
      }
    }

    // Apply metadata boosts
    const results = Array.from(scoreMap.values());
    this.applyMetadataBoosts(results, query);

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Search with metadata filters
   */
  searchFiltered(
    query: string,
    queryEmbedding: number[],
    filters: MetadataFilter,
    topK: number
  ): SearchResult[] {
    // First get hybrid results
    const results = this.searchHybrid(query, queryEmbedding, topK * 3);

    // Apply filters
    const filtered = results.filter(result => {
      const meta = result.chunk.metadata;

      if (filters.documentTypes?.length &&
          !filters.documentTypes.includes(meta.documentType)) {
        return false;
      }

      if (filters.topics?.length &&
          !filters.topics.some(t => meta.topics.includes(t))) {
        return false;
      }

      if (filters.steps?.length &&
          !filters.steps.some(s => meta.steps.includes(s))) {
        return false;
      }

      if (filters.mustHaveBenchmarks && !meta.hasBenchmarks) {
        return false;
      }

      if (filters.verticals?.length &&
          !filters.verticals.some(v => meta.verticals.includes(v))) {
        return false;
      }

      return true;
    });

    return filtered.slice(0, topK);
  }

  /**
   * Apply metadata-based score boosts
   */
  private applyMetadataBoosts(results: SearchResult[], query: string): void {
    const queryLower = query.toLowerCase();
    const { benchmarkBoost, exactMatchBoost } = this.config.retrieval;

    for (const result of results) {
      let boost = 1;

      // Boost if query mentions benchmarks and chunk has them
      if ((queryLower.includes('benchmark') || queryLower.includes('typical') ||
           queryLower.includes('average')) && result.chunk.metadata.hasBenchmarks) {
        boost *= benchmarkBoost;
      }

      // Boost for exact phrase match
      if (result.chunk.content.toLowerCase().includes(queryLower)) {
        boost *= exactMatchBoost;
      }

      // Apply document purpose boost
      const purpose = result.chunk.metadata.documentPurpose;
      if (purpose && DOCUMENT_PURPOSE_BOOSTS[purpose]) {
        boost *= DOCUMENT_PURPOSE_BOOSTS[purpose];
      }

      // Penalize deprioritized files
      if (result.chunk.metadata.isDeprioritized) {
        boost *= 0.6;
      }

      // Boost for normalized term matches (synonym handling)
      const normalizedTerms = result.chunk.metadata.normalizedTerms || [];
      const queryTerms = queryLower.split(/\s+/);

      const synonymMatch = queryTerms.some(term =>
        normalizedTerms.includes(term) ||
        normalizedTerms.some(nt => term.includes(nt) || nt.includes(term))
      );
      if (synonymMatch) {
        boost *= 1.15;
      }

      // Boost chunks with confidence qualifiers when asking about targets/feasibility
      if ((queryLower.includes('aggressive') || queryLower.includes('conservative') ||
           queryLower.includes('feasible') || queryLower.includes('achievable') ||
           queryLower.includes('target')) &&
          result.chunk.metadata.confidenceQualifiers?.length) {
        boost *= 1.25;
      }

      // Boost chunks with benchmark ranges when asking about specific values
      if ((queryLower.includes('what') || queryLower.includes('typical') ||
           queryLower.includes('range') || queryLower.includes('how much')) &&
          result.chunk.metadata.benchmarkRanges?.length) {
        boost *= 1.2;
      }

      result.scoreBreakdown.metadataBoost = boost;
      result.score *= boost;
    }
  }

  /**
   * Persist store to disk
   */
  async persist(filepath: string): Promise<void> {
    const absolutePath = path.resolve(filepath);
    const dir = path.dirname(absolutePath);
    await fs.mkdir(dir, { recursive: true });

    const data = {
      chunks: this.chunks,
      vocabulary: this.embeddingService.exportVocabulary(),
    };

    await fs.writeFile(absolutePath, JSON.stringify(data));
    console.log(`Persisted vector store to ${absolutePath}`);
  }

  /**
   * Load store from disk
   */
  async load(filepath: string): Promise<boolean> {
    try {
      const absolutePath = path.resolve(filepath);
      const data = JSON.parse(await fs.readFile(absolutePath, 'utf-8'));

      this.chunks = data.chunks;
      this.embeddingService.importVocabulary(data.vocabulary);

      // Rebuild BM25 index
      this.bm25 = new TfIdf();
      for (const chunk of this.chunks) {
        this.bm25.addDocument(chunk.content.toLowerCase());
      }

      console.log(`Loaded ${this.chunks.length} chunks from ${absolutePath}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get chunk count
   */
  getChunkCount(): number {
    return this.chunks.length;
  }

  /**
   * Get all chunks (for debugging/export)
   */
  getAllChunks(): StoredChunk[] {
    return [...this.chunks];
  }
}

export default VectorStore;
