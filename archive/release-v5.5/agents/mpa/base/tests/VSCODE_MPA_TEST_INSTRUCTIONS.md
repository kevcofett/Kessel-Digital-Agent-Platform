# MPA Comprehensive Test Framework - VS Code Claude Instructions

## Overview

This document provides instructions for VS Code Claude to run comprehensive MPA tests, analyze results, and iterate on instruction improvements.

## File Locations

```
/release/v5.5/agents/mpa/base/tests/
├── mpa_comprehensive_test_suite.json    # 15 test scenarios, 180+ turns
├── mpa_comprehensive_test_runner.py     # Test execution and scoring
├── test_results/                        # Output directory for results
└── .env                                 # Configuration (create from template)
```

## Test Suite Contents

### Categories

| Category | Scenarios | Total Turns | Purpose |
|----------|-----------|-------------|---------|
| End-to-End Linear | 2 | 49 | Full 10-step journeys |
| Non-Linear Navigation | 2 | 27 | Jump ahead, skip steps |
| Data Changes | 2 | 26 | Mid-process budget/objective changes |
| RAG Validation | 2 | 18 | KB retrieval and web search |
| Self-Referential Learning | 1 | 15 | Context retention across turns |
| IDK Protocol | 1 | 10 | Handling user uncertainty |
| Adaptive Sophistication | 2 | 16 | Basic vs expert user handling |
| Edge Cases | 2 | 16 | Unrealistic expectations, conflicts |

### Scenario IDs

- `FULL-001`: Complete Linear Flow - B2B SaaS (25 turns)
- `FULL-002`: Complete Linear Flow - DTC E-commerce (24 turns)
- `NONLIN-001`: Non-Linear Navigation - Jump Ahead (15 turns)
- `NONLIN-002`: Non-Linear Navigation - Skip Steps (12 turns)
- `CHANGE-001`: Mid-Process Data Changes - Budget Cut (14 turns)
- `CHANGE-002`: Mid-Process Data Changes - Objective Pivot (12 turns)
- `RAG-001`: RAG Performance - Benchmark Retrieval (10 turns)
- `RAG-002`: RAG Performance - Web Search Validation (8 turns)
- `LEARN-001`: Self-Referential Learning - Context Retention (15 turns)
- `IDK-001`: I Don't Know Protocol - User Uncertainty (10 turns)
- `SOPH-001`: Adaptive Sophistication - Basic User (8 turns)
- `SOPH-002`: Adaptive Sophistication - Expert User (8 turns)
- `EDGE-001`: Edge Case - Unrealistic Expectations (8 turns)
- `EDGE-002`: Edge Case - Conflicting Requirements (8 turns)

## Scorers (14 Total)

### Code-Based Scorers (Fast, Deterministic)

1. **response_length**: Response under 75 words (1.0 if ≤75, 0.5 if ≤150, 0 if >150)
2. **single_question**: Only one question mark per response
3. **acronym_definition**: CAC, ROAS, LTV, etc. defined on first use
4. **source_citation**: Data claims attributed (KB, web search, estimate)
5. **step_boundary**: No channels/timing/creative in Steps 1-2
6. **proactive_intelligence**: Calculates when budget+target available
7. **feasibility_framing**: Aggressive targets flagged with benchmarks
8. **idk_protocol**: Models with assumptions when user uncertain

### LLM-Based Scorers (Nuanced)

9. **adaptive_sophistication**: Language matches user level
10. **tone**: Warm, supportive, colleague-like
11. **progress_over_perfection**: Makes progress vs blocking
12. **step_completion**: Knows when step is complete
13. **rag_retrieval**: Successfully retrieves relevant KB content
14. **self_referential_learning**: References earlier context accurately

## Running Tests

### Prerequisites

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install anthropic requests python-dotenv aiohttp

# Create .env file
cp .env.example .env
# Edit .env with your API keys
```

### Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Choose ONE of these connection methods:
# Option A: Direct Line (preferred if available)
DIRECTLINE_SECRET=your-directline-secret
DIRECTLINE_ENDPOINT=https://directline.botframework.com/v3/directline

# Option B: Power Automate
PA_CONVERSATION_URL=https://prod-XX.westus.logic.azure.com/...
PA_API_KEY=your-pa-api-key

# Optional
SCORING_MODEL=claude-sonnet-4-20250514
OUTPUT_DIR=./test_results
RESPONSE_TIMEOUT=60
TURN_DELAY=2.0
```

### Commands

```bash
# List all available scenarios
python mpa_comprehensive_test_runner.py --list

# Run single scenario
python mpa_comprehensive_test_runner.py --scenario FULL-001

# Run category
python mpa_comprehensive_test_runner.py --category "End-to-End Linear"

# Run all scenarios
python mpa_comprehensive_test_runner.py --all

# Use mock client for local testing
python mpa_comprehensive_test_runner.py --scenario FULL-001 --mock
```

## VS Code Claude Workflow

### Phase 1: Initial Testing

1. Run mock tests first to verify framework:
   ```bash
   python mpa_comprehensive_test_runner.py --all --mock
   ```

2. Review generated report in `test_results/`

3. If framework works, run against actual Copilot:
   ```bash
   python mpa_comprehensive_test_runner.py --scenario FULL-001
   ```

### Phase 2: Analyze Results

For each failed scorer:

1. Identify which turns failed
2. Extract the user input and agent response
3. Identify the gap between expected and actual behavior
4. Trace to instruction section causing the issue

### Phase 3: Iterate Instructions

1. Open `MPA_Copilot_Instructions_v5.9.txt`
2. Identify instruction section to modify
3. Make targeted change
4. Re-run the failing scenario
5. Verify fix didn't break other scorers

### Phase 4: KB Updates

If instruction changes alone don't fix issues:

1. Check `KB_00_Agent_Core_Operating_Standards.txt`
2. Check `MPA_Conversation_Examples_v5_5.txt`
3. Add examples of correct behavior
4. Re-run tests

## Success Criteria

All scorers must achieve **95% or higher** average score:

| Scorer | Target |
|--------|--------|
| response_length | ≥0.95 |
| single_question | ≥0.95 |
| acronym_definition | ≥0.95 |
| source_citation | ≥0.95 |
| step_boundary | ≥0.95 |
| idk_protocol | ≥0.95 |
| adaptive_sophistication | ≥0.95 |
| tone | ≥0.95 |
| proactive_intelligence | ≥0.95 |
| progress_over_perfection | ≥0.95 |
| feasibility_framing | ≥0.95 |
| step_completion | ≥0.95 |
| rag_retrieval | ≥0.95 |
| self_referential_learning | ≥0.95 |

## Common Failure Patterns

### Proactive Intelligence Failures

**Symptom:** Agent asks questions instead of calculating

**Fix:** Strengthen MANDATORY RESEARCH TRIGGER section:
```
When you have budget AND volume target:
1. CALCULATE implied efficiency immediately
2. SEARCH web for benchmarks
3. ASSESS feasibility
4. THEN ask next question
```

### Source Citation Failures

**Symptom:** Numbers without attribution

**Fix:** Strengthen SOURCE TRANSPARENCY section:
```
Every number must have one of:
- "Based on your input"
- "Based on KB"
- "Based on web search"
- "My estimate"
```

### Self-Referential Learning Failures

**Symptom:** Agent forgets earlier context

**Fix:** This is typically a Copilot Studio context window issue, not instruction issue. Check:
- Conversation history length
- Context preservation settings
- Consider summarization checkpoints

### Step Boundary Failures

**Symptom:** Agent discusses channels in Step 1

**Fix:** Strengthen STEP BOUNDARIES section:
```
Steps 1-2: Outcomes and Economics ONLY
- Never mention: channels, timing, creative, media mix
- If user asks, redirect: "Let's establish objectives first"
```

## Braintrust Integration

Once all local tests pass at 95%+:

1. Export test suite to Braintrust format:
   ```bash
   python convert_to_braintrust.py
   ```

2. Upload to Braintrust:
   ```bash
   braintrust push mpa-evaluation
   ```

3. Run full evaluation:
   ```bash
   braintrust eval mpa-evaluation --dataset mpa_comprehensive
   ```

## Files Modified During Iteration

Track all changes:

- `MPA_Copilot_Instructions_v5.9.txt` → increment to v5.10, v5.11, etc.
- `KB_00_Agent_Core_Operating_Standards.txt`
- `MPA_Conversation_Examples_v5_5.txt`
- `MPA_Adaptive_Language_v5_5.txt`

Commit after each successful iteration:
```bash
git add .
git commit -m "MPA v5.X: [description of change] - [scorer improved]"
```

## Troubleshooting

### Connection Issues

If Copilot connection fails:
1. Verify Direct Line secret is valid
2. Check Power Automate flow is enabled
3. Test with mock client first

### Timeout Issues

If responses timeout:
1. Increase `RESPONSE_TIMEOUT` in .env
2. Check Copilot Studio for errors
3. Verify knowledge base is accessible

### Scoring Inconsistencies

If LLM scorers vary:
1. Check scoring model availability
2. Review scorer prompts for clarity
3. Consider adding examples to scorer prompts

## Contact

For framework issues, check:
- Test suite JSON structure
- Scorer implementations in runner
- Environment configuration

For instruction optimization guidance, reference:
- `MPA_Copilot_Instructions_v5.9_CHANGELOG.md`
- Braintrust scorer specifications
