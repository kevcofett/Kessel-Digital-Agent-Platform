/**
 * Provider System Exports
 *
 * Multi-environment provider abstraction for RAG system.
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

// Corporate environment providers (stubs)
export { AzureOpenAILLMProvider } from './azure-openai-llm.js';
export { CopilotStudioLLMProvider } from './copilot-studio-llm.js';
export { DataverseStorageProvider } from './dataverse-storage.js';
export { AzureAISearchEmbeddingProvider } from './azure-ai-search-embedding.js';
