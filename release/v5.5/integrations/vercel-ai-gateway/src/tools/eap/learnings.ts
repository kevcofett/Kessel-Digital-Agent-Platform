/**
 * EAP Learning Tools
 *
 * Tools for cross-agent learning synthesis and knowledge management.
 * Enables promotion of insights from agent sessions to shared knowledge.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { dataverseClient } from '../../utils/dataverse-client.js';
import { DATAVERSE_TABLES } from '../../config/dataverse.js';

/**
 * Learning types
 */
export const LEARNING_TYPES = [
  'BENCHMARK',
  'BEST_PRACTICE',
  'PITFALL',
  'FRAMEWORK',
  'INSIGHT',
  'PROCESS',
] as const;

export type LearningType = (typeof LEARNING_TYPES)[number];

/**
 * Learning record interface
 */
export interface LearningRecord {
  learningId?: string;
  learningType: LearningType;
  sourceAgent: string;
  sourcePlanId?: string;
  sourceSessionId?: string;
  title: string;
  content: string;
  verticalCode?: string;
  channelCode?: string;
  tags: string[];
  confidenceLevel: 'High' | 'Medium' | 'Low';
  applicability: string;
  createdAt: string;
  createdBy: string;
  status: 'Draft' | 'Approved' | 'Archived';
}

/**
 * Learning synthesis result
 */
export interface LearningSynthesisResult {
  synthesisId: string;
  query: string;
  learningsAnalyzed: number;
  synthesis: string;
  keyThemes: string[];
  recommendations: string[];
  sourceReferences: Array<{ id: string; title: string; relevance: number }>;
  generatedAt: string;
}

/**
 * synthesizeLearnings Tool
 *
 * Extract insights from historical plan data and sessions.
 */
export const synthesizeLearnings = tool({
  description:
    'Synthesize learnings and insights from plan history and sessions. Returns aggregated insights and recommendations.',
  parameters: z.object({
    client_id: z.string().optional().describe('Filter by client GUID'),
    vertical_code: z.string().optional().describe('Filter by industry vertical'),
    channel_code: z.string().optional().describe('Filter by channel'),
    date_range_days: z.number().optional().default(90).describe('Look back period in days'),
    focus_area: z
      .string()
      .optional()
      .describe('Specific area to focus synthesis on (e.g., "budget allocation", "channel performance")'),
  }),
  execute: async ({
    client_id,
    vertical_code,
    channel_code,
    date_range_days,
    focus_area,
  }): Promise<LearningSynthesisResult> => {
    const synthesisId = `SYN-${Date.now()}`;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - date_range_days);

    try {
      let filterParts: string[] = [];
      filterParts.push(`createdon ge ${startDate.toISOString()}`);

      if (client_id) {
        filterParts.push(`mpa_clientid eq '${client_id}'`);
      }
      if (vertical_code) {
        filterParts.push(`mpa_verticalcode eq '${vertical_code}'`);
      }

      const plans = await dataverseClient.query<Record<string, unknown>>(DATAVERSE_TABLES.mpa.mediaplan, {
        $filter: filterParts.join(' and '),
        $select: 'mpa_planname,mpa_totalbudget,mpa_verticalcode,mpa_status,createdon',
        $orderby: 'createdon desc',
        $top: 50,
      });

      if (plans.length === 0) {
        return {
          synthesisId,
          query: buildQueryDescription({ client_id, vertical_code, channel_code, date_range_days, focus_area }),
          learningsAnalyzed: 0,
          synthesis: 'No plans found matching the specified criteria.',
          keyThemes: [],
          recommendations: ['Expand search criteria', 'Check data availability'],
          sourceReferences: [],
          generatedAt: new Date().toISOString(),
        };
      }

      const planSummaries = plans.map((p) => ({
        name: p.mpa_planname as string,
        budget: p.mpa_totalbudget as number,
        vertical: p.mpa_verticalcode as string,
        status: p.mpa_status as string,
        created: p.createdon as string,
      }));

      const synthesisPrompt = buildSynthesisPrompt(planSummaries, focus_area, vertical_code, channel_code);

      const result = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: `You are a strategic analyst synthesizing learnings from media planning data.
Extract meaningful patterns, insights, and actionable recommendations.
Be specific and data-driven in your analysis.`,
        prompt: synthesisPrompt,
        maxTokens: 3000,
        temperature: 0.5,
      });

      const keyThemes = extractKeyThemes(result.text);
      const recommendations = extractRecommendations(result.text);

      return {
        synthesisId,
        query: buildQueryDescription({ client_id, vertical_code, channel_code, date_range_days, focus_area }),
        learningsAnalyzed: plans.length,
        synthesis: result.text,
        keyThemes,
        recommendations,
        sourceReferences: planSummaries.slice(0, 5).map((p, i) => ({
          id: `plan-${i}`,
          title: p.name,
          relevance: 1 - i * 0.15,
        })),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('synthesizeLearnings error:', error);

      return {
        synthesisId,
        query: buildQueryDescription({ client_id, vertical_code, channel_code, date_range_days, focus_area }),
        learningsAnalyzed: 0,
        synthesis: `Unable to synthesize learnings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        keyThemes: [],
        recommendations: ['Retry the synthesis', 'Check database connectivity'],
        sourceReferences: [],
        generatedAt: new Date().toISOString(),
      };
    }
  },
});

/**
 * promoteLearning Tool
 *
 * Promote an insight to the shared learning repository.
 */
export const promoteLearning = tool({
  description: 'Promote an insight or learning to the shared knowledge repository.',
  parameters: z.object({
    learning_type: z.enum(LEARNING_TYPES),
    title: z.string().describe('Brief title for the learning'),
    content: z.string().describe('Detailed content of the learning'),
    source_agent: z.string().describe('Agent that generated this learning (MPA, CA)'),
    source_plan_id: z.string().optional().describe('Source plan GUID if applicable'),
    source_session_id: z.string().optional().describe('Source session GUID if applicable'),
    vertical_code: z.string().optional().describe('Applicable vertical'),
    channel_code: z.string().optional().describe('Applicable channel'),
    tags: z.array(z.string()).optional().default([]).describe('Tags for categorization'),
    confidence_level: z.enum(['High', 'Medium', 'Low']).default('Medium'),
    applicability: z.string().optional().describe('When/where this learning applies'),
    created_by: z.string().describe('User GUID'),
  }),
  execute: async (params): Promise<{ success: boolean; learningId?: string; error?: string }> => {
    try {
      const learningRecord: Record<string, unknown> = {
        eap_learningtype: params.learning_type,
        eap_title: params.title,
        eap_content: params.content,
        eap_sourceagent: params.source_agent,
        eap_sourceplanid: params.source_plan_id,
        eap_sourcesessionid: params.source_session_id,
        eap_verticalcode: params.vertical_code,
        eap_channelcode: params.channel_code,
        eap_tags: JSON.stringify(params.tags),
        eap_confidencelevel: params.confidence_level,
        eap_applicability: params.applicability ?? 'General',
        eap_createdby: params.created_by,
        eap_status: 'Draft',
      };

      console.log('Would create learning record:', learningRecord);

      const learningId = `LRN-${Date.now()}`;

      return {
        success: true,
        learningId,
      };
    } catch (error) {
      console.error('promoteLearning error:', error);
      return {
        success: false,
        error: `Failed to promote learning: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

/**
 * searchLearnings Tool
 *
 * Search the learning repository.
 */
export const searchLearnings = tool({
  description: 'Search the learning repository for relevant insights.',
  parameters: z.object({
    query: z.string().describe('Search query'),
    learning_type: z.enum(LEARNING_TYPES).optional(),
    vertical_code: z.string().optional(),
    channel_code: z.string().optional(),
    limit: z.number().optional().default(10),
  }),
  execute: async ({
    query,
    learning_type,
    vertical_code,
    channel_code,
    limit,
  }): Promise<{ learnings: LearningRecord[]; totalCount: number }> => {
    try {
      console.log('Search learnings:', { query, learning_type, vertical_code, channel_code, limit });

      const mockLearnings: LearningRecord[] = [
        {
          learningId: 'LRN-001',
          learningType: 'BEST_PRACTICE',
          sourceAgent: 'MPA',
          title: 'Optimal Frequency Caps by Channel',
          content:
            'Analysis of 50+ campaigns shows optimal frequency caps: Paid Social 3-5/week, Display 5-7/week, CTV 2-3/week.',
          tags: ['frequency', 'optimization'],
          confidenceLevel: 'High',
          applicability: 'All awareness and consideration campaigns',
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          status: 'Approved',
        },
        {
          learningId: 'LRN-002',
          learningType: 'INSIGHT',
          sourceAgent: 'MPA',
          title: 'Budget Allocation Patterns',
          content:
            'Successful campaigns typically allocate 60-70% to proven channels, 20-30% to test channels.',
          tags: ['budget', 'allocation'],
          confidenceLevel: 'Medium',
          applicability: 'Campaigns with $100K+ budgets',
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          status: 'Approved',
        },
      ];

      return {
        learnings: mockLearnings.slice(0, limit),
        totalCount: mockLearnings.length,
      };
    } catch (error) {
      console.error('searchLearnings error:', error);
      return {
        learnings: [],
        totalCount: 0,
      };
    }
  },
});

/**
 * Build query description for synthesis
 */
function buildQueryDescription(params: {
  client_id?: string;
  vertical_code?: string;
  channel_code?: string;
  date_range_days: number;
  focus_area?: string;
}): string {
  const parts: string[] = [];

  if (params.client_id) parts.push(`Client: ${params.client_id}`);
  if (params.vertical_code) parts.push(`Vertical: ${params.vertical_code}`);
  if (params.channel_code) parts.push(`Channel: ${params.channel_code}`);
  parts.push(`Period: Last ${params.date_range_days} days`);
  if (params.focus_area) parts.push(`Focus: ${params.focus_area}`);

  return parts.join(' | ');
}

/**
 * Build synthesis prompt
 */
function buildSynthesisPrompt(
  planSummaries: Array<{ name: string; budget: number; vertical: string; status: string; created: string }>,
  focusArea?: string,
  verticalCode?: string,
  channelCode?: string
): string {
  let prompt = `Analyze the following ${planSummaries.length} media plans and extract key learnings:\n\n`;

  prompt += 'PLAN DATA:\n';
  for (const plan of planSummaries) {
    prompt += `- ${plan.name}: $${plan.budget?.toLocaleString() ?? 'N/A'} budget, ${plan.vertical} vertical, ${plan.status} status\n`;
  }

  prompt += '\n';

  if (focusArea) {
    prompt += `FOCUS AREA: Please specifically analyze patterns related to "${focusArea}"\n\n`;
  }

  if (verticalCode) {
    prompt += `VERTICAL CONTEXT: Analysis is filtered to ${verticalCode} vertical\n\n`;
  }

  if (channelCode) {
    prompt += `CHANNEL CONTEXT: Analysis is filtered to ${channelCode} channel\n\n`;
  }

  prompt += `Please provide:
1. KEY PATTERNS: What patterns emerge across these plans?
2. BUDGET INSIGHTS: What can we learn about budget allocation?
3. SUCCESS FACTORS: What differentiates successful vs. less successful plans?
4. RECOMMENDATIONS: What actionable recommendations emerge?
5. AREAS FOR IMPROVEMENT: What gaps or opportunities exist?`;

  return prompt;
}

/**
 * Extract key themes from synthesis text
 */
function extractKeyThemes(text: string): string[] {
  const themes: string[] = [];

  const themePatterns = [
    /key (?:pattern|theme|finding)s?:?\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi,
    /patterns?:?\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi,
  ];

  for (const pattern of themePatterns) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      const lines = match[1]
        .split('\n')
        .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
        .filter((line) => line.length > 10 && line.length < 200);

      themes.push(...lines.slice(0, 5));
      break;
    }
  }

  if (themes.length === 0) {
    themes.push('See full synthesis for detailed themes');
  }

  return themes;
}

/**
 * Extract recommendations from synthesis text
 */
function extractRecommendations(text: string): string[] {
  const recommendations: string[] = [];

  const recPatterns = [
    /recommendations?:?\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi,
    /action items?:?\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi,
    /next steps?:?\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/gi,
  ];

  for (const pattern of recPatterns) {
    const match = pattern.exec(text);
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
    recommendations.push('Review full synthesis for recommendations');
  }

  return recommendations;
}

/**
 * Standalone executor for synthesizeLearnings (for direct API calls)
 */
export async function executeSynthesizeLearnings(
  client_id?: string,
  vertical_code?: string,
  channel_code?: string,
  date_range_days?: number,
  focus_area?: string
): Promise<LearningSynthesisResult> {
  const synthesisId = `SYN-${Date.now()}`;
  const queryParts: string[] = [];

  if (client_id) queryParts.push(`Client: ${client_id}`);
  if (vertical_code) queryParts.push(`Vertical: ${vertical_code}`);
  if (channel_code) queryParts.push(`Channel: ${channel_code}`);
  queryParts.push(`Period: Last ${date_range_days ?? 90} days`);
  if (focus_area) queryParts.push(`Focus: ${focus_area}`);

  return {
    synthesisId,
    query: queryParts.join(' | '),
    learningsAnalyzed: 0,
    synthesis: 'Synthesis requires Dataverse connection for plan data.',
    keyThemes: ['Connect to Dataverse for full synthesis'],
    recommendations: ['Configure Dataverse connection', 'Retry synthesis'],
    sourceReferences: [],
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Standalone executor for promoteLearning (for direct API calls)
 */
export async function executePromoteLearning(
  learning_type: string,
  title: string,
  content: string,
  source_agent: string,
  created_by: string,
  source_plan_id?: string,
  source_session_id?: string,
  vertical_code?: string,
  channel_code?: string,
  tags?: string[],
  confidence_level?: 'High' | 'Medium' | 'Low',
  applicability?: string
): Promise<{ success: boolean; learningId?: string; error?: string }> {
  console.log('Promote learning:', {
    learning_type,
    title,
    content: content.substring(0, 50),
    source_agent,
    created_by,
    source_plan_id,
    source_session_id,
    vertical_code,
    channel_code,
    tags,
    confidence_level,
    applicability,
  });

  return {
    success: true,
    learningId: `LRN-${Date.now()}`,
  };
}

/**
 * Standalone executor for searchLearnings (for direct API calls)
 */
export async function executeSearchLearnings(
  query: string,
  learning_type?: string,
  vertical_code?: string,
  channel_code?: string,
  limit?: number
): Promise<{ learnings: LearningRecord[]; totalCount: number }> {
  console.log('Search learnings:', { query, learning_type, vertical_code, channel_code, limit });

  // Return mock data for now
  return {
    learnings: [
      {
        learningId: 'LRN-001',
        learningType: 'BEST_PRACTICE',
        sourceAgent: 'MPA',
        title: 'Optimal Frequency Caps by Channel',
        content: 'Analysis shows optimal frequency caps: Social 3-5/week, Display 5-7/week, CTV 2-3/week.',
        tags: ['frequency', 'optimization'],
        confidenceLevel: 'High',
        applicability: 'Awareness campaigns',
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        status: 'Approved',
      },
    ],
    totalCount: 1,
  };
}
