# Kessel Digital Agent Platform v6.0

## Multi-Agent Architecture

Version 6.0 introduces a specialist agent architecture replacing the monolithic MPA v5.5. Seven purpose-built agents handle specific domains, coordinated by an Orchestrator.

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
        ┌────────────────────┼────────────────────┐
        │            │       │       │            │
   ┌────▼────┐ ┌─────▼─────┐ │ ┌─────▼─────┐ ┌────▼────┐
   │Analytics│ │ Audience  │ │ │  Channel  │ │ Supply  │
   │  (ANL)  │ │   (AUD)   │ │ │   (CHA)   │ │  Path   │
   └─────────┘ └───────────┘ │ └───────────┘ │  (SPO)  │
                             │               └─────────┘
                    ┌────────▼────────┐
                    │                 │
               ┌────▼────┐      ┌─────▼─────┐
               │Document │      │Performance│
               │  (DOC)  │      │   (PRF)   │
               └─────────┘      └───────────┘
```

---

## Agent Summary

| Code | Name | Purpose | KB Files |
|------|------|---------|----------|
| ORC | Orchestrator | Routes requests, manages sessions | 2 |
| ANL | Analytics | Calculations, projections, scenarios | 4 |
| AUD | Audience | Segmentation, LTV, first-party data | 4 |
| CHA | Channel | Channel selection, allocation, benchmarks | 3 |
| SPO | Supply Path | NBI calculation, fee analysis | 3 |
| DOC | Document | Document generation, exports | 3 |
| PRF | Performance | Performance analysis, optimization | 3 |

**Total: 7 agents, 22 KB files**

---

## Directory Structure

```
release/v6.0/
├── README.md                          # This file
├── COPILOT_STUDIO_DEPLOYMENT_CHECKLIST.md
├── VSCODE_PHASE5_6_DEPLOYMENT_PROMPT.md
│
├── agents/
│   ├── orc/                           # Orchestrator
│   │   ├── README.md
│   │   ├── instructions/
│   │   │   └── ORC_Copilot_Instructions_v1.txt
│   │   └── kb/
│   │       ├── ORC_KB_Workflow_Gates_v1.txt
│   │       └── ORC_KB_Error_Handling_v1.txt
│   │
│   ├── anl/                           # Analytics
│   │   ├── README.md
│   │   ├── instructions/
│   │   │   └── ANL_Copilot_Instructions_v1.txt
│   │   ├── kb/
│   │   │   ├── ANL_KB_Analytics_Engine_v1.txt
│   │   │   ├── ANL_KB_Projection_Methods_v1.txt
│   │   │   ├── ANL_KB_Scenario_Modeling_v1.txt
│   │   │   └── ANL_KB_Statistical_Tests_v1.txt
│   │   └── flows/
│   │
│   ├── aud/                           # Audience
│   │   ├── README.md
│   │   ├── instructions/
│   │   │   └── AUD_Copilot_Instructions_v1.txt
│   │   ├── kb/
│   │   │   ├── AUD_KB_Segmentation_Methods_v1.txt
│   │   │   ├── AUD_KB_LTV_Models_v1.txt
│   │   │   ├── AUD_KB_Targeting_Strategy_v1.txt
│   │   │   └── AUD_KB_First_Party_Data_v1.txt
│   │   └── flows/
│   │
│   ├── cha/                           # Channel
│   │   ├── README.md
│   │   ├── instructions/
│   │   │   └── CHA_Copilot_Instructions_v1.txt
│   │   ├── kb/
│   │   │   ├── CHA_KB_Channel_Registry_v1.txt
│   │   │   ├── CHA_KB_Channel_Playbooks_v1.txt
│   │   │   └── CHA_KB_Allocation_Methods_v1.txt
│   │   └── flows/
│   │
│   ├── spo/                           # Supply Path
│   │   ├── README.md
│   │   ├── instructions/
│   │   │   └── SPO_Copilot_Instructions_v1.txt
│   │   ├── kb/
│   │   │   ├── SPO_KB_NBI_Calculation_v1.txt
│   │   │   ├── SPO_KB_Fee_Analysis_v1.txt
│   │   │   └── SPO_KB_Partner_Evaluation_v1.txt
│   │   └── flows/
│   │
│   ├── doc/                           # Document
│   │   ├── README.md
│   │   ├── instructions/
│   │   │   └── DOC_Copilot_Instructions_v1.txt
│   │   ├── kb/
│   │   │   ├── DOC_KB_Template_Library_v1.txt
│   │   │   ├── DOC_KB_Formatting_Rules_v1.txt
│   │   │   └── DOC_KB_Export_Specifications_v1.txt
│   │   └── flows/
│   │
│   └── prf/                           # Performance
│       ├── README.md
│       ├── instructions/
│       │   └── PRF_Copilot_Instructions_v1.txt
│       ├── kb/
│       │   ├── PRF_KB_Optimization_Triggers_v1.txt
│       │   ├── PRF_KB_Anomaly_Detection_v1.txt
│       │   └── PRF_KB_Learning_Extraction_v1.txt
│       └── flows/
│
├── platform/
│   └── agent-registry.json            # Agent configuration
│
├── tests/
│   └── multi-agent-routing-tests.json # Routing validation
│
└── contracts/
    └── INTER_AGENT_CONTRACT_v1.json   # Communication protocol
```

---

## Quick Start

### 1. Verify Files
```bash
cd Kessel-Digital-Agent-Platform
git checkout feature/multi-agent-architecture

# Count all agent files
for agent in orc anl aud cha spo doc prf; do
  echo "$agent: $(ls release/v6.0/agents/$agent/kb/*.txt | wc -l) KB files"
done
```

### 2. Deploy to Copilot Studio
Follow `COPILOT_STUDIO_DEPLOYMENT_CHECKLIST.md` for step-by-step instructions.

### 3. Validate Routing
Run test scenarios from `tests/multi-agent-routing-tests.json`.

---

## Agent Capabilities

### ORC - Orchestrator
- Intent classification
- Agent routing
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

### CHA - Channel
- Channel mix recommendations
- Budget allocation
- Vertical playbooks (B2B, ecommerce, CPG, DTC)
- Benchmark lookup
- Funnel mapping

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

### PRF - Performance
- Performance vs benchmark analysis
- Anomaly detection
- Learning extraction
- Optimization recommendations

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

---

## Cross-Agent Handoffs

Agents can hand off to each other for complex workflows:

| From | To | Trigger |
|------|-----|---------|
| ANL | CHA | After calculations, need channel recommendations |
| AUD | CHA | After segmentation, need channel targeting |
| CHA | SPO | After channel selection, need supply path analysis |
| PRF | CHA | After performance analysis, need reallocation |
| Any | DOC | When user requests document/export |

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
| Development | feature/multi-agent-architecture | Active |
| Personal (Aragorn AI) | deploy/personal | Pending |
| Corporate (Mastercard) | deploy/mastercard | Pending |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 6.0 | January 2026 | Multi-agent architecture release |
| 5.5 | December 2025 | Monolithic MPA (deprecated) |

---

## Contributing

1. All changes to agent instructions require character count validation
2. KB files must include cross-references
3. New agents require README, instructions, and minimum 2 KB files
4. All commits must follow conventional commit format

---

## Support

- Repository: Kessel-Digital-Agent-Platform
- Branch: feature/multi-agent-architecture
- Documentation: See individual agent README files
