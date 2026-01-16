# Mastercard Deployment Prompt for VS Code

Copy and paste this prompt into any AI assistant (Claude, ChatGPT, Copilot, etc.) in VS Code within the Mastercard environment.

---

## DEPLOYMENT PROMPT

```text
I need you to deploy the MPA (Media Planning Agent) solution to the Mastercard Power Platform environment.

## Environment Details

- Power Platform Environment ID: ea9d500a-9299-e7b2-8754-53ebea0cb818
- Dataverse URL: https://orgcc6eaaec.crm.dynamics.com
- Organization ID: 74145e53-ba5e-f011-8ee3-000d3a3b2c23
- SharePoint Site: https://mastercard.sharepoint.com/sites/CAEConsultingProduct

## Solution File

The solution to import is located at:
release/v5.5/solutions/MediaPlanningAgentv52_updated.zip

This solution contains 13 MPA Power Automate flows with correct plural Dataverse entity names.

## Deployment Steps Required

### Step 1: Verify Prerequisites

- Confirm Power Platform CLI (pac) is installed
- Confirm I have appropriate permissions to the Mastercard environment

### Step 2: Deploy SharePoint KB Files

Upload KB files from these locations to SharePoint:

- MPA KB: release/v5.5/agents/mpa/base/kb/ → MPA folder
- CA KB: release/v5.5/agents/ca/base/kb/ → CA folder
- EAP KB: release/v5.5/platform/eap-core/base/kb/ → EAP folder

### Step 3: Import Solution

Use PAC CLI to import the solution:

cd release/v5.5/solutions
pac auth create --environment "https://orgcc6eaaec.crm.dynamics.com"
pac solution import --path "MediaPlanningAgentv52_updated.zip" --async
pac solution list

### Step 4: Configure Environment Variables

After import, set these environment variables in Power Apps:

- kd_SharePointSiteUrl = https://mastercard.sharepoint.com/sites/CAEConsultingProduct
- kd_SharePointLibrary = Shared Documents
- kd_DataverseUrl = https://orgcc6eaaec.crm.dynamics.com

### Step 5: Configure Connection References

Set up connections for:

- kd_DataverseConnection (Dataverse)
- kd_SharePointConnection (SharePoint to CAEConsultingProduct)
- kd_HTTPConnection (if Azure Functions are used)

### Step 6: Enable Flows

Enable all imported MPA flows (MPA_InitializeSession, MPA_SearchBenchmarks, etc.)

### Step 7: Reconnect Knowledge Sources in Copilot Studio

- Connect SharePoint KB sources for MPA, CA, and EAP agents
- Wait for indexing (5-15 minutes)

### Step 8: Test

Run validation tests:

- "Hello" → Should get greeting
- "What's a typical CPM for CTV?" → Should get KB response
- "Start a new media plan" → Should trigger flow

## Reference Documentation

Full deployment guide: release/v5.5/deployment/mastercard/VSCODE_DEPLOY_TO_MASTERCARD.md

Please proceed with the deployment, executing each step and reporting status. If any step requires manual portal action, provide the exact URL and instructions.
```

---

## QUICK START (COPY THIS)

For a streamlined deployment, copy this shorter version:

```text
Deploy the MPA solution to Mastercard environment using solution import.

Environment:
- Environment ID: ea9d500a-9299-e7b2-8754-53ebea0cb818
- Dataverse: https://orgcc6eaaec.crm.dynamics.com
- SharePoint: https://mastercard.sharepoint.com/sites/CAEConsultingProduct

Solution: release/v5.5/solutions/MediaPlanningAgentv52_updated.zip

Follow the deployment guide at release/v5.5/deployment/mastercard/VSCODE_DEPLOY_TO_MASTERCARD.md using Option A (Solution Import).

Execute each step, upload KB files to SharePoint, import the solution via PAC CLI, configure environment variables and connections, enable flows, and test.
```

---

## ALTERNATIVE: GUI-ONLY DEPLOYMENT

If PAC CLI is not available, use this prompt:

```text
Guide me through deploying the MPA solution to Mastercard using the Power Apps portal GUI.

I need to:

1. Upload KB files to SharePoint (MPA, CA, EAP folders)
2. Import solution via https://make.powerapps.com (environment ea9d500a-9299-e7b2-8754-53ebea0cb818)
3. Solution file: release/v5.5/solutions/MediaPlanningAgentv52_updated.zip
4. Configure environment variables and connections
5. Enable flows
6. Test the agent

Provide step-by-step instructions with portal URLs.
```
