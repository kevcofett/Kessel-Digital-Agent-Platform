/**
 * KB Document Header Parser
 *
 * Parses structured metadata from KB document headers for improved retrieval.
 * Supports the new document header standard with META_ prefixed fields.
 *
 * Document-Level META Tags (KB v6.0):
 * META_DOCUMENT_TYPE: expert_guidance | framework | playbook | index | ...
 * META_PRIMARY_TOPICS: comma-separated topic list
 * META_WORKFLOW_STEPS: 3,4,5 | ALL
 * META_INTENTS: CHANNEL_SELECTION, BUDGET_PLANNING | ALL
 * META_VERTICALS: ALL | RETAIL, ECOMMERCE
 * META_CHANNELS: ALL | PAID_SEARCH, CTV_OTT
 * META_LAST_UPDATED: 2026-01-16
 * META_CHUNK_PRIORITY: 0-3 (0=highest, 3=lowest)
 *
 * Section-Level META Tags:
 * META_SECTION_ID: unique_section_identifier
 * META_TOPICS: section-specific topics
 * META_WORKFLOW_STEPS: section-specific steps
 * META_INTENT: section-specific intent (singular)
 * META_CONFIDENCE: HIGH | MEDIUM | LOW
 * META_WEB_SEARCH_TRIGGER: TRUE | FALSE
 *
 * @module kb-metadata-parser
 * @version 6.0
 */
import { DocumentType } from './types.js';
/**
 * Intent categories for query-to-document matching
 * Aligned with KB_INDEX_v6_0.txt intent definitions
 */
export type QueryIntent = 'BENCHMARK_LOOKUP' | 'CHANNEL_SELECTION' | 'BUDGET_PLANNING' | 'AUDIENCE_TARGETING' | 'MEASUREMENT_GUIDANCE' | 'WORKFLOW_HELP' | 'ECONOMICS_VALIDATION' | 'RISK_ASSESSMENT' | 'CONFIDENCE_ASSESSMENT' | 'GAP_RESOLUTION' | 'GENERAL_GUIDANCE';
/**
 * Confidence levels for document sections
 */
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
/**
 * Chunk priority levels (0 = highest priority, 3 = lowest)
 */
export type ChunkPriority = 0 | 1 | 2 | 3;
/**
 * KB v6.0 document type codes
 */
export type KBDocumentTypeCode = 'index' | 'expert_guidance' | 'framework' | 'playbook' | 'guide' | 'implications' | 'audience' | 'support' | 'core_standards';
/**
 * Structured metadata extracted from document headers
 */
export interface KBSectionMetadata {
    sectionTitle: string;
    sectionId: string | null;
    workflowSteps: number[];
    topics: string[];
    verticals: string[];
    channels: string[];
    intents: QueryIntent[];
    confidence: ConfidenceLevel;
    lastUpdated: Date | null;
    webSearchTrigger: boolean;
    rawMetadata: Record<string, string>;
}
/**
 * Document-level metadata combining header info with file-level data
 */
export interface KBDocumentMetadata {
    filename: string;
    filepath: string;
    documentType: DocumentType;
    documentTypeCode: KBDocumentTypeCode | null;
    category: string;
    version: string;
    date: string | null;
    status: string;
    compliance: string | null;
    sections: KBSectionMetadata[];
    totalSections: number;
    topics: string[];
    primaryTopics: string[];
    workflowSteps: number[];
    intents: QueryIntent[];
    verticals: string[];
    channels: string[];
    chunkPriority: ChunkPriority;
    lastUpdated: Date | null;
    hasWebSearchTriggers: boolean;
}
/**
 * Legacy header format (DOCUMENT:, CATEGORY:, etc.) plus v6.0 document-level META
 */
export interface LegacyDocumentHeader {
    document: string;
    category: string;
    topics: string[];
    version: string;
    date: string | null;
    status: string;
    compliance: string | null;
    documentTypeCode: KBDocumentTypeCode | null;
    primaryTopics: string[];
    workflowSteps: number[];
    intents: QueryIntent[];
    verticals: string[];
    channels: string[];
    chunkPriority: ChunkPriority;
    lastUpdated: Date | null;
}
export declare class KBMetadataParser {
    /**
     * Parse a complete KB document and extract all metadata
     */
    parseDocument(content: string, filename: string, filepath?: string): KBDocumentMetadata;
    /**
     * Parse legacy header format (DOCUMENT:, CATEGORY:, etc.) plus v6.0 document-level META
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
     * Infer document type from filename, category, and v6.0 documentTypeCode
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
/**
 * Default path to KB v6.0 directory
 */
export declare const KB_V6_DEFAULT_PATH = "../../../kb-v6";
/**
 * Intent to document mapping from KB_INDEX_v6_0.txt
 */
export interface IntentDocumentMapping {
    intent: QueryIntent;
    primary: string[];
    secondary: string[];
    implications: string[];
    triggers: string[];
}
/**
 * KB v6.0 Index structure parsed from KB_INDEX_v6_0.txt
 */
export interface KBIndexV6 {
    documents: KBDocumentMetadata[];
    intentMappings: IntentDocumentMapping[];
    workflowStepMappings: Map<number, string[]>;
    dataverseTables: string[];
    totalDocuments: number;
}
/**
 * Load and parse all KB v6.0 documents from a directory
 */
export declare function loadKBV6Documents(kbDir: string): KBDocumentMetadata[];
/**
 * Parse KB_INDEX_v6_0.txt to extract intent-to-document mappings
 */
export declare function parseKBIndex(indexContent: string): IntentDocumentMapping[];
/**
 * Parse workflow step mappings from KB_INDEX_v6_0.txt
 */
export declare function parseWorkflowStepMappings(indexContent: string): Map<number, string[]>;
/**
 * Load complete KB v6.0 index including documents and mappings
 */
export declare function loadKBV6Index(kbDir: string): KBIndexV6;
/**
 * Get documents relevant to a specific intent from KB v6.0 index
 */
export declare function getDocumentsForIntentV6(index: KBIndexV6, intent: QueryIntent): {
    primary: KBDocumentMetadata[];
    secondary: KBDocumentMetadata[];
};
/**
 * Get documents relevant to a workflow step from KB v6.0 index
 */
export declare function getDocumentsForStepV6(index: KBIndexV6, step: number): KBDocumentMetadata[];
/**
 * Check if a query should trigger web search based on KB document metadata
 */
export declare function shouldTriggerWebSearch(documents: KBDocumentMetadata[], query: string): boolean;
export default KBMetadataParser;
//# sourceMappingURL=kb-metadata-parser.d.ts.map