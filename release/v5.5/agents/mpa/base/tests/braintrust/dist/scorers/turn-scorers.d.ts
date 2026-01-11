/**
 * Per-Turn Scorers for Multi-Turn MPA Evaluation
 *
 * Scorers that are applied to each individual turn.
 */
import { TurnScore, StepTrackingState } from "../mpa-multi-turn-types.js";
/**
 * Score response length
 *
 * Scoring is lenient for longer responses as long as they add value.
 * - Under 100 words: optimal (1.0)
 * - 100-200 words: acceptable (0.8)
 * - 200-300 words: slightly verbose (0.5)
 * - Over 300 words: too long (0.2)
 */
export declare function scoreResponseLength(output: string): TurnScore;
/**
 * Score question discipline
 *
 * Two-part questions are acceptable when focused on the immediate step.
 * - 0-1 questions: optimal (1.0)
 * - 2 questions: acceptable (0.8) - allows focused two-part questions
 * - 3 questions: slightly excessive (0.4)
 * - 4+ questions: too many (0)
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
 * 1. Knowledge Base - data from KB documents
 * 2. Websearch - fresh data from web search (must include link)
 * 3. API Call - data from direct API call
 * 4. User Provided - data the user gave
 * 5. Benchmark - broad industry data from stale/general websearch (must include link)
 */
export declare function scoreSourceCitation(output: string): TurnScore;
/**
 * Score acronym definition (acronyms must be defined on first use)
 */
export declare function scoreAcronymDefinition(output: string): TurnScore;
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
 * Score a single turn with all applicable scorers
 */
export declare function scoreTurn(userMessage: string, agentResponse: string, currentStep: number, stepState: StepTrackingState, userSophistication: string, cacAggressiveness?: "aggressive" | "moderate" | "conservative" | "unknown"): Promise<Record<string, TurnScore>>;
export default scoreTurn;
//# sourceMappingURL=turn-scorers.d.ts.map