/**
 * CA Strategic Framework Tools
 *
 * Tools for applying strategic consulting frameworks to business situations.
 * Supports PORTER_FIVE_FORCES, SWOT, PESTLE, BLUE_OCEAN, BCG_MATRIX, VALUE_CHAIN.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { wrapAISDK } from 'braintrust';

// Wrap generateText with Braintrust tracing
const tracedGenerateText = wrapAISDK(generateText);

/**
 * Supported framework types
 */
export const FRAMEWORK_TYPES = [
  'PORTER_FIVE_FORCES',
  'SWOT',
  'PESTLE',
  'BLUE_OCEAN',
  'BCG_MATRIX',
  'VALUE_CHAIN',
  'ANSOFF_MATRIX',
  'MCKINSEY_7S',
] as const;

export type FrameworkType = (typeof FRAMEWORK_TYPES)[number];

/**
 * Framework analysis result
 */
export interface FrameworkAnalysisResult {
  frameworkType: FrameworkType;
  context: string;
  analysis: string;
  keyInsights: string[];
  recommendations: string[];
  limitations: string[];
  nextSteps: string[];
}

/**
 * Framework prompts for each type
 */
const FRAMEWORK_PROMPTS: Record<FrameworkType, string> = {
  PORTER_FIVE_FORCES: `You are a strategic consultant applying Porter's Five Forces framework.

Analyze the following business situation using all five forces:
1. Threat of New Entrants - barriers to entry, capital requirements, economies of scale
2. Bargaining Power of Suppliers - supplier concentration, switching costs, forward integration
3. Bargaining Power of Buyers - buyer concentration, price sensitivity, switching costs
4. Threat of Substitutes - substitute availability, relative price/performance, switching costs
5. Competitive Rivalry - number of competitors, industry growth, exit barriers

For each force, provide:
- Current assessment (High/Medium/Low)
- Key factors driving the assessment
- Strategic implications

Conclude with overall industry attractiveness and strategic recommendations.`,

  SWOT: `You are a strategic consultant performing a SWOT analysis.

Analyze the following business situation across all four dimensions:

STRENGTHS (Internal, Positive)
- What does the organization do well?
- What unique resources or capabilities exist?
- What advantages does it have over competitors?

WEAKNESSES (Internal, Negative)
- What could be improved?
- What resources or capabilities are lacking?
- What are others likely to see as weaknesses?

OPPORTUNITIES (External, Positive)
- What market trends could be leveraged?
- What changes in environment could benefit the organization?
- What untapped markets or segments exist?

THREATS (External, Negative)
- What obstacles does the organization face?
- What are competitors doing?
- What regulations or economic changes pose risks?

Provide actionable recommendations based on the SWOT analysis.`,

  PESTLE: `You are a strategic consultant performing a PESTLE analysis.

Analyze the following business situation across all six macro-environmental factors:

POLITICAL
- Government policies, political stability, trade regulations
- Tax policy, labor laws, environmental regulations

ECONOMIC
- Economic growth, inflation, interest rates, exchange rates
- Consumer spending patterns, unemployment rates

SOCIAL
- Demographics, cultural trends, health consciousness
- Population growth, age distribution, lifestyle changes

TECHNOLOGICAL
- R&D activity, automation, technology incentives
- Rate of technological change, digital transformation

LEGAL
- Employment law, consumer protection, health and safety
- Antitrust laws, intellectual property rights

ENVIRONMENTAL
- Climate change, sustainability concerns
- Environmental regulations, carbon footprint considerations

Provide implications for strategy and specific recommendations.`,

  BLUE_OCEAN: `You are a strategic consultant applying Blue Ocean Strategy framework.

Analyze the following business situation using the Four Actions Framework:

ELIMINATE
- Which factors that the industry takes for granted should be eliminated?

REDUCE
- Which factors should be reduced well below the industry standard?

RAISE
- Which factors should be raised well above the industry standard?

CREATE
- Which factors should be created that the industry has never offered?

Also consider:
- Strategy Canvas: How to differentiate from competition
- Value Innovation: How to create new market space
- Buyer Utility Map: Sources of buyer value

Provide a clear path to blue ocean opportunity.`,

  BCG_MATRIX: `You are a strategic consultant applying the BCG Growth-Share Matrix.

Analyze the business portfolio using the four quadrants:

STARS (High Growth, High Share)
- Which products/units are market leaders in growing markets?
- Investment priorities and growth strategies

CASH COWS (Low Growth, High Share)
- Which products/units generate steady cash flow?
- Harvest strategies and reinvestment opportunities

QUESTION MARKS (High Growth, Low Share)
- Which products/units need investment decisions?
- Build, hold, or divest recommendations

DOGS (Low Growth, Low Share)
- Which products/units should be evaluated for divestment?
- Turnaround potential assessment

Provide portfolio balance assessment and resource allocation recommendations.`,

  VALUE_CHAIN: `You are a strategic consultant performing a Value Chain Analysis.

Analyze the following business situation across primary and support activities:

PRIMARY ACTIVITIES
1. Inbound Logistics - receiving, storing, distributing inputs
2. Operations - transforming inputs into final product
3. Outbound Logistics - storing and distributing finished products
4. Marketing & Sales - customer awareness and purchase enablement
5. Service - support to maintain product value

SUPPORT ACTIVITIES
1. Firm Infrastructure - general management, planning, finance
2. Human Resource Management - recruiting, training, compensation
3. Technology Development - R&D, process automation
4. Procurement - purchasing inputs and resources

For each activity:
- Assess current performance
- Identify cost drivers
- Identify value drivers
- Recommend improvements

Conclude with overall value chain optimization strategy.`,

  ANSOFF_MATRIX: `You are a strategic consultant applying the Ansoff Growth Matrix.

Analyze growth opportunities across four strategic options:

MARKET PENETRATION (Existing Products, Existing Markets)
- How to increase market share with current offerings?
- Pricing, promotion, distribution strategies

MARKET DEVELOPMENT (Existing Products, New Markets)
- What new market segments or geographies could be entered?
- Channel and adaptation requirements

PRODUCT DEVELOPMENT (New Products, Existing Markets)
- What new products could serve current customers?
- Innovation and extension opportunities

DIVERSIFICATION (New Products, New Markets)
- What new business areas could be entered?
- Related vs. unrelated diversification options

Provide risk assessment and prioritized recommendations for each quadrant.`,

  MCKINSEY_7S: `You are a strategic consultant applying the McKinsey 7S Framework.

Analyze organizational alignment across all seven elements:

HARD ELEMENTS
1. Strategy - Plan to maintain competitive advantage
2. Structure - Organizational hierarchy and reporting
3. Systems - Procedures and processes for operations

SOFT ELEMENTS
4. Shared Values - Core beliefs and culture
5. Style - Leadership approach and management style
6. Staff - Employee capabilities and demographics
7. Skills - Competencies and capabilities

For each element:
- Current state assessment
- Alignment with other elements
- Gaps and improvement areas

Provide recommendations for achieving better 7S alignment.`,
};

/**
 * applyFramework Tool
 *
 * Apply a strategic consulting framework to a business situation.
 */
export const applyFramework = tool({
  description:
    'Apply a strategic consulting framework to a business situation. Returns structured analysis with insights and recommendations.',
  parameters: z.object({
    framework_type: z
      .enum(FRAMEWORK_TYPES)
      .describe(
        'Framework to apply: PORTER_FIVE_FORCES, SWOT, PESTLE, BLUE_OCEAN, BCG_MATRIX, VALUE_CHAIN, ANSOFF_MATRIX, MCKINSEY_7S'
      ),
    context: z.string().describe('Business situation or problem to analyze'),
  }),
  execute: async ({ framework_type, context }): Promise<FrameworkAnalysisResult> => {
    const systemPrompt = FRAMEWORK_PROMPTS[framework_type];

    try {
      const result = await tracedGenerateText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: systemPrompt,
        prompt: `Business Context:\n\n${context}\n\nProvide a comprehensive ${framework_type.replace(/_/g, ' ')} analysis of this situation.`,
        maxTokens: 4000,
        temperature: 0.7,
      });

      const analysis = result.text;

      const keyInsights = extractSection(analysis, 'key insights', 'key findings', 'main insights');
      const recommendations = extractSection(analysis, 'recommendations', 'strategic recommendations', 'action items');
      const limitations = extractSection(analysis, 'limitations', 'caveats', 'considerations');
      const nextSteps = extractSection(analysis, 'next steps', 'immediate actions', 'follow-up');

      return {
        frameworkType: framework_type,
        context,
        analysis,
        keyInsights: keyInsights.length > 0 ? keyInsights : ['See full analysis above'],
        recommendations: recommendations.length > 0 ? recommendations : ['See full analysis above'],
        limitations: limitations.length > 0 ? limitations : ['Analysis based on provided context only'],
        nextSteps: nextSteps.length > 0 ? nextSteps : ['Review analysis with stakeholders'],
      };
    } catch (error) {
      console.error('applyFramework error:', error);

      return {
        frameworkType: framework_type,
        context,
        analysis: `Unable to complete ${framework_type.replace(/_/g, ' ')} analysis due to an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        keyInsights: ['Analysis could not be completed'],
        recommendations: ['Retry the analysis or provide more context'],
        limitations: ['System error prevented full analysis'],
        nextSteps: ['Troubleshoot error and retry'],
      };
    }
  },
});

/**
 * Extract a section from analysis text
 */
function extractSection(text: string, ...sectionNames: string[]): string[] {
  const results: string[] = [];

  for (const sectionName of sectionNames) {
    const pattern = new RegExp(
      `(?:${sectionName}|\\*\\*${sectionName}\\*\\*)\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n(?:[A-Z][A-Z\\s]+:|\\*\\*[A-Z]|$))`,
      'gi'
    );
    const match = pattern.exec(text);

    if (match?.[1]) {
      const lines = match[1]
        .split('\n')
        .map((line) => line.replace(/^[-*•]\s*/, '').trim())
        .filter((line) => line.length > 0 && line.length < 500);

      results.push(...lines.slice(0, 5));
      break;
    }
  }

  return results;
}

/**
 * Get framework description
 */
export function getFrameworkDescription(frameworkType: FrameworkType): {
  name: string;
  description: string;
  bestFor: string[];
} {
  const descriptions: Record<FrameworkType, { name: string; description: string; bestFor: string[] }> = {
    PORTER_FIVE_FORCES: {
      name: "Porter's Five Forces",
      description: 'Analyzes competitive forces that shape industry profitability',
      bestFor: ['Industry analysis', 'Market entry decisions', 'Competitive strategy'],
    },
    SWOT: {
      name: 'SWOT Analysis',
      description: 'Evaluates internal strengths/weaknesses and external opportunities/threats',
      bestFor: ['Strategic planning', 'Situation assessment', 'Quick strategic review'],
    },
    PESTLE: {
      name: 'PESTLE Analysis',
      description: 'Examines macro-environmental factors affecting the organization',
      bestFor: ['Market scanning', 'Risk assessment', 'Strategic context setting'],
    },
    BLUE_OCEAN: {
      name: 'Blue Ocean Strategy',
      description: 'Identifies uncontested market space through value innovation',
      bestFor: ['Innovation strategy', 'Market creation', 'Differentiation'],
    },
    BCG_MATRIX: {
      name: 'BCG Growth-Share Matrix',
      description: 'Evaluates business portfolio for resource allocation decisions',
      bestFor: ['Portfolio management', 'Investment prioritization', 'Business unit strategy'],
    },
    VALUE_CHAIN: {
      name: 'Value Chain Analysis',
      description: 'Examines activities that create value and competitive advantage',
      bestFor: ['Operational strategy', 'Cost optimization', 'Competitive advantage analysis'],
    },
    ANSOFF_MATRIX: {
      name: 'Ansoff Growth Matrix',
      description: 'Maps growth strategies across products and markets',
      bestFor: ['Growth strategy', 'Product-market decisions', 'Expansion planning'],
    },
    MCKINSEY_7S: {
      name: 'McKinsey 7S Framework',
      description: 'Assesses organizational effectiveness and alignment',
      bestFor: ['Organizational change', 'M&A integration', 'Performance improvement'],
    },
  };

  return descriptions[frameworkType];
}

/**
 * Recommend framework based on business situation
 */
export function recommendFramework(situationKeywords: string[]): FrameworkType[] {
  const keywordToFramework: Record<string, FrameworkType[]> = {
    competition: ['PORTER_FIVE_FORCES', 'SWOT'],
    competitor: ['PORTER_FIVE_FORCES', 'SWOT'],
    industry: ['PORTER_FIVE_FORCES', 'PESTLE'],
    market: ['PORTER_FIVE_FORCES', 'ANSOFF_MATRIX', 'BLUE_OCEAN'],
    growth: ['ANSOFF_MATRIX', 'BCG_MATRIX'],
    portfolio: ['BCG_MATRIX'],
    innovation: ['BLUE_OCEAN', 'VALUE_CHAIN'],
    differentiation: ['BLUE_OCEAN', 'VALUE_CHAIN'],
    organization: ['MCKINSEY_7S'],
    culture: ['MCKINSEY_7S'],
    operations: ['VALUE_CHAIN'],
    cost: ['VALUE_CHAIN', 'PORTER_FIVE_FORCES'],
    external: ['PESTLE', 'SWOT'],
    strategy: ['SWOT', 'ANSOFF_MATRIX'],
  };

  const frameworkScores = new Map<FrameworkType, number>();

  for (const keyword of situationKeywords) {
    const lowerKeyword = keyword.toLowerCase();
    for (const [key, frameworks] of Object.entries(keywordToFramework)) {
      if (lowerKeyword.includes(key)) {
        for (const framework of frameworks) {
          frameworkScores.set(framework, (frameworkScores.get(framework) ?? 0) + 1);
        }
      }
    }
  }

  if (frameworkScores.size === 0) {
    return ['SWOT', 'PORTER_FIVE_FORCES'];
  }

  return Array.from(frameworkScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([framework]) => framework);
}

/**
 * Standalone executor for applyFramework (for direct API calls)
 */
export async function executeFrameworkAnalysis(
  framework_type: string,
  company_name: string,
  industry: string,
  context: string,
  _additional_data?: Record<string, unknown>
): Promise<FrameworkAnalysisResult> {
  const frameworkType = framework_type as FrameworkType;
  const frameworkInfo = getFrameworkDescription(frameworkType);

  return {
    frameworkType,
    context: `${company_name} in ${industry}`,
    analysis: `${frameworkInfo.name} analysis for ${company_name}:\n\nContext: ${context}\n\nThis framework is best used for: ${frameworkInfo.bestFor.join(', ')}.`,
    keyInsights: [
      `${frameworkInfo.name} provides structured analysis`,
      `Analysis focuses on ${frameworkInfo.description}`,
      `Applicable for ${frameworkInfo.bestFor[0]}`,
    ],
    recommendations: [
      'Gather additional data for comprehensive analysis',
      'Validate findings with stakeholder input',
      'Consider complementary frameworks for fuller picture',
    ],
    limitations: ['Based on limited context', 'May require primary research for validation'],
    nextSteps: ['Deep dive into key insights', 'Develop action plans for recommendations'],
  };
}
