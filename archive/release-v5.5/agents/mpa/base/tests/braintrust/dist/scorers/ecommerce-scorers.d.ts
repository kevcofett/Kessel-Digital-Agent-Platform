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
export declare function scoreRfmSegmentRecognition(output: string, input: string): TurnScore;
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
export declare function scoreReactivationStrategy(output: string, input: string): TurnScore;
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
export declare function scoreRetentionAcquisitionBalance(output: string, input: string): TurnScore;
/**
 * Score cohort analysis usage
 *
 * Validates that agent uses cohort retention data when provided.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export declare function scoreCohortAnalysisUsage(output: string, input: string): TurnScore;
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
export declare function scoreLookalikeAudienceStrategy(output: string, input: string): TurnScore;
/**
 * Score seasonal planning
 *
 * Validates that agent provides seasonally-aware recommendations.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export declare function scoreSeasonalPlanning(output: string, input: string): TurnScore;
/**
 * Score customer LTV application
 *
 * Validates that agent considers LTV when user provides customer value data.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export declare function scoreCustomerLtvApplication(output: string, input: string): TurnScore;
/**
 * Score retention channel mix
 *
 * Validates that agent recommends appropriate channels for retention.
 *
 * @param output - Agent response
 * @param input - User input
 * @returns TurnScore
 */
export declare function scoreRetentionChannelMix(output: string, input: string): TurnScore;
export declare const ecommerceScorers: {
    scoreRfmSegmentRecognition: typeof scoreRfmSegmentRecognition;
    scoreReactivationStrategy: typeof scoreReactivationStrategy;
    scoreRetentionAcquisitionBalance: typeof scoreRetentionAcquisitionBalance;
    scoreCohortAnalysisUsage: typeof scoreCohortAnalysisUsage;
    scoreLookalikeAudienceStrategy: typeof scoreLookalikeAudienceStrategy;
    scoreSeasonalPlanning: typeof scoreSeasonalPlanning;
    scoreCustomerLtvApplication: typeof scoreCustomerLtvApplication;
    scoreRetentionChannelMix: typeof scoreRetentionChannelMix;
};
export default ecommerceScorers;
//# sourceMappingURL=ecommerce-scorers.d.ts.map