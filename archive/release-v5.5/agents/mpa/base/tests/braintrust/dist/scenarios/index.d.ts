/**
 * Test Scenarios Index
 *
 * Exports all test scenarios for the multi-turn MPA evaluation system.
 */
import { TestScenario } from "../mpa-multi-turn-types.js";
import { basicUserStep1_2Scenario, basicUserPersona } from "./basic-user-step1-2.js";
import { sophisticatedIdkScenario, sophisticatedUserPersona } from "./sophisticated-idk.js";
import { full10StepScenario, intermediateUserPersona } from "./full-10-step.js";
import { highStakesPerformanceScenario, highStakesPerformancePersona, highStakesPerformanceContext } from "./high-stakes-performance.js";
import { brandBuildingLimitedDataScenario, brandBuildingLimitedDataPersona, brandBuildingLimitedDataContext } from "./brand-building-limited-data.js";
import { precisionTargetingComplexScenario, precisionTargetingPersona, precisionTargetingComplexContext } from "./precision-targeting-complex.js";
import { massNationalSimplicityScenario, massNationalPersona, massNationalSimplicityContext } from "./mass-national-simplicity.js";
import { aggressiveKpiNarrowTargetingScenario, aggressiveKpiPersona, aggressiveKpiNarrowTargetingContext } from "./aggressive-kpi-narrow-targeting.js";
import { multiAudienceUnifiedPlanScenario, multiAudienceUnifiedPersona, multiAudienceUnifiedPlanContext } from "./multi-audience-unified-plan.js";
import { multiAudienceChannelAllocationScenario, multiAudienceChannelPersona, multiAudienceChannelAllocationContext } from "./multi-audience-channel-allocation.js";
import { multiAudienceVaryingKpisScenario, multiAudienceVaryingKpisPersona, multiAudienceVaryingKpisContext } from "./multi-audience-varying-kpis.js";
import { budgetRevisionMidstreamScenario, budgetRevisionPersona, budgetRevisionMidstreamContext } from "./budget-revision-midstream.js";
import { budgetDecreaseMidstreamScenario, budgetDecreasePersona, budgetDecreaseMidstreamContext } from "./budget-decrease-midstream.js";
import { volumeTargetIncreaseScenario, volumeTargetIncreasePersona, volumeTargetIncreaseContext } from "./volume-target-increase.js";
import { timelineCompressionScenario, timelineCompressionPersona, timelineCompressionContext } from "./timeline-compression.js";
import { efficiencyShockScenario, efficiencyShockPersona, efficiencyShockContext } from "./efficiency-shock.js";
import { channelMixChangeScenario, channelMixChangePersona, channelMixChangeContext } from "./channel-mix-change.js";
import { geoExpansionChangeScenario, geoExpansionPersona, geoExpansionChangeContext } from "./geo-expansion-change.js";
import { demographicShiftChangeScenario, demographicShiftPersona, demographicShiftChangeContext } from "./demographic-shift-change.js";
import { behavioralTargetingChangeScenario, behavioralTargetingPersona, behavioralTargetingChangeContext } from "./behavioral-targeting-change.js";
import { outcomeKPIChangeScenario, outcomeKPIPersona, outcomeKPIChangeContext } from "./outcome-kpi-change.js";
import { audienceAdditionChangeScenario, audienceAdditionPersona, audienceAdditionChangeContext } from "./audience-addition-change.js";
import { audienceRemovalChangeScenario, audienceRemovalPersona, audienceRemovalChangeContext } from "./audience-removal-change.js";
import { ADIS_SCENARIOS, ADIS_CONTEXTS, ADIS_SCENARIO_METADATA, adisTriggerScenario, rfmAudienceCreationScenario, ammoBudgetOptimizationScenario, clvAnalysisScenario, segmentationNewbieScenario, adisTriggerContext, rfmAudienceCreationContext, ammoBudgetOptimizationContext, clvAnalysisContext, segmentationNewbieContext, dataRichRetailPersona, customerValueFocusedPersona, segmentationNewbiePersona } from "./adis-scenarios.js";
export { basicUserStep1_2Scenario, basicUserPersona, sophisticatedIdkScenario, sophisticatedUserPersona, full10StepScenario, intermediateUserPersona, };
export { highStakesPerformanceScenario, highStakesPerformancePersona, highStakesPerformanceContext, brandBuildingLimitedDataScenario, brandBuildingLimitedDataPersona, brandBuildingLimitedDataContext, };
export { precisionTargetingComplexScenario, precisionTargetingPersona, precisionTargetingComplexContext, massNationalSimplicityScenario, massNationalPersona, massNationalSimplicityContext, aggressiveKpiNarrowTargetingScenario, aggressiveKpiPersona, aggressiveKpiNarrowTargetingContext, };
export { multiAudienceUnifiedPlanScenario, multiAudienceUnifiedPersona, multiAudienceUnifiedPlanContext, multiAudienceChannelAllocationScenario, multiAudienceChannelPersona, multiAudienceChannelAllocationContext, multiAudienceVaryingKpisScenario, multiAudienceVaryingKpisPersona, multiAudienceVaryingKpisContext, };
export { budgetRevisionMidstreamScenario, budgetRevisionPersona, budgetRevisionMidstreamContext, budgetDecreaseMidstreamScenario, budgetDecreasePersona, budgetDecreaseMidstreamContext, volumeTargetIncreaseScenario, volumeTargetIncreasePersona, volumeTargetIncreaseContext, timelineCompressionScenario, timelineCompressionPersona, timelineCompressionContext, efficiencyShockScenario, efficiencyShockPersona, efficiencyShockContext, channelMixChangeScenario, channelMixChangePersona, channelMixChangeContext, geoExpansionChangeScenario, geoExpansionPersona, geoExpansionChangeContext, demographicShiftChangeScenario, demographicShiftPersona, demographicShiftChangeContext, behavioralTargetingChangeScenario, behavioralTargetingPersona, behavioralTargetingChangeContext, outcomeKPIChangeScenario, outcomeKPIPersona, outcomeKPIChangeContext, audienceAdditionChangeScenario, audienceAdditionPersona, audienceAdditionChangeContext, audienceRemovalChangeScenario, audienceRemovalPersona, audienceRemovalChangeContext, };
export { ADIS_SCENARIOS, ADIS_CONTEXTS, ADIS_SCENARIO_METADATA, adisTriggerScenario, rfmAudienceCreationScenario, ammoBudgetOptimizationScenario, clvAnalysisScenario, segmentationNewbieScenario, adisTriggerContext, rfmAudienceCreationContext, ammoBudgetOptimizationContext, clvAnalysisContext, segmentationNewbieContext, dataRichRetailPersona, customerValueFocusedPersona, segmentationNewbiePersona, };
/**
 * All available test scenarios
 */
export declare const ALL_SCENARIOS: TestScenario[];
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
export declare const REFORECASTING_SCENARIOS: TestScenario[];
/**
 * Quick test scenarios (faster execution, fewer turns)
 */
export declare const QUICK_SCENARIOS: TestScenario[];
/**
 * Full test scenarios (comprehensive, more turns)
 */
export declare const FULL_SCENARIOS: TestScenario[];
/**
 * Phase 1 Quality Test Scenarios
 *
 * These scenarios test quality-focused scoring:
 * - Mentorship (teaching, calculation, citation, synthesis)
 * - Step Quality (context-aware requirements)
 * - Plan Coherence (mathematical/strategic consistency)
 */
export declare const PHASE1_QUALITY_SCENARIOS: TestScenario[];
/**
 * Advanced Targeting Scenarios
 *
 * These scenarios test complex audience targeting:
 * - Precision targeting with complex geo/behavioral/demographic attributes
 * - Mass national simplicity (broad reach)
 * - Aggressive KPI requiring narrow targeting
 */
export declare const ADVANCED_TARGETING_SCENARIOS: TestScenario[];
/**
 * Multi-Audience Scenarios
 *
 * These scenarios test handling multiple distinct audiences:
 * - Multiple segments with unified plan
 * - Different channel allocations per segment
 * - Different KPIs per segment
 */
export declare const MULTI_AUDIENCE_SCENARIOS: TestScenario[];
/**
 * Get scenario by ID
 */
export declare function getScenarioById(id: string): TestScenario | undefined;
/**
 * Get scenarios by tag/category
 */
export declare function getScenariosByCategory(category: "quick" | "full" | "phase1" | "targeting" | "multi-audience" | "reforecasting" | "adis" | "advanced-analytics" | "all"): TestScenario[];
/**
 * Scenario metadata for reporting
 */
export declare const SCENARIO_METADATA: {
    "basic-user-step1-2": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
    };
    "sophisticated-idk-protocol": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
    };
    "full-10-step": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
    };
    "high-stakes-performance": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
    "brand-building-limited-data": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
    "precision-targeting-complex": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
    "mass-national-simplicity": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
    "aggressive-kpi-narrow-targeting": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
    "multi-audience-unified-plan": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
    "multi-audience-channel-allocation": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
    "multi-audience-varying-kpis": {
        name: string;
        description: string;
        expectedDuration: string;
        expectedTurns: string;
        difficulty: string;
        category: string;
        qualityFocus: string[];
    };
};
/**
 * Quality Context configurations for scoring
 */
export declare const SCENARIO_CONTEXTS: {
    "high-stakes-performance": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "high";
    };
    "brand-building-limited-data": {
        budget: number;
        funnel: "awareness";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
    "precision-targeting-complex": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "mass-national-simplicity": {
        budget: number;
        funnel: "awareness";
        kpiAggressiveness: "conservative";
        userSophistication: "medium";
    };
    "aggressive-kpi-narrow-targeting": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "high";
    };
    "multi-audience-unified-plan": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "multi-audience-channel-allocation": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "multi-audience-varying-kpis": {
        budget: number;
        funnel: "consideration";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "budget-revision-midstream": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
    "budget-decrease-midstream": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "high";
    };
    "volume-target-increase": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "medium";
    };
    "timeline-compression": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "high";
    };
    "efficiency-shock": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "medium";
    };
    "channel-mix-change": {
        budget: number;
        funnel: "awareness";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
    "geo-expansion-change": {
        budget: number;
        funnel: "consideration";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
    "demographic-shift-change": {
        budget: number;
        funnel: "awareness";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
    "behavioral-targeting-change": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "outcome-kpi-change": {
        budget: number;
        funnel: "awareness";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "audience-addition-change": {
        budget: number;
        funnel: "consideration";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "audience-removal-change": {
        budget: number;
        funnel: "consideration";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
};
export declare const PHASE1_CONTEXTS: {
    "high-stakes-performance": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "high";
    };
    "brand-building-limited-data": {
        budget: number;
        funnel: "awareness";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
    "precision-targeting-complex": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "mass-national-simplicity": {
        budget: number;
        funnel: "awareness";
        kpiAggressiveness: "conservative";
        userSophistication: "medium";
    };
    "aggressive-kpi-narrow-targeting": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "high";
    };
    "multi-audience-unified-plan": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "multi-audience-channel-allocation": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "multi-audience-varying-kpis": {
        budget: number;
        funnel: "consideration";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "budget-revision-midstream": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
    "budget-decrease-midstream": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "high";
    };
    "volume-target-increase": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "medium";
    };
    "timeline-compression": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "high";
    };
    "efficiency-shock": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "aggressive";
        userSophistication: "medium";
    };
    "channel-mix-change": {
        budget: number;
        funnel: "awareness";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
    "geo-expansion-change": {
        budget: number;
        funnel: "consideration";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
    "demographic-shift-change": {
        budget: number;
        funnel: "awareness";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
    "behavioral-targeting-change": {
        budget: number;
        funnel: "performance";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "outcome-kpi-change": {
        budget: number;
        funnel: "awareness";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "audience-addition-change": {
        budget: number;
        funnel: "consideration";
        kpiAggressiveness: "moderate";
        userSophistication: "high";
    };
    "audience-removal-change": {
        budget: number;
        funnel: "consideration";
        kpiAggressiveness: "moderate";
        userSophistication: "medium";
    };
};
export default ALL_SCENARIOS;
//# sourceMappingURL=index.d.ts.map