/**
 * Local Filesystem Storage Provider
 *
 * Storage provider implementation for personal/development environments
 * using the local filesystem via Node.js fs module.
 */
import * as fs from 'fs/promises';
import * as path from 'path';
export class LocalFSStorageProvider {
    name = 'local-fs';
    basePath;
    constructor(basePath) {
        this.basePath = basePath || process.cwd();
    }
    /**
     * Resolve path relative to base path
     */
    resolvePath(filePath) {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        return path.resolve(this.basePath, filePath);
    }
    /**
     * Read a document/file content as string
     */
    async readDocument(filePath) {
        const absolutePath = this.resolvePath(filePath);
        return fs.readFile(absolutePath, 'utf-8');
    }
    /**
     * Write content to a document/file
     */
    async writeDocument(filePath, content) {
        const absolutePath = this.resolvePath(filePath);
        const dir = path.dirname(absolutePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(absolutePath, content, 'utf-8');
    }
    /**
     * List all documents in a directory
     */
    async listDocuments(directory) {
        const absolutePath = this.resolvePath(directory);
        const entries = await fs.readdir(absolutePath);
        return entries.map(entry => path.join(absolutePath, entry));
    }
    /**
     * Read and parse JSON data
     */
    async readJSON(filePath) {
        const content = await this.readDocument(filePath);
        return JSON.parse(content);
    }
    /**
     * Write data as JSON
     */
    async writeJSON(filePath, data) {
        const content = JSON.stringify(data, null, 2);
        await this.writeDocument(filePath, content);
    }
    /**
     * Check if a document exists
     */
    async exists(filePath) {
        try {
            const absolutePath = this.resolvePath(filePath);
            await fs.access(absolutePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Create a directory
     */
    async mkdir(dirPath) {
        const absolutePath = this.resolvePath(dirPath);
        await fs.mkdir(absolutePath, { recursive: true });
    }
    /**
     * Set the base path
     */
    setBasePath(basePath) {
        this.basePath = basePath;
    }
    /**
     * Get the current base path
     */
    getBasePath() {
        return this.basePath;
    }
}
export default LocalFSStorageProvider;
//# sourceMappingURL=local-fs-storage.js.map