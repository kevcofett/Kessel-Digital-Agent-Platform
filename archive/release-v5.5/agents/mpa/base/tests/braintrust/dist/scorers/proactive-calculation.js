/**
 * Proactive Calculation Scorer (15% weight)
 *
 * TIER 1: CORE QUALITY BEHAVIOR
 *
 * Evaluates: When agent has budget AND volume target, does it immediately
 * calculate implied efficiency and compare to benchmarks?
 */
import { callLLMJudge, JUDGE_PROMPTS } from './llm-judge.js';
/**
 * Check if we have sufficient data for calculation
 */
function hasSufficientDataForCalculation(ctx) {
    // Need both budget and volume to calculate efficiency
    if (ctx.budget && ctx.volumeTarget) {
        return true;
    }
    // Also check available data object
    const data = ctx.availableData || {};
    const hasBudget = ctx.budget || data.budget || data.totalBudget;
    const hasVolume = ctx.volumeTarget || data.volumeTarget || data.customers || data.conversions || data.leads;
    return Boolean(hasBudget && hasVolume);
}
/**
 * Quick code-based pre-check for calculation presence
 */
function hasCalculationOnOwnLine(response) {
    // Pattern: Math on its own line like "$400K / 5,000 = $80"
    const mathPatterns = [
        /^\s*\$[\d,]+[KkMm]?\s*[\/÷]\s*[\d,]+[KkMm]?\s*=\s*\$?[\d,.]+/m,
        /^\s*[\d,]+[KkMm]?\s*[\/÷]\s*[\d,]+[KkMm]?\s*=\s*\$?[\d,.]+/m,
        /Budget:.*\$[\d,]+/i,
        /Target:.*[\d,]+\s*(customers?|conversions?|leads?)/i,
        /\$[\d,]+\s*[\/÷]\s*[\d,]+\s*=\s*\$[\d,.]+\s*(per|each)/i,
    ];
    return mathPatterns.some(pattern => pattern.test(response));
}
/**
 * Check for benchmark comparison
 */
function hasBenchmarkComparison(response) {
    const benchmarkPatterns = [
        /benchmark/i,
        /typical(ly)?\s+(runs?|ranges?|is)/i,
        /\$[\d,]+-\$?[\d,]+\s+range/i,
        /vs\s+\$[\d,]+/i,
        /compared to/i,
        /based on (Knowledge Base|KB|industry)/i,
    ];
    return benchmarkPatterns.some(pattern => pattern.test(response));
}
/**
 * Check for implication statement
 */
function hasImplicationStatement(response) {
    const implicationPatterns = [
        /aggressive/i,
        /conservative/i,
        /achievable/i,
        /ambitious/i,
        /realistic/i,
        /this (means|implies|suggests|indicates)/i,
        /you('ll| will) need/i,
        /to hit this/i,
        /for this to work/i,
    ];
    return implicationPatterns.some(pattern => pattern.test(response));
}
/**
 * Score proactive calculation behavior
 */
export async function scoreProactiveCalculation(ctx) {
    // If no sufficient data for calculation, this scorer doesn't apply
    if (!hasSufficientDataForCalculation(ctx)) {
        return {
            score: 1.0,
            rationale: 'Not applicable - insufficient data for calculation (no budget+volume)',
        };
    }
    // Quick code-based checks for efficiency
    const hasCalc = hasCalculationOnOwnLine(ctx.agentResponse);
    const hasBenchmark = hasBenchmarkComparison(ctx.agentResponse);
    const hasImplication = hasImplicationStatement(ctx.agentResponse);
    // If all three are present, score A without LLM
    if (hasCalc && hasBenchmark && hasImplication) {
        return {
            score: 1.0,
            rationale: 'Full proactive calculation: math on own line, benchmark comparison, implication stated',
        };
    }
    // If calculation present but missing some elements, partial score
    if (hasCalc && (hasBenchmark || hasImplication)) {
        return {
            score: 0.75,
            rationale: `Calculation present but missing ${!hasBenchmark ? 'benchmark comparison' : 'implication statement'}`,
        };
    }
    // If no calculation but data was available, use LLM for nuanced evaluation
    const availableDataStr = JSON.stringify(ctx.availableData || {
        budget: ctx.budget,
        volumeTarget: ctx.volumeTarget,
    });
    try {
        const result = await callLLMJudge(JUDGE_PROMPTS['proactive-calculation'], {
            agent_response: ctx.agentResponse,
            available_data: availableDataStr,
        });
        return result;
    }
    catch (error) {
        // Fallback to code-based scoring
        if (hasCalc) {
            return { score: 0.5, rationale: 'Calculation present but context unclear' };
        }
        return { score: 0.25, rationale: 'Data available but no calculation shown' };
    }
}
export default scoreProactiveCalculation;
//# sourceMappingURL=proactive-calculation.js.map