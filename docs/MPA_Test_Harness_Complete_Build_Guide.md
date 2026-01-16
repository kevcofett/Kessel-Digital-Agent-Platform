# MPA Test Harness - Complete Build Guide

THIS DOCUMENT PROVIDES EXACT FIELD VALUES FOR EVERY STEP.
FOLLOW IN ORDER. DO NOT SKIP STEPS.

================================================================================
PART 1: DATAVERSE TABLES
================================================================================

Open your browser and go to: https://make.powerapps.com

In the top right, confirm you are in the correct environment (same as MPA Copilot).
If not, click the environment name and switch.

--------------------------------------------------------------------------------
TABLE 1: mpa_testcase
--------------------------------------------------------------------------------

STEP 1.1: Create the table
- Left sidebar: Click "Tables"
- Top toolbar: Click "New table" dropdown arrow
- Select: "New table (advanced properties)"

STEP 1.2: Fill in table properties
- Display name: MPA Test Case
- Plural name: MPA Test Cases  
- Schema name: This will auto-populate. Change the suffix to: mpa_testcase
  (It may show as cr123_mpa_testcase where cr123 is your publisher prefix - that's fine)
- Primary column display name: mpa_name
- Primary column schema name: mpa_name
- Click "Save"

STEP 1.3: Add column mpa_testid
- Click "+ New column" button
- Display name: mpa_testid
- Data type: Single line of text
- Format: Text
- Required: Business required
- Maximum character count: 20
- Click "Save"

STEP 1.4: Add column mpa_prompt
- Click "+ New column" button
- Display name: mpa_prompt
- Data type: Multiple lines of text
- Format: Text
- Required: Business required
- Maximum character count: 4000
- Click "Save"

STEP 1.5: Add column mpa_category
- Click "+ New column" button
- Display name: mpa_category
- Data type: Single line of text
- Format: Text
- Required: Optional
- Maximum character count: 100
- Click "Save"

STEP 1.6: Add column mpa_priority
- Click "+ New column" button
- Display name: mpa_priority
- Data type: Choice
- Sync with global choice: No (create new)
- Click "+ New choice" and add these items:
  - P1
  - P2
  - P3
- Default choice: P2
- Required: Optional
- Click "Save"

STEP 1.7: Add column mpa_status
- Click "+ New column" button
- Display name: mpa_status
- Data type: Choice
- Sync with global choice: No (create new)
- Click "+ New choice" and add these items:
  - Pending
  - Running
  - Complete
  - Failed
- Default choice: Pending
- Required: Business required
- Click "Save"

STEP 1.8: Add column mpa_runid
- Click "+ New column" button
- Display name: mpa_runid
- Data type: Single line of text
- Format: Text
- Required: Business required
- Maximum character count: 100
- Click "Save"

STEP 1.9: Add column mpa_error
- Click "+ New column" button
- Display name: mpa_error
- Data type: Multiple lines of text
- Format: Text
- Required: Optional
- Maximum character count: 4000
- Click "Save"

TABLE 1 COMPLETE. You should have 8 columns total (including the primary mpa_name).

--------------------------------------------------------------------------------
TABLE 2: mpa_testresult
--------------------------------------------------------------------------------

STEP 2.1: Create the table
- Left sidebar: Click "Tables"
- Top toolbar: Click "New table" dropdown arrow
- Select: "New table (advanced properties)"

STEP 2.2: Fill in table properties
- Display name: MPA Test Result
- Plural name: MPA Test Results
- Schema name: Change suffix to: mpa_testresult
- Primary column display name: mpa_resultname
- Primary column schema name: mpa_resultname
- Click "Save"

STEP 2.3: Add column mpa_testcase (Lookup)
- Click "+ New column" button
- Display name: mpa_testcase
- Data type: Lookup
- Related table: MPA Test Case
- Required: Business required
- Click "Save"

STEP 2.4: Add column mpa_runid
- Click "+ New column" button
- Display name: mpa_runid
- Data type: Single line of text
- Format: Text
- Required: Business required
- Maximum character count: 100
- Click "Save"

STEP 2.5: Add column mpa_copilotresponse
- Click "+ New column" button
- Display name: mpa_copilotresponse
- Data type: Multiple lines of text
- Format: Text
- Required: Optional
- Maximum character count: 100000
- Click "Save"

STEP 2.6: Add column mpa_responsetime_ms
- Click "+ New column" button
- Display name: mpa_responsetime_ms
- Data type: Whole number
- Format: None
- Minimum value: 0
- Maximum value: 999999
- Required: Optional
- Click "Save"

STEP 2.7: Add column mpa_executedon
- Click "+ New column" button
- Display name: mpa_executedon
- Data type: Date and time
- Format: Date and time
- Required: Optional
- Click "Save"

STEP 2.8: Add column mpa_conversationid
- Click "+ New column" button
- Display name: mpa_conversationid
- Data type: Single line of text
- Format: Text
- Required: Optional
- Maximum character count: 200
- Click "Save"

STEP 2.9: Add column mpa_error
- Click "+ New column" button
- Display name: mpa_error
- Data type: Multiple lines of text
- Format: Text
- Required: Optional
- Maximum character count: 4000
- Click "Save"

TABLE 2 COMPLETE. You should have 8 columns total.

--------------------------------------------------------------------------------
TABLE 3: mpa_testconfig
--------------------------------------------------------------------------------

STEP 3.1: Create the table
- Left sidebar: Click "Tables"
- Top toolbar: Click "New table" dropdown arrow
- Select: "New table (advanced properties)"

STEP 3.2: Fill in table properties
- Display name: MPA Test Config
- Plural name: MPA Test Configs
- Schema name: Change suffix to: mpa_testconfig
- Primary column display name: mpa_configkey
- Primary column schema name: mpa_configkey
- Click "Save"

STEP 3.3: Add column mpa_configvalue
- Click "+ New column" button
- Display name: mpa_configvalue
- Data type: Multiple lines of text
- Format: Text
- Required: Business required
- Maximum character count: 4000
- Click "Save"

STEP 3.4: Add the API key row
- Click "Edit" in the table toolbar (or the data tab)
- Click "+ New row"
- mpa_configkey: API_KEY
- mpa_configvalue: (generate a key by running in terminal: openssl rand -hex 32)
  Or use any secure random string like: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
- Press Enter or click away to save the row

COPY THIS API KEY VALUE - you will need it for your .env file.

TABLE 3 COMPLETE.

================================================================================
PART 2: FLOW 1 - MPA-Test-Submit
================================================================================

Open: https://make.powerautomate.com

Confirm you are in the correct environment (same as your tables).

STEP F1.1: Create the flow
- Left sidebar: Click "My flows"
- Top toolbar: Click "+ New flow"
- Select: "Instant cloud flow"
- Flow name: MPA-Test-Submit
- Select trigger: "When an HTTP request is received"
- Click "Create"

--------------------------------------------------------------------------------
ACTION 1: When an HTTP request is received (TRIGGER)
--------------------------------------------------------------------------------

STEP F1.2: Configure the trigger
- Click on the trigger to expand it
- Click "Use sample payload to generate schema"
- Paste this JSON and click "Done":

{
    "run_id": "test-001",
    "tests": [
        {
            "test_id": "A1",
            "name": "Test Name",
            "category": "Category",
            "prompt": "Test prompt",
            "priority": "P1"
        }
    ]
}

- The schema will auto-generate. Verify it shows properties for run_id and tests array.
- Who can trigger the flow: Anyone
- Method: POST

--------------------------------------------------------------------------------
ACTION 2: List rows (get API key)
--------------------------------------------------------------------------------

STEP F1.3: Add action to get API key
- Click "+ New step"
- Search for: "List rows"
- Select: "List rows" under Microsoft Dataverse

STEP F1.4: Configure List rows
- Click on the action title "List rows" and rename it to: Get_API_Key
- Table name: Click dropdown, select "MPA Test Configs"
- Click "Show all" to see advanced options
- Filter rows: mpa_configkey eq 'API_KEY'
- Row count: 1

--------------------------------------------------------------------------------
ACTION 3: Initialize variable - ExpectedApiKey
--------------------------------------------------------------------------------

STEP F1.5: Add variable
- Click "+ New step"
- Search for: "Initialize variable"
- Select: "Initialize variable" under Variable

STEP F1.6: Configure variable
- Name: ExpectedApiKey
- Type: String
- Value: Click in the field, then click "Expression" tab
- Paste this expression exactly:
  first(outputs('Get_API_Key')?['body/value'])?['mpa_configvalue']
- Click "OK"

--------------------------------------------------------------------------------
ACTION 4: Initialize variable - ProvidedApiKey
--------------------------------------------------------------------------------

STEP F1.7: Add variable
- Click "+ New step"
- Search for: "Initialize variable"
- Select: "Initialize variable"

STEP F1.8: Configure variable
- Name: ProvidedApiKey
- Type: String
- Value: Click in the field, then click "Expression" tab
- Paste this expression exactly:
  triggerOutputs()?['headers']?['X-API-Key']
- Click "OK"

--------------------------------------------------------------------------------
ACTION 5: Condition (check API key)
--------------------------------------------------------------------------------

STEP F1.9: Add condition
- Click "+ New step"
- Search for: "Condition"
- Select: "Condition" under Control

STEP F1.10: Configure condition
- Click the left box "Choose a value"
- Click "Dynamic content" tab
- Select: ProvidedApiKey
- Middle dropdown: "is equal to"
- Click the right box "Choose a value"
- Click "Dynamic content" tab
- Select: ExpectedApiKey

--------------------------------------------------------------------------------
ACTION 6: Response - 401 (in "If no" branch)
--------------------------------------------------------------------------------

STEP F1.11: Add response in No branch
- In the "If no" branch, click "Add an action"
- Search for: "Response"
- Select: "Response" under Request

STEP F1.12: Configure 401 response
- Click on action title and rename to: Response_401_Unauthorized
- Status Code: 401
- Headers: Click "Show all"
  - Click "+ Add new item"
  - Key: Content-Type
  - Value: application/json
- Body: Paste directly (not dynamic content):
{"success": false, "error": "Invalid or missing API key"}

--------------------------------------------------------------------------------
ACTION 7: Terminate (in "If no" branch)
--------------------------------------------------------------------------------

STEP F1.13: Add terminate
- Still in "If no" branch, click "Add an action"
- Search for: "Terminate"
- Select: "Terminate" under Control

STEP F1.14: Configure terminate
- Status: Succeeded

--------------------------------------------------------------------------------
ACTION 8: Initialize variable - RunId (in "If yes" branch)
--------------------------------------------------------------------------------

STEP F1.15: Add variable in Yes branch
- In the "If yes" branch, click "Add an action"
- Search for: "Initialize variable"
- Select: "Initialize variable"

STEP F1.16: Configure variable
- Name: RunId
- Type: String
- Value: Click "Dynamic content" tab
- Select: run_id (under "When an HTTP request is received")

--------------------------------------------------------------------------------
ACTION 9: Initialize variable - TestCount (in "If yes" branch)
--------------------------------------------------------------------------------

STEP F1.17: Add variable
- In "If yes" branch, click "Add an action"
- Search for: "Initialize variable"
- Select: "Initialize variable"

STEP F1.18: Configure variable
- Name: TestCount
- Type: Integer
- Value: 0

--------------------------------------------------------------------------------
ACTION 10: Apply to each (in "If yes" branch)
--------------------------------------------------------------------------------

STEP F1.19: Add loop
- In "If yes" branch, click "Add an action"
- Search for: "Apply to each"
- Select: "Apply to each" under Control

STEP F1.20: Configure loop
- Select an output from previous steps: Click "Dynamic content" tab
- Select: tests (under "When an HTTP request is received")

--------------------------------------------------------------------------------
ACTION 11: Add a new row - inside Apply to each
--------------------------------------------------------------------------------

STEP F1.21: Add Dataverse action inside the loop
- Inside the "Apply to each" box, click "Add an action"
- Search for: "Add a new row"
- Select: "Add a new row" under Microsoft Dataverse

STEP F1.22: Configure Add a new row
- Click on action title and rename to: Create_Test_Case
- Table name: MPA Test Cases
- Click "Show all" to see all columns

For each field below, click "Dynamic content" tab and select the value:

- mpa_name: Select "name" (from the loop - it will show as "Current item name")
- mpa_testid: Select "test_id" (shows as "Current item test_id")
- mpa_prompt: Select "prompt" (shows as "Current item prompt")
- mpa_category: Select "category" (shows as "Current item category")
- mpa_runid: Select "RunId" (the variable you created)
- mpa_status: Click in field, type: Pending
  (Or if it shows as dropdown, select "Pending")
- mpa_priority: Select "priority" (shows as "Current item priority")
  NOTE: This may need to be the choice value. If it fails, use expression:
  if(equals(items('Apply_to_each')?['priority'],'P1'),1,if(equals(items('Apply_to_each')?['priority'],'P2'),2,3))

--------------------------------------------------------------------------------
ACTION 12: Increment variable - inside Apply to each
--------------------------------------------------------------------------------

STEP F1.23: Add increment inside loop
- Still inside "Apply to each", click "Add an action"
- Search for: "Increment variable"
- Select: "Increment variable"

STEP F1.24: Configure increment
- Name: TestCount
- Value: 1

--------------------------------------------------------------------------------
ACTION 13: Response - 200 (after Apply to each, still in "If yes")
--------------------------------------------------------------------------------

STEP F1.25: Add success response
- AFTER the "Apply to each" (outside it, but still in "If yes"), click "Add an action"
- Search for: "Response"
- Select: "Response"

STEP F1.26: Configure 200 response
- Click on action title and rename to: Response_200_Success
- Status Code: 200
- Headers:
  - Click "+ Add new item"
  - Key: Content-Type
  - Value: application/json
- Body: Click in the field and build this using Expression and Dynamic content:

OPTION A - Use Expression tab and paste:
concat('{"success": true, "run_id": "', variables('RunId'), '", "tests_queued": ', variables('TestCount'), '}')

OPTION B - Type directly with dynamic content insertions:
{"success": true, "run_id": "@{variables('RunId')}", "tests_queued": @{variables('TestCount')}}

(For Option B, type the static parts, then for @{variables('RunId')} click Dynamic content and select RunId, etc.)

--------------------------------------------------------------------------------
SAVE AND GET URL
--------------------------------------------------------------------------------

STEP F1.27: Save the flow
- Click "Save" in top right

STEP F1.28: Get the HTTP URL
- Click on the trigger "When an HTTP request is received"
- Copy the "HTTP POST URL" that appears
- This is your PA_SUBMIT_URL - save it!

FLOW 1 COMPLETE.

================================================================================
PART 3: FLOW 3 - MPA-Test-Results
================================================================================

We build Flow 3 before Flow 2 because it's simpler.

STEP F3.1: Create the flow
- Left sidebar: Click "My flows"
- Top toolbar: Click "+ New flow"
- Select: "Instant cloud flow"
- Flow name: MPA-Test-Results
- Select trigger: "When an HTTP request is received"
- Click "Create"

--------------------------------------------------------------------------------
ACTION 1: When an HTTP request is received (TRIGGER)
--------------------------------------------------------------------------------

STEP F3.2: Configure the trigger
- Who can trigger the flow: Anyone
- Method: GET
- Leave the schema empty (we use query parameters)

--------------------------------------------------------------------------------
ACTION 2: List rows (get API key)
--------------------------------------------------------------------------------

STEP F3.3: Add action
- Click "+ New step"
- Search for: "List rows"
- Select: "List rows" under Microsoft Dataverse

STEP F3.4: Configure
- Rename to: Get_API_Key
- Table name: MPA Test Configs
- Filter rows: mpa_configkey eq 'API_KEY'
- Row count: 1

--------------------------------------------------------------------------------
ACTION 3: Initialize variable - ExpectedApiKey
--------------------------------------------------------------------------------

STEP F3.5: Add and configure
- Click "+ New step"
- Initialize variable
- Name: ExpectedApiKey
- Type: String
- Value (Expression): first(outputs('Get_API_Key')?['body/value'])?['mpa_configvalue']

--------------------------------------------------------------------------------
ACTION 4: Initialize variable - ProvidedApiKey
--------------------------------------------------------------------------------

STEP F3.6: Add and configure
- Click "+ New step"
- Initialize variable
- Name: ProvidedApiKey
- Type: String
- Value (Expression): triggerOutputs()?['headers']?['X-API-Key']

--------------------------------------------------------------------------------
ACTION 5: Condition (check API key)
--------------------------------------------------------------------------------

STEP F3.7: Add and configure
- Click "+ New step"
- Condition
- Left: ProvidedApiKey (Dynamic content)
- Operator: is equal to
- Right: ExpectedApiKey (Dynamic content)

--------------------------------------------------------------------------------
ACTION 6: Response 401 (If no branch)
--------------------------------------------------------------------------------

STEP F3.8: Configure No branch
- In "If no", add Response action
- Rename to: Response_401
- Status Code: 401
- Headers: Content-Type = application/json
- Body: {"success": false, "error": "Invalid or missing API key"}

STEP F3.9: Add Terminate in No branch
- Add Terminate action
- Status: Succeeded

--------------------------------------------------------------------------------
ACTION 7: Initialize variable - RunId (If yes branch)
--------------------------------------------------------------------------------

STEP F3.10: Add variable in Yes branch
- In "If yes", add Initialize variable
- Name: RunId
- Type: String
- Value (Expression): triggerOutputs()?['queries']?['run_id']

--------------------------------------------------------------------------------
ACTION 8: Condition - Check RunId exists
--------------------------------------------------------------------------------

STEP F3.11: Add condition
- In "If yes" (after RunId variable), add Condition
- Left (Expression): empty(variables('RunId'))
- Operator: is equal to
- Right: Type directly: true

--------------------------------------------------------------------------------
ACTION 9: Response 400 (If yes - RunId empty)
--------------------------------------------------------------------------------

STEP F3.12: In the NEW "If yes" (RunId is empty)
- Add Response action
- Rename to: Response_400_Missing_RunId
- Status Code: 400
- Headers: Content-Type = application/json
- Body: {"success": false, "error": "run_id query parameter is required"}

STEP F3.13: Add Terminate
- Status: Succeeded

--------------------------------------------------------------------------------
ACTION 10: List rows - Get Results (If no - RunId exists)
--------------------------------------------------------------------------------

STEP F3.14: In "If no" (RunId exists), add List rows
- Rename to: Get_Test_Results
- Table name: MPA Test Results
- Filter rows: Click Expression tab and paste:
  concat('mpa_runid eq ''', variables('RunId'), '''')
- Expand Query: mpa_testcase($select=mpa_testid,mpa_name,mpa_prompt,mpa_category,mpa_status)

--------------------------------------------------------------------------------
ACTION 11: Select (format results)
--------------------------------------------------------------------------------

STEP F3.15: Add Select action
- Click "+ New step" (still in If no branch)
- Search for: "Select"
- Select: "Select" under Data Operation

STEP F3.16: Configure Select
- Rename to: Format_Results
- From: Click Dynamic content, select "value" from Get_Test_Results
- Map: Click "Switch to text mode" (the T icon on the right)
- Paste this JSON:
{
    "test_id": @{item()?['mpa_testcase/mpa_testid']},
    "name": @{item()?['mpa_testcase/mpa_name']},
    "category": @{item()?['mpa_testcase/mpa_category']},
    "prompt": @{item()?['mpa_testcase/mpa_prompt']},
    "status": @{item()?['mpa_testcase/mpa_status']},
    "response": @{item()?['mpa_copilotresponse']},
    "response_time_ms": @{item()?['mpa_responsetime_ms']},
    "executed_on": @{item()?['mpa_executedon']},
    "conversation_id": @{item()?['mpa_conversationid']},
    "error": @{item()?['mpa_error']}
}

NOTE: If text mode doesn't work, switch back to key-value mode and add each field:
- Key: test_id, Value (Expression): item()?['mpa_testcase/mpa_testid']
- Key: name, Value (Expression): item()?['mpa_testcase/mpa_name']
- (continue for all fields)

--------------------------------------------------------------------------------
ACTION 12: Response 200 (success)
--------------------------------------------------------------------------------

STEP F3.17: Add Response
- After Select, add Response action
- Rename to: Response_200_Success
- Status Code: 200
- Headers: Content-Type = application/json
- Body (Expression):
  concat('{"success": true, "run_id": "', variables('RunId'), '", "total_results": ', length(body('Format_Results')), ', "results": ', string(body('Format_Results')), '}')

OR use this simpler approach - just paste and use dynamic content:
{
    "success": true,
    "run_id": "@{variables('RunId')}",
    "total_results": @{length(body('Format_Results'))},
    "results": @{body('Format_Results')}
}

--------------------------------------------------------------------------------
SAVE AND GET URL
--------------------------------------------------------------------------------

STEP F3.18: Save the flow
- Click "Save"

STEP F3.19: Get the HTTP URL
- Click on the trigger
- Copy the "HTTP GET URL"
- This is your PA_RESULTS_URL - save it!

FLOW 3 COMPLETE.

================================================================================
PART 4: FLOW 2 - MPA-Test-Execute
================================================================================

This flow is triggered when a test case is created and sends the prompt to Copilot.

STEP F2.1: Create the flow
- Left sidebar: Click "My flows"
- Top toolbar: Click "+ New flow"
- Select: "Automated cloud flow"
- Flow name: MPA-Test-Execute
- Search for trigger: "When a row is added"
- Select: "When a row is added, modified or deleted" under Microsoft Dataverse
- Click "Create"

--------------------------------------------------------------------------------
ACTION 1: When a row is added (TRIGGER)
--------------------------------------------------------------------------------

STEP F2.2: Configure trigger
- Change type: Added
- Table name: MPA Test Cases
- Scope: Organization
- Click "Show all"
- Filter rows: mpa_status eq 'Pending'
- Select columns: mpa_testcaseid,mpa_testid,mpa_name,mpa_prompt,mpa_runid

STEP F2.3: Configure concurrency
- Click the three dots (...) on the trigger
- Click "Settings"
- Turn ON "Concurrency Control"
- Degree of Parallelism: 1
- Click "Done"

--------------------------------------------------------------------------------
ACTION 2: Update row - Set status to Running
--------------------------------------------------------------------------------

STEP F2.4: Add action
- Click "+ New step"
- Search for: "Update a row"
- Select: "Update a row" under Microsoft Dataverse

STEP F2.5: Configure
- Rename to: Set_Status_Running
- Table name: MPA Test Cases
- Row ID (Expression): triggerOutputs()?['body/mpa_testcaseid']
- Click "Show all"
- mpa_status: Running (type directly or select from dropdown)

--------------------------------------------------------------------------------
ACTION 3: Initialize variable - StartTime
--------------------------------------------------------------------------------

STEP F2.6: Add and configure
- Initialize variable
- Name: StartTime
- Type: String
- Value (Expression): utcNow()

--------------------------------------------------------------------------------
ACTION 4: Initialize variable - ResponseText
--------------------------------------------------------------------------------

STEP F2.7: Add and configure
- Initialize variable
- Name: ResponseText
- Type: String
- Value: (leave empty)

--------------------------------------------------------------------------------
ACTION 5: Initialize variable - ErrorText
--------------------------------------------------------------------------------

STEP F2.8: Add and configure
- Initialize variable
- Name: ErrorText
- Type: String
- Value: (leave empty)

--------------------------------------------------------------------------------
ACTION 6: Initialize variable - ConversationId
--------------------------------------------------------------------------------

STEP F2.9: Add and configure
- Initialize variable
- Name: ConversationId
- Type: String
- Value: (leave empty)

--------------------------------------------------------------------------------
ACTION 7: Scope - Try_Execute_Copilot
--------------------------------------------------------------------------------

STEP F2.10: Add scope
- Click "+ New step"
- Search for: "Scope"
- Select: "Scope" under Control
- Rename to: Try_Execute_Copilot

--------------------------------------------------------------------------------
INSIDE THE SCOPE: Copilot Interaction
--------------------------------------------------------------------------------

BEFORE PROCEEDING: We need to determine which method works in your environment.

TEST THIS FIRST:
- Click "Add an action" inside the scope
- Search for: "Copilot"
- Look for any of these connectors:
  - "Microsoft Copilot Studio"
  - "Power Virtual Agents"
  - "Copilot"

TELL ME WHAT YOU SEE and I will provide the exact configuration for whichever connector is available.

IF NO COPILOT CONNECTOR EXISTS, we will use HTTP actions to call the Copilot API directly.

--------------------------------------------------------------------------------
PLACEHOLDER FOR COPILOT ACTIONS (depends on what's available)
--------------------------------------------------------------------------------

[STOP HERE AND TELL ME WHAT CONNECTORS YOU SEE]

After you tell me, I will provide:
- The exact actions to add
- Every field value
- Expressions to parse the response

--------------------------------------------------------------------------------
ACTION 8: Scope - Catch_Error
--------------------------------------------------------------------------------

STEP F2.11: Add catch scope
- AFTER the Try_Execute_Copilot scope, click "+ New step"
- Add another Scope
- Rename to: Catch_Error

STEP F2.12: Configure run after
- Click the three dots (...) on Catch_Error scope
- Click "Configure run after"
- UNCHECK: is successful
- CHECK: has failed
- CHECK: has timed out
- Click "Done"

STEP F2.13: Add Set Variable inside Catch_Error
- Inside Catch_Error scope, add "Set variable"
- Name: ErrorText
- Value (Expression): 
  concat('Execution failed: ', coalesce(result('Try_Execute_Copilot')?['error']?['message'], 'Unknown error'))

--------------------------------------------------------------------------------
ACTION 9: Compose - Calculate Response Time
--------------------------------------------------------------------------------

STEP F2.14: Add compose (after both scopes)
- Click "+ New step" (after both scopes)
- Search for: "Compose"
- Select: "Compose" under Data Operation
- Rename to: Calculate_Response_Time
- Inputs (Expression): div(sub(ticks(utcNow()), ticks(variables('StartTime'))), 10000)

--------------------------------------------------------------------------------
ACTION 10: Add a new row - Create Test Result
--------------------------------------------------------------------------------

STEP F2.15: Add action
- Click "+ New step"
- Add a new row (Dataverse)
- Rename to: Create_Test_Result

STEP F2.16: Configure all fields
- Table name: MPA Test Results
- Click "Show all"

- mpa_resultname (Expression): 
  concat(triggerOutputs()?['body/mpa_testid'], ' - ', utcNow())

- mpa_testcase: Click in field, then Expression tab:
  triggerOutputs()?['body/mpa_testcaseid']

- mpa_runid (Dynamic content): Select mpa_runid from trigger
  OR (Expression): triggerOutputs()?['body/mpa_runid']

- mpa_copilotresponse (Dynamic content): Select ResponseText variable

- mpa_responsetime_ms (Dynamic content): Select output from Calculate_Response_Time

- mpa_executedon (Expression): utcNow()

- mpa_conversationid (Dynamic content): Select ConversationId variable

- mpa_error (Dynamic content): Select ErrorText variable

--------------------------------------------------------------------------------
ACTION 11: Condition - Check for errors
--------------------------------------------------------------------------------

STEP F2.17: Add condition
- Click "+ New step"
- Add Condition
- Left (Expression): empty(variables('ErrorText'))
- Operator: is equal to
- Right: true

--------------------------------------------------------------------------------
ACTION 12: Update row - Set Complete (If yes)
--------------------------------------------------------------------------------

STEP F2.18: In "If yes" branch
- Add "Update a row"
- Rename to: Set_Status_Complete
- Table name: MPA Test Cases
- Row ID (Expression): triggerOutputs()?['body/mpa_testcaseid']
- mpa_status: Complete

--------------------------------------------------------------------------------
ACTION 13: Update row - Set Failed (If no)
--------------------------------------------------------------------------------

STEP F2.19: In "If no" branch
- Add "Update a row"
- Rename to: Set_Status_Failed
- Table name: MPA Test Cases
- Row ID (Expression): triggerOutputs()?['body/mpa_testcaseid']
- mpa_status: Failed
- mpa_error (Dynamic content): Select ErrorText variable

--------------------------------------------------------------------------------
SAVE
--------------------------------------------------------------------------------

STEP F2.20: Save the flow
- Click "Save"

================================================================================
PART 5: UPDATE YOUR .ENV FILE
================================================================================

Open: /Users/kevinbauer/Kessel-Digital/Media_Planning_Agent/tests/.env

Update these values:
- PA_SUBMIT_URL: (paste the URL from Flow 1)
- PA_RESULTS_URL: (paste the URL from Flow 3)
- PA_API_KEY: (paste the key you created in mpa_testconfig table)

================================================================================
PART 6: TEST
================================================================================

Run a single test:
cd /Users/kevinbauer/Kessel-Digital/Media_Planning_Agent/tests
python3 mpa_test_runner_pa.py --tests A1

If successful, run all tests:
python3 mpa_test_runner_pa.py
