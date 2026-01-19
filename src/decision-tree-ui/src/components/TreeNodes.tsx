/**
 * Custom Node Components for Decision Tree
 * React Flow node renderers
 */

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { 
  Play, 
  CircleDot, 
  Zap, 
  ShieldCheck, 
  GitMerge, 
  Flag,
  ChevronRight,
  Check,
  Lock,
  Clock
} from 'lucide-react';
import clsx from 'clsx';
import type { TreeNode, NodeStatus, NodeType } from '../types';

const statusColors: Record<NodeStatus, string> = {
  pending: 'bg-gray-100 border-gray-300 text-gray-600',
  active: 'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-300',
  completed: 'bg-green-100 border-green-500 text-green-700',
  blocked: 'bg-red-100 border-red-500 text-red-700',
  skipped: 'bg-gray-50 border-gray-200 text-gray-400',
};

const typeIcons: Record<NodeType, React.ElementType> = {
  start: Play,
  decision: CircleDot,
  action: Zap,
  gate: ShieldCheck,
  merge: GitMerge,
  end: Flag,
};

interface CustomNodeData extends TreeNode['data'] {
  label: string;
  description?: string;
  status: NodeStatus;
  type: NodeType;
}

/**
 * Start Node - Entry point
 */
export const StartNode = memo(({ data }: NodeProps<CustomNodeData>) => {
  const Icon = typeIcons.start;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={clsx(
        'px-4 py-3 rounded-full border-2 shadow-sm min-w-[120px] text-center',
        statusColors[data.status]
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </motion.div>
  );
});
StartNode.displayName = 'StartNode';

/**
 * Decision Node - User choice point
 */
export const DecisionNode = memo(({ data }: NodeProps<CustomNodeData>) => {
  const Icon = typeIcons.decision;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={clsx(
        'px-4 py-3 border-2 shadow-md min-w-[180px]',
        'transform rotate-0', // Diamond shape via CSS
        statusColors[data.status]
      )}
      style={{
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        padding: '24px 32px',
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="flex flex-col items-center gap-1 text-center">
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm">{data.label}</span>
        {data.options && (
          <span className="text-xs opacity-75">{data.options.length} options</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
      <Handle type="source" position={Position.Left} id="left" className="!bg-blue-500" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-blue-500" />
    </motion.div>
  );
});
DecisionNode.displayName = 'DecisionNode';

/**
 * Action Node - Agent capability execution
 */
export const ActionNode = memo(({ data }: NodeProps<CustomNodeData>) => {
  const Icon = typeIcons.action;
  const StatusIcon = data.status === 'completed' ? Check : 
                     data.status === 'blocked' ? Lock : 
                     data.status === 'active' ? ChevronRight : null;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className={clsx(
        'px-4 py-3 rounded-lg border-2 shadow-md min-w-[200px]',
        statusColors[data.status]
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="flex items-start gap-3">
        <div className={clsx(
          'p-2 rounded-md',
          data.status === 'active' ? 'bg-blue-200' : 'bg-white/50'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{data.label}</span>
            {StatusIcon && <StatusIcon className="w-4 h-4" />}
          </div>
          {data.description && (
            <p className="text-xs opacity-75 mt-1">{data.description}</p>
          )}
          {data.agent && (
            <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-white/50 rounded">
              {data.agent}
            </span>
          )}
        </div>
      </div>
      {data.timeEstimate && (
        <div className="flex items-center gap-1 mt-2 text-xs opacity-60">
          <Clock className="w-3 h-3" />
          <span>{data.timeEstimate} min</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </motion.div>
  );
});
ActionNode.displayName = 'ActionNode';

/**
 * Gate Node - Validation checkpoint
 */
export const GateNode = memo(({ data }: NodeProps<CustomNodeData>) => {
  const Icon = typeIcons.gate;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={clsx(
        'px-4 py-3 border-2 shadow-md min-w-[160px]',
        statusColors[data.status]
      )}
      style={{
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
        padding: '16px 24px',
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="flex flex-col items-center gap-1 text-center">
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm">{data.label}</span>
        {data.validationRules && (
          <span className="text-xs opacity-75">
            {data.validationRules.length} checks
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </motion.div>
  );
});
GateNode.displayName = 'GateNode';

/**
 * Merge Node - Path convergence
 */
export const MergeNode = memo(({ data }: NodeProps<CustomNodeData>) => {
  const Icon = typeIcons.merge;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={clsx(
        'p-3 rounded-full border-2 shadow-sm',
        statusColors[data.status]
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-blue-500" />
      <Handle type="target" position={Position.Right} id="right" className="!bg-blue-500" />
      <Icon className="w-6 h-6" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </motion.div>
  );
});
MergeNode.displayName = 'MergeNode';

/**
 * End Node - Terminal state
 */
export const EndNode = memo(({ data }: NodeProps<CustomNodeData>) => {
  const Icon = typeIcons.end;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={clsx(
        'px-4 py-3 rounded-full border-2 shadow-sm min-w-[120px] text-center',
        statusColors[data.status]
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="flex items-center justify-center gap-2">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{data.label}</span>
      </div>
    </motion.div>
  );
});
EndNode.displayName = 'EndNode';

/**
 * Node type mapping for React Flow
 */
export const nodeTypes = {
  start: StartNode,
  decision: DecisionNode,
  action: ActionNode,
  gate: GateNode,
  merge: MergeNode,
  end: EndNode,
};

export default nodeTypes;
