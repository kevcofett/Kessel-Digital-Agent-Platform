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
  // LLM Features
  useCopilotStudioOrchestration: boolean;
  useAzureOpenAIDirectly: boolean;
  useClaudeAPI: boolean;

  // Storage Features
  useDataverseStorage: boolean;
  useLocalStorage: boolean;

  // KB Features
  useSharePointKB: boolean;
  useAzureAISearch: boolean;
  useLocalKB: boolean;

  // Workflow Features
  usePowerAutomateFlows: boolean;

  // Tracking Features
  useDataverseImpactTracking: boolean;
  useLocalImpactTracking: boolean;

  // Debug Features
  enableDebugLogging: boolean;
  enablePerformanceMetrics: boolean;
}

/**
 * Default feature flags for Claude stack
 */
export const CLAUDE_STACK_FEATURES: StackFeatureFlags = {
  useCopilotStudioOrchestration: false,
  useAzureOpenAIDirectly: false,
  useClaudeAPI: true,

  useDataverseStorage: false,
  useLocalStorage: true,

  useSharePointKB: false,
  useAzureAISearch: false,
  useLocalKB: true,

  usePowerAutomateFlows: false,

  useDataverseImpactTracking: false,
  useLocalImpactTracking: true,

  enableDebugLogging: true,
  enablePerformanceMetrics: true,
};

/**
 * Default feature flags for Microsoft stack
 */
export const MICROSOFT_STACK_FEATURES: StackFeatureFlags = {
  useCopilotStudioOrchestration: true,
  useAzureOpenAIDirectly: true,
  useClaudeAPI: false,

  useDataverseStorage: true,
  useLocalStorage: false,

  useSharePointKB: true,
  useAzureAISearch: true,
  useLocalKB: false,

  usePowerAutomateFlows: true,

  useDataverseImpactTracking: true,
  useLocalImpactTracking: false,

  enableDebugLogging: false,
  enablePerformanceMetrics: true,
};

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
