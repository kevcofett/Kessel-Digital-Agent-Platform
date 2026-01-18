# KDAP v6.0 Release Notes

**Release Date:** January 2026
**Branch:** feature/v6.0-kb-expansion
**Codename:** CA Integration

---

## Summary

KDAP v6.0 introduces Consulting Agent (CA) capabilities to the platform, adding strategic consulting, change management, and financial analysis functionality. This release expands the platform from 6 active specialist agents to 8.

---

## New Features

### New Agents

#### CST - Consulting Strategy Agent
- Framework selection and recommendation
- Strategic analysis (SWOT, PESTEL, Porter, etc.)
- Prioritization methods (RICE, MoSCoW, Weighted Matrix)
- Consulting engagement guidance

#### CHG - Change Management Agent
- Change readiness assessment (ADKAR, Kotter, Lewin)
- Stakeholder mapping and analysis
- Adoption and rollout planning

### Extended Agents

#### ANL - Analytics Agent
- 6 new financial capabilities:
  - NPV calculation with sensitivity analysis
  - IRR and MIRR calculation
  - Total Cost of Ownership (TCO)
  - Monte Carlo simulation
  - Sensitivity analysis (tornado/spider)
  - Payback period calculation

#### DOC - Document Agent
- 2 new consulting document types:
  - Business case generation
  - Implementation roadmap generation

### Platform Enhancements

#### EAP Shared KB
- 6 new platform-wide KB files for consistency:
  - Data Provenance standards
  - Confidence Levels guidance
  - Error Handling patterns
  - Formatting Standards
  - Strategic Principles
  - Communication Contract

#### ORC Routing Updates
- Added routing rules for CST and CHG
- Enhanced multi-agent coordination
- New routing logic KB

---

## New Data

### Dataverse Tables

| Table | Records | Purpose |
|-------|---------|---------|
| ca_framework | 60 | Consulting framework reference |
| ca_project | - | Engagement tracking |
| ca_deliverable | - | Deliverable tracking |

### Framework Categories (60 Total)

- Strategic: 11 frameworks
- Competitive: 6 frameworks
- Operational: 8 frameworks
- Customer: 7 frameworks
- Financial: 7 frameworks
- Change: 6 frameworks
- Planning: 8 frameworks
- Problem-Solving: 7 frameworks

### New Capabilities (15 Total)

- CST: 4 capabilities
- CHG: 3 capabilities
- ANL: 6 capabilities (financial)
- DOC: 2 capabilities (consulting)

---

## Azure Functions (Personal Environment Only)

4 new Azure Functions for enhanced computation:
- anl-npv-function
- anl-irr-function
- anl-montecarlo-function
- anl-sensitivity-function

Note: Not available in Mastercard environment. AI Builder prompts provide fallback.

---

## Deprecated

### Archived Agents

The following agents have been archived (not deleted):

| Agent | Archive Location |
|-------|------------------|
| NDS | archive/nds/ |
| CSO | archive/cso/ |
| UDM | archive/udm/ |

---

## File Inventory

### New Files Created

| Category | Count |
|----------|-------|
| Agent Instructions | 2 |
| KB Files | 13 |
| Dataverse Schemas | 3 |
| Seed Data CSVs | 2 |
| AI Builder Prompts | 15 |
| Azure Functions | 4 |
| Test Scenarios | 3 |
| Documentation | 4 |

### Total New Files: 46

---

## Breaking Changes

None. This release is additive.

---

## Known Limitations

1. Azure Functions not available in Mastercard environment
2. Monte Carlo simulation limited to 50,000 iterations
3. Business case and roadmap generation require structured input

---

## Migration Notes

### From v5.x

1. No migration required for existing functionality
2. New tables (ca_*) must be deployed
3. New capabilities must be registered
4. ORC routing rules must be updated

### Environment-Specific

- Personal: Deploy all components including Azure Functions
- Mastercard: Deploy without Azure Functions; AI Builder only

---

## Testing

### Test Coverage

- CST: 10 test scenarios
- CHG: 10 test scenarios
- E2E: Routing, capability, KB retrieval tests

### Validation Criteria

- Routing tests: 100% pass required
- Capability tests: 95%+ acceptable
- KB retrieval: 100% pass required

---

## Documentation

- DEPLOYMENT_GUIDE.md - Complete deployment instructions
- AGENT_REFERENCE.md - All agents and capabilities
- CAPABILITY_CATALOG.md - Detailed capability specifications
- RELEASE_NOTES_v6.0.md - This document

---

## Contributors

- Kevin Bauer - Product Owner, Desktop Implementation
- Claude Code (VS Code) - Technical Implementation, Documentation

---

## Support

GitHub: https://github.com/kevcofett/Kessel-Digital-Agent-Platform
