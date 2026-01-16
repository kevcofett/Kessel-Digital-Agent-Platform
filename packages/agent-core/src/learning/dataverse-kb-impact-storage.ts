/**
 * Dataverse KB Impact Storage
 *
 * Stores KB impact tracking data in Microsoft Dataverse.
 * Used in corporate/Mastercard environments.
 */

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
// CONFIGURATION
// ============================================================================

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

// ============================================================================
// DEFAULT TABLE NAMES
// ============================================================================

const DEFAULT_TABLES = {
  usageRecords: 'cr_kbusagerecords',
  documentImpacts: 'cr_kbdocumentimpacts',
  updateProposals: 'cr_kbupdateproposals',
};

// ============================================================================
// DATAVERSE KB IMPACT STORAGE
// ============================================================================

export class DataverseKBImpactStorage implements KBImpactStorage {
  private environmentUrl: string;
  private tenantId: string;
  private clientId?: string;
  private clientSecret?: string;
  private accessToken?: string;
  private tokenExpiry?: Date;
  private tables: typeof DEFAULT_TABLES;
  private timeout: number;

  constructor(config: DataverseKBImpactStorageConfig) {
    if (!config.environmentUrl) {
      throw new Error('Dataverse environment URL is required');
    }
    if (!config.tenantId) {
      throw new Error('Dataverse tenant ID is required');
    }

    this.environmentUrl = config.environmentUrl.replace(/\/$/, '');
    this.tenantId = config.tenantId;
    this.clientId = config.clientId || process.env.DATAVERSE_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.DATAVERSE_CLIENT_SECRET;
    this.accessToken = config.accessToken;
    this.tables = { ...DEFAULT_TABLES, ...config.tables };
    this.timeout = config.timeout || 30000;
  }

  // ==========================================================================
  // USAGE RECORDS
  // ==========================================================================

  async saveUsageRecord(record: KBUsageRecord): Promise<void> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.usageRecords}`;

    const dataverseRecord = {
      cr_id: record.id,
      cr_agentid: record.agentId,
      cr_documentid: record.documentId,
      cr_chunkids: JSON.stringify(record.chunkIds),
      cr_query: record.query,
      cr_retrievalscore: record.retrievalScore,
      cr_sessionid: record.sessionId,
      cr_responsequality: record.responseQuality,
      cr_wasusedinresponse: record.wasUsedInResponse,
      cr_timestamp: record.timestamp.toISOString(),
      cr_metadata: record.metadata ? JSON.stringify(record.metadata) : null,
    };

    // Upsert using alternate key
    const response = await fetch(`${url}(cr_id='${record.id}')`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'If-Match': '*',
      },
      body: JSON.stringify(dataverseRecord),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok && response.status !== 204) {
      // Try create if upsert fails
      const createResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(dataverseRecord),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        throw new Error(`Failed to save usage record: ${errorBody}`);
      }
    }
  }

  async getUsageRecords(filter: KBUsageFilter): Promise<KBUsageRecord[]> {
    const token = await this.getAccessToken();

    const filterParts: string[] = [];
    if (filter.agentId) {
      filterParts.push(`cr_agentid eq '${filter.agentId}'`);
    }
    if (filter.documentId) {
      filterParts.push(`cr_documentid eq '${filter.documentId}'`);
    }
    if (filter.sessionId) {
      filterParts.push(`cr_sessionid eq '${filter.sessionId}'`);
    }
    if (filter.startDate) {
      filterParts.push(`cr_timestamp ge ${filter.startDate.toISOString()}`);
    }
    if (filter.endDate) {
      filterParts.push(`cr_timestamp le ${filter.endDate.toISOString()}`);
    }
    if (filter.minQuality !== undefined) {
      filterParts.push(`cr_responsequality ge ${filter.minQuality}`);
    }
    if (filter.maxQuality !== undefined) {
      filterParts.push(`cr_responsequality le ${filter.maxQuality}`);
    }

    let url = `${this.environmentUrl}/api/data/v9.2/${this.tables.usageRecords}`;
    if (filterParts.length > 0) {
      url += `?$filter=${encodeURIComponent(filterParts.join(' and '))}`;
    }
    if (filter.limit) {
      url += (url.includes('?') ? '&' : '?') + `$top=${filter.limit}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to get usage records: ${errorBody}`);
    }

    const data = await response.json() as { value: DataverseUsageRecord[] };
    return data.value.map(this.parseUsageRecord);
  }

  // ==========================================================================
  // DOCUMENT IMPACTS
  // ==========================================================================

  async saveDocumentImpact(impact: KBDocumentImpact): Promise<void> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.documentImpacts}`;

    const dataverseRecord = {
      cr_documentid: impact.documentId,
      cr_documenttitle: impact.documentTitle,
      cr_totalretrievals: impact.totalRetrievals,
      cr_timesusedinresponse: impact.timesUsedInResponse,
      cr_avgqualitywhenused: impact.avgQualityWhenUsed,
      cr_avgqualitywhennotused: impact.avgQualityWhenNotUsed,
      cr_impactscore: impact.impactScore,
      cr_confidence: impact.confidence,
      cr_recommendedaction: impact.recommendedAction,
      cr_chunkanalysis: impact.chunkAnalysis ? JSON.stringify(impact.chunkAnalysis) : null,
      cr_strongtopics: JSON.stringify(impact.strongTopics),
      cr_weaktopics: JSON.stringify(impact.weakTopics),
      cr_lastupdated: impact.lastUpdated.toISOString(),
    };

    // Upsert
    const response = await fetch(`${url}(cr_documentid='${impact.documentId}')`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'If-Match': '*',
      },
      body: JSON.stringify(dataverseRecord),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok && response.status !== 204) {
      const createResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(dataverseRecord),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        throw new Error(`Failed to save document impact: ${errorBody}`);
      }
    }
  }

  async getDocumentImpact(documentId: string): Promise<KBDocumentImpact | null> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.documentImpacts}(cr_documentid='${documentId}')`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to get document impact: ${errorBody}`);
      }

      const record = await response.json() as DataverseImpactRecord;
      return this.parseDocumentImpact(record);

    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async getAllDocumentImpacts(_agentId: string): Promise<KBDocumentImpact[]> {
    const token = await this.getAccessToken();
    // Note: agentId filtering would need to be added to the data model
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.documentImpacts}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to get document impacts: ${errorBody}`);
    }

    const data = await response.json() as { value: DataverseImpactRecord[] };
    return data.value.map(this.parseDocumentImpact);
  }

  // ==========================================================================
  // UPDATE PROPOSALS
  // ==========================================================================

  async saveProposal(proposal: KBUpdateProposal): Promise<void> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.updateProposals}`;

    const dataverseRecord = {
      cr_id: proposal.id,
      cr_agentid: proposal.agentId,
      cr_updatetype: proposal.updateType,
      cr_targetdocumentids: JSON.stringify(proposal.targetDocumentIds),
      cr_rationale: proposal.rationale,
      cr_triggeringimpact: JSON.stringify(proposal.triggeringImpact),
      cr_proposedchanges: JSON.stringify(proposal.proposedChanges),
      cr_priority: proposal.priority,
      cr_status: proposal.status,
      cr_createdat: proposal.createdAt.toISOString(),
      cr_updatedat: proposal.updatedAt.toISOString(),
    };

    // Upsert
    const response = await fetch(`${url}(cr_id='${proposal.id}')`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'If-Match': '*',
      },
      body: JSON.stringify(dataverseRecord),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok && response.status !== 204) {
      const createResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify(dataverseRecord),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        throw new Error(`Failed to save proposal: ${errorBody}`);
      }
    }
  }

  async getProposal(id: string): Promise<KBUpdateProposal | null> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.updateProposals}(cr_id='${id}')`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to get proposal: ${errorBody}`);
      }

      const record = await response.json() as DataverseProposalRecord;
      return this.parseProposal(record);

    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async getProposals(filter: KBProposalFilter): Promise<KBUpdateProposal[]> {
    const token = await this.getAccessToken();

    const filterParts: string[] = [];
    if (filter.agentId) {
      filterParts.push(`cr_agentid eq '${filter.agentId}'`);
    }
    if (filter.status) {
      filterParts.push(`cr_status eq '${filter.status}'`);
    }
    if (filter.updateType) {
      filterParts.push(`cr_updatetype eq '${filter.updateType}'`);
    }
    if (filter.minPriority !== undefined) {
      filterParts.push(`cr_priority ge ${filter.minPriority}`);
    }

    let url = `${this.environmentUrl}/api/data/v9.2/${this.tables.updateProposals}`;
    if (filterParts.length > 0) {
      url += `?$filter=${encodeURIComponent(filterParts.join(' and '))}`;
    }
    url += (url.includes('?') ? '&' : '?') + '$orderby=cr_priority desc';
    if (filter.limit) {
      url += `&$top=${filter.limit}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to get proposals: ${errorBody}`);
    }

    const data = await response.json() as { value: DataverseProposalRecord[] };
    return data.value.map(this.parseProposal);
  }

  async updateProposalStatus(id: string, status: KBUpdateStatus): Promise<void> {
    const token = await this.getAccessToken();
    const url = `${this.environmentUrl}/api/data/v9.2/${this.tables.updateProposals}(cr_id='${id}')`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
      },
      body: JSON.stringify({
        cr_status: status,
        cr_updatedat: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to update proposal status: ${errorBody}`);
    }
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      const envToken = process.env.DATAVERSE_ACCESS_TOKEN;
      if (envToken) {
        this.accessToken = envToken;
        return envToken;
      }
      if (this.accessToken) {
        return this.accessToken;
      }
      throw new Error('Dataverse credentials not configured');
    }

    const tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: `${this.environmentUrl}/.default`,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Token request failed: ${errorBody}`);
    }

    const tokenData = await response.json() as { access_token: string; expires_in: number };
    this.accessToken = tokenData.access_token;

    const expiresIn = (tokenData.expires_in || 3600) - 300;
    this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);

    return this.accessToken;
  }

  private parseUsageRecord(record: DataverseUsageRecord): KBUsageRecord {
    return {
      id: record.cr_id,
      agentId: record.cr_agentid,
      documentId: record.cr_documentid,
      chunkIds: JSON.parse(record.cr_chunkids || '[]'),
      query: record.cr_query,
      retrievalScore: record.cr_retrievalscore,
      sessionId: record.cr_sessionid,
      responseQuality: record.cr_responsequality,
      wasUsedInResponse: record.cr_wasusedinresponse,
      timestamp: new Date(record.cr_timestamp),
      metadata: record.cr_metadata ? JSON.parse(record.cr_metadata) : undefined,
    };
  }

  private parseDocumentImpact(record: DataverseImpactRecord): KBDocumentImpact {
    return {
      documentId: record.cr_documentid,
      documentTitle: record.cr_documenttitle,
      totalRetrievals: record.cr_totalretrievals,
      timesUsedInResponse: record.cr_timesusedinresponse,
      avgQualityWhenUsed: record.cr_avgqualitywhenused,
      avgQualityWhenNotUsed: record.cr_avgqualitywhennotused,
      impactScore: record.cr_impactscore,
      confidence: record.cr_confidence,
      recommendedAction: record.cr_recommendedaction as KBDocumentImpact['recommendedAction'],
      chunkAnalysis: record.cr_chunkanalysis ? JSON.parse(record.cr_chunkanalysis) : undefined,
      strongTopics: JSON.parse(record.cr_strongtopics || '[]'),
      weakTopics: JSON.parse(record.cr_weaktopics || '[]'),
      lastUpdated: new Date(record.cr_lastupdated),
    };
  }

  private parseProposal(record: DataverseProposalRecord): KBUpdateProposal {
    return {
      id: record.cr_id,
      agentId: record.cr_agentid,
      updateType: record.cr_updatetype as KBUpdateProposal['updateType'],
      targetDocumentIds: JSON.parse(record.cr_targetdocumentids || '[]'),
      rationale: record.cr_rationale,
      triggeringImpact: JSON.parse(record.cr_triggeringimpact),
      proposedChanges: JSON.parse(record.cr_proposedchanges),
      priority: record.cr_priority,
      status: record.cr_status as KBUpdateProposal['status'],
      createdAt: new Date(record.cr_createdat),
      updatedAt: new Date(record.cr_updatedat),
    };
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface DataverseUsageRecord {
  cr_id: string;
  cr_agentid: string;
  cr_documentid: string;
  cr_chunkids: string;
  cr_query: string;
  cr_retrievalscore: number;
  cr_sessionid: string;
  cr_responsequality?: number;
  cr_wasusedinresponse: boolean;
  cr_timestamp: string;
  cr_metadata?: string;
}

interface DataverseImpactRecord {
  cr_documentid: string;
  cr_documenttitle: string;
  cr_totalretrievals: number;
  cr_timesusedinresponse: number;
  cr_avgqualitywhenused: number;
  cr_avgqualitywhennotused: number;
  cr_impactscore: number;
  cr_confidence: number;
  cr_recommendedaction: string;
  cr_chunkanalysis?: string;
  cr_strongtopics: string;
  cr_weaktopics: string;
  cr_lastupdated: string;
}

interface DataverseProposalRecord {
  cr_id: string;
  cr_agentid: string;
  cr_updatetype: string;
  cr_targetdocumentids: string;
  cr_rationale: string;
  cr_triggeringimpact: string;
  cr_proposedchanges: string;
  cr_priority: number;
  cr_status: string;
  cr_createdat: string;
  cr_updatedat: string;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createDataverseKBImpactStorage(
  config: DataverseKBImpactStorageConfig
): DataverseKBImpactStorage {
  return new DataverseKBImpactStorage(config);
}

export default DataverseKBImpactStorage;
