/**
 * Recalculation on Change Scorer (8% weight)
 *
 * TIER 1: CORE QUALITY BEHAVIOR
 *
 * Evaluates: When user provides new data that changes prior calculations,
 * does agent immediately recalculate and show updated projections?
 */
import { type JudgeResult } from './llm-judge.js';
export interface DataChange {
    field: string;
    oldValue: number | string;
    newValue: number | string;
    turnDetected: number;
}
export interface RecalculationContext {
    agentResponse: string;
    dataChange?: DataChange;
    priorCalculation?: string;
}
/**
 * Detect if user message contains a data change
 */
export declare function detectDataChange(priorData: Record<string, unknown>, currentUserMessage: string): DataChange | null;
/**
 * Score recalculation on change
 */
export declare function scoreRecalculationOnChange(ctx: RecalculationContext): Promise<JudgeResult>;
export default scoreRecalculationOnChange;
//# sourceMappingURL=recalculation-on-change.d.ts.map