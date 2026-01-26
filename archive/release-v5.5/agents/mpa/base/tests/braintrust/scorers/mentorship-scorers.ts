/**
 * Mentorship Scorers for Quality-Focused MPA Evaluation
 *
 * Phase 1 Scorers: Evaluate guidance quality, not just step completion.
 * These scorers measure whether the agent TAUGHT and GUIDED the user,
 * rather than simply interrogating them.
 */

import Anthropic from "@anthropic-ai/sdk";
import { TurnScore, GRADE_SCORES } from "../mpa-multi-turn-types.js";

// Lazy initialization - only create client when needed
let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

// =============================================================================
// LLM-AS-JUDGE PROMPTS
// =============================================================================

/**
 * Judge prompt for teaching behavior vs interrogation
 */
const TEACHING_BEHAVIOR_JUDGE_PROMPT = `You are evaluating whether an AI agent TAUGHT the user or merely INTERROGATED them.

TEACHING means:
- Explaining WHY a question matters before asking
- Providing context about how the answer will be used
- Connecting the question to business impact
- Offering examples or frameworks to guide the answer
- Showing expertise through explanation

INTERROGATION means:
- Asking questions without context
- Moving to next question immediately after answer
- No explanation of importance
- Checklist-style questioning
- Treating user as data source rather than partner

AGENT RESPONSE TO EVALUATE:
"""
{agent_response}
"""

Score 0.0-1.0 where:
- 1.0 = Rich teaching with clear "why" explanations and context
- 0.8 = Good teaching, explains most questions
- 0.6 = Some teaching, but could explain more
- 0.4 = Minimal teaching, mostly questions
- 0.2 = Mostly interrogation with occasional context
- 0.0 = Pure interrogation, no teaching at all

Return JSON: { "score": X.X, "rationale": "..." }`;

/**
 * Judge prompt for critical thinking / challenge behavior
 */
const CRITICAL_THINKING_JUDGE_PROMPT = `You are evaluating whether an AI agent CHALLENGED unrealistic inputs or accepted them without question.

GOOD CHALLENGE BEHAVIOR:
- Questions aggressive targets with reasoning
- Validates math when user provides numbers
- Flags unrealistic assumptions
- Compares targets to benchmarks
- Proposes alternatives if target is unachievable

POOR BEHAVIOR:
- Accepts any target without validation
- Doesn't compare to industry norms
- Ignores obvious mathematical errors
- Proceeds without questioning aggressive goals

USER INPUT:
"""
{user_input}
"""

AGENT RESPONSE:
"""
{agent_response}
"""

CONTEXT: User sophistication is {user_sophistication}, budget is {budget}, implied efficiency target is {implied_efficiency}.

Score 0.0-1.0 where:
- 1.0 = Appropriately challenges unrealistic inputs with clear reasoning and alternatives
- 0.8 = Challenges main issues, validates key assumptions
- 0.6 = Some validation, but misses obvious issues
- 0.4 = Minimal challenge, accepts most inputs without question
- 0.2 = Almost no challenge, even for clearly unrealistic targets
- 0.0 = Accepts everything without any validation

If the inputs appear reasonable, score based on whether the agent appropriately validated them (should still score 0.7+ for confirming realistic inputs).

Return JSON: { "score": X.X, "rationale": "..." }`;

/**
 * Judge prompt for strategic synthesis
 */
const STRATEGIC_SYNTHESIS_JUDGE_PROMPT = `You are evaluating whether an AI agent CONNECTED the current step to the overall plan and bigger picture.

GOOD SYNTHESIS:
- References earlier collected data in current recommendations
- Explains how current decisions affect later steps
- Connects the dots between different plan elements
- Shows how pieces fit together strategically
- Demonstrates holistic thinking

POOR SYNTHESIS:
- Treats each step in isolation
- Doesn't reference earlier collected data
- No connection to overall strategy
- Misses opportunities to show interdependencies
- Formulaic, disconnected responses

CONVERSATION CONTEXT:
{conversation_context}

CURRENT STEP: Step {current_step}

AGENT RESPONSE:
"""
{agent_response}
"""

Score 0.0-1.0 where:
- 1.0 = Excellent synthesis - clearly connects current step to earlier insights and overall strategy
- 0.8 = Good synthesis - references some prior data and shows strategic thinking
- 0.6 = Some synthesis - occasional connection to bigger picture
- 0.4 = Minimal synthesis - mostly treats step in isolation
- 0.2 = Almost no synthesis - formulaic responses without connection
- 0.0 = No synthesis - completely isolated step handling

Return JSON: { "score": X.X, "rationale": "..." }`;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Call LLM judge and parse JSON response
 */
async function llmJudgeJson(
  prompt: string
): Promise<{ score: number; rationale: string }> {
  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content[0] as Anthropic.TextBlock;
    const text = textBlock.text.trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.max(0, Math.min(1, parsed.score)),
        rationale: parsed.rationale || "",
      };
    }

    // Fallback: try to extract score directly
    const scoreMatch = text.match(/(\d+\.?\d*)/);
    if (scoreMatch) {
      return {
        score: Math.max(0, Math.min(1, parseFloat(scoreMatch[1]))),
        rationale: "Score extracted from response",
      };
    }

    return { score: 0.5, rationale: "Could not parse LLM response" };
  } catch (error) {
    console.error("LLM judge error:", error);
    return { score: 0.5, rationale: "LLM judge error" };
  }
}

// =============================================================================
// MENTORSHIP SCORERS
// =============================================================================

/**
 * Score teaching behavior (LLM-as-judge)
 *
 * Evaluates whether the agent explains WHY questions matter,
 * rather than just asking them in checklist fashion.
 */
export async function scoreTeachingBehavior(
  agentResponse: string,
  currentStep: number
): Promise<TurnScore> {
  const prompt = TEACHING_BEHAVIOR_JUDGE_PROMPT.replace(
    "{agent_response}",
    agentResponse
  );

  const result = await llmJudgeJson(prompt);

  return {
    scorer: "teaching-behavior",
    score: result.score,
    metadata: {
      rationale: result.rationale,
      currentStep,
    },
    scope: "turn",
  };
}

/**
 * Score proactive calculation (Hybrid: regex + LLM validation)
 *
 * Checks if the agent performed calculations when data was available,
 * rather than asking for more info it could derive itself.
 */
export function scoreProactiveCalculation(
  agentResponse: string,
  availableData: {
    hasBudget: boolean;
    budget?: number;
    hasVolume: boolean;
    volumeTarget?: number;
  }
): TurnScore {
  // Check if we have enough data to calculate
  const canCalculate = availableData.hasBudget && availableData.hasVolume;

  if (!canCalculate) {
    return {
      scorer: "proactive-calculation",
      score: 1.0,
      metadata: { status: "not_applicable", reason: "insufficient_data" },
      scope: "turn",
    };
  }

  // Patterns indicating calculations were performed
  const calculationPatterns = [
    /\$[\d,]+\s*[\/÷]\s*[\d,]+/i, // $X / Y
    /[\d,]+\s*[\/÷]\s*[\d,]+\s*=\s*\$?[\d,]+/i, // X / Y = Z
    /=\s*\$[\d,]+/i, // = $X
    /equals?\s*\$[\d,]+/i, // equals $X
    /that'?s?\s*\$[\d,]+\s*per/i, // that's $X per
    /implies?\s*\$[\d,]+/i, // implies $X
    /works out to\s*\$[\d,]+/i, // works out to $X
    /budget.*divided by.*=|÷.*=/i, // division shown
    /\$[\d,]+\s*per\s*(customer|acquisition|lead|user)/i, // $X per customer
  ];

  const hasCalculation = calculationPatterns.some((p) => p.test(agentResponse));

  // Patterns indicating agent asked for CAC when it could calculate it
  const asksForDerivedData = [
    /what('s| is) your (target )?(cac|cost per|acquisition cost)/i,
    /do you have a target (cac|cost per)/i,
    /what can you afford per customer/i,
  ];

  const askedWhenCouldCalculate = asksForDerivedData.some((p) =>
    p.test(agentResponse)
  );

  let score = 0.5; // Neutral baseline
  if (hasCalculation) {
    score = 1.0;
  } else if (askedWhenCouldCalculate) {
    score = 0.2; // Penalize asking when could calculate
  }

  return {
    scorer: "proactive-calculation",
    score,
    metadata: {
      hasCalculation,
      askedWhenCouldCalculate,
      budgetAvailable: availableData.hasBudget,
      volumeAvailable: availableData.hasVolume,
    },
    scope: "turn",
  };
}

/**
 * Score benchmark citation (Rule-based)
 *
 * Checks if the agent cited industry benchmarks or KB data
 * when making claims or providing guidance.
 */
export function scoreBenchmarkCitation(
  agentResponse: string,
  stepContext: { currentStep: number; hasDataClaims: boolean }
): TurnScore {
  // Check if response contains data claims that should be sourced
  const hasQuantitativeClaims =
    /\$[\d,]+|\d+%|\d+\s*(dollars|customers|leads)/i.test(agentResponse) ||
    /(typical|average|benchmark|industry|standard)/i.test(agentResponse);

  if (!hasQuantitativeClaims) {
    return {
      scorer: "benchmark-citation",
      score: 1.0,
      metadata: { status: "no_claims_to_cite" },
      scope: "turn",
    };
  }

  // Strong benchmark citation patterns
  const strongCitationPatterns = [
    /based on (industry |market |kb |knowledge base )?benchmark/i,
    /typical (industry |market )?(range|benchmark|average)/i,
    /industry (data |benchmark |standard )(shows|suggests|indicates)/i,
    /according to (industry |market |kb )?data/i,
    /\d+%?\s*(is |to be )?(typical|standard|common)/i,
    /benchmark.*\$[\d,]+/i,
    /\$[\d,]+.*benchmark/i,
  ];

  // Weaker but acceptable citation patterns
  const weakCitationPatterns = [
    /in my experience/i,
    /generally|typically|usually/i,
    /based on what (I'?ve seen|we see)/i,
    /common (range|practice|target)/i,
  ];

  const hasStrongCitation = strongCitationPatterns.some((p) =>
    p.test(agentResponse)
  );
  const hasWeakCitation = weakCitationPatterns.some((p) =>
    p.test(agentResponse)
  );

  let score = 0.3; // Baseline for unsourced claims
  if (hasStrongCitation) {
    score = 1.0;
  } else if (hasWeakCitation) {
    score = 0.7;
  }

  return {
    scorer: "benchmark-citation",
    score,
    metadata: {
      hasQuantitativeClaims,
      hasStrongCitation,
      hasWeakCitation,
      currentStep: stepContext.currentStep,
    },
    scope: "turn",
  };
}

/**
 * Score critical thinking (LLM-as-judge)
 *
 * Evaluates whether the agent challenged unrealistic inputs
 * and validated user-provided assumptions.
 */
export async function scoreCriticalThinking(
  userInput: string,
  agentResponse: string,
  context: {
    userSophistication: string;
    budget?: number;
    volumeTarget?: number;
    impliedEfficiency?: number;
  }
): Promise<TurnScore> {
  // Only applicable if user provided data to challenge
  const hasDataToChallenge =
    /\$[\d,]+|\d+%|\d+\s*(customers|leads|users)/i.test(userInput);

  if (!hasDataToChallenge) {
    return {
      scorer: "critical-thinking",
      score: 1.0,
      metadata: { status: "not_applicable", reason: "no_data_to_challenge" },
      scope: "turn",
    };
  }

  const prompt = CRITICAL_THINKING_JUDGE_PROMPT.replace(
    "{user_input}",
    userInput
  )
    .replace("{agent_response}", agentResponse)
    .replace("{user_sophistication}", context.userSophistication)
    .replace("{budget}", String(context.budget || "unknown"))
    .replace("{implied_efficiency}", String(context.impliedEfficiency || "unknown"));

  const result = await llmJudgeJson(prompt);

  return {
    scorer: "critical-thinking",
    score: result.score,
    metadata: {
      rationale: result.rationale,
      userSophistication: context.userSophistication,
      impliedEfficiency: context.impliedEfficiency,
    },
    scope: "turn",
  };
}

/**
 * Score strategic synthesis (LLM-as-judge)
 *
 * Evaluates whether the agent connected current step insights
 * to the overall plan and referenced earlier collected data.
 */
export async function scoreStrategicSynthesis(
  agentResponse: string,
  conversationContext: {
    currentStep: number;
    priorInsights: string[];
    collectedData: Record<string, unknown>;
  }
): Promise<TurnScore> {
  // Less relevant in early steps (1-2)
  if (conversationContext.currentStep <= 2) {
    return {
      scorer: "strategic-synthesis",
      score: 1.0,
      metadata: { status: "early_step", currentStep: conversationContext.currentStep },
      scope: "turn",
    };
  }

  const contextSummary = conversationContext.priorInsights.length > 0
    ? `Prior insights: ${conversationContext.priorInsights.join("; ")}`
    : "No prior insights captured yet.";

  const prompt = STRATEGIC_SYNTHESIS_JUDGE_PROMPT.replace(
    "{conversation_context}",
    contextSummary
  )
    .replace("{current_step}", String(conversationContext.currentStep))
    .replace("{agent_response}", agentResponse);

  const result = await llmJudgeJson(prompt);

  return {
    scorer: "strategic-synthesis",
    score: result.score,
    metadata: {
      rationale: result.rationale,
      currentStep: conversationContext.currentStep,
      priorInsightsCount: conversationContext.priorInsights.length,
    },
    scope: "turn",
  };
}

// =============================================================================
// AGGREGATED MENTORSHIP SCORER
// =============================================================================

/**
 * Calculate mentorship category score from individual scorers
 */
export function calculateMentorshipScore(
  scores: Record<string, TurnScore>
): number {
  const mentorshipScorers = [
    "teaching-behavior",
    "proactive-calculation",
    "benchmark-citation",
    "critical-thinking",
    "strategic-synthesis",
  ];

  const weights: Record<string, number> = {
    "teaching-behavior": 0.30,
    "proactive-calculation": 0.25,
    "benchmark-citation": 0.15,
    "critical-thinking": 0.15,
    "strategic-synthesis": 0.15,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const scorer of mentorshipScorers) {
    if (scores[scorer] && scores[scorer].metadata.status !== "not_applicable") {
      weightedSum += scores[scorer].score * weights[scorer];
      totalWeight += weights[scorer];
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 1.0;
}

/**
 * Score all mentorship dimensions for a turn
 */
export async function scoreMentorship(
  userMessage: string,
  agentResponse: string,
  context: {
    currentStep: number;
    userSophistication: string;
    budget?: number;
    volumeTarget?: number;
    priorInsights: string[];
    collectedData: Record<string, unknown>;
  }
): Promise<Record<string, TurnScore>> {
  const scores: Record<string, TurnScore> = {};

  // Calculate implied efficiency if we have the data
  const impliedEfficiency =
    context.budget && context.volumeTarget
      ? context.budget / context.volumeTarget
      : undefined;

  // Run scorers in parallel where possible
  const [teachingScore, criticalScore, synthesisScore] = await Promise.all([
    scoreTeachingBehavior(agentResponse, context.currentStep),
    scoreCriticalThinking(userMessage, agentResponse, {
      userSophistication: context.userSophistication,
      budget: context.budget,
      volumeTarget: context.volumeTarget,
      impliedEfficiency,
    }),
    scoreStrategicSynthesis(agentResponse, {
      currentStep: context.currentStep,
      priorInsights: context.priorInsights,
      collectedData: context.collectedData,
    }),
  ]);

  scores["teaching-behavior"] = teachingScore;
  scores["critical-thinking"] = criticalScore;
  scores["strategic-synthesis"] = synthesisScore;

  // Synchronous scorers
  scores["proactive-calculation"] = scoreProactiveCalculation(agentResponse, {
    hasBudget: context.budget !== undefined,
    budget: context.budget,
    hasVolume: context.volumeTarget !== undefined,
    volumeTarget: context.volumeTarget,
  });

  scores["benchmark-citation"] = scoreBenchmarkCitation(agentResponse, {
    currentStep: context.currentStep,
    hasDataClaims: true,
  });

  return scores;
}

export default scoreMentorship;
