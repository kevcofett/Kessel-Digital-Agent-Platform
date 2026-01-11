/**
 * Self-Critique System
 *
 * Enables agents to critique their own responses for quality improvement.
 * Uses an LLM (typically a smaller/faster model) to evaluate responses
 * against configurable criteria.
 *
 * This component has NO storage dependency - it generates critiques
 * that can be stored by the caller using any storage provider.
 */

import { LLMProvider, LLMMessage } from '../providers/interfaces.js';
import {
  ResponseCritique,
  CritiqueDimension,
  CritiqueIssue,
  CritiqueMetadata,
  LearningConfig,
  DEFAULT_LEARNING_CONFIG,
} from './types.js';

/**
 * Criteria for critiquing agent responses
 */
export interface CritiqueCriteria {
  /**
   * Dimensions to evaluate with descriptions
   */
  dimensions: {
    name: string;
    description: string;
    weight: number;
  }[];

  /**
   * Domain-specific rules for the agent
   */
  domainRules: string[];

  /**
   * Examples of good and bad responses (optional)
   */
  examples?: {
    good: { query: string; response: string; whyGood: string }[];
    bad: { query: string; response: string; whyBad: string }[];
  };
}

/**
 * Default critique criteria (generic)
 */
export const DEFAULT_CRITIQUE_CRITERIA: CritiqueCriteria = {
  dimensions: [
    { name: 'accuracy', description: 'Factual correctness and precision of information', weight: 0.25 },
    { name: 'completeness', description: 'Addresses all aspects of the user query', weight: 0.20 },
    { name: 'clarity', description: 'Clear, well-organized, easy to understand', weight: 0.15 },
    { name: 'citation', description: 'Properly cites sources and provides evidence', weight: 0.20 },
    { name: 'helpfulness', description: 'Actionable and useful for the user', weight: 0.20 },
  ],
  domainRules: [],
};

/**
 * Self-Critique system for agent response evaluation
 */
export class SelfCritique {
  private llmProvider: LLMProvider;
  private criteria: CritiqueCriteria;
  private config: LearningConfig;
  private critiqueCount: number = 0;

  constructor(
    llmProvider: LLMProvider,
    criteria?: CritiqueCriteria,
    config?: Partial<LearningConfig>
  ) {
    this.llmProvider = llmProvider;
    this.criteria = criteria || DEFAULT_CRITIQUE_CRITERIA;
    this.config = { ...DEFAULT_LEARNING_CONFIG, ...config };
  }

  /**
   * Generate a critique of an agent response
   */
  async critique(
    userQuery: string,
    agentResponse: string,
    metadata?: Partial<CritiqueMetadata>
  ): Promise<ResponseCritique> {
    const systemPrompt = this.buildCritiquePrompt();
    const userMessage = this.buildCritiqueRequest(userQuery, agentResponse);

    const response = await this.llmProvider.generateResponse(
      systemPrompt,
      [{ role: 'user', content: userMessage }],
      {
        temperature: 0.3,  // Lower temperature for consistent evaluation
        maxTokens: 2000,
      }
    );

    const critiqueText = this.extractTextContent(response.content);
    const parsedCritique = this.parseCritiqueResponse(critiqueText);

    this.critiqueCount++;

    return {
      id: `critique_${Date.now()}_${this.critiqueCount}`,
      timestamp: new Date(),
      userQuery,
      agentResponse,
      overallScore: parsedCritique.overallScore,
      dimensions: parsedCritique.dimensions,
      issues: parsedCritique.issues,
      suggestions: parsedCritique.suggestions,
      isExemplary: parsedCritique.overallScore >= this.config.exemplaryThreshold,
      metadata: {
        conversationId: metadata?.conversationId || 'unknown',
        turnNumber: metadata?.turnNumber || 0,
        step: metadata?.step,
        topic: metadata?.topic,
        ragQueriesUsed: metadata?.ragQueriesUsed,
        citationsProvided: metadata?.citationsProvided,
      },
    };
  }

  /**
   * Build the system prompt for critique
   */
  private buildCritiquePrompt(): string {
    const dimensionsList = this.criteria.dimensions
      .map(d => `- ${d.name} (${d.weight * 100}%): ${d.description}`)
      .join('\n');

    const domainRulesList = this.criteria.domainRules.length > 0
      ? '\n\nDomain-Specific Rules:\n' + this.criteria.domainRules.map(r => `- ${r}`).join('\n')
      : '';

    return `You are a quality assurance system evaluating AI assistant responses.

Your task is to critically evaluate a response against the following dimensions:

${dimensionsList}
${domainRulesList}

For each evaluation, provide:
1. A score (0-100) for each dimension
2. An overall weighted score
3. Specific issues identified (if any)
4. Concrete suggestions for improvement

Be rigorous but fair. Look for:
- Factual errors or unsupported claims
- Missing information that would be helpful
- Unclear or confusing explanations
- Missing or improper citations
- Opportunities to be more actionable

Output your evaluation in the following JSON format:
{
  "overallScore": <0-100>,
  "dimensions": [
    {"name": "<dimension>", "score": <0-100>, "feedback": "<specific feedback>"}
  ],
  "issues": [
    {"type": "<type>", "severity": "<minor|moderate|major>", "description": "<issue>", "suggestedFix": "<fix>"}
  ],
  "suggestions": ["<suggestion1>", "<suggestion2>"]
}`;
  }

  /**
   * Build the critique request message
   */
  private buildCritiqueRequest(userQuery: string, agentResponse: string): string {
    return `Please evaluate the following response:

USER QUERY:
${userQuery}

AGENT RESPONSE:
${agentResponse}

---
Provide your evaluation in JSON format.`;
  }

  /**
   * Parse the critique response from the LLM
   */
  private parseCritiqueResponse(text: string): {
    overallScore: number;
    dimensions: CritiqueDimension[];
    issues: CritiqueIssue[];
    suggestions: string[];
  } {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);

        return {
          overallScore: (parsed.overallScore || 50) / 100,
          dimensions: (parsed.dimensions || []).map((d: { name: string; score: number; feedback?: string }) => ({
            name: d.name,
            score: (d.score || 50) / 100,
            weight: this.getDimensionWeight(d.name),
            feedback: d.feedback || '',
          })),
          issues: (parsed.issues || []).map((i: { type?: string; severity?: string; description: string; suggestedFix?: string }) => ({
            type: this.normalizeIssueType(i.type),
            severity: this.normalizeSeverity(i.severity),
            description: i.description || '',
            suggestedFix: i.suggestedFix,
          })),
          suggestions: parsed.suggestions || [],
        };
      } catch {
        // Fall through to fallback
      }
    }

    // Fallback: Generate basic critique from text analysis
    return this.fallbackParseCritique(text);
  }

  /**
   * Fallback critique parsing when JSON extraction fails
   */
  private fallbackParseCritique(text: string): {
    overallScore: number;
    dimensions: CritiqueDimension[];
    issues: CritiqueIssue[];
    suggestions: string[];
  } {
    const textLower = text.toLowerCase();

    // Estimate overall score based on sentiment indicators
    let score = 0.7; // Default moderate score
    if (textLower.includes('excellent') || textLower.includes('outstanding')) score = 0.95;
    else if (textLower.includes('good') || textLower.includes('well done')) score = 0.85;
    else if (textLower.includes('adequate') || textLower.includes('acceptable')) score = 0.70;
    else if (textLower.includes('poor') || textLower.includes('lacking')) score = 0.50;
    else if (textLower.includes('unacceptable') || textLower.includes('incorrect')) score = 0.30;

    return {
      overallScore: score,
      dimensions: this.criteria.dimensions.map(d => ({
        name: d.name,
        score: score,  // Use overall score as approximation
        weight: d.weight,
        feedback: 'Unable to parse specific feedback',
      })),
      issues: [],
      suggestions: ['Review the response for potential improvements'],
    };
  }

  /**
   * Get dimension weight from criteria
   */
  private getDimensionWeight(name: string): number {
    const dimension = this.criteria.dimensions.find(d => d.name === name);
    return dimension?.weight || 0.2;
  }

  /**
   * Normalize issue type to valid enum
   */
  private normalizeIssueType(type?: string): CritiqueIssue['type'] {
    const validTypes: CritiqueIssue['type'][] = ['accuracy', 'completeness', 'clarity', 'citation', 'calculation', 'other'];
    const normalized = (type || 'other').toLowerCase();
    return validTypes.includes(normalized as CritiqueIssue['type'])
      ? normalized as CritiqueIssue['type']
      : 'other';
  }

  /**
   * Normalize severity to valid enum
   */
  private normalizeSeverity(severity?: string): CritiqueIssue['severity'] {
    const normalized = (severity || 'moderate').toLowerCase();
    if (normalized === 'minor' || normalized === 'low') return 'minor';
    if (normalized === 'major' || normalized === 'high' || normalized === 'critical') return 'major';
    return 'moderate';
  }

  /**
   * Extract text content from LLM response
   */
  private extractTextContent(content: { type: string; text?: string }[]): string {
    for (const block of content) {
      if (block.type === 'text' && block.text) {
        return block.text;
      }
    }
    return '';
  }

  /**
   * Batch critique multiple responses
   */
  async critiqueBatch(
    interactions: Array<{
      userQuery: string;
      agentResponse: string;
      metadata?: Partial<CritiqueMetadata>;
    }>
  ): Promise<ResponseCritique[]> {
    const results: ResponseCritique[] = [];

    for (const interaction of interactions) {
      const critique = await this.critique(
        interaction.userQuery,
        interaction.agentResponse,
        interaction.metadata
      );
      results.push(critique);
    }

    return results;
  }

  /**
   * Update critique criteria
   */
  setCriteria(criteria: CritiqueCriteria): void {
    this.criteria = criteria;
  }

  /**
   * Get current criteria
   */
  getCriteria(): CritiqueCriteria {
    return { ...this.criteria };
  }

  /**
   * Get critique statistics
   */
  getStats(): { totalCritiques: number } {
    return {
      totalCritiques: this.critiqueCount,
    };
  }
}

export default SelfCritique;
