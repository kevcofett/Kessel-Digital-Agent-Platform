/**
 * Feasibility Framing Scorer (10% weight)
 *
 * TIER 1: CORE QUALITY BEHAVIOR
 *
 * Evaluates: When target is aggressive vs benchmarks, does agent explicitly
 * call it out with evidence and path forward?
 */

import { callLLMJudge, JUDGE_PROMPTS, type JudgeResult } from './llm-judge.js';

export interface FeasibilityFramingContext {
  agentResponse: string;
  userTarget?: string | number;
  benchmarkRange?: string;
  hasCalculation?: boolean;
}

/**
 * Check if response contains feasibility language
 */
function hasFeasibilityLanguage(response: string): {
  hasExplicitFrame: boolean;
  hasBenchmarkCitation: boolean;
  hasPathForward: boolean;
} {
  // Explicit feasibility framing
  const explicitPatterns = [
    /aggressive/i,
    /ambitious/i,
    /conservative/i,
    /typical/i,
    /achievable/i,
    /realistic/i,
    /challenging/i,
    /stretch/i,
  ];

  // Benchmark citation
  const benchmarkPatterns = [
    /benchmark/i,
    /typical(ly)?\s+(runs?|ranges?|is)/i,
    /\$[\d,]+-\$?[\d,]+/,
    /based on (Knowledge Base|KB|industry)/i,
    /vs\s+\$[\d,]+/i,
    /compared to/i,
    /range of/i,
  ];

  // Path forward language
  const pathForwardPatterns = [
    /to (hit|achieve|reach) this/i,
    /you('ll| will) need/i,
    /this (requires|means)/i,
    /for this to work/i,
    /we can (achieve|hit)/i,
    /by (tightening|focusing|optimizing)/i,
  ];

  return {
    hasExplicitFrame: explicitPatterns.some(p => p.test(response)),
    hasBenchmarkCitation: benchmarkPatterns.some(p => p.test(response)),
    hasPathForward: pathForwardPatterns.some(p => p.test(response)),
  };
}

/**
 * Check for bad feasibility patterns
 */
function hasBadFeasibilityPatterns(response: string): boolean {
  const badPatterns = [
    /that (might|could) be (hard|difficult|challenging)(?! (but|however))/i,
    /I'm not sure (if|that)/i,
    /sounds reasonable/i,  // Accepting without evaluation
    /should work/i,  // Accepting without evidence
  ];

  return badPatterns.some(p => p.test(response));
}

/**
 * Score feasibility framing behavior
 */
export async function scoreFeasibilityFraming(
  ctx: FeasibilityFramingContext
): Promise<JudgeResult> {
  // If no target or calculation context, may not be applicable
  if (!ctx.hasCalculation && !ctx.userTarget) {
    return {
      score: 1.0,
      rationale: 'Not applicable - no efficiency calculation or target to frame',
    };
  }

  const indicators = hasFeasibilityLanguage(ctx.agentResponse);
  const hasBadPatterns = hasBadFeasibilityPatterns(ctx.agentResponse);

  // Count positive indicators
  const indicatorCount = Object.values(indicators).filter(Boolean).length;

  // Quick scoring for clear cases
  if (indicatorCount === 3 && !hasBadPatterns) {
    return {
      score: 1.0,
      rationale: 'Excellent feasibility framing: explicit label, benchmark citation, path forward',
    };
  }

  if (indicatorCount === 2 && !hasBadPatterns) {
    return {
      score: 0.75,
      rationale: `Good framing but missing ${!indicators.hasExplicitFrame ? 'explicit label' : !indicators.hasBenchmarkCitation ? 'benchmark citation' : 'path forward'}`,
    };
  }

  if (hasBadPatterns && indicatorCount === 0) {
    return {
      score: 0.25,
      rationale: 'Vague concerns without evidence or accepting target without validation',
    };
  }

  // Use LLM for nuanced evaluation
  try {
    const result = await callLLMJudge(JUDGE_PROMPTS['feasibility-framing'], {
      agent_response: ctx.agentResponse,
      user_target: String(ctx.userTarget || 'Not specified'),
      benchmark_range: ctx.benchmarkRange || 'Not available',
    });
    return result;
  } catch (error) {
    // Fallback
    if (indicatorCount >= 1) {
      return { score: 0.5, rationale: 'Some feasibility framing present' };
    }
    return { score: 0.5, rationale: 'Feasibility context unclear' };
  }
}

export default scoreFeasibilityFraming;
