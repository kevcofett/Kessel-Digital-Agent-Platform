/**
 * Copilot Studio LLM Provider (Stub)
 *
 * LLM provider implementation for corporate environments using
 * Microsoft Copilot Studio (formerly Power Virtual Agents).
 *
 * This is a stub for future Microsoft integration.
 *
 * When implemented, this will use the Copilot Studio Conversational Actions API
 * or Direct Line API for bot interactions.
 */
import { LLMProvider, LLMMessage, LLMOptions, LLMResponse, EnvironmentConfig } from './interfaces.js';
export declare class CopilotStudioLLMProvider implements LLMProvider {
    readonly name = "copilot-studio";
    private endpoint;
    private apiKey;
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
     * Generate a response from Copilot Studio
     */
    generateResponse(systemPrompt: string, messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
    /**
     * Check if this provider supports tool use
     */
    supportsTools(): boolean;
}
export default CopilotStudioLLMProvider;
//# sourceMappingURL=copilot-studio-llm.d.ts.map