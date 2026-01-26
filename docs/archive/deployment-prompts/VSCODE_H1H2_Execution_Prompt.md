# MPA v6.1 HORIZON 1+2 VS CODE EXECUTION PROMPT

**Document:** VSCODE_H1H2_Execution_Prompt.md  
**Version:** 1.0  
**Date:** January 19, 2026  
**Status:** Ready for Execution  
**Scope:** Horizon 1 (Memory, Proactive Intelligence) + Horizon 2 (Multi-Modal, Consensus Protocol)

---

## EXECUTION OVERVIEW

This prompt contains all instructions for VS Code Claude to implement the H1+H2 enhancements to the MPA v6.0 platform. Desktop Claude has completed all definitions, schemas, KB files, and AI Builder prompts. VS Code needs to:

1. Create 6 new Dataverse tables
2. Load seed data for triggers and workflows
3. Deploy 10 AI Builder prompts
4. Create 5 Power Automate flows
5. Update ORC agent instructions
6. Create new topics
7. Run validation tests

---

## PART 1: PREREQUISITES

### 1.1 Verify Environment

```bash
# Verify pac CLI authentication
pac auth list
pac org who

# Expected: Connected to Mastercard environment
```

### 1.2 File Locations

All source files are in the repository at:

```
Repository: Kessel-Digital-Agent-Platform
Branch: deploy/mastercard

Schemas: base/dataverse/schema/
- mpa_user_preferences.json
- mpa_session_memory.json
- eap_proactive_trigger.json
- eap_workflow_definition.json
- eap_workflow_contribution.json
- eap_trigger_history.json

Seed Data: base/dataverse/seed/
- eap_proactive_trigger_seed.csv
- eap_workflow_definition_seed.csv

AI Builder Prompts: base/platform/eap/prompts/
- MEM_STORE_PREFERENCE_PROMPT.json
- MEM_RETRIEVE_CONTEXT_PROMPT.json
- MEM_LEARN_PATTERN_PROMPT.json
- PRO_EVALUATE_TRIGGERS_PROMPT.json
- CON_COLLECT_CONTRIBUTION_PROMPT.json
- CON_SYNTHESIZE_RESPONSE_PROMPT.json
- FILE_ANALYZE_CSV_PROMPT.json
- FILE_ANALYZE_EXCEL_PROMPT.json
- FILE_EXTRACT_PDF_PROMPT.json

KB Files: base/platform/eap/kb/
- EAP_KB_Memory_System_v1.txt
- EAP_KB_Proactive_Intelligence_v1.txt
- EAP_KB_Consensus_Protocol_v1.txt

KB Files: base/agents/orc/kb/
- ORC_KB_Session_Management_v1.txt
- ORC_KB_Collaborative_Orchestration_v1.txt

KB Files: base/agents/doc/kb/
- DOC_KB_File_Processing_v1.txt
```

---

## PART 2: DATAVERSE TABLE CREATION

### 2.1 Create mpa_user_preferences Table

```bash
# Navigate to Power Apps Maker Portal or use pac CLI

# Option A: Using pac CLI with solution
pac solution create \
  --name "MPA_v61_H1H2_Enhancement" \
  --publisher-name "KesselDigital" \
  --publisher-prefix "kd"

# Add table to solution - create via Power Apps portal first
# Table Settings:
# - Display Name: User Preferences
# - Plural Name: User Preferences
# - Schema Name: mpa_user_preferences
# - Primary Column: user_email (Text, 200)
# - Enable for use in Copilot: Yes
# - Track changes: Yes
```

**Table Columns to Create:**

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| user_id | Text (100) | Yes | Unique index |
| user_email | Text (200) | No | Primary display |
| default_vertical | Text (50) | No | |
| typical_budget_low | Currency | No | |
| typical_budget_high | Currency | No | |
| preferred_channels_json | Multiline (4000) | No | |
| excluded_channels_json | Multiline (4000) | No | |
| preferred_kpis_json | Multiline (4000) | No | |
| communication_style | Choice | No | concise/detailed/balanced |
| measurement_philosophy | Choice | No | incrementality_first/attribution_focused/hybrid |
| learned_patterns_json | Multiline (8000) | No | |
| last_session_id | Text (50) | No | |
| session_count | Whole Number | No | |
| preference_version | Whole Number | No | |
| created_at | DateTime | Yes | |
| updated_at | DateTime | Yes | |

### 2.2 Create mpa_session_memory Table

**Table Settings:**
- Display Name: Session Memory
- Plural Name: Session Memories
- Schema Name: mpa_session_memory
- Primary Column: memory_key (Text, 100)

**Columns:**

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| session_id | Text (50) | Yes | |
| user_id | Text (100) | Yes | |
| memory_type | Choice | Yes | preference/decision/context/pattern |
| memory_category | Choice | Yes | vertical/budget/channel/kpi/measurement/audience/other |
| memory_key | Text (100) | Yes | |
| memory_value_json | Multiline (8000) | Yes | |
| confidence_score | Whole Number | Yes | 0-100 |
| source_type | Choice | Yes | explicit/implicit/inferred |
| source_quote | Text (500) | No | |
| is_persistent | Yes/No | Yes | Default: No |
| expires_at | DateTime | No | |
| created_at | DateTime | Yes | |
| last_accessed_at | DateTime | No | |
| access_count | Whole Number | No | |

### 2.3 Create eap_proactive_trigger Table

**Table Settings:**
- Display Name: Proactive Trigger
- Plural Name: Proactive Triggers
- Schema Name: eap_proactive_trigger
- Primary Column: trigger_name (Text, 100)

**Columns:**

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| trigger_code | Text (50) | Yes | Unique |
| trigger_name | Text (100) | Yes | |
| description | Multiline (500) | No | |
| agent_code | Text (10) | Yes | |
| trigger_category | Choice | Yes | alert/opportunity/recommendation/warning |
| severity | Choice | Yes | critical/important/suggestion/info |
| priority_order | Whole Number | Yes | |
| condition_json | Multiline (4000) | Yes | |
| message_template | Multiline (1000) | Yes | |
| cooldown_hours | Whole Number | No | |
| is_active | Yes/No | Yes | Default: Yes |
| applies_to_steps_json | Multiline (500) | No | |
| created_at | DateTime | Yes | |

### 2.4 Create eap_workflow_definition Table

**Table Settings:**
- Display Name: Workflow Definition
- Plural Name: Workflow Definitions
- Schema Name: eap_workflow_definition
- Primary Column: workflow_name (Text, 100)

**Columns:**

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| workflow_code | Text (50) | Yes | Unique |
| workflow_name | Text (100) | Yes | |
| description | Multiline (500) | No | |
| trigger_phrases_json | Multiline (2000) | Yes | |
| agent_sequence_json | Multiline (1000) | Yes | |
| estimated_duration_seconds | Whole Number | No | |
| output_type | Choice | Yes | plan/analysis/recommendation/document |
| synthesis_template | Multiline (4000) | No | |
| is_active | Yes/No | Yes | Default: Yes |
| created_at | DateTime | Yes | |

### 2.5 Create eap_workflow_contribution Table

**Table Settings:**
- Display Name: Workflow Contribution
- Plural Name: Workflow Contributions
- Schema Name: eap_workflow_contribution
- Primary Column: workflow_instance_id (Text, 50)

**Columns:**

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| workflow_instance_id | Text (50) | Yes | |
| session_id | Text (50) | Yes | |
| agent_code | Text (10) | Yes | |
| contribution_type | Choice | Yes | analysis/recommendation/validation/context |
| contribution_json | Multiline (16000) | Yes | |
| summary | Multiline (500) | No | |
| confidence_overall | Whole Number | No | 0-100 |
| status | Choice | Yes | pending/complete/failed/skipped |
| started_at | DateTime | Yes | |
| completed_at | DateTime | No | |
| error_message | Text (500) | No | |

### 2.6 Create eap_trigger_history Table

**Table Settings:**
- Display Name: Trigger History
- Plural Name: Trigger History
- Schema Name: eap_trigger_history
- Primary Column: trigger_code (Text, 50)

**Columns:**

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| trigger_code | Text (50) | Yes | |
| session_id | Text (50) | Yes | |
| user_id | Text (100) | Yes | |
| fired_at | DateTime | Yes | |
| message_delivered | Multiline (1000) | No | |
| user_response | Choice | No | engaged/dismissed/ignored |
| context_snapshot_json | Multiline (4000) | No | |

---

## PART 3: LOAD SEED DATA

### 3.1 Load Proactive Triggers

Use the seed data from `base/dataverse/seed/eap_proactive_trigger_seed.csv`:

```bash
pac data import \
  --data ./base/dataverse/seed/eap_proactive_trigger_seed.csv \
  --table eap_proactive_trigger
```

**Expected Records: 8 triggers**

| trigger_code | agent_code | trigger_category |
|--------------|------------|------------------|
| ANL_SATURATION_WARNING | ANL | alert |
| ANL_LOW_CONFIDENCE | ANL | warning |
| CHA_BENCHMARK_VARIANCE | CHA | opportunity |
| CHA_EMERGING_OPPORTUNITY | CHA | opportunity |
| PRF_ATTRIBUTION_MISSING | PRF | recommendation |
| PRF_MEASUREMENT_GAP | PRF | warning |
| AUD_SEGMENT_OVERLAP | AUD | alert |
| AUD_LTV_OPPORTUNITY | AUD | opportunity |

### 3.2 Load Workflow Definitions

Use the seed data from `base/dataverse/seed/eap_workflow_definition_seed.csv`:

```bash
pac data import \
  --data ./base/dataverse/seed/eap_workflow_definition_seed.csv \
  --table eap_workflow_definition
```

**Expected Records: 5 workflows**

| workflow_code | workflow_name | agent_sequence |
|---------------|---------------|----------------|
| FULL_MEDIA_PLAN | Complete Media Plan | ANL,AUD,CHA,PRF,DOC |
| BUDGET_OPTIMIZATION | Budget Optimization | ANL,CHA,PRF |
| AUDIENCE_CHANNEL_FIT | Audience-Channel Fit | AUD,CHA |
| MEASUREMENT_STRATEGY | Measurement Strategy | PRF,ANL |
| CAMPAIGN_ANALYSIS | Campaign Analysis | PRF,ANL,CHA |

---

## PART 4: AI BUILDER PROMPT DEPLOYMENT

### 4.1 Deploy Memory Prompts

Deploy each prompt from the JSON files. Example for MEM_STORE_PREFERENCE:

**Navigate to:** AI Builder > Explore > Custom prompts > Create

**Prompt 1: MEM_STORE_PREFERENCE**
```
Name: MEM_STORE_PREFERENCE
Description: Extract and store user preferences from conversation

System Message:
You are a preference extraction specialist. Analyze the conversation and extract any stated or implied preferences about media planning.

Extract preferences in these categories:
- vertical: Industry preferences (retail, finance, healthcare, etc.)
- budget: Budget ranges or constraints mentioned
- channel: Preferred or excluded channels
- kpi: Preferred metrics or measurement approaches
- measurement: Attribution or measurement philosophy

For each preference found:
1. Determine confidence (0-100):
   - 90-100: Explicitly stated ("I always use...", "We never...")
   - 70-89: Strongly implied ("We typically...", "Our approach is...")
   - 50-69: Weakly implied (contextual inference)
   - Below 50: Do not extract

2. Determine persistence:
   - true: Fundamental preference ("We only work with...")
   - false: Session-specific ("For this campaign...")

Output valid JSON only:
{
  "preferences": [
    {
      "category": "string",
      "key": "string",
      "value": any,
      "confidence": number,
      "is_persistent": boolean,
      "source_quote": "string"
    }
  ],
  "extraction_summary": "string"
}

User Message Template:
Conversation so far:
{{conversation_text}}

Current known preferences:
{{existing_preferences_json}}

Extract any new or updated preferences.

Temperature: 0.2
Max Tokens: 1500
```

**Prompt 2: MEM_RETRIEVE_CONTEXT**
```
Name: MEM_RETRIEVE_CONTEXT
Description: Retrieve and format relevant context from user memories

System Message:
You are a context assembly specialist. Given user preferences and memories, construct a relevant context summary for the current request.

Prioritize context by:
1. Direct relevance to current request
2. Confidence score (higher = more important)
3. Recency (more recent = more relevant)
4. Persistence (persistent preferences always included)

Output valid JSON:
{
  "context_summary": "string",
  "applied_preferences": [
    {
      "category": "string",
      "key": "string",
      "value": any,
      "applied_as": "string"
    }
  ],
  "session_continuity": {
    "can_resume": boolean,
    "last_topic": "string",
    "last_step": number
  }
}

User Message Template:
User preferences:
{{preferences_json}}

Recent memories:
{{memories_json}}

Current request context:
{{current_request}}

Temperature: 0.1
Max Tokens: 1000
```

**Prompt 3: MEM_LEARN_PATTERN**
```
Name: MEM_LEARN_PATTERN
Description: Learn behavioral patterns from user interactions

System Message:
You are a behavioral pattern analyst. Analyze user interaction history to identify consistent patterns that can personalize future interactions.

Look for patterns in:
- Question style: How they ask questions
- Detail preference: Concise vs detailed responses
- Channel preferences: Frequently mentioned channels
- KPI focus: Which metrics they care about
- Decision style: Data-driven vs intuition

Output valid JSON:
{
  "patterns_identified": [
    {
      "pattern_type": "string",
      "pattern_description": "string",
      "evidence_count": number,
      "confidence": number,
      "recommendation": "string"
    }
  ],
  "communication_style_update": {
    "suggested_style": "concise|detailed|balanced",
    "reasoning": "string"
  }
}

User Message Template:
Interaction history:
{{interaction_history_json}}

Current patterns:
{{current_patterns_json}}

Temperature: 0.3
Max Tokens: 1200
```

**Prompt 4: PRO_EVALUATE_TRIGGERS**
```
Name: PRO_EVALUATE_TRIGGERS
Description: Evaluate proactive triggers against current context

System Message:
You are a proactive intelligence evaluator. Given the current session context and available triggers, determine which triggers should fire.

Evaluation rules:
1. Check if condition is met based on context
2. Check cooldown (don't fire if recently fired)
3. Check relevance to current conversation step
4. Prioritize by severity (critical > important > suggestion > info)
5. Limit to 2 triggers per evaluation to avoid overwhelming user

Output valid JSON:
{
  "triggers_to_fire": [
    {
      "trigger_code": "string",
      "message": "string",
      "severity": "string",
      "context_values": {}
    }
  ],
  "triggers_suppressed": [
    {
      "trigger_code": "string",
      "reason": "string"
    }
  ],
  "evaluation_summary": "string"
}

User Message Template:
Available triggers:
{{triggers_json}}

Current context:
{{context_json}}

Recent trigger history:
{{trigger_history_json}}

Temperature: 0.1
Max Tokens: 1000
```

### 4.2 Deploy Consensus Prompts

**Prompt 5: CON_COLLECT_CONTRIBUTION**
```
Name: CON_COLLECT_CONTRIBUTION
Description: Prompt an agent to contribute to a collaborative workflow

System Message:
You are a contribution coordinator. Frame a request to a specialist agent to contribute their expertise to a collaborative workflow.

The contribution request should:
1. Clearly state what analysis/recommendation is needed
2. Provide relevant context from previous contributions
3. Specify the output format expected
4. Set expectations for confidence assessment

Output valid JSON:
{
  "agent_prompt": "string",
  "expected_contribution_type": "analysis|recommendation|validation|context",
  "context_provided": {},
  "output_schema_hint": "string"
}

User Message Template:
Workflow: {{workflow_code}}
Current agent: {{agent_code}}
Original user request: {{original_request}}
Previous contributions: {{previous_contributions_json}}

Temperature: 0.2
Max Tokens: 800
```

**Prompt 6: CON_SYNTHESIZE_RESPONSE**
```
Name: CON_SYNTHESIZE_RESPONSE
Description: Synthesize multiple agent contributions into unified response

System Message:
You are a synthesis specialist. Combine contributions from multiple specialist agents into a coherent, unified response.

Synthesis guidelines:
1. Identify common themes and agreements
2. Flag any conflicts or disagreements
3. Prioritize by confidence and relevance
4. Create a narrative that flows logically
5. Attribute key insights to appropriate agents
6. Calculate overall confidence as weighted average

Output valid JSON:
{
  "synthesized_response": "string",
  "key_findings": [
    {
      "finding": "string",
      "source_agent": "string",
      "confidence": number
    }
  ],
  "conflicts_resolved": [
    {
      "conflict": "string",
      "resolution": "string",
      "reasoning": "string"
    }
  ],
  "overall_confidence": number,
  "agent_contribution_summary": {}
}

User Message Template:
Original request: {{original_request}}
Workflow: {{workflow_code}}
Contributions:
{{contributions_json}}

Synthesis template (if any):
{{synthesis_template}}

Temperature: 0.3
Max Tokens: 2500
```

### 4.3 Deploy File Processing Prompts

**Prompt 7: FILE_ANALYZE_CSV**
```
Name: FILE_ANALYZE_CSV
Description: Parse and analyze CSV file content

System Message:
You are a data analyst specialist. Analyze the provided CSV data and extract relevant information for media planning.

Analysis steps:
1. Identify column types (campaign, channel, metric, date, etc.)
2. Map columns to MPA concepts where possible
3. Calculate summary statistics
4. Identify any data quality issues
5. Suggest how data can be used in planning

Output valid JSON:
{
  "file_summary": {
    "row_count": number,
    "column_count": number,
    "date_range": {"start": "string", "end": "string"}
  },
  "column_mapping": [
    {
      "source_column": "string",
      "mpa_field": "string",
      "data_type": "string",
      "sample_values": []
    }
  ],
  "statistics": {},
  "data_quality": {
    "issues": [],
    "completeness_pct": number
  },
  "suggested_uses": ["string"],
  "clarifications_needed": ["string"]
}

User Message Template:
File name: {{file_name}}
CSV content (first 100 rows):
{{csv_content}}

Temperature: 0.2
Max Tokens: 2000
```

**Prompt 8: FILE_ANALYZE_EXCEL**
```
Name: FILE_ANALYZE_EXCEL
Description: Parse and analyze Excel file content

System Message:
You are a spreadsheet analyst. Analyze Excel file content extracted as JSON and identify relevant media planning data.

Analysis steps:
1. Identify sheet purposes
2. Find tables and named ranges
3. Map data to MPA concepts
4. Extract formulas if relevant
5. Identify budget tables, channel allocations, benchmarks

Output valid JSON:
{
  "sheets_analyzed": [
    {
      "sheet_name": "string",
      "purpose": "string",
      "tables_found": number,
      "relevant_to_mpa": boolean
    }
  ],
  "extracted_data": {
    "budgets": [],
    "channel_allocations": [],
    "benchmarks": [],
    "metrics": []
  },
  "suggested_uses": ["string"],
  "clarifications_needed": ["string"]
}

User Message Template:
File name: {{file_name}}
Sheet data:
{{sheet_data_json}}

Temperature: 0.2
Max Tokens: 2000
```

**Prompt 9: FILE_EXTRACT_PDF**
```
Name: FILE_EXTRACT_PDF
Description: Extract information from PDF document

System Message:
You are a document analyst. Extract relevant information from PDF content for media planning purposes.

Extraction focus:
1. Campaign objectives and requirements
2. Budget information
3. Audience definitions
4. Channel specifications
5. Timing and deadlines
6. Success metrics

Output valid JSON:
{
  "document_type": "string",
  "extracted_fields": {
    "campaign_name": "string",
    "client": "string",
    "budget": {},
    "objectives": [],
    "audience": {},
    "channels": [],
    "timeline": {},
    "kpis": []
  },
  "confidence_by_field": {},
  "clarifications_needed": ["string"]
}

User Message Template:
File name: {{file_name}}
PDF text content:
{{pdf_text}}

Temperature: 0.2
Max Tokens: 2000
```

**Prompt 10: CON_RESOLVE_CONFLICTS** (Additional - for conflict resolution)
```
Name: CON_RESOLVE_CONFLICTS
Description: Resolve conflicts between agent contributions

System Message:
You are a conflict resolution specialist. When agents disagree, analyze the disagreement and recommend a resolution.

Resolution approaches:
1. Data-driven: Which position has stronger data support?
2. Confidence-weighted: Higher confidence wins
3. Context-specific: Which is more appropriate for this situation?
4. Hybrid: Blend both perspectives

Output valid JSON:
{
  "conflict_description": "string",
  "positions": [
    {
      "agent": "string",
      "position": "string",
      "confidence": number,
      "evidence": "string"
    }
  ],
  "resolution": {
    "approach": "string",
    "recommendation": "string",
    "reasoning": "string"
  },
  "user_decision_needed": boolean,
  "user_question": "string"
}

User Message Template:
Conflict context:
{{conflict_context_json}}

Agent positions:
{{positions_json}}

Temperature: 0.3
Max Tokens: 1000
```

---

## PART 5: POWER AUTOMATE FLOW CREATION

### 5.1 MPA_Memory_Initialize Flow

**Flow Configuration:**

```yaml
Name: MPA_Memory_Initialize
Type: Instant cloud flow
Trigger: When Copilot calls a flow
Description: Load user preferences and context at session start

Inputs:
  - user_id (Text, Required)
  - session_id (Text, Required)

Actions:
  1. List rows from mpa_user_preferences
     - Filter: user_id eq '@{triggerBody()['user_id']}'
     
  2. Condition: Is user found?
     - Yes: Continue to step 3
     - No: Create new mpa_user_preferences record, return empty context
     
  3. List rows from mpa_session_memory
     - Filter: user_id eq '@{triggerBody()['user_id']}' and (is_persistent eq true or expires_at gt '@{utcNow()}')
     - Order by: confidence_score desc
     - Top: 20
     
  4. Call MEM_RETRIEVE_CONTEXT AI Builder prompt
     - preferences_json: @{body('List_rows_preferences')}
     - memories_json: @{body('List_rows_memory')}
     - current_request: "Session initialization"
     
  5. Parse JSON response
  
  6. Return to Copilot:
     - preferences_json
     - context_json
     - session_resume_available
     - last_session_summary
```

### 5.2 MPA_Memory_Store Flow

**Flow Configuration:**

```yaml
Name: MPA_Memory_Store
Type: Instant cloud flow
Trigger: When Copilot calls a flow
Description: Store preferences and decisions during conversation

Inputs:
  - session_id (Text, Required)
  - user_id (Text, Required)
  - conversation_text (Text, Required)
  - existing_preferences_json (Text, Required)

Actions:
  1. Call MEM_STORE_PREFERENCE AI Builder prompt
     - conversation_text: @{triggerBody()['conversation_text']}
     - existing_preferences_json: @{triggerBody()['existing_preferences_json']}
     
  2. Parse JSON response
  
  3. Apply to each preference:
     a. Get rows from mpa_session_memory
        - Filter: session_id eq '@{session_id}' and memory_category eq '@{item().category}' and memory_key eq '@{item().key}'
     b. Condition: Record exists?
        - Yes: Update row (increase confidence, update value)
        - No: Add new row
        
  4. Condition: Any preference has confidence >= 80 and is_persistent = true?
     - Yes: Update mpa_user_preferences accordingly
     
  5. Return to Copilot:
     - stored_count
     - updated_count
     - summary
```

### 5.3 MPA_Proactive_Evaluate Flow

**Flow Configuration:**

```yaml
Name: MPA_Proactive_Evaluate
Type: Instant cloud flow
Trigger: When Copilot calls a flow
Description: Evaluate proactive triggers against current context

Inputs:
  - session_id (Text, Required)
  - user_id (Text, Required)
  - agent_code (Text, Required)
  - session_context_json (Text, Required)

Actions:
  1. List rows from eap_proactive_trigger
     - Filter: agent_code eq '@{triggerBody()['agent_code']}' and is_active eq true
     
  2. List rows from eap_trigger_history
     - Filter: user_id eq '@{triggerBody()['user_id']}' and fired_at gt '@{addHours(utcNow(), -24)}'
     
  3. Call PRO_EVALUATE_TRIGGERS AI Builder prompt
     - triggers_json: @{body('List_triggers')}
     - context_json: @{triggerBody()['session_context_json']}
     - trigger_history_json: @{body('List_history')}
     
  4. Parse JSON response
  
  5. Apply to each fired trigger:
     - Add row to eap_trigger_history
     
  6. Return to Copilot:
     - triggers_fired_json
     - trigger_count
```

### 5.4 MPA_Workflow_Orchestrate Flow

**Flow Configuration:**

```yaml
Name: MPA_Workflow_Orchestrate
Type: Instant cloud flow
Trigger: When Copilot calls a flow
Description: Orchestrate collaborative multi-agent workflow

Inputs:
  - session_id (Text, Required)
  - user_id (Text, Required)
  - workflow_code (Text, Required)
  - original_request (Text, Required)
  - context_json (Text, Required)

Actions:
  1. Get row from eap_workflow_definition
     - Filter: workflow_code eq '@{triggerBody()['workflow_code']}'
     
  2. Initialize variable: workflow_instance_id = @{guid()}
  
  3. Parse agent_sequence_json to array
  
  4. Initialize variable: contributions_json = []
  
  5. Apply to each agent in sequence:
     a. Call CON_COLLECT_CONTRIBUTION AI Builder prompt
        - workflow_code: @{triggerBody()['workflow_code']}
        - agent_code: @{item()}
        - original_request: @{triggerBody()['original_request']}
        - previous_contributions_json: @{variables('contributions_json')}
        
     b. Add row to eap_workflow_contribution
        - workflow_instance_id: @{variables('workflow_instance_id')}
        - session_id: @{triggerBody()['session_id']}
        - agent_code: @{item()}
        - status: complete
        - contribution_json: @{body('AI_Builder_response')}
        
     c. Append to contributions_json array
     
  6. Call CON_SYNTHESIZE_RESPONSE AI Builder prompt
     - original_request: @{triggerBody()['original_request']}
     - workflow_code: @{triggerBody()['workflow_code']}
     - contributions_json: @{variables('contributions_json')}
     - synthesis_template: @{body('Get_workflow').synthesis_template}
     
  7. Parse JSON response
  
  8. Return to Copilot:
     - synthesized_response
     - contributions_json
     - workflow_duration_seconds
     - confidence_overall
```

### 5.5 MPA_File_Process Flow

**Flow Configuration:**

```yaml
Name: MPA_File_Process
Type: Instant cloud flow
Trigger: When Copilot calls a flow
Description: Process uploaded files and extract data

Inputs:
  - session_id (Text, Required)
  - file_content (Text, Required)  # Base64 or text content
  - file_type (Text, Required)  # csv, xlsx, pdf
  - file_name (Text, Required)

Actions:
  1. Switch on file_type:
  
     Case "csv":
       a. Call FILE_ANALYZE_CSV AI Builder prompt
          - file_name: @{triggerBody()['file_name']}
          - csv_content: @{triggerBody()['file_content']}
          
     Case "xlsx":
       a. Parse Excel content (if needed)
       b. Call FILE_ANALYZE_EXCEL AI Builder prompt
          - file_name: @{triggerBody()['file_name']}
          - sheet_data_json: @{parsed_content}
          
     Case "pdf":
       a. Extract text from PDF (use AI Builder Document Processing or connector)
       b. Call FILE_EXTRACT_PDF AI Builder prompt
          - file_name: @{triggerBody()['file_name']}
          - pdf_text: @{extracted_text}
          
  2. Parse JSON response
  
  3. Apply to each extracted field:
     - Add row to mpa_session_memory
       - memory_type: context
       - memory_category: (based on field type)
       - memory_key: file_{{file_name}}_{{field_name}}
       - memory_value_json: @{field_value}
       - source_type: explicit
       - source_quote: "Extracted from {{file_name}}"
       
  4. Return to Copilot:
     - extraction_summary
     - extracted_data_json
     - fields_mapped_json
     - clarifications_needed_json
```

---

## PART 6: ORC AGENT INSTRUCTION UPDATES

### 6.1 Updated ORC Instructions

Add the following sections to ORC_Copilot_Instructions_v1.txt:

```
MEMORY SYSTEM INTEGRATION

At session start:
1. Call MPA_Memory_Initialize flow with user_id and session_id
2. Store returned context for use in routing decisions
3. If session_resume_available is true, offer to resume previous work

During conversation:
1. After each substantive exchange, call MPA_Memory_Store
2. Pass conversation text and current preferences
3. Apply learned preferences to routing and responses

At session end:
1. Final MPA_Memory_Store call to persist important decisions
2. Update last_session_id in preferences


PROACTIVE INTELLIGENCE INTEGRATION

At each major routing decision:
1. Call MPA_Proactive_Evaluate with current context
2. If triggers fire, incorporate messages into response
3. Track user response to triggers for learning

Trigger display rules:
- Maximum 2 triggers per response
- Critical triggers always shown
- Suggestion triggers only if conversation flow allows
- Do not repeat same trigger within cooldown period


COLLABORATIVE WORKFLOW INITIATION

When user request matches workflow trigger phrases:
1. Query eap_workflow_definition for matching workflow
2. Inform user that collaborative analysis will begin
3. Call MPA_Workflow_Orchestrate with workflow_code and request
4. Present synthesized response with confidence level
5. Offer to drill into specific agent contributions if asked

Workflow trigger examples:
- "Complete media plan" -> FULL_MEDIA_PLAN workflow
- "Optimize my budget" -> BUDGET_OPTIMIZATION workflow
- "Which channels for my audience" -> AUDIENCE_CHANNEL_FIT workflow


FILE UPLOAD HANDLING

When user uploads a file:
1. Identify file type (csv, xlsx, pdf)
2. Inform user that file will be processed
3. Call MPA_File_Process flow
4. Present extraction summary
5. Ask for clarification on ambiguous fields
6. Store extracted data in session memory for use by other agents
```

---

## PART 7: TOPIC CREATION AND UPDATES

### 7.1 New Topics to Create

**Topic: System.Greeting (Update)**
```yaml
Name: System.Greeting
Trigger: OnConversationStart

Actions:
  1. Call MPA_Memory_Initialize flow
     - user_id: System.User.Id
     - session_id: System.Conversation.Id
  2. Store response in variables:
     - Global.UserPreferences = response.preferences_json
     - Global.SessionContext = response.context_json
     - Global.CanResume = response.session_resume_available
  3. Condition: Global.CanResume = true
     - Yes: "Welcome back! Would you like to continue where we left off with {last_topic}?"
     - No: "Hello! I'm your Media Planning Agent. How can I help you today?"
```

**Topic: CollaborativeWorkflow (New)**
```yaml
Name: CollaborativeWorkflow
Display Name: Start Collaborative Workflow
Trigger Phrases:
  - "complete media plan"
  - "full campaign strategy"
  - "build me a plan"
  - "comprehensive media plan"
  - "end to end plan"
  - "optimize my budget"
  - "best budget allocation"
  - "which channels for my audience"
  - "how should I measure"
  - "analyze this campaign"

Actions:
  1. Match request to workflow_code
  2. Confirm with user: "I'll coordinate with multiple specialist agents to give you a comprehensive {workflow_name}. This typically takes about {duration} seconds. Proceed?"
  3. On confirmation, call MPA_Workflow_Orchestrate
  4. Display synthesized response
  5. Offer: "Would you like me to explain any specific aspect in more detail?"
```

**Topic: FileUpload (New)**
```yaml
Name: FileUpload
Display Name: Handle File Upload
Trigger: OnFileUpload (or phrases like "I have a file", "Here's my data")

Actions:
  1. Acknowledge file receipt
  2. Determine file type
  3. Call MPA_File_Process flow
  4. Display extraction summary
  5. If clarifications needed, ask questions
  6. Confirm: "I've extracted {field_count} data points. Would you like me to use this data in our planning?"
```

### 7.2 Update Existing Topics

For each agent topic (ANL, AUD, CHA, PRF, SPO, DOC):

Add at topic end:
```yaml
Additional Actions (after main response):
  1. Call MPA_Memory_Store (if substantive information exchanged)
  2. Call MPA_Proactive_Evaluate with current context
  3. If triggers fired, append to response
```

---

## PART 8: UPLOAD KNOWLEDGE BASE FILES

### 8.1 SharePoint Upload

Upload the following files to SharePoint:

**EAP Shared:**
```
Location: /sites/MPA/MPAKnowledgeBase/EAP/
Files:
- EAP_KB_Memory_System_v1.txt
- EAP_KB_Proactive_Intelligence_v1.txt
- EAP_KB_Consensus_Protocol_v1.txt
```

**ORC Agent:**
```
Location: /sites/MPA/MPAKnowledgeBase/Agents/ORC/
Files:
- ORC_KB_Session_Management_v1.txt
- ORC_KB_Collaborative_Orchestration_v1.txt
```

**DOC Agent:**
```
Location: /sites/MPA/MPAKnowledgeBase/Agents/DOC/
Files:
- DOC_KB_File_Processing_v1.txt
```

### 8.2 Copilot Studio Knowledge Configuration

Add new SharePoint locations to each agent's knowledge sources in Copilot Studio.

---

## PART 9: VALIDATION TESTS

### 9.1 Memory System Tests

```
Test 1: New User Session
- Start new session with unknown user
- Verify mpa_user_preferences record created
- Verify empty context returned

Test 2: Returning User
- Start session with user who has preferences
- Verify preferences loaded
- Verify context includes prior data

Test 3: Preference Learning
- State preference: "I always prefer incrementality measurement"
- Verify preference stored in mpa_session_memory
- Verify high-confidence preference persists to mpa_user_preferences

Test 4: Session Resume
- Complete partial session
- Start new session
- Verify resume option offered
```

### 9.2 Proactive Intelligence Tests

```
Test 1: Trigger Firing
- Set channel allocation above 35%
- Verify ANL_SATURATION_WARNING fires
- Verify message contains actual values

Test 2: Cooldown Enforcement
- Trigger same alert twice within cooldown
- Verify second occurrence suppressed

Test 3: Priority Ordering
- Create context that triggers multiple alerts
- Verify highest priority shown first
- Verify maximum 2 triggers per response
```

### 9.3 Collaborative Workflow Tests

```
Test 1: Full Media Plan Workflow
- Request: "Build me a complete media plan for $500K retail campaign"
- Verify all 5 agents contribute (ANL, AUD, CHA, PRF, DOC)
- Verify synthesized response is coherent
- Verify contributions stored in eap_workflow_contribution

Test 2: Budget Optimization Workflow
- Request: "Optimize my budget across channels"
- Verify 3 agents contribute (ANL, CHA, PRF)
- Verify confidence levels reported

Test 3: Conflict Resolution
- Create scenario where agents disagree
- Verify conflict flagged in synthesis
- Verify resolution reasoning provided
```

### 9.4 File Processing Tests

```
Test 1: CSV Upload
- Upload sample campaign data CSV
- Verify columns mapped to MPA fields
- Verify data stored in session memory

Test 2: Excel Upload
- Upload budget allocation Excel file
- Verify sheet analysis
- Verify budget data extracted

Test 3: PDF Upload
- Upload media brief PDF
- Verify text extraction
- Verify key fields identified
```

---

## PART 10: EXECUTION CHECKLIST

### Desktop Claude (COMPLETE)
- [x] EAP_KB_Memory_System_v1.txt
- [x] EAP_KB_Proactive_Intelligence_v1.txt
- [x] EAP_KB_Consensus_Protocol_v1.txt
- [x] ORC_KB_Session_Management_v1.txt
- [x] ORC_KB_Collaborative_Orchestration_v1.txt
- [x] DOC_KB_File_Processing_v1.txt
- [x] MEM_STORE_PREFERENCE_PROMPT.json
- [x] MEM_RETRIEVE_CONTEXT_PROMPT.json
- [x] MEM_LEARN_PATTERN_PROMPT.json
- [x] PRO_EVALUATE_TRIGGERS_PROMPT.json
- [x] CON_COLLECT_CONTRIBUTION_PROMPT.json
- [x] CON_SYNTHESIZE_RESPONSE_PROMPT.json
- [x] FILE_ANALYZE_CSV_PROMPT.json
- [x] FILE_ANALYZE_EXCEL_PROMPT.json
- [x] FILE_EXTRACT_PDF_PROMPT.json
- [x] Dataverse schema definitions (6 tables)
- [x] eap_proactive_trigger_seed.csv
- [x] eap_workflow_definition_seed.csv
- [x] This VS Code execution prompt

### VS Code (PENDING)
- [ ] Create mpa_user_preferences table
- [ ] Create mpa_session_memory table
- [ ] Create eap_proactive_trigger table
- [ ] Create eap_workflow_definition table
- [ ] Create eap_workflow_contribution table
- [ ] Create eap_trigger_history table
- [ ] Load eap_proactive_trigger_seed.csv
- [ ] Load eap_workflow_definition_seed.csv
- [ ] Deploy MEM_STORE_PREFERENCE prompt
- [ ] Deploy MEM_RETRIEVE_CONTEXT prompt
- [ ] Deploy MEM_LEARN_PATTERN prompt
- [ ] Deploy PRO_EVALUATE_TRIGGERS prompt
- [ ] Deploy CON_COLLECT_CONTRIBUTION prompt
- [ ] Deploy CON_SYNTHESIZE_RESPONSE prompt
- [ ] Deploy CON_RESOLVE_CONFLICTS prompt
- [ ] Deploy FILE_ANALYZE_CSV prompt
- [ ] Deploy FILE_ANALYZE_EXCEL prompt
- [ ] Deploy FILE_EXTRACT_PDF prompt
- [ ] Create MPA_Memory_Initialize flow
- [ ] Create MPA_Memory_Store flow
- [ ] Create MPA_Proactive_Evaluate flow
- [ ] Create MPA_Workflow_Orchestrate flow
- [ ] Create MPA_File_Process flow
- [ ] Upload KB files to SharePoint
- [ ] Update ORC agent instructions
- [ ] Create CollaborativeWorkflow topic
- [ ] Create FileUpload topic
- [ ] Update System.Greeting topic
- [ ] Add trigger evaluation to existing topics
- [ ] Run validation tests
- [ ] Fix any issues
- [ ] Document completion

---

## PART 11: SUCCESS CRITERIA

| Capability | Test | Expected Result |
|------------|------|-----------------|
| Memory Init | New user session | Preferences record created |
| Memory Persist | State preference explicitly | Preference stored with high confidence |
| Memory Resume | Return after session end | Resume option offered |
| Proactive Fire | Exceed threshold | Alert shown with values |
| Proactive Cooldown | Repeat same condition | Second alert suppressed |
| Workflow Full | Request complete plan | All agents contribute, synthesis returned |
| Workflow Partial | Request optimization | Subset of agents, focused response |
| File CSV | Upload CSV | Columns mapped, data extracted |
| File Excel | Upload Excel | Sheets analyzed, budgets found |
| File PDF | Upload PDF | Text extracted, fields identified |

---

**Document Version:** 1.0  
**Created:** January 19, 2026  
**Author:** Claude (Desktop)  
**Status:** Ready for VS Code Execution
