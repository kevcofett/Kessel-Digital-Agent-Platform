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

**Date:**  
**Hypothesis:**  
**Change Type:**  
**Files Modified:**  

**Specific Changes:**
```
[Exact text removed]
```
replaced with:
```
[Exact text added]
```

**Eval Results:**

| Scorer | Baseline | New | Delta |
|--------|----------|-----|-------|
| | | | |

**Decision:**  
**Rationale:**  

---

## KB DOCUMENT CHANGES

Track KB changes separately since they don't increment instruction version.

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
