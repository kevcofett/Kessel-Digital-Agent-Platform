/**
 * KB Impact Tracking Types
 *
 * Defines interfaces for tracking which KB documents contribute
 * to successful vs unsuccessful agent responses.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Record of a single KB document usage in a conversation
 */
export interface KBUsageRecord {
  /**
   * Unique identifier for this usage record
   */
  id: string;

  /**
   * Agent that used the document (mpa, ca, eap)
   */
  agentId: string;

  /**
   * Document that was retrieved
   */
  documentId: string;

  /**
   * Specific chunk IDs that were used
   */
  chunkIds: string[];

  /**
   * Original user query that triggered retrieval
   */
  query: string;

  /**
   * Relevance score from retrieval system
   */
  retrievalScore: number;

  /**
   * Session/conversation identifier
   */
  sessionId: string;

  /**
   * Quality score of the response (0-1)
   * From evaluation or user feedback
   */
  responseQuality?: number;

  /**
   * Whether this document was actually used in the response
   * vs just retrieved but ignored
   */
  wasUsedInResponse: boolean;

  /**
   * Timestamp of usage
   */
  timestamp: Date;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Aggregated impact statistics for a single KB document
 */
export interface KBDocumentImpact {
  /**
   * Document identifier
   */
  documentId: string;

  /**
   * Document title/name for display
   */
  documentTitle: string;

  /**
   * Total number of times document was retrieved
   */
  totalRetrievals: number;

  /**
   * Number of times document was actually used in response
   */
  timesUsedInResponse: number;

  /**
   * Average response quality when this document was used
   */
  avgQualityWhenUsed: number;

  /**
   * Average response quality when this document was NOT used
   * (retrieved but ignored, or not retrieved at all)
   */
  avgQualityWhenNotUsed: number;

  /**
   * Impact score: positive = document helps, negative = document hurts
   * Calculated as: avgQualityWhenUsed - avgQualityWhenNotUsed
   */
  impactScore: number;

  /**
   * Statistical confidence in the impact score (0-1)
   * Based on sample size
   */
  confidence: number;

  /**
   * Recommended action based on impact analysis
   */
  recommendedAction: KBDocumentAction;

  /**
   * Specific chunks that have high/low impact
   */
  chunkAnalysis?: KBChunkImpact[];

  /**
   * Topics/queries where this document performs well
   */
  strongTopics: string[];

  /**
   * Topics/queries where this document performs poorly
   */
  weakTopics: string[];

  /**
   * Last updated timestamp
   */
  lastUpdated: Date;
}

/**
 * Recommended actions for KB documents
 */
export type KBDocumentAction =
  | 'keep'           // Document is helpful, keep as-is
  | 'enhance'        // Document helps but could be improved
  | 'deprecate'      // Document hurts more than helps
  | 'split'          // Document is too long/broad, should be split
  | 'merge'          // Document overlaps with others, consider merging
  | 'review'         // Insufficient data, needs manual review
  | 'retrain';       // Document content is outdated

/**
 * Impact analysis for individual chunks within a document
 */
export interface KBChunkImpact {
  chunkId: string;
  chunkIndex: number;
  timesRetrieved: number;
  avgQualityWhenUsed: number;
  impactScore: number;
  contentPreview: string;
  recommendedAction: 'keep' | 'improve' | 'remove';
}

// ============================================================================
// UPDATE PIPELINE TYPES
// ============================================================================

/**
 * Proposed update to a KB document
 */
export interface KBUpdateProposal {
  id: string;
  agentId: string;
  updateType: KBUpdateType;
  targetDocumentIds: string[];
  rationale: string;
  triggeringImpact: KBDocumentImpact;
  proposedChanges: KBProposedChange;
  priority: number;
  status: KBUpdateStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type KBUpdateType =
  | 'content-enhancement'
  | 'content-deprecation'
  | 'document-split'
  | 'document-merge'
  | 'metadata-update'
  | 'new-document'
  | 'chunk-reorganization';

export type KBUpdateStatus =
  | 'proposed'
  | 'approved'
  | 'rejected'
  | 'applied'
  | 'reverted';

export interface KBProposedChange {
  newContent?: string;
  splitPlan?: {
    newDocuments: Array<{
      title: string;
      content: string;
      chunkIds: string[];
    }>;
  };
  mergePlan?: {
    documentsToMerge: string[];
    mergedTitle: string;
    mergedContent: string;
  };
  metadataChanges?: Record<string, unknown>;
}

// ============================================================================
// CONFIGURATION
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

export const DEFAULT_KB_IMPACT_CONFIG: KBImpactTrackerConfig = {
  agentId: 'unknown',
  minUsagesForImpact: 10,
  confidenceThreshold: 0.7,
  deprecationThreshold: -0.15,
  enhancementThreshold: 0.05,
  autoGenerateProposals: true,
  maxProposalQueueSize: 100,
};

// ============================================================================
// STORAGE INTERFACE
// ============================================================================

/**
 * Storage interface for KB impact data
 * Implementations: LocalFS, Dataverse, etc.
 */
export interface KBImpactStorage {
  // Usage records
  saveUsageRecord(record: KBUsageRecord): Promise<void>;
  getUsageRecords(filter: KBUsageFilter): Promise<KBUsageRecord[]>;

  // Impact summaries
  saveDocumentImpact(impact: KBDocumentImpact): Promise<void>;
  getDocumentImpact(documentId: string): Promise<KBDocumentImpact | null>;
  getAllDocumentImpacts(agentId: string): Promise<KBDocumentImpact[]>;

  // Update proposals
  saveProposal(proposal: KBUpdateProposal): Promise<void>;
  getProposal(id: string): Promise<KBUpdateProposal | null>;
  getProposals(filter: KBProposalFilter): Promise<KBUpdateProposal[]>;
  updateProposalStatus(id: string, status: KBUpdateStatus): Promise<void>;
}

export interface KBUsageFilter {
  agentId?: string;
  documentId?: string;
  sessionId?: string;
  startDate?: Date;
  endDate?: Date;
  minQuality?: number;
  maxQuality?: number;
  limit?: number;
}

export interface KBProposalFilter {
  agentId?: string;
  status?: KBUpdateStatus;
  updateType?: KBUpdateType;
  minPriority?: number;
  limit?: number;
}
