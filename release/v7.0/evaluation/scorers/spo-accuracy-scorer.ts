/**
 * SPO Accuracy Scorer
 *
 * Evaluates Supply Path Optimization agent responses for accuracy,
 * completeness, and actionability of recommendations.
 *
 * @module spo-accuracy-scorer
 * @version 1.0.0
 */

import { Scorer } from "braintrust";

interface SPOScorerInput {
  output: string;
  expected?: {
    should_mention_nbi?: boolean;
    should_mention_fees?: boolean;
    should_mention_quality?: boolean;
    should_provide_recommendation?: boolean;
    expected_recommendation?: string;
  };
}

/**
 * SPO Accuracy Scorer
 *
 * Evaluates SPO responses across 5 dimensions:
 * 1. NBI/Net Benefit Index mentioned
 * 2. Fee breakdown provided
 * 3. Quality considerations addressed
 * 4. Clear recommendation provided
 * 5. Confidence level disclosed
 */
export const spoAccuracyScorer: Scorer<string, { expected: SPOScorerInput["expected"] }> = {
  name: "spo-accuracy",
  scorer: async ({ output, expected }) => {
    let score = 0;
    const maxScore = 5;
    const details: Record<string, boolean> = {};

    // 1. Check NBI calculation mentioned (20%)
    const nbiPatterns = [
      /NBI/i,
      /net benefit/i,
      /benefit index/i,
      /fee savings/i,
      /working media/i,
    ];
    details.nbi_mentioned = nbiPatterns.some((p) => p.test(output));
    if (details.nbi_mentioned) score += 1;

    // 2. Check fee breakdown provided (20%)
    const feePatterns = [
      /fee/i,
      /DSP/i,
      /SSP/i,
      /tech tax/i,
      /intermediar/i,
      /\d+%\s*(fee|take|margin)/i,
    ];
    details.fees_mentioned = feePatterns.some((p) => p.test(output));
    if (details.fees_mentioned) score += 1;

    // 3. Check quality considerations (20%)
    const qualityPatterns = [
      /quality/i,
      /MFA|made for advertising/i,
      /brand safety/i,
      /viewability/i,
      /fraud/i,
      /inventory/i,
    ];
    details.quality_considered = qualityPatterns.some((p) => p.test(output));
    if (details.quality_considered) score += 1;

    // 4. Check recommendation provided (20%)
    const recommendationPatterns = [
      /recommend/i,
      /suggest/i,
      /should/i,
      /optimize/i,
      /maintain/i,
      /proceed/i,
      /not recommended/i,
    ];
    details.recommendation_provided = recommendationPatterns.some((p) =>
      p.test(output)
    );
    if (details.recommendation_provided) score += 1;

    // 5. Check confidence disclosed (20%)
    const confidencePatterns = [
      /confidence/i,
      /HIGH|MEDIUM|LOW/,
      /certainty/i,
      /\d+%\s*(confidence|certain)/i,
    ];
    details.confidence_disclosed = confidencePatterns.some((p) =>
      p.test(output)
    );
    if (details.confidence_disclosed) score += 1;

    // Bonus: Check for specific expected content
    let bonusScore = 0;
    if (expected) {
      if (expected.expected_recommendation) {
        const recMatch = new RegExp(expected.expected_recommendation, "i");
        if (recMatch.test(output)) {
          bonusScore += 0.5;
        }
      }
    }

    const finalScore = Math.min((score + bonusScore) / maxScore, 1);

    return {
      name: "spo-accuracy",
      score: finalScore,
      metadata: {
        rawScore: score,
        bonusScore,
        maxScore,
        details,
        scoreBreakdown: {
          nbi: details.nbi_mentioned ? 1 : 0,
          fees: details.fees_mentioned ? 1 : 0,
          quality: details.quality_considered ? 1 : 0,
          recommendation: details.recommendation_provided ? 1 : 0,
          confidence: details.confidence_disclosed ? 1 : 0,
        },
      },
    };
  },
};

/**
 * SPO Fee Analysis Scorer
 *
 * Specifically evaluates fee breakdown accuracy and completeness.
 */
export const spoFeeAnalysisScorer: Scorer<string, { expected: any }> = {
  name: "spo-fee-analysis",
  scorer: async ({ output, expected }) => {
    let score = 0;
    const maxScore = 4;
    const details: Record<string, boolean> = {};

    // Check for DSP fees mentioned
    details.dsp_fees = /DSP|demand.side/i.test(output);
    if (details.dsp_fees) score += 1;

    // Check for SSP fees mentioned
    details.ssp_fees = /SSP|supply.side|publisher/i.test(output);
    if (details.ssp_fees) score += 1;

    // Check for data/verification fees
    details.other_fees = /data fee|verification|IVT|viewability fee/i.test(
      output
    );
    if (details.other_fees) score += 1;

    // Check for working media ratio
    details.working_media = /working media|\d+%\s*(to publisher|reaches)/i.test(
      output
    );
    if (details.working_media) score += 1;

    return {
      name: "spo-fee-analysis",
      score: score / maxScore,
      metadata: {
        rawScore: score,
        maxScore,
        details,
      },
    };
  },
};

/**
 * SPO Partner Evaluation Scorer
 *
 * Evaluates partner evaluation responses.
 */
export const spoPartnerEvaluationScorer: Scorer<string, { expected: any }> = {
  name: "spo-partner-evaluation",
  scorer: async ({ output, expected }) => {
    let score = 0;
    const maxScore = 4;
    const details: Record<string, boolean> = {};

    // Check for tier/rating
    details.tier_assigned = /tier|rating|score|excellent|good|adequate/i.test(
      output
    );
    if (details.tier_assigned) score += 1;

    // Check for criteria evaluation
    details.criteria_evaluated =
      /transparency|quality|safety|fraud|support/i.test(output);
    if (details.criteria_evaluated) score += 1;

    // Check for actionable recommendation
    details.action_recommended =
      /primary|secondary|consolidate|alternative|replace/i.test(output);
    if (details.action_recommended) score += 1;

    // Check for weighted scoring
    details.weighted_scoring = /weight|score|evaluation|criteria/i.test(output);
    if (details.weighted_scoring) score += 1;

    return {
      name: "spo-partner-evaluation",
      score: score / maxScore,
      metadata: {
        rawScore: score,
        maxScore,
        details,
      },
    };
  },
};

export default spoAccuracyScorer;
