/**
 * CA Agent RAG Configuration
 *
 * Consulting Agent specific configuration for RAG system.
 * Defines synonyms, document patterns, and topic keywords for
 * consulting and strategic frameworks domain.
 */

import type { AgentRAGConfig } from '@kessel-digital/agent-core';
import type { DocumentPurpose } from '@kessel-digital/agent-core';

/**
 * CA Agent RAG Configuration
 */
export const CA_AGENT_CONFIG: AgentRAGConfig = {
  kbPath: '../kb',

  excludedFiles: [],

  deprioritizedFiles: [
    'ANALYSIS_PROGRESS_FORMAT_v1.txt',
    'OUTPUT_SANITIZATION_RULES_v1.txt',
  ],

  synonymMappings: {
    // Framework terms
    'framework': ['model', 'methodology', 'approach', 'structure'],
    'analysis': ['assessment', 'evaluation', 'review', 'examination'],
    'strategy': ['strategic plan', 'approach', 'roadmap'],

    // Consulting terms
    'consulting': ['advisory', 'professional services'],
    'deliverable': ['output', 'artifact', 'document'],
    'stakeholder': ['client', 'sponsor', 'decision maker'],

    // Industry terms
    'industry': ['vertical', 'sector', 'market'],
    'competitive': ['competition', 'competitor', 'market position'],
    'benchmark': ['best practice', 'industry standard', 'comparison'],

    // Data terms
    'data': ['information', 'insights', 'analytics'],
    'source': ['reference', 'citation', 'origin'],
    'research': ['study', 'investigation', 'analysis'],

    // Technology terms
    'martech': ['marketing technology', 'marketing stack'],
    'cdp': ['customer data platform', 'data platform'],
    'dsp': ['demand side platform', 'programmatic'],
    'ssp': ['supply side platform', 'publisher platform'],
    'rmn': ['retail media network', 'retail media'],

    // Measurement terms
    'kpi': ['key performance indicator', 'metric', 'measure'],
    'roi': ['return on investment', 'returns'],
    'attribution': ['measurement', 'tracking', 'credit'],
  },

  documentTypePatterns: {
    framework: [/FRAMEWORK/i, /Library/i, /Tools/i],
    behavioral: [/BEHAVIORAL/i, /Service/i, /Routing/i],
    reference: [/REFERENCE/i, /Glossary/i],
    registry: [/REGISTRY/i, /URLs/i, /Benchmarks/i],
    industry: [/INDUSTRY/i, /Expertise/i],
    quality: [/QUALITY/i, /CONFIDENCE/i, /CONSISTENCY/i],
    custom: [/CUSTOM/i, /COMPARISON/i],
  },

  documentPurposePatterns: {
    definitive: [/FRAMEWORK_Library/i, /INDUSTRY_Expertise/i],
    guidance: [/BEHAVIORAL/i, /CUSTOM_FRAMEWORK/i, /COMPARISON/i],
    reference: [/REFERENCE/i, /REGISTRY/i, /Glossary/i],
    procedural: [/QUALITY/i, /CONFIDENCE/i, /CONSISTENCY/i, /SANITIZATION/i],
    template: [/FORMAT/i, /OUTPUT/i],
    example: [],
  } as Record<DocumentPurpose, RegExp[]>,

  topicKeywords: {
    frameworks: ['framework', 'model', 'methodology', 'porter', 'swot', 'pestle', 'bcg'],
    consulting: ['consulting', 'advisory', 'strategy', 'recommendation', 'analysis'],
    industry: ['industry', 'vertical', 'sector', 'market', 'competitive'],
    technology: ['martech', 'cdp', 'dsp', 'ssp', 'identity', 'clean room'],
    data: ['data', 'source', 'research', 'benchmark', 'citation'],
    retail: ['retail', 'rmn', 'commerce', 'grocery', 'mass'],
    media: ['media', 'advertising', 'programmatic', 'ctv', 'display'],
    measurement: ['kpi', 'metric', 'roi', 'attribution', 'performance'],
  },

  stepKeywords: {
    1: ['problem', 'challenge', 'opportunity', 'objective', 'scope'],
    2: ['research', 'data', 'analysis', 'discovery', 'assessment'],
    3: ['framework', 'model', 'approach', 'methodology', 'structure'],
    4: ['recommendation', 'solution', 'strategy', 'action', 'plan'],
    5: ['implementation', 'execution', 'measurement', 'tracking', 'results'],
  },

  verticalPatterns: [
    'retail', 'cpg', 'automotive', 'finance', 'healthcare',
    'technology', 'travel', 'entertainment', 'b2b', 'telecom',
    'qsr', 'restaurant', 'beverage', 'apparel', 'beauty',
    'grocery', 'mass retail', 'specialty retail',
  ],

  metricPatterns: [
    'roi', 'roas', 'cpm', 'cpc', 'cpa', 'ltv', 'cac',
    'market share', 'growth rate', 'conversion rate',
    'customer acquisition', 'retention rate', 'churn',
  ],
};

export default CA_AGENT_CONFIG;
