# CLAUDE OVERNIGHT SUPPORT DOCUMENTS PROMPT

================================================================================
CRITICAL INSTRUCTIONS - READ FIRST
================================================================================

DO NOT use any memories, context, or information from previous conversations.
DO NOT reference any past work, prior sessions, or assumed knowledge.
DO NOT search for additional context or make assumptions.

This prompt contains ALL information you need. Execute exactly as specified.
Create all documents COMPLETELY - no placeholders, no "add more here" notes.

================================================================================
MISSION
================================================================================

Create 6 support documents for MPA v5.5 deployment. These documents support:
- Personal environment: Aragorn AI (Kessel-Digital) - deployment in progress
- Corporate environment: Mastercard - deployment starting this week

Output all files to: /mnt/user-data/outputs/

================================================================================
REFERENCE INFORMATION
================================================================================

PERSONAL ENVIRONMENT (ARAGORN AI):
- Tenant ID: 3933d83c-778f-4bf2-b5d7-1eea5844e9a3
- Tenant Name: kesseldigitalcom.onmicrosoft.com
- Dataverse URL: https://aragornai.crm.dynamics.com
- Dataverse API: https://aragornai.api.crm.dynamics.com/api/data/v9.2
- Environment ID: c672b470-9cc7-e9d8-a0e2-ca83751f800c
- SharePoint: https://kesseldigitalcom.sharepoint.com/sites/KesselDigital
- KB Library: MediaPlanningKB
- Azure Functions: https://func-aragorn-mpa.azurewebsites.net
- Copilot Studio: https://copilotstudio.microsoft.com/environments/c672b470-9cc7-e9d8-a0e2-ca83751f800c

MASTERCARD ENVIRONMENT (CORPORATE):
- All values use {PLACEHOLDER} format until configured
- Security features enabled by default (audit logging, row-level security, data firewall)
- External APIs disabled (web search, external data sources)
- Teams-only deployment channel
- Hierarchy-based access: Business Unit → Department → Team → Pod → Employee

MPA V5.5 COMPONENTS:
- 22 Knowledge Base files (all _v5_5.txt suffix)
- 12 Power Automate flows
- 12 Azure Functions
- 11 Dataverse tables (5 EAP + 6 MPA)
- Seed data: 794 benchmarks, 42 channels, 42 KPIs, 12 verticals, 24 feature flags
- Copilot instructions: 7,808 characters

REPO STRUCTURE:
- GitHub: https://github.com/kevcofett/Kessel-Digital-Agent-Platform
- Branch for personal: deploy/personal
- Branch for corporate: deploy/corporate
- Main deployment folder: release/v5.5/

================================================================================
DELIVERABLE 1: MASTERCARD PLACEHOLDER WORKSHEET
================================================================================

Filename: MPA_Mastercard_Placeholder_Worksheet.md

Create a structured worksheet listing EVERY placeholder value needed for Mastercard deployment.

FORMAT:
```markdown
# MASTERCARD DEPLOYMENT PLACEHOLDER WORKSHEET

## Instructions
Fill in each value below before starting deployment. All values are REQUIRED unless marked (Optional).

## How to Find Each Value
[Include specific instructions for where to find each value in Azure/Power Platform portals]

---

## SECTION 1: AZURE AD / TENANT
| Placeholder | Value | Where to Find |
|-------------|-------|---------------|
| {MASTERCARD_TENANT_ID} | ________________ | Azure Portal > Azure Active Directory > Overview > Tenant ID |
| {MASTERCARD_TENANT_NAME} | ________________ | Azure Portal > Azure AD > Overview > Primary domain (without .onmicrosoft.com) |

## SECTION 2: DATAVERSE
[Continue with all Dataverse placeholders]

## SECTION 3: SHAREPOINT
[Continue with all SharePoint placeholders]

## SECTION 4: AZURE FUNCTIONS
[Continue with all Azure Function placeholders]

## SECTION 5: COPILOT STUDIO
[Continue with all Copilot placeholders]

## SECTION 6: TEAMS (If deploying to Teams)
[Continue with Teams placeholders]

## SECTION 7: MONITORING
[Continue with monitoring placeholders]

## SECTION 8: SECURITY CONFIGURATION
[Any security-specific values]

---

## VALIDATION CHECKLIST
[ ] All placeholder values filled in
[ ] Tenant ID format verified (GUID)
[ ] URLs tested and accessible
[ ] App registration created with correct permissions
[ ] SharePoint site exists
[ ] Resource group exists in Azure
```

Include ALL placeholders from the environment.mastercard.json template. Be thorough - missing a placeholder will block deployment.

================================================================================
DELIVERABLE 2: POST-DEPLOYMENT TEST SUITE
================================================================================

Filename: MPA_Post_Deployment_Test_Suite.md

Create a comprehensive test suite with specific test cases, expected results, and pass/fail criteria.

STRUCTURE:
```markdown
# MPA V5.5 POST-DEPLOYMENT TEST SUITE

## Overview
This test suite validates MPA v5.5 deployment. Run all tests in order.
Estimated time: 45-60 minutes

## Prerequisites
- [ ] All deployment phases complete
- [ ] Copilot agent published
- [ ] SharePoint KB indexed (wait 1-4 hours after upload)

---

## SECTION 1: INFRASTRUCTURE TESTS

### Test 1.1: Azure Functions Health
**Action:** [exact curl command or steps]
**Expected Result:** [exact expected response]
**Pass Criteria:** [specific criteria]
**If Fails:** [troubleshooting steps]

### Test 1.2: Dataverse Connectivity
[Continue pattern]

### Test 1.3: SharePoint KB Access
[Continue pattern]

---

## SECTION 2: AGENT CONVERSATION TESTS

### Test 2.1: Version Verification
**Prompt:** "What version of the Media Planning Agent is this?"
**Expected Response Should Include:** Reference to v5.5 or January 2026
**Pass Criteria:** Agent acknowledges current version
**If Fails:** Check Copilot instructions were updated

### Test 2.2: KB Access Verification
**Prompt:** "Describe your measurement philosophy in detail"
**Expected Response Should Include:** 
- Incrementality-first approach
- LTV governs CAC
- ROAS skepticism
**Pass Criteria:** References specific KB content
**If Fails:** Check SharePoint KB connection, verify indexing complete

### Test 2.3: Workflow Initiation
**Prompt:** "Help me create a media plan for a retail brand with a $500K quarterly budget"
**Expected Response Should Include:**
- GUIDED workflow initiation
- Questions about objectives, audience, timeline
- Strategic advisory tone (not transactional)
**Pass Criteria:** Enters planning workflow correctly
**If Fails:** Check flow connections

[Continue with 15-20 total conversation tests covering:]
- Gap analysis functionality
- Benchmark lookups
- Budget allocation
- Channel recommendations
- Document generation
- Session management
- Error handling

---

## SECTION 3: FLOW EXECUTION TESTS

### Test 3.1: Create Session Flow
**Trigger:** Start new conversation with agent
**Expected:** Session record created in Dataverse
**Verification:** Query eap_sessions table for new record
**Pass Criteria:** Record exists with correct agent_code, user_id

[Continue for each critical flow]

---

## SECTION 4: SECURITY TESTS (CORPORATE ONLY)

### Test 4.1: Audit Logging
**Action:** Perform any agent interaction
**Expected:** Audit record created
**Verification:** Check audit table

### Test 4.2: Feature Flag Enforcement
**Action:** Attempt web search (should be disabled)
**Expected:** Graceful fallback message
**Pass Criteria:** No external API calls made

[Continue for row-level security, data firewall, etc.]

---

## SECTION 5: EDGE CASES & ERROR HANDLING

### Test 5.1: Invalid Input Handling
### Test 5.2: Session Timeout
### Test 5.3: Missing Data Graceful Degradation

---

## TEST RESULTS SUMMARY

| Section | Tests | Passed | Failed | Blocked |
|---------|-------|--------|--------|---------|
| Infrastructure | X | | | |
| Conversation | X | | | |
| Flow Execution | X | | | |
| Security | X | | | |
| Edge Cases | X | | | |
| **TOTAL** | **X** | | | |

## SIGN-OFF
- [ ] All critical tests passed
- [ ] Known issues documented
- [ ] Ready for user acceptance testing

Tested by: ________________
Date: ________________
Environment: [ ] Personal [ ] Corporate
```

Include at least 25 total test cases across all sections.

================================================================================
DELIVERABLE 3: VS CODE CONTINUATION PROMPT
================================================================================

Filename: VSCODE_Continuation_Prompt.md

Create a prompt for VS Code Claude to continue if the overnight run was interrupted or incomplete.

```markdown
# VS CODE CLAUDE: CONTINUATION PROMPT - MPA V5.5 DEPLOYMENT

================================================================================
CRITICAL INSTRUCTIONS
================================================================================

DO NOT use memories or prior context. Start fresh.
DO NOT repeat work that is already complete.
READ STATUS FILES FIRST to understand current state.

================================================================================
SITUATION
================================================================================

An overnight deployment verification run may have been interrupted or incomplete.
Your job is to:
1. Assess what was completed
2. Complete any remaining work
3. Push all changes to git

================================================================================
STEP 1: READ EXISTING STATUS FILES
================================================================================

Check if these files exist and read them:

```bash
ls -la /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment-status/
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/deployment-status/*.md 2>/dev/null
cat /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/OVERNIGHT_EXECUTION_SUMMARY.md 2>/dev/null
```

================================================================================
STEP 2: DETERMINE COMPLETION STATE
================================================================================

Based on files found, determine which phases completed:

| Phase | Status File | If Missing |
|-------|-------------|------------|
| 1-2 | DATAVERSE_TABLE_STATUS.md | Run Phases 1-2 |
| 3 | AZURE_FUNCTIONS_STATUS.md | Run Phase 3 |
| 4 | SHAREPOINT_KB_STATUS.md | Run Phase 4 |
| 5 | POWER_AUTOMATE_STATUS.md | Run Phase 5 |
| 6 | COPILOT_STUDIO_STATUS.md | Run Phase 6 |
| 7 | DEPLOYMENT_SUMMARY.md | Run Phase 7 |
| 8 | Check git log | Run Phase 8 if not pushed |
| 9-11 | TRANSFER_VERIFICATION.md | Run Phases 9-11 |
| 12 | Check main branch | Run Phase 12 if not merged |
| 13 | OVERNIGHT_EXECUTION_SUMMARY.md | Run Phase 13 |

================================================================================
STEP 3: EXECUTE REMAINING PHASES
================================================================================

Refer to the original prompt for phase details:
/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/prompts/VSCODE_OVERNIGHT_COMPLETE_DEPLOYMENT.md

Execute ONLY the phases that are incomplete.

================================================================================
STEP 4: GIT STATUS CHECK
================================================================================

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git status
git log --oneline -5
git branch -vv
```

If uncommitted changes exist, commit and push.
If main branch not updated, merge and push.

================================================================================
STEP 5: FINAL REPORT
================================================================================

Create or update OVERNIGHT_EXECUTION_SUMMARY.md with:
- What was already complete when you started
- What you completed in this session
- Current deployment status
- Any remaining issues

================================================================================
ENVIRONMENT REFERENCE
================================================================================

[Include all environment details from main prompt]

================================================================================
```

================================================================================
DELIVERABLE 4: CA AGENT ROADMAP & STARTER PROMPT
================================================================================

Filename: CA_Agent_Roadmap_and_Starter.md

Create a planning document for Consulting Agent development (~1 month after MPA).

```markdown
# CONSULTING AGENT (CA) ROADMAP & DEVELOPMENT PLAN

## Overview
The Consulting Agent extends the platform beyond media planning to general strategic consulting. It shares the EAP platform infrastructure with MPA but has its own knowledge base, flows, and capabilities.

## Timeline
- MPA v5.5 deployed: January 2026
- CA development start: ~February 2026
- CA target deployment: ~March 2026

---

## PHASE 1: REQUIREMENTS & SCOPE

### Core Capabilities
[Define what CA should do - strategic consulting, proposal generation, competitive analysis, etc.]

### Differentiation from MPA
| Aspect | MPA | CA |
|--------|-----|-----|
| Primary Focus | Media planning | Strategic consulting |
| KB Content | Media/advertising | Business strategy |
| Output Documents | Media plans | Proposals, analyses |
| ... | ... | ... |

### Shared vs Unique Components
**Shared (EAP Platform):**
- Session management
- User management
- Feature flags
- Authentication

**Unique to CA:**
- CA-specific KB files
- CA-specific flows
- CA-specific document templates

---

## PHASE 2: KNOWLEDGE BASE DESIGN

### Proposed KB Files
[List 15-20 planned KB files with descriptions]

### KB Structure
[How files will be organized]

---

## PHASE 3: FLOW DESIGN

### Required Flows
[List flows CA will need]

### Shared Flows
[Flows shared with MPA via EAP]

---

## PHASE 4: DEVELOPMENT TASKS

### Task Breakdown
| Task | Effort | Dependencies |
|------|--------|--------------|
| ... | ... | ... |

---

## VS CODE STARTER PROMPT

[Include a ready-to-use prompt for VS Code Claude to begin CA development when the time comes]
```

================================================================================
DELIVERABLE 5: MASTERCARD CORPORATE EXTENSIONS TEMPLATE
================================================================================

Filename: Mastercard_Corporate_Extensions_Guide.md

Create documentation and JSON schema stubs for Mastercard-specific extensions.

```markdown
# MASTERCARD CORPORATE EXTENSIONS GUIDE

## Overview
Extensions are Mastercard-specific customizations that live in /extensions/ folders.
They AUGMENT base functionality - they never override or modify /base/ content.

## Extension Locations

```
release/v5.5/
├── platform/
│   ├── eap-core/
│   │   └── extensions/           ← Platform extensions
│   │       ├── access_control/   ← Hierarchy tables
│   │       ├── data_sources/     ← Confluence, internal systems
│   │       └── audit/            ← Enhanced audit logging
│   └── security/
│       └── extensions/           ← Security extensions
│           └── data_classification/
└── agents/
    └── mpa/
        └── extensions/           ← MPA-specific extensions
            ├── benchmarks/       ← Mastercard-specific benchmarks
            └── templates/        ← Mastercard document templates
```

---

## EXTENSION 1: ACCESS CONTROL HIERARCHY

### Purpose
Implement Business Unit → Department → Team → Pod → Employee hierarchy for row-level security.

### Tables to Create

#### eap_businessunit
[Full schema definition]

#### eap_department
[Full schema definition]

#### eap_team
[Full schema definition]

#### eap_pod
[Full schema definition]

### Relationships
[Diagram or description of relationships]

### Implementation Flow
[Flow to check user permissions]

---

## EXTENSION 2: CONFLUENCE DATA SOURCE

### Purpose
Allow CA/MPA to reference Confluence content as knowledge source.

### Connector Schema
[JSON schema for connector configuration]

### Implementation Notes
[How to integrate with Copilot Studio]

---

## EXTENSION 3: DATA CLASSIFICATION

### Purpose
Require classification labels on all records.

### Classification Levels
- Public
- Internal
- Confidential
- Restricted

### Schema Addition
[Fields to add to existing tables]

---

## EXTENSION 4: ENHANCED AUDIT LOGGING

### Purpose
Extended audit trail beyond base EAP audit.

### Additional Fields
[What extra data to capture]

### Retention Policy
[90-day retention implementation]

---

## CREATING NEW EXTENSIONS

### Step-by-Step
1. Create folder in appropriate /extensions/ location
2. Create schema JSON files
3. Create any required flows
4. Update documentation
5. Commit to deploy/corporate branch only

### Naming Convention
- Tables: eap_mc_[name] or mpa_mc_[name] (mc = Mastercard)
- Flows: [Agent] - MC - [Flow Name]
- Files: [name]_mastercard.json

### Testing Extensions
[How to test without affecting base]
```

Include complete JSON schemas for at least the access control hierarchy tables.

================================================================================
DELIVERABLE 6: MPA TRAINING CONVERSATION EXAMPLES
================================================================================

Filename: MPA_Training_Conversation_Examples.md

Create sample conversations demonstrating MPA capabilities for demos and training.

```markdown
# MPA V5.5 TRAINING CONVERSATION EXAMPLES

## Purpose
These example conversations demonstrate MPA capabilities for:
- Stakeholder demos
- User training
- Capability documentation

---

## EXAMPLE 1: NEW MEDIA PLAN - RETAIL BRAND

### Scenario
Marketing manager at a retail company needs a Q2 media plan with $750K budget.

### Conversation

**User:** Hi, I need help creating a media plan for our spring campaign.

**MPA:** [Expected response - welcoming, asks clarifying questions about objectives, audience, timeline]

**User:** We're a mid-size retail brand launching a new product line. Budget is $750K for Q2. Main goal is driving online sales but we also want to build awareness.

**MPA:** [Expected response - acknowledges dual objectives, asks about audience, competitive context]

[Continue full conversation through:]
- Audience definition
- Channel recommendations with benchmarks
- Budget allocation
- Timeline/pacing
- Measurement framework
- Gap analysis
- Final plan summary

### Key Capabilities Demonstrated
- [ ] GUIDED workflow
- [ ] Benchmark lookup
- [ ] Budget optimization
- [ ] Channel recommendations
- [ ] Strategic advisory tone

---

## EXAMPLE 2: PLAN AUDIT - EXISTING CAMPAIGN

### Scenario
User wants MPA to review an existing media plan and identify gaps.

[Full conversation]

---

## EXAMPLE 3: BENCHMARK RESEARCH

### Scenario
User wants industry benchmarks for specific channels/verticals.

[Full conversation]

---

## EXAMPLE 4: BUDGET REALLOCATION

### Scenario
Mid-campaign budget change requires reallocation.

[Full conversation]

---

## EXAMPLE 5: MEASUREMENT PHILOSOPHY DISCUSSION

### Scenario
User asks about incrementality vs ROAS.

[Full conversation demonstrating KB content about measurement philosophy]

---

## EXAMPLE 6: CHANNEL MIX OPTIMIZATION

### Scenario
User has channel performance data and wants optimization recommendations.

[Full conversation]

---

## EXAMPLE 7: RETAIL MEDIA NETWORKS

### Scenario
User asks about RMN strategy for CPG brand.

[Full conversation demonstrating RETAIL_MEDIA_NETWORKS KB content]

---

## EXAMPLE 8: SESSION RESUME

### Scenario
User returns to continue previous planning session.

[Full conversation showing session resume capability]

---

## EXAMPLE 9: ERROR HANDLING

### Scenario
User provides incomplete or invalid information.

[Full conversation showing graceful error handling]

---

## EXAMPLE 10: DOCUMENT GENERATION

### Scenario
User requests formal media plan document.

[Full conversation through document generation]

---

## QUICK REFERENCE: DEMO PROMPTS

For quick demos, use these prompts:

| Capability | Prompt |
|------------|--------|
| Version check | "What version are you?" |
| Philosophy | "What's your approach to measurement?" |
| Quick plan | "Create a $500K Q1 plan for a DTC brand" |
| Benchmarks | "What are typical CPMs for paid social in retail?" |
| Gap analysis | "Review this plan: [paste plan]" |
| Channel mix | "Should I invest more in CTV or paid search?" |

---

## ANTI-PATTERNS TO AVOID IN DEMOS

Things that may not work well or showcase limitations:
- [List things to avoid in demos]
```

Include at least 10 complete conversation examples with realistic back-and-forth.

================================================================================
EXECUTION INSTRUCTIONS
================================================================================

1. Create all 6 files COMPLETELY - no stubs, no "add more here" placeholders
2. Each file should be production-ready and immediately usable
3. Save all files to /mnt/user-data/outputs/
4. After creating all files, list them with file sizes to confirm completion

================================================================================
OUTPUT CONFIRMATION
================================================================================

After completing all deliverables, provide:

```
DELIVERABLES COMPLETE
=====================
1. MPA_Mastercard_Placeholder_Worksheet.md - [X] bytes
2. MPA_Post_Deployment_Test_Suite.md - [X] bytes
3. VSCODE_Continuation_Prompt.md - [X] bytes
4. CA_Agent_Roadmap_and_Starter.md - [X] bytes
5. Mastercard_Corporate_Extensions_Guide.md - [X] bytes
6. MPA_Training_Conversation_Examples.md - [X] bytes

All files saved to /mnt/user-data/outputs/
```

================================================================================
END OF PROMPT
================================================================================
