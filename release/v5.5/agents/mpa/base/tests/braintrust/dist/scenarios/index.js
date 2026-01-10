"use strict";
/**
 * Test Scenarios Index
 *
 * Exports all test scenarios for the multi-turn MPA evaluation system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHASE1_CONTEXTS = exports.SCENARIO_CONTEXTS = exports.SCENARIO_METADATA = exports.MULTI_AUDIENCE_SCENARIOS = exports.ADVANCED_TARGETING_SCENARIOS = exports.PHASE1_QUALITY_SCENARIOS = exports.FULL_SCENARIOS = exports.QUICK_SCENARIOS = exports.ALL_SCENARIOS = exports.multiAudienceVaryingKpisContext = exports.multiAudienceVaryingKpisPersona = exports.multiAudienceVaryingKpisScenario = exports.multiAudienceChannelAllocationContext = exports.multiAudienceChannelPersona = exports.multiAudienceChannelAllocationScenario = exports.multiAudienceUnifiedPlanContext = exports.multiAudienceUnifiedPersona = exports.multiAudienceUnifiedPlanScenario = exports.aggressiveKpiNarrowTargetingContext = exports.aggressiveKpiPersona = exports.aggressiveKpiNarrowTargetingScenario = exports.massNationalSimplicityContext = exports.massNationalPersona = exports.massNationalSimplicityScenario = exports.precisionTargetingComplexContext = exports.precisionTargetingPersona = exports.precisionTargetingComplexScenario = exports.brandBuildingLimitedDataContext = exports.brandBuildingLimitedDataPersona = exports.brandBuildingLimitedDataScenario = exports.highStakesPerformanceContext = exports.highStakesPerformancePersona = exports.highStakesPerformanceScenario = exports.intermediateUserPersona = exports.full10StepScenario = exports.sophisticatedUserPersona = exports.sophisticatedIdkScenario = exports.basicUserPersona = exports.basicUserStep1_2Scenario = void 0;
exports.getScenarioById = getScenarioById;
exports.getScenariosByCategory = getScenariosByCategory;
// Import individual scenarios
const basic_user_step1_2_js_1 = require("./basic-user-step1-2.js");
Object.defineProperty(exports, "basicUserStep1_2Scenario", { enumerable: true, get: function () { return basic_user_step1_2_js_1.basicUserStep1_2Scenario; } });
Object.defineProperty(exports, "basicUserPersona", { enumerable: true, get: function () { return basic_user_step1_2_js_1.basicUserPersona; } });
const sophisticated_idk_js_1 = require("./sophisticated-idk.js");
Object.defineProperty(exports, "sophisticatedIdkScenario", { enumerable: true, get: function () { return sophisticated_idk_js_1.sophisticatedIdkScenario; } });
Object.defineProperty(exports, "sophisticatedUserPersona", { enumerable: true, get: function () { return sophisticated_idk_js_1.sophisticatedUserPersona; } });
const full_10_step_js_1 = require("./full-10-step.js");
Object.defineProperty(exports, "full10StepScenario", { enumerable: true, get: function () { return full_10_step_js_1.full10StepScenario; } });
Object.defineProperty(exports, "intermediateUserPersona", { enumerable: true, get: function () { return full_10_step_js_1.intermediateUserPersona; } });
// Import Phase 1 Quality Scenarios
const high_stakes_performance_js_1 = require("./high-stakes-performance.js");
Object.defineProperty(exports, "highStakesPerformanceScenario", { enumerable: true, get: function () { return high_stakes_performance_js_1.highStakesPerformanceScenario; } });
Object.defineProperty(exports, "highStakesPerformancePersona", { enumerable: true, get: function () { return high_stakes_performance_js_1.highStakesPerformancePersona; } });
Object.defineProperty(exports, "highStakesPerformanceContext", { enumerable: true, get: function () { return high_stakes_performance_js_1.highStakesPerformanceContext; } });
const brand_building_limited_data_js_1 = require("./brand-building-limited-data.js");
Object.defineProperty(exports, "brandBuildingLimitedDataScenario", { enumerable: true, get: function () { return brand_building_limited_data_js_1.brandBuildingLimitedDataScenario; } });
Object.defineProperty(exports, "brandBuildingLimitedDataPersona", { enumerable: true, get: function () { return brand_building_limited_data_js_1.brandBuildingLimitedDataPersona; } });
Object.defineProperty(exports, "brandBuildingLimitedDataContext", { enumerable: true, get: function () { return brand_building_limited_data_js_1.brandBuildingLimitedDataContext; } });
// Import Advanced Targeting Scenarios
const precision_targeting_complex_js_1 = require("./precision-targeting-complex.js");
Object.defineProperty(exports, "precisionTargetingComplexScenario", { enumerable: true, get: function () { return precision_targeting_complex_js_1.precisionTargetingComplexScenario; } });
Object.defineProperty(exports, "precisionTargetingPersona", { enumerable: true, get: function () { return precision_targeting_complex_js_1.precisionTargetingPersona; } });
Object.defineProperty(exports, "precisionTargetingComplexContext", { enumerable: true, get: function () { return precision_targeting_complex_js_1.precisionTargetingComplexContext; } });
const mass_national_simplicity_js_1 = require("./mass-national-simplicity.js");
Object.defineProperty(exports, "massNationalSimplicityScenario", { enumerable: true, get: function () { return mass_national_simplicity_js_1.massNationalSimplicityScenario; } });
Object.defineProperty(exports, "massNationalPersona", { enumerable: true, get: function () { return mass_national_simplicity_js_1.massNationalPersona; } });
Object.defineProperty(exports, "massNationalSimplicityContext", { enumerable: true, get: function () { return mass_national_simplicity_js_1.massNationalSimplicityContext; } });
const aggressive_kpi_narrow_targeting_js_1 = require("./aggressive-kpi-narrow-targeting.js");
Object.defineProperty(exports, "aggressiveKpiNarrowTargetingScenario", { enumerable: true, get: function () { return aggressive_kpi_narrow_targeting_js_1.aggressiveKpiNarrowTargetingScenario; } });
Object.defineProperty(exports, "aggressiveKpiPersona", { enumerable: true, get: function () { return aggressive_kpi_narrow_targeting_js_1.aggressiveKpiPersona; } });
Object.defineProperty(exports, "aggressiveKpiNarrowTargetingContext", { enumerable: true, get: function () { return aggressive_kpi_narrow_targeting_js_1.aggressiveKpiNarrowTargetingContext; } });
// Import Multi-Audience Scenarios
const multi_audience_unified_plan_js_1 = require("./multi-audience-unified-plan.js");
Object.defineProperty(exports, "multiAudienceUnifiedPlanScenario", { enumerable: true, get: function () { return multi_audience_unified_plan_js_1.multiAudienceUnifiedPlanScenario; } });
Object.defineProperty(exports, "multiAudienceUnifiedPersona", { enumerable: true, get: function () { return multi_audience_unified_plan_js_1.multiAudienceUnifiedPersona; } });
Object.defineProperty(exports, "multiAudienceUnifiedPlanContext", { enumerable: true, get: function () { return multi_audience_unified_plan_js_1.multiAudienceUnifiedPlanContext; } });
const multi_audience_channel_allocation_js_1 = require("./multi-audience-channel-allocation.js");
Object.defineProperty(exports, "multiAudienceChannelAllocationScenario", { enumerable: true, get: function () { return multi_audience_channel_allocation_js_1.multiAudienceChannelAllocationScenario; } });
Object.defineProperty(exports, "multiAudienceChannelPersona", { enumerable: true, get: function () { return multi_audience_channel_allocation_js_1.multiAudienceChannelPersona; } });
Object.defineProperty(exports, "multiAudienceChannelAllocationContext", { enumerable: true, get: function () { return multi_audience_channel_allocation_js_1.multiAudienceChannelAllocationContext; } });
const multi_audience_varying_kpis_js_1 = require("./multi-audience-varying-kpis.js");
Object.defineProperty(exports, "multiAudienceVaryingKpisScenario", { enumerable: true, get: function () { return multi_audience_varying_kpis_js_1.multiAudienceVaryingKpisScenario; } });
Object.defineProperty(exports, "multiAudienceVaryingKpisPersona", { enumerable: true, get: function () { return multi_audience_varying_kpis_js_1.multiAudienceVaryingKpisPersona; } });
Object.defineProperty(exports, "multiAudienceVaryingKpisContext", { enumerable: true, get: function () { return multi_audience_varying_kpis_js_1.multiAudienceVaryingKpisContext; } });
/**
 * All available test scenarios
 */
exports.ALL_SCENARIOS = [
    // Core scenarios
    basic_user_step1_2_js_1.basicUserStep1_2Scenario,
    sophisticated_idk_js_1.sophisticatedIdkScenario,
    full_10_step_js_1.full10StepScenario,
    // Phase 1 Quality scenarios
    high_stakes_performance_js_1.highStakesPerformanceScenario,
    brand_building_limited_data_js_1.brandBuildingLimitedDataScenario,
    // Advanced Targeting scenarios
    precision_targeting_complex_js_1.precisionTargetingComplexScenario,
    mass_national_simplicity_js_1.massNationalSimplicityScenario,
    aggressive_kpi_narrow_targeting_js_1.aggressiveKpiNarrowTargetingScenario,
    // Multi-Audience scenarios
    multi_audience_unified_plan_js_1.multiAudienceUnifiedPlanScenario,
    multi_audience_channel_allocation_js_1.multiAudienceChannelAllocationScenario,
    multi_audience_varying_kpis_js_1.multiAudienceVaryingKpisScenario,
];
/**
 * Quick test scenarios (faster execution, fewer turns)
 */
exports.QUICK_SCENARIOS = [
    basic_user_step1_2_js_1.basicUserStep1_2Scenario,
    sophisticated_idk_js_1.sophisticatedIdkScenario,
];
/**
 * Full test scenarios (comprehensive, more turns)
 */
exports.FULL_SCENARIOS = [full_10_step_js_1.full10StepScenario];
/**
 * Phase 1 Quality Test Scenarios
 *
 * These scenarios test quality-focused scoring:
 * - Mentorship (teaching, calculation, citation, synthesis)
 * - Step Quality (context-aware requirements)
 * - Plan Coherence (mathematical/strategic consistency)
 */
exports.PHASE1_QUALITY_SCENARIOS = [
    high_stakes_performance_js_1.highStakesPerformanceScenario,
    brand_building_limited_data_js_1.brandBuildingLimitedDataScenario,
];
/**
 * Advanced Targeting Scenarios
 *
 * These scenarios test complex audience targeting:
 * - Precision targeting with complex geo/behavioral/demographic attributes
 * - Mass national simplicity (broad reach)
 * - Aggressive KPI requiring narrow targeting
 */
exports.ADVANCED_TARGETING_SCENARIOS = [
    precision_targeting_complex_js_1.precisionTargetingComplexScenario,
    mass_national_simplicity_js_1.massNationalSimplicityScenario,
    aggressive_kpi_narrow_targeting_js_1.aggressiveKpiNarrowTargetingScenario,
];
/**
 * Multi-Audience Scenarios
 *
 * These scenarios test handling multiple distinct audiences:
 * - Multiple segments with unified plan
 * - Different channel allocations per segment
 * - Different KPIs per segment
 */
exports.MULTI_AUDIENCE_SCENARIOS = [
    multi_audience_unified_plan_js_1.multiAudienceUnifiedPlanScenario,
    multi_audience_channel_allocation_js_1.multiAudienceChannelAllocationScenario,
    multi_audience_varying_kpis_js_1.multiAudienceVaryingKpisScenario,
];
/**
 * Get scenario by ID
 */
function getScenarioById(id) {
    return exports.ALL_SCENARIOS.find((s) => s.id === id);
}
/**
 * Get scenarios by tag/category
 */
function getScenariosByCategory(category) {
    switch (category) {
        case "quick":
            return exports.QUICK_SCENARIOS;
        case "full":
            return exports.FULL_SCENARIOS;
        case "phase1":
            return exports.PHASE1_QUALITY_SCENARIOS;
        case "targeting":
            return exports.ADVANCED_TARGETING_SCENARIOS;
        case "multi-audience":
            return exports.MULTI_AUDIENCE_SCENARIOS;
        case "all":
        default:
            return exports.ALL_SCENARIOS;
    }
}
/**
 * Scenario metadata for reporting
 */
exports.SCENARIO_METADATA = {
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
        description: "Tests quality guidance for $2M budget with aggressive $40 CAC target. " +
            "Agent MUST challenge unrealistic targets and show calculations.",
        expectedDuration: "8-15 minutes",
        expectedTurns: "10-30",
        difficulty: "hard",
        category: "phase1",
        qualityFocus: ["mentorship", "critical-thinking", "calculation", "synthesis"],
    },
    "brand-building-limited-data": {
        name: "Brand Building with Limited Data",
        description: "Tests quality guidance for awareness campaign with limited data. " +
            "Agent MUST model with assumptions and avoid performance metric fixation.",
        expectedDuration: "10-18 minutes",
        expectedTurns: "12-35",
        difficulty: "medium",
        category: "phase1",
        qualityFocus: ["teaching", "idk-handling", "funnel-appropriate"],
    },
    "precision-targeting-complex": {
        name: "Precision Targeting with Complex Attributes",
        description: "Tests handling of highly complex geo/behavioral/demographic/contextual " +
            "targeting for precision campaigns. Agent MUST unpack multi-layered audiences.",
        expectedDuration: "12-20 minutes",
        expectedTurns: "18-40",
        difficulty: "hard",
        category: "targeting",
        qualityFocus: ["audience-segmentation", "first-party-data", "precision-reach-tradeoff"],
    },
    "mass-national-simplicity": {
        name: "Mass National Campaign - Simplicity",
        description: "Tests handling of simple broad-reach national campaign. Agent should NOT " +
            "over-complicate and should focus on reach/frequency metrics.",
        expectedDuration: "10-16 minutes",
        expectedTurns: "12-30",
        difficulty: "medium",
        category: "targeting",
        qualityFocus: ["simplicity", "reach-frequency", "awareness-metrics"],
    },
    "aggressive-kpi-narrow-targeting": {
        name: "Aggressive KPI - Must Narrow",
        description: "Tests handling of aggressive efficiency targets requiring volume sacrifice. " +
            "Agent MUST challenge targets and recommend narrowing strategies.",
        expectedDuration: "10-18 minutes",
        expectedTurns: "12-40",
        difficulty: "hard",
        category: "targeting",
        qualityFocus: ["critical-thinking", "volume-efficiency-tradeoff", "test-and-scale"],
    },
    "multi-audience-unified-plan": {
        name: "Multi-Audience Unified Plan",
        description: "Tests handling of three distinct audience segments with different " +
            "geo/demo/behavior signals in one plan. Agent MUST keep segments distinct.",
        expectedDuration: "15-25 minutes",
        expectedTurns: "18-50",
        difficulty: "hard",
        category: "multi-audience",
        qualityFocus: ["segment-clarity", "budget-allocation", "segment-measurement"],
    },
    "multi-audience-channel-allocation": {
        name: "Multi-Audience with Segment-Specific Channels",
        description: "Advanced: Multiple audiences with different channel allocations per segment. " +
            "Agent MUST recommend distinct channel mixes based on segment behaviors.",
        expectedDuration: "18-28 minutes",
        expectedTurns: "22-55",
        difficulty: "expert",
        category: "multi-audience",
        qualityFocus: ["segment-channel-fit", "channel-justification", "budget-matrix"],
    },
    "multi-audience-varying-kpis": {
        name: "Multi-Audience with Different KPIs",
        description: "Most complex: Multiple audiences with DIFFERENT primary KPIs per segment " +
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
exports.SCENARIO_CONTEXTS = {
    "high-stakes-performance": high_stakes_performance_js_1.highStakesPerformanceContext,
    "brand-building-limited-data": brand_building_limited_data_js_1.brandBuildingLimitedDataContext,
    "precision-targeting-complex": precision_targeting_complex_js_1.precisionTargetingComplexContext,
    "mass-national-simplicity": mass_national_simplicity_js_1.massNationalSimplicityContext,
    "aggressive-kpi-narrow-targeting": aggressive_kpi_narrow_targeting_js_1.aggressiveKpiNarrowTargetingContext,
    "multi-audience-unified-plan": multi_audience_unified_plan_js_1.multiAudienceUnifiedPlanContext,
    "multi-audience-channel-allocation": multi_audience_channel_allocation_js_1.multiAudienceChannelAllocationContext,
    "multi-audience-varying-kpis": multi_audience_varying_kpis_js_1.multiAudienceVaryingKpisContext,
};
// Backwards compatibility
exports.PHASE1_CONTEXTS = exports.SCENARIO_CONTEXTS;
exports.default = exports.ALL_SCENARIOS;
//# sourceMappingURL=index.js.map