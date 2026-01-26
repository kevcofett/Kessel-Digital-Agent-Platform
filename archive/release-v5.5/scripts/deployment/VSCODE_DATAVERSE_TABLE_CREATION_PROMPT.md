# VS CODE CLAUDE: DATAVERSE TABLE CREATION PROMPT

## CONTEXT

You are helping create Dataverse tables for MPA v5.5 deployment in the Aragorn AI environment. The user needs step-by-step guidance through the Power Apps UI to create each table.

## ENVIRONMENT

- Power Apps URL: https://make.powerapps.com
- Environment: Aragorn AI (ID: c672b470-9cc7-e9d8-a0e2-ca83751f800c)
- Solution: Media Planning Agent v5.5
- Publisher Prefix: mpa

## YOUR TASK

Guide the user through creating each Dataverse table one at a time. For each table:

1. Provide the exact table properties to enter
2. List every column with exact settings
3. Wait for user confirmation before moving to the next table
4. Provide verification steps

## TABLE CREATION ORDER (Dependencies)

Create tables in this exact order:

1. mpa_vertical (no dependencies)
2. mpa_channel (no dependencies)
3. mpa_kpi (no dependencies)
4. mpa_benchmark (no dependencies - uses text references)
5. mpa_errorlog (no dependencies)
6. mpa_mediaplan (no dependencies - client is text)
7. mpa_planversion (depends on mpa_mediaplan)
8. mpa_plandata (depends on mpa_mediaplan, mpa_planversion)

## TABLE SPECIFICATIONS

### TABLE 1: mpa_vertical

**Navigation:**
1. Go to https://make.powerapps.com
2. Select environment: Aragorn AI
3. Click Solutions → Media Planning Agent v5.5
4. Click + New → Table → Table

**Table Properties:**
| Property | Value |
|----------|-------|
| Display name | Vertical |
| Plural name | Verticals |
| Description | Industry verticals for benchmark categorization |
| Primary column - Display name | Vertical Name |
| Primary column - Description | Name of the industry vertical |

**Columns to Add:**

After creating the table, add these columns (click + New column for each):

| Display Name | Name (auto) | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| Vertical Code | mpa_verticalcode | Single line of text | Business required | Max length: 50 |
| Description | mpa_description | Multiple lines of text | Optional | Max length: 2000 |
| Is Active | mpa_isactive | Yes/No | Business required | Default: Yes |
| Display Order | mpa_displayorder | Whole number | Optional | Min: 0, Max: 1000 |

---

### TABLE 2: mpa_channel

**Table Properties:**
| Property | Value |
|----------|-------|
| Display name | Channel |
| Plural name | Channels |
| Description | Advertising channels for media planning |
| Primary column - Display name | Channel Name |
| Primary column - Description | Name of the advertising channel |

**Columns to Add:**

| Display Name | Name (auto) | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| Channel Code | mpa_channelcode | Single line of text | Business required | Max length: 50 |
| Category | mpa_category | Choice | Business required | Values: Digital (100000000), Traditional (100000001), Emerging (100000002) |
| Description | mpa_description | Multiple lines of text | Optional | Max length: 4000 |
| Typical CPM Low | mpa_typicalcpmlow | Currency | Optional | Precision: 2, Min: 0 |
| Typical CPM High | mpa_typicalcpmhigh | Currency | Optional | Precision: 2, Min: 0 |
| Is Active | mpa_isactive | Yes/No | Business required | Default: Yes |
| Display Order | mpa_displayorder | Whole number | Optional | Min: 0, Max: 1000 |

---

### TABLE 3: mpa_kpi

**Table Properties:**
| Property | Value |
|----------|-------|
| Display name | KPI Definition |
| Plural name | KPI Definitions |
| Description | KPI definitions with formulas and interpretation guidance |
| Primary column - Display name | KPI Name |
| Primary column - Description | Full name of the KPI |

**Columns to Add:**

| Display Name | Name (auto) | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| KPI Code | mpa_kpicode | Single line of text | Business required | Max length: 20 |
| Category | mpa_category | Choice | Business required | Values: Cost (100000000), Engagement (100000001), Conversion (100000002), Efficiency (100000003), Quality (100000004) |
| Formula | mpa_formula | Single line of text | Business required | Max length: 500 |
| Formula Inputs | mpa_formulainputs | Multiple lines of text | Optional | Max length: 2000 |
| Unit | mpa_unit | Single line of text | Business required | Max length: 20 |
| Format Pattern | mpa_formatpattern | Single line of text | Optional | Max length: 50 |
| Direction | mpa_direction | Choice | Business required | Values: Higher is Better (100000000), Lower is Better (100000001), Target Range (100000002) |
| Description | mpa_description | Multiple lines of text | Optional | Max length: 4000 |
| Interpretation Guide | mpa_interpretationguide | Multiple lines of text | Optional | Max length: 10000 |
| Is Active | mpa_isactive | Yes/No | Business required | Default: Yes |

---

### TABLE 4: mpa_benchmark

**Table Properties:**
| Property | Value |
|----------|-------|
| Display name | Benchmark |
| Plural name | Benchmarks |
| Description | Industry benchmark data for performance comparison |
| Primary column - Display name | Metric Name |
| Primary column - Description | Name of the metric being benchmarked |

**Columns to Add:**

| Display Name | Name (auto) | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| Vertical | mpa_vertical | Single line of text | Business required | Max length: 100 |
| Channel | mpa_channel | Single line of text | Optional | Max length: 100 |
| Metric Type | mpa_metrictype | Choice | Business required | Values: CPM (100000000), CPC (100000001), CTR (100000002), CVR (100000003), CPA (100000004), ROAS (100000005), Viewability (100000006), VCR (100000007), Completion Rate (100000008) |
| Benchmark Low | mpa_benchmarklow | Decimal number | Business required | Precision: 6, Min: 0 |
| Benchmark Median | mpa_benchmarkmedian | Decimal number | Business required | Precision: 6, Min: 0 |
| Benchmark High | mpa_benchmarkhigh | Decimal number | Business required | Precision: 6, Min: 0 |
| Benchmark Best In Class | mpa_benchmarkbestinclass | Decimal number | Optional | Precision: 6, Min: 0 |
| Data Source | mpa_datasource | Single line of text | Business required | Max length: 200 |
| Data Period | mpa_dataperiod | Single line of text | Business required | Max length: 50 |
| Confidence | mpa_confidence | Choice | Business required | Values: High (100000000), Medium (100000001), Low (100000002) |
| Sample Size | mpa_samplesize | Whole number | Optional | Min: 0 |
| Is Active | mpa_isactive | Yes/No | Business required | Default: Yes |
| Last Validated At | mpa_lastvalidatedat | Date only | Optional | |

---

### TABLE 5: mpa_errorlog

**Table Properties:**
| Property | Value |
|----------|-------|
| Display name | Error Log |
| Plural name | Error Logs |
| Description | Error logging for MPA flows and functions |
| Primary column - Display name | Error ID |
| Primary column - Description | Auto-generated error identifier |

**Columns to Add:**

| Display Name | Name (auto) | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| Source | mpa_source | Single line of text | Business required | Max length: 200 |
| Error Code | mpa_errorcode | Single line of text | Optional | Max length: 50 |
| Error Message | mpa_errormessage | Multiple lines of text | Business required | Max length: 4000 |
| Error Details | mpa_errordetails | Multiple lines of text | Optional | Max length: 100000 |
| Session ID | mpa_sessionid | Single line of text | Optional | Max length: 100 |
| Plan ID | mpa_planid | Single line of text | Optional | Max length: 100 |
| Severity | mpa_severity | Choice | Business required | Values: Low (100000000), Medium (100000001), High (100000002), Critical (100000003) |
| Occurred At | mpa_occurredat | Date and time | Business required | |

---

### TABLE 6: mpa_mediaplan

**Table Properties:**
| Property | Value |
|----------|-------|
| Display name | Media Plan |
| Plural name | Media Plans |
| Description | Core media plan records |
| Primary column - Display name | Campaign Name |
| Primary column - Description | Name of the campaign |

**Columns to Add:**

| Display Name | Name (auto) | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| Plan Code | mpa_plancode | Single line of text | Business required | Max length: 20 |
| Client ID | mpa_clientid | Single line of text | Business required | Max length: 100 |
| Status | mpa_status | Choice | Business required | Values: Draft (100000000), In Progress (100000001), Pending Approval (100000002), Approved (100000003), Active (100000004), Paused (100000005), Completed (100000006), Archived (100000007). Default: Draft |
| Lifecycle Mode | mpa_lifecyclemode | Choice | Business required | Values: Planning (100000000), InFlight (100000001), PostMortem (100000002), Archived (100000003). Default: Planning |
| Pathway | mpa_pathway | Choice | Business required | Values: STANDARD (100000001), GUIDED (100000002), AUDIT (100000003). Default: GUIDED |
| Current Step | mpa_currentstep | Whole number | Business required | Min: 1, Max: 10, Default: 1 |
| Current Gate | mpa_currentgate | Whole number | Optional | Min: 0, Max: 4, Default: 0 |
| Total Budget | mpa_totalbudget | Currency | Optional | Precision: 2, Min: 0 |
| Start Date | mpa_startdate | Date only | Optional | |
| End Date | mpa_enddate | Date only | Optional | |
| Primary Objective | mpa_primaryobjective | Single line of text | Optional | Max length: 200 |
| Steps Completed | mpa_stepscompleted | Multiple lines of text | Optional | Max length: 500 |
| Gates Passed | mpa_gatespassed | Multiple lines of text | Optional | Max length: 200 |
| Created By | mpa_createdby | Single line of text | Optional | Max length: 100 |
| Owned By | mpa_ownedby | Single line of text | Optional | Max length: 100 |
| Created At | mpa_createdat | Date and time | Optional | |
| Updated At | mpa_updatedat | Date and time | Optional | |

---

### TABLE 7: mpa_planversion

**Table Properties:**
| Property | Value |
|----------|-------|
| Display name | Plan Version |
| Plural name | Plan Versions |
| Description | Version history for media plans |
| Primary column - Display name | Version Name |
| Primary column - Description | Optional name for this version |

**Columns to Add:**

| Display Name | Name (auto) | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| Media Plan | mpa_mediaplan | Lookup | Business required | Related table: Media Plan |
| Version Number | mpa_versionnumber | Whole number | Business required | Min: 1 |
| Version Type | mpa_versiontype | Choice | Business required | Values: Initial (100000000), Revision (100000001), Optimization (100000002), Correction (100000003) |
| Is Current | mpa_iscurrent | Yes/No | Business required | Default: No |
| Change Summary | mpa_changesummary | Multiple lines of text | Optional | Max length: 10000 |
| Snapshot Data | mpa_snapshotdata | Multiple lines of text | Optional | Max length: 1048576 |
| Created By | mpa_createdby | Single line of text | Optional | Max length: 100 |
| Created At | mpa_createdat | Date and time | Optional | |

---

### TABLE 8: mpa_plandata

**Table Properties:**
| Property | Value |
|----------|-------|
| Display name | Plan Data |
| Plural name | Plan Data |
| Description | Detailed plan data organized by section/step |
| Primary column - Display name | Section Label |
| Primary column - Description | Label for this section |

**Columns to Add:**

| Display Name | Name (auto) | Type | Required | Additional Settings |
|--------------|-------------|------|----------|---------------------|
| Media Plan | mpa_mediaplan | Lookup | Business required | Related table: Media Plan |
| Plan Version | mpa_planversion | Lookup | Optional | Related table: Plan Version |
| Section Type | mpa_sectiontype | Choice | Business required | Values: ClientContext (100000000), Objectives (100000001), Budget (100000002), Timeline (100000003), Audience (100000004), Channels (100000005), Partners (100000006), Measurement (100000007), Optimization (100000008), Compliance (100000009), Summary (100000010) |
| Step Number | mpa_stepnumber | Whole number | Business required | Min: 1, Max: 10 |
| Section Data | mpa_sectiondata | Multiple lines of text | Optional | Max length: 1048576 |
| Section Status | mpa_sectionstatus | Choice | Business required | Values: Not Started (100000000), In Progress (100000001), Complete (100000002), Needs Review (100000003). Default: Not Started |
| Validation Status | mpa_validationstatus | Choice | Optional | Values: Not Validated (100000000), Valid (100000001), Invalid (100000002), Warning (100000003) |
| Data Sources | mpa_datasources | Multiple lines of text | Optional | Max length: 10000 |
| Created At | mpa_createdat | Date and time | Optional | |
| Updated At | mpa_updatedat | Date and time | Optional | |

---

## VERIFICATION CHECKLIST

After creating all tables, verify:

1. All tables have the `mpa_` prefix in their schema name
2. All columns have the `mpa_` prefix
3. Lookup relationships are correct:
   - mpa_planversion → mpa_mediaplan
   - mpa_plandata → mpa_mediaplan
   - mpa_plandata → mpa_planversion
4. Choice columns have all values with correct codes (100000000, 100000001, etc.)
5. Default values are set correctly
6. Required fields are marked as "Business required"

## SEED DATA IMPORT

After tables are created, import seed data from:
- `/release/v5.5/agents/mpa/base/data/seed/mpa_vertical_seed.csv`
- `/release/v5.5/agents/mpa/base/data/seed/mpa_channel_seed.csv`
- `/release/v5.5/agents/mpa/base/data/seed/mpa_kpi_seed.csv`
- `/release/v5.5/agents/mpa/base/data/seed/mpa_benchmark_seed.csv`

Use Power Apps data import or create a Python script with Dataverse Web API.

---

## INTERACTION PATTERN

When guiding the user:

1. Start with: "Let's create the Dataverse tables. We'll do them one at a time. Ready to start with Table 1: mpa_vertical?"

2. For each table, provide:
   - Navigation steps
   - Table properties
   - Each column one by one
   - "Let me know when this table is created and I'll guide you to the next one."

3. After all tables: "All tables created! Now let's verify the relationships and then import seed data."

---

*Created: January 6, 2026*
*For: MPA v5.5 Dataverse Schema Deployment*
