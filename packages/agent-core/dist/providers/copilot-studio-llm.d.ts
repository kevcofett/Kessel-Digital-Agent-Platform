/**
 * Copilot Studio LLM Provider
 *
 * Provides LLM capabilities through Microsoft Copilot Studio.
 * Used when the agent is deployed within Copilot Studio environment.
 *
 * NOTE: This provider acts as a bridge - in production, Copilot Studio
 * handles the LLM calls. This provider is for evaluation/testing scenarios
 * where we need to simulate Copilot Studio responses.
 *
 * IMPORTANT: Copilot Studio does NOT support native tool_use.
 * Use the ToolShim class to convert tool definitions to structured prompts.
 */
import type { LLMProvider, LLMMessage, LLMOptions, LLMResponse, EnvironmentConfig } from './interfaces.js';
export interface CopilotStudioLLMConfig {
    /**
     * Copilot Studio environment URL
     */
    environmentUrl: string;
    /**
     * Bot/Agent identifier
     */
    botId: string;
    /**
     * Tenant ID for authentication
     */
    tenantId: string;
    /**
     * Client ID for authentication
     */
    clientId?: string;
    /**
     * Client secret for authentication
     */
    clientSecret?: string;
    /**
     * Access token (if already obtained)
     */
    accessToken?: string;
    /**
     * Token endpoint for OAuth
     */
    tokenEndpoint?: string;
    /**
     * Request timeout in milliseconds
     */
    timeout?: number;
}
export declare class CopilotStudioLLMProvider implements LLMProvider {
    readonly name = "copilot-studio";
    private environmentUrl;
    private botId;
    private clientId?;
    private clientSecret?;
    private accessToken?;
    private tokenEndpoint;
    private timeout;
    private tokenExpiry?;
    constructor(config: CopilotStudioLLMConfig | EnvironmentConfig);
    /**
     * Initialize the provider
     */
    initialize(): Promise<void>;
    /**
     * Generate a response via Copilot Studio
     */
    generateResponse(systemPrompt: string, messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
    /**
     * Check if this provider supports tool use
     *
     * IMPORTANT: Copilot Studio does NOT support native tool_use.
     * Use the ToolShim class to convert tool definitions to structured prompts.
     */
    supportsTools(): boolean;
    private extractTextFromBlocks;
    private getAccessToken;
    private pollForResponse;
}
export declare function createCopilotStudioLLMProvider(config: CopilotStudioLLMConfig): CopilotStudioLLMProvider;
export default CopilotStudioLLMProvider;
//# sourceMappingURL=copilot-studio-llm.d.ts.map