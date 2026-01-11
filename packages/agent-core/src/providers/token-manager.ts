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
 * Cached token with expiration tracking
 */
interface CachedToken {
  token: TokenResponse;
  acquiredAt: number;
  expiresAt: number;
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
export class TokenAcquisitionError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'TokenAcquisitionError';
  }
}

/**
 * Token Manager for handling OAuth2 authentication
 */
export class TokenManager {
  private config: Required<TokenManagerConfig>;
  private tokenCache: Map<string, CachedToken> = new Map();

  constructor(config: TokenManagerConfig) {
    this.config = {
      ...config,
      tokenEndpoint: config.tokenEndpoint ||
        `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
      refreshBuffer: config.refreshBuffer ?? 300,
      maxRetries: config.maxRetries ?? 3,
    };
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
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
  async forceRefresh(): Promise<TokenResponse> {
    const cacheKey = this.getCacheKey();
    this.tokenCache.delete(cacheKey);
    return this.acquireToken();
  }

  /**
   * Clear all cached tokens
   */
  clearCache(): void {
    this.tokenCache.clear();
  }

  /**
   * Check if token acquisition is possible (config validation)
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

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
  private async acquireToken(): Promise<TokenResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const token = await this.requestToken();
        this.cacheToken(token);
        return token;
      } catch (error) {
        lastError = error as Error;

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
  private async requestToken(): Promise<TokenResponse> {
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
      throw new TokenAcquisitionError(
        `Token acquisition failed: ${response.status} ${errorBody}`,
        response.status
      );
    }

    const data = await response.json() as {
      access_token: string;
      expires_in: number;
      token_type: string;
      scope?: string;
      refresh_token?: string;
    };

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
  private cacheToken(token: TokenResponse): void {
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
  private isTokenExpired(cached: CachedToken): boolean {
    const now = Date.now();
    const bufferMs = this.config.refreshBuffer * 1000;
    return now >= (cached.expiresAt - bufferMs);
  }

  /**
   * Generate cache key based on configuration
   */
  private getCacheKey(): string {
    return `${this.config.tenantId}:${this.config.clientId}:${this.config.scope}`;
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current token info (for debugging)
   */
  getTokenInfo(): { hasToken: boolean; expiresAt?: Date; isExpired?: boolean } {
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
export function createDataverseTokenManager(config: {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  dataverseUrl: string;
}): TokenManager {
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
export function createAzureOpenAITokenManager(config: {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}): TokenManager {
  return new TokenManager({
    tenantId: config.tenantId,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    scope: 'https://cognitiveservices.azure.com/.default',
  });
}

export default TokenManager;
