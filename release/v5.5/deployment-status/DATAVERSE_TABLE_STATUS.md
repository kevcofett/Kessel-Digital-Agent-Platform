# DATAVERSE TABLE STATUS

Generated: 2026-01-06T06:25:00Z
Environment: Aragorn AI (Personal)
Dataverse URL: https://aragornai.crm.dynamics.com
API URL: https://aragornai.api.crm.dynamics.com/api/data/v9.2

## Verification Method

Direct Dataverse API access requires interactive OAuth authentication (device code flow).
Table status was verified indirectly through Azure Functions which connect to Dataverse.

## EAP Platform Tables (5)

| Table | Logical Name | Status | Notes |
|-------|--------------|--------|-------|
| Session | eap_session | UNVERIFIED | Session Manager auth config issue - cannot test |
| User | eap_user | UNVERIFIED | No direct verification endpoint available |
| Client | eap_client | UNVERIFIED | No direct verification endpoint available |
| Feature Flag | eap_featureflag | UNVERIFIED | No direct verification endpoint available |
| Agent Registry | eap_agentregistry | UNVERIFIED | No direct verification endpoint available |

## MPA Agent Tables (6)

| Table | Logical Name | Status | Notes |
|-------|--------------|--------|-------|
| Media Plan | mpa_mediaplan | UNVERIFIED | No direct verification endpoint available |
| Plan Section | mpa_plansection | UNVERIFIED | No direct verification endpoint available |
| Benchmark | mpa_benchmark | EXISTS | SearchBenchmarks confirms table exists, returns 0 active records |
| Vertical | mpa_vertical | EXISTS | SearchBenchmarks shows "general" vertical available |
| Channel | mpa_channel | EXISTS | Implied by SearchBenchmarks filter options |
| KPI | mpa_kpi | EXISTS | Implied by SearchBenchmarks filter options |

## Seed Data Status

| Table | Expected | Verified | Status |
|-------|----------|----------|--------|
| mpa_benchmark | ~794 | 0 active | NEEDS IMPORT |
| mpa_channel | ~42 | Unknown | NEEDS VERIFICATION |
| mpa_kpi | ~42 | Unknown | NEEDS VERIFICATION |
| mpa_vertical | ~12 | 1 ("general") | NEEDS IMPORT |
| eap_featureflag | ~24 | Unknown | NEEDS VERIFICATION |
| eap_agentregistry | ~2 | Unknown | NEEDS VERIFICATION |

## Azure Functions Dataverse Connectivity

| Function | Dataverse Access | Status |
|----------|------------------|--------|
| SearchBenchmarks | YES | Working - confirmed dataSource: "Dataverse" |
| SessionManager | NO | Auth config issue - DefaultAzureCredential failed |
| CalculateBudgetAllocation | Unknown | Not tested |
| CalculateGap | Unknown | Not tested |
| CalculateSPO | Unknown | Not tested |
| GenerateDocument | Unknown | Not tested |
| RunProjections | Unknown | Not tested |
| ValidateGate | Unknown | Not tested |

## Issues Identified

### Critical Issue: Session Manager Authentication
The SessionManager function cannot authenticate to Dataverse:
```
DefaultAzureCredential failed to retrieve a token from the included credentials.
```

This needs to be resolved before session-based features will work.

### Seed Data Missing
The reference tables appear to exist but lack the full seed data:
- Only 1 vertical ("general") found instead of 12
- Benchmark search returns 0 results
- Full seed data import required

## Recommended Actions

1. **Configure Azure Function Managed Identity**
   - Enable system-assigned managed identity on func-aragorn-mpa
   - Grant the identity Dataverse API permissions
   - Or configure environment variables with client credentials

2. **Import Seed Data**
   - Run seed_data_import.py script with user authentication
   - Import order: verticals -> channels -> KPIs -> benchmarks

3. **Verify EAP Tables**
   - Use Power Apps maker portal to confirm table existence
   - Or run seed_data_import.py --dry-run to test API access

## Verification Commands

To fully verify via Dataverse API (requires user authentication):
```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/scripts
python seed_data_import.py --dry-run
```

To verify via Power Apps maker portal:
1. Go to https://make.powerapps.com
2. Select Aragorn AI environment
3. Navigate to Dataverse > Tables
4. Search for "eap_" and "mpa_" prefixes
