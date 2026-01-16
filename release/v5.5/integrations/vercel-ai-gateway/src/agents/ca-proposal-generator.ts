/**
 * CA Proposal Generator Agent
 *
 * Multi-step agent orchestration for consulting proposals and strategic analysis.
 * Implements framework-based consulting methodology.
 */

import { generateText, CoreMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { wrapAISDK, initLogger } from 'braintrust';

// Initialize Braintrust logger for CA agent tracing
void initLogger({
  projectName: 'Kessel-CA-Agent',
  apiKey: process.env.BRAINTRUST_API_KEY,
});

// Wrap generateText with Braintrust tracing
const tracedGenerateText = wrapAISDK(generateText);
import { applyFramework } from '../tools/ca/frameworks.js';
import { analyzeCompetitor, conductMarketResearch } from '../tools/ca/research.js';
import { loadSessionHistoryForAI, saveResponseToSession } from '../tools/eap/sessions.js';

/**
 * CA System Prompt
 */
const CA_SYSTEM_PROMPT = `ROLE

You are a senior strategy consultant with expertise in:
- Strategic frameworks (Porter's Five Forces, SWOT, PESTLE, Blue Ocean, BCG Matrix, Value Chain)
- Market analysis and competitive intelligence
- Business transformation and growth strategy
- Proposal development and executive communication

Your approach combines rigorous analytical frameworks with practical business acumen.

PRINCIPLES

1. Framework-First: Always ground analysis in established strategic frameworks
2. Data-Driven: Support insights with data, even when speculative
3. Actionable: Every analysis should lead to clear recommendations
4. Executive-Ready: Communication should be board-room quality
5. Balanced: Consider multiple perspectives before recommending

METHODOLOGY

For any strategic question:
1. Understand the business context and key stakeholders
2. Select appropriate framework(s) for analysis
3. Gather relevant data through research tools
4. Apply framework systematically
5. Synthesize insights into recommendations
6. Consider implementation and risks

OUTPUT STANDARDS

- Lead with the "so what" - what does this mean for the business?
- Structure responses with clear headers and bullet points
- Quantify impact where possible
- Acknowledge limitations and assumptions
- Provide both strategic direction and tactical next steps

AVAILABLE TOOLS

Use these tools to enhance your analysis:
- ca_apply_framework: Apply strategic frameworks (PORTER, SWOT, PESTLE, BLUE_OCEAN, BCG, VALUE_CHAIN)
- ca_analyze_competitor: Research competitor strategy, positioning, and media activity
- ca_market_research: Conduct market sizing, trends, and segment analysis

ENGAGEMENT PHASES

Phase 1: Scoping
- Understand business problem
- Identify stakeholders and success criteria
- Select analytical approach

Phase 2: Analysis
- Apply appropriate frameworks
- Conduct competitor and market research
- Synthesize findings

Phase 3: Recommendations
- Develop strategic options
- Evaluate trade-offs
- Recommend path forward

Phase 4: Implementation Planning
- Define workstreams
- Identify quick wins
- Establish success metrics`;

/**
 * CA tools collection
 */
const caTools = {
  ca_apply_framework: applyFramework,
  ca_analyze_competitor: analyzeCompetitor,
  ca_market_research: conductMarketResearch,
};

/**
 * Agent configuration
 */
export interface CAAgentConfig {
  maxSteps: number;
  model: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_CONFIG: CAAgentConfig = {
  maxSteps: 8,
  model: 'claude-sonnet-4-20250514',
  temperature: 0.6,
  maxTokens: 4096,
};

/**
 * Agent request interface
 */
export interface CAAgentRequest {
  message: string;
  sessionId?: string;
  engagementType?: 'STRATEGY' | 'COMPETITIVE' | 'MARKET' | 'PROPOSAL' | 'GENERAL';
  config?: Partial<CAAgentConfig>;
}

/**
 * Agent response interface
 */
export interface CAAgentResponse {
  response: string;
  toolsUsed: Array<{ name: string; args: Record<string, unknown> }>;
  sessionId?: string;
  stepCount: number;
  frameworksApplied: string[];
}

/**
 * Detect engagement type from message
 */
function detectEngagementType(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('competitor') ||
    lowerMessage.includes('competitive') ||
    lowerMessage.includes('vs') ||
    lowerMessage.includes('versus')
  ) {
    return 'COMPETITIVE';
  }

  if (
    lowerMessage.includes('market size') ||
    lowerMessage.includes('market share') ||
    lowerMessage.includes('tam') ||
    lowerMessage.includes('sam')
  ) {
    return 'MARKET';
  }

  if (
    lowerMessage.includes('proposal') ||
    lowerMessage.includes('pitch') ||
    lowerMessage.includes('rfp')
  ) {
    return 'PROPOSAL';
  }

  if (
    lowerMessage.includes('strategy') ||
    lowerMessage.includes('framework') ||
    lowerMessage.includes('swot') ||
    lowerMessage.includes('porter') ||
    lowerMessage.includes('analysis')
  ) {
    return 'STRATEGY';
  }

  return 'GENERAL';
}

/**
 * Get recommended frameworks for engagement type
 */
function getRecommendedFrameworks(engagementType: string): string[] {
  const frameworkMap: Record<string, string[]> = {
    COMPETITIVE: ['PORTER_FIVE_FORCES', 'SWOT'],
    MARKET: ['PESTLE', 'BCG_MATRIX'],
    STRATEGY: ['SWOT', 'VALUE_CHAIN', 'ANSOFF_MATRIX'],
    PROPOSAL: ['SWOT', 'PORTER_FIVE_FORCES'],
    GENERAL: ['SWOT'],
  };

  return frameworkMap[engagementType] ?? ['SWOT'];
}

/**
 * Execute CA agent
 */
export async function executeCAAgent(request: CAAgentRequest): Promise<CAAgentResponse> {
  const config = { ...DEFAULT_CONFIG, ...request.config };
  const toolsUsed: Array<{ name: string; args: Record<string, unknown> }> = [];
  const frameworksApplied: string[] = [];

  let sessionHistory: CoreMessage[] = [];
  if (request.sessionId) {
    const history = await loadSessionHistoryForAI(request.sessionId);
    sessionHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  const engagementType = request.engagementType ?? detectEngagementType(request.message);
  const recommendedFrameworks = getRecommendedFrameworks(engagementType);

  const contextAddition = `\n\nENGAGEMENT CONTEXT
Type: ${engagementType}
Recommended Frameworks: ${recommendedFrameworks.join(', ')}

Consider using these frameworks if appropriate for the analysis.`;

  const messages: CoreMessage[] = [
    ...sessionHistory,
    { role: 'user', content: request.message },
  ];

  let stepCount = 0;
  let finalResponse = '';
  let continueLoop = true;

  while (continueLoop && stepCount < config.maxSteps) {
    stepCount++;

    const result = await tracedGenerateText({
      model: anthropic(config.model),
      system: CA_SYSTEM_PROMPT + contextAddition,
      messages,
      tools: caTools,
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

        if (toolCall.toolName === 'ca_apply_framework') {
          const args = toolCall.args as { framework_type: string };
          frameworksApplied.push(args.framework_type);
        }

        const tool = caTools[toolCall.toolName as keyof typeof caTools];
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
    frameworksApplied: [...new Set(frameworksApplied)],
  };
}

/**
 * HTTP handler for CA agent
 */
export async function handleCARequest(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as CAAgentRequest;

    if (!body.message) {
      return Response.json({ error: 'message is required' }, { status: 400 });
    }

    const result = await executeCAAgent(body);

    return Response.json({
      response: result.response,
      metadata: {
        toolsUsed: result.toolsUsed,
        sessionId: result.sessionId,
        stepCount: result.stepCount,
        frameworksApplied: result.frameworksApplied,
      },
    });
  } catch (error) {
    console.error('CA agent error:', error);

    return Response.json(
      {
        error: 'Agent execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate proposal outline based on engagement
 */
export async function generateProposalOutline(
  _clientName: string,
  _projectScope: string,
  engagementType: string
): Promise<{
  sections: Array<{ title: string; description: string }>;
  estimatedLength: string;
  keyFrameworks: string[];
}> {
  const frameworks = getRecommendedFrameworks(engagementType);

  const sections = [
    {
      title: 'Executive Summary',
      description: 'High-level overview of recommendations and expected impact',
    },
    {
      title: 'Situation Assessment',
      description: 'Current state analysis using relevant frameworks',
    },
    {
      title: 'Strategic Analysis',
      description: `Application of ${frameworks.slice(0, 2).join(' and ')} frameworks`,
    },
    {
      title: 'Recommendations',
      description: 'Prioritized strategic initiatives with rationale',
    },
    {
      title: 'Implementation Roadmap',
      description: 'Phased approach with milestones and success metrics',
    },
    {
      title: 'Investment and Returns',
      description: 'Resource requirements and expected ROI',
    },
    {
      title: 'Risk Mitigation',
      description: 'Key risks and mitigation strategies',
    },
    {
      title: 'Next Steps',
      description: 'Immediate actions and engagement timeline',
    },
  ];

  return {
    sections,
    estimatedLength: '15-25 pages',
    keyFrameworks: frameworks,
  };
}
