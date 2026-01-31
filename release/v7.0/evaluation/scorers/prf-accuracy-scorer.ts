/**
 * PRF Accuracy Scorer
 *
 * Evaluates Performance Intelligence agent responses for accuracy,
 * actionability, and analytical depth.
 *
 * @module prf-accuracy-scorer
 * @version 1.0.0
 */

import { Scorer } from "braintrust";

interface PRFScorerInput {
  output: string;
  expected?: {
    should_identify_severity?: boolean;
    should_provide_action?: boolean;
    should_mention_trend?: boolean;
    expected_severity?: string;
    expected_action?: string;
  };
}

/**
 * PRF Accuracy Scorer
 *
 * Evaluates PRF responses across 5 dimensions:
 * 1. Variance analysis provided
 * 2. Severity assessment given
 * 3. Recommendation provided
 * 4. Trend identified
 * 5. Root cause/learning mentioned
 */
export const prfAccuracyScorer: Scorer<string, { expected: PRFScorerInput["expected"] }> = {
  name: "prf-accuracy",
  scorer: async ({ output, expected }) => {
    let score = 0;
    const maxScore = 5;
    const details: Record<string, boolean> = {};

    // 1. Check variance analysis (20%)
    const variancePatterns = [
      /variance/i,
      /percent/i,
      /target/i,
      /actual/i,
      /\d+%/,
      /above|below|over|under/i,
    ];
    details.variance_analyzed = variancePatterns.some((p) => p.test(output));
    if (details.variance_analyzed) score += 1;

    // 2. Check severity assessment (20%)
    const severityPatterns = [
      /GREEN|YELLOW|ORANGE|RED/,
      /severity/i,
      /critical/i,
      /warning/i,
      /healthy/i,
      /concerning/i,
    ];
    details.severity_assessed = severityPatterns.some((p) => p.test(output));
    if (details.severity_assessed) score += 1;

    // 3. Check recommendation provided (20%)
    const recommendationPatterns = [
      /recommend/i,
      /action/i,
      /monitor/i,
      /investigate/i,
      /adjust/i,
      /optimize/i,
      /continue/i,
      /immediate/i,
    ];
    details.recommendation_provided = recommendationPatterns.some((p) =>
      p.test(output)
    );
    if (details.recommendation_provided) score += 1;

    // 4. Check trend identified (20%)
    const trendPatterns = [
      /trend/i,
      /improving/i,
      /declining/i,
      /stable/i,
      /increasing/i,
      /decreasing/i,
      /week.over.week|month.over.month/i,
    ];
    details.trend_identified = trendPatterns.some((p) => p.test(output));
    if (details.trend_identified) score += 1;

    // 5. Check root cause or learning (20%)
    const insightPatterns = [
      /cause/i,
      /learning/i,
      /insight/i,
      /why/i,
      /because/i,
      /due to/i,
      /driver/i,
      /factor/i,
    ];
    details.insight_provided = insightPatterns.some((p) => p.test(output));
    if (details.insight_provided) score += 1;

    // Bonus: Check for expected severity match
    let bonusScore = 0;
    if (expected?.expected_severity) {
      const severityMatch = new RegExp(expected.expected_severity, "i");
      if (severityMatch.test(output)) {
        bonusScore += 0.5;
      }
    }

    const finalScore = Math.min((score + bonusScore) / maxScore, 1);

    return {
      name: "prf-accuracy",
      score: finalScore,
      metadata: {
        rawScore: score,
        bonusScore,
        maxScore,
        details,
        scoreBreakdown: {
          variance: details.variance_analyzed ? 1 : 0,
          severity: details.severity_assessed ? 1 : 0,
          recommendation: details.recommendation_provided ? 1 : 0,
          trend: details.trend_identified ? 1 : 0,
          insight: details.insight_provided ? 1 : 0,
        },
      },
    };
  },
};

/**
 * PRF Anomaly Detection Scorer
 *
 * Evaluates anomaly detection responses.
 */
export const prfAnomalyDetectionScorer: Scorer<string, { expected: any }> = {
  name: "prf-anomaly-detection",
  scorer: async ({ output, expected }) => {
    let score = 0;
    const maxScore = 4;
    const details: Record<string, boolean> = {};

    // Check for statistical analysis
    details.statistical_analysis =
      /z.?score|standard deviation|mean|average|outlier/i.test(output);
    if (details.statistical_analysis) score += 1;

    // Check for anomaly classification
    details.anomaly_classified =
      /anomaly|outlier|unusual|unexpected|normal|within range/i.test(output);
    if (details.anomaly_classified) score += 1;

    // Check for confidence level
    details.confidence_stated =
      /confidence|HIGH|MEDIUM|LOW|certain|likely/i.test(output);
    if (details.confidence_stated) score += 1;

    // Check for investigation guidance
    details.investigation_provided =
      /investigate|check|review|verify|root cause/i.test(output);
    if (details.investigation_provided) score += 1;

    return {
      name: "prf-anomaly-detection",
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
 * PRF Learning Extraction Scorer
 *
 * Evaluates learning extraction responses.
 */
export const prfLearningExtractionScorer: Scorer<string, { expected: any }> = {
  name: "prf-learning-extraction",
  scorer: async ({ output, expected }) => {
    let score = 0;
    const maxScore = 5;
    const details: Record<string, boolean> = {};

    // Check for learning documented
    details.learning_documented =
      /learning|insight|takeaway|lesson|finding/i.test(output);
    if (details.learning_documented) score += 1;

    // Check for category assigned
    details.category_assigned =
      /audience|channel|creative|timing|budget|targeting/i.test(output);
    if (details.category_assigned) score += 1;

    // Check for significance assessed
    details.significance_assessed =
      /significant|impact|meaningful|notable|minor/i.test(output);
    if (details.significance_assessed) score += 1;

    // Check for actionability
    details.actionable = /apply|replicate|avoid|implement|future/i.test(output);
    if (details.actionable) score += 1;

    // Check for validation status
    details.validation_noted =
      /validate|hypothesis|confirmed|proven|test/i.test(output);
    if (details.validation_noted) score += 1;

    return {
      name: "prf-learning-extraction",
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
 * PRF Optimization Trigger Scorer
 *
 * Evaluates optimization trigger responses.
 */
export const prfOptimizationTriggerScorer: Scorer<string, { expected: any }> = {
  name: "prf-optimization-trigger",
  scorer: async ({ output, expected }) => {
    let score = 0;
    const maxScore = 4;
    const details: Record<string, boolean> = {};

    // Check for threshold definition
    details.threshold_defined = /threshold|trigger|limit|boundary|\d+%/i.test(
      output
    );
    if (details.threshold_defined) score += 1;

    // Check for metric specification
    details.metric_specified =
      /CPA|CPM|CTR|CVR|ROAS|frequency|pacing|spend/i.test(output);
    if (details.metric_specified) score += 1;

    // Check for action specified
    details.action_specified =
      /pause|increase|decrease|shift|reallocate|alert/i.test(output);
    if (details.action_specified) score += 1;

    // Check for monitoring guidance
    details.monitoring_guidance =
      /daily|weekly|hourly|monitor|check|review/i.test(output);
    if (details.monitoring_guidance) score += 1;

    return {
      name: "prf-optimization-trigger",
      score: score / maxScore,
      metadata: {
        rawScore: score,
        maxScore,
        details,
      },
    };
  },
};

export default prfAccuracyScorer;
