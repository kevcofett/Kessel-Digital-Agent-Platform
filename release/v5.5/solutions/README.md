# Power Platform Solutions

This folder contains exported Power Platform solutions for the Kessel Digital Agent Platform.

---

## IMPORTANT: Solutions Must Be Built Before They Can Be Stored Here

**Current Status:** EMPTY - Awaiting initial manual build

Solutions are created by:
1. Building an agent manually in Copilot Studio (dev environment)
2. Exporting the solution from Power Apps
3. Committing the .zip file to this folder

---

## Expected Files After Initial Build

```
solutions/
├── README.md                                          ← This file
├── CHANGELOG.md                                       ← Version history
├── MPA/
│   ├── KesselMPA_1_0_0_0.zip                         ← Unmanaged (dev/test)
│   ├── KesselMPA_1_0_0_0_managed.zip                 ← Managed (production)
│   └── release-notes.md                              ← What's in this version
├── CA/
│   ├── KesselCA_1_0_0_0.zip
│   ├── KesselCA_1_0_0_0_managed.zip
│   └── release-notes.md
└── Combined/
    ├── KesselAgentPlatform_5_5_0_0.zip               ← All agents in one solution
    ├── KesselAgentPlatform_5_5_0_0_managed.zip
    └── release-notes.md
```

---

## Solution Naming Convention

```
[Publisher][AgentName]_[Major]_[Minor]_[Build]_[Revision].zip

Examples:
- KesselMPA_1_0_0_0.zip           (MPA v1.0.0.0 unmanaged)
- KesselMPA_1_0_0_0_managed.zip   (MPA v1.0.0.0 managed)
- KesselCA_1_0_0_0.zip            (CA v1.0.0.0 unmanaged)
- KesselAgentPlatform_5_5_0_0.zip (Combined v5.5.0.0)
```

---

## Managed vs Unmanaged

| Type | Use Case | Can Edit After Import? |
|------|----------|----------------------|
| **Unmanaged** | Development, testing | Yes |
| **Managed** | Production | No (locked) |

**Recommendation:**
- Use **unmanaged** for Personal environment (dev/test)
- Use **managed** for Mastercard environment (production)

---

## How to Export a Solution

### From Power Apps (make.powerapps.com)

1. Select your DEV environment
2. Go to **Solutions**
3. Find your solution (e.g., "Kessel MPA")
4. Click **Export**
5. Choose version number (increment from last)
6. Select **Unmanaged** or **Managed**
7. Click **Export**
8. Download the .zip file
9. Move to this folder
10. Commit to git

### Using pac CLI

```powershell
# Export unmanaged
pac solution export --name "KesselMPA" --path "./KesselMPA_1_0_0_0.zip"

# Export managed
pac solution export --name "KesselMPA" --path "./KesselMPA_1_0_0_0_managed.zip" --managed
```

---

## How to Import a Solution

See: `/release/v5.5/deployment/SOLUTION_EXPORT_IMPORT_WORKFLOW.md`

Quick command:
```powershell
./release/v5.5/deployment/mastercard/scripts/import-solution.ps1 `
    -SolutionPath "./release/v5.5/solutions/MPA/KesselMPA_1_0_0_0.zip" `
    -Environment "personal"
```

---

## Solution Contents Checklist

Each solution should contain:

### MPA Solution
- [ ] Agent: Media Planning Agent
- [ ] Topics (7): Greeting, StartPlanning, SearchBenchmarks, SearchChannels, GenerateDocument, ProvideFeedback, Fallback
- [ ] Global Variables (6): SessionID, Objective, Budget, Channels, CurrentStep, Vertical
- [ ] Flows (4): InitializeSession, SearchBenchmarks, GenerateDocument, CaptureFeedback
- [ ] Connection References (3): Dataverse, SharePoint, HTTP
- [ ] Environment Variables (4): SharePointSiteUrl, SharePointLibrary, DataverseUrl, AzureFunctionUrl

### CA Solution
- [ ] Agent: Consulting Agent
- [ ] Topics (8): Greeting, StartAnalysis, SelectFramework, ApplyFramework, GenerateReport, BenchmarkQuery, ProvideFeedback, Fallback
- [ ] Global Variables (6): SessionID, AnalysisType, SelectedFramework, AnalysisDepth, Industry, AnalysisComplete
- [ ] Flows (5): InitializeSession, SelectFramework, ApplyFramework, GenerateDocument, CaptureFeedback
- [ ] Connection References (3): Dataverse, SharePoint, HTTP
- [ ] Environment Variables (4): SharePointSiteUrl, SharePointLibrary, DataverseUrl, AzureFunctionUrl

---

## Next Steps

1. Complete manual build using: `/release/v5.5/deployment/MANUAL_BUILD_CHECKLIST.md`
2. Export solutions to this folder
3. Test import to Personal environment
4. Test import to Mastercard environment
5. Document any issues in CHANGELOG.md

---

## Related Documentation

- [Manual Build Checklist](../deployment/MANUAL_BUILD_CHECKLIST.md)
- [Solution Export/Import Workflow](../deployment/SOLUTION_EXPORT_IMPORT_WORKFLOW.md)
- [Copilot Studio Manual Steps](../deployment/COPILOT_STUDIO_MANUAL_STEPS.md)
- [Import Script](../deployment/mastercard/scripts/import-solution.ps1)
