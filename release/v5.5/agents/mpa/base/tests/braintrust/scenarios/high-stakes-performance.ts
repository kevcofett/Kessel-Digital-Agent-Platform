/**
 * High-Stakes Performance Scenario
 *
 * Phase 1 Quality Test Scenario
 *
 * Tests the agent's ability to handle a high-budget ($2M), aggressive-target
 * performance campaign. This scenario specifically tests:
 *
 * 1. Critical thinking - Does agent challenge the aggressive $40 CAC target?
 * 2. Proactive calculation - Does agent compute implied efficiency immediately?
 * 3. Teaching behavior - Does agent explain why targets may be unrealistic?
 * 4. Benchmark citation - Does agent reference industry norms for fintech?
 * 5. Strategic synthesis - Does agent connect early insights to later steps?
 *
 * Expected Quality Behaviors:
 * - Agent MUST calculate $2M / 50,000 = $40 CAC proactively
 * - Agent SHOULD challenge $40 CAC as aggressive for fintech (typical $80-150)
 * - Agent SHOULD cite benchmarks when discussing efficiency
 * - Agent MUST NOT accept aggressive targets without validation
 * - Agent SHOULD teach user about realistic efficiency expectations
 */

import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";

/**
 * Sophisticated fintech VP persona with aggressive growth targets
 */
export const highStakesPerformancePersona: UserPersona = {
  id: "high-stakes-fintech-vp",
  name: "Marcus",
  title: "VP of Growth",
  company: "PayStream Financial",
  industry: "Fintech - Payments",
  sophisticationLevel: "advanced",

  knownData: {
    hasObjective: true,
    objective: "Drive new customer acquisition for digital payments platform",
    hasVolume: true,
    volumeTarget: 50000,
    volumeUnit: "customers",
    hasBudget: true,
    budget: 2000000,
    hasLTV: true,
    ltv: 850,
    hasCAC: false, // Does NOT know CAC - agent should calculate
    hasMargin: true,
    margin: 0.28,
    hasAudienceDefinition: true,
    audienceDescription:
      "Small business owners processing $10K-100K monthly transactions",
    hasGeography: true,
    geography: ["US - Major Metros", "US - Expansion Markets"],
    hasChannelPreferences: true,
    preferredChannels: ["LinkedIn", "Google Ads", "Programmatic B2B"],
  },

  behavioralTraits: {
    uncertaintyFrequency: 0.1,
    verbosity: "detailed",
    skipTendency: 0.2,
    pushbackFrequency: 0.3, // Will push back on agent recommendations
    providesUnsolicitedInfo: true,
    objectionPatterns: [
      "But our competitors are growing faster",
      "Leadership wants aggressive targets",
      "We need to hit these numbers",
    ],
  },

  languagePatterns: {
    usesJargon: true,
    knownAcronyms: ["CAC", "LTV", "MQL", "SQL", "ARR", "MRR", "ROAS", "CPA"],
    preferredTerms: {
      customers: "merchants",
      budget: "media investment",
      goal: "acquisition target",
      success: "growth metrics",
    },
    avoidedTerms: [],
    samplePhrases: [
      "We're targeting 50,000 new merchants this year",
      "Media investment is $2M for the fiscal year",
      "Our merchant LTV is around $850 over 3 years",
      "Margins are tight at 28% but improving",
      "We need to scale acquisition fast to hit ARR targets",
      "Small business is our core segment",
      "Looking to expand beyond major metros",
    ],
  },

  responseStyle: {
    typicalLength: "medium",
    asksFollowUps: true,
    confirmsUnderstanding: false, // Sophisticated users often don't confirm
  },
};

/**
 * High-Stakes Performance Test Scenario
 *
 * Quality Focus: Mentorship + Critical Thinking + Plan Coherence
 */
export const highStakesPerformanceScenario: TestScenario = {
  id: "high-stakes-performance",
  name: "High-Stakes Performance Campaign",
  category: "phase1-quality",
  description:
    "Tests quality of guidance for $2M budget with aggressive $40 CAC target. " +
    "Agent MUST challenge unrealistic targets and show calculations.",

  persona: highStakesPerformancePersona,

  openingMessage:
    "Hi, I'm the VP of Growth at PayStream Financial. We're a fintech payments platform. " +
    "I need to build a media plan for next year. We have a $2M budget and need to acquire " +
    "50,000 new merchants. Our merchant LTV is about $850. Can you help me structure this?",

  expectedCompletedSteps: [1, 2, 3, 4, 5],
  maxTurns: 30,
  minTurns: 8,
  minExpectedTurns: 10,

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
  },

  expectedEvents: [
    {
      type: "calculation_performed",
      description: "Agent calculates implied CAC: $2M / 50K = $40",
    },
    {
      type: "benchmark_cited",
      description: "Agent cites fintech CAC benchmarks ($80-150 typical)",
    },
    {
      type: "step_transition",
      description: "Agent transitions through Steps 1-5 with quality guidance",
    },
  ],

  failureConditions: [
    {
      id: "unchallenged-aggressive-target",
      description:
        "Agent accepts $40 CAC target without questioning feasibility",
      type: "custom_pattern",
      severity: "critical",
      scorePenalty: 0.25,
      terminateOnDetect: false,
    },
    {
      id: "no-calculation-shown",
      description: "Agent does not show $2M / 50K = $40 calculation in Step 2",
      type: "custom_pattern",
      severity: "major",
      scorePenalty: 0.15,
      terminateOnDetect: false,
    },
    {
      id: "no-benchmark-reference",
      description:
        "Agent makes efficiency claims without citing industry benchmarks",
      type: "custom_pattern",
      severity: "major",
      scorePenalty: 0.1,
      terminateOnDetect: false,
    },
    {
      id: "interrogation-without-teaching",
      description:
        "Agent asks 3+ questions in a row without explaining importance",
      type: "excessive_questions",
      severity: "major",
      scorePenalty: 0.1,
      terminateOnDetect: false,
    },
    {
      id: "premature-channel-discussion",
      description: "Agent discusses specific channels before Step 7",
      type: "step_boundary_violation",
      severity: "warning",
      scorePenalty: 0.05,
      terminateOnDetect: false,
    },
  ],

  successCriteria: {
    minimumOverallScore: 0.75,
    requiredStepsComplete: [1, 2, 3, 4, 5],
    noCriticalFailures: true,
    minimumTurnScores: {
      "teaching-behavior": 0.7,
      "proactive-calculation": 0.8,
      "critical-thinking": 0.7,
      "benchmark-citation": 0.6,
      "step-boundary": 0.8,
    },
    customCriteria: [
      {
        name: "calculation-present",
        description: "Agent showed $2M / 50K = $40 calculation",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          // Check for division pattern with these specific numbers
          const hasCalculation =
            /\$?2[,\s]?(?:000[,\s]?000|M|m|million)?\s*[÷\/]\s*50[,\s]?(?:000|K|k)?\s*=\s*\$?40/i.test(
              allResponses
            ) ||
            /(?:equals?|=|implies?|projects? to|that['']?s|works out to)\s*\$?40\s*(?:per|CAC|acquisition|cost|merchant)/i.test(
              allResponses
            );
          return hasCalculation;
        },
      },
      {
        name: "target-challenged",
        description: "Agent challenged the aggressive $40 CAC target",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          // Check for challenge language around the target
          const challengePatterns = [
            /aggressive|ambitious|challenging|tight|difficult|below.*(?:benchmark|typical|industry)/i,
            /typical.*(?:fintech|b2b|saas).*\$?(?:80|90|100|120|150)/i,
            /benchmark.*(?:suggest|shows?|indicates?).*higher/i,
            /(?:may|might|could) be.*(?:difficult|challenging|unrealistic)/i,
            /let['']?s.*(?:validate|verify|check|assess).*(?:feasibility|realistic)/i,
          ];
          return challengePatterns.some((p) => p.test(allResponses));
        },
      },
      {
        name: "teaching-not-interrogation",
        description: "Agent explained WHY questions matter, not just asked them",
        evaluator: (result) => {
          // Count turns with teaching behavior indicators
          let teachingTurns = 0;
          let totalAgentTurns = 0;

          for (const turn of result.turns) {
            if (turn.agentResponse.length > 50) {
              totalAgentTurns++;
              // Check for teaching indicators
              const teachingPatterns = [
                /this.*(?:matters?|important|helps?|because)/i,
                /(?:reason|why).*(?:ask|want to know|need)/i,
                /let me explain/i,
                /understanding.*(?:helps?|allows?|enables?)/i,
                /so we can/i,
                /this will.*(?:help|allow|enable)/i,
              ];
              if (teachingPatterns.some((p) => p.test(turn.agentResponse))) {
                teachingTurns++;
              }
            }
          }

          // At least 40% of turns should have teaching behavior
          return totalAgentTurns > 0 && teachingTurns / totalAgentTurns >= 0.4;
        },
      },
      {
        name: "strategic-synthesis-present",
        description:
          "Agent connected Step 2 economics to later budget/channel decisions",
        evaluator: (result) => {
          // Check if later steps reference earlier efficiency insights
          const laterStepTurns = result.turns.filter(
            (t) => t.currentStep >= 4 && t.agentResponse.length > 100
          );
          if (laterStepTurns.length === 0) return true; // Not applicable if didn't reach later steps

          const synthesisPatterns = [
            /(?:given|based on|considering).*\$?40.*(?:efficiency|cac|target)/i,
            /earlier.*(?:discussed|established|calculated)/i,
            /(?:our|your).*efficiency.*(?:constraints?|target|goal)/i,
            /(?:step|earlier) (?:1|2).*(?:showed|indicated|established)/i,
          ];

          const allLaterResponses = laterStepTurns
            .map((t) => t.agentResponse)
            .join(" ");
          return synthesisPatterns.some((p) => p.test(allLaterResponses));
        },
      },
    ],
  },
};

/**
 * Context configuration for quality scoring
 */
export const highStakesPerformanceContext = {
  budget: 2000000,
  funnel: "performance" as const,
  kpiAggressiveness: "aggressive" as const,
  userSophistication: "high" as const,
};

export default highStakesPerformanceScenario;
