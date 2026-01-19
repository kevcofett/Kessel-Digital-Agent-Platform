/**
 * CA (Creative Agency) Pre-built Workflow Trees
 */

import { DecisionTree } from '../types';
import { createTree, createNode, createEdge, createDecisionOption, createValidationRule } from '../utils/treeBuilder';

export const CA_CREATIVE_BRIEF: DecisionTree = createTree({
  id: 'ca-creative-brief',
  name: 'Creative Brief Workflow',
  description: 'Workflow for developing and approving creative briefs',
  version: '1.0.0',
  domain: 'CA',
  startNodeId: 'start',
  nodes: [
    createNode({
      id: 'start',
      type: 'start',
      label: 'Start Brief Creation',
      description: 'Begin creative brief development',
    }),
    createNode({
      id: 'gather-requirements',
      type: 'action',
      label: 'Gather Client Requirements',
      description: 'Collect and document client needs and objectives',
      agent: 'CHA',
      capability: 'requirements-gathering',
    }),
    createNode({
      id: 'audience-research',
      type: 'action',
      label: 'Research Target Audience',
      description: 'Conduct audience research and create personas',
      agent: 'AUD',
      capability: 'audience-research',
    }),
    createNode({
      id: 'competitive-analysis',
      type: 'action',
      label: 'Competitive Analysis',
      description: 'Analyze competitor creative approaches',
      agent: 'ANL',
      capability: 'competitive-analysis',
    }),
    createNode({
      id: 'draft-brief',
      type: 'action',
      label: 'Draft Creative Brief',
      description: 'Create initial creative brief document',
      agent: 'DOC',
      capability: 'brief-creation',
      validation: [
        createValidationRule('objectives', 'required', 'Objectives are required'),
        createValidationRule('audience', 'required', 'Target audience must be defined'),
        createValidationRule('messaging', 'required', 'Key messaging is required'),
      ],
    }),
    createNode({
      id: 'internal-review',
      type: 'gate',
      label: 'Internal Review',
      description: 'Internal team reviews the brief',
    }),
    createNode({
      id: 'decision-revisions',
      type: 'decision',
      label: 'Revisions Needed?',
      options: [
        createDecisionOption('approved', 'Approved', 'client-presentation'),
        createDecisionOption('minor', 'Minor Revisions', 'revise-brief'),
        createDecisionOption('major', 'Major Revisions', 'gather-requirements'),
      ],
    }),
    createNode({
      id: 'revise-brief',
      type: 'action',
      label: 'Revise Brief',
      agent: 'DOC',
    }),
    createNode({
      id: 'client-presentation',
      type: 'action',
      label: 'Present to Client',
      agent: 'CHA',
    }),
    createNode({
      id: 'client-approval',
      type: 'gate',
      label: 'Client Approval Gate',
      description: 'Waiting for client approval',
    }),
    createNode({
      id: 'finalize-brief',
      type: 'action',
      label: 'Finalize Brief',
      agent: 'DOC',
    }),
    createNode({
      id: 'end',
      type: 'end',
      label: 'Brief Approved',
    }),
  ],
  edges: [
    createEdge({ source: 'start', target: 'gather-requirements' }),
    createEdge({ source: 'gather-requirements', target: 'audience-research' }),
    createEdge({ source: 'audience-research', target: 'competitive-analysis' }),
    createEdge({ source: 'competitive-analysis', target: 'draft-brief' }),
    createEdge({ source: 'draft-brief', target: 'internal-review' }),
    createEdge({ source: 'internal-review', target: 'decision-revisions' }),
    createEdge({ source: 'decision-revisions', target: 'client-presentation', label: 'Approved' }),
    createEdge({ source: 'decision-revisions', target: 'revise-brief', label: 'Minor' }),
    createEdge({ source: 'decision-revisions', target: 'gather-requirements', label: 'Major' }),
    createEdge({ source: 'revise-brief', target: 'internal-review' }),
    createEdge({ source: 'client-presentation', target: 'client-approval' }),
    createEdge({ source: 'client-approval', target: 'finalize-brief', label: 'Approved' }),
    createEdge({ source: 'client-approval', target: 'revise-brief', label: 'Changes Requested' }),
    createEdge({ source: 'finalize-brief', target: 'end' }),
  ],
  metadata: {
    author: 'KDAP',
    tags: ['ca', 'creative', 'brief', 'client'],
  },
});

export const CA_ASSET_PRODUCTION: DecisionTree = createTree({
  id: 'ca-asset-production',
  name: 'Asset Production Workflow',
  description: 'Workflow for producing creative assets',
  version: '1.0.0',
  domain: 'CA',
  startNodeId: 'start',
  nodes: [
    createNode({
      id: 'start',
      type: 'start',
      label: 'Start Production',
    }),
    createNode({
      id: 'review-brief',
      type: 'action',
      label: 'Review Creative Brief',
      agent: 'DOC',
    }),
    createNode({
      id: 'asset-type-decision',
      type: 'decision',
      label: 'Asset Type',
      options: [
        createDecisionOption('video', 'Video', 'video-production'),
        createDecisionOption('static', 'Static', 'static-production'),
        createDecisionOption('interactive', 'Interactive', 'interactive-production'),
      ],
    }),
    createNode({
      id: 'video-production',
      type: 'action',
      label: 'Video Production',
      agent: 'DOC',
      capability: 'video-production',
    }),
    createNode({
      id: 'static-production',
      type: 'action',
      label: 'Static Asset Production',
      agent: 'DOC',
      capability: 'static-design',
    }),
    createNode({
      id: 'interactive-production',
      type: 'action',
      label: 'Interactive Asset Production',
      agent: 'DOC',
      capability: 'interactive-design',
    }),
    createNode({
      id: 'merge-assets',
      type: 'merge',
      label: 'Merge',
    }),
    createNode({
      id: 'quality-check',
      type: 'action',
      label: 'Quality Assurance',
      agent: 'PRF',
      capability: 'qa-review',
    }),
    createNode({
      id: 'qa-decision',
      type: 'decision',
      label: 'QA Passed?',
      options: [
        createDecisionOption('pass', 'Pass', 'client-review'),
        createDecisionOption('fail', 'Fail', 'revise-assets'),
      ],
    }),
    createNode({
      id: 'revise-assets',
      type: 'action',
      label: 'Revise Assets',
      agent: 'DOC',
    }),
    createNode({
      id: 'client-review',
      type: 'gate',
      label: 'Client Review',
    }),
    createNode({
      id: 'final-delivery',
      type: 'action',
      label: 'Final Delivery',
      agent: 'DOC',
    }),
    createNode({
      id: 'end',
      type: 'end',
      label: 'Production Complete',
    }),
  ],
  edges: [
    createEdge({ source: 'start', target: 'review-brief' }),
    createEdge({ source: 'review-brief', target: 'asset-type-decision' }),
    createEdge({ source: 'asset-type-decision', target: 'video-production', label: 'Video' }),
    createEdge({ source: 'asset-type-decision', target: 'static-production', label: 'Static' }),
    createEdge({ source: 'asset-type-decision', target: 'interactive-production', label: 'Interactive' }),
    createEdge({ source: 'video-production', target: 'merge-assets' }),
    createEdge({ source: 'static-production', target: 'merge-assets' }),
    createEdge({ source: 'interactive-production', target: 'merge-assets' }),
    createEdge({ source: 'merge-assets', target: 'quality-check' }),
    createEdge({ source: 'quality-check', target: 'qa-decision' }),
    createEdge({ source: 'qa-decision', target: 'client-review', label: 'Pass' }),
    createEdge({ source: 'qa-decision', target: 'revise-assets', label: 'Fail' }),
    createEdge({ source: 'revise-assets', target: 'quality-check' }),
    createEdge({ source: 'client-review', target: 'final-delivery', label: 'Approved' }),
    createEdge({ source: 'client-review', target: 'revise-assets', label: 'Changes' }),
    createEdge({ source: 'final-delivery', target: 'end' }),
  ],
  metadata: {
    author: 'KDAP',
    tags: ['ca', 'production', 'assets'],
  },
});

export const CA_CAMPAIGN_LAUNCH: DecisionTree = createTree({
  id: 'ca-campaign-launch',
  name: 'Campaign Launch Workflow',
  description: 'Workflow for launching creative campaigns',
  version: '1.0.0',
  domain: 'CA',
  startNodeId: 'start',
  nodes: [
    createNode({
      id: 'start',
      type: 'start',
      label: 'Start Launch Process',
    }),
    createNode({
      id: 'pre-launch-checklist',
      type: 'action',
      label: 'Pre-Launch Checklist',
      agent: 'PRF',
      capability: 'checklist-validation',
    }),
    createNode({
      id: 'checklist-decision',
      type: 'decision',
      label: 'All Items Complete?',
      options: [
        createDecisionOption('yes', 'Yes', 'stakeholder-approval'),
        createDecisionOption('no', 'No', 'resolve-items'),
      ],
    }),
    createNode({
      id: 'resolve-items',
      type: 'action',
      label: 'Resolve Outstanding Items',
      agent: 'CHA',
    }),
    createNode({
      id: 'stakeholder-approval',
      type: 'gate',
      label: 'Stakeholder Approval',
    }),
    createNode({
      id: 'configure-platforms',
      type: 'action',
      label: 'Configure Ad Platforms',
      agent: 'CHA',
      capability: 'platform-setup',
    }),
    createNode({
      id: 'upload-assets',
      type: 'action',
      label: 'Upload Creative Assets',
      agent: 'DOC',
    }),
    createNode({
      id: 'set-targeting',
      type: 'action',
      label: 'Configure Targeting',
      agent: 'AUD',
      capability: 'targeting-setup',
    }),
    createNode({
      id: 'final-review',
      type: 'gate',
      label: 'Final Review',
    }),
    createNode({
      id: 'activate-campaign',
      type: 'action',
      label: 'Activate Campaign',
      agent: 'CHA',
    }),
    createNode({
      id: 'monitoring-setup',
      type: 'action',
      label: 'Setup Monitoring',
      agent: 'PRF',
      capability: 'monitoring',
    }),
    createNode({
      id: 'end',
      type: 'end',
      label: 'Campaign Live',
    }),
  ],
  edges: [
    createEdge({ source: 'start', target: 'pre-launch-checklist' }),
    createEdge({ source: 'pre-launch-checklist', target: 'checklist-decision' }),
    createEdge({ source: 'checklist-decision', target: 'stakeholder-approval', label: 'Yes' }),
    createEdge({ source: 'checklist-decision', target: 'resolve-items', label: 'No' }),
    createEdge({ source: 'resolve-items', target: 'pre-launch-checklist' }),
    createEdge({ source: 'stakeholder-approval', target: 'configure-platforms', label: 'Approved' }),
    createEdge({ source: 'configure-platforms', target: 'upload-assets' }),
    createEdge({ source: 'upload-assets', target: 'set-targeting' }),
    createEdge({ source: 'set-targeting', target: 'final-review' }),
    createEdge({ source: 'final-review', target: 'activate-campaign', label: 'Go' }),
    createEdge({ source: 'activate-campaign', target: 'monitoring-setup' }),
    createEdge({ source: 'monitoring-setup', target: 'end' }),
  ],
  metadata: {
    author: 'KDAP',
    tags: ['ca', 'campaign', 'launch'],
  },
});

export const CA_CLIENT_REPORTING: DecisionTree = createTree({
  id: 'ca-client-reporting',
  name: 'Client Reporting Workflow',
  description: 'Workflow for generating and delivering client reports',
  version: '1.0.0',
  domain: 'CA',
  startNodeId: 'start',
  nodes: [
    createNode({
      id: 'start',
      type: 'start',
      label: 'Start Reporting',
    }),
    createNode({
      id: 'collect-data',
      type: 'action',
      label: 'Collect Campaign Data',
      agent: 'PRF',
      capability: 'data-collection',
    }),
    createNode({
      id: 'analyze-performance',
      type: 'action',
      label: 'Analyze Performance',
      agent: 'ANL',
      capability: 'performance-analysis',
    }),
    createNode({
      id: 'generate-insights',
      type: 'action',
      label: 'Generate Insights',
      agent: 'ANL',
      capability: 'insight-generation',
    }),
    createNode({
      id: 'report-type',
      type: 'decision',
      label: 'Report Type',
      options: [
        createDecisionOption('executive', 'Executive Summary', 'executive-report'),
        createDecisionOption('detailed', 'Detailed Report', 'detailed-report'),
        createDecisionOption('custom', 'Custom Report', 'custom-report'),
      ],
    }),
    createNode({
      id: 'executive-report',
      type: 'action',
      label: 'Create Executive Summary',
      agent: 'DOC',
    }),
    createNode({
      id: 'detailed-report',
      type: 'action',
      label: 'Create Detailed Report',
      agent: 'DOC',
    }),
    createNode({
      id: 'custom-report',
      type: 'action',
      label: 'Create Custom Report',
      agent: 'DOC',
    }),
    createNode({
      id: 'merge-reports',
      type: 'merge',
      label: 'Merge',
    }),
    createNode({
      id: 'internal-review',
      type: 'gate',
      label: 'Internal Review',
    }),
    createNode({
      id: 'deliver-report',
      type: 'action',
      label: 'Deliver to Client',
      agent: 'CHA',
    }),
    createNode({
      id: 'end',
      type: 'end',
      label: 'Reporting Complete',
    }),
  ],
  edges: [
    createEdge({ source: 'start', target: 'collect-data' }),
    createEdge({ source: 'collect-data', target: 'analyze-performance' }),
    createEdge({ source: 'analyze-performance', target: 'generate-insights' }),
    createEdge({ source: 'generate-insights', target: 'report-type' }),
    createEdge({ source: 'report-type', target: 'executive-report', label: 'Executive' }),
    createEdge({ source: 'report-type', target: 'detailed-report', label: 'Detailed' }),
    createEdge({ source: 'report-type', target: 'custom-report', label: 'Custom' }),
    createEdge({ source: 'executive-report', target: 'merge-reports' }),
    createEdge({ source: 'detailed-report', target: 'merge-reports' }),
    createEdge({ source: 'custom-report', target: 'merge-reports' }),
    createEdge({ source: 'merge-reports', target: 'internal-review' }),
    createEdge({ source: 'internal-review', target: 'deliver-report', label: 'Approved' }),
    createEdge({ source: 'deliver-report', target: 'end' }),
  ],
  metadata: {
    author: 'KDAP',
    tags: ['ca', 'reporting', 'client'],
  },
});

export const CA_WORKFLOW_TREES: Record<string, DecisionTree> = {
  'creative-brief': CA_CREATIVE_BRIEF,
  'asset-production': CA_ASSET_PRODUCTION,
  'campaign-launch': CA_CAMPAIGN_LAUNCH,
  'client-reporting': CA_CLIENT_REPORTING,
};

export function getCATree(workflowId: string): DecisionTree | undefined {
  return CA_WORKFLOW_TREES[workflowId];
}
