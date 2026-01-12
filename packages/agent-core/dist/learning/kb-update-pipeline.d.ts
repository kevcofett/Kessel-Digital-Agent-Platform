/**
 * KB Update Pipeline
 *
 * Automates the process of generating KB improvement proposals
 * based on impact tracking data.
 */
import type { KBUpdateProposal, KBImpactStorage } from './kb-impact-types.js';
import type { BaseKBImpactTracker } from './base-kb-impact-tracker.js';
export interface KBUpdatePipelineConfig {
    agentId: string;
    autoDeprecationThreshold: number;
    autoEnhancementThreshold: number;
    autoSplitThreshold: number;
    maxProposalsPerRun: number;
    proposalCooldownDays: number;
    enableDeprecationProposals: boolean;
    enableEnhancementProposals: boolean;
    enableSplitProposals: boolean;
    enableMergeProposals: boolean;
}
export declare const DEFAULT_UPDATE_PIPELINE_CONFIG: KBUpdatePipelineConfig;
export declare class KBUpdatePipeline {
    private config;
    private storage;
    private tracker;
    constructor(config: Partial<KBUpdatePipelineConfig>, storage: KBImpactStorage, tracker: BaseKBImpactTracker);
    /**
     * Run the pipeline to generate new proposals
     */
    generateProposals(): Promise<KBUpdateProposal[]>;
    /**
     * Generate a proposal for a specific document based on its impact
     */
    private generateProposalForDocument;
    private createDeprecationProposal;
    private createEnhancementProposal;
    private createSplitProposal;
    private generateDeprecationRationale;
    private generateEnhancementRationale;
    private generateSplitRationale;
    private isInCooldown;
    /**
     * Approve a proposal
     */
    approveProposal(proposalId: string): Promise<void>;
    /**
     * Reject a proposal
     */
    rejectProposal(proposalId: string): Promise<void>;
    /**
     * Mark a proposal as applied
     */
    markProposalApplied(proposalId: string): Promise<void>;
    /**
     * Get all pending proposals
     */
    getPendingProposals(): Promise<KBUpdateProposal[]>;
}
export declare function createKBUpdatePipeline(config: Partial<KBUpdatePipelineConfig>, storage: KBImpactStorage, tracker: BaseKBImpactTracker): KBUpdatePipeline;
export default KBUpdatePipeline;
//# sourceMappingURL=kb-update-pipeline.d.ts.map