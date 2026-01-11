---
description: Run multi-turn conversation evaluation for MPA
---

Run multi-turn conversation evaluation to test the MPA through complete planning sessions.

STEP 1 - DETERMINE SCOPE

Ask the user which scenario(s) to run:

Options:

- `all` - Run all 15 scenarios (full evaluation suite)
- `quick` - Run quick scenarios only (basic-user, sophisticated-idk, high-stakes-performance)
- `full` - Run only the full-10-step scenario
- `scenario [id]` - Run a specific scenario by ID

Available scenarios:

1. basic-user-step1-2 - Basic marketing manager, Steps 1-2 completion
2. sophisticated-idk - Sophisticated fintech user, IDK protocol testing
3. full-10-step - Full 10-step media planning session
4. high-stakes-performance - $2M budget, aggressive performance targets
5. brand-building-limited-data - Awareness campaign with limited data
6. precision-targeting-complex - Complex behavioral/geographic targeting
7. mass-national-simplicity - Mass national campaign, simplicity test
8. aggressive-kpi-narrow-targeting - Aggressive KPI requiring narrowing
9. multi-audience-unified-plan - Multiple audiences in one plan
10. multi-audience-channel-allocation - Multiple audiences with different channels
11. multi-audience-varying-kpis - Multiple audiences with varying KPIs
12. budget-revision-midstream - Budget increases mid-conversation (reforecasting)
13. volume-target-increase - Volume target increases mid-conversation (reforecasting)
14. timeline-compression - Timeline compresses mid-conversation (reforecasting)
15. efficiency-shock - CAC reality check mid-conversation (reforecasting)

If user specified a scope in the command arguments, use that. Otherwise default to `all`.

STEP 2 - RUN EVALUATION

Navigate to the braintrust directory and run the evaluation:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust
```

For all scenarios (standard):

```bash
export $(grep -E "^[A-Z_]+=" /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env | xargs) && \
node dist/mpa-multi-turn-eval.js
```

For all scenarios (parallel - recommended for iteration):

```bash
export $(grep -E "^[A-Z_]+=" /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env | xargs) && \
node dist/mpa-multi-turn-eval.js --parallel
```

For specific scenario:

```bash
export $(grep -E "^[A-Z_]+=" /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env | xargs) && \
node dist/mpa-multi-turn-eval.js --scenario {scenario-id}
```

For verbose output (shows conversation logs):

```bash
export $(grep -E "^[A-Z_]+=" /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env | xargs) && \
node dist/mpa-multi-turn-eval.js --verbose
```

For KB document impact tracking:

```bash
export $(grep -E "^[A-Z_]+=" /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/integrations/vercel-ai-gateway/.env | xargs) && \
node dist/mpa-multi-turn-eval.js --parallel --track-kb
```

Command-line flags:

- `--parallel` - Run scenarios concurrently (3 at a time) for faster completion
- `--track-kb` - Track KB document impact and generate optimization recommendations
- `--save-baseline` - Save current results as new baseline
- `--verbose` - Show full conversation logs
- `--scenario [id]` - Run specific scenario only

STEP 3 - PARSE RESULTS

After evaluation completes, parse the output and create a summary table:

```
MULTI-TURN EVALUATION RESULTS
=============================
Scenario                                | Score  | Threshold | Status |
----------------------------------------|--------|-----------|--------|
basic-user-step1-2                      | 0.XXX  | 0.70      |   ✅   |
sophisticated-idk                       | 0.XXX  | 0.70      |   ✅   |
full-10-step                            | 0.XXX  | 0.65      |   ✅   |
high-stakes-performance                 | 0.XXX  | 0.70      |   ✅   |
brand-building-limited-data             | 0.XXX  | 0.70      |   ✅   |
precision-targeting-complex             | 0.XXX  | 0.70      |   ✅   |
mass-national-simplicity                | 0.XXX  | 0.70      |   ✅   |
aggressive-kpi-narrow-targeting         | 0.XXX  | 0.70      |   ✅   |
multi-audience-unified-plan             | 0.XXX  | 0.70      |   ✅   |
multi-audience-channel-allocation       | 0.XXX  | 0.70      |   ✅   |
multi-audience-varying-kpis             | 0.XXX  | 0.70      |   ✅   |
budget-revision-midstream               | 0.XXX  | 0.70      |   ✅   |
volume-target-increase                  | 0.XXX  | 0.70      |   ✅   |
timeline-compression                    | 0.XXX  | 0.70      |   ✅   |
efficiency-shock                        | 0.XXX  | 0.70      |   ✅   |
----------------------------------------|--------|-----------|--------|
Average                                 | 0.XXX  | 0.70      |   ✅   |
Critical Failures                       |   X    |    0      |   ✅   |
----------------------------------------|--------|-----------|--------|

STATUS: {PASS|CONDITIONAL|FAIL}
```

Test outputs are automatically saved to numbered folders in:
/release/v5.5/agents/mpa/base/tests/braintrust/outputs/

Each run creates a folder like run-001/, run-002/, etc. containing:
- 00_run_summary.md - Overall summary
- 00_index.json - Machine-readable index
- [scenario_folder]/ - Per-scenario folders containing:
  - 01_summary.md - Scenario summary
  - 02_conversation.txt - Full conversation log
  - 03_scores.md - Score breakdown
  - 04_media_plan.md - Extracted media plan outputs
  - 05_raw_data.json - Raw scoring data

STEP 4 - EVALUATE STATUS

Determine overall status:

PASS - 70%+ scenarios meet thresholds, no critical failures, average >= 0.70
CONDITIONAL - 60-70% scenarios pass, no critical failures, average >= 0.65
FAIL - <60% scenarios pass, OR critical failure, OR average < 0.60

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
Outputs saved to: {run_folder}

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

sophisticated-idk:
- Persona: Sophisticated fintech growth lead
- Tests: IDK protocol, benchmark modeling, expert language
- Expected turns: 5-15
- Pass threshold: 0.70

full-10-step:
- Persona: Intermediate ecommerce marketing director
- Tests: Complete 10-step planning session
- Expected turns: 20-50
- Pass threshold: 0.65

high-stakes-performance:
- Persona: CPG brand manager with aggressive targets
- Tests: Challenge unrealistic KPIs, precision targeting
- Expected turns: 10-25
- Pass threshold: 0.70

brand-building-limited-data:
- Persona: DTC startup founder, awareness focus
- Tests: Handle limited data, recommend measurement approach
- Expected turns: 8-20
- Pass threshold: 0.70

precision-targeting-complex:
- Persona: B2B enterprise with complex targeting requirements
- Tests: Multi-attribute targeting, geographic precision
- Expected turns: 12-30
- Pass threshold: 0.70

mass-national-simplicity:
- Persona: FMCG brand for mass national campaign
- Tests: Simplify for broad reach, avoid over-complication
- Expected turns: 8-18
- Pass threshold: 0.70

aggressive-kpi-narrow-targeting:
- Persona: Performance marketer with aggressive ROAS target
- Tests: Narrow targeting to achieve KPIs, challenge feasibility
- Expected turns: 10-25
- Pass threshold: 0.70

multi-audience-unified-plan:
- Persona: Retail brand with multiple audience segments
- Tests: Unified plan across segments, consistent strategy
- Expected turns: 15-35
- Pass threshold: 0.70

multi-audience-channel-allocation:
- Persona: Multi-brand portfolio with segment-specific channels
- Tests: Different channel mix per segment, allocation logic
- Expected turns: 15-40
- Pass threshold: 0.70

multi-audience-varying-kpis:
- Persona: Full-funnel marketer with varying KPIs per segment
- Tests: Different success metrics per audience, unified reporting
- Expected turns: 18-45
- Pass threshold: 0.70

budget-revision-midstream:
- Persona: B2B SaaS director of marketing
- Tests: Proactive reforecasting when budget increases mid-conversation
- Data change: Budget increases from $500K to $750K at turn 6
- Expected turns: 12-35
- Pass threshold: 0.70

volume-target-increase:
- Persona: E-commerce marketing manager
- Tests: Proactive reforecasting when volume target increases mid-conversation
- Data change: Volume target increases from 5,000 to 8,000 at turn 8
- Expected turns: 14-40
- Pass threshold: 0.70

timeline-compression:
- Persona: Retail marketing director
- Tests: Proactive reforecasting when timeline compresses mid-conversation
- Data change: Timeline compresses from 12 months to 6 months at turn 7
- Expected turns: 12-35
- Pass threshold: 0.70

efficiency-shock:
- Persona: Insurance director of digital marketing
- Tests: Proactive reforecasting when CAC constraints invalidate calculations
- Data change: User reveals $120 CAC floor after agent calculates $50 implied CAC
- Expected turns: 12-35
- Pass threshold: 0.70
