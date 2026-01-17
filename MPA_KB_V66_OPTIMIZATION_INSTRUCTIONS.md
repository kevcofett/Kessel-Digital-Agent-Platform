# MPA KB v6.6 Complete Optimization - Execution Instructions

## Document Purpose
This instruction set guides the complete KB v6.6 optimization including benchmark research, self-referential learning enhancement, and full document alignment. Estimated total effort: 12-15 hours across multiple sessions.

## Repository Context
- **Repository:** Kessel-Digital-Agent-Platform
- **Branch:** All work on `main`, merge to `deploy/mastercard` and `deploy/personal`
- **KB Location:** `release/v5.5/agents/mpa/base/kb/`
- **Archive Location:** `release/v5.5/agents/mpa/archive/kb/`
- **Instructions Location:** `release/v5.5/agents/mpa/base/instructions/`
- **Active Instruction File:** `MPA_Copilot_Instructions_v6_6.txt` (7,769 chars)

## Current State Summary
- 40 active KB documents in base/kb/
- 10 documents already updated to v6.6 format
- 31 documents missing RELATED tags (breaks self-referential learning)
- 25 documents need v6.6 alignment
- Benchmark inconsistencies across documents
- 1 obsolete document to archive
- 4 new documents recommended

## v6.6 Core Requirements (Reference)
Every substantive response must include:
1. **CONTEXT CALLBACK** - "With your 250K budget..."
2. **CALCULATION** - "250K divided by 5000 equals 50 per customer"
3. **KB BENCHMARK CITATION** - "Based on KB data for [vertical], typical [metric] runs [range]"
4. **VERTICAL REFERENCE** - Name the industry in benchmark statements
5. **TARGET LABELING** - REALISTIC, CONSERVATIVE, AGGRESSIVE, VERY AGGRESSIVE

## ADIS 8 Models (Reference)
1. RFM Segmentation - Behavioral segments
2. Decile Analysis - Value stratification  
3. Cohort Analysis - Retention tracking
4. Deterministic CLV - Rule-based LTV
5. Probabilistic CLV (BG-NBD) - Statistical LTV
6. K-Means Clustering - Natural groupings
7. Propensity Model - Behavior prediction
8. Uplift Model - Incremental response

---

# PHASE 1: BENCHMARK RESEARCH AND STANDARDIZATION (3-4 hours)

## Objective
Create single authoritative benchmark source with researched, validated data.

## Step 1.1: Research Benchmark Data

### CAC Benchmarks by Vertical
Research and validate CAC ranges for each vertical. Use web search for each:
- "ecommerce customer acquisition cost benchmark 2024 2025"
- "B2B SaaS customer acquisition cost benchmark by deal size"
- "subscription business CAC benchmark"
- "fintech customer acquisition cost benchmark"
- "DTC beauty skincare CAC benchmark"
- "mobile app user acquisition cost benchmark"
- "retail customer acquisition cost"
- "healthcare patient acquisition cost"

**Verticals to research:**
1. Ecommerce (General)
2. Ecommerce DTC
3. DTC Beauty/Skincare
4. DTC Apparel
5. Subscription Services (General)
6. Subscription Food/Meal Kit
7. Subscription Software (Consumer)
8. B2B Software SMB
9. B2B Software Mid-Market
10. B2B Software Enterprise
11. Fintech Consumer
12. Fintech B2B
13. Remittance Services
14. Retail (General)
15. CPG
16. Healthcare/Pharma
17. Mobile Apps (General)
18. Mobile Apps Gaming
19. Education/EdTech
20. Real Estate

### CPM Benchmarks by Channel
Research CPM ranges for each channel:
- "Meta Facebook CPM benchmark 2024 2025"
- "Google display CPM benchmark"
- "CTV OTT CPM benchmark"
- "YouTube CPM benchmark"
- "LinkedIn CPM benchmark"
- "TikTok CPM benchmark"
- "programmatic display CPM benchmark"
- "podcast advertising CPM benchmark"

**Channels to research:**
1. Meta (Facebook/Instagram)
2. Google Search
3. Google Display
4. YouTube
5. TikTok
6. LinkedIn
7. Snapchat
8. Pinterest
9. CTV/OTT
10. Programmatic Display
11. Programmatic Video
12. Podcast/Audio
13. Out-of-Home Digital
14. Direct Mail
15. Email

### Conversion Rate Benchmarks
Research conversion rates:
- "ecommerce conversion rate benchmark by vertical"
- "B2B landing page conversion rate benchmark"
- "mobile app install to purchase conversion"
- "email marketing conversion rate benchmark"

### LTV:CAC Ratio Benchmarks
Research healthy ratios:
- "LTV CAC ratio benchmark by industry"
- "subscription LTV CAC ratio"
- "ecommerce LTV CAC ratio"
- "B2B SaaS LTV CAC ratio"

### Retention Rate Benchmarks
Research retention by vertical:
- "customer retention rate benchmark by industry"
- "subscription churn rate benchmark"
- "ecommerce repeat purchase rate benchmark"

## Step 1.2: Create Benchmark Reference Document

Create file: `KB_Benchmark_Reference_v6_6.txt`

**Required sections:**
1. Document header with META tags and RELATED references
2. CAC benchmarks table by vertical (with ranges, not single values)
3. CPM benchmarks table by channel
4. CPC benchmarks table by channel and vertical
5. Conversion rate benchmarks by vertical and funnel stage
6. LTV:CAC ratio benchmarks by vertical
7. Retention rate benchmarks by vertical
8. ADIS segment benchmarks (Champion %, At Risk reactivation rates, etc.)
9. Channel minimum spend thresholds
10. Source citations for each benchmark category
11. Last updated date and research methodology notes

**Format requirements:**
- ALL-CAPS section headers
- Hyphens for lists (no bullets)
- Plain text only
- RELATED tag pointing to Analytics_Engine, Expert Lens docs
- Under 36,000 characters

## Step 1.3: Archive Obsolete Document

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa
mv base/kb/Analytics_Engine_v5_2.txt archive/kb/
```

---

# PHASE 2: SELF-REFERENTIAL LEARNING INFRASTRUCTURE (2-3 hours)

## Objective
Enable document chaining for RAG retrieval optimization.

## Step 2.1: Create Self-Referential Learning Guide

Create file: `Self_Referential_Learning_Guide_v6_6.txt`

**Required sections:**
1. PURPOSE - How agent should chain KB documents
2. RETRIEVAL PATTERNS - When to pull multiple documents
3. DOCUMENT RELATIONSHIPS - Map of which docs relate to which
4. CITATION CHAINING - How to cite across documents
5. RAG OPTIMIZATION - Query patterns that trigger multi-doc retrieval
6. STEP-TO-DOCUMENT MAPPING - Which docs for which planning steps

**Key content to include:**
- For Step 1-2: Retrieve Core Standards + Analytics Engine + Benchmark Reference
- For Step 3-4: Retrieve Audience Strategy + Dimension Checklist + ADIS Quick Reference + Geography Planning
- For Step 5-6: Retrieve Budget Allocation + Benchmark Reference + ADIS (if segments)
- For Step 7-8: Retrieve Channel Mix + Measurement Attribution + ADIS (for affinity)
- For Step 9-10: Retrieve Gap Detection + Confidence Framework

## Step 2.2: Add RELATED Tags to All Documents

For EACH of the following 31 documents, add a RELATED tag in the document header pointing to companion documents:

**Pattern to add after existing header info:**
```
RELATED: [Doc1], [Doc2], [Doc3]
```

**Documents needing RELATED tags with recommended relations:**

1. **Analytics_Engine_v5_5.txt**
   RELATED: KB_Benchmark_Reference_v6_6, KB_00_Agent_Core_Operating_Standards_v6_6, Confidence_Level_Framework_v5_5

2. **Confidence_Level_Framework_v5_5.txt**
   RELATED: Analytics_Engine_v5_5, Data_Provenance_Framework_v6_6, KB_00_Agent_Core_Operating_Standards_v6_6

3. **Gap_Detection_Playbook_v5_5.txt**
   RELATED: Analytics_Engine_v5_5, KB_Benchmark_Reference_v6_6, ADIS_Quick_Reference_v2

4. **Output_Templates_v5_5.txt**
   RELATED: MPA_Conversation_Examples_v6_6, KB_00_Agent_Core_Operating_Standards_v6_6

5. **MEASUREMENT_FRAMEWORK_v5_5.txt**
   RELATED: MPA_Expert_Lens_Measurement_Attribution_v6_6, Analytics_Engine_v5_5, Confidence_Level_Framework_v5_5

6. **BRAND_PERFORMANCE_FRAMEWORK_v5_5.txt**
   RELATED: MEASUREMENT_FRAMEWORK_v5_5, Analytics_Engine_v5_5, MPA_Expert_Lens_Audience_Strategy_v6_6

7. **MPA_Implications_Budget_Decisions_v5_5.txt**
   RELATED: MPA_Expert_Lens_Budget_Allocation_v6_6, KB_Benchmark_Reference_v6_6, ADIS_Quick_Reference_v2

8. **MPA_Implications_Channel_Shifts_v5_5.txt**
   RELATED: MPA_Expert_Lens_Channel_Mix_v6_6, KB_Benchmark_Reference_v6_6, ADIS_Quick_Reference_v2

9. **MPA_Implications_Audience_Targeting_v5_5.txt**
   RELATED: MPA_Expert_Lens_Audience_Strategy_v6_6, ADIS_Quick_Reference_v2, KB_02_Audience_Targeting_Sophistication_v5_8

10. **MPA_Implications_Measurement_Choices_v5_5.txt**
    RELATED: MPA_Expert_Lens_Measurement_Attribution_v6_6, MEASUREMENT_FRAMEWORK_v5_5, Analytics_Engine_v5_5

11. **MPA_Implications_Timing_Pacing_v5_5.txt**
    RELATED: MPA_Expert_Lens_Budget_Allocation_v6_6, Analytics_Engine_v5_5, KB_Benchmark_Reference_v6_6

12. **KB_02_Audience_Targeting_Sophistication_v5_8.txt**
    RELATED: MPA_Expert_Lens_Audience_Strategy_v6_6, MPA_Audience_Dimension_Checklist_v5_8, ADIS_Quick_Reference_v2

13. **MPA_Audience_Dimension_Checklist_v5_8.txt**
    RELATED: MPA_Expert_Lens_Audience_Strategy_v6_6, KB_02_Audience_Targeting_Sophistication_v5_8, MPA_Geography_DMA_Planning_v5_8

14. **MPA_Audience_Taxonomy_Structure_v5_8.txt**
    RELATED: MPA_Expert_Lens_Audience_Strategy_v6_6, MPA_Audience_Dimension_Checklist_v5_8

15. **MPA_Geography_DMA_Planning_v5_8.txt**
    RELATED: MPA_Expert_Lens_Audience_Strategy_v6_6, MPA_Audience_Dimension_Checklist_v5_8, KB_Benchmark_Reference_v6_6

16. **Strategic_Wisdom_v5_5.txt**
    RELATED: KB_00_Agent_Core_Operating_Standards_v6_6, MPA_Conversation_Examples_v6_6

17. **FIRST_PARTY_DATA_STRATEGY_v5_5.txt**
    RELATED: ADIS_Quick_Reference_v2, MPA_Expert_Lens_Audience_Strategy_v6_6, Data_Provenance_Framework_v6_6

18. **AI_ADVERTISING_GUIDE_v5_5.txt**
    RELATED: MPA_Expert_Lens_Channel_Mix_v6_6, ADIS_Quick_Reference_v2, Analytics_Engine_v5_5

19. **RETAIL_MEDIA_NETWORKS_v5_5.txt**
    RELATED: MPA_Expert_Lens_Channel_Mix_v6_6, KB_Benchmark_Reference_v6_6

20. **MPA_Calculation_Display_v5_5.txt**
    RELATED: KB_00_Agent_Core_Operating_Standards_v6_6, Analytics_Engine_v5_5

21. **MPA_Adaptive_Language_v5_5.txt**
    RELATED: KB_00_Agent_Core_Operating_Standards_v6_6, MPA_Conversation_Examples_v6_6

22. **MPA_Step_Boundary_Guidance_v5_5.txt**
    RELATED: KB_00_Agent_Core_Operating_Standards_v6_6, Self_Referential_Learning_Guide_v6_6

23. **MPA_Supporting_Instructions_v5_5.txt**
    RELATED: KB_00_Agent_Core_Operating_Standards_v6_6, MPA_Conversation_Examples_v6_6

24. **MPA_v55_Instructions_Uplift.txt**
    RELATED: KB_00_Agent_Core_Operating_Standards_v6_6

25. **ADIS_Copilot_Instructions_Addendum_v1.txt**
    RELATED: ADIS_Quick_Reference_v2, ADIS_Copilot_Integration_v2, KB_00_Agent_Core_Operating_Standards_v6_6

26. **ADIS_Knowledge_Base_v1.txt**
    RELATED: ADIS_Quick_Reference_v2, ADIS_Model_Catalog_v1, ADIS_User_Guide_v1

27. **ADIS_Model_Catalog_v1.txt**
    RELATED: ADIS_Quick_Reference_v2, ADIS_Copilot_Integration_v2, Analytics_Engine_v5_5

28. **ADIS_Schema_Reference_v1.txt**
    RELATED: ADIS_Model_Catalog_v1, ADIS_User_Guide_v1

29. **ADIS_User_Guide_v1.txt**
    RELATED: ADIS_Quick_Reference_v2, ADIS_Copilot_Integration_v2, ADIS_Model_Catalog_v1

30. **KB_INDEX_v6_6.txt**
    RELATED: Self_Referential_Learning_Guide_v6_6, KB_00_Agent_Core_Operating_Standards_v6_6

31. **Output_Templates_v5_5.txt**
    RELATED: MPA_Conversation_Examples_v6_6, KB_00_Agent_Core_Operating_Standards_v6_6, Gap_Detection_Playbook_v5_5

## Step 2.3: Create Quick Reference Card

Create file: `v6_6_Quick_Reference_Card.txt`

**Required content (keep under 3,000 chars for quick retrieval):**
1. 4 MANDATORY RESPONSE ELEMENTS checklist
2. TARGET LABELING definitions
3. ADIS trigger phrases
4. Citation phrase patterns
5. Step-to-document quick map
6. ADIS model selection quick guide

---

# PHASE 3: HIGH-PRIORITY DOCUMENT UPDATES (4-6 hours)

## Objective
Update large workflow documents with v6.6 patterns and ADIS integration.

## Step 3.1: Update Gap_Detection_Playbook

**File:** `Gap_Detection_Playbook_v5_5.txt` (90KB, 2772 lines)

**Changes needed:**
1. Add RELATED tag in header
2. Add new section: ADIS GAP DETECTION
   - Segment-level gap identification
   - When Champions are declining
   - When At Risk is growing
   - When acquisition CAC exceeds segment LTV
3. Add v6.6 response patterns to gap presentation examples
4. Add ADIS-triggered gap alerts
5. Update examples to show calculation + KB citation

**New section to add:**
```
ADIS GAP DETECTION

When ADIS segments exist, monitor for these gap patterns:

SEGMENT MIGRATION GAPS
- Champions declining more than 5% quarter-over-quarter: ALERT
- At Risk segment growing more than 10%: ALERT
- New customer second-purchase rate below 20%: ALERT

SEGMENT EFFICIENCY GAPS
- Acquisition CAC exceeds segment average LTV: CRITICAL GAP
- Champion retention below 80%: ALERT
- At Risk reactivation below 5%: ALERT

SEGMENT RESPONSE EXAMPLE:
Based on your ADIS analysis, I detect a gap: Your Champions segment declined 8% this quarter while At Risk grew 12%. Based on KB data for ecommerce, Champion decline above 5% typically signals retention program weakness. Recommended action: Reallocate 15% of acquisition budget to Champion retention.
```

## Step 3.2: Update Output_Templates

**File:** `Output_Templates_v5_5.txt` (88KB)

**Changes needed:**
1. Add RELATED tag
2. Update ALL output templates to demonstrate v6.6 format:
   - Context callback in opening
   - Calculations shown explicitly
   - KB citations with vertical
   - Target labels where applicable
3. Add ADIS segment output templates
4. Add AMMO optimization output template

## Step 3.3: Update Analytics_Engine

**File:** `Analytics_Engine_v5_5.txt` (85KB, 2553 lines)

**Changes needed:**
1. Add RELATED tag pointing to KB_Benchmark_Reference_v6_6
2. Add section: ADIS ANALYTICS INTEGRATION
   - Segment-level calculations
   - CLV formulas aligned with ADIS models
   - Propensity score integration
   - Uplift calculation methodology
3. Update all benchmark references to point to KB_Benchmark_Reference_v6_6
4. Add v6.6 citation patterns to examples
5. Standardize all benchmark values to match KB_Benchmark_Reference

## Step 3.4: Update Confidence_Level_Framework

**File:** `Confidence_Level_Framework_v5_5.txt` (61KB)

**Changes needed:**
1. Add RELATED tag
2. Add section: ADIS CONFIDENCE SCORING
   - Confidence by data volume
   - Confidence by model type
   - Confidence when combining ADIS with KB benchmarks
3. Update confidence examples with v6.6 format

---

# PHASE 4: MEDIUM-PRIORITY UPDATES (4-6 hours)

## Objective
Update step-specific and framework documents.

## Step 4.1: Update All 5 Implications Documents

For each MPA_Implications_*.txt file:

1. Add RELATED tag
2. Add section showing ADIS implications for that domain
3. Add v6.6 response pattern examples
4. Cross-reference to Expert Lens v6.6 version

**ADIS content to add by document:**

**MPA_Implications_Budget_Decisions_v5_5.txt:**
- Segment-level budget implications
- AMMO optimization implications
- When to shift budget between segments

**MPA_Implications_Channel_Shifts_v5_5.txt:**
- Segment affinity implications
- When Champions prefer different channels than At Risk
- Propensity-based channel shifting

**MPA_Implications_Audience_Targeting_v5_5.txt:**
- ADIS segment targeting implications
- RFM vs Propensity vs Uplift targeting
- Cluster-based creative implications

**MPA_Implications_Measurement_Choices_v5_5.txt:**
- Segment-level measurement implications
- ADIS validation approaches
- Actual vs predicted comparison

**MPA_Implications_Timing_Pacing_v5_5.txt:**
- Segment-level timing patterns
- When to time campaigns by segment lifecycle
- Cohort-based pacing

## Step 4.2: Update MEASUREMENT_FRAMEWORK

**File:** `MEASUREMENT_FRAMEWORK_v5_5.txt` (19KB)

**Changes needed:**
1. Add RELATED tag
2. Add section: ADIS MEASUREMENT INTEGRATION
3. Add segment-level KPI framework
4. Add ADIS model validation methodology
5. Cross-reference to Expert Lens Measurement v6.6

## Step 4.3: Create ADIS Campaign Integration Guide

Create file: `ADIS_Campaign_Integration_Guide_v6_6.txt`

**Required sections:**
1. END-TO-END WORKFLOW - From data upload to campaign activation
2. SEGMENT-TO-PLATFORM MAPPING - How to activate segments in each platform
3. CREATIVE BY SEGMENT - Messaging frameworks by segment type
4. MEASUREMENT FEEDBACK LOOP - How to feed results back to ADIS
5. REFRESH CADENCE - When to re-run ADIS analysis
6. CROSS-CHANNEL ORCHESTRATION - Managing segments across channels

---

# PHASE 5: CLEANUP AND CONSOLIDATION (2-3 hours)

## Objective
Remove duplication and ensure consistency.

## Step 5.1: Audit MPA_Calculation_Display_v5_5.txt

**Analysis needed:**
- Compare content to KB_00_Agent_Core_Operating_Standards_v6_6
- Identify any unique content not covered elsewhere
- Decision: Archive if redundant, or update with RELATED tag if unique

**Likely outcome:** Archive - v6.6 Core Standards covers calculation display requirements.

## Step 5.2: Audit MPA_v55_Instructions_Uplift.txt

**Analysis needed:**
- Compare to KB_00_Agent_Core_Operating_Standards_v6_6
- Identify uplift patterns not covered in v6.6
- Decision: Archive if redundant, merge unique content if valuable

## Step 5.3: Audit MPA_Supporting_Instructions_v5_5.txt

**Analysis needed:**
- Compare to Core Operating Standards v6.6
- Identify unique supporting guidance
- Decision: Archive, merge, or update with RELATED tag

## Step 5.4: Standardize All Benchmark Values

After KB_Benchmark_Reference_v6_6 is created:
1. Search all documents for benchmark values
2. Update any inconsistencies to match KB_Benchmark_Reference
3. Add "See KB_Benchmark_Reference_v6_6 for current values" where appropriate

**Search patterns:**
```bash
grep -n "typical.*[0-9]" *.txt
grep -n "runs.*[0-9].*to.*[0-9]" *.txt
grep -n "CAC.*[0-9]" *.txt
grep -n "CPM.*[0-9]" *.txt
```

## Step 5.5: Update KB_INDEX_v6_6

After all documents are updated:
1. Verify all document descriptions are accurate
2. Update retrieval priorities based on new structure
3. Add new documents to index
4. Remove archived documents from index

---

# PHASE 6: VALIDATION AND TESTING (1-2 hours)

## Objective
Verify all updates work together correctly.

## Step 6.1: Cross-Reference Validation

For each v6.6 document, verify:
- [ ] RELATED tag points to existing documents
- [ ] Referenced documents point back appropriately
- [ ] No circular dependencies that could confuse retrieval

## Step 6.2: Benchmark Consistency Check

```bash
# Run this to find any remaining benchmark inconsistencies
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base/kb
grep -h "Based on KB data for ecommerce" *.txt | sort | uniq
grep -h "Based on KB data for subscription" *.txt | sort | uniq
grep -h "Based on KB data for fintech" *.txt | sort | uniq
grep -h "Based on KB data for B2B" *.txt | sort | uniq
```

## Step 6.3: v6.6 Compliance Check

For each updated document, verify:
- [ ] Has RELATED tag
- [ ] Examples show all 4 mandatory response elements
- [ ] ADIS integration where applicable
- [ ] Consistent citation patterns

## Step 6.4: Character Count Validation

Verify no document exceeds limits:
```bash
wc -c *.txt | sort -n
# All should be under 100KB
# Core documents should be under 36KB
```

---

# GIT WORKFLOW

## After Each Phase

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Stage changes
git add release/v5.5/agents/mpa/

# Commit with descriptive message
git commit -m "feat(KB): Phase X - [description]"

# Push to current branch
git push origin [current-branch]

# Merge to all branches
git checkout main && git merge [feature-branch]
git push origin main

git checkout deploy/mastercard && git merge main
git push origin deploy/mastercard

git checkout deploy/personal && git merge main  
git push origin deploy/personal
```

## Recommended Branch Strategy

Work on `feature/kb-v66-optimization` branch, merge to main after each phase completion.

---

# CONTINUATION PROMPTS

## Starting a New Session

Use this prompt to continue work:

```
I'm continuing the MPA KB v6.6 optimization project. Please read the instruction file at:
/mnt/project/MPA_KB_V66_OPTIMIZATION_INSTRUCTIONS.md

Current status: [PHASE X, Step X.X completed/in progress]

Next task: [specific task from instructions]

Repository is at: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
KB location: release/v5.5/agents/mpa/base/kb/
```

## Phase Completion Checklist

After each phase, update this status in the instruction file or create a separate status file:

- [ ] Phase 1: Benchmark Research - NOT STARTED
- [ ] Phase 2: Self-Referential Learning - NOT STARTED
- [ ] Phase 3: High-Priority Updates - NOT STARTED
- [ ] Phase 4: Medium-Priority Updates - NOT STARTED
- [ ] Phase 5: Cleanup - NOT STARTED
- [ ] Phase 6: Validation - NOT STARTED

---

# SUCCESS CRITERIA

## Quantitative Metrics
- [ ] 40/40 documents have RELATED tags
- [ ] 0 benchmark inconsistencies
- [ ] 4 new documents created
- [ ] 1 document archived
- [ ] 0 documents over 100KB

## Qualitative Metrics
- [ ] All examples demonstrate v6.6 format
- [ ] ADIS integration documented in all relevant docs
- [ ] Self-referential learning enabled via RELATED tags
- [ ] Single authoritative benchmark source exists
- [ ] Clear document chaining patterns documented

---

# REFERENCE: VERTICAL BENCHMARKS TO RESEARCH

## CAC Ranges Needed (research priority)

| Vertical | Current Value | Source Needed |
|----------|---------------|---------------|
| Ecommerce General | 35-65 | Validate |
| Ecommerce DTC | 35-80 | Validate |
| DTC Beauty | 45-80 | Validate |
| Subscription General | CONFLICTING (25-50 OR 60-120) | CRITICAL |
| Subscription Food | 60-120 | Validate |
| B2B Software SMB | 200-500 | Validate |
| B2B Software Enterprise | 2000-8000 | Validate |
| Fintech Consumer | 75-150 | Validate |
| Fintech B2B | 500-2000 | Validate |
| Remittance | 45-75 | Validate |
| Retail | 15-40 | Validate |
| CPG | 8-25 | Validate |
| Healthcare | 100-300 | Validate |
| Mobile Apps | MISSING | RESEARCH |
| Education | MISSING | RESEARCH |
| Real Estate | MISSING | RESEARCH |

## CPM Ranges Needed

| Channel | Current Value | Source Needed |
|---------|---------------|---------------|
| Meta | 12-18 | Validate |
| Google Display | 3-8 | Validate |
| YouTube | 8-15 | Validate |
| CTV/OTT | 25-45 | Validate |
| LinkedIn | 30-50 | Validate |
| TikTok | MISSING | RESEARCH |
| Programmatic | 3-8 | Validate |
| Podcast | 15-30 | Validate |

---

# DOCUMENT CREATION TEMPLATES

## Standard Header Template
```
DOCUMENT: [filename]
CATEGORY: [category]
TOPICS: [comma-separated keywords for RAG retrieval]
VERSION: 6.6
DATE: January 2026
STATUS: Production Ready
COMPLIANCE: 6-Rule Compliant
RELATED: [Doc1], [Doc2], [Doc3]

[DOCUMENT TITLE]

PURPOSE

[Purpose statement]
```

## v6.6 Example Response Template
```
EXAMPLE: [Scenario Name]

USER INPUT:
[User message]

CORRECT RESPONSE:
[Context callback]. [Calculation]. Based on KB data for [vertical], [benchmark citation with range]. Your [value] is [TARGET LABEL] - [explanation].

[ADIS offer if applicable]

ANNOTATION:
- Context Callback: [what was referenced]
- Calculation: [math shown]
- KB Benchmark: [citation]
- Vertical Reference: [industry named]
- Target Label: [label used]
```
