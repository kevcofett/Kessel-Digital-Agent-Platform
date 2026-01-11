"use strict";
/**
 * Geography Expansion Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation geography expansion.
 * The user starts planning for US-only, then at turn 7 reveals they need to
 * add Canada and Mexico to support new retail distribution.
 *
 * The agent MUST:
 * 1. Acknowledge the geography expansion explicitly
 * 2. Recalculate reach estimates and budget allocation by market
 * 3. Explain what adding markets means for budget efficiency and complexity
 * 4. Recommend market prioritization and allocation strategy
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for geography changes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoExpansionChangeContext = exports.geoExpansionChangeScenario = exports.geoExpansionPersona = void 0;
/**
 * Retail brand expanding internationally
 */
exports.geoExpansionPersona = {
    id: "geo-expansion-retail-director",
    name: "Carlos",
    title: "Director of Marketing, North America",
    company: "ActiveWear Pro",
    industry: "Retail - Athletic Apparel",
    sophisticationLevel: "intermediate",
    knownData: {
        hasObjective: true,
        objective: "Drive retail traffic and online sales for athletic apparel line",
        hasVolume: true,
        volumeTarget: 500000,
        volumeUnit: "store visits + online conversions",
        hasBudget: true,
        budget: 2500000,
        hasLTV: true,
        ltv: 180,
        hasCAC: false,
        hasMargin: true,
        margin: 0.55,
        hasAudienceDefinition: true,
        audienceDescription: "Active adults 25-45, fitness enthusiasts, mid-to-high household income",
        hasGeography: true,
        geography: ["US"], // Initial - will expand mid-conversation
        hasChannelPreferences: false,
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.2,
        verbosity: "balanced",
        skipTendency: 0.1,
        pushbackFrequency: 0.15,
        providesUnsolicitedInfo: true,
        objectionPatterns: [],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: ["ROAS", "CAC", "LTV", "CPA", "AOV"],
        preferredTerms: {
            customers: "customers",
            budget: "media spend",
            goal: "target",
            success: "sales growth",
        },
        avoidedTerms: [],
        samplePhrases: [
            "We have $2.5M for media this year",
            "Focused on the US market",
            "Need to drive both online and in-store",
            "Our core demo is active adults",
            "Average order value is around $180",
        ],
    },
    responseStyle: {
        typicalLength: "medium",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Data change: Geography expands from US-only to US + Canada + Mexico at turn 7
 */
const geoExpansionChange = {
    triggerTurn: 7,
    field: "geography",
    oldValue: ["US"],
    newValue: ["US", "Canada", "Mexico"],
    userMessage: "Update on scope - I just found out we're getting distribution in Canada and Mexico starting next quarter. " +
        "We need to include both markets in this media plan. " +
        "Canada should probably get more focus than Mexico since it's a more established market for us. " +
        "How does this change things?",
    expectedBehavior: {
        acknowledges: true,
        recalculates: true,
        explainsImpact: true,
        recommendsAction: true,
    },
};
/**
 * Geography Expansion Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for geography changes
 */
exports.geoExpansionChangeScenario = {
    id: "geo-expansion-change",
    name: "Geography Expansion Change",
    category: "reforecasting",
    description: "Tests proactive reforecasting when user reveals geography expansion mid-conversation. " +
        "Agent MUST recalculate allocations, explain complexity, and recommend market prioritization.",
    persona: exports.geoExpansionPersona,
    openingMessage: "Hi, I'm Director of Marketing for ActiveWear Pro, an athletic apparel brand. " +
        "I need to build a media plan for next year. We have $2.5M budget and want to drive " +
        "500,000 store visits and online conversions combined. Currently planning for the US market. " +
        "Our target is active adults 25-45.",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 40,
    minTurns: 14,
    minExpectedTurns: 18,
    // Data changes to inject mid-conversation
    dataChanges: [geoExpansionChange],
    kbInjectionMap: {
        1: ["MPA_Supporting_Instructions_v5_5.txt"],
        2: [
            "MPA_Supporting_Instructions_v5_5.txt",
            "MPA_Expert_Lens_Budget_Allocation_v5_5.txt",
        ],
        3: [
            "MPA_Expert_Lens_Audience_Strategy_v5_5.txt",
            "MPA_Implications_Audience_Targeting_v5_5.txt",
        ],
        4: [
            "MPA_Geography_DMA_Planning_v5_5.txt",
            "MPA_Implications_Budget_Decisions_v5_5.txt",
        ],
        5: ["MPA_Expert_Lens_Budget_Allocation_v5_5.txt"],
        6: ["MPA_Expert_Lens_Channel_Mix_v5_5.txt"],
        7: [
            "MPA_Geography_DMA_Planning_v5_5.txt",
            "MPA_Implications_Channel_Shifts_v5_5.txt",
        ],
    },
    expectedEvents: [
        {
            type: "geo_strategy_developed",
            description: "Agent develops US-focused strategy",
        },
        {
            type: "data_change_received",
            description: "User reveals Canada and Mexico need to be added at turn 7",
        },
        {
            type: "reforecast_triggered",
            description: "Agent recalculates budget allocation across 3 markets",
        },
        {
            type: "impact_explained",
            description: "Agent explains complexity and efficiency impact of expansion",
        },
        {
            type: "action_recommended",
            description: "Agent recommends market prioritization and allocation",
        },
    ],
    failureConditions: [
        {
            id: "ignored-geo-expansion",
            description: "Agent continues with US-only plan after user announced expansion",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.30,
            terminateOnDetect: false,
        },
        {
            id: "no-market-allocation",
            description: "Agent acknowledged expansion but did not provide market-level allocations",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.20,
            terminateOnDetect: false,
        },
        {
            id: "equal-allocation-without-rationale",
            description: "Agent split budget equally without considering market differences",
            type: "custom_pattern",
            severity: "warning",
            scorePenalty: 0.10,
            terminateOnDetect: false,
        },
        {
            id: "interrogation-without-teaching",
            description: "Agent asks 3+ questions in a row without explaining importance",
            type: "excessive_questions",
            severity: "major",
            scorePenalty: 0.1,
            terminateOnDetect: false,
        },
    ],
    successCriteria: {
        minimumOverallScore: 0.75,
        requiredStepsComplete: [1, 2, 3, 4, 5],
        noCriticalFailures: true,
        minimumTurnScores: {
            "reforecasting-quality": 0.7,
            "teaching-behavior": 0.6,
            "geographic-strategy": 0.7,
        },
        customCriteria: [
            {
                name: "geo-expansion-acknowledged",
                description: "Agent explicitly acknowledged the geography expansion",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const acknowledgmentPatterns = [
                        /(?:canada|mexico|north america)/i,
                        /(?:three|3).*(?:markets?|countries?|regions?)/i,
                        /(?:expand|adding|including).*(?:canada|mexico)/i,
                        /(?:international|cross-border|multi-market)/i,
                    ];
                    return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "market-allocation-provided",
                description: "Agent provided budget allocation by market",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const allocationPatterns = [
                        /(?:us|united states).*(?:\$|%|percent|allocation)/i,
                        /(?:canada).*(?:\$|%|percent|allocation)/i,
                        /(?:mexico).*(?:\$|%|percent|allocation)/i,
                        /(?:allocat|split|distribut).*(?:across|between|by).*(?:market|countr|region)/i,
                    ];
                    // Need at least 2 of these patterns to indicate proper allocation
                    const matchCount = allocationPatterns.filter((p) => p.test(postChangeResponses)).length;
                    return matchCount >= 2;
                },
            },
            {
                name: "complexity-explained",
                description: "Agent explained the complexity of multi-market planning",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const complexityPatterns = [
                        /(?:different|varies|vary).*(?:market|country|region)/i,
                        /(?:cpm|cost|efficiency).*(?:different|varies|higher|lower)/i,
                        /(?:media landscape|channel availability|platform)/i,
                        /(?:currency|language|localization|creative)/i,
                        /(?:complexity|consideration|factor)/i,
                    ];
                    return complexityPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "prioritization-recommended",
                description: "Agent recommended market prioritization (Canada > Mexico)",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const prioritizationPatterns = [
                        /(?:canada).*(?:priority|focus|larger|more|primary)/i,
                        /(?:mexico).*(?:secondary|smaller|test|less)/i,
                        /(?:prioritiz|weight|emphasis).*(?:canada|established)/i,
                        /(?:recommend|suggest).*(?:canada|us).*(?:focus|priority)/i,
                    ];
                    return prioritizationPatterns.some((p) => p.test(postChangeResponses));
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
exports.geoExpansionChangeContext = {
    budget: 2500000,
    funnel: "consideration",
    kpiAggressiveness: "moderate",
    userSophistication: "medium",
};
exports.default = exports.geoExpansionChangeScenario;
//# sourceMappingURL=geo-expansion-change.js.map