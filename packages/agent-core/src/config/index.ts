/**
 * Configuration Module Exports
 */

// Environment Types
export {
  type EnvironmentType,
  type EnvironmentName,
  type LLMProviderConfig,
  type EmbeddingProviderConfig,
  type StorageProviderConfig,
  type KBImpactStorageConfig,
  type EnvironmentConfig,
  type AgentOverrides,
  validateEnvironmentConfig,
} from './environment-types.js';

// Environment Loader
export {
  EnvironmentLoader,
  getEnvironmentLoader,
  loadEnvironmentConfig,
  setEnvironmentConfigPath,
  PERSONAL_ENV_CONFIG,
  CORPORATE_ENV_CONFIG,
} from './environment-loader.js';

// Provider Factory
export {
  ConfigProviderFactory,
  ProviderFactory,
  createConfigProviderFactory,
  createProviderFactory,
} from './provider-factory.js';

// Stack Toggle System (Phase 7)
export {
  type StackType,
  type ClaudeStackConfig,
  type MicrosoftStackConfig,
  type StackConfig,
  type StackFeatureFlags,
  type StackDetectionResult,
  type ProviderAvailability,
  CLAUDE_STACK_FEATURES,
  MICROSOFT_STACK_FEATURES,
} from './stack-types.js';

export {
  StackToggle,
  getStackToggle,
  getActiveStack,
  isClaudeStack,
  isMicrosoftStack,
  getFeatureFlags,
  isFeatureEnabled,
} from './stack-toggle.js';

export {
  StackProviderFactory,
  getStackProviderFactory,
  createStackProviderFactory,
  type StackProviderInstances,
} from './stack-provider-factory.js';

export {
  testStackToggle,
  printStackSummary,
} from './stack-test.js';
