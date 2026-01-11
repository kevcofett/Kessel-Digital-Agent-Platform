/**
 * Document Store Abstraction
 *
 * Provides a path-based interface for document storage that works
 * across different storage backends:
 * - Local filesystem: Direct file paths
 * - Dataverse: Maps paths to entity/record structure
 *
 * This abstraction allows agents to use consistent path-based access
 * regardless of the underlying storage mechanism.
 */

import { StorageProvider } from './interfaces.js';

/**
 * Path to entity/field mapping for Dataverse
 */
export interface EntityMapping {
  entity: string;
  contentField: string;
  pathField?: string;
  additionalFields?: string[];
}

/**
 * Configuration for DocumentStore
 */
export interface DocumentStoreConfig {
  /**
   * Map of path prefixes to Dataverse entity mappings
   * Only used when storage provider is Dataverse
   */
  pathMappings?: Map<string, EntityMapping>;
}

/**
 * Default path mappings for agent learning data
 */
export const DEFAULT_PATH_MAPPINGS: Map<string, EntityMapping> = new Map([
  ['learning/patterns/', {
    entity: 'agentcore_successpatterns',
    contentField: 'agentcore_content',
    pathField: 'agentcore_logicalpath',
  }],
  ['learning/feedback/', {
    entity: 'agentcore_userfeedback',
    contentField: 'agentcore_content',
    pathField: 'agentcore_logicalpath',
  }],
  ['learning/critiques/', {
    entity: 'agentcore_critiques',
    contentField: 'agentcore_content',
    pathField: 'agentcore_logicalpath',
  }],
  ['rag-cache/', {
    entity: 'agentcore_ragcache',
    contentField: 'agentcore_data',
    pathField: 'agentcore_logicalpath',
  }],
  ['kb/', {
    entity: 'agentcore_kbdocuments',
    contentField: 'agentcore_content',
    pathField: 'agentcore_logicalpath',
  }],
]);

/**
 * Document Store interface for consistent path-based access
 */
export interface DocumentStore {
  /**
   * Read document content by logical path
   */
  read(logicalPath: string): Promise<string>;

  /**
   * Write document content to logical path
   */
  write(logicalPath: string, content: string): Promise<void>;

  /**
   * List documents under a path prefix
   */
  list(prefix: string): Promise<string[]>;

  /**
   * Check if document exists at path
   */
  exists(logicalPath: string): Promise<boolean>;

  /**
   * Read and parse JSON from path
   */
  readJSON<T>(logicalPath: string): Promise<T>;

  /**
   * Write JSON to path
   */
  writeJSON<T>(logicalPath: string, data: T): Promise<void>;

  /**
   * Delete document at path (if supported)
   */
  delete?(logicalPath: string): Promise<void>;
}

/**
 * Creates a DocumentStore from any StorageProvider
 *
 * For local filesystem storage, paths are used directly.
 * For Dataverse, paths are mapped to entity/record structure.
 */
export class UnifiedDocumentStore implements DocumentStore {
  private storage: StorageProvider;
  private pathMappings: Map<string, EntityMapping>;

  constructor(storage: StorageProvider, config?: DocumentStoreConfig) {
    this.storage = storage;
    this.pathMappings = config?.pathMappings || DEFAULT_PATH_MAPPINGS;
  }

  /**
   * Read document content by logical path
   */
  async read(logicalPath: string): Promise<string> {
    if (this.storage.name === 'dataverse') {
      return this.readFromDataverse(logicalPath);
    }
    return this.storage.readDocument(logicalPath);
  }

  /**
   * Write document content to logical path
   */
  async write(logicalPath: string, content: string): Promise<void> {
    if (this.storage.name === 'dataverse') {
      return this.writeToDataverse(logicalPath, content);
    }
    return this.storage.writeDocument(logicalPath, content);
  }

  /**
   * List documents under a path prefix
   */
  async list(prefix: string): Promise<string[]> {
    if (this.storage.name === 'dataverse') {
      return this.listFromDataverse(prefix);
    }
    return this.storage.listDocuments(prefix);
  }

  /**
   * Check if document exists at path
   */
  async exists(logicalPath: string): Promise<boolean> {
    return this.storage.exists(logicalPath);
  }

  /**
   * Read and parse JSON from path
   */
  async readJSON<T>(logicalPath: string): Promise<T> {
    const content = await this.read(logicalPath);
    return JSON.parse(content) as T;
  }

  /**
   * Write JSON to path
   */
  async writeJSON<T>(logicalPath: string, data: T): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    await this.write(logicalPath, content);
  }

  /**
   * Get the underlying storage provider name
   */
  getStorageType(): string {
    return this.storage.name;
  }

  /**
   * Check if using Dataverse storage
   */
  isDataverse(): boolean {
    return this.storage.name === 'dataverse';
  }

  // ============================================================================
  // DATAVERSE-SPECIFIC METHODS (for path → entity mapping)
  // ============================================================================

  /**
   * Find the entity mapping for a given path
   */
  private resolveMapping(logicalPath: string): EntityMapping | null {
    for (const [prefix, mapping] of this.pathMappings) {
      if (logicalPath.startsWith(prefix)) {
        return mapping;
      }
    }
    return null;
  }

  /**
   * Extract record ID from logical path
   * For paths like "learning/patterns/success-123.json", returns "success-123"
   */
  private extractIdFromPath(logicalPath: string): string {
    const parts = logicalPath.split('/');
    const filename = parts[parts.length - 1];
    // Remove extension
    return filename.replace(/\.[^.]+$/, '');
  }

  /**
   * Read from Dataverse by mapping path to entity query
   */
  private async readFromDataverse(logicalPath: string): Promise<string> {
    const mapping = this.resolveMapping(logicalPath);

    if (!mapping) {
      // Fall back to direct path (shouldn't happen with proper configuration)
      return this.storage.readDocument(logicalPath);
    }

    // For Dataverse, we query by logical path field
    // The storage provider should handle the OData query internally
    // This is a simplified implementation - actual Dataverse provider
    // would need to construct proper OData queries

    // Construct a "virtual path" that includes entity info
    // The Dataverse provider interprets this specially
    const dataversePath = `${mapping.entity}?$filter=${mapping.pathField} eq '${logicalPath}'`;
    return this.storage.readDocument(dataversePath);
  }

  /**
   * Write to Dataverse by mapping path to entity upsert
   */
  private async writeToDataverse(logicalPath: string, content: string): Promise<void> {
    const mapping = this.resolveMapping(logicalPath);

    if (!mapping) {
      return this.storage.writeDocument(logicalPath, content);
    }

    // Construct upsert path with logical path as identifier
    // The Dataverse provider handles the actual upsert logic
    const dataversePath = `${mapping.entity}/${this.extractIdFromPath(logicalPath)}`;

    // The content needs to be wrapped with path field for Dataverse
    const wrappedContent = JSON.stringify({
      [mapping.contentField]: content,
      [mapping.pathField || 'logicalpath']: logicalPath,
    });

    return this.storage.writeDocument(dataversePath, wrappedContent);
  }

  /**
   * List from Dataverse by querying entity with path prefix filter
   */
  private async listFromDataverse(prefix: string): Promise<string[]> {
    const mapping = this.resolveMapping(prefix);

    if (!mapping) {
      return this.storage.listDocuments(prefix);
    }

    // Query Dataverse entity with path prefix filter
    const dataversePath = `${mapping.entity}?$filter=startswith(${mapping.pathField}, '${prefix}')&$select=${mapping.pathField}`;
    const results = await this.storage.listDocuments(dataversePath);

    // Results should be the logical paths from Dataverse
    return results;
  }

  /**
   * Add a custom path mapping
   */
  addPathMapping(prefix: string, mapping: EntityMapping): void {
    this.pathMappings.set(prefix, mapping);
  }

  /**
   * Get all configured path mappings
   */
  getPathMappings(): Map<string, EntityMapping> {
    return new Map(this.pathMappings);
  }
}

/**
 * Factory function to create appropriate document store
 */
export function createDocumentStore(
  storage: StorageProvider,
  config?: DocumentStoreConfig
): DocumentStore {
  return new UnifiedDocumentStore(storage, config);
}

export default UnifiedDocumentStore;
