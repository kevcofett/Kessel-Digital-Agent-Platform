# Branching and Extension Guide

## Overview

This guide documents the Git workflow and extension patterns for the Agent Platform. It ensures consistent practices across Personal and Corporate environments while enabling environment-specific customizations.

## Branch Structure

```
main                    ← Canonical source of truth
├── deploy/personal     ← Personal environment (Kessel-Digital)
└── deploy/corporate    ← Corporate environment (Mastercard)
```

### Branch Purposes

| Branch | Owner | Purpose | Merge From | Merge To |
|--------|-------|---------|------------|----------|
| main | All | Source of truth for /base/ components | Cherry-picks from deploy branches | Never |
| deploy/personal | Kessel-Digital | Personal environment deployment | main | Cherry-picks to main |
| deploy/corporate | Mastercard | Corporate environment deployment | main | Cherry-picks to main |

## The Base/Extensions Pattern

### Rule 1: /base/ = Shared, Bi-directional

```
/release/v5.5/
├── /platform/
│   └── /eap-core/
│       ├── /base/          ← Changes here can flow both directions
│       └── /extensions/    ← Changes here stay in branch
```

- Contains core functionality used by ALL environments
- Changes can be cherry-picked to main
- Other branches merge from main to receive changes
- Must maintain cross-environment compatibility

### Rule 2: /extensions/ = Branch-Specific

- Empty in main branch (only .gitkeep files)
- Each deploy branch adds its own extensions
- NEVER cherry-picked or merged to main
- Extensions augment but never override base

### Rule 3: Extensions Augment, Never Override

```
CORRECT:
/extensions/access_control/     ← New capability added via feature flag

INCORRECT:
Modifying /base/schema/eap_session.json in extensions
```

If /base/ needs modification to support an extension:
1. Make the change in /base/
2. Cherry-pick to main
3. Extension uses the updated base

## Commit Message Convention

```
{SCOPE}-{TYPE}: {Description}

SCOPE: MPA, CA, EAP, PLATFORM, CONFIG, DOCS
TYPE: BASE (cherry-pick to main), CORP (corporate only), PERS (personal only)
```

### Examples

```bash
# Base component change - cherry-pick to main
git commit -m "EAP-BASE: Add data source interface contract"

# Corporate extension - stays in branch
git commit -m "EAP-CORP: Add Confluence data source connector"

# Personal extension - stays in branch
git commit -m "MPA-PERS: Add experimental web search fallback"

# Platform-wide change - cherry-pick to main
git commit -m "PLATFORM-BASE: Update deployment guide"

# Configuration change
git commit -m "CONFIG-CORP: Update environment.json for Mastercard tenant"
```

## Workflow: Improving Base Components

When you improve a shared component in any branch:

```bash
# 1. Make change on your deploy branch
git checkout deploy/corporate
# ... make changes to /base/ files ...
git commit -m "MPA-BASE: Fix benchmark query performance"
git push origin deploy/corporate

# 2. Cherry-pick to main
git checkout main
git cherry-pick <commit-hash>
git push origin main

# 3. Other branches merge from main
git checkout deploy/personal
git merge main
git push origin deploy/personal
```

## Workflow: Adding Corporate Extensions

When adding corporate-specific functionality:

```bash
# 1. Ensure you're on corporate branch
git checkout deploy/corporate

# 2. Create extension files in /extensions/ folders
mkdir -p release/v5.5/platform/eap-core/extensions/data_sources
# ... create files ...

# 3. Commit with CORP prefix
git commit -m "EAP-CORP: Add SharePoint search data source adapter"
git push origin deploy/corporate

# 4. This commit NEVER goes to main or personal
```

## Workflow: Initial Corporate Setup

When setting up corporate environment from scratch:

```bash
# 1. Fork or clone to corporate repository
git clone https://github.com/kevcofett/Kessel-Digital-Agent-Platform.git
cd Kessel-Digital-Agent-Platform

# 2. Create corporate branch from main
git checkout main
git checkout -b deploy/corporate

# 3. Update environment configuration
cp release/v5.5/platform/config/environment.template.json \
   release/v5.5/platform/config/environment.json
# Edit environment.json with corporate values

# 4. Add corporate extensions
mkdir -p release/v5.5/platform/eap-core/extensions/access_control
mkdir -p release/v5.5/platform/eap-core/extensions/data_sources
mkdir -p release/v5.5/platform/eap-core/extensions/audit
# ... create extension files ...

# 5. Commit and push
git add -A
git commit -m "CONFIG-CORP: Initial corporate environment setup"
git push origin deploy/corporate
```

## Handling Merge Conflicts

### Conflicts in /base/ folders

```bash
# These should be resolved carefully - both sides may have valid changes
git checkout deploy/corporate
git merge main
# If conflicts in /base/:
# 1. Review both changes
# 2. Keep the best version or merge carefully
# 3. Test thoroughly
git add .
git commit -m "PLATFORM-BASE: Merge main, resolve conflicts in eap_session schema"
```

### Conflicts in /extensions/ folders

```
These should NOT happen - extensions are branch-specific.
If they occur, something is wrong with the workflow.
```

## Extension Categories

### Corporate Extensions Typically Include

| Category | Location | Examples |
|----------|----------|----------|
| Access Control | /eap-core/extensions/access_control/ | BU/Dept/Team tables |
| Data Sources | /eap-core/extensions/data_sources/ | Confluence, SharePoint adapters |
| Audit | /eap-core/extensions/audit/ | Enhanced logging, compliance |
| Teams Integration | /eap-core/extensions/teams/ | Teams-specific flows |

### Personal Extensions Typically Include

| Category | Location | Examples |
|----------|----------|----------|
| Experimental Features | /agents/mpa/extensions/ | Beta capabilities |
| Development Tools | /platform/extensions/ | Debug utilities |

## Feature Flag Integration

Extensions MUST be controlled by feature flags:

```json
// In eap_featureflag table
{
  "eap_flagcode": "int_enable_confluence_search",
  "eap_isenabled": true,  // Corporate only
  "eap_agentcode": null,  // Platform-wide
  "eap_fallbackmessage": "Confluence search is not available."
}
```

Extensions check their flag before executing:

```
IF check_feature_flag("int_enable_confluence_search"):
    // Extension code runs
ELSE:
    // Graceful fallback
```

## Testing Extensions

Before merging to main or deploying:

1. **Unit Test**: Extension works in isolation
2. **Integration Test**: Extension works with base components
3. **Fallback Test**: System works when extension disabled
4. **Cross-Environment Test**: Change to /base/ doesn't break other environments

## Common Mistakes to Avoid

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Putting corporate code in /base/ | Breaks personal environment | Use /extensions/ |
| Cherry-picking /extensions/ to main | Pollutes source of truth | Extensions stay in branch |
| Modifying /base/ without cherry-pick | Creates drift between environments | Always cherry-pick to main |
| Hardcoding corporate URLs in /base/ | Breaks portability | Use environment.json |
| Forgetting feature flag for extension | No graceful degradation | Always add flag first |

## Review Checklist

Before committing changes:

- [ ] Is this a base or extension change?
- [ ] Am I using the correct commit message prefix?
- [ ] If base change, will I cherry-pick to main?
- [ ] If extension, did I add a feature flag?
- [ ] Did I test with the feature disabled?
- [ ] Did I update relevant documentation?
