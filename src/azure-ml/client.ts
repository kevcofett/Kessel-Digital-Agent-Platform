/**
 * Azure ML Client for KDAP
 * Handles authentication and endpoint communication with Azure ML managed endpoints
 */

import { DefaultAzureCredential, TokenCredential } from '@azure/identity';
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface AzureMLConfig {
  subscriptionId: string;
  resourceGroup: string;
  workspaceName: string;
  region?: string;
  credential?: TokenCredential;
}

export interface EndpointResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  latencyMs: number;
  endpointName: string;
}

export interface ModelPrediction {
  predictions: number[] | number[][];
  probabilities?: number[][];
  metadata?: Record<string, unknown>;
}

export class AzureMLClient {
  private config: AzureMLConfig;
  private credential: TokenCredential;
  private httpClient: AxiosInstance;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(config: AzureMLConfig) {
    this.config = {
      region: 'eastus',
      ...config,
    };
    this.credential = config.credential || new DefaultAzureCredential();
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

  private getEndpointUrl(endpointName: string): string {
    const { workspaceName, region } = this.config;
    return `https://${endpointName}.${region}.inference.ml.azure.com/score`;
  }

  async invokeEndpoint<T = ModelPrediction>(
    endpointName: string,
    payload: Record<string, unknown>
  ): Promise<EndpointResponse<T>> {
    const startTime = Date.now();
    
    try {
      const token = await this.getAccessToken();
      const url = this.getEndpointUrl(endpointName);

      const response = await this.httpClient.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'azureml-model-deployment': 'default',
        },
      });

      return {
        success: true,
        data: response.data as T,
        latencyMs: Date.now() - startTime,
        endpointName,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message || 'Unknown error invoking endpoint',
        latencyMs: Date.now() - startTime,
        endpointName,
      };
    }
  }

  async healthCheck(endpointName: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const baseUrl = this.getEndpointUrl(endpointName).replace('/score', '');
      
      const response = await this.httpClient.get(`${baseUrl}/`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      return response.status === 200;
    } catch {
      return false;
    }
  }

  async batchInvoke<T = ModelPrediction>(
    endpointName: string,
    payloads: Record<string, unknown>[],
    concurrency: number = 5
  ): Promise<EndpointResponse<T>[]> {
    const results: EndpointResponse<T>[] = [];
    
    for (let i = 0; i < payloads.length; i += concurrency) {
      const batch = payloads.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(payload => this.invokeEndpoint<T>(endpointName, payload))
      );
      results.push(...batchResults);
    }

    return results;
  }

  getConfig(): Readonly<AzureMLConfig> {
    return { ...this.config };
  }
}

export function createClient(config?: Partial<AzureMLConfig>): AzureMLClient {
  const envConfig: AzureMLConfig = {
    subscriptionId: process.env.AZURE_SUBSCRIPTION_ID || '',
    resourceGroup: process.env.AZURE_RESOURCE_GROUP || '',
    workspaceName: process.env.AZURE_ML_WORKSPACE || 'kdap-ml-workspace',
    region: process.env.AZURE_REGION || 'eastus',
    ...config,
  };

  if (!envConfig.subscriptionId || !envConfig.resourceGroup) {
    throw new Error('Azure ML configuration incomplete. Set AZURE_SUBSCRIPTION_ID and AZURE_RESOURCE_GROUP');
  }

  return new AzureMLClient(envConfig);
}
