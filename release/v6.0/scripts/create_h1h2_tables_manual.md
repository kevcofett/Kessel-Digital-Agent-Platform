# MPA v6.1 H1+H2 Dataverse Table Creation - Manual Steps

Since the automated script requires interactive authentication, follow these manual steps to create the 6 Dataverse tables.

## Option 1: Power Apps Maker Portal (Recommended)

Navigate to: https://make.powerapps.com
Select Environment: **Aragorn AI**
Go to: Tables > Create new table

### Table 1: mpa_user_preferences

**Basic Settings:**
- Display name: User Preferences
- Plural name: User Preferences
- Enable for: Copilot, Track changes
- Primary column name: User Email (mpa_user_email)

**Columns to add:**

| Column Name | Display Name | Type | Required | Notes |
|-------------|--------------|------|----------|-------|
| mpa_user_id | User ID | Text (100) | Yes | |
| mpa_default_vertical | Default Vertical | Text (50) | No | |
| mpa_typical_budget_low | Typical Budget Low | Currency | No | |
| mpa_typical_budget_high | Typical Budget High | Currency | No | |
| mpa_preferred_channels_json | Preferred Channels | Multiline (4000) | No | |
| mpa_excluded_channels_json | Excluded Channels | Multiline (4000) | No | |
| mpa_preferred_kpis_json | Preferred KPIs | Multiline (4000) | No | |
| mpa_communication_style | Communication Style | Choice | No | Options: concise, detailed, balanced |
| mpa_measurement_philosophy | Measurement Philosophy | Choice | No | Options: incrementality_first, attribution_focused, hybrid |
| mpa_learned_patterns_json | Learned Patterns | Multiline (8000) | No | |
| mpa_last_session_id | Last Session ID | Text (50) | No | |
| mpa_session_count | Session Count | Whole Number | No | |
| mpa_preference_version | Preference Version | Whole Number | No | |
| mpa_created_at | Created At | Date and time | Yes | |
| mpa_updated_at | Updated At | Date and time | Yes | |

---

### Table 2: mpa_session_memory

**Basic Settings:**
- Display name: Session Memory
- Plural name: Session Memories
- Primary column name: Memory Key (mpa_memory_key)

**Columns to add:**

| Column Name | Display Name | Type | Required | Notes |
|-------------|--------------|------|----------|-------|
| mpa_session_id | Session ID | Text (50) | Yes | |
| mpa_user_id | User ID | Text (100) | Yes | |
| mpa_memory_type | Memory Type | Choice | Yes | Options: preference, decision, context, pattern |
| mpa_memory_category | Memory Category | Choice | Yes | Options: vertical, budget, channel, kpi, measurement, audience, other |
| mpa_memory_value_json | Memory Value | Multiline (8000) | Yes | |
| mpa_confidence_score | Confidence Score | Whole Number | Yes | Min: 0, Max: 100 |
| mpa_source_type | Source Type | Choice | Yes | Options: explicit, implicit, inferred |
| mpa_source_quote | Source Quote | Text (500) | No | |
| mpa_is_persistent | Is Persistent | Yes/No | Yes | Default: No |
| mpa_expires_at | Expires At | Date and time | No | |
| mpa_created_at | Created At | Date and time | Yes | |
| mpa_last_accessed_at | Last Accessed At | Date and time | No | |
| mpa_access_count | Access Count | Whole Number | No | |

---

### Table 3: eap_proactive_trigger

**Basic Settings:**
- Display name: Proactive Trigger
- Plural name: Proactive Triggers
- Primary column name: Trigger Name (eap_trigger_name)

**Columns to add:**

| Column Name | Display Name | Type | Required | Notes |
|-------------|--------------|------|----------|-------|
| eap_trigger_code | Trigger Code | Text (50) | Yes | |
| eap_description | Description | Multiline (500) | No | |
| eap_agent_code | Agent Code | Text (10) | Yes | |
| eap_trigger_category | Trigger Category | Choice | Yes | Options: alert, opportunity, recommendation, warning |
| eap_severity | Severity | Choice | Yes | Options: critical, important, suggestion, info |
| eap_priority_order | Priority Order | Whole Number | Yes | |
| eap_condition_json | Condition JSON | Multiline (4000) | Yes | |
| eap_message_template | Message Template | Multiline (1000) | Yes | |
| eap_cooldown_hours | Cooldown Hours | Whole Number | No | |
| eap_is_active | Is Active | Yes/No | Yes | Default: Yes |
| eap_applies_to_steps_json | Applies to Steps | Multiline (500) | No | |
| eap_created_at | Created At | Date and time | Yes | |

---

### Table 4: eap_workflow_definition

**Basic Settings:**
- Display name: Workflow Definition
- Plural name: Workflow Definitions
- Primary column name: Workflow Name (eap_workflow_name)

**Columns to add:**

| Column Name | Display Name | Type | Required | Notes |
|-------------|--------------|------|----------|-------|
| eap_workflow_code | Workflow Code | Text (50) | Yes | |
| eap_description | Description | Multiline (500) | No | |
| eap_trigger_phrases_json | Trigger Phrases | Multiline (2000) | Yes | |
| eap_agent_sequence_json | Agent Sequence | Multiline (1000) | Yes | |
| eap_estimated_duration_seconds | Estimated Duration | Whole Number | No | |
| eap_output_type | Output Type | Choice | Yes | Options: plan, analysis, recommendation, document |
| eap_synthesis_template | Synthesis Template | Multiline (4000) | No | |
| eap_is_active | Is Active | Yes/No | Yes | Default: Yes |
| eap_created_at | Created At | Date and time | Yes | |

---

### Table 5: eap_workflow_contribution

**Basic Settings:**
- Display name: Workflow Contribution
- Plural name: Workflow Contributions
- Primary column name: Workflow Instance ID (eap_workflow_instance_id)

**Columns to add:**

| Column Name | Display Name | Type | Required | Notes |
|-------------|--------------|------|----------|-------|
| eap_session_id | Session ID | Text (50) | Yes | |
| eap_agent_code | Agent Code | Text (10) | Yes | |
| eap_contribution_type | Contribution Type | Choice | Yes | Options: analysis, recommendation, validation, context |
| eap_contribution_json | Contribution JSON | Multiline (16000) | Yes | |
| eap_summary | Summary | Multiline (500) | No | |
| eap_confidence_overall | Overall Confidence | Whole Number | No | Min: 0, Max: 100 |
| eap_status | Status | Choice | Yes | Options: pending, complete, failed, skipped |
| eap_started_at | Started At | Date and time | Yes | |
| eap_completed_at | Completed At | Date and time | No | |
| eap_error_message | Error Message | Text (500) | No | |

---

### Table 6: eap_trigger_history

**Basic Settings:**
- Display name: Trigger History
- Plural name: Trigger History
- Primary column name: Trigger Code (eap_trigger_code)

**Columns to add:**

| Column Name | Display Name | Type | Required | Notes |
|-------------|--------------|------|----------|-------|
| eap_session_id | Session ID | Text (50) | Yes | |
| eap_user_id | User ID | Text (100) | Yes | |
| eap_fired_at | Fired At | Date and time | Yes | |
| eap_message_delivered | Message Delivered | Multiline (1000) | No | |
| eap_user_response | User Response | Choice | No | Options: engaged, dismissed, ignored |
| eap_context_snapshot_json | Context Snapshot | Multiline (4000) | No | |

---

## Option 2: Solution Import

If you have access to the Power Platform admin center, you can import the solution containing these tables.

The solution files are located at:
- `base/dataverse/schema/` - Table definitions in JSON format

---

## Verification

After creating all tables, verify by:

1. Go to https://make.powerapps.com
2. Select Aragorn AI environment
3. Go to Tables
4. Verify all 6 tables exist:
   - mpa_user_preferences
   - mpa_session_memory
   - eap_proactive_trigger
   - eap_workflow_definition
   - eap_workflow_contribution
   - eap_trigger_history

5. Add tables to the MediaPlanningAgentv52 solution
