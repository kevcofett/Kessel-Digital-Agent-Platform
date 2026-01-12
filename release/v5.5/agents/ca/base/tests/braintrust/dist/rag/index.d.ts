/**
 * CA RAG Module
 *
 * Re-exports agent-core RAG components with CA-specific configuration.
 */
export { RetrievalEngine, DocumentProcessor, EmbeddingService, VectorStore, TFIDFEmbeddingProvider, type AgentRAGConfig, type SearchResult, type DocumentChunk, type StoredChunk, type RetrievalEngineOptions, } from '@kessel-digital/agent-core';
export { CA_AGENT_CONFIG, detectCATopic, expandCAQuery } from '../ca-agent-config.js';
import { RetrievalEngine } from '@kessel-digital/agent-core';
/**
 * Get or create the CA RetrievalEngine singleton
 */
export declare function getCARetrievalEngine(): Promise<RetrievalEngine>;
/**
 * Create a new CA RetrievalEngine instance
 */
export declare function createCARetrievalEngine(): Promise<RetrievalEngine>;
/**
 * Reset the CA RetrievalEngine (for testing)
 */
export declare function resetCARetrievalEngine(): void;
//# sourceMappingURL=index.d.ts.map