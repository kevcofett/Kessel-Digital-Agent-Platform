/**
 * Claude LLM Provider
 *
 * LLM provider implementation for personal/development environments
 * using the Anthropic Claude API.
 */
import { LLMProvider, LLMMessage, LLMOptions, LLMResponse } from './interfaces.js';
export declare class ClaudeLLMProvider implements LLMProvider {
    readonly name = "claude";
    private client;
    private defaultModel;
    constructor(apiKey?: string);
    /**
     * Get or create the Anthropic client
     */
    private getClient;
    /**
     * Initialize the provider
     */
    initialize(): Promise<void>;
    /**
     * Generate a response from Claude
     */
    generateResponse(systemPrompt: string, messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
    /**
     * Check if this provider supports tool use
     */
    supportsTools(): boolean;
    /**
     * Convert our message format to Anthropic's format
     */
    private convertMessage;
    /**
     * Convert our tool format to Anthropic's format
     */
    private convertTool;
    /**
     * Convert Anthropic response to our format
     */
    private convertResponse;
    /**
     * Set the default model
     */
    setDefaultModel(model: string): void;
    /**
     * Get the default model
     */
    getDefaultModel(): string;
}
export default ClaudeLLMProvider;
//# sourceMappingURL=claude-llm.d.ts.map