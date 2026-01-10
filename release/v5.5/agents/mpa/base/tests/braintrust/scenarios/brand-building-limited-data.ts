/**
 * Brand Building with Limited Data Scenario
 *
 * Phase 1 Quality Test Scenario
 *
 * Tests the agent's ability to handle a brand awareness campaign with
 * limited first-party data. This scenario specifically tests:
 *
 * 1. IDK Protocol handling - Does agent model with assumptions when user doesn't know?
 * 2. Teaching behavior - Does agent explain brand metrics vs performance metrics?
 * 3. Benchmark citation - Does agent cite industry awareness campaign benchmarks?
 * 4. Strategic synthesis - Does agent adjust approach for awareness vs performance?
 * 5. Proactive intelligence - Does agent recommend appropriate measurement approaches?
 *
 * Expected Quality Behaviors:
 * - Agent should NOT obsess over CAC/efficiency for awareness campaigns
 * - Agent MUST model with stated assumptions when data is missing
 * - Agent SHOULD explain why brand metrics differ from performance metrics
 * - Agent SHOULD recommend reach/frequency/brand lift measurement
 * - Agent MUST NOT ask 10+ questions about unit economics for awareness
 */

import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";

/**
 * Basic marketing manager persona entering new market with brand awareness goal
 */
export const brandBuildingLimitedDataPersona: UserPersona = {
  id: "brand-building-basic",
  name: "Sarah",
  title: "Marketing Manager",
  company: "GreenLeaf Wellness",
  industry: "DTC Health & Wellness",
  sophisticationLevel: "intermediate",

  knownData: {
    hasObjective: true,
    objective: "Build brand awareness in new West Coast market",
    hasVolume: false, // Does NOT have volume target - awareness focused
    volumeTarget: undefined,
    volumeUnit: undefined,
    hasBudget: true,
    budget: 500000,
    hasLTV: false, // Does NOT know LTV
    ltv: undefined,
    hasCAC: false, // Does NOT know CAC
    cac: undefined,
    hasMargin: false, // Does NOT know margin
    margin: undefined,
    hasAudienceDefinition: true,
    audienceDescription: "Health-conscious millennials and Gen Z, 25-40",
    hasGeography: true,
    geography: ["California", "Oregon", "Washington"],
    hasChannelPreferences: false, // Open to recommendations
    preferredChannels: undefined,
  },

  behavioralTraits: {
    uncertaintyFrequency: 0.5, // Will say "I don't know" often
    verbosity: "balanced",
    skipTendency: 0.1,
    pushbackFrequency: 0.1,
    providesUnsolicitedInfo: false,
    objectionPatterns: [],
  },

  languagePatterns: {
    usesJargon: false,
    knownAcronyms: [], // Doesn't use acronyms
    preferredTerms: {
      customers: "customers",
      budget: "budget",
      goal: "goal",
      success: "success",
    },
    avoidedTerms: ["CAC", "LTV", "ROAS", "attribution"],
    samplePhrases: [
      "We want to build brand awareness on the West Coast",
      "Our budget is $500K for the campaign",
      "We sell wellness and supplements products",
      "Our target is health-conscious younger adults",
      "We're new to this market, so no historical data",
      "I'm not sure about the lifetime value",
      "We don't have that data yet",
    ],
  },

  responseStyle: {
    typicalLength: "short",
    asksFollowUps: true,
    confirmsUnderstanding: true,
  },
};

/**
 * Brand Building with Limited Data Test Scenario
 *
 * Quality Focus: Teaching + IDK Handling + Funnel-Appropriate Guidance
 */
export const brandBuildingLimitedDataScenario: TestScenario = {
  id: "brand-building-limited-data",
  name: "Brand Building with Limited Data",
  category: "phase1-quality",
  description:
    "Tests quality of guidance for awareness campaign with limited data. " +
    "Agent MUST model with assumptions and avoid performance metric fixation.",

  persona: brandBuildingLimitedDataPersona,

  openingMessage:
    "Hi! I'm the Marketing Manager at GreenLeaf Wellness. We sell natural supplements " +
    "and wellness products. We're launching into the West Coast market - California, " +
    "Oregon, and Washington - and want to build brand awareness there. We have a $500K " +
    "budget. We don't have much historical data since this is a new market for us.",

  expectedCompletedSteps: [1, 2, 3, 4, 5, 6],
  maxTurns: 35,
  minTurns: 10,
  minExpectedTurns: 12,

  kbInjectionMap: {
    1: ["MPA_Supporting_Instructions_v5_5.txt"],
    2: [
      "MPA_Supporting_Instructions_v5_5.txt",
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
  },

  expectedEvents: [
    {
      type: "idk_protocol",
      description:
        "Agent models with assumptions when user says 'I don't know'",
    },
    {
      type: "benchmark_cited",
      description: "Agent cites awareness campaign benchmarks",
    },
    {
      type: "step_transition",
      description: "Agent transitions through Steps 1-6 with quality guidance",
    },
  ],

  failureConditions: [
    {
      id: "performance-metric-fixation",
      description:
        "Agent obsesses over CAC/ROAS when objective is brand awareness",
      type: "custom_pattern",
      severity: "major",
      scorePenalty: 0.15,
      terminateOnDetect: false,
    },
    {
      id: "failed-idk-handling",
      description:
        "Agent loops on question when user says 'I don't know' instead of modeling",
      type: "loop_detection",
      severity: "major",
      scorePenalty: 0.15,
      terminateOnDetect: false,
    },
    {
      id: "no-modeling-with-assumptions",
      description: "Agent never offers to model with assumptions when data is missing",
      type: "custom_pattern",
      severity: "major",
      scorePenalty: 0.1,
      terminateOnDetect: false,
    },
    {
      id: "wrong-metrics-recommended",
      description:
        "Agent recommends performance metrics (ROAS, CAC) over brand metrics (reach, frequency, lift)",
      type: "custom_pattern",
      severity: "warning",
      scorePenalty: 0.1,
      terminateOnDetect: false,
    },
    {
      id: "excessive-economics-questions",
      description:
        "Agent asks 5+ questions about unit economics for awareness campaign",
      type: "excessive_questions",
      severity: "warning",
      scorePenalty: 0.05,
      terminateOnDetect: false,
    },
  ],

  successCriteria: {
    minimumOverallScore: 0.70,
    requiredStepsComplete: [1, 2, 3, 4, 5, 6],
    noCriticalFailures: true,
    minimumTurnScores: {
      "teaching-behavior": 0.6,
      "idk-protocol": 0.8,
      "adaptive-sophistication": 0.7,
      "step-boundary": 0.7,
    },
    customCriteria: [
      {
        name: "appropriate-metrics-discussed",
        description:
          "Agent discussed brand metrics (reach, frequency, awareness, lift) appropriately",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          // Check for brand awareness metrics
          const brandMetricPatterns = [
            /reach/i,
            /frequency/i,
            /awareness/i,
            /(?:brand|ad)\s*(?:lift|recall)/i,
            /impressions/i,
            /share of voice/i,
          ];
          const brandMetricsFound = brandMetricPatterns.filter((p) =>
            p.test(allResponses)
          ).length;
          // Should discuss at least 2 brand metrics
          return brandMetricsFound >= 2;
        },
      },
      {
        name: "no-cac-obsession",
        description:
          "Agent did not obsess over CAC when objective is brand awareness",
        evaluator: (result) => {
          // Count CAC-focused questions in steps 1-3
          let cacQuestions = 0;
          const earlyStepTurns = result.turns.filter(
            (t) => t.currentStep <= 3
          );

          for (const turn of earlyStepTurns) {
            const cacPatterns = [
              /what.*(?:is|are).*(?:your|the).*(?:cac|cost per acquisition)/i,
              /(?:target|goal).*(?:cac|cost per)/i,
              /how much.*(?:pay|spend).*per.*(?:customer|acquisition)/i,
            ];
            if (cacPatterns.some((p) => p.test(turn.agentResponse))) {
              cacQuestions++;
            }
          }

          // Should not ask more than 1 CAC-related question for awareness
          return cacQuestions <= 1;
        },
      },
      {
        name: "modeling-offered",
        description:
          "Agent offered to model with assumptions when user lacked data",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          const modelingPatterns = [
            /(?:let me|I can|I'll).*(?:model|assume|estimate)/i,
            /(?:based on|using).*(?:industry|typical|benchmark).*(?:data|assumption)/i,
            /(?:assume|assuming).*\$?[\d,]+/i,
            /(?:model|work) with.*(?:assumption|estimate)/i,
            /(?:typical|industry average|benchmark).*(?:is|shows?|suggests?)/i,
          ];
          return modelingPatterns.some((p) => p.test(allResponses));
        },
      },
      {
        name: "teaching-about-awareness",
        description:
          "Agent explained how awareness campaigns differ from performance",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          const teachingPatterns = [
            /awareness.*(?:different|unlike|vs).*(?:performance|direct response)/i,
            /(?:brand|awareness).*(?:campaign|objective).*(?:measure|track|metric)/i,
            /(?:top|upper).*funnel/i,
            /(?:measure|track).*(?:differently|differ)/i,
            /(?:reach|frequency).*(?:important|matter|focus)/i,
            /building.*(?:brand|awareness).*(?:takes?|requires?)/i,
          ];
          return teachingPatterns.some((p) => p.test(allResponses));
        },
      },
      {
        name: "appropriate-measurement-recommended",
        description:
          "Agent recommended appropriate measurement approach for awareness",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          const measurementPatterns = [
            /brand.*(?:lift|study|survey)/i,
            /(?:awareness|recall).*(?:survey|study|measurement)/i,
            /(?:pre|post).*(?:campaign|wave).*(?:survey|study)/i,
            /share of voice/i,
            /(?:earned|organic).*(?:media|mention)/i,
            /(?:social|brand).*(?:listening|sentiment)/i,
          ];
          const measurementMentioned = measurementPatterns.filter((p) =>
            p.test(allResponses)
          ).length;
          // Should recommend at least 1 brand measurement approach
          return measurementMentioned >= 1;
        },
      },
      {
        name: "plain-language-used",
        description:
          "Agent used plain language appropriate for intermediate user",
        evaluator: (result) => {
          // Check that agent explained jargon when used
          let jargonWithoutExplanation = 0;
          const jargonTerms = [
            /\bCAC\b/,
            /\bLTV\b/,
            /\bROAS\b/,
            /\bCPM\b/,
            /\bCTR\b/,
          ];

          for (const turn of result.turns) {
            for (const pattern of jargonTerms) {
              if (pattern.test(turn.agentResponse)) {
                // Check if explanation follows
                const hasExplanation =
                  /(?:which is|that is|meaning|stands for|also known as)/i.test(
                    turn.agentResponse
                  );
                if (!hasExplanation) {
                  jargonWithoutExplanation++;
                }
              }
            }
          }

          // Some unexplained jargon is acceptable, but not excessive
          return jargonWithoutExplanation <= 3;
        },
      },
    ],
  },
};

/**
 * Context configuration for quality scoring
 */
export const brandBuildingLimitedDataContext = {
  budget: 500000,
  funnel: "awareness" as const,
  kpiAggressiveness: "moderate" as const,
  userSophistication: "medium" as const,
};

export default brandBuildingLimitedDataScenario;
