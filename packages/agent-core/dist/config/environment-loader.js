/**
 * Environment Configuration Loader
 *
 * Loads and validates environment configurations from files or environment variables.
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { validateEnvironmentConfig } from './environment-types.js';
// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================
export const PERSONAL_ENV_CONFIG = {
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
export const CORPORATE_ENV_CONFIG = {
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
        enableAutoUpdateProposals: false, // Manual approval in corporate
        enableCaching: true,
        enableDebugLogging: false, // Reduced logging in production
    },
};
// ============================================================================
// ENVIRONMENT LOADER
// ============================================================================
export class EnvironmentLoader {
    configPath;
    cachedConfig;
    constructor(configPath) {
        this.configPath = configPath;
    }
    /**
     * Load environment configuration
     * Priority: 1. Config file, 2. ENV var, 3. Default based on NODE_ENV
     */
    async load() {
        if (this.cachedConfig) {
            return this.cachedConfig;
        }
        // Try loading from config file
        if (this.configPath) {
            try {
                const config = await this.loadFromFile(this.configPath);
                this.cachedConfig = config;
                return config;
            }
            catch (error) {
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
            }
            catch (error) {
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
    async loadFromFile(filePath) {
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
    detectEnvironmentType() {
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
    getDefaultConfig(type) {
        const config = type === 'corporate' ? CORPORATE_ENV_CONFIG : PERSONAL_ENV_CONFIG;
        return this.resolveEnvVars(config);
    }
    /**
     * Resolve environment variable references in config
     * Variables prefixed with $ are replaced with their env var values
     */
    resolveEnvVars(config) {
        const resolved = JSON.parse(JSON.stringify(config));
        const resolveValue = (value) => {
            if (typeof value === 'string' && value.startsWith('$')) {
                const envVarName = value.slice(1);
                return process.env[envVarName] || value;
            }
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    return value.map(resolveValue);
                }
                const obj = {};
                for (const [k, v] of Object.entries(value)) {
                    obj[k] = resolveValue(v);
                }
                return obj;
            }
            return value;
        };
        return resolveValue(resolved);
    }
    /**
     * Clear cached configuration
     */
    clearCache() {
        this.cachedConfig = undefined;
    }
    /**
     * Get current cached config without loading
     */
    getCached() {
        return this.cachedConfig;
    }
}
// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
let defaultLoader = null;
/**
 * Get the default environment loader instance
 */
export function getEnvironmentLoader() {
    if (!defaultLoader) {
        defaultLoader = new EnvironmentLoader();
    }
    return defaultLoader;
}
/**
 * Load environment configuration using default loader
 */
export async function loadEnvironmentConfig() {
    return getEnvironmentLoader().load();
}
/**
 * Set custom config path for default loader
 */
export function setEnvironmentConfigPath(configPath) {
    defaultLoader = new EnvironmentLoader(configPath);
}
export default EnvironmentLoader;
//# sourceMappingURL=environment-loader.js.map