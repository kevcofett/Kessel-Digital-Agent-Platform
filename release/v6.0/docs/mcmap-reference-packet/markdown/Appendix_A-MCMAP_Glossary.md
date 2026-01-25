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


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

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


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

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


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

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


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## CONSULTING FRAMEWORKS

| Framework | Description | Agent | Use Case |
|-----------|-------------|-------|----------|
| **ADKAR** | Change management model: Awareness, Desire, Knowledge, Ability, Reinforcement | CHG | Organizational change readiness |
| **BCG Matrix** | Boston Consulting Group portfolio analysis (Stars, Cash Cows, Dogs, Question Marks) | CST | Product/investment prioritization |
| **Blue Ocean Strategy** | Creating uncontested market space | CST | Market positioning |
| **Competitive Forces (Porter's Five)** | Industry competition analysis framework | CST | Competitive analysis |
| **Customer Journey Mapping** | End-to-end customer experience visualization | AUD | Customer experience design |
| **DMAIC** | Six Sigma improvement: Define, Measure, Analyze, Improve, Control | CA | Process optimization |
| **Jobs-to-be-Done** | Customer motivation framework | AUD | Product development |
| **Kotter 8-Step** | Change management process from urgency through anchoring | CHG | Large-scale transformation |
| **McKinsey 7S** | Organizational alignment: Strategy, Structure, Systems, Shared Values, Style, Staff, Skills | CST | Organizational design |
| **MoSCoW** | Prioritization: Must have, Should have, Could have, Won't have | CST | Requirements prioritization |
| **OKRs** | Objectives and Key Results goal-setting framework | CST | Performance management |
| **PESTEL** | Environmental analysis: Political, Economic, Social, Technological, Environmental, Legal | CST | Market analysis |
| **RACI Matrix** | Responsibility assignment: Responsible, Accountable, Consulted, Informed | CHG | Role clarity |
| **RICE** | Prioritization scoring: Reach, Impact, Confidence, Effort | CST | Feature/initiative prioritization |
| **RFM Analysis** | Customer segmentation: Recency, Frequency, Monetary | AUD | Customer value assessment |
| **SWOT** | Situational analysis: Strengths, Weaknesses, Opportunities, Threats | CST | Strategic planning |
| **TAM/SAM/SOM** | Market sizing: Total, Serviceable, Obtainable | CA | Market opportunity |
| **Value Chain Analysis** | Primary and support activity optimization | CST | Operational efficiency |
| **VRIO Framework** | Resource-based analysis: Value, Rarity, Imitability, Organization | CST | Competitive advantage |

---


```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## BUILT-IN ANALYTICAL MODELS

| Model | Description | Agent | Output |
|-------|-------------|-------|--------|
| **Attribution Models** | Multi-touch attribution (Linear, Time Decay, Position-Based, Data-Driven) | PRF | Channel contribution analysis |
| **Bayesian Inference** | Probabilistic updating with prior knowledge | ANL | Confidence-adjusted predictions |
| **Budget Allocation Optimizer** | Mathematical optimization for media mix | CHA | Optimal spend distribution |
| **Causal Inference Models** | Difference-in-differences, propensity matching | ANL | Incrementality measurement |
| **Channel Mix Modeling** | Cross-channel synergy and saturation analysis | CHA | Mix recommendations |
| **Customer Lifetime Value (LTV)** | Predictive customer value calculation | AUD | Segment prioritization |
| **Diminishing Returns Curves** | Logarithmic response modeling | ANL | Saturation point identification |
| **Fee Waterfall Analysis** | Programmatic fee decomposition | SPO | Working media optimization |
| **Holdout Test Design** | Statistical experiment configuration | PRF | Test validity |
| **Identity Resolution** | Cross-device matching algorithms | AUD | Unified customer view |
| **Incrementality Measurement** | Causal lift estimation | PRF | True marketing impact |
| **Journey State Detection** | Funnel position identification | AUD | Targeting optimization |
| **Marginal Return Calculator** | Incremental value per spend unit | ANL | Budget efficiency |
| **Net Bidder Impact (NBI)** | Programmatic value assessment | SPO | Partner evaluation |
| **Propensity Scoring** | Conversion likelihood prediction | AUD | Targeting precision |
| **Response Curve Modeling** | Spend-to-outcome relationships | ANL | Optimization inputs |
| **Scenario Comparison** | Multi-scenario evaluation with risk | ANL | Decision support |
| **Segment Prioritization** | Multi-criteria audience ranking | AUD | Resource allocation |
| **Supply Path Optimization** | Fee minimization pathfinding | SPO | Cost efficiency |

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
| 00 | Strategic Platform Vision | Platform opportunity, strategic value, agent overview, efficiency gains, revenue opportunities |
| 02 | System Architecture | Technical stack, integration patterns |
| 03 | Security Compliance | DLP, data protection, audit |
| 04 | Agent Capabilities | Agent inventory, capability reference |
| 05 | Data Architecture | Dataverse schema, data flows |
| 06 | AI Builder Integration | Prompt specifications, agent configuration |
| 07 | Operational Runbook | Support, maintenance |
| 08 | Quality Assurance | Testing framework |
| 09 | Future Use Cases | Strategic opportunities, expansion areas |
| 10 | Contact Reference | Support contacts |

---

**Document Version:** 2.0
**Last Updated:** January 25, 2026
