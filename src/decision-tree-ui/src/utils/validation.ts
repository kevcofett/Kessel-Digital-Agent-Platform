/**
 * Tree Validation Utilities
 */

import { DecisionTree, TreeNode, TreeSession, TreeEdge } from '../types';

interface ValidationError {
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
  field?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function validateTree(tree: DecisionTree): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!tree.id) {
    errors.push({ code: 'MISSING_ID', message: 'Tree must have an id' });
  }

  if (!tree.name) {
    errors.push({ code: 'MISSING_NAME', message: 'Tree must have a name' });
  }

  if (!tree.nodes || tree.nodes.length === 0) {
    errors.push({ code: 'NO_NODES', message: 'Tree must have at least one node' });
  }

  if (!tree.startNodeId) {
    errors.push({ code: 'MISSING_START', message: 'Tree must have a startNodeId' });
  }

  const nodeIds = new Set(tree.nodes.map((n) => n.id));

  if (tree.startNodeId && !nodeIds.has(tree.startNodeId)) {
    errors.push({
      code: 'INVALID_START',
      message: 'startNodeId does not reference a valid node',
      nodeId: tree.startNodeId,
    });
  }

  const duplicateIds = tree.nodes
    .map((n) => n.id)
    .filter((id, index, arr) => arr.indexOf(id) !== index);

  duplicateIds.forEach((id) => {
    errors.push({
      code: 'DUPLICATE_NODE_ID',
      message: 'Duplicate node id: ' + id,
      nodeId: id,
    });
  });

  tree.nodes.forEach((node) => {
    const nodeErrors = validateNode(node);
    errors.push(...nodeErrors.errors);
    warnings.push(...nodeErrors.warnings);
  });

  tree.edges.forEach((edge) => {
    if (!nodeIds.has(edge.source)) {
      errors.push({
        code: 'INVALID_EDGE_SOURCE',
        message: 'Edge source does not reference a valid node',
        edgeId: edge.id,
        nodeId: edge.source,
      });
    }
    if (!nodeIds.has(edge.target)) {
      errors.push({
        code: 'INVALID_EDGE_TARGET',
        message: 'Edge target does not reference a valid node',
        edgeId: edge.id,
        nodeId: edge.target,
      });
    }
  });

  const reachable = findReachableNodes(tree);
  tree.nodes.forEach((node) => {
    if (!reachable.has(node.id)) {
      warnings.push({
        code: 'UNREACHABLE_NODE',
        message: 'Node is not reachable from start',
        nodeId: node.id,
      });
    }
  });

  const hasEnd = tree.nodes.some((n) => n.type === 'end');
  if (!hasEnd) {
    warnings.push({
      code: 'NO_END_NODE',
      message: 'Tree has no end node',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateNode(node: TreeNode): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!node.id) {
    errors.push({ code: 'MISSING_NODE_ID', message: 'Node must have an id', nodeId: node.id });
  }

  if (!node.type) {
    errors.push({ code: 'MISSING_NODE_TYPE', message: 'Node must have a type', nodeId: node.id });
  }

  if (!node.label) {
    errors.push({ code: 'MISSING_NODE_LABEL', message: 'Node must have a label', nodeId: node.id });
  }

  if (node.type === 'decision') {
    if (!node.options || node.options.length === 0) {
      errors.push({
        code: 'DECISION_NO_OPTIONS',
        message: 'Decision node must have options',
        nodeId: node.id,
      });
    } else {
      node.options.forEach((option, index) => {
        if (!option.id) {
          errors.push({
            code: 'OPTION_MISSING_ID',
            message: 'Option ' + index + ' missing id',
            nodeId: node.id,
          });
        }
        if (!option.nextNodeId) {
          errors.push({
            code: 'OPTION_MISSING_NEXT',
            message: 'Option ' + option.id + ' missing nextNodeId',
            nodeId: node.id,
          });
        }
      });
    }
  }

  if (node.type === 'action' && !node.agent) {
    warnings.push({
      code: 'ACTION_NO_AGENT',
      message: 'Action node has no agent specified',
      nodeId: node.id,
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateSession(session: TreeSession, tree: DecisionTree): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!session.id) {
    errors.push({ code: 'MISSING_SESSION_ID', message: 'Session must have an id' });
  }

  if (session.treeId !== tree.id) {
    errors.push({
      code: 'TREE_MISMATCH',
      message: 'Session treeId does not match tree id',
    });
  }

  const nodeIds = new Set(tree.nodes.map((n) => n.id));

  if (!nodeIds.has(session.currentNodeId)) {
    errors.push({
      code: 'INVALID_CURRENT_NODE',
      message: 'currentNodeId does not reference a valid node',
      nodeId: session.currentNodeId,
    });
  }

  session.visitedNodes.forEach((nodeId) => {
    if (!nodeIds.has(nodeId)) {
      warnings.push({
        code: 'INVALID_VISITED_NODE',
        message: 'Visited node does not exist in tree',
        nodeId,
      });
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

function findReachableNodes(tree: DecisionTree): Set<string> {
  const reachable = new Set<string>();
  const queue = [tree.startNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (reachable.has(nodeId)) continue;
    reachable.add(nodeId);

    tree.edges
      .filter((e) => e.source === nodeId)
      .forEach((e) => queue.push(e.target));
  }

  return reachable;
}
