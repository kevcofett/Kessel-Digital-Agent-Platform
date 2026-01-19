/**
 * Azure ML Client Configuration
 * Kessel Digital Agent Platform
 */

import { DefaultAzureCredential } from '@azure/identity';
import axios, { AxiosInstance } from 'axios';

export interface AzureMLConfig {
  subscriptionId: string;
  resourceGroup: string;
  workspaceName: string;
  region: string;
}

export interface EndpointConfig {
  name: string;
  deploymentName: string;
  apiVersion: string;
}

export interface ScoringRequest {
  data: Record<string, unknown>[];
  parameters?: Record<string, unknown>;
}

export interface ScoringResponse {
  predictions: unknown[];
  modelVersion: string;
  requestId: string;
  latencyMs: number;
}

export class AzureMLClient {
  private config: AzureMLConfig;
  private credential: DefaultAzureCredential;
  private httpClient: AxiosInstance;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(config: AzureMLConfig) {
    this.config = config;
    this.credential = new DefaultAzureCredential();
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt > now + 60000) {
      return this.tokenCache.token;
    }

    const tokenResponse = await this.credential.getToken(
      'https://ml.azure.com/.default'
    );

    if (!tokenResponse) {
      throw new Error('Failed to acquire Azure ML access token');
    }

    this.tokenCache = {
      token: tokenResponse.token,
      expiresAt: tokenResponse.expiresOnTimestamp,
    };

    return tokenResponse.token;
  }

  private getEndpointUrl(endpointName: string, deploymentName: string): string {
    return `https://${endpointName}.${this.config.region}.inference.ml.azure.com/score`;
  }

  async score(
    endpoint: EndpointConfig,
    request: ScoringRequest
  ): Promise<ScoringResponse> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      const token = await this.getAccessToken();
      const url = this.getEndpointUrl(endpoint.name, endpoint.deploymentName);

      const response = await this.httpClient.post(url, request, {
        headers: {
          Authorization: `Bearer ${token}`,
          'azureml-model-deployment': endpoint.deploymentName,
          'x-request-id': requestId,
        },
      });

      const latencyMs = Date.now() - startTime;

      return {
        predictions: response.data,
        modelVersion: response.headers['x-ms-model-version'] || 'unknown',
        requestId,
        latencyMs,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error || error.message;

        if (status === 429) {
          throw new RateLimitError(message, requestId);
        } else if (status === 401 || status === 403) {
          throw new AuthenticationError(message, requestId);
        } else if (status === 400) {
          throw new ValidationError(message, requestId);
        }
      }
      throw new MLEndpointError(
        `Scoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        requestId
      );
    }
  }

  async healthCheck(endpoint: EndpointConfig): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const url = this.getEndpointUrl(endpoint.name, endpoint.deploymentName);

      const response = await this.httpClient.get(url.replace('/score', '/health'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      });

      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export class MLEndpointError extends Error {
  requestId: string;

  constructor(message: string, requestId: string) {
    super(message);
    this.name = 'MLEndpointError';
    this.requestId = requestId;
  }
}

export class RateLimitError extends MLEndpointError {
  constructor(message: string, requestId: string) {
    super(message, requestId);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends MLEndpointError {
  constructor(message: string, requestId: string) {
    super(message, requestId);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends MLEndpointError {
  constructor(message: string, requestId: string) {
    super(message, requestId);
    this.name = 'ValidationError';
  }
}

export default AzureMLClient;
