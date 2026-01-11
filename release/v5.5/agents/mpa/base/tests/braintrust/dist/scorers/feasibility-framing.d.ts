/**
 * Feasibility Framing Scorer (10% weight)
 *
 * TIER 1: CORE QUALITY BEHAVIOR
 *
 * Evaluates: When target is aggressive vs benchmarks, does agent explicitly
 * call it out with evidence and path forward?
 */
import { type JudgeResult } from './llm-judge.js';
export interface FeasibilityFramingContext {
    agentResponse: string;
    userTarget?: string | number;
    benchmarkRange?: string;
    hasCalculation?: boolean;
}
/**
 * Score feasibility framing behavior
 */
export declare function scoreFeasibilityFraming(ctx: FeasibilityFramingContext): Promise<JudgeResult>;
export default scoreFeasibilityFraming;
//# sourceMappingURL=feasibility-framing.d.ts.map