# MPA v5.7 Braintrust Evaluation Framework

This package contains custom scorers and test datasets for evaluating the Media Planning Agent (MPA) Copilot against the v5.7 instruction set requirements.

## What We Are Testing

We test the **combination** of:
1. **Core Instructions** - The main copilot instruction file
2. **Knowledge Base Documents** - Supporting KB documents injected via RAG

The core instructions define behavior. The KB documents provide detailed guidance, examples, and benchmarks. They work together in harmony to achieve target scores.

## Critical Requirements

### Instruction Character Limits

**MANDATORY**: Core instructions MUST be between **7,500 and 7,999 characters**.

| File | Min | Max | Reason |
|------|-----|-----|--------|
| `MPA_Copilot_Instructions_v5_7_4.txt` | 7,500 | 7,999 | Copilot has 8K char limit; truncation causes failures |

**Before any evaluation run:**
```bash
wc -c ../../copilot/MPA_Copilot_Instructions_v5_7_4.txt
# Must show between 7500 and 7999
```

### When Instructions Exceed 8K

If you need to add content to instructions:
1. **DO NOT exceed 8K** - Copilot will truncate, breaking critical sections
2. **Move detail to KB documents** - Create or update KB docs with expanded guidance
3. **Keep only essential rules in instructions** - Instructions = what to do, KB = how/why/examples

### Key Files

| File | Purpose | Char Limit |
|------|---------|------------|
| `../../copilot/MPA_Copilot_Instructions_v5_7_4.txt` | Production instructions | 7,500-7,999 |
| `mpa-prompt-content.ts` | Test system prompt (must sync with above) | No limit |
| `../../kb/*.txt` | Knowledge base documents | No limit |

### Syncing Instructions

When you update `MPA_Copilot_Instructions_v5_7_4.txt`, you MUST also update `mpa-prompt-content.ts` to keep tests in sync with production.

## Files

- `mpa-braintrust-scorers.ts` - 12 custom scorers (6 code-based, 6 LLM-as-a-judge)
- `mpa-evaluation-dataset.json` - Test cases based on real interaction patterns

## Scorer Overview

### Code-Based Scorers (Fast, Deterministic)

| Scorer | Slug | What It Checks |
|--------|------|----------------|
| Response Length | `response-length` | Under 75 words (RESPONSE DISCIPLINE) |
| Single Question | `single-question` | Only one question at a time (QUESTION DISCIPLINE) |
| Acronym Definition | `acronym-definition` | CAC, ROAS, LTV defined before use |
| Source Citation | `source-citation` | Data points have attribution |
| Step Boundary | `step-boundary` | No channels/timing in Steps 1-2 |
| IDK Protocol | `idk-protocol` | Proper handling of "I don't know" |

### LLM-as-a-Judge Scorers (Nuanced, Subjective)

| Scorer | Slug | What It Checks |
|--------|------|----------------|
| Adaptive Sophistication | `adaptive-sophistication` | Language matches user level |
| Tone Quality | `tone-quality` | Supportive without condescension |
| Proactive Intelligence | `proactive-intelligence` | Shows math vs just interrogates |
| Progress Over Perfection | `progress-over-perfection` | Makes assumptions, keeps momentum |
| Feasibility Framing | `feasibility-framing` | Properly frames aggressive targets |
| Step Completion | `step-completion` | Knows when step is done |

## Setup Instructions

### 1. Install Braintrust CLI

```bash
npm install -g braintrust
```

### 2. Authenticate

```bash
braintrust login
```

### 3. Push Scorers to Braintrust

```bash
cd /path/to/scorers
braintrust push mpa-braintrust-scorers.ts
```

### 4. Create Dataset in Braintrust UI

1. Navigate to your project in Braintrust
2. Go to Datasets > + New Dataset
3. Name it "MPA v5.7 Evaluation"
4. Upload `mpa-evaluation-dataset.json`

### 5. Run Evaluation in Playground

1. Open Braintrust Playground
2. Load your MPA prompt/model
3. Select the MPA dataset
4. Add scorers from the Scorers menu
5. Run evaluation

## Scoring Weights (Recommended)

For overall quality assessment, weight scorers by importance:

| Category | Scorers | Weight |
|----------|---------|--------|
| Core Behaviors | IDK Protocol, Progress Over Perfection | 25% |
| User Experience | Adaptive Sophistication, Tone Quality | 20% |
| Analysis Quality | Proactive Intelligence, Feasibility Framing | 20% |
| Discipline | Response Length, Single Question | 15% |
| Compliance | Step Boundary, Source Citation, Acronym Definition | 15% |
| Step Management | Step Completion | 5% |

## Key Test Scenarios

### 1. Uniteller Economics Loop (PRIMARY TEST)

This is the scenario that revealed the v5.6 issues:

- **Input**: Basic remittance customer acquisition brief
- **Problem Found**: Agent pushed too hard on economics, used complex language (gross profit vs simple revenue)
- **Expected v5.7 Behavior**: When user says "I don't know", model with benchmarks and move on

### 2. Sophisticated User Detection

Tests if agent can detect and match high sophistication:

- **Input**: DTC fintech with LTV/CAC ratios, D30 metrics
- **Expected**: Skip basic definitions, match jargon level

### 3. Aggressive Target Framing

Tests if agent properly calls out unrealistic targets:

- **Input**: $10 implied CAC for B2B SaaS
- **Expected**: Direct callout with sourced benchmark, path forward

## Interpreting Results

### Score Thresholds

| Score | Interpretation |
|-------|----------------|
| 0.9+ | Excellent - instruction set working as designed |
| 0.7-0.9 | Good - minor issues to address |
| 0.5-0.7 | Needs Improvement - noticeable gaps |
| <0.5 | Failing - significant instruction violations |

### Key Metrics to Watch

1. **IDK Protocol Score** - If low, agent is still pushing when users don't know
2. **Progress Over Perfection** - If low, agent is blocking progress
3. **Adaptive Sophistication** - If low, language mismatch with users
4. **Response Length** - If low, responses are too verbose

## Iteration Workflow

1. Run evaluation with current instruction set
2. Identify lowest-scoring areas
3. Review specific failing test cases
4. Update instruction set to address gaps
5. Re-run evaluation to verify improvement
6. Commit new instruction version when scores improve

## Adding Custom Test Cases

Add test cases to the dataset JSON following this structure:

```json
{
  "id": "unique_test_id",
  "name": "Human-readable test name",
  "input": "User message to test",
  "context": "Optional context about conversation state",
  "metadata": {
    "currentStep": 1,
    "userSophistication": "basic|moderate|high",
    "collectedData": {},
    "hasEnoughDataToModel": false
  },
  "expected_behaviors": [
    "behavior_the_agent_should_exhibit"
  ],
  "anti_patterns": [
    "behavior_the_agent_should_avoid"
  ],
  "ideal_response": "Optional gold-standard response"
}
```

## Version History

- **v5.7** (2025-01-10): Added IDK Protocol, Adaptive Sophistication, Minimum Viable Step 2, Progress Over Perfection
- **v5.6** (2025-01-09): Baseline with economics loop issue identified
