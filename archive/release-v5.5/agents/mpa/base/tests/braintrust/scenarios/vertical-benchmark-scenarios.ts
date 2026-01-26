/**
 * Vertical Benchmark Test Scenarios
 *
 * Tests for MPA v6.0 expanded benchmark coverage across 14 verticals.
 * These scenarios validate that the agent retrieves and applies
 * vertical-appropriate benchmark data.
 *
 * SUPPORTED VERTICALS (14):
 * - Tier 1: RETAIL, ECOMMERCE, CPG, FINANCE, TECHNOLOGY
 * - Tier 2: HEALTHCARE, AUTOMOTIVE, TRAVEL, ENTERTAINMENT, TELECOM
 * - Tier 3: GAMING, HOSPITALITY, EDUCATION, B2B_PROFESSIONAL
 */

import { TestScenario, UserPersona, ConversationTurn, QualityContext } from "../mpa-multi-turn-types.js";

// =============================================================================
// USER PERSONAS
// =============================================================================

export const retailMarketingManagerPersona: UserPersona = {
  sophistication: "intermediate",
  role: "Marketing Manager",
  industry: "RETAIL",
  companySize: "mid-market",
  priorMediaExperience: "3-5 years managing regional retail campaigns",
  communicationStyle: "practical, results-focused, some jargon familiarity",
  decisionAuthority: "Can approve budgets up to $500K",
};

export const healthcareMarketingDirectorPersona: UserPersona = {
  sophistication: "advanced",
  role: "Marketing Director",
  industry: "HEALTHCARE",
  companySize: "enterprise",
  priorMediaExperience: "8+ years in regulated healthcare marketing",
  communicationStyle: "compliance-aware, data-driven, medical terminology",
  decisionAuthority: "Full budget authority with compliance review",
};

export const gamingStartupFounderPersona: UserPersona = {
  sophistication: "basic",
  role: "Founder/CEO",
  industry: "GAMING",
  companySize: "startup",
  priorMediaExperience: "First major marketing campaign",
  communicationStyle: "enthusiastic, gaming-native, marketing novice",
  decisionAuthority: "Full authority but budget-constrained",
};

export const b2bSaasVpMarketingPersona: UserPersona = {
  sophistication: "expert",
  role: "VP of Marketing",
  industry: "B2B_PROFESSIONAL",
  companySize: "enterprise",
  priorMediaExperience: "15+ years B2B demand generation",
  communicationStyle: "highly analytical, ABM-focused, revenue attribution",
  decisionAuthority: "Multi-million dollar budget authority",
};

// =============================================================================
// QUALITY CONTEXTS
// =============================================================================

export const retailBenchmarkContext: QualityContext = {
  scenarioType: "vertical-benchmark",
  vertical: "RETAIL",
  channels: ["PAID_SEARCH", "PAID_SOCIAL", "PROGRAMMATIC_DISPLAY"],
  expectedBenchmarks: {
    "PAID_SEARCH_CPM": { min: 8, max: 25, typical: 15 },
    "PAID_SEARCH_CPC": { min: 0.50, max: 2.50, typical: 1.20 },
    "PAID_SEARCH_CTR": { min: 0.02, max: 0.06, typical: 0.035 },
    "PAID_SOCIAL_CPM": { min: 6, max: 18, typical: 10 },
    "PAID_SOCIAL_CVR": { min: 0.01, max: 0.04, typical: 0.022 },
  },
  marketConditions: "HIGH_COMPETITION",
  seasonality: "Q4_PEAK",
};

export const healthcareBenchmarkContext: QualityContext = {
  scenarioType: "vertical-benchmark",
  vertical: "HEALTHCARE",
  channels: ["PAID_SEARCH", "PROGRAMMATIC_DISPLAY"],
  expectedBenchmarks: {
    "PAID_SEARCH_CPM": { min: 15, max: 45, typical: 28 },
    "PAID_SEARCH_CPC": { min: 2.00, max: 8.00, typical: 4.50 },
    "PROGRAMMATIC_DISPLAY_CPM": { min: 8, max: 25, typical: 14 },
  },
  marketConditions: "REGULATED",
  complianceRequirements: ["HIPAA", "FDA advertising guidelines"],
};

export const gamingBenchmarkContext: QualityContext = {
  scenarioType: "vertical-benchmark",
  vertical: "GAMING",
  channels: ["PAID_SOCIAL", "CTV_OTT", "PROGRAMMATIC_DISPLAY"],
  expectedBenchmarks: {
    "PAID_SOCIAL_CPM": { min: 4, max: 12, typical: 7 },
    "PAID_SOCIAL_VTR": { min: 0.15, max: 0.35, typical: 0.25 },
    "CTV_OTT_CPM": { min: 20, max: 45, typical: 30 },
  },
  marketConditions: "HIGH_COMPETITION",
  targetDemographic: "18-34 gamers",
};

export const b2bBenchmarkContext: QualityContext = {
  scenarioType: "vertical-benchmark",
  vertical: "B2B_PROFESSIONAL",
  channels: ["PAID_SEARCH", "PROGRAMMATIC_DISPLAY"],
  expectedBenchmarks: {
    "PAID_SEARCH_CPM": { min: 25, max: 80, typical: 45 },
    "PAID_SEARCH_CPC": { min: 3.00, max: 15.00, typical: 8.00 },
    "PAID_SEARCH_CVR": { min: 0.02, max: 0.06, typical: 0.035 },
  },
  marketConditions: "HIGH_COMPETITION",
  salesCycle: "6-12 months",
};

// =============================================================================
// RETAIL VERTICAL SCENARIO
// =============================================================================

const retailBenchmarkTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    userMessage: "We're a regional home goods retailer with 45 stores across the Southwest. We have $400,000 for a Q4 holiday campaign to drive both online and in-store sales.",
    expectedBehaviors: [
      "Acknowledges retail vertical context",
      "Notes Q4 seasonality",
      "Asks about success metrics or KPIs",
      "Does NOT discuss channels yet",
    ],
    qualityFocus: ["vertical-recognition", "seasonality-awareness"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 1.2,
    },
  },
  {
    turnNumber: 2,
    userMessage: "Our goal is to increase same-store sales by 15% over last Q4. We typically see $80 average order value.",
    expectedBehaviors: [
      "Calculates implied customer volume needed",
      "References retail-specific benchmarks",
      "Acknowledges AOV in context",
    ],
    qualityFocus: ["proactive-calculation", "vertical-benchmark-application"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 1.5,
      "proactive-calculation": 1.3,
    },
  },
  {
    turnNumber: 3,
    userMessage: "What kind of cost per customer should we expect in retail?",
    expectedBehaviors: [
      "Cites retail-specific CAC benchmarks",
      "References Q4 competitive conditions",
      "Provides benchmark range with source",
      "Notes this is from benchmark data",
    ],
    qualityFocus: ["benchmark-citation", "source-transparency"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 2.0,
      "source-citation": 1.5,
    },
  },
];

export const retailBenchmarkScenario: TestScenario = {
  id: "retail-vertical-benchmark",
  name: "Retail Vertical Benchmark Coverage",
  description: "Tests retrieval of retail-specific benchmarks including Q4 seasonality and multi-channel metrics",
  category: "vertical-benchmark",
  persona: retailMarketingManagerPersona,
  turns: retailBenchmarkTurns,
  qualityContext: retailBenchmarkContext,
  successCriteria: {
    minimumOverallScore: 0.80,
    requiredStepsComplete: [1, 2],
    noCriticalFailures: true,
  },
};

// =============================================================================
// HEALTHCARE VERTICAL SCENARIO
// =============================================================================

const healthcareBenchmarkTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    userMessage: "I'm the marketing director for a regional health system. We need to promote our new orthopedic surgery center with a $600,000 annual budget.",
    expectedBehaviors: [
      "Acknowledges healthcare/regulated vertical",
      "Notes compliance considerations",
      "Asks about success metrics",
      "Does NOT make specific claims without verification",
    ],
    qualityFocus: ["vertical-recognition", "compliance-awareness"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 1.2,
    },
  },
  {
    turnNumber: 2,
    userMessage: "Our KPI is new patient appointments. We're targeting 500 new orthopedic consultations.",
    expectedBehaviors: [
      "Calculates implied cost per appointment ($1,200)",
      "References healthcare-specific benchmarks",
      "Notes healthcare typically has higher CPAs",
    ],
    qualityFocus: ["proactive-calculation", "vertical-benchmark-application"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 1.5,
      "proactive-calculation": 1.3,
    },
  },
  {
    turnNumber: 3,
    userMessage: "Is $1,200 per appointment realistic for healthcare advertising?",
    expectedBehaviors: [
      "Cites healthcare-specific CPA benchmarks",
      "Notes regulated market conditions",
      "Provides range with source attribution",
      "May note search vs display differences",
    ],
    qualityFocus: ["benchmark-citation", "vertical-specificity"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 2.0,
      "source-citation": 1.5,
    },
  },
];

export const healthcareBenchmarkScenario: TestScenario = {
  id: "healthcare-vertical-benchmark",
  name: "Healthcare Vertical Benchmark Coverage",
  description: "Tests retrieval of healthcare-specific benchmarks with compliance awareness",
  category: "vertical-benchmark",
  persona: healthcareMarketingDirectorPersona,
  turns: healthcareBenchmarkTurns,
  qualityContext: healthcareBenchmarkContext,
  successCriteria: {
    minimumOverallScore: 0.80,
    requiredStepsComplete: [1, 2],
    noCriticalFailures: true,
  },
};

// =============================================================================
// GAMING VERTICAL SCENARIO
// =============================================================================

const gamingBenchmarkTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    userMessage: "Hey! We just launched a mobile RPG game and have $150K from our seed round for user acquisition. Need to get downloads ASAP.",
    expectedBehaviors: [
      "Acknowledges gaming/mobile vertical",
      "Uses simple language (basic sophistication)",
      "Asks about download targets",
      "Does NOT overwhelm with jargon",
    ],
    qualityFocus: ["vertical-recognition", "adaptive-sophistication"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 1.2,
      "adaptive-sophistication": 1.5,
    },
  },
  {
    turnNumber: 2,
    userMessage: "We want 50,000 downloads. Is that doable with $150K?",
    expectedBehaviors: [
      "Calculates implied CPI ($3)",
      "References gaming/mobile benchmarks",
      "Uses accessible language",
      "May note CPI varies by game type",
    ],
    qualityFocus: ["proactive-calculation", "vertical-benchmark-application"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 1.5,
      "proactive-calculation": 1.3,
    },
  },
  {
    turnNumber: 3,
    userMessage: "What's a typical cost per install for mobile games?",
    expectedBehaviors: [
      "Cites gaming-specific CPI benchmarks",
      "Notes platform differences (iOS vs Android)",
      "Provides range with source",
      "Keeps explanation simple",
    ],
    qualityFocus: ["benchmark-citation", "language-adaptation"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 2.0,
      "adaptive-sophistication": 1.3,
    },
  },
];

export const gamingBenchmarkScenario: TestScenario = {
  id: "gaming-vertical-benchmark",
  name: "Gaming Vertical Benchmark Coverage",
  description: "Tests retrieval of gaming/mobile benchmarks with basic user sophistication",
  category: "vertical-benchmark",
  persona: gamingStartupFounderPersona,
  turns: gamingBenchmarkTurns,
  qualityContext: gamingBenchmarkContext,
  successCriteria: {
    minimumOverallScore: 0.80,
    requiredStepsComplete: [1, 2],
    noCriticalFailures: true,
  },
};

// =============================================================================
// B2B PROFESSIONAL VERTICAL SCENARIO
// =============================================================================

const b2bBenchmarkTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    userMessage: "We're planning our FY26 demand gen budget for enterprise software. Looking at $2.5M across ABM and paid channels to generate 800 SQLs.",
    expectedBehaviors: [
      "Acknowledges B2B/enterprise vertical",
      "Matches sophisticated language",
      "Calculates implied cost per SQL ($3,125)",
      "Notes B2B typically has longer sales cycles",
    ],
    qualityFocus: ["vertical-recognition", "sophistication-matching"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 1.2,
      "adaptive-sophistication": 1.5,
    },
  },
  {
    turnNumber: 2,
    userMessage: "Our blended SQL to opportunity conversion is 22% and average deal size is $180K ARR. How does our target efficiency compare to B2B benchmarks?",
    expectedBehaviors: [
      "References B2B-specific benchmarks",
      "Engages with unit economics provided",
      "Calculates implied metrics",
      "Notes enterprise software specifics",
    ],
    qualityFocus: ["proactive-calculation", "vertical-benchmark-application"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 1.5,
      "proactive-calculation": 1.5,
    },
  },
  {
    turnNumber: 3,
    userMessage: "What CPL should we expect on LinkedIn vs Google for B2B enterprise?",
    expectedBehaviors: [
      "Cites B2B-specific CPL benchmarks by channel",
      "Notes enterprise premium pricing",
      "Provides range with source attribution",
      "May compare platform effectiveness",
    ],
    qualityFocus: ["benchmark-citation", "channel-specificity"],
    scoringEmphasis: {
      "benchmark-vertical-coverage": 2.0,
      "source-citation": 1.5,
    },
  },
];

export const b2bBenchmarkScenario: TestScenario = {
  id: "b2b-vertical-benchmark",
  name: "B2B Professional Vertical Benchmark Coverage",
  description: "Tests retrieval of B2B enterprise benchmarks with expert sophistication",
  category: "vertical-benchmark",
  persona: b2bSaasVpMarketingPersona,
  turns: b2bBenchmarkTurns,
  qualityContext: b2bBenchmarkContext,
  successCriteria: {
    minimumOverallScore: 0.80,
    requiredStepsComplete: [1, 2],
    noCriticalFailures: true,
  },
};

// =============================================================================
// EXPORTS
// =============================================================================

export const VERTICAL_BENCHMARK_SCENARIOS: TestScenario[] = [
  retailBenchmarkScenario,
  healthcareBenchmarkScenario,
  gamingBenchmarkScenario,
  b2bBenchmarkScenario,
];

export default VERTICAL_BENCHMARK_SCENARIOS;
