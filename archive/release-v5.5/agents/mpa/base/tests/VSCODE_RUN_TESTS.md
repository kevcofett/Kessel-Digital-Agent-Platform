# VS Code Claude: MPA Test Execution Instructions

## Context

MPA v5.9 instructions are ready for testing. A comprehensive test framework has been created with:
- 15 test scenarios, 180+ conversation turns
- SDK-based test runner connecting directly to Copilot Studio
- 14 scorers matching Braintrust definitions
- Target: 95%+ on all scorers

## Critical Optimization Principles

### Optimize for OUTCOMES, Not Scores

The scores are proxies for real-world behavior. Your goal is to make MPA produce excellent media plans that help users succeed. A response that technically passes all scorers but fails to help the user is a failure. A response that deeply helps the user will naturally score well.

Ask: "Would this response help a real marketing professional build a better media plan?"

### Holistic System View

MPA behavior emerges from THREE sources working together:

1. **Core Instructions** (`MPA_Copilot_Instructions_v5.9.txt`) - Primary behavioral guidance, 7,500-7,999 chars
2. **KB Documents** - Extended guidance, examples, benchmarks:
   - `KB_00_Agent_Core_Operating_Standards.txt` - Foundational behaviors
   - `MPA_Conversation_Examples_v5_5.txt` - Example conversations
   - `KB_01_Strategic_Framework_Reference.txt` - Strategic guidance
   - `KB_02_Audience_Targeting_Sophistication.txt` - Audience guidance
   - `KB_03_Forecasting_Modeling_Philosophy.txt` - Analytics guidance
   - `KB_04_Channel_Role_Playbooks.txt` - Channel guidance
   - `KB_05_Practical_Constraints_Execution.txt` - Execution guidance
3. **Copilot Studio Configuration** - Topics, actions, knowledge sources

When diagnosing failures, consider ALL sources. A fix might require:
- Changing core instructions
- Adding examples to KB
- Removing conflicting guidance across files
- Strengthening KB content that core instructions reference

### Compliance Requirements (Non-Negotiable)

**6-Rule Compliance Framework** - ALL documents must follow:
1. ALL-CAPS HEADERS - Section headers uppercase only
2. SIMPLE LISTS - Hyphens only, no bullets or numbers  
3. ASCII ONLY - No Unicode, emojis, or special characters
4. ZERO VISUAL DEPENDENCIES - No tables requiring rendering
5. MANDATORY LANGUAGE - Use "must", "shall", "required"
6. PROFESSIONAL TONE - Agent-ready decision logic

**Copilot Format Requirements:**
- Core instructions: 7,500-7,999 characters (currently 7,774)
- KB documents: Under 36,000 characters each
- No markdown formatting that Copilot can't parse
- No emojis or special Unicode

Before committing ANY change, verify compliance.

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

### 1. Identify the Outcome Gap

Do not just look at the score. Ask:
- What did the user need in this moment?
- What should an expert media strategist have done?
- How did MPA's response fall short of that ideal?
- Is this a pattern across multiple turns/scenarios?

### 2. Diagnose Holistically

Check ALL sources for the root cause:

**Core Instructions** (`/release/v5.5/agents/mpa/mastercard/instructions/MPA_Copilot_Instructions_v5.9.txt`):
- Is the expected behavior specified?
- Is it specified clearly enough?
- Does conflicting guidance exist?

**KB Documents** (`/release/v5.5/agents/mpa/base/knowledge/`):
- Do examples demonstrate the correct behavior?
- Is there conflicting guidance in KB?
- Are benchmarks/data available for the agent to cite?

**Cross-File Conflicts:**
- Does KB say one thing and instructions say another?
- Are there implicit assumptions that aren't explicit?

### 3. Design the Fix

Consider where the fix belongs:
- **Core Instructions**: Behavioral rules, hard constraints, response format
- **KB Documents**: Examples, benchmarks, extended guidance, edge cases

The fix must:
- Address the outcome gap, not just the score
- Remain 6-rule compliant
- Keep core instructions within 7,500-7,999 characters
- Not break other behaviors (check for conflicts)

### 4. Implement and Verify

- Make the targeted change
- Verify 6-rule compliance
- Verify character count (core instructions)
- Increment version number (v5.10, v5.11, etc.)

### 5. Re-test

- Run the failing scenario first
- Verify the outcome is now correct (not just the score)
- Run related scenarios to check for regressions
- Run full suite before declaring success

## Key Files

| File | Location | Purpose | Constraints |
|------|----------|---------|-------------|
| Core Instructions | `/release/v5.5/agents/mpa/mastercard/instructions/MPA_Copilot_Instructions_v5.9.txt` | Primary behavior | 7,500-7,999 chars |
| Core Standards | `/release/v5.5/agents/mpa/base/knowledge/KB_00_Agent_Core_Operating_Standards.txt` | Foundational behaviors | 6-rule compliant |
| Examples | `/release/v5.5/agents/mpa/base/knowledge/MPA_Conversation_Examples_v5_5.txt` | Conversation patterns | 6-rule compliant |
| Test Suite | `/release/v5.5/agents/mpa/base/tests/mpa_comprehensive_test_suite.json` | Test definitions | - |
| Test Runner | `/release/v5.5/agents/mpa/base/tests/mpa_sdk_test_runner.py` | Execution | - |

## Success Criteria

**All 14 scorers at 95%+ average** - but remember, scores are proxies for outcomes.

| Scorer | Target | What Good Outcomes Look Like |
|--------|--------|------------------------------|
| response_length | 95%+ | Concise responses that respect user time |
| single_question | 95%+ | Focused progression, not interrogation |
| acronym_definition | 95%+ | Accessible to all sophistication levels |
| source_citation | 95%+ | User can trust and verify all claims |
| step_boundary | 95%+ | Logical flow that builds understanding |
| proactive_intelligence | 95%+ | Agent adds value through analysis |
| feasibility_framing | 95%+ | User understands what targets require |
| idk_protocol | 95%+ | Progress despite uncertainty |
| adaptive_sophistication | 95%+ | Meets user where they are |
| tone | 95%+ | User feels supported and capable |
| progress_over_perfection | 95%+ | Momentum over paralysis |
| step_completion | 95%+ | Clear sense of progress |
| rag_retrieval | 95%+ | Relevant knowledge surfaced |
| self_referential_learning | 95%+ | Coherent multi-turn experience |

## Compliance Verification

Before committing any change:

### 6-Rule Check
```
- [ ] ALL-CAPS HEADERS only
- [ ] Hyphens only for lists (no bullets, no numbers)
- [ ] ASCII only (no Unicode, no emojis)
- [ ] No tables requiring rendering
- [ ] Uses "must", "shall", "required" language
- [ ] Professional, agent-ready tone
```

### Character Count (Core Instructions)
```bash
wc -c /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/mastercard/instructions/MPA_Copilot_Instructions_v5.9.txt
# Must be 7,500-7,999
```

## When Complete

Once all scorers pass at 95%+ with good outcomes:

1. Final compliance verification
2. Commit with clear version number and changelog
3. Upload instructions to Copilot Studio
4. Upload KB files to SharePoint MediaPlanningKB
5. Run Braintrust evaluation for formal validation

---

**Start with:** `python mpa_sdk_test_runner.py --scenario FULL-001`

**Remember:** You are optimizing for excellent media planning outcomes. The scores measure whether you achieved that goal.
