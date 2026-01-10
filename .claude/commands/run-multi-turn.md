---
description: Run multi-turn conversation evaluation for MPA
---

Run multi-turn conversation evaluation to test the MPA through complete planning sessions.

STEP 1 - DETERMINE SCOPE

Ask the user which scenario(s) to run:

Options:

- `all` - Run all 3 scenarios (basic-user-step1-2, sophisticated-idk-protocol, full-10-step)
- `quick` - Run quick scenarios only (basic-user-step1-2, sophisticated-idk-protocol)
- `full` - Run only the full 10-step scenario
- `basic` - Run only basic-user-step1-2
- `sophisticated` - Run only sophisticated-idk-protocol

If user specified a scope in the command arguments, use that. Otherwise default to `all`.

STEP 2 - RUN EVALUATION

Navigate to the braintrust directory and run the evaluation:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust
```

For all scenarios:

```bash
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY npx ts-node --esm mpa-multi-turn-eval.ts
```

For specific scenario:

```bash
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY npx ts-node --esm mpa-multi-turn-eval.ts --scenario {scenario-id}
```

For quick scenarios:

```bash
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY npx ts-node --esm mpa-multi-turn-eval.ts --category quick
```

For verbose output (shows conversation logs):

```bash
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY npx ts-node --esm mpa-multi-turn-eval.ts --verbose
```

STEP 3 - PARSE RESULTS

After evaluation completes, parse the output and create a summary table:

```
MULTI-TURN EVALUATION RESULTS
=============================
Scenario                   | Score  | Threshold | Status |
---------------------------|--------|-----------|--------|
basic-user-step1-2         | 0.XXX  | 0.70      |   ✅   |
sophisticated-idk-protocol | 0.XXX  | 0.70      |   ✅   |
full-10-step               | 0.XXX  | 0.65      |   ✅   |
---------------------------|--------|-----------|--------|
Average                    | 0.XXX  | 0.68      |   ✅   |
Critical Failures          |   X    |    0      |   ✅   |
---------------------------|--------|-----------|--------|

STATUS: {PASS|CONDITIONAL|FAIL}
```

STEP 4 - EVALUATE STATUS

Determine overall status:

PASS - All scenarios meet thresholds, no critical failures, average >= 0.68
CONDITIONAL - One scenario slightly below (within 0.05), no critical failures, average >= 0.65
FAIL - Any scenario below threshold by > 0.10, OR critical failure, OR average < 0.60

STEP 5 - UPDATE DASHBOARD

If running as part of validation workflow, update VERSION_DASHBOARD.md:

Read: /release/v5.5/agents/mpa/base/docs/VERSION_DASHBOARD.md

Update the MULTI-TURN VALIDATION HISTORY section with the results.

STEP 6 - REPORT

Provide summary to user:

```
MULTI-TURN EVALUATION COMPLETE
==============================
Scenarios run: {count}
Average score: {avg}%
Status: {PASS|CONDITIONAL|FAIL}

{If PASS: "Multi-turn validation passed. Version is validated for production."}
{If CONDITIONAL: "Multi-turn validation conditionally passed. Review recommended."}
{If FAIL: "Multi-turn validation failed. Review failures before accepting."}

Detailed results logged to Braintrust (if BRAINTRUST_API_KEY set).
```

SCENARIO DETAILS

basic-user-step1-2:

- Persona: Basic marketing manager at shoe retailer
- Tests: Language adaptation, Steps 1-2 completion
- Expected turns: 4-12
- Pass threshold: 0.70

sophisticated-idk-protocol:

- Persona: Sophisticated fintech growth lead
- Tests: IDK protocol, benchmark modeling, expert language
- Expected turns: 5-15
- Pass threshold: 0.70

full-10-step:

- Persona: Intermediate ecommerce marketing director
- Tests: Complete 10-step planning session
- Expected turns: 20-50
- Pass threshold: 0.65
