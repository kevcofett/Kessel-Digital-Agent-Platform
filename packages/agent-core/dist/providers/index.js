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
export { ProviderFactory } from './factory.js';
// Personal environment providers
export { ClaudeLLMProvider } from './claude-llm.js';
export { LocalFSStorageProvider } from './local-fs-storage.js';
export { TFIDFEmbeddingProvider } from './tfidf-embedding.js';
// Corporate environment providers
export { AzureOpenAILLMProvider, createAzureOpenAILLMProvider, } from './azure-openai-llm.js';
export { CopilotStudioLLMProvider, createCopilotStudioLLMProvider, } from './copilot-studio-llm.js';
export { DataverseStorageProvider, createDataverseStorageProvider, } from './dataverse-storage.js';
export { AzureAISearchEmbeddingProvider } from './azure-ai-search-embedding.js';
// Multi-environment abstractions
export { ToolShim, } from './tool-shim.js';
export { UnifiedDocumentStore, createDocumentStore, DEFAULT_PATH_MAPPINGS, } from './document-store.js';
export { TokenManager, TokenAcquisitionError, createDataverseTokenManager, createAzureOpenAITokenManager, } from './token-manager.js';
// ============================================================================
// EMBEDDING PROVIDERS
// ============================================================================
// Embedding types
export { cosineSimilarity, euclideanDistance, dotProduct, } from './embedding-types.js';
// OpenAI Embedding Provider
export { OpenAIEmbeddingProvider, createOpenAIEmbeddingProvider, } from './openai-embedding.js';
// Azure OpenAI Embedding Provider
export { AzureOpenAIEmbeddingProvider, createAzureOpenAIEmbeddingProvider, } from './azure-openai-embedding.js';
// Embedding Factory
export { detectEmbeddingEnvironment, createEmbeddingProvider, createEmbeddingProviderFromEnvironment, createBestAvailableEmbeddingProvider, TFIDFEmbeddingProviderAdapter, } from './embedding-factory.js';
//# sourceMappingURL=index.js.map