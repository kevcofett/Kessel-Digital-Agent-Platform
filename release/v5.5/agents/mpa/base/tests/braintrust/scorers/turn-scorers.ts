/**
 * Per-Turn Scorers for Multi-Turn MPA Evaluation
 *
 * Scorers that are applied to each individual turn.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  TurnScore,
  StepTrackingState,
  GRADE_SCORES,
} from "../mpa-multi-turn-types.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use Haiku for LLM judges when FAST_SCORING=true (10x faster, minimal quality loss)
const SCORER_MODEL = process.env.FAST_SCORING === "true"
  ? "claude-3-5-haiku-20241022"
  : "claude-sonnet-4-20250514";

// =============================================================================
// CODE-BASED SCORERS
// =============================================================================

/**
 * Score response length
 *
 * Scoring is lenient for longer responses as long as they add value.
 * - Under 100 words: optimal (1.0)
 * - 100-200 words: acceptable (0.8)
 * - 200-300 words: slightly verbose (0.5)
 * - Over 300 words: too long (0.2)
 */
export function scoreResponseLength(output: string): TurnScore {
  const wordCount = output.trim().split(/\s+/).length;
  let score = 0;
  let status = "too_long";

  if (wordCount <= 100) {
    score = 1.0;
    status = "optimal";
  } else if (wordCount <= 200) {
    score = 0.8;
    status = "acceptable";
  } else if (wordCount <= 300) {
    score = 0.5;
    status = "slightly_verbose";
  } else {
    score = 0.2;
    status = "too_long";
  }

  return {
    scorer: "response-length",
    score,
    metadata: { wordCount, status },
    scope: "turn",
  };
}

/**
 * Score question discipline
 *
 * Two-part questions are acceptable when focused on the immediate step.
 * - 0-1 questions: optimal (1.0)
 * - 2 questions: acceptable (0.8) - allows focused two-part questions
 * - 3 questions: slightly excessive (0.4)
 * - 4+ questions: too many (0)
 */
export function scoreSingleQuestion(output: string): TurnScore {
  const questionMarks = (output.match(/\?/g) || []).length;
  let score = 0;

  if (questionMarks <= 1) {
    score = 1.0;
  } else if (questionMarks === 2) {
    score = 0.8;
  } else if (questionMarks === 3) {
    score = 0.4;
  } else {
    score = 0;
  }

  return {
    scorer: "single-question",
    score,
    metadata: { questionCount: questionMarks },
    scope: "turn",
  };
}

/**
 * Score step boundary compliance (no channel RECOMMENDATIONS in Steps 1-2)
 *
 * This scorer detects actual channel recommendations, not just mentions.
 * - "I recommend Facebook ads" = VIOLATION
 * - "You should allocate 40% to Google" = VIOLATION
 * - "This gives flexibility for channel mix" = OK (general observation)
 * - "That pacing makes sense" = OK (acknowledging user input)
 */
export function scoreStepBoundary(
  output: string,
  currentStep: number
): TurnScore {
  if (currentStep > 2) {
    return {
      scorer: "step-boundary",
      score: 1.0,
      metadata: { status: "not_applicable" },
      scope: "turn",
    };
  }

  // Only flag actual channel/budget RECOMMENDATIONS, not mentions
  const forbiddenPatterns = [
    // Recommending specific channels
    /\b(recommend|suggest|propose|advise)\b.{0,30}\b(facebook|google|tiktok|instagram|linkedin|meta|programmatic|display|ctv|youtube)\b/i,
    // Should/would/could + action + channel
    /\b(should|would|could)\s+(run|use|try|test|launch|start)\s+.{0,20}\b(facebook|google|tiktok|instagram|linkedin|meta)\b/i,
    // Percentage allocations to specific channels
    /\b(\d+%)\s*(to|for|of|on)\s*.{0,10}\b(facebook|google|social|search|display|programmatic)\b/i,
    // Budget allocations to channels
    /\b(allocate|invest|spend|put)\s+.{0,20}\b(facebook|google|tiktok|social|search|display)\b/i,
    // Creative recommendations (not just mentions)
    /\b(creative|messaging|ad copy)\s+(should|needs to|must|will need)\b/i,
  ];

  const violations = forbiddenPatterns.filter((p) => p.test(output));

  return {
    scorer: "step-boundary",
    score: violations.length === 0 ? 1.0 : 0,
    metadata: { currentStep, violationCount: violations.length },
    scope: "turn",
  };
}

/**
 * Score source citation (data claims should have sources)
 *
 * The agent MUST cite one of five sources for every data claim:
 * 1. Knowledge Base - data from KB documents
 * 2. Websearch - fresh data from web search (must include link)
 * 3. API Call - data from direct API call
 * 4. User Provided - data the user gave
 * 5. Benchmark - broad industry data from stale/general websearch (must include link)
 */
export function scoreSourceCitation(output: string): TurnScore {
  const hasNumbers =
    /\$[\d,]+|\d+%|\d+\s*(dollars|percent|customers|leads)/i.test(output);

  if (!hasNumbers) {
    return {
      scorer: "source-citation",
      score: 1.0,
      metadata: { status: "no_data_claims" },
      scope: "turn",
    };
  }

  // The five required source types (explicit citations)
  const explicitSourcePatterns = [
    /based on knowledge base/i,
    /based on websearch/i,
    /based on web search/i,
    /based on api call/i,
    /based on user provided/i,
    /based on benchmark/i,
    // Also accept shorter forms
    /based on kb/i,
    /\[source:/i, // Link citation format
  ];

  // Implicit contextual patterns (acceptable but lower score)
  const implicitPatterns = [
    /you (mentioned|said|told|provided|shared)/i,
    /your (budget|target|goal|kpi|objective)/i,
    /with (a |your )\$[\d,]+/i,
    /at \$[\d,]+ per/i,
    /the \$[\d,]+ you/i,
    /that('s| is) \$[\d,]+/i,
    /divid(ed|ing) by/i,
    /equals|= \$/i,
    /let me (run|do|calculate)/i,
    /industry.*typical/i,
    /market.*shows/i,
    /typical.*range/i,
    // Additional patterns for benchmark citations
    /typical(ly)?\s+(runs?|costs?|is|are|around)/i,
    /benchmark(s)?\s+(show|suggest|indicate|run|are)/i,
    /for\s+\w+\s*(,|where)?\s*(typical|benchmark)/i,
    /\w+\s+benchmarks?\s+(run|show|are)/i,
    /where\s+typical/i,
    // More implicit patterns
    /in line with\s+(best\s+)?practice/i,
    /roughly\s+\d+/i,
    /approximately\s+\d+/i,
    /about\s+\d+-?\d*%/i,
    /around\s+\d+/i,
  ];

  const hasExplicitSource = explicitSourcePatterns.some((p) => p.test(output));
  const hasImplicitSource = implicitPatterns.some((p) => p.test(output));

  let score = 0;
  if (hasExplicitSource) {
    score = 1.0;
  } else if (hasImplicitSource) {
    score = 0.8;
  } else {
    score = 0.3; // Partial credit - numbers in response but no clear source
  }

  return {
    scorer: "source-citation",
    score,
    metadata: { hasDataClaims: true, hasExplicitSource, hasImplicitSource },
    scope: "turn",
  };
}

/**
 * Score acronym definition (acronyms must be defined on first use)
 */
export function scoreAcronymDefinition(output: string): TurnScore {
  const acronymPatterns: { acronym: string; definition: RegExp }[] = [
    { acronym: "CAC", definition: /customer acquisition cost/i },
    { acronym: "ROAS", definition: /return on ad spend/i },
    { acronym: "LTV", definition: /lifetime value/i },
    { acronym: "CPM", definition: /cost per (thousand|mille)/i },
    { acronym: "CPA", definition: /cost per acquisition/i },
    { acronym: "CPC", definition: /cost per click/i },
    { acronym: "CTR", definition: /click.?through rate/i },
  ];

  const usedAcronyms: string[] = [];
  const undefinedAcronyms: string[] = [];

  for (const { acronym, definition } of acronymPatterns) {
    const acronymRegex = new RegExp(`\\b${acronym}\\b`, "g");
    if (acronymRegex.test(output)) {
      usedAcronyms.push(acronym);
      if (!definition.test(output)) {
        undefinedAcronyms.push(acronym);
      }
    }
  }

  if (usedAcronyms.length === 0) {
    return {
      scorer: "acronym-definition",
      score: 1.0,
      metadata: { status: "no_acronyms" },
      scope: "turn",
    };
  }

  const score =
    undefinedAcronyms.length === 0
      ? 1.0
      : 1 - undefinedAcronyms.length / usedAcronyms.length;

  return {
    scorer: "acronym-definition",
    score,
    metadata: { usedAcronyms, undefinedAcronyms },
    scope: "turn",
  };
}

/**
 * Score IDK protocol compliance
 */
export function scoreIdkProtocol(
  input: string,
  output: string
): TurnScore {
  const userSaysIDK =
    /i don'?t know|not sure|no idea|uncertain|haven'?t figured/i.test(input);

  if (!userSaysIDK) {
    return {
      scorer: "idk-protocol",
      score: 1.0,
      metadata: { status: "not_applicable" },
      scope: "turn",
    };
  }

  const modelsAssumption =
    /i('ll| will) (model|use|assume)|based on|using.*benchmark|let me model/i.test(
      output
    );
  const citesSource =
    /based on (kb|benchmark|industry|research|typical)/i.test(output);
  const offersRefinement =
    /(you can|feel free to|adjust|refine) (this |it )?anytime|(can adjust|can refine)/i.test(
      output
    );
  const movesOn = /moving on|next|let'?s|now for/i.test(output);
  const keepsPushing =
    /what is your|can you tell|do you have|please provide|must have/i.test(
      output
    );

  let score = 0;
  if (modelsAssumption) score += 0.3;
  if (citesSource) score += 0.3;
  if (offersRefinement) score += 0.2;
  if (movesOn) score += 0.2;
  if (keepsPushing) score -= 0.5;

  return {
    scorer: "idk-protocol",
    score: Math.max(0, Math.min(1, score)),
    metadata: {
      modelsAssumption,
      citesSource,
      offersRefinement,
      movesOn,
      keepsPushing,
    },
    scope: "turn",
  };
}

// =============================================================================
// LLM-AS-JUDGE SCORERS
// =============================================================================

/**
 * Helper to get LLM grade
 */
async function llmJudge(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: SCORER_MODEL,
    max_tokens: 100,
    messages: [{ role: "user", content: prompt }],
  });
  const textBlock = response.content[0] as Anthropic.TextBlock;
  return textBlock.text.trim().toUpperCase().charAt(0);
}

/**
 * Score adaptive sophistication (language matches user level)
 */
export async function scoreAdaptiveSophistication(
  input: string,
  output: string,
  userLevel: string
): Promise<TurnScore> {
  const levelDescription =
    userLevel === "basic" || userLevel === "low"
      ? "basic (uses everyday language, no jargon)"
      : userLevel === "intermediate"
        ? "intermediate (knows some marketing terms)"
        : userLevel === "advanced" || userLevel === "expert" || userLevel === "high"
          ? "advanced (uses industry jargon fluently)"
          : "unknown";

  const prompt = `Rate if this agent response matches the user's sophistication level.

USER SOPHISTICATION: ${levelDescription}
USER INPUT: "${input}"
AGENT RESPONSE: "${output}"

Scoring criteria:
- For basic users: Agent should use plain language, avoid or define jargon
- For advanced users: Agent should match their vocabulary level

A = Perfectly matches user level
B = Mostly matches with minor misses
C = Sometimes mismatches complexity
D = Consistently wrong level
F = Ignores user signals

Reply with ONLY one letter: A, B, C, D, or F`;

  const letter = await llmJudge(prompt);
  const gradeScores: Record<string, number> = {
    A: 1.0,
    B: 0.8,
    C: 0.6,
    D: 0.3,
    F: 0,
  };

  return {
    scorer: "adaptive-sophistication",
    score: gradeScores[letter] ?? 0.5,
    metadata: { grade: letter, userLevel },
    scope: "turn",
  };
}

/**
 * Score proactive intelligence (does math when data is available)
 */
export async function scoreProactiveIntelligence(
  input: string,
  output: string,
  hasEnoughData: boolean
): Promise<TurnScore> {
  if (!hasEnoughData) {
    return {
      scorer: "proactive-intelligence",
      score: 1.0,
      metadata: { status: "not_applicable" },
      scope: "turn",
    };
  }

  const prompt = `The agent has enough data to calculate (budget and/or volume target). Does it DO THE MATH proactively?

USER INPUT: "${input}"
AGENT RESPONSE: "${output}"

A = Proactively calculates and shows math (e.g., "$250k / 5,000 = $50 per customer")
B = Shows some analysis but could show more math
C = Asks questions when it should be modeling/calculating
D = Only interrogates without any analysis
F = Completely fails to use available data

Reply with ONLY one letter: A, B, C, D, or F`;

  const letter = await llmJudge(prompt);

  return {
    scorer: "proactive-intelligence",
    score: GRADE_SCORES[letter] ?? 0.5,
    metadata: { grade: letter },
    scope: "turn",
  };
}

/**
 * Score progress over perfection (keeps momentum vs blocking)
 */
export async function scoreProgressOverPerfection(
  input: string,
  output: string
): Promise<TurnScore> {
  const prompt = `Does this agent maintain progress momentum vs getting stuck seeking perfect data?

USER INPUT: "${input}"
AGENT RESPONSE: "${output}"

A = Excellent momentum - makes progress with clear assumptions stated
B = Good progress - could be slightly more decisive
C = Sometimes gets stuck seeking perfect data before moving on
D = Frequently blocks progress with excessive questions
F = Completely stalls with endless questions

Reply with ONLY one letter: A, B, C, D, or F`;

  const letter = await llmJudge(prompt);

  return {
    scorer: "progress-over-perfection",
    score: GRADE_SCORES[letter] ?? 0.5,
    metadata: { grade: letter },
    scope: "turn",
  };
}

/**
 * Score risk and opportunity flagging
 *
 * Checks if the agent proactively identifies and communicates risks,
 * opportunities, or important considerations to the user.
 */
export async function scoreRiskOpportunityFlagging(
  input: string,
  output: string,
  currentStep: number
): Promise<TurnScore> {
  // Only score this when there's enough context (after Step 2)
  if (currentStep < 2) {
    return {
      scorer: "risk-opportunity-flagging",
      score: 1.0,
      metadata: { status: "not_applicable" },
      scope: "turn",
    };
  }

  const prompt = `Does this agent proactively flag risks, opportunities, or important considerations?

USER INPUT: "${input}"
AGENT RESPONSE: "${output}"

Look for:
- Identifying budget constraints or opportunities
- Flagging market conditions or seasonality
- Noting competitive considerations
- Highlighting potential efficiencies or risks
- Providing expert insights beyond what was asked

A = Proactively surfaces valuable risks/opportunities with clear rationale
B = Mentions some considerations but could be more insightful
C = Responds to user but misses obvious opportunities to add value
D = Purely transactional without expert insight
F = Provides misleading or unhelpful information

Reply with ONLY one letter: A, B, C, D, or F`;

  const letter = await llmJudge(prompt);

  return {
    scorer: "risk-opportunity-flagging",
    score: GRADE_SCORES[letter] ?? 0.5,
    metadata: { grade: letter, currentStep },
    scope: "turn",
  };
}

/**
 * Score proactive reforecasting behavior
 *
 * This scorer detects whether the agent proactively recalculates and
 * remodels when new data comes in. The agent should show math when:
 * 1. User provides new data that changes the model (budget, volume, etc.)
 * 2. Justifying why something is aggressive, conservative, or infeasible
 * 3. Validating feasibility against benchmarks
 *
 * The scorer does NOT require math on every turn - only when reforecasting
 * is triggered by new data or when math is needed to justify a conclusion.
 */
export function scoreCalculationPresence(
  output: string,
  input: string,
  previousInput?: string
): TurnScore {
  // Detect if user provided new quantitative data in this turn
  const newDataPatterns = [
    /\$[\d,]+k?/i, // Dollar amounts
    /[\d,]+\s*(customers?|leads?|users?|conversions?)/i, // Volume targets
    /[\d]+%/i, // Percentages
    /budget\s*(is|of|around|about)?\s*\$?[\d,]+/i, // Budget mentions
    /(target|goal|need|want)\s*(is|of)?\s*[\d,]+/i, // Targets
    /increase(d)?\s*(to|by)\s*[\d,]+/i, // Changes
    /decrease(d)?\s*(to|by)\s*[\d,]+/i, // Changes
    /(actually|instead|now|change(d)?)\s*.{0,20}[\d,]+/i, // Mid-stream changes
  ];

  const userProvidedNewData = newDataPatterns.some((p) => p.test(input));

  // Detect if agent is making claims that require justification
  const justificationNeededPatterns = [
    /\b(aggressive|ambitious|challenging|difficult|unrealistic)\b/i,
    /\b(conservative|safe|achievable|realistic)\b/i,
    /\b(above|below|higher|lower)\s*(than)?\s*(typical|benchmark|average)/i,
    /\b(won'?t|cannot|can'?t)\s*(hit|reach|achieve|meet)/i,
    /\b(need to|would need|requires?)\s*(increase|decrease|adjust)/i,
    /\b(gap|shortfall|deficit)\b/i,
  ];

  const agentMakesJustifiableClaim = justificationNeededPatterns.some((p) =>
    p.test(output)
  );

  // Patterns that indicate the agent DID show math/reforecasting
  const reforecastingPatterns = [
    /\$[\d,]+k?\s*[\/÷×x]\s*[\d,]+/i, // $X / Y or $X x Y
    /[\d,]+\s*[\/÷×x]\s*[\d,]+\s*=\s*[\$\d]/i, // X / Y = $Z
    /=\s*\$[\d,]+/i, // = $X (with dollar sign)
    /\bper\s+(customer|lead|acquisition|unit)\b/i, // Per-unit language
    /let me (update|recalculate|model|run)/i, // Reforecasting language
    /updat(e|ing)\s*(our|the)?\s*(projections?|numbers?|model)/i,
    /recalculat(e|ing)/i,
    /that (means|implies|equals|projects|works out)/i,
    /this (means|implies|equals|projects|works out)/i,
  ];

  const agentShowedMath = reforecastingPatterns.some((p) => p.test(output));

  // Scoring logic:
  // 1. If user provided new data AND agent showed reforecasting → 1.0
  // 2. If agent made justifiable claim AND showed math → 1.0
  // 3. If user provided new data but agent didn't reforecast → 0.5 (missed opportunity)
  // 4. If agent made claim without math justification → 0.5 (should show work)
  // 5. If neither triggered, calculation not needed → 1.0 (neutral pass)

  let score = 1.0; // Default: calculation not needed this turn
  let status = "not_triggered";

  if (userProvidedNewData) {
    if (agentShowedMath) {
      score = 1.0;
      status = "reforecasted_on_new_data";
    } else {
      score = 0.5;
      status = "missed_reforecast_opportunity";
    }
  } else if (agentMakesJustifiableClaim) {
    if (agentShowedMath) {
      score = 1.0;
      status = "justified_with_math";
    } else {
      score = 0.5;
      status = "claim_without_justification";
    }
  }

  return {
    scorer: "calculation-presence",
    score,
    metadata: {
      userProvidedNewData,
      agentMakesJustifiableClaim,
      agentShowedMath,
      status,
    },
    scope: "turn",
  };
}

// =============================================================================
// AGGREGATED SCORER
// =============================================================================

/**
 * Score a single turn with all applicable scorers
 */
export async function scoreTurn(
  userMessage: string,
  agentResponse: string,
  currentStep: number,
  stepState: StepTrackingState,
  userSophistication: string
): Promise<Record<string, TurnScore>> {
  const scores: Record<string, TurnScore> = {};

  // Code-based scorers (run synchronously)
  scores["response-length"] = scoreResponseLength(agentResponse);
  scores["single-question"] = scoreSingleQuestion(agentResponse);
  scores["step-boundary"] = scoreStepBoundary(agentResponse, currentStep);
  scores["source-citation"] = scoreSourceCitation(agentResponse);
  scores["acronym-definition"] = scoreAcronymDefinition(agentResponse);
  scores["idk-protocol"] = scoreIdkProtocol(userMessage, agentResponse);
  scores["calculation-presence"] = scoreCalculationPresence(agentResponse, userMessage);

  // LLM-based scorers (run in parallel)
  const hasEnoughData =
    stepState.collectedData[currentStep]?.minimumViableMet || false;

  const [adaptiveScore, proactiveScore, progressScore, riskScore] = await Promise.all([
    scoreAdaptiveSophistication(userMessage, agentResponse, userSophistication),
    scoreProactiveIntelligence(userMessage, agentResponse, hasEnoughData),
    scoreProgressOverPerfection(userMessage, agentResponse),
    scoreRiskOpportunityFlagging(userMessage, agentResponse, currentStep),
  ]);

  scores["adaptive-sophistication"] = adaptiveScore;
  scores["proactive-intelligence"] = proactiveScore;
  scores["progress-over-perfection"] = progressScore;
  scores["risk-opportunity-flagging"] = riskScore;

  return scores;
}

export default scoreTurn;
