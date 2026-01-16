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
export declare const DEFAULT_PATH_MAPPINGS: Map<string, EntityMapping>;
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
export declare class UnifiedDocumentStore implements DocumentStore {
    private storage;
    private pathMappings;
    constructor(storage: StorageProvider, config?: DocumentStoreConfig);
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
     * Get the underlying storage provider name
     */
    getStorageType(): string;
    /**
     * Check if using Dataverse storage
     */
    isDataverse(): boolean;
    /**
     * Find the entity mapping for a given path
     */
    private resolveMapping;
    /**
     * Extract record ID from logical path
     * For paths like "learning/patterns/success-123.json", returns "success-123"
     */
    private extractIdFromPath;
    /**
     * Read from Dataverse by mapping path to entity query
     */
    private readFromDataverse;
    /**
     * Write to Dataverse by mapping path to entity upsert
     */
    private writeToDataverse;
    /**
     * List from Dataverse by querying entity with path prefix filter
     */
    private listFromDataverse;
    /**
     * Add a custom path mapping
     */
    addPathMapping(prefix: string, mapping: EntityMapping): void;
    /**
     * Get all configured path mappings
     */
    getPathMappings(): Map<string, EntityMapping>;
}
/**
 * Factory function to create appropriate document store
 */
export declare function createDocumentStore(storage: StorageProvider, config?: DocumentStoreConfig): DocumentStore;
export default UnifiedDocumentStore;
//# sourceMappingURL=document-store.d.ts.map