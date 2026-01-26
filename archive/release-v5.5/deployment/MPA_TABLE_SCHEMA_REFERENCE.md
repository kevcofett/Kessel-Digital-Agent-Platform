# MPA DATAVERSE TABLE SCHEMA REFERENCE
# Tables Created Automatically via Solution Import

**Created:** 2026-01-12
**Source:** MediaPlanningAgentv52_updated.zip

---

## HOW TO CREATE TABLES IN MASTERCARD

### RECOMMENDED: Import Solution (Tables Created Automatically)

```powershell
# Navigate to scripts
cd release/v5.5/deployment/mastercard/scripts

# Authenticate to Mastercard environment
pac auth create --environment "https://[mastercard-org].crm.dynamics.com"

# Import solution - ALL TABLES CREATED AUTOMATICALLY
pac solution import --path "../../solutions/MediaPlanningAgentv52_updated.zip" --activate-plugins --force-overwrite

# Verify tables were created
pac solution list
```

**After import, these tables exist:**
- mpa_Benchmark
- mpa_Channel  
- mpa_KPI
- mpa_MediaPlan
- mpa_PlanAllocation
- mpa_PlanData
- mpa_PlanVersion
- mpa_Vertical
- eap_Client
- eap_Session

---

## TABLE SCHEMAS (For Reference Only)

### mpa_Benchmark
**Purpose:** Stores industry benchmark data for CPM, CPC, CTR by channel/vertical

| Column | Type | Description |
|--------|------|-------------|
| mpa_benchmarkid | Unique ID | Primary key |
| mpa_name | Text | Benchmark name |
| mpa_channel | Lookup | Reference to mpa_Channel |
| mpa_vertical | Lookup | Reference to mpa_Vertical |
| mpa_kpi | Lookup | Reference to mpa_KPI |
| mpa_low_value | Decimal | Low end of benchmark range |
| mpa_mid_value | Decimal | Typical/median value |
| mpa_high_value | Decimal | High end of benchmark range |
| mpa_source | Text | Data source citation |
| mpa_effective_date | DateTime | When benchmark was valid |
| statecode | Status | Active/Inactive |
| createdon | DateTime | Record creation date |
| modifiedon | DateTime | Last modification date |

### mpa_Channel
**Purpose:** Media channel definitions (Display, CTV, Search, Social, etc.)

| Column | Type | Description |
|--------|------|-------------|
| mpa_channelid | Unique ID | Primary key |
| mpa_name | Text | Channel name |
| mpa_code | Text | Short code (e.g., "DSP", "CTV") |
| mpa_description | Text | Channel description |
| mpa_channel_type | Option Set | Channel category |
| mpa_typical_objectives | Text | Common use cases |
| mpa_planning_considerations | Text | Key planning notes |
| statecode | Status | Active/Inactive |

### mpa_KPI
**Purpose:** Key Performance Indicator definitions

| Column | Type | Description |
|--------|------|-------------|
| mpa_kpiid | Unique ID | Primary key |
| mpa_name | Text | KPI name (e.g., "CPM", "CPC", "CTR") |
| mpa_code | Text | Short code |
| mpa_description | Text | What the KPI measures |
| mpa_formula | Text | Calculation formula |
| mpa_unit | Text | Unit of measurement |
| mpa_kpi_category | Option Set | Category (cost, engagement, conversion) |
| statecode | Status | Active/Inactive |

### mpa_Vertical
**Purpose:** Industry vertical definitions

| Column | Type | Description |
|--------|------|-------------|
| mpa_verticalid | Unique ID | Primary key |
| mpa_name | Text | Vertical name (e.g., "Retail", "Financial Services") |
| mpa_code | Text | Short code |
| mpa_description | Text | Industry description |
| mpa_typical_budget_range | Text | Common budget ranges |
| mpa_key_channels | Text | Typically used channels |
| statecode | Status | Active/Inactive |

### mpa_MediaPlan
**Purpose:** Media plan container/header

| Column | Type | Description |
|--------|------|-------------|
| mpa_mediaplanid | Unique ID | Primary key |
| mpa_name | Text | Plan name |
| mpa_client_name | Text | Client/brand name |
| mpa_vertical | Lookup | Reference to mpa_Vertical |
| mpa_total_budget | Currency | Total plan budget |
| mpa_start_date | DateTime | Campaign start |
| mpa_end_date | DateTime | Campaign end |
| mpa_objectives | Text | Plan objectives |
| mpa_status | Option Set | Draft/Active/Complete |
| ownerid | Lookup | Plan owner |
| statecode | Status | Active/Inactive |

### mpa_PlanAllocation
**Purpose:** Budget allocation by channel within a plan

| Column | Type | Description |
|--------|------|-------------|
| mpa_planallocationid | Unique ID | Primary key |
| mpa_name | Text | Allocation name |
| mpa_mediaplan | Lookup | Reference to mpa_MediaPlan |
| mpa_channel | Lookup | Reference to mpa_Channel |
| mpa_allocated_budget | Currency | Budget for this channel |
| mpa_percentage | Decimal | Percentage of total budget |
| mpa_expected_impressions | Integer | Forecasted impressions |
| mpa_expected_cpm | Decimal | Expected CPM |
| statecode | Status | Active/Inactive |

### mpa_PlanData
**Purpose:** Detailed plan data and metrics

| Column | Type | Description |
|--------|------|-------------|
| mpa_plandataid | Unique ID | Primary key |
| mpa_name | Text | Data point name |
| mpa_mediaplan | Lookup | Reference to mpa_MediaPlan |
| mpa_data_type | Option Set | Type of data |
| mpa_value | Text | Data value |
| mpa_numeric_value | Decimal | Numeric value if applicable |
| mpa_source | Text | Data source |
| statecode | Status | Active/Inactive |

### mpa_PlanVersion
**Purpose:** Version tracking for media plans

| Column | Type | Description |
|--------|------|-------------|
| mpa_planversionid | Unique ID | Primary key |
| mpa_name | Text | Version name |
| mpa_mediaplan | Lookup | Reference to mpa_MediaPlan |
| mpa_version_number | Integer | Version number |
| mpa_version_status | Option Set | Draft/Published/Archived |
| mpa_change_notes | Text | What changed |
| mpa_snapshot_data | Text | JSON snapshot |
| createdon | DateTime | Version creation date |
| statecode | Status | Active/Inactive |

### eap_Client
**Purpose:** Client/organization records for EAP

| Column | Type | Description |
|--------|------|-------------|
| eap_clientid | Unique ID | Primary key |
| eap_name | Text | Client name |
| eap_industry | Text | Industry |
| eap_contact_email | Text | Primary contact |
| statecode | Status | Active/Inactive |

### eap_Session
**Purpose:** User session tracking for EAP

| Column | Type | Description |
|--------|------|-------------|
| eap_sessionid | Unique ID | Primary key |
| eap_name | Text | Session identifier |
| eap_client | Lookup | Reference to eap_Client |
| eap_user_id | Text | User identifier |
| eap_start_time | DateTime | Session start |
| eap_end_time | DateTime | Session end |
| eap_session_data | Text | Session JSON data |
| statecode | Status | Active/Inactive |

---

## MANUAL TABLE CREATION (Only If Solution Import Fails)

If you absolutely cannot import the solution and must create tables manually:

### In Power Apps (make.powerapps.com):

1. Select Mastercard environment
2. Go to **Tables** → **+ New table** → **New table**
3. For each table above:
   - Set Display name and Plural name
   - The system creates the primary column automatically
   - Add columns one by one matching the schema above
4. After all tables created, add Relationships:
   - mpa_Benchmark → mpa_Channel (Many-to-One)
   - mpa_Benchmark → mpa_Vertical (Many-to-One)
   - mpa_Benchmark → mpa_KPI (Many-to-One)
   - mpa_PlanAllocation → mpa_MediaPlan (Many-to-One)
   - mpa_PlanAllocation → mpa_Channel (Many-to-One)
   - mpa_PlanVersion → mpa_MediaPlan (Many-to-One)

**This is NOT recommended** - importing the solution is much faster and ensures all relationships, views, and forms are correct.

---

## SEED DATA

After tables are created (via solution import), import seed data:

```powershell
# Import benchmark data
pac data import --data "../../agents/mpa/base/data/seed/mpa_benchmark_seed.csv"

# Import channel data
pac data import --data "../../agents/mpa/base/data/seed/mpa_channel_seed.csv"

# Import KPI data
pac data import --data "../../agents/mpa/base/data/seed/mpa_kpi_seed.csv"

# Import vertical data
pac data import --data "../../agents/mpa/base/data/seed/mpa_vertical_seed.csv"
```

Or use the seed data import script:
```powershell
./import-seed-data.ps1 -DataPath "../../agents/mpa/base/data/seed" -Environment "mastercard"
```

---

## SUMMARY

| Method | Effort | Recommended |
|--------|--------|-------------|
| **Solution Import** | 1 command | ✅ YES |
| Manual Table Creation | Hours of work | ❌ NO |

**Always use solution import.** The solution .zip file contains complete table definitions, relationships, views, forms, and flows. One import command creates everything.

---
