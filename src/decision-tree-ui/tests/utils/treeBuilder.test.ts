import { createTree, createNode, createEdge, createDecisionOption, createValidationRule, autoLayout } from '../../src/utils/treeBuilder';

describe('treeBuilder utilities', () => {
  describe('createNode', () => {
    it('should create a start node', () => {
      const node = createNode({
        id: 'start',
        type: 'start',
        label: 'Start Node',
      });

      expect(node.id).toBe('start');
      expect(node.type).toBe('start');
      expect(node.label).toBe('Start Node');
    });

    it('should create a decision node with options', () => {
      const node = createNode({
        id: 'decision-1',
        type: 'decision',
        label: 'Make Decision',
        options: [
          createDecisionOption('yes', 'Yes', 'target-yes'),
          createDecisionOption('no', 'No', 'target-no'),
        ],
      });

      expect(node.type).toBe('decision');
      expect(node.options).toHaveLength(2);
      expect(node.options![0].id).toBe('yes');
      expect(node.options![0].label).toBe('Yes');
      expect(node.options![0].nextNodeId).toBe('target-yes');
    });

    it('should create an action node with agent', () => {
      const node = createNode({
        id: 'action-1',
        type: 'action',
        label: 'Perform Action',
        agent: 'ANL',
        capability: 'budget-optimization',
      });

      expect(node.agent).toBe('ANL');
      expect(node.capability).toBe('budget-optimization');
    });

    it('should create a gate node', () => {
      const node = createNode({
        id: 'gate-1',
        type: 'gate',
        label: 'Approval Gate',
        description: 'Requires human approval',
      });

      expect(node.type).toBe('gate');
      expect(node.description).toBe('Requires human approval');
    });

    it('should create an end node', () => {
      const node = createNode({
        id: 'end',
        type: 'end',
        label: 'Workflow Complete',
      });

      expect(node.type).toBe('end');
    });
  });

  describe('createEdge', () => {
    it('should create a simple edge', () => {
      const edge = createEdge({
        source: 'node-a',
        target: 'node-b',
      });

      expect(edge.source).toBe('node-a');
      expect(edge.target).toBe('node-b');
      expect(edge.id).toBeDefined();
    });

    it('should create an edge with label', () => {
      const edge = createEdge({
        source: 'decision',
        target: 'action',
        label: 'Yes',
      });

      expect(edge.label).toBe('Yes');
    });

    it('should create an edge with custom id', () => {
      const edge = createEdge({
        id: 'custom-edge-id',
        source: 'a',
        target: 'b',
      });

      expect(edge.id).toBe('custom-edge-id');
    });

    it('should create an animated edge', () => {
      const edge = createEdge({
        source: 'a',
        target: 'b',
        animated: true,
      });

      expect(edge.animated).toBe(true);
    });
  });

  describe('createDecisionOption', () => {
    it('should create a basic option', () => {
      const option = createDecisionOption('opt-1', 'Option 1', 'next-node');

      expect(option.id).toBe('opt-1');
      expect(option.label).toBe('Option 1');
      expect(option.nextNodeId).toBe('next-node');
    });

    it('should create an option with description', () => {
      const option = createDecisionOption('opt-1', 'Option 1', 'next-node', {
        description: 'This is option 1',
      });

      expect(option.description).toBe('This is option 1');
    });

    it('should create a default option', () => {
      const option = createDecisionOption('default', 'Default', 'fallback', {
        isDefault: true,
      });

      expect(option.isDefault).toBe(true);
    });
  });

  describe('createValidationRule', () => {
    it('should create a required rule', () => {
      const rule = createValidationRule('email', 'required', 'Email is required');

      expect(rule.field).toBe('email');
      expect(rule.rule).toBe('required');
      expect(rule.message).toBe('Email is required');
    });

    it('should create a minLength rule', () => {
      const rule = createValidationRule('password', 'minLength', 'Password must be at least 8 characters', 8);

      expect(rule.rule).toBe('minLength');
      expect(rule.value).toBe(8);
    });
  });

  describe('createTree', () => {
    it('should create a valid tree structure', () => {
      const tree = createTree({
        id: 'test-tree',
        name: 'Test Tree',
        description: 'A test tree',
        version: '1.0.0',
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

      expect(tree.id).toBe('test-tree');
      expect(tree.name).toBe('Test Tree');
      expect(tree.nodes).toHaveLength(2);
      expect(tree.edges).toHaveLength(1);
      expect(tree.startNodeId).toBe('start');
    });

    it('should set metadata timestamps', () => {
      const tree = createTree({
        id: 'test-tree',
        name: 'Test Tree',
        description: 'A test tree',
        domain: 'CA',
        startNodeId: 'start',
        nodes: [createNode({ id: 'start', type: 'start', label: 'Start' })],
        edges: [],
      });

      expect(tree.metadata?.createdAt).toBeDefined();
      expect(tree.metadata?.updatedAt).toBeDefined();
    });

    it('should use default version', () => {
      const tree = createTree({
        id: 'test-tree',
        name: 'Test Tree',
        description: 'A test tree',
        domain: 'MPA',
        startNodeId: 'start',
        nodes: [createNode({ id: 'start', type: 'start', label: 'Start' })],
        edges: [],
      });

      expect(tree.version).toBe('1.0.0');
    });
  });

  describe('autoLayout', () => {
    it('should assign positions to nodes', () => {
      const tree = createTree({
        id: 'test-tree',
        name: 'Test Tree',
        description: 'A test tree',
        domain: 'MPA',
        startNodeId: 'start',
        nodes: [
          createNode({ id: 'start', type: 'start', label: 'Start' }),
          createNode({ id: 'middle', type: 'action', label: 'Middle' }),
          createNode({ id: 'end', type: 'end', label: 'End' }),
        ],
        edges: [
          createEdge({ source: 'start', target: 'middle' }),
          createEdge({ source: 'middle', target: 'end' }),
        ],
      });

      const positions = autoLayout(tree);

      expect(positions).toHaveLength(3);
      positions.forEach(pos => {
        expect(pos.id).toBeDefined();
        expect(typeof pos.x).toBe('number');
        expect(typeof pos.y).toBe('number');
      });
    });
  });
});
