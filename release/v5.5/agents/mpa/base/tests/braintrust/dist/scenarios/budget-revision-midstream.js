/**
 * Budget Revision Midstream Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation budget increase.
 * The user starts with a $500K budget, then at turn 6 reveals the budget
 * has been increased to $750K.
 *
 * The agent MUST:
 * 1. Acknowledge the budget change explicitly
 * 2. Recalculate affected metrics (CAC projection, channel allocations)
 * 3. Explain what the extra $250K enables strategically
 * 4. Recommend how to allocate the additional budget
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement.
 */
/**
 * Mid-market SaaS marketer with evolving budget
 */
export const budgetRevisionPersona = {
    id: "budget-revision-saas-director",
    name: "Rachel",
    title: "Director of Marketing",
    company: "CloudMetrics Inc",
    industry: "B2B SaaS - Analytics",
    sophisticationLevel: "intermediate",
    knownData: {
        hasObjective: true,
        objective: "Drive new customer acquisition for analytics platform",
        hasVolume: true,
        volumeTarget: 10000,
        volumeUnit: "customers",
        hasBudget: true,
        budget: 500000, // Initial budget - will change mid-conversation
        hasLTV: true,
        ltv: 2400,
        hasCAC: false,
        hasMargin: true,
        margin: 0.65,
        hasAudienceDefinition: true,
        audienceDescription: "Mid-market companies (100-1000 employees) looking for data analytics solutions",
        hasGeography: true,
        geography: ["US", "Canada"],
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
        knownAcronyms: ["CAC", "LTV", "MQL", "SQL", "ARR"],
        preferredTerms: {
            customers: "customers",
            budget: "budget",
            goal: "target",
            success: "growth",
        },
        avoidedTerms: [],
        samplePhrases: [
            "Our budget is $500K for the year",
            "We need to acquire 10,000 new customers",
            "LTV is around $2,400 over 2 years",
            "We're focused on mid-market companies",
            "Margins are healthy at 65%",
        ],
    },
    responseStyle: {
        typicalLength: "medium",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Data change: Budget increases from $500K to $750K at turn 6
 */
const budgetIncreaseChange = {
    triggerTurn: 6,
    field: "budget",
    oldValue: 500000,
    newValue: 750000,
    userMessage: "Oh wait, I just got word from finance - our budget was approved for $750K, not $500K! " +
        "We got an additional $250K because leadership sees the opportunity. " +
        "How does this change things?",
    expectedBehavior: {
        acknowledges: true,
        recalculates: true,
        explainsImpact: true,
        recommendsAction: true,
    },
};
/**
 * Budget Revision Midstream Test Scenario
 *
 * Quality Focus: Proactive Reforecasting
 */
export const budgetRevisionMidstreamScenario = {
    id: "budget-revision-midstream",
    name: "Budget Revision Midstream",
    category: "reforecasting",
    description: "Tests proactive reforecasting when user reveals budget increase mid-conversation. " +
        "Agent MUST recalculate, explain impact, and recommend allocation changes.",
    persona: budgetRevisionPersona,
    openingMessage: "Hi, I'm the Director of Marketing at CloudMetrics, a B2B analytics SaaS company. " +
        "I need help building a media plan for next year. Our budget is $500K and we're " +
        "targeting 10,000 new customers. LTV is about $2,400 per customer. Can you help?",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 35,
    minTurns: 12,
    minExpectedTurns: 15,
    // Data changes to inject mid-conversation
    dataChanges: [budgetIncreaseChange],
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
            description: "Agent calculates initial CAC: $500K / 10K = $50",
        },
        {
            type: "data_change_received",
            description: "User reveals budget increased to $750K at turn 6",
        },
        {
            type: "reforecast_triggered",
            description: "Agent recalculates CAC: $750K / 10K = $75 (or adjusts target)",
        },
        {
            type: "impact_explained",
            description: "Agent explains what extra $250K enables",
        },
        {
            type: "action_recommended",
            description: "Agent recommends how to allocate additional budget",
        },
    ],
    failureConditions: [
        {
            id: "ignored-budget-change",
            description: "Agent continues with old $500K budget after user announced increase",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.30,
            terminateOnDetect: false,
        },
        {
            id: "no-recalculation-after-change",
            description: "Agent acknowledged change but did not recalculate affected metrics",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.20,
            terminateOnDetect: false,
        },
        {
            id: "no-allocation-recommendation",
            description: "Agent did not recommend how to use the additional $250K",
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
            "proactive-calculation": 0.7,
        },
        customCriteria: [
            {
                name: "budget-change-acknowledged",
                description: "Agent explicitly acknowledged the budget increase to $750K",
                evaluator: (result) => {
                    // Find turns after turn 6 (when budget change happens)
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 6);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const acknowledgmentPatterns = [
                        /\$?750[,\s]?(?:000|K|k)/i,
                        /(?:budget|investment).*(?:increased|now|updated|revised)/i,
                        /(?:additional|extra).*\$?250[,\s]?(?:000|K|k)/i,
                        /(?:from|was).*\$?500.*(?:to|now).*\$?750/i,
                    ];
                    return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "recalculation-performed",
                description: "Agent recalculated efficiency metrics after budget change",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 6);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Look for new calculation with $750K or $75 CAC
                    const recalcPatterns = [
                        /\$?750[,\s]?(?:000|K|k)?\s*[÷\/]\s*10[,\s]?(?:000|K|k)?\s*=\s*\$?75/i,
                        /(?:new|updated|revised).*(?:cac|cost per|efficiency).*\$?75/i,
                        /(?:cac|cost per).*(?:now|becomes|changes to).*\$?75/i,
                        /(?:recalculat|updated.*projection|revised.*efficiency)/i,
                    ];
                    return recalcPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "impact-explained",
                description: "Agent explained what the extra budget enables",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 6);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const impactPatterns = [
                        /(?:this|extra|additional).*(?:enables|allows|opens up|gives us)/i,
                        /(?:more|additional).*(?:flexibility|room|opportunity|budget)/i,
                        /(?:we can|you can|able to).*(?:now|with this)/i,
                        /(?:good news|great news|exciting)/i,
                        /(?:increase|boost|expand).*(?:reach|targeting|channels)/i,
                    ];
                    return impactPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "allocation-recommended",
                description: "Agent recommended how to allocate additional budget",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 6);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const recommendationPatterns = [
                        /(?:recommend|suggest|propose|advise)/i,
                        /(?:allocate|put|invest|direct).*(?:additional|extra)/i,
                        /(?:consider|could|should).*(?:adding|increasing|expanding)/i,
                        /(?:options?|approach|strategy).*(?:for|with).*(?:extra|additional)/i,
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
export const budgetRevisionMidstreamContext = {
    budget: 750000, // Final budget after revision
    funnel: "performance",
    kpiAggressiveness: "moderate",
    userSophistication: "medium",
};
export default budgetRevisionMidstreamScenario;
//# sourceMappingURL=budget-revision-midstream.js.map