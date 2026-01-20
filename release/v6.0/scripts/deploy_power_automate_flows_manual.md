# MPA v6.1 Power Automate Flow Deployment - Manual Steps

Power Automate flows must be created manually in the Power Automate designer. This guide provides step-by-step instructions for creating all 5 required flows.

## Prerequisites

- Access to https://make.powerautomate.com
- Aragorn AI environment selected
- AI Builder prompts deployed (see deploy_ai_builder_prompts_manual.md)
- Dataverse tables created (see create_h1h2_tables_manual.md)

## Navigation

1. Go to: https://make.powerautomate.com
2. Select Environment: **Aragorn AI**
3. Click: **Create** > **Instant cloud flow**

---

## Flow 1: MPA_Memory_Initialize

**Purpose:** Load user preferences and context at session start

### Basic Configuration
- **Name:** MPA_Memory_Initialize
- **Trigger:** When Copilot calls a flow (from Copilot Studio connector)
- **Description:** Load user preferences and context at session start

### Input Parameters (Configure in Trigger)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | Text | Yes | User identifier |
| session_id | Text | Yes | Session identifier |

### Flow Steps

**Step 1: List User Preferences**
- Action: Dataverse > List rows
- Table name: mpa_user_preferences
- Filter rows: `mpa_user_id eq '@{triggerBody()?['text']}'`
- (Use the user_id input)

**Step 2: Condition - User Exists?**
- Condition: `length(body('List_rows_-_User_Preferences')?['value'])` is greater than 0
- **If yes:** Continue to Step 3
- **If no:** Jump to Step 2a (Create New User)

**Step 2a: Create New User (No branch)**
- Action: Dataverse > Add a new row
- Table name: mpa_user_preferences
- mpa_user_id: `@{triggerBody()?['text']}`
- mpa_created_at: `@{utcNow()}`
- mpa_updated_at: `@{utcNow()}`
- mpa_session_count: 1
- mpa_preference_version: 1
- Then: Return empty context

**Step 3: List Session Memory**
- Action: Dataverse > List rows
- Table name: mpa_session_memory
- Filter rows: `mpa_user_id eq '@{triggerBody()?['text']}' and (mpa_is_persistent eq true or mpa_expires_at gt '@{utcNow()}')`
- Order by: mpa_confidence_score desc
- Top count: 20

**Step 4: Call AI Builder - Retrieve Context**
- Action: AI Builder > Create text with GPT using a prompt
- Prompt: MEM_RETRIEVE_CONTEXT (select from deployed prompts)
- user_preferences_json: `@{string(body('List_rows_-_User_Preferences')?['value'])}`
- recent_memories_json: `@{string(body('List_rows_-_Session_Memory')?['value'])}`
- conversation_start: "Session initialization"

**Step 5: Parse JSON Response**
- Action: Data Operations > Parse JSON
- Content: `@{body('Create_text_with_GPT')?['responsev2']?['predictionOutput']?['text']}`
- Schema:
```json
{
  "type": "object",
  "properties": {
    "apply_automatically": { "type": "array" },
    "suggest_with_confirmation": { "type": "array" },
    "contradictions_to_resolve": { "type": "array" },
    "context_summary": { "type": "string" }
  }
}
```

**Step 6: Update Session Count**
- Action: Dataverse > Update a row
- Table name: mpa_user_preferences
- Row ID: `@{first(body('List_rows_-_User_Preferences')?['value'])?['mpa_user_preferencesid']}`
- mpa_session_count: `@{add(first(body('List_rows_-_User_Preferences')?['value'])?['mpa_session_count'], 1)}`
- mpa_last_session_id: `@{triggerBody()?['text_1']}`
- mpa_updated_at: `@{utcNow()}`

**Step 7: Return to Copilot**
- Action: Respond to Copilot
- Output parameters:
  - preferences_json (Text): `@{string(first(body('List_rows_-_User_Preferences')?['value']))}`
  - context_json (Text): `@{body('Parse_JSON')}`
  - session_resume_available (Yes/No): `@{if(equals(first(body('List_rows_-_User_Preferences')?['value'])?['mpa_last_session_id'], null), false, true)}`
  - last_session_summary (Text): `@{body('Parse_JSON')?['context_summary']}`

---

## Flow 2: MPA_Memory_Store

**Purpose:** Store preferences and decisions during conversation

### Basic Configuration
- **Name:** MPA_Memory_Store
- **Trigger:** When Copilot calls a flow
- **Description:** Store preferences and decisions during conversation

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| session_id | Text | Yes | Current session ID |
| user_id | Text | Yes | User identifier |
| conversation_text | Text | Yes | Recent conversation content |
| existing_preferences_json | Text | Yes | Current known preferences |

### Flow Steps

**Step 1: Call AI Builder - Store Preference**
- Action: AI Builder > Create text with GPT using a prompt
- Prompt: MEM_STORE_PREFERENCE
- conversation_text: `@{triggerBody()?['text_2']}`
- existing_preferences_json: `@{triggerBody()?['text_3']}`

**Step 2: Parse JSON Response**
- Action: Data Operations > Parse JSON
- Content: `@{body('Create_text_with_GPT')?['responsev2']?['predictionOutput']?['text']}`
- Schema:
```json
{
  "type": "object",
  "properties": {
    "extracted_preferences": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "preference_type": { "type": "string" },
          "category": { "type": "string" },
          "key": { "type": "string" },
          "value": {},
          "confidence": { "type": "integer" },
          "context": { "type": "string" },
          "source_quote": { "type": "string" },
          "contradicts_existing": { "type": "boolean" }
        }
      }
    },
    "summary": { "type": "string" }
  }
}
```

**Step 3: Initialize Variables**
- Initialize variable: stored_count (Integer) = 0
- Initialize variable: updated_count (Integer) = 0

**Step 4: Apply to Each Preference**
- Action: Apply to each
- Select an output: `@{body('Parse_JSON')?['extracted_preferences']}`

  **4a: Check if Memory Exists**
  - Action: Dataverse > List rows
  - Table name: mpa_session_memory
  - Filter: `mpa_session_id eq '@{triggerBody()?['text']}' and mpa_memory_category eq '@{items('Apply_to_each')?['category']}' and mpa_memory_key eq '@{items('Apply_to_each')?['key']}'`

  **4b: Condition - Memory Exists?**
  - Condition: `length(body('List_rows_-_Check_Memory')?['value'])` is greater than 0

  **If Yes (Update):**
  - Action: Dataverse > Update a row
  - Table name: mpa_session_memory
  - Row ID: `@{first(body('List_rows_-_Check_Memory')?['value'])?['mpa_session_memoryid']}`
  - mpa_confidence_score: `@{max(first(body('List_rows_-_Check_Memory')?['value'])?['mpa_confidence_score'], items('Apply_to_each')?['confidence'])}`
  - mpa_memory_value_json: `@{string(items('Apply_to_each')?['value'])}`
  - mpa_last_accessed_at: `@{utcNow()}`
  - mpa_access_count: `@{add(first(body('List_rows_-_Check_Memory')?['value'])?['mpa_access_count'], 1)}`
  - Increment updated_count

  **If No (Create):**
  - Action: Dataverse > Add a new row
  - Table name: mpa_session_memory
  - mpa_session_id: `@{triggerBody()?['text']}`
  - mpa_user_id: `@{triggerBody()?['text_1']}`
  - mpa_memory_type: (map from preference_type: EXPLICIT->preference, IMPLICIT->pattern, CONTEXTUAL->context)
  - mpa_memory_category: `@{items('Apply_to_each')?['category']}`
  - mpa_memory_key: `@{items('Apply_to_each')?['key']}`
  - mpa_memory_value_json: `@{string(items('Apply_to_each')?['value'])}`
  - mpa_confidence_score: `@{items('Apply_to_each')?['confidence']}`
  - mpa_source_type: (map: EXPLICIT->explicit, IMPLICIT->implicit, CONTEXTUAL->inferred)
  - mpa_source_quote: `@{items('Apply_to_each')?['source_quote']}`
  - mpa_is_persistent: `@{if(greaterOrEquals(items('Apply_to_each')?['confidence'], 80), true, false)}`
  - mpa_created_at: `@{utcNow()}`
  - mpa_access_count: 1
  - Increment stored_count

**Step 5: Update User Preferences for High Confidence**
- Condition: Any preference has confidence >= 80 AND is_persistent = true
- If yes: Update mpa_user_preferences with relevant fields

**Step 6: Return to Copilot**
- Action: Respond to Copilot
- Output parameters:
  - stored_count (Number): `@{variables('stored_count')}`
  - updated_count (Number): `@{variables('updated_count')}`
  - summary (Text): `@{body('Parse_JSON')?['summary']}`

---

## Flow 3: MPA_Proactive_Evaluate

**Purpose:** Evaluate proactive triggers against current context

### Basic Configuration
- **Name:** MPA_Proactive_Evaluate
- **Trigger:** When Copilot calls a flow
- **Description:** Evaluate proactive triggers against current context

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| session_id | Text | Yes | Current session ID |
| user_id | Text | Yes | User identifier |
| agent_code | Text | Yes | Current agent (ANL, CHA, PRF, etc.) |
| session_context_json | Text | Yes | Current session context as JSON |

### Flow Steps

**Step 1: List Active Triggers**
- Action: Dataverse > List rows
- Table name: eap_proactive_trigger
- Filter: `eap_agent_code eq '@{triggerBody()?['text_2']}' and eap_is_active eq true`

**Step 2: List Recent Trigger History**
- Action: Dataverse > List rows
- Table name: eap_trigger_history
- Filter: `eap_user_id eq '@{triggerBody()?['text_1']}' and eap_fired_at gt '@{addHours(utcNow(), -24)}'`

**Step 3: Call AI Builder - Evaluate Triggers**
- Action: AI Builder > Create text with GPT using a prompt
- Prompt: PRO_EVALUATE_TRIGGERS
- session_context_json: `@{triggerBody()?['text_3']}`
- applicable_triggers_json: `@{string(body('List_rows_-_Active_Triggers')?['value'])}`
- trigger_history_json: `@{string(body('List_rows_-_Trigger_History')?['value'])}`

**Step 4: Parse JSON Response**
- Action: Data Operations > Parse JSON
- Content: `@{body('Create_text_with_GPT')?['responsev2']?['predictionOutput']?['text']}`
- Schema:
```json
{
  "type": "object",
  "properties": {
    "triggers_fired": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "trigger_code": { "type": "string" },
          "severity": { "type": "string" },
          "message": { "type": "string" },
          "supporting_data": { "type": "object" }
        }
      }
    },
    "triggers_evaluated": { "type": "integer" },
    "triggers_skipped_cooldown": { "type": "integer" },
    "triggers_skipped_condition": { "type": "integer" }
  }
}
```

**Step 5: Record Fired Triggers**
- Action: Apply to each
- Select: `@{body('Parse_JSON')?['triggers_fired']}`

  **5a: Add to Trigger History**
  - Action: Dataverse > Add a new row
  - Table name: eap_trigger_history
  - eap_trigger_code: `@{items('Apply_to_each')?['trigger_code']}`
  - eap_session_id: `@{triggerBody()?['text']}`
  - eap_user_id: `@{triggerBody()?['text_1']}`
  - eap_fired_at: `@{utcNow()}`
  - eap_message_delivered: `@{items('Apply_to_each')?['message']}`
  - eap_context_snapshot_json: `@{triggerBody()?['text_3']}`

**Step 6: Return to Copilot**
- Action: Respond to Copilot
- Output parameters:
  - triggers_fired_json (Text): `@{string(body('Parse_JSON')?['triggers_fired'])}`
  - trigger_count (Number): `@{length(body('Parse_JSON')?['triggers_fired'])}`

---

## Flow 4: MPA_Workflow_Orchestrate

**Purpose:** Orchestrate collaborative multi-agent workflow

### Basic Configuration
- **Name:** MPA_Workflow_Orchestrate
- **Trigger:** When Copilot calls a flow
- **Description:** Orchestrate collaborative multi-agent workflow

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| session_id | Text | Yes | Current session ID |
| user_id | Text | Yes | User identifier |
| workflow_code | Text | Yes | Workflow to execute |
| original_request | Text | Yes | User's original request |
| context_json | Text | Yes | Current session context |

### Flow Steps

**Step 1: Get Workflow Definition**
- Action: Dataverse > List rows
- Table name: eap_workflow_definition
- Filter: `eap_workflow_code eq '@{triggerBody()?['text_2']}'`

**Step 2: Initialize Variables**
- Initialize variable: workflow_instance_id (String) = `@{guid()}`
- Initialize variable: contributions_json (Array) = []
- Initialize variable: start_time (String) = `@{utcNow()}`

**Step 3: Parse Agent Sequence**
- Action: Data Operations > Compose
- Inputs: `@{json(first(body('List_rows_-_Workflow')?['value'])?['eap_agent_sequence_json'])}`

**Step 4: Apply to Each Agent**
- Action: Apply to each
- Select: `@{outputs('Parse_Agent_Sequence')}`

  **4a: Record Start Time**
  - Initialize variable: agent_start (String) = `@{utcNow()}`

  **4b: Call AI Builder - Collect Contribution**
  - Action: AI Builder > Create text with GPT using a prompt
  - Prompt: CON_COLLECT_CONTRIBUTION
  - target_agent_code: `@{items('Apply_to_each')}`
  - workflow_code: `@{triggerBody()?['text_2']}`
  - original_request: `@{triggerBody()?['text_3']}`
  - parameters_json: `@{triggerBody()?['text_4']}`
  - previous_contributions_json: `@{string(variables('contributions_json'))}`

  **4c: Add Contribution to Dataverse**
  - Action: Dataverse > Add a new row
  - Table name: eap_workflow_contribution
  - eap_workflow_instance_id: `@{variables('workflow_instance_id')}`
  - eap_session_id: `@{triggerBody()?['text']}`
  - eap_agent_code: `@{items('Apply_to_each')}`
  - eap_contribution_type: (from AI Builder response)
  - eap_contribution_json: `@{body('Create_text_with_GPT')?['responsev2']?['predictionOutput']?['text']}`
  - eap_status: complete
  - eap_started_at: `@{variables('agent_start')}`
  - eap_completed_at: `@{utcNow()}`

  **4d: Append to Contributions Array**
  - Action: Append to array variable
  - Name: contributions_json
  - Value: `@{body('Create_text_with_GPT')?['responsev2']?['predictionOutput']?['text']}`

**Step 5: Call AI Builder - Synthesize Response**
- Action: AI Builder > Create text with GPT using a prompt
- Prompt: CON_SYNTHESIZE_RESPONSE
- workflow_code: `@{triggerBody()?['text_2']}`
- original_request: `@{triggerBody()?['text_3']}`
- contributions_json: `@{string(variables('contributions_json'))}`
- user_preferences_json: `@{triggerBody()?['text_4']}`

**Step 6: Parse Synthesis Response**
- Action: Data Operations > Parse JSON
- Content: `@{body('Create_text_with_GPT_Synthesize')?['responsev2']?['predictionOutput']?['text']}`

**Step 7: Calculate Duration**
- Action: Data Operations > Compose
- Inputs: `@{div(sub(ticks(utcNow()), ticks(variables('start_time'))), 10000000)}`

**Step 8: Return to Copilot**
- Action: Respond to Copilot
- Output parameters:
  - synthesized_response (Text): `@{body('Parse_Synthesis')?['synthesized_response']}`
  - contributions_json (Text): `@{string(variables('contributions_json'))}`
  - workflow_duration_seconds (Number): `@{outputs('Calculate_Duration')}`
  - confidence_overall (Number): `@{body('Parse_Synthesis')?['confidence_overall']}`

---

## Flow 5: MPA_File_Process

**Purpose:** Process uploaded files and extract data

### Basic Configuration
- **Name:** MPA_File_Process
- **Trigger:** When Copilot calls a flow
- **Description:** Process uploaded files and extract data

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| session_id | Text | Yes | Current session ID |
| file_content | Text | Yes | File content (text or extracted) |
| file_type | Text | Yes | File type: csv, xlsx, pdf |
| file_name | Text | Yes | Original file name |

### Flow Steps

**Step 1: Switch on File Type**
- Action: Switch
- On: `@{toLower(triggerBody()?['text_2'])}`

### Case: csv

**1a: Call AI Builder - Analyze CSV**
- Action: AI Builder > Create text with GPT using a prompt
- Prompt: FILE_ANALYZE_CSV
- file_name: `@{triggerBody()?['text_3']}`
- headers_json: (extract headers from first line)
- sample_rows_json: (extract first 10 rows)
- total_rows: (count rows)
- session_context_json: "{}"

**1b: Parse Response**
- Parse the JSON response from AI Builder

### Case: xlsx

**2a: Note about Excel Processing**
Excel files require pre-processing to extract sheet data. Options:
- Use OneDrive connector to process Excel files
- Use AI Builder Document Processing model
- Accept pre-extracted JSON

**2b: Call AI Builder - Analyze Excel**
- Action: AI Builder > Create text with GPT using a prompt
- Prompt: FILE_ANALYZE_EXCEL
- file_name: `@{triggerBody()?['text_3']}`
- sheet_list_json: (from pre-processing)
- primary_sheet_name: (from pre-processing)
- headers_json: (from pre-processing)
- sample_rows_json: (from pre-processing)
- total_rows: (from pre-processing)

### Case: pdf

**3a: Extract PDF Text**
Options:
- AI Builder Document Processing model
- Azure AI Document Intelligence connector
- Pre-extracted text passed as input

**3b: Call AI Builder - Extract PDF**
- Action: AI Builder > Create text with GPT using a prompt
- Prompt: FILE_EXTRACT_PDF
- file_name: `@{triggerBody()?['text_3']}`
- page_count: (from extraction)
- extracted_text: `@{triggerBody()?['text_1']}`
- session_context_json: "{}"

### Common Steps (After Switch)

**Step 2: Parse AI Builder Response**
- Action: Data Operations > Parse JSON
- Content: (output from appropriate case)

**Step 3: Store Extracted Data in Session Memory**
- Action: Apply to each
- Select: Extracted fields that can be stored

  **3a: Add Memory Row**
  - Action: Dataverse > Add a new row
  - Table name: mpa_session_memory
  - mpa_session_id: `@{triggerBody()?['text']}`
  - mpa_user_id: (from session context)
  - mpa_memory_type: context
  - mpa_memory_category: (determine from field type)
  - mpa_memory_key: `file_@{triggerBody()?['text_3']}_@{item().field_name}`
  - mpa_memory_value_json: `@{string(item().value)}`
  - mpa_confidence_score: 90
  - mpa_source_type: explicit
  - mpa_source_quote: `Extracted from @{triggerBody()?['text_3']}`
  - mpa_is_persistent: false
  - mpa_created_at: `@{utcNow()}`

**Step 4: Return to Copilot**
- Action: Respond to Copilot
- Output parameters:
  - extraction_summary (Text): `@{body('Parse_JSON')?['summary']}`
  - extracted_data_json (Text): `@{string(body('Parse_JSON')?['extracted_data'])}`
  - fields_mapped_json (Text): `@{string(body('Parse_JSON')?['column_mappings'])}`
  - clarifications_needed_json (Text): `@{string(body('Parse_JSON')?['clarifications_needed'])}`

---

## Post-Deployment Verification

After creating all flows:

### 1. Test Each Flow

**MPA_Memory_Initialize:**
- Test with new user_id -> Should create preferences record
- Test with existing user_id -> Should return preferences and context

**MPA_Memory_Store:**
- Provide conversation text with clear preference
- Verify mpa_session_memory record created

**MPA_Proactive_Evaluate:**
- Set context that meets trigger condition
- Verify trigger fires and history recorded

**MPA_Workflow_Orchestrate:**
- Call with FULL_MEDIA_PLAN workflow
- Verify contributions collected and synthesized

**MPA_File_Process:**
- Test with sample CSV content
- Verify data extracted and stored

### 2. Add Flows to Solution

1. Navigate to Solutions
2. Open MediaPlanningAgentv52 solution
3. Add existing > Cloud flows > Select all 5 flows

### 3. Configure Copilot Studio Connection

In Copilot Studio:
1. Go to agent settings
2. Navigate to Actions
3. Add action > Power Automate flows
4. Select each flow and configure input/output mapping

### 4. Document Flow IDs

| Flow Name | Flow ID |
|-----------|---------|
| MPA_Memory_Initialize | _______________ |
| MPA_Memory_Store | _______________ |
| MPA_Proactive_Evaluate | _______________ |
| MPA_Workflow_Orchestrate | _______________ |
| MPA_File_Process | _______________ |

---

## Troubleshooting

**"Flow save failed" error:**
- Check all Dataverse table names match exactly
- Verify AI Builder prompts exist and are published
- Check input parameter types match

**"Copilot cannot call flow" error:**
- Verify flow trigger is "When Copilot calls a flow"
- Check flow is turned on
- Verify flow is added to Copilot agent

**AI Builder call fails:**
- Verify prompt is published
- Check AI Builder capacity
- Reduce max tokens if hitting limits

**Dataverse operations fail:**
- Verify table permissions
- Check column names include prefix (mpa_, eap_)
- Verify Choice fields use integer values
