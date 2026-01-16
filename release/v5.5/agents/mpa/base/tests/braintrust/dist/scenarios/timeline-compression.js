/**
 * Timeline Compression Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation timeline compression.
 * The user starts with a 12-month campaign timeline, then at turn 7 reveals
 * they need to compress it to 6 months.
 *
 * The agent MUST:
 * 1. Acknowledge the timeline compression
 * 2. Recalculate pacing requirements (2x monthly spend)
 * 3. Flag potential pacing challenges or market saturation risks
 * 4. Recommend adjusted channel mix or front-loading strategy
 *
 * This tests proactive reforecasting when constraints become tighter.
 */
/**
 * Retail marketer with changing timeline
 */
export const timelineCompressionPersona = {
    id: "timeline-compression-retail-vp",
    name: "Michelle",
    title: "VP of Marketing",
    company: "Urban Essentials",
    industry: "Retail - Fashion & Apparel",
    sophisticationLevel: "advanced",
    knownData: {
        hasObjective: true,
        objective: "Drive new customer acquisition for fashion retail brand",
        hasVolume: true,
        volumeTarget: 25000,
        volumeUnit: "customers",
        hasBudget: true,
        budget: 1200000,
        hasLTV: true,
        ltv: 180,
        hasCAC: false,
        hasMargin: true,
        margin: 0.35,
        hasAudienceDefinition: true,
        audienceDescription: "Fashion-forward women aged 25-45 in urban areas",
        hasGeography: true,
        geography: ["US - Major Metros", "US - Tier 2 Cities"],
        hasChannelPreferences: true,
        preferredChannels: ["Instagram", "TikTok", "Google"],
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.1,
        verbosity: "detailed",
        skipTendency: 0.2,
        pushbackFrequency: 0.25,
        providesUnsolicitedInfo: true,
        objectionPatterns: [
            "We need results faster",
            "Board timeline moved up",
        ],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: ["CAC", "LTV", "ROAS", "CPA", "CTR", "CVR"],
        preferredTerms: {
            customers: "customers",
            budget: "media spend",
            goal: "acquisition target",
            success: "growth",
        },
        avoidedTerms: [],
        samplePhrases: [
            "We have $1.2M in media spend",
            "Targeting 25,000 new customers",
            "Customer LTV is around $180",
            "We're focused on urban, fashion-forward women",
            "Timeline is the full year",
        ],
    },
    responseStyle: {
        typicalLength: "medium",
        asksFollowUps: true,
        confirmsUnderstanding: false,
    },
};
/**
 * Data change: Timeline compresses from 12 months to 6 months at turn 7
 */
const timelineCompressionChange = {
    triggerTurn: 7,
    field: "timeline",
    oldValue: 12,
    newValue: 6,
    userMessage: "I need to tell you something - the board just moved up our launch timeline. " +
        "We now need to hit our numbers in 6 months, not 12. We have a major investor " +
        "meeting in July. What does this do to our plan?",
    expectedBehavior: {
        acknowledges: true,
        recalculates: true,
        explainsImpact: true,
        recommendsAction: true,
    },
};
/**
 * Timeline Compression Test Scenario
 *
 * Quality Focus: Proactive Reforecasting + Pacing Strategy
 */
export const timelineCompressionScenario = {
    id: "timeline-compression",
    name: "Timeline Compression",
    category: "reforecasting",
    description: "Tests proactive reforecasting when user reveals compressed timeline. " +
        "Agent MUST recalculate pacing, flag saturation risks, and recommend strategy.",
    persona: timelineCompressionPersona,
    openingMessage: "Hi, I'm the VP of Marketing at Urban Essentials, a fashion retail brand. " +
        "We're planning our media strategy for the coming year. Budget is $1.2M, " +
        "and we need to acquire 25,000 new customers over the next 12 months. " +
        "LTV is about $180. Help me build a plan?",
    expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
    maxTurns: 40,
    minTurns: 14,
    minExpectedTurns: 18,
    // Data changes to inject mid-conversation
    dataChanges: [timelineCompressionChange],
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
            description: "Agent calculates initial pacing: $1.2M / 12 = $100K/month",
        },
        {
            type: "data_change_received",
            description: "User reveals timeline compressed to 6 months at turn 7",
        },
        {
            type: "reforecast_triggered",
            description: "Agent recalculates pacing: $1.2M / 6 = $200K/month",
        },
        {
            type: "risk_flagged",
            description: "Agent flags pacing challenges or saturation risks",
        },
        {
            type: "strategy_recommended",
            description: "Agent recommends adjusted approach for compressed timeline",
        },
    ],
    failureConditions: [
        {
            id: "ignored-timeline-change",
            description: "Agent continues with 12-month pacing after user announced compression",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.30,
            terminateOnDetect: false,
        },
        {
            id: "no-pacing-recalculation",
            description: "Agent did not recalculate monthly spend or pacing",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.20,
            terminateOnDetect: false,
        },
        {
            id: "no-risk-discussion",
            description: "Agent did not discuss pacing risks or saturation challenges",
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
                name: "timeline-change-acknowledged",
                description: "Agent explicitly acknowledged the timeline compression",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const acknowledgmentPatterns = [
                        /(?:6|six)\s*month/i,
                        /timeline.*(?:compressed|shortened|reduced|changed)/i,
                        /(?:from|was).*(?:12|twelve).*(?:to|now).*(?:6|six)/i,
                        /half\s*(?:the\s*)?(?:time|timeline)/i,
                    ];
                    return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "pacing-recalculated",
                description: "Agent recalculated monthly pacing after timeline change",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Look for new pacing calculation: $1.2M / 6 = $200K/month
                    const pacingPatterns = [
                        /\$?200[,\s]?(?:000|K|k).*(?:per|each).*month/i,
                        /(?:monthly|per month).*(?:spend|budget|pace).*\$?200[,\s]?(?:000|K|k)/i,
                        /(?:double|2x|twice).*(?:monthly|pace|spend)/i,
                        /(?:from|was).*\$?100[,\s]?(?:000|K|k).*(?:to|now).*\$?200[,\s]?(?:000|K|k)/i,
                    ];
                    return pacingPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "risks-discussed",
                description: "Agent discussed pacing risks or challenges",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const riskPatterns = [
                        /(?:saturation|fatigue|diminishing returns)/i,
                        /(?:risk|challenge|concern|careful about)/i,
                        /(?:frequency|reach).*(?:ceiling|cap|limit)/i,
                        /(?:learning|ramp|optimization).*(?:period|phase|time)/i,
                        /(?:aggressive|tight|compressed).*(?:pace|timeline)/i,
                        /(?:may|might|could).*(?:struggle|difficulty|challenge)/i,
                    ];
                    return riskPatterns.some((p) => p.test(postChangeResponses));
                },
            },
            {
                name: "strategy-recommended",
                description: "Agent recommended approach for compressed timeline",
                evaluator: (result) => {
                    const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
                    if (postChangeTurns.length === 0)
                        return false;
                    const postChangeResponses = postChangeTurns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const strategyPatterns = [
                        /(?:recommend|suggest|propose|advise)/i,
                        /(?:front-?load|ramp|phase)/i,
                        /(?:prioritize|focus on).*(?:high-?intent|efficient)/i,
                        /(?:test|learn).*(?:quickly|early|fast)/i,
                        /(?:channel|mix).*(?:shift|adjust|optimize)/i,
                        /(?:broader|expand).*(?:initially|first|early)/i,
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
export const timelineCompressionContext = {
    budget: 1200000,
    funnel: "performance",
    kpiAggressiveness: "aggressive", // After timeline compression
    userSophistication: "high",
};
export default timelineCompressionScenario;
//# sourceMappingURL=timeline-compression.js.map