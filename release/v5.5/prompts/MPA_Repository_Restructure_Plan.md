# MPA V5.5 REPOSITORY RESTRUCTURE PLAN

## Document Purpose

This document provides a complete, self-contained plan for restructuring the Kessel-Digital-Agent-Platform repository to match the agreed folder structure. It includes an execution prompt for VS Code Claude that prevents scope creep and hallucination.

**Created:** 2026-01-06
**Repository:** /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
**Branch:** deploy/personal (execute here first, then merge to main)

---

## PART 1: AGREED TARGET STRUCTURE

This is the EXACT structure we are implementing. No deviations.

```
Kessel-Digital-Agent-Platform/
├── README.md
├── PLATFORM_ARCHITECTURE.md
├── CONTINUATION_PROMPT.md
│
└── release/v5.5/
    ├── /platform/
    │   ├── /config/
    │   │   ├── environment.template.json
    │   │   ├── feature_flags.template.json
    │   │   └── security_roles.template.json
    │   │
    │   ├── /eap-core/
    │   │   ├── /base/
    │   │   │   ├── /schema/tables/
    │   │   │   ├── /schema/flows/
    │   │   │   └── /interfaces/
    │   │   └── /extensions/
    │   │       └── .gitkeep
    │   │
    │   └── /security/
    │       ├── /base/
    │       │   └── .gitkeep
    │       └── /extensions/
    │           └── .gitkeep
    │
    ├── /agents/
    │   ├── /mpa/
    │   │   ├── /base/
    │   │   │   ├── /kb/
    │   │   │   ├── /schema/tables/
    │   │   │   ├── /schema/flows/
    │   │   │   ├── /functions/
    │   │   │   ├── /seed_data/
    │   │   │   ├── /copilot/
    │   │   │   ├── /cards/
    │   │   │   ├── /templates/
    │   │   │   └── /docs/
    │   │   └── /extensions/
    │   │       └── .gitkeep
    │   │
    │   ├── /ca/
    │   │   ├── /base/
    │   │   │   └── README.md
    │   │   └── /extensions/
    │   │       └── .gitkeep
    │   │
    │   └── /agent-template/
    │       ├── /base/
    │       │   └── README.md
    │       └── /extensions/
    │           └── .gitkeep
    │
    └── /docs/
        ├── DEPLOYMENT_GUIDE.md
        ├── RELEASE_NOTES.md
        ├── CORPORATE_DEPLOYMENT_ADDENDUM.md
        └── BRANCHING_AND_EXTENSION_GUIDE.md
```

---

## PART 2: CURRENT STATE INVENTORY

### What EXISTS and is CORRECT (Do Not Touch)

| Path | Status |
|------|--------|
| `/platform/config/environment.template.json` | ✅ Keep |
| `/platform/config/feature_flags.template.json` | ✅ Keep |
| `/platform/config/environment.json` | ✅ Keep |
| `/platform/config/feature_flags.csv` | ✅ Keep |
| `/platform/eap-core/base/interfaces/` | ✅ Keep (4 files) |
| `/platform/eap-core/base/schema/tables/` | ✅ Keep (5 JSON files) |
| `/platform/eap-core/extensions/.gitkeep` | ✅ Keep |
| `/agents/mpa/base/kb/` | ✅ Keep (22 files) |
| `/agents/mpa/base/functions/` | ✅ Keep |
| `/agents/mpa/base/copilot/` | ✅ Keep |
| `/agents/mpa/base/cards/` | ✅ Keep |
| `/agents/mpa/base/templates/` | ✅ Keep |
| `/agents/mpa/base/docs/` | ✅ Keep |
| `/agents/mpa/extensions/.gitkeep` | ✅ Keep |
| `/agents/ca/` | ✅ Keep structure |
| `/agents/agent-template/` | ✅ Keep structure |
| `/docs/` (all 4 files) | ✅ Keep |

### What Needs to be CREATED

| Path | Action |
|------|--------|
| `/platform/config/security_roles.template.json` | CREATE new file |
| `/platform/eap-core/base/schema/flows/` | CREATE directory |
| `/platform/security/base/.gitkeep` | CREATE file |
| `/platform/security/extensions/.gitkeep` | CREATE file |
| `/agents/mpa/base/schema/tables/` | CREATE directory |
| `/agents/mpa/base/schema/flows/` | CREATE directory |
| `/agents/mpa/base/seed_data/` | CREATE directory |

### What Needs to be MOVED

| Current Location | New Location |
|------------------|--------------|
| `/platform/eap-core/base/flows/eap_initialize_session.json` | `/platform/eap-core/base/schema/flows/eap_initialize_session.json` |
| `/agents/mpa/base/schema/*.json` (table schemas) | `/agents/mpa/base/schema/tables/*.json` |
| `/agents/mpa/base/flows/definitions/*.json` | `/agents/mpa/base/schema/flows/*.json` |
| `/agents/mpa/base/flows/specifications/*` | `/agents/mpa/base/schema/flows/specifications/*` (if exists) |
| `/agents/mpa/base/data/seed/*` | `/agents/mpa/base/seed_data/*` |

### What Needs to be DELETED (Empty Directories After Move)

| Path | Action |
|------|--------|
| `/platform/eap-core/base/flows/` | DELETE after move (will be empty) |
| `/agents/mpa/base/flows/` | DELETE after move (will be empty) |
| `/agents/mpa/base/data/` | DELETE after move (will be empty) |
| `/agents/mpa/base/schema/dataverse/` | EVALUATE - may need to merge or delete |
| `/agents/mpa/base/schema/validation/` | EVALUATE - may need to merge or delete |

---

## PART 3: EXECUTION ORDER

Execute these phases IN ORDER. Do not skip steps. Verify each phase before proceeding.

### PHASE 1: Create New Directories

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5

# EAP flows directory
mkdir -p platform/eap-core/base/schema/flows

# Security placeholders
touch platform/security/base/.gitkeep
touch platform/security/extensions/.gitkeep

# MPA schema restructure
mkdir -p agents/mpa/base/schema/tables
mkdir -p agents/mpa/base/schema/flows

# MPA seed_data
mkdir -p agents/mpa/base/seed_data
```

**Verification:** Run `ls -la` on each new directory to confirm creation.

### PHASE 2: Create Missing Template Files

Create `/platform/config/security_roles.template.json`:

```json
{
  "_comment": "Security roles template - copy and customize for each environment",
  "_version": "5.5.0",
  "roles": [
    {
      "role_name": "MPA_User",
      "description": "Standard MPA user - can create and manage own sessions",
      "permissions": [
        "session:create",
        "session:read:own",
        "session:update:own",
        "benchmark:read",
        "kb:search"
      ]
    },
    {
      "role_name": "MPA_PowerUser",
      "description": "Power user - can view team data",
      "permissions": [
        "session:create",
        "session:read:team",
        "session:update:own",
        "benchmark:read",
        "kb:search",
        "document:generate"
      ]
    },
    {
      "role_name": "MPA_Admin",
      "description": "Administrator - full access",
      "permissions": [
        "session:*",
        "benchmark:*",
        "kb:*",
        "document:*",
        "audit:read",
        "config:read"
      ]
    }
  ],
  "dataverse_security_roles": {
    "MPA_User": "Basic User",
    "MPA_PowerUser": "Basic User + Custom Read",
    "MPA_Admin": "System Administrator"
  }
}
```

**Verification:** File exists and is valid JSON.

### PHASE 3: Move EAP Flow Files

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5

# Move EAP flow to schema/flows
mv platform/eap-core/base/flows/eap_initialize_session.json \
   platform/eap-core/base/schema/flows/

# Remove empty directory
rmdir platform/eap-core/base/flows
```

**Verification:** 
- File exists at new location
- Old directory is gone
- `git status` shows the move

### PHASE 4: Move MPA Table Schemas

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base

# List current schema files to identify what to move
ls -la schema/

# Move table schema files (these are the ones that define Dataverse tables)
# Based on current inventory, these files exist:
mv schema/MPA_v5.2_BenchmarkMetricTypes_Update.json schema/tables/
mv schema/MPA_v5.2_DataMigration_Specification.json schema/tables/
mv schema/MPA_v5.2_DataverseSchema_Updates.json schema/tables/
mv schema/MPA_v5.2_EAP_ID_Mapping.json schema/tables/
mv schema/MPA_v5.2_FeatureFlag_Table.json schema/tables/
mv schema/mpa_custom_channels.json schema/tables/
mv schema/mpa_custom_kpis.json schema/tables/
mv schema/mpa_featureflags_table.json schema/tables/

# Move dataverse subfolder contents if they are table definitions
mv schema/dataverse/* schema/tables/ 2>/dev/null || true
rmdir schema/dataverse 2>/dev/null || true

# Move validation subfolder - this may belong in tables or a separate location
# DECISION: Keep validation as subfolder under tables
mv schema/validation schema/tables/ 2>/dev/null || true
```

**Verification:**
- All JSON files now in `schema/tables/`
- `schema/` directory only contains `tables/` and `flows/` subdirectories

### PHASE 5: Move MPA Flow Definitions

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base

# Move flow definition files
mv flows/definitions/*.json schema/flows/

# Move specifications if they exist
mv flows/specifications/* schema/flows/specifications/ 2>/dev/null || true

# Remove empty directories
rmdir flows/definitions 2>/dev/null || true
rmdir flows/specifications 2>/dev/null || true
rmdir flows 2>/dev/null || true
```

**Verification:**
- All flow JSONs now in `schema/flows/`
- `flows/` directory is gone
- 12 flow definition files present in new location

### PHASE 6: Move Seed Data

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base

# Move seed data files
mv data/seed/* seed_data/ 2>/dev/null || true

# Remove empty directories
rmdir data/seed 2>/dev/null || true
rmdir data 2>/dev/null || true
```

**Verification:**
- Seed data files now in `seed_data/`
- `data/` directory is gone

### PHASE 7: Verify CA and Agent-Template Structure

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents

# Ensure CA has proper structure
mkdir -p ca/base
mkdir -p ca/extensions
touch ca/extensions/.gitkeep

# Create CA README if missing
if [ ! -f ca/base/README.md ]; then
  echo "# Consulting Agent (CA)" > ca/base/README.md
  echo "" >> ca/base/README.md
  echo "Consulting Agent base components. Development planned for February 2026." >> ca/base/README.md
  echo "" >> ca/base/README.md
  echo "See CA_Agent_Roadmap_and_Starter.md in /docs/ for development plan." >> ca/base/README.md
fi

# Ensure agent-template has proper structure
mkdir -p agent-template/base
mkdir -p agent-template/extensions
touch agent-template/extensions/.gitkeep

# Create agent-template README if missing
if [ ! -f agent-template/base/README.md ]; then
  echo "# Agent Template" > agent-template/base/README.md
  echo "" >> agent-template/base/README.md
  echo "Template structure for creating new agents on the platform." >> agent-template/base/README.md
  echo "" >> agent-template/base/README.md
  echo "Copy this directory structure when creating a new agent." >> agent-template/base/README.md
fi
```

**Verification:**
- Both directories have base/ and extensions/ subdirectories
- README.md exists in each base/ directory
- .gitkeep exists in each extensions/ directory

### PHASE 8: Final Verification

Run this verification script:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5

echo "=== PLATFORM CONFIG ==="
ls -la platform/config/

echo "=== EAP-CORE STRUCTURE ==="
find platform/eap-core -type f | head -20

echo "=== SECURITY STRUCTURE ==="
find platform/security -type f

echo "=== MPA STRUCTURE ==="
find agents/mpa/base -type d | sort

echo "=== MPA SCHEMA ==="
ls -la agents/mpa/base/schema/tables/ | head -10
ls -la agents/mpa/base/schema/flows/ | head -10

echo "=== MPA SEED_DATA ==="
ls -la agents/mpa/base/seed_data/

echo "=== CA STRUCTURE ==="
find agents/ca -type f

echo "=== AGENT-TEMPLATE STRUCTURE ==="
find agents/agent-template -type f

echo "=== DOCS ==="
ls -la docs/
```

**Expected Output Checklist:**
- [ ] `platform/config/` has 4+ files including security_roles.template.json
- [ ] `platform/eap-core/base/schema/tables/` has 5 EAP table JSONs
- [ ] `platform/eap-core/base/schema/flows/` has eap_initialize_session.json
- [ ] `platform/eap-core/base/interfaces/` has 4 contract files
- [ ] `platform/security/base/.gitkeep` exists
- [ ] `platform/security/extensions/.gitkeep` exists
- [ ] `agents/mpa/base/schema/tables/` has MPA table schemas
- [ ] `agents/mpa/base/schema/flows/` has 12 flow definitions
- [ ] `agents/mpa/base/seed_data/` has seed data files
- [ ] `agents/mpa/base/kb/` has 22 KB files (unchanged)
- [ ] `agents/ca/base/README.md` exists
- [ ] `agents/ca/extensions/.gitkeep` exists
- [ ] `agents/agent-template/base/README.md` exists
- [ ] `docs/` has 4 documentation files

### PHASE 9: Git Commit

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Stage all changes
git add -A

# Review changes
git status

# Commit with descriptive message
git commit -m "PLATFORM-BASE: Restructure repository to agreed folder structure

- Move EAP flows to /schema/flows/
- Move MPA table schemas to /schema/tables/
- Move MPA flow definitions to /schema/flows/
- Rename /data/seed/ to /seed_data/
- Add security_roles.template.json
- Add .gitkeep files to security directories
- Ensure CA and agent-template have proper structure

This restructure aligns with the agreed base/extensions pattern
documented in BRANCHING_AND_EXTENSION_GUIDE.md"

# Push to deploy/personal
git push origin deploy/personal
```

### PHASE 10: Merge to Main

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Checkout main
git checkout main

# Merge from deploy/personal
git merge deploy/personal -m "Merge: Repository restructure to agreed folder structure"

# Push main
git push origin main

# Return to deploy/personal
git checkout deploy/personal
```

---

## PART 4: VS CODE CLAUDE EXECUTION PROMPT

Copy and paste this entire prompt to VS Code Claude to execute the restructure:

```
================================================================================
VS CODE CLAUDE: REPOSITORY RESTRUCTURE EXECUTION
================================================================================

CRITICAL CONSTRAINTS - READ AND OBEY:
1. DO NOT use memories or prior context from previous conversations
2. DO NOT deviate from this plan - execute EXACTLY as written
3. DO NOT create new files beyond what is specified
4. DO NOT modify file contents except where explicitly stated
5. DO NOT proceed to next phase until current phase is verified
6. STOP and report if any command fails

================================================================================
MISSION
================================================================================

Restructure the Kessel-Digital-Agent-Platform repository to match the agreed
folder structure. This involves:
- Creating new directories
- Moving files to correct locations
- Creating missing template files
- Removing empty directories after moves
- Committing and pushing changes

================================================================================
REPOSITORY
================================================================================

Path: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform
Branch: deploy/personal
Target after completion: merge to main

================================================================================
EXECUTE PHASES IN ORDER
================================================================================

PHASE 1: Create new directories
PHASE 2: Create security_roles.template.json
PHASE 3: Move EAP flow files
PHASE 4: Move MPA table schemas
PHASE 5: Move MPA flow definitions
PHASE 6: Move seed data
PHASE 7: Verify CA and agent-template structure
PHASE 8: Run final verification
PHASE 9: Git commit to deploy/personal
PHASE 10: Merge to main

================================================================================
PHASE 1: CREATE DIRECTORIES
================================================================================

Execute these commands:

cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5

mkdir -p platform/eap-core/base/schema/flows
touch platform/security/base/.gitkeep
touch platform/security/extensions/.gitkeep
mkdir -p agents/mpa/base/schema/tables
mkdir -p agents/mpa/base/schema/flows
mkdir -p agents/mpa/base/seed_data

VERIFY: List each new directory to confirm creation before proceeding.

================================================================================
PHASE 2: CREATE SECURITY_ROLES.TEMPLATE.JSON
================================================================================

Create file at: /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/platform/config/security_roles.template.json

Content:
{
  "_comment": "Security roles template - copy and customize for each environment",
  "_version": "5.5.0",
  "roles": [
    {
      "role_name": "MPA_User",
      "description": "Standard MPA user - can create and manage own sessions",
      "permissions": ["session:create", "session:read:own", "session:update:own", "benchmark:read", "kb:search"]
    },
    {
      "role_name": "MPA_PowerUser", 
      "description": "Power user - can view team data",
      "permissions": ["session:create", "session:read:team", "session:update:own", "benchmark:read", "kb:search", "document:generate"]
    },
    {
      "role_name": "MPA_Admin",
      "description": "Administrator - full access",
      "permissions": ["session:*", "benchmark:*", "kb:*", "document:*", "audit:read", "config:read"]
    }
  ],
  "dataverse_security_roles": {
    "MPA_User": "Basic User",
    "MPA_PowerUser": "Basic User + Custom Read", 
    "MPA_Admin": "System Administrator"
  }
}

VERIFY: File exists and is valid JSON.

================================================================================
PHASE 3: MOVE EAP FLOW FILES
================================================================================

cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5

mv platform/eap-core/base/flows/eap_initialize_session.json platform/eap-core/base/schema/flows/
rmdir platform/eap-core/base/flows

VERIFY: File exists at new location, old directory gone.

================================================================================
PHASE 4: MOVE MPA TABLE SCHEMAS
================================================================================

cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base

# First, list what exists
ls -la schema/

# Move all JSON files from schema/ root to schema/tables/
mv schema/*.json schema/tables/ 2>/dev/null || true

# Move dataverse subfolder contents
mv schema/dataverse/* schema/tables/ 2>/dev/null || true
rmdir schema/dataverse 2>/dev/null || true

# Move validation subfolder under tables
mv schema/validation schema/tables/ 2>/dev/null || true

VERIFY: All table schemas now in schema/tables/

================================================================================
PHASE 5: MOVE MPA FLOW DEFINITIONS  
================================================================================

cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base

mv flows/definitions/*.json schema/flows/
mv flows/specifications schema/flows/ 2>/dev/null || true
rmdir flows/definitions 2>/dev/null || true
rmdir flows/specifications 2>/dev/null || true
rmdir flows 2>/dev/null || true

VERIFY: 12 flow JSONs in schema/flows/, flows/ directory gone.

================================================================================
PHASE 6: MOVE SEED DATA
================================================================================

cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents/mpa/base

mv data/seed/* seed_data/ 2>/dev/null || true
rmdir data/seed 2>/dev/null || true
rmdir data 2>/dev/null || true

VERIFY: Seed files in seed_data/, data/ directory gone.

================================================================================
PHASE 7: VERIFY CA AND AGENT-TEMPLATE
================================================================================

cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5/agents

# CA structure
mkdir -p ca/base ca/extensions
touch ca/extensions/.gitkeep

# Create CA README if missing
cat > ca/base/README.md << 'EOF'
# Consulting Agent (CA)

Consulting Agent base components. Development planned for February 2026.

See CA_Agent_Roadmap_and_Starter.md in /docs/ for development plan.
EOF

# Agent-template structure  
mkdir -p agent-template/base agent-template/extensions
touch agent-template/extensions/.gitkeep

# Create agent-template README if missing
cat > agent-template/base/README.md << 'EOF'
# Agent Template

Template structure for creating new agents on the platform.

Copy this directory structure when creating a new agent.
EOF

VERIFY: Both have base/README.md and extensions/.gitkeep

================================================================================
PHASE 8: FINAL VERIFICATION
================================================================================

Run verification commands and confirm ALL checkboxes:

cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform/release/v5.5

echo "=== Verification Checklist ==="

# Check each required path exists
[ -f platform/config/security_roles.template.json ] && echo "✓ security_roles.template.json" || echo "✗ MISSING: security_roles.template.json"
[ -d platform/eap-core/base/schema/flows ] && echo "✓ eap-core schema/flows/" || echo "✗ MISSING: eap-core schema/flows/"
[ -f platform/eap-core/base/schema/flows/eap_initialize_session.json ] && echo "✓ eap_initialize_session.json moved" || echo "✗ MISSING: eap_initialize_session.json"
[ -f platform/security/base/.gitkeep ] && echo "✓ security/base/.gitkeep" || echo "✗ MISSING: security/base/.gitkeep"
[ -f platform/security/extensions/.gitkeep ] && echo "✓ security/extensions/.gitkeep" || echo "✗ MISSING: security/extensions/.gitkeep"
[ -d agents/mpa/base/schema/tables ] && echo "✓ mpa schema/tables/" || echo "✗ MISSING: mpa schema/tables/"
[ -d agents/mpa/base/schema/flows ] && echo "✓ mpa schema/flows/" || echo "✗ MISSING: mpa schema/flows/"
[ -d agents/mpa/base/seed_data ] && echo "✓ mpa seed_data/" || echo "✗ MISSING: mpa seed_data/"
[ ! -d agents/mpa/base/flows ] && echo "✓ old flows/ removed" || echo "✗ CLEANUP NEEDED: flows/ still exists"
[ ! -d agents/mpa/base/data ] && echo "✓ old data/ removed" || echo "✗ CLEANUP NEEDED: data/ still exists"
[ -f agents/ca/base/README.md ] && echo "✓ ca/base/README.md" || echo "✗ MISSING: ca/base/README.md"
[ -f agents/agent-template/base/README.md ] && echo "✓ agent-template/base/README.md" || echo "✗ MISSING: agent-template README"

DO NOT PROCEED if any items show ✗

================================================================================
PHASE 9: GIT COMMIT
================================================================================

cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

git add -A
git status

# Review the status output - should show moves and new files

git commit -m "PLATFORM-BASE: Restructure repository to agreed folder structure

- Move EAP flows to /schema/flows/
- Move MPA table schemas to /schema/tables/
- Move MPA flow definitions to /schema/flows/
- Rename /data/seed/ to /seed_data/
- Add security_roles.template.json
- Add .gitkeep files to security directories
- Ensure CA and agent-template have proper structure"

git push origin deploy/personal

================================================================================
PHASE 10: MERGE TO MAIN
================================================================================

git checkout main
git merge deploy/personal -m "Merge: Repository restructure to agreed folder structure"
git push origin main
git checkout deploy/personal

================================================================================
COMPLETION REPORT
================================================================================

After all phases complete, output a summary:

1. List of directories created
2. List of files moved
3. List of files created
4. Git commit hash
5. Confirmation both branches pushed

================================================================================
END OF PROMPT
================================================================================
```

---

## PART 5: ROLLBACK PROCEDURE

If something goes wrong, use this to restore:

```bash
cd /Users/kevinbauer/Kessel-Digital/Kessel-Digital-Agent-Platform

# Option 1: Reset to last commit (loses all uncommitted changes)
git reset --hard HEAD

# Option 2: Reset to specific commit before restructure
git log --oneline -10  # Find the commit hash before changes
git reset --hard <commit-hash>

# Option 3: If already pushed, revert the commit
git revert HEAD
git push origin deploy/personal
```

---

## PART 6: POST-RESTRUCTURE TASKS

After successful restructure:

1. [ ] Update any scripts that reference old paths
2. [ ] Update documentation if paths are mentioned
3. [ ] Test that VS Code Claude prompts still work
4. [ ] Verify deployment scripts reference correct paths
5. [ ] Update CONTINUATION_PROMPT.md if it references old structure

---

## REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-06 | Web Claude | Initial plan creation |
