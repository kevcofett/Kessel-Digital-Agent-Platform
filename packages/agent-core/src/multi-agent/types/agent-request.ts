/**
 * Multi-Agent Architecture - Agent Request Types
 *
 * Defines the structure of requests sent between agents.
 * All inter-agent communication uses these standardized request formats.
 */

import { AgentCode } from './agent-codes.js';
import { SessionContext } from './session-context.js';

/**
 * Options that can be passed with any agent request
 */
export interface RequestOptions {
  timeout_ms?: number;
  include_sources?: boolean;
  confidence_threshold?: ConfidenceThreshold;
  max_retries?: number;
  fallback_to_orc?: boolean;
}

export type ConfidenceThreshold = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Base interface for all agent requests
 */
export interface AgentRequest {
  request_id: string;
  timestamp: string;
  source_agent: AgentCode;
  target_agent: AgentCode;
  request_type: string;
  session_context: SessionContext;
  parameters: Record<string, unknown>;
  options?: RequestOptions;
}

// ============================================================================
// Analytics Agent (ANL) Request Types
// ============================================================================

export type ANLRequestType =
  | 'CALCULATE_PROJECTION'
  | 'RUN_SCENARIO'
  | 'VALIDATE_STATISTICS'
  | 'CALCULATE_LTV'
  | 'COMPARE_SCENARIOS'
  | 'CALCULATE_INCREMENTALITY';

export interface ANLCalculateProjectionParams {
  budget: number;
  channel_mix?: Record<string, number>;
  kpi: string;
  time_horizon_weeks?: number;
}

export interface ANLRunScenarioParams {
  base_budget: number;
  scenarios: Array<{
    name: string;
    budget_multiplier?: number;
    channel_adjustments?: Record<string, number>;
  }>;
  comparison_metrics: string[];
}

export interface ANLValidateStatisticsParams {
  sample_size: number;
  conversion_rate: number;
  baseline_rate?: number;
  confidence_level?: number;
}

export interface ANLCalculateLTVParams {
  cohort_data: Array<{
    cohort_id: string;
    acquisition_cost: number;
    revenue_months: number[];
  }>;
  projection_months?: number;
  discount_rate?: number;
}

// ============================================================================
// Audience Intelligence Agent (AUD) Request Types
// ============================================================================

export type AUDRequestType =
  | 'SEGMENT_AUDIENCE'
  | 'BUILD_PERSONA'
  | 'RECOMMEND_TARGETING'
  | 'CALCULATE_AUDIENCE_SIZE'
  | 'ANALYZE_OVERLAP'
  | 'PRIORITIZE_SEGMENTS';

export interface AUDSegmentAudienceParams {
  segmentation_method: 'RFM' | 'behavioral' | 'demographic' | 'custom';
  data_source: '1P' | '2P' | '3P' | 'CDP' | 'clean_room';
  segment_count?: number;
  constraints?: Record<string, unknown>;
}

export interface AUDBuildPersonaParams {
  segment_id: string;
  include_behaviors?: boolean;
  include_interests?: boolean;
  include_demographics?: boolean;
}

export interface AUDRecommendTargetingParams {
  campaign_objective: string;
  budget: number;
  available_data_sources: string[];
  geographic_focus?: string[];
}

export interface AUDCalculateAudienceSizeParams {
  segment_definitions: Array<{
    attribute: string;
    operator: 'equals' | 'contains' | 'in' | 'range';
    value: unknown;
  }>;
  market?: string;
}

// ============================================================================
// Channel Strategy Agent (CHA) Request Types
// ============================================================================

export type CHARequestType =
  | 'RECOMMEND_CHANNELS'
  | 'CALCULATE_ALLOCATION'
  | 'LOOKUP_BENCHMARKS'
  | 'EVALUATE_MIX'
  | 'OPTIMIZE_ALLOCATION'
  | 'GET_CHANNEL_DETAILS';

export interface CHARecommendChannelsParams {
  campaign_objective: string;
  budget: number;
  audience_profile?: Record<string, unknown>;
  industry: string;
  constraints?: {
    required_channels?: string[];
    excluded_channels?: string[];
    max_channels?: number;
  };
}

export interface CHACalculateAllocationParams {
  budget: number;
  channels: string[];
  optimization_objective: 'reach' | 'frequency' | 'conversions' | 'efficiency' | 'balanced';
  constraints?: Array<{
    channel: string;
    type: 'minimum' | 'maximum' | 'exact';
    value: number;
  }>;
}

export interface CHALookupBenchmarksParams {
  channels: string[];
  industry: string;
  metrics: string[];
  market?: string;
}

export interface CHAEvaluateMixParams {
  current_allocation: Record<string, number>;
  performance_data?: Record<string, Record<string, number>>;
  objective: string;
}

// ============================================================================
// Supply Path Optimization Agent (SPO) Request Types
// ============================================================================

export type SPORequestType =
  | 'ANALYZE_SUPPLY_PATH'
  | 'CALCULATE_NBI'
  | 'EVALUATE_PARTNERS'
  | 'OPTIMIZE_PATH'
  | 'COMPARE_PATHS';

export interface SPOAnalyzeSupplyPathParams {
  dsp: string;
  ssps: string[];
  publisher?: string;
  include_fee_breakdown?: boolean;
}

export interface SPOCalculateNBIParams {
  partner_id: string;
  historical_performance?: {
    win_rate?: number;
    viewability?: number;
    brand_safety_rate?: number;
    fraud_rate?: number;
  };
  fee_structure?: {
    platform_fee?: number;
    data_fee?: number;
    tech_fee?: number;
  };
}

export interface SPOEvaluatePartnersParams {
  partner_type: 'DSP' | 'SSP' | 'ad_network' | 'data_provider';
  evaluation_criteria: string[];
  candidates?: string[];
  budget_allocation?: number;
}

// ============================================================================
// Document Generation Agent (DOC) Request Types
// ============================================================================

export type DOCRequestType =
  | 'GENERATE_PLAN'
  | 'GENERATE_BRIEF'
  | 'GENERATE_SUMMARY'
  | 'EXPORT_DOCUMENT'
  | 'UPDATE_SECTION';

export interface DOCGeneratePlanParams {
  plan_type: 'full' | 'executive_summary' | 'tactical';
  include_sections?: string[];
  format?: 'docx' | 'pdf' | 'markdown';
  branding?: {
    logo_url?: string;
    primary_color?: string;
    font_family?: string;
  };
}

export interface DOCGenerateBriefParams {
  brief_type: 'creative' | 'media' | 'strategic';
  audience?: string;
  key_messages?: string[];
  deliverables?: string[];
}

export interface DOCGenerateSummaryParams {
  summary_type: 'plan' | 'performance' | 'learnings';
  time_period?: { start: string; end: string };
  metrics_to_include?: string[];
}

export interface DOCExportDocumentParams {
  document_id: string;
  format: 'docx' | 'pdf' | 'pptx';
  include_appendix?: boolean;
}

// ============================================================================
// Performance Intelligence Agent (PRF) Request Types
// ============================================================================

export type PRFRequestType =
  | 'ANALYZE_PERFORMANCE'
  | 'DETECT_ANOMALIES'
  | 'EXTRACT_LEARNINGS'
  | 'RECOMMEND_OPTIMIZATION'
  | 'FORECAST_PERFORMANCE';

export interface PRFAnalyzePerformanceParams {
  metrics: string[];
  time_period: { start: string; end: string };
  granularity: 'daily' | 'weekly' | 'monthly';
  dimensions?: string[];
}

export interface PRFDetectAnomaliesParams {
  metric: string;
  data_points: Array<{ date: string; value: number }>;
  sensitivity?: 'high' | 'medium' | 'low';
  method?: 'statistical' | 'ml' | 'threshold';
}

export interface PRFExtractLearningsParams {
  campaign_id: string;
  include_channel_insights?: boolean;
  include_audience_insights?: boolean;
  include_creative_insights?: boolean;
}

export interface PRFRecommendOptimizationParams {
  current_performance: Record<string, number>;
  targets: Record<string, number>;
  available_levers: string[];
  constraints?: Record<string, unknown>;
}

// ============================================================================
// Type Guards and Utilities
// ============================================================================

export function isANLRequest(request: AgentRequest): boolean {
  return request.target_agent === 'ANL';
}

export function isAUDRequest(request: AgentRequest): boolean {
  return request.target_agent === 'AUD';
}

export function isCHARequest(request: AgentRequest): boolean {
  return request.target_agent === 'CHA';
}

export function isSPORequest(request: AgentRequest): boolean {
  return request.target_agent === 'SPO';
}

export function isDOCRequest(request: AgentRequest): boolean {
  return request.target_agent === 'DOC';
}

export function isPRFRequest(request: AgentRequest): boolean {
  return request.target_agent === 'PRF';
}
