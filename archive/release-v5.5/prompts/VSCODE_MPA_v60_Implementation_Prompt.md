# MPA V6.0 VS CODE CLAUDE IMPLEMENTATION PROMPT

## CONTEXT

You are working on the **feature/v6.0-retrieval-enhancement** branch of the Kessel-Digital-Agent-Platform repository.

**Repository:** /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
**Branch:** feature/v6.0-retrieval-enhancement
**Reference Document:** release/v5.5/docs/MPA_v60_Improvement_Plan.md

This is a major enhancement to the Media Planning Agent focusing on:
1. Hybrid retrieval system (semantic + keyword + structured)
2. KB document restructuring for better chunking
3. Enhanced benchmark schema with temporal awareness

---

## YOUR RESPONSIBILITIES

You are responsible for **code implementation**. Claude Desktop handles planning, KB content, seed data, and Copilot instructions.

### Phase 1 Tasks (Current Priority)

#### Task 1.1: Create KB Document Header Parser

**Location:** `release/v5.5/agents/mpa/base/tests/braintrust/rag/`

Create a parser that extracts metadata from the new KB document format:

```
================================================================================
[SECTION TITLE]
================================================================================

META_WORKFLOW_STEPS: 3,4,5
META_TOPICS: channel_selection, budget_allocation
META_VERTICALS: ALL
META_CHANNELS: PROGRAMMATIC_DISPLAY, CTV_OTT
META_INTENT: CHANNEL_SELECTION, BUDGET_PLANNING
META_CONFIDENCE: HIGH
META_LAST_UPDATED: 2026-01-15

[Section content...]
================================================================================
```

**Deliverable:** `kb-metadata-parser.ts` with:
- `parseDocumentMetadata(content: string): KBSection[]`
- `KBSection` interface with: title, content, metadata (workflowSteps, topics, verticals, channels, intents, confidence, lastUpdated)
- Handle both old format (no META tags) and new format gracefully

#### Task 1.2: Enhance Document Processor for Semantic Chunking

**Location:** `release/v5.5/agents/mpa/base/tests/braintrust/rag/document-processor.ts`

Modify the existing document processor to:
1. Use section boundaries (===) as primary chunk points
2. Extract and attach metadata to each chunk
3. Implement configurable chunk size limits with intelligent splitting
4. Preserve cross-reference links in chunks

**Chunk Size Configuration:**
```typescript
const CHUNK_CONFIGS: Record<string, ChunkConfig> = {
  'reference': { min: 200, max: 400, splitOn: ['---', '\n\n'] },
  'benchmarks': { min: 400, max: 800, splitOn: ['---', '\n\n'] },
  'frameworks': { min: 800, max: 1500, splitOn: ['---', '\n\n'] },
  'expert': { min: 1000, max: 2000, splitOn: ['---', '\n\n'] },
  'examples': { min: 1500, max: 3000, splitOn: ['---', '\n\n'] },
};
```

#### Task 1.3: Implement Query Understanding Module

**Location:** `release/v5.5/agents/mpa/base/tests/braintrust/rag/query-understanding.ts`

Create a query understanding module with:

1. **Intent Classification:**
```typescript
type QueryIntent = 
  | 'BENCHMARK_LOOKUP'    // "What's a good CTR for retail?"
  | 'CHANNEL_SELECTION'   // "Should I use CTV or programmatic?"
  | 'BUDGET_PLANNING'     // "How to allocate $2M budget?"
  | 'AUDIENCE_TARGETING'  // "How do I reach Gen Z?"
  | 'MEASUREMENT_GUIDANCE'// "What KPIs for awareness?"
  | 'WORKFLOW_HELP'       // "What's step 5?"
  | 'GENERAL';            // Fallback

function classifyIntent(query: string): QueryIntent
```

2. **Entity Extraction:**
```typescript
interface ExtractedEntities {
  verticals: string[];
  channels: string[];
  kpis: string[];
  budgetRange: { min: number; max: number } | null;
  objectives: string[];
  timeframe: string | null;
}

function extractEntities(query: string): ExtractedEntities
```

3. **Query Expansion:**
```typescript
function expandQuery(query: string, entities: ExtractedEntities): string[]
```

Use the synonym mappings defined in MPA_v60_Improvement_Plan.md.

#### Task 1.4: Create Retrieval Result Fusion

**Location:** `release/v5.5/agents/mpa/base/tests/braintrust/rag/result-fusion.ts`

Implement Reciprocal Rank Fusion (RRF) algorithm:

```typescript
interface RetrievalResult {
  id: string;
  content: string;
  score: number;
  source: 'keyword' | 'semantic' | 'structured';
  metadata?: KBMetadata;
}

function reciprocalRankFusion(
  keywordResults: RetrievalResult[],
  semanticResults: RetrievalResult[],
  structuredResults: RetrievalResult[],
  k?: number  // smoothing constant, default 60
): RetrievalResult[]
```

---

## CODING STANDARDS

### TypeScript Requirements
- Strict mode enabled
- All functions must have JSDoc comments
- Export types separately from implementations
- Use ES module syntax (import/export)

### File Organization
```
rag/
├── types.ts                 # All type definitions
├── document-processor.ts    # Existing, to enhance
├── kb-metadata-parser.ts    # NEW
├── query-understanding.ts   # NEW
├── result-fusion.ts         # NEW
├── embedding-service.ts     # Existing
├── vector-store.ts          # Existing
├── retrieval-engine.ts      # Existing, will need updates
├── tool-executor.ts         # Existing
└── index.ts                 # Exports
```

### Testing
Create test files for each new module:
- `__tests__/kb-metadata-parser.test.ts`
- `__tests__/query-understanding.test.ts`
- `__tests__/result-fusion.test.ts`

---

## BENCHMARK SCHEMA MIGRATION

### Task 2.1: Create Dataverse Schema Update Script

**Location:** `release/v5.5/scripts/dataverse/`

Create `update-benchmark-schema.py` that adds new columns to mpa_benchmark:

```python
NEW_COLUMNS = [
    # Temporal Metadata
    ("mpa_data_collection_date", "DateOnly"),
    ("mpa_data_period_start", "DateOnly"),
    ("mpa_data_period_end", "DateOnly"),
    ("mpa_freshness_score", "Decimal"),
    ("mpa_next_refresh_date", "DateOnly"),
    
    # Statistical Confidence
    ("mpa_sample_size", "Integer"),
    ("mpa_confidence_interval_low", "Decimal"),
    ("mpa_confidence_interval_high", "Decimal"),
    ("mpa_standard_deviation", "Decimal"),
    ("mpa_methodology", "Text", 500),
    
    # Contextual Factors
    ("mpa_seasonality_factor", "Choice"),
    ("mpa_market_conditions", "Choice"),
    ("mpa_audience_segment", "Choice"),
    
    # Trend Data
    ("mpa_trend_direction", "Choice"),
    ("mpa_trend_magnitude", "Decimal"),
    ("mpa_historical_values", "Text", 4000),
]
```

### Task 2.2: Implement Freshness Scoring Service

**Location:** `release/v5.5/agents/mpa/base/tests/braintrust/services/`

Create `benchmark-freshness.ts`:

```typescript
const KPI_HALF_LIFE_DAYS: Record<string, number> = {
  'CPM': 90,
  'CPC': 90,
  'CTR': 180,
  'CVR': 120,
  'CPA': 90,
  'ROAS': 90,
  'Viewability': 365,
  'VTR': 180,
};

function calculateFreshnessScore(
  dataEndDate: Date,
  kpiCode: string,
  currentDate?: Date
): number

function getBenchmarkWithFreshness(
  benchmark: Benchmark,
  currentDate?: Date
): BenchmarkWithFreshness
```

---

## GIT WORKFLOW

1. Work on `feature/v6.0-retrieval-enhancement` branch
2. Make frequent, focused commits
3. Commit message format:
   ```
   MPA v6.0: [Component] - Brief description
   
   - Detailed change 1
   - Detailed change 2
   ```
4. Push regularly to remote

---

## DEPENDENCIES

You may need to install:
```bash
npm install --save-dev @types/natural
```

The existing `natural` package is already installed for TF-IDF.

---

## VALIDATION

After implementing each module, run:
```bash
cd release/v5.5/agents/mpa/base/tests/braintrust
npm run build
npm run test:rag  # If test script exists
```

---

## COORDINATION

- Claude Desktop will update KB documents with META headers
- Claude Desktop will prepare expanded benchmark seed data CSV
- You implement the code to consume these artifacts
- Check `release/v5.5/docs/MPA_v60_Improvement_Plan.md` for detailed specifications

---

## START HERE

1. Read `release/v5.5/docs/MPA_v60_Improvement_Plan.md` for full context
2. Examine existing RAG implementation in `release/v5.5/agents/mpa/base/tests/braintrust/rag/`
3. Start with Task 1.1 (KB Metadata Parser) as it's foundational
4. Commit and push after each task completion

**Priority order:** 1.1 → 1.2 → 1.3 → 1.4 → 2.1 → 2.2

---

*This prompt was generated by Claude Desktop on January 16, 2026*
