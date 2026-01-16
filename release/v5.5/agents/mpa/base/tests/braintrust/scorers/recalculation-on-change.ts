/**
 * Recalculation on Change Scorer (8% weight)
 *
 * TIER 1: CORE QUALITY BEHAVIOR
 *
 * Evaluates: When user provides new data that changes prior calculations,
 * does agent immediately recalculate and show updated projections?
 */

import { callLLMJudge, JUDGE_PROMPTS, type JudgeResult } from './llm-judge.js';

export interface DataChange {
  field: string;
  oldValue: number | string;
  newValue: number | string;
  turnDetected: number;
}

export interface RecalculationContext {
  agentResponse: string;
  dataChange?: DataChange;
  priorCalculation?: string;
}

// Fields that should trigger recalculation
const RECALCULATION_TRIGGERS: Record<string, string[]> = {
  budget: ['impliedCAC', 'channelAllocations', 'geoSpend', 'testBudget'],
  volumeTarget: ['impliedCAC', 'audienceSizing', 'conversionRate'],
  audienceSize: ['reachProjections', 'frequencyEstimates'],
  geoAllocation: ['spendPerMarket', 'regionalCAC'],
  timeline: ['pacing', 'weeklySpend', 'flighting'],
};

/**
 * Detect if user message contains a data change
 */
export function detectDataChange(
  priorData: Record<string, unknown>,
  currentUserMessage: string
): DataChange | null {
  // Budget change patterns
  const budgetPatterns = [
    /(?:budget|spending)\s+(?:is|to|of)?\s*\$?([\d,]+[KkMm]?)/i,
    /\$?([\d,]+[KkMm]?)\s+(?:budget|to spend)/i,
    /(?:actually|instead|changed?\s+to)\s+\$?([\d,]+[KkMm]?)/i,
  ];

  // Volume target patterns
  const volumePatterns = [
    /([\d,]+)\s+(?:customers?|conversions?|leads?|sales?)/i,
    /target(?:ing)?\s+(?:of\s+)?([\d,]+)/i,
    /(?:want|need|aiming for)\s+([\d,]+)/i,
  ];

  // Check for budget changes
  for (const pattern of budgetPatterns) {
    const match = currentUserMessage.match(pattern);
    if (match) {
      const newValue = parseNumericValue(match[1]);
      const oldValue = priorData.budget as number;
      if (oldValue && Math.abs(newValue - oldValue) / oldValue > 0.05) {
        return {
          field: 'budget',
          oldValue,
          newValue,
          turnDetected: -1, // Will be set by caller
        };
      }
    }
  }

  // Check for volume changes
  for (const pattern of volumePatterns) {
    const match = currentUserMessage.match(pattern);
    if (match) {
      const newValue = parseNumericValue(match[1]);
      const oldValue = (priorData.volumeTarget || priorData.customers || priorData.conversions) as number;
      if (oldValue && Math.abs(newValue - oldValue) / oldValue > 0.05) {
        return {
          field: 'volumeTarget',
          oldValue,
          newValue,
          turnDetected: -1,
        };
      }
    }
  }

  return null;
}

/**
 * Parse numeric value from string (handles K, M suffixes)
 */
function parseNumericValue(str: string): number {
  const cleaned = str.replace(/[,$]/g, '');
  const match = cleaned.match(/([\d.]+)([KkMm])?/);
  if (!match) return 0;

  let value = parseFloat(match[1]);
  const suffix = match[2]?.toUpperCase();

  if (suffix === 'K') value *= 1000;
  if (suffix === 'M') value *= 1000000;

  return value;
}

/**
 * Check if response shows recalculation
 */
function hasRecalculation(response: string): {
  showsNewMath: boolean;
  showsDelta: boolean;
  acknowledgesImpact: boolean;
} {
  // New calculation patterns
  const mathPatterns = [
    /\$[\d,]+[KkMm]?\s*[\/÷]\s*[\d,]+/,
    /=\s*\$[\d,.]+/,
    /now\s+\$[\d,]+/i,
    /updated?\s+(?:to|projection)/i,
  ];

  // Delta/comparison patterns
  const deltaPatterns = [
    /(?:from|was)\s+\$?[\d,]+\s+to\s+\$?[\d,]+/i,
    /chang(?:es?|ed|ing)/i,
    /(?:instead|rather than)\s+\$?[\d,]+/i,
    /(?:up|down)\s+(?:from|by)/i,
    /\d+%?\s+(?:more|less|better|worse)/i,
  ];

  // Impact acknowledgment patterns
  const impactPatterns = [
    /this (?:means|changes|affects|impacts)/i,
    /(?:requires|needs)/i,
    /(?:aggressive|conservative|achievable)/i,
    /to hit this/i,
    /that's\s+(?:more|less)/i,
  ];

  return {
    showsNewMath: mathPatterns.some(p => p.test(response)),
    showsDelta: deltaPatterns.some(p => p.test(response)),
    acknowledgesImpact: impactPatterns.some(p => p.test(response)),
  };
}

/**
 * Check if response just acknowledges without recalculating
 */
function justAcknowledges(response: string): boolean {
  const acknowledgmentOnly = [
    /^(?:got it|okay|understood|noted)/i,
    /(?:got it|okay|understood),?\s+(?:so|the)\s+budget/i,
    /I'?(?:ll|ve) noted/i,
  ];

  const hasAcknowledgment = acknowledgmentOnly.some(p => p.test(response));
  const recalc = hasRecalculation(response);

  return hasAcknowledgment && !recalc.showsNewMath;
}

/**
 * Score recalculation on change
 */
export async function scoreRecalculationOnChange(
  ctx: RecalculationContext
): Promise<JudgeResult> {
  // If no data change detected, not applicable
  if (!ctx.dataChange) {
    return {
      score: 1.0,
      rationale: 'Not applicable - no data change detected',
    };
  }

  const recalc = hasRecalculation(ctx.agentResponse);
  const indicatorCount = Object.values(recalc).filter(Boolean).length;

  // Full recalculation
  if (indicatorCount === 3) {
    return {
      score: 1.0,
      rationale: `Excellent: shows new calculation, compares to prior (${ctx.dataChange.field} changed), explains impact`,
    };
  }

  // Partial recalculation
  if (recalc.showsNewMath && (recalc.showsDelta || recalc.acknowledgesImpact)) {
    return {
      score: 0.7,
      rationale: 'Recalculates but missing comparison to prior state or full impact explanation',
    };
  }

  // Just acknowledges
  if (justAcknowledges(ctx.agentResponse)) {
    return {
      score: 0.3,
      rationale: `Acknowledges ${ctx.dataChange.field} change but doesn't recalculate`,
    };
  }

  // No acknowledgment at all - use LLM for verification
  try {
    const result = await callLLMJudge(JUDGE_PROMPTS['recalculation-on-change'], {
      agent_response: ctx.agentResponse,
      field: ctx.dataChange.field,
      old_value: ctx.dataChange.oldValue,
      new_value: ctx.dataChange.newValue,
    });
    return result;
  } catch (error) {
    // Check if any math is shown
    if (recalc.showsNewMath) {
      return { score: 0.5, rationale: 'Some calculation shown but context unclear' };
    }
    return { score: 0.0, rationale: 'Data change ignored - no recalculation shown' };
  }
}

export default scoreRecalculationOnChange;
