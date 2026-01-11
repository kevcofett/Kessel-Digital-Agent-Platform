/**
 * Document Processor - Chunks KB files into retrievable passages
 *
 * Enhanced with:
 * - Multi-format section header detection (ALL CAPS, numbered, markdown)
 * - Synonym normalization for key MPA terms
 * - Document purpose tagging
 * - Enhanced benchmark extraction
 */
import { DocumentChunk } from './types.js';
export declare class DocumentProcessor {
    private kbPath;
    constructor(kbPath?: string);
    /**
     * Process all KB files and return chunks
     */
    processAll(): Promise<DocumentChunk[]>;
    /**
     * Get list of KB files (excluding templates and low-value files)
     */
    private getKBFiles;
    /**
     * Process a single file into chunks
     */
    private processFile;
    /**
     * Detect document type from filename
     */
    private detectDocumentType;
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
     * Detect document purpose from filename
     */
    private detectDocumentPurpose;
    /**
     * Check if content matches any synonym for a canonical term
     */
    private matchesSynonyms;
    /**
     * Extract normalized terms from content (for search optimization)
     */
    private extractNormalizedTerms;
    /**
     * Extract benchmark values with qualitative context
     * Enhanced to capture confidence levels and ranges
     */
    private extractBenchmarkDetails;
    /**
     * Extract metadata from chunk content
     */
    private extractMetadata;
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