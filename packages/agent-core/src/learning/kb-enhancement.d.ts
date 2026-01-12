/**
 * KB Enhancement System
 *
 * Identifies gaps and opportunities to improve the knowledge base
 * based on conversation analysis, failed queries, and critique feedback.
 *
 * This is designed to run as an offline batch process, generating
 * enhancement proposals for human review.
 */
import { StorageProvider } from '../providers/interfaces.js';
import { KBEnhancement, EnhancementType, EnhancementStatus, ResponseCritique } from './types.js';
/**
 * Configuration for KB enhancement
 */
export interface KBEnhancementConfig {
    /**
     * Path for storing enhancement proposals
     */
    enhancementsPath: string;
    /**
     * Path for enhancement index
     */
    indexPath: string;
    /**
     * Minimum issue occurrences before proposing enhancement
     */
    minOccurrencesForProposal: number;
    /**
     * Maximum enhancements to propose per batch
     */
    maxProposalsPerBatch: number;
}
/**
 * KB Enhancement system for identifying knowledge gaps
 */
export declare class KBEnhancementSystem {
    private storage;
    private config;
    private indexCache;
    constructor(storage: StorageProvider, config?: Partial<KBEnhancementConfig>);
    /**
     * Analyze critiques to identify potential KB enhancements
     */
    analyzeCritiques(critiques: ResponseCritique[]): Promise<KBEnhancement[]>;
    /**
     * Convert an issue to a potential gap
     */
    private issueToGap;
    /**
     * Track a gap, merging with existing if similar
     */
    private trackGap;
    /**
     * Check if two descriptions are similar
     */
    private similarDescription;
    /**
     * Merge new gaps with existing tracked gaps
     */
    private mergeGaps;
    /**
     * Generate enhancement proposals for gaps that meet threshold
     */
    private generateProposals;
    /**
     * Create an enhancement from a gap
     */
    private createEnhancement;
    /**
     * Assess the impact of addressing a gap
     */
    private assessImpact;
    /**
     * Calculate priority (1 = highest, 5 = lowest)
     */
    private calculatePriority;
    /**
     * Generate proposed content for the enhancement
     */
    private generateProposedContent;
    /**
     * Suggest a location for the enhancement
     */
    private suggestLocation;
    /**
     * Save an enhancement to storage
     */
    private saveEnhancement;
    /**
     * Load the enhancement index
     */
    private loadIndex;
    /**
     * Save the enhancement index
     */
    private saveIndex;
    /**
     * Get all pending enhancements
     */
    getPendingEnhancements(): Promise<KBEnhancement[]>;
    /**
     * Update enhancement status
     */
    updateStatus(id: string, status: EnhancementStatus): Promise<void>;
    /**
     * Get statistics about enhancements
     */
    getStats(): Promise<{
        totalEnhancements: number;
        byStatus: Record<EnhancementStatus, number>;
        byType: Record<EnhancementType, number>;
        trackedGaps: number;
        avgOccurrences: number;
    }>;
}
export default KBEnhancementSystem;
//# sourceMappingURL=kb-enhancement.d.ts.map