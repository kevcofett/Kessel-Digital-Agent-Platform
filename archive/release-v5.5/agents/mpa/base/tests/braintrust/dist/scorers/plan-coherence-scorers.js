/**
 * Plan Coherence Scorers for Quality-Focused MPA Evaluation
 *
 * Phase 1 Scorers: End-to-end plan quality evaluation.
 * Evaluates mathematical consistency, strategic coherence, and defensibility.
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
// DEFAULT BENCHMARKS
// =============================================================================
const DEFAULT_BENCHMARKS = {
    medianCAC: 75,
    cacRange: { min: 30, max: 200 },
    typicalChannelMix: {
        paid_social: { min: 0.2, max: 0.5 },
        paid_search: { min: 0.15, max: 0.4 },
        display: { min: 0.05, max: 0.2 },
        video: { min: 0.1, max: 0.3 },
        ctv: { min: 0.05, max: 0.15 },
    },
    typicalConversionRates: {
        click_to_lead: 0.03,
        lead_to_customer: 0.1,
    },
};
// =============================================================================
// LLM-AS-JUDGE PROMPTS
// =============================================================================
const STRATEGIC_COHERENCE_JUDGE_PROMPT = `You are evaluating the STRATEGIC COHERENCE of a media plan.

A strategically coherent plan means all elements reinforce each other:
- Audience definition aligns with channel selection
- Objective aligns with measurement approach
- Geography aligns with platform choices
- Economics aligns with tactical decisions
- Funnel stage aligns with messaging approach

PLAN SUMMARY:
- Objective: {objective}
- Budget: {budget}
- Target Volume: {volume_target} {volume_unit}
- Implied Efficiency: {implied_cac}/customer
- Audience: {audience}
- Geography: {geography}
- Channels: {channels}
- Measurement: {measurement}
- Value Prop: {value_prop}

Evaluate alignment:
1. Does audience definition justify channel selection?
2. Does objective match measurement approach?
3. Does geography align with platform choices?
4. Does efficiency target match tactical approach?
5. Does funnel stage match creative approach?

Score 0.0-1.0 where:
- 1.0 = All elements reinforce each other perfectly
- 0.8 = Most elements aligned, minor gaps
- 0.6 = Generally aligned but some disconnects
- 0.4 = Multiple misalignments, some contradictions
- 0.2 = Major contradictions in strategy
- 0.0 = Completely incoherent, contradictory plan

Return JSON: { "score": X.X, "rationale": "...", "alignmentIssues": ["..."] }`;
const DEFENSIBILITY_JUDGE_PROMPT = `You are evaluating whether a media plan would SURVIVE CLIENT SCRUTINY.

A defensible plan:
- Has realistic efficiency targets backed by benchmarks
- Has channel allocations that match industry norms
- Has audience sizing that supports reach claims
- Has test methodology appropriate for budget
- Acknowledges and mitigates key risks

PLAN SUMMARY:
- Budget: {budget}
- Target: {volume_target} {volume_unit} at {implied_cac}/customer
- Industry benchmark CAC: {benchmark_cac}
- Channel mix: {channels}
- Audience size: {audience_size}
- Test budget: {test_budget}
- Identified risks: {risks}

Evaluate defensibility:
1. Is the efficiency target realistic vs. benchmarks?
2. Is the channel mix justified and reasonable?
3. Are reach claims supported by audience sizing?
4. Is the test methodology sound for the budget?
5. Are risks adequately identified and mitigated?

Score 0.0-1.0 where:
- 1.0 = Completely defensible, would pass rigorous scrutiny
- 0.8 = Largely defensible, minor questions might arise
- 0.6 = Defensible with caveats, some assumptions need validation
- 0.4 = Shaky defensibility, multiple unsubstantiated claims
- 0.2 = Largely indefensible, wouldn't survive basic questions
- 0.0 = Completely indefensible, obvious errors

Return JSON: { "score": X.X, "rationale": "...", "vulnerabilities": ["..."] }`;
// =============================================================================
// MATHEMATICAL CONSISTENCY CHECKS
// =============================================================================
/**
 * Check if budget allocations sum correctly
 */
function checkBudgetSums(channelAllocations, totalBudget) {
    if (!channelAllocations || !totalBudget) {
        return { passed: true, details: "No allocations to check" };
    }
    const allocatedTotal = Object.values(channelAllocations).reduce((sum, val) => sum + val, 0);
    const tolerance = totalBudget * 0.05; // 5% tolerance
    const passed = Math.abs(allocatedTotal - totalBudget) <= tolerance;
    return {
        passed,
        details: `Allocated: $${allocatedTotal.toLocaleString()}, Total: $${totalBudget.toLocaleString()}, Diff: $${Math.abs(allocatedTotal - totalBudget).toLocaleString()}`,
    };
}
/**
 * Check if geography spend allocations sum correctly
 */
function checkGeographySpend(geoAllocations, totalBudget) {
    if (!geoAllocations || !totalBudget) {
        return { passed: true, details: "No geo allocations to check" };
    }
    const geoTotal = Object.values(geoAllocations).reduce((sum, val) => sum + val, 0);
    const tolerance = totalBudget * 0.05;
    const passed = Math.abs(geoTotal - totalBudget) <= tolerance;
    return {
        passed,
        details: `Geo total: $${geoTotal.toLocaleString()}, Budget: $${totalBudget.toLocaleString()}`,
    };
}
/**
 * Check if test budget carveout is appropriate
 */
function checkTestBudgetCarveout(testBudget, totalBudget) {
    if (!testBudget || !totalBudget) {
        return { passed: true, details: "No test budget to check" };
    }
    const testPercentage = testBudget / totalBudget;
    // Test budget should typically be 5-20% for meaningful tests
    const passed = testPercentage >= 0.05 && testPercentage <= 0.25;
    return {
        passed,
        details: `Test budget is ${(testPercentage * 100).toFixed(1)}% of total`,
    };
}
/**
 * Check if volume projections are consistent with efficiency and budget
 */
function checkVolumeProjections(projectedVolume, impliedCAC, totalBudget) {
    if (!projectedVolume || !impliedCAC || !totalBudget) {
        return { passed: true, details: "Insufficient data for volume check" };
    }
    const calculatedVolume = totalBudget / impliedCAC;
    const tolerance = projectedVolume * 0.1; // 10% tolerance
    const passed = Math.abs(calculatedVolume - projectedVolume) <= tolerance;
    return {
        passed,
        details: `Projected: ${projectedVolume.toLocaleString()}, Calculated: ${calculatedVolume.toLocaleString()}`,
    };
}
/**
 * Check if channel mix percentages sum to 100%
 */
function checkChannelMixPercentages(channelMix) {
    if (!channelMix) {
        return { passed: true, details: "No channel mix to check" };
    }
    const total = Object.values(channelMix).reduce((sum, val) => sum + val, 0);
    // Check if values are percentages (sum to ~100) or decimals (sum to ~1)
    const isPercentage = total > 50;
    const target = isPercentage ? 100 : 1;
    const tolerance = isPercentage ? 5 : 0.05;
    const passed = Math.abs(total - target) <= tolerance;
    return {
        passed,
        details: `Channel mix sums to ${isPercentage ? total.toFixed(1) + "%" : (total * 100).toFixed(1) + "%"}`,
    };
}
// =============================================================================
// PLAN COHERENCE SCORERS
// =============================================================================
/**
 * Score mathematical consistency (Rule-based)
 *
 * Validates that all numbers in the plan add up correctly.
 */
export function scoreMathematicalConsistency(plan) {
    const checks = [
        checkBudgetSums(plan.channelAllocations, plan.totalBudget),
        checkGeographySpend(plan.geoAllocations, plan.totalBudget),
        checkTestBudgetCarveout(plan.testBudget, plan.totalBudget),
        checkVolumeProjections(plan.volumeTarget, plan.impliedCAC, plan.totalBudget),
        checkChannelMixPercentages(plan.channelMix),
    ];
    const passedChecks = checks.filter((c) => c.passed);
    const score = passedChecks.length / checks.length;
    return {
        scorer: "mathematical-consistency",
        score,
        metadata: {
            checksPerformed: checks.length,
            checksPassed: passedChecks.length,
            checkDetails: checks.map((c) => c.details),
            failedChecks: checks.filter((c) => !c.passed).map((c) => c.details),
        },
        scope: "conversation",
    };
}
/**
 * Score strategic coherence (LLM-as-judge)
 *
 * Evaluates whether all plan elements reinforce each other.
 */
export async function scoreStrategicCoherence(plan) {
    const prompt = STRATEGIC_COHERENCE_JUDGE_PROMPT.replace("{objective}", plan.objective || "Not defined")
        .replace("{budget}", String(plan.totalBudget || "Not defined"))
        .replace("{volume_target}", String(plan.volumeTarget || "Not defined"))
        .replace("{volume_unit}", plan.volumeUnit || "customers")
        .replace("{implied_cac}", String(plan.impliedCAC || "Not calculated"))
        .replace("{audience}", plan.audienceProfile?.demographics || "Not defined")
        .replace("{geography}", plan.geoScope || "Not defined")
        .replace("{channels}", plan.channelMix ? Object.keys(plan.channelMix).join(", ") : "Not defined")
        .replace("{measurement}", plan.attributionModel || "Not defined")
        .replace("{value_prop}", plan.valueProp || "Not defined");
    try {
        const response = await getAnthropicClient().messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }],
        });
        const textBlock = response.content[0];
        const text = textBlock.text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                scorer: "strategic-coherence",
                score: Math.max(0, Math.min(1, parsed.score)),
                metadata: {
                    rationale: parsed.rationale,
                    alignmentIssues: parsed.alignmentIssues || [],
                },
                scope: "conversation",
            };
        }
        return {
            scorer: "strategic-coherence",
            score: 0.5,
            metadata: { error: "Could not parse LLM response" },
            scope: "conversation",
        };
    }
    catch (error) {
        console.error("Strategic coherence scorer error:", error);
        return {
            scorer: "strategic-coherence",
            score: 0.5,
            metadata: { error: String(error) },
            scope: "conversation",
        };
    }
}
/**
 * Score plan defensibility (LLM-as-judge)
 *
 * Evaluates whether the plan would survive client scrutiny.
 */
export async function scoreDefensibility(plan, benchmarks = DEFAULT_BENCHMARKS) {
    const prompt = DEFENSIBILITY_JUDGE_PROMPT.replace("{budget}", String(plan.totalBudget || "Not defined"))
        .replace("{volume_target}", String(plan.volumeTarget || "Not defined"))
        .replace("{volume_unit}", plan.volumeUnit || "customers")
        .replace("{implied_cac}", String(plan.impliedCAC || "Not calculated"))
        .replace("{benchmark_cac}", String(benchmarks.medianCAC))
        .replace("{channels}", plan.channelMix
        ? Object.entries(plan.channelMix)
            .map(([k, v]) => `${k}: ${v}%`)
            .join(", ")
        : "Not defined")
        .replace("{audience_size}", String(plan.audienceSize || "Not estimated"))
        .replace("{test_budget}", String(plan.testBudget || "Not allocated"))
        .replace("{risks}", plan.risks?.join(", ") || "Not identified");
    try {
        const response = await getAnthropicClient().messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }],
        });
        const textBlock = response.content[0];
        const text = textBlock.text.trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                scorer: "defensibility",
                score: Math.max(0, Math.min(1, parsed.score)),
                metadata: {
                    rationale: parsed.rationale,
                    vulnerabilities: parsed.vulnerabilities || [],
                    benchmarksUsed: benchmarks,
                },
                scope: "conversation",
            };
        }
        return {
            scorer: "defensibility",
            score: 0.5,
            metadata: { error: "Could not parse LLM response" },
            scope: "conversation",
        };
    }
    catch (error) {
        console.error("Defensibility scorer error:", error);
        return {
            scorer: "defensibility",
            score: 0.5,
            metadata: { error: String(error) },
            scope: "conversation",
        };
    }
}
/**
 * Score plan comprehensiveness (Rule-based)
 *
 * Checks if all major plan elements are present.
 */
export function scorePlanComprehensiveness(plan) {
    const requiredElements = [
        { name: "objective", present: !!plan.objective },
        { name: "volumeTarget", present: plan.volumeTarget !== undefined },
        { name: "totalBudget", present: plan.totalBudget !== undefined },
        { name: "impliedCAC", present: plan.impliedCAC !== undefined },
        { name: "audienceProfile", present: !!plan.audienceProfile?.demographics },
        { name: "geoScope", present: !!plan.geoScope },
        { name: "channelMix", present: !!plan.channelMix },
        { name: "attributionModel", present: !!plan.attributionModel },
        { name: "testPlan", present: !!plan.testPlan && plan.testPlan.length > 0 },
        { name: "risks", present: !!plan.risks && plan.risks.length > 0 },
    ];
    const presentElements = requiredElements.filter((e) => e.present);
    const score = presentElements.length / requiredElements.length;
    return {
        scorer: "plan-comprehensiveness",
        score,
        metadata: {
            totalElements: requiredElements.length,
            presentElements: presentElements.length,
            missingElements: requiredElements
                .filter((e) => !e.present)
                .map((e) => e.name),
        },
        scope: "conversation",
    };
}
/**
 * Score efficiency realism (Rule-based)
 *
 * Checks if efficiency targets are realistic vs. benchmarks.
 */
export function scoreEfficiencyRealism(plan, benchmarks = DEFAULT_BENCHMARKS) {
    if (!plan.impliedCAC) {
        return {
            scorer: "efficiency-realism",
            score: 0.5,
            metadata: { status: "no_cac_to_evaluate" },
            scope: "conversation",
        };
    }
    const cac = plan.impliedCAC;
    const { min, max } = benchmarks.cacRange;
    let score = 1.0;
    let assessment = "realistic";
    if (cac < min) {
        // Below minimum is aggressive
        const aggressiveness = (min - cac) / min;
        score = Math.max(0.3, 1 - aggressiveness);
        assessment = cac < min * 0.5 ? "very_aggressive" : "aggressive";
    }
    else if (cac > max) {
        // Above maximum is conservative but concerning
        const conservativeness = (cac - max) / max;
        score = Math.max(0.5, 1 - conservativeness * 0.5);
        assessment = "conservative";
    }
    else {
        // Within range
        const midpoint = (min + max) / 2;
        const distanceFromMid = Math.abs(cac - midpoint) / (max - min);
        score = 1 - distanceFromMid * 0.2; // Small penalty for being far from midpoint
        assessment = "realistic";
    }
    return {
        scorer: "efficiency-realism",
        score,
        metadata: {
            impliedCAC: cac,
            benchmarkRange: { min, max },
            benchmarkMedian: benchmarks.medianCAC,
            assessment,
        },
        scope: "conversation",
    };
}
// =============================================================================
// AGGREGATED PLAN COHERENCE SCORER
// =============================================================================
/**
 * Calculate overall plan coherence score
 */
export function calculatePlanCoherenceScore(scores) {
    const mathScore = scores["mathematical-consistency"]?.score || 0;
    const stratScore = scores["strategic-coherence"]?.score || 0;
    const defScore = scores["defensibility"]?.score || 0;
    const compScore = scores["plan-comprehensiveness"]?.score || 0;
    const effScore = scores["efficiency-realism"]?.score || 0;
    // Weighted average
    const overallScore = mathScore * 0.25 +
        stratScore * 0.30 +
        defScore * 0.25 +
        compScore * 0.10 +
        effScore * 0.10;
    return {
        overallScore,
        mathematicalConsistency: mathScore,
        strategicCoherence: stratScore,
        defensibility: defScore,
    };
}
/**
 * Score all plan coherence dimensions
 */
export async function scorePlanCoherence(plan, benchmarks = DEFAULT_BENCHMARKS) {
    const scores = {};
    // Rule-based scorers (synchronous)
    scores["mathematical-consistency"] = scoreMathematicalConsistency(plan);
    scores["plan-comprehensiveness"] = scorePlanComprehensiveness(plan);
    scores["efficiency-realism"] = scoreEfficiencyRealism(plan, benchmarks);
    // LLM-based scorers (parallel)
    const [coherenceScore, defensibilityScore] = await Promise.all([
        scoreStrategicCoherence(plan),
        scoreDefensibility(plan, benchmarks),
    ]);
    scores["strategic-coherence"] = coherenceScore;
    scores["defensibility"] = defensibilityScore;
    return scores;
}
export default scorePlanCoherence;
//# sourceMappingURL=plan-coherence-scorers.js.map