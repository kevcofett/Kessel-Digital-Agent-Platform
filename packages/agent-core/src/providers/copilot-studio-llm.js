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
 *
 * IMPORTANT: Copilot Studio does NOT support native tool_use.
 * Use the ToolShim class to convert tool definitions to structured prompts.
 */
import { ProviderNotImplementedError, ProviderConfigurationError, } from './interfaces.js';
export class CopilotStudioLLMProvider {
    name = 'copilot-studio';
    endpoint;
    apiKey;
    constructor(config) {
        this.endpoint = config?.copilotStudioEndpoint || process.env.COPILOT_STUDIO_ENDPOINT;
        this.apiKey = config?.copilotStudioKey || process.env.COPILOT_STUDIO_KEY;
    }
    /**
     * Validate configuration
     */
    validateConfig() {
        const missing = [];
        if (!this.endpoint)
            missing.push('COPILOT_STUDIO_ENDPOINT');
        if (!this.apiKey)
            missing.push('COPILOT_STUDIO_KEY');
        if (missing.length > 0) {
            throw new ProviderConfigurationError('CopilotStudio', missing);
        }
    }
    /**
     * Initialize the provider
     */
    async initialize() {
        this.validateConfig();
        // TODO: Implement Copilot Studio initialization
        // This would typically:
        // 1. Establish Direct Line connection
        // 2. Start a conversation session
        // 3. Validate authentication
    }
    /**
     * Generate a response from Copilot Studio
     */
    async generateResponse(systemPrompt, messages, options) {
        this.validateConfig();
        // Suppress unused parameter warnings in stub
        void systemPrompt;
        void messages;
        void options;
        // TODO: Implement Copilot Studio conversation
        // This would:
        // 1. Send messages to Copilot Studio bot
        // 2. Poll for responses or use WebSocket
        // 3. Handle adaptive cards and other response types
        // 4. Convert response to our format
        throw new ProviderNotImplementedError('LLM', 'copilot-studio');
        /*
        Example implementation outline using Direct Line API:
    
        // Start conversation or reuse existing
        const conversation = await this.getOrCreateConversation();
    
        // Send activity
        await fetch(`${this.endpoint}/conversations/${conversation.id}/activities`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'message',
            from: { id: 'user' },
            text: messages[messages.length - 1].content,
          }),
        });
    
        // Poll for bot response
        const activities = await this.pollForResponse(conversation.id);
        return this.convertActivitiesToResponse(activities);
        */
    }
    /**
     * Check if this provider supports tool use
     *
     * IMPORTANT: Copilot Studio does NOT support native tool_use.
     * Use the ToolShim class to convert tool definitions to structured prompts.
     */
    supportsTools() {
        // Copilot Studio has its own action system, not standard tool_use
        // Custom actions would need to be configured in the bot
        return false;
    }
}
export default CopilotStudioLLMProvider;
//# sourceMappingURL=copilot-studio-llm.js.map