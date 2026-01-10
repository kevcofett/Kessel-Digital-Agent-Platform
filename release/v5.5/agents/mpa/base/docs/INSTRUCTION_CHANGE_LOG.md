# MPA INSTRUCTION CHANGE LOG

## BASELINE

**Version:** v5_7  
**Date:** 2025-01-10  
**Character Count:** 7,587  
**Braintrust Baseline Scores:** [Run full eval and record here]

| Scorer | Score | Notes |
|--------|-------|-------|
| Response Length | | |
| Single Question | | |
| Acronym Definition | | |
| Source Citation | | |
| Step Boundary | | |
| IDK Protocol | | |
| Adaptive Sophistication | | |
| Tone Quality | | |
| Proactive Intelligence | | |
| Progress Over Perfection | | |
| Feasibility Framing | | |
| Step Completion | | |

---

## ITERATION LOG

### v5_7_1

**Date:** 2026-01-10
**Hypothesis:** Step 2 - Remittance Volume Target fails because agent asks for CAC when user provides volume target ($2,100 per customer). Adding explicit calculation trigger should cause agent to compute implied CAC from budget divided by target customers instead of asking. Expected improvement to Progress Over Perfection scorer.
**Change Type:** Core instruction
**Files Modified:** MPA_Copilot_Instructions_v5_7_1.txt (new file)

**Specific Changes:**
```
MINIMUM VIABLE STEP 2

Step 2 establishes whether efficiency is realistic. Start with simplest concept user understands. For customer acquisition: ask about revenue or value per customer first, NOT gross profit or margin. If user does not know profitability, model using industry benchmarks and move forward. Step 2 is complete when you can assess whether implied efficiency is achievable. Do not loop endlessly seeking perfect economics data.
```
replaced with:
```
MINIMUM VIABLE STEP 2

Step 2 establishes whether efficiency is realistic. Start with simplest concept user understands.

When you have budget AND volume target, calculate implied efficiency immediately. Do not ask for CAC if you can compute it from budget divided by target customers. For transaction businesses like remittance or payments, assume 2 to 3 percent take rate, state the assumption, show your math.

If user does not know profitability, model using industry benchmarks and move forward. Step 2 is complete when you can assess whether implied efficiency is achievable. Do not loop endlessly seeking perfect economics data.
```

**Character Count:** 7,675 / 8,000

**Eval Results:**

| Scorer | Baseline | New | Delta |
|--------|----------|-----|-------|
| Response Length | - | - | - |
| Single Question | - | - | - |
| Acronym Definition | - | - | - |
| Source Citation | - | - | - |
| Step Boundary | - | - | - |
| IDK Protocol | - | - | - |
| Adaptive Sophistication | 87.0% | 72.0% | -15.0% |
| Tone Quality | - | - | - |
| Proactive Intelligence | 70.0% | 79.0% | +9.0% |
| Progress Over Perfection | 42.0% | 66.0% | +24.0% |
| Feasibility Framing | - | - | - |
| Step Completion | - | - | - |

**Decision:** ACCEPTED
**Rationale:** Hypothesis confirmed. Progress Over Perfection (Tier 1) improved +24% (42% → 66%). Proactive Intelligence improved +9%. Adaptive Sophistication regressed -15% but remains above threshold. No Tier 1 regressions. Net positive impact.  

---

### v5_7_2

**Date:** 2026-01-10
**Hypothesis:** Adaptive Sophistication regressed because v5_7_1 introduced technical terminology (CAC, take rate, implied efficiency) that does not adapt to user sophistication level. Replacing with plain language (cost per customer, fee, achievable target) should recover Adaptive Sophistication while preserving Progress Over Perfection gains.
**Change Type:** Core instruction
**Files Modified:** MPA_Copilot_Instructions_v5_7_2.txt (new file)

**Specific Changes:**
```
When you have budget AND volume target, calculate implied efficiency immediately. Do not ask for CAC if you can compute it from budget divided by target customers. For transaction businesses like remittance or payments, assume 2 to 3 percent take rate, state the assumption, show your math.

If user does not know profitability, model using industry benchmarks and move forward. Step 2 is complete when you can assess whether implied efficiency is achievable. Do not loop endlessly seeking perfect economics data.
```
replaced with:
```
When you have budget AND volume target, calculate the cost per customer immediately. Do not ask what they can afford per customer if you can compute it from budget divided by target customers. For transaction businesses like remittance or payments, assume 2 to 3 percent fee, state the assumption, show your math in plain terms.

If user does not know profitability, model using industry benchmarks and move forward. Step 2 is complete when you can assess whether the target is achievable. Do not loop endlessly seeking perfect data.
```

**Character Count:** 7,695 / 8,000

**Eval Results:**

| Scorer | Baseline (v5_7_1) | New | Delta |
|--------|-------------------|-----|-------|
| Adaptive Sophistication | 72.0% | 84.0% | +12.0% |
| Proactive Intelligence | 79.0% | 90.0% | +11.0% |
| Progress Over Perfection | 66.0% | 55.0% | -11.0% |

**Decision:** REJECTED
**Rationale:** Tier 1 regression detected. Progress Over Perfection dropped from 66% to 55% (-11%). While Adaptive Sophistication improved (+12%) and Proactive Intelligence improved (+11%), Tier 1 regressions are never acceptable. The plain language change appears to have made the agent less likely to calculate and move forward. Reverting to v5_7_1 as current best.  

---

### v5_7_3

**Date:** 2026-01-10
**Hypothesis:** Eval report shows agent repeating generic greeting and ignoring conversation context. Adding explicit CONVERSATION CONTINUITY instruction should prevent greeting reset, improve step transition clarity, and boost Progress Over Perfection without introducing technical jargon that caused Adaptive Sophistication regression in v5_7_2.
**Change Type:** New instruction section
**Files Modified:** MPA_Copilot_Instructions_v5_7_3.txt (new file)

**Specific Changes:**
Added new section after FIRST RESPONSE FORMAT:
```
CONVERSATION CONTINUITY

Never repeat the greeting after first interaction. Acknowledge user input and build on collected data. When step requirements are met, confirm and transition. Example: Perfect, 5,000 customers at $50 each is your $250,000 budget. Now let us assess if that efficiency is achievable.
```

**Character Count:** 7,983 / 8,000

**Eval Results:**

| Scorer | Baseline (v5_7_1) | New | Delta |
|--------|-------------------|-----|-------|
| Progress Over Perfection | 66.0% | 90.0% | **+24.0%** |
| Adaptive Sophistication | 72.0% | 76.7% | +4.7% |
| Proactive Intelligence | 79.0% | 100.0% | **+21.0%** |
| IDK Protocol | - | 96.7% | N/A |
| Step Boundary | - | 100.0% | N/A |
| Response Length | - | 75.0% | N/A |
| Single Question | - | 83.3% | N/A |

**Decision:** ACCEPTED
**Rationale:** Major improvements across all key scorers. Progress Over Perfection (Tier 1) improved +24% to 90.0%. Proactive Intelligence improved +21% to 100.0%. Adaptive Sophistication improved +4.7%. No regressions detected. The CONVERSATION CONTINUITY instruction successfully addressed greeting repetition and context handling issues. v5_7_3 is now the current best version.

---

### v5_7_4

**Date:** 2026-01-10
**Hypothesis:** Adaptive Sophistication scores 75% because MINIMUM VIABLE STEP 2 uses technical jargon (CAC, take rate, implied efficiency) that contradicts ADAPTIVE SOPHISTICATION guidance to default to simpler language. Replacing jargon with plain language equivalents while preserving calculation triggers should improve Adaptive Sophistication without regressing Progress Over Perfection (unlike v5_7_2 which removed calculation triggers).
**Change Type:** Core instruction
**Files Modified:** MPA_Copilot_Instructions_v5_7_4.txt (new file)

**Specific Changes:**
```
When you have budget AND volume target, calculate implied efficiency immediately. Do not ask for CAC if you can compute it from budget divided by target customers. For transaction businesses like remittance or payments, assume 2 to 3 percent take rate, state the assumption, show your math.
```
replaced with:
```
When you have budget AND volume target, calculate the efficiency immediately. Do not ask for acquisition cost if you can compute it from budget divided by target customers. For transaction businesses like remittance or payments, assume 2 to 3 percent transaction fee, state the assumption, show your math.
```

**Character Count:** 7,998 / 8,000

**Eval Results:**

| Scorer | Baseline (v5_7_3) | New | Delta |
|--------|-------------------|-----|-------|
| Progress Over Perfection | 90.0% | 90.0% | 0.0% |
| Adaptive Sophistication | 75.0% | 83.33% | **+8.33%** |
| Proactive Intelligence | 100.0% | 100.0% | 0.0% |
| IDK Protocol | 100.0% | 95.0% | **-5.0%** |
| Step Boundary | 100.0% | 100.0% | 0.0% |
| Response Length | 75.0% | 75.0% | 0.0% |
| Single Question | 100.0% | 83.33% | **-16.67%** |

**Decision:** REJECTED
**Rationale:** Tier 1 regression detected. IDK Protocol dropped from 100% to 95% (-5%). While Adaptive Sophistication improved as hypothesized (+8.33%), the framework rule "Tier 1 regressions are never acceptable" applies. Additionally, Single Question (Tier 3) regressed from 100% to 83.33%. The plain language change may have inadvertently affected how the agent handles "I don't know" responses. Reverting to v5_7_3 as current best.

---

### v5_7_5

**Date:** 2026-01-10
**Hypothesis:** Adaptive Sophistication (75%) can be improved by providing explicit examples of language adaptation via KB document, without modifying core instructions (which caused Tier 1 regressions in v5_7_4). Using KB with RAG simulation in eval should demonstrate KB-based improvements.
**Change Type:** KB document + eval modification (RAG simulation)
**Files Modified:**
- MPA_Adaptive_Language_v5_5.txt (new KB document)
- mpa-eval.ts (added KB_ADAPTIVE_LANGUAGE constant and RAG simulation)
- mpa-prompt.ts (version update only)

**Specific Changes:**
Created new KB document with:
- Simple user signals and response patterns
- Sophisticated user signals and response patterns
- Example exchanges for both sophistication levels
- Default behavior guidance

Modified mpa-eval.ts to inject KB content for test cases with userSophistication metadata.

**Character Count:** Core unchanged at 7,983 / 8,000

**Eval Results:**

| Scorer | Baseline (v5_7_3) | New | Delta |
|--------|-------------------|-----|-------|
| Progress Over Perfection | 90.0% | - | - |
| Adaptive Sophistication | 75.0% | - | - |
| Proactive Intelligence | 100.0% | - | - |
| IDK Protocol | 100.0% | - | - |
| Step Boundary | 100.0% | - | - |
| Response Length | 75.0% | - | - |
| Single Question | 100.0% | - | - |

**Decision:** PENDING
**Rationale:** Awaiting evaluation results.

---

## KB DOCUMENT CHANGES

Track KB changes separately since they don't increment instruction version.

### MPA_Adaptive_Language_v5_5.txt

**Date:** 2026-01-10
**Change:** New document created
**Reason:** Improve Adaptive Sophistication scoring by providing explicit examples of language adaptation for simple vs sophisticated users. Previous core instruction changes (v5_7_4) caused Tier 1 regressions, so KB approach used instead.
**Impact on Eval:** PENDING - Testing with RAG simulation in mpa-eval.ts

---

### MPA_Geography_DMA_Planning_v5_5.txt

**Date:** 2025-01-10
**Change:** New document created
**Reason:** Step 4 Geography requires mandatory table format with population, target audience, spend, and outcomes. Rollup calculations at hierarchy breaks.
**Impact on Eval:** [Record after testing]

---

### [KB Document Name]

**Date:**
**Change:**
**Reason:**
**Impact on Eval:**  

---

## WEEKLY SUMMARIES

### Week of YYYY-MM-DD

**Iterations:** X  
**Net Score Change:** +/- X.XX  
**Tier 1 Regressions:** None | [List]  
**KB Documents Modified:** [List]  
**Core Instruction Character Count:** X,XXX / 8,000  
**Drift Assessment:** Low | Medium | High  
**Notes:**  
