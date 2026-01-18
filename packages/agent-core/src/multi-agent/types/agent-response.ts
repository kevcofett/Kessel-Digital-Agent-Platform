/**
 * Multi-Agent Architecture - Agent Response Types
 *
 * Defines the structure of responses returned by agents.
 * All agents return standardized response formats for consistent processing.
 */

import { AgentCode } from './agent-codes.js';
import { PlanState } from './session-context.js';

/**
 * Confidence levels for agent responses
 */
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Data sources that can back agent responses
 */
export type DataSource =
  | 'USER_PROVIDED'      // Data explicitly provided by user
  | 'AGENT_KB'           // Retrieved from agent's knowledge base
  | 'DATAVERSE'          // Retrieved from EAP Dataverse tables
  | 'CALCULATION'        // Computed by agent logic
  | 'WEB_RESEARCH'       // Retrieved from web search
  | 'HISTORICAL_DATA'    // From historical campaign data
  | 'BENCHMARK_DATA'     // From industry benchmark sources
  | 'THIRD_PARTY_API';   // From external API integrations

/**
 * Metadata attached to every agent response
 */
export interface AgentResponseMetadata {
  processing_time_ms: number;
  data_sources: DataSource[];
  assumptions?: string[];
  limitations?: string[];
  model_version?: string;
  kb_documents_used?: string[];
}

/**
 * Successful agent response
 */
export interface AgentResponse {
  request_id: string;
  timestamp: string;
  source_agent: AgentCode;
  status: 'success' | 'partial' | 'error';
  data: Record<string, unknown>;
  confidence: ConfidenceLevel;
  sources: DataSource[];
  recommendations?: string[];
  warnings?: string[];
  updated_plan_state?: Partial<PlanState>;
  metadata: AgentResponseMetadata;
  follow_up_questions?: string[];
}

/**
 * Error response from an agent
 */
export interface AgentErrorResponse {
  request_id: string;
  timestamp: string;
  source_agent: AgentCode;
  error: true;
  code: AgentErrorCode;
  message: string;
  details?: Record<string, unknown>;
  recovery_options?: string[];
  fallback_available?: boolean;
  fallback_response?: Partial<AgentResponse>;
}

/**
 * Standard error codes for agent failures
 */
export type AgentErrorCode =
  | 'INVALID_REQUEST'          // Request validation failed
  | 'MISSING_PARAMETERS'       // Required parameters not provided
  | 'INSUFFICIENT_CONTEXT'     // Session context missing required data
  | 'CALCULATION_ERROR'        // Error during calculation/processing
  | 'KB_RETRIEVAL_ERROR'       // Failed to retrieve from knowledge base
  | 'DATAVERSE_ERROR'          // Failed to access Dataverse
  | 'TIMEOUT'                  // Request exceeded timeout
  | 'AGENT_UNAVAILABLE'        // Target agent not available
  | 'CONFIDENCE_TOO_LOW'       // Response confidence below threshold
  | 'INTERNAL_ERROR';          // Unexpected internal error

// ============================================================================
// Analytics Agent (ANL) Response Types
// ============================================================================

export interface ANLProjectionResponse extends AgentResponse {
  data: {
    projected_impressions?: number;
    projected_reach?: number;
    projected_frequency?: number;
    projected_conversions?: number;
    projected_cpm?: number;
    projected_cpa?: number;
    projected_roas?: number;
    confidence_interval?: { lower: number; upper: number };
    projection_methodology?: string;
  };
}

export interface ANLScenarioResponse extends AgentResponse {
  data: {
    scenarios: Array<{
      name: string;
      metrics: Record<string, number>;
      relative_performance: Record<string, number>;
      recommendation_rank: number;
    }>;
    recommended_scenario?: string;
    comparison_summary?: string;
  };
}

export interface ANLStatisticsResponse extends AgentResponse {
  data: {
    is_significant: boolean;
    p_value?: number;
    confidence_level: number;
    effect_size?: number;
    minimum_sample_size?: number;
    power?: number;
  };
}

// ============================================================================
// Audience Intelligence Agent (AUD) Response Types
// ============================================================================

export interface AUDSegmentationResponse extends AgentResponse {
  data: {
    segments: Array<{
      segment_id: string;
      segment_name: string;
      size: number;
      characteristics: Record<string, unknown>;
      recommended_priority: 'primary' | 'secondary' | 'tertiary';
    }>;
    total_addressable_audience?: number;
    segmentation_quality_score?: number;
  };
}

export interface AUDPersonaResponse extends AgentResponse {
  data: {
    persona_name: string;
    demographics?: Record<string, unknown>;
    behaviors?: string[];
    interests?: string[];
    media_preferences?: string[];
    pain_points?: string[];
    messaging_recommendations?: string[];
  };
}

export interface AUDTargetingResponse extends AgentResponse {
  data: {
    recommended_segments: Array<{
      segment: string;
      reach_potential: number;
      recommended_investment: number;
      expected_performance: Record<string, number>;
    }>;
    targeting_strategy_summary?: string;
    data_activation_requirements?: string[];
  };
}

// ============================================================================
// Channel Strategy Agent (CHA) Response Types
// ============================================================================

export interface CHARecommendationResponse extends AgentResponse {
  data: {
    recommended_channels: Array<{
      channel_id: string;
      channel_name: string;
      recommended_allocation_percent: number;
      recommended_allocation_amount: number;
      rationale: string;
      expected_performance: Record<string, number>;
    }>;
    total_reach_estimate?: number;
    optimization_notes?: string[];
  };
}

export interface CHAAllocationResponse extends AgentResponse {
  data: {
    allocations: Array<{
      channel_id: string;
      allocation_percent: number;
      allocation_amount: number;
    }>;
    optimization_score?: number;
    constraint_adjustments?: string[];
  };
}

export interface CHABenchmarkResponse extends AgentResponse {
  data: {
    benchmarks: Array<{
      channel: string;
      metrics: Record<string, {
        value: number;
        percentile?: number;
        source?: string;
      }>;
    }>;
    industry_context?: string;
    benchmark_date?: string;
  };
}

// ============================================================================
// Supply Path Optimization Agent (SPO) Response Types
// ============================================================================

export interface SPOAnalysisResponse extends AgentResponse {
  data: {
    supply_path: {
      dsp: string;
      ssps: string[];
      publisher?: string;
    };
    fee_breakdown: {
      dsp_fee_percent: number;
      ssp_fee_percent: number;
      ad_serving_fee_percent: number;
      data_fee_percent: number;
      verification_fee_percent: number;
      total_tech_tax_percent: number;
      working_media_percent: number;
    };
    optimization_opportunities?: string[];
  };
}

export interface SPONBIResponse extends AgentResponse {
  data: {
    partner_id: string;
    nbi_score: number;
    score_components: {
      performance_score: number;
      cost_efficiency_score: number;
      quality_score: number;
      reliability_score: number;
    };
    ranking?: number;
    recommendation?: string;
  };
}

// ============================================================================
// Document Generation Agent (DOC) Response Types
// ============================================================================

export interface DOCGenerationResponse extends AgentResponse {
  data: {
    document_id: string;
    document_type: string;
    content_preview?: string;
    download_url?: string;
    page_count?: number;
    sections_generated?: string[];
  };
}

// ============================================================================
// Performance Intelligence Agent (PRF) Response Types
// ============================================================================

export interface PRFAnalysisResponse extends AgentResponse {
  data: {
    metrics_analyzed: Array<{
      metric: string;
      current_value: number;
      target_value?: number;
      variance_percent?: number;
      trend: 'improving' | 'stable' | 'declining';
    }>;
    summary?: string;
    key_insights?: string[];
  };
}

export interface PRFAnomalyResponse extends AgentResponse {
  data: {
    anomalies_detected: Array<{
      date: string;
      metric: string;
      expected_value: number;
      actual_value: number;
      deviation_percent: number;
      severity: 'high' | 'medium' | 'low';
      possible_causes?: string[];
    }>;
    total_anomalies: number;
    recommended_actions?: string[];
  };
}

export interface PRFLearningsResponse extends AgentResponse {
  data: {
    learnings: Array<{
      category: 'channel' | 'audience' | 'creative' | 'timing' | 'budget';
      insight: string;
      evidence: string;
      actionability: 'high' | 'medium' | 'low';
      applicable_to_future_campaigns: boolean;
    }>;
    summary?: string;
  };
}

// ============================================================================
// Orchestrator (ORC) Routing Types
// ============================================================================

export interface ORCRoutingDecision {
  target_agent: AgentCode;
  request_type: string;
  confidence: ConfidenceLevel;
  routing_rationale?: string;
  requires_multi_agent?: boolean;
  agent_sequence?: AgentCode[];
}

export interface ORCSynthesizedResponse extends AgentResponse {
  data: {
    user_facing_response: string;
    specialist_responses?: Array<{
      agent: AgentCode;
      response_summary: string;
    }>;
    next_step_suggestion?: string;
    clarifying_questions?: string[];
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isAgentResponse(response: unknown): response is AgentResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'request_id' in response &&
    'status' in response &&
    'source_agent' in response
  );
}

export function isAgentError(response: unknown): response is AgentErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    (response as AgentErrorResponse).error === true
  );
}

export function isSuccessResponse(response: AgentResponse | AgentErrorResponse): response is AgentResponse {
  return !('error' in response) || response.error !== true;
}
