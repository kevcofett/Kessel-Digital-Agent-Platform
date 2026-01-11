/**
 * Scorers Module Exports
 *
 * Provides the base scorer interface and common scorer implementations.
 * Agents extend these to create domain-specific scorers.
 */

// Base scorer
export {
  BaseScorer,
  FunctionalScorer,
  createScorer,
  type ScorerConfig,
} from './base-scorer.js';

// LLM judge
export {
  LLMJudgeScorer,
  createLLMJudge,
  type LLMJudgeCriteria,
  type LLMJudgeConfig,
} from './llm-judge.js';
