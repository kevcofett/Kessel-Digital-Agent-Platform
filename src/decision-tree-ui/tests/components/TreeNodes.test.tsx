import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  StartNode,
  EndNode,
  DecisionNode,
  ActionNode,
  GateNode,
  ConditionNode,
} from '../../src/components/TreeNodes';
import { createDecisionOption } from '../../src/utils/treeBuilder';

// Mock ReactFlow Handle
jest.mock('reactflow', () => ({
  Handle: ({ type, position, id }: any) => (
    <div data-testid={`handle-${type}-${position}`} data-handle-id={id} />
  ),
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
  },
}));

describe('TreeNodes components', () => {
  describe('StartNode', () => {
    const defaultProps = {
      id: 'start',
      data: {
        label: 'Start Workflow',
        description: 'Begin the process',
      },
      selected: false,
    };

    it('should render start node with label', () => {
      render(<StartNode {...defaultProps} />);

      expect(screen.getByText('Start Workflow')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(<StartNode {...defaultProps} />);

      expect(screen.getByText('Begin the process')).toBeInTheDocument();
    });

    it('should have bottom handle for outgoing edges', () => {
      render(<StartNode {...defaultProps} />);

      expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
    });

    it('should not have top handle', () => {
      render(<StartNode {...defaultProps} />);

      expect(screen.queryByTestId('handle-target-top')).not.toBeInTheDocument();
    });

    it('should apply selected styling', () => {
      const { container } = render(<StartNode {...defaultProps} selected />);

      expect(container.querySelector('.tree-node--selected')).toBeInTheDocument();
    });

    it('should render start icon', () => {
      render(<StartNode {...defaultProps} />);

      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    });
  });

  describe('EndNode', () => {
    const defaultProps = {
      id: 'end',
      data: {
        label: 'Complete',
        status: 'success' as const,
      },
      selected: false,
    };

    it('should render end node with label', () => {
      render(<EndNode {...defaultProps} />);

      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('should have top handle for incoming edges', () => {
      render(<EndNode {...defaultProps} />);

      expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
    });

    it('should not have bottom handle', () => {
      render(<EndNode {...defaultProps} />);

      expect(screen.queryByTestId('handle-source-bottom')).not.toBeInTheDocument();
    });

    it('should show success status', () => {
      const { container } = render(<EndNode {...defaultProps} />);

      expect(container.querySelector('.end-node--success')).toBeInTheDocument();
    });

    it('should show error status', () => {
      const props = { ...defaultProps, data: { ...defaultProps.data, status: 'error' as const } };
      const { container } = render(<EndNode {...props} />);

      expect(container.querySelector('.end-node--error')).toBeInTheDocument();
    });
  });

  describe('DecisionNode', () => {
    const options = [
      createDecisionOption('yes', 'Yes', 'next-1'),
      createDecisionOption('no', 'No', 'next-2'),
      createDecisionOption('maybe', 'Maybe', 'next-3'),
    ];

    const defaultProps = {
      id: 'decision-1',
      data: {
        label: 'Make Decision',
        description: 'Choose an option',
        options,
      },
      selected: false,
    };

    it('should render decision node with label', () => {
      render(<DecisionNode {...defaultProps} />);

      expect(screen.getByText('Make Decision')).toBeInTheDocument();
    });

    it('should render all options', () => {
      render(<DecisionNode {...defaultProps} />);

      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.getByText('Maybe')).toBeInTheDocument();
    });

    it('should have handles for each option', () => {
      render(<DecisionNode {...defaultProps} />);

      expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
    });

    it('should have top handle for incoming', () => {
      render(<DecisionNode {...defaultProps} />);

      expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
    });

    it('should call onOptionClick when option is clicked', () => {
      const onOptionClick = jest.fn();
      const props = { ...defaultProps, data: { ...defaultProps.data, onOptionClick } };

      render(<DecisionNode {...props} />);

      fireEvent.click(screen.getByText('Yes'));

      expect(onOptionClick).toHaveBeenCalledWith('yes');
    });

    it('should highlight default option', () => {
      const optionsWithDefault = [
        createDecisionOption('yes', 'Yes', 'next-1', { isDefault: true }),
        createDecisionOption('no', 'No', 'next-2'),
      ];
      const props = { ...defaultProps, data: { ...defaultProps.data, options: optionsWithDefault } };

      render(<DecisionNode {...props} />);

      expect(screen.getByText('Yes').closest('.option--default')).toBeInTheDocument();
    });

    it('should show diamond shape icon', () => {
      render(<DecisionNode {...defaultProps} />);

      expect(screen.getByTestId('decision-icon')).toBeInTheDocument();
    });
  });

  describe('ActionNode', () => {
    const defaultProps = {
      id: 'action-1',
      data: {
        label: 'Execute Task',
        description: 'Perform the action',
        agent: 'ANL',
        capability: 'budget-optimization',
      },
      selected: false,
    };

    it('should render action node with label', () => {
      render(<ActionNode {...defaultProps} />);

      expect(screen.getByText('Execute Task')).toBeInTheDocument();
    });

    it('should display agent name', () => {
      render(<ActionNode {...defaultProps} />);

      expect(screen.getByText('ANL')).toBeInTheDocument();
    });

    it('should display capability', () => {
      render(<ActionNode {...defaultProps} />);

      expect(screen.getByText('budget-optimization')).toBeInTheDocument();
    });

    it('should have both handles', () => {
      render(<ActionNode {...defaultProps} />);

      expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
      expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
    });

    it('should show execution status', () => {
      const props = { ...defaultProps, data: { ...defaultProps.data, status: 'running' as const } };
      const { container } = render(<ActionNode {...props} />);

      expect(container.querySelector('.action-node--running')).toBeInTheDocument();
    });

    it('should show success status', () => {
      const props = { ...defaultProps, data: { ...defaultProps.data, status: 'completed' as const } };
      const { container } = render(<ActionNode {...props} />);

      expect(container.querySelector('.action-node--completed')).toBeInTheDocument();
    });

    it('should show error status', () => {
      const props = { ...defaultProps, data: { ...defaultProps.data, status: 'failed' as const } };
      const { container } = render(<ActionNode {...props} />);

      expect(container.querySelector('.action-node--failed')).toBeInTheDocument();
    });

    it('should show loading spinner when running', () => {
      const props = { ...defaultProps, data: { ...defaultProps.data, status: 'running' as const } };
      render(<ActionNode {...props} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('GateNode', () => {
    const defaultProps = {
      id: 'gate-1',
      data: {
        label: 'Approval Required',
        description: 'Human approval needed',
        approvalType: 'manual' as const,
      },
      selected: false,
    };

    it('should render gate node with label', () => {
      render(<GateNode {...defaultProps} />);

      expect(screen.getByText('Approval Required')).toBeInTheDocument();
    });

    it('should show approval status', () => {
      const props = { ...defaultProps, data: { ...defaultProps.data, approved: true } };
      const { container } = render(<GateNode {...props} />);

      expect(container.querySelector('.gate-node--approved')).toBeInTheDocument();
    });

    it('should show pending status', () => {
      render(<GateNode {...defaultProps} />);

      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    it('should call onApprove when approve button clicked', () => {
      const onApprove = jest.fn();
      const props = { ...defaultProps, data: { ...defaultProps.data, onApprove } };

      render(<GateNode {...props} />);

      fireEvent.click(screen.getByRole('button', { name: /approve/i }));

      expect(onApprove).toHaveBeenCalled();
    });

    it('should call onReject when reject button clicked', () => {
      const onReject = jest.fn();
      const props = { ...defaultProps, data: { ...defaultProps.data, onReject } };

      render(<GateNode {...props} />);

      fireEvent.click(screen.getByRole('button', { name: /reject/i }));

      expect(onReject).toHaveBeenCalled();
    });

    it('should disable buttons when already approved', () => {
      const props = { ...defaultProps, data: { ...defaultProps.data, approved: true } };
      render(<GateNode {...props} />);

      expect(screen.queryByRole('button', { name: /approve/i })).toBeDisabled();
    });
  });

  describe('ConditionNode', () => {
    const defaultProps = {
      id: 'condition-1',
      data: {
        label: 'Check Condition',
        condition: 'value > 100',
        trueTarget: 'yes-path',
        falseTarget: 'no-path',
      },
      selected: false,
    };

    it('should render condition node with label', () => {
      render(<ConditionNode {...defaultProps} />);

      expect(screen.getByText('Check Condition')).toBeInTheDocument();
    });

    it('should display condition expression', () => {
      render(<ConditionNode {...defaultProps} />);

      expect(screen.getByText('value > 100')).toBeInTheDocument();
    });

    it('should have true/false output handles', () => {
      render(<ConditionNode {...defaultProps} />);

      expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
    });

    it('should show true/false labels', () => {
      render(<ConditionNode {...defaultProps} />);

      expect(screen.getByText('True')).toBeInTheDocument();
      expect(screen.getByText('False')).toBeInTheDocument();
    });

    it('should show evaluation result when available', () => {
      const props = { ...defaultProps, data: { ...defaultProps.data, result: true } };
      const { container } = render(<ConditionNode {...props} />);

      expect(container.querySelector('.condition-node--true')).toBeInTheDocument();
    });
  });

  describe('common node behaviors', () => {
    it('should handle click events', () => {
      const onClick = jest.fn();
      render(<ActionNode id="action-1" data={{ label: 'Test', onClick }} selected={false} />);

      fireEvent.click(screen.getByText('Test'));

      expect(onClick).toHaveBeenCalled();
    });

    it('should handle double click for editing', () => {
      const onDoubleClick = jest.fn();
      render(<ActionNode id="action-1" data={{ label: 'Test', onDoubleClick }} selected={false} />);

      fireEvent.doubleClick(screen.getByText('Test'));

      expect(onDoubleClick).toHaveBeenCalled();
    });

    it('should show tooltip on hover', async () => {
      render(<ActionNode id="action-1" data={{ label: 'Test', tooltip: 'Detailed info' }} selected={false} />);

      fireEvent.mouseEnter(screen.getByText('Test'));

      expect(await screen.findByText('Detailed info')).toBeInTheDocument();
    });
  });
});
