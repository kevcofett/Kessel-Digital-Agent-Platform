/**
 * LLM Judge Infrastructure for SCORER_SPECIFICATION_v2
 *
 * Centralized infrastructure for all LLM-based scorers.
 */
export interface JudgeResult {
    score: number;
    rationale: string;
}
export interface JudgePromptContext {
    agent_response: string;
    user_message?: string;
    conversation_history?: string;
    step_number?: number;
    available_data?: string;
    user_target?: string;
    benchmark_range?: string;
    user_level?: string;
    sophistication_signals?: string;
    context?: string;
    step1_summary?: string;
    step2_summary?: string;
    step3_summary?: string;
    step4_summary?: string;
    current_step?: number;
    field?: string;
    old_value?: unknown;
    new_value?: unknown;
    [key: string]: unknown;
}
/**
 * Call the LLM judge with a prompt template and context
 */
export declare function callLLMJudge(promptTemplate: string, context: JudgePromptContext): Promise<JudgeResult>;
/**
 * Judge prompt templates for each LLM scorer
 */
export declare const JUDGE_PROMPTS: {
    'proactive-calculation': string;
    'teaching-behavior': string;
    'feasibility-framing': string;
    'risk-opportunity-flagging': string;
    'adaptive-sophistication': string;
    'cross-step-synthesis': string;
    'recalculation-on-change': string;
};
export default callLLMJudge;
//# sourceMappingURL=llm-judge.d.ts.map