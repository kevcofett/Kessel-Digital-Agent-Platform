/**
 * MPA Multi-Turn Evaluation Type Definitions
 *
 * Comprehensive type system for multi-turn conversation evaluation.
 */
/**
 * Persistent state tracked across turns for quality scoring
 */
export interface ConversationState {
    /** All data points collected, keyed by field name */
    collectedData: Record<string, unknown>;
    /** Track what was calculated and when */
    calculationsPerformed: {
        turnNumber: number;
        calculation: string;
        formula: string;
        result: string;
    }[];
    /** Insights captured per step for synthesis scoring */
    insightsPerStep: Record<number, {
        dataPoints: string[];
        decisions: string[];
        calculations: string[];
    }>;
    /** Track when data changes mid-conversation */
    dataRevisions: {
        turnNumber: number;
        field: string;
        oldValue: unknown;
        newValue: unknown;
        agentAcknowledged: boolean;
        agentRecalculated: boolean;
    }[];
    /** Accumulated plan for coherence checking */
    accumulatedPlan: Partial<MediaPlanData>;
    /** Context for adaptive scoring */
    context: {
        budget: number;
        funnel: "awareness" | "consideration" | "performance";
        kpiAggressiveness: "conservative" | "moderate" | "aggressive";
        userSophistication: "low" | "medium" | "high";
    };
}
/**
 * Media plan data structure for coherence checking
 */
export interface MediaPlanData {
    objective?: string;
    primaryKPI?: string;
    volumeTarget?: number;
    volumeUnit?: string;
    totalBudget?: number;
    impliedCAC?: number;
    targetLTV?: number;
    margin?: number;
    efficiencyAssessment?: string;
    audienceProfile?: {
        demographics?: string;
        behaviors?: string;
        firstPartyData?: string;
    };
    audienceSize?: number;
    geoScope?: "national" | "regional" | "local";
    geoAllocations?: Record<string, number>;
    strongMarkets?: string[];
    weakMarkets?: string[];
    channelAllocations?: Record<string, number>;
    testBudget?: number;
    monthlySpend?: number[];
    pacing?: string;
    valueProp?: string;
    differentiators?: string[];
    creativeApproach?: string;
    channelMix?: Record<string, number>;
    platformStrategies?: Record<string, string>;
    attributionModel?: string;
    trackingRequirements?: string[];
    measurementLimitations?: string[];
    testPlan?: string[];
    testBudgetAllocated?: number;
    learningAgenda?: string;
    risks?: string[];
    mitigations?: string[];
    contingencies?: string[];
}
/**
 * Initialize empty conversation state
 */
export declare function createInitialConversationState(budget?: number, funnel?: "awareness" | "consideration" | "performance", kpiAggressiveness?: "conservative" | "moderate" | "aggressive", userSophistication?: "low" | "medium" | "high"): ConversationState;
/**
 * Quality context for vertical benchmark scenarios
 */
export interface QualityContext {
    scenarioType: string;
    vertical: string;
    channels?: string[];
    expectedBenchmarks?: Record<string, {
        min: number;
        max: number;
        typical: number;
    }>;
    marketConditions?: string;
    seasonality?: string;
    complianceRequirements?: string[];
    targetDemographic?: string;
    salesCycle?: string;
    targetDMAs?: string[];
}
/**
 * User persona defining how the simulated user behaves
 */
export interface UserPersona {
    /** Unique identifier for the persona */
    id?: string;
    /** Human-readable name for the persona */
    name?: string;
    /** Job title (optional) */
    title?: string;
    /** Company name (optional) */
    company?: string;
    /** Role description */
    role?: string;
    /** Company size tier */
    companySize?: string;
    /** Prior media experience description */
    priorMediaExperience?: string;
    /** Communication style description */
    communicationStyle?: string;
    /** Decision authority description */
    decisionAuthority?: string;
    /** Sophistication level (legacy naming) */
    sophistication?: "basic" | "intermediate" | "advanced" | "expert";
    /** Sophistication level affects language complexity matching */
    sophisticationLevel?: "basic" | "intermediate" | "advanced" | "expert";
    /** Industry vertical affects benchmark expectations */
    industry?: string;
    /** Known data the user has available to provide */
    knownData?: UserKnownData;
    /** Behavioral traits affecting conversation dynamics */
    behavioralTraits?: UserBehavioralTraits;
    /** Language patterns for response generation */
    languagePatterns?: UserLanguagePatterns;
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
/**
 * Expected behavior when agent receives a data change
 */
export interface DataChangeExpectedBehavior {
    /** Agent should explicitly acknowledge the change */
    acknowledges: boolean;
    /** Agent should recalculate affected metrics */
    recalculates: boolean;
    /** Agent should explain what the change means strategically */
    explainsImpact: boolean;
    /** Agent should recommend actions to address the change */
    recommendsAction: boolean;
}
/**
 * Definition of a mid-conversation data change
 *
 * Used to test proactive reforecasting behavior when user reveals
 * updated inputs that invalidate previous calculations.
 */
export interface DataChange {
    /** Turn number at which to inject the change */
    triggerTurn: number;
    /** Alternative: regex pattern in agent response to trigger the change */
    triggerCondition?: string;
    /** Which data field is changing (budget, volumeTarget, timeline, etc.) */
    field: string;
    /** The original value the user provided earlier */
    oldValue: unknown;
    /** The new value the user is now revealing */
    newValue: unknown;
    /** The exact message the user will send to communicate the change */
    userMessage: string;
    /** What the agent should do in response */
    expectedBehavior: DataChangeExpectedBehavior;
}
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
    /** Pre-defined conversation turns (optional - for scripted scenarios) */
    turns?: ConversationTurn[];
    /** Quality context for benchmark scenarios (optional) */
    qualityContext?: QualityContext;
    /** Optional: specific opening message to start conversation */
    openingMessage?: string;
    /** Minimum expected turns (optional) */
    minExpectedTurns?: number;
    minTurns?: number;
    /** Maximum turns before forced termination */
    maxTurns?: number;
    /** Which steps should be completed by end of scenario */
    expectedCompletedSteps?: number[];
    /** Step-specific expectations for validation (optional) */
    stepExpectations?: StepExpectation[];
    /** Expected events to occur (optional) */
    expectedEvents?: Array<{
        type: string;
        description: string;
    }>;
    /** Failure conditions that should trigger early termination */
    failureConditions?: FailureCondition[];
    /** KB files that should be injected at each step */
    kbInjectionMap?: Record<number, string[]>;
    /** Success criteria for the overall scenario */
    successCriteria: ScenarioSuccessCriteria;
    /**
     * Mid-conversation data changes to test proactive reforecasting
     *
     * When defined, the user simulator will inject these data changes
     * at the specified turn or when the trigger condition is met.
     * The agent should acknowledge, recalculate, explain impact, and recommend actions.
     */
    dataChanges?: DataChange[];
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
    type: "loop_detection" | "duplicate_question" | "context_loss" | "greeting_repetition" | "step_boundary_violation" | "excessive_questions" | "interrogation_without_teaching" | "blocked_progress" | "custom_pattern";
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
    requiredStepsComplete?: number[];
    /** Minimum conversation-level score to pass */
    minimumOverallScore: number;
    /** No critical failures allowed */
    noCriticalFailures: boolean;
    /** Required behaviors (v6.1+) */
    requiredBehaviors?: string[];
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
/**
 * Single turn in a conversation
 */
export interface ConversationTurn {
    /** Turn number (1-indexed) */
    turnNumber: number;
    /** Which MPA step this turn belongs to */
    currentStep?: number;
    /** User message for this turn */
    userMessage: string;
    /** Agent response */
    agentResponse?: string;
    /** Expected behaviors (for test scenarios) */
    expectedBehaviors?: string[];
    /** Quality focus areas (for test scenarios) */
    qualityFocus?: string[];
    /** Scoring emphasis multipliers (for test scenarios) */
    scoringEmphasis?: Record<string, number>;
    /** KB content injected for this turn */
    kbContentInjected?: string[];
    /** Token counts for monitoring */
    tokenCounts?: {
        userTokens: number;
        agentTokens: number;
        kbTokens: number;
        totalContextTokens: number;
    };
    /** Timestamp for latency tracking */
    timestamp?: number;
    /** Latency in milliseconds */
    latencyMs?: number;
    /** Per-turn scores from all applicable scorers */
    turnScores?: Record<string, TurnScore>;
    /** Detected events (failures, transitions, etc.) */
    detectedEvents?: ConversationEvent[];
    /** Extracted data from this turn */
    extractedData?: Record<string, unknown>;
    /** Step tracking state after this turn */
    stepState?: StepTrackingState;
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
    type: "step_transition" | "step_completion" | "failure_detected" | "idk_protocol" | "calculation_performed" | "benchmark_cited" | "loop_warning" | "context_loss_warning";
    /** Turn number where event occurred */
    turnNumber: number;
    /** Event-specific data */
    data: Record<string, unknown>;
    /** Severity level */
    severity: "info" | "warning" | "error" | "critical";
}
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
    turnScoreAggregates: Record<string, {
        min: number;
        max: number;
        mean: number;
        median: number;
        scores: number[];
    }>;
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
    /** Enable agentic RAG with tool use (default: true) */
    useAgenticRAG?: boolean;
}
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
export declare const MPA_STEPS: StepDefinition[];
/**
 * Scorer weight configuration (SCORER_SPECIFICATION_v3)
 *
 * Rebalanced for Strategic Quality vs Format Compliance:
 * - Strategic Quality (60%): Validates correctness and feasibility
 * - Format Compliance (40%): Validates structure and language patterns
 *
 * Total: 100%
 */
export declare const SCORER_WEIGHTS: Record<string, number>;
/**
 * LLM grade to score mapping
 */
export declare const GRADE_SCORES: Record<string, number>;
//# sourceMappingURL=mpa-multi-turn-types.d.ts.map