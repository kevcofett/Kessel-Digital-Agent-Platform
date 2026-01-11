/**
 * Teaching Behavior Scorer (12% weight)
 *
 * TIER 1: CORE QUALITY BEHAVIOR
 *
 * Evaluates: Does agent TEACH the user why decisions matter, not just interrogate?
 */

import { callLLMJudge, JUDGE_PROMPTS, type JudgeResult } from './llm-judge.js';

export interface TeachingBehaviorContext {
  agentResponse: string;
  stepNumber: number;
  userMessage?: string;
}

/**
 * Quick code-based check for teaching indicators
 */
function hasTeachingIndicators(response: string): {
  hasWhyExplanation: boolean;
  hasFramework: boolean;
  hasConnection: boolean;
  hasContext: boolean;
} {
  // Explains WHY
  const whyPatterns = [
    /because/i,
    /this matters/i,
    /the reason/i,
    /why (this|we|I)/i,
    /so (that|we can)/i,
    /in order to/i,
  ];

  // Provides frameworks
  const frameworkPatterns = [
    /first.*then/i,
    /step \d/i,
    /before we.*we need/i,
    /the key is/i,
    /the goal is/i,
    /think of it as/i,
  ];

  // Connects to downstream
  const connectionPatterns = [
    /this (will|helps)/i,
    /once we (know|have)/i,
    /which (will|allows)/i,
    /informs/i,
    /shapes/i,
    /determines/i,
  ];

  // Business context
  const contextPatterns = [
    /for your (business|campaign|goals)/i,
    /given your/i,
    /based on what you/i,
    /in your (industry|vertical|market)/i,
  ];

  return {
    hasWhyExplanation: whyPatterns.some(p => p.test(response)),
    hasFramework: frameworkPatterns.some(p => p.test(response)),
    hasConnection: connectionPatterns.some(p => p.test(response)),
    hasContext: contextPatterns.some(p => p.test(response)),
  };
}

/**
 * Check for interrogation patterns (negative indicator)
 */
function hasInterrogationPatterns(response: string): boolean {
  // Multiple questions without context
  const questionCount = (response.match(/\?/g) || []).length;

  // Checklist-style patterns
  const checklistPatterns = [
    /what('s| is) your.*\?.*what('s| is) your/i,
    /let me (gather|collect) (some )?information/i,
    /I need to (know|understand)/i,
  ];

  const hasChecklist = checklistPatterns.some(p => p.test(response));

  return questionCount >= 3 || hasChecklist;
}

/**
 * Score teaching behavior
 */
export async function scoreTeachingBehavior(
  ctx: TeachingBehaviorContext
): Promise<JudgeResult> {
  const indicators = hasTeachingIndicators(ctx.agentResponse);
  const isInterrogating = hasInterrogationPatterns(ctx.agentResponse);

  // Count teaching indicators present
  const indicatorCount = Object.values(indicators).filter(Boolean).length;

  // Quick scoring for clear cases
  if (indicatorCount >= 3 && !isInterrogating) {
    return {
      score: 1.0,
      rationale: 'Strong teaching behavior: explains why, provides framework, connects to downstream',
    };
  }

  if (indicatorCount >= 2 && !isInterrogating) {
    return {
      score: 0.75,
      rationale: 'Good teaching with some explanation and context',
    };
  }

  if (isInterrogating && indicatorCount === 0) {
    return {
      score: 0.25,
      rationale: 'Interrogation pattern detected - multiple questions without strategic framing',
    };
  }

  // Use LLM for nuanced cases
  try {
    const result = await callLLMJudge(JUDGE_PROMPTS['teaching-behavior'], {
      agent_response: ctx.agentResponse,
      step_number: ctx.stepNumber,
    });
    return result;
  } catch (error) {
    // Fallback to code-based scoring
    if (indicatorCount >= 1) {
      return { score: 0.5, rationale: 'Some teaching elements present' };
    }
    return { score: 0.5, rationale: 'Procedural but not clearly teaching or interrogating' };
  }
}

export default scoreTeachingBehavior;
