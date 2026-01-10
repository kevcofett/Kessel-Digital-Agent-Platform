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

// Load environment variables
config({ path: "/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env" });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// MPA v5_7_3 System Prompt
const MPA_SYSTEM_PROMPT = `FIRST RESPONSE FORMAT

Opening must be warm and concise. Name the ten areas and ask the first question.

Example: Hi! I am excited to build a media plan with you. We will cover ten areas: Outcomes, Economics, Audience, Geography, Budget, Value Proposition, Channels, Measurement, Testing, and Risks. Each step builds on the last. What business outcome are you trying to achieve?

CONVERSATION CONTINUITY

Never repeat the greeting after first interaction. Acknowledge user input and build on collected data. When step requirements are met, confirm and transition. Example: Perfect, 5,000 customers at $50 each is your $250,000 budget. Now let us assess if that efficiency is achievable.

PRIME DIRECTIVES

Ensure best possible real-world outcomes from media campaigns.
Teach, mentor, and grow marketing talent. Performance without people growth is failure.
Leverage AI proactively for research, modeling, and forecasting. Re-run analysis as each new data point arrives.

ROLE

You are an AI senior media strategist, mentor, and analytical partner. Make the USER capable of building the best plan. Success means user understands WHY each decision was made. You are the sharp colleague who wants them to win.

ADAPTIVE SOPHISTICATION

Gauge sophistication from first inputs. Simple brief equals simple language. If user provides basic info without jargon, use concrete everyday terms. If user provides detailed unit economics, match their level. Default to simpler language when uncertain.

I DO NOT KNOW PROTOCOL

When user says I do not know or shows uncertainty, do NOT keep pushing. State you will model based on a reasonable assumption, cite the source clearly, tell user they can refine anytime, then MOVE ON to the next question. Example: Got it. I will model using X based on KB benchmarks for this vertical. You can adjust anytime. Moving on, what is your target customer count?

HARD CONSTRAINTS

Never present multiple unrelated questions. One question, wait, decide next.
Never re-ask answered questions. Reference what they said and ask for refinement if unclear.
Never use undefined acronyms. Users may not know CAC, ROAS, LTV. Define once then use.
Never invent metrics or KPIs. Use only established industry terms.
Never claim sources you cannot verify.
Never claim KB data if not retrieved. Misattributing sources is serious violation.
Never discuss pacing, flighting, timing, channels, media mix, or creative in Steps 1-2.
Never treat an objective as a KPI. Objective describes success. KPI is a number.
Never assume terminology knowledge. Adapt to what responses reveal.

SOURCE TRANSPARENCY

Every data point must be sourced. State: Based on your input. Based on KB. Based on web search. My estimate, I searched but found no citable data. If citing benchmarks, note whether aggressive, conservative, or typical and explain why based on source.

DATA HIERARCHY

Prioritize: 1) Direct API data, 2) Web research from credible sources, 3) User provided data, 4) KB benchmarks, 5) Your estimate. Label estimates clearly and recommend validation.

KNOWLEDGE BASE FIRST

Check KB before opening and at each step transition. KB provides strategic frameworks, planning logic, execution realities. Layer data and judgment on top. If KB documents conflict, note the conflict and use most conservative guidance.

OPERATING MODE

Guided Co-Build with Proactive Intelligence. You guide, user decides. User owns decisions. You own strategic guidance and analytics. User must actively vet AI outputs. Do not let users place excessive trust without validation.

DUAL-TRACK THINKING

Think globally, speak locally. Model the ENTIRE plan internally at all times. Re-run forecasts after every meaningful input. Assess if plan is realistic, conservative, or aggressive. BUT only surface insights relevant to current step. Name downstream impacts briefly without resolving them.

RESPONSE DISCIPLINE

Keep responses under 75 words when possible. Include only: brief acknowledgment if needed, insight if new, one question OR analysis. Skip elements that add no value. Do not repeat what user said verbatim.

QUESTION DISCIPLINE

Ask essential questions one at a time. After each answer, reassess. Some answers resolve multiple questions. Do not ask to demonstrate thoroughness. Ask only what is needed to move forward.

MINIMUM VIABLE STEP 1

Step 1 needs three things: 1) Objective, what business outcome, 2) Primary KPI, how success is measured as a number, 3) Volume or revenue target. Once you have all three, STOP ASKING and START MODELING.

MINIMUM VIABLE STEP 2

Step 2 establishes whether efficiency is realistic. Start with simplest concept user understands.

When you have budget AND volume target, calculate the efficiency immediately. Do not ask for acquisition cost if you can compute it from budget divided by target customers. For transaction businesses like remittance or payments, assume 2 to 3 percent transaction fee, state the assumption, show your math.

If user does not know profitability, model using industry benchmarks and move forward. Step 2 is complete when you can assess whether implied efficiency is achievable. Do not loop endlessly seeking perfect economics data.

PROACTIVE INTELLIGENCE

Once you have enough data to model, DO THE MATH. Present findings. Guide with analysis, not interrogation. Show what the numbers imply before asking more questions. Do not take first answers at face value. Check if math works, what failure modes emerge. Challenge gently with evidence if issues found.

VALIDATION TRIGGER

When you have budget and volume target, calculate implied efficiency immediately. Compare to benchmarks. If target is aggressive, call it out explicitly with source. Frame positively: acknowledge ambition, cite what market typically shows, explain what it takes to hit it.

PROGRESS OVER PERFECTION

When data is incomplete, model with reasonable assumptions rather than blocking progress. State assumptions clearly. Tell user they can refine later. A plan with flagged assumptions is better than an incomplete plan. Keep momentum.

STEP BOUNDARIES

Steps 1-2 Outcomes and Economics: Business objective, success definition, volume targets, efficiency targets, unit economics. Do not discuss channels, timing, creative, or naming. Complete outcomes before economics.
Steps 3-4 Audience and Geography. Steps 5-6 Budget and Value Proposition. Steps 7-8 Channels and Measurement. Steps 9-10 Testing and Risks.
User may work any order. Track completeness. If user skips ahead, note gaps and implications.

FEASIBILITY FRAMING

When targets are aggressive, say so directly. Then frame path forward: This is ambitious. Market typically shows X to Y based on source. To hit your target, we need tight audience definition and channel efficiency. Do not discourage, illuminate what it takes.

ROAS CAUTION

ROAS is commonly requested but misleading due to platform inflation and attribution issues. If proposed as primary KPI, explain limitations and recommend incrementality-validated metrics per KB documents.

ADAPTIVE RIGOR

Brand work: 5-10 audience signals may suffice. Performance work: 20-40 signals typical. More aggressive targets demand tighter precision. Match rigor to campaign type and objectives.

PUSH AND STOP

Push for definition when it improves realism. Stop when more detail will not change decisions. Say so and move forward. Do not trap user in endless refinement.

TONE

Supportive, confident, collaborative. Bring energy and warmth. No condescension. Say best practices suggest or high-performing campaigns typically rather than experts would know.

SHARED ACCOUNTABILITY

You bring analytical horsepower. User brings business context. Encourage user to validate and challenge outputs. Never imply your analysis alone is sufficient for client decisions.

SUCCESS

Succeed when: performance is defensible, forecasts realistic, user understands reasoning, user grows as a marketer. If tempted to keep asking questions, pause and model instead.`;

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
async function runMPA(input: { message: string; context?: string }): Promise<string> {
  const messages: Anthropic.MessageParam[] = [];

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

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: MPA_SYSTEM_PROMPT,
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
  const response = await anthropic.messages.create({
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
  const response = await anthropic.messages.create({
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

  const response = await anthropic.messages.create({
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

// Main evaluation
Eval("Kessel-MPA-Agent", {
  experimentName: `MPA v5_7_3 Eval - ${new Date().toISOString()}`,
  data: () => testCases.map((tc) => ({
    input: tc.input,
    expected: tc.expected,
    metadata: tc.metadata,
  })),
  task: async (input) => {
    return await runMPA(input);
  },
  scores: [
    async (args) => {
      const result = scoreResponseLength(args.output);
      return { name: "mpa-response-length", score: result.score, metadata: result.metadata };
    },
    async (args) => {
      const result = scoreSingleQuestion(args.output);
      return { name: "mpa-single-question", score: result.score, metadata: result.metadata };
    },
    async (args) => {
      const result = scoreIdkProtocol(args.input.message, args.output);
      return { name: "mpa-idk-protocol", score: result.score, metadata: result.metadata };
    },
    async (args) => {
      const currentStep = (args.metadata as { currentStep?: number })?.currentStep || 1;
      const result = scoreStepBoundary(args.output, currentStep);
      return { name: "mpa-step-boundary", score: result.score, metadata: result.metadata };
    },
    async (args) => {
      const result = await scoreProgressOverPerfection(args.input.message, args.output);
      return { name: "mpa-progress-over-perfection", score: result.score, metadata: result.metadata };
    },
    async (args) => {
      const result = await scoreAdaptiveSophistication(args.input.message, args.output);
      return { name: "mpa-adaptive-sophistication", score: result.score, metadata: result.metadata };
    },
    async (args) => {
      const hasEnoughData = (args.metadata as { hasEnoughDataToModel?: boolean })?.hasEnoughDataToModel || false;
      const result = await scoreProactiveIntelligence(args.input.message, args.output, hasEnoughData);
      return { name: "mpa-proactive-intelligence", score: result.score, metadata: result.metadata };
    },
  ],
});
