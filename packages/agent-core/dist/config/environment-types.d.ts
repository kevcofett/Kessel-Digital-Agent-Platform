/**
 * Environment Configuration Types
 *
 * Defines the structure for environment-specific configurations
 * that switch between personal (Aragorn AI) and corporate (Mastercard) deployments.
 */
export type EnvironmentType = 'personal' | 'corporate';
export type EnvironmentName = 'aragorn-ai' | 'mastercard' | 'development' | 'staging';
export interface LLMProviderConfig {
    /**
     * Provider type to use
     */
    type: 'claude' | 'azure-openai' | 'copilot-studio' | 'openai';
    /**
     * API key (or env var name prefixed with $)
     */
    apiKey?: string;
    /**
     * Endpoint URL for cloud providers
     */
    endpoint?: string;
    /**
     * Deployment/model name
     */
    deploymentName?: string;
    /**
     * Model identifier
     */
    model?: string;
    /**
     * Default generation parameters
     */
    defaultParams?: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
    };
}
export interface EmbeddingProviderConfig {
    /**
     * Provider type to use
     */
    type: 'openai' | 'azure-openai' | 'tfidf' | 'azure-ai-search';
    /**
     * API key (or env var name prefixed with $)
     */
    apiKey?: string;
    /**
     * Endpoint URL
     */
    endpoint?: string;
    /**
     * Deployment/model name
     */
    deploymentName?: string;
    /**
     * Model for OpenAI
     */
    model?: string;
    /**
     * Embedding dimensions
     */
    dimensions?: number;
}
export interface StorageProviderConfig {
    /**
     * Provider type to use
     */
    type: 'local-fs' | 'dataverse' | 'sharepoint';
    /**
     * Base path for local storage
     */
    basePath?: string;
    /**
     * Environment URL for cloud storage
     */
    environmentUrl?: string;
    /**
     * Tenant ID for authentication
     */
    tenantId?: string;
    /**
     * Client credentials
     */
    clientId?: string;
    clientSecret?: string;
    /**
     * Table/library name
     */
    tableName?: string;
}
export interface KBImpactStorageConfig {
    /**
     * Provider type to use
     */
    type: 'local-fs' | 'dataverse';
    /**
     * Base path for local storage
     */
    basePath?: string;
    /**
     * Dataverse configuration
     */
    dataverse?: {
        environmentUrl: string;
        tenantId: string;
        clientId?: string;
        clientSecret?: string;
        tables?: {
            usageRecords?: string;
            documentImpacts?: string;
            updateProposals?: string;
        };
    };
}
export interface EnvironmentConfig {
    /**
     * Environment type (personal or corporate)
     */
    type: EnvironmentType;
    /**
     * Environment name (aragorn-ai, mastercard, etc.)
     */
    name: EnvironmentName;
    /**
     * Human-readable description
     */
    description?: string;
    /**
     * LLM provider configuration
     */
    llm: LLMProviderConfig;
    /**
     * Embedding provider configuration
     */
    embedding: EmbeddingProviderConfig;
    /**
     * Storage provider configuration
     */
    storage: StorageProviderConfig;
    /**
     * KB impact tracking storage configuration
     */
    kbImpactStorage: KBImpactStorageConfig;
    /**
     * Feature flags
     */
    features: {
        enableHybridSearch: boolean;
        enableKBImpactTracking: boolean;
        enableAutoUpdateProposals: boolean;
        enableCaching: boolean;
        enableDebugLogging: boolean;
    };
    /**
     * Agent-specific overrides
     */
    agents?: {
        mpa?: Partial<AgentOverrides>;
        ca?: Partial<AgentOverrides>;
        eap?: Partial<AgentOverrides>;
    };
}
export interface AgentOverrides {
    llm?: Partial<LLMProviderConfig>;
    embedding?: Partial<EmbeddingProviderConfig>;
    kbPath?: string;
    features?: Partial<EnvironmentConfig['features']>;
}
export declare function validateEnvironmentConfig(config: unknown): config is EnvironmentConfig;
//# sourceMappingURL=environment-types.d.ts.map