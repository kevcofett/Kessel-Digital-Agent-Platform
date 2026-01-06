# MASTERCARD TRANSFER PACKAGE - DEPLOYMENT INSTRUCTIONS

================================================================================
VERSION: 5.5
CREATED: January 2026
SOURCE: Kessel-Digital-Agent-Platform
================================================================================

## OVERVIEW

This transfer package contains everything needed to deploy MPA v5.5 to the
Mastercard corporate environment. The package is designed to be transferred
to a machine behind the Mastercard firewall and deployed independently.

================================================================================
TRANSFER METHODS
================================================================================

### OPTION 1: GIT CLONE (RECOMMENDED)

If Mastercard GitHub Enterprise allows external repo access:

```bash
git clone https://github.com/kevcofett/Kessel-Digital-Agent-Platform.git Mastercard-Agent-Platform
cd Mastercard-Agent-Platform
git checkout deploy/corporate
```

Then find/replace: `Kessel-Digital` → `Mastercard`

### OPTION 2: ZIP TRANSFER

If no external repo access:

1. On personal machine:
```bash
cd /Users/kevinbauer/Kessel-Digital
zip -r MPA_v55_Transfer_Package.zip Kessel-Digital-Agent-Platform/release/v5.5/
```

2. Transfer ZIP via approved secure method
3. Extract on Mastercard machine
4. Initialize new repo:
```bash
unzip MPA_v55_Transfer_Package.zip
mv Kessel-Digital-Agent-Platform Mastercard-Agent-Platform
cd Mastercard-Agent-Platform
git init
git add -A
git commit -m "Initial MPA v5.5 for Mastercard"
git remote add origin {MASTERCARD_GITHUB_REPO_URL}
git push -u origin main
```

================================================================================
PACKAGE CONTENTS
================================================================================

```
release/v5.5/
├── platform/
│   ├── config/
│   │   ├── environment.template.json      # Template with placeholders
│   │   ├── feature_flags.template.json    # Feature flag template
│   │   └── feature_flags.csv              # All flags with both profiles
│   ├── eap-core/
│   │   ├── base/
│   │   │   ├── schema/tables/             # 5 EAP table schemas
│   │   │   ├── flows/                     # EAP initialize session flow
│   │   │   └── interfaces/                # 4 interface contracts
│   │   └── extensions/                    # Empty - for corporate additions
│   └── security/
│       ├── base/
│       │   └── security_roles.template.json
│       └── extensions/                    # Empty - for corporate additions
│
├── agents/mpa/
│   ├── base/
│   │   ├── kb/                            # 22 knowledge base files
│   │   ├── copilot/                       # Agent instructions (7,808 chars)
│   │   ├── flows/                         # 22 flow definitions
│   │   ├── functions/                     # 12 Azure functions
│   │   ├── schema/                        # MPA table schemas
│   │   ├── data/seed/                     # 4 seed data CSVs
│   │   ├── cards/                         # 6 adaptive cards
│   │   ├── templates/                     # Document templates
│   │   └── docs/                          # 18 deployment docs
│   └── extensions/                        # Empty - for corporate additions
│
├── docs/                                  # Platform documentation
├── corporate-deployment-docs/             # 11 corporate-specific guides
├── transfer-packages/mastercard/          # This package
│   ├── environment.mastercard.json        # Pre-configured for corporate
│   ├── feature_flags_corporate.csv        # Corporate default flags
│   └── TRANSFER_INSTRUCTIONS.md           # This file
└── scripts/                               # Deployment automation
```

================================================================================
PRE-DEPLOYMENT CHECKLIST
================================================================================

Before starting deployment, gather these Mastercard-specific values:

AZURE AD / AUTHENTICATION:
[ ] Mastercard Tenant ID
[ ] Mastercard Tenant Name
[ ] App Registration Client ID
[ ] Teams App ID (if deploying to Teams)

DATAVERSE:
[ ] Dataverse Environment URL (e.g., https://mastercard-xyz.crm.dynamics.com)
[ ] Dataverse Environment ID
[ ] Dataverse Organization ID

SHAREPOINT:
[ ] SharePoint Site URL for KB files
[ ] Permission to create document libraries

AZURE (IF DEPLOYING FUNCTIONS):
[ ] Azure Subscription ID
[ ] Resource Group name
[ ] Function App name
[ ] Storage Account name

CONFLUENCE (IF INTEGRATING):
[ ] Confluence Base URL
[ ] Space Keys to index

================================================================================
DEPLOYMENT SEQUENCE
================================================================================

PHASE 1: ENVIRONMENT SETUP (1 hour)
1. Copy environment.mastercard.json to environment.json
2. Replace all {PLACEHOLDER} values
3. Verify Azure AD app registration
4. Verify Power Platform environment access

PHASE 2: DATAVERSE TABLES (30 min)
1. Create EAP tables from platform/eap-core/base/schema/tables/
2. Create MPA tables from agents/mpa/base/schema/
3. Import feature flags from feature_flags_corporate.csv
4. Import seed data from agents/mpa/base/data/seed/

PHASE 3: AZURE FUNCTIONS (2 hours)
1. Create Function App in Azure
2. Deploy functions from agents/mpa/base/functions/
3. Configure connection strings
4. Test health endpoint

PHASE 4: SHAREPOINT KB (15 min + indexing)
1. Create MediaPlanningKB document library
2. Upload 22 files from agents/mpa/base/kb/
3. Wait for indexing (1-4 hours)

PHASE 5: POWER AUTOMATE FLOWS (2-3 hours)
1. Create flows from agents/mpa/base/flows/definitions/
2. Configure Dataverse connections
3. Configure HTTP actions for Azure Functions
4. Test each flow

PHASE 6: COPILOT STUDIO AGENT (30 min)
1. Create new agent in Copilot Studio
2. Paste instructions from agents/mpa/base/copilot/MPA_v55_Instructions_Uplift.txt
3. Add SharePoint KB as knowledge source
4. Add flow actions
5. Configure Teams channel

PHASE 7: TEAMS DEPLOYMENT (30 min)
1. Create Teams app manifest
2. Upload to Teams Admin Center
3. Configure app policies
4. Deploy to pilot users

PHASE 8: VALIDATION (1 hour)
1. Run test prompts
2. Verify flow execution
3. Check audit logging
4. Verify row-level security

================================================================================
CORPORATE-SPECIFIC CONFIGURATIONS
================================================================================

FEATURE FLAGS (SECURITY DEFAULTS):
- mpa_enable_web_search: FALSE (no external searches)
- mpa_enable_external_api: FALSE (no external APIs)
- sec_enable_audit_logging: TRUE (all actions logged)
- sec_enable_row_level_security: TRUE (hierarchy-based access)
- sec_enable_data_firewall: TRUE (block external transmission)
- ui_show_debug_info: FALSE (hide debug info)

ACCESS CONTROL HIERARCHY:
Business Unit → Department → Team → Pod → Employee

DATA CLASSIFICATION:
- All records require classification
- Options: Public, Internal, Confidential, Restricted
- Defaults to Internal if not specified

AUDIT LOGGING:
- All user actions logged
- Retention: 90 days
- Fields: user_id, action, timestamp, record_id, before_value, after_value

================================================================================
EXTENSIONS FOLDER USAGE
================================================================================

The /extensions/ folders are empty in the base package. Use them for
Mastercard-specific additions that should NOT flow back to the base:

EXAMPLES:
- /platform/eap-core/extensions/access_control/
  - eap_business_unit.json
  - eap_department.json
  - eap_get_user_permissions.json (flow)

- /platform/eap-core/extensions/data_sources/
  - confluence_connector.json
  - sharepoint_connector.json

- /agents/mpa/extensions/
  - mastercard_vertical_benchmarks.csv
  - mastercard_kpi_definitions.csv

================================================================================
SUPPORT
================================================================================

For deployment assistance:
- Platform documentation: /release/v5.5/docs/
- Corporate deployment guides: /release/v5.5/corporate-deployment-docs/
- Branching guide: /release/v5.5/docs/BRANCHING_AND_EXTENSION_GUIDE.md

================================================================================
END OF TRANSFER INSTRUCTIONS
================================================================================
