/**
 * Advanced Analytics Test Scenarios
 *
 * Tests agent's ability to:
 * 1. Build RFM scores and segments from customer data
 * 2. Create propensity models and scoring
 * 3. Perform decile analysis with investment cutoffs
 * 4. Generate lookalike audiences from seed segments
 * 5. Map customer name flows (journey stages)
 * 6. Calculate profitability-based media plans
 */

import {
  TestScenario,
  UserPersona,
  ConversationTurn,
  ScenarioSuccessCriteria,
} from "../mpa-multi-turn-types.js";

// ============================================================================
// USER PERSONAS
// ============================================================================

export const dataRichEcommercePersona: UserPersona = {
  name: "Data-Rich Ecommerce Director",
  title: "Director of CRM & Analytics",
  company: "Premium Fashion Retailer",
  sophisticationLevel: "advanced",
  industry: "ecommerce",
  companySize: "enterprise",
  priorMediaExperience:
    "8 years in ecommerce marketing. Has full transaction history, customer profiles, " +
    "and email engagement data. Wants to leverage first-party data for acquisition " +
    "and retention campaigns. Familiar with RFM, CLV, and propensity models.",
  knownData: {
    hasBudget: true,
    budget: 2000000,
    hasCustomerData: true,
    customerCount: 500000,
    hasTransactionHistory: true,
    transactionYears: 3,
    hasLTV: true,
    avgLtv: 850,
    hasCAC: true,
    cac: 75,
  },
  behavioralTraits: {
    responseVerbosity: "verbose",
    uncertaintyFrequency: "rare",
    challengeFrequency: "often",
    stepSkipTendency: "occasional_skip",
  },
  languagePatterns: {
    usesJargon: true,
    knownAcronyms: ["RFM", "CLV", "LTV", "CAC", "AOV", "ROAS", "CPM", "CPA"],
    samplePhrases: [
      "Show me the segment distribution.",
      "What's the expected lift?",
      "How do we optimize for LTV?",
      "I need to see the ROI by cohort.",
    ],
  },
};

export const printMediaPlannerPersona: UserPersona = {
  name: "Print Media Planner",
  title: "VP Media Planning",
  company: "Financial Services Firm",
  sophisticationLevel: "expert",
  industry: "finance",
  companySize: "enterprise",
  priorMediaExperience:
    "15 years in direct response marketing. Expert in print, direct mail, and catalog. " +
    "Uses decile analysis and response modeling extensively. Has customer file with " +
    "credit scores, income estimates, and purchase history.",
  knownData: {
    hasBudget: true,
    budget: 5000000,
    hasCustomerData: true,
    customerCount: 2000000,
    hasTransactionHistory: true,
    hasResponseRates: true,
    avgResponseRate: 0.025,
  },
  behavioralTraits: {
    responseVerbosity: "verbose",
    uncertaintyFrequency: "rare",
    challengeFrequency: "often",
    stepSkipTendency: "occasional_skip",
  },
  languagePatterns: {
    usesJargon: true,
    knownAcronyms: ["RFM", "CPM", "CPA", "BRE", "OE", "NCOA"],
    samplePhrases: [
      "What's the cutoff point?",
      "Show me the decile performance.",
      "What's the break-even response rate?",
      "How deep can we mail profitably?",
    ],
  },
};

export const lookalikeStrategyPersona: UserPersona = {
  name: "Lookalike Strategy Lead",
  title: "Head of Paid Media",
  company: "DTC Beauty Brand",
  sophisticationLevel: "advanced",
  industry: "ecommerce",
  companySize: "mid-market",
  priorMediaExperience:
    "6 years in performance marketing. Extensive experience with Meta and Google lookalikes. " +
    "Has strong first-party customer data and wants to scale acquisition efficiently.",
  knownData: {
    hasBudget: true,
    budget: 1000000,
    hasCustomerData: true,
    customerCount: 150000,
    hasLTV: true,
    avgLtv: 280,
    hasCAC: true,
    cac: 45,
  },
  behavioralTraits: {
    responseVerbosity: "normal",
    uncertaintyFrequency: "sometimes",
    challengeFrequency: "sometimes",
    stepSkipTendency: "sequential",
  },
  languagePatterns: {
    usesJargon: true,
    knownAcronyms: ["LAL", "LTV", "CAC", "ROAS", "1P"],
    samplePhrases: [
      "What should our seed audience look like?",
      "How do we expand without losing efficiency?",
      "What match rates should we expect?",
    ],
  },
};

// ============================================================================
// SCENARIO 1: RFM SEGMENTATION & SCORING
// ============================================================================

const rfmSegmentationTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    role: "user",
    expectedIntent: "provide_customer_data_context",
    exampleMessage:
      "I have 500,000 customers with 3 years of transaction history. I want to segment them " +
      "using RFM analysis. Can you walk me through how we should set this up and what the " +
      "segment distribution typically looks like? I need the actual RFM scores and segment " +
      "names we should use.",
    acceptableBehaviors: [
      "Acknowledge data availability",
      "Explain RFM methodology",
      "Offer to guide through segmentation",
    ],
    criticalBehaviors: [
      "MUST explain Recency, Frequency, Monetary components",
      "MUST describe scoring methodology (1-5 scale)",
      "MUST provide segment naming convention",
    ],
  },
  {
    turnNumber: 2,
    role: "user",
    expectedIntent: "request_specific_calculation",
    exampleMessage:
      "OK, let's do this. Our recency ranges from 0 to 1095 days, frequency from 1 to 50 orders, " +
      "and monetary from $25 to $15,000 total spend. How should I set up the quintile breaks? " +
      "And what segments should I expect to see?",
    acceptableBehaviors: [
      "Provide specific quintile breakpoints",
      "Show expected segment distribution",
      "Name segments with RFM scores",
    ],
    criticalBehaviors: [
      "MUST show numeric breakpoints for R, F, M",
      "MUST explain how to combine into RFM score",
      "MUST show expected segment sizes",
    ],
  },
  {
    turnNumber: 3,
    role: "user",
    expectedIntent: "request_segment_actions",
    exampleMessage:
      "Based on this segmentation, what should our marketing strategy be for each segment? " +
      "I want to understand the value concentration and where to focus our $2M budget.",
    acceptableBehaviors: [
      "Recommend segment-specific strategies",
      "Show value concentration (Pareto)",
      "Suggest budget allocation by segment",
    ],
    criticalBehaviors: [
      "MUST show revenue/value distribution across segments",
      "MUST recommend different treatments by segment",
      "MUST tie budget allocation to segment value",
    ],
  },
];

export const rfmSegmentationScenario: TestScenario = {
  id: "adv-rfm-segmentation-scoring",
  name: "RFM Segmentation & Scoring",
  description:
    "Tests agent's ability to explain and guide RFM segmentation with specific " +
    "calculations, quintile breaks, segment naming, and value distribution analysis.",
  category: "advanced-analytics",
  persona: dataRichEcommercePersona,
  turns: rfmSegmentationTurns,
  maxTurns: 8,
  qualityContext: {
    scenarioType: "rfm-analysis",
    vertical: "ECOMMERCE",
    dataAvailable: {
      customerCount: 500000,
      transactionHistory: true,
      yearsOfData: 3,
    },
  },
  successCriteria: {
    minimumOverallScore: 0.8,
    requiredBehaviors: [
      "RFM calculation methodology",
      "Quintile breakpoints",
      "Segment naming with scores",
      "Value concentration analysis",
    ],
    noCriticalFailures: true,
  },
};

// ============================================================================
// SCENARIO 2: PROPENSITY MODEL & SCORING
// ============================================================================

const propensityModelTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    role: "user",
    expectedIntent: "request_propensity_explanation",
    exampleMessage:
      "I want to build a propensity model to predict which customers are likely to make " +
      "their next purchase in the next 30 days. We have purchase history, email engagement, " +
      "and website behavior data. How should we approach this?",
    acceptableBehaviors: [
      "Explain propensity modeling concept",
      "Identify relevant input signals",
      "Suggest modeling approach",
    ],
    criticalBehaviors: [
      "MUST define what propensity means",
      "MUST list input signals (purchase, email, web)",
      "MUST explain score interpretation",
    ],
  },
  {
    turnNumber: 2,
    role: "user",
    expectedIntent: "request_scoring_methodology",
    exampleMessage:
      "How do we actually score customers? What score range should we use and how do we " +
      "segment based on propensity? I need to understand how to action on these scores.",
    acceptableBehaviors: [
      "Explain scoring range (0-1 or 0-100)",
      "Suggest propensity tiers",
      "Map tiers to actions",
    ],
    criticalBehaviors: [
      "MUST explain score scale and interpretation",
      "MUST define propensity tiers (high/medium/low)",
      "MUST map tiers to marketing actions",
    ],
  },
  {
    turnNumber: 3,
    role: "user",
    expectedIntent: "request_budget_allocation",
    exampleMessage:
      "Given our $2M budget, how should we allocate spend across propensity tiers? " +
      "What CPA should we target for each tier?",
    acceptableBehaviors: [
      "Recommend tier-based budget allocation",
      "Set tier-specific CPA targets",
      "Justify investment levels",
    ],
    criticalBehaviors: [
      "MUST show different CPA targets by propensity",
      "MUST justify higher investment in high-propensity",
      "MUST address low-propensity suppression",
    ],
  },
];

export const propensityModelScenario: TestScenario = {
  id: "adv-propensity-model-scoring",
  name: "Propensity Model & Scoring",
  description:
    "Tests agent's ability to explain propensity models, scoring methodology, " +
    "tier definition, and propensity-based marketing actions.",
  category: "advanced-analytics",
  persona: dataRichEcommercePersona,
  turns: propensityModelTurns,
  maxTurns: 8,
  qualityContext: {
    scenarioType: "propensity-modeling",
    vertical: "ECOMMERCE",
    dataAvailable: {
      purchaseHistory: true,
      emailEngagement: true,
      webBehavior: true,
    },
  },
  successCriteria: {
    minimumOverallScore: 0.8,
    requiredBehaviors: [
      "Propensity definition",
      "Input signal identification",
      "Score interpretation",
      "Tier-to-action mapping",
    ],
    noCriticalFailures: true,
  },
};

// ============================================================================
// SCENARIO 3: DECILE ANALYSIS & INVESTMENT CUTOFFS
// ============================================================================

const decileAnalysisTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    role: "user",
    expectedIntent: "request_decile_explanation",
    exampleMessage:
      "I'm planning a direct mail campaign to 2 million customers. I need to use decile " +
      "analysis to determine how deep into my file I can mail profitably. Can you walk me " +
      "through the analysis methodology?",
    acceptableBehaviors: [
      "Explain decile segmentation",
      "Describe ranking methodology",
      "Introduce cumulative analysis",
    ],
    criticalBehaviors: [
      "MUST explain decile = 10 equal groups",
      "MUST describe ranking by response/value",
      "MUST introduce cumulative response concept",
    ],
  },
  {
    turnNumber: 2,
    role: "user",
    expectedIntent: "request_cutoff_analysis",
    exampleMessage:
      "My mail piece costs $0.85 including postage and fulfillment. Average order value is " +
      "$125 with a 35% margin. Historical response rates by decile are: D1: 4.5%, D2: 3.8%, " +
      "D3: 3.2%, D4: 2.6%, D5: 2.1%, D6: 1.7%, D7: 1.3%, D8: 0.9%, D9: 0.6%, D10: 0.3%. " +
      "Where should I set my cutoff?",
    acceptableBehaviors: [
      "Calculate break-even response rate",
      "Identify profitable deciles",
      "Recommend specific cutoff",
    ],
    criticalBehaviors: [
      "MUST calculate break-even point",
      "MUST show which deciles are profitable",
      "MUST recommend specific cutoff decile",
    ],
  },
  {
    turnNumber: 3,
    role: "user",
    expectedIntent: "request_scenario_comparison",
    exampleMessage:
      "What if I want to maximize total profit vs. maximize ROI? Show me the difference " +
      "between mailing through decile 5 vs decile 7. Which approach should I take?",
    acceptableBehaviors: [
      "Compare scenarios quantitatively",
      "Show profit vs ROI tradeoff",
      "Recommend based on objectives",
    ],
    criticalBehaviors: [
      "MUST show total profit for each scenario",
      "MUST show ROI/efficiency for each",
      "MUST explain volume vs efficiency tradeoff",
    ],
  },
];

export const decileAnalysisScenario: TestScenario = {
  id: "adv-decile-analysis-cutoff",
  name: "Decile Analysis & Investment Cutoffs",
  description:
    "Tests agent's ability to perform decile analysis for print/direct mail, " +
    "calculate break-even points, and recommend investment cutoffs.",
  category: "advanced-analytics",
  persona: printMediaPlannerPersona,
  turns: decileAnalysisTurns,
  maxTurns: 8,
  qualityContext: {
    scenarioType: "decile-analysis",
    vertical: "FINANCE",
    dataAvailable: {
      customerFile: 2000000,
      historicalResponse: true,
      costData: true,
    },
  },
  successCriteria: {
    minimumOverallScore: 0.8,
    requiredBehaviors: [
      "Decile methodology explanation",
      "Break-even calculation",
      "Cutoff recommendation",
      "Scenario comparison",
    ],
    noCriticalFailures: true,
  },
};

// ============================================================================
// SCENARIO 4: LOOKALIKE AUDIENCE STRATEGY
// ============================================================================

const lookalikeStrategyTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    role: "user",
    expectedIntent: "request_seed_guidance",
    exampleMessage:
      "I have 150,000 customers and want to build lookalike audiences on Meta and Google. " +
      "How should I define my seed audience? Should I use all customers or segment them?",
    acceptableBehaviors: [
      "Recommend seed segmentation",
      "Discuss seed size requirements",
      "Suggest high-value seed approach",
    ],
    criticalBehaviors: [
      "MUST recommend using best customers as seed",
      "MUST mention minimum seed size (1000+)",
      "MUST discuss seed quality importance",
    ],
  },
  {
    turnNumber: 2,
    role: "user",
    expectedIntent: "request_expansion_strategy",
    exampleMessage:
      "If I use my top 20% customers (30,000) as my seed, what expansion percentage should " +
      "I use on Meta? 1% or 5% or 10%? How does this affect performance?",
    acceptableBehaviors: [
      "Explain expansion trade-offs",
      "Recommend starting narrow",
      "Discuss performance expectations",
    ],
    criticalBehaviors: [
      "MUST explain 1% = most similar, 10% = broader reach",
      "MUST recommend starting with 1-2% and testing",
      "MUST set expectations on CPA vs seed",
    ],
  },
  {
    turnNumber: 3,
    role: "user",
    expectedIntent: "request_platform_specifics",
    exampleMessage:
      "What's the difference between Meta lookalikes and Google Similar Audiences? " +
      "How should I use them differently in my $1M campaign?",
    acceptableBehaviors: [
      "Compare platform capabilities",
      "Suggest platform-specific strategies",
      "Recommend budget split",
    ],
    criticalBehaviors: [
      "MUST explain Meta vs Google differences",
      "MUST recommend testing approach",
      "MUST suggest refresh cadence",
    ],
  },
];

export const lookalikeStrategyScenario: TestScenario = {
  id: "adv-lookalike-audience-strategy",
  name: "Lookalike Audience Strategy",
  description:
    "Tests agent's ability to guide lookalike audience creation, seed selection, " +
    "expansion strategy, and platform-specific recommendations.",
  category: "advanced-analytics",
  persona: lookalikeStrategyPersona,
  turns: lookalikeStrategyTurns,
  maxTurns: 8,
  qualityContext: {
    scenarioType: "lookalike-strategy",
    vertical: "ECOMMERCE",
    dataAvailable: {
      customerBase: 150000,
      platforms: ["meta", "google"],
    },
  },
  successCriteria: {
    minimumOverallScore: 0.8,
    requiredBehaviors: [
      "Seed audience guidance",
      "Expansion percentage recommendation",
      "Performance expectations",
      "Platform comparison",
    ],
    noCriticalFailures: true,
  },
};

// ============================================================================
// SCENARIO 5: NAME FLOW & CUSTOMER JOURNEY MAPPING
// ============================================================================

const nameFlowTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    role: "user",
    expectedIntent: "request_journey_mapping",
    exampleMessage:
      "I need to map our customer journey from acquisition through loyalty. We have data on " +
      "when customers enter, their first purchase, repeat purchases, and when they go dormant. " +
      "How should I structure this name flow analysis?",
    acceptableBehaviors: [
      "Define journey stages",
      "Explain stage transitions",
      "Introduce flow metrics",
    ],
    criticalBehaviors: [
      "MUST define clear stages (acquisition, activation, retention, etc.)",
      "MUST explain how customers move between stages",
      "MUST introduce key metrics per stage",
    ],
  },
  {
    turnNumber: 2,
    role: "user",
    expectedIntent: "request_stage_sizing",
    exampleMessage:
      "Based on our 500K customers, how should I expect them to distribute across stages? " +
      "What are typical conversion rates between stages?",
    acceptableBehaviors: [
      "Provide stage distribution benchmarks",
      "Show conversion rate expectations",
      "Identify optimization opportunities",
    ],
    criticalBehaviors: [
      "MUST provide percentage distribution by stage",
      "MUST show expected conversion rates",
      "MUST identify drop-off points",
    ],
  },
  {
    turnNumber: 3,
    role: "user",
    expectedIntent: "request_stage_marketing",
    exampleMessage:
      "What should our marketing strategy be at each stage? How do we allocate our budget " +
      "across acquisition, retention, and reactivation?",
    acceptableBehaviors: [
      "Recommend stage-specific strategies",
      "Suggest budget allocation",
      "Define stage KPIs",
    ],
    criticalBehaviors: [
      "MUST differentiate treatment by stage",
      "MUST recommend budget allocation rationale",
      "MUST define success metrics per stage",
    ],
  },
];

export const nameFlowScenario: TestScenario = {
  id: "adv-name-flow-journey-mapping",
  name: "Name Flow & Customer Journey Mapping",
  description:
    "Tests agent's ability to map customer lifecycles, define stages, " +
    "analyze stage transitions, and recommend stage-specific marketing.",
  category: "advanced-analytics",
  persona: dataRichEcommercePersona,
  turns: nameFlowTurns,
  maxTurns: 8,
  qualityContext: {
    scenarioType: "name-flow",
    vertical: "ECOMMERCE",
    dataAvailable: {
      customerBase: 500000,
      journeyData: true,
    },
  },
  successCriteria: {
    minimumOverallScore: 0.8,
    requiredBehaviors: [
      "Stage definition",
      "Transition metrics",
      "Stage-specific marketing",
      "Budget allocation rationale",
    ],
    noCriticalFailures: true,
  },
};

// ============================================================================
// SCENARIO 6: PROFITABILITY-BASED MEDIA PLAN
// ============================================================================

const profitabilityMediaPlanTurns: ConversationTurn[] = [
  {
    turnNumber: 1,
    role: "user",
    expectedIntent: "provide_segment_economics",
    exampleMessage:
      "I have 5 RFM segments with different LTVs: Champions ($1,200 LTV), Loyal ($650 LTV), " +
      "Potential ($380 LTV), At-Risk ($290 LTV), and Lost ($85 LTV). Given a $2M budget, " +
      "how should I allocate spend across segments based on profitability?",
    acceptableBehaviors: [
      "Calculate allowable CPA by segment",
      "Recommend budget allocation",
      "Show expected returns",
    ],
    criticalBehaviors: [
      "MUST show different CPA targets by segment",
      "MUST recommend budget weighted by value",
      "MUST project expected ROI",
    ],
  },
  {
    turnNumber: 2,
    role: "user",
    expectedIntent: "request_channel_allocation",
    exampleMessage:
      "For each segment, what channels should we use? I want to see a segment x channel " +
      "budget matrix with expected CPA and volume for each combination.",
    acceptableBehaviors: [
      "Provide segment-channel matrix",
      "Show expected CPA by cell",
      "Estimate volume by combination",
    ],
    criticalBehaviors: [
      "MUST show segment x channel budget matrix",
      "MUST differentiate CPA expectations",
      "MUST estimate volume/conversions",
    ],
  },
  {
    turnNumber: 3,
    role: "user",
    expectedIntent: "request_total_plan",
    exampleMessage:
      "Pull this together into a complete media plan. Show me total expected conversions, " +
      "blended CPA, and total revenue based on our segment-specific LTVs.",
    acceptableBehaviors: [
      "Summarize total plan metrics",
      "Calculate blended CPA",
      "Project total revenue/ROI",
    ],
    criticalBehaviors: [
      "MUST show total conversions by segment",
      "MUST calculate blended CPA",
      "MUST project revenue based on LTV mix",
    ],
  },
];

export const profitabilityMediaPlanScenario: TestScenario = {
  id: "adv-profitability-media-plan",
  name: "Profitability-Based Media Plan",
  description:
    "Tests agent's ability to build media plans based on segment-level " +
    "profitability, showing LTV-based CPA targets and ROI projections.",
  category: "advanced-analytics",
  persona: dataRichEcommercePersona,
  turns: profitabilityMediaPlanTurns,
  maxTurns: 8,
  qualityContext: {
    scenarioType: "profitability-planning",
    vertical: "ECOMMERCE",
    dataAvailable: {
      segmentedLTV: true,
      budget: 2000000,
    },
  },
  successCriteria: {
    minimumOverallScore: 0.85,
    requiredBehaviors: [
      "Segment-level CPA targets",
      "LTV-based budget allocation",
      "Segment x channel matrix",
      "Total plan ROI projection",
    ],
    noCriticalFailures: true,
  },
};

// ============================================================================
// ALL SCENARIOS EXPORT
// ============================================================================

export const ADVANCED_ANALYTICS_SCENARIOS: TestScenario[] = [
  rfmSegmentationScenario,
  propensityModelScenario,
  decileAnalysisScenario,
  lookalikeStrategyScenario,
  nameFlowScenario,
  profitabilityMediaPlanScenario,
];

export default ADVANCED_ANALYTICS_SCENARIOS;
