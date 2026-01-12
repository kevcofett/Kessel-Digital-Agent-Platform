/**
 * Dataverse Storage Provider
 *
 * Provides document storage capabilities using Microsoft Dataverse.
 * Used in corporate/Mastercard environments.
 *
 * NOTE: Dataverse uses a record-based (entity/field) model, not a
 * file path model. Paths are mapped to entity/record lookups.
 */

import type {
  StorageProvider,
  EnvironmentConfig,
} from './interfaces.js';
import { ProviderConfigurationError } from './interfaces.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface DataverseStorageConfig {
  /**
   * Dataverse environment URL
   * e.g., https://org.crm.dynamics.com
   */
  environmentUrl: string;

  /**
   * Tenant ID for authentication
   */
  tenantId: string;

  /**
   * Client ID for authentication
   */
  clientId?: string;

  /**
   * Client secret for authentication
   */
  clientSecret?: string;

  /**
   * Access token (if already obtained)
   */
  accessToken?: string;

  /**
   * Table name for documents (default: cr_kbdocuments)
   */
  tableName?: string;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
}

// ============================================================================
// COLUMN MAPPINGS
// ============================================================================

const DEFAULT_COLUMN_MAP = {
  id: 'cr_documentid',
  title: 'cr_title',
  content: 'cr_content',
  path: 'cr_path',
  directory: 'cr_directory',
  createdAt: 'createdon',
  updatedAt: 'modifiedon',
};

// ============================================================================
// DATAVERSE STORAGE PROVIDER
// ============================================================================

export class DataverseStorageProvider implements StorageProvider {
  readonly name = 'dataverse';

  private environmentUrl: string;
  private tenantId: string;
  private clientId?: string;
  private clientSecret?: string;
  private accessToken?: string;
  private tokenExpiry?: Date;
  private tableName: string;
  private timeout: number;
  private columnMap: typeof DEFAULT_COLUMN_MAP;

  constructor(config: DataverseStorageConfig | EnvironmentConfig) {
    // Handle both config types
    if ('environmentUrl' in config) {
      // DataverseStorageConfig
      if (!config.environmentUrl) {
        throw new Error('Dataverse environment URL is required');
      }
      if (!config.tenantId) {
        throw new Error('Dataverse tenant ID is required');
      }

      this.environmentUrl = config.environmentUrl.replace(/\/$/, '');
      this.tenantId = config.tenantId;
      this.clientId = config.clientId || process.env.DATAVERSE_CLIENT_ID;
      this.clientSecret = config.clientSecret || process.env.DATAVERSE_CLIENT_SECRET;
      this.accessToken = config.accessToken;
      this.tableName = config.tableName || 'cr_kbdocuments';
      this.timeout = config.timeout || 30000;
    } else {
      // EnvironmentConfig
      const missing: string[] = [];
      if (!config.dataverseUrl) missing.push('DATAVERSE_URL');
      if (!config.dataverseClientId) missing.push('DATAVERSE_CLIENT_ID');
      if (!config.dataverseClientSecret) missing.push('DATAVERSE_CLIENT_SECRET');

      if (missing.length > 0) {
        throw new ProviderConfigurationError('Dataverse', missing);
      }

      this.environmentUrl = config.dataverseUrl!.replace(/\/$/, '');
      this.tenantId = 'common';  // Would need to be provided
      this.clientId = config.dataverseClientId;
      this.clientSecret = config.dataverseClientSecret;
      this.tableName = 'cr_kbdocuments';
      this.timeout = 30000;
    }

    this.columnMap = DEFAULT_COLUMN_MAP;
  }

  /**
   * Initialize the provider
   */
  async initialize(): Promise<void> {
    await this.getAccessToken();
  }

  /**
   * Read a document from Dataverse
   */
  async readDocument(path: string): Promise<string> {
    const token = await this.getAccessToken();
    const filter = `${this.columnMap.path} eq '${path}'`;
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tableName}?$filter=${encodeURIComponent(filter)}&$top=1`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Dataverse read error: ${errorBody}`);
    }

    const data = await response.json() as { value: DataverseRecord[] };
    if (data.value.length === 0) {
      throw new Error(`Document not found: ${path}`);
    }

    return data.value[0][this.columnMap.content] as string;
  }

  /**
   * Write a document to Dataverse
   */
  async writeDocument(path: string, content: string): Promise<void> {
    const token = await this.getAccessToken();

    // Check if document exists
    const existingDoc = await this.findDocumentByPath(path);

    const record = {
      [this.columnMap.path]: path,
      [this.columnMap.content]: content,
      [this.columnMap.directory]: this.getDirectory(path),
      [this.columnMap.title]: this.getTitle(path),
    };

    if (existingDoc) {
      // Update existing
      const updateUrl = `${this.environmentUrl}/api/data/v9.2/${this.tableName}(${existingDoc.id})`;
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Dataverse update error: ${errorBody}`);
      }
    } else {
      // Create new
      const createUrl = `${this.environmentUrl}/api/data/v9.2/${this.tableName}`;
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Dataverse create error: ${errorBody}`);
      }
    }
  }

  /**
   * List documents in a directory
   */
  async listDocuments(directory: string): Promise<string[]> {
    const token = await this.getAccessToken();
    const normalizedDir = directory.endsWith('/') ? directory : `${directory}/`;
    const filter = `startswith(${this.columnMap.path}, '${normalizedDir}')`;
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tableName}?$filter=${encodeURIComponent(filter)}&$select=${this.columnMap.path}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Dataverse list error: ${errorBody}`);
    }

    const data = await response.json() as { value: DataverseRecord[] };
    return data.value.map(record => record[this.columnMap.path] as string);
  }

  /**
   * Read and parse JSON from Dataverse
   */
  async readJSON<T>(path: string): Promise<T> {
    const content = await this.readDocument(path);
    return JSON.parse(content) as T;
  }

  /**
   * Write JSON to Dataverse
   */
  async writeJSON<T>(path: string, data: T): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    await this.writeDocument(path, content);
  }

  /**
   * Check if a document exists
   */
  async exists(path: string): Promise<boolean> {
    const doc = await this.findDocumentByPath(path);
    return doc !== null;
  }

  /**
   * Create a directory (no-op for Dataverse - directories are virtual)
   */
  async mkdir(_path: string): Promise<void> {
    // Directories are virtual in Dataverse - no action needed
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    // If no client credentials, check for env var token
    if (!this.clientId || !this.clientSecret) {
      const envToken = process.env.DATAVERSE_ACCESS_TOKEN;
      if (envToken) {
        this.accessToken = envToken;
        return envToken;
      }
      // If we have a pre-configured access token, use it
      if (this.accessToken) {
        return this.accessToken;
      }
      throw new Error('Dataverse credentials not configured');
    }

    // Request new token
    const tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: `${this.environmentUrl}/.default`,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Token request failed: ${errorBody}`);
    }

    const tokenData = await response.json() as TokenResponse;
    this.accessToken = tokenData.access_token;

    // Set expiry with 5 minute buffer
    const expiresIn = (tokenData.expires_in || 3600) - 300;
    this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);

    return this.accessToken;
  }

  private async findDocumentByPath(path: string): Promise<{ id: string } | null> {
    const token = await this.getAccessToken();
    const filter = `${this.columnMap.path} eq '${path}'`;
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tableName}?$filter=${encodeURIComponent(filter)}&$select=${this.columnMap.id}&$top=1`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as { value: DataverseRecord[] };
      if (data.value.length === 0) {
        return null;
      }

      return { id: data.value[0][this.columnMap.id] as string };
    } catch {
      return null;
    }
  }

  private getDirectory(path: string): string {
    const lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.substring(0, lastSlash) : '/';
  }

  private getTitle(path: string): string {
    const lastSlash = path.lastIndexOf('/');
    const filename = lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
    return filename.replace(/\.[^.]+$/, '');
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface DataverseRecord {
  [key: string]: unknown;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createDataverseStorageProvider(
  config: DataverseStorageConfig
): DataverseStorageProvider {
  return new DataverseStorageProvider(config);
}

export default DataverseStorageProvider;
