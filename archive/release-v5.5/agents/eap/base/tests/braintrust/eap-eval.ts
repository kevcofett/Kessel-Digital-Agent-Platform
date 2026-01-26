/**
 * EAP Agent Braintrust Evaluation Runner
 *
 * Evaluates the Enterprise AI Platform agent's RAG retrieval quality
 * and response generation capabilities.
 */

import { Eval } from 'braintrust';
import { EAP_AGENT_CONFIG, detectEAPTopic, expandEAPQuery } from './eap-agent-config.js';

// ============================================================================
// EVALUATION DATASET
// ============================================================================

interface EAPTestCase {
  input: string;
  expectedTopic: string;
  expectedDocTypes: string[];
  description: string;
}

const EAP_TEST_CASES: EAPTestCase[] = [
  {
    input: 'How do I set up a RAG system with vector database?',
    expectedTopic: 'data',
    expectedDocTypes: ['architecture', 'best-practice'],
    description: 'RAG architecture query',
  },
  {
    input: 'What are the best practices for LLM security?',
    expectedTopic: 'security',
    expectedDocTypes: ['security', 'best-practice'],
    description: 'LLM security query',
  },
  {
    input: 'How do I monitor model latency in production?',
    expectedTopic: 'ml-ops',
    expectedDocTypes: ['operations', 'best-practice'],
    description: 'MLOps monitoring query',
  },
  {
    input: 'What integrations are available for the platform?',
    expectedTopic: 'integration',
    expectedDocTypes: ['registry', 'integration'],
    description: 'Integration availability query',
  },
  {
    input: 'How should I handle API authentication?',
    expectedTopic: 'security',
    expectedDocTypes: ['security', 'integration'],
    description: 'API security query',
  },
  {
    input: 'What are typical token costs for GPT-4?',
    expectedTopic: 'general',
    expectedDocTypes: ['reference', 'best-practice'],
    description: 'Cost estimation query',
  },
  {
    input: 'How do I implement guardrails for content moderation?',
    expectedTopic: 'governance',
    expectedDocTypes: ['governance', 'security'],
    description: 'Guardrails implementation query',
  },
];

// ============================================================================
// SCORERS
// ============================================================================

/**
 * Score topic detection accuracy
 */
function scoreTopicDetection(input: string, expected: string): number {
  const detected = detectEAPTopic(input);
  return detected === expected ? 1.0 : 0.0;
}

/**
 * Score query expansion quality
 */
function scoreQueryExpansion(input: string): number {
  const expansions = expandEAPQuery(input);
  const expansionCount = Math.min(expansions.length, 10);
  return expansionCount / 10;
}

/**
 * Score based on config validity
 */
function scoreConfigValidity(): number {
  const config = EAP_AGENT_CONFIG;
  let score = 0;

  if (config.kbPath) score += 0.25;
  if (Object.keys(config.synonymMappings || {}).length > 10) score += 0.25;
  if (config.verticalPatterns.length > 5) score += 0.25;
  if (config.metricPatterns.length > 5) score += 0.25;

  return score;
}

// ============================================================================
// MAIN EVALUATION
// ============================================================================

Eval('eap-agent-rag', {
  experimentName: 'eap-rag-baseline',

  data: () => EAP_TEST_CASES.map(tc => ({
    input: tc.input,
    expected: {
      topic: tc.expectedTopic,
      docTypes: tc.expectedDocTypes,
    },
    metadata: {
      description: tc.description,
    },
  })),

  task: async (input: string) => {
    const topic = detectEAPTopic(input);
    const expansions = expandEAPQuery(input);

    return {
      topic,
      expansions,
      expansionCount: expansions.length,
      configValid: scoreConfigValidity() === 1.0,
    };
  },

  scores: [
    (args) => ({
      name: 'topic_detection',
      score: scoreTopicDetection(args.input, args.expected.topic),
    }),
    (args) => ({
      name: 'query_expansion',
      score: scoreQueryExpansion(args.input),
    }),
    () => ({
      name: 'config_validity',
      score: scoreConfigValidity(),
    }),
  ],
});

export { EAP_TEST_CASES };
