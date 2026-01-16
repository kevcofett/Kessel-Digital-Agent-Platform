/**
 * CA RAG Module
 *
 * Re-exports agent-core RAG components with CA-specific configuration.
 */
// Re-export from agent-core
export { RetrievalEngine, DocumentProcessor, EmbeddingService, VectorStore, TFIDFEmbeddingProvider, } from '@kessel-digital/agent-core';
// CA-specific exports
export { CA_AGENT_CONFIG, detectCATopic, expandCAQuery } from '../ca-agent-config.js';
// ============================================================================
// CA RETRIEVAL ENGINE FACTORY
// ============================================================================
import { RetrievalEngine, TFIDFEmbeddingProvider, DEFAULT_EMBEDDING_CONFIG } from '@kessel-digital/agent-core';
import { CA_AGENT_CONFIG } from '../ca-agent-config.js';
let caRetrievalEngine = null;
/**
 * Get or create the CA RetrievalEngine singleton
 */
export async function getCARetrievalEngine() {
    if (!caRetrievalEngine) {
        caRetrievalEngine = await createCARetrievalEngine();
    }
    return caRetrievalEngine;
}
/**
 * Create a new CA RetrievalEngine instance
 */
export async function createCARetrievalEngine() {
    // Create the embedding provider (using TF-IDF for personal environment)
    // Note: The embedding provider will be initialized by the RetrievalEngine
    // during its initialize() call, which provides the documents
    const embeddingProvider = new TFIDFEmbeddingProvider(DEFAULT_EMBEDDING_CONFIG);
    const engine = new RetrievalEngine({
        agentConfig: CA_AGENT_CONFIG,
        embeddingProvider,
    });
    await engine.initialize();
    return engine;
}
/**
 * Reset the CA RetrievalEngine (for testing)
 */
export function resetCARetrievalEngine() {
    caRetrievalEngine = null;
}
//# sourceMappingURL=index.js.map