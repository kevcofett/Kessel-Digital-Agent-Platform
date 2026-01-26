/**
 * Baseline Tracker - Tracks and compares evaluation results against baselines
 *
 * This module provides:
 * 1. Per-scenario baseline tracking
 * 2. Composite score calculation across all scenarios
 * 3. Regression detection
 * 4. Improvement tracking
 * 5. Report generation for optimization cycles
 */
/**
 * Score breakdown for a single scenario
 */
export interface ScenarioScore {
    scenarioId: string;
    scenarioName: string;
    compositeScore: number;
    passed: boolean;
    stepsCompleted: number;
    totalTurns: number;
    criticalFailures: number;
    majorFailures: number;
    warnings: number;
    mentorshipScore?: number;
    stepQualityScore?: number;
    planCoherenceScore?: number;
    avgResponseLength: number;
    avgSingleQuestion: number;
    avgAdaptiveSophistication: number;
    avgProactiveIntelligence: number;
    dataQualityScore?: number;
    citationAccuracy?: number;
    gracefulDegradation?: number;
    durationMs: number;
    tokensUsed: number;
    timestamp: number;
}
/**
 * Complete baseline record for a prompt version
 */
export interface BaselineRecord {
    promptVersion: string;
    model: string;
    timestamp: number;
    scenarioScores: Record<string, ScenarioScore>;
    overallComposite: number;
    passRate: number;
    avgStepsCompleted: number;
    avgTurns: number;
    totalDuration: number;
    totalTokens: number;
    avgMentorship: number;
    avgStepQuality: number;
    avgPlanCoherence: number;
    avgDataQuality: number;
    avgCitation: number;
}
/**
 * Comparison result between two runs
 */
export interface ComparisonResult {
    baseline: BaselineRecord;
    current: BaselineRecord;
    compositeChange: number;
    passRateChange: number;
    scenarioChanges: {
        scenarioId: string;
        scenarioName: string;
        baselineScore: number;
        currentScore: number;
        change: number;
        isRegression: boolean;
        isImprovement: boolean;
    }[];
    mentorshipChange: number;
    stepQualityChange: number;
    planCoherenceChange: number;
    dataQualityChange: number;
    citationChange: number;
    regressions: string[];
    improvements: string[];
    recommendations: string[];
}
/**
 * V5.7 Baseline Scores - Established from evaluation run
 */
export declare const V5_7_BASELINE_SCORES: Partial<BaselineRecord>;
/**
 * Load baseline from file or use defaults
 */
export declare function loadBaseline(filePath?: string): BaselineRecord | null;
/**
 * Save baseline to file
 */
export declare function saveBaseline(baseline: BaselineRecord, filePath?: string): void;
/**
 * Calculate aggregate metrics from scenario scores
 */
export declare function calculateAggregates(scenarioScores: Record<string, ScenarioScore>): Omit<BaselineRecord, "promptVersion" | "model" | "timestamp" | "scenarioScores">;
/**
 * Compare current results against baseline
 */
export declare function compareToBaseline(current: BaselineRecord, baseline: BaselineRecord): ComparisonResult;
/**
 * Generate a formatted report from comparison results
 */
export declare function generateComparisonReport(comparison: ComparisonResult): string;
declare const _default: {
    loadBaseline: typeof loadBaseline;
    saveBaseline: typeof saveBaseline;
    calculateAggregates: typeof calculateAggregates;
    compareToBaseline: typeof compareToBaseline;
    generateComparisonReport: typeof generateComparisonReport;
    V5_7_BASELINE_SCORES: Partial<BaselineRecord>;
};
export default _default;
//# sourceMappingURL=baseline-tracker.d.ts.map