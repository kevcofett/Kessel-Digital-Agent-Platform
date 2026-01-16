/**
 * Provider System Exports
 *
 * Multi-environment provider abstraction for agent systems.
 * Supports personal (Claude/Node.js) and corporate (Microsoft/Azure) environments.
 */
export * from './interfaces.js';
export { detectEnvironment, describeEnvironment, validateEnvironment } from './detect-environment.js';
export { ProviderFactory, type FactoryOptions } from './factory.js';
export { ClaudeLLMProvider } from './claude-llm.js';
export { LocalFSStorageProvider } from './local-fs-storage.js';
export { TFIDFEmbeddingProvider } from './tfidf-embedding.js';
export { AzureOpenAILLMProvider, createAzureOpenAILLMProvider, type AzureOpenAILLMConfig, } from './azure-openai-llm.js';
export { CopilotStudioLLMProvider, createCopilotStudioLLMProvider, type CopilotStudioLLMConfig, } from './copilot-studio-llm.js';
export { DataverseStorageProvider, createDataverseStorageProvider, type DataverseStorageConfig, } from './dataverse-storage.js';
export { AzureAISearchEmbeddingProvider } from './azure-ai-search-embedding.js';
export { ToolShim, type ToolUseRequest, type ToolResult, } from './tool-shim.js';
export { UnifiedDocumentStore, createDocumentStore, DEFAULT_PATH_MAPPINGS, type DocumentStore, type DocumentStoreConfig, type EntityMapping, } from './document-store.js';
export { TokenManager, TokenAcquisitionError, createDataverseTokenManager, createAzureOpenAITokenManager, type TokenResponse, type TokenManagerConfig, } from './token-manager.js';
export { type EmbeddingVector, type EmbeddingResult, type BatchEmbeddingResult, type OpenAIEmbeddingConfig, type AzureOpenAIEmbeddingConfig, type EmbeddingProviderConfig, type SemanticEmbeddingProvider, type EmbeddingProviderMetadata, cosineSimilarity, euclideanDistance, dotProduct, } from './embedding-types.js';
export { OpenAIEmbeddingProvider, createOpenAIEmbeddingProvider, } from './openai-embedding.js';
export { AzureOpenAIEmbeddingProvider, createAzureOpenAIEmbeddingProvider, } from './azure-openai-embedding.js';
export { type EmbeddingEnvironment, detectEmbeddingEnvironment, createEmbeddingProvider, createEmbeddingProviderFromEnvironment, createBestAvailableEmbeddingProvider, TFIDFEmbeddingProviderAdapter, } from './embedding-factory.js';
//# sourceMappingURL=index.d.ts.map