---
description: Auto-optimize MPA instructions until target score or stopping condition
---

Automated MPA instruction optimization loop. Runs iterations until composite score target (95%) is reached or stopping condition is met.

This command uses multi-turn evaluation as the primary scoring mechanism.

TARGET: 95% overall composite score across all 23 multi-turn scenarios.

SCENARIO CATEGORIES:

- Core scenarios (3): basic-user, sophisticated-idk, full-10-step
- Phase 1 Quality (2): high-stakes-performance, brand-building-limited-data
- Advanced Targeting (3): precision-targeting, mass-national, aggressive-kpi
- Multi-Audience (3): unified-plan, channel-allocation, varying-kpis
- Reforecasting (12): budget-revision, budget-decrease, volume-increase, timeline-compression, efficiency-shock, channel-mix, geo-expansion, demographic-shift, behavioral-targeting, outcome-kpi, audience-addition, audience-removal

STEP 1 - LOAD CONFIGURATION

Read these files:

- /release/v5.5/agents/mpa/base/docs/MPA_Instruction_Iteration_Framework.md
- /release/v5.5/agents/mpa/base/docs/OPTIMIZATION_SCORING_CONFIG.md
- /release/v5.5/agents/mpa/base/docs/INSTRUCTION_CHANGE_LOG.md
- /release/v5.5/agents/mpa/base/docs/VERSION_DASHBOARD.md
- /release/v5.5/agents/mpa/base/tests/braintrust/baselines/v5_7_baseline.json

STEP 2 - INITIALIZE TRACKING

Create or update tracking variables:

- iteration_count = 0
- consecutive_rejections = 0
- last_three_composites = []
- current_best_version = baseline v5_7
- current_best_composite = [from last eval]
- target_composite = 0.95

STEP 3 - OPTIMIZATION LOOP

WHILE stopping conditions not met:

    A. INCREMENT
       iteration_count += 1
       Report: "Starting iteration {iteration_count}"

    B. RUN MULTI-TURN EVALUATION (All 23 Scenarios)

       ```bash
       cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust
       export $(grep -E "^[A-Z_]+=" /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env | xargs) && \
       node dist/mpa-multi-turn-eval.js --parallel --track-kb
       ```

       Parse results for all 23 scenarios.
       Calculate overall composite score.

    C. CHECK STOPPING CONDITIONS

       IF composite >= 0.95:
           Report: "TARGET ACHIEVED! Composite: {composite}"
           GOTO STEP 4

       IF len(last_three_composites) >= 3:
           IF max(last_three_composites) - min(last_three_composites) < 0.01:
               STOP - "Plateau detected. Last 3 scores: {last_three_composites}"
               GOTO STEP 4

       IF iteration_count >= 20:
           STOP - "Max iterations reached. Human review needed."
           GOTO STEP 4

       IF consecutive_rejections >= 5:
           STOP - "5 consecutive rejections. Human intervention needed."
           GOTO STEP 4

    D. ANALYZE FAILING SCENARIOS

       Sort scenarios by composite score ascending.
       Identify the 3 lowest-scoring scenarios.

       For the lowest-scoring scenario:
       - Read the full conversation from outputs/run-XXX/{scenario}/02_conversation.txt
       - Identify where the agent failed
       - Diagnose root cause

    E. IDENTIFY TARGET FOR IMPROVEMENT

       Priority order:
       1. Scenarios failing (<70% composite)
       2. Scenarios with critical failures
       3. Scenarios with major failures
       4. Lowest absolute scores

       Report: "Targeting scenario: {scenario_id} (current: {score}%)"

    F. ANALYZE AND PROPOSE CHANGE

       For lowest-scoring scenario:
       - State the problem
       - Diagnose root cause (instruction gap, KB gap, conflicting guidance)
       - Write hypothesis
       - Determine Core Instruction vs KB document change
       - Propose minimal change

       Check human intervention triggers:
       - New KB document needed? ASK HUMAN
       - Removing instruction entirely? ASK HUMAN
       - Same scenario failed 3+ times? ASK HUMAN
       - Character count > 7,500? ASK HUMAN

    G. IMPLEMENT CHANGE

       Follow all safeguards from /iterate:
       - Character limit < 8,000 for Core instructions
       - Copilot formatting compliance (no markdown, no bullets, no tables)
       - Create new version file
       - Update mpa-prompt.ts with new version name and content
       - Update mpa-eval.ts with new instruction content
       - Update KB documents if needed
       - Update change log
       - Update VERSION_DASHBOARD.md

    H. COMMIT AND PUSH

       MANDATORY after every change:
       ```bash
       git add .
       git commit -m "Iteration {iteration_count}: {brief description of change}"
       git push origin deploy/personal
       ```

       This ensures all changes are tracked and the remote repo is updated.

    I. REBUILD TYPESCRIPT

       ```bash
       cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust
       npx tsc
       ```

    J. EVALUATE CHANGE

       Re-run multi-turn evaluation:
       ```bash
       export $(grep -E "^[A-Z_]+=" /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env | xargs) && \
       node dist/mpa-multi-turn-eval.js --parallel --track-kb
       ```

       Calculate new composite.

       IF new_composite > current_best_composite:
           ACCEPT
           current_best_version = new version
           current_best_composite = new_composite
           consecutive_rejections = 0
           Update VERSION_DASHBOARD.md
           Report: "ACCEPTED: +{improvement}%"
       ELSE:
           REJECT
           Revert change
           consecutive_rejections += 1
           Report: "REJECTED: No improvement"

       Append new_composite to last_three_composites (keep last 3)
       Update INSTRUCTION_CHANGE_LOG.md

    K. COMMIT AND PUSH RESULTS

       ```bash
       git add .
       git commit -m "Iteration {iteration_count} result: {ACCEPT|REJECT} - {composite}%"
       git push origin deploy/personal
       ```

    L. CONTINUE LOOP

       Report: "Iteration {iteration_count} complete. Composite: {composite}%. Target: 95%"
       IF composite < 0.95:
           CONTINUE to next iteration automatically
       ELSE:
           GOTO STEP 4

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

MULTI-TURN RESULTS (23 Scenarios):
Scenario                          | Score  | Change |
----------------------------------|--------|--------|
basic-user-step1-2                | XX.X%  | +X.X%  |
sophisticated-idk                 | XX.X%  | +X.X%  |
full-10-step                      | XX.X%  | +X.X%  |
high-stakes-performance           | XX.X%  | +X.X%  |
brand-building-limited-data       | XX.X%  | +X.X%  |
precision-targeting-complex       | XX.X%  | +X.X%  |
mass-national-simplicity          | XX.X%  | +X.X%  |
aggressive-kpi-narrow-targeting   | XX.X%  | +X.X%  |
multi-audience-unified-plan       | XX.X%  | +X.X%  |
multi-audience-channel-allocation | XX.X%  | +X.X%  |
multi-audience-varying-kpis       | XX.X%  | +X.X%  |
budget-revision-midstream         | XX.X%  | +X.X%  |
volume-target-increase            | XX.X%  | +X.X%  |
timeline-compression              | XX.X%  | +X.X%  |
efficiency-shock                  | XX.X%  | +X.X%  |
channel-mix-change                | XX.X%  | +X.X%  |
geo-expansion-change              | XX.X%  | +X.X%  |
demographic-shift-change          | XX.X%  | +X.X%  |
behavioral-targeting-change       | XX.X%  | +X.X%  |
outcome-kpi-change                | XX.X%  | +X.X%  |
audience-addition-change          | XX.X%  | +X.X%  |
audience-removal-change           | XX.X%  | +X.X%  |
----------------------------------|--------|--------|
OVERALL                           | XX.X%  | +X.X%  |

Changes accepted: {count}
Changes rejected: {count}

Outputs saved to: {latest_run_folder}

Recommended next steps:
- {recommendations based on remaining low scorers}
```

Update VERSION_DASHBOARD.md with final state.
Commit summary to change log.

Final push:

```bash
git add .
git commit -m "Auto-optimization complete: {final_composite}% composite"
git push origin deploy/personal
```

HARD RULES

1. NEVER skip composite calculation
2. NEVER ignore stopping conditions
3. ALWAYS push to git after each change
4. ALWAYS push to git after each evaluation result
5. ALWAYS ask human for intervention triggers
6. ALWAYS update dashboard after each iteration
7. MAX 20 iterations per /iterate-auto invocation
8. TARGET is 95% composite - continue until achieved or stopped
9. ALWAYS save test outputs to numbered folders
10. ALWAYS track which scenarios are failing and why
