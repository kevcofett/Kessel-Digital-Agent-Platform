/**
 * Conversation Engine for Multi-Turn MPA Evaluation
 *
 * Orchestrates complete multi-turn conversations between
 * the simulated user and the MPA agent.
 */
import Anthropic from "@anthropic-ai/sdk";
import { UserSimulator } from "./user-simulator.js";
import { StepTracker } from "./step-tracker.js";
import { FailureDetector } from "./failure-detector.js";
import { KBInjector } from "./kb-injector.js";
import { scoreTurn, scoreConversation, calculateTurnAggregates, calculateCompositeScore, evaluateSuccess, } from "./scorers/index.js";
// Import MPA system prompt
import { MPA_SYSTEM_PROMPT } from "./mpa-prompt-content.js";
// Import RAG system
import { RetrievalEngine, ToolExecutor } from "./rag/index.js";
const DEFAULT_ENGINE_CONFIG = {
    agentModel: "claude-sonnet-4-20250514",
    simulatorModel: "claude-sonnet-4-20250514",
    agentTemperature: 0.7,
    agentMaxTokens: 1024,
    promptVersion: "v5_8_rag",
    systemPrompt: MPA_SYSTEM_PROMPT,
    verbose: false,
    useAgenticRAG: true,
};
/**
 * Conversation Engine - Orchestrates multi-turn conversations
 */
export class ConversationEngine {
    anthropic;
    userSimulator;
    stepTracker;
    failureDetector;
    kbInjector;
    config;
    ragEngine;
    toolExecutor;
    useAgenticRAG;
    constructor(config = {}) {
        this.config = { ...DEFAULT_ENGINE_CONFIG, ...config };
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.userSimulator = new UserSimulator({
            model: this.config.simulatorModel,
        });
        this.stepTracker = new StepTracker();
        this.failureDetector = new FailureDetector();
        this.kbInjector = new KBInjector();
        // Initialize RAG system
        this.ragEngine = new RetrievalEngine();
        this.toolExecutor = new ToolExecutor(this.ragEngine);
        this.useAgenticRAG = config.useAgenticRAG ?? true;
    }
    /**
     * Run a complete conversation for a scenario
     */
    async runConversation(scenario) {
        const startTime = Date.now();
        const turns = [];
        const allEvents = [];
        const failures = { warnings: [], major: [], critical: [] };
        // Initialize RAG engine if enabled
        if (this.useAgenticRAG) {
            try {
                await this.ragEngine.initialize();
            }
            catch (error) {
                console.warn('RAG initialization failed, falling back to static KB:', error);
                this.useAgenticRAG = false;
            }
        }
        // Reset failure detector for new conversation
        this.failureDetector.reset();
        // Reset user simulator's triggered data changes for new conversation
        this.userSimulator.resetTriggeredChanges();
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
            // Build conversation history from prior agent responses for acronym tracking
            const conversationHistory = turns.map(t => t.agentResponse).join("\n");
            // Build accumulated extracted data for feasibility validation
            // Combine all collected data points across steps
            const accumulatedData = {};
            for (const stepNum of Object.keys(stepState.collectedData)) {
                const stepData = stepState.collectedData[parseInt(stepNum)];
                Object.assign(accumulatedData, stepData.collectedDataPoints);
            }
            // Also include data from current turn
            Object.assign(accumulatedData, userResponse.revealedData);
            // Score this turn
            const turnScores = await scoreTurn(userResponse.message, agentResult.response, currentStep, stepState, scenario.persona.sophisticationLevel, "unknown", conversationHistory, accumulatedData, kbContent);
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
        const conversationScores = await scoreConversation(turns, scenario, allEvents, failures);
        // Calculate turn score aggregates
        const turnScoreAggregates = calculateTurnAggregates(turns.filter(t => t.turnScores));
        // Calculate composite score
        const compositeScore = calculateCompositeScore(turnScoreAggregates, conversationScores, failures);
        // Evaluate success
        const { passed } = evaluateSuccess(compositeScore, stepState.completedSteps, failures, scenario.successCriteria);
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
     * Get response from MPA agent with RAG tool support
     */
    async getAgentResponse(systemPrompt, messageHistory, kbContent) {
        // Inject base KB content into system prompt
        const fullSystemPrompt = kbContent
            ? `${systemPrompt}\n\n=== KNOWLEDGE BASE CONTEXT ===\n${kbContent}`
            : systemPrompt;
        // Handle empty message history (opening greeting)
        let messages = messageHistory.length > 0
            ? [...messageHistory]
            : [{ role: "user", content: "Hello, I need help with media planning." }];
        let finalResponse = "";
        let toolCallCount = 0;
        let allCitations = [];
        const maxToolCalls = 3; // Prevent infinite loops
        // Tool use loop
        while (toolCallCount < maxToolCalls) {
            const requestParams = {
                model: this.config.agentModel,
                max_tokens: this.config.agentMaxTokens,
                temperature: this.config.agentTemperature,
                system: fullSystemPrompt,
                messages,
            };
            // Add tools if agentic RAG is enabled
            if (this.useAgenticRAG) {
                requestParams.tools = this.toolExecutor.getToolDefinitions();
            }
            const response = await this.anthropic.messages.create(requestParams);
            // Extract text content (may exist alongside tool use)
            const textBlock = response.content.find((block) => block.type === "text");
            // Check for tool use
            const toolUseBlocks = response.content.filter((block) => block.type === "tool_use");
            // If no tool use or RAG disabled, we're done
            if (toolUseBlocks.length === 0 || !this.useAgenticRAG) {
                finalResponse = textBlock?.text || "";
                break;
            }
            // If response has ONLY tool use (no text), and stop_reason is end_turn,
            // we may need to get a final response after processing tools
            const hasTextContent = textBlock && textBlock.text.trim().length > 0;
            // Execute tools
            toolCallCount++;
            // Add assistant message with tool use (must have content)
            // The response.content always has at least the tool_use blocks
            messages.push({
                role: "assistant",
                content: response.content,
            });
            // Execute each tool and collect results
            const toolResults = [];
            for (const toolUse of toolUseBlocks) {
                const result = await this.toolExecutor.execute({
                    type: "tool_use",
                    id: toolUse.id,
                    name: toolUse.name,
                    input: toolUse.input,
                });
                allCitations.push(...result.citations);
                toolResults.push({
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    content: result.content || "No result", // Ensure non-empty content
                });
            }
            // Add tool results (must have at least one result with content)
            if (toolResults.length > 0) {
                messages.push({
                    role: "user",
                    content: toolResults,
                });
            }
            // If we had meaningful text content alongside tool use, save it
            // (the model may have provided a partial response while requesting tools)
            if (hasTextContent && !finalResponse) {
                finalResponse = textBlock.text;
            }
        }
        // Get last response if we hit tool call limit
        if (toolCallCount >= maxToolCalls && !finalResponse) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === "assistant" && Array.isArray(lastMsg.content)) {
                const textBlock = lastMsg.content.find((block) => typeof block === "object" && block.type === "text");
                finalResponse = textBlock?.text || "[Max tool calls reached]";
            }
        }
        // Ensure we never return an empty response (which would cause API errors in subsequent calls)
        if (!finalResponse || finalResponse.trim().length === 0) {
            finalResponse = "I understand. Let me continue with the media planning process.";
        }
        return {
            response: finalResponse,
            tokenCounts: {
                userTokens: 0, // Would need to accumulate from all responses
                agentTokens: 0,
                kbTokens: Math.round(kbContent.length / 4),
                totalContextTokens: 0,
            },
            toolCalls: toolCallCount,
            citations: [...new Set(allCitations)], // Deduplicate
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
export default ConversationEngine;
//# sourceMappingURL=conversation-engine.js.map