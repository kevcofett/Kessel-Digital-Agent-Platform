import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetailPanel } from '../../src/components/DetailPanel';
import { createNode, createDecisionOption } from '../../src/utils/treeBuilder';

describe('DetailPanel component', () => {
  describe('rendering', () => {
    it('should render nothing when no node is selected', () => {
      const { container } = render(<DetailPanel node={null} />);

      expect(container.querySelector('.detail-panel')).not.toBeInTheDocument();
    });

    it('should render panel when node is selected', () => {
      const node = createNode({ id: 'test', type: 'action', label: 'Test Node' });
      render(<DetailPanel node={node} />);

      expect(screen.getByText('Test Node')).toBeInTheDocument();
    });

    it('should show node type badge', () => {
      const node = createNode({ id: 'test', type: 'decision', label: 'Decision' });
      render(<DetailPanel node={node} />);

      expect(screen.getByText('decision')).toBeInTheDocument();
    });

    it('should show node id', () => {
      const node = createNode({ id: 'node-123', type: 'action', label: 'Test' });
      render(<DetailPanel node={node} />);

      expect(screen.getByText('node-123')).toBeInTheDocument();
    });
  });

  describe('start node details', () => {
    const startNode = createNode({
      id: 'start',
      type: 'start',
      label: 'Workflow Start',
      description: 'This is where the workflow begins',
    });

    it('should display start node icon', () => {
      render(<DetailPanel node={startNode} />);

      expect(screen.getByTestId('start-type-icon')).toBeInTheDocument();
    });

    it('should display description', () => {
      render(<DetailPanel node={startNode} />);

      expect(screen.getByText('This is where the workflow begins')).toBeInTheDocument();
    });
  });

  describe('decision node details', () => {
    const decisionNode = createNode({
      id: 'decision-1',
      type: 'decision',
      label: 'Choose Path',
      description: 'Select the appropriate option',
      options: [
        createDecisionOption('opt-a', 'Option A', 'target-a', { description: 'First choice' }),
        createDecisionOption('opt-b', 'Option B', 'target-b', { description: 'Second choice' }),
        createDecisionOption('opt-c', 'Default', 'target-c', { isDefault: true }),
      ],
    });

    it('should list all options', () => {
      render(<DetailPanel node={decisionNode} />);

      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('should show option descriptions', () => {
      render(<DetailPanel node={decisionNode} />);

      expect(screen.getByText('First choice')).toBeInTheDocument();
      expect(screen.getByText('Second choice')).toBeInTheDocument();
    });

    it('should highlight default option', () => {
      render(<DetailPanel node={decisionNode} />);

      const defaultOption = screen.getByText('Default').closest('.option-item');
      expect(defaultOption).toHaveClass('option-item--default');
    });

    it('should show target node for each option', () => {
      render(<DetailPanel node={decisionNode} />);

      expect(screen.getByText(/target-a/)).toBeInTheDocument();
      expect(screen.getByText(/target-b/)).toBeInTheDocument();
    });
  });

  describe('action node details', () => {
    const actionNode = createNode({
      id: 'action-1',
      type: 'action',
      label: 'Execute Task',
      description: 'Perform the automated task',
      agent: 'ANL',
      capability: 'budget-optimization',
    });

    it('should display agent information', () => {
      render(<DetailPanel node={actionNode} />);

      expect(screen.getByText('ANL')).toBeInTheDocument();
    });

    it('should display capability', () => {
      render(<DetailPanel node={actionNode} />);

      expect(screen.getByText('budget-optimization')).toBeInTheDocument();
    });

    it('should show agent status link', () => {
      render(<DetailPanel node={actionNode} />);

      expect(screen.getByRole('link', { name: /view agent/i })).toBeInTheDocument();
    });
  });

  describe('gate node details', () => {
    const gateNode = createNode({
      id: 'gate-1',
      type: 'gate',
      label: 'Approval Gate',
      description: 'Requires human approval before proceeding',
    });

    it('should show approval status section', () => {
      render(<DetailPanel node={gateNode} />);

      expect(screen.getByText(/approval status/i)).toBeInTheDocument();
    });

    it('should show pending status', () => {
      render(<DetailPanel node={gateNode} />);

      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    it('should show approved status when approved', () => {
      const approvedGate = { ...gateNode, approved: true, approvedBy: 'user@example.com', approvedAt: '2024-01-15T10:00:00Z' };
      render(<DetailPanel node={approvedGate} />);

      expect(screen.getByText(/approved/i)).toBeInTheDocument();
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });
  });

  describe('end node details', () => {
    const endNode = createNode({
      id: 'end',
      type: 'end',
      label: 'Workflow Complete',
    });

    it('should display end node icon', () => {
      render(<DetailPanel node={endNode} />);

      expect(screen.getByTestId('end-type-icon')).toBeInTheDocument();
    });

    it('should show termination message', () => {
      render(<DetailPanel node={endNode} />);

      expect(screen.getByText(/workflow ends here/i)).toBeInTheDocument();
    });
  });

  describe('editing mode', () => {
    const node = createNode({ id: 'test', type: 'action', label: 'Editable Node' });

    it('should enable editing when edit button clicked', async () => {
      render(<DetailPanel node={node} editable />);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      expect(screen.getByRole('textbox', { name: /label/i })).toBeInTheDocument();
    });

    it('should update label when edited', async () => {
      const onUpdate = jest.fn();
      render(<DetailPanel node={node} editable onUpdate={onUpdate} />);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      const input = screen.getByRole('textbox', { name: /label/i });

      await userEvent.clear(input);
      await userEvent.type(input, 'New Label');
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ label: 'New Label' }));
    });

    it('should cancel editing', async () => {
      render(<DetailPanel node={node} editable />);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(screen.queryByRole('textbox', { name: /label/i })).not.toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      render(<DetailPanel node={node} editable />);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      const input = screen.getByRole('textbox', { name: /label/i });

      await userEvent.clear(input);
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(screen.getByText(/label is required/i)).toBeInTheDocument();
    });

    it('should not show edit button when not editable', () => {
      render(<DetailPanel node={node} editable={false} />);

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });
  });

  describe('deletion', () => {
    const node = createNode({ id: 'test', type: 'action', label: 'Deletable Node' });

    it('should show delete button when deletable', () => {
      render(<DetailPanel node={node} deletable />);

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should call onDelete when delete confirmed', async () => {
      const onDelete = jest.fn();
      render(<DetailPanel node={node} deletable onDelete={onDelete} />);

      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      // Confirm dialog
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

      expect(onDelete).toHaveBeenCalledWith('test');
    });

    it('should not delete when cancelled', async () => {
      const onDelete = jest.fn();
      render(<DetailPanel node={node} deletable onDelete={onDelete} />);

      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onDelete).not.toHaveBeenCalled();
    });

    it('should not allow deleting start node', () => {
      const startNode = createNode({ id: 'start', type: 'start', label: 'Start' });
      render(<DetailPanel node={startNode} deletable />);

      expect(screen.queryByRole('button', { name: /delete/i })).toBeDisabled();
    });
  });

  describe('metadata', () => {
    const nodeWithMetadata = {
      ...createNode({ id: 'test', type: 'action', label: 'Test' }),
      metadata: {
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z',
        createdBy: 'admin@example.com',
      },
    };

    it('should show creation date', () => {
      render(<DetailPanel node={nodeWithMetadata} showMetadata />);

      expect(screen.getByText(/created/i)).toBeInTheDocument();
      expect(screen.getByText(/jan 1, 2024/i)).toBeInTheDocument();
    });

    it('should show last updated date', () => {
      render(<DetailPanel node={nodeWithMetadata} showMetadata />);

      expect(screen.getByText(/updated/i)).toBeInTheDocument();
    });

    it('should show created by', () => {
      render(<DetailPanel node={nodeWithMetadata} showMetadata />);

      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    it('should hide metadata section by default', () => {
      render(<DetailPanel node={nodeWithMetadata} />);

      expect(screen.queryByText(/created/i)).not.toBeInTheDocument();
    });
  });

  describe('close functionality', () => {
    const node = createNode({ id: 'test', type: 'action', label: 'Test' });

    it('should call onClose when close button clicked', () => {
      const onClose = jest.fn();
      render(<DetailPanel node={node} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it('should close on escape key', () => {
      const onClose = jest.fn();
      render(<DetailPanel node={node} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    const node = createNode({ id: 'test', type: 'action', label: 'Accessible Node' });

    it('should have proper heading structure', () => {
      render(<DetailPanel node={node} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Accessible Node');
    });

    it('should be keyboard navigable', () => {
      render(<DetailPanel node={node} editable />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      editButton.focus();

      expect(document.activeElement).toBe(editButton);
    });

    it('should have aria-labels on interactive elements', () => {
      render(<DetailPanel node={node} editable deletable />);

      expect(screen.getByRole('button', { name: /edit/i })).toHaveAttribute('aria-label');
    });
  });
});
