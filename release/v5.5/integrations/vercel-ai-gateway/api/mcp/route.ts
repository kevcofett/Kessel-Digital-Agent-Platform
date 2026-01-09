/**
 * MCP HTTP Endpoint
 *
 * Exposes MCP server capabilities via HTTP for Vercel deployment.
 * Supports both SSE streaming and standard HTTP responses.
 */

import { z } from 'zod';

// Import tool executors (the actual execute functions, not the tool wrappers)
import {
  executeBenchmarkQuery,
  executeChannelSearch,
} from '../../src/tools/mpa/benchmarks.js';
import { executeProjections } from '../../src/tools/mpa/projections.js';
import { executeValidation, executeCACAnalysis } from '../../src/tools/mpa/validation.js';
import { executeFrameworkAnalysis } from '../../src/tools/ca/frameworks.js';
import {
  executeCompetitorAnalysis,
  executeMarketResearch,
} from '../../src/tools/ca/research.js';
import {
  executeLoadSession,
  executeCreateSession,
  executeUpdateSession,
  executeGetSessionHistory,
} from '../../src/tools/eap/sessions.js';
import {
  executeSynthesizeLearnings,
  executePromoteLearning,
  executeSearchLearnings,
} from '../../src/tools/eap/learnings.js';
import { getKBContent } from '../../src/utils/kb-loader.js';

/**
 * Request schema for MCP tool calls
 */
const MCPRequestSchema = z.object({
  method: z.enum(['tools/list', 'tools/call', 'resources/list', 'resources/read']),
  params: z.record(z.unknown()).optional(),
});

/**
 * Tool registry with direct executor functions
 */
const toolRegistry: Record<
  string,
  {
    description: string;
    execute: (params: Record<string, unknown>) => Promise<unknown>;
  }
> = {
  mpa_get_benchmarks: {
    description: 'Get industry benchmark data for media planning metrics',
    execute: (params) =>
      executeBenchmarkQuery(
        params.vertical_code as string,
        params.channel_code as string | undefined,
        params.kpi_code as string | undefined,
        params.budget_tier as 'LOW' | 'MEDIUM' | 'HIGH' | undefined
      ),
  },
  mpa_search_channels: {
    description: 'Search and rank channels based on objective, budget, and audience',
    execute: (params) =>
      executeChannelSearch(
        params.objective as 'AWARENESS' | 'CONSIDERATION' | 'CONVERSION' | 'RETENTION',
        params.budget as number,
        params.vertical_code as string,
        params.audience_description as string | undefined,
        params.exclude_channels as string[] | undefined,
        params.max_results as number | undefined
      ),
  },
  mpa_run_projections: {
    description: 'Calculate media projections using Analytics Engine formulas',
    execute: (params) =>
      executeProjections(
        params.budget as number,
        params.channel_allocations as Array<{ channel_code: string; allocation_percent: number }>,
        params.vertical_code as string,
        params.campaign_weeks as number,
        params.objective as 'AWARENESS' | 'CONSIDERATION' | 'CONVERSION' | 'RETENTION',
        params.target_audience_size as number | undefined
      ),
  },
  mpa_validate_plan: {
    description: 'Validate a media plan against quality gates',
    execute: (params) =>
      executeValidation(
        params.plan_id as string,
        params.gate as 1 | 2 | 3,
        params.plan_data as Record<string, unknown> | undefined
      ),
  },
  mpa_calculate_cac: {
    description: 'Calculate Customer Acquisition Cost analysis',
    execute: (params) =>
      executeCACAnalysis(
        params.channel_code as string,
        params.vertical_code as string,
        params.budget as number,
        params.projected_conversions as number,
        params.conversion_value as number | undefined,
        params.ltv_estimate as number | undefined
      ),
  },
  ca_apply_framework: {
    description: 'Apply a strategic consulting framework',
    execute: (params) =>
      executeFrameworkAnalysis(
        params.framework_type as string,
        params.company_name as string,
        params.industry as string,
        params.context as string,
        params.additional_data as Record<string, unknown> | undefined
      ),
  },
  ca_analyze_competitor: {
    description: 'Analyze competitor strategy and positioning',
    execute: (params) =>
      executeCompetitorAnalysis(
        params.competitor_name as string,
        params.analysis_type as 'FULL' | 'POSITIONING' | 'MEDIA' | 'STRATEGY',
        params.industry as string,
        params.focus_areas as string[] | undefined
      ),
  },
  ca_market_research: {
    description: 'Conduct market research and analysis',
    execute: (params) =>
      executeMarketResearch(
        params.market_definition as string,
        params.research_type as 'SIZING' | 'TRENDS' | 'SEGMENTS' | 'COMPREHENSIVE',
        params.geography as string | undefined,
        params.time_horizon as string | undefined
      ),
  },
  eap_load_session: {
    description: 'Load an existing agent session',
    execute: (params) => executeLoadSession(params.session_id as string),
  },
  eap_create_session: {
    description: 'Create a new agent session',
    execute: (params) =>
      executeCreateSession(
        params.user_id as string,
        params.agent_code as string,
        params.client_id as string | undefined,
        params.initial_context as Record<string, unknown> | undefined
      ),
  },
  eap_update_session: {
    description: 'Update session data and status',
    execute: (params) =>
      executeUpdateSession(
        params.session_id as string,
        params.status as 'Active' | 'Completed' | 'Abandoned' | 'Paused' | undefined,
        params.session_data as Record<string, unknown> | undefined
      ),
  },
  eap_get_session_history: {
    description: 'Get conversation history for a session',
    execute: (params) =>
      executeGetSessionHistory(params.session_id as string, params.limit as number | undefined),
  },
  eap_synthesize_learnings: {
    description: 'Synthesize learnings from plan history',
    execute: (params) =>
      executeSynthesizeLearnings(
        params.client_id as string | undefined,
        params.vertical_code as string | undefined,
        params.channel_code as string | undefined,
        params.date_range_days as number | undefined,
        params.focus_area as string | undefined
      ),
  },
  eap_promote_learning: {
    description: 'Promote an insight to the knowledge repository',
    execute: (params) =>
      executePromoteLearning(
        params.learning_type as string,
        params.title as string,
        params.content as string,
        params.source_agent as string,
        params.created_by as string,
        params.source_plan_id as string | undefined,
        params.source_session_id as string | undefined,
        params.vertical_code as string | undefined,
        params.channel_code as string | undefined,
        params.tags as string[] | undefined,
        params.confidence_level as 'High' | 'Medium' | 'Low' | undefined,
        params.applicability as string | undefined
      ),
  },
  eap_search_learnings: {
    description: 'Search the learning repository',
    execute: (params) =>
      executeSearchLearnings(
        params.query as string,
        params.learning_type as string | undefined,
        params.vertical_code as string | undefined,
        params.channel_code as string | undefined,
        params.limit as number | undefined
      ),
  },
};

/**
 * KB resource registry
 */
const resourceRegistry: Record<
  string,
  { description: string; agent: 'mpa' | 'ca' | 'eap'; key: string }
> = {
  'kb://mpa/analytics-engine': {
    description: 'MPA Analytics Engine v5.5',
    agent: 'mpa',
    key: 'analytics-engine',
  },
  'kb://mpa/strategic-framework': {
    description: 'MPA Strategic Framework Reference',
    agent: 'mpa',
    key: 'strategic-framework',
  },
  'kb://mpa/channel-playbooks': {
    description: 'MPA Channel Role Playbooks',
    agent: 'mpa',
    key: 'channel-playbooks',
  },
  'kb://mpa/benchmark-guide': {
    description: 'MPA Benchmark Guide',
    agent: 'mpa',
    key: 'benchmark-guide',
  },
  'kb://mpa/measurement-framework': {
    description: 'MPA Measurement Framework',
    agent: 'mpa',
    key: 'measurement-framework',
  },
};

/**
 * Handle tools/list request
 */
function handleToolsList(): { tools: Array<{ name: string; description: string }> } {
  return {
    tools: Object.entries(toolRegistry).map(([name, { description }]) => ({
      name,
      description,
    })),
  };
}

/**
 * Handle tools/call request
 */
async function handleToolsCall(params: {
  name: string;
  arguments?: Record<string, unknown>;
}): Promise<{ content: Array<{ type: string; text: string }> }> {
  const tool = toolRegistry[params.name];

  if (!tool) {
    throw new Error(`Unknown tool: ${params.name}`);
  }

  const result = await tool.execute(params.arguments ?? {});

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

/**
 * Handle resources/list request
 */
function handleResourcesList(): {
  resources: Array<{ uri: string; name: string; description: string }>;
} {
  return {
    resources: Object.entries(resourceRegistry).map(([uri, { description }]) => ({
      uri,
      name: uri.split('/').pop() ?? uri,
      description,
    })),
  };
}

/**
 * Handle resources/read request
 */
async function handleResourcesRead(params: {
  uri: string;
}): Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> {
  const resource = resourceRegistry[params.uri];

  if (!resource) {
    const match = params.uri.match(/^kb:\/\/(\w+)\/(.+)$/);
    if (match && match[1] && match[2]) {
      const agent = match[1];
      const key = match[2];
      const content = await getKBContent(agent as 'mpa' | 'ca' | 'eap', key);
      return {
        contents: [
          {
            uri: params.uri,
            mimeType: 'text/plain',
            text: content ?? `Resource ${params.uri} not available`,
          },
        ],
      };
    }
    throw new Error(`Unknown resource: ${params.uri}`);
  }

  const content = await getKBContent(resource.agent, resource.key);

  return {
    contents: [
      {
        uri: params.uri,
        mimeType: 'text/plain',
        text: content ?? `Resource ${params.uri} not available`,
      },
    ],
  };
}

/**
 * GET handler - returns server capabilities
 */
export async function GET(): Promise<Response> {
  return Response.json({
    name: 'Kessel-Digital-Agent-Platform',
    version: '5.5.0',
    capabilities: {
      tools: Object.keys(toolRegistry),
      resources: Object.keys(resourceRegistry),
    },
  });
}

/**
 * POST handler - process MCP requests
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = MCPRequestSchema.parse(body);

    let result: unknown;

    switch (parsed.method) {
      case 'tools/list':
        result = handleToolsList();
        break;

      case 'tools/call':
        result = await handleToolsCall(
          parsed.params as { name: string; arguments?: Record<string, unknown> }
        );
        break;

      case 'resources/list':
        result = handleResourcesList();
        break;

      case 'resources/read':
        result = await handleResourcesRead(parsed.params as { uri: string });
        break;

      default:
        throw new Error(`Unknown method: ${parsed.method}`);
    }

    return Response.json({
      jsonrpc: '2.0',
      result,
    });
  } catch (error) {
    console.error('MCP request error:', error);

    return Response.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Internal error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler - CORS preflight
 */
export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
