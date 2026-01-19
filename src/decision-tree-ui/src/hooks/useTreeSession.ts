/**
 * Tree Session State Management Hook
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  DecisionTree,
  TreeSession,
  SessionDecision,
  TreeEvent,
  TreeEventHandler,
  TreeEventType,
} from '../types';

interface UseTreeSessionOptions {
  tree: DecisionTree;
  userId: string;
  initialContext?: Record<string, unknown>;
  onEvent?: TreeEventHandler;
  autoSave?: boolean;
  storageKey?: string;
}

interface UseTreeSessionReturn {
  session: TreeSession;
  currentNode: ReturnType<typeof findCurrentNode>;
  makeDecision: (optionId: string) => void;
  goToNode: (nodeId: string) => void;
  resetSession: () => void;
  completeSession: () => void;
  abandonSession: () => void;
  updateContext: (updates: Record<string, unknown>) => void;
  isComplete: boolean;
  canNavigateTo: (nodeId: string) => boolean;
}

function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function findCurrentNode(tree: DecisionTree, nodeId: string) {
  return tree.nodes.find((n) => n.id === nodeId);
}

function createInitialSession(
  tree: DecisionTree,
  userId: string,
  context: Record<string, unknown> = {}
): TreeSession {
  const now = new Date().toISOString();
  return {
    id: generateSessionId(),
    treeId: tree.id,
    userId,
    currentNodeId: tree.startNodeId,
    visitedNodes: [tree.startNodeId],
    decisions: [],
    startedAt: now,
    lastActivityAt: now,
    status: 'active',
    context,
  };
}

export function useTreeSession(options: UseTreeSessionOptions): UseTreeSessionReturn {
  const { tree, userId, initialContext = {}, onEvent, autoSave = false, storageKey } = options;

  const [session, setSession] = useState<TreeSession>(() => {
    if (autoSave && storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as TreeSession;
          if (parsed.treeId === tree.id && parsed.status === 'active') {
            return parsed;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
    return createInitialSession(tree, userId, initialContext);
  });

  const eventHandlerRef = useRef(onEvent);
  eventHandlerRef.current = onEvent;

  const emitEvent = useCallback((type: TreeEventType, nodeId?: string, optionId?: string) => {
    if (eventHandlerRef.current) {
      const event: TreeEvent = {
        type,
        nodeId,
        optionId,
        timestamp: new Date().toISOString(),
      };
      eventHandlerRef.current(event);
    }
  }, []);

  useEffect(() => {
    if (autoSave && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(session));
    }
  }, [session, autoSave, storageKey]);

  const currentNode = findCurrentNode(tree, session.currentNodeId);

  const isComplete = session.status === 'completed' || currentNode?.type === 'end';

  const makeDecision = useCallback(
    (optionId: string) => {
      if (!currentNode || session.status !== 'active') return;

      const option = currentNode.options?.find((o) => o.id === optionId);
      if (!option) return;

      const decision: SessionDecision = {
        nodeId: currentNode.id,
        optionId,
        timestamp: new Date().toISOString(),
      };

      emitEvent('decision:made', currentNode.id, optionId);
      emitEvent('node:exit', currentNode.id);

      setSession((prev) => {
        const nextNodeId = option.nextNodeId;
        const visitedNodes = prev.visitedNodes.includes(nextNodeId)
          ? prev.visitedNodes
          : [...prev.visitedNodes, nextNodeId];

        const nextNode = findCurrentNode(tree, nextNodeId);
        const newStatus = nextNode?.type === 'end' ? 'completed' : prev.status;

        return {
          ...prev,
          currentNodeId: nextNodeId,
          visitedNodes,
          decisions: [...prev.decisions, decision],
          lastActivityAt: new Date().toISOString(),
          status: newStatus,
        };
      });

      emitEvent('node:enter', option.nextNodeId);

      const nextNode = findCurrentNode(tree, option.nextNodeId);
      if (nextNode?.type === 'end') {
        emitEvent('tree:completed');
      }
    },
    [currentNode, session.status, tree, emitEvent]
  );

  const goToNode = useCallback(
    (nodeId: string) => {
      if (session.status !== 'active') return;

      const targetNode = findCurrentNode(tree, nodeId);
      if (!targetNode) return;

      emitEvent('node:exit', session.currentNodeId);

      setSession((prev) => {
        const visitedNodes = prev.visitedNodes.includes(nodeId)
          ? prev.visitedNodes
          : [...prev.visitedNodes, nodeId];

        return {
          ...prev,
          currentNodeId: nodeId,
          visitedNodes,
          lastActivityAt: new Date().toISOString(),
        };
      });

      emitEvent('node:enter', nodeId);
    },
    [session.status, session.currentNodeId, tree, emitEvent]
  );

  const resetSession = useCallback(() => {
    emitEvent('tree:abandoned', session.currentNodeId);
    const newSession = createInitialSession(tree, userId, initialContext);
    setSession(newSession);
    emitEvent('tree:started', tree.startNodeId);
  }, [tree, userId, initialContext, session.currentNodeId, emitEvent]);

  const completeSession = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      status: 'completed',
      lastActivityAt: new Date().toISOString(),
    }));
    emitEvent('tree:completed', session.currentNodeId);
  }, [session.currentNodeId, emitEvent]);

  const abandonSession = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      status: 'abandoned',
      lastActivityAt: new Date().toISOString(),
    }));
    emitEvent('tree:abandoned', session.currentNodeId);
  }, [session.currentNodeId, emitEvent]);

  const updateContext = useCallback((updates: Record<string, unknown>) => {
    setSession((prev) => ({
      ...prev,
      context: { ...prev.context, ...updates },
      lastActivityAt: new Date().toISOString(),
    }));
  }, []);

  const canNavigateTo = useCallback(
    (nodeId: string) => {
      return session.visitedNodes.includes(nodeId);
    },
    [session.visitedNodes]
  );

  return {
    session,
    currentNode,
    makeDecision,
    goToNode,
    resetSession,
    completeSession,
    abandonSession,
    updateContext,
    isComplete,
    canNavigateTo,
  };
}

export default useTreeSession;
