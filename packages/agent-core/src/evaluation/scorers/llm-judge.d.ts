/**
 * LLM Judge Scorer
 *
 * Uses an LLM to evaluate conversation quality against criteria.
 * This provides more nuanced evaluation than rule-based scorers.
 */
import { LLMProvider } from '../../providers/interfaces.js';
import { ConversationTranscript, ScorerResult } from '../types.js';
import { BaseScorer, ScorerConfig } from './base-scorer.js';
/**
 * Criteria for LLM evaluation
 */
export interface LLMJudgeCriteria {
    /**
     * Name of the criteria
     */
    name: string;
    /**
     * Description of what to evaluate
     */
    description: string;
    /**
     * Weight for this criteria
     */
    weight: number;
    /**
     * Examples of good/bad responses (optional)
     */
    examples?: {
        good?: string[];
        bad?: string[];
    };
}
/**
 * Configuration for LLM Judge
 */
export interface LLMJudgeConfig extends ScorerConfig {
    /**
     * Criteria to evaluate
     */
    criteria: LLMJudgeCriteria[];
    /**
     * Model to use for judging
     */
    model?: string;
    /**
     * Temperature for LLM calls
     */
    temperature?: number;
}
/**
 * LLM-based conversation judge
 */
export declare class LLMJudgeScorer extends BaseScorer {
    private llmProvider;
    private criteria;
    private model?;
    private temperature;
    constructor(llmProvider: LLMProvider, config: LLMJudgeConfig);
    /**
     * Score a conversation using LLM
     */
    score(transcript: ConversationTranscript): Promise<ScorerResult>;
    /**
     * Build the system prompt for evaluation
     */
    private buildSystemPrompt;
    /**
     * Build the evaluation request
     */
    private buildEvaluationRequest;
    /**
     * Parse the LLM evaluation response
     */
    private parseEvaluation;
    /**
     * Fallback parsing when JSON fails
     */
    private fallbackParse;
    /**
     * Extract text from LLM response content
     */
    private extractText;
}
/**
 * Create an LLM judge scorer with default criteria
 */
export declare function createLLMJudge(llmProvider: LLMProvider, name: string, weight: number, criteria: LLMJudgeCriteria[]): LLMJudgeScorer;
export default LLMJudgeScorer;
//# sourceMappingURL=llm-judge.d.ts.map