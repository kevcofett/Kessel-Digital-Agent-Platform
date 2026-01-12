/**
 * Provider Factory
 *
 * Creates provider instances based on environment configuration.
 * Supports both personal (Claude/Node.js) and corporate (Microsoft/Azure) environments.
 */
import { LLMProvider, StorageProvider, EmbeddingProvider, EnvironmentConfig, EmbeddingConfig } from './interfaces.js';
export interface FactoryOptions {
    embeddingConfig?: Partial<EmbeddingConfig>;
    storagePath?: string;
}
export declare class ProviderFactory {
    /**
     * Create an LLM provider based on configuration
     */
    static createLLMProvider(config: EnvironmentConfig): LLMProvider;
    /**
     * Create a storage provider based on configuration
     */
    static createStorageProvider(config: EnvironmentConfig, options?: FactoryOptions): StorageProvider;
    /**
     * Create an embedding provider based on configuration
     */
    static createEmbeddingProvider(config: EnvironmentConfig, options?: FactoryOptions): EmbeddingProvider;
    /**
     * Create all providers for an environment
     */
    static createAllProviders(config: EnvironmentConfig, options?: FactoryOptions): {
        llm: LLMProvider;
        storage: StorageProvider;
        embedding: EmbeddingProvider;
    };
    /**
     * Create providers with default personal environment
     */
    static createDefaultProviders(options?: FactoryOptions): {
        llm: LLMProvider;
        storage: StorageProvider;
        embedding: EmbeddingProvider;
    };
}
export default ProviderFactory;
//# sourceMappingURL=factory.d.ts.map