/**
 * KB Document Impact Tracker
 *
 * Tracks and analyzes the impact of KB (Knowledge Base) documents on agent performance.
 * This helps identify:
 * 1. Which KB documents most improve agent quality
 * 2. Which KB documents are being properly utilized
 * 3. Gaps between what KB documents provide and what the agent needs
 * 4. Opportunities for KB document optimization
 *
 * Key use cases:
 * - A/B testing KB document versions
 * - Identifying underutilized KB documents
 * - Finding correlations between KB content and quality scores
 * - Guiding KB document improvements based on evaluation gaps
 */
/**
 * KB Document metadata
 */
export interface KBDocument {
    id: string;
    filename: string;
    category: "supporting" | "expert_lens" | "implications" | "conversation" | "geography" | "calculation";
    step: number | number[];
    version: string;
    lastModified: string;
    contentSummary?: string;
}
/**
 * Record of KB document usage in a conversation
 */
export interface KBUsageRecord {
    documentId: string;
    step: number;
    wasInjected: boolean;
    wasReferenced: boolean;
    contentMatches: string[];
    turnNumber: number;
}
/**
 * Impact metrics for a KB document
 */
export interface KBImpactMetrics {
    documentId: string;
    documentName: string;
    timesInjected: number;
    timesReferenced: number;
    referenceRate: number;
    avgMentorshipWhenInjected: number;
    avgMentorshipWhenNotInjected: number;
    mentorshipImpact: number;
    avgCitationWhenInjected: number;
    avgCitationWhenNotInjected: number;
    citationImpact: number;
    avgDataQualityWhenInjected: number;
    avgDataQualityWhenNotInjected: number;
    dataQualityImpact: number;
    mostUsedSections: string[];
    unusedSections: string[];
    contentUtilizationRate: number;
}
/**
 * Optimization recommendation based on KB impact analysis
 */
export interface KBOptimizationRecommendation {
    documentId: string;
    recommendationType: "update" | "expand" | "consolidate" | "remove" | "create_new";
    priority: "high" | "medium" | "low";
    rationale: string;
    suggestedChanges?: string[];
    expectedImpact?: string;
}
/**
 * Catalog of MPA KB documents
 */
export declare const MPA_KB_DOCUMENTS: KBDocument[];
/**
 * Track KB usage in a single turn
 */
export declare function trackKBUsage(agentResponse: string, injectedDocuments: string[], step: number, turnNumber: number): KBUsageRecord[];
/**
 * Aggregate KB usage records into impact metrics
 */
export declare function calculateKBImpactMetrics(usageRecords: KBUsageRecord[], qualityScores: {
    turnNumber: number;
    mentorship: number;
    citation: number;
    dataQuality: number;
    injectedDocuments: string[];
}[]): KBImpactMetrics[];
/**
 * Generate optimization recommendations based on impact analysis
 */
export declare function generateKBOptimizationRecommendations(impactMetrics: KBImpactMetrics[]): KBOptimizationRecommendation[];
/**
 * Generate a formatted report of KB impact analysis
 */
export declare function generateKBImpactReport(impactMetrics: KBImpactMetrics[], recommendations: KBOptimizationRecommendation[]): string;
/**
 * Save KB impact data for trend analysis
 */
export declare function saveKBImpactData(impactMetrics: KBImpactMetrics[], promptVersion: string, filePath?: string): void;
declare const _default: {
    MPA_KB_DOCUMENTS: KBDocument[];
    trackKBUsage: typeof trackKBUsage;
    calculateKBImpactMetrics: typeof calculateKBImpactMetrics;
    generateKBOptimizationRecommendations: typeof generateKBOptimizationRecommendations;
    generateKBImpactReport: typeof generateKBImpactReport;
    saveKBImpactData: typeof saveKBImpactData;
};
export default _default;
//# sourceMappingURL=kb-impact-tracker.d.ts.map