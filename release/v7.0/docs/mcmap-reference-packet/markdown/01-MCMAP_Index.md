# MCMAP DOCUMENTATION INDEX

Quick reference for navigating MCMAP documentation.

---

## DOCUMENT OVERVIEW

| Doc # | Title | Key Sections |
|-------|-------|--------------|
| 00 | Title Page | Platform overview, document contents |
| 01 | Index (This Document) | Navigation, question routing, cross-references |
| 02 | Executive Summary | Use cases, platform vision, agents, approach, benefits, technical foundation |
| 03 | System Architecture | Technical stack, component layers, ABAC integration |
| 04 | Security & Compliance | DLP, data provenance, audit controls, ABAC |
| 05 | Agent Capabilities | 11 agents, 36 capabilities, invocation patterns |
| 06 | Data Architecture | 18 Dataverse tables, schema, EAP Security tables |
| 07 | AI Builder Integration | 26 prompts, agent configuration, model settings |
| 08 | Operational Runbook | Support tiers, maintenance, incidents |
| 09 | Quality Assurance | Testing framework, Braintrust, scorers |
| 10 | Future Use Cases | Strategic opportunities, expansion areas |
| 11 | Contact Reference | Kevin Bauer, escalation paths |
| A | Appendix: Glossary | Terms and definitions |

### Security & Access Control Documentation

| Document | Purpose |
|----------|---------|
| MCMAP_ABAC_Implementation.md | Complete ABAC implementation guide |
| KB-MCMAP_Access_Control_Reference.md | Agent reference for protected content |
| mcmap_access_rules.yaml | Master access rule configuration |

---

## QUESTION ROUTING

| Question Type | Document | Section |
|---------------|----------|---------|
| What is MCMAP? | 02 | Part 2: The Platform Is The Product |
| Strategic value? | 02 | Part 5: Benefits & Outcomes |
| Revenue opportunity? | 02 | 5.2 Revenue Opportunities |
| How many agents? | 02, 05 | Part 3: The 11 Agents |
| What can ANL do? | 05 | Analytics |
| What can AUD do? | 05 | Audience |
| Platform stack? | 02, 03 | Part 6: Technical Foundation |
| DLP compliance? | 04 | DLP Compliance |
| Data provenance? | 04 | Section 11 |
| Dataverse tables? | 06 | Section 2 |
| AI prompts? | 07 | Prompt Inventory |
| Support tiers? | 08 | Section 2 |
| Testing approach? | 09 | Section 3 |
| Who to contact? | 11 | Section 1 |
| How to extend? | 02 | 4.3 Configuration-Driven Extensibility |
| Future roadmap? | 10 | Strategic Opportunities |
| Access control? | 04 | ABAC Section |
| Protected content? | KB-Access_Control | All |
| User profiles? | 06 | EAP Security |
| Terms/definitions? | Appendix A | Glossary |

---

## PERSONA-BASED ENTRY POINTS

### Executive Leadership
- **Start:** Document 02 (Executive Summary)
- **Focus:** Use cases, competitive positioning, revenue opportunities
- **Key Sections:** Part 1 (Use Cases), Part 5 (Benefits & Outcomes), The Path Forward

### Senior Leadership
- **Start:** Document 02 (Executive Summary), then Document 03 (System Architecture)
- **Focus:** Capabilities, scalability, integration pathway
- **Key Sections:** Part 4 (The Approach), Part 6 (Technical Foundation)

### Operations Staff
- **Start:** Document 08 (Operational Runbook)
- **Then:** Document 05 (Agent Capabilities)
- **Support:** Document 11 (Contact Reference)
- **Focus:** Workflows, troubleshooting, escalation

---

## TOPIC CROSS-REFERENCE

| Topic | Primary Doc | Related Docs |
|-------|-------------|--------------|
| Agents | 05 | 02 (Part 3), 07 (prompts) |
| Architecture | 03 | 02 (Part 6), 06 (data) |
| Security | 04 | 02 (Part 6), 08 (ops) |
| Testing | 09 | 08 (ops), 05 (capabilities) |
| Extensibility | 02 | 03, 07 |
| Future Roadmap | 10 | 02 |
| Revenue Opportunity | 02 | 10 |

---

## KEYWORD INDEX

| Keyword | Documents |
|---------|-----------|
| ABAC | 04, 06, MCMAP_ABAC_Implementation |
| Access Control | 04, KB-Access_Control_Reference, MCMAP_ABAC_Implementation |
| AI Builder | 07, 03, 02 |
| Agent Factory | 02, 10 |
| Attribution | 05 (PRF), 09 |
| Budget | 05 (ANL), 02 |
| Capability | 05, 07, 03 |
| Channel | 05 (CHA), 02 |
| Consulting | 05 (CST, CHG, CA), 10 |
| Dataverse | 06, 03 |
| DLP | 04, 02, 03 |
| Framework | 05 (CST), Appendix A |
| Incrementality | 05 (ANL, PRF), 02 |
| LTV | 05 (AUD), Appendix A |
| Orchestrator | 05 (ORC), 03 |
| Persona | This document |
| Power Platform | 03, 02 |
| Revenue | 02, 10 |
| Security | 04, 02, MCMAP_ABAC_Implementation |
| Session | 06, 03 |
| SharePoint | 03, 07 |
| Strategic | 02, 10 |
| Testing | 09, 08 |
| Vertical | 02, 05 |

---

## COMMON QUESTIONS BY PERSONA

### Executive Questions
| Question | Answer Location |
|----------|-----------------|
| What's the efficiency gain? | Doc 02, 5.1 Efficiency Gains |
| What's the revenue opportunity? | Doc 02, 5.2 Revenue Opportunities |
| What's the competitive advantage? | Doc 02, 5.3 Competitive Positioning |
| What are the risks? | Doc 02, 5.4 Risk Analysis |

### Leadership Questions
| Question | Answer Location |
|----------|-----------------|
| How does it integrate? | Doc 03, Integration Patterns |
| What's the architecture? | Doc 03, Component Architecture |
| How do we extend it? | Doc 02, 4.3 Configuration-Driven Extensibility |
| What's the roadmap? | Doc 10, Strategic Opportunities |

### Operations Questions
| Question | Answer Location |
|----------|-----------------|
| How do I get support? | Doc 08, Support Tiers |
| What are the agents? | Doc 05, Agent Inventory |
| How do I troubleshoot? | Doc 08, Troubleshooting |
| Who do I contact? | Doc 11 |

---

**Document Version:** 3.0
**Last Updated:** January 25, 2026
