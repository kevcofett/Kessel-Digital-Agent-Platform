/**
 * Step Quality Scorers for Quality-Focused MPA Evaluation
 *
 * Phase 1 Scorers: Context-aware step quality evaluation.
 * Requirements scale based on budget, funnel type, and KPI aggressiveness.
 */
import Anthropic from "@anthropic-ai/sdk";
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
// =============================================================================
// CONTEXT-AWARE REQUIREMENTS
// =============================================================================
/**
 * Base requirements per step (scaled by context multipliers)
 */
const STEP_BASE_REQUIREMENTS = {
    1: { minDataPoints: 2, requiresCalculation: false, minTurns: 1 },
    2: { minDataPoints: 3, requiresCalculation: true, minTurns: 2 },
    3: { minDataPoints: 4, requiresCalculation: false, minTurns: 2 },
    4: { minDataPoints: 3, requiresCalculation: true, minTurns: 2 },
    5: { minDataPoints: 3, requiresCalculation: true, minTurns: 2 },
    6: { minDataPoints: 2, requiresCalculation: false, minTurns: 1 },
    7: { minDataPoints: 4, requiresCalculation: true, minTurns: 2 },
    8: { minDataPoints: 3, requiresCalculation: false, minTurns: 2 },
    9: { minDataPoints: 2, requiresCalculation: false, minTurns: 1 },
    10: { minDataPoints: 2, requiresCalculation: false, minTurns: 1 },
};
/**
 * Budget tier multipliers
 */
const BUDGET_TIERS = [
    { min: 0, max: 100000, multiplier: 0.5 }, // <$100K: lighter touch
    { min: 100000, max: 500000, multiplier: 1.0 }, // $100K-$500K: standard
    { min: 500000, max: 2000000, multiplier: 1.5 }, // $500K-$2M: deeper
    { min: 2000000, max: Infinity, multiplier: 2.0 }, // >$2M: extensive
];
/**
 * Funnel-specific step importance weights
 */
const FUNNEL_STEP_WEIGHTS = {
    awareness: {
        2: 0.5, // Economics less critical for awareness
        3: 1.5, // Audience very important
        6: 1.5, // Value prop very important
        8: 1.0, // Measurement important but different focus
    },
    consideration: {
        2: 1.0,
        3: 1.2,
        6: 1.2,
        8: 1.2,
    },
    performance: {
        2: 1.5, // Economics very critical
        3: 1.0, // Audience standard
        6: 0.75, // Value prop less critical
        8: 1.5, // Measurement very critical
    },
};
/**
 * Get budget tier multiplier
 */
function getBudgetMultiplier(budget) {
    const tier = BUDGET_TIERS.find((t) => budget >= t.min && budget < t.max);
    return tier?.multiplier || 1.0;
}
/**
 * Get funnel multiplier for a specific step
 */
function getFunnelMultiplier(funnel, step) {
    return FUNNEL_STEP_WEIGHTS[funnel]?.[step] || 1.0;
}
/**
 * Get aggressiveness multiplier
 */
function getAggressivenessMultiplier(aggressiveness) {
    switch (aggressiveness) {
        case "conservative":
            return 0.8;
        case "moderate":
            return 1.0;
        case "aggressive":
            return 1.3; // More rigor needed for aggressive targets
    }
}
/**
 * Get context-aware step requirements
 */
export function getStepRequirements(step, context) {
    const baseReq = STEP_BASE_REQUIREMENTS[step] || {
        minDataPoints: 2,
        requiresCalculation: false,
        minTurns: 1,
    };
    const budgetMultiplier = getBudgetMultiplier(context.budget);
    const funnelMultiplier = getFunnelMultiplier(context.funnel, step);
    const aggressivenessMultiplier = getAggressivenessMultiplier(context.kpiAggressiveness);
    const combinedMultiplier = budgetMultiplier * funnelMultiplier * aggressivenessMultiplier;
    return {
        minDataPoints: Math.ceil(baseReq.minDataPoints * combinedMultiplier),
        requiresCalculation: baseReq.requiresCalculation && context.funnel === "performance",
        minTurns: Math.ceil(baseReq.minTurns * budgetMultiplier),
        requiresSynthesis: step > 4, // Later steps should reference earlier insights
    };
}
// =============================================================================
// LLM-AS-JUDGE PROMPTS
// =============================================================================
const STEP_DEPTH_JUDGE_PROMPT = `You are evaluating the DEPTH and QUALITY of guidance provided in a specific step of a media planning conversation.

STEP {step_number}: {step_name}

EXPECTED QUALITY INDICATORS FOR THIS STEP:
{quality_indicators}

AGENT RESPONSES IN THIS STEP:
"""
{agent_responses}
"""

DATA POINTS COLLECTED: {data_points_count}
CALCULATIONS PERFORMED: {calculations_count}
TURNS SPENT: {turns_count}

CONTEXT:
- Budget: {budget}
- Funnel Type: {funnel}
- Minimum expected data points: {min_data_points}
- Calculation required: {requires_calculation}

Score 0.0-1.0 where:
- 1.0 = Exceptional depth - all quality indicators met, thorough exploration, clear insights
- 0.8 = Good depth - most indicators met, solid exploration
- 0.6 = Adequate depth - minimum requirements met but could go deeper
- 0.4 = Shallow - missing key quality indicators, rushed through step
- 0.2 = Very shallow - barely scratched surface, critical gaps
- 0.0 = Failed - step essentially skipped or handled incorrectly

Return JSON: { "score": X.X, "rationale": "...", "missingIndicators": ["..."] }`;
// =============================================================================
// STEP QUALITY INDICATORS
// =============================================================================
const STEP_QUALITY_INDICATORS = {
    1: [
        "Objective is specific and measurable",
        "Volume target is quantified",
        "Success definition is clear",
        "Agent explained why objective clarity matters",
    ],
    2: [
        "Implied efficiency calculated (budget / volume)",
        "Efficiency compared to benchmarks",
        "Unit economics validated (LTV, margin, payback)",
        "Agent challenged if target is aggressive",
    ],
    3: [
        "Demographics explored (age, income, lifestage)",
        "Behavioral signals identified (interests, intent)",
        "First-party data discovered (CRM, email, pixel)",
        "Segmentation approach discussed",
        "Audience sizing estimated",
        "Agent taught about precision vs. reach tradeoff",
    ],
    4: [
        "Scope determined (national/regional/local)",
        "Granularity appropriate to budget",
        "Strong/weak markets identified",
        "Concentration vs. expansion strategy discussed",
        "Population/audience sizing by geography",
        "Agent calculated spend per target by region",
    ],
    5: [
        "Allocation strategy justified",
        "Seasonal patterns incorporated",
        "Channel mix considerations",
        "Test budget carved out",
        "Agent showed allocation math",
    ],
    6: [
        "Differentiation identified",
        "Messaging framework proposed",
        "Competitive positioning discussed",
        "Agent connected value prop to audience targeting",
    ],
    7: [
        "Channel selection justified by audience",
        "Allocation percentages provided",
        "Platform-specific strategy discussed",
        "Agent cited channel benchmarks",
    ],
    8: [
        "Primary KPI defined",
        "Attribution approach discussed",
        "Tracking requirements identified",
        "Agent warned about measurement limitations (ROAS, etc.)",
    ],
    9: [
        "Test priorities identified",
        "Test budget allocated",
        "Learning agenda defined",
        "Agent taught about statistical significance",
    ],
    10: [
        "Key risks identified",
        "Mitigation strategies proposed",
        "Contingency plans discussed",
        "Agent flagged blind spots proactively",
    ],
};
const STEP_NAMES = {
    1: "Outcomes",
    2: "Economics",
    3: "Audience",
    4: "Geography",
    5: "Budget",
    6: "Value Proposition",
    7: "Channels",
    8: "Measurement",
    9: "Testing",
    10: "Risks",
};
// =============================================================================
// STEP QUALITY SCORERS
// =============================================================================
/**
 * Score step quality using LLM-as-judge
 */
export async function scoreStepQuality(input, context) {
    const requirements = getStepRequirements(input.stepNumber, context);
    const prompt = STEP_DEPTH_JUDGE_PROMPT.replace("{step_number}", String(input.stepNumber))
        .replace("{step_name}", STEP_NAMES[input.stepNumber] || "Unknown")
        .replace("{quality_indicators}", STEP_QUALITY_INDICATORS[input.stepNumber]?.join("\n- ") || "None defined")
        .replace("{agent_responses}", input.agentResponses.join("\n\n---\n\n"))
        .replace("{data_points_count}", String(input.dataPointsCollected.length))
        .replace("{calculations_count}", String(input.calculationsPerformed.length))
        .replace("{turns_count}", String(input.turnsInStep))
        .replace("{budget}", String(context.budget))
        .replace("{funnel}", context.funnel)
        .replace("{min_data_points}", String(requirements.minDataPoints))
        .replace("{requires_calculation}", String(requirements.requiresCalculation));
    try {
        const client = getAnthropicClient();
        const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }],
        });
        const textBlock = response.content[0];
        const text = textBlock.text.trim();
        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                scorer: "step-quality",
                score: Math.max(0, Math.min(1, parsed.score)),
                metadata: {
                    stepNumber: input.stepNumber,
                    stepName: STEP_NAMES[input.stepNumber],
                    rationale: parsed.rationale,
                    missingIndicators: parsed.missingIndicators || [],
                    turnsInStep: input.turnsInStep,
                    dataPointsCollected: input.dataPointsCollected.length,
                    calculationsPerformed: input.calculationsPerformed.length,
                    requirements,
                    context,
                },
                scope: "turn",
            };
        }
        return {
            scorer: "step-quality",
            score: 0.5,
            metadata: { error: "Could not parse LLM response" },
            scope: "turn",
        };
    }
    catch (error) {
        console.error("Step quality scorer error:", error);
        return {
            scorer: "step-quality",
            score: 0.5,
            metadata: { error: String(error) },
            scope: "turn",
        };
    }
}
/**
 * Score step data collection completeness (Rule-based)
 *
 * Checks if minimum viable data was collected before step transition.
 */
export function scoreStepDataCompleteness(input, context) {
    const requirements = getStepRequirements(input.stepNumber, context);
    const dataPointRatio = input.dataPointsCollected.length / requirements.minDataPoints;
    let score = Math.min(1.0, dataPointRatio);
    // Bonus for exceeding requirements
    if (dataPointRatio > 1.0) {
        score = 1.0;
    }
    // Penalty if calculation was required but not performed
    if (requirements.requiresCalculation &&
        input.calculationsPerformed.length === 0) {
        score *= 0.7;
    }
    return {
        scorer: "step-data-completeness",
        score,
        metadata: {
            stepNumber: input.stepNumber,
            dataPointsCollected: input.dataPointsCollected.length,
            requiredDataPoints: requirements.minDataPoints,
            dataPointRatio,
            calculationsPerformed: input.calculationsPerformed.length,
            calculationRequired: requirements.requiresCalculation,
        },
        scope: "turn",
    };
}
/**
 * Score step turn efficiency (Rule-based)
 *
 * Checks if appropriate time was spent on the step given context.
 */
export function scoreStepTurnEfficiency(input, context) {
    const requirements = getStepRequirements(input.stepNumber, context);
    const turnRatio = input.turnsInStep / requirements.minTurns;
    let score = 1.0;
    // Too few turns = shallow
    if (turnRatio < 0.5) {
        score = 0.4;
    }
    else if (turnRatio < 1.0) {
        score = 0.7;
    }
    // Too many turns without proportional data = inefficient
    if (turnRatio > 2.0 && input.dataPointsCollected.length <= requirements.minDataPoints) {
        score *= 0.8;
    }
    return {
        scorer: "step-turn-efficiency",
        score,
        metadata: {
            stepNumber: input.stepNumber,
            turnsInStep: input.turnsInStep,
            requiredTurns: requirements.minTurns,
            turnRatio,
            dataPointsPerTurn: input.dataPointsCollected.length / Math.max(1, input.turnsInStep),
        },
        scope: "turn",
    };
}
/**
 * Score step synthesis quality (Rule-based with pattern matching)
 *
 * For steps > 4, checks if agent referenced earlier step insights.
 */
export function scoreStepSynthesis(input, priorStepInsights) {
    // Synthesis not expected for early steps
    if (input.stepNumber <= 4) {
        return {
            scorer: "step-synthesis",
            score: 1.0,
            metadata: { status: "not_applicable", reason: "early_step" },
            scope: "turn",
        };
    }
    const allResponses = input.agentResponses.join(" ").toLowerCase();
    // Check for references to prior step concepts
    const synthesisPatterns = {
        5: [
            // Budget step should reference economics and geography
            /based on (your|the) (efficiency|cac|target)/i,
            /(efficiency|cac) of \$/i,
            /given (your|the) (geographic|regional|market)/i,
        ],
        7: [
            // Channels should reference audience and geography
            /based on (your|the) (audience|demographic|target)/i,
            /given (your|the) (25-|35-|45-|age|demo)/i,
            /your.*audience.*suggests/i,
            /regional concentration/i,
        ],
        8: [
            // Measurement should reference outcomes and channels
            /based on (your|the) (objective|goal|kpi)/i,
            /channel.*attribution/i,
            /measuring.*against.*target/i,
        ],
    };
    const patterns = synthesisPatterns[input.stepNumber] || [];
    const matchedPatterns = patterns.filter((p) => p.test(allResponses));
    const synthesisRatio = patterns.length > 0
        ? matchedPatterns.length / patterns.length
        : 0;
    // Also check for explicit step references
    const explicitReferences = [
        /earlier|previously/i,
        /as (we|you) (discussed|mentioned|established)/i,
        /from step \d/i,
        /in step \d/i,
        /your (budget|audience|geography|objective)/i,
    ];
    const hasExplicitReference = explicitReferences.some((p) => p.test(allResponses));
    let score = 0.5; // Baseline
    if (synthesisRatio >= 0.5 || hasExplicitReference) {
        score = 0.8;
    }
    if (synthesisRatio >= 0.75 && hasExplicitReference) {
        score = 1.0;
    }
    if (synthesisRatio < 0.25 && !hasExplicitReference) {
        score = 0.3;
    }
    return {
        scorer: "step-synthesis",
        score,
        metadata: {
            stepNumber: input.stepNumber,
            synthesisRatio,
            hasExplicitReference,
            matchedPatternCount: matchedPatterns.length,
            totalPatterns: patterns.length,
        },
        scope: "turn",
    };
}
// =============================================================================
// AGGREGATED STEP QUALITY SCORER
// =============================================================================
/**
 * Calculate overall step quality score from individual components
 */
export function calculateStepQualityScore(scores) {
    const stepScorers = [
        "step-quality",
        "step-data-completeness",
        "step-turn-efficiency",
        "step-synthesis",
    ];
    const weights = {
        "step-quality": 0.40,
        "step-data-completeness": 0.25,
        "step-turn-efficiency": 0.15,
        "step-synthesis": 0.20,
    };
    let weightedSum = 0;
    let totalWeight = 0;
    for (const scorer of stepScorers) {
        if (scores[scorer] && scores[scorer].metadata.status !== "not_applicable") {
            weightedSum += scores[scorer].score * weights[scorer];
            totalWeight += weights[scorer];
        }
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 1.0;
}
/**
 * Score all step quality dimensions when transitioning out of a step
 */
export async function scoreStepTransitionQuality(input, context, priorStepInsights) {
    const scores = {};
    // LLM-based comprehensive step quality
    scores["step-quality"] = await scoreStepQuality(input, context);
    // Rule-based component scores
    scores["step-data-completeness"] = scoreStepDataCompleteness(input, context);
    scores["step-turn-efficiency"] = scoreStepTurnEfficiency(input, context);
    scores["step-synthesis"] = scoreStepSynthesis(input, priorStepInsights);
    return scores;
}
export default scoreStepTransitionQuality;
//# sourceMappingURL=step-quality-scorers.js.map