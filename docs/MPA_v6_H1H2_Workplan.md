# MPA v6.0 HORIZON 1+2 IMPLEMENTATION WORKPLAN

**Version:** 1.0  
**Date:** January 19, 2026  
**Status:** Active Development  
**Scope:** Horizon 1 (Memory, Proactive Intelligence) + Horizon 2 (Multi-Modal Input, Agent Consensus)

---

## EXECUTIVE SUMMARY

This workplan details the implementation of four major enhancements to MPA v6.0:

| Initiative | Horizon | Owner | Status |
|------------|---------|-------|--------|
| Agent Memory System | H1 | Desktop + VS Code | KB Complete, Schema/Flows Pending |
| Proactive Intelligence | H1 | Desktop + VS Code | KB Complete, Schema/Flows Pending |
| Multi-Modal Input Support | H2 | Desktop + VS Code | KB Complete, Flows Pending |
| Agent Consensus Protocol | H2 | Desktop + VS Code | KB Complete, Prompts/Flows Pending |

---

## PART 1: COMPLETED WORK (DESKTOP CLAUDE)

### 1.1 Knowledge Base Files Created

| File | Location | Status |
|------|----------|--------|
| EAP_KB_Memory_System_v1.txt | base/platform/eap/kb/ | ✓ COMPLETE |
| EAP_KB_Proactive_Intelligence_v1.txt | base/platform/eap/kb/ | ✓ COMPLETE |
| EAP_KB_Consensus_Protocol_v1.txt | base/platform/eap/kb/ | ✓ COMPLETE |
| ORC_KB_Session_Management_v1.txt | base/agents/orc/kb/ | ✓ COMPLETE |
| ORC_KB_Collaborative_Orchestration_v1.txt | base/agents/orc/kb/ | ✓ COMPLETE |
| DOC_KB_File_Processing_v1.txt | base/agents/doc/kb/ | ✓ COMPLETE |

### 1.2 AI Builder Prompts Created

| Prompt Code | File | Status |
|-------------|------|--------|
| MEM_STORE_PREFERENCE | base/platform/eap/prompts/MEM_STORE_PREFERENCE_PROMPT.json | ✓ COMPLETE |
| MEM_RETRIEVE_CONTEXT | base/platform/eap/prompts/MEM_RETRIEVE_CONTEXT_PROMPT.json | ✓ COMPLETE |
| MEM_LEARN_PATTERN | base/platform/eap/prompts/MEM_LEARN_PATTERN_PROMPT.json | ✓ COMPLETE |
| PRO_EVALUATE_TRIGGERS | base/platform/eap/prompts/PRO_EVALUATE_TRIGGERS_PROMPT.json | ✓ COMPLETE |

---

## PART 2: REMAINING DESKTOP CLAUDE WORK

### 2.1 Additional AI Builder Prompts Required

| Prompt Code | Purpose | Priority |
|-------------|---------|----------|
| CON_COLLECT_CONTRIBUTION | Prompt agents for contributions | HIGH |
| CON_SYNTHESIZE_RESPONSE | Combine contributions into unified response | HIGH |
| CON_RESOLVE_CONFLICTS | Handle disagreements between agents | HIGH |
| FILE_ANALYZE_CSV | Parse and analyze CSV uploads | HIGH |
| FILE_ANALYZE_EXCEL | Parse and analyze Excel uploads | HIGH |
| FILE_EXTRACT_PDF | Extract information from PDF uploads | HIGH |

### 2.2 Dataverse Schema Definitions

Tables required (Desktop Claude defines schema, VS Code creates):

| Table | Purpose | Records Est. |
|-------|---------|--------------|
| mpa_user_preferences | Store user defaults and preferences | Per user |
| mpa_session_memory | Session-level memory items | ~20 per session |
| eap_proactive_trigger | Trigger definitions | ~50 |
| eap_workflow_definition | Collaborative workflow templates | ~10 |
| eap_workflow_contribution | Contributions during workflows | Per workflow |
| eap_trigger_history | Track fired triggers | Grows |

### 2.3 ORC Instruction Updates

Update ORC_Copilot_Instructions_v1.txt to include:
- Memory initialization protocol
- Proactive intelligence integration
- Collaborative workflow initiation
- File processing handling

---

## PART 3: VS CODE WORK

### 3.1 Dataverse Table Creation

```
SEQUENCE:
1. Create mpa_user_preferences table
2. Create mpa_session_memory table
3. Create eap_proactive_trigger table
4. Create eap_workflow_definition table
5. Create eap_workflow_contribution table
6. Create eap_trigger_history table
7. Load seed data for triggers
8. Load seed data for workflow definitions
```

### 3.2 AI Builder Prompt Deployment

```
SEQUENCE:
1. Deploy MEM_STORE_PREFERENCE prompt
2. Deploy MEM_RETRIEVE_CONTEXT prompt
3. Deploy MEM_LEARN_PATTERN prompt
4. Deploy PRO_EVALUATE_TRIGGERS prompt
5. Deploy CON_COLLECT_CONTRIBUTION prompt
6. Deploy CON_SYNTHESIZE_RESPONSE prompt
7. Deploy CON_RESOLVE_CONFLICTS prompt
8. Deploy FILE_ANALYZE_CSV prompt
9. Deploy FILE_ANALYZE_EXCEL prompt
10. Deploy FILE_EXTRACT_PDF prompt
11. Test each prompt independently
```

### 3.3 Power Automate Flow Creation

| Flow Name | Purpose | Triggers |
|-----------|---------|----------|
| MPA_Memory_Initialize | Load preferences at session start | Copilot call |
| MPA_Memory_Store | Store new preferences | Copilot call |
| MPA_Memory_Retrieve | Retrieve relevant context | Flow call |
| MPA_Proactive_Evaluate | Evaluate triggers | Copilot call |
| MPA_Workflow_Orchestrate | Manage collaborative workflows | Copilot call |
| MPA_Workflow_Collect | Collect agent contributions | Flow call |
| MPA_File_Process | Process uploaded files | Copilot call |

### 3.4 Topic Updates

| Agent | Topic | Action |
|-------|-------|--------|
| ORC | System.Greeting | Add memory initialization call |
| ORC | CollaborativeWorkflow | New topic for workflow initiation |
| ORC | FileUpload | New topic for file handling |
| ALL | Existing Topics | Add proactive trigger evaluation |

---

## PART 4: EXECUTION SEQUENCE

### Phase 1: Desktop Claude Completes Definitions (TODAY)

```
Step 1: Create remaining AI Builder prompts (CON_*, FILE_*)
Step 2: Define complete Dataverse schemas
Step 3: Define Power Automate flow specifications
Step 4: Update ORC instructions
Step 5: Create seed data files for triggers and workflows
Step 6: Create VS Code execution prompt
Step 7: Commit all to repository
```

### Phase 2: VS Code Executes Infrastructure (AFTER DESKTOP)

```
Step 1: Create all Dataverse tables
Step 2: Load all seed data
Step 3: Deploy all AI Builder prompts
Step 4: Create all Power Automate flows
Step 5: Configure flow connections
Step 6: Update ORC agent with new instructions
Step 7: Create new topics
Step 8: Update existing topics with triggers
Step 9: Run validation tests
```

### Phase 3: Integration Testing (AFTER VS CODE)

```
Step 1: Test memory flow end-to-end
Step 2: Test proactive triggers
Step 3: Test collaborative workflows
Step 4: Test file processing
Step 5: Fix any issues
Step 6: Update documentation
```

---

## PART 5: DATAVERSE SCHEMA DEFINITIONS

### 5.1 mpa_user_preferences

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| mpa_user_preferencesid | GUID (PK) | Yes | Primary key |
| user_id | Text (100) | Yes | Azure AD user ID |
| user_email | Text (200) | No | User email for lookup |
| default_vertical | Text (50) | No | Default industry vertical |
| typical_budget_low | Currency | No | Low end of typical budget |
| typical_budget_high | Currency | No | High end of typical budget |
| preferred_channels_json | Multiline (4000) | No | JSON array of preferred channels |
| excluded_channels_json | Multiline (4000) | No | JSON array of excluded channels |
| preferred_kpis_json | Multiline (4000) | No | JSON array of preferred KPIs |
| communication_style | Choice | No | concise/detailed/balanced |
| measurement_philosophy | Choice | No | incrementality_first/attribution_focused/hybrid |
| learned_patterns_json | Multiline (8000) | No | JSON of learned behavioral patterns |
| last_session_id | Text (50) | No | Last session for continuity |
| session_count | Integer | No | Total sessions |
| preference_version | Integer | No | Version for optimistic concurrency |
| created_at | DateTime | Yes | Record creation |
| updated_at | DateTime | Yes | Last update |

### 5.2 mpa_session_memory

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| mpa_session_memoryid | GUID (PK) | Yes | Primary key |
| session_id | Text (50) | Yes | Parent session |
| user_id | Text (100) | Yes | User who owns memory |
| memory_type | Choice | Yes | preference/decision/context/pattern |
| memory_category | Choice | Yes | vertical/budget/channel/kpi/measurement/other |
| memory_key | Text (100) | Yes | Unique key within category |
| memory_value_json | Multiline (8000) | Yes | JSON value |
| confidence_score | Integer | Yes | 0-100 confidence |
| source_type | Choice | Yes | explicit/implicit/inferred |
| source_quote | Text (500) | No | Original text if explicit |
| is_persistent | Boolean | Yes | Survives session end |
| expires_at | DateTime | No | When memory expires |
| created_at | DateTime | Yes | When created |
| last_accessed_at | DateTime | No | Last retrieval |
| access_count | Integer | No | Times retrieved |

### 5.3 eap_proactive_trigger

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_proactive_triggerid | GUID (PK) | Yes | Primary key |
| trigger_code | Text (50) | Yes | Unique trigger identifier |
| trigger_name | Text (100) | Yes | Display name |
| description | Multiline (500) | No | What this trigger does |
| agent_code | Text (10) | Yes | Which agent owns trigger |
| trigger_category | Choice | Yes | alert/opportunity/recommendation/warning |
| severity | Choice | Yes | critical/important/suggestion/info |
| priority_order | Integer | Yes | Lower = higher priority |
| condition_json | Multiline (4000) | Yes | JSON condition definition |
| message_template | Multiline (1000) | Yes | Template with placeholders |
| cooldown_hours | Integer | No | Hours before can fire again |
| is_active | Boolean | Yes | Whether trigger is enabled |
| applies_to_steps_json | Multiline (500) | No | JSON array of applicable steps |
| created_at | DateTime | Yes | When created |

### 5.4 eap_workflow_definition

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_workflow_definitionid | GUID (PK) | Yes | Primary key |
| workflow_code | Text (50) | Yes | Unique workflow identifier |
| workflow_name | Text (100) | Yes | Display name |
| description | Multiline (500) | No | What this workflow does |
| trigger_phrases_json | Multiline (2000) | Yes | JSON array of trigger phrases |
| agent_sequence_json | Multiline (1000) | Yes | JSON array of agents in order |
| estimated_duration_seconds | Integer | No | Expected duration |
| output_type | Choice | Yes | plan/analysis/recommendation/document |
| synthesis_template | Multiline (4000) | No | Template for synthesis |
| is_active | Boolean | Yes | Whether workflow is enabled |
| created_at | DateTime | Yes | When created |

### 5.5 eap_workflow_contribution

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_workflow_contributionid | GUID (PK) | Yes | Primary key |
| workflow_instance_id | Text (50) | Yes | Workflow execution instance |
| session_id | Text (50) | Yes | Parent session |
| agent_code | Text (10) | Yes | Contributing agent |
| contribution_type | Choice | Yes | analysis/recommendation/validation/context |
| contribution_json | Multiline (16000) | Yes | Full contribution JSON |
| summary | Multiline (500) | No | Brief summary |
| confidence_overall | Integer | No | 0-100 |
| status | Choice | Yes | pending/complete/failed/skipped |
| started_at | DateTime | Yes | When dispatched |
| completed_at | DateTime | No | When received |
| error_message | Text (500) | No | If failed |

### 5.6 eap_trigger_history

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_trigger_historyid | GUID (PK) | Yes | Primary key |
| trigger_code | Text (50) | Yes | Which trigger |
| session_id | Text (50) | Yes | Which session |
| user_id | Text (100) | Yes | Which user |
| fired_at | DateTime | Yes | When fired |
| message_delivered | Multiline (1000) | No | Actual message shown |
| user_response | Choice | No | engaged/dismissed/ignored |
| context_snapshot_json | Multiline (4000) | No | Context when fired |

---

## PART 6: POWER AUTOMATE FLOW SPECIFICATIONS

### 6.1 MPA_Memory_Initialize

```yaml
Name: MPA_Memory_Initialize
Trigger: When called from Copilot
Description: Load user preferences and recent memories at session start

Inputs:
  - user_id (Text, Required)
  - session_id (Text, Required)

Process:
  1. Query mpa_user_preferences where user_id = @user_id
  2. If not found:
     - Create new mpa_user_preferences record
     - Return empty context
  3. If found:
     - Query mpa_session_memory where user_id = @user_id
       AND (is_persistent = true OR expires_at > utcnow())
       ORDER BY confidence_score DESC
       TOP 20
     - Call MEM_RETRIEVE_CONTEXT prompt with preferences and memories
     - Return context package

Outputs:
  - preferences_json (Text)
  - context_json (Text)
  - session_resume_available (Boolean)
  - last_session_summary (Text)
```

### 6.2 MPA_Memory_Store

```yaml
Name: MPA_Memory_Store
Trigger: When called from Copilot
Description: Store preferences and decisions during conversation

Inputs:
  - session_id (Text, Required)
  - user_id (Text, Required)
  - conversation_text (Text, Required)
  - existing_preferences_json (Text, Required)

Process:
  1. Call MEM_STORE_PREFERENCE prompt
  2. For each extracted preference:
     - Check if exists in mpa_session_memory
     - If exists: update confidence, last_accessed_at
     - If not: create new record
  3. If any preference has confidence >= 80 and is_persistent:
     - Update mpa_user_preferences accordingly
  4. Return summary of stored preferences

Outputs:
  - stored_count (Integer)
  - updated_count (Integer)
  - summary (Text)
```

### 6.3 MPA_Proactive_Evaluate

```yaml
Name: MPA_Proactive_Evaluate
Trigger: When called from Copilot
Description: Evaluate proactive triggers against current context

Inputs:
  - session_id (Text, Required)
  - user_id (Text, Required)
  - agent_code (Text, Required)
  - session_context_json (Text, Required)

Process:
  1. Query eap_proactive_trigger where agent_code = @agent_code
     AND is_active = true
  2. Query eap_trigger_history where user_id = @user_id
     AND fired_at > dateadd(hour, -24, utcnow())
  3. Call PRO_EVALUATE_TRIGGERS prompt
  4. For each fired trigger:
     - Create eap_trigger_history record
  5. Return fired triggers

Outputs:
  - triggers_fired_json (Text)
  - trigger_count (Integer)
```

### 6.4 MPA_Workflow_Orchestrate

```yaml
Name: MPA_Workflow_Orchestrate
Trigger: When called from Copilot
Description: Orchestrate collaborative multi-agent workflow

Inputs:
  - session_id (Text, Required)
  - user_id (Text, Required)
  - workflow_code (Text, Required)
  - original_request (Text, Required)
  - context_json (Text, Required)

Process:
  1. Query eap_workflow_definition where workflow_code = @workflow_code
  2. Generate workflow_instance_id
  3. Parse agent_sequence_json
  4. For each agent in sequence:
     - Call MPA_Workflow_Collect with accumulated context
     - Store contribution in eap_workflow_contribution
     - Add contribution to context for next agent
  5. After all contributions collected:
     - Call CON_SYNTHESIZE_RESPONSE prompt
  6. Return synthesized response

Outputs:
  - synthesized_response (Text)
  - contributions_json (Text)
  - workflow_duration_seconds (Integer)
  - confidence_overall (Integer)
```

### 6.5 MPA_File_Process

```yaml
Name: MPA_File_Process
Trigger: When called from Copilot
Description: Process uploaded files and extract data

Inputs:
  - session_id (Text, Required)
  - file_url (Text, Required)
  - file_type (Text, Required)
  - file_name (Text, Required)

Process:
  1. Validate file_type (csv, xlsx, pdf)
  2. Based on file_type:
     - CSV: Call FILE_ANALYZE_CSV prompt
     - Excel: Call FILE_ANALYZE_EXCEL prompt
     - PDF: Call FILE_EXTRACT_PDF prompt
  3. Store extracted data in mpa_session_memory
  4. Return extraction summary

Outputs:
  - extraction_summary (Text)
  - extracted_data_json (Text)
  - fields_mapped_json (Text)
  - clarifications_needed_json (Text)
```

---

## PART 7: SEED DATA

### 7.1 Proactive Triggers Seed Data

```csv
trigger_code,trigger_name,agent_code,trigger_category,severity,priority_order,condition_json,message_template,cooldown_hours,is_active
ANL_SATURATION_WARNING,Budget Saturation Warning,ANL,alert,important,1,"{\"field\":\"channel_allocation_pct\",\"operator\":\"greater_than\",\"value\":35}","Your {{channel_name}} allocation of {{current_value}}% is approaching saturation. Marginal returns typically decline above 35%. Would you like me to model alternatives?",24,true
ANL_LOW_CONFIDENCE,Low Confidence Alert,ANL,warning,important,2,"{\"field\":\"confidence_score\",\"operator\":\"less_than\",\"value\":50}","The confidence level for this projection is {{confidence_score}}%, which is relatively low. This is usually due to {{primary_reason}}. Would you like me to explain how to improve it?",12,true
CHA_BENCHMARK_VARIANCE,Benchmark Variance Alert,CHA,opportunity,suggestion,3,"{\"field\":\"cpm\",\"compare_to\":\"benchmark.cpm\",\"operator\":\"exceeds_by_pct\",\"threshold_pct\":20}","Your target CPM of ${{current_value}} is {{variance_pct}}% above the {{vertical}} benchmark of ${{benchmark_value}}. This might be intentional for premium inventory, but I wanted to flag it.",24,true
CHA_EMERGING_OPPORTUNITY,Emerging Channel Opportunity,CHA,opportunity,suggestion,4,"{\"field\":\"emerging_channel_fit\",\"operator\":\"greater_than\",\"value\":0.7}","Based on your objectives, {{emerging_channel}} shows strong potential with {{benchmark_roas}}x benchmark ROAS for {{vertical}}. Would you like me to include it in the mix?",48,true
PRF_ATTRIBUTION_MISSING,Attribution Model Missing,PRF,recommendation,important,2,"{\"required_field\":\"attribution_model\",\"when\":{\"budget\":{\"greater_than\":100000}}}","With a {{budget}} budget, an explicit attribution model helps justify spend and optimize in-flight. Would you like me to recommend an approach?",24,true
PRF_MEASUREMENT_GAP,Measurement Gap Detected,PRF,warning,suggestion,3,"{\"field\":\"measurement_coverage\",\"operator\":\"less_than\",\"value\":0.8}","Your current measurement approach covers about {{coverage_pct}}% of the expected touchpoints. The gap is primarily in {{gap_area}}. Want me to suggest additions?",24,true
AUD_SEGMENT_OVERLAP,Segment Overlap Warning,AUD,alert,suggestion,3,"{\"field\":\"segment_overlap_pct\",\"operator\":\"greater_than\",\"value\":30}","I notice {{overlap_pct}}% overlap between your {{segment_1}} and {{segment_2}} segments. This could lead to frequency issues. Should I suggest refinements?",24,true
AUD_LTV_OPPORTUNITY,High LTV Segment Opportunity,AUD,opportunity,suggestion,4,"{\"field\":\"segment_ltv_index\",\"operator\":\"greater_than\",\"value\":130}","Your {{segment_name}} segment has an LTV index of {{ltv_index}}, significantly above average. Consider increasing allocation here for better long-term returns.",48,true
```

### 7.2 Workflow Definitions Seed Data

```csv
workflow_code,workflow_name,description,trigger_phrases_json,agent_sequence_json,estimated_duration_seconds,output_type,is_active
FULL_MEDIA_PLAN,Complete Media Plan,Full campaign strategy with all elements,"[\"complete media plan\",\"full campaign strategy\",\"build me a plan\",\"comprehensive media plan\",\"end to end plan\"]","[\"ANL\",\"AUD\",\"CHA\",\"PRF\",\"DOC\"]",60,document,true
BUDGET_OPTIMIZATION,Budget Optimization,Optimize budget allocation across channels,"[\"optimize my budget\",\"best budget allocation\",\"how should I allocate\",\"budget optimization\"]","[\"ANL\",\"CHA\",\"PRF\"]",40,recommendation,true
AUDIENCE_CHANNEL_FIT,Audience-Channel Fit,Match channels to audience segments,"[\"which channels for my audience\",\"how to reach my target\",\"channel recommendations for\",\"best channels for segment\"]","[\"AUD\",\"CHA\"]",30,recommendation,true
MEASUREMENT_STRATEGY,Measurement Strategy,Define measurement and attribution approach,"[\"how should I measure\",\"attribution approach\",\"measurement strategy\",\"KPI framework\"]","[\"PRF\",\"ANL\"]",30,recommendation,true
CAMPAIGN_ANALYSIS,Campaign Analysis,Analyze campaign performance with recommendations,"[\"analyze this campaign\",\"what happened with\",\"campaign performance review\",\"why did performance\"]","[\"PRF\",\"ANL\",\"CHA\"]",40,analysis,true
```

---

## PART 8: FILE MANIFEST

### Desktop Claude Deliverables

| File | Status | Action |
|------|--------|--------|
| docs/MPA_v6_H1H2_Workplan.md | NEW | This document |
| base/platform/eap/kb/EAP_KB_Memory_System_v1.txt | COMPLETE | Committed |
| base/platform/eap/kb/EAP_KB_Proactive_Intelligence_v1.txt | COMPLETE | Committed |
| base/platform/eap/kb/EAP_KB_Consensus_Protocol_v1.txt | COMPLETE | Committed |
| base/agents/orc/kb/ORC_KB_Session_Management_v1.txt | COMPLETE | Committed |
| base/agents/orc/kb/ORC_KB_Collaborative_Orchestration_v1.txt | COMPLETE | Committed |
| base/agents/doc/kb/DOC_KB_File_Processing_v1.txt | COMPLETE | Committed |
| base/platform/eap/prompts/MEM_STORE_PREFERENCE_PROMPT.json | COMPLETE | Committed |
| base/platform/eap/prompts/MEM_RETRIEVE_CONTEXT_PROMPT.json | COMPLETE | Committed |
| base/platform/eap/prompts/MEM_LEARN_PATTERN_PROMPT.json | COMPLETE | Committed |
| base/platform/eap/prompts/PRO_EVALUATE_TRIGGERS_PROMPT.json | COMPLETE | Committed |
| base/platform/eap/prompts/CON_COLLECT_CONTRIBUTION_PROMPT.json | PENDING | Create now |
| base/platform/eap/prompts/CON_SYNTHESIZE_RESPONSE_PROMPT.json | PENDING | Create now |
| base/platform/eap/prompts/FILE_ANALYZE_CSV_PROMPT.json | PENDING | Create now |
| base/platform/eap/prompts/FILE_ANALYZE_EXCEL_PROMPT.json | PENDING | Create now |
| base/platform/eap/prompts/FILE_EXTRACT_PDF_PROMPT.json | PENDING | Create now |
| base/dataverse/seed/eap_proactive_trigger_seed.csv | PENDING | Create now |
| base/dataverse/seed/eap_workflow_definition_seed.csv | PENDING | Create now |
| docs/VSCODE_H1H2_Execution_Prompt.md | PENDING | Create now |

### VS Code Deliverables

| Deliverable | Depends On |
|-------------|------------|
| Dataverse tables (6) | Schema definitions in this document |
| AI Builder prompts (10) | Prompt JSON files |
| Power Automate flows (5) | Flow specifications in this document |
| Seed data loaded | Seed CSV files |
| ORC instruction update | Updated instruction file |
| Topic updates | Flow availability |

---

## PART 9: SUCCESS CRITERIA

### Memory System
- [ ] User preferences persist across sessions
- [ ] Session can be resumed with context
- [ ] Preferences are learned from behavior
- [ ] Memory confidence decays appropriately

### Proactive Intelligence
- [ ] Triggers fire at appropriate moments
- [ ] Messages are natural and helpful
- [ ] Cooldown prevents repetition
- [ ] User response affects future triggers

### Agent Consensus
- [ ] Collaborative workflows complete successfully
- [ ] Contributions are synthesized coherently
- [ ] Conflicts are handled transparently
- [ ] User sees unified recommendation

### File Processing
- [ ] CSV files parse correctly
- [ ] Excel files extract data
- [ ] PDF text is extracted
- [ ] Ambiguities are flagged for user

---

**Document Version:** 1.0  
**Created:** January 19, 2026  
**Author:** Claude (Desktop)  
**Status:** Active - Completing Desktop Deliverables
