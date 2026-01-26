/**
 * Basic User - Steps 1-2 Scenario
 *
 * Tests the agent's ability to handle a basic marketing manager
 * with simple language, completing Steps 1 (Outcomes) and 2 (Economics).
 */

import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";

/**
 * Basic user persona - marketing manager at a shoe retailer
 */
export const basicUserPersona: UserPersona = {
  id: "basic-shoe-retailer",
  name: "Sarah",
  title: "Marketing Manager",
  company: "StepRight Shoes",
  industry: "Retail - Footwear",
  sophisticationLevel: "basic",

  knownData: {
    hasObjective: true,
    objective: "Get more customers to buy shoes online",
    hasVolume: true,
    volumeTarget: 5000,
    volumeUnit: "customers",
    hasBudget: true,
    budget: 250000,
    hasLTV: false,
    hasCAC: false,
    hasMargin: false,
  },

  behavioralTraits: {
    uncertaintyFrequency: 0.3,
    verbosity: "concise",
    skipTendency: 0.1,
    pushbackFrequency: 0.05,
    providesUnsolicitedInfo: false,
  },

  languagePatterns: {
    usesJargon: false,
    preferredTerms: {
      customers: "customers",
      budget: "budget",
      goal: "goal",
      success: "success",
    },
    avoidedTerms: ["CAC", "LTV", "ROAS", "incrementality", "attribution"],
    samplePhrases: [
      "I want to get more people buying our shoes",
      "We have about $250k to spend",
      "I'm not sure about the technical stuff",
      "That makes sense",
      "What do you mean by that?",
    ],
  },

  responseStyle: {
    typicalLength: "short",
    asksFollowUps: true,
    confirmsUnderstanding: true,
  },
};

/**
 * Basic User Steps 1-2 Test Scenario
 */
export const basicUserStep1_2Scenario: TestScenario = {
  id: "basic-user-step1-2",
  name: "Basic User - Steps 1-2 Completion",
  description:
    "Tests agent ability to guide a basic user through Outcomes and Economics steps using simple language",

  persona: basicUserPersona,

  openingMessage:
    "Hi! I'm looking to get more people to buy shoes from our online store. Can you help me figure out the best way to do that?",

  expectedCompletedSteps: [1, 2],
  maxTurns: 12,
  minTurns: 4,

  kbInjectionMap: {
    1: ["MPA_Supporting_Instructions_v5_5.txt"],
    2: [
      "MPA_Supporting_Instructions_v5_5.txt",
      "MPA_Expert_Lens_Budget_Allocation_v5_5.txt",
    ],
  },

  expectedEvents: [
    {
      type: "calculation_performed",
      description: "Agent calculates implied CAC from budget/volume",
    },
    {
      type: "step_transition",
      description: "Agent transitions from Step 1 to Step 2",
    },
  ],

  failureConditions: [
    {
      id: "jargon-overload",
      description: "Agent uses excessive jargon with basic user",
      type: "custom_pattern",
      detectionPattern:
        "incrementality|attribution model|lift study|holdout|MMM|media mix model",
      severity: "major",
      scorePenalty: 0.15,
      terminateOnDetect: false,
    },
    {
      id: "overwhelming-questions",
      description: "Agent asks about LTV, margin, ROAS to basic user",
      type: "custom_pattern",
      detectionPattern:
        "what is your LTV|lifetime value|profit margin|ROAS target",
      severity: "warning",
      scorePenalty: 0.05,
      terminateOnDetect: false,
    },
  ],

  successCriteria: {
    minimumOverallScore: 0.7,
    requiredStepsComplete: [1, 2],
    noCriticalFailures: true,
    minimumTurnScores: {
      "response-length": 0.6,
      "single-question": 0.7,
      "adaptive-sophistication": 0.65,
    },
    customCriteria: [
      {
        name: "calculation-performed",
        description: "Agent must calculate implied efficiency",
        evaluator: (result) => {
          return result.allEvents.some(
            (e) => e.type === "calculation_performed"
          );
        },
      },
      {
        name: "simple-language",
        description: "Agent uses simple language throughout",
        evaluator: (result) => {
          const jargonPattern =
            /\b(CAC|LTV|ROAS|CPM|CPA|CPC|incrementality|attribution)\b/gi;
          const jargonCount = result.turns.reduce((count, turn) => {
            const matches = turn.agentResponse.match(jargonPattern) || [];
            return count + matches.length;
          }, 0);
          // Allow some jargon if defined, but should be minimal
          return jargonCount <= result.turns.length * 0.5;
        },
      },
    ],
  },
};

export default basicUserStep1_2Scenario;
