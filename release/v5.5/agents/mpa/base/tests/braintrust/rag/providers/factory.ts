/**
 * Provider Factory
 *
 * Creates provider instances based on environment configuration.
 * Supports both personal (Claude/Node.js) and corporate (Microsoft/Azure) environments.
 */

import {
  LLMProvider,
  StorageProvider,
  EmbeddingProvider,
  EnvironmentConfig,
} from './interfaces.js';

// Personal environment providers
import { ClaudeLLMProvider } from './claude-llm.js';
import { LocalFSStorageProvider } from './local-fs-storage.js';
import { TFIDFEmbeddingProvider } from './tfidf-embedding.js';

// Corporate environment providers (stubs)
import { AzureOpenAILLMProvider } from './azure-openai-llm.js';
import { CopilotStudioLLMProvider } from './copilot-studio-llm.js';
import { DataverseStorageProvider } from './dataverse-storage.js';
import { AzureAISearchEmbeddingProvider } from './azure-ai-search-embedding.js';

export class ProviderFactory {
  /**
   * Create an LLM provider based on configuration
   */
  static createLLMProvider(config: EnvironmentConfig): LLMProvider {
    switch (config.llmProvider) {
      case 'claude':
        return new ClaudeLLMProvider(config.anthropicApiKey);

      case 'azure-openai':
        return new AzureOpenAILLMProvider(config);

      case 'copilot-studio':
        return new CopilotStudioLLMProvider(config);

      default:
        throw new Error(`Unknown LLM provider: ${config.llmProvider}`);
    }
  }

  /**
   * Create a storage provider based on configuration
   */
  static createStorageProvider(config: EnvironmentConfig): StorageProvider {
    switch (config.storageProvider) {
      case 'local-fs':
        return new LocalFSStorageProvider();

      case 'dataverse':
        return new DataverseStorageProvider(config);

      case 'azure-blob':
        // Azure Blob storage not yet implemented
        throw new Error('Azure Blob storage provider is not yet implemented');

      default:
        throw new Error(`Unknown storage provider: ${config.storageProvider}`);
    }
  }

  /**
   * Create an embedding provider based on configuration
   */
  static createEmbeddingProvider(config: EnvironmentConfig): EmbeddingProvider {
    switch (config.embeddingProvider) {
      case 'tfidf':
        return new TFIDFEmbeddingProvider();

      case 'azure-ai-search':
        return new AzureAISearchEmbeddingProvider(config);

      default:
        throw new Error(`Unknown embedding provider: ${config.embeddingProvider}`);
    }
  }

  /**
   * Create all providers for an environment
   */
  static createAllProviders(config: EnvironmentConfig): {
    llm: LLMProvider;
    storage: StorageProvider;
    embedding: EmbeddingProvider;
  } {
    return {
      llm: this.createLLMProvider(config),
      storage: this.createStorageProvider(config),
      embedding: this.createEmbeddingProvider(config),
    };
  }

  /**
   * Create providers with default personal environment
   */
  static createDefaultProviders(): {
    llm: LLMProvider;
    storage: StorageProvider;
    embedding: EmbeddingProvider;
  } {
    return {
      llm: new ClaudeLLMProvider(),
      storage: new LocalFSStorageProvider(),
      embedding: new TFIDFEmbeddingProvider(),
    };
  }
}

export default ProviderFactory;
