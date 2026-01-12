/**
 * EAP Agent RAG Configuration
 *
 * Enterprise AI Platform Agent specific configuration for RAG system.
 * Defines synonyms, document patterns, and topic keywords for
 * enterprise AI/ML platform domain.
 */

import type { AgentRAGConfig } from '@kessel-digital/agent-core';
import type { DocumentPurpose } from '@kessel-digital/agent-core';

/**
 * EAP Agent RAG Configuration
 */
export const EAP_AGENT_CONFIG: AgentRAGConfig = {
  kbPath: '../kb',

  excludedFiles: [],

  deprioritizedFiles: [],

  synonymMappings: {
    // AI/ML terms
    'ai': ['artificial intelligence', 'machine learning', 'ml'],
    'ml': ['machine learning', 'ai', 'predictive'],
    'model': ['algorithm', 'neural network', 'classifier'],
    'training': ['fine-tuning', 'learning', 'optimization'],

    // Platform terms
    'platform': ['system', 'infrastructure', 'environment'],
    'integration': ['connection', 'api', 'connector'],
    'deployment': ['rollout', 'implementation', 'launch'],

    // Data terms
    'data': ['dataset', 'information', 'inputs'],
    'pipeline': ['workflow', 'process', 'etl'],
    'analytics': ['insights', 'reporting', 'metrics'],

    // Enterprise terms
    'enterprise': ['corporate', 'business', 'organization'],
    'scalability': ['scale', 'growth', 'expansion'],
    'governance': ['compliance', 'policy', 'security'],

    // Service terms
    'service': ['capability', 'feature', 'functionality'],
    'availability': ['uptime', 'reliability', 'sla'],
    'performance': ['speed', 'efficiency', 'optimization'],
  },

  documentTypePatterns: {
    behavioral: [/BEHAVIORAL/i, /Availability/i],
    benchmark: [/BENCHMARK/i, /KPIs/i],
    framework: [/FRAMEWORK/i, /Library/i],
    industry: [/INDUSTRY/i, /Vertical/i],
    reference: [/REFERENCE/i, /Routing/i],
    registry: [/REGISTRY/i, /Integrations/i],
    tools: [/TOOLS/i, /Methods/i],
  },

  documentPurposePatterns: {
    definitive: [/FRAMEWORK/i, /BENCHMARK/i],
    guidance: [/INDUSTRY/i, /BEHAVIORAL/i],
    reference: [/REFERENCE/i, /REGISTRY/i],
    procedural: [/TOOLS/i, /Methods/i],
    template: [],
    example: [],
  } as Record<DocumentPurpose, RegExp[]>,

  topicKeywords: {
    ai: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning'],
    platform: ['platform', 'infrastructure', 'system', 'architecture'],
    integration: ['integration', 'api', 'connector', 'interoperability'],
    data: ['data', 'pipeline', 'etl', 'analytics', 'warehouse'],
    enterprise: ['enterprise', 'corporate', 'governance', 'compliance', 'security'],
    performance: ['performance', 'scalability', 'reliability', 'sla'],
    consulting: ['consulting', 'methodology', 'framework', 'best practice'],
  },

  stepKeywords: {
    1: ['requirement', 'objective', 'use case', 'problem', 'scope'],
    2: ['assessment', 'analysis', 'discovery', 'current state'],
    3: ['design', 'architecture', 'solution', 'approach'],
    4: ['implementation', 'deployment', 'integration', 'configuration'],
    5: ['monitoring', 'optimization', 'measurement', 'iteration'],
  },

  verticalPatterns: [
    'retail', 'finance', 'healthcare', 'technology', 'manufacturing',
    'logistics', 'energy', 'telecom', 'media', 'government',
  ],

  metricPatterns: [
    'accuracy', 'precision', 'recall', 'f1 score', 'latency',
    'throughput', 'availability', 'uptime', 'error rate',
    'cost per prediction', 'model drift', 'inference time',
  ],
};

export default EAP_AGENT_CONFIG;
