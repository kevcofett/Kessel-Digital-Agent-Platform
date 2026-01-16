# SOLUTION EXPORT/IMPORT WORKFLOW
# Build Once in Dev → Export → Import Everywhere

**Created:** 2026-01-12
**Purpose:** Enable automated deployment of fully-configured Copilot Studio agents via pac CLI

---

## OVERVIEW

This document describes the recommended deployment pattern:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT ENVIRONMENT                       │
│  1. Build agent manually in Copilot Studio                          │
│  2. Create topics, connect KB, configure flows                       │
│  3. Test thoroughly                                                  │
│  4. Export as UNMANAGED solution                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          GIT REPOSITORY                              │
│  5. Store solution.zip in /release/v5.5/solutions/                  │
│  6. Version control changes                                          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                              ▼
┌────────────────────────────┐    ┌────────────────────────────┐
│   PERSONAL ENVIRONMENT     │    │   MASTERCARD ENVIRONMENT   │
│  7. pac solution import    │    │  7. pac solution import    │
│  8. Update connections     │    │  8. Update connections     │
│  9. Test & publish         │    │  9. Test & publish         │
└────────────────────────────┘    └────────────────────────────┘
```

---

## WHY THIS APPROACH?

| Approach | Pros | Cons |
|----------|------|------|
| Manual build each time | Full control | Time-consuming, error-prone, inconsistent |
| JSON topic files | Version controlled | Can't import directly to Copilot Studio |
| **Solution export/import** | **Automated, consistent, includes everything** | **Requires initial manual build** |

**Solution export captures EVERYTHING:**
- Agent configuration and instructions
- All topics with trigger phrases and nodes
- Global variables
- Flow connections
- Knowledge source configuration (reference)
- Environment variables
- Connection references

---

## PHASE 1: INITIAL BUILD IN DEV ENVIRONMENT

### Prerequisites
- Power Platform dev environment with Copilot Studio license
- Solution created to contain agent components
- All infrastructure deployed (SharePoint KB, Dataverse tables, flows)

### Step 1.1: Create Solution Container

```
1. Open Power Apps: https://make.powerapps.com
2. Select your DEV environment
3. Go to Solutions → + New solution
4. Fill in:
   - Display name: Kessel Agent Platform
   - Name: KesselAgentPlatform
   - Publisher: Select or create (e.g., KesselDigital)
   - Version: 5.5.0.0
5. Click Create
```

### Step 1.2: Add Environment Variables to Solution

Before building the agent, define environment variables for configuration that differs between environments:

```
In Solution → + Add existing → More → Environment variable

Create these variables:

1. SharePoint Site URL
   - Name: kd_SharePointSiteUrl
   - Type: Text
   - Default: [Your dev SharePoint URL]

2. SharePoint Library
   - Name: kd_SharePointLibrary
   - Type: Text
   - Default: AgentKnowledgeBase

3. Dataverse URL
   - Name: kd_DataverseUrl
   - Type: Text
   - Default: [Your dev Dataverse URL]

4. Azure Function URL (if used)
   - Name: kd_AzureFunctionUrl
   - Type: Text
   - Default: [Your dev function URL]
```

### Step 1.3: Add Connection References to Solution

```
In Solution → + Add existing → More → Connection reference

Create these connection references:

1. Dataverse Connection
   - Name: kd_DataverseConnection
   - Connector: Microsoft Dataverse

2. SharePoint Connection
   - Name: kd_SharePointConnection
   - Connector: SharePoint

3. HTTP Connection (if needed)
   - Name: kd_HTTPConnection
   - Connector: HTTP with Azure AD
```

### Step 1.4: Build Agent in Solution Context

```
1. In Solution → + New → Agent → Copilot
2. Name: Media Planning Agent (or Consulting Agent)
3. Build the agent following COPILOT_STUDIO_MANUAL_STEPS.md
4. IMPORTANT: When connecting flows, use the connection references created above
```

### Step 1.5: Verify All Components in Solution

After building, verify solution contains:
```
- 1 Agent (Copilot)
- 7 Topics (MPA) or 8 Topics (CA)
- 4-5 Cloud Flows
- 3-4 Connection References
- 4+ Environment Variables
- Global Variables (included with agent)
```

---

## PHASE 2: EXPORT SOLUTION

### Step 2.1: Publish All Customizations

```
1. In Solution, click "Publish all customizations"
2. Wait for completion
3. Verify no errors
```

### Step 2.2: Export as Unmanaged (for continued development)

```
1. In Solution, click "Export"
2. Select "As unmanaged"
3. Version: 5.5.0.0 (or increment)
4. Click Export
5. Download the .zip file
6. Save to: /release/v5.5/solutions/KesselAgentPlatform_5_5_0_0.zip
```

### Step 2.3: Export as Managed (for production)

```
1. In Solution, click "Export"
2. Select "As managed"
3. Version: 5.5.0.0
4. Click Export
5. Download the .zip file
6. Save to: /release/v5.5/solutions/KesselAgentPlatform_5_5_0_0_managed.zip
```

### Step 2.4: Commit to Repository

```bash
cd /path/to/Kessel-Digital-Agent-Platform
git add release/v5.5/solutions/
git commit -m "Export agent solution v5.5.0 from dev environment"
git push
```

---

## PHASE 3: IMPORT TO TARGET ENVIRONMENT

### Step 3.1: Prepare Environment Variables

Before import, prepare environment-specific values:

**For Personal Environment:**
```
kd_SharePointSiteUrl = https://[personal-tenant].sharepoint.com/sites/AgentKnowledgeBase
kd_SharePointLibrary = AgentKnowledgeBase
kd_DataverseUrl = https://[personal-org].crm.dynamics.com
```

**For Mastercard Environment:**
```
kd_SharePointSiteUrl = https://mastercard.sharepoint.com/sites/CAEConsultingProduct
kd_SharePointLibrary = Shared Documents
kd_DataverseUrl = https://[mc-org].crm.dynamics.com
```

### Step 3.2: Import Using pac CLI

```powershell
# Authenticate to target environment
pac auth create --environment "https://[target-org].crm.dynamics.com"

# Import unmanaged (for dev/test environments)
pac solution import `
    --path "./release/v5.5/solutions/KesselAgentPlatform_5_5_0_0.zip" `
    --activate-plugins `
    --force-overwrite `
    --async

# OR Import managed (for production environments)
pac solution import `
    --path "./release/v5.5/solutions/KesselAgentPlatform_5_5_0_0_managed.zip" `
    --activate-plugins `
    --async
```

### Step 3.3: Update Environment Variables

After import, update environment variables for the target environment:

```powershell
# Using pac CLI
pac env variable set --name "kd_SharePointSiteUrl" --value "https://[target].sharepoint.com/sites/AgentKnowledgeBase"
pac env variable set --name "kd_SharePointLibrary" --value "AgentKnowledgeBase"
pac env variable set --name "kd_DataverseUrl" --value "https://[target].crm.dynamics.com"
```

Or manually in Power Apps:
```
1. Go to Solutions → Kessel Agent Platform → Environment Variables
2. Click on each variable
3. Update "Current Value" for this environment
4. Save
```

### Step 3.4: Update Connection References

```
1. Go to Solutions → Kessel Agent Platform → Connection References
2. For each connection reference:
   a. Click to open
   b. Click "New connection" or select existing
   c. Authenticate if prompted
   d. Save
```

### Step 3.5: Enable Flows

```
1. Go to Power Automate
2. Find imported flows
3. For each flow:
   a. Open flow
   b. Verify connections are valid (no red warnings)
   c. Turn on
```

### Step 3.6: Publish Agent in Copilot Studio

```
1. Open Copilot Studio
2. Find imported agent
3. Verify configuration looks correct
4. Click "Publish"
```

---

## PHASE 4: VALIDATION

### Test Checklist

| Test | Command/Action | Expected Result |
|------|---------------|-----------------|
| Agent responds | Say "Hello" | Greeting message |
| KB connected | Ask "What's a typical CPM?" | Response with citation |
| Flow works | Say "Start planning" | Session created, question asked |
| Variables work | Complete a planning session | Data saved to Dataverse |

### Automated Validation

```powershell
./release/v5.5/deployment/mastercard/scripts/test-integration.ps1 -Environment "[target]"
```

---

## UPDATING THE SOLUTION

When changes are needed:

### Option A: Update in Dev, Re-export

```
1. Make changes in DEV environment solution
2. Increment version (5.5.0.0 → 5.5.1.0)
3. Publish all customizations
4. Export (unmanaged and/or managed)
5. Commit to repo
6. Import to target environments (upgrade)
```

### Option B: Direct Updates (Unmanaged only)

For unmanaged solutions, you can make direct edits:
```
1. Open solution in target environment
2. Make changes
3. Publish
```

Note: Direct changes are lost if you re-import from repo. Document all direct changes.

---

## SOLUTION FILE STRUCTURE

After export, the solution.zip contains:

```
KesselAgentPlatform_5_5_0_0.zip
├── [Content_Types].xml
├── customizations.xml           ← Main configuration
├── solution.xml                 ← Solution metadata
├── Agents/
│   └── MediaPlanningAgent/
│       ├── agent.json           ← Agent configuration
│       └── Topics/
│           ├── Greeting.json
│           ├── StartPlanning.json
│           └── ...
├── Workflows/                   ← Power Automate flows
│   ├── MPA_InitializeSession.json
│   └── ...
├── EnvironmentVariables/
│   ├── kd_SharePointSiteUrl.json
│   └── ...
└── ConnectionReferences/
    ├── kd_DataverseConnection.json
    └── ...
```

---

## TROUBLESHOOTING

### Import fails with dependency error

```
Error: Missing dependency on connector
Solution: Ensure target environment has required connectors enabled
```

### Flows not working after import

```
Issue: Connection references not mapped
Solution: Go to each connection reference and select/create connection
```

### Agent not visible in Copilot Studio

```
Issue: Agent not published after import
Solution: Open agent in Copilot Studio and click Publish
```

### Environment variables empty

```
Issue: Current values not set for target environment
Solution: Set current values in Power Apps → Solutions → Environment Variables
```

---

## RECOMMENDED FOLDER STRUCTURE

```
release/v5.5/
├── solutions/
│   ├── KesselAgentPlatform_5_5_0_0.zip           ← Unmanaged (dev)
│   ├── KesselAgentPlatform_5_5_0_0_managed.zip   ← Managed (prod)
│   ├── MPA_Only_5_5_0_0.zip                      ← MPA agent only
│   ├── CA_Only_5_5_0_0.zip                       ← CA agent only
│   └── README.md                                  ← Solution changelog
├── deployment/
│   └── mastercard/scripts/
│       └── import-solution.ps1                    ← Import script
```

---

## NEXT STEPS

1. [ ] Build MPA agent in dev environment following this guide
2. [ ] Export as solution
3. [ ] Store in repository
4. [ ] Test import to personal environment
5. [ ] Test import to Mastercard environment
6. [ ] Document any issues/learnings

---
