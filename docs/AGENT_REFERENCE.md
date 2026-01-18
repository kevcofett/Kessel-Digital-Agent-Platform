# KDAP v6.0 Agent Reference

## Agent Inventory

| Code | Name | Type | Status |
|------|------|------|--------|
| ORC | Orchestrator | Core | Updated |
| ANL | Analytics | Specialist | Extended |
| AUD | Audience | Specialist | Existing |
| CHA | Channel | Specialist | Existing |
| SPO | Supply Path | Specialist | Existing |
| DOC | Document | Specialist | Extended |
| PRF | Performance | Specialist | Existing |
| CST | Consulting Strategy | Specialist | **NEW** |
| CHG | Change Management | Specialist | **NEW** |

---

## ORC - Orchestrator Agent

**Role:** Central routing and coordination

**Routing Rules:**

| Intent | Routes To |
|--------|-----------|
| Strategic analysis, frameworks, SWOT, Porter, prioritization | CST |
| Change management, stakeholder, adoption, readiness | CHG |
| Financial calculations, NPV, IRR, projections | ANL |
| Segmentation, personas, LTV | AUD |
| Media mix, channel selection | CHA |
| Supply path, fee analysis | SPO |
| Documents, reports, business cases | DOC |
| Anomaly detection, attribution | PRF |

**KB Files:**
- ORC_KB_Routing_Logic_v1.txt (NEW)
- ORC_KB_Context_Preservation_v1.txt
- ORC_KB_Conversation_Patterns_v1.txt
- ORC_KB_Error_Handling_v1.txt
- ORC_KB_Workflow_Gates_v1.txt

---

## CST - Consulting Strategy Agent (NEW)

**Role:** Strategic consulting and framework application

**Capabilities:**

| Code | Name | Description |
|------|------|-------------|
| CST_FRAMEWORK_SELECT | Select Framework | Recommend appropriate frameworks |
| CST_ENGAGEMENT_GUIDE | Engagement Guide | Guide consulting phases |
| CST_STRATEGIC_ANALYZE | Strategic Analysis | Apply frameworks to situations |
| CST_PRIORITIZE | Prioritization | RICE, MoSCoW, weighted matrix |

**KB Files:**
- CST_KB_Consulting_Core_v1.txt
- CST_KB_Strategic_Frameworks_v1.txt
- CST_KB_Prioritization_Methods_v1.txt
- CST_KB_Industry_Context_v1.txt

**Routing:**
- Financial analysis → ANL
- Document generation → DOC
- Change management → CHG

---

## CHG - Change Management Agent (NEW)

**Role:** Organizational change and transformation support

**Capabilities:**

| Code | Name | Description |
|------|------|-------------|
| CHG_READINESS | Readiness Assessment | Kotter, ADKAR, Lewin evaluation |
| CHG_STAKEHOLDER | Stakeholder Mapping | Power/Interest grid analysis |
| CHG_ADOPTION | Adoption Planning | Rollout and training plans |

**KB Files:**
- CHG_KB_Change_Core_v1.txt
- CHG_KB_Stakeholder_Methods_v1.txt
- CHG_KB_Adoption_Planning_v1.txt

**Routing:**
- Framework selection → CST
- Document generation → DOC

---

## ANL - Analytics Agent (Extended)

**Role:** Statistical analysis and financial calculations

**New Capabilities (CA Extension):**

| Code | Name | Implementation |
|------|------|----------------|
| ANL_NPV | NPV Calculate | Azure Function + AI Builder |
| ANL_IRR | IRR Calculate | Azure Function + AI Builder |
| ANL_TCO | TCO Calculate | AI Builder only |
| ANL_MONTECARLO | Monte Carlo | Azure Function + AI Builder |
| ANL_SENSITIVITY | Sensitivity Analysis | Azure Function + AI Builder |
| ANL_PAYBACK | Payback Period | AI Builder only |

**KB Files:**
- ANL_KB_Financial_Investment_v1.txt (NEW)
- (existing ANL KB files)

---

## DOC - Document Agent (Extended)

**Role:** Document and report generation

**New Capabilities (CA Extension):**

| Code | Name | Description |
|------|------|-------------|
| DOC_BUSINESSCASE | Business Case | Executive summary, financials, recommendation |
| DOC_ROADMAP | Roadmap | Phases, milestones, governance |

**KB Files:**
- DOC_KB_Consulting_Templates_v1.txt (NEW)
- (existing DOC KB files)

---

## EAP - Shared Platform KB

**Available to all agents:**

| File | Purpose |
|------|---------|
| EAP_KB_Data_Provenance_v1.txt | Data sourcing standards |
| EAP_KB_Confidence_Levels_v1.txt | Certainty language |
| EAP_KB_Error_Handling_v1.txt | Error response patterns |
| EAP_KB_Formatting_Standards_v1.txt | Output formatting |
| EAP_KB_Strategic_Principles_v1.txt | MPA strategic context |
| EAP_KB_Communication_Contract_v1.txt | Response guidelines |

---

## Deprecated Agents (Archived)

| Code | Name | Archive Location |
|------|------|------------------|
| NDS | NDS Agent | archive/nds/ |
| CSO | CSO Agent | archive/cso/ |
| UDM | UDM Agent | archive/udm/ |

---

## Test Scenarios

| Agent | Test File | Scenarios |
|-------|-----------|-----------|
| CST | base/agents/cst/tests/CST_Test_Scenarios.json | 10 |
| CHG | base/agents/chg/tests/CHG_Test_Scenarios.json | 10 |
| E2E | base/tests/E2E_Test_Scenarios.json | Routing + Capabilities + KB |
