/**
 * OpenAI Embedding Provider
 *
 * Provides semantic embeddings using OpenAI's text-embedding models.
 * Used in personal/development environments.
 */
import type { SemanticEmbeddingProvider, OpenAIEmbeddingConfig, EmbeddingProviderMetadata } from './embedding-types.js';
export declare class OpenAIEmbeddingProvider implements SemanticEmbeddingProvider {
    readonly providerId = "openai-embedding";
    private apiKey;
    private model;
    private dimensions;
    private baseURL;
    private maxRetries;
    private timeout;
    constructor(config?: OpenAIEmbeddingConfig);
    getDimensions(): number;
    embed(text: string): Promise<number[]>;
    embedBatch(texts: string[]): Promise<number[][]>;
    private embedBatchInternal;
    isAvailable(): Promise<boolean>;
    getMetadata(): EmbeddingProviderMetadata;
    private sleep;
}
/**
 * Create an OpenAI embedding provider with optional configuration
 */
export declare function createOpenAIEmbeddingProvider(config?: OpenAIEmbeddingConfig): OpenAIEmbeddingProvider;
export default OpenAIEmbeddingProvider;
//# sourceMappingURL=openai-embedding.d.ts.map