/**
 * Evaluation Framework Types
 *
 * Generic types for multi-turn conversation evaluation.
 * Agents provide their own scenarios, step definitions, and scorers.
 */

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

/**
 * A single turn in a conversation
 */
export interface ConversationTurn {
  turnNumber: number;
  userMessage: string;
  assistantResponse: string;
  timestamp: Date;
  toolCalls?: ToolCallRecord[];
  metadata?: Record<string, unknown>;
}

/**
 * Record of a tool call made during a turn
 */
export interface ToolCallRecord {
  toolName: string;
  input: Record<string, unknown>;
  output: string;
  success: boolean;
  duration?: number;
}

/**
 * A complete conversation transcript
 */
export interface ConversationTranscript {
  id: string;
  scenarioId: string;
  startedAt: Date;
  completedAt?: Date;
  turns: ConversationTurn[];
  finalState: ConversationState;
  metadata: ConversationMetadata;
}

/**
 * State of the conversation
 */
export interface ConversationState {
  status: 'in_progress' | 'completed' | 'failed' | 'timeout';
  currentStep?: number;
  completedSteps: number[];
  failureReason?: string;
  totalTokens?: number;
}

/**
 * Metadata about the conversation
 */
export interface ConversationMetadata {
  model: string;
  scenarioName: string;
  scenarioDescription?: string;
  maxTurns: number;
  actualTurns: number;
  duration: number;
}

// ============================================================================
// SCENARIO TYPES
// ============================================================================

/**
 * A test scenario definition
 */
export interface TestScenario {
  /**
   * Unique identifier for the scenario
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Description of what this scenario tests
   */
  description: string;

  /**
   * Category for grouping scenarios
   */
  category?: string;

  /**
   * Initial user message to start the conversation
   */
  initialMessage: string;

  /**
   * Expected steps to be completed
   */
  expectedSteps?: number[];

  /**
   * Maximum turns allowed
   */
  maxTurns: number;

  /**
   * Expected topics to be covered
   */
  expectedTopics?: string[];

  /**
   * Success criteria for the scenario
   */
  successCriteria: SuccessCriteria;

  /**
   * User persona for simulation
   */
  userPersona?: UserPersona;

  /**
   * Initial context/state for the scenario
   */
  initialContext?: Record<string, unknown>;
}

/**
 * Criteria for determining scenario success
 */
export interface SuccessCriteria {
  /**
   * Minimum number of steps to complete
   */
  minStepsCompleted?: number;

  /**
   * Required steps that must be completed
   */
  requiredSteps?: number[];

  /**
   * Minimum overall score
   */
  minScore?: number;

  /**
   * Custom validation function name
   */
  customValidator?: string;
}

/**
 * User persona for simulation
 */
export interface UserPersona {
  /**
   * Name of the persona
   */
  name: string;

  /**
   * Expertise level
   */
  expertise: 'novice' | 'intermediate' | 'expert';

  /**
   * Communication style
   */
  style: 'concise' | 'detailed' | 'questioning';

  /**
   * Domain knowledge areas
   */
  knowledgeAreas?: string[];

  /**
   * Personality traits for simulation
   */
  traits?: string[];
}

// ============================================================================
// SCORING TYPES
// ============================================================================

/**
 * Result from a scorer
 */
export interface ScorerResult {
  /**
   * Name of the scorer
   */
  name: string;

  /**
   * Score value (0-1)
   */
  score: number;

  /**
   * Human-readable explanation
   */
  explanation: string;

  /**
   * Detailed breakdown (optional)
   */
  breakdown?: Record<string, number>;

  /**
   * Any issues identified
   */
  issues?: string[];

  /**
   * Metadata from the scorer
   */
  metadata?: Record<string, unknown>;
}

/**
 * Aggregated scores for a conversation
 */
export interface ConversationScores {
  /**
   * Overall composite score
   */
  overall: number;

  /**
   * Individual scorer results
   */
  scorers: ScorerResult[];

  /**
   * Weighted dimension scores
   */
  dimensions?: Record<string, number>;
}

// ============================================================================
// EVALUATION RESULT TYPES
// ============================================================================

/**
 * Complete evaluation result for a scenario
 */
export interface EvaluationResult {
  /**
   * Unique ID for this evaluation
   */
  id: string;

  /**
   * Scenario that was evaluated
   */
  scenarioId: string;

  /**
   * When the evaluation was run
   */
  timestamp: Date;

  /**
   * The conversation transcript
   */
  transcript: ConversationTranscript;

  /**
   * Scores from all scorers
   */
  scores: ConversationScores;

  /**
   * Whether the scenario passed
   */
  passed: boolean;

  /**
   * Detailed failure reasons if failed
   */
  failureReasons?: string[];

  /**
   * Summary insights
   */
  insights?: string[];
}

/**
 * Summary of an evaluation run (multiple scenarios)
 */
export interface EvaluationRunSummary {
  /**
   * Unique ID for this run
   */
  runId: string;

  /**
   * When the run started
   */
  startedAt: Date;

  /**
   * When the run completed
   */
  completedAt: Date;

  /**
   * Total scenarios evaluated
   */
  totalScenarios: number;

  /**
   * Scenarios that passed
   */
  passedScenarios: number;

  /**
   * Scenarios that failed
   */
  failedScenarios: number;

  /**
   * Average overall score
   */
  averageScore: number;

  /**
   * Scores by category
   */
  scoresByCategory?: Record<string, number>;

  /**
   * Individual evaluation results
   */
  results: EvaluationResult[];
}

// ============================================================================
// STEP TRACKING TYPES
// ============================================================================

/**
 * Definition of a workflow step
 */
export interface StepDefinition {
  /**
   * Step number/ID
   */
  step: number;

  /**
   * Step name
   */
  name: string;

  /**
   * Description of what happens in this step
   */
  description: string;

  /**
   * Keywords that indicate this step is being addressed
   */
  keywords: string[];

  /**
   * Required data/inputs for this step
   */
  requiredInputs?: string[];

  /**
   * Expected outputs from this step
   */
  expectedOutputs?: string[];

  /**
   * Steps that must be completed before this one
   */
  prerequisites?: number[];
}

/**
 * Progress through steps
 */
export interface StepProgress {
  /**
   * Steps that have been completed
   */
  completedSteps: number[];

  /**
   * Current active step
   */
  currentStep?: number;

  /**
   * Steps that were skipped
   */
  skippedSteps: number[];

  /**
   * Steps with detected issues
   */
  problematicSteps: number[];

  /**
   * Time spent per step (in turns)
   */
  turnsPerStep: Record<number, number>;
}

// ============================================================================
// BASELINE COMPARISON TYPES
// ============================================================================

/**
 * Baseline for comparison
 */
export interface BaselineRecord {
  /**
   * Baseline ID
   */
  id: string;

  /**
   * When this baseline was established
   */
  createdAt: Date;

  /**
   * Model/version this baseline is for
   */
  model: string;

  /**
   * Scenario ID
   */
  scenarioId: string;

  /**
   * Baseline scores
   */
  scores: ConversationScores;

  /**
   * Notes about this baseline
   */
  notes?: string;
}

/**
 * Comparison to baseline
 */
export interface BaselineComparison {
  /**
   * Baseline being compared to
   */
  baselineId: string;

  /**
   * Overall score delta
   */
  scoreDelta: number;

  /**
   * Whether this is a regression
   */
  isRegression: boolean;

  /**
   * Deltas by scorer
   */
  scorerDeltas: Record<string, number>;

  /**
   * Summary of changes
   */
  summary: string;
}
