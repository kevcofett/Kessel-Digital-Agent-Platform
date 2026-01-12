# PHASE 2: SEMANTIC EMBEDDING
# VS Code Claude Execution Plan - Steps 18-25

**Depends On:** Phase 1 Complete (agent-core builds, all 3 agents scaffold)
**Estimated Time:** 2-3 hours
**Branch:** deploy/personal

---

## OVERVIEW

This phase adds:
- OpenAI Embedding Provider (personal environment)
- Azure OpenAI Embedding Provider (corporate environment)
- Hybrid Retrieval Engine with Reciprocal Rank Fusion (RRF)
- Environment-aware provider selection

---

## PRE-FLIGHT CHECK

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify Phase 1 complete
cd packages/agent-core && npm run build
# Should succeed

# Verify CA has KB files
ls release/v5.5/agents/ca/base/kb/*.txt | wc -l
# Should show 35

# Verify EAP has KB files
ls release/v5.5/agents/eap/base/kb/*.txt | wc -l
# Should show 7
```

---

# STEP 18: Create Embedding Provider Interface Extensions

First, verify the current interfaces in agent-core. Then extend them for semantic embedding.

**File:** `packages/agent-core/src/providers/embedding-types.ts`

```typescript
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
```

---

# STEP 19: Implement OpenAI Embedding Provider

**File:** `packages/agent-core/src/providers/openai-embedding.ts`

```typescript
/**
 * OpenAI Embedding Provider
 * 
 * Provides semantic embeddings using OpenAI's text-embedding models.
 * Used in personal/development environments.
 */

import type {
  SemanticEmbeddingProvider,
  OpenAIEmbeddingConfig,
  EmbeddingProviderMetadata,
} from './embedding-types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_MODEL = 'text-embedding-3-small';
const DEFAULT_DIMENSIONS: Record<string, number> = {
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
  'text-embedding-ada-002': 1536,
};
const MAX_TOKENS_PER_REQUEST = 8191;
const COST_PER_1M_TOKENS: Record<string, number> = {
  'text-embedding-3-small': 0.02,
  'text-embedding-3-large': 0.13,
  'text-embedding-ada-002': 0.10,
};

// ============================================================================
// OPENAI EMBEDDING PROVIDER
// ============================================================================

export class OpenAIEmbeddingProvider implements SemanticEmbeddingProvider {
  readonly providerId = 'openai-embedding';
  
  private apiKey: string;
  private model: string;
  private dimensions: number;
  private baseURL: string;
  private maxRetries: number;
  private timeout: number;
  
  constructor(config: OpenAIEmbeddingConfig = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.model = config.model || DEFAULT_MODEL;
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.maxRetries = config.maxRetries ?? 3;
    this.timeout = config.timeout ?? 30000;
    
    // Handle dimension reduction for v3 models
    if (config.dimensions && this.model.includes('text-embedding-3')) {
      this.dimensions = config.dimensions;
    } else {
      this.dimensions = DEFAULT_DIMENSIONS[this.model] || 1536;
    }
  }
  
  getDimensions(): number {
    return this.dimensions;
  }
  
  async embed(text: string): Promise<number[]> {
    const results = await this.embedBatch([text]);
    return results[0];
  }
  
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable or pass apiKey in config.');
    }
    
    if (texts.length === 0) {
      return [];
    }
    
    // OpenAI supports batching up to 2048 inputs
    const batchSize = 100;
    const allEmbeddings: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const embeddings = await this.embedBatchInternal(batch);
      allEmbeddings.push(...embeddings);
    }
    
    return allEmbeddings;
  }
  
  private async embedBatchInternal(texts: string[]): Promise<number[][]> {
    const body: Record<string, unknown> = {
      input: texts,
      model: this.model,
    };
    
    // Add dimensions parameter for v3 models if custom dimensions set
    if (this.model.includes('text-embedding-3') && this.dimensions !== DEFAULT_DIMENSIONS[this.model]) {
      body.dimensions = this.dimensions;
    }
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(this.timeout),
        });
        
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
        }
        
        const data = await response.json() as OpenAIEmbeddingResponse;
        
        // Sort by index to ensure correct order
        const sorted = data.data.sort((a, b) => a.index - b.index);
        return sorted.map(item => item.embedding);
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on auth errors
        if (lastError.message.includes('401') || lastError.message.includes('403')) {
          throw lastError;
        }
        
        // Exponential backoff
        if (attempt < this.maxRetries - 1) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }
    
    throw lastError || new Error('Failed to get embeddings after retries');
  }
  
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }
    
    try {
      // Make a minimal request to verify API key works
      await this.embed('test');
      return true;
    } catch {
      return false;
    }
  }
  
  getMetadata(): EmbeddingProviderMetadata {
    return {
      providerId: this.providerId,
      model: this.model,
      dimensions: this.dimensions,
      maxTokensPerRequest: MAX_TOKENS_PER_REQUEST,
      supportsReducedDimensions: this.model.includes('text-embedding-3'),
      costPer1MTokens: COST_PER_1M_TOKENS[this.model],
    };
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface OpenAIEmbeddingResponse {
  object: 'list';
  data: Array<{
    object: 'embedding';
    index: number;
    embedding: number[];
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create an OpenAI embedding provider with optional configuration
 */
export function createOpenAIEmbeddingProvider(
  config?: OpenAIEmbeddingConfig
): OpenAIEmbeddingProvider {
  return new OpenAIEmbeddingProvider(config);
}

export default OpenAIEmbeddingProvider;
```

---

# STEP 20: Implement Azure OpenAI Embedding Provider

**File:** `packages/agent-core/src/providers/azure-openai-embedding.ts`

```typescript
/**
 * Azure OpenAI Embedding Provider
 * 
 * Provides semantic embeddings using Azure OpenAI's embedding deployments.
 * Used in corporate/Mastercard environments.
 */

import type {
  SemanticEmbeddingProvider,
  AzureOpenAIEmbeddingConfig,
  EmbeddingProviderMetadata,
} from './embedding-types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_API_VERSION = '2024-02-01';
const DEFAULT_DIMENSIONS = 1536;  // Most Azure deployments use ada-002 equivalent
const MAX_TOKENS_PER_REQUEST = 8191;

// ============================================================================
// AZURE OPENAI EMBEDDING PROVIDER
// ============================================================================

export class AzureOpenAIEmbeddingProvider implements SemanticEmbeddingProvider {
  readonly providerId = 'azure-openai-embedding';
  
  private endpoint: string;
  private apiKey: string;
  private deploymentName: string;
  private apiVersion: string;
  private maxRetries: number;
  private timeout: number;
  private dimensions: number;
  
  constructor(config: AzureOpenAIEmbeddingConfig) {
    if (!config.endpoint) {
      throw new Error('Azure OpenAI endpoint is required');
    }
    if (!config.deploymentName) {
      throw new Error('Azure OpenAI deployment name is required');
    }
    
    this.endpoint = config.endpoint.replace(/\/$/, '');  // Remove trailing slash
    this.apiKey = config.apiKey || process.env.AZURE_OPENAI_API_KEY || '';
    this.deploymentName = config.deploymentName;
    this.apiVersion = config.apiVersion || DEFAULT_API_VERSION;
    this.maxRetries = config.maxRetries ?? 3;
    this.timeout = config.timeout ?? 30000;
    this.dimensions = DEFAULT_DIMENSIONS;
  }
  
  getDimensions(): number {
    return this.dimensions;
  }
  
  async embed(text: string): Promise<number[]> {
    const results = await this.embedBatch([text]);
    return results[0];
  }
  
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error('Azure OpenAI API key not configured. Set AZURE_OPENAI_API_KEY environment variable or pass apiKey in config.');
    }
    
    if (texts.length === 0) {
      return [];
    }
    
    // Azure OpenAI supports batching
    const batchSize = 100;
    const allEmbeddings: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const embeddings = await this.embedBatchInternal(batch);
      allEmbeddings.push(...embeddings);
    }
    
    return allEmbeddings;
  }
  
  private async embedBatchInternal(texts: string[]): Promise<number[][]> {
    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/embeddings?api-version=${this.apiVersion}`;
    
    const body = {
      input: texts,
    };
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(this.timeout),
        });
        
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Azure OpenAI API error ${response.status}: ${errorBody}`);
        }
        
        const data = await response.json() as AzureOpenAIEmbeddingResponse;
        
        // Sort by index to ensure correct order
        const sorted = data.data.sort((a, b) => a.index - b.index);
        return sorted.map(item => item.embedding);
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on auth errors
        if (lastError.message.includes('401') || lastError.message.includes('403')) {
          throw lastError;
        }
        
        // Exponential backoff
        if (attempt < this.maxRetries - 1) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }
    
    throw lastError || new Error('Failed to get embeddings after retries');
  }
  
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey || !this.endpoint || !this.deploymentName) {
      return false;
    }
    
    try {
      await this.embed('test');
      return true;
    } catch {
      return false;
    }
  }
  
  getMetadata(): EmbeddingProviderMetadata {
    return {
      providerId: this.providerId,
      model: `azure:${this.deploymentName}`,
      dimensions: this.dimensions,
      maxTokensPerRequest: MAX_TOKENS_PER_REQUEST,
      supportsReducedDimensions: false,  // Depends on deployment
      costPer1MTokens: undefined,  // Varies by Azure agreement
    };
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface AzureOpenAIEmbeddingResponse {
  object: 'list';
  data: Array<{
    object: 'embedding';
    index: number;
    embedding: number[];
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create an Azure OpenAI embedding provider with configuration
 */
export function createAzureOpenAIEmbeddingProvider(
  config: AzureOpenAIEmbeddingConfig
): AzureOpenAIEmbeddingProvider {
  return new AzureOpenAIEmbeddingProvider(config);
}

export default AzureOpenAIEmbeddingProvider;
```

---

# STEP 21: Create Hybrid Retrieval Engine

**File:** `packages/agent-core/src/rag/hybrid-retrieval.ts`

```typescript
/**
 * Hybrid Retrieval Engine
 * 
 * Combines keyword-based (TF-IDF) and semantic (embedding) search
 * using Reciprocal Rank Fusion (RRF) for optimal results.
 */

import type { SearchResult, Chunk } from './types.js';
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

export interface ChunkWithEmbedding extends Chunk {
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
        results.set(result.chunkId, {
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
        const existing = results.get(result.chunkId);
        
        if (existing) {
          // Chunk found in both keyword and semantic
          existing.semanticRank = rank;
          existing.semanticScore = result.score;
          existing.source = 'both';
        } else {
          // Chunk only in semantic results
          results.set(result.chunkId, {
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
      chunkId: chunk.id,
      documentId: chunk.documentId,
      content: chunk.content,
      score,
      metadata: chunk.metadata,
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
```

---

# STEP 22: Create Embedding Provider Factory

**File:** `packages/agent-core/src/providers/embedding-factory.ts`

```typescript
/**
 * Embedding Provider Factory
 * 
 * Creates the appropriate embedding provider based on environment configuration.
 */

import type {
  SemanticEmbeddingProvider,
  EmbeddingProviderConfig,
  OpenAIEmbeddingConfig,
  AzureOpenAIEmbeddingConfig,
} from './embedding-types.js';
import { OpenAIEmbeddingProvider } from './openai-embedding.js';
import { AzureOpenAIEmbeddingProvider } from './azure-openai-embedding.js';
import { TFIDFEmbeddingProvider } from './tfidf-embedding.js';

// ============================================================================
// ENVIRONMENT DETECTION
// ============================================================================

export type EmbeddingEnvironment = 'personal' | 'corporate' | 'local';

/**
 * Detect embedding environment from environment variables
 */
export function detectEmbeddingEnvironment(): EmbeddingEnvironment {
  // Check for Azure OpenAI (corporate)
  if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
    return 'corporate';
  }
  
  // Check for OpenAI (personal)
  if (process.env.OPENAI_API_KEY) {
    return 'personal';
  }
  
  // Fall back to local TF-IDF
  return 'local';
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create an embedding provider based on configuration
 */
export function createEmbeddingProvider(
  config: EmbeddingProviderConfig
): SemanticEmbeddingProvider {
  switch (config.type) {
    case 'openai':
      return new OpenAIEmbeddingProvider(config.openai);
    
    case 'azure-openai':
      if (!config.azureOpenai) {
        throw new Error('Azure OpenAI configuration required');
      }
      return new AzureOpenAIEmbeddingProvider(config.azureOpenai);
    
    case 'tfidf':
      return new TFIDFEmbeddingProviderAdapter();
    
    default:
      throw new Error(`Unknown embedding provider type: ${config.type}`);
  }
}

/**
 * Create an embedding provider based on environment detection
 */
export function createEmbeddingProviderFromEnvironment(): SemanticEmbeddingProvider {
  const environment = detectEmbeddingEnvironment();
  
  switch (environment) {
    case 'personal':
      console.log('Using OpenAI embedding provider (personal environment)');
      return new OpenAIEmbeddingProvider();
    
    case 'corporate':
      console.log('Using Azure OpenAI embedding provider (corporate environment)');
      return new AzureOpenAIEmbeddingProvider({
        endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
        deploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
        apiKey: process.env.AZURE_OPENAI_API_KEY,
      });
    
    case 'local':
    default:
      console.log('Using TF-IDF embedding provider (local/fallback)');
      return new TFIDFEmbeddingProviderAdapter();
  }
}

/**
 * Try to create the best available embedding provider
 * Returns null if no semantic provider is available
 */
export async function createBestAvailableEmbeddingProvider(): Promise<SemanticEmbeddingProvider | null> {
  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    const provider = new OpenAIEmbeddingProvider();
    if (await provider.isAvailable()) {
      console.log('Using OpenAI embedding provider');
      return provider;
    }
  }
  
  // Try Azure OpenAI
  if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
    const provider = new AzureOpenAIEmbeddingProvider({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
    });
    if (await provider.isAvailable()) {
      console.log('Using Azure OpenAI embedding provider');
      return provider;
    }
  }
  
  // No semantic provider available
  console.log('No semantic embedding provider available, using TF-IDF only');
  return null;
}

// ============================================================================
// TF-IDF ADAPTER
// ============================================================================

/**
 * Adapter to make TFIDFEmbeddingProvider conform to SemanticEmbeddingProvider interface
 * 
 * Note: TF-IDF doesn't produce true semantic embeddings, but can be used as a fallback.
 * The "embeddings" are sparse vectors based on term frequency.
 */
class TFIDFEmbeddingProviderAdapter implements SemanticEmbeddingProvider {
  readonly providerId = 'tfidf-adapter';
  
  private tfidf: TFIDFEmbeddingProvider;
  private vocabulary: Map<string, number> = new Map();
  private idfValues: Map<string, number> = new Map();
  private dimensions = 1000;  // Fixed vocabulary size for consistency
  
  constructor() {
    this.tfidf = new TFIDFEmbeddingProvider();
  }
  
  getDimensions(): number {
    return this.dimensions;
  }
  
  async embed(text: string): Promise<number[]> {
    // Simple bag-of-words embedding
    const tokens = this.tokenize(text);
    const vector = new Array(this.dimensions).fill(0);
    
    for (const token of tokens) {
      let index = this.vocabulary.get(token);
      if (index === undefined) {
        // Add to vocabulary if space available
        if (this.vocabulary.size < this.dimensions) {
          index = this.vocabulary.size;
          this.vocabulary.set(token, index);
        } else {
          // Hash to existing index if vocabulary full
          index = this.hashToIndex(token);
        }
      }
      vector[index] += 1;
    }
    
    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= magnitude;
      }
    }
    
    return vector;
  }
  
  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => this.embed(text)));
  }
  
  async isAvailable(): Promise<boolean> {
    return true;  // TF-IDF is always available
  }
  
  getMetadata() {
    return {
      providerId: this.providerId,
      model: 'tfidf-bow',
      dimensions: this.dimensions,
      maxTokensPerRequest: Infinity,
      supportsReducedDimensions: false,
      costPer1MTokens: 0,
    };
  }
  
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }
  
  private hashToIndex(token: string): number {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = ((hash << 5) - hash) + token.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % this.dimensions;
  }
}

export { TFIDFEmbeddingProviderAdapter };
```

---

# STEP 23: Update agent-core Exports

**File:** `packages/agent-core/src/providers/index.ts`

Add the following exports (DO NOT replace existing content - ADD these):

```typescript
// ============================================================================
// EMBEDDING PROVIDERS (ADD TO EXISTING EXPORTS)
// ============================================================================

// Embedding types
export {
  type EmbeddingVector,
  type EmbeddingResult,
  type BatchEmbeddingResult,
  type OpenAIEmbeddingConfig,
  type AzureOpenAIEmbeddingConfig,
  type EmbeddingProviderConfig,
  type SemanticEmbeddingProvider,
  type EmbeddingProviderMetadata,
  cosineSimilarity,
  euclideanDistance,
  dotProduct,
} from './embedding-types.js';

// OpenAI Embedding Provider
export {
  OpenAIEmbeddingProvider,
  createOpenAIEmbeddingProvider,
} from './openai-embedding.js';

// Azure OpenAI Embedding Provider
export {
  AzureOpenAIEmbeddingProvider,
  createAzureOpenAIEmbeddingProvider,
} from './azure-openai-embedding.js';

// Embedding Factory
export {
  type EmbeddingEnvironment,
  detectEmbeddingEnvironment,
  createEmbeddingProvider,
  createEmbeddingProviderFromEnvironment,
  createBestAvailableEmbeddingProvider,
  TFIDFEmbeddingProviderAdapter,
} from './embedding-factory.js';
```

---

# STEP 24: Update agent-core RAG Exports

**File:** `packages/agent-core/src/rag/index.ts`

Add the following exports (DO NOT replace existing content - ADD these):

```typescript
// ============================================================================
// HYBRID RETRIEVAL (ADD TO EXISTING EXPORTS)
// ============================================================================

export {
  HybridRetrievalEngine,
  createHybridRetrievalEngine,
  type HybridRetrievalConfig,
  type HybridSearchResult,
  type ChunkWithEmbedding,
  DEFAULT_HYBRID_CONFIG,
} from './hybrid-retrieval.js';
```

---

# STEP 25: Update Main agent-core Index

**File:** `packages/agent-core/src/index.ts`

Ensure these are exported (verify existing, add if missing):

```typescript
// Providers (including new embedding providers)
export * from './providers/index.js';

// RAG (including hybrid retrieval)
export * from './rag/index.js';
```

---

# STEP 26: Verify Phase 2 Builds

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core

# Clean and rebuild
rm -rf dist
npm run build

# Check for errors
echo $?
# Should be 0
```

---

# STEP 27: Test Embedding Provider (Optional)

Create a quick test to verify OpenAI embedding works:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core

# Create test file
cat > test-embedding.ts << 'EOF'
import { createOpenAIEmbeddingProvider, cosineSimilarity } from './src/index.js';

async function test() {
  const provider = createOpenAIEmbeddingProvider();
  
  console.log('Testing OpenAI Embedding Provider...');
  console.log('Dimensions:', provider.getDimensions());
  
  const available = await provider.isAvailable();
  console.log('Available:', available);
  
  if (!available) {
    console.log('Set OPENAI_API_KEY to test embedding');
    return;
  }
  
  const text1 = 'What is the best way to allocate marketing budget?';
  const text2 = 'How should I distribute my advertising spend?';
  const text3 = 'What is the weather like today?';
  
  const [emb1, emb2, emb3] = await provider.embedBatch([text1, text2, text3]);
  
  console.log('Similarity (similar):', cosineSimilarity(emb1, emb2).toFixed(4));
  console.log('Similarity (different):', cosineSimilarity(emb1, emb3).toFixed(4));
}

test().catch(console.error);
EOF

# Run test (requires OPENAI_API_KEY)
npx tsx test-embedding.ts

# Clean up
rm test-embedding.ts
```

Expected output (if OPENAI_API_KEY is set):
```
Testing OpenAI Embedding Provider...
Dimensions: 1536
Available: true
Similarity (similar): 0.89+
Similarity (different): 0.70-
```

---

# PHASE 2 COMMIT

After all steps complete successfully:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

git add .
git commit -m "feat(agent-core): Phase 2 - Semantic embedding providers and hybrid retrieval

- Added OpenAIEmbeddingProvider for personal environment
- Added AzureOpenAIEmbeddingProvider for corporate environment
- Created HybridRetrievalEngine with Reciprocal Rank Fusion (RRF)
- Added embedding provider factory with environment detection
- Added TF-IDF adapter for fallback when no API available
- Exported all new types and functions from agent-core"

git push origin deploy/personal
```

---

# VERIFICATION CHECKLIST

- [ ] packages/agent-core builds without errors
- [ ] embedding-types.ts created with interfaces and similarity functions
- [ ] openai-embedding.ts created with full implementation
- [ ] azure-openai-embedding.ts created with full implementation
- [ ] hybrid-retrieval.ts created with RRF algorithm
- [ ] embedding-factory.ts created with environment detection
- [ ] providers/index.ts updated with new exports
- [ ] rag/index.ts updated with hybrid retrieval export
- [ ] (Optional) OpenAI embedding test passes

---

# NEXT: Phase 3 (KB Impact Tracking)

Phase 3 will generalize the KB impact tracking system from MPA to agent-core, enabling all three agents to learn from their interactions.
