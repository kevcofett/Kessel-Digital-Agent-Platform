# MPA MULTI-PLATFORM ENHANCEMENT SYSTEM SPECIFICATION
# Version 2.0 | January 11, 2026

================================================================================
EXECUTIVE SUMMARY
================================================================================

This specification extends the MPA Enhancement System to support three platforms:

1. CLAUDE (Anthropic) - Braintrust evaluation harness
2. OPENAI (GPT-4o) - Alternative provider, cost optimization
3. MICROSOFT COPILOT STUDIO - Production deployment

All platforms share the same RAG architecture and learning capabilities through
a unified abstraction layer. Storage backends are swappable between JSON files
(development), Azure Blob Storage (cloud dev), and Dataverse (production).

TARGET: Single codebase that deploys to any platform with configuration changes.


================================================================================
PART 1: MULTI-PLATFORM ARCHITECTURE
================================================================================

HIGH-LEVEL ARCHITECTURE
-----------------------

┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    CONVERSATION ENGINE                               │    │
│  │  - Orchestrates conversations                                        │    │
│  │  - Provider-agnostic                                                 │    │
│  │  - Platform-agnostic                                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌───────────────────────┐ ┌─────────────────┐ ┌─────────────────────────────┐
│   LLM PROVIDER LAYER  │ │   RAG LAYER     │ │    LEARNING LAYER           │
│  ┌─────────────────┐  │ │ ┌─────────────┐ │ │ ┌─────────────────────────┐ │
│  │ ClaudeProvider  │  │ │ │ Retrieval   │ │ │ │ Self-Critique           │ │
│  │ OpenAIProvider  │  │ │ │ Engine      │ │ │ │ Success Patterns        │ │
│  │ CopilotProvider │  │ │ │ (Unified)   │ │ │ │ KB Enhancement          │ │
│  └─────────────────┘  │ │ └─────────────┘ │ │ │ User Feedback           │ │
└───────────────────────┘ └─────────────────┘ │ └─────────────────────────┘ │
                                    │         └─────────────────────────────┘
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌───────────────────────┐ ┌─────────────────┐ ┌─────────────────────────────┐
│  EMBEDDING LAYER      │ │  VECTOR STORE   │ │    STORAGE LAYER            │
│  ┌─────────────────┐  │ │ ┌─────────────┐ │ │ ┌─────────────────────────┐ │
│  │ TF-IDF (Local)  │  │ │ │ In-Memory   │ │ │ │ JSON (Dev)              │ │
│  │ OpenAI Ada      │  │ │ │ Azure AI    │ │ │ │ Azure Blob              │ │
│  │ Azure OpenAI    │  │ │ │ Search      │ │ │ │ Dataverse (Prod)        │ │
│  └─────────────────┘  │ │ └─────────────┘ │ │ └─────────────────────────┘ │
└───────────────────────┘ └─────────────────┘ └─────────────────────────────┘


PLATFORM COMPARISON
-------------------

Feature              | Claude         | OpenAI         | Copilot Studio
---------------------|----------------|----------------|------------------
LLM API              | Anthropic SDK  | OpenAI SDK     | Azure OpenAI
Tool Format          | input_schema   | parameters     | Power Automate
Embeddings           | TF-IDF/Ada     | Ada-002        | Azure OpenAI
Vector Store         | In-Memory      | In-Memory      | Azure AI Search
Storage              | JSON           | JSON           | Dataverse
Knowledge Base       | Local Files    | Local Files    | SharePoint
Authentication       | API Key        | API Key        | Entra ID
Deployment           | Node.js        | Node.js        | Power Platform


================================================================================
PART 2: LLM PROVIDER ABSTRACTION
================================================================================

PROVIDER INTERFACE
------------------

File: providers/llm-provider.ts

```typescript
/**
 * Unified LLM Provider Interface
 * 
 * Normalizes interactions across Claude, OpenAI, and Azure OpenAI.
 */

export interface LLMProviderConfig {
  provider: 'claude' | 'openai' | 'azure-openai';
  model: string;
  apiKey?: string;
  endpoint?: string;  // For Azure OpenAI
  apiVersion?: string; // For Azure OpenAI
  maxTokens: number;
  temperature: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ParameterDefinition>;
    required?: string[];
  };
}

export interface ParameterDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  items?: ParameterDefinition;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentBlock[];
  toolCallId?: string;  // For tool results
  toolCalls?: ToolCall[];  // For assistant tool use
}

export interface ContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  text?: string;
  toolUseId?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolResult?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface LLMResponse {
  content: string;
  toolCalls: ToolCall[];
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop';
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMProvider {
  /**
   * Provider name for logging
   */
  readonly name: string;

  /**
   * Generate a response
   */
  generate(
    messages: Message[],
    options?: GenerateOptions
  ): Promise<LLMResponse>;

  /**
   * Generate with tools
   */
  generateWithTools(
    messages: Message[],
    tools: ToolDefinition[],
    options?: GenerateOptions
  ): Promise<LLMResponse>;

  /**
   * Format tool result for conversation
   */
  formatToolResult(toolCallId: string, result: string): Message;

  /**
   * Check if provider is available
   */
  isAvailable(): Promise<boolean>;
}

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
}
```


CLAUDE PROVIDER
---------------

File: providers/claude-provider.ts

```typescript
import Anthropic from '@anthropic-ai/sdk';
import {
  LLMProvider,
  LLMProviderConfig,
  Message,
  ToolDefinition,
  LLMResponse,
  GenerateOptions,
  ToolCall,
} from './llm-provider.js';

export class ClaudeProvider implements LLMProvider {
  readonly name = 'claude';
  private client: Anthropic;
  private config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async generate(messages: Message[], options?: GenerateOptions): Promise<LLMResponse> {
    const anthropicMessages = this.convertMessages(messages);
    const systemMessage = this.extractSystemMessage(messages);

    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: options?.maxTokens || this.config.maxTokens,
      temperature: options?.temperature ?? this.config.temperature,
      system: systemMessage,
      messages: anthropicMessages,
      stop_sequences: options?.stopSequences,
    });

    return this.convertResponse(response);
  }

  async generateWithTools(
    messages: Message[],
    tools: ToolDefinition[],
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    const anthropicMessages = this.convertMessages(messages);
    const systemMessage = this.extractSystemMessage(messages);
    const anthropicTools = this.convertTools(tools);

    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: options?.maxTokens || this.config.maxTokens,
      temperature: options?.temperature ?? this.config.temperature,
      system: systemMessage,
      messages: anthropicMessages,
      tools: anthropicTools,
      stop_sequences: options?.stopSequences,
    });

    return this.convertResponse(response);
  }

  formatToolResult(toolCallId: string, result: string): Message {
    return {
      role: 'user',
      content: [{
        type: 'tool_result',
        toolUseId: toolCallId,
        toolResult: result,
      }],
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple availability check
      await this.client.messages.create({
        model: this.config.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      });
      return true;
    } catch {
      return false;
    }
  }

  private convertMessages(messages: Message[]): Anthropic.MessageParam[] {
    return messages
      .filter(m => m.role !== 'system')
      .map(m => {
        if (typeof m.content === 'string') {
          return { role: m.role as 'user' | 'assistant', content: m.content };
        }
        
        // Handle content blocks
        const blocks: Anthropic.ContentBlock[] = m.content.map(block => {
          if (block.type === 'text') {
            return { type: 'text', text: block.text! };
          }
          if (block.type === 'tool_use') {
            return {
              type: 'tool_use',
              id: block.toolUseId!,
              name: block.toolName!,
              input: block.toolInput!,
            };
          }
          if (block.type === 'tool_result') {
            return {
              type: 'tool_result',
              tool_use_id: block.toolUseId!,
              content: block.toolResult!,
            };
          }
          return { type: 'text', text: '' };
        });

        return { role: m.role as 'user' | 'assistant', content: blocks };
      });
  }

  private extractSystemMessage(messages: Message[]): string {
    const systemMsg = messages.find(m => m.role === 'system');
    return typeof systemMsg?.content === 'string' ? systemMsg.content : '';
  }

  private convertTools(tools: ToolDefinition[]): Anthropic.Tool[] {
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object' as const,
        properties: tool.parameters.properties,
        required: tool.parameters.required,
      },
    }));
  }

  private convertResponse(response: Anthropic.Message): LLMResponse {
    const toolCalls: ToolCall[] = [];
    let textContent = '';

    for (const block of response.content) {
      if (block.type === 'text') {
        textContent += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input as Record<string, unknown>,
        });
      }
    }

    return {
      content: textContent,
      toolCalls,
      stopReason: response.stop_reason === 'tool_use' ? 'tool_use' : 'end_turn',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
```


OPENAI PROVIDER
---------------

File: providers/openai-provider.ts

```typescript
import OpenAI from 'openai';
import {
  LLMProvider,
  LLMProviderConfig,
  Message,
  ToolDefinition,
  LLMResponse,
  GenerateOptions,
  ToolCall,
} from './llm-provider.js';

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  private client: OpenAI;
  private config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generate(messages: Message[], options?: GenerateOptions): Promise<LLMResponse> {
    const openaiMessages = this.convertMessages(messages);

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      max_tokens: options?.maxTokens || this.config.maxTokens,
      temperature: options?.temperature ?? this.config.temperature,
      messages: openaiMessages,
      stop: options?.stopSequences,
    });

    return this.convertResponse(response);
  }

  async generateWithTools(
    messages: Message[],
    tools: ToolDefinition[],
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    const openaiMessages = this.convertMessages(messages);
    const openaiTools = this.convertTools(tools);

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      max_tokens: options?.maxTokens || this.config.maxTokens,
      temperature: options?.temperature ?? this.config.temperature,
      messages: openaiMessages,
      tools: openaiTools,
      tool_choice: 'auto',
      stop: options?.stopSequences,
    });

    return this.convertResponse(response);
  }

  formatToolResult(toolCallId: string, result: string): Message {
    return {
      role: 'tool',
      content: result,
      toolCallId,
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.chat.completions.create({
        model: this.config.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      });
      return true;
    } catch {
      return false;
    }
  }

  private convertMessages(messages: Message[]): OpenAI.ChatCompletionMessageParam[] {
    return messages.map(m => {
      if (m.role === 'system') {
        return { role: 'system', content: m.content as string };
      }
      if (m.role === 'tool') {
        return {
          role: 'tool',
          content: m.content as string,
          tool_call_id: m.toolCallId!,
        };
      }
      if (m.role === 'assistant' && m.toolCalls?.length) {
        return {
          role: 'assistant',
          content: typeof m.content === 'string' ? m.content : null,
          tool_calls: m.toolCalls.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          })),
        };
      }
      return {
        role: m.role as 'user' | 'assistant',
        content: typeof m.content === 'string' ? m.content : 
          m.content.filter(b => b.type === 'text').map(b => b.text).join(''),
      };
    });
  }

  private convertTools(tools: ToolDefinition[]): OpenAI.ChatCompletionTool[] {
    return tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.parameters.properties,
          required: tool.parameters.required,
        },
      },
    }));
  }

  private convertResponse(response: OpenAI.ChatCompletion): LLMResponse {
    const choice = response.choices[0];
    const toolCalls: ToolCall[] = [];

    if (choice.message.tool_calls) {
      for (const tc of choice.message.tool_calls) {
        toolCalls.push({
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments),
        });
      }
    }

    return {
      content: choice.message.content || '',
      toolCalls,
      stopReason: choice.finish_reason === 'tool_calls' ? 'tool_use' : 'end_turn',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  }
}
```


AZURE OPENAI PROVIDER
---------------------

File: providers/azure-openai-provider.ts

```typescript
import OpenAI from 'openai';
import { AzureOpenAI } from 'openai';
import {
  LLMProvider,
  LLMProviderConfig,
  Message,
  ToolDefinition,
  LLMResponse,
  GenerateOptions,
} from './llm-provider.js';
import { OpenAIProvider } from './openai-provider.js';

/**
 * Azure OpenAI Provider
 * 
 * Extends OpenAI provider with Azure-specific configuration.
 * Used for Copilot Studio and Microsoft environments.
 */
export class AzureOpenAIProvider extends OpenAIProvider {
  readonly name = 'azure-openai';

  constructor(config: LLMProviderConfig) {
    super(config);
    
    // Override client with Azure-specific configuration
    (this as any).client = new AzureOpenAI({
      apiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY,
      endpoint: config.endpoint || process.env.AZURE_OPENAI_ENDPOINT,
      apiVersion: config.apiVersion || '2024-02-15-preview',
      deployment: config.model, // Azure uses deployment name
    });
  }
}
```


PROVIDER FACTORY
----------------

File: providers/provider-factory.ts

```typescript
import { LLMProvider, LLMProviderConfig } from './llm-provider.js';
import { ClaudeProvider } from './claude-provider.js';
import { OpenAIProvider } from './openai-provider.js';
import { AzureOpenAIProvider } from './azure-openai-provider.js';

export class ProviderFactory {
  static create(config: LLMProviderConfig): LLMProvider {
    switch (config.provider) {
      case 'claude':
        return new ClaudeProvider(config);
      case 'openai':
        return new OpenAIProvider(config);
      case 'azure-openai':
        return new AzureOpenAIProvider(config);
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  static getDefaultConfig(provider: 'claude' | 'openai' | 'azure-openai'): LLMProviderConfig {
    switch (provider) {
      case 'claude':
        return {
          provider: 'claude',
          model: 'claude-sonnet-4-20250514',
          maxTokens: 1024,
          temperature: 0.7,
        };
      case 'openai':
        return {
          provider: 'openai',
          model: 'gpt-4o',
          maxTokens: 1024,
          temperature: 0.7,
        };
      case 'azure-openai':
        return {
          provider: 'azure-openai',
          model: 'gpt-4o', // Deployment name
          maxTokens: 1024,
          temperature: 0.7,
        };
    }
  }
}
```


================================================================================
PART 3: EMBEDDING PROVIDER ABSTRACTION
================================================================================

EMBEDDING INTERFACE
-------------------

File: embeddings/embedding-provider.ts

```typescript
/**
 * Unified Embedding Provider Interface
 */

export interface EmbeddingProviderConfig {
  provider: 'tfidf' | 'openai' | 'azure-openai';
  model?: string;
  apiKey?: string;
  endpoint?: string;
  dimensions?: number;
}

export interface EmbeddingProvider {
  /**
   * Provider name
   */
  readonly name: string;

  /**
   * Embedding dimensions
   */
  readonly dimensions: number;

  /**
   * Initialize with corpus (for TF-IDF)
   */
  initialize(documents: string[]): Promise<void>;

  /**
   * Embed a single text
   */
  embed(text: string): Promise<number[]>;

  /**
   * Embed multiple texts (batch)
   */
  embedBatch(texts: string[]): Promise<number[][]>;

  /**
   * Calculate cosine similarity
   */
  cosineSimilarity(a: number[], b: number[]): number;
}
```


TF-IDF EMBEDDING PROVIDER
-------------------------

File: embeddings/tfidf-provider.ts

```typescript
import natural from 'natural';
import { EmbeddingProvider, EmbeddingProviderConfig } from './embedding-provider.js';

/**
 * TF-IDF Embedding Provider
 * 
 * Local embeddings using term frequency-inverse document frequency.
 * No external API calls required.
 */
export class TFIDFProvider implements EmbeddingProvider {
  readonly name = 'tfidf';
  readonly dimensions: number;
  
  private tfidf: natural.TfIdf;
  private vocabulary: Map<string, number> = new Map();
  private idfValues: Map<string, number> = new Map();
  private initialized = false;

  constructor(config: EmbeddingProviderConfig) {
    this.dimensions = config.dimensions || 512;
    this.tfidf = new natural.TfIdf();
  }

  async initialize(documents: string[]): Promise<void> {
    // Add all documents to TF-IDF
    for (const doc of documents) {
      this.tfidf.addDocument(doc);
    }

    // Build vocabulary from all terms
    const allTerms = new Set<string>();
    this.tfidf.documents.forEach(doc => {
      Object.keys(doc).forEach(term => {
        if (term !== '__key') {
          allTerms.add(term);
        }
      });
    });

    // Assign indices to terms (limit to dimensions)
    const sortedTerms = Array.from(allTerms).sort();
    sortedTerms.slice(0, this.dimensions).forEach((term, idx) => {
      this.vocabulary.set(term, idx);
    });

    // Calculate IDF values
    const numDocs = documents.length;
    for (const term of this.vocabulary.keys()) {
      let docCount = 0;
      this.tfidf.documents.forEach(doc => {
        if (doc[term]) docCount++;
      });
      this.idfValues.set(term, Math.log(numDocs / (1 + docCount)));
    }

    this.initialized = true;
  }

  async embed(text: string): Promise<number[]> {
    if (!this.initialized) {
      throw new Error('TF-IDF provider not initialized. Call initialize() first.');
    }

    const vector = new Array(this.dimensions).fill(0);
    const tokens = this.tokenize(text);
    const termCounts = new Map<string, number>();

    // Count terms
    for (const token of tokens) {
      termCounts.set(token, (termCounts.get(token) || 0) + 1);
    }

    // Calculate TF-IDF values
    for (const [term, count] of termCounts) {
      const idx = this.vocabulary.get(term);
      if (idx !== undefined) {
        const tf = count / tokens.length;
        const idf = this.idfValues.get(term) || 0;
        vector[idx] = tf * idf;
      }
    }

    // Normalize
    return this.normalize(vector);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => this.embed(text)));
  }

  cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude === 0 ? vector : vector.map(v => v / magnitude);
  }
}
```


OPENAI EMBEDDING PROVIDER
-------------------------

File: embeddings/openai-embedding-provider.ts

```typescript
import OpenAI from 'openai';
import { EmbeddingProvider, EmbeddingProviderConfig } from './embedding-provider.js';

/**
 * OpenAI Embedding Provider
 * 
 * Uses text-embedding-ada-002 or text-embedding-3-small/large.
 */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'openai';
  readonly dimensions: number;
  
  private client: OpenAI;
  private model: string;

  constructor(config: EmbeddingProviderConfig) {
    this.model = config.model || 'text-embedding-3-small';
    this.dimensions = config.dimensions || 1536;
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async initialize(_documents: string[]): Promise<void> {
    // OpenAI embeddings don't need initialization
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: text,
      dimensions: this.dimensions,
    });

    return response.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: texts,
      dimensions: this.dimensions,
    });

    return response.data.map(d => d.embedding);
  }

  cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}
```


AZURE OPENAI EMBEDDING PROVIDER
-------------------------------

File: embeddings/azure-embedding-provider.ts

```typescript
import { AzureOpenAI } from 'openai';
import { EmbeddingProvider, EmbeddingProviderConfig } from './embedding-provider.js';

/**
 * Azure OpenAI Embedding Provider
 * 
 * Uses Azure-hosted embedding models.
 */
export class AzureEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'azure-openai';
  readonly dimensions: number;
  
  private client: AzureOpenAI;
  private deploymentName: string;

  constructor(config: EmbeddingProviderConfig) {
    this.deploymentName = config.model || 'text-embedding-ada-002';
    this.dimensions = config.dimensions || 1536;
    this.client = new AzureOpenAI({
      apiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY,
      endpoint: config.endpoint || process.env.AZURE_OPENAI_ENDPOINT,
      apiVersion: '2024-02-15-preview',
    });
  }

  async initialize(_documents: string[]): Promise<void> {
    // Azure embeddings don't need initialization
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.deploymentName,
      input: text,
    });

    return response.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.deploymentName,
      input: texts,
    });

    return response.data.map(d => d.embedding);
  }

  cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}
```


================================================================================
PART 4: VECTOR STORE ABSTRACTION
================================================================================

VECTOR STORE INTERFACE
----------------------

File: vector-stores/vector-store.ts

```typescript
/**
 * Unified Vector Store Interface
 */

export interface VectorStoreConfig {
  backend: 'memory' | 'azure-ai-search';
  
  // Azure AI Search specific
  endpoint?: string;
  apiKey?: string;
  indexName?: string;
}

export interface IndexedDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface SearchOptions {
  topK?: number;
  minScore?: number;
  filter?: Record<string, unknown>;
}

export interface VectorStore {
  /**
   * Store name
   */
  readonly name: string;

  /**
   * Add documents to the store
   */
  addDocuments(documents: IndexedDocument[]): Promise<void>;

  /**
   * Search by embedding vector
   */
  search(embedding: number[], options?: SearchOptions): Promise<SearchResult[]>;

  /**
   * Search by text (requires embedding provider)
   */
  searchByText?(text: string, options?: SearchOptions): Promise<SearchResult[]>;

  /**
   * Delete documents by ID
   */
  deleteDocuments(ids: string[]): Promise<void>;

  /**
   * Clear all documents
   */
  clear(): Promise<void>;

  /**
   * Get document count
   */
  count(): Promise<number>;

  /**
   * Check if store is available
   */
  isAvailable(): Promise<boolean>;
}
```


IN-MEMORY VECTOR STORE
----------------------

File: vector-stores/memory-store.ts

```typescript
import { VectorStore, IndexedDocument, SearchResult, SearchOptions } from './vector-store.js';
import { EmbeddingProvider } from '../embeddings/embedding-provider.js';

/**
 * In-Memory Vector Store
 * 
 * Simple brute-force cosine similarity search.
 * Suitable for small to medium corpora (< 10,000 documents).
 */
export class MemoryVectorStore implements VectorStore {
  readonly name = 'memory';
  
  private documents: Map<string, IndexedDocument> = new Map();
  private embeddingProvider: EmbeddingProvider;

  constructor(embeddingProvider: EmbeddingProvider) {
    this.embeddingProvider = embeddingProvider;
  }

  async addDocuments(documents: IndexedDocument[]): Promise<void> {
    for (const doc of documents) {
      this.documents.set(doc.id, doc);
    }
  }

  async search(embedding: number[], options?: SearchOptions): Promise<SearchResult[]> {
    const topK = options?.topK || 5;
    const minScore = options?.minScore || 0;
    const filter = options?.filter || {};

    const results: SearchResult[] = [];

    for (const doc of this.documents.values()) {
      // Apply metadata filters
      if (!this.matchesFilter(doc.metadata, filter)) {
        continue;
      }

      const score = this.embeddingProvider.cosineSimilarity(embedding, doc.embedding);
      
      if (score >= minScore) {
        results.push({
          id: doc.id,
          content: doc.content,
          score,
          metadata: doc.metadata,
        });
      }
    }

    // Sort by score descending and take top K
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async deleteDocuments(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.documents.delete(id);
    }
  }

  async clear(): Promise<void> {
    this.documents.clear();
  }

  async count(): Promise<number> {
    return this.documents.size;
  }

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  private matchesFilter(metadata: Record<string, unknown>, filter: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (metadata[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Save index to JSON file
   */
  async saveToFile(filepath: string): Promise<void> {
    const fs = await import('fs/promises');
    const data = {
      documents: Array.from(this.documents.values()),
    };
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  }

  /**
   * Load index from JSON file
   */
  async loadFromFile(filepath: string): Promise<void> {
    const fs = await import('fs/promises');
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const data = JSON.parse(content);
      this.documents.clear();
      for (const doc of data.documents) {
        this.documents.set(doc.id, doc);
      }
    } catch {
      // File doesn't exist, start fresh
    }
  }
}
```


AZURE AI SEARCH VECTOR STORE
----------------------------

File: vector-stores/azure-search-store.ts

```typescript
import { SearchClient, AzureKeyCredential, SearchIndexClient } from '@azure/search-documents';
import { VectorStore, IndexedDocument, SearchResult, SearchOptions, VectorStoreConfig } from './vector-store.js';

/**
 * Azure AI Search Vector Store
 * 
 * Enterprise-grade vector search for production deployments.
 * Supports hybrid search (vector + keyword), filtering, and faceting.
 */
export class AzureSearchVectorStore implements VectorStore {
  readonly name = 'azure-ai-search';
  
  private searchClient: SearchClient<IndexedDocument>;
  private indexClient: SearchIndexClient;
  private indexName: string;
  private config: VectorStoreConfig;

  constructor(config: VectorStoreConfig) {
    this.config = config;
    this.indexName = config.indexName || 'mpa-knowledge-base';
    
    const endpoint = config.endpoint || process.env.AZURE_SEARCH_ENDPOINT!;
    const apiKey = config.apiKey || process.env.AZURE_SEARCH_API_KEY!;
    const credential = new AzureKeyCredential(apiKey);

    this.searchClient = new SearchClient(endpoint, this.indexName, credential);
    this.indexClient = new SearchIndexClient(endpoint, credential);
  }

  async addDocuments(documents: IndexedDocument[]): Promise<void> {
    // Ensure index exists
    await this.ensureIndexExists();

    // Convert to Azure format
    const azureDocs = documents.map(doc => ({
      id: doc.id,
      content: doc.content,
      contentVector: doc.embedding,
      ...doc.metadata,
    }));

    // Upload in batches of 1000
    const batchSize = 1000;
    for (let i = 0; i < azureDocs.length; i += batchSize) {
      const batch = azureDocs.slice(i, i + batchSize);
      await this.searchClient.uploadDocuments(batch);
    }
  }

  async search(embedding: number[], options?: SearchOptions): Promise<SearchResult[]> {
    const topK = options?.topK || 5;
    const minScore = options?.minScore || 0;

    const response = await this.searchClient.search('*', {
      vectorSearchOptions: {
        queries: [{
          kind: 'vector',
          vector: embedding,
          fields: ['contentVector'],
          kNearestNeighborsCount: topK,
        }],
      },
      select: ['id', 'content'],
      top: topK,
    });

    const results: SearchResult[] = [];
    
    for await (const result of response.results) {
      if (result.score && result.score >= minScore) {
        results.push({
          id: result.document.id,
          content: result.document.content,
          score: result.score,
          metadata: result.document as Record<string, unknown>,
        });
      }
    }

    return results;
  }

  async deleteDocuments(ids: string[]): Promise<void> {
    const docsToDelete = ids.map(id => ({ id }));
    await this.searchClient.deleteDocuments(docsToDelete);
  }

  async clear(): Promise<void> {
    // Delete and recreate index
    try {
      await this.indexClient.deleteIndex(this.indexName);
    } catch {
      // Index may not exist
    }
    await this.ensureIndexExists();
  }

  async count(): Promise<number> {
    const response = await this.searchClient.search('*', {
      top: 0,
      includeTotalCount: true,
    });
    return response.count || 0;
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.indexClient.getIndex(this.indexName);
      return true;
    } catch {
      return false;
    }
  }

  private async ensureIndexExists(): Promise<void> {
    try {
      await this.indexClient.getIndex(this.indexName);
    } catch {
      // Create index with vector search
      await this.indexClient.createIndex({
        name: this.indexName,
        fields: [
          { name: 'id', type: 'Edm.String', key: true },
          { name: 'content', type: 'Edm.String', searchable: true },
          {
            name: 'contentVector',
            type: 'Collection(Edm.Single)',
            searchable: true,
            vectorSearchDimensions: 1536,
            vectorSearchProfileName: 'vector-profile',
          },
          { name: 'documentType', type: 'Edm.String', filterable: true },
          { name: 'source', type: 'Edm.String', filterable: true },
        ],
        vectorSearch: {
          profiles: [{
            name: 'vector-profile',
            algorithmConfigurationName: 'hnsw-config',
          }],
          algorithms: [{
            name: 'hnsw-config',
            kind: 'hnsw',
            parameters: {
              metric: 'cosine',
              m: 4,
              efConstruction: 400,
              efSearch: 500,
            },
          }],
        },
      });
    }
  }
}
```


================================================================================
PART 5: STORAGE LAYER ABSTRACTION
================================================================================

STORAGE INTERFACE
-----------------

File: storage/storage-interface.ts

```typescript
/**
 * Unified Storage Interface
 * 
 * Supports JSON files (dev), Azure Blob (cloud dev), and Dataverse (production).
 */

export interface StorageConfig {
  backend: 'json' | 'azure-blob' | 'dataverse';
  
  // JSON specific
  basePath?: string;
  
  // Azure Blob specific
  connectionString?: string;
  containerName?: string;
  
  // Dataverse specific
  environmentUrl?: string;
  tableName?: string;
}

export interface StorageItem {
  id: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface QueryOptions {
  filter?: Record<string, unknown>;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface Storage<T extends StorageItem> {
  /**
   * Backend name
   */
  readonly name: string;

  /**
   * Create a new item
   */
  create(item: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * Read an item by ID
   */
  read(id: string): Promise<T | null>;

  /**
   * Update an existing item
   */
  update(id: string, updates: Partial<T>): Promise<T | null>;

  /**
   * Delete an item
   */
  delete(id: string): Promise<boolean>;

  /**
   * List items with optional filtering
   */
  list(options?: QueryOptions): Promise<T[]>;

  /**
   * Count items with optional filtering
   */
  count(filter?: Record<string, unknown>): Promise<number>;

  /**
   * Check if storage is available
   */
  isAvailable(): Promise<boolean>;
}
```


JSON STORAGE
------------

File: storage/json-storage.ts

```typescript
import * as fs from 'fs/promises';
import * as path from 'path';
import { Storage, StorageItem, QueryOptions, StorageConfig } from './storage-interface.js';

/**
 * JSON File Storage
 * 
 * Simple file-based storage for development and testing.
 */
export class JsonStorage<T extends StorageItem> implements Storage<T> {
  readonly name = 'json';
  
  private filepath: string;
  private data: Map<string, T> = new Map();
  private loaded = false;

  constructor(config: StorageConfig, collectionName: string) {
    const basePath = config.basePath || './storage';
    this.filepath = path.resolve(basePath, `${collectionName}.json`);
  }

  async create(item: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T> {
    await this.ensureLoaded();
    
    const now = new Date().toISOString();
    const fullItem = {
      ...item,
      createdAt: now,
      updatedAt: now,
    } as T;

    this.data.set(item.id, fullItem);
    await this.persist();
    
    return fullItem;
  }

  async read(id: string): Promise<T | null> {
    await this.ensureLoaded();
    return this.data.get(id) || null;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    await this.ensureLoaded();
    
    const existing = this.data.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      id, // Prevent ID change
      createdAt: existing.createdAt, // Preserve creation time
      updatedAt: new Date().toISOString(),
    } as T;

    this.data.set(id, updated);
    await this.persist();
    
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureLoaded();
    const existed = this.data.delete(id);
    if (existed) {
      await this.persist();
    }
    return existed;
  }

  async list(options?: QueryOptions): Promise<T[]> {
    await this.ensureLoaded();
    
    let items = Array.from(this.data.values());

    // Apply filter
    if (options?.filter) {
      items = items.filter(item => this.matchesFilter(item, options.filter!));
    }

    // Apply sorting
    if (options?.orderBy) {
      const dir = options.orderDirection === 'asc' ? 1 : -1;
      items.sort((a, b) => {
        const aVal = (a as any)[options.orderBy!];
        const bVal = (b as any)[options.orderBy!];
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      });
    }

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || items.length;
    
    return items.slice(offset, offset + limit);
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    await this.ensureLoaded();
    
    if (!filter) {
      return this.data.size;
    }

    return Array.from(this.data.values())
      .filter(item => this.matchesFilter(item, filter))
      .length;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;

    try {
      const dir = path.dirname(this.filepath);
      await fs.mkdir(dir, { recursive: true });
      
      const content = await fs.readFile(this.filepath, 'utf-8');
      const items: T[] = JSON.parse(content);
      this.data = new Map(items.map(item => [item.id, item]));
    } catch {
      this.data = new Map();
    }

    this.loaded = true;
  }

  private async persist(): Promise<void> {
    const items = Array.from(this.data.values());
    const dir = path.dirname(this.filepath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.filepath, JSON.stringify(items, null, 2));
  }

  private matchesFilter(item: T, filter: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if ((item as any)[key] !== value) {
        return false;
      }
    }
    return true;
  }
}
```


DATAVERSE STORAGE
-----------------

File: storage/dataverse-storage.ts

```typescript
import { Storage, StorageItem, QueryOptions, StorageConfig } from './storage-interface.js';

/**
 * Dataverse Storage
 * 
 * Microsoft Dataverse storage for Copilot Studio production deployments.
 * Uses Dataverse Web API.
 */
export class DataverseStorage<T extends StorageItem> implements Storage<T> {
  readonly name = 'dataverse';
  
  private environmentUrl: string;
  private tableName: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: StorageConfig, collectionName: string) {
    this.environmentUrl = config.environmentUrl || process.env.DATAVERSE_URL!;
    this.tableName = config.tableName || collectionName;
  }

  async create(item: Omit<T, 'createdAt' | 'updatedAt'>): Promise<T> {
    await this.ensureAuthenticated();

    const response = await fetch(
      `${this.environmentUrl}/api/data/v9.2/${this.tableName}`,
      {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify(this.toDataverseFormat(item)),
      }
    );

    if (!response.ok) {
      throw new Error(`Dataverse create failed: ${response.statusText}`);
    }

    // Get created record
    const location = response.headers.get('OData-EntityId');
    const id = location?.match(/\(([^)]+)\)/)?.[1];
    
    return this.read(id!) as Promise<T>;
  }

  async read(id: string): Promise<T | null> {
    await this.ensureAuthenticated();

    try {
      const response = await fetch(
        `${this.environmentUrl}/api/data/v9.2/${this.tableName}(${id})`,
        {
          headers: await this.getHeaders(),
        }
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Dataverse read failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.fromDataverseFormat(data);
    } catch {
      return null;
    }
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    await this.ensureAuthenticated();

    const response = await fetch(
      `${this.environmentUrl}/api/data/v9.2/${this.tableName}(${id})`,
      {
        method: 'PATCH',
        headers: await this.getHeaders(),
        body: JSON.stringify(this.toDataverseFormat(updates)),
      }
    );

    if (!response.ok) {
      return null;
    }

    return this.read(id);
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureAuthenticated();

    const response = await fetch(
      `${this.environmentUrl}/api/data/v9.2/${this.tableName}(${id})`,
      {
        method: 'DELETE',
        headers: await this.getHeaders(),
      }
    );

    return response.ok;
  }

  async list(options?: QueryOptions): Promise<T[]> {
    await this.ensureAuthenticated();

    let url = `${this.environmentUrl}/api/data/v9.2/${this.tableName}`;
    const params: string[] = [];

    // Build OData query
    if (options?.filter) {
      const filterParts = Object.entries(options.filter)
        .map(([key, value]) => `${key} eq '${value}'`);
      params.push(`$filter=${filterParts.join(' and ')}`);
    }

    if (options?.orderBy) {
      const dir = options.orderDirection === 'asc' ? 'asc' : 'desc';
      params.push(`$orderby=${options.orderBy} ${dir}`);
    }

    if (options?.limit) {
      params.push(`$top=${options.limit}`);
    }

    if (options?.offset) {
      params.push(`$skip=${options.offset}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    const response = await fetch(url, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Dataverse list failed: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.value || []).map((item: any) => this.fromDataverseFormat(item));
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    await this.ensureAuthenticated();

    let url = `${this.environmentUrl}/api/data/v9.2/${this.tableName}/$count`;

    if (filter) {
      const filterParts = Object.entries(filter)
        .map(([key, value]) => `${key} eq '${value}'`);
      url += `?$filter=${filterParts.join(' and ')}`;
    }

    const response = await fetch(url, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      return 0;
    }

    return parseInt(await response.text(), 10);
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.ensureAuthenticated();
      const response = await fetch(
        `${this.environmentUrl}/api/data/v9.2/${this.tableName}?$top=1`,
        {
          headers: await this.getHeaders(),
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return;
    }

    // Get token using client credentials flow
    const tenantId = process.env.AZURE_TENANT_ID!;
    const clientId = process.env.AZURE_CLIENT_ID!;
    const clientSecret = process.env.AZURE_CLIENT_SECRET!;

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: `${this.environmentUrl}/.default`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Dataverse');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);
  }

  private async getHeaders(): Promise<Record<string, string>> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
    };
  }

  private toDataverseFormat(item: any): Record<string, unknown> {
    // Convert camelCase to Dataverse naming convention
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(item)) {
      if (key === 'id') continue; // Skip ID for creates
      
      // Handle nested objects as JSON strings
      if (typeof value === 'object' && value !== null) {
        result[`mpa_${key}`] = JSON.stringify(value);
      } else {
        result[`mpa_${key}`] = value;
      }
    }

    return result;
  }

  private fromDataverseFormat(data: any): T {
    const result: Record<string, unknown> = {
      id: data[`${this.tableName}id`] || data.id,
    };

    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('mpa_')) {
        const cleanKey = key.replace('mpa_', '');
        
        // Try to parse JSON strings
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
          try {
            result[cleanKey] = JSON.parse(value);
          } catch {
            result[cleanKey] = value;
          }
        } else {
          result[cleanKey] = value;
        }
      }
    }

    // Map Dataverse timestamps
    result.createdAt = data.createdon;
    result.updatedAt = data.modifiedon;

    return result as T;
  }
}
```


STORAGE FACTORY
---------------

File: storage/storage-factory.ts

```typescript
import { Storage, StorageItem, StorageConfig } from './storage-interface.js';
import { JsonStorage } from './json-storage.js';
import { DataverseStorage } from './dataverse-storage.js';

export class StorageFactory {
  static create<T extends StorageItem>(
    config: StorageConfig,
    collectionName: string
  ): Storage<T> {
    switch (config.backend) {
      case 'json':
        return new JsonStorage<T>(config, collectionName);
      case 'dataverse':
        return new DataverseStorage<T>(config, collectionName);
      case 'azure-blob':
        // TODO: Implement Azure Blob storage
        throw new Error('Azure Blob storage not yet implemented');
      default:
        throw new Error(`Unknown storage backend: ${config.backend}`);
    }
  }
}
```


================================================================================
PART 6: COPILOT STUDIO INTEGRATION
================================================================================

OVERVIEW
--------

Copilot Studio requires a different architecture than direct API calls:

1. Topics handle conversation flow
2. Power Automate flows execute business logic
3. Dataverse stores data
4. SharePoint hosts knowledge base documents
5. Azure AI Search provides RAG capabilities
6. Azure Functions handle complex operations

The multi-platform system provides:
- Power Automate flow templates (JSON export)
- Dataverse table definitions
- Azure Function code
- SharePoint configuration


POWER AUTOMATE FLOW: RAG SEARCH
-------------------------------

File: copilot-studio/flows/rag-search-flow.json

```json
{
  "name": "MPA_RAG_Search",
  "description": "Performs RAG search against Azure AI Search for MPA agent",
  "trigger": {
    "type": "manual",
    "inputs": {
      "schema": {
        "type": "object",
        "properties": {
          "query": { "type": "string" },
          "topK": { "type": "integer", "default": 5 },
          "topic": { "type": "string" }
        },
        "required": ["query"]
      }
    }
  },
  "actions": [
    {
      "name": "Generate_Embedding",
      "type": "HTTP",
      "inputs": {
        "method": "POST",
        "uri": "@{parameters('AzureOpenAIEndpoint')}/openai/deployments/text-embedding-ada-002/embeddings?api-version=2024-02-15-preview",
        "headers": {
          "api-key": "@{parameters('AzureOpenAIKey')}",
          "Content-Type": "application/json"
        },
        "body": {
          "input": "@{triggerBody()?['query']}"
        }
      }
    },
    {
      "name": "Search_Azure_AI",
      "type": "HTTP",
      "inputs": {
        "method": "POST",
        "uri": "@{parameters('AzureSearchEndpoint')}/indexes/mpa-knowledge-base/docs/search?api-version=2024-05-01-preview",
        "headers": {
          "api-key": "@{parameters('AzureSearchKey')}",
          "Content-Type": "application/json"
        },
        "body": {
          "vectorQueries": [
            {
              "kind": "vector",
              "vector": "@{body('Generate_Embedding')?['data'][0]['embedding']}",
              "fields": "contentVector",
              "k": "@{triggerBody()?['topK']}"
            }
          ],
          "select": "id,content,source,documentType"
        }
      }
    },
    {
      "name": "Format_Results",
      "type": "Compose",
      "inputs": {
        "results": "@{body('Search_Azure_AI')?['value']}",
        "query": "@{triggerBody()?['query']}"
      }
    },
    {
      "name": "Response",
      "type": "Response",
      "inputs": {
        "statusCode": 200,
        "body": "@{outputs('Format_Results')}"
      }
    }
  ]
}
```


POWER AUTOMATE FLOW: SELF-CRITIQUE
----------------------------------

File: copilot-studio/flows/self-critique-flow.json

```json
{
  "name": "MPA_Self_Critique",
  "description": "Performs self-critique on agent response using Azure OpenAI",
  "trigger": {
    "type": "manual",
    "inputs": {
      "schema": {
        "type": "object",
        "properties": {
          "response": { "type": "string" },
          "userMessage": { "type": "string" },
          "currentStep": { "type": "integer" }
        },
        "required": ["response", "userMessage"]
      }
    }
  },
  "actions": [
    {
      "name": "Call_Critique_Model",
      "type": "HTTP",
      "inputs": {
        "method": "POST",
        "uri": "@{parameters('AzureOpenAIEndpoint')}/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-02-15-preview",
        "headers": {
          "api-key": "@{parameters('AzureOpenAIKey')}",
          "Content-Type": "application/json"
        },
        "body": {
          "messages": [
            {
              "role": "system",
              "content": "You are a quality checker for an AI media planning assistant. Review responses against criteria and suggest revisions ONLY when necessary. Output valid JSON only."
            },
            {
              "role": "user",
              "content": "RESPONSE TO CRITIQUE:\n@{triggerBody()?['response']}\n\nCONTEXT:\n- User message: @{triggerBody()?['userMessage']}\n- Current step: @{triggerBody()?['currentStep']}\n\nCRITERIA:\n1. source-citation: Benchmark claims must cite source\n2. acronym-definition: First use must define acronym\n3. response-length: Under 75 words\n4. single-question: Only ONE question\n\nOutput JSON: {\"needsRevision\": true/false, \"revisedResponse\": \"...\" or null, \"checks\": [{\"criterion\": \"...\", \"passed\": true/false}]}"
            }
          ],
          "temperature": 0,
          "max_tokens": 800
        }
      }
    },
    {
      "name": "Parse_Critique",
      "type": "ParseJSON",
      "inputs": {
        "content": "@{body('Call_Critique_Model')?['choices'][0]['message']['content']}",
        "schema": {
          "type": "object",
          "properties": {
            "needsRevision": { "type": "boolean" },
            "revisedResponse": { "type": "string" },
            "checks": { "type": "array" }
          }
        }
      }
    },
    {
      "name": "Response",
      "type": "Response",
      "inputs": {
        "statusCode": 200,
        "body": {
          "originalResponse": "@{triggerBody()?['response']}",
          "revisedResponse": "@{if(body('Parse_Critique')?['needsRevision'], body('Parse_Critique')?['revisedResponse'], triggerBody()?['response'])}",
          "wasRevised": "@{body('Parse_Critique')?['needsRevision']}",
          "checks": "@{body('Parse_Critique')?['checks']}"
        }
      }
    }
  ]
}
```


DATAVERSE TABLE DEFINITIONS
---------------------------

File: copilot-studio/dataverse/tables.json

```json
{
  "tables": [
    {
      "logicalName": "mpa_successpattern",
      "displayName": "MPA Success Pattern",
      "description": "Stores high-scoring agent responses for few-shot learning",
      "columns": [
        {
          "logicalName": "mpa_successpatternid",
          "displayName": "Success Pattern ID",
          "type": "UniqueIdentifier",
          "isPrimaryKey": true
        },
        {
          "logicalName": "mpa_scenario",
          "displayName": "Scenario",
          "type": "String",
          "maxLength": 200
        },
        {
          "logicalName": "mpa_usermessage",
          "displayName": "User Message",
          "type": "Memo",
          "maxLength": 10000
        },
        {
          "logicalName": "mpa_agentresponse",
          "displayName": "Agent Response",
          "type": "Memo",
          "maxLength": 10000
        },
        {
          "logicalName": "mpa_scores",
          "displayName": "Scores (JSON)",
          "type": "Memo",
          "maxLength": 5000
        },
        {
          "logicalName": "mpa_compositescore",
          "displayName": "Composite Score",
          "type": "Decimal",
          "precision": 4,
          "scale": 2
        },
        {
          "logicalName": "mpa_embedding",
          "displayName": "Message Embedding (JSON)",
          "type": "Memo",
          "maxLength": 50000
        }
      ]
    },
    {
      "logicalName": "mpa_userfeedback",
      "displayName": "MPA User Feedback",
      "description": "Captures user feedback on agent responses",
      "columns": [
        {
          "logicalName": "mpa_userfeedbackid",
          "displayName": "Feedback ID",
          "type": "UniqueIdentifier",
          "isPrimaryKey": true
        },
        {
          "logicalName": "mpa_feedbacktype",
          "displayName": "Feedback Type",
          "type": "Picklist",
          "options": [
            { "value": 1, "label": "Thumbs Up" },
            { "value": 2, "label": "Thumbs Down" },
            { "value": 3, "label": "Edit" },
            { "value": 4, "label": "Explicit Rating" }
          ]
        },
        {
          "logicalName": "mpa_sessionid",
          "displayName": "Session ID",
          "type": "String",
          "maxLength": 100
        },
        {
          "logicalName": "mpa_usermessage",
          "displayName": "User Message",
          "type": "Memo",
          "maxLength": 10000
        },
        {
          "logicalName": "mpa_agentresponse",
          "displayName": "Agent Response",
          "type": "Memo",
          "maxLength": 10000
        },
        {
          "logicalName": "mpa_editedresponse",
          "displayName": "Edited Response",
          "type": "Memo",
          "maxLength": 10000
        },
        {
          "logicalName": "mpa_rating",
          "displayName": "Rating",
          "type": "Integer",
          "minValue": 1,
          "maxValue": 5
        },
        {
          "logicalName": "mpa_comment",
          "displayName": "Comment",
          "type": "Memo",
          "maxLength": 5000
        }
      ]
    },
    {
      "logicalName": "mpa_kbenhancement",
      "displayName": "MPA KB Enhancement",
      "description": "Tracks KB enhancement suggestions from learning pipeline",
      "columns": [
        {
          "logicalName": "mpa_kbenhancementid",
          "displayName": "Enhancement ID",
          "type": "UniqueIdentifier",
          "isPrimaryKey": true
        },
        {
          "logicalName": "mpa_scorer",
          "displayName": "Target Scorer",
          "type": "String",
          "maxLength": 100
        },
        {
          "logicalName": "mpa_currentscore",
          "displayName": "Current Score",
          "type": "Decimal",
          "precision": 4,
          "scale": 2
        },
        {
          "logicalName": "mpa_targetscore",
          "displayName": "Target Score",
          "type": "Decimal",
          "precision": 4,
          "scale": 2
        },
        {
          "logicalName": "mpa_suggestedcontent",
          "displayName": "Suggested KB Content",
          "type": "Memo",
          "maxLength": 50000
        },
        {
          "logicalName": "mpa_status",
          "displayName": "Status",
          "type": "Picklist",
          "options": [
            { "value": 1, "label": "Pending Review" },
            { "value": 2, "label": "Approved" },
            { "value": 3, "label": "Rejected" },
            { "value": 4, "label": "Applied" }
          ]
        },
        {
          "logicalName": "mpa_reviewedby",
          "displayName": "Reviewed By",
          "type": "Lookup",
          "targetEntity": "systemuser"
        },
        {
          "logicalName": "mpa_reviewedon",
          "displayName": "Reviewed On",
          "type": "DateTime"
        }
      ]
    }
  ]
}
```


AZURE FUNCTION: KB INDEXER
--------------------------

File: copilot-studio/azure-functions/kb-indexer/index.ts

```typescript
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { BlobServiceClient } from '@azure/storage-blob';
import { OpenAI } from 'openai';

/**
 * Azure Function: Index SharePoint KB Documents to Azure AI Search
 * 
 * Triggered by:
 * - HTTP request (manual reindex)
 * - Timer (scheduled refresh)
 * - Event Grid (SharePoint document changes)
 */
const kbIndexer: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT!;
  const searchKey = process.env.AZURE_SEARCH_KEY!;
  const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT!;
  const openaiKey = process.env.AZURE_OPENAI_KEY!;
  const storageConnectionString = process.env.AZURE_STORAGE_CONNECTION!;
  const containerName = process.env.KB_CONTAINER_NAME || 'mpa-knowledge-base';

  context.log('Starting KB indexing...');

  // Initialize clients
  const searchClient = new SearchClient(
    searchEndpoint,
    'mpa-knowledge-base',
    new AzureKeyCredential(searchKey)
  );

  const openai = new OpenAI({
    apiKey: openaiKey,
    baseURL: `${openaiEndpoint}/openai/deployments/text-embedding-ada-002`,
    defaultQuery: { 'api-version': '2024-02-15-preview' },
    defaultHeaders: { 'api-key': openaiKey },
  });

  const blobClient = BlobServiceClient.fromConnectionString(storageConnectionString);
  const containerClient = blobClient.getContainerClient(containerName);

  // List all KB documents
  const documents: any[] = [];
  
  for await (const blob of containerClient.listBlobsFlat()) {
    if (!blob.name.endsWith('.txt') && !blob.name.endsWith('.md')) {
      continue;
    }

    context.log(`Processing: ${blob.name}`);

    // Download content
    const blobDownload = containerClient.getBlobClient(blob.name);
    const downloadResponse = await blobDownload.download();
    const content = await streamToString(downloadResponse.readableStreamBody!);

    // Chunk content
    const chunks = chunkDocument(content, blob.name);

    // Generate embeddings for each chunk
    for (const chunk of chunks) {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk.content,
      });

      documents.push({
        id: chunk.id,
        content: chunk.content,
        contentVector: embeddingResponse.data[0].embedding,
        source: blob.name,
        documentType: extractDocumentType(blob.name),
        chunkIndex: chunk.index,
      });
    }
  }

  // Upload to Azure AI Search
  context.log(`Uploading ${documents.length} chunks to search index...`);
  
  const batchSize = 100;
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    await searchClient.uploadDocuments(batch);
  }

  context.log('KB indexing complete');
  
  context.res = {
    status: 200,
    body: {
      documentsIndexed: documents.length,
      timestamp: new Date().toISOString(),
    },
  };
};

function chunkDocument(content: string, filename: string): Array<{ id: string; content: string; index: number }> {
  const chunks: Array<{ id: string; content: string; index: number }> = [];
  const lines = content.split('\n');
  
  let currentChunk = '';
  let chunkIndex = 0;
  const targetSize = 400; // tokens (approx 4 chars per token)
  const maxSize = 600;

  for (const line of lines) {
    // Check for section headers (ALL CAPS)
    const isHeader = /^[A-Z][A-Z\s]+$/.test(line.trim());
    
    if (isHeader && currentChunk.length > 100 * 4) {
      // Start new chunk at section boundary
      chunks.push({
        id: `${filename.replace(/[^a-z0-9]/gi, '-')}-${chunkIndex}`,
        content: currentChunk.trim(),
        index: chunkIndex,
      });
      chunkIndex++;
      currentChunk = line + '\n';
    } else {
      currentChunk += line + '\n';
      
      // Split if exceeding max size
      if (currentChunk.length > maxSize * 4) {
        chunks.push({
          id: `${filename.replace(/[^a-z0-9]/gi, '-')}-${chunkIndex}`,
          content: currentChunk.trim(),
          index: chunkIndex,
        });
        chunkIndex++;
        currentChunk = '';
      }
    }
  }

  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `${filename.replace(/[^a-z0-9]/gi, '-')}-${chunkIndex}`,
      content: currentChunk.trim(),
      index: chunkIndex,
    });
  }

  return chunks;
}

function extractDocumentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('benchmark')) return 'benchmark';
  if (lower.includes('channel')) return 'channel';
  if (lower.includes('audience')) return 'audience';
  if (lower.includes('measurement')) return 'measurement';
  if (lower.includes('budget')) return 'budget';
  return 'general';
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export default kbIndexer;
```


================================================================================
PART 7: UNIFIED CONFIGURATION
================================================================================

PLATFORM CONFIGURATION
----------------------

File: config/platform-config.ts

```typescript
/**
 * Unified Platform Configuration
 * 
 * Single configuration object that defines behavior for all platforms.
 */

import { LLMProviderConfig } from '../providers/llm-provider.js';
import { EmbeddingProviderConfig } from '../embeddings/embedding-provider.js';
import { VectorStoreConfig } from '../vector-stores/vector-store.js';
import { StorageConfig } from '../storage/storage-interface.js';

export interface PlatformConfig {
  // Platform identifier
  platform: 'braintrust' | 'development' | 'copilot-studio';
  
  // LLM configuration
  llm: {
    primary: LLMProviderConfig;
    critique?: LLMProviderConfig;  // For self-critique (smaller/faster model)
  };
  
  // Embedding configuration
  embeddings: EmbeddingProviderConfig;
  
  // Vector store configuration
  vectorStore: VectorStoreConfig;
  
  // Storage configuration
  storage: StorageConfig;
  
  // Knowledge base paths
  knowledgeBase: {
    source: 'local' | 'sharepoint' | 'azure-blob';
    path?: string;  // Local path or container name
    sharePointSite?: string;
    sharePointLibrary?: string;
  };
  
  // Feature flags
  features: {
    ragEnabled: boolean;
    selfCritiqueEnabled: boolean;
    successPatternsEnabled: boolean;
    userFeedbackEnabled: boolean;
    kbEnhancementEnabled: boolean;
  };
  
  // Learning system configuration
  learning: {
    minScoreThreshold: number;
    maxPatternsToRetrieve: number;
    critiqueModel?: string;
  };
}

// Default configurations for each platform
export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  // Braintrust evaluation environment
  braintrust: {
    platform: 'braintrust',
    llm: {
      primary: {
        provider: 'claude',
        model: 'claude-sonnet-4-20250514',
        maxTokens: 1024,
        temperature: 0.7,
      },
      critique: {
        provider: 'claude',
        model: 'claude-3-5-haiku-20241022',
        maxTokens: 800,
        temperature: 0,
      },
    },
    embeddings: {
      provider: 'tfidf',
      dimensions: 512,
    },
    vectorStore: {
      backend: 'memory',
    },
    storage: {
      backend: 'json',
      basePath: './storage',
    },
    knowledgeBase: {
      source: 'local',
      path: '../../../kb',
    },
    features: {
      ragEnabled: true,
      selfCritiqueEnabled: true,
      successPatternsEnabled: true,
      userFeedbackEnabled: false,
      kbEnhancementEnabled: true,
    },
    learning: {
      minScoreThreshold: 0.95,
      maxPatternsToRetrieve: 2,
    },
  },

  // Development environment (OpenAI alternative)
  development: {
    platform: 'development',
    llm: {
      primary: {
        provider: 'openai',
        model: 'gpt-4o',
        maxTokens: 1024,
        temperature: 0.7,
      },
      critique: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        maxTokens: 800,
        temperature: 0,
      },
    },
    embeddings: {
      provider: 'openai',
      model: 'text-embedding-3-small',
      dimensions: 1536,
    },
    vectorStore: {
      backend: 'memory',
    },
    storage: {
      backend: 'json',
      basePath: './storage',
    },
    knowledgeBase: {
      source: 'local',
      path: '../../../kb',
    },
    features: {
      ragEnabled: true,
      selfCritiqueEnabled: true,
      successPatternsEnabled: true,
      userFeedbackEnabled: false,
      kbEnhancementEnabled: true,
    },
    learning: {
      minScoreThreshold: 0.95,
      maxPatternsToRetrieve: 2,
    },
  },

  // Copilot Studio production environment
  'copilot-studio': {
    platform: 'copilot-studio',
    llm: {
      primary: {
        provider: 'azure-openai',
        model: 'gpt-4o',
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiVersion: '2024-02-15-preview',
        maxTokens: 1024,
        temperature: 0.7,
      },
      critique: {
        provider: 'azure-openai',
        model: 'gpt-4o-mini',
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiVersion: '2024-02-15-preview',
        maxTokens: 800,
        temperature: 0,
      },
    },
    embeddings: {
      provider: 'azure-openai',
      model: 'text-embedding-ada-002',
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      dimensions: 1536,
    },
    vectorStore: {
      backend: 'azure-ai-search',
      endpoint: process.env.AZURE_SEARCH_ENDPOINT,
      indexName: 'mpa-knowledge-base',
    },
    storage: {
      backend: 'dataverse',
      environmentUrl: process.env.DATAVERSE_URL,
    },
    knowledgeBase: {
      source: 'sharepoint',
      sharePointSite: process.env.SHAREPOINT_SITE,
      sharePointLibrary: 'MPA Knowledge Base',
    },
    features: {
      ragEnabled: true,
      selfCritiqueEnabled: true,
      successPatternsEnabled: true,
      userFeedbackEnabled: true,
      kbEnhancementEnabled: true,
    },
    learning: {
      minScoreThreshold: 0.95,
      maxPatternsToRetrieve: 2,
    },
  },
};

/**
 * Get platform configuration
 */
export function getPlatformConfig(platform?: string): PlatformConfig {
  const platformName = platform || process.env.MPA_PLATFORM || 'braintrust';
  const config = PLATFORM_CONFIGS[platformName];
  
  if (!config) {
    throw new Error(`Unknown platform: ${platformName}`);
  }
  
  return config;
}
```


================================================================================
PART 8: FILE STRUCTURE SUMMARY
================================================================================

```
braintrust/
├── providers/
│   ├── llm-provider.ts              # Interface + types
│   ├── claude-provider.ts           # Anthropic implementation
│   ├── openai-provider.ts           # OpenAI implementation
│   ├── azure-openai-provider.ts     # Azure OpenAI implementation
│   ├── provider-factory.ts          # Factory function
│   └── index.ts                     # Exports
│
├── embeddings/
│   ├── embedding-provider.ts        # Interface
│   ├── tfidf-provider.ts            # Local TF-IDF
│   ├── openai-embedding-provider.ts # OpenAI Ada
│   ├── azure-embedding-provider.ts  # Azure OpenAI embeddings
│   ├── embedding-factory.ts         # Factory function
│   └── index.ts                     # Exports
│
├── vector-stores/
│   ├── vector-store.ts              # Interface
│   ├── memory-store.ts              # In-memory store
│   ├── azure-search-store.ts        # Azure AI Search
│   ├── store-factory.ts             # Factory function
│   └── index.ts                     # Exports
│
├── storage/
│   ├── storage-interface.ts         # Interface
│   ├── json-storage.ts              # JSON file storage
│   ├── dataverse-storage.ts         # Dataverse storage
│   ├── storage-factory.ts           # Factory function
│   └── index.ts                     # Exports
│
├── rag/
│   ├── types.ts                     # RAG-specific types
│   ├── document-processor.ts        # Chunking logic
│   ├── retrieval-engine.ts          # Unified retrieval
│   ├── tool-executor.ts             # Tool execution
│   └── index.ts                     # Exports
│
├── learning/
│   ├── types.ts                     # Learning types
│   ├── criteria/
│   │   └── critique-criteria.ts     # Critique rules
│   ├── self-critique.ts             # Layer C
│   ├── success-patterns.ts          # Layer B
│   ├── kb-enhancement-pipeline.ts   # Layer A
│   ├── user-feedback.ts             # Layer D
│   └── index.ts                     # Exports
│
├── config/
│   ├── platform-config.ts           # Platform configurations
│   └── index.ts                     # Exports
│
├── copilot-studio/
│   ├── flows/
│   │   ├── rag-search-flow.json     # RAG search flow
│   │   ├── self-critique-flow.json  # Critique flow
│   │   └── feedback-flow.json       # Feedback capture
│   ├── dataverse/
│   │   └── tables.json              # Table definitions
│   └── azure-functions/
│       ├── kb-indexer/
│       │   └── index.ts             # KB indexing function
│       └── host.json                # Function app config
│
├── conversation-engine.ts           # Modified main engine
├── mpa-multi-turn-eval.ts           # Evaluation runner
└── package.json                     # Dependencies
```


================================================================================
PART 9: IMPLEMENTATION ORDER
================================================================================

PHASE 1: Provider Abstraction (1-2 hours)
-----------------------------------------
1. Create providers/ directory
2. Implement llm-provider.ts interface
3. Implement claude-provider.ts
4. Implement openai-provider.ts
5. Implement azure-openai-provider.ts
6. Create provider-factory.ts
7. Test with simple prompts

PHASE 2: Embedding Abstraction (1 hour)
---------------------------------------
1. Create embeddings/ directory
2. Implement embedding-provider.ts interface
3. Implement tfidf-provider.ts
4. Implement openai-embedding-provider.ts
5. Implement azure-embedding-provider.ts
6. Create embedding-factory.ts
7. Test embeddings

PHASE 3: Vector Store Abstraction (1-2 hours)
---------------------------------------------
1. Create vector-stores/ directory
2. Implement vector-store.ts interface
3. Implement memory-store.ts
4. Implement azure-search-store.ts
5. Create store-factory.ts
6. Test search functionality

PHASE 4: Storage Abstraction (1 hour)
-------------------------------------
1. Create storage/ directory
2. Implement storage-interface.ts
3. Implement json-storage.ts
4. Implement dataverse-storage.ts
5. Create storage-factory.ts
6. Test CRUD operations

PHASE 5: Platform Configuration (30 min)
----------------------------------------
1. Create config/ directory
2. Implement platform-config.ts
3. Test configuration loading

PHASE 6: RAG Integration (2 hours)
----------------------------------
1. Update rag/types.ts for providers
2. Update retrieval-engine.ts to use abstractions
3. Update tool-executor.ts
4. Test RAG with each provider

PHASE 7: Learning Integration (1-2 hours)
-----------------------------------------
1. Update learning components for abstractions
2. Test self-critique with each provider
3. Test success patterns with each storage

PHASE 8: Conversation Engine Update (1 hour)
--------------------------------------------
1. Update conversation-engine.ts for providers
2. Add platform configuration support
3. Test full conversation flow

PHASE 9: Copilot Studio Assets (2 hours)
----------------------------------------
1. Create Power Automate flow templates
2. Create Dataverse table definitions
3. Create Azure Function code
4. Document deployment process

PHASE 10: Testing and Validation (2 hours)
------------------------------------------
1. Run Braintrust eval with Claude
2. Run eval with OpenAI
3. Validate Copilot Studio assets
4. Document any issues


================================================================================
PART 10: DEPENDENCIES
================================================================================

PACKAGE.JSON ADDITIONS
----------------------

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.0",
    "openai": "^4.28.0",
    "@azure/search-documents": "^12.0.0",
    "@azure/storage-blob": "^12.17.0",
    "natural": "^6.10.0",
    "braintrust": "^0.0.160",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/natural": "^5.1.0",
    "typescript": "^5.3.0"
  }
}
```


ENVIRONMENT VARIABLES
---------------------

```env
# Platform selection
MPA_PLATFORM=braintrust  # or development, copilot-studio

# Claude (Braintrust)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (Development)
OPENAI_API_KEY=sk-...

# Azure OpenAI (Copilot Studio)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=...

# Azure AI Search (Copilot Studio)
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net
AZURE_SEARCH_API_KEY=...

# Dataverse (Copilot Studio)
DATAVERSE_URL=https://your-org.crm.dynamics.com
AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...

# SharePoint (Copilot Studio)
SHAREPOINT_SITE=https://your-tenant.sharepoint.com/sites/mpa
```


================================================================================
END OF SPECIFICATION
================================================================================
