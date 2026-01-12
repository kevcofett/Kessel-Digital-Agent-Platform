/**
 * RAG System Type Definitions
 *
 * Generic types for the RAG system that can be used by any agent.
 * Agent-specific configurations (synonyms, keywords, topics) are
 * provided via AgentRAGConfig at initialization.
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
    documentType: string;
    topics: string[];
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
    documentTypes?: string[];
    topics?: string[];
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
export interface RAGToolResult {
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
//# sourceMappingURL=types.d.ts.map