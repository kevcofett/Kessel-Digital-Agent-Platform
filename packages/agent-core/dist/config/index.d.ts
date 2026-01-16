/**
 * Configuration Module Exports
 */
export { type EnvironmentType, type EnvironmentName, type LLMProviderConfig, type EmbeddingProviderConfig, type StorageProviderConfig, type KBImpactStorageConfig, type EnvironmentConfig, type AgentOverrides, validateEnvironmentConfig, } from './environment-types.js';
export { EnvironmentLoader, getEnvironmentLoader, loadEnvironmentConfig, setEnvironmentConfigPath, PERSONAL_ENV_CONFIG, CORPORATE_ENV_CONFIG, } from './environment-loader.js';
export { ConfigProviderFactory, ProviderFactory, createConfigProviderFactory, createProviderFactory, } from './provider-factory.js';
export { type StackType, type ClaudeStackConfig, type MicrosoftStackConfig, type StackConfig, type StackFeatureFlags, type StackDetectionResult, type ProviderAvailability, CLAUDE_STACK_FEATURES, MICROSOFT_STACK_FEATURES, } from './stack-types.js';
export { StackToggle, getStackToggle, getActiveStack, isClaudeStack, isMicrosoftStack, getFeatureFlags, isFeatureEnabled, } from './stack-toggle.js';
export { StackProviderFactory, getStackProviderFactory, createStackProviderFactory, type StackProviderInstances, } from './stack-provider-factory.js';
export { testStackToggle, printStackSummary, } from './stack-test.js';
//# sourceMappingURL=index.d.ts.map