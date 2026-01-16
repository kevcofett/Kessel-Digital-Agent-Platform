MPA INSTRUCTION ITERATION FRAMEWORK v1

PURPOSE

This document defines the process for iterating on MPA instructions using Braintrust evaluation feedback. The goal is systematic improvement without circular rewrites.

CORE PRINCIPLES

PRINCIPLE 1 - BASELINE LOCK
Establish a known-good baseline version. Never modify the baseline file. All changes create new versions that are compared against baseline.

Current baseline: MPA_Copilot_Instructions_v5_7.txt
Baseline scores: [Record after first full eval run]

PRINCIPLE 2 - ATOMIC CHANGES
One hypothesis per version. If you change three things and scores improve, you do not know which change helped. If scores regress, you do not know which change hurt.

PRINCIPLE 3 - HYPOTHESIS DRIVEN
Every change must have a written hypothesis BEFORE making the change. Format:
- Failing test case: [test ID]
- Current behavior: [what agent does now]
- Desired behavior: [what agent should do]
- Proposed change: [specific edit]
- Expected impact: [which scorers should improve]

PRINCIPLE 4 - REGRESSION PROTECTION
A change that improves one scorer but regresses another is not automatically good. Track net impact. Prioritize core behaviors over edge cases.

PRINCIPLE 5 - KB BEFORE CORE
If a behavior can be fixed in a KB document, fix it there first. Core instructions are precious character budget. KB documents have more space for nuance and examples.

VERSION NAMING CONVENTION

Core instructions: MPA_Copilot_Instructions_v[MAJOR]_[MINOR].txt
- Major: Significant architectural changes (new sections, removed sections, restructured flow)
- Minor: Behavioral tweaks within existing structure

Examples:
- v5_7 - baseline with IDK protocol fix
- v5_7_1 - first iteration on v5_7
- v5_7_2 - second iteration on v5_7
- v5_8 - major change (new section added or significant restructure)

KB documents: [Name]_v5_5.txt (tied to platform version, not instruction version)
KB changes do not require new instruction versions unless core instructions reference them.

CHANGE LOG FORMAT

Maintain a running change log. Each entry:

---
VERSION: v5_7_1
DATE: YYYY-MM-DD
HYPOTHESIS: [Test case X fails because agent does Y. Changing Z should produce W.]
CHANGE TYPE: Core instruction | KB document | Both
FILES MODIFIED: [list]
SPECIFIC CHANGES: [exact text changed, not summary]
EVAL RESULTS:
- Baseline scores: [from v5_7]
- New scores: [from v5_7_1]
- Delta: [+/- for each scorer]
DECISION: Accept | Reject | Modify further
RATIONALE: [why this decision]
---

ITERATION WORKFLOW

STEP 1 - IDENTIFY FAILING TEST
Review Braintrust eval results. Find lowest scoring test case. Read the full input, output, and scorer feedback.

STEP 2 - DIAGNOSE ROOT CAUSE
Ask: Why did the agent behave this way? Possible causes:
- Missing instruction (agent had no guidance)
- Conflicting instruction (two rules contradict)
- Unclear instruction (agent misinterpreted)
- Wrong priority (agent followed lower priority rule)
- KB gap (needed context not in knowledge base)

STEP 3 - WRITE HYPOTHESIS
Before touching any file, write the hypothesis in the change log. Be specific about what you expect to change.

STEP 4 - LOCATE CHANGE POINT
Decide: Core instruction or KB document?

Use KB if:
- Change is step-specific (only applies to Step 4, Step 7, etc.)
- Change requires examples or detailed explanation
- Change is about domain knowledge, not agent behavior
- Core instructions already reference KB for this area

Use Core if:
- Change is a global behavior (applies across all steps)
- Change is a hard constraint or prime directive
- Change conflicts with existing core instruction
- KB document does not exist for this area

STEP 5 - MAKE MINIMAL CHANGE
Change only what is necessary to test the hypothesis. Do not fix other things you notice. Do not improve wording while you are there. One change only.

STEP 6 - RUN TARGETED EVAL
Run eval on the specific failing test case first. If it passes, run full eval suite. If it still fails, hypothesis was wrong - revert and try different approach.

STEP 7 - CHECK FOR REGRESSIONS
Compare all scores to baseline. If any scorer regressed more than 0.1, investigate before accepting.

STEP 8 - DOCUMENT AND DECIDE
Record results in change log. Accept, reject, or modify further.

COMMON ANTI-PATTERNS

ANTI-PATTERN 1 - THE REWRITE
Symptom: Frustrated with results, rewrite entire section or document.
Problem: Loses institutional knowledge embedded in current version. Introduces new bugs while fixing old ones.
Solution: Atomic changes only. If section needs major work, break into multiple small iterations.

ANTI-PATTERN 2 - THE STACK
Symptom: Make change A, scores improve. Make change B, scores improve more. Make change C, scores regress. Keep change C anyway because A+B+C is still better than baseline.
Problem: Change C is hiding. It will cause problems later.
Solution: Revert C. Accept A+B. Test C in isolation later.

ANTI-PATTERN 3 - THE DRIFT
Symptom: After 20 iterations, instructions have drifted far from original intent. New failures appear that baseline did not have.
Problem: Lost sight of core objectives while chasing edge cases.
Solution: Every 5 iterations, re-run baseline and compare trajectory. Reset to baseline if drift exceeds value of improvements.

ANTI-PATTERN 4 - THE PATCH
Symptom: Add exception after exception. Instructions become a list of special cases.
Problem: Agent cannot generalize. New edge cases will always fail.
Solution: Find the general principle that covers multiple cases. Replace patches with principle.

ANTI-PATTERN 5 - THE COPY
Symptom: Same guidance appears in core instructions and KB document.
Problem: When you update one, you forget the other. They drift apart. Agent gets conflicting signals.
Solution: Single source of truth. Core instructions reference KB. KB contains detail.

SCORE PRIORITY TIERS

When scores conflict, prioritize in this order:

TIER 1 - NEVER REGRESS
- IDK Protocol (core v5.7 fix)
- Progress Over Perfection (core v5.7 fix)
- Step Boundary Compliance

TIER 2 - PROTECT STRONGLY
- Adaptive Sophistication
- Source Citation
- Tone Quality

TIER 3 - OPTIMIZE
- Response Length
- Single Question
- Proactive Intelligence

TIER 4 - NICE TO HAVE
- Feasibility Framing
- Step Completion
- Acronym Definition

A change that improves Tier 3 but regresses Tier 1 is rejected.
A change that improves Tier 1 but regresses Tier 4 is accepted.

ROLLBACK PROCEDURE

If iteration goes wrong:

1. Identify last known good version from change log
2. Copy that version to current working version
3. Re-run full eval to confirm scores match recorded baseline
4. Document rollback in change log with rationale
5. Resume iteration from that point

WEEKLY REVIEW CHECKLIST

Every week, review:
- Total iterations this week
- Net score change from week start
- Any Tier 1 regressions introduced
- Any KB documents modified
- Character count of core instructions (must stay under 8000)
- Drift check: compare current to original v5.7 baseline

FILE LOCATIONS

Core instructions: /release/v5.5/agents/mpa/base/copilot/
KB documents: /release/v5.5/agents/mpa/base/kb/
Braintrust tests: /release/v5.5/agents/mpa/base/tests/braintrust/
Change log: /release/v5.5/agents/mpa/base/docs/INSTRUCTION_CHANGE_LOG.md
