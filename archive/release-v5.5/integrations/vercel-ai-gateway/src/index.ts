/**
 * MCP Server Entry Point
 *
 * Model Context Protocol server exposing Kessel-Digital agent tools.
 * Provides MPA, CA, and EAP agent capabilities via standardized protocol.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Tool executors
import { executeBenchmarkQuery, executeChannelSearch } from './tools/mpa/benchmarks.js';
import { executeProjections } from './tools/mpa/projections.js';
import { executeValidation, executeCACAnalysis } from './tools/mpa/validation.js';
import { executeFrameworkAnalysis } from './tools/ca/frameworks.js';
import { executeCompetitorAnalysis, executeMarketResearch } from './tools/ca/research.js';
import {
  executeLoadSession,
  executeCreateSession,
  executeUpdateSession,
  executeGetSessionHistory,
} from './tools/eap/sessions.js';
import {
  executeSynthesizeLearnings,
  executePromoteLearning,
  executeSearchLearnings,
} from './tools/eap/learnings.js';
import { getKBContent } from './utils/kb-loader.js';

/**
 * Create and configure MCP server
 */
const server = new McpServer({
  name: 'Kessel-Digital-Agent-Platform',
  version: '5.5.0',
});

// ============================================================================
// MPA TOOLS
// ============================================================================

server.tool(
  'mpa_get_benchmarks',
  'Get industry benchmark data for media planning metrics. Queries Dataverse first, falls back to web search.',
  {
    vertical_code: z.string().describe('Industry vertical code (e.g., RETAIL, AUTO, FINANCE)'),
    channel_code: z.string().optional().describe('Channel code filter (e.g., PAID_SOCIAL, SEARCH)'),
    kpi_code: z.string().optional().describe('KPI code filter (e.g., CPM, CPC, CTR)'),
    budget_tier: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().describe('Budget tier for benchmarks'),
  },
  async (params) => {
    const result = await executeBenchmarkQuery(
      params.vertical_code,
      params.channel_code,
      params.kpi_code,
      params.budget_tier
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'mpa_search_channels',
  'Search and rank channels based on objective, budget, and audience. Returns scored channel recommendations.',
  {
    objective: z
      .enum(['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'RETENTION'])
      .describe('Campaign objective'),
    budget: z.number().describe('Total campaign budget in USD'),
    vertical_code: z.string().describe('Industry vertical code'),
    audience_description: z.string().optional().describe('Target audience description'),
    exclude_channels: z.array(z.string()).optional().describe('Channels to exclude'),
    max_results: z.number().optional().default(10).describe('Maximum channels to return'),
  },
  async (params) => {
    const result = await executeChannelSearch(
      params.objective,
      params.budget,
      params.vertical_code,
      params.audience_description,
      params.exclude_channels,
      params.max_results
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'mpa_run_projections',
  'Calculate media projections including reach, frequency, impressions, and cost metrics using Analytics Engine formulas.',
  {
    budget: z.number().describe('Total budget in USD'),
    channel_allocations: z
      .array(
        z.object({
          channel_code: z.string(),
          allocation_percent: z.number(),
        })
      )
      .describe('Channel budget allocations'),
    vertical_code: z.string().describe('Industry vertical code'),
    campaign_weeks: z.number().describe('Campaign duration in weeks'),
    objective: z
      .enum(['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'RETENTION'])
      .describe('Primary objective'),
    target_audience_size: z.number().optional().describe('Estimated target audience size'),
  },
  async (params) => {
    const result = await executeProjections(
      params.budget,
      params.channel_allocations,
      params.vertical_code,
      params.campaign_weeks,
      params.objective,
      params.target_audience_size
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'mpa_validate_plan',
  'Validate a media plan against quality gates. Checks strategy, execution, and measurement criteria.',
  {
    plan_id: z.string().describe('Plan GUID to validate'),
    gate: z.number().min(1).max(3).describe('Gate to validate (1=Strategy, 2=Execution, 3=Measurement)'),
    plan_data: z.record(z.unknown()).optional().describe('Plan data to validate'),
  },
  async (params) => {
    const result = await executeValidation(
      params.plan_id,
      params.gate as 1 | 2 | 3,
      params.plan_data
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'mpa_calculate_cac',
  'Calculate Customer Acquisition Cost analysis with LTV comparison and recommendations.',
  {
    channel_code: z.string().describe('Channel code for analysis'),
    vertical_code: z.string().describe('Industry vertical code'),
    budget: z.number().describe('Channel budget in USD'),
    projected_conversions: z.number().describe('Expected conversions'),
    conversion_value: z.number().optional().describe('Average conversion value'),
    ltv_estimate: z.number().optional().describe('Customer lifetime value estimate'),
  },
  async (params) => {
    const result = await executeCACAnalysis(
      params.channel_code,
      params.vertical_code,
      params.budget,
      params.projected_conversions,
      params.conversion_value,
      params.ltv_estimate
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// CA TOOLS
// ============================================================================

server.tool(
  'ca_apply_framework',
  'Apply a strategic consulting framework to analyze a business situation.',
  {
    framework_type: z
      .enum([
        'PORTER_FIVE_FORCES',
        'SWOT',
        'PESTLE',
        'BLUE_OCEAN',
        'BCG_MATRIX',
        'VALUE_CHAIN',
        'ANSOFF_MATRIX',
        'MCKINSEY_7S',
      ])
      .describe('Framework to apply'),
    company_name: z.string().describe('Company or brand being analyzed'),
    industry: z.string().describe('Industry context'),
    context: z.string().describe('Situation or question to analyze'),
    additional_data: z.record(z.unknown()).optional().describe('Additional context data'),
  },
  async (params) => {
    const result = await executeFrameworkAnalysis(
      params.framework_type,
      params.company_name,
      params.industry,
      params.context,
      params.additional_data
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'ca_analyze_competitor',
  'Analyze competitor strategy, positioning, and media activity.',
  {
    competitor_name: z.string().describe('Competitor name to analyze'),
    analysis_type: z
      .enum(['FULL', 'POSITIONING', 'MEDIA', 'STRATEGY'])
      .describe('Type of analysis'),
    industry: z.string().describe('Industry context'),
    focus_areas: z.array(z.string()).optional().describe('Specific areas to focus on'),
  },
  async (params) => {
    const result = await executeCompetitorAnalysis(
      params.competitor_name,
      params.analysis_type,
      params.industry,
      params.focus_areas
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'ca_market_research',
  'Conduct market research including sizing, trends, and segment analysis.',
  {
    market_definition: z.string().describe('Market to research'),
    research_type: z
      .enum(['SIZING', 'TRENDS', 'SEGMENTS', 'COMPREHENSIVE'])
      .describe('Research focus'),
    geography: z.string().optional().default('United States').describe('Geographic scope'),
    time_horizon: z.string().optional().describe('Time period for analysis'),
  },
  async (params) => {
    const result = await executeMarketResearch(
      params.market_definition,
      params.research_type,
      params.geography,
      params.time_horizon
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// EAP TOOLS
// ============================================================================

server.tool(
  'eap_load_session',
  'Load an existing agent session with conversation history.',
  {
    session_id: z.string().describe('Session GUID to load'),
  },
  async (params) => {
    const result = await executeLoadSession(params.session_id);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'eap_create_session',
  'Create a new agent session.',
  {
    user_id: z.string().describe('User GUID'),
    agent_code: z.string().describe('Agent code (MPA, CA)'),
    client_id: z.string().optional().describe('Client GUID if applicable'),
    initial_context: z.record(z.unknown()).optional().describe('Initial session context'),
  },
  async (params) => {
    const result = await executeCreateSession(
      params.user_id,
      params.agent_code,
      params.client_id,
      params.initial_context
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'eap_update_session',
  'Update session data and status.',
  {
    session_id: z.string().describe('Session GUID'),
    status: z.enum(['Active', 'Completed', 'Abandoned', 'Paused']).optional(),
    session_data: z.record(z.unknown()).optional().describe('Data to merge into session'),
  },
  async (params) => {
    const result = await executeUpdateSession(
      params.session_id,
      params.status,
      params.session_data
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'eap_get_session_history',
  'Get conversation history for a session.',
  {
    session_id: z.string().describe('Session GUID'),
    limit: z.number().optional().default(50).describe('Maximum messages to return'),
  },
  async (params) => {
    const result = await executeGetSessionHistory(params.session_id, params.limit);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'eap_synthesize_learnings',
  'Synthesize learnings and insights from plan history and sessions.',
  {
    client_id: z.string().optional().describe('Filter by client GUID'),
    vertical_code: z.string().optional().describe('Filter by industry vertical'),
    channel_code: z.string().optional().describe('Filter by channel'),
    date_range_days: z.number().optional().default(90).describe('Look back period in days'),
    focus_area: z.string().optional().describe('Specific area to focus synthesis on'),
  },
  async (params) => {
    const result = await executeSynthesizeLearnings(
      params.client_id,
      params.vertical_code,
      params.channel_code,
      params.date_range_days,
      params.focus_area
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'eap_promote_learning',
  'Promote an insight to the shared knowledge repository.',
  {
    learning_type: z.enum(['BENCHMARK', 'BEST_PRACTICE', 'PITFALL', 'FRAMEWORK', 'INSIGHT', 'PROCESS']),
    title: z.string().describe('Brief title for the learning'),
    content: z.string().describe('Detailed content of the learning'),
    source_agent: z.string().describe('Agent that generated this learning (MPA, CA)'),
    created_by: z.string().describe('User GUID'),
    source_plan_id: z.string().optional(),
    source_session_id: z.string().optional(),
    vertical_code: z.string().optional(),
    channel_code: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    confidence_level: z.enum(['High', 'Medium', 'Low']).default('Medium'),
    applicability: z.string().optional(),
  },
  async (params) => {
    const result = await executePromoteLearning(
      params.learning_type,
      params.title,
      params.content,
      params.source_agent,
      params.created_by,
      params.source_plan_id,
      params.source_session_id,
      params.vertical_code,
      params.channel_code,
      params.tags,
      params.confidence_level,
      params.applicability
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  'eap_search_learnings',
  'Search the learning repository for relevant insights.',
  {
    query: z.string().describe('Search query'),
    learning_type: z
      .enum(['BENCHMARK', 'BEST_PRACTICE', 'PITFALL', 'FRAMEWORK', 'INSIGHT', 'PROCESS'])
      .optional(),
    vertical_code: z.string().optional(),
    channel_code: z.string().optional(),
    limit: z.number().optional().default(10),
  },
  async (params) => {
    const result = await executeSearchLearnings(
      params.query,
      params.learning_type,
      params.vertical_code,
      params.channel_code,
      params.limit
    );
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ============================================================================
// KB RESOURCES
// ============================================================================

server.resource(
  'kb://mpa/analytics-engine',
  'MPA Analytics Engine v5.5 - Calculation formulas and projection methodologies',
  async () => {
    const content = await getKBContent('mpa', 'analytics-engine');
    return {
      contents: [
        {
          uri: 'kb://mpa/analytics-engine',
          mimeType: 'text/plain',
          text: content ?? 'Analytics Engine KB not available',
        },
      ],
    };
  }
);

server.resource(
  'kb://mpa/strategic-framework',
  'MPA Strategic Framework Reference - Campaign strategy guidelines',
  async () => {
    const content = await getKBContent('mpa', 'strategic-framework');
    return {
      contents: [
        {
          uri: 'kb://mpa/strategic-framework',
          mimeType: 'text/plain',
          text: content ?? 'Strategic Framework KB not available',
        },
      ],
    };
  }
);

server.resource(
  'kb://mpa/channel-playbooks',
  'MPA Channel Role Playbooks - Channel capabilities and best practices',
  async () => {
    const content = await getKBContent('mpa', 'channel-playbooks');
    return {
      contents: [
        {
          uri: 'kb://mpa/channel-playbooks',
          mimeType: 'text/plain',
          text: content ?? 'Channel Playbooks KB not available',
        },
      ],
    };
  }
);

server.resource(
  'kb://mpa/benchmark-guide',
  'MPA Benchmark Guide - Industry benchmark reference',
  async () => {
    const content = await getKBContent('mpa', 'benchmark-guide');
    return {
      contents: [
        {
          uri: 'kb://mpa/benchmark-guide',
          mimeType: 'text/plain',
          text: content ?? 'Benchmark Guide KB not available',
        },
      ],
    };
  }
);

server.resource(
  'kb://mpa/measurement-framework',
  'MPA Measurement Framework - KPIs and measurement methodology',
  async () => {
    const content = await getKBContent('mpa', 'measurement-framework');
    return {
      contents: [
        {
          uri: 'kb://mpa/measurement-framework',
          mimeType: 'text/plain',
          text: content ?? 'Measurement Framework KB not available',
        },
      ],
    };
  }
);

// ============================================================================
// PROMPTS
// ============================================================================

server.prompt(
  'mpa-plan-start',
  'Start a new media planning session',
  {
    client_name: z.string().describe('Client or brand name'),
    objective: z.string().describe('Campaign objective'),
    budget: z.string().describe('Budget amount'),
  },
  async (params) => {
    return {
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `I need to create a media plan for ${params.client_name}.
The primary objective is ${params.objective} with a budget of ${params.budget}.
Please help me develop a comprehensive media plan following the 10-step planning framework.`,
          },
        },
      ],
    };
  }
);

server.prompt(
  'ca-strategy-analysis',
  'Start a strategic consulting analysis',
  {
    company_name: z.string().describe('Company to analyze'),
    analysis_type: z.string().describe('Type of analysis needed'),
  },
  async (params) => {
    return {
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `I need a ${params.analysis_type} analysis for ${params.company_name}.
Please apply relevant strategic frameworks and provide actionable recommendations.`,
          },
        },
      ],
    };
  }
);

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start MCP server with stdio transport
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Kessel-Digital MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

export { server };
