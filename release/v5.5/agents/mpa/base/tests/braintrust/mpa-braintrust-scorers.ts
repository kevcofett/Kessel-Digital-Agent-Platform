/**
 * MPA Copilot Instructions - Braintrust Evaluation Scorers
 * 
 * STUB FILE: Scorers are implemented directly in mpa-eval.ts and turn-scorers.ts.
 * This file is retained for reference but the actual scorer implementations
 * are in the evaluation runner files.
 * 
 * The project.scorers.create API used previously is not part of the current
 * Braintrust SDK (v0.0.160). Scorers are now defined as functions directly
 * in the Eval() call.
 */

// =============================================================================
// SCORER REFERENCE (Implementations in turn-scorers.ts)
// =============================================================================

/**
 * CODE-BASED SCORERS (Deterministic):
 * - response-length: Checks if response is under 75 words
 * - single-question: Ensures only one question at a time  
 * - acronym-definition: Validates acronyms are defined before use
 * - source-citation: Checks for proper source citations
 * - step-boundary: Validates one-step-per-turn rule
 * - calculation-presence: Checks for proactive calculations
 * - response-formatting: Validates formatting constraints
 * - idk-protocol: Validates I-don't-know disclosure
 * 
 * LLM-BASED SCORERS (Nuanced evaluation):
 * - adaptive-sophistication: Matches tone to user expertise
 * - proactive-intelligence: Flags risks and opportunities
 * - teaching-behavior: Provides educational context
 * - progress-over-perfection: Advances with partial data
 * - risk-opportunity-flagging: Identifies risks proactively
 * - audience-sizing-completeness: Validates audience sizing tables
 * 
 * See turn-scorers.ts for full implementations.
 */

export const SCORER_INFO = {
  version: '6.0',
  note: 'Scorers implemented in turn-scorers.ts and mpa-eval.ts',
  totalScorers: 14,
};

export default SCORER_INFO;
