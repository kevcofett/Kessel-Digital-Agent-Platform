/**
 * Audience Addition Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation audience addition.
 * The user starts planning for one audience segment, then at turn 8 reveals
 * they need to add a second audience segment with different characteristics.
 *
 * The agent MUST:
 * 1. Acknowledge the additional audience segment explicitly
 * 2. Recalculate budget allocation and reach across both segments
 * 3. Explain what adding a segment means for strategy complexity
 * 4. Recommend approach for multi-audience planning
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for audience expansion.
 */
/**
 * Financial services marketer adding audience segment
 */
export const audienceAdditionPersona = {
    id: "audience-addition-finserv-vp",
    name: "Christine",
    title: "VP of Marketing",
    company: "WealthPath Advisors",
    industry: "Financial Services - Wealth Management",
    sophisticationLevel: "advanced",
    knownData: {
        hasObjective: true,
        objective: "Drive qualified leads for wealth management services",
        hasVolume: true,
        volumeTarget: 5000,
        volumeUnit: "qualified leads",
        hasBudget: true,
        budget: 2000000,
        hasLTV: true,
        ltv: 15000,
        hasCAC: false,
        hasMargin: true,
        margin: 0.45,
        hasAudienceDefinition: true,
        audienceDescription: "High-net-worth individuals 55+ approaching or in retirement", // Initial single segment
        hasGeography: true,
        geography: ["US - Top 30 Wealth Markets"],
        hasChannelPreferences: false,
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.15,
        verbosity: "detailed",
        skipTendency: 0.05,
        pushbackFrequency: 0.2,
        providesUnsolicitedInfo: true,
        objectionPatterns: ["compliance requires", "we need to be careful"],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: ["AUM", "HNW", "UHNW", "CPL", "CAC", "LTV"],
        preferredTerms: {
            customers: "clients",
            budget: "media investment",
            goal: "lead target",
            success: "AUM growth",
        },
        avoidedTerms: [],
        samplePhrases: [
            "Our media budget is $2M",
            "We need 5,000 qualified leads",
            "Target is high-net-worth retirees",
            "Average client LTV is $15K",
            "We focus on top wealth markets",
        ],
    },
    responseStyle: {
        typicalLength: "long",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Data change: Second audience segment added at turn 8
 */
const audienceAdditionChange = {
    triggerTurn: 8,
    field: "audiences",
    oldValue: [
        {
            name: "Pre-retirees/Retirees",
            demographics: "55+, HNW, $1M+ investable assets",
            focus: "retirement planning, wealth preservation",
        },
    ],
    newValue: [
        {
            name: "Pre-retirees/Retirees",
            demographics: "55+, HNW, $1M+ investable assets",
            focus: "retirement planning, wealth preservation",
        },
        {
            name: "Young Professionals",
            demographics: "30-45, emerging affluent, $250K-$1M assets",
            focus: "wealth building, investment growth, inheritance planning",
        },
    ],
    userMessage: "I need to expand our scope. After our strategy meeting, leadership wants us to also target " +
        "emerging affluent young professionals - people 30-45 with $250K to $1M in investable assets. " +
        "They're focused on wealth building and some are receiving inheritances from their boomer parents. " +
        "This is a completely different audience than our retirees. " +
        "How do we plan for both segments?",
    expectedBehavior: {
        acknowledges: true,
        recalculates: true,
        explainsImpact: true,
        recommendsAction: true,
    },
};
/**
 * Audience Addition Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for audience expansion
 */
export const audienceAdditionChangeScenario = {
    id: "audience-addition-change",
    name: "Audience Addition Change",
    category: "reforecasting",
    description: "Tests proactive reforecasting when user reveals additional audience segment mid-conversation. " +
        "Agent MUST recalculate allocations, explain complexity, and recommend multi-audience approach.",
    persona: audienceAdditionPersona,
    openingMessage: "Hi, I'm VP of Marketing at WealthPath Advisors, a wealth management firm. " +
        "I need to build a media plan to generate 5,000 qualified leads with a $2M budget. " +
        "Our target is high-net-worth individuals 55+ who are approaching or in retirement, " +
        "with $1M+ in investable assets. LTV is around $15K per client. " +
        "We focus on the top 30 wealth markets in the US.",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 40,
    minTurns: 14,
    minExpectedTurns: 18,
    // Data changes to inject mid-conversation
    dataChanges: [audienceAdditionChange],
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
            type: "single_audience_strategy_developed",
            description: "Agent develops strategy for retiree audience",
        },
        {
            type: "data_change_received",
            description: "User reveals second audience segment at turn 8",
        },
        {
            type: "reforecast_triggered",
            description: "Agent recalculates for dual-audience approach",
        },
        {
            type: "impact_explained",
            description: "Agent explains complexity of multi-audience planning",
        },
        {
            type: "action_recommended",
            description: "Agent recommends approach for both segments",
        },
    ],
    failureConditions: [
        {
            id: "ignored-new-audience",
            description: "Agent continues with single audience strategy after user added second segment",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.30,
            terminateOnDetect: false,
        },
        {
            id: "no-segment-allocation",
            description: "Agent acknowledged new segment but did not provide budget allocation",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.20,
            terminateOnDetect: false,
        },
        {
            id: "identical-strategy-both-segments",
            description: "Agent used identical strategy for vastly different age segments",
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
                name: "new-segment-acknowledged",
                description: "Agent explicitly acknowledged the young professional segment",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const acknowledgmentPatterns = [
                        /(?:young|younger|emerging).*(?:professional|affluent)/i,
                        /(?:30|35|40|45).*(?:year|age)/i,
                        /(?:two|2|dual|both).*(?:segment|audience)/i,
                        /(?:wealth building|inheritance|growth)/i,
                    ];
                    return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "segment-allocation-provided",
                description: "Agent provided budget allocation by segment",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const allocationPatterns = [
                        /(?:retiree|55\+|older).*(?:\$|%|percent|allocation)/i,
                        /(?:young|30-45|emerging).*(?:\$|%|percent|allocation)/i,
                        /(?:split|allocat|distribut).*(?:between|across).*(?:segment|audience)/i,
                        /(?:segment|audience).*(?:receive|get|allocat)/i,
                    ];
                    // Need at least 2 of these patterns
                    const matchCount = allocationPatterns.filter((p) => p.test(postChangeResponses)).length;
                    return matchCount >= 2;
                },
            },
            {
                name: "different-channels-by-segment",
                description: "Agent recommended different channels for different segments",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Different channels for different demos
                    const differentiationPatterns = [
                        /(?:retiree|55\+|older).*(?:tv|linear|print|direct)/i,
                        /(?:young|30-45|younger).*(?:social|digital|instagram|linkedin)/i,
                        /(?:different|vary|tailor).*(?:channel|media mix)/i,
                        /(?:age|segment|audience).*(?:prefer|consume|respond)/i,
                    ];
                    return differentiationPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "complexity-acknowledged",
                description: "Agent acknowledged the added complexity of multi-audience",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const complexityPatterns = [
                        /(?:complex|challenge|consideration)/i,
                        /(?:different|distinct|separate).*(?:approach|strategy|creative)/i,
                        /(?:multi-?audience|dual.?segment|two.?audience)/i,
                        /(?:balance|prioritize|weigh)/i,
                    ];
                    return complexityPatterns.some((p) => p.test(postChangeResponses));
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
export const audienceAdditionChangeContext = {
    budget: 2000000,
    funnel: "consideration",
    kpiAggressiveness: "moderate",
    userSophistication: "high",
};
export default audienceAdditionChangeScenario;
//# sourceMappingURL=audience-addition-change.js.map