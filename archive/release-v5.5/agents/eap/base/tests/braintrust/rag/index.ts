/**
 * EAP RAG Module
 *
 * Re-exports agent-core RAG components with EAP-specific configuration.
 */

export {
  RetrievalEngine,
  DocumentProcessor,
  EmbeddingService,
  VectorStore,
  TFIDFEmbeddingProvider,
  type AgentRAGConfig,
  type SearchResult,
  type DocumentChunk,
  type StoredChunk,
  type RetrievalEngineOptions,
} from '@kessel-digital/agent-core';

export { EAP_AGENT_CONFIG, detectEAPTopic, expandEAPQuery } from '../eap-agent-config.js';

import { RetrievalEngine, TFIDFEmbeddingProvider, DEFAULT_EMBEDDING_CONFIG } from '@kessel-digital/agent-core';
import { EAP_AGENT_CONFIG } from '../eap-agent-config.js';

let eapRetrievalEngine: RetrievalEngine | null = null;

export async function getEAPRetrievalEngine(): Promise<RetrievalEngine> {
  if (!eapRetrievalEngine) {
    eapRetrievalEngine = await createEAPRetrievalEngine();
  }
  return eapRetrievalEngine;
}

export async function createEAPRetrievalEngine(): Promise<RetrievalEngine> {
  // Create the embedding provider (using TF-IDF for personal environment)
  // Note: The embedding provider will be initialized by the RetrievalEngine
  // during its initialize() call, which provides the documents
  const embeddingProvider = new TFIDFEmbeddingProvider(DEFAULT_EMBEDDING_CONFIG);

  const engine = new RetrievalEngine({
    agentConfig: EAP_AGENT_CONFIG,
    embeddingProvider,
  });

  await engine.initialize();
  return engine;
}

export function resetEAPRetrievalEngine(): void {
  eapRetrievalEngine = null;
}
