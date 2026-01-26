/**
 * Dataverse Configuration
 *
 * Configuration for Microsoft Dataverse API access.
 * Supports both service principal and user authentication.
 */

import { ConfidentialClientApplication } from '@azure/msal-node';

/**
 * Dataverse environment configuration
 */
export interface DataverseConfig {
  environmentUrl: string;
  apiUrl: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  scope: string;
}

/**
 * Load Dataverse configuration from environment variables
 */
export function getDataverseConfig(): DataverseConfig {
  const environmentUrl = process.env.DATAVERSE_URL;
  const apiUrl = process.env.DATAVERSE_API_URL;
  const tenantId = process.env.DATAVERSE_TENANT_ID;
  const clientId = process.env.DATAVERSE_CLIENT_ID;
  const clientSecret = process.env.DATAVERSE_CLIENT_SECRET;

  if (!environmentUrl || !tenantId || !clientId || !clientSecret) {
    throw new Error(
      'Missing required Dataverse environment variables: DATAVERSE_URL, DATAVERSE_TENANT_ID, DATAVERSE_CLIENT_ID, DATAVERSE_CLIENT_SECRET'
    );
  }

  return {
    environmentUrl,
    apiUrl: apiUrl ?? `${environmentUrl}/api/data/v9.2`,
    tenantId,
    clientId,
    clientSecret,
    scope: `${environmentUrl}/.default`,
  };
}

/**
 * MSAL configuration for Dataverse authentication
 */
export function getMsalConfig(dataverseConfig: DataverseConfig) {
  return {
    auth: {
      clientId: dataverseConfig.clientId,
      authority: `https://login.microsoftonline.com/${dataverseConfig.tenantId}`,
      clientSecret: dataverseConfig.clientSecret,
    },
    system: {
      loggerOptions: {
        loggerCallback: (level: number, message: string) => {
          if (level === 0) {
            console.error('[MSAL Error]', message);
          }
        },
        piiLoggingEnabled: false,
        logLevel: 0,
      },
    },
  };
}

/**
 * Token cache for Dataverse access tokens
 */
let tokenCache: {
  accessToken: string;
  expiresAt: number;
} | null = null;

/**
 * Get an access token for Dataverse API calls
 * Implements token caching with automatic refresh
 */
export async function getDataverseAccessToken(): Promise<string> {
  const config = getDataverseConfig();

  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    return tokenCache.accessToken;
  }

  const msalConfig = getMsalConfig(config);
  const cca = new ConfidentialClientApplication(msalConfig);

  const tokenResponse = await cca.acquireTokenByClientCredential({
    scopes: [config.scope],
  });

  if (!tokenResponse?.accessToken) {
    throw new Error('Failed to acquire Dataverse access token');
  }

  tokenCache = {
    accessToken: tokenResponse.accessToken,
    expiresAt: tokenResponse.expiresOn?.getTime() ?? Date.now() + 3600000,
  };

  return tokenCache.accessToken;
}

/**
 * Dataverse table names used by the platform
 */
export const DATAVERSE_TABLES = {
  mpa: {
    benchmark: 'mpa_benchmark',
    channel: 'mpa_channel',
    vertical: 'mpa_vertical',
    kpi: 'mpa_kpi',
    mediaplan: 'mpa_mediaplan',
    plandata: 'mpa_plandata',
    planversion: 'mpa_planversion',
  },
  eap: {
    session: 'eap_session',
    user: 'eap_user',
    client: 'eap_client',
    featureflag: 'eap_featureflag',
    agentregistry: 'eap_agentregistry',
  },
  ca: {
    engagement: 'ca_engagement',
    proposal: 'ca_proposal',
    framework: 'ca_framework',
  },
} as const;

/**
 * Common OData query options
 */
export interface ODataQueryOptions {
  $select?: string;
  $filter?: string;
  $orderby?: string;
  $top?: number;
  $skip?: number;
  $expand?: string;
  $count?: boolean;
}

/**
 * Build OData query string from options
 */
export function buildODataQuery(options: ODataQueryOptions): string {
  const params = new URLSearchParams();

  if (options.$select) params.append('$select', options.$select);
  if (options.$filter) params.append('$filter', options.$filter);
  if (options.$orderby) params.append('$orderby', options.$orderby);
  if (options.$top !== undefined) params.append('$top', options.$top.toString());
  if (options.$skip !== undefined) params.append('$skip', options.$skip.toString());
  if (options.$expand) params.append('$expand', options.$expand);
  if (options.$count) params.append('$count', 'true');

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Column mappings for benchmark table
 */
export const BENCHMARK_COLUMNS = {
  verticalCode: 'mpa_verticalcode',
  channelCode: 'mpa_channelcode',
  kpiCode: 'mpa_kpicode',
  metricName: 'mpa_metricname',
  metricLow: 'mpa_metriclow',
  metricMedian: 'mpa_metricmedian',
  metricHigh: 'mpa_metrichigh',
  metricBest: 'mpa_metricbest',
  dataSource: 'mpa_datasource',
  dataPeriod: 'mpa_dataperiod',
  confidenceLevel: 'mpa_confidencelevel',
  metricUnit: 'mpa_metricunit',
  isActive: 'mpa_isactive',
} as const;

/**
 * Column mappings for channel table
 */
export const CHANNEL_COLUMNS = {
  channelCode: 'mpa_channelcode',
  channelName: 'mpa_channelname',
  category: 'mpa_category',
  funnelPosition: 'mpa_funnelposition',
  minBudget: 'mpa_minbudget',
  capabilities: 'mpa_capabilities',
  sortOrder: 'mpa_sortorder',
  isActive: 'mpa_isactive',
} as const;

/**
 * Column mappings for session table
 */
export const SESSION_COLUMNS = {
  sessionCode: 'eap_sessioncode',
  userId: 'eap_userid',
  clientId: 'eap_clientid',
  agentCode: 'eap_agentcode',
  status: 'eap_status',
  startedAt: 'eap_startedat',
  completedAt: 'eap_completedat',
  sessionData: 'eap_sessiondata',
} as const;

/**
 * Retry configuration for Dataverse API calls
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
} as const;
