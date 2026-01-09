/**
 * AI Gateway Configuration
 *
 * Configures multi-model access with automatic failover through Vercel AI SDK.
 * Primary: Claude Sonnet 4 | Fallback: GPT-4o → Gemini 2 Flash
 */

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

/**
 * Environment configuration for AI providers
 */
export interface AIGatewayConfig {
  anthropicApiKey: string;
  openaiApiKey: string;
  googleApiKey: string;
  defaultModel: string;
  fallbackModels: string[];
  maxRetries: number;
  timeoutMs: number;
}

/**
 * Load AI Gateway configuration from environment variables
 */
export function getAIGatewayConfig(): AIGatewayConfig {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const googleApiKey = process.env.GOOGLE_AI_API_KEY;

  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  return {
    anthropicApiKey,
    openaiApiKey: openaiApiKey ?? '',
    googleApiKey: googleApiKey ?? '',
    defaultModel: 'claude-sonnet-4-20250514',
    fallbackModels: ['gpt-4o', 'gemini-2.0-flash-exp'],
    maxRetries: 3,
    timeoutMs: 55000,
  };
}

/**
 * Model provider enumeration
 */
export enum ModelProvider {
  ANTHROPIC = 'anthropic',
  OPENAI = 'openai',
  GOOGLE = 'google',
}

/**
 * Model configuration with provider-specific settings
 */
export interface ModelConfig {
  provider: ModelProvider;
  modelId: string;
  maxTokens: number;
  temperature: number;
}

/**
 * Default model configurations by use case
 */
export const MODEL_CONFIGS = {
  reasoning: {
    provider: ModelProvider.ANTHROPIC,
    modelId: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    temperature: 0.7,
  },
  analysis: {
    provider: ModelProvider.ANTHROPIC,
    modelId: 'claude-sonnet-4-20250514',
    maxTokens: 8192,
    temperature: 0.3,
  },
  creative: {
    provider: ModelProvider.ANTHROPIC,
    modelId: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    temperature: 0.9,
  },
  structured: {
    provider: ModelProvider.ANTHROPIC,
    modelId: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    temperature: 0.1,
  },
} as const;

/**
 * Get the appropriate AI model instance based on provider
 */
export function getModelInstance(config: ModelConfig) {
  switch (config.provider) {
    case ModelProvider.ANTHROPIC:
      return anthropic(config.modelId);
    case ModelProvider.OPENAI:
      return openai(config.modelId);
    case ModelProvider.GOOGLE:
      return google(config.modelId);
    default:
      throw new Error(`Unknown model provider: ${config.provider}`);
  }
}

/**
 * Get fallback model instance for failover scenarios
 */
export function getFallbackModel(primaryProvider: ModelProvider): ReturnType<typeof getModelInstance> {
  const gatewayConfig = getAIGatewayConfig();

  if (primaryProvider === ModelProvider.ANTHROPIC && gatewayConfig.openaiApiKey) {
    return openai('gpt-4o');
  }

  if (primaryProvider !== ModelProvider.GOOGLE && gatewayConfig.googleApiKey) {
    return google('gemini-2.0-flash-exp');
  }

  throw new Error('No fallback model available');
}

/**
 * Model selection options for agent orchestration
 */
export const AGENT_MODELS = {
  mpa: {
    primary: MODEL_CONFIGS.reasoning,
    fallback: {
      provider: ModelProvider.OPENAI,
      modelId: 'gpt-4o',
      maxTokens: 4096,
      temperature: 0.7,
    },
  },
  ca: {
    primary: MODEL_CONFIGS.analysis,
    fallback: {
      provider: ModelProvider.OPENAI,
      modelId: 'gpt-4o',
      maxTokens: 8192,
      temperature: 0.3,
    },
  },
  eap: {
    primary: MODEL_CONFIGS.structured,
    fallback: {
      provider: ModelProvider.GOOGLE,
      modelId: 'gemini-2.0-flash-exp',
      maxTokens: 4096,
      temperature: 0.1,
    },
  },
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  requestsPerMinute: 60,
  tokensPerMinute: 100000,
  concurrentRequests: 10,
} as const;

/**
 * Caching configuration for AI responses
 */
export const CACHE_CONFIG = {
  enabled: true,
  ttlSeconds: 300,
  maxEntries: 1000,
} as const;
