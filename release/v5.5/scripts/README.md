# MPA v5.5 Deployment Scripts

Automation scripts for deploying MPA v5.5 to the Aragorn AI environment.

## Prerequisites

- Python 3.10+
- Azure AD access to Aragorn AI environment
- Permissions for Dataverse and SharePoint

## Installation

```bash
cd release/v5.5/scripts
pip install -r requirements.txt
```

## Scripts

### 1. Seed Data Import (`seed_data_import.py`)

Imports seed data from CSV files to Dataverse tables.

```bash
# Validate data without writing (dry run)
python seed_data_import.py --dry-run

# Import only verticals
python seed_data_import.py --table vertical

# Import all tables (verticals, channels, KPIs, benchmarks)
python seed_data_import.py

# Verbose output
python seed_data_import.py -v
```

**Import Order:**
1. Verticals (12 records)
2. Channels (43 records)
3. KPIs (44 records)
4. Benchmarks (794 records - depends on above tables)

**Authentication:** Uses device code flow. You'll be prompted to visit a URL and enter a code.

### 2. Feature Flag CSV Generator (`generate_featureflag_csv.py`)

Transforms `feature_flags.template.json` into CSV format for Dataverse import.

```bash
# Generate to default location
python generate_featureflag_csv.py

# Generate to custom location
python generate_featureflag_csv.py --output /path/to/output.csv

# Verbose output
python generate_featureflag_csv.py -v
```

**Output:** `release/v5.5/platform/eap-core/base/data/seed/eap_featureflag_seed.csv`

### 3. SharePoint KB Upload (`upload_kb_files.py`)

Uploads knowledge base files to SharePoint document library.

```bash
# Upload to default MediaPlanningKB library
python upload_kb_files.py

# Upload to specific library
python upload_kb_files.py --library CustomKB

# Skip existing files
python upload_kb_files.py --no-overwrite

# Verbose output
python upload_kb_files.py -v
```

**Source:** 22 KB files from `release/v5.5/agents/mpa/base/kb/`

**Target:** SharePoint `MediaPlanningKB` library

## Checklists

Manual deployment guides in `checklists/`:

| File | Purpose |
|------|---------|
| `DATAVERSE_TABLES.md` | Create 7 MPA tables in Power Apps |
| `POWER_AUTOMATE_FLOWS.md` | Build 10 flows + 1 pending |
| `COPILOT_STUDIO.md` | Configure Copilot Studio agent |

## Directory Structure

```
scripts/
├── requirements.txt          # Python dependencies
├── README.md                 # This file
├── seed_data_import.py       # Main Dataverse import script
├── generate_featureflag_csv.py  # Feature flag CSV generator
├── upload_kb_files.py        # SharePoint upload script
├── auth/
│   └── msal_auth.py          # Device code flow authentication
├── config/
│   └── settings.py           # Environment configuration loader
├── dataverse/
│   └── client.py             # Dataverse API client
├── sharepoint/
│   └── uploader.py           # Graph API file uploader
└── checklists/
    ├── DATAVERSE_TABLES.md   # Table creation checklist
    ├── POWER_AUTOMATE_FLOWS.md  # Flow build guide
    └── COPILOT_STUDIO.md     # Copilot config guide
```

## Configuration

Scripts load configuration from:
`release/v5.5/platform/config/environment.json`

Key settings:
- Dataverse API URL
- Tenant ID and Client ID
- SharePoint site URL
- KB library names

## Deployment Order

1. **Create Dataverse Tables** (manual)
   - Follow `checklists/DATAVERSE_TABLES.md`

2. **Import Seed Data** (script)
   ```bash
   python seed_data_import.py --dry-run  # Validate first
   python seed_data_import.py            # Import
   ```

3. **Generate Feature Flag CSV** (script)
   ```bash
   python generate_featureflag_csv.py
   ```

4. **Upload KB Files** (script)
   ```bash
   python upload_kb_files.py
   ```

5. **Build Power Automate Flows** (manual)
   - Follow `checklists/POWER_AUTOMATE_FLOWS.md`

6. **Configure Copilot Studio** (manual)
   - Follow `checklists/COPILOT_STUDIO.md`

## Troubleshooting

### Authentication Issues

```bash
# Clear cached tokens
rm ~/.mpa_token_cache.json
```

### Dataverse API Errors

Verify entity set names after table creation:
```
GET https://aragornai.api.crm.dynamics.com/api/data/v9.2/EntityDefinitions?$select=LogicalName,EntitySetName&$filter=startswith(LogicalName,'mpa_')
```

### SharePoint Upload Errors

- Verify library exists and name matches exactly
- Check file size (max 4MB for simple upload)
- Confirm Graph API permissions

## Environment Details

| Setting | Value |
|---------|-------|
| Environment | Aragorn AI |
| Dataverse URL | https://aragornai.crm.dynamics.com |
| API URL | https://aragornai.api.crm.dynamics.com/api/data/v9.2 |
| Tenant ID | 3933d83c-778f-4bf2-b5d7-1eea5844e9a3 |
| Client ID | f1ccccf1-c2a0-4890-8d52-fdfcd6620ac8 |
| SharePoint | https://kesseldigitalcom.sharepoint.com/sites/KesselDigital |
| KB Library | MediaPlanningKB |

## Notes

- Scripts use device code flow for interactive authentication
- Token cache stored at `~/.mpa_token_cache.json`
- Rate limiting applied (0.1s between records, 1s every 50 records)
- Benchmark import requires vertical, channel, and KPI tables populated first
