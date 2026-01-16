/**
 * Local Filesystem Storage Provider
 *
 * Storage provider implementation for personal/development environments
 * using the local filesystem via Node.js fs module.
 */
import { StorageProvider } from './interfaces.js';
export declare class LocalFSStorageProvider implements StorageProvider {
    readonly name = "local-fs";
    private basePath;
    constructor(basePath?: string);
    /**
     * Resolve path relative to base path
     */
    private resolvePath;
    /**
     * Read a document/file content as string
     */
    readDocument(filePath: string): Promise<string>;
    /**
     * Write content to a document/file
     */
    writeDocument(filePath: string, content: string): Promise<void>;
    /**
     * List all documents in a directory
     */
    listDocuments(directory: string): Promise<string[]>;
    /**
     * Read and parse JSON data
     */
    readJSON<T>(filePath: string): Promise<T>;
    /**
     * Write data as JSON
     */
    writeJSON<T>(filePath: string, data: T): Promise<void>;
    /**
     * Check if a document exists
     */
    exists(filePath: string): Promise<boolean>;
    /**
     * Create a directory
     */
    mkdir(dirPath: string): Promise<void>;
    /**
     * Set the base path
     */
    setBasePath(basePath: string): void;
    /**
     * Get the current base path
     */
    getBasePath(): string;
}
export default LocalFSStorageProvider;
//# sourceMappingURL=local-fs-storage.d.ts.map