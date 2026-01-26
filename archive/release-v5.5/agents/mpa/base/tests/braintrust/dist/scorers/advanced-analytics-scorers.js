/**
 * Advanced Analytics Scorers
 *
 * Scoring functions for validating agent's analytical capabilities:
 * - RFM calculation and scoring methodology
 * - Propensity model explanations
 * - Decile analysis and investment cutoff recommendations
 * - Lookalike audience quality
 * - Name flow (customer journey) mapping
 */
// ============================================================================
// RFM Calculation Scorers
// ============================================================================
/**
 * Scores whether agent shows actual RFM calculation methodology
 */
export function scoreRfmCalculationMethodology(response) {
    let score = 0;
    const criteria = [];
    // Check for Recency explanation/calculation
    const recencyPatterns = [
        /recency.*days?\s*since/i,
        /last\s+purchase.*days/i,
        /days?\s*since\s*(last|most\s+recent)/i,
        /recency\s*[=:]\s*\d+/i,
        /most\s+recent.*transaction/i,
    ];
    if (recencyPatterns.some((p) => p.test(response))) {
        score += 0.2;
        criteria.push("recency_calculation");
    }
    // Check for Frequency explanation/calculation
    const frequencyPatterns = [
        /frequency.*purchase.*count/i,
        /number\s+of\s+(order|purchase|transaction)/i,
        /transaction\s*count/i,
        /frequency\s*[=:]\s*\d+/i,
        /how\s+(often|many\s+times)/i,
    ];
    if (frequencyPatterns.some((p) => p.test(response))) {
        score += 0.2;
        criteria.push("frequency_calculation");
    }
    // Check for Monetary explanation/calculation
    const monetaryPatterns = [
        /monetary.*total.*spend/i,
        /total\s+(revenue|spend|purchase)/i,
        /average\s+order\s+value/i,
        /monetary\s*[=:]\s*\$?\d+/i,
        /aov/i,
        /customer.*lifetime.*value/i,
    ];
    if (monetaryPatterns.some((p) => p.test(response))) {
        score += 0.2;
        criteria.push("monetary_calculation");
    }
    // Check for scoring methodology (quintiles, percentiles, etc.)
    const scoringPatterns = [
        /quintile/i,
        /percentile/i,
        /score.*1\s*(-|to)\s*5/i,
        /5.*point.*scale/i,
        /rank.*customer/i,
        /segment.*based.*on.*score/i,
    ];
    if (scoringPatterns.some((p) => p.test(response))) {
        score += 0.2;
        criteria.push("scoring_methodology");
    }
    // Check for segment naming convention
    const segmentNamingPatterns = [
        /rfm.*score.*\d{3}/i, // e.g., RFM score 555
        /champion.*loyal.*at.?risk/i,
        /high.*value.*low.*value/i,
        /segment.*\d+.*customer/i,
    ];
    if (segmentNamingPatterns.some((p) => p.test(response))) {
        score += 0.2;
        criteria.push("segment_naming");
    }
    return {
        scorer: "rfm_calculation_methodology",
        score,
        metadata: {
            criteriaMet: criteria,
            totalCriteria: 5,
            reason: `RFM calculation methodology: ${criteria.length}/5 components shown`,
        },
        scope: "turn",
    };
}
/**
 * Scores whether agent shows specific RFM segment sizes and values
 */
export function scoreRfmSegmentQuantification(response) {
    let score = 0;
    const quantifications = [];
    // Check for customer counts per segment
    const customerCountPattern = /(\d+[,\d]*)\s*(customer|member|record)/gi;
    const customerCounts = response.match(customerCountPattern);
    if (customerCounts && customerCounts.length >= 2) {
        score += 0.25;
        quantifications.push(`customer_counts: ${customerCounts.length} segments`);
    }
    // Check for revenue/value per segment
    const revenuePattern = /\$[\d,]+\.?\d*\s*(k|m|million|thousand)?/gi;
    const revenueValues = response.match(revenuePattern);
    if (revenueValues && revenueValues.length >= 2) {
        score += 0.25;
        quantifications.push(`revenue_values: ${revenueValues.length} shown`);
    }
    // Check for percentage breakdowns
    const percentPattern = /\d+\.?\d*%/g;
    const percentages = response.match(percentPattern);
    if (percentages && percentages.length >= 3) {
        score += 0.25;
        quantifications.push(`percentage_breakdowns: ${percentages.length} shown`);
    }
    // Check for segment size distribution (e.g., "20% of customers = 80% of revenue")
    if (/\d+%.*customer.*\d+%.*revenue/i.test(response) ||
        /pareto/i.test(response) ||
        /80.?20/i.test(response)) {
        score += 0.25;
        quantifications.push("concentration_analysis");
    }
    return {
        scorer: "rfm_segment_quantification",
        score,
        metadata: {
            quantifications,
            reason: `Segment quantification quality: ${quantifications.length}/4 criteria`,
        },
        scope: "turn",
    };
}
// ============================================================================
// Propensity Model Scorers
// ============================================================================
/**
 * Scores whether agent explains propensity model concepts
 */
export function scorePropensityModelExplanation(response) {
    let score = 0;
    const concepts = [];
    // Check for propensity definition
    const propensityDefPatterns = [
        /propensity.*likelihood/i,
        /probability.*purchase/i,
        /likelihood.*convert/i,
        /predict.*behavior/i,
        /score.*probability/i,
    ];
    if (propensityDefPatterns.some((p) => p.test(response))) {
        score += 0.2;
        concepts.push("propensity_definition");
    }
    // Check for input signals mentioned
    const signalPatterns = [
        /purchase.*history/i,
        /behavioral.*signal/i,
        /engagement.*pattern/i,
        /browse.*behavio/i,
        /email.*open.*click/i,
        /website.*activity/i,
    ];
    if (signalPatterns.some((p) => p.test(response))) {
        score += 0.2;
        concepts.push("input_signals");
    }
    // Check for model types mentioned
    const modelTypePatterns = [
        /logistic.*regression/i,
        /random.*forest/i,
        /xgboost/i,
        /machine.*learning/i,
        /bg.?nbd/i,
        /clv.*model/i,
        /predictive.*model/i,
    ];
    if (modelTypePatterns.some((p) => p.test(response))) {
        score += 0.2;
        concepts.push("model_type");
    }
    // Check for score interpretation
    const interpretationPatterns = [
        /score.*0.*1/i,
        /high.*score.*likely/i,
        /low.*score.*unlikely/i,
        /threshold/i,
        /cutoff.*score/i,
    ];
    if (interpretationPatterns.some((p) => p.test(response))) {
        score += 0.2;
        concepts.push("score_interpretation");
    }
    // Check for actionability
    const actionPatterns = [
        /target.*high.*propensity/i,
        /focus.*likely.*convert/i,
        /prioritize.*score/i,
        /suppress.*low.*propensity/i,
        /segment.*by.*propensity/i,
    ];
    if (actionPatterns.some((p) => p.test(response))) {
        score += 0.2;
        concepts.push("actionability");
    }
    return {
        scorer: "propensity_model_explanation",
        score,
        metadata: {
            conceptsCovered: concepts,
            reason: `Propensity model explanation: ${concepts.length}/5 concepts`,
        },
        scope: "turn",
    };
}
/**
 * Scores propensity-to-action mapping quality
 */
export function scorePropensityActionMapping(response) {
    let score = 0;
    const mappings = [];
    // High propensity actions
    if (/high.*propensity.*(?:premium|personalized|immediate|priority)/i.test(response)) {
        score += 0.25;
        mappings.push("high_propensity_premium_treatment");
    }
    // Medium propensity actions
    if (/medium.*propensity.*(?:nurture|retarget|reminder)/i.test(response) ||
        /mid.*tier.*(?:engagement|campaign)/i.test(response)) {
        score += 0.25;
        mappings.push("medium_propensity_nurture");
    }
    // Low propensity actions
    if (/low.*propensity.*(?:suppress|exclude|minimal)/i.test(response) ||
        /not.*worth.*invest/i.test(response)) {
        score += 0.25;
        mappings.push("low_propensity_suppress");
    }
    // Investment justification
    if (/roi.*propensity/i.test(response) ||
        /cost.*per.*acquisition.*varies/i.test(response) ||
        /efficiency.*by.*score/i.test(response)) {
        score += 0.25;
        mappings.push("investment_justification");
    }
    return {
        scorer: "propensity_action_mapping",
        score,
        metadata: {
            mappings,
            reason: `Propensity-to-action mapping: ${mappings.length}/4 tiers`,
        },
        scope: "turn",
    };
}
// ============================================================================
// Decile Analysis Scorers
// ============================================================================
/**
 * Scores whether agent explains decile-based segmentation
 */
export function scoreDecileAnalysisExplanation(response) {
    let score = 0;
    const elements = [];
    // Check for decile/percentile explanation
    if (/decile/i.test(response) || /10.*equal.*group/i.test(response)) {
        score += 0.2;
        elements.push("decile_definition");
    }
    // Check for ranking methodology
    if (/rank.*by.*(?:value|revenue|score)/i.test(response) ||
        /order.*customer.*by/i.test(response) ||
        /sort.*by/i.test(response)) {
        score += 0.15;
        elements.push("ranking_methodology");
    }
    // Check for cumulative analysis
    if (/cumulative/i.test(response) ||
        /top.*\d+%.*account.*for/i.test(response) ||
        /first.*decile.*represent/i.test(response)) {
        score += 0.2;
        elements.push("cumulative_analysis");
    }
    // Check for lift/index calculation
    if (/lift/i.test(response) ||
        /index/i.test(response) ||
        /\d+x.*average/i.test(response) ||
        /over.*under.*index/i.test(response)) {
        score += 0.2;
        elements.push("lift_index");
    }
    // Check for investment cutoff discussion
    if (/cutoff/i.test(response) ||
        /break.*even/i.test(response) ||
        /diminishing.*return/i.test(response) ||
        /stop.*invest.*at/i.test(response)) {
        score += 0.25;
        elements.push("investment_cutoff");
    }
    return {
        scorer: "decile_analysis_explanation",
        score,
        metadata: {
            elementsCovered: elements,
            reason: `Decile analysis: ${elements.length}/5 elements`,
        },
        scope: "turn",
    };
}
/**
 * Scores investment cutoff recommendation quality
 */
export function scoreInvestmentCutoffRecommendation(response) {
    let score = 0;
    const components = [];
    // Check for specific cutoff point
    if (/(?:top|first)\s+\d+(?:\s*%|th?\s+decile)/i.test(response) ||
        /decile\s+\d+\s+through\s+\d+/i.test(response) ||
        /cutoff\s+at\s+(?:decile)?\s*\d+/i.test(response)) {
        score += 0.25;
        components.push("specific_cutoff");
    }
    // Check for ROI/efficiency justification
    if (/roi.*decile/i.test(response) ||
        /cpa.*higher.*than/i.test(response) ||
        /cost.*exceed.*value/i.test(response) ||
        /margin.*negative/i.test(response)) {
        score += 0.25;
        components.push("roi_justification");
    }
    // Check for reach vs efficiency tradeoff
    if (/reach.*vs.*efficiency/i.test(response) ||
        /volume.*vs.*roi/i.test(response) ||
        /trade.*off.*between/i.test(response) ||
        /narrow.*improve.*efficiency/i.test(response)) {
        score += 0.25;
        components.push("tradeoff_discussion");
    }
    // Check for scenario comparison
    if (/if.*include.*decile.*\d+/i.test(response) ||
        /scenario.*a.*vs.*b/i.test(response) ||
        /compare.*option/i.test(response) ||
        /alternative.*approach/i.test(response)) {
        score += 0.25;
        components.push("scenario_comparison");
    }
    return {
        scorer: "investment_cutoff_recommendation",
        score,
        metadata: {
            components,
            reason: `Investment cutoff quality: ${components.length}/4 components`,
        },
        scope: "turn",
    };
}
// ============================================================================
// Lookalike Audience Scorers
// ============================================================================
/**
 * Scores lookalike seed audience quality discussion
 */
export function scoreLookalikeSeedQuality(response) {
    let score = 0;
    const criteria = [];
    // Check for seed size recommendation
    if (/minimum.*\d+.*(?:customer|record|seed)/i.test(response) ||
        /seed.*size.*\d+/i.test(response) ||
        /at.*least.*\d+.*match/i.test(response) ||
        /\d+.*to.*\d+.*ideal/i.test(response)) {
        score += 0.2;
        criteria.push("seed_size_guidance");
    }
    // Check for seed quality discussion
    if (/seed.*quality/i.test(response) ||
        /best.*customer.*as.*seed/i.test(response) ||
        /high.*value.*seed/i.test(response) ||
        /champion.*seed/i.test(response)) {
        score += 0.2;
        criteria.push("seed_quality_discussion");
    }
    // Check for recency consideration
    if (/recent.*customer.*seed/i.test(response) ||
        /active.*within.*month/i.test(response) ||
        /fresh.*data/i.test(response) ||
        /outdated.*seed/i.test(response)) {
        score += 0.2;
        criteria.push("recency_consideration");
    }
    // Check for match rate discussion
    if (/match.*rate/i.test(response) ||
        /\d+%.*match/i.test(response) ||
        /hashed.*email/i.test(response) ||
        /phone.*number.*match/i.test(response)) {
        score += 0.2;
        criteria.push("match_rate");
    }
    // Check for platform-specific seed requirements
    if (/meta.*\d+.*minimum/i.test(response) ||
        /google.*customer.*match/i.test(response) ||
        /linkedin.*\d+.*contacts/i.test(response) ||
        /platform.*specific.*requirement/i.test(response)) {
        score += 0.2;
        criteria.push("platform_requirements");
    }
    return {
        scorer: "lookalike_seed_quality",
        score,
        metadata: {
            criteria,
            reason: `Seed quality discussion: ${criteria.length}/5 criteria`,
        },
        scope: "turn",
    };
}
/**
 * Scores lookalike expansion strategy
 */
export function scoreLookalikeExpansionStrategy(response) {
    let score = 0;
    const elements = [];
    // Check for expansion percentage discussion
    if (/1%.*lookalike/i.test(response) ||
        /\d+%.*expansion/i.test(response) ||
        /narrow.*vs.*broad/i.test(response) ||
        /similarity.*score/i.test(response)) {
        score += 0.25;
        elements.push("expansion_percentage");
    }
    // Check for performance expectation
    if (/lookalike.*perform/i.test(response) ||
        /expect.*\d+x.*seed/i.test(response) ||
        /similar.*conversion/i.test(response) ||
        /lookalike.*cpa/i.test(response)) {
        score += 0.25;
        elements.push("performance_expectation");
    }
    // Check for testing approach
    if (/test.*lookalike/i.test(response) ||
        /a.*b.*test.*audience/i.test(response) ||
        /start.*narrow.*expand/i.test(response) ||
        /validate.*performance/i.test(response)) {
        score += 0.25;
        elements.push("testing_approach");
    }
    // Check for refresh/decay consideration
    if (/refresh.*lookalike/i.test(response) ||
        /update.*seed/i.test(response) ||
        /audience.*decay/i.test(response) ||
        /quarterly.*update/i.test(response)) {
        score += 0.25;
        elements.push("refresh_consideration");
    }
    return {
        scorer: "lookalike_expansion_strategy",
        score,
        metadata: {
            elements,
            reason: `Expansion strategy quality: ${elements.length}/4 elements`,
        },
        scope: "turn",
    };
}
// ============================================================================
// Name Flow (Customer Journey) Scorers
// ============================================================================
/**
 * Scores customer journey/name flow mapping quality
 */
export function scoreNameFlowMapping(response) {
    let score = 0;
    const stages = [];
    // Check for acquisition stage
    if (/prospect.*customer/i.test(response) ||
        /acquisition.*stage/i.test(response) ||
        /first.*purchase/i.test(response) ||
        /new.*customer.*acquisition/i.test(response)) {
        score += 0.15;
        stages.push("acquisition");
    }
    // Check for activation/onboarding stage
    if (/activation/i.test(response) ||
        /onboard/i.test(response) ||
        /first.*\d+.*days/i.test(response) ||
        /early.*engagement/i.test(response)) {
        score += 0.15;
        stages.push("activation");
    }
    // Check for retention stage
    if (/retention/i.test(response) ||
        /repeat.*purchase/i.test(response) ||
        /loyal.*customer/i.test(response) ||
        /maintain.*engagement/i.test(response)) {
        score += 0.15;
        stages.push("retention");
    }
    // Check for reactivation stage
    if (/reactivat/i.test(response) ||
        /win.*back/i.test(response) ||
        /lapsed.*customer/i.test(response) ||
        /dormant.*re.*engage/i.test(response)) {
        score += 0.15;
        stages.push("reactivation");
    }
    // Check for stage-specific messaging/offers
    if (/message.*by.*stage/i.test(response) ||
        /offer.*based.*on.*lifecycle/i.test(response) ||
        /different.*treatment.*per.*stage/i.test(response)) {
        score += 0.2;
        stages.push("stage_specific_treatment");
    }
    // Check for flow metrics
    if (/conversion.*between.*stage/i.test(response) ||
        /drop.*off.*rate/i.test(response) ||
        /flow.*rate/i.test(response) ||
        /time.*between.*stage/i.test(response)) {
        score += 0.2;
        stages.push("flow_metrics");
    }
    return {
        scorer: "name_flow_mapping",
        score,
        metadata: {
            stagesCovered: stages,
            reason: `Name flow mapping: ${stages.length}/6 stages/elements`,
        },
        scope: "turn",
    };
}
// ============================================================================
// Media Plan Calculation Scorers
// ============================================================================
/**
 * Scores whether agent shows profitability-based media planning
 */
export function scoreProfitabilityBasedPlanning(response) {
    let score = 0;
    const components = [];
    // Check for segment-level profitability
    if (/segment.*profit/i.test(response) ||
        /clv.*segment/i.test(response) ||
        /value.*per.*segment/i.test(response) ||
        /margin.*by.*audience/i.test(response)) {
        score += 0.2;
        components.push("segment_profitability");
    }
    // Check for allowable CPA by segment
    if (/allowable.*cpa/i.test(response) ||
        /max.*cpa.*\$?\d+/i.test(response) ||
        /target.*cpa.*by.*segment/i.test(response) ||
        /break.*even.*cpa/i.test(response)) {
        score += 0.2;
        components.push("allowable_cpa");
    }
    // Check for budget allocation rationale
    if (/allocat.*budget.*based.*on.*(?:value|profit|ltv)/i.test(response) ||
        /invest.*more.*in.*high.*value/i.test(response) ||
        /weighted.*by.*(?:ltv|clv|value)/i.test(response)) {
        score += 0.2;
        components.push("budget_rationale");
    }
    // Check for expected return calculation
    if (/expected.*return/i.test(response) ||
        /projected.*revenue/i.test(response) ||
        /roi.*calculation/i.test(response) ||
        /\$?\d+.*return.*\$?\d+.*invest/i.test(response)) {
        score += 0.2;
        components.push("expected_return");
    }
    // Check for channel efficiency by segment
    if (/channel.*efficiency.*segment/i.test(response) ||
        /cpa.*varies.*by.*channel/i.test(response) ||
        /affinity.*inform.*channel/i.test(response)) {
        score += 0.2;
        components.push("channel_efficiency");
    }
    return {
        scorer: "profitability_based_planning",
        score,
        metadata: {
            components,
            reason: `Profitability-based planning: ${components.length}/5 components`,
        },
        scope: "turn",
    };
}
// ============================================================================
// Composite Advanced Analytics Scorer
// ============================================================================
/**
 * Comprehensive scorer for all advanced analytics capabilities
 */
export function scoreAdvancedAnalytics(response) {
    const scores = [];
    // RFM Analysis
    scores.push(scoreRfmCalculationMethodology(response));
    scores.push(scoreRfmSegmentQuantification(response));
    // Propensity Models
    scores.push(scorePropensityModelExplanation(response));
    scores.push(scorePropensityActionMapping(response));
    // Decile Analysis
    scores.push(scoreDecileAnalysisExplanation(response));
    scores.push(scoreInvestmentCutoffRecommendation(response));
    // Lookalike Audiences
    scores.push(scoreLookalikeSeedQuality(response));
    scores.push(scoreLookalikeExpansionStrategy(response));
    // Name Flow
    scores.push(scoreNameFlowMapping(response));
    // Profitability Planning
    scores.push(scoreProfitabilityBasedPlanning(response));
    // Calculate average
    const avgScore = scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length;
    return {
        scorer: "advanced_analytics_composite",
        score: avgScore,
        metadata: {
            componentScores: scores.map((s) => ({
                name: s.scorer,
                score: s.score,
                details: s.metadata,
            })),
            totalComponents: scores.length,
            reason: `Advanced analytics composite: ${(avgScore * 100).toFixed(1)}%`,
        },
        scope: "conversation",
    };
}
// ============================================================================
// Exports
// ============================================================================
export const ADVANCED_ANALYTICS_SCORERS = {
    // RFM
    scoreRfmCalculationMethodology,
    scoreRfmSegmentQuantification,
    // Propensity
    scorePropensityModelExplanation,
    scorePropensityActionMapping,
    // Decile
    scoreDecileAnalysisExplanation,
    scoreInvestmentCutoffRecommendation,
    // Lookalike
    scoreLookalikeSeedQuality,
    scoreLookalikeExpansionStrategy,
    // Name Flow
    scoreNameFlowMapping,
    // Profitability
    scoreProfitabilityBasedPlanning,
    // Composite
    scoreAdvancedAnalytics,
};
export default ADVANCED_ANALYTICS_SCORERS;
//# sourceMappingURL=advanced-analytics-scorers.js.map