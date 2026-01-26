/**
 * Proactive Calculation Scorer (15% weight)
 *
 * TIER 1: CORE QUALITY BEHAVIOR
 *
 * Evaluates: When agent has budget AND volume target, does it immediately
 * calculate implied efficiency and compare to benchmarks?
 */
import { type JudgeResult } from './llm-judge.js';
export interface ProactiveCalculationContext {
    agentResponse: string;
    budget?: number;
    volumeTarget?: number;
    availableData?: Record<string, unknown>;
}
/**
 * Score proactive calculation behavior
 */
export declare function scoreProactiveCalculation(ctx: ProactiveCalculationContext): Promise<JudgeResult>;
export default scoreProactiveCalculation;
//# sourceMappingURL=proactive-calculation.d.ts.map