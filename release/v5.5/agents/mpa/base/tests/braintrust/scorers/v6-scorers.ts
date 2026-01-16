/**
 * V6.0 Specific Scorers
 *
 * New scorers for MPA v6.0 KB architecture:
 * - benchmark-vertical-coverage: Validates vertical-appropriate benchmark retrieval
 * - web-search-trigger: Validates web search detection for external data
 * - kb-routing-validation: Validates META tag routing compliance
 *
 * SCORER_SPECIFICATION: v3.0
 */

import { TurnScore } from "../mpa-multi-turn-types.js";

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Supported verticals in MPA v6.0 benchmark dataset (331 records)
 */
export const SUPPORTED_VERTICALS = [
  'RETAIL',
  'ECOMMERCE',
  'CPG',
  'FINANCE',
  'TECHNOLOGY',
  'HEALTHCARE',
  'AUTOMOTIVE',
  'TRAVEL',
  'ENTERTAINMENT',
  'TELECOM',
  'GAMING',
  'HOSPITALITY',
  'EDUCATION',
  'B2B_PROFESSIONAL',
] as const;

export type SupportedVertical = typeof SUPPORTED_VERTICALS[number];

/**
 * Vertical aliases for normalization
 */
const VERTICAL_ALIASES: Record<string, SupportedVertical> = {
  // Retail variations
  'RETAIL': 'RETAIL',
  'STORE': 'RETAIL',
  'SHOP': 'RETAIL',
  // Ecommerce variations
  'ECOMMERCE': 'ECOMMERCE',
  'E-COMMERCE': 'ECOMMERCE',
  'ONLINE RETAIL': 'ECOMMERCE',
  'DTC': 'ECOMMERCE',
  'D2C': 'ECOMMERCE',
  // CPG variations
  'CPG': 'CPG',
  'FMCG': 'CPG',
  'CONSUMER GOODS': 'CPG',
  'PACKAGED GOODS': 'CPG',
  // Finance variations
  'FINANCE': 'FINANCE',
  'FINANCIAL': 'FINANCE',
  'FINANCIAL SERVICES': 'FINANCE',
  'BANKING': 'FINANCE',
  'FINTECH': 'FINANCE',
  'INSURANCE': 'FINANCE',
  // Technology variations
  'TECHNOLOGY': 'TECHNOLOGY',
  'TECH': 'TECHNOLOGY',
  'SOFTWARE': 'TECHNOLOGY',
  'SAAS': 'TECHNOLOGY',
  // Healthcare variations
  'HEALTHCARE': 'HEALTHCARE',
  'HEALTH': 'HEALTHCARE',
  'MEDICAL': 'HEALTHCARE',
  'PHARMA': 'HEALTHCARE',
  'PHARMACEUTICAL': 'HEALTHCARE',
  // Automotive variations
  'AUTOMOTIVE': 'AUTOMOTIVE',
  'AUTO': 'AUTOMOTIVE',
  'CAR': 'AUTOMOTIVE',
  'VEHICLE': 'AUTOMOTIVE',
  // Travel variations
  'TRAVEL': 'TRAVEL',
  'TOURISM': 'TRAVEL',
  'AIRLINE': 'TRAVEL',
  'HOTEL': 'TRAVEL',
  // Entertainment variations
  'ENTERTAINMENT': 'ENTERTAINMENT',
  'MEDIA': 'ENTERTAINMENT',
  'STREAMING': 'ENTERTAINMENT',
  // Telecom variations
  'TELECOM': 'TELECOM',
  'TELECOMMUNICATIONS': 'TELECOM',
  'TELCO': 'TELECOM',
  'WIRELESS': 'TELECOM',
  // Gaming variations
  'GAMING': 'GAMING',
  'GAMES': 'GAMING',
  'VIDEO GAMES': 'GAMING',
  // Hospitality variations
  'HOSPITALITY': 'HOSPITALITY',
  'RESTAURANT': 'HOSPITALITY',
  'FOOD SERVICE': 'HOSPITALITY',
  'QSR': 'HOSPITALITY',
  // Education variations
  'EDUCATION': 'EDUCATION',
  'EDU': 'EDUCATION',
  'EDTECH': 'EDUCATION',
  'HIGHER ED': 'EDUCATION',
  // B2B variations
  'B2B_PROFESSIONAL': 'B2B_PROFESSIONAL',
  'B2B': 'B2B_PROFESSIONAL',
  'PROFESSIONAL SERVICES': 'B2B_PROFESSIONAL',
};

/**
 * Supported channels for benchmark data
 */
export const SUPPORTED_CHANNELS = [
  'PAID_SEARCH',
  'PAID_SOCIAL',
  'PROGRAMMATIC_DISPLAY',
  'CTV_OTT',
] as const;

// =============================================================================
// BENCHMARK VERTICAL COVERAGE SCORER
// =============================================================================

/**
 * Normalize a vertical string to standard format
 */
export function normalizeVertical(vertical: string): SupportedVertical | null {
  const normalized = vertical.toUpperCase().trim();
  return VERTICAL_ALIASES[normalized] || null;
}

/**
 * Check if a vertical is supported
 */
export function isVerticalSupported(vertical: string): boolean {
  return normalizeVertical(vertical) !== null;
}

/**
 * Score benchmark vertical coverage
 *
 * Validates that agent retrieves vertical-appropriate benchmarks when citing data.
 * Weight: 2% (Tier 3)
 *
 * @param output - Agent response
 * @param userVertical - User's industry vertical (from conversation context)
 * @returns TurnScore with benchmark coverage assessment
 */
export function scoreBenchmarkVerticalCoverage(
  output: string,
  userVertical?: string
): TurnScore {
  // If no vertical context, scorer is not applicable
  if (!userVertical) {
    return {
      scorer: 'benchmark-vertical-coverage',
      score: 1.0,
      metadata: { status: 'no_vertical_context' },
      scope: 'turn',
    };
  }

  // Normalize vertical
  const normalizedVertical = normalizeVertical(userVertical);
  const isSupported = normalizedVertical !== null;

  // Check if response mentions benchmark data
  const mentionsBenchmark = /benchmark|typical|industry (average|standard)|market (average|data)/i.test(output);

  // If no benchmark mentioned, scorer is not applicable
  if (!mentionsBenchmark) {
    return {
      scorer: 'benchmark-vertical-coverage',
      score: 1.0,
      metadata: { status: 'no_benchmark_cited', userVertical, isSupported },
      scope: 'turn',
    };
  }

  // Check if agent acknowledges vertical context
  const verticalPatterns = [
    new RegExp(userVertical, 'i'),
    new RegExp(normalizedVertical || '', 'i'),
    /for (your|this) (industry|vertical|sector)/i,
    /in (your|the) (space|market|category)/i,
  ];
  const mentionsVertical = verticalPatterns.some(p => p.test(output));

  // Check for channel-specific benchmark data
  const channelPatterns = SUPPORTED_CHANNELS.map(c => 
    new RegExp(c.replace('_', '[ _]?'), 'i')
  );
  const mentionsChannel = channelPatterns.some(p => p.test(output));

  // Check for specific metrics
  const hasSpecificMetrics = /\$[\d,]+|\d+(\.\d+)?%|\d+(\.\d+)?x/i.test(output);

  // Scoring logic
  let score = 0;
  let status = 'needs_improvement';

  if (isSupported && mentionsVertical && hasSpecificMetrics) {
    score = 1.0;
    status = 'excellent';
  } else if (isSupported && mentionsBenchmark && hasSpecificMetrics) {
    score = 0.8;
    status = 'good_missing_vertical_context';
  } else if (mentionsBenchmark && hasSpecificMetrics) {
    score = 0.6;
    status = 'generic_benchmark';
  } else if (mentionsBenchmark) {
    score = 0.4;
    status = 'benchmark_without_specifics';
  } else {
    score = 0.3;
    status = 'needs_improvement';
  }

  // Bonus for channel-specific data
  if (mentionsChannel && score < 1.0) {
    score = Math.min(1.0, score + 0.1);
  }

  return {
    scorer: 'benchmark-vertical-coverage',
    score,
    metadata: {
      userVertical,
      normalizedVertical,
      isSupported,
      mentionsBenchmark,
      mentionsVertical,
      mentionsChannel,
      hasSpecificMetrics,
      status,
    },
    scope: 'turn',
  };
}

// =============================================================================
// WEB SEARCH TRIGGER SCORER
// =============================================================================

/**
 * Patterns that indicate web search should be triggered
 */
const WEB_SEARCH_INDICATORS = [
  // Census/population data
  /census|population (data|statistics|count)/i,
  /acs \d{4}|american community survey/i,
  /demographic (data|statistics)/i,
  /total (addressable )?market (size|population)/i,
  // Taxonomy needs
  /iab (taxonomy|category|segment)/i,
  /iab-?\d+/i,
  /google (affinity|in-market) (audience|segment|category)/i,
  /meta (interest|behavior) (targeting|segment)/i,
  /facebook (interest|behavior)/i,
  // Real-time market data
  /current (market|cpm|cpc|rate)/i,
  /latest (pricing|benchmark|data)/i,
  /real-?time (data|benchmark)/i,
  // Regulatory/compliance
  /current regulation/i,
  /latest (compliance|policy)/i,
];

/**
 * Patterns indicating proper web search attribution
 */
const PROPER_WEB_ATTRIBUTION = [
  /i (would need to|should|will) search/i,
  /let me search/i,
  /based on web search/i,
  /searching (for|the web)/i,
  /external data (needed|required|would help)/i,
  /i('ll| will) look (up|into|for)/i,
  /web (search|lookup) (shows|indicates|reveals)/i,
];

/**
 * Patterns indicating fabricated external data (red flag)
 */
const FABRICATION_PATTERNS = [
  // Census fabrication
  /census (shows|data|indicates|reports) \d/i,
  /population (is|of) \d/i,
  /according to (census|acs)/i,
  // Taxonomy fabrication without tool use
  /iab-?\d+\.\d+/i, // Specific IAB codes without search
];

/**
 * Score web search trigger detection
 *
 * Validates that agent appropriately triggers web search for external data
 * and doesn't fabricate census/taxonomy data.
 * Weight: 2% (Tier 3)
 *
 * @param output - Agent response
 * @param input - User input (for context)
 * @returns TurnScore with web search trigger assessment
 */
export function scoreWebSearchTrigger(
  output: string,
  input: string
): TurnScore {
  // Check if context indicates web search need
  const inputNeedsSearch = WEB_SEARCH_INDICATORS.some(p => p.test(input));
  const outputIndicatesSearch = WEB_SEARCH_INDICATORS.some(p => p.test(output));
  const needsWebSearch = inputNeedsSearch || outputIndicatesSearch;

  // If no web search trigger, scorer is not applicable
  if (!needsWebSearch) {
    return {
      scorer: 'web-search-trigger',
      score: 1.0,
      metadata: { status: 'not_applicable' },
      scope: 'turn',
    };
  }

  // Check for proper attribution
  const hasProperAttribution = PROPER_WEB_ATTRIBUTION.some(p => p.test(output));

  // Check for data fabrication
  const fabricatesData = FABRICATION_PATTERNS.some(p => p.test(output)) && 
                         !hasProperAttribution;

  // Check if agent acknowledges need for external data
  const acknowledgesNeed = /would need|should search|external|current data/i.test(output);

  // Scoring logic
  let score = 0;
  let status = 'needs_improvement';

  if (hasProperAttribution) {
    score = 1.0;
    status = 'proper_attribution';
  } else if (fabricatesData) {
    score = 0.0;
    status = 'fabrication_detected';
  } else if (acknowledgesNeed) {
    score = 0.7;
    status = 'acknowledges_need';
  } else {
    score = 0.5;
    status = 'implicit_handling';
  }

  return {
    scorer: 'web-search-trigger',
    score,
    metadata: {
      needsWebSearch,
      inputNeedsSearch,
      outputIndicatesSearch,
      hasProperAttribution,
      fabricatesData,
      acknowledgesNeed,
      status,
    },
    scope: 'turn',
  };
}

// =============================================================================
// KB ROUTING VALIDATION SCORER
// =============================================================================

/**
 * Intent to KB document mapping (from KB_INDEX_v6_0.txt)
 */
const INTENT_TO_DOCUMENTS: Record<string, string[]> = {
  CHANNEL_SELECTION: [
    'MPA_Expert_Lens_Channel_Mix',
    'AI_ADVERTISING_GUIDE',
    'RETAIL_MEDIA_NETWORKS',
  ],
  BUDGET_PLANNING: [
    'MPA_Expert_Lens_Budget_Allocation',
    'Analytics_Engine',
    'MPA_Implications_Budget_Decisions',
  ],
  AUDIENCE_TARGETING: [
    'MPA_Expert_Lens_Audience_Strategy',
    'MPA_Audience_Taxonomy_Structure',
    'KB_02_Audience_Targeting_Sophistication',
  ],
  MEASUREMENT_GUIDANCE: [
    'MPA_Expert_Lens_Measurement_Attribution',
    'MEASUREMENT_FRAMEWORK',
    'MPA_Implications_Measurement_Choices',
  ],
  BENCHMARK_LOOKUP: [
    'Analytics_Engine',
    'mpa_benchmark', // Dataverse table
  ],
  GAP_RESOLUTION: [
    'Gap_Detection_Playbook',
  ],
  WORKFLOW_HELP: [
    'MPA_Supporting_Instructions',
    'KB_00_Agent_Core_Operating_Standards',
  ],
  CONFIDENCE_ASSESSMENT: [
    'Confidence_Level_Framework',
    'Data_Provenance_Framework',
  ],
};

/**
 * Patterns to detect user intent
 */
const INTENT_PATTERNS: Record<string, RegExp[]> = {
  CHANNEL_SELECTION: [
    /which channel|what channel|channel (mix|allocation|selection)/i,
    /facebook|google|tiktok|programmatic|ctv/i,
    /media (mix|plan|allocation)/i,
  ],
  BUDGET_PLANNING: [
    /budget|spend|allocat/i,
    /how much (should|to) (spend|invest)/i,
    /investment level/i,
  ],
  AUDIENCE_TARGETING: [
    /audience|target|segment/i,
    /who (should|are) we (targeting|reaching)/i,
    /demographic|psychographic|behavioral/i,
  ],
  MEASUREMENT_GUIDANCE: [
    /measure|attribution|track/i,
    /kpi|metric|success/i,
    /how (will|do) we (know|measure)/i,
  ],
  BENCHMARK_LOOKUP: [
    /benchmark|typical|average|industry/i,
    /what('s| is) (normal|typical|standard)/i,
    /cpm|cpc|cac|roas/i,
  ],
};

/**
 * Detect primary intent from user input
 */
export function detectIntent(input: string): string | null {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some(p => p.test(input))) {
      return intent;
    }
  }
  return null;
}

/**
 * Score KB routing validation
 *
 * Validates that agent retrieves appropriate KB documents for detected intent.
 * This is a diagnostic scorer for RAG system validation.
 *
 * @param output - Agent response
 * @param input - User input
 * @param retrievedDocs - Documents actually retrieved (from RAG system)
 * @returns TurnScore with routing validation
 */
export function scoreKbRoutingValidation(
  output: string,
  input: string,
  retrievedDocs?: string[]
): TurnScore {
  // Detect intent from user input
  const detectedIntent = detectIntent(input);

  // If no clear intent, scorer is not applicable
  if (!detectedIntent) {
    return {
      scorer: 'kb-routing-validation',
      score: 1.0,
      metadata: { status: 'no_clear_intent' },
      scope: 'turn',
    };
  }

  // Get expected documents for this intent
  const expectedDocs = INTENT_TO_DOCUMENTS[detectedIntent] || [];

  // If no retrieved docs provided, check output for document references
  if (!retrievedDocs || retrievedDocs.length === 0) {
    // Check if output references expected document content
    const referencesExpected = expectedDocs.some(doc => {
      const docPattern = new RegExp(doc.replace(/_/g, '[ _]?'), 'i');
      return docPattern.test(output) || 
             output.toLowerCase().includes(doc.toLowerCase().replace(/_/g, ' '));
    });

    return {
      scorer: 'kb-routing-validation',
      score: referencesExpected ? 0.7 : 0.5,
      metadata: {
        detectedIntent,
        expectedDocs,
        status: referencesExpected ? 'implicit_reference' : 'no_docs_tracked',
      },
      scope: 'turn',
    };
  }

  // Calculate overlap between retrieved and expected
  const normalizeDoc = (d: string) => d.toLowerCase().replace(/[_\s]/g, '').replace(/v6_0|v60|\.txt/g, '');
  const retrievedNormalized = retrievedDocs.map(normalizeDoc);
  const expectedNormalized = expectedDocs.map(normalizeDoc);

  const matchedDocs = expectedNormalized.filter(e => 
    retrievedNormalized.some(r => r.includes(e) || e.includes(r))
  );

  const coverage = matchedDocs.length / expectedDocs.length;

  return {
    scorer: 'kb-routing-validation',
    score: coverage,
    metadata: {
      detectedIntent,
      expectedDocs,
      retrievedDocs,
      matchedDocs,
      coverage,
      status: coverage >= 0.5 ? 'good_routing' : 'needs_improvement',
    },
    scope: 'turn',
  };
}

// =============================================================================
// CONFIDENCE LEVEL SCORER
// =============================================================================

/**
 * Score confidence level attribution
 *
 * Validates that agent includes confidence levels when citing KB data.
 * v6.0 KB documents include META_CONFIDENCE tags.
 *
 * @param output - Agent response
 * @returns TurnScore with confidence level assessment
 */
export function scoreConfidenceLevelAttribution(output: string): TurnScore {
  // Check if response contains data claims
  const hasDataClaims = /\$[\d,]+|\d+%|benchmark|typical/i.test(output);

  if (!hasDataClaims) {
    return {
      scorer: 'confidence-level-attribution',
      score: 1.0,
      metadata: { status: 'no_data_claims' },
      scope: 'turn',
    };
  }

  // Check for confidence level indicators
  const confidencePatterns = [
    /\(confidence:\s*(high|medium|low)\)/i,
    /\[(high|medium|low)\s*confidence\]/i,
    /confidence:\s*(high|medium|low)/i,
    /(high|medium|low)[\s-]confidence/i,
  ];

  const hasConfidenceLevel = confidencePatterns.some(p => p.test(output));

  // Check for implicit confidence indicators
  const implicitConfidence = [
    /well-?established|proven|validated/i, // High
    /typical(ly)?|generally|usually/i, // Medium
    /estimate|approximate|rough/i, // Low
    /uncertain|variable|depends/i, // Low
  ];

  const hasImplicitConfidence = implicitConfidence.some(p => p.test(output));

  let score = 0;
  if (hasConfidenceLevel) {
    score = 1.0;
  } else if (hasImplicitConfidence) {
    score = 0.7;
  } else {
    score = 0.4;
  }

  return {
    scorer: 'confidence-level-attribution',
    score,
    metadata: {
      hasDataClaims,
      hasConfidenceLevel,
      hasImplicitConfidence,
    },
    scope: 'turn',
  };
}

// Functions are exported inline with 'export function' declarations above
