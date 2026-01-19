/**
 * Progress Bar Component
 * Shows workflow completion progress
 */

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ProgressBarProps {
  progress: number;
  currentStage?: string;
  theme?: 'light' | 'dark' | 'system';
}

export function ProgressBar({ progress, currentStage, theme = 'light' }: ProgressBarProps) {
  const isDark = theme === 'dark';

  return (
    <div
      className={clsx(
        'w-full px-4 py-3 border-b',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={clsx(
            'text-sm font-medium',
            isDark ? 'text-gray-200' : 'text-gray-700'
          )}
        >
          {currentStage || 'Progress'}
        </span>
        <span
          className={clsx(
            'text-sm font-semibold',
            isDark ? 'text-blue-400' : 'text-blue-600'
          )}
        >
          {progress}%
        </span>
      </div>
      <div
        className={clsx(
          'h-2 rounded-full overflow-hidden',
          isDark ? 'bg-gray-700' : 'bg-gray-200'
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={clsx(
            'h-full rounded-full',
            progress === 100 ? 'bg-green-500' : 'bg-blue-500'
          )}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
