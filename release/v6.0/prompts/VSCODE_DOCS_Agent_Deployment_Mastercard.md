# VSCODE DOCS AGENT DEPLOYMENT INSTRUCTIONS - MASTERCARD ENVIRONMENT

**Document:** VSCODE_DOCS_Agent_Deployment_Mastercard.md
**Version:** 1.0
**Date:** January 24, 2026
**Classification:** Mastercard Internal
**Target Environment:** Mastercard Corporate Power Platform

---

## OVERVIEW

This document provides comprehensive step-by-step instructions for deploying the MCMAP Documentation Assistant (DOCS) agent into Microsoft Copilot Studio within the Mastercard corporate environment. The instructions maximize CLI automation using PAC CLI and PnP PowerShell while specifying exact configuration settings for DLP compliance.

---

## PRE-DEPLOYMENT CHECKLIST

Before beginning deployment, ensure all prerequisites are met:

### Required Tools Installation

```bash
# Windows - Install PAC CLI via winget
winget install Microsoft.PowerAppsCLI

# Verify PAC CLI installation
pac --version

# Install PnP PowerShell (requires PowerShell 7+)
Install-Module -Name PnP.PowerShell -Force -AllowClobber

# Install Azure CLI (if not present)
winget install Microsoft.AzureCLI

# Verify Azure CLI
az --version
```

### Access Requirements Checklist

- [ ] PAC CLI installed and verified
- [ ] PnP PowerShell module installed
- [ ] Azure CLI installed and authenticated to Mastercard tenant
- [ ] Access to Mastercard Power Platform tenant (Environment Maker role minimum)
- [ ] SharePoint Site Collection Admin for MCMAP site
- [ ] Copilot Studio Premium license assigned
- [ ] Access to source files at release/v6.0/agents/docs/

---

## PHASE 1: AUTHENTICATION AND ENVIRONMENT SETUP

### 1.1 PAC CLI Authentication

```bash
# Clear any existing auth profiles
pac auth clear

# Create new authentication for Mastercard environment
# Replace [mc-env] with actual environment name (e.g., mcenterprise)
pac auth create --name "Mastercard" --environment "https://[mc-env].crm.dynamics.com"

# Select the Mastercard profile as active
pac auth select --name "Mastercard"

# Verify connection - should show Mastercard org details
pac org who

# List available environments
pac env list
```

### 1.2 PnP PowerShell Authentication

```powershell
# Connect to SharePoint with interactive login
# Replace [mc-tenant] with actual tenant (e.g., mastercard)
$SiteUrl = "https://[mc-tenant].sharepoint.com/sites/MCMAP"
Connect-PnPOnline -Url $SiteUrl -Interactive

# Verify connection
Get-PnPWeb | Select Title, Url
```

### 1.3 Azure CLI Authentication (if needed for advanced operations)

```bash
# Login to Azure with Mastercard credentials
az login --tenant [mc-tenant-id]

# Verify subscription
az account show
```

---

## PHASE 2: SHAREPOINT KNOWLEDGE BASE SETUP

### 2.1 Create Folder Structure

```powershell
# Configuration variables - UPDATE THESE
$SiteUrl = "https://[mc-tenant].sharepoint.com/sites/MCMAP"
$LibraryName = "MCMAP_Knowledge_Base"

# Connect to SharePoint
Connect-PnPOnline -Url $SiteUrl -Interactive

# Create document library if not exists
$lib = Get-PnPList -Identity $LibraryName -ErrorAction SilentlyContinue
if (-not $lib) {
    New-PnPList -Title $LibraryName -Template DocumentLibrary
    Write-Host "Created document library: $LibraryName"
}

# Create DOCS agent folder structure
Add-PnPFolder -Name "DOCS" -Folder $LibraryName -ErrorAction SilentlyContinue
Add-PnPFolder -Name "core" -Folder "$LibraryName/DOCS" -ErrorAction SilentlyContinue

Write-Host "Folder structure created: $LibraryName/DOCS/core"
```

### 2.2 Upload Knowledge Base Files

```powershell
# Path to KB files - UPDATE THIS to local repo path
$KBPath = "C:\repos\Kessel-Digital-Agent-Platform\release\v6.0\agents\docs\kb"
$TargetFolder = "$LibraryName/DOCS/core"

# Get all markdown files
$files = Get-ChildItem -Path $KBPath -Filter "*.md"

Write-Host "Found $($files.Count) files to upload"

# Upload each file
foreach ($file in $files) {
    try {
        Add-PnPFile -Path $file.FullName -Folder $TargetFolder -ErrorAction Stop
        Write-Host "Uploaded: $($file.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Verify uploads
$uploaded = Get-PnPFolderItem -FolderSiteRelativeUrl "DOCS/core" -ItemType File
Write-Host "`nTotal files in SharePoint: $($uploaded.Count)"
```

### 2.3 Knowledge Base File Manifest

The following 13 files should be uploaded to SharePoint:

| File | Size | Description |
|------|------|-------------|
| 00-MCMAP_Glossary.md | 7.4KB | 100+ terms and acronyms |
| 00-MCMAP_Index.md | 4.3KB | Document navigation guide |
| 00-MCMAP_Strategic_Platform_Vision.md | 9.9KB | Strategic positioning |
| 01-MCMAP_Executive_Summary.md | 29.6KB | Platform overview, ROI |
| 02-MCMAP_System_Architecture.md | 91.9KB | Technical architecture |
| 03-MCMAP_Security_Compliance.md | 32.5KB | DLP, data protection |
| 04-MCMAP_Agent_Capabilities.md | 31.2KB | 10 agents, 36 capabilities |
| 05-MCMAP_Data_Architecture.md | 53.8KB | 14 Dataverse tables |
| 06-MCMAP_AIBuilder_Integration.md | 53.6KB | 26 AI Builder prompts |
| 07-MCMAP_Operational_Runbook.md | 36.9KB | Support procedures |
| 08-MCMAP_Quality_Assurance.md | 51.4KB | Testing framework |
| 09-MCMAP_Future_Use_Cases.md | 20.7KB | Strategic opportunities |
| 10-MCMAP_Contact_Reference.md | 2.4KB | Support contacts |

**Total: ~425KB across 13 files**

### 2.4 Set SharePoint Permissions

```powershell
# Grant read access for MCMAP agents service account
# Replace with actual service account or group
$AgentServiceAccount = "MCMAPAgents@[tenant].onmicrosoft.com"

# Set folder permissions
Set-PnPFolderPermission `
    -List $LibraryName `
    -Identity "DOCS/core" `
    -User $AgentServiceAccount `
    -AddRole "Read"

Write-Host "Permissions set for: $AgentServiceAccount"
```

---

## PHASE 3: KNOWLEDGE BASE VALIDATION

### 3.1 Run Sanitization Check

```bash
# Navigate to repo root
cd /path/to/Kessel-Digital-Agent-Platform

# Run KB sanitization check (if script exists)
python release/v6.0/scripts/sanitize_kb_files.py \
    --path release/v6.0/agents/docs/kb \
    --check-only

# Alternative: Manual character count check
for f in release/v6.0/agents/docs/kb/*.md; do
    chars=$(wc -c < "$f")
    filename=$(basename "$f")
    if [ $chars -gt 36000 ]; then
        echo "WARNING: $filename exceeds 36K limit ($chars chars)"
    else
        echo "OK: $filename ($chars chars)"
    fi
done
```

### 3.2 Verify File Content Compliance

All KB files must comply with Copilot Studio KB requirements:

- No emoji characters
- No complex markdown tables (simple tables OK)
- No curly brackets in content
- ASCII characters only
- Files under 36,000 characters each

```bash
# Check for problematic characters
grep -l '[{}]' release/v6.0/agents/docs/kb/*.md && echo "WARNING: Curly brackets found"
```

---

## PHASE 4: COPILOT STUDIO AGENT CREATION

### 4.1 Create Agent via PAC CLI

```bash
# Ensure Mastercard environment is selected
pac auth select --name "Mastercard"

# Create the DOCS agent
pac copilot create \
    --name "MCMAP Documentation Assistant" \
    --description "Helps Mastercard employees explore MCMAP platform architecture, capabilities, and strategic opportunities with persona-based responses tailored to C-Suite, Senior Leadership, and Operations staff." \
    --schemaName "mcmap_docs_agent" \
    --solution "MCMAPAgents"

# Note the agent ID returned - needed for subsequent commands
```

### 4.2 Configure Agent AI Settings

**CRITICAL: These settings must be configured manually in Copilot Studio UI**

Navigate to: Copilot Studio > MCMAP Documentation Assistant > Settings

| Setting | Value | Location in UI | Reason |
|---------|-------|----------------|--------|
| **Model** | GPT-4o or Claude Sonnet | Settings > AI capabilities | Best reasoning for persona handling |
| **Web Search** | **OFF** | Settings > Knowledge | DLP compliance - no external data |
| **General Knowledge** | **OFF** | Settings > Knowledge | Force KB-only responses |
| **Deep Reasoning** | **OFF** | Settings > AI capabilities | Not needed for documentation lookup |
| **Content Moderation** | Medium | Settings > AI capabilities | Balance safety and utility |
| **Generative Orchestration** | **OFF** | Settings > Orchestration | Single-agent workflow |
| **Classic Data Protection** | ON | Settings > Security | Mastercard DLP requirement |

### 4.3 Upload Agent Instructions

The instructions file is located at:
```
release/v6.0/agents/docs/instructions/DOCS_Instructions_v5.txt
```

**File Specifications:**
- Characters: 7,991 (maximum allowed: 8,000)
- Format: Plain text, no markdown
- Contains: Persona handling (A/B/C), topic navigation (1-11), ORC handoff

```bash
# Verify character count
wc -c release/v6.0/agents/docs/instructions/DOCS_Instructions_v5.txt
# Expected output: 7991

# Copy to clipboard (macOS)
cat release/v6.0/agents/docs/instructions/DOCS_Instructions_v5.txt | pbcopy

# Copy to clipboard (Windows PowerShell)
Get-Content release/v6.0/agents/docs/instructions/DOCS_Instructions_v5.txt | Set-Clipboard
```

**Manual Step:**
1. Open Copilot Studio
2. Navigate to MCMAP Documentation Assistant > Overview
3. Locate the "Instructions" field
4. Paste the entire contents from clipboard
5. Click Save

### 4.4 Connect SharePoint Knowledge Source

**Manual Steps in Copilot Studio:**

1. Navigate to: Settings > Knowledge > Add knowledge
2. Select "SharePoint" as source type
3. Enter SharePoint configuration:
   - **Site URL:** `https://[mc-tenant].sharepoint.com/sites/MCMAP`
   - **Library:** `MCMAP_Knowledge_Base`
   - **Folder:** `DOCS/core`
4. Enable "Use for generative answers"
5. Set refresh schedule: Daily
6. Click Save and wait for indexing (5-10 minutes)

### 4.5 Verify Knowledge Source Indexing

After adding the knowledge source, verify indexing completed:

1. Go to Settings > Knowledge
2. Check status shows "Ready" (green checkmark)
3. Verify document count shows 13 documents
4. Test with a sample query in Test panel

---

## PHASE 5: ORC INTEGRATION (OPTIONAL)

If integrating DOCS with the Orchestrator (ORC) agent for unified routing:

### 5.1 Update Agent Registry

Add DOCS to the platform agent registry:

```json
{
    "code": "DOCS",
    "name": "MCMAP Documentation Assistant",
    "description": "Architecture documentation, terminology lookup, strategic briefing",
    "status": "active",
    "version": "5.0",
    "routingKeywords": [
        "documentation",
        "architecture",
        "glossary",
        "define",
        "what is",
        "what does",
        "explain",
        "how does MCMAP",
        "platform overview"
    ],
    "handoffTriggers": ["back to planning", "return to planning"],
    "handoffTarget": "ORC",
    "aiSettings": {
        "model": "gpt-4o",
        "webSearch": false,
        "generalKnowledge": false,
        "deepReasoning": false
    }
}
```

### 5.2 Update ORC Routing Instructions

Add to ORC agent instructions:

```
DOCS AGENT ROUTING

Triggers - Route to DOCS when user:
- Asks about MCMAP documentation or architecture
- Requests glossary definitions or terminology
- Says "what is" or "what does X mean"
- Asks about platform capabilities or structure
- Requests strategic briefing or overview

Return Handling:
- DOCS returns user when they say "back to planning"
- Resume ORC session context on return

Notes:
- DOCS is terminal - no onward routing from DOCS
- DOCS handles persona selection internally (A/B/C)
```

---

## PHASE 6: VALIDATION AND TESTING

### 6.1 Smoke Test Checklist

Execute these tests in the Copilot Studio Test panel:

| Test # | Input | Expected Result | Pass/Fail |
|--------|-------|-----------------|-----------|
| 1 | "Hi" | Welcome message with persona options (A/B/C) | |
| 2 | "A" | C-Suite focused response with revenue/ROI metrics | |
| 3 | "B" | Leadership focused response with architecture details | |
| 4 | "C" | Operations focused response with workflows/contacts | |
| 5 | "1" | Executive Summary overview | |
| 6 | "10" | Future Use Cases with $6.7-12B TAM | |
| 7 | "What does CAL mean?" | Definition of Capability Abstraction Layer | |
| 8 | "What does DLP mean?" | Definition of Data Loss Prevention | |
| 9 | "Who do I contact?" | Kevin Bauer contact information | |
| 10 | "Tell me about the Agent Factory" | KB retrieval from Executive Summary | |

### 6.2 DLP Compliance Verification

```bash
# List solution components to verify no blocked connectors
pac solution list --environment "Mastercard"

# Verify solution contains only approved components
pac solution component list --solution-name "MCMAPAgents"
```

**Manual DLP Check:**
1. Open Power Platform Admin Center
2. Navigate to Environments > [Mastercard Env] > DLP Policies
3. Verify MCMAP solution uses only approved connectors:
   - Dataverse (approved)
   - SharePoint (approved)
   - AI Builder (approved)
4. Confirm no violations logged

### 6.3 Performance Baseline

Document baseline response metrics:

| Metric | Target | Actual |
|--------|--------|--------|
| Initial greeting response | < 3 seconds | |
| Persona selection | < 2 seconds | |
| KB retrieval query | < 5 seconds | |
| Terminology lookup | < 3 seconds | |

---

## APPENDIX A: COMPLETE DOCS AGENT SPECIFICATION

```yaml
Agent:
  code: DOCS
  schemaName: mcmap_docs_agent
  displayName: "MCMAP Documentation Assistant"
  description: "Helps users explore MCMAP platform architecture, capabilities, and strategic opportunities with persona-based responses"
  version: "5.0"
  environment: Mastercard Corporate

AI_Settings:
  model: gpt-4o
  web_search: false
  general_knowledge: false
  deep_reasoning: false
  content_moderation: medium
  generative_orchestration: false
  classic_data_protection: true

Instructions:
  file: DOCS_Instructions_v5.txt
  path: release/v6.0/agents/docs/instructions/
  characters: 7991
  max_allowed: 8000

Knowledge_Base:
  source: SharePoint
  site: "https://[mc-tenant].sharepoint.com/sites/MCMAP"
  library: MCMAP_Knowledge_Base
  folder: DOCS/core
  files: 13
  total_size: ~425KB
  refresh: daily

Personas:
  A:
    name: C-Suite
    focus: Strategic value, ROI, revenue opportunity, competitive positioning
    key_docs: 01 (Executive Summary), 09 (Future Use Cases)
  B:
    name: Senior Leadership
    focus: Capabilities, architecture, integration pathway, roadmap
    key_docs: 02 (Architecture), 04 (Capabilities), 06 (AI Builder)
  C:
    name: Operations
    focus: Workflows, troubleshooting, support contacts
    key_docs: 07 (Runbook), 04 (Capabilities), 10 (Contacts)

Topics:
  1: What is MCMAP (01)
  2: System Architecture (02)
  3: Security (03)
  4: Agents (04)
  5: Data (05)
  6: AI Builder (06)
  7: Operations (07)
  8: Testing (08)
  9: Glossary (00)
  10: Future Use Cases (09)
  11: Contact (10)

DLP_Compliance:
  environment: Mastercard
  approved_connectors:
    - Dataverse
    - SharePoint
    - AI Builder
  blocked_connectors:
    - HTTP
    - Custom Connectors
    - Azure Functions
```

---

## APPENDIX B: TROUBLESHOOTING GUIDE

| Issue | Cause | Solution |
|-------|-------|----------|
| PAC auth fails | Expired token or wrong tenant | Run `pac auth clear` then `pac auth create` with correct environment URL |
| KB files not indexing | SharePoint sync delay or permissions | Wait 10 mins, verify folder permissions, re-add knowledge source |
| Instructions too long | Character count exceeds 8,000 | Use DOCS_Instructions_v5.txt (7,991 chars) which is pre-validated |
| Web search ON by default | Copilot Studio default setting | Explicitly toggle OFF in Settings > Knowledge |
| Agent returns generic answers | General Knowledge enabled | Verify General Knowledge = OFF in Settings > Knowledge |
| Persona not detected | Instructions not saved properly | Re-paste instructions, verify save completed |
| ORC handoff fails | Missing routing keywords | Update ORC instructions with DOCS triggers |
| DLP violation | Using blocked connector | Remove HTTP/custom connectors, use only Dataverse/SharePoint/AI Builder |
| Slow KB retrieval | Large document indexing | Wait for full indexing; consider splitting 91KB architecture doc |

---

## APPENDIX C: CLI COMMAND REFERENCE

### PAC CLI Commands Used

```bash
# Authentication
pac auth create --name "name" --environment "url"
pac auth select --name "name"
pac auth clear
pac auth list

# Organization
pac org who
pac env list

# Copilot
pac copilot create --name "name" --description "desc" --schemaName "schema" --solution "solution"
pac copilot list

# Solution
pac solution list
pac solution component list --solution-name "name"
```

### PnP PowerShell Commands Used

```powershell
# Connection
Connect-PnPOnline -Url "url" -Interactive
Disconnect-PnPOnline

# Folders
Add-PnPFolder -Name "name" -Folder "parent"
Get-PnPFolderItem -FolderSiteRelativeUrl "path"

# Files
Add-PnPFile -Path "local" -Folder "target"
Get-PnPFile -Url "url"

# Permissions
Set-PnPFolderPermission -List "list" -Identity "folder" -User "user" -AddRole "role"

# Lists/Libraries
New-PnPList -Title "name" -Template DocumentLibrary
Get-PnPList -Identity "name"
```

---

## APPENDIX D: POST-DEPLOYMENT CHECKLIST

After deployment, verify completion of all items:

- [ ] PAC CLI authenticated to Mastercard environment
- [ ] SharePoint folder structure created (MCMAP_Knowledge_Base/DOCS/core)
- [ ] All 13 KB files uploaded to SharePoint
- [ ] SharePoint permissions configured for agent access
- [ ] Agent created in Copilot Studio with correct schema name
- [ ] All AI settings configured per specification (web search OFF, etc.)
- [ ] Instructions uploaded (7,991 characters)
- [ ] SharePoint knowledge source connected and indexed
- [ ] All 10 smoke tests passing
- [ ] DLP compliance verified (no blocked connectors)
- [ ] ORC integration configured (if applicable)
- [ ] Performance baseline documented
- [ ] Deployment logged and dated

---

## CONTACT

For deployment assistance or issues:

**Kevin Bauer**
Platform Owner & Lead Developer
kevin.bauer@mastercard.com

Include "MCMAP DOCS Deployment" in subject line for priority routing.

---

**Document Version:** 1.0
**Last Updated:** January 24, 2026
**Author:** Kevin Bauer
**Classification:** Mastercard Internal
