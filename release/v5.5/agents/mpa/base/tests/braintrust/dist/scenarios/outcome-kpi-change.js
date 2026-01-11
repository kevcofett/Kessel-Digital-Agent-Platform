/**
 * Outcome KPI Change Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation outcome KPI change.
 * The user starts planning for customer acquisition, then at turn 8 reveals
 * the goal has shifted to brand awareness due to competitive pressure.
 *
 * The agent MUST:
 * 1. Acknowledge the KPI/objective shift explicitly
 * 2. Recalculate channel mix for awareness vs. acquisition
 * 3. Explain what the objective change means for media strategy
 * 4. Recommend awareness-focused channels and metrics
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * for fundamental outcome/KPI changes.
 */
/**
 * Insurance marketer with shifting objectives
 */
export const outcomeKPIPersona = {
    id: "outcome-kpi-insurance-head",
    name: "Robert",
    title: "Head of Marketing",
    company: "TrustGuard Insurance",
    industry: "Financial Services - Insurance",
    sophisticationLevel: "advanced",
    knownData: {
        hasObjective: true,
        objective: "Drive new policy acquisitions", // Initial - will change
        hasVolume: true,
        volumeTarget: 25000,
        volumeUnit: "new policies",
        hasBudget: true,
        budget: 5000000,
        hasLTV: true,
        ltv: 2800,
        hasCAC: false,
        hasMargin: true,
        margin: 0.35,
        hasAudienceDefinition: true,
        audienceDescription: "Homeowners 35-65 with household income $100K+, life events (new home, new baby, retirement)",
        hasGeography: true,
        geography: ["US - National"],
        hasChannelPreferences: false,
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.15,
        verbosity: "detailed",
        skipTendency: 0.05,
        pushbackFrequency: 0.25,
        providesUnsolicitedInfo: true,
        objectionPatterns: ["leadership wants to see", "board is asking"],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: ["CAC", "LTV", "CPA", "CPL", "GRP", "SOV"],
        preferredTerms: {
            customers: "policyholders",
            budget: "media investment",
            goal: "target",
            success: "growth",
        },
        avoidedTerms: [],
        samplePhrases: [
            "We have $5M allocated for media",
            "Target is 25,000 new policies",
            "Average policy LTV is $2,800",
            "We compete with major national carriers",
            "Targeting homeowners at life stage moments",
        ],
    },
    responseStyle: {
        typicalLength: "long",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Data change: Objective shifts from acquisition to brand awareness at turn 8
 */
const outcomeKPIChange = {
    triggerTurn: 8,
    field: "objective",
    oldValue: {
        type: "acquisition",
        metric: "new policies",
        target: 25000,
    },
    newValue: {
        type: "awareness",
        metric: "brand awareness lift",
        target: "15% awareness lift in target demo",
    },
    userMessage: "I need to share some news from our executive team. " +
        "We just had a board meeting and there's been a strategic shift. " +
        "A major competitor is entering our markets with a huge brand campaign. " +
        "Leadership has decided we need to focus on brand awareness first, not direct acquisition. " +
        "The new goal is to achieve a 15% brand awareness lift in our target demographic. " +
        "We'll worry about acquisition later - right now we need to defend our brand position. " +
        "How does this change our media plan?",
    expectedBehavior: {
        acknowledges: true,
        recalculates: true,
        explainsImpact: true,
        recommendsAction: true,
    },
};
/**
 * Outcome KPI Change Test Scenario
 *
 * Quality Focus: Proactive Reforecasting for objective/KPI changes
 */
export const outcomeKPIChangeScenario = {
    id: "outcome-kpi-change",
    name: "Outcome KPI Change",
    category: "reforecasting",
    description: "Tests proactive reforecasting when user reveals fundamental objective shift mid-conversation. " +
        "Agent MUST recalculate channel strategy, explain awareness vs acquisition differences, and recommend approach.",
    persona: outcomeKPIPersona,
    openingMessage: "Hi, I'm Head of Marketing at TrustGuard Insurance. " +
        "We need to build a media plan to drive 25,000 new policy acquisitions with a $5M budget. " +
        "Our target is homeowners 35-65 with $100K+ household income, particularly those going through " +
        "life events like buying a home, having a baby, or approaching retirement. LTV is around $2,800.",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 40,
    minTurns: 14,
    minExpectedTurns: 18,
    // Data changes to inject mid-conversation
    dataChanges: [outcomeKPIChange],
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
            "MPA_Expert_Lens_Channel_Mix_v5_5.txt",
            "MPA_Implications_Channel_Shifts_v5_5.txt",
        ],
    },
    expectedEvents: [
        {
            type: "acquisition_strategy_developed",
            description: "Agent develops acquisition-focused strategy",
        },
        {
            type: "data_change_received",
            description: "User reveals shift to brand awareness at turn 8",
        },
        {
            type: "reforecast_triggered",
            description: "Agent recalculates channel mix for awareness",
        },
        {
            type: "impact_explained",
            description: "Agent explains awareness vs acquisition differences",
        },
        {
            type: "action_recommended",
            description: "Agent recommends awareness-focused approach",
        },
    ],
    failureConditions: [
        {
            id: "ignored-objective-change",
            description: "Agent continues with acquisition strategy after user shifted to awareness",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.30,
            terminateOnDetect: false,
        },
        {
            id: "no-channel-restructure",
            description: "Agent acknowledged shift but did not restructure channel mix for awareness",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.20,
            terminateOnDetect: false,
        },
        {
            id: "acquisition-metrics-for-awareness",
            description: "Agent continued using acquisition metrics (CPA, policies) for awareness goal",
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
            "objective-alignment": 0.7,
        },
        customCriteria: [
            {
                name: "objective-shift-acknowledged",
                description: "Agent explicitly acknowledged the shift to brand awareness",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const acknowledgmentPatterns = [
                        /(?:brand awareness|awareness goal|awareness lift)/i,
                        /(?:shift|pivot|change).*(?:objective|goal|strategy)/i,
                        /(?:defensive|protect|defend).*(?:brand|position|market)/i,
                        /(?:15%|fifteen percent).*(?:awareness|lift)/i,
                    ];
                    return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "awareness-channels-recommended",
                description: "Agent recommended awareness-appropriate channels",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Awareness-heavy channels
                    const awarenessChannelPatterns = [
                        /(?:tv|television|ctv|linear|broadcast)/i,
                        /(?:video|youtube|streaming)/i,
                        /(?:out-?of-?home|ooh|billboard)/i,
                        /(?:podcast|audio|spotify|radio)/i,
                        /(?:reach|frequency|impression)/i,
                    ];
                    return awarenessChannelPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "awareness-metrics-used",
                description: "Agent used awareness-appropriate metrics",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const awarenessMetricPatterns = [
                        /(?:reach|frequency|grp|trp)/i,
                        /(?:awareness|recall|recognition)/i,
                        /(?:cpm|cost per thousand|impression)/i,
                        /(?:share of voice|sov)/i,
                        /(?:brand lift|brand study|measurement)/i,
                    ];
                    return awarenessMetricPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "funnel-difference-explained",
                description: "Agent explained awareness vs acquisition differences",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const funnelPatterns = [
                        /(?:awareness).*(?:vs|versus|different|compared).*(?:acquisition|performance)/i,
                        /(?:upper|top).*(?:funnel)/i,
                        /(?:brand building|brand).*(?:vs|versus|different).*(?:direct|performance)/i,
                        /(?:longer.?term|indirect|halo)/i,
                        /(?:different|shift).*(?:approach|strategy|tactic)/i,
                    ];
                    return funnelPatterns.some((p) => p.test(postChangeResponses));
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
export const outcomeKPIChangeContext = {
    budget: 5000000,
    funnel: "awareness", // Final state
    kpiAggressiveness: "moderate",
    userSophistication: "high",
};
export default outcomeKPIChangeScenario;
//# sourceMappingURL=outcome-kpi-change.js.map