/**
 * Base Scorer Interface
 *
 * Defines the interface that all scorers must implement.
 * Scorers evaluate conversations against specific criteria.
 */
/**
 * Base class for all scorers
 */
export class BaseScorer {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Get the scorer name
     */
    getName() {
        return this.config.name;
    }
    /**
     * Get the scorer weight
     */
    getWeight() {
        return this.config.weight;
    }
    /**
     * Check if this scorer is required
     */
    isRequired() {
        return this.config.required ?? false;
    }
    /**
     * Check if a score passes the threshold
     */
    isPassing(score) {
        const threshold = this.config.passingThreshold ?? 0.6;
        return score >= threshold;
    }
    /**
     * Helper to create a result
     */
    createResult(score, explanation, options) {
        return {
            name: this.config.name,
            score: Math.max(0, Math.min(1, score)), // Clamp to 0-1
            explanation,
            breakdown: options?.breakdown,
            issues: options?.issues,
            metadata: options?.metadata,
        };
    }
}
/**
 * Functional scorer for simple scoring logic
 */
export class FunctionalScorer extends BaseScorer {
    scoreFn;
    constructor(config, scoreFn) {
        super(config);
        this.scoreFn = scoreFn;
    }
    async score(transcript) {
        return this.scoreFn(transcript);
    }
}
/**
 * Create a simple scorer from a function
 */
export function createScorer(name, weight, scoreFn) {
    return new FunctionalScorer({ name, weight }, scoreFn);
}
export default BaseScorer;
//# sourceMappingURL=base-scorer.js.map