# VS Code Claude: MPA Reference Data Implementation

## CONTEXT

You are implementing the MPA Reference Data system for offline/fallback operation. The MPA agent currently relies on web search for census data and platform taxonomy codes, but needs stored fallback data for air-gapped environments like Mastercard.

**Repository:** `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform`
**Branch:** `feature/v6.0-retrieval-enhancement`
**Output Directory:** `release/v5.5/agents/mpa/base/seed-data-v6/`
**KB Directory:** `release/v5.5/agents/mpa/base/kb-v6/`

## ARCHITECTURE DOCUMENT

Read first: `release/v5.5/agents/mpa/base/seed-data-v6/REGIONAL_DATA_ARCHITECTURE.md`

---

## TASK 1: GEOGRAPHIC/CENSUS DATA BY REGION

Create CSV seed files with population and demographic data for each supported region.

### 1.1 US DMA Data (Priority: HIGH)
**File:** `mpa_geography_us_seed.csv`
**Records:** Top 100 DMAs by population
**Source:** US Census ACS 2019-2023, Nielsen DMA Rankings

**Schema:**
```csv
mpa_geo_id,mpa_country,mpa_geo_type,mpa_geo_code,mpa_geo_name,mpa_geo_rank,mpa_total_population,mpa_total_households,mpa_median_age,mpa_median_hhi,mpa_pct_male,mpa_pct_female,mpa_pct_age_0_17,mpa_pct_age_18_34,mpa_pct_age_25_54,mpa_pct_age_55_plus,mpa_pct_hhi_under_50k,mpa_pct_hhi_50k_100k,mpa_pct_hhi_over_100k,mpa_pct_hhi_over_150k,mpa_pct_college_degree,mpa_pct_graduate_degree,mpa_pct_hispanic,mpa_pct_white_nonhisp,mpa_pct_black,mpa_pct_asian,mpa_pct_other,mpa_state_primary,mpa_states_included,mpa_data_source,mpa_data_year
```

**Top 10 DMAs to include (verify data via web search):**
1. New York (DMA 501) - ~20.1M population
2. Los Angeles (DMA 803) - ~13.2M population
3. Chicago (DMA 602) - ~9.5M population
4. Philadelphia (DMA 504) - ~7.2M population
5. Dallas-Ft. Worth (DMA 623) - ~7.8M population
6. Houston (DMA 618) - ~7.1M population
7. Washington DC (DMA 511) - ~6.4M population
8. Atlanta (DMA 524) - ~6.2M population
9. Boston (DMA 506) - ~5.0M population
10. San Francisco-Oakland-San Jose (DMA 807) - ~4.8M population

Continue through Top 100 DMAs.

### 1.2 Canada CMA Data
**File:** `mpa_geography_ca_seed.csv`
**Records:** All 35 CMAs
**Source:** Statistics Canada Census 2021

**Top CMAs:**
1. Toronto CMA - ~6.2M
2. Montreal CMA - ~4.3M
3. Vancouver CMA - ~2.6M
4. Calgary CMA - ~1.5M
5. Edmonton CMA - ~1.4M
6. Ottawa-Gatineau CMA - ~1.4M

### 1.3 UK ITV Region Data
**File:** `mpa_geography_uk_seed.csv`
**Records:** 15 ITV Regions + 12 NUTS1 Regions
**Source:** ONS Census 2021, Ofcom

**Regions:**
1. London - ~9.0M
2. Central (Midlands) - ~5.9M
3. Granada (North West) - ~5.5M
4. Yorkshire - ~5.5M
5. Meridian (South/South East) - ~5.0M

### 1.4 Mexico Metro Areas
**File:** `mpa_geography_mx_seed.csv`
**Records:** Top 30 Zonas Metropolitanas
**Source:** INEGI Censo 2020

### 1.5 Australia GCCSA Data
**File:** `mpa_geography_au_seed.csv`
**Records:** 8 Greater Capital Cities + Rest of State
**Source:** ABS Census 2021

### 1.6 Germany Bundesländer
**File:** `mpa_geography_de_seed.csv`
**Records:** 16 Bundesländer
**Source:** Destatis 2023

### 1.7 France Régions
**File:** `mpa_geography_fr_seed.csv`
**Records:** 18 Régions (13 metropolitan + 5 overseas)
**Source:** INSEE 2023

### 1.8 Chile Regiones
**File:** `mpa_geography_cl_seed.csv`
**Records:** 16 Regiones
**Source:** INE Chile Censo 2017 + estimates

### 1.9 Spain Comunidades
**File:** `mpa_geography_es_seed.csv`
**Records:** 17 Comunidades Autónomas + 2 Ciudades Autónomas
**Source:** INE Spain 2023

### 1.10 Brazil Estados
**File:** `mpa_geography_br_seed.csv`
**Records:** 27 Unidades Federativas
**Source:** IBGE Censo 2022

---

## TASK 2: IAB CONTENT TAXONOMY

Create comprehensive IAB Content Taxonomy 3.0 reference.

**File:** `mpa_iab_taxonomy_seed.csv`
**Records:** ~700 codes (all Tier 1, Tier 2, key Tier 3)
**Source:** IAB Tech Lab Content Taxonomy 3.0

**Schema:**
```csv
mpa_iab_id,mpa_iab_code,mpa_iab_tier,mpa_iab_parent_code,mpa_iab_name,mpa_iab_description,mpa_vertical_relevance,mpa_contextual_signal_strength
```

**Tier 1 Categories (23 total):**
- IAB1 Arts & Entertainment
- IAB2 Automotive
- IAB3 Business
- IAB4 Careers
- IAB5 Education
- IAB6 Family & Parenting
- IAB7 Health & Fitness
- IAB8 Food & Drink
- IAB9 Hobbies & Interests
- IAB10 Home & Garden
- IAB11 Law, Government & Politics
- IAB12 News
- IAB13 Personal Finance
- IAB14 Society
- IAB15 Science
- IAB16 Pets
- IAB17 Sports
- IAB18 Style & Fashion
- IAB19 Technology & Computing
- IAB20 Travel
- IAB21 Real Estate
- IAB22 Shopping
- IAB23 Religion & Spirituality

**Include all Tier 2 subcategories and key Tier 3 for verticals:**
- Finance (IAB13-*): All subcategories
- Retail/Shopping (IAB22-*): All subcategories
- Technology (IAB19-*): All subcategories
- Automotive (IAB2-*): All subcategories
- Travel (IAB20-*): All subcategories
- Healthcare (IAB7-*): All subcategories

---

## TASK 3: PLATFORM AUDIENCE TAXONOMIES

### 3.1 Google Audiences
**File:** `mpa_taxonomy_google_seed.csv`
**Records:** ~400 segments
**Source:** Google Ads Help Center

**Schema:**
```csv
mpa_segment_id,mpa_platform,mpa_taxonomy_type,mpa_segment_path,mpa_segment_name,mpa_parent_path,mpa_tier,mpa_vertical_relevance,mpa_reach_tier,mpa_last_verified
```

**Include:**
- All Affinity Audiences (~150 segments)
- All In-Market Audiences (~250 segments)
- Life Events audiences
- Custom Intent structure

**Affinity Categories:**
- Banking & Finance
- Beauty & Wellness
- Food & Dining
- Home & Garden
- Lifestyles & Hobbies
- Media & Entertainment
- News & Politics
- Shoppers
- Sports & Fitness
- Technology
- Travel
- Vehicles & Transportation

**In-Market Categories:**
- Apparel & Accessories
- Autos & Vehicles
- Baby & Children's Products
- Beauty Products & Services
- Business Services
- Computers & Peripherals
- Consumer Electronics
- Dating Services
- Education
- Employment
- Financial Services
- Gifts & Occasions
- Home & Garden
- Real Estate
- Software
- Sports & Fitness
- Telecom
- Travel

### 3.2 Meta Audiences
**File:** `mpa_taxonomy_meta_seed.csv`
**Records:** ~500 segments
**Source:** Meta Business Help Center

**Include:**
- Interests (~300 categories)
- Behaviors (~150 categories)
- Demographics targeting options
- Life Events

**Interest Categories:**
- Business and Industry
- Entertainment
- Family and Relationships
- Fitness and Wellness
- Food and Drink
- Hobbies and Activities
- Shopping and Fashion
- Sports and Outdoors
- Technology

**Behavior Categories:**
- Anniversary
- Consumer Classification
- Digital Activities
- Expats
- Mobile Device User
- More Categories
- Purchase Behavior
- Residential Profiles
- Seasonal and Events
- Travel

### 3.3 LinkedIn Audiences
**File:** `mpa_taxonomy_linkedin_seed.csv`
**Records:** ~300 targeting options
**Source:** LinkedIn Marketing Solutions Help

**Include:**
- Job Functions (26 categories)
- Job Seniority levels (8 levels)
- Industry categories (148 industries)
- Company Size ranges (8 tiers)
- Skills (top 200)
- Member Groups
- Company targeting structure

---

## TASK 4: BEHAVIORAL ATTRIBUTES

**File:** `mpa_behavioral_attributes_seed.csv`
**Records:** ~200 behavioral signals
**Source:** Platform documentation, industry standards

**Schema:**
```csv
mpa_behavior_id,mpa_behavior_category,mpa_behavior_name,mpa_behavior_description,mpa_signal_type,mpa_platforms_available,mpa_vertical_relevance,mpa_intent_level,mpa_data_freshness
```

**Categories:**
1. **Purchase Behavior**
   - Recent purchasers (7/14/30/60/90 day windows)
   - Purchase frequency (heavy/medium/light)
   - Average order value tiers
   - Category purchasers (by vertical)
   - Payment method preferences

2. **Browsing Behavior**
   - Site visitors (recency windows)
   - Page depth engagement
   - Time on site tiers
   - Bounce vs engaged
   - Return visitor frequency

3. **Search Behavior**
   - Category searchers
   - Brand searchers
   - Comparison shoppers
   - Research phase signals

4. **Content Consumption**
   - Video viewers (completion rates)
   - Article readers
   - Podcast listeners
   - Social engagers

5. **Device Behavior**
   - Mobile-first users
   - Desktop-primary users
   - Cross-device users
   - App users vs web users

6. **Temporal Behavior**
   - Daypart activity patterns
   - Weekend vs weekday
   - Seasonal purchasers
   - Event-triggered behavior

7. **Social Behavior**
   - Sharers/Engagers
   - Commenters
   - Followers/Subscribers
   - UGC creators

8. **Transaction Signals**
   - Cart abandoners
   - Wishlist users
   - Coupon users
   - Loyalty members

---

## TASK 5: CONTEXTUAL ATTRIBUTES

**File:** `mpa_contextual_attributes_seed.csv`
**Records:** ~150 contextual signals
**Source:** IAB, platform documentation

**Schema:**
```csv
mpa_context_id,mpa_context_category,mpa_context_name,mpa_context_description,mpa_iab_mapping,mpa_signal_type,mpa_brand_safety_tier,mpa_vertical_relevance
```

**Categories:**
1. **Content Categories** (mapped to IAB)
   - News & Current Events
   - Entertainment & Pop Culture
   - Sports & Recreation
   - Business & Finance
   - Technology & Science
   - Lifestyle & Fashion
   - Health & Wellness
   - Travel & Leisure
   - Food & Cooking
   - Home & Garden
   - Automotive
   - Education

2. **Content Format**
   - Article/Editorial
   - Video content
   - User-generated content
   - Social feed
   - Gaming environment
   - Audio/Podcast
   - E-commerce/Product pages

3. **Content Sentiment**
   - Positive/Uplifting
   - Neutral/Informational
   - Negative/Controversial
   - Breaking news

4. **Page Environment**
   - Above the fold
   - In-content
   - Sidebar
   - Footer
   - Interstitial
   - Native placement

5. **Brand Safety Contexts**
   - Brand safe (Tier 1)
   - Standard (Tier 2)
   - Sensitive (Tier 3)
   - Avoid (Tier 4)

6. **Seasonal/Event Contexts**
   - Holiday seasons
   - Sporting events
   - Cultural moments
   - Weather-triggered

---

## TASK 6: KB REFERENCE DOCUMENTS

Create 6-Rule Compliant KB documents for RAG retrieval fallback.

### 6.1 Geography Reference KB (per region)
**File:** `MPA_Geography_Reference_US_v6_0.txt`
**File:** `MPA_Geography_Reference_CA_v6_0.txt`
**File:** `MPA_Geography_Reference_UK_v6_0.txt`
**File:** `MPA_Geography_Reference_LATAM_v6_0.txt` (MX, BR, CL combined)
**File:** `MPA_Geography_Reference_EU_v6_0.txt` (DE, FR, ES, IT combined)
**File:** `MPA_Geography_Reference_APAC_v6_0.txt` (AU, JP combined)

**Format:** 6-Rule Compliant (ALL-CAPS headers, hyphens for lists, ASCII only)
**Content:** Top markets with full demographic tables

### 6.2 IAB Taxonomy Reference KB
**File:** `MPA_IAB_Taxonomy_Reference_v6_0.txt`
**Content:** Complete IAB 3.0 taxonomy with vertical mappings

### 6.3 Platform Taxonomy Reference KB
**File:** `MPA_Platform_Taxonomy_Google_v6_0.txt`
**File:** `MPA_Platform_Taxonomy_Meta_v6_0.txt`
**File:** `MPA_Platform_Taxonomy_LinkedIn_v6_0.txt`

### 6.4 Behavioral Attributes Reference KB
**File:** `MPA_Behavioral_Attributes_Reference_v6_0.txt`
**Content:** All behavioral signals with platform availability

### 6.5 Contextual Attributes Reference KB
**File:** `MPA_Contextual_Attributes_Reference_v6_0.txt`
**Content:** All contextual signals with IAB mappings

---

## EXECUTION INSTRUCTIONS

### Phase 1: Geographic Data (Priority: HIGHEST)
1. Web search for current census data for each country
2. Create CSV files with verified data
3. Create KB documents for top markets

### Phase 2: Taxonomy Data
4. Web search for current IAB taxonomy
5. Web search for Google/Meta/LinkedIn targeting options
6. Create CSV files with verified data
7. Create KB documents

### Phase 3: Behavioral & Contextual
8. Compile behavioral signals from platform docs
9. Compile contextual signals and IAB mappings
10. Create CSV and KB files

### Phase 4: Validation & Commit
11. Verify all CSV files load correctly
12. Verify KB documents are 6-Rule compliant
13. Git add, commit with detailed message
14. Push to feature branch

---

## COMMIT MESSAGE FORMAT

```
MPA v6.0: Add regional reference data for offline fallback

GEOGRAPHIC DATA:
- US: Top 100 DMAs with ACS 2023 demographics
- CA: 35 CMAs with StatCan 2021 data
- UK: 15 ITV Regions with ONS 2021 data
- MX: 30 Zonas Metropolitanas
- AU: 8 GCCSAs
- EU: DE/FR/ES/IT regional data
- LATAM: CL/BR regional data

TAXONOMY DATA:
- IAB Content Taxonomy 3.0 (~700 codes)
- Google Affinity/In-Market (~400 segments)
- Meta Interests/Behaviors (~500 segments)
- LinkedIn B2B targeting (~300 options)

BEHAVIORAL/CONTEXTUAL:
- Behavioral attributes (~200 signals)
- Contextual attributes (~150 signals)

KB DOCUMENTS:
- Regional geography references (6 files)
- Platform taxonomy references (3 files)
- Behavioral/Contextual references (2 files)

Enables offline operation for air-gapped environments
```

---

## SUCCESS CRITERIA

| Data Type | Target Records | Files |
|-----------|----------------|-------|
| US DMAs | 100 | 1 CSV + 1 KB |
| Canada CMAs | 35 | 1 CSV |
| UK Regions | 27 | 1 CSV |
| Other Countries | 150+ | 7 CSV |
| IAB Taxonomy | 700+ | 1 CSV + 1 KB |
| Google Segments | 400+ | 1 CSV + 1 KB |
| Meta Segments | 500+ | 1 CSV + 1 KB |
| LinkedIn Options | 300+ | 1 CSV + 1 KB |
| Behavioral Signals | 200+ | 1 CSV + 1 KB |
| Contextual Signals | 150+ | 1 CSV + 1 KB |

**Total:** ~15 CSV files + ~12 KB documents
