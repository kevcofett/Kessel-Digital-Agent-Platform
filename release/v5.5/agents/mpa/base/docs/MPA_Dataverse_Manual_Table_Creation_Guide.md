# MPA Dataverse Manual Table Creation Guide

## Document Purpose

Step-by-step instructions for manually creating all MPA Dataverse tables in Power Apps. This ensures tables are created with the correct `mpa_` prefix inside a properly configured solution.

---

# PART 1: PREREQUISITES

## 1.1 Create Publisher

**Why:** The publisher determines the prefix for all tables and columns.

| Step | Action |
|------|--------|
| 1 | Go to make.powerapps.com |
| 2 | Select your environment: **Aragorn AI** |
| 3 | Click **Solutions** in left menu |
| 4 | Click **+ New solution** |
| 5 | At the bottom, click **+ New publisher** |

**Publisher Settings:**

| Field | Value |
|-------|-------|
| Display name | Media Planning Agent |
| Name | mediaplanning |
| Prefix | mpa |
| Choice value prefix | 10000 |

| Step | Action |
|------|--------|
| 6 | Click **Save** |

## 1.2 Create Solution

| Step | Action |
|------|--------|
| 1 | Still in **New solution** dialog |
| 2 | Fill in the fields below |
| 3 | Click **Create** |

**Solution Settings:**

| Field | Value |
|-------|-------|
| Display name | Media Planning Agent v5.2 |
| Name | MediaPlanningAgent |
| Publisher | Media Planning Agent (mpa) |
| Version | 5.2.0.0 |

## 1.3 Verify Setup

After creating the solution:

| Check | How to Verify |
|-------|---------------|
| Solution appears in list | You see "Media Planning Agent v5.2" |
| Publisher is correct | Click solution → Settings → Publisher shows "mpa" |

**CRITICAL:** All tables MUST be created from INSIDE this solution.

---

# PART 2: TABLE CREATION ORDER

Create tables in this order to handle dependencies:

| Order | Table | Display Name | Dependencies |
|-------|-------|--------------|--------------|
| 1 | mpa_vertical | Vertical | None |
| 2 | mpa_channel | Channel | None |
| 3 | mpa_kpi | KPI Definition | None |
| 4 | mpa_benchmark | Benchmark | None (text references) |
| 5 | mpa_mediaplan | Media Plan | None (client is text) |
| 6 | mpa_planversion | Plan Version | mpa_mediaplan |
| 7 | mpa_plandata | Plan Data | mpa_mediaplan, mpa_planversion |

---

# PART 3: TABLE SPECIFICATIONS

## How to Create Each Table

For each table:
1. Open your solution: **Media Planning Agent v5.2**
2. Click **+ New** → **Table** → **Table**
3. Fill in table properties
4. Click **Save**
5. Add columns one by one
6. Click **Save table** when done

---

## TABLE 1: mpa_vertical

**Purpose:** Industry verticals for benchmark categorization

### Table Properties

| Field | Value |
|-------|-------|
| Display name | Vertical |
| Plural name | Verticals |
| Description | Industry verticals for benchmark categorization |
| Primary column display name | Vertical Name |
| Primary column description | Name of the industry vertical |

### Columns to Add

After creating the table, add these columns:

**Column 1: Vertical Code**

| Field | Value |
|-------|-------|
| Display name | Vertical Code |
| Name | (auto: mpa_verticalcode) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 50 |
| Required | Business required |

**Column 2: Description**

| Field | Value |
|-------|-------|
| Display name | Description |
| Name | (auto: mpa_description) |
| Data type | Multiple lines of text |
| Maximum character count | 2000 |
| Required | Optional |

**Column 3: Is Active**

| Field | Value |
|-------|-------|
| Display name | Is Active |
| Name | (auto: mpa_isactive) |
| Data type | Yes/No |
| Default value | Yes |
| Required | Business required |

**Column 4: Display Order**

| Field | Value |
|-------|-------|
| Display name | Display Order |
| Name | (auto: mpa_displayorder) |
| Data type | Whole number |
| Format | None |
| Minimum value | 0 |
| Maximum value | 1000 |
| Required | Optional |

---

## TABLE 2: mpa_channel

**Purpose:** Advertising channels for media planning

### Table Properties

| Field | Value |
|-------|-------|
| Display name | Channel |
| Plural name | Channels |
| Description | Advertising channels for media planning |
| Primary column display name | Channel Name |
| Primary column description | Name of the advertising channel |

### Columns to Add

**Column 1: Channel Code**

| Field | Value |
|-------|-------|
| Display name | Channel Code |
| Name | (auto: mpa_channelcode) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 50 |
| Required | Business required |

**Column 2: Category**

| Field | Value |
|-------|-------|
| Display name | Category |
| Name | (auto: mpa_category) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Business required |

**Choice Values:**

| Label | Value |
|-------|-------|
| Digital | 100000000 |
| Traditional | 100000001 |
| Emerging | 100000002 |

**Column 3: Description**

| Field | Value |
|-------|-------|
| Display name | Description |
| Name | (auto: mpa_description) |
| Data type | Multiple lines of text |
| Maximum character count | 4000 |
| Required | Optional |

**Column 4: Typical CPM Low**

| Field | Value |
|-------|-------|
| Display name | Typical CPM Low |
| Name | (auto: mpa_typicalcpmlow) |
| Data type | Currency |
| Precision | 2 |
| Minimum value | 0 |
| Required | Optional |

**Column 5: Typical CPM High**

| Field | Value |
|-------|-------|
| Display name | Typical CPM High |
| Name | (auto: mpa_typicalcpmhigh) |
| Data type | Currency |
| Precision | 2 |
| Minimum value | 0 |
| Required | Optional |

**Column 6: Is Active**

| Field | Value |
|-------|-------|
| Display name | Is Active |
| Name | (auto: mpa_isactive) |
| Data type | Yes/No |
| Default value | Yes |
| Required | Business required |

**Column 7: Display Order**

| Field | Value |
|-------|-------|
| Display name | Display Order |
| Name | (auto: mpa_displayorder) |
| Data type | Whole number |
| Format | None |
| Minimum value | 0 |
| Maximum value | 1000 |
| Required | Optional |

---

## TABLE 3: mpa_kpi

**Purpose:** KPI definitions with formulas and interpretation

### Table Properties

| Field | Value |
|-------|-------|
| Display name | KPI Definition |
| Plural name | KPI Definitions |
| Description | KPI definitions with formulas and interpretation guidance |
| Primary column display name | KPI Name |
| Primary column description | Full name of the KPI |

### Columns to Add

**Column 1: KPI Code**

| Field | Value |
|-------|-------|
| Display name | KPI Code |
| Name | (auto: mpa_kpicode) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 20 |
| Required | Business required |

**Column 2: Category**

| Field | Value |
|-------|-------|
| Display name | Category |
| Name | (auto: mpa_category) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Business required |

**Choice Values:**

| Label | Value |
|-------|-------|
| Cost | 100000000 |
| Engagement | 100000001 |
| Conversion | 100000002 |
| Efficiency | 100000003 |
| Quality | 100000004 |

**Column 3: Formula**

| Field | Value |
|-------|-------|
| Display name | Formula |
| Name | (auto: mpa_formula) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 500 |
| Required | Business required |

**Column 4: Formula Inputs**

| Field | Value |
|-------|-------|
| Display name | Formula Inputs |
| Name | (auto: mpa_formulainputs) |
| Data type | Multiple lines of text |
| Format | Text |
| Maximum character count | 2000 |
| Required | Optional |

**Column 5: Unit**

| Field | Value |
|-------|-------|
| Display name | Unit |
| Name | (auto: mpa_unit) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 20 |
| Required | Business required |

**Column 6: Format Pattern**

| Field | Value |
|-------|-------|
| Display name | Format Pattern |
| Name | (auto: mpa_formatpattern) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 50 |
| Required | Optional |

**Column 7: Direction**

| Field | Value |
|-------|-------|
| Display name | Direction |
| Name | (auto: mpa_direction) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Business required |

**Choice Values:**

| Label | Value |
|-------|-------|
| Higher is Better | 100000000 |
| Lower is Better | 100000001 |
| Target Range | 100000002 |

**Column 8: Description**

| Field | Value |
|-------|-------|
| Display name | Description |
| Name | (auto: mpa_description) |
| Data type | Multiple lines of text |
| Maximum character count | 4000 |
| Required | Optional |

**Column 9: Interpretation Guide**

| Field | Value |
|-------|-------|
| Display name | Interpretation Guide |
| Name | (auto: mpa_interpretationguide) |
| Data type | Multiple lines of text |
| Maximum character count | 10000 |
| Required | Optional |

**Column 10: Is Active**

| Field | Value |
|-------|-------|
| Display name | Is Active |
| Name | (auto: mpa_isactive) |
| Data type | Yes/No |
| Default value | Yes |
| Required | Business required |

---

## TABLE 4: mpa_benchmark

**Purpose:** Industry benchmark data for performance comparison

### Table Properties

| Field | Value |
|-------|-------|
| Display name | Benchmark |
| Plural name | Benchmarks |
| Description | Industry benchmark data for performance comparison |
| Primary column display name | Metric Name |
| Primary column description | Name of the metric being benchmarked |

### Columns to Add

**Column 1: Vertical**

| Field | Value |
|-------|-------|
| Display name | Vertical |
| Name | (auto: mpa_vertical) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 100 |
| Required | Business required |

**Column 2: Channel**

| Field | Value |
|-------|-------|
| Display name | Channel |
| Name | (auto: mpa_channel) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 100 |
| Required | Optional |

**Column 3: Metric Type**

| Field | Value |
|-------|-------|
| Display name | Metric Type |
| Name | (auto: mpa_metrictype) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Business required |

**Choice Values:**

| Label | Value |
|-------|-------|
| CPM | 100000000 |
| CPC | 100000001 |
| CTR | 100000002 |
| CVR | 100000003 |
| CPA | 100000004 |
| ROAS | 100000005 |
| Viewability | 100000006 |
| VCR | 100000007 |
| Completion Rate | 100000008 |

**Column 4: Benchmark Low**

| Field | Value |
|-------|-------|
| Display name | Benchmark Low |
| Name | (auto: mpa_benchmarklow) |
| Data type | Decimal number |
| Precision | 6 |
| Minimum value | 0 |
| Required | Business required |

**Column 5: Benchmark Median**

| Field | Value |
|-------|-------|
| Display name | Benchmark Median |
| Name | (auto: mpa_benchmarkmedian) |
| Data type | Decimal number |
| Precision | 6 |
| Minimum value | 0 |
| Required | Business required |

**Column 6: Benchmark High**

| Field | Value |
|-------|-------|
| Display name | Benchmark High |
| Name | (auto: mpa_benchmarkhigh) |
| Data type | Decimal number |
| Precision | 6 |
| Minimum value | 0 |
| Required | Business required |

**Column 7: Benchmark Best In Class**

| Field | Value |
|-------|-------|
| Display name | Benchmark Best In Class |
| Name | (auto: mpa_benchmarkbestinclass) |
| Data type | Decimal number |
| Precision | 6 |
| Minimum value | 0 |
| Required | Optional |

**Column 8: Data Source**

| Field | Value |
|-------|-------|
| Display name | Data Source |
| Name | (auto: mpa_datasource) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 200 |
| Required | Business required |

**Column 9: Data Period**

| Field | Value |
|-------|-------|
| Display name | Data Period |
| Name | (auto: mpa_dataperiod) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 50 |
| Required | Business required |

**Column 10: Confidence**

| Field | Value |
|-------|-------|
| Display name | Confidence |
| Name | (auto: mpa_confidence) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Business required |

**Choice Values:**

| Label | Value |
|-------|-------|
| High | 100000000 |
| Medium | 100000001 |
| Low | 100000002 |

**Column 11: Sample Size**

| Field | Value |
|-------|-------|
| Display name | Sample Size |
| Name | (auto: mpa_samplesize) |
| Data type | Whole number |
| Format | None |
| Minimum value | 0 |
| Required | Optional |

**Column 12: Is Active**

| Field | Value |
|-------|-------|
| Display name | Is Active |
| Name | (auto: mpa_isactive) |
| Data type | Yes/No |
| Default value | Yes |
| Required | Business required |

**Column 13: Last Validated At**

| Field | Value |
|-------|-------|
| Display name | Last Validated At |
| Name | (auto: mpa_lastvalidatedat) |
| Data type | Date only |
| Required | Optional |

---

## TABLE 5: mpa_mediaplan

**Purpose:** Core media plan records

### Table Properties

| Field | Value |
|-------|-------|
| Display name | Media Plan |
| Plural name | Media Plans |
| Description | Core media plan records |
| Primary column display name | Campaign Name |
| Primary column description | Name of the campaign |

### Columns to Add

**Column 1: Plan Code**

| Field | Value |
|-------|-------|
| Display name | Plan Code |
| Name | (auto: mpa_plancode) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 20 |
| Required | Business required |

**Column 2: Client ID**

| Field | Value |
|-------|-------|
| Display name | Client ID |
| Name | (auto: mpa_clientid) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 100 |
| Required | Business required |

**Column 3: Status**

| Field | Value |
|-------|-------|
| Display name | Status |
| Name | (auto: mpa_status) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Business required |
| Default value | Draft |

**Choice Values:**

| Label | Value |
|-------|-------|
| Draft | 100000000 |
| In Progress | 100000001 |
| Pending Approval | 100000002 |
| Approved | 100000003 |
| Active | 100000004 |
| Paused | 100000005 |
| Completed | 100000006 |
| Archived | 100000007 |

**Column 4: Lifecycle Mode**

| Field | Value |
|-------|-------|
| Display name | Lifecycle Mode |
| Name | (auto: mpa_lifecyclemode) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Business required |
| Default value | Planning |

**Choice Values:**

| Label | Value |
|-------|-------|
| Planning | 100000000 |
| InFlight | 100000001 |
| PostMortem | 100000002 |
| Archived | 100000003 |

**Column 5: Pathway**

| Field | Value |
|-------|-------|
| Display name | Pathway |
| Name | (auto: mpa_pathway) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Business required |
| Default value | GUIDED |

**Choice Values:**

| Label | Value |
|-------|-------|
| STANDARD | 100000001 |
| GUIDED | 100000002 |
| AUDIT | 100000003 |

**Column 6: Current Step**

| Field | Value |
|-------|-------|
| Display name | Current Step |
| Name | (auto: mpa_currentstep) |
| Data type | Whole number |
| Format | None |
| Minimum value | 1 |
| Maximum value | 10 |
| Default value | 1 |
| Required | Business required |

**Column 7: Current Gate**

| Field | Value |
|-------|-------|
| Display name | Current Gate |
| Name | (auto: mpa_currentgate) |
| Data type | Whole number |
| Format | None |
| Minimum value | 0 |
| Maximum value | 4 |
| Default value | 0 |
| Required | Optional |

**Column 8: Total Budget**

| Field | Value |
|-------|-------|
| Display name | Total Budget |
| Name | (auto: mpa_totalbudget) |
| Data type | Currency |
| Precision | 2 |
| Minimum value | 0 |
| Required | Optional |

**Column 9: Start Date**

| Field | Value |
|-------|-------|
| Display name | Start Date |
| Name | (auto: mpa_startdate) |
| Data type | Date only |
| Required | Optional |

**Column 10: End Date**

| Field | Value |
|-------|-------|
| Display name | End Date |
| Name | (auto: mpa_enddate) |
| Data type | Date only |
| Required | Optional |

**Column 11: Primary Objective**

| Field | Value |
|-------|-------|
| Display name | Primary Objective |
| Name | (auto: mpa_primaryobjective) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 200 |
| Required | Optional |

**Column 12: Steps Completed**

| Field | Value |
|-------|-------|
| Display name | Steps Completed |
| Name | (auto: mpa_stepscompleted) |
| Data type | Multiple lines of text |
| Format | Text |
| Maximum character count | 500 |
| Required | Optional |

**Column 13: Gates Passed**

| Field | Value |
|-------|-------|
| Display name | Gates Passed |
| Name | (auto: mpa_gatespassed) |
| Data type | Multiple lines of text |
| Format | Text |
| Maximum character count | 200 |
| Required | Optional |

**Column 14: Created By**

| Field | Value |
|-------|-------|
| Display name | Created By |
| Name | (auto: mpa_createdby) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 100 |
| Required | Optional |

**Column 15: Owned By**

| Field | Value |
|-------|-------|
| Display name | Owned By |
| Name | (auto: mpa_ownedby) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 100 |
| Required | Optional |

**Column 16: Created At**

| Field | Value |
|-------|-------|
| Display name | Created At |
| Name | (auto: mpa_createdat) |
| Data type | Date and time |
| Required | Optional |

**Column 17: Updated At**

| Field | Value |
|-------|-------|
| Display name | Updated At |
| Name | (auto: mpa_updatedat) |
| Data type | Date and time |
| Required | Optional |

---

## TABLE 6: mpa_planversion

**Purpose:** Version history for media plans

### Table Properties

| Field | Value |
|-------|-------|
| Display name | Plan Version |
| Plural name | Plan Versions |
| Description | Version history for media plans |
| Primary column display name | Version Name |
| Primary column description | Optional name for this version |

### Columns to Add

**Column 1: Media Plan (Lookup)**

| Field | Value |
|-------|-------|
| Display name | Media Plan |
| Name | (auto: mpa_mediaplan) |
| Data type | Lookup |
| Related table | Media Plan |
| Required | Business required |

**Column 2: Version Number**

| Field | Value |
|-------|-------|
| Display name | Version Number |
| Name | (auto: mpa_versionnumber) |
| Data type | Whole number |
| Format | None |
| Minimum value | 1 |
| Required | Business required |

**Column 3: Version Type**

| Field | Value |
|-------|-------|
| Display name | Version Type |
| Name | (auto: mpa_versiontype) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Business required |

**Choice Values:**

| Label | Value |
|-------|-------|
| Initial | 100000000 |
| Revision | 100000001 |
| Optimization | 100000002 |
| Correction | 100000003 |

**Column 4: Is Current**

| Field | Value |
|-------|-------|
| Display name | Is Current |
| Name | (auto: mpa_iscurrent) |
| Data type | Yes/No |
| Default value | No |
| Required | Business required |

**Column 5: Change Summary**

| Field | Value |
|-------|-------|
| Display name | Change Summary |
| Name | (auto: mpa_changesummary) |
| Data type | Multiple lines of text |
| Maximum character count | 10000 |
| Required | Optional |

**Column 6: Snapshot Data**

| Field | Value |
|-------|-------|
| Display name | Snapshot Data |
| Name | (auto: mpa_snapshotdata) |
| Data type | Multiple lines of text |
| Maximum character count | 1048576 |
| Required | Optional |

**Column 7: Created By**

| Field | Value |
|-------|-------|
| Display name | Created By |
| Name | (auto: mpa_createdby) |
| Data type | Single line of text |
| Format | Text |
| Maximum character count | 100 |
| Required | Optional |

**Column 8: Created At**

| Field | Value |
|-------|-------|
| Display name | Created At |
| Name | (auto: mpa_createdat) |
| Data type | Date and time |
| Required | Optional |

---

## TABLE 7: mpa_plandata

**Purpose:** Detailed plan data organized by section/step

### Table Properties

| Field | Value |
|-------|-------|
| Display name | Plan Data |
| Plural name | Plan Data |
| Description | Detailed plan data organized by section/step |
| Primary column display name | Section Label |
| Primary column description | Label for this section |

### Columns to Add

**Column 1: Media Plan (Lookup)**

| Field | Value |
|-------|-------|
| Display name | Media Plan |
| Name | (auto: mpa_mediaplan) |
| Data type | Lookup |
| Related table | Media Plan |
| Required | Business required |

**Column 2: Plan Version (Lookup)**

| Field | Value |
|-------|-------|
| Display name | Plan Version |
| Name | (auto: mpa_planversion) |
| Data type | Lookup |
| Related table | Plan Version |
| Required | Business required |

**Column 3: Section Type**

| Field | Value |
|-------|-------|
| Display name | Section Type |
| Name | (auto: mpa_sectiontype) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Business required |

**Choice Values:**

| Label | Value |
|-------|-------|
| ClientContext | 100000000 |
| Objectives | 100000001 |
| Budget | 100000002 |
| Timeline | 100000003 |
| Audience | 100000004 |
| Channels | 100000005 |
| Partners | 100000006 |
| Measurement | 100000007 |
| Optimization | 100000008 |
| Compliance | 100000009 |
| Summary | 100000010 |

**Column 4: Step Number**

| Field | Value |
|-------|-------|
| Display name | Step Number |
| Name | (auto: mpa_stepnumber) |
| Data type | Whole number |
| Format | None |
| Minimum value | 1 |
| Maximum value | 10 |
| Required | Business required |

**Column 5: Section Data**

| Field | Value |
|-------|-------|
| Display name | Section Data |
| Name | (auto: mpa_sectiondata) |
| Data type | Multiple lines of text |
| Maximum character count | 1048576 |
| Required | Optional |

**Column 6: Section Status**

| Field | Value |
|-------|-------|
| Display name | Section Status |
| Name | (auto: mpa_sectionstatus) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Business required |
| Default value | Not Started |

**Choice Values:**

| Label | Value |
|-------|-------|
| Not Started | 100000000 |
| In Progress | 100000001 |
| Complete | 100000002 |
| Needs Review | 100000003 |

**Column 7: Validation Status**

| Field | Value |
|-------|-------|
| Display name | Validation Status |
| Name | (auto: mpa_validationstatus) |
| Data type | Choice |
| Sync with global choice | No (create new) |
| Required | Optional |

**Choice Values:**

| Label | Value |
|-------|-------|
| Not Validated | 100000000 |
| Valid | 100000001 |
| Invalid | 100000002 |
| Warning | 100000003 |

**Column 8: Data Sources**

| Field | Value |
|-------|-------|
| Display name | Data Sources |
| Name | (auto: mpa_datasources) |
| Data type | Multiple lines of text |
| Maximum character count | 10000 |
| Required | Optional |

**Column 9: Created At**

| Field | Value |
|-------|-------|
| Display name | Created At |
| Name | (auto: mpa_createdat) |
| Data type | Date and time |
| Required | Optional |

**Column 10: Updated At**

| Field | Value |
|-------|-------|
| Display name | Updated At |
| Name | (auto: mpa_updatedat) |
| Data type | Date and time |
| Required | Optional |

---

# PART 4: VERIFICATION CHECKLIST

After creating all tables, verify:

## Table Existence Check

| Table | Created | Has Columns | Verified |
|-------|---------|-------------|----------|
| mpa_vertical | ☐ | ☐ | ☐ |
| mpa_channel | ☐ | ☐ | ☐ |
| mpa_kpi | ☐ | ☐ | ☐ |
| mpa_benchmark | ☐ | ☐ | ☐ |
| mpa_mediaplan | ☐ | ☐ | ☐ |
| mpa_planversion | ☐ | ☐ | ☐ |
| mpa_plandata | ☐ | ☐ | ☐ |

## Prefix Verification

For each table, verify the schema name starts with `mpa_`:

| Check | How to Verify |
|-------|---------------|
| Table schema name | Click table → Properties → Schema name shows `mpa_tablename` |
| Column schema names | Click column → Properties → Schema name shows `mpa_columnname` |

## Relationship Verification

| Relationship | From Table | To Table | Verified |
|--------------|------------|----------|----------|
| Media Plan lookup | mpa_planversion | mpa_mediaplan | ☐ |
| Media Plan lookup | mpa_plandata | mpa_mediaplan | ☐ |
| Plan Version lookup | mpa_plandata | mpa_planversion | ☐ |

---

# PART 5: NEXT STEPS

After tables are created:

1. **Run seed data import** - Use the VS Code script to import CSV data
2. **Verify data** - Query tables to confirm data imported correctly
3. **Build flows** - Create Power Automate flows that reference these tables
4. **Test flows** - Use test payloads to verify flows work with real data

---

# APPENDIX A: ESTIMATED TIME

| Task | Estimated Time |
|------|----------------|
| Create Publisher | 5 minutes |
| Create Solution | 5 minutes |
| Table 1: mpa_vertical | 10 minutes |
| Table 2: mpa_channel | 15 minutes |
| Table 3: mpa_kpi | 20 minutes |
| Table 4: mpa_benchmark | 25 minutes |
| Table 5: mpa_mediaplan | 30 minutes |
| Table 6: mpa_planversion | 15 minutes |
| Table 7: mpa_plandata | 20 minutes |
| Verification | 15 minutes |
| **TOTAL** | **~2.5 hours** |

---

# APPENDIX B: COMMON ISSUES

## "Prefix is not available"

The `mpa` prefix may already be in use by another publisher in the environment.

**Solution:** Check existing publishers or use a different prefix like `mpa2`.

## "Table name already exists"

A table with that display name exists.

**Solution:** Use a unique display name or check if the table already exists.

## "Cannot create lookup - related table not found"

You're trying to create a lookup before the related table exists.

**Solution:** Create tables in the order specified (Part 2).

## Choice values not saving

Browser cache issue.

**Solution:** Save the column, refresh the page, re-open the column to verify values saved.

---

*Document Version: 1.0*
*Created: January 2, 2026*
*For: MPA v5.2 Dataverse Schema Deployment*
