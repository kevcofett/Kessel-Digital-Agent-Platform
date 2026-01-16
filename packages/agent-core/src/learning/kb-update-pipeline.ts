/**
 * KB Update Pipeline
 *
 * Automates the process of generating KB improvement proposals
 * based on impact tracking data.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  KBDocumentImpact,
  KBUpdateProposal,
  KBImpactStorage,
} from './kb-impact-types.js';
import type { BaseKBImpactTracker } from './base-kb-impact-tracker.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface KBUpdatePipelineConfig {
  agentId: string;

  // Thresholds for automatic proposal generation
  autoDeprecationThreshold: number;
  autoEnhancementThreshold: number;
  autoSplitThreshold: number;  // Document size/chunk count threshold

  // Proposal limits
  maxProposalsPerRun: number;
  proposalCooldownDays: number;  // Don't re-propose for same doc within this period

  // Enable/disable automatic proposal types
  enableDeprecationProposals: boolean;
  enableEnhancementProposals: boolean;
  enableSplitProposals: boolean;
  enableMergeProposals: boolean;
}

export const DEFAULT_UPDATE_PIPELINE_CONFIG: KBUpdatePipelineConfig = {
  agentId: 'unknown',
  autoDeprecationThreshold: -0.2,
  autoEnhancementThreshold: 0.1,
  autoSplitThreshold: 10,  // More than 10 chunks suggests split
  maxProposalsPerRun: 10,
  proposalCooldownDays: 7,
  enableDeprecationProposals: true,
  enableEnhancementProposals: true,
  enableSplitProposals: true,
  enableMergeProposals: false,  // Requires more sophisticated analysis
};

// ============================================================================
// KB UPDATE PIPELINE
// ============================================================================

export class KBUpdatePipeline {
  private config: KBUpdatePipelineConfig;
  private storage: KBImpactStorage;
  private tracker: BaseKBImpactTracker;

  constructor(
    config: Partial<KBUpdatePipelineConfig>,
    storage: KBImpactStorage,
    tracker: BaseKBImpactTracker
  ) {
    this.config = { ...DEFAULT_UPDATE_PIPELINE_CONFIG, ...config };
    this.storage = storage;
    this.tracker = tracker;
  }

  // ==========================================================================
  // PROPOSAL GENERATION
  // ==========================================================================

  /**
   * Run the pipeline to generate new proposals
   */
  async generateProposals(): Promise<KBUpdateProposal[]> {
    const impacts = await this.tracker.getAllDocumentImpacts();
    const existingProposals = await this.storage.getProposals({
      agentId: this.config.agentId,
      status: 'proposed',
    });

    // Get documents that already have pending proposals
    const documentsWithProposals = new Set(
      existingProposals.flatMap(p => p.targetDocumentIds)
    );

    const newProposals: KBUpdateProposal[] = [];

    for (const impact of impacts) {
      // Skip if already has pending proposal
      if (documentsWithProposals.has(impact.documentId)) {
        continue;
      }

      // Skip if in cooldown period
      if (await this.isInCooldown(impact.documentId)) {
        continue;
      }

      // Generate appropriate proposal
      const proposal = this.generateProposalForDocument(impact);
      if (proposal) {
        newProposals.push(proposal);
        await this.storage.saveProposal(proposal);

        if (newProposals.length >= this.config.maxProposalsPerRun) {
          break;
        }
      }
    }

    return newProposals;
  }

  /**
   * Generate a proposal for a specific document based on its impact
   */
  private generateProposalForDocument(
    impact: KBDocumentImpact
  ): KBUpdateProposal | null {
    // Check for deprecation
    if (
      this.config.enableDeprecationProposals &&
      impact.impactScore < this.config.autoDeprecationThreshold &&
      impact.confidence >= 0.7
    ) {
      return this.createDeprecationProposal(impact);
    }

    // Check for enhancement
    if (
      this.config.enableEnhancementProposals &&
      impact.recommendedAction === 'enhance'
    ) {
      return this.createEnhancementProposal(impact);
    }

    // Check for split (would need chunk count info)
    if (
      this.config.enableSplitProposals &&
      impact.recommendedAction === 'split'
    ) {
      return this.createSplitProposal(impact);
    }

    return null;
  }

  // ==========================================================================
  // PROPOSAL CREATORS
  // ==========================================================================

  private createDeprecationProposal(impact: KBDocumentImpact): KBUpdateProposal {
    return {
      id: uuidv4(),
      agentId: this.config.agentId,
      updateType: 'content-deprecation',
      targetDocumentIds: [impact.documentId],
      rationale: this.generateDeprecationRationale(impact),
      triggeringImpact: impact,
      proposedChanges: {
        metadataChanges: {
          deprecated: true,
          deprecationReason: 'Low impact score based on usage analysis',
          deprecatedAt: new Date().toISOString(),
        },
      },
      priority: Math.abs(impact.impactScore) * 100,
      status: 'proposed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private createEnhancementProposal(impact: KBDocumentImpact): KBUpdateProposal {
    return {
      id: uuidv4(),
      agentId: this.config.agentId,
      updateType: 'content-enhancement',
      targetDocumentIds: [impact.documentId],
      rationale: this.generateEnhancementRationale(impact),
      triggeringImpact: impact,
      proposedChanges: {
        metadataChanges: {
          needsEnhancement: true,
          weakTopics: impact.weakTopics,
          strongTopics: impact.strongTopics,
        },
      },
      priority: 50 + (impact.totalRetrievals * 0.1),
      status: 'proposed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private createSplitProposal(impact: KBDocumentImpact): KBUpdateProposal {
    return {
      id: uuidv4(),
      agentId: this.config.agentId,
      updateType: 'document-split',
      targetDocumentIds: [impact.documentId],
      rationale: this.generateSplitRationale(impact),
      triggeringImpact: impact,
      proposedChanges: {
        splitPlan: {
          newDocuments: [],  // To be filled by manual review
        },
      },
      priority: 30,
      status: 'proposed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // ==========================================================================
  // RATIONALE GENERATORS
  // ==========================================================================

  private generateDeprecationRationale(impact: KBDocumentImpact): string {
    const parts = [
      `Document "${impact.documentTitle}" has a negative impact score of ${impact.impactScore.toFixed(3)}.`,
      `It has been retrieved ${impact.totalRetrievals} times but used only ${impact.timesUsedInResponse} times.`,
      `Average quality when used: ${(impact.avgQualityWhenUsed * 100).toFixed(1)}%`,
      `Average quality when not used: ${(impact.avgQualityWhenNotUsed * 100).toFixed(1)}%`,
    ];

    if (impact.weakTopics.length > 0) {
      parts.push(`Performs poorly on topics: ${impact.weakTopics.join(', ')}`);
    }

    parts.push('Recommendation: Review for deprecation or significant revision.');

    return parts.join('\n');
  }

  private generateEnhancementRationale(impact: KBDocumentImpact): string {
    const parts = [
      `Document "${impact.documentTitle}" shows potential for improvement.`,
      `Impact score: ${impact.impactScore.toFixed(3)} (positive but below threshold)`,
      `Retrieved ${impact.totalRetrievals} times, used ${impact.timesUsedInResponse} times.`,
    ];

    if (impact.strongTopics.length > 0) {
      parts.push(`Strong performance on: ${impact.strongTopics.join(', ')}`);
    }

    if (impact.weakTopics.length > 0) {
      parts.push(`Needs improvement on: ${impact.weakTopics.join(', ')}`);
    }

    parts.push('Recommendation: Enhance content for weak topics while maintaining strengths.');

    return parts.join('\n');
  }

  private generateSplitRationale(impact: KBDocumentImpact): string {
    return [
      `Document "${impact.documentTitle}" may be too broad.`,
      `It covers multiple topics with varying performance.`,
      `Strong topics: ${impact.strongTopics.join(', ') || 'none identified'}`,
      `Weak topics: ${impact.weakTopics.join(', ') || 'none identified'}`,
      'Recommendation: Split into focused documents for each major topic.',
    ].join('\n');
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private async isInCooldown(documentId: string): Promise<boolean> {
    const recentProposals = await this.storage.getProposals({
      agentId: this.config.agentId,
    });

    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() - this.config.proposalCooldownDays);

    return recentProposals.some(
      p => p.targetDocumentIds.includes(documentId) &&
           new Date(p.createdAt) > cooldownDate
    );
  }

  // ==========================================================================
  // PROPOSAL MANAGEMENT
  // ==========================================================================

  /**
   * Approve a proposal
   */
  async approveProposal(proposalId: string): Promise<void> {
    await this.storage.updateProposalStatus(proposalId, 'approved');
  }

  /**
   * Reject a proposal
   */
  async rejectProposal(proposalId: string): Promise<void> {
    await this.storage.updateProposalStatus(proposalId, 'rejected');
  }

  /**
   * Mark a proposal as applied
   */
  async markProposalApplied(proposalId: string): Promise<void> {
    await this.storage.updateProposalStatus(proposalId, 'applied');
  }

  /**
   * Get all pending proposals
   */
  async getPendingProposals(): Promise<KBUpdateProposal[]> {
    return this.storage.getProposals({
      agentId: this.config.agentId,
      status: 'proposed',
    });
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createKBUpdatePipeline(
  config: Partial<KBUpdatePipelineConfig>,
  storage: KBImpactStorage,
  tracker: BaseKBImpactTracker
): KBUpdatePipeline {
  return new KBUpdatePipeline(config, storage, tracker);
}

export default KBUpdatePipeline;
