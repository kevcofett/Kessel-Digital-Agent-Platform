/**
 * Main Decision Tree View Component
 */

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  NodeTypes,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DecisionTree, TreeSession, TreeViewConfig, TreeNode as TreeNodeType } from '../types';
import TreeNodes from './TreeNodes';
import { DetailPanel } from './DetailPanel';
import { ProgressBar } from './ProgressBar';

interface DecisionTreeViewProps {
  tree: DecisionTree;
  session?: TreeSession;
  config?: TreeViewConfig;
  onNodeClick?: (node: TreeNodeType) => void;
  onDecision?: (nodeId: string, optionId: string) => void;
  onNavigate?: (nodeId: string) => void;
}

const nodeTypes: NodeTypes = {
  start: TreeNodes.start,
  decision: TreeNodes.decision,
  action: TreeNodes.action,
  gate: TreeNodes.gate,
  merge: TreeNodes.merge,
  end: TreeNodes.end,
};

function convertToFlowNodes(
  treeNodes: TreeNodeType[],
  session?: TreeSession
): Node[] {
  return treeNodes.map((node, index) => ({
    id: node.id,
    type: node.type,
    position: { x: 250, y: index * 120 },
    data: {
      ...node,
      isActive: session?.currentNodeId === node.id,
      isVisited: session?.visitedNodes.includes(node.id),
    },
  }));
}

function convertToFlowEdges(tree: DecisionTree): Edge[] {
  return tree.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: edge.animated,
    style: { strokeWidth: 2 },
    labelStyle: { fontSize: 12 },
  }));
}

export const DecisionTreeView: React.FC<DecisionTreeViewProps> = ({
  tree,
  session,
  config = {},
  onNodeClick,
  onDecision,
  onNavigate,
}) => {
  const {
    showProgress = true,
    showMinimap = true,
    showDetailPanel = true,
    theme = 'light',
    fitView = true,
  } = config;

  const initialNodes = useMemo(
    () => convertToFlowNodes(tree.nodes, session),
    [tree.nodes, session]
  );
  const initialEdges = useMemo(() => convertToFlowEdges(tree), [tree]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNode, setSelectedNode] = React.useState<TreeNodeType | null>(null);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const treeNode = tree.nodes.find((n) => n.id === node.id);
      if (treeNode) {
        setSelectedNode(treeNode);
        onNodeClick?.(treeNode);
      }
    },
    [tree.nodes, onNodeClick]
  );

  const handleDecision = useCallback(
    (optionId: string) => {
      if (selectedNode && onDecision) {
        onDecision(selectedNode.id, optionId);
      }
    },
    [selectedNode, onDecision]
  );

  const progress = useMemo(() => {
    if (!session) return null;
    const visited = session.visitedNodes.length;
    const total = tree.nodes.length;
    return {
      totalNodes: total,
      visitedNodes: visited,
      percentage: Math.round((visited / total) * 100),
      remainingNodes: total - visited,
    };
  }, [session, tree.nodes]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1f2937' : '#f9fafb';
  const textColor = isDark ? '#f9fafb' : '#1f2937';

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showProgress && progress && (
        <ProgressBar progress={progress} theme={theme} />
      )}
      
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView={fitView}
            style={{ backgroundColor: bgColor }}
          >
            <Controls />
            {showMinimap && (
              <MiniMap
                nodeStrokeWidth={3}
                zoomable
                pannable
                style={{
                  backgroundColor: isDark ? '#374151' : '#e5e7eb',
                }}
              />
            )}
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1}
              color={isDark ? '#4b5563' : '#d1d5db'}
            />
          </ReactFlow>
        </div>

        {showDetailPanel && selectedNode && (
          <DetailPanel
            node={selectedNode}
            theme={theme}
            onDecision={handleDecision}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DecisionTreeView;
