# KDAP Phase 7-11: Complete VS Code Instructions

**Scope:** Dataverse deployment, AI Builder prompts, Azure Functions, Testing, Deployment  
**Owner:** VS Code Claude  
**Prerequisites:** Phases 1-6 complete (CHG Agent committed)
**Repository:** /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
**Branch:** feature/v6.0-kb-expansion

---

## PHASE 7: DATAVERSE & CAPABILITIES (Days 13-15)

### 7.1: Deploy CA Dataverse Tables

```
TASK: Deploy CA Dataverse Tables to Power Platform

ENVIRONMENT: Personal (Aragorn AI) first, then Mastercard

TABLES TO CREATE:

1. ca_framework
   - ca_framework_id (PK, GUID, auto-generated)
   - framework_code (Text, 20, Required, Unique)
   - framework_name (Text, 100, Required)
   - category_code (Choice: Strategic, Competitive, Operational, Customer, Financial, Change, Planning, Problem)
   - complexity_level (Choice: Standard, Advanced, Expert)
   - description (Text, 500)
   - when_to_use (Text, 1000)
   - industry_relevance (Multi-select Lookup to mpa_vertical)
   - is_active (Boolean, default true)

2. ca_project
   - ca_project_id (PK, GUID, auto-generated)
   - ca_project_name (Text, 200, Required)
   - ca_client_name (Text, 200)
   - ca_industry_code (Lookup to mpa_vertical)
   - ca_engagement_type (Choice: Assessment, Strategy, Transformation, DueDiligence)
   - ca_status (Choice: Discovery, Analysis, Recommendations, Roadmap, Complete)
   - eap_session_id (Lookup to eap_session)
   - created_on (DateTime, auto)
   - modified_on (DateTime, auto)

3. ca_deliverable
   - ca_deliverable_id (PK, GUID, auto-generated)
   - ca_project_id (Lookup to ca_project, Required)
   - ca_deliverable_type (Choice: Analysis, BusinessCase, Roadmap, Presentation, Report)
   - ca_framework_used (Text, 100)
   - ca_status (Choice: Draft, Review, Final)
   - ca_file_url (Text, 500)
   - created_on (DateTime, auto)

EXECUTION:
1. Use pac CLI or Power Platform Admin API
2. Deploy to Personal environment first
3. Validate table creation
4. Deploy to Mastercard environment
5. Document any environment-specific adjustments

VALIDATION:
- All 3 tables exist in both environments
- Lookup relationships are correct
- Choice fields have correct options
```

### 7.2: Load ca_framework Seed Data

```
TASK: Load 60 Framework Records into ca_framework Table

FRAMEWORKS TO LOAD (60 total):

DOMAIN-SPECIFIC (4):
- DS-01, MarTech Assessment, Strategic, Standard
- DS-02, Media Planning Framework, Strategic, Standard
- DS-03, Loyalty Strategy Framework, Strategic, Advanced
- DS-04, Data Strategy Framework, Strategic, Advanced

STRATEGIC ANALYSIS (7):
- ST-01, SWOT Analysis, Strategic, Standard
- ST-02, PESTEL Analysis, Strategic, Standard
- ST-03, Scenario Planning, Strategic, Advanced
- ST-04, Ansoff Matrix, Strategic, Standard
- ST-05, BCG Growth-Share Matrix, Strategic, Standard
- ST-06, GE-McKinsey Nine-Box, Strategic, Advanced
- ST-07, Value Proposition Canvas, Strategic, Standard

COMPETITIVE ANALYSIS (6):
- CP-01, Porter Five Forces, Competitive, Standard
- CP-02, Competitor Profiling, Competitive, Standard
- CP-03, Benchmarking Framework, Competitive, Standard
- CP-04, Strategic Group Analysis, Competitive, Advanced
- CP-05, Positioning Map, Competitive, Standard
- CP-06, Win-Loss Analysis, Competitive, Advanced

OPERATIONAL (8):
- OP-01, Value Chain Analysis, Operational, Standard
- OP-02, Process Mapping, Operational, Standard
- OP-03, Lean Six Sigma, Operational, Advanced
- OP-04, Capacity Planning, Operational, Advanced
- OP-05, Supply Chain Analysis, Operational, Advanced
- OP-06, Cost-Benefit Analysis, Operational, Standard
- OP-07, Root Cause Analysis, Operational, Standard
- OP-08, RACI Matrix, Operational, Standard

CUSTOMER & MARKET (7):
- CM-01, Customer Journey Mapping, Customer, Standard
- CM-02, Jobs-to-be-Done, Customer, Advanced
- CM-03, Kano Model, Customer, Advanced
- CM-04, STP Framework, Customer, Standard
- CM-05, Marketing Mix 4P/7P, Customer, Standard
- CM-06, Technology Adoption Lifecycle, Customer, Standard
- CM-07, RACE Framework, Customer, Standard

BUSINESS CASE & INVESTMENT (7):
- BC-01, TCO Analysis, Financial, Standard
- BC-02, NPV-IRR Decision Framework, Financial, Advanced
- BC-03, Real Options Analysis, Financial, Expert
- BC-04, Opportunity Cost Framework, Financial, Standard
- BC-05, Risk-Adjusted Return Model, Financial, Advanced
- BC-06, Economic Value Added, Financial, Advanced
- BC-07, Payback and Break-Even, Financial, Standard

ORGANIZATIONAL CHANGE (6):
- OC-01, McKinsey 7-S Model, Change, Standard
- OC-02, Kotter 8-Step Model, Change, Standard
- OC-03, ADKAR Model, Change, Standard
- OC-04, Burke-Litwin Model, Change, Advanced
- OC-05, Lewin Change Model, Change, Standard
- OC-06, Bridges Transition Model, Change, Advanced

STRATEGIC PLANNING (8):
- SP-01, OKRs Framework, Planning, Standard
- SP-02, Balanced Scorecard, Planning, Advanced
- SP-03, VRIO Analysis, Planning, Advanced
- SP-04, Blue Ocean Strategy, Planning, Advanced
- SP-05, Hoshin Kanri, Planning, Expert
- SP-06, MoSCoW Prioritization, Planning, Standard
- SP-07, RICE Scoring, Planning, Standard
- SP-08, Weighted Decision Matrix, Planning, Standard

PROBLEM SOLVING (7):
- PS-01, MECE Framework, Problem, Standard
- PS-02, Issue Trees, Problem, Standard
- PS-03, Hypothesis-Driven Analysis, Problem, Advanced
- PS-04, 5 Whys Analysis, Problem, Standard
- PS-05, Pareto Analysis, Problem, Standard
- PS-06, Fishbone Diagram, Problem, Standard
- PS-07, Force Field Analysis, Problem, Standard

EXECUTION:
1. Generate CSV with all 60 records
2. Use Dataverse import or Power Automate to load
3. Verify record count = 60
4. Validate category distribution

VALIDATION:
SELECT COUNT(*) FROM ca_framework -- Should be 60
SELECT category_code, COUNT(*) FROM ca_framework GROUP BY category_code
```

### 7.3: Add CST Capabilities to eap_capability

```
TASK: Register CST Agent Capabilities

TABLE: eap_capability

NEW RECORDS:

1. CST_FRAMEWORK_SELECT
   - capability_code: CST_FRAMEWORK_SELECT
   - capability_name: Select Consulting Framework
   - description: Recommend appropriate frameworks based on challenge type and context
   - agent_code: CST
   - input_schema: {"challenge_type": "string", "industry": "string", "complexity": "string"}
   - output_schema: {"frameworks": [{"code": "string", "name": "string", "fit_score": "number", "rationale": "string"}]}
   - is_active: true

2. CST_ENGAGEMENT_GUIDE
   - capability_code: CST_ENGAGEMENT_GUIDE
   - capability_name: Guide Consulting Engagement
   - description: Guide user through discovery, assessment, recommendations, roadmap phases
   - agent_code: CST
   - input_schema: {"current_phase": "string", "context": "object"}
   - output_schema: {"guidance": "string", "next_steps": ["string"], "questions": ["string"]}
   - is_active: true

3. CST_STRATEGIC_ANALYZE
   - capability_code: CST_STRATEGIC_ANALYZE
   - capability_name: Apply Strategic Analysis
   - description: Apply strategic framework to analyze situation
   - agent_code: CST
   - input_schema: {"framework_code": "string", "inputs": "object"}
   - output_schema: {"analysis": "object", "insights": ["string"], "recommendations": ["string"]}
   - is_active: true

4. CST_PRIORITIZE
   - capability_code: CST_PRIORITIZE
   - capability_name: Prioritize Initiatives
   - description: Score and rank initiatives using RICE, weighted matrix, or MoSCoW
   - agent_code: CST
   - input_schema: {"method": "string", "items": [{"name": "string", "attributes": "object"}], "criteria": "object"}
   - output_schema: {"ranked_items": [{"name": "string", "score": "number", "rank": "number"}], "rationale": "string"}
   - is_active: true

ALSO ADD TO eap_capability_implementation (both environments):
- All 4 capabilities get AI_BUILDER_PROMPT implementation
- implementation_reference: CST_FRAMEWORK_SELECT_PROMPT, etc.
- priority_order: 1
- is_enabled: true
```

### 7.4: Add CHG Capabilities to eap_capability

```
TASK: Register CHG Agent Capabilities

TABLE: eap_capability

NEW RECORDS:

1. CHG_READINESS
   - capability_code: CHG_READINESS
   - capability_name: Assess Change Readiness
   - description: Evaluate organizational readiness for change initiative
   - agent_code: CHG
   - input_schema: {"change_description": "string", "org_context": "object"}
   - output_schema: {"readiness_score": "number", "strengths": ["string"], "gaps": ["string"], "recommendations": ["string"]}
   - is_active: true

2. CHG_STAKEHOLDER
   - capability_code: CHG_STAKEHOLDER
   - capability_name: Map Stakeholders
   - description: Identify and analyze stakeholders for change initiative
   - agent_code: CHG
   - input_schema: {"change_description": "string", "stakeholder_list": ["string"]}
   - output_schema: {"stakeholder_map": [{"name": "string", "power": "string", "interest": "string", "strategy": "string"}]}
   - is_active: true

3. CHG_ADOPTION
   - capability_code: CHG_ADOPTION
   - capability_name: Plan Adoption
   - description: Create adoption and rollout plan for change initiative
   - agent_code: CHG
   - input_schema: {"change_description": "string", "timeline": "string", "constraints": "object"}
   - output_schema: {"phases": [{"name": "string", "activities": ["string"], "duration": "string"}], "success_metrics": ["string"]}
   - is_active: true

ALSO ADD TO eap_capability_implementation (both environments):
- All 3 capabilities get AI_BUILDER_PROMPT implementation
- implementation_reference: CHG_READINESS_PROMPT, etc.
- priority_order: 1
- is_enabled: true
```

### 7.5: Add ANL Financial Capabilities

```
TASK: Register ANL Financial Capabilities (CA Extension)

TABLE: eap_capability

NEW RECORDS:

1. ANL_NPV
   - capability_code: ANL_NPV
   - capability_name: Calculate NPV
   - description: Calculate net present value with sensitivity analysis
   - agent_code: ANL
   - input_schema: {"cash_flows": [number], "discount_rate": "number", "initial_investment": "number"}
   - output_schema: {"npv": "number", "sensitivity": {"rate_minus_1": "number", "rate_plus_1": "number"}}
   - is_active: true

2. ANL_IRR
   - capability_code: ANL_IRR
   - capability_name: Calculate IRR
   - description: Calculate internal rate of return
   - agent_code: ANL
   - input_schema: {"cash_flows": [number], "initial_investment": "number"}
   - output_schema: {"irr": "number", "mirr": "number", "payback_years": "number"}
   - is_active: true

3. ANL_TCO
   - capability_code: ANL_TCO
   - capability_name: Calculate TCO
   - description: Calculate total cost of ownership
   - agent_code: ANL
   - input_schema: {"acquisition_cost": "number", "operating_costs": [number], "years": "number", "hidden_costs": "object"}
   - output_schema: {"tco": "number", "annual_breakdown": [number], "cost_categories": "object"}
   - is_active: true

4. ANL_MONTECARLO
   - capability_code: ANL_MONTECARLO
   - capability_name: Monte Carlo Simulation
   - description: Run Monte Carlo simulation for uncertainty analysis
   - agent_code: ANL
   - input_schema: {"variables": [{"name": "string", "distribution": "string", "params": "object"}], "model": "string", "iterations": "number"}
   - output_schema: {"mean": "number", "std_dev": "number", "percentiles": {"p10": "number", "p50": "number", "p90": "number"}}
   - is_active: true

5. ANL_SENSITIVITY
   - capability_code: ANL_SENSITIVITY
   - capability_name: Sensitivity Analysis
   - description: Perform tornado/spider sensitivity analysis
   - agent_code: ANL
   - input_schema: {"base_case": "object", "variables": [{"name": "string", "low": "number", "high": "number"}]}
   - output_schema: {"tornado_data": [{"variable": "string", "low_impact": "number", "high_impact": "number"}]}
   - is_active: true

6. ANL_PAYBACK
   - capability_code: ANL_PAYBACK
   - capability_name: Calculate Payback
   - description: Calculate payback period and break-even
   - agent_code: ANL
   - input_schema: {"initial_investment": "number", "cash_flows": [number], "discount_rate": "number"}
   - output_schema: {"simple_payback": "number", "discounted_payback": "number", "break_even_units": "number"}
   - is_active: true

IMPLEMENTATION REGISTRATION:
- AI_BUILDER_PROMPT for all (both environments)
- AZURE_FUNCTION for ANL_NPV, ANL_IRR, ANL_MONTECARLO, ANL_SENSITIVITY (personal only)
```

### 7.6: Add DOC Consulting Capabilities

```
TASK: Register DOC Consulting Capabilities (CA Extension)

TABLE: eap_capability

NEW RECORDS:

1. DOC_BUSINESSCASE
   - capability_code: DOC_BUSINESSCASE
   - capability_name: Generate Business Case
   - description: Generate business case document from analysis
   - agent_code: DOC
   - input_schema: {"title": "string", "problem": "string", "solution": "string", "financials": "object", "risks": ["string"]}
   - output_schema: {"document_url": "string", "sections": ["string"]}
   - is_active: true

2. DOC_ROADMAP
   - capability_code: DOC_ROADMAP
   - capability_name: Generate Roadmap
   - description: Generate implementation roadmap document
   - agent_code: DOC
   - input_schema: {"title": "string", "phases": [{"name": "string", "milestones": ["string"]}], "timeline": "string"}
   - output_schema: {"document_url": "string", "gantt_data": "object"}
   - is_active: true

IMPLEMENTATION REGISTRATION:
- AI_BUILDER_PROMPT for both (both environments)
```

---

## PHASE 8: AI BUILDER PROMPTS (Days 16-18)

### 8.1: Create CST AI Builder Prompts

```
TASK: Create AI Builder Custom Prompts for CST Agent

LOCATION: base/platform/eap/prompts/

CREATE 4 PROMPT DEFINITION FILES:

1. CST_FRAMEWORK_SELECT_PROMPT.json
{
  "prompt_code": "CST_FRAMEWORK_SELECT",
  "prompt_name": "Select Consulting Framework",
  "model": "gpt-4",
  "system_message": "You are a strategic consulting expert. Given a business challenge, recommend the most appropriate consulting frameworks. Consider the challenge type, industry context, and complexity level. Reference the ca_framework table for available frameworks. Always provide 2-3 options with rationale for each.",
  "user_template": "Challenge: {{challenge_type}}\nIndustry: {{industry}}\nComplexity: {{complexity}}\n\nRecommend appropriate frameworks with fit scores (1-10) and rationale.",
  "output_format": "json",
  "max_tokens": 1000,
  "temperature": 0.3
}

2. CST_ENGAGEMENT_GUIDE_PROMPT.json
{
  "prompt_code": "CST_ENGAGEMENT_GUIDE",
  "prompt_name": "Guide Consulting Engagement",
  "model": "gpt-4",
  "system_message": "You are a consulting engagement manager. Guide the user through a structured consulting process: Discovery > Assessment > Recommendations > Roadmap. Ask clarifying questions, provide next steps, and ensure thoroughness at each phase.",
  "user_template": "Current Phase: {{current_phase}}\nContext: {{context}}\n\nProvide guidance for this phase including questions to ask and next steps.",
  "output_format": "json",
  "max_tokens": 1500,
  "temperature": 0.4
}

3. CST_STRATEGIC_ANALYZE_PROMPT.json
{
  "prompt_code": "CST_STRATEGIC_ANALYZE",
  "prompt_name": "Apply Strategic Analysis",
  "model": "gpt-4",
  "system_message": "You are a strategic analyst. Apply the specified consulting framework rigorously to the provided inputs. Generate structured analysis, key insights, and actionable recommendations. Follow the framework methodology precisely.",
  "user_template": "Framework: {{framework_code}}\nInputs: {{inputs}}\n\nApply the framework and provide structured analysis.",
  "output_format": "json",
  "max_tokens": 2000,
  "temperature": 0.3
}

4. CST_PRIORITIZE_PROMPT.json
{
  "prompt_code": "CST_PRIORITIZE",
  "prompt_name": "Prioritize Initiatives",
  "model": "gpt-4",
  "system_message": "You are a prioritization expert. Apply the specified method (RICE, Weighted Matrix, MoSCoW) to score and rank the provided items. Show your work for each score calculation. Provide clear rationale for the final ranking.",
  "user_template": "Method: {{method}}\nItems: {{items}}\nCriteria: {{criteria}}\n\nScore each item and provide ranked list with rationale.",
  "output_format": "json",
  "max_tokens": 1500,
  "temperature": 0.2
}

REGISTER IN eap_prompt TABLE:
- Insert record for each prompt
- Link to CST agent
- Set is_active = true
```

### 8.2: Create CHG AI Builder Prompts

```
TASK: Create AI Builder Custom Prompts for CHG Agent

LOCATION: base/platform/eap/prompts/

CREATE 3 PROMPT DEFINITION FILES:

1. CHG_READINESS_PROMPT.json
{
  "prompt_code": "CHG_READINESS",
  "prompt_name": "Assess Change Readiness",
  "model": "gpt-4",
  "system_message": "You are a change management expert. Assess organizational readiness for the described change initiative. Evaluate leadership alignment, culture, capability, and capacity. Provide a readiness score (1-10), identify strengths and gaps, and recommend preparation actions.",
  "user_template": "Change Initiative: {{change_description}}\nOrganizational Context: {{org_context}}\n\nAssess readiness and provide recommendations.",
  "output_format": "json",
  "max_tokens": 1500,
  "temperature": 0.3
}

2. CHG_STAKEHOLDER_PROMPT.json
{
  "prompt_code": "CHG_STAKEHOLDER",
  "prompt_name": "Map Stakeholders",
  "model": "gpt-4",
  "system_message": "You are a stakeholder management expert. Create a stakeholder map using the Power/Interest grid. For each stakeholder, assess their power level, interest level, current position (supporter/neutral/resistor), and recommend an engagement strategy.",
  "user_template": "Change Initiative: {{change_description}}\nStakeholders: {{stakeholder_list}}\n\nCreate stakeholder map with engagement strategies.",
  "output_format": "json",
  "max_tokens": 1500,
  "temperature": 0.3
}

3. CHG_ADOPTION_PROMPT.json
{
  "prompt_code": "CHG_ADOPTION",
  "prompt_name": "Plan Adoption",
  "model": "gpt-4",
  "system_message": "You are an adoption planning expert. Create a phased adoption plan for the change initiative. Include training approach, communication plan, pilot strategy, and rollout sequence. Define success metrics and monitoring approach.",
  "user_template": "Change Initiative: {{change_description}}\nTimeline: {{timeline}}\nConstraints: {{constraints}}\n\nCreate adoption plan with phases and metrics.",
  "output_format": "json",
  "max_tokens": 2000,
  "temperature": 0.4
}

REGISTER IN eap_prompt TABLE:
- Insert record for each prompt
- Link to CHG agent
- Set is_active = true
```

### 8.3: Create ANL Financial Prompts

```
TASK: Create AI Builder Custom Prompts for ANL Financial Capabilities

LOCATION: base/platform/eap/prompts/

CREATE 6 PROMPT DEFINITION FILES:

1. ANL_NPV_PROMPT.json
{
  "prompt_code": "ANL_NPV",
  "prompt_name": "Calculate NPV",
  "model": "gpt-4",
  "system_message": "You are a financial analyst. Calculate Net Present Value using the provided cash flows and discount rate. Also perform sensitivity analysis at +/- 1% discount rate. Show your calculations step by step.",
  "user_template": "Initial Investment: {{initial_investment}}\nCash Flows: {{cash_flows}}\nDiscount Rate: {{discount_rate}}\n\nCalculate NPV with sensitivity analysis.",
  "output_format": "json",
  "max_tokens": 1000,
  "temperature": 0.1
}

2. ANL_IRR_PROMPT.json
{
  "prompt_code": "ANL_IRR",
  "prompt_name": "Calculate IRR",
  "model": "gpt-4",
  "system_message": "You are a financial analyst. Calculate Internal Rate of Return, Modified IRR (using 10% reinvestment rate), and simple payback period. Interpret the results in context of typical investment hurdle rates.",
  "user_template": "Initial Investment: {{initial_investment}}\nCash Flows: {{cash_flows}}\n\nCalculate IRR, MIRR, and payback.",
  "output_format": "json",
  "max_tokens": 1000,
  "temperature": 0.1
}

3. ANL_TCO_PROMPT.json
{
  "prompt_code": "ANL_TCO",
  "prompt_name": "Calculate TCO",
  "model": "gpt-4",
  "system_message": "You are a financial analyst. Calculate Total Cost of Ownership including acquisition, operating, and hidden costs. Break down by year and by cost category. Identify often-overlooked cost components.",
  "user_template": "Acquisition Cost: {{acquisition_cost}}\nOperating Costs: {{operating_costs}}\nYears: {{years}}\nHidden Costs: {{hidden_costs}}\n\nCalculate TCO with breakdown.",
  "output_format": "json",
  "max_tokens": 1200,
  "temperature": 0.2
}

4. ANL_MONTECARLO_PROMPT.json
{
  "prompt_code": "ANL_MONTECARLO",
  "prompt_name": "Monte Carlo Simulation",
  "model": "gpt-4",
  "system_message": "You are a quantitative analyst. Describe how to set up and interpret a Monte Carlo simulation for the provided model. Define appropriate distributions for uncertain variables. Note: Actual simulation requires Azure Function; this prompt provides setup and interpretation guidance.",
  "user_template": "Model: {{model}}\nVariables: {{variables}}\nIterations: {{iterations}}\n\nDescribe simulation setup and expected interpretation.",
  "output_format": "json",
  "max_tokens": 1500,
  "temperature": 0.3
}

5. ANL_SENSITIVITY_PROMPT.json
{
  "prompt_code": "ANL_SENSITIVITY",
  "prompt_name": "Sensitivity Analysis",
  "model": "gpt-4",
  "system_message": "You are a financial analyst. Perform sensitivity analysis on the provided model. Identify which variables have the greatest impact on outcomes. Provide tornado diagram data and interpretation.",
  "user_template": "Base Case: {{base_case}}\nVariables: {{variables}}\n\nPerform sensitivity analysis and rank variable impacts.",
  "output_format": "json",
  "max_tokens": 1200,
  "temperature": 0.2
}

6. ANL_PAYBACK_PROMPT.json
{
  "prompt_code": "ANL_PAYBACK",
  "prompt_name": "Calculate Payback",
  "model": "gpt-4",
  "system_message": "You are a financial analyst. Calculate simple payback period and discounted payback period. Also calculate break-even point if unit economics are provided. Interpret results in investment decision context.",
  "user_template": "Initial Investment: {{initial_investment}}\nCash Flows: {{cash_flows}}\nDiscount Rate: {{discount_rate}}\n\nCalculate payback periods and break-even.",
  "output_format": "json",
  "max_tokens": 1000,
  "temperature": 0.1
}
```

### 8.4: Create DOC Consulting Prompts

```
TASK: Create AI Builder Custom Prompts for DOC Consulting Capabilities

LOCATION: base/platform/eap/prompts/

CREATE 2 PROMPT DEFINITION FILES:

1. DOC_BUSINESSCASE_PROMPT.json
{
  "prompt_code": "DOC_BUSINESSCASE",
  "prompt_name": "Generate Business Case",
  "model": "gpt-4",
  "system_message": "You are a business case writer. Generate a structured business case document with: Executive Summary, Problem Statement, Proposed Solution, Financial Analysis, Risk Assessment, Implementation Approach, and Recommendation. Use professional consulting language.",
  "user_template": "Title: {{title}}\nProblem: {{problem}}\nSolution: {{solution}}\nFinancials: {{financials}}\nRisks: {{risks}}\n\nGenerate business case content.",
  "output_format": "json",
  "max_tokens": 3000,
  "temperature": 0.4
}

2. DOC_ROADMAP_PROMPT.json
{
  "prompt_code": "DOC_ROADMAP",
  "prompt_name": "Generate Roadmap",
  "model": "gpt-4",
  "system_message": "You are an implementation planner. Generate a structured roadmap document with: Executive Overview, Current State Summary, Future State Vision, Phased Approach (with milestones and dependencies), Resource Requirements, Risk Mitigation, Success Metrics, and Governance Model.",
  "user_template": "Title: {{title}}\nPhases: {{phases}}\nTimeline: {{timeline}}\n\nGenerate roadmap content with Gantt data.",
  "output_format": "json",
  "max_tokens": 3000,
  "temperature": 0.4
}
```

### 8.5: Register All Prompts in eap_prompt

```
TASK: Register All New Prompts in Dataverse

TABLE: eap_prompt

RECORDS TO INSERT (15 total):

CST Prompts (4):
- CST_FRAMEWORK_SELECT, Select Consulting Framework, CST
- CST_ENGAGEMENT_GUIDE, Guide Consulting Engagement, CST
- CST_STRATEGIC_ANALYZE, Apply Strategic Analysis, CST
- CST_PRIORITIZE, Prioritize Initiatives, CST

CHG Prompts (3):
- CHG_READINESS, Assess Change Readiness, CHG
- CHG_STAKEHOLDER, Map Stakeholders, CHG
- CHG_ADOPTION, Plan Adoption, CHG

ANL Financial Prompts (6):
- ANL_NPV, Calculate NPV, ANL
- ANL_IRR, Calculate IRR, ANL
- ANL_TCO, Calculate TCO, ANL
- ANL_MONTECARLO, Monte Carlo Simulation, ANL
- ANL_SENSITIVITY, Sensitivity Analysis, ANL
- ANL_PAYBACK, Calculate Payback, ANL

DOC Consulting Prompts (2):
- DOC_BUSINESSCASE, Generate Business Case, DOC
- DOC_ROADMAP, Generate Roadmap, DOC

VALIDATION:
SELECT COUNT(*) FROM eap_prompt WHERE agent_code IN ('CST', 'CHG') -- Should be 7
SELECT COUNT(*) FROM eap_prompt WHERE prompt_code LIKE 'ANL_%' -- Should include 6 new
SELECT COUNT(*) FROM eap_prompt WHERE prompt_code LIKE 'DOC_%' -- Should include 2 new
```

---

## PHASE 9: AZURE FUNCTIONS - PERSONAL ONLY (Days 19-21)

### 9.1-9.4: Create ANL Financial Functions

```
TASK: Create Azure Functions for Complex Financial Calculations

LOCATION: environments/personal/functions/

NOTE: These functions provide enhanced computation for Personal environment ONLY.
NOT available in Mastercard (DLP blocked). AI Builder prompts serve as fallback.

CREATE 4 FUNCTIONS:

1. anl-npv-function/
   - Language: Python
   - Trigger: HTTP
   - Purpose: Precise NPV calculation with sensitivity analysis
   - Features:
     - Handles irregular cash flow timing
     - Multi-scenario sensitivity (rate, growth, timing)
     - Returns visualization-ready data
   
   def calculate_npv(cash_flows, discount_rate, initial_investment):
       # Standard NPV calculation
       # Sensitivity at -2%, -1%, +1%, +2%
       # Return JSON with npv, sensitivity_table, chart_data

2. anl-irr-function/
   - Language: Python
   - Trigger: HTTP
   - Purpose: IRR calculation with MIRR and payback
   - Features:
     - Newton-Raphson IRR solver
     - MIRR with configurable reinvestment rate
     - Cumulative cash flow for payback
   
   def calculate_irr(cash_flows, initial_investment, reinvestment_rate=0.10):
       # IRR using scipy.optimize
       # MIRR calculation
       # Simple and discounted payback
       # Return JSON

3. anl-montecarlo-function/
   - Language: Python
   - Trigger: HTTP
   - Purpose: Monte Carlo simulation for uncertainty analysis
   - Features:
     - Support for normal, triangular, uniform distributions
     - 10,000 iterations by default
     - Percentile calculations (P10, P50, P90)
     - Histogram data for visualization
   
   def run_montecarlo(model, variables, iterations=10000):
       # numpy random sampling
       # Run model iterations
       # Calculate statistics
       # Return JSON with results, histogram_data

4. anl-sensitivity-function/
   - Language: Python
   - Trigger: HTTP
   - Purpose: Tornado diagram sensitivity analysis
   - Features:
     - Variable impact ranking
     - Tornado diagram data format
     - Spider diagram data format
   
   def analyze_sensitivity(base_case, variables):
       # Calculate impact of each variable at +/- range
       # Rank by impact magnitude
       # Return tornado_data, spider_data
```

### 9.5-9.6: Deploy and Register Functions

```
TASK: Deploy Functions and Register Implementations

DEPLOYMENT STEPS:
1. cd environments/personal/functions/
2. func azure functionapp publish kdap-anl-functions
3. Verify deployment in Azure Portal
4. Test each endpoint with sample payloads

REGISTER IN eap_capability_implementation (Personal environment ONLY):

ANL_NPV:
- capability_code: ANL_NPV
- environment_code: PERSONAL
- implementation_type: AZURE_FUNCTION
- implementation_reference: https://kdap-anl-functions.azurewebsites.net/api/anl-npv
- priority_order: 1 (preferred over AI Builder)
- is_enabled: true
- fallback_implementation_id: [AI_BUILDER implementation ID]

ANL_IRR:
- capability_code: ANL_IRR
- environment_code: PERSONAL
- implementation_type: AZURE_FUNCTION
- implementation_reference: https://kdap-anl-functions.azurewebsites.net/api/anl-irr
- priority_order: 1
- is_enabled: true
- fallback_implementation_id: [AI_BUILDER implementation ID]

ANL_MONTECARLO:
- capability_code: ANL_MONTECARLO
- environment_code: PERSONAL
- implementation_type: AZURE_FUNCTION
- implementation_reference: https://kdap-anl-functions.azurewebsites.net/api/anl-montecarlo
- priority_order: 1
- is_enabled: true
- fallback_implementation_id: [AI_BUILDER implementation ID]

ANL_SENSITIVITY:
- capability_code: ANL_SENSITIVITY
- environment_code: PERSONAL
- implementation_type: AZURE_FUNCTION
- implementation_reference: https://kdap-anl-functions.azurewebsites.net/api/anl-sensitivity
- priority_order: 1
- is_enabled: true
- fallback_implementation_id: [AI_BUILDER implementation ID]

NOTE: Mastercard environment uses AI_BUILDER_PROMPT only (priority 1, no Azure Function)
```

---

## PHASE 10: TESTING & VALIDATION (Days 22-24)

### 10.1: Create CST Test Scenarios

```
TASK: Create Test Scenarios for CST Agent

LOCATION: base/agents/cst/tests/

CREATE TEST FILE: CST_Test_Scenarios.json

{
  "agent": "CST",
  "test_scenarios": [
    {
      "id": "CST-001",
      "name": "Framework Selection - Market Entry",
      "input": "We're considering entering the European market with our SaaS product. What frameworks should we use?",
      "expected_capability": "CST_FRAMEWORK_SELECT",
      "expected_frameworks": ["PESTEL", "Porter Five Forces", "TAM/SAM/SOM"],
      "validation": "Response includes at least 2 of expected frameworks with rationale"
    },
    {
      "id": "CST-002", 
      "name": "Prioritization - RICE Scoring",
      "input": "Help me prioritize these 5 product features using RICE: Feature A (10K users, high impact), Feature B (50K users, low impact), Feature C (5K users, massive impact), Feature D (20K users, medium impact), Feature E (100K users, minimal impact)",
      "expected_capability": "CST_PRIORITIZE",
      "expected_method": "RICE",
      "validation": "Response shows RICE calculation for each feature and provides ranked list"
    },
    {
      "id": "CST-003",
      "name": "Strategic Analysis - SWOT",
      "input": "Perform a SWOT analysis for our digital marketing agency competing against larger holding companies",
      "expected_capability": "CST_STRATEGIC_ANALYZE",
      "expected_framework": "SWOT",
      "validation": "Response has all 4 quadrants populated with relevant insights"
    },
    {
      "id": "CST-004",
      "name": "Engagement Guide - Discovery Phase",
      "input": "I'm starting a consulting engagement to assess a client's martech stack. What should I focus on in the discovery phase?",
      "expected_capability": "CST_ENGAGEMENT_GUIDE",
      "expected_phase": "Discovery",
      "validation": "Response includes discovery questions, stakeholder identification, scope definition"
    },
    {
      "id": "CST-005",
      "name": "Route to ANL",
      "input": "Calculate the NPV of this investment with $100K initial cost and $30K annual returns for 5 years",
      "expected_routing": "ANL",
      "expected_capability": "ANL_NPV",
      "validation": "Request is routed to ANL agent, not handled by CST"
    }
  ]
}
```

### 10.2: Create CHG Test Scenarios

```
TASK: Create Test Scenarios for CHG Agent

LOCATION: base/agents/chg/tests/

CREATE TEST FILE: CHG_Test_Scenarios.json

{
  "agent": "CHG",
  "test_scenarios": [
    {
      "id": "CHG-001",
      "name": "Change Readiness Assessment",
      "input": "Assess our organization's readiness to implement a new CRM system. We have 500 employees, previous IT projects have had mixed success, and leadership is supportive but middle management is skeptical.",
      "expected_capability": "CHG_READINESS",
      "validation": "Response includes readiness score, identifies leadership support as strength, middle management as gap, provides recommendations"
    },
    {
      "id": "CHG-002",
      "name": "Stakeholder Mapping",
      "input": "Map stakeholders for our ERP implementation: CEO (sponsor), CFO (budget owner), IT Director (implementer), Department Heads (users), Front-line staff (end users)",
      "expected_capability": "CHG_STAKEHOLDER",
      "validation": "Response uses Power/Interest grid, provides engagement strategy for each stakeholder"
    },
    {
      "id": "CHG-003",
      "name": "Adoption Planning",
      "input": "Create an adoption plan for rolling out Microsoft Teams to replace Slack across our 1,000 person organization over 6 months",
      "expected_capability": "CHG_ADOPTION",
      "validation": "Response includes phased rollout, training approach, communication plan, success metrics"
    },
    {
      "id": "CHG-004",
      "name": "Route to CST",
      "input": "What frameworks should I use to analyze this organizational change?",
      "expected_routing": "CST",
      "expected_capability": "CST_FRAMEWORK_SELECT",
      "validation": "Framework selection routed to CST, not handled by CHG"
    },
    {
      "id": "CHG-005",
      "name": "Kotter 8-Step Application",
      "input": "Guide me through using Kotter's 8-step model for our digital transformation initiative",
      "expected_capability": "CHG_READINESS or KB retrieval",
      "validation": "Response references all 8 steps with specific guidance for digital transformation context"
    }
  ]
}
```

### 10.3-10.5: Run Full Test Suite

```
TASK: Execute Full Platform Test Suite

EXECUTION STEPS:

1. ORC ROUTING TESTS
   - Verify CST intents route to CST
   - Verify CHG intents route to CHG
   - Verify financial intents route to ANL
   - Verify mixed intents handled correctly
   
   Test queries:
   - "Help me with a SWOT analysis" -> CST
   - "Assess our change readiness" -> CHG
   - "Calculate NPV for this investment" -> ANL
   - "Create a business case document" -> DOC
   - "Help me prioritize using RICE and then calculate the ROI" -> CST -> ANL

2. CAPABILITY EXECUTION TESTS
   - Test each new capability with valid inputs
   - Test error handling with invalid inputs
   - Test fallback when primary implementation fails
   
   For each capability:
   - Send valid request, verify response structure
   - Send malformed request, verify error message
   - (Personal only) Disable Azure Function, verify AI Builder fallback

3. KB RETRIEVAL TESTS
   - Verify core KB retrieved for each agent
   - Verify deep modules retrieved by context
   - Verify EAP shared KB accessible to all agents
   
   Test queries:
   - CST query -> should retrieve CST_KB_Consulting_Core + relevant deep module
   - CHG query -> should retrieve CHG_KB_Change_Core + relevant deep module
   - Both should have access to EAP_KB_Confidence_Levels when discussing uncertainty

4. END-TO-END SCENARIOS
   - Complete consulting engagement flow
   - Business case generation flow
   - Transformation roadmap flow
   
   Scenario: "I need to build a business case for implementing a CDP"
   Expected flow:
   1. ORC routes to CST
   2. CST guides discovery, recommends frameworks
   3. CST routes financial questions to ANL
   4. ANL calculates NPV, IRR, TCO
   5. DOC generates business case document

VALIDATION CRITERIA:
- All routing tests pass (100%)
- All capability tests pass (95%+ acceptable)
- All KB retrieval tests pass (100%)
- End-to-end scenarios complete successfully

ISSUE TRACKING:
- Log all failures with: test_id, expected, actual, error_message
- Categorize: routing_bug, capability_bug, kb_bug, prompt_bug
- Prioritize fixes by impact
```

---

## PHASE 11: DEPLOYMENT (Days 25-27)

### 11.1-11.2: Deploy to Personal Environment

```
TASK: Deploy Complete Platform to Personal Environment (Aragorn AI)

PRE-DEPLOYMENT CHECKLIST:
[ ] All Phase 10 tests passing
[ ] All KB files committed to repo
[ ] All Dataverse schema deployed
[ ] All seed data loaded
[ ] All AI Builder prompts created
[ ] All Azure Functions deployed
[ ] All capability implementations registered

DEPLOYMENT STEPS:

1. COPILOT STUDIO AGENTS
   - Import/update ORC agent with new routing rules
   - Import/update ANL agent with financial capabilities
   - Import/update DOC agent with consulting templates
   - Create CST agent (new)
   - Create CHG agent (new)
   
   For each agent:
   - Upload instruction file
   - Configure KB sources (SharePoint)
   - Link to capability dispatcher flow
   - Test basic query

2. SHAREPOINT KB
   - Sync all KB files to SharePoint document library
   - Verify file accessibility from Copilot Studio
   - Check file sizes (all under limits)

3. POWER AUTOMATE FLOWS
   - Verify capability dispatcher flow updated
   - Verify all implementation flows working
   - Test flow connections

4. INTEGRATION TEST
   - Run smoke test suite
   - Verify cross-agent routing
   - Verify capability execution
   - Verify document generation

ROLLBACK PLAN:
- Keep previous agent versions
- Database backup before deployment
- Documented rollback steps
```

### 11.3-11.4: Deploy to Mastercard Environment

```
TASK: Deploy Complete Platform to Mastercard Environment

PRE-DEPLOYMENT CHECKLIST:
[ ] Personal environment deployment successful
[ ] All tests passing in Personal
[ ] Mastercard-specific configurations ready
[ ] No Azure Function dependencies in core flows
[ ] All capabilities have AI Builder fallbacks

DEPLOYMENT STEPS:

1. DATAVERSE SCHEMA
   - Deploy ca_framework, ca_project, ca_deliverable tables
   - Load seed data
   - Verify lookup relationships

2. COPILOT STUDIO AGENTS
   - Same process as Personal
   - Verify DLP compliance (no HTTP connector usage)

3. SHAREPOINT KB
   - Upload all KB files to Mastercard SharePoint
   - Verify accessibility

4. CAPABILITY IMPLEMENTATION
   - Register AI_BUILDER_PROMPT only (no Azure Functions)
   - Verify all capabilities work via AI Builder

5. INTEGRATION TEST
   - Run smoke test suite
   - Verify cross-agent routing
   - Verify all capabilities work WITHOUT Azure Functions
   - Verify document generation

MASTERCARD-SPECIFIC VALIDATION:
- No external HTTP calls
- All computation via AI Builder or Power Fx
- Approved connectors only
```

### 11.5: Documentation Finalization

```
TASK: Finalize Deployment Documentation

CREATE/UPDATE DOCUMENTS:

1. DEPLOYMENT_GUIDE.md
   - Complete deployment steps for both environments
   - Environment-specific configurations
   - Troubleshooting guide
   - Rollback procedures

2. AGENT_REFERENCE.md
   - All 10 agents with capabilities
   - Routing rules
   - KB file inventory
   - Test scenarios

3. CAPABILITY_CATALOG.md
   - All 35+ capabilities
   - Input/output schemas
   - Implementation types by environment
   - Usage examples

4. RELEASE_NOTES_v6.0.md
   - New agents: CST, CHG
   - Extended agents: ANL (financial), DOC (consulting)
   - New tables: ca_framework, ca_project, ca_deliverable
   - New capabilities: 15
   - Deprecated: NDS, CSO, UDM (archived)

5. Update README.md
   - Architecture overview
   - Quick start guide
   - Links to detailed docs

COMMIT AND TAG:
git add docs/
git commit -m "docs: Complete v6.0 deployment documentation"
git tag -a v6.0.0 -m "KDAP v6.0 - 10-Agent Platform with CA Integration"
git push origin feature/v6.0-kb-expansion --tags
```

---

## QUICK COMMAND REFERENCE

### Git Commands
```bash
# Check status
git status

# Stage and commit
git add -A
git commit -m "type(scope): message"

# Push
git push origin feature/v6.0-kb-expansion

# Tag release
git tag -a v6.0.0 -m "message"
git push origin --tags
```

### Validation Commands
```bash
# Check for non-ASCII characters
perl -ne 'print "Non-ASCII at line $.: $_" if /[^\x00-\x7F]/' file.txt

# Count characters
wc -c file.txt

# List files by size
ls -lhS directory/
```

### Power Platform CLI
```bash
# Authenticate
pac auth create

# Export solution
pac solution export --path ./solution.zip --name SolutionName

# Import solution
pac solution import --path ./solution.zip

# Publish customizations
pac solution publish
```

---

**Document Version:** 1.0  
**Created:** January 18, 2026  
**Companion to:** KDAP_Master_Build_Plan.md
