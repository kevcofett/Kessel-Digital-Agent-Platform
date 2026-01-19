/**
 * HTTP Client for Benchmark API Connectors
 * Provides retry logic, rate limiting, and error handling
 */

import { BenchmarkAPIConfig, BenchmarkAPIError } from '../types';

export interface HttpRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  requestId?: string;
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;

  constructor(requestsPerMinute: number) {
    this.maxTokens = requestsPerMinute;
    this.tokens = requestsPerMinute;
    this.refillRate = requestsPerMinute / 60000; // tokens per millisecond
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens < 1) {
      const waitTime = (1 - this.tokens) / this.refillRate;
      await this.sleep(Math.ceil(waitTime));
      this.refill();
    }

    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class HttpClient {
  private readonly config: BenchmarkAPIConfig;
  private readonly rateLimiter: RateLimiter;

  constructor(config: BenchmarkAPIConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      rateLimitPerMinute: 60,
      apiVersion: 'v1',
      ...config,
    };
    this.rateLimiter = new RateLimiter(this.config.rateLimitPerMinute!);
  }

  async request<T>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
    await this.rateLimiter.acquire();

    const url = this.buildUrl(options.path, options.params);
    const headers = this.buildHeaders(options.headers);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      try {
        const response = await this.executeRequest<T>(url, {
          method: options.method,
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        return response;
      } catch (error) {
        lastError = error as Error;

        if (!this.isRetryableError(error as Error, attempt)) {
          throw error;
        }

        const backoffMs = this.calculateBackoff(attempt);
        await this.sleep(backoffMs);
      }
    }

    throw lastError;
  }

  private async executeRequest<T>(
    url: string,
    init: RequestInit
  ): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await this.parseError(response);
        throw error;
      }

      const data = await response.json();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        data,
        status: response.status,
        headers: responseHeaders,
        requestId: responseHeaders['x-request-id'],
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const base = `${this.config.baseUrl}/${this.config.apiVersion}${path}`;

    if (!params || Object.keys(params).length === 0) {
      return base;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    return `${base}?${searchParams.toString()}`;
  }

  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Accept': 'application/json',
      'X-API-Version': this.config.apiVersion!,
      ...customHeaders,
    };
  }

  private async parseError(response: Response): Promise<BenchmarkAPIError> {
    try {
      const body = await response.json();
      return {
        code: body.error?.code || `HTTP_${response.status}`,
        message: body.error?.message || response.statusText,
        details: body.error?.details,
        retryAfter: response.headers.get('Retry-After')
          ? parseInt(response.headers.get('Retry-After')!, 10)
          : undefined,
      };
    } catch {
      return {
        code: `HTTP_${response.status}`,
        message: response.statusText,
      };
    }
  }

  private isRetryableError(error: Error | BenchmarkAPIError, attempt: number): boolean {
    if (attempt >= this.config.retryAttempts!) {
      return false;
    }

    // Retry on network errors
    if (error.message?.includes('network') || error.message?.includes('timeout')) {
      return true;
    }

    // Retry on specific HTTP errors
    const apiError = error as BenchmarkAPIError;
    if (apiError.code) {
      const retryableCodes = ['HTTP_429', 'HTTP_500', 'HTTP_502', 'HTTP_503', 'HTTP_504'];
      return retryableCodes.includes(apiError.code);
    }

    return false;
  }

  private calculateBackoff(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000;
    const maxDelay = 30000;
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000;
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'GET', path, params });
  }

  async post<T>(path: string, body: unknown, params?: Record<string, string | number | boolean>): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'POST', path, body, params });
  }
}

export function createHttpClient(config: BenchmarkAPIConfig): HttpClient {
  return new HttpClient(config);
}
