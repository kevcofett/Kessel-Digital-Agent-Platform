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
