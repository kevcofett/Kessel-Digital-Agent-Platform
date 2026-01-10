/**
 * MPA Multi-Turn Evaluation Type Definitions
 *
 * Comprehensive type system for multi-turn conversation evaluation.
 */

// =============================================================================
// USER PERSONA TYPES
// =============================================================================

/**
 * User persona defining how the simulated user behaves
 */
export interface UserPersona {
  /** Unique identifier for the persona */
  id: string;

  /** Human-readable name for the persona */
  name: string;

  /** Job title (optional) */
  title?: string;

  /** Company name (optional) */
  company?: string;

  /** Sophistication level affects language complexity matching */
  sophisticationLevel: "basic" | "intermediate" | "advanced" | "expert";

  /** Industry vertical affects benchmark expectations */
  industry: string;

  /** Known data the user has available to provide */
  knownData: UserKnownData;

  /** Behavioral traits affecting conversation dynamics */
  behavioralTraits: UserBehavioralTraits;

  /** Language patterns for response generation */
  languagePatterns: UserLanguagePatterns;

  /** Response style preferences (optional) */
  responseStyle?: {
    typicalLength?: "short" | "medium" | "long";
    asksFollowUps?: boolean;
    confirmsUnderstanding?: boolean;
  };
}

/**
 * Known data the user has available
 */
export interface UserKnownData {
  hasBudget: boolean;
  budget?: number;
  hasVolume?: boolean;
  volumeTarget?: number;
  volumeUnit?: string;
  hasVolumeTarget?: boolean;
  volumeType?: "customers" | "leads" | "transactions" | "impressions";
  hasUnitEconomics?: boolean;
  hasLTV?: boolean;
  ltv?: number;
  hasCAC?: boolean;
  cac?: number;
  hasMargin?: boolean;
  margin?: number;
  contributionMargin?: number;
  hasAudienceDefinition?: boolean;
  audienceDescription?: string;
  hasGeography?: boolean;
  geography?: string[];
  hasChannelPreferences?: boolean;
  preferredChannels?: string[];
  hasObjective?: boolean;
  objective?: string;
}

/**
 * Behavioral traits for user simulation
 */
export interface UserBehavioralTraits {
  /** How likely to say "I don't know" */
  uncertaintyFrequency: "never" | "rare" | "sometimes" | "often" | number;

  /** How detailed responses are */
  responseVerbosity?: "terse" | "normal" | "verbose";
  verbosity?: "concise" | "balanced" | "detailed";

  /** Whether user tries to skip ahead in steps */
  stepSkipTendency?: "sequential" | "occasional_skip" | "frequent_skip";
  skipTendency?: number;

  /** Whether user pushes back on agent recommendations */
  challengeFrequency?: "never" | "rare" | "sometimes" | "often";
  pushbackFrequency?: number;

  /** Specific objection patterns to test agent handling */
  objectionPatterns?: string[];

  /** Whether user provides unsolicited info */
  providesUnsolicitedInfo?: boolean;
}

/**
 * Language patterns for user simulation
 */
export interface UserLanguagePatterns {
  /** Vocabulary examples to guide LLM user simulator */
  samplePhrases: string[];

  /** Whether to use industry jargon */
  usesJargon: boolean;

  /** Acronyms the user knows and uses */
  knownAcronyms?: string[];

  /** Preferred terms for concepts */
  preferredTerms?: Record<string, string>;

  /** Terms the user avoids */
  avoidedTerms?: string[];
}

// =============================================================================
// TEST SCENARIO TYPES
// =============================================================================

/**
 * Test scenario defining the full conversation setup
 */
export interface TestScenario {
  /** Unique identifier */
  id: string;

  /** Descriptive name */
  name: string;

  /** Category for grouping (optional) */
  category?: string;

  /** What this scenario tests */
  description: string;

  /** The user persona for this scenario */
  persona: UserPersona;

  /** Optional: specific opening message to start conversation */
  openingMessage?: string;

  /** Minimum expected turns (optional) */
  minExpectedTurns?: number;
  minTurns?: number;

  /** Maximum turns before forced termination */
  maxTurns: number;

  /** Which steps should be completed by end of scenario */
  expectedCompletedSteps: number[];

  /** Step-specific expectations for validation (optional) */
  stepExpectations?: StepExpectation[];

  /** Expected events to occur (optional) */
  expectedEvents?: Array<{
    type: string;
    description: string;
  }>;

  /** Failure conditions that should trigger early termination */
  failureConditions: FailureCondition[];

  /** KB files that should be injected at each step */
  kbInjectionMap: Record<number, string[]>;

  /** Success criteria for the overall scenario */
  successCriteria: ScenarioSuccessCriteria;
}

/**
 * Expectations for a specific step in the conversation
 */
export interface StepExpectation {
  /** Which step (1-10) */
  step: number;

  /** Minimum viable data to collect before step is complete */
  minimumViableData: string[];

  /** Topics the agent MUST NOT discuss at this step */
  forbiddenTopics: string[];

  /** Patterns that indicate step completion */
  completionIndicators: string[];

  /** Maximum turns allowed within this step */
  maxTurnsForStep: number;
}

/**
 * Failure conditions for early termination or scoring
 */
export interface FailureCondition {
  /** Unique identifier for the failure type */
  id: string;

  /** Description of what constitutes this failure */
  description: string;

  /** Detection pattern type */
  type:
    | "loop_detection"
    | "context_loss"
    | "greeting_repetition"
    | "step_boundary_violation"
    | "excessive_questions"
    | "blocked_progress"
    | "custom_pattern";

  /** Regex or custom detection logic identifier */
  detectionPattern?: string;

  /** Severity determines scoring impact */
  severity: "warning" | "major" | "critical";

  /** Score penalty when this failure is detected */
  scorePenalty: number;

  /** Whether to terminate conversation on detection */
  terminateOnDetect: boolean;
}

/**
 * Custom success criterion with evaluator function
 */
export interface CustomCriterion {
  name: string;
  description: string;
  evaluator: (result: ConversationResult) => boolean;
}

/**
 * Success criteria for scenario completion
 */
export interface ScenarioSuccessCriteria {
  /** All these steps must be marked complete */
  requiredStepsComplete: number[];

  /** Minimum conversation-level score to pass */
  minimumOverallScore: number;

  /** No critical failures allowed */
  noCriticalFailures: boolean;

  /** Per-turn score thresholds (optional) */
  perTurnThresholds?: {
    responseLengthMin: number;
    singleQuestionRate: number;
    sourceCitationRate: number;
  };

  /** Minimum scores for specific turn scorers (optional) */
  minimumTurnScores?: Record<string, number>;

  /** Custom evaluation criteria (optional) */
  customCriteria?: CustomCriterion[];
}

// =============================================================================
// CONVERSATION TYPES
// =============================================================================

/**
 * Single turn in a conversation
 */
export interface ConversationTurn {
  /** Turn number (1-indexed) */
  turnNumber: number;

  /** Which MPA step this turn belongs to */
  currentStep: number;

  /** User message for this turn */
  userMessage: string;

  /** Agent response */
  agentResponse: string;

  /** KB content injected for this turn */
  kbContentInjected: string[];

  /** Token counts for monitoring */
  tokenCounts: {
    userTokens: number;
    agentTokens: number;
    kbTokens: number;
    totalContextTokens: number;
  };

  /** Timestamp for latency tracking */
  timestamp: number;

  /** Latency in milliseconds */
  latencyMs: number;

  /** Per-turn scores from all applicable scorers */
  turnScores: Record<string, TurnScore>;

  /** Detected events (failures, transitions, etc.) */
  detectedEvents: ConversationEvent[];

  /** Extracted data from this turn */
  extractedData: Record<string, unknown>;

  /** Step tracking state after this turn */
  stepState: StepTrackingState;
}

/**
 * Score for a single turn
 */
export interface TurnScore {
  /** Scorer name */
  scorer: string;

  /** Numeric score (0-1) */
  score: number;

  /** Additional metadata from scorer */
  metadata: Record<string, unknown>;

  /** Whether this is a per-turn or conversation-level scorer */
  scope: "turn" | "conversation";
}

/**
 * Events detected during conversation
 */
export interface ConversationEvent {
  /** Event type */
  type:
    | "step_transition"
    | "step_completion"
    | "failure_detected"
    | "idk_protocol"
    | "calculation_performed"
    | "benchmark_cited"
    | "loop_warning"
    | "context_loss_warning";

  /** Turn number where event occurred */
  turnNumber: number;

  /** Event-specific data */
  data: Record<string, unknown>;

  /** Severity level */
  severity: "info" | "warning" | "error" | "critical";
}

// =============================================================================
// STEP TRACKING TYPES
// =============================================================================

/**
 * Tracking state for step progression
 */
export interface StepTrackingState {
  /** Current active step */
  currentStep: number;

  /** Steps marked as complete */
  completedSteps: number[];

  /** Data collected per step */
  collectedData: Record<number, StepCollectedData>;

  /** Turn counts per step */
  turnsPerStep: Record<number, number>;

  /** Whether conversation has reached a terminal state */
  isTerminal: boolean;

  /** Reason for terminal state if applicable */
  terminalReason?: string;
}

/**
 * Data collected for a specific step
 */
export interface StepCollectedData {
  /** Step number */
  step: number;

  /** List of required data points for this step */
  requiredDataPoints: string[];

  /** Which data points have been collected */
  collectedDataPoints: Record<string, unknown>;

  /** Whether minimum viable data is met */
  minimumViableMet: boolean;

  /** Turn number when step started */
  startedAtTurn: number;

  /** Turn number when step completed (if complete) */
  completedAtTurn?: number;
}

// =============================================================================
// RESULT TYPES
// =============================================================================

/**
 * Complete conversation result
 */
export interface ConversationResult {
  /** Scenario that was executed */
  scenario: TestScenario;

  /** All turns in the conversation */
  turns: ConversationTurn[];

  /** Total turn count */
  totalTurns: number;

  /** Final step tracking state */
  finalStepState: StepTrackingState;

  /** All detected events across conversation */
  allEvents: ConversationEvent[];

  /** Failure summary */
  failures: {
    warnings: FailureCondition[];
    major: FailureCondition[];
    critical: FailureCondition[];
  };

  /** Per-turn score aggregations */
  turnScoreAggregates: Record<
    string,
    {
      min: number;
      max: number;
      mean: number;
      median: number;
      scores: number[];
    }
  >;

  /** Conversation-level scores */
  conversationScores: Record<string, TurnScore>;

  /** Composite overall score */
  compositeScore: number;

  /** Whether scenario passed based on success criteria */
  passed: boolean;

  /** Execution metadata */
  executionMetadata: {
    startTime: number;
    endTime: number;
    totalDurationMs: number;
    averageLatencyMs: number;
    totalTokensUsed: number;
    modelUsed: string;
    promptVersion: string;
  };
}

/**
 * User simulator response
 */
export interface UserSimulatorResponse {
  /** The simulated user's message */
  message: string;

  /** What data the user revealed in this response */
  revealedData: Record<string, unknown>;

  /** Whether the user said "I don't know" */
  saidIDontKnow: boolean;

  /** Whether the user tried to skip ahead */
  triedToSkip: boolean;

  /** Whether the user pushed back on something */
  pushedBack: boolean;

  /** Internal reasoning (for debugging) */
  reasoning?: string;
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

/**
 * User Simulator Configuration
 */
export interface UserSimulatorConfig {
  /** Model to use for simulation */
  model: string;

  /** Temperature for response generation */
  temperature: number;

  /** Maximum tokens for user response */
  maxTokens: number;
}

/**
 * Conversation Engine Configuration
 */
export interface ConversationEngineConfig {
  /** Model for MPA agent */
  agentModel: string;

  /** Model for user simulator */
  simulatorModel: string;

  /** Temperature for agent responses */
  agentTemperature: number;

  /** Maximum tokens for agent responses */
  agentMaxTokens: number;

  /** System prompt version identifier */
  promptVersion: string;

  /** MPA system prompt content */
  systemPrompt: string;

  /** Whether to log verbose output */
  verbose: boolean;
}

// =============================================================================
// STEP DEFINITIONS
// =============================================================================

/**
 * Step definition with requirements
 */
export interface StepDefinition {
  /** Step number (1-10) */
  step: number;

  /** Step name */
  name: string;

  /** Minimum viable data points for this step */
  minimumViableData: string[];

  /** Patterns to detect this step in conversation */
  detectionPatterns: RegExp[];
}

/**
 * The 10 MPA steps
 */
export const MPA_STEPS: StepDefinition[] = [
  {
    step: 1,
    name: "Outcomes",
    minimumViableData: ["objective", "primaryKPI", "volumeTarget"],
    detectionPatterns: [
      /business outcome|objective|goal/i,
      /kpi|success|measure/i,
      /target|volume|revenue/i,
    ],
  },
  {
    step: 2,
    name: "Economics",
    minimumViableData: ["impliedEfficiency", "efficiencyAssessment"],
    detectionPatterns: [
      /cac|efficiency|cost per/i,
      /ltv|lifetime value|profit/i,
      /unit economics|margin/i,
    ],
  },
  {
    step: 3,
    name: "Audience",
    minimumViableData: ["primaryAudience"],
    detectionPatterns: [
      /audience|target|segment/i,
      /demographic|who|customer profile/i,
    ],
  },
  {
    step: 4,
    name: "Geography",
    minimumViableData: ["geographicScope"],
    detectionPatterns: [/geography|market|region/i, /dma|location|where/i],
  },
  {
    step: 5,
    name: "Budget",
    minimumViableData: ["totalBudget", "pacing"],
    detectionPatterns: [
      /budget|spend|allocation/i,
      /pacing|timing|duration/i,
    ],
  },
  {
    step: 6,
    name: "Value Proposition",
    minimumViableData: ["differentiators"],
    detectionPatterns: [
      /value prop|differentiator|positioning/i,
      /competitive|unique|message/i,
    ],
  },
  {
    step: 7,
    name: "Channels",
    minimumViableData: ["channelMix"],
    detectionPatterns: [
      /channel|media mix|platform/i,
      /facebook|google|tiktok|programmatic/i,
    ],
  },
  {
    step: 8,
    name: "Measurement",
    minimumViableData: ["measurementApproach", "attributionModel"],
    detectionPatterns: [/measurement|attribution|track/i, /kpi|metric|report/i],
  },
  {
    step: 9,
    name: "Testing",
    minimumViableData: ["testingAgenda"],
    detectionPatterns: [/test|experiment|learn/i, /optimize|iteration/i],
  },
  {
    step: 10,
    name: "Risks",
    minimumViableData: ["riskAssessment"],
    detectionPatterns: [/risk|compliance|safety/i, /mitigation|concern/i],
  },
];

// =============================================================================
// SCORING CONSTANTS
// =============================================================================

/**
 * Scorer weight configuration
 */
export const SCORER_WEIGHTS: Record<string, number> = {
  // Per-turn scorers - Quality behaviors
  "proactive-intelligence": 0.12, // Critical: Does agent do math proactively?
  "risk-opportunity-flagging": 0.10, // Critical: Does agent flag risks/opportunities?
  "calculation-presence": 0.08, // Important: Is agent modeling/calculating?
  "progress-over-perfection": 0.08, // Important: Maintains momentum
  "adaptive-sophistication": 0.08, // Important: Language matches user

  // Per-turn scorers - Compliance behaviors
  "step-boundary": 0.08, // Don't discuss channels in Steps 1-2
  "idk-protocol": 0.07, // Handle "I don't know" properly
  "source-citation": 0.06, // Cite data sources
  "single-question": 0.05, // Question discipline
  "acronym-definition": 0.04, // Define acronyms
  "response-length": 0.04, // Keep responses concise

  // Conversation-level scorers
  "step-completion-rate": 0.08, // Complete the steps
  "conversation-efficiency": 0.04, // Efficient turn count
  "context-retention": 0.04, // Remember user data
  "greeting-uniqueness": 0.02, // Don't repeat greeting
  "loop-detection": 0.02, // No question loops
};

/**
 * LLM grade to score mapping
 */
export const GRADE_SCORES: Record<string, number> = {
  A: 1.0,
  B: 0.8,
  C: 0.5,
  D: 0.2,
  F: 0,
};
