# MASTERCARD DEPLOYMENT MASTER CHECKLIST
# Single Source of Truth for Full Deployment

**Version:** 1.0
**Created:** 2026-01-12
**Status:** Ready for VS Code Execution

---

## DOCUMENT INVENTORY

All specification documents are in place:

| Document | Location | Purpose |
|----------|----------|---------|
| PHASE_10_RAG_LEARNING_OPTIMIZATION.md | /packages/agent-core/ | Main spec |
| VSCODE_PHASE_10_EXECUTION_PROMPT.md | /packages/agent-core/ | VS Code instructions |
| RAG_OPTIMIZED_UNIFIED_INSTRUCTIONS.md | /release/v5.5/deployment/mastercard/ | Production instructions |
| MASTERCARD_FULL_DEPLOYMENT_SPECIFICATION.md | /release/v5.5/deployment/mastercard/ | MSFT deployment steps |
| COPILOT_STUDIO_STANDALONE_MODE.md | /release/v5.5/deployment/mastercard/ | Fallback mode |
| UNIFIED_COPILOT_INSTRUCTIONS.md | /release/v5.5/deployment/mastercard/ | Alternative instructions |

---

## PRE-DEPLOYMENT STATUS

### Seed Data ✅
| File | Location | Records |
|------|----------|---------|
| mpa_benchmark_seed.csv | /release/v5.5/agents/mpa/base/data/seed/ | 60 rows |
| mpa_channel_seed.csv | /release/v5.5/agents/mpa/base/data/seed/ | 43 rows |
| mpa_kpi_seed.csv | /release/v5.5/agents/mpa/base/data/seed/ | 43 rows |
| mpa_vertical_seed.csv | /release/v5.5/agents/mpa/base/data/seed/ | 13 rows |

### KB Files ✅
| Agent | Count | Location |
|-------|-------|----------|
| MPA | 32 files | /release/v5.5/agents/mpa/base/kb/ |
| CA | 36 files | /release/v5.5/agents/ca/base/kb/ |
| EAP | 8 files | /release/v5.5/agents/eap/base/kb/ |

### KB Indexes ✅
- MPA: KB_INDEX.txt exists with keywords
- CA: KB_INDEX.txt exists
- EAP: KB_INDEX.txt exists

---

## WHAT VS CODE CREATES

### Part A: Mastercard Environment

| Step | Files Created | Automated? |
|------|--------------|------------|
| A1 | 3 Dataverse table JSONs (mpa_feedback, mpa_kb_usage, mpa_success_patterns) | VS Code |
| A2 | 2 Flow specs (flow_12, flow_13) | VS Code |
| A3 | 2 PowerShell deployment scripts | VS Code |
| A4 | 3 Production instruction .txt files | VS Code |
| A5 | KB header updates (if needed) | VS Code |
| A6 | Git commit + push | VS Code |

### Part B: Personal Environment

| Step | Files Created | Automated? |
|------|--------------|------------|
| B1 | 5 RAG test files | VS Code |
| B2 | KB sync script | VS Code |
| B3 | Environment config update | VS Code |
| B4 | Git commit + push | VS Code |

---

## WHAT REQUIRES MANUAL ACTION

### Copilot Studio (Cannot Automate)

| Task | File to Use | Steps |
|------|-------------|-------|
| Paste MPA Instructions | MPA_Instructions_RAG_PRODUCTION.txt | Open Copilot > Instructions > Paste > Save |
| Paste CA Instructions | CA_Instructions_RAG_PRODUCTION.txt | Open Copilot > Instructions > Paste > Save |
| Paste EAP Instructions | EAP_Instructions_RAG_PRODUCTION.txt | Open Copilot > Instructions > Paste > Save |
| Create Topics | MASTERCARD_FULL_DEPLOYMENT_SPECIFICATION.md Section 7 | Manual in Copilot UI |
| Connect KB | SharePoint library | Knowledge > Add > SharePoint |
| Publish | N/A | Test > Publish |

### Power Automate Connections (Partially Manual)

| Task | Notes |
|------|-------|
| Update Dataverse connection | After flow import, update connection reference |
| Update SharePoint connection | If flows use SharePoint |
| Enable flows | Verify each flow is enabled |

### Azure (If Available)

| Task | Script |
|------|--------|
| Deploy Functions | deploy-azure-functions.ps1 |
| Configure App Settings | Manual or script |

---

## DEPLOYMENT ORDER

```
PHASE 1: INFRASTRUCTURE (VS Code + Scripts)
├── 1.1 Create Dataverse tables (pac solution import)
├── 1.2 Import seed data (pac data import)
├── 1.3 Deploy Power Automate flows (pac flow create)
└── 1.4 Upload KB to SharePoint (PnP-PowerShell)

PHASE 2: COPILOT STUDIO (Manual)
├── 2.1 Create/open agent
├── 2.2 Paste instructions
├── 2.3 Connect SharePoint KB
├── 2.4 Create topics
├── 2.5 Connect flows to topics
└── 2.6 Test in preview

PHASE 3: VALIDATION (Manual + Automated)
├── 3.1 Run smoke tests
├── 3.2 Verify KB retrieval
├── 3.3 Verify flow execution
├── 3.4 Check response quality
└── 3.5 Review citations

PHASE 4: GO-LIVE (Manual)
├── 4.1 Publish agent
├── 4.2 Enable channels (Teams, Web)
├── 4.3 Notify stakeholders
└── 4.4 Monitor initial usage
```

---

## VALIDATION TESTS

### Test 1: KB Retrieval
```
Input: "What CPM should I expect for CTV advertising?"
Expected: Response cites MPA_Expert_Lens_Channel_Mix_v5_5 or similar KB file
Pass Criteria: Citation present, range provided, acronym defined
```

### Test 2: Self-Critique Working
```
Input: "Tell me about display"
Expected: Response defines "display advertising", cites source, asks ONE follow-up
Pass Criteria: No multiple questions, source cited, term explained
```

### Test 3: Fallback Graceful
```
Input: "What's the CPM for advertising on Mars?"
Expected: Agent acknowledges no KB data, uses fallback carefully
Pass Criteria: Honest about limitations, no hallucinated data
```

### Test 4: Flow Execution (If Connected)
```
Input: "Start a new media plan"
Expected: Flow triggers, session ID returned
Pass Criteria: Session created in Dataverse
```

### Test 5: Adaptive Output
```
Input: "Generate my plan document"
Expected (with Azure): Download link
Expected (without Azure): Formatted copyable text
Pass Criteria: Appropriate output for environment
```

---

## ENVIRONMENT DETECTION

The unified instructions work in any environment:

| Environment | Dataverse | Flows | Azure | KB | Behavior |
|-------------|-----------|-------|-------|-----|----------|
| Full | ✅ | ✅ | ✅ | ✅ | All features |
| Standard | ✅ | ✅ | ❌ | ✅ | No doc generation |
| Basic | ✅ | ❌ | ❌ | ✅ | No persistence |
| Minimal | ❌ | ❌ | ❌ | ✅ | KB + fallback only |
| Emergency | ❌ | ❌ | ❌ | ❌ | Embedded data only |

**No instruction changes needed between environments.**

---

## FILES TO COPY TO MASTERCARD SHAREPOINT

### KB Files (76 total)
```
/release/v5.5/agents/mpa/base/kb/*.txt → AgentKnowledgeBase/MPA/
/release/v5.5/agents/ca/base/kb/*.txt → AgentKnowledgeBase/CA/
/release/v5.5/agents/eap/base/kb/*.txt → AgentKnowledgeBase/EAP/
```

### Seed Data (for reference, imported to Dataverse)
```
/release/v5.5/agents/mpa/base/data/seed/*.csv → Reference only
```

---

## POST-DEPLOYMENT MONITORING

### Day 1
- [ ] Review conversation logs for errors
- [ ] Check Dataverse for session records
- [ ] Verify KB usage tracking (if enabled)
- [ ] Monitor response times

### Week 1
- [ ] Analyze feedback patterns
- [ ] Identify top KB files used
- [ ] Note any gaps in KB coverage
- [ ] Collect user feedback

### Month 1
- [ ] Review success patterns
- [ ] Update KB based on gaps
- [ ] Tune Copilot settings if needed
- [ ] Performance optimization

---

## QUICK REFERENCE

### VS Code Prompt (Copy This)
```
Execute Phase 10. Read these files first:
1. /packages/agent-core/PHASE_10_RAG_LEARNING_OPTIMIZATION.md
2. /packages/agent-core/VSCODE_PHASE_10_EXECUTION_PROMPT.md
3. /release/v5.5/deployment/mastercard/RAG_OPTIMIZED_UNIFIED_INSTRUCTIONS.md

Execute Part A (Mastercard) then Part B (Personal).
Report each step completion.
```

### Key Character Limits
- Copilot Instructions: 8,000 characters max
- MPA Instructions: ~4,200 characters (OK)
- CA Instructions: ~1,700 characters (OK)
- EAP Instructions: ~900 characters (OK)

### Critical Files
- Instructions: RAG_OPTIMIZED_UNIFIED_INSTRUCTIONS.md
- Deployment: MASTERCARD_FULL_DEPLOYMENT_SPECIFICATION.md
- Topics: Section 7 of deployment spec
- Testing: Section 9 of deployment spec

---

## END OF MASTER CHECKLIST
