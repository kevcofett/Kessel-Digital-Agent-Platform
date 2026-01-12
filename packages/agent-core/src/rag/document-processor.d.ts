/**
 * Document Processor - Chunks KB files into retrievable passages
 *
 * Generic document processor that accepts agent-specific configuration
 * for customizing chunking, metadata extraction, and file handling.
 */
import { DocumentChunk } from './types.js';
import { AgentRAGConfig, RAGSystemConfig } from './config.js';
export declare class DocumentProcessor {
    private agentConfig;
    private systemConfig;
    private basePath;
    constructor(agentConfig: AgentRAGConfig, systemConfig?: Partial<RAGSystemConfig>, basePath?: string);
    /**
     * Process all KB files and return chunks
     */
    processAll(): Promise<DocumentChunk[]>;
    /**
     * Get list of KB files (excluding configured files)
     */
    private getKBFiles;
    /**
     * Resolve the KB path
     */
    private resolveKBPath;
    /**
     * Process a single file into chunks
     */
    private processFile;
    /**
     * Detect document type from filename using agent config
     */
    private detectDocumentType;
    /**
     * Detect document purpose from filename
     */
    private detectDocumentPurpose;
    /**
     * Split content into sections based on headers
     * Supports multiple header formats:
     * - ALL CAPS: "SECTION NAME" or "SECTION 1: NAME"
     * - Numbered: "1.1 Section Name" or "1. Section Name"
     * - Markdown: "## Section Name" or "### Section Name"
     */
    private splitIntoSections;
    /**
     * Chunk a section into smaller pieces
     */
    private chunkSection;
    /**
     * Create a chunk with metadata
     */
    private createChunk;
    /**
     * Extract metadata from chunk content
     */
    private extractMetadata;
    /**
     * Check if content matches any synonym for a canonical term
     */
    private matchesSynonyms;
    /**
     * Extract normalized terms from content
     */
    private extractNormalizedTerms;
    /**
     * Extract benchmark values with qualitative context
     */
    private extractBenchmarkDetails;
    /**
     * Save chunks to cache file
     */
    saveToCache(chunks: DocumentChunk[]): Promise<void>;
    /**
     * Load chunks from cache if available
     */
    loadFromCache(): Promise<DocumentChunk[] | null>;
}
export default DocumentProcessor;
//# sourceMappingURL=document-processor.d.ts.map