# KDAP v6.0 Capability Catalog

## New Capabilities Summary

| Agent | Capability | Type | Azure Function |
|-------|------------|------|----------------|
| CST | CST_FRAMEWORK_SELECT | AI Builder | No |
| CST | CST_ENGAGEMENT_GUIDE | AI Builder | No |
| CST | CST_STRATEGIC_ANALYZE | AI Builder | No |
| CST | CST_PRIORITIZE | AI Builder | No |
| CHG | CHG_READINESS | AI Builder | No |
| CHG | CHG_STAKEHOLDER | AI Builder | No |
| CHG | CHG_ADOPTION | AI Builder | No |
| ANL | ANL_NPV | AI Builder + Function | Yes (Personal) |
| ANL | ANL_IRR | AI Builder + Function | Yes (Personal) |
| ANL | ANL_TCO | AI Builder | No |
| ANL | ANL_MONTECARLO | AI Builder + Function | Yes (Personal) |
| ANL | ANL_SENSITIVITY | AI Builder + Function | Yes (Personal) |
| ANL | ANL_PAYBACK | AI Builder | No |
| DOC | DOC_BUSINESSCASE | AI Builder | No |
| DOC | DOC_ROADMAP | AI Builder | No |

**Total: 15 new capabilities**

---

## CST Capabilities

### CST_FRAMEWORK_SELECT

**Purpose:** Recommend consulting frameworks for a business challenge

**Input Schema:**
```json
{
  "challenge_type": "string",
  "industry": "string",
  "complexity": "string"
}
```

**Output Schema:**
```json
{
  "frameworks": [
    {
      "code": "string",
      "name": "string",
      "fit_score": "number",
      "rationale": "string"
    }
  ]
}
```

**Example:**
```
Input: "Market entry analysis for SaaS product in Europe"
Output: [PESTEL (9), Porter Five Forces (8), Ansoff Matrix (7)]
```

---

### CST_ENGAGEMENT_GUIDE

**Purpose:** Guide user through consulting engagement phases

**Input Schema:**
```json
{
  "current_phase": "string",
  "context": "object"
}
```

**Output Schema:**
```json
{
  "guidance": "string",
  "next_steps": ["string"],
  "questions": ["string"]
}
```

**Phases:** Discovery → Assessment → Recommendations → Roadmap

---

### CST_STRATEGIC_ANALYZE

**Purpose:** Apply strategic framework to analyze situation

**Input Schema:**
```json
{
  "framework_code": "string",
  "inputs": "object"
}
```

**Output Schema:**
```json
{
  "analysis": "object",
  "insights": ["string"],
  "recommendations": ["string"]
}
```

**Supported Frameworks:** SWOT, PESTEL, Porter Five Forces, BCG Matrix, etc.

---

### CST_PRIORITIZE

**Purpose:** Score and rank initiatives

**Input Schema:**
```json
{
  "method": "string",
  "items": [{"name": "string", "attributes": "object"}],
  "criteria": "object"
}
```

**Output Schema:**
```json
{
  "ranked_items": [{"name": "string", "score": "number", "rank": "number"}],
  "rationale": "string"
}
```

**Methods:** RICE, MoSCoW, Weighted Matrix, Effort-Impact

---

## CHG Capabilities

### CHG_READINESS

**Purpose:** Assess organizational change readiness

**Input Schema:**
```json
{
  "change_description": "string",
  "org_context": "object"
}
```

**Output Schema:**
```json
{
  "readiness_score": "number",
  "strengths": ["string"],
  "gaps": ["string"],
  "recommendations": ["string"]
}
```

**Models Used:** ADKAR, Kotter, Lewin, Bridges

---

### CHG_STAKEHOLDER

**Purpose:** Map and analyze stakeholders

**Input Schema:**
```json
{
  "change_description": "string",
  "stakeholder_list": ["string"]
}
```

**Output Schema:**
```json
{
  "stakeholder_map": [
    {
      "name": "string",
      "power": "string",
      "interest": "string",
      "strategy": "string"
    }
  ]
}
```

**Methods:** Power/Interest Grid, RACI, Influence-Impact

---

### CHG_ADOPTION

**Purpose:** Create adoption and rollout plans

**Input Schema:**
```json
{
  "change_description": "string",
  "timeline": "string",
  "constraints": "object"
}
```

**Output Schema:**
```json
{
  "phases": [{"name": "string", "activities": ["string"], "duration": "string"}],
  "success_metrics": ["string"]
}
```

---

## ANL Financial Capabilities

### ANL_NPV

**Purpose:** Calculate Net Present Value

**Input Schema:**
```json
{
  "cash_flows": ["number"],
  "discount_rate": "number",
  "initial_investment": "number"
}
```

**Output Schema:**
```json
{
  "npv": "number",
  "sensitivity": {
    "rate_minus_1": "number",
    "rate_plus_1": "number"
  }
}
```

**Implementation:**
- Personal: Azure Function (preferred) + AI Builder (fallback)
- Mastercard: AI Builder only

---

### ANL_IRR

**Purpose:** Calculate Internal Rate of Return

**Input Schema:**
```json
{
  "cash_flows": ["number"],
  "initial_investment": "number"
}
```

**Output Schema:**
```json
{
  "irr": "number",
  "mirr": "number",
  "payback_years": "number"
}
```

---

### ANL_TCO

**Purpose:** Calculate Total Cost of Ownership

**Input Schema:**
```json
{
  "acquisition_cost": "number",
  "operating_costs": ["number"],
  "years": "number",
  "hidden_costs": "object"
}
```

**Output Schema:**
```json
{
  "tco": "number",
  "annual_breakdown": ["number"],
  "cost_categories": "object"
}
```

---

### ANL_MONTECARLO

**Purpose:** Monte Carlo simulation for uncertainty analysis

**Input Schema:**
```json
{
  "variables": [{"name": "string", "distribution": "string", "params": "object"}],
  "model": "string",
  "iterations": "number"
}
```

**Output Schema:**
```json
{
  "mean": "number",
  "std_dev": "number",
  "percentiles": {"p10": "number", "p50": "number", "p90": "number"}
}
```

---

### ANL_SENSITIVITY

**Purpose:** Tornado/spider sensitivity analysis

**Input Schema:**
```json
{
  "base_case": "object",
  "variables": [{"name": "string", "low": "number", "high": "number"}]
}
```

**Output Schema:**
```json
{
  "tornado_data": [{"variable": "string", "low_impact": "number", "high_impact": "number"}]
}
```

---

### ANL_PAYBACK

**Purpose:** Calculate payback period

**Input Schema:**
```json
{
  "initial_investment": "number",
  "cash_flows": ["number"],
  "discount_rate": "number"
}
```

**Output Schema:**
```json
{
  "simple_payback": "number",
  "discounted_payback": "number",
  "break_even_units": "number"
}
```

---

## DOC Consulting Capabilities

### DOC_BUSINESSCASE

**Purpose:** Generate business case document

**Input Schema:**
```json
{
  "title": "string",
  "problem": "string",
  "solution": "string",
  "financials": "object",
  "risks": ["string"]
}
```

**Output Schema:**
```json
{
  "document_url": "string",
  "sections": ["string"]
}
```

**Sections Generated:**
- Executive Summary
- Problem Statement
- Proposed Solution
- Financial Analysis
- Risk Assessment
- Implementation Approach
- Recommendation

---

### DOC_ROADMAP

**Purpose:** Generate implementation roadmap

**Input Schema:**
```json
{
  "title": "string",
  "phases": [{"name": "string", "milestones": ["string"]}],
  "timeline": "string"
}
```

**Output Schema:**
```json
{
  "document_url": "string",
  "gantt_data": "object"
}
```

**Sections Generated:**
- Executive Overview
- Current State Summary
- Future State Vision
- Phased Approach
- Resource Requirements
- Risk Mitigation
- Success Metrics
- Governance Model
