# MPA SCORER v2 IMPLEMENTATION - COMPLETE INSTRUCTIONS FOR VS CODE CLAUDE

## MISSION

Implement the MPA multi-turn evaluation framework defined in SCORER_SPECIFICATION_v2.md. This is a complete restructuring from 18 scorers to 14 optimized scorers with a three-tier weighting system. DO NOT STOP until composite score exceeds 92%.

---

## STEP 1: READ THESE FILES FIRST (MANDATORY)

Before writing ANY code, read these files in order:

```bash
# 1. Full scorer specification
cat /release/v5.5/agents/mpa/base/tests/braintrust/SCORER_SPECIFICATION_v2.md

# 2. Current instructions (to understand character count baseline)
wc -c /release/v5.5/agents/mpa/base/copilot/MPA_Copilot_Instructions_v5_7.txt

# 3. Current scorer implementations
ls -la /release/v5.5/agents/mpa/base/tests/braintrust/scorers/

# 4. Key KB files that define expected behavior
cat /release/v5.5/agents/mpa/base/kb/MPA_Calculation_Display_v5_5.txt
cat /release/v5.5/agents/mpa/base/kb/MPA_Step_Boundary_Guidance_v5_5.txt
cat /release/v5.5/agents/mpa/base/kb/MPA_Conversation_Examples_v5_5.txt
cat /release/v5.5/agents/mpa/base/kb/Data_Provenance_Framework_v5_5.txt
```

---

## STEP 2: UNDERSTAND THE TARGET STATE

### NEW SCORER_WEIGHTS (14 Scorers, 100% Total)

```typescript
export const SCORER_WEIGHTS: Record<string, number> = {
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
```

### SCORERS TO REMOVE (Do Not Implement)

- calculation-presence (merged into proactive-calculation)
- precision-connection (covered by feasibility-framing)
- audience-completeness (replaced by audience-sizing-completeness)
- progress-over-perfection (covered by proactive-calculation + idk-protocol)
- step-completion-rate (wrong metric)
- conversation-efficiency (wrong metric)
- greeting-uniqueness (irrelevant)
- context-retention (covered by cross-step-synthesis)
- loop-detection (covered by cross-step-synthesis)

---

## STEP 3: IMPLEMENTATION PHASES

### PHASE 1: LLM Judge Infrastructure + Core Scorers

**CREATE: `scorers/llm-judge.ts`**
```typescript
// Infrastructure for all LLM-based scorers
interface JudgeResult {
  score: number;
  rationale: string;
}

interface JudgePromptContext {
  agent_response: string;
  user_message?: string;
  conversation_history?: string;
  step_number?: number;
  available_data?: Record<string, any>;
  [key: string]: any;
}

export async function callLLMJudge(
  promptTemplate: string,
  context: JudgePromptContext
): Promise<JudgeResult>;

// Include prompt templates for each LLM scorer
export const JUDGE_PROMPTS = {
  'proactive-calculation': `...`, // From SCORER_SPECIFICATION_v2.md
  'teaching-behavior': `...`,
  'feasibility-framing': `...`,
  'risk-opportunity-flagging': `...`,
  'adaptive-sophistication': `...`,
  'cross-step-synthesis': `...`
};
```

**CREATE: `scorers/proactive-calculation.ts`** (15% weight)
- Trigger: Agent has budget AND volume target
- LLM Judge: Shows math on own line, compares to benchmark, states implication
- Scores: A=1.0, B=0.75, C=0.5, D=0.25, F=0.0

**CREATE: `scorers/teaching-behavior.ts`** (12% weight)
- Trigger: Every agent response
- LLM Judge: Teaching strategic reasoning vs interrogation
- Look for: explains WHY, provides frameworks, connects to downstream decisions

**CREATE: `scorers/feasibility-framing.ts`** (10% weight)
- Trigger: Agent has calculated efficiency differing from benchmark
- LLM Judge: Explicitly calls out aggressive/conservative with evidence and path forward

**CREATE: `scorers/source-citation.ts`** (10% weight)
- Trigger: Response contains numbers, percentages, or benchmark claims
- Code-based: Check for explicit 5-source format
- Patterns: "Based on Knowledge Base", "Based on Websearch [source:]", "Based on API Call", "Based on User Provided", "Based on Benchmark [source:]"
- Scores: 1.0 explicit, 0.7 implicit, 0.3 no attribution, 0.0 fabricated

### PHASE 2: Compliance Scorers

**MODIFY: `turn-scorers.ts` - scoreSingleQuestion()**
```typescript
// STRICTER: KB says "ONE question. Maximum. No exceptions."
function scoreSingleQuestion(response: string): number {
  const count = countQuestions(response);
  if (count <= 1) return 1.0;
  if (count === 2) return 0.5;
  return 0.0; // 3+ questions
}

function countQuestions(text: string): number {
  const questionMarks = (text.match(/\?/g) || []).length;
  const implicitPatterns = [
    /could you (tell|share|provide)/i,
    /would you (say|describe)/i,
    /what about/i,
    /how about/i
  ];
  let implicitCount = implicitPatterns.filter(p => p.test(text)).length;
  return questionMarks + implicitCount;
}
```

**MODIFY: `turn-scorers.ts` - scoreResponseLength()**
```typescript
// KB says "under 75 words when possible"
function scoreResponseLength(response: string): number {
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
```

**VERIFY: `scorers/step-boundary.ts`** (6% weight)
- Ensure channel recommendation patterns are comprehensive
- Hard rule: Score 1.0 or 0.0, no middle ground

**VERIFY: `scorers/idk-protocol.ts`** (4% weight)
- Components: assumption (+0.25), source (+0.25), refinement (+0.25), move forward (+0.25)
- Deduction: pushing for answer (-0.5)

### PHASE 3: Remaining Core + Advanced Scorers

**CREATE: `scorers/recalculation-on-change.ts`** (8% weight)
- Hybrid: Code detection + LLM evaluation
- Code: Detect if user provided NEW quantitative data differing from prior value
- LLM: Evaluate if agent showed new math, explained delta from prior

**MODIFY: `scorers/risk-opportunity-flagging.ts`** (5% weight)
- LLM Judge: Proactively surfaces risks/opportunities user didn't ask about

**MODIFY: `scorers/adaptive-sophistication.ts`** (5% weight)
- LLM Judge: Response complexity matches user sophistication level

**CREATE: `scorers/audience-sizing-completeness.ts`** (6% weight)
- Code-based table analysis
- 7 components (15% each except Target %):
  - DMA/Geography column (15%)
  - Total Population column (15%)
  - Target Audience column as whole numbers (15%)
  - Target % column (10%)
  - TOTAL row with aggregation (15%)
  - Multiple DMAs if regional/national (15%)
  - Weighted average for percentages in TOTAL (15%)

**CREATE: `scorers/cross-step-synthesis.ts`** (5% weight)
- Trigger: Steps 5-10
- LLM Judge: References insights from earlier steps
- Detects re-asking already-answered questions (failure mode)

**MODIFY: `turn-scorers.ts` - scoreResponseFormatting()** (4% weight)
- Deductions: embedded calculations (-0.3), prose lists needing tables (-0.3), wall of text (-0.2)

### PHASE 4: Integration + Test Runner

**UPDATE: `mpa-multi-turn-types.ts`**
- Replace SCORER_WEIGHTS with new 14-scorer structure
- Remove references to deprecated scorers

**UPDATE: `scorers/index.ts`**
- Export all new scorers
- Remove deprecated scorer exports
- Update composite score calculation

**ADD: 60-Second Progress Reporting to Test Runner**

During test execution, output every 60 seconds:
```
[MM:SS] TESTING IN PROGRESS
- Scenarios complete: X/Y
- Current scenario: {name}
- Running scorer: {scorer_name}
- Preliminary composite: X.XX
- Issues detected: {count}
```

After each scenario:
```
[SCENARIO COMPLETE] {scenario_name}
- Composite score: X.XX
- Top 3 failures:
  1. {scorer}: {score} - {reason}
  2. {scorer}: {score} - {reason}
  3. {scorer}: {score} - {reason}
```

**REMOVE: Deprecated scorers from codebase**
- Delete or comment out removed scorer functions
- Clean up imports

### PHASE 5: Instructions + Slash Commands

**UPDATE: Core Instructions**
- File: `MPA_Copilot_Instructions_v5_7.txt`
- Target: 7,500-7,599 characters (STRICT)
- Current is likely over; compress or move detail to KB

**VALIDATE: Copilot Compliance**
```bash
# Character count (must be 7,500-7,599)
wc -c MPA_Copilot_Instructions_v5_7.txt

# Formatting compliance (must return nothing)
grep -E '^[#*`-]|[^\x00-\x7F]' MPA_Copilot_Instructions_v5_7.txt
```

**UPDATE: `slash_commands.json`**
- Sync slash commands with any instruction changes
- Ensure new behavioral patterns are reflected

---

## STEP 4: CRITICAL REQUIREMENTS

### A. HOLISTIC KB + INSTRUCTIONS EVALUATION

Before ANY instruction change:
1. Read ALL relevant KB files to understand full behavioral contract
2. KB files define the WHY (frameworks, examples, rules)
3. Instructions define the HOW (condensed directives)
4. Scorers validate BOTH

When test scores are low, analyze:
1. Is the instruction unclear? → Revise instruction
2. Is the KB guidance missing? → Add KB content
3. Is the KB guidance conflicting? → Resolve KB conflict
4. Is the scorer wrong? → Adjust scorer

### B. CHARACTER LIMITS (NON-NEGOTIABLE)

**Core instructions MUST be 7,500-7,599 characters.**

- Check after EVERY edit: `wc -c MPA_Copilot_Instructions_v5_7.txt`
- If under 7,500: Add clarifying guidance from KB
- If over 7,599: Compress or move detail to KB
- Never sacrifice clarity for character count - restructure instead

### C. COPILOT FORMATTING COMPLIANCE

Instructions must be 100% compliant:
- NO markdown (no #, *, `, -)
- NO emojis or special Unicode
- NO tables or bullet points
- Plain text only with line breaks
- ALL-CAPS for section headers

### D. AUTOMATIC SLASH COMMAND UPDATES

After EVERY round of testing that results in instruction changes:
1. Update `slash_commands.json`
2. Ensure slash commands reflect current instruction capabilities
3. Sync any new behavioral patterns

---

## STEP 5: WORKFLOW LOOP

```
1. Run test suite
2. Report progress every 60 seconds
3. After each scenario, report composite + top 3 failures
4. Analyze failures holistically (instructions + KB)
5. Propose changes with rationale
6. Update instructions (maintain 7,500-7,599 chars)
7. Update KB if needed
8. Update slash commands if instructions changed
9. Verify Copilot compliance
10. Commit all changes together
11. Re-run tests
12. REPEAT UNTIL COMPOSITE > 0.92 (DO NOT STOP BEFORE THIS)
```

---

## STEP 6: VERIFICATION AFTER EACH PHASE

```bash
# Compile TypeScript
npx tsc

# Run fast test
node dist/mpa-multi-turn-eval.js --fast

# Check for errors
echo $?
```

### Quality Thresholds
- Excellent: ≥0.92 (TARGET - DO NOT STOP UNTIL ACHIEVED)
- Good: ≥0.80
- Pass: ≥0.70
- Fail: <0.70

---

## STEP 7: FILES SUMMARY

### CREATE (New Files)
| File | Purpose |
|------|---------|
| `scorers/llm-judge.ts` | LLM judge infrastructure + prompt templates |
| `scorers/proactive-calculation.ts` | 15% - Core math display scorer |
| `scorers/teaching-behavior.ts` | 12% - Teaching vs interrogation |
| `scorers/feasibility-framing.ts` | 10% - Benchmark comparison + path forward |
| `scorers/source-citation.ts` | 10% - 5-source citation format |
| `scorers/recalculation-on-change.ts` | 8% - Hybrid reforecast scorer |
| `scorers/audience-sizing-completeness.ts` | 6% - Table component analysis |
| `scorers/cross-step-synthesis.ts` | 5% - Cross-step reference detection |

### MODIFY (Existing Files)
| File | Changes |
|------|---------|
| `turn-scorers.ts` | Update single-question, response-length, response-formatting |
| `mpa-multi-turn-types.ts` | Replace SCORER_WEIGHTS |
| `scorers/index.ts` | Update exports, composite calculation |
| `MPA_Copilot_Instructions_v5_7.txt` | Reduce to 7,500-7,599 chars |
| `slash_commands.json` | Sync with instruction changes |

### DELETE/DEPRECATE (Remove from Active Use)
- calculation-presence
- precision-connection
- audience-completeness (old)
- progress-over-perfection
- step-completion-rate
- conversation-efficiency
- greeting-uniqueness
- context-retention
- loop-detection

---

## STEP 8: SUCCESS CRITERIA

You are DONE when ALL of these are true:

- [ ] All 14 scorers implemented per SCORER_SPECIFICATION_v2.md
- [ ] SCORER_WEIGHTS totals exactly 100%
- [ ] Core instructions are 7,500-7,599 characters
- [ ] Copilot compliance check returns nothing
- [ ] TypeScript compiles without errors
- [ ] **Composite score > 0.92 on test suite**
- [ ] No critical failures during test runs
- [ ] slash_commands.json updated if instructions changed
- [ ] All deprecated scorers removed from active code

---

## START NOW

Begin with Step 1: Read the required files. Then proceed through the phases in order. Report progress every 60 seconds during testing. DO NOT STOP until composite exceeds 0.92.

```bash
# Your first command:
cat /release/v5.5/agents/mpa/base/tests/braintrust/SCORER_SPECIFICATION_v2.md
```
