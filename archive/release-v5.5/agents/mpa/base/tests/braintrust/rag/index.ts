/**
 * RAG System Exports
 *
 * Multi-environment RAG system supporting both personal (Claude/Node.js)
 * and corporate (Microsoft/Azure) environments.
 *
 * v6.0 Enhancements:
 * - KB Metadata Parser for structured document headers
 * - Query Understanding for intent classification
 * - Hybrid retrieval with result fusion
 */

// Core types and configuration
export * from './types.js';

// Core RAG components
export { DocumentProcessor, type EnhancedDocumentChunk } from './document-processor.js';
export { EmbeddingService } from './embedding-service.js';
export { VectorStore } from './vector-store.js';
export { RetrievalEngine } from './retrieval-engine.js';
export { ToolExecutor, RAG_TOOLS } from './tool-executor.js';

// v6.0 Enhanced components
export {
  KBMetadataParser,
  type KBSectionMetadata,
  type KBDocumentMetadata,
  type QueryIntent,
  type ConfidenceLevel,
  getDocumentTypesForIntent,
  getStepsForIntent,
  scoreMetadataMatch,
} from './kb-metadata-parser.js';

export {
  QueryUnderstanding,
  type AnalyzedQuery,
  type ExtractedEntities,
  type ExpandedQuery,
  MEDIA_PLANNING_SYNONYMS,
  quickClassifyIntent,
  quickExtractEntities,
  quickExpandQuery,
} from './query-understanding.js';

export {
  ResultFusion,
  type FusedResult,
  type MethodResult,
  type ResultAttribution,
  type FusionConfig,
  type DomainRerankFactors,
  quickRRFFusion,
  toMethodResults,
} from './result-fusion.js';

export {
  BENCHMARK_V6_SCHEMA,
  migrateBenchmarkToV6,
  calculateFreshnessScore,
  buildBenchmarkFilter,
  buildBenchmarkSelect,
  formatBenchmarkResponse,
  type EnhancedBenchmark,
  type BenchmarkV55,
  type SeasonalityFactor,
  type MarketConditions,
  type TrendDirection,
} from './dataverse-schema.js';

export {
  FreshnessService,
  KPI_VOLATILITY_CONFIGS,
  quickFreshnessCheck,
  findStaleBenchmarks,
  calculateWeightedFreshness,
  type FreshnessAssessment,
  type FreshnessStatus,
  type KPIVolatilityConfig,
  type BatchFreshnessResult,
} from './freshness-service.js';

// Multi-environment provider system
export * from './providers/index.js';
