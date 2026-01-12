/**
 * RAG Configuration Types
 *
 * Defines the configuration interfaces for agents to customize
 * RAG behavior. Each agent provides their own configuration
 * tailored to their domain.
 */
import { DocumentPurpose } from './types.js';
/**
 * Configuration provided by each agent for RAG customization
 */
export interface AgentRAGConfig {
    /**
     * Path to the knowledge base directory (relative or absolute)
     */
    kbPath: string;
    /**
     * Files to completely exclude from RAG indexing
     */
    excludedFiles: string[];
    /**
     * Files to include but deprioritize (lower ranking)
     */
    deprioritizedFiles: string[];
    /**
     * Synonym mappings for query expansion
     * Maps canonical terms to their variations
     */
    synonymMappings: Record<string, string[]>;
    /**
     * Document type detection patterns
     * Maps document types to regex patterns for filename matching
     */
    documentTypePatterns: Record<string, RegExp[]>;
    /**
     * Document purpose patterns for retrieval boosting
     * Maps purposes to regex patterns for filename matching
     */
    documentPurposePatterns: Record<DocumentPurpose, RegExp[]>;
    /**
     * Topic keywords for content classification
     */
    topicKeywords: Record<string, string[]>;
    /**
     * Step-specific keywords for step detection
     */
    stepKeywords: Record<number, string[]>;
    /**
     * Vertical/industry patterns for detection
     */
    verticalPatterns: string[];
    /**
     * Metric patterns for detection
     */
    metricPatterns: string[];
}
/**
 * Core RAG system configuration (typically not agent-specific)
 */
export interface RAGSystemConfig {
    chunking: {
        targetChunkSize: number;
        maxChunkSize: number;
        minChunkSize: number;
        overlapTokens: number;
    };
    embedding: {
        maxFeatures: number;
        minDocFreq: number;
        maxDocFreqRatio: number;
    };
    retrieval: {
        defaultTopK: number;
        minScore: number;
        semanticWeight: number;
        keywordWeight: number;
        benchmarkBoost: number;
        exactMatchBoost: number;
    };
    paths: {
        chunksCache: string;
        indexCache: string;
    };
    cache: {
        queryEmbeddingCacheSize: number;
    };
}
/**
 * Default RAG system configuration
 */
export declare const DEFAULT_RAG_CONFIG: RAGSystemConfig;
/**
 * Boost multipliers for different document purposes
 */
export declare const DOCUMENT_PURPOSE_BOOSTS: Record<DocumentPurpose, number>;
/**
 * Minimal agent config for testing or basic usage
 */
export declare const EMPTY_AGENT_CONFIG: AgentRAGConfig;
//# sourceMappingURL=config.d.ts.map