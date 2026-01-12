# PHASE 3: KB IMPACT TRACKING
# VS Code Claude Execution Plan - Steps 28-35

**Depends On:** Phase 1 Complete, Phase 2 Complete
**Estimated Time:** 2-3 hours
**Branch:** deploy/personal

---

## OVERVIEW

This phase:
- Extracts KB impact tracking from MPA-specific to agent-core generic
- Creates BaseKBImpactTracker with pluggable storage
- Creates BaseKBUpdatePipeline for automated KB improvements
- Provides agent-specific adapters for MPA, CA, EAP
- Enables all agents to learn which KB documents help vs hurt

---

## PRE-FLIGHT CHECK

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify Phase 2 complete
cd packages/agent-core && npm run build
# Should succeed with embedding providers

# Check MPA has existing kb-impact-tracker.ts to reference
ls release/v5.5/agents/mpa/base/tests/braintrust/kb-impact-tracker.ts
# Should exist
```

---

# STEP 28: Create KB Impact Tracking Types

**File:** `packages/agent-core/src/learning/kb-impact-types.ts`

```typescript
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
```

---

# STEP 29: Create Base KB Impact Tracker

**File:** `packages/agent-core/src/learning/base-kb-impact-tracker.ts`

```typescript
/**
 * Base KB Impact Tracker
 * 
 * Generic implementation for tracking KB document impact across all agents.
 * Agent-specific trackers extend this class with custom logic.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  KBUsageRecord,
  KBDocumentImpact,
  KBDocumentAction,
  KBChunkImpact,
  KBImpactTrackerConfig,
  KBImpactStorage,
  KBUsageFilter,
} from './kb-impact-types.js';
import { DEFAULT_KB_IMPACT_CONFIG } from './kb-impact-types.js';

// ============================================================================
// BASE KB IMPACT TRACKER
// ============================================================================

export class BaseKBImpactTracker {
  protected config: KBImpactTrackerConfig;
  protected storage: KBImpactStorage;
  
  // In-memory cache for current session
  protected sessionRecords: Map<string, KBUsageRecord[]> = new Map();
  protected documentImpactCache: Map<string, KBDocumentImpact> = new Map();
  
  constructor(
    config: Partial<KBImpactTrackerConfig>,
    storage: KBImpactStorage
  ) {
    this.config = { ...DEFAULT_KB_IMPACT_CONFIG, ...config };
    this.storage = storage;
  }
  
  // ==========================================================================
  // RECORDING USAGE
  // ==========================================================================
  
  /**
   * Record that KB documents were retrieved for a query
   */
  async recordRetrieval(
    sessionId: string,
    query: string,
    retrievedDocs: Array<{
      documentId: string;
      chunkIds: string[];
      score: number;
    }>
  ): Promise<string[]> {
    const recordIds: string[] = [];
    
    for (const doc of retrievedDocs) {
      const record: KBUsageRecord = {
        id: uuidv4(),
        agentId: this.config.agentId,
        documentId: doc.documentId,
        chunkIds: doc.chunkIds,
        query,
        retrievalScore: doc.score,
        sessionId,
        wasUsedInResponse: false,  // Will be updated later
        timestamp: new Date(),
      };
      
      // Store in memory for this session
      if (!this.sessionRecords.has(sessionId)) {
        this.sessionRecords.set(sessionId, []);
      }
      this.sessionRecords.get(sessionId)!.push(record);
      
      // Persist to storage
      await this.storage.saveUsageRecord(record);
      
      recordIds.push(record.id);
    }
    
    return recordIds;
  }
  
  /**
   * Mark documents as actually used in the response
   */
  async markAsUsed(
    sessionId: string,
    usedDocumentIds: string[]
  ): Promise<void> {
    const records = this.sessionRecords.get(sessionId) || [];
    
    for (const record of records) {
      if (usedDocumentIds.includes(record.documentId)) {
        record.wasUsedInResponse = true;
        await this.storage.saveUsageRecord(record);
      }
    }
  }
  
  /**
   * Record the quality score for a session's response
   */
  async recordQuality(
    sessionId: string,
    qualityScore: number
  ): Promise<void> {
    const records = this.sessionRecords.get(sessionId) || [];
    
    for (const record of records) {
      record.responseQuality = qualityScore;
      await this.storage.saveUsageRecord(record);
    }
    
    // Trigger impact recalculation for affected documents
    const documentIds = [...new Set(records.map(r => r.documentId))];
    for (const docId of documentIds) {
      await this.recalculateDocumentImpact(docId);
    }
  }
  
  // ==========================================================================
  // IMPACT CALCULATION
  // ==========================================================================
  
  /**
   * Recalculate impact score for a specific document
   */
  async recalculateDocumentImpact(documentId: string): Promise<KBDocumentImpact> {
    // Get all usage records for this document
    const records = await this.storage.getUsageRecords({
      agentId: this.config.agentId,
      documentId,
    });
    
    // Get baseline quality (when this document was NOT used)
    const baselineRecords = await this.storage.getUsageRecords({
      agentId: this.config.agentId,
    });
    
    // Calculate metrics
    const usedRecords = records.filter(r => r.wasUsedInResponse && r.responseQuality !== undefined);
    const notUsedRecords = baselineRecords.filter(
      r => !r.chunkIds.some(c => records.some(rec => rec.chunkIds.includes(c))) &&
           r.responseQuality !== undefined
    );
    
    const avgQualityWhenUsed = usedRecords.length > 0
      ? usedRecords.reduce((sum, r) => sum + (r.responseQuality || 0), 0) / usedRecords.length
      : 0;
    
    const avgQualityWhenNotUsed = notUsedRecords.length > 0
      ? notUsedRecords.reduce((sum, r) => sum + (r.responseQuality || 0), 0) / notUsedRecords.length
      : 0.5;  // Default baseline
    
    const impactScore = avgQualityWhenUsed - avgQualityWhenNotUsed;
    const confidence = this.calculateConfidence(usedRecords.length, notUsedRecords.length);
    
    // Determine recommended action
    const recommendedAction = this.determineAction(impactScore, confidence, records.length);
    
    // Analyze topics
    const { strongTopics, weakTopics } = this.analyzeTopics(records);
    
    const impact: KBDocumentImpact = {
      documentId,
      documentTitle: this.extractDocumentTitle(documentId),
      totalRetrievals: records.length,
      timesUsedInResponse: usedRecords.length,
      avgQualityWhenUsed,
      avgQualityWhenNotUsed,
      impactScore,
      confidence,
      recommendedAction,
      strongTopics,
      weakTopics,
      lastUpdated: new Date(),
    };
    
    // Cache and persist
    this.documentImpactCache.set(documentId, impact);
    await this.storage.saveDocumentImpact(impact);
    
    return impact;
  }
  
  /**
   * Get impact data for all documents
   */
  async getAllDocumentImpacts(): Promise<KBDocumentImpact[]> {
    return this.storage.getAllDocumentImpacts(this.config.agentId);
  }
  
  /**
   * Get documents sorted by impact score
   */
  async getDocumentsByImpact(
    order: 'asc' | 'desc' = 'desc'
  ): Promise<KBDocumentImpact[]> {
    const impacts = await this.getAllDocumentImpacts();
    return impacts.sort((a, b) => 
      order === 'desc' 
        ? b.impactScore - a.impactScore 
        : a.impactScore - b.impactScore
    );
  }
  
  /**
   * Get documents needing attention (low impact or low confidence)
   */
  async getDocumentsNeedingAttention(): Promise<KBDocumentImpact[]> {
    const impacts = await this.getAllDocumentImpacts();
    return impacts.filter(
      i => i.recommendedAction !== 'keep' || i.confidence < this.config.confidenceThreshold
    );
  }
  
  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  
  protected calculateConfidence(usedCount: number, baselineCount: number): number {
    // Simple confidence based on sample size
    const minSamples = this.config.minUsagesForImpact;
    const usedConfidence = Math.min(usedCount / minSamples, 1);
    const baselineConfidence = Math.min(baselineCount / (minSamples * 2), 1);
    return (usedConfidence + baselineConfidence) / 2;
  }
  
  protected determineAction(
    impactScore: number,
    confidence: number,
    totalUsages: number
  ): KBDocumentAction {
    // Not enough data
    if (totalUsages < this.config.minUsagesForImpact) {
      return 'review';
    }
    
    // Low confidence
    if (confidence < this.config.confidenceThreshold) {
      return 'review';
    }
    
    // Clear negative impact
    if (impactScore < this.config.deprecationThreshold) {
      return 'deprecate';
    }
    
    // Positive but could be better
    if (impactScore > 0 && impactScore < this.config.enhancementThreshold) {
      return 'enhance';
    }
    
    // Strong positive impact
    if (impactScore >= this.config.enhancementThreshold) {
      return 'keep';
    }
    
    // Neutral - might need review
    return 'review';
  }
  
  protected analyzeTopics(records: KBUsageRecord[]): {
    strongTopics: string[];
    weakTopics: string[];
  } {
    const topicScores: Map<string, { total: number; count: number }> = new Map();
    
    for (const record of records) {
      if (record.responseQuality === undefined) continue;
      
      // Extract topic keywords from query
      const topics = this.extractTopics(record.query);
      
      for (const topic of topics) {
        const existing = topicScores.get(topic) || { total: 0, count: 0 };
        existing.total += record.responseQuality;
        existing.count += 1;
        topicScores.set(topic, existing);
      }
    }
    
    const strongTopics: string[] = [];
    const weakTopics: string[] = [];
    
    for (const [topic, scores] of topicScores) {
      if (scores.count < 3) continue;  // Need minimum samples
      
      const avgScore = scores.total / scores.count;
      if (avgScore >= 0.7) {
        strongTopics.push(topic);
      } else if (avgScore < 0.4) {
        weakTopics.push(topic);
      }
    }
    
    return { strongTopics, weakTopics };
  }
  
  /**
   * Extract topic keywords from a query
   * Override in agent-specific implementations for domain-specific extraction
   */
  protected extractTopics(query: string): string[] {
    // Basic implementation - extract significant words
    const stopWords = new Set([
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'shall',
      'can', 'need', 'to', 'of', 'in', 'for', 'on', 'with', 'at',
      'by', 'from', 'as', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'under', 'again',
      'further', 'then', 'once', 'here', 'there', 'when', 'where',
      'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other',
      'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
      'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
      'because', 'until', 'while', 'what', 'which', 'who', 'whom',
      'this', 'that', 'these', 'those', 'am', 'i', 'me', 'my', 'we',
      'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it',
      'its', 'they', 'them', 'their',
    ]);
    
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }
  
  protected extractDocumentTitle(documentId: string): string {
    // Basic implementation - extract from document ID
    // Override for agent-specific logic
    return documentId.replace(/[-_]/g, ' ').replace(/\.\w+$/, '');
  }
  
  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================
  
  /**
   * Clear session data (call after session ends)
   */
  clearSession(sessionId: string): void {
    this.sessionRecords.delete(sessionId);
  }
  
  /**
   * Clear all in-memory caches
   */
  clearCache(): void {
    this.sessionRecords.clear();
    this.documentImpactCache.clear();
  }
}

export default BaseKBImpactTracker;
```

---

# STEP 30: Create Local FS KB Impact Storage

**File:** `packages/agent-core/src/learning/local-kb-impact-storage.ts`

```typescript
/**
 * Local File System KB Impact Storage
 * 
 * Stores KB impact data in local JSON files.
 * Used for development and testing.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  KBImpactStorage,
  KBUsageRecord,
  KBDocumentImpact,
  KBUpdateProposal,
  KBUsageFilter,
  KBProposalFilter,
  KBUpdateStatus,
} from './kb-impact-types.js';

// ============================================================================
// LOCAL FS STORAGE IMPLEMENTATION
// ============================================================================

export class LocalKBImpactStorage implements KBImpactStorage {
  private basePath: string;
  private usageRecordsFile: string;
  private impactsFile: string;
  private proposalsFile: string;
  
  // In-memory cache
  private usageRecords: KBUsageRecord[] = [];
  private impacts: Map<string, KBDocumentImpact> = new Map();
  private proposals: Map<string, KBUpdateProposal> = new Map();
  private isLoaded = false;
  
  constructor(basePath: string) {
    this.basePath = basePath;
    this.usageRecordsFile = path.join(basePath, 'kb-usage-records.json');
    this.impactsFile = path.join(basePath, 'kb-document-impacts.json');
    this.proposalsFile = path.join(basePath, 'kb-update-proposals.json');
  }
  
  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  
  private async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;
    
    // Ensure directory exists
    await fs.mkdir(this.basePath, { recursive: true });
    
    // Load usage records
    try {
      const data = await fs.readFile(this.usageRecordsFile, 'utf-8');
      this.usageRecords = JSON.parse(data);
    } catch {
      this.usageRecords = [];
    }
    
    // Load impacts
    try {
      const data = await fs.readFile(this.impactsFile, 'utf-8');
      const impactsArray: KBDocumentImpact[] = JSON.parse(data);
      this.impacts = new Map(impactsArray.map(i => [i.documentId, i]));
    } catch {
      this.impacts = new Map();
    }
    
    // Load proposals
    try {
      const data = await fs.readFile(this.proposalsFile, 'utf-8');
      const proposalsArray: KBUpdateProposal[] = JSON.parse(data);
      this.proposals = new Map(proposalsArray.map(p => [p.id, p]));
    } catch {
      this.proposals = new Map();
    }
    
    this.isLoaded = true;
  }
  
  private async saveUsageRecords(): Promise<void> {
    await fs.writeFile(
      this.usageRecordsFile,
      JSON.stringify(this.usageRecords, null, 2)
    );
  }
  
  private async saveImpacts(): Promise<void> {
    await fs.writeFile(
      this.impactsFile,
      JSON.stringify(Array.from(this.impacts.values()), null, 2)
    );
  }
  
  private async saveProposals(): Promise<void> {
    await fs.writeFile(
      this.proposalsFile,
      JSON.stringify(Array.from(this.proposals.values()), null, 2)
    );
  }
  
  // ==========================================================================
  // USAGE RECORDS
  // ==========================================================================
  
  async saveUsageRecord(record: KBUsageRecord): Promise<void> {
    await this.ensureLoaded();
    
    // Update existing or add new
    const index = this.usageRecords.findIndex(r => r.id === record.id);
    if (index >= 0) {
      this.usageRecords[index] = record;
    } else {
      this.usageRecords.push(record);
    }
    
    await this.saveUsageRecords();
  }
  
  async getUsageRecords(filter: KBUsageFilter): Promise<KBUsageRecord[]> {
    await this.ensureLoaded();
    
    let results = [...this.usageRecords];
    
    if (filter.agentId) {
      results = results.filter(r => r.agentId === filter.agentId);
    }
    
    if (filter.documentId) {
      results = results.filter(r => r.documentId === filter.documentId);
    }
    
    if (filter.sessionId) {
      results = results.filter(r => r.sessionId === filter.sessionId);
    }
    
    if (filter.startDate) {
      results = results.filter(r => new Date(r.timestamp) >= filter.startDate!);
    }
    
    if (filter.endDate) {
      results = results.filter(r => new Date(r.timestamp) <= filter.endDate!);
    }
    
    if (filter.minQuality !== undefined) {
      results = results.filter(r => 
        r.responseQuality !== undefined && r.responseQuality >= filter.minQuality!
      );
    }
    
    if (filter.maxQuality !== undefined) {
      results = results.filter(r => 
        r.responseQuality !== undefined && r.responseQuality <= filter.maxQuality!
      );
    }
    
    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }
    
    return results;
  }
  
  // ==========================================================================
  // DOCUMENT IMPACTS
  // ==========================================================================
  
  async saveDocumentImpact(impact: KBDocumentImpact): Promise<void> {
    await this.ensureLoaded();
    this.impacts.set(impact.documentId, impact);
    await this.saveImpacts();
  }
  
  async getDocumentImpact(documentId: string): Promise<KBDocumentImpact | null> {
    await this.ensureLoaded();
    return this.impacts.get(documentId) || null;
  }
  
  async getAllDocumentImpacts(agentId: string): Promise<KBDocumentImpact[]> {
    await this.ensureLoaded();
    // Note: In a multi-agent setup, filter by agentId
    // For now, return all impacts
    return Array.from(this.impacts.values());
  }
  
  // ==========================================================================
  // UPDATE PROPOSALS
  // ==========================================================================
  
  async saveProposal(proposal: KBUpdateProposal): Promise<void> {
    await this.ensureLoaded();
    this.proposals.set(proposal.id, proposal);
    await this.saveProposals();
  }
  
  async getProposal(id: string): Promise<KBUpdateProposal | null> {
    await this.ensureLoaded();
    return this.proposals.get(id) || null;
  }
  
  async getProposals(filter: KBProposalFilter): Promise<KBUpdateProposal[]> {
    await this.ensureLoaded();
    
    let results = Array.from(this.proposals.values());
    
    if (filter.agentId) {
      results = results.filter(p => p.agentId === filter.agentId);
    }
    
    if (filter.status) {
      results = results.filter(p => p.status === filter.status);
    }
    
    if (filter.updateType) {
      results = results.filter(p => p.updateType === filter.updateType);
    }
    
    if (filter.minPriority !== undefined) {
      results = results.filter(p => p.priority >= filter.minPriority!);
    }
    
    // Sort by priority descending
    results.sort((a, b) => b.priority - a.priority);
    
    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }
    
    return results;
  }
  
  async updateProposalStatus(id: string, status: KBUpdateStatus): Promise<void> {
    await this.ensureLoaded();
    
    const proposal = this.proposals.get(id);
    if (proposal) {
      proposal.status = status;
      proposal.updatedAt = new Date();
      await this.saveProposals();
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createLocalKBImpactStorage(basePath: string): LocalKBImpactStorage {
  return new LocalKBImpactStorage(basePath);
}

export default LocalKBImpactStorage;
```

---

# STEP 31: Create KB Update Pipeline

**File:** `packages/agent-core/src/learning/kb-update-pipeline.ts`

```typescript
/**
 * KB Update Pipeline
 * 
 * Automates the process of generating KB improvement proposals
 * based on impact tracking data.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  KBDocumentImpact,
  KBUpdateProposal,
  KBUpdateType,
  KBProposedChange,
  KBImpactStorage,
} from './kb-impact-types.js';
import type { BaseKBImpactTracker } from './base-kb-impact-tracker.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface KBUpdatePipelineConfig {
  agentId: string;
  
  // Thresholds for automatic proposal generation
  autoDeprecationThreshold: number;
  autoEnhancementThreshold: number;
  autoSplitThreshold: number;  // Document size/chunk count threshold
  
  // Proposal limits
  maxProposalsPerRun: number;
  proposalCooldownDays: number;  // Don't re-propose for same doc within this period
  
  // Enable/disable automatic proposal types
  enableDeprecationProposals: boolean;
  enableEnhancementProposals: boolean;
  enableSplitProposals: boolean;
  enableMergeProposals: boolean;
}

export const DEFAULT_UPDATE_PIPELINE_CONFIG: KBUpdatePipelineConfig = {
  agentId: 'unknown',
  autoDeprecationThreshold: -0.2,
  autoEnhancementThreshold: 0.1,
  autoSplitThreshold: 10,  // More than 10 chunks suggests split
  maxProposalsPerRun: 10,
  proposalCooldownDays: 7,
  enableDeprecationProposals: true,
  enableEnhancementProposals: true,
  enableSplitProposals: true,
  enableMergeProposals: false,  // Requires more sophisticated analysis
};

// ============================================================================
// KB UPDATE PIPELINE
// ============================================================================

export class KBUpdatePipeline {
  private config: KBUpdatePipelineConfig;
  private storage: KBImpactStorage;
  private tracker: BaseKBImpactTracker;
  
  constructor(
    config: Partial<KBUpdatePipelineConfig>,
    storage: KBImpactStorage,
    tracker: BaseKBImpactTracker
  ) {
    this.config = { ...DEFAULT_UPDATE_PIPELINE_CONFIG, ...config };
    this.storage = storage;
    this.tracker = tracker;
  }
  
  // ==========================================================================
  // PROPOSAL GENERATION
  // ==========================================================================
  
  /**
   * Run the pipeline to generate new proposals
   */
  async generateProposals(): Promise<KBUpdateProposal[]> {
    const impacts = await this.tracker.getAllDocumentImpacts();
    const existingProposals = await this.storage.getProposals({
      agentId: this.config.agentId,
      status: 'proposed',
    });
    
    // Get documents that already have pending proposals
    const documentsWithProposals = new Set(
      existingProposals.flatMap(p => p.targetDocumentIds)
    );
    
    const newProposals: KBUpdateProposal[] = [];
    
    for (const impact of impacts) {
      // Skip if already has pending proposal
      if (documentsWithProposals.has(impact.documentId)) {
        continue;
      }
      
      // Skip if in cooldown period
      if (await this.isInCooldown(impact.documentId)) {
        continue;
      }
      
      // Generate appropriate proposal
      const proposal = this.generateProposalForDocument(impact);
      if (proposal) {
        newProposals.push(proposal);
        await this.storage.saveProposal(proposal);
        
        if (newProposals.length >= this.config.maxProposalsPerRun) {
          break;
        }
      }
    }
    
    return newProposals;
  }
  
  /**
   * Generate a proposal for a specific document based on its impact
   */
  private generateProposalForDocument(
    impact: KBDocumentImpact
  ): KBUpdateProposal | null {
    // Check for deprecation
    if (
      this.config.enableDeprecationProposals &&
      impact.impactScore < this.config.autoDeprecationThreshold &&
      impact.confidence >= 0.7
    ) {
      return this.createDeprecationProposal(impact);
    }
    
    // Check for enhancement
    if (
      this.config.enableEnhancementProposals &&
      impact.recommendedAction === 'enhance'
    ) {
      return this.createEnhancementProposal(impact);
    }
    
    // Check for split (would need chunk count info)
    if (
      this.config.enableSplitProposals &&
      impact.recommendedAction === 'split'
    ) {
      return this.createSplitProposal(impact);
    }
    
    return null;
  }
  
  // ==========================================================================
  // PROPOSAL CREATORS
  // ==========================================================================
  
  private createDeprecationProposal(impact: KBDocumentImpact): KBUpdateProposal {
    return {
      id: uuidv4(),
      agentId: this.config.agentId,
      updateType: 'content-deprecation',
      targetDocumentIds: [impact.documentId],
      rationale: this.generateDeprecationRationale(impact),
      triggeringImpact: impact,
      proposedChanges: {
        metadataChanges: {
          deprecated: true,
          deprecationReason: 'Low impact score based on usage analysis',
          deprecatedAt: new Date().toISOString(),
        },
      },
      priority: Math.abs(impact.impactScore) * 100,
      status: 'proposed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  private createEnhancementProposal(impact: KBDocumentImpact): KBUpdateProposal {
    return {
      id: uuidv4(),
      agentId: this.config.agentId,
      updateType: 'content-enhancement',
      targetDocumentIds: [impact.documentId],
      rationale: this.generateEnhancementRationale(impact),
      triggeringImpact: impact,
      proposedChanges: {
        metadataChanges: {
          needsEnhancement: true,
          weakTopics: impact.weakTopics,
          strongTopics: impact.strongTopics,
        },
      },
      priority: 50 + (impact.totalRetrievals * 0.1),
      status: 'proposed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  private createSplitProposal(impact: KBDocumentImpact): KBUpdateProposal {
    return {
      id: uuidv4(),
      agentId: this.config.agentId,
      updateType: 'document-split',
      targetDocumentIds: [impact.documentId],
      rationale: this.generateSplitRationale(impact),
      triggeringImpact: impact,
      proposedChanges: {
        splitPlan: {
          newDocuments: [],  // To be filled by manual review
        },
      },
      priority: 30,
      status: 'proposed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  // ==========================================================================
  // RATIONALE GENERATORS
  // ==========================================================================
  
  private generateDeprecationRationale(impact: KBDocumentImpact): string {
    const parts = [
      `Document "${impact.documentTitle}" has a negative impact score of ${impact.impactScore.toFixed(3)}.`,
      `It has been retrieved ${impact.totalRetrievals} times but used only ${impact.timesUsedInResponse} times.`,
      `Average quality when used: ${(impact.avgQualityWhenUsed * 100).toFixed(1)}%`,
      `Average quality when not used: ${(impact.avgQualityWhenNotUsed * 100).toFixed(1)}%`,
    ];
    
    if (impact.weakTopics.length > 0) {
      parts.push(`Performs poorly on topics: ${impact.weakTopics.join(', ')}`);
    }
    
    parts.push('Recommendation: Review for deprecation or significant revision.');
    
    return parts.join('\n');
  }
  
  private generateEnhancementRationale(impact: KBDocumentImpact): string {
    const parts = [
      `Document "${impact.documentTitle}" shows potential for improvement.`,
      `Impact score: ${impact.impactScore.toFixed(3)} (positive but below threshold)`,
      `Retrieved ${impact.totalRetrievals} times, used ${impact.timesUsedInResponse} times.`,
    ];
    
    if (impact.strongTopics.length > 0) {
      parts.push(`Strong performance on: ${impact.strongTopics.join(', ')}`);
    }
    
    if (impact.weakTopics.length > 0) {
      parts.push(`Needs improvement on: ${impact.weakTopics.join(', ')}`);
    }
    
    parts.push('Recommendation: Enhance content for weak topics while maintaining strengths.');
    
    return parts.join('\n');
  }
  
  private generateSplitRationale(impact: KBDocumentImpact): string {
    return [
      `Document "${impact.documentTitle}" may be too broad.`,
      `It covers multiple topics with varying performance.`,
      `Strong topics: ${impact.strongTopics.join(', ') || 'none identified'}`,
      `Weak topics: ${impact.weakTopics.join(', ') || 'none identified'}`,
      'Recommendation: Split into focused documents for each major topic.',
    ].join('\n');
  }
  
  // ==========================================================================
  // HELPERS
  // ==========================================================================
  
  private async isInCooldown(documentId: string): Promise<boolean> {
    const recentProposals = await this.storage.getProposals({
      agentId: this.config.agentId,
    });
    
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() - this.config.proposalCooldownDays);
    
    return recentProposals.some(
      p => p.targetDocumentIds.includes(documentId) &&
           new Date(p.createdAt) > cooldownDate
    );
  }
  
  // ==========================================================================
  // PROPOSAL MANAGEMENT
  // ==========================================================================
  
  /**
   * Approve a proposal
   */
  async approveProposal(proposalId: string): Promise<void> {
    await this.storage.updateProposalStatus(proposalId, 'approved');
  }
  
  /**
   * Reject a proposal
   */
  async rejectProposal(proposalId: string): Promise<void> {
    await this.storage.updateProposalStatus(proposalId, 'rejected');
  }
  
  /**
   * Mark a proposal as applied
   */
  async markProposalApplied(proposalId: string): Promise<void> {
    await this.storage.updateProposalStatus(proposalId, 'applied');
  }
  
  /**
   * Get all pending proposals
   */
  async getPendingProposals(): Promise<KBUpdateProposal[]> {
    return this.storage.getProposals({
      agentId: this.config.agentId,
      status: 'proposed',
    });
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createKBUpdatePipeline(
  config: Partial<KBUpdatePipelineConfig>,
  storage: KBImpactStorage,
  tracker: BaseKBImpactTracker
): KBUpdatePipeline {
  return new KBUpdatePipeline(config, storage, tracker);
}

export default KBUpdatePipeline;
```

---

# STEP 32: Create MPA KB Impact Tracker Adapter

**File:** `release/v5.5/agents/mpa/base/tests/braintrust/learning/mpa-kb-impact-tracker.ts`

```typescript
/**
 * MPA KB Impact Tracker
 * 
 * MPA-specific implementation of KB impact tracking.
 * Extends BaseKBImpactTracker with media planning domain knowledge.
 */

import { BaseKBImpactTracker, LocalKBImpactStorage } from '@kessel-digital/agent-core';
import type { KBImpactTrackerConfig } from '@kessel-digital/agent-core';
import * as path from 'path';

// ============================================================================
// MPA-SPECIFIC TOPIC EXTRACTION
// ============================================================================

const MPA_TOPIC_KEYWORDS: Record<string, string[]> = {
  'budget': ['budget', 'spend', 'allocation', 'investment', 'cost', 'funding'],
  'audience': ['audience', 'targeting', 'segment', 'persona', 'demographic'],
  'channel': ['channel', 'media', 'platform', 'tactic', 'paid search', 'social'],
  'measurement': ['measurement', 'attribution', 'tracking', 'analytics', 'kpi'],
  'benchmark': ['benchmark', 'average', 'typical', 'industry', 'baseline'],
  'creative': ['creative', 'messaging', 'ad copy', 'content', 'value prop'],
  'optimization': ['optimization', 'improve', 'efficiency', 'performance'],
  'testing': ['test', 'experiment', 'incrementality', 'holdout', 'lift'],
};

const MPA_STEP_KEYWORDS: Record<number, string[]> = {
  1: ['objective', 'goal', 'kpi', 'target'],
  2: ['economics', 'ltv', 'cac', 'unit economics'],
  3: ['audience', 'targeting', 'segment'],
  4: ['geography', 'geo', 'region', 'dma'],
  5: ['budget', 'spend', 'allocation'],
  6: ['value proposition', 'messaging', 'creative'],
  7: ['channel', 'media', 'tactic'],
  8: ['measurement', 'attribution'],
  9: ['testing', 'experiment'],
  10: ['risk', 'contingency'],
};

// ============================================================================
// MPA KB IMPACT TRACKER
// ============================================================================

export class MPAKBImpactTracker extends BaseKBImpactTracker {
  constructor(config?: Partial<KBImpactTrackerConfig>) {
    const storagePath = path.join(process.cwd(), '.mpa-kb-impact');
    const storage = new LocalKBImpactStorage(storagePath);
    
    super(
      {
        agentId: 'mpa',
        minUsagesForImpact: 10,
        confidenceThreshold: 0.7,
        deprecationThreshold: -0.15,
        enhancementThreshold: 0.05,
        autoGenerateProposals: true,
        maxProposalQueueSize: 100,
        ...config,
      },
      storage
    );
  }
  
  /**
   * Extract MPA-specific topics from a query
   */
  protected override extractTopics(query: string): string[] {
    const normalizedQuery = query.toLowerCase();
    const topics: string[] = [];
    
    // Extract domain topics
    for (const [topic, keywords] of Object.entries(MPA_TOPIC_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword)) {
          topics.push(topic);
          break;
        }
      }
    }
    
    // Extract step references
    for (const [step, keywords] of Object.entries(MPA_STEP_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword)) {
          topics.push(`step-${step}`);
          break;
        }
      }
    }
    
    // Fall back to base implementation if no domain topics found
    if (topics.length === 0) {
      return super.extractTopics(query);
    }
    
    return [...new Set(topics)];
  }
  
  /**
   * Extract document title with MPA-specific logic
   */
  protected override extractDocumentTitle(documentId: string): string {
    // MPA documents often have prefixes like KB_, MPA_, etc.
    let title = documentId
      .replace(/^(KB_|MPA_|mpa_)/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\.\w+$/, '')
      .trim();
    
    // Capitalize first letter of each word
    title = title.replace(/\b\w/g, c => c.toUpperCase());
    
    return title;
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
```

---

# STEP 33: Create CA KB Impact Tracker Adapter

**File:** `release/v5.5/agents/ca/base/tests/braintrust/learning/ca-kb-impact-tracker.ts`

```typescript
/**
 * CA KB Impact Tracker
 * 
 * CA-specific implementation of KB impact tracking.
 * Extends BaseKBImpactTracker with consulting domain knowledge.
 */

import { BaseKBImpactTracker, LocalKBImpactStorage } from '@kessel-digital/agent-core';
import type { KBImpactTrackerConfig } from '@kessel-digital/agent-core';
import * as path from 'path';

// ============================================================================
// CA-SPECIFIC TOPIC EXTRACTION
// ============================================================================

const CA_TOPIC_KEYWORDS: Record<string, string[]> = {
  'strategy': ['strategy', 'strategic', 'vision', 'roadmap', 'planning'],
  'operations': ['operations', 'operational', 'process', 'efficiency'],
  'technology': ['technology', 'tech', 'digital', 'system', 'platform'],
  'transformation': ['transformation', 'change', 'modernization'],
  'analytics': ['analytics', 'data', 'insight', 'intelligence'],
  'organization': ['organization', 'org', 'people', 'talent', 'culture'],
  'financial': ['financial', 'roi', 'npv', 'cost', 'revenue', 'margin'],
  'framework': ['framework', 'methodology', 'approach', 'model'],
};

const CA_VERTICAL_KEYWORDS: Record<string, string[]> = {
  'financial-services': ['bank', 'banking', 'insurance', 'fsi', 'financial'],
  'healthcare': ['healthcare', 'health', 'hospital', 'pharma', 'medical'],
  'retail': ['retail', 'consumer', 'ecommerce', 'store'],
  'manufacturing': ['manufacturing', 'industrial', 'factory', 'supply chain'],
  'technology': ['tech', 'software', 'saas', 'cloud'],
  'private-equity': ['private equity', 'pe', 'portfolio', 'buyout'],
};

// ============================================================================
// CA KB IMPACT TRACKER
// ============================================================================

export class CAKBImpactTracker extends BaseKBImpactTracker {
  constructor(config?: Partial<KBImpactTrackerConfig>) {
    const storagePath = path.join(process.cwd(), '.ca-kb-impact');
    const storage = new LocalKBImpactStorage(storagePath);
    
    super(
      {
        agentId: 'ca',
        minUsagesForImpact: 8,  // CA may have fewer interactions
        confidenceThreshold: 0.65,
        deprecationThreshold: -0.15,
        enhancementThreshold: 0.05,
        autoGenerateProposals: true,
        maxProposalQueueSize: 50,
        ...config,
      },
      storage
    );
  }
  
  /**
   * Extract CA-specific topics from a query
   */
  protected override extractTopics(query: string): string[] {
    const normalizedQuery = query.toLowerCase();
    const topics: string[] = [];
    
    // Extract domain topics
    for (const [topic, keywords] of Object.entries(CA_TOPIC_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword)) {
          topics.push(topic);
          break;
        }
      }
    }
    
    // Extract vertical references
    for (const [vertical, keywords] of Object.entries(CA_VERTICAL_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword)) {
          topics.push(`vertical-${vertical}`);
          break;
        }
      }
    }
    
    // Fall back to base implementation if no domain topics found
    if (topics.length === 0) {
      return super.extractTopics(query);
    }
    
    return [...new Set(topics)];
  }
  
  /**
   * Extract document title with CA-specific logic
   */
  protected override extractDocumentTitle(documentId: string): string {
    let title = documentId
      .replace(/^(KB_|CA_|ca_)/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\.\w+$/, '')
      .trim();
    
    title = title.replace(/\b\w/g, c => c.toUpperCase());
    
    return title;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createCAKBImpactTracker(
  config?: Partial<KBImpactTrackerConfig>
): CAKBImpactTracker {
  return new CAKBImpactTracker(config);
}

export default CAKBImpactTracker;
```

---

# STEP 34: Create EAP KB Impact Tracker Adapter

**File:** `release/v5.5/agents/eap/base/tests/braintrust/learning/eap-kb-impact-tracker.ts`

```typescript
/**
 * EAP KB Impact Tracker
 * 
 * EAP-specific implementation of KB impact tracking.
 * Extends BaseKBImpactTracker with AI/ML platform domain knowledge.
 */

import { BaseKBImpactTracker, LocalKBImpactStorage } from '@kessel-digital/agent-core';
import type { KBImpactTrackerConfig } from '@kessel-digital/agent-core';
import * as path from 'path';

// ============================================================================
// EAP-SPECIFIC TOPIC EXTRACTION
// ============================================================================

const EAP_TOPIC_KEYWORDS: Record<string, string[]> = {
  'architecture': ['architecture', 'design', 'infrastructure', 'system'],
  'integration': ['integration', 'api', 'webhook', 'connect'],
  'security': ['security', 'auth', 'encryption', 'compliance'],
  'data': ['data', 'database', 'storage', 'vector', 'embedding'],
  'ml-ops': ['mlops', 'deployment', 'training', 'fine-tuning'],
  'governance': ['governance', 'policy', 'compliance', 'audit'],
  'rag': ['rag', 'retrieval', 'knowledge base', 'grounded'],
  'llm': ['llm', 'language model', 'gpt', 'claude', 'gemini'],
};

const EAP_PLATFORM_KEYWORDS: Record<string, string[]> = {
  'azure': ['azure', 'microsoft', 'azure openai'],
  'aws': ['aws', 'amazon', 'bedrock', 'sagemaker'],
  'gcp': ['gcp', 'google', 'vertex'],
  'openai': ['openai', 'chatgpt', 'gpt-4'],
  'anthropic': ['anthropic', 'claude'],
};

// ============================================================================
// EAP KB IMPACT TRACKER
// ============================================================================

export class EAPKBImpactTracker extends BaseKBImpactTracker {
  constructor(config?: Partial<KBImpactTrackerConfig>) {
    const storagePath = path.join(process.cwd(), '.eap-kb-impact');
    const storage = new LocalKBImpactStorage(storagePath);
    
    super(
      {
        agentId: 'eap',
        minUsagesForImpact: 5,  // EAP is newer, fewer interactions expected
        confidenceThreshold: 0.6,
        deprecationThreshold: -0.2,
        enhancementThreshold: 0.05,
        autoGenerateProposals: true,
        maxProposalQueueSize: 30,
        ...config,
      },
      storage
    );
  }
  
  /**
   * Extract EAP-specific topics from a query
   */
  protected override extractTopics(query: string): string[] {
    const normalizedQuery = query.toLowerCase();
    const topics: string[] = [];
    
    // Extract domain topics
    for (const [topic, keywords] of Object.entries(EAP_TOPIC_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword)) {
          topics.push(topic);
          break;
        }
      }
    }
    
    // Extract platform references
    for (const [platform, keywords] of Object.entries(EAP_PLATFORM_KEYWORDS)) {
      for (const keyword of keywords) {
        if (normalizedQuery.includes(keyword)) {
          topics.push(`platform-${platform}`);
          break;
        }
      }
    }
    
    // Fall back to base implementation if no domain topics found
    if (topics.length === 0) {
      return super.extractTopics(query);
    }
    
    return [...new Set(topics)];
  }
  
  /**
   * Extract document title with EAP-specific logic
   */
  protected override extractDocumentTitle(documentId: string): string {
    let title = documentId
      .replace(/^(KB_|EAP_|eap_)/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\.\w+$/, '')
      .trim();
    
    title = title.replace(/\b\w/g, c => c.toUpperCase());
    
    return title;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createEAPKBImpactTracker(
  config?: Partial<KBImpactTrackerConfig>
): EAPKBImpactTracker {
  return new EAPKBImpactTracker(config);
}

export default EAPKBImpactTracker;
```

---

# STEP 35: Update agent-core Learning Exports

**File:** `packages/agent-core/src/learning/index.ts`

Add these exports (DO NOT replace existing - ADD these):

```typescript
// ============================================================================
// KB IMPACT TRACKING (ADD TO EXISTING EXPORTS)
// ============================================================================

// Types
export {
  type KBUsageRecord,
  type KBDocumentImpact,
  type KBDocumentAction,
  type KBChunkImpact,
  type KBUpdateProposal,
  type KBUpdateType,
  type KBUpdateStatus,
  type KBProposedChange,
  type KBImpactTrackerConfig,
  type KBImpactStorage,
  type KBUsageFilter,
  type KBProposalFilter,
  DEFAULT_KB_IMPACT_CONFIG,
} from './kb-impact-types.js';

// Base Tracker
export {
  BaseKBImpactTracker,
} from './base-kb-impact-tracker.js';

// Local Storage
export {
  LocalKBImpactStorage,
  createLocalKBImpactStorage,
} from './local-kb-impact-storage.js';

// Update Pipeline
export {
  KBUpdatePipeline,
  createKBUpdatePipeline,
  type KBUpdatePipelineConfig,
  DEFAULT_UPDATE_PIPELINE_CONFIG,
} from './kb-update-pipeline.js';
```

---

# STEP 36: Add uuid Dependency to agent-core

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core

npm install uuid
npm install -D @types/uuid
```

---

# STEP 37: Verify Phase 3 Builds

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/packages/agent-core

# Clean and rebuild
rm -rf dist
npm run build

# Check for errors
echo $?
# Should be 0
```

---

# PHASE 3 COMMIT

After all steps complete successfully:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

git add .
git commit -m "feat(agent-core): Phase 3 - KB impact tracking system

- Added KBUsageRecord and KBDocumentImpact types
- Created BaseKBImpactTracker with pluggable storage
- Implemented LocalKBImpactStorage for development
- Created KBUpdatePipeline for automated KB improvement proposals
- Added MPA-specific tracker with media planning keywords
- Added CA-specific tracker with consulting keywords
- Added EAP-specific tracker with AI/ML platform keywords
- Exported all types and classes from agent-core"

git push origin deploy/personal
```

---

# VERIFICATION CHECKLIST

- [ ] packages/agent-core builds without errors
- [ ] kb-impact-types.ts created with all interfaces
- [ ] base-kb-impact-tracker.ts created with full implementation
- [ ] local-kb-impact-storage.ts created
- [ ] kb-update-pipeline.ts created
- [ ] mpa-kb-impact-tracker.ts created in MPA agent
- [ ] ca-kb-impact-tracker.ts created in CA agent
- [ ] eap-kb-impact-tracker.ts created in EAP agent
- [ ] learning/index.ts updated with new exports
- [ ] uuid dependency added

---

# NEXT: Phase 4 (Corporate Providers)

Phase 4 will complete the corporate provider implementations (Azure OpenAI LLM, Copilot Studio, Dataverse) that are currently stubs.
