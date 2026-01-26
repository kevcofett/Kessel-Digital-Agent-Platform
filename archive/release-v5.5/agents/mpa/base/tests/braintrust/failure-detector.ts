/**
 * Failure Detector for Multi-Turn MPA Evaluation
 *
 * Detects conversation failures like loops, context loss, and greeting repetition.
 */

import {
  ConversationTurn,
  FailureCondition,
} from "./mpa-multi-turn-types.js";

/**
 * Built-in failure patterns
 *
 * PHILOSOPHY: Detect actual behavioral failures, not natural thorough discovery.
 *
 * TRUE FAILURES:
 * - Asking the EXACT same question repeatedly (agent stuck in loop)
 * - Asking 3+ questions in a row WITHOUT teaching (interrogation)
 * - Recommending channel strategy before Step 7 (premature tactics)
 *
 * NOT FAILURES:
 * - Asking multiple related questions with teaching/explanation
 * - Referencing channels for economic validation
 * - Thorough discovery to achieve KPI objectives
 */
export const BUILTIN_FAILURES: FailureCondition[] = [
  {
    id: "greeting-repetition",
    description: "Agent repeats the 10-step greeting after first turn",
    type: "greeting_repetition",
    detectionPattern:
      "we will cover ten areas|i('m| am) excited to build a media plan|outcomes.*economics.*audience.*geography",
    severity: "major",
    scorePenalty: 0.15,
    terminateOnDetect: false,
  },
  {
    id: "interrogation-without-teaching",
    description:
      "Agent asks 3+ questions without explaining importance or providing value",
    type: "interrogation_without_teaching",
    severity: "major",
    scorePenalty: 0.1,
    terminateOnDetect: false,
  },
  {
    id: "step-boundary-violation",
    description: "Agent recommends channel strategy or allocations in Steps 1-2",
    type: "step_boundary_violation",
    detectionPattern:
      "facebook ads|google ads|tiktok|instagram|linkedin ads|programmatic|channel mix|media mix|display ads|video ads|ctv|connected tv",
    severity: "major",
    scorePenalty: 0.15,
    terminateOnDetect: false,
  },
  {
    id: "context-loss",
    description: "Agent asks about information already provided",
    type: "context_loss",
    severity: "major",
    scorePenalty: 0.15,
    terminateOnDetect: false,
  },
  {
    id: "duplicate-question",
    description: "Agent asks the same question again (80%+ similarity)",
    type: "duplicate_question",
    severity: "major",
    scorePenalty: 0.15,
    terminateOnDetect: false,
  },
  {
    id: "blocked-progress-idk",
    description: "Agent keeps pushing after user says 'I don't know'",
    type: "blocked_progress",
    severity: "major",
    scorePenalty: 0.2,
    terminateOnDetect: false,
  },
];

/**
 * Failure Detector class
 *
 * Detects actual behavioral failures, not natural thorough discovery.
 * The philosophy is to distinguish between:
 * - TRUE failures: Agent stuck in loop, interrogating without teaching
 * - NOT failures: Thorough discovery to achieve KPI objectives
 */
export class FailureDetector {
  private providedData: Map<string, unknown> = new Map();
  private previousUserSaidIDK: boolean = false;
  private idkTopic: string = "";

  /**
   * Reset detector state for a new conversation
   */
  reset(): void {
    this.providedData = new Map();
    this.previousUserSaidIDK = false;
    this.idkTopic = "";
  }

  /**
   * Detect failures in a turn
   */
  detectFailures(
    turnNumber: number,
    agentResponse: string,
    previousTurns: ConversationTurn[],
    customFailures: FailureCondition[] | undefined,
    currentStep: number = 1,
    userSaidIDK: boolean = false
  ): FailureCondition[] {
    const detected: FailureCondition[] = [];
    const allFailures = [...BUILTIN_FAILURES, ...(customFailures || [])];

    // Update provided data from previous turns
    this.updateProvidedData(previousTurns);

    for (const failure of allFailures) {
      if (
        this.checkFailure(
          failure,
          turnNumber,
          agentResponse,
          previousTurns,
          currentStep
        )
      ) {
        detected.push(failure);
      }
    }

    // Update state for next turn
    this.previousUserSaidIDK = userSaidIDK;
    if (userSaidIDK) {
      this.idkTopic = this.extractQuestionTopic(
        previousTurns[previousTurns.length - 1]?.agentResponse || ""
      );
    }

    return detected;
  }

  /**
   * Update provided data from conversation history
   */
  private updateProvidedData(turns: ConversationTurn[]): void {
    for (const turn of turns) {
      for (const [key, value] of Object.entries(turn.extractedData)) {
        this.providedData.set(key, value);
      }
    }
  }

  /**
   * Check if a specific failure condition is met
   */
  private checkFailure(
    failure: FailureCondition,
    turnNumber: number,
    agentResponse: string,
    previousTurns: ConversationTurn[],
    currentStep: number
  ): boolean {
    switch (failure.type) {
      case "greeting_repetition":
        return this.checkGreetingRepetition(
          turnNumber,
          agentResponse,
          failure
        );

      case "interrogation_without_teaching":
        return this.checkInterrogationWithoutTeaching(
          agentResponse,
          previousTurns
        );

      // Legacy support for old failure definitions
      case "excessive_questions":
        return this.checkInterrogationWithoutTeaching(
          agentResponse,
          previousTurns
        );

      case "step_boundary_violation":
        return this.checkStepBoundaryViolation(
          agentResponse,
          currentStep,
          failure
        );

      case "context_loss":
        return this.checkContextLoss(agentResponse);

      case "duplicate_question":
        return this.checkDuplicateQuestion(agentResponse, previousTurns);

      // Legacy support for old failure definitions
      case "loop_detection":
        return this.checkDuplicateQuestion(agentResponse, previousTurns);

      case "blocked_progress":
        return this.checkBlockedProgress(agentResponse, previousTurns);

      case "custom_pattern":
        if (failure.detectionPattern) {
          const regex = new RegExp(failure.detectionPattern, "i");
          return regex.test(agentResponse);
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Check for greeting repetition
   */
  private checkGreetingRepetition(
    turnNumber: number,
    response: string,
    failure: FailureCondition
  ): boolean {
    // Greeting is expected in turn 1, but not after
    if (turnNumber <= 1) return false;

    const pattern = new RegExp(failure.detectionPattern || "", "i");
    return pattern.test(response);
  }

  /**
   * Check for interrogation without teaching
   *
   * An interrogation occurs when the agent asks multiple questions without:
   * 1. Explaining why the information matters
   * 2. Connecting to previous insights
   * 3. Providing calculations or analysis
   * 4. Teaching the user something valuable
   *
   * This is different from thorough discovery where questions are accompanied
   * by teaching, calculations, or goal-oriented explanations.
   */
  private checkInterrogationWithoutTeaching(
    response: string,
    previousTurns: ConversationTurn[]
  ): boolean {
    const questions = response.match(/\?/g) || [];
    const questionCount = questions.length;

    // Less than 3 questions is not interrogation
    if (questionCount < 3) return false;

    // Check for teaching indicators in the SAME response
    // If the agent is explaining WHY or providing VALUE, it's not interrogation
    const teachingIndicators = [
      /because|this matters because|why this is important/i,
      /let me explain|here's why|the reason/i,
      /this affects|this impacts|this determines|this influences/i,
      /based on|given that|considering|with your/i,
      /typical|benchmark|industry standard|industry average/i,
      /\$[\d,]+\s*[÷\/]\s*[\d,]+/i, // Division calculations like $500K / 10K
      /[\d,]+\s*[×x*]\s*[\d,]+/i, // Multiplication calculations
      /=\s*\$?[\d,]+/i, // Result patterns like = $50
      /\d+%\s*(?:of|to|for|in)/i, // Percentage patterns
      /tradeoff|balance|tension between/i,
      /to hit|to achieve|to reach|for your.*target/i, // Goal-oriented language
      /precision|efficiency|realistic/i,
    ];

    // If response contains teaching along with questions, NOT interrogation
    for (const pattern of teachingIndicators) {
      if (pattern.test(response)) {
        return false;
      }
    }

    // Check last 3 turns for sustained interrogation pattern
    // TRUE interrogation = multiple consecutive turns of questions without teaching
    const recentResponses = previousTurns.slice(-3).map((t) => t.agentResponse);
    let interrogationTurns = 0;

    for (const r of recentResponses) {
      const qs = (r.match(/\?/g) || []).length;
      const hasTeaching = teachingIndicators.some((p) => p.test(r));
      if (qs >= 2 && !hasTeaching) {
        interrogationTurns++;
      }
    }

    // Only flag if we have 3+ consecutive turns of questions without teaching
    // This is a TRUE pattern of interrogation, not just one response with multiple questions
    return interrogationTurns >= 3;
  }

  /**
   * Check for step boundary violations
   *
   * Context-aware detection that distinguishes between:
   * - TRUE VIOLATION: Agent recommends channel strategy, allocations, or tactics
   * - FALSE POSITIVE: Agent references channels for economic validation (activation rates, CAC by channel)
   *
   * The key insight is that sophisticated users often provide channel-level performance data
   * when discussing economics (Step 2), and the agent should validate this without penalty.
   */
  private checkStepBoundaryViolation(
    response: string,
    currentStep: number,
    failure: FailureCondition
  ): boolean {
    // Only check in Steps 1-2
    if (currentStep > 2) return false;

    const pattern = new RegExp(failure.detectionPattern || "", "i");

    // First check if channel names are present at all
    if (!pattern.test(response)) return false;

    // Check for ECONOMIC CONTEXT - these patterns indicate the agent is discussing
    // channel-level data for economic validation, NOT channel strategy
    const economicContextPatterns = [
      /activation rate/i,
      /conversion rate/i,
      /\d+%?\s*activation/i,
      /effective CAC/i,
      /cost per/i,
      /performance.*channel/i,
      /channel.*performance/i,
      /acquisition cost.*channel/i,
      /channel.*acquisition cost/i,
      /you mentioned.*channel/i,
      /your data.*channel/i,
      /channel-level.*data/i,
      /varies by.*channel/i,
      /by.*source/i,
      /source.*performance/i,
    ];

    // If the response has economic context, it's likely validating user-provided
    // channel data, not recommending channel strategy - NOT a violation
    for (const contextPattern of economicContextPatterns) {
      if (contextPattern.test(response)) {
        return false;
      }
    }

    // Check for STRATEGY CONTEXT - these patterns indicate the agent is
    // recommending channel strategy prematurely - TRUE violation
    const strategyContextPatterns = [
      /recommend.*channel/i,
      /channel.*allocation/i,
      /allocate.*channel/i,
      /should.*run.*ads/i,
      /consider.*platform/i,
      /channel mix/i,
      /media mix/i,
      /prioritize.*channel/i,
      /channel.*strategy/i,
      /\d+%.*to.*(?:facebook|google|linkedin|tiktok|instagram)/i,
    ];

    // If strategy patterns are present, this is a true violation
    for (const strategyPattern of strategyContextPatterns) {
      if (strategyPattern.test(response)) {
        return true;
      }
    }

    // Default: If channel is mentioned but no clear strategy context,
    // be permissive - sophisticated conversations naturally reference channels
    // when discussing economics
    return false;
  }

  /**
   * Check for context loss
   *
   * Detects when the agent asks for data that was already provided.
   * IMPORTANT: Must distinguish between:
   * - Asking for original data again (BAD - context loss)
   * - Asking follow-up questions about related topics (GOOD - thorough discovery)
   *
   * Example FALSE POSITIVES to avoid:
   * - "What's your budget allocation preference?" is NOT asking for the budget
   * - "How do you want to split budget across channels?" is NOT asking for budget
   * - "What's your target audience segment?" is NOT asking for the volume target
   */
  private checkContextLoss(response: string): boolean {
    // Patterns that suggest asking for already-provided data
    // These patterns are STRICT - they should only match direct re-asks, not follow-ups
    const askPatterns = [
      // Budget: only match direct "what is your budget" not "budget allocation" or "budget split"
      {
        pattern: /what('?s| is) your (total |overall |media |marketing )?budget\?/i,
        excludePattern: /allocation|split|preference|across|between/i,
        dataKey: "budget",
      },
      // Volume: match direct volume questions, not segment questions
      {
        pattern: /how many (customers|leads|conversions) (do you need|are you targeting)\?/i,
        excludePattern: /per segment|per audience|breakdown/i,
        dataKey: "volumeTarget",
      },
      // Objective: match direct objective questions
      {
        pattern: /what('?s| is) your (primary |main |overall )?objective\?/i,
        excludePattern: /secondary|per segment|for this/i,
        dataKey: "objective",
      },
      // LTV: match direct LTV questions
      {
        pattern: /what('?s| is) your (average |customer )?ltv\?/i,
        excludePattern: /by segment|per cohort|breakdown/i,
        dataKey: "ltv",
      },
      // CAC: match direct CAC questions
      {
        pattern: /what('?s| is) your (target |current )?cac\?/i,
        excludePattern: /by channel|per segment|breakdown/i,
        dataKey: "cac",
      },
    ];

    for (const { pattern, excludePattern, dataKey } of askPatterns) {
      if (pattern.test(response)) {
        // Check for exclusion patterns that indicate follow-up questions
        if (excludePattern && excludePattern.test(response)) {
          continue; // This is a follow-up question, not a re-ask
        }
        // Check if we already have this data
        if (this.providedData.has(dataKey)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check for duplicate questions
   *
   * Detects when the agent asks the SAME question repeatedly (80%+ similarity).
   * This is different from asking RELATED questions about a topic.
   *
   * A TRUE loop is when the agent is stuck and not progressing.
   * Asking different questions about the same topic (e.g., demographics,
   * then behaviors, then geography) is NOT a loop - it's thorough discovery.
   */
  private checkDuplicateQuestion(
    response: string,
    previousTurns: ConversationTurn[]
  ): boolean {
    const currentQuestions = response.match(/[^.!?]*\?/g) || [];

    for (const currentQ of currentQuestions) {
      const normalizedCurrent = this.normalizeQuestion(currentQ);

      // Skip very short questions (less than 3 words after normalization)
      if (normalizedCurrent.split(" ").filter((w) => w.length > 0).length < 3) {
        continue;
      }

      // Check if this EXACT question (normalized) was asked in last 3 turns
      for (const turn of previousTurns.slice(-3)) {
        const prevQuestions = turn.agentResponse.match(/[^.!?]*\?/g) || [];
        for (const prevQ of prevQuestions) {
          const normalizedPrev = this.normalizeQuestion(prevQ);

          // Skip very short questions
          if (
            normalizedPrev.split(" ").filter((w) => w.length > 0).length < 3
          ) {
            continue;
          }

          const similarity = this.calculateStringSimilarity(
            normalizedCurrent,
            normalizedPrev
          );

          // 80%+ similarity = asking the same question again
          if (similarity > 0.8) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Normalize a question for comparison
   * Removes common words, punctuation, and normalizes whitespace
   */
  private normalizeQuestion(q: string): string {
    const stopWords = [
      "the",
      "a",
      "an",
      "your",
      "you",
      "what",
      "is",
      "are",
      "do",
      "does",
      "can",
      "could",
      "would",
      "should",
      "how",
      "why",
      "when",
      "where",
      "which",
      "who",
      "that",
      "this",
      "these",
      "those",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "will",
      "about",
      "with",
      "for",
      "from",
      "into",
      "of",
      "on",
      "to",
      "in",
      "at",
      "by",
      "or",
      "and",
      "if",
      "any",
      "there",
      "their",
      "they",
      "them",
      "we",
      "our",
      "us",
      "me",
      "my",
      "i",
    ];

    return q
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 0 && !stopWords.includes(w))
      .join(" ")
      .trim();
  }

  /**
   * Categorize question type (kept for legacy support)
   */
  private getQuestionType(question: string): string {
    if (/budget|spend|cost/i.test(question)) return "budget";
    if (/customer|lead|volume|target/i.test(question)) return "volume";
    if (/kpi|metric|measure|success/i.test(question)) return "kpi";
    if (/audience|target|who|demographic/i.test(question)) return "audience";
    if (/channel|platform|media/i.test(question)) return "channel";
    if (/objective|goal|outcome/i.test(question)) return "objective";
    if (/ltv|lifetime|value/i.test(question)) return "ltv";
    if (/cac|acquisition|efficiency/i.test(question)) return "cac";
    if (/margin|profit/i.test(question)) return "margin";
    return "other";
  }

  /**
   * Extract question topic for IDK tracking
   */
  private extractQuestionTopic(agentMessage: string): string {
    const questions = agentMessage.match(/[^.!?]*\?/g) || [];
    if (questions.length === 0) return "unknown";

    const lastQuestion = questions[questions.length - 1].toLowerCase();
    return this.getQuestionType(lastQuestion);
  }

  /**
   * Check for blocked progress after IDK
   */
  private checkBlockedProgress(
    response: string,
    previousTurns: ConversationTurn[]
  ): boolean {
    // Check if previous turn had IDK
    if (!this.previousUserSaidIDK) return false;

    // Check if agent is still pushing on same topic
    const pushingPatterns = [
      /what is your|can you tell me|do you have|please provide/i,
      /you must have|surely you know/i,
      /can you estimate|any idea/i,
    ];

    // Check if the question is about the same topic as the IDK
    const currentTopic = this.extractQuestionTopic(response);

    for (const pattern of pushingPatterns) {
      if (pattern.test(response)) {
        // If asking about the same topic user said they don't know
        if (currentTopic === this.idkTopic) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Calculate string similarity using Jaccard index
   */
  private calculateStringSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.split(" ").filter((w) => w.length > 2));
    const wordsB = new Set(b.split(" ").filter((w) => w.length > 2));

    if (wordsA.size === 0 && wordsB.size === 0) return 0;

    const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
    const union = new Set([...wordsA, ...wordsB]);

    return intersection.size / union.size;
  }

  /**
   * Get failure summary
   */
  getFailureSummary(failures: FailureCondition[]): string {
    if (failures.length === 0) return "No failures detected";

    const critical = failures.filter((f) => f.severity === "critical");
    const major = failures.filter((f) => f.severity === "major");
    const warnings = failures.filter((f) => f.severity === "warning");

    const parts: string[] = [];
    if (critical.length > 0)
      parts.push(`${critical.length} critical`);
    if (major.length > 0) parts.push(`${major.length} major`);
    if (warnings.length > 0)
      parts.push(`${warnings.length} warnings`);

    return `Failures: ${parts.join(", ")}`;
  }
}

export default FailureDetector;
