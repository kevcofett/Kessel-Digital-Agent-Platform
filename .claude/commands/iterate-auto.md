---
description: Auto-optimize MPA instructions until target score or stopping condition
---

Automated MPA instruction optimization loop. Runs iterations until composite score target is reached or stopping condition is met.

This command uses two-phase validation:

- Single-turn evaluation drives the iteration loop (fast feedback)
- Multi-turn validation gates final acceptance (when target achieved)

STEP 1 - LOAD CONFIGURATION

Read these files:
- /release/v5.5/agents/mpa/base/docs/MPA_Instruction_Iteration_Framework.md
- /release/v5.5/agents/mpa/base/docs/OPTIMIZATION_SCORING_CONFIG.md
- /release/v5.5/agents/mpa/base/docs/INSTRUCTION_CHANGE_LOG.md
- /release/v5.5/agents/mpa/base/docs/VERSION_DASHBOARD.md

STEP 2 - INITIALIZE TRACKING

Create or update tracking variables:
- iteration_count = 0
- consecutive_rejections = 0
- last_three_composites = []
- current_best_version = baseline v5_7
- current_best_composite = [from last eval]

STEP 3 - OPTIMIZATION LOOP

WHILE stopping conditions not met:

    A. INCREMENT
       iteration_count += 1
       Report: "Starting iteration {iteration_count}"

    B. FETCH RESULTS
       Run: npx braintrust eval list --project MPA --limit 1 --format json
       Parse all 12 scorer outputs

    C. CALCULATE COMPOSITE SCORE
       Using weights from OPTIMIZATION_SCORING_CONFIG.md:
       - Tier 1 (3.0): IDK Protocol, Progress Over Perfection, Step Boundary
       - Tier 2 (2.0): Adaptive Sophistication, Source Citation, Tone Quality
       - Tier 3 (1.0): Response Length, Single Question, Proactive Intelligence
       - Tier 4 (0.5): Feasibility Framing, Step Completion, Acronym Definition
       
       composite = sum(score * weight) / 19.5
       
       Report: "Composite score: {composite:.3f}"

    D. CHECK STOPPING CONDITIONS

       IF composite >= 0.90:
           Report: "Target achieved! Composite: {composite}"
           Report: "Running multi-turn validation before final acceptance..."
           GOTO STEP 3.5 (MULTI-TURN VALIDATION)

       IF len(last_three_composites) >= 3:
           IF max(last_three_composites) - min(last_three_composites) < 0.01:
               STOP - "Plateau detected. Last 3 scores: {last_three_composites}"
               GOTO STEP 4

       IF all Tier 1 scores >= 0.95 AND composite >= 0.85:
           Report: "Tier 1 perfect with good composite."
           Report: "Running multi-turn validation before final acceptance..."
           GOTO STEP 3.5 (MULTI-TURN VALIDATION)

       IF iteration_count >= 10:
           STOP - "Max iterations reached. Human review needed."
           GOTO STEP 4

       IF consecutive_rejections >= 3:
           STOP - "3 consecutive rejections. Human intervention needed."
           GOTO STEP 4

    E. CHECK MINIMUM THRESHOLDS
       IF any Tier 1 scorer < 0.70:
           Flag critical: "Tier 1 scorer below minimum threshold"
           Prioritize fixing this scorer
       
       IF any Tier 2 scorer < 0.50:
           Flag warning: "Tier 2 scorer below minimum threshold"

    F. IDENTIFY TARGET SCORER
       Priority order:
       1. Any Tier 1 < 0.80
       2. Any Tier 2 < 0.60
       3. Lowest absolute score
       
       Report: "Targeting scorer: {target_scorer} (current: {score})"

    G. ANALYZE AND PROPOSE
       For lowest-scoring test case on target scorer:
       - State the problem
       - Diagnose root cause
       - Write hypothesis
       - Determine Core vs KB
       - Propose minimal change
       
       Check human intervention triggers:
       - New KB document needed? ASK HUMAN
       - Removing instruction entirely? ASK HUMAN
       - Same test case failed twice? ASK HUMAN
       - Character count > 7,500? ASK HUMAN
       - Modifying Tier 1 behavior? ASK HUMAN

    H. IMPLEMENT CHANGE
       Follow all safeguards from /iterate:
       - Character limit < 8,000
       - Copilot formatting compliance
       - Create new version file
       - Update mpa-prompt.ts with new version name and content
       - Update mpa-eval.ts with new instruction content
       - Push prompt to Braintrust:
         BRAINTRUST_API_KEY=sk-IodwJN1b7KKJk6BUmEg1fO37rwgpIGaRWGsBuG7YFyNH3EUR npx braintrust push mpa-prompt.ts --if-exists replace
       - Update change log
       - Commit and push

    I. RUN EVALUATION
       Run: npx braintrust eval run --project MPA --prompt-file {new_version_path}
       Wait for results

    J. EVALUATE CHANGE
       Fetch new results
       Calculate new composite
       
       IF new_composite > current_best_composite AND no Tier 1 regressions:
           ACCEPT
           current_best_version = new version
           current_best_composite = new_composite
           consecutive_rejections = 0
           Update VERSION_DASHBOARD.md
       ELSE:
           REJECT
           Revert change
           consecutive_rejections += 1
       
       Append new_composite to last_three_composites (keep last 3)
       Update INSTRUCTION_CHANGE_LOG.md

    K. CONTINUE LOOP

STEP 3.5 - MULTI-TURN VALIDATION (when triggered by stopping condition)

This step runs when single-turn composite reaches target (0.90) or Tier 1 perfect condition.

Run multi-turn evaluation:

```bash
cd /release/v5.5/agents/mpa/base/tests/braintrust
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY npx ts-node --esm mpa-multi-turn-eval.ts
```

Parse results for each scenario:

- basic-user-step1-2: threshold 0.70
- sophisticated-idk-protocol: threshold 0.70
- full-10-step: threshold 0.65

Calculate multi-turn average and check for critical failures.

Evaluate multi-turn status:

IF MULTI-TURN PASS (all thresholds met, no critical failures, average >= 0.68):

- Calculate combined score: (Single-Turn x 0.6) + (Multi-Turn Avg x 0.4)
- IF combined >= 0.85: STOP - "TARGET ACHIEVED WITH MULTI-TURN VALIDATION" - GOTO STEP 4
- ELSE: Report "Multi-turn passed but combined score below 0.85" - CONTINUE optimization loop

IF MULTI-TURN CONDITIONAL (one scenario within 0.05, no critical failures, average >= 0.65):

- Report: "Multi-turn conditional pass. Proceeding with caution."
- Calculate combined score
- IF combined >= 0.85: STOP - "TARGET ACHIEVED (CONDITIONAL)" - GOTO STEP 4
- ELSE: CONTINUE optimization loop

IF MULTI-TURN FAIL (scenario below threshold by > 0.10, OR critical failure, OR average < 0.60):

- Report: "MULTI-TURN VALIDATION FAILED"
- Report: "Failure reason: {specific_failure}"
- DO NOT accept as target achieved
- Flag for human intervention: "Single-turn passed but multi-turn failed. Review needed."
- STOP - "Human review needed: multi-turn validation failure"
- GOTO STEP 4

STEP 4 - FINAL REPORT

Generate optimization summary:

```text
OPTIMIZATION COMPLETE
=====================
Iterations: {iteration_count}
Starting composite: {initial_composite}
Final composite: {current_best_composite}
Improvement: {delta} ({percentage}%)
Best version: {current_best_version}
Stopping reason: {reason}

SINGLE-TURN SCORES:
Tier 1 scores: {scores}
Tier 2 scores: {scores}
Tier 3 scores: {scores}
Tier 4 scores: {scores}

MULTI-TURN VALIDATION: {RAN|NOT_RUN}
{If RAN:}
basic-user-step1-2: {score}
sophisticated-idk-protocol: {score}
full-10-step: {score}
Average: {avg}
Status: {PASS|CONDITIONAL|FAIL}
Combined score: {combined}

Changes accepted: {count}
Changes rejected: {count}

Recommended next steps:
- {recommendations based on remaining low scorers}
```

Update VERSION_DASHBOARD.md with final state including multi-turn results.
Commit summary to change log.

HARD RULES

1. NEVER skip composite calculation
1. NEVER ignore stopping conditions
1. NEVER auto-approve Tier 1 regressions
1. ALWAYS ask human for intervention triggers
1. ALWAYS update dashboard after each iteration
1. ALWAYS commit after each change (accepted or rejected)
1. MAX 10 iterations per /iterate-auto invocation
1. Multi-turn validation REQUIRED before declaring target achieved
1. Multi-turn FAIL requires human intervention even if single-turn passes
