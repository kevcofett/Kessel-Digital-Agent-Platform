/**
 * Claude LLM Provider
 *
 * LLM provider implementation for personal/development environments
 * using the Anthropic Claude API.
 */
import Anthropic from '@anthropic-ai/sdk';
import { ProviderConfigurationError, } from './interfaces.js';
export class ClaudeLLMProvider {
    name = 'claude';
    client = null;
    defaultModel = 'claude-sonnet-4-20250514';
    constructor(apiKey) {
        // Lazy initialization - will create client on first use
        if (apiKey) {
            this.client = new Anthropic({ apiKey });
        }
    }
    /**
     * Get or create the Anthropic client
     */
    getClient() {
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
    async initialize() {
        // Ensure we can create the client (validates API key exists)
        this.getClient();
    }
    /**
     * Generate a response from Claude
     */
    async generateResponse(systemPrompt, messages, options) {
        const client = this.getClient();
        // Convert our message format to Anthropic's format
        const anthropicMessages = messages.map(msg => this.convertMessage(msg));
        // Build request parameters
        const requestParams = {
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
    supportsTools() {
        return true;
    }
    /**
     * Convert our message format to Anthropic's format
     */
    convertMessage(msg) {
        if (typeof msg.content === 'string') {
            return {
                role: msg.role,
                content: msg.content,
            };
        }
        // Handle content blocks - build manually with proper types
        const contentBlocks = [];
        for (const block of msg.content) {
            if (block.type === 'text') {
                contentBlocks.push({ type: 'text', text: block.text || '' });
            }
            else if (block.type === 'tool_use') {
                contentBlocks.push({
                    type: 'tool_use',
                    id: block.id || '',
                    name: block.name || '',
                    input: block.input || {},
                });
            }
            else if (block.type === 'tool_result') {
                contentBlocks.push({
                    type: 'tool_result',
                    tool_use_id: block.tool_use_id || '',
                    content: block.content || '',
                });
            }
        }
        if (contentBlocks.length === 0) {
            contentBlocks.push({ type: 'text', text: '' });
        }
        return {
            role: msg.role,
            content: contentBlocks,
        };
    }
    /**
     * Convert our tool format to Anthropic's format
     */
    convertTool(tool) {
        return {
            name: tool.name,
            description: tool.description,
            input_schema: tool.input_schema,
        };
    }
    /**
     * Convert Anthropic response to our format
     */
    convertResponse(response) {
        const content = response.content.map(block => {
            if (block.type === 'text') {
                return { type: 'text', text: block.text };
            }
            else if (block.type === 'tool_use') {
                return {
                    type: 'tool_use',
                    id: block.id,
                    name: block.name,
                    input: block.input,
                };
            }
            return { type: 'text', text: '' };
        });
        let stopReason = 'end_turn';
        if (response.stop_reason === 'tool_use') {
            stopReason = 'tool_use';
        }
        else if (response.stop_reason === 'max_tokens') {
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
    setDefaultModel(model) {
        this.defaultModel = model;
    }
    /**
     * Get the default model
     */
    getDefaultModel() {
        return this.defaultModel;
    }
}
export default ClaudeLLMProvider;
//# sourceMappingURL=claude-llm.js.map