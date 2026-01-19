/**
 * Detail Panel Component
 * Shows node details and action options
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  Clock, 
  Zap,
  Info,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import type { TreeNode, NavigationAction, DecisionOption } from '../types';

interface DetailPanelProps {
  node: TreeNode;
  onClose: () => void;
  onDecision?: (nodeId: string, optionId: string) => void;
  onNavigate?: (action: NavigationAction) => void;
  theme?: 'light' | 'dark' | 'system';
}

export function DetailPanel({
  node,
  onClose,
  onDecision,
  onNavigate,
  theme = 'light',
}: DetailPanelProps) {
  const isDark = theme === 'dark';

  const handleOptionClick = (option: DecisionOption) => {
    onDecision?.(node.id, option.id);
  };

  const handleContinue = () => {
    onNavigate?.({ type: 'next' });
  };

  const handleBack = () => {
    onNavigate?.({ type: 'back' });
  };

  return (
    <div
      className={clsx(
        'h-full flex flex-col shadow-xl border-l',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          'flex items-center justify-between px-4 py-3 border-b',
          isDark ? 'border-gray-700' : 'border-gray-200'
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              'p-1.5 rounded-md',
              node.status === 'active' && 'bg-blue-100 text-blue-600',
              node.status === 'completed' && 'bg-green-100 text-green-600',
              node.status === 'blocked' && 'bg-red-100 text-red-600',
              node.status === 'pending' && 'bg-gray-100 text-gray-600'
            )}
          >
            <Zap className="w-4 h-4" />
          </div>
          <span
            className={clsx(
              'font-semibold',
              isDark ? 'text-white' : 'text-gray-900'
            )}
          >
            {node.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className={clsx(
            'p-1 rounded-md transition-colors',
            isDark
              ? 'hover:bg-gray-700 text-gray-400'
              : 'hover:bg-gray-100 text-gray-500'
          )}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Description */}
        {node.description && (
          <div>
            <p
              className={clsx(
                'text-sm',
                isDark ? 'text-gray-300' : 'text-gray-600'
              )}
            >
              {node.description}
            </p>
          </div>
        )}

        {/* Agent info */}
        {node.data.agent && (
          <div
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            )}
          >
            <Info className="w-4 h-4 text-blue-500" />
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Handled by <strong>{node.data.agent}</strong> agent
            </span>
          </div>
        )}

        {/* Time estimate */}
        {node.data.timeEstimate && (
          <div
            className={clsx(
              'flex items-center gap-2 text-sm',
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}
          >
            <Clock className="w-4 h-4" />
            <span>Estimated time: {node.data.timeEstimate} minutes</span>
          </div>
        )}

        {/* Decision options */}
        {node.type === 'decision' && node.data.options && (
          <div className="space-y-2">
            <h4
              className={clsx(
                'text-sm font-medium',
                isDark ? 'text-gray-200' : 'text-gray-700'
              )}
            >
              Choose an option:
            </h4>
            <div className="space-y-2">
              {node.data.options.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleOptionClick(option)}
                  className={clsx(
                    'w-full text-left p-3 rounded-lg border transition-colors',
                    isDark
                      ? 'border-gray-600 hover:bg-gray-700 hover:border-blue-500'
                      : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300',
                    option.isDefault &&
                      (isDark ? 'border-blue-600' : 'border-blue-400')
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={clsx(
                        'font-medium',
                        isDark ? 'text-white' : 'text-gray-900'
                      )}
                    >
                      {option.label}
                    </span>
                    <ChevronRight
                      className={clsx(
                        'w-4 h-4',
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      )}
                    />
                  </div>
                  {option.description && (
                    <p
                      className={clsx(
                        'text-sm mt-1',
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      )}
                    >
                      {option.description}
                    </p>
                  )}
                  {option.isDefault && (
                    <span className="inline-block mt-2 text-xs text-blue-500">
                      Recommended
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Validation rules for gates */}
        {node.type === 'gate' && node.data.validationRules && (
          <div className="space-y-2">
            <h4
              className={clsx(
                'text-sm font-medium',
                isDark ? 'text-gray-200' : 'text-gray-700'
              )}
            >
              Validation checks:
            </h4>
            <div className="space-y-1">
              {node.data.validationRules.map((rule) => (
                <div
                  key={rule.id}
                  className={clsx(
                    'flex items-center gap-2 text-sm p-2 rounded',
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  )}
                >
                  <Check className="w-4 h-4 text-green-500" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    {rule.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help text */}
        {node.data.helpText && (
          <div
            className={clsx(
              'p-3 rounded-lg',
              isDark ? 'bg-blue-900/30' : 'bg-blue-50'
            )}
          >
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p
                className={clsx(
                  'text-sm',
                  isDark ? 'text-blue-200' : 'text-blue-700'
                )}
              >
                {node.data.helpText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      {node.type === 'action' && (
        <div
          className={clsx(
            'p-4 border-t space-y-2',
            isDark ? 'border-gray-700' : 'border-gray-200'
          )}
        >
          <button
            onClick={handleContinue}
            className={clsx(
              'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors',
              'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleBack}
            className={clsx(
              'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}

export default DetailPanel;
