/**
 * Step Tracker for Multi-Turn MPA Evaluation
 *
 * Tracks conversation progress through the 10-step MPA process.
 */
import { StepTrackingState } from "./mpa-multi-turn-types.js";
/**
 * Step Tracker class
 */
export declare class StepTracker {
    private stepDefinitions;
    constructor();
    /**
     * Initialize tracking state
     */
    initializeState(): StepTrackingState;
    /**
     * Detect current step from conversation context
     */
    detectCurrentStep(userMessage: string, agentMessage: string, currentState: StepTrackingState): number;
    /**
     * Update state based on conversation turn
     */
    updateState(currentState: StepTrackingState, userMessage: string, agentMessage: string, extractedData: Record<string, unknown>, turnNumber: number): StepTrackingState;
    /**
     * Extract data points from agent response
     */
    private extractAgentData;
    /**
     * Detect if step appears to be complete based on agent signals
     */
    private detectStepCompletion;
    /**
     * Get step name
     */
    getStepName(step: number): string;
    /**
     * Check if a specific step is complete
     */
    isStepComplete(state: StepTrackingState, step: number): boolean;
    /**
     * Get progress summary
     */
    getProgressSummary(state: StepTrackingState): string;
}
export default StepTracker;
//# sourceMappingURL=step-tracker.d.ts.map