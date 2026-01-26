# CA MASTERCARD DEPLOYMENT CHECKLIST
# Consulting Agent - Mastercard Environment

**Created:** 2026-01-12
**Target:** Deploy CA to Mastercard THIS WEEK
**Dependency:** EAP/CA Migration must complete first

---

## PRE-DEPLOYMENT REQUIREMENTS

### Migration Status
- [ ] Phase 1: EAP Migration complete
- [ ] Phase 2: CA Migration complete
- [ ] All 35 CA KB files in /release/v5.5/agents/ca/base/kb/
- [ ] All 9 CA tables migrated
- [ ] All 8 CA flows migrated
- [ ] CA V12 instructions migrated
- [ ] CA RAG-optimized instructions created

### 6-Rule Compliance
- [ ] All CA KB files pass 6-Rule validation
- [ ] FRAMEWORK_Library_Master_v1.txt fixed (long lines split)
- [ ] No markdown tables in any KB file
- [ ] All lists use hyphens (not bullets or numbers)

---

## CA DEPLOYMENT STEPS

### Step 1: SharePoint KB Upload

Upload CA KB files to Mastercard SharePoint:

```
Source: /release/v5.5/agents/ca/base/kb/*.txt (35 files)
Target: AgentKnowledgeBase/CA/
```

Categories:
- FRAMEWORK_* files → AgentKnowledgeBase/CA/Frameworks/
- INDUSTRY_* files → AgentKnowledgeBase/CA/Industry/
- REFERENCE_* files → AgentKnowledgeBase/CA/Reference/
- BEHAVIORAL_* files → AgentKnowledgeBase/CA/Behavioral/
- Other files → AgentKnowledgeBase/CA/Core/

### Step 2: Dataverse Tables

Import CA tables (if not already in solution):

| Table | Purpose |
|-------|---------|
| ca_analysis_session | Track analysis sessions |
| ca_framework_application | Record framework usage |
| ca_client_context | Store client information |
| ca_analysis_output | Save analysis results |
| ca_framework_registry | Available frameworks |
| ca_industry_benchmark | Industry comparisons |
| ca_confidence_score | Confidence tracking |
| ca_data_source | Source attribution |
| ca_recommendation | Generated recommendations |

### Step 3: Power Automate Flows

Deploy CA flows (flow_50 through flow_57):

| Flow | Purpose |
|------|---------|
| flow_50_CA_InitializeSession | Start analysis session |
| flow_51_CA_SelectFramework | Choose framework |
| flow_52_CA_ApplyFramework | Execute framework analysis |
| flow_53_CA_GenerateInsights | Create insights |
| flow_54_CA_SaveAnalysis | Persist analysis |
| flow_55_CA_ExportReport | Generate report |
| flow_56_CA_TrackConfidence | Log confidence |
| flow_57_CA_CaptureFeedback | User feedback |

### Step 4: Copilot Studio Configuration

1. Create new agent or update existing:
   - Name: Consulting Agent (CA)
   - Description: Strategic consulting assistant

2. Paste instructions from:
   - /release/v5.5/agents/ca/extensions/mastercard/instructions/CA_Instructions_RAG_PRODUCTION.txt
   - Verify under 8,000 characters

3. Connect SharePoint KB:
   - Site: Mastercard SharePoint
   - Library: AgentKnowledgeBase
   - Folder: CA/

4. Create topics (same pattern as MPA):
   - Start Analysis
   - Select Framework
   - Apply Framework
   - Generate Report
   - Provide Feedback
   - Fallback

5. Connect flows to topics

6. Test in preview

7. Publish

---

## VALIDATION TESTS

### Test 1: Framework Selection
```
Input: "I need to analyze our competitive position"
Expected: Agent suggests Porter's Five Forces or SWOT
Pass: Framework recommendation with KB citation
```

### Test 2: KB Retrieval
```
Input: "What frameworks are available for market analysis?"
Expected: Lists frameworks from FRAMEWORK_Library_Master_v1.txt
Pass: Citation present, multiple options provided
```

### Test 3: Industry Context
```
Input: "What are typical KPIs for retail companies?"
Expected: Retrieves from INDUSTRY_Vertical_Expertise_v1.txt
Pass: Industry-specific metrics cited
```

### Test 4: Analysis Flow
```
Input: "Start a SWOT analysis for my client"
Expected: Initiates session, guides through SWOT components
Pass: Structured analysis with S/W/O/T sections
```

---

## DIFFERENCES FROM MPA DEPLOYMENT

| Aspect | MPA | CA |
|--------|-----|-----|
| Primary Use | Media planning | Strategic analysis |
| KB Focus | Benchmarks, channels | Frameworks, industry |
| Flow Count | 13 flows | 8 flows |
| Table Count | 29 tables | 9 tables |
| Key Output | Media plan document | Analysis report |

---

## ROLLBACK PLAN

If issues occur:
1. Disable CA agent in Copilot Studio (don't delete)
2. Keep MPA operational (separate agent)
3. Review conversation logs for errors
4. Fix issues in staging
5. Re-enable after validation

---

## POST-DEPLOYMENT

### Day 1
- [ ] Monitor conversation logs
- [ ] Verify KB retrieval working
- [ ] Check flow execution
- [ ] Collect initial feedback

### Week 1
- [ ] Review framework usage patterns
- [ ] Identify KB gaps
- [ ] Tune confidence thresholds
- [ ] Update KB if needed

---

## CONTACTS

- Deployment issues: [Mastercard IT contact]
- Agent configuration: [Kessel Digital contact]
- KB content questions: [Subject matter expert]

---

## FILES REFERENCE

| File | Location |
|------|----------|
| CA KB Files | /release/v5.5/agents/ca/base/kb/ |
| CA Instructions | /release/v5.5/agents/ca/extensions/mastercard/instructions/ |
| CA Tables | /release/v5.5/agents/ca/base/schema/tables/ |
| CA Flows | /release/v5.5/agents/ca/base/schema/flows/ |
| Deployment Scripts | /release/v5.5/deployment/mastercard/scripts/ |

---
