/**
 * Per-Turn Scorers for Multi-Turn MPA Evaluation
 *
 * Scorers that are applied to each individual turn.
 */
import { TurnScore, StepTrackingState } from "../mpa-multi-turn-types.js";
/**
 * Score response length
 *
 * KB says "under 75 words when possible".
 * - ≤75 words: optimal (1.0)
 * - 76-125 words: acceptable (0.8)
 * - 126-200 words: slightly verbose (0.5)
 * - 201-300 words: too long (0.2)
 * - >300 words: way too long (0.0)
 *
 * Exception: Responses containing tables or multi-row calculations are exempt.
 */
export declare function scoreResponseLength(output: string): TurnScore;
/**
 * Score question discipline
 *
 * KB says "ONE question per response. Maximum. No exceptions."
 * - 0-1 questions: optimal (1.0)
 * - 2 questions: partial (0.5)
 * - 3+ questions: fail (0.0)
 *
 * Also detects implicit questions without question marks.
 */
export declare function scoreSingleQuestion(output: string): TurnScore;
/**
 * Score step boundary compliance (no channel RECOMMENDATIONS in Steps 1-2)
 *
 * This scorer detects actual channel recommendations, not just mentions.
 * - "I recommend Facebook ads" = VIOLATION
 * - "You should allocate 40% to Google" = VIOLATION
 * - "This gives flexibility for channel mix" = OK (general observation)
 * - "That pacing makes sense" = OK (acknowledging user input)
 */
export declare function scoreStepBoundary(output: string, currentStep: number): TurnScore;
/**
 * Score source citation (data claims should have sources)
 *
 * The agent MUST cite one of five sources for every data claim:
 * 1. "Based on Knowledge Base, [claim]." - No link required
 * 2. "Based on Websearch, [claim] [source: URL]." - MUST include link
 * 3. "Based on API Call, [claim]." - No link required
 * 4. "Based on User Provided, [claim]." - No link required
 * 5. "Based on Benchmark, [claim] [source: URL]." - MUST include link
 *
 * Scoring:
 * - 1.0: Explicit source with correct format
 * - 0.7: Implicit source ("you mentioned", "typical range")
 * - 0.3: Numbers without any source attribution
 * - 0.0: Fabricated citation or claims KB data when not retrieved
 */
export declare function scoreSourceCitation(output: string): TurnScore;
/**
 * Score acronym definition (acronyms must be defined on first use in conversation)
 *
 * @param output - Current agent response
 * @param conversationHistory - All previous agent responses concatenated (optional)
 */
export declare function scoreAcronymDefinition(output: string, conversationHistory?: string): TurnScore;
/**
 * Score IDK protocol compliance
 */
export declare function scoreIdkProtocol(input: string, output: string): TurnScore;
/**
 * Score adaptive sophistication (language matches user level)
 */
export declare function scoreAdaptiveSophistication(input: string, output: string, userLevel: string): Promise<TurnScore>;
/**
 * Score proactive intelligence (does math when data is available)
 */
export declare function scoreProactiveIntelligence(input: string, output: string, hasEnoughData: boolean): Promise<TurnScore>;
/**
 * Score progress over perfection (keeps momentum vs blocking)
 */
export declare function scoreProgressOverPerfection(input: string, output: string): Promise<TurnScore>;
/**
 * Score risk and opportunity flagging
 *
 * Checks if the agent proactively identifies and communicates risks,
 * opportunities, or important considerations to the user.
 */
export declare function scoreRiskOpportunityFlagging(input: string, output: string, currentStep: number): Promise<TurnScore>;
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
export declare function scoreCalculationPresence(output: string, input: string, previousInput?: string): TurnScore;
/**
 * Score audience completeness relative to plan economics
 *
 * Aggressive efficiency targets (30%+ below benchmark) require tight targeting
 * across all 4 dimensions with significant depth. Moderate targets allow
 * standard targeting. Brand awareness allows broad targeting.
 *
 * This scorer evaluates whether the agent collected appropriate targeting
 * depth for the efficiency requirements of the plan.
 */
export declare function scoreAudienceCompleteness(output: string, currentStep: number, cacAggressiveness: "aggressive" | "moderate" | "conservative" | "unknown"): Promise<TurnScore>;
/**
 * Score audience sizing table format and completeness
 *
 * The agent MUST present audience sizing in proper table format:
 * | DMA | Total Population | Target Audience | Target % |
 *
 * - DMA/Geo in left column
 * - Total population next
 * - Target audience as whole numbers (not just %)
 * - Target audience as % of total population
 * - TOTAL row with rollups
 */
export declare function scoreAudienceSizing(output: string, currentStep: number): TurnScore;
/**
 * Score precision-to-CAC connection
 *
 * The agent MUST connect targeting precision to CAC achievability:
 * - Aggressive CAC targets require tight targeting
 * - Moderate targets allow standard approaches
 * - Agent should explicitly state this connection
 */
export declare function scorePrecisionConnection(output: string, currentStep: number): Promise<TurnScore>;
/**
 * Score response formatting (visual hierarchy)
 *
 * Checks if calculations are on their own lines, tables used for
 * comparative data, and visual breaks separate distinct concepts.
 */
export declare function scoreResponseFormatting(output: string): TurnScore;
/**
 * Score mathematical accuracy in agent responses
 *
 * Validates:
 * 1. Table percentage calculations (target_audience / population = stated_percent)
 * 2. CAC calculations (budget / customers = stated_CAC)
 * 3. Basic arithmetic expressions (A / B = C)
 */
export declare function scoreMathAccuracy(output: string, conversationContext?: string): TurnScore;
/**
 * Score feasibility of stated CAC given audience and budget constraints
 *
 * Validates:
 * 1. Required conversion rate is realistic (< 5% for cold traffic)
 * 2. Budget per person in audience is sufficient for reach + conversion
 * 3. Audience size supports stated volume without saturation
 */
export declare function scoreFeasibilityValidation(output: string, extractedData: Record<string, unknown>): TurnScore;
/**
 * Score benchmark sourcing - verify that "Based on Knowledge Base" claims
 * reference actual data from the KB
 *
 * This scorer requires KB content to be passed in for verification
 */
export declare function scoreBenchmarkSourcing(output: string, kbContent?: string): TurnScore;
/**
 * Score a single turn with all applicable scorers
 */
export declare function scoreTurn(userMessage: string, agentResponse: string, currentStep: number, stepState: StepTrackingState, userSophistication: string, cacAggressiveness?: "aggressive" | "moderate" | "conservative" | "unknown", conversationHistory?: string, extractedData?: Record<string, unknown>, kbContent?: string): Promise<Record<string, TurnScore>>;
export default scoreTurn;
//# sourceMappingURL=turn-scorers.d.ts.map