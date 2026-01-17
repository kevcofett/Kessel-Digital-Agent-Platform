/**
 * Multi-Agent Architecture - Request Validation Schemas
 *
 * Zod schemas for validating agent requests at runtime.
 * These schemas ensure type safety and data integrity for inter-agent communication.
 */

import { z } from 'zod';

// ============================================================================
// Base Schemas
// ============================================================================

export const AgentCodeSchema = z.enum(['ORC', 'ANL', 'AUD', 'CHA', 'SPO', 'DOC', 'PRF']);

export const ConfidenceThresholdSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);

export const SessionTypeSchema = z.enum(['Planning', 'InFlight', 'PostMortem', 'Audit']);

export const RequestOptionsSchema = z.object({
  timeout_ms: z.number().min(1000).max(300000).optional(),
  include_sources: z.boolean().optional(),
  confidence_threshold: ConfidenceThresholdSchema.optional(),
  max_retries: z.number().min(0).max(5).optional(),
  fallback_to_orc: z.boolean().optional(),
}).strict();

// ============================================================================
// Plan State Schemas
// ============================================================================

export const ClientContextSchema = z.object({
  client_name: z.string().optional(),
  industry: z.string(),
  vertical: z.string(),
  market_position: z.enum(['leader', 'challenger', 'niche', 'emerging']).optional(),
  compliance_needs: z.array(z.string()).optional(),
  geographic_focus: z.array(z.string()).optional(),
}).strict();

export const ObjectivesSchema = z.object({
  primary_kpi: z.string(),
  target_value: z.number().optional(),
  target_unit: z.string().optional(),
  secondary_kpis: z.array(z.string()).optional(),
  campaign_type: z.enum(['awareness', 'consideration', 'conversion', 'retention']).optional(),
  timeline: z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    duration_weeks: z.number().optional(),
  }).optional(),
}).strict();

export const BudgetInfoSchema = z.object({
  total_budget: z.number().min(0),
  currency: z.string().length(3),
  pacing: z.enum(['even', 'front_loaded', 'back_loaded', 'custom']).optional(),
  custom_pacing_weights: z.array(z.number()).optional(),
  working_media_percentage: z.number().min(0).max(100).optional(),
  reserved_amounts: z.record(z.number()).optional(),
}).strict();

export const AudienceSegmentSchema = z.object({
  name: z.string(),
  definition: z.string().optional(),
  size_estimate: z.number().optional(),
  priority: z.enum(['primary', 'secondary', 'tertiary']),
  data_source: z.enum(['1P', '2P', '3P', 'CDP', 'clean_room']).optional(),
}).strict();

export const LTVTierSchema = z.object({
  tier_name: z.string(),
  ltv_range: z.object({
    min: z.number(),
    max: z.number(),
  }),
  segment_size: z.number().optional(),
  recommended_investment: z.number().optional(),
}).strict();

export const AudienceStrategySchema = z.object({
  primary_segments: z.array(AudienceSegmentSchema).optional(),
  secondary_segments: z.array(AudienceSegmentSchema).optional(),
  exclusions: z.array(z.string()).optional(),
  ltv_tiers: z.array(LTVTierSchema).optional(),
  total_addressable_reach: z.number().optional(),
}).strict();

export const ChannelAllocationSchema = z.object({
  channel_id: z.string(),
  channel_name: z.string(),
  allocation_percentage: z.number().min(0).max(100),
  allocation_amount: z.number().min(0),
  rationale: z.string().optional(),
  expected_metrics: z.record(z.number()).optional(),
}).strict();

export const ChannelConstraintSchema = z.object({
  channel_id: z.string(),
  constraint_type: z.enum(['minimum', 'maximum', 'exact']),
  value: z.number(),
  unit: z.enum(['percentage', 'currency']),
}).strict();

export const ChannelAllocationsSchema = z.object({
  allocations: z.array(ChannelAllocationSchema),
  optimization_objective: z.string().optional(),
  constraints: z.array(ChannelConstraintSchema).optional(),
}).strict();

export const PartnerSelectionSchema = z.object({
  partner_id: z.string(),
  partner_name: z.string(),
  partner_type: z.enum(['DSP', 'SSP', 'ad_network', 'publisher', 'data_provider']),
  allocation_amount: z.number().optional(),
  nbi_score: z.number().optional(),
  rationale: z.string().optional(),
}).strict();

export const SupplyPathAnalysisSchema = z.object({
  total_tech_fees_percentage: z.number().min(0).max(100),
  working_media_percentage: z.number().min(0).max(100),
  recommended_optimizations: z.array(z.string()).optional(),
}).strict();

export const PartnerSelectionsSchema = z.object({
  selected_partners: z.array(PartnerSelectionSchema),
  supply_path_analysis: SupplyPathAnalysisSchema.optional(),
}).strict();

export const MetricDefinitionSchema = z.object({
  metric_name: z.string(),
  target_value: z.number().optional(),
  baseline_value: z.number().optional(),
  measurement_source: z.string().optional(),
}).strict();

export const MeasurementFrameworkSchema = z.object({
  primary_metrics: z.array(MetricDefinitionSchema),
  secondary_metrics: z.array(MetricDefinitionSchema).optional(),
  attribution_model: z.enum(['last_click', 'first_click', 'linear', 'time_decay', 'custom']).optional(),
  incrementality_test_planned: z.boolean().optional(),
  brand_lift_study_planned: z.boolean().optional(),
}).strict();

export const OptimizationRuleSchema = z.object({
  rule_id: z.string(),
  trigger_condition: z.string(),
  action: z.string(),
  threshold: z.number().optional(),
  priority: z.enum(['high', 'medium', 'low']),
}).strict();

export const OptimizationRulesSchema = z.object({
  rules: z.array(OptimizationRuleSchema),
  optimization_frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  automated_actions_enabled: z.boolean().optional(),
}).strict();

export const ComplianceRequirementsSchema = z.object({
  regulatory_frameworks: z.array(z.string()).optional(),
  privacy_requirements: z.array(z.string()).optional(),
  brand_safety_requirements: z.array(z.string()).optional(),
  verification_vendors: z.array(z.string()).optional(),
}).strict();

export const DocumentStatusSchema = z.object({
  plan_generated: z.boolean().optional(),
  plan_version: z.number().optional(),
  brief_generated: z.boolean().optional(),
  deck_generated: z.boolean().optional(),
  last_export_date: z.string().optional(),
  export_formats: z.array(z.enum(['pdf', 'docx', 'pptx'])).optional(),
}).strict();

export const PlanStateSchema = z.object({
  client_context: ClientContextSchema.optional(),
  objectives: ObjectivesSchema.optional(),
  budget: BudgetInfoSchema.optional(),
  audience: AudienceStrategySchema.optional(),
  channels: ChannelAllocationsSchema.optional(),
  partners: PartnerSelectionsSchema.optional(),
  measurement: MeasurementFrameworkSchema.optional(),
  optimization: OptimizationRulesSchema.optional(),
  compliance: ComplianceRequirementsSchema.optional(),
  document: DocumentStatusSchema.optional(),
}).strict();

// ============================================================================
// Session Context Schema
// ============================================================================

export const SessionContextSchema = z.object({
  session_id: z.string().uuid(),
  workflow_step: z.number().min(1).max(10),
  workflow_gate: z.number().min(0).max(4),
  session_type: SessionTypeSchema,
  plan_state: PlanStateSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  conversation_history_summary: z.string().optional(),
}).strict();

// ============================================================================
// Base Agent Request Schema
// ============================================================================

export const AgentRequestSchema = z.object({
  request_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  source_agent: AgentCodeSchema,
  target_agent: AgentCodeSchema,
  request_type: z.string().min(1),
  session_context: SessionContextSchema,
  parameters: z.record(z.unknown()),
  options: RequestOptionsSchema.optional(),
}).strict();

// ============================================================================
// Agent-Specific Request Schemas
// ============================================================================

// Analytics Agent (ANL) Request Types
export const ANLRequestTypeSchema = z.enum([
  'CALCULATE_PROJECTION',
  'RUN_SCENARIO',
  'VALIDATE_STATISTICS',
  'CALCULATE_LTV',
  'COMPARE_SCENARIOS',
  'CALCULATE_INCREMENTALITY',
]);

export const ANLCalculateProjectionParamsSchema = z.object({
  budget: z.number().min(0),
  channel_mix: z.record(z.number()).optional(),
  kpi: z.string(),
  time_horizon_weeks: z.number().min(1).max(52).optional(),
}).strict();

export const ANLRunScenarioParamsSchema = z.object({
  base_budget: z.number().min(0),
  scenarios: z.array(z.object({
    name: z.string(),
    budget_multiplier: z.number().optional(),
    channel_adjustments: z.record(z.number()).optional(),
  })),
  comparison_metrics: z.array(z.string()),
}).strict();

export const ANLValidateStatisticsParamsSchema = z.object({
  sample_size: z.number().min(1),
  conversion_rate: z.number().min(0).max(1),
  baseline_rate: z.number().min(0).max(1).optional(),
  confidence_level: z.number().min(0.8).max(0.99).optional(),
}).strict();

// Audience Intelligence Agent (AUD) Request Types
export const AUDRequestTypeSchema = z.enum([
  'SEGMENT_AUDIENCE',
  'BUILD_PERSONA',
  'RECOMMEND_TARGETING',
  'CALCULATE_AUDIENCE_SIZE',
  'ANALYZE_OVERLAP',
  'PRIORITIZE_SEGMENTS',
]);

export const AUDSegmentAudienceParamsSchema = z.object({
  segmentation_method: z.enum(['RFM', 'behavioral', 'demographic', 'custom']),
  data_source: z.enum(['1P', '2P', '3P', 'CDP', 'clean_room']),
  segment_count: z.number().min(2).max(10).optional(),
  constraints: z.record(z.unknown()).optional(),
}).strict();

// Channel Strategy Agent (CHA) Request Types
export const CHARequestTypeSchema = z.enum([
  'RECOMMEND_CHANNELS',
  'CALCULATE_ALLOCATION',
  'LOOKUP_BENCHMARKS',
  'EVALUATE_MIX',
  'OPTIMIZE_ALLOCATION',
  'GET_CHANNEL_DETAILS',
]);

export const CHARecommendChannelsParamsSchema = z.object({
  campaign_objective: z.string(),
  budget: z.number().min(0),
  audience_profile: z.record(z.unknown()).optional(),
  industry: z.string(),
  constraints: z.object({
    required_channels: z.array(z.string()).optional(),
    excluded_channels: z.array(z.string()).optional(),
    max_channels: z.number().optional(),
  }).optional(),
}).strict();

export const CHACalculateAllocationParamsSchema = z.object({
  budget: z.number().min(0),
  channels: z.array(z.string()),
  optimization_objective: z.enum(['reach', 'frequency', 'conversions', 'efficiency', 'balanced']),
  constraints: z.array(z.object({
    channel: z.string(),
    type: z.enum(['minimum', 'maximum', 'exact']),
    value: z.number(),
  })).optional(),
}).strict();

// Supply Path Optimization Agent (SPO) Request Types
export const SPORequestTypeSchema = z.enum([
  'ANALYZE_SUPPLY_PATH',
  'CALCULATE_NBI',
  'EVALUATE_PARTNERS',
  'OPTIMIZE_PATH',
  'COMPARE_PATHS',
]);

export const SPOAnalyzeSupplyPathParamsSchema = z.object({
  dsp: z.string(),
  ssps: z.array(z.string()),
  publisher: z.string().optional(),
  include_fee_breakdown: z.boolean().optional(),
}).strict();

// Document Generation Agent (DOC) Request Types
export const DOCRequestTypeSchema = z.enum([
  'GENERATE_PLAN',
  'GENERATE_BRIEF',
  'GENERATE_SUMMARY',
  'EXPORT_DOCUMENT',
  'UPDATE_SECTION',
]);

export const DOCGeneratePlanParamsSchema = z.object({
  plan_type: z.enum(['full', 'executive_summary', 'tactical']),
  include_sections: z.array(z.string()).optional(),
  format: z.enum(['docx', 'pdf', 'markdown']).optional(),
  branding: z.object({
    logo_url: z.string().url().optional(),
    primary_color: z.string().optional(),
    font_family: z.string().optional(),
  }).optional(),
}).strict();

// Performance Intelligence Agent (PRF) Request Types
export const PRFRequestTypeSchema = z.enum([
  'ANALYZE_PERFORMANCE',
  'DETECT_ANOMALIES',
  'EXTRACT_LEARNINGS',
  'RECOMMEND_OPTIMIZATION',
  'FORECAST_PERFORMANCE',
]);

export const PRFAnalyzePerformanceParamsSchema = z.object({
  metrics: z.array(z.string()),
  time_period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  granularity: z.enum(['daily', 'weekly', 'monthly']),
  dimensions: z.array(z.string()).optional(),
}).strict();

export const PRFDetectAnomaliesParamsSchema = z.object({
  metric: z.string(),
  data_points: z.array(z.object({
    date: z.string(),
    value: z.number(),
  })),
  sensitivity: z.enum(['high', 'medium', 'low']).optional(),
  method: z.enum(['statistical', 'ml', 'threshold']).optional(),
}).strict();

// ============================================================================
// Validation Functions
// ============================================================================

export function validateAgentRequest(request: unknown) {
  return AgentRequestSchema.safeParse(request);
}

export function validateSessionContext(context: unknown) {
  return SessionContextSchema.safeParse(context);
}

export function validatePlanState(state: unknown) {
  return PlanStateSchema.safeParse(state);
}
