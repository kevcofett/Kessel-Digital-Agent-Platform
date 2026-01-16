/**
 * Azure OpenAI LLM Provider (Stub)
 *
 * LLM provider implementation for corporate/Azure environments.
 * This is a stub for future Microsoft integration.
 *
 * When implemented, this will use the Azure OpenAI Service API.
 */
import { LLMProvider, LLMMessage, LLMOptions, LLMResponse, EnvironmentConfig } from './interfaces.js';
export declare class AzureOpenAILLMProvider implements LLMProvider {
    readonly name = "azure-openai";
    private endpoint;
    private apiKey;
    private deployment;
    constructor(config?: EnvironmentConfig);
    /**
     * Validate configuration
     */
    private validateConfig;
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
}
export default AzureOpenAILLMProvider;
//# sourceMappingURL=azure-openai-llm.d.ts.map