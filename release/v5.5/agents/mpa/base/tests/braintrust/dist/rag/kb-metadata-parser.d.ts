/**
 * KB Document Header Parser
 *
 * Parses structured metadata from KB document headers for improved retrieval.
 * Supports the new document header standard with META_ prefixed fields.
 *
 * Header Format:
 * ================================================================================
 * [SECTION TITLE]
 * ================================================================================
 *
 * META_WORKFLOW_STEPS: 3,4,5
 * META_TOPICS: channel_selection, budget_allocation
 * META_VERTICALS: ALL
 * META_CHANNELS: PROGRAMMATIC_DISPLAY, CTV_OTT
 * META_INTENT: CHANNEL_SELECTION, BUDGET_PLANNING
 * META_CONFIDENCE: HIGH
 * META_LAST_UPDATED: 2026-01-15
 *
 * [Section content...]
 * ================================================================================
 *
 * @module kb-metadata-parser
 * @version 6.0
 */
import { DocumentType } from './types.js';
/**
 * Intent categories for query-to-document matching
 */
export type QueryIntent = 'BENCHMARK_LOOKUP' | 'CHANNEL_SELECTION' | 'BUDGET_PLANNING' | 'AUDIENCE_TARGETING' | 'MEASUREMENT_GUIDANCE' | 'WORKFLOW_HELP' | 'ECONOMICS_VALIDATION' | 'RISK_ASSESSMENT' | 'GENERAL_GUIDANCE';
/**
 * Confidence levels for document sections
 */
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
/**
 * Structured metadata extracted from document headers
 */
export interface KBSectionMetadata {
    sectionTitle: string;
    workflowSteps: number[];
    topics: string[];
    verticals: string[];
    channels: string[];
    intents: QueryIntent[];
    confidence: ConfidenceLevel;
    lastUpdated: Date | null;
    rawMetadata: Record<string, string>;
}
/**
 * Document-level metadata combining header info with file-level data
 */
export interface KBDocumentMetadata {
    filename: string;
    documentType: DocumentType;
    category: string;
    version: string;
    date: string | null;
    status: string;
    sections: KBSectionMetadata[];
    totalSections: number;
    topics: string[];
}
/**
 * Legacy header format (DOCUMENT:, CATEGORY:, etc.)
 */
export interface LegacyDocumentHeader {
    document: string;
    category: string;
    topics: string[];
    version: string;
    date: string | null;
    status: string;
}
export declare class KBMetadataParser {
    /**
     * Parse a complete KB document and extract all metadata
     */
    parseDocument(content: string, filename: string): KBDocumentMetadata;
    /**
     * Parse legacy header format (DOCUMENT:, CATEGORY:, etc.)
     */
    parseLegacyHeader(content: string): LegacyDocumentHeader;
    /**
     * Parse document into sections with their metadata
     */
    parseSections(content: string): KBSectionMetadata[];
    /**
     * Parse a single section and extract its metadata
     */
    private parseSection;
    /**
     * Parse a META_ field using its registered parser
     */
    private parseMetaField;
    /**
     * Extract section title from content between delimiters
     */
    private extractSectionTitle;
    /**
     * Infer metadata from content when no META_ fields present
     */
    private inferMetadataFromContent;
    /**
     * Infer document type from filename and category
     */
    private inferDocumentType;
    /**
     * Check if a document has the new META_ header format
     */
    hasStructuredMetadata(content: string): boolean;
    /**
     * Generate META_ header block for a section (utility for document migration)
     */
    generateMetaBlock(metadata: Partial<KBSectionMetadata>): string;
}
/**
 * Map query intent to relevant document types
 */
export declare function getDocumentTypesForIntent(intent: QueryIntent): DocumentType[];
/**
 * Map query intent to relevant workflow steps
 */
export declare function getStepsForIntent(intent: QueryIntent): number[];
/**
 * Score how well section metadata matches a query intent
 */
export declare function scoreMetadataMatch(sectionMetadata: KBSectionMetadata, queryIntent: QueryIntent, querySteps: number[]): number;
export default KBMetadataParser;
//# sourceMappingURL=kb-metadata-parser.d.ts.map