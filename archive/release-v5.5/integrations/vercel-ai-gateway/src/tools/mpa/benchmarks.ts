/**
 * MPA Benchmark Tools
 *
 * Tools for retrieving and searching benchmarks and channels.
 * Implements Dataverse query with web search fallback.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { dataverseClient } from '../../utils/dataverse-client.js';
import { DATAVERSE_TABLES, BENCHMARK_COLUMNS, CHANNEL_COLUMNS } from '../../config/dataverse.js';

/**
 * Vertical codes supported by the platform
 */
export const VERTICAL_CODES = [
  'GENERAL',
  'ECOMMERCE',
  'RETAIL',
  'FINANCE',
  'HEALTHCARE',
  'TECHNOLOGY',
  'TRAVEL',
  'AUTOMOTIVE',
  'CPG',
  'B2B',
  'MEDIA_ENTERTAINMENT',
  'TELECOM',
  'EDUCATION',
  'REAL_ESTATE',
  'HOSPITALITY',
  'FOOD_BEVERAGE',
  'FASHION',
  'BEAUTY',
  'SPORTS',
  'GAMING',
  'NONPROFIT',
  'GOVERNMENT',
  'PROFESSIONAL_SERVICES',
] as const;

/**
 * Channel codes supported by the platform
 */
export const CHANNEL_CODES = [
  'PAID_SEARCH',
  'PAID_SOCIAL',
  'PROGRAMMATIC_DISPLAY',
  'CTV_OTT',
  'NATIVE',
  'AUDIO',
  'DOOH',
  'RETAIL_MEDIA',
  'AFFILIATE',
  'EMAIL',
  'VIDEO_OLV',
  'SHOPPING',
] as const;

/**
 * KPI codes supported by the platform
 */
export const KPI_CODES = [
  'CPM',
  'CPC',
  'CTR',
  'CVR',
  'CPA',
  'ROAS',
  'VTR',
  'CPCV',
  'Viewability',
  'Listen-Through Rate',
  'Reach Efficiency',
  'Open Rate',
] as const;

/**
 * Benchmark result interface
 */
export interface BenchmarkResult {
  source: 'dataverse' | 'web_search' | 'estimate' | 'not_found';
  verticalCode: string;
  channelCode: string;
  kpiCode: string;
  metricName?: string;
  metricLow?: number;
  metricMedian?: number;
  metricHigh?: number;
  metricBest?: number;
  metricUnit?: string;
  dataSource?: string;
  dataPeriod?: string;
  confidenceLevel?: string;
  note?: string;
  recommendation?: string;
}

/**
 * Channel search result interface
 */
export interface ChannelSearchResult {
  channelCode: string;
  channelName: string;
  category: string;
  funnelPosition: string;
  score: number;
  minBudget: number;
  rationale: string;
}

/**
 * Default benchmark estimates when no data is available
 */
const DEFAULT_ESTIMATES: Record<string, Record<string, { low: number; median: number; high: number; unit: string }>> = {
  PAID_SEARCH: {
    CPM: { low: 15, median: 28, high: 50, unit: '$' },
    CPC: { low: 0.8, median: 2.2, high: 5, unit: '$' },
    CTR: { low: 2, median: 3.5, high: 6, unit: '%' },
    CVR: { low: 2.5, median: 4, high: 8, unit: '%' },
    CPA: { low: 25, median: 45, high: 90, unit: '$' },
    ROAS: { low: 2.5, median: 4, high: 8, unit: 'x' },
  },
  PAID_SOCIAL: {
    CPM: { low: 7, median: 12, high: 18, unit: '$' },
    CPC: { low: 0.5, median: 1.2, high: 2, unit: '$' },
    CTR: { low: 0.8, median: 1.2, high: 2, unit: '%' },
    CVR: { low: 1.5, median: 2.5, high: 5, unit: '%' },
    CPA: { low: 20, median: 40, high: 80, unit: '$' },
    ROAS: { low: 2, median: 3.5, high: 6, unit: 'x' },
  },
  PROGRAMMATIC_DISPLAY: {
    CPM: { low: 2, median: 5, high: 10, unit: '$' },
    CPC: { low: 0.3, median: 0.6, high: 1.2, unit: '$' },
    CTR: { low: 0.08, median: 0.12, high: 0.25, unit: '%' },
    CVR: { low: 0.5, median: 1, high: 2, unit: '%' },
    CPA: { low: 40, median: 75, high: 150, unit: '$' },
    Viewability: { low: 50, median: 62, high: 75, unit: '%' },
  },
  CTV_OTT: {
    CPM: { low: 20, median: 32, high: 45, unit: '$' },
    CPCV: { low: 0.01, median: 0.02, high: 0.03, unit: '$' },
    VTR: { low: 85, median: 92, high: 97, unit: '%' },
    CTR: { low: 0.3, median: 0.5, high: 0.8, unit: '%' },
    Viewability: { low: 70, median: 82, high: 92, unit: '%' },
  },
  NATIVE: {
    CPM: { low: 5, median: 10, high: 18, unit: '$' },
    CPC: { low: 0.4, median: 0.8, high: 1.5, unit: '$' },
    CTR: { low: 0.2, median: 0.4, high: 0.8, unit: '%' },
    CVR: { low: 1, median: 2, high: 4, unit: '%' },
    CPA: { low: 30, median: 55, high: 100, unit: '$' },
  },
  AUDIO: {
    CPM: { low: 8, median: 15, high: 25, unit: '$' },
    CPCV: { low: 0.01, median: 0.01, high: 0.03, unit: '$' },
    'Listen-Through Rate': { low: 90, median: 95, high: 98, unit: '%' },
    CTR: { low: 0.5, median: 1, high: 2, unit: '%' },
  },
  DOOH: {
    CPM: { low: 5, median: 12, high: 22, unit: '$' },
    'Reach Efficiency': { low: 60, median: 75, high: 88, unit: '%' },
    Viewability: { low: 60, median: 72, high: 85, unit: '%' },
  },
  RETAIL_MEDIA: {
    CPM: { low: 8, median: 15, high: 25, unit: '$' },
    CPC: { low: 0.5, median: 1.2, high: 2.2, unit: '$' },
    CTR: { low: 0.3, median: 0.55, high: 1, unit: '%' },
    CVR: { low: 5, median: 10, high: 18, unit: '%' },
    ROAS: { low: 3, median: 5, high: 10, unit: 'x' },
    CPA: { low: 12, median: 22, high: 40, unit: '$' },
  },
  AFFILIATE: {
    CPA: { low: 15, median: 30, high: 60, unit: '$' },
    CVR: { low: 2, median: 4, high: 8, unit: '%' },
    ROAS: { low: 4, median: 7, high: 12, unit: 'x' },
  },
  EMAIL: {
    CPM: { low: 1, median: 2.5, high: 5, unit: '$' },
    CTR: { low: 2, median: 3.5, high: 6, unit: '%' },
    CVR: { low: 2, median: 4, high: 8, unit: '%' },
    'Open Rate': { low: 18, median: 25, high: 35, unit: '%' },
  },
};

/**
 * Get benchmark estimate when no data available
 */
function getEstimate(channelCode: string, kpiCode: string): BenchmarkResult | null {
  const channelEstimates = DEFAULT_ESTIMATES[channelCode];
  if (!channelEstimates) return null;

  const estimate = channelEstimates[kpiCode];
  if (!estimate) return null;

  return {
    source: 'estimate',
    verticalCode: 'GENERAL',
    channelCode,
    kpiCode,
    metricLow: estimate.low,
    metricMedian: estimate.median,
    metricHigh: estimate.high,
    metricUnit: estimate.unit,
    confidenceLevel: 'Low',
    note: 'This is an AI-generated estimate based on industry averages. Recommend validation with primary sources.',
  };
}

/**
 * getBenchmarks Tool
 *
 * Retrieve performance benchmarks for a specific vertical, channel, and KPI combination.
 * Queries Dataverse first, falls back to estimates if no data found.
 */
export const getBenchmarks = tool({
  description:
    'Retrieve performance benchmarks for a specific vertical, channel, and KPI combination. Returns low, median, high, and best-in-class values with confidence level and data source.',
  parameters: z.object({
    vertical_code: z
      .string()
      .describe(
        'Industry vertical code: GENERAL, ECOMMERCE, RETAIL, FINANCE, HEALTHCARE, TECHNOLOGY, TRAVEL, AUTOMOTIVE, CPG, B2B'
      ),
    channel_code: z
      .string()
      .describe(
        'Media channel code: PAID_SEARCH, PAID_SOCIAL, PROGRAMMATIC_DISPLAY, CTV_OTT, NATIVE, AUDIO, DOOH, RETAIL_MEDIA, AFFILIATE, EMAIL'
      ),
    kpi_code: z.string().describe('KPI code: CPM, CPC, CTR, CVR, CPA, ROAS, VTR, CPCV, Viewability'),
  }),
  execute: async ({ vertical_code, channel_code, kpi_code }): Promise<BenchmarkResult> => {
    try {
      const filter = `${BENCHMARK_COLUMNS.verticalCode} eq '${vertical_code}' and ${BENCHMARK_COLUMNS.channelCode} eq '${channel_code}' and ${BENCHMARK_COLUMNS.kpiCode} eq '${kpi_code}' and ${BENCHMARK_COLUMNS.isActive} eq true`;

      const benchmarks = await dataverseClient.query<Record<string, unknown>>(
        DATAVERSE_TABLES.mpa.benchmark,
        {
          $filter: filter,
          $select: `${BENCHMARK_COLUMNS.metricLow},${BENCHMARK_COLUMNS.metricMedian},${BENCHMARK_COLUMNS.metricHigh},${BENCHMARK_COLUMNS.metricBest},${BENCHMARK_COLUMNS.dataSource},${BENCHMARK_COLUMNS.dataPeriod},${BENCHMARK_COLUMNS.confidenceLevel},${BENCHMARK_COLUMNS.metricUnit},${BENCHMARK_COLUMNS.metricName}`,
          $top: 1,
        }
      );

      if (benchmarks.length > 0) {
        const benchmark = benchmarks[0];
        if (benchmark) {
          return {
            source: 'dataverse',
            verticalCode: vertical_code,
            channelCode: channel_code,
            kpiCode: kpi_code,
            metricName: benchmark[BENCHMARK_COLUMNS.metricName] as string | undefined,
            metricLow: benchmark[BENCHMARK_COLUMNS.metricLow] as number | undefined,
            metricMedian: benchmark[BENCHMARK_COLUMNS.metricMedian] as number | undefined,
            metricHigh: benchmark[BENCHMARK_COLUMNS.metricHigh] as number | undefined,
            metricBest: benchmark[BENCHMARK_COLUMNS.metricBest] as number | undefined,
            metricUnit: benchmark[BENCHMARK_COLUMNS.metricUnit] as string | undefined,
            dataSource: benchmark[BENCHMARK_COLUMNS.dataSource] as string | undefined,
            dataPeriod: benchmark[BENCHMARK_COLUMNS.dataPeriod] as string | undefined,
            confidenceLevel: benchmark[BENCHMARK_COLUMNS.confidenceLevel] as string | undefined,
          };
        }
      }

      if (vertical_code !== 'GENERAL') {
        const generalFilter = `${BENCHMARK_COLUMNS.verticalCode} eq 'GENERAL' and ${BENCHMARK_COLUMNS.channelCode} eq '${channel_code}' and ${BENCHMARK_COLUMNS.kpiCode} eq '${kpi_code}' and ${BENCHMARK_COLUMNS.isActive} eq true`;

        const generalBenchmarks = await dataverseClient.query<Record<string, unknown>>(
          DATAVERSE_TABLES.mpa.benchmark,
          {
            $filter: generalFilter,
            $select: `${BENCHMARK_COLUMNS.metricLow},${BENCHMARK_COLUMNS.metricMedian},${BENCHMARK_COLUMNS.metricHigh},${BENCHMARK_COLUMNS.metricBest},${BENCHMARK_COLUMNS.dataSource},${BENCHMARK_COLUMNS.dataPeriod},${BENCHMARK_COLUMNS.confidenceLevel},${BENCHMARK_COLUMNS.metricUnit},${BENCHMARK_COLUMNS.metricName}`,
            $top: 1,
          }
        );

        if (generalBenchmarks.length > 0) {
          const benchmark = generalBenchmarks[0];
          if (benchmark) {
            return {
              source: 'dataverse',
              verticalCode: 'GENERAL',
              channelCode: channel_code,
              kpiCode: kpi_code,
              metricName: benchmark[BENCHMARK_COLUMNS.metricName] as string | undefined,
              metricLow: benchmark[BENCHMARK_COLUMNS.metricLow] as number | undefined,
              metricMedian: benchmark[BENCHMARK_COLUMNS.metricMedian] as number | undefined,
              metricHigh: benchmark[BENCHMARK_COLUMNS.metricHigh] as number | undefined,
              metricBest: benchmark[BENCHMARK_COLUMNS.metricBest] as number | undefined,
              metricUnit: benchmark[BENCHMARK_COLUMNS.metricUnit] as string | undefined,
              dataSource: benchmark[BENCHMARK_COLUMNS.dataSource] as string | undefined,
              dataPeriod: benchmark[BENCHMARK_COLUMNS.dataPeriod] as string | undefined,
              confidenceLevel: benchmark[BENCHMARK_COLUMNS.confidenceLevel] as string | undefined,
              note: `No ${vertical_code}-specific benchmark available. Using GENERAL industry benchmark.`,
            };
          }
        }
      }

      const estimate = getEstimate(channel_code, kpi_code);
      if (estimate) {
        return estimate;
      }

      return {
        source: 'not_found',
        verticalCode: vertical_code,
        channelCode: channel_code,
        kpiCode: kpi_code,
        note: `No benchmarks found for ${vertical_code}/${channel_code}/${kpi_code}.`,
        recommendation: 'Consider using GENERAL vertical as fallback or request client historical data.',
      };
    } catch (error) {
      console.error('getBenchmarks error:', error);

      const estimate = getEstimate(channel_code, kpi_code);
      if (estimate) {
        estimate.note = `Database query failed. ${estimate.note}`;
        return estimate;
      }

      return {
        source: 'not_found',
        verticalCode: vertical_code,
        channelCode: channel_code,
        kpiCode: kpi_code,
        note: `Error retrieving benchmarks: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendation: 'Please try again or provide client-specific data.',
      };
    }
  },
});

/**
 * Generate channel recommendation rationale
 */
function generateChannelRationale(
  channel: Record<string, unknown>,
  objective: string,
  audienceType: string
): string {
  const channelName = channel[CHANNEL_COLUMNS.channelName] as string;
  const funnelPosition = channel[CHANNEL_COLUMNS.funnelPosition] as string;
  const category = channel[CHANNEL_COLUMNS.category] as string;

  const objectiveMap: Record<string, string> = {
    AWARENESS: 'building awareness',
    CONSIDERATION: 'driving consideration',
    CONVERSION: 'generating conversions',
    RETENTION: 'customer retention',
  };

  const funnelMap: Record<string, string> = {
    UPPER_FUNNEL: 'upper-funnel reach',
    MID_FUNNEL: 'mid-funnel engagement',
    LOWER_FUNNEL: 'lower-funnel conversion',
    FULL_FUNNEL: 'full-funnel coverage',
  };

  const objectiveText = objectiveMap[objective] ?? objective.toLowerCase();
  const funnelText = funnelMap[funnelPosition] ?? funnelPosition;

  return `${channelName} (${category}) is effective for ${objectiveText} with strong ${funnelText} capabilities for ${audienceType} audiences.`;
}

/**
 * searchChannels Tool
 *
 * Find and rank media channels based on campaign objective, budget range, and audience characteristics.
 */
export const searchChannels = tool({
  description:
    'Find and rank media channels based on campaign objective, budget range, and audience characteristics.',
  parameters: z.object({
    objective: z.enum(['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'RETENTION']),
    budget_range: z.enum(['UNDER_50K', '50K_250K', '250K_1M', 'OVER_1M']),
    audience_type: z.string().describe('Target audience description'),
    vertical_code: z.string().optional().describe('Industry vertical code for more specific recommendations'),
  }),
  execute: async ({
    objective,
    budget_range,
    audience_type,
    vertical_code,
  }): Promise<{
    recommended_channels: ChannelSearchResult[];
    objective: string;
    budget_range: string;
    audience_type: string;
    vertical_code?: string;
  }> => {
    try {
      const channels = await dataverseClient.query<Record<string, unknown>>(DATAVERSE_TABLES.mpa.channel, {
        $filter: `${CHANNEL_COLUMNS.isActive} eq true`,
        $orderby: `${CHANNEL_COLUMNS.sortOrder} asc`,
      });

      const budgetThresholds: Record<string, number> = {
        UNDER_50K: 50000,
        '50K_250K': 250000,
        '250K_1M': 1000000,
        OVER_1M: Infinity,
      };

      const scoredChannels = channels.map((channel) => {
        let score = 0;
        const funnelPosition = channel[CHANNEL_COLUMNS.funnelPosition] as string;
        const minBudget = (channel[CHANNEL_COLUMNS.minBudget] as number) ?? 0;

        if (objective === 'AWARENESS' && funnelPosition === 'UPPER_FUNNEL') score += 30;
        if (objective === 'AWARENESS' && funnelPosition === 'FULL_FUNNEL') score += 20;
        if (objective === 'CONSIDERATION' && funnelPosition === 'MID_FUNNEL') score += 30;
        if (objective === 'CONSIDERATION' && funnelPosition === 'FULL_FUNNEL') score += 20;
        if (objective === 'CONVERSION' && funnelPosition === 'LOWER_FUNNEL') score += 30;
        if (objective === 'CONVERSION' && funnelPosition === 'FULL_FUNNEL') score += 20;
        if (objective === 'RETENTION' && funnelPosition === 'LOWER_FUNNEL') score += 20;
        if (objective === 'RETENTION' && funnelPosition === 'FULL_FUNNEL') score += 25;

        const maxBudget = budgetThresholds[budget_range] ?? Infinity;
        if (minBudget <= maxBudget) score += 20;
        if (minBudget <= maxBudget * 0.5) score += 10;

        const channelCode = channel[CHANNEL_COLUMNS.channelCode] as string;
        if (audience_type.toLowerCase().includes('young') || audience_type.toLowerCase().includes('gen z')) {
          if (['PAID_SOCIAL', 'VIDEO_OLV', 'CTV_OTT'].includes(channelCode)) score += 15;
        }
        if (audience_type.toLowerCase().includes('business') || audience_type.toLowerCase().includes('b2b')) {
          if (['PAID_SEARCH', 'NATIVE', 'EMAIL'].includes(channelCode)) score += 15;
        }
        if (audience_type.toLowerCase().includes('shopper') || audience_type.toLowerCase().includes('retail')) {
          if (['RETAIL_MEDIA', 'SHOPPING', 'PAID_SEARCH'].includes(channelCode)) score += 15;
        }

        return {
          channelCode,
          channelName: channel[CHANNEL_COLUMNS.channelName] as string,
          category: channel[CHANNEL_COLUMNS.category] as string,
          funnelPosition,
          score,
          minBudget,
          rationale: generateChannelRationale(channel, objective, audience_type),
        };
      });

      const recommendedChannels = scoredChannels.sort((a, b) => b.score - a.score).slice(0, 5);

      return {
        recommended_channels: recommendedChannels,
        objective,
        budget_range,
        audience_type,
        vertical_code,
      };
    } catch (error) {
      console.error('searchChannels error:', error);

      return {
        recommended_channels: [
          {
            channelCode: 'PAID_SEARCH',
            channelName: 'Paid Search',
            category: 'SEARCH',
            funnelPosition: 'FULL_FUNNEL',
            score: 80,
            minBudget: 5000,
            rationale: 'Paid Search is a versatile channel effective across the funnel for most audience types.',
          },
          {
            channelCode: 'PAID_SOCIAL',
            channelName: 'Paid Social',
            category: 'SOCIAL',
            funnelPosition: 'FULL_FUNNEL',
            score: 75,
            minBudget: 5000,
            rationale: 'Paid Social provides strong targeting capabilities and broad reach.',
          },
        ],
        objective,
        budget_range,
        audience_type,
        vertical_code,
      };
    }
  },
});

/**
 * Standalone executor for getBenchmarks (for direct API calls)
 */
export async function executeBenchmarkQuery(
  vertical_code: string,
  channel_code?: string,
  kpi_code?: string,
  _budget_tier?: 'LOW' | 'MEDIUM' | 'HIGH'
): Promise<BenchmarkResult> {
  const channelCode = channel_code ?? 'PAID_SEARCH';
  const kpiCode = kpi_code ?? 'CPM';

  try {
    const filter = `${BENCHMARK_COLUMNS.verticalCode} eq '${vertical_code}' and ${BENCHMARK_COLUMNS.channelCode} eq '${channelCode}' and ${BENCHMARK_COLUMNS.kpiCode} eq '${kpiCode}' and ${BENCHMARK_COLUMNS.isActive} eq true`;

    const benchmarks = await dataverseClient.query<Record<string, unknown>>(
      DATAVERSE_TABLES.mpa.benchmark,
      {
        $filter: filter,
        $select: `${BENCHMARK_COLUMNS.metricLow},${BENCHMARK_COLUMNS.metricMedian},${BENCHMARK_COLUMNS.metricHigh},${BENCHMARK_COLUMNS.metricBest},${BENCHMARK_COLUMNS.dataSource},${BENCHMARK_COLUMNS.dataPeriod},${BENCHMARK_COLUMNS.confidenceLevel},${BENCHMARK_COLUMNS.metricUnit},${BENCHMARK_COLUMNS.metricName}`,
        $top: 1,
      }
    );

    if (benchmarks.length > 0) {
      const benchmark = benchmarks[0];
      if (benchmark) {
        return {
          source: 'dataverse',
          verticalCode: vertical_code,
          channelCode: channelCode,
          kpiCode: kpiCode,
          metricName: benchmark[BENCHMARK_COLUMNS.metricName] as string | undefined,
          metricLow: benchmark[BENCHMARK_COLUMNS.metricLow] as number | undefined,
          metricMedian: benchmark[BENCHMARK_COLUMNS.metricMedian] as number | undefined,
          metricHigh: benchmark[BENCHMARK_COLUMNS.metricHigh] as number | undefined,
          metricBest: benchmark[BENCHMARK_COLUMNS.metricBest] as number | undefined,
          metricUnit: benchmark[BENCHMARK_COLUMNS.metricUnit] as string | undefined,
          dataSource: benchmark[BENCHMARK_COLUMNS.dataSource] as string | undefined,
          dataPeriod: benchmark[BENCHMARK_COLUMNS.dataPeriod] as string | undefined,
          confidenceLevel: benchmark[BENCHMARK_COLUMNS.confidenceLevel] as string | undefined,
        };
      }
    }

    const estimate = getEstimate(channelCode, kpiCode);
    if (estimate) {
      return estimate;
    }

    return {
      source: 'not_found',
      verticalCode: vertical_code,
      channelCode: channelCode,
      kpiCode: kpiCode,
      note: `No benchmarks found for ${vertical_code}/${channelCode}/${kpiCode}.`,
      recommendation: 'Consider using GENERAL vertical as fallback.',
    };
  } catch (error) {
    console.error('executeBenchmarkQuery error:', error);
    const estimate = getEstimate(channelCode, kpiCode);
    if (estimate) {
      return estimate;
    }
    return {
      source: 'not_found',
      verticalCode: vertical_code,
      channelCode: channelCode,
      kpiCode: kpiCode,
      note: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Standalone executor for searchChannels (for direct API calls)
 */
export async function executeChannelSearch(
  objective: 'AWARENESS' | 'CONSIDERATION' | 'CONVERSION' | 'RETENTION',
  budget: number,
  vertical_code: string,
  audience_description?: string,
  exclude_channels?: string[],
  max_results?: number
): Promise<{
  recommended_channels: ChannelSearchResult[];
  objective: string;
  budget_range: string;
  audience_type: string;
  vertical_code?: string;
}> {
  const audienceType = audience_description ?? 'general consumers';
  const maxResults = max_results ?? 10;
  const excludeSet = new Set(exclude_channels ?? []);

  let budgetRange: string;
  if (budget < 50000) budgetRange = 'UNDER_50K';
  else if (budget < 250000) budgetRange = '50K_250K';
  else if (budget < 1000000) budgetRange = '250K_1M';
  else budgetRange = 'OVER_1M';

  try {
    const channels = await dataverseClient.query<Record<string, unknown>>(DATAVERSE_TABLES.mpa.channel, {
      $filter: `${CHANNEL_COLUMNS.isActive} eq true`,
      $orderby: `${CHANNEL_COLUMNS.sortOrder} asc`,
    });

    const scoredChannels = channels
      .filter((channel) => !excludeSet.has(channel[CHANNEL_COLUMNS.channelCode] as string))
      .map((channel) => {
        let score = 0;
        const funnelPosition = channel[CHANNEL_COLUMNS.funnelPosition] as string;
        const minBudget = (channel[CHANNEL_COLUMNS.minBudget] as number) ?? 0;

        if (objective === 'AWARENESS' && funnelPosition === 'UPPER_FUNNEL') score += 30;
        if (objective === 'AWARENESS' && funnelPosition === 'FULL_FUNNEL') score += 20;
        if (objective === 'CONSIDERATION' && funnelPosition === 'MID_FUNNEL') score += 30;
        if (objective === 'CONVERSION' && funnelPosition === 'LOWER_FUNNEL') score += 30;
        if (objective === 'RETENTION' && funnelPosition === 'FULL_FUNNEL') score += 25;

        if (minBudget <= budget) score += 20;
        if (minBudget <= budget * 0.5) score += 10;

        return {
          channelCode: channel[CHANNEL_COLUMNS.channelCode] as string,
          channelName: channel[CHANNEL_COLUMNS.channelName] as string,
          category: channel[CHANNEL_COLUMNS.category] as string,
          funnelPosition,
          score,
          minBudget,
          rationale: generateChannelRationale(channel, objective, audienceType),
        };
      });

    const recommendedChannels = scoredChannels.sort((a, b) => b.score - a.score).slice(0, maxResults);

    return {
      recommended_channels: recommendedChannels,
      objective,
      budget_range: budgetRange,
      audience_type: audienceType,
      vertical_code,
    };
  } catch (error) {
    console.error('executeChannelSearch error:', error);
    return {
      recommended_channels: [
        {
          channelCode: 'PAID_SEARCH',
          channelName: 'Paid Search',
          category: 'SEARCH',
          funnelPosition: 'FULL_FUNNEL',
          score: 80,
          minBudget: 5000,
          rationale: 'Paid Search is effective across the funnel.',
        },
      ],
      objective,
      budget_range: budgetRange,
      audience_type: audienceType,
      vertical_code,
    };
  }
}
