# KDAP v6.6 VS Code Implementation Instructions

**Version:** 1.0  
**Date:** January 20, 2026  
**Scope:** Azure Functions, Power Automate Flows, Capability Registration  
**Prerequisites:** Azure CLI, Azure Functions Core Tools, Power Platform CLI

---

## OVERVIEW

This document provides complete implementation instructions for VS Code Claude to build the infrastructure components for KDAP v6.6. Desktop Claude has completed all content deliverables (KB files, AI Builder prompts, seed data). VS Code must now implement:

1. **15 Azure Functions** across 5 function apps
2. **8 Power Automate Flows** for orchestration
3. **Capability Registration** in Dataverse
4. **Deployment** to Azure (personal environment first)

---

## PHASE 1: AZURE FUNCTION SCAFFOLDING

### Directory Structure Creation

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Create all function app directories
mkdir -p src/azure-functions/prf/learning
mkdir -p src/azure-functions/anl/competitive
mkdir -p src/azure-functions/anl/pacing
mkdir -p src/azure-functions/aud/lifecycle
mkdir -p src/azure-functions/cha/flighting
```

### Function App Initialization

Each function app needs initialization with Python runtime:

```bash
# PRF Learning Functions
cd src/azure-functions/prf/learning
func init --python --worker-runtime python
func new --name prf-learning-extract --template "HTTP trigger" --authlevel anonymous
func new --name prf-insight-cross --template "HTTP trigger" --authlevel anonymous
func new --name prf-pattern-detect --template "HTTP trigger" --authlevel anonymous

# ANL Competitive Functions
cd ../../anl/competitive
func init --python --worker-runtime python
func new --name anl-sov-analyze --template "HTTP trigger" --authlevel anonymous
func new --name anl-comp-spend --template "HTTP trigger" --authlevel anonymous

# ANL Pacing Functions
cd ../pacing
func init --python --worker-runtime python
func new --name anl-pace-recommend --template "HTTP trigger" --authlevel anonymous
func new --name anl-pace-forecast --template "HTTP trigger" --authlevel anonymous
func new --name anl-scenario-compare --template "HTTP trigger" --authlevel anonymous

# AUD Lifecycle Functions
cd ../../aud/lifecycle
func init --python --worker-runtime python
func new --name aud-cohort-migrate --template "HTTP trigger" --authlevel anonymous
func new --name aud-decay-predict --template "HTTP trigger" --authlevel anonymous
func new --name aud-lookalike-score --template "HTTP trigger" --authlevel anonymous

# CHA Flighting Functions
cd ../../cha/flighting
func init --python --worker-runtime python
func new --name cha-flight-optimize --template "HTTP trigger" --authlevel anonymous
func new --name cha-daypart-analyze --template "HTTP trigger" --authlevel anonymous
func new --name cha-season-adjust --template "HTTP trigger" --authlevel anonymous
func new --name cha-freq-cross --template "HTTP trigger" --authlevel anonymous
```

---

## PHASE 2: FUNCTION IMPLEMENTATION

### Standard Function Template

All functions follow this pattern:

```python
import logging
import json
import azure.functions as func
from datetime import datetime

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Function triggered: [FUNCTION_NAME]')
    
    try:
        # Parse request
        req_body = req.get_json()
        
        # Validate required fields
        required_fields = ['field1', 'field2']
        for field in required_fields:
            if field not in req_body:
                return func.HttpResponse(
                    json.dumps({
                        "status": "error",
                        "message": f"Missing required field: {field}"
                    }),
                    status_code=400,
                    mimetype="application/json"
                )
        
        # Execute core logic
        result = process_request(req_body)
        
        # Return success response
        return func.HttpResponse(
            json.dumps({
                "status": "success",
                "data": result,
                "timestamp": datetime.utcnow().isoformat()
            }),
            status_code=200,
            mimetype="application/json"
        )
        
    except ValueError as e:
        logging.error(f"Validation error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"status": "error", "message": str(e)}),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Internal error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"status": "error", "message": "Internal server error"}),
            status_code=500,
            mimetype="application/json"
        )

def process_request(data: dict) -> dict:
    # Implementation goes here
    pass
```

### Requirements.txt for Each Function App

**PRF Learning (src/azure-functions/prf/learning/requirements.txt):**
```
azure-functions
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
scipy>=1.11.0
```

**ANL Competitive (src/azure-functions/anl/competitive/requirements.txt):**
```
azure-functions
pandas>=2.0.0
numpy>=1.24.0
requests>=2.31.0
```

**ANL Pacing (src/azure-functions/anl/pacing/requirements.txt):**
```
azure-functions
pandas>=2.0.0
numpy>=1.24.0
scipy>=1.11.0
```

**AUD Lifecycle (src/azure-functions/aud/lifecycle/requirements.txt):**
```
azure-functions
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
```

**CHA Flighting (src/azure-functions/cha/flighting/requirements.txt):**
```
azure-functions
pandas>=2.0.0
numpy>=1.24.0
```

---

## PHASE 3: FUNCTION-SPECIFIC IMPLEMENTATIONS

### 3.1 PRF Learning Extract Function

**File:** `src/azure-functions/prf/learning/prf-learning-extract/__init__.py`

**Core Logic:**
- Parse campaign_data, metrics, and benchmarks from request
- Calculate performance deltas vs benchmarks
- Identify statistically significant variations
- Classify findings as strategic/tactical/operational
- Score confidence based on sample size and effect magnitude
- Return structured learnings array

**Key Calculations:**
```python
def calculate_learning_confidence(effect_size, sample_size, p_value):
    """Calculate confidence score 0-100 for a learning"""
    base_score = 50
    
    # Effect size contribution (0-25 points)
    if effect_size > 0.5:
        base_score += 25
    elif effect_size > 0.3:
        base_score += 15
    elif effect_size > 0.1:
        base_score += 5
    
    # Sample size contribution (0-15 points)
    if sample_size > 1000:
        base_score += 15
    elif sample_size > 500:
        base_score += 10
    elif sample_size > 100:
        base_score += 5
    
    # Statistical significance (0-10 points)
    if p_value < 0.01:
        base_score += 10
    elif p_value < 0.05:
        base_score += 7
    elif p_value < 0.1:
        base_score += 3
    
    return min(100, base_score)
```

### 3.2 PRF Pattern Detect Function

**File:** `src/azure-functions/prf/learning/prf-pattern-detect/__init__.py`

**Core Logic:**
- Load historical campaign data
- Extract configuration variables (budget, targeting, creative, etc.)
- Calculate success/failure rates for each configuration
- Use clustering to identify pattern groupings
- Calculate persistence scores based on occurrence frequency
- Identify anomalies that don't fit patterns

**Key Calculations:**
```python
def calculate_persistence_score(occurrences, total_opportunities, recency_weights):
    """Calculate persistence score 0-100 for a pattern"""
    # Base occurrence rate
    occurrence_rate = occurrences / total_opportunities if total_opportunities > 0 else 0
    
    # Apply recency weighting
    weighted_occurrences = sum(
        w * (1 if occurred else 0) 
        for w, occurred in zip(recency_weights, recent_occurrences)
    )
    weighted_rate = weighted_occurrences / sum(recency_weights)
    
    # Combine for final score
    persistence = (occurrence_rate * 0.4 + weighted_rate * 0.6) * 100
    return round(persistence, 1)
```

### 3.3 ANL SOV Analyze Function

**File:** `src/azure-functions/anl/competitive/anl-sov-analyze/__init__.py`

**Core Logic:**
- Parse brand and competitor impression/spend data
- Calculate SOV percentages by channel
- Determine trends (comparing to prior period if available)
- Classify competitive intensity by channel
- Generate insights about competitive dynamics
- Recommend strategic responses

**Key Calculations:**
```python
def calculate_sov(brand_impressions, competitor_data):
    """Calculate share of voice percentages"""
    total_impressions = brand_impressions + sum(c['impressions'] for c in competitor_data)
    
    brand_sov = (brand_impressions / total_impressions * 100) if total_impressions > 0 else 0
    
    competitor_sov = []
    for comp in competitor_data:
        comp_sov = (comp['impressions'] / total_impressions * 100) if total_impressions > 0 else 0
        competitor_sov.append({
            'competitor': comp['name'],
            'sov_pct': round(comp_sov, 1)
        })
    
    return {
        'brand_sov': round(brand_sov, 1),
        'competitors': competitor_sov
    }
```

### 3.4 ANL Pace Forecast Function

**File:** `src/azure-functions/anl/pacing/anl-pace-forecast/__init__.py`

**Core Logic:**
- Calculate current daily run rate from actuals
- Compare to planned daily rate
- Project end-of-period spend at current pace
- Calculate variance from budget
- Determine trajectory classification
- Generate correction recommendations

**Key Calculations:**
```python
def forecast_trajectory(plan, actuals, days_elapsed, days_remaining):
    """Forecast spend trajectory"""
    # Current pace
    actual_spend = sum(actuals)
    daily_run_rate = actual_spend / days_elapsed if days_elapsed > 0 else 0
    
    # Planned pace
    planned_to_date = sum(plan[:days_elapsed])
    planned_daily = plan[0] if plan else 0  # Simplified
    
    # Projection
    projected_remaining = daily_run_rate * days_remaining
    projected_total = actual_spend + projected_remaining
    
    # Variance
    total_budget = sum(plan)
    variance_amount = projected_total - total_budget
    variance_pct = (variance_amount / total_budget * 100) if total_budget > 0 else 0
    
    # Classification
    if abs(variance_pct) <= 5:
        classification = 'on-track'
    elif variance_pct > 10:
        classification = 'overspending'
    elif variance_pct < -10:
        classification = 'underspending'
    else:
        classification = 'minor-variance'
    
    return {
        'daily_run_rate': round(daily_run_rate, 2),
        'projected_total': round(projected_total, 2),
        'variance_pct': round(variance_pct, 1),
        'classification': classification
    }
```

### 3.5 AUD Decay Predict Function

**File:** `src/azure-functions/aud/lifecycle/aud-decay-predict/__init__.py`

**Core Logic:**
- Fit exponential decay model to historical quality data
- Estimate decay rate (lambda) and half-life
- Project quality at future time points
- Determine when quality will breach threshold
- Identify decay drivers
- Recommend refresh timing

**Key Calculations:**
```python
import numpy as np
from scipy.optimize import curve_fit

def exponential_decay(t, q0, decay_rate):
    """Exponential decay model: Q(t) = Q0 * e^(-λt)"""
    return q0 * np.exp(-decay_rate * t)

def estimate_decay_parameters(time_points, quality_values):
    """Fit decay model and estimate parameters"""
    try:
        popt, pcov = curve_fit(
            exponential_decay, 
            time_points, 
            quality_values,
            p0=[100, 0.01],  # Initial guesses
            bounds=([0, 0], [100, 1])
        )
        q0, decay_rate = popt
        half_life = np.log(2) / decay_rate if decay_rate > 0 else float('inf')
        
        return {
            'initial_quality': round(q0, 1),
            'decay_rate': round(decay_rate, 4),
            'half_life_days': round(half_life, 0)
        }
    except Exception:
        # Fallback to simple estimation
        return estimate_simple_decay(time_points, quality_values)
```

### 3.6 CHA Flight Optimize Function

**File:** `src/azure-functions/cha/flighting/cha-flight-optimize/__init__.py`

**Core Logic:**
- Analyze objectives to determine pattern type
- Consider budget, duration, and competitive context
- Generate period-by-period schedule
- Calculate expected reach curve
- Provide alternative pattern options

**Key Logic:**
```python
def recommend_flighting_pattern(objectives, budget, duration_days, competitive):
    """Recommend optimal flighting pattern"""
    # Determine primary objective type
    primary_obj = objectives[0]['type'] if objectives else 'awareness'
    
    # Pattern selection logic
    if primary_obj == 'awareness':
        if budget < 50000:
            pattern = 'pulsing'
        else:
            pattern = 'continuous'
    elif primary_obj == 'conversion':
        pattern = 'back-loaded'
    elif primary_obj == 'launch':
        pattern = 'front-loaded'
    elif primary_obj == 'event':
        pattern = 'burst'
    else:
        pattern = 'even'
    
    # Adjust for competitive context
    if competitive.get('high_activity_periods'):
        # Consider counter-programming
        pass
    
    return generate_schedule(pattern, budget, duration_days)
```

---

## PHASE 4: POWER AUTOMATE FLOWS

### Flow Specifications

| Flow Name | Trigger | Purpose |
|-----------|---------|---------|
| PRF_Learning_Extraction_Flow | HTTP Request | Orchestrate learning extraction pipeline |
| ANL_Competitive_Intel_Flow | HTTP Request | Run competitive intelligence analysis |
| ANL_Budget_Pacing_Flow | HTTP Request | Execute pacing analysis and forecasting |
| AUD_Lifecycle_Management_Flow | HTTP Request | Manage audience lifecycle operations |
| CHA_Flighting_Optimization_Flow | HTTP Request | Optimize flighting and timing |
| DOC_QBR_Generation_Flow | Manual | Generate QBR documents |
| DOC_Competitive_Report_Flow | Manual | Generate competitive reports |
| DOC_Deck_Creation_Flow | Manual | Create presentation decks |

### Flow Template Structure

Each flow follows this pattern:

1. **Trigger**: HTTP Request with JSON schema
2. **Initialize Variables**: Set up tracking variables
3. **Call Azure Function**: HTTP action to function endpoint
4. **Parse Response**: Parse JSON response
5. **Log to Dataverse**: Create/update capability log record
6. **Return Response**: Respond with results

### PRF_Learning_Extraction_Flow Definition

```json
{
  "definition": {
    "triggers": {
      "manual": {
        "type": "Request",
        "kind": "Http",
        "inputs": {
          "schema": {
            "type": "object",
            "properties": {
              "campaign_data": {"type": "object"},
              "metrics": {"type": "object"},
              "benchmarks": {"type": "object"}
            },
            "required": ["campaign_data", "metrics"]
          }
        }
      }
    },
    "actions": {
      "Call_Learning_Extract": {
        "type": "Http",
        "inputs": {
          "method": "POST",
          "uri": "@{parameters('PRF_Learning_Function_URL')}/api/prf-learning-extract",
          "body": "@triggerBody()"
        }
      },
      "Parse_Response": {
        "type": "ParseJson",
        "inputs": {
          "content": "@body('Call_Learning_Extract')",
          "schema": {}
        },
        "runAfter": {"Call_Learning_Extract": ["Succeeded"]}
      },
      "Log_Execution": {
        "type": "ApiConnection",
        "inputs": {
          "host": {"connection": {"name": "@parameters('$connections')['commondataservice']['connectionId']"}},
          "method": "post",
          "path": "/v2/datasets/@{encodeURIComponent(encodeURIComponent('default.cds'))}/tables/@{encodeURIComponent(encodeURIComponent('eap_capabilitylogs'))}/items"
        },
        "runAfter": {"Parse_Response": ["Succeeded"]}
      },
      "Response": {
        "type": "Response",
        "inputs": {
          "statusCode": 200,
          "body": "@body('Parse_Response')"
        },
        "runAfter": {"Log_Execution": ["Succeeded"]}
      }
    }
  }
}
```

---

## PHASE 5: CAPABILITY REGISTRATION

### Load Seed Data to Dataverse

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Verify seed file
cat base/dataverse/seed/eap_capability_v66_seed.csv

# Import using Power Platform CLI
pac data import \
  --data base/dataverse/seed/eap_capability_v66_seed.csv \
  --environment "Aragorn AI" \
  --table eap_capability
```

### Verify Registration

```bash
# Export to verify
pac data export \
  --table eap_capability \
  --output verification/capabilities_v66_verify.csv \
  --environment "Aragorn AI"

# Check count (should be 24 new + existing)
wc -l verification/capabilities_v66_verify.csv
```

---

## PHASE 6: DEPLOYMENT

### Deploy Function Apps to Azure

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "Kessel Digital"

# Deploy PRF Learning
cd src/azure-functions/prf/learning
func azure functionapp publish kdap-prf-learning --python

# Deploy ANL Competitive
cd ../../anl/competitive
func azure functionapp publish kdap-anl-competitive --python

# Deploy ANL Pacing
cd ../pacing
func azure functionapp publish kdap-anl-pacing --python

# Deploy AUD Lifecycle
cd ../../aud/lifecycle
func azure functionapp publish kdap-aud-lifecycle --python

# Deploy CHA Flighting
cd ../../cha/flighting
func azure functionapp publish kdap-cha-flighting --python
```

### Verify Deployments

```bash
# Test each endpoint
curl -X POST https://kdap-prf-learning.azurewebsites.net/api/prf-learning-extract \
  -H "Content-Type: application/json" \
  -d '{"campaign_data": {"id": "test"}, "metrics": {}, "benchmarks": {}}'

# Check function status
az functionapp show --name kdap-prf-learning --resource-group kdap-rg --query "state"
```

---

## PHASE 7: TESTING

### Test Scenarios by Function

Execute test scenarios from the build plan. Example test commands:

```bash
# PRF-L-01: Extract learnings from successful campaign
curl -X POST https://kdap-prf-learning.azurewebsites.net/api/prf-learning-extract \
  -H "Content-Type: application/json" \
  -d @test/prf/learning/test_successful_campaign.json

# CI-01: SOV analysis with 5 competitors
curl -X POST https://kdap-anl-competitive.azurewebsites.net/api/anl-sov-analyze \
  -H "Content-Type: application/json" \
  -d @test/anl/competitive/test_5_competitors.json

# BP-01: Pacing for brand awareness
curl -X POST https://kdap-anl-pacing.azurewebsites.net/api/anl-pace-recommend \
  -H "Content-Type: application/json" \
  -d @test/anl/pacing/test_awareness_objective.json
```

---

## EXECUTION CHECKLIST

### Day 1-2: PRF Functions
- [ ] Create directory structure
- [ ] Initialize prf/learning function app
- [ ] Implement prf-learning-extract
- [ ] Implement prf-insight-cross
- [ ] Implement prf-pattern-detect
- [ ] Write requirements.txt
- [ ] Local testing
- [ ] Deploy to Azure

### Day 3: ANL Competitive Functions
- [ ] Initialize anl/competitive function app
- [ ] Implement anl-sov-analyze
- [ ] Implement anl-comp-spend
- [ ] Local testing
- [ ] Deploy to Azure

### Day 4: ANL Pacing Functions
- [ ] Initialize anl/pacing function app
- [ ] Implement anl-pace-recommend
- [ ] Implement anl-pace-forecast
- [ ] Implement anl-scenario-compare
- [ ] Local testing
- [ ] Deploy to Azure

### Day 5: AUD Lifecycle Functions
- [ ] Initialize aud/lifecycle function app
- [ ] Implement aud-cohort-migrate
- [ ] Implement aud-decay-predict
- [ ] Implement aud-lookalike-score
- [ ] Local testing
- [ ] Deploy to Azure

### Day 6: CHA Flighting Functions
- [ ] Initialize cha/flighting function app
- [ ] Implement cha-flight-optimize
- [ ] Implement cha-daypart-analyze
- [ ] Implement cha-season-adjust
- [ ] Implement cha-freq-cross
- [ ] Local testing
- [ ] Deploy to Azure

### Day 7: Power Automate Flows
- [ ] Create PRF_Learning_Extraction_Flow
- [ ] Create ANL_Competitive_Intel_Flow
- [ ] Create ANL_Budget_Pacing_Flow
- [ ] Create AUD_Lifecycle_Management_Flow
- [ ] Create CHA_Flighting_Optimization_Flow
- [ ] Create DOC flows (3)
- [ ] Configure connections

### Day 8: Registration & Testing
- [ ] Load capability seed data
- [ ] Verify registrations
- [ ] Run all test scenarios
- [ ] Fix any issues
- [ ] Document results

---

## COMMIT PROTOCOL

After each major phase, commit with descriptive message:

```bash
git add .
git commit -m "feat(azure): Implement [component] - [description]"
git push origin deploy/mastercard
```

---

## TROUBLESHOOTING

### Common Issues

**Function deployment fails:**
- Check Python version compatibility (3.11 required)
- Verify requirements.txt syntax
- Check Azure subscription permissions

**Power Automate connection errors:**
- Verify Dataverse connection is active
- Check environment URL configuration
- Ensure service principal has permissions

**Capability registration fails:**
- Verify CSV format matches schema
- Check for duplicate capability_codes
- Ensure GUIDs are unique

---

**Document Version:** 1.0  
**Last Updated:** January 20, 2026  
**Author:** Desktop Claude  
**For:** VS Code Claude Implementation
