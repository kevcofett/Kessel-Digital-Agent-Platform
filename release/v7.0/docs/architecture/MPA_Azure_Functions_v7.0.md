# MPA v6.0 Azure Functions Specification

**Document:** MPA_Azure_Functions_v7.0.md  
**Version:** 1.0  
**Date:** January 18, 2026  
**Status:** Implementation Ready  
**Environment:** Personal (Aragorn AI) Only  
**Purpose:** Detailed specifications for Azure Functions that provide enhanced computation capabilities in the unrestricted Personal environment

---

## TABLE OF CONTENTS

1. [Overview](#part-1-overview)
2. [Architecture](#part-2-architecture)
3. [Function Catalog](#part-3-function-catalog)
4. [ANL Agent Functions](#part-4-anl-agent-functions)
5. [AUD Agent Functions](#part-5-aud-agent-functions)
6. [CHA Agent Functions](#part-6-cha-agent-functions)
7. [SPO Agent Functions](#part-7-spo-agent-functions)
8. [PRF Agent Functions](#part-8-prf-agent-functions)
9. [Shared Utilities](#part-9-shared-utilities)
10. [Deployment Configuration](#part-10-deployment-configuration)
11. [Testing Strategy](#part-11-testing-strategy)
12. [Error Handling](#part-12-error-handling)
13. [Security Configuration](#part-13-security-configuration)
14. [Monitoring and Observability](#part-14-monitoring-and-observability)

---

## PART 1: OVERVIEW

### 1.1 Purpose

Azure Functions provide enhanced computation capabilities in the Personal (Aragorn AI) environment where DLP restrictions do not apply. These functions deliver:

- **Higher precision calculations** than AI Builder prompts can achieve
- **Deterministic outputs** for financial calculations
- **Complex algorithmic processing** (optimization, simulation)
- **Lower latency** for computationally intensive operations
- **Version-controlled logic** with unit test coverage

### 1.2 Environment Scope

| Environment | Azure Functions | AI Builder Fallback |
|-------------|-----------------|---------------------|
| Personal (Aragorn AI) | PRIMARY | FALLBACK (priority 2) |
| Mastercard | NOT AVAILABLE | PRIMARY (only option) |

### 1.3 Capability Abstraction Integration

Azure Functions are registered in `eap_capability_implementation` with:
- `implementation_type`: AZURE_FUNCTION
- `environment_code`: PERSONAL
- `priority_order`: 1 (preferred over AI Builder)
- `fallback_implementation_id`: Points to AI Builder implementation

When a capability is invoked:
1. Dispatcher queries implementations for capability + environment
2. Selects lowest priority_order where is_enabled = true
3. Calls Azure Function (priority 1) if available
4. Falls back to AI Builder (priority 2) if function fails

### 1.4 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Azure Functions | v4 |
| Language | Python | 3.11 |
| Framework | FastAPI (HTTP triggers) | 0.104+ |
| Compute Libraries | NumPy, SciPy, Pandas | Latest |
| ML Libraries | scikit-learn | Latest |
| Optimization | scipy.optimize | Latest |
| Hosting | Azure Functions Consumption Plan | N/A |
| Authentication | Azure AD / Function Keys | N/A |

---

## PART 2: ARCHITECTURE

### 2.1 Function App Structure

```
mpa-functions-personal/
â”œâ”€â”€ host.json
â”œâ”€â”€ local.settings.json
â”œâ”€â”€ requirements.txt
â”œâ”€â”€ shared/
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ models.py              # Pydantic models for request/response
â”‚   â”œâ”€â”€ validators.py          # Input validation utilities
â”‚   â”œâ”€â”€ exceptions.py          # Custom exception classes
â”‚   â”œâ”€â”€ logging_config.py      # Structured logging setup
â”‚   â”œâ”€â”€ telemetry.py           # Telemetry helper functions
â”‚   â””â”€â”€ dataverse_client.py    # Dataverse API wrapper
â”œâ”€â”€ anl_functions/
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ marginal_return/
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â””â”€â”€ function.py
â”‚   â”œâ”€â”€ scenario_compare/
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â””â”€â”€ function.py
â”‚   â”œâ”€â”€ projection/
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â””â”€â”€ function.py
â”‚   â”œâ”€â”€ bayesian_inference/
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â””â”€â”€ function.py
â”‚   â””â”€â”€ causal_analysis/
â”‚       â”œâ”€â”€ __init__.py
â”‚       â””â”€â”€ function.py
â”œâ”€â”€ aud_functions/
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ segment_priority/
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â””â”€â”€ function.py
â”‚   â”œâ”€â”€ ltv_calculation/
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â””â”€â”€ function.py
â”‚   â””â”€â”€ propensity_scoring/
â”‚       â”œâ”€â”€ __init__.py
â”‚       â””â”€â”€ function.py
â”œâ”€â”€ cha_functions/
â”‚   â”œâ”€â”€ __init__.py
â”‚   â””â”€â”€ channel_optimization/
â”‚       â”œâ”€â”€ __init__.py
â”‚       â””â”€â”€ function.py
â”œâ”€â”€ spo_functions/
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ fee_waterfall/
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â””â”€â”€ function.py
â”‚   â””â”€â”€ nbi_calculation/
â”‚       â”œâ”€â”€ __init__.py
â”‚       â””â”€â”€ function.py
â”œâ”€â”€ prf_functions/
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ anomaly_detection/
â”‚   â”‚   â”œâ”€â”€ __init__.py
â”‚   â”‚   â””â”€â”€ function.py
â”‚   â””â”€â”€ attribution_analysis/
â”‚       â”œâ”€â”€ __init__.py
â”‚       â””â”€â”€ function.py
â””â”€â”€ tests/
    â”œâ”€â”€ __init__.py
    â”œâ”€â”€ test_anl_functions.py
    â”œâ”€â”€ test_aud_functions.py
    â”œâ”€â”€ test_cha_functions.py
    â”œâ”€â”€ test_spo_functions.py
    â”œâ”€â”€ test_prf_functions.py
    â””â”€â”€ fixtures/
        â””â”€â”€ test_data.json
```

### 2.2 Standard Request/Response Format

All functions use consistent request/response schemas.

**Standard Request:**
```json
{
  "capability_code": "CALCULATE_MARGINAL_RETURN",
  "session_id": "guid",
  "request_id": "guid",
  "inputs": {
    // Capability-specific inputs
  },
  "options": {
    "confidence_threshold": 0.8,
    "max_iterations": 1000,
    "include_diagnostics": false
  }
}
```

**Standard Response:**
```json
{
  "status": "success",
  "capability_code": "CALCULATE_MARGINAL_RETURN",
  "request_id": "guid",
  "execution_time_ms": 245,
  "result": {
    // Capability-specific outputs
  },
  "confidence": 0.92,
  "diagnostics": {
    "iterations": 847,
    "convergence": true,
    "warnings": []
  },
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "capability_code": "CALCULATE_MARGINAL_RETURN",
  "request_id": "guid",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Budget must be positive",
    "details": {
      "field": "inputs.total_budget",
      "value": -10000,
      "constraint": "must be > 0"
    }
  },
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

### 2.3 Shared Models (Pydantic)

```python
# shared/models.py

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INSUFFICIENT = "insufficient"

class FunctionStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    PARTIAL = "partial"

class BaseRequest(BaseModel):
    capability_code: str
    session_id: str
    request_id: str
    inputs: Dict[str, Any]
    options: Optional[Dict[str, Any]] = {}

class Diagnostics(BaseModel):
    iterations: Optional[int] = None
    convergence: Optional[bool] = None
    warnings: List[str] = []
    computation_details: Optional[Dict[str, Any]] = None

class Metadata(BaseModel):
    function_version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class BaseResponse(BaseModel):
    status: FunctionStatus
    capability_code: str
    request_id: str
    execution_time_ms: int
    result: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    confidence_level: Optional[ConfidenceLevel] = None
    diagnostics: Optional[Diagnostics] = None
    metadata: Metadata

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    status: FunctionStatus = FunctionStatus.ERROR
    capability_code: str
    request_id: str
    error: ErrorDetail
    metadata: Metadata
```

---

## PART 3: FUNCTION CATALOG

### 3.1 Complete Function Inventory

| Function ID | Agent | Capability Code | Endpoint | Priority |
|-------------|-------|-----------------|----------|----------|
| ANL-001 | ANL | CALCULATE_MARGINAL_RETURN | /api/anl/marginal-return | 1 |
| ANL-002 | ANL | COMPARE_SCENARIOS | /api/anl/scenario-compare | 1 |
| ANL-003 | ANL | GENERATE_PROJECTIONS | /api/anl/projection | 1 |
| ANL-004 | ANL | APPLY_BAYESIAN_INFERENCE | /api/anl/bayesian | 1 |
| ANL-005 | ANL | ANALYZE_CAUSALITY | /api/anl/causal | 1 |
| AUD-001 | AUD | PRIORITIZE_SEGMENTS | /api/aud/segment-priority | 1 |
| AUD-002 | AUD | CALCULATE_LTV | /api/aud/ltv | 1 |
| AUD-003 | AUD | SCORE_PROPENSITY | /api/aud/propensity | 1 |
| CHA-001 | CHA | OPTIMIZE_CHANNEL_MIX | /api/cha/optimize | 1 |
| SPO-001 | SPO | CALCULATE_FEE_WATERFALL | /api/spo/fee-waterfall | 1 |
| SPO-002 | SPO | CALCULATE_NBI | /api/spo/nbi | 1 |
| PRF-001 | PRF | DETECT_ANOMALIES | /api/prf/anomaly | 1 |
| PRF-002 | PRF | ANALYZE_ATTRIBUTION | /api/prf/attribution | 1 |

### 3.2 Capability Implementation Registration

Each function must be registered in `eap_capability_implementation`:

```csv
capability_code,environment_code,implementation_type,implementation_reference,priority_order,is_enabled,timeout_seconds
CALCULATE_MARGINAL_RETURN,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/anl/marginal-return,1,true,30
CALCULATE_MARGINAL_RETURN,PERSONAL,AI_BUILDER_PROMPT,ANL_MarginalReturn_Prompt,2,true,30
COMPARE_SCENARIOS,PERSONAL,AZURE_FUNCTION,https://mpa-functions-personal.azurewebsites.net/api/anl/scenario-compare,1,true,45
COMPARE_SCENARIOS,PERSONAL,AI_BUILDER_PROMPT,ANL_ScenarioCompare_Prompt,2,true,45
...
```

---

## PART 4: ANL AGENT FUNCTIONS

### 4.1 ANL-001: Calculate Marginal Return

**Endpoint:** `/api/anl/marginal-return`  
**Capability Code:** `CALCULATE_MARGINAL_RETURN`  
**Method:** POST  
**Timeout:** 30 seconds

**Purpose:** Calculate marginal return curves for budget allocation optimization. Uses diminishing returns modeling with response curve fitting.

**Request Schema:**
```json
{
  "capability_code": "CALCULATE_MARGINAL_RETURN",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "channels": [
      {
        "channel_code": "PAID_SEARCH",
        "current_spend": 50000,
        "historical_performance": {
          "spend_levels": [10000, 25000, 50000, 75000, 100000],
          "conversion_rates": [0.02, 0.025, 0.028, 0.029, 0.0295]
        }
      }
    ],
    "total_budget": 500000,
    "optimization_goal": "MAXIMIZE_CONVERSIONS",
    "constraints": {
      "min_channel_spend": 5000,
      "max_channel_concentration": 0.4
    }
  },
  "options": {
    "curve_type": "logarithmic",
    "confidence_threshold": 0.8,
    "include_diagnostics": true
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "CALCULATE_MARGINAL_RETURN",
  "request_id": "string",
  "execution_time_ms": 245,
  "result": {
    "marginal_returns": [
      {
        "channel_code": "PAID_SEARCH",
        "current_marginal_return": 0.00045,
        "curve_parameters": {
          "alpha": 0.0003,
          "beta": 0.85,
          "saturation_point": 125000
        },
        "recommended_spend_change": 15000,
        "expected_lift": 0.08
      }
    ],
    "optimal_allocation": {
      "PAID_SEARCH": 65000,
      "PAID_SOCIAL": 120000,
      "DISPLAY": 80000,
      "VIDEO": 95000,
      "OTHER": 140000
    },
    "total_expected_conversions": 14250,
    "lift_vs_current": 0.12
  },
  "confidence": 0.87,
  "confidence_level": "high",
  "diagnostics": {
    "iterations": 847,
    "convergence": true,
    "r_squared": 0.94,
    "warnings": ["PAID_SOCIAL approaching saturation point"]
  },
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

**Implementation:**
```python
# anl_functions/marginal_return/function.py

import azure.functions as func
import json
import numpy as np
from scipy.optimize import minimize, curve_fit
from typing import Dict, List, Any
import time

from shared.models import BaseRequest, BaseResponse, Diagnostics, Metadata, FunctionStatus, ConfidenceLevel
from shared.validators import validate_positive, validate_channels
from shared.exceptions import ValidationError, CalculationError
from shared.telemetry import log_execution

def logarithmic_response(spend: float, alpha: float, beta: float) -> float:
    """Logarithmic response curve: y = alpha * log(1 + beta * x)"""
    return alpha * np.log(1 + beta * spend)

def power_response(spend: float, alpha: float, beta: float) -> float:
    """Power response curve: y = alpha * x^beta"""
    return alpha * np.power(spend, beta)

def fit_response_curve(spend_levels: List[float], performance: List[float], curve_type: str = "logarithmic"):
    """Fit response curve to historical data."""
    spend_array = np.array(spend_levels)
    perf_array = np.array(performance)
    
    if curve_type == "logarithmic":
        popt, pcov = curve_fit(
            lambda x, a, b: logarithmic_response(x, a, b),
            spend_array, perf_array,
            p0=[0.001, 0.0001],
            bounds=([0, 0], [1, 1]),
            maxfev=5000
        )
        return {"alpha": popt[0], "beta": popt[1], "curve_type": "logarithmic"}
    elif curve_type == "power":
        popt, pcov = curve_fit(
            lambda x, a, b: power_response(x, a, b),
            spend_array, perf_array,
            p0=[0.001, 0.8],
            bounds=([0, 0.1], [1, 1]),
            maxfev=5000
        )
        return {"alpha": popt[0], "beta": popt[1], "curve_type": "power"}
    else:
        raise ValueError(f"Unknown curve type: {curve_type}")

def calculate_marginal_return(params: Dict, spend: float, curve_type: str) -> float:
    """Calculate marginal return (derivative of response curve) at given spend level."""
    alpha = params["alpha"]
    beta = params["beta"]
    
    if curve_type == "logarithmic":
        # d/dx [alpha * log(1 + beta * x)] = alpha * beta / (1 + beta * x)
        return alpha * beta / (1 + beta * spend)
    elif curve_type == "power":
        # d/dx [alpha * x^beta] = alpha * beta * x^(beta-1)
        if spend <= 0:
            return float('inf')
        return alpha * beta * np.power(spend, beta - 1)
    else:
        raise ValueError(f"Unknown curve type: {curve_type}")

def optimize_allocation(
    channels: List[Dict],
    total_budget: float,
    constraints: Dict,
    curve_type: str
) -> Dict[str, Any]:
    """
    Optimize budget allocation across channels using marginal return equalization.
    Uses scipy.optimize.minimize with SLSQP method.
    """
    n_channels = len(channels)
    channel_codes = [c["channel_code"] for c in channels]
    
    # Fit curves for each channel
    channel_params = {}
    for channel in channels:
        params = fit_response_curve(
            channel["historical_performance"]["spend_levels"],
            channel["historical_performance"]["conversion_rates"],
            curve_type
        )
        channel_params[channel["channel_code"]] = params
    
    # Objective: maximize total response (negative for minimization)
    def objective(allocation):
        total_response = 0
        for i, code in enumerate(channel_codes):
            params = channel_params[code]
            if curve_type == "logarithmic":
                total_response += logarithmic_response(allocation[i], params["alpha"], params["beta"])
            else:
                total_response += power_response(allocation[i], params["alpha"], params["beta"])
        return -total_response  # Negative because we minimize
    
    # Constraints
    constraint_list = []
    
    # Budget constraint: sum of allocations = total_budget
    constraint_list.append({
        "type": "eq",
        "fun": lambda x: np.sum(x) - total_budget
    })
    
    # Bounds: min/max per channel
    min_spend = constraints.get("min_channel_spend", 0)
    max_concentration = constraints.get("max_channel_concentration", 1.0)
    max_spend = total_budget * max_concentration
    
    bounds = [(min_spend, max_spend) for _ in range(n_channels)]
    
    # Initial guess: equal allocation
    x0 = np.array([total_budget / n_channels] * n_channels)
    
    # Optimize
    result = minimize(
        objective,
        x0,
        method="SLSQP",
        bounds=bounds,
        constraints=constraint_list,
        options={"maxiter": 1000, "ftol": 1e-9}
    )
    
    # Build output
    optimal_allocation = {channel_codes[i]: float(result.x[i]) for i in range(n_channels)}
    
    # Calculate marginal returns at optimal allocation
    marginal_returns = []
    warnings = []
    
    for i, code in enumerate(channel_codes):
        params = channel_params[code]
        spend = result.x[i]
        mr = calculate_marginal_return(params, spend, curve_type)
        
        # Check saturation
        saturation_point = params["alpha"] / (params["beta"] * 0.01) if curve_type == "logarithmic" else None
        if saturation_point and spend > saturation_point * 0.8:
            warnings.append(f"{code} approaching saturation point")
        
        marginal_returns.append({
            "channel_code": code,
            "current_marginal_return": mr,
            "curve_parameters": params,
            "recommended_spend_change": spend - channels[i]["current_spend"],
            "saturation_point": saturation_point
        })
    
    return {
        "optimal_allocation": optimal_allocation,
        "marginal_returns": marginal_returns,
        "convergence": result.success,
        "iterations": result.nit,
        "warnings": warnings
    }

async def main(req: func.HttpRequest) -> func.HttpResponse:
    """HTTP trigger for marginal return calculation."""
    start_time = time.time()
    
    try:
        # Parse request
        req_body = req.get_json()
        request = BaseRequest(**req_body)
        
        # Validate inputs
        inputs = request.inputs
        validate_positive(inputs.get("total_budget"), "total_budget")
        validate_channels(inputs.get("channels", []))
        
        # Get options
        options = request.options or {}
        curve_type = options.get("curve_type", "logarithmic")
        include_diagnostics = options.get("include_diagnostics", False)
        
        # Perform calculation
        result = optimize_allocation(
            channels=inputs["channels"],
            total_budget=inputs["total_budget"],
            constraints=inputs.get("constraints", {}),
            curve_type=curve_type
        )
        
        # Calculate confidence based on data quality and convergence
        confidence = 0.9 if result["convergence"] else 0.6
        confidence_level = ConfidenceLevel.HIGH if confidence >= 0.8 else ConfidenceLevel.MEDIUM
        
        # Build response
        execution_time = int((time.time() - start_time) * 1000)
        
        response = BaseResponse(
            status=FunctionStatus.SUCCESS,
            capability_code=request.capability_code,
            request_id=request.request_id,
            execution_time_ms=execution_time,
            result={
                "marginal_returns": result["marginal_returns"],
                "optimal_allocation": result["optimal_allocation"]
            },
            confidence=confidence,
            confidence_level=confidence_level,
            diagnostics=Diagnostics(
                iterations=result["iterations"],
                convergence=result["convergence"],
                warnings=result["warnings"]
            ) if include_diagnostics else None,
            metadata=Metadata(function_version="1.0.0")
        )
        
        # Log telemetry
        log_execution(
            capability_code=request.capability_code,
            session_id=request.session_id,
            request_id=request.request_id,
            execution_time_ms=execution_time,
            status="success"
        )
        
        return func.HttpResponse(
            response.json(),
            status_code=200,
            mimetype="application/json"
        )
        
    except ValidationError as e:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error": {"code": "VALIDATION_ERROR", "message": str(e)},
                "metadata": {"function_version": "1.0.0"}
            }),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error": {"code": "INTERNAL_ERROR", "message": str(e)},
                "metadata": {"function_version": "1.0.0"}
            }),
            status_code=500,
            mimetype="application/json"
        )
```

### 4.2 ANL-002: Compare Scenarios

**Endpoint:** `/api/anl/scenario-compare`  
**Capability Code:** `COMPARE_SCENARIOS`  
**Method:** POST  
**Timeout:** 45 seconds

**Purpose:** Compare multiple budget allocation scenarios with statistical analysis and recommendation ranking.

**Request Schema:**
```json
{
  "capability_code": "COMPARE_SCENARIOS",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "scenarios": [
      {
        "scenario_id": "aggressive_digital",
        "scenario_name": "Aggressive Digital",
        "allocation": {
          "PAID_SEARCH": 150000,
          "PAID_SOCIAL": 200000,
          "DISPLAY": 50000,
          "VIDEO": 100000
        },
        "assumptions": {
          "cpm_paid_search": 3.50,
          "conversion_rate_paid_social": 0.025
        }
      },
      {
        "scenario_id": "balanced",
        "scenario_name": "Balanced Approach",
        "allocation": {
          "PAID_SEARCH": 100000,
          "PAID_SOCIAL": 100000,
          "DISPLAY": 100000,
          "VIDEO": 100000,
          "TRADITIONAL": 100000
        }
      }
    ],
    "evaluation_criteria": ["conversions", "reach", "efficiency", "risk"],
    "weights": {
      "conversions": 0.4,
      "reach": 0.2,
      "efficiency": 0.3,
      "risk": 0.1
    },
    "benchmark_data": {
      "vertical": "RETAIL",
      "region": "NORTH_AMERICA"
    }
  },
  "options": {
    "monte_carlo_simulations": 1000,
    "confidence_interval": 0.95,
    "include_sensitivity": true
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "COMPARE_SCENARIOS",
  "request_id": "string",
  "execution_time_ms": 1250,
  "result": {
    "scenario_results": [
      {
        "scenario_id": "aggressive_digital",
        "projected_metrics": {
          "conversions": {
            "expected": 12500,
            "ci_lower": 11200,
            "ci_upper": 13800
          },
          "reach": {
            "expected": 2500000,
            "ci_lower": 2200000,
            "ci_upper": 2800000
          },
          "cpa": {
            "expected": 40.00,
            "ci_lower": 36.23,
            "ci_upper": 44.64
          }
        },
        "risk_assessment": {
          "volatility": 0.18,
          "downside_risk": 0.12,
          "concentration_risk": "medium"
        },
        "composite_score": 0.82
      }
    ],
    "ranking": [
      {"rank": 1, "scenario_id": "aggressive_digital", "score": 0.82},
      {"rank": 2, "scenario_id": "balanced", "score": 0.76}
    ],
    "recommendation": {
      "preferred_scenario": "aggressive_digital",
      "rationale": "Higher expected conversions with acceptable risk profile",
      "trade_offs": [
        "Higher concentration in digital channels",
        "Less brand-building exposure"
      ]
    },
    "sensitivity_analysis": {
      "aggressive_digital": {
        "cpm_sensitivity": -0.15,
        "conversion_rate_sensitivity": 0.22
      }
    }
  },
  "confidence": 0.88,
  "confidence_level": "high",
  "diagnostics": {
    "simulations_completed": 1000,
    "convergence": true
  },
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

**Implementation:**
```python
# anl_functions/scenario_compare/function.py

import azure.functions as func
import json
import numpy as np
from scipy import stats
from typing import Dict, List, Any, Tuple
import time

from shared.models import BaseRequest, BaseResponse, Diagnostics, Metadata, FunctionStatus
from shared.validators import validate_scenarios
from shared.telemetry import log_execution

def simulate_scenario(
    allocation: Dict[str, float],
    assumptions: Dict[str, float],
    benchmarks: Dict[str, Any],
    n_simulations: int = 1000
) -> Dict[str, Any]:
    """
    Monte Carlo simulation for scenario outcomes.
    Returns distribution statistics for key metrics.
    """
    # Base performance rates (would come from benchmarks in production)
    base_conversion_rates = {
        "PAID_SEARCH": 0.03,
        "PAID_SOCIAL": 0.02,
        "DISPLAY": 0.008,
        "VIDEO": 0.015,
        "TRADITIONAL": 0.005
    }
    
    base_cpms = {
        "PAID_SEARCH": 3.50,
        "PAID_SOCIAL": 8.00,
        "DISPLAY": 2.50,
        "VIDEO": 15.00,
        "TRADITIONAL": 25.00
    }
    
    # Override with assumptions
    for key, value in assumptions.items():
        if key.startswith("cpm_"):
            channel = key.replace("cpm_", "").upper()
            if channel in base_cpms:
                base_cpms[channel] = value
        elif key.startswith("conversion_rate_"):
            channel = key.replace("conversion_rate_", "").upper()
            if channel in base_conversion_rates:
                base_conversion_rates[channel] = value
    
    # Run simulations
    conversions_sim = []
    reach_sim = []
    spend_sim = []
    
    for _ in range(n_simulations):
        total_conversions = 0
        total_reach = 0
        total_spend = sum(allocation.values())
        
        for channel, spend in allocation.items():
            if spend <= 0:
                continue
                
            # Add noise to rates
            conv_rate = base_conversion_rates.get(channel, 0.01) * np.random.lognormal(0, 0.15)
            cpm = base_cpms.get(channel, 10.0) * np.random.lognormal(0, 0.10)
            
            # Calculate impressions and conversions
            impressions = (spend / cpm) * 1000
            conversions = impressions * conv_rate
            
            total_conversions += conversions
            total_reach += impressions * 0.6  # Assume 60% unique reach
        
        conversions_sim.append(total_conversions)
        reach_sim.append(total_reach)
        spend_sim.append(total_spend)
    
    conversions_array = np.array(conversions_sim)
    reach_array = np.array(reach_sim)
    spend_array = np.array(spend_sim)
    
    return {
        "conversions": {
            "expected": float(np.mean(conversions_array)),
            "std": float(np.std(conversions_array)),
            "ci_lower": float(np.percentile(conversions_array, 2.5)),
            "ci_upper": float(np.percentile(conversions_array, 97.5))
        },
        "reach": {
            "expected": float(np.mean(reach_array)),
            "std": float(np.std(reach_array)),
            "ci_lower": float(np.percentile(reach_array, 2.5)),
            "ci_upper": float(np.percentile(reach_array, 97.5))
        },
        "cpa": {
            "expected": float(np.mean(spend_array / conversions_array)),
            "ci_lower": float(np.percentile(spend_array / conversions_array, 2.5)),
            "ci_upper": float(np.percentile(spend_array / conversions_array, 97.5))
        }
    }

def calculate_risk_metrics(
    allocation: Dict[str, float],
    simulation_results: Dict[str, Any]
) -> Dict[str, Any]:
    """Calculate risk metrics for a scenario."""
    total_spend = sum(allocation.values())
    
    # Concentration risk (Herfindahl index)
    shares = [spend / total_spend for spend in allocation.values() if spend > 0]
    hhi = sum(s ** 2 for s in shares)
    concentration_risk = "high" if hhi > 0.25 else "medium" if hhi > 0.15 else "low"
    
    # Volatility (coefficient of variation)
    conv_cv = simulation_results["conversions"]["std"] / simulation_results["conversions"]["expected"]
    
    # Downside risk (probability of underperformance)
    downside_threshold = simulation_results["conversions"]["expected"] * 0.8
    downside_prob = 0.1  # Simplified
    
    return {
        "volatility": round(conv_cv, 3),
        "downside_risk": round(downside_prob, 3),
        "concentration_risk": concentration_risk,
        "hhi": round(hhi, 4)
    }

def calculate_composite_score(
    metrics: Dict[str, Any],
    risk: Dict[str, Any],
    weights: Dict[str, float]
) -> float:
    """Calculate weighted composite score for scenario ranking."""
    # Normalize metrics to 0-1 scale (simplified)
    conv_score = min(metrics["conversions"]["expected"] / 20000, 1.0)
    reach_score = min(metrics["reach"]["expected"] / 5000000, 1.0)
    efficiency_score = max(0, 1 - (metrics["cpa"]["expected"] / 100))
    risk_score = 1 - risk["volatility"]
    
    composite = (
        weights.get("conversions", 0.25) * conv_score +
        weights.get("reach", 0.25) * reach_score +
        weights.get("efficiency", 0.25) * efficiency_score +
        weights.get("risk", 0.25) * risk_score
    )
    
    return round(composite, 3)

async def main(req: func.HttpRequest) -> func.HttpResponse:
    """HTTP trigger for scenario comparison."""
    start_time = time.time()
    
    try:
        req_body = req.get_json()
        request = BaseRequest(**req_body)
        
        inputs = request.inputs
        options = request.options or {}
        
        scenarios = inputs.get("scenarios", [])
        weights = inputs.get("weights", {
            "conversions": 0.4,
            "reach": 0.2,
            "efficiency": 0.3,
            "risk": 0.1
        })
        n_simulations = options.get("monte_carlo_simulations", 1000)
        
        # Process each scenario
        scenario_results = []
        
        for scenario in scenarios:
            # Run simulation
            metrics = simulate_scenario(
                allocation=scenario["allocation"],
                assumptions=scenario.get("assumptions", {}),
                benchmarks=inputs.get("benchmark_data", {}),
                n_simulations=n_simulations
            )
            
            # Calculate risk
            risk = calculate_risk_metrics(scenario["allocation"], metrics)
            
            # Calculate composite score
            score = calculate_composite_score(metrics, risk, weights)
            
            scenario_results.append({
                "scenario_id": scenario["scenario_id"],
                "scenario_name": scenario.get("scenario_name", scenario["scenario_id"]),
                "projected_metrics": metrics,
                "risk_assessment": risk,
                "composite_score": score
            })
        
        # Rank scenarios
        sorted_results = sorted(scenario_results, key=lambda x: x["composite_score"], reverse=True)
        ranking = [
            {"rank": i + 1, "scenario_id": r["scenario_id"], "score": r["composite_score"]}
            for i, r in enumerate(sorted_results)
        ]
        
        # Build recommendation
        best = sorted_results[0]
        recommendation = {
            "preferred_scenario": best["scenario_id"],
            "rationale": f"Highest composite score ({best['composite_score']}) with {best['risk_assessment']['concentration_risk']} concentration risk",
            "trade_offs": []
        }
        
        execution_time = int((time.time() - start_time) * 1000)
        
        response = BaseResponse(
            status=FunctionStatus.SUCCESS,
            capability_code=request.capability_code,
            request_id=request.request_id,
            execution_time_ms=execution_time,
            result={
                "scenario_results": scenario_results,
                "ranking": ranking,
                "recommendation": recommendation
            },
            confidence=0.85,
            diagnostics=Diagnostics(
                iterations=n_simulations,
                convergence=True,
                computation_details={"simulations_completed": n_simulations}
            ),
            metadata=Metadata(function_version="1.0.0")
        )
        
        log_execution(
            capability_code=request.capability_code,
            session_id=request.session_id,
            request_id=request.request_id,
            execution_time_ms=execution_time,
            status="success"
        )
        
        return func.HttpResponse(
            response.json(),
            status_code=200,
            mimetype="application/json"
        )
        
    except Exception as e:
        return func.HttpResponse(
            json.dumps({
                "status": "error",
                "error": {"code": "INTERNAL_ERROR", "message": str(e)},
                "metadata": {"function_version": "1.0.0"}
            }),
            status_code=500,
            mimetype="application/json"
        )
```

### 4.3 ANL-003: Generate Projections

**Endpoint:** `/api/anl/projection`  
**Capability Code:** `GENERATE_PROJECTIONS`  
**Method:** POST  
**Timeout:** 45 seconds

**Purpose:** Generate performance projections for campaign scenarios with confidence intervals.

**Request Schema:**
```json
{
  "capability_code": "GENERATE_PROJECTIONS",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "campaign_parameters": {
      "total_budget": 500000,
      "duration_days": 90,
      "channels": ["PAID_SEARCH", "PAID_SOCIAL", "DISPLAY"],
      "allocation": {
        "PAID_SEARCH": 200000,
        "PAID_SOCIAL": 200000,
        "DISPLAY": 100000
      }
    },
    "historical_baseline": {
      "previous_cpa": 45.00,
      "previous_conversion_rate": 0.022,
      "previous_ctr": 0.015
    },
    "objectives": {
      "primary_kpi": "conversions",
      "target_value": 12000
    },
    "market_factors": {
      "seasonality_index": 1.15,
      "competitive_intensity": "high"
    }
  },
  "options": {
    "projection_granularity": "weekly",
    "confidence_levels": [0.50, 0.80, 0.95]
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "GENERATE_PROJECTIONS",
  "request_id": "string",
  "execution_time_ms": 890,
  "result": {
    "summary": {
      "expected_conversions": 11250,
      "expected_cpa": 44.44,
      "expected_roas": 2.25,
      "target_achievement_probability": 0.72
    },
    "confidence_intervals": {
      "conversions": {
        "p50": {"lower": 10500, "upper": 12000},
        "p80": {"lower": 9200, "upper": 13300},
        "p95": {"lower": 7800, "upper": 14700}
      }
    },
    "timeline_projection": [
      {
        "period": "Week 1",
        "cumulative_spend": 38888,
        "cumulative_conversions": 780,
        "period_cpa": 49.85
      },
      {
        "period": "Week 2",
        "cumulative_spend": 77777,
        "cumulative_conversions": 1680,
        "period_cpa": 46.29
      }
    ],
    "channel_breakdown": {
      "PAID_SEARCH": {
        "projected_conversions": 5400,
        "projected_cpa": 37.04,
        "share_of_conversions": 0.48
      },
      "PAID_SOCIAL": {
        "projected_conversions": 4050,
        "projected_cpa": 49.38,
        "share_of_conversions": 0.36
      },
      "DISPLAY": {
        "projected_conversions": 1800,
        "projected_cpa": 55.56,
        "share_of_conversions": 0.16
      }
    },
    "risk_factors": [
      {
        "factor": "Competitive intensity",
        "impact": "May increase CPMs by 10-15%",
        "mitigation": "Consider incrementality testing"
      }
    ]
  },
  "confidence": 0.82,
  "confidence_level": "high",
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

### 4.4 ANL-004: Bayesian Inference

**Endpoint:** `/api/anl/bayesian`  
**Capability Code:** `APPLY_BAYESIAN_INFERENCE`  
**Method:** POST  
**Timeout:** 45 seconds

**Purpose:** Apply Bayesian inference for parameter estimation with prior updating.

**Request Schema:**
```json
{
  "capability_code": "APPLY_BAYESIAN_INFERENCE",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "parameter": "conversion_rate",
    "prior": {
      "distribution": "beta",
      "alpha": 2,
      "beta": 98
    },
    "observed_data": {
      "successes": 45,
      "trials": 1500
    },
    "context": {
      "channel": "PAID_SEARCH",
      "vertical": "RETAIL"
    }
  },
  "options": {
    "credible_interval": 0.95,
    "include_predictive": true
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "APPLY_BAYESIAN_INFERENCE",
  "request_id": "string",
  "execution_time_ms": 125,
  "result": {
    "posterior": {
      "distribution": "beta",
      "alpha": 47,
      "beta": 1553,
      "mean": 0.0294,
      "median": 0.0293,
      "mode": 0.0291,
      "variance": 0.0000178
    },
    "credible_interval": {
      "level": 0.95,
      "lower": 0.0217,
      "upper": 0.0384
    },
    "prior_comparison": {
      "prior_mean": 0.0200,
      "posterior_mean": 0.0294,
      "update_magnitude": 0.47,
      "data_influence": 0.97
    },
    "predictive_distribution": {
      "next_1000_trials": {
        "expected_successes": 29.4,
        "ci_lower": 21,
        "ci_upper": 39
      }
    },
    "interpretation": "Strong evidence that conversion rate exceeds prior expectation. Data dominates due to large sample size."
  },
  "confidence": 0.95,
  "confidence_level": "high",
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

### 4.5 ANL-005: Causal Analysis

**Endpoint:** `/api/anl/causal`  
**Capability Code:** `ANALYZE_CAUSALITY`  
**Method:** POST  
**Timeout:** 45 seconds

**Purpose:** Estimate causal effects and incrementality using observational data methods.

**Request Schema:**
```json
{
  "capability_code": "ANALYZE_CAUSALITY",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "treatment": {
      "channel": "PAID_SOCIAL",
      "intervention": "spend_increase",
      "magnitude": 50000
    },
    "outcome_metric": "conversions",
    "data": {
      "pre_period": {
        "treatment_group": {"conversions": 1200, "spend": 100000},
        "control_group": {"conversions": 800, "spend": 0}
      },
      "post_period": {
        "treatment_group": {"conversions": 1800, "spend": 150000},
        "control_group": {"conversions": 850, "spend": 0}
      }
    },
    "method": "difference_in_differences"
  },
  "options": {
    "bootstrap_iterations": 1000,
    "confidence_level": 0.95
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "ANALYZE_CAUSALITY",
  "request_id": "string",
  "execution_time_ms": 2340,
  "result": {
    "causal_effect": {
      "estimate": 550,
      "standard_error": 78,
      "ci_lower": 397,
      "ci_upper": 703,
      "p_value": 0.001
    },
    "incrementality": {
      "incremental_conversions": 550,
      "incremental_rate": 0.458,
      "cost_per_incremental": 90.91
    },
    "method_diagnostics": {
      "parallel_trends_test": {
        "passed": true,
        "p_value": 0.34
      },
      "pre_treatment_balance": 0.92
    },
    "interpretation": "Statistically significant positive causal effect. Spend increase generated 550 incremental conversions at $90.91 per incremental conversion.",
    "recommendations": [
      "Effect is significant - consider increasing allocation",
      "Monitor for diminishing returns at higher spend levels"
    ]
  },
  "confidence": 0.91,
  "confidence_level": "high",
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

## PART 5: AUD AGENT FUNCTIONS

### 5.1 AUD-001: Prioritize Segments

**Endpoint:** `/api/aud/segment-priority`  
**Capability Code:** `PRIORITIZE_SEGMENTS`  
**Method:** POST  
**Timeout:** 30 seconds

**Purpose:** Rank audience segments by expected value using multi-criteria scoring.

**Request Schema:**
```json
{
  "capability_code": "PRIORITIZE_SEGMENTS",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "segments": [
      {
        "segment_id": "high_value_loyal",
        "segment_name": "High Value Loyal Customers",
        "size": 150000,
        "attributes": {
          "avg_ltv": 2500,
          "purchase_frequency": 4.2,
          "recency_days": 15,
          "engagement_score": 0.85
        }
      },
      {
        "segment_id": "at_risk",
        "segment_name": "At-Risk Customers",
        "size": 80000,
        "attributes": {
          "avg_ltv": 800,
          "purchase_frequency": 1.5,
          "recency_days": 90,
          "engagement_score": 0.25
        }
      }
    ],
    "campaign_objective": "retention",
    "budget_constraint": 200000,
    "scoring_weights": {
      "ltv_potential": 0.35,
      "reachability": 0.25,
      "conversion_likelihood": 0.25,
      "strategic_fit": 0.15
    }
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "PRIORITIZE_SEGMENTS",
  "request_id": "string",
  "execution_time_ms": 156,
  "result": {
    "ranked_segments": [
      {
        "rank": 1,
        "segment_id": "at_risk",
        "composite_score": 0.82,
        "component_scores": {
          "ltv_potential": 0.75,
          "reachability": 0.90,
          "conversion_likelihood": 0.70,
          "strategic_fit": 0.95
        },
        "recommended_allocation": 120000,
        "expected_roi": 3.2,
        "rationale": "High strategic fit for retention objective with good reachability"
      },
      {
        "rank": 2,
        "segment_id": "high_value_loyal",
        "composite_score": 0.68,
        "component_scores": {
          "ltv_potential": 0.95,
          "reachability": 0.60,
          "conversion_likelihood": 0.50,
          "strategic_fit": 0.45
        },
        "recommended_allocation": 80000,
        "expected_roi": 2.8,
        "rationale": "High LTV but lower fit for retention - already loyal"
      }
    ],
    "allocation_summary": {
      "total_allocated": 200000,
      "segments_funded": 2,
      "expected_total_roi": 3.04
    }
  },
  "confidence": 0.86,
  "confidence_level": "high",
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

### 5.2 AUD-002: Calculate LTV

**Endpoint:** `/api/aud/ltv`  
**Capability Code:** `CALCULATE_LTV`  
**Method:** POST  
**Timeout:** 30 seconds

**Purpose:** Calculate customer lifetime value using various models (BG/NBD, Pareto/NBD, simple).

**Request Schema:**
```json
{
  "capability_code": "CALCULATE_LTV",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "customer_data": {
      "customer_id": "cust_12345",
      "frequency": 8,
      "recency": 30,
      "tenure": 365,
      "monetary_value": 125.50,
      "segment": "premium"
    },
    "model_parameters": {
      "discount_rate": 0.10,
      "prediction_horizon_months": 24,
      "model_type": "bg_nbd"
    },
    "cohort_context": {
      "cohort_avg_ltv": 450,
      "cohort_churn_rate": 0.15
    }
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "CALCULATE_LTV",
  "request_id": "string",
  "execution_time_ms": 89,
  "result": {
    "ltv_estimate": {
      "expected_ltv": 892.50,
      "ci_lower": 675.00,
      "ci_upper": 1150.00,
      "present_value": 785.40
    },
    "probability_alive": 0.87,
    "expected_purchases": {
      "next_12_months": 5.2,
      "next_24_months": 8.8
    },
    "customer_tier": {
      "tier": "high_value",
      "percentile": 85,
      "tier_threshold": 500
    },
    "model_details": {
      "model_used": "bg_nbd",
      "parameters": {
        "r": 0.45,
        "alpha": 12.5,
        "a": 0.8,
        "b": 2.4
      }
    }
  },
  "confidence": 0.84,
  "confidence_level": "high",
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

### 5.3 AUD-003: Score Propensity

**Endpoint:** `/api/aud/propensity`  
**Capability Code:** `SCORE_PROPENSITY`  
**Method:** POST  
**Timeout:** 25 seconds

**Purpose:** Calculate propensity scores for conversion, churn, or other outcomes.

**Request Schema:**
```json
{
  "capability_code": "SCORE_PROPENSITY",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "scoring_type": "conversion",
    "features": {
      "recency_days": 15,
      "frequency_30d": 3,
      "monetary_30d": 245.00,
      "email_engagement_rate": 0.35,
      "site_visits_7d": 8,
      "cart_abandonment_rate": 0.20,
      "tenure_days": 180
    },
    "context": {
      "campaign_type": "promotional",
      "offer_value": 25
    }
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "SCORE_PROPENSITY",
  "request_id": "string",
  "execution_time_ms": 45,
  "result": {
    "propensity_score": 0.72,
    "score_tier": "high",
    "confidence_interval": {
      "lower": 0.65,
      "upper": 0.79
    },
    "feature_importance": [
      {"feature": "site_visits_7d", "importance": 0.28},
      {"feature": "recency_days", "importance": 0.22},
      {"feature": "email_engagement_rate", "importance": 0.18},
      {"feature": "frequency_30d", "importance": 0.15},
      {"feature": "monetary_30d", "importance": 0.12},
      {"feature": "cart_abandonment_rate", "importance": 0.05}
    ],
    "recommendation": {
      "action": "target",
      "priority": "high",
      "suggested_channel": "email",
      "rationale": "High engagement signals strong conversion potential"
    }
  },
  "confidence": 0.88,
  "confidence_level": "high",
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

## PART 6: CHA AGENT FUNCTIONS

### 6.1 CHA-001: Optimize Channel Mix

**Endpoint:** `/api/cha/optimize`  
**Capability Code:** `OPTIMIZE_CHANNEL_MIX`  
**Method:** POST  
**Timeout:** 45 seconds

**Purpose:** Optimize channel allocation using constrained optimization with response curves.

**Request Schema:**
```json
{
  "capability_code": "OPTIMIZE_CHANNEL_MIX",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "total_budget": 1000000,
    "channels": [
      {
        "channel_code": "PAID_SEARCH",
        "response_curve": {"type": "logarithmic", "alpha": 0.0003, "beta": 0.00008},
        "constraints": {"min": 50000, "max": 400000}
      },
      {
        "channel_code": "PAID_SOCIAL",
        "response_curve": {"type": "logarithmic", "alpha": 0.00025, "beta": 0.00006},
        "constraints": {"min": 50000, "max": 350000}
      },
      {
        "channel_code": "DISPLAY",
        "response_curve": {"type": "power", "alpha": 0.0001, "beta": 0.75},
        "constraints": {"min": 25000, "max": 200000}
      },
      {
        "channel_code": "VIDEO",
        "response_curve": {"type": "logarithmic", "alpha": 0.0002, "beta": 0.00005},
        "constraints": {"min": 50000, "max": 300000}
      }
    ],
    "objectives": {
      "primary": "maximize_conversions",
      "secondary": "minimize_cpa"
    },
    "global_constraints": {
      "max_channel_concentration": 0.40,
      "min_channels": 3
    }
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "OPTIMIZE_CHANNEL_MIX",
  "request_id": "string",
  "execution_time_ms": 1890,
  "result": {
    "optimal_allocation": {
      "PAID_SEARCH": 400000,
      "PAID_SOCIAL": 300000,
      "DISPLAY": 100000,
      "VIDEO": 200000
    },
    "projected_outcomes": {
      "total_conversions": 28500,
      "average_cpa": 35.09,
      "total_reach": 12500000
    },
    "marginal_analysis": {
      "PAID_SEARCH": {"marginal_return": 0.000018, "saturation_pct": 0.75},
      "PAID_SOCIAL": {"marginal_return": 0.000015, "saturation_pct": 0.65},
      "DISPLAY": {"marginal_return": 0.000012, "saturation_pct": 0.45},
      "VIDEO": {"marginal_return": 0.000014, "saturation_pct": 0.55}
    },
    "sensitivity": {
      "budget_elasticity": 0.82,
      "channel_substitution_rates": {
        "PAID_SEARCH_to_PAID_SOCIAL": 0.75,
        "DISPLAY_to_VIDEO": 0.60
      }
    },
    "recommendations": [
      "Paid Search at budget cap - consider incrementality test before increasing",
      "Display has headroom - test 25% budget increase"
    ]
  },
  "confidence": 0.87,
  "confidence_level": "high",
  "diagnostics": {
    "iterations": 2847,
    "convergence": true,
    "optimality_gap": 0.0001
  },
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

## PART 7: SPO AGENT FUNCTIONS

### 7.1 SPO-001: Calculate Fee Waterfall

**Endpoint:** `/api/spo/fee-waterfall`  
**Capability Code:** `CALCULATE_FEE_WATERFALL`  
**Method:** POST  
**Timeout:** 25 seconds

**Purpose:** Calculate programmatic fee decomposition and working media ratio.

**Request Schema:**
```json
{
  "capability_code": "CALCULATE_FEE_WATERFALL",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "gross_spend": 100000,
    "supply_path": {
      "dsp": {
        "partner": "DV360",
        "fee_type": "percentage",
        "fee_rate": 0.15
      },
      "ssp": {
        "partner": "Magnite",
        "fee_type": "percentage",
        "fee_rate": 0.12
      },
      "verification": {
        "partner": "DoubleVerify",
        "fee_type": "cpm",
        "cpm_rate": 0.05
      },
      "data": {
        "partner": "LiveRamp",
        "fee_type": "cpm",
        "cpm_rate": 0.50
      }
    },
    "impression_estimate": 5000000
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "CALCULATE_FEE_WATERFALL",
  "request_id": "string",
  "execution_time_ms": 35,
  "result": {
    "fee_waterfall": {
      "gross_spend": 100000,
      "dsp_fee": {
        "amount": 15000,
        "percentage": 0.15,
        "partner": "DV360"
      },
      "ssp_fee": {
        "amount": 10200,
        "percentage": 0.102,
        "partner": "Magnite"
      },
      "verification_fee": {
        "amount": 250,
        "percentage": 0.0025,
        "partner": "DoubleVerify"
      },
      "data_fee": {
        "amount": 2500,
        "percentage": 0.025,
        "partner": "LiveRamp"
      },
      "total_fees": 27950,
      "working_media": 72050
    },
    "metrics": {
      "working_media_ratio": 0.7205,
      "tech_tax_rate": 0.2795,
      "effective_cpm": 20.00,
      "media_cpm": 14.41
    },
    "benchmarks": {
      "industry_avg_working_media": 0.55,
      "performance_vs_benchmark": "+31%",
      "assessment": "Above average supply path efficiency"
    },
    "optimization_opportunities": [
      {
        "opportunity": "SSP consolidation",
        "potential_savings": 2500,
        "complexity": "medium"
      }
    ]
  },
  "confidence": 0.95,
  "confidence_level": "high",
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

### 7.2 SPO-002: Calculate NBI

**Endpoint:** `/api/spo/nbi`  
**Capability Code:** `CALCULATE_NBI`  
**Method:** POST  
**Timeout:** 25 seconds

**Purpose:** Calculate Net Bidder Impact score for partner evaluation.

**Request Schema:**
```json
{
  "capability_code": "CALCULATE_NBI",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "partner": {
      "partner_name": "The Trade Desk",
      "partner_type": "DSP"
    },
    "performance_data": {
      "win_rate": 0.25,
      "avg_cpm": 8.50,
      "viewability_rate": 0.72,
      "fraud_rate": 0.02,
      "brand_safety_rate": 0.95
    },
    "fee_structure": {
      "platform_fee_rate": 0.12,
      "data_fee_cpm": 0.30
    },
    "comparison_baseline": {
      "avg_cpm": 10.00,
      "avg_viewability": 0.65,
      "avg_fraud_rate": 0.05
    }
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "CALCULATE_NBI",
  "request_id": "string",
  "execution_time_ms": 28,
  "result": {
    "nbi_score": 78.5,
    "nbi_tier": "A",
    "component_scores": {
      "cost_efficiency": 85,
      "quality_score": 82,
      "reach_score": 70,
      "transparency_score": 75
    },
    "value_analysis": {
      "cost_per_quality_impression": 0.0118,
      "quality_adjusted_cpm": 11.81,
      "effective_savings_vs_baseline": 0.15
    },
    "recommendation": {
      "action": "maintain_preferred",
      "rationale": "Strong cost efficiency and quality metrics. Above-average NBI score.",
      "watch_items": ["Monitor win rate trends", "Evaluate fraud rate quarterly"]
    }
  },
  "confidence": 0.92,
  "confidence_level": "high",
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

## PART 8: PRF AGENT FUNCTIONS

### 8.1 PRF-001: Detect Anomalies

**Endpoint:** `/api/prf/anomaly`  
**Capability Code:** `DETECT_ANOMALIES`  
**Method:** POST  
**Timeout:** 30 seconds

**Purpose:** Detect performance anomalies using statistical methods.

**Request Schema:**
```json
{
  "capability_code": "DETECT_ANOMALIES",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "metric": "cpa",
    "time_series": [
      {"date": "2026-01-01", "value": 42.50},
      {"date": "2026-01-02", "value": 44.20},
      {"date": "2026-01-03", "value": 43.80},
      {"date": "2026-01-04", "value": 85.00},
      {"date": "2026-01-05", "value": 45.10}
    ],
    "context": {
      "channel": "PAID_SEARCH",
      "campaign_id": "camp_12345"
    },
    "detection_config": {
      "method": "isolation_forest",
      "sensitivity": "medium",
      "min_anomaly_score": 0.7
    }
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "DETECT_ANOMALIES",
  "request_id": "string",
  "execution_time_ms": 145,
  "result": {
    "anomalies_detected": [
      {
        "date": "2026-01-04",
        "value": 85.00,
        "anomaly_score": 0.92,
        "severity": "high",
        "deviation": {
          "from_mean": 2.8,
          "from_median": 2.6,
          "percent_deviation": 94.5
        },
        "potential_causes": [
          "Budget pacing issue",
          "Bid strategy change",
          "Competitive pressure spike"
        ]
      }
    ],
    "summary": {
      "total_points": 5,
      "anomalies_found": 1,
      "anomaly_rate": 0.20,
      "series_statistics": {
        "mean": 52.12,
        "median": 44.20,
        "std": 17.23
      }
    },
    "recommendations": [
      "Investigate January 4th CPA spike",
      "Check bid adjustments and budget caps",
      "Review auction insights for competitive changes"
    ]
  },
  "confidence": 0.89,
  "confidence_level": "high",
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

### 8.2 PRF-002: Analyze Attribution

**Endpoint:** `/api/prf/attribution`  
**Capability Code:** `ANALYZE_ATTRIBUTION`  
**Method:** POST  
**Timeout:** 45 seconds

**Purpose:** Multi-touch attribution analysis with Shapley values.

**Request Schema:**
```json
{
  "capability_code": "ANALYZE_ATTRIBUTION",
  "session_id": "string",
  "request_id": "string",
  "inputs": {
    "conversion_paths": [
      {
        "path_id": "path_001",
        "touchpoints": ["PAID_SEARCH", "DISPLAY", "PAID_SOCIAL"],
        "conversion_value": 150
      },
      {
        "path_id": "path_002",
        "touchpoints": ["DISPLAY", "PAID_SEARCH"],
        "conversion_value": 85
      }
    ],
    "attribution_models": ["shapley", "linear", "time_decay", "position_based"],
    "channel_spend": {
      "PAID_SEARCH": 50000,
      "DISPLAY": 30000,
      "PAID_SOCIAL": 40000
    }
  }
}
```

**Response Schema:**
```json
{
  "status": "success",
  "capability_code": "ANALYZE_ATTRIBUTION",
  "request_id": "string",
  "execution_time_ms": 890,
  "result": {
    "attribution_results": {
      "shapley": {
        "PAID_SEARCH": {"credit": 95.83, "share": 0.408},
        "DISPLAY": {"credit": 68.33, "share": 0.291},
        "PAID_SOCIAL": {"credit": 70.84, "share": 0.301}
      },
      "linear": {
        "PAID_SEARCH": {"credit": 85.00, "share": 0.362},
        "DISPLAY": {"credit": 75.00, "share": 0.319},
        "PAID_SOCIAL": {"credit": 75.00, "share": 0.319}
      },
      "time_decay": {
        "PAID_SEARCH": {"credit": 92.50, "share": 0.394},
        "DISPLAY": {"credit": 62.50, "share": 0.266},
        "PAID_SOCIAL": {"credit": 80.00, "share": 0.340}
      },
      "position_based": {
        "PAID_SEARCH": {"credit": 90.00, "share": 0.383},
        "DISPLAY": {"credit": 47.00, "share": 0.200},
        "PAID_SOCIAL": {"credit": 98.00, "share": 0.417}
      }
    },
    "efficiency_metrics": {
      "shapley_roas": {
        "PAID_SEARCH": 1.92,
        "DISPLAY": 2.28,
        "PAID_SOCIAL": 1.77
      }
    },
    "recommendation": {
      "preferred_model": "shapley",
      "rationale": "Game-theoretic approach accounts for marginal contribution",
      "insights": [
        "Display shows highest ROAS under Shapley",
        "Paid Search drives initial engagement",
        "Paid Social effective at closing"
      ]
    }
  },
  "confidence": 0.86,
  "confidence_level": "high",
  "metadata": {
    "function_version": "1.0.0",
    "timestamp": "2026-01-18T12:00:00Z"
  }
}
```

---

## PART 9: SHARED UTILITIES

### 9.1 Validators (shared/validators.py)

```python
# shared/validators.py

from typing import List, Dict, Any, Optional
from shared.exceptions import ValidationError

def validate_positive(value: Optional[float], field_name: str) -> None:
    """Validate that a numeric value is positive."""
    if value is None:
        raise ValidationError(f"{field_name} is required")
    if value <= 0:
        raise ValidationError(f"{field_name} must be positive, got {value}")

def validate_percentage(value: Optional[float], field_name: str) -> None:
    """Validate that a value is between 0 and 1."""
    if value is None:
        raise ValidationError(f"{field_name} is required")
    if not 0 <= value <= 1:
        raise ValidationError(f"{field_name} must be between 0 and 1, got {value}")

def validate_channels(channels: List[Dict]) -> None:
    """Validate channel list structure."""
    if not channels:
        raise ValidationError("At least one channel is required")
    
    for i, channel in enumerate(channels):
        if "channel_code" not in channel:
            raise ValidationError(f"Channel {i} missing channel_code")
        if "historical_performance" not in channel:
            raise ValidationError(f"Channel {channel.get('channel_code', i)} missing historical_performance")

def validate_scenarios(scenarios: List[Dict]) -> None:
    """Validate scenario list structure."""
    if not scenarios:
        raise ValidationError("At least one scenario is required")
    
    for i, scenario in enumerate(scenarios):
        if "scenario_id" not in scenario:
            raise ValidationError(f"Scenario {i} missing scenario_id")
        if "allocation" not in scenario:
            raise ValidationError(f"Scenario {scenario.get('scenario_id', i)} missing allocation")

def validate_time_series(data: List[Dict], min_points: int = 3) -> None:
    """Validate time series data."""
    if not data:
        raise ValidationError("Time series data is required")
    if len(data) < min_points:
        raise ValidationError(f"At least {min_points} data points required, got {len(data)}")
    
    for i, point in enumerate(data):
        if "date" not in point:
            raise ValidationError(f"Data point {i} missing date")
        if "value" not in point:
            raise ValidationError(f"Data point {i} missing value")
```

### 9.2 Exceptions (shared/exceptions.py)

```python
# shared/exceptions.py

class MPAFunctionError(Exception):
    """Base exception for MPA functions."""
    def __init__(self, code: str, message: str, details: dict = None):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(message)

class ValidationError(MPAFunctionError):
    """Input validation error."""
    def __init__(self, message: str, details: dict = None):
        super().__init__("VALIDATION_ERROR", message, details)

class CalculationError(MPAFunctionError):
    """Calculation/computation error."""
    def __init__(self, message: str, details: dict = None):
        super().__init__("CALCULATION_ERROR", message, details)

class DataError(MPAFunctionError):
    """Data quality or availability error."""
    def __init__(self, message: str, details: dict = None):
        super().__init__("DATA_ERROR", message, details)

class TimeoutError(MPAFunctionError):
    """Computation timeout error."""
    def __init__(self, message: str, details: dict = None):
        super().__init__("TIMEOUT_ERROR", message, details)

class ConfigurationError(MPAFunctionError):
    """Configuration or setup error."""
    def __init__(self, message: str, details: dict = None):
        super().__init__("CONFIGURATION_ERROR", message, details)
```

### 9.3 Telemetry (shared/telemetry.py)

```python
# shared/telemetry.py

import os
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from azure.monitor.opentelemetry import configure_azure_monitor
from opentelemetry import trace

# Configure Azure Monitor if connection string available
connection_string = os.environ.get("APPLICATIONINSIGHTS_CONNECTION_STRING")
if connection_string:
    configure_azure_monitor(connection_string=connection_string)

tracer = trace.get_tracer(__name__)
logger = logging.getLogger(__name__)

def log_execution(
    capability_code: str,
    session_id: str,
    request_id: str,
    execution_time_ms: int,
    status: str,
    error_code: Optional[str] = None,
    error_message: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> None:
    """Log function execution to telemetry."""
    
    telemetry_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "capability_code": capability_code,
        "session_id": session_id,
        "request_id": request_id,
        "execution_time_ms": execution_time_ms,
        "status": status,
        "error_code": error_code,
        "error_message": error_message,
        "metadata": metadata or {}
    }
    
    # Log to Application Insights custom event
    with tracer.start_as_current_span("function_execution") as span:
        span.set_attribute("capability_code", capability_code)
        span.set_attribute("session_id", session_id)
        span.set_attribute("execution_time_ms", execution_time_ms)
        span.set_attribute("status", status)
        
        if error_code:
            span.set_attribute("error_code", error_code)
    
    # Also log to standard logger
    if status == "success":
        logger.info(f"Function executed: {json.dumps(telemetry_data)}")
    else:
        logger.error(f"Function failed: {json.dumps(telemetry_data)}")

def log_dataverse_call(
    table_name: str,
    operation: str,
    duration_ms: int,
    records_affected: int = 0
) -> None:
    """Log Dataverse API call."""
    with tracer.start_as_current_span("dataverse_call") as span:
        span.set_attribute("table_name", table_name)
        span.set_attribute("operation", operation)
        span.set_attribute("duration_ms", duration_ms)
        span.set_attribute("records_affected", records_affected)
```

---

## PART 10: DEPLOYMENT CONFIGURATION

### 10.1 host.json

```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    },
    "logLevel": {
      "default": "Information",
      "Host.Results": "Error",
      "Function": "Information",
      "Host.Aggregator": "Trace"
    }
  },
  "functionTimeout": "00:05:00",
  "extensions": {
    "http": {
      "routePrefix": "api",
      "maxOutstandingRequests": 200,
      "maxConcurrentRequests": 100,
      "dynamicThrottlesEnabled": true
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  }
}
```

### 10.2 requirements.txt

```
azure-functions>=1.17.0
numpy>=1.24.0
scipy>=1.11.0
pandas>=2.0.0
scikit-learn>=1.3.0
pydantic>=2.0.0
azure-monitor-opentelemetry>=1.0.0
opentelemetry-api>=1.20.0
opentelemetry-sdk>=1.20.0
requests>=2.31.0
```

### 10.3 local.settings.json (Template)

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "APPLICATIONINSIGHTS_CONNECTION_STRING": "<your-connection-string>",
    "DATAVERSE_URL": "https://your-org.crm.dynamics.com",
    "DATAVERSE_CLIENT_ID": "<your-client-id>",
    "DATAVERSE_CLIENT_SECRET": "<your-client-secret>",
    "DATAVERSE_TENANT_ID": "<your-tenant-id>"
  }
}
```

### 10.4 function.json Template

```json
{
  "scriptFile": "__init__.py",
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "anl/marginal-return"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ]
}
```

---

## PART 11: TESTING STRATEGY

### 11.1 Unit Test Structure

```python
# tests/test_anl_functions.py

import pytest
import json
from unittest.mock import patch, MagicMock
import numpy as np

from anl_functions.marginal_return.function import (
    fit_response_curve,
    calculate_marginal_return,
    optimize_allocation
)

class TestMarginalReturn:
    """Tests for marginal return calculation function."""
    
    def test_fit_logarithmic_curve(self):
        """Test logarithmic response curve fitting."""
        spend_levels = [10000, 25000, 50000, 75000, 100000]
        performance = [0.02, 0.025, 0.028, 0.029, 0.0295]
        
        params = fit_response_curve(spend_levels, performance, "logarithmic")
        
        assert "alpha" in params
        assert "beta" in params
        assert params["alpha"] > 0
        assert params["beta"] > 0
    
    def test_marginal_return_decreases(self):
        """Test that marginal return decreases with spend (diminishing returns)."""
        params = {"alpha": 0.0003, "beta": 0.00008}
        
        mr_low = calculate_marginal_return(params, 10000, "logarithmic")
        mr_high = calculate_marginal_return(params, 100000, "logarithmic")
        
        assert mr_low > mr_high, "Marginal return should decrease with spend"
    
    def test_optimization_respects_constraints(self):
        """Test that optimization respects budget and channel constraints."""
        channels = [
            {
                "channel_code": "CH1",
                "current_spend": 50000,
                "historical_performance": {
                    "spend_levels": [10000, 50000, 100000],
                    "conversion_rates": [0.02, 0.025, 0.027]
                }
            },
            {
                "channel_code": "CH2",
                "current_spend": 50000,
                "historical_performance": {
                    "spend_levels": [10000, 50000, 100000],
                    "conversion_rates": [0.015, 0.02, 0.022]
                }
            }
        ]
        
        constraints = {
            "min_channel_spend": 10000,
            "max_channel_concentration": 0.7
        }
        
        result = optimize_allocation(channels, 100000, constraints, "logarithmic")
        
        # Check budget constraint
        total = sum(result["optimal_allocation"].values())
        assert abs(total - 100000) < 1, "Total allocation should equal budget"
        
        # Check min spend constraint
        for spend in result["optimal_allocation"].values():
            assert spend >= 10000, "Each channel should meet minimum spend"
        
        # Check concentration constraint
        for spend in result["optimal_allocation"].values():
            assert spend <= 70000, "No channel should exceed 70% concentration"
    
    def test_convergence_flag(self):
        """Test that optimization reports convergence status."""
        channels = [
            {
                "channel_code": "CH1",
                "current_spend": 50000,
                "historical_performance": {
                    "spend_levels": [10000, 50000, 100000],
                    "conversion_rates": [0.02, 0.025, 0.027]
                }
            }
        ]
        
        result = optimize_allocation(channels, 100000, {}, "logarithmic")
        
        assert "convergence" in result
        assert isinstance(result["convergence"], bool)

class TestScenarioCompare:
    """Tests for scenario comparison function."""
    
    def test_ranking_consistency(self):
        """Test that ranking is consistent with composite scores."""
        # Implementation would test the ranking logic
        pass
    
    def test_monte_carlo_stability(self):
        """Test that Monte Carlo results are stable with sufficient iterations."""
        # Implementation would test simulation stability
        pass

# Similar test classes for other functions...
```

### 11.2 Integration Test Structure

```python
# tests/test_integration.py

import pytest
import requests
import json
import os

BASE_URL = os.environ.get("FUNCTION_APP_URL", "http://localhost:7071")

class TestFunctionIntegration:
    """Integration tests against deployed or local function app."""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers."""
        function_key = os.environ.get("FUNCTION_KEY", "")
        return {"x-functions-key": function_key}
    
    def test_marginal_return_endpoint(self, auth_headers):
        """Test marginal return endpoint end-to-end."""
        request_body = {
            "capability_code": "CALCULATE_MARGINAL_RETURN",
            "session_id": "test_session",
            "request_id": "test_request_001",
            "inputs": {
                "channels": [
                    {
                        "channel_code": "PAID_SEARCH",
                        "current_spend": 50000,
                        "historical_performance": {
                            "spend_levels": [10000, 25000, 50000],
                            "conversion_rates": [0.02, 0.025, 0.028]
                        }
                    }
                ],
                "total_budget": 100000,
                "optimization_goal": "MAXIMIZE_CONVERSIONS",
                "constraints": {}
            },
            "options": {"include_diagnostics": True}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/anl/marginal-return",
            json=request_body,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "result" in data
        assert "optimal_allocation" in data["result"]
        assert data["execution_time_ms"] > 0
    
    def test_invalid_input_returns_400(self, auth_headers):
        """Test that invalid input returns 400 error."""
        request_body = {
            "capability_code": "CALCULATE_MARGINAL_RETURN",
            "session_id": "test_session",
            "request_id": "test_request_002",
            "inputs": {
                "channels": [],  # Empty channels - should fail validation
                "total_budget": -1000  # Negative budget - should fail
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/anl/marginal-return",
            json=request_body,
            headers=auth_headers
        )
        
        assert response.status_code == 400
        data = response.json()
        assert data["status"] == "error"
        assert "error" in data
```

---

## PART 12: ERROR HANDLING

### 12.1 Error Response Codes

| Code | HTTP Status | Description | Recovery Action |
|------|-------------|-------------|-----------------|
| VALIDATION_ERROR | 400 | Input validation failed | Fix input and retry |
| CALCULATION_ERROR | 500 | Computation failed | Check inputs, may need different parameters |
| DATA_ERROR | 400 | Data quality issue | Provide better quality data |
| TIMEOUT_ERROR | 408 | Computation exceeded timeout | Simplify request or increase timeout |
| CONFIGURATION_ERROR | 500 | Function misconfigured | Contact administrator |
| INTERNAL_ERROR | 500 | Unexpected error | Report bug, retry later |

### 12.2 Error Handling Pattern

```python
async def main(req: func.HttpRequest) -> func.HttpResponse:
    """Standard error handling pattern for all functions."""
    start_time = time.time()
    request_id = "unknown"
    capability_code = "unknown"
    
    try:
        # Parse and validate request
        req_body = req.get_json()
        request = BaseRequest(**req_body)
        request_id = request.request_id
        capability_code = request.capability_code
        
        # Validate inputs
        validate_inputs(request.inputs)
        
        # Perform calculation
        result = perform_calculation(request.inputs, request.options)
        
        # Build success response
        execution_time = int((time.time() - start_time) * 1000)
        response = build_success_response(request, result, execution_time)
        
        log_execution(capability_code, request.session_id, request_id, 
                     execution_time, "success")
        
        return func.HttpResponse(
            response.json(),
            status_code=200,
            mimetype="application/json"
        )
        
    except ValidationError as e:
        return build_error_response(capability_code, request_id, e, 400)
        
    except CalculationError as e:
        return build_error_response(capability_code, request_id, e, 500)
        
    except TimeoutError as e:
        return build_error_response(capability_code, request_id, e, 408)
        
    except Exception as e:
        # Unexpected error - log full stack trace
        import traceback
        logger.error(f"Unexpected error: {traceback.format_exc()}")
        
        error = MPAFunctionError("INTERNAL_ERROR", str(e))
        return build_error_response(capability_code, request_id, error, 500)

def build_error_response(
    capability_code: str,
    request_id: str,
    error: MPAFunctionError,
    status_code: int
) -> func.HttpResponse:
    """Build standardized error response."""
    response = {
        "status": "error",
        "capability_code": capability_code,
        "request_id": request_id,
        "error": {
            "code": error.code,
            "message": error.message,
            "details": error.details
        },
        "metadata": {
            "function_version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat()
        }
    }
    
    log_execution(capability_code, "unknown", request_id, 0, "error",
                 error.code, error.message)
    
    return func.HttpResponse(
        json.dumps(response),
        status_code=status_code,
        mimetype="application/json"
    )
```

---

## PART 13: SECURITY CONFIGURATION

### 13.1 Authentication Options

| Method | Use Case | Configuration |
|--------|----------|---------------|
| Function Key | Service-to-service | Set in `authLevel` in function.json |
| Azure AD | User context | Configure in Function App settings |
| Managed Identity | Internal Azure services | Enable on Function App |

### 13.2 Function Key Configuration

```json
// function.json with function-level auth
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"]
    }
  ]
}
```

### 13.3 CORS Configuration

```json
// In Azure Function App settings
{
  "cors": {
    "allowedOrigins": [
      "https://your-powerautomate-origin.com",
      "https://your-copilot-origin.com"
    ],
    "supportCredentials": true
  }
}
```

### 13.4 Network Security

- Deploy in Azure Virtual Network for Mastercard environment (when approved)
- Use Private Endpoints for Dataverse connectivity
- Configure IP restrictions in Function App networking

---

## PART 14: MONITORING AND OBSERVABILITY

### 14.1 Application Insights Queries

**Function Performance:**
```kusto
requests
| where cloud_RoleName == "mpa-functions-personal"
| summarize 
    avg_duration = avg(duration),
    p95_duration = percentile(duration, 95),
    success_rate = countif(success == true) * 100.0 / count()
    by name, bin(timestamp, 1h)
| order by timestamp desc
```

**Error Analysis:**
```kusto
exceptions
| where cloud_RoleName == "mpa-functions-personal"
| summarize count() by type, outerMessage, bin(timestamp, 1h)
| order by count_ desc
```

**Capability Usage:**
```kusto
customEvents
| where name == "function_execution"
| extend capability_code = tostring(customDimensions.capability_code)
| summarize 
    count = count(),
    avg_duration = avg(todouble(customDimensions.execution_time_ms))
    by capability_code, bin(timestamp, 1d)
```

### 14.2 Alerts Configuration

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | Error rate > 5% over 5 min | Critical | Page on-call |
| Slow Response | P95 latency > 30s | Warning | Notify team |
| Function Timeout | Timeout count > 10/hour | Warning | Investigate |
| Capacity Limit | Active executions > 80% | Warning | Scale review |

### 14.3 Dashboard Metrics

**Key Metrics to Track:**
- Request volume by capability
- Success/failure rates
- Average and P95 latency
- Error distribution by code
- Fallback trigger rate (AI Builder invocations)
- Dataverse API call latency

---

## APPENDIX A: CAPABILITY TO FUNCTION MAPPING

| Capability Code | Function Endpoint | AI Builder Fallback |
|-----------------|-------------------|---------------------|
| CALCULATE_MARGINAL_RETURN | /api/anl/marginal-return | ANL_MarginalReturn_Prompt |
| COMPARE_SCENARIOS | /api/anl/scenario-compare | ANL_ScenarioCompare_Prompt |
| GENERATE_PROJECTIONS | /api/anl/projection | ANL_Projection_Prompt |
| APPLY_BAYESIAN_INFERENCE | /api/anl/bayesian | ANL_Bayesian_Prompt |
| ANALYZE_CAUSALITY | /api/anl/causal | ANL_Causal_Prompt |
| PRIORITIZE_SEGMENTS | /api/aud/segment-priority | AUD_SegmentPriority_Prompt |
| CALCULATE_LTV | /api/aud/ltv | AUD_LTVAssess_Prompt |
| SCORE_PROPENSITY | /api/aud/propensity | AUD_Propensity_Prompt |
| OPTIMIZE_CHANNEL_MIX | /api/cha/optimize | CHA_ChannelMix_Prompt |
| CALCULATE_FEE_WATERFALL | /api/spo/fee-waterfall | SPO_FeeWaterfall_Prompt |
| CALCULATE_NBI | /api/spo/nbi | SPO_NBICalculate_Prompt |
| DETECT_ANOMALIES | /api/prf/anomaly | PRF_Anomaly_Prompt |
| ANALYZE_ATTRIBUTION | /api/prf/attribution | PRF_Attribution_Prompt |

---

## APPENDIX B: DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All unit tests passing
- [ ] Integration tests passing against local emulator
- [ ] Code review completed
- [ ] Security review for secrets handling
- [ ] Performance baseline established

### Deployment
- [ ] Create/update Azure Function App
- [ ] Configure Application Insights
- [ ] Set environment variables
- [ ] Deploy function code
- [ ] Configure authentication
- [ ] Set up CORS if needed
- [ ] Configure networking/firewall rules

### Post-Deployment
- [ ] Smoke test all endpoints
- [ ] Verify Application Insights telemetry
- [ ] Update eap_capability_implementation with URLs
- [ ] Test fallback to AI Builder
- [ ] Monitor error rates for 24 hours
- [ ] Update runbook documentation

---

**Document Version:** 1.0  
**Created:** January 18, 2026  
**Author:** Claude (via claude.ai)  
**Environment:** Personal (Aragorn AI) Only  
**Status:** Implementation Ready
