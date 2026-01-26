# MPA/CA/EAP CONSOLIDATION - CONTINUATION PROMPT

**Last Session:** 2026-01-06
**Status:** PAUSED - Resume in 2 days
**Branch:** deploy/personal
**Repository:** /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

---

## CONTEXT FOR NEXT SESSION

We are consolidating three separate repositories into the Kessel-Digital-Agent-Platform following the agreed base/extensions architecture pattern.

### THREE REPOSITORIES DISCOVERED

| Repository | Location | Version | Status |
|------------|----------|---------|--------|
| MPA | /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform | v5.5 | PRODUCTION READY |
| CA | /Users/kevinbauer/Kessel-Digital/Consulting_Agent | v11.1/V12 | NEEDS MIGRATION |
| EAP | /Users/kevinbauer/Kessel-Digital/Enterprise_AI_Platform | v1.0.0 | NEEDS MIGRATION |

### AGREED ARCHITECTURE

All agents and platform code consolidate into Kessel-Digital-Agent-Platform with base/extensions pattern:

```
Kessel-Digital-Agent-Platform/
└── release/v5.5/
    ├── /platform/
    │   └── /eap-core/
    │       ├── /base/                    ← Core EAP (all environments)
    │       │   ├── /schema/tables/       ← ~46 core tables
    │       │   ├── /schema/flows/
    │       │   ├── /interfaces/
    │       │   ├── /kb/                  ← 7 KB files (NEED 6-RULE FIXES)
    │       │   └── /seed_data/
    │       └── /extensions/
    │           └── /corporate/           ← Corporate features (~66 tables)
    │               ├── /schema/tables/
    │               └── /seed_data/
    │
    ├── /agents/
    │   ├── /mpa/                         ← DONE - Reference implementation
    │   │   ├── /base/
    │   │   └── /extensions/mastercard/
    │   │
    │   └── /ca/                          ← NEEDS MIGRATION FROM Consulting_Agent
    │       ├── /base/
    │       │   ├── /kb/                  ← 35 KB files
    │       │   ├── /schema/tables/       ← 9 CA tables
    │       │   ├── /schema/flows/        ← 8 flows (flow_50-57)
    │       │   ├── /copilot/             ← V12 instructions
    │       │   ├── /functions/           ← Azure function
    │       │   └── /seed_data/           ← Benchmarks, frameworks
    │       └── /extensions/
    │           └── /mastercard/          ← CREATE STRUCTURE (CA deploys to MC next week)
    │
    └── /docs/
```

---

## DECISIONS ALREADY MADE

1. **Consolidation approach:** Single repo (Kessel-Digital-Agent-Platform)
2. **Extension folder name:** Use `corporate` not `mastercard` (more reusable)
3. **EAP table split:** ~46 base tables, ~66 extension tables (see EAP_Table_Categorization.md)
4. **CA tables:** 9 tables move to /agents/ca/base/schema/tables/
5. **Standalone repos:** Archive as read-only AFTER updating with final documentation
6. **CA Mastercard deployment:** Next week - create /extensions/mastercard/ structure now

---

## KNOWN ISSUES TO FIX DURING MIGRATION

### EAP KB Files (5 of 7 FAIL 6-Rule Compliance)

| File | Issue | Fix |
|------|-------|-----|
| BENCHMARK_Industry_KPIs_v1.txt | 15+ markdown tables | Convert to flat lists |
| INDUSTRY_Vertical_Expertise_v1.txt | 7 markdown tables | Convert to flat lists |
| REFERENCE_Research_Routing_v1.txt | 8+ markdown tables | Convert to flat lists |
| TOOLS_Consulting_Methods_v1.txt | 2 markdown tables | Convert to flat lists |
| BEHAVIORAL_Service_Availability_v1.txt | Numbered lists | Convert to hyphens |
| FRAMEWORK_Library_v1.txt | Arrows (->) | Convert to hyphens |
| REGISTRY_Available_Integrations_v1.txt | PASS | No changes |

### CA KB Files (1 Issue)

| File | Issue | Fix |
|------|-------|-----|
| FRAMEWORK_Library_Master_v1.txt | 13 lines avg 2,600 chars | Split into shorter lines |

### Schema Format Inconsistency

Four different schema formats exist across repos. Recommend standardizing to JSON Schema format (MPA pattern).

---

## WORK COMPLETED THIS SESSION

1. ✅ Discovered 3 separate repositories (not single consolidated repo)
2. ✅ Full inventory of CA: 35 KB files, 52 benchmarks, 32 frameworks, V11.1/V12
3. ✅ Full inventory of EAP: 124 schema files, 7 KB files, 30+ seed files
4. ✅ 6-Rule compliance audit of EAP KB files (5/7 FAIL)
5. ✅ 6-Rule compliance audit of CA KB files (5.5/6 - one long-line file)
6. ✅ Categorized EAP tables: ~46 base, ~66 extensions, 9 CA, 3 meta
7. ✅ Created EAP_Table_Categorization.md
8. ✅ Created EAP_Full_Compliance_Audit.md
9. ✅ Created EAP_CA_Compliance_Audit_Report.md (revised)
10. ✅ Confirmed architecture alignment with base/extensions pattern

---

## NEXT STEPS (PRIORITY ORDER)

### Phase 1: EAP Migration (~4-6 hours)

1. Create directory structure in consolidated repo:
   - /platform/eap-core/base/schema/tables/
   - /platform/eap-core/base/schema/flows/
   - /platform/eap-core/base/kb/
   - /platform/eap-core/base/seed_data/
   - /platform/eap-core/extensions/corporate/schema/tables/
   - /platform/eap-core/extensions/corporate/seed_data/

2. Fix EAP KB files for 6-Rule compliance (remove tables, fix lists)

3. Migrate ~46 base tables to /base/schema/tables/

4. Migrate ~66 extension tables to /extensions/corporate/schema/tables/

5. Migrate seed data files

6. Update VERSION.json

### Phase 2: CA Migration (~3-4 hours)

1. Create directory structure:
   - /agents/ca/base/kb/
   - /agents/ca/base/schema/tables/
   - /agents/ca/base/schema/flows/
   - /agents/ca/base/copilot/
   - /agents/ca/base/functions/
   - /agents/ca/base/seed_data/
   - /agents/ca/extensions/mastercard/ (empty structure)

2. Migrate 35 KB files from Consulting_Agent repo

3. Fix FRAMEWORK_Library_Master_v1.txt (long lines)

4. Migrate 9 CA table schemas

5. Migrate 8 flow definitions

6. Migrate V12 Copilot instructions

7. Migrate Azure function

8. Migrate seed data (benchmarks, frameworks)

9. Update VERSION.json

### Phase 3: Validation (~2 hours)

1. Run 6-Rule compliance check on all migrated KB files
2. Verify schema format consistency
3. Verify all file references work
4. Test that nothing references old locations
5. Update cross-references in documentation

### Phase 4: Archive Standalone Repos (~1 hour)

1. Update Consulting_Agent repo with final migration documentation
2. Update Enterprise_AI_Platform repo with final migration documentation
3. Make both repos read-only
4. Update README files to point to consolidated repo

---

## KEY FILE LOCATIONS

### Audit Reports (Created This Session)
- /release/v5.5/docs/EAP_Table_Categorization.md
- /release/v5.5/docs/EAP_Full_Compliance_Audit.md
- /release/v5.5/docs/EAP_CA_Compliance_Audit_Report.md

### Source Repos (To Migrate FROM)
- CA: /Users/kevinbauer/Kessel-Digital/Consulting_Agent
- EAP: /Users/kevinbauer/Kessel-Digital/Enterprise_AI_Platform

### Target Repo (To Migrate TO)
- /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

### Standards Reference
- /.platform/STANDARDS.md (exists in all three repos, should be identical)

### Existing CA Placeholder (To Be Replaced)
- /release/v5.5/agents/ca/ (currently just placeholder README)

### Existing EAP Core (To Be Enhanced)
- /release/v5.5/platform/eap-core/ (currently minimal - 5 tables, 1 flow)

---

## COMMANDS TO VERIFY STATE

```bash
# Check current branch
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
git branch --show-current
# Expected: deploy/personal

# Check recent commits
git log --oneline -5

# Verify audit files exist
ls -la release/v5.5/docs/EAP_*.md

# Check CA source repo exists
ls /Users/kevinbauer/Kessel-Digital/Consulting_Agent/kb/ | wc -l
# Expected: 35 files

# Check EAP source repo exists
ls /Users/kevinbauer/Kessel-Digital/Enterprise_AI_Platform/specs/dataverse/*.json | wc -l
# Expected: 124 files
```

---

## TRANSCRIPT REFERENCE

Full conversation transcript available at:
/mnt/transcripts/2026-01-06-16-20-56-ca-eap-multi-repo-discovery.txt

Previous transcript:
/mnt/transcripts/2026-01-06-16-13-46-eap-ca-compliance-audit.txt

---

## RESUME INSTRUCTIONS

1. Read this continuation prompt
2. Verify state with commands above
3. Review EAP_Table_Categorization.md for table split details
4. Begin Phase 1: EAP Migration
5. Work through phases in order

---

**Document Created:** 2026-01-06
**Expected Resume:** 2026-01-08 or 2026-01-09
