/**
 * Cross-Step Synthesis Scorer (5% weight)
 *
 * TIER 3: ADVANCED QUALITY
 *
 * Evaluates: In later steps, does agent explicitly reference insights from earlier steps?
 */
import { type JudgeResult } from './llm-judge.js';
export interface CrossStepSynthesisContext {
    agentResponse: string;
    currentStep: number;
    stepSummaries: {
        step1?: string;
        step2?: string;
        step3?: string;
        step4?: string;
    };
    previousQuestions?: string[];
}
/**
 * Score cross-step synthesis
 */
export declare function scoreCrossStepSynthesis(ctx: CrossStepSynthesisContext): Promise<JudgeResult>;
export default scoreCrossStepSynthesis;
//# sourceMappingURL=cross-step-synthesis.d.ts.map