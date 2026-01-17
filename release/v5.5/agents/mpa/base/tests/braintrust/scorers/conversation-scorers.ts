/**
 * Conversation-Level Scorers for Multi-Turn MPA Evaluation
 *
 * Scorers that are applied once to the complete conversation.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  ConversationTurn,
  TestScenario,
  ConversationEvent,
  FailureCondition,
  TurnScore,
  GRADE_SCORES,
} from "../mpa-multi-turn-types.js";

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

// Use Haiku for LLM judges when FAST_SCORING=true (10x faster, minimal quality loss)
const SCORER_MODEL = process.env.FAST_SCORING === "true"
  ? "claude-3-5-haiku-20241022"
  : "claude-sonnet-4-20250514";

// =============================================================================
// CODE-BASED CONVERSATION SCORERS
// =============================================================================

/**
 * Score step completion rate
 */
export function scoreStepCompletionRate(
  turns: ConversationTurn[],
  scenario: TestScenario
): TurnScore {
  if (turns.length === 0) {
    return {
      scorer: "step-completion-rate",
      score: 0,
      metadata: { completed: 0, expected: scenario.expectedCompletedSteps?.length || 0 },
      scope: "conversation",
    };
  }

  const finalState = turns[turns.length - 1].stepState;
  const completedCount = finalState?.completedSteps?.length || 0;
  const expectedCount = scenario.expectedCompletedSteps?.length || 0;

  const score = expectedCount > 0 ? completedCount / expectedCount : 1.0;

  return {
    scorer: "step-completion-rate",
    score,
    metadata: {
      completed: completedCount,
      expected: expectedCount,
      steps: finalState.completedSteps,
    },
    scope: "conversation",
  };
}

/**
 * Score conversation efficiency (turns vs expected)
 *
 * Rewards efficient conversations that complete steps without unnecessary turns.
 * A conversation that completes 10 steps in 13 turns is excellent.
 *
 * IMPORTANT: When the maxAllowed cap is an artificial global limit (like efficiency
 * mode's 20-turn cap) that's below the scenario's natural minTurns, hitting that
 * cap is not the agent's fault and should not be harshly penalized.
 */
export function scoreConversationEfficiency(
  turns: ConversationTurn[],
  scenario: TestScenario
): TurnScore {
  const actualTurns = turns.length;
  const naturalMin = scenario.minExpectedTurns || scenario.minTurns || 1;
  const maxAllowed = scenario.maxTurns;

  // Check if the cap is artificially restrictive (below natural minimum)
  // This happens in efficiency mode where complex scenarios get capped at 20
  const isCappedBeforeNatural = maxAllowed < naturalMin;

  // Efficiency is about completing steps without excessive turns
  // Perfect: within expected range
  // Good: slightly over but not excessive
  // Poor: much over or hit max turns (unless cap is artificial)
  let score = 1.0;

  if (actualTurns >= maxAllowed) {
    if (isCappedBeforeNatural) {
      // Cap is artificial - don't penalize harshly
      // Score based on how close to cap vs how much of natural was covered
      const progressRatio = actualTurns / naturalMin;
      score = Math.min(1.0, progressRatio); // Can't exceed 1.0
    } else {
      score = 0.1; // Hit max turns when it was achievable
    }
  } else if (actualTurns > naturalMin * 3) {
    score = 0.3; // Very inefficient
  } else if (actualTurns > naturalMin * 2) {
    score = 0.5; // Somewhat inefficient
  } else if (actualTurns >= naturalMin) {
    score = 1.0; // Within expected range - perfect
  } else {
    // Completed faster than expected - also good!
    score = 1.0;
  }

  return {
    scorer: "conversation-efficiency",
    score,
    metadata: { actualTurns, expectedMin: naturalMin, maxAllowed, isCappedBeforeNatural },
    scope: "conversation",
  };
}

/**
 * Score context retention (references previously collected data)
 *
 * Improved to detect both numeric data and textual concept references.
 * In a natural conversation, the agent builds on previous information.
 */
export function scoreContextRetention(
  turns: ConversationTurn[]
): TurnScore {
  if (turns.length < 3) {
    return {
      scorer: "context-retention",
      score: 1.0,
      metadata: { status: "not_enough_turns" },
      scope: "conversation",
    };
  }

  let referencesCount = 0;
  let opportunitiesCount = 0;

  // Extract numbers from user messages for tracking
  const extractNumbers = (text: string): string[] => {
    const matches = text.match(/\$[\d,]+|\d{2,}[,\d]*|\d+%/g) || [];
    return matches.map(m => m.replace(/[$,%]/g, '').replace(/,/g, ''));
  };

  // Track mentioned numbers across the conversation
  const mentionedNumbers: Set<string> = new Set();

  for (let i = 1; i < turns.length; i++) {
    const currentTurn = turns[i];
    const response = currentTurn.agentResponse.toLowerCase();

    // Add numbers from previous user messages
    if (i > 0) {
      const prevUserNumbers = extractNumbers(turns[i-1].userMessage);
      prevUserNumbers.forEach(n => mentionedNumbers.add(n));
    }

    // Check if agent references any previously mentioned numbers
    if (mentionedNumbers.size > 0 && i >= 2) {
      opportunitiesCount++;
      const responseNumbers = extractNumbers(response);

      for (const num of mentionedNumbers) {
        if (responseNumbers.some(rn => rn === num || rn.includes(num))) {
          referencesCount++;
          break;
        }
      }
    }

    // Also check extracted data from previous turns
    const prevRevealedData = Object.entries(currentTurn.extractedData || {});
    if (prevRevealedData.length > 0 && i > 1) {
      for (const [key, value] of prevRevealedData) {
        if (typeof value === "number") {
          const valueStr = value.toString();
          if (response.includes(valueStr)) {
            referencesCount++;
            opportunitiesCount++;
            break;
          }
        }
      }
    }
  }

  // Give partial credit - agent doesn't need to reference ALL data
  const score = opportunitiesCount > 0
    ? Math.min(1.0, referencesCount / Math.max(1, opportunitiesCount * 0.5))
    : 1.0;

  return {
    scorer: "context-retention",
    score,
    metadata: { references: referencesCount, opportunities: opportunitiesCount },
    scope: "conversation",
  };
}

/**
 * Score greeting uniqueness (greeting should appear only once)
 */
export function scoreGreetingUniqueness(
  turns: ConversationTurn[]
): TurnScore {
  const greetingPatterns = [
    /hi!?\s*i('m| am) excited to build/i,
    /we will cover ten areas/i,
    /outcomes,?\s*economics,?\s*audience,?\s*geography/i,
    /ten areas.*outcomes/i,
  ];

  let greetingCount = 0;

  for (const turn of turns) {
    for (const pattern of greetingPatterns) {
      if (pattern.test(turn.agentResponse)) {
        greetingCount++;
        break;
      }
    }
  }

  // Score: 1.0 if greeting appears 0-1 times, 0 if repeated
  const score = greetingCount <= 1 ? 1.0 : 0;

  return {
    scorer: "greeting-uniqueness",
    score,
    metadata: { greetingCount, expectedMax: 1 },
    scope: "conversation",
  };
}

/**
 * Score loop detection (no repeated questions)
 */
export function scoreLoopDetection(turns: ConversationTurn[]): TurnScore {
  const questionPatterns: string[] = [];
  let loopScore = 1.0;

  for (const turn of turns) {
    const questions = turn.agentResponse.match(/[^.!?]*\?/g) || [];
    for (const q of questions) {
      const normalized = q
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim();

      // Check similarity to previous questions
      for (const prev of questionPatterns) {
        const similarity = calculateStringSimilarity(normalized, prev);
        if (similarity > 0.8) {
          loopScore -= 0.15;
        } else if (similarity > 0.6) {
          loopScore -= 0.05;
        }
      }

      questionPatterns.push(normalized);
    }
  }

  return {
    scorer: "loop-detection",
    score: Math.max(0, loopScore),
    metadata: { uniqueQuestions: questionPatterns.length },
    scope: "conversation",
  };
}

/**
 * Calculate string similarity using Jaccard index
 */
function calculateStringSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(" ").filter((w) => w.length > 2));
  const wordsB = new Set(b.split(" ").filter((w) => w.length > 2));

  if (wordsA.size === 0 && wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

/**
 * Calculate failure penalty
 */
export function calculateFailurePenalty(failures: {
  warnings: FailureCondition[];
  major: FailureCondition[];
  critical: FailureCondition[];
}): TurnScore {
  let penalty = 0;

  penalty += failures.warnings.length * 0.05;
  penalty += failures.major.length * 0.15;
  penalty += failures.critical.length * 0.4;

  const score = Math.max(0, 1 - penalty);

  return {
    scorer: "failure-penalty",
    score,
    metadata: {
      warnings: failures.warnings.length,
      major: failures.major.length,
      critical: failures.critical.length,
      totalPenalty: penalty,
    },
    scope: "conversation",
  };
}

// =============================================================================
// LLM-AS-JUDGE CONVERSATION SCORERS
// =============================================================================

/**
 * Helper to get LLM grade
 */
async function llmJudge(prompt: string): Promise<string> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: SCORER_MODEL,
    max_tokens: 100,
    messages: [{ role: "user", content: prompt }],
  });
  const textBlock = response.content[0] as Anthropic.TextBlock;
  return textBlock.text.trim().toUpperCase().charAt(0);
}

/**
 * Score step transition quality
 */
export async function scoreStepTransitionQuality(
  turns: ConversationTurn[]
): Promise<TurnScore> {
  // Find step transitions
  const transitions: Array<{ from: number; to: number; response: string }> = [];

  for (let i = 1; i < turns.length; i++) {
    if (turns[i].currentStep !== turns[i - 1].currentStep) {
      transitions.push({
        from: turns[i - 1].currentStep,
        to: turns[i].currentStep,
        response: turns[i].agentResponse,
      });
    }
  }

  if (transitions.length === 0) {
    return {
      scorer: "step-transition-quality",
      score: 1.0,
      metadata: { transitions: 0 },
      scope: "conversation",
    };
  }

  // Sample the first transition for LLM evaluation
  const sample = transitions[0];
  const prompt = `Evaluate this step transition in a media planning conversation.

The agent just transitioned from Step ${sample.from} to Step ${sample.to}.
Agent response: "${sample.response.slice(0, 500)}"

A = Clear, smooth transition with acknowledgment of step completion
B = Adequate transition - moves forward appropriately
C = Abrupt or unclear transition
D = Confusing transition
F = No indication of transition at all

Reply with ONLY one letter: A, B, C, D, or F`;

  const letter = await llmJudge(prompt);

  return {
    scorer: "step-transition-quality",
    score: GRADE_SCORES[letter] ?? 0.5,
    metadata: { transitions: transitions.length, sampleGrade: letter },
    scope: "conversation",
  };
}

/**
 * Score overall conversation coherence
 */
export async function scoreOverallCoherence(
  turns: ConversationTurn[],
  scenario: TestScenario
): Promise<TurnScore> {
  if (turns.length < 2) {
    return {
      scorer: "overall-coherence",
      score: 1.0,
      metadata: { status: "not_enough_turns" },
      scope: "conversation",
    };
  }

  // Build conversation summary for LLM evaluation (first 5 turns)
  const conversationSummary = turns
    .slice(0, 5)
    .map(
      (t) =>
        `User: ${t.userMessage.slice(0, 100)}...\nAgent: ${t.agentResponse.slice(0, 100)}...`
    )
    .join("\n\n");

  const prompt = `Evaluate the overall coherence of this media planning conversation.

Scenario: ${scenario.description}
User sophistication: ${scenario.persona.sophisticationLevel}

Conversation (first 5 turns):
${conversationSummary}

A = Highly coherent, natural flow, consistent handling
B = Good coherence with minor issues
C = Some coherence issues (repetition, inconsistency)
D = Significant coherence problems
F = Incoherent or disjointed

Reply with ONLY one letter: A, B, C, D, or F`;

  const letter = await llmJudge(prompt);

  return {
    scorer: "overall-coherence",
    score: GRADE_SCORES[letter] ?? 0.5,
    metadata: { grade: letter, turnsEvaluated: Math.min(5, turns.length) },
    scope: "conversation",
  };
}

// =============================================================================
// AGGREGATED SCORER
// =============================================================================

/**
 * Score the complete conversation
 */
export async function scoreConversation(
  turns: ConversationTurn[],
  scenario: TestScenario,
  events: ConversationEvent[],
  failures: {
    warnings: FailureCondition[];
    major: FailureCondition[];
    critical: FailureCondition[];
  }
): Promise<Record<string, TurnScore>> {
  const scores: Record<string, TurnScore> = {};

  // Code-based scorers
  scores["step-completion-rate"] = scoreStepCompletionRate(turns, scenario);
  scores["conversation-efficiency"] = scoreConversationEfficiency(
    turns,
    scenario
  );
  scores["context-retention"] = scoreContextRetention(turns);
  scores["greeting-uniqueness"] = scoreGreetingUniqueness(turns);
  scores["loop-detection"] = scoreLoopDetection(turns);
  scores["failure-penalty"] = calculateFailurePenalty(failures);

  // LLM-based scorers (run in parallel)
  const [transitionScore, coherenceScore] = await Promise.all([
    scoreStepTransitionQuality(turns),
    scoreOverallCoherence(turns, scenario),
  ]);

  scores["step-transition-quality"] = transitionScore;
  scores["overall-coherence"] = coherenceScore;

  return scores;
}

export default scoreConversation;
