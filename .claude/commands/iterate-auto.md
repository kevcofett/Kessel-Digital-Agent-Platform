---
description: Auto-optimize MPA instructions until target score or stopping condition
---

Automated MPA instruction optimization loop. Runs iterations until composite score target is reached or stopping condition is met.

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
           STOP - "Target achieved! Composite: {composite}"
           GOTO STEP 4
       
       IF len(last_three_composites) >= 3:
           IF max(last_three_composites) - min(last_three_composites) < 0.01:
               STOP - "Plateau detected. Last 3 scores: {last_three_composites}"
               GOTO STEP 4
       
       IF all Tier 1 scores >= 0.95 AND composite >= 0.85:
           STOP - "Tier 1 perfect with good composite. Optimization complete."
           GOTO STEP 4
       
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

STEP 4 - FINAL REPORT

Generate optimization summary:

```
OPTIMIZATION COMPLETE
=====================
Iterations: {iteration_count}
Starting composite: {initial_composite}
Final composite: {current_best_composite}
Improvement: {delta} ({percentage}%)
Best version: {current_best_version}
Stopping reason: {reason}

Tier 1 scores: {scores}
Tier 2 scores: {scores}
Tier 3 scores: {scores}
Tier 4 scores: {scores}

Changes accepted: {count}
Changes rejected: {count}

Recommended next steps:
- {recommendations based on remaining low scorers}
```

Update VERSION_DASHBOARD.md with final state.
Commit summary to change log.

HARD RULES

1. NEVER skip composite calculation
2. NEVER ignore stopping conditions
3. NEVER auto-approve Tier 1 regressions
4. ALWAYS ask human for intervention triggers
5. ALWAYS update dashboard after each iteration
6. ALWAYS commit after each change (accepted or rejected)
7. MAX 10 iterations per /iterate-auto invocation
