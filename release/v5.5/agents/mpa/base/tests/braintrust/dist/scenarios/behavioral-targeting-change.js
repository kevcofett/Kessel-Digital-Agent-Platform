"use strict";
/**
 * Behavioral Targeting Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation behavioral targeting change.
 * The user starts planning for broad "fitness enthusiasts", then at turn 7 reveals
 * they want to target specific behaviors: marathon runners preparing for races.
 *
 * The agent MUST:
 * 1. Acknowledge the behavioral targeting refinement explicitly
 * 2. Recalculate audience size and efficiency estimates
 * 3. Explain what narrower behavioral targeting means for reach and cost
 * 4. Recommend targeting approach and channels best for behavioral signals
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for behavioral targeting changes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.behavioralTargetingChangeContext = exports.behavioralTargetingChangeScenario = exports.behavioralTargetingPersona = void 0;
/**
 * Sports nutrition marketer with evolving behavioral focus
 */
exports.behavioralTargetingPersona = {
    id: "behavioral-targeting-nutrition-director",
    name: "Amanda",
    title: "Director of Digital Marketing",
    company: "EnduraFuel Nutrition",
    industry: "Sports Nutrition - Endurance",
    sophisticationLevel: "advanced",
    knownData: {
        hasObjective: true,
        objective: "Drive trial and subscription for endurance nutrition products",
        hasVolume: true,
        volumeTarget: 50000,
        volumeUnit: "new subscribers",
        hasBudget: true,
        budget: 800000,
        hasLTV: true,
        ltv: 420,
        hasCAC: false,
        hasMargin: true,
        margin: 0.62,
        hasAudienceDefinition: true,
        audienceDescription: "Fitness enthusiasts 25-55 interested in health and performance", // Initial broad
        hasGeography: true,
        geography: ["US"],
        hasChannelPreferences: true,
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.15,
        verbosity: "detailed",
        skipTendency: 0.05,
        pushbackFrequency: 0.2,
        providesUnsolicitedInfo: true,
        objectionPatterns: ["we need to be precise with targeting"],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: ["CAC", "LTV", "ROAS", "CPA", "CPL"],
        preferredTerms: {
            customers: "subscribers",
            budget: "media investment",
            goal: "subscriber target",
            success: "subscriber growth",
        },
        avoidedTerms: [],
        samplePhrases: [
            "We have $800K for paid media",
            "Goal is 50K new subscribers",
            "LTV is around $420 over 2 years",
            "Targeting fitness enthusiasts broadly",
            "We're a subscription model",
        ],
    },
    responseStyle: {
        typicalLength: "long",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Data change: Behavioral targeting narrows significantly at turn 7
 */
const behavioralTargetingChange = {
    triggerTurn: 7,
    field: "behavioralTargeting",
    oldValue: { interest: "fitness enthusiasts", specificity: "broad" },
    newValue: {
        interest: "marathon runners in race preparation",
        specificity: "narrow",
        behaviors: [
            "registered for upcoming marathon",
            "purchased running gear recently",
            "using running apps like Strava",
            "following running events/content",
        ],
    },
    userMessage: "Actually, I want to narrow our targeting significantly. " +
        "Instead of broad fitness enthusiasts, we should focus specifically on marathon runners who are actively preparing for races. " +
        "These are people registered for upcoming marathons, using apps like Strava, recently bought running gear, and following marathon content. " +
        "Our product is specifically designed for endurance training, so this is our core customer. How does this change things?",
    expectedBehavior: {
        acknowledges: true,
        recalculates: true,
        explainsImpact: true,
        recommendsAction: true,
    },
};
/**
 * Behavioral Targeting Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for behavioral targeting changes
 */
exports.behavioralTargetingChangeScenario = {
    id: "behavioral-targeting-change",
    name: "Behavioral Targeting Change",
    category: "reforecasting",
    description: "Tests proactive reforecasting when user reveals narrow behavioral targeting mid-conversation. " +
        "Agent MUST recalculate audience/efficiency, explain trade-offs, and recommend targeting approach.",
    persona: exports.behavioralTargetingPersona,
    openingMessage: "Hi, I'm Director of Digital Marketing at EnduraFuel Nutrition. We sell subscription-based " +
        "endurance nutrition products. I need a media plan with $800K budget to acquire 50K new subscribers. " +
        "LTV is about $420. Initially targeting fitness enthusiasts 25-55 across the US.",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 40,
    minTurns: 14,
    minExpectedTurns: 18,
    // Data changes to inject mid-conversation
    dataChanges: [behavioralTargetingChange],
    kbInjectionMap: {
        1: ["MPA_Supporting_Instructions_v5_5.txt"],
        2: [
            "MPA_Supporting_Instructions_v5_5.txt",
            "MPA_Expert_Lens_Budget_Allocation_v5_5.txt",
            "MPA_Calculation_Display_v5_5.txt",
        ],
        3: [
            "MPA_Expert_Lens_Audience_Strategy_v5_5.txt",
            "MPA_Implications_Audience_Targeting_v5_5.txt",
        ],
        4: ["MPA_Geography_DMA_Planning_v5_5.txt"],
        5: ["MPA_Expert_Lens_Budget_Allocation_v5_5.txt"],
        6: ["MPA_Expert_Lens_Channel_Mix_v5_5.txt"],
        7: [
            "MPA_Expert_Lens_Audience_Strategy_v5_5.txt",
            "MPA_Implications_Audience_Targeting_v5_5.txt",
        ],
    },
    expectedEvents: [
        {
            type: "audience_strategy_developed",
            description: "Agent develops broad fitness enthusiast strategy",
        },
        {
            type: "data_change_received",
            description: "User reveals narrow marathon runner targeting at turn 7",
        },
        {
            type: "reforecast_triggered",
            description: "Agent recalculates audience size and efficiency",
        },
        {
            type: "impact_explained",
            description: "Agent explains reach/cost trade-offs of narrower targeting",
        },
        {
            type: "action_recommended",
            description: "Agent recommends behavioral targeting approach and channels",
        },
    ],
    failureConditions: [
        {
            id: "ignored-behavioral-change",
            description: "Agent continues with broad fitness targeting after user narrowed to marathon runners",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.30,
            terminateOnDetect: false,
        },
        {
            id: "no-audience-size-discussion",
            description: "Agent did not address reduced audience size from narrower targeting",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.20,
            terminateOnDetect: false,
        },
        {
            id: "no-targeting-approach",
            description: "Agent did not recommend how to reach the specific behavioral audience",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.15,
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
            "audience-strategy": 0.7,
        },
        customCriteria: [
            {
                name: "behavioral-targeting-acknowledged",
                description: "Agent explicitly acknowledged the marathon runner focus",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const acknowledgmentPatterns = [
                        /(?:marathon|race|endurance runner)/i,
                        /(?:narrow|specific|precise).*(?:target|audience)/i,
                        /(?:behavioral|behavior-based|intent)/i,
                        /(?:strava|running app|running gear)/i,
                    ];
                    return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "audience-size-addressed",
                description: "Agent addressed the reduced audience size",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const audienceSizePatterns = [
                        /(?:smaller|narrower|reduced).*(?:audience|pool|reach)/i,
                        /(?:audience|reach|pool).*(?:smaller|limited|reduced)/i,
                        /(?:fewer|less).*(?:people|users|prospects)/i,
                        /(?:niche|specific|targeted).*(?:segment|audience)/i,
                    ];
                    return audienceSizePatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "efficiency-trade-off-explained",
                description: "Agent explained efficiency trade-offs of narrow targeting",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const tradeoffPatterns = [
                        /(?:higher|increased).*(?:cpm|cost|cpa)/i,
                        /(?:lower|reduced).*(?:reach|scale)/i,
                        /(?:trade-?off|balance|exchange)/i,
                        /(?:conversion|intent|quality).*(?:higher|better|stronger)/i,
                        /(?:quality|conversion).*(?:vs|versus|over).*(?:quantity|reach)/i,
                    ];
                    return tradeoffPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "targeting-approach-recommended",
                description: "Agent recommended specific targeting tactics",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const targetingPatterns = [
                        /(?:first.?party|custom audience|lookalike)/i,
                        /(?:contextual|content targeting|interest)/i,
                        /(?:app|device|purchase).*(?:data|signal|targeting)/i,
                        /(?:partner|data provider|segment)/i,
                        /(?:running|marathon|endurance).*(?:site|content|publication)/i,
                    ];
                    return targetingPatterns.some((p) => p.test(postChangeResponses));
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
exports.behavioralTargetingChangeContext = {
    budget: 800000,
    funnel: "performance",
    kpiAggressiveness: "moderate",
    userSophistication: "high",
};
exports.default = exports.behavioralTargetingChangeScenario;
//# sourceMappingURL=behavioral-targeting-change.js.map