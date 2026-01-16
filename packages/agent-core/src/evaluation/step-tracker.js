/**
 * Step Tracker
 *
 * Tracks progress through workflow steps during conversations.
 * Agents provide their step definitions, and this tracks which
 * steps have been addressed.
 */
/**
 * Tracks progress through workflow steps
 */
export class StepTracker {
    config;
    progress;
    detections = [];
    constructor(config) {
        this.config = {
            ...config,
            requireOrder: config.requireOrder ?? false,
            confidenceThreshold: config.confidenceThreshold ?? 0.3,
        };
        this.progress = {
            completedSteps: [],
            skippedSteps: [],
            problematicSteps: [],
            turnsPerStep: {},
        };
    }
    /**
     * Analyze a turn to detect step progression
     */
    analyzeTurn(turn) {
        const detections = [];
        const combinedText = `${turn.userMessage} ${turn.assistantResponse}`.toLowerCase();
        for (const step of this.config.steps) {
            const matchedKeywords = step.keywords.filter(kw => combinedText.includes(kw.toLowerCase()));
            if (matchedKeywords.length > 0) {
                const confidence = matchedKeywords.length / step.keywords.length;
                if (confidence >= (this.config.confidenceThreshold ?? 0.3)) {
                    detections.push({
                        step: step.step,
                        confidence,
                        matchedKeywords,
                        turn: turn.turnNumber,
                    });
                }
            }
        }
        // Update tracking
        this.updateProgress(detections);
        this.detections.push(...detections);
        return detections;
    }
    /**
     * Update progress based on detections
     */
    updateProgress(detections) {
        for (const detection of detections) {
            // Update current step
            if (!this.progress.currentStep || detection.step > this.progress.currentStep) {
                // Check for skipped steps if order is required
                if (this.config.requireOrder && this.progress.currentStep) {
                    for (let s = this.progress.currentStep + 1; s < detection.step; s++) {
                        if (!this.progress.completedSteps.includes(s) &&
                            !this.progress.skippedSteps.includes(s)) {
                            this.progress.skippedSteps.push(s);
                        }
                    }
                }
                this.progress.currentStep = detection.step;
            }
            // Mark as completed if confidence is high enough
            if (detection.confidence >= 0.5 && !this.progress.completedSteps.includes(detection.step)) {
                this.progress.completedSteps.push(detection.step);
            }
            // Track turns per step
            this.progress.turnsPerStep[detection.step] =
                (this.progress.turnsPerStep[detection.step] || 0) + 1;
        }
    }
    /**
     * Analyze multiple turns (full conversation)
     */
    analyzeConversation(turns) {
        // Reset progress
        this.progress = {
            completedSteps: [],
            skippedSteps: [],
            problematicSteps: [],
            turnsPerStep: {},
        };
        this.detections = [];
        for (const turn of turns) {
            this.analyzeTurn(turn);
        }
        // Detect problematic steps (too many turns or low confidence)
        this.detectProblematicSteps();
        return this.getProgress();
    }
    /**
     * Detect steps that had issues
     */
    detectProblematicSteps() {
        // Steps with too many turns (potential confusion)
        for (const [stepStr, turns] of Object.entries(this.progress.turnsPerStep)) {
            const step = parseInt(stepStr);
            if (turns > 3) {
                this.progress.problematicSteps.push(step);
            }
        }
        // Steps that were addressed but with low confidence
        const stepConfidences = new Map();
        for (const detection of this.detections) {
            const current = stepConfidences.get(detection.step) || 0;
            stepConfidences.set(detection.step, Math.max(current, detection.confidence));
        }
        for (const [step, maxConfidence] of stepConfidences) {
            if (maxConfidence < 0.5 && !this.progress.problematicSteps.includes(step)) {
                this.progress.problematicSteps.push(step);
            }
        }
    }
    /**
     * Get current progress
     */
    getProgress() {
        return {
            completedSteps: [...this.progress.completedSteps].sort((a, b) => a - b),
            currentStep: this.progress.currentStep,
            skippedSteps: [...this.progress.skippedSteps].sort((a, b) => a - b),
            problematicSteps: [...new Set(this.progress.problematicSteps)].sort((a, b) => a - b),
            turnsPerStep: { ...this.progress.turnsPerStep },
        };
    }
    /**
     * Get all detections
     */
    getDetections() {
        return [...this.detections];
    }
    /**
     * Check if a specific step was completed
     */
    isStepCompleted(step) {
        return this.progress.completedSteps.includes(step);
    }
    /**
     * Get completion percentage
     */
    getCompletionPercentage() {
        const totalSteps = this.config.steps.length;
        if (totalSteps === 0)
            return 100;
        return (this.progress.completedSteps.length / totalSteps) * 100;
    }
    /**
     * Get step definition by number
     */
    getStepDefinition(step) {
        return this.config.steps.find(s => s.step === step);
    }
    /**
     * Get all step definitions
     */
    getStepDefinitions() {
        return [...this.config.steps];
    }
    /**
     * Reset tracking
     */
    reset() {
        this.progress = {
            completedSteps: [],
            skippedSteps: [],
            problematicSteps: [],
            turnsPerStep: {},
        };
        this.detections = [];
    }
}
export default StepTracker;
//# sourceMappingURL=step-tracker.js.map