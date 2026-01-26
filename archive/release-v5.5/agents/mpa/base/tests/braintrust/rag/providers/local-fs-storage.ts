/**
 * Local Filesystem Storage Provider
 *
 * Storage provider implementation for personal/development environments
 * using the local filesystem via Node.js fs module.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageProvider } from './interfaces.js';

export class LocalFSStorageProvider implements StorageProvider {
  readonly name = 'local-fs';
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || process.cwd();
  }

  /**
   * Resolve path relative to base path
   */
  private resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.resolve(this.basePath, filePath);
  }

  /**
   * Read a document/file content as string
   */
  async readDocument(filePath: string): Promise<string> {
    const absolutePath = this.resolvePath(filePath);
    return fs.readFile(absolutePath, 'utf-8');
  }

  /**
   * Write content to a document/file
   */
  async writeDocument(filePath: string, content: string): Promise<void> {
    const absolutePath = this.resolvePath(filePath);
    const dir = path.dirname(absolutePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(absolutePath, content, 'utf-8');
  }

  /**
   * List all documents in a directory
   */
  async listDocuments(directory: string): Promise<string[]> {
    const absolutePath = this.resolvePath(directory);
    const entries = await fs.readdir(absolutePath);
    return entries.map(entry => path.join(absolutePath, entry));
  }

  /**
   * Read and parse JSON data
   */
  async readJSON<T>(filePath: string): Promise<T> {
    const content = await this.readDocument(filePath);
    return JSON.parse(content) as T;
  }

  /**
   * Write data as JSON
   */
  async writeJSON<T>(filePath: string, data: T): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    await this.writeDocument(filePath, content);
  }

  /**
   * Check if a document exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      const absolutePath = this.resolvePath(filePath);
      await fs.access(absolutePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a directory
   */
  async mkdir(dirPath: string): Promise<void> {
    const absolutePath = this.resolvePath(dirPath);
    await fs.mkdir(absolutePath, { recursive: true });
  }

  /**
   * Set the base path
   */
  setBasePath(basePath: string): void {
    this.basePath = basePath;
  }

  /**
   * Get the current base path
   */
  getBasePath(): string {
    return this.basePath;
  }
}

export default LocalFSStorageProvider;
