/**
 * Tree Builder Utilities
 * Helper functions for creating decision trees
 */

import type { DecisionTree, TreeNode, TreeEdge, NodeType, EdgeType, DecisionOption, ValidationRule } from '../types';

let nodeIdCounter = 0;
let edgeIdCounter = 0;

/**
 * Create a new tree node
 */
export function createNode(
  type: NodeType,
  label: string,
  options?: Partial<Omit<TreeNode, 'id' | 'type' | 'label'>>
): TreeNode {
  const id = options?.id || `node_${++nodeIdCounter}`;
  return {
    id,
    type,
    label,
    description: options?.description,
    status: options?.status || 'pending',
    position: options?.position || { x: 0, y: 0 },
    data: options?.data || {},
  };
}

/**
 * Create a new tree edge
 */
export function createEdge(
  source: string,
  target: string,
  options?: Partial<Omit<TreeEdge, 'id' | 'source' | 'target'>>
): TreeEdge {
  const id = options?.id || `edge_${++edgeIdCounter}`;
  return {
    id,
    source,
    target,
    type: options?.type || 'default',
    label: options?.label,
    animated: options?.animated,
    data: options?.data,
  };
}

/**
 * Create a complete decision tree
 */
export function createTree(
  name: string,
  agent: string,
  workflow: string,
  nodes: TreeNode[],
  edges: TreeEdge[],
  options?: Partial<Omit<DecisionTree, 'nodes' | 'edges' | 'name' | 'agent' | 'workflow'>>
): DecisionTree {
  return {
    id: options?.id || crypto.randomUUID(),
    name,
    description: options?.description,
    version: options?.version || '1.0.0',
    agent,
    workflow,
    nodes,
    edges,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...options?.metadata,
    },
  };
}

/**
 * Create a decision option
 */
export function createOption(
  label: string,
  targetNodeId: string,
  options?: Partial<Omit<DecisionOption, 'id' | 'label' | 'targetNodeId'>>
): DecisionOption {
  return {
    id: crypto.randomUUID(),
    label,
    targetNodeId,
    description: options?.description,
    condition: options?.condition,
    isDefault: options?.isDefault,
  };
}

/**
 * Create a validation rule
 */
export function createValidationRule(
  field: string,
  operator: ValidationRule['operator'],
  value: unknown,
  message: string
): ValidationRule {
  return {
    id: crypto.randomUUID(),
    field,
    operator,
    value,
    message,
  };
}

/**
 * Auto-layout nodes in a tree structure
 */
export function autoLayout(
  nodes: TreeNode[],
  edges: TreeEdge[],
  options: {
    horizontalSpacing?: number;
    verticalSpacing?: number;
    startX?: number;
    startY?: number;
  } = {}
): TreeNode[] {
  const {
    horizontalSpacing = 200,
    verticalSpacing = 100,
    startX = 400,
    startY = 50,
  } = options;

  // Build adjacency list
  const children: Map<string, string[]> = new Map();
  const parents: Map<string, string[]> = new Map();

  edges.forEach(edge => {
    if (!children.has(edge.source)) children.set(edge.source, []);
    children.get(edge.source)!.push(edge.target);

    if (!parents.has(edge.target)) parents.set(edge.target, []);
    parents.get(edge.target)!.push(edge.source);
  });

  // Find root nodes (no parents)
  const roots = nodes.filter(n => !parents.has(n.id) || parents.get(n.id)!.length === 0);

  // BFS to assign levels
  const levels: Map<string, number> = new Map();
  const queue: Array<{ id: string; level: number }> = roots.map(r => ({ id: r.id, level: 0 }));
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    levels.set(id, level);

    const nodeChildren = children.get(id) || [];
    nodeChildren.forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, level: level + 1 });
      }
    });
  }

  // Group nodes by level
  const levelGroups: Map<number, TreeNode[]> = new Map();
  nodes.forEach(node => {
    const level = levels.get(node.id) || 0;
    if (!levelGroups.has(level)) levelGroups.set(level, []);
    levelGroups.get(level)!.push(node);
  });

  // Assign positions
  return nodes.map(node => {
    const level = levels.get(node.id) || 0;
    const levelNodes = levelGroups.get(level) || [node];
    const indexInLevel = levelNodes.indexOf(node);
    const totalInLevel = levelNodes.length;

    const x = startX + (indexInLevel - (totalInLevel - 1) / 2) * horizontalSpacing;
    const y = startY + level * verticalSpacing;

    return {
      ...node,
      position: { x, y },
    };
  });
}

/**
 * Reset ID counters (useful for testing)
 */
export function resetCounters(): void {
  nodeIdCounter = 0;
  edgeIdCounter = 0;
}
