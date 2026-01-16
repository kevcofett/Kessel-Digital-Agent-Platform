/**
 * Success Patterns System
 *
 * Identifies and tracks successful interaction patterns from
 * exemplary agent responses. These patterns can be used to
 * guide future responses and improve consistency.
 *
 * Uses StorageProvider abstraction for persistence, working
 * in both personal (file) and corporate (Dataverse) environments.
 */
import { StorageProvider } from '../providers/interfaces.js';
import { SuccessPattern, ResponseCritique, LearningConfig } from './types.js';
/**
 * Configuration for pattern storage paths
 */
export interface PatternStorageConfig {
    /**
     * Path/prefix for storing patterns
     */
    patternsPath: string;
    /**
     * Path/prefix for pattern index
     */
    indexPath: string;
}
/**
 * Success Patterns manager for tracking effective response patterns
 */
export declare class SuccessPatterns {
    private storage;
    private storageConfig;
    private learningConfig;
    private patternCache;
    private indexCache;
    constructor(storage: StorageProvider, storageConfig?: Partial<PatternStorageConfig>, learningConfig?: Partial<LearningConfig>);
    /**
     * Extract potential patterns from an exemplary critique
     */
    extractFromCritique(critique: ResponseCritique): Promise<SuccessPattern | null>;
    /**
     * Detect the type of pattern from interaction
     */
    private detectPatternType;
    /**
     * Extract response elements that made it effective
     */
    private extractResponseElements;
    /**
     * Extract trigger conditions from query
     */
    private extractTriggerConditions;
    /**
     * Generate description for a pattern
     */
    private generatePatternDescription;
    /**
     * Generate tags for categorization
     */
    private generateTags;
    /**
     * Find a similar existing pattern
     */
    private findSimilarPattern;
    /**
     * Reinforce an existing pattern with new observation
     */
    private reinforcePattern;
    /**
     * Get patterns relevant to a query
     */
    getRelevantPatterns(query: string, limit?: number): Promise<SuccessPattern[]>;
    /**
     * Save a pattern to storage
     */
    private savePattern;
    /**
     * Load a pattern from storage
     */
    private loadPattern;
    /**
     * Load the pattern index
     */
    private loadIndex;
    /**
     * Update the pattern index
     */
    private updateIndex;
    /**
     * Get all patterns (for export/analysis)
     */
    getAllPatterns(): Promise<SuccessPattern[]>;
    /**
     * Get pattern statistics
     */
    getStats(): Promise<{
        totalPatterns: number;
        patternsByType: Record<string, number>;
        averageConfidence: number;
        highConfidenceCount: number;
    }>;
}
export default SuccessPatterns;
//# sourceMappingURL=success-patterns.d.ts.map