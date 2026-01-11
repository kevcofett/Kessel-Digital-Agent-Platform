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
export abstract class BaseScorer {
  protected config: ScorerConfig;

  constructor(config: ScorerConfig) {
    this.config = config;
  }

  /**
   * Score a conversation transcript
   */
  abstract score(transcript: ConversationTranscript): Promise<ScorerResult>;

  /**
   * Get the scorer name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get the scorer weight
   */
  getWeight(): number {
    return this.config.weight;
  }

  /**
   * Check if this scorer is required
   */
  isRequired(): boolean {
    return this.config.required ?? false;
  }

  /**
   * Check if a score passes the threshold
   */
  isPassing(score: number): boolean {
    const threshold = this.config.passingThreshold ?? 0.6;
    return score >= threshold;
  }

  /**
   * Helper to create a result
   */
  protected createResult(
    score: number,
    explanation: string,
    options?: {
      breakdown?: Record<string, number>;
      issues?: string[];
      metadata?: Record<string, unknown>;
    }
  ): ScorerResult {
    return {
      name: this.config.name,
      score: Math.max(0, Math.min(1, score)),  // Clamp to 0-1
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
  private scoreFn: (transcript: ConversationTranscript) => Promise<ScorerResult>;

  constructor(
    config: ScorerConfig,
    scoreFn: (transcript: ConversationTranscript) => Promise<ScorerResult>
  ) {
    super(config);
    this.scoreFn = scoreFn;
  }

  async score(transcript: ConversationTranscript): Promise<ScorerResult> {
    return this.scoreFn(transcript);
  }
}

/**
 * Create a simple scorer from a function
 */
export function createScorer(
  name: string,
  weight: number,
  scoreFn: (transcript: ConversationTranscript) => Promise<ScorerResult>
): BaseScorer {
  return new FunctionalScorer({ name, weight }, scoreFn);
}

export default BaseScorer;
