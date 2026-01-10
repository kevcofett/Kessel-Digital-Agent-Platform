---
description: Start MPA instruction iteration based on Braintrust eval results
---

Enter MPA instruction iteration mode based on Braintrust evaluation results.

STEP 1 - LOAD CONTEXT

Read these files to understand the iteration framework, formatting rules, and current state:
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
   Decide: Core instruction or KB document?
   
   USE KB DOCUMENT IF:
   - Change is step-specific (only applies to Step 4, Step 7, etc.)
   - Change requires examples or detailed explanation
   - Change is about domain knowledge, not agent behavior
   - Adding to Core would exceed 8,000 character limit
   
   USE CORE INSTRUCTION IF:
   - Change is a global behavior (applies across all steps)
   - Change is a hard constraint or prime directive
   - Change conflicts with existing core instruction

5. PROPOSE MINIMAL CHANGE
   Show exact text to remove and exact text to add.
   ONE change only.

STEP 4 - WAIT FOR APPROVAL

Present your analysis and proposed change.
Ask: "Approve this change? (yes/no/modify)"

Do NOT modify any files until user approves.

STEP 5 - IMPLEMENT (after approval)

MANDATORY CHECKS BEFORE WRITING ANY FILE:

A. CHARACTER LIMIT CHECK (Core instructions only)
   - Current character count of baseline
   - Character count after proposed change
   - MUST be under 8,000 characters
   - If over, move detail to KB document instead

B. COPILOT FORMATTING COMPLIANCE (All files)
   - ALL-CAPS section headers (no Title Case, no lowercase)
   - NO markdown formatting (no #, *, `, - as bullets)
   - NO emojis or special Unicode characters
   - NO tables (use plain text lists)
   - NO bullet points (use line breaks and plain sentences)
   - NO numbered lists (use sequential paragraphs)
   - Plain ASCII text only
   - Line breaks for structure

C. FILE OPERATIONS
   
   For Core instruction changes:
   1. Create new version file in /release/v5.5/agents/mpa/base/copilot/
      - Name: MPA_Copilot_Instructions_v5_7_[N].txt (increment N)
   2. Copy baseline content
   3. Apply the approved change
   4. Verify character count < 8,000
   5. Verify formatting compliance
   
   For KB document changes:
   1. If updating existing: Edit file in /release/v5.5/agents/mpa/base/kb/
   2. If creating new: Create in /release/v5.5/agents/mpa/base/kb/
      - Name: [DescriptiveName]_v5_5.txt
   3. Verify formatting compliance
   4. If new KB doc, check if Core instructions need reference added
   
   For ALL changes:
   1. Update INSTRUCTION_CHANGE_LOG.md with hypothesis and changes
   2. Update mpa-prompt.ts with new version name and instruction content
   3. Update mpa-eval.ts with new instruction content
   4. Push prompt to Braintrust:
      ```bash
      cd /release/v5.5/agents/mpa/base/tests/braintrust
      BRAINTRUST_API_KEY=sk-IodwJN1b7KKJk6BUmEg1fO37rwgpIGaRWGsBuG7YFyNH3EUR npx braintrust push mpa-prompt.ts --if-exists replace
      ```
   5. Git add all modified/created files
   6. Git commit with descriptive message
   7. Git push to deploy/personal

STEP 6 - VERIFICATION

After writing files, run:
```bash
wc -c /release/v5.5/agents/mpa/base/copilot/MPA_Copilot_Instructions_v5_7_*.txt
```

Report:
- File created/modified
- Character count (must be < 8,000 for Core)
- Formatting compliance confirmed

STEP 7 - PROMPT FOR RE-EVAL

Tell user: "Change committed. Run eval in Braintrust, then type /check-results to compare scores."

Note: If the change affects Tier 1 behaviors OR if composite score reaches >= 0.90,
/check-results will automatically trigger multi-turn validation before final acceptance.

HARD RULES - NEVER VIOLATE

1. Core instructions MUST stay under 8,000 characters - no exceptions
2. ALL files MUST follow Copilot formatting - no markdown, no bullets, no tables
3. NEVER modify baseline v5_7.txt directly - always create new version
4. ONE hypothesis per iteration - no combined changes
5. KB before Core when possible - Core is precious character budget
6. NEVER regress Tier 1 scorers
7. ALWAYS update change log
8. ALWAYS commit and push after changes
