/**
 * Base Connector Class
 * Abstract base class for all benchmark API connectors
 */

import { BenchmarkAPIConfig, BenchmarkConnector } from '../types';
import { HttpClient, createHttpClient } from '../utils/httpClient';
import { MemoryCache, getCache, generateCacheKey } from '../utils/cache';

export interface ConnectorOptions {
  enableCache?: boolean;
  cacheTtlSeconds?: number;
  validateResponses?: boolean;
}

export abstract class BaseConnector<TRequest, TResponse>
  implements BenchmarkConnector<TRequest, TResponse>
{
  protected readonly httpClient: HttpClient;
  protected readonly cache: MemoryCache;
  protected readonly options: ConnectorOptions;
  protected readonly connectorName: string;
  protected readonly connectorVersion: string;

  constructor(
    config: BenchmarkAPIConfig,
    connectorName: string,
    connectorVersion: string,
    options: ConnectorOptions = {}
  ) {
    this.httpClient = createHttpClient(config);
    this.cache = getCache();
    this.connectorName = connectorName;
    this.connectorVersion = connectorVersion;
    this.options = {
      enableCache: true,
      cacheTtlSeconds: 300,
      validateResponses: true,
      ...options,
    };
  }

  getName(): string {
    return this.connectorName;
  }

  getVersion(): string {
    return this.connectorVersion;
  }

  abstract isHealthy(): Promise<boolean>;

  async fetch(request: TRequest): Promise<TResponse> {
    // Check cache first
    if (this.options.enableCache) {
      const cacheKey = this.generateCacheKey(request);
      const cached = this.cache.get<TResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Validate request
    this.validateRequest(request);

    // Execute the fetch
    const response = await this.executeRequest(request);

    // Validate response
    if (this.options.validateResponses) {
      this.validateResponse(response);
    }

    // Cache the response
    if (this.options.enableCache) {
      const cacheKey = this.generateCacheKey(request);
      this.cache.set(cacheKey, response, this.options.cacheTtlSeconds);
    }

    return response;
  }

  async batchFetch(requests: TRequest[]): Promise<TResponse[]> {
    // Default implementation: parallel fetch with concurrency limit
    const concurrencyLimit = 5;
    const results: TResponse[] = [];

    for (let i = 0; i < requests.length; i += concurrencyLimit) {
      const batch = requests.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(request => this.fetch(request))
      );
      results.push(...batchResults);
    }

    return results;
  }

  protected abstract executeRequest(request: TRequest): Promise<TResponse>;

  protected validateRequest(request: TRequest): void {
    if (!request) {
      throw new Error('Request cannot be null or undefined');
    }
  }

  protected validateResponse(response: TResponse): void {
    if (!response) {
      throw new Error('Response cannot be null or undefined');
    }
  }

  protected generateCacheKey(request: TRequest): string {
    return generateCacheKey(
      this.connectorName,
      'fetch',
      request as Record<string, unknown>
    );
  }

  protected createRequestId(): string {
    return `${this.connectorName}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}
