/**
 * Embedding Service - Wrapper around EmbeddingProvider
 *
 * Provides a consistent interface for generating embeddings
 * regardless of the underlying provider (TF-IDF, Azure AI Search, etc.)
 */

import { DocumentChunk } from './types.js';
import { EmbeddingProvider } from '../providers/interfaces.js';

export class EmbeddingService {
  private provider: EmbeddingProvider;

  constructor(provider: EmbeddingProvider) {
    this.provider = provider;
  }

  /**
   * Initialize with corpus to build vocabulary (for TF-IDF)
   * or create index (for vector DBs)
   */
  async initialize(chunks: DocumentChunk[]): Promise<void> {
    console.log('Initializing embedding service...');
    const documents = chunks.map(c => c.content);
    await this.provider.initialize(documents);
    console.log(`Embedding service initialized with ${chunks.length} documents`);
  }

  /**
   * Generate embedding for text
   */
  async embed(text: string): Promise<number[]> {
    return this.provider.embed(text);
  }

  /**
   * Generate embedding for text (sync version for providers that support it)
   */
  embedSync(text: string): number[] {
    // For providers that cache results, this may return synchronously
    // Fall back to blocking call - not ideal but works
    let result: number[] = [];
    this.provider.embed(text).then(r => { result = r; });
    return result;
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    return this.provider.embedBatch(texts);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    return this.provider.cosineSimilarity(a, b);
  }

  /**
   * Get embedding dimension
   */
  getDimension(): number {
    return this.provider.getDimension();
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.provider.isInitialized();
  }

  /**
   * Export vocabulary/state for persistence
   */
  exportVocabulary(): unknown {
    return this.provider.exportState?.() ?? null;
  }

  /**
   * Import vocabulary/state from persistence
   */
  importVocabulary(data: unknown): void {
    this.provider.importState?.(data);
  }

  /**
   * Get the underlying provider name
   */
  getProviderName(): string {
    return this.provider.name;
  }
}

export default EmbeddingService;
