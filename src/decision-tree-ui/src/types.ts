/**
 * Decision Tree Type Definitions
 */

export type NodeType = 'start' | 'decision' | 'action' | 'gate' | 'merge' | 'end';

export interface TreeNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  agent?: string;
  capability?: string;
  options?: DecisionOption[];
  validation?: ValidationRule[];
  metadata?: Record<string, unknown>;
}

export interface DecisionOption {
  id: string;
  label: string;
  description?: string;
  nextNodeId: string;
  condition?: string;
  isDefault?: boolean;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: string | number;
  message: string;
}

export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  animated?: boolean;
}

export interface DecisionTree {
  id: string;
  name: string;
  description: string;
  version: string;
  domain: 'MPA' | 'CA';
  nodes: TreeNode[];
  edges: TreeEdge[];
  startNodeId: string;
  metadata?: {
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
  };
}

export interface TreeSession {
  id: string;
  treeId: string;
  userId: string;
  currentNodeId: string;
  visitedNodes: string[];
  decisions: SessionDecision[];
  startedAt: string;
  lastActivityAt: string;
  status: 'active' | 'completed' | 'abandoned';
  context: Record<string, unknown>;
}

export interface SessionDecision {
  nodeId: string;
  optionId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TreeViewConfig {
  showProgress?: boolean;
  showMinimap?: boolean;
  showDetailPanel?: boolean;
  theme?: 'light' | 'dark';
  layout?: 'vertical' | 'horizontal';
  fitView?: boolean;
  zoomOnSelect?: boolean;
  animateTransitions?: boolean;
}

export interface NodeStyles {
  start: { background: string; border: string; icon: string };
  decision: { background: string; border: string; icon: string };
  action: { background: string; border: string; icon: string };
  gate: { background: string; border: string; icon: string };
  merge: { background: string; border: string; icon: string };
  end: { background: string; border: string; icon: string };
}

export const DEFAULT_NODE_STYLES: NodeStyles = {
  start: { background: '#10b981', border: '#059669', icon: 'play' },
  decision: { background: '#f59e0b', border: '#d97706', icon: 'question' },
  action: { background: '#3b82f6', border: '#2563eb', icon: 'cog' },
  gate: { background: '#8b5cf6', border: '#7c3aed', icon: 'shield' },
  merge: { background: '#6b7280', border: '#4b5563', icon: 'merge' },
  end: { background: '#ef4444', border: '#dc2626', icon: 'flag' },
};

export interface TreeNavigationState {
  canGoBack: boolean;
  canGoForward: boolean;
  history: string[];
  historyIndex: number;
}

export interface TreeProgress {
  totalNodes: number;
  visitedNodes: number;
  percentage: number;
  remainingNodes: number;
  estimatedCompletion?: number;
}

export type TreeEventType = 
  | 'node:enter'
  | 'node:exit'
  | 'decision:made'
  | 'action:started'
  | 'action:completed'
  | 'gate:passed'
  | 'gate:failed'
  | 'tree:started'
  | 'tree:completed'
  | 'tree:abandoned';

export interface TreeEvent {
  type: TreeEventType;
  nodeId?: string;
  optionId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type TreeEventHandler = (event: TreeEvent) => void;
