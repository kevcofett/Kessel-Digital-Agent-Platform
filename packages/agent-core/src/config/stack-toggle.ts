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
      features: this.getFeaturesForStack(defaultStack),
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
   * Get feature flags for a stack type
   */
  private getFeaturesForStack(stack: StackType): StackFeatureFlags {
    return stack === 'claude' ? CLAUDE_STACK_FEATURES : MICROSOFT_STACK_FEATURES;
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
        lines.push(`  - ${key}`);
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
