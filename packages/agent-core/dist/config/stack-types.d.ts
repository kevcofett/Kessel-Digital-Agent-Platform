/**
 * Stack Types for Multi-Provider Support
 * Enables runtime switching between Claude and Microsoft stacks
 */
/**
 * Available stack types
 */
export type StackType = 'claude' | 'microsoft';
/**
 * Claude stack configuration
 */
export interface ClaudeStackConfig {
    type: 'claude';
    llm: {
        apiKey: string;
        model: string;
        maxTokens?: number;
        temperature?: number;
    };
    embedding: {
        provider: 'openai';
        apiKey: string;
        model: string;
        dimensions?: number;
    };
    storage: {
        type: 'local-fs';
        basePath: string;
    };
    kb: {
        type: 'local-fs';
        basePath: string;
        indexPath?: string;
    };
}
/**
 * Microsoft stack configuration
 */
export interface MicrosoftStackConfig {
    type: 'microsoft';
    copilotStudio: {
        environmentUrl: string;
        botId: string;
        tenantId: string;
        clientId?: string;
        clientSecret?: string;
    };
    azureOpenAI: {
        endpoint: string;
        deploymentName: string;
        apiKey?: string;
        apiVersion?: string;
        embeddingDeployment?: string;
    };
    dataverse: {
        environmentUrl: string;
        tenantId: string;
        clientId: string;
        clientSecret: string;
    };
    sharePoint: {
        siteUrl: string;
        libraryName: string;
        tenantId: string;
        clientId: string;
        clientSecret: string;
    };
    azureAISearch?: {
        endpoint: string;
        apiKey: string;
        indexName: string;
    };
}
/**
 * Combined stack configuration
 */
export type StackConfig = ClaudeStackConfig | MicrosoftStackConfig;
/**
 * Feature flags for stack-specific features
 */
export interface StackFeatureFlags {
    useCopilotStudioOrchestration: boolean;
    useAzureOpenAIDirectly: boolean;
    useClaudeAPI: boolean;
    useDataverseStorage: boolean;
    useLocalStorage: boolean;
    useSharePointKB: boolean;
    useAzureAISearch: boolean;
    useLocalKB: boolean;
    usePowerAutomateFlows: boolean;
    useDataverseImpactTracking: boolean;
    useLocalImpactTracking: boolean;
    enableDebugLogging: boolean;
    enablePerformanceMetrics: boolean;
}
/**
 * Default feature flags for Claude stack
 */
export declare const CLAUDE_STACK_FEATURES: StackFeatureFlags;
/**
 * Default feature flags for Microsoft stack
 */
export declare const MICROSOFT_STACK_FEATURES: StackFeatureFlags;
/**
 * Stack detection result
 */
export interface StackDetectionResult {
    stack: StackType;
    source: 'environment' | 'config-file' | 'auto-detect' | 'default';
    features: StackFeatureFlags;
    configPath?: string;
}
/**
 * Provider availability check result
 */
export interface ProviderAvailability {
    llm: {
        claude: boolean;
        azureOpenAI: boolean;
        copilotStudio: boolean;
    };
    embedding: {
        openai: boolean;
        azureOpenAI: boolean;
    };
    storage: {
        local: boolean;
        dataverse: boolean;
    };
    kb: {
        local: boolean;
        sharePoint: boolean;
        azureAISearch: boolean;
    };
}
//# sourceMappingURL=stack-types.d.ts.map