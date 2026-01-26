/**
 * Dataverse Client
 *
 * HTTP client for Microsoft Dataverse API operations.
 * Implements retry logic, error handling, and OData query building.
 */

import {
  getDataverseConfig,
  getDataverseAccessToken,
  buildODataQuery,
  RETRY_CONFIG,
  type ODataQueryOptions,
} from '../config/dataverse.js';

/**
 * Dataverse API response wrapper
 */
export interface DataverseResponse<T> {
  value: T[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

/**
 * Dataverse error response
 */
export interface DataverseError {
  error: {
    code: string;
    message: string;
    innererror?: {
      message: string;
      type: string;
      stacktrace: string;
    };
  };
}

/**
 * Custom error class for Dataverse operations
 */
export class DataverseClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode?: string,
    public readonly innerMessage?: string
  ) {
    super(message);
    this.name = 'DataverseClientError';
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate retry delay with exponential backoff
 */
function getRetryDelay(attempt: number): number {
  const delay = RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

/**
 * Check if error is retryable
 */
function isRetryableError(statusCode: number): boolean {
  return statusCode === 429 || statusCode === 503 || statusCode === 504 || statusCode >= 500;
}

/**
 * Dataverse Client class for API operations
 */
export class DataverseClient {
  private config = getDataverseConfig();

  /**
   * Make an authenticated request to Dataverse API
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    retryCount = 0
  ): Promise<T> {
    const accessToken = await getDataverseAccessToken();
    const url = `${this.config.apiUrl}/${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      Prefer: 'return=representation',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as DataverseError;
        const errorMessage = errorBody?.error?.message ?? response.statusText;
        const errorCode = errorBody?.error?.code;

        if (isRetryableError(response.status) && retryCount < RETRY_CONFIG.maxRetries) {
          const delay = getRetryDelay(retryCount);
          console.warn(
            `Dataverse request failed (${response.status}), retrying in ${delay}ms... (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`
          );
          await sleep(delay);
          return this.request<T>(method, endpoint, body, retryCount + 1);
        }

        throw new DataverseClientError(
          errorMessage,
          response.status,
          errorCode,
          errorBody?.error?.innererror?.message
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof DataverseClientError) {
        throw error;
      }

      if (retryCount < RETRY_CONFIG.maxRetries) {
        const delay = getRetryDelay(retryCount);
        console.warn(
          `Dataverse request failed with network error, retrying in ${delay}ms... (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`
        );
        await sleep(delay);
        return this.request<T>(method, endpoint, body, retryCount + 1);
      }

      throw new DataverseClientError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  /**
   * Query records from a Dataverse table
   */
  async query<T>(tableName: string, options?: ODataQueryOptions): Promise<T[]> {
    const queryString = options ? buildODataQuery(options) : '';
    const endpoint = `${tableName}${queryString}`;
    const response = await this.request<DataverseResponse<T>>('GET', endpoint);
    return response.value;
  }

  /**
   * Query records with full response (includes count and pagination)
   */
  async queryWithMetadata<T>(
    tableName: string,
    options?: ODataQueryOptions
  ): Promise<DataverseResponse<T>> {
    const queryString = options ? buildODataQuery(options) : '';
    const endpoint = `${tableName}${queryString}`;
    return this.request<DataverseResponse<T>>('GET', endpoint);
  }

  /**
   * Get a single record by ID
   */
  async get<T>(tableName: string, id: string, select?: string): Promise<T> {
    const selectQuery = select ? `?$select=${select}` : '';
    const endpoint = `${tableName}(${id})${selectQuery}`;
    return this.request<T>('GET', endpoint);
  }

  /**
   * Create a new record
   */
  async create<T>(tableName: string, data: Partial<T>): Promise<T> {
    return this.request<T>('POST', tableName, data);
  }

  /**
   * Update an existing record
   */
  async update<T>(tableName: string, id: string, data: Partial<T>): Promise<T> {
    const endpoint = `${tableName}(${id})`;
    return this.request<T>('PATCH', endpoint, data);
  }

  /**
   * Upsert a record (create or update based on alternate key)
   */
  async upsert<T>(tableName: string, alternateKey: string, data: Partial<T>): Promise<T> {
    const endpoint = `${tableName}(${alternateKey})`;
    return this.request<T>('PATCH', endpoint, data);
  }

  /**
   * Delete a record
   */
  async delete(tableName: string, id: string): Promise<void> {
    const endpoint = `${tableName}(${id})`;
    await this.request<void>('DELETE', endpoint);
  }

  /**
   * Execute a batch of operations
   */
  async batch(operations: BatchOperation[]): Promise<BatchResponse[]> {
    const batchIdVal = `batch_${Date.now()}`;
    const changesetIdVal = `changeset_${Date.now()}`;

    const batchBody = buildBatchBody(operations, batchIdVal, changesetIdVal);

    const accessToken = await getDataverseAccessToken();
    const response = await fetch(`${this.config.apiUrl}/$batch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/mixed; boundary=${batchIdVal}`,
        Accept: 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
      },
      body: batchBody,
    });

    if (!response.ok) {
      throw new DataverseClientError(`Batch operation failed: ${response.statusText}`, response.status);
    }

    return parseBatchResponse(await response.text());
  }
}

/**
 * Batch operation definition
 */
export interface BatchOperation {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: unknown;
}

/**
 * Batch response item
 */
export interface BatchResponse {
  status: number;
  body?: unknown;
}

/**
 * Build batch request body
 */
function buildBatchBody(operations: BatchOperation[], batchId: string, changesetId: string): string {
  let body = '';

  const hasWrites = operations.some((op) => op.method !== 'GET');

  if (hasWrites) {
    body += `--${batchId}\r\n`;
    body += `Content-Type: multipart/mixed; boundary=${changesetId}\r\n\r\n`;
  }

  operations.forEach((op, index) => {
    if (op.method === 'GET') {
      body += `--${batchId}\r\n`;
      body += 'Content-Type: application/http\r\n';
      body += 'Content-Transfer-Encoding: binary\r\n\r\n';
      body += `${op.method} ${op.endpoint} HTTP/1.1\r\n`;
      body += 'Accept: application/json\r\n\r\n';
    } else {
      body += `--${changesetId}\r\n`;
      body += 'Content-Type: application/http\r\n';
      body += 'Content-Transfer-Encoding: binary\r\n';
      body += `Content-ID: ${index + 1}\r\n\r\n`;
      body += `${op.method} ${op.endpoint} HTTP/1.1\r\n`;
      body += 'Content-Type: application/json\r\n';
      body += 'Accept: application/json\r\n\r\n';
      if (op.body) {
        body += JSON.stringify(op.body) + '\r\n';
      }
    }
  });

  if (hasWrites) {
    body += `--${changesetId}--\r\n`;
  }
  body += `--${batchId}--\r\n`;

  return body;
}

/**
 * Parse batch response
 */
function parseBatchResponse(responseText: string): BatchResponse[] {
  const responses: BatchResponse[] = [];
  const parts = responseText.split(/--batchresponse_[a-f0-9-]+/);

  for (const part of parts) {
    const statusMatch = part.match(/HTTP\/1\.1 (\d{3})/);
    if (statusMatch && statusMatch[1]) {
      const status = parseInt(statusMatch[1], 10);
      const bodyMatch = part.match(/\r\n\r\n({[\s\S]*})\r\n/);
      let body: unknown;
      if (bodyMatch && bodyMatch[1]) {
        try {
          body = JSON.parse(bodyMatch[1]);
        } catch {
          body = bodyMatch[1];
        }
      }
      responses.push({ status, body });
    }
  }

  return responses;
}

/**
 * Singleton instance for convenience
 */
export const dataverseClient = new DataverseClient();
