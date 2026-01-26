/**
 * MPA Projection Tools
 *
 * Tools for calculating campaign projections including reach, frequency, impressions, and cost metrics.
 * Based on Analytics Engine v5.5 formulas.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { executeBenchmarkQuery } from './benchmarks.js';

/**
 * Channel allocation schema
 */
const ChannelAllocationSchema = z.object({
  channel_code: z.string(),
  allocation_percent: z.number().min(0).max(100),
});

/**
 * Projection result for a single channel
 */
export interface ChannelProjection {
  channelCode: string;
  allocationPercent: number;
  budget: number;
  cpmUsed: number;
  cpmSource: string;
  impressions: number;
  reach: number;
  frequency: string;
  ctr: number;
  clicks: number;
  cpc: string;
}

/**
 * Full projection result
 */
export interface ProjectionResult {
  summary: {
    totalBudget: number;
    durationWeeks: number;
    totalImpressions: number;
    totalReach: number;
    avgFrequency: string;
    diminishingReturnsLevel: string;
    warning: string | null;
  };
  channelProjections: ChannelProjection[];
  methodology: string;
  confidence: string;
}

/**
 * Default CPM estimates by channel (used when benchmarks unavailable)
 */
const DEFAULT_CPM: Record<string, number> = {
  PAID_SEARCH: 28.0,
  PAID_SOCIAL: 12.0,
  PROGRAMMATIC_DISPLAY: 5.0,
  CTV_OTT: 32.0,
  NATIVE: 10.0,
  AUDIO: 15.0,
  DOOH: 12.0,
  RETAIL_MEDIA: 15.0,
  AFFILIATE: 10.0,
  EMAIL: 2.5,
  VIDEO_OLV: 22.0,
  SHOPPING: 22.0,
};

/**
 * Default CTR estimates by channel
 */
const DEFAULT_CTR: Record<string, number> = {
  PAID_SEARCH: 3.5,
  PAID_SOCIAL: 1.2,
  PROGRAMMATIC_DISPLAY: 0.12,
  CTV_OTT: 0.5,
  NATIVE: 0.4,
  AUDIO: 1.0,
  DOOH: 0.0,
  RETAIL_MEDIA: 0.55,
  AFFILIATE: 0.5,
  EMAIL: 3.5,
  VIDEO_OLV: 0.8,
  SHOPPING: 2.5,
};

/**
 * Base frequency by channel (Analytics Engine recommendations)
 */
const BASE_FREQUENCY: Record<string, number> = {
  PAID_SEARCH: 1.0,
  PAID_SOCIAL: 3.0,
  PROGRAMMATIC_DISPLAY: 5.0,
  CTV_OTT: 4.0,
  NATIVE: 4.0,
  AUDIO: 6.0,
  DOOH: 8.0,
  RETAIL_MEDIA: 3.0,
  AFFILIATE: 1.0,
  EMAIL: 2.0,
  VIDEO_OLV: 3.0,
  SHOPPING: 2.0,
};

/**
 * Objective multipliers for frequency calculation
 */
const OBJECTIVE_FREQUENCY_MULTIPLIER: Record<string, number> = {
  AWARENESS: 1.2,
  CONSIDERATION: 1.0,
  CONVERSION: 0.8,
  RETENTION: 1.5,
};

/**
 * Calculate optimal frequency based on channel, objective, and duration
 * Analytics Engine formula
 */
function getOptimalFrequency(channel: string, objective: string, weeks: number): number {
  const base = BASE_FREQUENCY[channel] ?? 3.0;
  const multiplier = OBJECTIVE_FREQUENCY_MULTIPLIER[objective] ?? 1.0;

  let durationMultiplier = 1.0;
  if (weeks <= 4) {
    durationMultiplier = 1.0;
  } else if (weeks <= 8) {
    durationMultiplier = 0.9;
  } else {
    durationMultiplier = 0.8;
  }

  return base * multiplier * durationMultiplier;
}

/**
 * Get CPM from benchmarks or default
 */
async function getCPM(
  verticalCode: string,
  channelCode: string
): Promise<{ cpm: number; source: string }> {
  try {
    const benchmark = await executeBenchmarkQuery(verticalCode, channelCode, 'CPM');

    if (benchmark.metricMedian !== undefined) {
      return {
        cpm: benchmark.metricMedian,
        source: benchmark.source,
      };
    }
  } catch (error) {
    console.warn(`Failed to get CPM benchmark for ${channelCode}:`, error);
  }

  return {
    cpm: DEFAULT_CPM[channelCode] ?? 10.0,
    source: 'estimate',
  };
}

/**
 * Get CTR from benchmarks or default
 */
async function getCTR(verticalCode: string, channelCode: string): Promise<number> {
  try {
    const benchmark = await executeBenchmarkQuery(verticalCode, channelCode, 'CTR');

    if (benchmark.metricMedian !== undefined) {
      return benchmark.metricMedian;
    }
  } catch (error) {
    console.warn(`Failed to get CTR benchmark for ${channelCode}:`, error);
  }

  return DEFAULT_CTR[channelCode] ?? 0.5;
}

/**
 * runProjections Tool
 *
 * Calculate campaign projections including reach, frequency, impressions, and cost metrics
 * based on budget allocation and benchmarks.
 */
export const runProjections = tool({
  description:
    'Calculate campaign projections including reach, frequency, impressions, and cost metrics based on budget allocation and benchmarks.',
  parameters: z.object({
    total_budget: z.number().describe('Total campaign budget in dollars'),
    channel_allocations: z
      .array(ChannelAllocationSchema)
      .describe('Array of channel allocations with channel_code and allocation_percent'),
    duration_weeks: z.number().min(1).max(52).describe('Campaign duration in weeks'),
    vertical_code: z.string().default('GENERAL').describe('Industry vertical code'),
    objective: z.enum(['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'RETENTION']),
  }),
  execute: async ({
    total_budget,
    channel_allocations,
    duration_weeks,
    vertical_code,
    objective,
  }): Promise<ProjectionResult> => {
    const projections: ChannelProjection[] = [];
    let totalImpressions = 0;
    let totalReach = 0;

    const totalAllocation = channel_allocations.reduce((sum, a) => sum + a.allocation_percent, 0);
    if (Math.abs(totalAllocation - 100) > 1) {
      console.warn(`Channel allocations sum to ${totalAllocation}%, normalizing...`);
    }

    for (const allocation of channel_allocations) {
      const normalizedPercent =
        totalAllocation > 0 ? (allocation.allocation_percent / totalAllocation) * 100 : 0;
      const channelBudget = total_budget * (normalizedPercent / 100);

      const { cpm, source: cpmSource } = await getCPM(vertical_code, allocation.channel_code);
      const ctr = await getCTR(vertical_code, allocation.channel_code);

      const impressions = (channelBudget / cpm) * 1000;

      const avgFrequency = getOptimalFrequency(allocation.channel_code, objective, duration_weeks);
      const reach = impressions / avgFrequency;

      const clicks = impressions * (ctr / 100);
      const cpc = clicks > 0 ? channelBudget / clicks : 0;

      projections.push({
        channelCode: allocation.channel_code,
        allocationPercent: normalizedPercent,
        budget: channelBudget,
        cpmUsed: cpm,
        cpmSource,
        impressions: Math.round(impressions),
        reach: Math.round(reach),
        frequency: avgFrequency.toFixed(1),
        ctr,
        clicks: Math.round(clicks),
        cpc: cpc.toFixed(2),
      });

      totalImpressions += impressions;
      totalReach += reach;
    }

    const k = 0.00001;
    const responseLevel = 1 - Math.exp(-k * total_budget);

    let diminishingReturnsWarning: string | null = null;
    if (responseLevel > 0.85) {
      diminishingReturnsWarning =
        'Budget is significantly past the point of diminishing returns for this audience size. Consider broadening reach or reducing spend.';
    } else if (responseLevel > 0.8) {
      diminishingReturnsWarning =
        'Budget may be approaching diminishing returns threshold for this audience size.';
    }

    return {
      summary: {
        totalBudget: total_budget,
        durationWeeks: duration_weeks,
        totalImpressions: Math.round(totalImpressions),
        totalReach: Math.round(totalReach),
        avgFrequency: (totalImpressions / totalReach).toFixed(1),
        diminishingReturnsLevel: (responseLevel * 100).toFixed(1) + '%',
        warning: diminishingReturnsWarning,
      },
      channelProjections: projections,
      methodology:
        'Projections based on Analytics Engine v5.5 formulas using median benchmark values. Reach calculated using channel-specific optimal frequency targets.',
      confidence:
        'Medium - based on industry benchmarks. Recommend validation with platform-specific data for improved accuracy.',
    };
  },
});

/**
 * Reach curve calculation based on budget and target audience size
 * Analytics Engine formula: Response = 1 - exp(-k * Spend)
 */
export function calculateReachCurve(
  budget: number,
  targetAudienceSize: number
): {
  reachPercent: number;
  effectiveReach: number;
  saturationLevel: string;
} {
  const k = 2 / targetAudienceSize;
  const responseLevel = 1 - Math.exp(-k * budget);
  const reachPercent = responseLevel * 100;
  const effectiveReach = Math.round(targetAudienceSize * responseLevel);

  let saturationLevel: string;
  if (responseLevel < 0.3) {
    saturationLevel = 'Low - significant room for growth';
  } else if (responseLevel < 0.5) {
    saturationLevel = 'Moderate - healthy growth potential';
  } else if (responseLevel < 0.7) {
    saturationLevel = 'Good - approaching efficient frontier';
  } else if (responseLevel < 0.85) {
    saturationLevel = 'High - diminishing returns beginning';
  } else {
    saturationLevel = 'Saturated - minimal incremental impact';
  }

  return {
    reachPercent: parseFloat(reachPercent.toFixed(1)),
    effectiveReach,
    saturationLevel,
  };
}

/**
 * Adstock decay calculation for media mix modeling
 * Analytics Engine formula: Adstock(t) = Spend(t) + lambda * Adstock(t-1)
 */
export function calculateAdstock(
  weeklySpend: number[],
  decayRate: number = 0.5
): {
  adstockValues: number[];
  peakWeek: number;
  totalCarryover: number;
} {
  const adstockValues: number[] = [];
  let previousAdstock = 0;

  for (const spend of weeklySpend) {
    const currentAdstock = spend + decayRate * previousAdstock;
    adstockValues.push(parseFloat(currentAdstock.toFixed(2)));
    previousAdstock = currentAdstock;
  }

  const peakWeek = adstockValues.indexOf(Math.max(...adstockValues)) + 1;
  const totalCarryover = adstockValues.reduce((sum, val, i) => {
    const spend = weeklySpend[i] ?? 0;
    return sum + (val - spend);
  }, 0);

  return {
    adstockValues,
    peakWeek,
    totalCarryover: parseFloat(totalCarryover.toFixed(2)),
  };
}

/**
 * Weekly spend pacing calculator
 */
export function calculateWeeklyPacing(
  totalBudget: number,
  durationWeeks: number,
  frontLoadPercent: number = 0
): {
  weeklyBudgets: number[];
  pacingType: string;
} {
  const weeklyBudgets: number[] = [];
  let pacingType: string;

  if (frontLoadPercent <= 0) {
    const weeklyAmount = totalBudget / durationWeeks;
    for (let i = 0; i < durationWeeks; i++) {
      weeklyBudgets.push(parseFloat(weeklyAmount.toFixed(2)));
    }
    pacingType = 'Even pacing';
  } else {
    const frontLoadWeeks = Math.ceil(durationWeeks * 0.3);
    const frontLoadBudget = totalBudget * (frontLoadPercent / 100);
    const remainingBudget = totalBudget - frontLoadBudget;
    const remainingWeeks = durationWeeks - frontLoadWeeks;

    const frontLoadWeekly = frontLoadBudget / frontLoadWeeks;
    const remainingWeekly = remainingBudget / remainingWeeks;

    for (let i = 0; i < durationWeeks; i++) {
      if (i < frontLoadWeeks) {
        weeklyBudgets.push(parseFloat(frontLoadWeekly.toFixed(2)));
      } else {
        weeklyBudgets.push(parseFloat(remainingWeekly.toFixed(2)));
      }
    }
    pacingType = `Front-loaded (${frontLoadPercent}% in first ${frontLoadWeeks} weeks)`;
  }

  return {
    weeklyBudgets,
    pacingType,
  };
}

/**
 * Standalone executor for runProjections (for direct API calls)
 */
export async function executeProjections(
  budget: number,
  channel_allocations: Array<{ channel_code: string; allocation_percent: number }>,
  _vertical_code: string,
  campaign_weeks: number,
  objective: 'AWARENESS' | 'CONSIDERATION' | 'CONVERSION' | 'RETENTION',
  _target_audience_size?: number
): Promise<ProjectionResult> {
  const projections: ChannelProjection[] = [];
  let totalImpressions = 0;
  let totalReach = 0;

  const totalAllocation = channel_allocations.reduce((sum, a) => sum + a.allocation_percent, 0);

  for (const allocation of channel_allocations) {
    const normalizedPercent =
      totalAllocation > 0 ? (allocation.allocation_percent / totalAllocation) * 100 : 0;
    const channelBudget = budget * (normalizedPercent / 100);

    const cpm = DEFAULT_CPM[allocation.channel_code] ?? 10.0;
    const ctr = DEFAULT_CTR[allocation.channel_code] ?? 0.5;

    const impressions = (channelBudget / cpm) * 1000;
    const avgFrequency = getOptimalFrequency(allocation.channel_code, objective, campaign_weeks);
    const reach = impressions / avgFrequency;
    const clicks = impressions * (ctr / 100);
    const cpc = clicks > 0 ? channelBudget / clicks : 0;

    projections.push({
      channelCode: allocation.channel_code,
      allocationPercent: normalizedPercent,
      budget: channelBudget,
      cpmUsed: cpm,
      cpmSource: 'estimate',
      impressions: Math.round(impressions),
      reach: Math.round(reach),
      frequency: avgFrequency.toFixed(1),
      ctr,
      clicks: Math.round(clicks),
      cpc: cpc.toFixed(2),
    });

    totalImpressions += impressions;
    totalReach += reach;
  }

  const k = 0.00001;
  const responseLevel = 1 - Math.exp(-k * budget);

  let diminishingReturnsWarning: string | null = null;
  if (responseLevel > 0.85) {
    diminishingReturnsWarning =
      'Budget significantly past diminishing returns for audience size.';
  } else if (responseLevel > 0.8) {
    diminishingReturnsWarning = 'Budget approaching diminishing returns threshold.';
  }

  return {
    summary: {
      totalBudget: budget,
      durationWeeks: campaign_weeks,
      totalImpressions: Math.round(totalImpressions),
      totalReach: Math.round(totalReach),
      avgFrequency: totalReach > 0 ? (totalImpressions / totalReach).toFixed(1) : '0',
      diminishingReturnsLevel: (responseLevel * 100).toFixed(1) + '%',
      warning: diminishingReturnsWarning,
    },
    channelProjections: projections,
    methodology: 'Projections based on Analytics Engine v5.5 formulas.',
    confidence: 'Medium - based on industry benchmarks.',
  };
}
