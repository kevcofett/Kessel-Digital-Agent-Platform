/**
 * Provider Factory
 *
 * Creates provider instances based on environment configuration.
 * Supports both personal (Claude/Node.js) and corporate (Microsoft/Azure) environments.
 */
import { LLMProvider, StorageProvider, EmbeddingProvider, EnvironmentConfig } from './interfaces.js';
export declare class ProviderFactory {
    /**
     * Create an LLM provider based on configuration
     */
    static createLLMProvider(config: EnvironmentConfig): LLMProvider;
    /**
     * Create a storage provider based on configuration
     */
    static createStorageProvider(config: EnvironmentConfig): StorageProvider;
    /**
     * Create an embedding provider based on configuration
     */
    static createEmbeddingProvider(config: EnvironmentConfig): EmbeddingProvider;
    /**
     * Create all providers for an environment
     */
    static createAllProviders(config: EnvironmentConfig): {
        llm: LLMProvider;
        storage: StorageProvider;
        embedding: EmbeddingProvider;
    };
    /**
     * Create providers with default personal environment
     */
    static createDefaultProviders(): {
        llm: LLMProvider;
        storage: StorageProvider;
        embedding: EmbeddingProvider;
    };
}
export default ProviderFactory;
//# sourceMappingURL=factory.d.ts.map