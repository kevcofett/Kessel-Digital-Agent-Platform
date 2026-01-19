import { validateTree, validateNode, validateSession } from '../../src/utils/validation';
import { createTree, createNode, createEdge, createDecisionOption } from '../../src/utils/treeBuilder';
import { TreeSession } from '../../src/types';

describe('validation utilities', () => {
  describe('validateNode', () => {
    it('should validate a valid node', () => {
      const node = createNode({
        id: 'test-node',
        type: 'action',
        label: 'Test Node',
      });

      const result = validateNode(node);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for node without id', () => {
      const node = { type: 'action', label: 'Test' } as any;

      const result = validateNode(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_NODE_ID')).toBe(true);
    });

    it('should fail for node without type', () => {
      const node = { id: 'test', label: 'Test' } as any;

      const result = validateNode(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_NODE_TYPE')).toBe(true);
    });

    it('should fail for node without label', () => {
      const node = { id: 'test', type: 'action' } as any;

      const result = validateNode(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_NODE_LABEL')).toBe(true);
    });

    it('should fail for decision node without options', () => {
      const node = createNode({
        id: 'decision',
        type: 'decision',
        label: 'Decision',
      });

      const result = validateNode(node);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'DECISION_NO_OPTIONS')).toBe(true);
    });

    it('should validate decision node with options', () => {
      const node = createNode({
        id: 'decision',
        type: 'decision',
        label: 'Decision',
        options: [
          createDecisionOption('yes', 'Yes', 'next'),
        ],
      });

      const result = validateNode(node);

      expect(result.valid).toBe(true);
    });

    it('should warn for action node without agent', () => {
      const node = createNode({
        id: 'action',
        type: 'action',
        label: 'Action',
      });

      const result = validateNode(node);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.code === 'ACTION_NO_AGENT')).toBe(true);
    });
  });

  describe('validateTree', () => {
    it('should validate a valid tree', () => {
      const tree = createTree({
        id: 'test-tree',
        name: 'Test Tree',
        description: 'A test tree',
        domain: 'MPA',
        startNodeId: 'start',
        nodes: [
          createNode({ id: 'start', type: 'start', label: 'Start' }),
          createNode({ id: 'end', type: 'end', label: 'End' }),
        ],
        edges: [
          createEdge({ source: 'start', target: 'end' }),
        ],
      });

      const result = validateTree(tree);

      expect(result.valid).toBe(true);
    });

    it('should fail for tree without id', () => {
      const tree = {
        name: 'Test',
        nodes: [],
        edges: [],
        startNodeId: 'start',
      } as any;

      const result = validateTree(tree);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_ID')).toBe(true);
    });

    it('should fail for tree without nodes', () => {
      const tree = {
        id: 'test',
        name: 'Test',
        nodes: [],
        edges: [],
        startNodeId: 'start',
      } as any;

      const result = validateTree(tree);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'NO_NODES')).toBe(true);
    });

    it('should fail for invalid startNodeId', () => {
      const tree = createTree({
        id: 'test-tree',
        name: 'Test Tree',
        description: 'A test tree',
        domain: 'MPA',
        startNodeId: 'nonexistent',
        nodes: [
          createNode({ id: 'start', type: 'start', label: 'Start' }),
        ],
        edges: [],
      });

      const result = validateTree(tree);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_START')).toBe(true);
    });

    it('should fail for duplicate node ids', () => {
      const tree = {
        id: 'test-tree',
        name: 'Test Tree',
        description: 'A test tree',
        domain: 'MPA',
        version: '1.0.0',
        startNodeId: 'start',
        nodes: [
          createNode({ id: 'start', type: 'start', label: 'Start' }),
          createNode({ id: 'start', type: 'end', label: 'End' }),
        ],
        edges: [],
      };

      const result = validateTree(tree);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'DUPLICATE_NODE_ID')).toBe(true);
    });

    it('should fail for edge with invalid source', () => {
      const tree = createTree({
        id: 'test-tree',
        name: 'Test Tree',
        description: 'A test tree',
        domain: 'MPA',
        startNodeId: 'start',
        nodes: [
          createNode({ id: 'start', type: 'start', label: 'Start' }),
          createNode({ id: 'end', type: 'end', label: 'End' }),
        ],
        edges: [
          createEdge({ source: 'nonexistent', target: 'end' }),
        ],
      });

      const result = validateTree(tree);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_EDGE_SOURCE')).toBe(true);
    });

    it('should warn for unreachable nodes', () => {
      const tree = createTree({
        id: 'test-tree',
        name: 'Test Tree',
        description: 'A test tree',
        domain: 'MPA',
        startNodeId: 'start',
        nodes: [
          createNode({ id: 'start', type: 'start', label: 'Start' }),
          createNode({ id: 'orphan', type: 'action', label: 'Orphan' }),
          createNode({ id: 'end', type: 'end', label: 'End' }),
        ],
        edges: [
          createEdge({ source: 'start', target: 'end' }),
        ],
      });

      const result = validateTree(tree);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.code === 'UNREACHABLE_NODE' && w.nodeId === 'orphan')).toBe(true);
    });

    it('should warn for tree without end node', () => {
      const tree = createTree({
        id: 'test-tree',
        name: 'Test Tree',
        description: 'A test tree',
        domain: 'MPA',
        startNodeId: 'start',
        nodes: [
          createNode({ id: 'start', type: 'start', label: 'Start' }),
          createNode({ id: 'action', type: 'action', label: 'Action' }),
        ],
        edges: [
          createEdge({ source: 'start', target: 'action' }),
        ],
      });

      const result = validateTree(tree);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.code === 'NO_END_NODE')).toBe(true);
    });
  });

  describe('validateSession', () => {
    const tree = createTree({
      id: 'test-tree',
      name: 'Test Tree',
      description: 'A test tree',
      domain: 'MPA',
      startNodeId: 'start',
      nodes: [
        createNode({ id: 'start', type: 'start', label: 'Start' }),
        createNode({ id: 'end', type: 'end', label: 'End' }),
      ],
      edges: [
        createEdge({ source: 'start', target: 'end' }),
      ],
    });

    it('should validate a valid session', () => {
      const session: TreeSession = {
        id: 'session-1',
        treeId: 'test-tree',
        userId: 'user-1',
        currentNodeId: 'start',
        visitedNodes: ['start'],
        decisions: [],
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        status: 'active',
        context: {},
      };

      const result = validateSession(session, tree);

      expect(result.valid).toBe(true);
    });

    it('should fail for mismatched tree id', () => {
      const session: TreeSession = {
        id: 'session-1',
        treeId: 'wrong-tree',
        userId: 'user-1',
        currentNodeId: 'start',
        visitedNodes: ['start'],
        decisions: [],
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        status: 'active',
        context: {},
      };

      const result = validateSession(session, tree);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'TREE_MISMATCH')).toBe(true);
    });

    it('should fail for invalid current node', () => {
      const session: TreeSession = {
        id: 'session-1',
        treeId: 'test-tree',
        userId: 'user-1',
        currentNodeId: 'nonexistent',
        visitedNodes: ['start'],
        decisions: [],
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        status: 'active',
        context: {},
      };

      const result = validateSession(session, tree);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_CURRENT_NODE')).toBe(true);
    });
  });
});
