# MPA v6.0 IMPROVEMENT PLAN
## Enhanced Retrieval & Richer Benchmark Architecture

**Version:** 1.0  
**Date:** January 16, 2026  
**Author:** Kessel Digital  
**Status:** Strategic Roadmap

---

## EXECUTIVE SUMMARY

This plan defines the next major evolution of the Media Planning Agent, targeting two fundamental improvements:

1. **Hybrid Retrieval System** - Replace Copilot Studio's basic keyword matching with semantic-aware retrieval that understands media planning context
2. **Benchmark Data Architecture** - Restructure benchmark storage to support richer, more actionable recommendations with temporal awareness and confidence quantification

**Target Outcomes:**
- Retrieval precision: 70% → 92%+ (right content for query)
- Retrieval recall: 60% → 88%+ (finding all relevant content)
- Benchmark recommendation confidence: Medium → High with quantified ranges
- Data freshness: Static Q4 2024 → Dynamic with recency weighting

---

## PART 1: CURRENT STATE ANALYSIS

### 1.1 Current Retrieval Architecture

| Component | Current State | Limitation |
|-----------|--------------|------------|
| Copilot Studio KB Indexing | Keyword-based BM25 | No semantic understanding |
| Document Format | 22+ flat .txt files, 93K words | Poor chunk boundaries |
| Query Processing | Direct user query | No query rewriting or expansion |
| Ranking | TF-IDF-like relevance | No media planning domain awareness |
| Context Injection | Top-N results concatenated | No attribution or provenance |

### 1.2 Current Benchmark Data Structure

```
mpa_benchmark table: 708+ records
├── Composite Key: vertical_code + channel_code + kpi_code
├── Values: low, median, high, best_in_class
├── Metadata: source, period, confidence_level
└── Limitations:
    ├── No temporal weighting (Q4 2024 = Q1 2025 importance)
    ├── No confidence intervals (point estimates only)
    ├── No cross-benchmark correlations
    └── No benchmark provenance tracking
```

### 1.3 Current KB Document Architecture

```
Knowledge Base Files (22+)
├── Registry Files (4): KPI, Channel, Partner, Vertical
├── Framework Files (4): Provenance, Confidence, Gap Detection, Registry Pattern
├── Example Conversations (11): Step-by-step workflow exemplars
├── Architecture Files (3): System documentation
├── Expert Lenses (5): Deep expertise modules
└── Implication Guides (5): Decision consequence frameworks

PROBLEMS:
- No semantic boundaries between concepts within files
- Headers are human-readable but not retrieval-optimized
- Cross-references rely on agent reasoning, not explicit links
- File sizes vary dramatically (3K to 83K chars)
```

---

## PART 2: RETRIEVAL IMPROVEMENT STRATEGY

### 2.1 Hybrid Retrieval Architecture

Replace single-mode retrieval with a three-layer system:

```
┌─────────────────────────────────────────────────────────────┐
│                    QUERY UNDERSTANDING                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │   Intent    │  │   Entity    │  │   Query Expansion    │ │
│  │Classification│ │ Extraction  │  │  (synonyms, context) │ │
│  └─────────────┘  └─────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    HYBRID RETRIEVAL                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │   Keyword   │  │  Semantic   │  │     Structured       │ │
│  │   (BM25)    │  │ (Embeddings)│  │   (Dataverse SQL)    │ │
│  └─────────────┘  └─────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESULT FUSION                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │  Reciprocal │  │  Domain     │  │   Source             │ │
│  │ Rank Fusion │  │  Reranking  │  │   Attribution        │ │
│  └─────────────┘  └─────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Query Understanding Layer

#### Intent Classification

Map user queries to media planning workflow steps:

| Intent Category | Example Queries | Retrieval Focus |
|-----------------|-----------------|-----------------|
| BENCHMARK_LOOKUP | "What's a good CTR for retail?" | Dataverse benchmark table + KPI Registry |
| CHANNEL_SELECTION | "Should I use CTV or programmatic?" | Channel Registry + Expert Lens |
| BUDGET_PLANNING | "How to allocate $2M budget?" | Budget Allocation frameworks + Implications |
| AUDIENCE_TARGETING | "How do I reach Gen Z?" | Audience Strategy + Geography Planning |
| MEASUREMENT_GUIDANCE | "What KPIs for awareness?" | KPI Registry + Measurement Attribution |
| WORKFLOW_HELP | "What's step 5?" | Example Conversations + Architecture |

#### Entity Extraction

Extract domain entities for precise retrieval:

```typescript
interface ExtractedEntities {
  verticals: string[];       // ["retail", "ecommerce"]
  channels: string[];        // ["CTV", "programmatic display"]
  kpis: string[];           // ["CPM", "CTR", "ROAS"]
  budgetRange: { min: number; max: number } | null;
  objectives: string[];      // ["awareness", "conversion"]
  timeframe: string | null;  // "Q1 2026"
  regions: string[];         // ["US", "Northeast"]
  dmas: string[];           // ["New York", "Los Angeles"]
}
```

#### Query Expansion

Expand queries with domain synonyms:

```typescript
const MEDIA_PLANNING_SYNONYMS = {
  "CTV": ["Connected TV", "OTT", "streaming TV", "addressable TV"],
  "CPM": ["cost per mille", "cost per thousand", "thousand impressions"],
  "awareness": ["upper funnel", "brand awareness", "reach", "top of funnel"],
  "conversion": ["lower funnel", "performance", "acquisition", "bottom of funnel"],
  "programmatic": ["programmatic display", "display advertising", "banner ads"],
  "retail media": ["RMN", "retail media network", "shopper marketing", "Amazon DSP"]
};
```

### 2.3 Implementation Recommendation

**Option A: Copilot Studio + Azure AI Search (Recommended)**

- Native Microsoft stack integration
- Managed infrastructure with hybrid search
- Enterprise compliance (Mastercard compatible)
- Estimated Effort: 3-4 weeks

**Implementation Steps:**
1. Create Azure AI Search resource
2. Configure hybrid index with vector and keyword fields
3. Process KB documents into semantic chunks
4. Generate embeddings using Azure OpenAI
5. Connect Copilot Studio to Azure AI Search
6. Configure semantic ranker profile

---

## PART 3: KB DOCUMENT ARCHITECTURE REDESIGN

### 3.1 Semantic Chunking Strategy

**New approach: Concept-Aligned Chunks**

```
BEFORE: One 15,000 character file with 8 concepts
        → Chunked arbitrarily at 1,000 char boundaries
        → Concepts split across chunks

AFTER:  One file with 8 clearly bounded sections
        → Chunked at section boundaries
        → Each chunk = one coherent concept
        → Metadata tags for filtering
```

### 3.2 Document Header Standard

Add retrieval metadata to every document section:

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

### 3.3 Restructured KB Taxonomy

```
knowledge-base/
├── 01-reference/                    # Pure lookup content
│   ├── KPI_Definitions.txt
│   ├── Channel_Definitions.txt
│   ├── Vertical_Definitions.txt
│   └── Term_Glossary.txt
├── 02-benchmarks/                   # Numeric reference data
│   ├── Benchmark_Summary_GENERAL.txt
│   ├── Benchmark_Summary_RETAIL.txt
│   └── ... (one per major vertical)
├── 03-decision-frameworks/          # How to make decisions
│   ├── Channel_Selection_Framework.txt
│   ├── Budget_Allocation_Framework.txt
│   └── Measurement_Selection_Framework.txt
├── 04-expert-guidance/              # Deep expertise
│   ├── Expert_Budget_Allocation.txt
│   ├── Expert_Channel_Mix.txt
│   └── Expert_Audience_Strategy.txt
├── 05-implications/                 # Consequence analysis
│   ├── Implications_Budget_Decisions.txt
│   └── Implications_Channel_Shifts.txt
├── 06-examples/                     # Exemplar conversations
│   ├── Example_Express_Pathway.txt
│   └── Example_Guided_Pathway.txt
└── 07-system/                       # System documentation
    ├── Workflow_Steps.txt
    └── Data_Provenance.txt
```

### 3.4 Chunk Size Optimization

| Content Type | Optimal Chunk Size | Rationale |
|--------------|-------------------|-----------|
| Definitions | 200-400 chars | Quick lookup, one concept |
| Benchmarks | 400-800 chars | Table + context |
| Frameworks | 800-1500 chars | Complete decision tree |
| Expert Guidance | 1000-2000 chars | Nuanced reasoning |
| Examples | 1500-3000 chars | Full conversation turn |

---

## PART 4: BENCHMARK DATA ENRICHMENT

### 4.1 Enhanced Benchmark Schema

```typescript
interface EnhancedBenchmark {
  // Current fields (preserved)
  mpa_vertical_code: string;
  mpa_channel_code: string;
  mpa_kpi_code: string;
  mpa_metric_low: number;
  mpa_metric_median: number;
  mpa_metric_high: number;
  mpa_metric_best: number;
  
  // NEW: Temporal Metadata
  mpa_data_collection_date: Date;
  mpa_data_period_start: Date;
  mpa_data_period_end: Date;
  mpa_freshness_score: number;         // 0-1, decays over time
  mpa_next_refresh_date: Date;
  
  // NEW: Statistical Confidence
  mpa_sample_size: number;
  mpa_confidence_interval_low: number;
  mpa_confidence_interval_high: number;
  mpa_standard_deviation: number;
  mpa_methodology: string;
  
  // NEW: Contextual Factors
  mpa_seasonality_factor: string;      // "Q4_HOLIDAY" | "Q1_NORMAL"
  mpa_market_conditions: string;       // "HIGH_COMPETITION" | "NORMAL"
  mpa_audience_segment: string;        // "GENERAL" | "HIGH_INTENT"
  
  // NEW: Trend Data
  mpa_trend_direction: string;         // "INCREASING" | "STABLE" | "DECREASING"
  mpa_trend_magnitude: number;         // Monthly % change
  mpa_historical_values: string;       // JSON array
}
```

### 4.2 Freshness Scoring Algorithm

```typescript
function calculateFreshnessScore(benchmark: EnhancedBenchmark): number {
  const now = new Date();
  const dataAge = (now.getTime() - benchmark.mpa_data_period_end.getTime()) / (1000 * 60 * 60 * 24);
  
  const HALF_LIFE_DAYS: Record<string, number> = {
    'CPM': 90,          // Pricing changes frequently
    'CTR': 180,         // Relatively stable
    'CVR': 120,         // Moderate volatility
    'ROAS': 90,         // Market-dependent
    'Viewability': 365, // Platform-dependent, slow change
  };
  
  const halfLife = HALF_LIFE_DAYS[benchmark.mpa_kpi_code] || 180;
  return Math.max(0.1, Math.exp(-0.693 * dataAge / halfLife));
}
```

### 4.3 Vertical Expansion Strategy

**Target: 18 verticals with normalized coverage**

| Tier | Verticals | Coverage Target | Priority |
|------|-----------|-----------------|----------|
| Tier 1 | Retail, Ecommerce, CPG, Financial Services, Technology | 100% channel × KPI | P0 |
| Tier 2 | Healthcare, Automotive, Travel, Entertainment, Telecom | 80% channel × KPI | P1 |
| Tier 3 | B2B, Education, Real Estate, Energy, Government, Non-Profit, Gaming, Hospitality | 60% channel × KPI | P2 |

### 4.4 Benchmark Coverage Matrix

Total required per vertical: ~90 benchmark records
Total across 18 verticals: ~1,620 benchmark records

---

## PART 5: IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-3)

**Week 1: KB Document Restructuring**
- Define new document taxonomy
- Create document header standard template
- Refactor 5 highest-impact KB files
- Validate retrieval improvement

**Week 2: KB Migration**
- Migrate remaining KB files to new structure
- Add META tags to all sections
- Implement cross-reference linking

**Week 3: Benchmark Schema Enhancement**
- Create enhanced benchmark Dataverse table
- Migrate existing 708 records
- Implement freshness scoring
- Add 200 new benchmark records

### Phase 2: Retrieval Infrastructure (Weeks 4-6)

**Week 4: Azure AI Search Setup**
- Provision Azure AI Search resource
- Configure hybrid index
- Build chunking pipeline

**Week 5: Integration**
- Connect Copilot Studio to Azure AI Search
- Configure semantic ranker
- Test retrieval quality

**Week 6: Query Understanding**
- Implement intent classification
- Build entity extraction
- Add query expansion

### Phase 3: Advanced Features (Weeks 7-9)

**Week 7: Result Enhancement**
- Implement RRF result fusion
- Build domain reranker
- Add source attribution

**Week 8: Benchmark Enrichment**
- Add trend analysis
- Implement confidence intervals
- Build correlation mappings

**Week 9: Validation**
- Run Braintrust evaluation suite
- Performance optimization
- Documentation

### Phase 4: Production (Week 10)

- Deploy to Aragorn AI
- Validation testing
- Deploy to Mastercard (if applicable)

---

## PART 6: SUCCESS METRICS

### 6.1 Retrieval Quality Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|------------|
| Precision@5 | ~70% | 92% | Manual annotation of top-5 results |
| Recall@10 | ~60% | 88% | Coverage of relevant content |
| MRR | ~0.5 | 0.85 | Position of first relevant result |
| Query Understanding Accuracy | N/A | 90% | Intent classification accuracy |
| Latency (P95) | ~800ms | <500ms | End-to-end retrieval time |

### 6.2 Recommendation Quality Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|------------|
| Benchmark Citation Rate | ~40% | 85% | % citing data |
| Confidence Disclosure | ~20% | 95% | % with CI |
| Vertical Match Rate | ~60% | 95% | Correct vertical used |
| Freshness Awareness | 0% | 100% | Stale data flagged |

---

## PART 7: WORK DIVISION

### Claude Desktop (This Session)

**Responsibilities:**
1. Strategic planning and architecture decisions
2. KB document restructuring specifications
3. Benchmark schema design
4. CSV seed data preparation and expansion
5. Document review and quality assurance
6. Prompt engineering for Copilot instructions
7. Coordination and task assignment

### VS Code Claude

**Responsibilities:**
1. TypeScript/JavaScript code implementation
2. Braintrust evaluation framework updates
3. RAG system implementation
4. Dataverse schema migration scripts
5. Build/compile operations
6. Unit test implementation
7. Git operations for code files

---

## DOCUMENT HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-16 | Kessel Digital | Initial release |

---

*End of Document*
