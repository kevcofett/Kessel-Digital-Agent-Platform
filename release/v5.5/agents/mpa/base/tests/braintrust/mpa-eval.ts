/**
 * MPA Evaluation Runner
 *
 * Runs the MPA prompt against test cases and scores with custom scorers.
 *
 * Usage:
 *   BRAINTRUST_API_KEY=xxx ANTHROPIC_API_KEY=xxx npx braintrust eval mpa-eval.ts
 */

import { Eval } from "braintrust";
import Anthropic from "@anthropic-ai/sdk";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load environment variables
config({ path: "/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env" });

// Load MPA instructions from file - default to v6.0
const INSTRUCTIONS_PATH = process.env.MPA_INSTRUCTIONS_PATH ||
  "/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/personal/instructions/MPA_Copilot_Instructions_v6_0.txt";

function loadInstructions(): string {
  try {
    return readFileSync(INSTRUCTIONS_PATH, "utf-8");
  } catch (error) {
    console.error(`Failed to load instructions from ${INSTRUCTIONS_PATH}:`, error);
    throw error;
  }
}

// Lazy initialization - only create client when needed
let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

// Load MPA instructions dynamically (defaults to v6.0)
const MPA_SYSTEM_PROMPT = loadInstructions();
console.log(`Loaded MPA instructions from: ${INSTRUCTIONS_PATH} (${MPA_SYSTEM_PROMPT.length} chars)`);

// KB Document: Adaptive Language Guide (for RAG simulation)
const KB_ADAPTIVE_LANGUAGE = `[KNOWLEDGE BASE DOCUMENT: ADAPTIVE LANGUAGE GUIDE]

DETECTING SOPHISTICATION LEVEL

SIMPLE USER SIGNALS

User demonstrates simple sophistication when their input contains everyday language without industry jargon, round numbers without precision, casual phrasing like want more customers or get sales, questions that reveal unfamiliarity with marketing concepts, or no mention of metrics like CAC ROAS LTV CPA.

Example simple inputs: We sell shoes online and want more customers. Budget is 100K. We need to run some ads. How do we get more people to buy.

SOPHISTICATED USER SIGNALS

User demonstrates high sophistication when their input contains industry terminology used correctly, specific metrics with context like LTV CAC ratio or contribution margin, unit economics discussion, precise numbers with business logic, or references to attribution incrementality or optimization.

Example sophisticated inputs: Our LTV CAC is 2.8x with 15 percent contribution margin. We need to hit 75 dollar CAC to maintain unit economics at scale. Current blended ROAS is 3.2 but we suspect platform inflation.

RESPONDING TO SIMPLE USERS

LANGUAGE RULES FOR SIMPLE USERS

Use everyday words instead of jargon. Say cost per customer not CAC. Say return on ad spend not ROAS. Say customer value not LTV. Say how much you can spend to get a customer not acquisition efficiency.

Define any technical term before using it. Example: Your cost per customer, meaning how much you spend in ads to get one new buyer, would be 50 dollars.

Keep explanations concrete with examples. Instead of: This affects your unit economics. Say: If you spend 50 dollars to get a customer who only spends 40 dollars, you lose money on each sale.

Ask questions in plain terms. Instead of: What is your target CAC. Say: How much can you afford to spend to get one new customer.

EXAMPLE SIMPLE USER EXCHANGE

User: We sell shoes online and want more customers. Budget is 100K.

Response: Great, 100K gives us solid capacity to bring in new shoe buyers. To make sure we spend it wisely, I have one key question. How much is a typical customer worth to you over time. For example, does the average customer buy once for 80 dollars, or do they come back and spend 200 dollars over a year. This helps us figure out how much we can afford to spend to win each customer.

RESPONDING TO SOPHISTICATED USERS

LANGUAGE RULES FOR SOPHISTICATED USERS

Match their vocabulary. If they say CAC, say CAC. If they discuss contribution margin, engage at that level.

Skip basic definitions. Do not explain what LTV means to someone who just quoted their LTV CAC ratio.

Engage with their framework. If they mention unit economics, respond in unit economics terms.

Challenge and refine at their level. Example: Your 2.8x LTV CAC is healthy, but at 15 percent contribution margin, you need roughly 7x payback on ad spend to break even. Are you seeing that in your current mix.

EXAMPLE SOPHISTICATED USER EXCHANGE

User: Our LTV CAC is currently 2.8x with 15 percent contribution margin. We need to hit 75 dollar CAC to maintain unit economics at scale.

Response: At 2.8x LTV CAC with 15 percent contribution, your effective payback is around 42 percent of LTV, which is tight but workable. The 75 dollar CAC ceiling makes sense. What is your current blended CAC running, and where do you see the most efficiency headroom. Are there channels where you are significantly below 75 that could absorb more spend, or is the constraint more about scale than efficiency.

DEFAULT BEHAVIOR

When sophistication level is unclear, default to simpler language. Users will signal if they want more technical depth.

[END KNOWLEDGE BASE DOCUMENT]`;

// Test cases
const testCases = [
  {
    name: "Step 1 - Initial Brief (Uniteller)",
    input: {
      message: "We're Uniteller, a remittance company. We have $250,000 to spend on media and want to acquire new customers who will send money to Latin America.",
      context: "First interaction, no prior conversation",
    },
    expected: {
      behaviors: [
        "Acknowledges remittance/Uniteller context",
        "Asks about success metrics or KPIs",
        "Does NOT ask multiple questions",
        "Does NOT discuss channels yet"
      ],
    },
    metadata: { currentStep: 1, hasEnoughDataToModel: false },
  },
  {
    name: "Step 1 - KPI Confirmation",
    input: {
      message: "We want to acquire 5,000 new customers",
      context: "Previous: Uniteller, $250k budget, Latin America remittance",
    },
    expected: {
      behaviors: [
        "Acknowledges the 5,000 customer target",
        "May calculate implied CAC ($50)",
        "Confirms Step 1 complete or asks one clarifying question",
        "Does NOT repeat greeting"
      ],
    },
    metadata: { currentStep: 1, hasEnoughDataToModel: true },
  },
  {
    name: "Step 2 - I Don't Know (LTV/Profit)",
    input: {
      message: "I don't know what our profit per customer is",
      context: "Previous: 5,000 customers, $50 CAC, remittance company",
    },
    expected: {
      behaviors: [
        "Models using industry benchmark assumption",
        "Cites a source for the assumption",
        "Offers to refine later",
        "Moves on to next question",
        "Does NOT keep asking about profit"
      ],
    },
    metadata: { currentStep: 2, hasEnoughDataToModel: true },
  },
  {
    name: "Step 2 - Remittance Volume Target",
    input: {
      message: "We want to generate $2,100 in revenue per customer over their first year",
      context: "Previous: $250k budget, 5,000 customer target, remittance",
    },
    expected: {
      behaviors: [
        "Calculates implied efficiency (budget / customers)",
        "Shows math explicitly",
        "Compares to benchmarks with source",
        "Assesses if target is achievable",
        "Does NOT ask for CAC (can compute from budget/volume)"
      ],
    },
    metadata: { currentStep: 2, hasEnoughDataToModel: true },
  },
  {
    name: "Sophisticated User - Tech Jargon",
    input: {
      message: "Our LTV:CAC is currently 2.8x with 15% contribution margin. We need to hit $75 CAC to maintain unit economics at scale.",
      context: "First interaction with sophisticated user",
    },
    expected: {
      behaviors: [
        "Matches sophisticated language level",
        "Engages with unit economics concepts",
        "Does NOT over-simplify terminology",
        "Asks relevant follow-up at same complexity level"
      ],
    },
    metadata: { currentStep: 2, userSophistication: "high" },
  },
  {
    name: "Simple User - Basic Language",
    input: {
      message: "We sell shoes online and want more customers. Budget is $100k.",
      context: "First interaction with basic user",
    },
    expected: {
      behaviors: [
        "Uses simple, everyday language",
        "Avoids jargon like CAC, ROAS unless defined",
        "Asks about customer goals in plain terms",
        "Warm, approachable tone"
      ],
    },
    metadata: { currentStep: 1, userSophistication: "low" },
  },
];

// Task function: call the MPA agent
async function runMPA(input: { message: string; context?: string }, kbContent?: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [];

  // Build system prompt with optional KB content (RAG simulation)
  const systemPrompt = kbContent
    ? MPA_SYSTEM_PROMPT + "\n\n" + kbContent
    : MPA_SYSTEM_PROMPT;

  // Add context as prior assistant message if provided
  if (input.context) {
    messages.push({
      role: "assistant",
      content: `[Context from conversation: ${input.context}]`,
    });
  }

  messages.push({
    role: "user",
    content: input.message,
  });

  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text || "";
}

// Scorers
function scoreResponseLength(output: string): { score: number; metadata: Record<string, unknown> } {
  const wordCount = output.trim().split(/\s+/).length;
  if (wordCount <= 75) return { score: 1.0, metadata: { wordCount, status: "optimal" } };
  if (wordCount <= 150) return { score: 0.5, metadata: { wordCount, status: "acceptable" } };
  return { score: 0, metadata: { wordCount, status: "too_long" } };
}

function scoreSingleQuestion(output: string): { score: number; metadata: Record<string, unknown> } {
  const questionMarks = (output.match(/\?/g) || []).length;
  if (questionMarks <= 1) return { score: 1.0, metadata: { questionCount: questionMarks } };
  return { score: 0, metadata: { questionCount: questionMarks, status: "multiple_questions" } };
}

function scoreIdkProtocol(input: string, output: string): { score: number; metadata: Record<string, unknown> } {
  const userSaysIDK = /i don'?t know|not sure|no idea|uncertain/i.test(input);

  if (!userSaysIDK) {
    return { score: 1.0, metadata: { status: "not_applicable" } };
  }

  const modelsAssumption = /i('ll| will) (model|use|assume)|based on|using.*benchmark/i.test(output);
  const citesSource = /based on (kb|benchmark|industry|research)/i.test(output);
  const offersRefinement = /(you can|feel free to|adjust|refine) (this |it )?anytime/i.test(output);
  const movesOn = /moving on|next|let'?s/i.test(output);
  const keepsPushing = /what is your|can you tell|do you have|please provide/i.test(output);

  let score = 0;
  if (modelsAssumption) score += 0.3;
  if (citesSource) score += 0.3;
  if (offersRefinement) score += 0.2;
  if (movesOn) score += 0.2;
  if (keepsPushing) score -= 0.5;

  return {
    score: Math.max(0, Math.min(1, score)),
    metadata: { modelsAssumption, citesSource, offersRefinement, movesOn, keepsPushing }
  };
}

function scoreStepBoundary(output: string, currentStep: number): { score: number; metadata: Record<string, unknown> } {
  if (currentStep > 2) {
    return { score: 1.0, metadata: { status: "not_applicable" } };
  }

  const forbiddenPatterns = [
    /\b(pacing|flighting)\b/i,
    /\b(channel mix|media mix)\b/i,
    /\b(facebook ads|google ads|tiktok|instagram)\b/i,
    /\b(programmatic|display|video)\b/i,
  ];

  const violations = forbiddenPatterns.filter((p) => p.test(output));
  return {
    score: violations.length === 0 ? 1.0 : 0,
    metadata: { currentStep, violationCount: violations.length }
  };
}

async function scoreProgressOverPerfection(input: string, output: string): Promise<{ score: number; metadata: Record<string, unknown> }> {
  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 100,
    messages: [{
      role: "user",
      content: `Rate this agent response for "Progress Over Perfection" - does it keep momentum vs getting stuck in refinement?

USER INPUT: "${input}"
AGENT OUTPUT: "${output}"

Score A-F where:
A = Excellent momentum, makes progress with clear assumptions
B = Good progress but could be more decisive
C = Sometimes gets stuck seeking perfect data
D = Frequently blocks progress
F = Completely stalls with endless questions

Reply with ONLY a single letter: A, B, C, D, or F`,
    }],
  });

  const letter = (response.content[0] as Anthropic.TextBlock).text.trim().toUpperCase();
  const scores: Record<string, number> = { A: 1.0, B: 0.8, C: 0.5, D: 0.2, F: 0 };
  return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}

async function scoreAdaptiveSophistication(input: string, output: string): Promise<{ score: number; metadata: Record<string, unknown> }> {
  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 100,
    messages: [{
      role: "user",
      content: `Rate if the agent matches language complexity to user sophistication.

USER INPUT: "${input}"
AGENT OUTPUT: "${output}"

Score A-F where:
A = Perfectly matches user sophistication level
B = Mostly matches but occasional mismatch
C = Sometimes mismatches complexity
D = Consistently wrong complexity level
F = Completely ignores user signals

Reply with ONLY a single letter: A, B, C, D, or F`,
    }],
  });

  const letter = (response.content[0] as Anthropic.TextBlock).text.trim().toUpperCase();
  const scores: Record<string, number> = { A: 1.0, B: 0.8, C: 0.6, D: 0.3, F: 0 };
  return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}

async function scoreProactiveIntelligence(input: string, output: string, hasEnoughData: boolean): Promise<{ score: number; metadata: Record<string, unknown> }> {
  if (!hasEnoughData) {
    return { score: 1.0, metadata: { status: "not_applicable" } };
  }

  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 100,
    messages: [{
      role: "user",
      content: `Rate if the agent shows proactive analysis vs just asking questions.

USER INPUT: "${input}"
AGENT OUTPUT: "${output}"

The agent has enough data to model. Does it DO THE MATH and guide with analysis?

Score A-F where:
A = Proactively calculates, shows math, guides with analysis
B = Shows some analysis but could do more
C = Asks questions when should be modeling
D = Only interrogates without analysis
F = Fails to leverage available data

Reply with ONLY a single letter: A, B, C, D, or F`,
    }],
  });

  const letter = (response.content[0] as Anthropic.TextBlock).text.trim().toUpperCase();
  const scores: Record<string, number> = { A: 1.0, B: 0.8, C: 0.5, D: 0.2, F: 0 };
  return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}

// Additional code-based scorers (matching local test runner)

function scoreAcronymDefinition(output: string): { score: number; metadata: Record<string, unknown> } {
  const acronyms = ["CAC", "ROAS", "LTV", "CPM", "CPA", "CPC", "CTR", "CVR", "AOV", "MQL", "SQL"];
  const definitions: Record<string, RegExp> = {
    "CAC": /[Cc]ustomer [Aa]cquisition [Cc]ost/,
    "ROAS": /[Rr]eturn [Oo]n [Aa]d [Ss]pend/,
    "LTV": /[Ll]ifetime [Vv]alue/,
    "CPM": /[Cc]ost [Pp]er ([Tt]housand|[Mm]ille)/,
    "CPA": /[Cc]ost [Pp]er [Aa]cquisition/,
  };

  const used: string[] = [];
  const undefined_acronyms: string[] = [];

  for (const acronym of acronyms) {
    if (new RegExp(`\\b${acronym}\\b`).test(output)) {
      used.push(acronym);
      if (definitions[acronym] && !definitions[acronym].test(output)) {
        undefined_acronyms.push(acronym);
      }
    }
  }

  if (used.length === 0) {
    return { score: 1.0, metadata: { used: [], undefined: [], status: "no_acronyms" } };
  }

  const score = 1.0 - (undefined_acronyms.length / used.length);
  return { score, metadata: { used, undefined: undefined_acronyms } };
}

function scoreSourceCitation(output: string): { score: number; metadata: Record<string, unknown> } {
  const hasNumbers = /\$[\d,]+|\d+%|\d+\s*(dollars|percent|customers|users)/i.test(output);

  if (!hasNumbers) {
    return { score: 1.0, metadata: { hasData: false, status: "no_data_claims" } };
  }

  const sourcePatterns = [
    /based on your input/i,
    /based on (kb|knowledge base)/i,
    /based on web search/i,
    /based on.*research/i,
    /my estimate/i,
    /i searched/i,
    /according to/i,
  ];

  const hasSource = sourcePatterns.some(pattern => pattern.test(output));
  return { score: hasSource ? 1.0 : 0, metadata: { hasData: true, hasSource } };
}

function scoreFeasibilityFraming(output: string): { score: number; metadata: Record<string, unknown> } {
  const hasAssessment = /aggressive|ambitious|challenging|conservative|typical|realistic/i.test(output);
  const hasSource = /based on|benchmark|typical.*range|industry/i.test(output);
  const hasPath = /to (hit|achieve|reach)|you.ll need|requires/i.test(output);

  let score = 0;
  if (hasAssessment) score += 0.4;
  if (hasSource) score += 0.4;
  if (hasPath) score += 0.2;

  return { score, metadata: { hasAssessment, hasSource, hasPath } };
}

async function scoreTone(output: string): Promise<{ score: number; metadata: Record<string, unknown> }> {
  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 100,
    messages: [{
      role: "user",
      content: `Rate this agent's tone for being warm, collegial, and supportive (like a sharp colleague):

AGENT OUTPUT: "${output}"

Score A-F where:
A = Perfect tone: warm, collegial, like a sharp colleague who wants them to win
B = Good tone with minor issues
C = Acceptable but mechanical or overly formal
D = Cold, distant, or condescending
F = Clearly inappropriate tone

Reply with ONLY a single letter: A, B, C, D, or F`,
    }],
  });

  const letter = (response.content[0] as Anthropic.TextBlock).text.trim().toUpperCase();
  const scores: Record<string, number> = { A: 1.0, B: 0.8, C: 0.6, D: 0.3, F: 0 };
  return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}

async function scoreStepCompletion(input: string, output: string): Promise<{ score: number; metadata: Record<string, unknown> }> {
  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 100,
    messages: [{
      role: "user",
      content: `Rate if the agent knows when a step is complete and moves on appropriately.

USER INPUT: "${input}"
AGENT OUTPUT: "${output}"

Score A-F where:
A = Correctly identifies step completion and transitions
B = Mostly correct but asks one unnecessary follow-up
C = Over-asks but eventually moves on
D = Significantly over-refines before moving on
F = Fails to recognize when step is complete

Reply with ONLY a single letter: A, B, C, D, or F`,
    }],
  });

  const letter = (response.content[0] as Anthropic.TextBlock).text.trim().toUpperCase();
  const scores: Record<string, number> = { A: 1.0, B: 0.8, C: 0.5, D: 0.2, F: 0 };
  return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}

async function scoreSelfReferentialLearning(input: string, output: string): Promise<{ score: number; metadata: Record<string, unknown> }> {
  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 100,
    messages: [{
      role: "user",
      content: `Rate if the agent references earlier conversation context accurately.

USER INPUT: "${input}"
AGENT OUTPUT: "${output}"

Score A-F where:
A = Perfectly references and builds on prior context
B = Good context retention with minor gaps
C = Some context referenced but misses key points
D = Poor context retention, makes user repeat info
F = Ignores prior context completely

Reply with ONLY a single letter: A, B, C, D, or F`,
    }],
  });

  const letter = (response.content[0] as Anthropic.TextBlock).text.trim().toUpperCase();
  const scores: Record<string, number> = { A: 1.0, B: 0.8, C: 0.5, D: 0.2, F: 0 };
  return { score: scores[letter] ?? 0.5, metadata: { grade: letter } };
}

function scoreRagRetrieval(output: string): { score: number; metadata: Record<string, unknown> } {
  // Check if response references KB content appropriately
  const hasKBReference = /based on (knowledge base|kb)|according to kb|kb (data|benchmarks|documents)/i.test(output);
  const hasSpecificData = /\$[\d,]+|\d+%|\d+x/i.test(output);
  const hasBenchmarks = /benchmark|typical|range|industry average/i.test(output);

  let score = 0;
  if (hasKBReference) score += 0.5;
  if (hasSpecificData) score += 0.25;
  if (hasBenchmarks) score += 0.25;

  return { score, metadata: { hasKBReference, hasSpecificData, hasBenchmarks } };
}

// Main evaluation
const versionMatch = INSTRUCTIONS_PATH.match(/v5_(\d+)/);
const versionStr = versionMatch ? `v5.${versionMatch[1]}` : "v5.x";

Eval("Kessel-MPA-Agent", {
  experimentName: `MPA ${versionStr} Eval - ${new Date().toISOString()}`,
  data: () => testCases.map((tc) => ({
    input: tc.input,
    expected: tc.expected,
    metadata: tc.metadata,
  })) as any,
  task: async (input: any, hooks: any) => {
    // Simulate RAG: inject KB content for test cases with userSophistication metadata
    const metadata = hooks?.metadata as { userSophistication?: string } | undefined;
    const needsAdaptiveKB = metadata?.userSophistication !== undefined;
    return await runMPA(input, needsAdaptiveKB ? KB_ADAPTIVE_LANGUAGE : undefined);
  },
  scores: [
    async (args: any) => {
      const result = scoreResponseLength(args.output as string);
      return { name: "mpa-response-length", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const result = scoreSingleQuestion(args.output as string);
      return { name: "mpa-single-question", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const result = scoreIdkProtocol(args.input?.message as string, args.output as string);
      return { name: "mpa-idk-protocol", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const currentStep = (args.metadata as { currentStep?: number })?.currentStep || 1;
      const result = scoreStepBoundary(args.output as string, currentStep);
      return { name: "mpa-step-boundary", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const result = await scoreProgressOverPerfection(args.input?.message as string, args.output as string);
      return { name: "mpa-progress-over-perfection", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const result = await scoreAdaptiveSophistication(args.input?.message as string, args.output as string);
      return { name: "mpa-adaptive-sophistication", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const hasEnoughData = (args.metadata as { hasEnoughDataToModel?: boolean })?.hasEnoughDataToModel || false;
      const result = await scoreProactiveIntelligence(args.input?.message as string, args.output as string, hasEnoughData);
      return { name: "mpa-proactive-intelligence", score: result.score, metadata: result.metadata };
    },
    // New scorers to match local test runner (14 total)
    async (args: any) => {
      const result = scoreAcronymDefinition(args.output as string);
      return { name: "mpa-acronym-definition", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const result = scoreSourceCitation(args.output as string);
      return { name: "mpa-source-citation", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const result = scoreFeasibilityFraming(args.output as string);
      return { name: "mpa-feasibility-framing", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const result = await scoreTone(args.output as string);
      return { name: "mpa-tone", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const result = await scoreStepCompletion(args.input?.message as string, args.output as string);
      return { name: "mpa-step-completion", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const result = await scoreSelfReferentialLearning(args.input?.message as string, args.output as string);
      return { name: "mpa-self-referential-learning", score: result.score, metadata: result.metadata };
    },
    async (args: any) => {
      const result = scoreRagRetrieval(args.output as string);
      return { name: "mpa-rag-retrieval", score: result.score, metadata: result.metadata };
    },
  ],
});
