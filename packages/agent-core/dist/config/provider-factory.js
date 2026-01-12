/**
 * Provider Factory
 *
 * Creates provider instances based on environment configuration.
 */
// Import providers
import { ClaudeLLMProvider } from '../providers/claude-llm.js';
import { AzureOpenAILLMProvider } from '../providers/azure-openai-llm.js';
import { CopilotStudioLLMProvider } from '../providers/copilot-studio-llm.js';
import { OpenAIEmbeddingProvider } from '../providers/openai-embedding.js';
import { AzureOpenAIEmbeddingProvider } from '../providers/azure-openai-embedding.js';
import { TFIDFEmbeddingProviderAdapter } from '../providers/embedding-factory.js';
import { LocalFSStorageProvider } from '../providers/local-fs-storage.js';
import { DataverseStorageProvider } from '../providers/dataverse-storage.js';
import { LocalKBImpactStorage } from '../learning/local-kb-impact-storage.js';
import { DataverseKBImpactStorage } from '../learning/dataverse-kb-impact-storage.js';
// ============================================================================
// PROVIDER FACTORY
// ============================================================================
export class ConfigProviderFactory {
    config;
    // Cached provider instances
    llmProvider;
    embeddingProvider;
    storageProvider;
    kbImpactStorage;
    constructor(config) {
        this.config = config;
    }
    /**
     * Get LLM provider instance
     */
    getLLMProvider() {
        if (this.llmProvider) {
            return this.llmProvider;
        }
        const { llm } = this.config;
        switch (llm.type) {
            case 'claude':
                // ClaudeLLMProvider takes optional apiKey string
                this.llmProvider = new ClaudeLLMProvider(llm.apiKey);
                break;
            case 'azure-openai':
                if (!llm.endpoint || !llm.deploymentName) {
                    throw new Error('Azure OpenAI requires endpoint and deploymentName');
                }
                this.llmProvider = new AzureOpenAILLMProvider({
                    endpoint: llm.endpoint,
                    apiKey: llm.apiKey,
                    deploymentName: llm.deploymentName,
                    defaultParams: llm.defaultParams,
                });
                break;
            case 'copilot-studio':
                if (!llm.endpoint || !llm.deploymentName) {
                    throw new Error('Copilot Studio requires endpoint (environmentUrl) and deploymentName (botId)');
                }
                this.llmProvider = new CopilotStudioLLMProvider({
                    environmentUrl: llm.endpoint,
                    botId: llm.deploymentName,
                    tenantId: this.config.storage.tenantId || '',
                });
                break;
            default:
                throw new Error(`Unknown LLM provider type: ${llm.type}`);
        }
        return this.llmProvider;
    }
    /**
     * Get embedding provider instance
     */
    getEmbeddingProvider() {
        if (this.embeddingProvider) {
            return this.embeddingProvider;
        }
        const { embedding } = this.config;
        switch (embedding.type) {
            case 'openai':
                this.embeddingProvider = new OpenAIEmbeddingProvider({
                    apiKey: embedding.apiKey,
                    model: embedding.model,
                    dimensions: embedding.dimensions,
                });
                break;
            case 'azure-openai':
                if (!embedding.endpoint || !embedding.deploymentName) {
                    throw new Error('Azure OpenAI embedding requires endpoint and deploymentName');
                }
                this.embeddingProvider = new AzureOpenAIEmbeddingProvider({
                    endpoint: embedding.endpoint,
                    apiKey: embedding.apiKey,
                    deploymentName: embedding.deploymentName,
                });
                break;
            case 'tfidf':
                this.embeddingProvider = new TFIDFEmbeddingProviderAdapter();
                break;
            default:
                // Fall back to TF-IDF
                console.warn(`Unknown embedding type ${embedding.type}, falling back to TF-IDF`);
                this.embeddingProvider = new TFIDFEmbeddingProviderAdapter();
        }
        return this.embeddingProvider;
    }
    /**
     * Get storage provider instance
     */
    getStorageProvider() {
        if (this.storageProvider) {
            return this.storageProvider;
        }
        const { storage } = this.config;
        switch (storage.type) {
            case 'local-fs':
                // LocalFSStorageProvider takes optional basePath string
                this.storageProvider = new LocalFSStorageProvider(storage.basePath || './.agent-data');
                break;
            case 'dataverse':
                if (!storage.environmentUrl || !storage.tenantId) {
                    throw new Error('Dataverse storage requires environmentUrl and tenantId');
                }
                this.storageProvider = new DataverseStorageProvider({
                    environmentUrl: storage.environmentUrl,
                    tenantId: storage.tenantId,
                    clientId: storage.clientId,
                    clientSecret: storage.clientSecret,
                    tableName: storage.tableName,
                });
                break;
            default:
                throw new Error(`Unknown storage provider type: ${storage.type}`);
        }
        return this.storageProvider;
    }
    /**
     * Get KB impact storage instance
     */
    getKBImpactStorage() {
        if (this.kbImpactStorage) {
            return this.kbImpactStorage;
        }
        const { kbImpactStorage } = this.config;
        switch (kbImpactStorage.type) {
            case 'local-fs':
                this.kbImpactStorage = new LocalKBImpactStorage(kbImpactStorage.basePath || './.kb-impact');
                break;
            case 'dataverse':
                if (!kbImpactStorage.dataverse) {
                    throw new Error('Dataverse KB impact storage requires dataverse configuration');
                }
                this.kbImpactStorage = new DataverseKBImpactStorage({
                    environmentUrl: kbImpactStorage.dataverse.environmentUrl,
                    tenantId: kbImpactStorage.dataverse.tenantId,
                    clientId: kbImpactStorage.dataverse.clientId,
                    clientSecret: kbImpactStorage.dataverse.clientSecret,
                    tables: kbImpactStorage.dataverse.tables,
                });
                break;
            default:
                throw new Error(`Unknown KB impact storage type: ${kbImpactStorage.type}`);
        }
        return this.kbImpactStorage;
    }
    /**
     * Get all providers at once
     */
    getAllProviders() {
        return {
            llm: this.getLLMProvider(),
            embedding: this.getEmbeddingProvider(),
            storage: this.getStorageProvider(),
            kbImpactStorage: this.getKBImpactStorage(),
        };
    }
    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(feature) {
        return this.config.features[feature] ?? false;
    }
    /**
     * Get environment type
     */
    getEnvironmentType() {
        return this.config.type;
    }
    /**
     * Get environment name
     */
    getEnvironmentName() {
        return this.config.name;
    }
    /**
     * Get the raw configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Clear all cached providers
     */
    clearCache() {
        this.llmProvider = undefined;
        this.embeddingProvider = undefined;
        this.storageProvider = undefined;
        this.kbImpactStorage = undefined;
    }
}
// ============================================================================
// FACTORY FUNCTION
// ============================================================================
export function createConfigProviderFactory(config) {
    return new ConfigProviderFactory(config);
}
// Re-export with alternate name for compatibility
export { ConfigProviderFactory as ProviderFactory };
export const createProviderFactory = createConfigProviderFactory;
export default ConfigProviderFactory;
//# sourceMappingURL=provider-factory.js.map