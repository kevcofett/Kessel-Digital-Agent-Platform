# PHASE 7: STACK TOGGLE SYSTEM
# Runtime Switching Between Claude and Microsoft Stacks

**Purpose:** Enable runtime switching between Claude (personal) and Microsoft (corporate) stacks
**Default:** Microsoft stack ON for deploy/mastercard branch
**Both stacks available:** Yes - toggle via environment variable

---

## OVERVIEW

This phase creates a stack toggle system that:
1. Supports both Claude and Microsoft stacks in the same codebase
2. Defaults to Microsoft stack in Mastercard environment
3. Allows runtime switching via environment variables
4. Provides type-safe provider loading based on active stack

---

## ARCHITECTURE

```
AGENT_STACK=microsoft (default in Mastercard)
    ↓
StackToggle detects environment
    ↓
ProviderFactory loads Microsoft providers:
    - LLM: Azure OpenAI (via Copilot Studio)
    - Embedding: Azure OpenAI Embeddings
    - Storage: Dataverse
    - KB: SharePoint
    ↓
Agent runs with Microsoft infrastructure

AGENT_STACK=claude (for testing/development)
    ↓
StackToggle detects environment
    ↓
ProviderFactory loads Claude providers:
    - LLM: Claude API
    - Embedding: OpenAI Embeddings
    - Storage: Local filesystem
    - KB: Local filesystem
    ↓
Agent runs with Claude infrastructure
```

---

## STEP 7.1: Create Stack Types

**File:** `packages/agent-core/src/config/stack-types.ts`

```typescript
/**
 * Stack Types for Multi-Provider Support
 * Enables runtime switching between Claude and Microsoft stacks
 */

/**
 * Available stack types
 */
export type StackType = 'claude' | 'microsoft';

/**
 * Claude stack configuration
 */
export interface ClaudeStackConfig {
  type: 'claude';
  
  llm: {
    apiKey: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
  };
  
  embedding: {
    provider: 'openai';
    apiKey: string;
    model: string;
    dimensions?: number;
  };
  
  storage: {
    type: 'local-fs';
    basePath: string;
  };
  
  kb: {
    type: 'local-fs';
    basePath: string;
    indexPath?: string;
  };
}

/**
 * Microsoft stack configuration
 */
export interface MicrosoftStackConfig {
  type: 'microsoft';
  
  copilotStudio: {
    environmentUrl: string;
    botId: string;
    tenantId: string;
    clientId?: string;
    clientSecret?: string;
  };
  
  azureOpenAI: {
    endpoint: string;
    deploymentName: string;
    apiKey?: string;
    apiVersion?: string;
    embeddingDeployment?: string;
  };
  
  dataverse: {
    environmentUrl: string;
    tenantId: string;
    clientId: string;
    clientSecret: string;
  };
  
  sharePoint: {
    siteUrl: string;
    libraryName: string;
    tenantId: string;
    clientId: string;
    clientSecret: string;
  };
  
  azureAISearch?: {
    endpoint: string;
    apiKey: string;
    indexName: string;
  };
}

/**
 * Combined stack configuration
 */
export type StackConfig = ClaudeStackConfig | MicrosoftStackConfig;

/**
 * Feature flags for stack-specific features
 */
export interface StackFeatureFlags {
  // LLM Features
  useCopilotStudioOrchestration: boolean;
  useAzureOpenAIDirectly: boolean;
  useClaudeAPI: boolean;
  
  // Storage Features
  useDataverseStorage: boolean;
  useLocalStorage: boolean;
  
  // KB Features
  useSharePointKB: boolean;
  useAzureAISearch: boolean;
  useLocalKB: boolean;
  
  // Workflow Features
  usePowerAutomateFlows: boolean;
  
  // Tracking Features
  useDataverseImpactTracking: boolean;
  useLocalImpactTracking: boolean;
  
  // Debug Features
  enableDebugLogging: boolean;
  enablePerformanceMetrics: boolean;
}

/**
 * Default feature flags for Claude stack
 */
export const CLAUDE_STACK_FEATURES: StackFeatureFlags = {
  useCopilotStudioOrchestration: false,
  useAzureOpenAIDirectly: false,
  useClaudeAPI: true,
  
  useDataverseStorage: false,
  useLocalStorage: true,
  
  useSharePointKB: false,
  useAzureAISearch: false,
  useLocalKB: true,
  
  usePowerAutomateFlows: false,
  
  useDataverseImpactTracking: false,
  useLocalImpactTracking: true,
  
  enableDebugLogging: true,
  enablePerformanceMetrics: true,
};

/**
 * Default feature flags for Microsoft stack
 */
export const MICROSOFT_STACK_FEATURES: StackFeatureFlags = {
  useCopilotStudioOrchestration: true,
  useAzureOpenAIDirectly: true,
  useClaudeAPI: false,
  
  useDataverseStorage: true,
  useLocalStorage: false,
  
  useSharePointKB: true,
  useAzureAISearch: true,
  useLocalKB: false,
  
  usePowerAutomateFlows: true,
  
  useDataverseImpactTracking: true,
  useLocalImpactTracking: false,
  
  enableDebugLogging: false,
  enablePerformanceMetrics: true,
};

/**
 * Stack detection result
 */
export interface StackDetectionResult {
  stack: StackType;
  source: 'environment' | 'config-file' | 'auto-detect' | 'default';
  features: StackFeatureFlags;
  configPath?: string;
}

/**
 * Provider availability check result
 */
export interface ProviderAvailability {
  llm: {
    claude: boolean;
    azureOpenAI: boolean;
    copilotStudio: boolean;
  };
  embedding: {
    openai: boolean;
    azureOpenAI: boolean;
  };
  storage: {
    local: boolean;
    dataverse: boolean;
  };
  kb: {
    local: boolean;
    sharePoint: boolean;
    azureAISearch: boolean;
  };
}
```

---

## STEP 7.2: Create Stack Toggle

**File:** `packages/agent-core/src/config/stack-toggle.ts`

```typescript
/**
 * Stack Toggle System
 * Runtime switching between Claude and Microsoft stacks
 */

import {
  StackType,
  StackConfig,
  StackFeatureFlags,
  StackDetectionResult,
  ProviderAvailability,
  ClaudeStackConfig,
  MicrosoftStackConfig,
  CLAUDE_STACK_FEATURES,
  MICROSOFT_STACK_FEATURES,
} from './stack-types.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Environment variable names
 */
const ENV_VARS = {
  STACK: 'AGENT_STACK',
  CONFIG_PATH: 'AGENT_CONFIG_PATH',
  
  // Claude stack
  CLAUDE_API_KEY: 'ANTHROPIC_API_KEY',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  
  // Microsoft stack
  AZURE_TENANT_ID: 'AZURE_TENANT_ID',
  AZURE_CLIENT_ID: 'AZURE_CLIENT_ID',
  AZURE_CLIENT_SECRET: 'AZURE_CLIENT_SECRET',
  AZURE_OPENAI_ENDPOINT: 'AZURE_OPENAI_ENDPOINT',
  AZURE_OPENAI_API_KEY: 'AZURE_OPENAI_API_KEY',
  AZURE_OPENAI_DEPLOYMENT: 'AZURE_OPENAI_DEPLOYMENT',
  DATAVERSE_URL: 'DATAVERSE_ENVIRONMENT_URL',
  SHAREPOINT_SITE_URL: 'SHAREPOINT_SITE_URL',
  COPILOT_STUDIO_BOT_ID: 'COPILOT_STUDIO_BOT_ID',
  COPILOT_STUDIO_ENV_URL: 'COPILOT_STUDIO_ENV_URL',
};

/**
 * Stack Toggle class for managing provider stacks
 */
export class StackToggle {
  private detectionResult: StackDetectionResult | null = null;
  private config: StackConfig | null = null;
  
  /**
   * Detect the active stack based on environment
   */
  detectStack(): StackDetectionResult {
    if (this.detectionResult) {
      return this.detectionResult;
    }
    
    // Priority 1: Explicit environment variable
    const explicitStack = process.env[ENV_VARS.STACK]?.toLowerCase();
    if (explicitStack === 'claude' || explicitStack === 'microsoft') {
      this.detectionResult = {
        stack: explicitStack,
        source: 'environment',
        features: explicitStack === 'claude' ? CLAUDE_STACK_FEATURES : MICROSOFT_STACK_FEATURES,
      };
      return this.detectionResult;
    }
    
    // Priority 2: Config file
    const configPath = process.env[ENV_VARS.CONFIG_PATH];
    if (configPath && fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configContent);
        const stack = config.type === 'microsoft' ? 'microsoft' : 'claude';
        this.detectionResult = {
          stack,
          source: 'config-file',
          features: stack === 'claude' ? CLAUDE_STACK_FEATURES : MICROSOFT_STACK_FEATURES,
          configPath,
        };
        return this.detectionResult;
      } catch (error) {
        console.warn(`Failed to read config file: ${configPath}`, error);
      }
    }
    
    // Priority 3: Auto-detect based on available credentials
    const availability = this.checkProviderAvailability();
    
    // If Microsoft credentials are available, use Microsoft stack
    if (availability.llm.azureOpenAI && availability.storage.dataverse) {
      this.detectionResult = {
        stack: 'microsoft',
        source: 'auto-detect',
        features: MICROSOFT_STACK_FEATURES,
      };
      return this.detectionResult;
    }
    
    // If Claude credentials are available, use Claude stack
    if (availability.llm.claude) {
      this.detectionResult = {
        stack: 'claude',
        source: 'auto-detect',
        features: CLAUDE_STACK_FEATURES,
      };
      return this.detectionResult;
    }
    
    // Priority 4: Default to Microsoft for Mastercard deployment
    // Change this to 'claude' for personal deployment default
    const defaultStack: StackType = 'microsoft';
    this.detectionResult = {
      stack: defaultStack,
      source: 'default',
      features: defaultStack === 'claude' ? CLAUDE_STACK_FEATURES : MICROSOFT_STACK_FEATURES,
    };
    return this.detectionResult;
  }
  
  /**
   * Check which providers have available credentials
   */
  checkProviderAvailability(): ProviderAvailability {
    return {
      llm: {
        claude: !!process.env[ENV_VARS.CLAUDE_API_KEY],
        azureOpenAI: !!(
          process.env[ENV_VARS.AZURE_OPENAI_ENDPOINT] &&
          (process.env[ENV_VARS.AZURE_OPENAI_API_KEY] || process.env[ENV_VARS.AZURE_CLIENT_ID])
        ),
        copilotStudio: !!(
          process.env[ENV_VARS.COPILOT_STUDIO_BOT_ID] &&
          process.env[ENV_VARS.COPILOT_STUDIO_ENV_URL]
        ),
      },
      embedding: {
        openai: !!process.env[ENV_VARS.OPENAI_API_KEY],
        azureOpenAI: !!(
          process.env[ENV_VARS.AZURE_OPENAI_ENDPOINT] &&
          (process.env[ENV_VARS.AZURE_OPENAI_API_KEY] || process.env[ENV_VARS.AZURE_CLIENT_ID])
        ),
      },
      storage: {
        local: true, // Always available
        dataverse: !!(
          process.env[ENV_VARS.DATAVERSE_URL] &&
          process.env[ENV_VARS.AZURE_TENANT_ID] &&
          process.env[ENV_VARS.AZURE_CLIENT_ID]
        ),
      },
      kb: {
        local: true, // Always available
        sharePoint: !!(
          process.env[ENV_VARS.SHAREPOINT_SITE_URL] &&
          process.env[ENV_VARS.AZURE_TENANT_ID]
        ),
        azureAISearch: false, // Requires explicit configuration
      },
    };
  }
  
  /**
   * Get the active stack type
   */
  getActiveStack(): StackType {
    return this.detectStack().stack;
  }
  
  /**
   * Check if Claude stack is active
   */
  isClaudeStack(): boolean {
    return this.getActiveStack() === 'claude';
  }
  
  /**
   * Check if Microsoft stack is active
   */
  isMicrosoftStack(): boolean {
    return this.getActiveStack() === 'microsoft';
  }
  
  /**
   * Get feature flags for active stack
   */
  getFeatureFlags(): StackFeatureFlags {
    return this.detectStack().features;
  }
  
  /**
   * Check if a specific feature is enabled
   */
  isFeatureEnabled(feature: keyof StackFeatureFlags): boolean {
    return this.getFeatureFlags()[feature];
  }
  
  /**
   * Load stack configuration from environment
   */
  loadConfig(): StackConfig {
    if (this.config) {
      return this.config;
    }
    
    const stack = this.getActiveStack();
    
    if (stack === 'claude') {
      this.config = this.loadClaudeConfig();
    } else {
      this.config = this.loadMicrosoftConfig();
    }
    
    return this.config;
  }
  
  /**
   * Load Claude stack configuration
   */
  private loadClaudeConfig(): ClaudeStackConfig {
    return {
      type: 'claude',
      
      llm: {
        apiKey: process.env[ENV_VARS.CLAUDE_API_KEY] || '',
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '4096', 10),
        temperature: parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7'),
      },
      
      embedding: {
        provider: 'openai',
        apiKey: process.env[ENV_VARS.OPENAI_API_KEY] || '',
        model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
        dimensions: parseInt(process.env.OPENAI_EMBEDDING_DIMENSIONS || '1536', 10),
      },
      
      storage: {
        type: 'local-fs',
        basePath: process.env.LOCAL_STORAGE_PATH || './data/storage',
      },
      
      kb: {
        type: 'local-fs',
        basePath: process.env.LOCAL_KB_PATH || './data/kb',
        indexPath: process.env.LOCAL_INDEX_PATH || './data/index',
      },
    };
  }
  
  /**
   * Load Microsoft stack configuration
   */
  private loadMicrosoftConfig(): MicrosoftStackConfig {
    return {
      type: 'microsoft',
      
      copilotStudio: {
        environmentUrl: process.env[ENV_VARS.COPILOT_STUDIO_ENV_URL] || '',
        botId: process.env[ENV_VARS.COPILOT_STUDIO_BOT_ID] || '',
        tenantId: process.env[ENV_VARS.AZURE_TENANT_ID] || '',
        clientId: process.env[ENV_VARS.AZURE_CLIENT_ID],
        clientSecret: process.env[ENV_VARS.AZURE_CLIENT_SECRET],
      },
      
      azureOpenAI: {
        endpoint: process.env[ENV_VARS.AZURE_OPENAI_ENDPOINT] || '',
        deploymentName: process.env[ENV_VARS.AZURE_OPENAI_DEPLOYMENT] || 'gpt-4',
        apiKey: process.env[ENV_VARS.AZURE_OPENAI_API_KEY],
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
        embeddingDeployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
      },
      
      dataverse: {
        environmentUrl: process.env[ENV_VARS.DATAVERSE_URL] || '',
        tenantId: process.env[ENV_VARS.AZURE_TENANT_ID] || '',
        clientId: process.env[ENV_VARS.AZURE_CLIENT_ID] || '',
        clientSecret: process.env[ENV_VARS.AZURE_CLIENT_SECRET] || '',
      },
      
      sharePoint: {
        siteUrl: process.env[ENV_VARS.SHAREPOINT_SITE_URL] || '',
        libraryName: process.env.SHAREPOINT_LIBRARY_NAME || 'AgentKnowledgeBase',
        tenantId: process.env[ENV_VARS.AZURE_TENANT_ID] || '',
        clientId: process.env[ENV_VARS.AZURE_CLIENT_ID] || '',
        clientSecret: process.env[ENV_VARS.AZURE_CLIENT_SECRET] || '',
      },
    };
  }
  
  /**
   * Get a summary of the current stack status
   */
  getStackSummary(): string {
    const detection = this.detectStack();
    const availability = this.checkProviderAvailability();
    
    const lines = [
      `Active Stack: ${detection.stack.toUpperCase()}`,
      `Detection Source: ${detection.source}`,
      '',
      'Provider Availability:',
      `  LLM: Claude=${availability.llm.claude}, AzureOpenAI=${availability.llm.azureOpenAI}, CopilotStudio=${availability.llm.copilotStudio}`,
      `  Embedding: OpenAI=${availability.embedding.openai}, AzureOpenAI=${availability.embedding.azureOpenAI}`,
      `  Storage: Local=${availability.storage.local}, Dataverse=${availability.storage.dataverse}`,
      `  KB: Local=${availability.kb.local}, SharePoint=${availability.kb.sharePoint}`,
      '',
      'Active Features:',
    ];
    
    const features = detection.features;
    for (const [key, value] of Object.entries(features)) {
      if (value) {
        lines.push(`  ✓ ${key}`);
      }
    }
    
    return lines.join('\n');
  }
  
  /**
   * Reset detection (useful for testing)
   */
  reset(): void {
    this.detectionResult = null;
    this.config = null;
  }
}

/**
 * Singleton instance
 */
let stackToggleInstance: StackToggle | null = null;

/**
 * Get the singleton StackToggle instance
 */
export function getStackToggle(): StackToggle {
  if (!stackToggleInstance) {
    stackToggleInstance = new StackToggle();
  }
  return stackToggleInstance;
}

/**
 * Convenience functions
 */
export function getActiveStack(): StackType {
  return getStackToggle().getActiveStack();
}

export function isClaudeStack(): boolean {
  return getStackToggle().isClaudeStack();
}

export function isMicrosoftStack(): boolean {
  return getStackToggle().isMicrosoftStack();
}

export function getFeatureFlags(): StackFeatureFlags {
  return getStackToggle().getFeatureFlags();
}

export function isFeatureEnabled(feature: keyof StackFeatureFlags): boolean {
  return getStackToggle().isFeatureEnabled(feature);
}
```

---

## STEP 7.3: Create Stack-Aware Provider Factory

**File:** `packages/agent-core/src/config/stack-provider-factory.ts`

```typescript
/**
 * Stack-Aware Provider Factory
 * Creates providers based on active stack configuration
 */

import {
  StackType,
  StackConfig,
  ClaudeStackConfig,
  MicrosoftStackConfig,
} from './stack-types.js';
import { getStackToggle, StackToggle } from './stack-toggle.js';
import { LLMProvider, StorageProvider } from '../providers/interfaces.js';

/**
 * Provider instances container
 */
export interface ProviderInstances {
  llm: LLMProvider;
  embedding: any; // EmbeddingProvider type from Phase 2
  storage: StorageProvider;
  kbStorage: any; // KBImpactStorage type from Phase 3
}

/**
 * Stack-aware provider factory
 */
export class StackProviderFactory {
  private stackToggle: StackToggle;
  private providers: Partial<ProviderInstances> = {};
  
  constructor(stackToggle?: StackToggle) {
    this.stackToggle = stackToggle || getStackToggle();
  }
  
  /**
   * Create all providers for the active stack
   */
  async createProviders(): Promise<ProviderInstances> {
    const config = this.stackToggle.loadConfig();
    
    if (config.type === 'claude') {
      return this.createClaudeProviders(config);
    } else {
      return this.createMicrosoftProviders(config);
    }
  }
  
  /**
   * Create Claude stack providers
   */
  private async createClaudeProviders(config: ClaudeStackConfig): Promise<ProviderInstances> {
    // Dynamic imports to avoid loading unused providers
    const { ClaudeLLMProvider } = await import('../providers/claude-llm.js');
    const { OpenAIEmbeddingProvider } = await import('../providers/openai-embedding.js');
    const { LocalKBImpactStorage } = await import('../learning/local-kb-impact-storage.js');
    
    // Create local storage provider
    const localStorageProvider = await this.createLocalStorageProvider(config.storage.basePath);
    
    return {
      llm: new ClaudeLLMProvider({
        apiKey: config.llm.apiKey,
        model: config.llm.model,
        maxTokens: config.llm.maxTokens,
      }),
      
      embedding: new OpenAIEmbeddingProvider({
        apiKey: config.embedding.apiKey,
        model: config.embedding.model,
        dimensions: config.embedding.dimensions,
      }),
      
      storage: localStorageProvider,
      
      kbStorage: new LocalKBImpactStorage({
        basePath: config.storage.basePath,
      }),
    };
  }
  
  /**
   * Create Microsoft stack providers
   */
  private async createMicrosoftProviders(config: MicrosoftStackConfig): Promise<ProviderInstances> {
    // Dynamic imports to avoid loading unused providers
    const { AzureOpenAILLMProvider } = await import('../providers/azure-openai-llm.js');
    const { AzureOpenAIEmbeddingProvider } = await import('../providers/azure-openai-embedding.js');
    const { DataverseStorageProvider } = await import('../providers/dataverse-storage.js');
    const { DataverseKBImpactStorage } = await import('../learning/dataverse-kb-impact-storage.js');
    
    // Determine LLM provider based on Copilot Studio configuration
    let llmProvider: LLMProvider;
    
    if (config.copilotStudio.botId && config.copilotStudio.environmentUrl) {
      // Use Copilot Studio for orchestration (LLM passthrough)
      const { CopilotStudioLLMProvider } = await import('../providers/copilot-studio-llm.js');
      llmProvider = new CopilotStudioLLMProvider({
        environmentUrl: config.copilotStudio.environmentUrl,
        botId: config.copilotStudio.botId,
        tenantId: config.copilotStudio.tenantId,
      });
    } else {
      // Use Azure OpenAI directly
      llmProvider = new AzureOpenAILLMProvider({
        endpoint: config.azureOpenAI.endpoint,
        deploymentName: config.azureOpenAI.deploymentName,
        apiKey: config.azureOpenAI.apiKey,
        apiVersion: config.azureOpenAI.apiVersion,
      });
    }
    
    return {
      llm: llmProvider,
      
      embedding: new AzureOpenAIEmbeddingProvider({
        endpoint: config.azureOpenAI.endpoint,
        deploymentName: config.azureOpenAI.embeddingDeployment || 'text-embedding-ada-002',
        apiKey: config.azureOpenAI.apiKey,
        apiVersion: config.azureOpenAI.apiVersion,
      }),
      
      storage: new DataverseStorageProvider({
        environmentUrl: config.dataverse.environmentUrl,
        tenantId: config.dataverse.tenantId,
        clientId: config.dataverse.clientId,
        clientSecret: config.dataverse.clientSecret,
      }),
      
      kbStorage: new DataverseKBImpactStorage({
        environmentUrl: config.dataverse.environmentUrl,
        tenantId: config.dataverse.tenantId,
        clientId: config.dataverse.clientId,
        clientSecret: config.dataverse.clientSecret,
      }),
    };
  }
  
  /**
   * Create local filesystem storage provider
   */
  private async createLocalStorageProvider(basePath: string): Promise<StorageProvider> {
    // Simple local storage implementation
    const fs = await import('fs');
    const path = await import('path');
    
    return {
      async save(key: string, data: any): Promise<void> {
        const filePath = path.join(basePath, `${key}.json`);
        const dir = path.dirname(filePath);
        
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      },
      
      async load(key: string): Promise<any> {
        const filePath = path.join(basePath, `${key}.json`);
        
        if (!fs.existsSync(filePath)) {
          return null;
        }
        
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      },
      
      async delete(key: string): Promise<void> {
        const filePath = path.join(basePath, `${key}.json`);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      },
      
      async exists(key: string): Promise<boolean> {
        const filePath = path.join(basePath, `${key}.json`);
        return fs.existsSync(filePath);
      },
      
      async list(prefix?: string): Promise<string[]> {
        if (!fs.existsSync(basePath)) {
          return [];
        }
        
        const files = fs.readdirSync(basePath);
        let keys = files
          .filter(f => f.endsWith('.json'))
          .map(f => f.replace('.json', ''));
        
        if (prefix) {
          keys = keys.filter(k => k.startsWith(prefix));
        }
        
        return keys;
      },
    };
  }
  
  /**
   * Get or create LLM provider
   */
  async getLLMProvider(): Promise<LLMProvider> {
    if (!this.providers.llm) {
      const providers = await this.createProviders();
      this.providers = providers;
    }
    return this.providers.llm!;
  }
  
  /**
   * Get or create embedding provider
   */
  async getEmbeddingProvider(): Promise<any> {
    if (!this.providers.embedding) {
      const providers = await this.createProviders();
      this.providers = providers;
    }
    return this.providers.embedding!;
  }
  
  /**
   * Get or create storage provider
   */
  async getStorageProvider(): Promise<StorageProvider> {
    if (!this.providers.storage) {
      const providers = await this.createProviders();
      this.providers = providers;
    }
    return this.providers.storage!;
  }
  
  /**
   * Get or create KB impact storage
   */
  async getKBImpactStorage(): Promise<any> {
    if (!this.providers.kbStorage) {
      const providers = await this.createProviders();
      this.providers = providers;
    }
    return this.providers.kbStorage!;
  }
  
  /**
   * Reset all providers (useful for testing or reconfiguration)
   */
  reset(): void {
    this.providers = {};
    this.stackToggle.reset();
  }
}

/**
 * Singleton instance
 */
let factoryInstance: StackProviderFactory | null = null;

/**
 * Get the singleton StackProviderFactory instance
 */
export function getStackProviderFactory(): StackProviderFactory {
  if (!factoryInstance) {
    factoryInstance = new StackProviderFactory();
  }
  return factoryInstance;
}
```

---

## STEP 7.4: Update Config Index Exports

**File:** `packages/agent-core/src/config/index.ts`

Update the existing index.ts to include stack toggle exports:

```typescript
/**
 * Configuration Module Exports
 * Includes environment configuration and stack toggle system
 */

// Environment configuration (from Phase 5)
export * from './environment-types.js';
export * from './environment-loader.js';
export * from './provider-factory.js';

// Stack toggle system (Phase 7)
export * from './stack-types.js';
export * from './stack-toggle.js';
export * from './stack-provider-factory.js';
```

---

## STEP 7.5: Create Stack Test Utility

**File:** `packages/agent-core/src/config/stack-test.ts`

```typescript
/**
 * Stack Test Utility
 * For testing and debugging stack configuration
 */

import { getStackToggle } from './stack-toggle.js';
import { getStackProviderFactory } from './stack-provider-factory.js';

/**
 * Test the stack toggle system
 */
export async function testStackToggle(): Promise<void> {
  console.log('=== Stack Toggle Test ===\n');
  
  const toggle = getStackToggle();
  
  // Print stack summary
  console.log(toggle.getStackSummary());
  
  console.log('\n--- Configuration ---\n');
  
  const config = toggle.loadConfig();
  console.log('Config Type:', config.type);
  
  if (config.type === 'claude') {
    console.log('LLM Model:', config.llm.model);
    console.log('Embedding Model:', config.embedding.model);
    console.log('Storage Path:', config.storage.basePath);
  } else {
    console.log('Azure OpenAI Endpoint:', config.azureOpenAI.endpoint);
    console.log('Azure OpenAI Deployment:', config.azureOpenAI.deploymentName);
    console.log('Dataverse URL:', config.dataverse.environmentUrl);
    console.log('SharePoint Site:', config.sharePoint.siteUrl);
  }
  
  console.log('\n--- Provider Test ---\n');
  
  try {
    const factory = getStackProviderFactory();
    
    console.log('Creating LLM provider...');
    const llm = await factory.getLLMProvider();
    console.log('LLM provider created successfully');
    
    console.log('Creating embedding provider...');
    const embedding = await factory.getEmbeddingProvider();
    console.log('Embedding provider created successfully');
    
    console.log('Creating storage provider...');
    const storage = await factory.getStorageProvider();
    console.log('Storage provider created successfully');
    
    console.log('\n✅ All providers created successfully');
  } catch (error) {
    console.error('\n❌ Provider creation failed:', error);
  }
}

/**
 * CLI entry point
 */
if (process.argv[1]?.endsWith('stack-test.js') || process.argv[1]?.endsWith('stack-test.ts')) {
  testStackToggle().catch(console.error);
}
```

---

## STEP 7.6: Create Environment Template Files

**File:** `packages/agent-core/config/environment.mastercard.json`

Update the existing file to include stack toggle settings:

```json
{
  "type": "microsoft",
  "name": "mastercard",
  "description": "Mastercard production environment with Microsoft stack",
  
  "stack": {
    "default": "microsoft",
    "allowClaude": true,
    "allowMicrosoft": true
  },
  
  "copilotStudio": {
    "environmentUrl": "$COPILOT_STUDIO_ENV_URL",
    "botId": "$COPILOT_STUDIO_BOT_ID",
    "tenantId": "$AZURE_TENANT_ID"
  },
  
  "azureOpenAI": {
    "endpoint": "$AZURE_OPENAI_ENDPOINT",
    "deploymentName": "$AZURE_OPENAI_DEPLOYMENT",
    "apiVersion": "2024-02-01",
    "embeddingDeployment": "text-embedding-ada-002"
  },
  
  "dataverse": {
    "environmentUrl": "$DATAVERSE_ENVIRONMENT_URL",
    "tenantId": "$AZURE_TENANT_ID",
    "clientId": "$AZURE_CLIENT_ID",
    "clientSecret": "$AZURE_CLIENT_SECRET"
  },
  
  "sharePoint": {
    "siteUrl": "$SHAREPOINT_SITE_URL",
    "libraryName": "AgentKnowledgeBase",
    "tenantId": "$AZURE_TENANT_ID",
    "clientId": "$AZURE_CLIENT_ID",
    "clientSecret": "$AZURE_CLIENT_SECRET"
  },
  
  "features": {
    "useCopilotStudioOrchestration": true,
    "useAzureOpenAIDirectly": true,
    "useClaudeAPI": false,
    "useDataverseStorage": true,
    "useLocalStorage": false,
    "useSharePointKB": true,
    "useAzureAISearch": true,
    "useLocalKB": false,
    "usePowerAutomateFlows": true,
    "useDataverseImpactTracking": true,
    "useLocalImpactTracking": false,
    "enableDebugLogging": false,
    "enablePerformanceMetrics": true
  }
}
```

---

## STEP 7.7: Create .env Template for Mastercard

**File:** `release/v5.5/deployment/mastercard/.env.mastercard.template`

```bash
# Mastercard Environment Configuration
# Copy this file to .env and fill in values

# Stack Selection (microsoft or claude)
AGENT_STACK=microsoft

# Azure AD / Entra ID
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-01
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-ada-002

# Copilot Studio
COPILOT_STUDIO_ENV_URL=https://your-environment.api.powerplatform.com
COPILOT_STUDIO_BOT_ID=your-bot-id

# Dataverse
DATAVERSE_ENVIRONMENT_URL=https://your-org.crm.dynamics.com

# SharePoint
SHAREPOINT_SITE_URL=https://your-tenant.sharepoint.com/sites/AgentKB
SHAREPOINT_LIBRARY_NAME=AgentKnowledgeBase

# Optional: Claude fallback (if allowClaude=true)
# ANTHROPIC_API_KEY=your-anthropic-key
# OPENAI_API_KEY=your-openai-key

# Logging
LOG_LEVEL=info
ENABLE_PERFORMANCE_METRICS=true
```

---

## STEP 7.8: Commit Phase 7

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

git add packages/agent-core/src/config/
git add packages/agent-core/config/
git add release/v5.5/deployment/mastercard/

git commit -m "feat(agent-core): Phase 7 - Stack toggle system for Claude/Microsoft switching

- Add stack-types.ts with Claude and Microsoft stack configurations
- Add stack-toggle.ts with runtime stack detection and switching
- Add stack-provider-factory.ts for stack-aware provider creation
- Update config/index.ts with stack toggle exports
- Add stack-test.ts utility for testing configuration
- Update environment.mastercard.json with stack settings
- Add .env.mastercard.template with all required variables
- Default to Microsoft stack for Mastercard deployment
- Support both stacks with runtime toggle via AGENT_STACK env var"
```

---

## VALIDATION CHECKLIST

After executing this phase, verify:

- [ ] `src/config/stack-types.ts` exists with all type definitions
- [ ] `src/config/stack-toggle.ts` exists with StackToggle class
- [ ] `src/config/stack-provider-factory.ts` exists with factory implementation
- [ ] `src/config/index.ts` exports all stack toggle components
- [ ] `src/config/stack-test.ts` exists with test utility
- [ ] `config/environment.mastercard.json` updated with stack settings
- [ ] `.env.mastercard.template` created with all variables
- [ ] Build completes without errors
- [ ] Stack detection defaults to Microsoft when no env vars set

---

## USAGE EXAMPLES

### Switch to Claude Stack

```bash
export AGENT_STACK=claude
export ANTHROPIC_API_KEY=your-key
export OPENAI_API_KEY=your-key

# Run agent with Claude stack
npm start
```

### Switch to Microsoft Stack (Default)

```bash
export AGENT_STACK=microsoft
# Or just don't set AGENT_STACK (Microsoft is default)

export AZURE_TENANT_ID=...
export AZURE_CLIENT_ID=...
# ... other Azure vars

# Run agent with Microsoft stack
npm start
```

### Test Stack Configuration

```bash
cd packages/agent-core
npx ts-node src/config/stack-test.ts
```

---

## VS CODE CLAUDE PROMPT

```
Execute PHASE_7_STACK_TOGGLE.md

Read the phase document at:
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core/PHASE_7_STACK_TOGGLE.md

Execute Steps 7.1 through 7.8 in order:

1. Create stack-types.ts with all type definitions
2. Create stack-toggle.ts with StackToggle class and detection logic
3. Create stack-provider-factory.ts with provider creation
4. Update config/index.ts to export stack toggle components
5. Create stack-test.ts utility
6. Update config/environment.mastercard.json
7. Create .env.mastercard.template
8. Commit changes

CRITICAL:
- Default stack must be MICROSOFT for Mastercard deployment
- Both stacks must be available (toggle via AGENT_STACK env var)
- All imports must use .js extension for ESM compatibility
- Build must complete without errors

Run: npm run build
Report any build errors.
```

---

## END OF PHASE 7
