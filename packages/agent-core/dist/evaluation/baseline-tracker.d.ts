/**
 * Baseline Tracker
 *
 * Tracks baseline scores for comparison across evaluation runs.
 * Enables regression detection and improvement tracking.
 */
import { StorageProvider } from '../providers/interfaces.js';
import { BaselineRecord, BaselineComparison, ConversationScores } from './types.js';
/**
 * Configuration for baseline tracking
 */
export interface BaselineTrackerConfig {
    /**
     * Path for storing baselines
     */
    baselinesPath: string;
    /**
     * Threshold for regression detection (negative delta)
     */
    regressionThreshold: number;
    /**
     * Whether to auto-update baselines when scores improve
     */
    autoUpdate: boolean;
}
/**
 * Tracks and compares evaluation baselines
 */
export declare class BaselineTracker {
    private storage;
    private config;
    private indexCache;
    constructor(storage: StorageProvider, config?: Partial<BaselineTrackerConfig>);
    /**
     * Get baseline for a scenario
     */
    getBaseline(scenarioId: string, model?: string): Promise<BaselineRecord | null>;
    /**
     * Compare scores to baseline
     */
    compare(scenarioId: string, currentScores: ConversationScores, model?: string): Promise<BaselineComparison | null>;
    /**
     * Generate comparison summary text
     */
    private generateComparisonSummary;
    /**
     * Save a new baseline
     */
    saveBaseline(scenarioId: string, scores: ConversationScores, model: string, notes?: string): Promise<BaselineRecord>;
    /**
     * Update baseline if scores improved (when autoUpdate is enabled)
     */
    maybeUpdateBaseline(scenarioId: string, currentScores: ConversationScores, model: string): Promise<boolean>;
    /**
     * Get all baselines for a scenario
     */
    getBaselineHistory(scenarioId: string): Promise<BaselineRecord[]>;
    /**
     * Load the baseline index
     */
    private loadIndex;
    /**
     * Save the baseline index
     */
    private saveIndex;
    /**
     * Get statistics about baselines
     */
    getStats(): Promise<{
        totalBaselines: number;
        scenarioCount: number;
        averageScore: number;
    }>;
}
export default BaselineTracker;
//# sourceMappingURL=baseline-tracker.d.ts.map