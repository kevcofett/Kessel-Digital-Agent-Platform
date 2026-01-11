/**
 * Budget Decrease Midstream Scenario
 *
 * Tests Proactive Reforecasting
 *
 * Tests the agent's ability to handle a mid-conversation budget CUT.
 * The user starts with a $1M budget, then at turn 7 reveals the budget
 * has been cut to $600K due to company-wide cost reduction.
 *
 * The agent MUST:
 * 1. Acknowledge the budget cut explicitly
 * 2. Recalculate affected metrics (CAC becomes more aggressive)
 * 3. Explain what the cut means strategically (trade-offs, reduced reach)
 * 4. Recommend prioritization - what to cut vs. keep
 *
 * This tests the "Re-run forecasts after every meaningful input" requirement
 * in a NEGATIVE change scenario (harder than increases).
 */

import { TestScenario, UserPersona, DataChange } from "../mpa-multi-turn-types.js";

/**
 * Enterprise tech marketer facing budget cuts
 */
export const budgetDecreasePersona: UserPersona = {
  id: "budget-decrease-enterprise-vp",
  name: "Marcus",
  title: "VP of Demand Generation",
  company: "DataScale Systems",
  industry: "Enterprise Software - Data Infrastructure",
  sophisticationLevel: "advanced",

  knownData: {
    hasObjective: true,
    objective: "Drive enterprise pipeline for data platform",
    hasVolume: true,
    volumeTarget: 500,
    volumeUnit: "qualified opportunities",
    hasBudget: true,
    budget: 1000000, // Initial budget - will be CUT mid-conversation
    hasLTV: true,
    ltv: 150000,
    hasCAC: false,
    hasMargin: true,
    margin: 0.72,
    hasAudienceDefinition: true,
    audienceDescription:
      "Enterprise companies (5000+ employees) with data engineering teams, " +
      "targeting VP/Director level decision makers in IT and Data",
    hasGeography: true,
    geography: ["US", "UK", "Germany"],
    hasChannelPreferences: true,
  },

  behavioralTraits: {
    uncertaintyFrequency: 0.15,
    verbosity: "detailed",
    skipTendency: 0.05,
    pushbackFrequency: 0.2,
    providesUnsolicitedInfo: true,
    objectionPatterns: ["need to be strategic about this"],
  },

  languagePatterns: {
    usesJargon: true,
    knownAcronyms: ["CAC", "LTV", "MQL", "SQL", "ACV", "ABM", "ICP"],
    preferredTerms: {
      customers: "opportunities",
      budget: "investment",
      goal: "pipeline target",
      success: "ROI",
    },
    avoidedTerms: [],
    samplePhrases: [
      "We're looking at a $1M investment for next year",
      "Target is 500 qualified opportunities",
      "ACV is around $150K per deal",
      "We need to be laser-focused on enterprise accounts",
      "LinkedIn and ABM are core to our strategy",
    ],
  },

  responseStyle: {
    typicalLength: "long",
    asksFollowUps: true,
    confirmsUnderstanding: true,
  },
};

/**
 * Data change: Budget DECREASES from $1M to $600K at turn 7
 */
const budgetDecreaseChange: DataChange = {
  triggerTurn: 7,
  field: "budget",
  oldValue: 1000000,
  newValue: 600000,
  userMessage:
    "I just got out of a budget review meeting and I have bad news. " +
    "We're facing company-wide cost cuts and my budget has been reduced from $1M to $600K. " +
    "That's a 40% cut. What do we need to change? I still need to hit my pipeline targets.",
  expectedBehavior: {
    acknowledges: true,
    recalculates: true,
    explainsImpact: true,
    recommendsAction: true,
  },
};

/**
 * Budget Decrease Midstream Test Scenario
 *
 * Quality Focus: Proactive Reforecasting under constraint
 */
export const budgetDecreaseMidstreamScenario: TestScenario = {
  id: "budget-decrease-midstream",
  name: "Budget Decrease Midstream",
  category: "reforecasting",
  description:
    "Tests proactive reforecasting when user reveals significant budget CUT mid-conversation. " +
    "Agent MUST recalculate, explain trade-offs, and recommend prioritization.",

  persona: budgetDecreasePersona,

  openingMessage:
    "Hi, I'm VP of Demand Gen at DataScale Systems. We sell enterprise data infrastructure " +
    "with an average deal size of $150K. I need to build a media plan for next year. " +
    "We have $1M budget and need to generate 500 qualified opportunities. " +
    "Our ICP is enterprise companies with 5000+ employees, targeting data and IT leaders.",

  expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
  maxTurns: 40,
  minTurns: 14,
  minExpectedTurns: 18,

  // Data changes to inject mid-conversation
  dataChanges: [budgetDecreaseChange],

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
      description: "Agent calculates initial cost per opp: $1M / 500 = $2,000",
    },
    {
      type: "data_change_received",
      description: "User reveals budget cut to $600K at turn 7",
    },
    {
      type: "reforecast_triggered",
      description: "Agent recalculates: $600K / 500 = $1,200 (very aggressive)",
    },
    {
      type: "impact_explained",
      description: "Agent explains trade-offs and reduced capabilities",
    },
    {
      type: "action_recommended",
      description: "Agent recommends what to prioritize vs. cut",
    },
  ],

  failureConditions: [
    {
      id: "ignored-budget-cut",
      description:
        "Agent continues with old $1M budget after user announced cut",
      type: "custom_pattern",
      severity: "critical",
      scorePenalty: 0.30,
      terminateOnDetect: false,
    },
    {
      id: "no-recalculation-after-cut",
      description:
        "Agent acknowledged cut but did not recalculate efficiency metrics",
      type: "custom_pattern",
      severity: "major",
      scorePenalty: 0.20,
      terminateOnDetect: false,
    },
    {
      id: "no-prioritization-guidance",
      description:
        "Agent did not recommend what to cut or prioritize with reduced budget",
      type: "custom_pattern",
      severity: "major",
      scorePenalty: 0.15,
      terminateOnDetect: false,
    },
    {
      id: "unrealistic-optimism",
      description:
        "Agent suggests 40% budget cut won't significantly impact results",
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
    requiredStepsComplete: [1, 2, 3, 4, 5],
    noCriticalFailures: true,
    minimumTurnScores: {
      "reforecasting-quality": 0.7,
      "teaching-behavior": 0.6,
      "proactive-calculation": 0.7,
    },
    customCriteria: [
      {
        name: "budget-cut-acknowledged",
        description: "Agent explicitly acknowledged the budget cut to $600K",
        evaluator: (result) => {
          const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
          if (postChangeTurns.length === 0) return false;

          const postChangeResponses = postChangeTurns
            .map((t) => t.agentResponse)
            .join(" ");

          const acknowledgmentPatterns = [
            /\$?600[,\s]?(?:000|K|k)/i,
            /(?:budget|investment).*(?:reduced|cut|decreased|now)/i,
            /(?:40%|forty percent).*(?:cut|reduction)/i,
            /(?:from|was).*\$?1[,\s]?(?:000|M|m).*(?:to|now).*\$?600/i,
          ];

          return acknowledgmentPatterns.some((p) => p.test(postChangeResponses));
        },
      },
      {
        name: "recalculation-performed",
        description: "Agent recalculated efficiency metrics after budget cut",
        evaluator: (result) => {
          const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
          if (postChangeTurns.length === 0) return false;

          const postChangeResponses = postChangeTurns
            .map((t) => t.agentResponse)
            .join(" ");

          const recalcPatterns = [
            /\$?600[,\s]?(?:000|K|k)?\s*[÷\/]\s*500\s*=\s*\$?1[,\s]?200/i,
            /(?:new|updated|revised).*(?:cost per|cpo|efficiency).*\$?1[,\s]?200/i,
            /(?:cost per|cpo).*(?:now|becomes|drops to).*\$?1[,\s]?200/i,
            /(?:recalculat|updated.*projection|revised.*efficiency|tighter)/i,
          ];

          return recalcPatterns.some((p) => p.test(postChangeResponses));
        },
      },
      {
        name: "trade-offs-explained",
        description: "Agent explained trade-offs from the budget cut",
        evaluator: (result) => {
          const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
          if (postChangeTurns.length === 0) return false;

          const postChangeResponses = postChangeTurns
            .map((t) => t.agentResponse)
            .join(" ");

          const tradeoffPatterns = [
            /(?:trade-?off|challenging|difficult|aggressive)/i,
            /(?:reduce|cut|eliminate|scale back|deprioritize)/i,
            /(?:less|fewer|reduced).*(?:reach|channels|tactics)/i,
            /(?:focus|prioritize|concentrate|double down)/i,
            /(?:won't be able|can't|unable to|sacrifice)/i,
          ];

          return tradeoffPatterns.some((p) => p.test(postChangeResponses));
        },
      },
      {
        name: "prioritization-recommended",
        description: "Agent recommended what to prioritize with reduced budget",
        evaluator: (result) => {
          const postChangeTurns = result.turns.filter((t) => t.turnNumber > 7);
          if (postChangeTurns.length === 0) return false;

          const postChangeResponses = postChangeTurns
            .map((t) => t.agentResponse)
            .join(" ");

          const prioritizationPatterns = [
            /(?:recommend|suggest|advise).*(?:prioritiz|focus|cut)/i,
            /(?:keep|maintain|protect).*(?:cut|reduce|eliminate)/i,
            /(?:highest|best|most).*(?:performing|efficient|roi)/i,
            /(?:option|approach|strategy).*(?:given|with).*(?:constraint|reduction)/i,
          ];

          return prioritizationPatterns.some((p) => p.test(postChangeResponses));
        },
      },
    ],
  },
};

/**
 * Context configuration for quality scoring
 */
export const budgetDecreaseMidstreamContext = {
  budget: 600000, // Final budget after cut
  funnel: "performance" as const,
  kpiAggressiveness: "aggressive" as const,
  userSophistication: "high" as const,
};

export default budgetDecreaseMidstreamScenario;
