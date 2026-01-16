/**
 * Azure OpenAI LLM Provider
 *
 * Provides LLM capabilities using Azure OpenAI deployments.
 * Used in corporate/Mastercard environments.
 */

import type {
  LLMProvider,
  LLMMessage,
  LLMOptions,
  LLMResponse,
  LLMContentBlock,
  EnvironmentConfig,
} from './interfaces.js';
import { ProviderConfigurationError } from './interfaces.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface AzureOpenAILLMConfig {
  /**
   * Azure OpenAI endpoint URL
   * e.g., https://your-resource.openai.azure.com
   */
  endpoint: string;

  /**
   * API key (falls back to AZURE_OPENAI_API_KEY env var)
   */
  apiKey?: string;

  /**
   * Deployment name for the chat model
   */
  deploymentName: string;

  /**
   * API version (default: 2024-02-01)
   */
  apiVersion?: string;

  /**
   * Default parameters for completions
   */
  defaultParams?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;

  /**
   * Maximum retry attempts
   */
  maxRetries?: number;
}

// ============================================================================
// AZURE OPENAI LLM PROVIDER
// ============================================================================

export class AzureOpenAILLMProvider implements LLMProvider {
  readonly name = 'azure-openai';

  private endpoint: string;
  private apiKey: string;
  private deploymentName: string;
  private apiVersion: string;
  private defaultParams: AzureOpenAILLMConfig['defaultParams'];
  private timeout: number;
  private maxRetries: number;

  constructor(config: AzureOpenAILLMConfig | EnvironmentConfig) {
    // Handle both config types
    if ('deploymentName' in config) {
      // AzureOpenAILLMConfig
      if (!config.endpoint) {
        throw new Error('Azure OpenAI endpoint is required');
      }
      if (!config.deploymentName) {
        throw new Error('Azure OpenAI deployment name is required');
      }

      this.endpoint = config.endpoint.replace(/\/$/, '');
      this.apiKey = config.apiKey || process.env.AZURE_OPENAI_API_KEY || '';
      this.deploymentName = config.deploymentName;
      this.apiVersion = config.apiVersion || '2024-02-01';
      this.defaultParams = config.defaultParams || {};
      this.timeout = config.timeout || 60000;
      this.maxRetries = config.maxRetries || 3;
    } else {
      // EnvironmentConfig
      const missing: string[] = [];
      if (!config.azureOpenAIEndpoint) missing.push('AZURE_OPENAI_ENDPOINT');
      if (!config.azureOpenAIKey) missing.push('AZURE_OPENAI_KEY');
      if (!config.azureOpenAIDeployment) missing.push('AZURE_OPENAI_DEPLOYMENT');

      if (missing.length > 0) {
        throw new ProviderConfigurationError('AzureOpenAI', missing);
      }

      this.endpoint = config.azureOpenAIEndpoint!.replace(/\/$/, '');
      this.apiKey = config.azureOpenAIKey || process.env.AZURE_OPENAI_API_KEY || '';
      this.deploymentName = config.azureOpenAIDeployment!;
      this.apiVersion = '2024-02-01';
      this.defaultParams = {};
      this.timeout = 60000;
      this.maxRetries = 3;
    }
  }

  /**
   * Initialize the provider
   */
  async initialize(): Promise<void> {
    // Validate configuration
    if (!this.apiKey) {
      throw new ProviderConfigurationError('AzureOpenAI', ['AZURE_OPENAI_API_KEY']);
    }
  }

  /**
   * Generate a response from Azure OpenAI
   */
  async generateResponse(
    systemPrompt: string,
    messages: LLMMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('Azure OpenAI API key not configured');
    }

    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;

    // Build messages array
    const apiMessages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    for (const msg of messages) {
      if (typeof msg.content === 'string') {
        apiMessages.push({ role: msg.role, content: msg.content });
      } else {
        // Handle content blocks - extract text
        const textContent = msg.content
          .filter((block): block is LLMContentBlock & { text: string } => block.type === 'text' && !!block.text)
          .map(block => block.text)
          .join('\n');
        if (textContent) {
          apiMessages.push({ role: msg.role, content: textContent });
        }
      }
    }

    // Build request body
    const body: Record<string, unknown> = {
      messages: apiMessages,
      temperature: options?.temperature ?? this.defaultParams?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? this.defaultParams?.maxTokens ?? 4096,
    };

    // Add tools if provided
    if (options?.tools && options.tools.length > 0) {
      body.tools = options.tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.input_schema,
        },
      }));
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(this.timeout),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Azure OpenAI API error ${response.status}: ${errorBody}`);
        }

        const data = await response.json() as AzureOpenAIChatResponse;

        return this.convertResponse(data);

      } catch (error) {
        lastError = error as Error;

        // Don't retry on auth errors
        if (lastError.message.includes('401') || lastError.message.includes('403')) {
          throw lastError;
        }

        // Exponential backoff
        if (attempt < this.maxRetries - 1) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error('Failed to get completion after retries');
  }

  /**
   * Check if this provider supports tool use
   */
  supportsTools(): boolean {
    return true;
  }

  /**
   * Convert Azure OpenAI response to our format
   */
  private convertResponse(data: AzureOpenAIChatResponse): LLMResponse {
    const choice = data.choices[0];
    const content: LLMContentBlock[] = [];

    // Add text content if present
    if (choice.message.content) {
      content.push({
        type: 'text',
        text: choice.message.content,
      });
    }

    // Add tool calls if present
    if (choice.message.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        content.push({
          type: 'tool_use',
          id: toolCall.id,
          name: toolCall.function.name,
          input: JSON.parse(toolCall.function.arguments),
        });
      }
    }

    // Determine stop reason
    let stopReason: LLMResponse['stopReason'] = 'end_turn';
    if (choice.finish_reason === 'tool_calls') {
      stopReason = 'tool_use';
    } else if (choice.finish_reason === 'length') {
      stopReason = 'max_tokens';
    }

    return {
      content,
      stopReason,
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
      },
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface AzureOpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createAzureOpenAILLMProvider(
  config: AzureOpenAILLMConfig
): AzureOpenAILLMProvider {
  return new AzureOpenAILLMProvider(config);
}

export default AzureOpenAILLMProvider;
