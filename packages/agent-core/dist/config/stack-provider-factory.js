/**
 * Stack-Aware Provider Factory
 * Creates providers based on active stack configuration
 */
import { getStackToggle } from './stack-toggle.js';
/**
 * Stack-aware provider factory
 */
export class StackProviderFactory {
    stackToggle;
    providers = {};
    constructor(stackToggle) {
        this.stackToggle = stackToggle || getStackToggle();
    }
    /**
     * Create all providers for the active stack
     */
    async createProviders() {
        const config = this.stackToggle.loadConfig();
        if (config.type === 'claude') {
            return this.createClaudeProviders(config);
        }
        else {
            return this.createMicrosoftProviders(config);
        }
    }
    /**
     * Create Claude stack providers
     */
    async createClaudeProviders(config) {
        // Dynamic imports to avoid loading unused providers
        const { ClaudeLLMProvider } = await import('../providers/claude-llm.js');
        const { OpenAIEmbeddingProvider } = await import('../providers/openai-embedding.js');
        const { LocalFSStorageProvider } = await import('../providers/local-fs-storage.js');
        const { LocalKBImpactStorage } = await import('../learning/local-kb-impact-storage.js');
        return {
            llm: new ClaudeLLMProvider(config.llm.apiKey),
            embedding: new OpenAIEmbeddingProvider({
                apiKey: config.embedding.apiKey,
                model: config.embedding.model,
                dimensions: config.embedding.dimensions,
            }),
            storage: new LocalFSStorageProvider(config.storage.basePath),
            kbStorage: new LocalKBImpactStorage(config.storage.basePath),
        };
    }
    /**
     * Create Microsoft stack providers
     */
    async createMicrosoftProviders(config) {
        // Dynamic imports to avoid loading unused providers
        const { AzureOpenAILLMProvider } = await import('../providers/azure-openai-llm.js');
        const { AzureOpenAIEmbeddingProvider } = await import('../providers/azure-openai-embedding.js');
        const { DataverseStorageProvider } = await import('../providers/dataverse-storage.js');
        const { DataverseKBImpactStorage } = await import('../learning/dataverse-kb-impact-storage.js');
        // Determine LLM provider based on Copilot Studio configuration
        let llmProvider;
        if (config.copilotStudio.botId && config.copilotStudio.environmentUrl) {
            // Use Copilot Studio for orchestration (LLM passthrough)
            const { CopilotStudioLLMProvider } = await import('../providers/copilot-studio-llm.js');
            llmProvider = new CopilotStudioLLMProvider({
                environmentUrl: config.copilotStudio.environmentUrl,
                botId: config.copilotStudio.botId,
                tenantId: config.copilotStudio.tenantId,
            });
        }
        else {
            // Use Azure OpenAI directly
            llmProvider = new AzureOpenAILLMProvider({
                endpoint: config.azureOpenAI.endpoint,
                deploymentName: config.azureOpenAI.deploymentName,
                apiKey: config.azureOpenAI.apiKey,
                apiVersion: config.azureOpenAI.apiVersion,
            });
        }
        return {
            llm: llmProvider,
            embedding: new AzureOpenAIEmbeddingProvider({
                endpoint: config.azureOpenAI.endpoint,
                deploymentName: config.azureOpenAI.embeddingDeployment || 'text-embedding-ada-002',
                apiKey: config.azureOpenAI.apiKey,
                apiVersion: config.azureOpenAI.apiVersion,
            }),
            storage: new DataverseStorageProvider({
                environmentUrl: config.dataverse.environmentUrl,
                tenantId: config.dataverse.tenantId,
                clientId: config.dataverse.clientId,
                clientSecret: config.dataverse.clientSecret,
            }),
            kbStorage: new DataverseKBImpactStorage({
                environmentUrl: config.dataverse.environmentUrl,
                tenantId: config.dataverse.tenantId,
                clientId: config.dataverse.clientId,
                clientSecret: config.dataverse.clientSecret,
            }),
        };
    }
    /**
     * Get or create LLM provider
     */
    async getLLMProvider() {
        if (!this.providers.llm) {
            const providers = await this.createProviders();
            this.providers = providers;
        }
        return this.providers.llm;
    }
    /**
     * Get or create embedding provider
     */
    async getEmbeddingProvider() {
        if (!this.providers.embedding) {
            const providers = await this.createProviders();
            this.providers = providers;
        }
        return this.providers.embedding;
    }
    /**
     * Get or create storage provider
     */
    async getStorageProvider() {
        if (!this.providers.storage) {
            const providers = await this.createProviders();
            this.providers = providers;
        }
        return this.providers.storage;
    }
    /**
     * Get or create KB impact storage
     */
    async getKBImpactStorage() {
        if (!this.providers.kbStorage) {
            const providers = await this.createProviders();
            this.providers = providers;
        }
        return this.providers.kbStorage;
    }
    /**
     * Get all providers at once
     */
    async getAllProviders() {
        if (!this.providers.llm || !this.providers.embedding || !this.providers.storage || !this.providers.kbStorage) {
            const providers = await this.createProviders();
            this.providers = providers;
        }
        return this.providers;
    }
    /**
     * Reset all providers (useful for testing or reconfiguration)
     */
    reset() {
        this.providers = {};
        this.stackToggle.reset();
    }
}
/**
 * Singleton instance
 */
let factoryInstance = null;
/**
 * Get the singleton StackProviderFactory instance
 */
export function getStackProviderFactory() {
    if (!factoryInstance) {
        factoryInstance = new StackProviderFactory();
    }
    return factoryInstance;
}
/**
 * Create a new StackProviderFactory with optional custom toggle
 */
export function createStackProviderFactory(stackToggle) {
    return new StackProviderFactory(stackToggle);
}
//# sourceMappingURL=stack-provider-factory.js.map