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
export {
  // Interfaces and types
  type LLMProvider,
  type StorageProvider,
  type EmbeddingProvider,
  type LLMMessage,
  type LLMResponse,
  type LLMToolDefinition,
  type LLMContentBlock,
  type LLMOptions,
  type EnvironmentConfig,
  type EmbeddingConfig,
  type LLMProviderType,
  type StorageProviderType,
  type EmbeddingProviderType,
  ProviderNotImplementedError,
  ProviderConfigurationError,
  ProviderInitializationError,
  DEFAULT_EMBEDDING_CONFIG,
  // Environment detection
  detectEnvironment,
  describeEnvironment,
  validateEnvironment,
  // Provider factory
  ProviderFactory,
  type FactoryOptions,
  // Personal environment providers
  ClaudeLLMProvider,
  LocalFSStorageProvider,
  TFIDFEmbeddingProvider,
  // Corporate environment providers
  AzureOpenAILLMProvider,
  CopilotStudioLLMProvider,
  DataverseStorageProvider,
  AzureAISearchEmbeddingProvider,
  // Multi-environment abstractions
  ToolShim,
  type ToolUseRequest,
  type ToolResult,
  UnifiedDocumentStore,
  createDocumentStore,
  DEFAULT_PATH_MAPPINGS,
  type DocumentStore,
  type DocumentStoreConfig,
  type EntityMapping,
  TokenManager,
  TokenAcquisitionError,
  createDataverseTokenManager,
  createAzureOpenAITokenManager,
  type TokenResponse,
  type TokenManagerConfig,
} from './providers/index.js';

// =============================================================================
// RAG System - Retrieval Augmented Generation
// =============================================================================
export {
  // Types
  type DocumentChunk,
  type SearchResult,
  type ChunkMetadata,
  type DocumentPurpose,
  type StoredChunk,
  type MetadataFilter,
  type SearchOptions,
  type RetrievalResult,
  type BenchmarkResult,
  type AudienceSizingResult,
  type ToolDefinition,
  type ToolUseBlock,
  type RAGToolResult,
  type ToolUsageStats,
  // Configuration
  type AgentRAGConfig,
  type RAGSystemConfig,
  DEFAULT_RAG_CONFIG,
  DOCUMENT_PURPOSE_BOOSTS,
  EMPTY_AGENT_CONFIG,
  // Core components
  EmbeddingService,
  VectorStore,
  DocumentProcessor,
  RetrievalEngine,
  type RetrievalEngineOptions,
} from './rag/index.js';

// =============================================================================
// Learning System - Self-improvement infrastructure
// =============================================================================
export {
  // Types
  type ResponseCritique,
  type CritiqueIssue,
  type CritiqueDimension,
  type CritiqueMetadata,
  type SuccessPattern,
  type PatternType,
  type ResponseElement,
  type PatternExample,
  type KBEnhancement,
  type EnhancementType,
  type EnhancementStatus,
  type EnhancementEvidence,
  type ImpactAssessment,
  type UserFeedback,
  type LearningSessionSummary,
  type LearningConfig,
  DEFAULT_LEARNING_CONFIG,
  // Components
  SelfCritique,
  type CritiqueCriteria,
  DEFAULT_CRITIQUE_CRITERIA,
  SuccessPatterns,
  type PatternStorageConfig,
  KBEnhancementSystem,
  type KBEnhancementConfig,
} from './learning/index.js';

// =============================================================================
// Evaluation Framework - Multi-turn conversation testing
// =============================================================================
export {
  // Types
  type ConversationTurn,
  type ConversationTranscript,
  type TestScenario,
  type StepDefinition,
  type StepProgress,
  type ScorerResult,
  type EvaluationResult,
  type BaselineComparison,
  // Scorers
  BaseScorer,
  FunctionalScorer,
  createScorer,
  type ScorerConfig,
  LLMJudgeScorer,
  createLLMJudge,
  type LLMJudgeConfig,
  type LLMJudgeCriteria,
  // Step tracking
  StepTracker,
  type StepTrackerConfig,
  type StepDetection,
  // Baseline tracking
  BaselineTracker,
  type BaselineTrackerConfig,
} from './evaluation/index.js';
