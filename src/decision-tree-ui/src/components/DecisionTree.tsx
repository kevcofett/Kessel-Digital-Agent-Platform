/**
 * Decision Tree Component
 * Main visualization component using React Flow
 */

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
  MarkerType,
  Panel,
} from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import 'reactflow/dist/style.css';

import { nodeTypes } from './TreeNodes';
import { DetailPanel } from './DetailPanel';
import { ProgressBar } from './ProgressBar';
import type { 
  DecisionTree, 
  DecisionTreeProps, 
  TreeNode, 
  TreeEdge,
  TreeConfig,
  TreeEvent,
  NodeStatus,
} from '../types';

const defaultConfig: TreeConfig = {
  allowSkip: false,
  showTimeEstimates: true,
  keyboardNavigation: true,
  animationDuration: 300,
  theme: 'light',
  minZoom: 0.5,
  maxZoom: 2,
  defaultZoom: 1,
  showMinimap: true,
  showProgress: true,
};

/**
 * Convert tree nodes to React Flow nodes
 */
function toFlowNodes(nodes: TreeNode[], currentNodeId?: string): Node[] {
  return nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node.data,
      label: node.label,
      description: node.description,
      status: node.id === currentNodeId ? 'active' : node.status,
      type: node.type,
    },
    draggable: false,
  }));
}

/**
 * Convert tree edges to React Flow edges
 */
function toFlowEdges(edges: TreeEdge[]): Edge[] {
  return edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type === 'conditional' ? 'smoothstep' : 'default',
    animated: edge.animated || edge.type === 'loop',
    label: edge.label,
    labelStyle: { fill: '#666', fontSize: 12 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#999',
    },
    style: {
      stroke: edge.type === 'optional' ? '#999' : '#666',
      strokeDasharray: edge.type === 'optional' ? '5,5' : undefined,
    },
  }));
}

/**
 * Calculate progress percentage
 */
function calculateProgress(nodes: TreeNode[], completedNodes: string[]): number {
  const actionNodes = nodes.filter(n => n.type === 'action' || n.type === 'decision');
  if (actionNodes.length === 0) return 0;
  const completed = actionNodes.filter(n => completedNodes.includes(n.id)).length;
  return Math.round((completed / actionNodes.length) * 100);
}

/**
 * Decision Tree Component
 */
export function DecisionTreeView({
  tree,
  session,
  config: userConfig,
  onNodeClick,
  onDecision,
  onNavigate,
  onEvent,
  className,
}: DecisionTreeProps) {
  const config = { ...defaultConfig, ...userConfig };
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // Convert tree data to React Flow format
  const flowNodes = useMemo(
    () => toFlowNodes(tree.nodes, session?.currentNodeId),
    [tree.nodes, session?.currentNodeId]
  );
  const flowEdges = useMemo(() => toFlowEdges(tree.edges), [tree.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Calculate progress
  const progress = useMemo(
    () => calculateProgress(tree.nodes, session?.completedNodes || []),
    [tree.nodes, session?.completedNodes]
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const treeNode = tree.nodes.find(n => n.id === node.id);
      if (!treeNode) return;

      setSelectedNode(treeNode);
      setShowDetailPanel(true);

      onNodeClick?.(treeNode);
      onEvent?.({
        type: 'nodeSelect',
        nodeId: node.id,
        timestamp: new Date().toISOString(),
      });
    },
    [tree.nodes, onNodeClick, onEvent]
  );

  // Handle decision selection
  const handleDecision = useCallback(
    (nodeId: string, optionId: string) => {
      onDecision?.(nodeId, optionId);
      onEvent?.({
        type: 'decisionMade',
        nodeId,
        data: { optionId },
        timestamp: new Date().toISOString(),
      });
      setShowDetailPanel(false);
    },
    [onDecision, onEvent]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!config.keyboardNavigation) return;

      switch (event.key) {
        case 'Escape':
          setShowDetailPanel(false);
          setSelectedNode(null);
          break;
        case 'Enter':
          if (selectedNode?.type === 'action') {
            onNavigate?.({ type: 'next' });
          }
          break;
      }
    },
    [config.keyboardNavigation, selectedNode, onNavigate]
  );

  return (
    <div 
      className={clsx(
        'relative w-full h-full',
        config.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
        className
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Progress Bar */}
      {config.showProgress && (
        <Panel position="top-center" className="!m-0 !p-0 w-full">
          <ProgressBar 
            progress={progress} 
            currentStage={selectedNode?.label || tree.name}
            theme={config.theme}
          />
        </Panel>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={config.minZoom}
        maxZoom={config.maxZoom}
        defaultViewport={{ x: 0, y: 0, zoom: config.defaultZoom! }}
        attributionPosition="bottom-left"
      >
        <Background 
          color={config.theme === 'dark' ? '#374151' : '#e5e7eb'} 
          gap={20} 
        />
        <Controls 
          showInteractive={false}
          className={config.theme === 'dark' ? 'bg-gray-800' : ''}
        />
        {config.showMinimap && (
          <MiniMap 
            nodeColor={(node) => {
              switch (node.data?.status) {
                case 'completed': return '#22c55e';
                case 'active': return '#3b82f6';
                case 'blocked': return '#ef4444';
                default: return '#9ca3af';
              }
            }}
            maskColor={config.theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}
          />
        )}
      </ReactFlow>

      {/* Detail Panel */}
      <AnimatePresence>
        {showDetailPanel && selectedNode && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 right-0 h-full w-80 z-10"
          >
            <DetailPanel
              node={selectedNode}
              onClose={() => setShowDetailPanel(false)}
              onDecision={handleDecision}
              onNavigate={onNavigate}
              theme={config.theme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DecisionTreeView;
