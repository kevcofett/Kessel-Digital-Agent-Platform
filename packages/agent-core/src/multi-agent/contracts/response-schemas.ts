/**
 * Multi-Agent Architecture - Response Validation Schemas
 *
 * Zod schemas for validating agent responses at runtime.
 * Ensures consistent response structure across all agents.
 */

import { z } from 'zod';
import { AgentCodeSchema, PlanStateSchema } from './request-schemas.js';

// ============================================================================
// Base Response Schemas
// ============================================================================

export const ConfidenceLevelSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);

export const DataSourceSchema = z.enum([
  'USER_PROVIDED',
  'AGENT_KB',
  'DATAVERSE',
  'CALCULATION',
  'WEB_RESEARCH',
  'HISTORICAL_DATA',
  'BENCHMARK_DATA',
  'THIRD_PARTY_API',
]);

export const AgentErrorCodeSchema = z.enum([
  'INVALID_REQUEST',
  'MISSING_PARAMETERS',
  'INSUFFICIENT_CONTEXT',
  'CALCULATION_ERROR',
  'KB_RETRIEVAL_ERROR',
  'DATAVERSE_ERROR',
  'TIMEOUT',
  'AGENT_UNAVAILABLE',
  'CONFIDENCE_TOO_LOW',
  'INTERNAL_ERROR',
]);

export const AgentResponseMetadataSchema = z.object({
  processing_time_ms: z.number().min(0),
  data_sources: z.array(DataSourceSchema),
  assumptions: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  model_version: z.string().optional(),
  kb_documents_used: z.array(z.string()).optional(),
}).strict();

export const AgentResponseSchema = z.object({
  request_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  source_agent: AgentCodeSchema,
  status: z.enum(['success', 'partial', 'error']),
  data: z.record(z.unknown()),
  confidence: ConfidenceLevelSchema,
  sources: z.array(DataSourceSchema),
  recommendations: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  updated_plan_state: PlanStateSchema.partial().optional(),
  metadata: AgentResponseMetadataSchema,
  follow_up_questions: z.array(z.string()).optional(),
}).strict();

export const AgentErrorResponseSchema = z.object({
  request_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  source_agent: AgentCodeSchema,
  error: z.literal(true),
  code: AgentErrorCodeSchema,
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  recovery_options: z.array(z.string()).optional(),
  fallback_available: z.boolean().optional(),
  fallback_response: AgentResponseSchema.partial().optional(),
}).strict();

// ============================================================================
// Analytics Agent (ANL) Response Schemas
// ============================================================================

export const ANLProjectionDataSchema = z.object({
  projected_impressions: z.number().optional(),
  projected_reach: z.number().optional(),
  projected_frequency: z.number().optional(),
  projected_conversions: z.number().optional(),
  projected_cpm: z.number().optional(),
  projected_cpa: z.number().optional(),
  projected_roas: z.number().optional(),
  confidence_interval: z.object({
    lower: z.number(),
    upper: z.number(),
  }).optional(),
  projection_methodology: z.string().optional(),
}).strict();

export const ANLScenarioDataSchema = z.object({
  scenarios: z.array(z.object({
    name: z.string(),
    metrics: z.record(z.number()),
    relative_performance: z.record(z.number()),
    recommendation_rank: z.number(),
  })),
  recommended_scenario: z.string().optional(),
  comparison_summary: z.string().optional(),
}).strict();

export const ANLStatisticsDataSchema = z.object({
  is_significant: z.boolean(),
  p_value: z.number().optional(),
  confidence_level: z.number(),
  effect_size: z.number().optional(),
  minimum_sample_size: z.number().optional(),
  power: z.number().optional(),
}).strict();

// ============================================================================
// Audience Intelligence Agent (AUD) Response Schemas
// ============================================================================

export const AUDSegmentationDataSchema = z.object({
  segments: z.array(z.object({
    segment_id: z.string(),
    segment_name: z.string(),
    size: z.number(),
    characteristics: z.record(z.unknown()),
    recommended_priority: z.enum(['primary', 'secondary', 'tertiary']),
  })),
  total_addressable_audience: z.number().optional(),
  segmentation_quality_score: z.number().optional(),
}).strict();

export const AUDPersonaDataSchema = z.object({
  persona_name: z.string(),
  demographics: z.record(z.unknown()).optional(),
  behaviors: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  media_preferences: z.array(z.string()).optional(),
  pain_points: z.array(z.string()).optional(),
  messaging_recommendations: z.array(z.string()).optional(),
}).strict();

export const AUDTargetingDataSchema = z.object({
  recommended_segments: z.array(z.object({
    segment: z.string(),
    reach_potential: z.number(),
    recommended_investment: z.number(),
    expected_performance: z.record(z.number()),
  })),
  targeting_strategy_summary: z.string().optional(),
  data_activation_requirements: z.array(z.string()).optional(),
}).strict();

// ============================================================================
// Channel Strategy Agent (CHA) Response Schemas
// ============================================================================

export const CHARecommendationDataSchema = z.object({
  recommended_channels: z.array(z.object({
    channel_id: z.string(),
    channel_name: z.string(),
    recommended_allocation_percent: z.number(),
    recommended_allocation_amount: z.number(),
    rationale: z.string(),
    expected_performance: z.record(z.number()),
  })),
  total_reach_estimate: z.number().optional(),
  optimization_notes: z.array(z.string()).optional(),
}).strict();

export const CHAAllocationDataSchema = z.object({
  allocations: z.array(z.object({
    channel_id: z.string(),
    allocation_percent: z.number(),
    allocation_amount: z.number(),
  })),
  optimization_score: z.number().optional(),
  constraint_adjustments: z.array(z.string()).optional(),
}).strict();

export const CHABenchmarkDataSchema = z.object({
  benchmarks: z.array(z.object({
    channel: z.string(),
    metrics: z.record(z.object({
      value: z.number(),
      percentile: z.number().optional(),
      source: z.string().optional(),
    })),
  })),
  industry_context: z.string().optional(),
  benchmark_date: z.string().optional(),
}).strict();

// ============================================================================
// Supply Path Optimization Agent (SPO) Response Schemas
// ============================================================================

export const SPOAnalysisDataSchema = z.object({
  supply_path: z.object({
    dsp: z.string(),
    ssps: z.array(z.string()),
    publisher: z.string().optional(),
  }),
  fee_breakdown: z.object({
    dsp_fee_percent: z.number(),
    ssp_fee_percent: z.number(),
    ad_serving_fee_percent: z.number(),
    data_fee_percent: z.number(),
    verification_fee_percent: z.number(),
    total_tech_tax_percent: z.number(),
    working_media_percent: z.number(),
  }),
  optimization_opportunities: z.array(z.string()).optional(),
}).strict();

export const SPONBIDataSchema = z.object({
  partner_id: z.string(),
  nbi_score: z.number(),
  score_components: z.object({
    performance_score: z.number(),
    cost_efficiency_score: z.number(),
    quality_score: z.number(),
    reliability_score: z.number(),
  }),
  ranking: z.number().optional(),
  recommendation: z.string().optional(),
}).strict();

// ============================================================================
// Document Generation Agent (DOC) Response Schemas
// ============================================================================

export const DOCGenerationDataSchema = z.object({
  document_id: z.string(),
  document_type: z.string(),
  content_preview: z.string().optional(),
  download_url: z.string().url().optional(),
  page_count: z.number().optional(),
  sections_generated: z.array(z.string()).optional(),
}).strict();

// ============================================================================
// Performance Intelligence Agent (PRF) Response Schemas
// ============================================================================

export const PRFAnalysisDataSchema = z.object({
  metrics_analyzed: z.array(z.object({
    metric: z.string(),
    current_value: z.number(),
    target_value: z.number().optional(),
    variance_percent: z.number().optional(),
    trend: z.enum(['improving', 'stable', 'declining']),
  })),
  summary: z.string().optional(),
  key_insights: z.array(z.string()).optional(),
}).strict();

export const PRFAnomalyDataSchema = z.object({
  anomalies_detected: z.array(z.object({
    date: z.string(),
    metric: z.string(),
    expected_value: z.number(),
    actual_value: z.number(),
    deviation_percent: z.number(),
    severity: z.enum(['high', 'medium', 'low']),
    possible_causes: z.array(z.string()).optional(),
  })),
  total_anomalies: z.number(),
  recommended_actions: z.array(z.string()).optional(),
}).strict();

export const PRFLearningsDataSchema = z.object({
  learnings: z.array(z.object({
    category: z.enum(['channel', 'audience', 'creative', 'timing', 'budget']),
    insight: z.string(),
    evidence: z.string(),
    actionability: z.enum(['high', 'medium', 'low']),
    applicable_to_future_campaigns: z.boolean(),
  })),
  summary: z.string().optional(),
}).strict();

// ============================================================================
// Orchestrator (ORC) Response Schemas
// ============================================================================

export const ORCRoutingDecisionSchema = z.object({
  target_agent: AgentCodeSchema,
  request_type: z.string(),
  confidence: ConfidenceLevelSchema,
  routing_rationale: z.string().optional(),
  requires_multi_agent: z.boolean().optional(),
  agent_sequence: z.array(AgentCodeSchema).optional(),
}).strict();

export const ORCSynthesizedDataSchema = z.object({
  user_facing_response: z.string(),
  specialist_responses: z.array(z.object({
    agent: AgentCodeSchema,
    response_summary: z.string(),
  })).optional(),
  next_step_suggestion: z.string().optional(),
  clarifying_questions: z.array(z.string()).optional(),
}).strict();

// ============================================================================
// Validation Functions
// ============================================================================

export function validateAgentResponse(response: unknown) {
  return AgentResponseSchema.safeParse(response);
}

export function validateAgentErrorResponse(response: unknown) {
  return AgentErrorResponseSchema.safeParse(response);
}

export function validateAnyResponse(response: unknown) {
  const successResult = AgentResponseSchema.safeParse(response);
  if (successResult.success) {
    return { success: true, data: successResult.data, isError: false };
  }

  const errorResult = AgentErrorResponseSchema.safeParse(response);
  if (errorResult.success) {
    return { success: true, data: errorResult.data, isError: true };
  }

  return {
    success: false,
    error: 'Response does not match AgentResponse or AgentErrorResponse schema',
    issues: [...(successResult.error?.issues || []), ...(errorResult.error?.issues || [])],
  };
}
