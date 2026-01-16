# Power Platform Solutions

This folder contains exported Power Platform solutions for the Kessel Digital Agent Platform.

---

## QUICK START

### First Time Export (from your dev environment)

```powershell
# 1. Authenticate to your dev environment
pac auth create --environment "https://[your-org].crm.dynamics.com"

# 2. Run export script
cd release/v5.5/deployment/mastercard/scripts
./export-solution.ps1 -Version "5.5.0.0" -ExportManaged
```

**Detailed guide:** [SOLUTION_EXPORT_STEP_BY_STEP.md](../deployment/SOLUTION_EXPORT_STEP_BY_STEP.md)

### Import to Mastercard

```powershell
# 1. Authenticate to Mastercard environment
pac auth create --environment "https://[mastercard-org].crm.dynamics.com"

# 2. Run import script
./import-solution.ps1 -SolutionPath "../../solutions/KesselAgentPlatform_5_5_0_0.zip" -Environment "mastercard"
```

**Detailed guide:** [SOLUTION_EXPORT_IMPORT_WORKFLOW.md](../deployment/SOLUTION_EXPORT_IMPORT_WORKFLOW.md)

---

## CURRENT SOLUTIONS

| Solution | Version | Type | Status |
|----------|---------|------|--------|
| MediaPlanningAgentv52_export.zip | 5.2.0.0 | Unmanaged | Legacy |
| MediaPlanningAgentv52_updated.zip | 5.2.0.0 | Unmanaged | Legacy |
| KesselAgentPlatform_5_5_0_0.zip | 5.5.0.0 | Unmanaged | **PENDING EXPORT** |
| KesselAgentPlatform_5_5_0_0_managed.zip | 5.5.0.0 | Managed | **PENDING EXPORT** |

---

## SOLUTION NAMING CONVENTION

```
[Publisher][AgentName]_[Major]_[Minor]_[Build]_[Revision].zip

Examples:
- KesselAgentPlatform_5_5_0_0.zip           (Combined, unmanaged)
- KesselAgentPlatform_5_5_0_0_managed.zip   (Combined, managed/production)
- KesselMPA_1_0_0_0.zip                     (MPA only, unmanaged)
- KesselCA_1_0_0_0.zip                      (CA only, unmanaged)
```

---

## MANAGED VS UNMANAGED

| Type | Use Case | Can Edit After Import? | Recommended For |
|------|----------|----------------------|-----------------|
| **Unmanaged** | Development, testing | Yes | Personal environment |
| **Managed** | Production | No (locked) | Mastercard environment |

**Best Practice:**
- Export BOTH unmanaged and managed
- Use unmanaged for testing
- Use managed for production (prevents accidental changes)

---

## SOLUTION CONTENTS CHECKLIST

### Combined Solution (KesselAgentPlatform)

| Component | MPA | CA | EAP |
|-----------|-----|----|----|
| Agent (Copilot) | ✓ | ✓ | ✓ |
| Topics | 7 | 8 | 5 |
| Cloud Flows | 4 | 5 | 3 |
| Tables | 5 | 5 | 4 |
| Environment Variables | 4 | 4 | 4 |
| Connection References | 3 | 3 | 3 |

### MPA Solution Contents

- [ ] **Agent:** Media Planning Agent
- [ ] **Topics:** Greeting, StartPlanning, SearchBenchmarks, SearchChannels, GenerateDocument, ProvideFeedback, Fallback
- [ ] **Flows:** InitializeSession, SearchBenchmarks, GenerateDocument, CaptureFeedback
- [ ] **Tables:** mpa_session, mpa_interaction, mpa_plan, mpa_benchmark, mpa_feedback
- [ ] **Environment Variables:** SharePointSiteUrl, SharePointLibrary, DataverseUrl, AzureFunctionUrl
- [ ] **Connection References:** Dataverse, SharePoint, HTTP

### CA Solution Contents

- [ ] **Agent:** Consulting Agent
- [ ] **Topics:** Greeting, StartAnalysis, SelectFramework, ApplyFramework, GenerateReport, BenchmarkQuery, ProvideFeedback, Fallback
- [ ] **Flows:** InitializeSession, SelectFramework, ApplyFramework, GenerateDocument, CaptureFeedback
- [ ] **Tables:** ca_session, ca_analysis, ca_framework, ca_insight, ca_feedback
- [ ] **Environment Variables:** SharePointSiteUrl, SharePointLibrary, DataverseUrl, AzureFunctionUrl
- [ ] **Connection References:** Dataverse, SharePoint, HTTP

---

## FOLDER STRUCTURE

```
solutions/
├── README.md                              ← This file
├── CHANGELOG.md                           ← Version history
├── MPA/
│   └── README.md                          ← MPA-specific notes
├── CA/
│   └── README.md                          ← CA-specific notes
├── MediaPlanningAgentv52_export.zip       ← Legacy v5.2
├── MediaPlanningAgentv52_updated.zip      ← Legacy v5.2
├── MediaPlanningAgentv52_unpacked/        ← Unpacked for inspection
│   ├── Entities/
│   ├── OptionSets/
│   ├── Other/
│   └── Workflows/
├── KesselAgentPlatform_5_5_0_0.zip        ← Current unmanaged (pending)
└── KesselAgentPlatform_5_5_0_0_managed.zip← Current managed (pending)
```

---

## HOW TO EXPORT

### Option 1: Using Export Script (Recommended)

```powershell
cd release/v5.5/deployment/mastercard/scripts

# Export both unmanaged and managed
./export-solution.ps1 -Version "5.5.0.0" -ExportManaged

# Export unmanaged only
./export-solution.ps1 -Version "5.5.0.0"

# Export specific agent only
./export-solution.ps1 -Version "1.0.0.0" -SolutionName "KesselMPA" -Agent "MPA"
```

### Option 2: Using Power Apps UI

1. Go to https://make.powerapps.com
2. Select your dev environment
3. Solutions → Select solution
4. Click **Export**
5. Choose version and type (unmanaged/managed)
6. Download .zip file
7. Save to this folder

### Option 3: Using pac CLI Directly

```powershell
# Authenticate
pac auth create --environment "https://[org].crm.dynamics.com"

# Export unmanaged
pac solution export --name "KesselAgentPlatform" --path "./KesselAgentPlatform_5_5_0_0.zip"

# Export managed
pac solution export --name "KesselAgentPlatform" --path "./KesselAgentPlatform_5_5_0_0_managed.zip" --managed
```

---

## HOW TO IMPORT

### Option 1: Using Import Script (Recommended)

```powershell
cd release/v5.5/deployment/mastercard/scripts

# Import to personal environment
./import-solution.ps1 -SolutionPath "../../solutions/KesselAgentPlatform_5_5_0_0.zip" -Environment "personal"

# Import to Mastercard (managed)
./import-solution.ps1 -SolutionPath "../../solutions/KesselAgentPlatform_5_5_0_0_managed.zip" -Environment "mastercard" -Managed
```

### Option 2: Using pac CLI Directly

```powershell
# Authenticate to target
pac auth create --environment "https://[target].crm.dynamics.com"

# Import
pac solution import --path "./KesselAgentPlatform_5_5_0_0.zip" --activate-plugins --force-overwrite
```

---

## POST-IMPORT STEPS

After importing a solution, you must:

1. **Set Environment Variables**
   - Update SharePoint URL for target environment
   - Update Dataverse URL for target environment

2. **Configure Connection References**
   - Create/select connections for Dataverse, SharePoint
   - Authenticate with appropriate credentials

3. **Enable Flows**
   - Turn on each imported flow
   - Verify no connection errors

4. **Reconnect Knowledge Source**
   - In Copilot Studio, verify/reconnect SharePoint
   - Wait for indexing

5. **Publish Agent**
   - In Copilot Studio, click Publish

**Detailed steps:** [SOLUTION_EXPORT_IMPORT_WORKFLOW.md](../deployment/SOLUTION_EXPORT_IMPORT_WORKFLOW.md)

---

## ENVIRONMENT-SPECIFIC VALUES

### Personal Environment
```
SharePointSiteUrl = https://aragornai.sharepoint.com/sites/AgentKnowledgeBase
SharePointLibrary = AgentKnowledgeBase
```

### Mastercard Environment
```
SharePointSiteUrl = https://mastercard.sharepoint.com/sites/CAEConsultingProduct
SharePointLibrary = Shared Documents
```

**Agent Folder URLs:**
| Agent | Mastercard Folder URL |
|-------|----------------------|
| MPA | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgCZ7qTFJCgASKcb204jJRn0AfB5alCc74AMyE2etdchqA4 |
| CA | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/IgDzc0ufDknYTpTghwRGqCXGAUvoLc-7BLhVv8c7TrZEPAI |
| EAP | https://mastercard.sharepoint.com/:f:/s/CAEConsultingProduct/lgAMlDUM-pK9Rqol_B77NT8JAWaSvFONRHLabpRleGIwxko |

---

## TROUBLESHOOTING

| Issue | Cause | Solution |
|-------|-------|----------|
| Export fails | Dependencies not in solution | Add all dependent components |
| Import fails | Missing connector | Enable connector in admin center |
| Flows not working | Connection refs not configured | Configure each connection reference |
| Agent not visible | Not published | Open in Copilot Studio and publish |
| KB not connected | References not transferred | Reconnect SharePoint in target |

---

## RELATED DOCUMENTATION

| Document | Description |
|----------|-------------|
| [SOLUTION_EXPORT_STEP_BY_STEP.md](../deployment/SOLUTION_EXPORT_STEP_BY_STEP.md) | Complete first-time export guide |
| [SOLUTION_EXPORT_IMPORT_WORKFLOW.md](../deployment/SOLUTION_EXPORT_IMPORT_WORKFLOW.md) | Full workflow documentation |
| [export-solution.ps1](../deployment/mastercard/scripts/export-solution.ps1) | Export automation script |
| [import-solution.ps1](../deployment/mastercard/scripts/import-solution.ps1) | Import automation script |
| [MASTERCARD_CORE_INSTRUCTIONS.md](../deployment/MASTERCARD_CORE_INSTRUCTIONS.md) | Mastercard deployment guide |

---

## VERSION HISTORY

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

---
