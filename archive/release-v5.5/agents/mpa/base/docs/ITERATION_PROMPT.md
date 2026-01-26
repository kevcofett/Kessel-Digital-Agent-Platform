# MPA INSTRUCTION ITERATION PROMPT

Paste this prompt into VS Code Claude along with your Braintrust eval results to start an iteration cycle.

---

## PROMPT START

I need to iterate on MPA instructions based on Braintrust evaluation results.

First, read the iteration framework:
/release/v5.5/agents/mpa/base/docs/MPA_Instruction_Iteration_Framework.md

Then read the change log to see current baseline and any previous iterations:
/release/v5.5/agents/mpa/base/docs/INSTRUCTION_CHANGE_LOG.md

Here are my Braintrust eval results:

[PASTE RESULTS HERE]

Based on these results:

1. Identify the lowest-scoring test case
2. Diagnose why the agent behaved that way
3. Write a hypothesis in the required format
4. Determine if fix belongs in Core instructions or KB document
5. Propose the MINIMAL change (exact text to add/remove/modify)
6. Predict which scorers will improve and by how much

DO NOT make any file changes yet. Present your analysis and wait for my approval.

After I approve, you will:
1. Create the new version (v5_7_X or KB update)
2. Update the change log with the hypothesis and changes
3. Commit and push to deploy/personal

## PROMPT END

---

## AFTER EVAL COMPLETES

Paste this follow-up prompt with the new scores:

---

## FOLLOW-UP PROMPT START

Here are the eval results after the change:

[PASTE NEW RESULTS HERE]

Compare to baseline. For each scorer:
- Show baseline score
- Show new score  
- Show delta

Check for Tier 1 regressions (IDK Protocol, Progress Over Perfection, Step Boundary).

Recommend: ACCEPT, REJECT, or MODIFY FURTHER.

If ACCEPT: Update the change log with results and decision.
If REJECT: Revert the change and update change log.
If MODIFY: Propose next hypothesis.

## FOLLOW-UP PROMPT END
