/**
 * Claude LLM Provider
 *
 * LLM provider implementation for personal/development environments
 * using the Anthropic Claude API.
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  LLMProvider,
  LLMMessage,
  LLMOptions,
  LLMResponse,
  LLMContentBlock,
  LLMToolDefinition,
  ProviderConfigurationError,
} from './interfaces.js';

export class ClaudeLLMProvider implements LLMProvider {
  readonly name = 'claude';

  private client: Anthropic | null = null;
  private defaultModel: string = 'claude-sonnet-4-20250514';

  constructor(apiKey?: string) {
    // Lazy initialization - will create client on first use
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  /**
   * Get or create the Anthropic client
   */
  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new ProviderConfigurationError('Claude', ['ANTHROPIC_API_KEY']);
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  /**
   * Initialize the provider
   */
  async initialize(): Promise<void> {
    // Ensure we can create the client (validates API key exists)
    this.getClient();
  }

  /**
   * Generate a response from Claude
   */
  async generateResponse(
    systemPrompt: string,
    messages: LLMMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const client = this.getClient();

    // Convert our message format to Anthropic's format
    const anthropicMessages = messages.map(msg => this.convertMessage(msg));

    // Build request parameters
    const requestParams: Anthropic.MessageCreateParams = {
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens || 1024,
      temperature: options?.temperature ?? 0.7,
      system: systemPrompt,
      messages: anthropicMessages,
    };

    // Add tools if provided
    if (options?.tools && options.tools.length > 0) {
      requestParams.tools = options.tools.map(tool => this.convertTool(tool));
    }

    // Make the API call
    const response = await client.messages.create(requestParams);

    // Convert response to our format
    return this.convertResponse(response);
  }

  /**
   * Check if this provider supports tool use
   */
  supportsTools(): boolean {
    return true;
  }

  /**
   * Convert our message format to Anthropic's format
   */
  private convertMessage(msg: LLMMessage): Anthropic.MessageParam {
    if (typeof msg.content === 'string') {
      return {
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      };
    }

    // Handle content blocks - build manually with proper types
    const contentBlocks: (Anthropic.TextBlockParam | Anthropic.ToolUseBlockParam | Anthropic.ToolResultBlockParam)[] = [];

    for (const block of msg.content) {
      if (block.type === 'text') {
        contentBlocks.push({ type: 'text' as const, text: block.text || '' });
      } else if (block.type === 'tool_use') {
        contentBlocks.push({
          type: 'tool_use' as const,
          id: block.id || '',
          name: block.name || '',
          input: block.input || {},
        });
      } else if (block.type === 'tool_result') {
        contentBlocks.push({
          type: 'tool_result' as const,
          tool_use_id: block.tool_use_id || '',
          content: block.content || '',
        });
      }
    }

    if (contentBlocks.length === 0) {
      contentBlocks.push({ type: 'text' as const, text: '' });
    }

    return {
      role: msg.role as 'user' | 'assistant',
      content: contentBlocks,
    };
  }

  /**
   * Convert our tool format to Anthropic's format
   */
  private convertTool(tool: LLMToolDefinition): Anthropic.Tool {
    return {
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema as Anthropic.Tool.InputSchema,
    };
  }

  /**
   * Convert Anthropic response to our format
   */
  private convertResponse(response: Anthropic.Message): LLMResponse {
    const content: LLMContentBlock[] = response.content.map(block => {
      if (block.type === 'text') {
        return { type: 'text' as const, text: block.text };
      } else if (block.type === 'tool_use') {
        return {
          type: 'tool_use' as const,
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        };
      }
      return { type: 'text' as const, text: '' };
    });

    let stopReason: 'end_turn' | 'tool_use' | 'max_tokens' = 'end_turn';
    if (response.stop_reason === 'tool_use') {
      stopReason = 'tool_use';
    } else if (response.stop_reason === 'max_tokens') {
      stopReason = 'max_tokens';
    }

    return {
      content,
      stopReason,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  /**
   * Set the default model
   */
  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }

  /**
   * Get the default model
   */
  getDefaultModel(): string {
    return this.defaultModel;
  }
}

export default ClaudeLLMProvider;
