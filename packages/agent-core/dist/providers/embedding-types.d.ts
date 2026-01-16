/**
 * Extended Embedding Provider Types
 *
 * Defines interfaces for semantic embedding providers beyond TF-IDF.
 */
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
export interface OpenAIEmbeddingConfig {
    apiKey?: string;
    model?: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';
    dimensions?: number;
    baseURL?: string;
    maxRetries?: number;
    timeout?: number;
}
export interface AzureOpenAIEmbeddingConfig {
    endpoint: string;
    apiKey?: string;
    deploymentName: string;
    apiVersion?: string;
    maxRetries?: number;
    timeout?: number;
}
export interface EmbeddingProviderConfig {
    type: 'openai' | 'azure-openai' | 'tfidf' | 'local-transformer';
    openai?: OpenAIEmbeddingConfig;
    azureOpenai?: AzureOpenAIEmbeddingConfig;
}
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
    costPer1MTokens?: number;
}
/**
 * Calculate cosine similarity between two vectors
 */
export declare function cosineSimilarity(a: number[], b: number[]): number;
/**
 * Calculate euclidean distance between two vectors
 */
export declare function euclideanDistance(a: number[], b: number[]): number;
/**
 * Calculate dot product between two vectors
 */
export declare function dotProduct(a: number[], b: number[]): number;
declare const _default: {
    cosineSimilarity: typeof cosineSimilarity;
    euclideanDistance: typeof euclideanDistance;
    dotProduct: typeof dotProduct;
};
export default _default;
//# sourceMappingURL=embedding-types.d.ts.map