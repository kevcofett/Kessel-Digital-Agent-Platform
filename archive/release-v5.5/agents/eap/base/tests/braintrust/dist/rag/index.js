/**
 * EAP RAG Module
 *
 * Re-exports agent-core RAG components with EAP-specific configuration.
 */
export { RetrievalEngine, DocumentProcessor, EmbeddingService, VectorStore, TFIDFEmbeddingProvider, } from '@kessel-digital/agent-core';
export { EAP_AGENT_CONFIG, detectEAPTopic, expandEAPQuery } from '../eap-agent-config.js';
import { RetrievalEngine, TFIDFEmbeddingProvider, DEFAULT_EMBEDDING_CONFIG } from '@kessel-digital/agent-core';
import { EAP_AGENT_CONFIG } from '../eap-agent-config.js';
let eapRetrievalEngine = null;
export async function getEAPRetrievalEngine() {
    if (!eapRetrievalEngine) {
        eapRetrievalEngine = await createEAPRetrievalEngine();
    }
    return eapRetrievalEngine;
}
export async function createEAPRetrievalEngine() {
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
export function resetEAPRetrievalEngine() {
    eapRetrievalEngine = null;
}
//# sourceMappingURL=index.js.map