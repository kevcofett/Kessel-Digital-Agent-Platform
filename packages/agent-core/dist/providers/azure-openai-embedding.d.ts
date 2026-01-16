/**
 * Azure OpenAI Embedding Provider
 *
 * Provides semantic embeddings using Azure OpenAI's embedding deployments.
 * Used in corporate/Mastercard environments.
 */
import type { SemanticEmbeddingProvider, AzureOpenAIEmbeddingConfig, EmbeddingProviderMetadata } from './embedding-types.js';
export declare class AzureOpenAIEmbeddingProvider implements SemanticEmbeddingProvider {
    readonly providerId = "azure-openai-embedding";
    private endpoint;
    private apiKey;
    private deploymentName;
    private apiVersion;
    private maxRetries;
    private timeout;
    private dimensions;
    constructor(config: AzureOpenAIEmbeddingConfig);
    getDimensions(): number;
    embed(text: string): Promise<number[]>;
    embedBatch(texts: string[]): Promise<number[][]>;
    private embedBatchInternal;
    isAvailable(): Promise<boolean>;
    getMetadata(): EmbeddingProviderMetadata;
    private sleep;
}
/**
 * Create an Azure OpenAI embedding provider with configuration
 */
export declare function createAzureOpenAIEmbeddingProvider(config: AzureOpenAIEmbeddingConfig): AzureOpenAIEmbeddingProvider;
export default AzureOpenAIEmbeddingProvider;
//# sourceMappingURL=azure-openai-embedding.d.ts.map