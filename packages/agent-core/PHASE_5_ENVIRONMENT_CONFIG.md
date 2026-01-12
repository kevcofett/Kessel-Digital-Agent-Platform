# PHASE 5: BRANCH MANAGEMENT & ENVIRONMENT CONFIGURATION
# VS Code Claude Execution Plan - Steps 45-50

**Depends On:** Phase 1, Phase 2, Phase 3, Phase 4 Complete
**Estimated Time:** 1-2 hours
**Branch:** Creates deploy/mastercard from deploy/personal

---

## OVERVIEW

This phase:
- Creates environment configuration system
- Sets up deploy/mastercard branch
- Configures provider switching between personal and corporate
- Creates environment-specific configuration files
- Validates both environments can build

---

## PRE-FLIGHT CHECK

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify all phases complete
cd packages/agent-core && npm run build
# Should succeed with all providers

# Verify on correct branch
git branch
# Should show * deploy/personal

# Verify clean state
git status
# Should be clean (all committed)
```

---

# STEP 45: Create Environment Configuration Types

**File:** `packages/agent-core/src/config/environment-types.ts`

```typescript
/**
 * Environment Configuration Types
 * 
 * Defines the structure for environment-specific configurations
 * that switch between personal (Aragorn AI) and corporate (Mastercard) deployments.
 */

// ============================================================================
// ENVIRONMENT TYPES
// ============================================================================

export type EnvironmentType = 'personal' | 'corporate';
export type EnvironmentName = 'aragorn-ai' | 'mastercard' | 'development' | 'staging';

// ============================================================================
// PROVIDER CONFIGURATIONS
// ============================================================================

export interface LLMProviderConfig {
  /**
   * Provider type to use
   */
  type: 'claude' | 'azure-openai' | 'copilot-studio' | 'openai';
  
  /**
   * API key (or env var name prefixed with $)
   */
  apiKey?: string;
  
  /**
   * Endpoint URL for cloud providers
   */
  endpoint?: string;
  
  /**
   * Deployment/model name
   */
  deploymentName?: string;
  
  /**
   * Model identifier
   */
  model?: string;
  
  /**
   * Default generation parameters
   */
  defaultParams?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

export interface EmbeddingProviderConfig {
  /**
   * Provider type to use
   */
  type: 'openai' | 'azure-openai' | 'tfidf' | 'azure-ai-search';
  
  /**
   * API key (or env var name prefixed with $)
   */
  apiKey?: string;
  
  /**
   * Endpoint URL
   */
  endpoint?: string;
  
  /**
   * Deployment/model name
   */
  deploymentName?: string;
  
  /**
   * Model for OpenAI
   */
  model?: string;
  
  /**
   * Embedding dimensions
   */
  dimensions?: number;
}

export interface StorageProviderConfig {
  /**
   * Provider type to use
   */
  type: 'local-fs' | 'dataverse' | 'sharepoint';
  
  /**
   * Base path for local storage
   */
  basePath?: string;
  
  /**
   * Environment URL for cloud storage
   */
  environmentUrl?: string;
  
  /**
   * Tenant ID for authentication
   */
  tenantId?: string;
  
  /**
   * Client credentials
   */
  clientId?: string;
  clientSecret?: string;
  
  /**
   * Table/library name
   */
  tableName?: string;
}

export interface KBImpactStorageConfig {
  /**
   * Provider type to use
   */
  type: 'local-fs' | 'dataverse';
  
  /**
   * Base path for local storage
   */
  basePath?: string;
  
  /**
   * Dataverse configuration
   */
  dataverse?: {
    environmentUrl: string;
    tenantId: string;
    clientId?: string;
    clientSecret?: string;
    tables?: {
      usageRecords?: string;
      documentImpacts?: string;
      updateProposals?: string;
    };
  };
}

// ============================================================================
// MAIN ENVIRONMENT CONFIGURATION
// ============================================================================

export interface EnvironmentConfig {
  /**
   * Environment type (personal or corporate)
   */
  type: EnvironmentType;
  
  /**
   * Environment name (aragorn-ai, mastercard, etc.)
   */
  name: EnvironmentName;
  
  /**
   * Human-readable description
   */
  description?: string;
  
  /**
   * LLM provider configuration
   */
  llm: LLMProviderConfig;
  
  /**
   * Embedding provider configuration
   */
  embedding: EmbeddingProviderConfig;
  
  /**
   * Storage provider configuration
   */
  storage: StorageProviderConfig;
  
  /**
   * KB impact tracking storage configuration
   */
  kbImpactStorage: KBImpactStorageConfig;
  
  /**
   * Feature flags
   */
  features: {
    enableHybridSearch: boolean;
    enableKBImpactTracking: boolean;
    enableAutoUpdateProposals: boolean;
    enableCaching: boolean;
    enableDebugLogging: boolean;
  };
  
  /**
   * Agent-specific overrides
   */
  agents?: {
    mpa?: Partial<AgentOverrides>;
    ca?: Partial<AgentOverrides>;
    eap?: Partial<AgentOverrides>;
  };
}

export interface AgentOverrides {
  llm?: Partial<LLMProviderConfig>;
  embedding?: Partial<EmbeddingProviderConfig>;
  kbPath?: string;
  features?: Partial<EnvironmentConfig['features']>;
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateEnvironmentConfig(config: unknown): config is EnvironmentConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  const c = config as Record<string, unknown>;
  
  if (!c.type || !['personal', 'corporate'].includes(c.type as string)) {
    return false;
  }
  
  if (!c.name || typeof c.name !== 'string') {
    return false;
  }
  
  if (!c.llm || typeof c.llm !== 'object') {
    return false;
  }
  
  if (!c.embedding || typeof c.embedding !== 'object') {
    return false;
  }
  
  if (!c.storage || typeof c.storage !== 'object') {
    return false;
  }
  
  return true;
}
```

---

# STEP 46: Create Environment Configuration Loader

**File:** `packages/agent-core/src/config/environment-loader.ts`

```typescript
/**
 * Environment Configuration Loader
 * 
 * Loads and validates environment configurations from files or environment variables.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { EnvironmentConfig, EnvironmentType } from './environment-types.js';
import { validateEnvironmentConfig } from './environment-types.js';

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const PERSONAL_ENV_CONFIG: EnvironmentConfig = {
  type: 'personal',
  name: 'aragorn-ai',
  description: 'Personal development environment using Claude and OpenAI',
  
  llm: {
    type: 'claude',
    apiKey: '$ANTHROPIC_API_KEY',
    model: 'claude-sonnet-4-20250514',
    defaultParams: {
      temperature: 0.7,
      maxTokens: 4096,
    },
  },
  
  embedding: {
    type: 'openai',
    apiKey: '$OPENAI_API_KEY',
    model: 'text-embedding-3-small',
    dimensions: 1536,
  },
  
  storage: {
    type: 'local-fs',
    basePath: './.agent-data',
  },
  
  kbImpactStorage: {
    type: 'local-fs',
    basePath: './.kb-impact',
  },
  
  features: {
    enableHybridSearch: true,
    enableKBImpactTracking: true,
    enableAutoUpdateProposals: true,
    enableCaching: true,
    enableDebugLogging: true,
  },
};

export const CORPORATE_ENV_CONFIG: EnvironmentConfig = {
  type: 'corporate',
  name: 'mastercard',
  description: 'Corporate Mastercard environment using Azure OpenAI and Dataverse',
  
  llm: {
    type: 'azure-openai',
    apiKey: '$AZURE_OPENAI_API_KEY',
    endpoint: '$AZURE_OPENAI_ENDPOINT',
    deploymentName: '$AZURE_OPENAI_DEPLOYMENT',
    defaultParams: {
      temperature: 0.7,
      maxTokens: 4096,
    },
  },
  
  embedding: {
    type: 'azure-openai',
    apiKey: '$AZURE_OPENAI_API_KEY',
    endpoint: '$AZURE_OPENAI_ENDPOINT',
    deploymentName: '$AZURE_OPENAI_EMBEDDING_DEPLOYMENT',
    dimensions: 1536,
  },
  
  storage: {
    type: 'dataverse',
    environmentUrl: '$DATAVERSE_ENVIRONMENT_URL',
    tenantId: '$DATAVERSE_TENANT_ID',
    clientId: '$DATAVERSE_CLIENT_ID',
    clientSecret: '$DATAVERSE_CLIENT_SECRET',
    tableName: 'cr_kbdocuments',
  },
  
  kbImpactStorage: {
    type: 'dataverse',
    dataverse: {
      environmentUrl: '$DATAVERSE_ENVIRONMENT_URL',
      tenantId: '$DATAVERSE_TENANT_ID',
      clientId: '$DATAVERSE_CLIENT_ID',
      clientSecret: '$DATAVERSE_CLIENT_SECRET',
      tables: {
        usageRecords: 'cr_kbusagerecords',
        documentImpacts: 'cr_kbdocumentimpacts',
        updateProposals: 'cr_kbupdateproposals',
      },
    },
  },
  
  features: {
    enableHybridSearch: true,
    enableKBImpactTracking: true,
    enableAutoUpdateProposals: false,  // Manual approval in corporate
    enableCaching: true,
    enableDebugLogging: false,  // Reduced logging in production
  },
};

// ============================================================================
// ENVIRONMENT LOADER
// ============================================================================

export class EnvironmentLoader {
  private configPath?: string;
  private cachedConfig?: EnvironmentConfig;
  
  constructor(configPath?: string) {
    this.configPath = configPath;
  }
  
  /**
   * Load environment configuration
   * Priority: 1. Config file, 2. ENV var, 3. Default based on NODE_ENV
   */
  async load(): Promise<EnvironmentConfig> {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }
    
    // Try loading from config file
    if (this.configPath) {
      try {
        const config = await this.loadFromFile(this.configPath);
        this.cachedConfig = config;
        return config;
      } catch (error) {
        console.warn(`Failed to load config from ${this.configPath}:`, error);
      }
    }
    
    // Try loading from AGENT_ENV_CONFIG env var (JSON string)
    const envConfigJson = process.env.AGENT_ENV_CONFIG;
    if (envConfigJson) {
      try {
        const config = JSON.parse(envConfigJson);
        if (validateEnvironmentConfig(config)) {
          this.cachedConfig = this.resolveEnvVars(config);
          return this.cachedConfig;
        }
      } catch (error) {
        console.warn('Failed to parse AGENT_ENV_CONFIG:', error);
      }
    }
    
    // Determine environment type from AGENT_ENV or NODE_ENV
    const envType = this.detectEnvironmentType();
    this.cachedConfig = this.getDefaultConfig(envType);
    return this.cachedConfig;
  }
  
  /**
   * Load configuration from a JSON file
   */
  async loadFromFile(filePath: string): Promise<EnvironmentConfig> {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    
    const content = await fs.readFile(absolutePath, 'utf-8');
    const config = JSON.parse(content);
    
    if (!validateEnvironmentConfig(config)) {
      throw new Error(`Invalid environment configuration in ${filePath}`);
    }
    
    return this.resolveEnvVars(config);
  }
  
  /**
   * Detect environment type from environment variables
   */
  detectEnvironmentType(): EnvironmentType {
    const agentEnv = process.env.AGENT_ENV?.toLowerCase();
    
    if (agentEnv === 'corporate' || agentEnv === 'mastercard' || agentEnv === 'production') {
      return 'corporate';
    }
    
    if (agentEnv === 'personal' || agentEnv === 'aragorn' || agentEnv === 'development') {
      return 'personal';
    }
    
    // Check for presence of Azure credentials
    if (process.env.AZURE_OPENAI_API_KEY && process.env.DATAVERSE_ENVIRONMENT_URL) {
      return 'corporate';
    }
    
    // Default to personal
    return 'personal';
  }
  
  /**
   * Get default configuration for environment type
   */
  getDefaultConfig(type: EnvironmentType): EnvironmentConfig {
    const config = type === 'corporate' ? CORPORATE_ENV_CONFIG : PERSONAL_ENV_CONFIG;
    return this.resolveEnvVars(config);
  }
  
  /**
   * Resolve environment variable references in config
   * Variables prefixed with $ are replaced with their env var values
   */
  resolveEnvVars(config: EnvironmentConfig): EnvironmentConfig {
    const resolved = JSON.parse(JSON.stringify(config)) as EnvironmentConfig;
    
    const resolveValue = (value: unknown): unknown => {
      if (typeof value === 'string' && value.startsWith('$')) {
        const envVarName = value.slice(1);
        return process.env[envVarName] || value;
      }
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return value.map(resolveValue);
        }
        const obj: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
          obj[k] = resolveValue(v);
        }
        return obj;
      }
      return value;
    };
    
    return resolveValue(resolved) as EnvironmentConfig;
  }
  
  /**
   * Clear cached configuration
   */
  clearCache(): void {
    this.cachedConfig = undefined;
  }
  
  /**
   * Get current cached config without loading
   */
  getCached(): EnvironmentConfig | undefined {
    return this.cachedConfig;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let defaultLoader: EnvironmentLoader | null = null;

/**
 * Get the default environment loader instance
 */
export function getEnvironmentLoader(): EnvironmentLoader {
  if (!defaultLoader) {
    defaultLoader = new EnvironmentLoader();
  }
  return defaultLoader;
}

/**
 * Load environment configuration using default loader
 */
export async function loadEnvironmentConfig(): Promise<EnvironmentConfig> {
  return getEnvironmentLoader().load();
}

/**
 * Set custom config path for default loader
 */
export function setEnvironmentConfigPath(configPath: string): void {
  defaultLoader = new EnvironmentLoader(configPath);
}

export default EnvironmentLoader;
```

---

# STEP 47: Create Provider Factory

**File:** `packages/agent-core/src/config/provider-factory.ts`

```typescript
/**
 * Provider Factory
 * 
 * Creates provider instances based on environment configuration.
 */

import type { EnvironmentConfig } from './environment-types.js';
import type { LLMProvider, StorageProvider } from '../providers/interfaces.js';
import type { SemanticEmbeddingProvider } from '../providers/embedding-types.js';
import type { KBImpactStorage } from '../learning/kb-impact-types.js';

// Import providers
import { ClaudeLLMProvider } from '../providers/claude-llm.js';
import { AzureOpenAILLMProvider } from '../providers/azure-openai-llm.js';
import { CopilotStudioLLMProvider } from '../providers/copilot-studio-llm.js';
import { OpenAIEmbeddingProvider } from '../providers/openai-embedding.js';
import { AzureOpenAIEmbeddingProvider } from '../providers/azure-openai-embedding.js';
import { TFIDFEmbeddingProviderAdapter } from '../providers/embedding-factory.js';
import { LocalFSStorageProvider } from '../providers/local-fs-storage.js';
import { DataverseStorageProvider } from '../providers/dataverse-storage.js';
import { LocalKBImpactStorage } from '../learning/local-kb-impact-storage.js';
import { DataverseKBImpactStorage } from '../learning/dataverse-kb-impact-storage.js';

// ============================================================================
// PROVIDER FACTORY
// ============================================================================

export class ProviderFactory {
  private config: EnvironmentConfig;
  
  // Cached provider instances
  private llmProvider?: LLMProvider;
  private embeddingProvider?: SemanticEmbeddingProvider;
  private storageProvider?: StorageProvider;
  private kbImpactStorage?: KBImpactStorage;
  
  constructor(config: EnvironmentConfig) {
    this.config = config;
  }
  
  /**
   * Get LLM provider instance
   */
  getLLMProvider(): LLMProvider {
    if (this.llmProvider) {
      return this.llmProvider;
    }
    
    const { llm } = this.config;
    
    switch (llm.type) {
      case 'claude':
        this.llmProvider = new ClaudeLLMProvider({
          apiKey: llm.apiKey,
          model: llm.model,
          defaultParams: llm.defaultParams,
        });
        break;
      
      case 'azure-openai':
        if (!llm.endpoint || !llm.deploymentName) {
          throw new Error('Azure OpenAI requires endpoint and deploymentName');
        }
        this.llmProvider = new AzureOpenAILLMProvider({
          endpoint: llm.endpoint,
          apiKey: llm.apiKey,
          deploymentName: llm.deploymentName,
          defaultParams: llm.defaultParams,
        });
        break;
      
      case 'copilot-studio':
        if (!llm.endpoint || !llm.deploymentName) {
          throw new Error('Copilot Studio requires endpoint (environmentUrl) and deploymentName (botId)');
        }
        this.llmProvider = new CopilotStudioLLMProvider({
          environmentUrl: llm.endpoint,
          botId: llm.deploymentName,
          tenantId: this.config.storage.tenantId || '',
        });
        break;
      
      default:
        throw new Error(`Unknown LLM provider type: ${llm.type}`);
    }
    
    return this.llmProvider;
  }
  
  /**
   * Get embedding provider instance
   */
  getEmbeddingProvider(): SemanticEmbeddingProvider {
    if (this.embeddingProvider) {
      return this.embeddingProvider;
    }
    
    const { embedding } = this.config;
    
    switch (embedding.type) {
      case 'openai':
        this.embeddingProvider = new OpenAIEmbeddingProvider({
          apiKey: embedding.apiKey,
          model: embedding.model as 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002',
          dimensions: embedding.dimensions,
        });
        break;
      
      case 'azure-openai':
        if (!embedding.endpoint || !embedding.deploymentName) {
          throw new Error('Azure OpenAI embedding requires endpoint and deploymentName');
        }
        this.embeddingProvider = new AzureOpenAIEmbeddingProvider({
          endpoint: embedding.endpoint,
          apiKey: embedding.apiKey,
          deploymentName: embedding.deploymentName,
        });
        break;
      
      case 'tfidf':
        this.embeddingProvider = new TFIDFEmbeddingProviderAdapter();
        break;
      
      default:
        // Fall back to TF-IDF
        console.warn(`Unknown embedding type ${embedding.type}, falling back to TF-IDF`);
        this.embeddingProvider = new TFIDFEmbeddingProviderAdapter();
    }
    
    return this.embeddingProvider;
  }
  
  /**
   * Get storage provider instance
   */
  getStorageProvider(): StorageProvider {
    if (this.storageProvider) {
      return this.storageProvider;
    }
    
    const { storage } = this.config;
    
    switch (storage.type) {
      case 'local-fs':
        this.storageProvider = new LocalFSStorageProvider({
          basePath: storage.basePath || './.agent-data',
        });
        break;
      
      case 'dataverse':
        if (!storage.environmentUrl || !storage.tenantId) {
          throw new Error('Dataverse storage requires environmentUrl and tenantId');
        }
        this.storageProvider = new DataverseStorageProvider({
          environmentUrl: storage.environmentUrl,
          tenantId: storage.tenantId,
          clientId: storage.clientId,
          clientSecret: storage.clientSecret,
          tableName: storage.tableName,
        });
        break;
      
      default:
        throw new Error(`Unknown storage provider type: ${storage.type}`);
    }
    
    return this.storageProvider;
  }
  
  /**
   * Get KB impact storage instance
   */
  getKBImpactStorage(): KBImpactStorage {
    if (this.kbImpactStorage) {
      return this.kbImpactStorage;
    }
    
    const { kbImpactStorage } = this.config;
    
    switch (kbImpactStorage.type) {
      case 'local-fs':
        this.kbImpactStorage = new LocalKBImpactStorage(
          kbImpactStorage.basePath || './.kb-impact'
        );
        break;
      
      case 'dataverse':
        if (!kbImpactStorage.dataverse) {
          throw new Error('Dataverse KB impact storage requires dataverse configuration');
        }
        this.kbImpactStorage = new DataverseKBImpactStorage({
          environmentUrl: kbImpactStorage.dataverse.environmentUrl,
          tenantId: kbImpactStorage.dataverse.tenantId,
          clientId: kbImpactStorage.dataverse.clientId,
          clientSecret: kbImpactStorage.dataverse.clientSecret,
          tables: kbImpactStorage.dataverse.tables,
        });
        break;
      
      default:
        throw new Error(`Unknown KB impact storage type: ${kbImpactStorage.type}`);
    }
    
    return this.kbImpactStorage;
  }
  
  /**
   * Get all providers at once
   */
  getAllProviders(): {
    llm: LLMProvider;
    embedding: SemanticEmbeddingProvider;
    storage: StorageProvider;
    kbImpactStorage: KBImpactStorage;
  } {
    return {
      llm: this.getLLMProvider(),
      embedding: this.getEmbeddingProvider(),
      storage: this.getStorageProvider(),
      kbImpactStorage: this.getKBImpactStorage(),
    };
  }
  
  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
    return this.config.features[feature] ?? false;
  }
  
  /**
   * Get environment type
   */
  getEnvironmentType(): string {
    return this.config.type;
  }
  
  /**
   * Get environment name
   */
  getEnvironmentName(): string {
    return this.config.name;
  }
  
  /**
   * Clear all cached providers
   */
  clearCache(): void {
    this.llmProvider = undefined;
    this.embeddingProvider = undefined;
    this.storageProvider = undefined;
    this.kbImpactStorage = undefined;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createProviderFactory(config: EnvironmentConfig): ProviderFactory {
  return new ProviderFactory(config);
}

export default ProviderFactory;
```

---

# STEP 48: Create Config Index and Update Main Exports

**File:** `packages/agent-core/src/config/index.ts`

```typescript
/**
 * Configuration Module Exports
 */

// Environment Types
export {
  type EnvironmentType,
  type EnvironmentName,
  type LLMProviderConfig,
  type EmbeddingProviderConfig,
  type StorageProviderConfig,
  type KBImpactStorageConfig,
  type EnvironmentConfig,
  type AgentOverrides,
  validateEnvironmentConfig,
} from './environment-types.js';

// Environment Loader
export {
  EnvironmentLoader,
  getEnvironmentLoader,
  loadEnvironmentConfig,
  setEnvironmentConfigPath,
  PERSONAL_ENV_CONFIG,
  CORPORATE_ENV_CONFIG,
} from './environment-loader.js';

// Provider Factory
export {
  ProviderFactory,
  createProviderFactory,
} from './provider-factory.js';
```

**File:** `packages/agent-core/src/index.ts`

Add this export (DO NOT replace existing - ADD this):

```typescript
// Configuration
export * from './config/index.js';
```

---

# STEP 49: Create Environment Configuration Files

**File:** `packages/agent-core/config/environment.personal.json`

```json
{
  "type": "personal",
  "name": "aragorn-ai",
  "description": "Personal development environment using Claude and OpenAI",
  
  "llm": {
    "type": "claude",
    "apiKey": "$ANTHROPIC_API_KEY",
    "model": "claude-sonnet-4-20250514",
    "defaultParams": {
      "temperature": 0.7,
      "maxTokens": 4096
    }
  },
  
  "embedding": {
    "type": "openai",
    "apiKey": "$OPENAI_API_KEY",
    "model": "text-embedding-3-small",
    "dimensions": 1536
  },
  
  "storage": {
    "type": "local-fs",
    "basePath": "./.agent-data"
  },
  
  "kbImpactStorage": {
    "type": "local-fs",
    "basePath": "./.kb-impact"
  },
  
  "features": {
    "enableHybridSearch": true,
    "enableKBImpactTracking": true,
    "enableAutoUpdateProposals": true,
    "enableCaching": true,
    "enableDebugLogging": true
  }
}
```

**File:** `packages/agent-core/config/environment.mastercard.json`

```json
{
  "type": "corporate",
  "name": "mastercard",
  "description": "Corporate Mastercard environment using Azure OpenAI and Dataverse",
  
  "llm": {
    "type": "azure-openai",
    "apiKey": "$AZURE_OPENAI_API_KEY",
    "endpoint": "$AZURE_OPENAI_ENDPOINT",
    "deploymentName": "$AZURE_OPENAI_DEPLOYMENT",
    "defaultParams": {
      "temperature": 0.7,
      "maxTokens": 4096
    }
  },
  
  "embedding": {
    "type": "azure-openai",
    "apiKey": "$AZURE_OPENAI_API_KEY",
    "endpoint": "$AZURE_OPENAI_ENDPOINT",
    "deploymentName": "$AZURE_OPENAI_EMBEDDING_DEPLOYMENT",
    "dimensions": 1536
  },
  
  "storage": {
    "type": "dataverse",
    "environmentUrl": "$DATAVERSE_ENVIRONMENT_URL",
    "tenantId": "$DATAVERSE_TENANT_ID",
    "clientId": "$DATAVERSE_CLIENT_ID",
    "clientSecret": "$DATAVERSE_CLIENT_SECRET",
    "tableName": "cr_kbdocuments"
  },
  
  "kbImpactStorage": {
    "type": "dataverse",
    "dataverse": {
      "environmentUrl": "$DATAVERSE_ENVIRONMENT_URL",
      "tenantId": "$DATAVERSE_TENANT_ID",
      "clientId": "$DATAVERSE_CLIENT_ID",
      "clientSecret": "$DATAVERSE_CLIENT_SECRET",
      "tables": {
        "usageRecords": "cr_kbusagerecords",
        "documentImpacts": "cr_kbdocumentimpacts",
        "updateProposals": "cr_kbupdateproposals"
      }
    }
  },
  
  "features": {
    "enableHybridSearch": true,
    "enableKBImpactTracking": true,
    "enableAutoUpdateProposals": false,
    "enableCaching": true,
    "enableDebugLogging": false
  }
}
```

---

# STEP 50: Create deploy/mastercard Branch

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Ensure all changes are committed on deploy/personal
git add .
git commit -m "feat(agent-core): Phase 5 - Environment configuration system

- Created environment-types.ts with full type definitions
- Created environment-loader.ts with config file and env var support
- Created provider-factory.ts for environment-aware provider creation
- Added environment.personal.json for Aragorn AI settings
- Added environment.mastercard.json for corporate settings
- Exported all config types and classes from agent-core"

git push origin deploy/personal

# Create mastercard branch from personal
git checkout -b deploy/mastercard

# The code is identical - environment switching happens via:
# 1. AGENT_ENV environment variable
# 2. Config file path
# 3. Auto-detection of available credentials

git push origin deploy/mastercard

# Return to personal branch for continued development
git checkout deploy/personal
```

---

# VERIFICATION

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core

# Build
rm -rf dist
npm run build

# Verify config directory exists
ls -la config/

# Verify exports work
cat dist/config/index.d.ts
```

---

# PHASE 5 COMPLETE

## Summary of All Phases

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Foundation - MPA, CA, EAP scaffolds + KB migration | ✅ |
| Phase 2 | Semantic Embedding - OpenAI, Azure OpenAI, Hybrid | ✅ |
| Phase 3 | KB Impact Tracking - Base tracker + agent adapters | ✅ |
| Phase 4 | Corporate Providers - Azure LLM, Copilot, Dataverse | ✅ |
| Phase 5 | Environment Config - Provider factory + branches | ✅ |

## Branch Structure

```
deploy/personal   - Personal environment (Claude + OpenAI + Local FS)
deploy/mastercard - Corporate environment (Azure OpenAI + Dataverse)
```

## Environment Switching

The same codebase supports both environments via:

1. **Environment Variable**: `AGENT_ENV=corporate` or `AGENT_ENV=personal`
2. **Config File**: Point to `environment.personal.json` or `environment.mastercard.json`
3. **Auto-Detection**: Presence of Azure credentials triggers corporate mode

## Final Verification Checklist

- [ ] `deploy/personal` branch builds successfully
- [ ] `deploy/mastercard` branch builds successfully
- [ ] All 3 agents have KB files (MPA: 22+, CA: 35, EAP: 7)
- [ ] Environment config files created
- [ ] Provider factory works with both configurations
- [ ] All commits pushed to both branches
