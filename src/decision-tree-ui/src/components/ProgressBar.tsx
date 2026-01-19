/**
 * Tree Progress Bar Component
 */

import React from 'react';
import { TreeProgress } from '../types';

interface ProgressBarProps {
  progress: TreeProgress;
  theme?: 'light' | 'dark';
  showDetails?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  theme = 'light',
  showDetails = true,
}) => {
  const isDark = theme === 'dark';

  const containerStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderBottom: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
  };

  const barContainerStyle: React.CSSProperties = {
    height: '8px',
    backgroundColor: isDark ? '#374151' : '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  };

  const barFillStyle: React.CSSProperties = {
    height: '100%',
    width: `${progress.percentage}%`,
    backgroundColor: progress.percentage === 100 ? '#10b981' : '#3b82f6',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  };

  const detailsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    fontSize: '12px',
    color: isDark ? '#9ca3af' : '#6b7280',
  };

  return (
    <div style={containerStyle}>
      <div style={barContainerStyle}>
        <div style={barFillStyle} />
      </div>
      {showDetails && (
        <div style={detailsStyle}>
          <span>
            {progress.visitedNodes} of {progress.totalNodes} nodes visited
          </span>
          <span>{progress.percentage}% complete</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
