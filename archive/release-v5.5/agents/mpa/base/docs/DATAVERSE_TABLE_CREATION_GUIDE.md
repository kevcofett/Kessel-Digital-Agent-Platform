# ARAGORN AI - DATAVERSE TABLE CREATION GUIDE
# Source: CURRENT codebase specs only (no archived files)
# Created: 2026-01-02
# 
# This guide creates the MINIMUM tables required for MPA Azure Functions to work.
# Additional tables can be added later as needed.

================================================================================
PREREQUISITES
================================================================================

1. Open: https://make.powerapps.com
2. Select environment: Aragorn AI
3. Verify "AragornAI" solution is set as Preferred Solution
4. Go to: Tables (left nav)

================================================================================
TABLE CREATION ORDER (Dependencies Matter!)
================================================================================

Phase A - Foundation (no dependencies):
  1. eap_client
  2. eap_user  
  3. eap_agent

Phase B - Core Session (depends on A):
  4. eap_session

Phase C - MPA Reference Data (no dependencies):
  5. mpa_vertical
  6. mpa_channel
  7. mpa_kpi
  8. mpa_featureflag

Phase D - MPA Data (depends on C):
  9. mpa_benchmark

Phase E - MPA Plans (depends on B, C):
  10. mpa_mediaplan
  11. mpa_plandata

================================================================================
TABLE 1: eap_client
================================================================================
Source: /Enterprise_AI_Platform/specs/dataverse/eap_client.json

Click: + New table > Add columns and data

Display name: Client
Plural name: Clients
Schema name: (auto-generates as cr_XXX_client, rename to eap_client if possible)
Primary column: Client Name

COLUMNS TO ADD:
| Display Name | Schema Name | Type | Max Length | Required | Notes |
|--------------|-------------|------|------------|----------|-------|
| Client Code | client_code | Text | 50 | Yes | Add unique constraint |
| Client Name | client_name | Text | 200 | Yes | Primary column |
| Legal Name | client_legal_name | Text | 500 | No | |
| Industry | industry | Text | 100 | No | |
| Secondary Industry | industry_secondary | Text | 100 | No | |
| Is Strategic | is_strategic | Yes/No | - | Yes | Default: No |
| Is Active | is_active | Yes/No | - | Yes | Default: Yes |
| Client Tier | client_tier | Choice | - | No | Tier1, Tier2, Tier3 |
| Has PII | has_pii | Yes/No | - | Yes | Default: No |
| Website | website | URL | 500 | No | |
| Description | description | Multiline | 4000 | No | |

================================================================================
TABLE 2: eap_user
================================================================================
Source: /Enterprise_AI_Platform/specs/dataverse/eap_user.json

Display name: User
Plural name: Users
Primary column: Display Name

COLUMNS TO ADD:
| Display Name | Schema Name | Type | Max Length | Required | Notes |
|--------------|-------------|------|------------|----------|-------|
| Entra ID | entra_id | Text | 100 | Yes | Azure AD object ID |
| Email | email | Text | 320 | Yes | |
| Display Name | display_name | Text | 200 | Yes | Primary column |
| First Name | first_name | Text | 100 | No | |
| Last Name | last_name | Text | 100 | No | |
| Job Title | job_title | Text | 200 | No | |
| Department | department | Text | 200 | No | |
| User Type | user_type | Choice | - | No | Internal, External, Service |
| User Tier | user_tier | Whole Number | - | Yes | Default: 1 (1-5) |
| Is Active | is_active | Yes/No | - | Yes | Default: Yes |
| Client | client_id | Lookup | - | No | → eap_client |
| Last Login | last_login_at | DateTime | - | No | |

================================================================================
TABLE 3: eap_agent
================================================================================
Source: /Enterprise_AI_Platform/specs/dataverse/eap_agent.json

Display name: Agent
Plural name: Agents
Primary column: Agent Name

COLUMNS TO ADD:
| Display Name | Schema Name | Type | Max Length | Required | Notes |
|--------------|-------------|------|------------|----------|-------|
| Agent Code | agent_code | Text | 50 | Yes | MPA_AGENT, CONSULTING_AGENT |
| Agent Name | agent_name | Text | 200 | Yes | Primary column |
| Description | description | Multiline | 4000 | No | |
| Version | version | Text | 20 | No | e.g., "5.3.0" |
| Is Active | is_active | Yes/No | - | Yes | Default: Yes |
| Agent Type | agent_type | Choice | - | No | Planning, Consulting, Research |
| KB Library URL | kb_library_url | URL | 500 | No | SharePoint library |

================================================================================
TABLE 4: eap_session
================================================================================
Source: /Enterprise_AI_Platform/specs/dataverse/eap_session.json

Display name: Session
Plural name: Sessions
Primary column: Session Code

COLUMNS TO ADD:
| Display Name | Schema Name | Type | Max Length | Required | Notes |
|--------------|-------------|------|------------|----------|-------|
| Session Code | session_code | Text | 50 | Yes | Unique identifier |
| User | user_id | Lookup | - | Yes | → eap_user |
| Agent | agent_id | Lookup | - | Yes | → eap_agent |
| Client | client_id | Lookup | - | No | → eap_client |
| Session Type | session_type | Choice | - | No | Standard, Research, Creation |
| Session Status | session_status | Choice | - | Yes | Active, Paused, Completed, Abandoned |
| Started At | started_at | DateTime | - | Yes | |
| Ended At | ended_at | DateTime | - | No | |
| Exchange Count | exchange_count | Whole Number | - | No | Default: 0 |
| Context JSON | context_json | Multiline | 100000 | No | Session context |
| Last Activity | last_activity_at | DateTime | - | No | |

================================================================================
TABLE 5: mpa_vertical
================================================================================
Source: Current Azure Functions requirements

Display name: Vertical
Plural name: Verticals
Primary column: Vertical Name

COLUMNS TO ADD:
| Display Name | Schema Name | Type | Max Length | Required | Notes |
|--------------|-------------|------|------------|----------|-------|
| Vertical Code | vertical_code | Text | 50 | Yes | e.g., RETAIL, CPG, AUTO |
| Vertical Name | vertical_name | Text | 200 | Yes | Primary column |
| Description | description | Multiline | 4000 | No | |
| Is Active | is_active | Yes/No | - | Yes | Default: Yes |
| Display Order | display_order | Whole Number | - | No | Sort order |

================================================================================
TABLE 6: mpa_channel
================================================================================
Source: Current Azure Functions requirements

Display name: Channel
Plural name: Channels
Primary column: Channel Name

COLUMNS TO ADD:
| Display Name | Schema Name | Type | Max Length | Required | Notes |
|--------------|-------------|------|------------|----------|-------|
| Channel Code | channel_code | Text | 50 | Yes | e.g., DISPLAY, VIDEO, SOCIAL |
| Channel Name | channel_name | Text | 200 | Yes | Primary column |
| Channel Category | channel_category | Choice | - | No | Digital, Traditional, Emerging |
| Description | description | Multiline | 4000 | No | |
| Is Active | is_active | Yes/No | - | Yes | Default: Yes |
| Display Order | display_order | Whole Number | - | No | Sort order |
| Min Budget | min_budget | Currency | - | No | Minimum recommended |
| Typical CPM Low | typical_cpm_low | Decimal | - | No | |
| Typical CPM High | typical_cpm_high | Decimal | - | No | |

================================================================================
TABLE 7: mpa_kpi
================================================================================
Source: Current Azure Functions requirements

Display name: KPI
Plural name: KPIs
Primary column: KPI Name

COLUMNS TO ADD:
| Display Name | Schema Name | Type | Max Length | Required | Notes |
|--------------|-------------|------|------------|----------|-------|
| KPI Code | kpi_code | Text | 50 | Yes | e.g., CPM, CTR, VCR, ROAS |
| KPI Name | kpi_name | Text | 200 | Yes | Primary column |
| KPI Category | kpi_category | Choice | - | No | Cost, Engagement, Conversion |
| Unit Type | unit_type | Choice | - | No | Percentage, Currency, Ratio, Count |
| Description | description | Multiline | 4000 | No | |
| Formula | formula | Text | 500 | No | Calculation formula |
| Is Active | is_active | Yes/No | - | Yes | Default: Yes |

================================================================================
TABLE 8: mpa_featureflag
================================================================================
Source: /Media_Planning_Agent/specs/dataverse/MPA_v5.2_FeatureFlag_Table.json

Display name: Feature Flag
Plural name: Feature Flags
Primary column: Flag Name

COLUMNS TO ADD:
| Display Name | Schema Name | Type | Max Length | Required | Notes |
|--------------|-------------|------|------------|----------|-------|
| Flag Code | flag_code | Text | 100 | Yes | e.g., ENABLE_SPO, ENABLE_GAP |
| Flag Name | flag_name | Text | 200 | Yes | Primary column |
| Is Enabled | is_enabled | Yes/No | - | Yes | Default: No |
| Description | description | Multiline | 2000 | No | |
| Environment | environment | Choice | - | No | All, Dev, Test, Prod |

================================================================================
TABLE 9: mpa_benchmark
================================================================================
Source: Current Azure Functions requirements + benchmark data

Display name: Benchmark
Plural name: Benchmarks
Primary column: Benchmark Name

COLUMNS TO ADD:
| Display Name | Schema Name | Type | Max Length | Required | Notes |
|--------------|-------------|------|------------|----------|-------|
| Benchmark Name | benchmark_name | Text | 200 | Yes | Primary column |
| Vertical | vertical_id | Lookup | - | Yes | → mpa_vertical |
| Channel | channel_id | Lookup | - | Yes | → mpa_channel |
| KPI | kpi_id | Lookup | - | Yes | → mpa_kpi |
| Metric Type | metric_type | Text | 50 | Yes | e.g., CTR, CPM, VCR |
| Value Low | value_low | Decimal | - | No | Range low |
| Value Mid | value_mid | Decimal | - | No | Typical/median |
| Value High | value_high | Decimal | - | No | Range high |
| Unit | unit | Text | 20 | No | %, $, ratio |
| Source | source | Text | 200 | No | Data source |
| Source Date | source_date | Date | - | No | When sourced |
| Confidence | confidence | Choice | - | No | High, Medium, Low |
| Is Active | is_active | Yes/No | - | Yes | Default: Yes |
| Notes | notes | Multiline | 4000 | No | |

================================================================================
TABLE 10: mpa_mediaplan
================================================================================
Source: Current Azure Functions requirements

Display name: Media Plan
Plural name: Media Plans
Primary column: Plan Name

COLUMNS TO ADD:
| Display Name | Schema Name | Type | Max Length | Required | Notes |
|--------------|-------------|------|------------|----------|-------|
| Plan Code | plan_code | Text | 50 | Yes | Unique identifier |
| Plan Name | plan_name | Text | 200 | Yes | Primary column |
| Session | session_id | Lookup | - | Yes | → eap_session |
| Client | client_id | Lookup | - | No | → eap_client |
| User | user_id | Lookup | - | Yes | → eap_user |
| Status | plan_status | Choice | - | Yes | Draft, InProgress, Review, Approved, Archived |
| Total Budget | total_budget | Currency | - | No | |
| Start Date | start_date | Date | - | No | Campaign start |
| End Date | end_date | Date | - | No | Campaign end |
| Objectives | objectives | Multiline | 4000 | No | |
| Target Audience | target_audience | Multiline | 4000 | No | |
| Plan JSON | plan_json | Multiline | 100000 | No | Full plan data |
| Created At | created_at | DateTime | - | Yes | |
| Updated At | updated_at | DateTime | - | Yes | |

================================================================================
TABLE 11: mpa_plandata
================================================================================
Source: Current Azure Functions requirements

Display name: Plan Data
Plural name: Plan Data
Primary column: Data Name

COLUMNS TO ADD:
| Display Name | Schema Name | Type | Max Length | Required | Notes |
|--------------|-------------|------|------------|----------|-------|
| Media Plan | mediaplan_id | Lookup | - | Yes | → mpa_mediaplan |
| Data Name | data_name | Text | 200 | Yes | Primary column |
| Data Type | data_type | Choice | - | Yes | Allocation, Projection, Gap, SPO |
| Channel | channel_id | Lookup | - | No | → mpa_channel |
| Data JSON | data_json | Multiline | 100000 | No | Structured data |
| Created At | created_at | DateTime | - | Yes | |

================================================================================
CHOICE FIELDS SUMMARY
================================================================================

eap_client.client_tier:
- Tier1
- Tier2
- Tier3

eap_user.user_type:
- Internal
- External
- Service

eap_agent.agent_type:
- Planning
- Consulting
- Research

eap_session.session_type:
- Standard
- Research
- Creation
- Review
- Handoff

eap_session.session_status:
- Active
- Paused
- Completed
- Abandoned

mpa_channel.channel_category:
- Digital
- Traditional
- Emerging

mpa_kpi.kpi_category:
- Cost
- Engagement
- Conversion
- Awareness
- Performance

mpa_kpi.unit_type:
- Percentage
- Currency
- Ratio
- Count

mpa_featureflag.environment:
- All
- Dev
- Test
- Prod

mpa_benchmark.confidence:
- High
- Medium
- Low

mpa_mediaplan.plan_status:
- Draft
- InProgress
- Review
- Approved
- Archived

mpa_plandata.data_type:
- Allocation
- Projection
- Gap
- SPO
- Validation

================================================================================
ESTIMATED TIME
================================================================================

Phase A (3 tables): ~45 minutes
Phase B (1 table): ~15 minutes
Phase C (4 tables): ~45 minutes
Phase D (1 table): ~20 minutes
Phase E (2 tables): ~30 minutes

TOTAL: ~2.5 hours

================================================================================
AFTER CREATION - SEED DATA
================================================================================

After tables are created, we need to add seed data:

1. eap_agent - Add MPA_AGENT and CONSULTING_AGENT records
2. mpa_vertical - Add 12 industry verticals
3. mpa_channel - Add 12 advertising channels
4. mpa_kpi - Add ~20 common KPIs
5. mpa_benchmark - Import 708 benchmark records from Excel
6. mpa_featureflag - Add feature flags

I (Claude) will provide CSV imports or guide you through this after tables exist.

================================================================================
