/**
 * Dataverse KB Impact Storage
 *
 * Stores KB impact tracking data in Microsoft Dataverse.
 * Used in corporate/Mastercard environments.
 */
import type { KBImpactStorage, KBUsageRecord, KBDocumentImpact, KBUpdateProposal, KBUsageFilter, KBProposalFilter, KBUpdateStatus } from './kb-impact-types.js';
export interface DataverseKBImpactStorageConfig {
    /**
     * Dataverse environment URL
     */
    environmentUrl: string;
    /**
     * Tenant ID for authentication
     */
    tenantId: string;
    /**
     * Client ID for authentication
     */
    clientId?: string;
    /**
     * Client secret for authentication
     */
    clientSecret?: string;
    /**
     * Access token (if already obtained)
     */
    accessToken?: string;
    /**
     * Table names
     */
    tables?: {
        usageRecords?: string;
        documentImpacts?: string;
        updateProposals?: string;
    };
    /**
     * Request timeout in milliseconds
     */
    timeout?: number;
}
export declare class DataverseKBImpactStorage implements KBImpactStorage {
    private environmentUrl;
    private tenantId;
    private clientId?;
    private clientSecret?;
    private accessToken?;
    private tokenExpiry?;
    private tables;
    private timeout;
    constructor(config: DataverseKBImpactStorageConfig);
    saveUsageRecord(record: KBUsageRecord): Promise<void>;
    getUsageRecords(filter: KBUsageFilter): Promise<KBUsageRecord[]>;
    saveDocumentImpact(impact: KBDocumentImpact): Promise<void>;
    getDocumentImpact(documentId: string): Promise<KBDocumentImpact | null>;
    getAllDocumentImpacts(_agentId: string): Promise<KBDocumentImpact[]>;
    saveProposal(proposal: KBUpdateProposal): Promise<void>;
    getProposal(id: string): Promise<KBUpdateProposal | null>;
    getProposals(filter: KBProposalFilter): Promise<KBUpdateProposal[]>;
    updateProposalStatus(id: string, status: KBUpdateStatus): Promise<void>;
    private getAccessToken;
    private parseUsageRecord;
    private parseDocumentImpact;
    private parseProposal;
}
export declare function createDataverseKBImpactStorage(config: DataverseKBImpactStorageConfig): DataverseKBImpactStorage;
export default DataverseKBImpactStorage;
//# sourceMappingURL=dataverse-kb-impact-storage.d.ts.map