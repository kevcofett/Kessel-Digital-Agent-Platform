# MPA KB v6.6 Complete Optimization - Execution Instructions

## OVERVIEW

This document provides complete instructions for optimizing the MPA Knowledge Base to fully support v6.6 instruction behaviors, self-referential learning, ADIS integration, and benchmark data accuracy.

**Estimated Duration:** 12-15 hours across multiple sessions
**Repository:** Kessel-Digital-Agent-Platform
**Branch:** feature/v6.0-retrieval-enhancement (merge to main, deploy/mastercard, deploy/personal when complete)
**KB Location:** release/v5.5/agents/mpa/base/kb/

---

## PHASE 1: CLEANUP AND QUICK WINS (1-2 hours)

### Task 1.1: Archive Obsolete Documents

Move to archive/kb/:
```
Analytics_Engine_v5_2.txt (superseded by v5_5)
```

Verify no other documents reference v5_2 before archiving.

### Task 1.2: Audit Documents for Merge/Archive

Review these documents for unique content not covered by v6.6 versions:

1. **MPA_Calculation_Display_v5_5.txt** (9KB)
   - Compare against KB_00_Agent_Core_Operating_Standards_v6_6 MANDATORY RESPONSE ELEMENTS section
   - If all content covered, archive
   - If unique content exists, extract and merge into appropriate v6.6 doc

2. **MPA_v55_Instructions_Uplift.txt** (8KB)
   - Compare against v6.6 core standards and conversation examples
   - If superseded, archive
   - If unique, merge into appropriate doc

3. **MPA_Supporting_Instructions_v5_5.txt** (14KB)
   - Compare against KB_00_Agent_Core_Operating_Standards_v6_6
   - If superseded, archive
   - If unique, merge

### Task 1.3: Add RELATED Tags to All Documents

Add RELATED tag to document headers for these 31 documents:

**ADIS Documents:**
- ADIS_Copilot_Instructions_Addendum_v1.txt → RELATED: ADIS_Quick_Reference_v2, ADIS_Model_Catalog_v1, ADIS_Copilot_Integration_v2
- ADIS_Knowledge_Base_v1.txt → RELATED: ADIS_Quick_Reference_v2, ADIS_Model_Catalog_v1, ADIS_User_Guide_v1
- ADIS_Model_Catalog_v1.txt → RELATED: ADIS_Quick_Reference_v2, ADIS_Copilot_Integration_v2, Analytics_Engine_v6_6
- ADIS_Schema_Reference_v1.txt → RELATED: ADIS_Model_Catalog_v1, ADIS_Knowledge_Base_v1
- ADIS_User_Guide_v1.txt → RELATED: ADIS_Quick_Reference_v2, ADIS_Copilot_Integration_v2

**Framework Documents:**
- Analytics_Engine_v5_5.txt → RELATED: KB_Benchmark_Reference_v6_6, Confidence_Level_Framework_v5_5, Gap_Detection_Playbook_v5_5
- Confidence_Level_Framework_v5_5.txt → RELATED: Analytics_Engine_v5_5, Data_Provenance_Framework_v6_6, Gap_Detection_Playbook_v5_5
- Gap_Detection_Playbook_v5_5.txt → RELATED: Analytics_Engine_v5_5, KB_00_Agent_Core_Operating_Standards_v6_6, Output_Templates_v5_5
- Output_Templates_v5_5.txt → RELATED: Gap_Detection_Playbook_v5_5, MPA_Conversation_Examples_v6_6, KB_00_Agent_Core_Operating_Standards_v6_6
- MEASUREMENT_FRAMEWORK_v5_5.txt → RELATED: MPA_Expert_Lens_Measurement_Attribution_v6_6, Analytics_Engine_v5_5, Confidence_Level_Framework_v5_5
- BRAND_PERFORMANCE_FRAMEWORK_v5_5.txt → RELATED: MEASUREMENT_FRAMEWORK_v5_5, MPA_Expert_Lens_Channel_Mix_v6_6

**Audience Documents:**
- KB_02_Audience_Targeting_Sophistication_v5_8.txt → RELATED: MPA_Expert_Lens_Audience_Strategy_v6_6, MPA_Audience_Dimension_Checklist_v5_8, ADIS_Quick_Reference_v2
- MPA_Audience_Dimension_Checklist_v5_8.txt → RELATED: MPA_Expert_Lens_Audience_Strategy_v6_6, KB_02_Audience_Targeting_Sophistication_v5_8, MPA_Geography_DMA_Planning_v5_8
- MPA_Audience_Taxonomy_Structure_v5_8.txt → RELATED: MPA_Expert_Lens_Audience_Strategy_v6_6, MPA_Audience_Dimension_Checklist_v5_8
- MPA_Geography_DMA_Planning_v5_8.txt → RELATED: MPA_Audience_Dimension_Checklist_v5_8, MPA_Expert_Lens_Audience_Strategy_v6_6

**Implications Documents:**
- MPA_Implications_Audience_Targeting_v5_5.txt → RELATED: MPA_Expert_Lens_Audience_Strategy_v6_6, ADIS_Quick_Reference_v2
- MPA_Implications_Budget_Decisions_v5_5.txt → RELATED: MPA_Expert_Lens_Budget_Allocation_v6_6, Analytics_Engine_v5_5
- MPA_Implications_Channel_Shifts_v5_5.txt → RELATED: MPA_Expert_Lens_Channel_Mix_v6_6, ADIS_Quick_Reference_v2
- MPA_Implications_Measurement_Choices_v5_5.txt → RELATED: MPA_Expert_Lens_Measurement_Attribution_v6_6, MEASUREMENT_FRAMEWORK_v5_5
- MPA_Implications_Timing_Pacing_v5_5.txt → RELATED: MPA_Expert_Lens_Budget_Allocation_v6_6, Analytics_Engine_v5_5

**Other Documents:**
- MPA_Adaptive_Language_v5_5.txt → RELATED: KB_00_Agent_Core_Operating_Standards_v6_6, MPA_Conversation_Examples_v6_6
- MPA_Step_Boundary_Guidance_v5_5.txt → RELATED: KB_00_Agent_Core_Operating_Standards_v6_6, MPA_Conversation_Examples_v6_6
- Strategic_Wisdom_v5_5.txt → RELATED: KB_00_Agent_Core_Operating_Standards_v6_6, MPA_Expert_Lens_Budget_Allocation_v6_6
- AI_ADVERTISING_GUIDE_v5_5.txt → RELATED: MPA_Expert_Lens_Channel_Mix_v6_6, ADIS_Quick_Reference_v2
- FIRST_PARTY_DATA_STRATEGY_v5_5.txt → RELATED: ADIS_Quick_Reference_v2, Data_Provenance_Framework_v6_6
- RETAIL_MEDIA_NETWORKS_v5_5.txt → RELATED: MPA_Expert_Lens_Channel_Mix_v6_6, MPA_Expert_Lens_Budget_Allocation_v6_6
- KB_INDEX_v6_6.txt → RELATED: KB_00_Agent_Core_Operating_Standards_v6_6 (add if missing)

**Format for RELATED tag (add after existing header tags):**
```
RELATED: Document1, Document2, Document3
```

---

## PHASE 2: BENCHMARK RESEARCH AND STANDARDIZATION (3-4 hours)

### Task 2.1: Research Current Industry Benchmarks

Use web search to find authoritative 2024-2025 benchmark data for:

**Customer Acquisition Cost (CAC) by Vertical:**
- Ecommerce DTC (general, apparel, beauty, home goods, fitness)
- Subscription Services (software, media, food/meal kit, boxes)
- B2B Software (SMB, mid-market, enterprise)
- Fintech (consumer, B2B, payments, lending, remittance)
- Healthcare (consumer health, B2B health tech)
- Retail (general, grocery, specialty)
- CPG (food & beverage, personal care, household)
- Travel & Hospitality
- Education (consumer, B2B)
- Real Estate
- Automotive
- Financial Services (banking, insurance, wealth management)

**Search queries to use:**
- "[vertical] customer acquisition cost benchmark 2024"
- "[vertical] CAC by channel 2024"
- "[vertical] digital marketing benchmarks"
- "cost per acquisition [vertical] industry average"

**Sources to prioritize:**
- ProfitWell / Paddle (subscription metrics)
- First Page Sage (CAC benchmarks)
- HubSpot State of Marketing
- Salesforce State of Marketing
- WordStream (PPC benchmarks)
- Statista
- eMarketer / Insider Intelligence
- Industry-specific reports (NRF for retail, etc.)

**CPM/CPC Benchmarks by Channel:**
- Meta (Facebook/Instagram) by objective
- Google Search by vertical
- Google Display Network
- YouTube (CPV, CPM)
- LinkedIn by objective
- TikTok
- Pinterest
- Programmatic Display
- CTV/OTT
- Podcast/Audio
- Out-of-Home (digital)

**Conversion Rate Benchmarks:**
- Landing page by vertical
- Email open/click/conversion
- Paid search by vertical
- Paid social by platform
- Display retargeting vs prospecting

**LTV:CAC Ratio Benchmarks:**
- By vertical
- By business model (subscription vs transactional)
- Healthy vs excellent ranges

### Task 2.2: Create KB_Benchmark_Reference_v6_6.txt

Create authoritative benchmark document with this structure:

```
DOCUMENT: KB_Benchmark_Reference_v6_6.txt
CATEGORY: Reference
TOPICS: benchmarks, CAC, CPM, CPC, conversion rates, LTV, vertical benchmarks, channel benchmarks
VERSION: 6.6
DATE: January 2026
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
RELATED: Analytics_Engine_v6_6, KB_00_Agent_Core_Operating_Standards_v6_6, Data_Provenance_Framework_v6_6

KB BENCHMARK REFERENCE v6.6

PURPOSE

This document is the SINGLE SOURCE OF TRUTH for all benchmark data cited by the Media Planning Agent. All other documents MUST reference this document for benchmark values. When citing benchmarks, use the exact phrase: "Based on KB data for [vertical]..."

BENCHMARK UPDATE POLICY

Benchmarks are validated quarterly against industry sources. Last validation: [DATE]
Sources: [List primary sources used]

SECTION 1: CUSTOMER ACQUISITION COST BY VERTICAL

[Include researched data in table format]

SECTION 2: CHANNEL COST BENCHMARKS

[Include CPM, CPC, CPV by channel]

SECTION 3: CONVERSION RATE BENCHMARKS

[Include by channel and vertical]

SECTION 4: LTV:CAC RATIO BENCHMARKS

[Include by vertical and business model]

SECTION 5: ADIS SEGMENT BENCHMARKS

[Include segment-specific benchmarks like Champion retention rates, reactivation rates, etc.]

SECTION 6: CITATION PATTERNS

When citing benchmarks, always use:
- "Based on KB data for [vertical], typical [metric] runs [low] to [high]."
- Include vertical name
- Provide range, not single point
- Add context if target is conservative/realistic/aggressive

VERSION HISTORY
[Track all updates with sources]
```

### Task 2.3: Standardize Benchmark Values Across All Documents

After creating KB_Benchmark_Reference_v6_6.txt:

1. Search all KB documents for benchmark values
2. Compare against authoritative reference
3. Update any conflicting values to match reference
4. Add cross-reference to KB_Benchmark_Reference_v6_6 where benchmarks are cited

---

## PHASE 3: CREATE NEW SUPPORTING DOCUMENTS (2-3 hours)

### Task 3.1: Create Self_Referential_Learning_Guide_v6_6.txt

Document how agent should chain KB documents together:

```
DOCUMENT: Self_Referential_Learning_Guide_v6_6.txt
CATEGORY: Operations
TOPICS: self-referential learning, RAG retrieval, document chaining, knowledge graph, cross-reference
VERSION: 6.6
DATE: January 2026
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
RELATED: KB_INDEX_v6_6, KB_00_Agent_Core_Operating_Standards_v6_6

SELF-REFERENTIAL LEARNING GUIDE

PURPOSE

This document defines how the MPA agent should leverage the interconnected knowledge base through document chaining, cross-referencing, and self-referential learning patterns.

SECTION 1: DOCUMENT CHAINING PATTERNS

When to retrieve multiple documents...
How to follow RELATED tags...
Priority order for retrieval...

SECTION 2: CROSS-REFERENCE USAGE

How to cite KB documents in responses...
When to explicitly mention document names...
How to guide users to additional resources...

SECTION 3: RAG RETRIEVAL OPTIMIZATION

Query patterns that retrieve best results...
Keyword combinations for specific topics...
How document META tags guide retrieval...

SECTION 4: KNOWLEDGE GRAPH MENTAL MODEL

How documents relate to each other...
Expert Lens → Implications → Framework connections...
ADIS integration points across documents...

SECTION 5: CONTINUOUS LEARNING PATTERNS

How to reference prior calculations...
How to build on established facts...
How to maintain context across steps...
```

### Task 3.2: Create v6_6_Quick_Reference_Card.txt

Compact reference for all v6.6 requirements:

```
DOCUMENT: v6_6_Quick_Reference_Card.txt
CATEGORY: Reference
TOPICS: v6.6 requirements, quick reference, checklist, mandatory elements
VERSION: 6.6
DATE: January 2026
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
RELATED: KB_00_Agent_Core_Operating_Standards_v6_6, MPA_Conversation_Examples_v6_6

v6.6 QUICK REFERENCE CARD

FOUR MANDATORY RESPONSE ELEMENTS (Every substantive response)

1. CONTEXT CALLBACK
   "With your [X]..." | "Given your [Y]..." | "Building on..."
   
2. CALCULATION
   Show math: "[A] divided by [B] equals [C]"
   
3. KB BENCHMARK CITATION
   "Based on KB data for [vertical], typical [metric] runs [low] to [high]."
   
4. VERTICAL REFERENCE
   Name the industry in benchmark statements

RESPONSE SELF-CHECK
□ References prior context?
□ Shows calculation?
□ Cites KB for benchmarks?
□ Names the vertical?

TARGET LABELS
- CONSERVATIVE: 20%+ below typical range
- REALISTIC: Within typical range
- AGGRESSIVE: 10-30% above typical
- VERY AGGRESSIVE: 30%+ above typical

ADIS TRIGGER PHRASES
Offer ADIS when user mentions:
- Customer data, transaction data, CRM
- Segmentation, segments, RFM, CLV
- Best customers, high-value customers
- Retention, churn, at-risk

ADIS STANDARD PROMPT
"I can analyze your customer data to identify segments and optimize targeting. Upload your file to get started."

8 ADIS MODELS
1. RFM Segmentation - Behavioral segments
2. Decile Analysis - Value tiers
3. Cohort Analysis - Retention tracking
4. Deterministic CLV - Rule-based LTV
5. Probabilistic CLV - Statistical LTV
6. K-Means Clustering - Natural groups
7. Propensity Model - Behavior prediction
8. Uplift Model - Incremental response

DATA SOURCE PHRASES
- User data: "Your [X] of [value]..."
- KB benchmarks: "Based on KB data for [vertical]..."
- Web research: "Based on [source name]..."
- Agent estimate: "My estimate is [X]. Recommend validating."
- ADIS analysis: "Based on your ADIS analysis..."

PROACTIVE INTELLIGENCE SEQUENCE
1. Context callback
2. Calculate immediately
3. Compare to KB benchmark
4. Label target
5. Ask ONE question only if needed
```

### Task 3.3: Create ADIS_Campaign_Integration_Guide_v6_6.txt

End-to-end ADIS workflow for campaigns:

```
DOCUMENT: ADIS_Campaign_Integration_Guide_v6_6.txt
CATEGORY: ADIS
TOPICS: campaign integration, end-to-end workflow, segment activation, measurement loop
VERSION: 6.6
DATE: January 2026
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
RELATED: ADIS_Quick_Reference_v2, ADIS_Copilot_Integration_v2, MPA_Expert_Lens_Channel_Mix_v6_6

ADIS CAMPAIGN INTEGRATION GUIDE

PURPOSE

This document provides the complete end-to-end workflow for integrating ADIS customer analysis into media campaign planning, execution, and measurement.

SECTION 1: PRE-CAMPAIGN DATA PREPARATION
- Data requirements
- File formatting
- Column mapping
- Data quality checks

SECTION 2: MODEL SELECTION BY CAMPAIGN OBJECTIVE
- Acquisition campaigns: RFM + Propensity
- Retention campaigns: RFM + CLV
- Reactivation campaigns: RFM + Uplift
- Discovery campaigns: Clustering

SECTION 3: SEGMENT-TO-PLATFORM MAPPING
- How to translate ADIS segments to platform targeting
- Meta Custom Audiences from segments
- Google Customer Match
- LinkedIn Matched Audiences
- Programmatic segment activation

SECTION 4: BUDGET ALLOCATION BY SEGMENT
- AMMO optimization workflow
- Segment-level budget splits
- Expected outcomes by segment

SECTION 5: CHANNEL SELECTION BY SEGMENT
- Champions: retention channels
- At Risk: reactivation channels
- New Acquisition: prospecting channels
- High Propensity: conversion channels

SECTION 6: MEASUREMENT AND FEEDBACK LOOP
- Segment-level KPI tracking
- Validation against ADIS predictions
- Segment migration tracking
- Model refinement triggers

SECTION 7: OPTIMIZATION TRIGGERS
- When to re-run ADIS analysis
- When to adjust segment allocations
- When to update propensity models
```

---

## PHASE 4: UPDATE HIGH-PRIORITY DOCUMENTS (4-6 hours)

### Task 4.1: Update Gap_Detection_Playbook → v6_6

Key additions needed:
- ADIS segment gap detection (Champions declining, At Risk growing)
- v6.6 response format for gap communication
- Segment-level gap analysis
- ADIS-driven gap resolution options
- Add RELATED tag
- Update document header to v6.6

### Task 4.2: Update Output_Templates → v6_6

Key additions needed:
- All templates must show v6.6 four-element format
- Add ADIS segment output templates
- Add segment-level budget allocation template
- Add segment measurement template
- Add RELATED tag
- Update document header to v6.6

### Task 4.3: Update Analytics_Engine → v6_6

Key additions needed:
- ADIS metrics integration (segment sizes, migration rates, CLV calculations)
- v6.6 citation patterns in all examples
- Reference KB_Benchmark_Reference_v6_6 for all benchmarks
- Add ADIS model formulas
- Add RELATED tag
- Update document header to v6.6

### Task 4.4: Update Confidence_Level_Framework → v6_6

Key additions needed:
- ADIS confidence scoring by model
- Segment-level confidence adjustments
- v6.6 confidence communication patterns
- Add RELATED tag
- Update document header to v6.6

---

## PHASE 5: UPDATE MEDIUM-PRIORITY DOCUMENTS (4-6 hours)

### Task 5.1: Update All 5 Implications Documents → v6_6

For each MPA_Implications_*.txt:
- Add ADIS segment implications
- Add v6.6 response patterns
- Reference KB_Benchmark_Reference_v6_6
- Add RELATED tag
- Update document header to v6.6

### Task 5.2: Update MEASUREMENT_FRAMEWORK → v6_6

Key additions:
- ADIS segment measurement integration
- Segment-level KPI definitions
- Validation approach for ADIS predictions
- Add RELATED tag

### Task 5.3: Update BRAND_PERFORMANCE_FRAMEWORK → v6_6

Key additions:
- Brand campaign v6.6 patterns
- ADIS for brand campaigns (awareness audiences)
- Segment-level brand lift tracking
- Add RELATED tag

### Task 5.4: Update Industry Reference Documents

For AI_ADVERTISING_GUIDE, FIRST_PARTY_DATA_STRATEGY, RETAIL_MEDIA_NETWORKS:
- Add ADIS integration points
- Add v6.6 response patterns where applicable
- Add RELATED tags

### Task 5.5: Update Strategic_Wisdom → v6_6

Key additions:
- Proactive intelligence patterns
- Calculate-first philosophy
- ADIS strategic applications
- Add RELATED tag

---

## PHASE 6: FINAL VALIDATION AND CLEANUP (2-3 hours)

### Task 6.1: Cross-Reference Validation

Run validation script to verify:
- All documents have RELATED tags
- All RELATED references point to existing documents
- No circular references without purpose
- All benchmarks reference KB_Benchmark_Reference_v6_6

### Task 6.2: Terminology Audit

Verify consistent terminology across all documents:
- Segment names: Champions, Loyal Customers, At Risk, New Customers, Lost
- Target labels: CONSERVATIVE, REALISTIC, AGGRESSIVE, VERY AGGRESSIVE
- Citation phrase: "Based on KB data for [vertical]..."
- ADIS prompt: Standard prompt matches across all docs

### Task 6.3: Remove Planning Artifacts

Delete from base/kb/:
- KB_V66_AUDIT_REPORT.md (planning document)
- Any other .md files that are planning artifacts

### Task 6.4: Final Document Count Validation

Verify final state:
- All documents have v6.6 or v2 version numbers
- No obsolete versions in base/kb/
- Archive contains all superseded versions
- KB_INDEX_v6_6 accurately reflects all active documents

### Task 6.5: Git Operations

```bash
git add release/v5.5/agents/mpa/
git commit -m "feat(KB): Complete v6.6 optimization with benchmark standardization

PHASE 1: Cleanup
- Archived obsolete Analytics_Engine_v5_2
- Added RELATED tags to all 40 documents
- Audited and merged/archived redundant docs

PHASE 2: Benchmark Research
- Created KB_Benchmark_Reference_v6_6 with authoritative benchmarks
- Standardized all benchmark values across KB
- Added source citations for all benchmarks

PHASE 3: New Documents
- Self_Referential_Learning_Guide_v6_6
- v6_6_Quick_Reference_Card
- ADIS_Campaign_Integration_Guide_v6_6

PHASE 4: High-Priority Updates
- Gap_Detection_Playbook_v6_6 with ADIS gap detection
- Output_Templates_v6_6 with v6.6 format
- Analytics_Engine_v6_6 with ADIS metrics
- Confidence_Level_Framework_v6_6 with ADIS scoring

PHASE 5: Medium-Priority Updates
- All 5 Implications documents updated to v6.6
- MEASUREMENT_FRAMEWORK_v6_6
- Industry reference documents updated

PHASE 6: Validation
- All cross-references verified
- Terminology standardized
- Final document inventory validated"

git push origin feature/v6.0-retrieval-enhancement
git checkout main && git merge feature/v6.0-retrieval-enhancement
git push origin main
git checkout deploy/mastercard && git merge main
git push origin deploy/mastercard
git checkout deploy/personal && git merge main
git push origin deploy/personal
```

---

## SUCCESS CRITERIA

After completing all phases, verify:

- [ ] All 40+ documents have RELATED tags
- [ ] KB_Benchmark_Reference_v6_6 exists with researched benchmarks
- [ ] All benchmark values are consistent across documents
- [ ] All high-priority documents have v6.6 versions
- [ ] Self_Referential_Learning_Guide_v6_6 exists
- [ ] v6_6_Quick_Reference_Card exists
- [ ] ADIS_Campaign_Integration_Guide_v6_6 exists
- [ ] No obsolete documents in active KB
- [ ] All branches synced
- [ ] KB_INDEX_v6_6 reflects current state

---

## CONTINUATION PROMPT FOR NEW SESSION

Copy this to start execution in new conversation:

```
I need to execute the MPA KB v6.6 Complete Optimization as documented in:
/mnt/project/MPA_KB_V66_COMPLETE_OPTIMIZATION_INSTRUCTIONS.md

This is a multi-phase project covering:
- Phase 1: Cleanup and quick wins
- Phase 2: Benchmark research and standardization
- Phase 3: Create new supporting documents
- Phase 4: Update high-priority documents
- Phase 5: Update medium-priority documents
- Phase 6: Final validation and cleanup

Please read the instruction file and begin with Phase 1. Use Desktop Commander for all file operations. Provide status updates after each major task. Research benchmarks using web search for authoritative 2024-2025 data.

Repository: Kessel-Digital-Agent-Platform
KB Location: release/v5.5/agents/mpa/base/kb/
Branch: feature/v6.0-retrieval-enhancement
```

---

## NOTES FOR EXECUTION

1. **Benchmark Research**: Take time to find quality sources. Prefer recent (2024-2025) data from reputable sources. Document all sources in KB_Benchmark_Reference_v6_6.

2. **Large Document Updates**: For documents over 50KB (Gap_Detection, Output_Templates, Analytics_Engine, Confidence_Level), consider creating v6_6 addendum documents rather than rewriting entirely, then reference both from KB_INDEX.

3. **Incremental Commits**: Commit after each phase to preserve progress.

4. **Testing**: After completion, test RAG retrieval with sample queries to verify cross-references work.

5. **Character Limits**: Ensure no document exceeds 36,000 characters (Copilot KB limit). Split if necessary.
