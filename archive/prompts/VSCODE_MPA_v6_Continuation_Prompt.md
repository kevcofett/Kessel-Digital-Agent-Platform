# MPA v6.0 VS Code Continuation Prompt

## CONTEXT - WHAT HAS BEEN COMPLETED

### KB Restructuring (Claude.ai - COMPLETE)

**25 KB v6.0 Files Created** - All in `/release/v5.5/agents/mpa/base/kb-v6/`

```
CORE STANDARDS (1 file, 242 lines):
- KB_00_Agent_Core_Operating_Standards_v6_0.txt

EXPERT GUIDANCE (4 files, 1,795 lines):
- MPA_Expert_Lens_Channel_Mix_v6_0.txt (515)
- MPA_Expert_Lens_Budget_Allocation_v6_0.txt (437)
- MPA_Expert_Lens_Audience_Strategy_v6_0.txt (392)
- MPA_Expert_Lens_Measurement_Attribution_v6_0.txt (451)

PLAYBOOKS (1 file, 711 lines):
- Gap_Detection_Playbook_v6_0.txt

FRAMEWORKS (5 files, 1,421 lines):
- Analytics_Engine_v6_0.txt (434)
- BRAND_PERFORMANCE_FRAMEWORK_v6_0.txt (306)
- Confidence_Level_Framework_v6_0.txt (229)
- Data_Provenance_Framework_v6_0.txt (222)
- MEASUREMENT_FRAMEWORK_v6_0.txt (225)

GUIDES (3 files, 822 lines):
- AI_ADVERTISING_GUIDE_v6_0.txt (317)
- RETAIL_MEDIA_NETWORKS_v6_0.txt (281)
- FIRST_PARTY_DATA_STRATEGY_v6_0.txt (224)

IMPLICATIONS (5 files, 1,044 lines):
- MPA_Implications_Budget_Decisions_v6_0.txt (249)
- MPA_Implications_Channel_Shifts_v6_0.txt (195)
- MPA_Implications_Measurement_Choices_v6_0.txt (230)
- MPA_Implications_Audience_Targeting_v6_0.txt (190)
- MPA_Implications_Timing_Pacing_v6_0.txt (180)

AUDIENCE (2 files, 491 lines):
- KB_02_Audience_Targeting_Sophistication_v6_0.txt (219)
- MPA_Audience_Taxonomy_Structure_v6_0.txt (272)

SUPPORT (3 files, 884 lines):
- MPA_Supporting_Instructions_v6_0.txt (307)
- Output_Templates_v6_0.txt (330)
- MPA_Geography_DMA_Planning_v6_0.txt (247)

INDEX (1 file, 203 lines):
- KB_INDEX_v6_0.txt
```

**Total: 7,608 lines (~65% compression from v5.5)**

### META Tag System Implemented

Every KB v6.0 file includes:

**Document-Level:**
```
META_DOCUMENT_TYPE: expert_guidance | operational_playbook | calculation_framework | etc.
META_PRIMARY_TOPICS: comma-separated keywords
META_WORKFLOW_STEPS: 1,2,3... (which steps use this doc)
META_INTENTS: CHANNEL_SELECTION | BUDGET_PLANNING | AUDIENCE_TARGETING | etc.
META_VERTICALS: ALL or specific
META_LAST_UPDATED: 2026-01-16
```

**Section-Level:**
```
META_SECTION_ID: unique_section_identifier
META_TOPICS: section-specific keywords
META_INTENT: primary intent for this section
META_CONFIDENCE: HIGH | MEDIUM | LOW
META_CHUNK_PRIORITY: 0 (index) | 1 (critical) | 2 (important) | 3 (supplementary)
META_WEB_SEARCH_TRIGGER: TRUE (for census/taxonomy sections)
```

### Benchmark Expansion (Claude.ai - COMPLETE)

**331 records across 14 verticals** in `/release/v5.5/agents/mpa/base/seed-data-v6/mpa_benchmark_seed_v6_enhanced.csv`

Tier 1 (100% coverage): RETAIL, ECOMMERCE, CPG, FINANCE, TECHNOLOGY
Tier 2 (100% coverage): HEALTHCARE, AUTOMOTIVE, TRAVEL, ENTERTAINMENT, TELECOM
Tier 3 (partial): GAMING, HOSPITALITY, EDUCATION, B2B_PROFESSIONAL

### Copilot Instructions (Claude.ai - COMPLETE)

**MPA_Copilot_Instructions_v6_0.txt** deployed to:
- `/personal/instructions/`
- `/mastercard/instructions/`
- `/base/copilot/`

Updated with KB v6.0 architecture references and META tag routing guidance.

---

## YOUR TASK - RETRIEVAL INFRASTRUCTURE INTEGRATION

### Current State of Your Work

You have built the following in `/release/v5.5/agents/mpa/base/tests/braintrust/rag/`:

```
CORE FILES:
- kb-metadata-parser.ts - Parse META tags from KB files
- query-understanding.ts - Classify query intent
- result-fusion.ts - Combine and rank results
- freshness-service.ts - Track data freshness
- dataverse-schema.ts - Dataverse table schemas
- retrieval-engine.ts - Main retrieval orchestration
- vector-store.ts - Vector storage abstraction
- embedding-service.ts - Embedding abstraction
- document-processor.ts - Document chunking
- tool-executor.ts - Tool execution
- types.ts - Type definitions
- index.ts - Exports

PROVIDERS:
- providers/interfaces.ts
- providers/factory.ts
- providers/tfidf-embedding.ts
- providers/azure-ai-search-embedding.ts
- providers/azure-openai-llm.ts
- providers/claude-llm.ts
- providers/copilot-studio-llm.ts
- providers/dataverse-storage.ts
- providers/local-fs-storage.ts
- providers/detect-environment.ts
```

### What Needs Completion

1. **Update kb-metadata-parser.ts** to read from `/base/kb-v6/` folder
   - Parse all 25 KB v6.0 files
   - Extract document-level and section-level META tags
   - Build routing index from META_INTENTS and META_WORKFLOW_STEPS

2. **Update query-understanding.ts** to use KB_INDEX_v6_0.txt
   - Map query intents to document paths
   - Use intent-to-document mapping from KB_INDEX
   - Support workflow step routing

3. **Update result-fusion.ts** to respect META_CHUNK_PRIORITY
   - Priority 0 (index) → highest boost
   - Priority 1 (critical) → high boost
   - Priority 2 (important) → normal
   - Priority 3 (supplementary) → lower

4. **Add web search trigger detection**
   - When META_WEB_SEARCH_TRIGGER: TRUE in retrieved section
   - Flag for census data or taxonomy code lookup
   - Pass trigger to response generator

5. **Integration test with mpa-eval.ts**
   - Wire retrieval engine into evaluation framework
   - Test with existing conversation scenarios
   - Measure retrieval accuracy

### Key File Paths

```
KB v6.0 Files: /release/v5.5/agents/mpa/base/kb-v6/*.txt
Benchmark Seed: /release/v5.5/agents/mpa/base/seed-data-v6/mpa_benchmark_seed_v6_enhanced.csv
Instructions: /release/v5.5/agents/mpa/personal/instructions/MPA_Copilot_Instructions_v6_0.txt
RAG Code: /release/v5.5/agents/mpa/base/tests/braintrust/rag/
```

### Intent Categories (from KB_INDEX_v6_0.txt)

```
CHANNEL_SELECTION → MPA_Expert_Lens_Channel_Mix_v6_0.txt, AI_ADVERTISING_GUIDE_v6_0.txt
BUDGET_PLANNING → MPA_Expert_Lens_Budget_Allocation_v6_0.txt, Analytics_Engine_v6_0.txt
AUDIENCE_TARGETING → MPA_Expert_Lens_Audience_Strategy_v6_0.txt, MPA_Audience_Taxonomy_Structure_v6_0.txt
MEASUREMENT_GUIDANCE → MPA_Expert_Lens_Measurement_Attribution_v6_0.txt, MEASUREMENT_FRAMEWORK_v6_0.txt
BENCHMARK_LOOKUP → mpa_benchmark (Dataverse), Analytics_Engine_v6_0.txt
GAP_RESOLUTION → Gap_Detection_Playbook_v6_0.txt
WORKFLOW_HELP → MPA_Supporting_Instructions_v6_0.txt, KB_00_Agent_Core_Operating_Standards_v6_0.txt
CONFIDENCE_ASSESSMENT → Confidence_Level_Framework_v6_0.txt, Data_Provenance_Framework_v6_0.txt
```

### Success Criteria

1. All 25 KB v6.0 files parsed and indexed
2. Query intent classification working with >90% accuracy
3. Result fusion respecting chunk priority
4. Web search triggers detected and flagged
5. Integration tests passing

---

## GIT BRANCH INFO

Current branch: `feature/v6.0-retrieval-enhancement`
Base commit: `55c07031`
Latest commit: `616fd54a`

All KB files, benchmarks, and instructions are committed and pushed.

---

## EXECUTION

Start by reading the current state of your RAG files, then update them to integrate with the new KB v6.0 structure. Focus on:

1. Read kb-metadata-parser.ts and update to parse kb-v6 folder
2. Read query-understanding.ts and update intent mapping
3. Read result-fusion.ts and add chunk priority boosting
4. Add web search trigger detection
5. Run integration tests

Commit after each major milestone with descriptive messages.
