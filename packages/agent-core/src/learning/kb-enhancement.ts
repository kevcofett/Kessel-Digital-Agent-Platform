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
import {
  KBEnhancement,
  EnhancementType,
  EnhancementStatus,
  EnhancementEvidence,
  ImpactAssessment,
  ResponseCritique,
  CritiqueIssue,
} from './types.js';

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

const DEFAULT_ENHANCEMENT_CONFIG: KBEnhancementConfig = {
  enhancementsPath: 'learning/enhancements',
  indexPath: 'learning/enhancements/index.json',
  minOccurrencesForProposal: 2,
  maxProposalsPerBatch: 10,
};

/**
 * Tracked gap for potential enhancement
 */
interface GapTracker {
  description: string;
  type: EnhancementType;
  occurrences: number;
  evidence: EnhancementEvidence[];
  topics: string[];
  firstSeen: Date;
  lastSeen: Date;
}

/**
 * Enhancement index for tracking
 */
interface EnhancementIndex {
  enhancements: Array<{
    id: string;
    type: EnhancementType;
    status: EnhancementStatus;
    priority: number;
    createdAt: string;
  }>;
  trackedGaps: GapTracker[];
  lastAnalysis: string;
}

/**
 * KB Enhancement system for identifying knowledge gaps
 */
export class KBEnhancement {
  private storage: StorageProvider;
  private config: KBEnhancementConfig;
  private indexCache: EnhancementIndex | null = null;

  constructor(
    storage: StorageProvider,
    config?: Partial<KBEnhancementConfig>
  ) {
    this.storage = storage;
    this.config = { ...DEFAULT_ENHANCEMENT_CONFIG, ...config };
  }

  /**
   * Analyze critiques to identify potential KB enhancements
   */
  async analyzeCritiques(critiques: ResponseCritique[]): Promise<KBEnhancement[]> {
    await this.loadIndex();

    const newGaps: GapTracker[] = [];

    for (const critique of critiques) {
      // Analyze issues for gaps
      for (const issue of critique.issues) {
        const gap = this.issueToGap(issue, critique);
        if (gap) {
          this.trackGap(gap, newGaps);
        }
      }

      // Analyze low citation scores
      const citationDim = critique.dimensions.find(d => d.name === 'citation');
      if (citationDim && citationDim.score < 0.6) {
        const gap: GapTracker = {
          description: `Missing or insufficient KB content for: ${critique.userQuery.slice(0, 100)}`,
          type: 'missing_content',
          occurrences: 1,
          evidence: [{
            type: 'low_score_response',
            description: `Citation score ${Math.round(citationDim.score * 100)}%`,
            timestamp: critique.timestamp,
            conversationId: critique.metadata.conversationId,
          }],
          topics: critique.metadata.topic ? [critique.metadata.topic] : [],
          firstSeen: critique.timestamp,
          lastSeen: critique.timestamp,
        };
        this.trackGap(gap, newGaps);
      }
    }

    // Merge with existing gaps
    this.mergeGaps(newGaps);

    // Generate proposals for gaps that meet threshold
    const proposals = await this.generateProposals();

    return proposals;
  }

  /**
   * Convert an issue to a potential gap
   */
  private issueToGap(issue: CritiqueIssue, critique: ResponseCritique): GapTracker | null {
    if (issue.severity === 'minor') {
      return null;  // Don't track minor issues
    }

    let type: EnhancementType;
    switch (issue.type) {
      case 'accuracy':
        type = 'outdated_content';
        break;
      case 'completeness':
        type = 'missing_content';
        break;
      case 'clarity':
        type = 'unclear_content';
        break;
      case 'citation':
        type = 'missing_content';
        break;
      default:
        return null;
    }

    return {
      description: issue.description,
      type,
      occurrences: 1,
      evidence: [{
        type: issue.severity === 'major' ? 'low_score_response' : 'failed_query',
        description: issue.description,
        timestamp: critique.timestamp,
        conversationId: critique.metadata.conversationId,
      }],
      topics: critique.metadata.topic ? [critique.metadata.topic] : [],
      firstSeen: critique.timestamp,
      lastSeen: critique.timestamp,
    };
  }

  /**
   * Track a gap, merging with existing if similar
   */
  private trackGap(gap: GapTracker, newGaps: GapTracker[]): void {
    // Check if similar gap exists in new gaps
    const existing = newGaps.find(g =>
      g.type === gap.type &&
      this.similarDescription(g.description, gap.description)
    );

    if (existing) {
      existing.occurrences++;
      existing.evidence.push(...gap.evidence);
      existing.lastSeen = gap.lastSeen;
      existing.topics = [...new Set([...existing.topics, ...gap.topics])];
    } else {
      newGaps.push(gap);
    }
  }

  /**
   * Check if two descriptions are similar
   */
  private similarDescription(a: string, b: string): boolean {
    const aWords = new Set(a.toLowerCase().split(/\s+/));
    const bWords = new Set(b.toLowerCase().split(/\s+/));

    let overlap = 0;
    for (const word of aWords) {
      if (bWords.has(word)) overlap++;
    }

    const minSize = Math.min(aWords.size, bWords.size);
    return overlap / minSize > 0.5;
  }

  /**
   * Merge new gaps with existing tracked gaps
   */
  private mergeGaps(newGaps: GapTracker[]): void {
    if (!this.indexCache) {
      this.indexCache = {
        enhancements: [],
        trackedGaps: [],
        lastAnalysis: new Date().toISOString(),
      };
    }

    for (const newGap of newGaps) {
      const existing = this.indexCache.trackedGaps.find(g =>
        g.type === newGap.type &&
        this.similarDescription(g.description, newGap.description)
      );

      if (existing) {
        existing.occurrences += newGap.occurrences;
        existing.evidence.push(...newGap.evidence);
        existing.lastSeen = newGap.lastSeen;
        existing.topics = [...new Set([...existing.topics, ...newGap.topics])];
      } else {
        this.indexCache.trackedGaps.push(newGap);
      }
    }
  }

  /**
   * Generate enhancement proposals for gaps that meet threshold
   */
  private async generateProposals(): Promise<KBEnhancement[]> {
    if (!this.indexCache) return [];

    const proposals: KBEnhancement[] = [];

    // Filter gaps that meet occurrence threshold
    const qualifiedGaps = this.indexCache.trackedGaps
      .filter(g => g.occurrences >= this.config.minOccurrencesForProposal)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, this.config.maxProposalsPerBatch);

    for (const gap of qualifiedGaps) {
      // Check if enhancement already exists
      const existingEnhancement = this.indexCache.enhancements.find(e =>
        e.type === gap.type &&
        e.status !== 'implemented' &&
        e.status !== 'rejected'
      );

      if (!existingEnhancement) {
        const enhancement = this.createEnhancement(gap);
        proposals.push(enhancement);
        await this.saveEnhancement(enhancement);
      }
    }

    // Update index
    this.indexCache.lastAnalysis = new Date().toISOString();
    await this.saveIndex();

    return proposals;
  }

  /**
   * Create an enhancement from a gap
   */
  private createEnhancement(gap: GapTracker): KBEnhancement {
    const impact = this.assessImpact(gap);

    return {
      id: `enhancement_${Date.now()}`,
      createdAt: new Date(),
      type: gap.type,
      priority: this.calculatePriority(gap, impact),
      status: 'identified',
      description: gap.description,
      evidence: gap.evidence.slice(0, 10),  // Limit evidence
      proposedContent: this.generateProposedContent(gap),
      targetLocation: this.suggestLocation(gap),
      impactAssessment: impact,
    };
  }

  /**
   * Assess the impact of addressing a gap
   */
  private assessImpact(gap: GapTracker): ImpactAssessment {
    // Estimate query coverage based on occurrence frequency
    const estimatedCoverage = Math.min(gap.occurrences * 2, 20);  // Cap at 20%

    // Determine criticality based on issue types in evidence
    let criticality: 'low' | 'medium' | 'high' = 'medium';
    if (gap.type === 'outdated_content') {
      criticality = 'high';
    } else if (gap.type === 'missing_example') {
      criticality = 'low';
    }

    // Estimate effort based on enhancement type
    let effort: 'minimal' | 'moderate' | 'significant' = 'moderate';
    if (gap.type === 'missing_example') {
      effort = 'minimal';
    } else if (gap.type === 'new_topic') {
      effort = 'significant';
    }

    return {
      estimatedQueryCoverage: estimatedCoverage,
      criticalityLevel: criticality,
      affectedTopics: gap.topics,
      effort,
    };
  }

  /**
   * Calculate priority (1 = highest, 5 = lowest)
   */
  private calculatePriority(gap: GapTracker, impact: ImpactAssessment): number {
    let priority = 3;  // Default medium

    // Adjust based on occurrences
    if (gap.occurrences >= 10) priority--;
    if (gap.occurrences >= 5) priority--;

    // Adjust based on criticality
    if (impact.criticalityLevel === 'high') priority--;
    if (impact.criticalityLevel === 'low') priority++;

    // Clamp to 1-5
    return Math.max(1, Math.min(5, priority));
  }

  /**
   * Generate proposed content for the enhancement
   */
  private generateProposedContent(gap: GapTracker): string {
    switch (gap.type) {
      case 'missing_content':
        return `[PROPOSED] Add new content covering: ${gap.description}\n\nBased on ${gap.occurrences} observed gaps.`;
      case 'outdated_content':
        return `[PROPOSED] Update existing content regarding: ${gap.description}\n\nCurrent content may be outdated based on ${gap.occurrences} accuracy issues.`;
      case 'unclear_content':
        return `[PROPOSED] Clarify existing content about: ${gap.description}\n\nUsers have reported confusion ${gap.occurrences} times.`;
      case 'missing_example':
        return `[PROPOSED] Add example demonstrating: ${gap.description}`;
      default:
        return `[PROPOSED] ${gap.description}`;
    }
  }

  /**
   * Suggest a location for the enhancement
   */
  private suggestLocation(gap: GapTracker): string {
    if (gap.topics.length > 0) {
      return `Related to topics: ${gap.topics.join(', ')}`;
    }
    return 'Location to be determined';
  }

  /**
   * Save an enhancement to storage
   */
  private async saveEnhancement(enhancement: KBEnhancement): Promise<void> {
    const path = `${this.config.enhancementsPath}/${enhancement.id}.json`;
    await this.storage.writeJSON(path, enhancement);

    if (this.indexCache) {
      this.indexCache.enhancements.push({
        id: enhancement.id,
        type: enhancement.type,
        status: enhancement.status,
        priority: enhancement.priority,
        createdAt: enhancement.createdAt.toISOString(),
      });
    }
  }

  /**
   * Load the enhancement index
   */
  private async loadIndex(): Promise<void> {
    if (this.indexCache) return;

    try {
      this.indexCache = await this.storage.readJSON<EnhancementIndex>(this.config.indexPath);
    } catch {
      this.indexCache = {
        enhancements: [],
        trackedGaps: [],
        lastAnalysis: new Date().toISOString(),
      };
    }
  }

  /**
   * Save the enhancement index
   */
  private async saveIndex(): Promise<void> {
    if (this.indexCache) {
      await this.storage.writeJSON(this.config.indexPath, this.indexCache);
    }
  }

  /**
   * Get all pending enhancements
   */
  async getPendingEnhancements(): Promise<KBEnhancement[]> {
    await this.loadIndex();

    if (!this.indexCache) return [];

    const pending: KBEnhancement[] = [];
    const pendingStatuses: EnhancementStatus[] = ['identified', 'validated', 'in_progress', 'pending_review'];

    for (const entry of this.indexCache.enhancements) {
      if (pendingStatuses.includes(entry.status)) {
        try {
          const enhancement = await this.storage.readJSON<KBEnhancement>(
            `${this.config.enhancementsPath}/${entry.id}.json`
          );
          pending.push(enhancement);
        } catch {
          // Skip if not found
        }
      }
    }

    return pending.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Update enhancement status
   */
  async updateStatus(id: string, status: EnhancementStatus): Promise<void> {
    await this.loadIndex();

    if (!this.indexCache) return;

    const entry = this.indexCache.enhancements.find(e => e.id === id);
    if (entry) {
      entry.status = status;

      try {
        const enhancement = await this.storage.readJSON<KBEnhancement>(
          `${this.config.enhancementsPath}/${id}.json`
        );
        enhancement.status = status;
        await this.storage.writeJSON(
          `${this.config.enhancementsPath}/${id}.json`,
          enhancement
        );
      } catch {
        // Enhancement file not found
      }

      await this.saveIndex();
    }
  }

  /**
   * Get statistics about enhancements
   */
  async getStats(): Promise<{
    totalEnhancements: number;
    byStatus: Record<EnhancementStatus, number>;
    byType: Record<EnhancementType, number>;
    trackedGaps: number;
    avgOccurrences: number;
  }> {
    await this.loadIndex();

    if (!this.indexCache) {
      return {
        totalEnhancements: 0,
        byStatus: {} as Record<EnhancementStatus, number>,
        byType: {} as Record<EnhancementType, number>,
        trackedGaps: 0,
        avgOccurrences: 0,
      };
    }

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const entry of this.indexCache.enhancements) {
      byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
      byType[entry.type] = (byType[entry.type] || 0) + 1;
    }

    const totalOccurrences = this.indexCache.trackedGaps.reduce((sum, g) => sum + g.occurrences, 0);

    return {
      totalEnhancements: this.indexCache.enhancements.length,
      byStatus: byStatus as Record<EnhancementStatus, number>,
      byType: byType as Record<EnhancementType, number>,
      trackedGaps: this.indexCache.trackedGaps.length,
      avgOccurrences: this.indexCache.trackedGaps.length > 0
        ? totalOccurrences / this.indexCache.trackedGaps.length
        : 0,
    };
  }
}

export default KBEnhancement;
