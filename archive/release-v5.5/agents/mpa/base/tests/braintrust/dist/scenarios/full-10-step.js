/**
 * Full 10-Step Planning Scenario
 *
 * Tests the agent's ability to guide a user through all 10 steps
 * of the media planning process in a complete session.
 */
/**
 * Intermediate user persona - marketing director at ecommerce company
 */
export const intermediateUserPersona = {
    id: "intermediate-ecommerce",
    name: "Jennifer",
    title: "Marketing Director",
    company: "HomeStyle Decor",
    industry: "Ecommerce - Home Goods",
    sophisticationLevel: "intermediate",
    knownData: {
        hasObjective: true,
        objective: "Drive online sales and new customer acquisition",
        hasVolume: true,
        volumeTarget: 15000,
        volumeUnit: "customers",
        hasBudget: true,
        budget: 750000,
        hasLTV: true,
        ltv: 450,
        hasCAC: false,
        hasMargin: true,
        margin: 0.35,
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.2,
        verbosity: "balanced",
        skipTendency: 0.1,
        pushbackFrequency: 0.1,
        providesUnsolicitedInfo: true,
    },
    languagePatterns: {
        usesJargon: true,
        preferredTerms: {
            customers: "customers",
            budget: "annual budget",
            goal: "objective",
            success: "KPIs",
        },
        avoidedTerms: [],
        samplePhrases: [
            "Our annual marketing budget is $750K",
            "We're targeting 15,000 new customers",
            "Our average customer LTV is around $450",
            "Margins are about 35%",
            "We primarily sell home decor and furniture",
            "Our audience is homeowners aged 30-55",
            "We're focused on the US market, mainly major metros",
        ],
    },
    responseStyle: {
        typicalLength: "medium",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Full 10-Step Test Scenario
 */
export const full10StepScenario = {
    id: "full-10-step",
    name: "Full 10-Step Media Planning",
    description: "Tests complete media planning flow through all 10 steps with an intermediate user",
    persona: intermediateUserPersona,
    openingMessage: "Hi! I'm the Marketing Director at HomeStyle Decor. We sell home decor and furniture online. I'm looking to build a comprehensive media plan for next year. Our annual budget is $750K and we want to acquire 15,000 new customers.",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    maxTurns: 50,
    minTurns: 10, // Efficient conversations can complete 10 steps quickly
    minExpectedTurns: 10,
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
        9: ["MPA_Supporting_Instructions_v5_5.txt"],
        10: ["MPA_Supporting_Instructions_v5_5.txt"],
    },
    expectedEvents: [
        {
            type: "calculation_performed",
            description: "Agent calculates implied CAC ($50)",
        },
        {
            type: "step_transition",
            description: "Multiple step transitions through all 10 steps",
        },
        {
            type: "benchmark_cited",
            description: "Agent cites benchmarks for ecommerce vertical",
        },
        {
            type: "step_completion",
            description: "Each step is marked complete with minimum viable data",
        },
    ],
    failureConditions: [
        {
            id: "step-skip",
            description: "Agent skips a step without acknowledging",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.1,
            terminateOnDetect: false,
        },
        // Note: "stuck-in-step" detection removed as it was causing false positives
        // when conversations complete efficiently (10 steps in 13 turns is excellent)
    ],
    successCriteria: {
        minimumOverallScore: 0.65,
        requiredStepsComplete: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        noCriticalFailures: true,
        minimumTurnScores: {
            "response-length": 0.6,
            "single-question": 0.65,
            "step-boundary": 0.7,
        },
        customCriteria: [
            {
                name: "all-steps-complete",
                description: "All 10 steps must be completed",
                evaluator: (result) => {
                    return result.finalStepState.completedSteps.length >= 10;
                },
            },
            {
                name: "efficient-progression",
                description: "Complete 10 steps in reasonable turn count",
                evaluator: (result) => {
                    // Efficient conversations can complete 10 steps in 10-45 turns
                    // 10 turns = ~1 per step (very efficient)
                    // 45 turns = ~4.5 per step (acceptable)
                    return result.totalTurns <= 45 && result.totalTurns >= 10;
                },
            },
            {
                name: "context-maintained",
                description: "Agent maintains context throughout conversation",
                evaluator: (result) => {
                    // Check for context loss failures
                    const contextLossFailures = [
                        ...result.failures.major,
                        ...result.failures.critical,
                    ].filter((f) => f.type === "context_loss");
                    return contextLossFailures.length === 0;
                },
            },
            {
                name: "smooth-transitions",
                description: "Steps transition smoothly without abrupt changes",
                evaluator: (result) => {
                    const transitions = result.allEvents.filter((e) => e.type === "step_transition");
                    // Should have at least 8 transitions (9 steps after first)
                    return transitions.length >= 8;
                },
            },
        ],
    },
};
export default full10StepScenario;
//# sourceMappingURL=full-10-step.js.map