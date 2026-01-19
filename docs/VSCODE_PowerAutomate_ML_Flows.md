# VS Code Prompt: Power Automate Flows for KDAP ML Endpoints

## Objective

Create Power Automate flows that connect KDAP ML endpoints to Copilot Studio agents. Each flow should handle HTTP calls to Azure Functions, error handling, retry logic, and response formatting.

---

## Prerequisites

- Azure Functions deployed with ML endpoints (see `src/azure-ml/functions/`)
- Power Platform environment with Dataverse connection
- HTTP connector premium license

---

## Flows to Create

### 1. Budget Optimization Flow

**Name:** `KDAP-ANL-BudgetOptimization`

**Trigger:** When called from Copilot Studio (Instant)

**Input Schema:**
```json
{
  "sessionId": "string",
  "channels": [
    {
      "channelId": "string",
      "currentSpend": "number",
      "historicalROI": "number",
      "audienceSize": "number",
      "competitiveIntensity": "number",
      "seasonalityIndex": "number"
    }
  ]
}
```

**Steps:**
1. Parse JSON input
2. HTTP POST to `https://<function-app>.azurewebsites.net/api/budgetOptimization`
3. Condition: Check response status
   - Success (200): Parse response, format for agent
   - Rate Limited (429): Wait 30 seconds, retry (max 3 attempts)
   - Error (4xx/5xx): Log error, return fallback message
4. Create Dataverse record in `kdap_ml_predictions` table
5. Return formatted response to Copilot

**Output Schema:**
```json
{
  "success": "boolean",
  "recommendations": [
    {
      "channelId": "string",
      "optimalSpend": "number",
      "expectedReturn": "number",
      "confidenceLower": "number",
      "confidenceUpper": "number",
      "marginalReturn": "number",
      "recommendation": "string"
    }
  ],
  "summary": "string",
  "predictionId": "string"
}
```

**Response Formatting Logic:**
```
For each channel:
- If optimalSpend > currentSpend * 1.2: "Increase budget by {percent}%"
- If optimalSpend < currentSpend * 0.8: "Reduce budget by {percent}%"
- Else: "Maintain current budget"

Summary: "Recommended total budget: ${sum}. Expected overall return: ${return}."
```

---

### 2. Propensity Scoring Flow

**Name:** `KDAP-AUD-PropensityScoring`

**Trigger:** When called from Copilot Studio (Instant)

**Input Schema:**
```json
{
  "sessionId": "string",
  "customers": [
    {
      "customerId": "string",
      "recencyDays": "number",
      "frequencyCount": "number",
      "monetaryValue": "number",
      "engagementScore": "number",
      "tenureMonths": "number"
    }
  ],
  "batchMode": "boolean"
}
```

**Steps:**
1. Parse JSON input
2. Check batch size (max 1000 per request)
3. If batch > 1000: Split into chunks, process sequentially
4. HTTP POST to `https://<function-app>.azurewebsites.net/api/propensityScoring`
5. Aggregate results from all batches
6. Create Dataverse records in `kdap_audience_scores` table
7. Generate segment summary
8. Return formatted response

**Output Schema:**
```json
{
  "success": "boolean",
  "scores": [
    {
      "customerId": "string",
      "propensityScore": "number",
      "confidence": "number",
      "percentileRank": "number",
      "segment": "string"
    }
  ],
  "segmentSummary": {
    "highPropensity": "number",
    "mediumPropensity": "number",
    "lowPropensity": "number",
    "veryLowPropensity": "number"
  },
  "summary": "string",
  "scoringId": "string"
}
```

**Response Formatting Logic:**
```
Segment Summary:
- High Propensity (>80%): {count} customers ({percent}%)
- Medium Propensity (50-80%): {count} customers ({percent}%)
- Low Propensity (20-50%): {count} customers ({percent}%)
- Very Low Propensity (<20%): {count} customers ({percent}%)

Recommendation: "Focus on {highCount} high-propensity customers for immediate outreach."
```

---

### 3. Anomaly Detection Flow

**Name:** `KDAP-PRF-AnomalyDetection`

**Trigger:** When called from Copilot Studio (Instant) OR Scheduled (daily)

**Input Schema:**
```json
{
  "sessionId": "string",
  "metrics": [
    {
      "metricName": "string",
      "metricValue": "number",
      "timestamp": "string"
    }
  ],
  "sensitivity": "string",
  "historicalDays": "number"
}
```

**Steps:**
1. Parse JSON input
2. If historicalDays provided: Query Dataverse for historical values
3. HTTP POST to `https://<function-app>.azurewebsites.net/api/anomalyDetection`
4. Filter results by sensitivity threshold
5. For each anomaly detected:
   - Create alert record in `kdap_anomaly_alerts` table
   - If critical: Trigger notification flow
6. Return formatted response

**Output Schema:**
```json
{
  "success": "boolean",
  "anomalies": [
    {
      "metricName": "string",
      "isAnomaly": "boolean",
      "anomalyScore": "number",
      "anomalyType": "string",
      "expectedValue": "number",
      "actualValue": "number",
      "deviation": "number",
      "severity": "string"
    }
  ],
  "summary": {
    "totalMetrics": "number",
    "anomalyCount": "number",
    "criticalCount": "number",
    "warningCount": "number"
  },
  "alerts": "string",
  "detectionId": "string"
}
```

**Severity Classification:**
```
- Critical: anomalyScore >= 0.9
- Warning: anomalyScore >= 0.7 and < 0.9
- Info: anomalyScore >= 0.5 and < 0.7
```

**Alert Message Format:**
```
🚨 CRITICAL: {metricName} shows {anomalyType} - actual {value} vs expected {expected} ({deviation}% deviation)
⚠️ WARNING: {metricName} shows {anomalyType} - actual {value} vs expected {expected} ({deviation}% deviation)
```

---

### 4. Real-Time Anomaly Check Flow

**Name:** `KDAP-PRF-RealtimeAnomalyCheck`

**Trigger:** When called from Copilot Studio (Instant)

**Input Schema:**
```json
{
  "sessionId": "string",
  "metricName": "string",
  "currentValue": "number",
  "sensitivity": "string"
}
```

**Steps:**
1. Query Dataverse for last 30 values of this metric
2. HTTP POST to `https://<function-app>.azurewebsites.net/api/anomalyDetection/realtime`
3. Return immediate result with recommendation

**Output Schema:**
```json
{
  "success": "boolean",
  "isAnomaly": "boolean",
  "score": "number",
  "type": "string",
  "expectedValue": "number",
  "deviation": "number",
  "recommendation": "string"
}
```

---

## Shared Components

### Error Handling Scope

Wrap all HTTP actions in a Scope with error handling:

```
Scope: TryMLEndpoint
  ├── HTTP POST to ML endpoint
  └── Parse JSON response

Configure Run After:
  - On Success: Continue to formatting
  - On Failure: Run ErrorHandler
  - On Timeout: Run RetryLogic

ErrorHandler:
  ├── Compose error details
  ├── Create record in kdap_error_logs
  └── Return fallback response
```

### Retry Logic

```
Initialize retryCount = 0
Do Until: retryCount >= 3 OR success = true
  ├── HTTP POST
  ├── If status = 429:
  │   ├── Delay 30 seconds
  │   └── Increment retryCount
  ├── If status = 200:
  │   └── Set success = true
  └── If status = 5xx:
      ├── Delay 10 seconds
      └── Increment retryCount
```

### Dataverse Tables Required

```
kdap_ml_predictions
├── predictionId (Primary Key)
├── sessionId (Lookup)
├── modelType (Choice: Budget/Propensity/Anomaly)
├── inputPayload (Multiline Text)
├── outputPayload (Multiline Text)
├── latencyMs (Number)
├── createdOn (DateTime)
└── status (Choice: Success/Failed/Timeout)

kdap_anomaly_alerts
├── alertId (Primary Key)
├── sessionId (Lookup)
├── metricName (Text)
├── anomalyType (Choice: Spike/Dip/Trend/Pattern)
├── severity (Choice: Critical/Warning/Info)
├── expectedValue (Number)
├── actualValue (Number)
├── deviation (Number)
├── acknowledged (Boolean)
├── acknowledgedBy (Lookup to User)
└── createdOn (DateTime)

kdap_error_logs
├── logId (Primary Key)
├── flowName (Text)
├── errorCode (Text)
├── errorMessage (Multiline Text)
├── inputPayload (Multiline Text)
├── stackTrace (Multiline Text)
└── createdOn (DateTime)
```

---

## Environment Variables

Create these in Power Platform environment:

| Name | Description | Example |
|------|-------------|---------|
| `KDAP_ML_FUNCTION_URL` | Base URL for Azure Functions | `https://kdap-ml-functions.azurewebsites.net` |
| `KDAP_ML_API_KEY` | Function app host key | `xxxxxxxx` |
| `KDAP_ANOMALY_THRESHOLD_CRITICAL` | Critical anomaly threshold | `0.9` |
| `KDAP_ANOMALY_THRESHOLD_WARNING` | Warning anomaly threshold | `0.7` |
| `KDAP_MAX_BATCH_SIZE` | Max records per ML request | `1000` |
| `KDAP_RETRY_MAX_ATTEMPTS` | Max retry attempts | `3` |
| `KDAP_RETRY_DELAY_SECONDS` | Delay between retries | `30` |

---

## Testing Checklist

### Budget Optimization Flow
- [ ] Single channel optimization returns valid response
- [ ] Multi-channel optimization aggregates correctly
- [ ] Invalid input returns helpful error message
- [ ] Rate limiting triggers retry logic
- [ ] Dataverse record created on success
- [ ] Timeout handled gracefully

### Propensity Scoring Flow
- [ ] Small batch (<100) processes correctly
- [ ] Large batch (>1000) splits and aggregates
- [ ] Segment counts match expected distribution
- [ ] Dataverse records created for each customer
- [ ] Empty input returns appropriate message

### Anomaly Detection Flow
- [ ] Historical data fetched from Dataverse
- [ ] Sensitivity levels filter correctly
- [ ] Critical anomalies trigger alerts
- [ ] Scheduled trigger runs without errors
- [ ] Real-time endpoint responds within 500ms

---

## Copilot Studio Integration

### Topic: Optimize Budget

```
Trigger phrases:
- "optimize my budget"
- "how should I allocate spend"
- "budget recommendation"

Actions:
1. Collect channel data from session
2. Call KDAP-ANL-BudgetOptimization flow
3. Display recommendations with adaptive card
4. Offer to save to brief
```

### Topic: Score Audience

```
Trigger phrases:
- "score my audience"
- "propensity scoring"
- "who should I target"

Actions:
1. Collect audience criteria
2. Query Dataverse for matching customers
3. Call KDAP-AUD-PropensityScoring flow
4. Display segment breakdown
5. Offer to create targeting list
```

### Topic: Check Performance

```
Trigger phrases:
- "check for anomalies"
- "anything unusual"
- "performance issues"

Actions:
1. Fetch recent metrics from session
2. Call KDAP-PRF-AnomalyDetection flow
3. Display alerts if any
4. Offer investigation options
```

---

## Deployment Steps

1. Import solution containing flows
2. Configure environment variables
3. Activate connections (HTTP, Dataverse)
4. Test each flow individually
5. Connect flows to Copilot Studio topics
6. Enable scheduled anomaly detection
7. Monitor for errors in first 24 hours
