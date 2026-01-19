/**
 * useTreeNavigation Hook
 * Keyboard and gesture navigation for decision trees
 */

import { useCallback, useEffect } from 'react';
import type { NavigationAction, TreeNode, DecisionTree } from '../types';

interface UseTreeNavigationOptions {
  tree: DecisionTree;
  currentNodeId: string;
  enabled?: boolean;
  onNavigate: (action: NavigationAction) => void;
  onNodeFocus?: (node: TreeNode) => void;
}

export function useTreeNavigation({
  tree,
  currentNodeId,
  enabled = true,
  onNavigate,
  onNodeFocus,
}: UseTreeNavigationOptions) {
  // Find adjacent nodes for navigation
  const findAdjacentNodes = useCallback(() => {
    const currentNode = tree.nodes.find(n => n.id === currentNodeId);
    if (!currentNode) return { next: null, prev: null, siblings: [] };

    // Find outgoing edges (next nodes)
    const outgoingEdges = tree.edges.filter(e => e.source === currentNodeId);
    const nextNodes = outgoingEdges.map(e => tree.nodes.find(n => n.id === e.target));

    // Find incoming edges (previous nodes)
    const incomingEdges = tree.edges.filter(e => e.target === currentNodeId);
    const prevNodes = incomingEdges.map(e => tree.nodes.find(n => n.id === e.source));

    return {
      next: nextNodes[0] || null,
      prev: prevNodes[0] || null,
      siblings: nextNodes.slice(1),
    };
  }, [tree, currentNodeId]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const { next, prev, siblings } = findAdjacentNodes();

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          if (next) {
            onNavigate({ type: 'jump', targetNodeId: next.id });
            onNodeFocus?.(next);
          }
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          if (prev) {
            onNavigate({ type: 'jump', targetNodeId: prev.id });
            onNodeFocus?.(prev);
          }
          break;

        case 'Tab':
          event.preventDefault();
          // Cycle through sibling nodes
          if (siblings.length > 0) {
            const sibling = siblings[0];
            if (sibling) {
              onNavigate({ type: 'jump', targetNodeId: sibling.id });
              onNodeFocus?.(sibling);
            }
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          const currentNode = tree.nodes.find(n => n.id === currentNodeId);
          if (currentNode?.type === 'action') {
            onNavigate({ type: 'next' });
          }
          break;

        case 'Backspace':
          event.preventDefault();
          onNavigate({ type: 'back' });
          break;

        case 'Home':
          event.preventDefault();
          const startNode = tree.nodes.find(n => n.type === 'start');
          if (startNode) {
            onNavigate({ type: 'jump', targetNodeId: startNode.id });
            onNodeFocus?.(startNode);
          }
          break;

        case 'End':
          event.preventDefault();
          const endNode = tree.nodes.find(n => n.type === 'end');
          if (endNode) {
            onNavigate({ type: 'jump', targetNodeId: endNode.id });
            onNodeFocus?.(endNode);
          }
          break;

        case 'Escape':
          event.preventDefault();
          // Could be used to close panels or deselect
          break;
      }
    },
    [enabled, findAdjacentNodes, onNavigate, onNodeFocus, tree.nodes, currentNodeId]
  );

  // Attach keyboard listener
  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    goNext: () => {
      const { next } = findAdjacentNodes();
      if (next) onNavigate({ type: 'jump', targetNodeId: next.id });
    },
    goPrev: () => {
      const { prev } = findAdjacentNodes();
      if (prev) onNavigate({ type: 'jump', targetNodeId: prev.id });
    },
    goToStart: () => {
      const startNode = tree.nodes.find(n => n.type === 'start');
      if (startNode) onNavigate({ type: 'jump', targetNodeId: startNode.id });
    },
    goToEnd: () => {
      const endNode = tree.nodes.find(n => n.type === 'end');
      if (endNode) onNavigate({ type: 'jump', targetNodeId: endNode.id });
    },
    reset: () => onNavigate({ type: 'reset' }),
  };
}

export default useTreeNavigation;
