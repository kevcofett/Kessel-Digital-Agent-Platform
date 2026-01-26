/**
 * EAP RAG Module
 *
 * Re-exports agent-core RAG components with EAP-specific configuration.
 */
export { RetrievalEngine, DocumentProcessor, EmbeddingService, VectorStore, TFIDFEmbeddingProvider, type AgentRAGConfig, type SearchResult, type DocumentChunk, type StoredChunk, type RetrievalEngineOptions, } from '@kessel-digital/agent-core';
export { EAP_AGENT_CONFIG, detectEAPTopic, expandEAPQuery } from '../eap-agent-config.js';
import { RetrievalEngine } from '@kessel-digital/agent-core';
export declare function getEAPRetrievalEngine(): Promise<RetrievalEngine>;
export declare function createEAPRetrievalEngine(): Promise<RetrievalEngine>;
export declare function resetEAPRetrievalEngine(): void;
//# sourceMappingURL=index.d.ts.map