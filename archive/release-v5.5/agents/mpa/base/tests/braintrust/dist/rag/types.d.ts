/**
 * RAG System Type Definitions
 */
export interface DocumentChunk {
    id: string;
    content: string;
    filename: string;
    sectionTitle: string;
    chunkIndex: number;
    startChar: number;
    endChar: number;
    metadata: ChunkMetadata;
}
export type DocumentPurpose = 'definitive' | 'guidance' | 'reference' | 'procedural' | 'template' | 'example';
export interface ChunkMetadata {
    documentType: DocumentType;
    topics: Topic[];
    steps: number[];
    hasNumbers: boolean;
    hasBenchmarks: boolean;
    verticals: string[];
    metrics: string[];
    documentPurpose?: DocumentPurpose;
    normalizedTerms?: string[];
    benchmarkRanges?: string[];
    confidenceQualifiers?: string[];
    isDeprioritized?: boolean;
}
export type DocumentType = 'benchmark' | 'framework' | 'playbook' | 'examples' | 'implications' | 'operating-standards';
export type Topic = 'audience' | 'budget' | 'channel' | 'measurement' | 'benchmark' | 'efficiency' | 'general';
export interface StoredChunk extends DocumentChunk {
    embedding: number[];
}
export interface SearchResult {
    chunk: DocumentChunk;
    score: number;
    scoreBreakdown: {
        semantic: number;
        keyword: number;
        metadataBoost: number;
    };
}
export interface MetadataFilter {
    documentTypes?: DocumentType[];
    topics?: Topic[];
    steps?: number[];
    mustHaveBenchmarks?: boolean;
    verticals?: string[];
}
export interface SearchOptions {
    topK?: number;
    minScore?: number;
    filters?: MetadataFilter;
    includeContext?: boolean;
}
export interface RetrievalResult {
    content: string;
    source: string;
    section: string;
    relevanceScore: number;
    citationText: string;
}
export interface BenchmarkResult {
    metric: string;
    vertical: string;
    value: string;
    qualifier: 'conservative' | 'typical' | 'ambitious' | 'aggressive';
    source: string;
    citationText: string;
}
export interface AudienceSizingResult {
    audienceType: string;
    totalSize: string;
    methodology: string;
    source: string;
    citationText: string;
}
export interface ToolDefinition {
    name: string;
    description: string;
    input_schema: {
        type: 'object';
        properties: Record<string, unknown>;
        required: string[];
    };
}
export interface ToolUseBlock {
    type: 'tool_use';
    id: string;
    name: string;
    input: Record<string, unknown>;
}
export interface ToolResult {
    content: string;
    citations: string[];
    success: boolean;
}
export interface ToolUsageStats {
    totalCalls: number;
    callsByTool: Record<string, number>;
    averageResultsPerCall: number;
    citationsGenerated: number;
}
export declare const RAG_CONFIG: {
    readonly chunking: {
        readonly targetChunkSize: 400;
        readonly maxChunkSize: 600;
        readonly minChunkSize: 100;
        readonly overlapTokens: 50;
    };
    readonly embedding: {
        readonly maxFeatures: 1500;
        readonly minDocFreq: 2;
        readonly maxDocFreqRatio: 0.95;
    };
    readonly retrieval: {
        readonly defaultTopK: 5;
        readonly minScore: 0.25;
        readonly semanticWeight: 0.6;
        readonly keywordWeight: 0.4;
        readonly benchmarkBoost: 2;
        readonly exactMatchBoost: 1.5;
    };
    readonly paths: {
        readonly kbDirectory: "../../kb-v6";
        readonly chunksCache: "./rag-cache/kb-chunks.json";
        readonly indexCache: "./rag-cache/kb-index.json";
    };
    readonly cache: {
        readonly queryEmbeddingCacheSize: 100;
    };
};
/**
 * Synonym mappings for key MPA terms.
 * Maps canonical terms to their variations for improved search matching.
 * Used by both document processor (for indexing) and retrieval engine (for query expansion).
 */
export declare const SYNONYM_MAPPINGS: Record<string, string[]>;
export declare const TOPIC_KEYWORDS: Record<Topic, string[]>;
export declare const STEP_KEYWORDS: Record<number, string[]>;
export declare const DOCUMENT_TYPE_PATTERNS: Record<DocumentType, RegExp[]>;
//# sourceMappingURL=types.d.ts.map