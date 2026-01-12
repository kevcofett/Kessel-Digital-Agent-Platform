# MASTERCARD BRANCH PREPARATION
# Microsoft Stack Configuration for Corporate Deployment

**Purpose:** Prepare deploy/mastercard branch with Microsoft/Copilot Studio integrations enabled and Claude disabled
**Target Environment:** Mastercard corporate infrastructure

---

## OVERVIEW: BRANCH DIFFERENCES

| Component | deploy/personal (Aragorn AI) | deploy/mastercard (Mastercard) |
|-----------|------------------------------|--------------------------------|
| **LLM Provider** | Claude API | Azure OpenAI |
| **Embedding Provider** | OpenAI API | Azure OpenAI Embeddings |
| **Orchestration** | Direct API calls | Copilot Studio |
| **KB Storage** | Local filesystem | SharePoint |
| **Session Storage** | Local JSON | Dataverse |
| **Impact Tracking** | Local JSON | Dataverse |
| **Workflows** | Node.js scripts | Power Automate |
| **Auth** | API keys | Azure AD / Entra ID |
| **Instructions Format** | Unlimited | 8,000 char limit |
| **KB Format** | Markdown allowed | 6-Rule Compliance required |

---

## PREPARATION CHECKLIST

### Phase A: Copilot Studio Agent Instructions
- [ ] A1: MPA Copilot Studio Instructions (8K char compliant)
- [ ] A2: CA Copilot Studio Instructions (8K char compliant)
- [ ] A3: EAP Copilot Studio Instructions (8K char compliant)
- [ ] A4: Instructions validation script

### Phase B: SharePoint KB Configuration
- [ ] B1: KB document compliance validator
- [ ] B2: SharePoint folder structure definition
- [ ] B3: KB upload automation script
- [ ] B4: Document metadata schema

### Phase C: Dataverse Table Definitions
- [ ] C1: Session management tables
- [ ] C2: Reference data tables (verticals, KPIs, channels, benchmarks)
- [ ] C3: KB impact tracking tables
- [ ] C4: Table creation scripts (Power Platform CLI)

### Phase D: Power Automate Flows
- [ ] D1: Session initialization flow
- [ ] D2: KB retrieval flow
- [ ] D3: Response generation flow
- [ ] D4: Impact tracking flow
- [ ] D5: Flow export definitions (JSON)

### Phase E: Environment Toggle System
- [ ] E1: Provider toggle configuration
- [ ] E2: Feature flags for Microsoft vs Claude
- [ ] E3: Conditional imports/exports
- [ ] E4: Build-time environment switching

### Phase F: Azure Configuration
- [ ] F1: Azure OpenAI deployment specs
- [ ] F2: Azure AD app registration guide
- [ ] F3: Key Vault secrets mapping
- [ ] F4: Environment variables template

---

## DOCUMENTS TO CREATE

I need to create the following documents for the Mastercard branch:

### 1. COPILOT_STUDIO_INSTRUCTIONS/ (Directory)
```
COPILOT_STUDIO_INSTRUCTIONS/
├── MPA_Copilot_Instructions_PRODUCTION.txt    # 8K char compliant
├── CA_Copilot_Instructions_PRODUCTION.txt     # 8K char compliant
├── EAP_Copilot_Instructions_PRODUCTION.txt    # 8K char compliant
├── INSTRUCTIONS_VALIDATION.md                  # How to validate
└── INSTRUCTIONS_TEMPLATE.md                    # Template for new agents
```

### 2. SHAREPOINT_KB_CONFIG/ (Directory)
```
SHAREPOINT_KB_CONFIG/
├── FOLDER_STRUCTURE.md                        # SharePoint library structure
├── COMPLIANCE_CHECKLIST.md                    # 6-Rule validation
├── UPLOAD_AUTOMATION.ps1                      # PowerShell upload script
├── METADATA_SCHEMA.json                       # Document metadata
└── KB_MANIFEST.json                           # List of all KB docs per agent
```

### 3. DATAVERSE_SCHEMA/ (Directory)
```
DATAVERSE_SCHEMA/
├── TABLES/
│   ├── cr_agentsessions.xml                   # Session table definition
│   ├── cr_kbdocuments.xml                     # KB documents table
│   ├── cr_kbusagerecords.xml                  # Usage tracking
│   ├── cr_kbdocumentimpacts.xml               # Impact scores
│   ├── cr_kbupdateproposals.xml               # Update proposals
│   ├── cr_verticals.xml                       # Reference: verticals
│   ├── cr_kpis.xml                            # Reference: KPIs
│   ├── cr_channels.xml                        # Reference: channels
│   └── cr_benchmarks.xml                      # Reference: benchmarks
├── SEED_DATA/
│   ├── verticals_seed.csv
│   ├── kpis_seed.csv
│   ├── channels_seed.csv
│   └── benchmarks_seed.csv
├── IMPORT_SCRIPT.ps1                          # PAC CLI import
└── SCHEMA_DOCUMENTATION.md
```

### 4. POWER_AUTOMATE_FLOWS/ (Directory)
```
POWER_AUTOMATE_FLOWS/
├── MPA/
│   ├── MPA_Session_Initialize.json
│   ├── MPA_KB_Retrieve.json
│   ├── MPA_Generate_Response.json
│   └── MPA_Track_Impact.json
├── CA/
│   ├── CA_Session_Initialize.json
│   ├── CA_KB_Retrieve.json
│   └── CA_Generate_Response.json
├── EAP/
│   ├── EAP_Session_Initialize.json
│   └── EAP_KB_Retrieve.json
├── SHARED/
│   ├── Common_Error_Handler.json
│   └── Common_Logging.json
└── DEPLOYMENT_GUIDE.md
```

### 5. AZURE_CONFIG/ (Directory)
```
AZURE_CONFIG/
├── AZURE_OPENAI_DEPLOYMENT.md                 # Model deployment guide
├── AZURE_AD_APP_REGISTRATION.md               # Auth setup
├── KEY_VAULT_SECRETS.md                       # Secrets mapping
├── ENV_TEMPLATE.mastercard.env                # Environment variables
└── RESOURCE_REQUIREMENTS.md                   # Azure resources needed
```

### 6. ENVIRONMENT_TOGGLE/ (Directory)
```
ENVIRONMENT_TOGGLE/
├── TOGGLE_SYSTEM.md                           # How the toggle works
├── provider-switch.ts                         # Runtime provider switching
├── feature-flags.ts                           # Feature flag definitions
├── build-config.ts                            # Build-time configuration
└── MIGRATION_GUIDE.md                         # Moving between environments
```

---

## KEY CONFIGURATION FILES TO MODIFY

### 1. packages/agent-core/config/environment.mastercard.json

Already created in Phase 5, but needs additional Copilot Studio settings:

```json
{
  "type": "corporate",
  "name": "mastercard",
  
  "orchestration": {
    "type": "copilot-studio",
    "environmentUrl": "$COPILOT_STUDIO_ENV_URL",
    "botId": "$COPILOT_STUDIO_BOT_ID",
    "tenantId": "$AZURE_TENANT_ID"
  },
  
  "llm": {
    "type": "azure-openai",
    "provider": "copilot-studio-passthrough",
    "fallback": "azure-openai-direct"
  },
  
  "kb": {
    "type": "sharepoint",
    "siteUrl": "$SHAREPOINT_SITE_URL",
    "libraryName": "AgentKnowledgeBase",
    "indexType": "azure-ai-search"
  },
  
  "features": {
    "useCopilotStudio": true,
    "useClaudeAPI": false,
    "useSharePointKB": true,
    "useDataverseStorage": true,
    "usePowerAutomateFlows": true
  }
}
```

### 2. Conditional Provider Loading

```typescript
// packages/agent-core/src/config/provider-loader.ts

export async function loadProviders(config: EnvironmentConfig) {
  if (config.features.useCopilotStudio) {
    // Microsoft stack
    return {
      llm: await loadCopilotStudioLLM(config),
      embedding: await loadAzureOpenAIEmbedding(config),
      storage: await loadDataverseStorage(config),
      kb: await loadSharePointKB(config),
    };
  } else {
    // Claude stack
    return {
      llm: await loadClaudeLLM(config),
      embedding: await loadOpenAIEmbedding(config),
      storage: await loadLocalStorage(config),
      kb: await loadLocalKB(config),
    };
  }
}
```

---

## COPILOT STUDIO INSTRUCTIONS FORMAT

The Copilot Studio instructions have specific requirements:

### Constraints
- **Character Limit:** 8,000 characters maximum
- **No Markdown:** Plain text only
- **No Special Characters:** ASCII only
- **No Tables:** Use lists instead
- **No Code Blocks:** Describe logic in prose

### Structure Template

```
AGENT NAME AND PURPOSE
[2-3 sentences describing the agent]

CORE CAPABILITIES
[List of what the agent can do]

INTERACTION GUIDELINES
[How to interact with users]

KNOWLEDGE BASE USAGE
[How to use the KB documents]

STEP-BY-STEP FRAMEWORK
[The main workflow steps]

RESPONSE FORMATTING
[How to format responses]

LIMITATIONS AND BOUNDARIES
[What the agent should not do]
```

---

## BRANCH-SPECIFIC FILES

### Files ONLY in deploy/personal:
- Claude API integration code
- OpenAI direct embedding code
- Local filesystem storage
- Development/testing utilities

### Files ONLY in deploy/mastercard:
- Copilot Studio integration
- Azure OpenAI passthrough
- SharePoint KB connector
- Dataverse storage
- Power Automate flow definitions
- Azure configuration templates

### Files in BOTH branches (with different configs):
- Environment configuration files
- Provider factory (loads different providers)
- Agent configurations (same structure, different values)
- KB documents (same content, different format/location)

---

## MIGRATION WORKFLOW

### To Deploy to Mastercard:

1. **Checkout mastercard branch**
   ```bash
   git checkout deploy/mastercard
   ```

2. **Set environment variables**
   ```bash
   source .env.mastercard
   ```

3. **Deploy Dataverse tables**
   ```bash
   pac solution import --path ./DATAVERSE_SCHEMA/solution.zip
   ```

4. **Upload KB to SharePoint**
   ```bash
   ./SHAREPOINT_KB_CONFIG/UPLOAD_AUTOMATION.ps1
   ```

5. **Deploy Power Automate flows**
   ```bash
   pac flow push --environment $ENVIRONMENT_ID
   ```

6. **Configure Copilot Studio**
   - Import agent definition
   - Paste instructions
   - Connect to flows
   - Publish

---

## NEXT STEPS FOR ME TO PREPARE

I need to create these documents in order:

1. **PHASE_6_COPILOT_INSTRUCTIONS.md** - Create 8K-compliant instructions for all 3 agents
2. **PHASE_7_SHAREPOINT_KB_CONFIG.md** - SharePoint folder structure and upload automation
3. **PHASE_8_DATAVERSE_SCHEMA.md** - Complete table definitions and seed data
4. **PHASE_9_POWER_AUTOMATE_FLOWS.md** - Flow definitions for each agent
5. **PHASE_10_AZURE_CONFIG.md** - Azure resource configuration
6. **PHASE_11_ENVIRONMENT_TOGGLE.md** - Runtime switching between stacks

Shall I proceed with creating these additional phases?
