/**
 * SharePoint Configuration
 *
 * Configuration for SharePoint knowledge base access via Microsoft Graph API.
 * Used to retrieve KB documents for agent context injection.
 */

import { ConfidentialClientApplication } from '@azure/msal-node';

/**
 * SharePoint site configuration
 */
export interface SharePointConfig {
  siteUrl: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  kbLibraries: {
    mpa: string;
    ca: string;
    eap: string;
  };
}

/**
 * Load SharePoint configuration from environment variables
 */
export function getSharePointConfig(): SharePointConfig {
  const siteUrl = process.env.SHAREPOINT_SITE_URL;
  const tenantId = process.env.SHAREPOINT_TENANT_ID ?? process.env.DATAVERSE_TENANT_ID;
  const clientId = process.env.DATAVERSE_CLIENT_ID;
  const clientSecret = process.env.DATAVERSE_CLIENT_SECRET;

  if (!siteUrl || !tenantId || !clientId || !clientSecret) {
    throw new Error(
      'Missing required SharePoint environment variables: SHAREPOINT_SITE_URL, SHAREPOINT_TENANT_ID (or DATAVERSE_TENANT_ID), DATAVERSE_CLIENT_ID, DATAVERSE_CLIENT_SECRET'
    );
  }

  return {
    siteUrl,
    tenantId,
    clientId,
    clientSecret,
    kbLibraries: {
      mpa: 'MediaPlanningKB',
      ca: 'ConsultingKB',
      eap: 'SharedKB',
    },
  };
}

/**
 * Graph API configuration
 */
export const GRAPH_API_CONFIG = {
  baseUrl: 'https://graph.microsoft.com/v1.0',
  scopes: ['https://graph.microsoft.com/.default'],
} as const;

/**
 * Token cache for Graph API access tokens
 */
let graphTokenCache: {
  accessToken: string;
  expiresAt: number;
} | null = null;

/**
 * Get an access token for Microsoft Graph API
 */
export async function getGraphAccessToken(): Promise<string> {
  const config = getSharePointConfig();

  if (graphTokenCache && graphTokenCache.expiresAt > Date.now() + 60000) {
    return graphTokenCache.accessToken;
  }

  const msalConfig = {
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/${config.tenantId}`,
      clientSecret: config.clientSecret,
    },
  };

  const cca = new ConfidentialClientApplication(msalConfig);

  const tokenResponse = await cca.acquireTokenByClientCredential({
    scopes: [...GRAPH_API_CONFIG.scopes],
  });

  if (!tokenResponse?.accessToken) {
    throw new Error('Failed to acquire Graph API access token');
  }

  graphTokenCache = {
    accessToken: tokenResponse.accessToken,
    expiresAt: tokenResponse.expiresOn?.getTime() ?? Date.now() + 3600000,
  };

  return graphTokenCache.accessToken;
}

/**
 * Extract site ID from SharePoint URL
 */
export function extractSiteId(siteUrl: string): { hostname: string; sitePath: string } {
  const url = new URL(siteUrl);
  const hostname = url.hostname;
  const pathParts = url.pathname.split('/').filter(Boolean);

  if (pathParts[0] !== 'sites' || !pathParts[1]) {
    throw new Error(`Invalid SharePoint site URL format: ${siteUrl}`);
  }

  return {
    hostname,
    sitePath: `/sites/${pathParts[1]}`,
  };
}

/**
 * Knowledge base file mappings
 * Maps logical KB identifiers to SharePoint file paths
 */
export const KB_FILE_MAPPINGS = {
  mpa: {
    'analytics-engine': 'Analytics_Engine_v5_5.txt',
    'strategic-framework': 'KB_01_Strategic_Framework_Reference.txt',
    'audience-targeting': 'KB_02_Audience_Targeting_Sophistication.txt',
    'forecasting': 'KB_03_Forecasting_Projection_Engine.txt',
    'channel-playbooks': 'KB_04_Channel_Role_Playbooks.txt',
    'constraints': 'KB_05_Constraints_Compliance.txt',
    'expert-lens-budget': 'MPA_Expert_Lens_Budget_Allocation_v5_5.txt',
    'expert-lens-channel': 'MPA_Expert_Lens_Channel_Mix_v5_5.txt',
    'expert-lens-measurement': 'MPA_Expert_Lens_Measurement_Attribution_v5_5.txt',
    'expert-lens-audience': 'MPA_Expert_Lens_Audience_Strategy_v5_5.txt',
    'gap-detection': 'Gap_Detection_Playbook_v5_5.txt',
    'confidence-framework': 'Confidence_Level_Framework_v5_5.txt',
    'brand-performance': 'BRAND_PERFORMANCE_FRAMEWORK_v5_5.txt',
    'measurement-framework': 'MEASUREMENT_FRAMEWORK_v5_5.txt',
    'data-provenance': 'Data_Provenance_Framework_v5_5.txt',
    'ai-advertising': 'AI_ADVERTISING_GUIDE_v5_5.txt',
    'first-party-data': 'FIRST_PARTY_DATA_STRATEGY_v5_5.txt',
    'retail-media': 'RETAIL_MEDIA_NETWORKS_v5_5.txt',
    'strategic-wisdom': 'Strategic_Wisdom_v5_5.txt',
    'conversation-examples': 'MPA_Conversation_Examples_v5_5.txt',
    'output-templates': 'Output_Templates_v5_5.txt',
    'supporting-instructions': 'MPA_Supporting_Instructions_v5_5.txt',
  },
  ca: {
    'consulting-methodology': 'CA_Consulting_Methodology.txt',
    'frameworks': 'CA_Strategic_Frameworks.txt',
    'proposal-templates': 'CA_Proposal_Templates.txt',
  },
  eap: {
    'platform-guide': 'EAP_Platform_Guide.txt',
    'session-management': 'EAP_Session_Management.txt',
  },
} as const;

/**
 * Content type mappings for KB files
 */
export const KB_CONTENT_TYPES = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.json': 'application/json',
} as const;

/**
 * Maximum file size for KB content (in bytes)
 */
export const MAX_KB_FILE_SIZE = 500000;

/**
 * Cache configuration for KB content
 */
export const KB_CACHE_CONFIG = {
  enabled: true,
  ttlSeconds: 3600,
  maxEntries: 50,
} as const;

/**
 * Local KB file path for development/fallback
 */
export function getLocalKBPath(agent: keyof typeof KB_FILE_MAPPINGS, fileKey: string): string {
  const basePath = process.cwd();
  const relativePath = `../../../agents/${agent}/base/kb`;
  const filename = KB_FILE_MAPPINGS[agent]?.[fileKey as keyof (typeof KB_FILE_MAPPINGS)[typeof agent]];

  if (!filename) {
    throw new Error(`Unknown KB file key: ${agent}/${fileKey}`);
  }

  return `${basePath}/${relativePath}/${filename}`;
}
