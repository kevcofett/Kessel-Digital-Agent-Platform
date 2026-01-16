/**
 * Test Scenarios Index
 *
 * Exports all test scenarios for the multi-turn MPA evaluation system.
 */

import { TestScenario } from "../mpa-multi-turn-types.js";

// Import individual scenarios
import {
  basicUserStep1_2Scenario,
  basicUserPersona,
} from "./basic-user-step1-2.js";
import {
  sophisticatedIdkScenario,
  sophisticatedUserPersona,
} from "./sophisticated-idk.js";
import {
  full10StepScenario,
  intermediateUserPersona,
} from "./full-10-step.js";

// Import Phase 1 Quality Scenarios
import {
  highStakesPerformanceScenario,
  highStakesPerformancePersona,
  highStakesPerformanceContext,
} from "./high-stakes-performance.js";
import {
  brandBuildingLimitedDataScenario,
  brandBuildingLimitedDataPersona,
  brandBuildingLimitedDataContext,
} from "./brand-building-limited-data.js";

// Import Advanced Targeting Scenarios
import {
  precisionTargetingComplexScenario,
  precisionTargetingPersona,
  precisionTargetingComplexContext,
} from "./precision-targeting-complex.js";
import {
  massNationalSimplicityScenario,
  massNationalPersona,
  massNationalSimplicityContext,
} from "./mass-national-simplicity.js";
import {
  aggressiveKpiNarrowTargetingScenario,
  aggressiveKpiPersona,
  aggressiveKpiNarrowTargetingContext,
} from "./aggressive-kpi-narrow-targeting.js";

// Import V6.1 Test Scenarios
import {
  V61_TEST_SCENARIOS,
  automaticBenchmarkScenario,
  dataConfidenceScenario,
  platformTaxonomyScenario,
  geographyCensusScenario,
  comprehensiveV61Scenario,
} from "./v61-test-scenarios.js";

// Import Multi-Audience Scenarios
import {
  multiAudienceUnifiedPlanScenario,
  multiAudienceUnifiedPersona,
  multiAudienceUnifiedPlanContext,
} from "./multi-audience-unified-plan.js";
import {
  multiAudienceChannelAllocationScenario,
  multiAudienceChannelPersona,
  multiAudienceChannelAllocationContext,
} from "./multi-audience-channel-allocation.js";
import {
  multiAudienceVaryingKpisScenario,
  multiAudienceVaryingKpisPersona,
  multiAudienceVaryingKpisContext,
} from "./multi-audience-varying-kpis.js";

// Import Reforecasting Scenarios
import {
  budgetRevisionMidstreamScenario,
  budgetRevisionPersona,
  budgetRevisionMidstreamContext,
} from "./budget-revision-midstream.js";
import {
  budgetDecreaseMidstreamScenario,
  budgetDecreasePersona,
  budgetDecreaseMidstreamContext,
} from "./budget-decrease-midstream.js";
import {
  volumeTargetIncreaseScenario,
  volumeTargetIncreasePersona,
  volumeTargetIncreaseContext,
} from "./volume-target-increase.js";
import {
  timelineCompressionScenario,
  timelineCompressionPersona,
  timelineCompressionContext,
} from "./timeline-compression.js";
import {
  efficiencyShockScenario,
  efficiencyShockPersona,
  efficiencyShockContext,
} from "./efficiency-shock.js";
import {
  channelMixChangeScenario,
  channelMixChangePersona,
  channelMixChangeContext,
} from "./channel-mix-change.js";
import {
  geoExpansionChangeScenario,
  geoExpansionPersona,
  geoExpansionChangeContext,
} from "./geo-expansion-change.js";
import {
  demographicShiftChangeScenario,
  demographicShiftPersona,
  demographicShiftChangeContext,
} from "./demographic-shift-change.js";
import {
  behavioralTargetingChangeScenario,
  behavioralTargetingPersona,
  behavioralTargetingChangeContext,
} from "./behavioral-targeting-change.js";
import {
  outcomeKPIChangeScenario,
  outcomeKPIPersona,
  outcomeKPIChangeContext,
} from "./outcome-kpi-change.js";
import {
  audienceAdditionChangeScenario,
  audienceAdditionPersona,
  audienceAdditionChangeContext,
} from "./audience-addition-change.js";
import {
  audienceRemovalChangeScenario,
  audienceRemovalPersona,
  audienceRemovalChangeContext,
} from "./audience-removal-change.js";

// Import v6.0 Vertical Benchmark Scenarios
import {
  retailBenchmarkScenario,
  healthcareBenchmarkScenario,
  gamingBenchmarkScenario,
  b2bBenchmarkScenario,
  VERTICAL_BENCHMARK_SCENARIOS,
  retailMarketingManagerPersona,
  healthcareMarketingDirectorPersona,
  gamingStartupFounderPersona,
  b2bSaasVpMarketingPersona,
  retailBenchmarkContext,
  healthcareBenchmarkContext,
  gamingBenchmarkContext,
  b2bBenchmarkContext,
} from "./vertical-benchmark-scenarios.js";

// Export individual scenarios
export {
  basicUserStep1_2Scenario,
  basicUserPersona,
  sophisticatedIdkScenario,
  sophisticatedUserPersona,
  full10StepScenario,
  intermediateUserPersona,
};

// Export Phase 1 Quality Scenarios
export {
  highStakesPerformanceScenario,
  highStakesPerformancePersona,
  highStakesPerformanceContext,
  brandBuildingLimitedDataScenario,
  brandBuildingLimitedDataPersona,
  brandBuildingLimitedDataContext,
};

// Export Advanced Targeting Scenarios
export {
  precisionTargetingComplexScenario,
  precisionTargetingPersona,
  precisionTargetingComplexContext,
  massNationalSimplicityScenario,
  massNationalPersona,
  massNationalSimplicityContext,
  aggressiveKpiNarrowTargetingScenario,
  aggressiveKpiPersona,
  aggressiveKpiNarrowTargetingContext,
};

// Export Multi-Audience Scenarios
export {
  multiAudienceUnifiedPlanScenario,
  multiAudienceUnifiedPersona,
  multiAudienceUnifiedPlanContext,
  multiAudienceChannelAllocationScenario,
  multiAudienceChannelPersona,
  multiAudienceChannelAllocationContext,
  multiAudienceVaryingKpisScenario,
  multiAudienceVaryingKpisPersona,
  multiAudienceVaryingKpisContext,
};

// Export Reforecasting Scenarios
export {
  budgetRevisionMidstreamScenario,
  budgetRevisionPersona,
  budgetRevisionMidstreamContext,
  budgetDecreaseMidstreamScenario,
  budgetDecreasePersona,
  budgetDecreaseMidstreamContext,
  volumeTargetIncreaseScenario,
  volumeTargetIncreasePersona,
  volumeTargetIncreaseContext,
  timelineCompressionScenario,
  timelineCompressionPersona,
  timelineCompressionContext,
  efficiencyShockScenario,
  efficiencyShockPersona,
  efficiencyShockContext,
  channelMixChangeScenario,
  channelMixChangePersona,
  channelMixChangeContext,
  geoExpansionChangeScenario,
  geoExpansionPersona,
  geoExpansionChangeContext,
  demographicShiftChangeScenario,
  demographicShiftPersona,
  demographicShiftChangeContext,
  behavioralTargetingChangeScenario,
  behavioralTargetingPersona,
  behavioralTargetingChangeContext,
  outcomeKPIChangeScenario,
  outcomeKPIPersona,
  outcomeKPIChangeContext,
  audienceAdditionChangeScenario,
  audienceAdditionPersona,
  audienceAdditionChangeContext,
  audienceRemovalChangeScenario,
  audienceRemovalPersona,
  audienceRemovalChangeContext,
};

/**
 * All available test scenarios
 */
export const ALL_SCENARIOS: TestScenario[] = [
  // Core scenarios
  basicUserStep1_2Scenario,
  sophisticatedIdkScenario,
  full10StepScenario,
  // Phase 1 Quality scenarios
  highStakesPerformanceScenario,
  brandBuildingLimitedDataScenario,
  // Advanced Targeting scenarios
  precisionTargetingComplexScenario,
  massNationalSimplicityScenario,
  aggressiveKpiNarrowTargetingScenario,
  // Multi-Audience scenarios
  multiAudienceUnifiedPlanScenario,
  multiAudienceChannelAllocationScenario,
  multiAudienceVaryingKpisScenario,
  // Reforecasting scenarios
  budgetRevisionMidstreamScenario,
  budgetDecreaseMidstreamScenario,
  volumeTargetIncreaseScenario,
  timelineCompressionScenario,
  efficiencyShockScenario,
  channelMixChangeScenario,
  geoExpansionChangeScenario,
  demographicShiftChangeScenario,
  behavioralTargetingChangeScenario,
  outcomeKPIChangeScenario,
  audienceAdditionChangeScenario,
  audienceRemovalChangeScenario,
  // V6.1 Capability scenarios
  ...V61_TEST_SCENARIOS,
];

/**
 * Reforecasting Scenarios
 *
 * These scenarios test proactive reforecasting when data changes mid-conversation:
 * - Budget revision midstream (increase)
 * - Budget decrease midstream (cut)
 * - Volume target increase
 * - Timeline compression
 * - Efficiency shock (CAC reality check)
 * - Channel mix change (exclusions)
 * - Geography expansion change
 * - Demographic shift change
 * - Behavioral targeting change
 * - Outcome KPI change (funnel shift)
 * - Audience addition change
 * - Audience removal change
 */
export const REFORECASTING_SCENARIOS: TestScenario[] = [
  budgetRevisionMidstreamScenario,
  budgetDecreaseMidstreamScenario,
  volumeTargetIncreaseScenario,
  timelineCompressionScenario,
  efficiencyShockScenario,
  channelMixChangeScenario,
  geoExpansionChangeScenario,
  demographicShiftChangeScenario,
  behavioralTargetingChangeScenario,
  outcomeKPIChangeScenario,
  audienceAdditionChangeScenario,
  audienceRemovalChangeScenario,
];

/**
 * Quick test scenarios (faster execution, fewer turns)
 */
export const QUICK_SCENARIOS: TestScenario[] = [
  basicUserStep1_2Scenario,
  sophisticatedIdkScenario,
];

/**
 * Full test scenarios (comprehensive, more turns)
 */
export const FULL_SCENARIOS: TestScenario[] = [full10StepScenario];

/**
 * Phase 1 Quality Test Scenarios
 *
 * These scenarios test quality-focused scoring:
 * - Mentorship (teaching, calculation, citation, synthesis)
 * - Step Quality (context-aware requirements)
 * - Plan Coherence (mathematical/strategic consistency)
 */
export const PHASE1_QUALITY_SCENARIOS: TestScenario[] = [
  highStakesPerformanceScenario,
  brandBuildingLimitedDataScenario,
];

/**
 * Advanced Targeting Scenarios
 *
 * These scenarios test complex audience targeting:
 * - Precision targeting with complex geo/behavioral/demographic attributes
 * - Mass national simplicity (broad reach)
 * - Aggressive KPI requiring narrow targeting
 */
export const ADVANCED_TARGETING_SCENARIOS: TestScenario[] = [
  precisionTargetingComplexScenario,
  massNationalSimplicityScenario,
  aggressiveKpiNarrowTargetingScenario,
];

/**
 * Multi-Audience Scenarios
 *
 * These scenarios test handling multiple distinct audiences:
 * - Multiple segments with unified plan
 * - Different channel allocations per segment
 * - Different KPIs per segment
 */
export const MULTI_AUDIENCE_SCENARIOS: TestScenario[] = [
  multiAudienceUnifiedPlanScenario,
  multiAudienceChannelAllocationScenario,
  multiAudienceVaryingKpisScenario,
];

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): TestScenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === id);
}

/**
 * Get scenarios by tag/category
 */
export function getScenariosByCategory(
  category:
    | "quick"
    | "full"
    | "phase1"
    | "targeting"
    | "multi-audience"
    | "reforecasting"
    | "all"
): TestScenario[] {
  switch (category) {
    case "quick":
      return QUICK_SCENARIOS;
    case "full":
      return FULL_SCENARIOS;
    case "phase1":
      return PHASE1_QUALITY_SCENARIOS;
    case "targeting":
      return ADVANCED_TARGETING_SCENARIOS;
    case "multi-audience":
      return MULTI_AUDIENCE_SCENARIOS;
    case "reforecasting":
      return REFORECASTING_SCENARIOS;
    case "all":
    default:
      return ALL_SCENARIOS;
  }
}

/**
 * Scenario metadata for reporting
 */
export const SCENARIO_METADATA = {
  "basic-user-step1-2": {
    name: "Basic User - Steps 1-2",
    description: "Tests language adaptation and calculation for basic user",
    expectedDuration: "2-5 minutes",
    expectedTurns: "4-12",
    difficulty: "easy",
    category: "quick",
  },
  "sophisticated-idk-protocol": {
    name: "Sophisticated User - IDK Protocol",
    description: "Tests handling of uncertainty and benchmark modeling",
    expectedDuration: "3-8 minutes",
    expectedTurns: "5-15",
    difficulty: "medium",
    category: "quick",
  },
  "full-10-step": {
    name: "Full 10-Step Planning",
    description: "Complete media planning session through all steps",
    expectedDuration: "15-30 minutes",
    expectedTurns: "20-50",
    difficulty: "hard",
    category: "full",
  },
  "high-stakes-performance": {
    name: "High-Stakes Performance Campaign",
    description:
      "Tests quality guidance for $2M budget with aggressive $40 CAC target. " +
      "Agent MUST challenge unrealistic targets and show calculations.",
    expectedDuration: "8-15 minutes",
    expectedTurns: "10-30",
    difficulty: "hard",
    category: "phase1",
    qualityFocus: ["mentorship", "critical-thinking", "calculation", "synthesis"],
  },
  "brand-building-limited-data": {
    name: "Brand Building with Limited Data",
    description:
      "Tests quality guidance for awareness campaign with limited data. " +
      "Agent MUST model with assumptions and avoid performance metric fixation.",
    expectedDuration: "10-18 minutes",
    expectedTurns: "12-35",
    difficulty: "medium",
    category: "phase1",
    qualityFocus: ["teaching", "idk-handling", "funnel-appropriate"],
  },
  "precision-targeting-complex": {
    name: "Precision Targeting with Complex Attributes",
    description:
      "Tests handling of highly complex geo/behavioral/demographic/contextual " +
      "targeting for precision campaigns. Agent MUST unpack multi-layered audiences.",
    expectedDuration: "12-20 minutes",
    expectedTurns: "18-40",
    difficulty: "hard",
    category: "targeting",
    qualityFocus: ["audience-segmentation", "first-party-data", "precision-reach-tradeoff"],
  },
  "mass-national-simplicity": {
    name: "Mass National Campaign - Simplicity",
    description:
      "Tests handling of simple broad-reach national campaign. Agent should NOT " +
      "over-complicate and should focus on reach/frequency metrics.",
    expectedDuration: "10-16 minutes",
    expectedTurns: "12-30",
    difficulty: "medium",
    category: "targeting",
    qualityFocus: ["simplicity", "reach-frequency", "awareness-metrics"],
  },
  "aggressive-kpi-narrow-targeting": {
    name: "Aggressive KPI - Must Narrow",
    description:
      "Tests handling of aggressive efficiency targets requiring volume sacrifice. " +
      "Agent MUST challenge targets and recommend narrowing strategies.",
    expectedDuration: "10-18 minutes",
    expectedTurns: "12-40",
    difficulty: "hard",
    category: "targeting",
    qualityFocus: ["critical-thinking", "volume-efficiency-tradeoff", "test-and-scale"],
  },
  "multi-audience-unified-plan": {
    name: "Multi-Audience Unified Plan",
    description:
      "Tests handling of three distinct audience segments with different " +
      "geo/demo/behavior signals in one plan. Agent MUST keep segments distinct.",
    expectedDuration: "15-25 minutes",
    expectedTurns: "18-50",
    difficulty: "hard",
    category: "multi-audience",
    qualityFocus: ["segment-clarity", "budget-allocation", "segment-measurement"],
  },
  "multi-audience-channel-allocation": {
    name: "Multi-Audience with Segment-Specific Channels",
    description:
      "Advanced: Multiple audiences with different channel allocations per segment. " +
      "Agent MUST recommend distinct channel mixes based on segment behaviors.",
    expectedDuration: "18-28 minutes",
    expectedTurns: "22-55",
    difficulty: "expert",
    category: "multi-audience",
    qualityFocus: ["segment-channel-fit", "channel-justification", "budget-matrix"],
  },
  "multi-audience-varying-kpis": {
    name: "Multi-Audience with Different KPIs",
    description:
      "Most complex: Multiple audiences with DIFFERENT primary KPIs per segment " +
      "(awareness vs leads vs retention). Agent MUST track heterogeneous objectives.",
    expectedDuration: "18-28 minutes",
    expectedTurns: "22-55",
    difficulty: "expert",
    category: "multi-audience",
    qualityFocus: ["segment-kpi-clarity", "mixed-funnel", "heterogeneous-measurement"],
  },
};

/**
 * Quality Context configurations for scoring
 */
export const SCENARIO_CONTEXTS = {
  "high-stakes-performance": highStakesPerformanceContext,
  "brand-building-limited-data": brandBuildingLimitedDataContext,
  "precision-targeting-complex": precisionTargetingComplexContext,
  "mass-national-simplicity": massNationalSimplicityContext,
  "aggressive-kpi-narrow-targeting": aggressiveKpiNarrowTargetingContext,
  "multi-audience-unified-plan": multiAudienceUnifiedPlanContext,
  "multi-audience-channel-allocation": multiAudienceChannelAllocationContext,
  "multi-audience-varying-kpis": multiAudienceVaryingKpisContext,
  // Reforecasting scenarios
  "budget-revision-midstream": budgetRevisionMidstreamContext,
  "budget-decrease-midstream": budgetDecreaseMidstreamContext,
  "volume-target-increase": volumeTargetIncreaseContext,
  "timeline-compression": timelineCompressionContext,
  "efficiency-shock": efficiencyShockContext,
  "channel-mix-change": channelMixChangeContext,
  "geo-expansion-change": geoExpansionChangeContext,
  "demographic-shift-change": demographicShiftChangeContext,
  "behavioral-targeting-change": behavioralTargetingChangeContext,
  "outcome-kpi-change": outcomeKPIChangeContext,
  "audience-addition-change": audienceAdditionChangeContext,
  "audience-removal-change": audienceRemovalChangeContext,
};

// Backwards compatibility
export const PHASE1_CONTEXTS = SCENARIO_CONTEXTS;

export default ALL_SCENARIOS;
