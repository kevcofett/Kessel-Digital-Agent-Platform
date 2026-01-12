/**
 * Provider System Exports
 *
 * Multi-environment provider abstraction for agent systems.
 * Supports personal (Claude/Node.js) and corporate (Microsoft/Azure) environments.
 */

// Interfaces and types
export * from './interfaces.js';

// Environment detection
export { detectEnvironment, describeEnvironment, validateEnvironment } from './detect-environment.js';

// Provider factory
export { ProviderFactory, type FactoryOptions } from './factory.js';

// Personal environment providers
export { ClaudeLLMProvider } from './claude-llm.js';
export { LocalFSStorageProvider } from './local-fs-storage.js';
export { TFIDFEmbeddingProvider } from './tfidf-embedding.js';

// Corporate environment providers (stubs)
export { AzureOpenAILLMProvider } from './azure-openai-llm.js';
export { CopilotStudioLLMProvider } from './copilot-studio-llm.js';
export { DataverseStorageProvider } from './dataverse-storage.js';
export { AzureAISearchEmbeddingProvider } from './azure-ai-search-embedding.js';

// Multi-environment abstractions
export {
  ToolShim,
  type ToolUseRequest,
  type ToolResult,
} from './tool-shim.js';

export {
  UnifiedDocumentStore,
  createDocumentStore,
  DEFAULT_PATH_MAPPINGS,
  type DocumentStore,
  type DocumentStoreConfig,
  type EntityMapping,
} from './document-store.js';

export {
  TokenManager,
  TokenAcquisitionError,
  createDataverseTokenManager,
  createAzureOpenAITokenManager,
  type TokenResponse,
  type TokenManagerConfig,
} from './token-manager.js';

// ============================================================================
// EMBEDDING PROVIDERS
// ============================================================================

// Embedding types
export {
  type EmbeddingVector,
  type EmbeddingResult,
  type BatchEmbeddingResult,
  type OpenAIEmbeddingConfig,
  type AzureOpenAIEmbeddingConfig,
  type EmbeddingProviderConfig,
  type SemanticEmbeddingProvider,
  type EmbeddingProviderMetadata,
  cosineSimilarity,
  euclideanDistance,
  dotProduct,
} from './embedding-types.js';

// OpenAI Embedding Provider
export {
  OpenAIEmbeddingProvider,
  createOpenAIEmbeddingProvider,
} from './openai-embedding.js';

// Azure OpenAI Embedding Provider
export {
  AzureOpenAIEmbeddingProvider,
  createAzureOpenAIEmbeddingProvider,
} from './azure-openai-embedding.js';

// Embedding Factory
export {
  type EmbeddingEnvironment,
  detectEmbeddingEnvironment,
  createEmbeddingProvider,
  createEmbeddingProviderFromEnvironment,
  createBestAvailableEmbeddingProvider,
  TFIDFEmbeddingProviderAdapter,
} from './embedding-factory.js';
