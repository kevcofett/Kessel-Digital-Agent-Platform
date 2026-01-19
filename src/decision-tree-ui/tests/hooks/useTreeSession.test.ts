import { renderHook, act } from '@testing-library/react';
import { useTreeSession } from '../../src/hooks/useTreeSession';
import { createTree, createNode, createEdge, createDecisionOption } from '../../src/utils/treeBuilder';

// Mock the tree for testing
const mockTree = createTree({
  id: 'test-tree',
  name: 'Test Tree',
  description: 'A test tree for session testing',
  domain: 'MPA',
  startNodeId: 'start',
  nodes: [
    createNode({ id: 'start', type: 'start', label: 'Start' }),
    createNode({
      id: 'decision-1',
      type: 'decision',
      label: 'First Decision',
      options: [
        createDecisionOption('yes', 'Yes', 'action-1'),
        createDecisionOption('no', 'No', 'end'),
      ],
    }),
    createNode({ id: 'action-1', type: 'action', label: 'Action', agent: 'ANL' }),
    createNode({ id: 'end', type: 'end', label: 'End' }),
  ],
  edges: [
    createEdge({ source: 'start', target: 'decision-1' }),
    createEdge({ source: 'decision-1', target: 'action-1', label: 'Yes' }),
    createEdge({ source: 'decision-1', target: 'end', label: 'No' }),
    createEdge({ source: 'action-1', target: 'end' }),
  ],
});

describe('useTreeSession', () => {
  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      expect(result.current.session).toBeDefined();
      expect(result.current.session.treeId).toBe('test-tree');
      expect(result.current.session.status).toBe('active');
    });

    it('should start at the start node', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      expect(result.current.session.currentNodeId).toBe('start');
    });

    it('should initialize visited nodes with start', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      expect(result.current.session.visitedNodes).toContain('start');
    });

    it('should initialize with empty decisions', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      expect(result.current.session.decisions).toHaveLength(0);
    });

    it('should accept initial context', () => {
      const initialContext = { userId: 'user-123', accountId: 'acc-456' };
      const { result } = renderHook(() => useTreeSession(mockTree, { initialContext }));

      expect(result.current.session.context).toEqual(initialContext);
    });
  });

  describe('navigation', () => {
    it('should move to next node', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.moveToNode('decision-1');
      });

      expect(result.current.session.currentNodeId).toBe('decision-1');
      expect(result.current.session.visitedNodes).toContain('decision-1');
    });

    it('should record decision when making choice', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.moveToNode('decision-1');
      });

      act(() => {
        result.current.makeDecision('yes', 'action-1');
      });

      expect(result.current.session.decisions).toHaveLength(1);
      expect(result.current.session.decisions[0].nodeId).toBe('decision-1');
      expect(result.current.session.decisions[0].optionId).toBe('yes');
    });

    it('should update current node after decision', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.moveToNode('decision-1');
        result.current.makeDecision('yes', 'action-1');
      });

      expect(result.current.session.currentNodeId).toBe('action-1');
    });

    it('should not allow moving to nonexistent node', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.moveToNode('nonexistent');
      });

      expect(result.current.session.currentNodeId).toBe('start');
      expect(result.current.error).toBeDefined();
    });
  });

  describe('session state', () => {
    it('should mark session as completed when reaching end node', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.moveToNode('decision-1');
        result.current.makeDecision('no', 'end');
      });

      expect(result.current.session.status).toBe('completed');
      expect(result.current.session.completedAt).toBeDefined();
    });

    it('should track last activity timestamp', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));
      const initialActivity = result.current.session.lastActivityAt;

      act(() => {
        result.current.moveToNode('decision-1');
      });

      expect(result.current.session.lastActivityAt).not.toBe(initialActivity);
    });

    it('should allow pausing session', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.pauseSession();
      });

      expect(result.current.session.status).toBe('paused');
    });

    it('should allow resuming session', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.pauseSession();
      });

      act(() => {
        result.current.resumeSession();
      });

      expect(result.current.session.status).toBe('active');
    });
  });

  describe('context management', () => {
    it('should update context', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.updateContext({ newField: 'value' });
      });

      expect(result.current.session.context.newField).toBe('value');
    });

    it('should merge context rather than replace', () => {
      const initialContext = { existingField: 'existing' };
      const { result } = renderHook(() => useTreeSession(mockTree, { initialContext }));

      act(() => {
        result.current.updateContext({ newField: 'new' });
      });

      expect(result.current.session.context.existingField).toBe('existing');
      expect(result.current.session.context.newField).toBe('new');
    });
  });

  describe('history', () => {
    it('should allow going back in history', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.moveToNode('decision-1');
        result.current.makeDecision('yes', 'action-1');
      });

      act(() => {
        result.current.goBack();
      });

      expect(result.current.session.currentNodeId).toBe('decision-1');
    });

    it('should not go back past start node', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.goBack();
      });

      expect(result.current.session.currentNodeId).toBe('start');
    });

    it('should check if can go back', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      expect(result.current.canGoBack).toBe(false);

      act(() => {
        result.current.moveToNode('decision-1');
      });

      expect(result.current.canGoBack).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset session to initial state', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.moveToNode('decision-1');
        result.current.makeDecision('yes', 'action-1');
      });

      act(() => {
        result.current.resetSession();
      });

      expect(result.current.session.currentNodeId).toBe('start');
      expect(result.current.session.visitedNodes).toHaveLength(1);
      expect(result.current.session.decisions).toHaveLength(0);
    });

    it('should generate new session id on reset', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));
      const originalId = result.current.session.id;

      act(() => {
        result.current.resetSession();
      });

      expect(result.current.session.id).not.toBe(originalId);
    });
  });

  describe('current node helpers', () => {
    it('should return current node', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      expect(result.current.currentNode?.id).toBe('start');
      expect(result.current.currentNode?.type).toBe('start');
    });

    it('should check if current node is decision', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      expect(result.current.isDecisionNode).toBe(false);

      act(() => {
        result.current.moveToNode('decision-1');
      });

      expect(result.current.isDecisionNode).toBe(true);
    });

    it('should get available options for decision node', () => {
      const { result } = renderHook(() => useTreeSession(mockTree));

      act(() => {
        result.current.moveToNode('decision-1');
      });

      expect(result.current.availableOptions).toHaveLength(2);
      expect(result.current.availableOptions[0].id).toBe('yes');
    });
  });
});
