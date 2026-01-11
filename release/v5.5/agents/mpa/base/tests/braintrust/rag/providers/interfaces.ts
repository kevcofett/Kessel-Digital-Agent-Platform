/**
 * Provider Interfaces for Multi-Environment RAG Support
 *
 * Defines abstract interfaces for LLM, Storage, and Embedding providers
 * to enable the RAG system to work in both personal (Claude/Node.js)
 * and corporate (Microsoft/Azure) environments.
 */

// ============================================================================
// PROVIDER TYPE ENUMS
// ============================================================================

export type LLMProviderType = 'claude' | 'azure-openai' | 'copilot-studio';
export type StorageProviderType = 'local-fs' | 'dataverse' | 'azure-blob';
export type EmbeddingProviderType = 'tfidf' | 'azure-ai-search';

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

export interface EnvironmentConfig {
  type: 'personal' | 'corporate';
  llmProvider: LLMProviderType;
  storageProvider: StorageProviderType;
  embeddingProvider: EmbeddingProviderType;

  // Personal environment (Claude/Anthropic)
  anthropicApiKey?: string;

  // Corporate environment (Microsoft/Azure)
  azureOpenAIEndpoint?: string;
  azureOpenAIKey?: string;
  azureOpenAIDeployment?: string;

  dataverseUrl?: string;
  dataverseClientId?: string;
  dataverseClientSecret?: string;

  azureSearchEndpoint?: string;
  azureSearchKey?: string;
  azureSearchIndex?: string;

  copilotStudioEndpoint?: string;
  copilotStudioKey?: string;

  azureBlobConnectionString?: string;
  azureBlobContainer?: string;
}

// ============================================================================
// LLM PROVIDER INTERFACE
// ============================================================================

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | LLMContentBlock[];
}

export interface LLMContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

export interface LLMToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface LLMOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  tools?: LLMToolDefinition[];
}

export interface LLMResponse {
  content: LLMContentBlock[];
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens';
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMProvider {
  readonly name: string;

  /**
   * Generate a response from the LLM
   */
  generateResponse(
    systemPrompt: string,
    messages: LLMMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse>;

  /**
   * Check if this provider supports tool use
   */
  supportsTools(): boolean;

  /**
   * Initialize the provider (e.g., establish connections)
   */
  initialize?(): Promise<void>;
}

// ============================================================================
// STORAGE PROVIDER INTERFACE
// ============================================================================

export interface StorageProvider {
  readonly name: string;

  /**
   * Read a document/file content as string
   */
  readDocument(path: string): Promise<string>;

  /**
   * Write content to a document/file
   */
  writeDocument(path: string, content: string): Promise<void>;

  /**
   * List all documents in a directory/container
   */
  listDocuments(directory: string): Promise<string[]>;

  /**
   * Read and parse JSON data
   */
  readJSON<T>(path: string): Promise<T>;

  /**
   * Write data as JSON
   */
  writeJSON<T>(path: string, data: T): Promise<void>;

  /**
   * Check if a document exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Create a directory (if supported)
   */
  mkdir?(path: string): Promise<void>;

  /**
   * Initialize the provider
   */
  initialize?(): Promise<void>;
}

// ============================================================================
// EMBEDDING PROVIDER INTERFACE
// ============================================================================

export interface EmbeddingProvider {
  readonly name: string;

  /**
   * Initialize with corpus documents (for vocabulary building in TF-IDF,
   * or index creation in vector DBs)
   */
  initialize(documents: string[]): Promise<void>;

  /**
   * Generate embedding for a single text
   */
  embed(text: string): Promise<number[]>;

  /**
   * Generate embeddings for multiple texts
   */
  embedBatch(texts: string[]): Promise<number[][]>;

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number;

  /**
   * Get the embedding dimension
   */
  getDimension(): number;

  /**
   * Check if initialized
   */
  isInitialized(): boolean;

  /**
   * Export state for persistence (optional)
   */
  exportState?(): unknown;

  /**
   * Import state from persistence (optional)
   */
  importState?(state: unknown): void;
}

// ============================================================================
// PROVIDER ERRORS
// ============================================================================

export class ProviderNotImplementedError extends Error {
  constructor(providerType: string, providerName: string) {
    super(
      `${providerType} provider "${providerName}" is not yet implemented. ` +
      `This is a stub for future Microsoft/Azure integration.`
    );
    this.name = 'ProviderNotImplementedError';
  }
}

export class ProviderConfigurationError extends Error {
  constructor(providerName: string, missingConfig: string[]) {
    super(
      `${providerName} provider missing required configuration: ${missingConfig.join(', ')}. ` +
      `Please set the required environment variables.`
    );
    this.name = 'ProviderConfigurationError';
  }
}

export class ProviderInitializationError extends Error {
  constructor(providerName: string, reason: string) {
    super(`${providerName} provider failed to initialize: ${reason}`);
    this.name = 'ProviderInitializationError';
  }
}
