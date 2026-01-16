---
description: Test multiple instruction variants and pick the winner
---

Test 2-3 different instruction approaches for the same problem and select the best performer.

STEP 1 - LOAD CONTEXT

Read these files:
- /release/v5.5/agents/mpa/base/docs/MPA_Instruction_Iteration_Framework.md
- /release/v5.5/agents/mpa/base/docs/OPTIMIZATION_SCORING_CONFIG.md
- /release/v5.5/agents/mpa/base/docs/INSTRUCTION_CHANGE_LOG.md

STEP 2 - IDENTIFY PROBLEM

Ask user or identify from last eval:
- Which test case or scorer needs improvement?
- What is the current behavior?
- What is the desired behavior?

STEP 3 - GENERATE VARIANTS

Create 2-3 different approaches to solve the same problem.

VARIANT A: Conservative approach
- Minimal change
- Lowest risk
- File: MPA_Copilot_Instructions_v5_7_Xa.txt

VARIANT B: Moderate approach  
- More significant change
- Medium risk
- File: MPA_Copilot_Instructions_v5_7_Xb.txt

VARIANT C: Aggressive approach (optional)
- Largest change
- Highest risk/reward
- File: MPA_Copilot_Instructions_v5_7_Xc.txt

For each variant:
1. Describe the approach in plain language
2. Show exact text changes
3. Explain expected impact
4. Verify < 8,000 characters
5. Verify Copilot formatting compliance

Present all variants to user:
```
VARIANT A (Conservative):
- Approach: {description}
- Change: {exact text}
- Risk: Low
- Expected impact: {prediction}

VARIANT B (Moderate):
- Approach: {description}
- Change: {exact text}
- Risk: Medium
- Expected impact: {prediction}

VARIANT C (Aggressive):
- Approach: {description}
- Change: {exact text}
- Risk: High
- Expected impact: {prediction}
```

Ask: "Create and test all variants? (yes/no)"

STEP 4 - CREATE VARIANT FILES

For each approved variant:
1. Copy current best version as base
2. Apply the variant's changes
3. Save to /release/v5.5/agents/mpa/base/copilot/
4. Verify character count and formatting
5. Commit with message: "Add variant X for testing: {description}"

STEP 5 - RUN EVALUATIONS

For each variant, run multi-turn evaluation with fast mode:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust

# Update mpa-prompt-content.ts with variant content, then rebuild
npx tsc

# Run evaluation (--fast uses Haiku simulator + FAST_SCORING judges for 10x speed)
node dist/mpa-multi-turn-eval.js --fast --track-kb
```

Wait for all evaluations to complete. Results are saved to outputs/run-XXX/.

STEP 6 - COLLECT RESULTS

Results are automatically saved to numbered run folders. For each variant, review:
- outputs/run-XXX/00_run_summary.md - Overall scores
- outputs/run-XXX/00_index.json - Machine-readable results

For each variant, calculate:
- All scorer outputs from turnScoreAggregates
- Composite score (overall composite from summary)
- Any Tier 1 regressions from baseline

STEP 7 - COMPARE AND SELECT WINNER

Create comparison table:

```
VARIANT COMPARISON
==================
                    | Baseline | Variant A | Variant B | Variant C |
--------------------|----------|-----------|-----------|-----------|
COMPOSITE SCORE     |   0.XXX  |   0.XXX   |   0.XXX   |   0.XXX   |
--------------------|----------|-----------|-----------|-----------|
Tier 1 (weight 3.0) |          |           |           |           |
  IDK Protocol      |   0.XX   |   0.XX    |   0.XX    |   0.XX    |
  Progress Over Perf|   0.XX   |   0.XX    |   0.XX    |   0.XX    |
  Step Boundary     |   0.XX   |   0.XX    |   0.XX    |   0.XX    |
--------------------|----------|-----------|-----------|-----------|
Tier 2 (weight 2.0) |          |           |           |           |
  Adaptive Sophist  |   0.XX   |   0.XX    |   0.XX    |   0.XX    |
  Source Citation   |   0.XX   |   0.XX    |   0.XX    |   0.XX    |
  Tone Quality      |   0.XX   |   0.XX    |   0.XX    |   0.XX    |
--------------------|----------|-----------|-----------|-----------|
Tier 3 (weight 1.0) |          |           |           |           |
  Response Length   |   0.XX   |   0.XX    |   0.XX    |   0.XX    |
  Single Question   |   0.XX   |   0.XX    |   0.XX    |   0.XX    |
  Proactive Intel   |   0.XX   |   0.XX    |   0.XX    |   0.XX    |
--------------------|----------|-----------|-----------|-----------|
Tier 4 (weight 0.5) |          |           |           |           |
  Feasibility Frame |   0.XX   |   0.XX    |   0.XX    |   0.XX    |
  Step Completion   |   0.XX   |   0.XX    |   0.XX    |   0.XX    |
  Acronym Definition|   0.XX   |   0.XX    |   0.XX    |   0.XX    |
--------------------|----------|-----------|-----------|-----------|
Character Count     |   XXXX   |   XXXX    |   XXXX    |   XXXX    |
Tier 1 Regressions  |    -     |   Y/N     |   Y/N     |   Y/N     |
```

WINNER SELECTION RULES:

1. Disqualify any variant with Tier 1 regression
2. Among remaining, highest composite wins
3. Winner must beat baseline by >= 0.02
4. If tie within 0.01, prefer fewer characters
5. If no variant beats baseline by 0.02, reject all

STEP 8 - IMPLEMENT WINNER

IF winner found:
    1. Rename winner file to next version number (v5_7_X.txt)
    2. Delete losing variant files
    3. Update VERSION_DASHBOARD.md
    4. Update INSTRUCTION_CHANGE_LOG.md with:
       - All variants tested
       - All scores
       - Winner and rationale
    5. Commit: "Accept variant {X}: {description} (composite: {score})"
    6. Push to deploy/personal

IF no winner:
    1. Delete all variant files
    2. Update INSTRUCTION_CHANGE_LOG.md with:
       - All variants tested
       - All scores
       - Reason for rejection
    3. Commit: "Reject all variants for {problem}: none beat baseline by 0.02"
    4. Suggest alternative approaches

STEP 9 - REPORT

```
VARIANT TESTING COMPLETE
========================
Problem: {description}
Variants tested: {count}
Winner: {variant or "None"}
Composite improvement: {delta}
Reason: {explanation}

Next steps:
- {recommendations}
```

HARD RULES

1. NEVER accept variant with Tier 1 regression
2. ALWAYS test against same dataset
3. ALWAYS delete losing variant files after decision
4. MINIMUM 0.02 improvement required to accept
5. ALWAYS document all variants in change log
6. MAX 3 variants per comparison
