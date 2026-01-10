"use strict";
/**
 * Sophisticated User - IDK Protocol Scenario
 *
 * Tests the agent's ability to handle an advanced user who says
 * "I don't know" to certain questions, verifying the IDK protocol
 * is properly followed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sophisticatedIdkScenario = exports.sophisticatedUserPersona = void 0;
/**
 * Sophisticated user persona - growth lead at fintech
 */
exports.sophisticatedUserPersona = {
    id: "sophisticated-fintech",
    name: "Marcus",
    title: "Growth Lead",
    company: "QuickSend Remittance",
    industry: "Fintech - Remittance",
    sophisticationLevel: "advanced",
    knownData: {
        hasObjective: true,
        objective: "Drive new customer acquisitions for remittance platform",
        hasVolume: true,
        volumeTarget: 10000,
        volumeUnit: "customers",
        hasBudget: true,
        budget: 500000,
        hasLTV: false, // Will say IDK
        hasCAC: false, // Will say IDK - should be calculated
        hasMargin: false, // Will say IDK
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.4, // Higher because some data is unknown
        verbosity: "detailed",
        skipTendency: 0.05,
        pushbackFrequency: 0.15,
        providesUnsolicitedInfo: true,
    },
    languagePatterns: {
        usesJargon: true,
        preferredTerms: {
            customers: "acquired users",
            budget: "media spend",
            goal: "north star metric",
            success: "target",
        },
        avoidedTerms: [],
        samplePhrases: [
            "We're targeting 10K new users this quarter",
            "Our media spend is $500K",
            "I honestly don't have visibility into our LTV metrics",
            "Can you model based on industry benchmarks?",
            "That aligns with what I've seen in competitive analysis",
            "What does the data suggest for remittance vertical?",
        ],
    },
    responseStyle: {
        typicalLength: "medium",
        asksFollowUps: true,
        confirmsUnderstanding: false,
    },
};
/**
 * Sophisticated User IDK Protocol Test Scenario
 */
exports.sophisticatedIdkScenario = {
    id: "sophisticated-idk-protocol",
    name: "Sophisticated User - IDK Protocol",
    description: "Tests agent's ability to handle uncertainty, model with assumptions, and continue progress when user says 'I don't know'",
    persona: exports.sophisticatedUserPersona,
    openingMessage: "Hey, I'm the growth lead at QuickSend. We're a remittance fintech looking to acquire 10,000 new users this quarter with a $500K media spend. Let's build out the media strategy.",
    expectedCompletedSteps: [1, 2],
    maxTurns: 15,
    minTurns: 5,
    kbInjectionMap: {
        1: ["MPA_Supporting_Instructions_v5_5.txt"],
        2: [
            "MPA_Supporting_Instructions_v5_5.txt",
            "MPA_Expert_Lens_Budget_Allocation_v5_5.txt",
        ],
    },
    expectedEvents: [
        {
            type: "idk_protocol",
            description: "User says I don't know, agent should model with assumption",
        },
        {
            type: "benchmark_cited",
            description: "Agent cites benchmark when user doesn't know",
        },
        {
            type: "calculation_performed",
            description: "Agent calculates implied CAC ($50 per user)",
        },
    ],
    failureConditions: [
        {
            id: "idk-push-back",
            description: "Agent keeps pushing after user says IDK",
            type: "blocked_progress",
            severity: "major",
            scorePenalty: 0.2,
            terminateOnDetect: false,
        },
        {
            id: "no-assumption-stated",
            description: "Agent models without stating assumption clearly",
            type: "custom_pattern",
            detectionPattern: "^(?!.*(assume|assumption|based on|benchmark|typical)).*$",
            severity: "warning",
            scorePenalty: 0.1,
            terminateOnDetect: false,
        },
        {
            id: "language-mismatch",
            description: "Agent uses overly simple language with advanced user",
            type: "custom_pattern",
            detectionPattern: "in simple terms|to put it simply|basically what this means",
            severity: "warning",
            scorePenalty: 0.05,
            terminateOnDetect: false,
        },
    ],
    successCriteria: {
        minimumOverallScore: 0.7,
        requiredStepsComplete: [1, 2],
        noCriticalFailures: true,
        minimumTurnScores: {
            "idk-protocol": 0.7,
            "proactive-intelligence": 0.65,
            "adaptive-sophistication": 0.7,
        },
        customCriteria: [
            {
                name: "idk-handled-gracefully",
                description: "When user says IDK, agent models and moves on",
                evaluator: (result) => {
                    const idkEvents = result.allEvents.filter((e) => e.type === "idk_protocol");
                    if (idkEvents.length === 0)
                        return true; // No IDK events
                    // Check that benchmark was cited after IDK
                    const benchmarkCited = result.allEvents.some((e) => e.type === "benchmark_cited" &&
                        idkEvents.some((idk) => e.turnNumber >= idk.turnNumber));
                    return benchmarkCited;
                },
            },
            {
                name: "calculation-without-asking",
                description: "Agent calculates CAC from budget/volume without asking for CAC",
                evaluator: (result) => {
                    // Check that agent calculates $500K / 10K = $50 CAC
                    const calculationPerformed = result.turns.some((turn) => /\$50|\$50\.00|50 per|50\/user|50 per user/i.test(turn.agentResponse));
                    return calculationPerformed;
                },
            },
            {
                name: "fintech-context-acknowledged",
                description: "Agent acknowledges remittance/fintech context",
                evaluator: (result) => {
                    return result.turns.some((turn) => /remittance|fintech|money transfer|transaction|take rate/i.test(turn.agentResponse));
                },
            },
        ],
    },
};
exports.default = exports.sophisticatedIdkScenario;
//# sourceMappingURL=sophisticated-idk.js.map