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
/**
 * Default path mappings for agent learning data
 */
export const DEFAULT_PATH_MAPPINGS = new Map([
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
 * Creates a DocumentStore from any StorageProvider
 *
 * For local filesystem storage, paths are used directly.
 * For Dataverse, paths are mapped to entity/record structure.
 */
export class UnifiedDocumentStore {
    storage;
    pathMappings;
    constructor(storage, config) {
        this.storage = storage;
        this.pathMappings = config?.pathMappings || DEFAULT_PATH_MAPPINGS;
    }
    /**
     * Read document content by logical path
     */
    async read(logicalPath) {
        if (this.storage.name === 'dataverse') {
            return this.readFromDataverse(logicalPath);
        }
        return this.storage.readDocument(logicalPath);
    }
    /**
     * Write document content to logical path
     */
    async write(logicalPath, content) {
        if (this.storage.name === 'dataverse') {
            return this.writeToDataverse(logicalPath, content);
        }
        return this.storage.writeDocument(logicalPath, content);
    }
    /**
     * List documents under a path prefix
     */
    async list(prefix) {
        if (this.storage.name === 'dataverse') {
            return this.listFromDataverse(prefix);
        }
        return this.storage.listDocuments(prefix);
    }
    /**
     * Check if document exists at path
     */
    async exists(logicalPath) {
        return this.storage.exists(logicalPath);
    }
    /**
     * Read and parse JSON from path
     */
    async readJSON(logicalPath) {
        const content = await this.read(logicalPath);
        return JSON.parse(content);
    }
    /**
     * Write JSON to path
     */
    async writeJSON(logicalPath, data) {
        const content = JSON.stringify(data, null, 2);
        await this.write(logicalPath, content);
    }
    /**
     * Get the underlying storage provider name
     */
    getStorageType() {
        return this.storage.name;
    }
    /**
     * Check if using Dataverse storage
     */
    isDataverse() {
        return this.storage.name === 'dataverse';
    }
    // ============================================================================
    // DATAVERSE-SPECIFIC METHODS (for path → entity mapping)
    // ============================================================================
    /**
     * Find the entity mapping for a given path
     */
    resolveMapping(logicalPath) {
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
    extractIdFromPath(logicalPath) {
        const parts = logicalPath.split('/');
        const filename = parts[parts.length - 1];
        // Remove extension
        return filename.replace(/\.[^.]+$/, '');
    }
    /**
     * Read from Dataverse by mapping path to entity query
     */
    async readFromDataverse(logicalPath) {
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
    async writeToDataverse(logicalPath, content) {
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
    async listFromDataverse(prefix) {
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
    addPathMapping(prefix, mapping) {
        this.pathMappings.set(prefix, mapping);
    }
    /**
     * Get all configured path mappings
     */
    getPathMappings() {
        return new Map(this.pathMappings);
    }
}
/**
 * Factory function to create appropriate document store
 */
export function createDocumentStore(storage, config) {
    return new UnifiedDocumentStore(storage, config);
}
export default UnifiedDocumentStore;
//# sourceMappingURL=document-store.js.map