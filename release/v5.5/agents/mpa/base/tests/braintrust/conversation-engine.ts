/**
 * Conversation Engine for Multi-Turn MPA Evaluation
 *
 * Orchestrates complete multi-turn conversations between
 * the simulated user and the MPA agent.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  TestScenario,
  ConversationTurn,
  ConversationResult,
  ConversationEvent,
  StepTrackingState,
  FailureCondition,
  ConversationEngineConfig,
} from "./mpa-multi-turn-types.js";
import { UserSimulator } from "./user-simulator.js";
import { StepTracker } from "./step-tracker.js";
import { FailureDetector } from "./failure-detector.js";
import { KBInjector } from "./kb-injector.js";
import {
  scoreTurn,
  scoreConversation,
  calculateTurnAggregates,
  calculateCompositeScore,
  evaluateSuccess,
} from "./scorers/index.js";

// Import MPA system prompt
import { MPA_SYSTEM_PROMPT } from "./mpa-prompt-content.js";

const DEFAULT_ENGINE_CONFIG: ConversationEngineConfig = {
  agentModel: "claude-sonnet-4-20250514",
  simulatorModel: "claude-sonnet-4-20250514",
  agentTemperature: 0.7,
  agentMaxTokens: 1024,
  promptVersion: "v5_7_5",
  systemPrompt: MPA_SYSTEM_PROMPT,
  verbose: false,
};

/**
 * Conversation Engine - Orchestrates multi-turn conversations
 */
export class ConversationEngine {
  private anthropic: Anthropic;
  private userSimulator: UserSimulator;
  private stepTracker: StepTracker;
  private failureDetector: FailureDetector;
  private kbInjector: KBInjector;
  private config: ConversationEngineConfig;

  constructor(config: Partial<ConversationEngineConfig> = {}) {
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
  }

  /**
   * Run a complete conversation for a scenario
   */
  async runConversation(scenario: TestScenario): Promise<ConversationResult> {
    const startTime = Date.now();
    const turns: ConversationTurn[] = [];
    const allEvents: ConversationEvent[] = [];
    const failures: {
      warnings: FailureCondition[];
      major: FailureCondition[];
      critical: FailureCondition[];
    } = { warnings: [], major: [], critical: [] };

    // Reset failure detector for new conversation
    this.failureDetector.reset();

    // Initialize step tracking state
    let stepState = this.stepTracker.initializeState();

    // Build message history for agent context
    const messageHistory: Anthropic.MessageParam[] = [];

    let turnNumber = 0;
    let shouldContinue = true;

    // Get initial KB content for step 1
    const initialKB = await this.kbInjector.getKBStringForStep(
      1,
      scenario.kbInjectionMap
    );

    // Get the agent's opening greeting
    const openingResult = await this.getAgentResponse(
      this.config.systemPrompt,
      [],
      initialKB
    );

    if (this.config.verbose) {
      console.log(
        `[Opening] Agent: ${openingResult.response.slice(0, 100)}...`
      );
    }

    // Main conversation loop
    while (shouldContinue && turnNumber < scenario.maxTurns) {
      turnNumber++;
      const turnStart = Date.now();

      // Determine which agent message to respond to
      const agentMessageToRespond =
        turnNumber === 1
          ? openingResult.response
          : turns[turns.length - 1].agentResponse;

      // Get user response
      const userResponse = await this.userSimulator.generateResponse(
        scenario.persona,
        agentMessageToRespond,
        turns,
        turnNumber === 1 ? scenario.openingMessage : undefined
      );

      if (this.config.verbose) {
        console.log(`[Turn ${turnNumber}] User: ${userResponse.message}`);
      }

      // Add user message to history
      messageHistory.push({
        role: "user",
        content: userResponse.message,
      });

      // Detect current step
      const currentStep = this.stepTracker.detectCurrentStep(
        userResponse.message,
        agentMessageToRespond,
        stepState
      );

      // Get KB content for current step
      const kbContent = await this.kbInjector.getKBStringForStep(
        currentStep,
        scenario.kbInjectionMap
      );
      const kbFiles = this.kbInjector.getKBFilesForStep(currentStep);

      // Get agent response
      const agentResult = await this.getAgentResponse(
        this.config.systemPrompt,
        messageHistory,
        kbContent
      );

      // Add agent response to history
      messageHistory.push({
        role: "assistant",
        content: agentResult.response,
      });

      if (this.config.verbose) {
        console.log(
          `[Turn ${turnNumber}] Agent: ${agentResult.response.slice(0, 100)}...`
        );
      }

      // Update step state
      stepState = this.stepTracker.updateState(
        stepState,
        userResponse.message,
        agentResult.response,
        userResponse.revealedData,
        turnNumber
      );

      // Detect events
      const events = this.detectEvents(
        turnNumber,
        userResponse,
        agentResult.response,
        stepState,
        turns
      );
      allEvents.push(...events);

      // Detect failures
      const detectedFailures = this.failureDetector.detectFailures(
        turnNumber,
        agentResult.response,
        turns,
        scenario.failureConditions,
        currentStep,
        userResponse.saidIDontKnow
      );

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
      const turnScores = await scoreTurn(
        userResponse.message,
        agentResult.response,
        currentStep,
        stepState,
        scenario.persona.sophisticationLevel
      );

      // Create turn record
      const turn: ConversationTurn = {
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
    const conversationScores = await scoreConversation(
      turns,
      scenario,
      allEvents,
      failures
    );

    // Calculate turn score aggregates
    const turnScoreAggregates = calculateTurnAggregates(turns);

    // Calculate composite score
    const compositeScore = calculateCompositeScore(
      turnScoreAggregates,
      conversationScores,
      failures
    );

    // Evaluate success
    const { passed } = evaluateSuccess(
      compositeScore,
      stepState.completedSteps,
      failures,
      scenario.successCriteria
    );

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
        averageLatencyMs:
          turns.length > 0
            ? turns.reduce((sum, t) => sum + t.latencyMs, 0) / turns.length
            : 0,
        totalTokensUsed: turns.reduce(
          (sum, t) => sum + t.tokenCounts.totalContextTokens,
          0
        ),
        modelUsed: this.config.agentModel,
        promptVersion: this.config.promptVersion,
      },
    };
  }

  /**
   * Get response from MPA agent
   */
  private async getAgentResponse(
    systemPrompt: string,
    messageHistory: Anthropic.MessageParam[],
    kbContent: string
  ): Promise<{
    response: string;
    tokenCounts: ConversationTurn["tokenCounts"];
  }> {
    // Inject KB content into system prompt
    const fullSystemPrompt = kbContent
      ? `${systemPrompt}\n\n=== KNOWLEDGE BASE CONTEXT ===\n${kbContent}`
      : systemPrompt;

    // Handle empty message history (opening greeting)
    const messages =
      messageHistory.length > 0
        ? messageHistory
        : [{ role: "user" as const, content: "Hello, I need help with media planning." }];

    const response = await this.anthropic.messages.create({
      model: this.config.agentModel,
      max_tokens: this.config.agentMaxTokens,
      temperature: this.config.agentTemperature,
      system: fullSystemPrompt,
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");

    return {
      response: (textBlock as Anthropic.TextBlock)?.text || "",
      tokenCounts: {
        userTokens: response.usage?.input_tokens || 0,
        agentTokens: response.usage?.output_tokens || 0,
        kbTokens: Math.round(kbContent.length / 4), // Rough estimate
        totalContextTokens:
          (response.usage?.input_tokens || 0) +
          (response.usage?.output_tokens || 0),
      },
    };
  }

  /**
   * Detect events from turn
   */
  private detectEvents(
    turnNumber: number,
    userResponse: {
      saidIDontKnow: boolean;
      triedToSkip: boolean;
      pushedBack: boolean;
    },
    agentResponse: string,
    stepState: StepTrackingState,
    previousTurns: ConversationTurn[]
  ): ConversationEvent[] {
    const events: ConversationEvent[] = [];

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
    if (
      /\$[\d,]+\s*(?:\/|÷|divided by)/i.test(agentResponse) ||
      /=\s*\$?[\d,]+/i.test(agentResponse) ||
      /\$[\d,]+\s*per\s*(customer|lead)/i.test(agentResponse)
    ) {
      events.push({
        type: "calculation_performed",
        turnNumber,
        data: { calculation: true },
        severity: "info",
      });
    }

    // Benchmark cited
    if (
      /benchmark|typical|industry|market.*shows/i.test(agentResponse) &&
      /\d+%|\$[\d,]+/i.test(agentResponse)
    ) {
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
    if (
      stepData &&
      stepData.minimumViableMet &&
      stepData.completedAtTurn === turnNumber
    ) {
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
  private isConversationComplete(
    stepState: StepTrackingState,
    scenario: TestScenario
  ): boolean {
    if (stepState.isTerminal) return true;

    // Check if all expected steps are complete
    const allExpectedComplete = scenario.expectedCompletedSteps.every((step) =>
      stepState.completedSteps.includes(step)
    );

    return allExpectedComplete;
  }

  /**
   * Get configuration
   */
  getConfig(): ConversationEngineConfig {
    return { ...this.config };
  }
}

export default ConversationEngine;
