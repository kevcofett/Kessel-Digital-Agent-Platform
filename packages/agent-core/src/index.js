/**
 * Agent Core Package
 *
 * Shared infrastructure for multi-environment agent systems.
 * Supports both personal (Claude/Node.js) and corporate (Microsoft/Azure) environments.
 *
 * @packageDocumentation
 */
// =============================================================================
// Providers - Multi-environment abstraction layer
// =============================================================================
export { ProviderNotImplementedError, ProviderConfigurationError, ProviderInitializationError, DEFAULT_EMBEDDING_CONFIG, 
// Environment detection
detectEnvironment, describeEnvironment, validateEnvironment, 
// Provider factory
ProviderFactory, 
// Personal environment providers
ClaudeLLMProvider, LocalFSStorageProvider, TFIDFEmbeddingProvider, 
// Corporate environment providers
AzureOpenAILLMProvider, CopilotStudioLLMProvider, DataverseStorageProvider, AzureAISearchEmbeddingProvider, 
// Multi-environment abstractions
ToolShim, UnifiedDocumentStore, createDocumentStore, DEFAULT_PATH_MAPPINGS, TokenManager, TokenAcquisitionError, createDataverseTokenManager, createAzureOpenAITokenManager, } from './providers/index.js';
// =============================================================================
// RAG System - Retrieval Augmented Generation
// =============================================================================
export { DEFAULT_RAG_CONFIG, DOCUMENT_PURPOSE_BOOSTS, EMPTY_AGENT_CONFIG, 
// Core components
EmbeddingService, VectorStore, DocumentProcessor, RetrievalEngine, } from './rag/index.js';
// =============================================================================
// Learning System - Self-improvement infrastructure
// =============================================================================
export { DEFAULT_LEARNING_CONFIG, 
// Components
SelfCritique, DEFAULT_CRITIQUE_CRITERIA, SuccessPatterns, KBEnhancementSystem, } from './learning/index.js';
// =============================================================================
// Evaluation Framework - Multi-turn conversation testing
// =============================================================================
export { 
// Scorers
BaseScorer, FunctionalScorer, createScorer, LLMJudgeScorer, createLLMJudge, 
// Step tracking
StepTracker, 
// Baseline tracking
BaselineTracker, } from './evaluation/index.js';
//# sourceMappingURL=index.js.map