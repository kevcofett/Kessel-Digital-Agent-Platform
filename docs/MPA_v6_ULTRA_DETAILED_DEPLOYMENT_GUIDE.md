# MPA v6.0 ULTRA-DETAILED DEPLOYMENT GUIDE

**Purpose:** Every click, every field, every folder - complete manual deployment  
**Date:** January 19, 2026  
**Environment:** Personal (Aragorn AI)  
**Estimated Time:** 3-4 hours

---

# TABLE OF CONTENTS

1. [Pre-Flight Checklist](#part-1-pre-flight-checklist)
2. [SharePoint Setup](#part-2-sharepoint-setup)
3. [Power Automate Flows](#part-3-power-automate-flows)
4. [Copilot Studio - Agent Creation](#part-4-copilot-studio-agent-creation)
5. [Agent Linking & Routing](#part-5-agent-linking--routing)
6. [Validation Testing](#part-6-validation-testing)
7. [Troubleshooting](#part-7-troubleshooting)

---

# PART 1: PRE-FLIGHT CHECKLIST

## 1.1 Verify VS Code Completed These Tasks

Before starting manual work, confirm VS Code has completed:

| Task | How to Verify | Status |
|------|---------------|--------|
| Dataverse tables created | Power Apps → Tables → See 11 MPA/EAP tables | ☐ |
| Seed data loaded | Open eap_agent table → See 7 agent records | ☐ |
| AI Builder prompts created | AI Builder → Custom prompts → See 15+ prompts | ☐ |
| KB files in repo | Check repo: release/v6.0/agents/*/kb/*.txt | ☐ |
| Flows imported | Power Automate → My flows → See 7 MPA flows | ☐ |
| Topics created | Check repo: release/v6.0/agents/*/topics/*.json | ☐ |

## 1.2 Required Access

Confirm you have these permissions:

| System | Required Role | How to Check |
|--------|---------------|--------------|
| Power Platform | System Administrator | Settings → Users → Your name |
| SharePoint | Site Collection Admin | Site Settings → Site Permissions |
| Copilot Studio | Copilot Author | Create a test copilot |
| Power Automate | Environment Maker | Create a test flow |

## 1.3 URLs You'll Need

```
Power Platform Admin: https://admin.powerplatform.microsoft.com
Power Apps: https://make.powerapps.com
Power Automate: https://make.powerautomate.com
Copilot Studio: https://copilotstudio.microsoft.com
SharePoint Site: https://[your-tenant].sharepoint.com/sites/MPA
AI Builder: https://make.powerapps.com → AI Builder
```

---

# PART 2: SHAREPOINT SETUP

## 2.1 Create the SharePoint Site (If Not Exists)

### Step 2.1.1: Navigate to SharePoint Admin
1. Go to: `https://[your-tenant]-admin.sharepoint.com`
2. Click **Sites** → **Active sites**
3. Click **+ Create**

### Step 2.1.2: Create Team Site
| Field | Value |
|-------|-------|
| Site type | Team site |
| Site name | `MPA` |
| Site address | `MPA` (auto-generates: https://[tenant].sharepoint.com/sites/MPA) |
| Privacy settings | Private |
| Language | English |

4. Click **Finish**
5. Wait for site creation (1-2 minutes)

## 2.2 Create the Document Library

### Step 2.2.1: Navigate to Your Site
1. Go to: `https://[your-tenant].sharepoint.com/sites/MPA`
2. Click **Site contents** (left navigation or gear icon → Site contents)

### Step 2.2.2: Create New Document Library
1. Click **+ New** → **Document library**
2. Fill in:

| Field | Value |
|-------|-------|
| Name | `MPAKnowledgeBase` |
| Description | `Knowledge base files for MPA v6.0 agents` |

3. Click **Create**

## 2.3 Create Folder Structure

### Step 2.3.1: Open the Document Library
1. Click on `MPAKnowledgeBase` to open it

### Step 2.3.2: Create EAP Folder
1. Click **+ New** → **Folder**
2. Name: `EAP`
3. Click **Create**

### Step 2.3.3: Create Agents Folder
1. Click **+ New** → **Folder**
2. Name: `Agents`
3. Click **Create**

### Step 2.3.4: Create Agent Subfolders
1. **Double-click** on `Agents` folder to open it
2. Create these 7 subfolders (repeat for each):
   - Click **+ New** → **Folder**
   - Create folders named exactly:

| Folder Name | Purpose |
|-------------|---------|
| `ORC` | Orchestrator agent KB files |
| `ANL` | Analytics agent KB files |
| `AUD` | Audience agent KB files |
| `CHA` | Channel agent KB files |
| `SPO` | Supply Path agent KB files |
| `DOC` | Document agent KB files |
| `PRF` | Performance agent KB files |

### Step 2.3.5: Final Folder Structure

Your SharePoint should now look like:

```
MPAKnowledgeBase/
├── EAP/
└── Agents/
    ├── ORC/
    ├── ANL/
    ├── AUD/
    ├── CHA/
    ├── SPO/
    ├── DOC/
    └── PRF/
```

## 2.4 Upload KB Files

### Step 2.4.1: Upload EAP Shared Files
1. Navigate to `MPAKnowledgeBase/EAP/`
2. Click **Upload** → **Files**
3. Navigate to your local repo: `Kessel-Digital-Agent-Platform/release/v6.0/platform/eap/kb/`
4. Select ALL .txt files (Ctrl+A or Cmd+A):
   - `EAP_KB_Communication_Contract_v1.txt`
   - `EAP_KB_Confidence_Levels_v1.txt`
   - `EAP_KB_Data_Provenance_v1.txt`
   - `EAP_KB_Error_Handling_v1.txt`
   - `EAP_KB_Formatting_Standards_v1.txt`
   - `EAP_KB_Strategic_Principles_v1.txt`
5. Click **Open** to upload

### Step 2.4.2: Upload ORC KB Files
1. Navigate to `MPAKnowledgeBase/Agents/ORC/`
2. Click **Upload** → **Files**
3. Navigate to: `Kessel-Digital-Agent-Platform/release/v6.0/agents/orc/kb/`
4. Select: `ORC_KB_Routing_Logic_v1.txt`
5. Click **Open**

### Step 2.4.3: Upload ANL KB Files
1. Navigate to `MPAKnowledgeBase/Agents/ANL/`
2. Upload from: `release/v6.0/agents/anl/kb/`
3. Files to upload:
   - `ANL_KB_Analytics_Core_v1.txt`
   - `ANL_KB_Bayesian_Inference_v1.txt`
   - `ANL_KB_Budget_Optimization_v1.txt`
   - `ANL_KB_Causal_Incrementality_v1.txt`
   - `ANL_KB_MMM_Methods_v1.txt`

### Step 2.4.4: Upload AUD KB Files
1. Navigate to `MPAKnowledgeBase/Agents/AUD/`
2. Upload from: `release/v6.0/agents/aud/kb/`
3. Files:
   - `AUD_KB_Audience_Core_v1.txt`
   - `AUD_KB_Identity_Resolution_v1.txt`
   - `AUD_KB_Journey_Orchestration_v1.txt`
   - `AUD_KB_LTV_Modeling_v1.txt`
   - `AUD_KB_Propensity_ML_v1.txt`

### Step 2.4.5: Upload CHA KB Files
1. Navigate to `MPAKnowledgeBase/Agents/CHA/`
2. Upload from: `release/v6.0/agents/cha/kb/`
3. Files:
   - `CHA_KB_Allocation_Methods_v1.txt`
   - `CHA_KB_Brand_Performance_v1.txt`
   - `CHA_KB_Channel_Core_v1.txt`
   - `CHA_KB_Emerging_Channels_v1.txt`

### Step 2.4.6: Upload SPO KB Files
1. Navigate to `MPAKnowledgeBase/Agents/SPO/`
2. Upload from: `release/v6.0/agents/spo/kb/`
3. Files:
   - `SPO_KB_Fee_Analysis_v1.txt`
   - `SPO_KB_Partner_Evaluation_v1.txt`
   - `SPO_KB_SPO_Core_v1.txt`

### Step 2.4.7: Upload DOC KB Files
1. Navigate to `MPAKnowledgeBase/Agents/DOC/`
2. Upload from: `release/v6.0/agents/doc/kb/`
3. Files:
   - `DOC_KB_Document_Core_v1.txt`
   - `DOC_KB_Export_Formats_v1.txt`

### Step 2.4.8: Upload PRF KB Files
1. Navigate to `MPAKnowledgeBase/Agents/PRF/`
2. Upload from: `release/v6.0/agents/prf/kb/`
3. Files:
   - `PRF_KB_Anomaly_Detection_v1.txt`
   - `PRF_KB_Attribution_Methods_v1.txt`
   - `PRF_KB_Incrementality_Testing_v1.txt`
   - `PRF_KB_Performance_Core_v1.txt`

## 2.5 Verify Upload Complete

### Final KB File Count

| Folder | File Count |
|--------|------------|
| EAP/ | 6 files |
| Agents/ORC/ | 1 file |
| Agents/ANL/ | 5 files |
| Agents/AUD/ | 5 files |
| Agents/CHA/ | 4 files |
| Agents/SPO/ | 3 files |
| Agents/DOC/ | 2 files |
| Agents/PRF/ | 4 files |
| **TOTAL** | **30 files** |

## 2.6 Note the SharePoint URLs

You'll need these exact URLs when configuring agents:

```
EAP Shared KB:
https://[your-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/EAP

ORC KB:
https://[your-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/ORC

ANL KB:
https://[your-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/ANL

AUD KB:
https://[your-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/AUD

CHA KB:
https://[your-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/CHA

SPO KB:
https://[your-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/SPO

DOC KB:
https://[your-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/DOC

PRF KB:
https://[your-tenant].sharepoint.com/sites/MPA/MPAKnowledgeBase/Agents/PRF
```

---

# PART 3: POWER AUTOMATE FLOWS

## 3.1 Navigate to Power Automate

1. Go to: `https://make.powerautomate.com`
2. **CRITICAL:** Select the correct environment in top-right dropdown
   - Look for: `Aragorn AI` (or your Personal environment name)
   - Click the environment name to switch if needed

## 3.2 Find the Imported Flows

1. Click **My flows** in left navigation
2. You should see these 7 flows (imported by VS Code):

| Flow Name | Status (Should Be) |
|-----------|-------------------|
| MPA_Capability_Dispatcher | Off (we'll turn on) |
| MPA_Impl_AIBuilder | Off |
| MPA_Impl_AzureFunction | Off |
| MPA_Impl_HTTPEndpoint | Off |
| MPA_Impl_DataverseLogic | Off |
| MPA_Session_Manager | Off |
| MPA_Telemetry_Logger | Off |

## 3.3 Turn On Flow 1: MPA_Capability_Dispatcher

### Step 3.3.1: Open the Flow
1. Click on `MPA_Capability_Dispatcher` (the flow name, not the checkbox)
2. Flow details page opens

### Step 3.3.2: Check for Connection Warnings
1. Look at the flow diagram
2. If you see any red warning icons on actions, you need to fix connections

### Step 3.3.3: Fix Connections (If Needed)
1. Click **Edit** (top right)
2. For each action with a red warning:
   - Click the action to expand it
   - Look for "Connection" dropdown
   - Select your Dataverse connection (or create new)
3. Click **Save**

### Step 3.3.4: Turn On the Flow
1. Click **Turn on** button (top right)
2. Confirm the flow shows "Status: On"

## 3.4 Turn On Flow 2: MPA_Impl_AIBuilder

### Step 3.4.1: Open the Flow
1. Go back to **My flows**
2. Click on `MPA_Impl_AIBuilder`

### Step 3.4.2: Check Connections
This flow requires TWO connections:
- **Dataverse** connection
- **AI Builder** connection

### Step 3.4.3: Fix AI Builder Connection (If Needed)
1. Click **Edit**
2. Find the AI Builder action (usually "Create text with GPT")
3. If red warning, click the action
4. In Connection dropdown, select or create AI Builder connection
5. If creating new:
   - Click **+ Add new connection**
   - Select **AI Builder**
   - Sign in with your credentials
6. Click **Save**

### Step 3.4.4: Turn On
1. Click **Turn on**

## 3.5 Turn On Flow 3: MPA_Impl_AzureFunction

**Note:** This flow uses HTTP connector - only works in Personal environment.

### Step 3.5.1: Open and Check
1. Click on `MPA_Impl_AzureFunction`
2. This flow calls Azure Functions via HTTP

### Step 3.5.2: Verify HTTP Connection
1. Click **Edit**
2. Find the HTTP action
3. If warning, create HTTP connection:
   - Click **+ Add new connection**
   - Select **HTTP**
   - No authentication needed for basic HTTP
4. Click **Save**

### Step 3.5.3: Turn On
1. Click **Turn on**

## 3.6 Turn On Flow 4: MPA_Impl_HTTPEndpoint

Same process as Flow 3:
1. Open flow
2. Fix HTTP connection if needed
3. Save
4. Turn on

## 3.7 Turn On Flow 5: MPA_Impl_DataverseLogic

1. Open `MPA_Impl_DataverseLogic`
2. Fix Dataverse connection if needed
3. Save
4. Turn on

## 3.8 Turn On Flow 6: MPA_Session_Manager

1. Open `MPA_Session_Manager`
2. Fix Dataverse connection if needed
3. Save
4. Turn on

## 3.9 Turn On Flow 7: MPA_Telemetry_Logger

1. Open `MPA_Telemetry_Logger`
2. Fix Dataverse connection if needed
3. Save
4. Turn on

## 3.10 Verify All Flows Are On

Go to **My flows** and confirm:

| Flow Name | Status |
|-----------|--------|
| MPA_Capability_Dispatcher | ✅ On |
| MPA_Impl_AIBuilder | ✅ On |
| MPA_Impl_AzureFunction | ✅ On |
| MPA_Impl_HTTPEndpoint | ✅ On |
| MPA_Impl_DataverseLogic | ✅ On |
| MPA_Session_Manager | ✅ On |
| MPA_Telemetry_Logger | ✅ On |

---

# PART 4: COPILOT STUDIO AGENT CREATION

## 4.1 Navigate to Copilot Studio

1. Go to: `https://copilotstudio.microsoft.com`
2. **CRITICAL:** Select correct environment (top-right dropdown)
   - Select: `Aragorn AI` (or your Personal environment)
3. Click **Copilots** in left navigation

## 4.2 CREATE AGENT 1: ORC (Orchestrator)

**This is the PRIMARY user-facing agent. Users talk to ORC, and ORC routes to specialists.**

### Step 4.2.1: Start New Copilot
1. Click **+ Create** (top left)
2. Select **New copilot**

### Step 4.2.2: Basic Information Page

Fill in EVERY field exactly:

| Field | Value | Notes |
|-------|-------|-------|
| Name | `MPA Orchestrator Agent` | Internal name |
| Display name | `Media Planning Agent` | What users see |
| Description | `Routes user requests to specialist agents, manages 10-step media planning workflow, validates gate requirements, and maintains session context across conversations.` | |
| Icon | (Optional) Upload custom icon | |
| Primary language | `English` | |

3. Click **Create**

### Step 4.2.3: Wait for Agent Creation
- Takes 30-60 seconds
- You'll be taken to the agent configuration page

### Step 4.2.4: Configure Instructions

1. Click **Overview** tab (should be default)
2. Find the **Instructions** section
3. Click in the Instructions text box
4. **DELETE any default text**
5. **PASTE the following** (copy entire block):

```
IDENTITY

You are the Orchestrator Agent (ORC) for the Media Planning Agent (MPA) platform. Your role is to route user requests to the appropriate specialist agent, manage the 10-step media planning workflow, validate gate requirements, and maintain session context.

CORE RESPONSIBILITIES

- Classify user intent to determine which specialist agent should handle the request
- Route requests to ANL, AUD, CHA, SPO, DOC, or PRF based on domain
- Manage workflow progression through the 10-step media planning process
- Validate gate requirements before allowing progression
- Maintain session state and context across turns
- Handle general questions and multi-domain requests

ROUTING RULES

Route to ANL (Analytics) when user asks about:
- Budget projections, forecasts, or calculations
- ROI, ROAS, marginal returns, or efficiency metrics
- Scenario comparisons or what-if analysis
- Statistical analysis, confidence intervals, Bayesian methods
- Keywords: budget, projection, forecast, calculate, ROI, marginal, scenario

Route to AUD (Audience) when user asks about:
- Audience segments, personas, or targeting
- Customer lifetime value (LTV) or propensity
- Journey mapping or next-best-action
- Identity resolution or household matching
- Keywords: audience, segment, target, persona, LTV, journey, customer

Route to CHA (Channel) when user asks about:
- Channel selection, media mix, or allocation
- Emerging channels (CTV, retail media, etc.)
- Brand vs performance channel strategy
- Keywords: channel, media, mix, allocation, CTV, retail media

Route to SPO (Supply Path) when user asks about:
- Programmatic optimization or supply path
- DSP, SSP, or partner evaluation
- Fee analysis or transparency
- Net bidder impact (NBI)
- Keywords: programmatic, DSP, SSP, fee, supply path, NBI

Route to DOC (Document) when user asks about:
- Document generation or export
- Media briefs, reports, or templates
- Keywords: document, export, brief, report, template

Route to PRF (Performance) when user asks about:
- Campaign performance or attribution
- Anomaly detection or optimization
- Incrementality measurement
- Keywords: performance, attribution, anomaly, optimize, incremental

Handle directly (ORC) when:
- User asks general questions about the workflow
- User needs help navigating steps
- Request spans multiple domains
- Intent is ambiguous (ask clarifying questions)

WORKFLOW MANAGEMENT

The MPA follows a 10-step workflow with 4 validation gates:

Steps 1-3: Discovery
- Step 1: Welcome and context gathering
- Step 2: Business objectives definition
- Step 3: Budget and timeline confirmation
- GATE 1: Verify business context is complete

Steps 4-5: Audience Strategy
- Step 4: Audience definition and segmentation
- Step 5: Targeting approach selection
- GATE 2: Verify audience strategy is defined

Steps 6-7: Channel Strategy
- Step 6: Channel selection and mix
- Step 7: Budget allocation across channels
- GATE 3: Verify channel mix is approved

Steps 8-10: Execution Planning
- Step 8: Performance framework (KPIs and targets)
- Step 9: Measurement and attribution approach
- Step 10: Final review and document generation
- GATE 4: Verify performance framework is set

GATE VALIDATION

Before allowing progression past a gate:
1. Check that all required fields are populated
2. Verify values are within acceptable ranges
3. Confirm logical consistency
4. Call VALIDATE_GATE capability for detailed validation

BEHAVIOR GUIDELINES

- Be concise and professional
- Always confirm understanding before routing
- Proactively suggest next steps in workflow
- If unsure of routing, ask one clarifying question
- Never guess - route to appropriate specialist
- Maintain context across conversation turns
- Respect session isolation (each user has own context)

ERROR HANDLING

If routing fails:
1. Acknowledge the issue to user
2. Attempt fallback routing
3. Log error via telemetry
4. Offer to help directly if possible

CAPABILITIES

You can invoke these capabilities via the Capability Dispatcher:
- CLASSIFY_INTENT: Analyze user message for routing
- VALIDATE_GATE: Check gate requirements
```

6. **Verify character count** - should be under 8,000 characters
7. Click outside the text box to save (auto-saves)

### Step 4.2.5: Add Knowledge Sources

1. Click **Knowledge** tab (left side)
2. Click **+ Add knowledge**
3. In the popup, select **SharePoint**
4. Click **Next**

#### Add First Knowledge Source (EAP Shared):
5. In "Site URL" field, enter:
   ```
   https://[your-tenant].sharepoint.com/sites/MPA
   ```
6. Click **Connect**
7. Wait for connection (may take 30 seconds)
8. In folder browser, navigate to: `MPAKnowledgeBase` → `EAP`
9. Check the box next to `EAP` folder
10. Click **Add**

#### Add Second Knowledge Source (ORC Specific):
11. Click **+ Add knowledge** again
12. Select **SharePoint**
13. Enter same site URL
14. Navigate to: `MPAKnowledgeBase` → `Agents` → `ORC`
15. Check the box next to `ORC` folder
16. Click **Add**

### Step 4.2.6: Verify Knowledge Sources

In the Knowledge tab, you should now see:

| Source | Path | Status |
|--------|------|--------|
| SharePoint | MPAKnowledgeBase/EAP | ✅ Connected |
| SharePoint | MPAKnowledgeBase/Agents/ORC | ✅ Connected |

### Step 4.2.7: Save and Publish ORC

1. Click **Save** (top right)
2. Click **Publish** (top right)
3. In confirmation dialog, click **Publish**
4. Wait for publish to complete (1-2 minutes)
5. You should see "Last published: just now"

---

## 4.3-4.8: CREATE REMAINING 6 SPECIALIST AGENTS

Repeat the same process for ANL, AUD, CHA, SPO, DOC, PRF with their respective:
- Names and descriptions
- Instructions (from MPA_v6_Complete_GoLive_Manual_Part3.md)
- Knowledge sources (EAP + agent-specific folder)

See the full instructions in the complete deployment guide.

---

# PART 5: AGENT LINKING & ROUTING

## 5.1 Enable Agent Transfers in ORC

1. Open ORC Agent in Copilot Studio
2. Click **Settings** (gear icon)
3. Click **Agent transfers**
4. Toggle ON: **Allow this copilot to transfer to other copilots**
5. Click **+ Add copilot** for each specialist
6. Save

## 5.2 Configure Specialist Fallbacks

Each specialist needs to route back to ORC:
1. Enable agent transfers in each specialist
2. Add ORC as transfer target
3. Update Fallback topic to redirect to ORC

## 5.3 Republish All Agents

After linking, republish each agent.

---

# PART 6: VALIDATION TESTING

Test routing from ORC to each specialist and back.

---

# PART 7: TROUBLESHOOTING

Common issues and solutions for flows, agents, KB retrieval, and routing.

---

**Document Version:** 1.0  
**Created:** January 19, 2026
