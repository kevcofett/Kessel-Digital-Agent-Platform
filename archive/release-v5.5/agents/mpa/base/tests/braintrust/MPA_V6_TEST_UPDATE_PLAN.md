# MPA v6.0 Test Infrastructure Update Plan

## OVERVIEW

This document outlines the changes needed to align the Braintrust evaluation framework with MPA v6.0 KB restructuring and benchmark expansion.

---

## 1. INSTRUCTION PATH UPDATES

### mpa-eval.ts
**Current:** Points to v5.11 instructions
**Update:** Point to v6.0 instructions

```typescript
// BEFORE
const INSTRUCTIONS_PATH = process.env.MPA_INSTRUCTIONS_PATH ||
  "/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/kb/MPA_Copilot_Instructions_v5_11.txt";

// AFTER
const INSTRUCTIONS_PATH = process.env.MPA_INSTRUCTIONS_PATH ||
  "/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/personal/instructions/MPA_Copilot_Instructions_v6_0.txt";
```

### mpa-prompt-content.ts
**Current:** Embedded v5.8 prompt as fallback
**Update:** Load v6.0 from file, update embedded fallback

---

## 2. SCORER UPDATES

### 2.1 audience-sizing-completeness.ts (SCORER_SPECIFICATION_v2.1)
**Status:** Already aligned with v2.1 spec
**Verify:** Census citation and taxonomy code detection patterns match KB v6.0

Census patterns to verify:
- /census/i
- /acs\s*\d{4}/i
- /american community survey/i
- /data source/i

Taxonomy patterns to verify:
- /iab\d+/i
- /google (affinity|in-market)/i
- /meta (interests?|behaviors?)/i
- /taxonomy/i

### 2.2 source-citation.ts
**Update:** Add v6.0 citation format support

KB v6.0 uses:
- "Based on Knowledge Base" - no change needed
- "Based on Websearch" - add URL requirement
- "Based on Benchmark" with mpa_benchmark table reference

### 2.3 NEW: kb-retrieval-quality.ts
**Create:** New scorer for KB retrieval effectiveness

Measures:
- META tag routing accuracy
- Document relevance to query intent
- Section-level precision

### 2.4 benchmark-accuracy.ts
**Update:** Validate against 331 benchmark records

New verticals to support:
- RETAIL, ECOMMERCE, CPG, FINANCE, TECHNOLOGY (Tier 1)
- HEALTHCARE, AUTOMOTIVE, TRAVEL (Tier 2)
- EDUCATION, B2B_PROFESSIONAL (Tier 3)

---

## 3. SCENARIO UPDATES

### 3.1 vertical-benchmark-scenarios.ts
**Update:** Add scenarios for new verticals

Current: RETAIL, HEALTHCARE, GAMING, B2B
Add: ECOMMERCE, CPG, FINANCE, TECHNOLOGY, AUTOMOTIVE, TRAVEL, EDUCATION

### 3.2 Benchmark expectations
**Update:** Align expected values with mpa_benchmark_seed_v6_enhanced.csv

Example RETAIL PAID_SEARCH benchmarks:
- CPM: $12.50 (range $8-18)
- CPC: $0.95 (range $0.65-1.40)
- CTR: 4.2% (range 3.0-5.5%)
- CVR: 3.8% (range 2.5-5.0%)
- CPA: $28.50 (range $18-42)
- ROAS: 4.2x (range 3.0-5.5x)

---

## 4. KB CONTENT INJECTION

### Current approach
KB content injected via RAG_TOOL_INSTRUCTIONS in mpa-prompt-content.ts

### v6.0 approach
1. Load KB v6.0 files from /base/kb-v6/
2. Parse META tags for routing
3. Inject relevant sections based on query intent
4. Track retrieval for scoring

### Implementation
```typescript
// New kb-loader.ts
export async function loadKBv6(): Promise<KBDocument[]> {
  const kbPath = '/base/kb-v6/';
  const files = await fs.readdir(kbPath);
  return Promise.all(files.map(f => parseKBDocument(kbPath + f)));
}

export function routeQueryToKB(query: string, documents: KBDocument[]): KBDocument[] {
  // Use META_INTENTS and META_WORKFLOW_STEPS for routing
}
```

---

## 5. BENCHMARK DATA INTEGRATION

### Current
Benchmark data embedded in scenarios or hardcoded

### v6.0
Load from mpa_benchmark_seed_v6_enhanced.csv

```typescript
// New benchmark-loader.ts
export interface Benchmark {
  vertical: string;
  channel: string;
  kpi: string;
  value: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  data_period: string;
}

export async function loadBenchmarks(): Promise<Benchmark[]> {
  const csvPath = '/base/seed-data-v6/mpa_benchmark_seed_v6_enhanced.csv';
  return parseCSV(csvPath);
}

export function getBenchmark(vertical: string, channel: string, kpi: string): Benchmark | null {
  // Lookup with fallback logic
}
```

---

## 6. IMPLEMENTATION PRIORITY

### Phase 1: Critical Path (Do Now)
1. Update INSTRUCTIONS_PATH in mpa-eval.ts → v6.0
2. Update mpa-prompt-content.ts embedded prompt
3. Verify audience-sizing scorer patterns

### Phase 2: Enhanced Scoring (Next)
4. Create benchmark-loader.ts
5. Update benchmark-accuracy scorer
6. Add vertical-specific test scenarios

### Phase 3: Advanced (Later)
7. Implement KB v6.0 loader with META routing
8. Create kb-retrieval-quality scorer
9. Full integration testing

---

## 7. TEST EXECUTION

### Quick validation
```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/tests/braintrust
npm run build
MPA_INSTRUCTIONS_PATH=../../personal/instructions/MPA_Copilot_Instructions_v6_0.txt npx braintrust eval dist/mpa-eval.js
```

### Full suite
```bash
npm run eval:full
```

---

## 8. SUCCESS CRITERIA

- [ ] All 14 scorers pass with v6.0 instructions
- [ ] Benchmark lookup returns correct values for all 14 verticals
- [ ] Audience sizing scorer detects census citations
- [ ] Audience sizing scorer detects taxonomy codes
- [ ] No regressions on existing test scenarios
- [ ] New vertical scenarios pass at 80%+ threshold
