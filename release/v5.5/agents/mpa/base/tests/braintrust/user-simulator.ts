/**
 * User Simulator for Multi-Turn MPA Evaluation
 *
 * Simulates realistic user behavior based on defined personas.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  UserPersona,
  ConversationTurn,
  UserSimulatorResponse,
  UserSimulatorConfig,
  DataChange,
} from "./mpa-multi-turn-types.js";

const DEFAULT_CONFIG: UserSimulatorConfig = {
  model: "claude-sonnet-4-20250514",
  temperature: 0.8, // Slightly higher for natural variation
  maxTokens: 256, // User responses should be concise
};

/**
 * Build the user simulator system prompt
 */
function buildUserSimulatorPrompt(persona: UserPersona): string {
  return `You are simulating a user in a conversation with a Media Planning Agent (MPA). You must respond as if you ARE this person, not as an AI.

=== YOUR PERSONA ===

Name: ${persona.name}
${persona.title ? `Title: ${persona.title}` : ""}
${persona.company ? `Company: ${persona.company}` : ""}
Sophistication Level: ${persona.sophisticationLevel}
Industry: ${persona.industry}

=== YOUR KNOWLEDGE ===

Budget Information: ${persona.knownData.hasBudget ? `$${persona.knownData.budget?.toLocaleString()}` : "You don't know the exact budget yet"}
Volume Targets: ${persona.knownData.hasVolumeTarget ? `${persona.knownData.volumeTarget?.toLocaleString()} ${persona.knownData.volumeType}` : "You haven't finalized targets"}
Unit Economics: ${persona.knownData.hasUnitEconomics ? `LTV: $${persona.knownData.ltv}, CAC: $${persona.knownData.cac}, Margin: ${(persona.knownData.contributionMargin || 0) * 100}%` : "You don't know your unit economics well"}
Audience: ${persona.knownData.hasAudienceDefinition ? persona.knownData.audienceDescription : "You have a general sense but nothing precise"}
Geography: ${persona.knownData.hasGeography ? persona.knownData.geography?.join(", ") : "Primarily US but open to discussion"}
Channel Preferences: ${persona.knownData.hasChannelPreferences ? persona.knownData.preferredChannels?.join(", ") : "No strong preferences yet"}

=== YOUR COMMUNICATION STYLE ===

Verbosity: ${persona.behavioralTraits.responseVerbosity}
${persona.languagePatterns.usesJargon ? "You are comfortable using marketing jargon." : "You prefer plain language and may not know all marketing terms."}
${(persona.languagePatterns.knownAcronyms || []).length > 0 ? `Acronyms you know: ${(persona.languagePatterns.knownAcronyms || []).join(", ")}` : "You don't use many acronyms."}

Example phrases you might use:
${persona.languagePatterns.samplePhrases.map((p) => `- "${p}"`).join("\n")}

=== YOUR BEHAVIORAL PATTERNS ===

When asked about something you don't know:
${
  persona.behavioralTraits.uncertaintyFrequency === "often"
    ? "You frequently admit you don't know things. Say 'I don't know' or 'I'm not sure' when asked about data you don't have."
    : persona.behavioralTraits.uncertaintyFrequency === "sometimes"
      ? "You occasionally admit uncertainty when you genuinely don't have the information."
      : persona.behavioralTraits.uncertaintyFrequency === "rare"
        ? "You try to give your best guess, rarely saying 'I don't know'."
        : "You always try to provide an answer, even if uncertain."
}

When the agent makes recommendations:
${
  persona.behavioralTraits.challengeFrequency === "often"
    ? "You often push back and ask 'why' or express skepticism."
    : persona.behavioralTraits.challengeFrequency === "sometimes"
      ? "You occasionally question recommendations."
      : "You generally accept recommendations without much pushback."
}

Conversation flow:
${
  persona.behavioralTraits.stepSkipTendency === "frequent_skip"
    ? "You often want to jump ahead to channel selection or tactics."
    : persona.behavioralTraits.stepSkipTendency === "occasional_skip"
      ? "You sometimes mention channels or tactics before the agent gets there."
      : "You follow the agent's lead on conversation structure."
}

=== RESPONSE RULES ===

1. Respond ONLY as the user would respond. Do not explain your reasoning.
2. Keep responses ${
    persona.behavioralTraits.responseVerbosity === "terse"
      ? "very short (1-2 sentences)"
      : persona.behavioralTraits.responseVerbosity === "verbose"
        ? "detailed (3-5 sentences)"
        : "moderate length (2-3 sentences)"
  }.
3. Answer the agent's question directly.
4. If you don't have information the agent asks for (based on your knowledge above), ${
    persona.behavioralTraits.uncertaintyFrequency === "often"
      ? 'say "I don\'t know" or "I\'m not sure"'
      : persona.behavioralTraits.uncertaintyFrequency === "sometimes"
        ? "sometimes admit uncertainty"
        : "try to give your best guess"
  }
5. Stay in character throughout the conversation.
6. DO NOT break character or explain that you are simulating.
7. DO NOT say things like "As [name], I would say..." - just respond directly.

=== OUTPUT FORMAT ===

Respond with ONLY what the user would say. No explanations, no meta-commentary.`;
}

/**
 * Build context from conversation history
 */
function buildConversationContext(turns: ConversationTurn[]): string {
  if (turns.length === 0) return "";

  const contextLines: string[] = ["=== CONVERSATION SO FAR ==="];

  for (const turn of turns) {
    contextLines.push(`User: ${turn.userMessage}`);
    contextLines.push(`Agent: ${turn.agentResponse}`);
    contextLines.push("");
  }

  return contextLines.join("\n");
}

/**
 * Parse user response for metadata extraction
 */
function parseUserResponse(
  response: string,
  persona: UserPersona
): UserSimulatorResponse {
  const lowerResponse = response.toLowerCase();

  // Detect "I don't know" patterns
  const saidIDontKnow =
    /i don'?t know|not sure|no idea|uncertain|haven'?t figured|don'?t have that (data|number|info)/i.test(
      lowerResponse
    );

  // Detect skip-ahead attempts (mentions channels, tactics before step 7)
  const triedToSkip =
    /should we use|what about|can we do|facebook|google|tiktok|instagram|linkedin|programmatic|let'?s talk about channels/i.test(
      lowerResponse
    );

  // Detect pushback
  const pushedBack =
    /why|are you sure|i disagree|that seems|really\?|i thought|but what about|i'm not convinced/i.test(
      lowerResponse
    );

  // Extract revealed data
  const revealedData: Record<string, unknown> = {};

  // Budget patterns
  const budgetMatch = response.match(
    /\$?([\d,]+)\s*(k|K|thousand|million|M)?\s*(?:budget|spend|total)?/i
  );
  if (budgetMatch) {
    let value = parseFloat(budgetMatch[1].replace(/,/g, ""));
    if (/k|K|thousand/i.test(budgetMatch[2] || "")) value *= 1000;
    if (/million|M/i.test(budgetMatch[2] || "")) value *= 1000000;
    if (value > 1000) {
      // Only capture if it looks like a real budget
      revealedData.budget = value;
    }
  }

  // Volume patterns
  const volumeMatch = response.match(
    /([\d,]+)\s*(customers?|leads?|users?|transactions?|conversions?)/i
  );
  if (volumeMatch) {
    revealedData.volumeTarget = parseInt(volumeMatch[1].replace(/,/g, ""));
    revealedData.volumeType = volumeMatch[2].toLowerCase().replace(/s$/, "");
  }

  // LTV patterns
  const ltvMatch = response.match(
    /(?:ltv|lifetime value)[^\d]*\$?([\d,]+)/i
  );
  if (ltvMatch) {
    revealedData.ltv = parseFloat(ltvMatch[1].replace(/,/g, ""));
  }

  // CAC patterns
  const cacMatch = response.match(
    /(?:cac|acquisition cost|cost per customer)[^\d]*\$?([\d,]+)/i
  );
  if (cacMatch) {
    revealedData.cac = parseFloat(cacMatch[1].replace(/,/g, ""));
  }

  // Margin patterns
  const marginMatch = response.match(
    /(?:margin|contribution)[^\d]*([\d.]+)\s*%/i
  );
  if (marginMatch) {
    revealedData.contributionMargin = parseFloat(marginMatch[1]) / 100;
  }

  return {
    message: response.trim(),
    revealedData,
    saidIDontKnow,
    triedToSkip,
    pushedBack,
  };
}

/**
 * User Simulator class
 */
export class UserSimulator {
  private anthropic: Anthropic;
  private config: UserSimulatorConfig;

  constructor(config: Partial<UserSimulatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Check if a data change should be triggered at this turn
   */
  private checkForDataChange(
    turnNumber: number,
    agentMessage: string,
    dataChanges?: DataChange[]
  ): DataChange | null {
    if (!dataChanges || dataChanges.length === 0) return null;

    for (const change of dataChanges) {
      // Check turn-based trigger
      if (change.triggerTurn === turnNumber) {
        return change;
      }

      // Check condition-based trigger
      if (change.triggerCondition) {
        const regex = new RegExp(change.triggerCondition, "i");
        if (regex.test(agentMessage)) {
          return change;
        }
      }
    }

    return null;
  }

  /**
   * Generate the user's response to an agent message
   *
   * @param persona - The user persona to simulate
   * @param agentMessage - The agent's most recent message
   * @param conversationHistory - All previous turns
   * @param openingMessage - Optional specific opening message
   * @param dataChanges - Optional data changes to inject mid-conversation
   * @param currentTurn - Current turn number (for data change timing)
   */
  async generateResponse(
    persona: UserPersona,
    agentMessage: string,
    conversationHistory: ConversationTurn[],
    openingMessage?: string,
    dataChanges?: DataChange[],
    currentTurn?: number
  ): Promise<UserSimulatorResponse & { dataChangeTriggered?: DataChange }> {
    // If this is the first turn and we have a specific opening, use it
    if (conversationHistory.length === 0 && openingMessage) {
      return parseUserResponse(openingMessage, persona);
    }

    // Check if we should inject a data change at this turn
    const turnNum = currentTurn ?? conversationHistory.length + 1;
    const triggeredChange = this.checkForDataChange(
      turnNum,
      agentMessage,
      dataChanges
    );

    // If a data change is triggered, use its predefined message
    if (triggeredChange) {
      const response = parseUserResponse(triggeredChange.userMessage, persona);
      // Add the new value to revealed data
      response.revealedData[triggeredChange.field] = triggeredChange.newValue;
      return {
        ...response,
        dataChangeTriggered: triggeredChange,
      };
    }

    const systemPrompt = buildUserSimulatorPrompt(persona);
    const conversationContext = buildConversationContext(conversationHistory);

    const userPrompt = conversationContext
      ? `${conversationContext}\n\nThe agent just said:\n"${agentMessage}"\n\nHow do you respond?`
      : `The agent just said:\n"${agentMessage}"\n\nHow do you respond?`;

    const response = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const responseText =
      (textBlock as Anthropic.TextBlock)?.text || "";

    return parseUserResponse(responseText, persona);
  }

  /**
   * Generate a "goodbye" or conversation-ending response
   */
  async generateClosingResponse(
    persona: UserPersona,
    conversationHistory: ConversationTurn[]
  ): Promise<UserSimulatorResponse> {
    const closingPhrases = [
      "Thanks, this has been really helpful!",
      "Great, I think I have what I need to move forward.",
      "Perfect, let me digest all this and I'll reach out if I have questions.",
      "This is exactly what I needed. Thanks for walking me through it.",
    ];

    const message =
      closingPhrases[Math.floor(Math.random() * closingPhrases.length)];

    return {
      message,
      revealedData: {},
      saidIDontKnow: false,
      triedToSkip: false,
      pushedBack: false,
    };
  }
}

export { buildUserSimulatorPrompt, parseUserResponse };
