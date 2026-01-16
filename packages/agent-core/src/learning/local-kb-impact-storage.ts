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

  async getAllDocumentImpacts(_agentId: string): Promise<KBDocumentImpact[]> {
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
