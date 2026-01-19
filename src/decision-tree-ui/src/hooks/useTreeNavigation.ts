/**
 * Tree Navigation Hook with Keyboard Support
 */

import { useState, useCallback, useEffect } from 'react';
import { DecisionTree, TreeNavigationState } from '../types';

interface UseTreeNavigationOptions {
  tree: DecisionTree;
  initialNodeId?: string;
  enableKeyboard?: boolean;
  onNavigate?: (nodeId: string) => void;
}

interface UseTreeNavigationReturn {
  currentNodeId: string;
  navigationState: TreeNavigationState;
  goBack: () => void;
  goForward: () => void;
  goToNode: (nodeId: string) => void;
  goToStart: () => void;
  getAdjacentNodes: () => { parents: string[]; children: string[] };
}

export function useTreeNavigation(options: UseTreeNavigationOptions): UseTreeNavigationReturn {
  const { tree, initialNodeId, enableKeyboard = true, onNavigate } = options;

  const startNodeId = initialNodeId || tree.startNodeId;

  const [history, setHistory] = useState<string[]>([startNodeId]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentNodeId = history[historyIndex];

  const navigationState: TreeNavigationState = {
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < history.length - 1,
    history,
    historyIndex,
  };

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onNavigate?.(history[newIndex]);
    }
  }, [historyIndex, history, onNavigate]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onNavigate?.(history[newIndex]);
    }
  }, [historyIndex, history, onNavigate]);

  const goToNode = useCallback(
    (nodeId: string) => {
      const nodeExists = tree.nodes.some((n) => n.id === nodeId);
      if (!nodeExists) return;

      if (nodeId === currentNodeId) return;

      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(nodeId);
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
      onNavigate?.(nodeId);
    },
    [tree.nodes, currentNodeId, historyIndex, onNavigate]
  );

  const goToStart = useCallback(() => {
    goToNode(tree.startNodeId);
  }, [tree.startNodeId, goToNode]);

  const getAdjacentNodes = useCallback(() => {
    const parents: string[] = [];
    const children: string[] = [];

    tree.edges.forEach((edge) => {
      if (edge.target === currentNodeId) {
        parents.push(edge.source);
      }
      if (edge.source === currentNodeId) {
        children.push(edge.target);
      }
    });

    return { parents, children };
  }, [tree.edges, currentNodeId]);

  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
        case 'Backspace':
          if (navigationState.canGoBack) {
            event.preventDefault();
            goBack();
          }
          break;
        case 'ArrowRight':
          if (navigationState.canGoForward) {
            event.preventDefault();
            goForward();
          }
          break;
        case 'Home':
          event.preventDefault();
          goToStart();
          break;
        case 'ArrowUp': {
          event.preventDefault();
          const { parents } = getAdjacentNodes();
          if (parents.length > 0) {
            goToNode(parents[0]);
          }
          break;
        }
        case 'ArrowDown': {
          event.preventDefault();
          const { children } = getAdjacentNodes();
          if (children.length > 0) {
            goToNode(children[0]);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, navigationState, goBack, goForward, goToStart, getAdjacentNodes, goToNode]);

  return {
    currentNodeId,
    navigationState,
    goBack,
    goForward,
    goToNode,
    goToStart,
    getAdjacentNodes,
  };
}

export default useTreeNavigation;
