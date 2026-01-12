/**
 * MPA Agent Configuration
 * Media Planning Agent configuration including feedback triggers for self-learning
 */

import { AgentConfig, FeedbackTriggers } from '../types';

/**
 * Feedback trigger patterns for detecting user feedback in natural conversation
 */
export const mpaFeedbackTriggers: FeedbackTriggers = {
  positive: [
    'helpful',
    'great',
    'perfect',
    'exactly what I needed',
    'thanks',
    'excellent',
    'good answer',
    'that works',
    'makes sense',
    'clear explanation',
    'well done',
    'nice work'
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
    'doesnt make sense',
    'try again',
    'thats not right'
  ],
  correction: [
    'actually',
    'let me correct',
    'that should be',
    'no its',
    'I meant',
    'not quite',
    'close but',
    'the correct answer is',
    'what I really need is'
  ]
};

/**
 * MPA Agent Configuration
 */
export const mpaAgentConfig: AgentConfig = {
  id: 'mpa',
  name: 'Media Planning Agent',
  version: '5.5.0',
  description: 'AI-powered media planning assistant for campaign strategy and budget allocation',

  // Agent type code for Dataverse
  agentTypeCode: 100000000,

  // Feedback configuration
  feedbackTriggers: mpaFeedbackTriggers,

  // Knowledge base configuration
  kb: {
    basePath: 'release/v5.5/agents/mpa/base/kb',
    filePattern: '*.txt',
    categories: [
      'Step',
      'Channel',
      'Benchmark',
      'Geography',
      'Output',
      'Core'
    ]
  },

  // Pathways configuration
  pathways: {
    EXPRESS: {
      description: 'Fast-track planning with minimal questions',
      defaultSteps: [1, 2, 5, 7, 10],
      maxTurns: 15
    },
    GUIDED: {
      description: 'Step-by-step planning with guidance',
      defaultSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      maxTurns: 50
    },
    STANDARD: {
      description: 'Full planning with all options',
      defaultSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      maxTurns: 100
    }
  },

  // Self-critique configuration
  selfCritique: {
    enabled: true,
    criteria: [
      'source-citation',
      'acronym-definition',
      'response-length',
      'single-question',
      'calculation-display'
    ],
    minScoreThreshold: 0.85
  },

  // Success pattern storage
  successPatterns: {
    enabled: true,
    minCompositeScore: 0.95,
    scenarios: [
      'benchmark_query',
      'channel_recommendation',
      'budget_allocation',
      'geography_planning',
      'audience_sizing',
      'measurement_setup'
    ]
  }
};

export default mpaAgentConfig;
