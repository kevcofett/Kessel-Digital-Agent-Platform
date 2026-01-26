# Dataverse Tables Creation Checklist

Quick reference for creating MPA tables in Power Apps.

**Full guide:** `release/v5.5/agents/mpa/base/docs/MPA_Dataverse_Manual_Table_Creation_Guide.md`

---

## Prerequisites

- [ ] **Create Publisher**
  - Display name: `Media Planning Agent`
  - Name: `mediaplanning`
  - Prefix: `mpa`
  - Choice value prefix: `10000`

- [ ] **Create Solution**
  - Display name: `Media Planning Agent v5.2`
  - Name: `MediaPlanningAgent`
  - Publisher: `Media Planning Agent (mpa)`
  - Version: `5.2.0.0`

---

## Table Creation Order

| # | Table | Columns | Dependencies |
|---|-------|---------|--------------|
| 1 | mpa_vertical | 4 | None |
| 2 | mpa_channel | 8 | None |
| 3 | mpa_kpi | 11 | None |
| 4 | mpa_benchmark | 14 | None |
| 5 | mpa_mediaplan | 18 | None |
| 6 | mpa_planversion | 8 | mpa_mediaplan |
| 7 | mpa_plandata | 11 | mpa_mediaplan, mpa_planversion |

---

## Table 1: mpa_vertical

- [ ] Create table: Display name `Vertical`, Primary column `Vertical Name`

| Column | Type | Required |
|--------|------|----------|
| mpa_verticalcode | Text (50) | Yes |
| mpa_description | Multi-line text | No |
| mpa_isactive | Yes/No (default: Yes) | No |

---

## Table 2: mpa_channel

- [ ] Create table: Display name `Channel`, Primary column `Channel Name`

| Column | Type | Required |
|--------|------|----------|
| mpa_channelcode | Text (50) | Yes |
| mpa_category | Choice (Digital/Traditional/Emerging) | No |
| mpa_cpmlow | Currency | No |
| mpa_cpmhigh | Currency | No |
| mpa_minbudget | Currency | No |
| mpa_funnelstage | Text (50) | No |
| mpa_isactive | Yes/No (default: Yes) | No |

**Choice values for mpa_category:**
- 100000000 = Digital
- 100000001 = Traditional
- 100000002 = Emerging

---

## Table 3: mpa_kpi

- [ ] Create table: Display name `KPI Definition`, Primary column `KPI Name`

| Column | Type | Required |
|--------|------|----------|
| mpa_kpicode | Text (100) | Yes |
| mpa_category | Choice (5 values) | No |
| mpa_formula | Text (1000) | No |
| mpa_formulainputs | Text (500) | No |
| mpa_unit | Text (50) | No |
| mpa_format | Text (50) | No |
| mpa_direction | Choice (3 values) | No |
| mpa_description | Multi-line text | No |
| mpa_interpretationguide | Multi-line text | No |
| mpa_isactive | Yes/No (default: Yes) | No |

**Choice values for mpa_category:**
- 100000000 = Cost
- 100000001 = Engagement
- 100000002 = Conversion
- 100000003 = Efficiency
- 100000004 = Quality

**Choice values for mpa_direction:**
- 100000000 = Higher is Better
- 100000001 = Lower is Better
- 100000002 = Target Range

---

## Table 4: mpa_benchmark

- [ ] Create table: Display name `Benchmark`, Primary column `Metric Name`

| Column | Type | Required |
|--------|------|----------|
| mpa_vertical | Lookup (mpa_vertical) | No |
| mpa_channel | Lookup (mpa_channel) | No |
| mpa_kpi | Lookup (mpa_kpi) | No |
| mpa_metriclow | Decimal (6 precision) | No |
| mpa_metricmedian | Decimal (6 precision) | No |
| mpa_metrichigh | Decimal (6 precision) | No |
| mpa_metricbest | Decimal (6 precision) | No |
| mpa_datasource | Text (200) | No |
| mpa_dataperiod | Text (50) | No |
| mpa_confidencelevel | Choice (High/Medium/Low) | No |
| mpa_samplesize | Whole number | No |
| mpa_isactive | Yes/No (default: Yes) | No |
| mpa_lastvalidatedat | Date/Time | No |

---

## Table 5: mpa_mediaplan

- [ ] Create table: Display name `Media Plan`, Primary column `Campaign Name`

| Column | Type | Required |
|--------|------|----------|
| mpa_plancode | Text (50) | Yes |
| mpa_clientid | Text (50) | No |
| mpa_status | Choice (8 values) | No |
| mpa_lifecyclemode | Choice (4 values) | No |
| mpa_pathway | Choice (3 values, default: GUIDED) | No |
| mpa_currentstep | Whole number (1-10) | No |
| mpa_currentgate | Whole number (1-4) | No |
| mpa_totalbudget | Currency | No |
| mpa_startdate | Date Only | No |
| mpa_enddate | Date Only | No |
| mpa_primaryobjective | Multi-line text | No |
| mpa_stepscompleted | Multi-line text | No |
| mpa_gatespassed | Multi-line text | No |
| mpa_createdby | Text (200) | No |
| mpa_ownedby | Text (200) | No |
| mpa_createdat | Date/Time | No |
| mpa_updatedat | Date/Time | No |

**Choice values for mpa_status:**
- 100000000 = Draft
- 100000001 = In Progress
- 100000002 = Pending Approval
- 100000003 = Approved
- 100000004 = Active
- 100000005 = Paused
- 100000006 = Completed
- 100000007 = Archived

**Choice values for mpa_lifecyclemode:**
- 100000000 = Planning
- 100000001 = InFlight
- 100000002 = PostMortem
- 100000003 = Archived

**Choice values for mpa_pathway:**
- 100000000 = STANDARD
- 100000001 = GUIDED (default)
- 100000002 = AUDIT

---

## Table 6: mpa_planversion

- [ ] Create table: Display name `Plan Version`, Primary column `Version Name`

| Column | Type | Required |
|--------|------|----------|
| mpa_mediaplan | Lookup (mpa_mediaplan) | **Business Required** |
| mpa_versionnumber | Whole number | No |
| mpa_versiontype | Choice (4 values) | No |
| mpa_iscurrent | Yes/No | No |
| mpa_changesummary | Multi-line text | No |
| mpa_snapshotdata | Multi-line text (1MB) | No |
| mpa_createdby | Text (200) | No |
| mpa_createdat | Date/Time | No |

**Choice values for mpa_versiontype:**
- 100000000 = Initial
- 100000001 = Revision
- 100000002 = Optimization
- 100000003 = Correction

---

## Table 7: mpa_plandata

- [ ] Create table: Display name `Plan Data`, Primary column `Section Label`

| Column | Type | Required |
|--------|------|----------|
| mpa_mediaplan | Lookup (mpa_mediaplan) | **Business Required** |
| mpa_planversion | Lookup (mpa_planversion) | **Business Required** |
| mpa_sectiontype | Choice (11 values) | No |
| mpa_stepnumber | Whole number (1-10) | No |
| mpa_sectiondata | Multi-line text (1MB) | No |
| mpa_sectionstatus | Choice (4 values) | No |
| mpa_validationstatus | Choice (4 values) | No |
| mpa_datasources | Multi-line text | No |
| mpa_createdat | Date/Time | No |
| mpa_updatedat | Date/Time | No |

**Choice values for mpa_sectiontype:**
- 100000000 = ClientContext
- 100000001 = Objectives
- 100000002 = Budget
- 100000003 = Audience
- 100000004 = Channels
- 100000005 = Partners
- 100000006 = Measurement
- 100000007 = Optimization
- 100000008 = Compliance
- 100000009 = Document
- 100000010 = Summary

**Choice values for mpa_sectionstatus / mpa_validationstatus:**
- 100000000 = Not Started / Not Validated
- 100000001 = In Progress / Valid
- 100000002 = Complete / Invalid
- 100000003 = Needs Review / Warning

---

## Post-Creation Verification

- [ ] Verify all 7 tables exist with `mpa_` prefix
- [ ] Verify lookup relationships are configured:
  - mpa_planversion → mpa_mediaplan
  - mpa_plandata → mpa_mediaplan
  - mpa_plandata → mpa_planversion
  - mpa_benchmark → mpa_vertical
  - mpa_benchmark → mpa_channel
  - mpa_benchmark → mpa_kpi
- [ ] Verify all choice fields have correct values
- [ ] Run seed data import script to populate tables
