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
