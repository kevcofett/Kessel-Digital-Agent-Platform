"use strict";
/**
 * MPA Multi-Turn Evaluation Type Definitions
 *
 * Comprehensive type system for multi-turn conversation evaluation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRADE_SCORES = exports.SCORER_WEIGHTS = exports.MPA_STEPS = void 0;
exports.createInitialConversationState = createInitialConversationState;
/**
 * Initialize empty conversation state
 */
function createInitialConversationState(budget = 0, funnel = "performance", kpiAggressiveness = "moderate", userSophistication = "medium") {
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
exports.MPA_STEPS = [
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
 * Scorer weight configuration
 */
exports.SCORER_WEIGHTS = {
    // Per-turn scorers - Quality behaviors (in priority order)
    "proactive-intelligence": 0.12, // #1: Does agent do math proactively?
    "calculation-presence": 0.10, // #2: Is agent modeling/calculating?
    "precision-connection": 0.08, // #3: Connects precision to CAC target
    "risk-opportunity-flagging": 0.07, // #4: Does agent flag risks/opportunities?
    "audience-completeness": 0.07, // #5: Collects all 4 dimensions with appropriate depth
    "audience-sizing": 0.06, // #6: Presents audience SIZE table properly
    "progress-over-perfection": 0.05, // #7: Maintains momentum
    "adaptive-sophistication": 0.04, // #8: Language matches user
    "response-formatting": 0.03, // #9: Visual hierarchy, calculations on own line
    // Per-turn scorers - Compliance behaviors (in priority order)
    "source-citation": 0.08, // #1: Cite data sources - CRITICAL
    "step-boundary": 0.05, // #2: Don't discuss channels in Steps 1-2
    "idk-protocol": 0.04, // #3: Handle "I don't know" properly
    "single-question": 0.03, // #4: Question discipline
    "acronym-definition": 0.02, // #5: Define acronyms
    "response-length": 0.02, // #6: Keep responses concise
    // Conversation-level scorers (in priority order)
    "context-retention": 0.05, // #1: Remember user data
    "step-completion-rate": 0.04, // #2: Complete the steps
    "conversation-efficiency": 0.03, // #3: Efficient turn count
    "loop-detection": 0.01, // #4: No question loops
    "greeting-uniqueness": 0.01, // #5: Don't repeat greeting
};
/**
 * LLM grade to score mapping
 */
exports.GRADE_SCORES = {
    A: 1.0,
    B: 0.8,
    C: 0.5,
    D: 0.2,
    F: 0,
};
//# sourceMappingURL=mpa-multi-turn-types.js.map