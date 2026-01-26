# Mastercard Corporate Extensions

## Overview

This folder contains Dataverse table schemas for Mastercard-specific extensions. These tables are ONLY created in the deploy/corporate branch and are controlled by feature flags.

**These extensions are NOT part of the base platform.** They augment the base functionality for corporate deployment requirements.

## Directory Structure

```
extensions/
├── access-control/          # Row-level security hierarchy
│   ├── eap_mc_businessunit.json
│   ├── eap_mc_department.json
│   ├── eap_mc_team.json
│   ├── eap_mc_pod.json
│   └── eap_mc_employee_assignment.json
│
├── audit/                   # Enhanced audit logging
│   └── eap_mc_audit_extended.json
│
├── benchmarks/              # Mastercard-specific benchmarks
│   └── mpa_mc_benchmarks.json
│
└── README.md                # This file
```

## Table Summary

| Table | Purpose | Records Expected |
|-------|---------|------------------|
| eap_mc_businessunit | Top-level org hierarchy | 5-20 |
| eap_mc_department | Departments within BUs | 20-100 |
| eap_mc_team | Teams within departments | 50-500 |
| eap_mc_pod | Pods within teams | 100-1000 |
| eap_mc_employee_assignment | User-to-hierarchy mapping | 1 per user |
| eap_mc_audit_extended | Enhanced audit trail | High volume |
| mpa_mc_benchmarks | MC-specific benchmarks | 50-200 |

## Feature Flags

Each extension is controlled by feature flags in eap_featureflag:

| Extension | Flag Code | Default |
|-----------|-----------|---------|
| Access Control Hierarchy | ACCESS_CONTROL_HIERARCHY | true |
| Row-Level Security | ROW_LEVEL_SECURITY | true |
| Extended Audit | EXTENDED_AUDIT | true |
| MC Benchmarks | MC_BENCHMARKS | true |

## Deployment Order

Tables must be created in this order due to foreign key relationships:

1. eap_mc_businessunit (no dependencies)
2. eap_mc_department (depends on businessunit)
3. eap_mc_team (depends on department)
4. eap_mc_pod (depends on team)
5. eap_mc_employee_assignment (depends on pod, team, department, businessunit, eap_user)
6. eap_mc_audit_extended (depends on eap_audit)
7. mpa_mc_benchmarks (no dependencies)

## Naming Convention

All Mastercard extension tables use the `_mc_` infix:
- `eap_mc_*` - Platform-level extensions
- `mpa_mc_*` - MPA agent-specific extensions

## Usage in Code

When querying data, check for MC-specific tables first, then fall back to base:

```
1. Check mpa_mc_benchmarks for vertical/channel match
2. If not found, check mpa_benchmarks (base table)
3. Return result from whichever has data
```

## Do Not

- Do NOT merge these schemas to the main branch
- Do NOT create these tables in personal environment
- Do NOT modify base table schemas to add MC-specific fields
- Do NOT bypass feature flag checks

## Version

Created for MPA v5.5 - January 2026
