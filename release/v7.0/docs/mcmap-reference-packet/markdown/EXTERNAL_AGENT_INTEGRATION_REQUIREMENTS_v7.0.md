# MCMAP External Agent Integration Requirements

Version: 7.0
Date: January 31, 2026
Status: Active

---

## Overview

This document provides requirements and guidelines for external teams integrating agents into the MCMAP (Mastercard Media Advertising Platform) multi-agent architecture. Follow these specifications to ensure your agent integrates seamlessly with the platform.

---

## MCMAP Platform Architecture

### Multi-Agent System

MCMAP uses a hub-and-spoke architecture where the Orchestrator (ORC) routes user requests to specialist agents based on intent classification:

```
User Request -> ORC (Orchestrator) -> Specialist Agent -> Response
```

### Agent Communication

Agents communicate via a standardized inter-agent contract. When your agent needs capabilities from another agent, it sends a request through ORC, which routes to the appropriate specialist.

### Current Platform Agents

| Code | Name | Domain |
|------|------|--------|
| ORC | Orchestrator | Routing |
| ANL | Analytics | Calculations, projections |
| AUD | Audience | Segmentation, targeting |
| CHA | Channel | Channel selection, allocation |
| SPO | SupplyPath | NBI, fee analysis |
| DOC | Document | Document generation |
| PRF | Performance | Analysis, optimization |
| CHG | ChangeManagement | Change readiness |
| CST | ConsultingStrategy | Strategic frameworks |
| MKT | MarketingStrategy | Campaign strategy |
| GHA | GrowthHacking | Growth optimization |
| DOCS | Documentation | Platform documentation |

### Pending External Agents

| Code | Name | Domain | External Team |
|------|------|--------|---------------|
| MMM | MediaMixModeling | Measurement | MMM Team |
| MMO | MediaMixOptimization | Optimization | MMO Team |
| TAL | TestAndLearn | Experimentation | Test and Learn Team |
| DYN | DynamicYield | Personalization | Dynamic Yield Team |
| RMN | RetailMediaNetworks | Retail Media | MCM Team |
| SES | SessionMLoyalty | Loyalty | Session M Team |
| MEI | MastercardEconomicsInstitute | Economics Data | MEI Team |
| SAL | SalesAILeads | Sales | Sales AI Team |

---

## File Delivery Requirements

### Instructions File

Your agent requires one instructions file that defines its behavior in Microsoft Copilot Studio.

**Filename Format**
```
[CODE]_Copilot_Instructions_v7.0.txt
```

Example: `MMM_Copilot_Instructions_v7.0.txt`

**Character Limit**
- Minimum: 7,500 characters
- Maximum: 7,999 characters

**Format Requirements**
- 100% plain text (ASCII only)
- No markdown formatting
- No emoji or special characters
- No tables
- No curly brackets or JSON
- Headers must be ALL-CAPS
- Lists must use hyphens only (no bullets, no numbers in lists)
- Line separators: Use dashes (----) for visual breaks

**Structure Template**
```
You are the [AGENT NAME] ([CODE]), a specialist in [DOMAIN].

AGENT IDENTITY

Code: [CODE]
Domain: [DOMAIN]
Function: [PRIMARY FUNCTION]
Integration: Routable from ORC, hands back for [HANDOFF SCENARIOS]

------------------------------------------------------------

CAPABILITIES

[List your agent's core capabilities]

------------------------------------------------------------

RESPONSE REQUIREMENTS

- Maximum [X] words per response
- [FORMAT REQUIREMENTS]
- Always cite knowledge base source when using KB data
- Include confidence level in responses

------------------------------------------------------------

KNOWLEDGE BASE USAGE

MANDATORY RESPONSE SEQUENCE

For EVERY user message follow this exact sequence:

STEP 1 SEARCH KB FIRST
Before any reasoning search your knowledge base using keywords from the user query

STEP 2 REVIEW KB RESULTS
Read what KB returned as your primary source

STEP 3 FORMULATE RESPONSE
Only after reviewing KB results formulate your response grounded in KB content

------------------------------------------------------------

ORC INTEGRATION

When user needs capabilities outside your domain:
- Route to ORC with target specialist
- Provide context for the receiving agent
- Example: For budget projections route to ANL

When handed FROM ORC:
- Skip full greeting
- Acknowledge query directly
- Offer return path when complete

------------------------------------------------------------

CRITICAL RULES

- NEVER fabricate data or statistics
- ALWAYS cite sources
- NEVER bypass access controls
- State confidence level with every substantive response

```

### Knowledge Base Files

Knowledge base files contain reference information your agent retrieves to answer questions.

**Filename Format**
```
[CODE]_KB_[Topic]_v7.0.txt
```

Example: `MMM_KB_Attribution_Methods_v7.0.txt`

**Character Limit**
- Maximum: 36,000 characters per file
- If content exceeds limit, split into multiple files

**Format Requirements**
- 100% plain text (ASCII only)
- No markdown
- No curly brackets or JSON
- Headers in ALL-CAPS
- Hyphens for lists

**Recommended KB Structure**
```
[TOPIC NAME] v7.0

------------------------------------------------------------

OVERVIEW

[Brief description of this knowledge area]

------------------------------------------------------------

[SECTION 1 HEADER]

[Content organized logically]

------------------------------------------------------------

[SECTION 2 HEADER]

[Content organized logically]

------------------------------------------------------------

REFERENCES

[Source citations if applicable]

------------------------------------------------------------

END OF [TOPIC NAME] v7.0
```

### Power Automate Flows

If your agent requires backend processing, data retrieval, or external API calls, provide Power Automate flow definitions.

**Filename Format**
```
[CODE]_[FlowName]_v7.0.yaml
```

Example: `MMM_RunAttribution_v7.0.yaml`

**Requirements**
- Must be compatible with Microsoft Power Automate
- Document all input parameters
- Document all output parameters
- Document all Dataverse table dependencies
- Include error handling
- Include timeout specifications

**Flow Documentation Template**
```
[FLOW NAME] v7.0
VERSION 7.0
STATUS Production Ready

------------------------------------------------------------

FLOW IDENTITY

Name: [CODE]_[FlowName]
Domain: [Domain]
Function: [What this flow does]
Trigger: [When this flow activates]

------------------------------------------------------------

INPUT PARAMETERS

[parameter_name]
Type: [String/Number/Boolean/Object]
Required: [Yes/No]
Description: [What this parameter is for]
Source: [Where this value comes from]

------------------------------------------------------------

PROCESSING STEPS

STEP 1 [STEP NAME]
Action: [What happens]
[Details]

STEP 2 [STEP NAME]
Action: [What happens]
[Details]

------------------------------------------------------------

OUTPUT PARAMETERS

[parameter_name]
Type: [String/Number/Boolean/Object]
Description: [What this output contains]

------------------------------------------------------------

ERROR HANDLING

[ERROR_CODE]
Return: [What to return]
Message: [User-friendly message]
Action: [Recovery action]

------------------------------------------------------------

END OF [FLOW NAME] v7.0
```

---

## Inter-Agent Contract Compliance

Your agent must send and receive messages conforming to the MCMAP inter-agent contract schema.

### AgentRequest Structure

When your agent requests another agent:

```
request_id: UUID (unique identifier for this request)
timestamp: ISO 8601 format (e.g., 2026-01-31T14:30:00Z)
source_agent: Your agent code (e.g., MMM)
target_agent: Target agent code (e.g., ANL)
request_type: String describing the request type
session_context: Current session state object
parameters: Request-specific data object
options: Optional request options
```

**Session Context Fields**
```
session_id: UUID
workflow_step: Integer 1-10
workflow_gate: Integer 0-4
session_type: Planning | InFlight | PostMortem | Audit
plan_state: Current plan state object
created_at: ISO 8601 timestamp
updated_at: ISO 8601 timestamp
```

### AgentResponse Structure

When your agent responds:

```
request_id: UUID (matching the request)
timestamp: ISO 8601 format
source_agent: Your agent code
status: success | partial | error
data: Response payload object
confidence: HIGH | MEDIUM | LOW
sources: Array of data sources used
recommendations: Optional array of recommendations
warnings: Optional array of warnings
metadata: Processing metadata object
```

**Required Metadata Fields**
```
processing_time_ms: Integer (milliseconds)
data_sources: Array of source types used
```

**Data Source Types**
- USER_PROVIDED
- AGENT_KB
- DATAVERSE
- CALCULATION
- WEB_RESEARCH
- HISTORICAL_DATA
- BENCHMARK_DATA
- THIRD_PARTY_API

### AgentErrorResponse Structure

When your agent encounters an error:

```
request_id: UUID
timestamp: ISO 8601 format
source_agent: Your agent code
error: true
code: Error code from allowed list
message: Human-readable error message
details: Optional additional details object
recovery_options: Optional array of suggested recovery actions
fallback_available: Boolean
fallback_response: Optional fallback AgentResponse
```

**Error Codes**
- INVALID_REQUEST
- MISSING_PARAMETERS
- INSUFFICIENT_CONTEXT
- CALCULATION_ERROR
- KB_RETRIEVAL_ERROR
- DATAVERSE_ERROR
- TIMEOUT
- AGENT_UNAVAILABLE
- CONFIDENCE_TOO_LOW
- INTERNAL_ERROR

---

## ORC Routing Integration

To enable ORC to route requests to your agent:

### Routing Keywords

Provide a list of trigger phrases that should route to your agent. These are keywords or phrases that indicate the user needs your agent's capabilities.

**Example for MMM Agent**
```
- media mix model
- MMM
- marketing mix model
- attribution model
- channel contribution
- adstock
- saturation curve
- response curve
- media effectiveness
- channel effects
- carryover effects
```

### Handoff Patterns

Document which agents typically hand off to your agent and which agents you hand off to.

**Example**
```
Receives from:
- ANL: After ANL identifies need for deep attribution analysis
- PRF: After performance analysis identifies measurement gaps
- GHA: When growth strategy needs media effectiveness data

Hands off to:
- ANL: When statistical validation is needed
- CHA: When allocation recommendations are ready
- DOC: When results need to be documented
```

### Domain Scope

Define what questions your agent is authoritative for. This helps ORC route appropriately and helps other agents know when to defer to you.

**Example for MMM**
```
Authoritative for:
- Media mix modeling methodology
- Channel attribution analysis
- Response curve estimation
- Adstock and saturation modeling
- Incrementality calibration
- Cross-channel interaction effects

Not authoritative for (defer to other agents):
- Budget calculations (defer to ANL)
- Channel-specific tactics (defer to CHA)
- Audience segmentation (defer to AUD)
```

---

## Dataverse Requirements

If your agent needs to store or retrieve data from Dataverse:

### Table Naming Convention
```
eap_[your_domain]_[table_name]
```

Example: `eap_mmm_model_results`

### Required Documentation

For each table, provide:

1. **Table name** following the naming convention
2. **Column definitions** with data types
3. **Primary key** specification
4. **Relationships** to existing MCMAP tables
5. **Sample data** for testing

### Existing MCMAP Tables

Your agent may need to reference these existing tables:
- eap_session (session management)
- eap_plan_state (plan state storage)
- eap_user_profile (user attributes)
- eap_access_rule (access control rules)

---

## Testing Requirements

Before integration, validate your agent package:

### Pre-Submission Checklist

**Instructions File**
- [ ] Character count is between 7,500 and 7,999
- [ ] File is 100% plain text (no markdown, no emoji)
- [ ] Headers are ALL-CAPS
- [ ] Lists use hyphens only
- [ ] No curly brackets or JSON syntax

**Knowledge Base Files**
- [ ] Each file is under 36,000 characters
- [ ] All files are 100% plain text
- [ ] Naming follows [CODE]_KB_[Topic]_v7.0.txt format

**Power Automate Flows**
- [ ] All flows documented with input/output parameters
- [ ] Error handling defined
- [ ] Dataverse dependencies documented
- [ ] Tested in isolation

**Routing Integration**
- [ ] Routing keywords list provided
- [ ] Handoff patterns documented
- [ ] Domain scope defined

### Test Scenarios

Provide test scenarios demonstrating:

1. **Basic query handling** - User asks a question in your domain
2. **KB retrieval** - Agent correctly retrieves and cites KB content
3. **Confidence levels** - Agent states appropriate confidence
4. **Handoff to ORC** - Agent correctly routes out-of-domain requests
5. **Receiving from ORC** - Agent handles requests routed from other agents
6. **Error handling** - Agent responds appropriately to errors

---

## Delivery Checklist

Each external team must deliver:

- [ ] Instructions file: `[CODE]_Copilot_Instructions_v7.0.txt`
- [ ] All KB files: `[CODE]_KB_[Topic]_v7.0.txt`
- [ ] All Power Automate flows: `[CODE]_[FlowName]_v7.0.yaml`
- [ ] Routing keywords list (text file or JSON)
- [ ] Handoff patterns documentation
- [ ] Domain scope documentation
- [ ] Dataverse schema (if applicable)
- [ ] Test scenarios with expected results

---

## Contact

For integration questions, contact:

Kevin Bauer (kevin.bauer@mastercard.com) - MCMAP Platform Owner

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 7.0 | Jan 31, 2026 | Initial external agent integration requirements |
