/**
 * Embedding Provider Factory
 *
 * Creates the appropriate embedding provider based on environment configuration.
 */
import type { SemanticEmbeddingProvider, EmbeddingProviderConfig } from './embedding-types.js';
export type EmbeddingEnvironment = 'personal' | 'corporate' | 'local';
/**
 * Detect embedding environment from environment variables
 */
export declare function detectEmbeddingEnvironment(): EmbeddingEnvironment;
/**
 * Create an embedding provider based on configuration
 */
export declare function createEmbeddingProvider(config: EmbeddingProviderConfig): SemanticEmbeddingProvider;
/**
 * Create an embedding provider based on environment detection
 */
export declare function createEmbeddingProviderFromEnvironment(): SemanticEmbeddingProvider;
/**
 * Try to create the best available embedding provider
 * Returns null if no semantic provider is available
 */
export declare function createBestAvailableEmbeddingProvider(): Promise<SemanticEmbeddingProvider | null>;
/**
 * Adapter to make TFIDFEmbeddingProvider conform to SemanticEmbeddingProvider interface
 *
 * Note: TF-IDF doesn't produce true semantic embeddings, but can be used as a fallback.
 * The "embeddings" are sparse vectors based on term frequency.
 */
export declare class TFIDFEmbeddingProviderAdapter implements SemanticEmbeddingProvider {
    readonly providerId = "tfidf-adapter";
    private vocabulary;
    private dimensions;
    constructor();
    getDimensions(): number;
    embed(text: string): Promise<number[]>;
    embedBatch(texts: string[]): Promise<number[][]>;
    isAvailable(): Promise<boolean>;
    getMetadata(): {
        providerId: string;
        model: string;
        dimensions: number;
        maxTokensPerRequest: number;
        supportsReducedDimensions: boolean;
        costPer1MTokens: number;
    };
    private tokenize;
    private hashToIndex;
}
//# sourceMappingURL=embedding-factory.d.ts.map