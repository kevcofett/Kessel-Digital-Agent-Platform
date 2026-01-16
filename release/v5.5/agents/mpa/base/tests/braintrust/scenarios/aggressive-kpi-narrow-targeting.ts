/**
 * Aggressive KPI Narrow Targeting Scenario
 *
 * Tests the agent's ability to handle aggressive efficiency targets that require
 * sacrificing volume for precision. The agent must guide the user to narrow down
 * audience, channel, and expectations to achieve the aggressive KPI.
 *
 * This scenario specifically tests:
 * 1. Agent recognizes the KPI is aggressive and validates feasibility
 * 2. Agent recommends narrowing audience to improve efficiency
 * 3. Agent suggests channel concentration over diversification
 * 4. Agent guides user to accept lower volume for better efficiency
 * 5. Agent calculates what's achievable with aggressive targets
 * 6. Agent doesn't just accept impossible targets without pushback
 *
 * Expected Quality Behaviors:
 * - Agent MUST challenge the aggressive $25 CAC target
 * - Agent SHOULD calculate what volume IS achievable at aggressive efficiency
 * - Agent MUST recommend audience narrowing strategies
 * - Agent SHOULD discuss channel efficiency tradeoffs
 * - Agent MUST help user understand volume vs efficiency tradeoff
 * - Agent SHOULD recommend test-and-scale approach
 */

import { TestScenario, UserPersona } from "../mpa-multi-turn-types.js";

/**
 * Growth marketer with aggressive efficiency requirements
 */
export const aggressiveKpiPersona: UserPersona = {
  id: "aggressive-kpi-growth",
  name: "Ryan",
  title: "Head of Growth",
  company: "SwiftDeliver Logistics",
  industry: "B2B SaaS - Logistics",
  sophisticationLevel: "advanced",

  knownData: {
    hasObjective: true,
    objective: "Acquire SMB logistics customers with aggressive efficiency targets",
    hasVolume: true,
    volumeTarget: 5000, // Wants 5K but may need to accept less
    volumeUnit: "customers",
    hasBudget: true,
    budget: 750000,
    hasLTV: true,
    ltv: 2400, // $200/mo * 12 months
    hasCAC: true,
    cac: 150, // Target $150 but industry is $200-400
    hasMargin: true,
    margin: 0.72,
    hasAudienceDefinition: true,
    audienceDescription:
      "SMB logistics/shipping managers, 50-500 employees, $5M-$50M revenue, " +
      "currently using legacy TMS or spreadsheets",
    hasGeography: true,
    geography: ["United States - Tier 1 Markets"],
    hasChannelPreferences: true,
    preferredChannels: ["LinkedIn", "Google Search", "G2/Capterra"],
  },

  behavioralTraits: {
    uncertaintyFrequency: 0.1,
    verbosity: "detailed",
    skipTendency: 0.1,
    pushbackFrequency: 0.35, // Will push back - has pressure from leadership
    providesUnsolicitedInfo: true,
    objectionPatterns: [
      "Leadership is pushing for these numbers",
      "Our competitors claim they can do it",
      "We need to hit these targets for our series B",
      "Can we make this work somehow?",
    ],
  },

  languagePatterns: {
    usesJargon: true,
    knownAcronyms: [
      "CAC",
      "LTV",
      "ROAS",
      "MQL",
      "SQL",
      "MRR",
      "ARR",
      "TMS",
      "SMB",
    ],
    preferredTerms: {
      customers: "customers",
      budget: "budget",
      goal: "targets",
      success: "efficiency metrics",
    },
    avoidedTerms: [],
    samplePhrases: [
      "We need to hit $150 CAC or below",
      "Target is 5,000 new customers this year",
      "LTV is about $2,400 over 12 months",
      "Budget is $750K but efficiency is critical",
      "Leadership wants aggressive growth with tight unit economics",
      "We're targeting SMBs still on spreadsheets or legacy systems",
    ],
  },

  responseStyle: {
    typicalLength: "medium",
    asksFollowUps: true,
    confirmsUnderstanding: false,
  },
};

/**
 * Aggressive KPI Narrow Targeting Test Scenario
 */
export const aggressiveKpiNarrowTargetingScenario: TestScenario = {
  id: "aggressive-kpi-narrow-targeting",
  name: "Aggressive KPI - Must Narrow to Achieve",
  category: "phase1-quality",
  description:
    "Tests agent's ability to handle aggressive efficiency targets that require " +
    "sacrificing volume. Agent MUST challenge unrealistic targets and guide user " +
    "to narrow audience/channels to achieve aggressive KPI, even if volume suffers.",

  persona: aggressiveKpiPersona,

  openingMessage:
    "Hey, I'm the Head of Growth at SwiftDeliver - we're a B2B SaaS for logistics. " +
    "I need to build a media plan with aggressive targets. Budget is $750K, and we " +
    "need 5,000 new customers at $150 CAC or better. Our LTV is $2,400 so the math " +
    "works if we can hit that efficiency. Target audience is SMB logistics managers, " +
    "companies with 50-500 employees, $5M-$50M revenue, currently stuck on spreadsheets " +
    "or legacy TMS systems. Can you help me figure out how to make these numbers work?",

  expectedCompletedSteps: [1, 2, 3, 4, 5, 6, 7],
  maxTurns: 40,
  minTurns: 12,
  minExpectedTurns: 15,

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
      description: "Agent calculates: $750K / 5K = $150 (matches target exactly)",
    },
    {
      type: "benchmark_cited",
      description: "Agent cites B2B SaaS CAC benchmarks ($200-400 typical)",
    },
    {
      type: "step_transition",
      description: "Agent guides through narrowing strategy",
    },
  ],

  failureConditions: [
    {
      id: "accepted-unrealistic-target",
      description:
        "Agent accepts $150 CAC target without challenging or discussing feasibility",
      type: "custom_pattern",
      severity: "critical",
      scorePenalty: 0.25,
      terminateOnDetect: false,
    },
    {
      id: "no-volume-tradeoff-discussion",
      description:
        "Agent doesn't discuss that achieving $150 CAC may require lower volume",
      type: "custom_pattern",
      severity: "major",
      scorePenalty: 0.15,
      terminateOnDetect: false,
    },
    {
      id: "no-narrowing-recommendation",
      description:
        "Agent doesn't recommend narrowing audience or channels to improve efficiency",
      type: "custom_pattern",
      severity: "major",
      scorePenalty: 0.15,
      terminateOnDetect: false,
    },
    {
      id: "broad-strategy-for-aggressive-kpi",
      description:
        "Agent recommends broad reach strategy when aggressive efficiency requires precision",
      type: "custom_pattern",
      severity: "major",
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
      "proactive-calculation": 0.8,
      "critical-thinking": 0.8,
      "benchmark-citation": 0.7,
    },
    customCriteria: [
      {
        name: "target-feasibility-challenged",
        description: "Agent challenged the aggressive $150 CAC target",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          const challengePatterns = [
            /\$?150.*(?:aggressive|challenging|tight|ambitious|difficult|below)/i,
            /(?:aggressive|challenging|tight|ambitious).*\$?150/i,
            /(?:typical|benchmark|industry).*(?:higher|more|above).*\$?150/i,
            /(?:b2b|saas).*(?:cac|acquisition).*\$?(?:200|250|300|400)/i,
            /(?:feasibility|realistic|achievable).*\$?150/i,
          ];
          return challengePatterns.some((p) => p.test(allResponses));
        },
      },
      {
        name: "volume-tradeoff-discussed",
        description: "Agent discussed volume vs efficiency tradeoff",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          const tradeoffPatterns = [
            /(?:volume|5[,.]?000).*(?:vs|versus|or|tradeoff).*(?:efficiency|cac)/i,
            /(?:fewer|lower|less).*(?:customers|volume).*(?:better|lower).*(?:cac|efficiency)/i,
            /(?:sacrifice|reduce|lower).*(?:volume|target).*(?:achieve|hit|meet).*(?:efficiency|cac)/i,
            /(?:may|might|could).*(?:not|be difficult to).*(?:hit|achieve|reach).*5[,.]?000/i,
            /(?:realistic|achievable).*(?:volume|number).*(?:at|with).*\$?150/i,
          ];
          return tradeoffPatterns.some((p) => p.test(allResponses));
        },
      },
      {
        name: "narrowing-strategy-recommended",
        description: "Agent recommended narrowing audience/channels for efficiency",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          const narrowingPatterns = [
            /(?:narrow|focus|concentrate|precision).*(?:audience|targeting|segment)/i,
            /(?:high.intent|bottom.funnel|ready.to.buy)/i,
            /(?:concentrate|focus).*(?:channel|platform)/i,
            /(?:highest|best).*(?:converting|performing).*(?:channel|segment|audience)/i,
            /(?:quality|precision).*(?:over|vs|instead of).*(?:quantity|volume|reach)/i,
          ];
          return narrowingPatterns.some((p) => p.test(allResponses));
        },
      },
      {
        name: "achievable-volume-calculated",
        description: "Agent calculated what volume IS achievable at target CAC",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          // Should show math for what's achievable
          const achievablePatterns = [
            /\$?750[,.]?(?:000|k)?\s*[÷\/]\s*\$?\d+\s*=\s*\d+.*(?:customers|volume)/i,
            /(?:achievable|realistic|feasible).*(\d[,.]?\d{3}|\d{4}).*(?:customers|at)/i,
            /(?:if|at).*\$?(?:200|250|300).*(?:cac|efficiency).*(\d[,.]?\d{3}|\d{4})/i,
            /(?:more realistic|achievable).*(?:target|volume|number)/i,
          ];
          return achievablePatterns.some((p) => p.test(allResponses));
        },
      },
      {
        name: "channel-efficiency-focus",
        description: "Agent recommended high-efficiency channel strategy",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          const channelEfficiencyPatterns = [
            /(?:search|google).*(?:high.intent|bottom.funnel|efficient)/i,
            /(?:linkedin|review site|g2|capterra).*(?:intent|qualified|efficient)/i,
            /(?:concentrate|focus|prioritize).*(?:highest|best).*(?:converting|performing)/i,
            /(?:avoid|minimize|reduce).*(?:awareness|top.funnel|broad)/i,
            /(?:direct response|performance).*(?:channel|approach)/i,
          ];
          return channelEfficiencyPatterns.filter((p) => p.test(allResponses))
            .length >= 2;
        },
      },
      {
        name: "test-and-scale-approach",
        description: "Agent recommended test-first approach to validate efficiency",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          const testPatterns = [
            /test.*(?:first|before|validate|prove)/i,
            /(?:prove|validate|confirm).*(?:efficiency|cac).*(?:before|then).*scale/i,
            /(?:start|begin).*(?:small|focused|narrow).*(?:then|before).*(?:expand|scale)/i,
            /(?:pilot|proof of concept|poc)/i,
          ];
          return testPatterns.some((p) => p.test(allResponses));
        },
      },
      {
        name: "benchmark-comparison-made",
        description: "Agent compared target to industry benchmarks",
        evaluator: (result) => {
          const allResponses = result.turns
            .map((t) => t.agentResponse)
            .join(" ");
          const benchmarkPatterns = [
            /(?:typical|average|benchmark|industry).*(?:b2b|saas).*\$?(?:200|250|300|400)/i,
            /(?:b2b|saas).*(?:typical|average|benchmark).*\$?(?:200|250|300|400)/i,
            /\$?150.*(?:below|under|less than).*(?:typical|benchmark|industry)/i,
          ];
          return benchmarkPatterns.some((p) => p.test(allResponses));
        },
      },
    ],
  },
};

/**
 * Context configuration for quality scoring
 */
export const aggressiveKpiNarrowTargetingContext = {
  budget: 750000,
  funnel: "performance" as const,
  kpiAggressiveness: "aggressive" as const,
  userSophistication: "high" as const,
};

export default aggressiveKpiNarrowTargetingScenario;
