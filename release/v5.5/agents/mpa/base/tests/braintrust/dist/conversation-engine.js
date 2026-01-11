"use strict";
/**
 * Conversation Engine for Multi-Turn MPA Evaluation
 *
 * Orchestrates complete multi-turn conversations between
 * the simulated user and the MPA agent.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationEngine = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const user_simulator_js_1 = require("./user-simulator.js");
const step_tracker_js_1 = require("./step-tracker.js");
const failure_detector_js_1 = require("./failure-detector.js");
const kb_injector_js_1 = require("./kb-injector.js");
const index_js_1 = require("./scorers/index.js");
// Import MPA system prompt
const mpa_prompt_content_js_1 = require("./mpa-prompt-content.js");
const DEFAULT_ENGINE_CONFIG = {
    agentModel: "claude-sonnet-4-20250514",
    simulatorModel: "claude-sonnet-4-20250514",
    agentTemperature: 0.7,
    agentMaxTokens: 1024,
    promptVersion: "v5_7_5",
    systemPrompt: mpa_prompt_content_js_1.MPA_SYSTEM_PROMPT,
    verbose: false,
};
/**
 * Conversation Engine - Orchestrates multi-turn conversations
 */
class ConversationEngine {
    anthropic;
    userSimulator;
    stepTracker;
    failureDetector;
    kbInjector;
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_ENGINE_CONFIG, ...config };
        this.anthropic = new sdk_1.default({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.userSimulator = new user_simulator_js_1.UserSimulator({
            model: this.config.simulatorModel,
        });
        this.stepTracker = new step_tracker_js_1.StepTracker();
        this.failureDetector = new failure_detector_js_1.FailureDetector();
        this.kbInjector = new kb_injector_js_1.KBInjector();
    }
    /**
     * Run a complete conversation for a scenario
     */
    async runConversation(scenario) {
        const startTime = Date.now();
        const turns = [];
        const allEvents = [];
        const failures = { warnings: [], major: [], critical: [] };
        // Reset failure detector for new conversation
        this.failureDetector.reset();
        // Initialize step tracking state
        let stepState = this.stepTracker.initializeState();
        // Build message history for agent context
        const messageHistory = [];
        let turnNumber = 0;
        let shouldContinue = true;
        // Get initial KB content for step 1
        const initialKB = await this.kbInjector.getKBStringForStep(1, scenario.kbInjectionMap);
        // Get the agent's opening greeting
        const openingResult = await this.getAgentResponse(this.config.systemPrompt, [], initialKB);
        if (this.config.verbose) {
            console.log(`[Opening] Agent: ${openingResult.response.slice(0, 100)}...`);
        }
        // Main conversation loop
        while (shouldContinue && turnNumber < scenario.maxTurns) {
            turnNumber++;
            const turnStart = Date.now();
            // Determine which agent message to respond to
            const agentMessageToRespond = turnNumber === 1
                ? openingResult.response
                : turns[turns.length - 1].agentResponse;
            // Get user response (including any data changes scheduled for this turn)
            const userResponse = await this.userSimulator.generateResponse(scenario.persona, agentMessageToRespond, turns, turnNumber === 1 ? scenario.openingMessage : undefined, scenario.dataChanges, turnNumber);
            if (this.config.verbose) {
                console.log(`[Turn ${turnNumber}] User: ${userResponse.message}`);
            }
            // Add user message to history
            messageHistory.push({
                role: "user",
                content: userResponse.message,
            });
            // Detect current step
            const currentStep = this.stepTracker.detectCurrentStep(userResponse.message, agentMessageToRespond, stepState);
            // Get KB content for current step
            const kbContent = await this.kbInjector.getKBStringForStep(currentStep, scenario.kbInjectionMap);
            const kbFiles = this.kbInjector.getKBFilesForStep(currentStep);
            // Get agent response
            const agentResult = await this.getAgentResponse(this.config.systemPrompt, messageHistory, kbContent);
            // Add agent response to history
            messageHistory.push({
                role: "assistant",
                content: agentResult.response,
            });
            if (this.config.verbose) {
                console.log(`[Turn ${turnNumber}] Agent: ${agentResult.response.slice(0, 100)}...`);
            }
            // Update step state
            stepState = this.stepTracker.updateState(stepState, userResponse.message, agentResult.response, userResponse.revealedData, turnNumber);
            // Detect events
            const events = this.detectEvents(turnNumber, userResponse, agentResult.response, stepState, turns);
            allEvents.push(...events);
            // Detect failures
            const detectedFailures = this.failureDetector.detectFailures(turnNumber, agentResult.response, turns, scenario.failureConditions, currentStep, userResponse.saidIDontKnow);
            for (const failure of detectedFailures) {
                switch (failure.severity) {
                    case "warning":
                        failures.warnings.push(failure);
                        break;
                    case "major":
                        failures.major.push(failure);
                        break;
                    case "critical":
                        failures.critical.push(failure);
                        if (failure.terminateOnDetect) {
                            shouldContinue = false;
                            stepState = {
                                ...stepState,
                                isTerminal: true,
                                terminalReason: `Critical failure: ${failure.description}`,
                            };
                        }
                        break;
                }
            }
            // Score this turn
            const turnScores = await (0, index_js_1.scoreTurn)(userResponse.message, agentResult.response, currentStep, stepState, scenario.persona.sophisticationLevel);
            // Create turn record
            const turn = {
                turnNumber,
                currentStep,
                userMessage: userResponse.message,
                agentResponse: agentResult.response,
                kbContentInjected: kbFiles,
                tokenCounts: agentResult.tokenCounts,
                timestamp: turnStart,
                latencyMs: Date.now() - turnStart,
                turnScores,
                detectedEvents: events,
                extractedData: userResponse.revealedData,
                stepState: { ...stepState },
            };
            turns.push(turn);
            // Check for conversation completion
            if (this.isConversationComplete(stepState, scenario)) {
                shouldContinue = false;
            }
        }
        // Calculate conversation-level scores
        const conversationScores = await (0, index_js_1.scoreConversation)(turns, scenario, allEvents, failures);
        // Calculate turn score aggregates
        const turnScoreAggregates = (0, index_js_1.calculateTurnAggregates)(turns);
        // Calculate composite score
        const compositeScore = (0, index_js_1.calculateCompositeScore)(turnScoreAggregates, conversationScores, failures);
        // Evaluate success
        const { passed } = (0, index_js_1.evaluateSuccess)(compositeScore, stepState.completedSteps, failures, scenario.successCriteria);
        const endTime = Date.now();
        return {
            scenario,
            turns,
            totalTurns: turns.length,
            finalStepState: stepState,
            allEvents,
            failures,
            turnScoreAggregates,
            conversationScores,
            compositeScore,
            passed,
            executionMetadata: {
                startTime,
                endTime,
                totalDurationMs: endTime - startTime,
                averageLatencyMs: turns.length > 0
                    ? turns.reduce((sum, t) => sum + t.latencyMs, 0) / turns.length
                    : 0,
                totalTokensUsed: turns.reduce((sum, t) => sum + t.tokenCounts.totalContextTokens, 0),
                modelUsed: this.config.agentModel,
                promptVersion: this.config.promptVersion,
            },
        };
    }
    /**
     * Get response from MPA agent
     */
    async getAgentResponse(systemPrompt, messageHistory, kbContent) {
        // Inject KB content into system prompt
        const fullSystemPrompt = kbContent
            ? `${systemPrompt}\n\n=== KNOWLEDGE BASE CONTEXT ===\n${kbContent}`
            : systemPrompt;
        // Handle empty message history (opening greeting)
        const messages = messageHistory.length > 0
            ? messageHistory
            : [{ role: "user", content: "Hello, I need help with media planning." }];
        const response = await this.anthropic.messages.create({
            model: this.config.agentModel,
            max_tokens: this.config.agentMaxTokens,
            temperature: this.config.agentTemperature,
            system: fullSystemPrompt,
            messages,
        });
        const textBlock = response.content.find((block) => block.type === "text");
        return {
            response: textBlock?.text || "",
            tokenCounts: {
                userTokens: response.usage?.input_tokens || 0,
                agentTokens: response.usage?.output_tokens || 0,
                kbTokens: Math.round(kbContent.length / 4), // Rough estimate
                totalContextTokens: (response.usage?.input_tokens || 0) +
                    (response.usage?.output_tokens || 0),
            },
        };
    }
    /**
     * Detect events from turn
     */
    detectEvents(turnNumber, userResponse, agentResponse, stepState, previousTurns) {
        const events = [];
        // IDK Protocol event
        if (userResponse.saidIDontKnow) {
            events.push({
                type: "idk_protocol",
                turnNumber,
                data: { userSaidIDK: true },
                severity: "info",
            });
        }
        // Calculation performed
        if (/\$[\d,]+\s*(?:\/|÷|divided by)/i.test(agentResponse) ||
            /=\s*\$?[\d,]+/i.test(agentResponse) ||
            /\$[\d,]+\s*per\s*(customer|lead)/i.test(agentResponse)) {
            events.push({
                type: "calculation_performed",
                turnNumber,
                data: { calculation: true },
                severity: "info",
            });
        }
        // Benchmark cited
        if (/benchmark|typical|industry|market.*shows/i.test(agentResponse) &&
            /\d+%|\$[\d,]+/i.test(agentResponse)) {
            events.push({
                type: "benchmark_cited",
                turnNumber,
                data: { benchmarkCited: true },
                severity: "info",
            });
        }
        // Step transition
        if (previousTurns.length > 0) {
            const prevStep = previousTurns[previousTurns.length - 1].currentStep;
            if (stepState.currentStep !== prevStep) {
                events.push({
                    type: "step_transition",
                    turnNumber,
                    data: { from: prevStep, to: stepState.currentStep },
                    severity: "info",
                });
            }
        }
        // Step completion
        const stepData = stepState.collectedData[stepState.currentStep];
        if (stepData &&
            stepData.minimumViableMet &&
            stepData.completedAtTurn === turnNumber) {
            events.push({
                type: "step_completion",
                turnNumber,
                data: { step: stepState.currentStep },
                severity: "info",
            });
        }
        return events;
    }
    /**
     * Check if conversation is complete
     */
    isConversationComplete(stepState, scenario) {
        if (stepState.isTerminal)
            return true;
        // Check if all expected steps are complete
        const allExpectedComplete = scenario.expectedCompletedSteps.every((step) => stepState.completedSteps.includes(step));
        return allExpectedComplete;
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.ConversationEngine = ConversationEngine;
exports.default = ConversationEngine;
//# sourceMappingURL=conversation-engine.js.map