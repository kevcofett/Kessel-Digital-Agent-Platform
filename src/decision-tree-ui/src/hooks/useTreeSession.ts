/**
 * useTreeSession Hook
 * Manages decision tree session state
 */

import { useState, useCallback, useEffect } from 'react';
import type { TreeSession, DecisionTree, NavigationAction } from '../types';

interface UseTreeSessionOptions {
  tree: DecisionTree;
  userId: string;
  initialSession?: TreeSession;
  onSessionChange?: (session: TreeSession) => void;
  persistKey?: string;
}

interface UseTreeSessionReturn {
  session: TreeSession;
  currentNode: string;
  visitedNodes: string[];
  completedNodes: string[];
  decisions: Record<string, string>;
  data: Record<string, unknown>;
  progress: number;
  isComplete: boolean;
  navigate: (action: NavigationAction) => void;
  makeDecision: (nodeId: string, optionId: string) => void;
  completeNode: (nodeId: string, data?: Record<string, unknown>) => void;
  setData: (key: string, value: unknown) => void;
  reset: () => void;
}

function createInitialSession(tree: DecisionTree, userId: string): TreeSession {
  const startNode = tree.nodes.find(n => n.type === 'start');
  return {
    id: crypto.randomUUID(),
    treeId: tree.id,
    userId,
    currentNodeId: startNode?.id || tree.nodes[0].id,
    visitedNodes: [startNode?.id || tree.nodes[0].id],
    completedNodes: [],
    decisions: {},
    data: {},
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function useTreeSession({
  tree,
  userId,
  initialSession,
  onSessionChange,
  persistKey,
}: UseTreeSessionOptions): UseTreeSessionReturn {
  // Load from localStorage if persistKey provided
  const loadPersistedSession = (): TreeSession | null => {
    if (!persistKey) return null;
    try {
      const stored = localStorage.getItem(persistKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.treeId === tree.id && parsed.userId === userId) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  };

  const [session, setSession] = useState<TreeSession>(() => {
    return initialSession || loadPersistedSession() || createInitialSession(tree, userId);
  });

  // Persist session changes
  useEffect(() => {
    if (persistKey) {
      localStorage.setItem(persistKey, JSON.stringify(session));
    }
    onSessionChange?.(session);
  }, [session, persistKey, onSessionChange]);

  // Find next node based on edges
  const findNextNode = useCallback(
    (fromNodeId: string, optionId?: string): string | null => {
      const edges = tree.edges.filter(e => e.source === fromNodeId);
      if (edges.length === 0) return null;

      if (optionId) {
        const targetEdge = edges.find(e => e.data?.condition === optionId);
        if (targetEdge) return targetEdge.target;
      }

      // Return default edge
      const defaultEdge = edges.find(e => !e.data?.condition) || edges[0];
      return defaultEdge?.target || null;
    },
    [tree.edges]
  );

  // Find previous node
  const findPreviousNode = useCallback(
    (fromNodeId: string): string | null => {
      const visitedIndex = session.visitedNodes.indexOf(fromNodeId);
      if (visitedIndex <= 0) return null;
      return session.visitedNodes[visitedIndex - 1];
    },
    [session.visitedNodes]
  );

  // Navigate between nodes
  const navigate = useCallback(
    (action: NavigationAction) => {
      setSession(prev => {
        let newCurrentNodeId = prev.currentNodeId;
        let newVisitedNodes = [...prev.visitedNodes];

        switch (action.type) {
          case 'next': {
            const nextNode = findNextNode(prev.currentNodeId);
            if (nextNode) {
              newCurrentNodeId = nextNode;
              if (!newVisitedNodes.includes(nextNode)) {
                newVisitedNodes.push(nextNode);
              }
            }
            break;
          }
          case 'back': {
            const prevNode = findPreviousNode(prev.currentNodeId);
            if (prevNode) {
              newCurrentNodeId = prevNode;
            }
            break;
          }
          case 'jump': {
            if (action.targetNodeId) {
              newCurrentNodeId = action.targetNodeId;
              if (!newVisitedNodes.includes(action.targetNodeId)) {
                newVisitedNodes.push(action.targetNodeId);
              }
            }
            break;
          }
          case 'reset': {
            return createInitialSession(tree, userId);
          }
        }

        return {
          ...prev,
          currentNodeId: newCurrentNodeId,
          visitedNodes: newVisitedNodes,
          data: action.data ? { ...prev.data, ...action.data } : prev.data,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [findNextNode, findPreviousNode, tree, userId]
  );

  // Make a decision at a decision node
  const makeDecision = useCallback(
    (nodeId: string, optionId: string) => {
      setSession(prev => {
        const nextNode = findNextNode(nodeId, optionId);
        const newVisitedNodes = [...prev.visitedNodes];
        if (nextNode && !newVisitedNodes.includes(nextNode)) {
          newVisitedNodes.push(nextNode);
        }

        return {
          ...prev,
          currentNodeId: nextNode || prev.currentNodeId,
          visitedNodes: newVisitedNodes,
          completedNodes: [...prev.completedNodes, nodeId],
          decisions: { ...prev.decisions, [nodeId]: optionId },
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [findNextNode]
  );

  // Mark a node as completed
  const completeNode = useCallback(
    (nodeId: string, data?: Record<string, unknown>) => {
      setSession(prev => ({
        ...prev,
        completedNodes: prev.completedNodes.includes(nodeId)
          ? prev.completedNodes
          : [...prev.completedNodes, nodeId],
        data: data ? { ...prev.data, ...data } : prev.data,
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // Set session data
  const setData = useCallback((key: string, value: unknown) => {
    setSession(prev => ({
      ...prev,
      data: { ...prev.data, [key]: value },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Reset session
  const reset = useCallback(() => {
    setSession(createInitialSession(tree, userId));
  }, [tree, userId]);

  // Calculate progress
  const actionNodes = tree.nodes.filter(n => n.type === 'action' || n.type === 'decision');
  const progress = actionNodes.length > 0
    ? Math.round((session.completedNodes.length / actionNodes.length) * 100)
    : 0;

  // Check if tree is complete
  const endNode = tree.nodes.find(n => n.type === 'end');
  const isComplete = endNode ? session.completedNodes.includes(endNode.id) : false;

  return {
    session,
    currentNode: session.currentNodeId,
    visitedNodes: session.visitedNodes,
    completedNodes: session.completedNodes,
    decisions: session.decisions,
    data: session.data,
    progress,
    isComplete,
    navigate,
    makeDecision,
    completeNode,
    setData,
    reset,
  };
}

export default useTreeSession;
