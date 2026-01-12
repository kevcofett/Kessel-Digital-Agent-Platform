/**
 * Token Manager for OAuth2 Authentication
 *
 * Handles OAuth2 token acquisition and refresh for corporate environments
 * that require Azure AD authentication (Dataverse, Azure OpenAI, etc.).
 *
 * Features:
 * - Automatic token refresh before expiration
 * - Token caching to minimize auth requests
 * - Support for multiple resource scopes
 * - Error handling with retry logic
 */
/**
 * Token manager error types
 */
export class TokenAcquisitionError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'TokenAcquisitionError';
    }
}
/**
 * Token Manager for handling OAuth2 authentication
 */
export class TokenManager {
    config;
    tokenCache = new Map();
    constructor(config) {
        this.config = {
            tenantId: config.tenantId,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            scope: config.scope,
            tokenEndpoint: config.tokenEndpoint ||
                `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
            refreshBuffer: config.refreshBuffer ?? 300,
            maxRetries: config.maxRetries ?? 3,
        };
    }
    /**
     * Get a valid access token, refreshing if necessary
     */
    async getAccessToken() {
        const cacheKey = this.getCacheKey();
        const cached = this.tokenCache.get(cacheKey);
        // Check if we have a valid cached token
        if (cached && !this.isTokenExpired(cached)) {
            return cached.token.accessToken;
        }
        // Acquire new token
        const token = await this.acquireToken();
        return token.accessToken;
    }
    /**
     * Force refresh the token even if not expired
     */
    async forceRefresh() {
        const cacheKey = this.getCacheKey();
        this.tokenCache.delete(cacheKey);
        return this.acquireToken();
    }
    /**
     * Clear all cached tokens
     */
    clearCache() {
        this.tokenCache.clear();
    }
    /**
     * Check if token acquisition is possible (config validation)
     */
    validate() {
        const errors = [];
        if (!this.config.tenantId) {
            errors.push('tenantId is required');
        }
        if (!this.config.clientId) {
            errors.push('clientId is required');
        }
        if (!this.config.clientSecret) {
            errors.push('clientSecret is required for confidential client flow');
        }
        if (!this.config.scope) {
            errors.push('scope is required');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Acquire a new token from Azure AD
     */
    async acquireToken() {
        let lastError = null;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                const token = await this.requestToken();
                this.cacheToken(token);
                return token;
            }
            catch (error) {
                lastError = error;
                // Don't retry on authentication failures
                if (error instanceof TokenAcquisitionError &&
                    error.statusCode &&
                    error.statusCode >= 400 &&
                    error.statusCode < 500) {
                    throw error;
                }
                // Wait before retry with exponential backoff
                if (attempt < this.config.maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    await this.sleep(delay);
                }
            }
        }
        throw lastError || new TokenAcquisitionError('Failed to acquire token after retries');
    }
    /**
     * Make the actual token request to Azure AD
     */
    async requestToken() {
        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret || '',
            scope: this.config.scope,
        });
        const response = await fetch(this.config.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new TokenAcquisitionError(`Token acquisition failed: ${response.status} ${errorBody}`, response.status);
        }
        const data = await response.json();
        return {
            accessToken: data.access_token,
            expiresIn: data.expires_in,
            tokenType: data.token_type,
            scope: data.scope,
            refreshToken: data.refresh_token,
        };
    }
    /**
     * Cache the acquired token
     */
    cacheToken(token) {
        const cacheKey = this.getCacheKey();
        const now = Date.now();
        this.tokenCache.set(cacheKey, {
            token,
            acquiredAt: now,
            expiresAt: now + (token.expiresIn * 1000),
        });
    }
    /**
     * Check if a cached token is expired (or will expire soon)
     */
    isTokenExpired(cached) {
        const now = Date.now();
        const bufferMs = this.config.refreshBuffer * 1000;
        return now >= (cached.expiresAt - bufferMs);
    }
    /**
     * Generate cache key based on configuration
     */
    getCacheKey() {
        return `${this.config.tenantId}:${this.config.clientId}:${this.config.scope}`;
    }
    /**
     * Sleep helper for retry delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get current token info (for debugging)
     */
    getTokenInfo() {
        const cacheKey = this.getCacheKey();
        const cached = this.tokenCache.get(cacheKey);
        if (!cached) {
            return { hasToken: false };
        }
        return {
            hasToken: true,
            expiresAt: new Date(cached.expiresAt),
            isExpired: this.isTokenExpired(cached),
        };
    }
}
/**
 * Create token manager for Dataverse access
 */
export function createDataverseTokenManager(config) {
    // Extract org URL for scope
    const orgUrl = new URL(config.dataverseUrl);
    const scope = `${orgUrl.origin}/.default`;
    return new TokenManager({
        tenantId: config.tenantId,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        scope,
    });
}
/**
 * Create token manager for Azure OpenAI access
 */
export function createAzureOpenAITokenManager(config) {
    return new TokenManager({
        tenantId: config.tenantId,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        scope: 'https://cognitiveservices.azure.com/.default',
    });
}
export default TokenManager;
//# sourceMappingURL=token-manager.js.map