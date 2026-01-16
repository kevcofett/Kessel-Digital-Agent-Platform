/**
 * Extended Embedding Provider Types
 *
 * Defines interfaces for semantic embedding providers beyond TF-IDF.
 */

// ============================================================================
// BASE EMBEDDING TYPES (may already exist in interfaces.ts)
// ============================================================================

export interface EmbeddingVector {
  values: number[];
  dimensions: number;
}

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  tokenCount?: number;
  model?: string;
}

export interface BatchEmbeddingResult {
  embeddings: EmbeddingResult[];
  totalTokens: number;
  model: string;
}

// ============================================================================
// PROVIDER CONFIGURATION
// ============================================================================

export interface OpenAIEmbeddingConfig {
  apiKey?: string;  // Falls back to OPENAI_API_KEY env var
  model?: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';
  dimensions?: number;  // For text-embedding-3-* models, can reduce dimensions
  baseURL?: string;  // For proxies or alternative endpoints
  maxRetries?: number;
  timeout?: number;
}

export interface AzureOpenAIEmbeddingConfig {
  endpoint: string;  // Azure OpenAI endpoint URL
  apiKey?: string;  // Falls back to AZURE_OPENAI_API_KEY env var
  deploymentName: string;  // Your embedding model deployment name
  apiVersion?: string;  // Default: '2024-02-01'
  maxRetries?: number;
  timeout?: number;
}

export interface EmbeddingProviderConfig {
  type: 'openai' | 'azure-openai' | 'tfidf' | 'local-transformer';
  openai?: OpenAIEmbeddingConfig;
  azureOpenai?: AzureOpenAIEmbeddingConfig;
}

// ============================================================================
// PROVIDER INTERFACE
// ============================================================================

export interface SemanticEmbeddingProvider {
  /**
   * Provider identifier
   */
  readonly providerId: string;

  /**
   * Get embedding dimensions
   */
  getDimensions(): number;

  /**
   * Embed a single text string
   */
  embed(text: string): Promise<number[]>;

  /**
   * Embed multiple texts in a batch (more efficient)
   */
  embedBatch(texts: string[]): Promise<number[][]>;

  /**
   * Check if provider is available/configured
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get provider metadata
   */
  getMetadata(): EmbeddingProviderMetadata;
}

export interface EmbeddingProviderMetadata {
  providerId: string;
  model: string;
  dimensions: number;
  maxTokensPerRequest: number;
  supportsReducedDimensions: boolean;
  costPer1MTokens?: number;  // USD
}

// ============================================================================
// SIMILARITY FUNCTIONS
// ============================================================================

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);

  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

/**
 * Calculate euclidean distance between two vectors
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Calculate dot product between two vectors
 */
export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }

  return sum;
}

export default {
  cosineSimilarity,
  euclideanDistance,
  dotProduct,
};
