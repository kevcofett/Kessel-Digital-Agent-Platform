/**
 * Query Understanding Module
 *
 * Implements the Query Understanding Layer from MPA v6.0 Improvement Plan:
 * - Intent Classification: Map queries to media planning workflow steps
 * - Entity Extraction: Extract domain entities for precise retrieval
 * - Query Expansion: Expand queries with domain synonyms
 *
 * @module query-understanding
 * @version 6.0
 */
import { QueryIntent, KBIndexV6, IntentDocumentMapping, KBDocumentMetadata } from './kb-metadata-parser.js';
import { DocumentType, Topic } from './types.js';
/**
 * Extracted entities from a user query
 */
export interface ExtractedEntities {
    verticals: string[];
    channels: string[];
    kpis: string[];
    budgetRange: {
        min: number;
        max: number;
    } | null;
    objectives: string[];
    timeframe: string | null;
    regions: string[];
    dmas: string[];
}
/**
 * Fully analyzed query with intent, entities, and expanded terms
 */
export interface AnalyzedQuery {
    originalQuery: string;
    normalizedQuery: string;
    primaryIntent: QueryIntent;
    secondaryIntents: QueryIntent[];
    confidence: number;
    entities: ExtractedEntities;
    expandedTerms: string[];
    relevantSteps: number[];
    relevantDocumentTypes: DocumentType[];
    relevantTopics: Topic[];
    triggerKeywords: string[];
    shouldUseWebSearch: boolean;
    suggestedDataverseTables: string[];
}
/**
 * KB v6.0 enhanced query analysis with document routing
 */
export interface EnhancedAnalyzedQuery extends AnalyzedQuery {
    primaryDocuments: KBDocumentMetadata[];
    secondaryDocuments: KBDocumentMetadata[];
    intentMapping: IntentDocumentMapping | null;
}
/**
 * Query expansion result
 */
export interface ExpandedQuery {
    original: string;
    expanded: string[];
    synonymsUsed: Record<string, string[]>;
}
/**
 * Media planning domain synonyms for query expansion
 * Extended from types.ts SYNONYM_MAPPINGS
 */
export declare const MEDIA_PLANNING_SYNONYMS: Record<string, string[]>;
export declare class QueryUnderstanding {
    /**
     * Fully analyze a user query
     */
    analyzeQuery(query: string): AnalyzedQuery;
    /**
     * Analyze query with KB v6.0 index for document routing
     */
    analyzeQueryWithIndex(query: string, kbIndex: KBIndexV6): EnhancedAnalyzedQuery;
    /**
     * Classify query intent
     */
    classifyIntent(query: string, entities?: ExtractedEntities): {
        primaryIntent: QueryIntent;
        secondaryIntents: QueryIntent[];
        confidence: number;
        triggerKeywords: string[];
    };
    /**
     * Extract domain entities from query
     */
    extractEntities(query: string): ExtractedEntities;
    /**
     * Expand query with synonyms
     */
    expandQuery(query: string): ExpandedQuery;
    /**
     * Normalize query for consistent processing
     */
    normalizeQuery(query: string): string;
    /**
     * Extract all matches from patterns
     */
    private extractMatches;
    /**
     * Extract budget range from query
     */
    private extractBudgetRange;
    /**
     * Parse budget value with multiplier
     */
    private parseBudgetValue;
    /**
     * Get relevant workflow steps based on intent and entities
     */
    private getRelevantSteps;
    /**
     * Get relevant document types based on intents
     */
    private getRelevantDocumentTypes;
    /**
     * Get relevant topics based on intent and entities
     */
    private getRelevantTopics;
    /**
     * Determine if web search should be used for this query
     */
    private shouldUseWebSearch;
    /**
     * Get suggested Dataverse tables based on intent and entities
     */
    private getSuggestedDataverseTables;
    /**
     * Escape special regex characters
     */
    private escapeRegex;
}
/**
 * Quick intent classification without full analysis
 */
export declare function quickClassifyIntent(query: string): QueryIntent;
/**
 * Quick entity extraction
 */
export declare function quickExtractEntities(query: string): ExtractedEntities;
/**
 * Quick query expansion
 */
export declare function quickExpandQuery(query: string): string[];
export default QueryUnderstanding;
//# sourceMappingURL=query-understanding.d.ts.map