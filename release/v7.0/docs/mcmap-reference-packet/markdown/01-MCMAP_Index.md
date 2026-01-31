# MCMAP DOCUMENTATION INDEX v7.0

Quick reference for navigating MCMAP documentation.

---

## DOCUMENT OVERVIEW

| Doc # | Title | Key Sections |
|-------|-------|--------------|
| 00 | Title Page | Platform overview, document contents, agent summary |
| 01 | Index (This Document) | Navigation, question routing, cross-references |
| 03 | System Architecture | Technical stack, component layers, ABAC integration |
| 04 | Security & Compliance | DLP, data provenance, audit controls, ABAC |
| 05 | Agent Capabilities | 21 agents (13 active + 8 pending), 40+ capabilities |
| 06 | Data Architecture | 14 Dataverse tables, schema, EAP Security tables |
| 07 | AI Builder Integration | 26 prompts, agent configuration, model settings |
| 08 | Operational Runbook | Support tiers, maintenance, incidents |
| 09 | Quality Assurance | Testing framework, Braintrust, scorers |
| 10 | Future Use Cases | Strategic opportunities, expansion areas |
| 11 | Contact Reference | Kevin Bauer, escalation paths |
| A | Appendix: Glossary | Terms and definitions |

### Integration Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| External Agent Integration Requirements | EXTERNAL_AGENT_INTEGRATION_REQUIREMENTS_v7.0.md | Requirements for external team integrations |
| Databricks Integration Spec | databricks/DATABRICKS_INTEGRATION_SPEC_v7.0.md | Technical specification for Databricks |
| Databricks Configuration | databricks/DATABRICKS_CONFIG_v7.0.md | Environment variables, feature flags |
| Databricks Setup Guide | databricks/DATABRICKS_SETUP_GUIDE_v7.0.md | Deployment instructions |
| DVO Enterprise Spec | dvo/CAAT_Enterprise_DVO_Spec_v7.0.md | DevOps agent specification |
| DVO Architecture | dvo/ENTERPRISE_DVO_ARCHITECTURE_v7.0.md | DevOps architecture design |

### Security & Access Control Documentation

| Document | Purpose |
|----------|---------|
| MCMAP_ABAC_Implementation.md | Complete ABAC implementation guide |
| KB-MCMAP_Access_Control_Reference.md | Agent reference for protected content |
| mcmap_access_rules.yaml | Master access rule configuration |

---

## AGENT INVENTORY (v7.0)

### Active Internal Agents (13)

| Code | Name | Domain | Status |
|------|------|--------|--------|
| ORC | Orchestrator | Platform | Active |
| ANL | Analytics | MPA | Active |
| AUD | Audience | MPA | Active |
| CHA | Channel | MPA | Active |
| SPO | SupplyPath | MPA | Active |
| DOC | Document | Support | Active |
| PRF | Performance | Support | Active |
| CST | ConsultingStrategy | CA | Active |
| CHG | ChangeManagement | CA | Active |
| MKT | MarketingStrategy | CA | Active |
| GHA | GrowthHacking | Growth | Active |
| DOCS | DocumentationAssistant | Support | Active |
| DVO | DevOps | Infrastructure | Active |

### Pending External Agents (8)

| Code | Name | Domain | External Team |
|------|------|--------|---------------|
| MMM | MediaMixModeling | Measurement | MMM Team |
| MMO | MediaMixOptimization | Optimization | MMO Team |
| TAL | TestAndLearn | Experimentation | Test & Learn Team |
| DYN | DynamicYield | Personalization | Dynamic Yield Team |
| RMN | RetailMediaNetworks | Retail Media | MCM Team |
| SES | SessionMLoyalty | Loyalty | Session M Team |
| MEI | MastercardEconomicsInstitute | Economics Data | MEI Team |
| SAL | SalesAILeads | Sales | Sales AI Team |

### Pending Infrastructure Agents (1)

| Code | Name | Domain | Dependency |
|------|------|--------|------------|
| DTA | DataAnalytics | Analytics | Databricks workspace |

---

## QUESTION ROUTING

| Question Type | Document | Section |
|---------------|----------|---------|
| What is MCMAP? | 00 | Platform Overview |
| Strategic value? | 10 | Strategic Opportunities |
| Revenue opportunity? | 10 | Revenue Analysis |
| How many agents? | 00, 05 | Agent Summary |
| What can ANL do? | 05 | Analytics Agent |
| What can AUD do? | 05 | Audience Agent |
| What can GHA do? | 05 | GrowthHacking Agent |
| What can DVO do? | 05 | DevOps Agent |
| Platform stack? | 03 | Technical Foundation |
| DLP compliance? | 04 | DLP Compliance |
| Data provenance? | 04 | Section 11 |
| Dataverse tables? | 06 | Section 2 |
| AI prompts? | 07 | Prompt Inventory |
| Support tiers? | 08 | Section 2 |
| Testing approach? | 09 | Section 3 |
| Who to contact? | 11 | Section 1 |
| How to extend? | External Agent Integration | Full Document |
| Future roadmap? | 10 | Strategic Opportunities |
| Access control? | 04 | ABAC Section |
| Protected content? | KB-Access_Control | All |
| User profiles? | 06 | EAP Security |
| Terms/definitions? | Appendix A | Glossary |
| Databricks integration? | databricks/ | All Documents |
| DevOps/deployment? | dvo/ | All Documents |
| External agent integration? | External Agent Integration | Full Document |

---

## PERSONA-BASED ENTRY POINTS

### Executive Leadership
- **Start:** Document 00 (Title Page), then Document 10 (Future Use Cases)
- **Focus:** Agent ecosystem, competitive positioning, revenue opportunities
- **Key Sections:** Platform Overview, Agent Summary, Strategic Opportunities

### Senior Leadership
- **Start:** Document 03 (System Architecture), then Document 05 (Agent Capabilities)
- **Focus:** Capabilities, scalability, integration pathway
- **Key Sections:** Agent Inventory, External Agent Integration Requirements

### Operations Staff
- **Start:** Document 08 (Operational Runbook)
- **Then:** Document 05 (Agent Capabilities)
- **Support:** Document 11 (Contact Reference)
- **Focus:** Workflows, troubleshooting, escalation

### External Integration Teams
- **Start:** EXTERNAL_AGENT_INTEGRATION_REQUIREMENTS_v7.0.md
- **Then:** Inter-Agent Contract (contracts/INTER_AGENT_CONTRACT_v1.json)
- **Focus:** File delivery requirements, contract compliance, testing

### Infrastructure/DevOps Teams
- **Start:** dvo/ documentation folder
- **Then:** databricks/ documentation folder
- **Focus:** Deployment, infrastructure, data integration

---

## TOPIC CROSS-REFERENCE

| Topic | Primary Doc | Related Docs |
|-------|-------------|--------------|
| Agents | 05 | 00 (Summary), 07 (prompts) |
| Architecture | 03 | 06 (data) |
| Security | 04 | 08 (ops) |
| Testing | 09 | 08 (ops), 05 (capabilities) |
| Extensibility | External Agent Integration | 03, 07 |
| Future Roadmap | 10 | 00 |
| Revenue Opportunity | 10 | 00 |
| Databricks | databricks/ | 06 (data), 05 (DTA agent) |
| DevOps | dvo/ | 05 (DVO agent), 08 (ops) |
| External Agents | External Agent Integration | 05 (agent stubs) |

---

## KEYWORD INDEX

| Keyword | Documents |
|---------|-----------|
| ABAC | 04, 06, MCMAP_ABAC_Implementation |
| Access Control | 04, KB-Access_Control_Reference, MCMAP_ABAC_Implementation |
| AI Builder | 07, 03 |
| Agent Factory | 10 |
| Attribution | 05 (PRF), 09 |
| Budget | 05 (ANL) |
| Capability | 05, 07, 03 |
| Channel | 05 (CHA) |
| Consulting | 05 (CST, CHG, MKT) |
| Databricks | databricks/, 05 (DTA) |
| Dataverse | 06, 03 |
| DevOps | dvo/, 05 (DVO) |
| DLP | 04, 03 |
| DVO | dvo/, 05 |
| DTA | databricks/, 05 |
| Dynamic Yield | External Agent Integration, 05 (DYN) |
| External Agents | External Agent Integration, 05 |
| Framework | 05 (CST), Appendix A |
| Growth Hacking | 05 (GHA) |
| Incrementality | 05 (ANL, PRF) |
| LTV | 05 (AUD), Appendix A |
| MEI | External Agent Integration, 05 |
| MMM | External Agent Integration, 05 |
| MMO | External Agent Integration, 05 |
| Orchestrator | 05 (ORC), 03 |
| Persona | This document |
| Power Platform | 03 |
| Retail Media | External Agent Integration, 05 (RMN) |
| Revenue | 10 |
| Sales AI | External Agent Integration, 05 (SAL) |
| Security | 04, MCMAP_ABAC_Implementation |
| Session M | External Agent Integration, 05 (SES) |
| SharePoint | 03, 07 |
| Strategic | 10 |
| TAL | External Agent Integration, 05 |
| Testing | 09, 08 |
| Vertical | 05 |

---

## COMMON QUESTIONS BY PERSONA

### Executive Questions
| Question | Answer Location |
|----------|-----------------|
| What's the agent ecosystem? | Doc 00, Agent Summary |
| What external integrations? | Doc 00, External Agent Integration |
| What's the Databricks strategy? | databricks/DATABRICKS_INTEGRATION_SPEC |
| What's the competitive advantage? | Doc 10, Strategic Opportunities |

### Leadership Questions
| Question | Answer Location |
|----------|-----------------|
| How does it integrate? | Doc 03, Integration Patterns |
| What's the architecture? | Doc 03, Component Architecture |
| How do we add agents? | External Agent Integration Requirements |
| What's the roadmap? | Doc 10, Strategic Opportunities |

### Operations Questions
| Question | Answer Location |
|----------|-----------------|
| How do I get support? | Doc 08, Support Tiers |
| What are the agents? | Doc 05, Agent Inventory |
| How do I troubleshoot? | Doc 08, Troubleshooting |
| Who do I contact? | Doc 11 |

### External Team Questions
| Question | Answer Location |
|----------|-----------------|
| What files do I need to deliver? | External Agent Integration, Section 2 |
| What's the inter-agent contract? | External Agent Integration, Section 3 |
| How do I integrate with ORC? | External Agent Integration, Section 4 |
| How do I test my agent? | External Agent Integration, Section 7 |

---

**Document Version:** 7.0
**Last Updated:** January 31, 2026
