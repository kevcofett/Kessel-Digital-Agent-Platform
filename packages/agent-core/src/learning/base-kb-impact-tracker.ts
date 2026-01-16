/**
 * Base KB Impact Tracker
 *
 * Generic implementation for tracking KB document impact across all agents.
 * Agent-specific trackers extend this class with custom logic.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  KBUsageRecord,
  KBDocumentImpact,
  KBDocumentAction,
  KBImpactTrackerConfig,
  KBImpactStorage,
} from './kb-impact-types.js';
import { DEFAULT_KB_IMPACT_CONFIG } from './kb-impact-types.js';

// ============================================================================
// BASE KB IMPACT TRACKER
// ============================================================================

export class BaseKBImpactTracker {
  protected config: KBImpactTrackerConfig;
  protected storage: KBImpactStorage;

  // In-memory cache for current session
  protected sessionRecords: Map<string, KBUsageRecord[]> = new Map();
  protected documentImpactCache: Map<string, KBDocumentImpact> = new Map();

  constructor(
    config: Partial<KBImpactTrackerConfig>,
    storage: KBImpactStorage
  ) {
    this.config = { ...DEFAULT_KB_IMPACT_CONFIG, ...config };
    this.storage = storage;
  }

  // ==========================================================================
  // RECORDING USAGE
  // ==========================================================================

  /**
   * Record that KB documents were retrieved for a query
   */
  async recordRetrieval(
    sessionId: string,
    query: string,
    retrievedDocs: Array<{
      documentId: string;
      chunkIds: string[];
      score: number;
    }>
  ): Promise<string[]> {
    const recordIds: string[] = [];

    for (const doc of retrievedDocs) {
      const record: KBUsageRecord = {
        id: uuidv4(),
        agentId: this.config.agentId,
        documentId: doc.documentId,
        chunkIds: doc.chunkIds,
        query,
        retrievalScore: doc.score,
        sessionId,
        wasUsedInResponse: false,  // Will be updated later
        timestamp: new Date(),
      };

      // Store in memory for this session
      if (!this.sessionRecords.has(sessionId)) {
        this.sessionRecords.set(sessionId, []);
      }
      this.sessionRecords.get(sessionId)!.push(record);

      // Persist to storage
      await this.storage.saveUsageRecord(record);

      recordIds.push(record.id);
    }

    return recordIds;
  }

  /**
   * Mark documents as actually used in the response
   */
  async markAsUsed(
    sessionId: string,
    usedDocumentIds: string[]
  ): Promise<void> {
    const records = this.sessionRecords.get(sessionId) || [];

    for (const record of records) {
      if (usedDocumentIds.includes(record.documentId)) {
        record.wasUsedInResponse = true;
        await this.storage.saveUsageRecord(record);
      }
    }
  }

  /**
   * Record the quality score for a session's response
   */
  async recordQuality(
    sessionId: string,
    qualityScore: number
  ): Promise<void> {
    const records = this.sessionRecords.get(sessionId) || [];

    for (const record of records) {
      record.responseQuality = qualityScore;
      await this.storage.saveUsageRecord(record);
    }

    // Trigger impact recalculation for affected documents
    const documentIds = [...new Set(records.map(r => r.documentId))];
    for (const docId of documentIds) {
      await this.recalculateDocumentImpact(docId);
    }
  }

  // ==========================================================================
  // IMPACT CALCULATION
  // ==========================================================================

  /**
   * Recalculate impact score for a specific document
   */
  async recalculateDocumentImpact(documentId: string): Promise<KBDocumentImpact> {
    // Get all usage records for this document
    const records = await this.storage.getUsageRecords({
      agentId: this.config.agentId,
      documentId,
    });

    // Get baseline quality (when this document was NOT used)
    const baselineRecords = await this.storage.getUsageRecords({
      agentId: this.config.agentId,
    });

    // Calculate metrics
    const usedRecords = records.filter(r => r.wasUsedInResponse && r.responseQuality !== undefined);
    const notUsedRecords = baselineRecords.filter(
      r => !r.chunkIds.some(c => records.some(rec => rec.chunkIds.includes(c))) &&
           r.responseQuality !== undefined
    );

    const avgQualityWhenUsed = usedRecords.length > 0
      ? usedRecords.reduce((sum, r) => sum + (r.responseQuality || 0), 0) / usedRecords.length
      : 0;

    const avgQualityWhenNotUsed = notUsedRecords.length > 0
      ? notUsedRecords.reduce((sum, r) => sum + (r.responseQuality || 0), 0) / notUsedRecords.length
      : 0.5;  // Default baseline

    const impactScore = avgQualityWhenUsed - avgQualityWhenNotUsed;
    const confidence = this.calculateConfidence(usedRecords.length, notUsedRecords.length);

    // Determine recommended action
    const recommendedAction = this.determineAction(impactScore, confidence, records.length);

    // Analyze topics
    const { strongTopics, weakTopics } = this.analyzeTopics(records);

    const impact: KBDocumentImpact = {
      documentId,
      documentTitle: this.extractDocumentTitle(documentId),
      totalRetrievals: records.length,
      timesUsedInResponse: usedRecords.length,
      avgQualityWhenUsed,
      avgQualityWhenNotUsed,
      impactScore,
      confidence,
      recommendedAction,
      strongTopics,
      weakTopics,
      lastUpdated: new Date(),
    };

    // Cache and persist
    this.documentImpactCache.set(documentId, impact);
    await this.storage.saveDocumentImpact(impact);

    return impact;
  }

  /**
   * Get impact data for all documents
   */
  async getAllDocumentImpacts(): Promise<KBDocumentImpact[]> {
    return this.storage.getAllDocumentImpacts(this.config.agentId);
  }

  /**
   * Get documents sorted by impact score
   */
  async getDocumentsByImpact(
    order: 'asc' | 'desc' = 'desc'
  ): Promise<KBDocumentImpact[]> {
    const impacts = await this.getAllDocumentImpacts();
    return impacts.sort((a, b) =>
      order === 'desc'
        ? b.impactScore - a.impactScore
        : a.impactScore - b.impactScore
    );
  }

  /**
   * Get documents needing attention (low impact or low confidence)
   */
  async getDocumentsNeedingAttention(): Promise<KBDocumentImpact[]> {
    const impacts = await this.getAllDocumentImpacts();
    return impacts.filter(
      i => i.recommendedAction !== 'keep' || i.confidence < this.config.confidenceThreshold
    );
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  protected calculateConfidence(usedCount: number, baselineCount: number): number {
    // Simple confidence based on sample size
    const minSamples = this.config.minUsagesForImpact;
    const usedConfidence = Math.min(usedCount / minSamples, 1);
    const baselineConfidence = Math.min(baselineCount / (minSamples * 2), 1);
    return (usedConfidence + baselineConfidence) / 2;
  }

  protected determineAction(
    impactScore: number,
    confidence: number,
    totalUsages: number
  ): KBDocumentAction {
    // Not enough data
    if (totalUsages < this.config.minUsagesForImpact) {
      return 'review';
    }

    // Low confidence
    if (confidence < this.config.confidenceThreshold) {
      return 'review';
    }

    // Clear negative impact
    if (impactScore < this.config.deprecationThreshold) {
      return 'deprecate';
    }

    // Positive but could be better
    if (impactScore > 0 && impactScore < this.config.enhancementThreshold) {
      return 'enhance';
    }

    // Strong positive impact
    if (impactScore >= this.config.enhancementThreshold) {
      return 'keep';
    }

    // Neutral - might need review
    return 'review';
  }

  protected analyzeTopics(records: KBUsageRecord[]): {
    strongTopics: string[];
    weakTopics: string[];
  } {
    const topicScores: Map<string, { total: number; count: number }> = new Map();

    for (const record of records) {
      if (record.responseQuality === undefined) continue;

      // Extract topic keywords from query
      const topics = this.extractTopics(record.query);

      for (const topic of topics) {
        const existing = topicScores.get(topic) || { total: 0, count: 0 };
        existing.total += record.responseQuality;
        existing.count += 1;
        topicScores.set(topic, existing);
      }
    }

    const strongTopics: string[] = [];
    const weakTopics: string[] = [];

    for (const [topic, scores] of topicScores) {
      if (scores.count < 3) continue;  // Need minimum samples

      const avgScore = scores.total / scores.count;
      if (avgScore >= 0.7) {
        strongTopics.push(topic);
      } else if (avgScore < 0.4) {
        weakTopics.push(topic);
      }
    }

    return { strongTopics, weakTopics };
  }

  /**
   * Extract topic keywords from a query
   * Override in agent-specific implementations for domain-specific extraction
   */
  protected extractTopics(query: string): string[] {
    // Basic implementation - extract significant words
    const stopWords = new Set([
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'shall',
      'can', 'need', 'to', 'of', 'in', 'for', 'on', 'with', 'at',
      'by', 'from', 'as', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'under', 'again',
      'further', 'then', 'once', 'here', 'there', 'when', 'where',
      'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other',
      'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
      'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
      'because', 'until', 'while', 'what', 'which', 'who', 'whom',
      'this', 'that', 'these', 'those', 'am', 'i', 'me', 'my', 'we',
      'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it',
      'its', 'they', 'them', 'their',
    ]);

    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  protected extractDocumentTitle(documentId: string): string {
    // Basic implementation - extract from document ID
    // Override for agent-specific logic
    return documentId.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
  }

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================

  /**
   * Clear session data (call after session ends)
   */
  clearSession(sessionId: string): void {
    this.sessionRecords.delete(sessionId);
  }

  /**
   * Clear all in-memory caches
   */
  clearCache(): void {
    this.sessionRecords.clear();
    this.documentImpactCache.clear();
  }
}

export default BaseKBImpactTracker;
