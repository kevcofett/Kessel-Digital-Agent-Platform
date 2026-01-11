# MPA SCORER IMPLEMENTATION - CONTINUATION PROMPT

## CONTEXT

You are implementing the MPA multi-turn evaluation framework. The complete scorer specification is at:
```
/release/v5.5/agents/mpa/base/tests/braintrust/SCORER_SPECIFICATION_v2.md
```

Read that file first. It contains 14 optimized scorers with weights, types, instructions, code patterns, and judge prompts.

---

## CRITICAL REQUIREMENTS

### 1. HOLISTIC KB + INSTRUCTIONS EVALUATION

You must evaluate the Copilot instructions AND KB documents as an integrated system:

- **Before any instruction change:** Read ALL relevant KB files to understand the full behavioral contract
- **KB files define the WHY:** Strategic frameworks, conversation examples, boundary rules
- **Instructions define the HOW:** Condensed behavioral directives that reference KB
- **Scorers validate BOTH:** Test if agent behavior matches KB expectations, not just instruction compliance

When test scores are low, analyze:
1. Is the instruction unclear? → Revise instruction
2. Is the KB guidance missing? → Add KB content
3. Is the KB guidance conflicting? → Resolve KB conflict
4. Is the scorer wrong? → Adjust scorer

### 2. COPILOT INSTRUCTIONS CHARACTER LIMITS

**Core instructions MUST be 7,500-7,599 characters.** No exceptions.

- Check character count after EVERY edit: `wc -c MPA_Copilot_Instructions_v5_7.txt`
- If under 7,500: Add clarifying guidance from KB
- If over 7,599: Compress or move detail to KB
- Never sacrifice clarity for character count - restructure instead

### 3. COPILOT FORMATTING COMPLIANCE

Instructions must be 100% Copilot-compliant:
- NO markdown (no #, *, `, -)
- NO emojis or special Unicode
- NO tables or bullet points
- Plain text only with line breaks
- ALL-CAPS for section headers

Validate with: `grep -E '^[#*\`-]|[^\x00-\x7F]' MPA_Copilot_Instructions_v5_7.txt` (should return nothing)

### 4. AUTOMATIC SLASH COMMAND UPDATES

After EVERY round of testing that results in instruction changes:

1. Update `/release/v5.5/agents/mpa/base/copilot/slash_commands.json`
2. Ensure slash commands reflect current instruction capabilities
3. Sync any new behavioral patterns to appropriate slash command

Pattern:
```
Test → Identify gap → Update instructions → Update slash commands → Commit all together
```

### 5. TEST PROGRESS REPORTING

During test execution, provide status updates every 60 seconds:

```
[MM:SS] TESTING IN PROGRESS
- Scenarios complete: X/Y
- Current scenario: {name}
- Running scorer: {scorer_name}
- Preliminary composite: X.XX
- Issues detected: {count}
```

After each scenario completes:
```
[SCENARIO COMPLETE] {scenario_name}
- Composite score: X.XX
- Top 3 failures:
  1. {scorer}: {score} - {reason}
  2. {scorer}: {score} - {reason}
  3. {scorer}: {score} - {reason}
```

---

## IMPLEMENTATION ORDER

### Phase 1: Core Scorers (Do First)
1. `proactive-calculation` (15%)
2. `teaching-behavior` (12%)
3. `source-citation` (10%)
4. `feasibility-framing` (10%)

### Phase 2: Compliance Scorers
5. `step-boundary` (6%)
6. `single-question` (5%)
7. `idk-protocol` (4%)

### Phase 3: Remaining Scorers
8. `recalculation-on-change` (8%)
9. `risk-opportunity-flagging` (5%)
10. `adaptive-sophistication` (5%)
11. `response-length` (3%)
12. `acronym-definition` (2%)
13. `audience-sizing-completeness` (6%)
14. `cross-step-synthesis` (5%)
15. `response-formatting` (4%)

### Phase 4: Integration
16. Composite scorer aggregation
17. Full scenario test runs
18. Threshold calibration

---

## KEY FILE LOCATIONS

| File | Purpose |
|------|---------|
| `SCORER_SPECIFICATION_v2.md` | Full scorer definitions |
| `MPA_Copilot_Instructions_v5_7.txt` | Core agent instructions (7,500-7,599 chars) |
| `/kb/*.txt` | Knowledge base documents |
| `slash_commands.json` | Copilot slash command definitions |
| `scenarios/*.ts` | Test scenario definitions |
| `scorers/*.ts` | Scorer implementations |

---

## WORKFLOW LOOP

```
1. Run test suite
2. Report progress every 60 seconds
3. Analyze failures holistically (instructions + KB)
4. Propose changes with rationale
5. Update instructions (maintain 7,500-7,599 chars)
6. Update KB if needed
7. Update slash commands
8. Verify Copilot compliance
9. Commit changes
10. Re-run tests
11. Repeat until composite ≥ 0.80
```

---

## START COMMAND

Begin by reading the scorer specification:
```
cat /release/v5.5/agents/mpa/base/tests/braintrust/SCORER_SPECIFICATION_v2.md
```

Then list current scorer implementations to identify gaps:
```
ls -la /release/v5.5/agents/mpa/base/tests/braintrust/scorers/
```
