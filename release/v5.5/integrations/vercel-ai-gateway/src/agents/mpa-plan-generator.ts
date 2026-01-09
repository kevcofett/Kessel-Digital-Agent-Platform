/**
 * MPA Plan Generator Agent
 *
 * Multi-step agent orchestration for media plan generation.
 * Implements the 10-step MPA framework with dynamic KB injection.
 */

import { generateText, CoreMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getBenchmarks, searchChannels } from '../tools/mpa/benchmarks.js';
import { runProjections } from '../tools/mpa/projections.js';
import { validatePlan, calculateCAC } from '../tools/mpa/validation.js';
import { loadSessionHistoryForAI, saveResponseToSession } from '../tools/eap/sessions.js';
import { getKBContent, truncateKBContent } from '../utils/kb-loader.js';

/**
 * MPA System Prompt based on MPA_Copilot_Instructions_v5_4.txt
 */
const MPA_SYSTEM_PROMPT = `PRIME DIRECTIVES

Ensure best possible real-world outcomes from media campaigns.
Teach, mentor, and grow marketing talent. Performance without people growth is failure.
Leverage AI proactively for research, modeling, and forecasting. Re-run analysis as each new data point arrives.

ROLE

You are an AI senior media strategist, mentor, and analytical partner. Vendor-agnostic, industry-agnostic, client-agnostic. Your job is to make the USER capable of building the best plan, not to build it yourself. Success means user understands WHY each decision was made.

HARD CONSTRAINTS

- Never present multiple unrelated questions in one turn. Ask one question, wait, then decide what to ask next.
- Never re-ask questions the user has answered.
- Never use acronyms without defining them in context.
- Never invent metrics or KPIs. Use only established industry terms.
- Never claim any source you cannot verify.
- Never claim data is from KB if you did not retrieve it.
- Never ask for technical identifiers (GUIDs, session IDs, plan IDs).

SOURCE TRANSPARENCY

If you searched and found nothing citable, say so immediately. Lead with what you did and what you found.

DATA QUALITY HIERARCHY (Highest to Lowest Priority)

1. Direct API or platform data
2. MCP Tool results (benchmarks, projections)
3. Web research from credible sources
4. User-provided data
5. Knowledge Base documents
6. Your estimate (clearly labeled as estimate with confidence level)

RESPONSE DISCIPLINE

Keep responses short. Aim for under 75 words unless generating a complete plan section. Include only:
- Brief acknowledgment if needed
- Insight if new
- One question OR analysis (not both in same turn unless question is rhetorical)

PROACTIVE INTELLIGENCE

Once you have enough data to model, DO THE MATH. Present findings with:
- Source attribution
- Confidence level
- Calculation transparency
Guide with analysis, not interrogation.

10-STEP FRAMEWORK

Steps 1-2: Outcomes and Economics
- Define primary objective (awareness, consideration, conversion, retention)
- Validate CAC/LTV economics
- Establish target volumes and success metrics

Steps 3-4: Audience and Geography
- Define primary and secondary audiences
- Specify geographic scope and priorities
- Estimate addressable market size

Steps 5-6: Budget and Value Proposition
- Confirm total budget and pacing
- Identify key differentiators
- Define competitive positioning

Steps 7-8: Channel Mix and Measurement
- Recommend channel allocation based on benchmarks
- Define KPIs and measurement approach
- Specify attribution model

Steps 9-10: Testing and Risk Assessment
- Identify testing opportunities
- Document key risks and mitigations
- Define optimization triggers

AVAILABLE TOOLS

Use these tools proactively when relevant:
- mpa_get_benchmarks: Get industry benchmarks by vertical/channel/KPI
- mpa_search_channels: Find optimal channels for objective/budget
- mpa_run_projections: Calculate reach/frequency/cost projections
- mpa_validate_plan: Check plan against quality gates
- mpa_calculate_cac: Analyze CAC vs benchmarks and LTV`;

/**
 * MPA tools collection
 */
const mpaTools = {
  mpa_get_benchmarks: getBenchmarks,
  mpa_search_channels: searchChannels,
  mpa_run_projections: runProjections,
  mpa_validate_plan: validatePlan,
  mpa_calculate_cac: calculateCAC,
};

/**
 * Agent configuration
 */
export interface MPAAgentConfig {
  maxSteps: number;
  model: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_CONFIG: MPAAgentConfig = {
  maxSteps: 10,
  model: 'claude-sonnet-4-20250514',
  temperature: 0.7,
  maxTokens: 4096,
};

/**
 * Agent request interface
 */
export interface MPAAgentRequest {
  message: string;
  sessionId?: string;
  planId?: string;
  userId?: string;
  verticalCode?: string;
  config?: Partial<MPAAgentConfig>;
}

/**
 * Agent response interface
 */
export interface MPAAgentResponse {
  response: string;
  toolsUsed: Array<{ name: string; args: Record<string, unknown> }>;
  sessionId?: string;
  stepCount: number;
  kbFilesUsed: string[];
}

/**
 * Detect relevant KB files based on message content
 */
function detectRelevantKBFiles(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const relevantFiles: string[] = [];

  if (
    lowerMessage.includes('channel') ||
    lowerMessage.includes('media mix') ||
    lowerMessage.includes('allocation')
  ) {
    relevantFiles.push('channel-playbooks');
  }

  if (
    lowerMessage.includes('audience') ||
    lowerMessage.includes('targeting') ||
    lowerMessage.includes('segment')
  ) {
    relevantFiles.push('audience-targeting');
  }

  if (
    lowerMessage.includes('budget') ||
    lowerMessage.includes('spend') ||
    lowerMessage.includes('cac') ||
    lowerMessage.includes('ltv')
  ) {
    relevantFiles.push('expert-lens-budget');
  }

  if (
    lowerMessage.includes('measure') ||
    lowerMessage.includes('kpi') ||
    lowerMessage.includes('attribution') ||
    lowerMessage.includes('track')
  ) {
    relevantFiles.push('measurement-framework');
    relevantFiles.push('expert-lens-measurement');
  }

  if (
    lowerMessage.includes('benchmark') ||
    lowerMessage.includes('cpm') ||
    lowerMessage.includes('cpc') ||
    lowerMessage.includes('ctr')
  ) {
    relevantFiles.push('analytics-engine');
  }

  if (
    lowerMessage.includes('framework') ||
    lowerMessage.includes('methodology') ||
    lowerMessage.includes('process')
  ) {
    relevantFiles.push('strategic-framework');
  }

  if (
    lowerMessage.includes('gap') ||
    lowerMessage.includes('missing') ||
    lowerMessage.includes('validate')
  ) {
    relevantFiles.push('gap-detection');
  }

  if (relevantFiles.length === 0) {
    relevantFiles.push('strategic-framework');
  }

  return relevantFiles.slice(0, 3);
}

/**
 * Load KB content for context injection
 */
async function loadKBContext(fileKeys: string[]): Promise<string> {
  const contents: string[] = [];

  for (const key of fileKeys) {
    const content = await getKBContent('mpa', key);
    if (content) {
      const truncated = truncateKBContent(content, 3000);
      contents.push(`=== KB: ${key} ===\n${truncated}`);
    }
  }

  return contents.join('\n\n');
}

/**
 * Execute MPA agent
 */
export async function executeMPAAgent(request: MPAAgentRequest): Promise<MPAAgentResponse> {
  const config = { ...DEFAULT_CONFIG, ...request.config };
  const toolsUsed: Array<{ name: string; args: Record<string, unknown> }> = [];
  const kbFilesUsed: string[] = [];

  let sessionHistory: CoreMessage[] = [];
  if (request.sessionId) {
    const history = await loadSessionHistoryForAI(request.sessionId);
    sessionHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  const relevantKBFiles = detectRelevantKBFiles(request.message);
  kbFilesUsed.push(...relevantKBFiles);
  const kbContext = await loadKBContext(relevantKBFiles);

  const systemPromptWithKB = kbContext
    ? `${MPA_SYSTEM_PROMPT}\n\n=== KNOWLEDGE BASE CONTEXT ===\n${kbContext}`
    : MPA_SYSTEM_PROMPT;

  const messages: CoreMessage[] = [
    ...sessionHistory,
    { role: 'user', content: request.message },
  ];

  let stepCount = 0;
  let finalResponse = '';
  let continueLoop = true;

  while (continueLoop && stepCount < config.maxSteps) {
    stepCount++;

    const result = await generateText({
      model: anthropic(config.model),
      system: systemPromptWithKB,
      messages,
      tools: mpaTools,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      toolChoice: stepCount === config.maxSteps ? 'none' : 'auto',
    });

    if (result.toolCalls && result.toolCalls.length > 0) {
      for (const toolCall of result.toolCalls) {
        toolsUsed.push({
          name: toolCall.toolName,
          args: toolCall.args as Record<string, unknown>,
        });

        const tool = mpaTools[toolCall.toolName as keyof typeof mpaTools];
        if (tool) {
          // Execute tool with args and empty context for manual invocation
          const toolResult = await (tool.execute as (args: unknown, ctx: unknown) => Promise<unknown>)(
            toolCall.args,
            { toolCallId: toolCall.toolCallId }
          );

          messages.push({
            role: 'assistant',
            content: [
              {
                type: 'tool-call',
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                args: toolCall.args,
              },
            ],
          });

          messages.push({
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                result: toolResult,
              },
            ],
          });
        }
      }
    } else {
      finalResponse = result.text;
      continueLoop = false;
    }

    if (result.finishReason === 'stop' && !result.toolCalls?.length) {
      finalResponse = result.text;
      continueLoop = false;
    }
  }

  if (request.sessionId && finalResponse) {
    await saveResponseToSession(request.sessionId, request.message, finalResponse);
  }

  return {
    response: finalResponse,
    toolsUsed,
    sessionId: request.sessionId,
    stepCount,
    kbFilesUsed,
  };
}

/**
 * HTTP handler for MPA agent
 */
export async function handleMPARequest(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as MPAAgentRequest;

    if (!body.message) {
      return Response.json({ error: 'message is required' }, { status: 400 });
    }

    const result = await executeMPAAgent(body);

    return Response.json({
      response: result.response,
      metadata: {
        toolsUsed: result.toolsUsed,
        sessionId: result.sessionId,
        stepCount: result.stepCount,
        kbFilesUsed: result.kbFilesUsed,
      },
    });
  } catch (error) {
    console.error('MPA agent error:', error);

    return Response.json(
      {
        error: 'Agent execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
