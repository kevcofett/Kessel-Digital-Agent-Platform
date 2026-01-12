/**
 * Step Tracker
 *
 * Tracks progress through workflow steps during conversations.
 * Agents provide their step definitions, and this tracks which
 * steps have been addressed.
 */
import { StepDefinition, StepProgress, ConversationTurn } from './types.js';
/**
 * Configuration for step tracking
 */
export interface StepTrackerConfig {
    /**
     * Step definitions for this agent
     */
    steps: StepDefinition[];
    /**
     * Whether steps must be completed in order
     */
    requireOrder?: boolean;
    /**
     * Minimum confidence threshold for step detection
     */
    confidenceThreshold?: number;
}
/**
 * Detection result for a single step
 */
export interface StepDetection {
    step: number;
    confidence: number;
    matchedKeywords: string[];
    turn: number;
}
/**
 * Tracks progress through workflow steps
 */
export declare class StepTracker {
    private config;
    private progress;
    private detections;
    constructor(config: StepTrackerConfig);
    /**
     * Analyze a turn to detect step progression
     */
    analyzeTurn(turn: ConversationTurn): StepDetection[];
    /**
     * Update progress based on detections
     */
    private updateProgress;
    /**
     * Analyze multiple turns (full conversation)
     */
    analyzeConversation(turns: ConversationTurn[]): StepProgress;
    /**
     * Detect steps that had issues
     */
    private detectProblematicSteps;
    /**
     * Get current progress
     */
    getProgress(): StepProgress;
    /**
     * Get all detections
     */
    getDetections(): StepDetection[];
    /**
     * Check if a specific step was completed
     */
    isStepCompleted(step: number): boolean;
    /**
     * Get completion percentage
     */
    getCompletionPercentage(): number;
    /**
     * Get step definition by number
     */
    getStepDefinition(step: number): StepDefinition | undefined;
    /**
     * Get all step definitions
     */
    getStepDefinitions(): StepDefinition[];
    /**
     * Reset tracking
     */
    reset(): void;
}
export default StepTracker;
//# sourceMappingURL=step-tracker.d.ts.map