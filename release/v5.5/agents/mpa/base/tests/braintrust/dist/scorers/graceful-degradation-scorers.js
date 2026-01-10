"use strict";
/**
 * Graceful Degradation Scorers - Tests agent behavior when APIs/tools fail
 *
 * The MPA should gracefully handle situations where:
 * - Web search is unavailable or fails
 * - API calls fail or timeout
 * - KB retrieval fails
 *
 * Expected behaviors:
 * 1. Agent acknowledges the limitation
 * 2. Agent falls back to next-best data source
 * 3. Agent labels the fallback clearly
 * 4. Agent recommends validation/follow-up
 * 5. Agent maintains forward progress (doesn't get stuck)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailureType = void 0;
exports.scoreFailureAcknowledgment = scoreFailureAcknowledgment;
exports.scoreFallbackBehavior = scoreFallbackBehavior;
exports.scoreFollowUpRecommendation = scoreFollowUpRecommendation;
exports.scoreForwardProgress = scoreForwardProgress;
exports.scoreGracefulDegradation = scoreGracefulDegradation;
exports.calculateGracefulDegradationScore = calculateGracefulDegradationScore;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
/**
 * Types of failures that can occur
 */
var FailureType;
(function (FailureType) {
    FailureType["WEB_SEARCH_UNAVAILABLE"] = "web_search_unavailable";
    FailureType["API_TIMEOUT"] = "api_timeout";
    FailureType["API_ERROR"] = "api_error";
    FailureType["KB_RETRIEVAL_FAILED"] = "kb_retrieval_failed";
    FailureType["RATE_LIMITED"] = "rate_limited";
})(FailureType || (exports.FailureType = FailureType = {}));
/**
 * Expected fallback behaviors per failure type
 */
const FALLBACK_EXPECTATIONS = {
    [FailureType.WEB_SEARCH_UNAVAILABLE]: {
        acknowledgmentPatterns: [
            /(?:couldn't|unable|can't|cannot).*(?:search|find|retrieve|access)/i,
            /(?:search|web).*(?:unavailable|failed|not available)/i,
            /(?:limited|no).*(?:access|ability).*(?:search|web)/i,
        ],
        fallbackPatterns: [
            /(?:instead|alternatively|however).*(?:use|rely|reference)/i,
            /(?:based on|using|from).*(?:kb|knowledge base|benchmark|industry)/i,
            /(?:my|i|agent).*(?:estimate|model|assume)/i,
        ],
        recommendationPatterns: [
            /(?:recommend|should|would suggest).*(?:validat|verify|confirm|research)/i,
            /(?:when|once|if).*(?:available|possible|able).*(?:update|refine|verify)/i,
        ],
    },
    [FailureType.API_TIMEOUT]: {
        acknowledgmentPatterns: [
            /(?:timeout|timed out|took too long)/i,
            /(?:couldn't|unable|failed).*(?:connect|reach|access)/i,
        ],
        fallbackPatterns: [
            /(?:proceeding|continue|move).*(?:with|using).*(?:available|existing)/i,
            /(?:using|based on).*(?:cached|previous|known)/i,
        ],
        recommendationPatterns: [
            /(?:try|retry|attempt).*(?:again|later)/i,
            /(?:let me know|contact|reach out).*(?:if|when)/i,
        ],
    },
    [FailureType.API_ERROR]: {
        acknowledgmentPatterns: [
            /(?:error|issue|problem).*(?:occurred|happened|encountered)/i,
            /(?:api|service|system).*(?:error|unavailable|down)/i,
        ],
        fallbackPatterns: [
            /(?:meanwhile|for now|in the meantime)/i,
            /(?:work with|proceed with|use).*(?:what we have|available data)/i,
        ],
        recommendationPatterns: [
            /(?:we can|I can|would).*(?:update|refresh|retry).*(?:later|when)/i,
        ],
    },
    [FailureType.KB_RETRIEVAL_FAILED]: {
        acknowledgmentPatterns: [
            /(?:couldn't|unable).*(?:access|retrieve|find).*(?:kb|knowledge|benchmark)/i,
            /(?:kb|knowledge base).*(?:unavailable|not accessible)/i,
        ],
        fallbackPatterns: [
            /(?:based on|using).*(?:general|standard|typical).*(?:industry|practice)/i,
            /(?:my|agent).*(?:experience|knowledge|understanding)/i,
        ],
        recommendationPatterns: [
            /(?:recommend|should|suggest).*(?:cross-reference|verify|validate)/i,
        ],
    },
    [FailureType.RATE_LIMITED]: {
        acknowledgmentPatterns: [
            /(?:rate|limit|quota).*(?:exceeded|reached|hit)/i,
            /(?:too many|excessive).*(?:request|call)/i,
        ],
        fallbackPatterns: [
            /(?:in the meantime|while waiting)/i,
            /(?:can still|able to).*(?:proceed|continue)/i,
        ],
        recommendationPatterns: [
            /(?:wait|pause|try).*(?:moment|later|again)/i,
        ],
    },
};
/**
 * Score acknowledgment of failure - does agent recognize the limitation?
 */
function scoreFailureAcknowledgment(agentResponse, failureType) {
    const expectations = FALLBACK_EXPECTATIONS[failureType];
    const acknowledged = expectations.acknowledgmentPatterns.some((p) => p.test(agentResponse));
    // Also check for generic acknowledgment patterns
    const genericAcknowledgment = [
        /(?:unfortunately|regrettably|sadly)/i,
        /(?:limited|constrained|restricted)/i,
        /(?:couldn't|unable|can't|cannot)/i,
    ].some((p) => p.test(agentResponse));
    const score = acknowledged ? 1.0 : genericAcknowledgment ? 0.7 : 0.0;
    return {
        score,
        metadata: {
            failureType,
            specificAcknowledgment: acknowledged,
            genericAcknowledgment,
            status: acknowledged ? "properly_acknowledged" : genericAcknowledgment ? "generic_acknowledgment" : "not_acknowledged",
        },
    };
}
/**
 * Score fallback behavior - does agent use appropriate fallback?
 */
function scoreFallbackBehavior(agentResponse, failureType) {
    const expectations = FALLBACK_EXPECTATIONS[failureType];
    const usedFallback = expectations.fallbackPatterns.some((p) => p.test(agentResponse));
    // Also check for generic fallback patterns
    const genericFallback = [
        /(?:instead|alternatively|however)/i,
        /(?:based on|using|from).*(?:available|existing|known)/i,
        /(?:proceed|continue|move forward)/i,
    ].some((p) => p.test(agentResponse));
    const score = usedFallback ? 1.0 : genericFallback ? 0.7 : 0.3;
    return {
        score,
        metadata: {
            failureType,
            specificFallback: usedFallback,
            genericFallback,
            status: usedFallback ? "proper_fallback" : genericFallback ? "generic_fallback" : "no_fallback",
        },
    };
}
/**
 * Score recommendation presence - does agent recommend follow-up?
 */
function scoreFollowUpRecommendation(agentResponse, failureType) {
    const expectations = FALLBACK_EXPECTATIONS[failureType];
    const hasRecommendation = expectations.recommendationPatterns.some((p) => p.test(agentResponse));
    // Generic recommendation patterns
    const genericRecommendation = [
        /(?:recommend|suggest|would be good)/i,
        /(?:when|once|if).*(?:available|possible)/i,
        /(?:let me know|reach out)/i,
    ].some((p) => p.test(agentResponse));
    const score = hasRecommendation ? 1.0 : genericRecommendation ? 0.7 : 0.4;
    return {
        score,
        metadata: {
            failureType,
            specificRecommendation: hasRecommendation,
            genericRecommendation,
            status: hasRecommendation ? "proper_recommendation" : genericRecommendation ? "generic_recommendation" : "no_recommendation",
        },
    };
}
/**
 * Score forward progress - does agent maintain momentum despite failure?
 */
function scoreForwardProgress(agentResponse) {
    // Signs of forward progress
    const progressIndicators = [
        /(?:let's|let us|we can|I can).*(?:proceed|continue|move)/i,
        /(?:next|now|moving on)/i,
        /(?:in the meantime|meanwhile|for now)/i,
        /(?:here's what|what we can|able to)/i,
        /\?$/m, // Ends with a question (keeping conversation moving)
    ];
    // Signs of being stuck
    const stuckIndicators = [
        /(?:can't|cannot|unable).*(?:proceed|continue|help)/i,
        /(?:need|require|must have).*(?:first|before)/i,
        /(?:impossible|not possible|unable)/i,
        /(?:please|you need to).*(?:try|contact|wait)/i,
    ];
    const showsProgress = progressIndicators.filter((p) => p.test(agentResponse)).length;
    const showsStuck = stuckIndicators.filter((p) => p.test(agentResponse)).length;
    let score;
    let status;
    if (showsProgress > showsStuck) {
        score = 1.0;
        status = "maintains_progress";
    }
    else if (showsProgress === showsStuck && showsProgress > 0) {
        score = 0.6;
        status = "mixed_progress";
    }
    else if (showsStuck > 0) {
        score = 0.2;
        status = "appears_stuck";
    }
    else {
        score = 0.5;
        status = "unclear";
    }
    return {
        score,
        metadata: {
            progressIndicatorsFound: showsProgress,
            stuckIndicatorsFound: showsStuck,
            status,
        },
    };
}
/**
 * Score graceful degradation using LLM-as-judge
 *
 * Evaluates overall quality of graceful degradation behavior
 */
async function scoreGracefulDegradation(userMessage, agentResponse, failureContext) {
    const anthropic = new sdk_1.default({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const prompt = `You are evaluating how gracefully an AI agent handled a system failure.

FAILURE CONTEXT:
- Failure type: ${failureContext.failureType}
- Error message: ${failureContext.errorMessage || "Not provided"}

USER MESSAGE: "${userMessage}"

AGENT RESPONSE: "${agentResponse}"

EVALUATION CRITERIA:
1. Did the agent acknowledge the limitation clearly but not alarmingly?
2. Did the agent fall back to an appropriate alternative data source?
3. Did the agent label the fallback/limitation for the user?
4. Did the agent recommend follow-up action when possible?
5. Did the agent maintain forward progress (not get stuck)?
6. Did the agent maintain a professional, helpful tone?

Score A-F where:
A = Excellent graceful degradation - acknowledged, fell back appropriately, maintained progress
B = Good handling with minor gaps in acknowledgment or fallback
C = Adequate handling but missed some best practices
D = Poor handling - got stuck or didn't acknowledge limitation
F = Failed to handle gracefully - misleading, stuck, or unhelpful

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
            metadata: { grade: letter, failureContext },
        };
    }
    catch (error) {
        return {
            score: 0.5,
            metadata: { error: "LLM scoring failed", failureContext },
        };
    }
}
/**
 * Calculate combined graceful degradation score
 */
function calculateGracefulDegradationScore(scores) {
    const weights = {
        acknowledgment: 0.2,
        fallback: 0.25,
        recommendation: 0.15,
        forwardProgress: 0.2,
        llmScore: 0.2,
    };
    let weightedSum = 0;
    let totalWeight = 0;
    weightedSum += scores.acknowledgment * weights.acknowledgment;
    totalWeight += weights.acknowledgment;
    weightedSum += scores.fallback * weights.fallback;
    totalWeight += weights.fallback;
    weightedSum += scores.recommendation * weights.recommendation;
    totalWeight += weights.recommendation;
    weightedSum += scores.forwardProgress * weights.forwardProgress;
    totalWeight += weights.forwardProgress;
    if (scores.llmScore !== undefined) {
        weightedSum += scores.llmScore * weights.llmScore;
        totalWeight += weights.llmScore;
    }
    return weightedSum / totalWeight;
}
exports.default = {
    FailureType,
    scoreFailureAcknowledgment,
    scoreFallbackBehavior,
    scoreFollowUpRecommendation,
    scoreForwardProgress,
    scoreGracefulDegradation,
    calculateGracefulDegradationScore,
};
//# sourceMappingURL=graceful-degradation-scorers.js.map