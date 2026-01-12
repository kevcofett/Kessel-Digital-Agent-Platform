/**
 * RAG System Exports
 *
 * Generic RAG system that can be configured for any agent.
 * Agents provide AgentRAGConfig to customize behavior.
 */

// Types
export * from './types.js';

// Configuration
export {
  type AgentRAGConfig,
  type RAGSystemConfig,
  DEFAULT_RAG_CONFIG,
  DOCUMENT_PURPOSE_BOOSTS,
  EMPTY_AGENT_CONFIG,
} from './config.js';

// Core components
export { EmbeddingService } from './embedding-service.js';
export { VectorStore } from './vector-store.js';
export { DocumentProcessor } from './document-processor.js';
export { RetrievalEngine, type RetrievalEngineOptions } from './retrieval-engine.js';

// ============================================================================
// HYBRID RETRIEVAL
// ============================================================================

export {
  HybridRetrievalEngine,
  createHybridRetrievalEngine,
  type HybridRetrievalConfig,
  type HybridSearchResult,
  type ChunkWithEmbedding,
  DEFAULT_HYBRID_CONFIG,
} from './hybrid-retrieval.js';
