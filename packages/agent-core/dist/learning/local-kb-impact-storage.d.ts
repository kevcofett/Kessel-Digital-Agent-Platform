/**
 * Local File System KB Impact Storage
 *
 * Stores KB impact data in local JSON files.
 * Used for development and testing.
 */
import type { KBImpactStorage, KBUsageRecord, KBDocumentImpact, KBUpdateProposal, KBUsageFilter, KBProposalFilter, KBUpdateStatus } from './kb-impact-types.js';
export declare class LocalKBImpactStorage implements KBImpactStorage {
    private basePath;
    private usageRecordsFile;
    private impactsFile;
    private proposalsFile;
    private usageRecords;
    private impacts;
    private proposals;
    private isLoaded;
    constructor(basePath: string);
    private ensureLoaded;
    private saveUsageRecords;
    private saveImpacts;
    private saveProposals;
    saveUsageRecord(record: KBUsageRecord): Promise<void>;
    getUsageRecords(filter: KBUsageFilter): Promise<KBUsageRecord[]>;
    saveDocumentImpact(impact: KBDocumentImpact): Promise<void>;
    getDocumentImpact(documentId: string): Promise<KBDocumentImpact | null>;
    getAllDocumentImpacts(_agentId: string): Promise<KBDocumentImpact[]>;
    saveProposal(proposal: KBUpdateProposal): Promise<void>;
    getProposal(id: string): Promise<KBUpdateProposal | null>;
    getProposals(filter: KBProposalFilter): Promise<KBUpdateProposal[]>;
    updateProposalStatus(id: string, status: KBUpdateStatus): Promise<void>;
}
export declare function createLocalKBImpactStorage(basePath: string): LocalKBImpactStorage;
export default LocalKBImpactStorage;
//# sourceMappingURL=local-kb-impact-storage.d.ts.map