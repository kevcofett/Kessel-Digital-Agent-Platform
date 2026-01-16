/**
 * Document Processor - Chunks KB files into retrievable passages
 *
 * v6.0 Enhanced with:
 * - Integration with KBMetadataParser for structured headers
 * - Concept-aligned semantic chunking
 * - Multi-format section header detection (ALL CAPS, numbered, markdown)
 * - Synonym normalization for key MPA terms
 * - Document purpose tagging
 * - Enhanced benchmark extraction
 * - Content-type aware chunk sizing
 */
import { DocumentChunk } from './types.js';
import { KBSectionMetadata, KBDocumentMetadata } from './kb-metadata-parser.js';
/**
 * Enhanced chunk with v6.0 metadata from KBMetadataParser
 */
export interface EnhancedDocumentChunk extends DocumentChunk {
    kbMetadata?: KBSectionMetadata;
    documentMetadata?: KBDocumentMetadata;
    contentType: string;
    semanticBoundary: boolean;
}
export declare class DocumentProcessor {
    private kbPath;
    private metadataParser;
    private useSemanticChunking;
    constructor(kbPath?: string, options?: {
        useSemanticChunking?: boolean;
    });
    /**
     * Process all KB files and return chunks
     */
    processAll(): Promise<DocumentChunk[]>;
    /**
     * Process all KB files with v6.0 enhanced metadata
     */
    processAllEnhanced(): Promise<EnhancedDocumentChunk[]>;
    /**
     * Get list of KB files (excluding templates and low-value files)
     */
    private getKBFiles;
    /**
     * Process a single file into chunks (legacy method for backwards compatibility)
     */
    private processFile;
    /**
     * Process a single file with v6.0 enhanced chunking
     */
    private processFileEnhanced;
    /**
     * Extract section content from document using section title
     */
    private extractSectionContent;
    /**
     * Escape special regex characters
     */
    private escapeRegex;
    /**
     * Detect content type for chunk size optimization
     */
    private detectContentType;
    /**
     * Detect content type from content only (for legacy path)
     */
    private detectContentTypeFromContent;
    /**
     * Chunk section with semantic awareness (v6.0)
     */
    private chunkSectionSemantic;
    /**
     * Detect semantic units (concept boundaries) within content
     */
    private detectSemanticUnits;
    /**
     * Check if content represents a semantic boundary (complete concept)
     */
    private isSemanticBoundary;
    /**
     * Create enhanced chunk with v6.0 metadata
     */
    private createEnhancedChunk;
    /**
     * Detect document type from filename
     */
    private detectDocumentType;
    /**
     * Split content into sections based on headers (legacy method)
     * Supports multiple header formats:
     * - ALL CAPS: "SECTION NAME" or "SECTION 1: NAME"
     * - Numbered: "1.1 Section Name" or "1. Section Name"
     * - Markdown: "## Section Name" or "### Section Name"
     */
    private splitIntoSections;
    /**
     * Chunk a section into smaller pieces (legacy method)
     */
    private chunkSection;
    /**
     * Create a chunk with metadata (legacy method)
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
     * Save enhanced chunks to cache file (v6.0)
     */
    saveEnhancedToCache(chunks: EnhancedDocumentChunk[]): Promise<void>;
    /**
     * Load chunks from cache if available
     */
    loadFromCache(): Promise<DocumentChunk[] | null>;
    /**
     * Load enhanced chunks from cache if available (v6.0)
     */
    loadEnhancedFromCache(): Promise<EnhancedDocumentChunk[] | null>;
}
export default DocumentProcessor;
//# sourceMappingURL=document-processor.d.ts.map