/**
 * MPA Copilot Instructions v5.7 - Braintrust Evaluation Scorers
 * 
 * This file contains custom scorers for evaluating the Media Planning Agent
 * against the instruction set requirements. Upload to Braintrust via:
 * braintrust push mpa-braintrust-scorers.ts
 */

import braintrust from "braintrust";
import { z } from "zod";

const project = braintrust.projects.create({ name: "mpa-evaluation" });

// =============================================================================
// CODE-BASED SCORERS (Deterministic, fast, reliable)
// =============================================================================

/**
 * SCORER 1: Response Length
 * Checks if response is under 75 words (per RESPONSE DISCIPLINE)
 * Returns 1.0 if under 75 words, 0.5 if under 150, 0 if over 150
 */
project.scorers.create({
  name: "Response Length",
  slug: "response-length",
  description: "Checks if response stays under 75 word target (RESPONSE DISCIPLINE)",
  parameters: z.object({
    output: z.string(),
  }),
  handler: async ({ output }) => {
    const wordCount = output.trim().split(/\s+/).length;
    if (wordCount <= 75) return { score: 1.0, metadata: { wordCount, status: "optimal" } };
    if (wordCount <= 150) return { score: 0.5, metadata: { wordCount, status: "acceptable" } };
    return { score: 0, metadata: { wordCount, status: "too_long" } };
  },
});

/**
 * SCORER 2: Single Question Check
 * Checks if response contains only one question (per QUESTION DISCIPLINE)
 */
project.scorers.create({
  name: "Single Question",
  slug: "single-question",
  description: "Checks if response asks only one question at a time (QUESTION DISCIPLINE)",
  parameters: z.object({
    output: z.string(),
  }),
  handler: async ({ output }) => {
    const questionMarks = (output.match(/\?/g) || []).length;
    if (questionMarks === 0) return { score: 1.0, metadata: { questionCount: 0, status: "no_questions" } };
    if (questionMarks === 1) return { score: 1.0, metadata: { questionCount: 1, status: "single_question" } };
    return { score: 0, metadata: { questionCount: questionMarks, status: "multiple_questions" } };
  },
});

/**
 * SCORER 3: Acronym Definition Check
 * Checks if common acronyms are defined before use (per HARD CONSTRAINTS)
 */
project.scorers.create({
  name: "Acronym Definition",
  slug: "acronym-definition",
  description: "Checks if acronyms (CAC, ROAS, LTV, CPM, CPA, CPC) are defined before use",
  parameters: z.object({
    output: z.string(),
  }),
  handler: async ({ output }) => {
    const acronyms = ["CAC", "ROAS", "LTV", "CPM", "CPA", "CPC", "CTR", "CVR", "AOV", "NTB"];
    const definitionPatterns = [
      /Customer Acquisition Cost/i,
      /Return on Ad Spend/i,
      /Lifetime Value/i,
      /Cost Per (Thousand|Mille)/i,
      /Cost Per Acquisition/i,
      /Cost Per Click/i,
      /Click.Through Rate/i,
      /Conversion Rate/i,
      /Average Order Value/i,
      /New.To.Brand/i,
    ];
    
    const usedAcronyms: string[] = [];
    const undefinedAcronyms: string[] = [];
    
    acronyms.forEach((acronym, idx) => {
      const regex = new RegExp(`\\b${acronym}\\b`, "g");
      if (regex.test(output)) {
        usedAcronyms.push(acronym);
        if (!definitionPatterns[idx].test(output)) {
          undefinedAcronyms.push(acronym);
        }
      }
    });
    
    if (usedAcronyms.length === 0) {
      return { score: 1.0, metadata: { usedAcronyms: [], status: "no_acronyms_used" } };
    }
    
    const score = undefinedAcronyms.length === 0 ? 1.0 : 1 - (undefinedAcronyms.length / usedAcronyms.length);
    return { 
      score, 
      metadata: { 
        usedAcronyms, 
        undefinedAcronyms, 
        status: undefinedAcronyms.length === 0 ? "all_defined" : "some_undefined" 
      } 
    };
  },
});

/**
 * SCORER 4: Source Citation Check
 * Checks if data claims include source attribution (per SOURCE TRANSPARENCY)
 */
project.scorers.create({
  name: "Source Citation",
  slug: "source-citation",
  description: "Checks if data points are sourced (Based on your input, Based on KB, Based on web search, My estimate)",
  parameters: z.object({
    output: z.string(),
  }),
  handler: async ({ output }) => {
    const hasNumbers = /\$[\d,]+|\d+%|\d+\s*(dollars|percent|customers|users)/i.test(output);
    
    if (!hasNumbers) {
      return { score: 1.0, metadata: { status: "no_data_claims" } };
    }
    
    const sourcePatterns = [
      /based on your input/i,
      /based on kb/i,
      /based on knowledge base/i,
      /based on web search/i,
      /based on.*research/i,
      /my estimate/i,
      /i searched but/i,
      /according to/i,
      /from.*benchmarks/i,
      /industry.*typical/i,
      /market.*shows/i,
    ];
    
    const hasSource = sourcePatterns.some(pattern => pattern.test(output));
    return { 
      score: hasSource ? 1.0 : 0, 
      metadata: { 
        hasDataClaims: true, 
        hasSourceCitation: hasSource,
        status: hasSource ? "properly_cited" : "missing_citation"
      } 
    };
  },
});

/**
 * SCORER 5: Step Boundary Violation Check
 * Checks if response discusses forbidden topics in Steps 1-2
 */
project.scorers.create({
  name: "Step Boundary",
  slug: "step-boundary",
  description: "Checks if response avoids channels/timing/creative topics in Steps 1-2",
  parameters: z.object({
    output: z.string(),
    input: z.string().optional(),
    metadata: z.object({ currentStep: z.number().optional() }).optional(),
  }),
  handler: async ({ output, metadata }) => {
    const currentStep = metadata?.currentStep || 1;
    
    if (currentStep > 2) {
      return { score: 1.0, metadata: { status: "not_applicable_beyond_step2" } };
    }
    
    const forbiddenPatterns = [
      /\b(pacing|flighting)\b/i,
      /\b(channel mix|media mix)\b/i,
      /\b(timing|timeframe|duration)\b/i,
      /\b(creative|messaging|brand messaging)\b/i,
      /\b(facebook ads|google ads|tiktok|instagram|linkedin)\b/i,
      /\b(programmatic|display|video|ctv|ott)\b/i,
    ];
    
    const violations = forbiddenPatterns.filter(pattern => pattern.test(output));
    
    return { 
      score: violations.length === 0 ? 1.0 : 0, 
      metadata: { 
        currentStep,
        violationCount: violations.length,
        status: violations.length === 0 ? "boundaries_respected" : "boundary_violation"
      } 
    };
  },
});

/**
 * SCORER 6: I Don't Know Protocol Check
 * Checks if agent properly handles "I don't know" responses
 */
project.scorers.create({
  name: "IDK Protocol",
  slug: "idk-protocol",
  description: "Checks if agent models with assumption and moves on when user says 'I don't know'",
  parameters: z.object({
    output: z.string(),
    input: z.string(),
  }),
  handler: async ({ output, input }) => {
    const userSaysIDK = /i don'?t know|not sure|no idea|uncertain|don'?t have that/i.test(input);
    
    if (!userSaysIDK) {
      return { score: 1.0, metadata: { status: "not_applicable" } };
    }
    
    const modelsAssumption = /i('ll| will) (model|use|assume|estimate)|based on|using.*benchmark/i.test(output);
    const citesSource = /based on (kb|benchmark|industry|web search|research)/i.test(output);
    const offersRefinement = /(you can|feel free to|adjust|refine|change) (this |it )?anytime/i.test(output);
    const movesOn = /moving on|next|let'?s/i.test(output);
    const keepsPushing = /what is|can you tell|do you have|please provide/i.test(output);
    
    let score = 0;
    if (modelsAssumption) score += 0.3;
    if (citesSource) score += 0.3;
    if (offersRefinement) score += 0.2;
    if (movesOn) score += 0.2;
    if (keepsPushing) score -= 0.5;
    
    return { 
      score: Math.max(0, Math.min(1, score)), 
      metadata: { 
        modelsAssumption, 
        citesSource, 
        offersRefinement, 
        movesOn, 
        keepsPushing,
        status: score >= 0.8 ? "proper_handling" : "needs_improvement"
      } 
    };
  },
});

// =============================================================================
// LLM-AS-A-JUDGE SCORERS (For subjective/nuanced evaluation)
// =============================================================================

/**
 * SCORER 7: Adaptive Sophistication (LLM Judge)
 * Evaluates if agent matches language complexity to user sophistication level
 */
project.scorers.create({
  name: "Adaptive Sophistication",
  slug: "adaptive-sophistication",
  description: "LLM judge: Does agent match language complexity to user sophistication?",
  parameters: z.object({
    output: z.string(),
    input: z.string(),
  }),
  messages: [
    {
      role: "user",
      content: `You are evaluating a Media Planning Agent's response for adaptive sophistication.

USER INPUT:
{{input}}

AGENT RESPONSE:
{{output}}

EVALUATION CRITERIA:
The agent should gauge user sophistication from their inputs and match language accordingly:
- If user provides basic information without jargon, agent should use concrete everyday terms
- If user provides detailed unit economics or industry jargon, agent can match their level
- Agent should default to simpler language when uncertain
- Agent should NOT use complex terms (gross profit, margin, net take rate) unless user demonstrates sophistication

SCORING:
A - Agent perfectly matches user sophistication level
B - Agent mostly matches but uses occasional unnecessary complexity
C - Agent sometimes mismatches sophistication level
D - Agent consistently uses wrong complexity level for user
F - Agent completely ignores user sophistication signals

First, analyze the user's apparent sophistication level based on their input.
Then, evaluate if the agent's response matches appropriately.
Select one choice: A, B, C, D, or F`,
    },
  ],
  model: "claude-sonnet-4-20250514",
  choiceScores: { A: 1.0, B: 0.8, C: 0.6, D: 0.3, F: 0 },
  useCot: true,
});

/**
 * SCORER 8: Tone and Condescension Check (LLM Judge)
 * Evaluates if agent maintains supportive, non-condescending tone
 */
project.scorers.create({
  name: "Tone Quality",
  slug: "tone-quality",
  description: "LLM judge: Is the tone supportive without being condescending?",
  parameters: z.object({
    output: z.string(),
  }),
  messages: [
    {
      role: "user",
      content: `You are evaluating a Media Planning Agent's tone.

AGENT RESPONSE:
{{output}}

EVALUATION CRITERIA:
The agent should be:
- Supportive, confident, and collaborative
- Warm and energetic, like a sharp colleague who wants the user to win
- NOT condescending or implying user incompetence

AVOID patterns like:
- "Here's how an expert would..."
- "Experienced planners know..."
- "As a professional would understand..."

PREFER patterns like:
- "Best practices suggest..."
- "High-performing campaigns typically..."
- "One approach that works well..."

SCORING:
A - Perfect tone: supportive, warm, colleague-like
B - Good tone with minor issues
C - Acceptable but some condescending elements
D - Noticeably condescending or cold
F - Clearly condescending or dismissive

Select one choice: A, B, C, D, or F`,
    },
  ],
  model: "claude-sonnet-4-20250514",
  choiceScores: { A: 1.0, B: 0.8, C: 0.6, D: 0.3, F: 0 },
  useCot: true,
});

/**
 * SCORER 9: Proactive Intelligence (LLM Judge)
 * Evaluates if agent provides proactive analysis rather than just interrogation
 */
project.scorers.create({
  name: "Proactive Intelligence",
  slug: "proactive-intelligence",
  description: "LLM judge: Does agent show math/analysis rather than just asking questions?",
  parameters: z.object({
    output: z.string(),
    input: z.string(),
    metadata: z.object({ hasEnoughDataToModel: z.boolean().optional() }).optional(),
  }),
  messages: [
    {
      role: "user",
      content: `You are evaluating a Media Planning Agent's proactive intelligence.

USER INPUT:
{{input}}

AGENT RESPONSE:
{{output}}

CONTEXT: {{metadata.hasEnoughDataToModel}}

EVALUATION CRITERIA:
When the agent has enough data to model (budget + volume target), it should:
- DO THE MATH and present findings
- Guide with analysis, not just interrogation
- Show what the numbers imply BEFORE asking more questions
- Calculate implied efficiency and compare to benchmarks
- Challenge gently with evidence if issues are found

SCORING:
A - Agent proactively calculates, shows math, and guides with analysis
B - Agent shows some analysis but could do more
C - Agent asks questions when it should be modeling
D - Agent only interrogates without providing analytical value
F - Agent completely fails to leverage available data

If there's not enough data to model yet, score as N/A (return 1.0 with note).

Select one choice: A, B, C, D, F, or N/A`,
    },
  ],
  model: "claude-sonnet-4-20250514",
  choiceScores: { A: 1.0, B: 0.8, C: 0.5, D: 0.2, F: 0, "N/A": 1.0 },
  useCot: true,
});

/**
 * SCORER 10: Progress Over Perfection (LLM Judge)
 * Evaluates if agent keeps momentum vs getting stuck in endless refinement
 */
project.scorers.create({
  name: "Progress Over Perfection",
  slug: "progress-over-perfection",
  description: "LLM judge: Does agent make progress with assumptions vs endless refinement?",
  parameters: z.object({
    output: z.string(),
    input: z.string(),
  }),
  messages: [
    {
      role: "user",
      content: `You are evaluating whether a Media Planning Agent maintains progress momentum.

USER INPUT:
{{input}}

AGENT RESPONSE:
{{output}}

EVALUATION CRITERIA:
The agent should:
- Model with reasonable assumptions rather than blocking progress
- State assumptions clearly when data is incomplete
- Tell user they can refine later
- Keep momentum - a plan with flagged assumptions beats an incomplete plan
- NOT trap user in endless refinement loops

Signs of GOOD progress:
- "I'll model using X for now, you can adjust this later"
- "Based on benchmarks, let's assume Y"
- "Let's lock this and move forward"
- Making decisions and progressing to next step

Signs of BAD blocking:
- Repeated questions about the same topic
- Refusing to proceed without perfect data
- Circular conversations
- "I need more information before we can continue"

SCORING:
A - Agent maintains excellent momentum with clear assumptions
B - Agent makes progress but could be more decisive
C - Agent sometimes gets stuck seeking perfect data
D - Agent frequently blocks progress
F - Agent completely stalls progress with endless questions

Select one choice: A, B, C, D, or F`,
    },
  ],
  model: "claude-sonnet-4-20250514",
  choiceScores: { A: 1.0, B: 0.8, C: 0.5, D: 0.2, F: 0 },
  useCot: true,
});

/**
 * SCORER 11: Feasibility Framing (LLM Judge)
 * Evaluates if agent properly frames aggressive vs realistic targets
 */
project.scorers.create({
  name: "Feasibility Framing",
  slug: "feasibility-framing",
  description: "LLM judge: Does agent properly frame target feasibility with sourced benchmarks?",
  parameters: z.object({
    output: z.string(),
    input: z.string(),
  }),
  messages: [
    {
      role: "user",
      content: `You are evaluating how a Media Planning Agent frames target feasibility.

USER INPUT:
{{input}}

AGENT RESPONSE:
{{output}}

EVALUATION CRITERIA:
When user proposes efficiency targets (CAC, CPA, ROAS goals), the agent should:
- Calculate implied efficiency from budget and volume
- Compare to benchmarks WITH SOURCE CITATION
- Call out if target is aggressive DIRECTLY (don't soften)
- Frame positively: acknowledge ambition, cite market typical, explain what it takes
- Example: "Based on [source], fintech CAC typically runs $60-100. Your $50 target is aggressive. To hit it, we'll need tight audience definition."

GOOD framing:
- "This is ambitious. Market typically shows X to Y based on [source]."
- "Your target is aggressive compared to industry benchmarks."
- "To hit this, we'll need to focus on..."

BAD framing:
- Accepting unrealistic targets without comment
- Softening language ("This might be a bit challenging")
- No benchmark comparison
- No source for comparison data

SCORING:
A - Perfect feasibility framing with sourced benchmarks and clear path forward
B - Good framing but missing source or path forward
C - Acknowledges feasibility issues but vaguely
D - Weak or misleading feasibility assessment
F - Accepts obviously unrealistic targets without comment

If no efficiency targets are discussed, score as N/A.

Select one choice: A, B, C, D, F, or N/A`,
    },
  ],
  model: "claude-sonnet-4-20250514",
  choiceScores: { A: 1.0, B: 0.7, C: 0.5, D: 0.2, F: 0, "N/A": 1.0 },
  useCot: true,
});

/**
 * SCORER 12: Step Completion (LLM Judge)
 * Evaluates if agent properly completes minimum viable steps before moving on
 */
project.scorers.create({
  name: "Step Completion",
  slug: "step-completion",
  description: "LLM judge: Does agent know when a step is complete and move on?",
  parameters: z.object({
    output: z.string(),
    input: z.string(),
    metadata: z.object({
      currentStep: z.number().optional(),
      collectedData: z.record(z.any()).optional()
    }).optional(),
  }),
  messages: [
    {
      role: "user",
      content: `You are evaluating whether a Media Planning Agent properly manages step completion.

USER INPUT:
{{input}}

AGENT RESPONSE:
{{output}}

CURRENT STEP: {{metadata.currentStep}}
DATA COLLECTED: {{metadata.collectedData}}

MINIMUM VIABLE REQUIREMENTS:
Step 1 (Outcomes): Objective + Primary KPI (as number) + Volume/revenue target
Step 2 (Economics): Whether efficiency implied by budget/volume is achievable

EVALUATION CRITERIA:
The agent should:
- Recognize when minimum requirements for a step are met
- STOP ASKING and START MODELING once requirements are met
- Not ask for unnecessary refinement when basics are covered
- Clearly signal step completion and transition

SCORING:
A - Agent correctly identifies step completion and transitions
B - Agent mostly correct but asks one extra unnecessary question
C - Agent over-asks but eventually moves on
D - Agent significantly over-refines before moving on
F - Agent fails to recognize when step is complete

If the step requirements aren't yet met, score based on whether questions are relevant.

Select one choice: A, B, C, D, or F`,
    },
  ],
  model: "claude-sonnet-4-20250514",
  choiceScores: { A: 1.0, B: 0.8, C: 0.5, D: 0.2, F: 0 },
  useCot: true,
});

export default project;
