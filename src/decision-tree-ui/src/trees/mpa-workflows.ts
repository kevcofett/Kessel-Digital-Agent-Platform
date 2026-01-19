/**
 * MPA (Media Planning & Analytics) Pre-built Workflow Trees
 */

import { DecisionTree } from '../types';
import { createTree, createNode, createEdge, createDecisionOption } from '../utils/treeBuilder';

export const MPA_BUDGET_OPTIMIZATION: DecisionTree = createTree({
  id: 'mpa-budget-optimization',
  name: 'Budget Optimization Workflow',
  description: 'Workflow for optimizing media budget allocation across channels',
  version: '1.0.0',
  domain: 'MPA',
  startNodeId: 'start',
  nodes: [
    createNode({
      id: 'start',
      type: 'start',
      label: 'Start Budget Optimization',
      description: 'Begin the budget optimization workflow',
    }),
    createNode({
      id: 'gather-data',
      type: 'action',
      label: 'Gather Performance Data',
      description: 'Collect historical performance data across all channels',
      agent: 'ANL',
      capability: 'data-collection',
    }),
    createNode({
      id: 'analyze-performance',
      type: 'action',
      label: 'Analyze Channel Performance',
      description: 'Analyze ROI and efficiency metrics for each channel',
      agent: 'ANL',
      capability: 'performance-analysis',
    }),
    createNode({
      id: 'decision-reallocation',
      type: 'decision',
      label: 'Reallocation Needed?',
      description: 'Determine if budget reallocation would improve performance',
      options: [
        createDecisionOption('yes', 'Yes - Reallocate', 'optimize-allocation', { description: 'Proceed with budget reallocation' }),
        createDecisionOption('no', 'No - Maintain', 'maintain-allocation', { description: 'Keep current allocation' }),
        createDecisionOption('review', 'Need Review', 'human-review', { description: 'Requires human approval' }),
      ],
    }),
    createNode({
      id: 'optimize-allocation',
      type: 'action',
      label: 'Optimize Allocation',
      description: 'Run ML optimization model to determine optimal budget split',
      agent: 'ANL',
      capability: 'budget-optimization',
    }),
    createNode({
      id: 'maintain-allocation',
      type: 'action',
      label: 'Maintain Current Allocation',
      description: 'Document decision to maintain current allocation',
      agent: 'DOC',
    }),
    createNode({
      id: 'human-review',
      type: 'gate',
      label: 'Human Review Gate',
      description: 'Waiting for human approval of recommendations',
    }),
    createNode({
      id: 'generate-report',
      type: 'action',
      label: 'Generate Report',
      description: 'Create optimization report with recommendations',
      agent: 'DOC',
      capability: 'report-generation',
    }),
    createNode({
      id: 'end',
      type: 'end',
      label: 'Workflow Complete',
      description: 'Budget optimization workflow completed',
    }),
  ],
  edges: [
    createEdge({ source: 'start', target: 'gather-data' }),
    createEdge({ source: 'gather-data', target: 'analyze-performance' }),
    createEdge({ source: 'analyze-performance', target: 'decision-reallocation' }),
    createEdge({ source: 'decision-reallocation', target: 'optimize-allocation', label: 'Yes' }),
    createEdge({ source: 'decision-reallocation', target: 'maintain-allocation', label: 'No' }),
    createEdge({ source: 'decision-reallocation', target: 'human-review', label: 'Review' }),
    createEdge({ source: 'optimize-allocation', target: 'generate-report' }),
    createEdge({ source: 'maintain-allocation', target: 'generate-report' }),
    createEdge({ source: 'human-review', target: 'optimize-allocation', label: 'Approved' }),
    createEdge({ source: 'human-review', target: 'maintain-allocation', label: 'Rejected' }),
    createEdge({ source: 'generate-report', target: 'end' }),
  ],
  metadata: {
    author: 'KDAP',
    tags: ['mpa', 'budget', 'optimization', 'ml'],
  },
});

export const MPA_CAMPAIGN_PLANNING: DecisionTree = createTree({
  id: 'mpa-campaign-planning',
  name: 'Campaign Planning Workflow',
  description: 'End-to-end workflow for planning media campaigns',
  version: '1.0.0',
  domain: 'MPA',
  startNodeId: 'start',
  nodes: [
    createNode({
      id: 'start',
      type: 'start',
      label: 'Start Campaign Planning',
    }),
    createNode({
      id: 'define-objectives',
      type: 'action',
      label: 'Define Campaign Objectives',
      agent: 'CHA',
      capability: 'objective-setting',
    }),
    createNode({
      id: 'audience-analysis',
      type: 'action',
      label: 'Analyze Target Audience',
      agent: 'AUD',
      capability: 'audience-profiling',
    }),
    createNode({
      id: 'channel-selection',
      type: 'decision',
      label: 'Select Channels',
      options: [
        createDecisionOption('digital', 'Digital Focus', 'digital-planning'),
        createDecisionOption('traditional', 'Traditional Focus', 'traditional-planning'),
        createDecisionOption('omni', 'Omnichannel', 'omni-planning'),
      ],
    }),
    createNode({
      id: 'digital-planning',
      type: 'action',
      label: 'Digital Channel Planning',
      agent: 'CHA',
      capability: 'digital-media',
    }),
    createNode({
      id: 'traditional-planning',
      type: 'action',
      label: 'Traditional Channel Planning',
      agent: 'CHA',
      capability: 'traditional-media',
    }),
    createNode({
      id: 'omni-planning',
      type: 'action',
      label: 'Omnichannel Planning',
      agent: 'CHA',
      capability: 'omnichannel',
    }),
    createNode({
      id: 'merge-plans',
      type: 'merge',
      label: 'Merge Plans',
    }),
    createNode({
      id: 'budget-allocation',
      type: 'action',
      label: 'Allocate Budget',
      agent: 'ANL',
      capability: 'budget-allocation',
    }),
    createNode({
      id: 'create-media-plan',
      type: 'action',
      label: 'Create Media Plan Document',
      agent: 'DOC',
    }),
    createNode({
      id: 'end',
      type: 'end',
      label: 'Planning Complete',
    }),
  ],
  edges: [
    createEdge({ source: 'start', target: 'define-objectives' }),
    createEdge({ source: 'define-objectives', target: 'audience-analysis' }),
    createEdge({ source: 'audience-analysis', target: 'channel-selection' }),
    createEdge({ source: 'channel-selection', target: 'digital-planning', label: 'Digital' }),
    createEdge({ source: 'channel-selection', target: 'traditional-planning', label: 'Traditional' }),
    createEdge({ source: 'channel-selection', target: 'omni-planning', label: 'Omni' }),
    createEdge({ source: 'digital-planning', target: 'merge-plans' }),
    createEdge({ source: 'traditional-planning', target: 'merge-plans' }),
    createEdge({ source: 'omni-planning', target: 'merge-plans' }),
    createEdge({ source: 'merge-plans', target: 'budget-allocation' }),
    createEdge({ source: 'budget-allocation', target: 'create-media-plan' }),
    createEdge({ source: 'create-media-plan', target: 'end' }),
  ],
  metadata: {
    author: 'KDAP',
    tags: ['mpa', 'campaign', 'planning'],
  },
});

export const MPA_PERFORMANCE_ANALYSIS: DecisionTree = createTree({
  id: 'mpa-performance-analysis',
  name: 'Performance Analysis Workflow',
  description: 'Analyze campaign performance and generate insights',
  version: '1.0.0',
  domain: 'MPA',
  startNodeId: 'start',
  nodes: [
    createNode({
      id: 'start',
      type: 'start',
      label: 'Start Analysis',
    }),
    createNode({
      id: 'collect-metrics',
      type: 'action',
      label: 'Collect Performance Metrics',
      agent: 'PRF',
      capability: 'metrics-collection',
    }),
    createNode({
      id: 'anomaly-detection',
      type: 'action',
      label: 'Detect Anomalies',
      agent: 'PRF',
      capability: 'anomaly-detection',
    }),
    createNode({
      id: 'decision-anomaly',
      type: 'decision',
      label: 'Anomalies Found?',
      options: [
        createDecisionOption('yes', 'Yes', 'investigate-anomalies'),
        createDecisionOption('no', 'No', 'standard-analysis'),
      ],
    }),
    createNode({
      id: 'investigate-anomalies',
      type: 'action',
      label: 'Investigate Anomalies',
      agent: 'PRF',
      capability: 'root-cause-analysis',
    }),
    createNode({
      id: 'standard-analysis',
      type: 'action',
      label: 'Standard Performance Analysis',
      agent: 'ANL',
    }),
    createNode({
      id: 'generate-insights',
      type: 'action',
      label: 'Generate Insights',
      agent: 'ANL',
      capability: 'insight-generation',
    }),
    createNode({
      id: 'create-dashboard',
      type: 'action',
      label: 'Update Dashboard',
      agent: 'DOC',
    }),
    createNode({
      id: 'end',
      type: 'end',
      label: 'Analysis Complete',
    }),
  ],
  edges: [
    createEdge({ source: 'start', target: 'collect-metrics' }),
    createEdge({ source: 'collect-metrics', target: 'anomaly-detection' }),
    createEdge({ source: 'anomaly-detection', target: 'decision-anomaly' }),
    createEdge({ source: 'decision-anomaly', target: 'investigate-anomalies', label: 'Yes' }),
    createEdge({ source: 'decision-anomaly', target: 'standard-analysis', label: 'No' }),
    createEdge({ source: 'investigate-anomalies', target: 'generate-insights' }),
    createEdge({ source: 'standard-analysis', target: 'generate-insights' }),
    createEdge({ source: 'generate-insights', target: 'create-dashboard' }),
    createEdge({ source: 'create-dashboard', target: 'end' }),
  ],
  metadata: {
    author: 'KDAP',
    tags: ['mpa', 'performance', 'analysis', 'anomaly'],
  },
});

export const MPA_WORKFLOW_TREES: Record<string, DecisionTree> = {
  'budget-optimization': MPA_BUDGET_OPTIMIZATION,
  'campaign-planning': MPA_CAMPAIGN_PLANNING,
  'performance-analysis': MPA_PERFORMANCE_ANALYSIS,
};

export function getMPATree(workflowId: string): DecisionTree | undefined {
  return MPA_WORKFLOW_TREES[workflowId];
}
