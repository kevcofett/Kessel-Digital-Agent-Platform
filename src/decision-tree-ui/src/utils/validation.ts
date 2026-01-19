/**
 * Tree Validation Utilities
 */

import type { DecisionTree, TreeNode, TreeEdge } from '../types';

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  type: 'error';
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

interface ValidationWarning {
  type: 'warning';
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

/**
 * Validate a decision tree structure
 */
export function validateTree(tree: DecisionTree): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for required fields
  if (!tree.id) {
    errors.push({ type: 'error', code: 'MISSING_ID', message: 'Tree must have an id' });
  }
  if (!tree.name) {
    errors.push({ type: 'error', code: 'MISSING_NAME', message: 'Tree must have a name' });
  }
  if (!tree.nodes || tree.nodes.length === 0) {
    errors.push({ type: 'error', code: 'NO_NODES', message: 'Tree must have at least one node' });
    return { valid: false, errors, warnings };
  }

  // Build node lookup
  const nodeMap = new Map(tree.nodes.map(n => [n.id, n]));
  const nodeIds = new Set(tree.nodes.map(n => n.id));

  // Check for start node
  const startNodes = tree.nodes.filter(n => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push({ type: 'error', code: 'NO_START', message: 'Tree must have a start node' });
  } else if (startNodes.length > 1) {
    warnings.push({ type: 'warning', code: 'MULTIPLE_STARTS', message: 'Tree has multiple start nodes' });
  }

  // Check for end node
  const endNodes = tree.nodes.filter(n => n.type === 'end');
  if (endNodes.length === 0) {
    warnings.push({ type: 'warning', code: 'NO_END', message: 'Tree has no end node' });
  }

  // Check node IDs are unique
  const idSet = new Set<string>();
  tree.nodes.forEach(node => {
    if (idSet.has(node.id)) {
      errors.push({
        type: 'error',
        code: 'DUPLICATE_NODE_ID',
        message: `Duplicate node id: ${node.id}`,
        nodeId: node.id,
      });
    }
    idSet.add(node.id);
  });

  // Validate edges
  tree.edges.forEach(edge => {
    if (!nodeIds.has(edge.source)) {
      errors.push({
        type: 'error',
        code: 'INVALID_SOURCE',
        message: `Edge source not found: ${edge.source}`,
        edgeId: edge.id,
      });
    }
    if (!nodeIds.has(edge.target)) {
      errors.push({
        type: 'error',
        code: 'INVALID_TARGET',
        message: `Edge target not found: ${edge.target}`,
        edgeId: edge.id,
      });
    }
    if (edge.source === edge.target) {
      warnings.push({
        type: 'warning',
        code: 'SELF_LOOP',
        message: `Edge connects node to itself: ${edge.source}`,
        edgeId: edge.id,
      });
    }
  });

  // Check connectivity
  const reachable = new Set<string>();
  const startNode = startNodes[0];
  if (startNode) {
    const queue = [startNode.id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (reachable.has(current)) continue;
      reachable.add(current);

      tree.edges
        .filter(e => e.source === current)
        .forEach(e => queue.push(e.target));
    }

    // Check for unreachable nodes
    tree.nodes.forEach(node => {
      if (!reachable.has(node.id) && node.type !== 'start') {
        warnings.push({
          type: 'warning',
          code: 'UNREACHABLE',
          message: `Node is unreachable from start: ${node.id}`,
          nodeId: node.id,
        });
      }
    });
  }

  // Validate decision nodes have options
  tree.nodes.filter(n => n.type === 'decision').forEach(node => {
    if (!node.data.options || node.data.options.length === 0) {
      errors.push({
        type: 'error',
        code: 'NO_OPTIONS',
        message: `Decision node has no options: ${node.id}`,
        nodeId: node.id,
      });
    }
  });

  // Validate gate nodes have validation rules
  tree.nodes.filter(n => n.type === 'gate').forEach(node => {
    if (!node.data.validationRules || node.data.validationRules.length === 0) {
      warnings.push({
        type: 'warning',
        code: 'NO_RULES',
        message: `Gate node has no validation rules: ${node.id}`,
        nodeId: node.id,
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export default validateTree;
