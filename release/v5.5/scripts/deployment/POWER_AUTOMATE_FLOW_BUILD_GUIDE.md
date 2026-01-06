# Power Automate Flow Build Guide - MPA v5.5

## CRITICAL INFORMATION

This guide provides exact step-by-step instructions for building each Power Automate flow. Follow EXACTLY as written.

### Prerequisites
- Solution: Media Planning Agent v5.5 (created with mpa_ publisher prefix)
- Environment: Aragorn AI
- Connection References created:
  - mpa_conn_dataverse (Dataverse)
  - mpa_conn_sharepoint (SharePoint)
  - mpa_conn_outlook (Office 365 Outlook)

### Flow Build Order (Dependencies)
1. flow_11_LogError (no dependencies - build first)
2. flow_08_SearchBenchmarks
3. flow_01_CreateSession
4. flow_60_InitializeSession
5. flow_03_UpdatePlanData
6. flow_05_ValidateGate
7. flow_04_RunProjections
8. flow_06_GenerateDocument
9. flow_10_CalculateBudgetAllocation
10. flow_09_CalculateGap
11. flow_02_ProcessMediaBrief
12. flow_07_GetPlanSummary

---

# FLOW 1: MPA - Log Error (flow_11_LogError)

## Overview
| Property | Value |
|----------|-------|
| Display Name | MPA - Log Error |
| Type | Instant cloud flow |
| Solution | Media Planning Agent v5.5 |
| Trigger | PowerApps (V2) |

## Step 1: Create the Flow

1. Go to make.powerautomate.com
2. Select environment: **Aragorn AI**
3. Click **Solutions** in left nav
4. Open **Media Planning Agent v5.5**
5. Click **+ New** → **Automation** → **Cloud flow** → **Instant**
6. Flow name: `MPA - Log Error`
7. Trigger: Select **PowerApps (V2)**
8. Click **Create**

## Step 2: Configure Trigger - PowerApps (V2)

Click on the trigger to expand it.

### Add Input Parameters

Click **+ Add an input** for each parameter below:

#### Input 1: source
| Field | Value |
|-------|-------|
| Type | Text |
| Name | source |
| Description | Source flow or function name that generated the error |

#### Input 2: errorCode
| Field | Value |
|-------|-------|
| Type | Text |
| Name | errorCode |
| Description | Error code identifier |

#### Input 3: errorMessage
| Field | Value |
|-------|-------|
| Type | Text |
| Name | errorMessage |
| Description | Human-readable error message |

#### Input 4: errorDetails
| Field | Value |
|-------|-------|
| Type | Text |
| Name | errorDetails |
| Description | JSON string with full error details |

#### Input 5: sessionId
| Field | Value |
|-------|-------|
| Type | Text |
| Name | sessionId |
| Description | Session ID if available |

#### Input 6: planId
| Field | Value |
|-------|-------|
| Type | Text |
| Name | planId |
| Description | Plan ID if available |

#### Input 7: severity
| Field | Value |
|-------|-------|
| Type | Text |
| Name | severity |
| Description | Error severity: Low, Medium, High, or Critical |

## Step 3: Add Action - Initialize Variable (for severity default)

1. Click **+ New step**
2. Search for **Initialize variable**
3. Select **Initialize variable**

| Field | Value |
|-------|-------|
| Name | varSeverity |
| Type | String |
| Value | (click Expression tab, paste below) |

**Expression:**
```
coalesce(triggerBody()?['text_4'], 'Medium')
```

Note: `text_4` corresponds to the severity input. Verify the actual dynamic content name.

## Step 4: Add Action - Add a new row (Dataverse)

1. Click **+ New step**
2. Search for **Add a new row**
3. Select **Add a new row** under Microsoft Dataverse

| Field | Value |
|-------|-------|
| Table name | Error Logs (or mpa_errorlog if custom) |

**If using custom table mpa_errorlog:**

| Column | Value | How to Set |
|--------|-------|------------|
| Source | source | Dynamic content from trigger |
| Error Code | errorCode | Dynamic content from trigger |
| Error Message | errorMessage | Dynamic content from trigger |
| Error Details | errorDetails | Dynamic content from trigger |
| Session ID | sessionId | Dynamic content from trigger |
| Plan ID | planId | Dynamic content from trigger |
| Severity | varSeverity | Dynamic content (the variable) |
| Occurred At | (Expression) | `utcNow()` |

**NOTE:** If mpa_errorlog table doesn't exist, create it first OR use eap_audit table instead with these mappings:
- eap_action_type = "Error"
- eap_description = errorMessage
- eap_agent_source = "MPA_AGENT"

## Step 5: Add Condition - Check Severity

1. Click **+ New step**
2. Search for **Condition**
3. Select **Condition**

**Condition Setup:**

| Field | Value |
|-------|-------|
| Left side | varSeverity |
| Operator | is equal to |
| Right side | Critical |

Click **+ Add** → **Add row** to add OR condition:

| Field | Value |
|-------|-------|
| Left side | varSeverity |
| Operator | is equal to |
| Right side | High |

Change the condition group to **Or** (click the dropdown that says "And").

## Step 6: If Yes - Send Email Alert

In the **If yes** branch:

1. Click **Add an action**
2. Search for **Send an email (V2)**
3. Select **Send an email (V2)** under Office 365 Outlook

| Field | Value |
|-------|-------|
| To | kevin.bauer@kesseldigital.com |
| Subject | (Expression below) |
| Body | (HTML below) |
| Is HTML | Yes |

**Subject Expression:**
```
concat('[MPA Alert] ', variables('varSeverity'), ' Error in ', triggerBody()?['text'])
```

**Body (paste as HTML):**
```html
<h2>Media Planning Agent Error Alert</h2>
<p><strong>Source:</strong> @{triggerBody()?['text']}</p>
<p><strong>Severity:</strong> @{variables('varSeverity')}</p>
<p><strong>Error:</strong> @{triggerBody()?['text_2']}</p>
<p><strong>Time:</strong> @{utcNow()}</p>
<hr>
<p><strong>Session ID:</strong> @{triggerBody()?['text_3']}</p>
<p><strong>Plan ID:</strong> @{triggerBody()?['text_5']}</p>
<hr>
<p><strong>Details:</strong></p>
<pre>@{triggerBody()?['text_1']}</pre>
```

Replace @{triggerBody()?['text']} etc. with proper dynamic content references.

## Step 7: Add Response to PowerApps

1. After the Condition (not inside it), click **+ New step**
2. Search for **Respond to a PowerApp or flow**
3. Select **Respond to a PowerApp or flow**

### Add Outputs

Click **+ Add an output** for each:

#### Output 1: logged
| Field | Value |
|-------|-------|
| Type | Yes/No |
| Name | logged |
| Value | Yes (select from dropdown) |

#### Output 2: errorLogId
| Field | Value |
|-------|-------|
| Type | Text |
| Name | errorLogId |
| Value | (Dynamic content: ID from Add a new row) |

## Step 8: Save and Test

1. Click **Save**
2. Click **Test** → **Manually** → **Test**
3. Enter test values:
   - source: TestFlow
   - errorCode: TEST001
   - errorMessage: This is a test error
   - errorDetails: {"test": true}
   - sessionId: test-session-123
   - planId: test-plan-456
   - severity: Low
4. Click **Run flow**
5. Verify it completes successfully

---

# FLOW 2: MPA - Search Benchmarks (flow_08_SearchBenchmarks)

## Overview
| Property | Value |
|----------|-------|
| Display Name | MPA - Search Benchmarks |
| Type | Instant cloud flow |
| Solution | Media Planning Agent v5.5 |
| Trigger | PowerApps (V2) |

## Step 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Search Benchmarks`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## Step 2: Configure Trigger Inputs

Add these inputs to the PowerApps trigger:

#### Input 1: vertical
| Field | Value |
|-------|-------|
| Type | Text |
| Name | vertical |
| Description | Industry vertical to filter benchmarks |

#### Input 2: channel
| Field | Value |
|-------|-------|
| Type | Text |
| Name | channel |
| Description | Media channel to filter benchmarks |

#### Input 3: metricType
| Field | Value |
|-------|-------|
| Type | Text |
| Name | metricType |
| Description | Metric type: CPM, CTR, CVR, CPA, ROAS, etc. |

## Step 3: Add Action - List rows (Dataverse)

1. Click **+ New step**
2. Search for **List rows**
3. Select **List rows** under Microsoft Dataverse

| Field | Value |
|-------|-------|
| Table name | Benchmarks (mpa_benchmark) |
| Filter rows | (see expression below) |
| Select columns | mpa_vertical,mpa_channel,mpa_metrictype,mpa_benchmarklow,mpa_benchmarkmedian,mpa_benchmarkhigh,mpa_benchmarkbestinclass,mpa_datasource,mpa_confidence |

**Filter rows expression (click Expression tab):**

```
concat(
  if(empty(triggerBody()?['text']), '', concat('mpa_vertical eq ''', triggerBody()?['text'], '''')),
  if(and(not(empty(triggerBody()?['text'])), not(empty(triggerBody()?['text_1']))), ' and ', ''),
  if(empty(triggerBody()?['text_1']), '', concat('mpa_channel eq ''', triggerBody()?['text_1'], '''')),
  if(and(or(not(empty(triggerBody()?['text'])), not(empty(triggerBody()?['text_1']))), not(empty(triggerBody()?['text_2']))), ' and ', ''),
  if(empty(triggerBody()?['text_2']), '', concat('mpa_metrictype eq ''', triggerBody()?['text_2'], ''''))
)
```

**SIMPLER ALTERNATIVE - Build filter dynamically:**

Instead of the complex expression, use **Compose** actions:

### Step 3a: Initialize Filter Variable
1. Add **Initialize variable**
| Field | Value |
|-------|-------|
| Name | varFilter |
| Type | String |
| Value | mpa_isactive eq true |

### Step 3b: Append Vertical Filter (Condition)
1. Add **Condition**
   - Left: `triggerBody()?['text']` (vertical input)
   - Operator: is not equal to
   - Right: (leave empty for null check) OR use expression `null`

2. If yes, add **Append to string variable**
| Field | Value |
|-------|-------|
| Name | varFilter |
| Value | ` and mpa_vertical eq '@{triggerBody()?['text']}'` |

### Step 3c: Append Channel Filter (Condition)
Repeat for channel input.

### Step 3d: Append MetricType Filter (Condition)
Repeat for metricType input.

### Step 3e: List Rows with Filter Variable
Use `variables('varFilter')` in the Filter rows field.

## Step 4: Add Action - Select (Transform Results)

1. Click **+ New step**
2. Search for **Select**
3. Select **Select** under Data Operations

| Field | Value |
|-------|-------|
| From | `body('List_rows')?['value']` (or dynamic content: value from List rows) |
| Map | (switch to text mode, paste JSON below) |

**Map (click "Switch to text mode" first):**
```json
{
  "vertical": @{item()?['mpa_vertical']},
  "channel": @{item()?['mpa_channel']},
  "metricType": @{item()?['mpa_metrictype']},
  "low": @{item()?['mpa_benchmarklow']},
  "median": @{item()?['mpa_benchmarkmedian']},
  "high": @{item()?['mpa_benchmarkhigh']},
  "bestInClass": @{item()?['mpa_benchmarkbestinclass']},
  "source": @{item()?['mpa_datasource']},
  "confidence": @{item()?['mpa_confidence']}
}
```

**OR use Key-Value mode:**

| Key | Value |
|-----|-------|
| vertical | mpa_vertical (dynamic content) |
| channel | mpa_channel (dynamic content) |
| metricType | mpa_metrictype (dynamic content) |
| low | mpa_benchmarklow (dynamic content) |
| median | mpa_benchmarkmedian (dynamic content) |
| high | mpa_benchmarkhigh (dynamic content) |
| bestInClass | mpa_benchmarkbestinclass (dynamic content) |
| source | mpa_datasource (dynamic content) |
| confidence | mpa_confidence (dynamic content) |

## Step 5: Add Action - Compose (Build Response)

1. Click **+ New step**
2. Search for **Compose**
3. Select **Compose** under Data Operations

**Inputs (paste as JSON, then replace with dynamic content):**
```json
{
  "status": "success",
  "totalResults": @{length(body('Select'))},
  "benchmarks": @{body('Select')},
  "filtersApplied": {
    "vertical": "@{triggerBody()?['text']}",
    "channel": "@{triggerBody()?['text_1']}",
    "metricType": "@{triggerBody()?['text_2']}"
  }
}
```

Use Expression for totalResults: `length(body('Select'))`

## Step 6: Add Response to PowerApps

1. Click **+ New step**
2. Search for **Respond to a PowerApp or flow**
3. Select **Respond to a PowerApp or flow**

### Add Outputs

#### Output 1: benchmarksJson
| Field | Value |
|-------|-------|
| Type | Text |
| Name | benchmarksJson |
| Value | (Expression) `string(outputs('Compose'))` |

#### Output 2: totalResults
| Field | Value |
|-------|-------|
| Type | Number |
| Name | totalResults |
| Value | (Expression) `length(body('Select'))` |

#### Output 3: status
| Field | Value |
|-------|-------|
| Type | Text |
| Name | status |
| Value | success |

## Step 7: Add Error Handling (Configure Run After)

1. Click the **...** menu on the Response action
2. Select **Configure run after**
3. Check both **is successful** and **has failed**

Add a **Condition** before Response to check if List rows failed:
- If failed, set status to "error" and benchmarksJson to empty array

## Step 8: Save and Test

1. Save the flow
2. Test with:
   - vertical: Retail
   - channel: Display
   - metricType: CPM
3. Verify benchmarks are returned

---

# FLOW 3: MPA - Create Session (flow_01_CreateSession)

## Overview
| Property | Value |
|----------|-------|
| Display Name | MPA - Create Session |
| Type | Instant cloud flow |
| Solution | Media Planning Agent v5.5 |
| Trigger | PowerApps (V2) |

## Step 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Create Session`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## Step 2: Configure Trigger Inputs

#### Input 1: userId
| Field | Value |
|-------|-------|
| Type | Text |
| Name | userId |
| Description | User's unique identifier from Entra ID |

#### Input 2: clientId
| Field | Value |
|-------|-------|
| Type | Text |
| Name | clientId |
| Description | Optional client identifier |

#### Input 3: vertical
| Field | Value |
|-------|-------|
| Type | Text |
| Name | vertical |
| Description | Initial industry vertical |

#### Input 4: objective
| Field | Value |
|-------|-------|
| Type | Text |
| Name | objective |
| Description | Initial campaign objective |

## Step 3: Add Action - HTTP (Call Azure Function)

1. Click **+ New step**
2. Search for **HTTP**
3. Select **HTTP**

| Field | Value |
|-------|-------|
| Method | POST |
| URI | https://func-aragorn-mpa.azurewebsites.net/api/session |
| Headers | (see below) |
| Body | (see below) |

**Headers (click "Show advanced options"):**

| Key | Value |
|-----|-------|
| Content-Type | application/json |
| x-functions-key | `lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ==` |

**Body:**
```json
{
  "action": "create",
  "user_id": "@{triggerBody()?['text']}",
  "client_id": "@{triggerBody()?['text_1']}",
  "context": {
    "vertical": "@{triggerBody()?['text_2']}",
    "objective": "@{triggerBody()?['text_3']}"
  }
}
```

Replace the @{...} with actual dynamic content from trigger.

## Step 4: Add Action - Parse JSON

1. Click **+ New step**
2. Search for **Parse JSON**
3. Select **Parse JSON** under Data Operations

| Field | Value |
|-------|-------|
| Content | Body (from HTTP action) |
| Schema | (paste below) |

**Schema:**
```json
{
  "type": "object",
  "properties": {
    "status": {"type": "string"},
    "session": {
      "type": "object",
      "properties": {
        "session_id": {"type": "string"},
        "user_id": {"type": "string"},
        "status": {"type": "string"}
      }
    },
    "error": {"type": "string"}
  }
}
```

## Step 5: Add Condition - Check Success

1. Click **+ New step**
2. Search for **Condition**
3. Select **Condition**

| Field | Value |
|-------|-------|
| Left side | status (from Parse JSON) |
| Operator | is equal to |
| Right side | success |

## Step 6: If Yes - Return Success

In **If yes** branch:

1. Add **Respond to a PowerApp or flow**

#### Output 1: sessionId
| Field | Value |
|-------|-------|
| Type | Text |
| Name | sessionId |
| Value | session_id (from Parse JSON → session) |

#### Output 2: status
| Field | Value |
|-------|-------|
| Type | Text |
| Name | status |
| Value | active |

#### Output 3: message
| Field | Value |
|-------|-------|
| Type | Text |
| Name | message |
| Value | Session created successfully |

## Step 7: If No - Call LogError and Return Error

In **If no** branch:

1. Add **Run a Child Flow** (or HTTP to call LogError)
   - If using Child Flow: Select "MPA - Log Error"
   - Pass: source = "MPA - Create Session", errorMessage = error from Parse JSON

2. Add **Respond to a PowerApp or flow**

#### Output 1: sessionId
| Field | Value |
|-------|-------|
| Type | Text |
| Name | sessionId |
| Value | (leave empty or use expression `null`) |

#### Output 2: status
| Field | Value |
|-------|-------|
| Type | Text |
| Name | status |
| Value | error |

#### Output 3: message
| Field | Value |
|-------|-------|
| Type | Text |
| Name | message |
| Value | error (from Parse JSON) OR "Failed to create session" |

## Step 8: Save and Test

Save and test with sample user ID.

---
# FLOW 4: MPA - Generate Document (flow_06_GenerateDocument)

## Overview
| Property | Value |
|----------|-------|
| Display Name | MPA - Generate Document |
| Type | Instant cloud flow |
| Solution | Media Planning Agent v5.5 |
| Trigger | PowerApps (V2) |

## Step 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Generate Document`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## Step 2: Configure Trigger Inputs

#### Input 1: planId
| Field | Value |
|-------|-------|
| Type | Text |
| Name | planId |
| Description | Media plan ID from Dataverse |

#### Input 2: planDataJson
| Field | Value |
|-------|-------|
| Type | Text |
| Name | planDataJson |
| Description | JSON string containing complete plan data for document generation |

## Step 3: Add Action - Parse JSON (Plan Data)

1. Click **+ New step**
2. Search for **Parse JSON**
3. Select **Parse JSON**

| Field | Value |
|-------|-------|
| Content | planDataJson (from trigger) |
| Schema | (paste below) |

**Schema:**
```json
{
  "type": "object",
  "properties": {
    "metadata": {
      "type": "object",
      "properties": {
        "planName": {"type": "string"},
        "clientName": {"type": "string"},
        "preparedBy": {"type": "string"},
        "preparedDate": {"type": "string"},
        "version": {"type": "string"}
      }
    },
    "budgetTiers": {"type": "array"},
    "channels": {"type": "array"},
    "dmaAllocations": {"type": "array"},
    "audiences": {"type": "array"},
    "performanceTargets": {"type": "object"}
  }
}
```

## Step 4: Add Action - HTTP (Call Azure Function)

1. Click **+ New step**
2. Search for **HTTP**
3. Select **HTTP**

| Field | Value |
|-------|-------|
| Method | POST |
| URI | https://func-aragorn-mpa.azurewebsites.net/api/generate-media-plan-document |
| Headers | (see below) |
| Body | planDataJson (from trigger - pass the raw JSON string) |

**Headers:**

| Key | Value |
|-----|-------|
| Content-Type | application/json |
| x-functions-key | lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ== |
| Accept | application/vnd.openxmlformats-officedocument.wordprocessingml.document |

## Step 5: Add Condition - Check HTTP Status

1. Click **+ New step**
2. Search for **Condition**
3. Select **Condition**

**Condition:**
| Field | Value |
|-------|-------|
| Left side | (Expression) `outputs('HTTP')?['statusCode']` |
| Operator | is equal to |
| Right side | 200 |

## Step 6: If Yes - Save to SharePoint

In **If yes** branch:

### Step 6a: Create File in SharePoint
1. Add **Create file** under SharePoint

| Field | Value |
|-------|-------|
| Site Address | https://kesseldigitalcom.sharepoint.com/sites/KesselDigital |
| Folder Path | /Shared Documents/Media Plans |
| File Name | (Expression below) |
| File Content | Body (from HTTP action) |

**File Name Expression:**
```
concat(body('Parse_JSON')?['metadata']?['planName'], '_', formatDateTime(utcNow(), 'yyyyMMdd_HHmmss'), '.docx')
```

### Step 6b: Create Sharing Link (Optional)
1. Add **Create sharing link for a file or folder** under SharePoint

| Field | Value |
|-------|-------|
| Site Address | https://kesseldigitalcom.sharepoint.com/sites/KesselDigital |
| Library Name | Shared Documents |
| Item Id | Id (from Create file output) |
| Link Type | View |
| Link Scope | People in your organization |

### Step 6c: Add Audit Record
1. Add **Add a new row** under Dataverse

| Field | Value |
|-------|-------|
| Table name | eap_audit (or create if needed) |

| Column | Value |
|--------|-------|
| eap_action_type | DocumentGenerated |
| eap_entity_type | mpa_mediaplan |
| eap_entity_id | planId (from trigger) |
| eap_description | (Expression below) |
| eap_agent_source | MPA_AGENT |
| eap_created_at | (Expression) `utcNow()` |

**Description Expression:**
```
concat('Media plan document generated: ', body('Parse_JSON')?['metadata']?['planName'], '.docx')
```

### Step 6d: Return Success Response
1. Add **Respond to a PowerApp or flow**

#### Output 1: status
| Type | Text |
| Name | status |
| Value | success |

#### Output 2: documentUrl
| Type | Text |
| Name | documentUrl |
| Value | Link (from Create sharing link) OR Path (from Create file) |

#### Output 3: documentName
| Type | Text |
| Name | documentName |
| Value | Name (from Create file) |

#### Output 4: generatedAt
| Type | Text |
| Name | generatedAt |
| Value | (Expression) `utcNow()` |

## Step 7: If No - Return Error

In **If no** branch:

1. Add **Respond to a PowerApp or flow**

| Output | Value |
|--------|-------|
| status | error |
| documentUrl | (empty) |
| documentName | (empty) |
| generatedAt | (empty) |
| errorMessage | Failed to generate document |

## Step 8: Save and Test

Save and test with sample plan data JSON.

---

# FLOW 5: MPA - Calculate Budget Allocation (flow_10_CalculateBudgetAllocation)

## Overview
| Property | Value |
|----------|-------|
| Display Name | MPA - Calculate Budget Allocation |
| Type | Instant cloud flow |
| Solution | Media Planning Agent v5.5 |
| Trigger | PowerApps (V2) |

## Step 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Calculate Budget Allocation`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## Step 2: Configure Trigger Inputs

#### Input 1: totalBudget
| Field | Value |
|-------|-------|
| Type | Number |
| Name | totalBudget |
| Description | Total campaign budget in dollars |

#### Input 2: channels
| Field | Value |
|-------|-------|
| Type | Text |
| Name | channels |
| Description | JSON array of selected channels |

#### Input 3: objectives
| Field | Value |
|-------|-------|
| Type | Text |
| Name | objectives |
| Description | JSON object with campaign objectives and weights |

#### Input 4: vertical
| Field | Value |
|-------|-------|
| Type | Text |
| Name | vertical |
| Description | Industry vertical for benchmark-based allocation |

## Step 3: Add Action - HTTP (Call Azure Function)

1. Click **+ New step**
2. Search for **HTTP**
3. Select **HTTP**

| Field | Value |
|-------|-------|
| Method | POST |
| URI | https://func-aragorn-mpa.azurewebsites.net/api/allocation |
| Headers | Content-Type: application/json, x-functions-key: [key] |
| Body | (see below) |

**Body:**
```json
{
  "total_budget": @{triggerBody()['number']},
  "channels": @{json(triggerBody()?['text_1'])},
  "objectives": @{json(triggerBody()?['text_2'])},
  "vertical": "@{triggerBody()?['text_3']}"
}
```

**Alternative using Compose first:**

### Step 3a: Compose Request Body
```json
{
  "total_budget": totalBudget,
  "channels": channels (parsed as JSON),
  "objectives": objectives (parsed as JSON),
  "vertical": vertical
}
```

## Step 4: Add Action - Parse JSON (Response)

1. Click **+ New step**
2. Search for **Parse JSON**
3. Select **Parse JSON**

| Field | Value |
|-------|-------|
| Content | Body (from HTTP) |
| Schema | (paste below) |

**Schema:**
```json
{
  "type": "object",
  "properties": {
    "status": {"type": "string"},
    "allocation": {
      "type": "object",
      "properties": {
        "total_budget": {"type": "number"},
        "channel_allocations": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "channel": {"type": "string"},
              "budget": {"type": "number"},
              "percentage": {"type": "number"},
              "estimated_impressions": {"type": "number"},
              "estimated_cpm": {"type": "number"}
            }
          }
        }
      }
    },
    "recommendations": {"type": "array"}
  }
}
```

## Step 5: Add Response

1. Add **Respond to a PowerApp or flow**

#### Output 1: status
| Type | Text |
| Name | status |
| Value | status (from Parse JSON) |

#### Output 2: allocationJson
| Type | Text |
| Name | allocationJson |
| Value | (Expression) `string(body('Parse_JSON')?['allocation'])` |

#### Output 3: recommendationsJson
| Type | Text |
| Name | recommendationsJson |
| Value | (Expression) `string(body('Parse_JSON')?['recommendations'])` |

## Step 6: Save and Test

Test with sample budget and channel data.

---

# FLOW 6: MPA - Run Projections (flow_04_RunProjections)

## Overview
| Property | Value |
|----------|-------|
| Display Name | MPA - Run Projections |
| Type | Instant cloud flow |
| Solution | Media Planning Agent v5.5 |
| Trigger | PowerApps (V2) |

## Step 1: Create the Flow

Same pattern as above. Trigger inputs:

| Input | Type | Description |
|-------|------|-------------|
| planId | Text | Media plan ID |
| allocationJson | Text | JSON with budget allocation by channel |
| vertical | Text | Industry vertical |
| campaignDuration | Number | Campaign duration in days |

## Step 2: HTTP Call to Azure Function

| Field | Value |
|-------|-------|
| Method | POST |
| URI | https://func-aragorn-mpa.azurewebsites.net/api/projections |
| Body | Plan data with allocation |

## Step 3: Parse Response and Return

Return projected impressions, reach, frequency, CPM, and ROI estimates.

---

# FLOW 7: MPA - Validate Gate (flow_05_ValidateGate)

## Overview
| Property | Value |
|----------|-------|
| Display Name | MPA - Validate Gate |
| Type | Instant cloud flow |
| Solution | Media Planning Agent v5.5 |
| Trigger | PowerApps (V2) |

## Step 1: Create Flow with Inputs

| Input | Type | Description |
|-------|------|-------------|
| planId | Text | Media plan ID |
| gateNumber | Number | Gate number (1-4) |
| planDataJson | Text | Current plan data JSON |

## Step 2: HTTP Call to Azure Function

| Field | Value |
|-------|-------|
| Method | POST |
| URI | https://func-aragorn-mpa.azurewebsites.net/api/validate-gate |
| Body | Gate number and plan data |

## Step 3: Parse and Return Validation Results

Return:
- gateStatus: passed/failed/warning
- validationResults: Array of checks
- missingFields: Array of required but missing fields
- recommendations: Suggestions to pass gate

---

# FLOW 8: MPA - Get Plan Summary (flow_07_GetPlanSummary)

## Overview
| Property | Value |
|----------|-------|
| Display Name | MPA - Get Plan Summary |
| Type | Instant cloud flow |
| Solution | Media Planning Agent v5.5 |
| Trigger | PowerApps (V2) |

## Step 1: Create Flow with Input

| Input | Type | Description |
|-------|------|-------------|
| planId | Text | Media plan ID |

## Step 2: Get Plan from Dataverse

1. Add **Get a row by ID** under Dataverse
| Field | Value |
|-------|-------|
| Table name | Media Plans (mpa_mediaplan) |
| Row ID | planId (from trigger) |
| Select columns | All relevant columns |

## Step 3: Get Related Plan Data

1. Add **List rows** under Dataverse
| Field | Value |
|-------|-------|
| Table name | Plan Data (mpa_plandata) |
| Filter rows | mpa_plan_id eq 'planId' |

## Step 4: Compose Summary

Use **Compose** to build summary object with:
- Plan metadata
- Current status
- Completed sections
- Budget summary
- Timeline

## Step 5: Return Summary

Return composed summary as JSON string.

---

# FLOW 9: MPA - Update Plan Data (flow_03_UpdatePlanData)

## Overview
| Property | Value |
|----------|-------|
| Display Name | MPA - Update Plan Data |
| Type | Instant cloud flow |
| Solution | Media Planning Agent v5.5 |
| Trigger | PowerApps (V2) |

## Step 1: Create Flow with Inputs

| Input | Type | Description |
|-------|------|-------------|
| planId | Text | Media plan ID |
| sectionType | Text | Section type: ClientContext, Objectives, Budget, etc. |
| sectionData | Text | JSON with section data |
| stepNumber | Number | Current step number |

## Step 2: Check if Section Exists

1. Add **List rows** to check for existing section
| Filter | mpa_plan_id eq 'planId' and mpa_section_type eq 'sectionType' |

## Step 3: Condition - Create or Update

If section exists → Update row
If section doesn't exist → Add new row

## Step 4: Update Plan Status

1. Add **Update a row** for mpa_mediaplan
| Field | Value |
|-------|-------|
| Row ID | planId |
| mpa_current_step | stepNumber |
| mpa_updated_at | utcNow() |

## Step 5: Return Success

Return updated section ID and status.

---

# FLOW 10: MPA - Initialize Session (flow_60_InitializeSession)

## Overview
This is a more complex flow that integrates with EAP shared services.

| Property | Value |
|----------|-------|
| Display Name | MPA - Initialize Session |
| Type | Instant cloud flow |
| Solution | Media Planning Agent v5.5 |
| Trigger | PowerApps (V2) |

## Inputs

| Input | Type | Description |
|-------|------|-------------|
| sessionId | Text | EAP session ID |
| userId | Text | EAP user ID |
| clientId | Text | Client ID (optional) |
| pathway | Text | GUIDED, EXPRESS, STANDARD, or AUDIT |
| sessionType | Text | Planning, InFlight, PostMortem |
| planId | Text | Existing plan ID (optional for resume) |

## Key Actions

1. **Check for existing plan** - If planId provided, get plan from Dataverse
2. **Get user preferences** - HTTP call to EAP user service
3. **Build MPA context** - Compose action with all context
4. **Write audit log** - Create record in eap_audit
5. **Return MPA context** - JSON with session context

See flow_60_mpa_initialize_session.json for complete specification.

---

# SUMMARY: All Flows to Build

| # | Flow Name | Priority | Complexity |
|---|-----------|----------|------------|
| 1 | MPA - Log Error | HIGH | Low |
| 2 | MPA - Search Benchmarks | HIGH | Medium |
| 3 | MPA - Create Session | HIGH | Medium |
| 4 | MPA - Generate Document | HIGH | High |
| 5 | MPA - Calculate Budget Allocation | MEDIUM | Medium |
| 6 | MPA - Run Projections | MEDIUM | Medium |
| 7 | MPA - Validate Gate | MEDIUM | Medium |
| 8 | MPA - Get Plan Summary | MEDIUM | Low |
| 9 | MPA - Update Plan Data | MEDIUM | Medium |
| 10 | MPA - Initialize Session | HIGH | High |
| 11 | MPA - Process Media Brief | LOW | High |
| 12 | MPA - Calculate Gap | LOW | Medium |

---

# APPENDIX: Common Expressions

## Get Current Timestamp
```
utcNow()
```

## Format Date
```
formatDateTime(utcNow(), 'yyyy-MM-dd')
```

## Coalesce (Default Value)
```
coalesce(triggerBody()?['text'], 'default value')
```

## Check if Empty
```
empty(triggerBody()?['text'])
```

## Convert to JSON String
```
string(body('Compose'))
```

## Parse JSON String to Object
```
json(triggerBody()?['text'])
```

## Get Array Length
```
length(body('List_rows')?['value'])
```

## Concatenate Strings
```
concat('Hello ', triggerBody()?['text'], '!')
```

## Conditional Expression (If)
```
if(equals(variables('status'), 'success'), 'Yes', 'No')
```

---

# APPENDIX: Connection References

Create these in your solution before building flows:

| Logical Name | Display Name | Connector |
|--------------|--------------|-----------|
| mpa_conn_dataverse | MPA Dataverse Connection | Microsoft Dataverse |
| mpa_conn_sharepoint | MPA SharePoint Connection | SharePoint |
| mpa_conn_outlook | MPA Outlook Connection | Office 365 Outlook |
| mpa_conn_http | MPA HTTP Connection | HTTP (for Azure Functions) |

---

*Document Version: 1.0*
*Created: January 6, 2026*
*For: MPA v5.5 Power Automate Flow Deployment*
