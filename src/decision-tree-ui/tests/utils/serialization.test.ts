import { serializeTree, deserializeTree, exportToJson, importFromJson, validateJsonSchema } from '../../src/utils/serialization';
import { createTree, createNode, createEdge } from '../../src/utils/treeBuilder';
import { DecisionTree } from '../../src/types';

describe('serialization utilities', () => {
  const sampleTree: DecisionTree = createTree({
    id: 'test-tree',
    name: 'Test Tree',
    description: 'A test decision tree',
    domain: 'MPA',
    startNodeId: 'start',
    nodes: [
      createNode({ id: 'start', type: 'start', label: 'Start' }),
      createNode({
        id: 'decision-1',
        type: 'decision',
        label: 'First Decision',
        options: [
          { id: 'opt-yes', label: 'Yes', nextNodeId: 'action-1' },
          { id: 'opt-no', label: 'No', nextNodeId: 'end' },
        ],
      }),
      createNode({ id: 'action-1', type: 'action', label: 'Take Action', agent: 'ANL' }),
      createNode({ id: 'end', type: 'end', label: 'End' }),
    ],
    edges: [
      createEdge({ source: 'start', target: 'decision-1' }),
      createEdge({ source: 'decision-1', target: 'action-1', label: 'Yes' }),
      createEdge({ source: 'decision-1', target: 'end', label: 'No' }),
      createEdge({ source: 'action-1', target: 'end' }),
    ],
  });

  describe('serializeTree', () => {
    it('should serialize a tree to JSON string', () => {
      const serialized = serializeTree(sampleTree);

      expect(typeof serialized).toBe('string');
      expect(() => JSON.parse(serialized)).not.toThrow();
    });

    it('should preserve all tree properties', () => {
      const serialized = serializeTree(sampleTree);
      const parsed = JSON.parse(serialized);

      expect(parsed.id).toBe('test-tree');
      expect(parsed.name).toBe('Test Tree');
      expect(parsed.nodes).toHaveLength(4);
      expect(parsed.edges).toHaveLength(4);
    });

    it('should handle trees with metadata', () => {
      const treeWithMetadata = {
        ...sampleTree,
        metadata: {
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          createdBy: 'user-1',
          tags: ['test', 'sample'],
        },
      };

      const serialized = serializeTree(treeWithMetadata);
      const parsed = JSON.parse(serialized);

      expect(parsed.metadata.createdBy).toBe('user-1');
      expect(parsed.metadata.tags).toContain('test');
    });

    it('should handle empty nodes and edges', () => {
      const emptyTree = createTree({
        id: 'empty',
        name: 'Empty Tree',
        description: 'No nodes',
        domain: 'MPA',
        startNodeId: '',
        nodes: [],
        edges: [],
      });

      const serialized = serializeTree(emptyTree);
      const parsed = JSON.parse(serialized);

      expect(parsed.nodes).toHaveLength(0);
      expect(parsed.edges).toHaveLength(0);
    });
  });

  describe('deserializeTree', () => {
    it('should deserialize a JSON string to tree object', () => {
      const jsonString = JSON.stringify(sampleTree);
      const deserialized = deserializeTree(jsonString);

      expect(deserialized.id).toBe('test-tree');
      expect(deserialized.nodes).toHaveLength(4);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => deserializeTree('not valid json')).toThrow();
    });

    it('should throw error for JSON missing required fields', () => {
      const invalidTree = JSON.stringify({ name: 'Invalid' });

      expect(() => deserializeTree(invalidTree)).toThrow();
    });

    it('should handle trees with node positions', () => {
      const treeWithPositions = {
        ...sampleTree,
        nodes: sampleTree.nodes.map((node, index) => ({
          ...node,
          position: { x: index * 100, y: index * 50 },
        })),
      };

      const serialized = JSON.stringify(treeWithPositions);
      const deserialized = deserializeTree(serialized);

      expect(deserialized.nodes[0].position).toEqual({ x: 0, y: 0 });
    });
  });

  describe('exportToJson', () => {
    it('should export tree with formatting', () => {
      const exported = exportToJson(sampleTree, { pretty: true });

      expect(exported).toContain('\n');
      expect(exported).toContain('  ');
    });

    it('should export tree without formatting when compact', () => {
      const exported = exportToJson(sampleTree, { pretty: false });

      expect(exported).not.toContain('\n  ');
    });

    it('should include version information', () => {
      const exported = exportToJson(sampleTree, { includeVersion: true });
      const parsed = JSON.parse(exported);

      expect(parsed.exportVersion).toBeDefined();
    });

    it('should exclude metadata when specified', () => {
      const treeWithMetadata = {
        ...sampleTree,
        metadata: { createdAt: '2024-01-01', updatedAt: '2024-01-02' },
      };

      const exported = exportToJson(treeWithMetadata, { excludeMetadata: true });
      const parsed = JSON.parse(exported);

      expect(parsed.metadata).toBeUndefined();
    });
  });

  describe('importFromJson', () => {
    it('should import a valid JSON tree', () => {
      const jsonString = exportToJson(sampleTree);
      const imported = importFromJson(jsonString);

      expect(imported.id).toBe('test-tree');
      expect(imported.nodes).toHaveLength(4);
    });

    it('should generate new IDs when specified', () => {
      const jsonString = exportToJson(sampleTree);
      const imported = importFromJson(jsonString, { generateNewIds: true });

      expect(imported.id).not.toBe('test-tree');
    });

    it('should validate on import by default', () => {
      const invalidJson = JSON.stringify({
        name: 'Invalid',
        nodes: 'not-an-array',
      });

      expect(() => importFromJson(invalidJson)).toThrow();
    });

    it('should skip validation when specified', () => {
      const invalidJson = JSON.stringify({
        id: 'test',
        name: 'Test',
        nodes: [],
        edges: [],
        startNodeId: 'nonexistent',
      });

      expect(() => importFromJson(invalidJson, { skipValidation: true })).not.toThrow();
    });
  });

  describe('validateJsonSchema', () => {
    it('should validate correct tree schema', () => {
      const result = validateJsonSchema(sampleTree);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for missing id', () => {
      const invalidTree = { ...sampleTree, id: undefined } as any;
      const result = validateJsonSchema(invalidTree);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'id')).toBe(true);
    });

    it('should fail for invalid node type', () => {
      const treeWithInvalidNode = {
        ...sampleTree,
        nodes: [
          ...sampleTree.nodes,
          { id: 'bad', type: 'invalid-type', label: 'Bad Node' },
        ],
      };

      const result = validateJsonSchema(treeWithInvalidNode);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'nodes[4].type')).toBe(true);
    });

    it('should fail for edge referencing nonexistent node', () => {
      const treeWithBadEdge = {
        ...sampleTree,
        edges: [
          ...sampleTree.edges,
          { id: 'bad-edge', source: 'nonexistent', target: 'end' },
        ],
      };

      const result = validateJsonSchema(treeWithBadEdge);

      expect(result.valid).toBe(false);
    });

    it('should validate domain field', () => {
      const invalidDomain = { ...sampleTree, domain: 'INVALID' };
      const result = validateJsonSchema(invalidDomain);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'domain')).toBe(true);
    });
  });
});
