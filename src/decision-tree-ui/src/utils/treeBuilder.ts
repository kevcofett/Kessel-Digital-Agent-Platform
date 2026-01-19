/**
 * Tree Builder Utilities
 */

import { DecisionTree, TreeNode, TreeEdge, NodeType, DecisionOption, ValidationRule } from '../types';

interface CreateNodeOptions {
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

interface CreateEdgeOptions {
  id?: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  animated?: boolean;
}

interface CreateTreeOptions {
  id: string;
  name: string;
  description: string;
  version?: string;
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

let edgeCounter = 0;

export function createNode(options: CreateNodeOptions): TreeNode {
  return {
    id: options.id,
    type: options.type,
    label: options.label,
    description: options.description,
    agent: options.agent,
    capability: options.capability,
    options: options.options,
    validation: options.validation,
    metadata: options.metadata,
  };
}

export function createEdge(options: CreateEdgeOptions): TreeEdge {
  const id = options.id || 'edge_' + (++edgeCounter);
  return {
    id,
    source: options.source,
    target: options.target,
    label: options.label,
    condition: options.condition,
    animated: options.animated,
  };
}

export function createTree(options: CreateTreeOptions): DecisionTree {
  const now = new Date().toISOString();
  return {
    id: options.id,
    name: options.name,
    description: options.description,
    version: options.version || '1.0.0',
    domain: options.domain,
    nodes: options.nodes,
    edges: options.edges,
    startNodeId: options.startNodeId,
    metadata: {
      author: options.metadata?.author,
      createdAt: options.metadata?.createdAt || now,
      updatedAt: options.metadata?.updatedAt || now,
      tags: options.metadata?.tags,
    },
  };
}

interface LayoutOptions {
  direction?: 'TB' | 'LR';
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export function autoLayout(tree: DecisionTree, options: LayoutOptions = {}): NodePosition[] {
  const {
    direction = 'TB',
    nodeWidth = 200,
    nodeHeight = 60,
    horizontalSpacing = 80,
    verticalSpacing = 100,
  } = options;

  const nodeMap = new Map<string, TreeNode>();
  tree.nodes.forEach((node) => nodeMap.set(node.id, node));

  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string[]>();

  tree.nodes.forEach((node) => {
    childrenMap.set(node.id, []);
    parentMap.set(node.id, []);
  });

  tree.edges.forEach((edge) => {
    const children = childrenMap.get(edge.source) || [];
    children.push(edge.target);
    childrenMap.set(edge.source, children);

    const parents = parentMap.get(edge.target) || [];
    parents.push(edge.source);
    parentMap.set(edge.target, parents);
  });

  const levels = new Map<string, number>();
  const visited = new Set<string>();

  function assignLevel(nodeId: string, level: number) {
    if (visited.has(nodeId)) {
      const existingLevel = levels.get(nodeId) || 0;
      if (level > existingLevel) {
        levels.set(nodeId, level);
      }
      return;
    }
    visited.add(nodeId);
    levels.set(nodeId, level);

    const children = childrenMap.get(nodeId) || [];
    children.forEach((childId) => {
      assignLevel(childId, level + 1);
    });
  }

  assignLevel(tree.startNodeId, 0);

  const levelNodes = new Map<number, string[]>();
  levels.forEach((level, nodeId) => {
    const nodes = levelNodes.get(level) || [];
    nodes.push(nodeId);
    levelNodes.set(level, nodes);
  });

  const positions: NodePosition[] = [];

  levelNodes.forEach((nodeIds, level) => {
    const totalWidth = nodeIds.length * nodeWidth + (nodeIds.length - 1) * horizontalSpacing;
    const startX = -totalWidth / 2 + nodeWidth / 2;

    nodeIds.forEach((nodeId, index) => {
      if (direction === 'TB') {
        positions.push({
          id: nodeId,
          x: startX + index * (nodeWidth + horizontalSpacing),
          y: level * (nodeHeight + verticalSpacing),
        });
      } else {
        positions.push({
          id: nodeId,
          x: level * (nodeWidth + horizontalSpacing),
          y: startX + index * (nodeHeight + verticalSpacing),
        });
      }
    });
  });

  return positions;
}

export function connectNodes(sourceId: string, targetId: string, label?: string): TreeEdge {
  return createEdge({
    source: sourceId,
    target: targetId,
    label,
  });
}

export function createDecisionOption(
  id: string,
  label: string,
  nextNodeId: string,
  options?: { description?: string; condition?: string; isDefault?: boolean }
): DecisionOption {
  return {
    id,
    label,
    nextNodeId,
    description: options?.description,
    condition: options?.condition,
    isDefault: options?.isDefault,
  };
}

export function createValidationRule(
  field: string,
  rule: ValidationRule['rule'],
  message: string,
  value?: string | number
): ValidationRule {
  return { field, rule, value, message };
}
