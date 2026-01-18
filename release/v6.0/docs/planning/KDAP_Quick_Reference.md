# KDAP Build Plan - Quick Reference Summary

## The 10-Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR                            │
│                            (ORC)                                │
│                   Routes all user queries                       │
└─────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   MPA DOMAIN    │  │   CA DOMAIN     │  │     SHARED      │
│                 │  │                 │  │                 │
│  ANL Analytics  │  │  CST Strategy   │  │  DOC Document   │
│  AUD Audience   │  │  CHG Change     │  │                 │
│  CHA Channel    │  │                 │  │  EAP Platform   │
│  SPO Supply     │  │                 │  │  (6 KB files)   │
│  PRF Perform    │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Work Distribution Summary

| Phase | Days | VS Code Tasks | Desktop Tasks |
|-------|------|---------------|---------------|
| 1. Foundation | 1-2 | Archive deprecated, create directories, copy reference files | - |
| 2. EAP Shared KB | 3-4 | Commit/push | Create 6 EAP KB files |
| 3. ANL/DOC Extensions | 5-6 | Commit/push | Create 2 extension KB files |
| 4. CST Agent | 7-9 | Commit/push | Create 5 CST files |
| 5. CHG Agent | 10-11 | Commit/push | Create 4 CHG files |
| 6. ORC Updates | 12 | Commit/push | Update 2 ORC files |
| 7. Dataverse | 13-15 | Deploy tables, load seed data, register capabilities | - |
| 8. AI Builder | 16-18 | Create 15 prompts, register in eap_prompt | - |
| 9. Azure Functions | 19-21 | Create 4 functions, deploy, register | - |
| 10. Testing | 22-24 | Run test suite, fix issues | Support testing |
| 11. Deployment | 25-27 | Deploy both environments | Documentation |

## New Content to Create (Minimal)

### Desktop Claude - 17 Files Total

**EAP Shared (6 files):**
- EAP_KB_Data_Provenance_v1.txt (15K) ← Consolidates CA sources
- EAP_KB_Confidence_Levels_v1.txt (12K) ← Consolidates CA sources
- EAP_KB_Error_Handling_v1.txt (10K) ← New
- EAP_KB_Formatting_Standards_v1.txt (8K) ← New
- EAP_KB_Strategic_Principles_v1.txt (12K) ← New
- EAP_KB_Communication_Contract_v1.txt (10K) ← New

**ANL Extension (1 file):**
- ANL_KB_Financial_Investment_v1.txt (22K) ← Consolidates CA + new

**DOC Extension (1 file):**
- DOC_KB_Consulting_Templates_v1.txt (18K) ← New

**CST Agent (5 files):**
- CST_Copilot_Instructions_v1.txt (8K) ← New
- CST_KB_Consulting_Core_v1.txt (25K) ← Consolidates CA
- CST_KB_Strategic_Frameworks_v1.txt (22K) ← Consolidates CA
- CST_KB_Prioritization_Methods_v1.txt (18K) ← New
- CST_KB_Industry_Context_v1.txt (15K) ← From CA

**CHG Agent (4 files):**
- CHG_Copilot_Instructions_v1.txt (8K) ← New
- CHG_KB_Change_Core_v1.txt (22K) ← New
- CHG_KB_Stakeholder_Methods_v1.txt (18K) ← New
- CHG_KB_Adoption_Planning_v1.txt (15K) ← New

### VS Code Claude - Infrastructure

**Dataverse (3 new tables):**
- ca_framework (60 records)
- ca_project
- ca_deliverable

**Capabilities (15 new):**
- CST: 4 capabilities
- CHG: 3 capabilities
- ANL: 6 financial capabilities
- DOC: 2 consulting capabilities

**AI Builder Prompts (15 new):**
- CST: 4 prompts
- CHG: 3 prompts
- ANL: 6 prompts
- DOC: 2 prompts

**Azure Functions (4 new - Personal only):**
- anl-npv-function
- anl-irr-function
- anl-montecarlo-function
- anl-sensitivity-function

## Content Reuse Map

| Source | Destination | Action |
|--------|-------------|--------|
| CA_CONFIDENCE_LEVELS | EAP_KB_Confidence_Levels | Consolidate |
| CA_DATA_SOURCE_HIERARCHY | EAP_KB_Data_Provenance | Consolidate |
| SOURCE_QUALITY_TIERS | EAP_KB_Data_Provenance | Merge |
| FRAMEWORK_Library_Master | ca_framework table | Extract to Dataverse |
| FRAMEWORK_Consulting_Tools | CST_KB_Strategic_Frameworks | Consolidate |
| FRAMEWORK_Enterprise_Tools | CST_KB_Strategic_Frameworks | Consolidate |
| FRAMEWORK_Advanced_Analytics | ANL_KB_Financial_Investment | Consolidate |
| BEHAVIORAL_*.txt | CST_KB_Consulting_Core | Consolidate |
| INDUSTRY_Expertise_Guide | CST_KB_Industry_Context | Adapt |
| REFERENCE_*.txt | base/shared/reference/ | Copy as-is |
| NDS_*.txt | archive/nds/ | Archive |
| CSO_*.txt | archive/cso/ | Archive |
| UDM_*.txt | archive/udm/ | Archive |

## Key Architecture Decisions

1. **CST + CHG vs Monolithic CA**: Split into 2 focused agents following MPA pattern
2. **ANL absorbs financial calcs**: NPV, IRR, TCO, Monte Carlo → ANL capabilities
3. **DOC absorbs consulting templates**: Business case, roadmap → DOC capabilities
4. **Framework metadata in Dataverse**: Not KB files - enables dynamic selection
5. **AI Builder primary, Azure Functions enhanced**: Capability abstraction maintained
6. **EAP shared KB for ALL agents**: No duplication of confidence/provenance/errors

## File Totals

| Category | Before | After | Change |
|----------|--------|-------|--------|
| Active Agents | 7 + 3 deprecated | 9 active | -1 (UDM deferred) |
| MPA KB Files | 143 | ~120 | Consolidated |
| CA KB Files | 35 | 0 (merged) | Integrated |
| EAP Shared KB | 0 | 6 | +6 |
| New CST KB | 0 | 5 | +5 |
| New CHG KB | 0 | 4 | +4 |
| ANL Extensions | 0 | 1 | +1 |
| DOC Extensions | 0 | 1 | +1 |
| Archived | 0 | 41 | NDS+CSO+UDM |

## Success Criteria

- [ ] 9 active agents (ORC, ANL, AUD, CHA, SPO, DOC, PRF, CST, CHG)
- [ ] 6 EAP shared KB files
- [ ] 60 frameworks in ca_framework table
- [ ] 35 capabilities registered
- [ ] 15 new AI Builder prompts
- [ ] 4 Azure Functions (Personal only)
- [ ] All routing tests pass
- [ ] Both environments deployed
