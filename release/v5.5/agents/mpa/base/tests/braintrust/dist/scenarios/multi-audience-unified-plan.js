"use strict";
/**
 * Multi-Audience Unified Plan Scenario
 *
 * Tests the agent's ability to handle multiple distinct target audiences
 * within a single media plan. Each audience has different geo, demographic,
 * behavioral, and contextual signals, but shares the overall budget.
 *
 * This scenario specifically tests:
 * 1. Agent can track and define multiple distinct audience segments
 * 2. Agent keeps each segment's geo+demo+behavior+context signals separate
 * 3. Agent helps allocate budget across segments appropriately
 * 4. Agent doesn't conflate or merge distinct audience definitions
 * 5. Agent discusses how to measure performance per segment
 * 6. Agent handles complexity without getting confused
 *
 * Expected Quality Behaviors:
 * - Agent MUST define each audience segment separately and clearly
 * - Agent SHOULD recommend budget allocation rationale per segment
 * - Agent MUST NOT merge distinct audience attributes
 * - Agent SHOULD discuss segment-specific targeting strategies
 * - Agent MUST maintain clarity on which signals apply to which segment
 * - Agent SHOULD recommend segment-level measurement approach
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiAudienceUnifiedPlanContext = exports.multiAudienceUnifiedPlanScenario = exports.multiAudienceUnifiedPersona = void 0;
/**
 * Marketing director with multi-segment campaign requirements
 */
exports.multiAudienceUnifiedPersona = {
    id: "multi-audience-unified",
    name: "Jennifer",
    title: "Director of Marketing",
    company: "TrueHealth Insurance",
    industry: "Insurance - Health",
    sophisticationLevel: "advanced",
    knownData: {
        hasObjective: true,
        objective: "Acquire new health insurance members across three distinct segments",
        hasVolume: true,
        volumeTarget: 25000, // Total across all segments
        volumeUnit: "enrollees",
        hasBudget: true,
        budget: 3000000,
        hasLTV: true,
        ltv: 4800, // Average across segments
        hasCAC: false,
        hasMargin: true,
        margin: 0.35,
        hasAudienceDefinition: true,
        audienceDescription: "Three distinct segments: " +
            "(1) Young Professionals 26-35 in urban metros, health-conscious, gym members, digital-first; " +
            "(2) Families 35-50 in suburban markets, parents with kids, concerned about coverage and cost; " +
            "(3) Pre-Medicare 55-64 in mixed markets, approaching retirement, focused on stability and network",
        hasGeography: true,
        geography: [
            "Segment 1: NYC, SF, LA, Chicago, Seattle, Austin, Denver",
            "Segment 2: Suburban rings around top 50 metros",
            "Segment 3: National with emphasis on Florida, Arizona, Texas",
        ],
        hasChannelPreferences: false, // Open to recommendations per segment
        preferredChannels: undefined,
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.1,
        verbosity: "detailed",
        skipTendency: 0.1,
        pushbackFrequency: 0.2,
        providesUnsolicitedInfo: true,
        objectionPatterns: [
            "Each segment has very different needs",
            "We can't use a one-size-fits-all approach",
            "The messaging needs to be segment-specific",
        ],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: ["AEP", "OEP", "SEP", "CAC", "LTV", "CPL", "DMA"],
        preferredTerms: {
            customers: "enrollees",
            budget: "media investment",
            goal: "enrollment targets",
            success: "cost per enrollment",
        },
        avoidedTerms: [],
        samplePhrases: [
            "We have three very different audience segments",
            "Young professionals need different messaging than pre-Medicare",
            "The suburban family segment is our largest opportunity",
            "Each segment has different geographic concentrations",
            "We need to track performance by segment",
            "Budget allocation should reflect segment potential",
        ],
    },
    responseStyle: {
        typicalLength: "long",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Multi-Audience Unified Plan Test Scenario
 */
exports.multiAudienceUnifiedPlanScenario = {
    id: "multi-audience-unified-plan",
    name: "Multi-Audience Unified Media Plan",
    category: "phase1-quality",
    description: "Tests agent's ability to handle multiple distinct target audiences with " +
        "different geo, demographic, behavioral, and contextual signals within " +
        "a single media plan. Agent MUST maintain clarity on segment definitions.",
    persona: exports.multiAudienceUnifiedPersona,
    openingMessage: "Hi, I'm the Director of Marketing at TrueHealth Insurance. We need to build a " +
        "media plan targeting three very different audience segments for our health insurance products. " +
        "Total budget is $3M, goal is 25,000 new enrollees across all segments.\n\n" +
        "Segment 1 - Young Professionals: Ages 26-35, urban metros like NYC, SF, LA, Chicago. " +
        "Health-conscious, gym members, prefer digital interactions, care about convenience.\n\n" +
        "Segment 2 - Families: Ages 35-50, suburban markets around top 50 metros. Parents with " +
        "kids under 18, concerned about comprehensive coverage and cost predictability.\n\n" +
        "Segment 3 - Pre-Medicare: Ages 55-64, national but heavy in FL, AZ, TX. Approaching " +
        "retirement, focused on stability, network quality, and transition to Medicare.\n\n" +
        "Each segment needs different targeting and messaging. Can you help structure this?",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 50,
    minTurns: 18,
    minExpectedTurns: 22,
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
            description: "Agent calculates overall and per-segment efficiency targets",
        },
        {
            type: "step_transition",
            description: "Agent progresses through steps while maintaining segment clarity",
        },
    ],
    failureConditions: [
        {
            id: "segment-conflation",
            description: "Agent merges or confuses attributes between distinct segments",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.2,
            terminateOnDetect: false,
        },
        {
            id: "single-audience-treatment",
            description: "Agent treats multi-segment plan as single homogeneous audience",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.15,
            terminateOnDetect: false,
        },
        {
            id: "missing-segment-definition",
            description: "Agent fails to define or acknowledge one of the three segments",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.15,
            terminateOnDetect: false,
        },
        {
            id: "no-segment-budget-allocation",
            description: "Agent doesn't discuss how to allocate budget across segments",
            type: "custom_pattern",
            severity: "warning",
            scorePenalty: 0.1,
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
            "strategic-synthesis": 0.7,
        },
        customCriteria: [
            {
                name: "all-segments-acknowledged",
                description: "Agent acknowledged and defined all three segments",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const segment1 = /(?:young professional|26.35|urban|gym|digital.first)/i.test(allResponses);
                    const segment2 = /(?:famil|35.50|suburban|parent|kid|children)/i.test(allResponses);
                    const segment3 = /(?:pre.medicare|55.64|retirement|florida|arizona)/i.test(allResponses);
                    return segment1 && segment2 && segment3;
                },
            },
            {
                name: "segment-specific-geo",
                description: "Agent discussed segment-specific geographic targeting",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Check for segment-geography associations
                    const urbanGeo = /(?:young|26.35).*(?:urban|nyc|sf|chicago)/i.test(allResponses);
                    const suburbanGeo = /(?:famil|parent).*(?:suburban|ring)/i.test(allResponses);
                    const retirementGeo = /(?:pre.medicare|55.64|retire).*(?:florida|arizona|texas)/i.test(allResponses);
                    return [urbanGeo, suburbanGeo, retirementGeo].filter(Boolean).length >= 2;
                },
            },
            {
                name: "segment-specific-behaviors",
                description: "Agent discussed segment-specific behavioral signals",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Check for segment-behavior associations
                    const youngBehaviors = /(?:health.conscious|gym|fitness|digital|convenience)/i.test(allResponses);
                    const familyBehaviors = /(?:coverage|cost|predicta|child|dependent)/i.test(allResponses);
                    const premedBehaviors = /(?:stability|network|medicare|transition|retire)/i.test(allResponses);
                    return [youngBehaviors, familyBehaviors, premedBehaviors].filter(Boolean)
                        .length >= 2;
                },
            },
            {
                name: "budget-allocation-discussed",
                description: "Agent discussed budget allocation across segments",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const allocationPatterns = [
                        /(?:allocat|split|distribut).*(?:budget|spend).*(?:segment|audience)/i,
                        /(?:segment|audience).*(?:allocat|budget|%).*\$/i,
                        /\d+%.*(?:segment|young|famil|pre.medicare)/i,
                        /(?:segment|young|famil|pre.medicare).*\$[\d,]+/i,
                    ];
                    return allocationPatterns.some((p) => p.test(allResponses));
                },
            },
            {
                name: "segment-measurement-discussed",
                description: "Agent discussed per-segment performance tracking",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const measurementPatterns = [
                        /(?:track|measure|report).*(?:by|per|each).*segment/i,
                        /(?:segment|audience).(?:level|specific).*(?:metric|performance|kpi)/i,
                        /(?:cpe|cac|cost per).*(?:vary|different).*(?:segment|audience)/i,
                    ];
                    return measurementPatterns.some((p) => p.test(allResponses));
                },
            },
            {
                name: "segments-kept-distinct",
                description: "Agent maintained clarity between segments",
                evaluator: (result) => {
                    // Check that agent didn't create confused combinations
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // These would be wrong combinations
                    const confusedPatterns = [
                        /26.35.*(?:retire|medicare)/i, // Young + pre-Medicare
                        /55.64.*(?:gym|fitness|urban metro)/i, // Pre-Medicare + young behaviors
                        /suburban.*(?:gym member|digital.first)/i, // Family geo + young behaviors
                    ];
                    const confusionFound = confusedPatterns.filter((p) => p.test(allResponses)).length;
                    return confusionFound === 0;
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
exports.multiAudienceUnifiedPlanContext = {
    budget: 3000000,
    funnel: "performance",
    kpiAggressiveness: "moderate",
    userSophistication: "high",
};
exports.default = exports.multiAudienceUnifiedPlanScenario;
//# sourceMappingURL=multi-audience-unified-plan.js.map