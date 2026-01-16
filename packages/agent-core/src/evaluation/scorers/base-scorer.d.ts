/**
 * Base Scorer Interface
 *
 * Defines the interface that all scorers must implement.
 * Scorers evaluate conversations against specific criteria.
 */
import { ConversationTranscript, ScorerResult } from '../types.js';
/**
 * Configuration for a scorer
 */
export interface ScorerConfig {
    /**
     * Name of the scorer
     */
    name: string;
    /**
     * Weight for composite scoring (0-1)
     */
    weight: number;
    /**
     * Whether this scorer is required to pass
     */
    required?: boolean;
    /**
     * Minimum score threshold for passing
     */
    passingThreshold?: number;
    /**
     * Scorer-specific options
     */
    options?: Record<string, unknown>;
}
/**
 * Base class for all scorers
 */
export declare abstract class BaseScorer {
    protected config: ScorerConfig;
    constructor(config: ScorerConfig);
    /**
     * Score a conversation transcript
     */
    abstract score(transcript: ConversationTranscript): Promise<ScorerResult>;
    /**
     * Get the scorer name
     */
    getName(): string;
    /**
     * Get the scorer weight
     */
    getWeight(): number;
    /**
     * Check if this scorer is required
     */
    isRequired(): boolean;
    /**
     * Check if a score passes the threshold
     */
    isPassing(score: number): boolean;
    /**
     * Helper to create a result
     */
    protected createResult(score: number, explanation: string, options?: {
        breakdown?: Record<string, number>;
        issues?: string[];
        metadata?: Record<string, unknown>;
    }): ScorerResult;
}
/**
 * Functional scorer for simple scoring logic
 */
export declare class FunctionalScorer extends BaseScorer {
    private scoreFn;
    constructor(config: ScorerConfig, scoreFn: (transcript: ConversationTranscript) => Promise<ScorerResult>);
    score(transcript: ConversationTranscript): Promise<ScorerResult>;
}
/**
 * Create a simple scorer from a function
 */
export declare function createScorer(name: string, weight: number, scoreFn: (transcript: ConversationTranscript) => Promise<ScorerResult>): BaseScorer;
export default BaseScorer;
//# sourceMappingURL=base-scorer.d.ts.map