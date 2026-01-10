"use strict";
/**
 * Precision Targeting Complex Scenario
 *
 * Tests the agent's ability to handle highly complex geographic, behavioral,
 * demographic, and contextual attributes needed to shape a campaign with precision.
 *
 * This scenario specifically tests:
 * 1. Multi-layered audience definition with demographic, behavioral, and contextual signals
 * 2. Complex geographic targeting with DMA-level specificity
 * 3. Behavioral segmentation beyond basic demographics
 * 4. Contextual targeting considerations (dayparting, device, environment)
 * 5. First-party data integration with third-party enrichment
 * 6. Lookalike/similar audience expansion strategies
 *
 * Expected Quality Behaviors:
 * - Agent MUST unpack the complex audience into actionable segments
 * - Agent SHOULD recommend precision targeting strategies for each segment
 * - Agent MUST address geographic nuances (urban vs suburban, regional differences)
 * - Agent SHOULD discuss behavioral signals beyond demographics
 * - Agent MUST calculate reach vs precision tradeoffs
 * - Agent SHOULD recommend test structures for targeting hypotheses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.precisionTargetingComplexContext = exports.precisionTargetingComplexScenario = exports.precisionTargetingPersona = void 0;
/**
 * Expert performance marketer with complex targeting requirements
 */
exports.precisionTargetingPersona = {
    id: "precision-targeting-expert",
    name: "David",
    title: "Director of Performance Marketing",
    company: "LuxeFinance Wealth Management",
    industry: "Financial Services - Wealth Management",
    sophisticationLevel: "expert",
    knownData: {
        hasObjective: true,
        objective: "Acquire high-net-worth individuals for wealth management services",
        hasVolume: true,
        volumeTarget: 2500,
        volumeUnit: "qualified leads",
        hasBudget: true,
        budget: 1500000,
        hasLTV: true,
        ltv: 45000,
        hasCAC: false,
        hasMargin: true,
        margin: 0.65,
        hasAudienceDefinition: true,
        audienceDescription: "HNW individuals $1M+ investable assets, 45-65 years old, executives and business owners, " +
            "approaching retirement or major liquidity event, interested in tax optimization and estate planning",
        hasGeography: true,
        geography: [
            "Top 25 DMAs by HNW concentration",
            "San Francisco-Oakland-San Jose",
            "New York Metro",
            "Los Angeles",
            "Chicago",
            "Boston",
            "Seattle",
            "Denver",
            "Miami-Fort Lauderdale",
            "Dallas-Fort Worth",
            "Washington DC",
        ],
        hasChannelPreferences: true,
        preferredChannels: [
            "LinkedIn",
            "Programmatic Display",
            "Connected TV",
            "Financial Publisher Direct",
            "Podcast Sponsorship",
        ],
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.05,
        verbosity: "detailed",
        skipTendency: 0.15,
        pushbackFrequency: 0.25,
        providesUnsolicitedInfo: true,
        objectionPatterns: [
            "We tried broad targeting before and CPL was too high",
            "Quality matters more than volume for us",
            "We need to protect brand safety in this vertical",
        ],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: [
            "HNW",
            "UHNW",
            "AUM",
            "CPL",
            "MQL",
            "SQL",
            "LTV",
            "CAC",
            "ROAS",
            "DMA",
            "CTV",
            "OTT",
        ],
        preferredTerms: {
            customers: "qualified leads",
            budget: "media investment",
            goal: "acquisition targets",
            success: "cost per qualified lead",
        },
        avoidedTerms: [],
        samplePhrases: [
            "We're targeting $1M+ investable assets",
            "Need to focus on top DMAs by HNW concentration",
            "Quality over quantity - we can't afford unqualified leads",
            "First-party data from existing clients shows these behavioral signals",
            "Contextual placement is critical for brand safety",
            "We have CRM data on 50K existing clients for lookalike modeling",
        ],
    },
    responseStyle: {
        typicalLength: "long",
        asksFollowUps: false,
        confirmsUnderstanding: false,
    },
};
/**
 * Precision Targeting Complex Test Scenario
 */
exports.precisionTargetingComplexScenario = {
    id: "precision-targeting-complex",
    name: "Precision Targeting with Complex Attributes",
    category: "phase1-quality",
    description: "Tests agent's ability to handle highly complex geographic, behavioral, demographic, " +
        "and contextual targeting attributes for a precision campaign. Agent MUST demonstrate " +
        "deep understanding of audience segmentation and targeting tradeoffs.",
    persona: exports.precisionTargetingPersona,
    openingMessage: "I'm the Director of Performance Marketing at LuxeFinance, a wealth management firm. " +
        "We need to build a precision media plan to acquire high-net-worth individuals - " +
        "specifically people with $1M+ in investable assets, typically 45-65, executives and " +
        "business owners who are either approaching retirement or have a major liquidity event " +
        "coming up. We're interested in people researching tax optimization and estate planning. " +
        "Budget is $1.5M, targeting 2,500 qualified leads. We have CRM data on 50K existing clients " +
        "we can use for modeling. Focus on top DMAs by HNW concentration - NYC, SF, LA, Chicago, " +
        "Boston, Seattle, Denver, Miami, Dallas, DC. Quality matters more than volume here.",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 40,
    minTurns: 15,
    minExpectedTurns: 18,
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
        6: ["MPA_Conversation_Examples_v5_5.txt"],
        7: [
            "MPA_Expert_Lens_Channel_Mix_v5_5.txt",
            "MPA_Implications_Channel_Shifts_v5_5.txt",
        ],
    },
    expectedEvents: [
        {
            type: "calculation_performed",
            description: "Agent calculates implied CPL: $1.5M / 2,500 = $600",
        },
        {
            type: "benchmark_cited",
            description: "Agent cites HNW/wealth management CPL benchmarks",
        },
        {
            type: "step_transition",
            description: "Agent transitions through Steps 1-7 with precision focus",
        },
    ],
    failureConditions: [
        {
            id: "oversimplified-audience",
            description: "Agent treats HNW audience as simple demographic instead of complex behavioral/contextual",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.15,
            terminateOnDetect: false,
        },
        {
            id: "ignored-first-party-data",
            description: "Agent fails to discuss CRM/lookalike modeling strategy",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.1,
            terminateOnDetect: false,
        },
        {
            id: "generic-geo-recommendation",
            description: "Agent doesn't address DMA-specific strategy or HNW concentration",
            type: "custom_pattern",
            severity: "warning",
            scorePenalty: 0.1,
            terminateOnDetect: false,
        },
        {
            id: "missed-contextual-targeting",
            description: "Agent doesn't discuss contextual/environmental targeting considerations",
            type: "custom_pattern",
            severity: "warning",
            scorePenalty: 0.05,
            terminateOnDetect: false,
        },
    ],
    successCriteria: {
        minimumOverallScore: 0.75,
        requiredStepsComplete: [1, 2, 3, 4, 5, 6, 7],
        noCriticalFailures: true,
        minimumTurnScores: {
            "teaching-behavior": 0.6,
            "proactive-calculation": 0.7,
            "critical-thinking": 0.7,
            "strategic-synthesis": 0.7,
        },
        customCriteria: [
            {
                name: "audience-complexity-addressed",
                description: "Agent unpacked the multi-dimensional audience definition",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Check for multiple audience dimensions discussed
                    const audienceDimensions = [
                        /(?:demographic|age|income|net worth|wealth)/i,
                        /(?:behavioral|intent|interest|research)/i,
                        /(?:psychographic|lifestyle|values)/i,
                        /(?:contextual|environment|placement|publisher)/i,
                        /(?:first.party|crm|lookalike|similar audience)/i,
                    ];
                    const dimensionsAddressed = audienceDimensions.filter((p) => p.test(allResponses)).length;
                    return dimensionsAddressed >= 3;
                },
            },
            {
                name: "dma-strategy-discussed",
                description: "Agent discussed DMA-level geographic strategy",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const dmaPatterns = [
                        /dma|designated market area/i,
                        /(?:metro|metropolitan).*(?:concentration|index|penetration)/i,
                        /(?:new york|san francisco|los angeles|chicago|boston)/i,
                        /(?:hnw|high.net.worth).*(?:concentration|density|index)/i,
                    ];
                    return dmaPatterns.filter((p) => p.test(allResponses)).length >= 2;
                },
            },
            {
                name: "first-party-data-strategy",
                description: "Agent recommended CRM/lookalike modeling approach",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const firstPartyPatterns = [
                        /(?:crm|first.party).*(?:data|audience|seed)/i,
                        /lookalike|similar audience|lal/i,
                        /(?:model|modeling).*(?:existing|client|customer)/i,
                        /(?:seed|source).*(?:audience|list)/i,
                    ];
                    return firstPartyPatterns.some((p) => p.test(allResponses));
                },
            },
            {
                name: "precision-vs-reach-tradeoff",
                description: "Agent discussed precision vs reach tradeoffs",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const tradeoffPatterns = [
                        /(?:precision|narrow|specific).*(?:reach|scale|volume)/i,
                        /(?:tradeoff|balance|tension).*(?:quality|quantity)/i,
                        /(?:smaller|narrower).*(?:audience|pool).*(?:higher|better).*(?:quality|conversion)/i,
                        /(?:quality|qualified).*(?:over|vs|versus).*(?:volume|quantity)/i,
                    ];
                    return tradeoffPatterns.some((p) => p.test(allResponses));
                },
            },
            {
                name: "contextual-targeting-addressed",
                description: "Agent addressed contextual/environmental targeting",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const contextualPatterns = [
                        /contextual.*(?:targeting|placement|environment)/i,
                        /(?:brand safety|brand.safe|premium)/i,
                        /(?:financial|business|investment).*(?:publisher|content|context)/i,
                        /(?:daypart|time.of.day|device)/i,
                    ];
                    return contextualPatterns.some((p) => p.test(allResponses));
                },
            },
            {
                name: "cpl-calculation-shown",
                description: "Agent calculated implied CPL ($1.5M / 2,500 = $600)",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Check for CPL calculation
                    const cplPatterns = [
                        /\$?1[,.]?5(?:00[,.]?000|m|M)?\s*[÷\/]\s*2[,.]?500\s*=\s*\$?600/i,
                        /(?:equals?|=|implies?|that['']?s)\s*\$?600\s*(?:per|cpl|cost per lead)/i,
                        /\$600.*(?:per|cpl|cost per)/i,
                    ];
                    return cplPatterns.some((p) => p.test(allResponses));
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
exports.precisionTargetingComplexContext = {
    budget: 1500000,
    funnel: "performance",
    kpiAggressiveness: "moderate",
    userSophistication: "high",
};
exports.default = exports.precisionTargetingComplexScenario;
//# sourceMappingURL=precision-targeting-complex.js.map