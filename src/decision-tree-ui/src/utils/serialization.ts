/**
 * Tree Serialization Utilities
 */

import type { DecisionTree, TreeSession } from '../types';

/**
 * Serialize a decision tree to JSON string
 */
export function serializeTree(tree: DecisionTree): string {
  return JSON.stringify(tree, null, 2);
}

/**
 * Deserialize a decision tree from JSON string
 */
export function deserializeTree(json: string): DecisionTree {
  const parsed = JSON.parse(json);
  
  // Validate required fields
  if (!parsed.id || !parsed.name || !parsed.nodes || !parsed.edges) {
    throw new Error('Invalid tree structure: missing required fields');
  }
  
  return parsed as DecisionTree;
}

/**
 * Serialize a tree session to JSON string
 */
export function serializeSession(session: TreeSession): string {
  return JSON.stringify(session);
}

/**
 * Deserialize a tree session from JSON string
 */
export function deserializeSession(json: string): TreeSession {
  const parsed = JSON.parse(json);
  
  if (!parsed.id || !parsed.treeId || !parsed.userId) {
    throw new Error('Invalid session structure: missing required fields');
  }
  
  return parsed as TreeSession;
}

/**
 * Export tree to portable format (includes metadata)
 */
export function exportTree(tree: DecisionTree): {
  format: string;
  version: string;
  exportedAt: string;
  tree: DecisionTree;
} {
  return {
    format: 'kdap-decision-tree',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    tree,
  };
}

/**
 * Import tree from portable format
 */
export function importTree(data: {
  format: string;
  version: string;
  tree: DecisionTree;
}): DecisionTree {
  if (data.format !== 'kdap-decision-tree') {
    throw new Error(`Unknown format: ${data.format}`);
  }
  
  return data.tree;
}
