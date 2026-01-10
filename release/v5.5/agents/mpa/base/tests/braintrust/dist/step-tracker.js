"use strict";
/**
 * Step Tracker for Multi-Turn MPA Evaluation
 *
 * Tracks conversation progress through the 10-step MPA process.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepTracker = void 0;
const mpa_multi_turn_types_js_1 = require("./mpa-multi-turn-types.js");
/**
 * Step Tracker class
 */
class StepTracker {
    stepDefinitions;
    constructor() {
        this.stepDefinitions = new Map();
        for (const step of mpa_multi_turn_types_js_1.MPA_STEPS) {
            this.stepDefinitions.set(step.step, step);
        }
    }
    /**
     * Initialize tracking state
     */
    initializeState() {
        const collectedData = {};
        for (let step = 1; step <= 10; step++) {
            const stepDef = this.stepDefinitions.get(step);
            collectedData[step] = {
                step,
                requiredDataPoints: stepDef?.minimumViableData || [],
                collectedDataPoints: {},
                minimumViableMet: false,
                startedAtTurn: 0,
            };
        }
        return {
            currentStep: 1,
            completedSteps: [],
            collectedData,
            turnsPerStep: {},
            isTerminal: false,
        };
    }
    /**
     * Detect current step from conversation context
     */
    detectCurrentStep(userMessage, agentMessage, currentState) {
        const combinedText = `${userMessage} ${agentMessage}`.toLowerCase();
        // First check for explicit step transition signals in agent message
        const stepTransitionMatch = agentMessage.match(/(?:step|moving to|let'?s discuss|now for)\s*(\d+)|(?:step)\s*(\d+)/i);
        if (stepTransitionMatch) {
            const mentionedStep = parseInt(stepTransitionMatch[1] || stepTransitionMatch[2]);
            if (mentionedStep >= 1 && mentionedStep <= 10) {
                // Only advance if it's the next step or within 2 steps
                if (mentionedStep === currentState.currentStep + 1 ||
                    mentionedStep === currentState.currentStep) {
                    return mentionedStep;
                }
            }
        }
        // Check for step completion signals
        if (this.detectStepCompletion(agentMessage, currentState.currentStep)) {
            // If current step seems complete, check if we should advance
            const nextStep = currentState.currentStep + 1;
            if (nextStep <= 10) {
                const nextStepDef = this.stepDefinitions.get(nextStep);
                if (nextStepDef) {
                    const matchCount = nextStepDef.detectionPatterns.filter((p) => p.test(combinedText)).length;
                    if (matchCount > 0) {
                        return nextStep;
                    }
                }
            }
        }
        // Check for pattern matches suggesting a different step
        for (let step = 1; step <= 10; step++) {
            const stepDef = this.stepDefinitions.get(step);
            if (!stepDef)
                continue;
            let matchCount = 0;
            for (const pattern of stepDef.detectionPatterns) {
                if (pattern.test(combinedText)) {
                    matchCount++;
                }
            }
            // If majority of patterns match
            if (matchCount >= stepDef.detectionPatterns.length * 0.5) {
                // Only advance sequentially (1 step at a time) or stay at current
                if (step === currentState.currentStep ||
                    step === currentState.currentStep + 1) {
                    return step;
                }
                // For Steps 1-2, allow staying in that range
                if (step <= 2 && currentState.currentStep <= 2) {
                    return step;
                }
            }
        }
        return currentState.currentStep;
    }
    /**
     * Update state based on conversation turn
     */
    updateState(currentState, userMessage, agentMessage, extractedData, turnNumber) {
        const newState = {
            ...currentState,
            collectedData: { ...currentState.collectedData },
            turnsPerStep: { ...currentState.turnsPerStep },
            completedSteps: [...currentState.completedSteps],
        };
        const currentStep = newState.currentStep;
        // Update turn counts
        newState.turnsPerStep[currentStep] =
            (newState.turnsPerStep[currentStep] || 0) + 1;
        // Mark step start if not already started
        if (newState.collectedData[currentStep].startedAtTurn === 0) {
            newState.collectedData[currentStep] = {
                ...newState.collectedData[currentStep],
                startedAtTurn: turnNumber,
            };
        }
        // Add extracted data to current step
        const stepData = { ...newState.collectedData[currentStep] };
        stepData.collectedDataPoints = {
            ...stepData.collectedDataPoints,
            ...extractedData,
        };
        // Extract additional data from agent response
        this.extractAgentData(agentMessage, stepData);
        // Check minimum viable completion
        const collectedKeys = Object.keys(stepData.collectedDataPoints);
        const requiredMet = stepData.requiredDataPoints.filter((dp) => collectedKeys.some((ck) => ck.toLowerCase().includes(dp.toLowerCase())));
        if (requiredMet.length >= stepData.requiredDataPoints.length * 0.6) {
            stepData.minimumViableMet = true;
        }
        // Check for step completion signals
        if (this.detectStepCompletion(agentMessage, currentStep)) {
            if (!stepData.completedAtTurn) {
                stepData.completedAtTurn = turnNumber;
            }
            if (!newState.completedSteps.includes(currentStep)) {
                newState.completedSteps.push(currentStep);
            }
            // Advance to next step if sequential
            if (currentStep < 10) {
                newState.currentStep = currentStep + 1;
            }
        }
        newState.collectedData[currentStep] = stepData;
        return newState;
    }
    /**
     * Extract data points from agent response
     */
    extractAgentData(agentMessage, stepData) {
        // Budget extraction
        const budgetMatch = agentMessage.match(/\$?([\d,]+)\s*(?:k|K|thousand)?(?:\s*budget)?/);
        if (budgetMatch) {
            let value = parseFloat(budgetMatch[1].replace(/,/g, ""));
            if (/k|K|thousand/i.test(budgetMatch[0]))
                value *= 1000;
            if (value > 10000) {
                // Only capture if looks like a budget
                stepData.collectedDataPoints.budget = value;
            }
        }
        // Implied CAC extraction
        const cacMatch = agentMessage.match(/\$([\d,]+)\s*(?:per customer|cac|acquisition cost|cost per)/i);
        if (cacMatch) {
            stepData.collectedDataPoints.impliedCac = parseFloat(cacMatch[1].replace(/,/g, ""));
            stepData.collectedDataPoints.impliedEfficiency =
                stepData.collectedDataPoints.impliedCac;
        }
        // Volume extraction
        const volumeMatch = agentMessage.match(/([\d,]+)\s*(customers?|leads?|users?)/i);
        if (volumeMatch) {
            stepData.collectedDataPoints.volumeTarget = parseInt(volumeMatch[1].replace(/,/g, ""));
        }
        // Assessment extraction
        if (/aggressive|ambitious/i.test(agentMessage)) {
            stepData.collectedDataPoints.efficiencyAssessment = "aggressive";
        }
        else if (/typical|average|moderate/i.test(agentMessage)) {
            stepData.collectedDataPoints.efficiencyAssessment = "typical";
        }
        else if (/conservative|achievable|reasonable/i.test(agentMessage)) {
            stepData.collectedDataPoints.efficiencyAssessment = "conservative";
        }
        // Objective detection
        if (/customer acquisition|acquire.*customers|grow.*customer base/i.test(agentMessage)) {
            stepData.collectedDataPoints.objective = "customer_acquisition";
        }
        else if (/lead generation|generate.*leads/i.test(agentMessage)) {
            stepData.collectedDataPoints.objective = "lead_generation";
        }
        else if (/brand awareness|awareness/i.test(agentMessage)) {
            stepData.collectedDataPoints.objective = "brand_awareness";
        }
        // KPI detection
        if (/new customers?|customer count|customers? acquired/i.test(agentMessage)) {
            stepData.collectedDataPoints.primaryKPI = "new_customers";
        }
        else if (/leads?|lead count/i.test(agentMessage)) {
            stepData.collectedDataPoints.primaryKPI = "leads";
        }
        else if (/revenue|sales/i.test(agentMessage)) {
            stepData.collectedDataPoints.primaryKPI = "revenue";
        }
    }
    /**
     * Detect if step appears to be complete based on agent signals
     */
    detectStepCompletion(agentMessage, currentStep) {
        const completionPatterns = [
            /perfect|great|got it.*now let/i,
            /step \d+ complete|moving to step/i,
            /now let'?s (?:move|look at|discuss|explore)/i,
            /(?:first|next) step.*complete/i,
            /with that.*let'?s/i,
            /economics.*look.*realistic|efficiency.*achievable/i,
            /that covers|wrapping up/i,
        ];
        // Step-specific completion patterns
        const stepCompletionPatterns = {
            1: [
                /objective.*clear|target.*set/i,
                /5,?000 customers|volume.*target/i,
            ],
            2: [
                /efficiency.*realistic|cac.*achievable/i,
                /economics.*work|unit economics.*validated/i,
            ],
            3: [/audience.*defined|target.*identified/i],
            4: [/geography.*set|markets?.*selected/i],
            5: [/budget.*allocated|spending.*planned/i],
            6: [/value prop.*clear|positioning.*defined/i],
            7: [/channel.*mix.*set|media.*plan/i],
            8: [/measurement.*plan|attribution.*defined/i],
            9: [/testing.*agenda|experiments?.*planned/i],
            10: [/risks?.*documented|mitigation.*place/i],
        };
        // Check general completion patterns
        for (const pattern of completionPatterns) {
            if (pattern.test(agentMessage)) {
                return true;
            }
        }
        // Check step-specific patterns
        const stepPatterns = stepCompletionPatterns[currentStep] || [];
        for (const pattern of stepPatterns) {
            if (pattern.test(agentMessage)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get step name
     */
    getStepName(step) {
        return this.stepDefinitions.get(step)?.name || `Step ${step}`;
    }
    /**
     * Check if a specific step is complete
     */
    isStepComplete(state, step) {
        return state.completedSteps.includes(step);
    }
    /**
     * Get progress summary
     */
    getProgressSummary(state) {
        const completed = state.completedSteps.length;
        const current = this.getStepName(state.currentStep);
        const steps = state.completedSteps
            .map((s) => this.getStepName(s))
            .join(", ");
        return `${completed}/10 steps complete. Currently on: ${current}. Completed: ${steps || "None"}`;
    }
}
exports.StepTracker = StepTracker;
exports.default = StepTracker;
//# sourceMappingURL=step-tracker.js.map