# Kessel Digital Agent Platform v7.0

## Multi-Agent Architecture

Version 7.0 introduces the **GHA (Growth Hacking Agent)** as a Growth Strategy Orchestrator, expanding the platform to 11 specialized agents. GHA coordinates with specialist agents (ANL, AUD, CHA, DOC) for comprehensive growth marketing strategies with AARRR lifecycle optimization.

---

## What's New in v7.0

- **GHA Agent**: Growth Strategy Orchestrator with AARRR lifecycle optimization
- **10 New AI Builder Prompts**: GHA-specific prompts for growth strategy
- **3 New Power Automate Flows**: GetGrowthState, UpdateGrowthProgress, RequestSpecialistViaORC
- **Cross-Domain Integration**: GHA coordinates with ANL, AUD, CHA, DOC specialists
- **Updated Agent Solutions**: AUD, CHA, DOC solutions updated with GHA integration
- **36 Total AI Builder Prompts**: 26 base + 10 GHA prompts

---

## Architecture Overview

```
                         ┌─────────────────┐
                         │   User Query    │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │   Orchestrator  │
                         │      (ORC)      │
                         └────────┬────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
   ┌────▼────┐              ┌─────▼─────┐             ┌─────▼─────┐
   │  MPA    │              │   GHA     │             │    CA     │
   │ Domain  │              │  Growth   │             │ Consulting│
   │         │              │ Strategy  │             │  Domain   │
   └────┬────┘              │Orchestrator│            └─────┬─────┘
        │                   └─────┬─────┘                   │
   ┌────┼────────────┐            │               ┌─────────┼─────────┐
   │    │    │       │            │               │         │         │
┌──▼──┐ ▼  ┌─▼─┐ ┌───▼───┐       │           ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│ ANL │AUD │CHA│ │  SPO  │       │           │  CST  │ │  CHG  │ │   CA  │
└─────┘    └───┘ └───────┘       │           └───────┘ └───────┘ └───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                ┌───▼───┐   ┌────▼────┐   ┌───▼───┐
                │  DOC  │   │   PRF   │   │  MKT  │
                │Support│   │ Support │   │       │
                └───────┘   └─────────┘   └───────┘
```

---

## Agent Summary

| Code | Name | Domain | Purpose | KB Files |
|------|------|--------|---------|----------|
| ORC | Orchestrator | Platform | Routes requests, manages sessions | 3 |
| ANL | Analytics | MPA | Calculations, projections, scenarios | 9 |
| AUD | Audience | MPA | Segmentation, LTV, first-party data | 9 |
| CHA | Channel | MPA | Channel selection, allocation, benchmarks | 10 |
| SPO | Supply Path | MPA | NBI calculation, fee analysis | 7 |
| DOC | Document | Support | Document generation, exports | 5 |
| PRF | Performance | Support | Performance analysis, optimization | 7 |
| CHG | Change Mgmt | CA | Change readiness, adoption planning | 7 |
| CST | Consulting | CA | Strategic frameworks, prioritization | 7 |
| MKT | Marketing | CA | Marketing strategy, campaign planning | 7 |
| **GHA** | **Growth Hacking** | **Growth** | **AARRR lifecycle, growth strategy** | **10+** |

**Total: 11 agents, 80+ KB files, 36 AI Builder prompts, 28+ Power Automate flows**

---

## Directory Structure

```
release/v7.0/
├── README.md                          # This file
├── COPILOT_STUDIO_DEPLOYMENT_CHECKLIST.md
├── QUICK_REFERENCE.md
│
├── agents/
│   ├── orc/                           # Orchestrator
│   │   ├── README.md
│   │   ├── instructions/
│   │   │   └── ORC_Copilot_Instructions_v3.txt
│   │   └── kb/
│   │       ├── ORC_KB_Routing_Logic_v1.txt
│   │       ├── ORC_KB_Workflow_Gates_v1.txt
│   │       └── ORC_KB_GHA_Integration_v1.txt
│   │
│   ├── anl/                           # Analytics
│   ├── aud/                           # Audience
│   ├── cha/                           # Channel
│   ├── spo/                           # Supply Path
│   ├── doc/                           # Document
│   ├── prf/                           # Performance
│   ├── chg/                           # Change Management
│   ├── cst/                           # Consulting Strategy
│   ├── mkt/                           # Marketing
│   │
│   ├── gha/                           # Growth Hacking Agent (v7.0 NEW)
│   │   ├── README.md
│   │   ├── instructions/
│   │   │   └── GHA_Copilot_Instructions_v1.txt
│   │   ├── kb/
│   │   │   ├── GHA_KB_Specialist_Requests_v1.txt
│   │   │   ├── GHA_KB_Growth_Workflows_v1.txt
│   │   │   └── ... (10+ KB files)
│   │   ├── flows/
│   │   │   ├── GetGrowthState.yaml
│   │   │   ├── UpdateGrowthProgress.yaml
│   │   │   └── RequestSpecialistViaORC.yaml
│   │   └── docs/
│   │       └── kb/
│   │           └── 06-MCMAP_AIBuilder_Integration.md
│   │
│   └── docs/
│       └── kb/                        # MCMAP Reference Documents
│           ├── 00-MCMAP_Index.md
│           ├── 01-MCMAP_Executive_Summary.md
│           ├── 02-MCMAP_System_Architecture.md
│           ├── 03-MCMAP_Security_Compliance.md
│           ├── 04-MCMAP_Agent_Capabilities.md
│           ├── 05-MCMAP_Data_Architecture.md
│           ├── 06-MCMAP_AIBuilder_Integration.md
│           └── ... (20+ reference docs)
│
├── platform/
│   ├── flows/                         # Power Automate flows
│   └── security/                      # ABAC access control
│
├── solutions/                         # Power Platform solutions
│   ├── DEPLOYMENT_GUIDE.md
│   ├── agents/
│   │   ├── gha/solution.xml          # GHA solution (v7.0 NEW)
│   │   └── ... (10 more agent solutions)
│   └── platform/
│       └── data/
│           ├── eap_prompt_gha_v7.xml
│           └── eap_capability_impl_gha_v7.xml
│
├── scripts/
│   ├── deploy_ai_builder_prompts_gha_v7.md
│   ├── gha_ai_builder_prompts.json
│   └── deploy_power_automate_flows_manual.md
│
├── docs/
│   ├── MASTERCARD_COMPLETE_DEPLOYMENT_GUIDE.md
│   ├── MASTERCARD_MANUAL_DEPLOYMENT_PLAN.md
│   └── VSCODE_DEPLOYMENT_INSTRUCTIONS.md
│
└── deployment/
    └── mastercard/
        └── .env.mastercard
```

---

## Quick Start

### 1. Verify Files
```bash
cd Kessel-Digital-Agent-Platform
git checkout main

# Count all agent files
for agent in orc anl aud cha spo doc prf chg cst mkt gha; do
  echo "$agent: $(ls release/v7.0/agents/$agent/kb/*.txt 2>/dev/null | wc -l) KB files"
done
```

### 2. Deploy to Copilot Studio
Follow `COPILOT_STUDIO_DEPLOYMENT_CHECKLIST.md` for step-by-step instructions.

### 3. Deploy Complete Solution
Follow `docs/MASTERCARD_COMPLETE_DEPLOYMENT_GUIDE.md` for comprehensive deployment.

---

## Agent Capabilities

### ORC - Orchestrator
- Intent classification
- Agent routing (now includes GHA routing)
- Session management
- Error handling
- Workflow coordination

### ANL - Analytics
- Reach/frequency calculations
- Impression projections
- Budget scenario modeling
- Statistical significance testing
- Diminishing returns analysis

### AUD - Audience
- RFM segmentation
- LTV calculation
- Cohort analysis
- First-party data strategy
- CDP/clean room guidance
- **v7.0**: Growth lifecycle segmentation for GHA

### CHA - Channel
- Channel mix recommendations
- Budget allocation
- Vertical playbooks
- Benchmark lookup
- Funnel mapping
- **v7.0**: Growth channel recommendations for GHA

### SPO - Supply Path
- Net Bid Impression (NBI) calculation
- Fee structure analysis
- Partner evaluation
- PMP vs open exchange comparison

### DOC - Document
- Media plan generation
- Excel/PDF/Word exports
- Template application
- Multi-format output
- **v7.0**: Growth strategy documents for GHA

### PRF - Performance
- Performance vs benchmark analysis
- Anomaly detection
- Learning extraction
- Optimization recommendations

### CHG - Change Management
- Change readiness assessment
- Stakeholder mapping
- Adoption planning

### CST - Consulting Strategy
- Strategic framework selection
- Initiative prioritization
- Strategic analysis

### MKT - Marketing
- Marketing strategy development
- Campaign planning
- Competitive analysis

### GHA - Growth Hacking (v7.0 NEW)
- **AARRR Lifecycle Analysis**: Acquisition, Activation, Retention, Referral, Revenue
- **North Star Metric Definition**: Define and validate growth focus metrics
- **Growth Framework Selection**: AARRR, Hook Model, Growth Loops, JTBD
- **Tactic Recommendation**: ICE-scored tactics by lifecycle stage
- **Behavioral Psychology**: Hook Model, Fogg Model, cognitive biases
- **Competitor Growth Analysis**: Fintech/neobank growth strategy analysis
- **Experiment Design**: A/B tests, cohort analysis, painted door tests
- **Growth Projections**: Scenario analysis with compounding effects
- **Specialist Coordination**: Routes to ANL, AUD, CHA, DOC via ORC

---

## Routing Logic

The Orchestrator routes based on keyword patterns:

| Keywords | Agent |
|----------|-------|
| calculate, projection, reach, frequency, scenario | ANL |
| segment, audience, rfm, ltv, customer, targeting | AUD |
| channel, allocation, budget, mix, cpm, benchmark | CHA |
| nbi, supply path, fee, dsp, ssp, programmatic | SPO |
| document, export, pdf, word, excel, report | DOC |
| performance, analyze, anomaly, learning, optimize | PRF |
| change, readiness, adoption, stakeholder | CHG |
| framework, strategy, porter, prioritize | CST |
| marketing, campaign, creative, messaging | MKT |
| **growth, aarrr, lifecycle, acquisition, retention, referral, viral, north star** | **GHA** |

---

## Cross-Agent Handoffs

Agents can hand off to each other for complex workflows:

| From | To | Trigger |
|------|-----|---------|
| ANL | CHA | After calculations, need channel recommendations |
| AUD | CHA | After segmentation, need channel targeting |
| CHA | SPO | After channel selection, need supply path analysis |
| PRF | CHA | After performance analysis, need reallocation |
| **GHA** | **ANL** | **Need growth projections** |
| **GHA** | **AUD** | **Need segment analysis for growth** |
| **GHA** | **CHA** | **Need channel recommendations for growth** |
| **GHA** | **DOC** | **Need growth strategy documentation** |
| Any | DOC | When user requests document/export |

---

## GHA Multi-Agent Coordination

GHA can request specialist assistance via ORC:

```
USER: "Help me develop a growth strategy for a fintech app"

MCMAP WORKFLOW:
1. ORC classifies intent -> Routes to GHA
2. GHA analyzes AARRR lifecycle stage
3. GHA requests AUD via ORC -> Segment analysis
4. GHA requests ANL via ORC -> Growth projections
5. GHA requests CHA via ORC -> Channel recommendations
6. GHA synthesizes specialist contributions
7. GHA requests DOC via ORC -> Growth strategy document
8. Final output: Comprehensive growth strategy with projections
```

---

## Compliance Requirements

All instruction and KB files must follow:

1. **Character Limits**
   - Instructions: < 8,000 characters
   - KB files: < 36,000 characters

2. **Formatting**
   - Plain text only (no markdown rendering)
   - ALL-CAPS section headers
   - Hyphens for lists (no bullets)
   - ASCII characters only

3. **Structure**
   - Document header with metadata
   - Cross-references to related files
   - Version history

---

## Deployment Environments

| Environment | Branch | Status |
|-------------|--------|--------|
| Development | main | Active |
| Personal (Aragorn AI) | deploy/personal | v7.0 Ready |
| Corporate (Mastercard) | deploy/mastercard | v7.0 Ready |
| Corporate (General) | deploy/corporate | v7.0 Ready |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 7.0 | January 2026 | GHA Growth Strategy Orchestrator, 10 new AI prompts |
| 6.0 | January 2026 | Multi-agent architecture release |
| 5.5 | December 2025 | Monolithic MPA (deprecated) |

---

## Contributing

1. All changes to agent instructions require character count validation
2. KB files must include cross-references
3. New agents require README, instructions, and minimum 2 KB files
4. All commits must follow conventional commit format
5. **v7.0+**: GHA integration requires ORC routing logic updates

---

## Support

- Repository: Kessel-Digital-Agent-Platform
- Branches: main, deploy/mastercard, deploy/corporate, deploy/personal
- Documentation: See `docs/MASTERCARD_COMPLETE_DEPLOYMENT_GUIDE.md`
