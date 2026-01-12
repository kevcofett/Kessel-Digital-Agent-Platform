/**
 * Self-Critique System
 *
 * Enables agents to critique their own responses for quality improvement.
 * Uses an LLM (typically a smaller/faster model) to evaluate responses
 * against configurable criteria.
 *
 * This component has NO storage dependency - it generates critiques
 * that can be stored by the caller using any storage provider.
 */
import { LLMProvider } from '../providers/interfaces.js';
import { ResponseCritique, CritiqueMetadata, LearningConfig } from './types.js';
/**
 * Criteria for critiquing agent responses
 */
export interface CritiqueCriteria {
    /**
     * Dimensions to evaluate with descriptions
     */
    dimensions: {
        name: string;
        description: string;
        weight: number;
    }[];
    /**
     * Domain-specific rules for the agent
     */
    domainRules: string[];
    /**
     * Examples of good and bad responses (optional)
     */
    examples?: {
        good: {
            query: string;
            response: string;
            whyGood: string;
        }[];
        bad: {
            query: string;
            response: string;
            whyBad: string;
        }[];
    };
}
/**
 * Default critique criteria (generic)
 */
export declare const DEFAULT_CRITIQUE_CRITERIA: CritiqueCriteria;
/**
 * Self-Critique system for agent response evaluation
 */
export declare class SelfCritique {
    private llmProvider;
    private criteria;
    private config;
    private critiqueCount;
    constructor(llmProvider: LLMProvider, criteria?: CritiqueCriteria, config?: Partial<LearningConfig>);
    /**
     * Generate a critique of an agent response
     */
    critique(userQuery: string, agentResponse: string, metadata?: Partial<CritiqueMetadata>): Promise<ResponseCritique>;
    /**
     * Build the system prompt for critique
     */
    private buildCritiquePrompt;
    /**
     * Build the critique request message
     */
    private buildCritiqueRequest;
    /**
     * Parse the critique response from the LLM
     */
    private parseCritiqueResponse;
    /**
     * Fallback critique parsing when JSON extraction fails
     */
    private fallbackParseCritique;
    /**
     * Get dimension weight from criteria
     */
    private getDimensionWeight;
    /**
     * Normalize issue type to valid enum
     */
    private normalizeIssueType;
    /**
     * Normalize severity to valid enum
     */
    private normalizeSeverity;
    /**
     * Extract text content from LLM response
     */
    private extractTextContent;
    /**
     * Batch critique multiple responses
     */
    critiqueBatch(interactions: Array<{
        userQuery: string;
        agentResponse: string;
        metadata?: Partial<CritiqueMetadata>;
    }>): Promise<ResponseCritique[]>;
    /**
     * Update critique criteria
     */
    setCriteria(criteria: CritiqueCriteria): void;
    /**
     * Get current criteria
     */
    getCriteria(): CritiqueCriteria;
    /**
     * Get critique statistics
     */
    getStats(): {
        totalCritiques: number;
    };
}
export default SelfCritique;
//# sourceMappingURL=self-critique.d.ts.map