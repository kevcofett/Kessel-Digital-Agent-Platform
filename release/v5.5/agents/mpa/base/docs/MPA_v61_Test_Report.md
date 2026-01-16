# MPA v6.1 Test Infrastructure & Evaluation Report

## Executive Summary

Successfully implemented comprehensive test infrastructure for MPA v6.1 with 19 scorers and 11 test cases. Two evaluation phases completed with measurable improvements in key v6.1 capabilities.

**Total Cost:** ~$0.55 (Phase 1: $0.20, Phase 2: $0.35)

---

## Braintrust Experiment Links

- **Phase 1:** https://www.braintrust.dev/app/Kessel%20Digital/p/Kessel-MPA-Agent/experiments/MPA%20v6.1%20Eval%20-%202026-01-16T20%3A12%3A28.296Z
- **Phase 2:** https://www.braintrust.dev/app/Kessel%20Digital/p/Kessel-MPA-Agent/experiments/MPA%20v6.1%20Eval%20-%202026-01-16T20%3A23%3A18.580Z

---

## Test Infrastructure Summary

### Scorers (19 Total)

| Tier | Scorer | Type | Focus |
|------|--------|------|-------|
| 1 | mpa-response-length | Deterministic | Word count |
| 1 | mpa-single-question | Deterministic | Question count |
| 1 | mpa-idk-protocol | Deterministic | "I don't know" handling |
| 1 | mpa-step-boundary | Deterministic | Step discipline |
| 1 | mpa-progress-over-perfection | LLM | Momentum |
| 1 | mpa-adaptive-sophistication | LLM | Language matching |
| 1 | mpa-proactive-intelligence | LLM | Analysis vs questions |
| 2 | mpa-acronym-definition | Deterministic | Jargon explanation |
| 2 | mpa-source-citation | Deterministic | Source attribution |
| 2 | mpa-feasibility-framing | Deterministic | Target assessment |
| 2 | mpa-rag-retrieval | Deterministic | KB citation |
| **2** | **mpa-auto-benchmark** | Deterministic | **v6.1: Target comparison** |
| **2** | **mpa-data-confidence** | Deterministic | **v6.1: Source reliability** |
| **2** | **mpa-platform-taxonomy** | Deterministic | **v6.1: Platform segments** |
| **2** | **mpa-geography-census** | Deterministic | **v6.1: DMA/population** |
| **2** | **mpa-behavioral-contextual** | Deterministic | **v6.1: Behavioral signals** |
| 3 | mpa-tone | LLM | Warmth/collegiality |
| 3 | mpa-step-completion | LLM | Step recognition |
| 3 | mpa-self-referential-learning | LLM | Context retention |

### Test Cases (11 Total)

| Step | Category | Count | Coverage |
|------|----------|-------|----------|
| 1 | Initial brief & targets | 3 | Budget, KPI, vertical |
| 2 | IDK protocol & confidence | 3 | Estimates, user data, benchmark |
| 3 | Audience targeting | 3 | Platform taxonomy, behavioral |
| 4 | Geography | 2 | DMA sizing, budget allocation |

---

## Phase 2 Results (Final)

### Score Summary by Category

| Category | Scorers | Avg Score | Status |
|----------|---------|-----------|--------|
| **v6.1 Capabilities** | 5 | 90.00% | ✅ Working |
| **Core Quality** | 7 | 80.83% | ✅ Stable |
| **Data Quality** | 4 | 57.81% | ⚠️ Needs improvement |
| **Style** | 3 | 78.96% | ✅ Good |

### Detailed Scores

| Scorer | Score | vs Phase 1 | Assessment |
|--------|-------|------------|------------|
| mpa-step-boundary | 100.00% | - | ✅ Perfect |
| mpa-geography-census | 100.00% | - | ✅ Perfect |
| mpa-idk-protocol | 97.50% | -1.82% | ✅ Excellent |
| mpa-auto-benchmark | 91.88% | +15.45% | ✅ Excellent |
| mpa-progress-over-perfection | 91.25% | - | ✅ Excellent |
| mpa-step-completion | 87.50% | +7.27% | ✅ Good |
| mpa-behavioral-contextual | 86.88% | - | ✅ Good |
| mpa-data-confidence | 86.25% | +11.82% | ✅ Good |
| mpa-platform-taxonomy | 85.00% | - | ✅ Good |
| mpa-adaptive-sophistication | 83.75% | +4.55% | ✅ Good |
| mpa-tone | 78.75% | -1.82% | ✅ Good |
| mpa-source-citation | 75.00% | +9.09% | ⚠️ Improving |
| mpa-single-question | 75.00% | +9.09% | ⚠️ Improving |
| mpa-proactive-intelligence | 74.38% | -16.36% | ⚠️ Harder tests |
| mpa-self-referential-learning | 70.63% | -3.64% | ⚠️ Acceptable |
| mpa-acronym-definition | 62.50% | - | ⚠️ Needs work |
| mpa-response-length | 59.38% | -4.55% | ⚠️ Acceptable |
| mpa-rag-retrieval | 48.75% | +9.09% | ❌ Needs instruction fix |
| mpa-feasibility-framing | 45.00% | +9.09% | ❌ Needs instruction fix |

---

## Root Cause Analysis: Low Scorers

### mpa-feasibility-framing (45%)

**Issue:** Agent not consistently labeling targets as realistic/aggressive/conservative

**Pattern Expected:**
```
Based on KB data for ecommerce, typical CAC runs $35-65. Your target of $50 is REALISTIC - 
right in the middle of the typical range.
```

**Pattern Often Seen:**
```
At $50 per customer, that's a reasonable efficiency target for ecommerce.
```

**Fix:** Emphasize explicit assessment labels in instructions

### mpa-rag-retrieval (49%)

**Issue:** Agent not using "Based on KB" phrase consistently

**Pattern Expected:**
```
Based on KB data for your vertical, typical CAC ranges from $35 to $65.
```

**Pattern Often Seen:**
```
Typical CAC for ecommerce runs $35-65.
```

**Fix:** Reinforce "Based on KB data" attribution in DATA CONFIDENCE section

### mpa-acronym-definition (63%)

**Issue:** Agent using CAC, ROAS, CPM without definitions when user appears basic

**Pattern Expected:**
```
...which works out to $50 CAC (Customer Acquisition Cost)...
```

**Pattern Often Seen:**
```
...which implies a $50 CAC...
```

**Fix:** Add explicit guidance to define acronyms on first use for non-expert users

---

## Recommended Instruction Updates

### 1. Feasibility Labeling (Priority: High)

Add to AUTOMATIC BENCHMARK COMPARISON:
```
MANDATORY ASSESSMENT LABELS
After comparing to benchmark, always label the target:
- REALISTIC: Within typical range
- CONSERVATIVE: Above typical (easier)
- AGGRESSIVE: Below typical (harder)
- VERY AGGRESSIVE: Significantly below typical
```

### 2. RAG Attribution (Priority: High)

Enhance DATA CONFIDENCE section:
```
MANDATORY KB ATTRIBUTION
When citing benchmark data, always prefix with source:
- "Based on KB data for [vertical]..."
- "KB benchmarks show..."
- "According to KB data..."
```

### 3. Acronym Definitions (Priority: Medium)

Add to ADAPTIVE COMMUNICATION:
```
ACRONYM HANDLING
For basic users, define acronyms on first use:
- "$50 CAC (Customer Acquisition Cost)"
- "3x ROAS (Return on Ad Spend)"
For expert users, use acronyms freely.
```

---

## Files Created/Modified

### New Files
- `scorers/v61-scorers.ts` - 5 new outcome-focused scorers (617 lines)
- `scenarios/v61-test-scenarios.ts` - 5 comprehensive test scenarios (471 lines)

### Modified Files
- `mpa-eval.ts` - Added 5 new test cases, integrated 4 new scorers
- `mpa-multi-turn-types.ts` - Made QualityContext/ScenarioSuccessCriteria more flexible
- `scorers/index.ts` - Updated evaluateSuccess for optional fields
- `scenarios/index.ts` - Exported v6.1 scenarios

---

## Branch Status

| Branch | Commit | Status |
|--------|--------|--------|
| feature/v6.0-retrieval-enhancement | c057632a | ✅ Current |
| deploy/personal | c057632a | ✅ Synced |
| deploy/mastercard | merged | ✅ Synced |

---

## Next Steps

1. **Instruction Updates** - Apply fixes for feasibility, RAG attribution, acronyms
2. **Re-run Eval** - Validate improvements
3. **Consider Phase 3** - Full scenario integration if needed

---

*Report generated: 2026-01-16T20:30:00Z*
