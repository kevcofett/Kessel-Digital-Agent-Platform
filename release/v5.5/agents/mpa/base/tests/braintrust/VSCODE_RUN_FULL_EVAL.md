# VS Code: Run Full MPA Evaluation

## Pre-Requisites

1. Open VS Code in the braintrust directory:
```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust
code .
```

2. Ensure `.env` has ANTHROPIC_API_KEY set

---

## Step 1: Fix KB Path Configuration

The RAG engine is looking at wrong path. Fix in `rag/types.ts`:

**Current (line 176):**
```typescript
kbDirectory: '../../../kb',
```

**Change to:**
```typescript
kbDirectory: '../../kb-v6',
```

This resolves from `braintrust/rag/` to `braintrust/../../kb-v6` = `base/kb-v6`

---

## Step 2: Rebuild TypeScript

```bash
npm run build
```

---

## Step 3: Run Full Evaluation

**Option A: All 33 scenarios (1-2 hours)**
```bash
source .env && npx tsx run-multi-turn-standalone.ts 2>&1 | tee eval-output-$(date +%Y%m%d-%H%M%S).log
```

**Option B: Quick validation (5-10 min)**
```bash
source .env && npx tsx run-multi-turn-standalone.ts --category quick
```

**Option C: Specific scenario**
```bash
source .env && npx tsx run-multi-turn-standalone.ts --scenario full-10-step
```

---

## Step 4: Monitor Progress

The test runner outputs results for each scenario as it completes. Look for:
```
============================================================
SCENARIO: [name]
============================================================
STATUS: ✅ PASSED / ❌ FAILED
Composite Score: XX.X%
```

---

## Step 5: Review Summary

At the end, you'll see:
```
============================================================
EVALUATION SUMMARY
============================================================
SCENARIO RESULTS:
------------------------------------------------------------
[list of all scenarios with scores]
------------------------------------------------------------
Average Score: XX.X%
Critical Failures: N

OVERALL STATUS: PASS/FAIL
```

---

## Expected Runtime

| Category | Scenarios | Est. Time |
|----------|-----------|-----------|
| quick | 2 | 5-10 min |
| targeting | 3 | 10-15 min |
| reforecasting | 12 | 30-45 min |
| all | 33 | 60-120 min |

---

## Troubleshooting

**If KB still fails to load:**
1. Verify path exists: `ls -la ../../kb-v6/`
2. Check file count: `ls ../../kb-v6/*.txt | wc -l` (should be 25)
3. Try absolute path in types.ts if needed

**If tests hang:**
- Check API rate limits
- Verify ANTHROPIC_API_KEY is valid
- Check network connectivity

---

## After Evaluation

1. Commit results if successful:
```bash
git add .
git commit -m "test(mpa): Full v5.8 evaluation results - XX% pass rate"
git push
```

2. If failures, analyze which scorers need KB updates
