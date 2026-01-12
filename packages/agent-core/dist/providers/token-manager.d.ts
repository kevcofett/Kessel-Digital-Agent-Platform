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
 * OAuth2 token response structure
 */
export interface TokenResponse {
    accessToken: string;
    expiresIn: number;
    tokenType: string;
    scope?: string;
    refreshToken?: string;
}
/**
 * Token manager configuration
 */
export interface TokenManagerConfig {
    /**
     * Azure AD tenant ID
     */
    tenantId: string;
    /**
     * Application (client) ID
     */
    clientId: string;
    /**
     * Client secret for confidential clients
     */
    clientSecret?: string;
    /**
     * Resource scope to request (e.g., "https://org.crm.dynamics.com/.default")
     */
    scope: string;
    /**
     * Optional: Custom token endpoint URL
     * Defaults to Azure AD v2.0 endpoint
     */
    tokenEndpoint?: string;
    /**
     * Buffer time in seconds before token expiration to trigger refresh
     * Default: 300 (5 minutes)
     */
    refreshBuffer?: number;
    /**
     * Maximum retry attempts for token acquisition
     * Default: 3
     */
    maxRetries?: number;
}
/**
 * Token manager error types
 */
export declare class TokenAcquisitionError extends Error {
    readonly statusCode?: number | undefined;
    constructor(message: string, statusCode?: number | undefined);
}
/**
 * Token Manager for handling OAuth2 authentication
 */
export declare class TokenManager {
    private config;
    private tokenCache;
    constructor(config: TokenManagerConfig);
    /**
     * Get a valid access token, refreshing if necessary
     */
    getAccessToken(): Promise<string>;
    /**
     * Force refresh the token even if not expired
     */
    forceRefresh(): Promise<TokenResponse>;
    /**
     * Clear all cached tokens
     */
    clearCache(): void;
    /**
     * Check if token acquisition is possible (config validation)
     */
    validate(): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Acquire a new token from Azure AD
     */
    private acquireToken;
    /**
     * Make the actual token request to Azure AD
     */
    private requestToken;
    /**
     * Cache the acquired token
     */
    private cacheToken;
    /**
     * Check if a cached token is expired (or will expire soon)
     */
    private isTokenExpired;
    /**
     * Generate cache key based on configuration
     */
    private getCacheKey;
    /**
     * Sleep helper for retry delays
     */
    private sleep;
    /**
     * Get current token info (for debugging)
     */
    getTokenInfo(): {
        hasToken: boolean;
        expiresAt?: Date;
        isExpired?: boolean;
    };
}
/**
 * Create token manager for Dataverse access
 */
export declare function createDataverseTokenManager(config: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    dataverseUrl: string;
}): TokenManager;
/**
 * Create token manager for Azure OpenAI access
 */
export declare function createAzureOpenAITokenManager(config: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
}): TokenManager;
export default TokenManager;
//# sourceMappingURL=token-manager.d.ts.map