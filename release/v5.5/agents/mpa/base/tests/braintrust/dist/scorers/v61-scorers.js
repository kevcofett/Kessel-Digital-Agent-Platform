/**
 * V6.1 Specific Scorers
 *
 * New scorers for MPA v6.1 outcome-focused capabilities:
 * - automatic-benchmark-comparison: Validates proactive target comparison to KB benchmarks
 * - data-confidence: Validates source reliability indication
 * - platform-taxonomy-usage: Validates reference to Google/Meta/LinkedIn segments
 * - geography-census-usage: Validates use of DMA/census data for audience sizing
 * - behavioral-attribute-usage: Validates reference to behavioral targeting signals
 *
 * SCORER_SPECIFICATION: v3.1
 */
// =============================================================================
// AUTOMATIC BENCHMARK COMPARISON SCORER
// =============================================================================
/**
 * Patterns indicating user provided a target
 */
const TARGET_PATTERNS = [
    /\$[\d,]+k?\s*(budget|spend)/i,
    /(\d+[,\d]*)\s*(customers?|users?|leads?|downloads?|conversions?)/i,
    /target(ing)?\s*(of\s*)?\$?[\d,]+/i,
    /goal\s*(of|is)\s*\$?[\d,]+/i,
    /(\d+)%\s*(growth|increase|lift)/i,
    /acquire\s*(\d+[,\d]*)/i,
    /generate\s*(\d+[,\d]*)/i,
];
/**
 * Patterns indicating benchmark comparison was made
 */
const COMPARISON_PATTERNS = [
    /based on kb/i,
    /kb (data|benchmarks?)/i,
    /typical(ly)?\s*(range|is|runs?)/i,
    /industry\s*(average|benchmark|typical|standard)/i,
    /benchmark\s*(data|shows?|indicates?|range)/i,
    /market\s*(average|typical|data)/i,
    /compared?\s*to\s*(benchmark|industry|typical|market)/i,
];
/**
 * Patterns indicating feasibility assessment
 */
const FEASIBILITY_PATTERNS = [
    /realistic/i,
    /aggressive/i,
    /ambitious/i,
    /conservative/i,
    /achievable/i,
    /challenging/i,
    /within\s*(typical\s*)?range/i,
    /harder\s*than\s*typical/i,
    /easier\s*than\s*typical/i,
];
/**
 * Score automatic benchmark comparison
 *
 * Validates that when user provides a target, agent automatically
 * compares it to KB benchmark data without being asked.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export function scoreAutomaticBenchmarkComparison(output, input) {
    // Check if user provided a target
    const userProvidedTarget = TARGET_PATTERNS.some(p => p.test(input));
    if (!userProvidedTarget) {
        return {
            scorer: 'automatic-benchmark-comparison',
            score: 1.0,
            metadata: { status: 'no_target_provided' },
            scope: 'turn',
        };
    }
    // Check for benchmark comparison
    const hasBenchmarkComparison = COMPARISON_PATTERNS.some(p => p.test(output));
    // Check for feasibility assessment
    const hasFeasibilityAssessment = FEASIBILITY_PATTERNS.some(p => p.test(output));
    // Check for specific numbers (showing the comparison)
    const hasSpecificNumbers = /\$[\d,]+|\d+(\.\d+)?%|\d+(\.\d+)?x/i.test(output);
    // Check for calculation (agent did the math)
    const hasCalculation = /(that('s| is)|implies?|means?|equals?|works? out to)\s*\$?[\d,]+/i.test(output);
    // Scoring logic - optimized for outcomes
    let score = 0;
    let status = 'needs_improvement';
    if (hasBenchmarkComparison && hasFeasibilityAssessment && hasSpecificNumbers) {
        // Perfect: compared to benchmarks AND labeled feasibility
        score = 1.0;
        status = 'excellent';
    }
    else if (hasBenchmarkComparison && hasSpecificNumbers) {
        // Good: compared to benchmarks with numbers
        score = 0.8;
        status = 'good_missing_assessment';
    }
    else if (hasFeasibilityAssessment && hasCalculation) {
        // Acceptable: assessed feasibility with math
        score = 0.6;
        status = 'assessment_without_benchmark';
    }
    else if (hasCalculation) {
        // Minimal: did the math but no comparison
        score = 0.4;
        status = 'calculation_only';
    }
    else {
        // Failed: didn't compare or calculate
        score = 0.2;
        status = 'no_comparison';
    }
    return {
        scorer: 'automatic-benchmark-comparison',
        score,
        metadata: {
            userProvidedTarget,
            hasBenchmarkComparison,
            hasFeasibilityAssessment,
            hasSpecificNumbers,
            hasCalculation,
            status,
        },
        scope: 'turn',
    };
}
// =============================================================================
// DATA CONFIDENCE SCORER
// =============================================================================
/**
 * Patterns indicating high confidence sources
 */
const HIGH_CONFIDENCE_PATTERNS = [
    /based on (your|what you|the) (input|data|information|shared)/i,
    /you (said|mentioned|told|provided|shared)/i,
    /your (budget|target|goal|kpi)/i,
    /from your (data|input)/i,
];
/**
 * Patterns indicating KB/benchmark sources
 */
const KB_CONFIDENCE_PATTERNS = [
    /based on kb/i,
    /kb (data|benchmarks?|documents?)/i,
    /industry (benchmark|data|average)/i,
    /typical(ly)? (for|in|range)/i,
];
/**
 * Patterns indicating estimates (lower confidence)
 */
const ESTIMATE_PATTERNS = [
    /my estimate/i,
    /i (estimate|would estimate)/i,
    /estimat(e|ed|ing)/i,
    /rough(ly)?/i,
    /approximately/i,
    /ballpark/i,
];
/**
 * Patterns indicating validation recommendation
 */
const VALIDATION_PATTERNS = [
    /recommend (validating|checking|verifying)/i,
    /validate (this|with)/i,
    /check (this )?with/i,
    /verify (this )?with/i,
    /confirm (this )?with/i,
    /you (should|may want to) (validate|check|verify)/i,
];
/**
 * Score data confidence indication
 *
 * Validates that agent indicates reliability of data sources so
 * users know what to trust vs validate.
 *
 * @param output - Agent response
 * @returns TurnScore
 */
export function scoreDataConfidence(output) {
    // Check if response contains data claims
    const hasDataClaims = /\$[\d,]+|\d+(\.\d+)?%|\d+x/i.test(output);
    if (!hasDataClaims) {
        return {
            scorer: 'data-confidence',
            score: 1.0,
            metadata: { status: 'no_data_claims' },
            scope: 'turn',
        };
    }
    // Check source attribution
    const hasHighConfidence = HIGH_CONFIDENCE_PATTERNS.some(p => p.test(output));
    const hasKBConfidence = KB_CONFIDENCE_PATTERNS.some(p => p.test(output));
    const hasEstimate = ESTIMATE_PATTERNS.some(p => p.test(output));
    const hasValidationRec = VALIDATION_PATTERNS.some(p => p.test(output));
    // Any source attribution is good
    const hasAnyAttribution = hasHighConfidence || hasKBConfidence || hasEstimate;
    // Scoring logic
    let score = 0;
    let status = 'needs_improvement';
    if (hasEstimate && hasValidationRec) {
        // Best for estimates: acknowledged uncertainty AND recommended validation
        score = 1.0;
        status = 'excellent_estimate_handling';
    }
    else if (hasHighConfidence || hasKBConfidence) {
        // Good: cited reliable source
        score = 1.0;
        status = 'reliable_source_cited';
    }
    else if (hasEstimate) {
        // Acceptable: acknowledged it's an estimate
        score = 0.7;
        status = 'estimate_without_validation';
    }
    else if (hasAnyAttribution) {
        // Minimal: some attribution
        score = 0.5;
        status: 'partial_attribution';
    }
    else {
        // Failed: numbers without any source indication
        score = 0.2;
        status = 'no_attribution';
    }
    return {
        scorer: 'data-confidence',
        score,
        metadata: {
            hasDataClaims,
            hasHighConfidence,
            hasKBConfidence,
            hasEstimate,
            hasValidationRec,
            hasAnyAttribution,
            status,
        },
        scope: 'turn',
    };
}
// =============================================================================
// PLATFORM TAXONOMY USAGE SCORER
// =============================================================================
/**
 * Platform-specific targeting patterns
 */
const GOOGLE_PATTERNS = [
    /google\s*(ads?)?\s*(affinity|in-?market|custom\s*intent)/i,
    /affinity\s*(audience|segment)/i,
    /in-?market\s*(audience|segment)/i,
];
const META_PATTERNS = [
    /(meta|facebook)\s*(interest|behavior|detailed)\s*targeting/i,
    /facebook\s*(audience|interest)/i,
    /meta\s*(audience|interest)/i,
    /lookalike\s*audience/i,
];
const LINKEDIN_PATTERNS = [
    /linkedin\s*(job\s*function|seniority|industry|company\s*size)/i,
    /linkedin\s*(targeting|audience)/i,
    /matched\s*audience/i,
    /account\s*targeting/i,
];
/**
 * Generic audience targeting patterns (platform-agnostic)
 */
const GENERIC_TARGETING_PATTERNS = [
    /audience\s*targeting/i,
    /target(ing)?\s*(audience|users?|customers?)/i,
    /segment(ation)?/i,
    /demographic\s*target/i,
];
/**
 * Score platform taxonomy usage
 *
 * Validates that agent references platform-specific targeting options
 * when discussing audience strategy (Steps 3+).
 *
 * @param output - Agent response
 * @param input - User input
 * @param currentStep - Current workflow step
 * @returns TurnScore
 */
export function scorePlatformTaxonomyUsage(output, input, currentStep) {
    // Only applicable for audience/channel steps (3+)
    if (currentStep < 3) {
        return {
            scorer: 'platform-taxonomy-usage',
            score: 1.0,
            metadata: { status: 'not_applicable_early_step' },
            scope: 'turn',
        };
    }
    // Check if discussion involves audience/targeting
    const discussesTargeting = GENERIC_TARGETING_PATTERNS.some(p => p.test(input)) ||
        GENERIC_TARGETING_PATTERNS.some(p => p.test(output));
    if (!discussesTargeting) {
        return {
            scorer: 'platform-taxonomy-usage',
            score: 1.0,
            metadata: { status: 'not_applicable_no_targeting' },
            scope: 'turn',
        };
    }
    // Check for platform-specific references
    const hasGoogleRef = GOOGLE_PATTERNS.some(p => p.test(output));
    const hasMetaRef = META_PATTERNS.some(p => p.test(output));
    const hasLinkedInRef = LINKEDIN_PATTERNS.some(p => p.test(output));
    const platformCount = [hasGoogleRef, hasMetaRef, hasLinkedInRef].filter(Boolean).length;
    // Scoring logic
    let score = 0;
    let status = 'needs_improvement';
    if (platformCount >= 2) {
        // Excellent: multi-platform specificity
        score = 1.0;
        status = 'multi_platform_specific';
    }
    else if (platformCount === 1) {
        // Good: at least one platform-specific reference
        score = 0.8;
        status = 'single_platform_specific';
    }
    else {
        // Minimal: generic targeting without platform specifics
        score = 0.4;
        status = 'generic_targeting_only';
    }
    return {
        scorer: 'platform-taxonomy-usage',
        score,
        metadata: {
            currentStep,
            discussesTargeting,
            hasGoogleRef,
            hasMetaRef,
            hasLinkedInRef,
            platformCount,
            status,
        },
        scope: 'turn',
    };
}
// =============================================================================
// GEOGRAPHY CENSUS USAGE SCORER
// =============================================================================
/**
 * Patterns indicating DMA/geography discussion
 */
const GEOGRAPHY_PATTERNS = [
    /dma/i,
    /designated market area/i,
    /metro(politan)?\s*area/i,
    /market\s*(area|region)/i,
    /geographic\s*(targeting|focus|market)/i,
    /regional\s*(targeting|campaign|focus)/i,
];
/**
 * Patterns indicating census/population data usage
 */
const CENSUS_PATTERNS = [
    /census\s*(data|bureau)?/i,
    /population\s*(of|is|data)/i,
    /(\d+(\.\d+)?)\s*million\s*(people|population|households)/i,
    /households?\s*(\d+|in|of)/i,
    /demographic\s*(data|profile)/i,
    /addressable\s*(market|population|audience)/i,
];
/**
 * Patterns indicating audience sizing
 */
const SIZING_PATTERNS = [
    /audience\s*size/i,
    /market\s*size/i,
    /reach\s*(of|is|\d)/i,
    /total\s*addressable/i,
    /tam/i,
];
/**
 * Score geography/census data usage
 *
 * Validates that agent uses census/DMA data when discussing
 * geographic targeting and audience sizing.
 *
 * @param output - Agent response
 * @param input - User input
 * @param currentStep - Current workflow step
 * @returns TurnScore
 */
export function scoreGeographyCensusUsage(output, input, currentStep) {
    // Only applicable for geography step (4) or later
    if (currentStep < 4) {
        return {
            scorer: 'geography-census-usage',
            score: 1.0,
            metadata: { status: 'not_applicable_early_step' },
            scope: 'turn',
        };
    }
    // Check if discussion involves geography
    const discussesGeography = GEOGRAPHY_PATTERNS.some(p => p.test(input)) ||
        GEOGRAPHY_PATTERNS.some(p => p.test(output));
    if (!discussesGeography) {
        return {
            scorer: 'geography-census-usage',
            score: 1.0,
            metadata: { status: 'not_applicable_no_geography' },
            scope: 'turn',
        };
    }
    // Check for census data usage
    const hasCensusData = CENSUS_PATTERNS.some(p => p.test(output));
    const hasSizingData = SIZING_PATTERNS.some(p => p.test(output));
    const hasSpecificNumbers = /(\d+(\.\d+)?)\s*(million|M|k|K|thousand)/i.test(output);
    // Scoring logic
    let score = 0;
    let status = 'needs_improvement';
    if (hasCensusData && hasSpecificNumbers) {
        // Excellent: census data with specific numbers
        score = 1.0;
        status = 'census_with_numbers';
    }
    else if (hasSizingData && hasSpecificNumbers) {
        // Good: sizing with numbers
        score = 0.8;
        status = 'sizing_with_numbers';
    }
    else if (hasCensusData || hasSizingData) {
        // Acceptable: mentioned but no specifics
        score = 0.5;
        status = 'mentioned_no_specifics';
    }
    else {
        // Failed: geography discussion without data
        score = 0.3;
        status = 'geography_no_data';
    }
    return {
        scorer: 'geography-census-usage',
        score,
        metadata: {
            currentStep,
            discussesGeography,
            hasCensusData,
            hasSizingData,
            hasSpecificNumbers,
            status,
        },
        scope: 'turn',
    };
}
// =============================================================================
// BEHAVIORAL ATTRIBUTE USAGE SCORER
// =============================================================================
/**
 * Behavioral targeting signal patterns
 */
const BEHAVIORAL_PATTERNS = [
    /behavioral\s*(data|targeting|signal)/i,
    /purchase\s*(history|behavior|intent)/i,
    /browsing\s*(behavior|history|pattern)/i,
    /search\s*(behavior|history|intent)/i,
    /engagement\s*(pattern|signal|data)/i,
    /intent\s*(signal|data|indicator)/i,
    /recency\s*(of\s*)?(purchase|visit|engagement)/i,
    /frequency\s*(of\s*)?(purchase|visit|engagement)/i,
    /lifecycle\s*(stage|phase)/i,
    /customer\s*journey/i,
];
/**
 * Contextual targeting signal patterns
 */
const CONTEXTUAL_PATTERNS = [
    /contextual\s*(targeting|signal|placement)/i,
    /content\s*(category|context|adjacency)/i,
    /iab\s*(category|taxonomy|code)/i,
    /brand\s*safety/i,
    /viewability/i,
    /content\s*environment/i,
];
/**
 * Score behavioral/contextual attribute usage
 *
 * Validates that agent references behavioral and contextual
 * targeting attributes when building audience strategy.
 *
 * @param output - Agent response
 * @param input - User input
 * @param currentStep - Current workflow step
 * @returns TurnScore
 */
export function scoreBehavioralContextualUsage(output, input, currentStep) {
    // Only applicable for audience step (3) or later
    if (currentStep < 3) {
        return {
            scorer: 'behavioral-contextual-usage',
            score: 1.0,
            metadata: { status: 'not_applicable_early_step' },
            scope: 'turn',
        };
    }
    // Check if discussion involves audience targeting
    const discussesAudience = /audience|targeting|segment/i.test(input) ||
        /audience|targeting|segment/i.test(output);
    if (!discussesAudience) {
        return {
            scorer: 'behavioral-contextual-usage',
            score: 1.0,
            metadata: { status: 'not_applicable_no_audience' },
            scope: 'turn',
        };
    }
    // Check for behavioral/contextual references
    const hasBehavioral = BEHAVIORAL_PATTERNS.some(p => p.test(output));
    const hasContextual = CONTEXTUAL_PATTERNS.some(p => p.test(output));
    // Scoring logic
    let score = 0;
    let status = 'needs_improvement';
    if (hasBehavioral && hasContextual) {
        // Excellent: both behavioral and contextual
        score = 1.0;
        status = 'comprehensive_targeting';
    }
    else if (hasBehavioral || hasContextual) {
        // Good: at least one dimension
        score = 0.7;
        status = 'partial_targeting';
    }
    else {
        // Minimal: audience discussion without signals
        score = 0.4;
        status = 'no_targeting_signals';
    }
    return {
        scorer: 'behavioral-contextual-usage',
        score,
        metadata: {
            currentStep,
            discussesAudience,
            hasBehavioral,
            hasContextual,
            status,
        },
        scope: 'turn',
    };
}
// =============================================================================
// EXPORTS
// =============================================================================
export const v61Scorers = {
    scoreAutomaticBenchmarkComparison,
    scoreDataConfidence,
    scorePlatformTaxonomyUsage,
    scoreGeographyCensusUsage,
    scoreBehavioralContextualUsage,
};
export default v61Scorers;
//# sourceMappingURL=v61-scorers.js.map