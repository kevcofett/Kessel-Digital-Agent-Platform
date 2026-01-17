/**
 * V6.1 Test Scenarios
 *
 * Test scenarios for MPA v6.1 outcome-focused capabilities:
 * - Automatic benchmark comparison (user provides target)
 * - Data confidence indication (source reliability)
 * - Platform taxonomy usage (Google/Meta/LinkedIn segments)
 * - Geography/census usage (DMA population data)
 * - Behavioral/contextual attributes
 *
 * SCENARIO_SPECIFICATION: v6.1
 */

import { TestScenario, UserPersona, ConversationTurn, QualityContext } from "../mpa-multi-turn-types.js";

// =============================================================================
// USER PERSONAS
// =============================================================================

export const ecommerceMarketingManagerPersona: UserPersona = {
  name: "Ecommerce Marketing Manager",
  title: "Marketing Manager",
  sophisticationLevel: "intermediate",
  industry: "ECOMMERCE",
  companySize: "mid-market",
  priorMediaExperience: "4 years managing DTC campaigns",
  communicationStyle: "data-driven, results-focused",
  decisionAuthority: "Can approve budgets up to $300K",
  knownData: {
    hasBudget: true,
    budget: 200000,
    hasVolumeTarget: true,
    volumeTarget: 4000,
    volumeType: "customers",
  },
  behavioralTraits: {
    responseVerbosity: "normal",
    uncertaintyFrequency: "sometimes",
    challengeFrequency: "sometimes",
    stepSkipTendency: "sequential",
  },
  languagePatterns: {
    usesJargon: true,
    knownAcronyms: ["CAC", "LTV", "ROAS", "CPA", "CTR"],
    samplePhrases: [
      "What's the benchmark for that?",
      "How does this compare to industry standards?",
      "We need to hit our targets this quarter.",
    ],
  },
};

export const regionalRetailerPersona: UserPersona = {
  name: "Regional Retailer Owner",
  title: "Owner",
  sophisticationLevel: "basic",
  industry: "RETAIL",
  companySize: "small",
  priorMediaExperience: "First major digital campaign",
  communicationStyle: "plain language, wants clear guidance",
  decisionAuthority: "Full authority",
  knownData: {
    hasBudget: true,
    budget: 150000,
    hasVolumeTarget: true,
    volumeTarget: 2000,
    volumeType: "customers",
  },
  behavioralTraits: {
    responseVerbosity: "normal",
    uncertaintyFrequency: "often",
    challengeFrequency: "rare",
    stepSkipTendency: "sequential",
  },
  languagePatterns: {
    usesJargon: false,
    knownAcronyms: [],
    samplePhrases: [
      "I'm not sure what that means.",
      "Can you explain that in simpler terms?",
      "This is our first big campaign.",
    ],
  },
};

export const b2bDemandGenPersona: UserPersona = {
  name: "B2B Demand Gen Director",
  title: "Director of Demand Gen",
  sophisticationLevel: "advanced",
  industry: "B2B_PROFESSIONAL",
  companySize: "enterprise",
  priorMediaExperience: "10+ years B2B marketing",
  communicationStyle: "analytical, ABM-focused",
  decisionAuthority: "Reports to CMO, $1M+ budget authority",
  knownData: {
    hasBudget: true,
    budget: 500000,
    hasVolumeTarget: true,
    volumeTarget: 300,
    volumeType: "leads",
    hasUnitEconomics: true,
    ltv: 50000,
    cac: 1500,
  },
  behavioralTraits: {
    responseVerbosity: "verbose",
    uncertaintyFrequency: "rare",
    challengeFrequency: "often",
    stepSkipTendency: "occasional_skip",
  },
  languagePatterns: {
    usesJargon: true,
    knownAcronyms: ["ABM", "MQL", "SQL", "CAC", "LTV", "CPL", "ROAS", "MRR", "ARR"],
    samplePhrases: [
      "What's the pipeline velocity impact?",
      "How does this ladder up to revenue targets?",
      "We need to optimize for qualified pipeline, not just leads.",
    ],
  },
};

// =============================================================================
// SCENARIO 1: AUTOMATIC BENCHMARK COMPARISON
// =============================================================================

const automaticBenchmarkTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    userMessage: "We're an online furniture store. Budget is $200,000 and we want to acquire 4,000 new customers.",
    expectedBehaviors: [
      "Acknowledges ecommerce/furniture context",
      "Calculates implied CAC ($50)",
      "AUTOMATICALLY compares to KB benchmarks",
      "Labels target as realistic/aggressive/conservative",
      "Does NOT just ask another question",
    ],
    qualityFocus: ["automatic-benchmark-comparison", "proactive-calculation"],
    scoringEmphasis: {
      "automatic-benchmark-comparison": 2.0,
      "data-confidence": 1.5,
    },
  },
  {
    turnNumber: 2,
    userMessage: "Is that $50 per customer achievable?",
    expectedBehaviors: [
      "References benchmark data with source",
      "Shows typical range for ecommerce",
      "Indicates confidence level of data",
      "Provides actionable context",
    ],
    qualityFocus: ["benchmark-citation", "data-confidence"],
    scoringEmphasis: {
      "data-confidence": 2.0,
      "source-citation": 1.5,
    },
  },
  {
    turnNumber: 3,
    userMessage: "Actually, let's target 6,000 customers instead.",
    expectedBehaviors: [
      "Recalculates implied CAC ($33.33)",
      "AUTOMATICALLY re-compares to benchmarks",
      "Notes the target has become more aggressive",
      "Explains what this requires",
    ],
    qualityFocus: ["automatic-benchmark-comparison", "recalculation-on-change"],
    scoringEmphasis: {
      "automatic-benchmark-comparison": 2.0,
      "recalculation-on-change": 1.5,
    },
  },
];

export const automaticBenchmarkScenario: TestScenario = {
  id: "v61-automatic-benchmark-comparison",
  name: "Automatic Benchmark Comparison",
  description: "Tests that agent automatically compares user targets to KB benchmarks without being asked",
  category: "v61-capabilities",
  persona: ecommerceMarketingManagerPersona,
  turns: automaticBenchmarkTurns,
  maxTurns: 10,
  qualityContext: {
    scenarioType: "benchmark-comparison",
    vertical: "ECOMMERCE",
    expectedBenchmarks: {
      "CAC": { min: 35, max: 75, typical: 50 },
    },
  },
  successCriteria: {
    minimumOverallScore: 0.85,
    requiredBehaviors: ["automatic benchmark comparison", "feasibility labeling"],
    noCriticalFailures: true,
  },
};

// =============================================================================
// SCENARIO 2: DATA CONFIDENCE INDICATION
// =============================================================================

const dataConfidenceTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    userMessage: "We sell home security systems. $150K budget, targeting 2,000 new subscribers.",
    expectedBehaviors: [
      "Calculates implied cost per subscriber ($75)",
      "Indicates this is calculated from user's input",
      "May reference benchmarks with KB attribution",
    ],
    qualityFocus: ["data-confidence", "source-attribution"],
    scoringEmphasis: {
      "data-confidence": 2.0,
    },
  },
  {
    turnNumber: 2,
    userMessage: "I don't know what our typical cost per customer is. What should we expect?",
    expectedBehaviors: [
      "Provides benchmark from KB data",
      "CLEARLY indicates this is KB/benchmark data",
      "Offers to refine if user has actual data",
      "Recommends validation path",
    ],
    qualityFocus: ["data-confidence", "idk-protocol"],
    scoringEmphasis: {
      "data-confidence": 2.0,
      "idk-protocol": 1.5,
    },
  },
  {
    turnNumber: 3,
    userMessage: "What if we only have data for Q4?",
    expectedBehaviors: [
      "Acknowledges seasonality limitation",
      "If estimating, CLEARLY labels as estimate",
      "Recommends how to validate",
      "Does not present estimate as fact",
    ],
    qualityFocus: ["data-confidence", "estimate-handling"],
    scoringEmphasis: {
      "data-confidence": 2.0,
    },
  },
];

export const dataConfidenceScenario: TestScenario = {
  id: "v61-data-confidence",
  name: "Data Confidence Indication",
  description: "Tests that agent clearly indicates reliability of data sources (user data vs KB vs estimates)",
  category: "v61-capabilities",
  persona: regionalRetailerPersona,
  turns: dataConfidenceTurns,
  maxTurns: 10,
  qualityContext: {
    scenarioType: "data-confidence",
    vertical: "RETAIL",
  },
  successCriteria: {
    minimumOverallScore: 0.80,
    requiredBehaviors: ["source attribution", "estimate labeling"],
    noCriticalFailures: true,
  },
};

// =============================================================================
// SCENARIO 3: PLATFORM TAXONOMY USAGE
// =============================================================================

const platformTaxonomyTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    userMessage: "We need to reach IT decision makers at mid-size companies for our cybersecurity software. Budget is $500K.",
    expectedBehaviors: [
      "Acknowledges B2B/technology context",
      "Notes target audience (IT decision makers)",
      "Asks about success metrics",
    ],
    qualityFocus: ["vertical-recognition"],
    scoringEmphasis: {},
  },
  {
    turnNumber: 2,
    userMessage: "Goal is 300 qualified demos with IT directors or CISOs.",
    expectedBehaviors: [
      "Calculates implied cost per demo (~$1,667)",
      "Compares to B2B benchmarks",
    ],
    qualityFocus: ["proactive-calculation"],
    scoringEmphasis: {
      "automatic-benchmark-comparison": 1.5,
    },
  },
  {
    turnNumber: 3,
    userMessage: "How should we target these IT leaders across platforms?",
    expectedBehaviors: [
      "References LinkedIn job function/seniority targeting",
      "May reference Google in-market audiences for B2B",
      "Discusses platform-specific targeting options",
      "Provides specific segment recommendations",
    ],
    qualityFocus: ["platform-taxonomy-usage"],
    scoringEmphasis: {
      "platform-taxonomy-usage": 2.0,
    },
  },
  {
    turnNumber: 4,
    userMessage: "What about behavioral signals we should layer on?",
    expectedBehaviors: [
      "References behavioral targeting signals",
      "Discusses purchase intent signals",
      "May mention engagement patterns",
      "Platform-specific behavioral options",
    ],
    qualityFocus: ["behavioral-contextual-usage"],
    scoringEmphasis: {
      "behavioral-contextual-usage": 2.0,
    },
  },
];

export const platformTaxonomyScenario: TestScenario = {
  id: "v61-platform-taxonomy-usage",
  name: "Platform Taxonomy Usage",
  description: "Tests that agent references specific Google/Meta/LinkedIn targeting options",
  category: "v61-capabilities",
  persona: b2bDemandGenPersona,
  turns: platformTaxonomyTurns,
  maxTurns: 12,
  qualityContext: {
    scenarioType: "platform-targeting",
    vertical: "B2B_PROFESSIONAL",
    channels: ["PAID_SEARCH", "PAID_SOCIAL"],
  },
  successCriteria: {
    minimumOverallScore: 0.80,
    requiredBehaviors: ["platform-specific targeting", "behavioral signals"],
    noCriticalFailures: true,
  },
};

// =============================================================================
// SCENARIO 4: GEOGRAPHY/CENSUS USAGE
// =============================================================================

const geographyCensusTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    userMessage: "We're a regional bank expanding into Texas. Have $800K for customer acquisition.",
    expectedBehaviors: [
      "Acknowledges finance/banking vertical",
      "Notes geographic focus (Texas)",
      "Asks about success metrics",
    ],
    qualityFocus: ["vertical-recognition", "geography-awareness"],
    scoringEmphasis: {},
  },
  {
    turnNumber: 2,
    userMessage: "We want 5,000 new checking account customers in the Dallas and Houston markets.",
    expectedBehaviors: [
      "Calculates implied cost per customer ($160)",
      "Notes multi-DMA approach",
      "Compares to finance benchmarks",
    ],
    qualityFocus: ["proactive-calculation"],
    scoringEmphasis: {
      "automatic-benchmark-comparison": 1.5,
    },
  },
  {
    turnNumber: 3,
    userMessage: "What's the total addressable market in those DMAs?",
    expectedBehaviors: [
      "References DMA population data",
      "Provides specific population numbers",
      "May note household counts",
      "Indicates data source (census/DMA data)",
    ],
    qualityFocus: ["geography-census-usage"],
    scoringEmphasis: {
      "geography-census-usage": 2.0,
      "data-confidence": 1.5,
    },
  },
  {
    turnNumber: 4,
    userMessage: "How should we split the budget between Dallas and Houston?",
    expectedBehaviors: [
      "Uses population/market size for allocation",
      "Provides specific percentages",
      "May reference demographic differences",
      "Shows data-driven reasoning",
    ],
    qualityFocus: ["geography-census-usage", "proactive-calculation"],
    scoringEmphasis: {
      "geography-census-usage": 2.0,
    },
  },
];

export const geographyCensusScenario: TestScenario = {
  id: "v61-geography-census-usage",
  name: "Geography/Census Data Usage",
  description: "Tests that agent uses DMA population data for audience sizing and budget allocation",
  category: "v61-capabilities",
  persona: {
    name: "Finance VP Marketing",
    title: "VP Marketing",
    sophisticationLevel: "intermediate",
    industry: "FINANCE",
    companySize: "mid-market",
    priorMediaExperience: "5 years in regional banking marketing",
    communicationStyle: "analytical, compliance-aware",
    decisionAuthority: "Regional budget authority",
    knownData: {
      hasBudget: true,
      budget: 800000,
      hasVolumeTarget: true,
      volumeTarget: 5000,
      volumeType: "customers",
      hasGeography: true,
      geography: ["Dallas", "Houston"],
    },
    behavioralTraits: {
      responseVerbosity: "normal",
      uncertaintyFrequency: "sometimes",
      challengeFrequency: "sometimes",
      stepSkipTendency: "sequential",
    },
    languagePatterns: {
      usesJargon: true,
      knownAcronyms: ["DMA", "CAC", "LTV", "TAM"],
      samplePhrases: [
        "What does the data show?",
        "How should we allocate across markets?",
        "We need to be compliant with regulations.",
      ],
    },
  },
  turns: geographyCensusTurns,
  maxTurns: 12,
  qualityContext: {
    scenarioType: "geography-targeting",
    vertical: "FINANCE",
    targetDMAs: ["Dallas-Ft. Worth", "Houston"],
  },
  successCriteria: {
    minimumOverallScore: 0.80,
    requiredBehaviors: ["DMA population data", "data-driven allocation"],
    noCriticalFailures: true,
  },
};

// =============================================================================
// SCENARIO 5: COMPREHENSIVE V6.1 FLOW
// =============================================================================

const comprehensiveV61Turns: ConversationTurn[] = [
  {
    turnNumber: 1,
    userMessage: "We're a DTC fitness brand launching in California. $300K budget to acquire 5,000 new customers.",
    expectedBehaviors: [
      "Acknowledges DTC/ecommerce vertical",
      "Notes California geographic focus",
      "Calculates implied CAC ($60)",
      "AUTOMATICALLY compares to benchmarks",
      "Labels feasibility",
    ],
    qualityFocus: ["automatic-benchmark-comparison", "proactive-calculation"],
    scoringEmphasis: {
      "automatic-benchmark-comparison": 2.0,
    },
  },
  {
    turnNumber: 2,
    userMessage: "We're targeting fitness enthusiasts aged 25-45 with household income over $75K.",
    expectedBehaviors: [
      "Acknowledges demographic parameters",
      "May estimate addressable audience",
      "Indicates data reliability for sizing",
    ],
    qualityFocus: ["data-confidence"],
    scoringEmphasis: {
      "data-confidence": 1.5,
    },
  },
  {
    turnNumber: 3,
    userMessage: "Which California DMAs should we prioritize and how big is each?",
    expectedBehaviors: [
      "Lists relevant CA DMAs (LA, SF, San Diego, Sacramento)",
      "Provides population/household data",
      "Sources the data appropriately",
      "May suggest allocation approach",
    ],
    qualityFocus: ["geography-census-usage", "data-confidence"],
    scoringEmphasis: {
      "geography-census-usage": 2.0,
      "data-confidence": 1.5,
    },
  },
  {
    turnNumber: 4,
    userMessage: "For the targeting, what specific audience segments should we use on Google and Meta?",
    expectedBehaviors: [
      "References Google affinity/in-market audiences",
      "References Meta interest/behavior targeting",
      "Provides specific segment suggestions",
      "Tailored to fitness vertical",
    ],
    qualityFocus: ["platform-taxonomy-usage"],
    scoringEmphasis: {
      "platform-taxonomy-usage": 2.0,
    },
  },
  {
    turnNumber: 5,
    userMessage: "What behavioral signals should we layer on top of those segments?",
    expectedBehaviors: [
      "Discusses behavioral targeting options",
      "May reference purchase intent signals",
      "Platform-specific behavioral signals",
      "Relevant to fitness/DTC",
    ],
    qualityFocus: ["behavioral-contextual-usage"],
    scoringEmphasis: {
      "behavioral-contextual-usage": 2.0,
    },
  },
];

export const comprehensiveV61Scenario: TestScenario = {
  id: "v61-comprehensive",
  name: "Comprehensive V6.1 Capabilities",
  description: "End-to-end test of all v6.1 capabilities: benchmark comparison, data confidence, geography, taxonomies",
  category: "v61-capabilities",
  persona: ecommerceMarketingManagerPersona,
  turns: comprehensiveV61Turns,
  maxTurns: 15,
  qualityContext: {
    scenarioType: "comprehensive-v61",
    vertical: "ECOMMERCE",
    targetDMAs: ["Los Angeles", "San Francisco", "San Diego", "Sacramento"],
    channels: ["PAID_SEARCH", "PAID_SOCIAL"],
  },
  successCriteria: {
    minimumOverallScore: 0.85,
    requiredBehaviors: [
      "automatic benchmark comparison",
      "data source attribution",
      "census data usage",
      "platform-specific targeting",
    ],
    noCriticalFailures: true,
  },
};

// =============================================================================
// EXPORTS
// =============================================================================

export const V61_TEST_SCENARIOS: TestScenario[] = [
  automaticBenchmarkScenario,
  dataConfidenceScenario,
  platformTaxonomyScenario,
  geographyCensusScenario,
  comprehensiveV61Scenario,
];

export default V61_TEST_SCENARIOS;
