"use strict";
/**
 * Multi-Audience Channel Allocation Scenario
 *
 * Advanced complexity: Multiple target audiences with different channel
 * allocations for each. This builds on multi-audience-unified-plan by adding
 * the complexity of segment-specific media mix recommendations.
 *
 * This scenario specifically tests:
 * 1. Agent can recommend different channel mixes per segment
 * 2. Agent justifies channel selections based on segment attributes
 * 3. Agent handles budget allocation both by segment AND by channel
 * 4. Agent discusses creative/messaging needs per channel per segment
 * 5. Agent maintains coherence across complex multi-dimensional plan
 * 6. Agent can calculate and present multi-layered budget breakdowns
 *
 * Expected Quality Behaviors:
 * - Agent MUST recommend different channels for different segments
 * - Agent SHOULD justify channel choices based on segment behaviors
 * - Agent MUST NOT recommend identical channel mixes for distinct segments
 * - Agent SHOULD show budget breakdown by segment AND by channel
 * - Agent MUST maintain tracking/measurement approach per segment-channel
 * - Agent SHOULD discuss creative requirements per segment-channel combo
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiAudienceChannelAllocationContext = exports.multiAudienceChannelAllocationScenario = exports.multiAudienceChannelPersona = void 0;
/**
 * VP Marketing with complex multi-segment, multi-channel requirements
 */
exports.multiAudienceChannelPersona = {
    id: "multi-audience-channel-expert",
    name: "Alexandra",
    title: "VP of Marketing",
    company: "EduPath Online Learning",
    industry: "EdTech - Online Education",
    sophisticationLevel: "expert",
    knownData: {
        hasObjective: true,
        objective: "Drive enrollments across three distinct learner segments with optimized channel mix per segment",
        hasVolume: true,
        volumeTarget: 50000, // Total enrollments
        volumeUnit: "enrollments",
        hasBudget: true,
        budget: 5000000,
        hasLTV: true,
        ltv: 1200, // Varies by segment but average
        hasCAC: false,
        hasMargin: true,
        margin: 0.58,
        hasAudienceDefinition: true,
        audienceDescription: "Three learner segments: " +
            "(1) Career Changers 28-42: Mid-career professionals seeking upskilling, active on LinkedIn, podcast listeners, research-heavy purchase journey; " +
            "(2) College-Age 18-24: Traditional students exploring alternatives to 4-year degrees, heavy TikTok/Instagram, influencer-driven, mobile-first; " +
            "(3) Corporate L&D 35-55: HR/L&D decision-makers at mid-large companies, LinkedIn heavy, trade publication readers, B2B sales cycle",
        hasGeography: true,
        geography: [
            "Career Changers: Tech hub metros (SF, Seattle, Austin, NYC, Boston, Denver)",
            "College-Age: National, index high on college towns and urban centers",
            "Corporate L&D: National, index high on corporate HQ cities",
        ],
        hasChannelPreferences: true,
        preferredChannels: [
            "Career Changers: LinkedIn, Podcasts, Search, Programmatic",
            "College-Age: TikTok, Instagram, YouTube, Influencer",
            "Corporate L&D: LinkedIn, Trade Pubs, ABM, Events",
        ],
    },
    behavioralTraits: {
        uncertaintyFrequency: 0.05,
        verbosity: "detailed",
        skipTendency: 0.1,
        pushbackFrequency: 0.15,
        providesUnsolicitedInfo: true,
        objectionPatterns: [
            "Each segment consumes media very differently",
            "LinkedIn for college-age would be a waste",
            "TikTok for corporate buyers won't work",
            "We need segment-specific creative and channel strategies",
        ],
    },
    languagePatterns: {
        usesJargon: true,
        knownAcronyms: [
            "CAC",
            "LTV",
            "ABM",
            "L&D",
            "CPC",
            "CPE",
            "CPM",
            "ROAS",
            "CTV",
        ],
        preferredTerms: {
            customers: "learners",
            budget: "media investment",
            goal: "enrollment targets",
            success: "cost per enrollment",
        },
        avoidedTerms: [],
        samplePhrases: [
            "Career changers are heavy LinkedIn and podcast consumers",
            "College-age segment lives on TikTok and Instagram",
            "Corporate L&D requires ABM and direct sales support",
            "Each segment needs completely different channel mix",
            "We can't use a one-size-fits-all media approach",
            "Budget should reflect channel costs per segment",
        ],
    },
    responseStyle: {
        typicalLength: "long",
        asksFollowUps: false,
        confirmsUnderstanding: true,
    },
};
/**
 * Multi-Audience Channel Allocation Test Scenario
 */
exports.multiAudienceChannelAllocationScenario = {
    id: "multi-audience-channel-allocation",
    name: "Multi-Audience with Segment-Specific Channels",
    category: "phase1-quality",
    description: "Advanced test: Multiple target audiences with different channel allocations " +
        "for each segment. Agent MUST recommend distinct channel mixes based on segment " +
        "behaviors and justify the segment-channel-budget matrix.",
    persona: exports.multiAudienceChannelPersona,
    openingMessage: "I'm the VP of Marketing at EduPath Online Learning. We need a sophisticated media " +
        "plan that targets three very different learner segments - each requires its own channel strategy.\n\n" +
        "Total budget: $5M for 50,000 enrollments.\n\n" +
        "Segment 1 - Career Changers (28-42): Mid-career professionals looking to upskill. " +
        "They're heavy LinkedIn users, listen to business/tech podcasts, do extensive research " +
        "before enrolling. Primary geos are tech hubs - SF, Seattle, Austin, NYC, Boston, Denver.\n\n" +
        "Segment 2 - College-Age (18-24): Gen Z exploring alternatives to traditional 4-year degrees. " +
        "They're on TikTok and Instagram constantly, influenced by creators, mobile-first. National reach " +
        "but indexing high in college towns and urban centers.\n\n" +
        "Segment 3 - Corporate L&D (35-55): HR and L&D decision-makers at mid to large companies. " +
        "LinkedIn-heavy, read trade publications, need ABM approach, longer B2B sales cycle. " +
        "National but indexed on corporate HQ cities.\n\n" +
        "Each segment consumes media completely differently. I need channel recommendations " +
        "specific to each segment, not a one-size-fits-all approach.",
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
            type: "calculation_performed",
            description: "Agent calculates CPE by segment and channel",
        },
        {
            type: "step_transition",
            description: "Agent progresses through steps with segment-channel clarity",
        },
    ],
    failureConditions: [
        {
            id: "identical-channel-mix",
            description: "Agent recommends same channel mix for distinct segments",
            type: "custom_pattern",
            severity: "critical",
            scorePenalty: 0.25,
            terminateOnDetect: false,
        },
        {
            id: "wrong-channel-segment-match",
            description: "Agent recommends TikTok for corporate L&D or LinkedIn for college-age",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.15,
            terminateOnDetect: false,
        },
        {
            id: "no-channel-justification",
            description: "Agent recommends channels without explaining fit to segment behaviors",
            type: "custom_pattern",
            severity: "major",
            scorePenalty: 0.1,
            terminateOnDetect: false,
        },
        {
            id: "missing-budget-breakdown",
            description: "Agent doesn't break down budget by segment AND by channel",
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
        },
        customCriteria: [
            {
                name: "distinct-channel-mixes",
                description: "Agent recommended different channels for each segment",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // Check for segment-specific channel mentions
                    const careerChannels = /(?:career|upskill|28.42).*(?:linkedin|podcast|search)/i.test(allResponses);
                    const collegeChannels = /(?:college|18.24|gen.z).*(?:tiktok|instagram|influencer)/i.test(allResponses);
                    const corporateChannels = /(?:corporate|l&d|hr).*(?:linkedin|abm|trade)/i.test(allResponses);
                    return careerChannels && collegeChannels && corporateChannels;
                },
            },
            {
                name: "channel-behavior-justification",
                description: "Agent justified channel choices based on segment behaviors",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const justificationPatterns = [
                        /(?:because|since|given).*(?:listen|consume|use|spend time)/i,
                        /(?:podcast|linkedin|tiktok).*(?:reach|engage|resonate)/i,
                        /(?:media consumption|channel preference|behavior).*(?:segment|audience)/i,
                        /(?:career changer|college.age|corporate).*(?:active|heavy|prefer)/i,
                    ];
                    return justificationPatterns.filter((p) => p.test(allResponses))
                        .length >= 2;
                },
            },
            {
                name: "no-wrong-channel-segment",
                description: "Agent didn't recommend wrong channels for segments",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    // These would be wrong recommendations
                    const wrongPatterns = [
                        /(?:college|18.24|gen.z).*(?:recommend|suggest).*linkedin/i,
                        /(?:corporate|l&d|hr).*(?:recommend|suggest).*tiktok/i,
                        /tiktok.*(?:corporate|l&d|hr)/i,
                        /linkedin.*(?:primary|main|focus).*(?:college|18.24)/i,
                    ];
                    const wrongFound = wrongPatterns.filter((p) => p.test(allResponses)).length;
                    return wrongFound === 0;
                },
            },
            {
                name: "segment-channel-budget-matrix",
                description: "Agent provided budget breakdown by segment and channel",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const matrixPatterns = [
                        /(?:career|college|corporate).*\$[\d,]+.*(?:linkedin|tiktok|podcast)/i,
                        /(?:linkedin|tiktok|podcast).*\$[\d,]+.*(?:segment|career|college)/i,
                        /(?:breakdown|allocat).*(?:segment|audience).*(?:channel|platform)/i,
                        /\d+%.*(?:segment|career|college|corporate).*(?:channel|platform)/i,
                    ];
                    return matrixPatterns.some((p) => p.test(allResponses));
                },
            },
            {
                name: "creative-messaging-per-segment",
                description: "Agent discussed creative/messaging needs per segment",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const creativePatterns = [
                        /(?:messaging|creative|content).*(?:different|vary|specific).*(?:segment|audience)/i,
                        /(?:career|college|corporate).*(?:messaging|creative|tone)/i,
                        /(?:segment|audience).specific.*(?:creative|message|content)/i,
                    ];
                    return creativePatterns.some((p) => p.test(allResponses));
                },
            },
            {
                name: "measurement-per-segment-channel",
                description: "Agent discussed measurement approach per segment-channel",
                evaluator: (result) => {
                    const allResponses = result.turns
                        .map((t) => t.agentResponse)
                        .join(" ");
                    const measurementPatterns = [
                        /(?:track|measure|attribute).*(?:segment|audience).*(?:channel|platform)/i,
                        /(?:kpi|metric).*(?:vary|different).*(?:segment|channel)/i,
                        /(?:segment|channel).level.*(?:performance|reporting|tracking)/i,
                    ];
                    return measurementPatterns.some((p) => p.test(allResponses));
                },
            },
        ],
    },
};
/**
 * Context configuration for quality scoring
 */
exports.multiAudienceChannelAllocationContext = {
    budget: 5000000,
    funnel: "performance",
    kpiAggressiveness: "moderate",
    userSophistication: "high",
};
exports.default = exports.multiAudienceChannelAllocationScenario;
//# sourceMappingURL=multi-audience-channel-allocation.js.map