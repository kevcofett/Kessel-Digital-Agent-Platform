"use strict";
/**
 * Channel Mix Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation channel constraint.
 * The user starts planning with all channels available, then at turn 8 reveals
 * that social media channels (Meta, TikTok) are off the table due to brand safety.
 *
 * The agent MUST:
 * 1. Acknowledge the channel exclusion explicitly
 * 2. Recalculate channel allocations without social
 * 3. Explain what losing social channels means for reach/efficiency
 * 4. Recommend alternative channels to compensate
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for channel mix changes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.channelMixChangeContext = exports.channelMixChangeScenario = exports.channelMixChangePersona = void 0;
/**
 * CPG brand manager with channel constraints
 */
exports.channelMixChangePersona = {
    id: "channel-mix-cpg-manager",
    name: "Jennifer",
    title: "Senior Brand Manager",
    company: "PureLife Organics",
    industry: "Consumer Packaged Goods - Organic Foods",
    sophisticationLevel: "intermediate",
    knownData: {
        hasObjective: true,
        objective: "Launch new organic snack line in target markets",
        hasVolume: true,
        volumeTarget: 2000000,
        volumeUnit: "household reach",
        hasBudget: true,
        budget: 3000000,
        hasLTV: false,
        hasCAC: false,
        hasMargin: true,
        margin: 0.45,
        hasAudienceDefinition: true,
        audienceDescription: "Health-conscious families, 25-54, with household income $75K+, " +
            "interested in organic/natural products",
        hasGeography: true,
        geography: ["US - National"],
        hasChannelPreferences: false, // Open to suggestions initially
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.25,
        verbosity: "balanced",
        skipTendency: 0.1,
        pushbackFrequency: 0.2,
        providesUnsolicitedInfo: true,
        objectionPatterns: ["brand safety is paramount", "legal has concerns"],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: ["CPM", "GRP", "TRP", "SOV", "ROI"],
        preferredTerms: {
            customers: "households",
            budget: "media budget",
            goal: "reach target",
            success: "awareness lift",
        },
        avoidedTerms: [],
        samplePhrases: [
            "We have a $3M media budget for the launch",
            "Need to reach 2 million households",
            "Target is health-conscious families",
            "Brand safety is absolutely critical for us",
            "We're national distribution in major retailers",
        ],
    },
    responseStyle: {
        typicalLength: "medium",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Data change: Social media channels become unavailable at turn 8
 */
const channelExclusionChange = {
    triggerTurn: 8,
    field: "channelExclusions",
    oldValue: [],
    newValue: ["Meta", "Facebook", "Instagram", "TikTok"],
    userMessage: "I need to flag something important - I just got out of a call with our legal and brand safety team. " +
        "We cannot use Meta platforms (Facebook/Instagram) or TikTok for this campaign. " +
        "There have been some brand safety incidents in our category and leadership has banned social media advertising. " +
        "How does this change our plan?",
    expectedBehavior: {
        acknowledges: true,
        recalculates: true,
        explainsImpact: true,
        recommendsAction: true,
    },
};
/**
 * Channel Mix Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for channel constraints
 */
exports.channelMixChangeScenario = {
    id: "channel-mix-change",
    name: "Channel Mix Change",
    category: "reforecasting",
    description: "Tests proactive reforecasting when user reveals channel exclusions mid-conversation. " +
        "Agent MUST recalculate allocations, explain impact, and recommend alternatives.",
    persona: exports.channelMixChangePersona,
    openingMessage: "Hi, I'm a Senior Brand Manager at PureLife Organics. We're launching a new organic snack line " +
        "and I need help building a media plan. Budget is $3M, targeting health-conscious families nationally. " +
        "We need to reach about 2 million households to hit our awareness goals. Open to your channel recommendations.",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 40,
    minTurns: 14,
    minExpectedTurns: 18,
    // Data changes to inject mid-conversation
    dataChanges: [channelExclusionChange],
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
        7: [
            "MPA_Expert_Lens_Channel_Mix_v5_5.txt",
            "MPA_Implications_Channel_Shifts_v5_5.txt",
        ],
    },
    expectedEvents: [
        {
            type: "channel_recommendation",
            description: "Agent recommends initial channel mix including social",
        },
        {
            type: "data_change_received",
            description: "User reveals social channels are off-limits at turn 8",
        },
        {
            type: "reforecast_triggered",
            description: "Agent recalculates channel allocations without social",
        },
        {
            type: "impact_explained",
            description: "Agent explains reach/efficiency impact of losing social",
        },
        {
            type: "action_recommended",
            description: "Agent recommends alternative channels to compensate",
        },
    ],
    failureConditions: [
        {
            id: "ignored-channel-exclusion",
            description: "Agent continues recommending Meta/TikTok after user banned them",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.30,
            terminateOnDetect: false,
        },
        {
            id: "no-recalculation-after-exclusion",
            description: "Agent acknowledged exclusion but did not revise channel allocations",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.20,
            terminateOnDetect: false,
        },
        {
            id: "no-alternative-channels",
            description: "Agent did not recommend alternative channels to replace social",
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
            "channel-strategy": 0.7,
        },
        customCriteria: [
            {
                name: "channel-exclusion-acknowledged",
                description: "Agent explicitly acknowledged the social media ban",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const acknowledgmentPatterns = [
                        /(?:understood|noted|got it).*(?:social|meta|facebook|tiktok)/i,
                        /(?:without|excluding|removing).*(?:social|meta|facebook|tiktok)/i,
                        /(?:brand safety|legal).*(?:concern|restriction|requirement)/i,
                        /(?:can't|won't|unable).*(?:use|include).*(?:social|meta|facebook|tiktok)/i,
                    ];
                    return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "revised-channel-mix",
                description: "Agent provided revised channel mix without social",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Should NOT mention Meta/Facebook/TikTok in positive context
                    const excludedChannelMentions = [
                        /(?:allocate|recommend|use).*(?:meta|facebook|instagram|tiktok)/i,
                    ];
                    const hasExcludedChannel = excludedChannelMentions.some((p) => p.test(postChangeResponses));
                    // Should mention alternative channels
                    const alternativePatterns = [
                        /(?:ctv|connected tv|streaming)/i,
                        /(?:programmatic|display|video)/i,
                        /(?:youtube|google)/i,
                        /(?:podcast|audio|spotify)/i,
                        /(?:out-?of-?home|ooh|dooh)/i,
                        /(?:linear|broadcast|cable)/i,
                    ];
                    const hasAlternative = alternativePatterns.some((p) => p.test(postChangeResponses));
                    return !hasExcludedChannel && hasAlternative;
                },
            },
            {
                name: "impact-explained",
                description: "Agent explained impact of losing social channels",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const impactPatterns = [
                        /(?:social|meta|facebook).*(?:typically|usually|often).*(?:efficient|cost-effective|reach)/i,
                        /(?:losing|without|removing).*(?:social).*(?:impact|affect|change)/i,
                        /(?:reach|frequency|cpm).*(?:may|will|could).*(?:change|increase|decrease)/i,
                        /(?:trade-?off|adjustment|shift)/i,
                    ];
                    return impactPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "alternatives-recommended",
                description: "Agent recommended specific alternative channels",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const recommendationPatterns = [
                        /(?:recommend|suggest|propose).*(?:instead|alternative|replacement)/i,
                        /(?:shift|reallocate|move).*(?:budget|spend|allocation)/i,
                        /(?:increase|boost|add).*(?:ctv|streaming|youtube|programmatic|ooh)/i,
                        /(?:compensate|make up|replace).*(?:with|using|through)/i,
                    ];
                    return recommendationPatterns.some((p) => p.test(postChangeResponses));
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
exports.channelMixChangeContext = {
    budget: 3000000,
    funnel: "awareness",
    kpiAggressiveness: "moderate",
    userSophistication: "medium",
};
exports.default = exports.channelMixChangeScenario;
//# sourceMappingURL=channel-mix-change.js.map