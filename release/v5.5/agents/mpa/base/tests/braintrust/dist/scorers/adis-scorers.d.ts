/**
 * ADIS Scorers
 *
 * Scoring functions for Audience Data Intelligence System integration.
 * Tests trigger detection, analysis quality, and recommendation appropriateness.
 */
import { TurnScore } from "../mpa-multi-turn-types.js";
/**
 * Scores whether agent detected customer data mention and offered ADIS
 */
export declare function scoreAdisTriggerDetection(response: string, userMessage: string): TurnScore;
/**
 * Scores whether agent detected RFM-specific request
 */
export declare function scoreRfmRecognition(response: string, userMessage: string): TurnScore;
/**
 * Scores whether agent detected CLV-specific request
 */
export declare function scoreClvRecognition(response: string, userMessage: string): TurnScore;
/**
 * Scores whether agent offered AMMO optimization when audiences + budget present
 */
export declare function scoreAmmoTrigger(response: string, conversationContext: {
    hasAudiences: boolean;
    hasBudget: boolean;
}): TurnScore;
/**
 * Scores quality of allocation explanation
 */
export declare function scoreAllocationRationale(response: string): TurnScore;
/**
 * Scores quality of RFM segment presentation
 */
export declare function scoreSegmentPresentation(response: string): TurnScore;
/**
 * Scores channel affinity recommendations
 */
export declare function scoreChannelAffinityRecommendation(response: string): TurnScore;
/**
 * Scores jargon avoidance for basic users
 */
export declare function scoreJargonAvoidance(response: string, userSophistication: "basic" | "intermediate" | "advanced" | "expert"): TurnScore;
/**
 * Scores simplification of results for basic users
 */
export declare function scoreResultSimplification(response: string, userSophistication: "basic" | "intermediate" | "advanced" | "expert"): TurnScore;
/**
 * Composite scorer for overall ADIS integration quality
 */
export declare function scoreAdisIntegration(response: string, context: {
    userMessage: string;
    hasAudiences?: boolean;
    hasBudget?: boolean;
    userSophistication?: "basic" | "intermediate" | "advanced" | "expert";
}): TurnScore;
export declare const ADIS_SCORERS: {
    scoreAdisTriggerDetection: typeof scoreAdisTriggerDetection;
    scoreRfmRecognition: typeof scoreRfmRecognition;
    scoreClvRecognition: typeof scoreClvRecognition;
    scoreAmmoTrigger: typeof scoreAmmoTrigger;
    scoreAllocationRationale: typeof scoreAllocationRationale;
    scoreSegmentPresentation: typeof scoreSegmentPresentation;
    scoreChannelAffinityRecommendation: typeof scoreChannelAffinityRecommendation;
    scoreJargonAvoidance: typeof scoreJargonAvoidance;
    scoreResultSimplification: typeof scoreResultSimplification;
    scoreAdisIntegration: typeof scoreAdisIntegration;
};
export default ADIS_SCORERS;
//# sourceMappingURL=adis-scorers.d.ts.map