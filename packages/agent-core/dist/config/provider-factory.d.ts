/**
 * Provider Factory
 *
 * Creates provider instances based on environment configuration.
 */
import type { EnvironmentConfig } from './environment-types.js';
import type { LLMProvider, StorageProvider } from '../providers/interfaces.js';
import type { SemanticEmbeddingProvider } from '../providers/embedding-types.js';
import type { KBImpactStorage } from '../learning/kb-impact-types.js';
export declare class ConfigProviderFactory {
    private config;
    private llmProvider?;
    private embeddingProvider?;
    private storageProvider?;
    private kbImpactStorage?;
    constructor(config: EnvironmentConfig);
    /**
     * Get LLM provider instance
     */
    getLLMProvider(): LLMProvider;
    /**
     * Get embedding provider instance
     */
    getEmbeddingProvider(): SemanticEmbeddingProvider;
    /**
     * Get storage provider instance
     */
    getStorageProvider(): StorageProvider;
    /**
     * Get KB impact storage instance
     */
    getKBImpactStorage(): KBImpactStorage;
    /**
     * Get all providers at once
     */
    getAllProviders(): {
        llm: LLMProvider;
        embedding: SemanticEmbeddingProvider;
        storage: StorageProvider;
        kbImpactStorage: KBImpactStorage;
    };
    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean;
    /**
     * Get environment type
     */
    getEnvironmentType(): string;
    /**
     * Get environment name
     */
    getEnvironmentName(): string;
    /**
     * Get the raw configuration
     */
    getConfig(): EnvironmentConfig;
    /**
     * Clear all cached providers
     */
    clearCache(): void;
}
export declare function createConfigProviderFactory(config: EnvironmentConfig): ConfigProviderFactory;
export { ConfigProviderFactory as ProviderFactory };
export declare const createProviderFactory: typeof createConfigProviderFactory;
export default ConfigProviderFactory;
//# sourceMappingURL=provider-factory.d.ts.map