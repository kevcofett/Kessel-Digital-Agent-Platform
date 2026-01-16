/**
 * Demographic Shift Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation demographic change.
 * The user starts planning for Millennials (25-40), then at turn 8 reveals
 * research shows Gen Z (18-27) is the actual growth opportunity.
 *
 * The agent MUST:
 * 1. Acknowledge the demographic shift explicitly
 * 2. Recalculate channel recommendations for the new demo
 * 3. Explain what targeting Gen Z vs Millennials means for channel mix
 * 4. Recommend specific channel and creative adjustments
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for demographic targeting changes.
 */
/**
 * Fashion brand marketer with evolving target demo
 */
export const demographicShiftPersona = {
    id: "demographic-shift-fashion-manager",
    name: "Taylor",
    title: "Marketing Manager",
    company: "UrbanStyle Collective",
    industry: "Fashion Retail - Streetwear",
    sophisticationLevel: "intermediate",
    knownData: {
        hasObjective: true,
        objective: "Drive brand awareness and sales for streetwear line",
        hasVolume: true,
        volumeTarget: 100000,
        volumeUnit: "new customers",
        hasBudget: true,
        budget: 1500000,
        hasLTV: true,
        ltv: 350,
        hasCAC: false,
        hasMargin: true,
        margin: 0.58,
        hasAudienceDefinition: true,
        audienceDescription: "Millennials 25-40 interested in streetwear and urban fashion", // Initial - will change
        hasGeography: true,
        geography: ["US - Top 25 DMAs"],
        hasChannelPreferences: false,
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.25,
        verbosity: "balanced",
        skipTendency: 0.15,
        pushbackFrequency: 0.1,
        providesUnsolicitedInfo: true,
        objectionPatterns: [],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: ["CAC", "LTV", "ROAS", "CPM", "CTR"],
        preferredTerms: {
            customers: "customers",
            budget: "budget",
            goal: "target",
            success: "growth",
        },
        avoidedTerms: [],
        samplePhrases: [
            "We have $1.5M to work with",
            "Targeting Millennials who love streetwear",
            "Need 100K new customers this year",
            "LTV is about $350 per customer",
            "Focused on major metros",
        ],
    },
    responseStyle: {
        typicalLength: "medium",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Data change: Target demographic shifts from Millennials to Gen Z at turn 8
 */
const demographicShiftChange = {
    triggerTurn: 8,
    field: "demographics",
    oldValue: { ageRange: "25-40", generation: "Millennials" },
    newValue: { ageRange: "18-27", generation: "Gen Z" },
    userMessage: "Hold on - I just got the results from our consumer research study. " +
        "Turns out our biggest growth opportunity isn't Millennials, it's Gen Z (18-27). " +
        "They're driving all the streetwear trends and have higher purchase intent for our brand. " +
        "We need to pivot our targeting to Gen Z instead. How does this change our media plan?",
    expectedBehavior: {
        acknowledges: true,
        recalculates: true,
        explainsImpact: true,
        recommendsAction: true,
    },
};
/**
 * Demographic Shift Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for demographic changes
 */
export const demographicShiftChangeScenario = {
    id: "demographic-shift-change",
    name: "Demographic Shift Change",
    category: "reforecasting",
    description: "Tests proactive reforecasting when user reveals demographic target shift mid-conversation. " +
        "Agent MUST recalculate channel mix, explain generational differences, and recommend adjustments.",
    persona: demographicShiftPersona,
    openingMessage: "Hey, I'm Marketing Manager at UrbanStyle Collective, a streetwear brand. " +
        "Need help building our media plan for the year. Budget is $1.5M, goal is 100K new customers. " +
        "We're targeting Millennials 25-40 who are into streetwear and urban fashion. " +
        "LTV is around $350. Focused on top 25 DMAs.",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 40,
    minTurns: 14,
    minExpectedTurns: 18,
    // Data changes to inject mid-conversation
    dataChanges: [demographicShiftChange],
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
        4: ["MPA_Geography_DMA_Planning_v5_5.txt"],
        5: ["MPA_Expert_Lens_Budget_Allocation_v5_5.txt"],
        6: [
            "MPA_Expert_Lens_Channel_Mix_v5_5.txt",
            "MPA_Implications_Channel_Shifts_v5_5.txt",
        ],
        7: ["MPA_Expert_Lens_Channel_Mix_v5_5.txt"],
    },
    expectedEvents: [
        {
            type: "audience_strategy_developed",
            description: "Agent develops Millennial-focused strategy",
        },
        {
            type: "data_change_received",
            description: "User reveals pivot to Gen Z targeting at turn 8",
        },
        {
            type: "reforecast_triggered",
            description: "Agent recalculates channel mix for Gen Z",
        },
        {
            type: "impact_explained",
            description: "Agent explains channel/creative differences for Gen Z",
        },
        {
            type: "action_recommended",
            description: "Agent recommends specific Gen Z-focused channels",
        },
    ],
    failureConditions: [
        {
            id: "ignored-demo-shift",
            description: "Agent continues with Millennial strategy after user pivoted to Gen Z",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.30,
            terminateOnDetect: false,
        },
        {
            id: "no-channel-adjustment",
            description: "Agent acknowledged shift but did not adjust channel recommendations",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.20,
            terminateOnDetect: false,
        },
        {
            id: "same-channels-different-demo",
            description: "Agent kept exact same channel mix despite major demographic change",
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
                name: "demo-shift-acknowledged",
                description: "Agent explicitly acknowledged the shift to Gen Z",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const acknowledgmentPatterns = [
                        /(?:gen z|generation z|18-27|18 to 27)/i,
                        /(?:pivot|shift|chang).*(?:target|audience|demo)/i,
                        /(?:younger|teen|young adult)/i,
                        /(?:instead of|rather than|from).*(?:millennial)/i,
                    ];
                    return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "gen-z-channels-recommended",
                description: "Agent recommended Gen Z-appropriate channels",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Gen Z-heavy channels
                    const genZChannelPatterns = [
                        /(?:tiktok|snapchat|twitch)/i,
                        /(?:youtube|shorts|reels)/i,
                        /(?:influencer|creator|ugc)/i,
                        /(?:gaming|esports)/i,
                        /(?:social-first|mobile-first)/i,
                    ];
                    return genZChannelPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "generational-differences-explained",
                description: "Agent explained Gen Z vs Millennial media differences",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const differencePatterns = [
                        /(?:gen z).*(?:different|prefer|consume|engage)/i,
                        /(?:millennial).*(?:vs|versus|compared|different)/i,
                        /(?:short.?form|authentic|creator|snackable)/i,
                        /(?:attention span|media consumption|behavior)/i,
                        /(?:platform preference|channel preference)/i,
                    ];
                    return differencePatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "creative-considerations-mentioned",
                description: "Agent mentioned creative/messaging considerations for Gen Z",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const creativePatterns = [
                        /(?:creative|content|messaging).*(?:adjust|adapt|change)/i,
                        /(?:authentic|organic|native|ugc)/i,
                        /(?:tone|voice|style).*(?:resonate|connect|appeal)/i,
                        /(?:influencer|creator|partnership)/i,
                    ];
                    return creativePatterns.some((p) => p.test(postChangeResponses));
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
export const demographicShiftChangeContext = {
    budget: 1500000,
    funnel: "awareness",
    kpiAggressiveness: "moderate",
    userSophistication: "medium",
};
export default demographicShiftChangeScenario;
//# sourceMappingURL=demographic-shift-change.js.map