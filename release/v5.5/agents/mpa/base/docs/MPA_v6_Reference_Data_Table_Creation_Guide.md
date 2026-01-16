# MPA v6.0 Reference Data - Dataverse Table Creation Guide

This guide provides step-by-step instructions for creating the 5 new reference data tables introduced in MPA v6.0.

## Overview

The v6.0 reference data tables enhance MPA's targeting and planning capabilities:

| Table | Purpose | Est. Records |
|-------|---------|--------------|
| mpa_geography | Geographic regions with demographics | ~2,500 |
| mpa_iab_taxonomy | IAB Content Taxonomy 3.0 codes | ~700 |
| mpa_platform_taxonomy | Google/Meta/LinkedIn audience segments | ~1,200 |
| mpa_behavioral_attribute | Behavioral targeting signals | ~200 |
| mpa_contextual_attribute | Contextual targeting signals | ~150 |

**Estimated Time:** 45-60 minutes for all 5 tables

## Prerequisites

1. Access to Power Apps (make.powerapps.com)
2. Environment with MPA solution deployed
3. Publisher prefix: `mpa`
4. Solution: `MediaPlanningAgent` (v5.5 or later)

## Table Creation Order

All 5 tables are independent with no lookup dependencies. Create in any order.

---

## Table 1: mpa_geography

Geographic reference data supporting US DMAs, Canada CMAs, UK ITV regions, and more.

### Table Properties
- **Display Name:** Geography
- **Plural Name:** Geographies
- **Schema Name:** mpa_geography
- **Primary Column:** mpa_geoname (Geographic Name)
- **Ownership:** Organization

### Columns

| Display Name | Schema Name | Type | Length | Required | Notes |
|-------------|-------------|------|--------|----------|-------|
| Geo ID | mpa_geoid | Text | 50 | Yes | Unique (e.g., US-DMA-501) |
| Country | mpa_country | Text | 10 | Yes | ISO code (US, CA, UK) |
| Geo Type | mpa_geotype | Text | 20 | Yes | DMA, CMA, ITVR, NATIONAL |
| Geo Code | mpa_geocode | Text | 20 | Yes | Nielsen/Census code |
| Geographic Name | mpa_geoname | Text | 200 | Yes | Primary column |
| Geo Rank | mpa_georank | Whole Number | - | No | Market size ranking |
| Total Population | mpa_totalpopulation | Whole Number | - | No | Census population |
| Total Households | mpa_totalhouseholds | Whole Number | - | No | Census households |
| Median Age | mpa_medianage | Decimal | - | No | Years |
| Median HHI | mpa_medianhhi | Decimal | - | No | USD/local currency |
| Pct Male | mpa_pctmale | Decimal | - | No | 0-100 |
| Pct Female | mpa_pctfemale | Decimal | - | No | 0-100 |
| Pct Age 0-17 | mpa_pctage0to17 | Decimal | - | No | 0-100 |
| Pct Age 18-34 | mpa_pctage18to34 | Decimal | - | No | 0-100 |
| Pct Age 25-54 | mpa_pctage25to54 | Decimal | - | No | 0-100 |
| Pct Age 55+ | mpa_pctage55plus | Decimal | - | No | 0-100 |
| Pct HHI Under 50k | mpa_pcthhiunder50k | Decimal | - | No | 0-100 |
| Pct HHI 50k-100k | mpa_pcthhi50kto100k | Decimal | - | No | 0-100 |
| Pct HHI Over 100k | mpa_pcthhiover100k | Decimal | - | No | 0-100 |
| Pct HHI Over 150k | mpa_pcthhiover150k | Decimal | - | No | 0-100 |
| Pct College Degree | mpa_pctcollegedegree | Decimal | - | No | 0-100 |
| Pct Graduate Degree | mpa_pctgraduatedegree | Decimal | - | No | 0-100 |
| State Primary | mpa_stateprimary | Text | 50 | No | Primary state |
| States Included | mpa_statesincluded | Text | 500 | No | Comma-separated |
| Data Source | mpa_datasource | Text | 100 | No | Census, Nielsen |
| Data Year | mpa_datayear | Whole Number | - | No | e.g., 2023 |
| Is Active | mpa_isactive | Yes/No | - | Yes | Default: Yes |

### Indexes
1. `idx_geo_id` on mpa_geoid (Unique)
2. `idx_geo_country` on mpa_country
3. `idx_geo_type` on mpa_geotype
4. `idx_geo_country_type` on mpa_country, mpa_geotype

---

## Table 2: mpa_iab_taxonomy

IAB Content Taxonomy 3.0 codes for contextual targeting.

### Table Properties
- **Display Name:** IAB Taxonomy
- **Plural Name:** IAB Taxonomies
- **Schema Name:** mpa_iab_taxonomy
- **Primary Column:** mpa_iabname (IAB Name)
- **Ownership:** Organization

### Columns

| Display Name | Schema Name | Type | Length | Required | Notes |
|-------------|-------------|------|--------|----------|-------|
| IAB ID | mpa_iabid | Text | 50 | Yes | Unique (IAB1, IAB1-1) |
| IAB Code | mpa_iabcode | Text | 20 | Yes | Numeric code (1, 1-1) |
| IAB Name | mpa_iabname | Text | 200 | Yes | Primary column |
| IAB Tier | mpa_iabtier | Whole Number | - | Yes | 1, 2, or 3 |
| IAB Parent Code | mpa_iabparentcode | Text | 20 | No | Parent code (null for Tier 1) |
| IAB Description | mpa_iabdescription | Multiline Text | 1000 | No | |
| Vertical Relevance | mpa_verticalrelevance | Text | 500 | No | Comma-separated verticals |
| Contextual Signal Strength | mpa_contextualsignalstrength | Text | 20 | No | HIGH, MEDIUM, LOW |
| Is Active | mpa_isactive | Yes/No | - | Yes | Default: Yes |

### Indexes
1. `idx_iab_id` on mpa_iabid (Unique)
2. `idx_iab_code` on mpa_iabcode
3. `idx_iab_tier` on mpa_iabtier
4. `idx_iab_parent` on mpa_iabparentcode

---

## Table 3: mpa_platform_taxonomy

Platform-specific audience taxonomy segments.

### Table Properties
- **Display Name:** Platform Taxonomy
- **Plural Name:** Platform Taxonomies
- **Schema Name:** mpa_platform_taxonomy
- **Primary Column:** mpa_segmentname (Segment Name)
- **Ownership:** Organization

### Columns

| Display Name | Schema Name | Type | Length | Required | Notes |
|-------------|-------------|------|--------|----------|-------|
| Segment ID | mpa_segmentid | Text | 100 | Yes | Unique (GOOGLE-AFF-001) |
| Platform | mpa_platform | Text | 20 | Yes | GOOGLE, META, LINKEDIN |
| Taxonomy Type | mpa_taxonomytype | Text | 50 | Yes | AFFINITY, IN_MARKET, etc. |
| Segment Path | mpa_segmentpath | Text | 500 | Yes | Full hierarchy path |
| Segment Name | mpa_segmentname | Text | 200 | Yes | Primary column |
| Parent Path | mpa_parentpath | Text | 500 | No | Parent segment path |
| Tier | mpa_tier | Whole Number | - | Yes | 1, 2, or 3 |
| Vertical Relevance | mpa_verticalrelevance | Text | 500 | No | Comma-separated verticals |
| Reach Tier | mpa_reachtier | Text | 20 | No | HIGH, MEDIUM, LOW, NICHE |
| Last Verified | mpa_lastverified | Date and Time | - | No | Platform verification date |
| Is Active | mpa_isactive | Yes/No | - | Yes | Default: Yes |

### Indexes
1. `idx_platform_segmentid` on mpa_segmentid (Unique)
2. `idx_platform_platform` on mpa_platform
3. `idx_platform_type` on mpa_taxonomytype
4. `idx_platform_platform_type` on mpa_platform, mpa_taxonomytype
5. `idx_platform_tier` on mpa_platform, mpa_tier

---

## Table 4: mpa_behavioral_attribute

Behavioral targeting signals and attributes.

### Table Properties
- **Display Name:** Behavioral Attribute
- **Plural Name:** Behavioral Attributes
- **Schema Name:** mpa_behavioral_attribute
- **Primary Column:** mpa_behaviorname (Behavior Name)
- **Ownership:** Organization

### Columns

| Display Name | Schema Name | Type | Length | Required | Notes |
|-------------|-------------|------|--------|----------|-------|
| Behavior ID | mpa_behaviorid | Text | 50 | Yes | Unique (BEH-PURCH-001) |
| Behavior Category | mpa_behaviorcategory | Text | 50 | Yes | PURCHASE, BROWSING, etc. |
| Behavior Name | mpa_behaviorname | Text | 200 | Yes | Primary column |
| Behavior Description | mpa_behaviordescription | Multiline Text | 1000 | No | |
| Signal Type | mpa_signaltype | Text | 50 | Yes | FIRST_PARTY, THIRD_PARTY, etc. |
| Platforms Available | mpa_platformsavailable | Text | 200 | No | GOOGLE, META, LINKEDIN, DV360, TTD |
| Vertical Relevance | mpa_verticalrelevance | Text | 500 | No | Comma-separated verticals |
| Intent Level | mpa_intentlevel | Text | 20 | No | HIGH, MEDIUM, LOW, AWARENESS |
| Data Freshness | mpa_datafreshness | Text | 50 | No | REAL_TIME, DAILY, WEEKLY, etc. |
| Is Active | mpa_isactive | Yes/No | - | Yes | Default: Yes |

### Indexes
1. `idx_behavior_id` on mpa_behaviorid (Unique)
2. `idx_behavior_category` on mpa_behaviorcategory
3. `idx_behavior_signaltype` on mpa_signaltype
4. `idx_behavior_intentlevel` on mpa_intentlevel

---

## Table 5: mpa_contextual_attribute

Contextual targeting signals for content environment.

### Table Properties
- **Display Name:** Contextual Attribute
- **Plural Name:** Contextual Attributes
- **Schema Name:** mpa_contextual_attribute
- **Primary Column:** mpa_contextname (Context Name)
- **Ownership:** Organization

### Columns

| Display Name | Schema Name | Type | Length | Required | Notes |
|-------------|-------------|------|--------|----------|-------|
| Context ID | mpa_contextid | Text | 50 | Yes | Unique (CTX-CONTENT-001) |
| Context Category | mpa_contextcategory | Text | 50 | Yes | CONTENT, FORMAT, SENTIMENT, etc. |
| Context Name | mpa_contextname | Text | 200 | Yes | Primary column |
| Context Description | mpa_contextdescription | Multiline Text | 1000 | No | |
| IAB Mapping | mpa_iabmapping | Text | 100 | No | Mapped IAB codes |
| Signal Type | mpa_signaltype | Text | 50 | Yes | CONTENT_CATEGORY, PAGE_CONTEXT, etc. |
| Brand Safety Tier | mpa_brandsafetytier | Text | 20 | No | TIER_1_SAFE through TIER_4_AVOID |
| Vertical Relevance | mpa_verticalrelevance | Text | 500 | No | Comma-separated verticals |
| Is Active | mpa_isactive | Yes/No | - | Yes | Default: Yes |

### Indexes
1. `idx_context_id` on mpa_contextid (Unique)
2. `idx_context_category` on mpa_contextcategory
3. `idx_context_signaltype` on mpa_signaltype
4. `idx_context_brandsafety` on mpa_brandsafetytier
5. `idx_context_iabmapping` on mpa_iabmapping

---

## Step-by-Step Creation Instructions

### For Each Table:

1. **Navigate to Power Apps**
   - Go to make.powerapps.com
   - Select your environment
   - Go to Tables (under Dataverse)

2. **Create New Table**
   - Click "+ New table" > "New table (advanced)"
   - Enter Display name and Plural name
   - Set Primary column name as specified
   - Select "Organization" for Ownership
   - Click "Save"

3. **Add Columns**
   - Click "+ New column"
   - Enter Display name and Name (schema name)
   - Select Data type
   - Set Max length for text fields
   - Set Required if needed
   - Set Default value for Yes/No fields
   - Click "Save"

4. **Add to Solution**
   - Go to Solutions
   - Open MediaPlanningAgent solution
   - Click "Add existing" > "Table"
   - Select the new table
   - Include all objects

5. **Publish**
   - Click "Publish all customizations"

---

## Import Seed Data

After creating all tables, import seed data:

```bash
cd release/v5.5/scripts

# Dry run to validate
python seed_data_import_v6.py --dry-run

# Import all tables
python seed_data_import_v6.py

# Import specific table
python seed_data_import_v6.py --table geography

# Import specific file
python seed_data_import_v6.py --table geography --file us
```

### Seed Data Files

Located in `release/v5.5/agents/mpa/base/seed-data-v6/`:

| Table | Files | Records |
|-------|-------|---------|
| geography | mpa_geography_us_seed.csv (100 records), plus 9 region files (headers only) | 100+ |
| iab_taxonomy | mpa_iab_taxonomy_seed.csv | ~700 |
| platform_taxonomy | mpa_taxonomy_google_seed.csv, mpa_taxonomy_meta_seed.csv, mpa_taxonomy_linkedin_seed.csv | ~1,200 |
| behavioral_attribute | mpa_behavioral_attributes_seed.csv | ~200 |
| contextual_attribute | mpa_contextual_attributes_seed.csv | ~150 |

---

## Verification Checklist

After creation, verify:

- [ ] All 5 tables created with mpa_ prefix
- [ ] All columns have mpa_ prefix
- [ ] Unique indexes created for ID fields
- [ ] Default values set for Is Active fields
- [ ] Tables added to MediaPlanningAgent solution
- [ ] Solution published
- [ ] Seed data imported successfully
- [ ] Query test returns expected results

---

## Schema Files

JSON schema definitions are available at:
- `release/v5.5/agents/mpa/base/schema/tables/mpa_geography.json`
- `release/v5.5/agents/mpa/base/schema/tables/mpa_iab_taxonomy.json`
- `release/v5.5/agents/mpa/base/schema/tables/mpa_platform_taxonomy.json`
- `release/v5.5/agents/mpa/base/schema/tables/mpa_behavioral_attribute.json`
- `release/v5.5/agents/mpa/base/schema/tables/mpa_contextual_attribute.json`

Master schema:
- `release/v5.5/agents/mpa/base/schema/tables/MPA_v6.0_ReferenceData_Schema.json`
