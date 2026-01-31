# MPA v6.0 Architecture Decisions Summary

**Date:** January 18, 2026  
**Status:** Ready for Implementation  
**Purpose:** Captures all architecture decisions from planning conversations to inform implementation phase

---

## EXECUTIVE SUMMARY

The MPA v6.0 architecture uses a **7 Agents + Deep Modules** pattern with a **Capability Abstraction Layer** that enables dual-environment deployment (Mastercard managed environment + Personal unrestricted environment).

**Key Numbers:**
- 7 Agents (ORC, ANL, AUD, CHA, SPO, DOC, PRF)
- 37 KB Files (7 instructions + 6 EAP shared + 24 agent-specific)
- 56K total instruction space (8K Ã— 7 agents)
- AI Builder as primary computation layer (both environments)
- Azure Functions + HTTP as enhanced computation (personal environment only)

---

## PART 1: ENVIRONMENT CAPABILITIES (CONFIRMED)

### Mastercard Environment

```
AVAILABLE
-----------------------------------------
[YES] Copilot Studio (7 agents, 56K instructions)
[YES] SharePoint KB hosting
[YES] Dataverse (full access)
[YES] Power Automate Premium (approved connectors only)
[YES] Power Apps (Canvas, Model-driven)
[YES] Power Fx computations
[YES] AI Builder Custom Prompts
[YES] AI Builder Models
[YES] Standard connectors: Office 365, Dataverse, SharePoint, Approvals, Teams

BLOCKED BY DLP
-----------------------------------------
[NO] HTTP connector (all destinations - confirmed via testing)
[NO] Custom connectors (same DLP policy)

REQUIRES APPROVAL (MONTHS)
-----------------------------------------
[LOCKED] DLP policy exceptions
[LOCKED] Azure Functions
[LOCKED] Azure OpenAI direct integration
```

### Personal Environment (Aragorn AI)

```
AVAILABLE
-----------------------------------------
[YES] Everything in Mastercard environment, PLUS:
[YES] HTTP connector (external endpoints)
[YES] Custom connectors
[YES] Azure Functions
[YES] Azure OpenAI direct integration
[YES] Full Azure access
```

---

## PART 2: ARCHITECTURE PATTERN

### 7 Agents + Deep Modules

Each agent has:
- **1 Instruction File** (8K chars max) - Agent behavior, personality, routing
- **1 Core KB File** (20-30K chars) - Foundational methodology, always retrieved
- **N Deep Module KB Files** (15-25K chars each) - Specialized content, retrieved by context

| Agent | Instructions | Core KB | Deep Modules | Total Files |
|-------|--------------|---------|--------------|-------------|
| ORC | 1 | 1 | 0 | 2 |
| ANL | 1 | 1 | 4 | 6 |
| AUD | 1 | 1 | 4 | 6 |
| CHA | 1 | 1 | 3 | 5 |
| SPO | 1 | 1 | 2 | 4 |
| DOC | 1 | 1 | 1 | 3 |
| PRF | 1 | 1 | 3 | 5 |
| EAP | - | - | 6 | 6 |
| **TOTAL** | **7** | **7** | **23** | **37** |

### Capability Abstraction Layer

Instead of hardcoding implementations, capabilities are registered with multiple implementations per environment:

```
AGENT REQUEST
     |
     v
CAPABILITY DISPATCHER (same in both environments)
     |
     v
QUERY eap_capability_implementation
(filter by environment + is_enabled, sort by priority)
     |
     v
ROUTE TO IMPLEMENTATION
     |
     +---> AI_BUILDER_PROMPT (both environments)
     +---> DATAVERSE_LOGIC (both environments)
     +---> AZURE_FUNCTION (personal only)
     +---> HTTP_ENDPOINT (personal only)
```

**Benefits:**
- Same agents, same KB, same dispatcher flow in both environments
- Turning on Azure Functions in Mastercard = update Dataverse records only
- No refactoring required when capabilities become available

---

## PART 3: CANCELLED AGENTS AND CONTENT DISPOSITION

### Agents That DO NOT Exist

- **UDM** (Unstructured Data Mining) - Too specialized, deferred to future
- **NDS** (Numeric Decision Science) - Content merged into ANL
- **CSO** (Customer Sequence Orchestration) - Content merged into AUD
- **SYS** (System) - Content moved to EAP shared layer

### Content Merge Map

| Original Content | Target Location |
|------------------|-----------------|
| NDS marginal return estimation | ANL_KB_Budget_Optimization_v1.txt |
| NDS spend/no-spend logic | ANL_KB_Causal_Incrementality_v1.txt |
| NDS multi-input integration | ANL_KB_Analytics_Core_v1.txt |
| NDS risk-adjusted allocation | ANL_KB_Budget_Optimization_v1.txt |
| NDS budget response functions | ANL_KB_Budget_Optimization_v1.txt |
| CSO journey state models | AUD_KB_Journey_Orchestration_v1.txt |
| CSO next-best-action | AUD_KB_Journey_Orchestration_v1.txt |
| CSO sequence timing | AUD_KB_Journey_Orchestration_v1.txt |
| CSO frequency fatigue | AUD_KB_Journey_Orchestration_v1.txt |
| CSO reinforcement learning | AUD_KB_Journey_Orchestration_v1.txt |
| SYS orchestration content | EAP_KB_Communication_Contract_v1.txt |

---

## PART 4: COMPLETE FILE INVENTORY

### ORC - Orchestrator Agent (2 files)
```
release/v6.0/agents/orc/instructions/ORC_Copilot_Instructions_v1.txt
release/v6.0/agents/orc/kb/ORC_KB_Routing_Logic_v1.txt
```

### ANL - Analytics Agent (6 files)
```
release/v6.0/agents/anl/instructions/ANL_Copilot_Instructions_v1.txt
release/v6.0/agents/anl/kb/ANL_KB_Analytics_Core_v1.txt         <- CORE
release/v6.0/agents/anl/kb/ANL_KB_MMM_Methods_v1.txt            <- DEEP
release/v6.0/agents/anl/kb/ANL_KB_Bayesian_Inference_v1.txt     <- DEEP
release/v6.0/agents/anl/kb/ANL_KB_Causal_Incrementality_v1.txt  <- DEEP
release/v6.0/agents/anl/kb/ANL_KB_Budget_Optimization_v1.txt    <- DEEP
```

### AUD - Audience Agent (6 files)
```
release/v6.0/agents/aud/instructions/AUD_Copilot_Instructions_v1.txt
release/v6.0/agents/aud/kb/AUD_KB_Audience_Core_v1.txt          <- CORE
release/v6.0/agents/aud/kb/AUD_KB_Identity_Resolution_v1.txt    <- DEEP
release/v6.0/agents/aud/kb/AUD_KB_LTV_Modeling_v1.txt           <- DEEP
release/v6.0/agents/aud/kb/AUD_KB_Propensity_ML_v1.txt          <- DEEP
release/v6.0/agents/aud/kb/AUD_KB_Journey_Orchestration_v1.txt  <- DEEP
```

### CHA - Channel Agent (5 files)
```
release/v6.0/agents/cha/instructions/CHA_Copilot_Instructions_v1.txt
release/v6.0/agents/cha/kb/CHA_KB_Channel_Core_v1.txt           <- CORE
release/v6.0/agents/cha/kb/CHA_KB_Allocation_Methods_v1.txt     <- DEEP
release/v6.0/agents/cha/kb/CHA_KB_Emerging_Channels_v1.txt      <- DEEP
release/v6.0/agents/cha/kb/CHA_KB_Brand_Performance_v1.txt      <- DEEP
```

### SPO - Supply Path Agent (4 files)
```
release/v6.0/agents/spo/instructions/SPO_Copilot_Instructions_v1.txt
release/v6.0/agents/spo/kb/SPO_KB_SPO_Core_v1.txt               <- CORE
release/v6.0/agents/spo/kb/SPO_KB_Fee_Analysis_v1.txt           <- DEEP
release/v6.0/agents/spo/kb/SPO_KB_Partner_Evaluation_v1.txt     <- DEEP
```

### DOC - Document Agent (3 files)
```
release/v6.0/agents/doc/instructions/DOC_Copilot_Instructions_v1.txt
release/v6.0/agents/doc/kb/DOC_KB_Document_Core_v1.txt          <- CORE
release/v6.0/agents/doc/kb/DOC_KB_Export_Formats_v1.txt         <- DEEP
```

### PRF - Performance Agent (5 files)
```
release/v6.0/agents/prf/instructions/PRF_Copilot_Instructions_v1.txt
release/v6.0/agents/prf/kb/PRF_KB_Performance_Core_v1.txt       <- CORE
release/v6.0/agents/prf/kb/PRF_KB_Attribution_Methods_v1.txt    <- DEEP
release/v6.0/agents/prf/kb/PRF_KB_Incrementality_Testing_v1.txt <- DEEP
release/v6.0/agents/prf/kb/PRF_KB_Anomaly_Detection_v1.txt      <- DEEP
```

### EAP - Shared Platform Layer (6 files)
```
release/v6.0/platform/eap/kb/EAP_KB_Data_Provenance_v1.txt
release/v6.0/platform/eap/kb/EAP_KB_Confidence_Levels_v1.txt
release/v6.0/platform/eap/kb/EAP_KB_Error_Handling_v1.txt
release/v6.0/platform/eap/kb/EAP_KB_Formatting_Standards_v1.txt
release/v6.0/platform/eap/kb/EAP_KB_Strategic_Principles_v1.txt
release/v6.0/platform/eap/kb/EAP_KB_Communication_Contract_v1.txt
```

---

## PART 5: DATAVERSE SCHEMA

### Core Tables

| Table | Purpose |
|-------|---------|
| eap_agent | Agent registry with capabilities |
| eap_capability | Capability definitions (environment-agnostic) |
| eap_capability_implementation | Capability implementations per environment |
| eap_prompt | AI Builder prompt registry |
| eap_test_case | Golden test scenarios for regression |
| eap_telemetry | Observability/logging |
| mpa_channel | Channel reference data |
| mpa_kpi | KPI definitions |
| mpa_benchmark | Vertical x channel benchmarks |
| mpa_vertical | Industry classifications |
| mpa_partner | Partner fees and capabilities |

### eap_capability Table Schema

| Column | Type | Description |
|--------|------|-------------|
| capability_id | PK, Autonumber | |
| capability_code | Text, Unique | CALCULATE_MARGINAL_RETURN |
| capability_name | Text | Calculate Marginal Return |
| description | Text | What this capability does |
| agent_code | Lookup to eap_agent | Which agent owns this |
| input_schema | Multiline Text (JSON) | Expected inputs |
| output_schema | Multiline Text (JSON) | Expected outputs |
| is_active | Boolean | Global on/off |

### eap_capability_implementation Table Schema

| Column | Type | Description |
|--------|------|-------------|
| implementation_id | PK, Autonumber | |
| capability_code | Lookup to eap_capability | |
| environment_code | Choice | MASTERCARD, PERSONAL |
| implementation_type | Choice | AI_BUILDER_PROMPT, AZURE_FUNCTION, HTTP_ENDPOINT, DATAVERSE_LOGIC |
| implementation_reference | Text | Prompt name, Function URL, Endpoint URL, or Flow GUID |
| configuration_json | Multiline Text | Any additional config |
| priority_order | Integer | Lower = preferred |
| is_enabled | Boolean | Enabled in this environment |
| fallback_implementation_id | Lookup (self) | Fallback if this fails |
| timeout_seconds | Integer | Max wait time |

---

## PART 6: REPOSITORY STRUCTURE

```
Kessel-Digital-Agent-Platform/
+-- base/                                    # Shared across both environments
|   +-- agents/
|   |   +-- orc/
|   |   |   +-- instructions/
|   |   |   +-- kb/
|   |   +-- anl/
|   |   +-- aud/
|   |   +-- cha/
|   |   +-- spo/
|   |   +-- doc/
|   |   +-- prf/
|   +-- platform/
|   |   +-- eap/
|   |       +-- kb/
|   |       +-- prompts/                     # AI Builder prompt definitions
|   |       +-- flows/
|   |           +-- MPA_Capability_Dispatcher.json
|   |           +-- MPA_Impl_AIBuilder.json
|   |           +-- MPA_Impl_DataverseLogic.json
|   +-- dataverse/
|   |   +-- schema/
|   |   +-- seed/
|   +-- tests/
|       +-- scenarios/
|
+-- environments/
|   +-- mastercard/
|   |   +-- seed/
|   |   |   +-- eap_capability_impl_mastercard.csv
|   |   +-- config/
|   |       +-- environment_config.json
|   |
|   +-- personal/
|       +-- flows/
|       |   +-- MPA_Impl_AzureFunction.json
|       |   +-- MPA_Impl_HTTPEndpoint.json
|       +-- functions/
|       |   +-- MarginalReturn/
|       |   +-- ScenarioCompare/
|       |   +-- host.json
|       +-- seed/
|       |   +-- eap_capability_impl_personal.csv
|       +-- config/
|           +-- environment_config.json
|
+-- deploy/
|   +-- mastercard/
|   +-- personal/
|
+-- docs/
    +-- architecture/
```

---

## PART 7: AI BUILDER PROMPT CATALOG (TO BE CREATED)

### ANL Agent Prompts

| Prompt Code | Name | Purpose |
|-------------|------|---------|
| ANL_MARGINAL_RETURN | Calculate Marginal Return | Estimate marginal return for budget allocation |
| ANL_SCENARIO_COMPARE | Compare Scenarios | Compare multiple budget allocation scenarios |
| ANL_PROJECTION | Generate Projections | Project campaign performance metrics |
| ANL_CONFIDENCE | Assess Confidence | Calculate confidence levels for estimates |

### AUD Agent Prompts

| Prompt Code | Name | Purpose |
|-------------|------|---------|
| AUD_SEGMENT_PRIORITY | Prioritize Segments | Rank audience segments by value |
| AUD_LTV_ASSESS | Assess LTV | Evaluate lifetime value potential |
| AUD_JOURNEY_STATE | Analyze Journey | Determine customer journey state |

### CHA Agent Prompts

| Prompt Code | Name | Purpose |
|-------------|------|---------|
| CHA_CHANNEL_MIX | Optimize Mix | Recommend optimal channel allocation |
| CHA_CHANNEL_SELECT | Select Channels | Recommend channels for objectives |

### PRF Agent Prompts

| Prompt Code | Name | Purpose |
|-------------|------|---------|
| PRF_ANOMALY | Detect Anomalies | Identify performance anomalies |
| PRF_ATTRIBUTION | Analyze Attribution | Assess attribution across channels |

### ORC Agent Prompts

| Prompt Code | Name | Purpose |
|-------------|------|---------|
| ORC_INTENT | Classify Intent | Determine user intent for routing |

---

## PART 8: CHATGPT RECOMMENDATIONS INCORPORATED

| Recommendation | Status | Implementation |
|----------------|--------|----------------|
| 1. Routing in Dataverse, not KB | ADOPTED | eap_agent table with capability tags, ORC queries it |
| 2. Versioning + effective dating | ADOPTED | Add to Dataverse schema |
| 3. Example conversations to test suite | ADOPTED | eap_test_case table |
| 4. Hard rules enforced in code | ADOPTED | Validators in flows |
| 5. Observability from day 1 | ADOPTED | eap_telemetry table |
| 6. Git as KB source of truth | ADOPTED | Already doing this |
| 7. Topic-based shared modules | REJECTED | Conflicts with specialization goal |

---

## PART 9: NEXT STEPS FOR NEW CONVERSATION

The next conversation should create these documents:

1. **MPA_v6_Architecture.md** - Complete architecture with capability abstraction
2. **MPA_v6_Dataverse_Schema.md** - All tables with full column definitions
3. **MPA_v6_AI_Builder_Prompts.md** - Detailed prompt specifications
4. **MPA_v6_Azure_Functions.md** - Function specs (personal environment)
5. **VSCODE_Instructions.md** - Repository setup, both environments
6. **DESKTOP_Instructions.md** - Content creation, both environments

---

## PART 10: KEY PRINCIPLES TO MAINTAIN

1. **Capability Abstraction**: Never hardcode implementation types; always route through capability dispatcher
2. **Environment Parity**: Same agents, KB, and dispatcher in both environments; only implementation registrations differ
3. **No HTTP Dependencies in Shared Code**: All flows in base/ must work without HTTP connector
4. **AI Builder as Universal Fallback**: Every capability must have an AI Builder implementation that works in both environments
5. **Test-Driven Quality**: Golden test cases validate behavior before deployment
6. **Observability by Default**: All capability calls logged to eap_telemetry

---

**Document Version:** 1.0  
**Created:** January 18, 2026  
**Source:** Claude.ai planning conversation
