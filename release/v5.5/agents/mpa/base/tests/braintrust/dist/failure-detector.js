"use strict";
/**
 * Failure Detector for Multi-Turn MPA Evaluation
 *
 * Detects conversation failures like loops, context loss, and greeting repetition.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailureDetector = exports.BUILTIN_FAILURES = void 0;
/**
 * Built-in failure patterns
 */
exports.BUILTIN_FAILURES = [
    {
        id: "greeting-repetition",
        description: "Agent repeats the 10-step greeting after first turn",
        type: "greeting_repetition",
        detectionPattern: "we will cover ten areas|i('m| am) excited to build a media plan|outcomes.*economics.*audience.*geography",
        severity: "major",
        scorePenalty: 0.15,
        terminateOnDetect: false,
    },
    {
        id: "multiple-questions",
        description: "Agent asks more than 2 questions in a single response",
        type: "excessive_questions",
        severity: "warning",
        scorePenalty: 0.05,
        terminateOnDetect: false,
    },
    {
        id: "step-boundary-violation",
        description: "Agent discusses channels or tactics in Steps 1-2",
        type: "step_boundary_violation",
        detectionPattern: "facebook ads|google ads|tiktok|instagram|linkedin ads|programmatic|channel mix|media mix|display ads|video ads|ctv|connected tv",
        severity: "major",
        scorePenalty: 0.15,
        terminateOnDetect: false,
    },
    {
        id: "context-loss",
        description: "Agent asks about information already provided",
        type: "context_loss",
        severity: "major",
        scorePenalty: 0.15,
        terminateOnDetect: false,
    },
    {
        id: "question-loop",
        description: "Agent asks same question type 6+ times within recent turns",
        type: "loop_detection",
        severity: "major",
        scorePenalty: 0.15,
        terminateOnDetect: false,
    },
    {
        id: "blocked-progress-idk",
        description: "Agent keeps pushing after user says 'I don't know'",
        type: "blocked_progress",
        severity: "major",
        scorePenalty: 0.2,
        terminateOnDetect: false,
    },
];
/**
 * Failure Detector class
 */
class FailureDetector {
    questionHistory = [];
    providedData = new Map();
    previousUserSaidIDK = false;
    idkTopic = "";
    /**
     * Reset detector state for a new conversation
     */
    reset() {
        this.questionHistory = [];
        this.providedData = new Map();
        this.previousUserSaidIDK = false;
        this.idkTopic = "";
    }
    /**
     * Detect failures in a turn
     */
    detectFailures(turnNumber, agentResponse, previousTurns, customFailures, currentStep = 1, userSaidIDK = false) {
        const detected = [];
        const allFailures = [...exports.BUILTIN_FAILURES, ...customFailures];
        // Update provided data from previous turns
        this.updateProvidedData(previousTurns);
        for (const failure of allFailures) {
            if (this.checkFailure(failure, turnNumber, agentResponse, previousTurns, currentStep)) {
                detected.push(failure);
            }
        }
        // Update state for next turn
        this.previousUserSaidIDK = userSaidIDK;
        if (userSaidIDK) {
            this.idkTopic = this.extractQuestionTopic(previousTurns[previousTurns.length - 1]?.agentResponse || "");
        }
        return detected;
    }
    /**
     * Update provided data from conversation history
     */
    updateProvidedData(turns) {
        for (const turn of turns) {
            for (const [key, value] of Object.entries(turn.extractedData)) {
                this.providedData.set(key, value);
            }
        }
    }
    /**
     * Check if a specific failure condition is met
     */
    checkFailure(failure, turnNumber, agentResponse, previousTurns, currentStep) {
        switch (failure.type) {
            case "greeting_repetition":
                return this.checkGreetingRepetition(turnNumber, agentResponse, failure);
            case "excessive_questions":
                return this.checkExcessiveQuestions(agentResponse);
            case "step_boundary_violation":
                return this.checkStepBoundaryViolation(agentResponse, currentStep, failure);
            case "context_loss":
                return this.checkContextLoss(agentResponse);
            case "loop_detection":
                return this.checkLoopDetection(agentResponse);
            case "blocked_progress":
                return this.checkBlockedProgress(agentResponse, previousTurns);
            case "custom_pattern":
                if (failure.detectionPattern) {
                    const regex = new RegExp(failure.detectionPattern, "i");
                    return regex.test(agentResponse);
                }
                return false;
            default:
                return false;
        }
    }
    /**
     * Check for greeting repetition
     */
    checkGreetingRepetition(turnNumber, response, failure) {
        // Greeting is expected in turn 1, but not after
        if (turnNumber <= 1)
            return false;
        const pattern = new RegExp(failure.detectionPattern || "", "i");
        return pattern.test(response);
    }
    /**
     * Check for excessive questions
     */
    checkExcessiveQuestions(response) {
        const questionCount = (response.match(/\?/g) || []).length;
        return questionCount > 2;
    }
    /**
     * Check for step boundary violations
     */
    checkStepBoundaryViolation(response, currentStep, failure) {
        // Only check in Steps 1-2
        if (currentStep > 2)
            return false;
        const pattern = new RegExp(failure.detectionPattern || "", "i");
        return pattern.test(response);
    }
    /**
     * Check for context loss
     */
    checkContextLoss(response) {
        // Patterns that suggest asking for already-provided data
        const askPatterns = [
            { pattern: /what('?s| is) your budget/i, dataKey: "budget" },
            { pattern: /how many (customers|leads)/i, dataKey: "volumeTarget" },
            { pattern: /what('?s| is) your target/i, dataKey: "volumeTarget" },
            { pattern: /what('?s| is) your objective/i, dataKey: "objective" },
            { pattern: /what('?s| is) your ltv/i, dataKey: "ltv" },
            { pattern: /what('?s| is) your cac/i, dataKey: "cac" },
        ];
        for (const { pattern, dataKey } of askPatterns) {
            if (pattern.test(response)) {
                // Check if we already have this data
                if (this.providedData.has(dataKey)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Check for question loops
     *
     * A true loop is when the agent repeatedly asks the SAME question type
     * within a SHORT window (e.g., 4 consecutive turns). In a 10-step planning
     * session, it's natural to revisit topics across different steps.
     *
     * This detector focuses on detecting ACTUAL loops where the agent is stuck,
     * not natural topic revisitation across steps.
     */
    checkLoopDetection(response) {
        // Extract questions from current response
        const questions = response.match(/[^.!?]*\?/g) || [];
        for (const q of questions) {
            const normalized = q
                .toLowerCase()
                .replace(/[^\w\s]/g, "")
                .trim();
            this.questionHistory.push(normalized);
        }
        // Keep only questions from recent turns (last 8 questions ~= 4 turns with 2 questions each)
        // This prevents flagging natural topic revisitation across different steps
        const recentWindow = 8;
        if (this.questionHistory.length > recentWindow) {
            this.questionHistory = this.questionHistory.slice(-recentWindow);
        }
        // Check for repeated similar questions within the recent window
        const questionClusters = new Map();
        for (const q of this.questionHistory) {
            const key = this.getQuestionType(q);
            // Don't count generic "other" questions as they're too diverse
            if (key !== "other") {
                questionClusters.set(key, (questionClusters.get(key) || 0) + 1);
            }
        }
        // Flag if same question type asked 6+ times within recent window
        // This indicates the agent is truly stuck in a loop
        for (const count of questionClusters.values()) {
            if (count >= 6) {
                return true;
            }
        }
        return false;
    }
    /**
     * Categorize question type
     */
    getQuestionType(question) {
        if (/budget|spend|cost/i.test(question))
            return "budget";
        if (/customer|lead|volume|target/i.test(question))
            return "volume";
        if (/kpi|metric|measure|success/i.test(question))
            return "kpi";
        if (/audience|target|who|demographic/i.test(question))
            return "audience";
        if (/channel|platform|media/i.test(question))
            return "channel";
        if (/objective|goal|outcome/i.test(question))
            return "objective";
        if (/ltv|lifetime|value/i.test(question))
            return "ltv";
        if (/cac|acquisition|efficiency/i.test(question))
            return "cac";
        if (/margin|profit/i.test(question))
            return "margin";
        return "other";
    }
    /**
     * Extract question topic for IDK tracking
     */
    extractQuestionTopic(agentMessage) {
        const questions = agentMessage.match(/[^.!?]*\?/g) || [];
        if (questions.length === 0)
            return "unknown";
        const lastQuestion = questions[questions.length - 1].toLowerCase();
        return this.getQuestionType(lastQuestion);
    }
    /**
     * Check for blocked progress after IDK
     */
    checkBlockedProgress(response, previousTurns) {
        // Check if previous turn had IDK
        if (!this.previousUserSaidIDK)
            return false;
        // Check if agent is still pushing on same topic
        const pushingPatterns = [
            /what is your|can you tell me|do you have|please provide/i,
            /you must have|surely you know/i,
            /can you estimate|any idea/i,
        ];
        // Check if the question is about the same topic as the IDK
        const currentTopic = this.extractQuestionTopic(response);
        for (const pattern of pushingPatterns) {
            if (pattern.test(response)) {
                // If asking about the same topic user said they don't know
                if (currentTopic === this.idkTopic) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Calculate string similarity using Jaccard index
     */
    calculateStringSimilarity(a, b) {
        const wordsA = new Set(a.split(" ").filter((w) => w.length > 2));
        const wordsB = new Set(b.split(" ").filter((w) => w.length > 2));
        if (wordsA.size === 0 && wordsB.size === 0)
            return 0;
        const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
        const union = new Set([...wordsA, ...wordsB]);
        return intersection.size / union.size;
    }
    /**
     * Get failure summary
     */
    getFailureSummary(failures) {
        if (failures.length === 0)
            return "No failures detected";
        const critical = failures.filter((f) => f.severity === "critical");
        const major = failures.filter((f) => f.severity === "major");
        const warnings = failures.filter((f) => f.severity === "warning");
        const parts = [];
        if (critical.length > 0)
            parts.push(`${critical.length} critical`);
        if (major.length > 0)
            parts.push(`${major.length} major`);
        if (warnings.length > 0)
            parts.push(`${warnings.length} warnings`);
        return `Failures: ${parts.join(", ")}`;
    }
}
exports.FailureDetector = FailureDetector;
exports.default = FailureDetector;
//# sourceMappingURL=failure-detector.js.map