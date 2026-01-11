"use strict";
/**
 * Volume Target Increase Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation volume target increase.
 * The user starts targeting 5,000 customers, then at turn 8 reveals the target
 * has been increased to 8,000 customers.
 *
 * The agent MUST:
 * 1. Acknowledge the volume target change explicitly
 * 2. Recalculate efficiency requirements (new implied CAC)
 * 3. Flag if the new target may be unrealistic with current budget
 * 4. Recommend strategy changes (broader targeting, different channels)
 *
 * This tests proactive reforecasting when targets become more aggressive.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.volumeTargetIncreaseContext = exports.volumeTargetIncreaseScenario = exports.volumeTargetIncreasePersona = void 0;
/**
 * E-commerce marketer with changing volume targets
 */
exports.volumeTargetIncreasePersona = {
    id: "volume-increase-ecom-manager",
    name: "Jason",
    title: "Marketing Manager",
    company: "HomeStyle Direct",
    industry: "E-commerce - Home Goods",
    sophisticationLevel: "intermediate",
    knownData: {
        hasObjective: true,
        objective: "Drive new customer acquisition for home goods e-commerce",
        hasVolume: true,
        volumeTarget: 5000, // Initial target - will change mid-conversation
        volumeUnit: "customers",
        hasBudget: true,
        budget: 400000,
        hasLTV: true,
        ltv: 320,
        hasCAC: false,
        hasMargin: true,
        margin: 0.42,
        hasAudienceDefinition: true,
        audienceDescription: "Homeowners aged 30-55 interested in home décor and furniture",
        hasGeography: true,
        geography: ["US - Nationwide"],
        hasChannelPreferences: true,
        preferredChannels: ["Meta", "Pinterest", "Google Shopping"],
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.15,
        verbosity: "balanced",
        skipTendency: 0.15,
        pushbackFrequency: 0.1,
        providesUnsolicitedInfo: true,
        objectionPatterns: [
            "Leadership wants more growth",
            "Can we stretch to hit these numbers?",
        ],
    },
    languagePatterns: {
        usesJargon: false,
        knownAcronyms: ["CAC", "LTV", "ROAS"],
        preferredTerms: {
            customers: "customers",
            budget: "budget",
            goal: "target",
            success: "results",
        },
        avoidedTerms: [],
        samplePhrases: [
            "Our budget is $400K",
            "We need 5,000 new customers",
            "Customer lifetime value is about $320",
            "We sell home décor and furniture online",
            "Margins are around 42%",
        ],
    },
    responseStyle: {
        typicalLength: "medium",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Data change: Volume target increases from 5,000 to 8,000 at turn 8
 */
const volumeTargetIncreaseChange = {
    triggerTurn: 8,
    field: "volumeTarget",
    oldValue: 5000,
    newValue: 8000,
    userMessage: "I just got out of a meeting with leadership. They're pushing for 8,000 customers " +
        "instead of 5,000. The board wants more aggressive growth. Is that realistic " +
        "with our current budget? What would we need to change?",
    expectedBehavior: {
        acknowledges: true,
        recalculates: true,
        explainsImpact: true,
        recommendsAction: true,
    },
};
/**
 * Volume Target Increase Test Scenario
 *
 * Quality Focus: Proactive Reforecasting + Critical Thinking
 */
exports.volumeTargetIncreaseScenario = {
    id: "volume-target-increase",
    name: "Volume Target Increase",
    category: "reforecasting",
    description: "Tests proactive reforecasting when user reveals increased volume targets. " +
        "Agent MUST recalculate efficiency, flag feasibility concerns, and recommend changes.",
    persona: exports.volumeTargetIncreasePersona,
    openingMessage: "Hi, I'm the Marketing Manager at HomeStyle Direct. We're an e-commerce company " +
        "selling home goods. I need to build a media plan for Q1-Q2. We have a $400K budget " +
        "and need to acquire 5,000 new customers. Our average customer LTV is $320. " +
        "Can you help me put together a plan?",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 40,
    minTurns: 14,
    minExpectedTurns: 18,
    // Data changes to inject mid-conversation
    dataChanges: [volumeTargetIncreaseChange],
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
        5: [
            "MPA_Expert_Lens_Budget_Allocation_v5_5.txt",
            "MPA_Implications_Budget_Decisions_v5_5.txt",
        ],
        6: ["MPA_Expert_Lens_Channel_Mix_v5_5.txt"],
        7: [
            "MPA_Expert_Lens_Channel_Mix_v5_5.txt",
            "MPA_Implications_Channel_Shifts_v5_5.txt",
        ],
    },
    expectedEvents: [
        {
            type: "calculation_performed",
            description: "Agent calculates initial CAC: $400K / 5K = $80",
        },
        {
            type: "data_change_received",
            description: "User reveals volume target increased to 8,000 at turn 8",
        },
        {
            type: "reforecast_triggered",
            description: "Agent recalculates CAC: $400K / 8K = $50 (more aggressive)",
        },
        {
            type: "feasibility_flagged",
            description: "Agent flags that $50 CAC may be challenging",
        },
        {
            type: "strategy_recommended",
            description: "Agent recommends how to approach aggressive target",
        },
    ],
    failureConditions: [
        {
            id: "ignored-volume-change",
            description: "Agent continues with old 5,000 target after user announced increase",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.30,
            terminateOnDetect: false,
        },
        {
            id: "no-efficiency-recalculation",
            description: "Agent did not recalculate CAC/efficiency after target increase",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.20,
            terminateOnDetect: false,
        },
        {
            id: "unchallenged-aggressive-target",
            description: "Agent accepted new target without discussing feasibility",
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
            "critical-thinking": 0.7,
            "proactive-calculation": 0.7,
        },
        customCriteria: [
            {
                name: "target-change-acknowledged",
                description: "Agent explicitly acknowledged the volume target increase",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const acknowledgmentPatterns = [
                        /8[,\s]?000.*(?:customer|target)/i,
                        /(?:target|goal).*(?:increased|now|updated|revised).*8[,\s]?000/i,
                        /(?:from|was).*5[,\s]?000.*(?:to|now).*8[,\s]?000/i,
                        /(?:additional|more).*3[,\s]?000.*(?:customer)/i,
                    ];
                    return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "efficiency-recalculated",
                description: "Agent recalculated CAC after target increase",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Look for new calculation: $400K / 8K = $50
                    const recalcPatterns = [
                        /\$?400[,\s]?(?:000|K|k)?\s*[÷\/]\s*8[,\s]?(?:000|K|k)?\s*=\s*\$?50/i,
                        /(?:cac|cost per|efficiency).*(?:now|becomes|drops to).*\$?50/i,
                        /\$?50.*(?:cac|cost per|per customer)/i,
                        /(?:need|require).*(?:more efficient|tighter|lower).*(?:cac|efficiency)/i,
                    ];
                    return recalcPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "feasibility-discussed",
                description: "Agent discussed whether new target is achievable",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const feasibilityPatterns = [
                        /(?:aggressive|challenging|ambitious|stretch|difficult)/i,
                        /(?:realistic|achievable|feasible|possible)/i,
                        /(?:typical|benchmark|industry).*(?:cac|efficiency)/i,
                        /(?:may|might|could).*(?:need|require|be difficult)/i,
                        /(?:trade-?off|tension|challenge)/i,
                        /(?:let's|we should).*(?:discuss|explore|consider).*(?:how|whether)/i,
                    ];
                    return feasibilityPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "strategy-recommended",
                description: "Agent recommended strategy changes for new target",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 8);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const strategyPatterns = [
                        /(?:recommend|suggest|propose|advise)/i,
                        /(?:broader|wider|expand).*(?:targeting|audience)/i,
                        /(?:shift|reallocate|adjust).*(?:channel|mix)/i,
                        /(?:option|approach|strategy|path)/i,
                        /(?:to hit|to achieve|to reach).*(?:8[,\s]?000|new target)/i,
                    ];
                    return strategyPatterns.some((p) => p.test(postChangeResponses));
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
exports.volumeTargetIncreaseContext = {
    budget: 400000,
    funnel: "performance",
    kpiAggressiveness: "aggressive", // After target increase
    userSophistication: "medium",
};
exports.default = exports.volumeTargetIncreaseScenario;
//# sourceMappingURL=volume-target-increase.js.map