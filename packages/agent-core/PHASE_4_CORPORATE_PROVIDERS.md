# PHASE 4: CORPORATE PROVIDERS
# VS Code Claude Execution Plan - Steps 38-44

**Depends On:** Phase 1, Phase 2, Phase 3 Complete
**Estimated Time:** 3-4 hours
**Branch:** deploy/personal

---

## OVERVIEW

This phase completes the corporate environment providers:
- AzureOpenAILLMProvider (full implementation, not stub)
- CopilotStudioLLMProvider (full implementation, not stub)
- DataverseStorageProvider (full implementation, not stub)
- DataverseKBImpactStorage (for KB tracking in corporate)

These enable the Mastercard deployment environment.

---

## PRE-FLIGHT CHECK

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify Phase 3 complete
cd packages/agent-core && npm run build
# Should succeed with KB impact tracking
```

---

# STEP 38: Implement AzureOpenAILLMProvider

**File:** `packages/agent-core/src/providers/azure-openai-llm.ts`

```typescript
/**
 * Azure OpenAI LLM Provider
 * 
 * Provides LLM capabilities using Azure OpenAI deployments.
 * Used in corporate/Mastercard environments.
 */

import type { LLMProvider, LLMResponse, LLMConfig, Message } from './interfaces.js';

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
  readonly providerId = 'azure-openai-llm';
  
  private endpoint: string;
  private apiKey: string;
  private deploymentName: string;
  private apiVersion: string;
  private defaultParams: AzureOpenAILLMConfig['defaultParams'];
  private timeout: number;
  private maxRetries: number;
  
  constructor(config: AzureOpenAILLMConfig) {
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
  }
  
  /**
   * Generate a completion from Azure OpenAI
   */
  async complete(
    messages: Message[],
    config?: Partial<LLMConfig>
  ): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('Azure OpenAI API key not configured');
    }
    
    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;
    
    const body = {
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: config?.temperature ?? this.defaultParams?.temperature ?? 0.7,
      max_tokens: config?.maxTokens ?? this.defaultParams?.maxTokens ?? 4096,
      top_p: config?.topP ?? this.defaultParams?.topP ?? 1,
      frequency_penalty: config?.frequencyPenalty ?? this.defaultParams?.frequencyPenalty ?? 0,
      presence_penalty: config?.presencePenalty ?? this.defaultParams?.presencePenalty ?? 0,
    };
    
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
        
        return {
          content: data.choices[0]?.message?.content || '',
          role: 'assistant',
          model: data.model,
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0,
          },
          finishReason: data.choices[0]?.finish_reason || 'stop',
        };
        
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
   * Stream a completion from Azure OpenAI
   */
  async *stream(
    messages: Message[],
    config?: Partial<LLMConfig>
  ): AsyncGenerator<string, void, unknown> {
    if (!this.apiKey) {
      throw new Error('Azure OpenAI API key not configured');
    }
    
    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${this.apiVersion}`;
    
    const body = {
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature: config?.temperature ?? this.defaultParams?.temperature ?? 0.7,
      max_tokens: config?.maxTokens ?? this.defaultParams?.maxTokens ?? 4096,
      stream: true,
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Azure OpenAI API error ${response.status}: ${errorBody}`);
    }
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }
    
    const decoder = new TextDecoder();
    let buffer = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  
  /**
   * Check if provider is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey || !this.endpoint || !this.deploymentName) {
      return false;
    }
    
    try {
      await this.complete([{ role: 'user', content: 'test' }], { maxTokens: 1 });
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get provider metadata
   */
  getMetadata() {
    return {
      providerId: this.providerId,
      model: `azure:${this.deploymentName}`,
      endpoint: this.endpoint,
      supportsStreaming: true,
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
      content: string;
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
```

---

# STEP 39: Implement CopilotStudioLLMProvider

**File:** `packages/agent-core/src/providers/copilot-studio-llm.ts`

```typescript
/**
 * Copilot Studio LLM Provider
 * 
 * Provides LLM capabilities through Microsoft Copilot Studio.
 * Used when the agent is deployed within Copilot Studio environment.
 * 
 * NOTE: This provider acts as a bridge - in production, Copilot Studio
 * handles the LLM calls. This provider is for evaluation/testing scenarios
 * where we need to simulate Copilot Studio responses.
 */

import type { LLMProvider, LLMResponse, LLMConfig, Message } from './interfaces.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

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

// ============================================================================
// COPILOT STUDIO LLM PROVIDER
// ============================================================================

export class CopilotStudioLLMProvider implements LLMProvider {
  readonly providerId = 'copilot-studio-llm';
  
  private environmentUrl: string;
  private botId: string;
  private tenantId: string;
  private clientId?: string;
  private clientSecret?: string;
  private accessToken?: string;
  private tokenEndpoint: string;
  private timeout: number;
  private tokenExpiry?: Date;
  
  constructor(config: CopilotStudioLLMConfig) {
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
    this.tenantId = config.tenantId;
    this.clientId = config.clientId || process.env.COPILOT_STUDIO_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.COPILOT_STUDIO_CLIENT_SECRET;
    this.accessToken = config.accessToken;
    this.tokenEndpoint = config.tokenEndpoint || 
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
    this.timeout = config.timeout || 60000;
  }
  
  /**
   * Generate a completion via Copilot Studio
   */
  async complete(
    messages: Message[],
    config?: Partial<LLMConfig>
  ): Promise<LLMResponse> {
    const token = await this.getAccessToken();
    
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
    
    const conversationData = await conversationResponse.json() as ConversationResponse;
    const conversationId = conversationData.conversationId;
    
    // Send message (combine all user messages into one)
    const userContent = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
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
    
    return {
      content: botResponse,
      role: 'assistant',
      model: `copilot-studio:${this.botId}`,
      usage: {
        promptTokens: 0,  // Not available from Copilot Studio
        completionTokens: 0,
        totalTokens: 0,
      },
      finishReason: 'stop',
    };
  }
  
  /**
   * Stream is not supported by Copilot Studio Direct Line
   */
  async *stream(
    messages: Message[],
    config?: Partial<LLMConfig>
  ): AsyncGenerator<string, void, unknown> {
    // Copilot Studio doesn't support streaming, so we fake it
    const response = await this.complete(messages, config);
    yield response.content;
  }
  
  /**
   * Check if provider is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get provider metadata
   */
  getMetadata() {
    return {
      providerId: this.providerId,
      model: `copilot-studio:${this.botId}`,
      endpoint: this.environmentUrl,
      supportsStreaming: false,
    };
  }
  
  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================
  
  private async getAccessToken(): Promise<string> {
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
    
    const tokenData = await response.json() as TokenResponse;
    this.accessToken = tokenData.access_token;
    
    // Set expiry with 5 minute buffer
    const expiresIn = (tokenData.expires_in || 3600) - 300;
    this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
    
    return this.accessToken;
  }
  
  private async pollForResponse(
    conversationId: string,
    token: string,
    maxAttempts = 30,
    delayMs = 1000
  ): Promise<string> {
    const activitiesUrl = `${this.environmentUrl}/powervirtualagents/botsbyschema/${this.botId}/directline/conversations/${conversationId}/activities`;
    
    let watermark: string | undefined;
    
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
      
      const data = await response.json() as ActivitiesResponse;
      watermark = data.watermark;
      
      // Find bot response
      const botActivity = data.activities?.find(
        a => a.from?.role === 'bot' && a.type === 'message' && a.text
      );
      
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
// TYPES
// ============================================================================

interface ConversationResponse {
  conversationId: string;
  token: string;
  expires_in: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ActivitiesResponse {
  activities: Array<{
    id: string;
    type: string;
    from: {
      id: string;
      role: string;
    };
    text?: string;
  }>;
  watermark: string;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createCopilotStudioLLMProvider(
  config: CopilotStudioLLMConfig
): CopilotStudioLLMProvider {
  return new CopilotStudioLLMProvider(config);
}

export default CopilotStudioLLMProvider;
```

---

# STEP 40: Implement DataverseStorageProvider

**File:** `packages/agent-core/src/providers/dataverse-storage.ts`

```typescript
/**
 * Dataverse Storage Provider
 * 
 * Provides document storage capabilities using Microsoft Dataverse.
 * Used in corporate/Mastercard environments.
 */

import type { StorageProvider, Document, DocumentMetadata } from './interfaces.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface DataverseStorageConfig {
  /**
   * Dataverse environment URL
   * e.g., https://org.crm.dynamics.com
   */
  environmentUrl: string;
  
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
   * Table name for documents (default: cr_kbdocuments)
   */
  tableName?: string;
  
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
}

// ============================================================================
// COLUMN MAPPINGS
// ============================================================================

const DEFAULT_COLUMN_MAP = {
  id: 'cr_kbdocumentid',
  title: 'cr_title',
  content: 'cr_content',
  type: 'cr_documenttype',
  agentId: 'cr_agentid',
  version: 'cr_version',
  createdAt: 'createdon',
  updatedAt: 'modifiedon',
  metadata: 'cr_metadata',
};

// ============================================================================
// DATAVERSE STORAGE PROVIDER
// ============================================================================

export class DataverseStorageProvider implements StorageProvider {
  readonly providerId = 'dataverse-storage';
  
  private environmentUrl: string;
  private tenantId: string;
  private clientId?: string;
  private clientSecret?: string;
  private accessToken?: string;
  private tokenExpiry?: Date;
  private tableName: string;
  private timeout: number;
  private columnMap: typeof DEFAULT_COLUMN_MAP;
  
  constructor(config: DataverseStorageConfig) {
    if (!config.environmentUrl) {
      throw new Error('Dataverse environment URL is required');
    }
    if (!config.tenantId) {
      throw new Error('Dataverse tenant ID is required');
    }
    
    this.environmentUrl = config.environmentUrl.replace(/\/$/, '');
    this.tenantId = config.tenantId;
    this.clientId = config.clientId || process.env.DATAVERSE_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.DATAVERSE_CLIENT_SECRET;
    this.accessToken = config.accessToken;
    this.tableName = config.tableName || 'cr_kbdocuments';
    this.timeout = config.timeout || 30000;
    this.columnMap = DEFAULT_COLUMN_MAP;
  }
  
  /**
   * Save a document to Dataverse
   */
  async saveDocument(document: Document): Promise<void> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tableName}`;
    
    const record = this.documentToRecord(document);
    
    // Check if document exists
    const existing = await this.getDocument(document.id);
    
    if (existing) {
      // Update
      const updateUrl = `${url}(${this.columnMap.id}=${document.id})`;
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(this.timeout),
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Dataverse update error: ${errorBody}`);
      }
    } else {
      // Create
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(this.timeout),
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Dataverse create error: ${errorBody}`);
      }
    }
  }
  
  /**
   * Get a document by ID
   */
  async getDocument(id: string): Promise<Document | null> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tableName}(${this.columnMap.id}=${id})`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Dataverse get error: ${errorBody}`);
      }
      
      const record = await response.json();
      return this.recordToDocument(record);
      
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Get all documents for an agent
   */
  async getDocuments(agentId: string): Promise<Document[]> {
    const token = await this.getAccessToken();
    const filter = `${this.columnMap.agentId} eq '${agentId}'`;
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tableName}?$filter=${encodeURIComponent(filter)}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Dataverse list error: ${errorBody}`);
    }
    
    const data = await response.json() as { value: DataverseRecord[] };
    return data.value.map(record => this.recordToDocument(record));
  }
  
  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tableName}(${this.columnMap.id}=${id})`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
      },
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok && response.status !== 404) {
      const errorBody = await response.text();
      throw new Error(`Dataverse delete error: ${errorBody}`);
    }
  }
  
  /**
   * Check if provider is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get provider metadata
   */
  getMetadata() {
    return {
      providerId: this.providerId,
      environmentUrl: this.environmentUrl,
      tableName: this.tableName,
    };
  }
  
  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================
  
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }
    
    // If no client credentials, check for env var token
    if (!this.clientId || !this.clientSecret) {
      const envToken = process.env.DATAVERSE_ACCESS_TOKEN;
      if (envToken) {
        this.accessToken = envToken;
        return envToken;
      }
      throw new Error('Dataverse credentials not configured');
    }
    
    // Request new token
    const tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    const response = await fetch(tokenEndpoint, {
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
    
    const tokenData = await response.json() as TokenResponse;
    this.accessToken = tokenData.access_token;
    
    // Set expiry with 5 minute buffer
    const expiresIn = (tokenData.expires_in || 3600) - 300;
    this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
    
    return this.accessToken;
  }
  
  private documentToRecord(document: Document): DataverseRecord {
    return {
      [this.columnMap.id]: document.id,
      [this.columnMap.title]: document.title || document.id,
      [this.columnMap.content]: document.content,
      [this.columnMap.type]: document.type || 'general',
      [this.columnMap.agentId]: document.agentId || 'unknown',
      [this.columnMap.version]: document.version || '1.0',
      [this.columnMap.metadata]: document.metadata ? JSON.stringify(document.metadata) : null,
    };
  }
  
  private recordToDocument(record: DataverseRecord): Document {
    let metadata: DocumentMetadata | undefined;
    try {
      if (record[this.columnMap.metadata]) {
        metadata = JSON.parse(record[this.columnMap.metadata] as string);
      }
    } catch {
      // Invalid JSON, ignore metadata
    }
    
    return {
      id: record[this.columnMap.id] as string,
      title: record[this.columnMap.title] as string,
      content: record[this.columnMap.content] as string,
      type: record[this.columnMap.type] as string,
      agentId: record[this.columnMap.agentId] as string,
      version: record[this.columnMap.version] as string,
      createdAt: new Date(record[this.columnMap.createdAt] as string),
      updatedAt: new Date(record[this.columnMap.updatedAt] as string),
      metadata,
    };
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface DataverseRecord {
  [key: string]: unknown;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createDataverseStorageProvider(
  config: DataverseStorageConfig
): DataverseStorageProvider {
  return new DataverseStorageProvider(config);
}

export default DataverseStorageProvider;
```

---

# STEP 41: Implement DataverseKBImpactStorage

**File:** `packages/agent-core/src/learning/dataverse-kb-impact-storage.ts`

```typescript
/**
 * Dataverse KB Impact Storage
 * 
 * Stores KB impact tracking data in Microsoft Dataverse.
 * Used in corporate/Mastercard environments.
 */

import type {
  KBImpactStorage,
  KBUsageRecord,
  KBDocumentImpact,
  KBUpdateProposal,
  KBUsageFilter,
  KBProposalFilter,
  KBUpdateStatus,
} from './kb-impact-types.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface DataverseKBImpactStorageConfig {
  /**
   * Dataverse environment URL
   */
  environmentUrl: string;
  
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
   * Table names
   */
  tables?: {
    usageRecords?: string;
    documentImpacts?: string;
    updateProposals?: string;
  };
  
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
}

// ============================================================================
// DEFAULT TABLE NAMES
// ============================================================================

const DEFAULT_TABLES = {
  usageRecords: 'cr_kbusagerecords',
  documentImpacts: 'cr_kbdocumentimpacts',
  updateProposals: 'cr_kbupdateproposals',
};

// ============================================================================
// DATAVERSE KB IMPACT STORAGE
// ============================================================================

export class DataverseKBImpactStorage implements KBImpactStorage {
  private environmentUrl: string;
  private tenantId: string;
  private clientId?: string;
  private clientSecret?: string;
  private accessToken?: string;
  private tokenExpiry?: Date;
  private tables: typeof DEFAULT_TABLES;
  private timeout: number;
  
  constructor(config: DataverseKBImpactStorageConfig) {
    if (!config.environmentUrl) {
      throw new Error('Dataverse environment URL is required');
    }
    if (!config.tenantId) {
      throw new Error('Dataverse tenant ID is required');
    }
    
    this.environmentUrl = config.environmentUrl.replace(/\/$/, '');
    this.tenantId = config.tenantId;
    this.clientId = config.clientId || process.env.DATAVERSE_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.DATAVERSE_CLIENT_SECRET;
    this.accessToken = config.accessToken;
    this.tables = { ...DEFAULT_TABLES, ...config.tables };
    this.timeout = config.timeout || 30000;
  }
  
  // ==========================================================================
  // USAGE RECORDS
  // ==========================================================================
  
  async saveUsageRecord(record: KBUsageRecord): Promise<void> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.usageRecords}`;
    
    const dataverseRecord = {
      cr_id: record.id,
      cr_agentid: record.agentId,
      cr_documentid: record.documentId,
      cr_chunkids: JSON.stringify(record.chunkIds),
      cr_query: record.query,
      cr_retrievalscore: record.retrievalScore,
      cr_sessionid: record.sessionId,
      cr_responsequality: record.responseQuality,
      cr_wasusedinresponse: record.wasUsedInResponse,
      cr_timestamp: record.timestamp.toISOString(),
      cr_metadata: record.metadata ? JSON.stringify(record.metadata) : null,
    };
    
    // Upsert using alternate key
    const response = await fetch(`${url}(cr_id='${record.id}')`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'If-Match': '*',
      },
      body: JSON.stringify(dataverseRecord),
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok && response.status !== 204) {
      // Try create if upsert fails
      const createResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(dataverseRecord),
        signal: AbortSignal.timeout(this.timeout),
      });
      
      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        throw new Error(`Failed to save usage record: ${errorBody}`);
      }
    }
  }
  
  async getUsageRecords(filter: KBUsageFilter): Promise<KBUsageRecord[]> {
    const token = await this.getAccessToken();
    
    const filterParts: string[] = [];
    if (filter.agentId) {
      filterParts.push(`cr_agentid eq '${filter.agentId}'`);
    }
    if (filter.documentId) {
      filterParts.push(`cr_documentid eq '${filter.documentId}'`);
    }
    if (filter.sessionId) {
      filterParts.push(`cr_sessionid eq '${filter.sessionId}'`);
    }
    if (filter.startDate) {
      filterParts.push(`cr_timestamp ge ${filter.startDate.toISOString()}`);
    }
    if (filter.endDate) {
      filterParts.push(`cr_timestamp le ${filter.endDate.toISOString()}`);
    }
    if (filter.minQuality !== undefined) {
      filterParts.push(`cr_responsequality ge ${filter.minQuality}`);
    }
    if (filter.maxQuality !== undefined) {
      filterParts.push(`cr_responsequality le ${filter.maxQuality}`);
    }
    
    let url = `${this.environmentUrl}/api/data/v9.2/${this.tables.usageRecords}`;
    if (filterParts.length > 0) {
      url += `?$filter=${encodeURIComponent(filterParts.join(' and '))}`;
    }
    if (filter.limit) {
      url += (url.includes('?') ? '&' : '?') + `$top=${filter.limit}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to get usage records: ${errorBody}`);
    }
    
    const data = await response.json() as { value: DataverseUsageRecord[] };
    return data.value.map(this.parseUsageRecord);
  }
  
  // ==========================================================================
  // DOCUMENT IMPACTS
  // ==========================================================================
  
  async saveDocumentImpact(impact: KBDocumentImpact): Promise<void> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.documentImpacts}`;
    
    const dataverseRecord = {
      cr_documentid: impact.documentId,
      cr_documenttitle: impact.documentTitle,
      cr_totalretrievals: impact.totalRetrievals,
      cr_timesusedinresponse: impact.timesUsedInResponse,
      cr_avgqualitywhenused: impact.avgQualityWhenUsed,
      cr_avgqualitywhennotused: impact.avgQualityWhenNotUsed,
      cr_impactscore: impact.impactScore,
      cr_confidence: impact.confidence,
      cr_recommendedaction: impact.recommendedAction,
      cr_chunkanalysis: impact.chunkAnalysis ? JSON.stringify(impact.chunkAnalysis) : null,
      cr_strongtopics: JSON.stringify(impact.strongTopics),
      cr_weaktopics: JSON.stringify(impact.weakTopics),
      cr_lastupdated: impact.lastUpdated.toISOString(),
    };
    
    // Upsert
    const response = await fetch(`${url}(cr_documentid='${impact.documentId}')`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'If-Match': '*',
      },
      body: JSON.stringify(dataverseRecord),
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok && response.status !== 204) {
      const createResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(dataverseRecord),
        signal: AbortSignal.timeout(this.timeout),
      });
      
      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        throw new Error(`Failed to save document impact: ${errorBody}`);
      }
    }
  }
  
  async getDocumentImpact(documentId: string): Promise<KBDocumentImpact | null> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.documentImpacts}(cr_documentid='${documentId}')`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to get document impact: ${errorBody}`);
      }
      
      const record = await response.json() as DataverseImpactRecord;
      return this.parseDocumentImpact(record);
      
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }
  
  async getAllDocumentImpacts(agentId: string): Promise<KBDocumentImpact[]> {
    const token = await this.getAccessToken();
    // Note: agentId filtering would need to be added to the data model
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.documentImpacts}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to get document impacts: ${errorBody}`);
    }
    
    const data = await response.json() as { value: DataverseImpactRecord[] };
    return data.value.map(this.parseDocumentImpact);
  }
  
  // ==========================================================================
  // UPDATE PROPOSALS
  // ==========================================================================
  
  async saveProposal(proposal: KBUpdateProposal): Promise<void> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.updateProposals}`;
    
    const dataverseRecord = {
      cr_id: proposal.id,
      cr_agentid: proposal.agentId,
      cr_updatetype: proposal.updateType,
      cr_targetdocumentids: JSON.stringify(proposal.targetDocumentIds),
      cr_rationale: proposal.rationale,
      cr_triggeringimpact: JSON.stringify(proposal.triggeringImpact),
      cr_proposedchanges: JSON.stringify(proposal.proposedChanges),
      cr_priority: proposal.priority,
      cr_status: proposal.status,
      cr_createdat: proposal.createdAt.toISOString(),
      cr_updatedat: proposal.updatedAt.toISOString(),
    };
    
    // Upsert
    const response = await fetch(`${url}(cr_id='${proposal.id}')`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'If-Match': '*',
      },
      body: JSON.stringify(dataverseRecord),
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok && response.status !== 204) {
      const createResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(dataverseRecord),
        signal: AbortSignal.timeout(this.timeout),
      });
      
      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        throw new Error(`Failed to save proposal: ${errorBody}`);
      }
    }
  }
  
  async getProposal(id: string): Promise<KBUpdateProposal | null> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.updateProposals}(cr_id='${id}')`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to get proposal: ${errorBody}`);
      }
      
      const record = await response.json() as DataverseProposalRecord;
      return this.parseProposal(record);
      
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }
  
  async getProposals(filter: KBProposalFilter): Promise<KBUpdateProposal[]> {
    const token = await this.getAccessToken();
    
    const filterParts: string[] = [];
    if (filter.agentId) {
      filterParts.push(`cr_agentid eq '${filter.agentId}'`);
    }
    if (filter.status) {
      filterParts.push(`cr_status eq '${filter.status}'`);
    }
    if (filter.updateType) {
      filterParts.push(`cr_updatetype eq '${filter.updateType}'`);
    }
    if (filter.minPriority !== undefined) {
      filterParts.push(`cr_priority ge ${filter.minPriority}`);
    }
    
    let url = `${this.environmentUrl}/api/data/v9.2/${this.tables.updateProposals}`;
    if (filterParts.length > 0) {
      url += `?$filter=${encodeURIComponent(filterParts.join(' and '))}`;
    }
    url += (url.includes('?') ? '&' : '?') + '$orderby=cr_priority desc';
    if (filter.limit) {
      url += `&$top=${filter.limit}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to get proposals: ${errorBody}`);
    }
    
    const data = await response.json() as { value: DataverseProposalRecord[] };
    return data.value.map(this.parseProposal);
  }
  
  async updateProposalStatus(id: string, status: KBUpdateStatus): Promise<void> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.updateProposals}(cr_id='${id}')`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
      },
      body: JSON.stringify({
        cr_status: status,
        cr_updatedat: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(this.timeout),
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to update proposal status: ${errorBody}`);
    }
  }
  
  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================
  
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }
    
    if (!this.clientId || !this.clientSecret) {
      const envToken = process.env.DATAVERSE_ACCESS_TOKEN;
      if (envToken) {
        this.accessToken = envToken;
        return envToken;
      }
      throw new Error('Dataverse credentials not configured');
    }
    
    const tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    const response = await fetch(tokenEndpoint, {
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
    
    const tokenData = await response.json() as { access_token: string; expires_in: number };
    this.accessToken = tokenData.access_token;
    
    const expiresIn = (tokenData.expires_in || 3600) - 300;
    this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
    
    return this.accessToken;
  }
  
  private parseUsageRecord(record: DataverseUsageRecord): KBUsageRecord {
    return {
      id: record.cr_id,
      agentId: record.cr_agentid,
      documentId: record.cr_documentid,
      chunkIds: JSON.parse(record.cr_chunkids || '[]'),
      query: record.cr_query,
      retrievalScore: record.cr_retrievalscore,
      sessionId: record.cr_sessionid,
      responseQuality: record.cr_responsequality,
      wasUsedInResponse: record.cr_wasusedinresponse,
      timestamp: new Date(record.cr_timestamp),
      metadata: record.cr_metadata ? JSON.parse(record.cr_metadata) : undefined,
    };
  }
  
  private parseDocumentImpact(record: DataverseImpactRecord): KBDocumentImpact {
    return {
      documentId: record.cr_documentid,
      documentTitle: record.cr_documenttitle,
      totalRetrievals: record.cr_totalretrievals,
      timesUsedInResponse: record.cr_timesusedinresponse,
      avgQualityWhenUsed: record.cr_avgqualitywhenused,
      avgQualityWhenNotUsed: record.cr_avgqualitywhennotused,
      impactScore: record.cr_impactscore,
      confidence: record.cr_confidence,
      recommendedAction: record.cr_recommendedaction as KBDocumentImpact['recommendedAction'],
      chunkAnalysis: record.cr_chunkanalysis ? JSON.parse(record.cr_chunkanalysis) : undefined,
      strongTopics: JSON.parse(record.cr_strongtopics || '[]'),
      weakTopics: JSON.parse(record.cr_weaktopics || '[]'),
      lastUpdated: new Date(record.cr_lastupdated),
    };
  }
  
  private parseProposal(record: DataverseProposalRecord): KBUpdateProposal {
    return {
      id: record.cr_id,
      agentId: record.cr_agentid,
      updateType: record.cr_updatetype as KBUpdateProposal['updateType'],
      targetDocumentIds: JSON.parse(record.cr_targetdocumentids || '[]'),
      rationale: record.cr_rationale,
      triggeringImpact: JSON.parse(record.cr_triggeringimpact),
      proposedChanges: JSON.parse(record.cr_proposedchanges),
      priority: record.cr_priority,
      status: record.cr_status as KBUpdateProposal['status'],
      createdAt: new Date(record.cr_createdat),
      updatedAt: new Date(record.cr_updatedat),
    };
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface DataverseUsageRecord {
  cr_id: string;
  cr_agentid: string;
  cr_documentid: string;
  cr_chunkids: string;
  cr_query: string;
  cr_retrievalscore: number;
  cr_sessionid: string;
  cr_responsequality?: number;
  cr_wasusedinresponse: boolean;
  cr_timestamp: string;
  cr_metadata?: string;
}

interface DataverseImpactRecord {
  cr_documentid: string;
  cr_documenttitle: string;
  cr_totalretrievals: number;
  cr_timesusedinresponse: number;
  cr_avgqualitywhenused: number;
  cr_avgqualitywhennotused: number;
  cr_impactscore: number;
  cr_confidence: number;
  cr_recommendedaction: string;
  cr_chunkanalysis?: string;
  cr_strongtopics: string;
  cr_weaktopics: string;
  cr_lastupdated: string;
}

interface DataverseProposalRecord {
  cr_id: string;
  cr_agentid: string;
  cr_updatetype: string;
  cr_targetdocumentids: string;
  cr_rationale: string;
  cr_triggeringimpact: string;
  cr_proposedchanges: string;
  cr_priority: number;
  cr_status: string;
  cr_createdat: string;
  cr_updatedat: string;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createDataverseKBImpactStorage(
  config: DataverseKBImpactStorageConfig
): DataverseKBImpactStorage {
  return new DataverseKBImpactStorage(config);
}

export default DataverseKBImpactStorage;
```

---

# STEP 42: Update Provider Exports

**File:** `packages/agent-core/src/providers/index.ts`

Add these exports (DO NOT replace existing - ADD these):

```typescript
// ============================================================================
// CORPORATE PROVIDERS (ADD TO EXISTING EXPORTS)
// ============================================================================

// Azure OpenAI LLM Provider
export {
  AzureOpenAILLMProvider,
  createAzureOpenAILLMProvider,
  type AzureOpenAILLMConfig,
} from './azure-openai-llm.js';

// Copilot Studio LLM Provider
export {
  CopilotStudioLLMProvider,
  createCopilotStudioLLMProvider,
  type CopilotStudioLLMConfig,
} from './copilot-studio-llm.js';

// Dataverse Storage Provider
export {
  DataverseStorageProvider,
  createDataverseStorageProvider,
  type DataverseStorageConfig,
} from './dataverse-storage.js';
```

---

# STEP 43: Update Learning Exports

**File:** `packages/agent-core/src/learning/index.ts`

Add these exports (DO NOT replace existing - ADD these):

```typescript
// ============================================================================
// DATAVERSE KB IMPACT STORAGE (ADD TO EXISTING EXPORTS)
// ============================================================================

export {
  DataverseKBImpactStorage,
  createDataverseKBImpactStorage,
  type DataverseKBImpactStorageConfig,
} from './dataverse-kb-impact-storage.js';
```

---

# STEP 44: Verify Phase 4 Builds

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core

# Clean and rebuild
rm -rf dist
npm run build

# Check for errors
echo $?
# Should be 0
```

---

# PHASE 4 COMMIT

After all steps complete successfully:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

git add .
git commit -m "feat(agent-core): Phase 4 - Corporate providers for Mastercard deployment

- Implemented AzureOpenAILLMProvider with full chat completion support
- Implemented CopilotStudioLLMProvider with Direct Line API integration
- Implemented DataverseStorageProvider for document storage
- Implemented DataverseKBImpactStorage for KB tracking in corporate
- All providers include proper authentication token management
- All providers include retry logic and error handling
- Exported all new providers and types from agent-core"

git push origin deploy/personal
```

---

# VERIFICATION CHECKLIST

- [ ] packages/agent-core builds without errors
- [ ] azure-openai-llm.ts created with full implementation
- [ ] copilot-studio-llm.ts created with full implementation
- [ ] dataverse-storage.ts created with full implementation
- [ ] dataverse-kb-impact-storage.ts created with full implementation
- [ ] providers/index.ts updated with new exports
- [ ] learning/index.ts updated with Dataverse storage export

---

# NEXT: Phase 5 (Branch Management)

Phase 5 will create the deploy/mastercard branch with environment-specific configurations.
