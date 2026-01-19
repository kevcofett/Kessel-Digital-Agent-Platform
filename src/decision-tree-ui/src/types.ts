/**
 * Decision Tree Type Definitions
 * Kessel Digital Agent Platform
 */

/**
 * Node types in the decision tree
 */
export type NodeType = 
  | 'start'      // Entry point
  | 'decision'   // User choice point
  | 'action'     // Agent action execution
  | 'gate'       // Validation checkpoint
  | 'merge'      // Path convergence
  | 'end';       // Terminal state

/**
 * Node status for visual feedback
 */
export type NodeStatus = 
  | 'pending'    // Not yet reached
  | 'active'     // Currently selected
  | 'completed'  // Successfully completed
  | 'blocked'    // Cannot proceed
  | 'skipped';   // Bypassed

/**
 * Edge types for connections
 */
export type EdgeType = 
  | 'default'    // Standard path
  | 'conditional'// Based on condition
  | 'optional'   // Can be skipped
  | 'loop';      // Returns to earlier node

/**
 * Decision tree node definition
 */
export interface TreeNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  status: NodeStatus;
  position: { x: number; y: number };
  data: {
    /** Agent that handles this node */
    agent?: string;
    /** Capability to invoke */
    capability?: string;
    /** Validation rules for gates */
    validationRules?: ValidationRule[];
    /** Options for decision nodes */
    options?: DecisionOption[];
    /** Time estimate in minutes */
    timeEstimate?: number;
    /** Help text for users */
    helpText?: string;
    /** Prerequisites */
    prerequisites?: string[];
    /** Custom metadata */
    metadata?: Record<string, unknown>;
  };
}

/**
 * Validation rule for gate nodes
 */
export interface ValidationRule {
  id: string;
  field: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'exists';
  value: unknown;
  message: string;
}

/**
 * Option for decision nodes
 */
export interface DecisionOption {
  id: string;
  label: string;
  description?: string;
  targetNodeId: string;
  condition?: string;
  isDefault?: boolean;
}

/**
 * Edge definition connecting nodes
 */
export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  animated?: boolean;
  data?: {
    condition?: string;
    probability?: number;
  };
}

/**
 * Complete decision tree definition
 */
export interface DecisionTree {
  id: string;
  name: string;
  description?: string;
  version: string;
  agent: string;
  workflow: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
  metadata?: {
    createdAt: string;
    updatedAt: string;
    author?: string;
    tags?: string[];
  };
}

/**
 * Tree session state (user's progress)
 */
export interface TreeSession {
  id: string;
  treeId: string;
  userId: string;
  currentNodeId: string;
  visitedNodes: string[];
  completedNodes: string[];
  decisions: Record<string, string>;
  data: Record<string, unknown>;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * Navigation action
 */
export interface NavigationAction {
  type: 'next' | 'back' | 'jump' | 'reset';
  targetNodeId?: string;
  data?: Record<string, unknown>;
}

/**
 * Tree event for callbacks
 */
export interface TreeEvent {
  type: 'nodeSelect' | 'nodeComplete' | 'decisionMade' | 'gateValidated' | 'treeComplete' | 'error';
  nodeId: string;
  data?: unknown;
  timestamp: string;
}

/**
 * Tree configuration options
 */
export interface TreeConfig {
  /** Allow skipping optional nodes */
  allowSkip?: boolean;
  /** Show time estimates */
  showTimeEstimates?: boolean;
  /** Enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Animation speed (ms) */
  animationDuration?: number;
  /** Theme */
  theme?: 'light' | 'dark' | 'system';
  /** Zoom levels */
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
  /** Show minimap */
  showMinimap?: boolean;
  /** Show progress bar */
  showProgress?: boolean;
}

/**
 * Viewport state
 */
export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Tree component props
 */
export interface DecisionTreeProps {
  tree: DecisionTree;
  session?: TreeSession;
  config?: TreeConfig;
  onNodeClick?: (node: TreeNode) => void;
  onDecision?: (nodeId: string, optionId: string) => void;
  onNavigate?: (action: NavigationAction) => void;
  onEvent?: (event: TreeEvent) => void;
  className?: string;
}
