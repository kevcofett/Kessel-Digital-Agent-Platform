# MPA v5.2 Power Automate Flows - Manual Build Guide

## Overview

This guide provides step-by-step instructions for manually building all 11 MPA Power Automate flows in the Aragorn AI environment.

**Environment:** Aragorn AI (aragornai.crm.dynamics.com)

**Prerequisites:**
- Working Microsoft Dataverse connection (status: Connected)
- Access to Power Automate (make.powerautomate.com)

**Tables Used:**
- Media Plans (mpa_mediaplan)
- Plan Data (mpa_plandata)
- Plan Versions (mpa_planversion)
- Benchmarks (mpa_benchmark)
- Channels (mpa_channel)
- Campaign Performance (mpa_campaignperformance)
- Post Mortem Reports (mpa_postmortemreport)
- Plan Learnings (mpa_planlearning)
- EAP Clients (eap_client)
- EAP Sessions (eap_session)
- EAP Learnings (eap_learning)

---

## Flow 1: MPA Initialize Session âœ… COMPLETED

**Status:** Already built and saved

**Purpose:** Initialize a new planning session

---

## Flow 2: MPA Create Plan

**Purpose:** Create a new media plan with initial version

### Step-by-Step Instructions

1. **Create** â†’ **Instant cloud flow**
   - Name: `MPA Create Plan`
   - Trigger: **When a HTTP request is received**
   - Click **Create**

2. **Configure Trigger** - Paste this schema:
```json
{
  "type": "object",
  "properties": {
    "client_id": {"type": "string"},
    "campaign_name": {"type": "string"},
    "user_id": {"type": "string"},
    "pathway": {"type": "string"},
    "budget": {"type": "number"},
    "start_date": {"type": "string"},
    "end_date": {"type": "string"}
  },
  "required": ["client_id", "campaign_name", "user_id"]
}
```

3. **+ New step** â†’ **Initialize variable**
   - Name: `plan_code`
   - Type: String
   - Value: `PLN-001`

4. **+ New step** â†’ **Dataverse - Get a row by ID**
   - Table name: **EAP Clients** (or type `eap_client`)
   - Row ID: Dynamic content â†’ **client_id**

5. **+ New step** â†’ **Dataverse - Add a new row**
   - Table name: **Media Plans**
   - Campaign Name: Dynamic content â†’ **campaign_name**
   - Client Id: Dynamic content â†’ **client_id**
   - Plan Code: Dynamic content â†’ **plan_code**
   - Pathway: Dynamic content â†’ **pathway**
   - Status: **Draft**
   - Lifecycle Mode: **Planning**
   - Current Step: `1`
   - Current Gate: `0`
   - Total Budget: Dynamic content â†’ **budget**
   - Start Date: Dynamic content â†’ **start_date**
   - End Date: Dynamic content â†’ **end_date**

6. **+ New step** â†’ **Dataverse - Add a new row**
   - Table name: **Plan Versions** (or type `mpa_planversion`)
   - Plan Id: Dynamic content â†’ **Media Plan** (from previous step)
   - Version Number: `1`
   - Is Current: **Yes**
   - Change Summary: `Initial plan creation`

7. **+ New step** â†’ **Response**
   - Status Code: `200`
   - Headers: Content-Type = application/json
   - Body:
```json
{
  "status": "Success",
  "message": "Plan created successfully"
}
```

8. Click **Save**

---

## Flow 3: MPA Save Section

**Purpose:** Save or update a plan section's data

### Step-by-Step Instructions

1. **Create** â†’ **Instant cloud flow**
   - Name: `MPA Save Section`
   - Trigger: **When a HTTP request is received**
   - Click **Create**

2. **Configure Trigger** - Paste this schema:
```json
{
  "type": "object",
  "properties": {
    "plan_id": {"type": "string"},
    "section_type": {"type": "string"},
    "section_data": {"type": "object"},
    "user_id": {"type": "string"},
    "version_id": {"type": "string"}
  },
  "required": ["plan_id", "section_type", "section_data"]
}
```

3. **+ New step** â†’ **Dataverse - List rows**
   - Table name: **Plan Data** (or type `mpa_plandata`)
   - Filter rows: `mpa_plan_id eq '@{triggerBody()?['plan_id']}' and mpa_section_type eq '@{triggerBody()?['section_type']}'`
   - Row count: `1`

4. **+ New step** â†’ **Condition**
   - Click in first box â†’ Expression tab â†’ paste: `length(outputs('List_rows')?['body/value'])`
   - Operator: **is greater than**
   - Value: `0`

5. **If yes branch** â†’ **Dataverse - Update a row**
   - Table name: **Plan Data**
   - Row ID: Expression â†’ `first(outputs('List_rows')?['body/value'])?['mpa_plandataid']`
   - Section Data: Dynamic content â†’ **section_data**
   - Section Status: **InProgress**

6. **If no branch** â†’ **Dataverse - Add a new row**
   - Table name: **Plan Data**
   - Plan Id: Dynamic content â†’ **plan_id**
   - Section Type: Dynamic content â†’ **section_type**
   - Section Data: Dynamic content â†’ **section_data**
   - Section Status: **InProgress**

7. **After the Condition** â†’ **+ New step** â†’ **Response**
   - Status Code: `200`
   - Body:
```json
{
  "status": "Success",
  "message": "Section saved"
}
```

8. Click **Save**

---

## Flow 4: MPA Validate Plan

**Purpose:** Validate plan completeness and data quality

### Step-by-Step Instructions

1. **Create** â†’ **Instant cloud flow**
   - Name: `MPA Validate Plan`
   - Trigger: **When a HTTP request is received**
   - Click **Create**

2. **Configure Trigger** - Paste this schema:
```json
{
  "type": "object",
  "properties": {
    "plan_id": {"type": "string"},
    "step_number": {"type": "integer"},
    "gate_number": {"type": "integer"},
    "user_id": {"type": "string"}
  },
  "required": ["plan_id"]
}
```

3. **+ New step** â†’ **Dataverse - Get a row by ID**
   - Table name: **Media Plans**
   - Row ID: Dynamic content â†’ **plan_id**

4. **+ New step** â†’ **Dataverse - List rows**
   - Table name: **Plan Data**
   - Filter rows: `mpa_plan_id eq '@{triggerBody()?['plan_id']}'`

5. **+ New step** â†’ **Initialize variable**
   - Name: `is_valid`
   - Type: Boolean
   - Value: `true`

6. **+ New step** â†’ **Initialize variable**
   - Name: `validation_messages`
   - Type: Array
   - Value: `[]`

7. **+ New step** â†’ **Apply to each**
   - Select output: Dynamic content â†’ **value** (from List rows)
   - Inside the loop:
     - **Condition**: Check if section_data is empty
     - If empty â†’ **Append to array variable** (validation_messages) with error message
     - If empty â†’ **Set variable** (is_valid) to `false`

8. **+ New step** â†’ **Response**
   - Status Code: `200`
   - Body:
```json
{
  "status": "Success",
  "is_valid": "@{variables('is_valid')}",
  "messages": "@{variables('validation_messages')}"
}
```

9. Click **Save**

---

## Flow 5: MPA Generate Document

**Purpose:** Prepare data for document generation

### Step-by-Step Instructions

1. **Create** â†’ **Instant cloud flow**
   - Name: `MPA Generate Document`
   - Trigger: **When a HTTP request is received**
   - Click **Create**

2. **Configure Trigger** - Paste this schema:
```json
{
  "type": "object",
  "properties": {
    "plan_id": {"type": "string"},
    "document_type": {"type": "string"},
    "format": {"type": "string"},
    "user_id": {"type": "string"}
  },
  "required": ["plan_id", "document_type"]
}
```

3. **+ New step** â†’ **Dataverse - Get a row by ID**
   - Table name: **Media Plans**
   - Row ID: Dynamic content â†’ **plan_id**

4. **+ New step** â†’ **Dataverse - Get a row by ID**
   - Table name: **EAP Clients**
   - Row ID: Dynamic content â†’ **Client Id** (from Media Plans)

5. **+ New step** â†’ **Dataverse - List rows**
   - Table name: **Plan Data**
   - Filter rows: `mpa_plan_id eq '@{triggerBody()?['plan_id']}'`
   - Sort by: `mpa_step_number asc`

6. **+ New step** â†’ **Compose**
   - Inputs:
```json
{
  "plan": {
    "plan_id": "@{outputs('Get_a_row_by_ID')?['body/mpa_plan_id']}",
    "campaign_name": "@{outputs('Get_a_row_by_ID')?['body/mpa_campaign_name']}"
  },
  "client": {
    "client_name": "@{outputs('Get_a_row_by_ID_2')?['body/eap_client_client_name']}"
  },
  "sections": "@{outputs('List_rows')?['body/value']}",
  "document_type": "@{triggerBody()?['document_type']}",
  "format": "@{triggerBody()?['format']}"
}
```

7. **+ New step** â†’ **Response**
   - Status Code: `200`
   - Body: Dynamic content â†’ **Outputs** (from Compose)

8. Click **Save**

---

## Flow 6: MPA Search Benchmarks

**Purpose:** Search benchmark data by filters

### Step-by-Step Instructions

1. **Create** â†’ **Instant cloud flow**
   - Name: `MPA Search Benchmarks`
   - Trigger: **When a HTTP request is received**
   - Click **Create**

2. **Configure Trigger** - Paste this schema:
```json
{
  "type": "object",
  "properties": {
    "vertical": {"type": "string"},
    "channel": {"type": "string"},
    "kpi_type": {"type": "string"},
    "limit": {"type": "integer"}
  }
}
```

3. **+ New step** â†’ **Initialize variable**
   - Name: `filter_query`
   - Type: String
   - Value: `mpa_is_active eq true`

4. **+ New step** â†’ **Condition** (check if vertical is provided)
   - Condition: Dynamic content â†’ **vertical** is not equal to `null`
   - If yes: **Set variable** filter_query to: `@{variables('filter_query')} and mpa_vertical eq '@{triggerBody()?['vertical']}'`

5. **+ New step** â†’ **Condition** (check if channel is provided)
   - Condition: Dynamic content â†’ **channel** is not equal to `null`
   - If yes: **Set variable** filter_query to: `@{variables('filter_query')} and mpa_channel eq '@{triggerBody()?['channel']}'`

6. **+ New step** â†’ **Dataverse - List rows**
   - Table name: **Benchmarks** (or type `mpa_benchmark`)
   - Filter rows: Dynamic content â†’ **filter_query**
   - Row count: `50`

7. **+ New step** â†’ **Response**
   - Status Code: `200`
   - Body:
```json
{
  "status": "Success",
  "count": "@{length(outputs('List_rows')?['body/value'])}",
  "benchmarks": "@{outputs('List_rows')?['body/value']}"
}
```

8. Click **Save**

---

## Flow 7: MPA Search Channels

**Purpose:** Search available media channels

### Step-by-Step Instructions

1. **Create** â†’ **Instant cloud flow**
   - Name: `MPA Search Channels`
   - Trigger: **When a HTTP request is received**
   - Click **Create**

2. **Configure Trigger** - Paste this schema:
```json
{
  "type": "object",
  "properties": {
    "category": {"type": "string"},
    "search_term": {"type": "string"},
    "limit": {"type": "integer"}
  }
}
```

3. **+ New step** â†’ **Initialize variable**
   - Name: `filter_query`
   - Type: String
   - Value: `mpa_is_active eq true`

4. **+ New step** â†’ **Condition** (check if category is provided)
   - Condition: Dynamic content â†’ **category** is not equal to `null`
   - If yes: **Set variable** filter_query to: `@{variables('filter_query')} and mpa_channel_category eq '@{triggerBody()?['category']}'`

5. **+ New step** â†’ **Dataverse - List rows**
   - Table name: **Channels** (or type `mpa_channel`)
   - Filter rows: Dynamic content â†’ **filter_query**
   - Row count: `50`
   - Sort by: `mpa_newcolumn asc`

6. **+ New step** â†’ **Response**
   - Status Code: `200`
   - Body:
```json
{
  "status": "Success",
  "count": "@{length(outputs('List_rows')?['body/value'])}",
  "channels": "@{outputs('List_rows')?['body/value']}"
}
```

7. Click **Save**

---

## Flow 8: MPA Import Performance

**Purpose:** Import campaign performance data

### Step-by-Step Instructions

1. **Create** â†’ **Instant cloud flow**
   - Name: `MPA Import Performance`
   - Trigger: **When a HTTP request is received**
   - Click **Create**

2. **Configure Trigger** - Paste this schema:
```json
{
  "type": "object",
  "properties": {
    "plan_id": {"type": "string"},
    "data_source": {"type": "string"},
    "performance_data": {"type": "array"},
    "user_id": {"type": "string"}
  },
  "required": ["plan_id", "performance_data"]
}
```

3. **+ New step** â†’ **Dataverse - Get a row by ID**
   - Table name: **Media Plans**
   - Row ID: Dynamic content â†’ **plan_id**

4. **+ New step** â†’ **Initialize variable**
   - Name: `processed_count`
   - Type: Integer
   - Value: `0`

5. **+ New step** â†’ **Dataverse - Add a new row**
   - Table name: **Data Import Logs** (or type `mpa_dataimportlog`)
   - Plan Id: Dynamic content â†’ **plan_id**
   - Data Source: Dynamic content â†’ **data_source**
   - Import Status: **InProgress**
   - Records Total: Expression â†’ `length(triggerBody()?['performance_data'])`

6. **+ New step** â†’ **Apply to each**
   - Select output: Dynamic content â†’ **performance_data**
   - Inside the loop:
     - **Dataverse - Add a new row**
       - Table name: **Campaign Performance** (or type `mpa_campaignperformance`)
       - Plan Id: Dynamic content â†’ **plan_id**
       - Channel: Current item â†’ **channel**
       - Date: Current item â†’ **date**
       - Impressions: Current item â†’ **impressions**
       - Clicks: Current item â†’ **clicks**
       - Spend: Current item â†’ **spend**
       - Conversions: Current item â†’ **conversions**
     - **Increment variable** â†’ processed_count by 1

7. **+ New step** â†’ **Dataverse - Update a row**
   - Table name: **Data Import Logs**
   - Row ID: (from the Add row step above)
   - Import Status: **Completed**
   - Records Processed: Dynamic content â†’ **processed_count**

8. **+ New step** â†’ **Response**
   - Status Code: `200`
   - Body:
```json
{
  "status": "Success",
  "records_processed": "@{variables('processed_count')}"
}
```

9. Click **Save**

---

## Flow 9: MPA Create PostMortem

**Purpose:** Create a post-mortem analysis report

### Step-by-Step Instructions

1. **Create** â†’ **Instant cloud flow**
   - Name: `MPA Create PostMortem`
   - Trigger: **When a HTTP request is received**
   - Click **Create**

2. **Configure Trigger** - Paste this schema:
```json
{
  "type": "object",
  "properties": {
    "plan_id": {"type": "string"},
    "report_title": {"type": "string"},
    "user_id": {"type": "string"},
    "analysis_start_date": {"type": "string"},
    "analysis_end_date": {"type": "string"}
  },
  "required": ["plan_id", "user_id"]
}
```

3. **+ New step** â†’ **Dataverse - Get a row by ID**
   - Table name: **Media Plans**
   - Row ID: Dynamic content â†’ **plan_id**

4. **+ New step** â†’ **Dataverse - Get a row by ID**
   - Table name: **EAP Clients**
   - Row ID: Dynamic content â†’ **Client Id** (from Media Plans)

5. **+ New step** â†’ **Dataverse - List rows**
   - Table name: **Campaign Performance**
   - Filter rows: `mpa_plan_id eq '@{triggerBody()?['plan_id']}'`

6. **+ New step** â†’ **Initialize variable**
   - Name: `report_code`
   - Type: String
   - Value: `PMR-001`

7. **+ New step** â†’ **Dataverse - Add a new row**
   - Table name: **Post Mortem Reports** (or type `mpa_postmortemreport`)
   - Report Id: Dynamic content â†’ **report_code**
   - Report Title: Dynamic content â†’ **report_title** (or default: "Post-Mortem Report")
   - Plan Id: Dynamic content â†’ **plan_id**
   - Client Id: Dynamic content â†’ **Client Id** (from Media Plans)
   - Status: **Draft**
   - Analysis Start Date: Dynamic content â†’ **analysis_start_date**
   - Analysis End Date: Dynamic content â†’ **analysis_end_date**

8. **+ New step** â†’ **Dataverse - Update a row**
   - Table name: **Media Plans**
   - Row ID: Dynamic content â†’ **plan_id**
   - Lifecycle Mode: **PostMortem**

9. **+ New step** â†’ **Response**
   - Status Code: `200`
   - Body:
```json
{
  "status": "Success",
  "report_id": "@{outputs('Add_a_new_row_2')?['body/mpa_postmortemreportid']}",
  "message": "Post-mortem report created"
}
```

10. Click **Save**

---

## Flow 10: MPA Promote Learning

**Purpose:** Promote a plan learning to the EAP knowledge base

### Step-by-Step Instructions

1. **Create** â†’ **Instant cloud flow**
   - Name: `MPA Promote Learning`
   - Trigger: **When a HTTP request is received**
   - Click **Create**

2. **Configure Trigger** - Paste this schema:
```json
{
  "type": "object",
  "properties": {
    "learning_id": {"type": "string"},
    "scope": {"type": "string"},
    "user_id": {"type": "string"}
  },
  "required": ["learning_id", "user_id"]
}
```

3. **+ New step** â†’ **Dataverse - Get a row by ID**
   - Table name: **Plan Learnings** (or type `mpa_planlearning`)
   - Row ID: Dynamic content â†’ **learning_id**

4. **+ New step** â†’ **Condition**
   - Check if already promoted
   - Condition: Dynamic content â†’ **Is Promoted** is equal to `true`

5. **If yes branch** â†’ **Response**
   - Status Code: `400`
   - Body:
```json
{
  "status": "Error",
  "message": "Learning already promoted"
}
```

6. **If no branch** â†’ **Dataverse - Add a new row**
   - Table name: **EAP Learnings** (or type `eap_learning`)
   - Title: Dynamic content â†’ **Learning Title** (from Get row)
   - Content: Dynamic content â†’ **Learning Description** (from Get row)
   - Category: Dynamic content â†’ **Category** (from Get row)
   - Source Agent: `MPA`
   - Source Entity Type: `PlanLearning`
   - Source Entity Id: Dynamic content â†’ **learning_id**
   - Scope: Dynamic content â†’ **scope**
   - Is Active: **Yes**

7. **If no branch** â†’ **Dataverse - Update a row**
   - Table name: **Plan Learnings**
   - Row ID: Dynamic content â†’ **learning_id**
   - Is Promoted: **Yes**
   - EAP Learning Id: Dynamic content â†’ (from Add row above)

8. **If no branch** â†’ **Response**
   - Status Code: `200`
   - Body:
```json
{
  "status": "Success",
  "message": "Learning promoted to EAP"
}
```

9. Click **Save**

---

## Flow 11: MPA Process Media Brief

**Purpose:** Main entry point - create a complete plan from a media brief

### Step-by-Step Instructions

1. **Create** â†’ **Instant cloud flow**
   - Name: `MPA Process Media Brief`
   - Trigger: **When a HTTP request is received**
   - Click **Create**

2. **Configure Trigger** - Paste this schema:
```json
{
  "type": "object",
  "properties": {
    "client_id": {"type": "string"},
    "campaign_name": {"type": "string"},
    "user_id": {"type": "string"},
    "pathway": {"type": "string"},
    "campaign_type": {"type": "string"},
    "budget_estimate": {"type": "number"},
    "start_date": {"type": "string"},
    "end_date": {"type": "string"},
    "primary_objective": {"type": "string"}
  },
  "required": ["client_id", "campaign_name", "user_id", "pathway"]
}
```

3. **+ New step** â†’ **Initialize variable**
   - Name: `plan_code`
   - Type: String
   - Value: `PLN-001`

4. **+ New step** â†’ **Initialize variable**
   - Name: `session_code`
   - Type: String
   - Value: `SES-001`

5. **+ New step** â†’ **Dataverse - Get a row by ID**
   - Table name: **EAP Clients**
   - Row ID: Dynamic content â†’ **client_id**

6. **+ New step** â†’ **Dataverse - Add a new row**
   - Table name: **Media Plans**
   - Campaign Name: Dynamic content â†’ **campaign_name**
   - Client Id: Dynamic content â†’ **client_id**
   - Plan Code: Dynamic content â†’ **plan_code**
   - Pathway: Dynamic content â†’ **pathway**
   - Status: **Draft**
   - Lifecycle Mode: **Planning**
   - Current Step: `1`
   - Current Gate: `0`
   - Total Budget: Dynamic content â†’ **budget_estimate**
   - Start Date: Dynamic content â†’ **start_date**
   - End Date: Dynamic content â†’ **end_date**

7. **+ New step** â†’ **Dataverse - Add a new row**
   - Table name: **Plan Versions**
   - Plan Id: Dynamic content â†’ (Media Plan ID from step above)
   - Version Number: `1`
   - Is Current: **Yes**
   - Change Summary: `Initial plan creation from media brief`

8. **+ New step** â†’ **Dataverse - Add a new row**
   - Table name: **EAP Sessions** (or type `eap_session`)
   - Session Code: Dynamic content â†’ **session_code**
   - Agent Type: `MPA`
   - Status: **Active**

9. **Create 10 Plan Data sections** (repeat Add a new row for each):

   **Section 1: Client Context**
   - Table name: **Plan Data**
   - Plan Id: (from Media Plan)
   - Section Name: `Client Context`
   - Section Type: `ClientContext`
   - Step Number: `1`
   - Section Status: **NotStarted**
   - Section Data: `{}`

   **Section 2: Objectives**
   - Section Name: `Objectives`
   - Section Type: `Objectives`
   - Step Number: `2`

   **Section 3: Budget**
   - Section Name: `Budget`
   - Section Type: `Budget`
   - Step Number: `3`

   **Section 4: Audience**
   - Section Name: `Audience`
   - Section Type: `Audience`
   - Step Number: `4`

   **Section 5: Channel Mix**
   - Section Name: `Channel Mix`
   - Section Type: `ChannelMix`
   - Step Number: `5`

   **Section 6: Partners**
   - Section Name: `Partners`
   - Section Type: `Partners`
   - Step Number: `6`

   **Section 7: Measurement**
   - Section Name: `Measurement`
   - Section Type: `Measurement`
   - Step Number: `7`

   **Section 8: Optimization**
   - Section Name: `Optimization`
   - Section Type: `Optimization`
   - Step Number: `8`

   **Section 9: Compliance**
   - Section Name: `Compliance`
   - Section Type: `Compliance`
   - Step Number: `9`

   **Section 10: Final Plan**
   - Section Name: `Final Plan`
   - Section Type: `FinalPlan`
   - Step Number: `10`

10. **+ New step** â†’ **Response**
    - Status Code: `200`
    - Body:
```json
{
  "status": "Success",
  "plan_id": "@{outputs('Add_a_new_row')?['body/mpa_mediaplanid']}",
  "plan_code": "@{variables('plan_code')}",
  "session_code": "@{variables('session_code')}",
  "pathway": "@{triggerBody()?['pathway']}",
  "message": "Media plan created from brief"
}
```

11. Click **Save**

---

## Testing Flows

For each flow, after saving:

1. Click **Test** in the top right
2. Select **Manually**
3. Click **Test**
4. Enter test JSON data
5. Click **Run flow**

### Sample Test Data

**MPA Create Plan:**
```json
{
  "client_id": "YOUR-CLIENT-GUID",
  "campaign_name": "Test Campaign Q1",
  "user_id": "test-user",
  "pathway": "STANDARD",
  "budget": 50000,
  "start_date": "2025-02-01",
  "end_date": "2025-03-31"
}
```

**MPA Search Benchmarks:**
```json
{
  "vertical": "Retail",
  "channel": "Display",
  "limit": 10
}
```

**MPA Search Channels:**
```json
{
  "category": "Digital",
  "limit": 20
}
```

---

## Troubleshooting

### Connection Error
If you see "connection is missing authenticated user":
1. Go to **More** â†’ **Connections**
2. Click **...** on Dataverse connection â†’ **Switch account**
3. Sign in again
4. Return to flow and save

### Table Not Found
If table name shows error:
1. Click the dropdown to browse tables
2. Search for the display name (e.g., "Media Plans" not "mpa_mediaplan")
3. Or enter as custom value with exact schema name

### Dynamic Content Not Found
If you can't find expected dynamic content:
1. Make sure previous steps are configured
2. Click **See more** in the dynamic content panel
3. Check the correct step name/output

---

## Summary Checklist

| # | Flow Name | Status |
|---|-----------|--------|
| 1 | MPA Initialize Session | âœ… Complete |
| 2 | MPA Create Plan | â¬œ To Build |
| 3 | MPA Save Section | â¬œ To Build |
| 4 | MPA Validate Plan | â¬œ To Build |
| 5 | MPA Generate Document | â¬œ To Build |
| 6 | MPA Search Benchmarks | â¬œ To Build |
| 7 | MPA Search Channels | â¬œ To Build |
| 8 | MPA Import Performance | â¬œ To Build |
| 9 | MPA Create PostMortem | â¬œ To Build |
| 10 | MPA Promote Learning | â¬œ To Build |
| 11 | MPA Process Media Brief | â¬œ To Build |

---

*Document Version: 1.0*
*Created: December 27, 2025*
*Environment: Aragorn AI*
