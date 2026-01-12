/**
 * Provider Interfaces for Multi-Environment Agent Support
 *
 * Defines abstract interfaces for LLM, Storage, and Embedding providers
 * to enable agent systems to work in both personal (Claude/Node.js)
 * and corporate (Microsoft/Azure) environments.
 */
export const DEFAULT_EMBEDDING_CONFIG = {
    maxFeatures: 1500,
    cacheSize: 100,
};
// ============================================================================
// PROVIDER ERRORS
// ============================================================================
export class ProviderNotImplementedError extends Error {
    constructor(providerType, providerName) {
        super(`${providerType} provider "${providerName}" is not yet implemented. ` +
            `This is a stub for future Microsoft/Azure integration.`);
        this.name = 'ProviderNotImplementedError';
    }
}
export class ProviderConfigurationError extends Error {
    constructor(providerName, missingConfig) {
        super(`${providerName} provider missing required configuration: ${missingConfig.join(', ')}. ` +
            `Please set the required environment variables.`);
        this.name = 'ProviderConfigurationError';
    }
}
export class ProviderInitializationError extends Error {
    constructor(providerName, reason) {
        super(`${providerName} provider failed to initialize: ${reason}`);
        this.name = 'ProviderInitializationError';
    }
}
//# sourceMappingURL=interfaces.js.map