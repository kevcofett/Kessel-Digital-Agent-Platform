/**
 * Multi-Agent Architecture - Session Context Types
 *
 * Defines the session state structure that flows between agents.
 * Preserves context across routing decisions and specialist consultations.
 */

export type SessionType = 'Planning' | 'InFlight' | 'PostMortem' | 'Audit';

/**
 * Client context established at session start
 */
export interface ClientContext {
  client_name?: string;
  industry: string;
  vertical: string;
  market_position?: 'leader' | 'challenger' | 'niche' | 'emerging';
  compliance_needs?: string[];
  geographic_focus?: string[];
}

/**
 * Campaign objectives captured in Step 1-3
 */
export interface Objectives {
  primary_kpi: string;
  target_value?: number;
  target_unit?: string;
  secondary_kpis?: string[];
  campaign_type?: 'awareness' | 'consideration' | 'conversion' | 'retention';
  timeline?: {
    start_date?: string;
    end_date?: string;
    duration_weeks?: number;
  };
}

/**
 * Budget information captured in Step 2-3
 */
export interface BudgetInfo {
  total_budget: number;
  currency: string;
  pacing?: 'even' | 'front_loaded' | 'back_loaded' | 'custom';
  custom_pacing_weights?: number[];
  working_media_percentage?: number;
  reserved_amounts?: Record<string, number>;
}

/**
 * Audience strategy developed in Step 4
 */
export interface AudienceStrategy {
  primary_segments?: AudienceSegment[];
  secondary_segments?: AudienceSegment[];
  exclusions?: string[];
  ltv_tiers?: LTVTier[];
  total_addressable_reach?: number;
}

export interface AudienceSegment {
  name: string;
  definition?: string;
  size_estimate?: number;
  priority: 'primary' | 'secondary' | 'tertiary';
  data_source?: '1P' | '2P' | '3P' | 'CDP' | 'clean_room';
}

export interface LTVTier {
  tier_name: string;
  ltv_range: { min: number; max: number };
  segment_size?: number;
  recommended_investment?: number;
}

/**
 * Channel allocations determined in Step 5
 */
export interface ChannelAllocations {
  allocations: ChannelAllocation[];
  optimization_objective?: string;
  constraints?: ChannelConstraint[];
}

export interface ChannelAllocation {
  channel_id: string;
  channel_name: string;
  allocation_percentage: number;
  allocation_amount: number;
  rationale?: string;
  expected_metrics?: Record<string, number>;
}

export interface ChannelConstraint {
  channel_id: string;
  constraint_type: 'minimum' | 'maximum' | 'exact';
  value: number;
  unit: 'percentage' | 'currency';
}

/**
 * Partner selections made in Step 6
 */
export interface PartnerSelections {
  selected_partners: PartnerSelection[];
  supply_path_analysis?: SupplyPathAnalysis;
}

export interface PartnerSelection {
  partner_id: string;
  partner_name: string;
  partner_type: 'DSP' | 'SSP' | 'ad_network' | 'publisher' | 'data_provider';
  allocation_amount?: number;
  nbi_score?: number;
  rationale?: string;
}

export interface SupplyPathAnalysis {
  total_tech_fees_percentage: number;
  working_media_percentage: number;
  recommended_optimizations?: string[];
}

/**
 * Measurement framework defined in Step 7
 */
export interface MeasurementFramework {
  primary_metrics: MetricDefinition[];
  secondary_metrics?: MetricDefinition[];
  attribution_model?: 'last_click' | 'first_click' | 'linear' | 'time_decay' | 'custom';
  incrementality_test_planned?: boolean;
  brand_lift_study_planned?: boolean;
}

export interface MetricDefinition {
  metric_name: string;
  target_value?: number;
  baseline_value?: number;
  measurement_source?: string;
}

/**
 * Optimization rules defined in Step 8
 */
export interface OptimizationRules {
  rules: OptimizationRule[];
  optimization_frequency?: 'daily' | 'weekly' | 'monthly';
  automated_actions_enabled?: boolean;
}

export interface OptimizationRule {
  rule_id: string;
  trigger_condition: string;
  action: string;
  threshold?: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Compliance requirements captured in Step 9
 */
export interface ComplianceRequirements {
  regulatory_frameworks?: string[];
  privacy_requirements?: string[];
  brand_safety_requirements?: string[];
  verification_vendors?: string[];
}

/**
 * Document generation status for Step 10
 */
export interface DocumentStatus {
  plan_generated?: boolean;
  plan_version?: number;
  brief_generated?: boolean;
  deck_generated?: boolean;
  last_export_date?: string;
  export_formats?: ('pdf' | 'docx' | 'pptx')[];
}

/**
 * Complete plan state aggregating all workflow steps
 */
export interface PlanState {
  client_context?: ClientContext;
  objectives?: Objectives;
  budget?: BudgetInfo;
  audience?: AudienceStrategy;
  channels?: ChannelAllocations;
  partners?: PartnerSelections;
  measurement?: MeasurementFramework;
  optimization?: OptimizationRules;
  compliance?: ComplianceRequirements;
  document?: DocumentStatus;
}

/**
 * Full session context passed between agents
 */
export interface SessionContext {
  session_id: string;
  workflow_step: number;
  workflow_gate: number;
  session_type: SessionType;
  plan_state: PlanState;
  created_at: string;
  updated_at: string;
  conversation_history_summary?: string;
}

/**
 * Workflow gate definitions
 */
export const WORKFLOW_GATES = {
  GATE_0: { gate: 0, name: 'Initialization', steps: [1] },
  GATE_1: { gate: 1, name: 'Foundation', steps: [2, 3] },
  GATE_2: { gate: 2, name: 'Strategy', steps: [4, 5, 6] },
  GATE_3: { gate: 3, name: 'Execution', steps: [7, 8, 9] },
  GATE_4: { gate: 4, name: 'Documentation', steps: [10] },
} as const;

/**
 * Determines the current gate based on workflow step
 */
export function getGateForStep(step: number): number {
  if (step <= 1) return 0;
  if (step <= 3) return 1;
  if (step <= 6) return 2;
  if (step <= 9) return 3;
  return 4;
}
