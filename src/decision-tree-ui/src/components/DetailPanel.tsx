/**
 * Node Detail Side Panel
 */

import React from 'react';
import { TreeNode, DecisionOption } from '../types';

interface DetailPanelProps {
  node: TreeNode;
  theme?: 'light' | 'dark';
  onDecision?: (optionId: string) => void;
  onClose?: () => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  node,
  theme = 'light',
  onDecision,
  onClose,
}) => {
  const isDark = theme === 'dark';
  
  const panelStyle: React.CSSProperties = {
    width: '320px',
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderLeft: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
    padding: '20px',
    overflowY: 'auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: isDark ? '#f9fafb' : '#111827',
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: isDark ? '#9ca3af' : '#6b7280',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: isDark ? '#9ca3af' : '#6b7280',
    marginBottom: '8px',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '14px',
    color: isDark ? '#e5e7eb' : '#374151',
    lineHeight: 1.5,
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: isDark ? '#374151' : '#e5e7eb',
    color: isDark ? '#e5e7eb' : '#374151',
  };

  const optionButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    marginBottom: '8px',
    border: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: isDark ? '#374151' : '#f9fafb',
    color: isDark ? '#f9fafb' : '#111827',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>{node.label}</h3>
        {onClose && (
          <button style={closeButtonStyle} onClick={onClose}>
            x
          </button>
        )}
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Type</div>
        <span style={badgeStyle}>{node.type.toUpperCase()}</span>
      </div>

      {node.description && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Description</div>
          <p style={textStyle}>{node.description}</p>
        </div>
      )}

      {node.agent && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Agent</div>
          <span style={badgeStyle}>{node.agent}</span>
          {node.capability && (
            <span style={{ ...badgeStyle, marginLeft: '8px' }}>
              {node.capability}
            </span>
          )}
        </div>
      )}

      {node.options && node.options.length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Options</div>
          {node.options.map((option: DecisionOption) => (
            <button
              key={option.id}
              style={optionButtonStyle}
              onClick={() => onDecision?.(option.id)}
            >
              <div style={{ fontWeight: 500 }}>{option.label}</div>
              {option.description && (
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                  {option.description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {node.validation && node.validation.length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Validation Rules</div>
          <ul style={{ ...textStyle, paddingLeft: '20px', margin: 0 }}>
            {node.validation.map((rule, index) => (
              <li key={index}>
                {rule.field}: {rule.rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DetailPanel;
