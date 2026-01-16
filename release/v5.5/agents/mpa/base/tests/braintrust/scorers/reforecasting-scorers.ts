/**
 * Reforecasting Scorers for Multi-Turn MPA Evaluation
 *
 * Evaluates how well the agent handles mid-conversation data changes.
 * When a user revises inputs (budget, volume, timeline), the agent should:
 * 1. Acknowledge the change
 * 2. Recalculate affected metrics
 * 3. Explain the strategic impact
 * 4. Recommend actions to address
 */

import {
  ConversationTurn,
  TurnScore,
  DataChange,
} from "../mpa-multi-turn-types.js";

// =============================================================================
// DATA REVISION TRACKING
// =============================================================================

/**
 * Data revision record for tracking agent response to changes
 */
export interface DataRevisionRecord {
  turnNumber: number;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  agentAcknowledged: boolean;
  agentRecalculated: boolean;
  agentExplainedImpact: boolean;
  agentRecommendedAction: boolean;
}

// =============================================================================
// DETECTION HELPERS
// =============================================================================

/**
 * Field-specific patterns for detecting acknowledgment
 */
const ACKNOWLEDGMENT_PATTERNS: Record<string, RegExp[]> = {
  budget: [
    /budget.*(?:increased|decreased|changed|revised|updated|adjusted)/i,
    /(?:new|updated|revised).*budget/i,
    /\$[\d,]+[kKmM]?.*(?:more|less|instead|now)/i,
    /(?:from|was).*\$[\d,]+.*(?:to|now).*\$[\d,]+/i,
  ],
  volumeTarget: [
    /(?:target|goal).*(?:increased|decreased|changed|revised)/i,
    /(?:new|updated|revised).*(?:target|goal|volume)/i,
    /(?:from|was).*[\d,]+.*(?:to|now).*[\d,]+.*(?:customer|lead|conversion)/i,
  ],
  timeline: [
    /timeline.*(?:compressed|shortened|extended|changed)/i,
    /(?:new|updated|revised).*timeline/i,
    /(?:from|was).*(?:\d+).*(?:month|week).*(?:to|now).*(?:\d+)/i,
  ],
  cac: [
    /(?:cac|cost per acquisition).*(?:changed|revised|updated)/i,
    /efficiency.*(?:constraint|requirement|target).*(?:changed|different)/i,
  ],
};

/**
 * Detect if agent acknowledged the data change
 */
function detectsChangeAcknowledgment(
  response: string,
  field: string
): boolean {
  // Field-specific patterns
  const fieldPatterns = ACKNOWLEDGMENT_PATTERNS[field] || [];
  for (const pattern of fieldPatterns) {
    if (pattern.test(response)) return true;
  }

  // Generic acknowledgment patterns
  const genericPatterns = [
    /(?:i see|i notice|i understand).*(?:changed|updated|revised|increased|decreased)/i,
    /(?:great|thanks|okay).*(?:so|,).*(?:now|updated|new)/i,
    /(?:let me|let's).*(?:update|recalculate|adjust).*(?:based on|given|with)/i,
  ];

  for (const pattern of genericPatterns) {
    if (pattern.test(response)) return true;
  }

  return false;
}

/**
 * Detect if agent recalculated affected metrics
 */
function detectsRecalculation(response: string, field: string): boolean {
  // Look for calculation patterns
  const calculationPatterns = [
    /\$[\d,]+[kKmM]?\s*[÷/]\s*[\d,]+\s*=\s*\$[\d,]+/i, // $500K / 10K = $50
    /[\d,]+\s*[x×*]\s*[\d,.]+\s*=\s*[\d,]+/i, // 10,000 x 1.5 = 15,000
    /(?:now|updated|new).*(?:implies|means|gives us|results in)/i,
    /(?:recalculat|re-calculat|updated.*calculation|revised.*projection)/i,
    /(?:this changes|this affects|this means).*(?:to|from.*to)/i,
    /(?:previous|before|was).*(?:now|becomes|is now)/i,
  ];

  // Field-specific recalculation indicators
  const fieldIndicators: Record<string, RegExp[]> = {
    budget: [
      /(?:cac|cost per).*(?:now|becomes|drops to|increases to)/i,
      /(?:allocation|spend).*(?:changes|adjusted|updated)/i,
    ],
    volumeTarget: [
      /(?:efficiency|cac).*(?:requirement|target).*(?:changes|now)/i,
      /(?:reach|audience).*(?:sizing|requirement)/i,
    ],
    timeline: [
      /(?:monthly|weekly).*(?:spend|pacing).*(?:changes|now)/i,
      /(?:runway|ramp).*(?:compressed|adjusted)/i,
    ],
  };

  for (const pattern of calculationPatterns) {
    if (pattern.test(response)) return true;
  }

  const indicators = fieldIndicators[field] || [];
  for (const pattern of indicators) {
    if (pattern.test(response)) return true;
  }

  return false;
}

/**
 * Detect if agent explained strategic impact
 */
function detectsImpactExplanation(response: string): boolean {
  const impactPatterns = [
    /(?:this means|this implies|this enables|this opens up)/i,
    /(?:impact|implication|consequence|effect)/i,
    /(?:strategically|from a strategy perspective)/i,
    /(?:good news|bad news|the challenge is|the opportunity is)/i,
    /(?:now we can|now we should|this allows us to)/i,
    /(?:more aggressive|more conservative|more flexibility|less room)/i,
    /(?:trade-?off|balance|tension)/i,
    /(?:realistic|achievable|stretch|aggressive)/i,
  ];

  for (const pattern of impactPatterns) {
    if (pattern.test(response)) return true;
  }

  return false;
}

/**
 * Detect if agent recommended actions
 */
function detectsActionRecommendation(response: string): boolean {
  const actionPatterns = [
    /(?:i recommend|i suggest|i'd recommend|i would suggest)/i,
    /(?:we should|we could|we might want to|let's)/i,
    /(?:consider|worth considering|option would be)/i,
    /(?:next step|moving forward|going forward)/i,
    /(?:adjust|revise|update|modify).*(?:our|the|your)/i,
    /(?:reallocate|shift|move).*(?:budget|spend|focus)/i,
    /(?:prioritize|deprioritize|focus on|pull back from)/i,
  ];

  for (const pattern of actionPatterns) {
    if (pattern.test(response)) return true;
  }

  return false;
}

// =============================================================================
// MAIN REFORECASTING SCORER
// =============================================================================

/**
 * Score how well the agent handles data changes (reforecasting quality)
 *
 * Evaluates:
 * - Acknowledgment of the change (25%)
 * - Recalculation of affected metrics (25%)
 * - Explanation of strategic impact (25%)
 * - Recommendation of actions (25%)
 *
 * If no data changes occurred, returns 1.0 (perfect - nothing to reforecast)
 */
export function scoreReforecasting(
  turns: ConversationTurn[],
  dataRevisions: DataRevisionRecord[]
): TurnScore {
  // If no data revisions occurred, no reforecasting was needed
  if (!dataRevisions || dataRevisions.length === 0) {
    return {
      scorer: "reforecasting-quality",
      score: 1.0,
      metadata: { revisionCount: 0, status: "no_revisions_needed" },
      scope: "conversation",
    };
  }

  let totalScore = 0;
  const revisionDetails: Array<{
    field: string;
    acknowledged: boolean;
    recalculated: boolean;
    explainedImpact: boolean;
    recommendedAction: boolean;
    score: number;
  }> = [];

  for (const revision of dataRevisions) {
    // Find the agent's response immediately after the data change
    const responseAfterChange = turns.find(
      (t) => t.turnNumber > revision.turnNumber
    );

    if (!responseAfterChange) {
      // Data change happened but no subsequent agent response
      revisionDetails.push({
        field: revision.field,
        acknowledged: false,
        recalculated: false,
        explainedImpact: false,
        recommendedAction: false,
        score: 0,
      });
      continue;
    }

    const response = responseAfterChange.agentResponse;
    let revisionScore = 0;

    // Check each behavior (25% each)
    const acknowledged = detectsChangeAcknowledgment(response, revision.field);
    const recalculated = detectsRecalculation(response, revision.field);
    const explainedImpact = detectsImpactExplanation(response);
    const recommendedAction = detectsActionRecommendation(response);

    if (acknowledged) revisionScore += 0.25;
    if (recalculated) revisionScore += 0.25;
    if (explainedImpact) revisionScore += 0.25;
    if (recommendedAction) revisionScore += 0.25;

    totalScore += revisionScore;

    revisionDetails.push({
      field: revision.field,
      acknowledged,
      recalculated,
      explainedImpact,
      recommendedAction,
      score: revisionScore,
    });
  }

  const finalScore = totalScore / dataRevisions.length;

  return {
    scorer: "reforecasting-quality",
    score: finalScore,
    metadata: {
      revisionCount: dataRevisions.length,
      revisions: revisionDetails,
      averageScore: finalScore,
    },
    scope: "conversation",
  };
}

/**
 * Create data revision records from triggered data changes
 *
 * Call this after the user simulator triggers a data change to create
 * the revision record for tracking agent response.
 */
export function createDataRevisionRecord(
  turnNumber: number,
  dataChange: DataChange
): DataRevisionRecord {
  return {
    turnNumber,
    field: dataChange.field,
    oldValue: dataChange.oldValue,
    newValue: dataChange.newValue,
    agentAcknowledged: false,
    agentRecalculated: false,
    agentExplainedImpact: false,
    agentRecommendedAction: false,
  };
}

/**
 * Analyze agent response and update revision record
 *
 * Call this after getting the agent's response to a data change
 * to record how well the agent handled it.
 */
export function updateRevisionRecord(
  record: DataRevisionRecord,
  agentResponse: string
): DataRevisionRecord {
  return {
    ...record,
    agentAcknowledged: detectsChangeAcknowledgment(
      agentResponse,
      record.field
    ),
    agentRecalculated: detectsRecalculation(agentResponse, record.field),
    agentExplainedImpact: detectsImpactExplanation(agentResponse),
    agentRecommendedAction: detectsActionRecommendation(agentResponse),
  };
}
