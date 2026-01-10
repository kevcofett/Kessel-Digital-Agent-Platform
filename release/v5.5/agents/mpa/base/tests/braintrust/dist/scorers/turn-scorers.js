"use strict";
/**
 * Per-Turn Scorers for Multi-Turn MPA Evaluation
 *
 * Scorers that are applied to each individual turn.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreResponseLength = scoreResponseLength;
exports.scoreSingleQuestion = scoreSingleQuestion;
exports.scoreStepBoundary = scoreStepBoundary;
exports.scoreSourceCitation = scoreSourceCitation;
exports.scoreAcronymDefinition = scoreAcronymDefinition;
exports.scoreIdkProtocol = scoreIdkProtocol;
exports.scoreAdaptiveSophistication = scoreAdaptiveSophistication;
exports.scoreProactiveIntelligence = scoreProactiveIntelligence;
exports.scoreProgressOverPerfection = scoreProgressOverPerfection;
exports.scoreRiskOpportunityFlagging = scoreRiskOpportunityFlagging;
exports.scoreCalculationPresence = scoreCalculationPresence;
exports.scoreTurn = scoreTurn;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const mpa_multi_turn_types_js_1 = require("../mpa-multi-turn-types.js");
const anthropic = new sdk_1.default({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
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
function scoreResponseLength(output) {
    const wordCount = output.trim().split(/\s+/).length;
    let score = 0;
    let status = "too_long";
    if (wordCount <= 100) {
        score = 1.0;
        status = "optimal";
    }
    else if (wordCount <= 200) {
        score = 0.8;
        status = "acceptable";
    }
    else if (wordCount <= 300) {
        score = 0.5;
        status = "slightly_verbose";
    }
    else {
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
function scoreSingleQuestion(output) {
    const questionMarks = (output.match(/\?/g) || []).length;
    let score = 0;
    if (questionMarks <= 1) {
        score = 1.0;
    }
    else if (questionMarks === 2) {
        score = 0.8;
    }
    else if (questionMarks === 3) {
        score = 0.4;
    }
    else {
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
 * Score step boundary compliance (no channels in Steps 1-2)
 */
function scoreStepBoundary(output, currentStep) {
    if (currentStep > 2) {
        return {
            scorer: "step-boundary",
            score: 1.0,
            metadata: { status: "not_applicable" },
            scope: "turn",
        };
    }
    const forbiddenPatterns = [
        /\b(pacing|flighting)\b/i,
        /\b(channel mix|media mix)\b/i,
        /\b(facebook ads|google ads|tiktok|instagram|linkedin)\b/i,
        /\b(programmatic|display|video|ctv)\b/i,
        /\b(creative|messaging|ad copy)\b/i,
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
 * More lenient scoring - the agent often naturally integrates user data
 * without explicit citation phrases. We look for contextual indicators.
 */
function scoreSourceCitation(output) {
    const hasNumbers = /\$[\d,]+|\d+%|\d+\s*(dollars|percent|customers|leads)/i.test(output);
    if (!hasNumbers) {
        return {
            scorer: "source-citation",
            score: 1.0,
            metadata: { status: "no_data_claims" },
            scope: "turn",
        };
    }
    // Explicit source patterns (highest score)
    const explicitSourcePatterns = [
        /based on your input/i,
        /based on kb/i,
        /based on knowledge base/i,
        /based on web search/i,
        /based on.*benchmark/i,
        /my estimate/i,
        /industry.*typical/i,
        /market.*shows/i,
        /according to/i,
        /typical.*range/i,
    ];
    // Implicit contextual patterns (still acceptable)
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
    ];
    const hasExplicitSource = explicitSourcePatterns.some((p) => p.test(output));
    const hasImplicitSource = implicitPatterns.some((p) => p.test(output));
    let score = 0;
    if (hasExplicitSource) {
        score = 1.0;
    }
    else if (hasImplicitSource) {
        score = 0.8;
    }
    else {
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
function scoreAcronymDefinition(output) {
    const acronymPatterns = [
        { acronym: "CAC", definition: /customer acquisition cost/i },
        { acronym: "ROAS", definition: /return on ad spend/i },
        { acronym: "LTV", definition: /lifetime value/i },
        { acronym: "CPM", definition: /cost per (thousand|mille)/i },
        { acronym: "CPA", definition: /cost per acquisition/i },
        { acronym: "CPC", definition: /cost per click/i },
        { acronym: "CTR", definition: /click.?through rate/i },
    ];
    const usedAcronyms = [];
    const undefinedAcronyms = [];
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
    const score = undefinedAcronyms.length === 0
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
function scoreIdkProtocol(input, output) {
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
    const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{ role: "user", content: prompt }],
    });
    const textBlock = response.content[0];
    return textBlock.text.trim().toUpperCase().charAt(0);
}
/**
 * Score adaptive sophistication (language matches user level)
 */
async function scoreAdaptiveSophistication(input, output, userLevel) {
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
async function scoreProactiveIntelligence(input, output, hasEnoughData) {
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
        score: mpa_multi_turn_types_js_1.GRADE_SCORES[letter] ?? 0.5,
        metadata: { grade: letter },
        scope: "turn",
    };
}
/**
 * Score progress over perfection (keeps momentum vs blocking)
 */
async function scoreProgressOverPerfection(input, output) {
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
        score: mpa_multi_turn_types_js_1.GRADE_SCORES[letter] ?? 0.5,
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
async function scoreRiskOpportunityFlagging(input, output, currentStep) {
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
        score: mpa_multi_turn_types_js_1.GRADE_SCORES[letter] ?? 0.5,
        metadata: { grade: letter, currentStep },
        scope: "turn",
    };
}
/**
 * Score calculation and modeling presence
 *
 * Code-based check for whether the response contains calculations,
 * projections, or mathematical modeling.
 */
function scoreCalculationPresence(output) {
    // Patterns that indicate calculations or modeling
    const calculationPatterns = [
        /\$[\d,]+\s*[\/×x]\s*[\d,]+/i, // $X / Y or $X x Y
        /[\d,]+\s*[\/×x]\s*[\d,]+\s*=\s*[\$\d]/i, // X / Y = $Z
        /equals?\s*\$?[\d,]+/i, // equals $X
        /=\s*\$?[\d,]+/i, // = $X
        /approximately\s*\$?[\d,]+/i, // approximately $X
        /\b(project(ed|ion)|forecast|model(ing|ed)?|estimat(e|ed|ing))\b/i,
        /\b(implies|suggests|indicates)\s+\$?[\d,]+/i,
        /\bper\s+(customer|lead|unit|acquisition)/i,
    ];
    const hasCalculation = calculationPatterns.some((p) => p.test(output));
    // Also check for percentage calculations
    const percentagePatterns = [
        /[\d]+%\s*(of|allocation)/i,
        /\b(allocat(e|ing)|budget(ed)?)\s*[\d]+%/i,
    ];
    const hasPercentage = percentagePatterns.some((p) => p.test(output));
    let score = 0;
    if (hasCalculation)
        score = 1.0;
    else if (hasPercentage)
        score = 0.7;
    else
        score = 0.5; // Neutral - calculation may not be applicable
    return {
        scorer: "calculation-presence",
        score,
        metadata: { hasCalculation, hasPercentage },
        scope: "turn",
    };
}
// =============================================================================
// AGGREGATED SCORER
// =============================================================================
/**
 * Score a single turn with all applicable scorers
 */
async function scoreTurn(userMessage, agentResponse, currentStep, stepState, userSophistication) {
    const scores = {};
    // Code-based scorers (run synchronously)
    scores["response-length"] = scoreResponseLength(agentResponse);
    scores["single-question"] = scoreSingleQuestion(agentResponse);
    scores["step-boundary"] = scoreStepBoundary(agentResponse, currentStep);
    scores["source-citation"] = scoreSourceCitation(agentResponse);
    scores["acronym-definition"] = scoreAcronymDefinition(agentResponse);
    scores["idk-protocol"] = scoreIdkProtocol(userMessage, agentResponse);
    scores["calculation-presence"] = scoreCalculationPresence(agentResponse);
    // LLM-based scorers (run in parallel)
    const hasEnoughData = stepState.collectedData[currentStep]?.minimumViableMet || false;
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
exports.default = scoreTurn;
//# sourceMappingURL=turn-scorers.js.map