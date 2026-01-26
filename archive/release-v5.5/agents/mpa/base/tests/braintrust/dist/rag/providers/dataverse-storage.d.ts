/**
 * Dataverse Storage Provider (Stub)
 *
 * Storage provider implementation for corporate environments using
 * Microsoft Dataverse (part of Power Platform).
 *
 * This is a stub for future Microsoft integration.
 *
 * When implemented, this will use the Dataverse Web API for storing
 * and retrieving KB documents and RAG index data.
 */
import { StorageProvider, EnvironmentConfig } from './interfaces.js';
export declare class DataverseStorageProvider implements StorageProvider {
    readonly name = "dataverse";
    private url;
    private clientId;
    private clientSecret;
    private accessToken;
    constructor(config?: EnvironmentConfig);
    /**
     * Validate configuration
     */
    private validateConfig;
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
     * List documents from Dataverse entity
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
     * Check if a record exists in Dataverse
     */
    exists(path: string): Promise<boolean>;
}
export default DataverseStorageProvider;
//# sourceMappingURL=dataverse-storage.d.ts.map