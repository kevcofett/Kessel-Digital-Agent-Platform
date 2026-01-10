---
description: Compare Braintrust results after iteration, calculate composite, decide accept/reject
---

Check Braintrust evaluation results after an iteration and decide whether to accept or reject the change.

STEP 1 - LOAD CONFIGURATION

Read scoring configuration:
/release/v5.5/agents/mpa/base/docs/OPTIMIZATION_SCORING_CONFIG.md

STEP 2 - FETCH NEW RESULTS

Run this command to get the latest evaluation results:
```bash
npx braintrust eval list --project MPA --limit 1 --format json
```

Parse all 12 scorer outputs.

STEP 3 - LOAD BASELINE

Read the change log and dashboard to get baseline scores:
- /release/v5.5/agents/mpa/base/docs/INSTRUCTION_CHANGE_LOG.md
- /release/v5.5/agents/mpa/base/docs/VERSION_DASHBOARD.md

STEP 4 - CALCULATE COMPOSITE SCORES

For both baseline and new results:

Tier weights:
- Tier 1 (3.0): IDK Protocol, Progress Over Perfection, Step Boundary
- Tier 2 (2.0): Adaptive Sophistication, Source Citation, Tone Quality
- Tier 3 (1.0): Response Length, Single Question, Proactive Intelligence
- Tier 4 (0.5): Feasibility Framing, Step Completion, Acronym Definition

Formula: composite = sum(score * weight) / 19.5

STEP 5 - COMPARE SCORES

Create comparison table:

```
SCORE COMPARISON
================
                      | Baseline | New    | Delta  | Status |
----------------------|----------|--------|--------|--------|
COMPOSITE SCORE       |   0.XXX  |  0.XXX | +0.XXX |   ✅   |
----------------------|----------|--------|--------|--------|
TIER 1 (weight 3.0)   |          |        |        |        |
  IDK Protocol        |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Progress Over Perf  |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Step Boundary       |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Tier 1 Subtotal     |   0.XX   |  0.XX  | +0.XX  |        |
----------------------|----------|--------|--------|--------|
TIER 2 (weight 2.0)   |          |        |        |        |
  Adaptive Sophist    |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Source Citation     |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Tone Quality        |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Tier 2 Subtotal     |   0.XX   |  0.XX  | +0.XX  |        |
----------------------|----------|--------|--------|--------|
TIER 3 (weight 1.0)   |          |        |        |        |
  Response Length     |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Single Question     |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Proactive Intel     |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Tier 3 Subtotal     |   0.XX   |  0.XX  | +0.XX  |        |
----------------------|----------|--------|--------|--------|
TIER 4 (weight 0.5)   |          |        |        |        |
  Feasibility Frame   |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Step Completion     |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Acronym Definition  |   0.XX   |  0.XX  | +0.XX  |   ✅   |
  Tier 4 Subtotal     |   0.XX   |  0.XX  | +0.XX  |        |
----------------------|----------|--------|--------|--------|

Status key:
✅ Improved or stable (delta >= 0)
⚠️ Minor regression (delta -0.01 to -0.09)
❌ Major regression (delta <= -0.10)
🔴 Tier 1 regression (any negative delta)
```

STEP 6 - CHECK TIER 1 REGRESSIONS

Tier 1 scorers (NEVER regress):
- IDK Protocol
- Progress Over Perfection  
- Step Boundary

IF ANY Tier 1 scorer has negative delta:
    AUTOMATIC REJECT - "Tier 1 regression detected. Rejecting change."
    Do not proceed to recommendation.

STEP 7 - CHECK MINIMUM THRESHOLDS

From OPTIMIZATION_SCORING_CONFIG.md:
- Tier 1 minimum: 0.70
- Tier 2 minimum: 0.50

IF any Tier 1 scorer < 0.70:
    Flag: "CRITICAL: Tier 1 scorer below minimum threshold"

IF any Tier 2 scorer < 0.50:
    Flag: "WARNING: Tier 2 scorer below minimum threshold"

STEP 8 - CALCULATE NET IMPACT

Weighted delta = sum of (delta * tier_weight)

Report:
- Raw composite delta: {new - baseline}
- Weighted impact score: {weighted_delta}
- Percentage improvement: {(new - baseline) / baseline * 100}%

STEP 9 - RECOMMEND

Based on analysis, recommend one of:

ACCEPT - Criteria:
- No Tier 1 regressions
- Composite improved OR stable with Tier 1 improvement
- No minimum threshold violations

REJECT - Criteria:
- Any Tier 1 regression (automatic)
- Composite decreased with no offsetting Tier 1 gain
- Minimum threshold violation introduced

MODIFY FURTHER - Criteria:
- Mixed results with potential
- Composite stable but target scorer didn't improve
- Minor regressions in Tier 3/4 that could be recovered

STEP 10 - EXECUTE DECISION

IF ACCEPT:
    1. Update VERSION_DASHBOARD.md:
       - Set new version as current best
       - Add row to version history
       - Update scorer progression tables
    2. Update INSTRUCTION_CHANGE_LOG.md:
       - Record all scores in eval results table
       - Mark decision as "Accepted"
       - Add rationale
    3. Commit: "Accept v5_7_X: composite {score} (+{delta})"
    4. Push to deploy/personal

IF REJECT:
    1. Revert the instruction file change (delete new version or restore previous)
    2. Update INSTRUCTION_CHANGE_LOG.md:
       - Record all scores
       - Mark decision as "Rejected"
       - Add rationale (which scorer regressed, by how much)
    3. Commit: "Reject v5_7_X: {reason}"
    4. Push to deploy/personal

IF MODIFY FURTHER:
    1. Keep current change in place
    2. Update INSTRUCTION_CHANGE_LOG.md with partial results
    3. Propose next hypothesis to address remaining issues
    4. Ask: "Continue with proposed modification? (yes/no)"

STEP 11 - REPORT SUMMARY

```
DECISION: {ACCEPT|REJECT|MODIFY}
==================================
Version tested: {version}
Composite: {baseline} → {new} ({delta:+.3f})
Tier 1 status: {PASS|FAIL}
Minimum thresholds: {PASS|FAIL}

Rationale: {explanation}

{If ACCEPT: "Version {X} is now the current best."}
{If REJECT: "Reverted to {previous version}."}
{If MODIFY: "Proposed next change: {description}"}
```

HARD RULES

1. ANY Tier 1 regression = automatic REJECT
2. ALWAYS calculate composite score
3. ALWAYS update both change log AND dashboard
4. ALWAYS commit after decision
5. NEVER accept if minimum threshold violated
6. ALWAYS show full comparison table
