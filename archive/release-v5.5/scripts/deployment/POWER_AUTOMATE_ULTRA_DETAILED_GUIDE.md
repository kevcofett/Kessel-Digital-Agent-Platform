# POWER AUTOMATE FLOW BUILD GUIDE - ULTRA DETAILED
# MPA v5.5 - Aragorn AI Environment

## BEFORE YOU START

### Environment Setup
- URL: https://make.powerautomate.com
- Environment: Aragorn AI (select from top-right dropdown)
- Solution: Media Planning Agent v5.5

### Azure Functions Configuration
```
Base URL: https://func-aragorn-mpa.azurewebsites.net
Function Key: lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ==
```

### SharePoint Configuration
```
Site URL: https://kesseldigitalcom.sharepoint.com/sites/KesselDigital
Document Library: Shared Documents
KB Library: MediaPlanningKB
```

---

# ═══════════════════════════════════════════════════════════════
# FLOW 1: MPA - Log Error
# Build this FIRST - other flows depend on it
# ═══════════════════════════════════════════════════════════════

## STEP 1: Navigate to Create Flow

1. Go to https://make.powerautomate.com
2. Click **Solutions** in left navigation
3. Click **Media Planning Agent v5.5** to open it
4. Click **+ New** button (top toolbar)
5. Click **Automation**
6. Click **Cloud flow**
7. Click **Instant**

## STEP 2: Name and Create

| Field | Exact Value |
|-------|-------------|
| Flow name | `MPA - Log Error` |
| Trigger | Select **PowerApps (V2)** |

Click **Create**

## STEP 3: Configure Trigger - Add Input Parameters

The flow opens with the trigger selected. You need to add 7 input parameters.

### Input 1: source
1. Click **+ Add an input** (inside the trigger box)
2. Click **Text**
3. Fill in:
   | Field | Value |
   |-------|-------|
   | Input name | `source` |
   | Description | `Source flow or function name that generated the error` |

### Input 2: errorCode
1. Click **+ Add an input**
2. Click **Text**
3. Fill in:
   | Field | Value |
   |-------|-------|
   | Input name | `errorCode` |
   | Description | `Error code identifier` |

### Input 3: errorMessage
1. Click **+ Add an input**
2. Click **Text**
3. Fill in:
   | Field | Value |
   |-------|-------|
   | Input name | `errorMessage` |
   | Description | `Human-readable error message` |

### Input 4: errorDetails
1. Click **+ Add an input**
2. Click **Text**
3. Fill in:
   | Field | Value |
   |-------|-------|
   | Input name | `errorDetails` |
   | Description | `JSON string with full error details` |

### Input 5: sessionId
1. Click **+ Add an input**
2. Click **Text**
3. Fill in:
   | Field | Value |
   |-------|-------|
   | Input name | `sessionId` |
   | Description | `Session ID if available` |

### Input 6: planId
1. Click **+ Add an input**
2. Click **Text**
3. Fill in:
   | Field | Value |
   |-------|-------|
   | Input name | `planId` |
   | Description | `Plan ID if available` |

### Input 7: severity
1. Click **+ Add an input**
2. Click **Text**
3. Fill in:
   | Field | Value |
   |-------|-------|
   | Input name | `severity` |
   | Description | `Error severity: Low, Medium, High, or Critical` |

## STEP 4: Add Initialize Variable Action

1. Click the **+** button below the trigger
2. Click **Add an action**
3. In search box, type: `Initialize variable`
4. Click **Initialize variable** (under Built-in > Variable)

### Configure the action:
| Field | How to Set | Value |
|-------|-----------|-------|
| Name | Type directly | `varSeverity` |
| Type | Select from dropdown | `String` |
| Value | Click in field, then click **Expression** tab | (see below) |

### Value Expression:
1. Click in the **Value** field
2. A popup appears - click the **Expression** tab
3. Type exactly: `coalesce(triggerBody()?['severity'], 'Medium')`
4. Click **OK**

The field should now show: `coalesce(triggerBody()?['severity'], 'Medium')`

## STEP 5: Add Dataverse - Add a new row

1. Click the **+** button below Initialize variable
2. Click **Add an action**
3. In search box, type: `Add a new row`
4. Click **Add a new row** (under Microsoft Dataverse)

### Configure the action:

| Field | How to Set | Value |
|-------|-----------|-------|
| Action name | Click action title to rename | `Create_Error_Log_Record` |
| Table name | Select from dropdown | `Audit Logs` (or `eap_audit` if visible) |

### If using eap_audit table, set these columns:

Click **Show all** to see all columns, then fill in:

| Column | How to Set | Value |
|--------|-----------|-------|
| Action Type | Type directly | `Error` |
| Description | Click field, click **Dynamic content** tab, select `errorMessage` | (dynamic content) |
| Entity Type | Type directly | `mpa_errorlog` |
| Entity ID | Click field, click **Dynamic content**, select `sessionId` | (dynamic content) |
| Agent Source | Type directly | `MPA_AGENT` |
| Created At | Click field, click **Expression** tab, type `utcNow()`, click OK | (expression) |

### If eap_audit doesn't exist, create mpa_errorlog table first (see Dataverse guide), then use these columns:

| Column | How to Set | Value |
|--------|-----------|-------|
| Source (mpa_source) | Dynamic content | `source` |
| Error Code (mpa_errorcode) | Dynamic content | `errorCode` |
| Error Message (mpa_errormessage) | Dynamic content | `errorMessage` |
| Error Details (mpa_errordetails) | Dynamic content | `errorDetails` |
| Session ID (mpa_sessionid) | Dynamic content | `sessionId` |
| Plan ID (mpa_planid) | Dynamic content | `planId` |
| Severity (mpa_severity) | Dynamic content | `varSeverity` (the variable) |
| Occurred At (mpa_occurredat) | Expression | `utcNow()` |

## STEP 6: Add Condition - Check Severity

1. Click the **+** button below the Dataverse action
2. Click **Add an action**
3. In search box, type: `Condition`
4. Click **Condition** (under Built-in > Control)

### Configure the condition:

1. Click action title to rename it to: `Check_If_High_Severity`

2. In the condition row:
   - Left field: Click, then **Dynamic content** tab, select `varSeverity`
   - Operator dropdown: Select `is equal to`
   - Right field: Type `Critical`

3. Click **+ Add** button (next to the condition row)
4. Click **Add row**
5. In the new row:
   - Left field: Click, then **Dynamic content** tab, select `varSeverity`
   - Operator dropdown: Select `is equal to`
   - Right field: Type `High`

6. Click the **And** dropdown between the two rows
7. Change it to **Or**

The condition should read: `varSeverity is equal to Critical OR varSeverity is equal to High`

## STEP 7: If Yes - Send Alert Email

Inside the **If yes** branch:

1. Click **Add an action**
2. In search box, type: `Send an email`
3. Click **Send an email (V2)** (under Office 365 Outlook)

### Configure the action:

| Field | How to Set | Value |
|-------|-----------|-------|
| Action name | Click title to rename | `Send_Alert_Email` |
| To | Type directly | `kevin.bauer@kesseldigital.com` |
| Subject | Expression (see below) | |
| Body | HTML (see below) | |

### Subject - Use Expression:
1. Click in **Subject** field
2. Click **Expression** tab
3. Type exactly:
```
concat('[MPA Alert] ', variables('varSeverity'), ' Error in ', triggerBody()?['source'])
```
4. Click **OK**

### Body - Paste HTML:
1. Click in **Body** field
2. Click the **</>** icon (Code View) in the toolbar if available, OR just paste:

```
<h2>Media Planning Agent Error Alert</h2>
<p><strong>Source:</strong> </p>
<p><strong>Severity:</strong> </p>
<p><strong>Error:</strong> </p>
<p><strong>Time:</strong> </p>
<hr>
<p><strong>Session ID:</strong> </p>
<p><strong>Plan ID:</strong> </p>
<hr>
<p><strong>Details:</strong></p>
<pre></pre>
```

3. Now insert dynamic content after each label:
   - After "Source:</strong> " - click, Dynamic content, select `source`
   - After "Severity:</strong> " - click, Dynamic content, select `varSeverity`
   - After "Error:</strong> " - click, Dynamic content, select `errorMessage`
   - After "Time:</strong> " - click, Expression, type `utcNow()`, click OK
   - After "Session ID:</strong> " - click, Dynamic content, select `sessionId`
   - After "Plan ID:</strong> " - click, Dynamic content, select `planId`
   - Between `<pre>` and `</pre>` - click, Dynamic content, select `errorDetails`

### Set Is HTML:
1. Click **Show all** at bottom of the action
2. Find **Is HTML**
3. Set to **Yes**

## STEP 8: If No - Leave Empty

The **If no** branch can be left empty (no action needed for low/medium severity).

## STEP 9: Add Response to PowerApps

1. Click **outside** the Condition (below it, not inside either branch)
2. Click the **+** button that appears
3. Click **Add an action**
4. In search box, type: `Respond to a PowerApp`
5. Click **Respond to a PowerApp or flow**

### Configure outputs:

#### Output 1:
1. Click **+ Add an output**
2. Click **Yes/No**
3. Fill in:
   | Field | Value |
   |-------|-------|
   | Enter title | `logged` |
   | Enter a value to respond | Click dropdown, select **Yes** |

#### Output 2:
1. Click **+ Add an output**
2. Click **Text**
3. Fill in:
   | Field | Value |
   |-------|-------|
   | Enter title | `errorLogId` |
   | Enter a value to respond | Click, Dynamic content, find the ID from Create_Error_Log_Record (may be called "Error Log" or the row ID) |

#### Output 3:
1. Click **+ Add an output**
2. Click **Yes/No**
3. Fill in:
   | Field | Value |
   |-------|-------|
   | Enter title | `alertSent` |
   | Enter a value to respond | Expression: `if(or(equals(variables('varSeverity'), 'Critical'), equals(variables('varSeverity'), 'High')), true, false)` |

## STEP 10: Save and Test

1. Click **Save** (top right)
2. Wait for "Your flow is ready"
3. Click **Test** (top right)
4. Select **Manually**
5. Click **Test**
6. Enter test values:
   | Field | Test Value |
   |-------|------------|
   | source | TestFlow |
   | errorCode | TEST001 |
   | errorMessage | This is a test error message |
   | errorDetails | {"test": true, "timestamp": "2026-01-06"} |
   | sessionId | test-session-123 |
   | planId | test-plan-456 |
   | severity | Low |
7. Click **Run flow**
8. Verify flow completes successfully (green checkmarks)

## STEP 11: Test High Severity

1. Click **Test** again
2. Run with severity = `Critical`
3. Verify email is sent

---

# ═══════════════════════════════════════════════════════════════
# FLOW 2: MPA - Search Benchmarks
# ═══════════════════════════════════════════════════════════════

## STEP 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Search Benchmarks`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## STEP 2: Add Trigger Inputs

### Input 1:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `vertical` |
| Description | `Industry vertical to filter benchmarks (e.g., Retail, Finance, Healthcare)` |

### Input 2:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `channel` |
| Description | `Media channel to filter benchmarks (e.g., Display, Video, Search)` |

### Input 3:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `metricType` |
| Description | `Metric type to filter (e.g., CPM, CTR, CVR, CPA, ROAS)` |

## STEP 3: Add Initialize Variable - varFilter

1. Click **+** → **Add an action**
2. Search: `Initialize variable`
3. Select **Initialize variable**

| Field | Value |
|-------|-------|
| Name | `varFilter` |
| Type | String |
| Value | `mpa_isactive eq true` |

## STEP 4: Add Condition - Check Vertical

1. Click **+** → **Add an action**
2. Search: `Condition`
3. Select **Condition**
4. Rename to: `Check_Vertical_Provided`

### Condition:
- Left: Expression: `triggerBody()?['vertical']`
- Operator: `is not equal to`
- Right: Expression: `null`

### If yes:
1. Add action: **Append to string variable**
| Field | Value |
|-------|-------|
| Name | Select `varFilter` |
| Value | Expression: `concat(' and mpa_vertical eq ''', triggerBody()?['vertical'], '''')` |

## STEP 5: Add Condition - Check Channel

1. Below the first Condition, click **+** → **Add an action**
2. Search: `Condition`
3. Rename to: `Check_Channel_Provided`

### Condition:
- Left: Expression: `triggerBody()?['channel']`
- Operator: `is not equal to`
- Right: Expression: `null`

### If yes:
1. Add action: **Append to string variable**
| Field | Value |
|-------|-------|
| Name | Select `varFilter` |
| Value | Expression: `concat(' and mpa_channel eq ''', triggerBody()?['channel'], '''')` |

## STEP 6: Add Condition - Check MetricType

1. Below, add another Condition
2. Rename to: `Check_MetricType_Provided`

### Condition:
- Left: Expression: `triggerBody()?['metricType']`
- Operator: `is not equal to`
- Right: Expression: `null`

### If yes:
1. Add action: **Append to string variable**
| Field | Value |
|-------|-------|
| Name | Select `varFilter` |
| Value | Expression: `concat(' and mpa_metrictype eq ''', triggerBody()?['metricType'], '''')` |

## STEP 7: Add Dataverse - List rows

1. Click **+** → **Add an action**
2. Search: `List rows`
3. Select **List rows** (Microsoft Dataverse)
4. Rename to: `List_Benchmarks`

| Field | How to Set | Value |
|-------|-----------|-------|
| Table name | Dropdown | `Benchmarks` (mpa_benchmark) |
| Select columns | Type | `mpa_benchmarkid,mpa_name,mpa_vertical,mpa_channel,mpa_metrictype,mpa_benchmarklow,mpa_benchmarkmedian,mpa_benchmarkhigh,mpa_benchmarkbestinclass,mpa_datasource,mpa_dataperiod,mpa_confidence` |
| Filter rows | Dynamic content | Select `varFilter` |
| Row count | Type | `100` |

## STEP 8: Add Select - Transform Results

1. Click **+** → **Add an action**
2. Search: `Select`
3. Select **Select** (Data Operations)
4. Rename to: `Transform_Benchmarks`

| Field | Value |
|-------|-------|
| From | Dynamic content: `value` from List_Benchmarks |
| Map | Switch to input entire array (click the T icon on right) |

### Map - Click "Switch to input entire array" then paste:
```
{
  "id": @{item()?['mpa_benchmarkid']},
  "name": @{item()?['mpa_name']},
  "vertical": @{item()?['mpa_vertical']},
  "channel": @{item()?['mpa_channel']},
  "metricType": @{item()?['mpa_metrictype']},
  "low": @{item()?['mpa_benchmarklow']},
  "median": @{item()?['mpa_benchmarkmedian']},
  "high": @{item()?['mpa_benchmarkhigh']},
  "bestInClass": @{item()?['mpa_benchmarkbestinclass']},
  "source": @{item()?['mpa_datasource']},
  "period": @{item()?['mpa_dataperiod']},
  "confidence": @{item()?['mpa_confidence']}
}
```

**ALTERNATIVE - Use Key/Value mode:**

Click the **T** icon to switch to Key/Value mode. Add these mappings:

| Key | Value (Dynamic content from current item) |
|-----|-------------------------------------------|
| id | mpa_benchmarkid |
| name | mpa_name |
| vertical | mpa_vertical |
| channel | mpa_channel |
| metricType | mpa_metrictype |
| low | mpa_benchmarklow |
| median | mpa_benchmarkmedian |
| high | mpa_benchmarkhigh |
| bestInClass | mpa_benchmarkbestinclass |
| source | mpa_datasource |
| period | mpa_dataperiod |
| confidence | mpa_confidence |

## STEP 9: Add Compose - Build Response

1. Click **+** → **Add an action**
2. Search: `Compose`
3. Select **Compose** (Data Operations)
4. Rename to: `Build_Response`

### Inputs - Paste this JSON then insert dynamic content:
```json
{
  "status": "success",
  "totalResults": ,
  "benchmarks": ,
  "filtersApplied": {
    "vertical": "",
    "channel": "",
    "metricType": ""
  }
}
```

Then fill in:
- After `"totalResults": ` → Expression: `length(body('Transform_Benchmarks'))`
- After `"benchmarks": ` → Dynamic content: `Output` from Transform_Benchmarks
- After `"vertical": "` → Dynamic content: `vertical` from trigger
- After `"channel": "` → Dynamic content: `channel` from trigger
- After `"metricType": "` → Dynamic content: `metricType` from trigger

## STEP 10: Add Response to PowerApps

1. Click **+** → **Add an action**
2. Search: `Respond to a PowerApp`
3. Select **Respond to a PowerApp or flow**

### Add outputs:

#### Output 1:
| Field | Value |
|-------|-------|
| Type | Text |
| Title | `benchmarksJson` |
| Value | Expression: `string(outputs('Build_Response'))` |

#### Output 2:
| Field | Value |
|-------|-------|
| Type | Number |
| Title | `totalResults` |
| Value | Expression: `length(body('Transform_Benchmarks'))` |

#### Output 3:
| Field | Value |
|-------|-------|
| Type | Text |
| Title | `status` |
| Value | Type: `success` |

## STEP 11: Save and Test

1. Save the flow
2. Test with:
   - vertical: `Retail`
   - channel: `Display`
   - metricType: `CPM`
3. Verify benchmarks are returned

---

# ═══════════════════════════════════════════════════════════════
# FLOW 3: MPA - Create Session
# ═══════════════════════════════════════════════════════════════

## STEP 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Create Session`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## STEP 2: Add Trigger Inputs

### Input 1:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `userId` |
| Description | `User unique identifier from Entra ID` |

### Input 2:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `clientId` |
| Description | `Optional client identifier` |

### Input 3:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `vertical` |
| Description | `Initial industry vertical` |

### Input 4:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `sessionType` |
| Description | `Session type: Planning, InFlight, PostMortem, General` |

## STEP 3: Add Compose - Build Request Body

1. Click **+** → **Add an action**
2. Search: `Compose`
3. Select **Compose**
4. Rename to: `Build_Request_Body`

### Inputs - Paste then insert dynamic content:
```json
{
  "action": "create",
  "user_id": "",
  "client_id": "",
  "context": {
    "vertical": "",
    "session_type": ""
  }
}
```

Fill in:
- After `"user_id": "` → Dynamic content: `userId`
- After `"client_id": "` → Dynamic content: `clientId`
- After `"vertical": "` → Dynamic content: `vertical`
- After `"session_type": "` → Dynamic content: `sessionType`

## STEP 4: Add HTTP - Call Azure Function

1. Click **+** → **Add an action**
2. Search: `HTTP`
3. Select **HTTP** (NOT HTTP Webhook)
4. Rename to: `Call_Session_API`

| Field | Value |
|-------|-------|
| Method | `POST` |
| URI | `https://func-aragorn-mpa.azurewebsites.net/api/session` |
| Headers | (see below) |
| Body | Dynamic content: `Outputs` from Build_Request_Body |

### Headers - Click "Add new parameter", check "Headers":

| Key | Value |
|-----|-------|
| Content-Type | `application/json` |
| x-functions-key | `lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ==` |

## STEP 5: Add Parse JSON

1. Click **+** → **Add an action**
2. Search: `Parse JSON`
3. Select **Parse JSON** (Data Operations)
4. Rename to: `Parse_Session_Response`

| Field | Value |
|-------|-------|
| Content | Dynamic content: `Body` from Call_Session_API |
| Schema | Paste below |

### Schema:
```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string"
    },
    "session": {
      "type": "object",
      "properties": {
        "session_id": {
          "type": "string"
        },
        "user_id": {
          "type": "string"
        },
        "status": {
          "type": "string"
        },
        "created_at": {
          "type": "string"
        }
      }
    },
    "error": {
      "type": "string"
    }
  }
}
```

## STEP 6: Add Condition - Check Success

1. Click **+** → **Add an action**
2. Search: `Condition`
3. Select **Condition**
4. Rename to: `Check_API_Success`

### Condition:
- Left: Dynamic content: `status` from Parse_Session_Response
- Operator: `is equal to`
- Right: Type: `success`

## STEP 7: If Yes - Return Success

In **If yes** branch:

1. Add action: **Respond to a PowerApp or flow**

### Outputs:

#### Output 1:
| Field | Value |
|-------|-------|
| Type | Text |
| Title | `sessionId` |
| Value | Dynamic content: `session_id` (from Parse_Session_Response > session) |

#### Output 2:
| Field | Value |
|-------|-------|
| Type | Text |
| Title | `status` |
| Value | Type: `active` |

#### Output 3:
| Field | Value |
|-------|-------|
| Type | Text |
| Title | `message` |
| Value | Type: `Session created successfully` |

## STEP 8: If No - Return Error

In **If no** branch:

1. Add action: **Respond to a PowerApp or flow**

### Outputs:

#### Output 1:
| Field | Value |
|-------|-------|
| Type | Text |
| Title | `sessionId` |
| Value | Leave empty |

#### Output 2:
| Field | Value |
|-------|-------|
| Type | Text |
| Title | `status` |
| Value | Type: `error` |

#### Output 3:
| Field | Value |
|-------|-------|
| Type | Text |
| Title | `message` |
| Value | Dynamic content: `error` from Parse_Session_Response |

## STEP 9: Save and Test

Test with sample userId.

---


# ═══════════════════════════════════════════════════════════════
# FLOW 4: MPA - Generate Document
# ═══════════════════════════════════════════════════════════════

## STEP 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Generate Document`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## STEP 2: Add Trigger Inputs

### Input 1:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `planId` |
| Description | `Media plan ID from Dataverse` |

### Input 2:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `planDataJson` |
| Description | `JSON string with complete plan data including metadata, budget, channels, audiences` |

## STEP 3: Add Parse JSON - Plan Data

1. Click **+** → **Add an action**
2. Search: `Parse JSON`
3. Select **Parse JSON**
4. Rename to: `Parse_Plan_Data`

| Field | Value |
|-------|-------|
| Content | Dynamic content: `planDataJson` |
| Schema | Paste below |

### Schema:
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
    "executive_summary": {"type": "string"},
    "objectives": {"type": "object"},
    "budget": {
      "type": "object",
      "properties": {
        "total": {"type": "number"},
        "tiers": {"type": "array"}
      }
    },
    "channels": {"type": "array"},
    "audiences": {"type": "array"},
    "timeline": {"type": "object"},
    "measurement": {"type": "object"}
  }
}
```

## STEP 4: Add HTTP - Call Azure Function

1. Click **+** → **Add an action**
2. Search: `HTTP`
3. Select **HTTP**
4. Rename to: `Call_Document_Generator`

| Field | Value |
|-------|-------|
| Method | `POST` |
| URI | `https://func-aragorn-mpa.azurewebsites.net/api/generate-media-plan-document` |

### Headers:
| Key | Value |
|-----|-------|
| Content-Type | `application/json` |
| x-functions-key | `lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ==` |
| Accept | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |

### Body:
Dynamic content: `planDataJson` (pass the raw JSON string)

## STEP 5: Add Condition - Check HTTP Status

1. Click **+** → **Add an action**
2. Search: `Condition`
3. Select **Condition**
4. Rename to: `Check_Document_Generated`

### Condition:
- Left: Expression: `outputs('Call_Document_Generator')['statusCode']`
- Operator: `is equal to`
- Right: Type: `200`

## STEP 6: If Yes - Save to SharePoint

In **If yes** branch:

### Action 1: Compose File Name
1. Add action: **Compose**
2. Rename to: `Compose_File_Name`
3. Inputs - Expression:
```
concat(body('Parse_Plan_Data')?['metadata']?['planName'], '_', formatDateTime(utcNow(), 'yyyyMMdd_HHmmss'), '.docx')
```

### Action 2: Create File in SharePoint
1. Add action: Search `Create file`, select **Create file** (SharePoint)
2. Rename to: `Save_Document_To_SharePoint`

| Field | Value |
|-------|-------|
| Site Address | Select: `https://kesseldigitalcom.sharepoint.com/sites/KesselDigital` |
| Folder Path | Type: `/Shared Documents/Media Plans` |
| File Name | Dynamic content: `Outputs` from Compose_File_Name |
| File Content | Dynamic content: `Body` from Call_Document_Generator |

### Action 3: Create Sharing Link
1. Add action: Search `Create sharing link`, select **Create sharing link for a file or folder** (SharePoint)
2. Rename to: `Create_Sharing_Link`

| Field | Value |
|-------|-------|
| Site Address | `https://kesseldigitalcom.sharepoint.com/sites/KesselDigital` |
| Library Name | `Shared Documents` |
| Item Id | Dynamic content: `ItemId` from Save_Document_To_SharePoint |
| Link Type | `View` |
| Link Scope | `People in your organization` |

### Action 4: Write Audit Record
1. Add action: **Add a new row** (Dataverse)
2. Rename to: `Write_Audit_Record`

| Field | Value |
|-------|-------|
| Table name | `eap_audit` (or Audit Logs) |
| Action Type | Type: `DocumentGenerated` |
| Entity Type | Type: `mpa_mediaplan` |
| Entity ID | Dynamic content: `planId` |
| Description | Expression: `concat('Media plan document generated: ', body('Parse_Plan_Data')?['metadata']?['planName'], '.docx')` |
| Agent Source | Type: `MPA_AGENT` |
| Created At | Expression: `utcNow()` |

### Action 5: Return Success Response
1. Add action: **Respond to a PowerApp or flow**

#### Outputs:

| Type | Title | Value |
|------|-------|-------|
| Text | `status` | Type: `success` |
| Text | `documentUrl` | Dynamic content: Select `WebUrl` from Create_Sharing_Link, OR Expression: `outputs('Create_Sharing_Link')?['body']?['link']?['webUrl']` |
| Text | `documentName` | Dynamic content: `Outputs` from Compose_File_Name |
| Text | `generatedAt` | Expression: `utcNow()` |

## STEP 7: If No - Return Error

In **If no** branch:

1. Add action: **Respond to a PowerApp or flow**

#### Outputs:

| Type | Title | Value |
|------|-------|-------|
| Text | `status` | Type: `error` |
| Text | `documentUrl` | Leave empty |
| Text | `documentName` | Leave empty |
| Text | `generatedAt` | Leave empty |
| Text | `errorMessage` | Type: `Failed to generate document` |

## STEP 8: Save and Test

Save and test with sample plan data JSON.

---

# ═══════════════════════════════════════════════════════════════
# FLOW 5: MPA - Calculate Budget Allocation
# ═══════════════════════════════════════════════════════════════

## STEP 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Calculate Budget Allocation`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## STEP 2: Add Trigger Inputs

### Input 1:
| Field | Value |
|-------|-------|
| Type | Number |
| Input name | `totalBudget` |
| Description | `Total campaign budget in dollars` |

### Input 2:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `channelsJson` |
| Description | `JSON array of selected channels with weights` |

### Input 3:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `objectivesJson` |
| Description | `JSON object with campaign objectives and priorities` |

### Input 4:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `vertical` |
| Description | `Industry vertical for benchmark-based allocation` |

## STEP 3: Add Compose - Build Request

1. Click **+** → **Add an action**
2. Search: `Compose`
3. Select **Compose**
4. Rename to: `Build_Allocation_Request`

### Inputs:
```json
{
  "total_budget": ,
  "channels": ,
  "objectives": ,
  "vertical": ""
}
```

Fill in:
- After `"total_budget": ` → Dynamic content: `totalBudget`
- After `"channels": ` → Expression: `json(triggerBody()?['channelsJson'])`
- After `"objectives": ` → Expression: `json(triggerBody()?['objectivesJson'])`
- After `"vertical": "` → Dynamic content: `vertical`

## STEP 4: Add HTTP - Call Azure Function

1. Click **+** → **Add an action**
2. Search: `HTTP`
3. Select **HTTP**
4. Rename to: `Call_Allocation_API`

| Field | Value |
|-------|-------|
| Method | `POST` |
| URI | `https://func-aragorn-mpa.azurewebsites.net/api/allocation` |

### Headers:
| Key | Value |
|-----|-------|
| Content-Type | `application/json` |
| x-functions-key | `lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ==` |

### Body:
Dynamic content: `Outputs` from Build_Allocation_Request

## STEP 5: Add Parse JSON - Response

1. Click **+** → **Add an action**
2. Search: `Parse JSON`
3. Select **Parse JSON**
4. Rename to: `Parse_Allocation_Response`

| Field | Value |
|-------|-------|
| Content | Dynamic content: `Body` from Call_Allocation_API |
| Schema | Paste below |

### Schema:
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
    "recommendations": {"type": "array"},
    "error": {"type": "string"}
  }
}
```

## STEP 6: Add Condition - Check Success

1. Click **+** → **Add an action**
2. Search: `Condition`
3. Select **Condition**
4. Rename to: `Check_Allocation_Success`

### Condition:
- Left: Dynamic content: `status` from Parse_Allocation_Response
- Operator: `is equal to`
- Right: Type: `success`

## STEP 7: If Yes - Return Allocation

In **If yes** branch:

1. Add action: **Respond to a PowerApp or flow**

#### Outputs:

| Type | Title | Value |
|------|-------|-------|
| Text | `status` | Type: `success` |
| Text | `allocationJson` | Expression: `string(body('Parse_Allocation_Response')?['allocation'])` |
| Text | `recommendationsJson` | Expression: `string(body('Parse_Allocation_Response')?['recommendations'])` |
| Number | `totalBudget` | Dynamic content: `total_budget` from allocation |

## STEP 8: If No - Return Error

In **If no** branch:

1. Add action: **Respond to a PowerApp or flow**

#### Outputs:

| Type | Title | Value |
|------|-------|-------|
| Text | `status` | Type: `error` |
| Text | `allocationJson` | Type: `{}` |
| Text | `recommendationsJson` | Type: `[]` |
| Number | `totalBudget` | Type: `0` |
| Text | `errorMessage` | Dynamic content: `error` from Parse_Allocation_Response |

## STEP 9: Save and Test

---

# ═══════════════════════════════════════════════════════════════
# FLOW 6: MPA - Validate Gate
# ═══════════════════════════════════════════════════════════════

## STEP 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Validate Gate`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## STEP 2: Add Trigger Inputs

### Input 1:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `planId` |
| Description | `Media plan ID to validate` |

### Input 2:
| Field | Value |
|-------|-------|
| Type | Number |
| Input name | `gateNumber` |
| Description | `Gate number to validate (1-4)` |

### Input 3:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `planDataJson` |
| Description | `Current plan data as JSON string` |

## STEP 3: Add Compose - Build Request

1. Click **+** → **Add an action**
2. Search: `Compose`
3. Select **Compose**
4. Rename to: `Build_Validation_Request`

### Inputs:
```json
{
  "plan_id": "",
  "gate_number": ,
  "plan_data": 
}
```

Fill in:
- After `"plan_id": "` → Dynamic content: `planId`
- After `"gate_number": ` → Dynamic content: `gateNumber`
- After `"plan_data": ` → Expression: `json(triggerBody()?['planDataJson'])`

## STEP 4: Add HTTP - Call Azure Function

1. Click **+** → **Add an action**
2. Search: `HTTP`
3. Select **HTTP**
4. Rename to: `Call_Validate_Gate_API`

| Field | Value |
|-------|-------|
| Method | `POST` |
| URI | `https://func-aragorn-mpa.azurewebsites.net/api/validate-gate` |

### Headers:
| Key | Value |
|-----|-------|
| Content-Type | `application/json` |
| x-functions-key | `lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ==` |

### Body:
Dynamic content: `Outputs` from Build_Validation_Request

## STEP 5: Add Parse JSON - Response

1. Click **+** → **Add an action**
2. Search: `Parse JSON`
3. Select **Parse JSON**
4. Rename to: `Parse_Validation_Response`

| Field | Value |
|-------|-------|
| Content | Dynamic content: `Body` from Call_Validate_Gate_API |
| Schema | Paste below |

### Schema:
```json
{
  "type": "object",
  "properties": {
    "status": {"type": "string"},
    "gate_status": {"type": "string"},
    "gate_number": {"type": "integer"},
    "validation_results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "check": {"type": "string"},
          "status": {"type": "string"},
          "message": {"type": "string"}
        }
      }
    },
    "missing_fields": {"type": "array"},
    "recommendations": {"type": "array"}
  }
}
```

## STEP 6: Add Response

1. Click **+** → **Add an action**
2. Search: `Respond to a PowerApp`
3. Select **Respond to a PowerApp or flow**

#### Outputs:

| Type | Title | Value |
|------|-------|-------|
| Text | `gateStatus` | Dynamic content: `gate_status` |
| Number | `gateNumber` | Dynamic content: `gate_number` |
| Text | `validationResultsJson` | Expression: `string(body('Parse_Validation_Response')?['validation_results'])` |
| Text | `missingFieldsJson` | Expression: `string(body('Parse_Validation_Response')?['missing_fields'])` |
| Text | `recommendationsJson` | Expression: `string(body('Parse_Validation_Response')?['recommendations'])` |

## STEP 7: Save and Test

---

# ═══════════════════════════════════════════════════════════════
# FLOW 7: MPA - Run Projections
# ═══════════════════════════════════════════════════════════════

## STEP 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Run Projections`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## STEP 2: Add Trigger Inputs

### Input 1:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `allocationJson` |
| Description | `Budget allocation by channel as JSON` |

### Input 2:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `vertical` |
| Description | `Industry vertical for benchmark lookup` |

### Input 3:
| Field | Value |
|-------|-------|
| Type | Number |
| Input name | `campaignDays` |
| Description | `Campaign duration in days` |

### Input 4:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `objectivesJson` |
| Description | `Campaign objectives as JSON` |

## STEP 3: Add Compose - Build Request

1. Click **+** → **Add an action**
2. Search: `Compose`
3. Select **Compose**
4. Rename to: `Build_Projections_Request`

### Inputs:
```json
{
  "allocation": ,
  "vertical": "",
  "campaign_days": ,
  "objectives": 
}
```

Fill in:
- After `"allocation": ` → Expression: `json(triggerBody()?['allocationJson'])`
- After `"vertical": "` → Dynamic content: `vertical`
- After `"campaign_days": ` → Dynamic content: `campaignDays`
- After `"objectives": ` → Expression: `json(triggerBody()?['objectivesJson'])`

## STEP 4: Add HTTP - Call Azure Function

1. Click **+** → **Add an action**
2. Search: `HTTP`
3. Select **HTTP**
4. Rename to: `Call_Projections_API`

| Field | Value |
|-------|-------|
| Method | `POST` |
| URI | `https://func-aragorn-mpa.azurewebsites.net/api/projections` |

### Headers:
| Key | Value |
|-----|-------|
| Content-Type | `application/json` |
| x-functions-key | `lCMpDrdQQV47TWq3pR9OXFen_uFlaOwdSw7_7uk6CHO2AzFuoaY6GQ==` |

### Body:
Dynamic content: `Outputs` from Build_Projections_Request

## STEP 5: Add Parse JSON and Response

(Same pattern as previous flows)

#### Outputs:

| Type | Title | Value |
|------|-------|-------|
| Text | `status` | From response |
| Text | `projectionsJson` | Stringified projections object |
| Number | `totalImpressions` | From response |
| Number | `estimatedReach` | From response |
| Number | `averageFrequency` | From response |

## STEP 6: Save and Test

---

# ═══════════════════════════════════════════════════════════════
# FLOW 8: MPA - Update Plan Data
# ═══════════════════════════════════════════════════════════════

## STEP 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Update Plan Data`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## STEP 2: Add Trigger Inputs

### Input 1:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `planId` |
| Description | `Media plan ID` |

### Input 2:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `sectionType` |
| Description | `Section type: ClientContext, Objectives, Budget, Timeline, Audience, Channels, Measurement` |

### Input 3:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `sectionDataJson` |
| Description | `Section data as JSON string` |

### Input 4:
| Field | Value |
|-------|-------|
| Type | Number |
| Input name | `stepNumber` |
| Description | `Current step number (1-10)` |

## STEP 3: Add List Rows - Check Existing Section

1. Click **+** → **Add an action**
2. Search: `List rows`
3. Select **List rows** (Dataverse)
4. Rename to: `Check_Existing_Section`

| Field | Value |
|-------|-------|
| Table name | `Plan Data` (mpa_plandata) |
| Filter rows | Expression: `concat('_mpa_mediaplan_value eq ', triggerBody()?['planId'], ' and mpa_sectiontype eq ''', triggerBody()?['sectionType'], '''')` |
| Row count | `1` |

## STEP 4: Add Condition - Section Exists

1. Click **+** → **Add an action**
2. Search: `Condition`
3. Select **Condition**
4. Rename to: `Check_Section_Exists`

### Condition:
- Left: Expression: `length(body('Check_Existing_Section')?['value'])`
- Operator: `is greater than`
- Right: Type: `0`

## STEP 5: If Yes - Update Existing Row

In **If yes** branch:

1. Add action: **Update a row** (Dataverse)
2. Rename to: `Update_Section_Data`

| Field | Value |
|-------|-------|
| Table name | `Plan Data` (mpa_plandata) |
| Row ID | Expression: `first(body('Check_Existing_Section')?['value'])?['mpa_plandataid']` |
| Section Data | Dynamic content: `sectionDataJson` |
| Section Status | Type: `Complete` |
| Updated At | Expression: `utcNow()` |

## STEP 6: If No - Create New Row

In **If no** branch:

1. Add action: **Add a new row** (Dataverse)
2. Rename to: `Create_Section_Data`

| Field | Value |
|-------|-------|
| Table name | `Plan Data` (mpa_plandata) |
| Media Plan | Dynamic content: `planId` (as lookup) |
| Section Type | Dynamic content: `sectionType` |
| Section Label | Dynamic content: `sectionType` |
| Step Number | Dynamic content: `stepNumber` |
| Section Data | Dynamic content: `sectionDataJson` |
| Section Status | Type: `Complete` |
| Created At | Expression: `utcNow()` |

## STEP 7: Update Plan Record

After the Condition (outside both branches):

1. Add action: **Update a row** (Dataverse)
2. Rename to: `Update_Plan_Status`

| Field | Value |
|-------|-------|
| Table name | `Media Plans` (mpa_mediaplan) |
| Row ID | Dynamic content: `planId` |
| Current Step | Dynamic content: `stepNumber` |
| Updated At | Expression: `utcNow()` |

## STEP 8: Add Response

1. Add action: **Respond to a PowerApp or flow**

#### Outputs:

| Type | Title | Value |
|------|-------|-------|
| Text | `status` | Type: `success` |
| Text | `sectionId` | Expression: `coalesce(outputs('Update_Section_Data')?['body/mpa_plandataid'], outputs('Create_Section_Data')?['body/mpa_plandataid'])` |
| Number | `currentStep` | Dynamic content: `stepNumber` |

## STEP 9: Save and Test

---

# ═══════════════════════════════════════════════════════════════
# FLOW 9: MPA - Get Plan Summary
# ═══════════════════════════════════════════════════════════════

## STEP 1: Create the Flow

1. In solution, click **+ New** → **Automation** → **Cloud flow** → **Instant**
2. Flow name: `MPA - Get Plan Summary`
3. Trigger: **PowerApps (V2)**
4. Click **Create**

## STEP 2: Add Trigger Input

### Input 1:
| Field | Value |
|-------|-------|
| Type | Text |
| Input name | `planId` |
| Description | `Media plan ID to retrieve` |

## STEP 3: Add Get Row - Get Plan

1. Click **+** → **Add an action**
2. Search: `Get a row by ID`
3. Select **Get a row by ID** (Dataverse)
4. Rename to: `Get_Plan`

| Field | Value |
|-------|-------|
| Table name | `Media Plans` (mpa_mediaplan) |
| Row ID | Dynamic content: `planId` |
| Select columns | `mpa_mediaplanid,mpa_name,mpa_clientid,mpa_status,mpa_lifecyclemode,mpa_pathway,mpa_currentstep,mpa_totalbudget,mpa_startdate,mpa_enddate,mpa_primaryobjective,createdon,modifiedon` |

## STEP 4: Add List Rows - Get Plan Sections

1. Click **+** → **Add an action**
2. Search: `List rows`
3. Select **List rows** (Dataverse)
4. Rename to: `Get_Plan_Sections`

| Field | Value |
|-------|-------|
| Table name | `Plan Data` (mpa_plandata) |
| Filter rows | Expression: `concat('_mpa_mediaplan_value eq ', triggerBody()?['planId'])` |
| Select columns | `mpa_sectiontype,mpa_sectionlabel,mpa_sectionstatus,mpa_stepnumber` |
| Order by | `mpa_stepnumber asc` |

## STEP 5: Add Select - Format Sections

1. Click **+** → **Add an action**
2. Search: `Select`
3. Select **Select** (Data Operations)
4. Rename to: `Format_Sections`

| Field | Value |
|-------|-------|
| From | Dynamic content: `value` from Get_Plan_Sections |

### Map (Key/Value mode):

| Key | Value |
|-----|-------|
| sectionType | mpa_sectiontype |
| label | mpa_sectionlabel |
| status | mpa_sectionstatus |
| stepNumber | mpa_stepnumber |

## STEP 6: Add Compose - Build Summary

1. Click **+** → **Add an action**
2. Search: `Compose`
3. Select **Compose**
4. Rename to: `Build_Summary`

### Inputs:
```json
{
  "planId": "",
  "planName": "",
  "clientId": "",
  "status": "",
  "lifecycleMode": "",
  "pathway": "",
  "currentStep": ,
  "totalBudget": ,
  "startDate": "",
  "endDate": "",
  "primaryObjective": "",
  "sections": ,
  "sectionsComplete": ,
  "totalSections": 10,
  "createdOn": "",
  "modifiedOn": ""
}
```

Fill in dynamic content from Get_Plan and Format_Sections outputs.

## STEP 7: Add Response

1. Add action: **Respond to a PowerApp or flow**

#### Outputs:

| Type | Title | Value |
|------|-------|-------|
| Text | `summaryJson` | Expression: `string(outputs('Build_Summary'))` |
| Text | `status` | Dynamic content from Get_Plan |
| Number | `currentStep` | Dynamic content from Get_Plan |
| Number | `sectionsComplete` | Expression: `length(body('Format_Sections'))` |

## STEP 8: Save and Test

---

# ═══════════════════════════════════════════════════════════════
# QUICK REFERENCE: All Flow Trigger Inputs
# ═══════════════════════════════════════════════════════════════

## Flow 1: MPA - Log Error
| Input | Type | Required |
|-------|------|----------|
| source | Text | Yes |
| errorCode | Text | No |
| errorMessage | Text | Yes |
| errorDetails | Text | No |
| sessionId | Text | No |
| planId | Text | No |
| severity | Text | No (default: Medium) |

## Flow 2: MPA - Search Benchmarks
| Input | Type | Required |
|-------|------|----------|
| vertical | Text | No |
| channel | Text | No |
| metricType | Text | No |

## Flow 3: MPA - Create Session
| Input | Type | Required |
|-------|------|----------|
| userId | Text | Yes |
| clientId | Text | No |
| vertical | Text | No |
| sessionType | Text | No |

## Flow 4: MPA - Generate Document
| Input | Type | Required |
|-------|------|----------|
| planId | Text | Yes |
| planDataJson | Text | Yes |

## Flow 5: MPA - Calculate Budget Allocation
| Input | Type | Required |
|-------|------|----------|
| totalBudget | Number | Yes |
| channelsJson | Text | Yes |
| objectivesJson | Text | Yes |
| vertical | Text | No |

## Flow 6: MPA - Validate Gate
| Input | Type | Required |
|-------|------|----------|
| planId | Text | Yes |
| gateNumber | Number | Yes |
| planDataJson | Text | Yes |

## Flow 7: MPA - Run Projections
| Input | Type | Required |
|-------|------|----------|
| allocationJson | Text | Yes |
| vertical | Text | No |
| campaignDays | Number | Yes |
| objectivesJson | Text | No |

## Flow 8: MPA - Update Plan Data
| Input | Type | Required |
|-------|------|----------|
| planId | Text | Yes |
| sectionType | Text | Yes |
| sectionDataJson | Text | Yes |
| stepNumber | Number | Yes |

## Flow 9: MPA - Get Plan Summary
| Input | Type | Required |
|-------|------|----------|
| planId | Text | Yes |

---

*Document Version: 1.0*
*Created: January 6, 2026*
