# VS Code Claude: MPA Test Execution Instructions

## Context

MPA v5.9 instructions are ready for testing. A comprehensive test framework has been created with:
- 15 test scenarios, 180+ conversation turns
- SDK-based test runner connecting directly to Copilot Studio
- 14 scorers matching Braintrust definitions
- Target: 95%+ on all scorers

## Your Task

Run the MPA test suite against the live Copilot, analyze failures, and iterate on instructions until all scorers pass at 95%+.

## Setup (One Time)

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install anthropic requests python-dotenv msal aiohttp
```

## Run Tests

```bash
# Activate environment
source venv/bin/activate

# List all scenarios
python mpa_sdk_test_runner.py --list

# Run single scenario (start here)
python mpa_sdk_test_runner.py --scenario FULL-001

# Run category
python mpa_sdk_test_runner.py --category "End-to-End Linear"

# Run all
python mpa_sdk_test_runner.py --all
```

**First Run:** You'll be prompted to authenticate via browser (device code flow). Complete the auth and tests will proceed.

## Analyze Results

Results saved to `./test_results/`:
- `mpa_results_YYYYMMDD_HHMMSS.md` - Human-readable report
- `mpa_results_YYYYMMDD_HHMMSS.json` - Machine-readable for analysis

## Iteration Loop

For each failing scorer:

1. **Identify Pattern**
   - Which turns fail?
   - What behavior is missing?
   - Is it consistent across scenarios?

2. **Trace to Instructions**
   - Open `/release/v5.5/agents/mpa/mastercard/instructions/MPA_Copilot_Instructions_v5.9.txt`
   - Find the section governing this behavior
   - Identify gap or conflicting guidance

3. **Make Targeted Fix**
   - Edit the instruction section
   - Keep under 8,000 characters
   - Increment version (v5.10, v5.11, etc.)

4. **Re-test**
   - Run the failing scenario
   - Verify fix
   - Run full suite to check for regressions

## Key Files

| File | Purpose |
|------|---------|
| `MPA_Copilot_Instructions_v5.9.txt` | Core instructions (7,774 chars) |
| `KB_00_Agent_Core_Operating_Standards.txt` | Foundational behaviors |
| `MPA_Conversation_Examples_v5_5.txt` | Example conversations |
| `mpa_comprehensive_test_suite.json` | Test definitions |
| `mpa_sdk_test_runner.py` | Test execution |

## Success Criteria

All 14 scorers at **95%+ average**:

| Scorer | Description |
|--------|-------------|
| response_length | Under 75 words |
| single_question | One question per response |
| acronym_definition | Define CAC, ROAS, etc. |
| source_citation | Attribute all numbers |
| step_boundary | No channels in Steps 1-2 |
| proactive_intelligence | Calculate when data available |
| feasibility_framing | Flag aggressive targets |
| idk_protocol | Model assumptions, don't push |
| adaptive_sophistication | Match user level |
| tone | Warm, supportive |
| progress_over_perfection | Move forward |
| step_completion | Know when done |
| rag_retrieval | Find KB content |
| self_referential_learning | Remember context |

## Common Fixes

**response_length fails:** Tighten "under 75 words" language, add "Never wall of text"

**source_citation fails:** Strengthen SOURCE TRANSPARENCY, add examples of attribution

**proactive_intelligence fails:** Expand MANDATORY RESEARCH TRIGGER, emphasize "SEARCH WEB"

**step_boundary fails:** Harden STEP BOUNDARIES with explicit "Never discuss X in Steps Y-Z"

## When Complete

Once all scorers pass at 95%+:
1. Commit final instructions with version number
2. Upload to Copilot Studio
3. Upload to SharePoint KB
4. Run Braintrust evaluation for formal validation

---

**Start with:** `python mpa_sdk_test_runner.py --scenario FULL-001`
