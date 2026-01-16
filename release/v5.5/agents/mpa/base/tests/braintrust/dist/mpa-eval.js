/**
 * MPA Evaluation Runner v6.1
 *
 * Runs the MPA prompt against test cases and scores with custom scorers.
 * Updated for v6.1 instruction patterns including:
 * - DATA CONFIDENCE (source reliability)
 * - AUTOMATIC BENCHMARK COMPARISON
 * - Platform taxonomy usage
 * - Geography/census data
 *
 * Usage:
 *   BRAINTRUST_API_KEY=xxx ANTHROPIC_API_KEY=xxx npx braintrust eval dist/mpa-eval.js
 */
import { Eval } from "braintrust";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { readFileSync } from "fs";
// Load environment variables
config({ path: "/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env" });
// Load MPA instructions from file - default to v6.1
const INSTRUCTIONS_PATH = process.env.MPA_INSTRUCTIONS_PATH ||
    "/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/personal/instructions/MPA_Copilot_Instructions_v6_1.txt";
function loadInstructions() {
    try {
        return readFileSync(INSTRUCTIONS_PATH, "utf-8");
    }
    catch (error) {
        console.error(`Failed to load instructions from ${INSTRUCTIONS_PATH}:`, error);
        throw error;
    }
}
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
// Load MPA instructions dynamically
const MPA_SYSTEM_PROMPT = loadInstructions();
console.log(`Loaded MPA instructions from: ${INSTRUCTIONS_PATH} (${MPA_SYSTEM_PROMPT.length} chars)`);
// =============================================================================
// KB DOCUMENTS FOR RAG SIMULATION
// =============================================================================
const KB_BENCHMARK_DATA = `[KNOWLEDGE BASE DOCUMENT: BENCHMARK DATA]

ECOMMERCE BENCHMARKS
Based on KB data for ecommerce, typical CAC ranges from 35 to 65 dollars.
Typical ROAS runs 3x to 5x for mature DTC brands.
CPM on paid social typically runs 8 to 15 dollars for ecommerce.

RETAIL BENCHMARKS
Based on KB data for retail, typical CAC ranges from 25 to 55 dollars.
Q4 holiday season typically sees 15 to 25 percent higher CPMs.
Store visit attribution typically shows 2x to 4x online-only measurement.

FINANCE BENCHMARKS
Based on KB data for finance, typical CAC ranges from 80 to 200 dollars.
Regulated categories see 20 to 40 percent higher CPCs due to compliance.
Lead quality matters more than volume in finance.

B2B BENCHMARKS
Based on KB data for B2B, typical cost per SQL ranges from 150 to 500 dollars.
LinkedIn CPCs run 8 to 15 dollars for enterprise targeting.
Sales cycles of 6 to 12 months require patience.

[END KNOWLEDGE BASE DOCUMENT]`;
const KB_ADAPTIVE_LANGUAGE = `[KNOWLEDGE BASE DOCUMENT: ADAPTIVE LANGUAGE GUIDE]

DETECTING SOPHISTICATION LEVEL

SIMPLE USER SIGNALS
User demonstrates simple sophistication when their input contains everyday language without industry jargon, round numbers without precision, casual phrasing like want more customers or get sales, questions that reveal unfamiliarity with marketing concepts, or no mention of metrics like CAC ROAS LTV CPA.

SOPHISTICATED USER SIGNALS
User demonstrates high sophistication when their input contains industry terminology used correctly, specific metrics with context like LTV CAC ratio or contribution margin, unit economics discussion, precise numbers with business logic, or references to attribution incrementality or optimization.

[END KNOWLEDGE BASE DOCUMENT]`;
// =============================================================================
// TEST CASES - EXPANDED FOR V6.1 CAPABILITIES
// =============================================================================
const testCases = [
    // BASIC STEP 1-2 SCENARIOS
    {
        name: "Step 1 - Initial Brief (Ecommerce)",
        input: {
            message: "We're an online furniture store with $200,000 to spend. We want to acquire 4,000 new customers.",
            context: "First interaction",
        },
        expected: {
            behaviors: [
                "Calculates implied CAC ($50)",
                "Compares to ecommerce benchmarks",
                "Labels feasibility (realistic/aggressive/conservative)",
                "Does NOT just ask another question",
            ],
        },
        metadata: { currentStep: 1, hasEnoughDataToModel: true, vertical: "ECOMMERCE" },
    },
    {
        name: "Step 1 - Target Comparison",
        input: {
            message: "We're a remittance company. Budget is $250,000 and we want 5,000 new customers.",
            context: "First interaction",
        },
        expected: {
            behaviors: [
                "Acknowledges remittance context",
                "Calculates implied CAC ($50)",
                "Compares to KB benchmark data",
                "Indicates where target falls vs typical",
            ],
        },
        metadata: { currentStep: 1, hasEnoughDataToModel: true, vertical: "FINANCE" },
    },
    {
        name: "Step 2 - I Don't Know (LTV/Profit)",
        input: {
            message: "I don't know what our profit per customer is",
            context: "Previous: 5,000 customers, $50 CAC, ecommerce company",
        },
        expected: {
            behaviors: [
                "Models using KB benchmark assumption",
                "Cites source clearly (Based on KB data)",
                "Offers to refine later",
                "Moves on to next question",
                "Does NOT keep asking about profit",
            ],
        },
        metadata: { currentStep: 2, hasEnoughDataToModel: true, vertical: "ECOMMERCE" },
    },
    // DATA CONFIDENCE SCENARIOS
    {
        name: "Data Confidence - User Data vs Estimate",
        input: {
            message: "Our average order value is $150 and we expect 3 purchases per customer lifetime.",
            context: "Building unit economics, ecommerce",
        },
        expected: {
            behaviors: [
                "Uses user-provided data ($150 AOV, 3x purchases)",
                "Indicates this is from their input",
                "Calculates LTV ($450)",
                "Sources the calculation clearly",
            ],
        },
        metadata: { currentStep: 2, hasEnoughDataToModel: true },
    },
    {
        name: "Data Confidence - Estimate with Validation Path",
        input: {
            message: "What should our target ROAS be?",
            context: "Ecommerce, $200K budget, no ROAS history provided",
        },
        expected: {
            behaviors: [
                "Provides benchmark from KB",
                "Clearly indicates it's KB/benchmark data",
                "May recommend validating with actual data",
                "Does not present as user-specific fact",
            ],
        },
        metadata: { currentStep: 2, hasEnoughDataToModel: true, vertical: "ECOMMERCE" },
    },
    // SOPHISTICATED USER SCENARIOS
    {
        name: "Sophisticated User - Tech Jargon",
        input: {
            message: "Our LTV:CAC is currently 2.8x with 15% contribution margin. We need to hit $75 CAC to maintain unit economics at scale.",
            context: "First interaction with sophisticated user",
        },
        expected: {
            behaviors: [
                "Matches sophisticated language level",
                "Engages with unit economics concepts",
                "Does NOT over-simplify terminology",
                "Asks relevant follow-up at same complexity level",
            ],
        },
        metadata: { currentStep: 2, userSophistication: "high" },
    },
    {
        name: "Simple User - Basic Language",
        input: {
            message: "We sell shoes online and want more customers. Budget is $100k.",
            context: "First interaction with basic user",
        },
        expected: {
            behaviors: [
                "Uses simple, everyday language",
                "Avoids jargon like CAC, ROAS unless defined",
                "Asks about customer goals in plain terms",
                "Warm, approachable tone",
            ],
        },
        metadata: { currentStep: 1, userSophistication: "low" },
    },
    // AUTOMATIC BENCHMARK COMPARISON SCENARIOS
    {
        name: "Automatic Comparison - Aggressive Target",
        input: {
            message: "Actually, we want to acquire 8,000 customers with that $200K budget.",
            context: "Changed from 4,000 to 8,000 customers, ecommerce",
        },
        expected: {
            behaviors: [
                "Recalculates implied CAC ($25)",
                "Compares to benchmark automatically",
                "Labels as aggressive (below typical range)",
                "Explains what's required to achieve",
            ],
        },
        metadata: { currentStep: 1, hasEnoughDataToModel: true, vertical: "ECOMMERCE" },
    },
    {
        name: "Automatic Comparison - Conservative Target",
        input: {
            message: "Let's be safe and target just 2,000 customers with $200K.",
            context: "Ecommerce, revised target down",
        },
        expected: {
            behaviors: [
                "Calculates implied CAC ($100)",
                "Compares to benchmark",
                "Labels as conservative (above typical)",
                "Notes headroom for learning/testing",
            ],
        },
        metadata: { currentStep: 1, hasEnoughDataToModel: true, vertical: "ECOMMERCE" },
    },
    // FEASIBILITY FRAMING SCENARIOS
    {
        name: "Feasibility - Healthcare High CAC",
        input: {
            message: "We're a regional hospital. $600K budget to get 400 new patient appointments.",
            context: "Healthcare vertical",
        },
        expected: {
            behaviors: [
                "Calculates implied cost per appointment ($1,500)",
                "References healthcare-specific benchmarks",
                "Labels feasibility for regulated market",
                "Notes compliance considerations",
            ],
        },
        metadata: { currentStep: 1, hasEnoughDataToModel: true, vertical: "HEALTHCARE" },
    },
    {
        name: "Feasibility - B2B Long Sales Cycle",
        input: {
            message: "We need 300 qualified demos for our enterprise software. Budget is $500K.",
            context: "B2B enterprise software",
        },
        expected: {
            behaviors: [
                "Calculates implied cost per demo (~$1,667)",
                "References B2B benchmarks",
                "Notes enterprise sales cycle context",
                "Compares to typical B2B ranges",
            ],
        },
        metadata: { currentStep: 1, hasEnoughDataToModel: true, vertical: "B2B_PROFESSIONAL" },
    },
    // =============================================================================
    // STEP 3 SCENARIOS - Platform Taxonomy & Behavioral Targeting
    // =============================================================================
    {
        name: "Step 3 - Audience Targeting (B2B)",
        input: {
            message: "How should we target IT decision makers for our cybersecurity software?",
            context: "B2B software, $500K budget, 300 demos target. Step 3 audience.",
        },
        expected: {
            behaviors: [
                "References LinkedIn job function/seniority targeting",
                "May mention Google in-market audiences",
                "Discusses platform-specific options",
                "Recommends behavioral layering",
            ],
        },
        metadata: { currentStep: 3, hasEnoughDataToModel: true, vertical: "B2B_PROFESSIONAL" },
    },
    {
        name: "Step 3 - Behavioral Signals",
        input: {
            message: "What behavioral signals should we layer on top of the IT audience?",
            context: "B2B targeting IT directors, cybersecurity software. Step 3.",
        },
        expected: {
            behaviors: [
                "References behavioral targeting signals",
                "Discusses purchase intent signals",
                "Mentions engagement patterns or browsing behavior",
                "Platform-specific behavioral options",
            ],
        },
        metadata: { currentStep: 3, hasEnoughDataToModel: true, vertical: "B2B_PROFESSIONAL" },
    },
    {
        name: "Step 3 - Consumer Audience (Ecommerce)",
        input: {
            message: "How do we reach fitness enthusiasts on Facebook and Google?",
            context: "DTC fitness brand, $300K budget. Step 3 audience.",
        },
        expected: {
            behaviors: [
                "References Meta/Facebook interest targeting",
                "References Google affinity audiences",
                "Fitness-specific segment recommendations",
            ],
        },
        metadata: { currentStep: 3, hasEnoughDataToModel: true, vertical: "ECOMMERCE" },
    },
    // =============================================================================
    // STEP 4 SCENARIOS - Geography & Census Data
    // =============================================================================
    {
        name: "Step 4 - Geography Sizing",
        input: {
            message: "What's the total addressable market in the Dallas and Houston DMAs?",
            context: "Regional bank, Texas expansion. Step 4 geography.",
        },
        expected: {
            behaviors: [
                "References DMA population data",
                "Provides specific population numbers",
                "May note household counts",
                "Indicates data source",
            ],
        },
        metadata: { currentStep: 4, hasEnoughDataToModel: true, vertical: "FINANCE" },
    },
    {
        name: "Step 4 - Budget Allocation by Geography",
        input: {
            message: "How should we split the $800K budget between Dallas and Houston?",
            context: "Regional bank, Texas expansion. Population-based allocation.",
        },
        expected: {
            behaviors: [
                "Uses population/market size for allocation",
                "Provides specific percentages",
                "May reference demographic differences",
                "Shows data-driven reasoning",
            ],
        },
        metadata: { currentStep: 4, hasEnoughDataToModel: true, vertical: "FINANCE" },
    },
];
// =============================================================================
// TASK FUNCTION
// =============================================================================
async function runMPA(input, kbContent) {
    const messages = [];
    // Build system prompt with KB content (RAG simulation)
    let systemPrompt = MPA_SYSTEM_PROMPT;
    if (kbContent) {
        systemPrompt += "\n\n" + kbContent;
    }
    // Always include benchmark data for comparison tests
    systemPrompt += "\n\n" + KB_BENCHMARK_DATA;
    // Add context as prior assistant message if provided
    if (input.context) {
        messages.push({
            role: "assistant",
            content: `[Context from conversation: ${input.context}]`,
        });
    }
    messages.push({
        role: "user",
        content: input.message,
    });
    const response = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages,
    });
    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock?.text || "";
}
// =============================================================================
// SCORERS - UPDATED FOR V6.1 PATTERNS
// =============================================================================
function scoreResponseLength(output) {
    const wordCount = output.trim().split(/\s+/).length;
    if (wordCount <= 75)
        return { score: 1.0, metadata: { wordCount, status: "optimal" } };
    if (wordCount <= 150)
        return { score: 0.5, metadata: { wordCount, status: "acceptable" } };
    return { score: 0, metadata: { wordCount, status: "too_long" } };
}
function scoreSingleQuestion(output) {
    const questionMarks = (output.match(/\?/g) || []).length;
    if (questionMarks <= 1)
        return { score: 1.0, metadata: { questionCount: questionMarks } };
    return { score: 0, metadata: { questionCount: questionMarks, status: "multiple_questions" } };
}
function scoreIdkProtocol(input, output) {
    const userSaysIDK = /i don'?t know|not sure|no idea|uncertain/i.test(input);
    if (!userSaysIDK) {
        return { score: 1.0, metadata: { status: "not_applicable" } };
    }
    // V6.1: Look for KB benchmark reference specifically
    const modelsWithKB = /based on kb|kb (data|benchmark)|using kb|kb for/i.test(output);
    const modelsAssumption = /i('ll| will) (model|use|assume)|based on|using.*benchmark/i.test(output);
    const offersRefinement = /(you can|feel free to|adjust|refine) (this |it )?anytime/i.test(output);
    const movesOn = /moving on|next|let'?s/i.test(output);
    const keepsPushing = /what is your|can you tell|do you have|please provide/i.test(output);
    let score = 0;
    if (modelsWithKB)
        score += 0.4; // V6.1: Higher weight for KB reference
    if (modelsAssumption)
        score += 0.2;
    if (offersRefinement)
        score += 0.2;
    if (movesOn)
        score += 0.2;
    if (keepsPushing)
        score -= 0.5;
    return {
        score: Math.max(0, Math.min(1, score)),
        metadata: { modelsWithKB, modelsAssumption, offersRefinement, movesOn, keepsPushing }
    };
}
function scoreStepBoundary(output, currentStep) {
    if (currentStep > 2) {
        return { score: 1.0, metadata: { status: "not_applicable" } };
    }
    const forbiddenPatterns = [
        /\b(pacing|flighting)\b/i,
        /\b(channel mix|media mix)\b/i,
        /\b(facebook ads|google ads|tiktok|instagram)\b/i,
        /\b(programmatic|display|video)\b/i,
    ];
    const violations = forbiddenPatterns.filter((p) => p.test(output));
    return {
        score: violations.length === 0 ? 1.0 : 0,
        metadata: { currentStep, violationCount: violations.length }
    };
}
// V6.1: Updated source citation to match DATA CONFIDENCE patterns
function scoreSourceCitation(output) {
    const hasNumbers = /\$[\d,]+|\d+%|\d+\s*(dollars|percent|customers|users)/i.test(output);
    if (!hasNumbers) {
        return { score: 1.0, metadata: { hasData: false, status: "no_data_claims" } };
    }
    // V6.1 DATA CONFIDENCE patterns
    const sourcePatterns = [
        /based on (your|what you|the) (input|data|shared|budget|target)/i, // User data
        /your (budget|target|goal|kpi) of/i, // User-provided
        /based on kb/i, // KB data
        /kb (data|benchmark)/i, // KB reference
        /typical(ly)? (for|in|range|runs?)/i, // Benchmark language
        /industry (benchmark|average|typical)/i, // Industry data
        /my estimate/i, // Explicit estimate
        /recommend (validating|checking)/i, // Validation path
    ];
    const matchedPatterns = sourcePatterns.filter(p => p.test(output));
    const hasSource = matchedPatterns.length > 0;
    return {
        score: hasSource ? 1.0 : 0,
        metadata: { hasData: true, hasSource, patternsMatched: matchedPatterns.length }
    };
}
// V6.1: Automatic benchmark comparison scorer
function scoreAutomaticBenchmarkComparison(input, output) {
    // Check if user provided a target
    const targetPatterns = [
        /\$[\d,]+k?\s*(budget|spend)/i,
        /(\d+[,\d]*)\s*(customers?|users?|leads?|downloads?)/i,
        /acquire\s*(\d+[,\d]*)/i,
        /target(ing)?\s*\d+/i,
    ];
    const userProvidedTarget = targetPatterns.some(p => p.test(input));
    if (!userProvidedTarget) {
        return { score: 1.0, metadata: { status: "no_target_provided" } };
    }
    // Check for benchmark comparison
    const comparisonPatterns = [
        /based on kb/i,
        /typical(ly)?\s*(range|is|runs?)/i,
        /benchmark/i,
        /compared?\s*to/i,
    ];
    const hasBenchmarkComparison = comparisonPatterns.some(p => p.test(output));
    // Check for feasibility assessment
    const feasibilityPatterns = [
        /realistic/i,
        /aggressive/i,
        /ambitious/i,
        /conservative/i,
        /achievable/i,
        /within\s*(typical\s*)?range/i,
    ];
    const hasFeasibilityAssessment = feasibilityPatterns.some(p => p.test(output));
    // Check for calculation
    const hasCalculation = /(that('s| is)|implies?|means?|works? out to)\s*\$?[\d,]+/i.test(output);
    let score = 0;
    if (hasBenchmarkComparison && hasFeasibilityAssessment)
        score = 1.0;
    else if (hasBenchmarkComparison)
        score = 0.7;
    else if (hasFeasibilityAssessment && hasCalculation)
        score = 0.5;
    else if (hasCalculation)
        score = 0.3;
    return {
        score,
        metadata: {
            userProvidedTarget,
            hasBenchmarkComparison,
            hasFeasibilityAssessment,
            hasCalculation,
        }
    };
}
// V6.1: Updated feasibility framing
function scoreFeasibilityFraming(output) {
    // Assessment words (aggressive/conservative/realistic)
    const hasAssessment = /aggressive|ambitious|challenging|conservative|typical|realistic|achievable/i.test(output);
    // Source reference (based on KB, benchmark, typical range)
    const hasSource = /based on kb|benchmark|typical.*range|industry|kb data/i.test(output);
    // Path forward (what's required)
    const hasPath = /to (hit|achieve|reach)|you('ll| will) need|requires|demands/i.test(output);
    let score = 0;
    if (hasAssessment)
        score += 0.4;
    if (hasSource)
        score += 0.4;
    if (hasPath)
        score += 0.2;
    return { score, metadata: { hasAssessment, hasSource, hasPath } };
}
function scoreAcronymDefinition(output) {
    const acronyms = ["CAC", "ROAS", "LTV", "CPM", "CPA", "CPC", "CTR", "CVR", "AOV", "MQL", "SQL"];
    const definitions = {
        "CAC": /[Cc]ustomer [Aa]cquisition [Cc]ost/,
        "ROAS": /[Rr]eturn [Oo]n [Aa]d [Ss]pend/,
        "LTV": /[Ll]ifetime [Vv]alue/,
        "CPM": /[Cc]ost [Pp]er ([Tt]housand|[Mm]ille)/,
        "CPA": /[Cc]ost [Pp]er [Aa]cquisition/,
    };
    const used = [];
    const undefined_acronyms = [];
    for (const acronym of acronyms) {
        if (new RegExp(`\\b${acronym}\\b`).test(output)) {
            used.push(acronym);
            if (definitions[acronym] && !definitions[acronym].test(output)) {
                undefined_acronyms.push(acronym);
            }
        }
    }
    if (used.length === 0) {
        return { score: 1.0, metadata: { used: [], undefined: [], status: "no_acronyms" } };
    }
    const score = 1.0 - (undefined_acronyms.length / used.length);
    return { score, metadata: { used, undefined: undefined_acronyms } };
}
// V6.1: Updated RAG retrieval to match KB patterns
function scoreRagRetrieval(output) {
    // V6.1: More specific KB reference patterns
    const hasKBReference = /based on kb|kb (data|benchmark|for)|using kb|from kb/i.test(output);
    const hasSpecificData = /\$[\d,]+|\d+(\.\d+)?%|\d+(\.\d+)?x/i.test(output);
    const hasBenchmarkLanguage = /benchmark|typical(ly)?|range|industry (average|standard|data)/i.test(output);
    const hasVerticalContext = /(for|in) (ecommerce|retail|finance|b2b|healthcare|your vertical)/i.test(output);
    let score = 0;
    if (hasKBReference)
        score += 0.4;
    if (hasSpecificData)
        score += 0.2;
    if (hasBenchmarkLanguage)
        score += 0.2;
    if (hasVerticalContext)
        score += 0.2;
    return { score, metadata: { hasKBReference, hasSpecificData, hasBenchmarkLanguage, hasVerticalContext } };
}
// LLM-based scorers
async function scoreProgressOverPerfection(input, output) {
    const response = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{
                role: "user",
                content: `Rate this agent response for "Progress Over Perfection" - does it keep momentum vs getting stuck in refinement?

USER INPUT: "${input}"
AGENT OUTPUT: "${output}"

Score A-F where:
A = Excellent momentum, makes progress with clear assumptions
B = Good progress but could be more decisive
C = Sometimes gets stuck seeking perfect data
D = Frequently blocks progress
F = Completely stalls with endless questions

Reply with ONLY a single letter: A, B, C, D, or F`,
            }],
    });
    const letter = response.content[0].text.trim().toUpperCase();
    const scores = { A: 1.0, B: 0.8, C: 0.5, D: 0.2, F: 0 };
    return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}
async function scoreAdaptiveSophistication(input, output) {
    const response = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{
                role: "user",
                content: `Rate if the agent matches language complexity to user sophistication.

USER INPUT: "${input}"
AGENT OUTPUT: "${output}"

Score A-F where:
A = Perfectly matches user sophistication level
B = Mostly matches but occasional mismatch
C = Sometimes mismatches complexity
D = Consistently wrong complexity level
F = Completely ignores user signals

Reply with ONLY a single letter: A, B, C, D, or F`,
            }],
    });
    const letter = response.content[0].text.trim().toUpperCase();
    const scores = { A: 1.0, B: 0.8, C: 0.6, D: 0.3, F: 0 };
    return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}
async function scoreProactiveIntelligence(input, output, hasEnoughData) {
    if (!hasEnoughData) {
        return { score: 1.0, metadata: { status: "not_applicable" } };
    }
    const response = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{
                role: "user",
                content: `Rate if the agent shows proactive analysis vs just asking questions.

USER INPUT: "${input}"
AGENT OUTPUT: "${output}"

The agent has enough data to model. Does it DO THE MATH and guide with analysis?

Score A-F where:
A = Proactively calculates, shows math, guides with analysis
B = Shows some analysis but could do more
C = Asks questions when should be modeling
D = Only interrogates without analysis
F = Fails to leverage available data

Reply with ONLY a single letter: A, B, C, D, or F`,
            }],
    });
    const letter = response.content[0].text.trim().toUpperCase();
    const scores = { A: 1.0, B: 0.8, C: 0.5, D: 0.2, F: 0 };
    return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}
async function scoreTone(output) {
    const response = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{
                role: "user",
                content: `Rate this agent's tone for being warm, collegial, and supportive (like a sharp colleague):

AGENT OUTPUT: "${output}"

Score A-F where:
A = Perfect tone: warm, collegial, like a sharp colleague who wants them to win
B = Good tone with minor issues
C = Acceptable but mechanical or overly formal
D = Cold, distant, or condescending
F = Clearly inappropriate tone

Reply with ONLY a single letter: A, B, C, D, or F`,
            }],
    });
    const letter = response.content[0].text.trim().toUpperCase();
    const scores = { A: 1.0, B: 0.8, C: 0.6, D: 0.3, F: 0 };
    return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}
async function scoreStepCompletion(input, output) {
    const response = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{
                role: "user",
                content: `Rate if the agent knows when a step is complete and moves on appropriately.

USER INPUT: "${input}"
AGENT OUTPUT: "${output}"

Score A-F where:
A = Correctly identifies step completion and transitions
B = Mostly correct but asks one unnecessary follow-up
C = Over-asks but eventually moves on
D = Significantly over-refines before moving on
F = Fails to recognize when step is complete

Reply with ONLY a single letter: A, B, C, D, or F`,
            }],
    });
    const letter = response.content[0].text.trim().toUpperCase();
    const scores = { A: 1.0, B: 0.8, C: 0.5, D: 0.2, F: 0 };
    return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}
async function scoreSelfReferentialLearning(input, output) {
    const response = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{
                role: "user",
                content: `Rate if the agent references earlier conversation context accurately.

USER INPUT: "${input}"
AGENT OUTPUT: "${output}"

Score A-F where:
A = Perfectly references and builds on prior context
B = Good context retention with minor gaps
C = Some context referenced but misses key points
D = Poor context retention, makes user repeat info
F = Ignores prior context completely

Reply with ONLY a single letter: A, B, C, D, or F`,
            }],
    });
    const letter = response.content[0].text.trim().toUpperCase();
    const scores = { A: 1.0, B: 0.8, C: 0.5, D: 0.2, F: 0 };
    return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}
// =============================================================================
// V6.1 ADDITIONAL SCORERS
// =============================================================================
// V6.1: Data Confidence - validates source reliability indication
function scoreDataConfidence(output) {
    // Check if response contains data claims
    const hasDataClaims = /\$[\d,]+|\d+(\.\d+)?%|\d+x/i.test(output);
    if (!hasDataClaims) {
        return { score: 1.0, metadata: { status: "no_data_claims" } };
    }
    // High confidence sources (user data)
    const hasHighConfidence = /based on (your|what you|the) (input|data|shared)|you (said|mentioned|provided)/i.test(output);
    // KB/benchmark sources
    const hasKBConfidence = /based on kb|kb (data|benchmarks?)|industry (benchmark|data)|typical(ly)? (for|in|range)/i.test(output);
    // Estimates (lower confidence)
    const hasEstimate = /my estimate|i (estimate|would estimate)|rough(ly)?|approximately|ballpark/i.test(output);
    // Validation recommendation
    const hasValidationRec = /recommend (validating|checking)|validate (this|with)|check (this )?with|verify/i.test(output);
    let score = 0;
    if (hasEstimate && hasValidationRec)
        score = 1.0;
    else if (hasHighConfidence || hasKBConfidence)
        score = 1.0;
    else if (hasEstimate)
        score = 0.7;
    else if (hasHighConfidence || hasKBConfidence || hasEstimate)
        score = 0.5;
    else
        score = 0.2;
    return {
        score,
        metadata: { hasDataClaims, hasHighConfidence, hasKBConfidence, hasEstimate, hasValidationRec }
    };
}
// V6.1: Platform Taxonomy Usage - validates platform-specific targeting references
function scorePlatformTaxonomyUsage(output, input, currentStep) {
    // Only applicable for audience/channel steps (3+)
    if (currentStep < 3) {
        return { score: 1.0, metadata: { status: "not_applicable_early_step" } };
    }
    // Check if discussion involves audience/targeting
    const discussesTargeting = /audience|targeting|segment/i.test(input) || /audience|targeting|segment/i.test(output);
    if (!discussesTargeting) {
        return { score: 1.0, metadata: { status: "not_applicable_no_targeting" } };
    }
    // Platform-specific patterns
    const hasGoogleRef = /google\s*(ads?)?\s*(affinity|in-?market|custom)|affinity\s*audience|in-?market\s*(audience|segment)/i.test(output);
    const hasMetaRef = /(meta|facebook)\s*(interest|behavior|detailed)|lookalike\s*audience/i.test(output);
    const hasLinkedInRef = /linkedin\s*(job\s*function|seniority|industry|company)|matched\s*audience|account\s*targeting/i.test(output);
    const platformCount = [hasGoogleRef, hasMetaRef, hasLinkedInRef].filter(Boolean).length;
    let score = 0;
    if (platformCount >= 2)
        score = 1.0;
    else if (platformCount === 1)
        score = 0.8;
    else
        score = 0.4;
    return { score, metadata: { discussesTargeting, hasGoogleRef, hasMetaRef, hasLinkedInRef, platformCount } };
}
// V6.1: Geography/Census Usage - validates DMA/population data usage
function scoreGeographyCensusUsage(output, input, currentStep) {
    // Only applicable for geography step (4) or later
    if (currentStep < 4) {
        return { score: 1.0, metadata: { status: "not_applicable_early_step" } };
    }
    // Check if discussion involves geography
    const discussesGeography = /dma|metro|market\s*(area|region)|geographic|regional/i.test(input) ||
        /dma|metro|market\s*(area|region)|geographic|regional/i.test(output);
    if (!discussesGeography) {
        return { score: 1.0, metadata: { status: "not_applicable_no_geography" } };
    }
    // Census/population data patterns
    const hasCensusData = /census|population\s*(of|is|data)|(\d+(\.\d+)?)\s*million\s*(people|population|households)/i.test(output);
    const hasSizingData = /audience\s*size|market\s*size|reach\s*(of|is|\d)|total\s*addressable|tam/i.test(output);
    const hasSpecificNumbers = /(\d+(\.\d+)?)\s*(million|M|k|K|thousand)/i.test(output);
    let score = 0;
    if (hasCensusData && hasSpecificNumbers)
        score = 1.0;
    else if (hasSizingData && hasSpecificNumbers)
        score = 0.8;
    else if (hasCensusData || hasSizingData)
        score = 0.5;
    else
        score = 0.3;
    return { score, metadata: { discussesGeography, hasCensusData, hasSizingData, hasSpecificNumbers } };
}
// V6.1: Behavioral/Contextual Attribute Usage
function scoreBehavioralContextualUsage(output, input, currentStep) {
    // Only applicable for audience step (3) or later
    if (currentStep < 3) {
        return { score: 1.0, metadata: { status: "not_applicable_early_step" } };
    }
    // Check if discussion involves audience targeting
    const discussesAudience = /audience|targeting|segment/i.test(input) || /audience|targeting|segment/i.test(output);
    if (!discussesAudience) {
        return { score: 1.0, metadata: { status: "not_applicable_no_audience" } };
    }
    // Behavioral patterns
    const hasBehavioral = /behavioral\s*(data|targeting|signal)|purchase\s*(history|behavior|intent)|browsing|engagement\s*pattern|intent\s*signal/i.test(output);
    // Contextual patterns  
    const hasContextual = /contextual\s*(targeting|signal)|content\s*(category|context)|iab\s*(category|taxonomy)|brand\s*safety/i.test(output);
    let score = 0;
    if (hasBehavioral && hasContextual)
        score = 1.0;
    else if (hasBehavioral || hasContextual)
        score = 0.7;
    else
        score = 0.4;
    return { score, metadata: { discussesAudience, hasBehavioral, hasContextual } };
}
// =============================================================================
// MAIN EVALUATION
// =============================================================================
const versionMatch = INSTRUCTIONS_PATH.match(/v6_(\d+)/);
const versionStr = versionMatch ? `v6.${versionMatch[1]}` : "v6.x";
Eval("Kessel-MPA-Agent", {
    experimentName: `MPA ${versionStr} Eval - ${new Date().toISOString()}`,
    data: () => testCases.map((tc) => ({
        input: tc.input,
        expected: tc.expected,
        metadata: tc.metadata,
    })),
    task: async (input, hooks) => {
        const metadata = hooks?.metadata;
        const needsAdaptiveKB = metadata?.userSophistication !== undefined;
        return await runMPA(input, needsAdaptiveKB ? KB_ADAPTIVE_LANGUAGE : undefined);
    },
    scores: [
        // Tier 1: Core Quality
        async (args) => {
            const result = scoreResponseLength(args.output);
            return { name: "mpa-response-length", score: result.score, metadata: result.metadata };
        },
        async (args) => {
            const result = scoreSingleQuestion(args.output);
            return { name: "mpa-single-question", score: result.score, metadata: result.metadata };
        },
        async (args) => {
            const result = scoreIdkProtocol(args.input?.message, args.output);
            return { name: "mpa-idk-protocol", score: result.score, metadata: result.metadata };
        },
        async (args) => {
            const currentStep = args.metadata?.currentStep || 1;
            const result = scoreStepBoundary(args.output, currentStep);
            return { name: "mpa-step-boundary", score: result.score, metadata: result.metadata };
        },
        async (args) => {
            const result = await scoreProgressOverPerfection(args.input?.message, args.output);
            return { name: "mpa-progress-over-perfection", score: result.score, metadata: result.metadata };
        },
        async (args) => {
            const result = await scoreAdaptiveSophistication(args.input?.message, args.output);
            return { name: "mpa-adaptive-sophistication", score: result.score, metadata: result.metadata };
        },
        async (args) => {
            const hasEnoughData = args.metadata?.hasEnoughDataToModel || false;
            const result = await scoreProactiveIntelligence(args.input?.message, args.output, hasEnoughData);
            return { name: "mpa-proactive-intelligence", score: result.score, metadata: result.metadata };
        },
        // Tier 2: V6.1 Data Quality
        async (args) => {
            const result = scoreAcronymDefinition(args.output);
            return { name: "mpa-acronym-definition", score: result.score, metadata: result.metadata };
        },
        async (args) => {
            const result = scoreSourceCitation(args.output);
            return { name: "mpa-source-citation", score: result.score, metadata: result.metadata };
        },
        async (args) => {
            const result = scoreFeasibilityFraming(args.output);
            return { name: "mpa-feasibility-framing", score: result.score, metadata: result.metadata };
        },
        async (args) => {
            const result = scoreRagRetrieval(args.output);
            return { name: "mpa-rag-retrieval", score: result.score, metadata: result.metadata };
        },
        // NEW: V6.1 Automatic Benchmark Comparison
        async (args) => {
            const result = scoreAutomaticBenchmarkComparison(args.input?.message, args.output);
            return { name: "mpa-auto-benchmark", score: result.score, metadata: result.metadata };
        },
        // NEW: V6.1 Data Confidence
        async (args) => {
            const result = scoreDataConfidence(args.output);
            return { name: "mpa-data-confidence", score: result.score, metadata: result.metadata };
        },
        // NEW: V6.1 Platform Taxonomy Usage
        async (args) => {
            const currentStep = args.metadata?.currentStep || 1;
            const result = scorePlatformTaxonomyUsage(args.output, args.input?.message, currentStep);
            return { name: "mpa-platform-taxonomy", score: result.score, metadata: result.metadata };
        },
        // NEW: V6.1 Geography/Census Usage
        async (args) => {
            const currentStep = args.metadata?.currentStep || 1;
            const result = scoreGeographyCensusUsage(args.output, args.input?.message, currentStep);
            return { name: "mpa-geography-census", score: result.score, metadata: result.metadata };
        },
        // NEW: V6.1 Behavioral/Contextual Usage
        async (args) => {
            const currentStep = args.metadata?.currentStep || 1;
            const result = scoreBehavioralContextualUsage(args.output, args.input?.message, currentStep);
            return { name: "mpa-behavioral-contextual", score: result.score, metadata: result.metadata };
        },
        // Tier 3: Style & Conversation
        async (args) => {
            const result = await scoreTone(args.output);
            return { name: "mpa-tone", score: result.score, metadata: result.metadata };
        },
        async (args) => {
            const result = await scoreStepCompletion(args.input?.message, args.output);
            return { name: "mpa-step-completion", score: result.score, metadata: result.metadata };
        },
        async (args) => {
            const result = await scoreSelfReferentialLearning(args.input?.message, args.output);
            return { name: "mpa-self-referential-learning", score: result.score, metadata: result.metadata };
        },
    ],
});
//# sourceMappingURL=mpa-eval.js.map