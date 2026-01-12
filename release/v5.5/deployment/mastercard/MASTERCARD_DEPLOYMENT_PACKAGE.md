# MASTERCARD DEPLOYMENT PACKAGE
# Complete Inventory for MPA + CA Deployment

**Created:** 2026-01-12
**Version:** 5.5
**Status:** Ready for deployment

---

## EXECUTIVE SUMMARY

This package contains everything needed to deploy the Media Planning Agent (MPA) and Consulting Agent (CA) to the Mastercard environment.

| Agent | Status | KB Files | Tables | Flows | Instructions |
|-------|--------|----------|--------|-------|--------------|
| MPA | Production Ready | 32 | 29+ | 13 | 4,200 chars |
| CA | Migration Complete | 35 | 9 | 8 | 1,700 chars |

---

## DEPLOYMENT ORDER

```
DAY 1: INFRASTRUCTURE
├── SharePoint: Upload KB files (67 total)
├── Dataverse: Import tables (38+ total)
└── Power Automate: Deploy flows (21 total)

DAY 2: COPILOT STUDIO
├── MPA: Paste instructions, create topics, connect KB
├── CA: Paste instructions, create topics, connect KB
└── Test both agents in preview

DAY 3: VALIDATION AND GO-LIVE
├── Run smoke tests
├── Validate KB retrieval
├── Publish agents
└── Enable channels (Teams, Web)
```

---

## FILE LOCATIONS

### MPA Files

| Category | Location | Count |
|----------|----------|-------|
| KB Files | /release/v5.5/agents/mpa/base/kb/ | 32 |
| Instructions | /release/v5.5/agents/mpa/extensions/mastercard/instructions/ | 1 |
| Table Schemas | /release/v5.5/agents/mpa/mastercard/dataverse/ | 3 (Phase 10) |
| Flow Specs | /release/v5.5/agents/mpa/base/flows/specifications/ | 13 |
| Seed Data | /release/v5.5/agents/mpa/base/data/seed/ | 4 |
| Topic Definitions | Section 7 of MASTERCARD_FULL_DEPLOYMENT_SPECIFICATION.md | 7 |

### CA Files

| Category | Location | Count |
|----------|----------|-------|
| KB Files | /release/v5.5/agents/ca/base/kb/ | 35 |
| Instructions | /release/v5.5/agents/ca/extensions/mastercard/instructions/ | 1 |
| Table Schemas | /release/v5.5/agents/ca/base/schema/tables/ | 9 |
| Flow Specs | /release/v5.5/agents/ca/base/schema/flows/ | 8 |
| Seed Data | /release/v5.5/agents/ca/base/seed_data/ | TBD |
| Topic Definitions | /release/v5.5/agents/ca/base/copilot/CA_TOPIC_DEFINITIONS.md | 8 |

### Deployment Scripts

| Script | Purpose | Location |
|--------|---------|----------|
| deploy-all.ps1 | Master deployment | /release/v5.5/deployment/mastercard/scripts/ |
| deploy-dataverse.ps1 | Tables only | /release/v5.5/deployment/mastercard/scripts/ |
| deploy-sharepoint.ps1 | KB files only | /release/v5.5/deployment/mastercard/scripts/ |
| deploy-learning-tables.ps1 | Phase 10 tables | /release/v5.5/deployment/mastercard/scripts/ |
| deploy-learning-flows.ps1 | Phase 10 flows | /release/v5.5/deployment/mastercard/scripts/ |
| deploy-ca.ps1 | CA deployment | /release/v5.5/deployment/mastercard/scripts/ |
| validate-environment.ps1 | Pre-deployment check | /release/v5.5/deployment/mastercard/scripts/ |

### Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| MASTERCARD_FULL_DEPLOYMENT_SPECIFICATION.md | Complete MPA deployment guide | /release/v5.5/deployment/mastercard/ |
| CA_DEPLOYMENT_CHECKLIST.md | CA-specific checklist | /release/v5.5/deployment/mastercard/ |
| RAG_OPTIMIZED_UNIFIED_INSTRUCTIONS.md | Instruction source | /release/v5.5/deployment/mastercard/ |
| DEPLOYMENT_MASTER_CHECKLIST.md | Overall checklist | /release/v5.5/deployment/mastercard/ |
| COPILOT_STUDIO_STANDALONE_MODE.md | Fallback mode guide | /release/v5.5/deployment/mastercard/ |

---

## SHAREPOINT FOLDER STRUCTURE

```
AgentKnowledgeBase/
├── MPA/
│   ├── Core/           ← Operating standards, instructions
│   ├── Benchmarks/     ← Performance data, KPIs
│   ├── Channels/       ← Channel guidance
│   ├── Expert/         ← Expert lens files
│   ├── Implications/   ← Tradeoff analysis
│   └── Reference/      ← Glossary, frameworks
│
├── CA/
│   ├── Core/           ← Analysis rules, confidence
│   ├── Frameworks/     ← Framework methodology files
│   ├── Industry/       ← Vertical expertise
│   ├── Reference/      ← DSP, RMN, MarTech guides
│   ├── Behavioral/     ← Research routing, service availability
│   └── Registry/       ← Benchmark inventories, URLs
│
└── EAP/                ← Platform-level files (if needed)
```

---

## COPILOT STUDIO CONFIGURATION

### MPA Agent Settings
- Name: Media Planning Agent
- Description: AI-powered media planning assistant with industry benchmarks
- Instructions: MPA_Instructions_RAG_PRODUCTION.txt (4,200 chars)
- Topics: 7 (Greeting, Start Planning, Search Benchmarks, Generate Document, Provide Feedback, Search Channels, Fallback)

### CA Agent Settings
- Name: Consulting Agent
- Description: Strategic consulting assistant with 32 frameworks
- Instructions: CA_Instructions_RAG_PRODUCTION.txt (1,700 chars)
- Topics: 8 (Greeting, Start Analysis, Select Framework, Apply Framework, Generate Report, Benchmark Query, Provide Feedback, Fallback)

### Knowledge Source Settings (Both Agents)
- Source: SharePoint
- Library: AgentKnowledgeBase
- Max chunks: 5
- Min confidence: 0.65
- Citations: Enabled

---

## VALIDATION TESTS

### MPA Tests

| Test | Input | Expected |
|------|-------|----------|
| KB Retrieval | "What's a typical CPM for CTV?" | Citation from KB, range provided |
| Planning Flow | "Start a new media plan" | Session initiated, step guidance |
| Benchmark | "Display advertising CTR" | KB citation with CTR ranges |
| Document | "Generate my plan" | Formatted output or download link |

### CA Tests

| Test | Input | Expected |
|------|-------|----------|
| Framework | "Which framework for competitive analysis?" | Porter's or SWOT suggested with KB citation |
| Analysis | "Start a SWOT analysis" | Structured S/W/O/T sections |
| Benchmark | "Industry KPIs for retail" | KB citation with metrics |
| Depth | "Deep dive analysis" | Comprehensive depth selected |

---

## ROLLBACK PLAN

If issues occur after deployment:

1. **Disable agent** in Copilot Studio (don't delete)
2. **Review logs** for errors
3. **Identify issue** (KB? Flow? Instructions?)
4. **Fix in staging** environment
5. **Re-enable** after validation

Both agents are independent - one can be rolled back without affecting the other.

---

## CONTACTS AND ESCALATION

| Issue Type | First Contact | Escalation |
|------------|---------------|------------|
| SharePoint/KB | Mastercard IT | Kessel Digital |
| Copilot Studio | Kessel Digital | Microsoft Support |
| Power Automate | Mastercard IT | Kessel Digital |
| Dataverse | Mastercard IT | Microsoft Support |
| Content/Logic | Kessel Digital | - |

---

## POST-DEPLOYMENT MONITORING

### Day 1 Metrics
- Conversation count
- Error rate
- KB hit rate
- Average response time

### Week 1 Review
- Top queries
- KB gaps identified
- User feedback themes
- Framework usage (CA)

### Month 1 Optimization
- Update KB based on gaps
- Tune confidence thresholds
- Add missing benchmarks
- Refine topic triggers

---

## QUICK REFERENCE

### Character Limits
- Copilot Instructions: 8,000 max
- MPA Instructions: 4,200 (OK)
- CA Instructions: 1,700 (OK)

### File Limits (SharePoint)
- Size: 7MB per file
- Pages: 20 per file
- Words: 15K per file

### Key Files to Copy
1. MPA_Instructions_RAG_PRODUCTION.txt → Copilot Studio
2. CA_Instructions_RAG_PRODUCTION.txt → Copilot Studio
3. All *.txt from /agents/mpa/base/kb/ → SharePoint
4. All *.txt from /agents/ca/base/kb/ → SharePoint

---

## PACKAGE COMPLETE

This document serves as the single reference for Mastercard deployment. All files referenced above are in the repository at the specified locations.

**Repository:** https://github.com/kevcofett/Kessel-Digital-Agent-Platform
**Branch:** deploy/mastercard

---
