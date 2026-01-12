# MANUAL BUILD CHECKLIST
# Complete Task List for Building Agents in Copilot Studio

**Purpose:** Step-by-step checklist for initial agent build session
**Time Estimate:** 2-3 hours for both agents
**Output:** Exportable solution .zip files

---

## PRE-BUILD SETUP (30 minutes)

### Environment Preparation

- [ ] **Select/Create Dev Environment**
  - Open: https://admin.powerplatform.microsoft.com
  - Create or identify development environment
  - Environment name: ________________________
  - Environment URL: ________________________

- [ ] **Verify Licenses**
  - [ ] Copilot Studio license active
  - [ ] Power Automate license active
  - [ ] SharePoint access confirmed
  - [ ] Dataverse provisioned in environment

- [ ] **Deploy Prerequisites**
  ```
  Run these scripts BEFORE building agent:
  ```
  - [ ] SharePoint KB files uploaded
    ```powershell
    ./deploy-sharepoint.ps1 -SourcePath "../agents/mpa/base/kb" -TargetFolder "MPA" -Environment "personal"
    ./deploy-sharepoint.ps1 -SourcePath "../agents/ca/base/kb" -TargetFolder "CA" -Environment "personal"
    ```
  - [ ] Dataverse tables created (or solution imported)
  - [ ] Seed data imported
  - [ ] Verify in SharePoint: _____ MPA files, _____ CA files

### Solution Container Setup

- [ ] **Create Solution in Power Apps**
  - Open: https://make.powerapps.com
  - Select dev environment
  - Solutions → + New solution
  - Fill in:
    - Display name: `Kessel MPA` (or `Kessel CA`)
    - Name: `KesselMPA` (or `KesselCA`)
    - Publisher: Create new or select existing
      - Display name: `Kessel Digital`
      - Name: `KesselDigital`
      - Prefix: `kd`
    - Version: `1.0.0.0`
  - Click Create
  - Solution ID: ________________________

- [ ] **Add Environment Variables to Solution**
  
  In Solution → + Add existing → More → Environment variable
  
  | Variable Name | Type | Default Value | Created? |
  |--------------|------|---------------|----------|
  | kd_SharePointSiteUrl | Text | [Your SP URL] | [ ] |
  | kd_SharePointLibrary | Text | AgentKnowledgeBase | [ ] |
  | kd_DataverseUrl | Text | [Your DV URL] | [ ] |
  | kd_AzureFunctionUrl | Text | (empty) | [ ] |

- [ ] **Add Connection References to Solution**
  
  In Solution → + Add existing → More → Connection reference
  
  | Connection Reference | Connector | Created? |
  |---------------------|-----------|----------|
  | kd_DataverseConnection | Microsoft Dataverse | [ ] |
  | kd_SharePointConnection | SharePoint | [ ] |
  | kd_HTTPConnection | HTTP with Azure AD | [ ] |

---

## MPA AGENT BUILD (45-60 minutes)

### Create Agent

- [ ] **Create New Agent**
  - In Solution → + New → Agent → Copilot
  - Name: `Media Planning Agent`
  - Description: `AI-powered media planning assistant providing strategic guidance, industry benchmarks, channel recommendations, and comprehensive media plan documentation.`
  - Click Create
  - Wait for agent to initialize

- [ ] **Configure Agent Settings**
  - Settings → Agent
  - [ ] Paste instructions from:
    ```
    /release/v5.5/agents/mpa/extensions/mastercard/instructions/MPA_Instructions_RAG_PRODUCTION.txt
    ```
  - [ ] Verify character count: _____ (must be < 8,000)
  - [ ] Save

### Connect Knowledge Base

- [ ] **Add SharePoint Knowledge Source**
  - Knowledge → + Add knowledge → SharePoint
  - Site URL: [Environment variable or direct URL]
  - Library: AgentKnowledgeBase
  - Folder: MPA
  - [ ] Click Add
  - [ ] Verify file count shown: _____ files
  - [ ] Wait for indexing (may take 5-10 minutes)

### Create Global Variables

- [ ] **Create Each Variable**
  
  Settings → Variables → + New variable
  
  | Variable | Type | Default | Created? |
  |----------|------|---------|----------|
  | Global.SessionID | String | (empty) | [ ] |
  | Global.Objective | String | (empty) | [ ] |
  | Global.Budget | String | (empty) | [ ] |
  | Global.Channels | String | (empty) | [ ] |
  | Global.CurrentStep | String | (empty) | [ ] |
  | Global.Vertical | String | (empty) | [ ] |

### Create Topics

Reference: `/release/v5.5/agents/mpa/base/copilot/topics/MPA_Topics_Import.json`

#### Topic 1: Greeting
- [ ] Topics → + New topic → From blank
- [ ] Name: `Greeting`
- [ ] Trigger phrases:
  ```
  hello
  hi
  hey
  start
  help
  what can you do
  good morning
  good afternoon
  ```
- [ ] Add Message node with greeting text
- [ ] Save

#### Topic 2: Start Planning
- [ ] Topics → + New topic → From blank
- [ ] Name: `Start Planning`
- [ ] Trigger phrases:
  ```
  start planning
  new plan
  create plan
  begin planning
  start a media plan
  help me plan
  new media plan
  create a campaign
  ```
- [ ] Add Question node (multiple choice) for objective
- [ ] Set variable: Global.Objective
- [ ] Add flow action: MPA_InitializeSession (if available)
- [ ] Add follow-up message
- [ ] Save

#### Topic 3: Search Benchmarks
- [ ] Topics → + New topic → From blank
- [ ] Name: `Search Benchmarks`
- [ ] Trigger phrases:
  ```
  benchmark
  benchmarks
  what's a typical CPM
  average CPM
  industry average
  what should I expect
  typical performance
  CTR benchmark
  conversion rate benchmark
  cost per click
  ```
- [ ] Add Generative Answers node (SharePoint source)
- [ ] Add condition for no result → fallback message
- [ ] Save

#### Topic 4: Search Channels
- [ ] Topics → + New topic → From blank
- [ ] Name: `Search Channels`
- [ ] Trigger phrases:
  ```
  channel
  channels
  display advertising
  CTV
  connected TV
  paid social
  social media advertising
  paid search
  SEM
  programmatic
  which channels
  recommend channels
  ```
- [ ] Add Generative Answers node
- [ ] Add fallback message with channel overview
- [ ] Save

#### Topic 5: Generate Document
- [ ] Topics → + New topic → From blank
- [ ] Name: `Generate Document`
- [ ] Trigger phrases:
  ```
  generate document
  create document
  download plan
  export plan
  give me a document
  create my plan
  generate plan
  save plan
  download
  ```
- [ ] Add condition: check Global.Objective exists
- [ ] Add flow action: MPA_GenerateDocument (if available)
- [ ] Add success/fallback messages
- [ ] Save

#### Topic 6: Provide Feedback
- [ ] Topics → + New topic → From blank
- [ ] Name: `Provide Feedback`
- [ ] Trigger phrases:
  ```
  feedback
  rate
  helpful
  not helpful
  this was good
  this was bad
  great job
  needs improvement
  thanks
  thank you
  ```
- [ ] Add Question node for rating
- [ ] Add optional flow: MPA_CaptureFeedback
- [ ] Add thank you message
- [ ] Save

#### Topic 7: Fallback
- [ ] Topics → Find System Fallback topic → Edit
- [ ] Add Generative Answers node (SharePoint)
- [ ] Add fallback message with help menu
- [ ] Save

### Connect Flows (if deployed)

- [ ] **For each topic with flow action:**
  - [ ] Start Planning → MPA_InitializeSession
  - [ ] Generate Document → MPA_GenerateDocument
  - [ ] Provide Feedback → MPA_CaptureFeedback
  - Map inputs/outputs per COPILOT_STUDIO_MANUAL_STEPS.md

### Test Agent

- [ ] **Test Panel Validation**
  - [ ] Click Test (bottom right)
  - [ ] Test: "Hello" → Greeting response ✓/✗
  - [ ] Test: "What's a typical CPM for CTV?" → KB response with citation ✓/✗
  - [ ] Test: "Start planning" → Objective question ✓/✗
  - [ ] Test: "Tell me about display advertising" → Channel info ✓/✗
  - [ ] Test: Random gibberish → Fallback menu ✓/✗

- [ ] **All tests passing?** 
  - Yes → Continue to Publish
  - No → Fix issues, retest

### Publish Agent

- [ ] Click **Publish** (top right)
- [ ] Wait for publish to complete
- [ ] Verify "Published" indicator appears
- [ ] Note publish timestamp: ________________________

---

## CA AGENT BUILD (45-60 minutes)

### Create Agent

- [ ] **Create New Agent** (in separate solution or same)
  - Solution → + New → Agent → Copilot
  - Name: `Consulting Agent`
  - Description: `AI-powered strategic consulting assistant with 32+ frameworks for business analysis, competitive intelligence, market research, and strategic planning.`
  - Click Create

- [ ] **Configure Agent Settings**
  - Paste instructions from:
    ```
    /release/v5.5/agents/ca/extensions/mastercard/instructions/CA_Instructions_RAG_PRODUCTION.txt
    ```
  - Verify character count: _____ (< 8,000)
  - Save

### Connect Knowledge Base

- [ ] Add SharePoint → CA folder
- [ ] Verify file count: _____ files
- [ ] Wait for indexing

### Create Global Variables

| Variable | Type | Created? |
|----------|------|----------|
| Global.SessionID | String | [ ] |
| Global.AnalysisType | String | [ ] |
| Global.SelectedFramework | String | [ ] |
| Global.AnalysisDepth | String | [ ] |
| Global.Industry | String | [ ] |
| Global.AnalysisComplete | Boolean | [ ] |

### Create Topics

Reference: `/release/v5.5/agents/ca/base/copilot/topics/CA_Topics_Import.json`

- [ ] Topic 1: Greeting
- [ ] Topic 2: Start Analysis
- [ ] Topic 3: Select Framework
- [ ] Topic 4: Apply Framework
- [ ] Topic 5: Generate Report
- [ ] Topic 6: Benchmark Query
- [ ] Topic 7: Provide Feedback
- [ ] Topic 8: Fallback (system)

### Connect Flows

- [ ] CA_InitializeSession
- [ ] CA_SelectFramework
- [ ] CA_ApplyFramework
- [ ] CA_GenerateDocument
- [ ] CA_CaptureFeedback

### Test Agent

- [ ] "Hello" → Greeting ✓/✗
- [ ] "Tell me about SWOT" → Framework info ✓/✗
- [ ] "Start analysis" → Analysis type question ✓/✗
- [ ] Random input → Fallback ✓/✗

### Publish Agent

- [ ] Click Publish
- [ ] Verify published
- [ ] Timestamp: ________________________

---

## EXPORT SOLUTIONS (15 minutes)

### Export MPA Solution

- [ ] **Go to Power Apps → Solutions**
- [ ] Select `Kessel MPA` solution
- [ ] Click **Publish all customizations**
- [ ] Wait for completion
- [ ] Click **Export**

- [ ] **Export Unmanaged**
  - Version: `1.0.0.0`
  - Type: Unmanaged
  - Click Export
  - Download: `KesselMPA_1_0_0_0.zip`
  - Save to: `/release/v5.5/solutions/MPA/`

- [ ] **Export Managed**
  - Version: `1.0.0.0`
  - Type: Managed
  - Click Export
  - Download: `KesselMPA_1_0_0_0_managed.zip`
  - Save to: `/release/v5.5/solutions/MPA/`

### Export CA Solution

- [ ] Select `Kessel CA` solution
- [ ] Publish all customizations
- [ ] Export Unmanaged → `KesselCA_1_0_0_0.zip`
- [ ] Export Managed → `KesselCA_1_0_0_0_managed.zip`
- [ ] Save to: `/release/v5.5/solutions/CA/`

### Commit to Repository

```bash
cd /path/to/Kessel-Digital-Agent-Platform
git add release/v5.5/solutions/
git commit -m "Add exported solutions: MPA v1.0.0.0, CA v1.0.0.0"
git push origin deploy/mastercard
git checkout deploy/personal
git merge deploy/mastercard
git push origin deploy/personal
```

---

## POST-BUILD VALIDATION (15 minutes)

### Test Import to Different Environment

- [ ] Select a DIFFERENT environment (not dev)
- [ ] Run import script:
  ```powershell
  ./import-solution.ps1 -SolutionPath "./solutions/MPA/KesselMPA_1_0_0_0.zip" -Environment "personal"
  ```
- [ ] Complete manual steps (connections, env vars)
- [ ] Publish agent
- [ ] Test: "Hello" works ✓/✗
- [ ] Test: KB query works ✓/✗

### Document Results

- [ ] **Create Release Notes**
  
  File: `/release/v5.5/solutions/MPA/release-notes.md`
  ```markdown
  # MPA Solution v1.0.0.0
  
  **Built:** [Date]
  **Built By:** [Name]
  **Dev Environment:** [Environment name]
  
  ## Contents
  - 1 Agent (Media Planning Agent)
  - 7 Topics
  - 6 Global Variables
  - 4 Flows (if included)
  - 3 Connection References
  - 4 Environment Variables
  
  ## Testing Notes
  [Any issues encountered]
  
  ## Known Limitations
  [Any limitations]
  ```

- [ ] **Update CHANGELOG.md**

---

## COMPLETION CHECKLIST

### Files Created
- [ ] `/release/v5.5/solutions/MPA/KesselMPA_1_0_0_0.zip`
- [ ] `/release/v5.5/solutions/MPA/KesselMPA_1_0_0_0_managed.zip`
- [ ] `/release/v5.5/solutions/MPA/release-notes.md`
- [ ] `/release/v5.5/solutions/CA/KesselCA_1_0_0_0.zip`
- [ ] `/release/v5.5/solutions/CA/KesselCA_1_0_0_0_managed.zip`
- [ ] `/release/v5.5/solutions/CA/release-notes.md`
- [ ] `/release/v5.5/solutions/CHANGELOG.md`

### Git Operations
- [ ] All solution files committed
- [ ] Pushed to deploy/mastercard
- [ ] Merged to deploy/personal
- [ ] Both branches at same commit

### Validation
- [ ] MPA solution imports successfully
- [ ] CA solution imports successfully
- [ ] Agents respond to test queries after import
- [ ] KB queries return results with citations

---

## TROUBLESHOOTING

### "Knowledge source not showing files"
- Wait 5-10 minutes for indexing
- Verify SharePoint folder path is correct
- Check SharePoint permissions

### "Topic not triggering"
- Verify trigger phrases are saved
- Check for conflicting topics
- Test with exact trigger phrase

### "Flow connection error"
- Verify connection reference is mapped
- Re-authenticate the connection
- Check flow is enabled

### "Export fails"
- Publish all customizations first
- Check for validation errors in solution
- Try exporting individual components

---

## SESSION LOG

| Time | Action | Status | Notes |
|------|--------|--------|-------|
| | Started session | | |
| | Environment selected | | |
| | Prerequisites verified | | |
| | MPA solution created | | |
| | MPA agent created | | |
| | MPA KB connected | | |
| | MPA topics created | | |
| | MPA tested | | |
| | MPA published | | |
| | CA solution created | | |
| | CA agent created | | |
| | CA KB connected | | |
| | CA topics created | | |
| | CA tested | | |
| | CA published | | |
| | Solutions exported | | |
| | Committed to repo | | |
| | Import tested | | |
| | Session complete | | |

---

**End of Manual Build Checklist**
