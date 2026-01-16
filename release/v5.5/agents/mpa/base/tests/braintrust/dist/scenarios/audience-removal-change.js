/**
 * Audience Removal Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation audience reduction.
 * The user starts planning for three audience segments, then at turn 8 reveals
 * they need to cut one segment due to budget constraints.
 *
 * The agent MUST:
 * 1. Acknowledge the audience reduction explicitly
 * 2. Recalculate budget reallocation to remaining segments
 * 3. Explain what removing a segment enables for remaining ones
 * 4. Recommend which segment to prioritize and why
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for audience consolidation.
 */
/**
 * Automotive marketer consolidating audience segments
 */
export const audienceRemovalPersona = {
    id: "audience-removal-auto-director",
    name: "Michael",
    title: "Director of Marketing",
    company: "ElectraDrive Motors",
    industry: "Automotive - Electric Vehicles",
    sophisticationLevel: "intermediate",
    knownData: {
        hasObjective: true,
        objective: "Drive test drives and deposits for new EV model",
        hasVolume: true,
        volumeTarget: 15000,
        volumeUnit: "test drives",
        hasBudget: true,
        budget: 4000000,
        hasLTV: true,
        ltv: 5500,
        hasCAC: false,
        hasMargin: true,
        margin: 0.22,
        hasAudienceDefinition: true,
        audienceDescription: "Three segments: (1) Eco-conscious early adopters 25-45, " +
            "(2) Luxury buyers 45-65 switching from German sedans, " +
            "(3) Tech enthusiasts who prioritize features", // Initial 3 segments
        hasGeography: true,
        geography: ["US - California, Texas, Florida, New York, Washington"],
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
        knownAcronyms: ["CPA", "ROAS", "LTV", "CAC", "EV"],
        preferredTerms: {
            customers: "buyers",
            budget: "media budget",
            goal: "target",
            success: "test drives",
        },
        avoidedTerms: [],
        samplePhrases: [
            "We have $4M for the launch campaign",
            "Goal is 15,000 test drives",
            "We're targeting three distinct segments",
            "Average sale value around $5,500 in margin",
            "Focused on key EV markets",
        ],
    },
    responseStyle: {
        typicalLength: "medium",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Data change: One audience segment removed at turn 8
 */
const audienceRemovalChange = {
    triggerTurn: 8,
    field: "audiences",
    oldValue: [
        {
            name: "Eco-conscious Early Adopters",
            demographics: "25-45, environmentally focused",
        },
        {
            name: "Luxury Switchers",
            demographics: "45-65, current German sedan owners",
        },
        {
            name: "Tech Enthusiasts",
            demographics: "30-55, feature-focused buyers",
        },
    ],
    newValue: [
        {
            name: "Eco-conscious Early Adopters",
            demographics: "25-45, environmentally focused",
        },
        {
            name: "Luxury Switchers",
            demographics: "45-65, current German sedan owners",
        },
    ],
    userMessage: "We need to simplify things. After reviewing the budget more closely, we can't effectively " +
        "reach all three segments with $4M. I'm dropping the tech enthusiast segment from our plan. " +
        "Let's focus only on the eco-conscious early adopters and the luxury switchers. " +
        "How does removing that third segment change things? Can we do more with the remaining two?",
    expectedBehavior: {
        acknowledges: true,
        recalculates: true,
        explainsImpact: true,
        recommendsAction: true,
    },
};
/**
 * Audience Removal Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for audience consolidation
 */
export const audienceRemovalChangeScenario = {
    id: "audience-removal-change",
    name: "Audience Removal Change",
    category: "reforecasting",
    description: "Tests proactive reforecasting when user removes audience segment mid-conversation. " +
        "Agent MUST recalculate allocations, explain benefits of consolidation, and recommend prioritization.",
    persona: audienceRemovalPersona,
    openingMessage: "Hi, I'm Director of Marketing at ElectraDrive Motors. We're launching a new EV and " +
        "I need help building a media plan. Budget is $4M, goal is 15,000 test drives. " +
        "We're targeting three segments: eco-conscious early adopters 25-45, luxury buyers 45-65 " +
        "switching from German sedans, and tech enthusiasts who care about features. " +
        "Focused on California, Texas, Florida, New York, and Washington.",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 40,
    minTurns: 14,
    minExpectedTurns: 18,
    // Data changes to inject mid-conversation
    dataChanges: [audienceRemovalChange],
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
            type: "multi_audience_strategy_developed",
            description: "Agent develops 3-segment strategy",
        },
        {
            type: "data_change_received",
            description: "User removes tech enthusiast segment at turn 8",
        },
        {
            type: "reforecast_triggered",
            description: "Agent recalculates for 2-segment approach",
        },
        {
            type: "impact_explained",
            description: "Agent explains benefits of consolidation",
        },
        {
            type: "action_recommended",
            description: "Agent recommends reallocation strategy",
        },
    ],
    failureConditions: [
        {
            id: "ignored-segment-removal",
            description: "Agent continues with 3-segment strategy after user dropped one",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.30,
            terminateOnDetect: false,
        },
        {
            id: "no-reallocation",
            description: "Agent acknowledged removal but did not reallocate budget to remaining segments",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.20,
            terminateOnDetect: false,
        },
        {
            id: "continued-tech-enthusiast-targeting",
            description: "Agent continued recommending tactics for removed segment",
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
                name: "segment-removal-acknowledged",
                description: "Agent explicitly acknowledged removing the tech segment",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const acknowledgmentPatterns = [
                        /(?:remov|drop|eliminat|cut).*(?:tech|third|segment)/i,
                        /(?:two|2).*(?:segment|audience|group)/i,
                        /(?:eco|luxury).*(?:focus|only|remaining)/i,
                        /(?:without|excluding).*(?:tech enthusiast)/i,
                    ];
                    return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "budget-reallocated",
                description: "Agent reallocated budget to remaining segments",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const reallocationPatterns = [
                        /(?:reallocat|redistribut|shift|redirect).*(?:budget|spend)/i,
                        /(?:more|additional|increased).*(?:budget|investment).*(?:eco|luxury)/i,
                        /(?:eco|luxury).*(?:receive|get).*(?:more|larger|additional)/i,
                        /(?:freed up|available|extra).*(?:budget|dollars)/i,
                    ];
                    return reallocationPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "consolidation-benefits-explained",
                description: "Agent explained benefits of audience consolidation",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const benefitPatterns = [
                        /(?:focus|concentrate|dedicate).*(?:resource|budget|effort)/i,
                        /(?:deeper|stronger|better).*(?:reach|penetration|presence)/i,
                        /(?:simplify|simpler|streamline)/i,
                        /(?:higher|greater|improved).*(?:frequency|impact|efficiency)/i,
                        /(?:do more|achieve more|stronger).*(?:remaining|two)/i,
                    ];
                    return benefitPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "prioritization-recommended",
                description: "Agent recommended prioritization between remaining segments",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const prioritizationPatterns = [
                        /(?:recommend|suggest|propose).*(?:prioritiz|focus|weight)/i,
                        /(?:eco|luxury).*(?:primary|secondary|larger share)/i,
                        /(?:split|allocation|ratio).*(?:between|across)/i,
                        /(?:%|percent).*(?:eco|luxury)/i,
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
export const audienceRemovalChangeContext = {
    budget: 4000000,
    funnel: "consideration",
    kpiAggressiveness: "moderate",
    userSophistication: "medium",
};
export default audienceRemovalChangeScenario;
//# sourceMappingURL=audience-removal-change.js.map