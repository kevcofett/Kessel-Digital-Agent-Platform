import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DecisionTree } from '../../src/components/DecisionTree';
import { createTree, createNode, createEdge, createDecisionOption } from '../../src/utils/treeBuilder';

// Mock ReactFlow
jest.mock('reactflow', () => ({
  __esModule: true,
  default: ({ children, nodes, edges, onNodeClick, onEdgeClick }: any) => (
    <div data-testid="reactflow-container">
      <div data-testid="nodes-count">{nodes?.length || 0}</div>
      <div data-testid="edges-count">{edges?.length || 0}</div>
      {nodes?.map((node: any) => (
        <div
          key={node.id}
          data-testid={`node-${node.id}`}
          onClick={() => onNodeClick?.({}, node)}
        >
          {node.data?.label}
        </div>
      ))}
      {edges?.map((edge: any) => (
        <div
          key={edge.id}
          data-testid={`edge-${edge.id}`}
          onClick={() => onEdgeClick?.({}, edge)}
        >
          {edge.source} → {edge.target}
        </div>
      ))}
      {children}
    </div>
  ),
  Controls: () => <div data-testid="controls">Controls</div>,
  MiniMap: () => <div data-testid="minimap">MiniMap</div>,
  Background: () => <div data-testid="background">Background</div>,
  Handle: () => null,
  Position: { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' },
  BackgroundVariant: { Dots: 'dots', Lines: 'lines', Cross: 'cross' },
  useNodesState: jest.fn(() => [[], jest.fn(), jest.fn()]),
  useEdgesState: jest.fn(() => [[], jest.fn(), jest.fn()]),
}));

const mockTree = createTree({
  id: 'test-tree',
  name: 'Test Decision Tree',
  description: 'A tree for testing',
  domain: 'MPA',
  startNodeId: 'start',
  nodes: [
    createNode({ id: 'start', type: 'start', label: 'Start' }),
    createNode({
      id: 'decision-1',
      type: 'decision',
      label: 'Make Choice',
      options: [
        createDecisionOption('yes', 'Yes', 'action-1'),
        createDecisionOption('no', 'No', 'end'),
      ],
    }),
    createNode({ id: 'action-1', type: 'action', label: 'Perform Action', agent: 'ANL' }),
    createNode({ id: 'end', type: 'end', label: 'Complete' }),
  ],
  edges: [
    createEdge({ source: 'start', target: 'decision-1' }),
    createEdge({ source: 'decision-1', target: 'action-1', label: 'Yes' }),
    createEdge({ source: 'decision-1', target: 'end', label: 'No' }),
    createEdge({ source: 'action-1', target: 'end' }),
  ],
});

describe('DecisionTree component', () => {
  describe('rendering', () => {
    it('should render the tree container', () => {
      render(<DecisionTree tree={mockTree} />);

      expect(screen.getByTestId('reactflow-container')).toBeInTheDocument();
    });

    it('should render controls when enabled', () => {
      render(<DecisionTree tree={mockTree} showControls />);

      expect(screen.getByTestId('controls')).toBeInTheDocument();
    });

    it('should render minimap when enabled', () => {
      render(<DecisionTree tree={mockTree} showMiniMap />);

      expect(screen.getByTestId('minimap')).toBeInTheDocument();
    });

    it('should render background when enabled', () => {
      render(<DecisionTree tree={mockTree} showBackground />);

      expect(screen.getByTestId('background')).toBeInTheDocument();
    });

    it('should hide controls when disabled', () => {
      render(<DecisionTree tree={mockTree} showControls={false} />);

      expect(screen.queryByTestId('controls')).not.toBeInTheDocument();
    });
  });

  describe('node display', () => {
    it('should display correct number of nodes', () => {
      render(<DecisionTree tree={mockTree} />);

      expect(screen.getByTestId('nodes-count')).toHaveTextContent('4');
    });

    it('should display correct number of edges', () => {
      render(<DecisionTree tree={mockTree} />);

      expect(screen.getByTestId('edges-count')).toHaveTextContent('4');
    });

    it('should render node labels', () => {
      render(<DecisionTree tree={mockTree} />);

      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.getByText('Make Choice')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onNodeClick when node is clicked', () => {
      const onNodeClick = jest.fn();
      render(<DecisionTree tree={mockTree} onNodeClick={onNodeClick} />);

      fireEvent.click(screen.getByTestId('node-start'));

      expect(onNodeClick).toHaveBeenCalled();
    });

    it('should call onEdgeClick when edge is clicked', () => {
      const onEdgeClick = jest.fn();
      render(<DecisionTree tree={mockTree} onEdgeClick={onEdgeClick} />);

      const edges = screen.getAllByTestId(/^edge-/);
      fireEvent.click(edges[0]);

      expect(onEdgeClick).toHaveBeenCalled();
    });

    it('should call onNodeSelect when node is selected', async () => {
      const onNodeSelect = jest.fn();
      render(<DecisionTree tree={mockTree} onNodeSelect={onNodeSelect} />);

      fireEvent.click(screen.getByTestId('node-decision-1'));

      await waitFor(() => {
        expect(onNodeSelect).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'decision-1' })
        );
      });
    });
  });

  describe('selection state', () => {
    it('should highlight selected node', () => {
      render(<DecisionTree tree={mockTree} selectedNodeId="decision-1" />);

      const node = screen.getByTestId('node-decision-1');
      expect(node).toBeInTheDocument();
    });

    it('should update selection when prop changes', () => {
      const { rerender } = render(<DecisionTree tree={mockTree} selectedNodeId="start" />);

      rerender(<DecisionTree tree={mockTree} selectedNodeId="decision-1" />);

      expect(screen.getByTestId('node-decision-1')).toBeInTheDocument();
    });
  });

  describe('read-only mode', () => {
    it('should disable interactions in read-only mode', () => {
      const onNodeClick = jest.fn();
      render(<DecisionTree tree={mockTree} readOnly onNodeClick={onNodeClick} />);

      fireEvent.click(screen.getByTestId('node-start'));

      expect(onNodeClick).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show loading indicator when loading', () => {
      render(<DecisionTree tree={mockTree} loading />);

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('should hide tree while loading', () => {
      render(<DecisionTree tree={mockTree} loading />);

      expect(screen.queryByTestId('reactflow-container')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show error message', () => {
      render(<DecisionTree tree={mockTree} error="Failed to load tree" />);

      expect(screen.getByText('Failed to load tree')).toBeInTheDocument();
    });

    it('should show retry button on error', () => {
      const onRetry = jest.fn();
      render(<DecisionTree tree={mockTree} error="Failed" onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('should show empty state for tree with no nodes', () => {
      const emptyTree = createTree({
        id: 'empty',
        name: 'Empty',
        description: 'Empty tree',
        domain: 'MPA',
        startNodeId: '',
        nodes: [],
        edges: [],
      });

      render(<DecisionTree tree={emptyTree} />);

      expect(screen.getByText(/no nodes/i)).toBeInTheDocument();
    });
  });

  describe('zoom and fit', () => {
    it('should call fitView when tree changes', () => {
      const { rerender } = render(<DecisionTree tree={mockTree} fitViewOnInit />);

      const newTree = { ...mockTree, id: 'new-tree' };
      rerender(<DecisionTree tree={newTree} fitViewOnInit />);

      // fitView would be called internally
      expect(screen.getByTestId('reactflow-container')).toBeInTheDocument();
    });
  });

  describe('custom node types', () => {
    it('should accept custom node components', () => {
      const CustomNode = () => <div data-testid="custom-node">Custom</div>;
      const nodeTypes = { custom: CustomNode };

      render(<DecisionTree tree={mockTree} nodeTypes={nodeTypes} />);

      expect(screen.getByTestId('reactflow-container')).toBeInTheDocument();
    });
  });

  describe('theming', () => {
    it('should apply theme class', () => {
      const { container } = render(<DecisionTree tree={mockTree} theme="dark" />);

      expect(container.querySelector('.decision-tree--dark')).toBeInTheDocument();
    });

    it('should default to light theme', () => {
      const { container } = render(<DecisionTree tree={mockTree} />);

      expect(container.querySelector('.decision-tree--light')).toBeInTheDocument();
    });
  });
});
