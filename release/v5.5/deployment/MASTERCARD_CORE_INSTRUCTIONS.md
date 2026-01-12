# MASTERCARD DEPLOYMENT - CORE INSTRUCTIONS
# Kessel Digital Agent Platform v5.5

---

## QUICK REFERENCE

| Component | Automated | Manual Required |
|-----------|-----------|-----------------|
| SharePoint KB | ✅ Script | - |
| Dataverse | ✅ Script | - |
| Seed Data | ✅ Script | - |
| Power Automate Flows | ⚠️ Script | Update connections |
| Copilot Studio Agent | ❌ | Full manual build |
| Solution Import | ✅ Script | After initial build |

### KEY URLS - MASTERCARD ENVIRONMENT

| Service | URL |
|---------|-----|
| SharePoint Site | https://mastercard.sharepoint.com/sites/CAEConsultingProduct |
| SharePoint Library | Shared Documents |
| Power Apps | https://make.powerapps.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818/home |
| Power Automate | https://make.powerautomate.com/environments/Default-f06fa858-824b-4a85-aacv-f372cfdc282e/home |
| Copilot Studio | https://copilotstudio.microsoft.com (select Mastercard environment) |

### Agent KB Folder URLs
| Agent | Folder URL |
|-------|------------|
| MPA | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgCZ7qTFJCgASKcb204jJRn0AfB5alCc74AMyE2etdchqA4?e=urKrHq |
| CA | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/IgDzc0ufDknYTpTghwRGqCXGAUvoLc-7BLhVv8c7TrZEPAI?e=JrfOGP |
| EAP | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgAMlDUM-pK9Rqol_B77NT8JAWaSvFONRHLabpRleGIwxko?e=24fqOR |

---

## PHASE 1: AUTOMATED DEPLOYMENT

### Prerequisites
```powershell
# Install required tools
Install-Module -Name PnP.PowerShell -Force -Scope CurrentUser
# Install pac CLI from: https://aka.ms/PowerAppsCLI

# Authenticate
az login
pac auth create --environment "https://[mastercard-org].crm.dynamics.com"
```

### Run Full Automated Deployment
```powershell
cd /release/v5.5/deployment/mastercard/scripts

# Validate environment first
./validate-environment.ps1 -Environment "mastercard"

# Deploy everything automated
./deploy-all.ps1 -Environment "mastercard" -Agent "all"
```

### Or Run Individual Scripts
```powershell
# 1. SharePoint KB (32 MPA files, 35 CA files)
./deploy-sharepoint.ps1 -SourcePath "../../agents/mpa/base/kb" -TargetFolder "MPA" -Environment "mastercard"
./deploy-sharepoint.ps1 -SourcePath "../../agents/ca/base/kb" -TargetFolder "CA" -Environment "mastercard"

# 2. Dataverse tables
./deploy-dataverse.ps1 -SolutionPath "../../agents/mpa/base/dataverse" -Environment "mastercard"

# 3. Seed data
./import-seed-data.ps1 -DataPath "../../agents/mpa/base/data/seed" -Environment "mastercard"

# 4. Flows
./deploy-flows.ps1 -FlowsPath "../../agents/mpa/base/flows/specifications" -Environment "mastercard"
```

---

## PHASE 2: POWER AUTOMATE MANUAL STEPS

**URL:** https://make.powerautomate.com/environments/Default-f06fa858-824b-4a85-aacv-f372cfdc282e/home

1. Select Mastercard environment
2. Go to My Flows (or find in Solution)
3. For each imported flow:
   - Open flow
   - Click "Edit"
   - Fix connection warnings (red icons)
   - Select/create Dataverse connection
   - Select/create SharePoint connection
   - Save
   - Turn On

### Required Flows - MPA
- MPA_InitializeSession
- MPA_SearchBenchmarks
- MPA_GenerateDocument
- MPA_CaptureFeedback

### Required Flows - CA
- CA_InitializeSession
- CA_SelectFramework
- CA_ApplyFramework
- CA_GenerateDocument
- CA_CaptureFeedback

---

## PHASE 3: COPILOT STUDIO - MPA AGENT

**URL:** https://copilotstudio.microsoft.com

### 3.1 Create Agent
1. Select Mastercard environment
2. Agents → + New agent → Skip to configure
3. Name: `Media Planning Agent`
4. Create

### 3.2 Paste Instructions
1. Settings → Agent → Instructions
2. Paste content from: `/agents/mpa/extensions/mastercard/instructions/MPA_Instructions_RAG_PRODUCTION.txt`
3. Verify < 8,000 characters
4. Save

### 3.3 Connect Knowledge Base
1. Knowledge → + Add knowledge → SharePoint
2. Site: `https://mastercard.sharepoint.com/sites/CAEConsultingProduct`
3. Library: `Shared Documents`
4. Folder: `MPA`
5. Add → Wait for indexing

### 3.4 Create Global Variables
Settings → Variables → + New variable

| Name | Type |
|------|------|
| Global.SessionID | String |
| Global.Objective | String |
| Global.Budget | String |
| Global.Channels | String |
| Global.CurrentStep | String |
| Global.Vertical | String |

### 3.5 Create Topics

**Topic 1: Greeting**
- Triggers: hello, hi, hey, start, help, what can you do
- Message: Welcome message with capabilities list

**Topic 2: Start Planning**
- Triggers: start planning, new plan, create plan, begin planning
- Question: Campaign objective (multiple choice)
- Save to: Global.Objective
- Flow: MPA_InitializeSession
- Message: Next step prompt

**Topic 3: Search Benchmarks**
- Triggers: benchmark, CPM, CTR, industry average
- Generative Answers: SharePoint source
- Fallback: Default benchmark ranges

**Topic 4: Search Channels**
- Triggers: channel, CTV, display, paid social, paid search
- Generative Answers: SharePoint source
- Fallback: Channel overview

**Topic 5: Generate Document**
- Triggers: generate document, download plan, export
- Condition: Check Global.Objective exists
- Flow: MPA_GenerateDocument
- Message: Document link or text summary

**Topic 6: Provide Feedback**
- Triggers: feedback, thanks, helpful
- Question: Rating (multiple choice)
- Flow: MPA_CaptureFeedback

**Topic 7: Fallback (System)**
- Edit existing Fallback topic
- Generative Answers: SharePoint source
- Fallback: Help menu

### 3.6 Test Agent
- Click Test (bottom right)
- Test: "Hello" → Greeting
- Test: "What's a typical CPM?" → KB response with citation
- Test: "Start planning" → Objective question

### 3.7 Publish
- Click Publish (top right)
- Wait for completion
- Verify "Published" indicator

---

## PHASE 4: COPILOT STUDIO - CA AGENT

### 4.1 Create Agent
- Name: `Consulting Agent`

### 4.2 Paste Instructions
- From: `/agents/ca/extensions/mastercard/instructions/CA_Instructions_RAG_PRODUCTION.txt`

### 4.3 Connect Knowledge Base
- Folder: `CA`

### 4.4 Create Global Variables

| Name | Type |
|------|------|
| Global.SessionID | String |
| Global.AnalysisType | String |
| Global.SelectedFramework | String |
| Global.AnalysisDepth | String |
| Global.Industry | String |
| Global.AnalysisComplete | Boolean |

### 4.5 Create Topics

**Topic 1: Greeting**
**Topic 2: Start Analysis**
**Topic 3: Select Framework**
**Topic 4: Apply Framework**
**Topic 5: Generate Report**
**Topic 6: Benchmark Query**
**Topic 7: Provide Feedback**
**Topic 8: Fallback (System)**

### 4.6 Test & Publish
- Same process as MPA

---

## PHASE 5: EXPORT SOLUTION (for future deployments)

**Power Apps URL:** https://make.powerapps.com/environments/ea9d500a-9299-e7b2-8754-53ebea0cb818/home

After successful build:

1. Power Apps → Solutions
2. Create solution containing agent
3. Publish all customizations
4. Export → Managed
5. Save .zip to: `/release/v5.5/solutions/`
6. Commit to repo

Future deployments use:
```powershell
./import-solution.ps1 -SolutionPath "./solutions/KesselMPA_1_0_0_0_managed.zip" -Environment "mastercard" -Managed
```

---

## VERIFICATION CHECKLIST

### Automated Components
- [ ] SharePoint: 32 MPA files visible
- [ ] SharePoint: 35 CA files visible
- [ ] Dataverse: Tables created
- [ ] Seed data: Records imported
- [ ] Flows: All flows visible in Power Automate

### Manual Components
- [ ] Flows: All connections configured
- [ ] Flows: All flows turned ON
- [ ] MPA Agent: Instructions pasted
- [ ] MPA Agent: KB connected (shows file count)
- [ ] MPA Agent: 7 topics created
- [ ] MPA Agent: Published
- [ ] CA Agent: Instructions pasted
- [ ] CA Agent: KB connected
- [ ] CA Agent: 8 topics created
- [ ] CA Agent: Published

### Functional Tests
- [ ] MPA: "Hello" → Greeting response
- [ ] MPA: "What's a typical CPM for CTV?" → Citation from KB
- [ ] MPA: "Start planning" → Objective question
- [ ] CA: "Hello" → Greeting response
- [ ] CA: "Tell me about SWOT analysis" → Framework info from KB
- [ ] CA: "Start analysis" → Analysis type question

---

## TROUBLESHOOTING

### KB shows 0 files
- Wait 5-10 minutes for indexing
- Verify SharePoint folder path
- Check permissions

### Flow connection error
- Re-authenticate connection
- Verify connection reference mapped
- Check flow is enabled

### Topic not triggering
- Verify trigger phrases saved
- Check for conflicts
- Test with exact phrase

### Agent not responding
- Verify published
- Check KB connected
- Review test panel errors

---

## KEY FILE LOCATIONS

```
/release/v5.5/
├── agents/
│   ├── mpa/
│   │   ├── base/kb/                    ← 32 KB files
│   │   ├── base/copilot/topics/        ← Topic JSON reference
│   │   └── extensions/mastercard/instructions/  ← Agent instructions
│   └── ca/
│       ├── base/kb/                    ← 35 KB files
│       ├── base/copilot/topics/        ← Topic JSON reference
│       └── extensions/mastercard/instructions/  ← Agent instructions
├── deployment/
│   ├── mastercard/scripts/             ← All PowerShell scripts
│   ├── COPILOT_STUDIO_MANUAL_STEPS.md  ← Detailed click-by-click
│   └── MANUAL_BUILD_CHECKLIST.md       ← Full checklist with checkboxes
└── solutions/                          ← For exported .zip files
```

---

## SUPPORT

- Detailed instructions: `COPILOT_STUDIO_MANUAL_STEPS.md`
- Full checklist: `MANUAL_BUILD_CHECKLIST.md`
- Solution workflow: `SOLUTION_EXPORT_IMPORT_WORKFLOW.md`

---

**Document Version:** 1.0
**Created:** 2026-01-12
**Environment:** Mastercard Production
