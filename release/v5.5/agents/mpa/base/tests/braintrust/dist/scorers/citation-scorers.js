/**
 * Citation Scorers - Tests data attribution and citation accuracy
 *
 * The MPA must properly cite all data sources:
 * - "Based on your input" for user-provided data
 * - "Based on KB" for knowledge base data
 * - "Based on web search" for researched data
 * - "My estimate, I searched but found no citable data" for estimates
 *
 * These scorers verify:
 * 1. All claims have appropriate citations
 * 2. Citations match the actual source used
 * 3. No false attribution (claiming KB when using estimate)
 * 4. Consistent citation format
 * 5. Appropriate confidence levels communicated
 */
import Anthropic from "@anthropic-ai/sdk";
/**
 * Citation types recognized by the system
 */
export var CitationType;
(function (CitationType) {
    CitationType["USER_INPUT"] = "user_input";
    CitationType["KB_BENCHMARK"] = "kb_benchmark";
    CitationType["WEB_SEARCH"] = "web_search";
    CitationType["AGENT_ESTIMATE"] = "agent_estimate";
    CitationType["DIRECT_API"] = "direct_api";
    CitationType["EXTERNAL_SOURCE"] = "external_source";
})(CitationType || (CitationType = {}));
/**
 * Patterns for detecting citation types
 */
const CITATION_PATTERNS = {
    [CitationType.USER_INPUT]: [
        /based on (?:your|the) input/i,
        /(?:you|user) (?:said|mentioned|provided|told)/i,
        /(?:from|per) (?:your|the user's) (?:data|input|info)/i,
        /as you (?:indicated|mentioned|stated)/i,
    ],
    [CitationType.KB_BENCHMARK]: [
        /based on kb/i,
        /(?:per|from|according to) (?:the |our )?knowledge base/i,
        /(?:kb|industry) benchmark/i,
        /(?:per|from) industry data/i,
    ],
    [CitationType.WEB_SEARCH]: [
        /based on (?:web|my) (?:search|research)/i,
        /(?:found|discovered|identified) (?:through|via|in) (?:search|research)/i,
        /according to (?:recent|current) (?:data|research|reports)/i,
        /(?:source|per|from):?\s*(?:https?:|www\.)/i,
    ],
    [CitationType.AGENT_ESTIMATE]: [
        /my estimate/i,
        /i (?:estimate|assume|model)/i,
        /(?:my|agent's?) (?:estimate|assumption|projection)/i,
        /i searched but (?:found no|couldn't find)/i,
        /estimate based on/i,
    ],
    [CitationType.DIRECT_API]: [
        /(?:from|via|through) (?:the |our )?api/i,
        /(?:real-time|live|direct) data/i,
        /api (?:data|response|result)/i,
    ],
    [CitationType.EXTERNAL_SOURCE]: [
        /according to \[?[\w\s]+\]?/i,
        /(?:source|per|from):?\s*[\w\s]+(?:report|study|survey)/i,
        /\([\w\s]+,?\s*\d{4}\)/i, // Academic citation style
    ],
};
/**
 * Patterns for quantitative claims that need citation
 */
const QUANTITATIVE_CLAIM_PATTERNS = [
    /\$[\d,]+(?:\.\d+)?(?:k|m|b|K|M|B)?/i, // Dollar amounts
    /\d+(?:\.\d+)?%/i, // Percentages
    /\d+(?:\.\d+)?x/i, // Multipliers
    /(?:typically|average|median|benchmark)\s*(?:is|of|at)?\s*\d/i, // Benchmark claims
    /industry\s*(?:average|standard|typical)/i, // Industry claims
    /(?:ranges? from|between)\s*\d/i, // Range claims
];
/**
 * Score citation presence - does agent cite sources for claims?
 */
export function scoreCitationPresence(agentResponse) {
    // Find all quantitative claims
    const quantitativeClaims = QUANTITATIVE_CLAIM_PATTERNS.filter((p) => p.test(agentResponse)).length;
    // Find all citations
    const citations = [];
    for (const [type, patterns] of Object.entries(CITATION_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(agentResponse)) {
                citations.push(type);
            }
        }
    }
    const uniqueCitations = [...new Set(citations)];
    const citationCount = uniqueCitations.length;
    // Calculate score based on citation-to-claim ratio
    let score;
    let status;
    if (quantitativeClaims === 0) {
        // No claims that need citation
        score = 1.0;
        status = "no_claims_to_cite";
    }
    else if (citationCount === 0) {
        // Claims without any citation
        score = 0.2;
        status = "missing_citations";
    }
    else if (citationCount >= quantitativeClaims) {
        // Good citation coverage
        score = 1.0;
        status = "well_cited";
    }
    else {
        // Partial citation
        score = 0.3 + (citationCount / quantitativeClaims) * 0.5;
        status = "partial_citation";
    }
    return {
        score,
        metadata: {
            quantitativeClaimsFound: quantitativeClaims,
            citationsFound: citationCount,
            citationTypes: uniqueCitations,
            status,
        },
    };
}
/**
 * Score citation accuracy - are citations correctly attributed?
 *
 * This checks for potential misattribution patterns like:
 * - Claiming KB data when none was retrieved
 * - Claiming user input for general benchmarks
 * - Claiming web search when search wasn't performed
 */
export function scoreCitationAccuracy(agentResponse, context) {
    const detectedCitations = [];
    const potentialMisattributions = [];
    // Check KB citations
    const citesKB = CITATION_PATTERNS[CitationType.KB_BENCHMARK].some((p) => p.test(agentResponse));
    if (citesKB) {
        detectedCitations.push(CitationType.KB_BENCHMARK);
        if (context.kbDataRetrieved === false) {
            potentialMisattributions.push("Cited KB data but no KB retrieval occurred");
        }
    }
    // Check web search citations
    const citesWebSearch = CITATION_PATTERNS[CitationType.WEB_SEARCH].some((p) => p.test(agentResponse));
    if (citesWebSearch) {
        detectedCitations.push(CitationType.WEB_SEARCH);
        if (context.webSearchPerformed === false) {
            potentialMisattributions.push("Cited web search but no search was performed");
        }
    }
    // Check user input citations
    const citesUserInput = CITATION_PATTERNS[CitationType.USER_INPUT].some((p) => p.test(agentResponse));
    if (citesUserInput) {
        detectedCitations.push(CitationType.USER_INPUT);
        // This is usually valid if user provided any data
    }
    // Check API citations
    const citesApi = CITATION_PATTERNS[CitationType.DIRECT_API].some((p) => p.test(agentResponse));
    if (citesApi) {
        detectedCitations.push(CitationType.DIRECT_API);
        if (context.apiDataAvailable === false) {
            potentialMisattributions.push("Cited API data but no API was available");
        }
    }
    // Calculate score
    let score;
    let status;
    if (potentialMisattributions.length === 0) {
        score = 1.0;
        status = "accurate_citations";
    }
    else if (potentialMisattributions.length === 1) {
        score = 0.5;
        status = "minor_misattribution";
    }
    else {
        score = 0.2;
        status = "multiple_misattributions";
    }
    return {
        score,
        metadata: {
            detectedCitations,
            potentialMisattributions,
            context,
            status,
        },
    };
}
/**
 * Score citation consistency - are citations formatted consistently?
 */
export function scoreCitationConsistency(agentResponse) {
    // Standard citation formats we expect
    const standardFormats = [
        /based on (?:your|the|kb|web|my)/i,
        /according to/i,
        /per (?:the|your|kb|industry)/i,
        /from (?:your|the|my)/i,
    ];
    // Non-standard or informal citations
    const informalFormats = [
        /i think|i believe|probably|maybe/i,
        /usually|generally|typically/i, // Without explicit source
        /\d+.*(?:is|are) (?:normal|common|standard)/i, // Unsourced claims
    ];
    const standardCount = standardFormats.filter((p) => p.test(agentResponse)).length;
    const informalCount = informalFormats.filter((p) => p.test(agentResponse)).length;
    let score;
    let status;
    if (standardCount > 0 && informalCount === 0) {
        score = 1.0;
        status = "consistent_formal_citations";
    }
    else if (standardCount > informalCount) {
        score = 0.8;
        status = "mostly_formal_citations";
    }
    else if (standardCount > 0) {
        score = 0.5;
        status = "mixed_citation_styles";
    }
    else if (informalCount > 0) {
        score = 0.3;
        status = "informal_citations_only";
    }
    else {
        score = 0.6; // No citations found, neutral
        status = "no_citations_detected";
    }
    return {
        score,
        metadata: {
            standardCitationsFound: standardCount,
            informalCitationsFound: informalCount,
            status,
        },
    };
}
/**
 * Score confidence level communication - does agent convey appropriate confidence?
 */
export function scoreConfidenceLevel(agentResponse) {
    // High confidence indicators (should be used with verified data)
    const highConfidence = [
        /(?:definite|certain|clear|confirmed|verified)/i,
        /(?:will|must|always|never)/i,
        /(?:exactly|precisely|specifically)/i,
    ];
    // Appropriate hedging (good for estimates/benchmarks)
    const appropriateHedging = [
        /(?:typically|generally|usually|often)/i,
        /(?:approximately|about|around|roughly)/i,
        /(?:estimate|suggest|indicate|point to)/i,
        /(?:may|might|could|should)/i,
        /(?:range|varies|depends)/i,
    ];
    // Check for estimates that should have hedging
    const hasEstimate = CITATION_PATTERNS[CitationType.AGENT_ESTIMATE].some((p) => p.test(agentResponse));
    const hasHighConfidence = highConfidence.filter((p) => p.test(agentResponse)).length;
    const hasHedging = appropriateHedging.filter((p) => p.test(agentResponse)).length;
    let score;
    let status;
    if (hasEstimate && hasHighConfidence > 0 && hasHedging === 0) {
        // Estimate with high confidence and no hedging - problematic
        score = 0.3;
        status = "overconfident_estimate";
    }
    else if (hasEstimate && hasHedging > 0) {
        // Estimate with appropriate hedging - good
        score = 1.0;
        status = "well_hedged_estimate";
    }
    else if (hasHedging > 0) {
        // Generally hedged appropriately
        score = 0.9;
        status = "appropriate_hedging";
    }
    else if (hasHighConfidence > 0) {
        // High confidence - ok if data supports it
        score = 0.7;
        status = "high_confidence_claims";
    }
    else {
        // Neutral
        score = 0.8;
        status = "neutral_confidence";
    }
    return {
        score,
        metadata: {
            hasEstimate,
            highConfidenceCount: hasHighConfidence,
            hedgingCount: hasHedging,
            status,
        },
    };
}
/**
 * LLM-as-judge for comprehensive citation quality
 */
export async function scoreCitationQuality(userMessage, agentResponse, context) {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const prompt = `You are evaluating the citation and attribution quality of an AI agent's response.

CITATION REQUIREMENTS:
The agent must properly attribute data sources:
- "Based on your input" for user-provided data
- "Based on KB" for knowledge base benchmarks
- "Based on web search" for researched data
- "My estimate" for agent estimates (must recommend validation)

CONTEXT:
- KB data retrieved: ${context.kbDataRetrieved ?? "Unknown"}
- Web search performed: ${context.webSearchPerformed ?? "Unknown"}
- User data provided: ${context.userDataProvided ?? "Unknown"}

USER MESSAGE: "${userMessage}"

AGENT RESPONSE: "${agentResponse}"

EVALUATION CRITERIA:
1. Are all quantitative claims attributed to a source?
2. Are citations accurate (not claiming sources that weren't used)?
3. Are citations formatted consistently?
4. Does the agent communicate appropriate confidence levels?
5. Are estimates clearly labeled and validation recommended?

Score A-F where:
A = Excellent citation quality - all claims attributed, accurate, consistent
B = Good citation with minor gaps
C = Adequate citation but inconsistent or some gaps
D = Poor citation - missing attributions or misattributions
F = Failed citation quality - misleading or no attributions

Reply with ONLY a single letter: A, B, C, D, or F`;
    try {
        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 10,
            messages: [{ role: "user", content: prompt }],
        });
        const letter = response.content[0].text.trim().toUpperCase();
        const scores = { A: 1.0, B: 0.8, C: 0.6, D: 0.3, F: 0 };
        return {
            score: scores[letter] ?? 0.5,
            metadata: { grade: letter, context },
        };
    }
    catch (error) {
        return {
            score: 0.5,
            metadata: { error: "LLM scoring failed", context },
        };
    }
}
/**
 * Calculate combined citation score
 */
export function calculateCitationScore(scores) {
    const weights = {
        presence: 0.25,
        accuracy: 0.3,
        consistency: 0.15,
        confidence: 0.15,
        llmQuality: 0.15,
    };
    let weightedSum = 0;
    let totalWeight = 0;
    weightedSum += scores.presence * weights.presence;
    totalWeight += weights.presence;
    weightedSum += scores.accuracy * weights.accuracy;
    totalWeight += weights.accuracy;
    weightedSum += scores.consistency * weights.consistency;
    totalWeight += weights.consistency;
    weightedSum += scores.confidence * weights.confidence;
    totalWeight += weights.confidence;
    if (scores.llmQuality !== undefined) {
        weightedSum += scores.llmQuality * weights.llmQuality;
        totalWeight += weights.llmQuality;
    }
    return weightedSum / totalWeight;
}
export default {
    CitationType,
    scoreCitationPresence,
    scoreCitationAccuracy,
    scoreCitationConsistency,
    scoreConfidenceLevel,
    scoreCitationQuality,
    calculateCitationScore,
};
//# sourceMappingURL=citation-scorers.js.map