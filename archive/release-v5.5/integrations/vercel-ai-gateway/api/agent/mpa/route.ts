/**
 * MPA Agent HTTP Endpoint
 *
 * Exposes MPA Plan Generator agent via HTTP.
 * Supports streaming responses for multi-step agent execution.
 */

import { handleMPARequest } from '../../../src/agents/mpa-plan-generator.js';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST handler - execute MPA agent
 */
export async function POST(request: Request): Promise<Response> {
  return handleMPARequest(request);
}

/**
 * GET handler - agent info and health check
 */
export async function GET(): Promise<Response> {
  return Response.json({
    agent: 'MPA Plan Generator',
    version: '5.5.0',
    status: 'operational',
    capabilities: {
      tools: [
        'mpa_get_benchmarks',
        'mpa_search_channels',
        'mpa_run_projections',
        'mpa_validate_plan',
        'mpa_calculate_cac',
      ],
      maxSteps: 10,
      sessionSupport: true,
    },
    endpoints: {
      execute: 'POST /api/agent/mpa',
      health: 'GET /api/agent/mpa',
    },
    documentation: {
      requestSchema: {
        message: 'string (required) - User message or planning request',
        sessionId: 'string (optional) - Session GUID for conversation continuity',
        planId: 'string (optional) - Existing plan GUID to continue',
        clientContext: {
          clientName: 'string - Client or brand name',
          verticalCode: 'string - Industry vertical code',
          objectives: 'string[] - Campaign objectives',
          budget: 'number - Total budget in USD',
        },
        config: {
          maxSteps: 'number (default: 10) - Maximum agent steps',
          temperature: 'number (default: 0.5) - Model temperature',
          maxTokens: 'number (default: 4096) - Max response tokens',
        },
      },
      responseSchema: {
        response: 'string - Agent response text',
        metadata: {
          toolsUsed: 'array - Tools invoked during execution',
          sessionId: 'string - Session identifier',
          stepCount: 'number - Steps taken',
          planProgress: 'object - Plan completion status',
        },
      },
    },
    examples: {
      newPlan: {
        message: 'Create a media plan for Acme Corp retail campaign',
        clientContext: {
          clientName: 'Acme Corp',
          verticalCode: 'RETAIL',
          objectives: ['AWARENESS', 'CONSIDERATION'],
          budget: 500000,
        },
      },
      continuePlan: {
        message: 'Continue with channel allocation',
        sessionId: 'sess-123-456',
        planId: 'plan-789-abc',
      },
      channelQuery: {
        message: 'What channels would work best for a $200K awareness campaign in automotive?',
        clientContext: {
          verticalCode: 'AUTO',
          objectives: ['AWARENESS'],
          budget: 200000,
        },
      },
    },
  });
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
      'Access-Control-Max-Age': '86400',
    },
  });
}
