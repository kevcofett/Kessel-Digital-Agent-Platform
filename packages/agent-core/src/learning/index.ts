/**
 * Self-Learning System Exports
 *
 * Continuous learning system for agent improvement through
 * self-critique, success patterns, and KB enhancement.
 */

// Types
export * from './types.js';

// Self-critique
export {
  SelfCritique,
  type CritiqueCriteria,
  DEFAULT_CRITIQUE_CRITERIA,
} from './self-critique.js';

// Success patterns
export {
  SuccessPatterns,
  type PatternStorageConfig,
} from './success-patterns.js';

// KB enhancement
export {
  KBEnhancementSystem,
  type KBEnhancementConfig,
} from './kb-enhancement.js';

// ============================================================================
// KB IMPACT TRACKING
// ============================================================================

// Types
export {
  type KBUsageRecord,
  type KBDocumentImpact,
  type KBDocumentAction,
  type KBChunkImpact,
  type KBUpdateProposal,
  type KBUpdateType,
  type KBUpdateStatus,
  type KBProposedChange,
  type KBImpactTrackerConfig,
  type KBImpactStorage,
  type KBUsageFilter,
  type KBProposalFilter,
  DEFAULT_KB_IMPACT_CONFIG,
} from './kb-impact-types.js';

// Base Tracker
export {
  BaseKBImpactTracker,
} from './base-kb-impact-tracker.js';

// Local Storage
export {
  LocalKBImpactStorage,
  createLocalKBImpactStorage,
} from './local-kb-impact-storage.js';

// Update Pipeline
export {
  KBUpdatePipeline,
  createKBUpdatePipeline,
  type KBUpdatePipelineConfig,
  DEFAULT_UPDATE_PIPELINE_CONFIG,
} from './kb-update-pipeline.js';

// ============================================================================
// DATAVERSE KB IMPACT STORAGE
// ============================================================================

export {
  DataverseKBImpactStorage,
  createDataverseKBImpactStorage,
  type DataverseKBImpactStorageConfig,
} from './dataverse-kb-impact-storage.js';
