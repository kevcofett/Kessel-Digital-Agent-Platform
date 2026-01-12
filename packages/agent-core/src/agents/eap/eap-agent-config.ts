/**
 * EAP Agent Configuration
 * Enterprise AI Platform orchestrator configuration including feedback triggers
 */

import { AgentConfig, FeedbackTriggers } from '../types';

/**
 * Feedback trigger patterns for detecting user feedback in natural conversation
 */
export const eapFeedbackTriggers: FeedbackTriggers = {
  positive: [
    'helpful',
    'great',
    'perfect',
    'exactly what I needed',
    'thanks',
    'excellent',
    'good',
    'that works',
    'makes sense',
    'well done'
  ],
  negative: [
    'wrong',
    'not helpful',
    'incorrect',
    'bad',
    'useless',
    'that doesnt help',
    'not what I asked',
    'confusing',
    'unclear',
    'try again'
  ],
  correction: [
    'actually',
    'let me correct',
    'that should be',
    'no its',
    'I meant',
    'not quite'
  ]
};

/**
 * EAP Agent Configuration
 */
export const eapAgentConfig: AgentConfig = {
  id: 'eap',
  name: 'Enterprise AI Platform',
  version: '5.5.0',
  description: 'Orchestrator for routing requests to specialized agents (MPA, CA)',

  // Agent type code for Dataverse
  agentTypeCode: 100000002,

  // Feedback configuration
  feedbackTriggers: eapFeedbackTriggers,

  // Knowledge base configuration
  kb: {
    basePath: 'release/v5.5/agents/eap/base/kb',
    filePattern: '*.txt',
    categories: [
      'BENCHMARK',
      'ROUTING',
      'ORCHESTRATION'
    ]
  },

  // Routing configuration
  routing: {
    defaultAgent: null, // Requires explicit routing
    agents: {
      MPA: {
        triggers: [
          'media plan',
          'campaign',
          'advertising',
          'budget allocation',
          'channel mix',
          'CPM',
          'ROAS',
          'impression',
          'reach',
          'frequency'
        ],
        description: 'Media Planning Agent for campaign strategy'
      },
      CA: {
        triggers: [
          'research',
          'analysis',
          'consulting',
          'strategic',
          'competitor',
          'market',
          'trend',
          'recommendation',
          'advice'
        ],
        description: 'Consulting Agent for research and strategy'
      }
    }
  },

  // Pathways configuration (simplified for orchestrator)
  pathways: {
    EXPRESS: {
      description: 'Direct routing with minimal interaction',
      maxTurns: 5
    },
    GUIDED: {
      description: 'Guided routing with context gathering',
      maxTurns: 10
    },
    STANDARD: {
      description: 'Full orchestration with session management',
      maxTurns: 20
    }
  },

  // Self-critique configuration (lighter for orchestrator)
  selfCritique: {
    enabled: true,
    criteria: [
      'clear-routing',
      'context-preservation',
      'handoff-quality'
    ],
    minScoreThreshold: 0.80
  },

  // Success pattern storage
  successPatterns: {
    enabled: true,
    minCompositeScore: 0.95,
    scenarios: [
      'intent_classification',
      'agent_routing',
      'context_handoff',
      'session_management'
    ]
  }
};

export default eapAgentConfig;
