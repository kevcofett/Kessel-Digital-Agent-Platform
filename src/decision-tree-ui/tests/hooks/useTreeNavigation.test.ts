import { renderHook, act } from '@testing-library/react';
import { useTreeNavigation } from '../../src/hooks/useTreeNavigation';
import { createTree, createNode, createEdge, createDecisionOption } from '../../src/utils/treeBuilder';

const mockTree = createTree({
  id: 'nav-tree',
  name: 'Navigation Test Tree',
  description: 'A tree for testing navigation',
  domain: 'CA',
  startNodeId: 'start',
  nodes: [
    createNode({ id: 'start', type: 'start', label: 'Start' }),
    createNode({
      id: 'decision-1',
      type: 'decision',
      label: 'Decision 1',
      options: [
        createDecisionOption('a', 'Option A', 'action-a'),
        createDecisionOption('b', 'Option B', 'action-b'),
        createDecisionOption('c', 'Option C', 'decision-2'),
      ],
    }),
    createNode({ id: 'action-a', type: 'action', label: 'Action A', agent: 'ANL' }),
    createNode({ id: 'action-b', type: 'action', label: 'Action B', agent: 'MPA' }),
    createNode({
      id: 'decision-2',
      type: 'decision',
      label: 'Decision 2',
      options: [
        createDecisionOption('yes', 'Yes', 'end'),
        createDecisionOption('no', 'No', 'action-a'),
      ],
    }),
    createNode({ id: 'end', type: 'end', label: 'End' }),
  ],
  edges: [
    createEdge({ source: 'start', target: 'decision-1' }),
    createEdge({ source: 'decision-1', target: 'action-a', label: 'A' }),
    createEdge({ source: 'decision-1', target: 'action-b', label: 'B' }),
    createEdge({ source: 'decision-1', target: 'decision-2', label: 'C' }),
    createEdge({ source: 'action-a', target: 'end' }),
    createEdge({ source: 'action-b', target: 'end' }),
    createEdge({ source: 'decision-2', target: 'end', label: 'Yes' }),
    createEdge({ source: 'decision-2', target: 'action-a', label: 'No' }),
  ],
});

describe('useTreeNavigation', () => {
  describe('path finding', () => {
    it('should find all paths to end node', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const paths = result.current.findPathsToEnd('start');

      expect(paths.length).toBeGreaterThan(0);
      paths.forEach(path => {
        expect(path[path.length - 1]).toBe('end');
      });
    });

    it('should find shortest path between nodes', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const path = result.current.findShortestPath('start', 'end');

      expect(path).toBeDefined();
      expect(path![0]).toBe('start');
      expect(path![path!.length - 1]).toBe('end');
    });

    it('should return null for unreachable path', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const path = result.current.findShortestPath('end', 'start');

      expect(path).toBeNull();
    });
  });

  describe('node relationships', () => {
    it('should get children of a node', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const children = result.current.getChildren('decision-1');

      expect(children).toContain('action-a');
      expect(children).toContain('action-b');
      expect(children).toContain('decision-2');
    });

    it('should get parent of a node', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const parents = result.current.getParents('action-a');

      expect(parents).toContain('decision-1');
      expect(parents).toContain('decision-2');
    });

    it('should return empty array for start node parents', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const parents = result.current.getParents('start');

      expect(parents).toHaveLength(0);
    });

    it('should get siblings of a node', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const siblings = result.current.getSiblings('action-a');

      expect(siblings).toContain('action-b');
      expect(siblings).toContain('decision-2');
      expect(siblings).not.toContain('action-a');
    });
  });

  describe('reachability', () => {
    it('should check if node is reachable from start', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      expect(result.current.isReachable('end')).toBe(true);
      expect(result.current.isReachable('action-a')).toBe(true);
    });

    it('should identify unreachable nodes', () => {
      const treeWithOrphan = createTree({
        ...mockTree,
        id: 'orphan-tree',
        nodes: [
          ...mockTree.nodes,
          createNode({ id: 'orphan', type: 'action', label: 'Orphan' }),
        ],
      });

      const { result } = renderHook(() => useTreeNavigation(treeWithOrphan));

      expect(result.current.isReachable('orphan')).toBe(false);
    });

    it('should get all reachable nodes', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const reachable = result.current.getReachableNodes();

      expect(reachable).toContain('start');
      expect(reachable).toContain('end');
      expect(reachable).toContain('decision-1');
    });
  });

  describe('depth and levels', () => {
    it('should calculate node depth', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      expect(result.current.getNodeDepth('start')).toBe(0);
      expect(result.current.getNodeDepth('decision-1')).toBe(1);
    });

    it('should get nodes at a specific level', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const level0 = result.current.getNodesAtLevel(0);
      const level1 = result.current.getNodesAtLevel(1);

      expect(level0).toContain('start');
      expect(level1).toContain('decision-1');
    });

    it('should get maximum depth', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const maxDepth = result.current.getMaxDepth();

      expect(maxDepth).toBeGreaterThan(0);
    });
  });

  describe('node types', () => {
    it('should get all decision nodes', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const decisions = result.current.getNodesByType('decision');

      expect(decisions).toHaveLength(2);
      expect(decisions.map(n => n.id)).toContain('decision-1');
      expect(decisions.map(n => n.id)).toContain('decision-2');
    });

    it('should get all action nodes', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const actions = result.current.getNodesByType('action');

      expect(actions).toHaveLength(2);
    });

    it('should get nodes by agent', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const anlNodes = result.current.getNodesByAgent('ANL');
      const mpaNodes = result.current.getNodesByAgent('MPA');

      expect(anlNodes).toHaveLength(1);
      expect(mpaNodes).toHaveLength(1);
    });
  });

  describe('edge operations', () => {
    it('should get edges from a node', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const edges = result.current.getEdgesFrom('decision-1');

      expect(edges).toHaveLength(3);
    });

    it('should get edges to a node', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const edges = result.current.getEdgesTo('end');

      expect(edges.length).toBeGreaterThanOrEqual(2);
    });

    it('should get edge between two nodes', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const edge = result.current.getEdgeBetween('start', 'decision-1');

      expect(edge).toBeDefined();
      expect(edge?.source).toBe('start');
      expect(edge?.target).toBe('decision-1');
    });
  });

  describe('traversal', () => {
    it('should traverse in breadth-first order', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const visited: string[] = [];
      result.current.traverseBFS('start', nodeId => {
        visited.push(nodeId);
      });

      expect(visited[0]).toBe('start');
      expect(visited.indexOf('decision-1')).toBeLessThan(visited.indexOf('action-a'));
    });

    it('should traverse in depth-first order', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const visited: string[] = [];
      result.current.traverseDFS('start', nodeId => {
        visited.push(nodeId);
      });

      expect(visited[0]).toBe('start');
      expect(visited.length).toBeGreaterThan(0);
    });

    it('should allow stopping traversal', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const visited: string[] = [];
      result.current.traverseBFS('start', nodeId => {
        visited.push(nodeId);
        return nodeId === 'decision-1'; // Stop at decision-1
      });

      expect(visited).toContain('decision-1');
      expect(visited).not.toContain('action-a');
    });
  });

  describe('cycle detection', () => {
    it('should detect cycles', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      expect(result.current.hasCycles()).toBe(false);
    });

    it('should detect cycle when present', () => {
      const treeWithCycle = createTree({
        ...mockTree,
        id: 'cycle-tree',
        edges: [
          ...mockTree.edges,
          createEdge({ source: 'end', target: 'start' }),
        ],
      });

      const { result } = renderHook(() => useTreeNavigation(treeWithCycle));

      expect(result.current.hasCycles()).toBe(true);
    });
  });

  describe('statistics', () => {
    it('should calculate tree statistics', () => {
      const { result } = renderHook(() => useTreeNavigation(mockTree));

      const stats = result.current.getTreeStats();

      expect(stats.totalNodes).toBe(6);
      expect(stats.totalEdges).toBe(8);
      expect(stats.decisionCount).toBe(2);
      expect(stats.actionCount).toBe(2);
    });
  });
});
