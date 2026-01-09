/**
 * CA Agent HTTP Endpoint
 *
 * Exposes CA Proposal Generator agent via HTTP.
 * Supports strategic consulting and proposal generation.
 */

import { handleCARequest } from '../../../src/agents/ca-proposal-generator.js';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST handler - execute CA agent
 */
export async function POST(request: Request): Promise<Response> {
  return handleCARequest(request);
}

/**
 * GET handler - agent info and health check
 */
export async function GET(): Promise<Response> {
  return Response.json({
    agent: 'CA Proposal Generator',
    version: '5.5.0',
    status: 'operational',
    capabilities: {
      tools: ['ca_apply_framework', 'ca_analyze_competitor', 'ca_market_research'],
      frameworks: [
        'PORTER_FIVE_FORCES',
        'SWOT',
        'PESTLE',
        'BLUE_OCEAN',
        'BCG_MATRIX',
        'VALUE_CHAIN',
        'ANSOFF_MATRIX',
        'MCKINSEY_7S',
      ],
      engagementTypes: ['STRATEGY', 'COMPETITIVE', 'MARKET', 'PROPOSAL', 'GENERAL'],
      maxSteps: 8,
      sessionSupport: true,
    },
    endpoints: {
      execute: 'POST /api/agent/ca',
      health: 'GET /api/agent/ca',
    },
    documentation: {
      requestSchema: {
        message: 'string (required) - User message or analysis request',
        sessionId: 'string (optional) - Session GUID for conversation continuity',
        engagementType:
          "string (optional) - Type of engagement: 'STRATEGY' | 'COMPETITIVE' | 'MARKET' | 'PROPOSAL' | 'GENERAL'",
        config: {
          maxSteps: 'number (default: 8) - Maximum agent steps',
          temperature: 'number (default: 0.6) - Model temperature',
          maxTokens: 'number (default: 4096) - Max response tokens',
        },
      },
      responseSchema: {
        response: 'string - Agent response text',
        metadata: {
          toolsUsed: 'array - Tools invoked during execution',
          sessionId: 'string - Session identifier',
          stepCount: 'number - Steps taken',
          frameworksApplied: 'array - Strategic frameworks used',
        },
      },
    },
    examples: {
      swotAnalysis: {
        message: 'Conduct a SWOT analysis for Tesla in the EV market',
        engagementType: 'STRATEGY',
      },
      competitiveAnalysis: {
        message: 'Analyze Apple vs Samsung competitive positioning in smartphones',
        engagementType: 'COMPETITIVE',
      },
      marketResearch: {
        message: 'What is the market size and growth rate for cloud computing in healthcare?',
        engagementType: 'MARKET',
      },
      proposal: {
        message: 'Help me create a strategic proposal for a digital transformation initiative',
        engagementType: 'PROPOSAL',
      },
      porterAnalysis: {
        message: 'Apply Porter\'s Five Forces to analyze the streaming video industry',
        engagementType: 'STRATEGY',
      },
    },
    frameworkDescriptions: {
      PORTER_FIVE_FORCES:
        'Analyzes competitive intensity through bargaining power of suppliers/buyers, threat of substitutes/new entrants, and competitive rivalry',
      SWOT: 'Evaluates internal Strengths and Weaknesses with external Opportunities and Threats',
      PESTLE:
        'Examines macro-environmental factors: Political, Economic, Social, Technological, Legal, Environmental',
      BLUE_OCEAN:
        'Identifies uncontested market space by analyzing value innovation and strategic moves',
      BCG_MATRIX:
        'Portfolio analysis categorizing business units as Stars, Cash Cows, Question Marks, or Dogs',
      VALUE_CHAIN: "Analyzes primary and support activities to identify competitive advantage sources",
      ANSOFF_MATRIX:
        'Growth strategy framework examining market penetration, development, product development, and diversification',
      MCKINSEY_7S:
        'Organizational effectiveness through Strategy, Structure, Systems, Shared Values, Skills, Style, and Staff',
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
