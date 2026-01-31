# MPA v6.0 ARCHITECTURE PIVOT (REVISED)

**CRITICAL: STOP ALL CURRENT WORK AND READ THIS DOCUMENT**

**Date:** January 18, 2026  
**Version:** 2.0 (Replaces v1.0)  
**Status:** Mandatory Architecture Change  
**Supersedes:** All previous KB expansion plans, v1.0 pivot document

---

## EXECUTIVE SUMMARY

The 96-file KB expansion is cancelled, but we are NOT aggressively consolidating to 25 files. Instead, we implement a **7 Agents + Deep Modules** architecture that:

- Keeps routing simple (7 agents, not 10+)
- Preserves analytical depth (deep modules per agent)
- Reassigns NDS/CSO content (not lost, just reorganized)
- Results in **31 KB files** (68% reduction from 96, but retains sophistication)

**Agents that DO NOT EXIST as standalone:** UDM, NDS, CSO, SYS

**Agents that DO EXIST:** ORC, ANL, AUD, CHA, SPO, DOC, PRF

**Key Insight:** The problem was agent sprawl, not KB depth. NDS and CSO capabilities belong as deep modules under ANL and AUD, not as separate agents.

---

## PART 1: ARCHITECTURE PRINCIPLES

### 1.1 Why 7 Agents (Not 10+)

Each agent requires:
- Copilot Studio configuration
- Routing logic in ORC
- Inter-agent communication flows
- Separate testing and evaluation

More agents = exponentially more routing complexity. The orchestrator has to classify intent and route correctly. With 10+ agents, misrouting becomes common.

**7 agents is the sweet spot** for the MPA domain: each has a distinct responsibility, routing is deterministic, and failures are isolated.

### 1.2 Why Deep Modules (Not Flat Consolidation)

Copilot Studio retrieves KB content based on semantic similarity to the user's query. If all analytics content is in one massive file, retrieval precision dropsâ€”the right section might not surface.

**Deep modules solve this:**
- Each module has focused content (~15-25K chars)
- Retrieval is more precise (query about "Bayesian priors" hits the Bayesian module, not generic analytics)
- Modules can be independently updated without risking other content

### 1.3 Core vs. Deep Module Pattern

Every agent has:

| Tier | Purpose | When Retrieved | Size |
|------|---------|----------------|------|
| **Core** | Foundational methodology, always-relevant guidance | Every query to this agent | 20-30K chars |
| **Deep** | Specialized methods for specific contexts | When specific topic detected | 15-25K chars |

The agent's instructions tell it which deep modules exist. Copilot retrieves the relevant ones based on query context.

---

## PART 2: COMPLETE FILE INVENTORY

### 2.1 ORC - Orchestrator Agent (2 files)

| File | Type | Purpose | Chars |
|------|------|---------|-------|
| ORC_Copilot_Instructions_v1.txt | Instructions | Agent behavior, routing rules | ~8K |
| ORC_KB_Routing_Logic_v1.txt | Core KB | Intent classification, workflow gates, fallbacks | ~25K |

**ORC does not need deep modules**â€”its job is routing, not analysis.

### 2.2 ANL - Analytics & Forecasting Agent (6 files)

| File | Type | Purpose | Chars |
|------|------|---------|-------|
| ANL_Copilot_Instructions_v1.txt | Instructions | Agent behavior | ~8K |
| ANL_KB_Analytics_Core_v1.txt | Core KB | General projections, formulas, confidence | ~25K |
| ANL_KB_MMM_Methods_v1.txt | Deep | Media Mix Modeling, decomposition, saturation | ~20K |
| ANL_KB_Bayesian_Inference_v1.txt | Deep | Priors, posteriors, uncertainty quantification | ~18K |
| ANL_KB_Causal_Incrementality_v1.txt | Deep | Causal ML, lift measurement, counterfactuals | ~20K |
| ANL_KB_Budget_Optimization_v1.txt | Deep | Marginal returns, response curves, allocation | ~22K |

**Absorbs from NDS:**
- Marginal return estimation â†’ ANL_KB_Budget_Optimization
- Spend/no-spend logic â†’ ANL_KB_Causal_Incrementality
- Multi-input integration â†’ ANL_KB_Analytics_Core
- Risk-adjusted allocation â†’ ANL_KB_Budget_Optimization
- Budget response functions â†’ ANL_KB_Budget_Optimization

### 2.3 AUD - Audience Intelligence Agent (6 files)

| File | Type | Purpose | Chars |
|------|------|---------|-------|
| AUD_Copilot_Instructions_v1.txt | Instructions | Agent behavior | ~8K |
| AUD_KB_Audience_Core_v1.txt | Core KB | General segmentation, targeting principles | ~25K |
| AUD_KB_Identity_Resolution_v1.txt | Deep | Graph algorithms, household, entity matching | ~22K |
| AUD_KB_LTV_Modeling_v1.txt | Deep | Cohort analysis, survival, value prediction | ~20K |
| AUD_KB_Propensity_ML_v1.txt | Deep | Classifiers, scoring, churn, intent | ~18K |
| AUD_KB_Journey_Orchestration_v1.txt | Deep | State models, sequencing, NBA, frequency | ~22K |

**Absorbs from CSO:**
- Journey state models â†’ AUD_KB_Journey_Orchestration
- Next-best-action â†’ AUD_KB_Journey_Orchestration
- Sequence timing optimization â†’ AUD_KB_Journey_Orchestration
- Frequency fatigue management â†’ AUD_KB_Journey_Orchestration
- Reinforcement learning for marketing â†’ AUD_KB_Journey_Orchestration (section)

**Absorbs from existing files:**
- FIRST_PARTY_DATA_STRATEGY_v1.txt â†’ AUD_KB_Audience_Core (section on 1P data)
- Identity graph algorithms (already created) â†’ AUD_KB_Identity_Resolution
- Card portfolio resolution (already created) â†’ AUD_KB_LTV_Modeling
- Household resolution (already created) â†’ AUD_KB_Identity_Resolution

### 2.4 CHA - Channel Strategy Agent (5 files)

| File | Type | Purpose | Chars |
|------|------|---------|-------|
| CHA_Copilot_Instructions_v1.txt | Instructions | Agent behavior | ~8K |
| CHA_KB_Channel_Core_v1.txt | Core KB | Selection methodology, funnel mapping | ~25K |
| CHA_KB_Allocation_Methods_v1.txt | Deep | Budget distribution, optimization approaches | ~20K |
| CHA_KB_Emerging_Channels_v1.txt | Deep | AI advertising, retail media, CTV advanced | ~22K |
| CHA_KB_Brand_Performance_v1.txt | Deep | Funnel balance, brand building vs. activation | ~20K |

**Absorbs from existing files:**
- AI_ADVERTISING_GUIDE_v1.txt â†’ CHA_KB_Emerging_Channels
- RETAIL_MEDIA_NETWORKS_v1.txt â†’ CHA_KB_Emerging_Channels
- BRAND_PERFORMANCE_FRAMEWORK_v1.txt â†’ CHA_KB_Brand_Performance

### 2.5 SPO - Supply Path Optimization Agent (4 files)

| File | Type | Purpose | Chars |
|------|------|---------|-------|
| SPO_Copilot_Instructions_v1.txt | Instructions | Agent behavior | ~8K |
| SPO_KB_SPO_Core_v1.txt | Core KB | Fee transparency, working media principles | ~20K |
| SPO_KB_Fee_Analysis_v1.txt | Deep | Fee waterfall, DSP/SSP breakdown | ~18K |
| SPO_KB_Partner_Evaluation_v1.txt | Deep | Vendor assessment, NBI calculation | ~18K |

**Note:** SPO is already well-structured from Phase 5. Minor reorganization only.

### 2.6 DOC - Document Generation Agent (3 files)

| File | Type | Purpose | Chars |
|------|------|---------|-------|
| DOC_Copilot_Instructions_v1.txt | Instructions | Agent behavior | ~8K |
| DOC_KB_Document_Core_v1.txt | Core KB | Template selection, structure principles | ~20K |
| DOC_KB_Export_Formats_v1.txt | Deep | DOCX/PDF/PPTX specifications, styling | ~15K |

**Note:** DOC is output-focused, doesn't need extensive deep modules.

### 2.7 PRF - Performance Intelligence Agent (5 files)

| File | Type | Purpose | Chars |
|------|------|---------|-------|
| PRF_Copilot_Instructions_v1.txt | Instructions | Agent behavior | ~8K |
| PRF_KB_Performance_Core_v1.txt | Core KB | General monitoring, optimization triggers | ~22K |
| PRF_KB_Attribution_Methods_v1.txt | Deep | MTA, Shapley, path analysis, MMM reconciliation | ~22K |
| PRF_KB_Incrementality_Testing_v1.txt | Deep | Geo tests, holdouts, always-on experiments | ~20K |
| PRF_KB_Anomaly_Detection_v1.txt | Deep | Statistical methods, ML detection, alerts | ~18K |

### 2.8 EAP - Shared Platform Layer (6 files)

| File | Purpose | Used By |
|------|---------|---------|
| EAP_KB_Data_Provenance_v1.txt | Source hierarchy, citation requirements | All agents |
| EAP_KB_Confidence_Levels_v1.txt | Uncertainty communication | All agents |
| EAP_KB_Error_Handling_v1.txt | Graceful degradation patterns | All agents |
| EAP_KB_Formatting_Standards_v1.txt | 6-Rule Framework, compliance | All agents |
| EAP_KB_Strategic_Principles_v1.txt | Philosophy, approach, guardrails | All agents |
| EAP_KB_Communication_Contract_v1.txt | Inter-agent request/response | All agents |

---

## PART 3: FILE COUNT SUMMARY

| Agent | Instructions | Core KB | Deep Modules | Total |
|-------|--------------|---------|--------------|-------|
| ORC | 1 | 1 | 0 | 2 |
| ANL | 1 | 1 | 4 | 6 |
| AUD | 1 | 1 | 4 | 6 |
| CHA | 1 | 1 | 3 | 5 |
| SPO | 1 | 1 | 2 | 4 |
| DOC | 1 | 1 | 1 | 3 |
| PRF | 1 | 1 | 3 | 5 |
| EAP | â€” | â€” | 6 | 6 |
| **TOTAL** | **7** | **7** | **23** | **37** |

**Comparison:**
- Original expansion plan: 96 files
- Aggressive consolidation (v1): 25 files
- **Deep modules approach (v2): 37 files**

This is a 61% reduction from 96 while preserving analytical sophistication.

---

## PART 4: DISPOSITION OF ALREADY-CREATED FILES

### Files to MERGE (Content Preserved)

| Created File | Merge Into | Section/Approach |
|--------------|------------|------------------|
| AUD_KB_Identity_Graph_Algorithms_v1.0.txt | AUD_KB_Identity_Resolution_v1.txt | Core content |
| AUD_KB_Card_Portfolio_Resolution_v1.0.txt | AUD_KB_LTV_Modeling_v1.txt | Portfolio section |
| AUD_KB_Household_Resolution_v1.0.txt | AUD_KB_Identity_Resolution_v1.txt | Household section |
| NDS_KB_Marginal_Return_Estimation_v1.0.txt | ANL_KB_Budget_Optimization_v1.txt | Marginal returns section |
| NDS_KB_Spend_NoSpend_Logic_v1.0.txt | ANL_KB_Causal_Incrementality_v1.txt | Spend logic section |
| NDS_KB_Multi_Input_Integration_v1.0.txt | ANL_KB_Analytics_Core_v1.txt | Integration section |
| NDS_KB_Risk_Adjusted_Allocation_v1.0.txt | ANL_KB_Budget_Optimization_v1.txt | Risk section |
| NDS_KB_Budget_Response_Functions_v1.0.txt | ANL_KB_Budget_Optimization_v1.txt | Response curves section |
| CSO_KB_Journey_State_Models_v1.0.txt | AUD_KB_Journey_Orchestration_v1.txt | State models section |

**Process:**
1. Open the created file
2. Extract all valuable content
3. Reorganize into the target file's structure
4. Ensure no duplication
5. Delete the original NDS_*/CSO_* file

### Files to STOP Creating

Do not create any remaining files from the old plan:
- ~~CSO_KB_Next_Best_Action_v1.0.txt~~ â†’ Content goes to AUD_KB_Journey_Orchestration
- ~~CSO_KB_Sequence_Timing_Optimization_v1.0.txt~~ â†’ Content goes to AUD_KB_Journey_Orchestration
- ~~CSO_KB_Frequency_Fatigue_Management_v1.0.txt~~ â†’ Content goes to AUD_KB_Journey_Orchestration
- ~~CSO_KB_Reinforcement_Learning_Marketing_v1.0.txt~~ â†’ Content goes to AUD_KB_Journey_Orchestration
- ~~SYS_KB_*~~ â†’ Content goes to EAP shared layer
- ~~ANL_KB_Causal_ML_Methods_v1.0.txt~~ â†’ Replaced by ANL_KB_Causal_Incrementality_v1.txt
- ~~ANL_KB_Bayesian_Methods_v1.0.txt~~ â†’ Replaced by ANL_KB_Bayesian_Inference_v1.txt
- ~~PRF_KB_Fraud_Detection_Methods_v1.0.txt~~ â†’ Section in PRF_KB_Anomaly_Detection
- ~~PRF_KB_Unified_Measurement_Framework_v1.0.txt~~ â†’ Section in PRF_KB_Performance_Core
- ~~PRF_KB_Incrementality_Testing_Advanced_v1.0.txt~~ â†’ Replaced by PRF_KB_Incrementality_Testing
- ~~AUD_KB_ML_Propensity_Models_v1.0.txt~~ â†’ Replaced by AUD_KB_Propensity_ML
- ~~AUD_KB_Entity_Resolution_v1.0.txt~~ â†’ Content in AUD_KB_Identity_Resolution

---

## PART 5: NEW REPOSITORY STRUCTURE

```
Kessel-Digital-Agent-Platform/
â””â”€â”€ release/v6.0/
    â”œâ”€â”€ agents/
    â”‚   â”œâ”€â”€ orc/
    â”‚   â”‚   â”œâ”€â”€ instructions/
    â”‚   â”‚   â”‚   â””â”€â”€ ORC_Copilot_Instructions_v1.txt
    â”‚   â”‚   â”œâ”€â”€ kb/
    â”‚   â”‚   â”‚   â””â”€â”€ ORC_KB_Routing_Logic_v1.txt
    â”‚   â”‚   â”œâ”€â”€ flows/
    â”‚   â”‚   â””â”€â”€ tests/
    â”‚   â”‚
    â”‚   â”œâ”€â”€ anl/
    â”‚   â”‚   â”œâ”€â”€ instructions/
    â”‚   â”‚   â”‚   â””â”€â”€ ANL_Copilot_Instructions_v1.txt
    â”‚   â”‚   â”œâ”€â”€ kb/
    â”‚   â”‚   â”‚   â”œâ”€â”€ ANL_KB_Analytics_Core_v1.txt
    â”‚   â”‚   â”‚   â”œâ”€â”€ ANL_KB_MMM_Methods_v1.txt
    â”‚   â”‚   â”‚   â”œâ”€â”€ ANL_KB_Bayesian_Inference_v1.txt
    â”‚   â”‚   â”‚   â”œâ”€â”€ ANL_KB_Causal_Incrementality_v1.txt
    â”‚   â”‚   â”‚   â””â”€â”€ ANL_KB_Budget_Optimization_v1.txt
    â”‚   â”‚   â”œâ”€â”€ flows/
    â”‚   â”‚   â””â”€â”€ tests/
    â”‚   â”‚
    â”‚   â”œâ”€â”€ aud/
    â”‚   â”‚   â”œâ”€â”€ instructions/
    â”‚   â”‚   â”‚   â””â”€â”€ AUD_Copilot_Instructions_v1.txt
    â”‚   â”‚   â”œâ”€â”€ kb/
    â”‚   â”‚   â”‚   â”œâ”€â”€ AUD_KB_Audience_Core_v1.txt
    â”‚   â”‚   â”‚   â”œâ”€â”€ AUD_KB_Identity_Resolution_v1.txt
    â”‚   â”‚   â”‚   â”œâ”€â”€ AUD_KB_LTV_Modeling_v1.txt
    â”‚   â”‚   â”‚   â”œâ”€â”€ AUD_KB_Propensity_ML_v1.txt
    â”‚   â”‚   â”‚   â””â”€â”€ AUD_KB_Journey_Orchestration_v1.txt
    â”‚   â”‚   â”œâ”€â”€ flows/
    â”‚   â”‚   â””â”€â”€ tests/
    â”‚   â”‚
    â”‚   â”œâ”€â”€ cha/
    â”‚   â”‚   â”œâ”€â”€ instructions/
    â”‚   â”‚   â”‚   â””â”€â”€ CHA_Copilot_Instructions_v1.txt
    â”‚   â”‚   â”œâ”€â”€ kb/
    â”‚   â”‚   â”‚   â”œâ”€â”€ CHA_KB_Channel_Core_v1.txt
    â”‚   â”‚   â”‚   â”œâ”€â”€ CHA_KB_Allocation_Methods_v1.txt
    â”‚   â”‚   â”‚   â”œâ”€â”€ CHA_KB_Emerging_Channels_v1.txt
    â”‚   â”‚   â”‚   â””â”€â”€ CHA_KB_Brand_Performance_v1.txt
    â”‚   â”‚   â”œâ”€â”€ flows/
    â”‚   â”‚   â””â”€â”€ tests/
    â”‚   â”‚
    â”‚   â”œâ”€â”€ spo/
    â”‚   â”‚   â”œâ”€â”€ instructions/
    â”‚   â”‚   â”‚   â””â”€â”€ SPO_Copilot_Instructions_v1.txt
    â”‚   â”‚   â”œâ”€â”€ kb/
    â”‚   â”‚   â”‚   â”œâ”€â”€ SPO_KB_SPO_Core_v1.txt
    â”‚   â”‚   â”‚   â”œâ”€â”€ SPO_KB_Fee_Analysis_v1.txt
    â”‚   â”‚   â”‚   â””â”€â”€ SPO_KB_Partner_Evaluation_v1.txt
    â”‚   â”‚   â”œâ”€â”€ flows/
    â”‚   â”‚   â””â”€â”€ tests/
    â”‚   â”‚
    â”‚   â”œâ”€â”€ doc/
    â”‚   â”‚   â”œâ”€â”€ instructions/
    â”‚   â”‚   â”‚   â””â”€â”€ DOC_Copilot_Instructions_v1.txt
    â”‚   â”‚   â”œâ”€â”€ kb/
    â”‚   â”‚   â”‚   â”œâ”€â”€ DOC_KB_Document_Core_v1.txt
    â”‚   â”‚   â”‚   â””â”€â”€ DOC_KB_Export_Formats_v1.txt
    â”‚   â”‚   â”œâ”€â”€ flows/
    â”‚   â”‚   â””â”€â”€ tests/
    â”‚   â”‚
    â”‚   â””â”€â”€ prf/
    â”‚       â”œâ”€â”€ instructions/
    â”‚       â”‚   â””â”€â”€ PRF_Copilot_Instructions_v1.txt
    â”‚       â”œâ”€â”€ kb/
    â”‚       â”‚   â”œâ”€â”€ PRF_KB_Performance_Core_v1.txt
    â”‚       â”‚   â”œâ”€â”€ PRF_KB_Attribution_Methods_v1.txt
    â”‚       â”‚   â”œâ”€â”€ PRF_KB_Incrementality_Testing_v1.txt
    â”‚       â”‚   â””â”€â”€ PRF_KB_Anomaly_Detection_v1.txt
    â”‚       â”œâ”€â”€ flows/
    â”‚       â””â”€â”€ tests/
    â”‚
    â”œâ”€â”€ platform/
    â”‚   â””â”€â”€ eap/
    â”‚       â”œâ”€â”€ kb/
    â”‚       â”‚   â”œâ”€â”€ EAP_KB_Data_Provenance_v1.txt
    â”‚       â”‚   â”œâ”€â”€ EAP_KB_Confidence_Levels_v1.txt
    â”‚       â”‚   â”œâ”€â”€ EAP_KB_Error_Handling_v1.txt
    â”‚       â”‚   â”œâ”€â”€ EAP_KB_Formatting_Standards_v1.txt
    â”‚       â”‚   â”œâ”€â”€ EAP_KB_Strategic_Principles_v1.txt
    â”‚       â”‚   â””â”€â”€ EAP_KB_Communication_Contract_v1.txt
    â”‚       â”œâ”€â”€ dataverse/
    â”‚       â””â”€â”€ seed/
    â”‚
    â”œâ”€â”€ contracts/
    â”‚
    â””â”€â”€ docs/
```

### Directories to DELETE

```bash
rm -rf release/v6.0/agents/udm/
rm -rf release/v6.0/agents/nds/
rm -rf release/v6.0/agents/cso/
rm -rf release/v6.0/system/
```

---

## PART 6: CREATION PRIORITY

### Phase 1: EAP Shared Layer (Days 1-2)
All agents depend on these. Create first.

1. EAP_KB_Data_Provenance_v1.txt
2. EAP_KB_Confidence_Levels_v1.txt
3. EAP_KB_Error_Handling_v1.txt
4. EAP_KB_Formatting_Standards_v1.txt
5. EAP_KB_Strategic_Principles_v1.txt
6. EAP_KB_Communication_Contract_v1.txt

### Phase 2: Core KB Files (Days 3-5)
One core file per agentâ€”foundational content.

1. ANL_KB_Analytics_Core_v1.txt
2. AUD_KB_Audience_Core_v1.txt
3. CHA_KB_Channel_Core_v1.txt
4. SPO_KB_SPO_Core_v1.txt
5. DOC_KB_Document_Core_v1.txt
6. PRF_KB_Performance_Core_v1.txt

### Phase 3: ANL Deep Modules (Days 6-8)
Merge NDS content here.

1. ANL_KB_Budget_Optimization_v1.txt â† NDS marginal/response/risk content
2. ANL_KB_Causal_Incrementality_v1.txt â† NDS spend logic
3. ANL_KB_MMM_Methods_v1.txt
4. ANL_KB_Bayesian_Inference_v1.txt

### Phase 4: AUD Deep Modules (Days 9-11)
Merge CSO and existing AUD content here.

1. AUD_KB_Journey_Orchestration_v1.txt â† CSO journey/NBA/sequence content
2. AUD_KB_Identity_Resolution_v1.txt â† existing identity/household content
3. AUD_KB_LTV_Modeling_v1.txt â† existing card portfolio content
4. AUD_KB_Propensity_ML_v1.txt

### Phase 5: Remaining Deep Modules (Days 12-14)

1. CHA_KB_Allocation_Methods_v1.txt
2. CHA_KB_Emerging_Channels_v1.txt â† AI/retail media content
3. CHA_KB_Brand_Performance_v1.txt
4. PRF_KB_Attribution_Methods_v1.txt
5. PRF_KB_Incrementality_Testing_v1.txt
6. PRF_KB_Anomaly_Detection_v1.txt
7. DOC_KB_Export_Formats_v1.txt
8. SPO_KB_Fee_Analysis_v1.txt (may already exist)
9. SPO_KB_Partner_Evaluation_v1.txt (may already exist)

### Phase 6: Cleanup (Day 15)
- Delete merged source files
- Validate all files pass 6-Rule Framework
- Verify character counts
- Update agent instructions to reference correct KB files

---

## PART 7: DEEP MODULE CONTENT GUIDANCE

### What Goes in Core vs. Deep

**Core KB files contain:**
- Foundational principles and methodology
- Decision frameworks used across all contexts
- Guardrails and quality standards
- Cross-cutting guidance

**Deep modules contain:**
- Specialized algorithms and formulas
- Method-specific implementation details
- Advanced techniques requiring specific context
- Technical depth that would overwhelm general queries

### Example: ANL Agent

**ANL_KB_Analytics_Core_v1.txt should contain:**
- General projection methodology
- Confidence level calculation
- Data quality requirements
- When to use which analytical approach
- Fallback behaviors

**ANL_KB_Bayesian_Inference_v1.txt should contain:**
- Prior elicitation methods
- Posterior computation approaches
- Credible interval interpretation
- MCMC diagnostics
- When Bayesian vs. frequentist
- Marketing-specific prior recommendations

### Retrieval Behavior

When a user asks: "What's the projected ROI for this campaign?"
- ANL_KB_Analytics_Core is retrieved (general projection)

When a user asks: "How should I set priors for the MMM model?"
- ANL_KB_Bayesian_Inference is retrieved (specific methodology)
- ANL_KB_MMM_Methods may also be retrieved (MMM context)

This precision is why we keep separate modules instead of one massive file.

---

## PART 8: GIT COMMANDS

### Initial Cleanup
```bash
cd /path/to/Kessel-Digital-Agent-Platform
git checkout feature/multi-agent-architecture

# Remove invalid directories
rm -rf release/v6.0/agents/udm/
rm -rf release/v6.0/agents/nds/
rm -rf release/v6.0/agents/cso/
rm -rf release/v6.0/system/

# Create correct structure
mkdir -p release/v6.0/platform/eap/kb

# Stage and commit
git add -A
git commit -m "refactor: Pivot to 7-agent + deep modules architecture

- Remove UDM, NDS, CSO agent directories (content reassigned)
- Remove system/ directory (content moves to EAP shared)
- Create EAP shared KB directory
- See MPA_v6_Architecture_Pivot_v2.md for details"
```

### After Merging NDS Content into ANL
```bash
git add release/v6.0/agents/anl/kb/
git rm release/v6.0/agents/nds/ -r  # if not already deleted
git commit -m "feat(anl): Add deep modules with NDS content merged

- ANL_KB_Budget_Optimization_v1.txt (marginal returns, response curves)
- ANL_KB_Causal_Incrementality_v1.txt (spend logic, lift)
- Content from NDS_KB_* files preserved and reorganized"
```

### After Merging CSO Content into AUD
```bash
git add release/v6.0/agents/aud/kb/
git rm release/v6.0/agents/cso/ -r  # if not already deleted
git commit -m "feat(aud): Add deep modules with CSO content merged

- AUD_KB_Journey_Orchestration_v1.txt (state models, NBA, sequencing)
- Content from CSO_KB_* files preserved and reorganized"
```

---

## PART 9: DATAVERSE (UNCHANGED)

Structured reference data still belongs in Dataverse, not KB files:

| Table | Purpose |
|-------|---------|
| mpa_channel | Channel capabilities, benchmarks |
| mpa_kpi | KPI definitions, formulas |
| mpa_benchmark | Vertical Ã— channel benchmarks |
| mpa_vertical | Industry classifications |
| mpa_partner | Partner fees, capabilities |
| eap_agent | Agent registry |

**Do NOT create KB files for registry/benchmark data.** Query Dataverse.

---

## PART 10: SUMMARY

| Dimension | Old Plan | Aggressive Consolidation | Deep Modules (Final) |
|-----------|----------|--------------------------|----------------------|
| Agents | 10+ | 7 | **7** |
| KB Files | 96 | 25 | **37** |
| NDS Content | Own agent | Lost | **Merged into ANL** |
| CSO Content | Own agent | Lost | **Merged into AUD** |
| Analytical Depth | Maximum | Minimal | **Preserved** |
| Routing Complexity | High | Low | **Low** |
| Maintenance | Nightmare | Easy | **Manageable** |

**The 7 agents + deep modules architecture gives us:**
- Simple routing (7 agents, deterministic)
- Preserved sophistication (specialized deep modules)
- Precise retrieval (focused files, not mega-documents)
- Reasonable maintenance (37 files, not 96)

---

## CONFIRMATION CHECKLIST

Before proceeding, confirm understanding:

- [ ] Architecture is 7 agents (ORC, ANL, AUD, CHA, SPO, DOC, PRF)
- [ ] Each agent has 1 Core KB + multiple Deep modules
- [ ] NDS content merges into ANL deep modules
- [ ] CSO content merges into AUD deep modules
- [ ] UDM agent is cancelled entirely (too specialized)
- [ ] SYS content becomes EAP shared layer
- [ ] Total target is 37 KB files
- [ ] EAP shared layer is created FIRST
- [ ] Dataverse is used for structured reference data

---

**Document Version:** 2.0  
**Created:** January 18, 2026  
**Author:** Claude (via claude.ai)  
**For:** Desktop Claude pivot instructions
