# KDAP Power Automate ML Integration

Power Automate flows and Dataverse tables for connecting KDAP ML endpoints to Copilot Studio agents.

## Overview

This package contains:
- **4 Power Automate Flows** - HTTP-triggered flows that call Azure Function ML endpoints
- **5 Dataverse Tables** - Storage for predictions, alerts, scores, and error logs
- **Environment Variables** - Configuration for different deployment environments

## Flows

| Flow | Agent | Purpose |
|------|-------|---------|
| KDAP-ANL-BudgetOptimization | ANL | Optimize media budget allocation across channels |
| KDAP-AUD-PropensityScoring | AUD | Score customers and segment audiences |
| KDAP-PRF-AnomalyDetection | PRF | Detect anomalies in campaign metrics |
| KDAP-PRF-RealtimeAnomalyCheck | PRF | Real-time single metric anomaly check |

## Dataverse Tables

| Table | Purpose |
|-------|---------|
| kdap_ml_predictions | Store all ML prediction results |
| kdap_anomaly_alerts | Store anomaly detection alerts |
| kdap_audience_scores | Store propensity scores for customers |
| kdap_metric_history | Historical metric values for anomaly baseline |
| kdap_error_logs | Flow error logging and debugging |

## Prerequisites

- Azure Functions deployed with ML endpoints (see `src/azure-ml/functions/`)
- Power Platform environment with Dataverse
- HTTP Premium connector license
- Copilot Studio agent configured

## Deployment

### 1. Import Solution

```bash
pac solution import --path ./KDAP-ML-Integration.zip
```

### 2. Configure Environment Variables

Set the following in Power Platform Admin Center:

| Variable | Description |
|----------|-------------|
| KDAP_ML_FUNCTION_URL | Azure Functions base URL |
| KDAP_ML_API_KEY | Function app host key (store in Key Vault) |
| KDAP_ANOMALY_THRESHOLD_CRITICAL | Critical severity threshold (default: 0.9) |
| KDAP_ANOMALY_THRESHOLD_WARNING | Warning severity threshold (default: 0.7) |

### 3. Activate Flows

1. Navigate to Power Automate > Solutions > KDAP ML Integration
2. Select each flow and click "Turn On"
3. Verify connections are configured correctly

### 4. Test Flows

Use the test payloads in `/tests/power-automate/` to verify each flow:

```bash
# Budget Optimization
curl -X POST "https://[flow-url]" \
  -H "Content-Type: application/json" \
  -d @tests/power-automate/budget-optimization-test.json

# Propensity Scoring
curl -X POST "https://[flow-url]" \
  -H "Content-Type: application/json" \
  -d @tests/power-automate/propensity-scoring-test.json

# Anomaly Detection
curl -X POST "https://[flow-url]" \
  -H "Content-Type: application/json" \
  -d @tests/power-automate/anomaly-detection-test.json
```

## Copilot Studio Integration

### Budget Optimization Topic

```yaml
Trigger Phrases:
  - "optimize my budget"
  - "how should I allocate spend"
  - "budget recommendation"

Flow Input:
  sessionId: System.ConversationId
  channels: [collected from session context]

Response Display:
  - Show recommendations as adaptive card
  - Highlight increase/decrease percentages
  - Display confidence intervals
```

### Propensity Scoring Topic

```yaml
Trigger Phrases:
  - "score my audience"
  - "propensity scoring"
  - "who should I target"

Flow Input:
  sessionId: System.ConversationId
  customers: [from Dataverse query or upload]
  batchMode: true

Response Display:
  - Show segment breakdown chart
  - List top high-propensity customers
  - Offer to create targeting list
```

### Anomaly Detection Topic

```yaml
Trigger Phrases:
  - "check for anomalies"
  - "anything unusual"
  - "performance issues"

Flow Input:
  sessionId: System.ConversationId
  metrics: [from session context]
  sensitivity: "medium"

Response Display:
  - Show alert summary
  - Display critical issues first
  - Offer investigation options
```

## Error Handling

All flows implement:
- **Retry Logic**: Up to 3 retries with exponential backoff
- **Rate Limiting**: 30-second delay on 429 responses
- **Fallback Responses**: Graceful degradation when ML endpoint fails
- **Error Logging**: All errors logged to kdap_error_logs table

## Monitoring

Monitor flow health via:
1. Power Automate Analytics dashboard
2. Dataverse error_logs table queries
3. Azure Function Application Insights

## Files

```
src/power-automate/
├── flows/
│   ├── KDAP-ANL-BudgetOptimization.json
│   ├── KDAP-AUD-PropensityScoring.json
│   ├── KDAP-PRF-AnomalyDetection.json
│   └── KDAP-PRF-RealtimeAnomalyCheck.json
├── dataverse/
│   ├── kdap_ml_predictions.json
│   ├── kdap_anomaly_alerts.json
│   ├── kdap_audience_scores.json
│   ├── kdap_metric_history.json
│   └── kdap_error_logs.json
├── environment/
│   └── environment-variables.json
├── solution-manifest.json
└── README.md
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01 | Initial release with 4 flows and 5 tables |
