/**
 * LLM Judge Scorer
 *
 * Uses an LLM to evaluate conversation quality against criteria.
 * This provides more nuanced evaluation than rule-based scorers.
 */
import { BaseScorer } from './base-scorer.js';
/**
 * LLM-based conversation judge
 */
export class LLMJudgeScorer extends BaseScorer {
    llmProvider;
    criteria;
    model;
    temperature;
    constructor(llmProvider, config) {
        super(config);
        this.llmProvider = llmProvider;
        this.criteria = config.criteria;
        this.model = config.model;
        this.temperature = config.temperature ?? 0.3;
    }
    /**
     * Score a conversation using LLM
     */
    async score(transcript) {
        const systemPrompt = this.buildSystemPrompt();
        const userMessage = this.buildEvaluationRequest(transcript);
        try {
            const response = await this.llmProvider.generateResponse(systemPrompt, [{ role: 'user', content: userMessage }], {
                model: this.model,
                temperature: this.temperature,
                maxTokens: 2000,
            });
            const responseText = this.extractText(response.content);
            return this.parseEvaluation(responseText);
        }
        catch (error) {
            return this.createResult(0, `LLM evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { issues: ['LLM evaluation error'] });
        }
    }
    /**
     * Build the system prompt for evaluation
     */
    buildSystemPrompt() {
        const criteriaList = this.criteria
            .map(c => `- ${c.name} (${c.weight * 100}%): ${c.description}`)
            .join('\n');
        return `You are an expert evaluator assessing AI assistant conversation quality.

Evaluate the conversation against these criteria:
${criteriaList}

For each criterion, provide:
1. A score from 0-100
2. Brief reasoning

Then provide:
- An overall weighted score
- A summary explanation
- Any specific issues found

Output your evaluation in this JSON format:
{
  "criteria": [
    {"name": "<name>", "score": <0-100>, "reasoning": "<brief reasoning>"}
  ],
  "overallScore": <0-100>,
  "explanation": "<summary>",
  "issues": ["<issue1>", "<issue2>"]
}`;
    }
    /**
     * Build the evaluation request
     */
    buildEvaluationRequest(transcript) {
        const conversationText = transcript.turns
            .map(t => `User: ${t.userMessage}\n\nAssistant: ${t.assistantResponse}`)
            .join('\n\n---\n\n');
        return `Please evaluate this ${transcript.turns.length}-turn conversation:

${conversationText}

---
Provide your evaluation in JSON format.`;
    }
    /**
     * Parse the LLM evaluation response
     */
    parseEvaluation(text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                const breakdown = {};
                if (parsed.criteria) {
                    for (const c of parsed.criteria) {
                        breakdown[c.name] = (c.score || 50) / 100;
                    }
                }
                return this.createResult((parsed.overallScore || 50) / 100, parsed.explanation || 'LLM evaluation completed', {
                    breakdown,
                    issues: parsed.issues,
                });
            }
            catch {
                // Fall through to fallback
            }
        }
        // Fallback parsing
        return this.fallbackParse(text);
    }
    /**
     * Fallback parsing when JSON fails
     */
    fallbackParse(text) {
        const textLower = text.toLowerCase();
        let score = 0.6; // Default
        if (textLower.includes('excellent') || textLower.includes('outstanding'))
            score = 0.9;
        else if (textLower.includes('good'))
            score = 0.75;
        else if (textLower.includes('poor') || textLower.includes('lacking'))
            score = 0.4;
        return this.createResult(score, 'Evaluated via fallback parsing', { issues: ['Could not parse structured LLM response'] });
    }
    /**
     * Extract text from LLM response content
     */
    extractText(content) {
        for (const block of content) {
            if (block.type === 'text' && block.text) {
                return block.text;
            }
        }
        return '';
    }
}
/**
 * Create an LLM judge scorer with default criteria
 */
export function createLLMJudge(llmProvider, name, weight, criteria) {
    return new LLMJudgeScorer(llmProvider, {
        name,
        weight,
        criteria,
    });
}
export default LLMJudgeScorer;
//# sourceMappingURL=llm-judge.js.map