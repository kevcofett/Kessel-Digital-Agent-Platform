/**
 * CA Workflow Decision Trees
 * Pre-built trees for Consulting Agent workflows
 */

import type { DecisionTree } from '../types';
import { createNode, createEdge, createOption, createValidationRule, autoLayout } from '../utils/treeBuilder';

/**
 * Framework Selection Workflow
 */
export const FRAMEWORK_SELECTION: DecisionTree = (() => {
  const nodes = [
    createNode('start', 'Start Framework Selection', { id: 'start', data: { agent: 'ORC' } }),
    createNode('decision', 'Challenge Type', {
      id: 'challenge_type',
      data: {
        options: [
          createOption('Strategic', 'strategic_branch', { description: 'Market entry, growth, competitive' }),
          createOption('Operational', 'operational_branch', { description: 'Process, efficiency, cost' }),
          createOption('Financial', 'financial_branch', { description: 'Investment, valuation, ROI' }),
          createOption('Customer', 'customer_branch', { description: 'Journey, experience, segmentation' }),
          createOption('Organizational', 'org_branch', { description: 'Change, culture, capability' }),
        ],
      },
    }),
    // Strategic branch
    createNode('decision', 'Strategic Focus', {
      id: 'strategic_branch',
      data: {
        options: [
          createOption('Market Entry', 'market_entry'),
          createOption('Competitive Response', 'competitive'),
          createOption('Growth Planning', 'growth'),
        ],
      },
    }),
    createNode('action', 'Market Entry Frameworks', {
      id: 'market_entry',
      data: {
        agent: 'CST',
        timeEstimate: 5,
        helpText: 'Recommended: Porter\'s 5 Forces + TAM/SAM/SOM + PESTEL',
      },
    }),
    createNode('action', 'Competitive Frameworks', {
      id: 'competitive',
      data: {
        agent: 'CST',
        timeEstimate: 5,
        helpText: 'Recommended: Competitor Profiling + Strategic Group + Positioning Map',
      },
    }),
    createNode('action', 'Growth Frameworks', {
      id: 'growth',
      data: {
        agent: 'CST',
        timeEstimate: 5,
        helpText: 'Recommended: Ansoff Matrix + BCG Matrix + GE-McKinsey',
      },
    }),
    // Operational branch
    createNode('action', 'Operational Frameworks', {
      id: 'operational_branch',
      data: {
        agent: 'CST',
        timeEstimate: 5,
        helpText: 'Recommended: Value Chain + Lean Six Sigma + Process Mapping',
      },
    }),
    // Financial branch
    createNode('decision', 'Financial Analysis Type', {
      id: 'financial_branch',
      data: {
        options: [
          createOption('Investment Decision', 'investment'),
          createOption('Cost Analysis', 'cost_analysis'),
          createOption('Valuation', 'valuation'),
        ],
      },
    }),
    createNode('action', 'Investment Frameworks', {
      id: 'investment',
      data: {
        agent: 'ANL',
        timeEstimate: 5,
        helpText: 'Recommended: NPV + IRR + Monte Carlo + Sensitivity Analysis',
      },
    }),
    createNode('action', 'Cost Analysis Frameworks', {
      id: 'cost_analysis',
      data: {
        agent: 'ANL',
        timeEstimate: 5,
        helpText: 'Recommended: TCO + Activity-Based Costing + Break-Even',
      },
    }),
    createNode('action', 'Valuation Frameworks', {
      id: 'valuation',
      data: {
        agent: 'ANL',
        timeEstimate: 5,
        helpText: 'Recommended: DCF + Comparables + Precedent Transactions',
      },
    }),
    // Customer branch
    createNode('action', 'Customer Frameworks', {
      id: 'customer_branch',
      data: {
        agent: 'CST',
        timeEstimate: 5,
        helpText: 'Recommended: Customer Journey + Jobs-to-be-Done + Kano Model',
      },
    }),
    // Organizational branch
    createNode('action', 'Organizational Frameworks', {
      id: 'org_branch',
      data: {
        agent: 'CHG',
        timeEstimate: 5,
        helpText: 'Recommended: McKinsey 7-S + Kotter\'s 8-Step + ADKAR',
      },
    }),
    // Merge all branches
    createNode('merge', 'Merge Selections', { id: 'merge' }),
    createNode('action', 'Configure Framework', {
      id: 'configure',
      data: { agent: 'CST', capability: 'CST_FRAMEWORK_SELECT', timeEstimate: 10 },
    }),
    createNode('action', 'Generate Template', {
      id: 'generate',
      data: { agent: 'DOC', capability: 'DOC_TEMPLATE_SELECT', timeEstimate: 3 },
    }),
    createNode('end', 'Complete', { id: 'end' }),
  ];

  const edges = [
    createEdge('start', 'challenge_type'),
    createEdge('challenge_type', 'strategic_branch', { data: { condition: 'Strategic' } }),
    createEdge('challenge_type', 'operational_branch', { data: { condition: 'Operational' } }),
    createEdge('challenge_type', 'financial_branch', { data: { condition: 'Financial' } }),
    createEdge('challenge_type', 'customer_branch', { data: { condition: 'Customer' } }),
    createEdge('challenge_type', 'org_branch', { data: { condition: 'Organizational' } }),
    createEdge('strategic_branch', 'market_entry', { data: { condition: 'Market Entry' } }),
    createEdge('strategic_branch', 'competitive', { data: { condition: 'Competitive Response' } }),
    createEdge('strategic_branch', 'growth', { data: { condition: 'Growth Planning' } }),
    createEdge('financial_branch', 'investment', { data: { condition: 'Investment Decision' } }),
    createEdge('financial_branch', 'cost_analysis', { data: { condition: 'Cost Analysis' } }),
    createEdge('financial_branch', 'valuation', { data: { condition: 'Valuation' } }),
    createEdge('market_entry', 'merge'),
    createEdge('competitive', 'merge'),
    createEdge('growth', 'merge'),
    createEdge('operational_branch', 'merge'),
    createEdge('investment', 'merge'),
    createEdge('cost_analysis', 'merge'),
    createEdge('valuation', 'merge'),
    createEdge('customer_branch', 'merge'),
    createEdge('org_branch', 'merge'),
    createEdge('merge', 'configure'),
    createEdge('configure', 'generate'),
    createEdge('generate', 'end'),
  ];

  return {
    id: 'ca-framework-selection',
    name: 'Framework Selection',
    description: 'Guide users to select appropriate consulting frameworks',
    version: '1.0.0',
    agent: 'CST',
    workflow: 'FRAMEWORK_SELECTION',
    nodes: autoLayout(nodes, edges),
    edges,
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['ca', 'framework'] },
  };
})();

/**
 * Change Management Workflow
 */
export const CHANGE_MANAGEMENT: DecisionTree = (() => {
  const nodes = [
    createNode('start', 'Start Change Management', { id: 'start', data: { agent: 'ORC' } }),
    createNode('action', 'Define Change Initiative', {
      id: 'define',
      data: { agent: 'CHG', timeEstimate: 10, helpText: 'Describe the change and its objectives' },
    }),
    createNode('decision', 'Change Magnitude', {
      id: 'magnitude',
      data: {
        options: [
          createOption('Incremental', 'incremental', { description: 'Small improvements, low disruption' }),
          createOption('Transformational', 'transformational', { description: 'Major change, high impact' }),
        ],
      },
    }),
    createNode('action', 'Incremental Assessment', {
      id: 'incremental',
      data: { agent: 'CHG', timeEstimate: 15 },
    }),
    createNode('action', 'Transformation Assessment', {
      id: 'transformational',
      data: { agent: 'CHG', timeEstimate: 25 },
    }),
    createNode('merge', 'Merge Assessment', { id: 'merge_assess' }),
    createNode('action', 'Stakeholder Mapping', {
      id: 'stakeholder',
      data: { agent: 'CHG', capability: 'CHG_STAKEHOLDER', timeEstimate: 15 },
    }),
    createNode('gate', 'Stakeholder Gate', {
      id: 'stakeholder_gate',
      data: {
        validationRules: [
          createValidationRule('sponsors', 'exists', true, 'Executive sponsors must be identified'),
          createValidationRule('impactedGroups', 'greaterThan', 0, 'Impacted groups must be mapped'),
        ],
      },
    }),
    createNode('action', 'Readiness Assessment', {
      id: 'readiness',
      data: { agent: 'CHG', capability: 'CHG_READINESS', timeEstimate: 15 },
    }),
    createNode('decision', 'Implementation Approach', {
      id: 'approach',
      data: {
        options: [
          createOption('Big Bang', 'big_bang', { description: 'Full deployment at once' }),
          createOption('Phased Rollout', 'phased', { description: 'Gradual deployment by group', isDefault: true }),
          createOption('Pilot First', 'pilot', { description: 'Test with select group first' }),
        ],
      },
    }),
    createNode('action', 'Big Bang Plan', { id: 'big_bang', data: { agent: 'CHG', timeEstimate: 10 } }),
    createNode('action', 'Phased Plan', { id: 'phased', data: { agent: 'CHG', timeEstimate: 15 } }),
    createNode('action', 'Pilot Plan', { id: 'pilot', data: { agent: 'CHG', timeEstimate: 12 } }),
    createNode('merge', 'Merge Plans', { id: 'merge_plans' }),
    createNode('action', 'Communication Plan', {
      id: 'communication',
      data: { agent: 'CHG', timeEstimate: 10 },
    }),
    createNode('action', 'Training Plan', {
      id: 'training',
      data: { agent: 'CHG', timeEstimate: 10 },
    }),
    createNode('action', 'Adoption Planning', {
      id: 'adoption',
      data: { agent: 'CHG', capability: 'CHG_ADOPTION', timeEstimate: 10 },
    }),
    createNode('action', 'Generate Change Plan', {
      id: 'generate',
      data: { agent: 'DOC', timeEstimate: 5 },
    }),
    createNode('end', 'Complete', { id: 'end' }),
  ];

  const edges = [
    createEdge('start', 'define'),
    createEdge('define', 'magnitude'),
    createEdge('magnitude', 'incremental', { data: { condition: 'Incremental' } }),
    createEdge('magnitude', 'transformational', { data: { condition: 'Transformational' } }),
    createEdge('incremental', 'merge_assess'),
    createEdge('transformational', 'merge_assess'),
    createEdge('merge_assess', 'stakeholder'),
    createEdge('stakeholder', 'stakeholder_gate'),
    createEdge('stakeholder_gate', 'readiness'),
    createEdge('readiness', 'approach'),
    createEdge('approach', 'big_bang', { data: { condition: 'Big Bang' } }),
    createEdge('approach', 'phased', { data: { condition: 'Phased Rollout' } }),
    createEdge('approach', 'pilot', { data: { condition: 'Pilot First' } }),
    createEdge('big_bang', 'merge_plans'),
    createEdge('phased', 'merge_plans'),
    createEdge('pilot', 'merge_plans'),
    createEdge('merge_plans', 'communication'),
    createEdge('communication', 'training'),
    createEdge('training', 'adoption'),
    createEdge('adoption', 'generate'),
    createEdge('generate', 'end'),
  ];

  return {
    id: 'ca-change-management',
    name: 'Change Management',
    description: 'Complete change management planning workflow',
    version: '1.0.0',
    agent: 'CHG',
    workflow: 'CHANGE_MANAGEMENT',
    nodes: autoLayout(nodes, edges),
    edges,
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['ca', 'change', 'transformation'] },
  };
})();

/**
 * Business Case Development Workflow
 */
export const BUSINESS_CASE: DecisionTree = (() => {
  const nodes = [
    createNode('start', 'Start Business Case', { id: 'start', data: { agent: 'ORC' } }),
    createNode('action', 'Define Opportunity', {
      id: 'opportunity',
      data: { agent: 'CST', timeEstimate: 10 },
    }),
    createNode('action', 'Strategic Alignment', {
      id: 'alignment',
      data: { agent: 'CST', timeEstimate: 8 },
    }),
    createNode('action', 'Market Analysis', {
      id: 'market',
      data: { agent: 'CST', timeEstimate: 15 },
    }),
    createNode('action', 'Financial Modeling', {
      id: 'financial',
      data: { agent: 'ANL', capability: 'ANL_NPV', timeEstimate: 20 },
    }),
    createNode('gate', 'Financial Gate', {
      id: 'fin_gate',
      data: {
        validationRules: [
          createValidationRule('npv', 'greaterThan', 0, 'NPV must be positive'),
          createValidationRule('paybackPeriod', 'lessThan', 36, 'Payback within 3 years'),
        ],
      },
    }),
    createNode('action', 'Risk Assessment', {
      id: 'risk',
      data: { agent: 'ANL', capability: 'ANL_MONTECARLO', timeEstimate: 15 },
    }),
    createNode('action', 'Implementation Plan', {
      id: 'implementation',
      data: { agent: 'CST', timeEstimate: 10 },
    }),
    createNode('action', 'Generate Business Case', {
      id: 'generate',
      data: { agent: 'DOC', capability: 'DOC_BUSINESSCASE', timeEstimate: 5 },
    }),
    createNode('end', 'Complete', { id: 'end' }),
  ];

  const edges = [
    createEdge('start', 'opportunity'),
    createEdge('opportunity', 'alignment'),
    createEdge('alignment', 'market'),
    createEdge('market', 'financial'),
    createEdge('financial', 'fin_gate'),
    createEdge('fin_gate', 'risk'),
    createEdge('risk', 'implementation'),
    createEdge('implementation', 'generate'),
    createEdge('generate', 'end'),
  ];

  return {
    id: 'ca-business-case',
    name: 'Business Case Development',
    description: 'Structured business case creation with financial analysis',
    version: '1.0.0',
    agent: 'CST',
    workflow: 'BUSINESS_CASE',
    nodes: autoLayout(nodes, edges),
    edges,
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['ca', 'business-case', 'financial'] },
  };
})();

/**
 * All CA workflow trees
 */
export const CA_WORKFLOW_TREES = {
  FRAMEWORK_SELECTION,
  CHANGE_MANAGEMENT,
  BUSINESS_CASE,
};

export default CA_WORKFLOW_TREES;
