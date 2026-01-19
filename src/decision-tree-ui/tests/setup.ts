import '@testing-library/jest-dom';

// Mock ReactFlow
jest.mock('reactflow', () => ({
  __esModule: true,
  default: jest.fn(() => null),
  Controls: jest.fn(() => null),
  MiniMap: jest.fn(() => null),
  Background: jest.fn(() => null),
  Handle: jest.fn(() => null),
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
  },
  BackgroundVariant: {
    Dots: 'dots',
    Lines: 'lines',
    Cross: 'cross',
  },
  useNodesState: jest.fn(() => [[], jest.fn(), jest.fn()]),
  useEdgesState: jest.fn(() => [[], jest.fn(), jest.fn()]),
}));
