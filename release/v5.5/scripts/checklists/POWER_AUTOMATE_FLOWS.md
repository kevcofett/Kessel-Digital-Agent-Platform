# Power Automate Flows Build Checklist

Quick reference for building MPA flows in Power Automate.

**Flow definitions:** `release/v5.5/agents/mpa/base/flows/definitions/`
**Flow specs:** `release/v5.5/agents/mpa/base/flows/specs/`

---

## Prerequisites

- [ ] Dataverse tables created (all 7)
- [ ] Azure Functions deployed and accessible
- [ ] SharePoint site configured
- [ ] Connection references available:
  - Dataverse
  - HTTP with Azure AD
  - SharePoint (for document generation)

---

## Azure Functions Base URL

```
https://func-aragorn-mpa.azurewebsites.net
```

---

## Flow Summary

| # | Flow Name | Trigger | Status |
|---|-----------|---------|--------|
| 1 | MPA Initialize Session | PowerApps (V2) | TO BUILD |
| 2 | MPA Process Media Brief | PowerApps (V2) | TO BUILD |
| 3 | MPA Update Plan Data | PowerApps (V2) | TO BUILD |
| 4 | MPA Run Projections | PowerApps (V2) | TO BUILD |
| 5 | MPA Validate Gate | PowerApps (V2) | TO BUILD |
| 6 | MPA Generate Document | PowerApps (V2) | TO BUILD |
| 7 | MPA Get Plan Summary | PowerApps (V2) | TO BUILD |
| 8 | MPA Search Benchmarks | PowerApps (V2) | TO BUILD |
| 9 | MPA Calculate Gap | PowerApps (V2) | TO BUILD |
| 10 | MPA Calculate Budget Allocation | PowerApps (V2) | TO BUILD |
| 11 | MPA Promote Learning | PowerApps (V2) | **NOT YET BUILT** |
| 60 | MPA Log Error | Workflow (child) | TO BUILD |

---

## Flow 1: MPA Initialize Session

**Purpose:** Create or retrieve session context for user interactions

**Trigger:** PowerApps (V2)

**Inputs:**
- `userId` (Text, required) - User principal name
- `clientId` (Text, optional) - Client identifier
- `vertical` (Text, optional) - Industry vertical
- `objective` (Text, optional) - Planning objective

**Actions:**
1. HTTP POST to `/api/session`
2. Parse JSON response
3. Return session ID and status

**Azure Function Endpoint:** `/api/session`

---

## Flow 2: MPA Process Media Brief

**Purpose:** Process media brief and create plan record

**Trigger:** PowerApps (V2)

**Inputs:**
- `sessionId` (Text, required)
- `briefContent` (Text, required) - JSON brief data
- `idempotencyKey` (Text, required) - Unique key for deduplication

**Actions:**
1. Check for existing plan with idempotency key
2. If exists, return existing plan
3. HTTP POST brief to Azure Function
4. Create mpa_mediaplan record
5. Create initial mpa_planversion record
6. Return plan ID

**Key Pattern:** Idempotency check prevents duplicate plans

---

## Flow 3: MPA Update Plan Data

**Purpose:** Update section data within a plan

**Trigger:** PowerApps (V2)

**Inputs:**
- `planId` (Text, required)
- `sectionType` (Text, required) - One of 11 section types
- `sectionData` (Text, required) - JSON section content

**Actions:**
1. Query existing mpa_plandata for section
2. If exists: Update record
3. If not: Create new record
4. Update mpa_mediaplan modified timestamp

---

## Flow 4: MPA Run Projections

**Purpose:** Calculate performance projections

**Trigger:** PowerApps (V2)

**Inputs:**
- `planId` (Text, required)
- `channelMix` (Text, required) - JSON channel allocation

**Actions:**
1. Get plan context from Dataverse
2. HTTP POST to `/api/projections`
3. Parse and format results
4. Return projections JSON

**Azure Function Endpoint:** `/api/projections`

---

## Flow 5: MPA Validate Gate

**Purpose:** Validate plan readiness at gate checkpoints

**Trigger:** PowerApps (V2)

**Inputs:**
- `planId` (Text, required)
- `gateNumber` (Number, 1-4)

**Actions:**
1. Get all mpa_plandata records for plan
2. HTTP POST to `/api/validate-gate`
3. Update mpa_mediaplan gate status if passed
4. Return validation results

**Azure Function Endpoint:** `/api/validate-gate`

---

## Flow 6: MPA Generate Document

**Purpose:** Generate Word document from plan

**Trigger:** PowerApps (V2)

**Inputs:**
- `planId` (Text, required)
- `documentType` (Text, optional) - Default: full

**Actions:**
1. Get plan data from Dataverse
2. HTTP POST to `/api/generate-media-plan-document`
3. Save document to SharePoint
4. Create sharing link
5. Return document URL

**Azure Function Endpoint:** `/api/generate-media-plan-document`

**SharePoint Path:** `/Shared Documents/Media Plans/{planId}/`

---

## Flow 7: MPA Get Plan Summary

**Purpose:** Retrieve plan summary for display

**Trigger:** PowerApps (V2)

**Inputs:**
- `planId` (Text, required)

**Actions:**
1. Get mpa_mediaplan record
2. Get current mpa_planversion
3. Get section completion status
4. Return summary JSON

---

## Flow 8: MPA Search Benchmarks

**Purpose:** Query benchmark database

**Trigger:** PowerApps (V2)

**Inputs:**
- `vertical` (Text, optional)
- `channel` (Text, optional)
- `kpi` (Text, optional)

**Actions:**
1. Check feature flag: `mpa_enable_benchmark_lookup`
2. If disabled: Return fallback defaults
3. HTTP POST to `/api/benchmarks/search`
4. Return benchmark data

**Azure Function Endpoint:** `/api/benchmarks/search`

**Fallback Defaults (if disabled):**
- Display: CPM $2-15, CTR 0.05-0.30%
- Video: CPM $8-35, VCR 50-90%
- Search: CPC $0.50-10, CTR 1.5-8%
- Social: CPM $3-20, CTR 0.50-3%

---

## Flow 9: MPA Calculate Gap

**Purpose:** Identify gaps in media plan

**Trigger:** PowerApps (V2)

**Inputs:**
- `planId` (Text, required)

**Actions:**
1. Get plan data from Dataverse
2. HTTP POST to `/api/gap`
3. Return gap analysis JSON

**Azure Function Endpoint:** `/api/gap`

---

## Flow 10: MPA Calculate Budget Allocation

**Purpose:** Optimize budget across channels

**Trigger:** PowerApps (V2)

**Inputs:**
- `totalBudget` (Number, required)
- `channels` (Text, required) - JSON channel list
- `objective` (Text, required)

**Actions:**
1. HTTP POST to `/api/allocation`
2. Return allocation recommendations

**Azure Function Endpoint:** `/api/allocation`

---

## Flow 11: MPA Promote Learning

**Status:** NOT YET BUILT - Pending investigation

**Purpose:** Promote validated learnings from PostMortem to knowledge base

**Trigger:** PowerApps (V2)

**Inputs:**
- `postMortemId` (Text, required)
- `learningIds` (Text, required) - JSON array of learning IDs

**Actions:**
1. Get PostMortem record from Dataverse
2. Get selected learning records
3. Create/update knowledge base entries
4. Update learning status to "Promoted"
5. Return success/failure

**Note:** This flow was skipped due to data conflict during initial build. Investigate original skip reason before implementing.

---

## Flow 60: MPA Log Error (Child Flow)

**Purpose:** Central error logging

**Trigger:** Workflow (called from other flows)

**Inputs:**
- `flowName` (Text, required)
- `errorMessage` (Text, required)
- `errorDetails` (Text, optional)
- `severity` (Text, required) - Low/Medium/High/Critical

**Actions:**
1. Create mpa_errorlog record
2. If severity = High or Critical:
   - Send alert email to admin

**Alert Email Recipients:** Configure in flow

---

## Common Patterns

### HTTP Request Template

```json
{
  "method": "POST",
  "uri": "https://func-aragorn-mpa.azurewebsites.net/api/{endpoint}",
  "headers": {
    "Content-Type": "application/json",
    "x-functions-key": "{function_key}"
  },
  "body": {
    // Request payload
  }
}
```

### Retry Policy

```json
{
  "type": "exponential",
  "count": 3,
  "interval": "PT20S",
  "maximumInterval": "PT1M"
}
```

### Error Handling Pattern

1. Add Scope for main actions
2. Add parallel branch for error handling
3. Call MPA Log Error flow on failure
4. Return error response to Copilot

---

## Post-Build Verification

- [ ] All 10 built flows tested individually
- [ ] Flows connected in Copilot Studio
- [ ] Error handling verified
- [ ] Azure Function connectivity confirmed
- [ ] SharePoint permissions validated (for document generation)
