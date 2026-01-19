/**
 * @kdap/decision-tree-ui
 * Visual Decision Tree UI components for Kessel Digital Agent Platform
 * 
 * Provides interactive workflow visualization for:
 * - MPA Media Brief Workflows (Express, Standard, Guided, Audit)
 * - CA Consulting Workflows (Framework Selection, Change Management)
 * - Custom agent workflows
 */

// Components
export * from './components';

// Types
export * from './types';

// Hooks
export { useTreeSession } from './hooks/useTreeSession';
export { useTreeNavigation } from './hooks/useTreeNavigation';

// Utilities
export { createTree, createNode, createEdge } from './utils/treeBuilder';
export { validateTree } from './utils/validation';
export { serializeTree, deserializeTree } from './utils/serialization';

// Pre-built tree definitions
export { MPA_WORKFLOW_TREES } from './trees/mpa-workflows';
export { CA_WORKFLOW_TREES } from './trees/ca-workflows';
