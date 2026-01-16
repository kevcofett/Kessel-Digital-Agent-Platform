# SOLUTION EXPORT STEP-BY-STEP GUIDE
# Export Flows from Personal/Dev Environment for Deployment

**Created:** 2026-01-12
**Purpose:** Document the complete process to export your first solution for multi-environment deployment

---

## OVERVIEW

This guide walks you through exporting a fully-configured Copilot Studio agent (with flows, topics, and configuration) from your personal/development environment so it can be imported to Mastercard and other environments.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    YOUR PERSONAL ENVIRONMENT                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Agent     │  │   Flows     │  │   Tables    │                  │
│  │  (Copilot)  │  │(Automate)   │  │ (Dataverse) │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│         │               │               │                            │
│         └───────────────┴───────────────┘                            │
│                         │                                            │
│                         ▼                                            │
│              ┌─────────────────┐                                     │
│              │    SOLUTION     │                                     │
│              │   (Container)   │                                     │
│              └─────────────────┘                                     │
│                         │                                            │
│                         ▼ EXPORT                                     │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌─────────────────┐
              │  solution.zip   │ ← Stored in Git repository
              └─────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼ IMPORT                        ▼ IMPORT
┌─────────────────┐            ┌─────────────────┐
│    PERSONAL     │            │   MASTERCARD    │
│   (Testing)     │            │  (Production)   │
└─────────────────┘            └─────────────────┘
```

---

## PREREQUISITES

### Required Access
- [ ] Power Platform license with Copilot Studio
- [ ] Admin access to personal/dev environment
- [ ] Power Platform CLI (pac) installed
- [ ] Git repository access

### Required Components Already Built
- [ ] Copilot Studio agent created and working
- [ ] All topics configured with trigger phrases
- [ ] Power Automate flows created and tested
- [ ] Dataverse tables deployed
- [ ] SharePoint knowledge base connected

---

## PHASE 1: PREPARE YOUR SOLUTION

### Step 1.1: Open Power Apps Maker Portal

1. Navigate to: https://make.powerapps.com
2. Select your PERSONAL/DEV environment from the environment picker (top right)
3. Go to **Solutions** in the left navigation

### Step 1.2: Create or Verify Solution Container

If you don't already have a solution containing your agent:

1. Click **+ New solution**
2. Fill in:
   - **Display name:** Kessel Agent Platform
   - **Name:** KesselAgentPlatform
   - **Publisher:** Select existing or create new
     - Publisher prefix: `kd` (for Kessel Digital)
   - **Version:** 5.5.0.0
3. Click **Create**

### Step 1.3: Add Existing Components to Solution

If your agent and flows are not already in a solution, add them:

**Add Agent:**
1. In Solution → Click **Add existing** → **Chatbot** → **Copilot (preview)**
2. Select your agent (Media Planning Agent)
3. Click **Add**

**Add Flows:**
1. Click **Add existing** → **Automation** → **Cloud flow**
2. Select all agent flows:
   - MPA_InitializeSession
   - MPA_SearchBenchmarks
   - MPA_GenerateDocument
   - MPA_CaptureFeedback
3. Click **Add**

**Add Tables (if not already included):**
1. Click **Add existing** → **Table**
2. Select agent tables:
   - mpa_session
   - mpa_interaction
   - mpa_benchmark (etc.)
3. Click **Add**

### Step 1.4: Add Environment Variables

Environment variables allow the same solution to work in different environments:

1. In Solution → Click **+ New** → **More** → **Environment variable**
2. Create these variables:

| Name | Display Name | Type | Default Value |
|------|--------------|------|---------------|
| kd_SharePointSiteUrl | SharePoint Site URL | Text | (your dev SharePoint URL) |
| kd_SharePointLibrary | SharePoint Library | Text | AgentKnowledgeBase |
| kd_DataverseUrl | Dataverse URL | Text | (your dev Dataverse URL) |
| kd_AzureFunctionUrl | Azure Function URL | Text | (optional) |

### Step 1.5: Add Connection References

Connection references allow flows to use different connections in each environment:

1. In Solution → Click **+ New** → **More** → **Connection reference**
2. Create these references:

| Name | Display Name | Connector |
|------|--------------|-----------|
| kd_DataverseConnection | Dataverse Connection | Microsoft Dataverse |
| kd_SharePointConnection | SharePoint Connection | SharePoint |
| kd_HTTPConnection | HTTP Connection | HTTP with Azure AD (if used) |

3. Link each connection reference to an existing connection

### Step 1.6: Update Flows to Use Connection References

For each flow in the solution:

1. Open the flow in edit mode
2. For each action that uses a connection:
   - Click the action
   - Change from specific connection to connection reference
   - Select the appropriate connection reference (e.g., kd_DataverseConnection)
3. Save the flow

---

## PHASE 2: VERIFY SOLUTION COMPLETENESS

### Step 2.1: Check Solution Components

In Power Apps → Solutions → Your Solution, verify you have:

**For MPA Agent:**
| Component Type | Expected Count | Check |
|---------------|----------------|-------|
| Agent (Copilot) | 1 | [ ] |
| Cloud Flows | 4-5 | [ ] |
| Tables | 5-8 | [ ] |
| Environment Variables | 4 | [ ] |
| Connection References | 2-3 | [ ] |

**For CA Agent:**
| Component Type | Expected Count | Check |
|---------------|----------------|-------|
| Agent (Copilot) | 1 | [ ] |
| Cloud Flows | 5-6 | [ ] |
| Tables | 5-8 | [ ] |
| Environment Variables | 4 | [ ] |
| Connection References | 2-3 | [ ] |

### Step 2.2: Verify Agent Configuration

In Copilot Studio:

1. Open your agent
2. Verify:
   - [ ] Instructions are present and complete
   - [ ] All topics are visible
   - [ ] Each topic has trigger phrases
   - [ ] Knowledge source shows connected
   - [ ] Global variables are configured

### Step 2.3: Test Agent End-to-End

Before exporting, test the complete flow:

1. In Copilot Studio → Click **Test**
2. Test these scenarios:
   - [ ] Greeting topic responds correctly
   - [ ] Start planning creates a session
   - [ ] Search benchmarks returns results
   - [ ] Generate document creates output
   - [ ] Feedback is captured

---

## PHASE 3: PUBLISH AND EXPORT

### Step 3.1: Publish All Customizations

1. In Power Apps → Solutions → Your Solution
2. Click **Publish all customizations** (top menu)
3. Wait for "Publishing completed" message

### Step 3.2: Export Solution (Manual Method)

1. In Power Apps → Solutions → Your Solution
2. Click **Export** (top menu)
3. In the export wizard:
   - **Publish before export:** Select "Yes"
   - Click **Next**
4. **Export as:**
   - Select **Unmanaged** (for dev/test)
   - Click **Export**
5. Wait for export to complete
6. Download the .zip file
7. Save to: `/release/v5.5/solutions/KesselAgentPlatform_5_5_0_0.zip`

### Step 3.3: Export Solution (pac CLI Method)

Open terminal/PowerShell:

```powershell
# Navigate to deployment scripts
cd /path/to/Kessel-Digital-Agent-Platform/release/v5.5/deployment/mastercard/scripts

# Authenticate to your dev environment
pac auth create --environment "https://[your-org].crm.dynamics.com"

# Run export script
./export-solution.ps1 -Version "5.5.0.0" -ExportManaged
```

### Step 3.4: Export Managed Solution (for Production)

For Mastercard deployment, also export as managed:

1. In Power Apps → Solutions → Your Solution
2. Click **Export**
3. Select **Managed** 
4. Click **Export**
5. Download and save as: `KesselAgentPlatform_5_5_0_0_managed.zip`

---

## PHASE 4: COMMIT TO REPOSITORY

### Step 4.1: Verify Export Files

```bash
# Check exported files
ls -la release/v5.5/solutions/

# Expected:
# KesselAgentPlatform_5_5_0_0.zip          (unmanaged)
# KesselAgentPlatform_5_5_0_0_managed.zip  (managed, optional)
```

### Step 4.2: Commit and Push

```bash
cd /path/to/Kessel-Digital-Agent-Platform

# Add solution files
git add release/v5.5/solutions/

# Commit with descriptive message
git commit -m "Export KesselAgentPlatform solution v5.5.0.0

Contents:
- Media Planning Agent with all topics
- Power Automate flows (4)
- Environment variables (4)
- Connection references (3)
- Dataverse tables

Tested in personal dev environment before export."

# Push to both branches
git push origin deploy/mastercard
git checkout deploy/personal
git merge deploy/mastercard
git push origin deploy/personal
```

---

## PHASE 5: TEST IMPORT

### Step 5.1: Import to Personal Environment (Different Org)

If you have a second personal environment for testing:

```powershell
# Authenticate to test environment
pac auth create --environment "https://[test-org].crm.dynamics.com"

# Import
./import-solution.ps1 `
    -SolutionPath "../../solutions/KesselAgentPlatform_5_5_0_0.zip" `
    -Environment "personal"
```

### Step 5.2: Import to Mastercard Environment

```powershell
# Authenticate to Mastercard environment
pac auth create --environment "https://[mastercard-org].crm.dynamics.com"

# Import (unmanaged for initial testing)
./import-solution.ps1 `
    -SolutionPath "../../solutions/KesselAgentPlatform_5_5_0_0.zip" `
    -Environment "mastercard"

# OR import managed for production
./import-solution.ps1 `
    -SolutionPath "../../solutions/KesselAgentPlatform_5_5_0_0_managed.zip" `
    -Environment "mastercard" `
    -Managed
```

---

## PHASE 6: POST-IMPORT CONFIGURATION

After importing, complete these steps in the target environment:

### Step 6.1: Set Environment Variable Values

1. Open Power Apps: https://make.powerapps.com
2. Select target environment
3. Go to Solutions → Kessel Agent Platform → Environment Variables
4. For each variable, set the **Current Value**:

**For Mastercard:**
| Variable | Current Value |
|----------|---------------|
| kd_SharePointSiteUrl | https://mastercard.sharepoint.com/sites/CAEConsultingProduct |
| kd_SharePointLibrary | Shared Documents |
| kd_DataverseUrl | https://[mastercard-org].crm.dynamics.com |

### Step 6.2: Configure Connection References

1. In Solutions → Kessel Agent Platform → Connection References
2. For each reference:
   - Click to open
   - Click **+ New connection** or select existing
   - Authenticate with appropriate credentials
   - Save

### Step 6.3: Enable Power Automate Flows

1. Open Power Automate: 
   - Mastercard: https://make.powerautomate.com/environments/Default-f06fa858-824b-4a85-aacv-f372cfdc282e/home
2. Find imported flows
3. For each flow:
   - Open flow
   - Verify no connection errors
   - Click **Turn on**

### Step 6.4: Reconnect Knowledge Source

The SharePoint knowledge source may need to be reconnected:

1. Open Copilot Studio
2. Select imported agent
3. Go to **Knowledge**
4. If SharePoint source shows disconnected:
   - Remove and re-add
   - Select Mastercard SharePoint site
   - Select appropriate folder (MPA, CA, or EAP)
   - Wait for indexing

### Step 6.5: Publish Agent

1. In Copilot Studio, select agent
2. Click **Publish**
3. Confirm publication

---

## TROUBLESHOOTING

### Export Fails: "Solution has dependencies"

**Cause:** Solution references components not in the solution

**Fix:**
1. Check what's missing
2. Add missing components to solution
3. Try export again

### Import Fails: "Missing connector"

**Cause:** Target environment doesn't have required connector

**Fix:**
1. Enable connector in Power Platform Admin Center
2. Or install required solution/app that provides connector

### Flows Not Working After Import

**Cause:** Connection references not configured

**Fix:**
1. Go to Solutions → Connection References
2. Configure each connection reference
3. Turn flows on again

### Agent Topics Missing

**Cause:** Topics weren't included in solution

**Fix:**
1. Return to dev environment
2. Open solution in edit mode
3. Verify agent with all topics is in solution
4. Re-export

### Knowledge Source Not Connected

**Cause:** Knowledge sources are references, not actual data

**Fix:**
1. In target environment, reconnect SharePoint
2. Point to correct site/library for that environment
3. Wait for indexing

---

## QUICK REFERENCE COMMANDS

```powershell
# =====================================
# EXPORT (from dev environment)
# =====================================

# Authenticate
pac auth create --environment "https://[dev-org].crm.dynamics.com"

# List solutions
pac solution list

# Export unmanaged
pac solution export --name "KesselAgentPlatform" --path "./KesselAgentPlatform_5_5_0_0.zip"

# Export managed
pac solution export --name "KesselAgentPlatform" --path "./KesselAgentPlatform_5_5_0_0_managed.zip" --managed

# =====================================
# IMPORT (to target environment)
# =====================================

# Authenticate to target
pac auth create --environment "https://[target-org].crm.dynamics.com"

# Import unmanaged
pac solution import --path "./KesselAgentPlatform_5_5_0_0.zip" --activate-plugins --force-overwrite

# Import managed
pac solution import --path "./KesselAgentPlatform_5_5_0_0_managed.zip" --activate-plugins

# Check status
pac solution list
```

---

## NEXT STEPS AFTER SUCCESSFUL EXPORT

1. [ ] Solution exported and committed to repository
2. [ ] Tested import to secondary environment
3. [ ] Documented any manual steps required
4. [ ] Updated CHANGELOG.md with version notes
5. [ ] Ready for Mastercard deployment

---

## RELATED DOCUMENTATION

- [Solution Export/Import Workflow](./SOLUTION_EXPORT_IMPORT_WORKFLOW.md)
- [Import Solution Script](./mastercard/scripts/import-solution.ps1)
- [Export Solution Script](./mastercard/scripts/export-solution.ps1)
- [Mastercard Core Instructions](./MASTERCARD_CORE_INSTRUCTIONS.md)
- [VS Code Deployment Instructions](./mastercard/VSCODE_DEPLOY_TO_MASTERCARD.md)

---
