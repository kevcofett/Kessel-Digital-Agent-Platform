/**
 * Base KB Impact Tracker
 *
 * Generic implementation for tracking KB document impact across all agents.
 * Agent-specific trackers extend this class with custom logic.
 */
import type { KBUsageRecord, KBDocumentImpact, KBDocumentAction, KBImpactTrackerConfig, KBImpactStorage } from './kb-impact-types.js';
export declare class BaseKBImpactTracker {
    protected config: KBImpactTrackerConfig;
    protected storage: KBImpactStorage;
    protected sessionRecords: Map<string, KBUsageRecord[]>;
    protected documentImpactCache: Map<string, KBDocumentImpact>;
    constructor(config: Partial<KBImpactTrackerConfig>, storage: KBImpactStorage);
    /**
     * Record that KB documents were retrieved for a query
     */
    recordRetrieval(sessionId: string, query: string, retrievedDocs: Array<{
        documentId: string;
        chunkIds: string[];
        score: number;
    }>): Promise<string[]>;
    /**
     * Mark documents as actually used in the response
     */
    markAsUsed(sessionId: string, usedDocumentIds: string[]): Promise<void>;
    /**
     * Record the quality score for a session's response
     */
    recordQuality(sessionId: string, qualityScore: number): Promise<void>;
    /**
     * Recalculate impact score for a specific document
     */
    recalculateDocumentImpact(documentId: string): Promise<KBDocumentImpact>;
    /**
     * Get impact data for all documents
     */
    getAllDocumentImpacts(): Promise<KBDocumentImpact[]>;
    /**
     * Get documents sorted by impact score
     */
    getDocumentsByImpact(order?: 'asc' | 'desc'): Promise<KBDocumentImpact[]>;
    /**
     * Get documents needing attention (low impact or low confidence)
     */
    getDocumentsNeedingAttention(): Promise<KBDocumentImpact[]>;
    protected calculateConfidence(usedCount: number, baselineCount: number): number;
    protected determineAction(impactScore: number, confidence: number, totalUsages: number): KBDocumentAction;
    protected analyzeTopics(records: KBUsageRecord[]): {
        strongTopics: string[];
        weakTopics: string[];
    };
    /**
     * Extract topic keywords from a query
     * Override in agent-specific implementations for domain-specific extraction
     */
    protected extractTopics(query: string): string[];
    protected extractDocumentTitle(documentId: string): string;
    /**
     * Clear session data (call after session ends)
     */
    clearSession(sessionId: string): void;
    /**
     * Clear all in-memory caches
     */
    clearCache(): void;
}
export default BaseKBImpactTracker;
//# sourceMappingURL=base-kb-impact-tracker.d.ts.map