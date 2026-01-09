/**
 * Dataverse Schemas
 *
 * Zod schemas for Dataverse table structures.
 * Used for type validation and structured output generation.
 */

import { z } from 'zod';

/**
 * Section types for media plans
 */
export const SectionTypeEnum = z.enum([
  'ClientContext',
  'Objectives',
  'Budget',
  'Audience',
  'ChannelMix',
  'Partners',
  'Measurement',
  'Optimization',
  'Compliance',
  'FinalPlan',
]);

export type SectionType = z.infer<typeof SectionTypeEnum>;

/**
 * Section status enum
 */
export const SectionStatusEnum = z.enum(['NotStarted', 'InProgress', 'Complete', 'Skipped']);

export type SectionStatus = z.infer<typeof SectionStatusEnum>;

/**
 * Confidence level enum
 */
export const ConfidenceLevelEnum = z.enum(['High', 'Medium', 'Low', 'Very_Low']);

export type ConfidenceLevel = z.infer<typeof ConfidenceLevelEnum>;

/**
 * Funnel position enum
 */
export const FunnelPositionEnum = z.enum(['UPPER_FUNNEL', 'MID_FUNNEL', 'LOWER_FUNNEL', 'FULL_FUNNEL']);

export type FunnelPosition = z.infer<typeof FunnelPositionEnum>;

/**
 * Channel category enum
 */
export const ChannelCategoryEnum = z.enum([
  'SEARCH',
  'SOCIAL',
  'DISPLAY',
  'VIDEO',
  'AUDIO',
  'COMMERCE',
  'OUT_OF_HOME',
  'AFFILIATE',
  'EMAIL',
]);

export type ChannelCategory = z.infer<typeof ChannelCategoryEnum>;

/**
 * Plan status enum
 */
export const PlanStatusEnum = z.enum(['Draft', 'InProgress', 'Complete', 'Approved', 'Archived']);

export type PlanStatus = z.infer<typeof PlanStatusEnum>;

/**
 * Schema for mpa_plandata table records
 */
export const PlanDataSchema = z.object({
  mpa_plandataid: z.string().uuid().optional(),
  mpa_planid: z.string().uuid().describe('Reference to mpa_mediaplan'),
  mpa_sectiontype: SectionTypeEnum,
  mpa_stepnumber: z.number().min(1).max(10),
  mpa_sectiondata: z.string().describe('JSON data content'),
  mpa_sectionstatus: SectionStatusEnum,
  mpa_datasource: z.string().describe('Source of data: KB, Web, User, API, Estimate'),
  mpa_createdon: z.string().datetime().optional(),
  mpa_modifiedon: z.string().datetime().optional(),
});

export type PlanData = z.infer<typeof PlanDataSchema>;

/**
 * Schema for channel allocation output
 */
export const ChannelAllocationSchema = z.object({
  channel_code: z.string(),
  channel_name: z.string().optional(),
  allocation_percent: z.number().min(0).max(100),
  budget_amount: z.number(),
  projected_impressions: z.number().optional(),
  projected_cpm: z.number().optional(),
  projected_cpc: z.number().optional(),
  projected_ctr: z.number().optional(),
  rationale: z.string(),
});

export type ChannelAllocation = z.infer<typeof ChannelAllocationSchema>;

/**
 * Schema for objectives section data
 */
export const ObjectivesSectionSchema = z.object({
  primary_objective: z.enum(['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'RETENTION']),
  secondary_objectives: z.array(z.string()).optional(),
  target_kpis: z.array(
    z.object({
      kpi_code: z.string(),
      target_value: z.number(),
      unit: z.string(),
    })
  ),
  target_volume: z.number().optional().describe('Target conversions/acquisitions'),
  success_definition: z.string().optional(),
});

export type ObjectivesSection = z.infer<typeof ObjectivesSectionSchema>;

/**
 * Schema for audience section data
 */
export const AudienceSectionSchema = z.object({
  primary_audience: z.object({
    description: z.string(),
    demographics: z.object({
      age_range: z.string().optional(),
      gender: z.string().optional(),
      income: z.string().optional(),
      location: z.string().optional(),
    }),
    psychographics: z.array(z.string()).optional(),
    behaviors: z.array(z.string()).optional(),
  }),
  secondary_audiences: z
    .array(
      z.object({
        description: z.string(),
        priority: z.number(),
      })
    )
    .optional(),
  audience_size_estimate: z.number().optional(),
  targeting_approach: z.string().optional(),
});

export type AudienceSection = z.infer<typeof AudienceSectionSchema>;

/**
 * Schema for budget section data
 */
export const BudgetSectionSchema = z.object({
  total_budget: z.number(),
  currency: z.string().default('USD'),
  budget_type: z.enum(['Working', 'Total', 'Media Only']),
  agency_fees_percent: z.number().optional(),
  contingency_percent: z.number().optional(),
  pacing_type: z.enum(['Even', 'Front-loaded', 'Back-loaded', 'Custom']),
  weekly_budgets: z.array(z.number()).optional(),
  budget_flexibility: z.string().optional(),
});

export type BudgetSection = z.infer<typeof BudgetSectionSchema>;

/**
 * Schema for channel mix section data
 */
export const ChannelMixSectionSchema = z.object({
  allocations: z.array(ChannelAllocationSchema),
  total_allocation_percent: z.number(),
  channel_strategy: z.string().optional(),
  sequencing_notes: z.string().optional(),
});

export type ChannelMixSection = z.infer<typeof ChannelMixSectionSchema>;

/**
 * Schema for measurement section data
 */
export const MeasurementSectionSchema = z.object({
  kpis: z.array(
    z.object({
      kpi_code: z.string(),
      kpi_name: z.string(),
      target: z.number(),
      unit: z.string(),
      measurement_source: z.string(),
    })
  ),
  attribution_model: z.enum([
    'Last Click',
    'First Click',
    'Linear',
    'Time Decay',
    'Position Based',
    'Data Driven',
    'Multi-Touch',
  ]),
  measurement_partners: z.array(z.string()).optional(),
  reporting_cadence: z.enum(['Daily', 'Weekly', 'Bi-weekly', 'Monthly']),
  optimization_triggers: z.array(z.string()).optional(),
});

export type MeasurementSection = z.infer<typeof MeasurementSectionSchema>;

/**
 * Schema for mpa_benchmark table records
 */
export const BenchmarkSchema = z.object({
  mpa_benchmarkid: z.string().uuid().optional(),
  mpa_verticalcode: z.string(),
  mpa_channelcode: z.string(),
  mpa_kpicode: z.string(),
  mpa_metricname: z.string(),
  mpa_metriclow: z.number(),
  mpa_metricmedian: z.number(),
  mpa_metrichigh: z.number(),
  mpa_metricbest: z.number().optional(),
  mpa_datasource: z.string(),
  mpa_dataperiod: z.string(),
  mpa_confidencelevel: ConfidenceLevelEnum,
  mpa_metricunit: z.string(),
  mpa_isactive: z.boolean().default(true),
});

export type Benchmark = z.infer<typeof BenchmarkSchema>;

/**
 * Schema for mpa_channel table records
 */
export const ChannelSchema = z.object({
  mpa_channelid: z.string().uuid().optional(),
  mpa_channelcode: z.string(),
  mpa_channelname: z.string(),
  mpa_category: ChannelCategoryEnum,
  mpa_funnelposition: FunnelPositionEnum,
  mpa_minbudget: z.number().optional(),
  mpa_capabilities: z.string().optional().describe('JSON array of capabilities'),
  mpa_sortorder: z.number().optional(),
  mpa_isactive: z.boolean().default(true),
});

export type Channel = z.infer<typeof ChannelSchema>;

/**
 * Schema for mpa_mediaplan table records
 */
export const MediaPlanSchema = z.object({
  mpa_mediaplanid: z.string().uuid().optional(),
  mpa_planname: z.string(),
  mpa_clientid: z.string().uuid().optional(),
  mpa_verticalcode: z.string().optional(),
  mpa_totalbudget: z.number(),
  mpa_status: PlanStatusEnum,
  mpa_startdate: z.string().datetime().optional(),
  mpa_enddate: z.string().datetime().optional(),
  mpa_createdon: z.string().datetime().optional(),
  mpa_modifiedon: z.string().datetime().optional(),
  mpa_createdby: z.string().uuid().optional(),
});

export type MediaPlan = z.infer<typeof MediaPlanSchema>;

/**
 * Schema for eap_session table records
 */
export const SessionSchema = z.object({
  eap_sessionid: z.string().uuid().optional(),
  eap_sessioncode: z.string(),
  eap_userid: z.string().uuid(),
  eap_clientid: z.string().uuid().optional(),
  eap_agentcode: z.string(),
  eap_status: z.enum(['Active', 'Completed', 'Abandoned', 'Paused']),
  eap_startedat: z.string().datetime(),
  eap_completedat: z.string().datetime().optional(),
  eap_sessiondata: z.string().describe('JSON session data'),
});

export type Session = z.infer<typeof SessionSchema>;

/**
 * Schema for structured plan output (for generateObject)
 */
export const StructuredPlanOutputSchema = z.object({
  planName: z.string(),
  totalBudget: z.number(),
  objective: z.enum(['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'RETENTION']),
  vertical: z.string(),
  audience: AudienceSectionSchema,
  channelMix: ChannelMixSectionSchema,
  measurement: MeasurementSectionSchema,
  projections: z.object({
    totalImpressions: z.number(),
    totalReach: z.number(),
    avgFrequency: z.number(),
    expectedConversions: z.number().optional(),
  }),
  recommendations: z.array(z.string()),
  risks: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export type StructuredPlanOutput = z.infer<typeof StructuredPlanOutputSchema>;

/**
 * Schema for projection output
 */
export const ProjectionOutputSchema = z.object({
  summary: z.object({
    totalBudget: z.number(),
    totalImpressions: z.number(),
    totalReach: z.number(),
    avgFrequency: z.number(),
    overallCPM: z.number(),
  }),
  channelProjections: z.array(
    z.object({
      channelCode: z.string(),
      budget: z.number(),
      impressions: z.number(),
      reach: z.number(),
      frequency: z.number(),
      cpm: z.number(),
      ctr: z.number().optional(),
      clicks: z.number().optional(),
    })
  ),
  confidence: ConfidenceLevelEnum,
  methodology: z.string(),
});

export type ProjectionOutput = z.infer<typeof ProjectionOutputSchema>;

/**
 * Schema for validation output
 */
export const ValidationOutputSchema = z.object({
  planId: z.string(),
  gate: z.number().min(1).max(3),
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  gaps: z.array(
    z.object({
      step: z.number(),
      area: z.string(),
      issue: z.string(),
      severity: z.enum(['Critical', 'High', 'Medium', 'Low']),
    })
  ),
  recommendations: z.array(z.string()),
  readyForNextGate: z.boolean(),
});

export type ValidationOutput = z.infer<typeof ValidationOutputSchema>;
