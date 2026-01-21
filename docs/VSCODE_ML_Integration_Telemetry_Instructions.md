# VS CODE: ML Endpoint Integration + Telemetry Implementation

**Date:** January 20, 2026  
**Prerequisites:** Azure ML endpoints deployed (COMPLETE)  
**Scope:** Wire Power Automate flows to ML endpoints + Implement telemetry logging

---

## PART 1: POWER AUTOMATE FLOWS TO CALL ML ENDPOINTS

### 1.1 Create Capability Dispatcher Flow

**Flow Name:** MPA_Capability_Dispatcher  
**Trigger:** HTTP Request (called by Copilot)  
**Purpose:** Route capability requests to correct implementation (ML endpoint vs AI Builder)

**Logic:**
```
1. Receive request with capability_code
2. Query eap_capability_implementation WHERE capability_code = {input} AND is_enabled = true
3. Sort by priority_order ASC
4. Get top result
5. If implementation_type = "AZURE_ML_ENDPOINT":
   - HTTP POST to endpoint_url with payload
6. Else If implementation_type = "AI_BUILDER_PROMPT":
   - Call AI Builder prompt
7. Log to eap_telemetry
8. Return response
```

**Implementation:**
```yaml
trigger:
  type: http_request
  method: POST
  schema:
    capability_code: string
    session_id: string
    request_id: string
    inputs: object

actions:
  - name: Get_Implementation
    type: Dataverse_List_Rows
    table: eap_capability_implementation
    filter: "eap_capability_code eq '@{triggerBody()?['capability_code']}' and eap_is_enabled eq true"
    orderby: eap_priority_order asc
    top: 1

  - name: Check_Implementation_Type
    type: Condition
    expression: "@equals(first(outputs('Get_Implementation')?['body/value'])?['eap_implementation_type'], 'AZURE_ML_ENDPOINT')"
    
  - name: Call_ML_Endpoint
    type: HTTP
    method: POST
    uri: "@{first(outputs('Get_Implementation')?['body/value'])?['eap_endpoint_url']}"
    headers:
      Content-Type: application/json
    body:
      session_id: "@{triggerBody()?['session_id']}"
      request_id: "@{triggerBody()?['request_id']}"
      inputs: "@{triggerBody()?['inputs']}"
    runAfter: Check_Implementation_Type
    runCondition: succeeded

  - name: Call_AI_Builder
    type: AI_Builder_Prompt
    prompt_id: "@{first(outputs('Get_Implementation')?['body/value'])?['eap_prompt_reference']}"
    inputs: "@{triggerBody()?['inputs']}"
    runAfter: Check_Implementation_Type
    runCondition: failed

  - name: Log_Telemetry
    type: Dataverse_Create_Row
    table: eap_telemetry
    row:
      eap_session_id: "@{triggerBody()?['session_id']}"
      eap_request_id: "@{triggerBody()?['request_id']}"
      eap_capability_code: "@{triggerBody()?['capability_code']}"
      eap_implementation_used: "@{first(outputs('Get_Implementation')?['body/value'])?['eap_implementation_type']}"
      eap_start_time: "@{utcNow()}"
      eap_status: "success"
      eap_latency_ms: "@{div(sub(ticks(utcNow()),ticks(triggerBody()?['timestamp'])),10000)}"

  - name: Return_Response
    type: Response
    statusCode: 200
    body: "@{coalesce(outputs('Call_ML_Endpoint')?['body'], outputs('Call_AI_Builder')?['body'])}"
```

---

### 1.2 Create Agent-Specific Wrapper Flows

Create wrapper flows for each agent to call the dispatcher:

**ANL Agent Flows:**
```
MPA_ANL_BudgetOptimize
- Calls: MPA_Capability_Dispatcher with capability_code = "ANL_BUDGET_OPTIMIZE"
- ML Endpoint: https://kdap-ml-budget-optimizer.azurewebsites.net/api/score

MPA_ANL_MonteCarlo
- Calls: MPA_Capability_Dispatcher with capability_code = "ANL_MONTECARLO"
- ML Endpoint: https://kdap-ml-monte-carlo.azurewebsites.net/api/score

MPA_ANL_MediaMix
- Calls: MPA_Capability_Dispatcher with capability_code = "ANL_MEDIA_MIX"
- ML Endpoint: https://kdap-ml-media-mix.azurewebsites.net/api/score
```

**AUD Agent Flows:**
```
MPA_AUD_PropensityScore
- Calls: MPA_Capability_Dispatcher with capability_code = "AUD_PROPENSITY_SCORE"
- ML Endpoint: https://kdap-ml-propensity.azurewebsites.net/api/score
```

**PRF Agent Flows:**
```
MPA_PRF_AnomalyDetect
- Calls: MPA_Capability_Dispatcher with capability_code = "PRF_ANOMALY_DETECT"
- ML Endpoint: https://kdap-ml-anomaly-detector.azurewebsites.net/api/score

MPA_PRF_Attribution
- Calls: MPA_Capability_Dispatcher with capability_code = "PRF_ATTRIBUTION"
- ML Endpoint: https://kdap-ml-attribution.azurewebsites.net/api/score
```

**CST Agent Flows:**
```
MPA_CST_Prioritize
- Calls: MPA_Capability_Dispatcher with capability_code = "CST_PRIORITIZE"
- ML Endpoint: https://kdap-ml-prioritizer.azurewebsites.net/api/score
```

---

## PART 2: TELEMETRY IMPLEMENTATION

### 2.1 Verify eap_telemetry Table Schema

**Table:** eap_telemetry  
**Check these columns exist:**

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_telemetry_id | GUID (PK) | Yes | Auto-generated |
| eap_session_id | Text (100) | Yes | Session identifier |
| eap_request_id | Text (100) | Yes | Unique request ID |
| eap_turn_number | Integer | No | Conversation turn |
| eap_user_intent | Text (500) | No | Classified intent |
| eap_capability_code | Text (50) | Yes | Capability invoked |
| eap_routed_agent | Text (10) | No | Agent that handled |
| eap_implementation_used | Text (50) | No | ML_ENDPOINT or AI_BUILDER |
| eap_kb_chunks_retrieved | Multiline | No | JSON array of chunks |
| eap_tools_invoked | Multiline | No | JSON array of tools |
| eap_confidence_level | Decimal | No | 0-100 confidence |
| eap_start_time | DateTime | Yes | Request start |
| eap_end_time | DateTime | No | Request end |
| eap_latency_ms | Integer | No | Total latency |
| eap_status | Text (20) | Yes | success/error/timeout |
| eap_error_code | Text (50) | No | Error code if failed |
| eap_error_message | Text (500) | No | Error details |
| eap_user_feedback | Text (20) | No | thumbs_up/thumbs_down |
| eap_metadata | Multiline | No | Additional JSON data |
| created_on | DateTime | Yes | Auto-timestamp |

**If columns missing, add via pac CLI:**
```bash
pac modelbuilder table addcolumn \
  --table eap_telemetry \
  --name eap_implementation_used \
  --type text \
  --length 50
```

---

### 2.2 Add Telemetry Logging to ALL Existing Flows

**Update these flows to log telemetry:**

| Flow | Add Telemetry Action |
|------|---------------------|
| MPA_Memory_Initialize | Log session start |
| MPA_Memory_Store | Log preference update |
| MPA_Proactive_Evaluate | Log triggers evaluated |
| MPA_File_Process | Log file processing |
| MPA_Workflow_Orchestrate | Log collaborative workflow |
| All agent capability flows | Log every capability call |

**Standard Telemetry Action (add to end of each flow):**
```yaml
- name: Log_Telemetry
  type: Dataverse_Create_Row
  table: eap_telemetry
  row:
    eap_session_id: "@{triggerBody()?['session_id']}"
    eap_request_id: "@{guid()}"
    eap_capability_code: "FLOW_NAME_HERE"
    eap_routed_agent: "AGENT_CODE_HERE"
    eap_start_time: "@{triggerBody()?['timestamp']}"
    eap_end_time: "@{utcNow()}"
    eap_latency_ms: "@{div(sub(ticks(utcNow()),ticks(triggerBody()?['timestamp'])),10000)}"
    eap_status: "@{if(equals(outputs('Previous_Action')?['statusCode'], 200), 'success', 'error')}"
    eap_metadata: "@{json(concat('{\"flow_run_id\":\"', workflow()?['run']?['name'], '\"}'))}"
```

---

### 2.3 Create Telemetry Summary Flow

**Flow Name:** MPA_Telemetry_Daily_Summary  
**Trigger:** Scheduled (daily at midnight)  
**Purpose:** Aggregate daily metrics

**Actions:**
```yaml
- name: Get_Todays_Telemetry
  type: Dataverse_List_Rows
  table: eap_telemetry
  filter: "created_on ge @{addDays(utcNow(), -1)}"

- name: Calculate_Metrics
  type: Compose
  inputs:
    total_requests: "@{length(outputs('Get_Todays_Telemetry')?['body/value'])}"
    success_count: "@{length(filter(outputs('Get_Todays_Telemetry')?['body/value'], item()?['eap_status'] eq 'success'))}"
    avg_latency: "@{avg(outputs('Get_Todays_Telemetry')?['body/value'], 'eap_latency_ms')}"
    by_agent: "@{groupBy(outputs('Get_Todays_Telemetry')?['body/value'], 'eap_routed_agent')}"
    by_capability: "@{groupBy(outputs('Get_Todays_Telemetry')?['body/value'], 'eap_capability_code')}"

- name: Store_Summary
  type: Dataverse_Create_Row
  table: eap_telemetry_summary
  row:
    summary_date: "@{formatDateTime(utcNow(), 'yyyy-MM-dd')}"
    total_requests: "@{outputs('Calculate_Metrics')?['total_requests']}"
    success_rate: "@{div(outputs('Calculate_Metrics')?['success_count'], outputs('Calculate_Metrics')?['total_requests'])}"
    avg_latency_ms: "@{outputs('Calculate_Metrics')?['avg_latency']}"
    metrics_json: "@{string(outputs('Calculate_Metrics'))}"
```

---

## PART 3: UPDATE COPILOT TOPICS TO USE NEW FLOWS

### 3.1 Update Agent Topics

For each agent, update topics to call the new dispatcher flows:

**Example: ANL Agent - Budget Optimization Topic**
```
Trigger Phrases:
- Optimize my budget
- Budget allocation
- Best budget split

Actions:
1. Collect inputs (channels, budget, constraints)
2. Call flow: MPA_ANL_BudgetOptimize
3. Parse response
4. Display results with confidence score
5. Note: "Powered by ML endpoint" if implementation_type = AZURE_ML_ENDPOINT
```

---

## PART 4: TESTING CHECKLIST

### 4.1 ML Endpoint Integration Tests

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| Call ANL_BUDGET_OPTIMIZE via flow | Returns optimization JSON | |
| Call AUD_PROPENSITY_SCORE via flow | Returns propensity scores | |
| Call PRF_ANOMALY_DETECT via flow | Returns anomaly flags | |
| Call ANL_MONTECARLO via flow | Returns simulation results | |
| Call ANL_MEDIA_MIX via flow | Returns mix recommendations | |
| Call PRF_ATTRIBUTION via flow | Returns attribution values | |
| Call CST_PRIORITIZE via flow | Returns priority scores | |

### 4.2 Telemetry Tests

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| Capability call creates telemetry row | Row in eap_telemetry | |
| Latency captured correctly | latency_ms > 0 | |
| Implementation type logged | ML_ENDPOINT or AI_BUILDER | |
| Error state captured on failure | status = "error" | |
| Daily summary runs | Summary row created | |

### 4.3 Fallback Tests

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| ML endpoint unavailable | Falls back to AI Builder | |
| AI Builder fallback logged | implementation_used = AI_BUILDER | |
| Error logged in telemetry | error_code populated | |

---

## PART 5: VERIFICATION COMMANDS

```bash
# Check flows created
pac flow list --environment $ENV_ID | grep MPA_

# Check telemetry records
pac data export --table eap_telemetry --output telemetry_check.csv

# Test ML endpoint directly
curl -X POST https://kdap-ml-budget-optimizer.azurewebsites.net/api/score \
  -H "Content-Type: application/json" \
  -d '{"channels": [{"code": "SEARCH", "spend": 50000}], "total_budget": 100000}'
```

---

## SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| Dispatcher flow created | 1 |
| Agent wrapper flows created | 7 |
| Telemetry logging added to flows | All flows |
| ML endpoints callable via Copilot | 7/7 |
| Telemetry rows generated | Verified |

---

**Execute in order: Part 1 → Part 2 → Part 3 → Part 4 → Part 5**
