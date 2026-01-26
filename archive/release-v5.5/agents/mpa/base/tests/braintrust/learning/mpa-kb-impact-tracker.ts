/**
 * MPA KB Impact Tracker - STUB
 *
 * This module is temporarily stubbed while agent-core package
 * dependencies are being resolved. The KB impact tracking 
 * functionality is experimental and not required for core testing.
 *
 * TODO: Restore full implementation once agent-core exports are stable
 */

// ============================================================================
// STUB IMPLEMENTATION
// ============================================================================

export interface KBImpactTrackerConfig {
  agentId: string;
  minUsagesForImpact: number;
  confidenceThreshold: number;
  deprecationThreshold: number;
  enhancementThreshold: number;
  autoGenerateProposals: boolean;
  maxProposalQueueSize: number;
}

export class MPAKBImpactTracker {
  private config: KBImpactTrackerConfig;

  constructor(config?: Partial<KBImpactTrackerConfig>) {
    this.config = {
      agentId: 'mpa',
      minUsagesForImpact: 10,
      confidenceThreshold: 0.7,
      deprecationThreshold: -0.15,
      enhancementThreshold: 0.05,
      autoGenerateProposals: true,
      maxProposalQueueSize: 100,
      ...config,
    };
  }

  async recordRetrieval(
    _sessionId: string,
    _query: string,
    _retrievedDocs: Array<{ documentId: string; chunkIds: string[]; score: number }>
  ): Promise<string[]> {
    console.warn('MPAKBImpactTracker: stub implementation - recordRetrieval');
    return [];
  }

  async markAsUsed(_sessionId: string, _usedDocumentIds: string[]): Promise<void> {
    console.warn('MPAKBImpactTracker: stub implementation - markAsUsed');
  }

  async recordResponseQuality(_sessionId: string, _quality: number): Promise<void> {
    console.warn('MPAKBImpactTracker: stub implementation - recordResponseQuality');
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createMPAKBImpactTracker(
  config?: Partial<KBImpactTrackerConfig>
): MPAKBImpactTracker {
  return new MPAKBImpactTracker(config);
}

export default MPAKBImpactTracker;
