# KDAP API Reference

## Overview

KDAP exposes APIs through Azure Functions, Power Automate flows, and direct connectors.

---

## Azure Functions

### GenerateMediaPlan

**Endpoint:** `POST /api/GenerateMediaPlan`

**Purpose:** Generate media plan document based on session data.

**Request:**
```json
{
  "sessionId": "sess_abc123",
  "format": "docx",
  "template": "standard",
  "includeAppendix": true
}
```

**Response:**
```json
{
  "documentUrl": "https://storage.blob.core.windows.net/plans/plan_123.docx",
  "expiresAt": "2026-01-19T12:00:00Z",
  "pageCount": 15,
  "sections": ["executive_summary", "strategy", "channel_mix", "budget", "timeline"]
}
```

---

### CalculateProjections

**Endpoint:** `POST /api/CalculateProjections`

**Purpose:** Run analytics calculations.

**Request:**
```json
{
  "calculationType": "roas",
  "inputs": {
    "revenue": 150000,
    "spend": 50000
  }
}
```

**Calculation Types:**
| Type | Required Inputs | Output |
|------|-----------------|--------|
| roas | revenue, spend | ROAS value |
| cac | spend, customers | CAC value |
| ltv | aov, frequency, retention, margin | LTV value |
| ltv_cac_ratio | ltv, cac | Ratio + interpretation |
| breakeven | spend, margin, aov | Units needed |

**Response:**
```json
{
  "result": 2.0,
  "formula": "(150000 - 50000) / 50000",
  "interpretation": "For every $1 spent, you net $2 in profit",
  "benchmark": {
    "industry_avg": 1.5,
    "percentile": 75
  }
}
```

---

### RunMLInference

**Endpoint:** `POST /api/RunMLInference`

**Purpose:** Execute ML model predictions.

**Request:**
```json
{
  "model": "churn",
  "features": {
    "tenure_months": 8,
    "monthly_spend": 125.50,
    "transaction_count": 12,
    "support_tickets": 3,
    "last_activity_days": 45,
    "email_engagement": 0.15,
    "product_category": "Electronics"
  }
}
```

**Models Available:**
- churn, mmm, lookalike, response_curve, budget_optimizer, propensity, anomaly

**Response:**
```json
{
  "model": "churn",
  "prediction": {
    "churn_probability": 0.73,
    "risk_tier": "HIGH",
    "confidence": 0.89
  },
  "latency_ms": 45,
  "model_version": "1.2.3"
}
```

---

### SearchBenchmarks

**Endpoint:** `POST /api/SearchBenchmarks`

**Purpose:** Query industry benchmarks.

**Request:**
```json
{
  "vertical": "Retail",
  "channel": "Search",
  "metric": "ctr",
  "region": "US"
}
```

**Response:**
```json
{
  "benchmarks": [
    {
      "metric": "ctr",
      "value": 0.032,
      "percentile_25": 0.018,
      "percentile_50": 0.028,
      "percentile_75": 0.042,
      "source": "Industry Report 2025",
      "updated_at": "2025-12-15"
    }
  ]
}
```

---

## Power Automate Flows

### MPA-CreateSession

**Trigger:** HTTP Request

**Purpose:** Initialize a new planning session.

**Input:**
```json
{
  "userId": "user@company.com",
  "pathway": "STANDARD",
  "vertical": "Retail"
}
```

**Output:**
```json
{
  "sessionId": "sess_abc123",
  "createdAt": "2026-01-19T10:00:00Z",
  "pathway": "STANDARD",
  "currentStep": 1,
  "expiresAt": "2026-01-19T22:00:00Z"
}
```

---

### MPA-SaveProgress

**Trigger:** HTTP Request

**Purpose:** Persist session state.

**Input:**
```json
{
  "sessionId": "sess_abc123",
  "stepNumber": 3,
  "stepData": {
    "objective": "Brand Awareness",
    "budget": 500000,
    "timeline": "Q2 2026"
  }
}
```

**Output:**
```json
{
  "saved": true,
  "sessionId": "sess_abc123",
  "stepNumber": 3,
  "updatedAt": "2026-01-19T10:15:00Z"
}
```

---

### MPA-GetKPIDefinitions

**Trigger:** HTTP Request

**Purpose:** Load KPI reference data.

**Input:**
```json
{
  "category": "performance",
  "vertical": "B2B"
}
```

**Output:**
```json
{
  "kpis": [
    {
      "name": "ROAS",
      "formula": "(Revenue - Spend) / Spend",
      "description": "Return on ad spend",
      "benchmark": 2.5,
      "verticalAdjustment": 0.8
    },
    {
      "name": "CAC",
      "formula": "Marketing Spend / New Customers",
      "description": "Customer acquisition cost",
      "benchmark": 250,
      "verticalAdjustment": 1.5
    }
  ]
}
```

---

### MPA-RouteToAgent

**Trigger:** HTTP Request

**Purpose:** Route request to specialist agent.

**Input:**
```json
{
  "sessionId": "sess_abc123",
  "userMessage": "Calculate my expected ROAS",
  "context": {
    "currentStep": 5,
    "budget": 500000
  }
}
```

**Output:**
```json
{
  "targetAgent": "ANL",
  "confidence": 0.95,
  "routingReason": "calculation_request",
  "agentEndpoint": "/agents/anl/chat"
}
```

---

## Benchmark Connectors

### Media Benchmark Connector

**Location:** `src/benchmarks/connectors/mediaBenchmark.ts`

**Methods:**
```typescript
interface MediaBenchmarkConnector {
  // Get channel benchmarks
  getChannelBenchmarks(params: {
    channel: string;
    vertical: string;
    region?: string;
  }): Promise<ChannelBenchmark[]>;
  
  // Get vertical benchmarks
  getVerticalBenchmarks(vertical: string): Promise<VerticalBenchmark>;
  
  // Get trending metrics
  getTrendingMetrics(params: {
    channel: string;
    metric: string;
    period: 'week' | 'month' | 'quarter';
  }): Promise<TrendData[]>;
}
```

---

### Financial Benchmark Connector

**Location:** `src/benchmarks/connectors/financialBenchmark.ts`

**Methods:**
```typescript
interface FinancialBenchmarkConnector {
  // Get industry financial metrics
  getIndustryMetrics(params: {
    vertical: string;
    metric: 'cac' | 'ltv' | 'payback' | 'margin';
  }): Promise<FinancialMetric>;
  
  // Get CAC benchmarks by channel
  getCACByChannel(vertical: string): Promise<ChannelCAC[]>;
  
  // Get LTV benchmarks
  getLTVBenchmarks(vertical: string): Promise<LTVBenchmark>;
}
```

---

### Customer Benchmark Connector

**Location:** `src/benchmarks/connectors/customerBenchmark.ts`

**Methods:**
```typescript
interface CustomerBenchmarkConnector {
  // Get retention benchmarks
  getRetentionBenchmarks(vertical: string): Promise<RetentionBenchmark>;
  
  // Get churn benchmarks
  getChurnBenchmarks(vertical: string): Promise<ChurnBenchmark>;
  
  // Get NPS benchmarks
  getNPSBenchmarks(vertical: string): Promise<NPSBenchmark>;
}
```

---

## Dataverse Tables

### mpa_session

| Column | Type | Description |
|--------|------|-------------|
| mpa_sessionid | GUID | Primary key |
| mpa_userid | String | User email |
| mpa_pathway | OptionSet | EXPRESS/STANDARD/GUIDED/AUDIT |
| mpa_currentstep | Integer | Current step number |
| mpa_status | OptionSet | Active/Complete/Expired |
| mpa_sessiondata | Multiline | JSON session state |
| createdon | DateTime | Created timestamp |
| modifiedon | DateTime | Last modified |

### mpa_benchmark

| Column | Type | Description |
|--------|------|-------------|
| mpa_benchmarkid | GUID | Primary key |
| mpa_name | String | Benchmark name |
| mpa_vertical | Lookup | Vertical reference |
| mpa_channel | Lookup | Channel reference |
| mpa_metric | String | Metric name |
| mpa_value | Decimal | Benchmark value |
| mpa_percentile25 | Decimal | 25th percentile |
| mpa_percentile75 | Decimal | 75th percentile |
| mpa_source | String | Data source |
| mpa_effectivedate | DateTime | Valid from date |

### mpa_kpi

| Column | Type | Description |
|--------|------|-------------|
| mpa_kpiid | GUID | Primary key |
| mpa_name | String | KPI name |
| mpa_formula | String | Calculation formula |
| mpa_description | Multiline | KPI description |
| mpa_category | OptionSet | Category |
| mpa_unit | String | Unit of measure |

---

## Authentication

### Azure AD Token

All APIs require Azure AD authentication:

```bash
# Get token
TOKEN=$(az account get-access-token \
  --resource $DATAVERSE_URL \
  --query accessToken -o tsv)

# Use in request
curl -H "Authorization: Bearer $TOKEN" \
  $FUNCTION_URL/api/CalculateProjections
```

### API Key (Functions)

For Azure Functions with function-level auth:

```bash
curl -H "x-functions-key: $FUNCTION_KEY" \
  $FUNCTION_URL/api/CalculateProjections
```

---

## Rate Limits

| API | Limit | Window |
|-----|-------|--------|
| Azure Functions | 1000 req | per minute |
| Power Automate | 100 req | per minute |
| Dataverse | 6000 req | per 5 minutes |
| Benchmark Connectors | 100 req | per minute |

---

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| 400 | Bad Request | Check input format |
| 401 | Unauthorized | Refresh token |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource exists |
| 429 | Rate Limited | Implement backoff |
| 500 | Server Error | Retry with exponential backoff |

**Error Response Format:**
```json
{
  "error": {
    "code": "InvalidInput",
    "message": "Revenue must be a positive number",
    "details": {
      "field": "revenue",
      "value": -100,
      "constraint": "minimum: 0"
    }
  }
}
```

---

## SDK Usage

### Python

```python
from kdap_sdk import KDAPClient

client = KDAPClient(
    environment_url="https://org.crm.dynamics.com",
    client_id="...",
    client_secret="..."
)

# Calculate ROAS
result = client.calculate("roas", revenue=150000, spend=50000)
print(f"ROAS: {result['result']}")

# Get benchmarks
benchmarks = client.benchmarks.get(
    vertical="Retail",
    channel="Search",
    metric="ctr"
)
```

### TypeScript

```typescript
import { KDAPClient } from '@kdap/sdk';

const client = new KDAPClient({
  environmentUrl: 'https://org.crm.dynamics.com',
  clientId: '...',
  clientSecret: '...'
});

// Run ML prediction
const prediction = await client.ml.predict('churn', {
  tenure_months: 8,
  monthly_spend: 125.50
});

console.log(`Churn Risk: ${prediction.risk_tier}`);
```
