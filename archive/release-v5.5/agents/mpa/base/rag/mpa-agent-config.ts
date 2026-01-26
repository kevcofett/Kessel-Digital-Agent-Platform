/**
 * MPA Agent RAG Configuration
 *
 * Media Planning Agent specific configuration for RAG system.
 * Defines synonyms, document patterns, and topic keywords for
 * media planning domain.
 */

import type { AgentRAGConfig } from '@kessel-digital/agent-core';
import type { DocumentPurpose } from '@kessel-digital/agent-core';

/**
 * MPA Agent RAG Configuration
 */
export const MPA_AGENT_CONFIG: AgentRAGConfig = {
  kbPath: '../kb',

  excludedFiles: [],

  deprioritizedFiles: [
    'MPA_Conversation_Examples_v5_5.txt',
    'Output_Templates_v5_5.txt',
  ],

  synonymMappings: {
    // Budget terms
    'budget': ['spend', 'investment', 'allocation', 'funding'],
    'spend': ['budget', 'investment', 'expenditure'],

    // Channel terms
    'ctv': ['connected tv', 'streaming tv', 'ott'],
    'ott': ['over-the-top', 'streaming', 'ctv'],
    'display': ['banner', 'programmatic display'],
    'social': ['paid social', 'social media', 'facebook', 'instagram', 'tiktok'],
    'search': ['sem', 'paid search', 'ppc'],
    'video': ['online video', 'olv', 'digital video'],

    // Measurement terms
    'roas': ['return on ad spend', 'return on advertising spend'],
    'cpm': ['cost per mille', 'cost per thousand'],
    'cpa': ['cost per acquisition', 'cost per action'],
    'ctr': ['click through rate', 'click-through rate'],
    'reach': ['audience reach', 'unique reach'],
    'frequency': ['ad frequency', 'impression frequency'],

    // Audience terms
    'audience': ['target audience', 'segment', 'cohort'],
    'targeting': ['audience targeting', 'segmentation'],
    'first-party': ['1p data', '1st party', 'first party data'],
    'third-party': ['3p data', '3rd party', 'third party data'],

    // Planning terms
    'mix': ['media mix', 'channel mix', 'allocation'],
    'optimization': ['optimize', 'optimizing', 'improvement'],
    'benchmark': ['benchmarks', 'industry standard', 'kpi target'],
  },

  documentTypePatterns: {
    framework: [/Framework/i, /Expert_Lens/i],
    guidance: [/Implications/i, /Guidance/i, /Strategy/i],
    reference: [/Reference/i, /Analytics/i, /Playbook/i],
    standards: [/Standards/i, /KB_00/i],
    template: [/Template/i, /Output/i],
    example: [/Example/i, /Conversation/i],
  },

  documentPurposePatterns: {
    definitive: [/Framework/i, /Expert_Lens/i, /KB_00/i],
    guidance: [/Implications/i, /Strategy/i, /Guidance/i],
    reference: [/Analytics/i, /Playbook/i, /RETAIL_MEDIA/i],
    procedural: [/Step_Boundary/i, /Calculation/i],
    template: [/Template/i, /Output_Templates/i],
    example: [/Example/i, /Conversation/i],
  } as Record<DocumentPurpose, RegExp[]>,

  topicKeywords: {
    budget: ['budget', 'spend', 'investment', 'allocation', 'funding', 'cost'],
    channels: ['channel', 'media', 'ctv', 'display', 'social', 'search', 'video', 'audio', 'ooh'],
    measurement: ['measurement', 'attribution', 'roas', 'roi', 'kpi', 'metric', 'analytics'],
    audience: ['audience', 'targeting', 'segment', 'demographic', 'cohort', 'reach'],
    planning: ['plan', 'strategy', 'mix', 'optimization', 'allocation'],
    benchmarks: ['benchmark', 'standard', 'performance', 'target', 'goal'],
    retail: ['retail', 'rmn', 'retail media', 'commerce'],
    geography: ['dma', 'geo', 'geography', 'regional', 'market'],
  },

  stepKeywords: {
    1: ['objective', 'goal', 'kpi', 'success metric', 'business objective'],
    2: ['audience', 'target', 'segment', 'demographic', 'who'],
    3: ['channel', 'media', 'mix', 'platform', 'where'],
    4: ['budget', 'spend', 'allocation', 'investment', 'how much'],
    5: ['measurement', 'attribution', 'tracking', 'analytics', 'how measure'],
  },

  verticalPatterns: [
    'retail', 'cpg', 'automotive', 'finance', 'healthcare',
    'technology', 'travel', 'entertainment', 'b2b', 'telecom',
    'qsr', 'restaurant', 'beverage', 'apparel', 'beauty',
  ],

  metricPatterns: [
    'cpm', 'cpc', 'cpa', 'ctr', 'roas', 'roi', 'reach',
    'frequency', 'impressions', 'clicks', 'conversions',
    'viewability', 'completion rate', 'engagement rate',
  ],
};

export default MPA_AGENT_CONFIG;
