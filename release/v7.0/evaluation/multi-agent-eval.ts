/**
 * Multi-Agent Evaluation Harness
 *
 * Braintrust-based evaluation framework for testing the multi-agent MPA system.
 * Tests routing accuracy, specialist response quality, and end-to-end workflows.
 */

import { Eval, Scorer } from 'braintrust';
import {
  AgentCode,
  AgentRequest,
  AgentResponse,
  SessionContext,
  ConfidenceLevel,
} from '@kessel-digital/agent-core/multi-agent';

// ============================================================================
// Test Case Types
// ============================================================================

export interface MultiAgentTestCase {
  id: string;
  name: string;
  description: string;
  input: {
    message: string;
    session_context: Partial<SessionContext>;
  };
  expected: {
    target_agent: AgentCode;
    request_type?: string;
    response_contains?: string[];
    response_not_contains?: string[];
    confidence_minimum?: ConfidenceLevel;
    plan_state_updates?: string[];
  };
  tags?: string[];
}

export interface MultiAgentTestResult {
  routing_decision: {
    target_agent: AgentCode;
    request_type: string;
    confidence: ConfidenceLevel;
    rationale?: string;
  };
  response: {
    text: string;
    confidence: ConfidenceLevel;
    sources: string[];
  };
  updated_plan_state?: Record<string, unknown>;
  processing_time_ms: number;
}

// ============================================================================
// Scorers
// ============================================================================

/**
 * Scorer: Did ORC route to the correct specialist?
 */
export const routingAccuracyScorer: Scorer<MultiAgentTestCase, MultiAgentTestResult> = {
  name: 'routing-accuracy',
  scorer: async ({ input, expected, output }) => {
    const correct = output.routing_decision.target_agent === expected.target_agent;
    const requestTypeMatch = expected.request_type
      ? output.routing_decision.request_type === expected.request_type
      : true;

    return {
      name: 'routing-accuracy',
      score: correct && requestTypeMatch ? 1 : correct ? 0.5 : 0,
      metadata: {
        expected_agent: expected.target_agent,
        actual_agent: output.routing_decision.target_agent,
        expected_request_type: expected.request_type,
        actual_request_type: output.routing_decision.request_type,
        routing_rationale: output.routing_decision.rationale,
      },
    };
  },
};

/**
 * Scorer: Did the specialist provide quality response content?
 */
export const responseQualityScorer: Scorer<MultiAgentTestCase, MultiAgentTestResult> = {
  name: 'response-quality',
  scorer: async ({ input, expected, output }) => {
    const responseText = output.response.text.toLowerCase();

    // Check for expected content
    const containsExpected = expected.response_contains?.every(
      term => responseText.includes(term.toLowerCase())
    ) ?? true;

    // Check for content that should NOT be present
    const excludesUnwanted = expected.response_not_contains?.every(
      term => !responseText.includes(term.toLowerCase())
    ) ?? true;

    // Check confidence level
    const confidenceMap: Record<ConfidenceLevel, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const minConfidence = expected.confidence_minimum ?? 'LOW';
    const meetsConfidence = confidenceMap[output.response.confidence] >= confidenceMap[minConfidence];

    const score = [containsExpected, excludesUnwanted, meetsConfidence].filter(Boolean).length / 3;

    return {
      name: 'response-quality',
      score,
      metadata: {
        contains_expected: containsExpected,
        excludes_unwanted: excludesUnwanted,
        meets_confidence: meetsConfidence,
        response_confidence: output.response.confidence,
        expected_terms_found: expected.response_contains?.filter(
          term => responseText.includes(term.toLowerCase())
        ),
        expected_terms_missing: expected.response_contains?.filter(
          term => !responseText.includes(term.toLowerCase())
        ),
      },
    };
  },
};

/**
 * Scorer: Was plan state updated correctly?
 */
export const planStateUpdateScorer: Scorer<MultiAgentTestCase, MultiAgentTestResult> = {
  name: 'plan-state-update',
  scorer: async ({ input, expected, output }) => {
    if (!expected.plan_state_updates || expected.plan_state_updates.length === 0) {
      return { name: 'plan-state-update', score: 1, metadata: { skipped: true } };
    }

    if (!output.updated_plan_state) {
      return {
        name: 'plan-state-update',
        score: 0,
        metadata: {
          expected_updates: expected.plan_state_updates,
          actual_updates: null,
        },
      };
    }

    const actualKeys = Object.keys(output.updated_plan_state);
    const expectedKeys = expected.plan_state_updates;
    const matchingKeys = expectedKeys.filter(key => actualKeys.includes(key));
    const score = matchingKeys.length / expectedKeys.length;

    return {
      name: 'plan-state-update',
      score,
      metadata: {
        expected_updates: expectedKeys,
        actual_updates: actualKeys,
        matching_updates: matchingKeys,
      },
    };
  },
};

/**
 * Scorer: Is the response latency acceptable?
 */
export const latencyScorer: Scorer<MultiAgentTestCase, MultiAgentTestResult> = {
  name: 'latency',
  scorer: async ({ output }) => {
    const thresholds = {
      excellent: 2000,
      good: 3500,
      acceptable: 5000,
    };

    const latency = output.processing_time_ms;
    let score: number;

    if (latency <= thresholds.excellent) {
      score = 1;
    } else if (latency <= thresholds.good) {
      score = 0.8;
    } else if (latency <= thresholds.acceptable) {
      score = 0.5;
    } else {
      score = 0.25;
    }

    return {
      name: 'latency',
      score,
      metadata: {
        processing_time_ms: latency,
        threshold_excellent: thresholds.excellent,
        threshold_good: thresholds.good,
        threshold_acceptable: thresholds.acceptable,
      },
    };
  },
};

/**
 * Scorer: Was the routing confidence appropriate?
 */
export const routingConfidenceScorer: Scorer<MultiAgentTestCase, MultiAgentTestResult> = {
  name: 'routing-confidence',
  scorer: async ({ output }) => {
    const confidence = output.routing_decision.confidence;
    const hasRationale = !!output.routing_decision.rationale;

    // High confidence should have rationale
    // Low confidence is concerning
    let score: number;

    if (confidence === 'HIGH' && hasRationale) {
      score = 1;
    } else if (confidence === 'HIGH' && !hasRationale) {
      score = 0.8;
    } else if (confidence === 'MEDIUM') {
      score = 0.7;
    } else {
      score = 0.3;
    }

    return {
      name: 'routing-confidence',
      score,
      metadata: {
        confidence,
        has_rationale: hasRationale,
        rationale_preview: output.routing_decision.rationale?.substring(0, 100),
      },
    };
  },
};

// ============================================================================
// Test Data Loader
// ============================================================================

/**
 * Load multi-agent test dataset
 */
export async function loadMultiAgentDataset(): Promise<MultiAgentTestCase[]> {
  // Phase 2 test scenarios focusing on ORC and ANL
  return [
    // Routing to ANL
    {
      id: 'routing-anl-projection',
      name: 'Route projection request to ANL',
      description: 'User asks for budget projection - should route to ANL',
      input: {
        message: 'What results can I expect from a $500K budget?',
        session_context: {
          workflow_step: 3,
          workflow_gate: 1,
          session_type: 'Planning',
          plan_state: {
            client_context: { industry: 'retail', vertical: 'e-commerce' },
            objectives: { primary_kpi: 'ROAS', target_value: 4.0 },
          },
        },
      },
      expected: {
        target_agent: 'ANL',
        request_type: 'CALCULATE_PROJECTION',
        response_contains: ['impression', 'reach', 'projection'],
        confidence_minimum: 'MEDIUM',
      },
      tags: ['routing', 'anl', 'projection'],
    },
    {
      id: 'routing-anl-scenario',
      name: 'Route scenario comparison to ANL',
      description: 'User asks to compare budget scenarios - should route to ANL',
      input: {
        message: 'Compare what we could achieve with $300K vs $500K vs $750K budgets',
        session_context: {
          workflow_step: 3,
          workflow_gate: 1,
          session_type: 'Planning',
          plan_state: {
            objectives: { primary_kpi: 'conversions' },
          },
        },
      },
      expected: {
        target_agent: 'ANL',
        request_type: 'RUN_SCENARIO',
        response_contains: ['scenario', 'budget', 'comparison'],
        confidence_minimum: 'MEDIUM',
      },
      tags: ['routing', 'anl', 'scenario'],
    },

    // Routing to AUD
    {
      id: 'routing-aud-targeting',
      name: 'Route targeting question to AUD',
      description: 'User asks about audience targeting - should route to AUD',
      input: {
        message: 'Who should we target for this campaign? What audience segments make sense?',
        session_context: {
          workflow_step: 4,
          workflow_gate: 2,
          session_type: 'Planning',
          plan_state: {
            objectives: { primary_kpi: 'conversions', campaign_type: 'conversion' },
          },
        },
      },
      expected: {
        target_agent: 'AUD',
        request_type: 'RECOMMEND_TARGETING',
        response_contains: ['audience', 'segment', 'target'],
        confidence_minimum: 'MEDIUM',
      },
      tags: ['routing', 'aud', 'targeting'],
    },

    // Routing to CHA
    {
      id: 'routing-cha-channels',
      name: 'Route channel question to CHA',
      description: 'User asks about media channels - should route to CHA',
      input: {
        message: 'What channels should we use for a brand awareness campaign?',
        session_context: {
          workflow_step: 5,
          workflow_gate: 2,
          session_type: 'Planning',
          plan_state: {
            objectives: { campaign_type: 'awareness' },
            budget: { total_budget: 500000, currency: 'USD' },
          },
        },
      },
      expected: {
        target_agent: 'CHA',
        request_type: 'RECOMMEND_CHANNELS',
        response_contains: ['channel', 'media', 'awareness'],
        confidence_minimum: 'MEDIUM',
      },
      tags: ['routing', 'cha', 'channels'],
    },

    // Routing to SPO
    {
      id: 'routing-spo-fees',
      name: 'Route fee analysis to SPO',
      description: 'User asks about ad tech fees - should route to SPO',
      input: {
        message: 'What are the typical tech fees and how much of my budget goes to working media?',
        session_context: {
          workflow_step: 6,
          workflow_gate: 2,
          session_type: 'Planning',
        },
      },
      expected: {
        target_agent: 'SPO',
        request_type: 'ANALYZE_SUPPLY_PATH',
        response_contains: ['fee', 'tech', 'working media'],
        confidence_minimum: 'MEDIUM',
      },
      tags: ['routing', 'spo', 'fees'],
    },

    // Routing to DOC
    {
      id: 'routing-doc-export',
      name: 'Route document request to DOC',
      description: 'User asks to generate a media plan document - should route to DOC',
      input: {
        message: 'Can you generate the media plan document now?',
        session_context: {
          workflow_step: 10,
          workflow_gate: 4,
          session_type: 'Planning',
          plan_state: {
            client_context: { industry: 'retail', vertical: 'e-commerce' },
            objectives: { primary_kpi: 'ROAS' },
            budget: { total_budget: 500000, currency: 'USD' },
            channels: { allocations: [] },
          },
        },
      },
      expected: {
        target_agent: 'DOC',
        request_type: 'GENERATE_PLAN',
        response_contains: ['document', 'plan', 'generate'],
        confidence_minimum: 'MEDIUM',
      },
      tags: ['routing', 'doc', 'document'],
    },

    // Routing to PRF
    {
      id: 'routing-prf-performance',
      name: 'Route performance question to PRF',
      description: 'User asks about campaign performance - should route to PRF',
      input: {
        message: 'How is the campaign performing? Are there any anomalies?',
        session_context: {
          workflow_step: 8,
          workflow_gate: 3,
          session_type: 'InFlight',
        },
      },
      expected: {
        target_agent: 'PRF',
        request_type: 'ANALYZE_PERFORMANCE',
        response_contains: ['performance', 'metric'],
        confidence_minimum: 'MEDIUM',
      },
      tags: ['routing', 'prf', 'performance'],
    },

    // ORC handles directly
    {
      id: 'routing-orc-workflow',
      name: 'ORC handles workflow question directly',
      description: 'User asks about workflow status - ORC handles directly',
      input: {
        message: 'What step are we on and what do we need to complete next?',
        session_context: {
          workflow_step: 4,
          workflow_gate: 2,
          session_type: 'Planning',
        },
      },
      expected: {
        target_agent: 'ORC',
        response_contains: ['step', 'workflow', 'next'],
        confidence_minimum: 'HIGH',
      },
      tags: ['routing', 'orc', 'workflow'],
    },
    {
      id: 'routing-orc-greeting',
      name: 'ORC handles greeting directly',
      description: 'User greets the agent - ORC handles directly',
      input: {
        message: 'Hello! I want to start planning a new campaign.',
        session_context: {
          workflow_step: 1,
          workflow_gate: 0,
          session_type: 'Planning',
        },
      },
      expected: {
        target_agent: 'ORC',
        response_contains: ['welcome', 'campaign', 'planning'],
        confidence_minimum: 'HIGH',
      },
      tags: ['routing', 'orc', 'greeting'],
    },

    // Multi-agent scenarios
    {
      id: 'multi-agent-aud-cha',
      name: 'Multi-agent: Audience informs channel selection',
      description: 'Question spans AUD and CHA - should consult both',
      input: {
        message: 'What channels work best for reaching high-value customers?',
        session_context: {
          workflow_step: 5,
          workflow_gate: 2,
          session_type: 'Planning',
        },
      },
      expected: {
        target_agent: 'AUD', // First route to AUD
        response_contains: ['audience', 'channel', 'customer'],
        confidence_minimum: 'MEDIUM',
      },
      tags: ['routing', 'multi-agent', 'aud', 'cha'],
    },
  ];
}

// ============================================================================
// Mock Agent Caller (for testing without live endpoints)
// ============================================================================

/**
 * Mock implementation for calling the RouteToSpecialist flow
 * Replace with actual HTTP call in production
 */
export async function callRouteToSpecialist(
  message: string,
  sessionContext: Partial<SessionContext>
): Promise<MultiAgentTestResult> {
  // This is a mock - replace with actual API call
  const startTime = Date.now();

  // Simulate routing logic based on keywords
  let targetAgent: AgentCode = 'ORC';
  let requestType = 'HANDLE_DIRECTLY';

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('budget') || lowerMessage.includes('projection') || lowerMessage.includes('forecast') || lowerMessage.includes('scenario')) {
    targetAgent = 'ANL';
    requestType = lowerMessage.includes('scenario') ? 'RUN_SCENARIO' : 'CALCULATE_PROJECTION';
  } else if (lowerMessage.includes('audience') || lowerMessage.includes('target') || lowerMessage.includes('segment')) {
    targetAgent = 'AUD';
    requestType = 'RECOMMEND_TARGETING';
  } else if (lowerMessage.includes('channel') || lowerMessage.includes('media mix') || lowerMessage.includes('allocation')) {
    targetAgent = 'CHA';
    requestType = 'RECOMMEND_CHANNELS';
  } else if (lowerMessage.includes('fee') || lowerMessage.includes('supply path') || lowerMessage.includes('tech tax')) {
    targetAgent = 'SPO';
    requestType = 'ANALYZE_SUPPLY_PATH';
  } else if (lowerMessage.includes('document') || lowerMessage.includes('generate') || lowerMessage.includes('export')) {
    targetAgent = 'DOC';
    requestType = 'GENERATE_PLAN';
  } else if (lowerMessage.includes('performance') || lowerMessage.includes('anomal') || lowerMessage.includes('learning')) {
    targetAgent = 'PRF';
    requestType = 'ANALYZE_PERFORMANCE';
  }

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  return {
    routing_decision: {
      target_agent: targetAgent,
      request_type: requestType,
      confidence: 'HIGH',
      rationale: `Routed to ${targetAgent} based on intent analysis`,
    },
    response: {
      text: `[Mock response from ${targetAgent}] Processing your request about: ${message.substring(0, 50)}...`,
      confidence: 'MEDIUM',
      sources: ['AGENT_KB', 'CALCULATION'],
    },
    updated_plan_state: {},
    processing_time_ms: Date.now() - startTime,
  };
}

// ============================================================================
// Main Evaluation
// ============================================================================

export const multiAgentEval = Eval('multi-agent-mpa-v6', {
  data: loadMultiAgentDataset,
  task: async (input) => {
    return await callRouteToSpecialist(
      input.message,
      input.session_context as SessionContext
    );
  },
  scores: [
    routingAccuracyScorer,
    responseQualityScorer,
    planStateUpdateScorer,
    latencyScorer,
    routingConfidenceScorer,
  ],
});

// ============================================================================
// CLI Runner
// ============================================================================

async function runEvaluation() {
  console.log('Starting Multi-Agent Evaluation...');
  console.log('================================');

  const testCases = await loadMultiAgentDataset();
  console.log(`Loaded ${testCases.length} test cases`);

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\nRunning: ${testCase.name}`);
    console.log(`  Input: "${testCase.input.message.substring(0, 50)}..."`);

    try {
      const result = await callRouteToSpecialist(
        testCase.input.message,
        testCase.input.session_context as SessionContext
      );

      const routingCorrect = result.routing_decision.target_agent === testCase.expected.target_agent;

      if (routingCorrect) {
        console.log(`  ✓ Routed to ${result.routing_decision.target_agent} (correct)`);
        passed++;
      } else {
        console.log(`  ✗ Routed to ${result.routing_decision.target_agent} (expected ${testCase.expected.target_agent})`);
        failed++;
      }

      console.log(`  Processing time: ${result.processing_time_ms}ms`);
    } catch (error) {
      console.log(`  ✗ Error: ${error}`);
      failed++;
    }
  }

  console.log('\n================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%`);
}

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runEvaluation().catch(console.error);
}
