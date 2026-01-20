# VS CODE: ML Endpoint Integration + Telemetry Implementation

**Date:** January 20, 2026  
**Priority:** HIGH  
**Prerequisites:** Azure ML endpoints deployed (COMPLETE)

---

## TASK 1: Power Automate Flows to Call ML Endpoints

The 7 ML endpoints are deployed but not yet wired into the agent flows. Create/update Power Automate flows to route capability calls to the appropriate ML endpoint.

### 1.1 Create MPA_ML_Endpoint_Router Flow

**Purpose:** Central router that dispatches capability requests to the correct ML endpoint based on eap_capability_implementation registrations.

**Trigger:** When called from another flow (child flow)

**Inputs:**
- capability_code (string)
- session_id (string)
- request_payload (object)

**Logic:**
```
1. Query eap_capability_implementation where:
   - eap_capability_code = capability_code
   - eap_implementation_type = "AZURE_ML_ENDPOINT"
   
2. Get endpoint_url from result

3. HTTP POST to endpoint_url with:
   Headers: Content-Type: application/json
   Body: request_payload

4. Return response to parent flow

5. Log to eap_telemetry (see Task 2)
```

**Endpoints to Route:**

| Capability Code | Endpoint URL |
|-----------------|--------------|
| ANL_BUDGET_OPTIMIZE | https://kdap-ml-budget-optimizer.azurewebsites.net/api/score |
| AUD_PROPENSITY_SCORE | https://kdap-ml-propensity.azurewebsites.net/api/score |
| PRF_ANOMALY_DETECT | https://kdap-ml-anomaly-detector.azurewebsites.net/api/score |
| ANL_MONTECARLO | https://kdap-ml-monte-carlo.azurewebsites.net/api/score |
| CHA_MEDIA_MIX | https://kdap-ml-media-mix.azurewebsites.net/api/score |
| ANL_ATTRIBUTION | https://kdap-ml-attribution.azurewebsites.net/api/score |
| CST_PRIORITIZE | https://kdap-ml-prioritizer.azurewebsites.net/api/score |

### 1.2 Update Existing Agent Flows

Update these flows to call MPA_ML_Endpoint_Router for ML capabilities:

| Flow | Capabilities to Route |
|------|----------------------|
| MPA_ANL_Dispatcher | ANL_BUDGET_OPTIMIZE, ANL_MONTECARLO, ANL_ATTRIBUTION |
| MPA_AUD_Dispatcher | AUD_PROPENSITY_SCORE |
| MPA_PRF_Dispatcher | PRF_ANOMALY_DETECT |
| MPA_CHA_Dispatcher | CHA_MEDIA_MIX |
| MPA_CST_Dispatcher | CST_PRIORITIZE |

**Pattern for each:**
```
IF capability_code IN [ML_CAPABILITIES]
  THEN Call MPA_ML_Endpoint_Router
  ELSE Call existing AI Builder prompt
```

---

## TASK 2: Telemetry Logging Implementation

### 2.1 Verify eap_telemetry Table Schema

Confirm table exists with these columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| eap_telemetry_id | GUID | Yes | Primary key |
| session_id | Text(100) | Yes | Session identifier |
| turn_number | Integer | No | Conversation turn |
| timestamp | DateTime | Yes | Event timestamp |
| user_intent | Text(500) | No | Classified user intent |
| routed_agent | Text(10) | Yes | Agent code (ANL, AUD, etc.) |
| capability_code | Text(50) | Yes | Capability invoked |
| implementation_type | Text(20) | Yes | ML_ENDPOINT or AI_BUILDER |
| endpoint_url | Text(500) | No | URL called (if ML) |
| kb_chunks_retrieved | Multiline | No | JSON array of KB chunks |
| input_tokens | Integer | No | Input token count |
| output_tokens | Integer | No | Output token count |
| latency_ms | Integer | Yes | Execution time in milliseconds |
| status_code | Integer | Yes | HTTP status or success indicator |
| error_message | Text(1000) | No | Error details if failed |
| confidence_level | Decimal | No | Response confidence 0-1 |
| user_feedback | Choice | No | thumbs_up, thumbs_down, none |
| created_on | DateTime | Yes | Record creation |

If table doesn't exist, create it via pac CLI.

### 2.2 Create MPA_Telemetry_Logger Flow

**Purpose:** Reusable child flow to log telemetry from any agent flow.

**Trigger:** When called from another flow

**Inputs:**
- session_id (string)
- turn_number (integer)
- routed_agent (string)
- capability_code (string)
- implementation_type (string)
- endpoint_url (string, optional)
- latency_ms (integer)
- status_code (integer)
- error_message (string, optional)
- confidence_level (decimal, optional)

**Action:**
```
Create new row in eap_telemetry with:
- All input values
- timestamp = utcNow()
- user_feedback = "none" (default)
```

### 2.3 Integrate Telemetry into All Dispatcher Flows

Add telemetry logging to every capability dispatch:

```
1. Record start_time = utcNow()

2. Execute capability (ML endpoint or AI Builder)

3. Calculate latency_ms = dateDiff(start_time, utcNow(), 'milliseconds')

4. Call MPA_Telemetry_Logger with:
   - session_id from context
   - capability_code
   - implementation_type = "ML_ENDPOINT" or "AI_BUILDER"
   - latency_ms
   - status_code from response
   - confidence_level from response (if available)
```

---

## TASK 3: Test the Integration

### 3.1 End-to-End Test Cases

| Test | Expected Behavior |
|------|-------------------|
| "Optimize my $100K budget across channels" | Routes to ANL → Calls kdap-ml-budget-optimizer → Logs to telemetry |
| "Score propensity for my high-value segment" | Routes to AUD → Calls kdap-ml-propensity → Logs to telemetry |
| "Detect anomalies in last week's performance" | Routes to PRF → Calls kdap-ml-anomaly-detector → Logs to telemetry |
| "Run Monte Carlo on these scenarios" | Routes to ANL → Calls kdap-ml-monte-carlo → Logs to telemetry |

### 3.2 Verify Telemetry Recording

After each test, query eap_telemetry:
```
SELECT TOP 10 * FROM eap_telemetry 
ORDER BY created_on DESC
```

Confirm:
- session_id populated
- capability_code correct
- implementation_type = "ML_ENDPOINT"
- latency_ms reasonable (< 5000ms)
- status_code = 200

---

## TASK 4: Fallback Configuration

If ML endpoint fails, fall back to AI Builder:

```
TRY:
  Call MPA_ML_Endpoint_Router
  IF status_code != 200 THEN THROW
CATCH:
  Log error to telemetry with implementation_type = "ML_ENDPOINT_FAILED"
  Call AI Builder prompt as fallback
  Log success to telemetry with implementation_type = "AI_BUILDER_FALLBACK"
```

---

## DELIVERABLES CHECKLIST

- [ ] MPA_ML_Endpoint_Router flow created
- [ ] MPA_Telemetry_Logger flow created
- [ ] MPA_ANL_Dispatcher updated with ML routing + telemetry
- [ ] MPA_AUD_Dispatcher updated with ML routing + telemetry
- [ ] MPA_PRF_Dispatcher updated with ML routing + telemetry
- [ ] MPA_CHA_Dispatcher updated with ML routing + telemetry
- [ ] MPA_CST_Dispatcher updated with ML routing + telemetry
- [ ] eap_telemetry table verified/created
- [ ] All 4 test cases pass
- [ ] Telemetry records appearing in Dataverse

---

## COMMIT AFTER COMPLETION

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git add .
git commit -m "feat(flows): Add ML endpoint routing and telemetry logging"
git push origin deploy/mastercard
```
