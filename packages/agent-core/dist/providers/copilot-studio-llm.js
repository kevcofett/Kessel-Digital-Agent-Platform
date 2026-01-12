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
import { ProviderConfigurationError } from './interfaces.js';
// ============================================================================
// COPILOT STUDIO LLM PROVIDER
// ============================================================================
export class CopilotStudioLLMProvider {
    name = 'copilot-studio';
    environmentUrl;
    botId;
    clientId;
    clientSecret;
    accessToken;
    tokenEndpoint;
    timeout;
    tokenExpiry;
    constructor(config) {
        // Handle both config types
        if ('botId' in config) {
            // CopilotStudioLLMConfig
            if (!config.environmentUrl) {
                throw new Error('Copilot Studio environment URL is required');
            }
            if (!config.botId) {
                throw new Error('Copilot Studio bot ID is required');
            }
            if (!config.tenantId) {
                throw new Error('Copilot Studio tenant ID is required');
            }
            this.environmentUrl = config.environmentUrl.replace(/\/$/, '');
            this.botId = config.botId;
            this.clientId = config.clientId || process.env.COPILOT_STUDIO_CLIENT_ID;
            this.clientSecret = config.clientSecret || process.env.COPILOT_STUDIO_CLIENT_SECRET;
            this.accessToken = config.accessToken;
            this.tokenEndpoint = config.tokenEndpoint ||
                `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
            this.timeout = config.timeout || 60000;
        }
        else {
            // EnvironmentConfig
            const missing = [];
            if (!config.copilotStudioEndpoint)
                missing.push('COPILOT_STUDIO_ENDPOINT');
            if (!config.copilotStudioKey)
                missing.push('COPILOT_STUDIO_KEY');
            if (missing.length > 0) {
                throw new ProviderConfigurationError('CopilotStudio', missing);
            }
            this.environmentUrl = config.copilotStudioEndpoint.replace(/\/$/, '');
            this.botId = 'default'; // Would need to be provided
            this.accessToken = config.copilotStudioKey;
            this.tokenEndpoint = '';
            this.timeout = 60000;
        }
    }
    /**
     * Initialize the provider
     */
    async initialize() {
        // Try to get access token to validate configuration
        await this.getAccessToken();
    }
    /**
     * Generate a response via Copilot Studio
     */
    async generateResponse(systemPrompt, messages, options) {
        const token = await this.getAccessToken();
        // Suppress unused parameter warnings
        void systemPrompt;
        void options;
        // Direct Line API endpoint for Copilot Studio
        const conversationUrl = `${this.environmentUrl}/powervirtualagents/botsbyschema/${this.botId}/directline/conversations`;
        // Start conversation
        const conversationResponse = await fetch(conversationUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(this.timeout),
        });
        if (!conversationResponse.ok) {
            const errorBody = await conversationResponse.text();
            throw new Error(`Copilot Studio conversation error: ${errorBody}`);
        }
        const conversationData = await conversationResponse.json();
        const conversationId = conversationData.conversationId;
        // Send message (combine all user messages into one)
        const userContent = messages
            .filter(m => m.role === 'user')
            .map(m => typeof m.content === 'string' ? m.content : this.extractTextFromBlocks(m.content))
            .join('\n');
        const activityUrl = `${this.environmentUrl}/powervirtualagents/botsbyschema/${this.botId}/directline/conversations/${conversationId}/activities`;
        const activityResponse = await fetch(activityUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'message',
                from: { id: 'user' },
                text: userContent,
            }),
            signal: AbortSignal.timeout(this.timeout),
        });
        if (!activityResponse.ok) {
            const errorBody = await activityResponse.text();
            throw new Error(`Copilot Studio activity error: ${errorBody}`);
        }
        // Poll for response
        const botResponse = await this.pollForResponse(conversationId, token);
        const content = [{
                type: 'text',
                text: botResponse,
            }];
        return {
            content,
            stopReason: 'end_turn',
            usage: {
                inputTokens: 0, // Not available from Copilot Studio
                outputTokens: 0,
            },
        };
    }
    /**
     * Check if this provider supports tool use
     *
     * IMPORTANT: Copilot Studio does NOT support native tool_use.
     * Use the ToolShim class to convert tool definitions to structured prompts.
     */
    supportsTools() {
        // Copilot Studio has its own action system, not standard tool_use
        return false;
    }
    // ==========================================================================
    // PRIVATE METHODS
    // ==========================================================================
    extractTextFromBlocks(blocks) {
        return blocks
            .filter((block) => block.type === 'text' && !!block.text)
            .map(block => block.text)
            .join('\n');
    }
    async getAccessToken() {
        // Return cached token if still valid
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }
        // If no client credentials, check for env var token
        if (!this.clientId || !this.clientSecret) {
            const envToken = process.env.COPILOT_STUDIO_ACCESS_TOKEN;
            if (envToken) {
                this.accessToken = envToken;
                return envToken;
            }
            // If we have a pre-configured access token, use it
            if (this.accessToken) {
                return this.accessToken;
            }
            throw new Error('Copilot Studio credentials not configured');
        }
        // Request new token
        const response = await fetch(this.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret,
                scope: `${this.environmentUrl}/.default`,
            }),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Token request failed: ${errorBody}`);
        }
        const tokenData = await response.json();
        this.accessToken = tokenData.access_token;
        // Set expiry with 5 minute buffer
        const expiresIn = (tokenData.expires_in || 3600) - 300;
        this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
        return this.accessToken;
    }
    async pollForResponse(conversationId, token, maxAttempts = 30, delayMs = 1000) {
        const activitiesUrl = `${this.environmentUrl}/powervirtualagents/botsbyschema/${this.botId}/directline/conversations/${conversationId}/activities`;
        let watermark;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const url = watermark
                ? `${activitiesUrl}?watermark=${watermark}`
                : activitiesUrl;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to poll activities: ${response.status}`);
            }
            const data = await response.json();
            watermark = data.watermark;
            // Find bot response
            const botActivity = data.activities?.find(a => a.from?.role === 'bot' && a.type === 'message' && a.text);
            if (botActivity?.text) {
                return botActivity.text;
            }
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        throw new Error('Timeout waiting for Copilot Studio response');
    }
}
// ============================================================================
// FACTORY FUNCTION
// ============================================================================
export function createCopilotStudioLLMProvider(config) {
    return new CopilotStudioLLMProvider(config);
}
export default CopilotStudioLLMProvider;
//# sourceMappingURL=copilot-studio-llm.js.map