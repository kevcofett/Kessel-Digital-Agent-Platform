/**
 * KDAP Decision Tree UI
 * Main module exports
 */

// Types
export * from './types';

// Components
export { TreeNodes, StartNode, DecisionNode, ActionNode, GateNode, MergeNode, EndNode } from './components/TreeNodes';
export { DecisionTreeView } from './components/DecisionTree';
export { DetailPanel } from './components/DetailPanel';
export { ProgressBar } from './components/ProgressBar';

// Hooks
export { useTreeSession } from './hooks/useTreeSession';
export { useTreeNavigation } from './hooks/useTreeNavigation';

// Utilities
export { createTree, createNode, createEdge, autoLayout } from './utils/treeBuilder';
export { validateTree, validateNode, validateSession } from './utils/validation';
export { serializeTree, deserializeTree, serializeSession, deserializeSession } from './utils/serialization';

// Pre-built Trees
export { MPA_WORKFLOW_TREES, getMPATree } from './trees/mpa-workflows';
export { CA_WORKFLOW_TREES, getCATree } from './trees/ca-workflows';
