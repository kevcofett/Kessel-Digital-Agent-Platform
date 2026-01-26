/**
 * MPA Multi-Turn Evaluation Type Definitions
 *
 * Comprehensive type system for multi-turn conversation evaluation.
 */
/**
 * Initialize empty conversation state
 */
export function createInitialConversationState(budget = 0, funnel = "performance", kpiAggressiveness = "moderate", userSophistication = "medium") {
    return {
        collectedData: {},
        calculationsPerformed: [],
        insightsPerStep: {},
        dataRevisions: [],
        accumulatedPlan: {},
        context: {
            budget,
            funnel,
            kpiAggressiveness,
            userSophistication,
        },
    };
}
/**
 * The 10 MPA steps
 */
export const MPA_STEPS = [
    {
        step: 1,
        name: "Outcomes",
        minimumViableData: ["objective", "primaryKPI", "volumeTarget"],
        detectionPatterns: [
            /business outcome|objective|goal/i,
            /kpi|success|measure/i,
            /target|volume|revenue/i,
        ],
    },
    {
        step: 2,
        name: "Economics",
        minimumViableData: ["impliedEfficiency", "efficiencyAssessment"],
        detectionPatterns: [
            /cac|efficiency|cost per/i,
            /ltv|lifetime value|profit/i,
            /unit economics|margin/i,
        ],
    },
    {
        step: 3,
        name: "Audience",
        minimumViableData: ["primaryAudience"],
        detectionPatterns: [
            /audience|target|segment/i,
            /demographic|who|customer profile/i,
        ],
    },
    {
        step: 4,
        name: "Geography",
        minimumViableData: ["geographicScope"],
        detectionPatterns: [/geography|market|region/i, /dma|location|where/i],
    },
    {
        step: 5,
        name: "Budget",
        minimumViableData: ["totalBudget", "pacing"],
        detectionPatterns: [
            /budget|spend|allocation/i,
            /pacing|timing|duration/i,
        ],
    },
    {
        step: 6,
        name: "Value Proposition",
        minimumViableData: ["differentiators"],
        detectionPatterns: [
            /value prop|differentiator|positioning/i,
            /competitive|unique|message/i,
        ],
    },
    {
        step: 7,
        name: "Channels",
        minimumViableData: ["channelMix"],
        detectionPatterns: [
            /channel|media mix|platform/i,
            /facebook|google|tiktok|programmatic/i,
        ],
    },
    {
        step: 8,
        name: "Measurement",
        minimumViableData: ["measurementApproach", "attributionModel"],
        detectionPatterns: [/measurement|attribution|track/i, /kpi|metric|report/i],
    },
    {
        step: 9,
        name: "Testing",
        minimumViableData: ["testingAgenda"],
        detectionPatterns: [/test|experiment|learn/i, /optimize|iteration/i],
    },
    {
        step: 10,
        name: "Risks",
        minimumViableData: ["riskAssessment"],
        detectionPatterns: [/risk|compliance|safety/i, /mitigation|concern/i],
    },
];
// =============================================================================
// SCORING CONSTANTS
// =============================================================================
/**
 * Scorer weight configuration (SCORER_SPECIFICATION_v3)
 *
 * Rebalanced for Strategic Quality vs Format Compliance:
 * - Strategic Quality (60%): Validates correctness and feasibility
 * - Format Compliance (40%): Validates structure and language patterns
 *
 * Total: 100%
 */
export const SCORER_WEIGHTS = {
    // ==========================================================================
    // STRATEGIC QUALITY (60%) - Validates correctness and feasibility
    // ==========================================================================
    // Validation Layer Scorers (25%) - NEW
    "math-accuracy": 0.10, // Validates arithmetic is correct in tables and calculations
    "feasibility-validation": 0.10, // Validates CAC achievability given audience/budget
    "benchmark-sourcing": 0.05, // Verifies KB citations reference actual data
    // Core Quality Scorers (35%)
    "proactive-calculation": 0.10, // Shows math when data available, compares to benchmark
    "teaching-behavior": 0.08, // Teaches strategic reasoning vs interrogates
    "feasibility-framing": 0.06, // Frames target feasibility with evidence + path forward
    "source-citation": 0.05, // 5-source citation format
    "recalculation-on-change": 0.04, // Recalculates when data changes
    "risk-opportunity-flagging": 0.02, // Proactively flags risks/opportunities
    // ==========================================================================
    // FORMAT COMPLIANCE (40%) - Validates structure and language patterns
    // ==========================================================================
    // Structural Compliance (25%)
    "step-boundary": 0.06, // No channel recommendations in Steps 1-2
    "single-question": 0.05, // One question per response, max
    "idk-protocol": 0.04, // Handle "I don't know" properly
    "response-length": 0.03, // Under 75 words when possible
    "acronym-definition": 0.03, // Define acronyms on first use
    "response-formatting": 0.04, // Visual hierarchy, calculations on own line
    // Advanced Format (15%)
    "audience-sizing": 0.05, // Table with proper columns and TOTAL row
    "audience-sizing-completeness": 0.04, // Table with 7 components
    "cross-step-synthesis": 0.03, // References earlier step insights
    "adaptive-sophistication": 0.03, // Language matches user level
};
/**
 * LLM grade to score mapping
 */
export const GRADE_SCORES = {
    A: 1.0,
    B: 0.8,
    C: 0.5,
    D: 0.2,
    F: 0,
};
//# sourceMappingURL=mpa-multi-turn-types.js.map