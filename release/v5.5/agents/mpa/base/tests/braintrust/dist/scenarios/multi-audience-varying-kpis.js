/**
 * Multi-Audience Varying KPIs Scenario
 *
 * Tests the agent's ability to handle multiple target audiences where each
 * segment has DIFFERENT primary KPIs and success metrics. This is the most
 * complex multi-audience scenario, combining:
 * - Different audiences with distinct attributes
 * - Different KPI objectives per segment
 * - Different measurement approaches per segment
 * - Different channel strategies per segment
 *
 * This scenario specifically tests:
 * 1. Agent tracks different KPIs for different segments
 * 2. Agent doesn't apply a single KPI across all segments
 * 3. Agent discusses appropriate metrics per segment objective
 * 4. Agent handles mixed awareness + performance goals
 * 5. Agent maintains clarity on segment-KPI-channel relationships
 * 6. Agent calculates targets using segment-appropriate metrics
 *
 * Expected Quality Behaviors:
 * - Agent MUST acknowledge different KPIs per segment
 * - Agent SHOULD NOT apply CAC to awareness segment
 * - Agent SHOULD NOT apply reach/frequency to performance segment
 * - Agent MUST recommend measurement approach per segment-KPI
 * - Agent SHOULD discuss how to report across heterogeneous objectives
 * - Agent MUST calculate segment-specific targets appropriately
 */
/**
 * CMO with multi-segment, multi-KPI campaign requirements
 */
export const multiAudienceVaryingKpisPersona = {
    id: "multi-audience-varying-kpis",
    name: "Victoria",
    title: "Chief Marketing Officer",
    company: "Velocity Auto Group",
    industry: "Automotive - Multi-Brand Dealer Group",
    sophisticationLevel: "expert",
    knownData: {
        hasObjective: true,
        objective: "Drive different objectives for three customer segments: awareness for conquest, leads for in-market, loyalty for existing",
        hasVolume: true,
        volumeTarget: undefined, // Different per segment, will specify
        volumeUnit: undefined,
        hasBudget: true,
        budget: 4500000,
        hasLTV: true,
        ltv: 12000, // Average vehicle margin + service
        hasCAC: false, // Different per segment
        hasMargin: true,
        margin: 0.08, // Vehicle margin
        hasAudienceDefinition: true,
        audienceDescription: "Three segments with different objectives: " +
            "(1) Conquest - Brand Awareness: Competitor owners we want to make aware of our brands, goal is reach/frequency/brand lift; " +
            "(2) In-Market - Lead Generation: Active shoppers researching vehicles, goal is qualified leads and test drives; " +
            "(3) Loyalty - Retention: Existing customers due for service or trade-in, goal is service appointments and repeat purchases",
        hasGeography: true,
        geography: [
            "All segments: 50-mile radius around our 12 dealership locations",
            "Conquest: Broader reach in metro areas",
            "In-Market: Tight geo around dealerships",
            "Loyalty: Existing customer database, no geo targeting",
        ],
        hasChannelPreferences: true,
        preferredChannels: [
            "Conquest: TV, CTV, YouTube, Display for reach",
            "In-Market: Search, Social, Third-party auto sites",
            "Loyalty: Email, Direct Mail, CRM retargeting",
        ],
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.05,
        verbosity: "detailed",
        skipTendency: 0.1,
        pushbackFrequency: 0.2,
        providesUnsolicitedInfo: true,
        objectionPatterns: [
            "We can't measure conquest the same way as in-market",
            "Brand lift is the right KPI for awareness, not leads",
            "Loyalty segment has completely different economics",
            "Each segment needs its own success metrics",
        ],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: [
            "VDP",
            "SRP",
            "CPL",
            "CPA",
            "ROAS",
            "DMS",
            "CRM",
            "OEM",
            "BDC",
        ],
        preferredTerms: {
            customers: "customers",
            budget: "media investment",
            goal: "objectives",
            success: "KPIs",
        },
        avoidedTerms: [],
        samplePhrases: [
            "Conquest segment is pure awareness - we need reach and frequency",
            "In-market segment is performance - leads and cost per lead",
            "Loyalty segment is retention - service ROs and trade-in inquiries",
            "We can't apply a single KPI across all three",
            "Each segment has fundamentally different objectives",
            "Measurement needs to match the objective per segment",
        ],
    },
    responseStyle: {
        typicalLength: "long",
        asksFollowUps: true,
        confirmsUnderstanding: true,
    },
};
/**
 * Multi-Audience Varying KPIs Test Scenario
 */
export const multiAudienceVaryingKpisScenario = {
    id: "multi-audience-varying-kpis",
    name: "Multi-Audience with Different KPIs Per Segment",
    category: "phase1-quality",
    description: "Most complex multi-audience test: Three segments with completely different " +
        "primary KPIs (awareness vs leads vs retention). Agent MUST track different " +
        "objectives and metrics per segment, not apply a single KPI across all.",
    persona: multiAudienceVaryingKpisPersona,
    openingMessage: "I'm the CMO at Velocity Auto Group - we operate 12 dealerships across 3 brands. " +
        "I need a media plan that serves three completely different objectives for three segments.\n\n" +
        "Total budget: $4.5M across all segments.\n\n" +
        "Segment 1 - Conquest (Awareness): People currently driving competitor vehicles who " +
        "we want to make aware of our brands. The goal here is AWARENESS - reach, frequency, " +
        "brand lift. Not leads. We're trying to shift consideration for their next purchase, " +
        "which could be 2-3 years away. Budget allocation: roughly 35%.\n\n" +
        "Segment 2 - In-Market (Lead Gen): Active vehicle shoppers currently researching. " +
        "They're browsing Autotrader, Cars.com, checking reviews. The goal is LEADS - VDP views, " +
        "form fills, calls, test drive appointments. This is performance marketing. " +
        "Budget allocation: roughly 45%.\n\n" +
        "Segment 3 - Loyalty (Retention): Our existing customers who are either due for " +
        "service, approaching trade-in cycle, or have service contracts expiring. Goal is " +
        "RETENTION ACTIONS - service appointments, trade-in inquiries, lease renewal interest. " +
        "Different economics entirely. Budget allocation: roughly 20%.\n\n" +
        "Each segment has different KPIs, different channels, different measurement. " +
        "Can't use a one-size-fits-all approach. How would you structure this?",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
    maxTurns: 55,
    minTurns: 22,
    minExpectedTurns: 28,
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
        8: [
            "MPA_Expert_Lens_Measurement_Attribution_v5_5.txt",
            "MPA_Implications_Measurement_Choices_v5_5.txt",
        ],
    },
    expectedEvents: [
        {
            type: "step_transition",
            description: "Agent progresses through steps with segment-KPI clarity",
        },
        {
            type: "calculation_performed",
            description: "Agent calculates segment-appropriate metrics",
        },
    ],
    failureConditions: [
        {
            id: "single-kpi-all-segments",
            description: "Agent applies a single KPI (like CAC) across all segments",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.25,
            terminateOnDetect: false,
        },
        {
            id: "cac-for-awareness-segment",
            description: "Agent applies CAC/CPL metrics to the conquest/awareness segment",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.15,
            terminateOnDetect: false,
        },
        {
            id: "reach-for-performance-segment",
            description: "Agent applies reach/frequency metrics as primary KPI for in-market segment",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.15,
            terminateOnDetect: false,
        },
        {
            id: "ignored-retention-economics",
            description: "Agent treats loyalty segment economics same as acquisition",
            type: "custom_pattern",
            severity: "warning",
            scorePenalty: 0.1,
            terminateOnDetect: false,
        },
    ],
    successCriteria: {
        minimumOverallScore: 0.75,
        requiredStepsComplete: [1, 2, 3, 4, 5, 6, 7, 8],
        noCriticalFailures: true,
        minimumTurnScores: {
            "teaching-behavior": 0.6,
            "proactive-calculation": 0.7,
            "strategic-synthesis": 0.8,
            "critical-thinking": 0.7,
        },
        customCriteria: [
            {
                name: "segment-specific-kpis-acknowledged",
                description: "Agent acknowledged different KPIs for each segment",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Check for segment-KPI associations
                    const conquestKpi = /(?:conquest|awareness).*(?:reach|frequency|brand lift|impression)/i.test(allResponses);
                    const inmarketKpi = /(?:in.market|lead).*(?:cpl|lead|form|test drive|vdp)/i.test(allResponses);
                    const loyaltyKpi = /(?:loyalty|retention|existing).*(?:service|trade.in|retention|ro|repair order)/i.test(allResponses);
                    return conquestKpi && inmarketKpi && loyaltyKpi;
                },
            },
            {
                name: "no-cac-for-awareness",
                description: "Agent did NOT apply CAC/CPL to awareness segment",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // These would be wrong applications
                    const wrongPatterns = [
                        /(?:conquest|awareness).*(?:primary|main).*(?:cac|cpl|cost per lead|cost per acquisition)/i,
                        /(?:cac|cpl).*(?:primary|main|kpi).*(?:conquest|awareness)/i,
                    ];
                    return !wrongPatterns.some((p) => p.test(allResponses));
                },
            },
            {
                name: "awareness-metrics-correct",
                description: "Agent applied correct awareness metrics to conquest",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const awarenessMetrics = [
                        /(?:conquest|awareness).*(?:reach|frequency|cpm)/i,
                        /(?:brand lift|aided recall|unaided|consideration).*(?:conquest|awareness)/i,
                        /(?:conquest|awareness).*(?:brand lift|awareness|recall)/i,
                    ];
                    return awarenessMetrics.some((p) => p.test(allResponses));
                },
            },
            {
                name: "lead-gen-metrics-correct",
                description: "Agent applied correct lead gen metrics to in-market",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const leadGenMetrics = [
                        /(?:in.market|lead gen).*(?:cpl|cost per lead|leads?|form fill)/i,
                        /(?:vdp|test drive|appointment).*(?:in.market|shopper)/i,
                        /(?:in.market|shopper).*(?:vdp|test drive|call|form)/i,
                    ];
                    return leadGenMetrics.some((p) => p.test(allResponses));
                },
            },
            {
                name: "retention-metrics-correct",
                description: "Agent applied correct retention metrics to loyalty",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const retentionMetrics = [
                        /(?:loyalty|retention|existing).*(?:service|ro|repair order|trade.in)/i,
                        /(?:appointment|renewal|repeat).*(?:loyalty|existing)/i,
                        /(?:loyalty|existing).*(?:cost per|cpa|appointment|action)/i,
                    ];
                    return retentionMetrics.some((p) => p.test(allResponses));
                },
            },
            {
                name: "measurement-approach-per-segment",
                description: "Agent discussed different measurement per segment",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const measurementPatterns = [
                        /(?:measure|track|attribute).*(?:different|vary).*(?:segment|objective)/i,
                        /(?:brand lift|survey).*(?:conquest|awareness)/i,
                        /(?:attribution|conversion).*(?:in.market|lead)/i,
                        /(?:crm|database).*(?:loyalty|retention|existing)/i,
                    ];
                    return measurementPatterns.filter((p) => p.test(allResponses))
                        .length >= 2;
                },
            },
            {
                name: "budget-allocation-by-segment",
                description: "Agent calculated budget per segment (~35%, 45%, 20%)",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const allocationPatterns = [
                        /(?:conquest|awareness).*(?:35|1[,.]?5|1[,.]?575)/i, // ~35% of $4.5M
                        /(?:in.market|lead).*(?:45|2[,.]?0|2[,.]?025)/i, // ~45% of $4.5M
                        /(?:loyalty|retention).*(?:20|9|900)/i, // ~20% of $4.5M
                        /\$[\d,]+.*(?:conquest|awareness|in.market|loyalty)/i,
                    ];
                    return allocationPatterns.filter((p) => p.test(allResponses))
                        .length >= 2;
                },
            },
            {
                name: "reporting-complexity-addressed",
                description: "Agent discussed how to report across heterogeneous objectives",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const reportingPatterns = [
                        /(?:report|dashboard|rollup).*(?:segment|objective)/i,
                        /(?:different|separate).*(?:kpi|metric).*(?:report|dashboard)/i,
                        /(?:aggregate|overall|combined).*(?:challenge|difficult|separate)/i,
                        /(?:segment|objective).level.*(?:report|performance)/i,
                    ];
                    return reportingPatterns.some((p) => p.test(allResponses));
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
export const multiAudienceVaryingKpisContext = {
    budget: 4500000,
    funnel: "consideration", // Mixed funnel
    kpiAggressiveness: "moderate",
    userSophistication: "high",
};
export default multiAudienceVaryingKpisScenario;
//# sourceMappingURL=multi-audience-varying-kpis.js.map