# VS CODE CLAUDE PROMPT: MASTERCARD AGENT PLATFORM SETUP VIA GIT CLONE

## CRITICAL CONTEXT

You are setting up the Mastercard Agent Platform by cloning from the Kessel-Digital source repository. This is a fresh setup on a Mastercard corporate machine behind the firewall.

The source repo is accessible: https://github.com/kevcofett/Kessel-Digital-Agent-Platform

## OBJECTIVE

1. Clone the source repository
2. Create Mastercard-Agent-Platform as a new repo
3. Configure for Mastercard environment
4. Prepare for deployment

---

## PHASE 1: CLONE AND RENAME

### Step 1.1: Clone Source Repository

```bash
# Navigate to your preferred directory
cd ~/Projects  # or wherever you keep repos

# Clone the source
git clone https://github.com/kevcofett/Kessel-Digital-Agent-Platform.git

# Rename to Mastercard
mv Kessel-Digital-Agent-Platform Mastercard-Agent-Platform
cd Mastercard-Agent-Platform
```

### Step 1.2: Reset Git History (Optional but Recommended)

If you want a clean git history for corporate:

```bash
# Remove existing git history
rm -rf .git

# Initialize fresh repo
git init
git add -A
git commit -m "Initial MPA v5.5 for Mastercard - cloned from Kessel-Digital v5.5"
```

### Step 1.3: Connect to Mastercard GitHub Enterprise

```bash
# Add Mastercard remote (replace with actual URL)
git remote add origin {MASTERCARD_GITHUB_ENTERPRISE_URL}/Mastercard-Agent-Platform.git

# Push to Mastercard repo
git push -u origin main

# Create deployment branch
git checkout -b deploy/corporate
git push -u origin deploy/corporate
```

---

## PHASE 2: ORGANIZATION NAME REPLACEMENT

### Step 2.1: Find All Kessel-Digital References

```bash
# Search for all occurrences
grep -r "Kessel-Digital" --include="*.json" --include="*.md" --include="*.txt" .
grep -r "kessel-digital" --include="*.json" --include="*.md" --include="*.txt" .
grep -r "kesseldigital" --include="*.json" --include="*.md" --include="*.txt" .
```

### Step 2.2: Replace Organization References

Files that need organization name updates:

1. `README.md` - Title and descriptions
2. `PLATFORM_ARCHITECTURE.md` - Organization references
3. `release/v5.5/platform/config/environment.json` - DO NOT USE, use template instead
4. `release/v5.5/docs/*.md` - Documentation headers

### Step 2.3: Use Mastercard Environment Config

```bash
# Copy Mastercard-specific config as starting point
cp release/v5.5/transfer-packages/mastercard/environment.mastercard.json \
   release/v5.5/platform/config/environment.json

# Copy corporate feature flags
cp release/v5.5/transfer-packages/mastercard/feature_flags_corporate.csv \
   release/v5.5/platform/config/feature_flags.csv
```

---

## PHASE 3: CONFIGURE MASTERCARD ENVIRONMENT

### Step 3.1: Gather Required Values

Before proceeding, collect these Mastercard-specific values:

```
AZURE AD / TENANT:
[ ] Tenant ID: ________________________________
[ ] Tenant Name: ______________________________

DATAVERSE:
[ ] Environment URL: __________________________
[ ] Environment ID: ___________________________
[ ] Organization ID: __________________________

SHAREPOINT:
[ ] Site URL: _________________________________

AZURE (if deploying functions):
[ ] Subscription ID: __________________________
[ ] Resource Group: ___________________________
[ ] Function App Name: ________________________
[ ] Storage Account: __________________________

COPILOT STUDIO:
[ ] Environment URL: __________________________

TEAMS (if deploying to Teams):
[ ] Teams App ID: _____________________________
```

### Step 3.2: Update Environment Configuration

Edit `release/v5.5/platform/config/environment.json` and replace all `{PLACEHOLDER}` values:

```json
{
  "organization": {
    "code": "Mastercard",
    "name": "Mastercard",
    "description": "Corporate managed environment"
  },
  "tenant": {
    "tenantId": "{REPLACE_WITH_MASTERCARD_TENANT_ID}",
    "tenantName": "{REPLACE}.onmicrosoft.com"
  },
  "dataverse": {
    "environmentUrl": "{REPLACE_WITH_DATAVERSE_URL}",
    ...
  }
  // Continue for all placeholders
}
```

### Step 3.3: Verify Feature Flags for Corporate

The `feature_flags_corporate.csv` has these corporate defaults:

| Flag | Default | Reason |
|------|---------|--------|
| mpa_enable_web_search | FALSE | No external searches |
| mpa_enable_external_api | FALSE | No external APIs |
| sec_enable_audit_logging | TRUE | All actions logged |
| sec_enable_row_level_security | TRUE | Hierarchy-based access |
| sec_enable_data_firewall | TRUE | Block external transmission |
| ui_show_debug_info | FALSE | Hide debug info |

Review and adjust if needed for Mastercard requirements.

---

## PHASE 4: VERIFY PACKAGE CONTENTS

### Step 4.1: Check KB Files

```bash
ls -la release/v5.5/agents/mpa/base/kb/
# Should show 22 files with _v5_5 suffix
```

Expected files:
- AI_ADVERTISING_GUIDE_v5_5.txt
- Analytics_Engine_v5_5.txt
- BRAND_PERFORMANCE_FRAMEWORK_v5_5.txt
- Confidence_Level_Framework_v5_5.txt
- Data_Provenance_Framework_v5_5.txt
- FIRST_PARTY_DATA_STRATEGY_v5_5.txt
- Gap_Detection_Playbook_v5_5.txt
- MEASUREMENT_FRAMEWORK_v5_5.txt
- MPA_Conversation_Examples_v5_5.txt
- MPA_Expert_Lens_Audience_Strategy_v5_5.txt
- MPA_Expert_Lens_Budget_Allocation_v5_5.txt
- MPA_Expert_Lens_Channel_Mix_v5_5.txt
- MPA_Expert_Lens_Measurement_Attribution_v5_5.txt
- MPA_Implications_Audience_Targeting_v5_5.txt
- MPA_Implications_Budget_Decisions_v5_5.txt
- MPA_Implications_Channel_Shifts_v5_5.txt
- MPA_Implications_Measurement_Choices_v5_5.txt
- MPA_Implications_Timing_Pacing_v5_5.txt
- MPA_Supporting_Instructions_v5_5.txt
- Output_Templates_v5_5.txt
- RETAIL_MEDIA_NETWORKS_v5_5.txt
- Strategic_Wisdom_v5_5.txt

### Step 4.2: Check Seed Data

```bash
wc -l release/v5.5/agents/mpa/base/data/seed/*.csv
```

Expected:
- mpa_benchmark_seed.csv: ~795 lines (794 records + header)
- mpa_channel_seed.csv: ~43 lines
- mpa_kpi_seed.csv: ~43 lines
- mpa_vertical_seed.csv: ~13 lines

### Step 4.3: Check Flow Definitions

```bash
ls release/v5.5/agents/mpa/base/flows/definitions/
```

Should show 12 JSON files.

### Step 4.4: Check Copilot Instructions

```bash
wc -c release/v5.5/agents/mpa/base/copilot/MPA_v55_Instructions_Uplift.txt
```

Should be under 8,000 characters (Copilot Studio limit).

---

## PHASE 5: COMMIT AND PUSH

### Step 5.1: Stage All Changes

```bash
git add -A
git status
```

### Step 5.2: Commit Configuration

```bash
git commit -m "Configure Mastercard environment

- Replace Kessel-Digital with Mastercard organization
- Configure environment.json with Mastercard values
- Set corporate feature flag defaults
- Verify all v5.5 artifacts present"
```

### Step 5.3: Push to Corporate Repo

```bash
git push origin deploy/corporate
```

---

## PHASE 6: DEPLOYMENT READINESS CHECK

### Step 6.1: Pre-Deployment Checklist

```
MASTERCARD DEPLOYMENT READINESS
===============================

REPOSITORY:
[ ] Cloned from Kessel-Digital-Agent-Platform
[ ] Renamed to Mastercard-Agent-Platform
[ ] Connected to Mastercard GitHub Enterprise
[ ] deploy/corporate branch created and pushed

CONFIGURATION:
[ ] environment.json updated with Mastercard values
[ ] All {PLACEHOLDER} values replaced
[ ] feature_flags.csv has corporate defaults
[ ] Organization references updated

ARTIFACTS VERIFIED:
[ ] 22 KB files present
[ ] 4 seed data CSVs present
[ ] 12 flow definitions present
[ ] Copilot instructions present (<8K chars)
[ ] 12 Azure function folders present

READY FOR DEPLOYMENT: [YES/NO]
```

### Step 6.2: Next Steps

Once repository is configured, proceed with deployment:

1. **Dataverse Tables** - Create tables from schemas
2. **Seed Data** - Import reference data
3. **Azure Functions** - Deploy to Mastercard Azure subscription
4. **SharePoint** - Create KB library and upload files
5. **Power Automate** - Create flows from definitions
6. **Copilot Studio** - Configure agent with instructions and KB
7. **Teams** - Deploy to Teams channel

Reference: `release/v5.5/transfer-packages/mastercard/TRANSFER_INSTRUCTIONS.md`

---

## CORPORATE-SPECIFIC NOTES

### Data Firewall

The environment.json includes data firewall configuration:

```json
"security": {
  "dataFirewall": {
    "enabled": true,
    "allowedDomains": ["mastercard.com", "mastercard.sharepoint.com"],
    "blockedExternalAPIs": true
  }
}
```

### Access Control Hierarchy

Corporate uses hierarchical access control:
- Business Unit → Department → Team → Pod → Employee

Extension tables for this will go in:
`release/v5.5/platform/eap-core/extensions/access_control/`

### Confluence Integration (Future)

If integrating Confluence as a data source, add connector to:
`release/v5.5/platform/eap-core/extensions/data_sources/`

---

## IMPORTANT RULES

1. NEVER commit sensitive credentials to the repo
2. Use environment variables or Azure Key Vault for secrets
3. All extensions go in /extensions/ folders (never modify /base/)
4. Follow corporate security and compliance requirements
5. Test in non-production environment before production deployment
