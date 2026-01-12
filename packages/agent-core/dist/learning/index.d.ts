/**
 * Self-Learning System Exports
 *
 * Continuous learning system for agent improvement through
 * self-critique, success patterns, and KB enhancement.
 */
export * from './types.js';
export { SelfCritique, type CritiqueCriteria, DEFAULT_CRITIQUE_CRITERIA, } from './self-critique.js';
export { SuccessPatterns, type PatternStorageConfig, } from './success-patterns.js';
export { KBEnhancementSystem, type KBEnhancementConfig, } from './kb-enhancement.js';
export { type KBUsageRecord, type KBDocumentImpact, type KBDocumentAction, type KBChunkImpact, type KBUpdateProposal, type KBUpdateType, type KBUpdateStatus, type KBProposedChange, type KBImpactTrackerConfig, type KBImpactStorage, type KBUsageFilter, type KBProposalFilter, DEFAULT_KB_IMPACT_CONFIG, } from './kb-impact-types.js';
export { BaseKBImpactTracker, } from './base-kb-impact-tracker.js';
export { LocalKBImpactStorage, createLocalKBImpactStorage, } from './local-kb-impact-storage.js';
export { KBUpdatePipeline, createKBUpdatePipeline, type KBUpdatePipelineConfig, DEFAULT_UPDATE_PIPELINE_CONFIG, } from './kb-update-pipeline.js';
export { DataverseKBImpactStorage, createDataverseKBImpactStorage, type DataverseKBImpactStorageConfig, } from './dataverse-kb-impact-storage.js';
//# sourceMappingURL=index.d.ts.map