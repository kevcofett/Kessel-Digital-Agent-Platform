/**
 * Cross-Step Synthesis Scorer (5% weight)
 *
 * TIER 3: ADVANCED QUALITY
 *
 * Evaluates: In later steps, does agent explicitly reference insights from earlier steps?
 */
import { callLLMJudge, JUDGE_PROMPTS } from './llm-judge.js';
// Expected synthesis connections by step
const EXPECTED_REFERENCES = {
    5: [2, 4], // Budget should reference Economics, Geography
    6: [3], // Value prop should reference Audience
    7: [3, 4], // Channels should reference Audience, Geography
    8: [1, 2, 7], // Measurement should reference Outcomes, Economics, Channels
    9: [7, 8], // Creative should reference Channels, Measurement
    10: [1, 2, 8], // Timeline should reference Outcomes, Economics, Measurement
};
/**
 * Check for explicit step references
 */
function hasExplicitStepReferences(response) {
    const explicitPatterns = [
        /(?:from|in|per) Step (\d)/gi,
        /(?:based on|given) your (?:\$[\d,]+|[\d,]+|[a-z]+) (?:from|in) Step/gi,
        /(?:earlier|previously) (?:you mentioned|we discussed|we established)/gi,
        /your (\$[\d,]+) (?:budget|target|CAC)/gi, // References specific data
        /your ([\d,]+) (?:customer|conversion|lead) target/gi,
        /your (?:target )?(audience|demo|demographic)/gi,
        /your (?:focus )?(?:markets?|DMAs?|geograph)/gi,
    ];
    const referencedSteps = [];
    for (const pattern of explicitPatterns) {
        const matches = response.matchAll(pattern);
        for (const match of matches) {
            if (match[1] && /^\d$/.test(match[1])) {
                referencedSteps.push(parseInt(match[1]));
            }
        }
    }
    // Also detect implicit references to prior data
    const implicitReferences = {
        1: [/your (?:primary )?(?:KPI|goal|objective)/i, /customer acquisition/i],
        2: [/\$[\d,]+\s*(?:CAC|per customer|target)/i, /your efficiency/i],
        3: [/your (?:target )?audience/i, /(?:homeowners?|demographic|age \d+-\d+)/i],
        4: [/your (?:focus )?(?:markets?|DMAs?)/i, /(?:LA|NYC|Chicago|national)/i],
    };
    for (const [step, patterns] of Object.entries(implicitReferences)) {
        if (patterns.some(p => p.test(response))) {
            referencedSteps.push(parseInt(step));
        }
    }
    return {
        hasExplicit: referencedSteps.length > 0,
        referencedSteps: [...new Set(referencedSteps)],
    };
}
/**
 * Check for re-asking patterns (negative indicator)
 */
function hasReaskingPattern(response, previousQuestions) {
    if (!previousQuestions || previousQuestions.length === 0) {
        return false;
    }
    // Check if current response asks a question similar to previous
    const currentQuestions = response.match(/[^.!?]*\?/g) || [];
    for (const current of currentQuestions) {
        for (const previous of previousQuestions) {
            // Simple Jaccard-like similarity
            const currentWords = new Set(current.toLowerCase().split(/\s+/));
            const previousWords = new Set(previous.toLowerCase().split(/\s+/));
            const intersection = new Set([...currentWords].filter(w => previousWords.has(w)));
            const union = new Set([...currentWords, ...previousWords]);
            const similarity = intersection.size / union.size;
            if (similarity > 0.6) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Score cross-step synthesis
 */
export async function scoreCrossStepSynthesis(ctx) {
    // Not applicable for Steps 1-4
    if (ctx.currentStep < 5) {
        return {
            score: 1.0,
            rationale: 'Not applicable - synthesis expected in Steps 5-10',
        };
    }
    // Check for re-asking (major penalty)
    if (hasReaskingPattern(ctx.agentResponse, ctx.previousQuestions)) {
        return {
            score: 0.25,
            rationale: 'Re-asks question that was answered in earlier step',
        };
    }
    const references = hasExplicitStepReferences(ctx.agentResponse);
    const expectedRefs = EXPECTED_REFERENCES[ctx.currentStep] || [];
    // Check how many expected references are present
    const matchedRefs = expectedRefs.filter(step => references.referencedSteps.includes(step));
    // Score based on reference quality
    if (references.hasExplicit && matchedRefs.length >= 2) {
        return {
            score: 1.0,
            rationale: `Excellent synthesis: references Steps ${matchedRefs.join(', ')} explicitly`,
        };
    }
    if (references.hasExplicit && matchedRefs.length >= 1) {
        return {
            score: 0.75,
            rationale: `Good synthesis: references Step ${matchedRefs[0]}. Could reference more prior insights.`,
        };
    }
    if (references.referencedSteps.length > 0) {
        return {
            score: 0.5,
            rationale: 'Uses prior data implicitly but without explicit step connection',
        };
    }
    // Use LLM for nuanced evaluation
    try {
        const result = await callLLMJudge(JUDGE_PROMPTS['cross-step-synthesis'], {
            agent_response: ctx.agentResponse,
            current_step: ctx.currentStep,
            step1_summary: ctx.stepSummaries.step1 || 'Not provided',
            step2_summary: ctx.stepSummaries.step2 || 'Not provided',
            step3_summary: ctx.stepSummaries.step3 || 'Not provided',
            step4_summary: ctx.stepSummaries.step4 || 'Not provided',
        });
        return result;
    }
    catch (error) {
        return {
            score: 0.5,
            rationale: 'Recommendation without clear reference to earlier step data',
        };
    }
}
export default scoreCrossStepSynthesis;
//# sourceMappingURL=cross-step-synthesis.js.map