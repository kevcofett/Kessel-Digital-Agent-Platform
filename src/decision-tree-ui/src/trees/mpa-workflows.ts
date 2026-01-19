/**
 * MPA Workflow Decision Trees
 * Pre-built trees for Media Planning Agent workflows
 */

import type { DecisionTree } from '../types';
import { createNode, createEdge, createOption, createValidationRule, autoLayout } from '../utils/treeBuilder';

/**
 * EXPRESS Pathway - Streamlined brief creation
 */
export const EXPRESS_PATHWAY: DecisionTree = (() => {
  const nodes = [
    createNode('start', 'Start EXPRESS', { id: 'start', data: { agent: 'ORC' } }),
    createNode('decision', 'Has Template?', {
      id: 'has_template',
      data: {
        options: [
          createOption('Yes, use existing', 'template_select', { isDefault: true }),
          createOption('No, quick build', 'quick_builder'),
        ],
      },
    }),
    createNode('action', 'Select Template', {
      id: 'template_select',
      data: { agent: 'DOC', capability: 'DOC_TEMPLATE_SELECT', timeEstimate: 2 },
    }),
    createNode('action', 'Quick Builder', {
      id: 'quick_builder',
      data: { agent: 'ORC', capability: 'EXPRESS_BUILD', timeEstimate: 5 },
    }),
    createNode('merge', 'Merge', { id: 'merge1' }),
    createNode('action', 'Set Objective', {
      id: 'objective',
      data: { agent: 'ANL', capability: 'ANL_OBJECTIVE', timeEstimate: 3 },
    }),
    createNode('action', 'Define Audience', {
      id: 'audience',
      data: { agent: 'AUD', capability: 'AUD_SEGMENT', timeEstimate: 3 },
    }),
    createNode('action', 'Channel Mix', {
      id: 'channel',
      data: { agent: 'CHA', capability: 'CHA_CHANNEL_MIX', timeEstimate: 2 },
    }),
    createNode('gate', 'Minimum Check', {
      id: 'min_gate',
      data: {
        validationRules: [
          createValidationRule('objective', 'exists', true, 'Objective must be defined'),
          createValidationRule('audience', 'exists', true, 'Audience must be selected'),
          createValidationRule('budget', 'greaterThan', 0, 'Budget must be greater than 0'),
        ],
      },
    }),
    createNode('action', 'Generate Brief', {
      id: 'generate',
      data: { agent: 'DOC', capability: 'DOC_GENERATE', timeEstimate: 2 },
    }),
    createNode('end', 'Complete', { id: 'end' }),
  ];

  const edges = [
    createEdge('start', 'has_template'),
    createEdge('has_template', 'template_select', { data: { condition: 'Yes, use existing' } }),
    createEdge('has_template', 'quick_builder', { data: { condition: 'No, quick build' } }),
    createEdge('template_select', 'merge1'),
    createEdge('quick_builder', 'merge1'),
    createEdge('merge1', 'objective'),
    createEdge('objective', 'audience'),
    createEdge('audience', 'channel'),
    createEdge('channel', 'min_gate'),
    createEdge('min_gate', 'generate'),
    createEdge('generate', 'end'),
  ];

  return {
    id: 'mpa-express',
    name: 'EXPRESS Pathway',
    description: 'Streamlined media brief creation for experienced planners',
    version: '1.0.0',
    agent: 'ORC',
    workflow: 'EXPRESS',
    nodes: autoLayout(nodes, edges),
    edges,
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['mpa', 'express'] },
  };
})();

/**
 * STANDARD Pathway - Full workflow
 */
export const STANDARD_PATHWAY: DecisionTree = (() => {
  const nodes = [
    createNode('start', 'Start STANDARD', { id: 'start', data: { agent: 'ORC' } }),
    createNode('action', 'Business Context', {
      id: 'context',
      data: { agent: 'ANL', timeEstimate: 5, helpText: 'Define campaign business objectives and constraints' },
    }),
    createNode('action', 'Set Objectives', {
      id: 'objectives',
      data: { agent: 'ANL', capability: 'ANL_OBJECTIVE', timeEstimate: 5 },
    }),
    createNode('gate', 'Objective Gate', {
      id: 'obj_gate',
      data: {
        validationRules: [
          createValidationRule('primaryKPI', 'exists', true, 'Primary KPI must be selected'),
          createValidationRule('budget', 'greaterThan', 1000, 'Minimum budget of $1,000'),
        ],
      },
    }),
    createNode('action', 'Audience Strategy', {
      id: 'audience',
      data: { agent: 'AUD', capability: 'AUD_SEGMENT_PRIORITY', timeEstimate: 10 },
    }),
    createNode('action', 'Journey Mapping', {
      id: 'journey',
      data: { agent: 'AUD', capability: 'AUD_JOURNEY_STATE', timeEstimate: 8 },
    }),
    createNode('gate', 'Audience Gate', {
      id: 'aud_gate',
      data: {
        validationRules: [
          createValidationRule('primarySegment', 'exists', true, 'Primary segment must be defined'),
          createValidationRule('audienceSize', 'greaterThan', 10000, 'Minimum audience size'),
        ],
      },
    }),
    createNode('action', 'Channel Strategy', {
      id: 'channel',
      data: { agent: 'CHA', capability: 'CHA_CHANNEL_SELECT', timeEstimate: 10 },
    }),
    createNode('action', 'Budget Allocation', {
      id: 'budget',
      data: { agent: 'ANL', capability: 'ANL_BUDGET_OPTIMIZE', timeEstimate: 8 },
    }),
    createNode('gate', 'Budget Gate', {
      id: 'budget_gate',
      data: {
        validationRules: [
          createValidationRule('totalAllocated', 'equals', 'budget', 'All budget must be allocated'),
        ],
      },
    }),
    createNode('action', 'Performance Framework', {
      id: 'performance',
      data: { agent: 'PRF', capability: 'PRF_FRAMEWORK', timeEstimate: 5 },
    }),
    createNode('action', 'Generate Brief', {
      id: 'generate',
      data: { agent: 'DOC', capability: 'DOC_GENERATE', timeEstimate: 3 },
    }),
    createNode('end', 'Complete', { id: 'end' }),
  ];

  const edges = [
    createEdge('start', 'context'),
    createEdge('context', 'objectives'),
    createEdge('objectives', 'obj_gate'),
    createEdge('obj_gate', 'audience'),
    createEdge('audience', 'journey'),
    createEdge('journey', 'aud_gate'),
    createEdge('aud_gate', 'channel'),
    createEdge('channel', 'budget'),
    createEdge('budget', 'budget_gate'),
    createEdge('budget_gate', 'performance'),
    createEdge('performance', 'generate'),
    createEdge('generate', 'end'),
  ];

  return {
    id: 'mpa-standard',
    name: 'STANDARD Pathway',
    description: 'Complete media planning workflow with all stages',
    version: '1.0.0',
    agent: 'ORC',
    workflow: 'STANDARD',
    nodes: autoLayout(nodes, edges),
    edges,
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['mpa', 'standard'] },
  };
})();

/**
 * GUIDED Pathway - Educational workflow
 */
export const GUIDED_PATHWAY: DecisionTree = (() => {
  const nodes = [
    createNode('start', 'Start GUIDED', { id: 'start', data: { agent: 'ORC' } }),
    createNode('decision', 'Experience Level', {
      id: 'experience',
      data: {
        options: [
          createOption('Novice', 'novice_intro', { description: 'Full explanations and guidance' }),
          createOption('Intermediate', 'inter_intro', { description: 'Key concepts only', isDefault: true }),
          createOption('Advanced', 'adv_intro', { description: 'Minimal guidance' }),
        ],
      },
    }),
    createNode('action', 'Novice Introduction', { id: 'novice_intro', data: { timeEstimate: 15 } }),
    createNode('action', 'Intermediate Introduction', { id: 'inter_intro', data: { timeEstimate: 8 } }),
    createNode('action', 'Advanced Introduction', { id: 'adv_intro', data: { timeEstimate: 3 } }),
    createNode('merge', 'Merge Intros', { id: 'merge_intro' }),
    createNode('action', 'Objectives Workshop', {
      id: 'obj_workshop',
      data: { agent: 'ANL', timeEstimate: 15, helpText: 'Interactive objective setting with examples' },
    }),
    createNode('action', 'Audience Workshop', {
      id: 'aud_workshop',
      data: { agent: 'AUD', timeEstimate: 20, helpText: 'Guided audience definition with personas' },
    }),
    createNode('action', 'Channel Workshop', {
      id: 'cha_workshop',
      data: { agent: 'CHA', timeEstimate: 15, helpText: 'Channel selection with pros/cons analysis' },
    }),
    createNode('action', 'Budget Workshop', {
      id: 'budget_workshop',
      data: { agent: 'ANL', timeEstimate: 15, helpText: 'Budget allocation with scenario modeling' },
    }),
    createNode('action', 'Review & Learn', {
      id: 'review',
      data: { timeEstimate: 10, helpText: 'Review decisions and key learnings' },
    }),
    createNode('action', 'Generate Brief', { id: 'generate', data: { agent: 'DOC', timeEstimate: 3 } }),
    createNode('end', 'Complete', { id: 'end' }),
  ];

  const edges = [
    createEdge('start', 'experience'),
    createEdge('experience', 'novice_intro', { data: { condition: 'Novice' } }),
    createEdge('experience', 'inter_intro', { data: { condition: 'Intermediate' } }),
    createEdge('experience', 'adv_intro', { data: { condition: 'Advanced' } }),
    createEdge('novice_intro', 'merge_intro'),
    createEdge('inter_intro', 'merge_intro'),
    createEdge('adv_intro', 'merge_intro'),
    createEdge('merge_intro', 'obj_workshop'),
    createEdge('obj_workshop', 'aud_workshop'),
    createEdge('aud_workshop', 'cha_workshop'),
    createEdge('cha_workshop', 'budget_workshop'),
    createEdge('budget_workshop', 'review'),
    createEdge('review', 'generate'),
    createEdge('generate', 'end'),
  ];

  return {
    id: 'mpa-guided',
    name: 'GUIDED Pathway',
    description: 'Educational media planning workflow with explanations',
    version: '1.0.0',
    agent: 'ORC',
    workflow: 'GUIDED',
    nodes: autoLayout(nodes, edges),
    edges,
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['mpa', 'guided', 'learning'] },
  };
})();

/**
 * AUDIT Pathway - Review and optimize existing briefs
 */
export const AUDIT_PATHWAY: DecisionTree = (() => {
  const nodes = [
    createNode('start', 'Start AUDIT', { id: 'start', data: { agent: 'ORC' } }),
    createNode('action', 'Load Brief', { id: 'load', data: { agent: 'DOC', timeEstimate: 2 } }),
    createNode('decision', 'Audit Scope', {
      id: 'scope',
      data: {
        options: [
          createOption('Full Audit', 'full_audit', { description: 'Complete review of all elements' }),
          createOption('Audience Focus', 'aud_audit', { description: 'Audience strategy review' }),
          createOption('Channel Focus', 'cha_audit', { description: 'Channel mix optimization' }),
          createOption('Budget Focus', 'budget_audit', { description: 'Budget allocation review' }),
        ],
      },
    }),
    createNode('action', 'Full Audit', { id: 'full_audit', data: { agent: 'ANL', timeEstimate: 30 } }),
    createNode('action', 'Audience Audit', { id: 'aud_audit', data: { agent: 'AUD', timeEstimate: 15 } }),
    createNode('action', 'Channel Audit', { id: 'cha_audit', data: { agent: 'CHA', timeEstimate: 15 } }),
    createNode('action', 'Budget Audit', { id: 'budget_audit', data: { agent: 'ANL', timeEstimate: 15 } }),
    createNode('merge', 'Merge Audits', { id: 'merge_audit' }),
    createNode('action', 'Benchmark Compare', {
      id: 'benchmark',
      data: { agent: 'PRF', capability: 'PRF_BENCHMARK', timeEstimate: 5 },
    }),
    createNode('action', 'Generate Findings', {
      id: 'findings',
      data: { agent: 'DOC', timeEstimate: 5 },
    }),
    createNode('action', 'Improvement Roadmap', {
      id: 'roadmap',
      data: { agent: 'DOC', capability: 'DOC_ROADMAP', timeEstimate: 5 },
    }),
    createNode('end', 'Complete', { id: 'end' }),
  ];

  const edges = [
    createEdge('start', 'load'),
    createEdge('load', 'scope'),
    createEdge('scope', 'full_audit', { data: { condition: 'Full Audit' } }),
    createEdge('scope', 'aud_audit', { data: { condition: 'Audience Focus' } }),
    createEdge('scope', 'cha_audit', { data: { condition: 'Channel Focus' } }),
    createEdge('scope', 'budget_audit', { data: { condition: 'Budget Focus' } }),
    createEdge('full_audit', 'merge_audit'),
    createEdge('aud_audit', 'merge_audit'),
    createEdge('cha_audit', 'merge_audit'),
    createEdge('budget_audit', 'merge_audit'),
    createEdge('merge_audit', 'benchmark'),
    createEdge('benchmark', 'findings'),
    createEdge('findings', 'roadmap'),
    createEdge('roadmap', 'end'),
  ];

  return {
    id: 'mpa-audit',
    name: 'AUDIT Pathway',
    description: 'Review and optimize existing media briefs',
    version: '1.0.0',
    agent: 'ORC',
    workflow: 'AUDIT',
    nodes: autoLayout(nodes, edges),
    edges,
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['mpa', 'audit', 'optimization'] },
  };
})();

/**
 * All MPA workflow trees
 */
export const MPA_WORKFLOW_TREES = {
  EXPRESS: EXPRESS_PATHWAY,
  STANDARD: STANDARD_PATHWAY,
  GUIDED: GUIDED_PATHWAY,
  AUDIT: AUDIT_PATHWAY,
};

export default MPA_WORKFLOW_TREES;
