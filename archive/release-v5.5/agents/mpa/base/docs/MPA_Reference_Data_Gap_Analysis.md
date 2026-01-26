# MPA Reference Data Gap Analysis & Recommendations

## EXECUTIVE SUMMARY

**Current State:** MPA v6.0 relies on web search for DMA population data and platform taxonomy codes. No fallback data exists for offline/air-gapped environments (like Mastercard).

**Gap Identified:**
1. No DMA population data stored (instructions say "web search for census data")
2. No IAB/Google/Meta taxonomy codes stored (instructions say "web search for current codes")

**Recommendation:** Create two new seed data files + KB reference documents for offline fallback

---

## 1. CURRENT STATE ANALYSIS

### 1.1 DMA Population Data

**What exists:**
- MPA_Geography_DMA_Planning_v6_0.txt - Contains methodology but NO actual data
- Instructions tell agent to web search: "site:census.gov [DMA name] population"

**What's missing:**
- Top 100 DMA populations
- Demographic breakdowns (age, income, education, ethnicity)
- Nielsen DMA codes and boundaries
- Household counts

**Impact:** Agent cannot complete Step 4 Geography without web search access

### 1.2 Platform Taxonomy Codes

**What exists:**
- MPA_Audience_Taxonomy_Structure_v6_0.txt - Contains structure/format but NO actual codes
- Only shows IAB Tier 1 categories (IAB1-IAB23) without subcategories
- Instructions say "web search for current codes as platforms update quarterly"

**What's missing:**
- Complete IAB Content Taxonomy 3.0 (~1,500 codes)
- Google Affinity audiences (~300 segments)
- Google In-Market audiences (~500 segments)
- Meta Interest categories (~1,000+ interests)
- LinkedIn targeting dimensions

**Impact:** Agent cannot provide activation-ready audience specifications without web search

---

## 2. RECOMMENDED APPROACH

### Option A: Dataverse Tables (RECOMMENDED for structured queries)
**Best for:** Programmatic lookup, filtering, API access
**Pros:** Queryable, updatable via Power Automate, integrates with platform
**Cons:** Requires Dataverse deployment, sync mechanism

### Option B: KB Documents (RECOMMENDED for retrieval augmentation)
**Best for:** RAG retrieval, natural language access, offline environments
**Pros:** Works with existing KB infrastructure, easy to update, version controlled
**Cons:** Less structured, no filtering capabilities

### HYBRID APPROACH (RECOMMENDED)
- **Seed Data CSV** → Source of truth, version controlled in repo
- **Dataverse Table** → Production runtime for environments with Dataverse
- **KB Document** → Fallback reference for RAG retrieval when web search unavailable

---

## 3. DATA REQUIREMENTS

### 3.1 DMA Population Reference Table

**Table Name:** mpa_dma_population
**Record Count:** 210 US DMAs (focus on top 100)
**Update Frequency:** Annual (Census ACS releases)

| Column | Type | Description |
|--------|------|-------------|
| mpa_dma_code | String(10) | Nielsen DMA code (e.g., "501") |
| mpa_dma_name | String(100) | DMA name (e.g., "New York") |
| mpa_dma_rank | Integer | Nielsen rank by TV households |
| mpa_total_population | Integer | Total population |
| mpa_total_households | Integer | Total households |
| mpa_median_age | Decimal | Median age |
| mpa_median_hhi | Integer | Median household income |
| mpa_pct_age_18_34 | Decimal | Percent age 18-34 |
| mpa_pct_age_25_54 | Decimal | Percent age 25-54 |
| mpa_pct_age_55_plus | Decimal | Percent age 55+ |
| mpa_pct_hhi_under_50k | Decimal | Percent HHI under $50K |
| mpa_pct_hhi_50k_100k | Decimal | Percent HHI $50-100K |
| mpa_pct_hhi_over_100k | Decimal | Percent HHI over $100K |
| mpa_pct_college_degree | Decimal | Percent with bachelor's+ |
| mpa_pct_hispanic | Decimal | Percent Hispanic/Latino |
| mpa_pct_black | Decimal | Percent Black/African American |
| mpa_pct_asian | Decimal | Percent Asian |
| mpa_pct_white | Decimal | Percent White |
| mpa_state_primary | String(2) | Primary state code |
| mpa_states_included | String(50) | All states in DMA |
| mpa_data_source | String(100) | "US Census ACS 2019-2023" |
| mpa_data_year | Integer | Data year (2023) |

### 3.2 IAB Content Taxonomy Table

**Table Name:** mpa_iab_taxonomy
**Record Count:** ~1,500 codes
**Update Frequency:** Annual (IAB releases)

| Column | Type | Description |
|--------|------|-------------|
| mpa_iab_code | String(20) | Full code (e.g., "IAB13-7") |
| mpa_iab_tier | Integer | Tier level (1, 2, or 3) |
| mpa_iab_parent_code | String(20) | Parent code (null for Tier 1) |
| mpa_iab_name | String(200) | Category name |
| mpa_iab_description | String(500) | Description |
| mpa_vertical_relevance | String(200) | Relevant MPA verticals |

### 3.3 Platform Audience Taxonomy Table

**Table Name:** mpa_platform_taxonomy
**Record Count:** ~2,000 segments
**Update Frequency:** Quarterly

| Column | Type | Description |
|--------|------|-------------|
| mpa_segment_id | String(50) | Unique identifier |
| mpa_platform | String(20) | GOOGLE, META, LINKEDIN, TIKTOK |
| mpa_taxonomy_type | String(30) | AFFINITY, IN_MARKET, INTEREST, BEHAVIOR |
| mpa_segment_path | String(300) | Full path (e.g., "/Affinity/Banking/Investors") |
| mpa_segment_name | String(200) | Display name |
| mpa_parent_path | String(300) | Parent segment path |
| mpa_tier | Integer | Hierarchy depth |
| mpa_vertical_relevance | String(200) | Relevant MPA verticals |
| mpa_estimated_reach | String(50) | Reach tier (BROAD, MEDIUM, NARROW) |
| mpa_last_verified | Date | Last verification date |

---

## 4. IMPLEMENTATION PLAN

### Phase 1: Create Seed Data Files (Priority: HIGH)

**4.1 DMA Population Seed**
```
File: release/v5.5/agents/mpa/base/seed-data-v6/mpa_dma_population_seed.csv
Source: US Census ACS 2019-2023 5-Year Estimates + Nielsen DMA definitions
Records: 100 (top DMAs by population)
```

**4.2 IAB Taxonomy Seed**
```
File: release/v5.5/agents/mpa/base/seed-data-v6/mpa_iab_taxonomy_seed.csv
Source: IAB Tech Lab Content Taxonomy 3.0
Records: ~700 (Tier 1-2, most relevant Tier 3)
```

**4.3 Platform Taxonomy Seed**
```
File: release/v5.5/agents/mpa/base/seed-data-v6/mpa_platform_taxonomy_seed.csv
Source: Google Ads, Meta Business Suite, LinkedIn Campaign Manager docs
Records: ~500 (most commonly used segments)
```

### Phase 2: Create KB Reference Documents (Priority: HIGH)

**4.4 DMA Population Reference KB**
```
File: release/v5.5/agents/mpa/base/kb-v6/MPA_DMA_Population_Reference_v6_0.txt
Format: 6-Rule Compliant with META tags
Content: Top 50 DMAs with full demographic data in structured format
```

**4.5 IAB Taxonomy Reference KB**
```
File: release/v5.5/agents/mpa/base/kb-v6/MPA_IAB_Taxonomy_Reference_v6_0.txt
Format: 6-Rule Compliant with META tags
Content: Complete IAB taxonomy with vertical mappings
```

**4.6 Platform Taxonomy Reference KB**
```
File: release/v5.5/agents/mpa/base/kb-v6/MPA_Platform_Taxonomy_Reference_v6_0.txt
Format: 6-Rule Compliant with META tags
Content: Google Affinity/In-Market + Meta Interests + LinkedIn targeting
```

### Phase 3: Dataverse Schema Updates (Priority: MEDIUM)

**4.7 Add Dataverse Tables**
- mpa_dma_population
- mpa_iab_taxonomy
- mpa_platform_taxonomy

**4.8 Create Power Automate Flows**
- Sync from seed CSV to Dataverse on deployment
- Annual refresh trigger for census data

---

## 5. DATA SOURCES

### 5.1 DMA Population Data Sources

| Source | URL | Data Available |
|--------|-----|----------------|
| US Census ACS | data.census.gov | Demographics, income, education |
| Nielsen | nielsen.com/dma-rankings | DMA codes, TV households, rank |
| Census Bureau API | api.census.gov | Programmatic access |

### 5.2 Taxonomy Data Sources

| Source | URL | Data Available |
|--------|-----|----------------|
| IAB Tech Lab | iabtechlab.com/standards/content-taxonomy | Official IAB codes |
| Google Ads Help | support.google.com/google-ads | Affinity, In-Market |
| Meta Business Help | facebook.com/business/help | Interests, Behaviors |
| LinkedIn Marketing | linkedin.com/help/lms | B2B targeting |

---

## 6. RECOMMENDED NEXT STEPS

### Immediate (Today)
1. ✅ Approve this plan
2. Create mpa_dma_population_seed.csv with top 100 DMAs
3. Create mpa_iab_taxonomy_seed.csv with Tier 1-2 codes

### This Week
4. Create MPA_DMA_Population_Reference_v6_0.txt KB document
5. Create MPA_IAB_Taxonomy_Reference_v6_0.txt KB document
6. Create MPA_Platform_Taxonomy_Reference_v6_0.txt KB document

### Next Week
7. Add Dataverse schema for new tables
8. Create seed data import scripts
9. Update Copilot Instructions to reference fallback data

---

## 7. COPILOT INSTRUCTION UPDATES

Update MPA_Copilot_Instructions_v6_0.txt to include:

```
DATA ACCESS HIERARCHY

When audience sizing or taxonomy data is needed:
1. FIRST - Query Dataverse tables (mpa_dma_population, mpa_platform_taxonomy)
2. IF EMPTY - Search Knowledge Base reference documents
3. IF NOT FOUND - Web search for current data
4. ALWAYS cite source: "Based on [Dataverse|Knowledge Base|Websearch]"

OFFLINE MODE

When web search is unavailable:
- Use MPA_DMA_Population_Reference_v6_0.txt for census data
- Use MPA_IAB_Taxonomy_Reference_v6_0.txt for contextual codes
- Use MPA_Platform_Taxonomy_Reference_v6_0.txt for audience segments
- Note data vintage in response: "Based on Knowledge Base (ACS 2023 data)"
```

---

## 8. SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| DMA coverage | Top 100 DMAs (95% of US population) |
| IAB codes | 700+ codes (Tier 1-3) |
| Platform segments | 500+ segments across Google/Meta/LinkedIn |
| Offline capability | Agent can complete Step 4 without web search |
| Data freshness | Annual refresh cycle documented |
