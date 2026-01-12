/**
 * Azure OpenAI LLM Provider
 *
 * Provides LLM capabilities using Azure OpenAI deployments.
 * Used in corporate/Mastercard environments.
 */
import type { LLMProvider, LLMMessage, LLMOptions, LLMResponse, EnvironmentConfig } from './interfaces.js';
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
export declare class AzureOpenAILLMProvider implements LLMProvider {
    readonly name = "azure-openai";
    private endpoint;
    private apiKey;
    private deploymentName;
    private apiVersion;
    private defaultParams;
    private timeout;
    private maxRetries;
    constructor(config: AzureOpenAILLMConfig | EnvironmentConfig);
    /**
     * Initialize the provider
     */
    initialize(): Promise<void>;
    /**
     * Generate a response from Azure OpenAI
     */
    generateResponse(systemPrompt: string, messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
    /**
     * Check if this provider supports tool use
     */
    supportsTools(): boolean;
    /**
     * Convert Azure OpenAI response to our format
     */
    private convertResponse;
    private sleep;
}
export declare function createAzureOpenAILLMProvider(config: AzureOpenAILLMConfig): AzureOpenAILLMProvider;
export default AzureOpenAILLMProvider;
//# sourceMappingURL=azure-openai-llm.d.ts.map