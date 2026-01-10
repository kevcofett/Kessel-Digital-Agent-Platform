# MPA INSTRUCTION VERSION DASHBOARD

## CURRENT BEST

| Attribute | Value |
|-----------|-------|
| Version | v5_7_5 |
| Composite Score | 0.917 (91.7%) |
| Character Count | 7,983 |
| Last Updated | 2026-01-10 |
| Status | Active - TARGET ACHIEVED |

## VERSION HISTORY

| Version | Date | Composite | Delta | Status | Notes |
|---------|------|-----------|-------|--------|-------|
| v5_7 | 2025-01-10 | - | - | BASELINE | IDK Protocol fix, Progress Over Perfection |
| v5_7_1 | 2026-01-10 | - | - | ACCEPTED | Calculation triggers for Step 2 |
| v5_7_2 | 2026-01-10 | - | - | REJECTED | Tier 1 regression (Progress Over Perfection) |
| v5_7_3 | 2026-01-10 | ~0.90 | - | ACCEPTED | Conversation Continuity instruction |
| v5_7_4 | 2026-01-10 | - | - | REJECTED | Tier 1 regression (IDK Protocol) |
| v5_7_5 | 2026-01-10 | 0.917 | +0.017 | ACCEPTED | KB Adaptive Language + RAG simulation |

## SCORER PROGRESSION

Track how each scorer changes across versions.

### Tier 1 (Weight 3.0) - Never Regress

| Version | IDK Protocol | Progress Over Perf | Step Boundary | Tier 1 Avg |
|---------|--------------|-------------------|---------------|------------|
| v5_7_3 | 96.7% | 90.0% | 100.0% | 95.6% |
| v5_7_5 | 100.0% | 90.0% | 100.0% | 96.7% |

### Tier 2 (Weight 2.0) - Protect Strongly

| Version | Adaptive Soph | Source Citation | Tone Quality | Tier 2 Avg |
|---------|---------------|-----------------|--------------|------------|
| v5_7_3 | 76.7% | - | - | - |
| v5_7_5 | 90.0% | - | - | - |

### Tier 3 (Weight 1.0) - Optimize

| Version | Response Len | Single Question | Proactive Intel | Tier 3 Avg |
|---------|--------------|-----------------|-----------------|------------|
| v5_7_3 | 75.0% | 83.3% | 100.0% | 86.1% |
| v5_7_5 | 66.67% | 66.67% | 100.0% | 77.8% |

### Tier 4 (Weight 0.5) - Nice to Have

| Version | Feasibility | Step Completion | Acronym Def | Tier 4 Avg |
|---------|-------------|-----------------|-------------|------------|
| v5_7_5 | - | - | - | - |

## OPTIMIZATION RUNS

Track each /iterate-auto run.

### Run 1

| Attribute | Value |
|-----------|-------|
| Date | 2026-01-10 |
| Starting Version | v5_7_5 |
| Starting Composite | 0.917 |
| Ending Version | v5_7_5 |
| Ending Composite | 0.917 |
| Iterations | 0 |
| Stopping Reason | TARGET ACHIEVED (composite >= 0.90) |

## VARIANT TESTS

Track each /compare-variants run.

### Test 1

| Attribute | Value |
|-----------|-------|
| Date | [pending] |
| Problem | [pending] |
| Variants Tested | [pending] |
| Winner | [pending] |
| Improvement | [pending] |

## CHARACTER COUNT TRACKER

Monitor approach to 8,000 limit.

| Version | Characters | % of Limit | Headroom |
|---------|------------|------------|----------|
| v5_7 | 7,587 | 94.8% | 413 |
| | | | |

## ALERTS

- ⚠️ Character count > 7,500: Consider moving content to KB
- ❌ Character count > 7,800: Critical - must reduce before next iteration
- 🔴 Tier 1 regression detected: Immediate rollback required

## KB DOCUMENTS CREATED

Track KB documents created during optimization.

| Document | Date | Purpose | Referenced By |
|----------|------|---------|---------------|
| MPA_Geography_DMA_Planning_v5_5.txt | 2025-01-10 | Step 4 table requirements | - |
| | | | |
