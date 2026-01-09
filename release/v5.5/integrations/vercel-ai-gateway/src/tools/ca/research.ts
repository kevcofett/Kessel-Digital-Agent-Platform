/**
 * CA Research Tools
 *
 * Tools for competitive intelligence and market research.
 * Leverages AI for synthesis when direct data is unavailable.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

/**
 * Analysis types for competitor research
 */
export const ANALYSIS_TYPES = ['MEDIA', 'STRATEGY', 'POSITIONING', 'FULL'] as const;

export type AnalysisType = (typeof ANALYSIS_TYPES)[number];

/**
 * Competitor analysis result
 */
export interface CompetitorAnalysisResult {
  competitorName: string;
  analysisType: AnalysisType;
  overview: string;
  analysis: Record<string, unknown>;
  dataSources: string[];
  confidence: 'High' | 'Medium' | 'Low';
  lastUpdated: string;
  recommendations: string[];
}

/**
 * Analysis prompts by type
 */
const ANALYSIS_PROMPTS: Record<AnalysisType, string> = {
  MEDIA: `Analyze the competitor's media and marketing strategy. Include:

1. MEDIA PRESENCE
   - Estimated advertising channels used
   - Messaging themes and positioning
   - Share of voice assessment (if known)
   - Creative approach and brand voice

2. DIGITAL FOOTPRINT
   - Website presence and SEO strategy
   - Social media activity and engagement
   - Content marketing approach
   - Email and CRM indicators

3. MEDIA SPEND INDICATORS
   - Estimated spend level (high/medium/low)
   - Seasonal patterns if apparent
   - Channel mix speculation based on visibility

4. COMPETITIVE MEDIA IMPLICATIONS
   - Gaps in their media strategy
   - Potential counter-strategies
   - Differentiation opportunities`,

  STRATEGY: `Analyze the competitor's business strategy. Include:

1. BUSINESS MODEL
   - Revenue model and pricing strategy
   - Target market segments
   - Value proposition
   - Go-to-market approach

2. COMPETITIVE POSITION
   - Market share indicators
   - Competitive advantages
   - Strategic partnerships
   - Moat characteristics

3. STRATEGIC DIRECTION
   - Recent strategic moves
   - Growth initiatives
   - Investment focus areas
   - Potential vulnerabilities

4. STRATEGIC IMPLICATIONS
   - Threat assessment
   - Opportunity identification
   - Recommended responses`,

  POSITIONING: `Analyze the competitor's market positioning. Include:

1. BRAND POSITIONING
   - Brand promise and messaging
   - Target audience definition
   - Key differentiators
   - Brand personality

2. PRODUCT/SERVICE POSITIONING
   - Product portfolio analysis
   - Pricing position (premium/mid/value)
   - Feature emphasis
   - Service differentiation

3. MARKET PERCEPTION
   - Customer reviews and sentiment (if known)
   - Industry recognition
   - Thought leadership
   - Brand associations

4. POSITIONING IMPLICATIONS
   - Positioning gaps to exploit
   - Head-to-head comparison opportunities
   - Differentiation recommendations`,

  FULL: `Provide a comprehensive competitor analysis including:

1. COMPANY OVERVIEW
   - Business description
   - Size and scale indicators
   - History and trajectory
   - Leadership and culture

2. STRATEGY ANALYSIS
   - Business model
   - Competitive position
   - Strategic direction
   - Strengths and weaknesses

3. MARKETING & MEDIA
   - Media presence
   - Brand positioning
   - Marketing approach
   - Digital footprint

4. COMPETITIVE IMPLICATIONS
   - Threat level assessment
   - Competitive advantages to counter
   - Opportunities to exploit
   - Strategic recommendations`,
};

/**
 * analyzeCompetitor Tool
 *
 * Research and analyze competitor activity.
 */
export const analyzeCompetitor = tool({
  description:
    'Research and analyze competitor activity. Returns structured competitive intelligence with recommendations.',
  parameters: z.object({
    competitor_name: z.string().describe('Name of the competitor to analyze'),
    analysis_type: z
      .enum(ANALYSIS_TYPES)
      .describe('Type of analysis: MEDIA, STRATEGY, POSITIONING, or FULL'),
  }),
  execute: async ({ competitor_name, analysis_type }): Promise<CompetitorAnalysisResult> => {
    const systemPrompt = `You are a competitive intelligence analyst. ${ANALYSIS_PROMPTS[analysis_type]}

IMPORTANT GUIDELINES:
- Base analysis on publicly available information
- Clearly indicate when speculating vs. citing known facts
- Be specific about confidence levels
- Provide actionable insights
- Note limitations of the analysis`;

    try {
      const result = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: systemPrompt,
        prompt: `Analyze competitor: ${competitor_name}

Provide a detailed ${analysis_type.toLowerCase()} analysis based on publicly available information about this company.`,
        maxTokens: 4000,
        temperature: 0.5,
      });

      const analysis = result.text;

      const analysisStructure = parseAnalysisStructure(analysis, analysis_type);
      const recommendations = extractRecommendations(analysis);
      const confidence = assessConfidence(analysis, competitor_name);

      return {
        competitorName: competitor_name,
        analysisType: analysis_type,
        overview: extractOverview(analysis),
        analysis: analysisStructure,
        dataSources: ['Public information', 'AI analysis based on training data'],
        confidence,
        lastUpdated: new Date().toISOString(),
        recommendations,
      };
    } catch (error) {
      console.error('analyzeCompetitor error:', error);

      return {
        competitorName: competitor_name,
        analysisType: analysis_type,
        overview: `Unable to complete analysis of ${competitor_name} due to an error.`,
        analysis: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        dataSources: [],
        confidence: 'Low',
        lastUpdated: new Date().toISOString(),
        recommendations: ['Retry analysis', 'Provide additional context about the competitor'],
      };
    }
  },
});

/**
 * Extract overview from analysis
 */
function extractOverview(analysis: string): string {
  const firstParagraph = analysis.split('\n\n')[0];
  if (firstParagraph && firstParagraph.length > 50) {
    return firstParagraph.substring(0, 500) + (firstParagraph.length > 500 ? '...' : '');
  }

  return analysis.substring(0, 300) + '...';
}

/**
 * Parse analysis into structured format
 */
function parseAnalysisStructure(
  analysis: string,
  analysisType: AnalysisType
): Record<string, unknown> {
  const structure: Record<string, unknown> = {};

  const sectionPatterns: Record<AnalysisType, string[]> = {
    MEDIA: ['MEDIA PRESENCE', 'DIGITAL FOOTPRINT', 'MEDIA SPEND', 'COMPETITIVE MEDIA'],
    STRATEGY: ['BUSINESS MODEL', 'COMPETITIVE POSITION', 'STRATEGIC DIRECTION', 'STRATEGIC IMPLICATIONS'],
    POSITIONING: ['BRAND POSITIONING', 'PRODUCT', 'MARKET PERCEPTION', 'POSITIONING IMPLICATIONS'],
    FULL: ['COMPANY OVERVIEW', 'STRATEGY', 'MARKETING', 'COMPETITIVE IMPLICATIONS'],
  };

  const patterns = sectionPatterns[analysisType];

  for (const pattern of patterns) {
    const regex = new RegExp(
      `(?:${pattern}|\\*\\*${pattern}\\*\\*)\\s*\\n([\\s\\S]*?)(?=\\n(?:\\d+\\.|[A-Z]{2,}|\\*\\*[A-Z]|$))`,
      'gi'
    );
    const match = regex.exec(analysis);

    if (match?.[1]) {
      const key = pattern.toLowerCase().replace(/\s+/g, '_');
      structure[key] = match[1].trim().substring(0, 1000);
    }
  }

  if (Object.keys(structure).length === 0) {
    structure['full_analysis'] = analysis;
  }

  return structure;
}

/**
 * Extract recommendations from analysis
 */
function extractRecommendations(analysis: string): string[] {
  const recommendations: string[] = [];

  const recPatterns = [
    /recommend(?:ation)?s?\s*:?\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi,
    /implications?\s*:?\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi,
    /action items?\s*:?\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi,
  ];

  for (const pattern of recPatterns) {
    const match = pattern.exec(analysis);
    if (match?.[1]) {
      const lines = match[1]
        .split('\n')
        .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
        .filter((line) => line.length > 10 && line.length < 300);

      recommendations.push(...lines.slice(0, 5));
      break;
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Review full analysis for detailed insights');
    recommendations.push('Consider additional research for specific areas');
  }

  return recommendations.slice(0, 5);
}

/**
 * Assess confidence level based on analysis content
 */
function assessConfidence(analysis: string, competitorName: string): 'High' | 'Medium' | 'Low' {
  const lowerAnalysis = analysis.toLowerCase();
  const lowerName = competitorName.toLowerCase();

  const highConfidenceIndicators = [
    'according to',
    'reported',
    'publicly stated',
    'annual report',
    'press release',
  ];

  const lowConfidenceIndicators = [
    'may',
    'might',
    'possibly',
    'unclear',
    'limited information',
    'speculative',
    'unknown',
  ];

  let score = 50;

  if (lowerAnalysis.includes(lowerName)) {
    score += 10;
  }

  for (const indicator of highConfidenceIndicators) {
    if (lowerAnalysis.includes(indicator)) {
      score += 5;
    }
  }

  for (const indicator of lowConfidenceIndicators) {
    if (lowerAnalysis.includes(indicator)) {
      score -= 5;
    }
  }

  if (analysis.length > 2000) {
    score += 10;
  }

  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

/**
 * Market research types
 */
export const RESEARCH_TYPES = ['MARKET_SIZE', 'TRENDS', 'SEGMENTS', 'LANDSCAPE'] as const;

export type ResearchType = (typeof RESEARCH_TYPES)[number];

/**
 * Market research result
 */
export interface MarketResearchResult {
  topic: string;
  researchType: ResearchType;
  findings: string;
  keyData: Record<string, unknown>;
  sources: string[];
  confidence: 'High' | 'Medium' | 'Low';
  methodology: string;
}

/**
 * conductMarketResearch Tool
 *
 * Conduct market research on a specific topic or industry.
 */
export const conductMarketResearch = tool({
  description: 'Conduct market research on a specific topic or industry.',
  parameters: z.object({
    topic: z.string().describe('Market or industry topic to research'),
    research_type: z
      .enum(RESEARCH_TYPES)
      .describe('Type of research: MARKET_SIZE, TRENDS, SEGMENTS, or LANDSCAPE'),
    geography: z.string().optional().describe('Geographic focus (e.g., US, Global, Europe)'),
  }),
  execute: async ({ topic, research_type, geography }): Promise<MarketResearchResult> => {
    const researchPrompts: Record<ResearchType, string> = {
      MARKET_SIZE: `Analyze the market size for ${topic}${geography ? ` in ${geography}` : ''}. Include:
- Total addressable market (TAM)
- Serviceable addressable market (SAM)
- Historical growth rates
- Projected growth
- Key size drivers`,

      TRENDS: `Identify key trends in ${topic}${geography ? ` market in ${geography}` : ''}. Include:
- Current major trends
- Emerging trends
- Declining trends
- Technology impacts
- Consumer behavior shifts`,

      SEGMENTS: `Analyze market segmentation for ${topic}${geography ? ` in ${geography}` : ''}. Include:
- Major customer segments
- Segment sizes (if known)
- Segment growth rates
- Key characteristics of each segment
- Unserved segments`,

      LANDSCAPE: `Map the competitive landscape for ${topic}${geography ? ` in ${geography}` : ''}. Include:
- Major players
- Market share distribution
- Entry barriers
- Competitive dynamics
- Recent consolidation or disruption`,
    };

    try {
      const result = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: `You are a market research analyst. Provide data-driven insights based on publicly available information. Be specific about data sources and confidence levels.`,
        prompt: researchPrompts[research_type],
        maxTokens: 3000,
        temperature: 0.5,
      });

      return {
        topic,
        researchType: research_type,
        findings: result.text,
        keyData: extractKeyData(result.text),
        sources: ['Public information', 'AI analysis based on training data'],
        confidence: 'Medium',
        methodology: 'AI-synthesized analysis of publicly available information',
      };
    } catch (error) {
      console.error('conductMarketResearch error:', error);

      return {
        topic,
        researchType: research_type,
        findings: `Unable to complete research on ${topic} due to an error.`,
        keyData: {},
        sources: [],
        confidence: 'Low',
        methodology: 'Research could not be completed',
      };
    }
  },
});

/**
 * Extract key data points from research
 */
function extractKeyData(text: string): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  const percentageMatches = text.match(/(\d+(?:\.\d+)?)\s*%/g);
  if (percentageMatches) {
    data['percentages_mentioned'] = percentageMatches.slice(0, 5);
  }

  const currencyMatches = text.match(/\$[\d,]+(?:\.\d+)?(?:\s*(?:billion|million|trillion|B|M|T))?/gi);
  if (currencyMatches) {
    data['financial_figures'] = currencyMatches.slice(0, 5);
  }

  const cagrMatch = text.match(/CAGR\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/i);
  if (cagrMatch) {
    data['cagr'] = cagrMatch[1] + '%';
  }

  return data;
}

/**
 * Standalone executor for analyzeCompetitor (for direct API calls)
 */
export async function executeCompetitorAnalysis(
  competitor_name: string,
  analysis_type: 'FULL' | 'POSITIONING' | 'MEDIA' | 'STRATEGY',
  industry: string,
  _focus_areas?: string[]
): Promise<CompetitorAnalysisResult> {
  return {
    competitorName: competitor_name,
    analysisType: analysis_type,
    overview: `Competitive analysis of ${competitor_name} in the ${industry} industry.`,
    analysis: {
      summary: `${analysis_type} analysis for ${competitor_name}`,
      industry_context: industry,
      note: 'Full analysis requires AI model invocation',
    },
    dataSources: ['Placeholder - full analysis requires model call'],
    confidence: 'Low',
    lastUpdated: new Date().toISOString(),
    recommendations: [
      'Conduct full AI-powered analysis for detailed insights',
      'Gather primary research data',
      'Monitor competitive activity',
    ],
  };
}

/**
 * Standalone executor for conductMarketResearch (for direct API calls)
 */
export async function executeMarketResearch(
  market_definition: string,
  research_type: 'SIZING' | 'TRENDS' | 'SEGMENTS' | 'COMPREHENSIVE',
  geography?: string,
  _time_horizon?: string
): Promise<MarketResearchResult> {
  const researchTypeMap: Record<string, ResearchType> = {
    SIZING: 'MARKET_SIZE',
    TRENDS: 'TRENDS',
    SEGMENTS: 'SEGMENTS',
    COMPREHENSIVE: 'LANDSCAPE',
  };

  const mappedType = researchTypeMap[research_type] ?? 'MARKET_SIZE';

  return {
    topic: market_definition,
    researchType: mappedType,
    findings: `Market research on ${market_definition}${geography ? ` in ${geography}` : ''}.`,
    keyData: {
      note: 'Full research requires AI model invocation',
    },
    sources: ['Placeholder - full research requires model call'],
    confidence: 'Low',
    methodology: 'Placeholder response - invoke full tool for AI-powered research',
  };
}
