---
description: Compare Braintrust results after iteration and decide accept/reject
---

Check Braintrust evaluation results after an iteration and decide whether to accept or reject the change.

STEP 1 - FETCH NEW RESULTS

Run this command to get the latest evaluation results:
```bash
npx braintrust eval list --project MPA --limit 1 --format json
```

STEP 2 - LOAD BASELINE

Read the change log to get baseline scores:
/release/v5.5/agents/mpa/base/docs/INSTRUCTION_CHANGE_LOG.md

STEP 3 - COMPARE SCORES

Create a comparison table:

| Scorer | Baseline | New | Delta | Status |
|--------|----------|-----|-------|--------|
| Response Length | X.XX | X.XX | +/-X.XX | ✅/⚠️/❌ |
| Single Question | | | | |
| Acronym Definition | | | | |
| Source Citation | | | | |
| Step Boundary | | | | |
| IDK Protocol | | | | |
| Adaptive Sophistication | | | | |
| Tone Quality | | | | |
| Proactive Intelligence | | | | |
| Progress Over Perfection | | | | |
| Feasibility Framing | | | | |
| Step Completion | | | | |

Status key:
- ✅ Improved or stable
- ⚠️ Minor regression (< 0.1)
- ❌ Major regression (>= 0.1)

STEP 4 - CHECK TIER 1 REGRESSIONS

Tier 1 scorers (NEVER regress):
- IDK Protocol
- Progress Over Perfection  
- Step Boundary

If ANY Tier 1 scorer regressed, recommend REJECT.

STEP 5 - CALCULATE NET IMPACT

Sum of all deltas weighted by tier:
- Tier 1: weight 3x
- Tier 2: weight 2x
- Tier 3: weight 1x
- Tier 4: weight 0.5x

STEP 6 - RECOMMEND

Based on analysis, recommend one of:

ACCEPT - No Tier 1 regressions, positive net impact
- Update change log with final scores
- Mark decision as "Accepted"
- Commit change log update

REJECT - Tier 1 regression or negative net impact
- Revert the instruction change
- Update change log with scores and "Rejected" decision
- Commit revert

MODIFY FURTHER - Mixed results, potential identified
- Keep current change
- Propose additional hypothesis to address regressions
- Enter new iteration cycle

STEP 7 - UPDATE CHANGE LOG

Regardless of decision, update INSTRUCTION_CHANGE_LOG.md with:
- Eval results table
- Decision (Accept/Reject/Modify)
- Rationale

Commit and push.
