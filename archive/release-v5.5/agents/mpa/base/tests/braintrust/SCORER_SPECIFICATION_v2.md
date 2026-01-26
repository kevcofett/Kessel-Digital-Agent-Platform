# MPA SCORER SPECIFICATION v2

## OVERVIEW

This document defines the complete scorer framework for evaluating MPA agent quality. These scorers measure guidance quality, not completion speed.

**Total Scorers:** 14
**Total Weight:** 100%

---

## TIER 1: CORE QUALITY BEHAVIORS (65% TOTAL)

### proactive-calculation
- **Weight:** 15%
- **Type:** LLM Judge
- **Trigger:** Agent has budget AND volume target (or enough data to calculate efficiency)
- **Instructions:**
  When agent has budget AND volume target, does it immediately calculate implied efficiency and compare to benchmarks?
  
  **Score A (1.0):** Shows math on its own line (e.g., "$400K / 5,000 = $80 per customer"), compares to benchmark with source citation, states implication for plan success.
  
  **Score B (0.75):** Shows calculation but missing benchmark comparison OR missing implication.
  
  **Score C (0.5):** Acknowledges data without calculating. Says things like "that gives us something to work with" without showing math.
  
  **Score D (0.25):** Asks more questions when it has enough data to calculate.
  
  **Score F (0.0):** Ignores quantitative data entirely or embeds calculation in prose without clear display.

- **Judge Prompt:**
```
Evaluate if the agent proactively calculates when it has sufficient data.

PROACTIVE CALCULATION means:
- Shows arithmetic on its own line: "$X / Y = $Z per customer"
- Compares result to benchmark: "vs benchmark range of $A-$B"
- States implication: "This is aggressive/achievable/conservative because..."

FAILURE patterns:
- "That gives us something to work with" without math
- Acknowledging budget/volume without calculating efficiency
- Asking more questions when calculation is possible
- Embedding calculation in prose without visual separation

Available data in conversation:
{available_data}

Agent response:
{agent_response}

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}
```

---

### teaching-behavior
- **Weight:** 12%
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **Instructions:**
  Does agent TEACH the user why decisions matter, not just interrogate?
  
  **Score A (1.0):** Explains strategic reasoning (e.g., "We need audience before channels because the right channels depend on where your customers are"), provides frameworks, helps user understand WHY each piece matters.
  
  **Score B (0.75):** Some explanation but could go deeper. Partial context given.
  
  **Score C (0.5):** Acknowledges answers and moves on without teaching. Procedural but not educational.
  
  **Score D (0.25):** Purely procedural questions with no strategic context. "What's your budget? What's your target?"
  
  **Score F (0.0):** Interrogation style with multiple rapid questions. No explanation of why information matters.

- **Judge Prompt:**
```
Evaluate if the agent TEACHES strategic reasoning vs merely INTERROGATES.

TEACHING indicators:
- Explains WHY a question matters before or after asking
- Provides strategic frameworks ("This matters because...")
- Connects current question to downstream decisions
- Helps user understand implications of their answers
- Frames questions with business context

INTERROGATION indicators:
- Rapid-fire questions without context
- "Let me gather some information" without strategic framing
- No explanation of why information is needed
- Checklist-style data collection
- Moving to next question without synthesis

Current step: {step_number}
Agent response: {agent_response}

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}
```

---

### feasibility-framing
- **Weight:** 10%
- **Type:** LLM Judge
- **Trigger:** Agent has calculated efficiency that differs from benchmark
- **Instructions:**
  When target is aggressive vs benchmarks, does agent explicitly call it out with evidence and path forward?
  
  **Score A (1.0):** Directly states "This is aggressive" or "ambitious", provides benchmark comparison with source, explains what's required to achieve it (e.g., "To hit $50 CAC vs benchmark $75, you need tight targeting and efficient channels").
  
  **Score B (0.75):** Notes difficulty without specific benchmark comparison. General caution without evidence.
  
  **Score C (0.5):** Accepts aggressive target without any comment or validation.
  
  **Score D (0.25):** Discourages without evidence. Says "that might be hard" without data.
  
  **Score F (0.0):** Accepts clearly unrealistic target (e.g., $5 CAC for enterprise B2B) without any flag.

- **Judge Prompt:**
```
Evaluate if agent appropriately frames target feasibility when comparing to benchmarks.

GOOD FEASIBILITY FRAMING:
- Explicitly states if target is "aggressive", "ambitious", "conservative", or "typical"
- Cites benchmark with source: "vs benchmark of $X-Y based on Knowledge Base"
- Explains path forward: "To hit this, you'll need..."
- Supportive but honest: doesn't discourage, illuminates requirements

POOR FEASIBILITY FRAMING:
- Accepts aggressive target without comment
- Vague concerns without data: "that might be challenging"
- Discourages without evidence
- Accepts clearly unrealistic targets

User's target: {user_target}
Relevant benchmark: {benchmark_range}
Agent response: {agent_response}

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}
```

---

### source-citation
- **Weight:** 10%
- **Type:** Code
- **Trigger:** Any response containing numbers, percentages, or benchmark claims
- **Instructions:**
  Every data claim MUST cite exactly one of five sources using exact phrasing:
  
  1. "Based on Knowledge Base, [claim]." - No link required
  2. "Based on Websearch, [claim] [source: URL]." - MUST include link
  3. "Based on API Call, [claim]." - No link required
  4. "Based on User Provided, [claim]." - No link required
  5. "Based on Benchmark, [claim] [source: URL]." - MUST include link
  
  **Score 1.0:** Explicit source with correct format for all claims.
  **Score 0.7:** Implicit source ("you mentioned", "typical range", "industry data shows").
  **Score 0.3:** Number or benchmark without any source attribution.
  **Score 0.0:** Fabricated citation or claims KB data when not retrieved.

- **Code Pattern:**
```typescript
const SOURCE_PATTERNS = [
  { pattern: /Based on Knowledge Base/i, requiresLink: false },
  { pattern: /Based on Websearch.*\[source:/i, requiresLink: true },
  { pattern: /Based on API Call/i, requiresLink: false },
  { pattern: /Based on User Provided/i, requiresLink: false },
  { pattern: /Based on Benchmark.*\[source:/i, requiresLink: true }
];

const IMPLICIT_PATTERNS = [
  /you mentioned/i,
  /you (said|provided|told me)/i,
  /typical(ly)?( range)?/i,
  /industry (data|benchmarks?)/i,
  /generally (runs?|ranges?)/i
];

function scoreSourceCitation(response: string): number {
  const claims = extractQuantitativeClaims(response);
  if (claims.length === 0) return 1.0; // No claims to cite
  
  let totalScore = 0;
  for (const claim of claims) {
    if (hasExplicitSource(claim)) totalScore += 1.0;
    else if (hasImplicitSource(claim)) totalScore += 0.7;
    else totalScore += 0.3;
  }
  return totalScore / claims.length;
}
```

---

### recalculation-on-change
- **Weight:** 8%
- **Type:** Hybrid (Code detection + LLM evaluation)
- **Trigger:** User provides NEW quantitative data that differs from prior value
- **Instructions:**
  When user provides new data that changes prior calculations, does agent immediately recalculate and show updated projections?
  
  **Score 1.0:** Detects change, shows new math on own line, explains delta from prior projection (e.g., "That changes our projection from $80 to $50 per customer").
  
  **Score 0.7:** Recalculates but doesn't show comparison to prior state.
  
  **Score 0.3:** Acknowledges change verbally without recalculating (e.g., "Got it, the budget changed").
  
  **Score 0.0:** Ignores data change entirely and continues with old numbers.

- **Code Pattern:**
```typescript
interface DataChange {
  field: string;
  oldValue: number;
  newValue: number;
  turnDetected: number;
}

const RECALCULATION_TRIGGERS = {
  budget: ['impliedCAC', 'channelAllocations', 'geoSpend', 'testBudget'],
  volumeTarget: ['impliedCAC', 'audienceSizing', 'conversionRate'],
  audienceSize: ['reachProjections', 'frequencyEstimates'],
  geoAllocation: ['spendPerMarket', 'regionalCAC']
};

function detectDataChange(priorTurns: Turn[], currentUserMessage: string): DataChange | null {
  // Extract numbers from current message
  // Compare to previously stated values
  // Return change object if significant difference detected
}
```

- **Judge Prompt (for evaluation after code detection):**
```
A data change was detected in the conversation.

Data change: {field} changed from {old_value} to {new_value}

Agent's response after change:
{agent_response}

Evaluate if agent properly recalculated:
- Did agent show new calculation with the updated value?
- Did agent explain what changed from prior projection?
- Did agent acknowledge the impact of the change?

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}
```

---

### risk-opportunity-flagging
- **Weight:** 5%
- **Type:** LLM Judge
- **Trigger:** Every agent response (contextual evaluation)
- **Instructions:**
  Does agent proactively surface risks, opportunities, or important considerations the user didn't ask about?
  
  **Score A (1.0):** Proactively flags with rationale (e.g., "Given your Q4 timeline, expect 15-20% CPM inflation for holiday season").
  
  **Score B (0.75):** Mentions consideration when relevant but without strong rationale.
  
  **Score C (0.5):** Only addresses exactly what user asks. No proactive insights.
  
  **Score D (0.25):** Misses obvious risks or opportunities given the context.
  
  **Score F (0.0):** Provides misleading assurance or false confidence.

- **Judge Prompt:**
```
Evaluate if agent proactively flags risks, opportunities, or considerations.

PROACTIVE FLAGGING means surfacing things user didn't ask about:
- Seasonality impacts on costs
- Platform-specific considerations
- Competitive factors
- Timeline risks
- Budget sufficiency concerns
- Measurement limitations

Context clues to watch for:
- Q4/holiday timing = CPM inflation risk
- Small budget = channel minimum concerns
- Aggressive targets = execution risk
- New market = learning curve

Conversation context: {context}
Agent response: {agent_response}

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}
```

---

### adaptive-sophistication
- **Weight:** 5%
- **Type:** LLM Judge
- **Trigger:** Every agent response
- **Instructions:**
  Does response complexity match user sophistication level?
  
  **Score A (1.0):** Perfect match. Basic users get plain language with defined terms. Expert users get peer-level strategic dialogue without over-explanation.
  
  **Score B (0.75):** Mostly appropriate with minor mismatches.
  
  **Score C (0.5):** Sometimes mismatches. Defines terms expert knows OR uses jargon with beginner.
  
  **Score D (0.25):** Consistently wrong level throughout response.
  
  **Score F (0.0):** Ignores sophistication signals entirely. Over-explains to expert OR overwhelms beginner.

- **Judge Prompt:**
```
Evaluate if agent matches communication to user sophistication level.

SOPHISTICATION SIGNALS:
- HIGH: Uses industry jargon correctly, provides detailed economics, asks strategic questions
- MEDIUM: Understands basics, needs some clarification, asks tactical questions
- LOW: Unfamiliar with terms, vague objectives, needs teaching

APPROPRIATE RESPONSES:
- To HIGH user: Skip basics, engage on nuance, peer-level discussion, use abbreviations
- To LOW user: Define terms, use analogies, more explanation, avoid jargon

User sophistication level: {user_level}
Evidence: {sophistication_signals}
Agent response: {agent_response}

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}
```

---

## TIER 2: STRUCTURAL COMPLIANCE (20% TOTAL)

### step-boundary
- **Weight:** 6%
- **Type:** Code
- **Trigger:** Response during Steps 1-2
- **Instructions:**
  No channel RECOMMENDATIONS in Steps 1-2. This is a HARD RULE per KB.
  
  **Violations detected:**
  - "recommend [channel name]"
  - "should run/use [platform]"
  - "[X]% to [channel]"
  - Specific allocation suggestions mentioning channels
  
  **Allowed:**
  - General observations ("gives flexibility across channels")
  - Acknowledging user's channel mention and redirecting
  
  **Score 1.0:** No violations detected.
  **Score 0.0:** Any violation detected.

- **Code Pattern:**
```typescript
const CHANNEL_NAMES = [
  'Meta', 'Facebook', 'Instagram', 'Google', 'YouTube', 'TikTok', 
  'LinkedIn', 'Twitter', 'X', 'Snapchat', 'Pinterest', 'CTV', 'OTT',
  'Display', 'Programmatic', 'Search', 'Social', 'Video', 'Audio',
  'Podcast', 'OOH', 'DOOH', 'TV', 'Radio', 'Print'
];

const RECOMMENDATION_PATTERNS = [
  /recommend.*(${CHANNEL_NAMES.join('|')})/i,
  /should (run|use|invest|spend|allocate).*(${CHANNEL_NAMES.join('|')})/i,
  /\d+%?\s*(to|for|on|in)\s*(${CHANNEL_NAMES.join('|')})/i,
  /(${CHANNEL_NAMES.join('|')}).*should (be|get|receive)/i,
  /allocate.*(${CHANNEL_NAMES.join('|')})/i
];

function scoreStepBoundary(response: string, currentStep: number): number {
  if (currentStep > 2) return 1.0; // Only applies to Steps 1-2
  
  for (const pattern of RECOMMENDATION_PATTERNS) {
    if (pattern.test(response)) return 0.0;
  }
  return 1.0;
}
```

---

### single-question
- **Weight:** 5%
- **Type:** Code
- **Trigger:** Every agent response
- **Instructions:**
  KB says "ONE question per response. Maximum. No exceptions."
  
  **Score 1.0:** 0-1 questions in response.
  **Score 0.5:** 2 questions in response.
  **Score 0.0:** 3+ questions in response.

- **Code Pattern:**
```typescript
function countQuestions(text: string): number {
  // Count explicit question marks
  const questionMarks = (text.match(/\?/g) || []).length;
  
  // Also detect implicit questions without question marks
  const implicitPatterns = [
    /could you (tell|share|provide)/i,
    /would you (say|describe)/i,
    /what about/i,
    /how about/i
  ];
  
  let implicitCount = 0;
  for (const pattern of implicitPatterns) {
    if (pattern.test(text)) implicitCount++;
  }
  
  return questionMarks + implicitCount;
}

function scoreSingleQuestion(response: string): number {
  const count = countQuestions(response);
  if (count <= 1) return 1.0;
  if (count === 2) return 0.5;
  return 0.0;
}
```

---

### idk-protocol
- **Weight:** 4%
- **Type:** Code
- **Trigger:** User says "I don't know", "not sure", "no idea", or shows uncertainty
- **Instructions:**
  When user expresses uncertainty, agent should:
  - Model with reasonable assumption (+0.25)
  - Cite source for assumption (+0.25)
  - Offer refinement option (+0.25)
  - Move forward to next topic (+0.25)
  
  **Deduction:** Keeps pushing for answer user doesn't have (-0.5)

- **Code Pattern:**
```typescript
const UNCERTAINTY_TRIGGERS = [
  /i don'?t know/i,
  /not sure/i,
  /no idea/i,
  /i'?m uncertain/i,
  /hard to say/i,
  /can'?t answer that/i
];

const IDK_COMPONENTS = {
  assumption: /will (model|use|assume|estimate|work with)/i,
  source: /(based on|according to|from|per) (KB|Knowledge Base|benchmark|industry)/i,
  refinement: /(adjust|refine|update|change) (anytime|later|if needed)/i,
  moveForward: /(moving on|next|let'?s|now)/i
};

const PUSHING_PATTERN = /but (do you|can you|could you).*(estimate|guess|approximate)/i;

function scoreIdkProtocol(userMessage: string, agentResponse: string): number {
  // Check if this is an IDK trigger
  const isIdkTrigger = UNCERTAINTY_TRIGGERS.some(p => p.test(userMessage));
  if (!isIdkTrigger) return 1.0; // Not applicable
  
  let score = 0;
  if (IDK_COMPONENTS.assumption.test(agentResponse)) score += 0.25;
  if (IDK_COMPONENTS.source.test(agentResponse)) score += 0.25;
  if (IDK_COMPONENTS.refinement.test(agentResponse)) score += 0.25;
  if (IDK_COMPONENTS.moveForward.test(agentResponse)) score += 0.25;
  
  if (PUSHING_PATTERN.test(agentResponse)) score -= 0.5;
  
  return Math.max(0, score);
}
```

---

### response-length
- **Weight:** 3%
- **Type:** Code
- **Trigger:** Every agent response
- **Instructions:**
  KB says "under 75 words when possible".
  
  **Score 1.0:** ≤75 words
  **Score 0.8:** 76-125 words
  **Score 0.5:** 126-200 words
  **Score 0.2:** 201-300 words
  **Score 0.0:** >300 words
  
  **Exception:** Responses containing geography tables or multi-row calculations are exempt.

- **Code Pattern:**
```typescript
function scoreResponseLength(response: string): number {
  // Check for table exception
  if (hasTable(response) || hasMultiRowCalculation(response)) {
    return 1.0; // Exempt
  }
  
  const wordCount = response.split(/\s+/).filter(w => w.length > 0).length;
  
  if (wordCount <= 75) return 1.0;
  if (wordCount <= 125) return 0.8;
  if (wordCount <= 200) return 0.5;
  if (wordCount <= 300) return 0.2;
  return 0.0;
}

function hasTable(text: string): boolean {
  return /\|.*\|.*\|/m.test(text);
}

function hasMultiRowCalculation(text: string): boolean {
  // Multiple lines starting with currency or containing =
  const calcLines = text.split('\n').filter(line => 
    /^\s*\$[\d,]+/.test(line) || /=\s*\$?[\d,]+/.test(line)
  );
  return calcLines.length >= 2;
}
```

---

### acronym-definition
- **Weight:** 2%
- **Type:** Code
- **Trigger:** Every agent response
- **Instructions:**
  Acronyms must be defined on first use in conversation.
  
  **Tracked acronyms:** CAC, ROAS, LTV, CPM, CPA, CPC, CTR, DMA, KPI, ROI, AOV, CLV, MER, POAS
  
  **Score:** 1 - (undefined_on_first_use / total_unique_acronyms_used)

- **Code Pattern:**
```typescript
const ACRONYMS = ['CAC', 'ROAS', 'LTV', 'CPM', 'CPA', 'CPC', 'CTR', 'DMA', 'KPI', 'ROI', 'AOV', 'CLV', 'MER', 'POAS'];

const DEFINITION_PATTERNS: Record<string, RegExp> = {
  CAC: /cost (per|of) (customer )?acquisition|CAC \(/i,
  ROAS: /return on ad spend|ROAS \(/i,
  LTV: /lifetime value|LTV \(/i,
  CPM: /cost per (thousand|mille)|CPM \(/i,
  // ... etc
};

function scoreAcronymDefinition(conversationHistory: Turn[]): number {
  const definedAcronyms = new Set<string>();
  const usedWithoutDefinition = new Set<string>();
  
  for (const turn of conversationHistory) {
    if (turn.role !== 'assistant') continue;
    
    for (const acronym of ACRONYMS) {
      const usesAcronym = new RegExp(`\\b${acronym}\\b`).test(turn.content);
      const definesAcronym = DEFINITION_PATTERNS[acronym]?.test(turn.content);
      
      if (definesAcronym) {
        definedAcronyms.add(acronym);
      }
      
      if (usesAcronym && !definedAcronyms.has(acronym) && !definesAcronym) {
        usedWithoutDefinition.add(acronym);
      }
    }
  }
  
  const totalUsed = definedAcronyms.size + usedWithoutDefinition.size;
  if (totalUsed === 0) return 1.0;
  
  return 1 - (usedWithoutDefinition.size / totalUsed);
}
```

---

## TIER 3: ADVANCED QUALITY (15% TOTAL)

### audience-sizing-completeness
- **Weight:** 6%
- **Type:** Code
- **Trigger:** Agent response during or after Step 4 Geography
- **Instructions:**
  When in Step 4 Geography, agent MUST present audience sizing table before proceeding to Step 5.
  
  **Table component scoring:**
  - DMA/Geography column present (15%)
  - Total Population column present (15%)
  - Target Audience column as whole numbers (15%)
  - Target % column present (10%)
  - TOTAL row with aggregation (15%)
  - Multiple DMAs if scope is regional/national (15%)
  - Weighted average for percentages in TOTAL (15%)
  
  **Score:** Sum of present components.

- **Code Pattern:**
```typescript
interface TableAnalysis {
  hasTable: boolean;
  hasGeoColumn: boolean;
  hasPopulationColumn: boolean;
  hasTargetAudienceColumn: boolean;
  hasTargetPercentColumn: boolean;
  hasTotalRow: boolean;
  hasMultipleDMAs: boolean;
  hasWeightedAverage: boolean;
}

function scoreAudienceSizingCompleteness(response: string, currentStep: number): number {
  if (currentStep < 4) return 1.0; // Not applicable yet
  
  const analysis = analyzeTable(response);
  
  if (!analysis.hasTable) return 0.0;
  
  let score = 0;
  if (analysis.hasGeoColumn) score += 0.15;
  if (analysis.hasPopulationColumn) score += 0.15;
  if (analysis.hasTargetAudienceColumn) score += 0.15;
  if (analysis.hasTargetPercentColumn) score += 0.10;
  if (analysis.hasTotalRow) score += 0.15;
  if (analysis.hasMultipleDMAs) score += 0.15;
  if (analysis.hasWeightedAverage) score += 0.15;
  
  return score;
}

function analyzeTable(text: string): TableAnalysis {
  const tableMatch = text.match(/\|[^|]+\|[^|]+\|/gm);
  if (!tableMatch) return { hasTable: false } as TableAnalysis;
  
  const headerRow = tableMatch[0].toLowerCase();
  
  return {
    hasTable: true,
    hasGeoColumn: /dma|geography|market|region/.test(headerRow),
    hasPopulationColumn: /population|pop\b/.test(headerRow),
    hasTargetAudienceColumn: /target\s*(audience|aud)|addressable/.test(headerRow),
    hasTargetPercentColumn: /(target|tgt)\s*%|percent/.test(headerRow),
    hasTotalRow: /\btotal\b/i.test(text),
    hasMultipleDMAs: tableMatch.length >= 4, // Header + separator + 2+ data rows + total
    hasWeightedAverage: checkWeightedAverage(text)
  };
}
```

---

### cross-step-synthesis
- **Weight:** 5%
- **Type:** LLM Judge
- **Trigger:** Agent response in Steps 5-10
- **Instructions:**
  In later steps, does agent explicitly reference insights from earlier steps?
  
  **Score A (1.0):** Explicitly connects (e.g., "Based on your 25-54 demo from Step 3, I recommend weighted allocation to Meta" or "Given your $80 CAC target from Step 2...").
  
  **Score B (0.75):** Implicit connection - uses prior data without explicit reference.
  
  **Score C (0.5):** Makes recommendation without referencing earlier data.
  
  **Score D (0.25):** Re-asks questions that were answered in earlier steps.
  
  **Score F (0.0):** Contradicts earlier step decisions or ignores prior context entirely.

- **Expected Synthesis Connections:**
```
Step 5 (Budget) should reference:
- Step 2: Efficiency targets
- Step 4: Geography distribution

Step 7 (Channels) should reference:
- Step 3: Audience demographics and behaviors
- Step 4: Geography scope

Step 8 (Measurement) should reference:
- Step 1: Primary KPI
- Step 2: Economics targets
- Step 7: Channel mix
```

- **Judge Prompt:**
```
Evaluate if agent synthesizes insights from earlier steps in current recommendation.

Current step: {current_step}
Prior step insights:
- Step 1 (Outcomes): {step1_summary}
- Step 2 (Economics): {step2_summary}
- Step 3 (Audience): {step3_summary}
- Step 4 (Geography): {step4_summary}

Agent response: {agent_response}

GOOD SYNTHESIS:
- Explicit reference: "Based on your [X] from Step [N]..."
- Connects current recommendation to prior decision
- Shows how earlier data informs current guidance

POOR SYNTHESIS:
- Re-asks already answered questions
- Makes recommendation without referencing relevant prior data
- Contradicts earlier decisions

Score 0.0-1.0 with rationale.
Return JSON: {"score": X.X, "rationale": "..."}
```

---

### response-formatting
- **Weight:** 4%
- **Type:** Code
- **Trigger:** Every agent response
- **Instructions:**
  Visual hierarchy per KB requirements:
  - Calculations on own lines, not embedded in prose (-0.3 if embedded)
  - Tables for comparative data with 3+ items (-0.3 if prose list instead)
  - Paragraph breaks between concepts (-0.2 if wall of text)
  
  **Score:** 1.0 - deductions

- **Code Pattern:**
```typescript
function scoreResponseFormatting(response: string): number {
  let score = 1.0;
  
  // Check for embedded calculations
  if (hasEmbeddedCalculation(response)) {
    score -= 0.3;
  }
  
  // Check for prose lists that should be tables
  if (hasProseListNeedingTable(response)) {
    score -= 0.3;
  }
  
  // Check for wall of text
  if (isWallOfText(response)) {
    score -= 0.2;
  }
  
  return Math.max(0, score);
}

function hasEmbeddedCalculation(text: string): boolean {
  // Calculation embedded in prose: "...which works out to $80 per customer..."
  return /\w+\s+\$[\d,]+\s*[\/\*]\s*[\d,]+\s*=\s*\$?[\d,]+\s+\w+/.test(text);
}

function hasProseListNeedingTable(text: string): boolean {
  // Multiple DMAs or items listed in prose that should be table
  const dmaPattern = /\b[A-Z][a-z]+,?\s+(CA|NY|TX|FL|IL|PA|OH|GA|NC|MI)\b/g;
  const matches = text.match(dmaPattern);
  return matches && matches.length >= 3;
}

function isWallOfText(text: string): boolean {
  // No paragraph breaks in text over 150 words
  const wordCount = text.split(/\s+/).length;
  const paragraphs = text.split(/\n\s*\n/).length;
  return wordCount > 150 && paragraphs === 1;
}
```

---

## REMOVED SCORERS (DO NOT IMPLEMENT)

| Removed Scorer | Rationale |
|----------------|-----------|
| calculation-presence | Merged into proactive-calculation |
| precision-connection | Too narrow; covered by feasibility-framing |
| audience-completeness (old) | Replaced by audience-sizing-completeness |
| progress-over-perfection | Covered by proactive-calculation + idk-protocol |
| step-completion-rate | Wrong metric - measures completion not quality |
| conversation-efficiency | Wrong metric - turns don't indicate quality |
| greeting-uniqueness | Irrelevant to guidance quality |
| context-retention | Covered by cross-step-synthesis |
| loop-detection | Covered by cross-step-synthesis (detects re-asking) |

---

## COMPOSITE SCORE CALCULATION

```typescript
const SCORER_WEIGHTS = {
  // Tier 1: Core Quality (65%)
  'proactive-calculation': 0.15,
  'teaching-behavior': 0.12,
  'feasibility-framing': 0.10,
  'source-citation': 0.10,
  'recalculation-on-change': 0.08,
  'risk-opportunity-flagging': 0.05,
  'adaptive-sophistication': 0.05,
  
  // Tier 2: Structural Compliance (20%)
  'step-boundary': 0.06,
  'single-question': 0.05,
  'idk-protocol': 0.04,
  'response-length': 0.03,
  'acronym-definition': 0.02,
  
  // Tier 3: Advanced Quality (15%)
  'audience-sizing-completeness': 0.06,
  'cross-step-synthesis': 0.05,
  'response-formatting': 0.04
};

function computeCompositeScore(scorerResults: Record<string, number>): number {
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const [scorer, weight] of Object.entries(SCORER_WEIGHTS)) {
    if (scorerResults[scorer] !== undefined) {
      weightedSum += scorerResults[scorer] * weight;
      totalWeight += weight;
    }
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

// Quality thresholds
const QUALITY_THRESHOLDS = {
  excellent: 0.90,
  good: 0.80,
  pass: 0.70,
  fail: 0.70
};
```

---

## IMPLEMENTATION CHECKLIST

- [ ] Create `scorers/proactive-calculation.ts`
- [ ] Create `scorers/teaching-behavior.ts`
- [ ] Create `scorers/feasibility-framing.ts`
- [ ] Create `scorers/source-citation.ts`
- [ ] Create `scorers/recalculation-on-change.ts`
- [ ] Create `scorers/risk-opportunity-flagging.ts`
- [ ] Create `scorers/adaptive-sophistication.ts`
- [ ] Create `scorers/step-boundary.ts`
- [ ] Create `scorers/single-question.ts`
- [ ] Create `scorers/idk-protocol.ts`
- [ ] Create `scorers/response-length.ts`
- [ ] Create `scorers/acronym-definition.ts`
- [ ] Create `scorers/audience-sizing-completeness.ts`
- [ ] Create `scorers/cross-step-synthesis.ts`
- [ ] Create `scorers/response-formatting.ts`
- [ ] Create `scorers/composite.ts` for aggregation
- [ ] Update `scorers/index.ts` to export all scorers
- [ ] Remove deprecated scorers from codebase


---

## PROCESS INSTRUCTIONS

For implementation workflow, testing protocols, and iteration requirements, see:
`CONTINUATION_PROMPT_Scorer_Implementation.md`

This includes:
- Holistic KB + Instructions evaluation approach
- Character limit requirements for Copilot instructions
- Automated slash command updates
- Test progress reporting protocols
