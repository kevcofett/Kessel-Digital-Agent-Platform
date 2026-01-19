/**
 * Tree Serialization Utilities
 */

import { DecisionTree, TreeSession } from '../types';

export function serializeTree(tree: DecisionTree): string {
  return JSON.stringify(tree, null, 2);
}

export function deserializeTree(json: string): DecisionTree {
  const parsed = JSON.parse(json);
  
  if (!parsed.id || !parsed.nodes || !parsed.edges) {
    throw new Error('Invalid tree format: missing required fields');
  }
  
  return parsed as DecisionTree;
}

export function serializeSession(session: TreeSession): string {
  return JSON.stringify(session, null, 2);
}

export function deserializeSession(json: string): TreeSession {
  const parsed = JSON.parse(json);
  
  if (!parsed.id || !parsed.treeId || !parsed.currentNodeId) {
    throw new Error('Invalid session format: missing required fields');
  }
  
  return parsed as TreeSession;
}

export function exportTreeToFile(tree: DecisionTree, filename: string): void {
  const json = serializeTree(tree);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : filename + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importTreeFromFile(file: File): Promise<DecisionTree> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const tree = deserializeTree(reader.result as string);
        resolve(tree);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function cloneTree(tree: DecisionTree, newId?: string): DecisionTree {
  const cloned = JSON.parse(JSON.stringify(tree)) as DecisionTree;
  if (newId) {
    cloned.id = newId;
  }
  return cloned;
}

export function cloneSession(session: TreeSession, newId?: string): TreeSession {
  const cloned = JSON.parse(JSON.stringify(session)) as TreeSession;
  if (newId) {
    cloned.id = newId;
  }
  return cloned;
}
