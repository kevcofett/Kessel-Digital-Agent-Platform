/**
 * LLM Judge Infrastructure for SCORER_SPECIFICATION_v2
 *
 * Centralized infrastructure for all LLM-based scorers.
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
// Use Haiku for LLM judges when FAST_SCORING=true
const JUDGE_MODEL = process.env.FAST_SCORING === "true"
    ? "claude-3-5-haiku-20241022"
    : "claude-sonnet-4-20250514";
/**
 * Call the LLM judge with a prompt template and context
 */
export async function callLLMJudge(promptTemplate, context) {
    // Replace placeholders in the template
    let prompt = promptTemplate;
    for (const [key, value] of Object.entries(context)) {
        const placeholder = `{${key}}`;
        prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value ?? ''));
    }
    try {
        const client = getAnthropicClient();
        const response = await client.messages.create({
            model: JUDGE_MODEL,
            max_tokens: 500,
            messages: [{ role: "user", content: prompt }],
        });
        const textBlock = response.content[0];
        const text = textBlock.text.trim();
        // Try to parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*"score"[\s\S]*"rationale"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    score: Math.max(0, Math.min(1, Number(parsed.score))),
                    rationale: String(parsed.rationale || ''),
                };
            }
            catch {
                // Fall through to letter grade parsing
            }
        }
        // Try to parse letter grade
        const letterMatch = text.match(/^[ABCDF]/);
        if (letterMatch) {
            const gradeScores = {
                'A': 1.0,
                'B': 0.75,
                'C': 0.5,
                'D': 0.25,
                'F': 0.0,
            };
            return {
                score: gradeScores[letterMatch[0]] ?? 0.5,
                rationale: text,
            };
        }
        // Try to extract numeric score
        const scoreMatch = text.match(/(\d+\.?\d*)/);
        if (scoreMatch) {
            const score = parseFloat(scoreMatch[1]);
            return {
                score: score > 1 ? score / 100 : score,
                rationale: text,
            };
        }
        // Default fallback
        return {
            score: 0.5,
            rationale: `Could not parse response: ${text}`,
        };
    }
    catch (error) {
        return {
            score: 0.5,
            rationale: `LLM judge error: ${error}`,
        };
    }
}
/**
 * Judge prompt templates for each LLM scorer
 */
export const JUDGE_PROMPTS = {
    'proactive-calculation': `Evaluate if the agent proactively calculates when it has sufficient data.

PROACTIVE CALCULATION means:
- Shows arithmetic on its own line: "$X / Y = $Z per customer"
- Compares result to benchmark: "vs benchmark range of $A-$B"
- States implication: "This is aggressive/achievable/conservative because..."

FAILURE patterns:
- "That gives us something to work with" without math
- Acknowledging budget/volume without calculating efficiency
- Asking more questions when calculation is possible
- Embedding calculation in prose without visual separation

Available data in conversation:
{available_data}

Agent response:
{agent_response}

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}`,
    'teaching-behavior': `Evaluate if the agent TEACHES strategic reasoning vs merely INTERROGATES.

TEACHING indicators:
- Explains WHY a question matters before or after asking
- Provides strategic frameworks ("This matters because...")
- Connects current question to downstream decisions
- Helps user understand implications of their answers
- Frames questions with business context

INTERROGATION indicators:
- Rapid-fire questions without context
- "Let me gather some information" without strategic framing
- No explanation of why information is needed
- Checklist-style data collection
- Moving to next question without synthesis

Current step: {step_number}
Agent response: {agent_response}

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}`,
    'feasibility-framing': `Evaluate if agent appropriately frames target feasibility when comparing to benchmarks.

GOOD FEASIBILITY FRAMING:
- Explicitly states if target is "aggressive", "ambitious", "conservative", or "typical"
- Cites benchmark with source: "vs benchmark of $X-Y based on Knowledge Base"
- Explains path forward: "To hit this, you'll need..."
- Supportive but honest: doesn't discourage, illuminates requirements

POOR FEASIBILITY FRAMING:
- Accepts aggressive target without comment
- Vague concerns without data: "that might be challenging"
- Discourages without evidence
- Accepts clearly unrealistic targets

User's target: {user_target}
Relevant benchmark: {benchmark_range}
Agent response: {agent_response}

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}`,
    'risk-opportunity-flagging': `Evaluate if agent proactively flags risks, opportunities, or considerations.

PROACTIVE FLAGGING means surfacing things user didn't ask about:
- Seasonality impacts on costs
- Platform-specific considerations
- Competitive factors
- Timeline risks
- Budget sufficiency concerns
- Measurement limitations

Context clues to watch for:
- Q4/holiday timing = CPM inflation risk
- Small budget = channel minimum concerns
- Aggressive targets = execution risk
- New market = learning curve

Conversation context: {context}
Agent response: {agent_response}

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}`,
    'adaptive-sophistication': `Evaluate if agent matches communication to user sophistication level.

SOPHISTICATION SIGNALS:
- HIGH: Uses industry jargon correctly, provides detailed economics, asks strategic questions
- MEDIUM: Understands basics, needs some clarification, asks tactical questions
- LOW: Unfamiliar with terms, vague objectives, needs teaching

APPROPRIATE RESPONSES:
- To HIGH user: Skip basics, engage on nuance, peer-level discussion, use abbreviations
- To LOW user: Define terms, use analogies, more explanation, avoid jargon

User sophistication level: {user_level}
Evidence: {sophistication_signals}
Agent response: {agent_response}

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}`,
    'cross-step-synthesis': `Evaluate if agent synthesizes insights from earlier steps in current recommendation.

Current step: {current_step}
Prior step insights:
- Step 1 (Outcomes): {step1_summary}
- Step 2 (Economics): {step2_summary}
- Step 3 (Audience): {step3_summary}
- Step 4 (Geography): {step4_summary}

Agent response: {agent_response}

GOOD SYNTHESIS:
- Explicit reference: "Based on your [X] from Step [N]..."
- Connects current recommendation to prior decision
- Shows how earlier data informs current guidance

POOR SYNTHESIS:
- Re-asks already answered questions
- Makes recommendation without referencing relevant prior data
- Contradicts earlier decisions

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}`,
    'recalculation-on-change': `A data change was detected in the conversation.

Data change: {field} changed from {old_value} to {new_value}

Agent's response after change:
{agent_response}

Evaluate if agent properly recalculated:
- Did agent show new calculation with the updated value?
- Did agent explain what changed from prior projection?
- Did agent acknowledge the impact of the change?

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}`
};
export default callLLMJudge;
//# sourceMappingURL=llm-judge.js.map