"use strict";
/**
 * Mass National Simplicity Scenario
 *
 * Tests the agent's ability to handle a simple, broad-reach national campaign
 * with minimal complexity. This is the opposite of precision targeting.
 *
 * This scenario specifically tests:
 * 1. Agent recognizes when simplicity is appropriate
 * 2. Agent doesn't over-complicate a straightforward mass-market campaign
 * 3. Agent recommends reach/frequency over precision for awareness goals
 * 4. Agent correctly advises on national vs regional tradeoffs
 * 5. Agent focuses on broad demographic buckets, not micro-segmentation
 * 6. Agent discusses CPM efficiency for mass reach
 *
 * Expected Quality Behaviors:
 * - Agent should NOT try to micro-segment a mass audience
 * - Agent SHOULD focus on reach, frequency, and awareness metrics
 * - Agent SHOULD recommend broad-reach channels (TV, mass display, YouTube)
 * - Agent MUST NOT obsess over CAC/conversion for awareness campaign
 * - Agent SHOULD discuss national media buying efficiency
 * - Agent SHOULD keep geographic strategy simple (national buy)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.massNationalSimplicityContext = exports.massNationalSimplicityScenario = exports.massNationalPersona = void 0;
/**
 * Brand marketing director with simple national campaign needs
 */
exports.massNationalPersona = {
    id: "mass-national-brand",
    name: "Michelle",
    title: "VP of Brand Marketing",
    company: "FreshBite Snacks",
    industry: "CPG - Food & Beverage",
    sophisticationLevel: "intermediate",
    knownData: {
        hasObjective: true,
        objective: "Build national brand awareness for new snack line launch",
        hasVolume: false, // Awareness campaign - no direct volume target
        volumeTarget: undefined,
        volumeUnit: undefined,
        hasBudget: true,
        budget: 8000000,
        hasLTV: false,
        hasCAC: false,
        hasMargin: true,
        margin: 0.42,
        hasAudienceDefinition: true,
        audienceDescription: "Adults 18-54, snack purchasers, national",
        hasGeography: true,
        geography: ["United States - National"],
        hasChannelPreferences: true,
        preferredChannels: ["TV", "Connected TV", "YouTube", "Display"],
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.15,
        verbosity: "balanced",
        skipTendency: 0.2,
        pushbackFrequency: 0.1,
        providesUnsolicitedInfo: true,
        objectionPatterns: [],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: ["CPM", "GRP", "TRP", "CTV", "OTT", "SOV"],
        preferredTerms: {
            customers: "consumers",
            budget: "media budget",
            goal: "awareness goal",
            success: "brand lift",
        },
        avoidedTerms: ["CAC", "ROAS", "conversion rate"],
        samplePhrases: [
            "We're launching nationally across the US",
            "Target is adults 18-54 - pretty broad",
            "Main goal is awareness and consideration",
            "We want to reach as many snack buyers as possible",
            "This is a brand campaign, not direct response",
            "We're measuring success through brand lift studies",
        ],
    },
    responseStyle: {
        typicalLength: "medium",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Mass National Simplicity Test Scenario
 */
exports.massNationalSimplicityScenario = {
    id: "mass-national-simplicity",
    name: "Mass National Campaign - Simplicity Test",
    category: "phase1-quality",
    description: "Tests agent's ability to handle a simple broad-reach national campaign without " +
        "over-complicating. Agent should recognize when simplicity is appropriate and " +
        "focus on reach/frequency rather than precision targeting.",
    persona: exports.massNationalPersona,
    openingMessage: "Hi! I'm the VP of Brand Marketing at FreshBite Snacks. We're launching a new snack " +
        "line nationally and need to build a media plan to drive awareness. Budget is $8M. " +
        "Target audience is pretty broad - adults 18-54 who buy snacks. We want to reach as " +
        "many people as possible across the entire US. This is a brand awareness campaign, " +
        "not direct response. We'll measure success through brand lift studies.",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
    maxTurns: 35,
    minTurns: 12,
    minExpectedTurns: 14,
    kbInjectionMap: {
        1: ["MPA_Supporting_Instructions_v5_5.txt"],
        2: [
            "MPA_Supporting_Instructions_v5_5.txt",
            "MPA_Calculation_Display_v5_5.txt",
        ],
        3: [
            "MPA_Expert_Lens_Audience_Strategy_v5_5.txt",
            "MPA_Implications_Audience_Targeting_v5_5.txt",
        ],
        4: ["MPA_Geography_DMA_Planning_v5_5.txt"],
        5: [
            "MPA_Expert_Lens_Budget_Allocation_v5_5.txt",
            "MPA_Implications_Budget_Decisions_v5_5.txt",
        ],
        6: ["MPA_Conversation_Examples_v5_5.txt"],
        7: [
            "MPA_Expert_Lens_Channel_Mix_v5_5.txt",
            "MPA_Implications_Channel_Shifts_v5_5.txt",
        ],
        8: [
            "MPA_Expert_Lens_Measurement_Attribution_v5_5.txt",
            "MPA_Implications_Measurement_Choices_v5_5.txt",
        ],
    },
    expectedEvents: [
        {
            type: "step_transition",
            description: "Agent moves efficiently through steps for simple campaign",
        },
        {
            type: "benchmark_cited",
            description: "Agent cites CPM benchmarks for mass reach",
        },
    ],
    failureConditions: [
        {
            id: "over-segmentation",
            description: "Agent tries to micro-segment a mass audience when client wants broad reach",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.15,
            terminateOnDetect: false,
        },
        {
            id: "cac-obsession-awareness",
            description: "Agent obsesses over CAC/ROAS for brand awareness campaign",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.15,
            terminateOnDetect: false,
        },
        {
            id: "unnecessary-geo-complexity",
            description: "Agent introduces DMA-level complexity when national buy is appropriate",
            type: "custom_pattern",
            severity: "warning",
            scorePenalty: 0.1,
            terminateOnDetect: false,
        },
        {
            id: "wrong-metrics-focus",
            description: "Agent focuses on conversion metrics instead of reach/frequency/awareness",
            type: "custom_pattern",
            severity: "warning",
            scorePenalty: 0.1,
            terminateOnDetect: false,
        },
    ],
    successCriteria: {
        minimumOverallScore: 0.70,
        requiredStepsComplete: [1, 2, 3, 4, 5, 6, 7, 8],
        noCriticalFailures: true,
        minimumTurnScores: {
            "teaching-behavior": 0.6,
            "adaptive-sophistication": 0.7,
            "step-boundary": 0.7,
        },
        customCriteria: [
            {
                name: "reach-frequency-focus",
                description: "Agent focused on reach and frequency metrics",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const reachFrequencyPatterns = [
                        /reach/i,
                        /frequency/i,
                        /impression/i,
                        /grp|gross rating point/i,
                        /trp|target rating point/i,
                        /share of voice|sov/i,
                    ];
                    const metricsFound = reachFrequencyPatterns.filter((p) => p.test(allResponses)).length;
                    return metricsFound >= 3;
                },
            },
            {
                name: "no-cac-obsession",
                description: "Agent did not obsess over CAC for awareness campaign",
                evaluator: (result) => {
                    let cacMentions = 0;
                    for (const turn of result.turns) {
                        const cacPatterns = [
                            /(?:what|target|goal).*(?:cac|cost per acquisition)/i,
                            /(?:cac|cost per acquisition).*(?:target|goal)/i,
                            /roas.*(?:target|goal|what)/i,
                        ];
                        if (cacPatterns.some((p) => p.test(turn.agentResponse))) {
                            cacMentions++;
                        }
                    }
                    return cacMentions <= 1;
                },
            },
            {
                name: "simple-geo-recommendation",
                description: "Agent recommended simple national approach",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const nationalPatterns = [
                        /national.*(?:buy|campaign|reach|coverage)/i,
                        /(?:across|entire).*(?:us|united states|country)/i,
                        /(?:broad|mass).*(?:reach|coverage|distribution)/i,
                    ];
                    return nationalPatterns.some((p) => p.test(allResponses));
                },
            },
            {
                name: "brand-metrics-recommended",
                description: "Agent recommended appropriate brand awareness metrics",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const brandMetricPatterns = [
                        /brand.*(?:lift|awareness|recall|consideration)/i,
                        /(?:ad|advertising).*(?:recall|awareness)/i,
                        /(?:unaided|aided).*(?:awareness|recall)/i,
                        /brand.*(?:study|survey|measurement)/i,
                    ];
                    const metricsFound = brandMetricPatterns.filter((p) => p.test(allResponses)).length;
                    return metricsFound >= 2;
                },
            },
            {
                name: "broad-reach-channels",
                description: "Agent recommended appropriate broad-reach channels",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const broadReachChannels = [
                        /(?:linear|broadcast|cable).*tv/i,
                        /ctv|connected tv|ott/i,
                        /youtube/i,
                        /(?:programmatic|mass).*display/i,
                    ];
                    const channelsFound = broadReachChannels.filter((p) => p.test(allResponses)).length;
                    return channelsFound >= 2;
                },
            },
            {
                name: "efficient-progression",
                description: "Agent moved efficiently without over-complicating",
                evaluator: (result) => {
                    // For a simple national campaign, should complete in reasonable turns
                    // 8 steps in 12-30 turns is efficient
                    return result.totalTurns <= 30;
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
exports.massNationalSimplicityContext = {
    budget: 8000000,
    funnel: "awareness",
    kpiAggressiveness: "conservative",
    userSophistication: "medium",
};
exports.default = exports.massNationalSimplicityScenario;
//# sourceMappingURL=mass-national-simplicity.js.map