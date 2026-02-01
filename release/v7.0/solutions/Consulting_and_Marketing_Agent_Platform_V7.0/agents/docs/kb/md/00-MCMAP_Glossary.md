# MCMAP GLOSSARY AND TERMINOLOGY REFERENCE

This document provides definitions for all acronyms, terms, and concepts used across MCMAP documentation.

---

## AGENT CODES

| Code | Name | Description |
|------|------|-------------|
| ANL | Analytics Agent | Budget projections, forecasting, ROI calculations, scenario modeling, statistical validation |
| AUD | Audience Agent | Segmentation, LTV modeling, propensity scoring, identity resolution, targeting |
| CA | Consulting Analysis Agent | Business case development, strategic analysis |
| CHA | Channel Agent | Media mix optimization, channel selection, benchmarking |
| CHG | Change Management Agent | Adoption planning, stakeholder mapping, readiness assessment |
| CST | Consulting Strategy Agent | Framework selection, RICE/MoSCoW prioritization |
| DOC | Document Agent | Report generation, deliverable creation, template management |
| DOCS | Documentation Assistant | Architecture discovery, terminology lookup (this agent) |
| MKT | Marketing Agent | Campaign strategy, creative briefs, competitive intelligence |
| ORC | Orchestrator Agent | Intent routing, session management, agent coordination |
| PRF | Performance Agent | Attribution modeling, anomaly detection, optimization recommendations |
| SPO | Supply Path Optimization Agent | Programmatic optimization, fee analysis, working media ratio |

---

## PLATFORM ACRONYMS

| Acronym | Full Name | Definition |
|---------|-----------|------------|
| CAL | Capability Abstraction Layer | Architecture pattern that separates capability definitions from implementations, enabling portability |
| DLP | Data Loss Prevention | Mastercard security policies controlling data flow and connector usage |
| EAP | Enterprise Agent Platform | Shared infrastructure layer supporting all MCMAP agents |
| KB | Knowledge Base | Document collection providing domain expertise to agents |
| MCMAP | Mastercard Consulting & Marketing Agent Platform | Full platform name encompassing all agents and capabilities |
| MPA | Media Planning Agent | Primary workflow agent for media planning; also refers to the media planning domain |
| ORC | Orchestrator | Central routing and coordination agent |
| RAG | Retrieval-Augmented Generation | Pattern where AI retrieves relevant documents before generating responses |

---

## TECHNOLOGY TERMS

| Term | Definition |
|------|------------|
| AI Builder | Microsoft's low-code AI service for creating custom prompts and models |
| Capability | Discrete computational function that agents can invoke (e.g., ANL_MARGINAL_RETURN) |
| Capability Dispatcher | Flow that routes capability requests to appropriate implementations |
| Copilot Studio | Microsoft's conversational AI platform for building agents |
| Dataverse | Microsoft's database platform for Power Platform applications |
| Power Automate | Microsoft's workflow automation service |
| SharePoint | Microsoft's document management platform hosting MCMAP knowledge bases |
| Topic | Copilot Studio conversation unit that handles specific user intents |

---

## METRICS AND KPIs

| Term | Definition |
|------|------------|
| CAC | Customer Acquisition Cost - total cost to acquire one customer |
| CPA | Cost Per Acquisition - cost per conversion action |
| CPC | Cost Per Click - cost for each ad click |
| CPM | Cost Per Thousand Impressions - cost per 1,000 ad views |
| CTR | Click-Through Rate - percentage of impressions that result in clicks |
| Incrementality | True causal impact of marketing, measuring lift vs. what would have happened anyway |
| LTV | Lifetime Value - total expected revenue from a customer relationship |
| NBI | Net Bidder Impact - programmatic metric measuring true media value |
| ROAS | Return on Ad Spend - revenue generated per dollar of ad spend (note: MCMAP challenges this as primary KPI) |
| ROI | Return on Investment - general measure of investment efficiency |
| Working Media Ratio | Percentage of media budget reaching actual impressions vs. fees |

---

## CONSULTING FRAMEWORKS

| Framework | Description |
|-----------|-------------|
| ADKAR | Change management model: Awareness, Desire, Knowledge, Ability, Reinforcement |
| BCG Matrix | Boston Consulting Group portfolio analysis (Stars, Cash Cows, Dogs, Question Marks) |
| Kotter 8-Step | Change management process from urgency through anchoring |
| McKinsey 7S | Organizational alignment: Strategy, Structure, Systems, Shared Values, Style, Staff, Skills |
| MoSCoW | Prioritization: Must have, Should have, Could have, Won't have |
| PESTEL | Environmental analysis: Political, Economic, Social, Technological, Environmental, Legal |
| Porter's Five Forces | Competitive analysis framework |
| RICE | Prioritization scoring: Reach, Impact, Confidence, Effort |
| SWOT | Situational analysis: Strengths, Weaknesses, Opportunities, Threats |

---

## MEASUREMENT TERMS

| Term | Definition |
|------|------------|
| Attribution | Assigning credit to marketing touchpoints for conversions |
| Diminishing Returns | Reduced incremental impact as spend increases |
| Frequency Cap | Maximum number of ad exposures per user in time period |
| Holdout | Control group excluded from marketing for testing |
| Lift Test | Experiment measuring incremental impact vs. control |
| Marginal Return | Additional value generated per additional unit of spend |
| Response Curve | Mathematical relationship between spend and outcome |
| Saturation | Point where additional spend yields minimal incremental return |

---

## PROGRAMMATIC TERMS

| Term | Definition |
|------|------------|
| DSP | Demand-Side Platform - system for buying programmatic ads |
| Header Bidding | Auction technique allowing multiple exchanges to bid simultaneously |
| SSP | Supply-Side Platform - system for selling ad inventory |
| Take Rate | Percentage of spend captured by intermediaries as fees |

---

## SECURITY TERMS

| Term | Definition |
|------|------------|
| Approved Connector | Microsoft connector permitted under Mastercard DLP policy |
| Azure AD | Microsoft's identity and access management service |
| Data Provenance | Tracking origin and lineage of data used by agents |
| Session Isolation | Ensuring user data is not accessible to other sessions |

---

## REVENUE AND BUSINESS TERMS

| Term | Definition |
|------|------------|
| TAM | Total Addressable Market - total revenue opportunity |
| Agent Factory | MCMAP model where infrastructure enables rapid agent creation |
| Marginal Cost | Cost of producing one additional unit (decreases per agent in MCMAP) |
| Time-to-Value | Duration from project start to delivering business value |

---

## DOCUMENT REFERENCES

| Doc # | Title | Primary Topics |
|-------|-------|----------------|
| 01 | Executive Summary | Strategic value, platform overview |
| 02 | System Architecture | Technical stack, integration patterns |
| 03 | Security Compliance | DLP, data protection, audit |
| 04 | Agent Capabilities | Agent inventory, capability reference |
| 05 | Data Architecture | Dataverse schema, data flows |
| 06 | AI Builder Integration | Prompt specifications |
| 07 | Operational Runbook | Support, maintenance |
| 08 | Quality Assurance | Testing framework |
| 09 | Future Use Cases | Strategic opportunities |
| 10 | Contact Reference | Support contacts |

---

**Document Version:** 1.0
**Last Updated:** January 24, 2026
