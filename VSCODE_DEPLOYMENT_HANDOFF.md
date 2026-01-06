# VS CODE CLAUDE: MPA v5.5 DEPLOYMENT HANDOFF

## CONTEXT

Platform packaging is COMPLETE. Now executing deployment to Aragorn AI environment.

## REPOSITORIES

| Repo | Location | Branch |
|------|----------|--------|
| Kessel-Digital-Agent-Platform | `/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform` | `deploy/personal` |
| Media_Planning_Agent (reference) | `/Users/kevinbauer/Kessel-Digital/Media_Planning_Agent` | `main` |

## ENVIRONMENT CONFIGURATION

Already configured in `release/v5.5/platform/config/environment.json`:

```
Environment: Aragorn AI
Dataverse URL: https://aragornai.crm.dynamics.com
Environment ID: c672b470-9cc7-e9d8-a0e2-ca83751f800c
Tenant ID: 3933d83c-778f-4bf2-b5d7-1eea5844e9a3
Azure Functions: https://func-aragorn-mpa.azurewebsites.net
Copilot Agent ID: copilots_header_a2740
```

## DEPLOYMENT PHASES

### Phase 1: Dataverse Tables ⏳ PENDING
**Type:** MANUAL (Power Apps UI)

Tables to create (see `release/v5.5/agents/mpa/base/docs/MPA_Dataverse_Manual_Table_Creation_Guide.md`):
1. mpa_vertical
2. mpa_channel
3. mpa_kpi
4. mpa_benchmark
5. mpa_mediaplan
6. mpa_planversion
7. mpa_plandata

**YOUR TASK:** Generate a condensed checklist the user can follow in Power Apps.

### Phase 2: Seed Data Import ⏳ PENDING
**Type:** SCRIPT (you can automate)

Seed files in `release/v5.5/agents/mpa/base/data/seed/`:
- mpa_vertical_seed.csv (23 records)
- mpa_channel_seed.csv (32 records)
- mpa_kpi_seed.csv (45 records)
- mpa_benchmark_seed.csv (708 records)

**YOUR TASK:** Create a Python script using Dataverse Web API to import seed data.
- Use MSAL for authentication
- Read CSVs from seed folder
- Upsert to Dataverse tables
- Handle errors gracefully
- Log progress

Reference existing config: `/Users/kevinbauer/Kessel-Digital/Media_Planning_Agent/config/aragorn_ai_environment.json`

### Phase 3: EAP Core Tables ⏳ PENDING
**Type:** MANUAL + SCRIPT

EAP table schemas in `release/v5.5/platform/eap-core/base/schema/tables/`:
- eap_session.json
- eap_user.json
- eap_client.json
- eap_featureflag.json
- eap_agentregistry.json

**YOUR TASK:** 
1. Generate manual creation guide (like MPA guide)
2. Create seed data for feature flags from `release/v5.5/platform/config/feature_flags.template.json`

### Phase 4: SharePoint KB Upload ⏳ PENDING
**Type:** SCRIPT (you can automate)

KB files in `release/v5.5/agents/mpa/base/kb/` (22 .txt files)

**YOUR TASK:** Create a script to upload files to SharePoint using Graph API or SharePoint REST API.

### Phase 5: Power Automate Flows ⏳ PENDING
**Type:** MANUAL (Power Automate UI)

Flow definitions in `release/v5.5/agents/mpa/base/flows/definitions/`
Flow specs in `release/v5.5/agents/mpa/base/flows/specs/`

**YOUR TASK:** Generate step-by-step build guides for each flow.

### Phase 6: Copilot Studio Configuration ⏳ PENDING
**Type:** MANUAL (Copilot Studio UI)

Instructions file: `release/v5.5/agents/mpa/base/copilot/MPA_v55_Instructions_Uplift.txt`

**YOUR TASK:** Generate Copilot Studio configuration checklist.

## PRIORITY ORDER

1. **FIRST:** Create seed data import script (Phase 2) - most value from automation
2. **SECOND:** Create EAP feature flag seed data (Phase 3)
3. **THIRD:** Create SharePoint upload script (Phase 4)
4. **FOURTH:** Generate manual checklists for UI work (Phases 1, 5, 6)

## AUTHENTICATION INFO

From existing configs:
- Dataverse Service Principal Client ID: `f1ccccf1-c2a0-4890-8d52-fdfcd6620ac8`
- Azure Functions already deployed with function key in environment.json

For scripts, use interactive authentication (az login / MSAL device code flow) or prompt user for credentials.

## OUTPUT LOCATION

Create all scripts and guides in:
`/Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/scripts/`

## START COMMAND

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git checkout deploy/personal
```

Then begin with the seed data import script.
