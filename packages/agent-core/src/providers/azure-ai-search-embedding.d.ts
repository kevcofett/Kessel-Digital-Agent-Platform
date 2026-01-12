/**
 * Azure AI Search Embedding Provider (Stub)
 *
 * Embedding provider implementation for corporate environments using
 * Azure AI Search (formerly Azure Cognitive Search) with vector search.
 *
 * This is a stub for future Microsoft integration.
 *
 * When implemented, this will use Azure AI Search's vector search
 * capabilities with Azure OpenAI embeddings.
 *
 * NOTE: Azure AI Search uses fixed 1536-dimension embeddings (text-embedding-ada-002).
 * This is incompatible with TF-IDF embeddings - separate indexes per environment required.
 */
import { EmbeddingProvider, EnvironmentConfig } from './interfaces.js';
export declare class AzureAISearchEmbeddingProvider implements EmbeddingProvider {
    readonly name = "azure-ai-search";
    private endpoint;
    private apiKey;
    private indexName;
    private initialized;
    private dimension;
    constructor(config?: EnvironmentConfig);
    /**
     * Validate configuration
     */
    private validateConfig;
    /**
     * Initialize with corpus documents
     * Creates or updates the Azure AI Search index
     */
    initialize(documents: string[]): Promise<void>;
    /**
     * Generate embedding for text using Azure OpenAI
     */
    embed(text: string): Promise<number[]>;
    /**
     * Generate embeddings for multiple texts
     */
    embedBatch(texts: string[]): Promise<number[][]>;
    /**
     * Calculate cosine similarity
     */
    cosineSimilarity(a: number[], b: number[]): number;
    /**
     * Get embedding dimension
     */
    getDimension(): number;
    /**
     * Check if initialized
     */
    isInitialized(): boolean;
    /**
     * Set embedding dimension (for different models)
     */
    setDimension(dim: number): void;
}
export default AzureAISearchEmbeddingProvider;
//# sourceMappingURL=azure-ai-search-embedding.d.ts.map