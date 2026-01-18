/**
 * Cross-Agent Routing Test Scenarios
 *
 * Comprehensive test scenarios for validating multi-agent routing behavior,
 * including single-agent routing, multi-agent chains, error handling, and
 * edge cases.
 *
 * @module cross-agent-routing
 * @version 1.0.0
 */

import { AgentCode, AGENT_CODES } from '../../../packages/agent-core/src/multi-agent/types/agent-codes.js';

/**
 * Test scenario interface for routing tests
 */
export interface RoutingTestScenario {
  id: string;
  name: string;
  description: string;
  category: RoutingTestCategory;
  input: RoutingTestInput;
  expected: RoutingTestExpectation;
  tags: string[];
}

export type RoutingTestCategory =
  | 'single_agent'
  | 'multi_agent_chain'
  | 'parallel_routing'
  | 'error_handling'
  | 'edge_case'
  | 'performance'
  | 'state_management';

export interface RoutingTestInput {
  userMessage: string;
  sessionContext?: Partial<SessionContextForTest>;
  featureFlags?: Record<string, boolean>;
}

export interface SessionContextForTest {
  sessionId: string;
  currentStep: number;
  currentGate: number;
  hasExistingPlan: boolean;
  planState: Record<string, unknown>;
}

export interface RoutingTestExpectation {
  primaryAgent: AgentCode;
  secondaryAgents?: AgentCode[];
  expectedCapabilities: string[];
  expectedPlanStateUpdates?: string[];
  minConfidence: number;
  maxLatencyMs?: number;
  errorExpected?: boolean;
  errorCode?: string;
}

/**
 * Single Agent Routing Scenarios
 * Tests routing to individual specialist agents
 */
export const singleAgentScenarios: RoutingTestScenario[] = [
  // ANL (Analytics & Forecasting) Scenarios
  {
    id: 'anl-projection-basic',
    name: 'Basic Budget Projection Request',
    description: 'User requests media performance projection for a specific budget',
    category: 'single_agent',
    input: {
      userMessage: 'What kind of results can I expect with a $500,000 media budget over 12 weeks?',
      sessionContext: {
        currentStep: 3,
        currentGate: 1,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.ANL,
      expectedCapabilities: ['CalculateProjection'],
      expectedPlanStateUpdates: ['projections'],
      minConfidence: 0.85,
      maxLatencyMs: 3000,
    },
    tags: ['anl', 'projection', 'budget'],
  },
  {
    id: 'anl-scenario-comparison',
    name: 'Scenario Comparison Request',
    description: 'User wants to compare multiple budget scenarios',
    category: 'single_agent',
    input: {
      userMessage: 'Compare a conservative $300K budget versus an aggressive $750K spend. Which gives better ROI?',
      sessionContext: {
        currentStep: 4,
        currentGate: 1,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.ANL,
      expectedCapabilities: ['RunScenario'],
      expectedPlanStateUpdates: ['scenario_analysis'],
      minConfidence: 0.80,
      maxLatencyMs: 5000,
    },
    tags: ['anl', 'scenario', 'comparison'],
  },
  {
    id: 'anl-diminishing-returns',
    name: 'Diminishing Returns Analysis',
    description: 'User asks about efficiency at different budget levels',
    category: 'single_agent',
    input: {
      userMessage: 'At what budget level do we start seeing diminishing returns?',
      sessionContext: {
        currentStep: 4,
        currentGate: 1,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.ANL,
      expectedCapabilities: ['RunScenario', 'CalculateProjection'],
      minConfidence: 0.75,
    },
    tags: ['anl', 'efficiency', 'diminishing-returns'],
  },

  // AUD (Audience Intelligence) Scenarios
  {
    id: 'aud-segmentation-rfm',
    name: 'RFM Audience Segmentation',
    description: 'User requests RFM-based audience segmentation',
    category: 'single_agent',
    input: {
      userMessage: 'Segment our customer base using RFM analysis to identify our best customers',
      sessionContext: {
        currentStep: 2,
        currentGate: 0,
        hasExistingPlan: false,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.AUD,
      expectedCapabilities: ['SegmentAudience'],
      expectedPlanStateUpdates: ['audience.primary_segments', 'audience.segmentation_method'],
      minConfidence: 0.90,
      maxLatencyMs: 4000,
    },
    tags: ['aud', 'segmentation', 'rfm'],
  },
  {
    id: 'aud-ltv-calculation',
    name: 'Customer LTV Calculation',
    description: 'User requests lifetime value calculation for audience segments',
    category: 'single_agent',
    input: {
      userMessage: 'Calculate the lifetime value of our top customer segments',
      sessionContext: {
        currentStep: 2,
        currentGate: 0,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.AUD,
      expectedCapabilities: ['CalculateLTV'],
      expectedPlanStateUpdates: ['audience.segment_ltv'],
      minConfidence: 0.85,
      maxLatencyMs: 3500,
    },
    tags: ['aud', 'ltv', 'customer-value'],
  },
  {
    id: 'aud-behavioral-segments',
    name: 'Behavioral Audience Segments',
    description: 'User wants behavior-based audience clustering',
    category: 'single_agent',
    input: {
      userMessage: 'Create audience segments based on shopping behavior patterns',
      sessionContext: {
        currentStep: 2,
        currentGate: 0,
        hasExistingPlan: false,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.AUD,
      expectedCapabilities: ['SegmentAudience'],
      minConfidence: 0.85,
    },
    tags: ['aud', 'behavioral', 'clustering'],
  },

  // CHA (Channel Strategy) Scenarios
  {
    id: 'cha-allocation-balanced',
    name: 'Balanced Channel Allocation',
    description: 'User requests budget allocation across channels',
    category: 'single_agent',
    input: {
      userMessage: 'Allocate our $500K budget across Meta, Google Search, YouTube, and TikTok',
      sessionContext: {
        currentStep: 5,
        currentGate: 2,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.CHA,
      expectedCapabilities: ['CalculateAllocation'],
      expectedPlanStateUpdates: ['channels.allocations'],
      minConfidence: 0.90,
      maxLatencyMs: 3000,
    },
    tags: ['cha', 'allocation', 'multi-channel'],
  },
  {
    id: 'cha-benchmark-lookup',
    name: 'Channel Benchmark Lookup',
    description: 'User requests performance benchmarks for channels',
    category: 'single_agent',
    input: {
      userMessage: 'What are the typical CPM and conversion rates for Meta and Google Search in e-commerce?',
      sessionContext: {
        currentStep: 3,
        currentGate: 1,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.CHA,
      expectedCapabilities: ['LookupBenchmarks'],
      minConfidence: 0.85,
      maxLatencyMs: 2000,
    },
    tags: ['cha', 'benchmarks', 'industry'],
  },
  {
    id: 'cha-conversion-optimization',
    name: 'Conversion-Focused Allocation',
    description: 'User wants channel mix optimized for conversions',
    category: 'single_agent',
    input: {
      userMessage: 'Optimize our channel mix for maximum conversions, not reach',
      sessionContext: {
        currentStep: 5,
        currentGate: 2,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.CHA,
      expectedCapabilities: ['CalculateAllocation'],
      minConfidence: 0.85,
    },
    tags: ['cha', 'optimization', 'conversions'],
  },
];

/**
 * Multi-Agent Chain Scenarios
 * Tests routing that requires multiple agents in sequence
 */
export const multiAgentChainScenarios: RoutingTestScenario[] = [
  {
    id: 'chain-audience-to-projection',
    name: 'Audience Segmentation to Projection Chain',
    description: 'User request requires audience work then projection calculation',
    category: 'multi_agent_chain',
    input: {
      userMessage: 'Identify our best customer segments and project results if we target them with a $400K campaign',
      sessionContext: {
        currentStep: 2,
        currentGate: 0,
        hasExistingPlan: false,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.AUD,
      secondaryAgents: [AGENT_CODES.ANL],
      expectedCapabilities: ['SegmentAudience', 'CalculateProjection'],
      expectedPlanStateUpdates: ['audience.primary_segments', 'projections'],
      minConfidence: 0.75,
      maxLatencyMs: 8000,
    },
    tags: ['chain', 'aud-anl', 'complex'],
  },
  {
    id: 'chain-benchmark-to-allocation',
    name: 'Benchmark to Allocation Chain',
    description: 'User needs benchmarks to inform allocation decision',
    category: 'multi_agent_chain',
    input: {
      userMessage: 'Look up current benchmarks for social channels and recommend an optimal allocation for our $600K budget',
      sessionContext: {
        currentStep: 4,
        currentGate: 1,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.CHA,
      expectedCapabilities: ['LookupBenchmarks', 'CalculateAllocation'],
      expectedPlanStateUpdates: ['channels.allocations'],
      minConfidence: 0.80,
      maxLatencyMs: 6000,
    },
    tags: ['chain', 'cha-internal', 'sequential'],
  },
  {
    id: 'chain-allocation-to-scenario',
    name: 'Allocation to Scenario Analysis Chain',
    description: 'User wants allocation options compared via scenarios',
    category: 'multi_agent_chain',
    input: {
      userMessage: 'Create three different channel allocations and compare their projected performance',
      sessionContext: {
        currentStep: 5,
        currentGate: 2,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.CHA,
      secondaryAgents: [AGENT_CODES.ANL],
      expectedCapabilities: ['CalculateAllocation', 'RunScenario'],
      minConfidence: 0.75,
      maxLatencyMs: 10000,
    },
    tags: ['chain', 'cha-anl', 'scenario-planning'],
  },
  {
    id: 'chain-full-planning',
    name: 'Complete Media Plan Chain',
    description: 'User requests end-to-end media planning',
    category: 'multi_agent_chain',
    input: {
      userMessage: 'Build a complete media plan: segment our audience, allocate $500K across channels, and project results',
      sessionContext: {
        currentStep: 1,
        currentGate: 0,
        hasExistingPlan: false,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.AUD,
      secondaryAgents: [AGENT_CODES.CHA, AGENT_CODES.ANL],
      expectedCapabilities: ['SegmentAudience', 'CalculateAllocation', 'CalculateProjection'],
      expectedPlanStateUpdates: ['audience', 'channels', 'projections'],
      minConfidence: 0.70,
      maxLatencyMs: 15000,
    },
    tags: ['chain', 'full-workflow', 'complex'],
  },
];

/**
 * Parallel Routing Scenarios
 * Tests when multiple agents can be called simultaneously
 */
export const parallelRoutingScenarios: RoutingTestScenario[] = [
  {
    id: 'parallel-benchmark-ltv',
    name: 'Parallel Benchmark and LTV',
    description: 'Independent requests that can run in parallel',
    category: 'parallel_routing',
    input: {
      userMessage: 'Get me the latest benchmarks for our channels AND calculate LTV for our customer segments',
      sessionContext: {
        currentStep: 3,
        currentGate: 1,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.CHA,
      secondaryAgents: [AGENT_CODES.AUD],
      expectedCapabilities: ['LookupBenchmarks', 'CalculateLTV'],
      minConfidence: 0.80,
      maxLatencyMs: 5000, // Should be fast due to parallelism
    },
    tags: ['parallel', 'cha-aud', 'performance'],
  },
  {
    id: 'parallel-multi-projection',
    name: 'Parallel Budget Projections',
    description: 'Multiple projection calculations that can run in parallel',
    category: 'parallel_routing',
    input: {
      userMessage: 'Calculate projections for both our awareness campaign and conversion campaign simultaneously',
      sessionContext: {
        currentStep: 4,
        currentGate: 1,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.ANL,
      expectedCapabilities: ['CalculateProjection'],
      minConfidence: 0.80,
      maxLatencyMs: 4000,
    },
    tags: ['parallel', 'anl', 'multiple-calcs'],
  },
];

/**
 * Error Handling Scenarios
 * Tests graceful degradation and error recovery
 */
export const errorHandlingScenarios: RoutingTestScenario[] = [
  {
    id: 'error-missing-budget',
    name: 'Missing Required Budget Parameter',
    description: 'Request requires budget but none provided in context',
    category: 'error_handling',
    input: {
      userMessage: 'Calculate our media projections',
      sessionContext: {
        currentStep: 3,
        currentGate: 1,
        hasExistingPlan: false,
        planState: {}, // No budget set
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.ANL,
      expectedCapabilities: [],
      minConfidence: 0.60,
      errorExpected: true,
      errorCode: 'MISSING_REQUIRED_PARAMETER',
    },
    tags: ['error', 'validation', 'missing-param'],
  },
  {
    id: 'error-invalid-agent',
    name: 'Request for Non-Existent Capability',
    description: 'User asks for something no agent can do',
    category: 'error_handling',
    input: {
      userMessage: 'Book the media directly with the publishers',
      sessionContext: {
        currentStep: 6,
        currentGate: 3,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.ORC, // Falls back to orchestrator
      expectedCapabilities: [],
      minConfidence: 0.40,
      errorExpected: true,
      errorCode: 'CAPABILITY_NOT_AVAILABLE',
    },
    tags: ['error', 'capability', 'fallback'],
  },
  {
    id: 'error-circular-dependency',
    name: 'Circular Agent Dependency Detection',
    description: 'Request that could cause circular routing',
    category: 'error_handling',
    input: {
      userMessage: 'Recalculate allocation based on projections that use the allocation',
      sessionContext: {
        currentStep: 5,
        currentGate: 2,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.ORC,
      expectedCapabilities: [],
      minConfidence: 0.50,
      errorExpected: false, // Should break the cycle intelligently
    },
    tags: ['error', 'circular', 'dependency'],
  },
  {
    id: 'error-timeout-recovery',
    name: 'Agent Timeout Recovery',
    description: 'Test recovery when an agent times out',
    category: 'error_handling',
    input: {
      userMessage: 'Run a complex scenario analysis with 10 variations',
      sessionContext: {
        currentStep: 4,
        currentGate: 1,
        hasExistingPlan: true,
      },
      featureFlags: {
        'simulate_timeout': true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.ANL,
      expectedCapabilities: ['RunScenario'],
      minConfidence: 0.70,
      errorExpected: true,
      errorCode: 'AGENT_TIMEOUT',
    },
    tags: ['error', 'timeout', 'recovery'],
  },
];

/**
 * Edge Case Scenarios
 * Tests boundary conditions and unusual situations
 */
export const edgeCaseScenarios: RoutingTestScenario[] = [
  {
    id: 'edge-ambiguous-routing',
    name: 'Ambiguous Agent Selection',
    description: 'Request that could reasonably go to multiple agents',
    category: 'edge_case',
    input: {
      userMessage: 'What\'s the best way to reach millennials?',
      sessionContext: {
        currentStep: 2,
        currentGate: 0,
        hasExistingPlan: false,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.AUD, // Should prefer audience for targeting
      secondaryAgents: [AGENT_CODES.CHA], // Channel might also be relevant
      expectedCapabilities: ['SegmentAudience'],
      minConfidence: 0.65, // Lower confidence due to ambiguity
    },
    tags: ['edge', 'ambiguous', 'routing-decision'],
  },
  {
    id: 'edge-step-zero',
    name: 'Request at Workflow Step Zero',
    description: 'Request before any planning has begun',
    category: 'edge_case',
    input: {
      userMessage: 'Help me create a media plan',
      sessionContext: {
        currentStep: 0,
        currentGate: 0,
        hasExistingPlan: false,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.ORC,
      expectedCapabilities: [],
      minConfidence: 0.80,
    },
    tags: ['edge', 'initialization', 'step-zero'],
  },
  {
    id: 'edge-late-stage-change',
    name: 'Major Change at Late Stage',
    description: 'Request to change fundamental decision late in workflow',
    category: 'edge_case',
    input: {
      userMessage: 'Actually, let\'s completely change our target audience',
      sessionContext: {
        currentStep: 8,
        currentGate: 4,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.AUD,
      expectedCapabilities: ['SegmentAudience'],
      minConfidence: 0.75,
    },
    tags: ['edge', 'late-change', 'backtrack'],
  },
  {
    id: 'edge-minimal-input',
    name: 'Minimal User Input',
    description: 'Very short, ambiguous user message',
    category: 'edge_case',
    input: {
      userMessage: 'Budget?',
      sessionContext: {
        currentStep: 3,
        currentGate: 1,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.ORC,
      expectedCapabilities: [],
      minConfidence: 0.40,
    },
    tags: ['edge', 'minimal', 'clarification-needed'],
  },
  {
    id: 'edge-multiple-questions',
    name: 'Multiple Unrelated Questions',
    description: 'User asks several different things at once',
    category: 'edge_case',
    input: {
      userMessage: 'What\'s the LTV of our customers? Also what benchmarks should we use? And can you project Q3 performance?',
      sessionContext: {
        currentStep: 3,
        currentGate: 1,
        hasExistingPlan: true,
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.AUD,
      secondaryAgents: [AGENT_CODES.CHA, AGENT_CODES.ANL],
      expectedCapabilities: ['CalculateLTV', 'LookupBenchmarks', 'CalculateProjection'],
      minConfidence: 0.70,
    },
    tags: ['edge', 'multi-question', 'complex'],
  },
];

/**
 * State Management Scenarios
 * Tests session state tracking and updates
 */
export const stateManagementScenarios: RoutingTestScenario[] = [
  {
    id: 'state-incremental-update',
    name: 'Incremental Plan State Update',
    description: 'Agent should update only relevant portions of state',
    category: 'state_management',
    input: {
      userMessage: 'Set our target audience to young professionals aged 25-34',
      sessionContext: {
        currentStep: 2,
        currentGate: 0,
        hasExistingPlan: true,
        planState: {
          budget: 500000,
          objectives: { primary: 'conversions' },
        },
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.AUD,
      expectedCapabilities: ['SegmentAudience'],
      expectedPlanStateUpdates: ['audience.primary_segments'],
      minConfidence: 0.85,
    },
    tags: ['state', 'incremental', 'partial-update'],
  },
  {
    id: 'state-step-advancement',
    name: 'Workflow Step Advancement',
    description: 'Completing a task should advance workflow step',
    category: 'state_management',
    input: {
      userMessage: 'Finalize the audience targeting we discussed',
      sessionContext: {
        currentStep: 2,
        currentGate: 0,
        hasExistingPlan: true,
        planState: {
          audience: { pending_selection: true },
        },
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.AUD,
      expectedCapabilities: ['SegmentAudience'],
      expectedPlanStateUpdates: ['audience', 'currentStep'],
      minConfidence: 0.80,
    },
    tags: ['state', 'step', 'advancement'],
  },
  {
    id: 'state-gate-transition',
    name: 'Workflow Gate Transition',
    description: 'Completing gate requirements should advance gate',
    category: 'state_management',
    input: {
      userMessage: 'I approve the strategy outlined - let\'s move forward',
      sessionContext: {
        currentStep: 4,
        currentGate: 1,
        hasExistingPlan: true,
        planState: {
          audience: { finalized: true },
          channels: { allocations: [] },
          awaiting_approval: true,
        },
      },
    },
    expected: {
      primaryAgent: AGENT_CODES.ORC,
      expectedPlanStateUpdates: ['currentGate', 'awaiting_approval'],
      minConfidence: 0.85,
    },
    tags: ['state', 'gate', 'approval'],
  },
];

/**
 * All test scenarios combined
 */
export const allRoutingTestScenarios: RoutingTestScenario[] = [
  ...singleAgentScenarios,
  ...multiAgentChainScenarios,
  ...parallelRoutingScenarios,
  ...errorHandlingScenarios,
  ...edgeCaseScenarios,
  ...stateManagementScenarios,
];

/**
 * Get scenarios by category
 */
export function getScenariosByCategory(category: RoutingTestCategory): RoutingTestScenario[] {
  return allRoutingTestScenarios.filter(s => s.category === category);
}

/**
 * Get scenarios by tag
 */
export function getScenariosByTag(tag: string): RoutingTestScenario[] {
  return allRoutingTestScenarios.filter(s => s.tags.includes(tag));
}

/**
 * Get scenarios by primary agent
 */
export function getScenariosByAgent(agent: AgentCode): RoutingTestScenario[] {
  return allRoutingTestScenarios.filter(s => s.expected.primaryAgent === agent);
}

/**
 * Get high-confidence scenarios for smoke testing
 */
export function getSmokeTestScenarios(): RoutingTestScenario[] {
  return allRoutingTestScenarios.filter(s => s.expected.minConfidence >= 0.85);
}

/**
 * Scenario statistics
 */
export const scenarioStats = {
  total: allRoutingTestScenarios.length,
  byCategory: {
    single_agent: singleAgentScenarios.length,
    multi_agent_chain: multiAgentChainScenarios.length,
    parallel_routing: parallelRoutingScenarios.length,
    error_handling: errorHandlingScenarios.length,
    edge_case: edgeCaseScenarios.length,
    state_management: stateManagementScenarios.length,
  },
  byAgent: {
    ANL: getScenariosByAgent(AGENT_CODES.ANL).length,
    AUD: getScenariosByAgent(AGENT_CODES.AUD).length,
    CHA: getScenariosByAgent(AGENT_CODES.CHA).length,
    ORC: getScenariosByAgent(AGENT_CODES.ORC).length,
  },
};
