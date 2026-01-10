---
description: Start MPA instruction iteration based on Braintrust eval results
---

Enter MPA instruction iteration mode based on Braintrust evaluation results.

STEP 1 - LOAD CONTEXT

Read these files to understand the iteration framework and current state:
- /release/v5.5/agents/mpa/base/docs/MPA_Instruction_Iteration_Framework.md
- /release/v5.5/agents/mpa/base/docs/INSTRUCTION_CHANGE_LOG.md
- /release/v5.5/agents/mpa/base/copilot/MPA_Copilot_Instructions_v5_7.txt (baseline)

STEP 2 - FETCH BRAINTRUST RESULTS

Run this command to get the latest evaluation results:
```bash
npx braintrust eval list --project MPA --limit 1 --format json
```

If that doesn't work, try:
```bash
curl -H "Authorization: Bearer $BRAINTRUST_API_KEY" \
  "https://api.braintrust.dev/v1/project/MPA/experiments?limit=1"
```

Parse the results and identify:
- Overall scores by scorer
- Lowest scoring test cases
- Any Tier 1 regressions (IDK Protocol, Progress Over Perfection, Step Boundary)

STEP 3 - ANALYZE AND PROPOSE

For the lowest-scoring test case:

1. STATE THE PROBLEM
   - Test case ID and name
   - Current score
   - What the agent did wrong

2. DIAGNOSE ROOT CAUSE
   - Missing instruction?
   - Conflicting instruction?
   - Unclear instruction?
   - KB gap?

3. WRITE HYPOTHESIS
   - Failing test case: [ID]
   - Current behavior: [what agent does]
   - Desired behavior: [what agent should do]
   - Proposed change: [specific edit]
   - Expected impact: [which scorers improve]

4. LOCATE CHANGE POINT
   - Core instruction (global behavior, hard constraint)
   - KB document (step-specific, needs examples, domain knowledge)

5. PROPOSE MINIMAL CHANGE
   Show exact text to remove and exact text to add.
   ONE change only.

STEP 4 - WAIT FOR APPROVAL

Present your analysis and proposed change.
Ask: "Approve this change? (yes/no/modify)"

Do NOT modify any files until user approves.

STEP 5 - IMPLEMENT (after approval)

1. If Core change: Create new version file (v5_7_1, v5_7_2, etc.)
2. If KB change: Update the KB document
3. Update INSTRUCTION_CHANGE_LOG.md with hypothesis and changes
4. Commit with descriptive message
5. Push to deploy/personal

STEP 6 - PROMPT FOR RE-EVAL

Tell user: "Change committed. Run eval in Braintrust, then say 'check results' to compare scores."

RULES

- Never modify baseline v5_7 directly
- One hypothesis per iteration
- KB before Core when possible
- Never regress Tier 1 scorers
- Document everything in change log
