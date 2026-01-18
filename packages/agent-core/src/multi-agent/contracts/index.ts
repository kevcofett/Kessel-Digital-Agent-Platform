/**
 * Multi-Agent Architecture - Contract Exports
 *
 * Central export point for all contract schemas and validation functions.
 */

// Request schemas
export {
  // Base schemas
  AgentCodeSchema,
  ConfidenceThresholdSchema,
  SessionTypeSchema,
  RequestOptionsSchema,

  // Plan state schemas
  ClientContextSchema,
  ObjectivesSchema,
  BudgetInfoSchema,
  AudienceSegmentSchema,
  LTVTierSchema,
  AudienceStrategySchema,
  ChannelAllocationSchema,
  ChannelConstraintSchema,
  ChannelAllocationsSchema,
  PartnerSelectionSchema,
  SupplyPathAnalysisSchema,
  PartnerSelectionsSchema,
  MetricDefinitionSchema,
  MeasurementFrameworkSchema,
  OptimizationRuleSchema,
  OptimizationRulesSchema,
  ComplianceRequirementsSchema,
  DocumentStatusSchema,
  PlanStateSchema,

  // Session and request schemas
  SessionContextSchema,
  AgentRequestSchema,

  // Agent-specific request schemas
  ANLRequestTypeSchema,
  ANLCalculateProjectionParamsSchema,
  ANLRunScenarioParamsSchema,
  ANLValidateStatisticsParamsSchema,
  AUDRequestTypeSchema,
  AUDSegmentAudienceParamsSchema,
  CHARequestTypeSchema,
  CHARecommendChannelsParamsSchema,
  CHACalculateAllocationParamsSchema,
  SPORequestTypeSchema,
  SPOAnalyzeSupplyPathParamsSchema,
  DOCRequestTypeSchema,
  DOCGeneratePlanParamsSchema,
  PRFRequestTypeSchema,
  PRFAnalyzePerformanceParamsSchema,
  PRFDetectAnomaliesParamsSchema,

  // Request validation functions
  validateAgentRequest,
  validateSessionContext,
  validatePlanState,
} from './request-schemas.js';

// Response schemas
export {
  // Base response schemas
  ConfidenceLevelSchema,
  DataSourceSchema,
  AgentErrorCodeSchema,
  AgentResponseMetadataSchema,
  AgentResponseSchema,
  AgentErrorResponseSchema,

  // Agent-specific response data schemas
  ANLProjectionDataSchema,
  ANLScenarioDataSchema,
  ANLStatisticsDataSchema,
  AUDSegmentationDataSchema,
  AUDPersonaDataSchema,
  AUDTargetingDataSchema,
  CHARecommendationDataSchema,
  CHAAllocationDataSchema,
  CHABenchmarkDataSchema,
  SPOAnalysisDataSchema,
  SPONBIDataSchema,
  DOCGenerationDataSchema,
  PRFAnalysisDataSchema,
  PRFAnomalyDataSchema,
  PRFLearningsDataSchema,
  ORCRoutingDecisionSchema,
  ORCSynthesizedDataSchema,

  // Response validation functions
  validateAgentResponse,
  validateAgentErrorResponse,
  validateAnyResponse,
} from './response-schemas.js';
