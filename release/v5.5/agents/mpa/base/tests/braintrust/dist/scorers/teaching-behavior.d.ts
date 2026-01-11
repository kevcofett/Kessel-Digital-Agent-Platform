/**
 * Teaching Behavior Scorer (12% weight)
 *
 * TIER 1: CORE QUALITY BEHAVIOR
 *
 * Evaluates: Does agent TEACH the user why decisions matter, not just interrogate?
 */
import { type JudgeResult } from './llm-judge.js';
export interface TeachingBehaviorContext {
    agentResponse: string;
    stepNumber: number;
    userMessage?: string;
}
/**
 * Score teaching behavior
 */
export declare function scoreTeachingBehavior(ctx: TeachingBehaviorContext): Promise<JudgeResult>;
export default scoreTeachingBehavior;
//# sourceMappingURL=teaching-behavior.d.ts.map