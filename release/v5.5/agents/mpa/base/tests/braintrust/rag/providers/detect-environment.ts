/**
 * Environment Detection
 *
 * Auto-detects the runtime environment based on available
 * credentials and configuration, returning the appropriate
 * EnvironmentConfig for provider initialization.
 */

import { EnvironmentConfig } from './interfaces.js';

/**
 * Detect the environment based on available environment variables
 * and credentials. Prioritizes corporate environment if those
 * credentials are available.
 */
export function detectEnvironment(): EnvironmentConfig {
  // Check for corporate/Microsoft environment indicators
  const hasAzureOpenAI = !!(
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_KEY
  );

  const hasCopilotStudio = !!(
    process.env.COPILOT_STUDIO_ENDPOINT &&
    process.env.COPILOT_STUDIO_KEY
  );

  const hasDataverse = !!(
    process.env.DATAVERSE_URL &&
    process.env.DATAVERSE_CLIENT_ID &&
    process.env.DATAVERSE_CLIENT_SECRET
  );

  const hasAzureSearch = !!(
    process.env.AZURE_AI_SEARCH_ENDPOINT &&
    process.env.AZURE_AI_SEARCH_KEY
  );

  const hasAzureBlob = !!process.env.AZURE_BLOB_CONNECTION_STRING;

  // If any Microsoft/Azure credentials are present, use corporate environment
  if (hasAzureOpenAI || hasCopilotStudio || hasDataverse || hasAzureSearch) {
    return {
      type: 'corporate',

      // LLM: Prefer Copilot Studio if available, otherwise Azure OpenAI
      llmProvider: hasCopilotStudio ? 'copilot-studio' : 'azure-openai',

      // Storage: Prefer Dataverse if available, otherwise Azure Blob
      storageProvider: hasDataverse ? 'dataverse' : (hasAzureBlob ? 'azure-blob' : 'local-fs'),

      // Embedding: Use Azure AI Search if available, otherwise fall back to TF-IDF
      embeddingProvider: hasAzureSearch ? 'azure-ai-search' : 'tfidf',

      // Azure OpenAI config
      azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
      azureOpenAIKey: process.env.AZURE_OPENAI_KEY,
      azureOpenAIDeployment: process.env.AZURE_OPENAI_DEPLOYMENT,

      // Dataverse config
      dataverseUrl: process.env.DATAVERSE_URL,
      dataverseClientId: process.env.DATAVERSE_CLIENT_ID,
      dataverseClientSecret: process.env.DATAVERSE_CLIENT_SECRET,

      // Azure AI Search config
      azureSearchEndpoint: process.env.AZURE_AI_SEARCH_ENDPOINT,
      azureSearchKey: process.env.AZURE_AI_SEARCH_KEY,
      azureSearchIndex: process.env.AZURE_AI_SEARCH_INDEX,

      // Copilot Studio config
      copilotStudioEndpoint: process.env.COPILOT_STUDIO_ENDPOINT,
      copilotStudioKey: process.env.COPILOT_STUDIO_KEY,

      // Azure Blob config
      azureBlobConnectionString: process.env.AZURE_BLOB_CONNECTION_STRING,
      azureBlobContainer: process.env.AZURE_BLOB_CONTAINER,
    };
  }

  // Default to personal/Claude environment
  return {
    type: 'personal',
    llmProvider: 'claude',
    storageProvider: 'local-fs',
    embeddingProvider: 'tfidf',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  };
}

/**
 * Get a human-readable description of the detected environment
 */
export function describeEnvironment(config: EnvironmentConfig): string {
  const parts = [
    `Environment: ${config.type}`,
    `LLM: ${config.llmProvider}`,
    `Storage: ${config.storageProvider}`,
    `Embedding: ${config.embeddingProvider}`,
  ];
  return parts.join(', ');
}

/**
 * Validate that required credentials are present for the configuration
 */
export function validateEnvironment(config: EnvironmentConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check LLM provider credentials
  if (config.llmProvider === 'claude' && !config.anthropicApiKey && !process.env.ANTHROPIC_API_KEY) {
    errors.push('ANTHROPIC_API_KEY is required for Claude LLM provider');
  }
  if (config.llmProvider === 'azure-openai') {
    if (!config.azureOpenAIEndpoint && !process.env.AZURE_OPENAI_ENDPOINT) {
      errors.push('AZURE_OPENAI_ENDPOINT is required for Azure OpenAI LLM provider');
    }
    if (!config.azureOpenAIKey && !process.env.AZURE_OPENAI_KEY) {
      errors.push('AZURE_OPENAI_KEY is required for Azure OpenAI LLM provider');
    }
  }
  if (config.llmProvider === 'copilot-studio') {
    if (!config.copilotStudioEndpoint && !process.env.COPILOT_STUDIO_ENDPOINT) {
      errors.push('COPILOT_STUDIO_ENDPOINT is required for Copilot Studio LLM provider');
    }
  }

  // Check storage provider credentials
  if (config.storageProvider === 'dataverse') {
    if (!config.dataverseUrl && !process.env.DATAVERSE_URL) {
      errors.push('DATAVERSE_URL is required for Dataverse storage provider');
    }
    if (!config.dataverseClientId && !process.env.DATAVERSE_CLIENT_ID) {
      errors.push('DATAVERSE_CLIENT_ID is required for Dataverse storage provider');
    }
    if (!config.dataverseClientSecret && !process.env.DATAVERSE_CLIENT_SECRET) {
      errors.push('DATAVERSE_CLIENT_SECRET is required for Dataverse storage provider');
    }
  }

  // Check embedding provider credentials
  if (config.embeddingProvider === 'azure-ai-search') {
    if (!config.azureSearchEndpoint && !process.env.AZURE_AI_SEARCH_ENDPOINT) {
      errors.push('AZURE_AI_SEARCH_ENDPOINT is required for Azure AI Search embedding provider');
    }
    if (!config.azureSearchKey && !process.env.AZURE_AI_SEARCH_KEY) {
      errors.push('AZURE_AI_SEARCH_KEY is required for Azure AI Search embedding provider');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default detectEnvironment;
