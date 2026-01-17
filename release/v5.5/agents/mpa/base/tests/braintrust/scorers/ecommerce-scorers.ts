/**
 * Ecommerce-Specific Scorers
 *
 * New scorers for MPA v5.8 ecommerce test scenarios based on real-world data:
 * - rfm-segment-recognition: Validates understanding of RFM (Recency, Frequency, Monetary) segments
 * - reactivation-strategy: Validates dormant customer reactivation guidance
 * - retention-acquisition-balance: Validates balanced portfolio recommendations
 * - cohort-analysis-usage: Validates use of cohort retention data
 * - lookalike-audience-strategy: Validates VIP/seed audience expansion recommendations
 * - seasonal-planning: Validates Q4/Q1 seasonal retention planning
 * - customer-ltv-application: Validates LTV consideration in recommendations
 * - retention-channel-mix: Validates appropriate channel recommendations for retention
 *
 * SCORER_SPECIFICATION: v3.2 (Ecommerce Extension)
 */

import { TurnScore } from "../mpa-multi-turn-types.js";

// =============================================================================
// RFM SEGMENT RECOGNITION SCORER
// =============================================================================

/**
 * RFM terminology patterns
 */
const RFM_PATTERNS = [
  /rfm/i,
  /recency[,\s]+(frequency|monetary)/i,
  /frequency[,\s]+(recency|monetary)/i,
  /monetary[,\s]+(recency|frequency)/i,
  /customer\s*(segments?|segmentation)/i,
  /behavioral\s*segment/i,
];

/**
 * Segment-specific patterns
 */
const SEGMENT_PATTERNS = {
  dormant: [/dormant/i, /lapsed/i, /inactive/i, /churned/i, /lost/i, /haven't\s*(purchased|bought|ordered)/i],
  atRisk: [/at[\s-]?risk/i, /declining/i, /slipping/i, /cooling/i],
  loyal: [/loyal/i, /vip/i, /high[\s-]?value/i, /repeat/i, /frequent/i, /champions?/i],
  new: [/new\s*(customers?|users?|buyers?)/i, /first[\s-]?time/i, /recently\s*acquired/i],
  potential: [/potential/i, /promising/i, /emerging/i, /growing/i],
};

/**
 * Score RFM segment recognition
 *
 * Validates that agent understands and references RFM segmentation
 * when user provides customer behavior data.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export function scoreRfmSegmentRecognition(
  output: string,
  input: string
): TurnScore {
  // Check if user mentioned customer segments or RFM-like data
  const userMentionsSegments = 
    /customers?\s*(who|that|haven't|didn't)/i.test(input) ||
    /segment/i.test(input) ||
    /dormant|inactive|lapsed/i.test(input) ||
    /orders?|purchases?|bought/i.test(input);

  if (!userMentionsSegments) {
    return {
      scorer: 'rfm-segment-recognition',
      score: 1.0,
      metadata: { status: 'not_applicable' },
      scope: 'turn',
    };
  }

  // Check for RFM understanding
  const hasRfmTerminology = RFM_PATTERNS.some(p => p.test(output));
  
  // Check for segment-specific language
  const segmentsRecognized: string[] = [];
  for (const [segment, patterns] of Object.entries(SEGMENT_PATTERNS)) {
    if (patterns.some(p => p.test(output))) {
      segmentsRecognized.push(segment);
    }
  }

  // Check for actionable segment strategy
  const hasSegmentStrategy = 
    /target(ing)?\s*(these|those|this|the)\s*(segment|customers?|group)/i.test(output) ||
    /segment[\s-]?specific/i.test(output) ||
    /different\s*(approach|strategy|treatment)/i.test(output);

  // Scoring logic
  let score = 0;
  let status = 'needs_improvement';

  if ((hasRfmTerminology || segmentsRecognized.length >= 2) && hasSegmentStrategy) {
    score = 1.0;
    status = 'excellent_segment_understanding';
  } else if (segmentsRecognized.length >= 1 && hasSegmentStrategy) {
    score = 0.8;
    status = 'good_segment_strategy';
  } else if (segmentsRecognized.length >= 1) {
    score = 0.6;
    status = 'recognized_without_strategy';
  } else if (hasRfmTerminology) {
    score = 0.5;
    status = 'terminology_only';
  } else {
    score = 0.3;
    status = 'no_segment_recognition';
  }

  return {
    scorer: 'rfm-segment-recognition',
    score,
    metadata: {
      userMentionsSegments,
      hasRfmTerminology,
      segmentsRecognized,
      hasSegmentStrategy,
      status,
    },
    scope: 'turn',
  };
}

// =============================================================================
// REACTIVATION STRATEGY SCORER
// =============================================================================

/**
 * Reactivation-specific channel patterns
 */
const REACTIVATION_CHANNELS = [
  /email/i,
  /sms/i,
  /direct\s*mail/i,
  /retarget/i,
  /re-?engage/i,
  /win[\s-]?back/i,
  /remarketing/i,
];

/**
 * Reactivation strategy patterns
 */
const REACTIVATION_STRATEGY_PATTERNS = [
  /win[\s-]?back/i,
  /re-?activat/i,
  /re-?engage/i,
  /bring\s*(them\s*)?back/i,
  /recover/i,
  /dormant\s*(campaign|strategy|effort)/i,
  /lapsed\s*(customer)?\s*(campaign|program)/i,
];

/**
 * Reactivation economics patterns
 */
const REACTIVATION_ECONOMICS = [
  /cost\s*(to\s*)?re-?activat/i,
  /cheaper\s*than\s*(acquisition|acquiring)/i,
  /lower\s*(cac|cost)/i,
  /existing\s*relationship/i,
  /already\s*know/i,
  /already\s*have\s*(their\s*)?(data|email|contact)/i,
];

/**
 * Score reactivation strategy
 *
 * Validates that agent provides appropriate dormant customer
 * reactivation recommendations.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export function scoreReactivationStrategy(
  output: string,
  input: string
): TurnScore {
  // Check if user asks about dormant/inactive customers
  const asksAboutDormant = 
    /dormant|inactive|lapsed|haven't\s*(purchased|bought|ordered)/i.test(input) ||
    /re-?activat/i.test(input) ||
    /bring\s*(them\s*)?back/i.test(input);

  if (!asksAboutDormant) {
    return {
      scorer: 'reactivation-strategy',
      score: 1.0,
      metadata: { status: 'not_applicable' },
      scope: 'turn',
    };
  }

  // Check for reactivation channels
  const channelsRecommended = REACTIVATION_CHANNELS.filter(p => p.test(output));
  
  // Check for strategy
  const hasStrategy = REACTIVATION_STRATEGY_PATTERNS.some(p => p.test(output));
  
  // Check for economics understanding
  const hasEconomics = REACTIVATION_ECONOMICS.some(p => p.test(output));
  
  // Check for segmentation within dormant
  const hasSubSegmentation = 
    /(recently|long[\s-]?term)\s*(dormant|lapsed|inactive)/i.test(output) ||
    /tier|prioritize|segment/i.test(output);

  // Scoring logic
  let score = 0;
  let status = 'needs_improvement';

  if (channelsRecommended.length >= 2 && hasStrategy && hasEconomics) {
    score = 1.0;
    status = 'comprehensive_reactivation';
  } else if (channelsRecommended.length >= 1 && hasStrategy) {
    score = 0.8;
    status = 'good_strategy_channels';
  } else if (hasStrategy && hasSubSegmentation) {
    score = 0.7;
    status = 'strategy_with_segmentation';
  } else if (channelsRecommended.length >= 1) {
    score = 0.5;
    status = 'channels_only';
  } else {
    score = 0.2;
    status = 'no_reactivation_guidance';
  }

  return {
    scorer: 'reactivation-strategy',
    score,
    metadata: {
      asksAboutDormant,
      channelsRecommended: channelsRecommended.length,
      hasStrategy,
      hasEconomics,
      hasSubSegmentation,
      status,
    },
    scope: 'turn',
  };
}

// =============================================================================
// RETENTION VS ACQUISITION BALANCE SCORER
// =============================================================================

/**
 * Retention channel patterns
 */
const RETENTION_CHANNELS = [
  /email/i,
  /sms/i,
  /crm/i,
  /loyalty/i,
  /push\s*notif/i,
  /owned\s*(media|channel)/i,
];

/**
 * Acquisition channel patterns
 */
const ACQUISITION_CHANNELS = [
  /paid\s*(social|search|media)/i,
  /meta|facebook/i,
  /google\s*(ads?|pmax)/i,
  /prospecting/i,
  /awareness/i,
  /upper[\s-]?funnel/i,
];

/**
 * Balance/portfolio patterns
 */
const BALANCE_PATTERNS = [
  /balance/i,
  /portfolio/i,
  /mix/i,
  /both/i,
  /combination/i,
  /allocat/i,
  /split/i,
];

/**
 * Score retention vs acquisition balance
 *
 * Validates that agent recommends balanced approach when user
 * provides new vs returning customer data.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export function scoreRetentionAcquisitionBalance(
  output: string,
  input: string
): TurnScore {
  // Check if user provides new vs returning data
  const hasNewVsReturning = 
    /(new|returning|repeat)\s*(customers?|users?|revenue)/i.test(input) ||
    /\d+%.*\d+%/i.test(input) ||
    /acquisition.*retention|retention.*acquisition/i.test(input);

  if (!hasNewVsReturning) {
    return {
      scorer: 'retention-acquisition-balance',
      score: 1.0,
      metadata: { status: 'not_applicable' },
      scope: 'turn',
    };
  }

  // Check for retention channels
  const retentionChannels = RETENTION_CHANNELS.filter(p => p.test(output));
  
  // Check for acquisition channels
  const acquisitionChannels = ACQUISITION_CHANNELS.filter(p => p.test(output));
  
  // Check for balance recommendation
  const hasBalanceRec = BALANCE_PATTERNS.some(p => p.test(output));
  
  // Check for percentage allocation
  const hasAllocationNumbers = /\d+%\s*(to|for|on)\s*(retention|acquisition|new|returning)/i.test(output);

  // Scoring logic
  let score = 0;
  let status = 'needs_improvement';

  if (retentionChannels.length >= 1 && acquisitionChannels.length >= 1 && hasBalanceRec) {
    score = 1.0;
    status = 'balanced_recommendation';
  } else if (hasBalanceRec && hasAllocationNumbers) {
    score = 0.9;
    status = 'quantified_balance';
  } else if (retentionChannels.length >= 1 && acquisitionChannels.length >= 1) {
    score = 0.7;
    status = 'both_mentioned_no_balance';
  } else if (hasBalanceRec) {
    score = 0.5;
    status = 'balance_without_specifics';
  } else {
    score = 0.2;
    status = 'one_sided_recommendation';
  }

  return {
    scorer: 'retention-acquisition-balance',
    score,
    metadata: {
      hasNewVsReturning,
      retentionChannels: retentionChannels.length,
      acquisitionChannels: acquisitionChannels.length,
      hasBalanceRec,
      hasAllocationNumbers,
      status,
    },
    scope: 'turn',
  };
}

// =============================================================================
// COHORT ANALYSIS USAGE SCORER
// =============================================================================

/**
 * Cohort terminology patterns
 */
const COHORT_PATTERNS = [
  /cohort/i,
  /year[\s-]?over[\s-]?year/i,
  /yoy/i,
  /retention\s*rate/i,
  /churn\s*rate/i,
  /customer\s*lifetime/i,
  /repeat\s*rate/i,
];

/**
 * Trend analysis patterns
 */
const TREND_PATTERNS = [
  /trend/i,
  /declin/i,
  /increas/i,
  /improv/i,
  /worsen/i,
  /drop/i,
  /grew|grow/i,
];

/**
 * Score cohort analysis usage
 *
 * Validates that agent uses cohort retention data when provided.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export function scoreCohortAnalysisUsage(
  output: string,
  input: string
): TurnScore {
  // Check if user provides retention/cohort data
  const hasCohortData = 
    /retention.*\d+%/i.test(input) ||
    /dropped|declined|fell/i.test(input) ||
    /year[\s-]?over[\s-]?year|yoy/i.test(input) ||
    /cohort/i.test(input);

  if (!hasCohortData) {
    return {
      scorer: 'cohort-analysis-usage',
      score: 1.0,
      metadata: { status: 'not_applicable' },
      scope: 'turn',
    };
  }

  // Check for cohort terminology
  const hasCohortTerms = COHORT_PATTERNS.some(p => p.test(output));
  
  // Check for trend acknowledgment
  const hasTrendAnalysis = TREND_PATTERNS.some(p => p.test(output));
  
  // Check for actionable response to trend
  const hasActionableResponse = 
    /to\s*(improve|address|reverse|combat)/i.test(output) ||
    /strategy\s*(to|for)/i.test(output) ||
    /recommend/i.test(output);

  // Scoring logic
  let score = 0;
  let status = 'needs_improvement';

  if (hasCohortTerms && hasTrendAnalysis && hasActionableResponse) {
    score = 1.0;
    status = 'comprehensive_cohort_response';
  } else if (hasTrendAnalysis && hasActionableResponse) {
    score = 0.8;
    status = 'trend_with_action';
  } else if (hasCohortTerms || hasTrendAnalysis) {
    score = 0.5;
    status = 'acknowledged_no_action';
  } else {
    score = 0.2;
    status = 'ignored_cohort_data';
  }

  return {
    scorer: 'cohort-analysis-usage',
    score,
    metadata: {
      hasCohortData,
      hasCohortTerms,
      hasTrendAnalysis,
      hasActionableResponse,
      status,
    },
    scope: 'turn',
  };
}

// =============================================================================
// LOOKALIKE AUDIENCE STRATEGY SCORER
// =============================================================================

/**
 * Lookalike/seed audience patterns
 */
const LOOKALIKE_PATTERNS = [
  /lookalike/i,
  /look[\s-]?alike/i,
  /similar\s*(audience|customers?|users?)/i,
  /seed\s*(audience|list|data)/i,
  /modeled\s*audience/i,
  /act[\s-]?alike/i,
];

/**
 * First-party data patterns
 */
const FIRST_PARTY_PATTERNS = [
  /first[\s-]?party/i,
  /1p\s*data/i,
  /your\s*(data|customer\s*list|email\s*list)/i,
  /crm\s*(data|list|upload)/i,
  /customer\s*match/i,
  /custom\s*audience/i,
];

/**
 * Platform-specific lookalike patterns
 */
const PLATFORM_LOOKALIKE_PATTERNS = [
  /meta\s*(lookalike|similar)/i,
  /facebook\s*lookalike/i,
  /google\s*(similar|customer\s*match)/i,
  /linkedin\s*(matched|lookalike)/i,
  /value[\s-]?based\s*lookalike/i,
];

/**
 * Score lookalike audience strategy
 *
 * Validates that agent recommends lookalike audiences when user
 * mentions VIP or high-value customer segments.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export function scoreLookalikeAudienceStrategy(
  output: string,
  input: string
): TurnScore {
  // Check if user mentions VIP/high-value customers
  const hasHighValueMention = 
    /vip/i.test(input) ||
    /high[\s-]?value/i.test(input) ||
    /best\s*customers?/i.test(input) ||
    /loyal/i.test(input) ||
    /\d+\+\s*orders?/i.test(input) ||
    /\$\d+.*lifetime/i.test(input) ||
    /find\s*more\s*(like|similar)/i.test(input);

  if (!hasHighValueMention) {
    return {
      scorer: 'lookalike-audience-strategy',
      score: 1.0,
      metadata: { status: 'not_applicable' },
      scope: 'turn',
    };
  }

  // Check for lookalike recommendation
  const hasLookalikeRec = LOOKALIKE_PATTERNS.some(p => p.test(output));
  
  // Check for first-party data mention
  const hasFirstParty = FIRST_PARTY_PATTERNS.some(p => p.test(output));
  
  // Check for platform-specific guidance
  const hasPlatformSpecific = PLATFORM_LOOKALIKE_PATTERNS.some(p => p.test(output));
  
  // Check for seed quality guidance
  const hasSeedQuality = 
    /quality|size|minimum|at\s*least/i.test(output) &&
    /(seed|source|list)/i.test(output);

  // Scoring logic
  let score = 0;
  let status = 'needs_improvement';

  if (hasLookalikeRec && hasFirstParty && hasPlatformSpecific) {
    score = 1.0;
    status = 'comprehensive_lookalike_strategy';
  } else if (hasLookalikeRec && (hasFirstParty || hasPlatformSpecific)) {
    score = 0.8;
    status = 'good_lookalike_guidance';
  } else if (hasLookalikeRec) {
    score = 0.6;
    status = 'basic_lookalike_mention';
  } else if (hasFirstParty) {
    score = 0.4;
    status = 'first_party_without_lookalike';
  } else {
    score = 0.2;
    status = 'no_expansion_strategy';
  }

  return {
    scorer: 'lookalike-audience-strategy',
    score,
    metadata: {
      hasHighValueMention,
      hasLookalikeRec,
      hasFirstParty,
      hasPlatformSpecific,
      hasSeedQuality,
      status,
    },
    scope: 'turn',
  };
}

// =============================================================================
// SEASONAL PLANNING SCORER
// =============================================================================

/**
 * Seasonal/timing patterns
 */
const SEASONAL_PATTERNS = [
  /q[1-4]/i,
  /quarter/i,
  /holiday/i,
  /seasonal/i,
  /black\s*friday/i,
  /cyber\s*monday/i,
  /january|february|march|april|may|june|july|august|september|october|november|december/i,
];

/**
 * Retention timing patterns
 */
const RETENTION_TIMING_PATTERNS = [
  /\d+[\s-]?day/i,
  /first\s*\d+/i,
  /within\s*\d+/i,
  /welcome\s*(series|sequence|flow)/i,
  /post[\s-]?purchase/i,
  /onboarding/i,
  /engagement\s*window/i,
];

/**
 * Score seasonal planning
 *
 * Validates that agent provides seasonally-aware recommendations.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export function scoreSeasonalPlanning(
  output: string,
  input: string
): TurnScore {
  // Check if user mentions seasonal context
  const hasSeasonalContext = SEASONAL_PATTERNS.some(p => p.test(input));

  if (!hasSeasonalContext) {
    return {
      scorer: 'seasonal-planning',
      score: 1.0,
      metadata: { status: 'not_applicable' },
      scope: 'turn',
    };
  }

  // Check for seasonal acknowledgment in response
  const acknowledgesSeason = SEASONAL_PATTERNS.some(p => p.test(output));
  
  // Check for timing-specific retention
  const hasRetentionTiming = RETENTION_TIMING_PATTERNS.some(p => p.test(output));
  
  // Check for budget/strategy adjustment
  const hasStrategyAdjustment = 
    /adjust|shift|increase|decrease|reallocate/i.test(output) ||
    /different\s*(approach|strategy|allocation)/i.test(output);

  // Scoring logic
  let score = 0;
  let status = 'needs_improvement';

  if (acknowledgesSeason && hasRetentionTiming && hasStrategyAdjustment) {
    score = 1.0;
    status = 'comprehensive_seasonal_plan';
  } else if (acknowledgesSeason && (hasRetentionTiming || hasStrategyAdjustment)) {
    score = 0.8;
    status = 'good_seasonal_awareness';
  } else if (acknowledgesSeason) {
    score = 0.5;
    status = 'acknowledged_no_action';
  } else {
    score = 0.2;
    status = 'ignored_seasonal_context';
  }

  return {
    scorer: 'seasonal-planning',
    score,
    metadata: {
      hasSeasonalContext,
      acknowledgesSeason,
      hasRetentionTiming,
      hasStrategyAdjustment,
      status,
    },
    scope: 'turn',
  };
}

// =============================================================================
// CUSTOMER LTV APPLICATION SCORER  
// =============================================================================

/**
 * LTV terminology patterns
 */
const LTV_PATTERNS = [
  /ltv/i,
  /lifetime\s*value/i,
  /clv/i,
  /customer\s*value/i,
  /total\s*value/i,
  /long[\s-]?term\s*value/i,
];

/**
 * LTV-based decision patterns
 */
const LTV_DECISION_PATTERNS = [
  /ltv[\s:]*\$?\d+/i,
  /worth\s*\$?\d+/i,
  /value\s*(of|is|at)\s*\$?\d+/i,
  /payback/i,
  /roi/i,
  /return\s*on/i,
  /profitable/i,
];

/**
 * Score customer LTV application
 *
 * Validates that agent considers LTV when user provides customer value data.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export function scoreCustomerLtvApplication(
  output: string,
  input: string
): TurnScore {
  // Check if user provides LTV or value data
  const hasLtvData = 
    LTV_PATTERNS.some(p => p.test(input)) ||
    /\$\d+.*value/i.test(input) ||
    /average\s*(order|purchase)/i.test(input);

  if (!hasLtvData) {
    return {
      scorer: 'customer-ltv-application',
      score: 1.0,
      metadata: { status: 'not_applicable' },
      scope: 'turn',
    };
  }

  // Check for LTV terminology in response
  const usesLtvTerms = LTV_PATTERNS.some(p => p.test(output));
  
  // Check for LTV-based decisions
  const hasLtvDecision = LTV_DECISION_PATTERNS.some(p => p.test(output));
  
  // Check for CAC to LTV comparison
  const hasCacLtvRatio = 
    /cac.*ltv|ltv.*cac/i.test(output) ||
    /ratio/i.test(output) ||
    /\d+:\d+/i.test(output) ||
    /\d+x/i.test(output);

  // Scoring logic
  let score = 0;
  let status = 'needs_improvement';

  if (usesLtvTerms && hasLtvDecision && hasCacLtvRatio) {
    score = 1.0;
    status = 'comprehensive_ltv_application';
  } else if (usesLtvTerms && hasLtvDecision) {
    score = 0.8;
    status = 'good_ltv_usage';
  } else if (usesLtvTerms || hasLtvDecision) {
    score = 0.5;
    status = 'partial_ltv_consideration';
  } else {
    score = 0.2;
    status = 'ignored_ltv_data';
  }

  return {
    scorer: 'customer-ltv-application',
    score,
    metadata: {
      hasLtvData,
      usesLtvTerms,
      hasLtvDecision,
      hasCacLtvRatio,
      status,
    },
    scope: 'turn',
  };
}

// =============================================================================
// RETENTION CHANNEL MIX SCORER
// =============================================================================

/**
 * Appropriate retention channel patterns
 */
const APPROPRIATE_RETENTION_CHANNELS = {
  email: [/email/i, /newsletter/i, /e-?mail/i],
  sms: [/sms/i, /text\s*(message)?/i, /mobile\s*message/i],
  push: [/push\s*notif/i, /app\s*notif/i, /mobile\s*push/i],
  loyalty: [/loyalty/i, /rewards?/i, /points?\s*program/i],
  lifecycle: [/lifecycle/i, /journey/i, /automation/i, /flow/i, /sequence/i],
};

/**
 * Score retention channel mix
 *
 * Validates that agent recommends appropriate channels for retention.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export function scoreRetentionChannelMix(
  output: string,
  input: string
): TurnScore {
  // Check if context is about retention
  const isRetentionContext = 
    /retention|retain|returning|repeat|loyal|dormant|re-?activat/i.test(input);

  if (!isRetentionContext) {
    return {
      scorer: 'retention-channel-mix',
      score: 1.0,
      metadata: { status: 'not_applicable' },
      scope: 'turn',
    };
  }

  // Check for appropriate retention channels
  const channelsRecommended: string[] = [];
  for (const [channel, patterns] of Object.entries(APPROPRIATE_RETENTION_CHANNELS)) {
    if (patterns.some(p => p.test(output))) {
      channelsRecommended.push(channel);
    }
  }

  // Check for lifecycle/automation emphasis
  const hasLifecycleEmphasis = 
    /lifecycle|automation|flow|sequence|series/i.test(output);

  // Check for segmented approach
  const hasSegmentedApproach = 
    /segment|tier|different\s*(message|approach|content)/i.test(output);

  // Scoring logic
  let score = 0;
  let status = 'needs_improvement';

  if (channelsRecommended.length >= 2 && hasLifecycleEmphasis) {
    score = 1.0;
    status = 'comprehensive_retention_mix';
  } else if (channelsRecommended.length >= 2) {
    score = 0.8;
    status = 'multiple_retention_channels';
  } else if (channelsRecommended.length === 1 && hasSegmentedApproach) {
    score = 0.7;
    status = 'single_channel_segmented';
  } else if (channelsRecommended.length >= 1) {
    score = 0.5;
    status = 'basic_retention_channel';
  } else {
    score = 0.2;
    status = 'no_retention_channels';
  }

  return {
    scorer: 'retention-channel-mix',
    score,
    metadata: {
      isRetentionContext,
      channelsRecommended,
      hasLifecycleEmphasis,
      hasSegmentedApproach,
      status,
    },
    scope: 'turn',
  };
}


// =============================================================================
// EXPORTS
// =============================================================================

export const ecommerceScorers = {
  scoreRfmSegmentRecognition,
  scoreReactivationStrategy,
  scoreRetentionAcquisitionBalance,
  scoreCohortAnalysisUsage,
  scoreLookalikeAudienceStrategy,
  scoreSeasonalPlanning,
  scoreCustomerLtvApplication,
  scoreRetentionChannelMix,
};

export default ecommerceScorers;
