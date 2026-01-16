/**
 * Efficiency Shock Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation efficiency revelation.
 * The agent calculates an implied CAC from the user's inputs, then the user
 * reveals that industry constraints make that CAC impossible.
 *
 * The agent MUST:
 * 1. Acknowledge the efficiency constraint revelation
 * 2. Offer to remodel with realistic efficiency parameters
 * 3. Explain what targets need to change (volume or budget)
 * 4. Walk through trade-off options clearly
 *
 * This tests proactive reforecasting when underlying assumptions are invalidated.
 */

import { TestScenario, UserPersona, DataChange } from "../mpa-multi-turn-types.js";

/**
 * Insurance marketer facing CAC reality check
 */
export const efficiencyShockPersona: UserPersona = {
  id: "efficiency-shock-insurance-director",
  name: "Patricia",
  title: "Director of Digital Marketing",
  company: "SecureLife Insurance",
  industry: "Insurance - Life & Annuities",
  sophisticationLevel: "intermediate",

  knownData: {
    hasObjective: true,
    objective: "Drive new policy applications for life insurance products",
    hasVolume: true,
    volumeTarget: 15000,
    volumeUnit: "policy applications",
    hasBudget: true,
    budget: 750000,
    hasLTV: true,
    ltv: 2800,
    hasCAC: false, // Does not initially know CAC constraints
    hasMargin: true,
    margin: 0.55,
    hasAudienceDefinition: true,
    audienceDescription:
      "Adults aged 35-60 with families seeking life insurance coverage",
    hasGeography: true,
    geography: ["US - Nationwide"],
    hasChannelPreferences: false,
  },

  behavioralTraits: {
    uncertaintyFrequency: 0.2,
    verbosity: "balanced",
    skipTendency: 0.1,
    pushbackFrequency: 0.2,
    providesUnsolicitedInfo: true,
    objectionPatterns: [
      "That's not how our industry works",
      "Insurance is different",
    ],
  },

  languagePatterns: {
    usesJargon: true,
    knownAcronyms: ["CAC", "LTV", "CPL"],
    preferredTerms: {
      customers: "policyholders",
      budget: "media budget",
      goal: "application target",
      success: "bound policies",
    },
    avoidedTerms: [],
    samplePhrases: [
      "Our budget is $750K",
      "We need 15,000 policy applications",
      "Average policyholder LTV is about $2,800",
      "We sell life and annuity products",
      "Margins are healthy at 55%",
    ],
  },

  responseStyle: {
    typicalLength: "medium",
    asksFollowUps: true,
    confirmsUnderstanding: true,
  },
};

/**
 * Data change: User reveals industry CAC floor after agent calculates implied CAC
 *
 * Agent will have calculated $750K / 15K = $50 CAC.
 * User then reveals that insurance industry can't achieve below $120 CAC.
 */
const efficiencyShockChange: DataChange = {
  triggerTurn: 6,
  triggerCondition: "\\$50.*(?:per|cac|cost)|(?:cac|cost).*\\$50", // Trigger when agent mentions $50 CAC
  field: "cac",
  oldValue: null, // Implied $50 from budget/volume
  newValue: 120, // Actual industry floor
  userMessage:
    "Wait, I need to stop you there. In insurance, we can't get anywhere near $50 per " +
    "application. Our industry floor is around $120 per qualified lead, and that's " +
    "on a good day. We've tried everything - that $50 number just isn't realistic for us. " +
    "What does this mean for our plan?",
  expectedBehavior: {
    acknowledges: true,
    recalculates: true,
    explainsImpact: true,
    recommendsAction: true,
  },
};

/**
 * Efficiency Shock Test Scenario
 *
 * Quality Focus: Proactive Reforecasting + Trade-off Analysis
 */
export const efficiencyShockScenario: TestScenario = {
  id: "efficiency-shock",
  name: "Efficiency Shock",
  category: "reforecasting",
  description:
    "Tests proactive reforecasting when user reveals industry constraints invalidate " +
    "initial calculations. Agent MUST remodel, explain trade-offs, and recommend options.",

  persona: efficiencyShockPersona,

  openingMessage:
    "Hi, I'm the Director of Digital Marketing at SecureLife Insurance. We sell " +
    "life and annuity products. I need to build a media plan for next year. " +
    "We have a $750K budget and need 15,000 new policy applications. " +
    "Our average LTV is about $2,800 per policyholder. Can you help?",

  expectedCompletedSteps: [1, 2, 3, 4, 5, 6],
  maxTurns: 35,
  minTurns: 12,
  minExpectedTurns: 15,

  // Data changes to inject mid-conversation
  dataChanges: [efficiencyShockChange],

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
  },

  expectedEvents: [
    {
      type: "calculation_performed",
      description: "Agent calculates implied CAC: $750K / 15K = $50",
    },
    {
      type: "data_change_received",
      description: "User reveals industry CAC floor is $120, not $50",
    },
    {
      type: "reforecast_triggered",
      description: "Agent recalculates achievable volume at $120 CAC",
    },
    {
      type: "trade_offs_explained",
      description: "Agent explains budget vs volume trade-off options",
    },
    {
      type: "options_presented",
      description: "Agent presents 2-3 paths forward",
    },
  ],

  failureConditions: [
    {
      id: "ignored-cac-constraint",
      description:
        "Agent continued with $50 CAC after user said it's impossible",
      type: "custom_pattern",
      severity: "critical",
      scorePenalty: 0.30,
      terminateOnDetect: false,
    },
    {
      id: "no-volume-reforecast",
      description:
        "Agent did not recalculate achievable volume at realistic CAC",
      type: "custom_pattern",
      severity: "major",
      scorePenalty: 0.20,
      terminateOnDetect: false,
    },
    {
      id: "no-trade-off-discussion",
      description:
        "Agent did not walk through budget vs volume trade-offs",
      type: "custom_pattern",
      severity: "major",
      scorePenalty: 0.15,
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
  ],

  successCriteria: {
    minimumOverallScore: 0.75,
    requiredStepsComplete: [1, 2, 3, 4],
    noCriticalFailures: true,
    minimumTurnScores: {
      "reforecasting-quality": 0.7,
      "critical-thinking": 0.7,
      "proactive-calculation": 0.8,
    },
    customCriteria: [
      {
        name: "constraint-acknowledged",
        description: "Agent acknowledged the $120 CAC industry floor",
        evaluator: (result) => {
          // Find the turn where user mentions $120 CAC
          const changeIndex = result.turns.findIndex(
            (t) => t.userMessage.includes("$120") || t.userMessage.includes("120")
          );
          if (changeIndex === -1) return false;

          const postChangeTurns = result.turns.slice(changeIndex + 1);
          if (postChangeTurns.length === 0) return false;

          const postChangeResponses = postChangeTurns
            .map((t) => t.agentResponse)
            .join(" ");

          const acknowledgmentPatterns = [
            /\$?120.*(?:cac|cost|floor|minimum)/i,
            /(?:industry|insurance).*(?:floor|constraint|reality)/i,
            /(?:understand|see|appreciate).*(?:constraint|reality|challenge)/i,
            /(?:not|can't|impossible).*\$?50/i,
          ];

          return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
        },
      },
      {
        name: "volume-recalculated",
        description: "Agent recalculated achievable volume at $120 CAC",
        evaluator: (result) => {
          const changeIndex = result.turns.findIndex(
            (t) => t.userMessage.includes("$120") || t.userMessage.includes("120")
          );
          if (changeIndex === -1) return false;

          const postChangeTurns = result.turns.slice(changeIndex + 1);
          if (postChangeTurns.length === 0) return false;

          const postChangeResponses = postChangeTurns
            .map((t) => t.agentResponse)
            .join(" ");

          // $750K / $120 = 6,250 applications
          const recalcPatterns = [
            /\$?750[,\s]?(?:000|K|k)?\s*[÷\/]\s*\$?120\s*=.*(?:6[,\s]?[02]50|around 6[,\s]?000)/i,
            /(?:achievable|realistic|can get).*(?:6[,\s]?[02]50|6[,\s]?000)/i,
            /(?:6[,\s]?[02]50|6[,\s]?000).*(?:application|lead|customer)/i,
            /(?:at|with).*\$?120.*(?:cac|cost).*(?:means|gives|equals)/i,
          ];

          return recalcPatterns.some((p) => p.test(postChangeResponses));
        },
      },
      {
        name: "trade-offs-explained",
        description: "Agent explained the budget vs volume trade-off",
        evaluator: (result) => {
          const changeIndex = result.turns.findIndex(
            (t) => t.userMessage.includes("$120") || t.userMessage.includes("120")
          );
          if (changeIndex === -1) return false;

          const postChangeTurns = result.turns.slice(changeIndex + 1);
          if (postChangeTurns.length === 0) return false;

          const postChangeResponses = postChangeTurns
            .map((t) => t.agentResponse)
            .join(" ");

          const tradeOffPatterns = [
            /(?:trade-?off|choice|decision)/i,
            /(?:either|or).*(?:increase budget|reduce target)/i,
            /(?:to hit|to reach).*15[,\s]?000.*(?:would need|require)/i,
            /(?:gap|shortfall|difference).*(?:9[,\s]?000|8[,\s]?[57]50)/i, // ~9K gap
            /(?:option|path|approach|scenario)/i,
          ];

          return tradeOffPatterns.some((p) => p.test(postChangeResponses));
        },
      },
      {
        name: "options-presented",
        description: "Agent presented options for moving forward",
        evaluator: (result) => {
          const changeIndex = result.turns.findIndex(
            (t) => t.userMessage.includes("$120") || t.userMessage.includes("120")
          );
          if (changeIndex === -1) return false;

          const postChangeTurns = result.turns.slice(changeIndex + 1);
          if (postChangeTurns.length === 0) return false;

          const postChangeResponses = postChangeTurns
            .map((t) => t.agentResponse)
            .join(" ");

          const optionPatterns = [
            /(?:option|path|approach|scenario)\s*(?:1|one|a)/i,
            /(?:alternatively|or we could|another approach)/i,
            /(?:increase|more).*budget.*(?:to hit|to reach)/i,
            /(?:reduce|lower|adjust).*(?:target|volume|applications)/i,
            /(?:accept|work with).*(?:6[,\s]?[02]50|6[,\s]?000)/i,
          ];

          // Should present at least 2 options
          let optionCount = 0;
          for (const pattern of optionPatterns) {
            if (pattern.test(postChangeResponses)) optionCount++;
          }

          return optionCount >= 2;
        },
      },
    ],
  },
};

/**
 * Context configuration for quality scoring
 */
export const efficiencyShockContext = {
  budget: 750000,
  funnel: "performance" as const,
  kpiAggressiveness: "aggressive" as const, // Because original target is now impossible
  userSophistication: "medium" as const,
};

export default efficiencyShockScenario;
