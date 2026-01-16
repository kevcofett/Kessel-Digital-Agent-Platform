/**
 * Provider Interfaces for Multi-Environment RAG Support
 *
 * Defines abstract interfaces for LLM, Storage, and Embedding providers
 * to enable the RAG system to work in both personal (Claude/Node.js)
 * and corporate (Microsoft/Azure) environments.
 */
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