/**
 * Custom React Flow Node Components
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TreeNode, DEFAULT_NODE_STYLES } from '../types';

interface CustomNodeData extends TreeNode {
  isActive?: boolean;
  isVisited?: boolean;
  isDisabled?: boolean;
}

const baseNodeStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: '8px',
  borderWidth: '2px',
  borderStyle: 'solid',
  minWidth: '150px',
  textAlign: 'center',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
};

export const StartNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  const styles = DEFAULT_NODE_STYLES.start;
  return (
    <div
      style={{
        ...baseNodeStyle,
        backgroundColor: styles.background,
        borderColor: styles.border,
        color: 'white',
        borderRadius: '24px',
      }}
    >
      <Handle type="source" position={Position.Bottom} />
      <div>{data.label}</div>
    </div>
  );
};

export const DecisionNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  const styles = DEFAULT_NODE_STYLES.decision;
  return (
    <div
      style={{
        ...baseNodeStyle,
        backgroundColor: styles.background,
        borderColor: styles.border,
        color: 'white',
        transform: 'rotate(0deg)',
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        padding: '24px',
        minWidth: '120px',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div style={{ transform: 'rotate(0deg)' }}>{data.label}</div>
    </div>
  );
};

export const ActionNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  const styles = DEFAULT_NODE_STYLES.action;
  const isActive = data.isActive;
  const isVisited = data.isVisited;
  
  return (
    <div
      style={{
        ...baseNodeStyle,
        backgroundColor: isActive ? '#1d4ed8' : isVisited ? '#93c5fd' : styles.background,
        borderColor: isActive ? '#1e40af' : styles.border,
        color: 'white',
        boxShadow: isActive ? '0 0 12px rgba(59, 130, 246, 0.5)' : 'none',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div style={{ fontWeight: isActive ? 700 : 500 }}>{data.label}</div>
      {data.agent && (
        <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
          Agent: {data.agent}
        </div>
      )}
    </div>
  );
};

export const GateNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  const styles = DEFAULT_NODE_STYLES.gate;
  return (
    <div
      style={{
        ...baseNodeStyle,
        backgroundColor: styles.background,
        borderColor: styles.border,
        color: 'white',
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        padding: '16px 24px',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div>{data.label}</div>
    </div>
  );
};

export const MergeNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  const styles = DEFAULT_NODE_STYLES.merge;
  return (
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: styles.background,
        borderColor: styles.border,
        borderWidth: '2px',
        borderStyle: 'solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const EndNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  const styles = DEFAULT_NODE_STYLES.end;
  return (
    <div
      style={{
        ...baseNodeStyle,
        backgroundColor: styles.background,
        borderColor: styles.border,
        color: 'white',
        borderRadius: '24px',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
    </div>
  );
};

export const TreeNodes = {
  start: StartNode,
  decision: DecisionNode,
  action: ActionNode,
  gate: GateNode,
  merge: MergeNode,
  end: EndNode,
};

export default TreeNodes;
