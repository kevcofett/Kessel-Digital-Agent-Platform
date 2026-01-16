/**
 * RAG System Type Definitions
 *
 * Generic types for the RAG system that can be used by any agent.
 * Agent-specific configurations (synonyms, keywords, topics) are
 * provided via AgentRAGConfig at initialization.
 */

// ============================================================================
// DOCUMENT PROCESSING TYPES
// ============================================================================

export interface DocumentChunk {
  id: string;                    // Unique: {filename}_{chunk_index}
  content: string;               // Chunk text
  filename: string;              // Source KB filename
  sectionTitle: string;          // Extracted section header
  chunkIndex: number;            // Position in document
  startChar: number;             // Character offset in original
  endChar: number;
  metadata: ChunkMetadata;
}

export type DocumentPurpose = 'definitive' | 'guidance' | 'reference' | 'procedural' | 'template' | 'example';

export interface ChunkMetadata {
  documentType: string;
  topics: string[];
  steps: number[];               // Relevant step numbers
  hasNumbers: boolean;
  hasBenchmarks: boolean;
  verticals: string[];
  metrics: string[];
  // Extended metadata fields
  documentPurpose?: DocumentPurpose;
  normalizedTerms?: string[];    // Canonical forms of detected synonyms
  benchmarkRanges?: string[];    // Extracted numeric benchmark ranges
  confidenceQualifiers?: string[]; // e.g., "conservative 20-25%"
  isDeprioritized?: boolean;     // For low-value files like conversation examples
}

// ============================================================================
// VECTOR STORE TYPES
// ============================================================================

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

// ============================================================================
// RETRIEVAL TYPES
// ============================================================================

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

// ============================================================================
// TOOL TYPES
// ============================================================================

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
