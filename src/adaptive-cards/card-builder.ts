/**
 * KDAP Adaptive Cards - Card Rendering Utilities
 * 
 * Provides helpers for rendering Adaptive Cards in Copilot Studio
 * and Power Virtual Agents.
 */

import { DecisionTree, TreeNode, TreeEdge } from '../decision-tree-ui/src/types';

// Template IDs
export const CARD_TEMPLATES = {
  WORKFLOW_SELECTOR: 'kdap-workflow-selector',
  WORKFLOW_PROGRESS: 'kdap-workflow-progress',
  DECISION_NODE: 'kdap-decision-node',
  ACTION_NODE: 'kdap-action-node',
  GATE_APPROVAL: 'kdap-gate-approval',
  WORKFLOW_COMPLETE: 'kdap-workflow-complete',
} as const;

// Agent configurations
export const AGENT_CONFIG: Record<string, { name: string; iconUrl: string; color: string }> = {
  ANL: { name: 'Analytics', iconUrl: '/icons/anl-agent.svg', color: '#0078D4' },
  AUD: { name: 'Audience', iconUrl: '/icons/aud-agent.svg', color: '#107C10' },
  CHA: { name: 'Channel', iconUrl: '/icons/cha-agent.svg', color: '#FF8C00' },
  PRF: { name: 'Performance', iconUrl: '/icons/prf-agent.svg', color: '#E81123' },
  CST: { name: 'Strategy', iconUrl: '/icons/cst-agent.svg', color: '#5C2D91' },
  DOC: { name: 'Documentation', iconUrl: '/icons/doc-agent.svg', color: '#00BCF2' },
};

// Workflow metadata
export interface WorkflowMetadata {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  stepCount: number;
  estimatedTime: string;
  domain: string;
}

// Session state
export interface WorkflowSession {
  sessionId: string;
  workflowId: string;
  workflowName: string;
  currentNodeId: string;
  progress: number;
  startedAt: Date;
  lastUpdated: Date;
  decisions: Record<string, string>;
  completedNodes: string[];
}

// Card data interfaces
export interface WorkflowSelectorData {
  workflows: WorkflowMetadata[];
  recentSessions: Array<{
    sessionId: string;
    workflowName: string;
    progress: number;
    lastUpdated: string;
  }>;
  webAppUrl: string;
}

export interface WorkflowProgressData {
  workflowId: string;
  workflowName: string;
  sessionId: string;
  nodeId: string;
  nodeLabel: string;
  nodeDescription: string;
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  agentName: string;
  capability: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  iconUrl: string;
  webAppUrl: string;
}

export interface DecisionNodeData {
  workflowId: string;
  workflowName: string;
  sessionId: string;
  nodeId: string;
  decisionLabel: string;
  decisionDescription: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
    targetNodeId: string;
  }>;
  showOptionCards: boolean;
  contextSummary?: string;
  impactSummary?: string;
  webAppUrl: string;
}

export interface ActionNodeData {
  workflowId: string;
  sessionId: string;
  nodeId: string;
  actionLabel: string;
  actionDescription: string;
  agentName: string;
  agentIconUrl: string;
  capability: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  statusText: string;
  statusIcon: string;
  startTime: string;
  duration: string;
  resultSummary?: string;
  reportId?: string;
  metrics: Array<{ label: string; value: string | number }>;
  webAppUrl: string;
}

export interface GateApprovalData {
  workflowId: string;
  sessionId: string;
  nodeId: string;
  gateId: string;
  gateLabel: string;
  gateDescription: string;
  recommendationSummary: string;
  estimatedImpact: string;
  confidenceLevel: string;
  riskLevel: string;
  budgetImpact: string;
  changes: Array<{
    description: string;
    impact: string;
    impactColor: 'Good' | 'Warning' | 'Attention';
  }>;
  fullDetails: string;
  webAppUrl: string;
}

export interface WorkflowCompleteData {
  workflowId: string;
  workflowName: string;
  sessionId: string;
  summaryText: string;
  stepsCompleted: number;
  decisionsCount: number;
  duration: string;
  agentsUsed: number;
  outcomes: Array<{ text: string }>;
  recommendations: Array<{ category: string; summary: string }>;
  artifacts: Array<{
    name: string;
    type: string;
    url: string;
    iconUrl: string;
  }>;
  webAppUrl: string;
}

/**
 * Generate progress bar SVG as base64
 */
export function generateProgressBarSvg(percent: number): string {
  const width = 200;
  const height = 8;
  const fillWidth = Math.round((percent / 100) * width);
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect x="0" y="0" width="${width}" height="${height}" fill="#e0e0e0" rx="4"/>
    <rect x="0" y="0" width="${fillWidth}" height="${height}" fill="#0078D4" rx="4"/>
  </svg>`;
  
  return Buffer.from(svg).toString('base64');
}

/**
 * Calculate workflow progress
 */
export function calculateProgress(session: WorkflowSession, tree: DecisionTree): number {
  const totalNodes = tree.nodes.filter(n => n.type !== 'start' && n.type !== 'end').length;
  const completedNodes = session.completedNodes.length;
  return Math.round((completedNodes / totalNodes) * 100);
}

/**
 * Get current step number
 */
export function getCurrentStep(session: WorkflowSession, tree: DecisionTree): number {
  return session.completedNodes.length + 1;
}

/**
 * Get total steps count
 */
export function getTotalSteps(tree: DecisionTree): number {
  return tree.nodes.filter(n => n.type !== 'start' && n.type !== 'end').length;
}

/**
 * Build workflow selector card data
 */
export function buildWorkflowSelectorData(
  availableWorkflows: DecisionTree[],
  recentSessions: WorkflowSession[],
  baseUrl: string
): WorkflowSelectorData {
  return {
    workflows: availableWorkflows.map(tree => ({
      id: tree.id,
      name: tree.name,
      description: tree.description || '',
      iconUrl: `/icons/${tree.domain?.toLowerCase() || 'workflow'}-icon.svg`,
      stepCount: getTotalSteps(tree),
      estimatedTime: `${Math.ceil(getTotalSteps(tree) * 2)} min`,
      domain: tree.domain || 'General',
    })),
    recentSessions: recentSessions.map(session => ({
      sessionId: session.sessionId,
      workflowName: session.workflowName,
      progress: session.progress,
      lastUpdated: session.lastUpdated.toLocaleDateString(),
    })),
    webAppUrl: baseUrl,
  };
}

/**
 * Build workflow progress card data
 */
export function buildWorkflowProgressData(
  session: WorkflowSession,
  tree: DecisionTree,
  currentNode: TreeNode,
  baseUrl: string
): WorkflowProgressData {
  const agentConfig = currentNode.agent ? AGENT_CONFIG[currentNode.agent] : null;
  const progress = calculateProgress(session, tree);
  
  return {
    workflowId: tree.id,
    workflowName: tree.name,
    sessionId: session.sessionId,
    nodeId: currentNode.id,
    nodeLabel: currentNode.label,
    nodeDescription: currentNode.description || '',
    currentStep: getCurrentStep(session, tree),
    totalSteps: getTotalSteps(tree),
    progressPercent: progress,
    progressBarSvg: generateProgressBarSvg(progress),
    agentName: agentConfig?.name || '',
    capability: currentNode.capability || '',
    status: session.completedNodes.includes(currentNode.id) ? 'completed' : 'pending',
    iconUrl: `/icons/${tree.domain?.toLowerCase() || 'workflow'}-icon.svg`,
    webAppUrl: baseUrl,
  } as WorkflowProgressData;
}

/**
 * Build decision node card data
 */
export function buildDecisionNodeData(
  session: WorkflowSession,
  tree: DecisionTree,
  node: TreeNode,
  baseUrl: string
): DecisionNodeData {
  const options = (node.options || []).map(opt => ({
    value: opt.value,
    label: opt.label,
    description: opt.metadata?.description || '',
    targetNodeId: opt.targetNodeId,
  }));
  
  return {
    workflowId: tree.id,
    workflowName: tree.name,
    sessionId: session.sessionId,
    nodeId: node.id,
    decisionLabel: node.label,
    decisionDescription: node.description || '',
    options,
    showOptionCards: options.length <= 4,
    webAppUrl: baseUrl,
  };
}

/**
 * Build action node card data
 */
export function buildActionNodeData(
  session: WorkflowSession,
  tree: DecisionTree,
  node: TreeNode,
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  result?: {
    summary?: string;
    reportId?: string;
    metrics?: Array<{ label: string; value: string | number }>;
    startTime?: Date;
  },
  baseUrl: string = ''
): ActionNodeData {
  const agentConfig = node.agent ? AGENT_CONFIG[node.agent] : null;
  const startTime = result?.startTime || new Date();
  const duration = Math.round((Date.now() - startTime.getTime()) / 1000);
  
  const statusIcons: Record<string, string> = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
    failed: '❌',
  };
  
  const statusTexts: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    failed: 'Failed',
  };
  
  return {
    workflowId: tree.id,
    sessionId: session.sessionId,
    nodeId: node.id,
    actionLabel: node.label,
    actionDescription: node.description || '',
    agentName: agentConfig?.name || 'System',
    agentIconUrl: agentConfig?.iconUrl || '/icons/system-agent.svg',
    capability: node.capability || '',
    status,
    statusText: statusTexts[status],
    statusIcon: statusIcons[status],
    startTime: startTime.toLocaleTimeString(),
    duration: duration < 60 ? `${duration}s` : `${Math.round(duration / 60)}m`,
    resultSummary: result?.summary,
    reportId: result?.reportId,
    metrics: result?.metrics || [],
    webAppUrl: baseUrl,
  };
}

/**
 * Build gate approval card data
 */
export function buildGateApprovalData(
  session: WorkflowSession,
  tree: DecisionTree,
  node: TreeNode,
  recommendation: {
    summary: string;
    impact: string;
    confidence: string;
    risk: string;
    budgetImpact: string;
    changes: Array<{ description: string; impact: string; positive: boolean }>;
    fullDetails: string;
  },
  baseUrl: string
): GateApprovalData {
  return {
    workflowId: tree.id,
    sessionId: session.sessionId,
    nodeId: node.id,
    gateId: `gate-${node.id}`,
    gateLabel: node.label,
    gateDescription: node.description || 'Review and approve the recommendations before proceeding.',
    recommendationSummary: recommendation.summary,
    estimatedImpact: recommendation.impact,
    confidenceLevel: recommendation.confidence,
    riskLevel: recommendation.risk,
    budgetImpact: recommendation.budgetImpact,
    changes: recommendation.changes.map(c => ({
      description: c.description,
      impact: c.impact,
      impactColor: c.positive ? 'Good' : 'Warning',
    })),
    fullDetails: recommendation.fullDetails,
    webAppUrl: baseUrl,
  };
}

/**
 * Build workflow complete card data
 */
export function buildWorkflowCompleteData(
  session: WorkflowSession,
  tree: DecisionTree,
  summary: {
    text: string;
    outcomes: string[];
    recommendations: Array<{ category: string; summary: string }>;
    artifacts: Array<{ name: string; type: string; url: string }>;
  },
  baseUrl: string
): WorkflowCompleteData {
  const uniqueAgents = new Set(
    tree.nodes.filter(n => n.agent).map(n => n.agent!)
  );
  
  const startTime = session.startedAt;
  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMin = Math.round(durationMs / 60000);
  
  return {
    workflowId: tree.id,
    workflowName: tree.name,
    sessionId: session.sessionId,
    summaryText: summary.text,
    stepsCompleted: session.completedNodes.length,
    decisionsCount: Object.keys(session.decisions).length,
    duration: durationMin < 60 ? `${durationMin}m` : `${Math.round(durationMin / 60)}h ${durationMin % 60}m`,
    agentsUsed: uniqueAgents.size,
    outcomes: summary.outcomes.map(text => ({ text })),
    recommendations: summary.recommendations,
    artifacts: summary.artifacts.map(a => ({
      ...a,
      iconUrl: `/icons/${a.type.toLowerCase()}-file.svg`,
    })),
    webAppUrl: baseUrl,
  };
}

/**
 * Format card data for Copilot Studio response
 */
export function formatForCopilotStudio(
  templateId: string,
  data: Record<string, unknown>
): Record<string, unknown> {
  return {
    type: 'AdaptiveCard',
    templateId,
    data,
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
  };
}

export default {
  CARD_TEMPLATES,
  AGENT_CONFIG,
  generateProgressBarSvg,
  calculateProgress,
  getCurrentStep,
  getTotalSteps,
  buildWorkflowSelectorData,
  buildWorkflowProgressData,
  buildDecisionNodeData,
  buildActionNodeData,
  buildGateApprovalData,
  buildWorkflowCompleteData,
  formatForCopilotStudio,
};
