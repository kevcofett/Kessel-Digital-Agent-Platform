/**
 * Dataverse Storage Provider
 *
 * Provides document storage capabilities using Microsoft Dataverse.
 * Used in corporate/Mastercard environments.
 *
 * NOTE: Dataverse uses a record-based (entity/field) model, not a
 * file path model. Paths are mapped to entity/record lookups.
 */
import type { StorageProvider, EnvironmentConfig } from './interfaces.js';
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
export declare class DataverseStorageProvider implements StorageProvider {
    readonly name = "dataverse";
    private environmentUrl;
    private tenantId;
    private clientId?;
    private clientSecret?;
    private accessToken?;
    private tokenExpiry?;
    private tableName;
    private timeout;
    private columnMap;
    constructor(config: DataverseStorageConfig | EnvironmentConfig);
    /**
     * Initialize the provider
     */
    initialize(): Promise<void>;
    /**
     * Read a document from Dataverse
     */
    readDocument(path: string): Promise<string>;
    /**
     * Write a document to Dataverse
     */
    writeDocument(path: string, content: string): Promise<void>;
    /**
     * List documents in a directory
     */
    listDocuments(directory: string): Promise<string[]>;
    /**
     * Read and parse JSON from Dataverse
     */
    readJSON<T>(path: string): Promise<T>;
    /**
     * Write JSON to Dataverse
     */
    writeJSON<T>(path: string, data: T): Promise<void>;
    /**
     * Check if a document exists
     */
    exists(path: string): Promise<boolean>;
    /**
     * Create a directory (no-op for Dataverse - directories are virtual)
     */
    mkdir(_path: string): Promise<void>;
    private getAccessToken;
    private findDocumentByPath;
    private getDirectory;
    private getTitle;
}
export declare function createDataverseStorageProvider(config: DataverseStorageConfig): DataverseStorageProvider;
export default DataverseStorageProvider;
//# sourceMappingURL=dataverse-storage.d.ts.map