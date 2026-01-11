/**
 * Per-Turn Scorers for Multi-Turn MPA Evaluation
 *
 * Scorers that are applied to each individual turn.
 */
import Anthropic from "@anthropic-ai/sdk";
import { GRADE_SCORES, } from "../mpa-multi-turn-types.js";
// Lazy initialization - only create client when needed
let anthropic = null;
function getAnthropicClient() {
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
// CODE-BASED SCORERS
// =============================================================================
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
export function scoreResponseLength(output) {
    // Check for table exception
    const hasTable = /\|.*\|.*\|/m.test(output);
    // Check for multi-row calculation
    const calcLines = output.split('\n').filter(line => /^\s*\$[\d,]+/.test(line) || /=\s*\$?[\d,]+/.test(line));
    const hasMultiRowCalc = calcLines.length >= 2;
    if (hasTable || hasMultiRowCalc) {
        return {
            scorer: "response-length",
            score: 1.0,
            metadata: { status: "exempt", hasTable, hasMultiRowCalc },
            scope: "turn",
        };
    }
    const wordCount = output.trim().split(/\s+/).filter(w => w.length > 0).length;
    let score = 0;
    let status = "too_long";
    if (wordCount <= 75) {
        score = 1.0;
        status = "optimal";
    }
    else if (wordCount <= 125) {
        score = 0.8;
        status = "acceptable";
    }
    else if (wordCount <= 200) {
        score = 0.5;
        status = "slightly_verbose";
    }
    else if (wordCount <= 300) {
        score = 0.2;
        status = "too_long";
    }
    else {
        score = 0.0;
        status = "way_too_long";
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
 * KB says "ONE question per response. Maximum. No exceptions."
 * - 0-1 questions: optimal (1.0)
 * - 2 questions: partial (0.5)
 * - 3+ questions: fail (0.0)
 *
 * Also detects implicit questions without question marks.
 */
export function scoreSingleQuestion(output) {
    // Count explicit question marks
    const questionMarks = (output.match(/\?/g) || []).length;
    // Also detect implicit questions without question marks
    const implicitPatterns = [
        /could you (tell|share|provide)/i,
        /would you (say|describe)/i,
        /what about/i,
        /how about/i,
    ];
    let implicitCount = 0;
    for (const pattern of implicitPatterns) {
        if (pattern.test(output))
            implicitCount++;
    }
    const totalQuestions = questionMarks + implicitCount;
    let score = 0;
    if (totalQuestions <= 1) {
        score = 1.0;
    }
    else if (totalQuestions === 2) {
        score = 0.5;
    }
    else {
        score = 0.0;
    }
    return {
        scorer: "single-question",
        score,
        metadata: { questionCount: questionMarks, implicitQuestions: implicitCount, totalQuestions },
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
export function scoreStepBoundary(output, currentStep) {
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
export function scoreSourceCitation(output) {
    const hasNumbers = /\$[\d,]+|\d+%|\d+\s*(dollars|percent|customers|leads|conversions)/i.test(output);
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
        { pattern: /based on knowledge base/i, requiresLink: false },
        { pattern: /based on kb/i, requiresLink: false },
        { pattern: /based on websearch/i, requiresLink: true },
        { pattern: /based on web search/i, requiresLink: true },
        { pattern: /based on api call/i, requiresLink: false },
        { pattern: /based on user provided/i, requiresLink: false },
        { pattern: /based on benchmark/i, requiresLink: true },
    ];
    // Check for explicit sources
    let hasExplicitSource = false;
    for (const { pattern, requiresLink } of explicitSourcePatterns) {
        if (pattern.test(output)) {
            if (requiresLink) {
                // Check for link near the citation
                const hasLink = /\[source:\s*\S+\]/i.test(output) || /https?:\/\/\S+/i.test(output);
                hasExplicitSource = hasLink;
            }
            else {
                hasExplicitSource = true;
            }
            if (hasExplicitSource)
                break;
        }
    }
    // Implicit contextual patterns (acceptable but lower score)
    const implicitPatterns = [
        /you (mentioned|said|told|provided|shared)/i,
        /your (budget|target|goal|kpi|objective)/i,
        /typical(ly)?( range)?/i,
        /industry (data|benchmarks?)/i,
        /generally (runs?|ranges?)/i,
        /as you (mentioned|said|noted)/i,
        /per your/i,
        /based on (your|what you)/i,
        /with (a |your )\$[\d,]+/i,
        /at \$[\d,]+ per/i,
        /the \$[\d,]+ you/i,
    ];
    const hasImplicitSource = implicitPatterns.some((p) => p.test(output));
    let score = 0;
    if (hasExplicitSource) {
        score = 1.0;
    }
    else if (hasImplicitSource) {
        score = 0.7;
    }
    else {
        score = 0.3; // Numbers in response but no clear source
    }
    return {
        scorer: "source-citation",
        score,
        metadata: { hasDataClaims: true, hasExplicitSource, hasImplicitSource },
        scope: "turn",
    };
}
/**
 * Score acronym definition (acronyms must be defined on first use in conversation)
 *
 * @param output - Current agent response
 * @param conversationHistory - All previous agent responses concatenated (optional)
 */
export function scoreAcronymDefinition(output, conversationHistory) {
    const acronymPatterns = [
        { acronym: "CAC", definition: /customer acquisition cost|cost per acquisition/i },
        { acronym: "ROAS", definition: /return on ad spend/i },
        { acronym: "LTV", definition: /lifetime value/i },
        { acronym: "CPM", definition: /cost per (thousand|mille)/i },
        { acronym: "CPA", definition: /cost per acquisition/i },
        { acronym: "CPC", definition: /cost per click/i },
        { acronym: "CTR", definition: /click.?through rate/i },
        { acronym: "AOV", definition: /average order value/i },
        { acronym: "KPI", definition: /key performance indicator/i },
    ];
    // Combine conversation history with current output to check for prior definitions
    const fullContext = conversationHistory ? conversationHistory + "\n" + output : output;
    const usedAcronyms = [];
    const undefinedAcronyms = [];
    for (const { acronym, definition } of acronymPatterns) {
        const acronymRegex = new RegExp(`\\b${acronym}\\b`, "g");
        // Check if acronym is used in current response
        if (acronymRegex.test(output)) {
            usedAcronyms.push(acronym);
            // Check if definition exists ANYWHERE in conversation (including current turn)
            if (!definition.test(fullContext)) {
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
    const score = undefinedAcronyms.length === 0
        ? 1.0
        : 1 - undefinedAcronyms.length / usedAcronyms.length;
    return {
        scorer: "acronym-definition",
        score,
        metadata: { usedAcronyms, undefinedAcronyms, hadConversationContext: !!conversationHistory },
        scope: "turn",
    };
}
/**
 * Score IDK protocol compliance
 */
export function scoreIdkProtocol(input, output) {
    const userSaysIDK = /i don'?t know|not sure|no idea|uncertain|haven'?t figured/i.test(input);
    if (!userSaysIDK) {
        return {
            scorer: "idk-protocol",
            score: 1.0,
            metadata: { status: "not_applicable" },
            scope: "turn",
        };
    }
    const modelsAssumption = /i('ll| will) (model|use|assume)|based on|using.*benchmark|let me model/i.test(output);
    const citesSource = /based on (kb|benchmark|industry|research|typical)/i.test(output);
    const offersRefinement = /(you can|feel free to|adjust|refine) (this |it )?anytime|(can adjust|can refine)/i.test(output);
    const movesOn = /moving on|next|let'?s|now for/i.test(output);
    const keepsPushing = /what is your|can you tell|do you have|please provide|must have/i.test(output);
    let score = 0;
    if (modelsAssumption)
        score += 0.3;
    if (citesSource)
        score += 0.3;
    if (offersRefinement)
        score += 0.2;
    if (movesOn)
        score += 0.2;
    if (keepsPushing)
        score -= 0.5;
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
async function llmJudge(prompt) {
    const client = getAnthropicClient();
    const response = await client.messages.create({
        model: SCORER_MODEL,
        max_tokens: 100,
        messages: [{ role: "user", content: prompt }],
    });
    const textBlock = response.content[0];
    return textBlock.text.trim().toUpperCase().charAt(0);
}
/**
 * Score adaptive sophistication (language matches user level)
 */
export async function scoreAdaptiveSophistication(input, output, userLevel) {
    const levelDescription = userLevel === "basic" || userLevel === "low"
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
    const gradeScores = {
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
export async function scoreProactiveIntelligence(input, output, hasEnoughData) {
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
export async function scoreProgressOverPerfection(input, output) {
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
export async function scoreRiskOpportunityFlagging(input, output, currentStep) {
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
export function scoreCalculationPresence(output, input, previousInput) {
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
    const agentMakesJustifiableClaim = justificationNeededPatterns.some((p) => p.test(output));
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
        }
        else {
            score = 0.5;
            status = "missed_reforecast_opportunity";
        }
    }
    else if (agentMakesJustifiableClaim) {
        if (agentShowedMath) {
            score = 1.0;
            status = "justified_with_math";
        }
        else {
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
// AUDIENCE QUALITY SCORERS
// =============================================================================
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
export async function scoreAudienceCompleteness(output, currentStep, cacAggressiveness) {
    // Only score in Steps 3-4 when audience is being defined
    if (currentStep < 3 || currentStep > 4) {
        return {
            scorer: "audience-completeness",
            score: 1.0,
            metadata: { status: "not_applicable" },
            scope: "turn",
        };
    }
    const prompt = `Evaluate if this agent response collects appropriate audience targeting depth.

AGENT RESPONSE: "${output}"

CAC AGGRESSIVENESS: ${cacAggressiveness}
- aggressive = 30%+ below benchmark, requires tight targeting (20-40 signals across all 4 dimensions)
- moderate = within benchmark range, requires standard targeting (10-20 signals)
- conservative/brand awareness = broad targeting acceptable (5-10 signals)

FOUR TARGETING DIMENSIONS:
1. DEMOGRAPHIC: Age, income, household composition, life stage
2. BEHAVIORAL: Purchase patterns, triggers, frequency, brand affinity
3. CONTEXTUAL: Interests, platform preferences, content consumption
4. GEOGRAPHIC: DMA scope, audience SIZE per geography

SCORING CRITERIA:
- Does agent probe for ALL relevant dimensions (not just demographics)?
- Does depth match efficiency requirements (aggressive CAC = more signals)?
- Does agent connect targeting precision to CAC achievability?
- Does agent avoid treating partial definitions as complete?

A = Probes all 4 dimensions with depth appropriate to CAC target, connects precision to efficiency
B = Probes multiple dimensions, mostly appropriate depth
C = Probes some dimensions but misses important ones or insufficient depth for CAC target
D = Only demographic targeting, treating partial as complete
F = Skips audience depth entirely, moves to budget prematurely

Reply with ONLY one letter: A, B, C, D, or F`;
    const letter = await llmJudge(prompt);
    return {
        scorer: "audience-completeness",
        score: GRADE_SCORES[letter] ?? 0.5,
        metadata: { grade: letter, cacAggressiveness, currentStep },
        scope: "turn",
    };
}
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
export function scoreAudienceSizing(output, currentStep) {
    // Only score in Step 4 (Geography) or when transitioning to Step 5
    if (currentStep < 4) {
        return {
            scorer: "audience-sizing",
            score: 1.0,
            metadata: { status: "not_applicable" },
            scope: "turn",
        };
    }
    // Check for table presence
    const hasTable = /\|.*\|.*\|/.test(output);
    // Check for proper column structure (DMA/Geo, Population, Target Audience, %)
    const hasGeoColumn = /\|\s*(dma|geo|market|city|region|location)/i.test(output);
    const hasPopulationColumn = /\|\s*(total\s*)?(pop|population)/i.test(output);
    const hasTargetAudienceColumn = /\|\s*(target\s*)?(aud|audience|size)/i.test(output);
    const hasPercentColumn = /\|\s*(target\s*)?(%|pct|percent|penetration)/i.test(output);
    // Check for absolute numbers in target audience (not just percentages)
    const hasAbsoluteNumbers = /\|\s*[\d,]{4,}\s*\|/g.test(output); // Numbers with 4+ digits
    // Check for TOTAL/rollup row
    const hasTotalRow = /\|\s*(total|grand total|sum|rollup)/i.test(output);
    // Check for multiple DMAs (at least 2 data rows plus header and total)
    const tableRows = (output.match(/\|[^|]+\|[^|]+\|[^|]+\|/g) || []).length;
    const hasMultipleDMAs = tableRows >= 4; // header + 2 DMAs + total
    let score = 0;
    const checks = {
        hasTable,
        hasGeoColumn,
        hasPopulationColumn,
        hasTargetAudienceColumn,
        hasPercentColumn,
        hasAbsoluteNumbers,
        hasTotalRow,
        hasMultipleDMAs,
    };
    // Scoring: each component contributes to the score
    if (hasTable)
        score += 0.15;
    if (hasGeoColumn)
        score += 0.15;
    if (hasPopulationColumn)
        score += 0.15;
    if (hasTargetAudienceColumn)
        score += 0.15;
    if (hasPercentColumn)
        score += 0.1;
    if (hasAbsoluteNumbers)
        score += 0.15;
    if (hasTotalRow)
        score += 0.1;
    if (hasMultipleDMAs)
        score += 0.05;
    // If no table at all in Step 4, that's a problem
    if (!hasTable && currentStep === 4) {
        score = 0.3; // Partial credit for being in right step but missing table
    }
    return {
        scorer: "audience-sizing",
        score: Math.min(1.0, score),
        metadata: { ...checks, tableRows },
        scope: "turn",
    };
}
/**
 * Score precision-to-CAC connection
 *
 * The agent MUST connect targeting precision to CAC achievability:
 * - Aggressive CAC targets require tight targeting
 * - Moderate targets allow standard approaches
 * - Agent should explicitly state this connection
 */
export async function scorePrecisionConnection(output, currentStep) {
    // Only score in Steps 2-4 when economics and audience are being discussed
    if (currentStep < 2 || currentStep > 4) {
        return {
            scorer: "precision-connection",
            score: 1.0,
            metadata: { status: "not_applicable" },
            scope: "turn",
        };
    }
    const prompt = `Does this agent response connect targeting precision to efficiency/CAC achievability?

AGENT RESPONSE: "${output}"

LOOK FOR:
- Explicit connection between CAC target and required targeting precision
- Language like "to hit $X CAC, we need tight/standard/broad targeting"
- Acknowledgment that aggressive efficiency requires more targeting signals
- Warning if targeting is too loose for stated efficiency goals

A = Explicitly connects precision to CAC target with clear rationale
B = Mentions both precision and efficiency but connection is implicit
C = Discusses targeting OR efficiency but doesn't connect them
D = Discusses neither meaningfully
F = Moves past targeting without addressing precision requirements

Reply with ONLY one letter: A, B, C, D, or F`;
    const letter = await llmJudge(prompt);
    return {
        scorer: "precision-connection",
        score: GRADE_SCORES[letter] ?? 0.5,
        metadata: { grade: letter, currentStep },
        scope: "turn",
    };
}
/**
 * Score response formatting (visual hierarchy)
 *
 * Checks if calculations are on their own lines, tables used for
 * comparative data, and visual breaks separate distinct concepts.
 */
export function scoreResponseFormatting(output) {
    // Check for calculations on own line (equation followed by newline or at start of line)
    const hasCalculations = /[\d,]+\s*[\/×x÷]\s*[\d,]+\s*=/.test(output) ||
        /=\s*\$[\d,]+/.test(output);
    // If there are calculations, check if they're on their own line
    const calculationsOnOwnLine = hasCalculations ?
        /(\n|^)\s*\$?[\d,]+\s*[\/×x÷]\s*[\d,]+\s*=\s*\$?[\d,]+/.test(output) ||
            /(\n|^)\s*\$[\d,]+\s*[\/÷]\s*[\d,]+\s*=/.test(output) : true;
    // Check for table usage when multiple items are compared
    const hasMultipleItems = /\b(los angeles|new york|chicago|houston|dallas|phoenix|dma|market)\b/gi.test(output);
    const itemMatches = output.match(/\b(los angeles|new york|chicago|houston|dallas|phoenix)\b/gi) || [];
    const multipleGeographies = itemMatches.length >= 2;
    const hasTable = /\|.*\|.*\|/.test(output);
    const tableUsedForComparison = !multipleGeographies || hasTable;
    // Check for visual breaks (blank lines between sections)
    const hasParagraphBreaks = /\n\s*\n/.test(output);
    // Check for wall-of-text (long paragraphs without breaks)
    const sentences = output.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const isWallOfText = sentences.length > 4 && !hasParagraphBreaks;
    let score = 1.0;
    if (hasCalculations && !calculationsOnOwnLine) {
        score -= 0.3; // Calculations embedded in prose
    }
    if (multipleGeographies && !hasTable) {
        score -= 0.3; // Multiple items without table
    }
    if (isWallOfText) {
        score -= 0.2; // Wall of text without breaks
    }
    return {
        scorer: "response-formatting",
        score: Math.max(0, score),
        metadata: {
            hasCalculations,
            calculationsOnOwnLine,
            multipleGeographies,
            hasTable,
            hasParagraphBreaks,
            isWallOfText,
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
export async function scoreTurn(userMessage, agentResponse, currentStep, stepState, userSophistication, cacAggressiveness = "unknown", conversationHistory) {
    const scores = {};
    // Code-based scorers (run synchronously)
    scores["response-length"] = scoreResponseLength(agentResponse);
    scores["single-question"] = scoreSingleQuestion(agentResponse);
    scores["step-boundary"] = scoreStepBoundary(agentResponse, currentStep);
    scores["source-citation"] = scoreSourceCitation(agentResponse);
    scores["acronym-definition"] = scoreAcronymDefinition(agentResponse, conversationHistory);
    scores["idk-protocol"] = scoreIdkProtocol(userMessage, agentResponse);
    scores["calculation-presence"] = scoreCalculationPresence(agentResponse, userMessage);
    scores["response-formatting"] = scoreResponseFormatting(agentResponse);
    scores["audience-sizing"] = scoreAudienceSizing(agentResponse, currentStep);
    // LLM-based scorers (run in parallel)
    const hasEnoughData = stepState.collectedData[currentStep]?.minimumViableMet || false;
    const [adaptiveScore, proactiveScore, progressScore, riskScore, audienceCompletenessScore, precisionConnectionScore,] = await Promise.all([
        scoreAdaptiveSophistication(userMessage, agentResponse, userSophistication),
        scoreProactiveIntelligence(userMessage, agentResponse, hasEnoughData),
        scoreProgressOverPerfection(userMessage, agentResponse),
        scoreRiskOpportunityFlagging(userMessage, agentResponse, currentStep),
        scoreAudienceCompleteness(agentResponse, currentStep, cacAggressiveness),
        scorePrecisionConnection(agentResponse, currentStep),
    ]);
    scores["adaptive-sophistication"] = adaptiveScore;
    scores["proactive-intelligence"] = proactiveScore;
    scores["progress-over-perfection"] = progressScore;
    scores["risk-opportunity-flagging"] = riskScore;
    scores["audience-completeness"] = audienceCompletenessScore;
    scores["precision-connection"] = precisionConnectionScore;
    return scores;
}
export default scoreTurn;
//# sourceMappingURL=turn-scorers.js.map